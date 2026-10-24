# ÇELİK KODU (FITNESS PWA) - LOCAL-FIRST & KATI CANLIYA ALMA YASAĞI

Bu kural İSTİSNASIZDIR ve tüm görevlerde en üst önceliğe sahiptir:

---

## 1. KESİN VE KATİ KURAL: ASLA KULLANICI İZNİ OLMADAN CANLIYA ALMA
* **Her Şey Lokalde:** Tüm kod düzenlemeleri, stil güncellemeleri, hata düzeltmeleri ve testler YALNIZCA YEREL DİSKTE (lokalde) yapılır ve lokalde bırakılır.
* **Otomatik `git push` Kesinlikle Yasaktır:** Kullanıcı açıkça ve doğrudan "canlıya al", "deploy et", "push yap" veya "yayınla" talimatı vermedikçe remote depoya ASLA `git push` çalıştırılamaz.
* **Görev Bitiş Kriteri:** Bir görevin tamamlanması için canlıya çıkış ŞART DEĞİLDİR; yerel dosyaların doğru şekilde güncellenmesi, sözdizimi testinin geçmesi ve kullanıcıya lokal durumun bildirilmesi yeterlidir.

---

## 2. Canlıya Çıkış Protokolü (YALNIZCA KULLANICI AÇIKÇA İSTEDİĞİNDE)

Kullanıcı "canlıya al / push et" dediğinde şu adımlar uygulanır:

### Adım 1: Sürüm Numarasını (Version Bump) 4 Noktada Eşitle
1. `index.html` Giriş Ekranı Rozeti: `<div class="badge-brand">... • vXX</div>`
2. `index.html` Üst Bar Rozeti: `<span class="app-version-badge" id="appVersionBadge">vXX</span>`
3. `sw.js` Service Worker Önbellek Adı: `const CACHE_NAME = 'celik-kodu-cache-vXX';`
4. `index.html` Service Worker Kayıt Parametresi: `navigator.serviceWorker.register('./sw.js?v=XX')`

### Adım 2: Sözdizimi (Syntax) ve Bütünlük Kontrolü
* Değiştirilen dosyalarda (özellikle `index.html` içindeki JS bloklarında) sözdizimi hatası olmadığını doğrula (`node -e ...`).

### Adım 3: Kullanıcı Onaylı Git Commit ve Push
* `git add <dosyalar>`
* `git commit -m "feat/fix: <açıklayıcı mesaj> (vXX)"`
* `git push origin main` komutunu YALNIZCA bu talimat geldiğinde çalıştır.

### Adım 4: Kullanıcıya Canlı Doğrulama Bilgisi Ver
* Canlıya çıkan sürüm numarasını belirt.

---

## 3. Havuz Mimarisi: Değişmez Ana Havuz (Master Pool) ve Kişisel Görünürlük Yasası
* **Ana Havuz Dokunulmazlığı (Master Immutability):**
  Platformdaki ana egzersiz havuzu (`EXERCISES_DB`, `academic-engine`, `STATIC_FALLBACK_CATALOG`), tüm bilimsel parametreleri, form rehberleri ve anatomik etki modelleriyle sistemin **değişmez tek doğruluk kaynağıdır (SSOT)**.
  Kullanıcının kendi salonunda bir makine/ekipman olmaması veya bir hareketi yapmak istememesi durumunda hareket **kaynak koddan ya da ana kütüphaneden ASLA silinmez**.
* **Kullanıcı Önü Filtreleme (Kişisel Havuz Gizleme / Exclusion):**
  Kullanıcı herhangi bir hareketi "Havuzumdan Kaldır / Gizle" dediğinde, bu hareket yalnızca kullanıcının yerel tercihlerinde (`localStorage`) devre dışı bırakılır ve kullanıcının önüne düşen aktif listelerden (Lab listesi, Egzersiz Seçici, Kütüphane, Rutin Oluşturucu vb.) anında filtrelenip gizlenir.
* **Geri Alınabilirlik (Restore) & Şeffaf Yönetim:**
  Kullanıcı istediği zaman "Gizlenen Egzersizler" görünümünden veya hareket detayından gizlediği hareketleri görebilmeli ve tek tıkla ("Havuza Geri Ekle / Aktif Et") aktif havuzuna geri döndürebilmelidir.

---

## 4. Anatomik Analiz & Kullanıcı Diyagramı Mimarisi (Kişiselleştirilmiş Alt Baş Takibi)
* **Başlık Hijyeni (Statik Metin Yasağı):**
  Kas kartlarının ana başlıklarının yanında statik, genelgeçer açıklama metinleri (`Ön, Yan, Arka Deltoid` vb.) ASLA yazılmaz. Başlıklar sadece `⚔️ Omuz`, `🏹 Sırt & Kanat`, `🛡️ Göğüs` gibi sade ve vurucu tutulur.
* **2 Katmanlı Anatomik Alt Bölge Grid Tablosu:**
  Kullanıcının belirlediği el şeması uyarınca, her kas grubu için kümülatif set çubuğunun altında 2 katmanlı dinamik bir tablo yer alır:
  1. Üst Hücre: `📐 [KAS GRUBU] — ANATOMİK ALT BÖLGE DAĞILIMI`
  2. Alt Grid (3 Sütun): Kas grubunun anatomik alt başları (Örn: Omuz -> Ön Deltoit | Yan Deltoit | Arka Deltoit; Sırt -> Latissimus | Rhomboid | Trapez).
* **Alt Baş Durum & Aksiyon Mantığı:**
  - **Çalışan Baş:** `✅ X Set` rozetiyle ve o başı vuran hareketlerin isimleriyle yeşil/aktif gösterilir.
  - **Plandaki Baş:** Haftanın kalan günlerinde varsa `🟡 Planda (X Hrk)` sarı rozetle belirtilir.
  - **Boşta / Atlanan Baş:** Hiç set almamış baş anında `⚠️ 0 Set (Boşta!)` kırmızı uyarısıyla tespit edilir ve doğrudan o başı hedefleyen tek tıkla güne ekleme butonu (`➕ [Egzersiz] Ekle`) içerir.
* **SVG Alt Bölge Geometrisi, Sayaç Senkronu ve TR/EN Metin Eşleştirme Yasası:**
  - **TR/EN Harf Normalizasyonu (`normSearchText`):** Türkçe (`İ`, `ı`) ve İngilizce (`I`, `i`) terimlerin birlikte arandığı fonksiyonlarda çıplak `.toLowerCase()` veya `.toLocaleLowerCase('tr-TR')` yerine `s.replace(/[İIı]/g, 'i').toLowerCase().replace(/\u0307/g, '')` kullanılır; kısa alt dizgiler (`'lat'` vs `'Lateral Shuffle'`) kelime sınırı olmadan eşleştirilmez.
  - **Birincil vs İkincil Alt Kas İzolasyonu:** Alt kas bölmeleri (`getExerciseCompartmentsForMuscle`) belirlenirken önce hareket adı ve birincil (`primary`) kas metni kontrol edilir; ikincil (`secondary`) kas metni yalnızca birincil eşleşme yoksa yedek olarak kullanılır.
  - **Ana + Alt Kas Sayaç ve Şablon Senkronu:** Üst durum butonları (`İyi Çalışan`, `Az / Planda`, `Çalışmayan`) hem 10 ana kas grubunu hem 31 alt kas bölgesini sayar, tıklanınca listeler ve **Şablon (`schedule_full`)** görünümünde alt kasları da aktif (`earnedSets > 0`) olarak renklendirir.
  - **SVG `<clipPath>` & Pin Doğrulaması:** Çoklu SVG alt yolları aynı poligon yönünde (CW) tutulur, alt bölge (`zones`) dilimleri birbiriyle çakıştırılmaz ve tüm numaralı rozetlerin (`pins`) hem `<clipPath>` hem kendi `zone` alanı içinde kaldığı `node -e` (`point-in-polygon`) testiyle doğrulanır.
  - **Referans Bütünlüğü (`recId`):** Tavsiye ve hızlı ekleme butonlarındaki tüm `recId` kimliklerinin `EXERCISES_DB` içinde mevcut olduğu her değişiklik sonrası `node -e` ile doğrulanır.

---

## 5. Mobil Arayüz Hijyeni, Kompakt Akordiyon & Kaydırma Sabitleme (Zero Scroll-Jump) Standardı
* **Ekranı Dikeyde Boğmama Kuralı:**
  Mobil cihazlarda ve PWA arayüzünde çok sayıda buton ve detay içeren ikincil bloklar (özellikle "Koç Tavsiyesi / Önerilen Egzersizler" ve "Hangi Seans & Hareketten Geldi?" lineage detayları) **varsayılan olarak AÇIK BIRAKILMAZ**.
* **Varsayılan Kapalı (Collapsible) Tasarım:**
  Bu bloklar varsayılan olarak kapalı tutulur. Kullanıcı kart üzerinde yalnızca temiz ve kompakt bir toggle butonu görür (`💡 Koç Tavsiyesi (X Öneri) ▼ Göster`). Kullanıcı istediğinde tek dokunuşla açıp kapatabilir. Böylece haftalık analiz ekranı şişmez, son derece akıcı ve okunabilir kalır.
* **Sıfır Ekran Sıçraması ve Kaydırma Sabitleme Yasası (Zero Scroll-Jump & Viewport Anchoring):**
  1. **Render Fonksiyonlarında Koşulsuz Kaydırma Yasağı:** `renderGeneratedWorkout`, `renderPendingWeeklyPlanPreview`, `renderActiveWorkout`, `renderCustomRoutine` gibi yeniden çizim fonksiyonlarının içinde koşulsuz `scrollIntoView()` veya `window.scrollTo({ top: 0 })` ASLA çağrılamaz. Başa kaydırma yalnızca yeni bir program ilk kez üretildiğinde (`options.scrollToTop === true`) açıkça tetiklenebilir.
  2. **`innerHTML` Güncellemelerinde Konum Koruma:** Liste veya kart kapsayıcıları `innerHTML` ile yeniden çizilirken işlem öncesinde `const savedScrollY = window.scrollY` (ve iç kaydırılabilir kutularda `savedScrollTop = container.scrollTop`) kaydedilmeli, çizim sonrasında `window.scrollTo({ top: savedScrollY, behavior: 'instant' })` ile mevcut konum korunmalıdır.
  3. **Akordiyon / Görsel Çekmece Sabitleme (Viewport Delta Anchoring):** Liste içinde bir hareketin görsel/detay çekmecesi açılırken veya kapatılırken (özellikle üstteki açık bir çekmece kapanıp alttaki açıldığında), tıklanan satırın işlem öncesi `anchorOffsetTop = row.getBoundingClientRect().top` değeri alınmalı ve render sonrası `window.scrollBy({ top: newRow.getBoundingClientRect().top - anchorOffsetTop, behavior: 'instant' })` ile tıklanan satır kullanıcının göz hizasında milimetrik sabitlenmelidir.
  4. **Alternatif Seçimi ve Yerinde Değişimde Durum Koruma:** Bir hareketin yerine alternatif seçildiğinde (`selectExerciseFromPicker`) veya rastgele değiştirildiğinde (`swapSingleExercise`), açık olan detay çekmecesi (`expanded*Index`) kapatılmaz ve sayfa yukarı kaydırılmaz; yeni hareket aynı satırda açık olarak gösterilir.
  5. **Modal Kaydırma İzolasyonu:** Modal pencerelerde (`html`/`body` overflow'unu bozmak yerine) `.modal-overlay` ve `.modal-box` üzerinde `overscroll-behavior: contain` kullanılır; modal açıldığında yalnızca modalın kendi iç `scrollTop = 0` değeri sıfırlanır.

---

## 6. Hafif & Kanıta Dayalı Hata Ayıklama (Token Tasarrufu & Sıfır Regresyon)
* **Spekülasyon & Tahmin Yasağı:**
  Hatalarda veya beklenmeyen davranışlarda varsayımlarla rastgele kod değiştirilmez. Konsol çıktısı, DOM durumu veya veri akışındaki somut kanıt tespit edilmeden müdahale yapılamaz.
* **Hafif Doğrulama & Canlı Bütünlük:**
  Her değişiklik sonrası `node -e` ile sözdizimi doğrulanır ve yalnızca hedeflenen özelliğin değil, çevre bileşenlerin de bozulmadığı teyit edilir. Ağır çoklu ajan süreçleri yerine doğrudan ve hızlı doğrulama esastır.

---

## 7. İki Aşamalı Kod İnceleme & Öz-Teşhis (Superpowers Adaptasyonu)
* **2 Aşamalı İnceleme Filtresi:** Kod teslim edilmeden ve canlıya basılmadan önce 2 filtre zorunludur:
  1. *Şartname Doğrulaması:* Kullanıcının istediği tüm isterler ve fonksiyonlar eksiksiz tamamlandı mı?
  2. *Bütünlük & Regresyon Kontrolü:* Yapılan değişiklik mevcut butonları, PWA önbelleğini, yerel veri saklamayı veya görsel hiyerarşiyi bozdu mu?
* **Ajan Öz-Teşhisi (Döngü Kırıcı):**
  Bir hata 2 denemede çözülemezse spekülatif 3. deneme YASAKTIR. Ajan derhal durur, oturum transkriptini tarar, peşin kabul ettiği hatalı varsayımı (assumption) açıkça masaya yatırır ve kullanıcıdan tek bir net kanıt ister.

---

## 8. Görsel & Grafik Üretim Aracı Seçim Protokolü (Canva vs AI Görsel Üretici)
* **Kullanıcı İradesine Saygı:** Görsel, afiş, antrenman şablonu, rozet veya illüstrasyon istendiğinde:
  - Kullanıcı özel olarak bir araç belirtmişse doğrudan o araç çalıştırılır.
  - Araç **belirtilmemişse**, varsayımla hareket edilmez; kullanıcıya şu seçeneklerle sorulur:
    1. **🎨 Canva MCP:** Şablon, düzenlenebilir tasarım, tipografi, sporcu kartları ve afişler.
    2. **🤖 AI Görsel Üretici (`image-generator`):** Sanatsal, gerçekçi veya stilize yapay zeka illüstrasyonları.

---

## 9. Görsel Kontrast & Arka Plan / Metin Renk Uyumu (WCAG Okunabilirlik Kuralı)
* **Açık Zeminde Açık Metin / Koyu Zeminde Koyu Metin Yasağı:**
  - Beyaz veya açık yüzeyler (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`, `#DCFCE7`, `#FEF3C7` vb.) üzerinde ASLA beyaz, açık gri veya soluk pastel metin (`#FFFFFF`, `#F3F6FA`, `#F8FAFC`, `#CBD5E1`, `#B6F059`, `#E5B85B`, `#fde047`, `#e9d5ff`, `#a7f3d0`) kullanılamaz.
  - Açık zeminlerde birincil metinler için `#0F172A`, ikincil metinler için `#334155` / `#475569`, durum rozetleri için koyu doygun tonlar (`#15803D`, `#B45309`, `#0369A1`, `#6B21A8`, `#B91C1C`) zorunludur (minimum **4.5:1**, hedef **7:1+** kontrast).
* **Yalnızca Koyu/Doygun Dolguda Beyaz Metin:**
  - `#FFFFFF` metin rengi yalnızca koyu veya yüksek doygunluklu arka plan dolgularında (`#0F172A`, `#9333EA`, `#EF4444`, `#16A34A` vb.) kullanılabilir.
* **Dinamik Tema Değişkeni & Inline Stil Denetimi:**
  - JS içinde üretilen HTML şablonlarında (`innerHTML`), aktif filtre butonlarında ve `applyTheme()` gibi CSS değişkeni (`--gold` vb.) güncelleyen fonksiyonlarda metin rengi her zaman üzerinde bulunduğu kartın/butonun gerçek arka plan rengiyle birlikte doğrulanmalıdır.

---

## 10. Onay & `/learn` Karar Akışı (Olmayan Butona Yönlendirme Yasağı)
* Arayüzde "Proceed" butonu bulunmadığı durumlarda kullanıcıdan "Proceed butonuna basması" ASLA istenmez.
* `/learn` önerileri veya onay gerektiren adımlarda `ask_question` aracıyla (etkileşimli seçenek kutusuyla) veya doğrudan soru sorularak **işlemin kalıcı olarak uygulanıp uygulanmayacağı** kullanıcıya sorulur.

---

## 11. Kısa Metin & Göz Yormayan Mikro-Metin Yasası (Sohbet ve Arayüz)
* **Uzun Cümle Yasağı:** Hem sohbet yanıtlarında hem uygulama arayüzünde (`index.html`, `js/app.js` içindeki kartlar, rozetler, `<select>` kutuları ve alt açıklamalar) göz yorgunluğu ve kalabalık yaratan uzun cümleler kullanılmaz.
* **Mikro-Metin Standardı:** Başlıklar, rozetler ve seçenekler 2–5 kelimelik sade ifadelerle tutulur (örn. `"⚖️ Orta Süperset"`, `"3 Gün Tüm Vücut"`).
* **Tek Satırlık Yanıtlar:** Sohbet cevaplarında her adım/madde tek satırda net olarak yazılır.


