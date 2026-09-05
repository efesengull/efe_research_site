# Proje durumu — Efe Şengül Research

Son güncelleme: 5 Eylül 2026.

## Güncel faz

**Faz 4 — Koşullu 3D tamamlandı. Faz 5 başlatılmadı.** Yeni faz için kullanıcı talimatı bekleniyor. Bu dosya durum kaydıdır; sonraki fazı kendiliğinden başlatma yetkisi vermez. Güncel kullanıcı isteği ve konuşmadaki kararlar esas alınır.

## Tamamlanan işler

| Faz | Sonuç | Ayrıntılar |
| --- | --- | --- |
| Faz 1 — Tasarım sistemi | Ortak renk, tipografi, boşluk, kenar, gölge ve hareket token'ları oluşturuldu. Koyu kimlik ve responsive düzen rafine edildi; kontrast ve mevcut işlevler kontrol edildi. | [Faz 1 raporu](docs/phase-1.md) |
| Faz 2 — Sinyalden Karara | Ana sayfaya piyasa sinyali, değerleme, risk analizi ve portföy kararı anlatımı eklendi. Doğal kaydırmalı sabit panel, ileri/geri aşama eşleşmesi, mobil/reduced-motion ve JavaScript kapalı alternatifler tamamlandı. | [Faz 2 raporu](docs/phase-2.md) |
| Faz 3 — Hareket sistemi | Ölçülü hero/bölüm girişleri, grafik vurguları, klavye/dokunma karşılıkları, bölüm ilerlemesi ve desteklenen tarayıcılarda View Transitions uygulandı. Video/Canvas durdurma kontrolü ve görünürlük yönetimi doğrulandı. | [Faz 3 raporu](docs/phase-3.md) |
| Faz 4 — Koşullu 3D | Mevcut Canvas 2D, CSS ve SVG yeterli bulundu; WebGL eklenmedi. DPR sınırı, mobil sadeleşme, hareket durdurma ve Canvas/video/poster arızasında statik alternatifler doğrulandı. Uygulama dosyaları değişmedi. | [Faz 4 raporu](docs/phase-4.md) |

Faz 0 için ayrı bir tamamlanma raporu bu depoda bulunmuyor; bu kayıt Faz 0'ın doğrulandığı iddiasını taşımaz.

## Son doğrulama ve korunan yapı

- Faz 4 sonunda **227 kontrol geçti**: 112 araştırma anlatımı/regresyon, 43 hareket sistemi, 72 derinlik/statik alternatif kontrolü.
- Beş sayfa 1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında kontrol edildi; 20 ekran görüntüsünün toplu görünümü incelendi.
- Beş uygulama ve üç test JavaScript dosyası sözdizimi kontrolünden geçti. Test komutları [README.md](README.md) içinde; kanıtlar [docs/phase-4/](docs/phase-4/) altında.
- Build gerektirmeyen çok sayfalı HTML/CSS/JS mimarisi, finansal değerler, kaynaklar, tarihler, DATA_LOCK, yasal uyarılar ve snapshot/canlı ayrımı korundu. Ortak asset sürümü **3.4.0**.
- Son tamamlanan fazın yerel commit'i: **`2975683` — `test: qualify phase 4 depth and static fallbacks`**. Bu commit çalışma oturumunda GitHub'a gönderilmedi; uzak depo durumu ayrıca doğrulanmadı.

## Bekleyen fazlar ve sınırlar

Faz 5 (performans), Faz 6 (erişilebilirlik), Faz 7 (kod kalitesi) ve Faz 8 (son doğrulama) henüz başlatılmadı. Önceki fazlarda yapılan ilgili kontroller bu fazların tamamlandığı anlamına gelmez.

Son tarayıcı doğrulaması yerel headless Edge/Chromium ile yapıldı. Gerçek düşük güçlü cihaz, GPU/pil tüketimi, Core Web Vitals, Safari/Firefox ve tam ekran okuyucu denetimi yapılmadı. Üçüncü taraf ağ testlerde kapalıydı; TradingView hizmet erişimi ve canlı fiyat doğruluğu doğrulanmadı. Diğer teknik sınırlar faz raporlarında kayıtlıdır.
