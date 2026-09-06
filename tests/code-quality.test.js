// Phase 7: compare the refactor with its immutable Git baseline, without checkout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const sharp = require('sharp');
const {createStaticServer} = require('./helpers');

const root = path.resolve(__dirname, '..');
const output = path.resolve(root, process.env.TEST_OUTPUT_DIR || 'docs/phase-7/quality');
const BASELINE = '5315494';
const PAGES = ['index', 'live', 'report', 'portfolio', 'methodology'];
const SIZES = [[1440, 900], [1024, 768], [768, 1024], [390, 844]];
const results = [];
const integrity = [];
const pixelComparisons = [];
const errors = [];
const cache = new Map();
const server = createStaticServer(root);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function before(file){
  if(!cache.has(file)) cache.set(file, execFileSync('git', ['show', `${BASELINE}:${file}`], {cwd: root, maxBuffer: 20e6}));
  return cache.get(file);
}

function check(name, condition){
  results.push({name, passed: Boolean(condition)});
  assert.ok(condition, name);
}

async function run(){
  fs.mkdirSync(output, {recursive: true});
  const protectedFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', BASELINE, '--',
    'assets/js/data.js', 'assets/js/app.js', 'assets/js/live-adapter.js',
    'assets/js/finance-3d-background.js', 'assets/css/styles.css', 'assets/img', 'assets/video', 'downloads'
  ], {cwd: root, encoding: 'utf8'}).trim().split(/\r?\n/);
  for(const file of protectedFiles){
    const previous = hash(before(file));
    const current = hash(fs.readFileSync(path.join(root, file)));
    integrity.push({file, previous, current});
    check(`${file}: SHA-256 unchanged`, previous === current);
  }
  for(const name of PAGES){
    const file = `${name}.html`;
    const normalize = text => text.replaceAll(/\?v=3\.[67]\.0/g, '?v=ASSET_VERSION').replaceAll('\r\n', '\n');
    check(`${file}: only asset version changed`, normalize(before(file).toString()) === normalize(fs.readFileSync(path.join(root, file), 'utf8')));
  }
  fs.writeFileSync(path.join(output, 'integrity.json'), JSON.stringify({baseline: BASELINE, files: integrity}, null, 2) + '\n');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
    async function capture(name, width, height, baseline){
      const context = await browser.newContext({viewport: {width, height}, reducedMotion: 'reduce'});
      try{
        await context.route('**/*', route => {
          const url = new URL(route.request().url());
          if(url.origin !== base) return route.abort();
          if(baseline && /\.(html|css|js)$/.test(url.pathname)) return route.fulfill({
            contentType: url.pathname.endsWith('.html') ? 'text/html' : url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript',
            body: before(decodeURIComponent(url.pathname.slice(1)))
          });
          return route.continue();
        });
        await context.addInitScript(() => {
          // Freeze only the test environment's clock and decorative random seed.
          const NativeDate = Date;
          const fixedTime = new NativeDate('2026-09-06T12:00:00+03:00').valueOf();
          window.Date = class extends NativeDate {
            constructor(...args){ super(...(args.length ? args : [fixedTime])); }
            static now(){ return fixedTime; }
          };
          let seed = 42;
          Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
        });
        const page = await context.newPage();
        page.on('pageerror', error => errors.push({name, width, baseline, message: error.message}));
        await page.goto(`${base}/${name}.html`);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(220);
        const snapshot = await page.locator('body *').evaluateAll(elements => elements.filter(el => !['SCRIPT', 'SOURCE'].includes(el.tagName)).map(el => {
          const box = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const properties = ['display', 'position', 'color', 'backgroundColor', 'backgroundImage', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'borderRadius', 'borderColor', 'opacity', 'transform', 'outline', 'outlineOffset'];
          return {tag: el.tagName, class: el.className?.baseVal ?? el.className,
            rect: [box.x, box.y, box.width, box.height],
            styles: properties.map(key => style[key])};
        }));
        const label = `${name}-${width}-${baseline ? 'before' : 'after'}`;
        const screenshot = await page.screenshot({path: path.join(output, `${label}.png`)});
        const pixels = await sharp(screenshot).raw().toBuffer();
        return {snapshot: hash(JSON.stringify(snapshot)), pixels};
      }finally{
        await context.close();
      }
    }
    for(const [width, height] of SIZES){
      for(const name of PAGES){
        const previous = await capture(name, width, height, true);
        const current = await capture(name, width, height, false);
        check(`${name} ${width}: all element geometry and sampled styles unchanged`, previous.snapshot === current.snapshot);
        // Fractional sticky borders can rasterize a few endpoint pixels differently.
        // Keep the exact DOM/style check above and record the actual pixel count.
        const channels = current.pixels.length / (width * height);
        let changedPixels = 0;
        for(let offset = 0; offset < current.pixels.length; offset += channels){
          if(!previous.pixels.subarray(offset, offset + channels).equals(current.pixels.subarray(offset, offset + channels))) changedPixels++;
        }
        const fraction = changedPixels / (width * height);
        pixelComparisons.push({name, width, height, changedPixels, fraction});
        check(`${name} ${width}: viewport pixel difference <= 0.01%`, fraction <= 0.0001);
      }
      const cellWidth = width === 390 ? 195 : 288;
      const cellHeight = Math.round(height * cellWidth / width);
      const composites = [];
      for(const [index, name] of PAGES.entries()){
        for(const [row, stage] of ['before', 'after'].entries()){
          const input = await sharp(path.join(output, `${name}-${width}-${stage}.png`)).resize(cellWidth, cellHeight).toBuffer();
          composites.push({input, left: index * cellWidth, top: 24 + row * (cellHeight + 24)});
          const caption = Buffer.from(`<svg width="${cellWidth}" height="24"><text x="8" y="17" fill="white" font-family="Segoe UI" font-size="13">${name} / ${stage} / ${width}</text></svg>`);
          composites.push({input: caption, left: index * cellWidth, top: row * (cellHeight + 24)});
        }
      }
      await sharp({create: {width: 5 * cellWidth, height: 2 * (cellHeight + 24), channels: 3, background: '#090d0b'}})
        .composite(composites).jpeg({quality: 85}).toFile(path.join(output, `comparison-${width}.jpg`));
    }
    check('no JavaScript runtime errors in either version', errors.length === 0);
  }finally{
    fs.writeFileSync(path.join(output, 'quality-results.json'), JSON.stringify({baseline: BASELINE, checks: results.length, results, errors, pixelComparisons,
      method: 'Local headless Edge; reduced motion; fixed test clock and decorative seed; third-party network blocked. Exact SHA-256 equality for all element rectangles/selected computed styles; at most 0.01% differing viewport pixels for fractional-border rasterization, actual counts recorded and screenshots retained for review. Not a moving-video, real-device or provider-price comparison.'}, null, 2) + '\n');
    if(browser) await browser.close();
    server.close();
  }
  console.log(`${results.length} quality/equivalence checks passed: ${output}`);
}

run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
