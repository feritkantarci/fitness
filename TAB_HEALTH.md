# 🛡️ ÇELİK KODU — 7 ŞEF (6 SEKME + GARMIN/TREDICT ŞEFİ) KONTROL PANELİ (TAB_HEALTH)

> **Son Otomatik Kontrol:** `2026-10-25 21:40:39` | **Toplam Hareket:** `273` | **Kırık Hareket Bağlantısı:** `0`

---

## 1. Hangi Şefte Ne Var, Ne Yapar, Nerede Hata Yapar?

| Alan & Sorumlu Şef | Bu Alanda Ne Var? | Kabiliyeti (Ne Yapar?) | En Çok Nerede Hata Yapar? (Bekçinin Koruduğu Yer) | Şu Anki Durum |
| :--- | :--- | :--- | :--- | :---: |
| **1. Üretici Şefi** (`generator-guard`) | Süre/ekipman seçimi, Günlük & Haftalık Program Üretici, Alternatif Hareket Seçici | Sana uygun antrenmanı kurar, beğenmediğin hareketi tek tıkla değiştirir | Hareket değiştirirken sayfanın yukarı zıplaması, gizlediğin hareketin tekrar çıkması | 🟢 Sorunsuz |
| **2. Antrenman & Stüdyo Şefi** (`workout-guard`) | Canlı Antrenman Ekranı, Dinlenme Sayacı, Haftalık Takvim, Kişisel Stüdyo | Antrenman sırasında set/kilo/süre tutar, kendi özel programını kurdurur | Sayfa yenilenince aktif antrenmanın sıfırlanması, biten antrenmanın Geçmişe düşmemesi | 🟢 Sorunsuz |
| **3. Kütüphane Şefi** (`library-guard`) | Hazır Program Şablonları, 269 Hareketlik Egzersiz Kataloğu, "Havuzumdan Gizle" Butonu | Tüm hareketlerin form/kas detayını gösterir, istemediğin hareketi gizler | Gizlenen hareketin kütüphane sayacını bozması veya form görselinin açılmaması | 🟢 Sorunsuz |
| **4. Geçmiş Şefi** (`history-guard`) | Tamamlanan Antrenman Kartları, Seans Silme ve Düzenleme Butonları | Hangi gün kaç set ve kaç kilo kaldırdığını kayıt altında tutar | Buradan antrenman sildiğinde Analiz sekmesindeki kas puanlarının düşmemesi | 🟢 Sorunsuz |
| **5. Analiz Şefi** (`analytics-guard`) | Ön/Arka Vücut Kas Haritası, 31 Alt Kas Tablosu, Mobilite Testi, Tartı & Mezura | Hangi kasın çalıştığını, hangisinin boşta kaldığını bulup tek tıkla hareket önerir | Önerilen hareketin (recId) kütüphanede bulunamaması, Türkçe İ/ı harf hatası | 🟢 Sorunsuz |
| **6. Profil Şefi** (`profile-guard`) | Kullanıcı Hesabı, Bulut Senkronizasyonu, Gemini AI Anahtarı, Renk Temaları, Yedekleme | Verilerini yedekler, cihazlar arası eşitler ve uygulamanın rengini değiştirir | Açık temada yazıların okunmaması, buluta yedeklerken verilerin çakışması | 🟢 Sorunsuz |
| **7. Garmin & Tredict Şefi** (`garmin-tredict-guard`) | Yeni Hareket Kas Denetçisi, İsimsiz+Notlu FIT Üretici, Orijinal Ad Koruyucu, Sağlık Telemetrisi (Nabız/HRR/TUT) | Yeni hareketlerin Garmin karşılığını library-guard kaslarıyla kıyaslar, olmayanları isimsiz+notlu gönderir, dönüşte saatin adını değil bizdeki orijinal adı kullanıp yalnızca sağlık verilerini (nabız/HRR/TUT/kalori) ilgili şefe iletir | Saatten gelen ham hareket adının olduğu gibi alınması, Garmin’de olmayan harekete zorlama isim verilmesi | 🟢 Sorunsuz |

---

## 2. Şefler Birbirini Nasıl Etkiliyor? (Orkestra Köprüleri)

Bir alanda yaptığın işlem diğer şefleri şu 8 bağlantı üzerinden etkiler:

| Hangi Veri? | Veriyi Üreten Şef | Veriyi Kullanan Şefler | Bağlantı Koparsa Ne Bozulur? |
| :--- | :--- | :--- | :--- |
| `celik_excluded_exercises` | `library-guard` | `generator-guard`, `analytics-guard`, `workout-guard` | Gizlenen hareketin üreticide/tavsiyede çıkması |
| `celik_kodu_last_generated_workout` | `generator-guard` | `workout-guard`, `profile-guard`, `garmin-tredict-guard` | Üretilen antrenmanın aktif seansa/saate aktarılamaması |
| `celik_kodu_active_state_${uid}` | `workout-guard` | `profile-guard`, `generator-guard`, `garmin-tredict-guard` | Canlı antrenman yarıda kalınca veri kaybı |
| `celik_kodu_date_schedule_${uid}` | `workout-guard` | `analytics-guard`, `generator-guard` | Takvimdeki planın Analizde 🟡 Planda görünmemesi |
| `celik_kodu_history_${uid} / celik_workout_logs` | `workout-guard / history-guard / garmin-tredict-guard` | `analytics-guard`, `profile-guard` | Silinen/biten/saatten gelen antrenmanın kas set sayısını güncellememesi |
| `celik_garmin_sent_manifests_v1` | `garmin-tredict-guard` | `garmin-tredict-guard`, `history-guard`, `analytics-guard` | Saatten dönen antrenmanda bizdeki orijinal hareket adının kaybolması |
| `celik_garmin_telemetry_v1` | `garmin-tredict-guard` | `analytics-guard`, `history-guard`, `generator-guard` | Saatin sağlık verilerinin (Nabız, HRR, TUT, Kalori) orijinal harekete işlenmemesi |
| `celik_kodu_coach_directive_${uid}` | `analytics-guard` | `generator-guard`, `workout-guard` | Analiz koç direktifinin yeni haftalık plana yansımaması |

---

## 3. Otomatik Bekçi Raporu (Şu Anki Sonuç)
- **Tavsiye Edilen Hareketler Sağlam mı?:** 51 tavsiye butonu kontrol edildi -> **✅ Hepsi sağlam (0 hata)**
- **Sayfa Zıplama (Scroll) Koruması:** ✅ Tüm sekmelerde ekran sabitleme aktif
- **7. Şef (`garmin-tredict-guard`) Orijinal Ad & Sağlık Telemetrisi Koruması:** ✅ Aktif (Garmin'de olmayan hareketler isimsiz+notlu gider; dönüşte saatin adı değil bizdeki orijinal hareket adı korunup yalnızca Nabız/HRR/TUT/Kalori sağlık verisi enjekte edilir)
- **Modal & Hareketli Görsel Denetimi (126 Ana Hareket):**
  - `window.exerciseGuideMap` Global Erişim (`library-guard` / `generator-guard`): **✅ Açık**
  - Diskte Eksik Olan MP4 Dosyası (`library-guard`): **✅ 0 Eksik**
  - Animasyonu Olmayan (Sadece Sabit Fotoğraf Gösteren) Hareketler (**8 adet**): `db_suitcase_carry (Tek El Çanta Taşıma (Suitcase Carry))`, `bb_hip_thrust (Barbell Hip Thrust)`, `mach_leg_press (45° Leg Press)`, `mach_straight_arm_pulldown (Kablo Düz Kol Çekiş (Straight-Arm Pulldown))`, `bw_hyperextension (45° Hiperekstansiyon (Back Extension))`, `cond_indoor_row (Kürek Çekme (Indoor Rowing / Ergometre))`, `cond_walking (Tempolu Yürüyüş & Doğa Yürüyüşü (Walking))`, `cond_running (Koşu & Koşu Bandı (Running / Treadmill))`
