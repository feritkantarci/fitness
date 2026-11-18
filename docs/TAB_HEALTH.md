# 🛡️ ÇELİK KODU — 7 BAĞIMSIZ ŞEF ODASI, KÖPRÜ GÜMRÜĞÜ & HATA HAFIZASI PANELİ (TAB_HEALTH)

> **Son Otomatik Kontrol:** `2026-11-18 20:24:05` | **Bağımsız Oda Dosyası:** `11/11` | **Toplam Hareket:** `311` | **Kırık Bağlantı:** `0` | **Matematik & Gümrük Sınavı:** `40/40`

---

## 1. 7 Bağımsız Şef Odası: Misyon, Oda Dosyası ve Canlı Sınav Durumu

| Alan & Sorumlu Şef | Fiziksel Odası | Kabiliyeti (Ne Yapar?) | En Çok Nerede Hata Yapar? (Bekçinin Koruduğu Yer) | Ekran Kontrolü | Matematik & Gümrük Sınavı |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **1. Üretici Şefi** (`generator-guard`) | `js/chiefs/generator-chief.js` (175 fn) | Sana uygun antrenmanı kurar, ardışık günde doğrudan çalışmayan alt kasları seçer, gizli hareketi asla çıkarmaz | Ardışık günde dünkü alt kası tekrar seçmesi, gizlenen hareketin çıkması, hareket değiştirirken ekranın zıplaması | 🟢 Sorunsuz | 🟢 7/7 Geçti |
| **2. Antrenman & Stüdyo Şefi** (`workout-guard`) | `js/chiefs/workout-chief.js` (289 fn) | Antrenman sırasında set/kilo/süre/dakika tutar, son ağır seti hatırlar, kendi özel programını kurdurur | Back-off set kilosunu hatırlaması, süreli harekete 8-12 tekrar yazması, kardiyo dakikasını tekrara eklemesi | 🟢 Sorunsuz | 🟢 6/6 Geçti |
| **3. Kütüphane Şefi** (`library-guard`) | `js/chiefs/library-chief.js` (46 fn) | Tüm hareketlerin form/kas/birim kimliğini korur, istemediğin hareketi tüm sistemden gizler | Süreli/dakikalı hareketi tekrarlı sanması, gizlenen hareketin sayacı bozması | 🟢 Sorunsuz | 🟢 4/4 Geçti |
| **4. Geçmiş Şefi** (`history-guard`) | `js/chiefs/history-chief.js` (66 fn) | Tamamlanan seansları gümrükten geçirip saklar, bozuk veriyi engeller, düzenleme/silmeyi Analiz ile eşitler | Bozuk/boş kaydın geçmişe sızması, kardiyo dakikasının tonaj şişirmesi, silinen kaydın Analizden düşmemesi | 🟢 Sorunsuz | 🟢 2/2 Geçti |
| **5. Analiz Şefi** (`analytics-guard`) | `js/chiefs/analytics-chief.js` (92 fn) | Kas yükünü, set dayanıklılığını, Epley zirve rekorunu, haftalık fitness/kardiyo puanını ve güncel kiloyu hesaplar | Piramit/drop-seti güç düşüşü sanmak, çift Zirve Rekor basmak, 30 günlük eski tartı kiloyu sıfırlamak | 🟢 Sorunsuz | 🟢 12/12 Geçti |
| **6. Profil Şefi** (`profile-guard`) | `js/chiefs/profile-chief.js` (142 fn) | Verilerini güvenle yedekler, şifre/API anahtarlarını buluttan izole eder ve tema okunabilirliğini korur | Açık zeminde açık renk yazı kalması, dışa aktarımda gizli anahtar/şifre sızması | 🟢 Sorunsuz | 🟢 3/3 Geçti |
| **7. Garmin & Tredict Şefi** (`garmin-tredict-guard`) | `js/garmin-tredict-bridge.js` (107 fn) | Yeni hareketlerin Garmin karşılığını library-guard kaslarıyla kıyaslar, olmayanları isimsiz+notlu gönderir, dönüşte saatin adını değil bizdeki orijinal adı koruyup sağlık verilerini ilgili şefe iletir | Saatten gelen ham hareket adının olduğu gibi alınması, Garmin’de olmayan harekete zorlama isim verilmesi | 🟢 Sorunsuz | 🟢 6/6 Geçti |

---

## 2. Köprü Gümrüğü (8 Şefler Arası Veri Kapısı — `js/chiefs/bridge-customs.js`)

Şefler arası veri geçişinde eksik birim/tarih alanları otomatik onarılır, içi boş veya bozuk kayıtlar sessizce engellenir:

| Hangi Veri? | Veriyi Üreten Şef | Gümrük Denetimi | Veriyi Kullanan Şefler | Bağlantı Bozulursa Ne Olur? |
| :--- | :--- | :--- | :--- | :--- |
| `celik_excluded_exercises` | `library-guard` | Aktif (sanitizeExcludedExerciseIds + C3) | `generator-guard`, `analytics-guard`, `workout-guard` | Gizlenen hareketin üreticide/tavsiyede çıkması |
| `celik_kodu_last_generated_workout` | `generator-guard` | Aktif (sanitizeGeneratedWorkoutPayload) | `workout-guard`, `profile-guard`, `garmin-tredict-guard` | Üretilen antrenmanın aktif seansa/saate bozuk birimle gitmesi |
| `celik_kodu_active_state_${uid}` | `workout-guard` | Aktif (sanitizeActiveSession) | `profile-guard`, `generator-guard`, `garmin-tredict-guard` | Canlı antrenman yarıda kalınca boş oturumun kaydı ezmesi |
| `celik_kodu_date_schedule_${uid}` | `workout-guard` | Aktif (Takvim + Ardışık Gün Alt Kas Köprüsü) | `analytics-guard`, `generator-guard` | Takvimdeki planın Analizde ve ardışık gün korumasında görünmemesi |
| `celik_kodu_history_${uid}` | `workout-guard / history-guard / garmin-tredict-guard` | Aktif (sanitizeWorkoutLogsList) | `analytics-guard`, `profile-guard` | Bozuk/boş seansın veya kardiyo sahte tonajının Analizi bozması |
| `celik_garmin_sent_manifests_v1` | `garmin-tredict-guard` | Aktif (Orijinal Ad & Kas Mühürü) | `garmin-tredict-guard`, `history-guard`, `analytics-guard` | Saatten dönen antrenmanda bizdeki orijinal hareket adının kaybolması |
| `celik_garmin_telemetry_v2` | `garmin-tredict-guard` | Aktif (handoff + sanitizeWorkoutLogsList) | `analytics-guard`, `history-guard`, `generator-guard` | Saatin sağlık verilerinin (Nabız, HRR, TUT, Kalori) orijinal harekete işlenmemesi |
| `celik_kodu_scale_${uid} & measurements_${uid}` | `analytics-guard` | Aktif (sanitizeScaleLogsList / sanitizeMeasurementLogsList) | `analytics-guard`, `workout-guard`, `profile-guard` | Hatalı kilo/ölçüm kaydının vücut ağırlığı tonajını bozması |

---

## 3. Otomatik Bekçi Raporu — A) Fiziksel Oda & Ekran Kontrolü
- **7 Bağımsız Oda + Ortak Çekirdek + Köprü Gümrüğü:** **✅ Tüm modül odaları diskte mevcut ve izole**
- **Tavsiye Edilen Hareketler Sağlam mı?:** 51 tavsiye butonu kontrol edildi -> **✅ Hepsi sağlam (0 hata)**
- **Sayfa Zıplama (Scroll) Koruması:** ✅ Tüm odalarda ekran sabitleme aktif (0 uyarı)
- **7. Şef (`garmin-tredict-guard`) Orijinal Ad & Sağlık Telemetrisi Koruması:** ✅ Aktif
- **Modal & Hareketli Görsel Denetimi (139 Ana Hareket):**
  - `window.exerciseGuideMap` Global Erişim: **✅ Açık**
  - Diskte Eksik Olan MP4 Dosyası: **✅ 0 Eksik**

---

## 4. Otomatik Bekçi Raporu — B) 7 Şef Matematik, Gümrük & Hata Hafızası Sınavı (40/40)

| Test | Sorumlu Şef | Senaryo | Beklenen (Olması Gereken) | Gerçekleşen (Sistem Çıktısı) | Sonuç |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `T1` | `analytics-guard` | Artan piramit (Push Press 7.5→10→12.5 kg) | category=pyramid & "Piramit Güç Artışı" | pyramid • 📈 Piramit Güç Artışı (+5 kg) | ✅ Geçti |
| `T2` | `analytics-guard` | Isınma+Tepe+Back-Off vs Ağır Set -3 Çöküş | A: drop_set ("Top-Set"); B: early_drop ("Ağır Set Düşüşü" & -3) | A:drop_set(🔻 Top-Set & Kontrollü İniş) • B:early_drop(⚡ Ağır Set Düşüşü (-3 tekrar)) | ✅ Geçti |
| `T3` | `analytics-guard` | Kontrollü Drop-Set (45→40→35 kg × 10) | category=drop_set & "Kontrollü Kilo Düşürme" | drop_set • 🔻 Kontrollü Kilo Düşürme (-10 kg) | ✅ Geçti |
| `T4` | `analytics-guard` | Willardson Sabit Kilo Normal Yorgunluk (-2 tekrar) | category=normal_fatigue & "Doğal Kas Yorgunluğu (-2 tekrar)" | normal_fatigue • 🔋 Doğal Kas Yorgunluğu (-2 tekrar) | ✅ Geçti |
| `T5` | `analytics-guard` | Sabit Kilo Hızlı Güç Çöküşü (12→10→7 tekrar, -5) | category=early_drop & "Hızlı Güç Düşüşü (-5 tekrar)" | early_drop • ⚡ Hızlı Güç Düşüşü (-5 tekrar) | ✅ Geçti |
| `T6` | `library-guard` | 3-Mod DB Denetimi (3 Cardio/6 Time/130 Rep) & Miras Hollow Body | cardio=3, time=6, reps=130; Hollow 12→10→8 normal_fatigue(sn), 40→20 early_drop | DB=3/6/130, H1=normal_fatigue, H2=early_drop(⚡ Süre Düşüşü (-20 sn)) | ✅ Geçti |
| `T7` | `history-guard` | Eşli Set Seçimi (10×12 + 15×8) & Geçmiş Kardiyo 0 Tonaj | latest=15 kg × 8; editDraft cardio vol=0 | latest=15kg×8, editVol=0 | ✅ Geçti |
| `T8` | `analytics-guard` | Epley Zirve Rekoru (20×10) + Israetel 2 Seans Üst Üste Yorgunluk | peak=20×10, twoSessionFatigue=true, status=dip | peak=20×10, 2s=true, status=dip | ✅ Geçti |
| `T9` | `workout-guard` | Helms Top-Set Ağırlık Hafızası (35 kg) & Ağırlıksız BW ("") | Incline=35 kg, Şınav="", Kürek="" | Incline=35, Şınav="", Kürek="" | ✅ Geçti |
| `T10` | `workout-guard` | Süre/Dakika Açılış Varsayılanları ("8-12" Korumalı) | Plank=30 sn (3 set), cond_indoor_row=20 dk (1 set) | Plank=30 sn, Kürek=1 set × 20 dk | ✅ Geçti |
| `T11` | `analytics-guard` | Kardiyo Puanı, 0 Tonaj & TUT Nabız Eşdeğer Dakika | vol=0, strengthSets=0, rawMin=23 (20+3), eqMin=26 (20+6) | cardVol=0, strSets=0, rawMin=23, eqMin=26 | ✅ Geçti |
| `T12` | `analytics-guard` | 45 Günlük Eski Tartı Kiloyu Aktif Tutma & BW Hacmi | bw=79.2 kg, pullup10=752.4, telemetry=79.2 | bw=79.2, pullupVol=752.4 (beklenen 752.4), tel=79.2 | ✅ Geçti |
| `T13` | `generator-guard` | Gizli Hareket & Ev Ekipmanı İzolasyonu + 3-Mod Hedef Etiketi | gizli=0, bar/makine=0, Plank="30 sn", Kürek="20 dk" (1 set) | adet=6, gizli=false, yabancıEkip=0, Plank=30 sn, Kürek=1×20 dk | ✅ Geçti |
| `T14` | `generator-guard` | Ardışık Gün Doğrudan Çalışmayan Alt Kas Seçimi (A3) | Dünkü birincil 31 alt kasla çakışma = 0 (hem günlük hem haftalık ardışık günde) | korunanAltKas=7, günlükÇakışma=0, haftalıkArdışıkÇakışma=0, ov= | ✅ Geçti |
| `T15` | `profile-guard` | Şifre/API Anahtarı İzolasyonu & Açık Zemin Kontrast Denetimi | 5 gizli alan sızıntısı = 0, açık zemin soluk yazı ihlali = 0 | sızıntı=0, güvenliAlan=true, kontrastİhlali=0 | ✅ Geçti |
| `T16` | `garmin-tredict-guard` | İsimsiz+Notlu Saat Gönderimi & Orijinal Hareket Adı + Nabız İadesi | matchType=unmapped_noted, dönen ad="Dambıl Floor Press to Glute Bridge", nabız=148/166 | audit=unmapped_noted, ad="Dambıl Floor Press to Glute Bridge (Göğüs & Kalça Köprüsü)", nabız=148/166 | ✅ Geçti |
| `T17` | `history-guard` | Köprü Gümrüğü (A2): Eksik Birim/Tarih Onarımı & Bozuk Kayıt Engeli | bozuk/boş kayıt engellendi (>=2), kardiyo sahte tonajı 0 kg onarıldı (>=1) | kayıt=1, tonaj=0kg, tartı=1, onarılan=3, engellenen=2 | ✅ Geçti |
| `T18` | `analytics-guard` | Hata Hafızası Sicili: Tekil "🏆 Zirve Rekor" & Kardiyo Dakika Tekrar Hariçliği | Kart başına "🏆 Zirve Rekor" = 1 adet, tamamlanan seans tekrarında kardiyo dk = 0 | zirveRekorSayısı=1, toplamTekrar=12 (25 dk kürek hariç) | ✅ Geçti |
| `T19` | `library-guard` | Bağlantı Alt Şefleri, Kutu Arıza Duvarı, Döngü Kilidi & Ekranda Bildirim | Gizli hareket taslak+takvimden değişir, hatalı kutu karantinaya alınır, döngü=1, bildirim > 0 | taslakTemiz=true, takvimTemiz=true, karantina=true, komşuSağlam=true, bildirim=2 | ✅ Geçti |
| `T20` | `workout-guard` | Hata Hafızası Sicili: Canlı Odak Dinlenme Ekranı, Çift Gelişim Eğrisi & Süperset Döngüsü | Düz set dinlenme=aktif, çift eğri=kilo+tekrar, A1 bitişi=A2 önizleme, A2 bitişi=A1 tur 2 | dinlenmeKartı=true, çiftEğri=true, A2Önizleme=true, odakA2=true, tur2Önizleme=true, odakA1Tur2=true | ✅ Geçti |
| `T21` | `garmin-tredict-guard` | Merkez Saat Kasası & Aynı Gün Bağımsız Yürüyüş İzolasyonu | mühürlü saat kasası açık, açık metin sızıntısı 0, Defne Yürüyüşü (cond_walking) aynı gün kuvvet kaydını ezmeden bağımsız açıldı | kasa=true/mühür=true, katalog=true, kuvvet=true, kayıt=2, yürüyüş=cond_walking(2212m,123/152bpm,135kcal) | ✅ Geçti |
| `T22` | `garmin-tredict-guard` | Çoklu Cihaz İsim Düzenleme Koruması & Saat/Geçmiş Senkronu | eski saat önbelleği kullanıcı düzenlemesini ezemez, ilk bulut açılış kapısı erken push engeller, aynı gün kuvvet+yürüyüş korunur, saat paneli güncel başlığı gösterir | erkenPush=0, eldenÇıkış=true/true, pull=true(2), push=true(2), panel=true/eskiYok=true | ✅ Geçti |
| `T23` | `garmin-tredict-guard` | Kanonik Takvim Çözümlemesi & Sıfır Mükerrer Saat Gönderimi | haftalık+tarih çakışmasında mükerrer gün = 0, override tekil geçerli, başlıkta kısa ay tarih öneki | toplamGün=3, mükerrersiz=true, overrideTekil=true, başlık="18 Kas • Bugün: Özel İtiş" | ✅ Geçti |
| `T24` | `profile-guard` | Bulut Birleşmesinde Sıfır Boş (undefined) Alan | saat/sağlık bilgisi olmayan eski kayıt birleşince undefined alan = 0, telefondaki yeni seans korunur | undefined=0, telefonSeansıKorundu=true, toplam=2 | ✅ Geçti |
| `T25` | `garmin-tredict-guard` | Onay Bekleyen Kapsülde Sıfır Boş / Mükerrer Seans | set verisi olmayan veya geçmişte kaydı olan saat seansı onaya düşmez; gerçek yeni seans düşer | bildirim=1, yeniVar=true, boşVar=false, kayıtlıVar=false | ✅ Geçti |
| `T26` | `analytics-guard` | Set Arası Plank = Kuvvet, Jumping Jack = Kardiyo | set arası plank kuvvet seti sayılır, jumping jack kuvvet setine girmez ve kardiyo listesinde görünür | temel=3, plankİle=4 (beklenen 4), jackİle=3 (beklenen 3), jackKardiyoda=true | ✅ Geçti |
| `T27` | `workout-guard` | Süreli Set Arası Sayaç & Odak Ekranı Ekleme | süreli ara hareket otomatik yapıldı sayılmaz, sayaç açılır, süre bitince yapıldı olur; Odak dinlenme ekranında ekle düğmesi var | {"notAutoDone":true,"overlayOpen":true,"doneAfter":true,"overlayClosed":true,"repsDone":true,"noTimerForReps":true,"focusHasAdd":true} | ✅ Geçti |
| `T28` | `analytics-guard` | Tek Hareketle Sahte İdeal Kas & Yan Etki Alt Kas Koruması (Schoenfeld/Pelland) | varsayılan=week_done; sadece Russian Twist (8 set bile) Karını ideal yapmaz, Ön/Derin Karın yeşil yanmaz; Barda Dize Çekme eklenince ideal olur; Göğüste tek Bench=eksik bölge | {"defaultSource":"week_done","core1Status":"insufficient","core1Covered":1,"chest1Status":"insufficient","obliqWorked":true,"rectusWorked":false,"rectusPartial":true,"transWorked":false,"core2Status":"optimal","core2Covered":2} | ✅ Geçti |
| `T29` | `library-guard` | Paralel Bar Dips (bw_dips) ve Sehpada Dips (bw_bench_dips) Ayrımı & Medya Bütünlüğü | bw_dips=0251.mp4+chest_lower+dips_bar; bw_bench_dips=1399.mp4+triceps+bench (chest yok) | {"hasDips":true,"hasBenchDips":true,"dipsClipOk":true,"benchClipOk":true,"dipsHasLowerChest":true,"benchNoChest":true,"dipsReqBar":true,"benchReqBench":true,"staleCloudDidNotOverwrite":true} | ✅ Geçti |
| `T31` | `generator-guard` | 5-Kademe Sıra, B2 Sinerjist Matrisi, Gerçek Sırt Zorunluluğu & Çelik Akışı Uyarlaması | 4 stilde 0 B2/sıra hatası, realBack>=2, Push/Pull<=1.35, functional jumping_jack sonda, bw Çelik Akışı başlıklı | {"upperOkAll":true,"minRealBack":2,"maxRatio":1,"b2Errs":0,"orderErrs":0,"burnoutEarlyErrs":0,"funcJumpOk":true,"flowTitleOk":true,"flowWarnOk":true} | ✅ Geçti |
| `T32` | `generator-guard` | 34s/46s Kalibreli Yorgunluk Penceresi, +24s Sıfır Çakışma & 3-Gün Cooldown Kilidi | +24s 0 çakışma; +40s normal RPE7 toparlanır / 5set RPE9 yorgun kalır; +48s 3-gün tekrar yok | {"d2Collisions":0,"normal40hRecovered":true,"over40hStillFatigued":true,"d3RepeatCount":0} | ✅ Geçti |
| `T33` | `generator-guard` | 10-Kas 0-Set Telafisi, "sırt ağrım var" Anahtar Dışlaması & Slot 0 Bileşik Zorunluluğu | sırt dışlanır, 3-gün Göğüs sonrası 4. gün Full Body Sırt+Bacak telafi eder ve Slot 0 Tier<=2 | {"backFreeOk":true,"deficitHitsBack":true,"deficitHitsLegs":true,"slot0TierOk":true} | ✅ Geçti |
| `T34` | `generator-guard` | Sıkı Havuz Tükenmesi: Kural Delinmez, Boş+Uyarılı Dönüş & Köprü Gümrüğü Kabülü | iso_shoulders+(bw/barfiks/dips)=0 hrk + equipmentWarning; confirm=false iso_chest=0 çakışma + fatigueWarning | {"shNonNull":true,"shEmpty":true,"shHasWarn":true,"shNoClimber":true,"customsOk":true,"chestZeroCollision":true,"chestHasFatigueWarn":true} | ✅ Geçti |
| `T35` | `generator-guard` | Haftalık Çevrimdışı Plan 31-Alt-Kas Ayrımı & Önizleme İzolasyonu | Önizleme son üretilen kaydı ezmez; onayda ardışık gün alt-kas çakışması = 0 | {"sentinelPreserved":true,"daysLen":3,"nextSchedSaved":true,"consecOverlap":0} | ✅ Geçti |
| `T36` | `library-guard` | Kapsamlı Dışlama Önbelleği (I/O Azaltımı) & Gerçek Geçmiş Akışı | 1 üretimde celik_excluded_exercises okuma <= 5, toggle anında günceller, getWorkoutLogs geçmişi okunur | {"exclReads":1,"hasLastDone":true,"toggleAdded":true,"toggleRemoved":true} | ✅ Geçti |
| `T37` | `analytics-guard` | Kimlik Öncelikli Biyomekanik Çözümleme & Artan Ağırlık Piramidi Muafiyeti | bb_overhead_press=Omuz; 20kgx12->25kgx10 piramidi +40s sonrasında sahte yorgunluk bloğu tetiklemez | {"primary":"Omuz","noPyramidOverload":true} | ✅ Geçti |
| `T38` | `workout-guard` | Üretici & Antrenman Sekmeleri Arası Arayüz ve Kart Düzeni Bütünlüğü | Üretici, Takvim gün önizlemesi ve Canlı Odak ekranı .wk-carousel-wrap/.wk-card-media-box/.wk-carousel-dock kullanır; CSS Koyu Mor (#181530) tema aktif | {"hasThemeCss":true,"genUnified":true,"calUnified":true,"liveUnified":true} | ✅ Geçti |
| `T39` | `workout-guard` | Tarih Bazlı Hafta Bağımsızlığı: Eklenen Hareket Geçmiş ve Gelecek Haftalara Sızmaz | Bu hafta/gelecek hafta Çarşambasına eklenen hareketler sadece kendi tarihine yazılır; -7g, +7g, +14g izoledir | {"addCurOk":true,"addNextOk":true,"curHasLateral":true,"prevIsRest":true,"nextBeforeIsRest":true,"twoWkBeforeIsRest":true,"nextHasFacePullOnly":true,"curUnaffectedByNext":true,"twoWkStillRest":true} | ✅ Geçti |
| `T40` | `garmin-tredict-guard` | Zaman Penceresi Eşleşmesi, Eski Kayıt Filtresi & Aynı Gün 4 Antrenman Analizi | aynı saat dilimindeki telefon+saat tek seansta birleşir (0 bildirim), eski 3 Ekim onaya düşmez, aynı gün 4 ayrı antrenman bulut birleşmesinde ve Analizde eksiksiz sayılır | {"nov16Count":1,"nov16HrAvg":103,"nov16HrMax":148,"nov16Cal":519,"nov16LinkedId":"nov16_watch_1","zeroPendingNotifications":true,"fourSessionsSurvived":true,"weeklyStrengthSessions":4,"weeklyStrengthSets":15,"musclesCounted":true,"walkStillInHistory":true,"cardioNotifClosed":true} | ✅ Geçti |
| `T41` | `profile-guard` | 4 Kapılı Kara Kutu (K1-K4), Gizli Anahtar Maskeleme, 50 Kayıt Tamponu & Yönetici Sistem İzleme Sekmesi | 4 kapı (error+warn) kaydedilir, 4 gizli anahtar sızıntısı=0, dedup repeatCount=3, max=50 kayıt, Yönetici rozeti+filtre+temizleme eksiksiz çalışır | {"hasGatewayGate":true,"gatesCovered":true,"hasWarnAndError":true,"repeatOk":true,"capOk":true,"headerVisible":true,"tabBadgeVisible":true,"athleteHiddenOk":true,"k2FilterOk":true,"promptReady":true,"leakCount":0,"clearedOk":true} | ✅ Geçti |
