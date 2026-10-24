# 🛡️ ÇELİK KODU — 6 SEKME ŞEFİ & BEKÇİ KONTROL PANELİ (TAB_HEALTH)

> **Son Otomatik Kontrol:** `2026-10-24 13:08:14` | **Toplam Hareket:** `269` | **Kırık Hareket Bağlantısı:** `0`

---

## 1. Hangi Sekmede Ne Var, Ne Yapar, Nerede Hata Yapar?

| Sekme & Sorumlu Şef | Bu Sekmede Ne Var? | Kabiliyeti (Ne Yapar?) | En Çok Nerede Hata Yapar? (Bekçinin Koruduğu Yer) | Şu Anki Durum |
| :--- | :--- | :--- | :--- | :---: |
| **1. Üretici Şefi** (`generator-guard`) | Süre/ekipman seçimi, Günlük & Haftalık Program Üretici, Alternatif Hareket Seçici | Sana uygun antrenmanı kurar, beğenmediğin hareketi tek tıkla değiştirir | Hareket değiştirirken sayfanın yukarı zıplaması, gizlediğin hareketin tekrar çıkması | 🟢 Sorunsuz |
| **2. Antrenman & Stüdyo Şefi** (`workout-guard`) | Canlı Antrenman Ekranı, Dinlenme Sayacı, Haftalık Takvim, Kişisel Stüdyo | Antrenman sırasında set/kilo/süre tutar, kendi özel programını kurdurur | Sayfa yenilenince aktif antrenmanın sıfırlanması, biten antrenmanın Geçmişe düşmemesi | 🟢 Sorunsuz |
| **3. Kütüphane Şefi** (`library-guard`) | Hazır Program Şablonları, 269 Hareketlik Egzersiz Kataloğu, "Havuzumdan Gizle" Butonu | Tüm hareketlerin form/kas detayını gösterir, istemediğin hareketi gizler | Gizlenen hareketin kütüphane sayacını bozması veya form görselinin açılmaması | 🟢 Sorunsuz |
| **4. Geçmiş Şefi** (`history-guard`) | Tamamlanan Antrenman Kartları, Seans Silme ve Düzenleme Butonları | Hangi gün kaç set ve kaç kilo kaldırdığını kayıt altında tutar | Buradan antrenman sildiğinde Analiz sekmesindeki kas puanlarının düşmemesi | 🟢 Sorunsuz |
| **5. Analiz Şefi** (`analytics-guard`) | Ön/Arka Vücut Kas Haritası, 31 Alt Kas Tablosu, Mobilite Testi, Tartı & Mezura | Hangi kasın çalıştığını, hangisinin boşta kaldığını bulup tek tıkla hareket önerir | Önerilen hareketin (recId) kütüphanede bulunamaması, Türkçe İ/ı harf hatası | 🟢 Sorunsuz |
| **6. Profil Şefi** (`profile-guard`) | Kullanıcı Hesabı, Bulut Senkronizasyonu, Gemini AI Anahtarı, Renk Temaları, Yedekleme | Verilerini yedekler, cihazlar arası eşitler ve uygulamanın rengini değiştirir | Açık temada yazıların okunmaması, buluta yedeklerken verilerin çakışması | 🟢 Sorunsuz |

---

## 2. Sekmeler Birbirini Nasıl Etkiliyor? (Orkestra Köprüleri)

Bir sekmede yaptığın işlem diğer sekmeyi şu 8 bağlantı üzerinden etkiler:

| Hangi Veri? | Veriyi Üreten Sekme | Veriyi Kullanan Sekmeler | Bağlantı Koparsa Ne Bozulur? |
| :--- | :--- | :--- | :--- |
| `celik_excluded_exercises` | `library-guard` | `generator-guard`, `analytics-guard`, `workout-guard` | Gizlenen hareketin üreticide/tavsiyede çıkması |
| `celik_kodu_last_generated_workout` | `generator-guard` | `workout-guard`, `profile-guard` | Üretilen antrenmanın aktif seansa aktarılamaması |
| `celik_kodu_active_state_${uid}` | `workout-guard` | `profile-guard`, `generator-guard` | Canlı antrenman yarıda kalınca veri kaybı |
| `celik_kodu_date_schedule_${uid}` | `workout-guard` | `analytics-guard`, `generator-guard` | Takvimdeki planın Analizde 🟡 Planda görünmemesi |
| `celik_kodu_history_${uid}` | `workout-guard / history-guard` | `analytics-guard`, `profile-guard` | Silinen/biten antrenmanın kas set sayısını güncellememesi |
| `celik_kodu_coach_directive_${uid}` | `analytics-guard` | `generator-guard`, `workout-guard` | Analiz koç direktifinin yeni haftalık plana yansımaması |
| `celik_kodu_scale_${uid} & measurements_${uid}` | `analytics-guard` | `profile-guard` | Tartı ve mezura verilerinin bulut senkronunda kaybolması |
| `celik_kodu_mobility_tests_${uid}` | `analytics-guard` | `generator-guard`, `profile-guard` | Mobilite kısıtlarının ısınma/üretici akışına yansımaması |

---

## 3. Otomatik Bekçi Raporu (Şu Anki Sonuç)
- **Tavsiye Edilen Hareketler Sağlam mı?:** 51 tavsiye butonu kontrol edildi -> **✅ Hepsi sağlam (0 hata)**
- **Sayfa Zıplama (Scroll) Koruması:** ✅ Tüm sekmelerde ekran sabitleme aktif
