---
name: workout-guard
description: Çelik Kodu Antrenman & Stüdyo sekmesini (#activeWorkoutTab, js/chiefs/workout-chief.js) yöneten Kısım Şefi becerisi. Canlı set girişi, akıllı ağırlık hafızası, süre/dakika/tekrar birimleri, stüdyo başlangıcı ve antrenman tamamlama kaydında uygulanır.
---

# 🏋️ 2. Oda — Antrenman & Stüdyo Şefi (`workout-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/workout-chief.js`
- **Zorunlu Sınav Maddeleri:** `T9` (Eric Helms en ağır set ağırlık hafızası + saf vücut ağırlığında hayalet kilo yasağı), `T10` (Canlı seans/Stüdyo 3 modlu varsayılan hedef doğrulaması)

## Görev Kapsamı (`#activeWorkoutTab`)
1. Aktif antrenman ve Kişisel Stüdyo seanslarının başlangıç set hedeflerini (`resolveDefaultExerciseSetTarget`) kurar.
2. Önceki seanstan sonraki antrenmana aktarılacak akıllı ağırlık hafızasını (`getLastExercisePerformance`, `rememberExerciseWeight`) yönetir.
3. Canlı set girişi, dinlenme sayacı, yarıda kalan oturumun korunması (`CelikBridgeCustoms.sanitizeActiveWorkout`) ve bitişte Geçmiş'e (`history-guard`) gümrüklü tam kayıt aktarılmasını sağlar.
4. Antrenman sonu PR (kişisel rekor) özetini çiftlenmiş gerçek set (`pickBestPairedSet`) üzerinden hesaplar.

## Akademik Kurallar ve Kırmızı Çizgiler
- **Akıllı Ağırlık Hafızası (Eric Helms Top-Set Kuralı):** Sonraki seansa aktarılacak kilo, önceki seanstaki **en ağır tamamlanan çalışma setidir** (aynı kiloda en yüksek tekrar eşitlik bozucudur). Sondaki drop-set / back-off setin düşük kilosu (`25 kg` gibi) ana kilo olarak ezberlenmez.
- **Saf Vücut Ağırlığı & Kardiyo Koruması:** Ek ağırlıksız saf vücut ağırlığı hareketlerinde (`Hollow Body`, `Plank`, `Şınav`) hayalet kilogram (`5 kg` vb.) üretilmez (`weight: ''` / `0 kg`). Dakikalık kardiyo hareketleri (`cardio_min`) ağırlık hafızasına ve kilogram tonajına katılmaz (`0` tonaj).
- **3 Modlu Birim & Varsayılan Hedef:**
  - `cardio_min` (`cond_*`, kürek/koşu/yürüyüş — `farmers_walk` hariç): Birim `dk`, hedef dakika.
  - `time_sec` (izometrik/taşıma): Birim `sn`, varsayılan hedef en az `30 sn` (dinamik `8-12` tekrar şemasından `8 sn` türetilmez).
  - `reps`: Birim `tk` / `tekrar`.
- **Köprü Gümrüğü & Veri Koruma:** Antrenman yarıda kalsa bile girilen setler silinmez; bitince `isTimeBased`, `isBodyweight` ve kanonik ID alanları Köprü Gümrüğü onayından geçerek eksiksiz yazılır.
- **Hata Hafızası Sicili:** Kullanıcının canlı antrenman/Stüdyo akışında yakaladığı her hata `scripts/tab-watchdog.js` sınavına kalıcı madde olarak eklenir.
