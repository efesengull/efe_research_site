# Faz 5 — Performans

5 Eylül 2026. Başlangıç: `a3135e3`, temiz Git çalışma ağacı. Yalnız Faz 5 kapsamı uygulandı.

## Sonuç ve uygulama

Dekoratif Canvas'ın çizim maliyeti düşürüldü; mobil tampon küçültüldü, gereksiz video başlangıcı önlendi ve ekran dışındaki TradingView scriptleri ertelendi. Build, framework, WebGL veya yeni çalışma zamanı bağımlılığı eklenmedi. Ortak asset sürümü `3.5.0`.

- **Canvas:** En fazla 30 çizim/s. Pointer yumuşaması ve düğümlerin hareketi geçen zamana bağlı; yüksek yenileme hızı hareketi hızlandırmıyor. Uzak düğüm çiftlerinde karekök hesaplanmıyor. Aynı ölçüdeki resize olayında Canvas tamponu yeniden oluşturulmuyor. Mobil/kısa sahne veya `hardwareConcurrency <= 4`, `deviceMemory <= 4`, `saveData` sinyali varsa mevcut sade sahne ve en fazla 1,25 DPR; diğerlerinde 1,8 DPR korunuyor. Bu sinyaller cihaz kapasitesinin kesin ölçümü değildir. API yoksa ekran boyutu ve mevcut masaüstü sınırı kullanılır.
- **Video:** İlk IntersectionObserver sonucu gelmeden oynatma başlamıyor. Böylece sayfa içi bağlantıyla görünüm dışındaki hero'ya açılışta gereksiz video isteği yapılmıyor. Veri tasarrufu açıkken video duruyor; tercih değişimi izleniyor. Mobil, reduced-motion, sekme/görünüm dışında durma ve kullanıcı durdurma kontrolü korunuyor. Mevcut video/poster dosyaları değişmedi.
- **TradingView:** Üç scriptin URL ve JSON'u aynı; script kutuya 160 px yaklaşınca bir kez oluşturuluyor. Observer desteği yoksa doğrudan yükleme, gizli sekmeden dönüşte yeniden görünürlük kontrolü var. Mevcut kutu boyutları ve ağ hatası açıklaması korundu. Sonradan oluşturulan iframe mevcut yükleme izleyicisiyle çalışıyor.

Çizim zamanlaması [MDN requestAnimationFrame açıklaması](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) ile uyumlu olarak timestamp üzerinden yapılıyor. Görünürlükte yükleme yaklaşımı [TradingView'in resmi rehberinde](https://www.tradingview.com/widget-docs/tutorials/lazy-loading/) de anlatılıyor. [web.dev video rehberi](https://web.dev/articles/lazy-loading-video) ve [yerleşim kayması rehberi](https://web.dev/articles/optimize-cls) doğrultusunda poster ve ayrılmış widget alanları korundu.

## Ölçüm yöntemi

Önce uygulama değiştirilmeden, sonra aynı testle **30'ar örnek**: beş sayfa × masaüstü 1440×900 / mobil 390×844 × üç yeni tarayıcı oturumu. Headless Edge, DPR 3, 4× CPU yavaşlatması, yerel HTTP, 1,4 s ısınma ve 1,6 s çizim örneklemesi. Sahne tohumları iki koşulda aynı. Testler ölçümle eşzamanlı çalıştırılmadı.

Ana karşılaştırmada harici ağ engelli. `PerformanceObserver` başlangıç LCP, CLS oturum pencereleri ve uzun görevleri; CDP ana iş parçacığı/layout süresini; enstrümantasyon Canvas update/çizim callback süresini kaydediyor. Callback süresi GPU raster/decode süresi değildir ve test sarmalayıcısının maliyetini içerir. Bunlar saha Core Web Vitals veya gerçek cihaz/pil sonuçları değildir.

İlk tarayıcı oturumunun daha yavaş açılmasını üç örneğin medyanıyla sınırladık. Başlangıçta headless ortam yaklaşık 194–200 çizim/s üretti; aşağıdaki kazançlar bu koşula aittir, 60 Hz telefonda aynı yüzde beklenemez.

## Önce → sonra: üç örneğin medyanı

| Sayfa / görünüm | Canvas callback ms/s | Ana iş parçacığı ms/s | Başlangıç LCP ms | Başlangıç CLS |
| --- | --- | --- | --- | --- |
| Ana sayfa / masaüstü | 621,7 → 86,8 | 892,9 → 241,8 | 708 → 632 | 0,025 → 0,025 |
| Canlı / masaüstü | 603,1 → 88,7 | 865,3 → 244,8 | 532 → 528 | 0,015 → 0,015 |
| Rapor / masaüstü | 628,7 → 89,4 | 897,9 → 235,2 | 528 → 556 | 0,021 → 0,021 |
| Portföy / masaüstü | 507,3 → 73,4 | 760,7 → 214,9 | 488 → 460 | 0,015 → 0,015 |
| Metodoloji / masaüstü | 528,9 → 77,4 | 768,4 → 219,9 | 472 → 444 | 0,016 → 0,016 |
| Ana sayfa / mobil | 324,3 → 62,1 | 582,8 → 253,1 | 600 → 624 | 0 → 0 |
| Canlı / mobil | 265,7 → 45,8 | 458,1 → 198,2 | 404 → 396 | 0 → 0 |
| Rapor / mobil | 349,5 → 77,8 | 582,4 → 300,0 | 508 → 500 | 0 → 0 |
| Portföy / mobil | 258,4 → 53,4 | 458,2 → 233,4 | 484 → 492 | 0 → 0 |
| Metodoloji / mobil | 277,3 → 46,7 | 484,3 → 221,2 | 508 → 476 | 0 → 0 |

Canvas işlem süresi masaüstünde yaklaşık **%85–86**, mobilde **%78–83** azaldı. Son ölçümde 28,4–28,6 çizim/s; 30 üst sınırı her örnekte geçti. Mobil tampon piksel sayısı yaklaşık **%52** azaldı; masaüstü tamponu aynı kaldı. Aktif hero örneklemesinde layout süresi her iki sürümde sıfır; bu, sayfanın ilk açılışında veya anlatım ölçümünde hiç layout olmadığı anlamına gelmez.

LCP küçük farklarla her iki yönde değişti; rapor masaüstü 528→556 ms ve ana sayfa mobil 600→624 ms farkları tekrar aralıkları içinde. Bu örnek sayısıyla kesin LCP kazancı veya gerilemesi iddia edilmiyor. Başlangıç CLS artmadı, en yüksek tek örnek yaklaşık 0,0254'ün altında. CPU yavaşlatmalı açılışta 3–5 uzun görev hâlâ var; görevlerin tamamının kaldırıldığı iddia edilmiyor.

Video baytı Resource Timing'de yalnızca tamamlanmış kaynakları kapsar; sıfır değeri tek başına indirme yapılmadığını göstermez. Reduced-motion, veri tasarrufu ve görünüm dışındaki doğrudan bağlantı senaryolarında **istek günlüğüyle** video isteği olmadığı ayrıca doğrulandı. Mevcut videonun disk boyutu 1.237.648 bayt; bir sıkıştırma veya ölçülmüş ağ tasarrufu iddiası yok.

## Gerçek üçüncü taraf ağı

İlk ağ denemesi `net::ERR_NETWORK_ACCESS_DENIED` ile engellendi; ayrı klasörde korundu. Ağ erişimli tekrar, gerçek TradingView scriptlerini ve iframe'lerini yükledi. Her sürüm/görünüm için yeni oturum, ilk 10 saniye ve ardından kutu başına 4 saniye bekleme; CPU yavaşlatması yok. Bu tek örnekli tanı, ana kontrollü zamanlama ölçümünden ayrıdır.

| Görünüm | İlk 10 s harici istek: önce → sonra | Tamamlanan harici gövde baytı: önce → sonra | Kaydırma sonrası |
| --- | --- | --- | --- |
| Masaüstü | 196 → 0 | 771.808 → 0 | 3/3 iframe yüklendi |
| Mobil | 199 → 0 | 802.768 → 0 | 3/3 iframe yüklendi |

Bu aktarım **ertelendi**; kullanıcı bütün widgetlara kaydırırsa kaynaklar yine yüklenir. Ölçüm tam oturum bant genişliğinin aynı oranda azaldığı anlamına gelmez. Kutular 104/440/440 px yüksekliğini korudu. Önce ve sonra JavaScript çalışma zamanı hatası yok; her koşulda üç sağlayıcı `sheriff` isteği `ERR_ABORTED` olarak kaydedildi, nedenine dair çıkarım yapılmadı.

Gerçek masaüstü önce/sonra ve mobil sonrası ekranları incelendi: widget kabukları ve makro bandı yükleniyor, BIST tarafında sağlayıcının veri yok/yalnız TradingView'de mevcut açıklaması görülüyor. Aynı kısıt başlangıç sürümünde de var; widgetın yüklenmesi BIST canlı fiyat doğruluğunu kanıtlamaz. Yapılandırmayı veya sembolleri bu fazda değiştirmedik.

[Ağ erişimli sonuçlar](phase-5/third-party-network/network-results.json) · [Masaüstü önce](phase-5/third-party-network/before-desktop.png) · [Masaüstü sonra](phase-5/third-party-network/after-desktop.png) · [İlk engelli ağ denemesi](phase-5/third-party/network-results.json).

## Kabul kontrolleri ve görsel inceleme

- Araştırma anlatımı/regresyon: **112 geçti**. Beş sayfa × 1440×900, 1024×768, 768×1024 ve 390×844; ileri/geri anlatım, navigasyon, arama, tablo filtre/sıralama, portföy hesapları, bağlantılar/indirmeler, snapshot/canlı ayrımı, JS kapalı ve reduced-motion karşılıkları.
- Hareket sistemi: **43 geçti**. Klavye/dokunma, durdurma/sürdürme, görünüm/sekme dışında Canvas/video durması, düşük hareket tercihi, geçişler ve scroll sırasında geometri okuma regresyonu.
- Derinlik/alternatifler: **72 geçti**. Canvas/video/poster arızası, DPR sınırı, mobil sadeleşme ve statik içerik.
- Performans testi: **69 geçti**, 30 son ölçüm. Buna ek olarak güncellenen widget JSON karşılaştırması dahil **9 hedefli davranış kontrolü geçti**; bu kontroller ana performans testinin davranış bölümünü tekrarlar. Tekil kontrol sayısını bu tekrarlarla büyütmüyoruz.
- Beş uygulama ve beş test JS dosyası `node --check` kontrolünden geçti. Kontrollü senaryolarda JavaScript çalışma zamanı hatası yok.
- Beş sayfanın dört boyuttaki 20 görüntüsü ve 20 önce/sonra görüntüsü toplu görünümde incelendi; ana sayfanın mobil görüntüsü ayrıca açıldı. Tipografik hiyerarşi, veri alanları ve bölüm ritmi korundu. Mobil çözünürlük sınırı okunabilir içeriği etkilemiyor; Canvas dekoratif. Bu incelemeden sonra ek tasarım değişikliği gerekmedi.
- Bütünlük: `data.js`, `app.js`, canlı adaptör, CSS, tüm medya ve indirmeler dahil **10 dosyanın SHA-256'sı aynı**. Beş HTML dosyası, sürüm ve üç widget yükleme niteliği geri çevrildiğinde başlangıçla birebir aynı; tüm widget JSON'ları, değerler, tarih/kaynaklar, bağlantılar, DATA_LOCK ve yasal uyarılar korunuyor.

## Kanıtlar ve sınırlar

[Önce ölçümü](phase-5/before/performance-results.json) · [Sonra ölçümü](phase-5/after/performance-results.json) · [Karşılaştırma](phase-5/comparison.json) · [Güncel davranış testi](phase-5/after/behavior-results.json) · [Bütünlük kaydı](phase-5/integrity.json) · [20 ekran boyutu görüntüsü](phase-5/viewport-contact-sheet.jpg) · [Önce/sonra görsel karşılaştırma](phase-5/before-after-contact-sheet.jpg).

Gerçek düşük güçlü cihaz, Safari/Firefox, GPU/decode/pil tüketimi, saha LCP/INP/CLS ve lisanslı canlı fiyat doğruluğu ölçülmedi. Scroll sonrası tüm oturumun saha CLS'si yerine kontrollü başlangıç CLS'si ölçüldü. Finansal veri ve hizmet doğruluğu bu performans fazında yeniden sertifikalandırılmadı.

Değişiklikler: `finance-3d-background.js`, `platform-ui.js`, beş HTML'nin asset sürümü (`live.html` ayrıca üç yükleme niteliği), yeni `performance.test.js` ve `third-party-performance.test.js`, mevcut regresyon testinin sürüm beklentisi, `README.md`, `PROJECT_STATUS.md`, bu rapor ve `docs/phase-5/` kanıtları. [Tam dosya listesi](phase-5/changed-files.txt). CSS ve finansal veri dosyaları değişmedi. Faz 5 tamamlandı; Faz 6 başlatılmadı; push yapılmadı.
