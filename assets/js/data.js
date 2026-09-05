const DATA_LOCK = {
  version: 'Research OS v3.0',
  reportDate: 'Eylül 2026',
  dataDate: '04 Eylül 2026',
  marketReferenceDate: '04 Eylül 2026',
  marketReferenceTime: '18:30 TSİ',
  macroDate: '14 Ağustos 2026',
  fundReferenceDate: '04 Eylül 2026',
  bistReference: '14.012,42',
  bistDailyChange: '+%0,57',
  bistPrevious: '13.932,46',
  bistHigh: '14.066,72',
  bistLow: '13.895,82',
  usdTry: '48,4436',
  eurTry: '56,2917',
  gramGold: '6.920,33',
  inflationYE: '%29,43',
  inflation12m: '%23,69',
  author: 'Efe Şengül',
  qualityScore: 'Kontrollü',
  aiNote: 'Yapay zeka; metin düzenleme, tablo yapılandırma, kaynak kontrol çerçevesi, senaryo anlatımı ve web tasarım desteği için kullanılmıştır. Nihai değerlendirme ve sorumluluk raporu hazırlayan kişiye aittir.'
};

const marketSnapshot = [
  {code:'MGROS', name:'Migros', price:527.00, change:2.13, tone:'positive'},
  {code:'ASELS', name:'Aselsan', price:388.25, change:2.10, tone:'positive'},
  {code:'TCELL', name:'Turkcell', price:98.15, change:1.60, tone:'positive'},
  {code:'THYAO', name:'Türk Hava Yolları', price:296.00, change:1.54, tone:'positive'},
  {code:'BIMAS', name:'BİM', price:415.75, change:0.73, tone:'positive'},
  {code:'ISCTR', name:'İş Bankası C', price:13.01, change:0.46, tone:'positive'},
  {code:'AKBNK', name:'Akbank', price:71.85, change:0.42, tone:'positive'},
  {code:'GARAN', name:'Garanti BBVA', price:131.40, change:0.00, tone:'flat'},
  {code:'YKBNK', name:'Yapı Kredi', price:35.90, change:0.00, tone:'flat'},
  {code:'TUPRS', name:'Tüpraş', price:388.50, change:-0.64, tone:'negative'}
];

const marketTape = [
  {code:'XU100', label:'BIST 100', value:'14.012,42', change:0.57},
  {code:'USDTRY', label:'Dolar / TL', value:'48,4436', change:0.18},
  {code:'EURTRY', label:'Euro / TL', value:'56,2917', change:-0.14},
  {code:'XAUTRY', label:'Gram Altın', value:'6.920,33', change:-0.43},
  {code:'BRENT', label:'Brent', value:'95,11 USD', change:null}
];

const insightCards = [
  {
    label: 'Araştırma Omurgası',
    title: '10 hisse + 10 fon',
    body: 'Banka, enerji, savunma, perakende, telekom, yabancı teknoloji, para piyasası, altın ve Eurobond katmanları tek çerçevede izlenir.'
  },
  {
    label: 'Karar Disiplini',
    title: 'Değerleme panosu',
    body: 'Fiyat, hedef fiyat, yukarı potansiyel ve kritik çarpanlar karar öncesi yeniden kontrol edilmesi gereken ayrı bir kontrol alanı olarak tutulur.'
  },
  {
    label: 'Risk Mimarisi',
    title: 'BIST beta tamponu',
    body: 'AAL, KZL, ADE ve IPV ile tek yönlü hisse riskini azaltan likidite, altın, değişken fon ve Eurobond dengesi kurulur.'
  },
  {
    label: 'Veri Dürüstlüğü',
    title: '252 iş günü protokolü',
    body: 'Model korelasyonu ile gerçek tarihsel korelasyon ayrılır; terminal verisi geldiğinde 252 günlük log getiri matrisiyle güncellenir.'
  }
];

const correctionHighlights = [
  {before:'Güncel fiyat-hedef fiyat alanı eksikti', after:'Kaynaklı değerleme panosu ve karar etiketi eklendi', impact:'Alım/izleme kararı daha disiplinli hale geldi'},
  {before:'YEF ve TIE benzer BIST 30 teması taşıyordu', after:'TIE çıkarıldı, IPV Eurobond fonu eklendi', impact:'BIST beta tekrarı azaldı; döviz/Eurobond katmanı güçlendi'},
  {before:'Senaryo getirileri yeterince şeffaf değildi', after:'Brüt ve yaklaşık vergi sonrası getiri matematiği ayrıştırıldı', impact:'Beklenti aralığı daha okunabilir hale geldi'},
  {before:'Korelasyon analizi model varsayımı olarak ayrılmamıştı', after:'Model korelasyonu ve gerçek tarihsel hesap protokolü ayrıldı', impact:'Sahte kesinlik riski azaltıldı'}
];

const stocks = [
  {rank:1, code:'GARAN', name:'Garanti BBVA', theme:'Bankacılık', risk:'Orta', score:8.7, role:'Ana banka pozisyonu', weight:8, base:25, bull:40, bear:-10, verified:'2Ç26 finansalları ve 4 Eylül 2026 piyasa çarpanları fiyat-hedef tablosuna işlendi.', method:'PD/DD + ROE + NIM', decision:'Araştır / Kademe', strengths:'Ölçek, dijital kanal gücü, sermaye kalitesi ve BBVA ortaklığının risk yönetimi disiplini.', risks:'Net faiz marjı, regülasyon, kredi kalitesi, kur ve sermaye yeterliliği baskısı.'},
  {rank:2, code:'YKBNK', name:'Yapı Kredi Bankası', theme:'Bankacılık', risk:'Orta-Yüksek', score:8.5, role:'Agresif banka büyüme pozisyonu', weight:6, base:30, bull:48, bear:-15, verified:'2Ç26 finansalları ve 4 Eylül 2026 piyasa çarpanları fiyat-hedef tablosuna işlendi.', method:'PD/DD + ROE + NIM', decision:'Araştır / Kademe', strengths:'Operasyonel verimlilik, kar büyümesi ve güçlü bireysel bankacılık tabanı.', risks:'Yüksek beta, marj oynaklığı, kredi kalitesi ve karşılık baskısı.'},
  {rank:3, code:'AKBNK', name:'Akbank', theme:'Bankacılık', risk:'Orta', score:8.2, role:'Bankacılıkta dengeleyici pozisyon', weight:5, base:25, bull:40, bear:-10, verified:'2Ç26 finansalları ve 4 Eylül 2026 piyasa çarpanları fiyat-hedef tablosuna işlendi.', method:'PD/DD + ROE + sermaye yeterliliği', decision:'Araştır / Kademe', strengths:'Sermaye yeterliliği, fonlama kalitesi, kurumsal yönetim ve dijital yatırımlar.', risks:'Faiz marjı baskısı, kredi büyümesinde yavaşlama, mevduat maliyeti ve regülasyon.'},
  {rank:4, code:'TUPRS', name:'Tüpraş', theme:'Rafineri / Enerji', risk:'Orta', score:8.7, role:'Temettü ve değer hissesi', weight:9, base:24, bull:38, bear:-5, verified:'4 Eylül 2026 kapanışı 388,50 TL; kurum hedefi 395,00 TL ile hedefe yakın fiyatlanıyor.', method:'FD/FAVÖK + rafineri marjı + temettü', decision:'İzle / Hedefe yakın', strengths:'Nakit üretimi, rafineri ölçeği, temettü potansiyeli ve yönetim disiplini.', risks:'Rafineri marj daralması, petrol fiyatı, stok zararı ve enerji dönüşümü.'},
  {rank:5, code:'ASELS', name:'Aselsan', theme:'Savunma / Teknoloji', risk:'Orta', score:8.4, role:'Stratejik büyüme pozisyonu', weight:8, base:24, bull:42, bear:-8, verified:'2Ç26 bilanço dönemi ve 4 Eylül 2026 kapanış çarpanları izleme tablosuna işlendi.', method:'FD/FAVÖK + sipariş stoku + büyüme', decision:'Araştır / Seçici', strengths:'Sipariş stoku, ihracat potansiyeli, Ar-Ge kapasitesi ve yerlileşme politikaları.', risks:'Yüksek çarpan, teslimat gecikmeleri, kamu sözleşmelerine bağımlılık ve ihracat lisansı.'},
  {rank:6, code:'BIMAS', name:'BİM Birleşik Mağazalar', theme:'Gıda Perakende', risk:'Düşük-Orta', score:8.1, role:'Savunmacı tüketim katmanı', weight:7, base:18, bull:30, bear:-5, verified:'2Ç26 bilanço dönemi ve 4 Eylül 2026 kapanış çarpanları izleme tablosuna işlendi.', method:'F/K + FD/FAVÖK + mağaza verimliliği', decision:'İzle / Nötr', strengths:'Defansif talep, nakit dönüşümü, ölçek ve fiyatlama disiplini.', risks:'Marj baskısı, rekabet, asgari ücret ve kira maliyetleri.'},
  {rank:7, code:'MGROS', name:'Migros Ticaret', theme:'Gıda Perakende', risk:'Orta', score:7.8, role:'Perakende büyüme tamamlayıcısı', weight:3, base:20, bull:30, bear:-8, verified:'2Ç26 bilanço dönemi ve 4 Eylül 2026 kapanış çarpanları izleme tablosuna işlendi.', method:'FD/FAVÖK + marj + online büyüme', decision:'Araştır / Yüksek potansiyel', strengths:'Online büyüme, mağaza ağı, sadakat programı ve operasyonel kaldıraç.', risks:'Marj baskısı, tüketici talebinde yavaşlama ve rekabet.'},
  {rank:8, code:'TCELL', name:'Turkcell', theme:'Telekomünikasyon', risk:'Düşük-Orta', score:7.8, role:'Defansif nakit akışı', weight:6, base:17, bull:30, bear:-5, verified:'2Ç26 bilanço dönemi ve 4 Eylül 2026 kapanış çarpanları izleme tablosuna işlendi.', method:'FD/FAVÖK + FAVÖK marjı + temettü', decision:'Araştır / Yüksek potansiyel', strengths:'Defansif gelir, fiyatlama gücü, güçlü FAVÖK marjı ve temettü potansiyeli.', risks:'Regülasyon, yatırım harcamaları, kur riski ve rekabet.'},
  {rank:9, code:'THYAO', name:'Türk Hava Yolları', theme:'Havacılık', risk:'Orta-Yüksek', score:7.7, role:'Döviz geliri / büyüme', weight:4, base:20, bull:35, bear:-10, verified:'2Ç26 bilanço dönemi ve 4 Eylül 2026 kapanış çarpanları izleme tablosuna işlendi.', method:'FD/FAVÖK + doluluk + yakıt maliyeti', decision:'Araştır / Yüksek risk', strengths:'Döviz bazlı gelir, global ağ, yolcu/kargo çeşitliliği ve filo ölçeği.', risks:'Yakıt maliyeti, jeopolitik risk, kur oynaklığı ve operasyonel şoklar.'},
  {rank:10, code:'ISCTR', name:'İş Bankası C', theme:'Bankacılık', risk:'Orta', score:7.6, role:'Tamamlayıcı banka / iştirak iskontosu', weight:0, base:23, bull:35, bear:-10, verified:'2Ç26 finansalları ve 4 Eylül 2026 piyasa çarpanları fiyat-hedef tablosuna işlendi.', method:'PD/DD + ROE + iştirak iskontosu', decision:'İzle / Sepet dışı', strengths:'İştirak yapısı, ölçek, sermaye tabanı ve iskonto teması.', risks:'Banka yoğunluğu, regülasyon, iştirak değerlemesi ve marj oynaklığı.'}
];

const funds = [
  {rank:1, code:'ADP', name:'Ak Portföy BIST Banka Endeksi Hisse Senedi (TL) Fonu', type:'Banka sektör fonu', risk:'7/7', fee:'%2,00', tax:'%0', valor:'T+1/T+2', price:1.2787, change:0.58, priceDate:'04.09.2026', weight:5, role:'Bankacılık temasına toplu erişim; yüksek sektör yoğunlaşması.'},
  {rank:2, code:'AFT', name:'Ak Portföy Yeni Teknolojiler Yabancı Hisse Senedi Fonu', type:'Yabancı teknoloji', risk:'6/7', fee:'%2,90', tax:'%17,5', valor:'T+1/T+2', price:0.971442, change:0.11, priceDate:'04.09.2026', weight:8, role:'Yapay zeka/teknoloji + döviz bazlı çeşitlendirme; ABD teknoloji değerleme riski.'},
  {rank:3, code:'ADE', name:'Ak Portföy Mutlak Getiri Hedefli Değişken Fon', type:'Değişken / mutlak getiri', risk:'4/7', fee:'%2,00', tax:'Genel %17,5; 1 yıl üzeri koşulunu teyit et', valor:'T+1/T+2', price:0.896294, change:0.05, priceDate:'04.09.2026', weight:10, role:'Aktif varlık dağılımı sayesinde oynaklık azaltma hedefi.'},
  {rank:4, code:'YEF', name:'Yapı Kredi Portföy BIST 30 Endeksi Hisse Senedi Fonu', type:'BIST 30 endeks', risk:'6/7', fee:'%2,01', tax:'%0', valor:'T+1/T+2', price:null, change:null, priceDate:'Kurucu ekranı', weight:0, role:'BIST 30 çekirdek piyasa maruziyeti; hisse seçimi riskini azaltır.'},
  {rank:5, code:'AK3', name:'Ak Portföy Hisse Senedi (TL) Fonu', type:'Aktif hisse', risk:'6/7', fee:'%3,40', tax:'%0', valor:'T+1/T+2', price:52.3884, change:-0.98, priceDate:'04.09.2026', weight:0, role:'APK yerine doğrulanabilir Ak Portföy aktif hisse fonu.'},
  {rank:6, code:'TI2', name:'İş Portföy Hisse Senedi (TL) Fonu', type:'Aktif hisse', risk:'6/7', fee:'%3,20', tax:'%0', valor:'T+1/T+2', price:0.126304, change:0.0024, priceDate:'04.09.2026', weight:0, role:'İş Portföy araştırma altyapısıyla aktif hisse seçimi.'},
  {rank:7, code:'GHS', name:'Garanti Portföy Hisse Senedi (TL) Fonu', type:'Aktif hisse', risk:'6/7', fee:'%3,20', tax:'%0', valor:'T+1/T+2', price:39.35472, change:-0.47, priceDate:'04.09.2026', weight:0, role:'Garanti Portföy aktif hisse stratejisi; hisse yoğun fon avantajı.'},
  {rank:8, code:'IPV', name:'İş Portföy Eurobond Borçlanma Araçları (Döviz) Fonu', type:'Eurobond / döviz borçlanma', risk:'6/7', fee:'%2,00', tax:'%17,5', valor:'T+1/T+3', price:78.96749, change:0.08, priceDate:'04.09.2026', weight:5, role:'TIE tekrarının yerine döviz/Eurobond korelasyon azaltıcı katman.'},
  {rank:9, code:'AAL', name:'Ata Portföy Para Piyasası (TL) Fonu', type:'Para piyasası', risk:'1/7', fee:'%1,00', tax:'%17,5', valor:'T+0/T+0', price:3.538354, change:0.10, priceDate:'04.09.2026', weight:10, role:'Likidite ve düşük oynaklık tamponu; nakit park alanı.'},
  {rank:10, code:'KZL', name:'Kuveyt Türk Portföy Altın Katılım Fonu', type:'Altın / katılım', risk:'6/7', fee:'%0,30', tax:'%17,5', valor:'T+1/T+1', price:27.8123, change:-1.54, priceDate:'03.09.2026', weight:6, role:'Altın ve jeopolitik/kur koruma katmanı.'}
];

const valuationData = [
  {code:'GARAN', name:'Garanti BBVA', price:'131,40 TL', target:'182,99 TL', upside:39.3, method:'PD/DD + ROE + NIM', multiples:'F/K 4,57x · PD/DD 1,13x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'Araştır / Kademe'},
  {code:'YKBNK', name:'Yapı Kredi Bankası', price:'35,90 TL', target:'51,10 TL', upside:42.3, method:'PD/DD + ROE + NIM', multiples:'F/K 5,48x · PD/DD 1,06x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'Araştır / Kademe'},
  {code:'AKBNK', name:'Akbank', price:'71,85 TL', target:'96,76 TL', upside:34.7, method:'PD/DD + ROE + NIM', multiples:'F/K 5,57x · PD/DD 1,15x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'Araştır / Kademe'},
  {code:'TUPRS', name:'Tüpraş', price:'388,50 TL', target:'395,00 TL', upside:1.7, method:'FD/FAVÖK + rafineri marjı + temettü', multiples:'F/K 11,16x · PD/DD 1,65x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'İzle / Hedefe yakın'},
  {code:'ASELS', name:'Aselsan', price:'388,25 TL', target:'495,00 TL', upside:27.5, method:'FD/FAVÖK + sipariş stoku + büyüme', multiples:'F/K 48,26x · PD/DD 5,65x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'Araştır / Seçici'},
  {code:'BIMAS', name:'BİM Birleşik Mağazalar', price:'415,75 TL', target:'496,00 TL', upside:19.3, method:'F/K + FD/FAVÖK + mağaza büyümesi', multiples:'F/K 18,89x · PD/DD 2,46x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'İzle / Nötr'},
  {code:'MGROS', name:'Migros Ticaret', price:'527,00 TL', target:'910,00 TL', upside:72.7, method:'FD/FAVÖK + marj + online büyüme', multiples:'F/K 16,30x · PD/DD 1,01x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'Araştır / Yüksek potansiyel'},
  {code:'TCELL', name:'Turkcell', price:'98,15 TL', target:'150,00 TL', upside:52.8, method:'FD/FAVÖK + FAVÖK marjı + temettü', multiples:'F/K 11,85x · PD/DD 0,69x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'Araştır / Yüksek potansiyel'},
  {code:'THYAO', name:'Türk Hava Yolları', price:'296,00 TL', target:'445,00 TL', upside:50.3, method:'FD/FAVÖK + döviz geliri + yolcu/kargo', multiples:'F/K 3,59x · PD/DD 0,39x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'Araştır / Yüksek risk'},
  {code:'ISCTR', name:'İş Bankası C', price:'13,01 TL', target:'21,57 TL', upside:65.8, method:'PD/DD + ROE + iştirak iskontosu', multiples:'F/K 4,78x · PD/DD 0,71x', source:'Bulls kapanış + Şeker Yatırım hedef', decision:'İzle / Sepet dışı'}
];

const portfolio = [
  {asset:'GARAN', weight:8, amount:8000, theme:'Bankacılık'},
  {asset:'YKBNK', weight:6, amount:6000, theme:'Bankacılık'},
  {asset:'AKBNK', weight:5, amount:5000, theme:'Bankacılık'},
  {asset:'TUPRS', weight:9, amount:9000, theme:'Rafineri/Enerji'},
  {asset:'ASELS', weight:8, amount:8000, theme:'Savunma'},
  {asset:'BIMAS', weight:7, amount:7000, theme:'Perakende'},
  {asset:'TCELL', weight:6, amount:6000, theme:'Telekom'},
  {asset:'THYAO', weight:4, amount:4000, theme:'Havacılık'},
  {asset:'MGROS', weight:3, amount:3000, theme:'Perakende'},
  {asset:'ADP', weight:5, amount:5000, theme:'Bankacılık Fonu'},
  {asset:'AFT', weight:8, amount:8000, theme:'Yabancı Teknoloji'},
  {asset:'ADE', weight:10, amount:10000, theme:'Değişken Fon'},
  {asset:'AAL', weight:10, amount:10000, theme:'Para Piyasası'},
  {asset:'KZL', weight:6, amount:6000, theme:'Altın/Kıymetli Maden'},
  {asset:'IPV', weight:5, amount:5000, theme:'Eurobond/Döviz'}
];

const scenarios = [
  {name:'Kötümser', gross:-4.0, net:-4.5, note:'Faiz indirimi gecikir, kur/jeopolitik baskı artar; AAL/KZL/ADE/IPV tamponu öne çıkar.'},
  {name:'Baz', gross:22.9, net:21.4, note:'Makro beklentiler kontrollü ilerler; çekirdek portföy korunur ve çeyreklik dengeleme yapılır.'},
  {name:'İyimser', gross:37.4, net:34.9, note:'Faiz indirimi, yabancı girişi ve güçlü risk iştahı bankalar/BIST fonları/teknoloji fonunu destekler.'}
];

const decisionRules = [
  {status:'Yüksek öncelik', tone:'green', metric:'Yukarı potansiyel > %35 ve çarpanlar makul', action:'Tez, güncel bilanço ve fiyat trendi üç ayrı kontrol noktasında doğrulanır.'},
  {status:'Kademe adayı', tone:'green', metric:'Yukarı potansiyel %20-%35 ve bilanço tezi sağlam', action:'Tek fiyat yerine önceden tanımlı üç kontrol kademesi izlenir.'},
  {status:'İzle / Koru', tone:'blue', metric:'Yukarı potansiyel %10-%20 veya fiyat hedefe yaklaşmış', action:'Ağırlık artırılmaz; bilanço ve hedef fiyat güncellemesi beklenir.'},
  {status:'Riski azalt', tone:'red', metric:'Yukarı potansiyel < %10 veya temel tez bozulmuş', action:'Model ağırlığı düşürülür; nakit veya koruma katmanına aktarım değerlendirilir.'}
];

const scoringModel = [
  {title:'Finansal kalite', weight:'%25', detail:'Karlılık, sermaye yapısı, aktif kalitesi, FAVÖK/nakit akışı, bankalarda ROE ve sermaye yeterliliği.'},
  {title:'Büyüme ve sektör teması', weight:'%20', detail:'Faiz döngüsü, ihracat, fiyatlama gücü, savunma/teknoloji ve tüketim dayanıklılığı.'},
  {title:'Değerleme makullüğü', weight:'%20', detail:'F/K, PD/DD, FD/FAVÖK, hedef fiyat ve emsal karşılaştırması; terminal teyidi gerekir.'},
  {title:'Risk/volatilite', weight:'%15', detail:'Makro duyarlılık, kur/faiz riski, regülasyon, likidite, beta ve volatilite.'},
  {title:'Portföy uyumu', weight:'%20', detail:'Çeşitlendirme katkısı, korelasyon azaltma, nakit/altın/Eurobond/defansif denge.'}
];

const qualityScores = [
  {metric:'Veri tarihi', score:'Kilitli', detail:'Sürüm tarihi ve piyasa referansı görünür.'},
  {metric:'Kaynak kalitesi', score:'A1-B2', detail:'Resmi, kurumsal ve yardımcı kaynak rolleri ayrılmıştır.'},
  {metric:'Korelasyon durumu', score:'Model', detail:'Tarihsel seri gelene kadar varsayım olarak etiketlidir.'},
  {metric:'Karar hazırlığı', score:'Kontrol', detail:'Fiyat, hedef, tez ve risk alanları ayrı izlenir.'},
  {metric:'Veri şeffaflığı', score:'Açık', detail:'Canlı terminal gerektiren alanlar görünür biçimde işaretlidir.'}
];

const sourcePriority = [
  {level:'A1', title:'Resmi kamu ve borsa kaynakları', use:'Doğrudan kaynak alınabilir; en yüksek güven düzeyi.', example:'TCMB, Borsa İstanbul, KAP, SPK'},
  {level:'A2', title:'Şirket ve fon kurucusu resmi sayfaları', use:'Finansallar, fon valörü, strateji, ücret ve risk bilgisi için öncelikli.', example:'Yatırımcı ilişkileri, Ak Portföy, İş Portföy'},
  {level:'B1', title:'Aracı kurum araştırma raporları', use:'Hedef fiyat ve tahmin için kullanılabilir; kurum adı ve tarih belirtilmeli.', example:'İş Yatırım, Yapı Kredi Yatırım, Garanti BBVA Yatırım'},
  {level:'B2', title:'Veri platformları', use:'Çarpan, fon bilgisi ve hızlı kontrol için yardımcı kaynak.', example:'Fintables, Investing, Matriks, Foreks'},
  {level:'D', title:'Model / AI varsayımı', use:'Kesin veri gibi yazılamaz; sadece senaryo, metodoloji veya kontrol listesi olarak kullanılır.', example:'Senaryo getirisi, model korelasyonu, risk yorumu'}
];

const liveModes = [
  {title:'Widget modu', body:'TradingView ticker, market overview ve symbol overview widgetları hızlı takip ekranı sağlar; lisans ve gecikme durumu veri sağlayıcıya bağlıdır.'},
  {title:'API modu', body:'Matriks, Foreks, iDeal, dxFeed veya özel lisanslı veri endpoint’i bağlandığında fiyat, potansiyel ve portföy değeri zaman damgasıyla güncellenebilir.'}
];

const marketCockpit = [
  {label:'BIST 100 kapanışı', value:'+%0,57', detail:'14.012,42 · 4 Eylül 2026 kapanış snapshot’ı.', tone:'green'},
  {label:'Model evreni', value:'7 / 10', detail:'Yedi pozitif, iki yatay ve bir negatif kapanış.', tone:'blue'},
  {label:'Günün güçlü notu', value:'MGROS +%2,13', detail:'Model evrenindeki en yüksek günlük değişim.', tone:'gold'},
  {label:'Kur göstergesi', value:'USD/TRY +%0,18', detail:'48,4436 · 18:30 piyasa özeti.', tone:'green'}
];

const platformModules = [
  {title:'Piyasa Analiz Kokpiti', body:'Makro eşik, BIST referansı, canlı veri notu ve portföy rejimi tek panelde izlenir.'},
  {title:'Hisse Performans Masası', body:'Fiyat, hedef, yukarı potansiyel, çarpan ve karar etiketiyle hisse bazlı aksiyon alanı oluşur.'},
  {title:'Fon Karşılaştırma Paneli', body:'Fonlar sadece isim listesi olarak değil; rol, risk, valör, stopaj ve koruma katkısı ile karşılaştırılır.'},
  {title:'Risk ve Korelasyon İzleme', body:'Banka yoğunluğu, BIST beta, döviz/altın tamponu ve model korelasyon birlikte takip edilir.'},
  {title:'Analist Notları ve Haber Akışı', body:'Bilanço, makro veri, fon akışı ve veri yenileme gündemi kısa notlarla ayrıştırılır.'},
  {title:'Karar Defteri', body:'Yüksek öncelik, kademe, izleme ve risk azaltma eşikleri portföy disiplinine bağlanır.'}
];

const riskIndicators = [
  {label:'Banka yoğunluğu', value:24, status:'Kontrollü', detail:'%28 üstü azaltım kuralı'},
  {label:'Likidite tamponu', value:10, status:'Aktif', detail:'AAL para piyasası katmanı'},
  {label:'Döviz/Eurobond', value:13, status:'Dengeleyici', detail:'AFT + IPV etkisi'},
  {label:'Altın koruma', value:6, status:'Tampon', detail:'KZL ile kur/jeopolitik koruma'}
];

const analysisFeed = [
  {label:'Makro kontrol', title:'TÜFE eşiği portföy hedefiyle karşılaştırılmalı', meta:'Aylık takip'},
  {label:'Bilanço takibi', title:'Banka net faiz marjı ve aktif kalite trendi izlenmeli', meta:'Çeyreklik'},
  {label:'Fon akışı', title:'AAL/ADE/KZL/IPV koruma ağırlıkları piyasa rejimine göre dengelenmeli', meta:'Haftalık'},
  {label:'Veri yenileme', title:'Fiyatlar 4 Eylül kapanışına, hedef ve çarpanlar güncel kurum tablosuna taşındı', meta:'04.09.2026 · 18:30 TSİ'}
];

const fundComparison = [
  {code:'ADP', role:'Banka teması', profile:'Yüksek sektör yoğunluğu', liquidity:'T+1/T+2', protection:'Düşük'},
  {code:'AFT', role:'Yabancı teknoloji', profile:'Döviz bazlı büyüme', liquidity:'T+1/T+2', protection:'Orta'},
  {code:'ADE', role:'Mutlak getiri', profile:'Aktif varlık dağılımı', liquidity:'T+1/T+2', protection:'Yüksek'},
  {code:'AAL', role:'Para piyasası', profile:'Likidite ve nakit park', liquidity:'T+0', protection:'Yüksek'},
  {code:'KZL', role:'Altın', profile:'Kur/jeopolitik tampon', liquidity:'T+1', protection:'Yüksek'},
  {code:'IPV', role:'Eurobond', profile:'Döviz borçlanma araçları', liquidity:'T+1/T+3', protection:'Orta-Yüksek'}
];

const apiSteps = [
  {title:'Veri sağlayıcı seç', body:'Matriks, Foreks, iDeal veya özel endpoint için lisans ve sembol kapsamını netleştir.'},
  {title:'Quote endpoint hazırla', body:'Endpoint, sembol listesini alıp fiyat, değişim yüzdesi ve zaman damgası döndürmelidir.'},
  {title:'Güvenli proxy’yi bağla', body:'Sağlayıcı kimlik bilgilerini sunucuda tut; tarayıcıya yalnızca aynı alan adındaki endpoint ve yenileme aralığını ver.'},
  {title:'Panel alanlarına bağla', body:'Gelen fiyatları değerleme tablosu, izleme listesi ve portföy değeri alanlarında göster.'}
];

const modelCorrelationMatrix = [
  ['Varlık','Banka','BIST Fon','TUPRS','ASELS','Perakende','TCELL','AFT','AAL','KZL','IPV'],
  ['Banka',1.00,0.82,0.55,0.48,0.42,0.35,0.18,-0.05,0.10,0.20],
  ['BIST Fon',0.82,1.00,0.62,0.58,0.55,0.45,0.22,-0.08,0.12,0.18],
  ['TUPRS',0.55,0.62,1.00,0.40,0.35,0.25,0.15,-0.02,0.22,0.30],
  ['ASELS',0.48,0.58,0.40,1.00,0.30,0.22,0.28,-0.03,0.18,0.20],
  ['Perakende',0.42,0.55,0.35,0.30,1.00,0.38,0.12,0.02,0.08,0.10],
  ['TCELL',0.35,0.45,0.25,0.22,0.38,1.00,0.10,0.04,0.06,0.12],
  ['AFT',0.18,0.22,0.15,0.28,0.12,0.10,1.00,-0.05,0.30,0.45],
  ['AAL',-0.05,-0.08,-0.02,-0.03,0.02,0.04,-0.05,1.00,0.05,-0.10],
  ['KZL',0.10,0.12,0.22,0.18,0.08,0.06,0.30,0.05,1.00,0.35],
  ['IPV',0.20,0.18,0.30,0.20,0.10,0.12,0.45,-0.10,0.35,1.00]
];

const sources = [
  {code:'S1', name:'Borsa İstanbul veri yayını', use:'BIST verilerinin lisanslı veri sağlayıcılarla yayımlanması', url:'https://www.borsaistanbul.com/en/data/data-dissemination'},
  {code:'S2', name:'TCMB Piyasa Katılımcıları Anketi', use:'Enflasyon beklentisi ve makro referans verisi', url:'https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Egilim+Anketleri/Piyasa+Katilimcilari+Anketi/'},
  {code:'S3', name:'KAP', use:'Şirket finansalları, fon bildirimleri ve resmi açıklamalar', url:'https://www.kap.org.tr/'},
  {code:'S4', name:'TEFAS', use:'Fon fiyatı, valör, risk ve işlem bilgileri', url:'https://www.tefas.gov.tr/'},
  {code:'S5', name:'TradingView widget dokümantasyonu', use:'Canlı/güncel piyasa widget tasarımı', url:'https://www.tradingview.com/widget-docs/widgets/'},
  {code:'S6', name:'Matriks veri ve içerik servisleri', use:'REST API, temel analiz, TEFAS, KAP ve piyasa verisi entegrasyon seçeneği', url:'https://www.matriksdata.com/website/urunlerimiz/kurumsal-hizmet-ve-servisler/veri-ve-icerik-saglayici-servisler'},
  {code:'S7', name:'Bulls Yatırım hisse analiz ekranı', use:'4 Eylül 2026 kapanış, günlük değişim ve gün içi aralık kontrolü', url:'https://bullsyatirim.com/hisse-analiz/GARAN'},
  {code:'S8', name:'Şeker Yatırım tavsiye listesi', use:'4 Eylül 2026 hedef fiyat ve piyasa çarpanı snapshot’ı', url:'https://www.sekeryatirim.com.tr/Arastirma/TavsiyeListesi'},
  {code:'S9', name:'Bloomberg HT gün sonu özeti', use:'BIST 100, kur, altın ve piyasa kapanış çapraz kontrolü', url:'https://www.bloomberght.com/piyasalarda-gunun-ozeti-4-eylul-2026-bist-100-de-degisimler-ve-doviz-fiyatlari-pkh-3787404'},
  {code:'S10', name:'Ak Portföy fon ekranları', use:'ADP, AFT, ADE ve AK3 risk, ücret, valör ve fiyat kontrolü', url:'https://www.akportfoy.com.tr/tr/fon/yatirim-fonlari/getiri'},
  {code:'S11', name:'İş Portföy getiri ve fiyatlar', use:'TI2 ve IPV fon fiyatı, risk, ücret ve valör kontrolü', url:'https://www.isportfoy.com.tr/getiri-ve-fiyatlar'},
  {code:'S12', name:'Ata Portföy AAL fon ekranı', use:'AAL risk, ücret, valör ve fon künyesi kontrolü', url:'https://www.ataportfoy.com.tr/FundDetails?fundCode=AAL'},
  {code:'S13', name:'Kuveyt Türk Portföy KZL', use:'KZL ücret, valör ve strateji kontrolü', url:'https://www.kuveytturkportfoy.com.tr/yatirim-evreni/yatirim-fonlari/kiymetli-madenler/kzl/'}
];

window.EFE_RESEARCH_DATA = {
  marketSnapshot,
  marketTape,
  stocks,
  funds,
  valuationData,
  portfolio,
  scenarios,
  sources
};
