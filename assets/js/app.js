function money(n){
  return new Intl.NumberFormat('tr-TR').format(n) + ' TL';
}

function tryMoney(n){
  if(n === null || n === undefined || n === '') return '';
  const value = Number(n);
  if(!Number.isFinite(value)) return '';
  return value.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' TL';
}

function fundPrice(n){
  if(n === null || n === undefined || n === '') return '—';
  const value = Number(n);
  if(!Number.isFinite(value)) return '—';
  return value.toLocaleString('tr-TR', {minimumFractionDigits:4, maximumFractionDigits:6}) + ' TL';
}

function pct(n){
  return (n > 0 ? '+' : '') + n.toLocaleString('tr-TR', {maximumFractionDigits:1}) + '%';
}

function byId(id){
  return document.getElementById(id);
}

function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

function parseTrNumber(value){
  if(typeof value === 'number') return value;
  if(!value) return NaN;
  return Number(String(value).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
}

function basePriceForAsset(asset){
  const item = valuationData.find(v => v.code === asset);
  const price = parseTrNumber(item && item.price);
  if(Number.isFinite(price)) return price;
  const fund = funds.find(f => f.code === asset);
  return Number.isFinite(fund && fund.price) ? fund.price : '';
}

function formatDateTR(date = new Date(), withTime = false){
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Istanbul'
  };
  if(withTime){
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return new Intl.DateTimeFormat('tr-TR', options).format(date);
}

function formatMonthTR(date = new Date()){
  return new Intl.DateTimeFormat('tr-TR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Istanbul'
  }).format(date);
}

function lockValue(key){
  if(key === 'dataDate') return `${DATA_LOCK.dataDate} · rapor snapshot'ı`;
  if(key === 'marketReferenceDate') return `${DATA_LOCK.marketReferenceDate} · kapanış snapshot'ı`;
  return DATA_LOCK[key] || '';
}

function renderLock(){
  document.querySelectorAll('[data-lock]').forEach(el => {
    el.textContent = lockValue(el.dataset.lock);
  });
}

function scoreClass(risk){
  const level = Number.parseInt(risk, 10);
  if(risk.includes('Düşük') || (Number.isFinite(level) && level <= 2)) return 'risk-low';
  if(risk.includes('Yüksek') || (Number.isFinite(level) && level >= 6)) return 'risk-high';
  return 'risk-mid';
}

function stockRows(list = stocks){
  return list.map(s => `
    <tr>
      <td><b>${s.rank}</b></td>
      <td><b>${s.code}</b><br><span class="muted">${s.name}</span></td>
      <td>${s.theme}</td>
      <td class="${scoreClass(s.risk)}">${s.risk}</td>
      <td class="score">${s.score.toFixed(1)}</td>
      <td>${s.role}</td>
      <td>${s.decision}</td>
    </tr>
  `).join('');
}

function fundRows(list = funds){
  return list.map(f => `
    <tr>
      <td><b>${f.rank}</b></td>
      <td><b>${f.code}</b><br><span class="muted">${f.name}</span></td>
      <td data-live-symbol="${f.code}" data-live-field="market-price" data-live-format="fund">${fundPrice(f.price)}</td>
      <td class="${f.change > 0 ? 'risk-low' : f.change < 0 ? 'risk-high' : ''}"><b data-live-symbol="${f.code}" data-live-field="change">${f.change === null ? '—' : signedPct(f.change)}</b><br><span class="muted">${f.priceDate}</span></td>
      <td>${f.type}</td>
      <td class="${scoreClass(f.risk)}">${f.risk}</td>
      <td>${f.fee}</td>
      <td>${f.tax}</td>
      <td>${f.valor}</td>
      <td>${f.role}</td>
    </tr>
  `).join('');
}

function portfolioRows(){
  return portfolio.map(p => `
    <tr data-live-row="${p.asset}" data-weight="${p.weight}">
      <td><b>${p.asset}</b></td>
      <td>${p.theme}</td>
      <td>${p.weight}%<div class="bar"><i style="width:${clamp(p.weight * 10, 0, 100)}%"></i></div></td>
      <td><span data-model-amount data-weight="${p.weight}" data-live-symbol="${p.asset}" data-live-field="amount" data-live-base-amount="${p.amount}" data-live-base-price="${basePriceForAsset(p.asset)}" data-static-value="${money(p.amount)}">${money(p.amount)}</span></td>
    </tr>
  `).join('');
}

function valuationRows(){
  return valuationData.map(v => {
    const decision = v.decision.toLocaleLowerCase('tr-TR');
    const decisionTone = decision.includes('izle') || decision.includes('tut') ? 'blue' : 'green';
    return `
      <tr data-live-row="${v.code}">
        <td><b>${v.code}</b><br><span class="muted">${v.name}</span></td>
        <td data-live-symbol="${v.code}" data-live-field="price" data-static-value="${v.price}">${v.price}</td>
        <td>${v.target}</td>
        <td class="${v.upside > 35 ? 'risk-low' : v.upside > 20 ? 'risk-mid' : 'risk-high'}"><b data-live-symbol="${v.code}" data-live-field="upside" data-live-target="${parseTrNumber(v.target)}" data-static-value="${pct(v.upside)}">${pct(v.upside)}</b></td>
        <td>${v.method}</td>
        <td>${v.multiples}</td>
        <td><span class="tag ${decisionTone}">${v.decision}</span><br><span class="muted">${v.source}</span></td>
      </tr>
    `;
  }).join('');
}

function scenarioRows(){
  return scenarios.map(s => `
    <tr>
      <td><b>${s.name}</b></td>
      <td>${pct(s.gross)}</td>
      <td>${pct(s.net)}</td>
      <td>${s.note}</td>
    </tr>
  `).join('');
}

function stockDetailCards(){
  return stocks.map(s => `
    <article class="card">
      <span class="tag">${s.code}</span>
      <h3>${s.name}</h3>
      <p class="muted">${s.role}</p>
      <p class="muted">Araştırma skoru: ${s.score.toFixed(1)} / 10</p>
      <div class="bar" aria-hidden="true"><i style="width:${clamp(s.score * 10, 0, 100)}%"></i></div>
      <p style="margin-top:14px"><b>Doğrulanmış veri:</b> ${s.verified}</p>
      <p style="margin-top:10px"><b>Tez:</b> ${s.strengths}</p>
      <p style="margin-top:10px"><b>Risk:</b> ${s.risks}</p>
      <p style="margin-top:10px"><b>Senaryo:</b> İyimser ${pct(s.bull)} · Baz ${pct(s.base)} · Kötümser ${pct(s.bear)}</p>
    </article>
  `).join('');
}

function sourceRows(){
  return sources.map(s => `
    <div class="source">
      <div><b>${s.code} · ${s.name}</b><br><span class="muted">${s.use}</span></div>
      <a href="${s.url}" target="_blank" rel="noopener">Kaynak<span class="sr-only">: ${s.code} · ${s.name} (yeni sekme)</span></a>
    </div>
  `).join('');
}

function portfolioBars(){
  return portfolio.map(p => `
    <div class="allocation-row">
      <div>
        <b title="${p.asset}">${p.asset}</b>
        <small>${p.theme} · <span data-model-amount data-weight="${p.weight}" data-live-symbol="${p.asset}" data-live-field="amount" data-live-base-amount="${p.amount}" data-live-base-price="${basePriceForAsset(p.asset)}" data-static-value="${money(p.amount)}">${money(p.amount)}</span></small>
      </div>
      <div class="allocation-track" aria-hidden="true"><i style="width:${clamp(p.weight * 10, 0, 100)}%"></i></div>
      <strong>${p.weight}%</strong>
    </div>
  `).join('');
}

function themeBars(){
  const agg = {};
  portfolio.forEach(p => {
    agg[p.theme] = (agg[p.theme] || 0) + p.weight;
  });
  return Object.entries(agg).sort((a,b) => b[1] - a[1]).map(([k,v]) => `
    <div class="allocation-row">
      <div>
        <b title="${k}">${k}</b>
        <small>${v >= 10 ? 'Ana tema' : 'Tamamlayıcı tema'}</small>
      </div>
      <div class="allocation-track" aria-hidden="true"><i style="width:${clamp(v * 10, 0, 100)}%"></i></div>
      <strong>${v}%</strong>
    </div>
  `).join('');
}

function marketCockpitCards(){
  return marketCockpit.map(item => `
    <article class="cockpit-card ${item.tone}">
      <span>${item.label}</span>
      <b>${item.value}</b>
      <p>${item.detail}</p>
    </article>
  `).join('');
}

function signedPct(value, digits = 2){
  if(value === null || value === undefined) return 'Referans';
  const number = Number(value);
  return `${number > 0 ? '+' : number < 0 ? '-' : ''}%${Math.abs(number).toLocaleString('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })}`;
}

function marketTapeRows(){
  return marketTape.map(item => {
    const direction = item.change > 0 ? 'is-up' : item.change < 0 ? 'is-down' : 'is-flat';
    const format = item.code === 'USDTRY' || item.code === 'EURTRY' ? 'fx' : item.code === 'BRENT' ? 'usd' : 'index';
    return `
      <a class="os-tape-item ${direction}" href="live.html#monitor">
        <span class="sr-only">${item.label}</span>
        <span><i aria-hidden="true"></i>${item.code}</span>
        <b data-live-symbol="${item.code}" data-live-field="market-price" data-live-format="${format}">${item.value}</b>
        <em data-live-symbol="${item.code}" data-live-field="change">${signedPct(item.change)}</em>
      </a>
    `;
  }).join('');
}

function marketHeatmapCards(){
  return marketSnapshot.map((item, index) => {
    const intensity = clamp(Math.abs(item.change) / 2.2, .16, 1).toFixed(2);
    const span = index < 2 ? 2 : 1;
    return `
      <article class="os-heat-cell is-${item.tone}" style="--heat:${intensity};grid-column:span ${span}" tabindex="0" data-live-row="${item.code}">
        <div><b>${item.code}</b><span>${item.name}</span></div>
        <strong data-live-symbol="${item.code}" data-live-field="market-price" data-live-format="stock">${tryMoney(item.price).replace(' TL', '')}</strong>
        <em data-live-symbol="${item.code}" data-live-field="change">${signedPct(item.change)}</em>
      </article>
    `;
  }).join('');
}

function signalLadderRows(){
  return valuationData
    .slice()
    .sort((a, b) => b.upside - a.upside)
    .slice(0, 5)
    .map((item, index) => `
      <a class="os-signal-row" href="report.html#valuation" data-live-row="${item.code}">
        <span class="os-signal-rank">${String(index + 1).padStart(2, '0')}</span>
        <span class="os-signal-copy"><b>${item.code}</b><small><span data-live-symbol="${item.code}" data-live-field="price">${item.price}</span> → ${item.target}</small></span>
        <span class="os-signal-meter" aria-hidden="true"><i style="width:${clamp(item.upside / .8, 4, 100)}%"></i></span>
        <strong data-live-symbol="${item.code}" data-live-field="upside" data-live-target="${parseTrNumber(item.target)}" data-static-value="${pct(item.upside)}">${pct(item.upside)}</strong>
      </a>
    `).join('');
}

function platformModuleCards(){
  return platformModules.map((item, i) => `
    <article class="module-card">
      <span>${String(i + 1).padStart(2, '0')}</span>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `).join('');
}

function riskIndicatorCards(){
  return riskIndicators.map(item => `
    <article class="risk-gauge">
      <div class="risk-gauge-top">
        <span>${item.label}</span>
        <b>${item.status}</b>
      </div>
      <div class="gauge-track"><i style="width:${clamp(item.value * 3.2, 6, 100)}%"></i></div>
      <p><strong>%${item.value}</strong> · ${item.detail}</p>
    </article>
  `).join('');
}

function analysisFeedRows(){
  return analysisFeed.map(item => `
    <article class="feed-item">
      <span class="tag blue">${item.label}</span>
      <h3>${item.title}</h3>
      <p>${item.meta}</p>
    </article>
  `).join('');
}

function fundComparisonRows(){
  return fundComparison.map(item => `
    <tr>
      <td><b>${item.code}</b></td>
      <td>${item.role}</td>
      <td>${item.profile}</td>
      <td>${item.liquidity}</td>
      <td>${item.protection}</td>
    </tr>
  `).join('');
}

function apiStepCards(){
  return apiSteps.map((item, i) => `
    <article class="process-step">
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `).join('');
}

function insightCardRows(){
  return insightCards.map((item, i) => `
    <article class="card feature-card">
      <div class="feature-icon">${i + 1}</div>
      <span class="tag ${i % 2 ? 'blue' : 'green'}">${item.label}</span>
      <div>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
      </div>
    </article>
  `).join('');
}

function correctionRows(){
  return correctionHighlights.map(item => `
    <tr>
      <td>${item.before}</td>
      <td><b>${item.after}</b></td>
      <td>${item.impact}</td>
    </tr>
  `).join('');
}

function valuationCards(){
  return valuationData
    .slice()
    .sort((a,b) => b.upside - a.upside)
    .slice(0,4)
    .map(v => {
      const label = v.decision.split('/')[0].trim();
      const tone = label.toLocaleLowerCase('tr-TR').includes('izle') ? 'blue' : 'green';
      return `
        <article class="valuation-card" data-live-row="${v.code}">
          <div class="code"><b>${v.code}</b><span class="tag ${tone}">${label}</span></div>
          <b class="value" data-live-symbol="${v.code}" data-live-field="upside" data-live-target="${parseTrNumber(v.target)}" data-static-value="${pct(v.upside)}">${pct(v.upside)}</b>
          <small><span data-live-symbol="${v.code}" data-live-field="price" data-static-value="${v.price}">${v.price}</span> → ${v.target}</small>
          <small>${v.method}</small>
        </article>
      `;
    }).join('');
}

function decisionRuleCards(){
  return decisionRules.map(rule => `
    <article class="card">
      <span class="tag ${rule.tone}">${rule.status}</span>
      <h3>${rule.metric}</h3>
      <p>${rule.action}</p>
    </article>
  `).join('');
}

function scoringRows(){
  return scoringModel.map(row => `
    <tr>
      <td><b>${row.title}</b></td>
      <td>${row.weight}</td>
      <td>${row.detail}</td>
    </tr>
  `).join('');
}

function qualityCards(){
  return qualityScores.map(item => `
    <article class="quality-card">
      <b>${item.score}</b>
      <span><strong>${item.metric}</strong><br>${item.detail}</span>
    </article>
  `).join('');
}

function sourcePriorityCards(){
  return sourcePriority.map(item => `
    <article class="source-level">
      <span class="tag ${item.level === 'D' ? 'red' : item.level.startsWith('A') ? 'green' : 'blue'}">${item.level}</span>
      <div>
        <h3>${item.title}</h3>
        <p>${item.use}</p>
        <p style="margin-top:8px"><b>Örnek:</b> ${item.example}</p>
      </div>
    </article>
  `).join('');
}

function liveModeCards(){
  return liveModes.map((mode, i) => `
    <article class="card">
      <span class="tag ${i ? 'blue' : 'green'}">${i + 1}. mod</span>
      <h3>${mode.title}</h3>
      <p>${mode.body}</p>
    </article>
  `).join('');
}

function corrColor(value){
  const abs = Math.abs(value);
  if(value < 0) return `rgba(39,110,232,${0.10 + abs * 0.36})`;
  if(value >= .75) return `rgba(11,128,106,${0.20 + abs * 0.42})`;
  if(value >= .35) return `rgba(227,180,95,${0.16 + abs * 0.28})`;
  return `rgba(101,114,130,${0.10 + abs * 0.22})`;
}

function correlationRows(){
  return modelCorrelationMatrix.map((row, rowIndex) => `
    <tr>
      ${row.map((cell, colIndex) => {
        if(rowIndex === 0 || colIndex === 0) return `<th scope="${rowIndex === 0 ? 'col' : 'row'}">${cell}</th>`;
        const value = Number(cell);
        return `<td><span class="correlation-cell" style="background:${corrColor(value)}">${value.toFixed(2)}</span></td>`;
      }).join('')}
    </tr>
  `).join('');
}

function bindFilters(){
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.classList.contains('active')));
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      const f = btn.dataset.filter;
      const rows = f === 'all' ? stocks : stocks.filter(s => s.theme.includes(f));
      if(byId('stock-table')){
        byId('stock-table').innerHTML = stockRows(rows);
        window.dispatchEvent(new CustomEvent('efe:table-updated', {detail: {tableId: 'stock-table'}}));
      }
    });
  });
}

function bindMobileNav(){
  const toggle = document.querySelector('.nav-toggle');
  if(!toggle) return;
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menüyü aç');
  };
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  document.querySelectorAll('.links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && document.body.classList.contains('menu-open')){
      if(document.querySelector('.links').contains(document.activeElement)) toggle.focus();
      closeMenu();
    }
  });
}

function bindTradingViewPlaceholders(){
  document.querySelectorAll('.live-box').forEach(box => {
    const markLoaded = () => {
      box.querySelectorAll('iframe').forEach(frame => {
        if(!frame.title) frame.title = box.parentElement.querySelector('h2')?.textContent || box.closest('section')?.querySelector('h2')?.textContent || 'TradingView piyasa monitörü';
      });
      if(box.querySelector('iframe')) box.classList.add('is-loaded');
    };
    markLoaded();
    if(typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(markLoaded);
    observer.observe(box, {childList: true, subtree: true});
  });
}

function publishPageReady(){
  window.EFE_RESEARCH_RENDER_LOCKS = renderLock;
  window.dispatchEvent(new CustomEvent('efe:page-ready'));
}

function renderResearchStory(){
  const story = byId('signal-to-decision');
  if(!story) return;
  const quote = marketSnapshot.find(item => item.code === 'GARAN');
  const valuation = valuationData.find(item => item.code === 'GARAN');
  const stock = stocks.find(item => item.code === 'GARAN');
  const allocation = portfolio.find(item => item.asset === 'GARAN');
  const bank = riskIndicators.find(item => item.label === 'Banka yoğunluğu');
  if(!quote || !valuation || !stock || !allocation || !bank) return;

  // Deliberately use the locked research set; live-adapter hooks do not belong here.
  const values = {
    price: tryMoney(quote.price),
    change: signedPct(quote.change),
    index: DATA_LOCK.bistReference,
    indexChange: DATA_LOCK.bistDailyChange,
    marketDate: `${DATA_LOCK.marketReferenceDate} · ${DATA_LOCK.marketReferenceTime}`,
    reportDate: `${DATA_LOCK.dataDate} · rapor snapshot’ı`,
    marketSource: sources.find(item => item.code === 'S7').name,
    indexSource: sources.find(item => item.code === 'S9').name,
    target: valuation.target,
    upside: pct(valuation.upside),
    method: valuation.method,
    multiples: valuation.multiples,
    valuationSource: valuation.source,
    risks: stock.risks,
    risk: stock.risk,
    bankWeight: `%${bank.value.toLocaleString('tr-TR')}`,
    bankStatus: bank.status,
    bankRule: bank.detail,
    weight: `%${allocation.weight.toLocaleString('tr-TR')}`,
    decision: valuation.decision,
    role: stock.role,
    amount: money(allocation.amount),
    capital: money(portfolio.reduce((sum, item) => sum + item.amount, 0))
  };
  story.querySelectorAll('[data-story-value]').forEach(el => {
    if(values[el.dataset.storyValue] !== undefined) el.textContent = values[el.dataset.storyValue];
  });
  const priceRatio = quote.price / parseTrNumber(valuation.target) * 100;
  if(Number.isFinite(priceRatio)){
    story.querySelector('[data-story-price-bar]').style.setProperty('--story-fill', `${clamp(priceRatio, 0, 100)}%`);
  }
  story.querySelector('[data-story-risk-bar]').style.setProperty('--story-fill', `${clamp(bank.value, 0, 100)}%`);
}

function initPage(){
  renderLock();
  renderResearchStory();
  if(byId('insight-cards')) byId('insight-cards').innerHTML = insightCardRows();
  if(byId('correction-table')) byId('correction-table').innerHTML = correctionRows();
  if(byId('valuation-cards')) byId('valuation-cards').innerHTML = valuationCards();
  if(byId('decision-rules')) byId('decision-rules').innerHTML = decisionRuleCards();
  if(byId('scoring-table')) byId('scoring-table').innerHTML = scoringRows();
  if(byId('quality-cards')) byId('quality-cards').innerHTML = qualityCards();
  if(byId('source-priority')) byId('source-priority').innerHTML = sourcePriorityCards();
  if(byId('live-modes')) byId('live-modes').innerHTML = liveModeCards();
  if(byId('market-cockpit')) byId('market-cockpit').innerHTML = marketCockpitCards();
  if(byId('market-tape')) byId('market-tape').innerHTML = marketTapeRows();
  if(byId('market-heatmap')) byId('market-heatmap').innerHTML = marketHeatmapCards();
  if(byId('signal-ladder')) byId('signal-ladder').innerHTML = signalLadderRows();
  if(byId('platform-modules')) byId('platform-modules').innerHTML = platformModuleCards();
  if(byId('risk-indicators')) byId('risk-indicators').innerHTML = riskIndicatorCards();
  if(byId('analysis-feed')) byId('analysis-feed').innerHTML = analysisFeedRows();
  if(byId('fund-comparison')) byId('fund-comparison').innerHTML = fundComparisonRows();
  if(byId('api-steps')) byId('api-steps').innerHTML = apiStepCards();
  if(byId('stock-table')) byId('stock-table').innerHTML = stockRows();
  if(byId('fund-table')) byId('fund-table').innerHTML = fundRows();
  if(byId('portfolio-table')) byId('portfolio-table').innerHTML = portfolioRows();
  if(byId('valuation-table')) byId('valuation-table').innerHTML = valuationRows();
  if(byId('scenario-table')) byId('scenario-table').innerHTML = scenarioRows();
  if(byId('stock-detail-cards')) byId('stock-detail-cards').innerHTML = stockDetailCards();
  if(byId('source-list')) byId('source-list').innerHTML = sourceRows();
  if(byId('portfolio-bars')) byId('portfolio-bars').innerHTML = portfolioBars();
  if(byId('theme-bars')) byId('theme-bars').innerHTML = themeBars();
  if(byId('correlation-table')) byId('correlation-table').innerHTML = correlationRows();
  bindFilters();
  bindMobileNav();
  bindTradingViewPlaceholders();
  publishPageReady();
}

document.addEventListener('DOMContentLoaded', initPage);
