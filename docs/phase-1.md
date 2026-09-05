# Faz 1 — Ortak tasarım sistemi

5 Eylül 2026. Yalnız Faz 1 uygulandı. Statik HTML/CSS/JS mimarisi ve koyu Research OS kimliği korundu.

## Kararlar ve kullanım

Tasarım yönü: Sinematik Kanıt Masası. Editoryal başlıklar, okunabilir veri katmanları, mat yüzeyler ve yeşil ana aksiyonlar. Yeni font dosyası, framework, medya veya bağımlılık eklenmedi.

| Alan | Ortak karar |
| --- | --- |
| Renk | `--color-bg`, `--color-surface*`, `--color-text*`; sinyal yeşil, referans mavi, dikkat altın, risk kırmızı |
| Tipografi | `--font-editorial`: Georgia; `--font-ui`: Segoe UI/sistem; `--font-data`: Consolas/eşit aralıklı font |
| Ölçek | Yardımcı metin 12 px, küçük metin 13 px, arayüz 14 px, gövde 16 px; başlıklar akışkan `clamp()` |
| Satır | `--measure-copy`: 65ch; `--measure-lead`: 60ch; `--measure-title`: 24ch; gövde satır yüksekliği 1,65 |
| Boşluk | `--space-*`: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96 px; bölüm ve sayfa kenar boşlukları akışkan |
| Kenar / derinlik | 3/6/10 px radius; ayrı dekoratif ve kontrol kenarlıkları; üç gölge seviyesi |
| Hareket | Mikro 180 ms, arayüz 400 ms, anlatı 760 ms; `cubic-bezier(.22,1,.36,1)` |

Temel kararlar `styles.css` başında tek kaynaktır. Mevcut `--bg`, `--green`, `--radius` ve `--os-*` adları geriye uyumlu alias olarak bu kaynağa bağlıdır. `research-os.css` ortak bileşenleri ve responsive kompozisyonu taşır. Yeni bir sayfa için ayrı renk veya metin ölçeği tanımlamayın.

Hareket süreleri mevcut geçişlere bağlandı; yeni anlatı, parallax veya pinned-scroll eklenmedi. Anlatı token'ı sonraki kullanım için tanımlıdır. Reduced-motion altında süreler sıfırlanır; mevcut video/canvas duraklama davranışları korunur.

Tablet ve küçük masaüstünde brifing tam satır, endeks ile sinyal paneli alt sırada yer alır. 860 px ve altında tek kolona geçilir. Sabit sekme ve anchor boşlukları aynı `--shell-sticky-offset` değerinden türetilir. Mobil menü piyasa bandının üstünde kalır.

## Doğrulama

- Beş sayfa 1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında yerel Edge/Chromium ile denetlendi. 20 kombinasyonda yatay sayfa taşması, kırık görsel veya yeni JavaScript çalışma hatası bulunmadı. Görünür HTML metinleri en az 12 px; canvas içindeki dekoratif yazılar bu ölçüme dahil değil.
- Önce/sonra görüntüleri karşılaştırıldı. İlk görsel turdan sonra mobil bölüm başlıkları, kart içi boşluklar, aksiyon boyutu ve kaynak etiketinin satır kırılması yeniden düzenlendi.
- 1024 px sekmelerinde eski 43 px konum yerine navigasyonun bittiği 75 px doğrulandı. Masaüstünde 45 px, mobilde 69 px konumları ilgili üst çubukla hizalı. Ek olarak 861/1120/1121/1300/1301 px kırılım sınırlarında sayfa taşması kontrol edildi.
- Ortak metin ve durum renklerinin beş düz koyu yüzeyle tüm eşleşmeleri ölçüldü: en düşük **5,24:1**. Kontrol kenarlığının en açık koyu yüzeyle oranı **3,10:1**. Bunlar token çiftlerinin hesaplarıdır; tam WCAG uygunluk denetimi değildir.
- Global arama, sektör filtresi, metin filtresi, fare/klavye sıralaması, 250.000 TL portföy hesabı, min/max sermaye, senaryolar, mobil menü ve indirmeler dahil 33 işlev/bütünlük kontrolü geçti. 39 yerel href/src/anchor hedefi doğrulandı. Mobil menünün ilk bağlantısının üstünde örtüşen öğe bulunmadığı ayrıca kontrol edildi.
- Kontrollü 503 quote hatasında 70 fiyat alanı korundu. Reduced-motion altında beş sayfanın videosu durdu ve ana canvas sabit kaldı. Normal modda video/canvas çalıştı; hero ekran dışına çıktığında durdu. Odak halkası ve arama alanının odak vurgusu doğrulandı.
- Beş JavaScript dosyası `node --check` kontrolünden geçti. JavaScript ve DOCX dosyalarının SHA-256 değerleri değişmedi. Beş HTML dosyasında asset sürümü dışında içerik değişmedi; finansal değerler, kaynaklar, tarihler, yasal metinler ve bağlantılar korundu.
- TradingView için ağ erişimli ayrı kontrolde üç iframe yüklendi. Bazı BIST sembollerinde sağlayıcının “yalnızca TradingView'de mevcut” sınırlaması sürdü; canlı fiyat doğruluğu doğrulanmadı.

Ölçümler yerel geliştirme ortamına aittir. Core Web Vitals veya gerçek kullanıcı performansı bu fazda ölçülmedi. Token isimleri nedeniyle CSS kaynak boyutu arttı; yeni ağ bağımlılığı eklenmedi.

## Dosyalar ve sınırlar

Değişen dosyalar: `assets/css/styles.css`, `assets/css/research-os.css`, beş ana HTML dosyası (yalnız `?v=3.2.0`), `README.md` ve bu rapor.

Checkout'ta `.git` bulunmadığı için commit oluşturulmadı. Yerel önizleme 8765 portunda sunuldu; 8000 portundaki eski süreç kullanılmadı.

Faz 0'daki JavaScript olmadan araştırma verisinin eksikliği, metodoloji pencere ifadeleri ve canlı adaptörde same-origin zorlaması sorunları bu tasarım fazında çözülmedi. Bunlar genel proje tamamlandı olarak değerlendirilemez. Veri sürümü ile asset sürümünün farklı olması tek başına mimari hata değildir.

Faz 2 başlatılmadı.
