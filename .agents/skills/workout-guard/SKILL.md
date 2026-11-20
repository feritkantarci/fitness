---
name: workout-guard
description: Çelik Kodu Antrenman & Stüdyo sekmesini (#activeWorkoutTab, js/chiefs/workout-chief.js) yöneten Kısım Şefi becerisi. Canlı set girişi, akıllı ağırlık hafızası, süre/dakika/tekrar birimleri, stüdyo başlangıcı ve antrenman tamamlama kaydında uygulanır.
---

# 🏋️ 2. Oda — Antrenman & Stüdyo Şefi (`workout-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/workout-chief.js`
- **Zorunlu Sınav Maddeleri:** `T9` (Eric Helms en ağır set ağırlık hafızası + saf vücut ağırlığında hayalet kilo yasağı), `T10` (Canlı seans/Stüdyo 3 modlu varsayılan hedef doğrulaması), `T20` (Daylight odak modu dinlenme ekranı, çift gelişim eğrisi [Kilo/Tekrar] ve süperset geçiş bütünlüğü), `T38` (Üretici & Antrenman sekmeleri arası Koyu Mor `#181530` tema ve `.wk-carousel-wrap` tam ekran yatay hikaye kartı düzeni bütünlüğü)

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
- **Daylight Odak Modu & Çift Gelişim Eğrisi (T20):** Canlı antrenmanda set tamamlandığında dinlenme ekranı devreye girer. Dinlenme ekranında dikey alanı şişirmeden tek kart içinde hem Kilo hem Tekrar gelişim eğrisi alt alta çizilir (kardiyoda Süre & Nabız). Süpersetlerde 1. hareket (A1) bitince 2. harekete (A2) geçiş sunulur; dinlenme bitince odak A2'ye, 2. hareket bitince tur dinlenmesi sonrası odak tekrar A1 sonraki tura kayar.
- **Üretici & Antrenman Görsel/Kart Bütünlüğü (T38):** `#activeWorkoutTab` hem takvimde seçili günün program önizlemesinde (`renderCalendarWeeklyView`) hem canlı antrenman odak ekranında (`renderDaylightActiveSetStudioHtml`) Üretici sekmesi (`#generatorTab`) ile aynı `.wk-carousel-wrap` (üst hikaye çubuğu + 155px stüdyo medya kutusu + alt navigasyon/aksiyon dock'u) kart düzenini ve Koyu Mor (`#181530` / `#100E22`) temasını kullanır; Takvim, Manuel Stüdyo veya Modallarda beyaz/düşük kontrastlı kırık yüzey bırakılamaz.
- **Hareket Rehberi Koyu Tema Bütünlüğü (T46):** Antrenman çekmecesindeki `.pos-guide-wrapper`, başlık, sekmeler ve içerik koyu mor yüzey kullanır; rehber şablonlarına gömülü açık gri paneller de karanlık yüzeye uyarlanır. Egzersiz fotoğrafı ve animasyonlarının kendi arka planlarına müdahale edilmez.
- **Sıfır Açıklama Banner'ı ("Bu Bir Defter Değil"):** Canlı antrenman ekranına sarı, turuncu veya renkli arka planlı "Sıradaki Adım...", rehber veya yönerge kutuları eklenemez. Ekran not defteri değildir; süperset ve tur akışları yalnızca kart içi buton ve kompakt set çipleriyle yönetilir.
- **Hata Hafızası Sicili:** Kullanıcının canlı antrenman/Stüdyo akışında yakaladığı her hata `scripts/tab-watchdog.js` sınavına kalıcı madde olarak eklenir.
