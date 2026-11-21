---
name: history-guard
description: Çelik Kodu Geçmiş sekmesini (#historyTab, js/chiefs/history-chief.js) yöneten Kısım Şefi becerisi. Antrenman kayıtlarının listelenmesi, düzenlenmesi (Edit Log), silinmesi, Köprü Gümrüğü denetimi ve Analiz sekmesiyle senkronizasyonunda uygulanır.
---

# 🗂️ 4. Oda — Geçmiş & Kayıt Şefi (`history-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/history-chief.js` + Gümrük: `js/chiefs/bridge-customs.js`
- **Zorunlu Sınav Maddeleri:** `T7` (Geçmiş kayıt düzenlemede kanonik birim ve vücut ağırlığı tonajı), `T17` (Köprü Gümrüğü: bozuk/eksik birimleri otomatik onarma ve içi boş kaydı reddetme), `T56` (Geçmiş sekmesi üst `⋮` menüsü, beyaz özet rakamları, scrollbar gizli harf-duyarsız mor mekan filtresi, tek satır başlık+tarih, ara çizgisiz tek satır istatistik, mükerrer gün temizliği ve akıllı kardiyo metrikleri), `T59` (Güncel tartı değişiminde vücut ağırlığı tonajını alarmsız/sessiz eşitleme & kanonik log metrik yeniden hesabı)

## Görev Kapsamı (`#historyTab`)
1. Tamamlanan antrenmanların günlük, egzersiz bazlı set geçmişi ve tonaj özetlerini doğru birimlerle (`dk` / `sn` / `tk`) sunar.
2. Geçmiş kayıt düzenleme (`computeEditLogDraftStats`), kayıt silme ve veri içe/dışa aktarım akışlarını yönetir.
3. `setWorkoutLogs` üzerinden geçen her kaydı `window.CelikBridgeCustoms.sanitizeWorkoutLogs` ile denetler; eksik birim/tarih/kategori alanlarını otomatik onarır, içi boş veya bozuk kayıtları engeller.
4. Düzenleme veya silme sonrası Analiz sekmesi (`analytics-guard`), tartı/vücut ağırlığı tonajı ve son ağırlık hafızasını eşzamanlı günceller.

## Kırmızı Çizgiler ve Kurallar
- **Kanonik Birim & Tonaj Yeniden Hesabı:** Eski veya düzenlenmiş bir kayıtta `resolveCanonicalDbExercise` + `calculateExerciseSetVolume` kullanılır; `cardio_min` hareketleri `dk` olarak gösterilir ve `0 kg` tonaj üretir.
- **Vücut Ağırlığı Senkronu:** Düzenlenen vücut ağırlığı hareketlerinin tonajı kullanıcının güncel tartı kilosu (`getUserActiveBodyweightKg`) üzerinden hesaplanır.
- **Çiftlenmiş Set PR Bütünlüğü:** Egzersiz özetindeki `maxWeight` ve `maxReps`, birbirinden kopuk iki setin maksimumunu çaprazlamak yerine tek en iyi set (`pickBestPairedSet`) üzerinden türetilir.
- **Dışa/İçe Aktarım Güvenliği:** CSV çıktılarında formül enjeksiyonu temizlenir (`sanitizeCsvCell`); JSON içe aktarımda boyut, şema ve parola/API sızıntı filtresi uygulanır.
- **Detay Modalı ve Yerinde Düzenleme Standardı:** Geçmiş kartlarındaki üç nokta (`⋮`) menüsü yalnızca `Görüntüle` ve `Seansı Sil` aksiyonlarını içerir. `Görüntüle` modalında hareketler mobil kart/kaydırma veya kompakt liste modunda incelenir. `✏️ Düzenle` butonu yalnızca seçilen hareketin üzerinde yer alır ve tıklandığında modalı kapatıp liste ekranına dönmek yerine doğrudan açık pencere içinde yerinde set düzenlemesini açar. `💾 Kaydet` tıklandığında modal içi tonaj ve arka plan eşzamanlı güncellenir.
- **Kas Grupları Kompaktlığı (Yer Tasarrufu):** Modal içinde kas grupları 2 satırlık açık etiket yığını olarak değil, varsayılan kapalı kompakt `💪 X Kas ▼` butonu olarak sunulur; tıklandığında açılıp kapanarak dikey ekran alanından tasarruf sağlar.
- **Hata Hafızası Sicili:** Kullanıcının geçmiş kayıtlarında yakaladığı her hata `scripts/tab-watchdog.js` sınavına kalıcı madde olarak eklenir.
- **Aynı Gün Çoklu Antrenman & Bulut Birleşmesi (T40):** Aynı gün farklı saat dilimlerinde (`> 45 dk` arayla) yapılan 2., 3. ve 4. antrenmanlar (`log_` + onaylı `garmin_`) bulut birleştirmesi sırasında takvim günü bazlı olarak silinmez; tümü korunarak geçmişte ve haftalık analizde sayılır.
- **Yalın Koyu Görsel Dil & Kompakt Tek Satır Kart Standardı (T56):** Üst başlıkta ayrı `CSV`/`Yedek`/`Yükle` butonları yerine tek sade `⋮` menüsü yer alır; 3 özet kutu rakamı net beyazdır. Mekan filtrelerinde yatay kaydırma çubuğu (`.hide-scrollbar`) gizlenir, `'Ev'`/`'EV'` gibi büyük/küçük harf farkları tek `'Ev'` filtresinde birleşir ve aktif seçim mor dolgu alır. Tüm tarihler saat olmadan tek tip `'19 Kas 2026'` biçiminde başlıkla aynı satırda sağda gösterilir; başlıklardaki `'Cuma: Cuma:'` tekrarları tekilleştirilir. Üst etiketler ve ara yatay çizgi kaldırılarak istatistikler tek satırda nokta ayırıcıyla (`7.023 kg · 27 Set (322 Tk) · 54 dk`, kardiyoda `123 bpm · 135 kcal · 21 dk`) gösterilir; antrenman notu en altta tek satır kesilmiş (`ellipsis`) silik gri italik metindir ve tüm sekme sıfır emojilidir.
