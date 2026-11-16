---
name: profile-guard
description: Çelik Kodu Profil sekmesini (#profileTab, js/chiefs/profile-chief.js) ve güvenlik/tema katmanını koruyan Kısım Şefi becerisi. Hesap girişi, bulut yedekleme, API anahtarı izolasyonu ve tema kontrastında uygulanır.
---

# 🛡️ 6. Oda — Profil & Güvenlik Şefi (`profile-guard`)

- **Fiziksel Oda Dosyası:** `js/chiefs/profile-chief.js` + Gümrük Sızıntı Kalkanı: `js/chiefs/bridge-customs.js`
- **Zorunlu Sınav Maddeleri:** `T15` (Parola/salt/Gemini API anahtarı sızıntı engeli + açık zeminde beyaz/pastel metin kontrast denetimi), `T24` (Bulut birleşmesinde sıfır `undefined` alan)

## Görev Kapsamı (`#profileTab`)
1. Kullanıcı oturumu, çok kullanıcılı (`uid`) yerel/bulut veri ayrımı ve profil ayarlarını yönetir.
2. Kişisel Gemini API anahtarı saklama, yedekleme dışa/içe aktarma (`sanitizeBackupExportPayload`) ve renk teması (`applyTheme`) değişimini kontrol eder.
3. Çok kullanıcılı mobil/PWA çalışma ortamında geliştirici bilgisayarına sıfır bağımlılık ilkesini korur.

## Kırmızı Çizgiler ve Kurallar
- **Kimlik & Anahtar İzolasyonu:** Parolalar Web Crypto ile tuzlanmış olarak saklanır; `password`, `passwordHash`, `salt` ve kullanıcının üçüncü taraf API anahtarları dışa aktarımlara veya paylaşımlı bulut koleksiyonlarına asla sızdırılmaz.
- **Tema & WCAG Okunabilirlik:** Açık temalarda beyaz/soluk pastel metin yasağı korunur; tüm metin ve rozetler minimum 4.5:1 kontrastı sağlar (`kontrastİhlali === 0`).
- **Güvenlik Başlıkları & İçerik Koruması:** Dinamik HTML şablonlarında güvenli öznitelik kaçışı (`encodeURIComponent` / `dataset` / `textContent`) ve sıkı CSP uygulanır.
- **Hata Hafızası Sicili:** Kullanıcının profil, yedekleme veya tema kontrastında yakaladığı her hata `scripts/tab-watchdog.js` sınavına kalıcı madde olarak eklenir.
- **Sıfır `undefined` Bulut Yazımı (T24 — 16 Kas 2026 hatası):** Firestore `set()` tek bir `undefined` alanda TÜM yazımı reddeder ve kayıtlar sessizce "Kuyrukta" kalır. `mergeWorkoutLogCollections` içinde `a || b` ile üretilen alanlar `dropUndefinedKeys` ile temizlenir, `fbDb.settings({ ignoreUndefinedProperties: true })` açık tutulur ve `syncWorkoutLogsToCloud` yazımdan önce JSON temizliği yapar. (Belirti: telefonda yapılan antrenman başka cihazda/bulutta görünmez.)
