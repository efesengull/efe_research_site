// Browser checks require Playwright and an installed Edge (or BROWSER_CHANNEL).
// No package or build step is required to run the website itself.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, process.env.TEST_OUTPUT_DIR || 'docs/phase-3/regression');
fs.mkdirSync(output, {recursive: true});
const pages = ['index', 'live', 'report', 'portfolio', 'methodology'];
const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844]];
const results = [];
function check(name, condition){
  assert.ok(condition, name);
  results.push(name);
}
const types = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webm': 'video/webm'};
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if(!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()){
    res.writeHead(404).end();
    return;
  }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

async function run(){
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
  const context = await browser.newContext();
  // Third-party availability is deliberately separate from local regression checks.
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try{
    for(const name of pages){
      for(const [width, height] of sizes){
        await page.setViewportSize({width, height});
        await page.goto(`${base}/${name}.html`);
        await page.waitForTimeout(120);
        check(`${name} ${width}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        check(`${name} ${width}: local images loaded`, await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)));
        check(`${name} ${width}: navigation available`, await page.locator('.nav a[href="report.html"]').count() === 1);
        if(name === 'index'){
          check(`story ${width}: expected layout`, await page.locator('.os-story').evaluate((el, pinned) => el.classList.contains('is-pinned') === pinned, width >= 1000));
          if(width < 1000){
            check(`story ${width}: four full evidence panels`, await page.locator('.os-story-step>[data-story-evidence]').evaluateAll(items => items.length === 4 && items.every(el => el.getBoundingClientRect().height > 100)));
          }
        }
        await page.screenshot({path: path.join(output, `${name}-${width}.png`)});
      }
    }

    await page.setViewportSize({width: 1440, height: 900});
    await page.goto(`${base}/index.html`);
    await page.addStyleTag({content: 'html{scroll-behavior:auto!important}'});
    await page.waitForFunction(() => document.querySelector('.os-story').classList.contains('is-pinned'));
    const originalValues = await page.locator('.os-story-steps [data-story-value]').allTextContents();
    // Verify HTML-only fallback against data.js output, so a future snapshot change is caught.
    const noJsContext = await browser.newContext({javaScriptEnabled: false, viewport: {width: 1440, height: 900}});
    const noJs = await noJsContext.newPage();
    await noJs.goto(`${base}/index.html`);
    assert.deepEqual(await noJs.locator('.os-story-steps [data-story-value]').allTextContents(), originalValues);
    check('HTML fallback matches data.js exactly', true);
    check('without JS: all four evidence panels visible', await noJs.locator('[data-story-step]>[data-story-evidence]').evaluateAll(items => items.every(el => el.getBoundingClientRect().height > 100)));
    await noJs.locator('#story-valuation').scrollIntoViewIfNeeded();
    await noJs.screenshot({path: path.join(output, 'no-js.png')});
    await noJsContext.close();

    for(const index of [0, 1, 2, 3, 2, 1, 0, 3, 0]){
      await page.locator('[data-story-step]').nth(index).evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.3));
      await page.waitForFunction(expected => document.querySelector('.os-story').dataset.storyActive === String(expected + 1), index);
      const data = await page.locator('.os-story').evaluate(el => {
        const board = el.querySelector('.os-story-board');
        const rect = board.getBoundingClientRect();
        const current = el.querySelector('[data-story-step].is-current');
        return {
          copy: el.querySelector('[data-story-layer] [data-story-evidence]').textContent,
          original: current.querySelector('[data-story-evidence]').textContent,
          top: rect.top, bottom: rect.bottom,
          stickyTop: parseFloat(getComputedStyle(board).top),
          markers: el.querySelectorAll('.os-story-track [aria-current="step"]').length
        };
      });
      check(`stage ${index + 1}: visual layer agrees with article`, data.copy === data.original && data.markers === 1);
      if(index > 0 && index < 3) check(`stage ${index + 1}: pinned within viewport`, Math.abs(data.top - data.stickyTop) < 2 && data.bottom <= 900);
      await page.waitForTimeout(420);
      await page.screenshot({path: path.join(output, `stage-${index + 1}.png`)});
    }
    // Browser find / direct anchors / restored positions must resolve the same layer.
    await page.goto(`${base}/index.html#story-risk`);
    await page.waitForFunction(() => document.querySelector('.os-story').dataset.storyActive === '3');
    check('direct risk anchor selects stage 3', true);
    await page.reload();
    await page.waitForFunction(() => document.querySelector('.os-story').dataset.storyActive === '3');
    check('reload restores stage 3', true);
    await page.locator('#story-decision .text-link').focus();
    await page.waitForFunction(() => document.querySelector('.os-story').dataset.storyActive === '4');
    check('keyboard focus follows natural scroll without being moved', await page.evaluate(() => document.activeElement.matches('#story-decision .text-link') && getComputedStyle(document.activeElement).outlineStyle !== 'none'));

    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.waitForFunction(() => !document.querySelector('.os-story').classList.contains('is-pinned'));
    check('reduced motion: all stages static', await page.locator('[data-story-step]>[data-story-evidence]').evaluateAll(items => items.every(el => el.getBoundingClientRect().height > 100 && getComputedStyle(el).animationName === 'none')));
    check('reduced motion: hero video paused', await page.locator('.hero-video').evaluate(el => el.paused));
    await page.locator('#story-risk').scrollIntoViewIfNeeded();
    await page.screenshot({path: path.join(output, 'reduced-motion.png')});
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.waitForFunction(() => document.querySelector('.os-story').classList.contains('is-pinned'));
    check('motion preference can return to pinned mode', true);
    await page.setViewportSize({width: 1440, height: 650});
    await page.waitForFunction(() => !document.querySelector('.os-story').classList.contains('is-pinned'));
    check('short viewport uses static layout', true);
    await page.setViewportSize({width: 1024, height: 768});
    await page.addStyleTag({content: 'html{font-size:24px!important}'});
    await page.waitForFunction(() => !document.querySelector('.os-story').classList.contains('is-pinned'));
    check('enlarged text that cannot fit uses static layout', true);

    await page.setViewportSize({width: 1440, height: 900});
    await page.goto(`${base}/index.html`);
    await page.keyboard.press('/');
    await page.locator('#research-search-input').fill('GARAN');
    check('global search finds GARAN', await page.locator('.command-result').first().innerText().then(text => text.includes('GARAN')));
    await page.keyboard.press('Escape');
    // Chromium may consume the first Escape to clear a nonempty search field.
    if(await page.locator('#research-search').evaluate(el => el.open)) await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('research-search').open);
    await page.locator('[data-filter="Bankacılık"]').click();
    check('sector filtering retains four bank rows', await page.locator('#stock-table tr').count() === 4);
    await page.locator('[data-filter="all"]').click();
    check('all stock rows restored', await page.locator('#stock-table tr').count() === 10);
    const storySnapshot = await page.locator('.os-story-steps').innerText();
    check('story has no live or model simulator update hooks', await page.locator('.os-story [data-live-symbol], .os-story [data-model-amount]').count() === 0);
    check('hero video pauses beyond hero', await page.locator('.hero-video').evaluate(el => el.paused));

    await page.addInitScript(() => { window.EFE_RESEARCH_LIVE_CONFIG = {endpoint: '/api/quotes', provider: 'test'}; });
    await page.route('**/api/quotes?*', route => route.fulfill({status: 503, body: 'Unavailable'}));
    await page.reload();
    await page.waitForTimeout(250);
    check('failed live endpoint preserves narrative snapshot', await page.locator('.os-story-steps').innerText() === storySnapshot);
    check('failed live endpoint preserves GARAN price', (await page.locator('[data-live-symbol="GARAN"][data-live-field="market-price"]').first().innerText()).includes('131,40'));

    await page.goto(`${base}/portfolio.html`);
    await page.locator('[data-capital="250000"]').click();
    check('portfolio simulator retains GARAN 8% allocation', (await page.locator('[data-model-amount][data-live-symbol="GARAN"]').allTextContents()).every(text => text.includes('20.000')));
    check('portfolio base scenario recalculates', (await page.locator('[data-scenario-net="21.4"]').innerText()).includes('303.500'));
    await page.setViewportSize({width: 390, height: 844});
    await page.locator('.nav-toggle').click();
    check('mobile navigation opens', await page.locator('.nav-toggle').getAttribute('aria-expanded') === 'true');
    await page.keyboard.press('Escape');
    check('mobile navigation closes', await page.locator('.nav-toggle').getAttribute('aria-expanded') === 'false');

    for(const name of pages){
      await page.goto(`${base}/${name}.html`);
      const links = await page.locator('[href], [src]').evaluateAll(elements => elements.map(el => el.getAttribute('href') || el.getAttribute('src')).filter(url => url && !/^(https?:|data:|mailto:)/.test(url)));
      for(const link of links){
        const url = new URL(link, `${base}/${name}.html`);
        const file = path.join(root, decodeURIComponent(url.pathname));
        assert.ok(fs.existsSync(file), `${name}: ${link}`);
        if(url.hash && path.extname(file) === '.html') assert.ok(fs.readFileSync(file, 'utf8').includes(`id="${url.hash.slice(1)}"`), `${name}: ${link}`);
      }
      check(`${name}: local assets, downloads and anchor targets exist`, true);
      check(`${name}: asset versions consistent`, (await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(elements => elements.map(el => el.getAttribute('src') || el.getAttribute('href')))).filter(url => url.startsWith('assets/')).every(url => url.endsWith('?v=3.5.0')));
    }
    const hashes = JSON.parse(fs.readFileSync(path.join(root, 'docs/phase-3/baseline-hashes.json'), 'utf8').replace(/^\uFEFF/, ''));
    for(const [file, hash] of Object.entries(hashes)) assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex'), hash, file);
    check('data.js, app.js, live adapter and downloads SHA-256 unchanged', true);
    check('no JavaScript runtime errors', errors.length === 0);
    fs.writeFileSync(path.join(output, 'test-results.json'), JSON.stringify({checks: results.length, results, errors, thirdPartyNetwork: 'blocked; external TradingView availability not tested'}, null, 2));
    console.log(`${results.length} checks passed. Screenshots and results: ${output}`);
  }finally{
    await browser.close();
    server.close();
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
