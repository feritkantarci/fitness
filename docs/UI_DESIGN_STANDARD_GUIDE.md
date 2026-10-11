# 📐 ÇELİK KODU — UI & UX TASARIM STANDARTLARI REHBERİ

Bu rehber, projede uygulanan minimalist, mobil uyumlu, yüksek performanslı ve simetrik arayüz tasarım felsefesini standartlaştırmak amacıyla hazırlanmıştır.

---

## 1. Mobil Öncelikli Kompakt Alan Ekonomisi (Space Economy)
* **Dikey Şişmeyi Önleme:** Mobil cihazlarda ekran dikeyde asla boğulmamalıdır. Kullanıcının ilk anda görmesi gerekmeyen ikincil, teşhis veya detay blokları (Örn: AI Teşhis Raporu, Telemetri Kartları) **varsayılan olarak kapalı (gizlenebilir akordiyon)** tasarlanmalıdır.
* **Akordiyon Standardı:** Başlık yanında sade bir toggle butonu (`▼ Göster` / `▲ Gizle`) yer almalı, kullanıcı dokunduğunda anında açılıp kapanmalıdır.

## 2. Simetrik ve Esnek Izgara Mimarisi (Symmetric Grid Architecture)
* **Esnek ve Eşit Sütunlar:** Yan yana duran form elemanları, seçim kutuları (`select`) veya buton grupları asla serbest akışa (`flex-wrap`) bırakılmamalıdır; **CSS Grid** (`display: grid; grid-template-columns: 1fr 1fr; align-items: stretch; gap: 10px;`) ile matematiksel olarak eşit oranlanmalıdır.
* **Kapsülleme ve Taşma Koruması:** `min-width: 0;` ve `box-sizing: border-box;` kuralları kullanılarak farklı ekran genişliklerindeki (iPhone, Android, Tablet) taşmalar kesinlikle önlenmelidir.

## 3. Mikro Metin Hijyeni & Gereksiz Uzunluk Yasağı (Micro-Copy Standard)
* **Yalın Başlıklar:** Modallarda veya kartlarda uzun, yorucu açıklama paragraflarına yer verilmez.
* **Net ve Kısa Etiketler:** Buton metinleri (`⚡ Programı Oluştur`, `🚀 Başlat`) ve form seçenekleri (Örn: `⚡ Tüm Vücut`, `⏱️ 45 Dk`) tek bakışta anlaşılacak kadar kısa ve vurucu tutulur.

## 4. Profesyonel İkonografi & Unifi Tipografi (Visual Hierarchy)
* **SVG Çizgi İkonları:** Kaba emojiler yerine modern arayüz standartlarına uygun, ince konturlu SVG ikonlar (`stroke-width="2"`) tercih edilir.
* **Renk Disiplini:** Rastgele gökkuşağı renkleri yerine, koyu tema zemininde (`#0f172a`, `#1e1b4b`) gri-mavi tonları (`#94a3b8`, `#e2e8f0`) ve durumsal vurgu renkleri (Gold `#eab308`, Success `#4ade80`, Danger `#f87171`) tutarlı şekilde uygulanır.

## 5. FOUC Önleme & Anında Kararlılık (Rendering Stability)
* **Kritik Inline Stiller:** Harici CSS dosyalarının yüklenme gecikmesinden kaynaklanan ham HTML (FOUC) görüntü bozulmalarını önlemek için kritik düzen kuralları (`.tab-nav`, `.modern-app-bar` vb.) `<head>` içinde kritik `<style>` bloklarıyla güvenceye alınır.
