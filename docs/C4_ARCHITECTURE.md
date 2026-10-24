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
4. **Hibrit Veri Mimarisi (Local-First & Cloud):** Sıfır gecikmeyle önce `localStorage` üzerine atomik olarak yazılır, ardından arka planda Firebase Firestore bulut veritabanına (`workout_logs/{uid}`) asenkron senkronize edilir.

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
        FirestoreCloud[("Firebase Cloud Firestore<br/>[BaaS / Bulut NoSQL Veritabanı]<br/>workout_logs, scale_logs, app_system")]
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
        FirestoreDB[("Firebase Firestore Cloud DB<br/>[GCP Cloud Datastore]<br/>Koleksiyonlar: workout_logs, scale_logs, users")]
        GeminiService["Google Gemini Generative AI<br/>[REST / HTTPS]<br/>Biyomekanik antrenman analiz motoru"]
    end

    User -->|"HTTPS / Dokunma & Tıklama"| SPA
    SPA <-->|"Offline Cache / Intercept"| ServiceWorker
    SPA <-->|"Senkron Okuma/Yazma (0ms Gecikme)"| LocalData
    ElectronHost -->|"ContextBridge (coachAPI)"| SPA

    WebServer -->|"Statik Dosya İletimi (HTML/JS/CSS)"| SPA
    SPA -->|"HTTPS / REST & Firestore SDK (Merge Write)"| FirestoreDB
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
        CloudAPI->>CloudAPI: fbDb.collection('workout_logs').doc(uid).set({ logs, updatedAt: serverTimestamp() }, { merge: true })
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
