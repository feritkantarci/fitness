# Çelik Kodu — 4 Katmanlı C4 Mimari ve Olay Akışı Dokümantasyonu (C4_ARCHITECTURE.md)

Bu doküman, **Çelik Kodu (Fitness PWA & Desktop)** sisteminin en kritik işlevsel akışını C4 modelleme standardına göre (Context, Container, Component, Code/Flow) modeller.

---

## 1. En Kritik Sayfa ve Temel Etkileşim Butonu Tespiti

- **En Kritik Sayfa / Görünüm:** `#activeWorkoutTab` (Aktif Canlı Antrenman Seansı & Odak İstasyonu) + `#completeModal` (Seans Tamamlama & Biyomekanik Rapor Modalı)
- **Temel Etkileşim Butonu:** `#btnSaveCompletedWorkout` (**"Antrenmanı Bitir & Günlüğe Kaydet"** — `saveCompletedWorkout()`)

### Neden En Kritik?
1. **Nihai Veri Üretim Merkezi:** Sporcunun tüm ağırlık, tekrar, süre ve tükeniş verileri bu akışta toplanır.
2. **Biyomekanik Motor Entegrasyonu:** Kaldırılan toplam tonaj (kg), izometrik tutuş süresi, egzersiz bazlı PR (Kişisel Rekor) tespiti ve çalışan kas gruplarının (primer/sekonder) anatomik dağılımı burada hesaplanır.
3. **Cihaz Donanım Yönetimi:** Tarayıcının Screen WakeLock (ekran uyanık kalma) kilidi serbest bırakılır, dinlenme sayaçları durdurulur ve Web Audio API ile başarı melodisi çalınır.
4. **Hibrit Veri Mimarisi (Local-First & Cloud):** Sıfır gecikmeyle önce `localStorage` üzerine atomik olarak yazılır, ardından arka planda Firebase Firestore bulut veritabanına (`workout_logs/{uid}`, `user_state/{uid}`, `scale_logs/{uid}`, `measurement_logs/{uid}`, `system_telemetry/{uid}`) asenkron ve tam belge yazımıyla (`set()`) senkronize edilir.

---

## 2. Level 1: Sistem Bağlamı (System Context Diagram)

Sporcunun (atlet/kullanıcı) Çelik Kodu sistemiyle ve sistemin dış dünya servisleriyle (Firebase Firestore, Google Gemini AI, Google Takvim, Tarayıcı Donanım API'leri) olan üst düzey ilişkisini gösterir.

```mermaid
flowchart TD
    User(["Sporcu / Atlet<br/>[Kullanıcı]"])

    subgraph SystemBoundary["Çelik Kodu Ekosistemi [Yazılım Sistemi]"]
        CelikKoduApp["Çelik Kodu PWA & Masaüstü Koç İstasyonu<br/>[PWA / Single Page Application & Electron]"]
    end

    subgraph ExternalSystems["Harici Sistemler & Bulut Servisleri"]
        FirestoreCloud[("Firebase Cloud Firestore<br/>[BaaS / Bulut NoSQL Veritabanı]<br/>workout_logs, user_state, scale_logs, measurement_logs, system_telemetry, app_system")]
        GeminiAPI["Google Gemini 2.5 API<br/>[Yapay Zeka Servisi]<br/>Generative Language REST API"]
        GCalendar["Google Takvim / iCal<br/>[Harici Takvim Servisi]<br/>.ics dışa aktarım & Web takvim entegrasyonu"]
        BrowserAPIs["Tarayıcı & Cihaz Donanım API'leri<br/>[Web APIs]<br/>Web Audio, Screen WakeLock, Service Worker Cache"]
    end

    User -->|"Antrenman yapar, setleri girer, seansı tamamlar"| CelikKoduApp
    CelikKoduApp -->|"Antrenman loglarını asenkron senkronize eder"| FirestoreCloud
    CelikKoduApp -->|"Derin koç tavsiyesi ve reçete ister"| GeminiAPI
    CelikKoduApp -->|"Haftalık antrenmanları takvime işler"| GCalendar
    CelikKoduApp -->|"Ekranı açık tutar, sesli geri sayım ve uyarı çalar"| BrowserAPIs
```

---

## 3. Level 2: Konteyner Mimarisi (Container Diagram)

Çelik Kodu sisteminin içindeki yüksek seviyeli yazılım konteynerlerini, sorumluluklarını ve veri akış protokollerini gösterir.

```mermaid
flowchart TD
    User(["Sporcu / Atlet"])

    subgraph ClientLayer["İstemci Katmanı (Client-Side)"]
        SPA["Tek Sayfalı Web Uygulaması (SPA)<br/>[HTML5, Modern CSS, Vanilla ES6+ JS]<br/>Arayüz, biyomekanik hesaplayıcı, canlı seans motoru"]
        ServiceWorker["Service Worker (sw.js v243)<br/>[PWA Cache Engine]<br/>Çevrimdışı varlık önbellekleme ve arka plan dayanıklılığı"]
        LocalData[("İstemci Yerel Depolaması<br/>[LocalStorage & Web Crypto]<br/>celik_kodu_history_{uid}, tuzlu şifre hashleri")]
        ElectronHost["Masaüstü Koç İstasyonu<br/>[Electron Main & Preload IPC]<br/>Donanım hızlandırma, çift ekran koçluk görünümü"]
    end

    subgraph BackendLayer["Sunucu & Bulut Katmanı (Cloud / Server)"]
        WebServer["Statik Node.js Express Sunucusu<br/>[server.js / Node.js 18+]<br/>Statik PWA dosyaları sunumu & /api/health kontrolü"]
        FirestoreDB[("Firebase Firestore Cloud DB<br/>[GCP Cloud Datastore]<br/>Koleksiyonlar: workout_logs, user_state, scale_logs, measurement_logs, system_telemetry, app_system")]
        GeminiService["Google Gemini Generative AI<br/>[REST / HTTPS]<br/>Biyomekanik antrenman analiz motoru"]
    end

    User -->|"HTTPS / Dokunma & Tıklama"| SPA
    SPA <-->|"Offline Cache / Intercept"| ServiceWorker
    SPA <-->|"Senkron Okuma/Yazma (0ms Gecikme)"| LocalData
    ElectronHost -->|"ContextBridge (coachAPI)"| SPA

    WebServer -->|"Statik Dosya İletimi (HTML/JS/CSS)"| SPA
    SPA -->|"HTTPS / REST & Firestore SDK (Tam Belge set())"| FirestoreDB
    SPA -->|"HTTPS POST / JSON (Gemini API Key)"| GeminiService
```

---

## 4. Level 3: Bileşen Mimarisi (Component Diagram — Aktif Seans & Kayıt)

`#activeWorkoutTab` ve `#completeModal` konteyneri içindeki temel mantıksal bileşenleri, veri yapılarını ve kontrolörleri modeller.

```mermaid
flowchart TD
    subgraph ViewComponents["Kullanıcı Arayüzü Bileşenleri (DOM View)"]
        ActiveTabUI["#activeWorkoutTab<br/>[Aktif Seans Görünümü]<br/>Odak Kartı / Liste Görünümü"]
        FinishBtn["#btnFinishWorkout<br/>[Antrenmanı Bitir Butonu]"]
        CompleteModalUI["#completeModal<br/>[Tamamlama Modalı]<br/>RPE, süre, konum, antrenör notu"]
        SaveBtn["#btnSaveCompletedWorkout<br/>[Kaydet & Günlüğe Yaz Butonu]"]
    end

    subgraph LogicComponents["İş Mantığı & Kontrolörler (Application Logic)"]
        WorkoutController["ActiveWorkoutManager (app.js)<br/>finishActiveWorkout(), saveCompletedWorkout()"]
        BiomechanicalEngine["Biomechanical Metric Engine<br/>calculateExerciseSetVolume(), PR Evaluator"]
        StateStore["Application State Store<br/>activeWorkoutSession, activeWorkoutSetsData"]
    end

    subgraph HardwareComponents["Donanım & Sistem Köprüsü (Hardware Services)"]
        AudioService["WebAudioService<br/>playAlertSound(), playWorkoutCompleteFanfare()"]
        WakeLockService["WakeLockManager<br/>releaseWakeLock(), requestWakeLock()"]
        TimerService["Interval Timer Service<br/>clearInterval(workoutTimerInterval)"]
    end

    subgraph PersistenceComponents["Veri ve Senkronizasyon Katmanı (Data Access)"]
        LocalStorageStore["LocalStorage Adapter<br/>setWorkoutLogs(), clearActiveState()"]
        CloudSyncManager["Firestore Sync Gateway<br/>syncWorkoutLogsToCloud(), updateCloudSyncBadge()"]
        HistoryPresenter["HistoryView Presenter<br/>renderHistory(), switchTab('historyTab')"]
    end

    FinishBtn -->|"onclick"| WorkoutController
    WorkoutController -->|"1. İstatistikleri hesapla & modalı doldur"| CompleteModalUI
    SaveBtn -->|"onclick"| WorkoutController

    WorkoutController -->|"2. Set tonajı ve hacim hesaplat"| BiomechanicalEngine
    WorkoutController <-->|"Aktif seans verisini oku/sıfırla"| StateStore
    WorkoutController -->|"3. Başarı melodisi çal"| AudioService
    WorkoutController -->|"4. Ekran uyanıklığını kapat"| WakeLockService
    WorkoutController -->|"5. Sayacı durdur"| TimerService

    WorkoutController -->|"6. Yerel depolamaya anında yaz"| LocalStorageStore
    LocalStorageStore -->|"7. Buluta asenkron aktar"| CloudSyncManager
    WorkoutController -->|"8. Geçmiş sekmesini yenile ve aç"| HistoryPresenter
```

---

## 5. Level 4: Kod & Olay Akışı (Code / Flow — Mermaid Sequence Diagram)

Sporcunun canlı antrenman ekranında "Antrenmanı Bitir" ve ardından "Kaydet" butonuna basmasıyla başlayan `Event -> Handler -> Metric Calculation -> Persistence -> Cloud Sync -> State Reset -> UI Re-render` akışının adım adım kod seviyesi sekansıdır.

```mermaid
sequenceDiagram
    autonumber
    actor Sporcu as Sporcu (Kullanıcı)
    participant DOM as #activeWorkoutTab & #completeModal
    participant Handler as saveCompletedWorkout() (app.js)
    participant Engine as calculateExerciseSetVolume()
    participant Audio as Web Audio & WakeLock
    participant LocalStore as LocalStorage (Cihaz İçi)
    participant CloudAPI as Firebase Firestore (Cloud)
    participant UI as History Presenter & Tabs

    Sporcu->>DOM: "Antrenmanı Bitir" düğmesine tıklar
    DOM->>Handler: finishActiveWorkout() tetiklenir
    Handler->>Handler: Geçen süreyi (elapsedSecs) ve seans özetini çıkar
    Handler->>DOM: #completeModal görünür yapılır (RPE & not alanları)
    
    Sporcu->>DOM: RPE zorluk derecesini seçer ve "Kaydet"e tıklar
    DOM->>Handler: saveCompletedWorkout() çağrılır

    Note over Handler,Engine: 1. Biyomekanik Hesaplama ve PR Analizi
    loop Her Tamamlanan Egzersiz ve Set İçin
        Handler->>Engine: calculateExerciseSetVolume(ex, weight, reps)
        Engine-->>Handler: setVolume (kg) geri döner
        Handler->>Handler: totalVolumeKg, totalSets, maxWeight, maxReps topla
        Handler->>Handler: Çalışan kas gruplarını (primer/sekonder) etiketle
    end

    Handler->>Handler: newLog = { id, date, duration, totalVolumeKg, exercises, rpe, ... } oluştur

    Note over Handler,Audio: 2. Donanım Durumu Temizliği
    Handler->>Audio: clearInterval(workoutTimerInterval), releaseWakeLock()
    Handler->>Audio: playAlertSound() (Zafer melodisi çal)

    Note over Handler,LocalStore: 3. Yerel-Öncelikli Atomik Kalıcılık (Zero Latency)
    Handler->>LocalStore: localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify(logs))
    Handler->>LocalStore: localStorage.removeItem('celik_kodu_active_state_' + uid)

    Note over Handler,CloudAPI: 4. Arka Plan Asenkron Bulut Senkronizasyonu
    Handler->>CloudAPI: syncWorkoutLogsToCloud(logs, uid)
    Handler->>DOM: updateCloudSyncBadge('syncing', 'Kaydediliyor...')
    
    alt Bulut Bağlantısı Açık (Online)
        CloudAPI->>CloudAPI: fbDb.collection('workout_logs').doc(uid).set({ logs, clientUpdatedAt, syncSeal, updatedAt: serverTimestamp() })
        CloudAPI-->>Handler: 200 OK (Firestore Document Written)
        Handler->>DOM: updateCloudSyncBadge('synced', 'Bulut Aktif')
    else Cihaz Çevrimdışı (Offline)
        CloudAPI--xHandler: Ağ Hatası / Timeout
        Handler->>DOM: updateCloudSyncBadge('offline', 'Kayıt Yerelde')
    end

    Note over Handler,UI: 5. State Temizliği ve Arayüz Geçişi
    Handler->>Handler: activeWorkoutSession = null, activeWorkoutSetsData = {}
    Handler->>DOM: closeCompleteModal()
    Handler->>UI: renderActiveWorkout(), renderHistory()
    Handler->>UI: switchTab('historyTab')
    UI-->>Sporcu: Tebrik bildirimini göster ve güncellenen geçmiş kartını ekrana getir
```

---

## 6. Güvenlik, Dayanıklılık ve Mimari Prensipler

1. **Local-First & Offline Resilience (Sıfır Veri Kaybı):**
   - Ağ bağlantısı tamamen kopsa bile, antrenman kaydı anında `localStorage`'a yazılır ve aktif seans başarıyla tamamlanır. İnternet geri geldiğinde Firestore otomatik senkronize edilir.
2. **Kimlik & Veri İzolasyonu:**
   - Her kullanıcının antrenman geçmişi `celik_kodu_history_${uid}` ve Firestore `workout_logs/${uid}` anahtarlarıyla birbirine karışmayacak şekilde izole edilir.
3. **Donanım Tasarrufu (Battery & CPU):**
   - Seans bittiğinde hem `workoutTimerInterval` hem de `timerInterval` temizlenir; `releaseWakeLock()` ile telefon ekranının arka planda pili tüketmesi önlenir.
4. **Formula Injection Koruması:**
   - Kaydedilen loglar CSV olarak dışa aktarılırken, formül tetikleyebilecek metinlerin başına tek tırnak (`'`) eklenerek kullanıcı veri güvenliği sağlanır.

---

## 7. Güncel Sistem Mimarisi, 4 Kapılı Kara Kutu (`K1–K4`) ve Yönetici Sistem İzleme

7 Kısım Şefi, Köprü Gümrüğü, Vercel bulut köprü sunucusu, Garmin/Tredict saat hattı, Google Gemini ve Google Firebase bulut veritabanı arasındaki güncel veri ve hata yakalama akışı:

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontSize": "20px", "fontFamily": "system-ui, -apple-system, sans-serif", "textColor": "#FFFFFF", "primaryTextColor": "#FFFFFF", "secondaryTextColor": "#FFFFFF", "tertiaryTextColor": "#FFFFFF", "lineColor": "#94A3B8", "edgeLabelBackground": "#0F172A"}, "flowchart": {"nodeSpacing": 28, "rankSpacing": 46, "padding": 18}}}%%
flowchart TD
    subgraph Telefon["1. SPORCU TELEFONU"]
        Sefler["7 Kısım Şefi"]:::mavi
        Gumruk["İç Gümrük ve Alt Şefler"]:::mavi
        Onbellek["Telefon Önbelleği"]:::mavi
    end

    subgraph Servisler["2. BULUT VE DIŞ SERVİSLER"]
        FirebaseVeri["Google Firebase Hafızası"]:::turuncu
        SaatHatti["Vercel ve Garmin Saat"]:::turuncu
        YapayZeka["Google Gemini"]:::turuncu
    end

    subgraph Ariza["3. KARA KUTU VE ARIZA DEFTERİ"]
        KaraKutu["4 Kapılı Kara Kutu"]:::kirmizi
        ArizaDefteri["Firebase Arıza Defteri (system_telemetry)"]:::kirmizi
    end

    subgraph Yonetim["4. YÖNETİCİ TELEFONU"]
        AdminPanel["Yönetici: Sistem İzleme"]:::yesil
        EmirKopyala["Düzeltme Emri Kopyala"]:::yesil
    end

    Sefler -->|"İşlem"| Gumruk
    Gumruk -->|"Temiz Kayıt"| Onbellek
    Onbellek <-->|"Eşitleme"| FirebaseVeri
    Gumruk <-->|"Saat Hattı"| SaatHatti
    Gumruk <-->|"Koç Analizi"| YapayZeka

    Gumruk -.->|"K1 Gümrük"| KaraKutu
    SaatHatti -.->|"K2 Saat"| KaraKutu
    YapayZeka -.->|"K3 Gemini"| KaraKutu
    FirebaseVeri -.->|"K4 Bulut"| KaraKutu

    KaraKutu ==>|"Şifresiz Kayıt"| ArizaDefteri
    ArizaDefteri ==>|"Sadece Yönetici"| AdminPanel
    AdminPanel ==>|"Tek Dokunuş"| EmirKopyala

    classDef mavi fill:#1E3A8A,stroke:#60A5FA,stroke-width:3px,color:#FFFFFF,font-weight:bold;
    classDef turuncu fill:#9A3412,stroke:#FB923C,stroke-width:3px,color:#FFFFFF,font-weight:bold;
    classDef kirmizi fill:#991B1B,stroke:#FCA5A5,stroke-width:3.5px,color:#FFFFFF,font-weight:bold;
    classDef yesil fill:#065F46,stroke:#4ADE80,stroke-width:3px,color:#FFFFFF,font-weight:bold;

    style Telefon fill:#0B192C,stroke:#38BDF8,stroke-width:4px,color:#FFFFFF
    style Servisler fill:#271509,stroke:#FB923C,stroke-width:4px,color:#FFFFFF
    style Ariza fill:#2A0A0E,stroke:#F87171,stroke-width:4px,color:#FFFFFF
    style Yonetim fill:#052E16,stroke:#4ADE80,stroke-width:4px,color:#FFFFFF

    linkStyle 0,1,2,3,4 stroke:#60A5FA,stroke-width:2.5px
    linkStyle 5,6,7,8 stroke:#F87171,stroke-width:3px
    linkStyle 9,10,11 stroke:#4ADE80,stroke-width:3.5px
```

- **Kara Kutu Kapıları:** `K1` (Şefler & Köprü Gümrüğü & Çalışma Zamanı), `K2` (Vercel & Garmin/Tredict Saat Hattı), `K3` (Google Gemini Yapay Zeka), `K4` (Google Firebase Bulut Eşitleme).
- **Bulut Bağlantı Alt Şefi:** Mevcut 7 Bağlantı Alt Şefi (`js/chiefs/liaison-subchiefs.js`) içinde bulut kota/zaman aşımı/tasarruf sayacını, 1 MB belge doluluk oranını ve v2 zarf geçiş durumunu canlı takip eder; **Sistem İzleme** sekmesinde özet karne ve tek dokunuşla **Bulut Raporu Kopyala** çıktısı üretir.
- **Gizlilik ve Tampon Sınırı:** Tüm parola, `syncSeal`, Gemini API anahtarı ve saat tokenları maskelenir; sporcu başına son 50 olay saklanır; `system_telemetry/{uid}` yalnızca sahibi veya Yönetici tarafından okunabilir.
- **Yönetici Portalı:** `#adminModal` içindeki **Sistem İzleme** sekmesinden kapı/arıza filtresiyle canlı incelenir, tek dokunuşla AI düzeltme emri veya Bulut Raporu kopyalanır.

---

## 8. Bulut Veri Mimarisi v2 — Belge Başına Bölme (Aşama 1–6 Yerelde Doğrulandı: T62–T67)

Tek Firestore belgesindeki **1 MB kalıcı boyut sınırını** aşmamak ve her güncellemede tüm geçmişin/takvimin baştan yazılmasını önlemek için uygulanmış v2 hedef mimarisidir. Cihaz içi `localStorage` anahtarları aynı kalır; yalnızca bulut senkronizasyon katmanı (`profile-chief.js`), takvim saklama biçimi ve güvenlik kuralları güncellenmiştir.

### 8.1 Bugünkü Yapı vs. Hedef Yapı

```mermaid
flowchart LR
    subgraph Bugun["Bugünkü Yapı (Tek Belge Riski)"]
        B1["workout_logs/uid\nTüm geçmiş tek dizide (logs)\nÖrn. 207 KB / 1 MB"]
        B2["user_state/uid\nTakvim + Program + Ağırlık + Ayarlar\nÖrn. 421 KB / 1 MB"]
        B3["scale_logs/uid\nmeasurement_logs/uid\nsystem_telemetry/uid"]
    end

    subgraph Hedef["Hedef Yapı v2 (Belge Başına Bölme)"]
        H1["workout_logs/uid/items/logId\nHer antrenman ayrı belge (~10 KB)\nupdatedAt + deleted mezar taşı"]
        H2["user_state/uid/days/YYYY-MM-DD\nHer gün ayrı belge (tek kopya)\n7 günden eski günler özet"]
        H3["user_state/uid\nYalnız hafif durum (takvimsiz)\nhaftalık plan, program, ağırlık, ayarlar"]
        H4["scale_logs/uid\nmeasurement_logs/uid\nsystem_telemetry/uid (max 50 olay)"]
    end

    B1 -->|"Aşama 2 & 5 Bölme"| H1
    B2 -->|"Aşama 2, 3 & 5 Bölme"| H2
    B2 -->|"Takvim ayrılınca hafifler"| H3
    B3 -->|"Değişmez"| H4
```

### 8.2 Artımlı Okuma ve Tekil Belge Yazımı Akışı

```mermaid
sequenceDiagram
    autonumber
    participant Local as Yerel Depolama (localStorage)
    participant Sync as Profil Eşitleme Katmanı (profile-chief.js)
    participant Cloud as Firebase Firestore v2

    Note over Local,Cloud: Açılış / Ön Plana Dönüş (Artımlı Çekme)
    Sync->>Local: Son çekme zamanını oku (celik_kodu_cloud_pull_at_workout_uid)
    Sync->>Cloud: items where updatedAt > lastPulledAt sorgula
    Cloud-->>Sync: Yalnız yeni, değişen veya deleted=true belgeler
    Sync->>Local: Yerel listeyle birleştir ve lastPulledAt güncelle

    Note over Local,Cloud: Antrenman Bitişi veya Düzenleme (Tekil Yazım)
    Local->>Sync: Değişen tek seans (logId)
    Sync->>Cloud: workout_logs/uid/items/logId.set(log + updatedAt + deleted)
    Cloud-->>Sync: Onay (tek ~10 KB belge yazıldı)
```

### 8.3 Canlı Veritabanı Ölçümü (22 Kasım 2026, 14:11)

| Belge | Mevcut Boyut | İçerik Ayrıntısı |
|---|---|---|
| `workout_logs/usr_admin` | **207 KB** | 21 antrenman, ortalama 9,9 KB (~100 antrenmanda 1 MB dolar) |
| `workout_logs/usr_ferit` | **50 KB** | 11 antrenman, ortalama 4,6 KB |
| `workout_logs/usr_ismail` | **8 KB** | 2 antrenman, ortalama 4,0 KB |
| `user_state/usr_admin` | **421 KB** | `dateSchedule` 263 KB, `weeklySchedule` 83 KB, `customPrograms` 37 KB, `garminManifests` 23 KB |

### 8.4 Okuyucu Modüller ve Takvim Sadeleştirme Özeti
- **Etkilenmeyen bölümler:** Analiz (`analytics-chief.js`), Geçmiş (`history-chief.js`), Antrenman (`workout-chief.js`), Kütüphane (`library-chief.js`), Ortak Çekirdek (`shared-core.js`) ve Yönetici Portalı (`admin-portal.js`) veriyi yerelden okumayı sürdürür.
- **Tek kopya takvim:** Gün içi çifte kayıt (`exercises` tekrarı) kaldırılır, yalnızca `customWorkout` tutulur (okuyucular zaten buna düşer).
- **7 günlük tam pencere:** Üretici'nin dünkü kas koruması ve Saat Köprüsü'nün 7 günlük aktivite eşleşmesi için son 7 gün + gelecek günler tam ayrıntıda kalır; 7 günden eski günler `{type, title, rest, desc, extraCardioSessions, primarySubKeys, updatedAt}` özetine indirilir.

### 8.5 Geçiş, Güvenlik Kuralı ve Geri Dönüş İlkeleri
- **Yerel Uygulama Durumu (`T62`–`T67`):** Aşama 1–6 ve Bulut Alt Şefi yerel diskte tamamlanmış, gerçek veri karşılaştırması dahil bekçi sınavlarıyla doğrulanmıştır (`T62` kota/zaman aşımı ayrımı, `T63` belge başına artımlı eşitleme, `T64` tek kopya ve 7 günlük takvim özetleme, `T65` iki eşit güvenlik kuralı dosyası, `T66` yönetici öncelikli kademeli taşıma ve tek adımda geri dönüş, `T67` Bulut Alt Şefi canlı karnesi ve v2 taşıma öncesi/sonrası kas/puan birebir sağlaması); canlı dağıtım kullanıcı onayı sonrasına ayrılmıştır.
- **Güvenlik kuralları (Aşama 4):** `workout_logs/{uid}/items/{logId}` ve `user_state/{uid}/days/{dateStr}` için yalnız sahibi/yönetici okuyup yazabilir kuralı `firestore.rules` ve `config/firestore.rules` dosyalarına birebir aynı şekilde işlenmiştir.
- **Taşıma ve yedek (Aşama 5):** `migrateLegacyAthleteDocsToSubcollections` eski büyük belgeleri silmeden alt belgelere böler; eski belgeler en az **30 gün** boyunca silinmeden yedek ve `rollbackUserSubcollectionMigration` ile tek adımda geri dönüş yolu olarak korunur.
- **Kademeli canlı çıkış:** Önce yalnızca yönetici hesabında (`usr_admin`) devreye alınıp 2–3 gün izlenir; sorunsuz doğrulamanın ardından `setV2SubcollectionRolloutAll(true)` ile diğer 2 sporcu hesabı geçirilir.
