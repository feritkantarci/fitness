---
name: tab-orchestra
description: Çelik Kodu PWA içindeki 6 ana sekmeyi (Üretici, Antrenman/Stüdyo, Kütüphane, Geçmiş, Analiz, Profil) birbirine karıştırmadan yöneten Orkestra Şefi ve 6 Sekme Bekçisi becerisi. Sitedeki herhangi bir sekmede değişiklik yapılacağında, bir sekmenin ne işe yaradığı sorulduğunda veya sekmeler arası hata kontrolü istendiğinde tetiklenir.
---

# 🎼 Çelik Kodu — Sekme Orkestrası ve 6 Bekçi Sistemi (`tab-orchestra`)

Bu beceri, sitedeki 6 sekmenin birbirini bozmasını engeller. Her sekmenin **1 Sorumlu Şefi** ve tüm sekmeleri denetleyen **1 Otomatik Bekçisi (`scripts/tab-watchdog.js`)** vardır.

---

## 1. 6 Sekme Şefi (Kim Nereyi Koruyor?)

| Sekme | Şef Adı | Görevi (Ne Yapar?) | Kırmızı Çizgisi (Neyi Korur?) |
| :--- | :--- | :--- | :--- |
| **1. Üretici** (`#generatorTab`) | `generator-guard` | Günlük/haftalık antrenman üretir, alternatif hareket seçtirir. | Hareket değişirken sayfa yukarı sıçramaz, gizli hareket kurada çıkmaz. |
| **2. Antrenman & Stüdyo** (`#activeWorkoutTab`) | `workout-guard` | Canlı antrenmanı, sayacı, haftalık takvimi ve Kişisel Stüdyo'yu yönetir. | Antrenman yarıda kalsa bile setler silinmez, bitince Geçmiş'e tam yazılır. |
| **3. Kütüphane** (`#libraryTab`) | `library-guard` | Hazır programları ve 269 hareketlik kataloğu listeler, hareket gizler/açar. | Ana havuzdan (`EXERCISES_DB`) hareket silinmez, sadece kullanıcıda gizlenir. |
| **4. Geçmiş** (`#historyTab`) | `history-guard` | Bitirilen antrenmanları gösterir, kayıt siler veya düzenler. | Geçmişten antrenman silinince Analiz sekmesindeki kas setleri de düşer. |
| **5. Analiz** (`#analyticsTab`) | `analytics-guard` | Vücut haritasını, çalışan/boşta kalan kasları, tartı ve mobiliteyi gösterir. | Boşta kalan kasa tıklanınca önerilen hareket (`recId`) her zaman çalışır. |
| **6. Profil** (`#profileTab`) | `profile-guard` | Kullanıcı girişi, bulut yedekleme, Gemini API ve renk temasını yönetir. | Şifre/API anahtarı buluta sızmaz, açık temada yazılar okunaklı kalır. |

---

## 2. Orkestra Çalışma Kuralı (Adım Adım İşleyiş)

Kullanıcı herhangi bir sekmede değişiklik istediğinde veya hata bildirdiğinde şu 3 adım zorunludur:

1. **Önce Bekçiyi Çalıştır (1 Saniye):**
   ```bash
   node scripts/tab-watchdog.js --write-report
   ```
2. **Sadece İlgili Sekme Şefini Uyandır:**
   - Kullanıcı *"Analiz sekmesinde..."* dediyse yalnız `analytics-guard` kuralları uygulanır; diğer 5 sekmenin tasarımına dokunulmaz.
   - Eğer yapılan işlem ortak bir veriyi (ör. Antrenman Geçmişi veya Gizlenen Hareketler) değiştiriyorsa [`TAB_HEALTH.md`](../../TAB_HEALTH.md) tablosundan etkilenen diğer sekme kontrol edilir.
3. **İşlem Bitince Bekçiyle Onayla:**
   - Değişiklik sonrası tekrar `node scripts/tab-watchdog.js --write-report` çalıştırılır; `0 Kırık ID` ve `🟢 Sağlam` görülmeden görev kapatılmaz.
