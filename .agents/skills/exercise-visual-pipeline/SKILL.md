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
   - *Kural:* Her `image-generator` çağrısı doğrudan beceri içindeki hazır kalıp görselleri referans alır:
     - 3/4 açı (dambıl/kettlebell/menteşe/çekiş): `/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/.agents/skills/exercise-visual-pipeline/resources/master_3q_dumbbell.png`
     - 0° tam cephe açı (kardiyo/sıçrama): `/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/.agents/skills/exercise-visual-pipeline/resources/master_frontal_neutral.png`

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

### Adım 1: `image-generator` ile Anahtar Pozların Üretimi (Tek Paralel Dalga)
- **Hazır Kalıp Referanslar (Sıfırdan Karakter Üretme — Doğrudan Kullan):**
  - Pliometrik / kardiyo sıçrama hareketleri (Jumping Jack vb.): `STRICT 0-DEGREE DIRECT FRONTAL VIEW` -> `/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/.agents/skills/exercise-visual-pipeline/resources/master_frontal_neutral.png`
  - Kalça menteşesi (hinge), çekiş (row) ve çok fazlı dambıl/kettlebell hareketleri (Row, RDL, High Pull, Cuban Rotasyon vb.): **OpenGym standart 3/4 sağ-ön anatomik açı** -> `/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/.agents/skills/exercise-visual-pipeline/resources/master_3q_dumbbell.png`
- **Ortak Stil Kuralları:**
  - `Soft greyscale pencil-shaded musculature striations (do NOT use thick black cartoon outlines)`.
  - `Bright coral orange (#ea580c) highlights ONLY on active target muscles`.
  - Saf `#FFFFFF` beyaz zemin, sıfır yazı/kutu/poster şeması.
- **Tek Seferde Paralel Üretim (3–4 Dakika Hedefi):**
  - Çok fazlı hareketlerde anahtar duruşlar tek tek sırayla beklenmez; tüm fazların anahtar pozları **tek bir paralel dalgada (single-wave batch)** aynı anda `image-generator` alt ajanlarına gönderilir.

### Adım 1B: Eklem Dönüşlerinde "Önce 3B Kılavuz, Sonra Tek Tur Dikiş Silme" (Guide-First Articulation)
- Omuz/dirsek eksenli rotasyonlarda (örn. Cuban dış rotasyon) metinle *"kolları 45° döndür"* dendiğinde model dirsekleri yana açıp hatalı T-pose üretir; **metinle deneme-yanılma YASAKTIR**.
- Doğru yöntem:
  1. Mevcut tepe/başlangıç karesinden Python ile dirsek pivotu etrafında **3B perspektif kısaltmalı (`foreshortened`, min `0.76x` eksenel ölçek) kılavuz kare (`guide_pose.png`)** 2 saniyede oluşturulur.
  2. Bu kılavuz kare `image-generator` aracına verilerek tüm vücut, açı ve dambıllar %100 sabit tutulup **yalnızca dirsek birleşim çizgisi tek turda pürüzsüzleştirilir**.

### Adım 2: Ters Sarım (`Ping-Pong`) İniş Yasağı & Sabit Ölçek Kilidi (`fixed_scale`)
- **Ters Ping-Pong Yasağı:** Birleşik hareketlerde (örn. Eğilerek Row + High Pull + Cuban) çıkış karelerini geriye sarmak inişte **sahte ikinci çekiş (reverse row)** hatası yaratır. İniş fazı için dik duruştan düz kollarla kalça menteşesine inen ayrı geçiş karesi kullanılır.
- **Sabit Ölçek Kilidi (`fixed_scale`):** Öne eğilme (hinge) pozlarında bacak açıklığı (`foot_span`) üzerinden dinamik `extra_scale` hesaplamak boy titremesine yol açar. Tüm pozlarda `fixed_scale = 0.8000` (veya kardiyoda `0.7617`) sabit tutulur; yalnız `foot_xc -> 512.0` ve `y_max -> floor_y` hizalanır.

### Adım 3: Hazır Derleyici Araç ile Tek Komutta Montaj (Sıfırdan Kod Yazma!)
- Yeni konuşmalarda derleme kodu baştan yazılmaz; doğrudan hazır CLI derleyicisi çalıştırılır:
  ```bash
  python3 /Users/mrkantarci/Desktop/AI\ PROJELERI/FITNESS/.agents/skills/exercise-visual-pipeline/scripts/compile_studio_exercise.py \
    --id <hareket_id> --spec <spec.json> --artifact-gif <preview.gif> --verify-sheet <verify_sheet.jpg>
  ```
  (Onay sonrası `--write-repo` bayrağı eklenerek `GIF + WebP + MP4 + Kapak` tek komutta yerel klasörlere yazılır.)

### Adım 4: Görsel Doğrulama Şeridi (`verify_final_20_sheet.jpg`) Denetimi
- Üretilen 20 karenin tamamı 5x4 tablo olarak kaydedilir ve kullanıcıya sunulmadan önce `read_file` ile bizzat incelenerek:
  - Çift kol / hayaletlenme veya eklem kesik izi olmadığı,
  - Vücut ve ayak ölçeğinin 20 kare boyunca değişmediği,
  - İniş fazında sahte ters hareket oluşmadığı teyit edilir.

---

## 🔗 UYGULAMA İÇİ TAM ENTEGRASYON KONTROL LİSTESİ ("HER YERDE GÜNCELLE")
Kullanıcı yeni üretilen hareket görselini onaylayıp uygulamaya koymayı istediğinde şu 5 nokta tek adımda yerel olarak güncellenir:
1. `assets/exercises/{id}.gif` + `assets/exercises/{id}.webp` (animasyonlu rehber dosyaları)
2. `assets/opengym/clips/{id}.mp4` (`yuv420p` H.264 döngü videosu) + `assets/opengym/stills/{id}.webp` (`540x540` net kapak karesi)
3. `js/exercises-db.js` (`diagram: "assets/exercises/{id}.gif"`) ve `js/app.js` (`exerciseGuideMap` + `OPENGYM_GLOBAL_CATALOG` üzerinde `?v=2` önbellek kırıcı; `openImageLightbox` içinde `/\.(mp4|webm)(?:[?#].*)?$/i` desteği)
4. `sw.js` önbellek dizisi (`./assets/exercises/{id}.gif`) + yerel `ios-app/sync-web.sh` (`WebBundle` senkronu)
5. `node --check` + `node scripts/tab-watchdog.js --write-report` doğrulaması (açık talimat olmadan `git push` yapılmaz).
