---
name: garmin-tredict-guard
description: Çelik Kodu PWA içindeki 7. Özel Şef (Garmin & Tredict Telemetri ve Doğrulama Şefi). Yeni eklenen hareketlerin çalışan kas gruplarını library-guard'dan alıp Garmin resmi kas kataloğuyla kıyaslar; Garmin'de karşılığı olmayan hareketleri saate isimsiz ama notlu gönderir; saatte tamamlanan antrenmandan yalnızca sağlık verilerini (nabız, zirve nabız, HRR, TUT, kalori) çekip ilgili şeflere bizdeki orijinal hareket adıyla teslim eder.
---

# ⌚ Çelik Kodu — 7. Şef: Garmin & Tredict Şefi (`garmin-tredict-guard`)

Bu şef, **Çelik Kodu PWA** ile **Garmin Forerunner 945 / Tredict** arasındaki tüm veri trafiğinin tek sorumlusudur. Uygulamanın kendi bilimsel egzersiz ve kas mimarisini Garmin'in eksik veya hatalı tahminlerinden korur.

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
   - Sonuç, ilgili şeflere (`workout-guard`, `history-guard`, `analytics-guard`, `generator-guard`) **%100 bizdeki orijinal hareket kimliği + saat sağlık telemetrisi** olarak teslim edilir.

### Görev 4: Plan Dışı İlave Setlerin Yönetimi
1. Eğer sporcu gönderdiğimiz orijinal antrenman bittikten sonra saatte `Lap` tuşuna basarak planda olmayan ilave setler yaptıysa:
   - Bu setler saatin uydurduğu kategori adıyla kaydedilmez; `"⚠️ Plan Dışı İlave Set"` olarak gruplanır.
   - Sporcu tek tıkla bizdeki orijinal hareketi seçtiğinde, saatten gelen sağlık verileri o orijinal hareketin içine yazılarak ilgili şeflere aktarılır.

### Görev 5: Sıfır Ekstra Buton (Otomatik Takvim Senkronu) & Garmin Kullanmayan Kullanıcı Koruması
1. **Sıfır Ekstra Buton:** `Program` veya `Antrenman` sekmelerinde ayrı bir *"Saate Gönder"* butonu bulunmaz. Kullanıcı bir programı **Antrenman Takvimine** eklediği anda (`Bugüne Ekle`, `Yarına Ekle`, `Bu Haftaya Ekle`, `Gelecek Haftaya Ekle` -> `celik_kodu_date_schedule_`, `celik_kodu_weekly_schedule_`, `celik_kodu_next_weekly_schedule_`), `garmin-tredict-guard` takvim kaydını yakalar ve arka planda otomatik olarak saate gönderir.
2. **Garmin Kullanmayan Kullanıcı Koruması (`isGarminEnabledForCurrentUser`):** Garmin özelliği kullanıcı bazlıdır (`celik_garmin_enabled_${uid}`). Garmin kullanmayan bir hesapta arka planda **hiçbir ağ isteği atılmaz**, **hiçbir hata oluşmaz** ve `Geçmiş`/`Analiz` sekmelerinde Garmin kartları gösterilmez (yalnızca `Profil` sekmesinden istenirse açılabilir).

### Görev 6: Doğrudan Canlı Takvim -> Garmin Güç (`Strength`) Kategorisi Protokolü (Kesin Kural)
1. **Neden Tredict Canlı Takvim (Intervals.icu Yasağı):**
   - Kuvvet antrenmanları saate **ASLA** Intervals.icu üzerinden veya `Crossfit`/`Generic` (Kardiyo) tipinde gönderilmez; çünkü Intervals.icu Garmin'in `exerciseCategory`, `exerciseName`, `durationType: "repetitions"` ve `exerciseWeight` alanlarını desteklemez ve saatte kilo/tekrar girişini kapatır.
   - Tüm antrenmanlar **Tredict MCP v2** üzerinden `sportType: "misc"`, `subSportType: "strength_training"` ve `durationType: "repetitions"` şemasıyla gönderilir.
2. **Doğrudan Canlı Takvim Zinciri (`plan-creation` Yerine `add-plan-training`):**
   - Antrenmanın `"My Plans"` taslağında beklememesi için yerel köprü (`scripts/tredict-local-bridge.mjs`), şu 3 adımı arka planda otomatik yürütür:
     1. `planned-workout-list` ile aynı günde bekleyen eski planlı kuvvet antrenmanı varsa `deleteWorkoutIds` listesine ekler.
     2. `calendar-change-ui` çağrısıyla `decisionUrl` ve `requestToken` alır, `POST decisionUrl` (`decision: "confirm"`) ile `allowedToken` üretir.
     3. `add-plan-training` aracını `calendarDate`, `allowedToken` ve `planTraining` ile çağırarak antrenmanı doğrudan **Tredict Canlı Takvimine** ve saatin **Güç (`Strength`)** menüsüne yazar.
   - Eğer Tredict herhangi bir adımda `Unknown exerciseName` dönerse, köprü otomatik olarak yalnız o adımın `exerciseName` alanını kaldırıp (`exerciseCategory` + Türkçe `note` + `exerciseRepetitions` + `exerciseWeight` korunarak) işlemi hatasız tamamlar.
3. **Yerel Köprü Çalıştırma & IIFE Oturum Kuralı:**
   - Yerel köprü Windows üzerinde her zaman `node --use-system-ca scripts/tredict-local-bridge.mjs` komutuyla başlatılır.
   - `js/app.js` IIFE içinde çalıştığından `garmin-tredict-bridge.js` aktif kullanıcıyı `window.getActiveUser` yerine doğrudan `localStorage.getItem('celik_kodu_session')` ve `localStorage.getItem('celik_kodu_active_user_id')` üzerinden okur.

---

## 2. Diğer 6 Şefle İletişim Protokolü

| İlgili Şef | `garmin-tredict-guard` Ne Alır? | `garmin-tredict-guard` Ne Teslim Eder? |
| :--- | :--- | :--- |
| **`library-guard`** (3. Sekme) | Yeni hareketin `id`, `name`, `primaryMuscles`, `secondaryMuscles` verisini alır. | Garmin kas kıyaslama sonucunu (`exact_verified` veya `unmapped_noted`) yazar. |
| **`generator-guard`** (1. Sekme) | Üretilen günlük/haftalık orijinal antrenman şablonunu alır. | Saatten gelen `HRR` ve `Nabız/TUT` sağlık verilerine göre dinlenme/yük tavsiyesi verir. |
| **`workout-guard`** (2. Sekme) | Aktif antrenman adımlarını alıp Orijinal Manifesto kaydıyla saate gönderir. | Saatten dönen sağlık verilerini orijinal hareket adlarıyla aktif seansa işler. |
| **`history-guard`** (4. Sekme) | — | Saatten dönen antrenmanı **bizdeki orijinal hareket adlarıyla + sağlık verileriyle** geçmişe yazar. |
| **`analytics-guard`** (5. Sekme) | — | Orijinal kas gruplarının setlerini + kardiyak/TUT sağlık analizini teslim eder. |
| **`profile-guard`** (6. Sekme) | Yerel bağlantı durumunu kontrol eder (`.tredict-token` asla buluta çıkmaz). | Köprü sağlık durumunu ve doğrulanan hareket sayısını bildirir. |
