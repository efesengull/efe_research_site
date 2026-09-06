# Proje durumu — Efe Şengül Research

Son güncelleme: 6 Eylül 2026.

## Güncel faz

**Faz 7 — Kod kalitesi tamamlandı. Faz 8 başlatılmadı.** Yeni faz için kullanıcı talimatı bekleniyor. Bu dosya durum kaydıdır; sonraki fazı kendiliğinden başlatma yetkisi vermez. Güncel kullanıcı isteği ve konuşmadaki kararlar esas alınır.

## Tamamlanan işler

| Faz | Sonuç | Ayrıntılar |
| --- | --- | --- |
| Faz 1 — Tasarım sistemi | Ortak renk, tipografi, boşluk, kenar, gölge ve hareket token'ları oluşturuldu. Koyu kimlik ve responsive düzen rafine edildi; kontrast ve mevcut işlevler kontrol edildi. | [Faz 1 raporu](docs/phase-1.md) |
| Faz 2 — Sinyalden Karara | Ana sayfaya piyasa sinyali, değerleme, risk analizi ve portföy kararı anlatımı eklendi. Doğal kaydırmalı sabit panel, ileri/geri aşama eşleşmesi, mobil/reduced-motion ve JavaScript kapalı alternatifler tamamlandı. | [Faz 2 raporu](docs/phase-2.md) |
| Faz 3 — Hareket sistemi | Ölçülü hero/bölüm girişleri, grafik vurguları, klavye/dokunma karşılıkları, bölüm ilerlemesi ve desteklenen tarayıcılarda View Transitions uygulandı. Video/Canvas durdurma kontrolü ve görünürlük yönetimi doğrulandı. | [Faz 3 raporu](docs/phase-3.md) |
| Faz 4 — Koşullu 3D | Mevcut Canvas 2D, CSS ve SVG yeterli bulundu; WebGL eklenmedi. DPR sınırı, mobil sadeleşme, hareket durdurma ve Canvas/video/poster arızasında statik alternatifler doğrulandı. Uygulama dosyaları değişmedi. | [Faz 4 raporu](docs/phase-4.md) |
| Faz 5 — Performans | Canvas en fazla 30 çizim/s; mobil/düşük kapasiteli tampon 1,25 DPR. Video görünürlük/veri tasarrufu kontrolü ve TradingView'in ekrana yaklaşınca yüklenmesi uygulandı. 30'ar önce/sonra yerel ölçüm, regresyon, görsel ve gerçek ağ kontrolleri tamamlandı. | [Faz 5 raporu](docs/phase-5.md) |
| Faz 6 — Erişilebilirlik | Klavye/odak, arama ve tablo semantiği, durum bildirimleri, metin büyütme, grafik karşılıkları ve ticker hareket kontrolü iyileştirildi. 405 davranış/regresyon kontrolü, 20 axe taraması ve 798 satır kontrast örneği geçti. | [Faz 6 raporu](docs/phase-6.md) |
| Faz 7 — Kod kalitesi | Ortak hareket tercihi, kare planlama, CSS odak/hareket kuralları ve beş testin sunucusu sadeleştirildi. 533 kontrol geçti; 20 görünüm başlangıçla eşleşti, 10 korunan dosyanın hash'i değişmedi. | [Faz 7 raporu](docs/phase-7.md) |

Faz 0 için ayrı bir tamamlanma raporu bu depoda bulunmuyor; bu kayıt Faz 0'ın doğrulandığı iddiasını taşımaz.

## Son doğrulama ve korunan yapı

- Faz 7 sonunda **533/533 kontrol geçti**: 112 işlev/anlatım, 43 hareket, 72 derinlik/fallback, 241 erişilebilirlik, 9 medya/widget, 56 bütünlük/görünüm eşdeğerliği. Beş sayfa dört belirtilen boyutta kontrol edildi; 40 önce/sonra görüntüsü dört karşılaştırma görselinde incelendi. Son koşuda 20 görünümün geometrisi, örneklenen stilleri ve pikselleri başlangıçla birebir eşleşti.
- Ortak asset sürümü **3.7.0**. Beş uygulama + dokuz test/yardımcı JS sözdizimi kontrolünü geçti. DATA_LOCK/veri, render hesaplamaları, canlı adaptör, Canvas, ana tasarım token'ları, medya ve indirmeler dahil **10 dosya hash'i değişmedi**. Beş HTML'de yalnız önbellek sürümü değişti. Kanıtlar [docs/phase-7/](docs/phase-7/) altında.
- Faz 7 başlangıcı **`5315494`**: önceki Faz 6'nın tamamlanması Git'te kayıtlı; aşağıdaki eski commit engeli o oturumun tarihî kaydıdır. Faz 7 commit mesajı **`Faz 7 tamamlandı - Ortak hareket ve test yapılarını sadeleştir`**; kimliği Git kaydından okunabilir. Push yapılmadı.

### Önceki erişilebilirlik doğrulaması (Faz 6)

- Faz 6 sonunda **405 kontrol geçti**: 241 erişilebilirlik, 112 araştırma anlatımı/regresyon, 43 hareket, 9 hedefli medya/widget davranışı. **20 axe-core taramasında 0 otomatik ihlal**; medya katmanları nedeniyle otomatik değerlendirilemeyen alanlarda **798 satır arka plan örneklemesi**, en düşük 4,98:1.
- Beş sayfa dört belirtilen boyutta incelendi; 320px, %200 metin, no-JS mobil, reduced-motion, odak örtülmesi ve ticker yaşam döngüsü ayrıca kontrol edildi. Son hero kontrast düzenlemesi sonrası ana sayfanın dört görüntüsü yenilendi ve tekrar incelendi.
- Ortak asset sürümü **3.6.0**. Beş uygulama ve yedi test JS dosyası sözdizimi kontrolünü geçti. DATA_LOCK/veriler, canlı adaptör, Canvas, medya ve indirmeler korundu; **8 dosya hash'i** ve beş HTML'nin finansal alan/bağlantı/widget/uyarı karşılaştırması geçti. Kanıtlar [docs/phase-6/](docs/phase-6/) altında.
- Faz 6 başlangıcı **`a780b8e`**. Planlanan tamamlanma commit mesajı **`Faz 6 tamamlandı - Klavye ve erişilebilirlik eksiklerini gider`**; bu oturumda `.git` metadata yazma izni ve otomatik inceleme kullanım limiti nedeniyle commit oluşturulamadı. Push yapılmadı.

### Önceki performans ölçümleri (Faz 5)

- Faz 5 sonunda **296 kontrol geçti**: 112 araştırma anlatımı/regresyon, 43 hareket sistemi, 72 derinlik/statik alternatif, 69 performans kontrolü. Ek olarak performans testinin güncellenen 9 davranış kontrolü ayrı çalıştırıldı ve geçti.
- Beş sayfa 1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında kontrol edildi; 20 boyut görüntüsü ve 20 önce/sonra görüntüsü toplu görünümde incelendi. Gerçek TradingView ekranları ayrıca açıldı.
- 4× CPU yavaşlatmalı headless Edge ölçümünde Canvas callback süresi masaüstünde yaklaşık %85–86, mobilde %78–83 azaldı; mobil tampon yaklaşık %52 küçüldü. Başlangıç CLS artmadı. Bunlar saha performansı/GPU/pil ölçümü değildir.
- Gerçek ağ kontrolünde ekran dışındaki widgetların ilk 10 s harici isteği masaüstünde 196→0, mobilde 199→0; kaydırınca 3/3 iframe yüklendi. BIST sağlayıcı veri kısıtı önceki sürümde de mevcut; canlı fiyat doğruluğu doğrulanmadı.
- Beş uygulama ve beş test JavaScript dosyası sözdizimi kontrolünden geçti. Test komutları [README.md](README.md) içinde; kanıtlar [docs/phase-5/](docs/phase-5/) altında.
- Build gerektirmeyen çok sayfalı HTML/CSS/JS mimarisi, finansal değerler, kaynaklar, tarihler, DATA_LOCK, yasal uyarılar ve snapshot/canlı ayrımı korundu. Ortak asset sürümü **3.5.0**. Korunan asset/indirmeler SHA-256 ile, beş HTML'nin içeriği başlangıç sürümüyle karşılaştırılarak doğrulandı.
- Faz 5 başlangıç commit'i **`a3135e3`**; tamamlanma commit mesajı **`Faz 5 tamamlandı - Canvas ve medya yükünü azalt`**. Commit kimliği Git kaydından okunabilir. Bu oturumda push yapılmadı.

## Bekleyen fazlar ve sınırlar

Faz 8 (son doğrulama) henüz başlatılmadı. Önceki fazlarda yapılan ilgili kontroller bu fazın tamamlandığı anlamına gelmez.

Faz 7'de gerçek sağlayıcı ağı, saha performansı, yeni axe/kontrast veya fiziksel cihaz denetimi yapılmadı. Yerel reduced-motion görünüm eşdeğerliği hareketli medyanın her karesini kapsamaz; ilk denemede görülen altı kenar pikseli farkı ve test toleransı Faz 7 raporunda kayıtlıdır. Son karşılaştırmada farklı piksel sayısı sıfırdır.

Son tarayıcı doğrulaması yerel headless Edge/Chromium ile yapıldı. Gerçek düşük güçlü cihaz, GPU/pil tüketimi, saha Core Web Vitals, Safari/Firefox ve tam ekran okuyucu denetimi yapılmadı. Faz 6, WCAG sertifikası değildir; kontrast örneklemesi bütün medya karelerini kapsamaz. Kontrollü testlerde üçüncü taraf ağ kapalı; ticker entegrasyonu yerel iframe fixture ile doğrulandı. Gerçek TradingView erişimi yalnız Faz 5'in ayrı tanısında doğrulanmıştı; sağlayıcı iç arayüzü/fiyat doğruluğu Faz 6'da yeniden doğrulanmadı. Önceki ağ engeli ve BIST veri kısıtı Faz 5 raporunda kayıtlıdır.
