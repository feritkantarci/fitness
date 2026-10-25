---
name: tab-orchestra
description: Çelik Kodu PWA içindeki 6 ana sekmeyi (Üretici, Antrenman/Stüdyo, Kütüphane, Geçmiş, Analiz, Profil) ve 7. Garmin & Tredict Şefini (garmin-tredict-guard) birbirine karıştırmadan yöneten Orkestra Şefi ve 7 Şef Bekçisi becerisi. Sitedeki herhangi bir sekmede veya Garmin/Tredict köprüsünde değişiklik yapılacağında tetiklenir.
---

# 🎼 Çelik Kodu — Sekme Orkestrası ve 7 Şef Bekçi Sistemi (`tab-orchestra`)

Bu beceri, sitedeki 6 sekmenin ve Garmin/Tredict köprüsünün birbirini bozmasını engeller. Her alanın **1 Sorumlu Şefi (Toplam 7 Şef)** ve tüm sistemi denetleyen **1 Otomatik Bekçisi (`scripts/tab-watchdog.js`)** vardır.

---

## 1. 7 Şef (Kim Nereyi Koruyor?)

| Alan / Sekme | Şef Adı | Görevi (Ne Yapar?) | Kırmızı Çizgisi (Neyi Korur?) |
| :--- | :--- | :--- | :--- |
| **1. Üretici** (`#generatorTab`) | `generator-guard` | Günlük/haftalık antrenman üretir, alternatif hareket seçtirir. | Hareket değişirken sayfa yukarı sıçramaz, gizli hareket kurada çıkmaz. |
| **2. Antrenman & Stüdyo** (`#activeWorkoutTab`) | `workout-guard` | Canlı antrenmanı, sayacı, haftalık takvimi ve Kişisel Stüdyo'yu yönetir. | Antrenman yarıda kalsa bile setler silinmez, bitince Geçmiş'e tam yazılır. |
| **3. Kütüphane** (`#libraryTab`) | `library-guard` | Hazır programları ve 123 hareketlik kataloğu listeler, hareket gizler/açar. | Ana havuzdan (`EXERCISES_DB`) hareket silinmez, sadece kullanıcıda gizlenir. |
| **4. Geçmiş** (`#historyTab`) | `history-guard` | Bitirilen antrenmanları gösterir, kayıt siler veya düzenler. | Geçmişten antrenman silinince Analiz sekmesindeki kas setleri de düşer. |
| **5. Analiz** (`#analyticsTab`) | `analytics-guard` | Vücut haritasını, çalışan/boşta kalan kasları, tartı ve mobiliteyi gösterir. | Boşta kalan kasa tıklanınca önerilen hareket (`recId`) her zaman çalışır. |
| **6. Profil** (`#profileTab`) | `profile-guard` | Kullanıcı girişi, bulut yedekleme, Gemini API ve renk temasını yönetir. | Şifre/API anahtarı buluta sızmaz, açık temada yazılar okunaklı kalır. |
| **7. Garmin & Tredict** (`js/garmin-tredict-bridge.js`) | `garmin-tredict-guard` | Yeni hareketlerin Garmin karşılığını `library-guard` kaslarıyla kıyaslar; Garmin'de olmayan hareketi **isimsiz + notlu** gönderir; dönüşte saatin adını değil **bizdeki orijinal adı** kullanıp **yalnızca sağlık verilerini** (`Nabız`, `HRR`, `TUT`, `Kalori`) ilgili şefe iletir. | Saatten gelen ham hareket adı asla olduğu gibi alınmaz; Garmin'de olmayan harekete zorlama isim verilmez. |

---

## 2. Orkestra Çalışma Kuralı (Adım Adım İşleyiş)

Kullanıcı herhangi bir sekmede veya Garmin/Tredict köprüsünde değişiklik istediğinde şu 3 adım zorunludur:

1. **Önce Bekçiyi Çalıştır (1 Saniye):**
   ```bash
   node scripts/tab-watchdog.js --write-report
   ```
2. **Sadece İlgili Şefi Uyandır:**
   - Kullanıcı *"Analiz sekmesinde..."* dediyse yalnız `analytics-guard` kuralları uygulanır; diğer şeflerin alanına dokunulmaz.
   - Kullanıcı *"Garmin / Tredict / Saat..."* dediyse [`garmin-tredict-guard`](../garmin-tredict-guard/SKILL.md) kuralları uygulanır.
3. **İşlem Bitince Raporu Güncelle:**
   - Değişiklik bittiğinde tekrar `node scripts/tab-watchdog.js --write-report` çalıştırılır ve [`TAB_HEALTH.md`](../../TAB_HEALTH.md) üzerindeki tüm şeflerin `🟢 Sorunsuz` olduğu doğrulanır.
