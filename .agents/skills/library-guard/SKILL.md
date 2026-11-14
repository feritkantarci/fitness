---
name: library-guard
description: Çelik Kodu Kütüphane sekmesini (#libraryTab, js/chiefs/library-chief.js) ve egzersiz ana veri tabanını (EXERCISES_DB) yöneten Kısım Şefi becerisi. Hareket ekleme, sınıflandırma, gizleme/açma ve kas haritası eşleştirmesinde uygulanır.
---

# 📚 3. Oda — Kütüphane & Ana Havuz Şefi (`library-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/library-chief.js` (ve kanonik sınıflandırıcı çekirdek: `js/chiefs/shared-core.js`)
- **Zorunlu Sınav Maddeleri:** `T6` (3 modlu birim sınıflandırması: `Hollow Body -> sn`, `Kapalı Alan Kürek -> dk`, `Farmers Walk -> sn`)

## Görev Kapsamı (`#libraryTab`)
1. `EXERCISES_DB` ve `ACADEMIC_EXERCISE_SPEC` içindeki tüm egzersizlerin Tek Doğruluk Kaynağı (SSOT) bütünlüğünü korur.
2. Hazır program kataloğunu, hareket rehberlerini, görsel/video eşleşmelerini ve kişisel havuz gizleme/geri açma (`toggleExcludeExercise` / `setUserExcludedExerciseIds`) filtresini yönetir.
3. Eski kayıtlarda eksik olan bayrakları (`isTimeBased`, `isBodyweight`, `category`, `metricUnit`) kanonik çözümleyici (`resolveCanonicalDbExercise`) ile tamamlar.

## Kırmızı Çizgiler ve Kurallar
- **Ana Havuz Dokunulmazlığı:** Kullanıcı bir hareketi kapattığında kaynak koddan asla silinmez; yalnızca kullanıcının kişisel yerel ayarında gizlenir ve istendiğinde geri açılır.
- **TR/EN Metin Normalizasyonu:** Türkçe (`İ`, `ı`) ve İngilizce (`I`, `i`) kas/hareket eşleştirmelerinde `normSearchText` kullanılır; `'lat'` gibi kısa dizgiler kelime sınırı olmadan eşleştirilmez.
- **Birim & Kategori Tutarlılığı:** Süreli izometrikler (`plank`, `hollow`, `carry`), dakikalık kardiyolar (`cond_*`, `indoor_row`) ve kondisyon hareketleri (`conditioning`) tek merkezden sınıflandırılır; önerilen tüm `recId` kimlikleri `EXERCISES_DB` içinde mevcuttur.
- **Hata Hafızası Sicili:** Kullanıcının kütüphane veya egzersiz sınıflandırmasında yakaladığı her hata `scripts/tab-watchdog.js` sınavına kalıcı madde olarak eklenir.
