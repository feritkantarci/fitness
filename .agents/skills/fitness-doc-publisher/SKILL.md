---
name: fitness-doc-publisher
description: >-
  Markdown formatındaki fitness, antrenman ve beslenme kılavuzlarını tipografik olarak
  kusursuz, görsel yerleşimli, koyu temalı (dark-mode), profesyonel baskı ve e-kitap
  kalitesinde PDF ve HTML dokümanlarına dönüştüren yayıncılık becerisi. PDF oluşturma,
  e-kitap tasarımı, doküman güzelleştirme, sayfa düzeni veya baskı formatı istendiğinde tetiklenir.
---

# 📖 Fitness Doc Publisher (Antrenman Kılavuzu & E-Kitap Yayıncısı)

Bu beceri, **Çelik Kodu** Markdown dokümanlarını ve tablolarını modern grafik tasarım ilkelerine uygun, estetik ve profesyonel PDF e-kitaplara dönüştürür.

---

## 🎨 Tasarım Prensipleri & CSS Kural Seti

1. **Tipografi & Okunabilirlik:**
   - Başlıklar: Güçlü, atletik ve sans-serif fontlar (`Inter`, `Montserrat`, `Oswald` veya `Bebas Neue`).
   - Gövde Metni: Okuması kolay, gözü yormayan `system-ui, -apple-system, BlinkMacSystemFont`.
   - Satır yüksekliği: `line-height: 1.6`.
2. **Renk Paleti (Çelik Kodu Teması):**
   - Koyu Zemin: `#090d16` veya `#0f172a` (Derin antrasit/çelik mavisi).
   - Kartlar/Bloklar: `#1e293b` (Hafif aydınlık panel arka planları).
   - Vurgu Renkleri: `#e11d48` (Kırmızı / Uyarı / Başlık altı) ve `#f59e0b` (Altın / Set rozetleri).
   - Metin: `#f8fafc` (Birincil beyaz) ve `#94a3b8` (İkincil gri).
3. **Baskı & Sayfa Düzeni (`@media print`):**
   - Sayfa sonları: `page-break-inside: avoid` (Tablolar ve egzersiz kartları sayfa ortasından bölünmemeli).
   - Üst ve Alt Bilgiler: Sayfa numaraları ve telif/bölüm adı tekrarları.
   - Sayfa boyutu: `@page { size: A4 portrait; margin: 15mm; }`

---

## 🛠️ Dönüştürme Araçları ve Akış

- **Yerel HTML ➔ PDF (Headless Chrome):**
  ```bash
  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --disable-gpu --print-to-pdf="cikti.pdf" "giris.html"
  ```
- **WeasyPrint / Pandoc:** Gelişmiş CSS Paged Media formatlaması gerekiyorsa komut satırı araçları ile derleme.
