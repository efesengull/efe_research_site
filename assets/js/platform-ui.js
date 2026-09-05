(function(){
  'use strict';

  const TIME_ZONE = 'Europe/Istanbul';
  function handlePageTransition(event){
    if(!event.viewTransition) return;
    event.viewTransition.ready.catch(() => {});
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-motion-paused')) event.viewTransition.skipTransition();
  }
  window.addEventListener('pageswap', handlePageTransition);
  window.addEventListener('pagereveal', handlePageTransition);
  const tableLabels = {
    'valuation-table': 'Değerleme panosu',
    'stock-table': 'Hisse araştırma evreni',
    'fund-table': 'Fon araştırma evreni',
    'portfolio-table': 'Model portföy dağılımı',
    'scenario-table': 'Portföy senaryoları',
    'correction-table': 'Revizyon günlüğü',
    'scoring-table': 'Skorlama modeli',
    'fund-comparison': 'Fon karşılaştırması'
  };

  function formatMoney(value){
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value);
  }

  function istanbulParts(date = new Date()){
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);
    return Object.fromEntries(parts.map(part => [part.type, part.value]));
  }

  function marketState(date = new Date()){
    const parts = istanbulParts(date);
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    const businessDay = !['Sat', 'Sun'].includes(parts.weekday);
    const open = businessDay && minutes >= 600 && minutes < 1080;
    return {
      open,
      label: open ? 'Seans aralığı açık' : 'Seans aralığı kapalı',
      detail: 'Hafta içi 10:00–18:00 · tatil takvimi hariç'
    };
  }

  function createMarketRail(){
    const nav = document.querySelector('.nav');
    if(!nav || document.querySelector('.market-rail')) return;

    const lock = typeof DATA_LOCK !== 'undefined' ? DATA_LOCK : {};
    const rail = document.createElement('div');
    rail.className = 'market-rail';
    rail.setAttribute('role', 'region');
    rail.setAttribute('aria-label', 'Platform saati ve veri durumu');
    rail.innerHTML = `
      <div class="container market-rail-inner">
        <div class="market-session" data-market-session title="Gösterge resmi tatil takvimini içermez">
          <i aria-hidden="true"></i><span data-market-session-label>Seans durumu</span>
        </div>
        <span class="rail-item"><small>Platform</small><b data-clock="time">--:--</b></span>
        <span class="rail-item"><small>Fiyat snapshot</small><b>${lock.marketReferenceDate || '04 Eylül 2026'}</b></span>
        <span class="rail-item"><small>Makro güncelleme</small><b>${lock.macroDate || '14 Ağustos 2026'}</b></span>
        <span class="rail-feed" data-feed-label>Statik araştırma modu</span>
        <button class="rail-search" type="button" data-open-search aria-label="Varlık veya sayfa ara">
          <span>Ara</span><kbd>/</kbd>
        </button>
      </div>`;
    nav.insertAdjacentElement('afterend', rail);
  }

  function updateClock(){
    const now = new Date();
    const time = new Intl.DateTimeFormat('tr-TR', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(now);
    const date = new Intl.DateTimeFormat('tr-TR', {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(now);

    document.querySelectorAll('[data-clock="time"]').forEach(el => { el.textContent = time; });
    document.querySelectorAll('[data-clock="date"]').forEach(el => { el.textContent = date; });
    document.querySelectorAll('[data-clock="date-time"]').forEach(el => { el.textContent = `${date} · ${time}`; });

    const state = marketState(now);
    document.querySelectorAll('[data-market-session]').forEach(el => {
      el.classList.toggle('is-open', state.open);
      el.classList.toggle('is-closed', !state.open);
      el.title = state.detail;
    });
    document.querySelectorAll('[data-market-session-label]').forEach(el => { el.textContent = state.label; });
  }

  function searchIndex(){
    const data = window.EFE_RESEARCH_DATA || {};
    const pages = [
      {kind: 'Sayfa', code: 'KOKPİT', title: 'Araştırma kokpiti', meta: 'Piyasa rejimi ve karar kuyruğu', href: 'index.html'},
      {kind: 'Sayfa', code: 'PİYASA', title: 'Canlı piyasa monitörü', meta: 'TradingView ve lisanslı API modu', href: 'live.html'},
      {kind: 'Sayfa', code: 'RAPOR', title: 'Araştırma raporu', meta: 'Değerleme, tez ve kaynaklar', href: 'report.html'},
      {kind: 'Sayfa', code: 'PORTFÖY', title: 'Model portföy', meta: 'Dağılım, senaryo ve korelasyon', href: 'portfolio.html'},
      {kind: 'Sayfa', code: 'METOT', title: 'Metodoloji', meta: 'Skorlama ve veri protokolü', href: 'methodology.html'}
    ];
    const stocks = (data.stocks || []).map(item => ({
      kind: 'Hisse',
      code: item.code,
      title: item.name,
      meta: `${item.theme} · ${item.decision}`,
      href: `report.html#universe`
    }));
    const funds = (data.funds || []).map(item => ({
      kind: 'Fon',
      code: item.code,
      title: item.name,
      meta: `${item.type} · ${item.risk}`,
      href: 'report.html#fund-universe'
    }));
    return [...pages, ...stocks, ...funds];
  }

  function createSearchPalette(){
    if(document.querySelector('#research-search')) return;
    const dialog = document.createElement('dialog');
    dialog.id = 'research-search';
    dialog.className = 'command-dialog';
    dialog.setAttribute('aria-label', 'Platform içinde ara');
    dialog.innerHTML = `
      <form method="dialog" class="command-shell">
        <div class="command-input-row">
          <span class="command-icon" aria-hidden="true">⌕</span>
          <label class="sr-only" for="research-search-input">Hisse, fon veya sayfa ara</label>
          <input id="research-search-input" type="search" autocomplete="off" placeholder="Hisse, fon veya sayfa ara…">
          <button class="icon-button" value="cancel" aria-label="Aramayı kapat" title="Kapat">×</button>
        </div>
        <div class="command-meta"><span role="status" aria-atomic="true" data-search-status></span><span>Tab ile seç · Enter ile aç</span></div>
        <div class="command-results" role="list" aria-label="Arama sonuçları"></div>
      </form>`;
    document.body.append(dialog);

    const input = dialog.querySelector('input');
    const results = dialog.querySelector('.command-results');
    const status = dialog.querySelector('[data-search-status]');
    const items = searchIndex();
    let visibleItems = [];
    let opener;

    function normalize(value){
      return String(value || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function render(query = ''){
      const normalized = normalize(query.trim());
      visibleItems = items.filter(item => !normalized || normalize(`${item.code} ${item.title} ${item.meta} ${item.kind}`).includes(normalized)).slice(0, 12);
      results.replaceChildren();
      status.textContent = visibleItems.length ? `${visibleItems.length} sonuç gösteriliyor` : 'Sonuç bulunamadı';

      if(!visibleItems.length){
        const empty = document.createElement('p');
        empty.className = 'command-empty';
        empty.textContent = 'Eşleşen varlık veya sayfa bulunamadı.';
        empty.setAttribute('role', 'listitem');
        results.append(empty);
        return;
      }

      visibleItems.forEach((item, index) => {
        const link = document.createElement('a');
        link.href = item.href;
        link.className = `command-result${index === 0 ? ' is-selected' : ''}`;
        link.innerHTML = `<span class="result-code"></span><span class="result-copy"><b></b><small></small></span><span class="result-kind"></span>`;
        link.querySelector('.result-code').textContent = item.code;
        link.querySelector('.result-copy b').textContent = item.title;
        link.querySelector('.result-copy small').textContent = item.meta;
        link.querySelector('.result-kind').textContent = item.kind;
        const row = document.createElement('div');
        row.setAttribute('role', 'listitem');
        row.append(link);
        results.append(row);
      });
    }

    function open(){
      if(dialog.open) return;
      opener = document.activeElement;
      input.value = '';
      render('');
      if(typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      window.setTimeout(() => input.focus(), 20);
    }

    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-open-search]');
      if(!trigger) return;
      event.preventDefault();
      open();
    });
    document.addEventListener('keydown', event => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName) || document.activeElement?.isContentEditable;
      if(event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey){
        event.preventDefault();
        open();
      }
    });
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', event => {
      if(event.key === 'Enter' && visibleItems[0]){
        event.preventDefault();
        window.location.href = visibleItems[0].href;
      }
    });
    dialog.addEventListener('keydown', event => {
      if(event.key === 'Escape'){
        event.preventDefault();
        event.stopPropagation();
        dialog.close();
      }
    });
    dialog.addEventListener('close', () => { if(opener?.isConnected) opener.focus(); });
    dialog.addEventListener('click', event => {
      if(event.target === dialog) dialog.close();
    });
  }

  function valueForSort(cell){
    const text = cell.textContent.trim();
    const numeric = Number(text.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(numeric) && /\d/.test(text) ? numeric : text.toLocaleLowerCase('tr-TR');
  }

  function enhanceTable(wrapper){
    if(wrapper.dataset.enhanced === 'true') return;
    const table = wrapper.querySelector('table');
    const body = table && table.tBodies[0];
    if(!table || !body || body.id === 'correlation-table') return;

    const title = wrapper.dataset.tableTitle || tableLabels[body.id];
    if(!title) return;
    wrapper.dataset.enhanced = 'true';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', title);
    table.setAttribute('aria-label', title);

    const tools = document.createElement('div');
    tools.className = 'table-tools';
    tools.innerHTML = `
      <div><b>${title}</b><span data-row-count role="status" aria-atomic="true"></span></div>
      <label><span class="sr-only">${title} içinde ara</span><input type="search" placeholder="Tabloda ara…" autocomplete="off"></label>`;
    wrapper.insertBefore(tools, table);
    const input = tools.querySelector('input');
    const counter = tools.querySelector('[data-row-count]');

    function applyFilter(){
      const query = input.value.trim().toLocaleLowerCase('tr-TR');
      let visible = 0;
      [...body.rows].forEach(row => {
        const match = !query || row.textContent.toLocaleLowerCase('tr-TR').includes(query);
        row.hidden = !match;
        if(match) visible += 1;
      });
      counter.textContent = `${visible} kayıt`;
    }

    input.addEventListener('input', applyFilter);
    table.querySelectorAll('thead th').forEach((header, columnIndex) => {
      header.scope = 'col';
      header.classList.add('sortable');
      const label = header.textContent.trim();
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'table-sort';
      button.textContent = label;
      button.setAttribute('aria-label', `${label}: artan sırala`);
      header.replaceChildren(button);
      const sort = () => {
        const ascending = header.dataset.sort !== 'asc';
        table.querySelectorAll('thead th').forEach(item => {
          item.removeAttribute('data-sort');
          item.removeAttribute('aria-sort');
          const control = item.querySelector('.table-sort');
          control.setAttribute('aria-label', `${control.textContent}: artan sırala`);
        });
        header.dataset.sort = ascending ? 'asc' : 'desc';
        header.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
        button.setAttribute('aria-label', `${label}: ${ascending ? 'azalan' : 'artan'} sırala`);
        const rows = [...body.rows];
        rows.sort((a, b) => {
          const left = valueForSort(a.cells[columnIndex]);
          const right = valueForSort(b.cells[columnIndex]);
          const comparison = typeof left === 'number' && typeof right === 'number'
            ? left - right
            : String(left).localeCompare(String(right), 'tr-TR', {numeric: true});
          return ascending ? comparison : -comparison;
        });
        rows.forEach(row => body.append(row));
        applyFilter();
        counter.textContent += ` · ${label}: ${ascending ? 'artan' : 'azalan'} sıralama`;
      };
      button.addEventListener('click', sort);
    });
    applyFilter();

    window.addEventListener('efe:table-updated', event => {
      if(!event.detail || event.detail.tableId === body.id){
        table.querySelectorAll('thead th').forEach(header => {
          header.removeAttribute('data-sort');
          header.removeAttribute('aria-sort');
          const button = header.querySelector('.table-sort');
          button.setAttribute('aria-label', `${button.textContent}: artan sırala`);
        });
        applyFilter();
      }
    });
  }

  function enhanceTables(){
    document.querySelectorAll('.table-wrap').forEach(enhanceTable);
    const matrix = document.querySelector('#correlation-table');
    if(matrix){
      const wrapper = matrix.closest('.table-wrap');
      wrapper.tabIndex = 0;
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'Model korelasyon matrisi · yatay kaydırılabilir');
    }
  }

  function observeShellHeight(){
    if(typeof ResizeObserver === 'undefined') return;
    const nav = document.querySelector('.nav');
    const rail = document.querySelector('.market-rail');
    const desktop = window.matchMedia('(min-width: 1121px)');
    function update(){
      const height = (desktop.matches ? rail : nav).offsetHeight;
      document.documentElement.style.setProperty('--shell-sticky-offset', `${height + 1}px`);
    }
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    observer.observe(rail);
    desktop.addEventListener('change', update);
    update();
  }

  function initCapitalSimulator(){
    const input = document.querySelector('#model-capital');
    if(!input) return;
    const presets = document.querySelectorAll('[data-capital]');
    const status = document.querySelector('#capital-status');

    function update(){
      let capital = Number(input.value);
      if(!Number.isFinite(capital)) capital = 100000;
      capital = Math.max(10000, Math.min(10000000, capital));
      input.value = String(Math.round(capital));

      document.querySelectorAll('[data-model-capital-label]').forEach(el => { el.textContent = formatMoney(capital); });
      document.querySelectorAll('[data-model-amount][data-weight]').forEach(el => {
        const amount = capital * Number(el.dataset.weight) / 100;
        el.textContent = formatMoney(amount);
        el.dataset.liveBaseAmount = String(amount);
        el.dataset.staticValue = formatMoney(amount);
      });
      document.querySelectorAll('[data-scenario-net]').forEach(el => {
        const rate = Number(el.dataset.scenarioNet);
        const result = capital * (1 + rate / 100);
        el.textContent = formatMoney(result);
      });
      presets.forEach(button => {
        const selected = Number(button.dataset.capital) === capital;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      if(status) status.textContent = `${formatMoney(capital)} için dağılım ve senaryolar güncellendi.`;
      window.dispatchEvent(new CustomEvent('efe:capital-change', {detail: {capital}}));
    }

    input.addEventListener('change', update);
    presets.forEach(button => button.addEventListener('click', () => {
      input.value = button.dataset.capital;
      update();
    }));
    update();
  }

  function manageHeroMedia(){
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const compact = window.matchMedia('(max-width: 560px), (pointer: coarse)');
    const connection = navigator.connection;
    const videos = [...document.querySelectorAll('.hero-video')];
    if(!videos.length) return;
    const visibility = new WeakMap(videos.map(video => [video, typeof IntersectionObserver === 'undefined']));

    function sync(){
      videos.forEach(video => {
        if(reduced.matches || compact.matches || connection?.saveData || document.hidden || document.documentElement.hasAttribute('data-motion-paused') || visibility.get(video) === false){
          video.pause();
          if(reduced.matches) video.currentTime = 0;
        }else{
          video.play().catch(() => {});
        }
      });
    }
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('efe:motion-change', sync);
    if(typeof reduced.addEventListener === 'function') reduced.addEventListener('change', sync);
    if(typeof compact.addEventListener === 'function') compact.addEventListener('change', sync);
    if(connection?.addEventListener) connection.addEventListener('change', sync);
    if(typeof IntersectionObserver !== 'undefined'){
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting));
        sync();
      });
      videos.forEach(video => observer.observe(video));
    }
    sync();
  }

  function initLazyWidgets(){
    const configs = [...document.querySelectorAll('script[data-widget-src]')];
    if(!configs.length) return;
    function load(config){
      if(!config.isConnected) return;
      const script = document.createElement('script');
      script.src = config.dataset.widgetSrc;
      script.async = true;
      script.textContent = config.textContent;
      config.replaceWith(script);
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(!entry.isIntersecting || document.hidden) return;
        entry.target.querySelectorAll('script[data-widget-src]').forEach(load);
        observer.unobserve(entry.target);
      });
    }, {rootMargin: '160px 0px'});
    const boxes = [...new Set(configs.map(config => config.closest('.live-box')))];
    function observe(box){
      if(observer) observer.observe(box);
      else box.querySelectorAll('script[data-widget-src]').forEach(load);
    }
    const ticker = configs.find(config => config.dataset.widgetSrc.endsWith('embed-widget-ticker-tape.js'));
    if(ticker){
      const box = ticker.closest('.live-box');
      const container = ticker.closest('.tradingview-widget-container');
      const template = container.cloneNode(true);
      const placeholder = box.querySelector('.live-placeholder');
      const originalMessage = placeholder.textContent;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      let userPaused = false;
      let removed = false;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn small ticker-toggle';
      button.dataset.tickerToggle = '';
      box.before(button);
      function sync(){
        const preferencePaused = reduced.matches || document.documentElement.hasAttribute('data-motion-paused');
        const paused = preferencePaused || userPaused;
        button.disabled = preferencePaused;
        button.setAttribute('aria-pressed', String(paused));
        button.textContent = preferencePaused ? 'Ticker bandı: hareket kapalı' : paused ? 'Ticker bandını göster' : 'Ticker bandını gizle';
        if(paused && !removed){
          // Removing the browsing context stops the provider's moving ticker.
          container.replaceChildren();
          box.classList.remove('is-loaded');
          placeholder.textContent = 'Hareketli ticker bandı kapalı. Diğer piyasa monitörlerini aşağıdan inceleyebilirsiniz.';
          removed = true;
        }else if(!paused && removed){
          container.replaceChildren(...template.cloneNode(true).childNodes);
          placeholder.textContent = originalMessage;
          removed = false;
          observe(box);
        }
      }
      button.addEventListener('click', () => { userPaused = !userPaused; sync(); });
      reduced.addEventListener('change', sync);
      window.addEventListener('efe:motion-change', sync);
      sync();
    }
    boxes.forEach(observe);
    document.addEventListener('visibilitychange', () => {
      if(!document.hidden) boxes.filter(box => box.querySelector('script[data-widget-src]')).forEach(box => {
        if(observer) observer.unobserve(box);
        observe(box);
      });
    });
  }

  function initPageTabs(){
    const links = [...document.querySelectorAll('.page-tabs a[href^="#"]')];
    if(!links.length || !('ResizeObserver' in window)) return;
    const sections = links.map(link => document.getElementById(link.hash.slice(1)));
    if(sections.some(section => !section)) return;
    const tabs = document.querySelector('.page-tabs-wrap');
    const status = document.createElement('span');
    status.className = 'section-progress';
    status.setAttribute('role', 'img');
    // Discrete section progress; no live announcement on every scroll.
    tabs.append(status);
    let boundaries = [];
    let offset = 0;
    let maxScroll = 0;
    let frame = 0;
    let measureFrame = 0;
    let active = -1;

    function update(){
      frame = 0;
      if(document.hidden || !boundaries.length) return;
      let index = -1;
      boundaries.forEach((top, i) => { if(window.scrollY + offset >= top) index = i; });
      // Short final sections may never reach the reading line before page end.
      if(maxScroll > 0 && window.scrollY >= maxScroll - 2) index = links.length - 1;
      if(index === active) return;
      active = index;
      links.forEach((link, i) => {
        link.classList.toggle('active', i === index);
        if(i === index) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(links.length).padStart(2, '0')}`;
      status.setAttribute('aria-label', index < 0 ? 'Bölümlerin başlangıcı' : `Bölüm ${index + 1} / ${links.length}: ${links[index].textContent}`);
      tabs.style.setProperty('--section-progress', (index + 1) / links.length);
    }
    function schedule(){
      if(!document.hidden && !frame) frame = requestAnimationFrame(update);
    }
    function measure(){
      measureFrame = 0;
      if(document.hidden) return;
      boundaries = sections.map(section => section.getBoundingClientRect().top + window.scrollY);
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      offset = Math.max((parseFloat(getComputedStyle(tabs).top) || 0) + tabs.offsetHeight + 32, window.innerHeight * 0.3);
      update();
    }
    function scheduleMeasure(){
      if(!document.hidden && !measureFrame) measureFrame = requestAnimationFrame(measure);
    }
    new ResizeObserver(scheduleMeasure).observe(document.body);
    window.addEventListener('scroll', schedule, {passive: true});
    window.addEventListener('resize', scheduleMeasure, {passive: true});
    window.addEventListener('pageshow', scheduleMeasure);
    document.addEventListener('visibilitychange', () => {
      if(document.hidden){
        cancelAnimationFrame(frame);
        cancelAnimationFrame(measureFrame);
        frame = measureFrame = 0;
      }else scheduleMeasure();
    });
    if(document.fonts) document.fonts.ready.then(scheduleMeasure);
    active = -2;
    measure();
  }

  function initMotion(){
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hero = document.querySelector('.hero');
    const animations = new Map();
    const seen = new WeakSet();
    const targets = new Map();
    document.querySelectorAll('.hero h1, .hero .lead').forEach(el => targets.set(el, 'hero'));
    document.querySelectorAll('main .section-head').forEach(el => targets.set(el, 'section'));
    document.querySelectorAll('.os-range-chart, .allocation-panel').forEach(el => targets.set(el, 'chart'));
    const styles = getComputedStyle(root);
    const easing = styles.getPropertyValue('--ease-out').trim();
    const durations = {hero: 'narrative', section: 'ui', chart: 'narrative'};

    function cancel(el){
      const animation = animations.get(el);
      if(animation) animation.cancel();
      animations.delete(el);
    }
    function disabled(){
      return reduced.matches || document.hidden || root.hasAttribute('data-motion-paused');
    }
    function sync(){
      root.classList.toggle('is-page-hidden', document.hidden);
      if(disabled()) [...animations.keys()].forEach(cancel);
    }
    if(hero){
      const control = document.createElement('button');
      control.type = 'button';
      control.className = 'motion-toggle';
      control.setAttribute('aria-pressed', 'false');
      control.textContent = 'Hareketi durdur';
      control.addEventListener('click', () => {
        const paused = root.toggleAttribute('data-motion-paused');
        control.setAttribute('aria-pressed', String(paused));
        control.textContent = paused ? 'Hareketi sürdür' : 'Hareketi durdur';
        window.dispatchEvent(new Event('efe:motion-change'));
      });
      hero.querySelector('.hero-actions')?.append(control);
    }
    if('IntersectionObserver' in window && Element.prototype.animate){
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const el = entry.target;
          if(!entry.isIntersecting){ cancel(el); return; }
          if(seen.has(el)) return;
          seen.add(el);
          if(disabled() || el.contains(document.activeElement)) return;
          const kind = targets.get(el);
          const duration = parseFloat(styles.getPropertyValue(`--motion-${durations[kind]}`));
          // Content is visible by default, including without JS or observer support.
          const keyframes = kind === 'chart'
            ? [{opacity: 0.65}, {opacity: 1}]
            : [{opacity: 0.72, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}];
          const animation = el.animate(keyframes, {duration, easing});
          animations.set(el, animation);
          animation.onfinish = () => animations.delete(el);
        });
      }, {threshold: 0.15});
      targets.forEach((kind, el) => { el.dataset.motion = kind; observer.observe(el); });
    }
    document.addEventListener('focusin', event => {
      animations.forEach((animation, el) => { if(el.contains(event.target)) cancel(el); });
    });
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', sync);
    window.addEventListener('efe:motion-change', sync);
    sync();
  }

  function initResearchStory(){
    const story = document.getElementById('signal-to-decision');
    if(!story || !('IntersectionObserver' in window) || !('ResizeObserver' in window)) return;
    const mode = window.matchMedia('(min-width: 1000px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)');
    const steps = [...story.querySelectorAll('[data-story-step]')];
    const board = story.querySelector('.os-story-board');
    const layer = story.querySelector('[data-story-layer]');
    const counter = story.querySelector('[data-story-counter]');
    const markers = [...story.querySelectorAll('.os-story-track li')];
    let boundaries = [];
    let active = -1;
    let visible = false;
    let frame = 0;
    let measureFrame = 0;
    let fits = true;

    function selectStep(index){
      if(index === active) return;
      active = index;
      story.dataset.storyActive = String(index + 1);
      steps.forEach((step, i) => step.classList.toggle('is-current', i === index));
      markers.forEach((marker, i) => {
        marker.classList.toggle('is-current', i === index);
        if(i === index) marker.setAttribute('aria-current', 'step');
        else marker.removeAttribute('aria-current');
      });
      counter.textContent = `${String(index + 1).padStart(2, '0')} / 04`;
      const evidence = steps[index].querySelector('[data-story-evidence]').cloneNode(true);
      const title = document.createElement('p');
      title.className = 'os-story-board-title';
      title.textContent = steps[index].querySelector('h3').textContent;
      // The visual copy is aria-hidden; all four original articles remain readable.
      layer.replaceChildren(title, evidence);
    }

    function update(){
      frame = 0;
      if(!mode.matches || !fits || !visible || document.hidden) return;
      const position = window.scrollY + window.innerHeight * 0.45;
      let index = 0;
      boundaries.forEach((boundary, i) => { if(position >= boundary) index = i; });
      selectStep(index);
    }

    function scheduleUpdate(){
      if(mode.matches && fits && visible && !document.hidden && !frame) frame = requestAnimationFrame(update);
    }

    function measure(){
      measureFrame = 0;
      if(document.hidden) return;
      fits = true;
      story.classList.toggle('is-pinned', mode.matches);
      board.hidden = !mode.matches;
      if(!mode.matches){
        cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      // Read geometry only on initial layout / resize, never in the scroll handler.
      // Reserve the tallest layer so switching stages cannot shift the panel footer.
      layer.style.removeProperty('--story-layer-height');
      let height = 0;
      steps.forEach((step, i) => {
        active = -1;
        selectStep(i);
        height = Math.max(height, layer.scrollHeight);
      });
      layer.style.setProperty('--story-layer-height', `${height}px`);
      const top = parseFloat(getComputedStyle(board).top) || 0;
      fits = board.getBoundingClientRect().height + top + 24 <= window.innerHeight;
      if(!fits){
        story.classList.remove('is-pinned');
        board.hidden = true;
        return;
      }
      boundaries = steps.map(step => step.getBoundingClientRect().top + window.scrollY);
      active = -1;
      // Also resolve restored scroll positions before the visibility observer fires.
      let index = 0;
      const position = window.scrollY + window.innerHeight * 0.45;
      boundaries.forEach((boundary, i) => { if(position >= boundary) index = i; });
      selectStep(index);
      scheduleUpdate();
    }

    function scheduleMeasure(){
      if(!document.hidden && !measureFrame) measureFrame = requestAnimationFrame(measure);
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      story.classList.toggle('is-story-visible', visible && !document.hidden);
      if(visible) scheduleUpdate();
      else { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(story);
    // Body height changes include late content above the story and font reflow.
    let previousWidth = 0;
    let previousHeight = 0;
    const resizeObserver = new ResizeObserver(entries => {
      const {width, height} = entries[0].contentRect;
      if(width === previousWidth && height === previousHeight) return;
      previousWidth = width;
      previousHeight = height;
      scheduleMeasure();
    });
    resizeObserver.observe(document.body);
    window.addEventListener('scroll', scheduleUpdate, {passive: true});
    window.addEventListener('resize', scheduleMeasure, {passive: true});
    window.addEventListener('pageshow', scheduleMeasure);
    window.addEventListener('load', scheduleMeasure, {once: true});
    mode.addEventListener('change', scheduleMeasure);
    document.addEventListener('visibilitychange', () => {
      story.classList.toggle('is-story-visible', visible && !document.hidden);
      if(document.hidden){
        cancelAnimationFrame(frame);
        cancelAnimationFrame(measureFrame);
        frame = 0;
        measureFrame = 0;
      }else scheduleMeasure();
    });
    if(document.fonts) document.fonts.ready.then(scheduleMeasure);
    measure();
  }

  function init(){
    createMarketRail();
    observeShellHeight();
    updateClock();
    window.setInterval(updateClock, 30000);
    createSearchPalette();
    enhanceTables();
    initCapitalSimulator();
    initMotion();
    manageHeroMedia();
    initLazyWidgets();
    initPageTabs();
    initResearchStory();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
