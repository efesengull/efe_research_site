// Phase 4 qualification: existing Canvas 2D, static fallbacks and bounded local cost.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, process.env.TEST_OUTPUT_DIR || 'docs/phase-4');
const pages = ['index', 'live', 'report', 'portfolio', 'methodology'];
const results = [];
const samples = [];
const errors = [];
function check(name, condition){
  assert.ok(condition, name);
  results.push(name);
}
const types = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webm': 'video/webm'};
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if(!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
async function run(){
  fs.mkdirSync(output, {recursive: true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
  async function setup(options = {}, fallback = ''){
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 3, ...options});
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      const blockedMedia = fallback && (url.pathname.endsWith('.webm') || (fallback === 'all-media' && url.pathname.endsWith('.webp')));
      return url.origin !== base || blockedMedia ? route.abort() : route.continue();
    });
    await context.addInitScript(mode => {
      window.depthEvidence = {draws: 0, commands: 0, contexts: [], callbacks: []};
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(kind, ...args){
        depthEvidence.contexts.push(kind);
        if(mode && kind === '2d') return null;
        return getContext.call(this, kind, ...args);
      };
      const clear = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function(...args){
        depthEvidence.draws++;
        return clear.apply(this, args);
      };
      for(const name of ['stroke', 'fill']){
        const original = CanvasRenderingContext2D.prototype[name];
        CanvasRenderingContext2D.prototype[name] = function(...args){
          depthEvidence.commands++;
          return original.apply(this, args);
        };
      }
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = callback => raf.call(window, timestamp => {
        const draws = depthEvidence.draws;
        const commands = depthEvidence.commands;
        const start = performance.now();
        callback(timestamp);
        if(depthEvidence.draws > draws){
          depthEvidence.callbacks.push({ms: performance.now() - start, commands: depthEvidence.commands - commands});
        }
      });
    }, fallback);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push({url: page.url(), message: error.message}));
    return {context, page};
  }
  try{
    for(const mobile of [false, true]){
      const {context, page} = await setup(mobile ? {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true} : {});
      for(const name of pages){
        await page.goto(`${base}/${name}.html`);
        await page.waitForTimeout(1000);
        await page.evaluate(() => { depthEvidence.callbacks = []; });
        await page.waitForTimeout(1200);
        const sample = await page.evaluate(() => {
          const canvas = document.querySelector('.finance-bg-canvas');
          const rect = canvas.getBoundingClientRect();
          const frames = depthEvidence.callbacks;
          const times = frames.map(frame => frame.ms).sort((a, b) => a - b);
          return {
            cssWidth: rect.width, cssHeight: rect.height, width: canvas.width, height: canvas.height,
            dpr: canvas.width / rect.width, frameCount: frames.length,
            medianMs: times[Math.floor(times.length / 2)], p95Ms: times[Math.floor(times.length * .95)],
            meanCommands: frames.reduce((sum, frame) => sum + frame.commands, 0) / frames.length,
            contexts: depthEvidence.contexts, ariaHidden: canvas.getAttribute('aria-hidden'),
            videoPaused: document.querySelector('video').paused
          };
        });
        samples.push({page: name, mobile, ...sample});
        check(`${name}/${mobile ? 'mobile' : 'desktop'}: bounded 2D backing buffer and decorative semantics`, sample.dpr <= 1.805 && sample.contexts.every(kind => kind === '2d') && sample.ariaHidden === 'true');
        check(`${name}/${mobile ? 'mobile' : 'desktop'}: active Canvas sampled`, sample.frameCount > 0);
        if(mobile) check(`${name}: mobile video paused`, sample.videoPaused);
        if(name === 'index') await page.screenshot({path: path.join(output, mobile ? 'mobile.png' : 'desktop.png'), scale: 'css'});
        await page.locator('.motion-toggle').click();
        await page.waitForTimeout(100);
        const draws = await page.evaluate(() => depthEvidence.draws);
        await page.waitForTimeout(250);
        check(`${name}/${mobile ? 'mobile' : 'desktop'}: user pause stops continuous drawing`, await page.evaluate(count => depthEvidence.draws === count && document.querySelector('video').paused, draws));
      }
      await context.close();
    }
    for(const name of pages){
      const desktop = samples.find(sample => sample.page === name && !sample.mobile);
      const mobile = samples.find(sample => sample.page === name && sample.mobile);
      check(`${name}: compact scene submits fewer drawing commands`, mobile.meanCommands < desktop.meanCommands);
    }
    for(const mode of ['canvas-video', 'all-media']){
      const {context, page} = await setup({}, mode);
      for(const name of pages){
        await page.goto(`${base}/${name}.html`);
        await page.waitForTimeout(500);
        check(`${name}/${mode}: unavailable Canvas removed and heading readable`, await page.locator('.finance-bg-canvas').count() === 0 && await page.locator('h1').isVisible());
        check(`${name}/${mode}: CSS background and navigation retained`, await page.locator('.hero').evaluate(el => getComputedStyle(el, '::before').backgroundImage.includes('gradient') && !['transparent', 'rgba(0, 0, 0, 0)'].includes(getComputedStyle(el).backgroundColor)) && await page.locator('.links a').first().isVisible());
        if(mode === 'canvas-video'){
          check(`${name}: poster resource loads`, await page.locator('video').evaluate(video => new Promise(resolve => {
            const image = new Image();
            image.onload = () => resolve(image.naturalWidth > 0);
            image.onerror = () => resolve(false);
            image.src = video.poster;
          })));
        }
        if(name === 'index') await page.screenshot({path: path.join(output, `${mode}.png`), scale: 'css'});
      }
      await context.close();
    }
    const reduced = await setup({reducedMotion: 'reduce'});
    for(const name of pages){
      await reduced.page.goto(`${base}/${name}.html`);
      await reduced.page.waitForTimeout(400);
      const draws = await reduced.page.evaluate(() => depthEvidence.draws);
      await reduced.page.waitForTimeout(250);
      check(`${name}: reduced-motion uses static Canvas and paused video`, await reduced.page.evaluate(count => depthEvidence.draws === count && document.querySelector('video').paused, draws));
    }
    await reduced.context.close();
    const noJs = await setup({javaScriptEnabled: false});
    await noJs.page.goto(`${base}/index.html`);
    check('JavaScript disabled: all four story steps and navigation remain', await noJs.page.locator('[data-story-step]').count() === 4 && await noJs.page.locator('h1').isVisible() && await noJs.page.locator('.links a').first().isVisible());
    await noJs.page.screenshot({path: path.join(output, 'no-js.png'), scale: 'css'});
    await noJs.context.close();
    check('no JavaScript runtime errors across qualification scenarios', errors.length === 0);
    fs.writeFileSync(path.join(output, 'depth-results.json'), JSON.stringify({passed: results.length, results, samples, errors, method: 'Headless Edge; DPR 3; 1s warmup + 1.2s sample. Instrumented rAF callback CPU submission time including update/draw; not GPU, FPS, battery, CWV or real-device measurements. Random scene seeds affect command counts.'}, null, 2) + '\n');
    console.log(`${results.length} depth/fallback checks passed. Evidence: ${output}`);
  }finally{
    await browser.close();
    server.close();
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
