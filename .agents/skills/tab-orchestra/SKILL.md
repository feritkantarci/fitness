---
name: tab-orchestra
description: Çelik Kodu PWA içindeki 6 ana sekmeyi (Üretici, Antrenman/Stüdyo, Kütüphane, Geçmiş, Analiz, Profil) ve 7. Garmin & Tredict Şefini (garmin-tredict-guard) 7 ayrı fiziksel odada ve Köprü Gümrüğü (bridge-customs) denetiminde yöneten Orkestra Şefi ve 7 Şef Bekçisi becerisi. Sitedeki herhangi bir sekmede veya Garmin/Tredict köprüsünde değişiklik yapılacağında tetiklenir.
---

# 🎼 Çelik Kodu — Sekme Orkestrası, 7 Ayrı Oda ve Köprü Gümrüğü (`tab-orchestra`)

Bu beceri, sitedeki 6 sekmenin ve Garmin/Tredict köprüsünün birbirini bozmasını engeller. Her şef kendi **ayrı fiziksel dosyasında (odasında)** yaşar, şefler arası paylaşılan 8 `localStorage` köprüsü **Köprü Gümrüğü (`js/chiefs/bridge-customs.js`)** tarafından denetlenir ve tüm sistem **7 Şef Bekçisi (`scripts/tab-watchdog.js`)** ile 18 maddelik sınavdan geçirilir.

---

## 1. 7 Şef ve Fiziksel Odaları (Kim Nereyi Koruyor?)

Ortak altyapı dosyaları:
- **Ortak Çekirdek:** `js/chiefs/shared-core.js` (ortak ikonlar, anatomi sabitleri, 3 modlu kanonik birim/tonaj motoru)
- **Köprü Gümrüğü:** `js/chiefs/bridge-customs.js` (8 paylaşılan yerel veri köprüsünde otomatik birim/tarih/kategori onarımı, boş/bozuk kayıt reddi ve parola/API anahtarı sızıntı filtresi)
- **Bağlantı Alt Şefleri & Kutu Arıza Duvarı:** `js/chiefs/liaison-subchiefs.js` (7 şefin iç/dış alıcı haritasını denetleyip hatayı alıcıya gitmeden düzelten, ekranda bildiren, döngü kilidi ve kutu bazlı çalışma anı arıza duvarı sağlayan alt şef katmanı — `T19`)
- **Orkestra Başlatıcı:** `js/app.js` (`window.CELIK_CHIEF_ROOMS` oda sicili ve Service Worker kaydı)

| Oda / Sekme | Şef Adı | Fiziksel Dosyası | Görevi ve Kırmızı Çizgisi |
| :--- | :--- | :--- | :--- |
| **1. Oda — Üretici** (`#generatorTab`) | [`generator-guard`](../generator-guard/SKILL.md) | `js/chiefs/generator-chief.js` | Günlük/haftalık program üretir; ardışık günlerde bir önceki/sonraki gün çalışan birincil 31 alt kası eler ve doğrudan **çalışmayan alt kasları** seçer; gizli hareket kurada çıkmaz, sayfa sıçramaz (`T13`, `T14`). |
| **2. Oda — Antrenman & Stüdyo** (`#activeWorkoutTab`) | [`workout-guard`](../workout-guard/SKILL.md) | `js/chiefs/workout-chief.js` | Canlı antrenman, sayaç, Stüdyo ve Helms Top-Set ağırlık hafızasını yönetir; yarıda kalan setler silinmez, saf vücut ağırlığına hayalet kilo yazılmaz, izometrik hedef en az `30 sn` olur (`T9`, `T10`). |
| **3. Oda — Kütüphane** (`#libraryTab`) | [`library-guard`](../library-guard/SKILL.md) | `js/chiefs/library-chief.js` | `EXERCISES_DB` (SSOT) ve hazır programları yönetir; ana havuzdan hareket silinmez, yalnızca kişisel olarak gizlenir/açılır; 3 modlu birim sınıflandırması tek merkezden yapılır (`T6`). |
| **4. Oda — Geçmiş** (`#historyTab`) | [`history-guard`](../history-guard/SKILL.md) | `js/chiefs/history-chief.js` | Tamamlanan antrenmanları listeler/düzenler/siler; Köprü Gümrüğü ile bozuk/eksik birimleri otomatik onarır, içi boş kayıtları reddeder, dakikalık kardiyoya `0 kg` tonaj yazar (`T7`, `T17`). |
| **5. Oda — Analiz** (`#analyticsTab`) | [`analytics-guard`](../analytics-guard/SKILL.md) | `js/chiefs/analytics-chief.js` | 10 ana / 31 alt kas haritası, Set Dayanıklılığı, Güç Gelişimi, Haftalık Puanlar ve Tartı/Ölçüyü yönetir; Willardson/Helms/Israetel/Epley kurallarını ve tekil `🏆 Zirve Rekor` etiketini korur (`T1..T5`, `T8`, `T11`, `T12`, `T18`). |
| **6. Oda — Profil** (`#profileTab`) | [`profile-guard`](../profile-guard/SKILL.md) | `js/chiefs/profile-chief.js` | Çok kullanıcılı oturum, bulut yedekleme, kişisel Gemini API izolasyonu ve WCAG tema kontrastını korur; parola/salt/API anahtarı dışa veya buluta sızmaz (`T15`). |
| **7. Oda — Garmin & Tredict** | [`garmin-tredict-guard`](../garmin-tredict-guard/SKILL.md) | `js/garmin-tredict-bridge.js` | Garmin kas doğrulaması yapar; Garmin'de olmayan hareketi isimsiz+notlu gönderir; saatten dönüşte bizdeki orijinal hareket kimliğini koruyup yalnızca sağlık verilerini ilgili şeflere gümrükten geçirerek iletir (`T16`). |

---

## 2. Köprü Gümrüğü Protokolü (`CelikBridgeCustoms`)

Şefler birbirlerinin odasına doğrudan yazmaz; paylaşılan 8 veri köprüsüne (`workout_logs`, `active_workout`, `last_generated_workout`, `weekly_schedule`, `date_schedule`, `scale_logs`, `measurements`, `garmin_manifests`) veri bırakılırken `window.CelikBridgeCustoms` zorunlu kontrol yapar:
1. **Otomatik Onarım:** Eksik tarih, kategori, `isTimeBased`, `isBodyweight`, `metricUnit` ve sahte kardiyo tonajını (`0 kg`) sessizce düzeltir.
2. **Bozuk/Boş Kayıt Engeli:** Hareket listesi boş olan, geçersiz kilo (`<= 20 kg` veya `> 350 kg`) içeren veya şeması bozuk kayıtları sessizce reddeder (`rejectedCount`).
3. **Sızıntı Kalkanı:** Yedek/bulut paketlerinden `password`, `passwordHash`, `salt` ve üçüncü taraf API anahtarlarını kazır (`secretStrippedCount`).

---

## 3. Kalıcı Hata Hafızası Sicili ve Canlıya Çıkış Kapısı

1. **Önce Bekçiyi Çalıştır:**
   ```bash
   npm run watchdog
   ```
2. **Sadece İlgili Şefin Odasında Çalış:** Değişiklik yalnızca ilgili şefin fiziksel dosyasında (`js/chiefs/<şef>-chief.js` veya `js/garmin-tredict-bridge.js`) yapılır; diğer 6 şefin odasına dokunulmaz.
3. **Kalıcı Hata Hafızası Kuralı:** Kullanıcının yakaladığı her gerçek hata, ilgili şefin `SKILL.md` dosyasına kural olarak yazılır ve `scripts/tab-watchdog.js` içine yeni bir kalıcı sınav maddesi (`T18`, `T19`...) olarak eklenir.
4. **Zorunlu Canlıya Çıkış Kapısı (`.git/hooks/pre-push`):** `npm run verify` komutu **7/7 şefin tamamında** hem `Ekran Kontrolü` hem **`18/18` Matematik & Gümrük Sınavı** geçmeden `git push` yapılmasına izin vermez.
