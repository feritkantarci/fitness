# ⚡ ÇELİK KODU - AKADEMİK SPOR BİLİMİ & AI KOÇ İSTASYONU (Masaüstü Uygulaması)

Bu masaüstü programı, **Çelik Kodu Web Uygulamasından (fitness.kantarci.io)** bağımsız çalışan, ancak **Firebase Firestore bulut veritabanı** üzerinden sporcunun tüm geçmişini anlık okuyan, akademik spor bilimi modelleri ve Google Gemini AI ile analiz eden ve web uygulamasına uzaktan direktif/program gönderen profesyonel bir koç istasyonudur.

---

## 🔬 Akademik Spor Bilimi Çerçevesi

Program aşağıdaki kanıt temelli (evidence-based) spor bilimi literatürünü temel alır:

1. **Volume Landmarks (Hacim Eşikleri - Dr. Mike Israetel / Brad Schoenfeld):**
   * **MEV (Minimum Effective Volume):** Kas grubunun büyümesi için gereken asgari haftalık set sayısı.
   * **MAV (Maximum Adaptive Volume):** En hızlı hipertrofinin sağlandığı altın oran (haftalık 12-20 set).
   * **MRV (Maximum Recoverable Volume):** Toparlanmanın çöktüğü, sakatlık ve aşırı yorgunluk getiren tavan sınır.
2. **Efektif Tekrar Modeli (Chris Beardsley):**
   * Setin son 5 tekrarının ürettiği gerçek mekanik gerilimi (Mechanical Tension) ölçer.
   * RPE < 6 veya tek seansta 10 seti aşan **Çöp Hacmi (Junk Volume)** tespit edip ayıklar.
3. **Biyomekanik ve Yapısal Denge (Dr. Stuart McGill & Bret Contreras):**
   * İtiş / Çekiş Hacim Oranı ($Push:Pull \approx 1:1.2$).
   * Ön / Arka Bacak Kinetik Dengesi ($Quad:Hamstring/Glute$).
4. **Kademeli Aşırı Yüklenme (Progressive Overload):**
   * Haftalık tonaj eğilimi, plato tespiti ve deload uyarıları.

---

## 🚀 Nasıl Çalıştırılır?

### Geliştirme / Hızlı Başlatma Modu:
Terminalden `desktop-app` klasörüne girip:
```bash
npm start
```
Uygulama penceresi Mac'inizde anında açılacaktır.

---

## 📦 Kurulum Paketleri Oluşturma (Mac & Windows)

### 🍏 Mac İçin (.dmg / .app Kurulum Dosyası):
```bash
npm run dist:mac
```
Çıktı `desktop-app/dist/` klasöründe çift tıklanıp Applications klasörüne sürüklenebilir bir `.dmg` dosyası olarak üretilir.

### 🪟 Windows İçin (.exe Kurulum Sihirbazı):
```bash
npm run dist:win
```
Çıktı `desktop-app/dist/` klasöründe Windows kullanıcılarının çift tıklayıp kurabileceği bir `.exe` (NSIS Installer) olarak üretilir.

---

## ⚙️ Yapay Zeka (Gemini) Ayarı
Uygulama açıldığında sağ üstteki **⚙️ (Ayarlar)** butonuna tıklayarak Google Gemini API anahtarınızı girip kaydedebilirsiniz. Anahtar yerel olarak güvenli bir şekilde saklanır.
