# Faz 3 — Hareket sistemi

5 Eylül 2026. Yalnız Faz 3 tamamlandı; Faz 4 başlatılmadı.

## Sonuç ve kararlar

- Faz 1'in 180 ms mikro, 400 ms arayüz, 760 ms anlatı ve `cubic-bezier(.22,1,.36,1)` token'ları kullanıldı. Hero başlığı/özeti ve bölüm başlıkları bir kez, en fazla 10 px yükselme ve opacity ile girer. Veri tablolarına toplu giriş veya sayı saydırma eklenmedi. BIST grafik alanı ve portföy dağılımı yalnız kısa opacity vurgusu alır; değerleri değişmez.
- `initMotion`, IntersectionObserver ve Web Animations API üzerinden ortak davranışı yönetir. Temel CSS içeriği gizlemez. Girişler tekrarlanmaz; görünümden çıkınca, odak gelince, sekme gizlenince veya reduced-motion etkinleşince iptal olur. API desteği yoksa içerik statik görünür.
- Hero'daki **Hareketi durdur / sürdür** kontrolü mevcut video ve Canvas'ı birlikte yönetir; klavye/dokunma ile çalışır ve `aria-pressed` sunar. Reduced-motion altında kontrol gizlenir, autoplay ve pin kapanır. Kontrol sayfa kapsamındadır.
- Mevcut Canvas parallax'ı yalnız `(hover: hover) and (pointer: fine)` ve uygun hareket tercihi altında çalışır. Dokunma olayları yok sayılır, tercih değişiminde koordinatlar sıfırlanır. Genlik katsayıları yatayda `.012`, dikeyde `.008` oldu. Pointer hareketi başına geometri ölçülmez; giriş/resize ölçümü kullanılır. Yeni Canvas veya ikinci sürekli hareket döngüsü eklenmedi. DPR sınırı ve sahne sadeleştirmesi korundu.
- Video/Canvas görünürlük payı kaldırıldı; hero ekran dışında durur. Metodoloji bölümünün sonsuz dekoratif CSS kayması ve eski grafik çizgi döngüsü statik hale getirildi; mevcut görseller ve kod varlıkları korundu.
- Etkileşimli kart/bağlantılarda ölçülü hover, focus-visible/focus-within ve active karşılıkları vardır. Dokunmada hover yükselmesi kapalıdır. Tablolar adlandırılmış, klavyeyle odaklanabilir bölgelerdir; sütun sıralama odağı belirgindir.
- Dört iç sayfanın mevcut bölüm sekmeleri, tek `aria-current="location"`, metin sayacı ve transform ile ilerleyen ince çizgi kullanır. Bölüm seçimi önbelleklenmiş eşiklerden hesaplanır; ileri/geri sıçrama ve kısa son bölüm için sayfa sonu ele alınır. Scroll sırasında geometri ölçülmez, tek bekleyen rAF kullanılır. Ana sayfanın Faz 2 aşama göstergesi korunur.
- Aynı origin sayfa geçişleri destekleyen tarayıcılarda 180/400 ms kök opacity geçişidir. Yerel bağlantılar ve tarayıcı geçmişi kullanılır. Reduced-motion ve elle durdurulmuş sayfadan çıkışta geçiş atlanır. Beş ortak script, `data → canvas → app → platform-ui → live-adapter` sırası korunarak head içinde `defer` yüklenir. Platform UI için `blocking="render"`, `pagereveal` dinleyicisini ilk çizim öncesine alır; atlanan geçişin `ready` reddi kendi promise'inde ele alınır. Bu düzenleme testteki `Transition was skipped` hatasını giderdi. Özel yönlendirme veya yeni bağımlılık eklenmedi.

Geçiş yaşam döngüsü ve ilk çizim gereksinimi [Chrome'un resmi çok sayfalı View Transitions belgesine](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) göre uygulandı. Görünürlük yaklaşımı [Intersection Observer dokümantasyonuyla](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) kontrol edildi.

## Kabul ölçütleri ve doğrulama

- `node tests/research-story.test.js`: **112 kontrol geçti**. Beş sayfa × 1440×900, 1024×768, 768×1024 ve 390×844; taşma, yerel görsel, navigasyon, link/indirme/anchor ve JS hata kontrolleri. Faz 2 ileri/geri anlatımı, statik/reduced-motion, arama, filtreler, model sermaye, canlı 503 fallback ve veri ayrımı korundu.
- `node tests/motion-system.test.js`: **43 kontrol geçti**. Girişlerin tek seferliği ve sonlanması, 760 ms token, klavye/dokunma durdurma, video/Canvas durması, pointer ve scroll sırasında tekrar geometri okumama, dört iç sayfada ileri/geri bölüm seçimi, klavye tablo sıralaması, dinamik reduced-motion, JavaScript kapalı anlatım, gerçek yerel sayfa geçişinin `ready` durumuna ulaşması ve reduced-motion altında atlanması.
- Ölçülen etkileşimlerde pointer hareket dizisi ve bölüm scroll güncellemesi için **0 yeni hedef geometri okuması**; durdurma ve görünüm dışında bekleme sırasında **0 yeni Canvas çizimi**. Bunlar yerel davranış ölçümleridir; Core Web Vitals veya genel performans sonucu değildir.
- Beş uygulama JS dosyası ve iki test betiği `node --check` kontrolünden geçti. Testlerde yeni JavaScript çalışma hatası kalmadı.
- `data.js`, `app.js`, `live-adapter.js` ve indirme dosyalarının SHA-256 değerleri Faz 3 başlangıcıyla aynı. Finansal değer, kaynak, tarih, DATA_LOCK, yasal uyarı ve veri bağlantıları değiştirilmedi. Ortak asset sürümü `3.4.0`.
- 20 ekranın toplu görseli, masaüstü/mobil önce-sonra, risk katmanı ve tablo odağı incelendi. İlk turdan sonra mobil hareket kontrolü daha dar tutuldu; ana eylemlerin görsel önceliği korundu.

## Dosyalar ve kanıtlar

Uygulama: `assets/js/platform-ui.js`, `assets/js/finance-3d-background.js`, `assets/css/research-os.css`; beş HTML dosyasında ortak script yükleme ve sürüm parametreleri. Belgeleme/test: `README.md`, `tests/research-story.test.js`, `tests/motion-system.test.js`, bu rapor ve `docs/phase-3/`.

[43 hareket sonucu](phase-3/motion-results.json) · [112 regresyon sonucu](phase-3/regression/test-results.json) · [bütünlük kaydı](phase-3/baseline-hashes.json) · [20 ekran](phase-3/viewport-contact-sheet.jpg) · [Faz 2 masaüstü](phase-3/phase-2-desktop.png) · [Faz 3 masaüstü](phase-3/after-desktop.png) · [Faz 2 mobil](phase-3/phase-2-mobile.png) · [Faz 3 mobil](phase-3/after-mobile.png) · [tablo odağı](phase-3/table-focus.png) · [risk](phase-3/story-risk.png) · [reduced-motion](phase-3/reduced-motion.png).

## Gerçek sınırlamalar

Kullanıcının Faz 2 Git kaydı bu oturumda görünmüyor: `.git` yok ve iki Git yürütücüsü `fatal: cannot change to 'C:/Users/user'` veriyor. Yeni repo oluşturulmadı; commit atılmadı.

Doğrulama yerel headless Edge/Chromium üzerinde yapıldı. Üçüncü taraf ağ testlerde kapalı; TradingView kodu ve bağlantıları korunmakla birlikte sağlayıcı erişimi/canlı fiyat doğruluğu ölçülmedi. Sekme görünürlük işleyicisi, kontrollü `document.hidden`/`visibilitychange` simülasyonuyla test edildi; gerçek işletim sistemi sekme geçişi yapılmadı. Safari/Firefox, gerçek dokunmatik cihaz ve tam ekran okuyucu denetimi yapılmadı. Render-blocking değişiminin uzak ağ koşullarındaki yükleme maliyeti ve Core Web Vitals bu fazda ölçülmedi. Yeni hareketler olmadan temel içerik korunur; Faz 2'de belgelenen diğer eski JS bağımlı veri alanları değişmedi. Faz 5–8 denetimleri bu raporla tamamlanmış sayılmaz.
