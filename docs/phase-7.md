# Faz 7 — Kod kalitesi

6 Eylül 2026. **Faz 7 tamamlandı; Faz 8 başlatılmadı.** Başlangıç commit'i `5315494`; ortak asset sürümü `3.7.0`.

## Sonuç ve kabul ölçütleri

Ortak hareket tercihleri, kare planlama, CSS odak/hareket kuralları ve standart test sunucusu sadeleştirildi. Beş sayfanın görünümü, finansal içeriği ve mevcut işlevleri korunuyor. Build, framework, yeni uygulama dosyası veya çalışma zamanı bağımlılığı eklenmedi.

Kabul ölçütleri: aynı hareket tercihini kullanan bileşenlerin tutarlı çalışması; kaydırmada sürekli layout ölçümü eklenmemesi; ileri/geri anlatım, klavye, reduced-motion ve medya durdurmanın korunması; beş sayfanın dört boyutta görünüm eşdeğerliği; finansal dosya ve HTML bütünlüğü; ilgili testlerin geçmesi.

## Değişiklikler ve gerekçeleri

- **Hareket tercihi:** `platform-ui.js` içinde `motionPaused()` tek karar, `observeMotionPreference()` ortak dinleyici bağlantısı sağlar. Sayfa geçişi, video, ticker ve giriş efektleri aynı MediaQueryList'i kullanır. Ekran dışı görünürlük ve veri tasarrufu gibi bileşen koşulları yerinde kalır; ticker sekme gizlenince gereksiz yere yeniden yaratılmaz.
- **Kare planlama:** `createFrameTask()` bölüm göstergesi ve Sinyalden Karara için yinelenen rAF biriktirme/iptal kodunu toplar. Aynı işte tek bekleyen kare tutulur; doğrudan ölçümden sonra yapılan güncelleme varsa sıradaki kopyası iptal edilir. Sekme gizlenince ölçüm/güncelleme işleri iptal olur. Kaydırma sırasında önceden ölçülmüş sınırlar kullanılır.
- **Tasarım kuralları:** Arama sonucu, tablo bölgesi ve sıralama düğmesinin iç odak çizgisi tek seçici listesine alındı. Reduced-motion ve dokunmatik/fareyle üzerine gelme desteği olmayan cihazların transform sıfırlaması birleştirildi. Seçici öncelikleri ve tasarım token'ları korunur.
- **Test bakımı:** Beş standart testteki MIME/dosya sunma tekrarı `tests/helpers.js` içinde toplandı. Tarihî Git sürümü sunan iki özel tanı betiği kapsam dışında bırakıldı. Yeni `code-quality.test.js`, başlangıç sürümüyle bütünlük ve görünüm eşdeğerliğini ölçer. Kullanımı README'de belgeli; siteye paket gerektirmez.
- **Adlandırma/sürüm:** Ortak tablo başlıkları `TABLE_LABELS` sabitine dönüştürüldü. Beş HTML'de yalnız ortak önbellek sürümü `3.7.0` oldu; script sırası değişmedi.

Canvas'ın farklı çizim, DPR ve cihaz kapasitesi yaşam döngüsü korunmuştur; onu ortak UI dosyasına bağlayacak yeni bir global API eklemek gerekli görülmedi. Veri/render/canlı adaptör dosyalarını yeniden bölmek de bu fazın bakım faydasını artırmayacağından yapılmadı.

## Doğrulama

| Kontrol | Sonuç |
| --- | --- |
| Araştırma anlatımı, arama/filtre/tablo/portföy, bağlantılar ve indirmeler | 112/112 |
| Hareket, ileri/geri bölüm göstergesi, klavye/dokunma ve sekme görünürlüğü | 43/43 |
| Canvas, medya/statik alternatifler, DPR ve cihaz koşulları | 72/72 |
| Erişilebilirlik davranışı, 20 görünüm, 320px/%200 metin, no-JS, ticker | 241/241 |
| Hedefli medya/widget davranışı | 9/9 |
| Faz 7 bütünlük ve görünüm eşdeğerliği | 56/56 |
| Toplam | **533/533** |

Yeni testin 56 kontrolü: 10 korunan dosya hash'i, beş HTML karşılaştırması, 20 geometri/stil ve 20 piksel karşılaştırması, bir JS hata kontrolü. Kontrol sayıları test senaryolarıdır; benzersiz hata veya erişilebilirlik ölçütü sayısı değildir.

1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında önceki/güncel 40 ekran görüntüsü dört karşılaştırma görselinde incelendi. İçerik hiyerarşisi, koyu kimlik, mobil satır kırılımları ve aralıklar korunuyor. Bütün öğelerin geometrisi ve seçilmiş hesaplanmış stilleri eşleşti; son koşuda **20/20 görünümün ham pikselleri birebir aynı**.

İlk katı piksel denemesinde 1024px rapor sayfasının sabit bölüm çubuğunda altı uç piksel farklıydı; geometrisi/stili aynıydı ve fark tam boy görsellerde incelendi. Yeniden üretilebilir testte en fazla %0,01 piksel toleransı ve açık fark sayacı kullanıldı; son koşunun gerçek farkı sıfır. Bu tolerans yerleşim/stil karşılaştırmasını gevşetmez. Görsel birleştirme aracı yazı tipi önbelleği için yazma uyarısı verdi; tüm karşılaştırma görselleri üretildi ve açılarak doğrulandı.

Beş uygulama ve dokuz test/yardımcı JavaScript dosyasının sözdizimi; diff boşluk kontrolü geçti. Yerel tarayıcı koşularında yeni JavaScript çalışma hatası yok. Finansal veriler ve hesaplamalar, DATA_LOCK, kaynak/tarih, uyarı, widget yapılandırması, bağlantı ve snapshot/canlı ayrımı korundu.

## Dosyalar ve kanıtlar

Uygulama: `assets/js/platform-ui.js`, `assets/css/research-os.css`, beş kök HTML. Testler: `research-story`, `motion-system`, `depth-background`, `performance`, `accessibility` testleri; yeni `tests/helpers.js` ve `tests/code-quality.test.js`. Belgeler: README, PROJECT_STATUS, bu rapor ve `docs/phase-7/` kanıtları.

[Tam dosya listesi](phase-7/changed-files.txt) · [İşlevler](phase-7/regression/test-results.json) · [Hareket](phase-7/motion/motion-results.json) · [Derinlik/fallback](phase-7/depth/depth-results.json) · [Erişilebilirlik](phase-7/accessibility/accessibility-results.json) · [Medya/widget](phase-7/performance/behavior-results.json) · [Eşdeğerlik](phase-7/quality/quality-results.json) · [Bütünlük](phase-7/quality/integrity.json).

Görsel karşılaştırmalar: [1440](phase-7/quality/comparison-1440.jpg), [1024](phase-7/quality/comparison-1024.jpg), [768](phase-7/quality/comparison-768.jpg), [390](phase-7/quality/comparison-390.jpg).

## Sınırlar ve kapanış

Testler yerel headless Edge/Chromium'da çalıştı. Üçüncü taraf ağ kapalıdır; widget/ticker davranışı işaretli yerel fixture ile doğrulandı. Gerçek TradingView iç arayüzü/fiyat doğruluğu, Safari/Firefox, ekran okuyucu ve fiziksel cihaz doğrulaması yapılmadı. Faz 5 performans kıyaslaması ve Faz 6 axe/kontrast denetimi yeniden çalıştırılmadı; bu fazda performans iyileşmesi veya WCAG uygunluğu iddiası yoktur. Piksel karşılaştırması reduced-motion altında sabit örnektir, hareketli medyanın bütün karelerini kapsamaz.

Commit mesajı: **`Faz 7 tamamlandı - Ortak hareket ve test yapılarını sadeleştir`**. Commit kimliği Git kaydından okunabilir. Push yapılmadı. Faz 8 için yeni talimat beklenir.
