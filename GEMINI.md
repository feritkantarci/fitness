# ÇELİK KODU (FITNESS PWA) - LIVE DEPLOYMENT & RELEASE RULES

Bu kurallar, projedeki her değişiklikten sonra canlıya alma (deployment) sürecinin eksiksiz ve otomatik yürütülmesi için ZORUNLUDUR.

---

## 1. Mimari Gerçek: Canlı Ortam Yapısı
* Bu proje **GitHub Pages** üzerinde çalışmaktadır ve doğrudan `origin/main` dalını takip eder (Özel alan adı: **`fitness.kantarci.io`**).
* Kodların yalnızca yerel diskte (lokalde) düzenlenmesi **KULLANICI TARAFINDAN CANLIDA GÖRÜLEMEZ.**
* Canlıya alınmamış her değişiklik tamamlanmamış sayılır.

---

## 2. Zorunlu Sürüm ve Canlı Dağıtım Protokolü (Her Görevde Uygulanacak)

Herhangi bir kod, stil veya arayüz değişikliği yapıldığında istisnasız şu adımlar sırasıyla uygulanmalıdır:

### Adım 1: Sürüm Numarasını (Version Bump) 4 Noktada Eşitle
Aşağıdaki 4 noktadaki sürüm numarası bir üst sürüme (örn. `v75` -> `v76`) BİREBİR AYNI ANDA güncellenmelidir:
1. `index.html` Giriş Ekranı Rozeti: `<div class="badge-brand">... • vXX</div>`
2. `index.html` Üst Bar Rozeti: `<span class="app-version-badge" id="appVersionBadge">vXX</span>`
3. `sw.js` Service Worker Önbellek Adı: `const CACHE_NAME = 'celik-kodu-cache-vXX';`
4. `index.html` Service Worker Kayıt Parametresi: `navigator.serviceWorker.register('./sw.js?v=XX')`
*(Bu adım, mobil cihazlarda ve tarayıcılarda PWA Service Worker'ın eski sayfayı önbellekten vermesini engeller ve güncellemeyi anında tetikler).*

### Adım 2: Sözdizimi (Syntax) ve Bütünlük Kontrolü
* Değiştirilen dosyalarda (özellikle `index.html` içindeki JS bloklarında) sözdizimi hatası olmadığını doğrula (`node -e ...`).

### Adım 3: Git Commit ve Git Push (Canlıya Çıkış)
* Değişiklikleri yerelde bırakma!
* `git add <dosyalar>`
* `git commit -m "feat/fix: <açıklayıcı mesaj> (vXX)"`
* `git push origin main` komutunu ÇALIŞTIR. Push başarılı olmadan görev tamamlandı denilemez.

### Adım 4: Kullanıcıya Canlı Doğrulama Bilgisi Ver
* Canlıya çıkan sürüm numarasını belirt (örn. `v76`).
* PWA önbellek yenilemesi için gerekirse sayfayı yenilemelerini veya "Uygulamayı Güncelle / Önbelleği Temizle" butonunu kullanabileceklerini hatırlat.

---

## 3. Havuz Mimarisi: Değişmez Ana Havuz (Master Pool) ve Kişisel Görünürlük Yasası
* **Ana Havuz Dokunulmazlığı (Master Immutability):**
  Platformdaki ana egzersiz havuzu (`EXERCISES_DB`, `academic-engine`, `STATIC_FALLBACK_CATALOG`), tüm bilimsel parametreleri, form rehberleri ve anatomik etki modelleriyle sistemin **değişmez tek doğruluk kaynağıdır (SSOT)**.
  Kullanıcının kendi salonunda bir makine/ekipman olmaması veya bir hareketi yapmak istememesi durumunda hareket **kaynak koddan ya da ana kütüphaneden ASLA silinmez**.
* **Kullanıcı Önü Filtreleme (Kişisel Havuz Gizleme / Exclusion):**
  Kullanıcı herhangi bir hareketi "Havuzumdan Kaldır / Gizle" dediğinde, bu hareket yalnızca kullanıcının yerel tercihlerinde (`localStorage`) devre dışı bırakılır ve kullanıcının önüne düşen aktif listelerden (Lab listesi, Egzersiz Seçici, Kütüphane, Rutin Oluşturucu vb.) anında filtrelenip gizlenir.
* **Geri Alınabilirlik (Restore) & Şeffaf Yönetim:**
  Kullanıcı istediği zaman "Gizlenen Egzersizler" görünümünden veya hareket detayından gizlediği hareketleri görebilmeli ve tek tıkla ("Havuza Geri Ekle / Aktif Et") aktif havuzuna geri döndürebilmelidir.

---

## 4. Anatomik Analiz & Kullanıcı Diyagramı Mimarisi (Kişiselleştirilmiş Alt Baş Takibi)
* **Başlık Hijyeni (Statik Metin Yasağı):**
  Kas kartlarının ana başlıklarının yanında statik, genelgeçer açıklama metinleri (`Ön, Yan, Arka Deltoid` vb.) ASLA yazılmaz. Başlıklar sadece `⚔️ Omuz`, `🏹 Sırt & Kanat`, `🛡️ Göğüs` gibi sade ve vurucu tutulur.
* **2 Katmanlı Anatomik Alt Bölge Grid Tablosu:**
  Kullanıcının belirlediği el şeması uyarınca, her kas grubu için kümülatif set çubuğunun altında 2 katmanlı dinamik bir tablo yer alır:
  1. Üst Hücre: `📐 [KAS GRUBU] — ANATOMİK ALT BÖLGE DAĞILIMI`
  2. Alt Grid (3 Sütun): Kas grubunun anatomik alt başları (Örn: Omuz -> Ön Deltoit | Yan Deltoit | Arka Deltoit; Sırt -> Latissimus | Rhomboid | Trapez).
* **Alt Baş Durum & Aksiyon Mantığı:**
  - **Çalışan Baş:** `✅ X Set` rozetiyle ve o başı vuran hareketlerin isimleriyle yeşil/aktif gösterilir.
  - **Plandaki Baş:** Haftanın kalan günlerinde varsa `🟡 Planda (X Hrk)` sarı rozetle belirtilir.
  - **Boşta / Atlanan Baş:** Hiç set almamış baş anında `⚠️ 0 Set (Boşta!)` kırmızı uyarısıyla tespit edilir ve doğrudan o başı hedefleyen tek tıkla güne ekleme butonu (`➕ [Egzersiz] Ekle`) içerir.

---

## 5. Mobil Arayüz Hijyeni & Ekran Şişmesini Önleme (Kompakt Akordiyon Standardı)
* **Ekranı Dikeyde Boğmama Kuralı:**
  Mobil cihazlarda ve PWA arayüzünde çok sayıda buton ve detay içeren ikincil bloklar (özellikle "Koç Tavsiyesi / Önerilen Egzersizler" ve "Hangi Seans & Hareketten Geldi?" lineage detayları) **varsayılan olarak AÇIK BIRAKILMAZ**.
* **Varsayılan Kapalı (Collapsible) Tasarım:**
  Bu bloklar varsayılan olarak kapalı tutulur. Kullanıcı kart üzerinde yalnızca temiz ve kompakt bir toggle butonu görür (`💡 Koç Tavsiyesi (X Öneri) ▼ Göster`). Kullanıcı istediğinde tek dokunuşla açıp kapatabilir. Böylece haftalık analiz ekranı şişmez, son derece akıcı ve okunabilir kalır.


