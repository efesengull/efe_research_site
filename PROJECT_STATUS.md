# Proje durumu — Efe Şengül Research

Son güncelleme: 5 Eylül 2026.

## Güncel faz

**Faz 5 — Performans tamamlandı. Faz 6 başlatılmadı.** Yeni faz için kullanıcı talimatı bekleniyor. Bu dosya durum kaydıdır; sonraki fazı kendiliğinden başlatma yetkisi vermez. Güncel kullanıcı isteği ve konuşmadaki kararlar esas alınır.

## Tamamlanan işler

| Faz | Sonuç | Ayrıntılar |
| --- | --- | --- |
| Faz 1 — Tasarım sistemi | Ortak renk, tipografi, boşluk, kenar, gölge ve hareket token'ları oluşturuldu. Koyu kimlik ve responsive düzen rafine edildi; kontrast ve mevcut işlevler kontrol edildi. | [Faz 1 raporu](docs/phase-1.md) |
| Faz 2 — Sinyalden Karara | Ana sayfaya piyasa sinyali, değerleme, risk analizi ve portföy kararı anlatımı eklendi. Doğal kaydırmalı sabit panel, ileri/geri aşama eşleşmesi, mobil/reduced-motion ve JavaScript kapalı alternatifler tamamlandı. | [Faz 2 raporu](docs/phase-2.md) |
| Faz 3 — Hareket sistemi | Ölçülü hero/bölüm girişleri, grafik vurguları, klavye/dokunma karşılıkları, bölüm ilerlemesi ve desteklenen tarayıcılarda View Transitions uygulandı. Video/Canvas durdurma kontrolü ve görünürlük yönetimi doğrulandı. | [Faz 3 raporu](docs/phase-3.md) |
| Faz 4 — Koşullu 3D | Mevcut Canvas 2D, CSS ve SVG yeterli bulundu; WebGL eklenmedi. DPR sınırı, mobil sadeleşme, hareket durdurma ve Canvas/video/poster arızasında statik alternatifler doğrulandı. Uygulama dosyaları değişmedi. | [Faz 4 raporu](docs/phase-4.md) |
| Faz 5 — Performans | Canvas en fazla 30 çizim/s; mobil/düşük kapasiteli tampon 1,25 DPR. Video görünürlük/veri tasarrufu kontrolü ve TradingView'in ekrana yaklaşınca yüklenmesi uygulandı. 30'ar önce/sonra yerel ölçüm, regresyon, görsel ve gerçek ağ kontrolleri tamamlandı. | [Faz 5 raporu](docs/phase-5.md) |

Faz 0 için ayrı bir tamamlanma raporu bu depoda bulunmuyor; bu kayıt Faz 0'ın doğrulandığı iddiasını taşımaz.

## Son doğrulama ve korunan yapı

- Faz 5 sonunda **296 kontrol geçti**: 112 araştırma anlatımı/regresyon, 43 hareket sistemi, 72 derinlik/statik alternatif, 69 performans kontrolü. Ek olarak performans testinin güncellenen 9 davranış kontrolü ayrı çalıştırıldı ve geçti.
- Beş sayfa 1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında kontrol edildi; 20 boyut görüntüsü ve 20 önce/sonra görüntüsü toplu görünümde incelendi. Gerçek TradingView ekranları ayrıca açıldı.
- 4× CPU yavaşlatmalı headless Edge ölçümünde Canvas callback süresi masaüstünde yaklaşık %85–86, mobilde %78–83 azaldı; mobil tampon yaklaşık %52 küçüldü. Başlangıç CLS artmadı. Bunlar saha performansı/GPU/pil ölçümü değildir.
- Gerçek ağ kontrolünde ekran dışındaki widgetların ilk 10 s harici isteği masaüstünde 196→0, mobilde 199→0; kaydırınca 3/3 iframe yüklendi. BIST sağlayıcı veri kısıtı önceki sürümde de mevcut; canlı fiyat doğruluğu doğrulanmadı.
- Beş uygulama ve beş test JavaScript dosyası sözdizimi kontrolünden geçti. Test komutları [README.md](README.md) içinde; kanıtlar [docs/phase-5/](docs/phase-5/) altında.
- Build gerektirmeyen çok sayfalı HTML/CSS/JS mimarisi, finansal değerler, kaynaklar, tarihler, DATA_LOCK, yasal uyarılar ve snapshot/canlı ayrımı korundu. Ortak asset sürümü **3.5.0**. Korunan asset/indirmeler SHA-256 ile, beş HTML'nin içeriği başlangıç sürümüyle karşılaştırılarak doğrulandı.
- Faz 5 başlangıç commit'i **`a3135e3`**; tamamlanma commit mesajı **`Faz 5 tamamlandı - Canvas ve medya yükünü azalt`**. Commit kimliği Git kaydından okunabilir. Bu oturumda push yapılmadı.

## Bekleyen fazlar ve sınırlar

Faz 6 (erişilebilirlik), Faz 7 (kod kalitesi) ve Faz 8 (son doğrulama) henüz başlatılmadı. Önceki fazlarda yapılan ilgili kontroller bu fazların tamamlandığı anlamına gelmez.

Son tarayıcı doğrulaması yerel headless Edge/Chromium ile yapıldı. Gerçek düşük güçlü cihaz, GPU/pil tüketimi, saha Core Web Vitals, Safari/Firefox ve tam ekran okuyucu denetimi yapılmadı. Kontrollü performans/regresyon testlerinde üçüncü taraf ağ kapalı; ayrı tanıda gerçek TradingView script/iframe erişimi doğrulandı. İlk ağ engeli ve sağlayıcının önce/sonra görülen BIST veri kısıtı raporda kayıtlıdır. Diğer teknik sınırlar faz raporlarında belirtilmiştir.
