---
name: history-guard
description: Çelik Kodu Geçmiş sekmesini (#historyTab, js/chiefs/history-chief.js) yöneten Kısım Şefi becerisi. Antrenman kayıtlarının listelenmesi, düzenlenmesi (Edit Log), silinmesi, Köprü Gümrüğü denetimi ve Analiz sekmesiyle senkronizasyonunda uygulanır.
---

# 🗂️ 4. Oda — Geçmiş & Kayıt Şefi (`history-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/history-chief.js` + Gümrük: `js/chiefs/bridge-customs.js`
- **Zorunlu Sınav Maddeleri:** `T7` (Geçmiş kayıt düzenlemede kanonik birim ve vücut ağırlığı tonajı), `T17` (Köprü Gümrüğü: bozuk/eksik birimleri otomatik onarma ve içi boş kaydı reddetme)

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
- **Hata Hafızası Sicili:** Kullanıcının geçmiş kayıtlarında yakaladığı her hata `scripts/tab-watchdog.js` sınavına kalıcı madde olarak eklenir.
