# 🏋️‍♂️ ÇELİK KODU (EL CÓDIGO DEL ACERO) - DAMBIL FITNESS PROJESİ

Bu proje, spor salonunda dambıllarla uygulanmak üzere hazırlanmış 3 günlük fonksiyonel kuvvet, hipertrofi ve kondisyon antrenman sistemini (PDF ve Mobil PWA Kılavuzları) içerir.

---

## 📂 Klasör Mimarisi & Düzeni

```text
FITNESS/
│
├── 📄 salon_kilavuzu.pdf          ➔ 10 Sayfalık Ana Antrenör PDF'i (Salonda yazdırmak veya telefondan okumak için)
├── 📱 salon_kilavuzu_mobil.html   ➔ Tek parça, çevrimdışı, sesli sayaçlı PWA Mobil Uygulama
├── 🌐 salon_kilavuzu.html         ➔ Masaüstü / Web Sürümü
├── ⚙️ build.sh                    ➔ Otomatik tek tuşla derleme & iCloud senkronizasyon scripti
│
├── 📁 assets/                     ➔ Tüm Görsel ve Grafik Varlıkları
│   ├── diagrams/                  ➔ 18 egzersiz için 3 adımlı şematik vektör panelleri (.svg)
│   └── exercises/                 ➔ Referans yüksek çözünürlüklü egzersiz görselleri
│
├── 📁 docs/                       ➔ Markdown Kılavuzları ve Antrenör Raporları
│   ├── CELIK_KODU_DAMBIL_3_GUNLUK_ANTRENMAN_KILAVUZU.md
│   └── CELIK_KODU_3_GUNLUK_ANTRENMAN_KILAVUZU.md
│
├── 📁 scripts/                    ➔ Üretim, Derleme ve Test Araçları
│   ├── build_full_guide.py        ➔ HTML şablon birleştirici ve SVG gömücü
│   ├── generate_all_diagrams.py   ➔ Biyomekanik pozisyon vektörlerini üreten motor
│   ├── inspect_pages.swift        ➔ PDF sayfa denetleyici
│   └── render_pages.swift         ➔ PDF sayfa önizleme görselleştirici
│
├── 📁 source_archive/             ➔ Orijinal Kaynak Arşivi
│   ├── El Codigo del Acero - La Forja.pdf
│   ├── Çelik Kodu - La Forja (Türkçe).gdoc
│   └── pdf_pages/
│
└── 📁 temp/                       ➔ Geçici geliştirme testleri ve denetim çıktıları
```

---

## 🚀 Hızlı Komutlar

* **Tüm projeyi tek tuşla yeniden derlemek ve iCloud'a eşitlemek için:**
  ```bash
  ./build.sh
  ```

* **Şematik pozisyon vektörlerini yeniden üretmek için:**
  ```bash
  python3 scripts/generate_all_diagrams.py
  ```
