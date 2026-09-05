Her yeni görevde önce repo kökündeki `PROJECT_STATUS.md` dosyasını oku; güncel fazı ve tamamlanan işleri dikkate al.

# Repository Guidelines

## Proje Yapısı ve Mimari

Bu Türkçe statik site build gerektirmez. Kök girişleri `index.html`, `live.html`, `report.html`, `portfolio.html` ve `methodology.html` dosyalarıdır. Stiller `assets/css/`; veri, render, UI, canlı fiyat ve canvas kodları sırasıyla `assets/js/data.js`, `app.js`, `platform-ui.js`, `live-adapter.js` ve `finance-3d-background.js` içindedir. Medyayı `assets/img/` veya `assets/video/`, raporları `downloads/` altında tutun. Framework'e geçmeyin; arama, tablolar, portföy simülatörü, medya fallback'leri, TradingView ve canlı veri akışını koruyun.

## Yerel Geliştirme Komutları

Paket kurulumu veya build adımı yoktur. Depo kökünde çalıştırın:

```powershell
python -m http.server 8000
Get-ChildItem assets/js/*.js | ForEach-Object { node --check $_.FullName }
```

Site `http://localhost:8000/index.html` adresinde açılır. TradingView internet gerektirir.

## Kodlama ve Tasarım Kuralları

HTML, CSS ve JavaScript'te iki boşluk girinti kullanın. JavaScript'te tek tırnak, noktalı virgül, `camelCase` ve büyük harfli ortak sabitler; CSS sınıfları, dosyalar ve `data-*` hook'larında kebab-case kullanın. Script sırasını (`data.js` önce), Türkçe biçimlendirmeyi ve tüm sayfalardaki `?v=` değerlerini tutarlı tutun.

Kodu önce okuyup değişiklik yapın. Sayfaya özel yama yerine ortak primitive kullanın; eski kodu veya asset'i izinsiz silmeyin. Koyu, editoryal ve kurumsal kimliği koruyun. Animasyon ölçülü ve anlamlı olsun; yaygın glassmorphism, neon blob, aşırı yuvarlatma, parçacık, cursor değiştirme, scroll hijacking, uzun intro ve dekoratif 3D kullanmayın.

## Performans, Erişilebilirlik ve Progressive Enhancement

Öncelikle `transform` ve `opacity` kullanın; scroll sırasında sürekli layout ölçmeyin. Animasyon/video/canvas'ı görünmezken durdurun, DPR'yi sınırlayın ve medyayı lazy-load edin. Ağır bağımlılıklardan kaçının; JavaScript çalışmasa da temel içerik görünsün.

Semantik başlık sırasını, klavye kullanımını, görünür `focus-visible` durumlarını ve yeterli kontrastı koruyun. Bilgiyi yalnızca renkle aktarmayın; dekoratif medyayı ekran okuyucudan gizleyin. `prefers-reduced-motion` altında parallax, autoplay, scrub ve büyük hareketleri kaldırın.

## Test ve Görsel Doğrulama

Otomatik test veya coverage eşiği yoktur. Beş sayfayı 1440×900, 1024×768, 768×1024 ve 390×844 boyutlarında kontrol edin. Navigasyon, `/` araması, tablo ve portföy araçları, indirmeler ve canlı fallback çalışmalı; taşma, kırık link veya konsol hatası olmamalıdır. Klavye/focus, reduced-motion, snapshot-canlı ayrımı ve medya duraklamasını doğrulayın. Gelecekteki testleri `tests/<feature>.test.js` biçiminde ekleyip komutunu `README.md` içinde belgeleyin.

## Veri Güvenliği ve Bütünlüğü

Sahte finansal veri, API anahtarı, vendor parolası veya lisansı belirsiz görsel eklemeyin. Kimlik doğrulamalı fiyatları aynı-origin sunucu proxy'sinden geçirin. Snapshot değerlerini, `DATA_LOCK` tarihlerini, kaynak kayıtlarını ve ilgili anlatıyı birlikte güncelleyin; kaynak/tarih görünürlüğünü ve yatırım uyarısını koruyun.

## Commit ve Pull Request Kuralları

Bu checkout'ta Git metadata bulunmadığından geçmişe dayalı bir mesaj standardı çıkarılamaz. `fix: preserve quote fallback state` gibi kısa ve emir kipinde başlıklar kullanın. Pull request'te etkilenen sayfaları, manuel kontrolleri, ilgili issue'yu ve değişen veri kaynak/tarihlerini belirtin; görsel değişikliklere önce/sonra ekran görüntüsü ekleyin.

Faz tamamlama protokolü:
Her faz tamamlandığında sırayla:
1. PROJECT_STATUS.md dosyasını güncelle (tamamlanan faz ve yapılan işler).
2. git add ve git commit işlemlerini otomatik yap (commit mesajı: "Faz X tamamlandı - [kısa özet]").
3. Commit mesajını ve değişen dosya listesini bana göster.
4. git push işlemini YAPMA — onay bekle. Ben "pushla" dediğimde push et.