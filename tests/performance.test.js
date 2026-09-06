// Local lab comparison; timings are diagnostic, never field Core Web Vitals.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createStaticServer} = require('./helpers');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const stage = process.env.PERF_STAGE || 'after';
assert.ok(['before', 'after'].includes(stage));
const output = path.resolve(root, process.env.TEST_OUTPUT_DIR || `docs/phase-5/${stage}`);
const pages = ['index', 'live', 'report', 'portfolio', 'methodology'];
const samples = [];
const results = [];
const errors = [];
const check = (name, condition) => { assert.ok(condition, name); results.push(name); };
const server = createStaticServer(root);
async function run(){
  fs.mkdirSync(output, {recursive: true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
  async function setup(options = {}, mockWidgets = false){
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 3, ...options});
    const requests = [];
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      requests.push(url.pathname);
      if(url.origin === base) return route.continue();
      if(mockWidgets && url.hostname === 's3.tradingview.com') return route.fulfill({contentType: 'text/javascript', body: `(() => {
        const script = document.currentScript;
        window.widgetConfigs = window.widgetConfigs || [];
        window.widgetConfigs.push(JSON.parse(script.textContent));
        const frame = document.createElement('iframe');
        frame.title = 'Test fixture';
        frame.style.cssText = 'display:block;width:100%;height:100%;border:0';
        script.parentElement.querySelector('.tradingview-widget-container__widget').append(frame);
      })();`});
      return route.abort();
    });
    await context.addInitScript(() => {
      // Identical decorative scene seeds make command comparisons reproducible.
      let seed = 42;
      Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
      window.perfEvidence = {frames: [], shifts: [], longTasks: [], lcp: 0};
      for(const type of ['largest-contentful-paint', 'layout-shift', 'longtask']){
        new PerformanceObserver(list => list.getEntries().forEach(entry => {
          if(type === 'largest-contentful-paint') perfEvidence.lcp = entry.startTime;
          if(type === 'layout-shift' && !entry.hadRecentInput) perfEvidence.shifts.push({time: entry.startTime, value: entry.value});
          if(type === 'longtask') perfEvidence.longTasks.push(entry.duration);
        })).observe({type, buffered: true});
      }
      let draws = 0;
      let commands = 0;
      const clear = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function(...args){ draws++; return clear.apply(this, args); };
      for(const name of ['stroke', 'fill']){
        const original = CanvasRenderingContext2D.prototype[name];
        CanvasRenderingContext2D.prototype[name] = function(...args){ commands++; return original.apply(this, args); };
      }
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = callback => raf.call(window, timestamp => {
        const count = draws;
        const before = commands;
        const start = performance.now();
        callback(timestamp);
        if(draws > count) perfEvidence.frames.push({time: timestamp, ms: performance.now() - start, commands: commands - before});
      });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    return {context, page, requests};
  }
  try{
    for(const mobile of process.env.PERF_FUNCTIONAL_ONLY ? [] : [false, true]){
      for(const name of pages){
        for(let repeat = 0; repeat < 3; repeat++){
          const {context, page, requests} = await setup(mobile ? {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true} : {});
          const cdp = await context.newCDPSession(page);
          await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
          await cdp.send('Performance.enable');
          await page.goto(`${base}/${name}.html`, {waitUntil: 'load'});
          await page.waitForTimeout(1400);
          const start = await page.evaluate(() => { perfEvidence.frames = []; return performance.now(); });
          const metricsBefore = await cdp.send('Performance.getMetrics');
          await page.waitForTimeout(1600);
          const metricsAfter = await cdp.send('Performance.getMetrics');
          const sample = await page.evaluate(start => {
            const {frames, shifts, longTasks, lcp} = perfEvidence;
            const elapsed = performance.now() - start;
            const durations = frames.map(frame => frame.ms).sort((a, b) => a - b);
            const canvas = document.querySelector('canvas');
            let cls = 0, session = 0, first = 0, last = 0;
            shifts.forEach(shift => {
              if(!session || shift.time - last >= 1000 || shift.time - first >= 5000){ session = 0; first = shift.time; }
              last = shift.time; session += shift.value; cls = Math.max(cls, session);
            });
            return {
              elapsed, lcp, cls, longTasks, drawsPerSecond: frames.length * 1000 / elapsed,
              canvasMsPerSecond: frames.reduce((sum, frame) => sum + frame.ms, 0) * 1000 / elapsed,
              commandsPerSecond: frames.reduce((sum, frame) => sum + frame.commands, 0) * 1000 / elapsed,
              callbackP95: durations[Math.floor(durations.length * .95)],
              canvasPixels: canvas.width * canvas.height,
              videoBytes: performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('.webm')).reduce((sum, entry) => sum + entry.encodedBodySize, 0),
              videoPaused: document.querySelector('video').paused,
              overflow: document.documentElement.scrollWidth > innerWidth + 1
            };
          }, start);
          const metric = (response, name) => response.metrics.find(item => item.name === name).value;
          sample.taskMsPerSecond = (metric(metricsAfter, 'TaskDuration') - metric(metricsBefore, 'TaskDuration')) * 1000000 / sample.elapsed;
          sample.layoutMsPerSecond = (metric(metricsAfter, 'LayoutDuration') - metric(metricsBefore, 'LayoutDuration')) * 1000000 / sample.elapsed;
          sample.thirdPartyRequests = requests.filter(url => url.includes('embed-widget-')).length;
          sample.videoRequests = requests.filter(url => url.endsWith('.webm')).length;
          samples.push({page: name, mobile, repeat, ...sample});
          check(`${name}/${mobile}/${repeat}: no overflow; lab CLS <= .1`, !sample.overflow && sample.cls <= .1);
          if(stage === 'after') check(`${name}/${mobile}/${repeat}: decorative drawing capped at 30 fps`, sample.drawsPerSecond > 0 && sample.drawsPerSecond <= 32);
          if(repeat === 0) await page.screenshot({path: path.join(output, `${name}-${mobile ? 'mobile' : 'desktop'}.png`), scale: 'css'});
          await context.close();
        }
      }
    }
    if(stage === 'after'){
      const {context, page, requests} = await setup({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true}, true);
      await page.goto(`${base}/live.html`);
      await page.waitForTimeout(400);
      check('offscreen widgets defer all three third-party scripts on mobile', !requests.some(url => url.includes('embed-widget-')));
      for(const selector of ['#ticker .live-box', '#monitor .live-box']){
        for(const box of await page.locator(selector).all()){
          await box.scrollIntoViewIfNeeded();
          await box.locator('iframe').waitFor();
        }
      }
      const expectedConfigs = [...fs.readFileSync(path.join(root, 'live.html'), 'utf8').matchAll(/<script type="application\/json" data-widget-src="[^"]+">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
      assert.deepEqual(await page.evaluate(() => widgetConfigs), expectedConfigs);
      check('all widgets initialize once with complete HTML JSON config', expectedConfigs.length === 3);
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('#monitor').scrollIntoViewIfNeeded();
      check('return scrolling does not duplicate widget scripts', requests.filter(url => url.includes('embed-widget-')).length === 3);
      await context.close();
      for(const mode of ['reduced', 'save-data', 'low-power', 'deep-link', 'no-observer']){
        const test = await setup(mode === 'reduced' ? {reducedMotion: 'reduce'} : {}, true);
        await test.context.addInitScript(mode => {
          if(mode === 'save-data') Object.defineProperty(navigator, 'connection', {value: {saveData: true}});
          if(mode === 'low-power') Object.defineProperty(navigator, 'hardwareConcurrency', {value: 2});
          if(mode === 'no-observer') delete window.IntersectionObserver;
        }, mode);
        await test.page.goto(`${base}/live.html${mode === 'deep-link' ? '#api' : ''}`);
        await test.page.waitForTimeout(600);
        if(['reduced', 'save-data', 'deep-link'].includes(mode)) check(`${mode}: no decorative video request`, !test.requests.some(url => url.endsWith('.webm')));
        if(mode === 'low-power') check('low-power backing buffer uses <= 1.25 DPR', await test.page.locator('canvas').evaluate(canvas => canvas.width / canvas.getBoundingClientRect().width <= 1.255));
        if(mode === 'no-observer') check('observer fallback loads all widget scripts', test.requests.filter(url => url.includes('embed-widget-')).length === 3);
        await test.context.close();
      }
    }
    check('no JavaScript runtime errors', errors.length === 0);
    fs.writeFileSync(path.join(output, process.env.PERF_FUNCTIONAL_ONLY ? 'behavior-results.json' : 'performance-results.json'), JSON.stringify({stage, browser: browser.version(), method: 'Headless Edge; 4x CPU slowdown; DPR 3; fresh context; local network; external requests blocked (widget lifecycle uses a labelled script fixture); 3 runs per page/viewport; 1.4s warmup + 1.6s sample. Instrumented Canvas submission timings; not GPU or field CWV.', passed: results.length, results, samples, errors}, null, 2));
    console.log(`${results.length} checks passed; ${samples.length} samples: ${output}`);
  }finally{
    await browser.close();
    server.close();
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
