// Local browser accessibility regression checks; no build or axe dependency.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(root, process.env.TEST_OUTPUT_DIR || 'docs/phase-6');
const pages = ['index', 'live', 'report', 'portfolio', 'methodology'];
const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844]];
const results = [];
const errors = [];
fs.mkdirSync(path.join(output, 'viewports'), {recursive: true});
function check(name, condition, detail){
  results.push({name, passed: Boolean(condition), ...(detail ? {detail} : {})});
  if(!condition) console.error(`FAIL: ${name}${detail ? ` — ${JSON.stringify(detail)}` : ''}`);
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

async function scenario(name, operation){
  try{ await operation(); }
  catch(error){ check(name, false, error.message); }
}

async function checkFocusVisibility(name, locator){
  const geometry = await locator.evaluate(el => {
    const rect = el.getBoundingClientRect();
    const blockers = [...document.querySelectorAll('.nav, .market-rail, .page-tabs-wrap')].map(item => {
      const box = item.getBoundingClientRect();
      return {class: item.className, position: getComputedStyle(item).position, top: box.top, bottom: box.bottom, left: box.left, right: box.right};
    }).filter(box => ['fixed', 'sticky'].includes(box.position) && box.top >= 0 && box.top < innerHeight && box.right > rect.left && box.left < rect.right);
    return {focused: document.activeElement === el, top: rect.top, bottom: rect.bottom, viewport: innerHeight, blockers};
  });
  check(name, geometry.focused && geometry.bottom > 0 && geometry.top < geometry.viewport && geometry.blockers.every(box => geometry.bottom > box.bottom || geometry.top < box.top), geometry);
}

async function run(){
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true});
  async function localContext(options = {}){
    const context = await browser.newContext(options);
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    return context;
  }
  const context = await localContext();
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  page.on('pageerror', error => errors.push(error.message));
  async function visit(name, width = 1440, height = 900){
    await page.setViewportSize({width, height});
    await page.goto(`${base}/${name}.html`);
    await page.waitForTimeout(100);
  }
  try{
    for(const name of pages){
      for(const [width, height] of sizes){
        await scenario(`${name} ${width}: viewport audit`, async () => {
          await visit(name, width, height);
          const audit = await page.evaluate(() => {
            const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[aria-hidden="true"], [hidden]');
            const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible).map(el => Number(el.tagName.slice(1)));
            const unnamed = [...document.querySelectorAll('a[href],button,input,select,textarea,summary')].filter(visible).filter(el => {
              const references = (el.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join('');
              return !(references.trim() || el.getAttribute('aria-label')?.trim() || [...(el.labels || [])].some(label => label.textContent.trim()) || (!el.matches('input,select,textarea') && el.textContent.trim()) || el.getAttribute('title')?.trim());
            }).map(el => el.outerHTML.slice(0, 180));
            return {headings, unnamed, overflow: document.documentElement.scrollWidth - innerWidth};
          });
          check(`${name} ${width}: no page horizontal overflow`, audit.overflow <= 1, audit.overflow > 1 ? audit.overflow : null);
          check(`${name} ${width}: one h1 and ordered headings`, audit.headings.filter(level => level === 1).length === 1 && audit.headings.every((level, i) => !i || level <= audit.headings[i - 1] + 1), audit.headings);
          check(`${name} ${width}: visible controls have names`, !audit.unnamed.length, audit.unnamed);
          check(`${name} ${width}: active page is announced`, await page.locator(`.nav a[aria-current="page"][href="${name}.html"]`).count() === 1);
          check(`${name} ${width}: decorative video excluded`, await page.locator('.hero-video').getAttribute('aria-hidden') === 'true');
          if(name !== 'index') check(`${name} ${width}: section navigation named`, await page.locator('.page-tabs-wrap').evaluate(el => (el.tagName === 'NAV' || el.getAttribute('role') === 'navigation') && Boolean(el.getAttribute('aria-label'))));
          // Hero entry lasts 760ms; record the settled composition.
          await page.waitForTimeout(800);
          await page.screenshot({path: path.join(output, 'viewports', `${name}-${width}.png`)});
          await page.keyboard.press('Tab');
          check(`${name} ${width}: skip link first`, await page.evaluate(() => document.activeElement.matches('.skip-link')));
          await page.keyboard.press('Enter');
          check(`${name} ${width}: skip link transfers focus to main`, await page.evaluate(() => document.activeElement.id === 'main'));
        });
      }
    }

    await scenario('mobile navigation keyboard', async () => {
      await visit('index', 390, 844);
      await page.locator('.nav-toggle').focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      check('mobile menu: keyboard reaches links', await page.evaluate(() => document.activeElement.matches('#site-links a')));
      await page.keyboard.press('Escape');
      check('mobile menu: Escape closes and returns focus', await page.locator('.nav-toggle').getAttribute('aria-expanded') === 'false' && await page.evaluate(() => document.activeElement.matches('.nav-toggle')));
    });

    await scenario('search keyboard interaction', async () => {
      await visit('index');
      const opener = page.locator('.rail-search');
      await opener.focus();
      await page.keyboard.press('Enter');
      const input = page.locator('#research-search-input');
      await input.waitFor({state: 'visible'});
      await page.waitForTimeout(40);
      check('search: opening focuses input', await input.evaluate(el => document.activeElement === el));
      check('search: input has visible keyboard focus', await input.evaluate(el => getComputedStyle(el).outlineStyle !== 'none' && parseFloat(getComputedStyle(el).outlineWidth) >= 2));
      check('search: native link results retain semantics', await page.locator('.command-results[role="list"]').count() === 1 && await page.locator('.command-results [role="listitem"]').count() > 0 && await page.locator('.command-result[role="option"]').count() === 0);
      await input.fill('zzzxnonexistent');
      check('search: empty result communicated', await page.locator('.command-result').count() === 0 && /bulunamadı|0|yok/i.test(await page.locator('#research-search [role="status"]').textContent()));
      await input.fill('GARAN');
      check('search: matching asset found', (await page.locator('.command-result').first().innerText()).includes('GARAN'));
      await input.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Shift+Tab');
      check('search: modal traps keyboard focus', await page.evaluate(() => document.activeElement.closest('#research-search') !== null));
      await page.keyboard.press('Escape');
      if(await page.locator('#research-search').evaluate(el => el.open)) await page.keyboard.press('Escape');
      check('search: Escape returns focus to opener', await opener.evaluate(el => document.activeElement === el));
      await page.keyboard.press('Enter');
      await input.waitFor({state: 'visible'});
      check('search: reopening clears prior query', await input.inputValue() === '');
      await input.fill('GARAN');
      await input.press('Enter');
      await page.waitForURL('**/report.html#universe');
      check('search: Enter follows matching asset link', true);
    });

    await scenario('table controls keyboard', async () => {
      await visit('index');
      const table = page.locator('#stock-table').locator('..');
      const wrapper = table.locator('..');
      const sort = table.locator('thead .table-sort').first();
      await sort.focus();
      await checkFocusVisibility('table: focused sort is not obscured by sticky navigation', sort);
      await page.keyboard.press('Enter');
      check('table: Enter sorts ascending with announced direction', await table.locator('thead th').first().getAttribute('aria-sort') === 'ascending' && (await page.locator('#stock-table tr td:first-child').allTextContents()).map(Number).every((v, i, all) => !i || v >= all[i - 1]));
      await page.keyboard.press('Space');
      check('table: Space reverses numeric sort', await table.locator('thead th').first().getAttribute('aria-sort') === 'descending' && (await page.locator('#stock-table tr td:first-child').allTextContents()).map(Number).every((v, i, all) => !i || v <= all[i - 1]));
      const tableInput = wrapper.locator('.table-tools input');
      await tableInput.focus();
      await checkFocusVisibility('table: focused filter is not obscured by sticky navigation', tableInput);
      await tableInput.fill('GARAN');
      check('table: text filter leaves matching row', await page.locator('#stock-table tr:visible').count() === 1 && (await page.locator('#stock-table tr:visible').innerText()).includes('GARAN'));
      check('table: filtered count announced', await wrapper.locator('[data-row-count]').evaluate(el => el.getAttribute('role') === 'status' && el.textContent.includes('1')));
      await wrapper.locator('.table-tools input').fill('');
      const banks = page.locator('[data-filter="Bankacılık"]');
      await banks.focus();
      await page.keyboard.press('Space');
      check('sector: keyboard filter announces selection and displays four rows', await banks.getAttribute('aria-pressed') === 'true' && await page.locator('[data-filter][aria-pressed="true"]').count() === 1 && await page.locator('#stock-table tr:visible').count() === 4);
    });

    await scenario('capital simulator keyboard', async () => {
      await visit('portfolio');
      const input = page.locator('#model-capital');
      await input.focus();
      await checkFocusVisibility('capital: focused input is not obscured by sticky navigation', input);
      check('capital: keyboard focus visible', await input.evaluate(el => getComputedStyle(el).outlineStyle !== 'none' && parseFloat(getComputedStyle(el).outlineWidth) >= 2));
      check('capital: help and unit associated', await input.evaluate(el => (el.getAttribute('aria-describedby') || '').split(/\s+/).some(id => document.getElementById(id)?.textContent.includes('TL'))));
      await input.fill('');
      await input.pressSequentially('250000');
      check('capital: intermediate typing is not clamped', await input.inputValue() === '250000');
      await page.keyboard.press('Tab');
      check('capital: committed input recalculates allocations', (await page.locator('[data-model-amount][data-live-symbol="GARAN"]').allTextContents()).every(text => text.includes('20.000')));
      check('capital: result announced', await page.locator('#capital-status').getAttribute('role') === 'status' && (await page.locator('#capital-status').innerText()).includes('250.000'));
      const preset = page.locator('[data-capital="50000"]');
      await preset.focus();
      await page.keyboard.press('Space');
      check('capital: preset state and scenario updated', await preset.getAttribute('aria-pressed') === 'true' && await page.locator('[data-capital][aria-pressed="true"]').count() === 1 && (await page.locator('[data-scenario-net="21.4"]').innerText()).includes('60.700'));
      await input.fill('1');
      await page.keyboard.press('Tab');
      check('capital: bounds enforced at commit', await input.inputValue() === '10000');
    });

    await scenario('correlation matrix keyboard', async () => {
      await visit('portfolio', 390, 844);
      const table = page.locator('#correlation-table');
      const wrapper = table.locator('..');
      check('matrix: table named and row/column headers scoped', Boolean(await table.getAttribute('aria-label')) && await table.locator('th[scope="row"]').count() > 0 && await table.locator('th[scope="col"]').count() > 0);
      check('matrix: scrolling region keyboard reachable', await wrapper.getAttribute('role') === 'region' && await wrapper.getAttribute('tabindex') === '0');
      await wrapper.focus();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(180);
      check('matrix: ArrowRight horizontally scrolls table', await wrapper.evaluate(el => el.scrollLeft > 0));
      await page.screenshot({path: path.join(output, 'matrix-keyboard.png')});
    });

    await scenario('ticker motion controls with local third-party fixture', async () => {
      const fixtureContext = await localContext({viewport: {width: 1440, height: 900}});
      const requests = [];
      // This fixture deliberately omits title and financial data. It verifies our
      // integration lifecycle, not TradingView content, prices or provider UI.
      await fixtureContext.route('https://s3.tradingview.com/external-embedding/embed-widget-*.js', route => {
        const kind = new URL(route.request().url()).pathname.split('/').pop();
        requests.push(kind);
        return route.fulfill({contentType: 'text/javascript', body: `(() => {
          const holder = document.currentScript.closest('.tradingview-widget-container');
          const frame = document.createElement('iframe');
          frame.dataset.testWidget = ${JSON.stringify(kind)};
          frame.src = 'about:blank';
          holder.append(frame);
        })();`});
      });
      const widgetPage = await fixtureContext.newPage();
      widgetPage.setDefaultTimeout(6000);
      widgetPage.on('pageerror', error => errors.push(`fixture: ${error.message}`));
      try{
        await widgetPage.goto(`${base}/live.html`);
        const toggle = widgetPage.locator('[data-ticker-toggle]');
        const ticker = widgetPage.locator('#ticker iframe');
        const monitors = widgetPage.locator('#monitor iframe');
        await widgetPage.locator('#ticker .live-box').scrollIntoViewIfNeeded();
        await ticker.waitFor({state: 'attached'});
        await widgetPage.waitForFunction(() => Boolean(document.querySelector('#ticker iframe')?.title));
        check('fixture ticker: loaded iframe has meaningful title', (await ticker.getAttribute('title')).includes((await widgetPage.locator('#ticker h2').innerText()).trim()));
        await widgetPage.locator('#monitor .live-box').first().scrollIntoViewIfNeeded();
        await widgetPage.waitForFunction(() => document.querySelectorAll('#monitor iframe').length === 2);
        check('fixture widgets: normal mode loads all three', await ticker.count() === 1 && await monitors.count() === 2 && requests.length === 3);
        await toggle.focus();
        await widgetPage.keyboard.press('Space');
        check('fixture ticker: hide removes iframe and preserves button focus', await ticker.count() === 0 && await toggle.getAttribute('aria-pressed') === 'true' && await toggle.evaluate(el => document.activeElement === el));
        check('fixture ticker: hiding preserves both other monitors', await monitors.count() === 2);
        await widgetPage.keyboard.press('Space');
        await ticker.waitFor({state: 'attached'});
        check('fixture ticker: show loads a fresh iframe', await toggle.getAttribute('aria-pressed') === 'false' && requests.filter(kind => kind === 'embed-widget-ticker-tape.js').length === 2);
        await widgetPage.locator('.motion-toggle').click();
        check('fixture ticker: global motion pause removes iframe and disables ticker control', await ticker.count() === 0 && await toggle.isDisabled() && await monitors.count() === 2);
        await widgetPage.locator('.motion-toggle').click();
        await widgetPage.locator('#ticker .live-box').scrollIntoViewIfNeeded();
        await ticker.waitFor({state: 'attached'});
        await widgetPage.emulateMedia({reducedMotion: 'reduce'});
        await widgetPage.waitForFunction(() => document.querySelectorAll('#ticker iframe').length === 0);
        check('fixture ticker: runtime reduced motion removes ticker only', await toggle.isDisabled() && await monitors.count() === 2);
        requests.length = 0;
        await widgetPage.reload();
        await widgetPage.locator('#ticker .live-box').scrollIntoViewIfNeeded();
        await widgetPage.waitForTimeout(220);
        check('fixture ticker: initial reduced motion sends no ticker request', !requests.includes('embed-widget-ticker-tape.js') && await ticker.count() === 0 && await widgetPage.locator('#ticker script[data-widget-src]').count() === 0);
        await widgetPage.locator('#monitor .live-box').first().scrollIntoViewIfNeeded();
        await widgetPage.waitForFunction(() => document.querySelectorAll('#monitor iframe').length === 2);
        check('fixture widgets: reduced motion preserves both other monitor requests', requests.includes('embed-widget-market-overview.js') && requests.includes('embed-widget-symbol-overview.js') && !requests.includes('embed-widget-ticker-tape.js'));
      }finally{
        await fixtureContext.close();
      }
    });

    for(const name of pages){
      await scenario(`${name}: reduced motion`, async () => {
        await page.emulateMedia({reducedMotion: 'reduce'});
        await visit(name);
        check(`${name}: reduced motion pauses video`, await page.locator('.hero-video').evaluate(el => el.paused));
        check(`${name}: reduced motion leaves no running animation`, await page.evaluate(() => document.getAnimations().every(animation => animation.playState !== 'running')));
        if(name === 'index') check('reduced motion: all narrative evidence visible and unpinned', await page.locator('.os-story').evaluate(el => !el.classList.contains('is-pinned')) && await page.locator('[data-story-step]>[data-story-evidence]').evaluateAll(items => items.length === 4 && items.every(el => el.getBoundingClientRect().height > 100)));
        await page.screenshot({path: path.join(output, `reduced-${name}.png`)});
      });
      await scenario(`${name}: 320px reflow`, async () => {
        await visit(name, 320, 844);
        check(`${name}: 320px page reflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({path: path.join(output, `reflow-${name}.png`)});
      });
      await scenario(`${name}: enlarged text`, async () => {
        await visit(name, 1024, 768);
        await page.addStyleTag({content: 'html{font-size:32px!important}'});
        await page.waitForTimeout(100);
        const reflow = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          viewport: innerWidth,
          overflowing: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1 && !el.closest('.table-wrap, [aria-hidden="true"]')).slice(0, 12).map(el => ({tag: el.tagName, class: el.className, right: Math.round(el.getBoundingClientRect().right)}))
        }));
        check(`${name}: 200% text keeps page within viewport`, reflow.width <= reflow.viewport + 1, reflow.width > reflow.viewport + 1 ? reflow : null);
        check(`${name}: 200% text keeps rail search visible within viewport`, await page.locator('.rail-search').evaluate(el => {
          const rect = el.getBoundingClientRect();
          return Boolean(el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden' && rect.left >= 0 && rect.right <= innerWidth + 1 && rect.top >= 0 && rect.bottom <= innerHeight;
        }));
        check(`${name}: enlarged unfocused skip link stays offscreen`, await page.locator('.skip-link').evaluate(el => {
          const rect = el.getBoundingClientRect();
          return document.activeElement !== el && (rect.bottom <= 0 || rect.right <= 0 || getComputedStyle(el).clipPath === 'inset(50%)');
        }));
        await page.screenshot({path: path.join(output, `text-200-${name}.png`)});
      });
    }

    const noJsContext = await localContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
    const noJs = await noJsContext.newPage();
    for(const name of pages){
      await scenario(`${name}: no JavaScript`, async () => {
        await noJs.goto(`${base}/${name}.html`);
        check(`${name}: no JS heading and basic content accessible`, await noJs.locator('h1').isVisible() && (await noJs.locator('main').innerText()).trim().length > 300);
        check(`${name}: no JS mobile navigation accessible`, await noJs.locator('.nav a[href="report.html"]').isVisible() && await noJs.locator('.nav a[href="portfolio.html"]').isVisible());
        check(`${name}: no JS no page overflow`, await noJs.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await noJs.screenshot({path: path.join(output, `no-js-${name}.png`)});
      });
    }
    await noJsContext.close();
    check('no JavaScript runtime errors', errors.length === 0, errors);
  }finally{
    const failed = results.filter(result => !result.passed);
    fs.writeFileSync(path.join(output, 'accessibility-results.json'), JSON.stringify({checks: results.length, passed: results.length - failed.length, failed: failed.length, results, errors, limits: 'Headless Edge local DOM/keyboard audit; third-party requests blocked except a clearly isolated local iframe fixture for ticker lifecycle (no financial data or real TradingView UI); no screen reader or automatic contrast engine used.'}, null, 2));
    console.log(`${results.length - failed.length}/${results.length} checks passed. Results: ${output}`);
    if(failed.length) process.exitCode = 1;
    await browser.close();
    server.close();
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
