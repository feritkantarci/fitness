---
name: garmin-tredict-guard
description: Çelik Kodu PWA içindeki Saat & Takvim Köprüsü Şefi (Garmin & Tredict Doğrulama ve Sağlık Verisi Şefi). Yeni eklenen hareketlerin çalışan kas gruplarını library-guard'dan alıp Garmin resmi kas kataloğuyla kıyaslar; Garmin'de karşılığı olmayan hareketleri saate isimsiz ama notlu gönderir; saatte tamamlanan antrenmandan yalnızca sağlık verilerini (nabız, zirve nabız, HRR, TUT, kalori) çekip ilgili şeflere bizdeki orijinal hareket adıyla teslim eder.
---

# ⌚ Çelik Kodu — 7. Oda: Garmin & Tredict Şefi (`garmin-tredict-guard`)

- **Fiziksel Oda Dosyası:** `js/garmin-tredict-bridge.js`
- **Zorunlu Sınav Maddeleri:** `T16` (Garmin kas doğrulaması, Garmin'de olmayan hareketi isimsiz+notlu gönderme ve saatten dönüşte orijinal hareket kimliği + yalnızca sağlık verisi birleştirmesi), `T22` (7 günlük tekil kanonik takvim birleştirmesi, tekil debounce zamanlayıcısı, kullanıcı bazlı eşzamanlı istek kilidi ve sıfır mükerrer antrenman garantisi), `T56` (Saat Senkronizasyonu kartının onay bekleyen kayıt yoksa gizlenmesi, Test butonsuz/emojisiz/çerçevesiz düz satırlar, mor Onayla ve gri çöp kutusu simgesi), `T58`/`T59` (Saat devir tesliminde kanonik set hacmi ve izometrik süre metriği hesabı + 7 günden eski ham saat telemetrisi/manifest önbelleği budama)

Bu şef, **Çelik Kodu PWA** ile **Garmin Forerunner 945 / Tredict** arasındaki tüm veri trafiğinin tek sorumlusudur. Uygulamanın kendi bilimsel egzersiz ve kas mimarisini Garmin'in eksik veya hatalı tahminlerinden korur ve ürettiği geçmiş kayıtlarını `window.CelikBridgeCustoms` gümrüğünden geçirerek teslim eder.

---

## 1. Şefin 4 Temel Görevi

### Görev 1: Yeni Hareket & Kas Doğruluk Denetimi (`library-guard` ile Koordinasyon)
1. Kütüphaneye (`EXERCISES_DB`) yeni bir hareket eklendiğinde veya güncellendiğinde devreye girer.
2. **Hareketler Şefinden (`library-guard`)** hareketin çalıştırdığı birincil ve ikincil kas gruplarını (`primaryMuscles`, `secondaryMuscles`) alır.
3. Garmin'in 4 resmi kataloğundaki (`Exercises.json`, `Yoga.json`, `Pilates.json`, `Mobility.json` -> `scripts/tredict-fit-catalog.json`) hareket ve kas gruplarıyla kıyaslayarak **Doğruluk Analizi** yapar:
   - **`✅ Tam Uyum (`exact_verified`):** Hem hareket biyomekaniği hem çalışan kas grupları Garmin ile örtüşüyorsa resmi `fitCategory` + `fitName` atanır.
   - **`📝 Garmin'de Yok / İsimsiz Notlu (`unmapped_noted`):** Garmin'de bu hareket yoksa veya kas grupları uyuşmuyorsa zorlama eşleştirme **YAPILMAZ**.

### Görev 2: Garmin'de Olmayan Hareketleri "İsimsiz ama Notlu" Gönderme
1. Garmin'de birebir karşılığı olmayan bir hareket (örn. `db_floor_press_to_bridge` veya yeni eklenen özel bir hareket) saate gönderilirken:
   - `exerciseName` alanı **boş (`undefined`)** bırakılır (saate yanlış/zorlama hareket ismi gönderilmez).
   - `exerciseCategory` genel kategori olarak verilir ve **`note`** alanına bizdeki **orijinal hareket adı + kısa tarif (`[id:hareket_id]`)** yazılır.
2. Böylece sporcu saat ekranında sahte bir hareket adı değil, doğrudan bizdeki orijinal hareket adını görür.

### Görev 3: Saatten Dönüşte "Orijinal Antrenman + Yalnızca Sağlık Verisi" Birleştirmesi
1. **Altın Kural:** *Uygulamamız saatten gelen antrenman verisini olduğu gibi ALMAZ. Saatin tek avantajı sağlık ve fizyolojik sensör verileridir.*
2. Saate antrenman gönderilirken `garmin-tredict-guard`, gönderilen antrenmanın **Orijinal Manifestosunu (`celik_garmin_sent_manifests_v1`)** (adım sırası, bizdeki orijinal `id`, `name`, `primaryMuscles`, `secondaryMuscles`) yerel hafızaya kaydeder.
3. Saatte antrenman tamamlanıp Tredict'ten döndüğünde:
   - Saatin yazdığı veya boş bıraktığı hareket isimleri yok sayılır.
   - Her set, gönderdiğimiz **orijinal antrenmandaki bizdeki orijinal hareket adıyla (`id` ve `name`)** değiştirilir.
   - Saatten **YALNIZCA sağlık verileri** (`heartrate` ortalama nabız, `heartrateMax` zirve nabız, `heartrateRecovery` set arası nabız düşüşü, `duration` gerçek gerilim süresi / TUT, `calories` ve saatte düzeltilen `repetitions` / `weight`) alınıp orijinal hareketimizin içine enjekte edilir.
   - Sonuç, ilgili şeflere (`workout-guard`, `history-guard`, `analytics-guard`, `generator-guard`) **%100 bizdeki orijinal hareket kimliği + saat sağlık verileri** olarak teslim edilir.

### Görev 4: Plan Dışı İlave Setlerin Yönetimi
1. Eğer sporcu gönderdiğimiz orijinal antrenman bittikten sonra saatte `Lap` tuşuna basarak planda olmayan ilave setler yaptıysa:
   - Bu setler saatin uydurduğu kategori adıyla kaydedilmez; `"⚠️ Plan Dışı İlave Set"` olarak gruplanır.
   - Sporcu tek tıkla bizdeki orijinal hareketi seçtiğinde, saatten gelen sağlık verileri o orijinal hareketin içine yazılarak ilgili şeflere aktarılır.

### Görev 5: Yalnızca Antrenman Sekmesinden Manuel Gönderim & Garmin Kullanmayan Kullanıcı Koruması
1. **Otomatik Takvim Gönderimi Yasağı (Yalnızca Manuel Buton):** `Program Oluştur` veya takvime program atama (`celik_kodu_date_schedule_`, `celik_kodu_weekly_schedule_`, `celik_kodu_next_weekly_schedule_`) sırasında arka planda Garmin'e otomatik gönderim **YAPILMAZ**. Garmin'e gönderim yalnızca **Antrenman** sekmesinde seçili günün altındaki **"Garmin — Saate Gönder"** butonu (`sendScheduledWorkoutToGarminWatch`) ile manuel yapılır (hem tekrar gönderimi hem gelecek haftayı destekler).
2. **Harici Takvim (Google / Apple Takvim) Yasağı:** Google Takvim ve Apple Takvim (`.ics`) dışa aktarma ve senkronizasyon özellikleri sistemden tamamen kaldırılmıştır.
3. **Garmin Kullanmayan Kullanıcı Koruması (`isGarminEnabledForCurrentUser`):** Garmin özelliği kullanıcı bazlıdır (`celik_garmin_enabled_${uid}`). Garmin kullanmayan bir hesapta arka planda **hiçbir ağ isteği atılmaz**, **hiçbir hata oluşmaz** ve `Geçmiş`/`Analiz` sekmelerinde Garmin kartları gösterilmez (yalnızca `Profil` sekmesinden istenirse açılabilir).

### Görev 6: Doğrudan Canlı Takvim -> Garmin Güç (`Strength`) Kategorisi Protokolü (Kesin Kural)
1. **Neden Tredict Canlı Takvim (Intervals.icu Yasağı):**
   - Kuvvet antrenmanları saate **ASLA** Intervals.icu üzerinden veya `Crossfit`/`Generic` (Kardiyo) tipinde gönderilmez; çünkü Intervals.icu Garmin'in `exerciseCategory`, `exerciseName`, `durationType: "repetitions"` ve `exerciseWeight` alanlarını desteklemez ve saatte kilo/tekrar girişini kapatır.
   - Tüm antrenmanlar **Tredict MCP v2** üzerinden `sportType: "misc"`, `subSportType: "strength_training"` ve `durationType: "repetitions"` şemasıyla gönderilir.
2. **Doğrudan Canlı Takvim Zinciri (`plan-creation` Yerine `add-plan-training`):**
   - Antrenmanın `"My Plans"` taslağında beklememesi için 7/24 bulut geçiş kapısı şu 3 adımı arka planda otomatik yürütür:
     1. `planned-workout-list` ile aynı günde bekleyen eski planlı kuvvet antrenmanı varsa `deleteWorkoutIds` listesine ekler.
     2. `calendar-change-ui` çağrısıyla `decisionUrl` ve `requestToken` alır, `POST decisionUrl` (`decision: "confirm"`) ile `allowedToken` üretir.
     3. `add-plan-training` aracını `calendarDate`, `allowedToken` ve `planTraining` ile çağırarak antrenmanı doğrudan **Tredict Canlı Takvimine** ve saatin **Güç (`Strength`)** menüsüne yazar.
   - Eğer Tredict herhangi bir adımda `Unknown exerciseName` dönerse, geçiş servisi otomatik olarak yalnız o adımın `exerciseName` alanını kaldırıp (`exerciseCategory` + Türkçe `note` + `exerciseRepetitions` + `exerciseWeight` korunarak) işlemi hatasız tamamlar.
3. **%100 Mobil, Çok Kullanıcılı ve Sıfır Bilgisayar Bağımlılığı Kuralı:**
   - Garmin/Tredict entegrasyonu geliştiricinin veya kullanıcının bilgisayarının açık olmasına (`127.0.0.1`, yerel script veya bilgisayar arka plan servisi) **ASLA bağımlı olamaz**.
   - Her sporcu kendi telefonundan, `Profil` sekmesindeki kendi izole bağlantısıyla 7/24 bulut geçiş kapısı üzerinden doğrudan saatine bağlanır; diğer kullanıcıların verisiyle asla karışmaz ve karşı servisten gerçek onay dönmeden *"saate aktarıldı"* bildirimi gösterilmez.
   - `js/app.js` IIFE içinde çalıştığından `garmin-tredict-bridge.js` aktif kullanıcıyı `window.getActiveUser` yerine doğrudan `localStorage.getItem('celik_kodu_session')` ve `localStorage.getItem('celik_kodu_active_user_id')` üzerinden okur.

### Görev 7: Tekil Kanonik Takvim Eşitlemesi & Mükerrer Antrenman Yasağı (T22)
1. **Parçalı İstek ve Çifte Tetikleme Yasağı:**
   - Haftalık plan onaylandığında veya gün bazlı tarih atandığında `weekly_schedule` ve `date_schedule` anahtarları art arda yazılır. Bu iki anahtar için ASLA ayrı ayrı bağımsız debounce/zamanlayıcı çalıştırılamaz.
   - Tek bir birleşik zamanlayıcı (`unifiedCalendarSyncTimer`) kullanılır; tüm takvim depolama hareketleri tek bir potada toplanıp birleştirilir.
2. **Kanonik Takvim Çözümlemesi (`resolveUnifiedScheduleForNextDays`):**
   - Önümüzdeki 7 takvim gününün her biri için önce `date_schedule` (tarihe özel tekil plan) kontrol edilir, yoksa ilgili haftalık gün şablonundan (`weekly_schedule[dayIdx]`) çekilir.
   - Her takvim günü için liste içinde **en fazla 1 adet antrenman** bulunabilir; aynı tarihe mükerrer/çift antrenman atanması matematiksel olarak engellenir.
3. **Bulut Ağ Geçidi Eşzamanlılık Kilidi (`userPushLockMap`):**
   - Kullanıcı aynı anda farklı sekmelerden veya hızlı tıklamalarla istek gönderse dahi, bulut köprüsü (`api/tredict.mjs`) her sporcu için sıralı bir kilit kuyruğu işleterek çakışan paralel Tredict silme/ekleme yarış durumlarını (race condition) önler.
   - Gönderilen takvimin parmak izi (`v2_unified_...`) son gönderilen imza ile eşleşiyorsa gereksiz mükerrer ağ istekleri susturulur.

### Görev 8: Saat Ekranı İçin Tarih Önekli Başlık Standardı (`DD Ay • [Program Adı]`)
1. **Dar Ekran & Kolay Seçim Hijyeni:**
   - Garmin Forerunner 945 gibi saat ekranlarında karakter alanı sınırlıdır. Saatte antrenman listesinde gezinirken sporcunun antrenmanın hangi güne ait olduğunu anında görmesi için başlığın en başına kısa Türkçe ay formatında tarih eklenir: `16 Kas • Göğüs & Sırt`.
2. **Kapsam ve Çift Yönlü Normalizasyon:**
   - Hem tekil ("Bugüne Ekle", "Yarına Ekle") hem haftalık birleşik takvim çözümlemesinde (`resolveUnifiedScheduleForNextDays`, `buildTredictPlanPayload`, `buildStandaloneCardioStructuredWorkout`, `pushSingleTraining`) başlık formatı `DD Ay • [Program Adı]` haline getirilir.
   - Saatten geri dönüşte eşleştirme (`findSentWorkoutManifestForActivity`) ve geçmişe aktarım sırasında tarih öneki ayıklanarak (`stripWorkoutTitleDate`) programın orijinal adı ve kimliği bozulmadan korunur.


---

## 2. Diğer 6 Şefle İletişim Protokolü

| İlgili Şef | `garmin-tredict-guard` Ne Alır? | `garmin-tredict-guard` Ne Teslim Eder? |
| :--- | :--- | :--- |
| **`library-guard`** (3. Sekme) | Yeni hareketin `id`, `name`, `primaryMuscles`, `secondaryMuscles` verisini alır. | Garmin kas kıyaslama sonucunu (`exact_verified` veya `unmapped_noted`) yazar. |
| **`generator-guard`** (1. Sekme) | Üretilen günlük/haftalık orijinal antrenman şablonunu alır. | Saatten gelen `HRR` ve `Nabız/TUT` sağlık verilerine göre dinlenme/yük tavsiyesi verir. |
| **`workout-guard`** (2. Sekme) | Aktif antrenman adımlarını alıp Orijinal Manifesto kaydıyla saate gönderir. | Saatten dönen sağlık verilerini orijinal hareket adlarıyla aktif seansa işler. |
| **`history-guard`** (4. Sekme) | — | Saatten dönen antrenmanı **bizdeki orijinal hareket adlarıyla + sağlık verileriyle** geçmişe yazar. |
| **`analytics-guard`** (5. Sekme) | — | Orijinal kas gruplarının setlerini + kardiyak/TUT sağlık analizini teslim eder. |
| **`profile-guard`** (6. Sekme) | Kullanıcının kendi izole mobil saat bağlantı durumunu kontrol eder (kişisel anahtarlar ortak koleksiyonlara sızmaz). | 7/24 bulut bağlantı durumunu ve doğrulanan hareket sayısını bildirir. |
- **Onay Kapsülü Hijyeni (T25 — 16 Kas 2026 hatası):** Buluttaki saat kopyasında set verisi yoktur ve onay/silme bilgisi cihaza özeldir. Geçmişte kaydı olan veya hareketi olmayan saat seansı onaya düşmez (`isActivityAlreadyInHistory`, grup sayısı > 0).
- **Zaman Penceresi & Çoklu Seans Koruması (T40 — 18 Kas 2026 hatası):** Aynı günde saat dilimi örtüşen veya `<= 45 dk` yakınlıktaki telefon + saat seansı tek antrenman sayılarak nabız/kalori otomatik birleştirilir (ikinci antrenman gibi onaya düşmez); `> 45 dk` arayla yapılan 2./3./4. antrenmanlar ise hem yerel birleştirmede hem bulut senkronunda korunarak eksiksiz analiz edilir. `7` günden eski saat kayıtları onay kapsülüne düşürülmez, onay/silme kararları yalın ID listesi olarak bulut `user_state` belgesinde taşınır ve kardiyo bildirimini kapatmak geçmiş kaydını silmez.
- **Yalın Onay Kapsülü Standardı (T56):** `renderHistoryGarminSyncPanel` yalnızca onay bekleyen kuvvet seansı varsa görünür (puanlanmış yürüyüş/koşu kayıtları veya onay bekleyen yoksa kutu gizlenir); sağ üstteki `Test` butonu, renkli çerçeveler/sol şeritler ve emojiler kaldırılmıştır, `Onayla` standart mor buton ve `Sil` çerçevesiz tek renk ince çizgisel gri çöp kutusu simgesidir.
