// Browser behavior checks; the site itself has no build or dependency step.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/phase-3');
const results = [];
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
  const context = await browser.newContext({viewport: {width: 1440, height: 900}});
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  await context.addInitScript(() => {
    window.motionEvidence = {entries: [], draws: 0, reads: 0};
    const animate = Element.prototype.animate;
    Element.prototype.animate = function(keyframes, options){
      window.motionEvidence.entries.push({kind: this.dataset.motion, keyframes, duration: options.duration});
      return animate.call(this, keyframes, options);
    };
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function(...args){
      window.motionEvidence.draws++;
      return clear.apply(this, args);
    };
    const rect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function(){
      if(this.matches('main section, [data-story-step], .hero')) window.motionEvidence.reads++;
      return rect.call(this);
    };
    window.addEventListener('pageswap', event => sessionStorage.setItem('transitionObserved', String(Boolean(event.viewTransition))));
    window.addEventListener('pagereveal', event => {
      if(event.viewTransition) event.viewTransition.ready.then(
        () => sessionStorage.setItem('transitionReady', 'true'),
        () => sessionStorage.setItem('transitionReady', 'false')
      );
    });
  });
  const page = await context.newPage();
  let stage = 'initial';
  page.on('pageerror', error => errors.push({message: error.message, stack: error.stack, url: page.url(), stage}));
  try{
    await page.goto(`${base}/index.html`);
    await page.waitForTimeout(900);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-motion]')].every(el => el.getAnimations().length === 0));
    check('hero and chart enter once with shared 760ms token', await page.evaluate(() => ['hero', 'chart'].every(kind => motionEvidence.entries.some(entry => entry.kind === kind && entry.duration === 760))));
    check('finite entry effects settle', await page.locator('[data-motion]').evaluateAll(items => items.every(el => el.getAnimations().length === 0)));
    await page.screenshot({path: path.join(output, 'after-desktop.png')});
    const toggle = page.locator('.motion-toggle');
    await toggle.click();
    await page.waitForTimeout(100);
    const pausedDraws = await page.evaluate(() => motionEvidence.draws);
    await page.waitForTimeout(160);
    check('pause button stops canvas frames and video', await page.evaluate(draws => motionEvidence.draws === draws && document.querySelector('video').paused, pausedDraws));
    check('pause button communicates state', await toggle.getAttribute('aria-pressed') === 'true');
    await toggle.focus();
    await page.keyboard.press('Space');
    await page.waitForTimeout(150);
    check('keyboard resumes canvas', await page.evaluate(draws => motionEvidence.draws > draws, pausedDraws));
    await page.mouse.move(800, 300);
    await page.evaluate(() => { motionEvidence.reads = 0; });
    await page.mouse.move(900, 320, {steps: 8});
    check('pointer movement does not repeatedly read layout', await page.evaluate(() => motionEvidence.reads === 0));
    await page.addStyleTag({content: 'html{scroll-behavior:auto!important}'});
    await page.locator('#story-risk').evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - 280));
    await page.waitForTimeout(700);
    const offscreenDraws = await page.evaluate(() => motionEvidence.draws);
    await page.waitForTimeout(180);
    check('offscreen hero stops canvas and video', await page.evaluate(draws => motionEvidence.draws === draws && document.querySelector('video').paused, offscreenDraws));
    await page.screenshot({path: path.join(output, 'story-risk.png')});
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(180);
    check('hero entry does not replay on return', await page.evaluate(() => motionEvidence.entries.filter(entry => entry.kind === 'hero').length === 2));
    // Deterministic visibility event simulation; not an OS background-tab test.
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', {configurable: true, value: true}); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(50);
    const hiddenDraws = await page.evaluate(() => motionEvidence.draws);
    await page.waitForTimeout(160);
    check('visibility handler stops canvas and video', await page.evaluate(draws => motionEvidence.draws === draws && document.querySelector('video').paused, hiddenDraws));
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });

    stage = 'normal navigation';
    await page.locator('.links a[href="report.html"]').click();
    await page.waitForURL('**/report.html');
    check('native cross-document view transition observed', await page.evaluate(() => sessionStorage.getItem('transitionObserved') === 'true'));
    await page.waitForTimeout(850);
    check('incoming cross-document transition reaches ready', await page.evaluate(() => sessionStorage.getItem('transitionReady') === 'true'));
    await page.addStyleTag({content: 'html{scroll-behavior:auto!important}'});
    const links = page.locator('.page-tabs a');
    const count = await links.count();
    for(const index of [0, 2, count - 1, 1, 0]){
      const hash = await links.nth(index).getAttribute('href');
      await page.locator(hash).evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - 200));
      await page.waitForFunction(hash => document.querySelector('.page-tabs a[aria-current="location"]')?.hash === hash, hash);
      check(`section progress matches forward/backward jump ${index}`, await page.locator('.section-progress').innerText() === `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`);
    }
    await page.waitForTimeout(850);
    await page.evaluate(() => { motionEvidence.reads = 0; scrollBy(0, 40); });
    await page.waitForTimeout(100);
    check('section scrolling uses cached geometry', await page.evaluate(() => motionEvidence.reads === 0));
    await page.locator('#valuation').scrollIntoViewIfNeeded();
    await page.locator('.table-wrap').first().focus();
    check('table region has keyboard focus and visible outline', await page.locator('.table-wrap').first().evaluate(el => el === document.activeElement && getComputedStyle(el).outlineStyle !== 'none'));
    const header = page.locator('th.sortable').first();
    await header.focus();
    await page.keyboard.press('Enter');
    check('sorting remains keyboard operable', await header.getAttribute('aria-sort') === 'ascending');
    await page.screenshot({path: path.join(output, 'table-focus.png')});

    for(const name of ['live', 'portfolio', 'methodology']){
      await page.goto(`${base}/${name}.html`);
      await page.addStyleTag({content: 'html{scroll-behavior:auto!important}'});
      const sectionLinks = page.locator('.page-tabs a');
      const total = await sectionLinks.count();
      for(const index of [0, total - 1, 1, 0]){
        const hash = await sectionLinks.nth(index).getAttribute('href');
        await page.locator(hash).evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - 200));
        await page.waitForFunction(hash => document.querySelector('.page-tabs a[aria-current="location"]')?.hash === hash, hash, {timeout: 3000}).catch(async error => {
          throw new Error(`${name} ${hash}: ${JSON.stringify(await page.evaluate(() => ({scrollY, height: innerHeight, total: document.documentElement.scrollHeight, active: document.querySelector('.page-tabs a[aria-current]')?.hash, sections: [...document.querySelectorAll('.page-tabs a')].map(a => [a.hash, document.querySelector(a.hash).getBoundingClientRect().top])})))}`, {cause: error});
        });
        check(`${name}: progress follows section ${index + 1}`, await page.locator('.page-tabs a[aria-current]').count() === 1);
      }
    }

    stage = 'reduced motion';
    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto(`${base}/index.html`);
    await page.waitForTimeout(250);
    check('reduced motion creates no entry animations', await page.evaluate(() => motionEvidence.entries.length === 0));
    check('reduced motion disables pin and autoplay', await page.evaluate(() => !document.querySelector('.os-story').classList.contains('is-pinned') && document.querySelector('video').paused));
    check('reduced motion has no irrelevant motion control', !await page.locator('.motion-toggle').isVisible());
    await page.locator('#story-valuation').scrollIntoViewIfNeeded();
    await page.screenshot({path: path.join(output, 'reduced-motion.png')});
    await page.locator('.links a[href="report.html"]').click();
    await page.waitForURL('**/report.html');
    check('reduced motion skips cross-document transitions', await page.evaluate(() => sessionStorage.getItem('transitionObserved') === 'false'));
    stage = 'preference change';
    await page.emulateMedia({reducedMotion: 'no-preference'});
    await page.goto(`${base}/index.html`);
    await page.emulateMedia({reducedMotion: 'reduce'});
    check('changing preference cancels in-flight entry motion', await page.locator('[data-motion]').evaluateAll(items => items.every(el => el.getAnimations().length === 0)));

    const mobile = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
    await mobile.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const touch = await mobile.newPage();
    await touch.goto(`${base}/index.html`);
    await touch.waitForTimeout(850);
    check('touch uses coarse pointer', await touch.evaluate(() => matchMedia('(pointer: coarse)').matches));
    await touch.locator('.btn.primary').first().evaluate(el => el.focus());
    check('touch CTA has no hover translation', await touch.locator('.hero .btn.primary').evaluate(el => getComputedStyle(el).transform === 'none'));
    await touch.locator('.motion-toggle').tap();
    check('touch pause works', await touch.locator('.motion-toggle').getAttribute('aria-pressed') === 'true');
    await touch.screenshot({path: path.join(output, 'after-mobile.png')});
    await touch.goto(`${base}/report.html`);
    check('mobile progress does not cause horizontal page overflow', await touch.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await mobile.close();
    const fallback = await browser.newContext({javaScriptEnabled: false});
    const staticPage = await fallback.newPage();
    await staticPage.goto(`${base}/index.html`);
    check('without JS hero text remains visible', await staticPage.locator('h1').isVisible());
    check('without JS narrative keeps four evidence blocks', await staticPage.locator('[data-story-step]>[data-story-evidence]').evaluateAll(items => items.length === 4 && items.every(el => getComputedStyle(el).opacity === '1' && el.getBoundingClientRect().height > 100)));
    await fallback.close();
    assert.deepEqual(errors, []);
    check('no JavaScript runtime errors', errors.length === 0);
    fs.writeFileSync(path.join(output, 'motion-results.json'), JSON.stringify({checks: results.length, results, errors, visibilityTest: 'synthetic document.hidden and visibilitychange', thirdPartyNetwork: 'blocked'}, null, 2));
    console.log(`${results.length} motion checks passed`);
  }finally{
    await browser.close();
    server.close();
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
