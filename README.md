# Efe Şengül Research - BIST Karar Destek Merkezi

Kaynak kontrollü BIST araştırmasını, değerleme snapshot'ını, etkileşimli model portföyü, piyasa monitörlerini ve metodoloji katmanını tek bir statik araştırma terminalinde birleştirir. Build sistemi gerektirmez.

## İçerik

- `index.html` - ana sayfa / araştırma terminali
- `live.html` - TradingView widget destekli canlı piyasa panosu
- `report.html` - son BIST raporunun web versiyonu
- `portfolio.html` - model portföy, senaryo ve korelasyon bölümü
- `methodology.html` - kaynak sistemi, API mimarisi ve korelasyon hesap yöntemi
- `downloads/` - Word raporu indirme alanı
- `assets/js/data.js` - rapor verileri ve ortak içerik
- `assets/css/research-os.css` - ortak Research OS arayüz katmanı, masaüstü terminal kabuğu ve responsive kurallar
- `assets/js/finance-3d-background.js` - hero alanlarında çalışan performans kontrollü canvas veri/market arka planı
- `assets/js/platform-ui.js` - platform saati, seans göstergesi, global varlık araması, tablo araçları ve portföy simülatörü
- `assets/js/live-adapter.js` - lisanslı, aynı origin quote endpoint'ine bağlanan canlı veri adaptörü
- `assets/img/finance-depth-poster.webp` - video/canvas kullanılamadığında gösterilen optimize 3D finans sahnesi

## Nasıl açılır?

TradingView widgetları ve `fetch` tabanlı API modu için siteyi HTTP üzerinden çalıştırın:

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000/index.html` adresini açabilirsiniz. TradingView widgetları için internet bağlantısı gerekir.

## Görsel sistem

Hero alanlarında optimize WebM video, özel 3D poster ve build sistemi gerektirmeyen canvas tabanlı finansal veri ağı birlikte çalışır. Perspektif market grid'i, risk yörüngesi ve sayfaya göre değişen analitik sahneler içerik altında düşük opaklıkta tutulur. `prefers-reduced-motion` aktifse video durur ve canvas tek kare statik görünüme düşer. Mobilde video kapatılır, poster statik katman olarak kalır ve node/panel sayısı azaltılır. Sekme arka plana geçtiğinde veya hero görünüm dışına çıktığında animasyon döngüsü durur.

Faz 1 ortak tasarım kararları `assets/css/styles.css` içindeki semantik token'larda tutulur. `research-os.css`, eski `--os-*` isimlerini bu token'lara bağlar ve sayfa kompozisyonunu yönetir. Yeni bileşenlerde aynı renk, tipografi, boşluk, radius ve hareket token'larını kullanın; ayrı bir tema paleti oluşturmayın. Kullanım kuralları ve doğrulama sonuçları: [Faz 1 tasarım sistemi](docs/phase-1.md).

Beş sayfanın ortak asset sürümü `3.5.0`'dır. Bu sürüm önbellek içindir; finansal snapshot'ın `DATA_LOCK.version` değeriyle aynı olmak zorunda değildir.

Faz 2, ana sayfadaki **Sinyalden Karara** bölümüdür. GARAN örneğinde piyasa sinyali, değerleme, risk analizi ve portföy kararı aynı tarihli araştırma setinden okunur. Yeterli ekran alanında doğal kaydırmaya eşlik eden sabit panel kullanılır; mobilde, kısa ekranda ve reduced-motion altında dört aşama sıralı görünür. JavaScript veya observer desteği olmadan da anlatım ve veriler erişilebilirdir. Kararlar ve kanıtlar: [Faz 2 raporu](docs/phase-2.md).

Faz 3; tek seferlik hero/bölüm girişleri, kısa grafik vurguları, klavye/dokunma tepkileri ve bölüm ilerleme göstergesidir. Hero'daki kontrol video ve Canvas hareketini durdurur. Sayfa geçişleri destekleyen tarayıcılarda kısa bir solma kullanır; reduced-motion altında kapalıdır. Ortak scriptler aynı sırayla head içinde `defer` çalışır; `platform-ui.js` üzerindeki `blocking="render"`, geçiş dinleyicisini ilk çizimden önce hazırlar. Kararlar ve kanıtlar: [Faz 3 raporu](docs/phase-3.md).

Faz 4 değerlendirmesinde WebGL eklenmedi. Mevcut Canvas 2D perspektifi, CSS anlatım katmanları ve SVG mevcut ihtiyacı karşılıyor. Canvas/video/poster arızası, DPR sınırı, mobil sadeleşme ve statik alternatifler doğrulandı; uygulama dosyaları ve `3.4.0` asset sürümü korundu. Karar, yerel ölçümler ve sınırlar: [Faz 4 raporu](docs/phase-4.md).

Faz 5, dekoratif Canvas çizimini en fazla 30/s ile sınırlar; hareket hızı geçen zamandan hesaplanır. Mobil/kısa sahnelerde ve düşük kapasite sinyali olan cihazlarda DPR üst sınırı 1,25, diğerlerinde 1,8'dir. Video görünürlük kararı verilmeden ve veri tasarrufu açıkken başlamaz. TradingView scriptleri mevcut yapılandırmalarıyla kutuya 160 px yaklaşınca bir kez yüklenir; observer desteği yoksa doğrudan yüklenir. Ölçümler ve sınırlar: [Faz 5 raporu](docs/phase-5.md).

## Faz 5 performans doğrulaması

```powershell
node tests/performance.test.js
$env:TEST_OUTPUT_DIR='docs/phase-5/regression'
node tests/research-story.test.js
$env:TEST_OUTPUT_DIR='docs/phase-5/motion'
node tests/motion-system.test.js
$env:TEST_OUTPUT_DIR='docs/phase-5/depth'
node tests/depth-background.test.js
Remove-Item Env:TEST_OUTPUT_DIR
```

Performans testi, her sayfa için masaüstü/mobilde üçer yeni tarayıcı oturumu açar; 4× CPU yavaşlatması, DPR 3 ve yerel ağ kullanır. LCP, başlangıç CLS, uzun görevler, Canvas çizim/işlem süresi, ana iş parçacığı süresi ve üçüncü taraf isteklerini kaydeder. Harici ağ engellidir; widget yaşam döngüsü açıkça test fixture'ı olan bir script ile kontrol edilir. `PERF_FUNCTIONAL_ONLY=1` yalnızca davranış kontrollerini çalıştırır. Bunlar saha Core Web Vitals, GPU veya pil ölçümü değildir.

Başlangıç kaydı `a3135e3` commit'inde, uygulama değişmeden `PERF_STAGE=before` ile alındı. Güncel kodda `before` etiketini kullanmak eski sürümü kendiliğinden yüklemez. Önce/sonra kayıtlarını ezmeden yeni ölçüm almak için farklı `TEST_OUTPUT_DIR` kullanın.

Gerçek TradingView ağına izin veren ayrı tanı:

```powershell
$env:REAL_THIRD_PARTY='1'
node tests/third-party-performance.test.js
Remove-Item Env:REAL_THIRD_PARTY
```

Bu betik başlangıç dosyalarını Git'teki `a3135e3` üzerinden salt okunur sunar; checkout'u değiştirmez. Her görünüm/sürüm için tek ağ örneğidir; sağlayıcı erişimi ve değişken ağ koşulları nedeniyle otomatik başarı veya zaman kazancı iddiası taşımaz. Varsayılan çıktı `docs/phase-5/third-party/`; ilk engelli deneme burada, ağ erişimli tamamlanan ölçüm `TEST_OUTPUT_DIR` kullanılarak `docs/phase-5/third-party-network/` altında korunmuştur.

## Faz 2 regresyonu ve Faz 3 doğrulaması

```powershell
Get-ChildItem assets/js/*.js | ForEach-Object { node --check $_.FullName }
node tests/research-story.test.js
node tests/motion-system.test.js
```

Tarayıcı testleri Node.js, Node tarafından çözümlenebilen `playwright` paketi ve Microsoft Edge gerektirir. Gerekirse mevcut Playwright kurulumunun paket dizinini `NODE_PATH` ile, tarayıcı kanalını `BROWSER_CHANNEL` ile belirtin. Bunlar yalnız test gereksinimleridir; sitenin paket kurulumu veya build gereksinimi yoktur. Betikler geçici yerel HTTP sunucuları açar ve bitince kapatır. Yeni sonuçları ve ekran görüntülerini `docs/phase-3/` ve `docs/phase-3/regression/` altında kaydeder; Faz 2 kanıtlarını korur. Üçüncü taraf ağ istekleri bu testlerde kapalıdır; TradingView hizmet erişimini ölçmez.

Faz 4 kontrolleri ve önceki fazın kanıtlarını koruyarak regresyon çalıştırma:

```powershell
$env:TEST_OUTPUT_DIR='docs/phase-4/regression'
node tests/research-story.test.js
$env:TEST_OUTPUT_DIR='docs/phase-4/motion'
node tests/motion-system.test.js
$env:TEST_OUTPUT_DIR='docs/phase-4'
node tests/depth-background.test.js
Remove-Item Env:TEST_OUTPUT_DIR
```

`TEST_OUTPUT_DIR` depo köküne göre çözümlenir; verilmezse eski testlerin varsayılan klasörleri değişmez. Yeni derinlik testi varsayılan olarak `docs/phase-4/` kullanır. Çizim komutu ve rAF işlem süresi örnekleri yerel tanı içindir; GPU, pil tüketimi, gerçek cihaz performansı veya Core Web Vitals ölçümü değildir.

Anlatımın JavaScript kapalı HTML karşılığı `index.html` içinde tutulur. İleride yetkili bir veri güncellemesinde bu karşılığı da yeni snapshot ile eşitleyin; tarayıcı testi HTML değerlerinin `data.js` çıktısıyla birebir eşleştiğini denetler. `docs/phase-3/baseline-hashes.json`, bu fazın başındaki data.js, app.js, canlı adaptör ve rapor bütünlük kaydıdır; ileride bilinçli veri değiştirildiğinde yeni faz için ayrı bir başlangıç kaydı oluşturun.

## Veri tarihleri

- Platform saati: ziyaret anını gösterir; piyasa verisi değildir.
- Fiyat snapshot'ı: `DATA_LOCK.marketReferenceDate` ile etiketlenir.
- Rapor snapshot'ı: `DATA_LOCK.dataDate` ile etiketlenir.
- Makro güncelleme: `DATA_LOCK.macroDate` ile ayrı tutulur.
- Fon kontrol tarihi: `DATA_LOCK.fundReferenceDate` ile ayrı tutulur; fiyatın geçerli olduğu gün fon bazında ayrıca gösterilir.
- TradingView widget verisi: lisans ve gecikme durumu widget sağlayıcısına bağlıdır.
- Lisanslı API verisi: sağlayıcı zaman damgasıyla fiyat alanlarına yazılır.

## Yayına alma seçenekleri

1. Netlify: klasörü sürükle-bırak ile yayınlayabilirsiniz.
2. Vercel: statik proje olarak import edebilirsiniz.
3. GitHub Pages: tüm klasörü bir repo içine koyup Pages açabilirsiniz.
4. Kendi sunucunuz: klasörü web root içine koymanız yeterlidir.

## Canlı BIST verisi hakkında

Borsa İstanbul gerçek zamanlı verileri lisanslı veri sağlayıcılar üzerinden dağıtılır. Bu prototipte TradingView widgetları hızlı görsel takip için kullanılmıştır. Kurumsal canlı veri için Matriks, Foreks, iDeal, dxFeed veya BIST lisanslı data vendor entegrasyonu gerekir.

## Canlı değer / API entegrasyonu

Rapor ve portföy tablolarındaki değerler varsayılan olarak tarihli araştırma snapshot'ıdır. Lisanslı endpoint bağlandığında piyasa bandı, hisse ısı haritası, BIST seans aralığı, fiyat, günlük değişim, yukarı potansiyel, model portföy tutarı ve sağlayıcı zamanı otomatik güncellenir.

API anahtarı veya vendor parolası statik JavaScript'e yazılmamalıdır. Kimlik doğrulamayı sunucuda tutan aynı origin bir proxy kullanın ve HTML'den önce config'i yükleyin:

```js
window.EFE_RESEARCH_LIVE_CONFIG = {
  provider: 'licensed-vendor',
  endpoint: '/api/quotes',
  indexSymbol: 'XU100',
  refreshMs: 60000
};
```

Beklenen minimum yanıt:

```json
{
  "GARAN": {"price": 135.9, "changePct": 1.24, "time": "2026-09-04T15:30:00+03:00"},
  "AFT": {"price": 0.971442, "changePct": 0.11, "time": "2026-09-04T18:00:00+03:00"},
  "XU100": {"price": 14012.42, "changePct": 0.57, "high": 14066.72, "low": 13895.82, "previousClose": 13932.46, "time": "2026-09-04T18:30:00+03:00"}
}
```

Portföy tutarları için endpoint `marketValue`, `amount` veya `portfolioValue` döndürürse doğrudan kullanılır. Bu alanlar yoksa snapshot baz fiyatı ve API fiyatı oranıyla model portföy tutarı yeniden hesaplanır. Adaptör sekme arka plandayken polling yapmaz, üst üste istekleri iptal eder ve en az 15 saniyelik yenileme aralığı uygular.

## Yasal uyarı

Bu site ve rapor bilgilendirme amaçlıdır. Yatırım tavsiyesi değildir.
