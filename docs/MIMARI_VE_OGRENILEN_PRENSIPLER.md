# ÇELİK KODU — MİMARİ KARARLAR VE ÖĞRENİLEN PRENSİPLER (ADR)

Bu doküman, kullanıcının doğrudan yönlendirmeleri, geri bildirimleri ve el çizimi diyagramları doğrultusunda sisteme kazandırılan temel felsefeyi ve teknik mimariyi kayıt altına alır.

---

## 1. Problem Tanımı ve Kullanıcı Geri Bildirimi

### A. "Ekran Şişmesi" ve Bilgi Kirliliği
* **Kullanıcı İtirazı:** *"bunu yaparsak çok fazla ekran şişmez mi?"*, *"ana başlığın yanında isimler yazılmış, bu komik ve gereksiz"*, *"şu kısmı gizlenebilir yap"*.
* **Eski Durum:**
  - Kas analiz kartlarında başlığın yanında statik metinler (`⚔️ Omuz Ön, Yan, Arka Deltoid`) yer alıyordu. Bu bilgi statikti, kullanıcının yaptığı antrenmana göre değişmiyordu ve hiçbir fonksiyonel değer üretmiyordu.
  - Kartların altındaki "Koç Tavsiyesi (Eksik Bölge Takviyesi) — Önerilen Egzersizler" blokları her kas grubu için 4'er büyük butonla sürekli açık duruyor, mobil cihazlarda sayfayı aşırı uzatıyor ve ekranı şişiriyordu.

### B. "Hangi Başın Çalıştığını Görememe" Sorunu
* **Kullanıcı İtirazı:** *"yaptığımız hareket ile hangi kası çalıştırdık görmek lazım, yaptığım diagramı incele"*.
* **Eski Durum:**
  - Omuz için kullanıcı 8 set antrenman yapmış görünüyordu. Ancak bu 8 setin tamamı Snatch, Omuz Presi ve Halo gibi hareketlerden (yani ön ve arka omuzdan) geliyordu.
  - **Yan Deltoid 0 set almış ve tamamen atlanmıştı.**
  - Sistem bunu kümülatif gösterdiği için kullanıcı yan omzun eksik kaldığını fark edemiyordu.

---

## 2. Kullanıcı Diyagramı Mimarisi (2 Katmanlı Anatomik Grid Tablosu)

Kullanıcının çizdiği el şemasına dayanarak aşağıdaki mimari standart hale getirildi:

```
+---------------------------------------------------------------------------------+
|               📐 [KAS GRUBU] — ANATOMİK ALT BÖLGE DAĞILIMI                      |
+------------------------------+------------------------------+-------------------+
|          1. ALT BAŞ          |          2. ALT BAŞ          |    3. ALT BAŞ     |
+------------------------------+------------------------------+-------------------+
| ✅ [X] Set                   | ⚠️ 0 Set (Boşta / Atlandı!)  | ✅ [Y] Set        |
| [Çalıştıran Hareketler]      | [➕ Telafi Egzersizi Ekle]   | [Hareketler]      |
+------------------------------+------------------------------+-------------------+
```

### Anatomik Alt Bölge Haritası:
1. **OMUZ:** Ön Deltoit | Yan Deltoit | Arka Deltoit
2. **SIRT:** Latissimus Dorsi (Kanat) | Rhomboid (Orta Sırt) | Trapez (Üst Sırt)
3. **GÖĞÜS:** Üst Göğüs (Clavicular) | Orta Göğüs (Sternal) | Alt Göğüs (Costal)
4. **ÖN BACAK:** Vastus Lateralis (Dış) | Vastus Medialis (Gözyaşı) | Rectus Femoris (Düz)
5. **ARKA BACAK:** Biceps Femoris (Dış) | Semitendinosus (İç) | Posterior Hinge Zinciri
6. **KALÇA:** Gluteus Maximus (Büyük) | Gluteus Medius (Yan/Denge) | Pelvik & Rotatör Stabilite
7. **TRICEPS:** Uzun Baş (Başüstü Gerilim) | Yan/Dış Baş (At Nalı/İtiş) | Medial Baş (Dirsek Kilit)
8. **BICEPS:** Uzun Baş (Dış/Tepe) | Kısa Baş (İç Kütle) | Brachialis & Ön Kol
9. **KARIN / CORE:** Rektus Abdominis (Ön Duvar) | Oblikler (Yan Karın/Rotasyon) | Transversus & Derin Zırh
10. **BALDIR / KALF:** Gastrocnemius (Ayakta) | Soleus (Oturarak) | Tibialis Anterior (Kaval)

---

## 3. Alt Baş Durum & Aksiyon Yasası

Her anatomik hücre için üç durumdan biri geçerlidir:
1. **Çalıştırıldı (`earnedSets > 0`):**
   - Arka plan: Hafif yeşil zemin.
   - Rozet: `✅ X Set`.
   - İçerik: O başa katkı veren seans hareketlerinin adları (Örn: *Dumbbell Snatch, Omuz Presi*).
2. **Planda Var (`earnedSets === 0 && planda var`):**
   - Arka plan: Hafif kehribar zemin.
   - Rozet: `🟡 Planda (X Hrk)`.
   - İçerik: Kalan günlerde planlanmış hareket adları.
3. **Boşta / Atlandı (`earnedSets === 0 && planda yok`):**
   - Arka plan: Hafif kırmızı/uyarı zemin.
   - Rozet: `⚠️ 0 Set (Boşta!)`.
   - Doğrudan Aksiyon: `[➕ Lateral Raise Ekle]` gibi tek tıkla güne ekleme butonu.

---

## 4. Arayüz Hijyeni & Kompakt Akordiyon Standardı

1. **Başlık Temizliği:**
   - Kas kartı ana başlığında statik açıklamalar bulunamaz. Yalnızca simge ve isim (örn: `⚔️ Omuz`) yer alır.
2. **Kompakt Öneri ve Detay Akordiyonları:**
   - "Koç Tavsiyesi (Eksik Bölge Takviyesi)" blokları varsayılan olarak `display:none` (kapalı) tutulur.
   - Kartta sadece sade bir buton bulunur: `💡 Koç Tavsiyesi (4 Öneri) ▼ Göster`.
   - Kullanıcı dilediğinde tek dokunuşla açar (`▲ Gizle`) ve kapatır.
   - Aynı standart "🔬 Hangi Seans & Hareketten Geldi?" lineage dökümü için de geçerlidir.
