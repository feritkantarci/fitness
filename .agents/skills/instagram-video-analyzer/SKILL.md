---
name: instagram-video-analyzer
description: Instagram Reels ve videolarını indirip, kare kare görsel kompozisyonunu, ilk 3 saniyelik kancasını (hook), ses dökümünü, temposunu ve viral algoritmik sinyallerini analiz eden uzman video analiz becerisi.
---

# Instagram Video & Reels Analiz Uzmanı

Bu skill, Instagram Reels ve video URL'lerini (veya yerel video dosyalarını) otomatik olarak işleyerek görsel, işitsel ve algoritmik açılardan derinlemesine analiz eder.

## Ne Zaman Kullanılır?
- Kullanıcı bir Instagram Reels veya video linki verdiğinde (`https://www.instagram.com/reel/...`).
- "Bu videonun kancası neden tuttu/tutmadı?", "İçeriği analiz et", "Metriklerini incele" dendiğinde.
- Reels kurgu, tempo, metin yerleşimi ve algoritmik etkileşim potansiyeli sorulduğunda.

## İş Akışı (Workflow)

### Adım 1: Video Çıkarma ve Kare Ayrıştırma
Verilen Instagram linkini veya video dosyasını ayrıştırmak için yerleşik betiği çalıştırın:

```bash
python3 .agents/skills/instagram-video-analyzer/scripts/extract_reel.py "<INSTAGRAM_URL_VEYA_DOSYA_YOLU>"
```

Bu betik:
1. Videoyu arka planda `yt-dlp` ile çeker.
2. `ffprobe` ile süre, en-boy oranı (9:16 kontrolü) ve çözünürlüğü tespit eder.
3. `ffmpeg` ile sesi (`audio.mp3`) ayıklar.
4. Kanca ve kurgu için kritik kareleri (`frame_hook_start.jpg`, `frame_hook_peak.jpg`, `frame_hook_decision.jpg`, `frame_middle.jpg`, `frame_cta_end.jpg`) çıkarır.
5. Dosya yollarını içeren JSON çıktısı döndürür.

### Adım 2: İçerik ve Uygunluk Odaklı İnceleme (Content & Fit First)
Kullanıcının zamanını korumak için içerik daima "Ne Anlatıyor?" ve "Bana Uygun mu?" ekseninde analiz edilir:

1. **Ana Fikir / Amaç:** Videonun sunduğu temel değer veya vaat tek cümlede özetlenir.
2. **Madde Madde İçerik & Araç Dökümü:** Videoda tanıtılan her araç/beceri için:
   - *Ne yapar?* (1 cümle)
   - *Hangi problemi çözer?* (1 cümle)
   - *Hangi projeler için uygundur?*
3. **Kullanıcıya Uygunluk Değerlendirmesi (Fit Check):**
   - Kullanıcının çalışma ortamı (PWA, web, backend, mobile vb.) dikkate alınarak hangilerinin doğrudan işine yarayacağı, hangilerinin gereksiz olduğu net olarak belirtilir.

### Adım 3: Çıktı Formatı
Analizi kullanıcıya daima şu net şablonda sunun:

```markdown
### 🎯 İçerik Özeti: [Konu Başlığı]
[Tek cümleyle ana vaat]

#### 📦 İçerikteki Araçlar / Maddeler
1. **[Araç 1]:** Ne yapar, ne kazandırır, kimler için.
2. **[Araç 2]:** ...

#### ⚖️ Sana Uygunluk Analizi
- **Doğrudan İşe Yarar:** [Araç X - Nedeni]
- **Şimdilik Gerekli Değil:** [Araç Y - Nedeni]
```
