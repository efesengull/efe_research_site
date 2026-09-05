# Faz 2 — Sinyalden Karara

5 Eylül 2026. Yalnız Faz 2 tamamlandı. Faz 3 başlatılmadı.

## Sonuç ve kararlar

Ana sayfaya hero sonrasında dört aşamalı araştırma anlatımı eklendi: **Piyasa sinyali → Değerleme → Risk analizi → Portföy kararı**. GARAN; mevcut fiyat, değerleme, risk ve model portföy kayıtlarının tamamında yer aldığı için tek örnek olarak kullanıldı. Mevcut araştırma bölümleri ve bağlantılar korundu.

- En az 1000 px genişlik ve 720 px yükseklikte, hareket tercihi uygunsa CSS `position: sticky` ile sabit veri paneli etkinleşir. Panel ekrana sığmıyorsa, örneğin metin büyütüldüğünde, sıralı görünüme geçer. Tekerlek veya dokunma girdisi engellenmez; kaydırma doğal kalır.
- Dört metin bloğu DOM sırasını ve odağı korur. Bölüm göstergesi ve sabit panel ileri/geri kaydırmada aynı aşamayı gösterir. Doğrudan anchor, yenileme ve klavye odağının tetiklediği kaydırma da bu durumu günceller.
- `app.js`, mevcut `data.js` kayıtlarından anlatım değerlerini doldurur. Yeni alanlar canlı adaptör veya sermaye simülatörü hook'larını kullanmaz; tarihli araştırma örneği olarak kalır. HTML karşılığı aynı sayıları, tarihleri ve kaynak etiketlerini JavaScript olmadan sunar.
- Mobilde ve reduced-motion altında dört metin/veri bloğu sıralıdır; pin, scrub veya autoplay eklenmedi. Observer API'leri yoksa statik anlatım kullanılır. Sabit panelin görsel kopyası ekran okuyucudan gizlidir; dört özgün veri bloğu okuma sırasında korunur.
- Faz 1 renk, tipografi, boşluk ve hareket token'ları kullanıldı. Yalnız veri katmanı değişiminde 400 ms opacity/6 px transform geçişi vardır; bu geçiş görünür anlatımda etkinleşir. Yeni medya, font, framework veya çalışma zamanı bağımlılığı eklenmedi.
- Panel yüksekliği en uzun aşamaya göre ayrılır; böylece bölüm geçişinde panel alt bilgisi yer değiştirmez. Geometri başlangıçta veya yeniden yerleşimde ölçülür. Scroll işleyicisi yalnız kayıtlı eşikler ve `scrollY` okur; pasif olay ve tek bekleyen requestAnimationFrame kullanır. Görünüm dışında veya sekme gizliyken anlatım güncellemesi çalışmaz.

## Kabul ölçütleri ve doğrulama

`tests/research-story.test.js`: **112 kontrol geçti**. Yerel Edge/Chromium, headless; site kendisi build edilmedi.

- Beş sayfa 1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında kontrol edildi: yatay sayfa taşması, kırık yerel görsel veya JavaScript çalışma hatası görülmedi. Başlangıç ekranları toplu görsel olarak incelendi; yeni bölümün masaüstü, tablet, mobil, dört aşama ve statik görünümleri ayrıca incelendi.
- İleri/geri geçişler ve aşama atlamalarında panel verisi ilgili makaleyle eşleşti; tek bölüm göstergesi etkin kaldı. Orta aşamalarda sticky konumu ve panelin ekran içinde kalması ölçüldü.
- Doğrudan risk bağlantısı ve yenileme üçüncü aşamayı açtı. Odak görünürlüğü, reduced-motion tercihini açık sayfada değiştirme, kısa ekran ve büyütülmüş metin fallback'i geçti.
- JavaScript kapalı dört veri bloğu görünür; HTML değerleri `data.js` render çıktısıyla birebir aynı. Observer desteğinin kaldırıldığı ayrı kontrolde de dört statik veri bloğu görünür kaldı.
- Global arama, banka filtresi, tüm satırları geri getirme, mobil menü, 250.000 TL model sermayede GARAN tutarı ve baz senaryo hesabı geçti. Yerel asset, indirme ve anchor hedefleri kontrol edildi. Beş sayfanın sürümü `3.3.0`; script sırası korundu.
- Kontrollü HTTP 503 fiyat yanıtında araştırma anlatımı ve GARAN kapanış alanı korundu. Reduced-motion altında ve hero sonrasındaki işlev kontrolünde video durdu. Veri dosyası, canlı adaptör, canvas kodu ve iki rapor dosyasının SHA-256 değerleri başlangıçla aynı.
- Beş uygulama JavaScript dosyası ve test betiği `node --check` kontrolünden geçti.

Ek etkileşim ölçümü: Gerçek Tab tuşuyla dört aşamanın bağlantıları sırayla odaklandı ve göstergeler 1→2→3→4 ilerledi. İleri/geri kaydırma dizisinde anlatım öğeleri için **0 `getBoundingClientRect` çağrısı** ölçüldü. Üçüncü aşamada 700 ms hareketsiz bekleme boyunca **0 yeni requestAnimationFrame isteği** ölçüldü. Bunlar belirli yerel etkileşim ölçümleridir; Core Web Vitals veya kapsamlı performans denetimi değildir. Mevcut canvas'ın hero yakınındaki 120 px ön yükleme görünürlük payı değiştirilmedi.

İlk görsel turdan sonra panel yüksekliği ve risk katmanının altın vurgusu gözden geçirildi. Mevcut yoğun kokpitin önüne daha sakin bir araştırma aralığı yerleştirildi; mobilde geniş boşluklar yerine metin ve verinin bitişik sırası korundu.

## Dosyalar ve kanıtlar

- `index.html`: giriş bağlantısı, semantik dört aşama, statik veri karşılıkları ve görsel panel kabuğu.
- `assets/css/research-os.css`: anlatım kompozisyonu, sticky ve statik alternatifler.
- `assets/js/app.js`: mevcut araştırma verisini anlatıma bağlayan render işlevi.
- `assets/js/platform-ui.js`: görünürlük, boyut, hareket tercihi ve aşama kontrolü.
- Beş HTML dosyası: ortak asset sürümü `3.3.0`; diğer dört sayfada yalnız sürüm parametresi değişti.
- `README.md`, `tests/research-story.test.js`, bu rapor ve `docs/phase-2/` kanıtları.

Kanıtlar: [112 test sonucu](phase-2/test-results.json), [etkileşim ölçümleri](phase-2/interaction-measurements.json), [başlangıç hash kayıtları](phase-2/baseline-hashes.json), [20 ekranın görsel özeti](phase-2/viewport-contact-sheet.jpg), [önce](phase-2/before-desktop.png), [sonra](phase-2/after-desktop.png), [değerleme aşaması](phase-2/stage-2.png), [mobil](phase-2/after-mobile.png), [reduced-motion](phase-2/reduced-motion.png), [JavaScript kapalı](phase-2/no-js.png).

## Sınırlar

Bu çalışma alanında `.git` ve kullanıcı tarafından belirtilen `.codex` betikleri görünmedi. İki Git yürütücüsü de `fatal: cannot change to 'C:/Users/user'` hatası verdi. Kullanıcının Faz 1 kaydı doğrulanamadı; yeni repo oluşturulmadı ve commit atılmadı.

Üçüncü taraf istekler regresyon testinde kapatıldı; TradingView kodu korundu, sağlayıcının canlı erişimi veya fiyat doğruluğu bu fazda doğrulanmadı. Safari/Firefox, gerçek cihaz, gerçek ekran okuyucu ve tam WCAG/Core Web Vitals denetimi yapılmadı. Önceki fazda belirtilen site genelindeki JavaScript olmadan veri eksiklikleri bu yeni bölüm dışında devam eder. Bu sonuç bütün projenin veya Faz 8'in tamamlandığı anlamına gelmez.
