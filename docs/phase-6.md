# Faz 6 — Erişilebilirlik

6 Eylül 2026. **Faz 6 tamamlandı; Faz 7 başlatılmadı.** Başlangıç: `a780b8e`. Ortak asset sürümü `3.6.0`; finansal snapshot sürümü değişmedi.

## Sonuç ve kabul ölçütleri

Beş sayfada başlık sırası, erişilebilir adlar, klavye odağı, arama, tablo sıralama/filtreleme, portföy girdisi, metin büyütme, reduced-motion ve JavaScript kapalı temel erişim denetlendi. Denetim, [WCAG 2.2](https://www.w3.org/TR/WCAG22/) kapsamındaki metin karşılıkları, kontrast, klavye, odak ve durum bildirimi ölçütlerini esas alır. Tam WCAG uygunluk sertifikası veya gerçek ekran okuyucu denetimi iddiası taşımaz.

## Değişiklikler ve gerekçeleri

- **Navigasyon ve odak:** Aktif sayfa `aria-current="page"`; bölüm bağlantıları adlandırılmış navigasyon. Skip-link ana içeriğe odak aktarır, %200 metinde odaksızken tamamen gizlidir. Mobil Escape, gizlenen menü bağlantısından düğmeye döner. Menü ve veri şeridi büyütülmüş metinde satıra yayılır; sabit başlık yüksekliği ResizeObserver ile ölçülür. Scroll sırasında sürekli ölçüm eklenmedi. JS kapalı mobil menü görünür kalır.
- **Arama:** Eksik listbox/option modeli, gerçek bağlantı listesine dönüştürüldü. Tab/Shift+Tab ve Enter yerel tarayıcı davranışını kullanır. Sonuç sayısı ve boş durum `status`; Escape kapatır ve odağı açan kontrole döndürür. Yeniden açıldığında alan ve sonuçlar birlikte sıfırlanır. Küçük ekranda sonuç listesi kaydırılır.
- **Tablolar:** Sütun başlıklarının içinde yerel düğme, başlıkta `aria-sort`, sonuç/sıralama bildirimi ve görünür odak kullanılır. Bu yapı [WAI sıralanabilir tablo örneğini](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/) izler. Sektör değişince eski sıralama durumu temizlenir. Korelasyon matrisi adlandırılmış klavye kaydırma bölgesidir; satır/sütun başlıklarının `scope` değeri vardır.
- **Portföy:** Hazır tutar ve sektör seçimi `aria-pressed` ile aktarılır. Sermaye yardım metni alanla ilişkilendirildi. Her tuşta sınırlandırma kaldırıldı; alan terk edilince aynı sınır ve hesaplama kuralları uygulanır. Güncellenen sermaye için kısa durum bildirimi vardır.
- **Metin karşılıkları ve kontrast:** Hisse skor çubuğunun sayısı aynı kartta gösterilir. Kaynak bağlantıları kaynak adını içerir. Piyasa şeridinin erişilebilir adı görünür/güncellenen fiyat ve yüzde metninden türetilir; eski snapshot fiyatını saklayan sabit label kaldırıldı. Dekoratif videolar gizlendi; Canvas mevcut gizli semantiğini korur. Hero metadata etiketi açıklaştırıldı ve metin arkasına koyu zemin eklendi; medya parlaklığına bağlı düşük kontrast örnekleri giderildi.
- **Ticker:** Yerel gizle/göster düğmesi iframe'i kaldırarak hareketi durdurur. Reduced-motion ve genel hareket durdurma altında yüklenmez/kaldırılır; diğer iki TradingView monitörü korunur. Hareket kapalıyken düğme neden kapalı olduğunu metinle belirtir. Eksik iframe başlığı ilgili içerik başlığından üretilir. Sağlayıcı sembolleri, JSON yapılandırması ve bağlantıları değişmedi.

## Doğrulama

| Kontrol | Sonuç |
| --- | --- |
| Faz 6 erişilebilirlik davranışları | **241/241** |
| Araştırma anlatımı ve işlev regresyonu | **112/112** |
| Hareket, klavye/dokunma, görünürlük ve sekme durumu | **43/43** |
| Faz 5 hedefli medya/widget davranışları | **9/9** |
| axe-core 4.10.3: 5 sayfa × 2 boyut × kapalı/açık arama | **20 tarama, 0 otomatik ihlal** |
| Otomatik değerlendirilemeyen metinlerin arka plan örneklemesi | **798 satır, eşik altında 0**; en düşük örnek **4,98:1** |
| Sözdizimi ve diff | 5 uygulama + 7 test JS dosyası geçti; `git diff --check` geçti |

405 davranış/regresyon kontrolü; 20 axe taraması ve kontrast örnekleri bu sayıya eklenmedi. Başlangıç axe taramasında 13 kural/durum ihlali ve 40 öğe bildirimi vardı; bunlar benzersiz 40 sorun olarak yorumlanmamalıdır. Kontrast başlangıcında medya katmanları yüzünden otomatik karar verilemeyen alanlar vardı; ek örnekleme 4,25:1 metadata ve 4,41:1 açıklama örneklerini ortaya çıkardı. Metin zemini düzenlendikten sonra 798 satır örneklemesi geçti.

1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında 20 görüntü incelendi. Ek olarak 320px, %200 metin, JS kapalı mobil, reduced-motion, matris kaydırma ve odak geometrileri kontrol edildi. Görsel inceleme büyütülmüş metindeki skip-link şeridini ortaya çıkardı; düzeltildi. Hero metninin okunabilirliği son kontrast düzenlemesinden sonra tekrar incelendi. Dekoratif derinlik ve editoryal hiyerarşi korundu.

## Bütünlük ve kanıtlar

`data.js`, `live-adapter.js`, `finance-3d-background.js`, tüm medya ve indirmeler dahil **8 dosyanın SHA-256'sı** başlangıçla aynı. Beş HTML'nin bağlantıları/script sırası, finansal veri nitelikleri, widget JSON'ları ve uyarıları karşılaştırıldı. App render değişiklikleri semantik ve metin karşılıklarıyla sınırlı; değer ve hesaplama formülleri diff üzerinden incelendi. Eski testte `app.js` için değişmezlik kontrolü bu yetkili düzenleme nedeniyle kaldırıldı; veri, canlı adaptör ve indirme hash kontrolleri korunuyor.

[Erişilebilirlik sonuçları](phase-6/accessibility-results.json) · [Regresyon](phase-6/regression/test-results.json) · [Hareket](phase-6/motion/test-results.json) · [Başlangıç axe](phase-6/axe-before/results.json) · [Son axe](phase-6/axe-after/results.json) · [Kontrast örnekleri](phase-6/axe-after/contrast-samples.json) · [Bütünlük](phase-6/integrity.json) · [20 görünüm](phase-6/viewport-contact-sheet.jpg) · [Değişen dosyalar](phase-6/changed-files.txt).

## Sınırlar ve kapanış

Testler yerel headless Edge/Chromium'da çalıştı. NVDA/JAWS/VoiceOver, Safari/Firefox ve gerçek cihaz denetimi yapılmadı. axe'in medya/gradient nedeniyle otomatik karar veremediği kontrast alanları statik reduced-motion ekran örnekleriyle desteklendi; hareketli medyanın her karesi veya bütün arka plan pikselleri ölçülmedi. Üçüncü taraf ağ kontrollü testlerde kapalıdır. Ticker'ın 9 yaşam döngüsü kontrolü finansal veri içermeyen yerel iframe fixture kullanır; gerçek TradingView iç arayüzü, klavye düzeni, sağlayıcı kontrastı veya canlı fiyat doğruluğu bu fazda yeniden doğrulanmadı. Önceki fazdaki sağlayıcı BIST erişim sınırı devam eden bir dış hizmet sınırıdır.

Değişen uygulama dosyaları: beş HTML, `assets/css/research-os.css`, `assets/js/app.js`, `assets/js/platform-ui.js`. Testler: iki yeni erişilebilirlik betiği, iki mevcut regresyon betiğinin güncel semantik/sürüm beklentileri. README, PROJECT_STATUS, bu rapor ve Faz 6 kanıtları güncellendi.

Planlanan commit mesajı: **`Faz 6 tamamlandı - Klavye ve erişilebilirlik eksiklerini gider`**. `.git` metadata yazma izni ve otomatik inceleme kullanım limiti nedeniyle bu oturumda commit oluşturulamadı; push yapılmadı. Sonraki faz için yeni talimat bekleniyor.
