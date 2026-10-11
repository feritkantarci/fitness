---
name: fitness-pwa-builder
description: >-
  Statik spor ve antrenman rehberlerini (HTML/Markdown), sesli dinlenme sayaçları (timer),
  set/tekrar/kilo takip kutuları, yerel veri saklama (LocalStorage) ve çevrimdışı çalışma
  (PWA/Service Worker) özelliklerine sahip modern, mobil uyumlu spor salonu web uygulamalarına
  dönüştüren uzman frontend becerisi. İnteraktif salon arayüzü, antrenman sayacı, web uygulaması
  veya mobil takip arayüzü istendiğinde tetiklenir.
---

# 📱 Fitness PWA & İnteraktif Salon Uygulaması Becerisi

Bu beceri, fitness rehberlerini ve egzersiz tablolarını salonda pratik olarak kullanılan, internetsiz çalışan (PWA) interaktif mobil web uygulamalarına dönüştürür.

---

## 🛠️ Temel Bileşenler ve Mimari Standartları

### 1. Dinamik Dinlenme Sayacı (Rest Timer & Cues)
- **Süperset Blokları İçin:** A1/A2 geçişlerinde 0–30 sn, blok sonlarında 60–90 sn geri sayım.
- **Sesli & Dokunsal Uyarı:** 
  - Geri sayım bitiminde Web Audio API ile kısa çift bip sesi (`beep()` frekansı: 880Hz -> 1760Hz).
  - Destekleyen mobil cihazlarda titreşim (`navigator.vibrate([200, 100, 200])`).
- **Arka Planda Durmama:** `requestAnimationFrame` veya `Date.now()` delta hesabı kullanarak ekran kilitlense veya sekme değişse dahi sürenin doğru akması sağlanmalıdır.

### 2. Set & Ağırlık Takibi (Interactive Logging)
- Her egzersiz satırında:
  - Hedef set/tekrar göstergesi.
  - Girilen ağırlık (kg) ve yapılan tekrar sayısı için hızlı artır/azalt butonları (`-` / `+`).
  - Set tamamlandı onay kutusu (Checkbox) ➔ İşaretlendiğinde otomatik olarak dinlenme sayacını başlatma opsiyonu.
- **Veri Kalıcılığı:** Tüm girdiler anlık olarak `localStorage` içine JSON formatında kaydedilmeli, sayfa yenilense bile seans verisi kaybolmamalıdır.
- **Seansı Sıfırla / Arşivle:** Antrenman bittiğinde tek tuşla geçmişe kaydetme ve bugünü sıfırlama seçeneği.

### 3. PWA & Mobil Optimizasyon (Offline-First)
- **Tek Dosya (Zero-Dependency) Önceliği:** Harici framework (React/Vue build süreçleri) gerektirmeden, tek bir modern `.html` dosyası içinde Vanilla JS ve CSS ile taşınabilir ve anında açılır olmalı.
- **Web App Manifest:**
  - `display: standalone` (tarayıcı adres çubuğunu gizler, tam ekran native hissi verir).
  - Tema rengi: Koyu/Karakteristik Çelik Kodu paleti (`#0f172a`, `#1e293b`, `#e11d48` veya altın/çelik vurguları).
- **Service Worker:** Varsa görseller ve HTML çevrimdışı önbelleğe (CacheStorage) alınarak salonda internet olmasa dahi kesintisiz çalışmalıdır.

---

## 📐 Kod Şablonları & Yardımcı Fonksiyonlar

### A. Web Audio API ile Bip Sesi Üretici
```javascript
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.15); // A6
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn("Ses izni verilmedi veya desteklenmiyor:", e);
  }
}
```

### B. Otomatik Zamanlayıcı Mantığı
```javascript
let timerInterval = null;
function startRestTimer(durationSeconds, displayElement, onComplete) {
  clearInterval(timerInterval);
  const endTime = Date.now() + durationSeconds * 1000;
  
  function update() {
    const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    displayElement.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      playAlertSound();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      if (onComplete) onComplete();
    }
  }
  update();
  timerInterval = setInterval(update, 250);
}
```
