---
name: exercise-visual-pipeline
description: >-
  Anatomik tıbbi illüstrasyon stilinde (saf beyaz zemin, mercan turuncu aktif kas vurgulu, monokrom gri kas çizgileri)
  tekil 1:1 anahtar karelerle sıfır hayaletlenme (zero-blend), sabit kafa/gövde ölçeği, zemin referans gölgesi,
  gerçek diz yaylanması ve parabolik sıçrama fiziğine sahip 20 karelik egzersiz animasyonları (WebP/GIF/MP4) üreten
  doğrulanmış görsel boru hattı.
---

# 🎬 Egzersiz Görsel & Profesyonel GIF Üretim Boru Hattı (Visual Pipeline v3 — Verified)

Bu beceri; fitness ve kardiyo egzersizleri için **karakter kimliği ve gövde boyutu tek piksel dahi değişmeyen, `Image.blend` hayaletlenmesi içermeyen, uzuvları kadraj sınırlarında kesilmeyen, sabit zemin referans çizgisi üzerinde gerçek diz yaylanması ve dikey sıçrama fiziğine sahip** tıbbi fitness animasyonları (WebP / Looping GIF / MP4) üreten standart mühendislik protokolüdür.

---

## 🛑 KESİN VE DEĞİŞMEZ KANUNLAR (8 KANITLANMIŞ ANTİ-PATTERN YASAĞI)

Aşağıdaki 8 hata **bizzat denenmiş, görsel kanıtlarıyla çürütülmüş ve KESİNLİKLE YASAKLANMIŞTIR**:

1. **⛔ `Image.blend` (SAYDAM CROSS-FADE) ENTERPOLASYONU YASAĞI (ÇİFT KAFA / 4 KOL HATASI):**
   - İki farklı pozun arasına `Image.blend(curr, next, alpha)` ile yarı saydam geçiş karesi eklemek KESİNLİKLE YASAKTIR.
   - *Neden:* Kollar ve bacaklar açı değiştirdiğinde saydam karıştırma karede 2 kafa, 4 kol ve 4 bacaklı bulanık hayaletler oluşturur.
   - *Kural:* Animasyondaki **HER KARE %100 NET, KESKİN VE TEKİL BİR POZ OLMAK ZORUNDADIR (`steps_between = 0`)**. Akıcılık saydam karıştırmayla değil, 15–20 adet net durak karesiyle sağlanır.

2. **⛔ SINIRLAYICI KUTU (`ys.min() / ys.max()`) İLE KIRPIP ÖLÇEKLEME YASAĞI (BOY KÜÇÜLMESİ & TERS SIÇRAMA HATASI):**
   - Karakteri `(xs.min(), ys.min(), xs.max(), ys.max())` ile kırpıp `target_feet_y` üzerinden hizalamak KESİNLİKLE YASAKTIR.
   - *Neden:* Kollar baş üstüne (V pozisyonuna) kalktığında `ys.min()` kafa tepesi yerine parmak uçlarını baz alır ve tüm vücudu aşağı iter. Bacaklar yana açıldığında ise dikey bacak izdüşümü kısaldığı için sporcu havada yükselirken kafası aşağı düşer (yo-yo etkisi).
   - *Kural:* Tüm `1024x1024` kaynak görsellerde kafa tepesi (`head_top = 87`) eşitlenir ve **tüm tuval kırpılmadan sabit tekil ölçekle (`SCALE = 0.7617`, `780x780`)** küçültülür. Böylece kafa ve gövde boyutu 20 kare boyunca milimetrik olarak sabit kalır.

3. **⛔ TEK TUVALDE YAN YANA PANORAMİK ŞERİT YASAĞI (UZUV KESİLMESİ HATASI):**
   - Birden fazla aşamayı tek bir 16:9 geniş görselde yan yana çizdirmek KESİNLİKLE YASAKTIR.
   - *Kural:* **HER POZ BAĞIMSIZ 1:1 KARE (`1024x1024`) OLARAK ÜRETİLİR.** Zirve sıçramada dahi parmak uçları ile üst tuval sınırı arasında en az `80–130px` beyaz boşluk kalır.

4. **⛔ MASTER VARLIK DIŞI ZİNCİRLEME REFERANS YASAĞI (ÇİZGİ ROMAN / STİL KAYMASI HATASI):**
   - Üretilen bir ara kareyi bir sonraki karenin referansı yapmak veya sıfırdan metinle çizdirmek KESİNLİKLE YASAKTIR (kalın siyah dış hatlı çizgi roman stiline ve kısa bacak oranına kayar).
   - *Kural:* Her `image-generator` çağrısı doğrudan **`assets/opengym/master_athlete_neutral.png`** dosyasını referans alır. Üretilen her yeni pozun ana gövde ile korelasyonu (`corr_with_master >= 0.95`) ve `head_top = 87` hizası Python ile doğrulanır.

5. **⛔ ZEMİN REFERANSSIZ VE YAYLANMASIZ SIÇRAMA YASAĞI (HAVADA ASILI KUKLA HATASI):**
   - Boş beyaz fonda zemin çizgisi olmadan figürü yukarı-aşağı oynatmak veya bacakları yerdeyken açmak KESİNLİKLE YASAKTIR.
   - *Kural:*
     - `Y = 950` hizasında sabit stüdyo zemin çizgisi ve sporcu yükseldikçe küçülüp hafifleyen **dinamik temas gölgesi** bulunur.
     - Sıçrama öncesinde ve inişte ayak tabanları zemine (`Y = 950`) tam basarken dizlerin dışa bükülüp gövdenin aşağı yaylandığı (`make_knee_dip`: `dip_1`, `dip_2`) gerçek biyomekanik yüklenme kareleri yer alır.
     - Sıçrama mekaniğinde sporcu **önce bacakları bitişikken olduğu yerde dikey sıçrar (`+25px -> +65px -> +100px`)**, yalnızca havadayken kollarını ve bacaklarını açar (`+122px -> +138px -> +150px` zirve).

6. **⛔ SAHTE ALT AJAN BÜROKRASİSİ VE GÖRSELİ İNCELEMEDEN TESLİM YASAĞI:**
   - Görseli görmeyen hayali ajanlar (`vfx-cleanup-artist`, `anatomical-qa-inspector` vb.) tanımlamak yasaktır.
   - *Kural:* Görsel üretimi yalnızca yerleşik **`image-generator`** alt ajanıyla yapılır. Derlenen tüm kareler tek bir **Doğrulama Şeridi (`verify_20_pro_sheet.jpg`)** olarak kaydedilir ve kullanıcıya sunulmadan önce `read_file` aracıyla bizzat incelenir.

7. **⛔ ALFABETİK DOSYA SIRALAMASI (`sorted()`) YASAĞI:**
   - `stage_1.png, stage_10.png, stage_2.png` şeklinde alfabetik sıralama hatasını önlemek için tüm kareler `stage_01.png .. stage_20.png` olarak sıfır dolgulu kaydedilir ve sayısal regex (`extract_stage_num`) ile sıralanır.

8. **⛔ KULLANICI ONAYSIZ CANLIYA ALMA YASAĞI:**
   - Tüm medya ve kodlar yerel diskte hazırlanır; açık talimat olmadan `git push` çalıştırılamaz.

---

## 📐 20 KARELİK GERÇEK SIÇRAMA VE BİYOMEKANİK AKIŞ ŞABLONU

Jumping Jack ve benzeri pliometrik/kardiyo sıçrama egzersizlerinde uygulanan 6 fazlı, 20 karelik standart akış:

| Faz | Kareler | Hareket & Biyomekanik Durum | Zemin İrtifası (`air_elev`) |
| :--- | :--- | :--- | :--- |
| **1. Zemin Yaylanma** | `01` – `03` | Ayaklar bitişik zeminde (`Y=950`), dizler dışa bükülür (`dip_1`, `dip_2`), gövde yaylanır | `0px` (Zemin Teması) |
| **2. Olduğu Yerde Sıçrama** | `04` – `06` | Bacaklar **henüz bitişikken** yerden dikey kesilir ve havaya yükselir | `+25px` $\rightarrow$ `+65px` $\rightarrow$ `+100px` |
| **3. Havada Açılış & Zirve** | `07` – `09` | Havadayken bacaklar ve kollar açılır (`20°` $\rightarrow$ `90° T-Pose` $\rightarrow$ `150° Zirve V`) | `+122px` $\rightarrow$ `+138px` $\rightarrow$ **`+150px` (Zirve)** |
| **4. Geniş İniş & Yaylanma** | `10` – `13` | Açık bacakla alçalır (`+85px`), zemine basar ve geniş diz bükmesiyle (`wide_dip`) sönümler | `+85px` $\rightarrow$ `0px` (Geniş Yaylanma) |
| **5. Geri Sıçrama & Havada Kapanış** | `14` – `18` | Geniş duruştan tekrar havaya fırlar, havadayken bacaklarını birleştirip kollarını indirir | `+45px` $\rightarrow$ **`+115px`** $\rightarrow$ `+80px` $\rightarrow$ `+35px` |
| **6. Bitişik İniş Sönümleme** | `19` – `20` | Bitişik ayakla zemine konar, diz esnetmesiyle darbeyi emer ve `01` karesine döner | `0px` (Zemin Teması) |

---

## 🛠️ UÇTAN UCA UYGULAMA ADIMLARI

### Adım 1: `image-generator` ile Anahtar Pozların Üretimi
- Referans olarak her zaman `/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/assets/opengym/master_athlete_neutral.png` verilir.
- İstem kuralları:
  - `STRICT 0-DEGREE DIRECT FRONTAL VIEW ONLY` (3/4 yan açı kesinlikle yasak).
  - `Soft greyscale pencil-shaded musculature striations (do NOT use thick black cartoon outlines)`.
  - `Bright coral orange (#ea580c) highlights on active muscles`.
  - `Keep the head at the exact same size and position (head_top = 87) as the reference image`.

### Adım 2: Gövde Korelasyonu ve Kafa Hizası Kontrolü
- Üretilen her anahtar pozun `master_athlete_neutral.png` ile gövde korelasyonu ölçülür (`corr >= 0.95` ve `head_top == 87`).
- Uyumsuz veya kalın siyah dış hatlı kareler derhal elenir.

### Adım 3: Diz Yaylanması (`make_knee_dip`) ve 20 Kare Montajı
- `scripts/build_exercise_gif.py` çalıştırılarak:
  1. Arka plan `scipy.ndimage.label` ile saf beyaza (`#FFFFFF`) temizlenir ve yatay merkez `X=512.0` eksenine kilitlenir.
  2. Zemin yaylanma kareleri (`make_knee_dip`) ayak tabanları sabit tutularak üretilir.
  3. Tüm kareler kırpılmadan `SCALE = 0.7617` ile ölçeklenip `Y = 950` zemin çizgisi ve dinamik temas gölgesi üzerine `air_elev` irtifasıyla yerleştirilir.
  4. `Image.blend` kullanılmadan (`steps = 0`) doğrudan GIF, WebP ve MP4 üretilir.

### Adım 4: Görsel Doğrulama Şeridi (`verify_20_pro_sheet.jpg`) Denetimi
- Üretilen 20 karenin tamamı 5x4 tablo (`verify_20_pro_sheet.jpg`) olarak kaydedilir ve `read_file` ile bizzat incelenerek:
  - Çift kol / hayaletlenme olmadığı,
  - Kafa ve gövde boyutunun 20 kare boyunca değişmediği,
  - Bitişik ayakla dikey sıçramanın ve havada açılma/kapanmanın net göründüğü teyit edilir.

---

## 📦 TEKİL ÇIKTI VE TEMİZ DİZİN STANDARDI (SINGLE OUTPUT RULE)
- **Gereksiz Format Çoklaması Yasaktır:** Aynı hareket için 3 farklı klasöre 4 ayrı dosya (`still.webp`, `animated.webp`, `.gif`, `.mp4`) üretilmez.
- **Tek Hedef Dosya:** Egzersiz başına yalnızca **tek bir nihai animasyon dosyası** (`assets/exercises/{id}.gif` veya `assets/exercises/{id}.webp`) üretilir; ara/geçici kare dizinleri işlem sonunda otomatik silinir.
