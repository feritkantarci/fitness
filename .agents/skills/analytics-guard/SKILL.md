---
name: analytics-guard
description: Çelik Kodu Analiz sekmesini (#analyticsTab, js/chiefs/analytics-chief.js) yöneten Kısım Şefi becerisi. Kas Haritası (10 ana / 31 alt kas), Set Dayanıklılığı, Güç Gelişimi, Haftalık Fitness/Kardiyo Puanları ve Tartı/Ölçü/Koç Telemetrisini kapsar.
---

# 📊 5. Oda — Analiz & Bilimsel Metrik Şefi (`analytics-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/analytics-chief.js`
- **Zorunlu Sınav Maddeleri:** `T1..T5`, `T8`, `T11`, `T12`, `T18` (9 akademik & hata hafızası testi)

## Görev Kapsamı (`#analyticsTab`)
1. **Anatomik Kas Haritası:** 10 ana kas ve 31 alt kas bölgesinin haftalık set dağılımını, SVG/pin geometrisini ve hızlı ekleme (`recId`) linklerini yönetir.
2. **Set Dayanıklılığı (`analyzeIntraSessionFatigueAndDropOff`):** Seans içi set akışını değerlendirir.
3. **Güç Gelişimi (`analyzeExerciseProgressionHistory`):** Seanslar arası güç ve tekrar gelişimini izler.
4. **Haftalık Puanlar (`calculateWeeklyFitnessAndCardioScores`):** Fitness ve Kardiyo skorlarını hesaplar.
5. **Tartı, Ölçü & Telemetri (`getUserActiveBodyweightKg`):** Güncel vücut ağırlığı ve mezura takibini Köprü Gümrüğü (`sanitizeScaleLogs`, `sanitizeMeasurementLogs`) güvencesiyle yönetir.

## Bağlayıcı Akademik Kurallar ve Hata Hafızası Sicili
1. **Tartı Birincil Kaynağı (`T11`):** Aktif vücut ağırlığında tek birincil kaynak tarih sırasıyla en güncel tartı kaydıdır (`getScaleLogs()` `[0]`, `> 30 kg`); 30 gün sınırı yüzünden güncel kilo veya AI koç telemetrisi asla sıfırlanmaz/düşmez.
2. **Eski Kayıt Kanonik Onarımı (`T6`):** `id`/`name` üzerinden `EXERCISES_DB` ile birleştirilerek eksik `isTimeBased`, `isBodyweight` ve `cardio_min` bayrakları onarılır (`Hollow Body` her zaman `sn`).
3. **Artan Piramit Setler (`T1`):** Kilo artışı (`7.5×12 ➔ 10×12 ➔ 12.5×10`) Epley `e1RM = yük × (1 + tekrar/30)` formülüyle değerlendirilir; güç arttıysa `📈 Piramit Güç Artışı` olarak ödüllendirilir, düşüş sayılmaz.
4. **Isınma + Ağır Top-Set + Back-Off & Drop-Set (`T2`, `T3`):** İnceleme en ağır çalışma setine kilitlenir (`35×10 ➔ 35×7` düşüşünü yakalar). Kontrollü kilo düşürmeli drop-setlerde (`45×12 ➔ 40×12 ➔ 35×12`) şiddetli tekrar çöküşü yoksa `🔻 Kontrollü Kilo Düşürme` verilir; asla `"Tam Dayanıklılık (Sıfır Kayıp)"` yazılmaz.
5. **Sabit Kiloda Yorgunluk Eşiği — Willardson & Burkett 2005 (`T4`, `T5`):** Tekrar setlerinde `-1` ve `-2` tekrar kaybı 8 tekrarlı ağır setlerde bile her zaman `🔋 Doğal Kas Yorgunluğu` kabul edilir (`%22` alt tekrar yüzdesi kuralı yoktur). Kırmızı `⚡ Hızlı Güç Düşüşü` yalnızca `<= -3 tekrar` olduğunda verilir. İzometrik süre setlerinde (`sn`) kırmızı düşüş yalnızca **hem `>= 10 sn` hem `>= %25`** kayıp birlikteyse tetiklenir.
6. **Ekipmansız Hareket Öneri Kuralı (`T5`):** Ek ağırlık eklenmemiş saf vücut ağırlığı veya süre bazlı hareketlere (`Plank`, `Hollow Body`) asla `+1 ile +2.5 kg` önerilmez; süre veya tekrar artışı önerilir.
7. **Seanslar Arası Çiftlenmiş Gelişim & Tekil Zirve Etiketi (`T8`, `T18`):** Her seanstan kopuk `maxWeight × maxReps` değil, Epley'e göre en iyi gerçek tek set alınır. `Başlangıç`, `🏆 Zirve Rekor` ve `Son Durum` ayrı tutulur; kartta mükerrer `Zirve Rekor` etiketi basılmaz (`peakCount === 1`). Son 2 seansta üst üste düşüş `2 Seansta Belirgin Yorgunluk`, tek günlük düşüş `Geçici Dalgalanma` olarak ayrılır.
8. **Haftalık Puan & Kardiyo Dakikası (`T12`):** `totalTimeUnderTensionSec || timeUnderTensionSec` okunur; `cond_*` ve `conditioning` hareketleri gerçek kaydedilmiş dakika (`sets` / `durationMinutes`) üzerinden Kardiyo puanına katılır.
9. **WCAG Kontrast & Hata Hafızası:** Açık rozetlerde yalnızca yüksek kontrastlı koyu metin kullanılır; kullanıcının yakaladığı her analiz hatası `scripts/tab-watchdog.js` içine kalıcı test olarak işlenir.
