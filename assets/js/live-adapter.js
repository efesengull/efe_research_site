/*
Efe Şengül Research - licensed quote adapter

The research universe and targets stay in data.js. When a same-origin,
licensed quote endpoint is configured, this adapter updates price-sensitive
fields and preserves the timestamp supplied by the provider.

Expected endpoint:
GET /api/quotes?symbols=GARAN,YKBNK,AKBNK,TUPRS,XU100

Accepted payloads:
{
  "GARAN": {"price": 135.90, "changePct": 1.24, "time": "2026-09-04T15:30:00+03:00"}
}

or:
{
  "quotes": [
    {"symbol": "GARAN", "price": 135.90, "time": "2026-09-04T15:30:00+03:00"}
  ]
}
*/

(function(){
  'use strict';

  const defaults = {
    provider: 'custom-api',
    endpoint: '',
    refreshMs: 60000,
    indexSymbol: 'XU100'
  };
  window.EFE_RESEARCH_LIVE_CONFIG = {
    ...defaults,
    ...(window.EFE_RESEARCH_LIVE_CONFIG || {})
  };

  let refreshTimer = 0;
  let controller = null;

  function formatTry(value){
    const number = Number(value);
    if(!Number.isFinite(number)) return '';
    return number.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' TL';
  }

  function formatIndex(value){
    const number = Number(value);
    if(!Number.isFinite(number)) return '';
    return number.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  function formatMarketValue(value, format){
    const number = Number(value);
    if(!Number.isFinite(number)) return '';
    if(format === 'fx'){
      return number.toLocaleString('tr-TR', {minimumFractionDigits: 4, maximumFractionDigits: 4});
    }
    if(format === 'fund'){
      return number.toLocaleString('tr-TR', {minimumFractionDigits: 4, maximumFractionDigits: 6}) + ' TL';
    }
    if(format === 'usd'){
      return number.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' USD';
    }
    return formatIndex(number);
  }

  function formatPercent(value){
    const number = Number(value);
    if(!Number.isFinite(number)) return '';
    return (number > 0 ? '+' : '') + number.toLocaleString('tr-TR', {maximumFractionDigits: 1}) + '%';
  }

  function formatMarketPercent(value){
    const number = Number(value);
    if(!Number.isFinite(number)) return '';
    const sign = number > 0 ? '+' : number < 0 ? '-' : '';
    return `${sign}%${Math.abs(number).toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }

  function formatDate(value){
    const date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Istanbul'
    }).format(date);
  }

  function formatTime(value){
    const date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Istanbul'
    }).format(date) + ' TSİ';
  }

  function formatDateTime(value = new Date()){
    const date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Istanbul'
    }).format(date);
  }

  function normalizeSymbol(symbol){
    return String(symbol || '')
      .replace(/^BIST:/i, '')
      .replace(/\.IS$/i, '')
      .trim()
      .toUpperCase();
  }

  function quotePrice(quote){
    return quote && (quote.price ?? quote.last ?? quote.close ?? quote.value ?? quote.lastPrice);
  }

  function quoteChange(quote){
    return quote && (quote.changePct ?? quote.changePercent ?? quote.percentChange ?? quote.dailyChange ?? quote.change);
  }

  function quoteMetric(quote, metric){
    if(!quote) return undefined;
    if(metric === 'high') return quote.high ?? quote.dayHigh ?? quote.sessionHigh;
    if(metric === 'low') return quote.low ?? quote.dayLow ?? quote.sessionLow;
    if(metric === 'previous') return quote.previous ?? quote.prevClose ?? quote.previousClose;
    return undefined;
  }

  function normalizeQuotes(payload){
    const source = payload && (payload.quotes || payload.data || payload);
    const entries = Array.isArray(source)
      ? source.map(item => [item.symbol || item.code || item.s, item])
      : Object.entries(source || {});

    return entries.reduce((quotes, [symbol, quote]) => {
      const normalized = normalizeSymbol(symbol || (quote && (quote.symbol || quote.code)));
      if(normalized) quotes[normalized] = quote;
      return quotes;
    }, {});
  }

  function researchData(){
    return window.EFE_RESEARCH_DATA || {};
  }

  function collectSymbols(){
    const symbols = new Set();
    document.querySelectorAll('[data-live-symbol]').forEach(element => {
      symbols.add(normalizeSymbol(element.dataset.liveSymbol));
    });
    (researchData().valuationData || []).forEach(item => symbols.add(normalizeSymbol(item.code)));
    (researchData().portfolio || []).forEach(item => symbols.add(normalizeSymbol(item.asset)));
    symbols.add(normalizeSymbol(window.EFE_RESEARCH_LIVE_CONFIG.indexSymbol));
    return [...symbols].filter(Boolean);
  }

  async function loadQuotes(symbols, signal){
    const config = window.EFE_RESEARCH_LIVE_CONFIG;
    if(!config.endpoint) return null;
    const url = new URL(config.endpoint, window.location.href);
    url.searchParams.set('symbols', symbols.join(','));
    const response = await fetch(url.toString(), {
      signal,
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {'Accept': 'application/json'}
    });
    if(!response.ok) throw new Error('Quote endpoint error: ' + response.status);
    return normalizeQuotes(await response.json());
  }

  function ensureStatus(){
    let status = document.querySelector('[data-live-status]');
    if(status) return status;
    status = document.createElement('div');
    status.className = 'live-data-status';
    status.dataset.liveStatus = '';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const actions = document.querySelector('.hero .hero-actions');
    if(actions) actions.insertAdjacentElement('afterend', status);
    else document.body.prepend(status);
    return status;
  }

  function setStatus(text, state){
    const status = ensureStatus();
    status.textContent = text;
    status.dataset.state = state;
    document.documentElement.dataset.feedState = state;
  }

  function setFeedLabel(text){
    document.querySelectorAll('[data-feed-label]').forEach(element => { element.textContent = text; });
  }

  function setLockText(lock, value){
    document.querySelectorAll(`[data-lock="${lock}"]`).forEach(element => { element.textContent = value; });
  }

  function setRiskClass(element, value){
    const target = element.closest('td') || element;
    target.classList.remove('risk-low', 'risk-mid', 'risk-high');
    if(value > 35) target.classList.add('risk-low');
    else if(value > 20) target.classList.add('risk-mid');
    else target.classList.add('risk-high');
  }

  function setMarketTone(element, value){
    const container = element.closest('.os-tape-item, .os-heat-cell');
    if(!container){
      element.classList.remove('is-up', 'is-down', 'is-flat');
      element.classList.add(value > 0 ? 'is-up' : value < 0 ? 'is-down' : 'is-flat');
      return;
    }
    if(container.classList.contains('os-heat-cell')){
      container.classList.remove('is-positive', 'is-negative', 'is-flat');
      container.classList.add(value > 0 ? 'is-positive' : value < 0 ? 'is-negative' : 'is-flat');
      container.style.setProperty('--heat', Math.max(.16, Math.min(1, Math.abs(value) / 2.2)).toFixed(2));
      return;
    }
    container.classList.remove('is-up', 'is-down', 'is-flat');
    container.classList.add(value > 0 ? 'is-up' : value < 0 ? 'is-down' : 'is-flat');
  }

  function updateFields(quotes){
    let latestProviderTime = null;

    document.querySelectorAll('[data-live-symbol]').forEach(element => {
      const quote = quotes[normalizeSymbol(element.dataset.liveSymbol)];
      if(!quote) return;
      const price = Number(quotePrice(quote));
      const change = Number(quoteChange(quote));
      const rawTime = quote.time || quote.timestamp || quote.updatedAt;
      if(rawTime){
        const time = new Date(rawTime);
        if(!Number.isNaN(time.getTime()) && (!latestProviderTime || time > latestProviderTime)) latestProviderTime = time;
      }

      if(element.dataset.liveField === 'price' && Number.isFinite(price)){
        element.textContent = formatTry(price);
        element.classList.add('live-updated');
      }

      if(element.dataset.liveField === 'market-price' && Number.isFinite(price)){
        element.textContent = formatMarketValue(price, element.dataset.liveFormat);
        element.classList.add('live-updated');
      }

      if(element.dataset.liveField === 'change' && Number.isFinite(change)){
        element.textContent = formatMarketPercent(change);
        setMarketTone(element, change);
        element.classList.add('live-updated');
      }

      if(['high', 'low', 'previous'].includes(element.dataset.liveField)){
        const metric = Number(quoteMetric(quote, element.dataset.liveField));
        if(Number.isFinite(metric)){
          element.textContent = formatIndex(metric);
          element.classList.add('live-updated');
        }
      }

      if(element.dataset.liveField === 'upside' && Number.isFinite(price)){
        const target = Number(element.dataset.liveTarget);
        if(Number.isFinite(target) && price > 0){
          const upside = ((target - price) / price) * 100;
          element.textContent = formatPercent(upside);
          setRiskClass(element, upside);
          element.classList.add('live-updated');
        }
      }

      if(element.dataset.liveField === 'amount'){
        const directAmount = Number(quote.marketValue ?? quote.amount ?? quote.portfolioValue);
        const baseAmount = Number(element.dataset.liveBaseAmount);
        const basePrice = Number(element.dataset.liveBasePrice);
        const amount = Number.isFinite(directAmount)
          ? directAmount
          : Number.isFinite(price) && Number.isFinite(baseAmount) && Number.isFinite(basePrice) && basePrice > 0
            ? baseAmount * (price / basePrice)
            : NaN;
        if(Number.isFinite(amount)){
          element.textContent = formatTry(amount);
          element.classList.add('live-updated');
        }
      }
    });

    const indexSymbol = normalizeSymbol(window.EFE_RESEARCH_LIVE_CONFIG.indexSymbol);
    const indexQuote = quotes[indexSymbol] || quotes.BIST100 || quotes.XU100;
    const indexPrice = Number(quotePrice(indexQuote));
    if(Number.isFinite(indexPrice)) setLockText('bistReference', formatIndex(indexPrice));
    const indexChange = Number(quoteChange(indexQuote));
    if(Number.isFinite(indexChange)) setLockText('bistDailyChange', formatMarketPercent(indexChange));
    ['high', 'low', 'previous'].forEach(metric => {
      const value = Number(quoteMetric(indexQuote, metric));
      const lock = metric === 'high' ? 'bistHigh' : metric === 'low' ? 'bistLow' : 'bistPrevious';
      if(Number.isFinite(value)) setLockText(lock, formatIndex(value));
    });

    const receivedAt = new Date();
    const effectiveTime = latestProviderTime || receivedAt;
    const timeLabel = latestProviderTime ? 'sağlayıcı zamanı' : 'API alım zamanı';
    setLockText('marketReferenceDate', `${formatDate(effectiveTime)} · ${timeLabel}`);
    setLockText('marketReferenceTime', formatTime(effectiveTime));
    setFeedLabel('Lisanslı API modu');
    setStatus(`Canlı veri güncellendi · ${formatDateTime(effectiveTime)}`, 'live');
  }

  function setStaticMode(){
    const lock = typeof DATA_LOCK !== 'undefined' ? DATA_LOCK : {};
    if(lock.dataDate) setLockText('dataDate', lock.dataDate);
    if(lock.marketReferenceDate) setLockText('marketReferenceDate', lock.marketReferenceDate);
    setFeedLabel('Statik araştırma modu');
    setStatus('Lisanslı fiyat API’si bağlı değil · tarihli araştırma snapshot’ı gösteriliyor', 'static');
  }

  function scheduleNext(){
    window.clearTimeout(refreshTimer);
    const config = window.EFE_RESEARCH_LIVE_CONFIG;
    const refreshMs = Math.max(15000, Number(config.refreshMs) || defaults.refreshMs);
    if(config.endpoint && !document.hidden){
      refreshTimer = window.setTimeout(refreshLiveData, refreshMs);
    }
  }

  async function refreshLiveData(){
    const config = window.EFE_RESEARCH_LIVE_CONFIG;
    if(!config.endpoint){
      setStaticMode();
      return;
    }

    if(controller) controller.abort();
    controller = new AbortController();
    try{
      setFeedLabel('Veri yenileniyor');
      setStatus('Lisanslı veri yenileniyor…', 'loading');
      const quotes = await loadQuotes(collectSymbols(), controller.signal);
      if(!quotes || !Object.keys(quotes).length) throw new Error('Quote payload is empty');
      updateFields(quotes);
    }catch(error){
      if(error.name !== 'AbortError'){
        console.warn('Live adapter:', error);
        setFeedLabel('API bağlantı hatası');
        setStatus('Canlı veri alınamadı · son doğrulanmış değerler korunuyor', 'error');
      }
    }finally{
      controller = null;
      scheduleNext();
    }
  }

  function handleVisibility(){
    if(document.hidden){
      window.clearTimeout(refreshTimer);
      if(controller) controller.abort();
    }else{
      refreshLiveData();
    }
  }

  function init(){
    refreshLiveData();
    document.addEventListener('visibilitychange', handleVisibility);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();

  window.EFE_RESEARCH_REFRESH_LIVE_DATA = refreshLiveData;
  window.loadQuotes = symbols => loadQuotes(symbols, undefined);
})();
