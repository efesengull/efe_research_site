// Optional axe-core audit: test tools only; no site dependency or build step.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const baseline = process.env.A11Y_BASELINE === '1';
const output = path.resolve(root, process.env.TEST_OUTPUT_DIR || `docs/phase-6/axe-${baseline ? 'before' : 'after'}`);
const axePath = process.env.AXE_PATH || require.resolve('axe-core/axe.min.js');
const types = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webm': 'video/webm'};
const cache = new Map();
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + pathname);
  if(!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  if(baseline && /\.(html|css|js)$/.test(file)){
    if(!cache.has(file)) cache.set(file, execFileSync('git', ['show', `a780b8e:${path.relative(root, file).replaceAll('\\', '/')}`], {cwd: root, maxBuffer: 5e6}));
    res.end(cache.get(file));
  }else fs.createReadStream(file).pipe(res);
});
async function run(){
  fs.mkdirSync(output, {recursive: true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
  const context = await browser.newContext({reducedMotion: 'reduce'});
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const page = await context.newPage();
  const results = [];
  const contrastSamples = [];
  try{
    async function audit(name){
      const report = await page.evaluate(async () => axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice']}}));
      const compact = entries => entries.map(({id, impact, description, helpUrl, nodes}) => ({id, impact, description, helpUrl, nodes: nodes.map(({target, html, failureSummary, any}) => ({target, html, failureSummary, checks: any.map(({id, data}) => ({id, data}))}))}));
      results.push({name, violations: compact(report.violations), incomplete: compact(report.incomplete), passes: report.passes.length});
      console.log(name, report.violations.map(item => `${item.id}:${item.nodes.length}`).join(', ') || '0 violations');
      if(!baseline && !name.endsWith('-search')){
        const selectors = report.incomplete.filter(item => item.id === 'color-contrast').flatMap(item => item.nodes.map(node => node.target[0]));
        const samples = await page.evaluate(selectors => selectors.flatMap(selector => {
          const element = document.querySelector(selector);
          if(!element) return [];
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          const entries = [];
          while(walker.nextNode()){
            const node = walker.currentNode;
            if(!node.textContent.trim()) continue;
            const style = getComputedStyle(node.parentElement);
            if(style.visibility !== 'visible') continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for(const rect of range.getClientRects()){
              if(rect.width < 2 || rect.height < 2) continue;
              entries.push({selector, text: node.textContent.trim().slice(0, 100), foreground: style.color, minimum: parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700) ? 3 : 4.5, rect: {x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height}});
            }
          }
          return entries;
        }), selectors);
        // Hide glyph paint only: retain layout, media, fills, gradients and pseudo backgrounds.
        const hideText = await page.addStyleTag({content: '*,*::before,*::after{-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important}'});
        const {data, info} = await sharp(await page.screenshot({fullPage: true})).removeAlpha().raw().toBuffer({resolveWithObject: true});
        await hideText.evaluate(el => el.remove());
        const luminance = rgb => rgb.map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
        for(const sample of samples){
          const color = sample.foreground.match(/[\d.]+/g).map(Number);
          const ratios = [];
          for(const dx of [.15, .5, .85]) for(const dy of [.25, .5, .75]){
            const x = Math.floor(sample.rect.x + sample.rect.width * dx);
            const y = Math.floor(sample.rect.y + sample.rect.height * dy);
            if(x < 0 || x >= info.width || y < 0 || y >= info.height) continue;
            const pixel = (y * info.width + x) * 3;
            const bg = [...data.subarray(pixel, pixel + 3)];
            const alpha = color[3] ?? 1;
            const fg = color.slice(0, 3).map((n, i) => n * alpha + bg[i] * (1 - alpha));
            const a = luminance(fg), b = luminance(bg);
            ratios.push((Math.max(a, b) + .05) / (Math.min(a, b) + .05));
          }
          if(ratios.length) contrastSamples.push({page: name, ...sample, minimumSampledRatio: Math.min(...ratios)});
        }
      }
    }
    for(const width of [1440, 390]){
      await page.setViewportSize({width, height: width === 1440 ? 900 : 844});
      for(const name of ['index', 'live', 'report', 'portfolio', 'methodology']){
        await page.goto(`${base}/${name}.html`);
        await page.addScriptTag({path: axePath});
        await audit(`${name}-${width}`);
        if(name === 'portfolio'){
          await page.locator('#correlation-table').scrollIntoViewIfNeeded();
          await page.screenshot({path: path.join(output, `correlation-${width}.png`)});
        }
        await page.locator('.rail-search').click();
        await audit(`${name}-${width}-search`);
        if(name === 'index') await page.screenshot({path: path.join(output, `search-${width}.png`)});
      }
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({axeVersion: await page.evaluate(() => axe.version), baseline: baseline ? 'a780b8e' : null, thirdPartyNetwork: 'blocked', results}, null, 2));
    if(!baseline){
      const failures = contrastSamples.filter(sample => sample.minimumSampledRatio < sample.minimum);
      fs.writeFileSync(path.join(output, 'contrast-samples.json'), JSON.stringify({method: 'Nine background pixels per text line after hiding glyph paint; static reduced-motion local screenshot. Sampling is not an exhaustive per-pixel or moving-media contrast proof.', samples: contrastSamples, failures}, null, 2));
      console.log(`Background contrast sampling: ${contrastSamples.length} lines, ${failures.length} below threshold`);
      if(failures.length) process.exitCode = 1;
    }
    if(!baseline && results.some(item => item.violations.length)) process.exitCode = 1;
  }finally{
    await browser.close();
    server.close();
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
