---
name: generator-guard
description: Çelik Kodu Üretici sekmesini (#generatorTab, js/chiefs/generator-chief.js) ve kişiselleştirilmiş program oluşturma akışını koruyan Kısım Şefi becerisi. Hareket seçimi, ardışık gün çalışmayan 31 alt kas önceliği, alternatif değişimi, haftalık plan dağılımı ve gizli hareket filtrelemesinde uygulanır.
---

# ⚙️ 1. Oda — Üretici Şefi (`generator-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/generator-chief.js`
- **Zorunlu Sınav Maddeleri:** `T13` (Gizli hareket filtresi + günlük ardışık seans 31 alt kas ayrımı), `T14` (Haftalık ardışık gün 31 alt kas ayrımı + 3 modlu hedef ataması), `T30` (5.000 Senaryo Hata Hafızası: Finisher ekipman/gizleme uyumu, kullanıcı onaylı yorgun bölge kademeli esnetmesi, hazır program otomatik ikamesi ve rastgele değişim kısıt koruması)

## Görev Kapsamı (`#generatorTab`)
1. Kullanıcının seviyesine, ekipmanına, hedef kas dengesine ve seçtiği güne göre günlük/haftalık antrenman üretir.
2. Tek hareket değiştirme (`swapSingleExercise`) ve alternatif seçici (`selectExerciseFromPicker`) akışlarını yönetir.
3. Kişisel havuzda gizlenen hareketleri (`hiddenExercises`) üretim kurasından ve alternatif havuzundan kesin olarak hariç tutar.
4. Üretilen planı `window.CelikBridgeCustoms` gümrüğünden geçirerek Antrenman (`workout-guard`) ve Analiz (`analytics-guard`) şeflerine eksiksiz teslim eder.

## Kırmızı Çizgiler ve Kurallar
- **Ardışık Gün Doğrudan Çalışmayan Alt Kas Yasası (Kesin Kural):** Üst üste iki gün antrenman yapıldığında (hem günlük üretimde dün/bugün hem haftalık programda ardışık günler arasında), dün/önceki gün birincil (`primary`) olarak çalışan 31 alt kas bölgesi bloklanır (`adjacentBlockedSubKeys31`) ve her zaman doğrudan **çalışmayan alt kasları** vuran hareketler seçilir (`0` çakışma).
- **Kullanıcı Onaylı Yorgun Bölge Kademeli Esnetmesi (Seçenek-A):** Kullanıcı günlük/manuel modda dün çalışmış dar bir bölgeyi (örn. Göğüs veya Core) özellikle seçtiğinde ve 0-çakışma kuralı havuzu tükettiğinde, önce kullanıcıya bölgenin dün çalıştığı hatırlatılıp onay (`confirm`) alınır; onay verilirse ekipman/gizleme/hareket ailesi/açı kuralları korunarak en az yorulan alt başlardan (`scoreCandidateBy31SubMuscles`) program tamamlanır ve `fatigueWarning` gösterilir.
- **Finisher Ekipman, Gizleme ve Tekillik Koruması (`resolveSafeWorkoutFinisher`):** Bitiş (Finisher) hareketi seçilirken ve hareket değişimi sonrasında (`syncWorkoutPersistenceAfterEdit`), kullanıcının sahip olmadığı ekipman, gizlediği egzersiz veya ana listedeki hareket/aile asla Finisher olarak atanamaz.
- **Hazır Klasik Programlar & 20 Dk Çelik Akışı Otomatik İkamesi (`sanitizeAndAdaptPresetWorkout`):** Hazır şablonlarda (`la_forja_day1..3`, `loadCelikAkisiWorkout`) gizlenen veya ekipmanı olmayan hareketler otomatik olarak aynı kas/patern alternatifleriyle değiştirilir ve `assignAcademicBlockStructure` ile 3-mod birim hedefleri (`30 sn`, `20 dk`) damgalanır.
- **Rastgele Değişim (`swapSingleExercise`) Kısıt Koruması:** Tekil hareket değiştirilirken kullanıcının özel isteği (`customWish`) ve dün çalışan 31 alt kas (`adjacentBlockedSubKeys31`) kısıtları kesin olarak korunur.
- **Sıfır Ekran Sıçraması:** Hareket değişiminde veya detay çekmecesi açılırken sayfa başa kaydırılmaz (`Zero Scroll-Jump`).
- **Master Havuz & Gizlilik Uyumu:** Gizlenmiş egzersizler kura/program üretimine girmez; önerilen `recId` ve alternatifler `EXERCISES_DB` içinde doğrulanır.
- **3 Modlu Hedef Tutarlılığı (`normalizeExerciseTargetByMetricMode`):** Süreli izometrik (`time_sec`), kardiyo dakikalı (`cardio_min`) ve tekrarlı (`reps`) egzersizlere hem üreticide hem Kişisel Stüdyo ve Alternatif Seçici'de kendi birimlerine uygun hedefler verilir (izometrik harekete `8-12` tekrardan `8 sn` atanmaz).
- **Hata Hafızası Sicili:** Kullanıcının Üretici akışında yakaladığı her hata `scripts/tab-watchdog.js` sınavına kalıcı madde olarak eklenir.
