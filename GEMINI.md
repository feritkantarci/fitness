# ÇELİK KODU (FITNESS PWA) - YEREL ÖNCELİKLİ & KALICI MİMARİ KURALLAR

## 1. KESİN KURAL: ASLA KULLANICI İZNİ OLMADAN CANLIYA ALMA
* **Her Şey Lokalde:** Tüm kod, stil, hata düzeltmesi ve testler YALNIZCA yerel diskte yapılır ve lokalde bırakılır.
* **Otomatik `git push` Yasaktır:** Kullanıcı açıkça "canlıya al / deploy et / push yap / yayınla" demedikçe remote depoya `git push` ve onaysız canlı dağıtım yapılamaz.
* **Görev Bitiş Kriteri:** Yerel dosyaların güncellenmesi, doğrulamaların geçmesi ve lokal durumun kullanıcıya bildirilmesi yeterlidir.

## 2. Canlıya Çıkış Protokolü (YALNIZCA KULLANICI AÇIKÇA İSTEDİĞİNDE)
1. **Sürüm Numarasını Eşitle:**
   - `index.html`: `<div class="badge-brand">... • vXX</div>`, `<span class="app-version-badge" id="appVersionBadge">vXX</span>` ve tüm `<link href="css/style.css?v=XX">` / `<script src="js/...?v=XX">` önbellek etiketleri (lokal görsel/betik önizlemelerinde de güncellenir).
   - `sw.js`: `const CACHE_NAME = 'celik-kodu-cache-vXX';`
   - `js/app.js` / `index.html`: `navigator.serviceWorker.register('./sw.js?v=XX')`
2. **7 Şef Bekçisi & Sözdizimi Kapısı:** Değişen dosyalarda (`js/chiefs/*.js`, `js/garmin-tredict-bridge.js`, `js/app.js`, `index.html`, `sw.js`) sözdizimi/referans hatası olmadığını doğrula; `npm run verify` (`node scripts/tab-watchdog.js`) çalıştırarak 7 şefin tamamının tüm (`51+`) senaryodan `0` kırık `recId` ve `ScrollWarn:0` ile geçtiğini teyit et (`.git/hooks/pre-push` hatada push'u reddeder).
3. **Kullanıcı Onaylı Push & Doğrulama:** `git add <dosyalar>`, `git commit -m "feat/fix: <mesaj> (vXX)"`, `git push origin main` sonrası canlı sürüm numarasını bildir.

## 3. Havuz Mimarisi: Değişmez Ana Havuz (SSOT) ve Kişisel Görünürlük
* **Ana Havuz Dokunulmazlığı:** `EXERCISES_DB`, `academic-engine` ve `STATIC_FALLBACK_CATALOG` sistemin tek doğruluk kaynağıdır; ekipman eksikliği veya kullanıcı tercihi nedeniyle hareketler ana havuzdan ASLA silinmez.
* **Kişisel Gizleme & Geri Alma:** Kullanıcı bir hareketi gizlediğinde yalnızca `localStorage` tercihlerinde devre dışı kalır ve aktif listelerden (Lab, Seçici, Kütüphane, Rutin) filtrelenir; "Gizlenen Egzersizler" alanından tek tıkla geri açılabilir.

## 4. Anatomik Analiz & Kullanıcı Diyagramı Mimarisi
* **Yalın Kas Kartı & Başlık Hijyeni:** Kas başlıklarının yanında emoji veya statik açıklama (`Ön, Yan, Arka Deltoid`) yazılmaz; kart üstünde yalnızca emojisiz sade başlık, tek ilerleme çubuğu ve sağında `X / Min-Max Set` gösterilir (tekrar cümleleri ve gereksiz durum rozeti eklenmez).
* **Düz Satırlı Alt Bölge Listesi:** Kutu içinde kutu veya 3 sütunlu renkli grid tablosu (`📐 ... ANATOMİK ALT BÖLGE DAĞILIMI`) açılmaz; alt bölgeler ince yatay çizgilerle ayrılan sade bilgi satırları halinde listelenir. Çalışan/planda/boşta durumu kutu boyamadan veya kalın sol şerit çizmeden küçük renkli nokta ya da metin rengiyle verilir; ekleme aksiyonu yalnızca kart altındaki tek ana aksiyon butonundadır. Görseli olmayan hayalet başlıklar (`Şekildeki 1-2-3...`) yazılmaz.
* **SVG Alt Bölge Geometrisi, Sayaç & TR/EN Eşleştirme Yasası:**
  - **TR/EN Normalizasyonu (`normSearchText`):** Çıplak `.toLowerCase()`/`.toLocaleLowerCase('tr-TR')` yerine `s.replace(/[İIı]/g, 'i').toLowerCase().replace(/\u0307/g, '')` kullanılır; kısa dizgiler (`'lat'`) kelime sınırı olmadan eşleştirilmez.
  - **Birincil vs İkincil İzolasyon:** `getExerciseCompartmentsForMuscle` önce hareket adı ve `primary` kası kontrol eder; `secondary` yalnızca birincil eşleşme yoksa yedek kullanılır.
  - **Ana + Alt Kas Sayaç & Şablon Senkronu:** Üst durum butonları (`İyi Çalışan`, `Az / Planda`, `Çalışmayan`) 10 ana kas ile 31 alt kas bölgesini birlikte sayar, tıklanınca listeler ve Şablon (`schedule_full`) görünümünde alt kasları da aktif (`earnedSets > 0`) renklendirir.
  - **SVG `<clipPath>` & Pin & `recId`:** Çoklu SVG alt yolları aynı poligon yönünde (CW) tutulur, `zones` dilimleri çakışmaz ve tüm `pins` noktalarının hem `<clipPath>` hem `zone` içinde kaldığı ile tüm `recId` kimliklerinin `EXERCISES_DB`'de bulunduğu `node -e` testiyle doğrulanır.

## 5. Mobil Arayüz Hijyeni, Kompakt Akordiyon & Sıfır Kaydırma Sıçraması
* **Varsayılan Kapalı İkincil Bloklar:** "Koç Tavsiyesi / Önerilen Egzersizler", "Kardiyak Efor" detayı ve "Hangi Seans & Hareketten Geldi?" lineage blokları varsayılan olarak kapalıdır; emojili butonlar yerine sade metin bağlantısıyla (`Göster` / `Gizle`) açılıp kapanır.
* **Zero Scroll-Jump & Viewport Anchoring:**
  1. `renderGeneratedWorkout`, `renderPendingWeeklyPlanPreview`, `renderActiveWorkout`, `renderCustomRoutine` içinde koşulsuz `scrollIntoView()` veya `window.scrollTo({ top: 0 })` YASAKTIR (yalnızca `options.scrollToTop === true` iken).
  2. `innerHTML` yenileme öncesi `savedScrollY = window.scrollY` (`savedScrollTop = container.scrollTop`) alınıp sonra `behavior: 'instant'` ile geri yüklenir.
  3. Akordiyon/çekmece açılışında satırın `anchorOffsetTop = row.getBoundingClientRect().top` değeri alınıp çizim sonrası `window.scrollBy({ top: newRow.getBoundingClientRect().top - anchorOffsetTop, behavior: 'instant' })` ile göz hizası sabitlenir.
  4. `selectExerciseFromPicker` ve `swapSingleExercise` sonrası `expanded*Index` kapatılmaz ve sayfa kaydırılmaz.
  5. `.modal-overlay` ve `.modal-box` üzerinde `overscroll-behavior: contain` kullanılır; açılışta yalnızca modalın iç `scrollTop = 0` sıfırlanır.

## 6. Hafif & Kanıta Dayalı Hata Ayıklama
* Varsayımla rastgele kod değiştirilmez; konsol, DOM veya veri akışı kanıtı olmadan müdahale yapılmaz. Her değişiklik sonrası `node -e` / `node --check` ile sözdizimi ve çevre modül bütünlüğü doğrulanır.

## 7. İki Aşamalı Kod İnceleme & Öz-Teşhis
* **2 Aşamalı Filtre:** Teslim öncesi (1) Şartname tam mı, (2) Mevcut butonlar, önbellek, yerel veri ve görsel hiyerarşi sağlam mı kontrolleri yapılır.
* **Döngü Kırıcı:** Bir hata 2 denemede çözülmezse 3. spekülatif deneme YASAKTIR; transkript taranır, hatalı varsayım açıklanır ve kullanıcıdan net kanıt istenir.
* **Hata Hafızası (`Bug-Memory`):** Kullanıcının yakaladığı her gerçek hata ilgili şefin `SKILL.md` dosyasına kural ve `scripts/tab-watchdog.js` içine kalıcı sınav maddesi olarak eklenir.

## 8. Görsel Üretim Aracı Seçim Protokolü
* **Hareketli Egzersiz Görseli İstisnası:** Uygulamadaki egzersiz GIF/animasyonları için Canva (statik poster/4 kutulu şema) önerilmez ve sorulmaz; doğrudan `exercise-visual-pipeline` ile beyaz stüdyo zeminli, turuncu aktif kas vurgulu hareketli görsel üretilir.
* **Statik Tasarım Talepleri:** Afiş/kapak/şablon istendiğinde araç belirtilmemişse emoji kullanmadan şu 2 seçenek sorulur: **1. Canva MCP** (şablon, afiş, düzenlenebilir tasarım), **2. AI Görsel Üretici (`image-generator`)** (illüstrasyon).

## 9. Görsel Kontrast (WCAG Okunabilirlik)
* Açık zeminlerde (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`, `#DCFCE7`, `#FEF3C7`) asla beyaz/açık gri/pastel metin kullanılmaz; birincil metin `#0F172A`, ikincil `#334155`/`#475569`, rozetler koyu doygun (`#15803D`, `#B45309`, `#0369A1`, `#6B21A8`, `#B91C1C`, min 4.5:1) olur. `#FFFFFF` metin yalnızca koyu/doygun dolgularda kullanılır. `innerHTML` şablonları, aktif filtreler ve `applyTheme()` CSS değişkenleri gerçek arka planla doğrulanır.

## 10. Onay & `/learn` Karar Akışı
* Arayüzde "Proceed" butonu yokken kullanıcıdan "Proceed'e bas" ASLA istenmez; `/learn` ve onay adımlarında `ask_question` ile kalıcı uygulama onayı sorulur.

## 11. Kısa Metin, Kullanıcı Dili & Mobil Nizamiyet
* **Sıfır Kod/Teknik Terim:** Açıkça sorulmadıkça sohbette dosya/fonksiyon/değişken adı, CSS/hex kodu veya teknik terim yazılmaz; günlük net Türkçe kullanılır ve tek satırlı maddeler kurulur. Sohbet sonuna İngilizce alt başlık (`Modern Web Guidance` vb.) konmaz.
* **Mikro-Metin & ADHD Dostu Akış:** Kart, rozet ve `<select>` metinleri 2–5 kelime tutulur (örn. `"Orta Süperset"`, `"3 Gün Tüm Vücut"`). Bilinen veriler tekrar sorulmaz; seçenek butonları 1–2 kelimelik ve emojisizdir; ek girdi sabit blok yerine ekrana sığan pop-up ile alınır.
* **Not Defteri Yasağı:** Ekrana "Sıradaki Adım..." gibi sarı/turuncu yönerge veya açıklama banner'ı eklenmez; yalnızca kart içi kompakt set çipleri ve butonlar kullanılır.
* **Mobil Nizamiyet & Bilgi İkonları:**
  - Başlıklar ve üst bar isimleri tek satır (`white-space: nowrap`) ve parantezsiz (`(Full Body)`, `(Admin)` yok) tutulur.
  - İkincil detaylar ana ekrana açılmaz; büyük beyaz daire buton yerine başlık yanında küçük (`14–15px`), gri (`#94A3B8`), içi boş çizgisel **`i`** ikonuyla açılıp sağ üstten **`✕`** ile kapanan sade modalda gösterilir.
  - Açılır çekmecelerde iç içe kenarlıklı kutu açılmaz; üst bar sağ aksiyonları `34px` hizalı, sürüm numarası `ÜRETİCİ • vXX` şeklinde entegredir.

## 12. Tekil Yama Yasağı & Bütüncül Mimari
* Tek bir kas/ekran/gün örneğinden gelen bildirimlerde özel yama yazılmaz; çözüm 10 ana kas, 31 alt bölge, tüm şablonlar ve tüm sekmeleri kapsayacak biçimde evrensel tasarlanır.

## 13. Çok Kullanıcılı Mobil Mimari & Sıfır Bilgisayar Bağımlılığı
* Tüm özellikler, veri eşitleme ve dış entegrasyonlar (Garmin/Tredict, AI) geliştirici/kullanıcı bilgisayarına (`127.0.0.1`, yerel script/token) bağlı OLMADAN her sporcunun kendi izole hesabıyla mobilde 7/24 bağımsız çalışır. Dış servisten gerçek onay alınmadan "aktarıldı" gösterilmez.

## 14. Varsayımsız Danışma, Şef Tanımlama & Veri Sağlaması
* İşleyiş, puanlama, şef yetkisi veya uç durum yorumlarını (piramit set, kilo düşürme, süreli hareket vb.) değiştiren kararlarda tüm ihtimaller sonuçlarıyla birlikte sade Türkçe ile `ask_question` üzerinden kullanıcıya danışılır.
* Veri işleyen/hesaplayan görevlerde gerçekçi ve ters köşe verilerle **beklenen sonuç = ekrandaki veri** uçtan uca doğrulanmadan görev kapatılmaz.

## 15. Konum Şeffaflığı & Kod / Hafıza Ayrımı
* Soyut kelimeler ("merkez kasa") yerine gerçek konumlar (*Google Firebase bulut veritabanı*, *GitHub Pages*, *Vercel bulut köprüsü*, *telefonun yerel önbelleği*) sade Türkçe ile söylenir.
* Değişmez katalog (`EXERCISES_DB`, `app_system/master_catalog`) ve sporcu hafızası Firebase'de, dış köprüler bulut API'sinde, Android/iOS/Web ise çevrimdışı önbellek yedekli ince arayüz kabuğunda tutulur.

## 16. Çok Boyutlu Antrenman Kararı
* Hareket seçimi ve program üretiminde tek kritere göre katı eleme yapılmaz; **1. Çeşitlilik, 2. Biyomekanik Verimlilik, 3. Eklem Güvenliği, 4. İstasyon/Süperset Akışı** birlikte tartılır ve yan etkiler açıkça belirtilir.

## 17. Mimari Öncelik & Modüller Arası Etki Senkronizasyonu
* Akış veya veri yolu değişmeden önce ilgili `.agents/skills/*/SKILL.md` ve `GEMINI.md` okunur; etki haritası çıkarılır, bağlı modüller, background kancaları, `SKILL.md` ve `scripts/tab-watchdog.js` aynı görev içinde eşzamanlı güncellenir.

## 18. Yalın Koyu Görsel Dil Standardı (Tüm Ekranlar ve Yeni Özellikler)
1. **Tek Parça Koyu Zemin & Renk Diyeti:** Sayfa zemini (`#0B0A14`), üst/alt barlar, özet şeritleri ve kartlar (`#181530`, iç alan `#121024`, ince `rgba(167,139,250,0.18)` kenarlık) tek parça koyu temada birleşir. Yeşil/sarı/kırmızı kutu dolguları ve kalın renkli sol şeritler (`border-left`) yasaktır; durum yalnızca başlık yanındaki küçük renkli nokta (`7–9px`) veya metin rengiyle gösterilir.
2. **Tek Vurgu Rengi & `%90` Oranlı Çubuklar:** Dağılım ve karşılaştırma çubuklarında çok renkli neon palet yerine tek vurgu rengi (`#8B5CF6`) kullanılır; en yüksek kalem çubuğun `%90`'ını dolduracak şekilde (`* 90`) diğer kalemlerle oranlanır.
3. **Sıfır Telefon Emojisi & Küçük İçi Boş Bilgi İkonu:** Kart, başlık, özet kutusu, rozet, `title` ipucu ve butonlarda renkli telefon emojileri kesinlikle kullanılmaz; ikon gerekirse yalnızca tek renk ince çizgi (`stroke="currentColor"`, `fill="none"`) SVG kullanılır veya hiç ikon konulmaz. Bilgi (`i`) ikonları büyük beyaz daire yerine başlığın yanında küçük (`14–15px`), gri (`#94A3B8`) ve içi boş çizgi simgedir.
4. **Kutu İçinde Kutu Yasağı & İnce Çizgili Düz Satırlar:** Kart içinde alt bölgeler, hareketlilik satırları, kişisel rekorlar, ölçüler veya açılır çekmeceler için ikinci bir çerçeveli kutu dizisi açılmaz; öğeler ince yatay çizgilerle (`1px solid rgba(255,255,255,0.06)`) ayrılan düz satırlar olarak dizilir.
5. **Sade Tipografi, Tekrar Temizliği & Tek Aksiyon:** Aynı hedef/veri kart içinde tekrarlanmaz; karşılığı olmayan hayalet görsel referansları (`Şekildeki 1-2-3...` vb.) ve sistem/cihaz kodları (`7. Şef`, model kodu vb.) yazılmaz; özet/rekor tarihlerinde saat (`20:24`) gizlenip yalnızca gün ve ay yazılır; eşdeğer KPI kutuları tam ortalı tek hizada tutulur; ikincil açılır alanlar sade metin bağlantısıyla (`Göster` / `Gizle`), ana işlem ise kart altındaki tek butonla sunulur.

## 19. Sıfır Gereksiz Sohbet & Paralel Ajanla Doğrudan Sonuç Getirme
* **Seçenek Sayıp Topu Kullanıcıya Atma Yasağı:** Kullanıcı dış kaynaklardan bir varlık, görsel veya veri bulmayı/seçmeyi istediğinde site/alternatif listesi sayıp "hangisine bakalım?" diye sorulmaz.
* **Paralel Ajan Taraması:** Mevcut tüm uygun kaynaklar aynı turda paralel alt ajanlarla doğrudan taranır, sonuçlar doğrulanır ve en iyi aday (veya net yokluk kanıtı + tek somut çözüm) tek seferde sunulur.
