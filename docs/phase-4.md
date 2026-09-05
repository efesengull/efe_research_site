# Faz 4 — Koşullu 3D

5 Eylül 2026. Başlangıç: `6ed3f6a` (Faz 3), temiz Git çalışma ağacı. Yalnız Faz 4 tamamlandı; Faz 5 başlatılmadı.

## Karar

**Yeni 3D/WebGL katmanı gerekmiyor.** Araştırmanın dört aşaması metin, değer karşılaştırması, risk eşiği ve portföy rolüyle açıklanıyor. Döndürme, hacim, mekânsal veri seçimi veya kamera değişimi gerektiren bir içerik bulunmuyor. Mevcut derinliğin üstüne başka bir sahne eklemek bilgi kazandırmadan görsel yoğunluğu artırır. Bu, kod ve ekran incelemesine dayanan tasarım kararıdır; karşılaştırmalı WebGL performans testi iddiası değildir.

| Mevcut imkân | Kullanım ve değerlendirme |
| --- | --- |
| Canvas 2D | `finance-3d-background.js`, `getContext('2d')` kullanır. Perspektif izdüşümü, ızgara, ağ, rapor sütunları ve risk yörüngesi zaten derinlik oluşturur. Dosya adı WebGL kullandığı anlamına gelmez. `aria-hidden` sahne, finansal veri kaynağı değildir. |
| CSS/HTML | Sinyalden Karara paneli doğal scroll, sticky konum ve dört okunabilir veri katmanı kullanır. Değerleme ve risk ölçekleri CSS ile yeterince açık; mobil/reduced-motion/JS kapalı karşılıkları mevcuttur. |
| SVG | Ana sayfadaki BIST görsel ritmi çözünürlükten bağımsızdır. Yeni bir 3D grafik olmadan görsel bağlam sağlar; gerçek fiyat serisi diye yeniden yorumlanmadı. |
| Video/poster/zemin | Mevcut WebM, WebP poster ve CSS zemini birbirini tamamlar. Canvas ve video çalışmadığında poster; poster de yüklenmediğinde koyu zemin ve içerik kalır. |

WebGL ancak ileride bu araçlarla açıklanamayan somut bir veri etkileşimi gerekirse yeniden değerlendirilmeli. O durumda prototipin CPU/GPU/bellek ve aktarım maliyeti, context kaybı, cihaz/tarayıcı alternatifleri, düşük güç davranışı ve görünürlükte durması ayrıca ölçülmelidir. [MDN WebGL rehberi](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices), cihaz limitleri, context kaybı, çizim tamponu ve GPU belleği için bu ek yükümlülükleri açıklıyor.

## Kabul ölçütleri ve sonuçlar

- **Mevcut çözüm yeterli:** Beş sayfa kodu, CSS veri katmanları ve SVG incelendi. Yeni uygulama kodu, medya, bağımlılık veya render döngüsü eklenmedi.
- **Cihaz sadeleşmesi:** DPR 3 emülasyonunda tüm Canvas tamponları yaklaşık 1,8 DPR sınırında kaldı. Mevcut `width < 760 || height < 520` compact koşulu 52 düğümü 24'e, 6 paneli 2'ye; flow/orbit sahnelerinde 2 paneli 0'a indiriyor. Mobilde beş sayfanın çizim komutu sayısı masaüstünden düşük, video duruyor.
- **Statik alternatifler:** Beş sayfada Canvas context'i `null` döndürülüp video isteği engellendi; Canvas eklenmedi, poster yüklenebildi, başlık/navigasyon görünür kaldı. Ayrı senaryoda WebP de engellendi; opak CSS zemini, gradient örtüsü ve içerik korundu. Reduced-motion altında sürekli Canvas çizimi ve video oynatımı durdu. JS kapalı ana sayfada dört anlatım adımı kaldı.
- **Hareket yaşam döngüsü:** Durdurma kontrolü her sayfada masaüstü/mobil sürekli çizimi kesiyor. Önceki hareket testleri ayrıca görünüm dışında ve kontrollü sekme-gizlilik olayında Canvas/video durmasını, yeniden başlamayı ve dinamik reduced-motion davranışını doğruladı.
- **Regresyon:** `research-story.test.js` **112**, `motion-system.test.js` **43**, `depth-background.test.js` **72** kontrol geçti; toplam **227**. Yeni testte ilk çalıştırmanın hatalı CSS katmanı varsayımı düzeltildi; son çalıştırma başarılı. Beş uygulama ve üç test JS dosyası sözdizimi kontrolünden geçti.
- **Görsel inceleme:** Beş sayfanın 1440×900, 1024×768, 768×1024 ve 390×844 görüntülerinin toplu görünümü; ayrıca masaüstü, mobil ve tüm medya devre dışı ana sayfa incelendi. Medyasız görünümde de başlık/veri hiyerarşisi korunuyor. Bu karşılaştırmadan sonra ek derinlik eklememe kararı korundu.
- **Bütünlük:** Beş HTML, tüm izlenen uygulama asset'leri ve iki indirme dahil 17 dosya başlangıç commit'iyle aynı; SHA-256 kaydı eklendi. Finansal değer, kaynak, tarih, DATA_LOCK, yasal uyarı, script sırası ve ortak `3.4.0` sürümü değişmedi. Faz 3 kanıt dosyaları korunuyor.

## Sınırlı yerel maliyet örneği

Headless Edge, masaüstü 1440×900 ve mobil 390×844, DPR 3. Her sayfada 1 saniye bekleme sonrası 1,2 saniyelik örnek: Canvas çizimi yapan rAF callback'inin update/çizim komutlarını gönderme süresi. Test enstrümantasyonunun maliyeti dahildir. Rastgele mevcut sahne tohumları komut sayısını değiştirir. Zaman değerleri performans kabul eşiği olarak kullanılmadı.

| Sayfa | Masaüstü medyan / p95 (ms) | Mobil medyan / p95 (ms) | Ortalama stroke/fill komutu: masaüstü → mobil |
| --- | --- | --- | --- |
| Ana sayfa | 0,7 / 0,9 | 0,3 / 0,4 | 296 → 104 |
| Canlı piyasa | 0,6 / 1,0 | 0,3 / 0,5 | 336 → 102 |
| Rapor | 0,7 / 1,0 | 0,4 / 0,6 | 323 → 133 |
| Portföy | 0,6 / 0,8 | 0,3 / 0,5 | 276 → 113 |
| Metodoloji | 0,6 / 0,9 | 0,3 / 0,5 | 304 → 115 |

Mevcut Canvas betiği 18.459, poster 80.366, video 1.237.648 bayt (disk boyutları; sıkıştırılmış ağ aktarımı değildir). Faz 4'ün siteye eklediği çalışma zamanı baytı ve bağımlılık sayısı **0**. WebGL prototipi oluşturulmadığı için WebGL ile maliyet kıyası veya tasarruf yüzdesi verilmedi.

## Değişiklikler ve kanıtlar

- `tests/depth-background.test.js`: Canvas/fallback davranışı ve yerel maliyet örnekleri.
- `tests/research-story.test.js`, `tests/motion-system.test.js`: yalnız isteğe bağlı `TEST_OUTPUT_DIR`; regresyon çıktısında gerçek klasörün bildirilmesi. Eski faz kayıtlarını ezmeden yeniden çalıştırılabilirler.
- `README.md`, bu rapor ve `docs/phase-4/`: karar, komutlar ve kanıtlar. Uygulama dosyası değişikliği yok.

[72 derinlik kontrolü ve ölçümler](phase-4/depth-results.json) · [112 regresyon kontrolü](phase-4/regression/test-results.json) · [43 hareket kontrolü](phase-4/motion/motion-results.json) · [17 dosyanın bütünlük kaydı](phase-4/integrity.json) · [20 ekran](phase-4/viewport-contact-sheet.jpg) · [masaüstü](phase-4/desktop.png) · [mobil](phase-4/mobile.png) · [Canvas/video kapalı](phase-4/canvas-video.png) · [tüm medya kapalı](phase-4/all-media.png) · [JS kapalı](phase-4/no-js.png).

## Gerçek sınırlar

Compact davranış ekran boyutuna bağlıdır; mevcut kod gerçek pil tasarrufu modunu, `saveData`, `deviceMemory` veya `hardwareConcurrency` bilgisini kullanmaz. Mobil emülasyon gerçek düşük güçlü cihaz kanıtı değildir. [Bellek bilgisi yaklaşık ve sınırlı desteklidir](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory); [mantıksal işlemci sayısı da tarayıcı tarafından sınırlandırılabilir](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency). Bu göstergeler tek başına güç ölçümü sayılmamalıdır. Bu fazda yeni WebGL eklenmediği için yeni bir düşük güç politikası da eklenmedi.

Ölçümler GPU tamamlanma süresi, FPS, enerji, Core Web Vitals veya gerçek cihaz performansı değildir. Safari/Firefox, gerçek dokunmatik cihaz ve işletim sistemi sekme geçişi test edilmedi. Üçüncü taraf ağ kapalıdır; TradingView hizmet erişimi ve canlı fiyat doğruluğu doğrulanmadı. Engellenmiş medya senaryolarındaki beklenen ağ hataları, yeni JavaScript çalışma hatasından ayrıdır. Canvas context kaybı/geri kazanımı ve IntersectionObserver bulunmayan tarayıcılarda görünmezken durma ayrıca doğrulanmadı. Faz 5–8 tamamlanmış sayılmaz.
