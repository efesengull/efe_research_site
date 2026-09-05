// Opt-in real-network diagnostic, paired against the Phase 5 baseline commit.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, process.env.TEST_OUTPUT_DIR || 'docs/phase-5/third-party');
const baseline = 'a3135e3';
const types = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webm': 'video/webm'};
const server = http.createServer((req, res) => {
  const parts = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).split('/');
  const stage = parts[1];
  const relative = parts.slice(2).join('/');
  const file = path.resolve(root, relative);
  if(!['before', 'after'].includes(stage) || !file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  if(stage === 'before'){
    try{ res.end(execFileSync('git', ['show', `${baseline}:${relative}`], {cwd: root, maxBuffer: 8 * 1024 * 1024})); }
    catch{ res.writeHead(404).end(); }
  }else fs.createReadStream(file).pipe(res);
});
async function run(){
  if(process.env.REAL_THIRD_PARTY !== '1') throw new Error('Set REAL_THIRD_PARTY=1 to run the real provider network diagnostic.');
  fs.mkdirSync(output, {recursive: true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
  const samples = [];
  try{
    for(const mobile of [false, true]){
      for(const stage of ['before', 'after']){
        const context = await browser.newContext({viewport: mobile ? {width: 390, height: 844} : {width: 1440, height: 900}, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile});
        const page = await context.newPage();
        const requests = [];
        const failures = [];
        const errors = [];
        const completed = [];
        let phase = 'initial';
        page.on('request', request => { if(new URL(request.url()).origin !== base) requests.push({phase, url: request.url()}); });
        page.on('requestfailed', request => failures.push({phase, url: request.url(), error: request.failure()?.errorText}));
        page.on('requestfinished', request => {
          if(new URL(request.url()).origin === base) return;
          const finishedPhase = phase;
          completed.push(request.sizes().then(sizes => ({phase: finishedPhase, url: request.url(), bytes: sizes.responseBodySize})).catch(() => ({phase: finishedPhase, url: request.url(), bytes: null})));
        });
        page.on('pageerror', error => errors.push(error.message));
        const cdp = await context.newCDPSession(page);
        await cdp.send('Performance.enable');
        await page.goto(`${base}/${stage}/live.html`, {waitUntil: 'domcontentloaded'});
        await page.waitForTimeout(10000);
        const initialMetrics = await cdp.send('Performance.getMetrics');
        const initial = {requests: requests.length, frames: page.frames().length - 1, taskMs: initialMetrics.metrics.find(item => item.name === 'TaskDuration').value * 1000};
        phase = 'scrolled';
        for(const box of await page.locator('.live-box').all()){
          await box.scrollIntoViewIfNeeded();
          await page.waitForTimeout(4000);
        }
        const widgets = await page.locator('.live-box').evaluateAll(boxes => boxes.map(box => ({loaded: box.classList.contains('is-loaded'), frameSrc: box.querySelector('iframe')?.src || '', height: box.getBoundingClientRect().height})));
        const responses = await Promise.all(completed);
        samples.push({stage, mobile, initial, widgets, requests, responses, failures, errors});
        await page.screenshot({path: path.join(output, `${stage}-${mobile ? 'mobile' : 'desktop'}.png`), scale: 'css'});
        await context.close();
        console.log(`${stage}/${mobile ? 'mobile' : 'desktop'}: initial ${initial.requests} external requests; ${widgets.filter(widget => widget.loaded).length}/3 iframe containers`);
      }
    }
    fs.writeFileSync(path.join(output, 'network-results.json'), JSON.stringify({baseline, browser: browser.version(), method: 'Real provider requests allowed; local static host; fresh context; 10s initial + 4s at each widget; one run per stage/viewport, unthrottled. Completed response body bytes only; ongoing streams excluded. Network variability prevents causal timing claims; iframe presence does not establish quote correctness.', samples}, null, 2));
  }finally{ await browser.close(); server.close(); }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
