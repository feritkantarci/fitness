# Çelik Kodu (Fitness PWA & Desktop) — Uygulama İşlevsellik & Mimari Haritası (APP_FLOW.md)

Bu doküman, **Çelik Kodu** projesindeki tüm arayüz bileşenlerini, kullanıcı etkileşim tetikleyicilerini (UI triggers), arka planda çalışan JavaScript fonksiyonlarını, harici API entegrasyonlarını, yerel/bulut veritabanı işlemlerini ve sistem akış şemalarını eksiksiz olarak haritalandırır.

---

## 1. Sayfa ve Görünüm Taraması (Pages, Views & Modules)

Uygulama, hem mobil PWA (Progressive Web App) hem de masaüstü (Electron Coach Station) ortamlarında çalışan, yerel öncelikli (local-first) hibrit bir mimariye sahiptir.

| Görünüm / Rota | DOM ID / Konum | Tip / Kapsam | Temel Sorumluluk |
|---|---|---|---|
| **Giriş & Kimlik Doğrulama** | `#loginScreen` | Ekran / View | Salted SHA-256 kimlik doğrulama, kullanıcı seçimi, yönetici girişi, oturum başlatma |
| **Ana Uygulama Kapsayıcısı** | `#mainAppWrapper` | SPA Ana Kabuk | Üst bar (header), bildirimler, sürüm takibi ve aktif sekme yönetimi |
| **1. Program & AI Mimar** | `#generatorTab` | Ana Sekme (Tab 1) | Haftalık/günlük akıllı program üretimi, AI doktrin seçimi, ekipman/kas filtreleri, takvim görünümü |
| **2. Aktif Antrenman (Canlı)** | `#activeWorkoutTab` | Ana Sekme (Tab 2) | Odak (focus) veya liste görünümünde canlı set takibi, dinlenme sayacı, tonaj hesaplama, hareket değişimi |
| **3. Egzersiz Kütüphanesi** | `#libraryTab` | Ana Sekme (Tab 3) | 96+ egzersizin aranması, filtrelenmesi, form rehberi incelemesi ve özel rutin oluşturucu |
| **4. Antrenman Geçmişi** | `#historyTab` | Ana Sekme (Tab 4) | Tamamlanan antrenman kayıtları, salon filtreleme, CSV dışa aktarma, seans tekrarı |
| **5. Analiz, Tartı & Ölçüm** | `#analyticsTab` | Ana Sekme (Tab 5) | Biyomekanik kas radarı, 2 katmanlı anatomik alt baş dağılımı, kilo trendi, vücut çevre ölçüleri |
| **6. Profil & Ayarlar** | `#profileTab` | Ana Sekme (Tab 6) | Sporcu profili, avatar/tema seçimi, Gemini API anahtar yönetimi, JSON tam veri yedekleme & geri yükleme |
| **Mobil Alt Çekmece (More)** | `#moreBottomSheet` | Mobil Menü | Kütüphane, geçmiş, hata havuzu, önbellek yenileme ve oturum kapatma bağlantıları |
| **Masaüstü Koç İstasyonu** | `desktop-app/` | Electron Native | Çift ekran / antrenör arayüzü, canlı seans izleme, yerel IPC köprüsü, bildirimler |
| **Yardımcı & Test Araçları** | `test-*.html`, `salon_kilavuzu.html` | Bağımsız HTML | OpenGym görsel laboratuvarı, canlı antrenman test alanı, salon kılavuzları |

---

## 2. Etkileşim Noktaları & Fonksiyon Eşleşmesi (UI Triggers & Background Operations)

### 2.1. Kimlik Doğrulama & Oturum Yönetimi (`#loginScreen` & Üst Bar)

| UI Bileşeni / Olay | Tetiklenen Fonksiyon | Arka Plan İşlemi / API / Veri |
|---|---|---|
| `#loginForm` `onsubmit` | `handleAuthLogin(event)` | Web Crypto API ile tuzlanmış SHA-256 hash doğrulaması, `celik_kodu_current_user` kaydı, Firebase Firestore senkronizasyonu başlatma |
| Sürüm Rozeti `onclick` | `forceAppUpdate()` | Service Worker `sw.js?v=XX` önbellek temizleme, `caches.delete()`, sert sayfa yenileme (`location.reload(true)`) |
| Üst Bar Profil Alanı `onclick` | `switchTab('profileTab')` veya `openMoreSheet()` | Ekran genişliğine göre masaüstünde profil sekmesini, mobilde alt çekmeceyi açma |
| Üst Bar Menü Düğmesi `onclick` | `toggleHeaderPopupMenu(event)` | Hızlı eylemler açılır menüsünü (Hata Havuzu, Admin Paneli, Cache Yenile, Çıkış) açıp kapatma |
| `Oturumu Kapat` `onclick` | `handleAuthLogout()` | `celik_kodu_current_user` oturumunu silme, UI durumunu sıfırlama, `#loginScreen` görünümüne dönme |

### 2.2. Program Üreteci & Takvim (`#generatorTab`)

| UI Bileşeni / Olay | Tetiklenen Fonksiyon | Arka Plan İşlemi / API / Veri |
|---|---|---|
| `⚡ 20 Dk Çelik Akışı` `onclick` | `loadCelikAkisiWorkout()` | 4 turluk dambıl kompleksini doğrudan aktif antrenman seansına yükler ve `activeWorkoutTab`'e geçer |
| Doktrin Seçici Kartları `onclick` | `selectAiDoctrine(doctrineKey)` | `currentSelectedDoctrine` durumunu günceller (`bb_hybrid`, `bb_pure`, `func_hybrid`, `func_pure`, `balanced_hybrid`) |
| Kapsam Butonları `onclick` | `setAiGeneratorScope('weekly' \| 'single')` | Program kapsamını haftalık şablon veya tek seans olarak ayarlar |
| Ekipman Hapları `onclick` | `toggleEquip(equipType)` | Ekipman filtresini günceller (`dumbbell`, `kettlebell`, `barbell`, `machine`, `bodyweight`) |
| `AI İLE PROGRAMI OLUŞTUR` | `handleQuickAiGenerate()` | Biyomekanik algoritma ile süperset ve split hesaplaması, `celik_kodu_last_generated_workout` LocalStorage kaydı, takvim kartlarının render edilmesi |
| `Derin Koç Raporu Al` `onclick` | `requestGeminiDeepHybridReport()` | Google Gemini REST API (`fetch`) çağrısı, eksik kas analizi ve kişiye özel haftalık koçluk tavsiyesi üretimi |
| Takvim Navigasyon Butonları | `navigateCalendar(-1 \| 1)`, `jumpCalendarToToday()` | Takvim haftasını/ayını kaydırır, seçili haftanın planlanan antrenmanlarını dinamik render eder |
| `Google Takvime Aktar` `onclick` | `executeOneClickGoogleCalendarExport()` | Seansları iCalendar (`.ics`) formatına çevirir veya Google Calendar Web URL parametresiyle takvim sekmesini açar |

### 2.3. Aktif Antrenman Seansı (`#activeWorkoutTab`)

| UI Bileşeni / Olay | Tetiklenen Fonksiyon | Arka Plan İşlemi / API / Veri |
|---|---|---|
| Görünüm Modu Değiştirici | `setActiveWorkoutViewMode('focus' \| 'list')` | Aktif seansı tek hareket odaklı (focus carousel) veya tam liste görünümüne dönüştürür |
| Seansı Duraklat/Sürdür | `toggleWorkoutPause()` | Süre sayacını duraklatır/başlatır, toplam duraklama ofsetini (`activeWorkoutTotalPausedMs`) günceller |
| Dinlenme Sayacı / Atla | `toggleTimer()`, `skipRestTimer()` | Web Audio API ile geri sayım bip sesleri ve süre bitiminde sesli uyarı; seans durumunu LocalStorage'a kaydeder |
| Ekranı Açık Tut (WakeLock) | `toggleWakeLockManual()` | Tarayıcı Screen WakeLock API (`navigator.wakeLock.request`) çağrısı ile ekranın kararmasını önler |
| Set Tamamlandı Onay Kutusu | `toggleSetCompleted(exIdx, setIdx)` | Seti tamamlandı olarak işaretler, tonajı kümülatif ekler, dinlenme sayacını otomatik tetikler, ses çalar |
| Ağırlık / Tekrar Seçici | `openSetWeightPicker()`, `openSetRepsPicker()` | Hızlı sayı seçim listbox'ını (`#quickListboxModal`) açar, seçilen değeri anında set verisine işler |
| Hareketi Değiştir (Swap) | `openExercisePickerModal('swap')` | Aynı kas grubunu veya ekipmanı hedefleyen alternatif hareket havuzunu açar ve seçileni seansa yerleştirir |
| `Antrenmanı Bitir` `onclick` | `finishActiveWorkout()` | Süreyi durdurur, seans istatistiklerini (toplam tonaj, set sayısı, PR'lar) hesaplar ve `#completeModal` açar |
| `#completeModal` -> `Kaydet` | `saveCompletedWorkout()` | `celik_kodu_history_${uid}` LocalStorage'a yazar, `workout_logs/{uid}` Firestore koleksiyonuna asenkron yazar, aktif seansı siler |

### 2.4. Egzersiz Kütüphanesi & Rutinler (`#libraryTab`)

| UI Bileşeni / Olay | Tetiklenen Fonksiyon | Arka Plan İşlemi / API / Veri |
|---|---|---|
| Arama Kutusu `oninput` | `filterExerciseLibrary()` | 96+ egzersizi başlık, kas grubu, ekipman ve biyomekanik etiketlere göre anlık filtreler |
| Egzersiz Kartı `onclick` | `openExerciseDetailModal(exId)` | Hareketin adım adım form rehberini, anatomik hedef başlarını ve form/anatomi infografiklerini modalda açar |
| `Havuzumdan Gizle` `onclick` | `toggleExcludeExercise(exId)` | Hareketi ana veritabanından silmeden kullanıcının `celik_excluded_exercises` yerel tercihine ekler ve gizler |
| `Özel Rutin Oluşturucuya Ekle` | `addExerciseToCustomRoutine(exId)` | Seçilen egzersizi geçici özel antrenman listesine ekler |
| `Rutini Başlat` `onclick` | `startActiveWorkoutFromCustom()` | Oluşturulan özel rutini aktif seans oturumuna (`activeWorkoutSession`) dönüştürüp seansı başlatır |

### 2.5. Biyomekanik Analiz, Tartı & Ölçümler (`#analyticsTab`)

| UI Bileşeni / Olay | Tetiklenen Fonksiyon | Arka Plan İşlemi / API / Veri |
|---|---|---|
| Alt Görünüm Sekmeleri | `switchAnalyticsSubView('muscle' \| 'scale' \| 'combined')` | Kas dengesi radarını, kilo takip grafiğini veya birleşik analitiği görüntüler |
| Anatomik Alt Baş Kartı `onclick` | `selectAnatomyMuscle(muscleKey)` | 2 katmanlı anatomik tabloda seçilen kas grubunun (ör. Ön/Yan/Arka Omuz) haftalık set dağılımını açar |
| Boşta Kalan Baş -> `Ekle` | `quickAddExerciseForNeglectedHead(headKey)` | Haftalık planda 0 set almış eksik başı hedefleyen egzersizi doğrudan antrenmana ekler |
| `Yeni Tartı Ekle` `onclick` | `openScaleModal()` -> `saveScaleEntry()` | Tarih ve kilo verisini alır, `scale_logs/{uid}` LocalStorage ve Firestore koleksiyonuna işler |
| Toplu Tartı Metni Ayrıştırma | `parseScaleFromPastedTextarea()` | Yapıştırılan çok satırlı metinden tarih-kilo ikililerini regex ile ayrıştırıp veritabanına aktarır |
| `CSV Olarak İndir` `onclick` | `exportAnalyticsCSV()` | Verileri CSV formatına dönüştürür; CSV Formula Injection koruması için riskli karakterlerin başına `'` ekler |

### 2.6. Profil, Sistem Ayarları & Yedekleme (`#profileTab` & Modallar)

| UI Bileşeni / Olay | Tetiklenen Fonksiyon | Arka Plan İşlemi / API / Veri |
|---|---|---|
| Tema Seçici Düğmeleri | `selectTheme(themeName)` | Arayüz CSS değişkenlerini anında günceller (`cyan`, `gold`, `green`, `purple`, `red`) |
| Gemini API Anahtarı `Kaydet` | `testAndSaveGeminiKeyFromProfile()` | Girilen API anahtarını Generative Language API ile test eder, geçerliyse yerel izole depolamaya kaydeder |
| `Tüm Verileri Yedekle (JSON)` | `exportData()` | Kullanıcının profil, geçmiş, tartı, ölçüm ve özel rutin verilerini tek bir JSON dosyası olarak indirir |
| `Yedekten Geri Yükle` `onchange` | `importData(file)` | Dosya boyutunu (max 2MB DoS koruması) ve JSON şemasını denetler, verileri yerel depolamaya ve buluta yükler |
| Hata Bildirimi `Gönder` | `submitExerciseBugReport()` | Egzersizle ilgili geri bildirimi Firestore `exercise_bug_reports` koleksiyonuna ve yerel listeye kaydeder |
| Admin Paneli -> `Kullanıcı Ekle` | `handleCreateUser()` | Yeni sporcu/yönetici hesabı açar, tuzlanmış şifre hash'ini oluşturur, Firestore `app_system/users` dokümanına kaydeder |

---

## 3. Mermaid.js Görselleştirmeleri

### 3.1. Genel Mimari Akışı (Sayfalar ve Modüller Arası Geçiş)

```mermaid
flowchart TD
    Start(["Kullanıcı Uygulamayı Açar"]) --> AuthCheck{"Aktif Oturum Var mı?"}
    
    AuthCheck -- Hayır --> LoginView["#loginScreen<br/>(Kimlik Doğrulama Ekranı)"]
    LoginView -->|handleAuthLogin| VerifyAuth["Web Crypto Tuzlu SHA-256 Doğrulama"]
    VerifyAuth -->|Başarılı| AppWrapper["#mainAppWrapper<br/>(SPA Ana Kabuk)"]
    
    AuthCheck -- Evet --> AppWrapper

    AppWrapper --> HeaderBar["Üst Bar & Menü (.modern-app-bar)"]
    AppWrapper --> BottomNav["Mobil Dock / Segmented Bar"]
    
    BottomNav --> Tab1["#generatorTab<br/>(Program & AI Mimar)"]
    BottomNav --> Tab2["#activeWorkoutTab<br/>(Canlı Antrenman Odak/Liste)"]
    BottomNav --> Tab3["#libraryTab<br/>(Egzersiz Kütüphanesi & Rutin)"]
    BottomNav --> Tab4["#historyTab<br/>(Antrenman Geçmişi & CSV)"]
    BottomNav --> Tab5["#analyticsTab<br/>(Biyomekanik Radar & Tartı)"]
    BottomNav --> Tab6["#profileTab<br/>(Sporcu Profili & Yedekleme)"]

    Tab1 -->|handleQuickAiGenerate| CalcEngine["Akademik Biyomekanik Motor"]
    CalcEngine -->|Seansı Başlat| Tab2
    Tab3 -->|startActiveWorkoutFromCustom| Tab2
    Tab2 -->|finishActiveWorkout| CompleteModal["#completeModal<br/>(Tebrik & RPE Puanlama)"]
    CompleteModal -->|saveCompletedWorkout| LocalStore[("LocalStorage<br/>Yerel Depolama")]
    CompleteModal -.->|Asenkron Senkronizasyon| FirestoreCloud[("Firebase Firestore<br/>workout_logs/{uid}")]
    CompleteModal --> Tab4
    CompleteModal --> Tab5

    HeaderBar --> AdminModal["#adminModal<br/>(Sporcu Yönetimi Paneli)"]
    HeaderBar --> BugPoolModal["#bugReportsPoolModal<br/>(Hata Bildirim Havuzu)"]
    HeaderBar --> ForceUpdate["forceAppUpdate()<br/>(Service Worker Cache Reset)"]
```

---

### 3.2. Uçtan Uca İşlevsellik Akış Zinciri (`flowchart LR`)

```mermaid
flowchart LR
    subgraph UI_Katmani["1. UI & Kullanıcı Etkileşimi"]
        UI_Btn1["[Program Sekmesi]<br/>AI İle Oluştur Butonu"]
        UI_Btn2["[Canlı Antrenman]<br/>Set Tamamla Checkbox"]
        UI_Btn3["[Canlı Antrenman]<br/>Antrenmanı Bitir Butonu"]
        UI_Btn4["[Analiz Sekmesi]<br/>Eksik Kas Ekle Butonu"]
        UI_Btn5["[Profil Sekmesi]<br/>JSON Yedek İndir Butonu"]
    end

    subgraph Fonksiyon_Katmani["2. Frontend Fonksiyonu"]
        FN_Gen["handleQuickAiGenerate()"]
        FN_Set["toggleSetCompleted()"]
        FN_Finish["saveCompletedWorkout()"]
        FN_AddEx["quickAddExerciseForNeglectedHead()"]
        FN_Export["exportData()"]
    end

    subgraph Servis_Katmani["3. Motor & Harici API"]
        SRV_Biom["academic-engine.js<br/>(Süperset & Hacim Hesabı)"]
        SRV_Audio["Web Audio API &<br/>Rest Timer Interval"]
        SRV_Metric["Biyomekanik Tonaj &<br/>PR Hesaplayıcı"]
        SRV_Gemini["Gemini REST API<br/>(Generative Language)"]
        SRV_Sanitize["CSV/JSON Sanitizer &<br/>Blob File Downloader"]
    end

    subgraph Veri_Katmani["4. Veri & Kalıcılık Sonucu"]
        DB_GenWk[("LocalStorage:<br/>last_generated_workout")]
        DB_ActState[("LocalStorage:<br/>active_state_{uid}")]
        DB_History[("LocalStorage & Firestore:<br/>workout_logs/{uid}")]
        DB_Sched[("Haftalık Takvim Planı<br/>Güncellemesi")]
        DB_File["Müşteri Cihazına<br/>JSON / CSV İndirme"]
    end

    UI_Btn1 --> FN_Gen --> SRV_Biom --> DB_GenWk
    UI_Btn2 --> FN_Set --> SRV_Audio --> DB_ActState
    UI_Btn3 --> FN_Finish --> SRV_Metric --> DB_History
    UI_Btn4 --> FN_AddEx --> SRV_Gemini --> DB_Sched
    UI_Btn5 --> FN_Export --> SRV_Sanitize --> DB_File
```

---

### 3.3. Kritik İşlem Akışı: Canlı Antrenmanı Tamamlama ve Çift Yönlü Senkronizasyon (`sequenceDiagram`)

```mermaid
sequenceDiagram
    autonumber
    actor Sporcu as Sporcu (Kullanıcı)
    participant UI as Canlı Antrenman UI (#activeWorkoutTab)
    participant Modal as Tamamlama Ekranı (#completeModal)
    participant Core as Uygulama Çekirdeği (app.js)
    participant Audio as Web Audio & WakeLock API
    participant LocalDB as LocalStorage (Cihaz İçi)
    participant Cloud as Firebase Firestore (Bulut)

    Sporcu->>UI: "Antrenmanı Bitir" düğmesine basar
    UI->>Core: finishActiveWorkout() çağrılır
    Core->>Audio: Geri sayım sayacını durdur, WakeLock kilidini serbest bırak
    Core->>Core: Toplam süre, tonaj, tamamlanan setler ve PR rekorlarını hesapla
    Core->>Modal: #completeModal'ı istatistik özetleriyle aç
    Modal-->>Sporcu: Tebrik kartı, toplam hacim ve RPE (Zorluk 1-10) formunu gösterir

    Sporcu->>Modal: RPE derecesi ve seans notunu girip "Kaydet"e basar
    Modal->>Core: saveCompletedWorkout() tetiklenir
    Core->>Audio: playWorkoutCompleteFanfare() ile başarı müziği çal

    Note over Core,LocalDB: Adım 1: Anında Yerel Depolama (Zero Latency)
    Core->>LocalDB: celik_kodu_history_{uid} dizisine yeni antrenman kaydını ekle
    Core->>LocalDB: celik_kodu_active_state_{uid} aktif oturum geçici önbelleğini temizle

    Note over Core,Cloud: Adım 2: Asenkron Güvenli Bulut Senkronizasyonu
    Core->>Cloud: workout_logs/{uid} dokümanına yeni log ve serverTimestamp() gönder
    alt Bulut Bağlantısı Başarılı
        Cloud-->>Core: 200 OK (Kayıt doğrulandı)
        Core->>UI: "Bulutla Senkronize Edildi" durum rozetini yeşile çevir
    else İnternet Yok / Çevrimdışı (Offline)
        Cloud--xCore: Ağ Hatası / Zaman Aşımı
        Core->>LocalDB: Logu yerel outbox kuyruğunda sakla (sonraki açılışta senkronize et)
        Core->>UI: "Yerelde Saklandı (Çevrimdışı)" rozetini göster
    end

    Core->>UI: switchTab('historyTab') ile geçmiş sekmesine geç ve listeyi yenile
    UI-->>Sporcu: Yeni antrenman geçmiş kartını göster
```

---

## 4. Teknik Altyapı ve Güvenlik Standartları Özeti

1. **Local-First & Offline Resilience:** Kullanıcı verileri ilk olarak `localStorage` üzerinde izole edilir; internet bağlantısı kopsa dahi PWA ve Service Worker önbelleği (`sw.js?v=243`) ile kesintisiz çalışır.
2. **Kimlik Doğrulama Güvenliği:** Parolalar asla açık metin saklanmaz; Web Crypto API kullanılarak kullanıcıya özel tuzlanmış SHA-256 hash'leri ile işlenir.
3. **CSV Formula Injection Koruması:** Antrenman ve analiz verileri dışa aktarılırken, formül tetikleyebilecek `=`, `+`, `-`, `@` gibi karakterlerin başına otomatik tek tırnak (`'`) eklenir.
4. **Hafif Sunucu & Statik Dağıtım:** Node.js Express (`server.js`) yalnızca statik varlıkları ve `/api/health` sağlık kontrolünü sunar; istemci tarafında SPA yönlendirmesi desteklenir.
5. **Masaüstü İzolasyonu (Electron):** Masaüstü koç istasyonunda `contextIsolation: true`, `nodeIntegration: false` uygulanmış ve harici pencere yönlendirmeleri kısıtlanmıştır.
