// ==================== ORTAK ÇEKİRDEK & BİLİMSEL METRİK MOTORU (SHARED CORE) ====================
// ==================== APPLICATION CORE LOGIC ====================
        // ==================== CANVA MINIMALIST VECTOR ICON SYSTEM (DAHYNZmpUlM) ====================
        const CANVA_ICONS = {
            crosshair: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="4.5"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><path d="M8 1.5v2.2M8 12.3v2.2M1.5 8h2.2M12.3 8h2.2"/></svg>`,
            sparkle: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 1.5L9.6 6.4L14.5 8L9.6 9.6L8 14.5L6.4 9.6L1.5 8L6.4 6.4L8 1.5Z"/><path d="M13 2v2M12 3h2M3 12v2M2 13h2"/></svg>`,
            calendar: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M5 1.5v2.5M11 1.5v2.5M2 6.5h12"/><rect x="4.5" y="8.8" width="1.5" height="1.5" rx="0.3"/><rect x="7.2" y="8.8" width="1.5" height="1.5" rx="0.3"/><rect x="10" y="8.8" width="1.5" height="1.5" rx="0.3"/></svg>`,
            bolt: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 1.5L3 9h4.5L6.8 14.5L13 7H8.5L9 1.5Z"/></svg>`,
            refresh: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M13.5 8a5.5 5.5 0 0 1-9.4 3.9M2.5 8a5.5 5.5 0 0 1 9.4-3.9"/><path d="M10 1.8l2.2 2.3L9.8 6M6 14.2L3.8 11.9 6.2 10"/></svg>`,
            sliders: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 4h3.5M8.5 4H14M2 8h6.5M11.5 8H14M2 12h2.5M7.5 12H14"/><circle cx="7" cy="4" r="1.5"/><circle cx="10" cy="8" r="1.5"/><circle cx="6" cy="12" r="1.5"/></svg>`,
            play: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4.5 2.8L12.8 8L4.5 13.2V2.8Z"/></svg>`,
            note: `<svg class="cv-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 12 11H6.5L3.8 13.5V11H4a1.5 1.5 0 0 1-1.5-1.5v-6Z"/><path d="M5.5 5.5h5M5.5 8h3.5"/></svg>`
        };
        window.CANVA_ICONS = CANVA_ICONS;


        // ==================== MUSCLE RADAR & REGION DEFINITIONS ====================
        
        // STUDIO_REGION_MAP hoisted above

        const TARGET_REGIONS = {
            chest: { name: "Göğüs" },
            back: { name: "Sırt" },
            shoulders: { name: "Omuz" },
            biceps: { name: "Biceps" },
            triceps: { name: "Triceps" },
            quads: { name: "Ön Bacak" },
            hamstrings: { name: "Arka Bacak" },
            glutes: { name: "Kalça" },
            core: { name: "Karın & Core" },
            calves: { name: "Kalf" },
            calves_grip: { name: "Kalf & Kavrama" },
            full_body: { name: "Tüm Vücut" },
            legs: { name: "Bacak" },
            arms: { name: "Kol" }
        };

        const MUSCLE_DEFS = {
            chest: { name: "Göğüs", icon: "🛡️", desc: "Üst, Orta ve Alt Göğüs", color: "#38bdf8" },
            back: { name: "Sırt & Kanat", icon: "🏹", desc: "Kanat, Orta ve Üst Sırt", color: "#818cf8" },
            shoulders: { name: "Omuz", icon: "⚔️", desc: "Ön, Yan ve Arka Omuz", color: "#f59e0b" },
            biceps: { name: "Ön Kol (Pazı)", icon: "💪", desc: "Pazı & Kol Çekiş Gücü", color: "#ec4899" },
            triceps: { name: "Arka Kol", icon: "⚡", desc: "Arka Kol & Kol İtiş Gücü", color: "#10b981" },
            quads: { name: "Ön Bacak", icon: "🦵", desc: "Ön Bacak & Çömelme Gücü", color: "#06b6d4" },
            hamstrings: { name: "Arka Bacak", icon: "🦿", desc: "Arka Bacak & Eğilme Gücü", color: "#f97316" },
            glutes: { name: "Kalça", icon: "🍑", desc: "Kalça & Denge Gücü", color: "#a855f7" },
            core: { name: "Karın & Bel", icon: "🧱", desc: "Ön Karın, Yan Karın & Bel Çevresi", color: "#eab308" },
            calves_grip: { name: "Baldır & Tutuş", icon: "🦶", desc: "Baldır, Ayak Bileği & El Tutuşu", color: "#94a3b8" }
        };

        // ==================== BÖLGESEL KAS HARİTASI (SSOT) ====================
        const EXERCISE_ANATOMY_MAP = {
          "db_bench_press": {
                    "primary": "Orta Göğüs",
                    "secondary": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "chest_mid"
                    ],
                    "isComplex": false,
                    "proof": "Düz sehpada dirsekleri 45° açıyla indirip itmek, göğsün tam orta kısmını en geniş açıda gerip sıkıştırır; kolları düzleştirirken triceps ve ön omuz da yardıma girer."
          },
          "db_incline_press": {
                    "primary": "Üst Göğüs",
                    "secondary": "Orta Göğüs, Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "subKey": "chest_upper",
                    "primarySubKeys": [
                              "chest_upper"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "shoulders_front",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "chest_upper"
                    ],
                    "isComplex": false,
                    "proof": "Sehpayı 30-45° yukarı kaldırmak itiş yönünü köprücük kemiğine taşır; böylece yük orta göğüsten doğrudan üst göğse ve ön omuza geçer."
          },
          "db_floor_press": {
                    "primary": "Orta Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "secondary": "Ön Omuz",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front"
                    ],
                    "allSubKeys": [
                              "chest_mid",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "isComplex": false,
                    "proof": "Yerde yatarken dirseklerin zemine değmesi kolun fazla geriye gitmesini önler; dipten hız almadan yapılan itiş orta göğsü ve özellikle tricepsin kol kilitleme gücünü vurur."
          },
          "bb_bench_press": {
                    "primary": "Orta Göğüs",
                    "secondary": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "chest_mid"
                    ],
                    "isComplex": false,
                    "proof": "Düz sehpada iki eli sabit barla birleştirerek ağır itiş yapmak, orta göğse en yüksek ağırlığı yüklerken kolları kilitleyen tricepsi ve ön omzu güçlü çalıştırır."
          },
          "bb_incline_bench": {
                    "primary": "Üst Göğüs",
                    "secondary": "Orta Göğüs, Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "subKey": "chest_upper",
                    "primarySubKeys": [
                              "chest_upper"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "shoulders_front",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "chest_upper"
                    ],
                    "isComplex": false,
                    "proof": "Yukarı eğimli sehpada barı üst göğse indirip itmek, göğsün üst kısmını (köprücük kemiği altını) ve ön omuzları ana hedef yapar."
          },
          "bb_close_grip_bench": {
                    "primary": "Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "secondary": "Orta Göğüs, Ön Omuz, Arka Kol Uzun Baş",
                    "subKey": "triceps_lateral",
                    "primarySubKeys": [
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "shoulders_front",
                              "triceps_long"
                    ],
                    "allSubKeys": [
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "isComplex": false,
                    "proof": "Barı dar tutup dirsekleri gövdeye yakın indirip itmek, göğsün yükünü azaltır ve arka kolun dış ile alt kısmına çok yüksek itiş gücü bindirir."
          },
          "mach_cable_crossover": {
                    "primary": "Orta Göğüs, Alt Göğüs",
                    "secondary": "Ön Omuz",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid",
                              "chest_lower"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front"
                    ],
                    "allSubKeys": [
                              "chest_mid",
                              "chest_lower"
                    ],
                    "isComplex": false,
                    "proof": "Dirsekleri büküp açmadan kolları önde birbirine kavuşturmak (sarılmak gibi), tricepsi devre dışı bırakır ve doğrudan orta ile iç göğüs liflerini sıkıştırır."
          },
          "mach_pec_deck": {
                    "primary": "Orta Göğüs",
                    "secondary": "Ön Omuz",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front"
                    ],
                    "allSubKeys": [
                              "chest_mid"
                    ],
                    "isComplex": false,
                    "proof": "Makinede oturarak kolları önde birleştirmek, kol kaslarını yormadan sadece orta ve iç göğsü izole şekilde çalıştırır."
          },
          "bw_pushup": {
                    "primary": "Orta Göğüs",
                    "secondary": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "triceps_lateral",
                              "triceps_medial",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "chest_mid"
                    ],
                    "isComplex": false,
                    "proof": "Yerde vücudu düz bir tahta gibi tutarak kendini yukarı itmek orta göğsü ve tricepsi çalıştırırken, belin sarkmasını önlemek için karın (core) kaslarını sürekli sıkar."
          },
          "bw_decline_pushup": {
                    "primary": "Üst Göğüs",
                    "secondary": "Orta Göğüs, Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın",
                    "subKey": "chest_upper",
                    "primarySubKeys": [
                              "chest_upper"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "shoulders_front",
                              "triceps_lateral",
                              "triceps_medial",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "chest_upper"
                    ],
                    "isComplex": false,
                    "proof": "Ayakları sehpaya koyup eller yerde şınav çekmek, vücut açısını yukarı eğimli (incline) prese çevirir ve yükü üst göğüs ile ön omuza bindirir."
          },
          "bw_diamond_pushup": {
                    "primary": "Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "secondary": "Orta Göğüs, Ön Omuz, Derin İç Karın",
                    "subKey": "triceps_lateral",
                    "primarySubKeys": [
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "shoulders_front",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "isComplex": false,
                    "proof": "Eller göğüs altında birbirine yakın (elmas şeklinde) şınav çekildiğinde dirsekler tamamen bükülüp açılır; arka kolu en sert çalıştıran vücut ağırlığı hareketidir."
          },
          "bw_dips": {
                    "primary": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "secondary": "Orta Göğüs, Ön Omuz",
                    "subKey": "chest_lower",
                    "primarySubKeys": [
                              "chest_lower",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "shoulders_front"
                    ],
                    "allSubKeys": [
                              "chest_lower",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "isComplex": false,
                    "proof": "Gövdeyi hafif öne eğerek paralel barda kendini yukarı itmek, göğsün alt çizgisini (alt göğüs) ve arka kolun dış/alt kısmını çok yoğun çalıştırır."
          },
          "db_renegade_pushup": {
                    "primary": "Orta Göğüs, Kanatlar, Orta Sırt, Yan Karın",
                    "secondary": "Arka Kol Dış Baş, Arka Kol Alt Baş, Ön Omuz, Pazı Dış Baş, Derin İç Karın",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid",
                              "back_lats",
                              "back_mid",
                              "core_obliques"
                    ],
                    "secondarySubKeys": [
                              "triceps_lateral",
                              "triceps_medial",
                              "shoulders_front",
                              "biceps_long",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "chest_mid",
                              "back_lats",
                              "back_mid",
                              "core_obliques"
                    ],
                    "isComplex": true,
                    "proof": "Şınav kısmında orta göğüs ve triceps iterken, tek kolla dambılı çektiğin kısımda kanat ve orta sırt çalışır; tek el üstünde dengede kalmak yan karın kaslarını ateşler."
          },
          "db_overhead_press": {
                    "primary": "Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "traps"
                    ],
                    "allSubKeys": [
                              "shoulders_front"
                    ],
                    "isComplex": false,
                    "proof": "Sırtı 80-85° dik sehpaya yaslayıp ağırlığı baş üstüne itmek bacaklardan hız almayı keser; ön omuzu ana hedef yaparken yan omuz ve arka kolu yardımcı çalıştırır."
          },
          "db_standing_overhead_press": {
                    "primary": "Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez, Derin İç Karın",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "traps",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "shoulders_front"
                    ],
                    "isComplex": false,
                    "proof": "Ayakta dambılları baş üstüne iterken ön ve yan omuz ana işi yapar; ağırlık tepedeyken sağa sola sallanmamak için tüm karın (core) ve kalça kasları kilitlenir."
          },
          "db_arnold_press": {
                    "primary": "Ön Omuz, Yan Omuz",
                    "secondary": "Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front",
                              "shoulders_side"
                    ],
                    "secondarySubKeys": [
                              "triceps_lateral",
                              "triceps_medial",
                              "traps"
                    ],
                    "allSubKeys": [
                              "shoulders_front",
                              "shoulders_side"
                    ],
                    "isComplex": false,
                    "proof": "Avuç içleri sana bakarken başlayıp yukarı iterken dışa çevirmek, hareketin başında ön omzu, yukarı çıkarken ise yan omzu kesintisiz çalıştırır."
          },
          "db_lateral_raise": {
                    "primary": "Yan Omuz",
                    "secondary": "Üst Sırt & Trapez",
                    "subKey": "shoulders_side",
                    "primarySubKeys": [
                              "shoulders_side"
                    ],
                    "secondarySubKeys": [
                              "traps"
                    ],
                    "allSubKeys": [
                              "shoulders_side"
                    ],
                    "isComplex": false,
                    "proof": "Kolları yanlardan omuz hizasına doğru açmak, omuza genişlik veren yan omuz kasını doğrudan ve tek başına hedef alır."
          },
          "mach_cable_lateral": {
                    "primary": "Yan Omuz",
                    "secondary": "Üst Sırt & Trapez",
                    "subKey": "shoulders_side",
                    "primarySubKeys": [
                              "shoulders_side"
                    ],
                    "secondarySubKeys": [
                              "traps"
                    ],
                    "allSubKeys": [
                              "shoulders_side"
                    ],
                    "isComplex": false,
                    "proof": "Dambılda kol aşağıdayken yük sıfırlanır ama kablo makarası hareketin en alt noktasından en üst noktasına kadar yan omuza sürekli yük bindirir."
          },
          "mach_face_pull": {
                    "primary": "Arka Omuz",
                    "secondary": "Orta Sırt, Üst Sırt & Trapez",
                    "subKey": "shoulders_rear",
                    "primarySubKeys": [
                              "shoulders_rear"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "traps"
                    ],
                    "allSubKeys": [
                              "shoulders_rear"
                    ],
                    "isComplex": false,
                    "proof": "Halatı yüzüne doğru çekip elleri iki yana açmak, duruşu dikleştiren arka omuzları, kürek kemiği çevresini ve omuz eklemini koruyan iç denge kaslarını doğrudan çalıştırır."
          },
          "kneeling_plate_front_raise": {
                    "primary": "Ön Omuz",
                    "secondary": "Üst Göğüs, Derin İç Karın",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "chest_upper",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "shoulders_front"
                    ],
                    "isComplex": false,
                    "proof": "İki diz üstünde durmak belden hız almayı keser; plakayı önden yüz hizasına kaldırmak doğrudan ön omuz ve üst göğsü çalıştırır."
          },
          "kb_press": {
                    "primary": "Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez, Yan Karın",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "traps",
                              "core_obliques"
                    ],
                    "allSubKeys": [
                              "shoulders_front"
                    ],
                    "isComplex": false,
                    "proof": "Kettlebell'in topuzu elin dış kısmında durduğu için yukarı iterken omuzun iç denge kasları dambıla göre çok daha fazla çalışır; tek kolla yapılması yan karnı da devreye sokar."
          },
          "bb_overhead_press": {
                    "primary": "Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez, Derin İç Karın",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "traps",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "shoulders_front"
                    ],
                    "isComplex": false,
                    "proof": "Ayakta düz barı baş üstüne ağır şekilde itmek ön ve yan omuzları büyütürken, barı dengede tutmak için karın, alt bel ve üst sırtı taş gibi sıkar."
          },
          "bb_push_press": {
                    "primary": "Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Dış Ön Bacak, Derin İç Karın",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "legs_quad_outer",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "shoulders_front"
                    ],
                    "isComplex": false,
                    "proof": "Dizleri hafif büküp bacaklardan patlayıcı güç alarak barı baş üstüne fırlatmak, normalden daha ağır kilolarla ön/yan omuz ve tricepsi çalıştırmanı sağlar."
          },
          "db_push_press": {
                    "primary": "Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Dış Ön Bacak, Derin İç Karın",
                    "subKey": "shoulders_front",
                    "primarySubKeys": [
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "legs_quad_outer",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "shoulders_front"
                    ],
                    "isComplex": false,
                    "proof": "Bacak itişiyle hız kazandırıp dambılları baş üstüne kilitlemek; ön/yan omuz, triceps ve bacak itiş gücünü aynı anda çalıştırır."
          },
          "kb_halo": {
                    "primary": "Arka Omuz, Yan Omuz",
                    "secondary": "Üst Sırt & Trapez, Orta Sırt, Derin İç Karın",
                    "subKey": "shoulders_rear",
                    "primarySubKeys": [
                              "shoulders_rear",
                              "shoulders_side"
                    ],
                    "secondarySubKeys": [
                              "traps",
                              "back_mid",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "shoulders_rear",
                              "shoulders_side"
                    ],
                    "isComplex": false,
                    "proof": "Ağırlığı başın etrafında tam tur döndürmek omuz eklemini her açıdan çalıştırır; özellikle arka/yan omuz, omuz iç denge kasları ve kürek kemiği çevresini açar."
          },
          "waiters_carry": {
                    "primary": "Yan Karın, Derin İç Karın, Ön Omuz",
                    "secondary": "Yan Omuz, Üst Sırt & Trapez, Arka Kol Alt Baş",
                    "subKey": "core_obliques",
                    "primarySubKeys": [
                              "core_obliques",
                              "core_deep",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "traps",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "core_obliques",
                              "core_front",
                              "shoulders_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Ağırlığı tek elle garson tepsisi gibi baş üstünde tutarak yürümek, omuz iç denge kaslarını ve gövdenin yana yatmasını önleyen yan karın kaslarını aralıksız çalıştırır."
          },
          "db_saw_row": {
                    "primary": "Kanatlar",
                    "secondary": "Orta Sırt, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Dirseği gövdeye yakın tutup dambılı göğse değil arka cebe doğru (testere gibi) çekmek, sırtı üçgenleştiren kanat kaslarını en alt ucuna kadar çalıştırır."
          },
          "db_chest_supported_row": {
                    "primary": "Orta Sırt, Kanatlar",
                    "secondary": "Arka Omuz, Üst Sırt & Trapez, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_mid",
                    "primarySubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "shoulders_rear",
                              "traps",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Göğsü sehpaya dayamak belden hız almayı tamamen keser; kürek kemiklerini arkada birbirine sıkıştırarak çekmek orta sırt kalınlığını doğrudan vurur."
          },
          "db_renegade_row": {
                    "primary": "Orta Sırt, Kanatlar, Yan Karın, Derin İç Karın",
                    "secondary": "Orta Göğüs, Ön Omuz, Arka Kol Alt Baş, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_mid",
                    "primarySubKeys": [
                              "back_mid",
                              "back_lats",
                              "core_obliques",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "shoulders_front",
                              "triceps_medial",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_mid",
                              "back_lats",
                              "core_obliques",
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Şınav duruşunda tek kolla yerden dambıl çekerken gövdenin dönmemesi için kendini sıkmak, orta sırt/kanatlarla birlikte yan karın kaslarını çok sert çalıştırır."
          },
          "db_pullover": {
                    "primary": "Kanatlar",
                    "secondary": "Alt Göğüs, Orta Göğüs, Arka Kol Uzun Baş",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "chest_lower",
                              "chest_mid",
                              "triceps_long"
                    ],
                    "allSubKeys": [
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Sırtüstü yatarken kolları başın gerisinden yukarı çekmek, kanat kaslarını boydan boya esnetip çalıştırırken göğüs kafesini ve orta/alt göğsü de devreye sokar."
          },
          "mach_lat_pulldown": {
                    "primary": "Kanatlar",
                    "secondary": "Orta Sırt, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Yukarıdaki barı göğse doğru çekmek, sırta genişlik (V görünümü) veren kanat kaslarını doğrudan çalıştırır; çekiş sırasında biceps ve ön kollar yardımcı olur."
          },
          "mach_cable_row": {
                    "primary": "Orta Sırt, Kanatlar",
                    "secondary": "Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_mid",
                    "primarySubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Oturarak kabloyu karnına doğru çekerken omuzları geriye alıp kürek kemiklerini birbirine yaklaştırmak, orta sırt kalınlığını ve kanatları birlikte çalıştırır."
          },
          "bw_pullup": {
                    "primary": "Kanatlar",
                    "secondary": "Orta Sırt, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı, Ön Karın",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis",
                              "core_front"
                    ],
                    "allSubKeys": [
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Avuç içleri karşıya bakacak şekilde geniş tutuşla barfiks çekmek, bicepsin yardımını azaltıp bütün yükü üst ve dış kanat kaslarına bindirir."
          },
          "bw_chinup": {
                    "primary": "Kanatlar, Pazı İç Baş, Pazı Dış Baş",
                    "secondary": "Orta Sırt, Ön Kol & Dış Pazı, Arka Omuz, Ön Karın",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats",
                              "biceps_short",
                              "biceps_long"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "brachialis",
                              "shoulders_rear",
                              "core_front"
                    ],
                    "allSubKeys": [
                              "back_lats",
                              "biceps",
                              "biceps_short",
                              "biceps_long"
                    ],
                    "isComplex": false,
                    "proof": "Avuç içleri sana bakacak şekilde omuz genişliğinde barfiks çekmek, hem kanat kaslarını tam boyda çalıştırır hem de bicepsleri en güçlü açısında kasar."
          },
          "bw_inverted_row": {
                    "primary": "Orta Sırt, Kanatlar",
                    "secondary": "Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı, Derin İç Karın",
                    "subKey": "back_mid",
                    "primarySubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Alçak barın altına girip göğsü bara çekmek, bele hiç yük bindirmeden kürek kemiklerini birbirine kenetler ve orta sırt ile arka omzu çalıştırır."
          },
          "bb_bent_over_row": {
                    "primary": "Orta Sırt, Kanatlar",
                    "secondary": "Alt Sırt & Bel, Üst Sırt & Trapez, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_mid",
                    "primarySubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "traps",
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_mid",
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Kalçadan öne eğilerek ağır barı karna çekmek orta sırt ve kanatları büyütürken, eğik gövdeyi sabit tutmak için alt sırt ve bel kaslarını da güçlü çalıştırır."
          },
          "bb_pendlay_row": {
                    "primary": "Orta Sırt, Kanatlar, Üst Sırt & Trapez",
                    "secondary": "Alt Sırt & Bel, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_mid",
                    "primarySubKeys": [
                              "back_mid",
                              "back_lats",
                              "traps"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_mid",
                              "back_lats",
                              "traps"
                    ],
                    "isComplex": false,
                    "proof": "Gövde yere paralelken her tekrarda yerdeki barı patlayıcı şekilde karnına çekmek, üst/orta sırt ve kanatlarda saf çekiş gücü üretir."
          },
          "kb_gorilla_row": {
                    "primary": "Kanatlar, Orta Sırt",
                    "secondary": "Alt Sırt & Bel, Yan Karın, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats",
                              "back_mid"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "core_obliques",
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_lats",
                              "back_mid"
                    ],
                    "isComplex": false,
                    "proof": "Geniş çömelme duruşunda yerdeki iki ağırlığı sırayla çekmek, kanat ve orta sırtı çalıştırırken gövdenin dönmesini önleyen yan karın ve bacakları da aktif tutar."
          },
          "mach_straight_arm_pulldown": {
                    "primary": "Kanatlar",
                    "secondary": "Arka Kol Uzun Baş, Ön Karın",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats"
                    ],
                    "secondarySubKeys": [
                              "triceps_long",
                              "core_front"
                    ],
                    "allSubKeys": [
                              "back_lats"
                    ],
                    "isComplex": false,
                    "proof": "Dirsekleri hiç bükmeden düz kollarla barı yukarıdan bacaklarına indirmek, bicepsi tamamen devre dışı bırakır ve sadece kanat kaslarını (özellikle alt kanadı) çalıştırır."
          },
          "bw_hyperextension": {
                    "primary": "Alt Sırt & Bel, Ana Kalça",
                    "secondary": "Arka Bacak & Kalça Bağı, Arka Bacak",
                    "subKey": "back_mid",
                    "primarySubKeys": [
                              "back_lower",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_ham_chain",
                              "legs_ham_hinge"
                    ],
                    "allSubKeys": [
                              "back_mid",
                              "legs_glutes",
                              "back_lower",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Sehpada öne eğilip kalça ve bel gücüyle doğrulmak, omurgayı dik tutan alt sırt/bel kaslarını, ana kalça kasını ve arka bacakları doğrudan güçlendirir."
          },
          "db_goblet_squat": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Orta Ön Bacak, Ana Kalça, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "legs_glutes_max",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Ağırlığı göğüs önünde tutmak sırtı dik tutmayı kolaylaştırır ve derin çömelme sağlar; böylece ön bacağın dış, orta ve diz üstü iç kısmı tam çalışır."
          },
          "db_front_squat": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Orta Ön Bacak, Ana Kalça, Orta Sırt, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "legs_glutes_max",
                              "back_mid",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "İki dambılı omuz önünde tutarak dik gövdeyle çömelmek, yükü kalçadan çok dizlere ve ön bacak kaslarına odaklar."
          },
          "db_bulgarian_squat": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Kalça",
                    "secondary": "Derin Kalça, Orta Ön Bacak",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "legs_glutes_med"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_min",
                              "legs_quad_mid"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "legs_glutes_med"
                    ],
                    "isComplex": false,
                    "proof": "Arka ayağı sehpaya koyup tek bacakla derin çömelmek, öndeki bacağın diz üstü iç kısmını ve ana kalçayı vururken, devrilmemek için yan kalça denge kasını çok yoğun çalıştırır."
          },
          "db_walking_lunge": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
                    "secondary": "Yan Kalça, Orta Ön Bacak, Üst Baldır",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "legs_quad_mid",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "İleri adım atıp çömelmek ve öndeki bacakla kendini yukarı-ileri çekmek, ön bacak ile ana ve yan kalça kaslarını her adımda güçlü çalıştırır."
          },
          "db_reverse_lunge": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
                    "secondary": "Yan Kalça, Orta Ön Bacak, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "legs_quad_mid",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Geriye doğru adım atmak dize binen baskıyı azaltır; öndeki bacağın ön kısmını ve ana kalça kasını diz dostu açıda çalıştırır."
          },
          "kb_goblet_squat": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Orta Ön Bacak, Ana Kalça, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "legs_glutes_max",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Kettlebell'i göğüs önünde tutarak en dibe kadar çömelmek, ön bacak kaslarını, ana kalçayı ve kasık/iç bacak kaslarını tam açıda çalıştırır."
          },
          "bb_back_squat": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
                    "secondary": "Orta Ön Bacak, Alt Sırt & Bel, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "back_lower",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Sırtta ağır barla çömelip kalkmak, tüm ön bacak kaslarını, ana kalçayı ve dip noktadan çıkarken iç bacak kaslarını en yüksek ağırlıkla çalıştırır."
          },
          "bb_front_squat": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Orta Ön Bacak, Ana Kalça, Orta Sırt, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "legs_glutes_max",
                              "back_mid",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Barı ön omuzda taşımak gövdeyi dimdik tutmaya zorlar; bu da ön bacak kaslarını ve sırtın üst/orta kısmını normal squat'tan daha fazla çalıştırır."
          },
          "bb_zercher_squat": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
                    "secondary": "Orta Sırt, Üst Sırt & Trapez, Derin İç Karın, Pazı İç Baş, Ön Kol & Dış Pazı",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "traps",
                              "core_deep",
                              "biceps_short",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Barı dirseklerin iç kısmında kucaklayarak çömelmek; ön bacak ve kalçanın yanı sıra gövdeyi öne yıkılmaktan koruyan üst sırt, karın (core) ve bicepsleri çok sert çalıştırır."
          },
          "mach_leg_press": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Orta Ön Bacak, Ana Kalça",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "legs_glutes_max"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Sırt ve bel koltukta sabitken bacaklarla ağır platformu itmek, beli hiç yormadan tüm yükü ön bacak ve kalça kaslarına verir."
          },
          "mach_leg_extension": {
                    "primary": "Orta Ön Bacak, Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_mid",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_mid",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Oturarak sadece dizleri düzleştirmek, başka hiçbir kası karıştırmadan ön bacağın orta, dış ve diz üstü iç kısmını tek başına izole eder."
          },
          "bw_air_squat": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Ana Kalça, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_max",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Kendi vücut ağırlığınla tam çömelip kalkmak, ön bacak ve kalça kaslarını doğal hareket açıklığında çalıştırır."
          },
          "bw_jump_squat": {
                    "primary": "Dış Ön Bacak, Orta Ön Bacak, Ana Kalça, Üst Baldır",
                    "secondary": "İç Ön Bacak, Alt Baldır, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_mid",
                              "legs_glutes_max",
                              "calves_gastroc"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_inner",
                              "calves_soleus",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "legs_calves",
                              "legs_quad_outer",
                              "legs_quad_mid",
                              "legs_glutes_max",
                              "calves_gastroc"
                    ],
                    "isComplex": false,
                    "proof": "Çömelip yukarı doğru patlayıcı sıçramak; ön bacak, ana kalça ve parmak ucundan itiş yapan kalf (baldır) kaslarının patlayıcı liflerini ateşler."
          },
          "lunge_with_twist": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Karın",
                    "secondary": "Yan Kalça, Orta Ön Bacak, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "core_obliques"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "legs_quad_mid",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "core_obliques",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Öne adım atıp çömelirken gövdeyi öndeki bacak yönüne çevirmek; alt vücutta ön bacak ve kalçayı, üst vücutta ise yan karın kaslarını çalıştırır."
          },
          "step_up_press": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Ön Omuz",
                    "secondary": "Yan Kalça, Yan Omuz, Arka Kol Alt Baş, Yan Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "shoulders_side",
                              "triceps_medial",
                              "core_obliques"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "shoulders_front",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Yüksek kutuya tek ayakla çıkarken ön bacak ve ana/yan kalça tüm vücudu yukarı kaldırır; tepede ağırlığı baş üstüne itmek ön ve yan omzu çalıştırır."
          },
          "db_rdl": {
                    "primary": "Arka Bacak, Arka Bacak & Kalça Bağı, Ana Kalça",
                    "secondary": "Alt Sırt & Bel, Ön Kol & Dış Pazı",
                    "subKey": "legs_hamstrings",
                    "primarySubKeys": [
                              "legs_ham_hinge",
                              "legs_ham_chain",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "legs_hamstrings",
                              "legs_glutes",
                              "legs_ham_hinge",
                              "legs_ham_chain",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Dizleri çok az kırıp kalçayı geriye iterek öne eğilmek, arka bacağın üst/uzun kısmını sonuna kadar esnetir ve doğrulurken ana kalça kasıyla birlikte kasar."
          },
          "db_single_leg_rdl": {
                    "primary": "Arka Bacak, Ana Kalça, Yan Kalça, Derin Kalça",
                    "secondary": "Arka Bacak & Kalça Bağı, Alt Sırt & Bel, Yan Karın, Ön Kaval & Bilek",
                    "subKey": "legs_hamstrings",
                    "primarySubKeys": [
                              "legs_ham_hinge",
                              "legs_glutes_max",
                              "legs_glutes_med",
                              "legs_glutes_min"
                    ],
                    "secondarySubKeys": [
                              "legs_ham_chain",
                              "back_lower",
                              "core_obliques",
                              "calves_tibialis"
                    ],
                    "allSubKeys": [
                              "legs_hamstrings",
                              "legs_glutes",
                              "legs_ham_hinge",
                              "legs_glutes_max",
                              "legs_glutes_med",
                              "legs_glutes_min"
                    ],
                    "isComplex": false,
                    "proof": "Tek ayak üzerinde öne eğilip kalkmak arka bacak ve ana kalçayı çalıştırırken, kalçanın yana devrilmesini önlemek için yan kalça ve ayak bileği denge kaslarını yoğun çalıştırır."
          },
          "bb_rdl": {
                    "primary": "Arka Bacak, Arka Bacak & Kalça Bağı, Ana Kalça",
                    "secondary": "Alt Sırt & Bel, Üst Sırt & Trapez, Ön Kol & Dış Pazı",
                    "subKey": "legs_hamstrings",
                    "primarySubKeys": [
                              "legs_ham_hinge",
                              "legs_ham_chain",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "traps",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "legs_hamstrings",
                              "legs_glutes",
                              "legs_ham_hinge",
                              "legs_ham_chain",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Ağır barı bacaklara sürterek kalçayı geriye itmek, arka bacak kaslarının tamamında ve ana kalça kasında en yüksek gerilimi üretir."
          },
          "mach_leg_curl": {
                    "primary": "Diz Büken Arka Bacak",
                    "secondary": "Arka Bacak, Üst Baldır",
                    "subKey": "legs_hamstrings",
                    "primarySubKeys": [
                              "legs_ham_curl"
                    ],
                    "secondarySubKeys": [
                              "legs_ham_hinge",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "legs_hamstrings",
                              "legs_ham_curl"
                    ],
                    "isComplex": false,
                    "proof": "Makinede sadece dizleri bükmek, eğilme hareketlerinde (RDL) tam çalışmayan arka bacağın diz üstü alt kısmını da doğrudan ve izole çalıştırır."
          },
          "bb_deadlift": {
                    "primary": "Ana Kalça, Arka Bacak, Arka Bacak & Kalça Bağı, Alt Sırt & Bel",
                    "secondary": "Dış Ön Bacak, Üst Sırt & Trapez, Orta Sırt, Ön Kol & Dış Pazı, Derin İç Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "legs_ham_chain",
                              "back_lower"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_outer",
                              "traps",
                              "back_mid",
                              "brachialis",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "back_mid",
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "legs_ham_chain",
                              "back_lower"
                    ],
                    "isComplex": false,
                    "proof": "Yerdeki ağır barı ayağa kalkarak kaldırmak; yerden keserken ön bacağı, doğrulurken arka bacak ve ana kalçayı, omurgayı düz tutarken de alt/üst tüm sırtı çalıştırır."
          },
          "bb_hip_thrust": {
                    "primary": "Ana Kalça",
                    "secondary": "Yan Kalça, Arka Bacak & Kalça Bağı",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "legs_ham_chain"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Sırt sehpada ve dizler bükülüyken barı kalçayla yukarı itmek, arka bacağın yük çalmasını engeller ve bütün gücü doğrudan ana kalça kasına verir."
          },
          "bw_glute_bridge": {
                    "primary": "Ana Kalça",
                    "secondary": "Yan Kalça, Arka Bacak & Kalça Bağı",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "legs_ham_chain"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Sırtüstü yatarken dizler bükülü şekilde kalçayı yukarı kaldırıp sıkmak, bele yük bindirmeden doğrudan ana kalça kasını çalıştırır."
          },
          "mach_calf_raise": {
                    "primary": "Üst Baldır, Alt Baldır",
                    "secondary": "Ön Kaval & Bilek",
                    "subKey": "legs_calves",
                    "primarySubKeys": [
                              "calves_gastroc",
                              "calves_soleus"
                    ],
                    "secondarySubKeys": [
                              "calves_tibialis"
                    ],
                    "allSubKeys": [
                              "legs_calves",
                              "calves_gastroc",
                              "calves_soleus"
                    ],
                    "isComplex": false,
                    "proof": "Ayakta kalf makinesinde omuz pedleriyle sabit yük altında tam esneme ve zirve sıkıştırma yapmak, üst ve alt baldır kaslarını en güvenli ve yüksek yükle çalıştırır."
          },
          "db_standing_calf_raise": {
                    "primary": "Üst Baldır, Alt Baldır",
                    "secondary": "Ön Kaval & Bilek",
                    "subKey": "legs_calves",
                    "primarySubKeys": [
                              "calves_gastroc",
                              "calves_soleus"
                    ],
                    "secondarySubKeys": [
                              "calves_tibialis"
                    ],
                    "allSubKeys": [
                              "legs_calves",
                              "calves_gastroc",
                              "calves_soleus"
                    ],
                    "isComplex": false,
                    "proof": "Elde dambılla ayakta parmak ucuna yükselip tepe noktada sıkıştırmak, üst ve alt kalf kaslarını doğrudan çalıştırır."
          },
          "db_lying_leg_curl": {
                    "primary": "Diz Büken Arka Bacak",
                    "secondary": "Arka Bacak, Üst Baldır",
                    "subKey": "legs_hamstrings",
                    "primarySubKeys": [
                              "legs_ham_curl"
                    ],
                    "secondarySubKeys": [
                              "legs_ham_hinge",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "legs_hamstrings",
                              "legs_ham_curl"
                    ],
                    "isComplex": false,
                    "proof": "Yüzüstü yatarken iki ayak arasındaki dambılı kalçaya doğru bükmek, arka bacağın diz büken alt/dış kısmını ve iç kısmını doğrudan çalıştırır."
          },
          "bw_sissy_squat": {
                    "primary": "Orta Ön Bacak, İç Ön Bacak",
                    "secondary": "Dış Ön Bacak, Ön Karın, Üst Baldır",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_mid",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_outer",
                              "core_front",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_quad_mid",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Kalçayı hiç kırmadan dizleri öne verip gövdeyi geriye yatırmak, ön bacağın kalçaya kadar uzanan tam orta kasını maksimum gererek çalıştırır."
          },
          "db_triceps_overhead": {
                    "primary": "Arka Kol Uzun Baş",
                    "secondary": "Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "subKey": "triceps_long",
                    "primarySubKeys": [
                              "triceps_long"
                    ],
                    "secondarySubKeys": [
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "triceps_long"
                    ],
                    "isComplex": false,
                    "proof": "Arka kolun en büyük parçası olan iç/uzun kısım omuzdan başladığı için, ancak kol başın üstüne kaldırıldığında tam gerilir ve maksimum çalışır."
          },
          "db_skullcrusher": {
                    "primary": "Arka Kol Uzun Baş, Arka Kol Dış Baş",
                    "secondary": "Arka Kol Alt Baş",
                    "subKey": "triceps_long",
                    "primarySubKeys": [
                              "triceps_long",
                              "triceps_lateral"
                    ],
                    "secondarySubKeys": [
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "triceps_long",
                              "triceps_lateral"
                    ],
                    "isComplex": false,
                    "proof": "Sırtüstü yatarken dambılları alnına/baş gerisine indirip kaldırmak, arka kolun hem uzun iç kısmını hem de dış kısmını aynı anda yoğun çalıştırır."
          },
          "mach_triceps_pushdown": {
                    "primary": "Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "secondary": "Arka Kol Uzun Baş",
                    "subKey": "triceps_lateral",
                    "primarySubKeys": [
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "secondarySubKeys": [
                              "triceps_long"
                    ],
                    "allSubKeys": [
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "isComplex": false,
                    "proof": "Dirsekleri bel yanında sabit tutup halatı aşağı itmek ve en altta iki yana açmak, arka kolun dış (at nalı) kısmını ve alt kısmını tam sıkıştırır."
          },
          "db_biceps_curl": {
                    "primary": "Pazı İç Baş, Pazı Dış Baş",
                    "secondary": "Ön Kol & Dış Pazı",
                    "subKey": "biceps",
                    "primarySubKeys": [
                              "biceps_short",
                              "biceps_long"
                    ],
                    "secondarySubKeys": [
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "biceps",
                              "biceps_short",
                              "biceps_long"
                    ],
                    "proof": ""
          },
          "db_hammer_curl": {
                    "primary": "Ön Kol & Dış Pazı, Pazı Dış Baş",
                    "secondary": "Pazı İç Baş",
                    "subKey": "biceps",
                    "primarySubKeys": [
                              "brachialis",
                              "biceps_long"
                    ],
                    "secondarySubKeys": [
                              "biceps_short"
                    ],
                    "allSubKeys": [
                              "biceps",
                              "brachialis",
                              "biceps_long"
                    ],
                    "isComplex": false,
                    "proof": "Avuç içleri birbirine bakacak şekilde (çekiç tutuşu) kaldırmak, yükü bicepsin altındaki kol kalınlaştırıcı kasa ve ön kolun üst kısmına kaydırır."
          },
          "db_incline_curl": {
                    "primary": "Pazı Dış Baş",
                    "secondary": "Pazı İç Baş, Ön Kol & Dış Pazı",
                    "subKey": "biceps",
                    "primarySubKeys": [
                              "biceps_long"
                    ],
                    "secondarySubKeys": [
                              "biceps_short",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "biceps",
                              "biceps_long"
                    ],
                    "isComplex": false,
                    "proof": "Eğimli sehpada otururken kolların gövdenin gerisinde kalması, pazının dış/tepe kısmını (uzun baş) hareketin en başında maksimum gerer ve tepe görünümünü büyütür."
          },
          "bb_biceps_curl": {
                    "primary": "Pazı İç Baş, Pazı Dış Baş",
                    "secondary": "Ön Kol & Dış Pazı",
                    "subKey": "biceps",
                    "primarySubKeys": [
                              "biceps_short",
                              "biceps_long"
                    ],
                    "secondarySubKeys": [
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "biceps",
                              "biceps_short",
                              "biceps_long"
                    ],
                    "isComplex": false,
                    "proof": "Düz barla avuç içleri tam yukarı bakarak iki elle ağır kaldırmak, özellikle kolun ön/iç dolgunluğunu veren biceps iç ve dış kısmına en yüksek yükü bindirir."
          },
          "mach_cable_biceps": {
                    "primary": "Pazı İç Baş, Pazı Dış Baş",
                    "secondary": "Ön Kol & Dış Pazı",
                    "subKey": "biceps",
                    "primarySubKeys": [
                              "biceps_short",
                              "biceps_long"
                    ],
                    "secondarySubKeys": [
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "biceps",
                              "biceps_short",
                              "biceps_long"
                    ],
                    "isComplex": false,
                    "proof": "Kablo makarası hareketin en altında da en üstünde de yükü hiç boşaltmadığı için bicepsin iç ve dış kısmında kesintisiz yanma ve gerilim sağlar."
          },
          "db_suitcase_carry": {
                    "primary": "Yan Karın, Derin İç Karın",
                    "secondary": "Yan Kalça, Üst Sırt & Trapez, Ön Kol & Dış Pazı",
                    "subKey": "core_obliques",
                    "primarySubKeys": [
                              "core_obliques",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "traps",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "core_obliques",
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Sadece tek elde ağır dambıl taşırken vücudun o tarafa yatmasını engellemek, ağırlığın tam tersi taraftaki yan karın ve bel yanı kaslarını çok güçlü çalıştırır."
          },
          "db_farmers_walk": {
                    "primary": "Derin İç Karın, Üst Sırt & Trapez, Ön Kol & Dış Pazı",
                    "secondary": "Yan Karın, Yan Kalça, Alt Sırt & Bel, Üst Baldır",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_deep",
                              "traps",
                              "brachialis"
                    ],
                    "secondarySubKeys": [
                              "core_obliques",
                              "legs_glutes_med",
                              "back_lower",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "back_mid",
                              "biceps",
                              "core_deep",
                              "traps",
                              "brachialis"
                    ],
                    "isComplex": false,
                    "proof": "İki elde ağır yükle dik yürümek; karnı içe tutan derin korse kasını, yan karınları, omuzları taşıyan üst trapezi ve el/bilek kavrama kaslarını aynı anda çalıştırır."
          },
          "db_russian_twist": {
                    "primary": "Yan Karın",
                    "secondary": "Ön Karın, Derin İç Karın",
                    "subKey": "core_obliques",
                    "primarySubKeys": [
                              "core_obliques"
                    ],
                    "secondarySubKeys": [
                              "core_front",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "core_obliques"
                    ],
                    "isComplex": false,
                    "proof": "Yerde gövde hafif geriye yatıkken ağırlığı sağa sola döndürmek, belin yanlarındaki dönüş kaslarını (yan karın) doğrudan çalıştırır."
          },
          "mach_cable_woodchopper": {
                    "primary": "Yan Karın, Derin İç Karın",
                    "secondary": "Ön Karın, Ön Omuz, Yan Kalça",
                    "subKey": "core_obliques",
                    "primarySubKeys": [
                              "core_obliques",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "core_front",
                              "shoulders_front",
                              "legs_glutes_med"
                    ],
                    "allSubKeys": [
                              "core_obliques",
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Kabloyu odun keser gibi çapraz çekip gövdeyi döndürmek, sağ ve sol yan karın kaslarını ile derin iç karın kasını güçlü şekilde çalıştırır."
          },
          "half_kneeling_plate_chop": {
                    "primary": "Yan Karın, Derin İç Karın",
                    "secondary": "Ön Karın, Ön Omuz, Yan Kalça",
                    "subKey": "core_obliques",
                    "primarySubKeys": [
                              "core_obliques",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "core_front",
                              "shoulders_front",
                              "legs_glutes_med"
                    ],
                    "allSubKeys": [
                              "core_obliques",
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": true,
                    "proof": "Tek diz yerde durmak bacaklardan hız almayı engeller; plakayı çapraz savurup durdurmak sadece yan karın ve derin kor kaslarının gücüyle yapılır."
          },
          "bw_plank": {
                    "primary": "Derin İç Karın, Ön Karın",
                    "secondary": "Yan Karın, Ön Omuz",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_deep",
                              "core_front"
                    ],
                    "secondarySubKeys": [
                              "core_obliques",
                              "shoulders_front"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Dirsekler üzerinde vücudu düz tutarken belin çukurlaşmasına direnmek, karnı içe çeken derin korse kasını ve ön karın kaslarını baştan sona kilitler."
          },
          "bw_hollow_body": {
                    "primary": "Ön Karın, Derin İç Karın",
                    "secondary": "Yan Karın, Orta Ön Bacak",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_front",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "core_obliques",
                              "legs_quad_mid"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Sırtüstü yatarken beli yere tam yapıştırıp kol ve bacakları yerden kesmek, ön karın (üst ve alt) ile derin iç karın kaslarını en zorlu açıda çalıştırır."
          },
          "bw_hanging_knee_raise": {
                    "primary": "Ön Karın",
                    "secondary": "Derin İç Karın, Orta Ön Bacak, Ön Kol & Dış Pazı, Kanatlar",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_front"
                    ],
                    "secondarySubKeys": [
                              "core_deep",
                              "legs_quad_mid",
                              "brachialis",
                              "back_lats"
                    ],
                    "allSubKeys": [
                              "core_front"
                    ],
                    "isComplex": false,
                    "proof": "Barda asılıyken dizleri göğse doğru çekip kalçayı yukarı kıvırmak, özellikle göbek deliğinin altındaki alt karın kaslarını doğrudan çalıştırır."
          },
          "bw_mountain_climber": {
                    "primary": "Ön Karın, Derin İç Karın",
                    "secondary": "Orta Ön Bacak, Ön Omuz, Yan Karın",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_front",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "shoulders_front",
                              "core_obliques"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Şınav duruşunda gövdeyi bozmadan dizleri hızla karna çekmek, ön/alt karın ve ön kalça kaslarını çalıştırırken nabzı hızla yükseltir."
          },
          "bear_crawl_pull_through": {
                    "primary": "Derin İç Karın, Yan Karın",
                    "secondary": "Ön Karın, Ön Omuz, Kanatlar, Orta Ön Bacak",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_deep",
                              "core_obliques"
                    ],
                    "secondarySubKeys": [
                              "core_front",
                              "shoulders_front",
                              "back_lats",
                              "legs_quad_mid"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "core_obliques",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Dizler yerden 2-3 parmak havadayken tek elle ağırlığı alttan çekmek, gövdenin sağa sola devrilmesini önleyen derin iç karın ve yan karın kaslarını yoğun çalıştırır."
          },
          "cross_body_carry": {
                    "primary": "Yan Karın, Derin İç Karın, Ön Omuz",
                    "secondary": "Yan Omuz, Üst Sırt & Trapez, Ön Kol & Dış Pazı, Yan Kalça",
                    "subKey": "core_obliques",
                    "primarySubKeys": [
                              "core_obliques",
                              "core_deep",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "traps",
                              "brachialis",
                              "legs_glutes_med"
                    ],
                    "allSubKeys": [
                              "core_obliques",
                              "core_front",
                              "shoulders_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Bir dambılı baş üstünde, diğerini yanda tutarak yürümek; hem üstteki omuz denge kaslarını hem de çapraz yan karın ve bel kaslarını çalıştırır."
          },
          "db_swing": {
                    "primary": "Ana Kalça, Arka Bacak & Kalça Bağı, Arka Bacak",
                    "secondary": "Alt Sırt & Bel, Derin İç Karın, Ön Kol & Dış Pazı",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_chain",
                              "legs_ham_hinge"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "core_deep",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "legs_glutes_max",
                              "legs_ham_chain",
                              "legs_ham_hinge"
                    ],
                    "isComplex": false,
                    "proof": "Dambılı bacak arasından kalçayı ileri patlatarak savurmak, ana kalça kasını ve arka bacakları güçlü çalıştırırken en üst noktada karın ve beli kilitler."
          },
          "kb_swing": {
                    "primary": "Ana Kalça, Arka Bacak & Kalça Bağı, Arka Bacak",
                    "secondary": "Alt Sırt & Bel, Derin İç Karın, Ön Kol & Dış Pazı",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_chain",
                              "legs_ham_hinge"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "core_deep",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "legs_glutes_max",
                              "legs_ham_chain",
                              "legs_ham_hinge"
                    ],
                    "isComplex": false,
                    "proof": "Kettlebell'i kollarla değil kalçanın ileri patlamasıyla savurmak, ana kalça, arka bacak ve alt sırt zincirinin tamamını çalıştırır."
          },
          "kb_clean": {
                    "primary": "Ana Kalça, Arka Bacak, Üst Sırt & Trapez, Orta Sırt",
                    "secondary": "Alt Sırt & Bel, Ön Kol & Dış Pazı, Pazı Dış Baş, Derin İç Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "traps",
                              "back_mid"
                    ],
                    "secondarySubKeys": [
                              "back_lower",
                              "brachialis",
                              "biceps_long",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "back_mid",
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "traps"
                    ],
                    "isComplex": true,
                    "proof": "Ağırlığı kalça gücüyle yerden hızlandırıp dirseği bükerek omuz önüne (göğüs hizasına) almak; kalça, arka bacak, orta/üst sırt ve bicepsleri birlikte çalıştırır."
          },
          "kb_half_snatch": {
                    "primary": "Ana Kalça, Arka Bacak, Ön Omuz",
                    "secondary": "Yan Omuz, Üst Sırt & Trapez, Alt Sırt & Bel, Dış Ön Bacak, Arka Kol Alt Baş, Yan Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "traps",
                              "back_lower",
                              "legs_quad_outer",
                              "triceps_medial",
                              "core_obliques"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "shoulders_front",
                              "legs_glutes_max",
                              "legs_ham_hinge"
                    ],
                    "isComplex": true,
                    "proof": "Kettlebell'i bacak arasından tek hamlede baş üstüne fırlatıp kilitlemek; alt vücutta kalça ve arka bacağı, üstte ise sırt, omuz ve karın kaslarını çalıştırır."
          },
          "db_snatch": {
                    "primary": "Ana Kalça, Arka Bacak, Ön Omuz",
                    "secondary": "Yan Omuz, Üst Sırt & Trapez, Alt Sırt & Bel, Dış Ön Bacak, Arka Kol Alt Baş, Derin İç Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "traps",
                              "back_lower",
                              "legs_quad_outer",
                              "triceps_medial",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "shoulders_front",
                              "legs_glutes_max",
                              "legs_ham_hinge"
                    ],
                    "isComplex": true,
                    "proof": "Yerdeki dambılı bacak ve kalça patlamasıyla tek hamlede baş üstüne çekip kilitlemek; kalça, arka/ön bacak, üst sırt ve omuzları patlayıcı çalıştırır."
          },
          "kb_windmill": {
                    "primary": "Yan Karın, Yan Kalça, Derin Kalça",
                    "secondary": "Ön Omuz, Arka Omuz, Arka Bacak, Derin İç Karın",
                    "subKey": "core_obliques",
                    "primarySubKeys": [
                              "core_obliques",
                              "legs_glutes_med",
                              "legs_glutes_min"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "shoulders_rear",
                              "legs_ham_hinge",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "core_obliques",
                              "legs_glutes",
                              "legs_glutes_med",
                              "legs_glutes_min"
                    ],
                    "isComplex": true,
                    "proof": "Ağırlık baş üstünde havadayken kalçayı yana itip yere doğru eğilmek, yan karın ve bel yanlarını çalıştırırken arka bacağı esnetir ve omzu dengede tutar."
          },
          "kb_turkish_getup": {
                    "primary": "Derin İç Karın, Ön Karın, Yan Karın, Ön Omuz",
                    "secondary": "Yan Omuz, Ana Kalça, Yan Kalça, Dış Ön Bacak, Arka Kol Alt Baş",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_deep",
                              "core_front",
                              "core_obliques",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "legs_glutes_max",
                              "legs_glutes_med",
                              "legs_quad_outer",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "core_obliques",
                              "shoulders_front",
                              "core_deep"
                    ],
                    "isComplex": true,
                    "proof": "Ağırlığı baş üstünde tutarak yerden adım adım ayağa kalkıp geri yatmak; omuz denge kaslarını, tüm karın/bel çevresini ve bacak/kalça kaslarını tek harekette birleştirir."
          },
          "db_thruster": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın, Üst Sırt & Trapez",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "core_deep",
                              "traps"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "shoulders_front",
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Dambıllarla tam çömelip kalkarken kazandığın hızla ağırlığı kesintisiz baş üstüne itmek; ön bacak, kalça, ön/yan omuz ve tricepsi aynı anda çalıştırır."
          },
          "kb_thruster": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın, Üst Sırt & Trapez",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "core_deep",
                              "traps"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "shoulders_front",
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Kettlebell'lerle derin çömelip kalkarken baş üstüne pres yapmak; ön bacak, kalça ve omuz kaslarını yüksek nabızla çalıştırır."
          },
          "bb_thruster": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
                    "secondary": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın, Üst Sırt & Trapez",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "triceps_lateral",
                              "triceps_medial",
                              "core_deep",
                              "traps"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "shoulders_front",
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Omuzda barla tam çömelme (Front Squat) ve kalkarken baş üstü itiş; ön bacak, kalça, omuz ve tricepsi ağır yük altında birleştirir."
          },
          "db_clean_and_press": {
                    "primary": "Ana Kalça, Arka Bacak, Ön Omuz",
                    "secondary": "Yan Omuz, Üst Sırt & Trapez, Orta Sırt, Arka Kol Dış Baş, Arka Kol Alt Baş, Ön Kol & Dış Pazı, Derin İç Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "traps",
                              "back_mid",
                              "triceps_lateral",
                              "triceps_medial",
                              "brachialis",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "shoulders_front",
                              "legs_glutes_max",
                              "legs_ham_hinge"
                    ],
                    "isComplex": true,
                    "proof": "İlk kısımda kalça ve sırt gücüyle omuza alınan dambıllar, ikinci kısımda omuz ve triceps gücüyle baş üstüne itilir."
          },
          "db_manmaker": {
                    "primary": "Orta Göğüs, Kanatlar, Dış Ön Bacak, Ana Kalça, Ön Omuz",
                    "secondary": "Orta Sırt, Yan Omuz, Arka Kol Alt Baş, Yan Karın, Derin İç Karın",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid",
                              "back_lats",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "shoulders_side",
                              "triceps_medial",
                              "core_obliques",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "chest_mid",
                              "back_lats",
                              "legs_quad",
                              "legs_glutes",
                              "shoulders_front",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Şınav + sağ/sol sırt çekişi + çömelerek omuza alma + baş üstü pres birleşimi; göğüs, sırt, bacak, kalça, omuz ve karın kaslarının tamamını çalıştırır."
          },
          "bb_hang_power_clean": {
                    "primary": "Ana Kalça, Arka Bacak, Üst Sırt & Trapez, Orta Sırt",
                    "secondary": "Dış Ön Bacak, Alt Sırt & Bel, Üst Baldır, Ön Kol & Dış Pazı, Derin İç Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "traps",
                              "back_mid"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_outer",
                              "back_lower",
                              "calves_gastroc",
                              "brachialis",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "back_mid",
                              "legs_glutes_max",
                              "legs_ham_hinge",
                              "traps"
                    ],
                    "isComplex": true,
                    "proof": "Diz üstünden barı kalça patlaması ve omuz çekişiyle bir anda ön omuzlara almak; kalça, arka bacak ve üst sırt (trapez) kaslarında patlayıcı güç üretir."
          },
          "bb_landmine_squat_press": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak, Ön Omuz, Üst Göğüs",
                    "secondary": "Ana Kalça, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "shoulders_front",
                              "chest_upper"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_max",
                              "triceps_lateral",
                              "triceps_medial",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "shoulders_front",
                              "chest_upper",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": true,
                    "proof": "Barın ucunu göğüste tutup çömelmek ön bacak ve kalçayı, kalkarken ileri-yukarı doğru itmek ise ön omuz ve üst göğsü omuzları zorlamadan çalıştırır."
          },
          "bw_burpee": {
                    "primary": "Dış Ön Bacak, Ana Kalça, Orta Göğüs",
                    "secondary": "Ön Omuz, Arka Kol Alt Baş, Ön Karın, Üst Baldır",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "chest_mid"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "triceps_medial",
                              "core_front",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "chest_mid",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Yere inip şınav çekmek göğüs, omuz ve tricepsi; ayakları karna çekip yukarı sıçramak ise karın, ön bacak, kalça ve kalfları çalıştırır."
          },
          "db_pullover_to_halo": {
                    "primary": "Kanatlar, Arka Omuz, Yan Omuz, Ön Karın",
                    "secondary": "Orta Göğüs, Arka Kol Uzun Baş, Üst Sırt & Trapez, Derin İç Karın",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats",
                              "shoulders_rear",
                              "shoulders_side",
                              "core_front"
                    ],
                    "secondarySubKeys": [
                              "chest_mid",
                              "triceps_long",
                              "traps",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "back_lats",
                              "shoulders_rear",
                              "shoulders_side",
                              "core_front"
                    ],
                    "isComplex": true,
                    "proof": "Yatarken ağırlığı baş gerisinden çekmek kanat ve göğüs kafesini çalıştırır; ardından baş etrafında döndürmek (Halo) arka/yan omuz ve omuz iç kaslarını açar."
          },
          "db_seesaw_lunge": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Kalça",
                    "secondary": "Orta Ön Bacak, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "legs_glutes_med"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "legs_glutes_med"
                    ],
                    "isComplex": true,
                    "proof": "Bir ayak yerde sabitken diğer ayakla hiç durmadan bir ileri bir geri lunge yapmak, sabit kalan bacağın ön kısmını ve kalçasını aralıksız çalıştırır."
          },
          "db_clean_squat_press": {
                    "primary": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
                    "secondary": "Yan Omuz, Arka Bacak, Üst Sırt & Trapez, Arka Kol Alt Baş, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "legs_ham_hinge",
                              "traps",
                              "triceps_medial",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "shoulders_front",
                              "legs_quad_outer",
                              "legs_quad_inner",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Clean aşamasında arka bacak ve kalça patlayıcı gücü üretir; Front Squat aşamasında ön bacak ve kalça çömelmeyi yönetir; Push Press aşamasında ise omuzlar ana itişi yaparken karın/bel, trapez, triceps, ön kol ve kalflar hareketi destekler."
          },
          "db_rdl_to_high_pull": {
                    "primary": "Arka Bacak, Ana Kalça, Üst Sırt & Trapez, Yan Omuz",
                    "secondary": "Arka Bacak & Kalça Bağı, Orta Sırt, Arka Omuz, Alt Sırt & Bel, Ön Kol & Dış Pazı",
                    "subKey": "legs_hamstrings",
                    "primarySubKeys": [
                              "legs_ham_hinge",
                              "legs_glutes_max",
                              "traps",
                              "shoulders_side"
                    ],
                    "secondarySubKeys": [
                              "legs_ham_chain",
                              "back_mid",
                              "shoulders_rear",
                              "back_lower",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "legs_hamstrings",
                              "legs_glutes",
                              "back_mid",
                              "shoulders_side",
                              "legs_ham_hinge",
                              "legs_glutes_max",
                              "traps"
                    ],
                    "isComplex": true,
                    "proof": "RDL (öne eğilme) fazında arka bacak ve ana kalça kası yükü çekerken; High Pull (yukarı çekiş) fazında omuz silkme ile trapezler ve yan/ön omuzlar ağırlığı göğüs/çene hizasına ivmelendirir."
          },
          "db_swing_to_goblet_squat": {
                    "primary": "Ana Kalça, Arka Bacak & Kalça Bağı, Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Arka Bacak, Alt Sırt & Bel, Derin İç Karın, Ön Kol & Dış Pazı",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_max",
                              "legs_ham_chain",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "legs_ham_hinge",
                              "back_lower",
                              "core_deep",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_hamstrings",
                              "legs_quad",
                              "legs_glutes_max",
                              "legs_ham_chain",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": true,
                    "proof": "İlk savuruşta (Swing) kalça ve arka bacak çalışır; ağırlığı göğüste yakalayıp çömeldiğinde (Goblet Squat) ise ön bacak devreye girer."
          },
          "db_lunge_to_curl_press": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Ön Kol & Dış Pazı, Pazı Dış Baş, Ön Omuz",
                    "secondary": "Yan Omuz, Yan Kalça, Arka Kol Alt Baş, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "brachialis",
                              "biceps_long",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "legs_glutes_med",
                              "triceps_medial",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "biceps",
                              "shoulders_front",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "brachialis",
                              "biceps_long"
                    ],
                    "isComplex": true,
                    "proof": "Adım alıp çömelirken ön bacak ve kalça, kalkarken dambılı büktüğünde biceps, baş üstüne ittiğinde ise ön/yan omuz ve triceps sırasıyla çalışır."
          },
          "db_gorilla_row_to_clean": {
                    "primary": "Kanatlar, Orta Sırt, Üst Sırt & Trapez, Ana Kalça",
                    "secondary": "Arka Bacak, Alt Sırt & Bel, Pazı Dış Baş, Ön Kol & Dış Pazı, Derin İç Karın",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats",
                              "back_mid",
                              "traps",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_ham_hinge",
                              "back_lower",
                              "biceps_long",
                              "brachialis",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "back_lats",
                              "back_mid",
                              "legs_glutes",
                              "traps",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Row aşamasında kanatlar ve üst sırt/kürek kemikleri dambılı yerden çeker; Clean aşamasında ise kalça patlaması ve trapez silkmesiyle ağırlık omuz hizasına alınır."
          },
          "db_floor_press_to_bridge": {
                    "primary": "Orta Göğüs, Ana Kalça, Arka Kol Dış Baş, Arka Kol Alt Baş",
                    "secondary": "Ön Omuz, Arka Bacak & Kalça Bağı, Derin İç Karın",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid",
                              "legs_glutes_max",
                              "triceps_lateral",
                              "triceps_medial"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "legs_ham_chain",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "chest_mid",
                              "legs_glutes",
                              "triceps_lateral",
                              "legs_glutes_max",
                              "triceps_medial"
                    ],
                    "isComplex": true,
                    "proof": "Kalçayı yukarı kaldırıp sıkarak (ana kalça) tutarken aynı anda dambılları yukarı preslemek (orta göğüs ve triceps) alt ve üst vücudu birlikte çalıştırır."
          },
          "db_step_back_lunge_to_knee_drive": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Ön Omuz",
                    "secondary": "Orta Ön Bacak, Yan Kalça, Yan Karın, Arka Kol Alt Baş",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "shoulders_front"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "legs_glutes_med",
                              "core_obliques",
                              "triceps_medial"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "shoulders_front",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Geri lunge'dan tek ayak üzerinde yükselip arka dizi yukarı çekerken aynı anda tek kol omuz presi yapmak; ön bacak, kalça, ön kalça ve omzu birlikte çalıştırır."
          },
          "bw_inchworm_to_pushup": {
                    "primary": "Orta Göğüs, Ön Karın, Derin İç Karın",
                    "secondary": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Arka Bacak",
                    "subKey": "chest_mid",
                    "primarySubKeys": [
                              "chest_mid",
                              "core_front",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "triceps_lateral",
                              "triceps_medial",
                              "legs_ham_hinge"
                    ],
                    "allSubKeys": [
                              "chest_mid",
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": true,
                    "proof": "Eller üzerinde yürürken ve şınav çekerken göğüs, ön omuz, triceps ve karın (core) ana işi üstlenir; başlangıç ve bitişteki eğilme/yürüme fazında arka bacaklar esner, bel/kalça ve üst sırt/kanatlar duruşu korur."
          },
          "db_rotational_lunge_chop": {
                    "primary": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Karın",
                    "secondary": "Ön Omuz, Yan Kalça, Derin İç Karın",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "core_obliques"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "legs_glutes_med",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "core_obliques",
                              "legs_quad_inner",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": true,
                    "proof": "Ters lunge adımından doğrulurken gövdeyi 180° çevirip dambılı çapraz yukarı savurmak; ön bacak ve ana kalçayla birlikte yan karın kaslarını patlayıcı çalıştırır."
          },
          "db_rotational_gorilla_row": {
                    "primary": "Kanatlar, Orta Sırt",
                    "secondary": "Yan Karın, Arka Omuz, Alt Sırt & Bel, Pazı Dış Baş, Ön Kol & Dış Pazı",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats",
                              "back_mid"
                    ],
                    "secondarySubKeys": [
                              "core_obliques",
                              "shoulders_rear",
                              "back_lower",
                              "biceps_long",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "back_lats",
                              "back_mid"
                    ],
                    "isComplex": false,
                    "proof": "Eğik duruşta dambılı çekerken gövdeyi de hafifçe döndürmek, kanat ve orta sırt çekişine yan karın (oblik) ve arka omuz kaslarını dahil eder."
          },
          "db_single_arm_rear_delt_row": {
                    "primary": "Arka Omuz",
                    "secondary": "Orta Sırt, Ön Kol & Dış Pazı",
                    "subKey": "shoulders_rear",
                    "primarySubKeys": [
                              "shoulders_rear"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "shoulders_rear"
                    ],
                    "isComplex": false,
                    "proof": "Öne eğilip dirseği vücuda yapıştırmak yerine yana doğru geniş açıyla çekmek, yükü kanatlardan alıp doğrudan arka omuza ve kürek kemiği çevresine verir."
          },
          "db_high_pull_cuban_rotation": {
                    "primary": "Arka Omuz, Orta Sırt, Üst Sırt & Trapez",
                    "secondary": "Yan Omuz, Alt Sırt & Bel, Ön Kol & Dış Pazı",
                    "subKey": "shoulders_rear",
                    "primarySubKeys": [
                              "shoulders_rear",
                              "back_mid",
                              "traps"
                    ],
                    "secondarySubKeys": [
                              "shoulders_side",
                              "back_lower",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "shoulders_rear",
                              "back_mid",
                              "traps"
                    ],
                    "isComplex": true,
                    "proof": "Eğilerek yapılan yüksek çekiş ve kolları yukarı döndürme (Cuban rotasyon) hareketinde omuz iç denge kasları (rotator manşet), arka omuz, trapez ve kürek kemiği kasları ana yükü çeker; eğik duruşta bel, karın ve arka bacak/kalça vücudu sabit tutar."
          },
          "db_dumbbell_shrug_burnout": {
                    "primary": "Üst Sırt & Trapez",
                    "secondary": "Orta Sırt, Ön Kol & Dış Pazı",
                    "subKey": "traps",
                    "primarySubKeys": [
                              "traps"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "brachialis"
                    ],
                    "allSubKeys": [
                              "traps"
                    ],
                    "isComplex": false,
                    "proof": "Kolları bükmeden omuzları kulaklara doğru yukarı çekip sıkmak, doğrudan boyun iki yanındaki üst trapez kaslarını çalıştırır."
          },
          "db_quadruped_external_rotation": {
                    "primary": "Arka Omuz",
                    "secondary": "Orta Sırt, Derin İç Karın",
                    "subKey": "shoulders_rear",
                    "primarySubKeys": [
                              "shoulders_rear"
                    ],
                    "secondarySubKeys": [
                              "back_mid",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "shoulders_rear"
                    ],
                    "isComplex": false,
                    "proof": "Dört ayak üzerinde tek kolu yana açıp döndürmek arka omuz ve omuz iç kaslarını çalıştırırken, üç uzuv üstünde düz kalmak karın ve kürek kemiği kaslarını dengeler."
          },
          "bw_jumping_jack": {
                    "primary": "Üst Baldır, Alt Baldır, Yan Omuz, Yan Kalça",
                    "secondary": "Üst Sırt & Trapez, Derin İç Karın",
                    "subKey": "legs_calves",
                    "primarySubKeys": [
                              "calves_gastroc",
                              "calves_soleus",
                              "shoulders_side",
                              "legs_glutes_med"
                    ],
                    "secondarySubKeys": [
                              "traps",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_calves",
                              "shoulders_side",
                              "legs_glutes",
                              "calves_gastroc",
                              "calves_soleus",
                              "legs_glutes_med"
                    ],
                    "isComplex": false,
                    "proof": "Zıplayarak bacakları ve kolları açıp kapamak; parmak ucunda sıçrama ile kalfları, kolları yukarı kaldırma ile yan omuzları, bacak açma ile yan kalça ve iç bacağı çalıştırır."
          },
          "bw_high_knees": {
                    "primary": "Ön Karın, Orta Ön Bacak, Üst Baldır",
                    "secondary": "Alt Baldır, Yan Kalça",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_front",
                              "legs_quad_mid",
                              "calves_gastroc"
                    ],
                    "secondarySubKeys": [
                              "calves_soleus",
                              "legs_glutes_med"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "legs_quad",
                              "legs_calves",
                              "legs_quad_mid",
                              "calves_gastroc"
                    ],
                    "isComplex": false,
                    "proof": "Olduğun yerde dizleri hızla bel hizasına çekerek koşmak; bacağı yukarı çeken ön kalça ve alt karın kasları ile yerden sıçrayan kalfları çalıştırır."
          },
          "bw_jump_rope": {
                    "primary": "Üst Baldır, Alt Baldır, Ön Kaval & Bilek",
                    "secondary": "Ön Kol & Dış Pazı, Yan Omuz, Derin İç Karın",
                    "subKey": "legs_calves",
                    "primarySubKeys": [
                              "calves_gastroc",
                              "calves_soleus",
                              "calves_tibialis"
                    ],
                    "secondarySubKeys": [
                              "brachialis",
                              "shoulders_side",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_calves",
                              "calves_gastroc",
                              "calves_soleus",
                              "calves_tibialis"
                    ],
                    "isComplex": false,
                    "proof": "Parmak ucunda ritmik sıçramak doğrudan üst ve alt kalf (baldır) ile ayak bileği kaslarını, ip çevirme hareketi ise ön kol ve omuzları çalıştırır."
          },
          "bw_butt_kicks": {
                    "primary": "Diz Büken Arka Bacak, Üst Baldır, Alt Baldır",
                    "secondary": "Ana Kalça, Derin İç Karın",
                    "subKey": "legs_hamstrings",
                    "primarySubKeys": [
                              "legs_ham_curl",
                              "calves_gastroc",
                              "calves_soleus"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_max",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_hamstrings",
                              "legs_calves",
                              "legs_ham_curl",
                              "calves_gastroc",
                              "calves_soleus"
                    ],
                    "isComplex": false,
                    "proof": "Koşarken topukları hızla kalçaya vurmak dizleri büken arka bacak kaslarını, parmak ucunda yaylanmak ise kalf (baldır) kaslarını çalıştırır."
          },
          "bw_skater_jumps": {
                    "primary": "Yan Kalça, Ana Kalça, Dış Ön Bacak",
                    "secondary": "Üst Baldır, Ön Kaval & Bilek, Yan Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_med",
                              "legs_glutes_max",
                              "legs_quad_outer"
                    ],
                    "secondarySubKeys": [
                              "calves_gastroc",
                              "calves_tibialis",
                              "core_obliques"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_quad",
                              "legs_glutes_med",
                              "legs_glutes_max",
                              "legs_quad_outer"
                    ],
                    "isComplex": false,
                    "proof": "Buz patencisi gibi sağa ve sola tek ayak üstüne sıçramak; yana itiş yapan yan kalça, ana kalça ve ön bacak kaslarını patlayıcı çalıştırır."
          },
          "bw_plank_jacks": {
                    "primary": "Derin İç Karın, Ön Karın",
                    "secondary": "Yan Kalça, Ön Omuz, Üst Baldır",
                    "subKey": "core_front",
                    "primarySubKeys": [
                              "core_deep",
                              "core_front"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "shoulders_front",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "core_front",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Şınav/Plank duruşunda beli düşürmeden ayakları zıplayarak açıp kapamak; ön/derin karın kaslarını, omuzları ve yan kalça/iç bacak kaslarını çalıştırır."
          },
          "bw_squat_thrust": {
                    "primary": "Dış Ön Bacak, Ana Kalça, Ön Karın, Derin İç Karın",
                    "secondary": "Ön Omuz, Orta Göğüs, Üst Baldır",
                    "subKey": "legs_quad",
                    "primarySubKeys": [
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "core_front",
                              "core_deep"
                    ],
                    "secondarySubKeys": [
                              "shoulders_front",
                              "chest_mid",
                              "calves_gastroc"
                    ],
                    "allSubKeys": [
                              "legs_quad",
                              "legs_glutes",
                              "core_front",
                              "legs_quad_outer",
                              "legs_glutes_max",
                              "core_deep"
                    ],
                    "isComplex": false,
                    "proof": "Çömelip elleri yere koyarak ayakları geriye fırlatmak ve tekrar toplayıp ayağa kalkmak; ön bacak, kalça ve karın (core) kaslarını birlikte çalıştırır."
          },
          "bw_lateral_shuffle": {
                    "primary": "Yan Kalça, Dış Ön Bacak, İç Ön Bacak",
                    "secondary": "Üst Baldır, Ön Kaval & Bilek, Derin İç Karın",
                    "subKey": "legs_glutes",
                    "primarySubKeys": [
                              "legs_glutes_med",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "secondarySubKeys": [
                              "calves_gastroc",
                              "calves_tibialis",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_glutes",
                              "legs_quad",
                              "legs_glutes_med",
                              "legs_quad_outer",
                              "legs_quad_inner"
                    ],
                    "isComplex": false,
                    "proof": "Dizler hafif bükülü alçak duruşta sağa sola hızlı adımlamak; sürekli bükülü kalan ön bacağı, yana itiş yapan yan kalçayı ve iç bacakları çalıştırır."
          },
          "cond_indoor_row": {
                    "primary": "Kanatlar, Orta Sırt, Dış Ön Bacak, Ana Kalça",
                    "secondary": "Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı, Arka Bacak, Ön Karın",
                    "subKey": "back_lats",
                    "primarySubKeys": [
                              "back_lats",
                              "back_mid",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "shoulders_rear",
                              "biceps_long",
                              "brachialis",
                              "legs_ham_hinge",
                              "core_front"
                    ],
                    "allSubKeys": [
                              "back_lats",
                              "back_mid",
                              "legs_quad",
                              "legs_glutes",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Kürek ergometresinde itiş fazının %60'ı bacak ve kalça itişinden, %20'si gövde menteşesinden, %20'si ise kanat, orta sırt ve kol çekişinden üretilir."
          },
          "cond_walking": {
                    "primary": "Üst Baldır, Alt Baldır, Dış Ön Bacak, Ana Kalça",
                    "secondary": "Yan Kalça, Ön Kaval & Bilek, Arka Bacak, Derin İç Karın",
                    "subKey": "legs_calves",
                    "primarySubKeys": [
                              "calves_gastroc",
                              "calves_soleus",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_glutes_med",
                              "calves_tibialis",
                              "legs_ham_hinge",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_calves",
                              "legs_quad",
                              "legs_glutes",
                              "calves_gastroc",
                              "calves_soleus",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Tempolu ve eğimli yürüyüş; her adımda ayak bileği itişiyle kalfları, diz ve kalça açılımıyla ön bacak ile kalça kaslarını aerobik dayanıklılık altında çalıştırır."
          },
          "cond_running": {
                    "primary": "Üst Baldır, Alt Baldır, Arka Bacak, Dış Ön Bacak, Ana Kalça",
                    "secondary": "Orta Ön Bacak, Yan Kalça, Ön Kaval & Bilek, Derin İç Karın",
                    "subKey": "legs_calves",
                    "primarySubKeys": [
                              "calves_gastroc",
                              "calves_soleus",
                              "legs_ham_hinge",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "secondarySubKeys": [
                              "legs_quad_mid",
                              "legs_glutes_med",
                              "calves_tibialis",
                              "core_deep"
                    ],
                    "allSubKeys": [
                              "legs_calves",
                              "legs_hamstrings",
                              "legs_quad",
                              "legs_glutes",
                              "calves_gastroc",
                              "calves_soleus",
                              "legs_ham_hinge",
                              "legs_quad_outer",
                              "legs_glutes_max"
                    ],
                    "isComplex": false,
                    "proof": "Koşu sırasında yere temas ve itiş fazı kalf, arka bacak ve kalçayı yüksek elastik gerilimle yüklerken, tek ayak üzerindeki denge fazı yan kalça ve core kaslarını çalıştırır."
          }
};

        const STUDIO_SUB_REGIONS = {
            chest: [
                { key: 'chest_upper', name: 'Üst Göğüs' },
                { key: 'chest_mid', name: 'Orta Göğüs' },
                { key: 'chest_lower', name: 'Alt Göğüs' }
            ],
            shoulders: [
                { key: 'shoulders_front', name: 'Ön Omuz' },
                { key: 'shoulders_side', name: 'Yan Omuz' },
                { key: 'shoulders_rear', name: 'Arka Omuz' }
            ],
            back: [
                { key: 'back_lats', name: 'Kanat (Genişlik)' },
                { key: 'back_mid', name: 'Orta Sırt (Kalınlık)' }
            ],
            quads: [
                { key: 'legs_quad', name: 'Ön Bacak' }
            ],
            hamstrings: [
                { key: 'legs_hamstrings', name: 'Arka Bacak' }
            ],
            glutes: [
                { key: 'legs_glutes', name: 'Kalça' }
            ],
            triceps: [
                { key: 'triceps_long', name: 'Arka Kol (Uzun Kısım)' },
                { key: 'triceps_lateral', name: 'Arka Kol (Dış Kısım)' }
            ],
            biceps: [
                { key: 'biceps', name: 'Pazı & Ön Kol' }
            ],
            core: [
                { key: 'core_front', name: 'Ön Karın' },
                { key: 'core_obliques', name: 'Yan Karın' }
            ],
            calves: [
                { key: 'legs_calves', name: 'Baldır' }
            ]
        };

        function getExerciseAnatomy(ex) {
            if (!ex) return { primary: 'Kas Grubu', secondary: '', subKey: '' };
            const id = ex.id || ex.exId;
            if (EXERCISE_ANATOMY_MAP[id]) {
                return EXERCISE_ANATOMY_MAP[id];
            }
            const pNames = (ex.primaryMuscles || []).map(m => (typeof STUDIO_REGION_MAP !== 'undefined' && STUDIO_REGION_MAP[m]?.name) || m).join(', ');
            const sNames = (ex.secondaryMuscles || []).map(m => (typeof STUDIO_REGION_MAP !== 'undefined' && STUDIO_REGION_MAP[m]?.name) || m).join(', ');
            return {
                primary: pNames || ex.muscle || 'Kas Grubu',
                secondary: sNames || '',
                subKey: (ex.primaryMuscles && ex.primaryMuscles[0]) || 'general'
            };
        }

        // CUSTOM ROUTINE BUILDER STATE
        let customRoutineState = {
            title: "Özel Çelik Programım",
            rest: 60,
            exercises: [] // Array of { exId, sets: 3, reps: '8-12', weight: '' }
        };

        let studioState = {
            mode: 'full_body', // 'full_body' or 'split'
            splitSubtype: 'push', // push, pull, legs, upper, arms, core
            currentInspectExId: null
        };


        // GLOBAL APP STATE
        let selectedSplits = ['full_body'];
        let selectedSplit = 'full_body';
        let selectedEquipments = ['dumbbell', 'bench', 'kettlebell', 'bodyweight'];
        let currentGeneratedWorkout = null;

        const ALL_EQUIPMENT_KEYS = ['dumbbell', 'bench', 'kettlebell', 'barbell', 'pullup_bar', 'machine', 'bodyweight'];
        const EQUIPMENT_DISPLAY_NAMES = {
            dumbbell: 'Dambıl',
            bench: 'Sehpa',
            kettlebell: 'Kettlebell',
            barbell: 'Bar & Plaka',
            pullup_bar: 'Barfiks / Dips Barı',
            machine: 'Makine / Kablo',
            bodyweight: 'Vücut Ağırlığı'
        };

        const BENCH_REQUIRED_EX_IDS = new Set([
            'db_bench_press',
            'db_incline_press',
            'db_overhead_press',
            'db_skullcrusher',
            'db_bulgarian_squat',
            'db_saw_row',
            'db_chest_supported_row',
            'db_pullover',
            'db_incline_curl',
            'step_up_press',
            'db_lying_leg_curl',
            'bb_bench_press',
            'bb_incline_bench',
            'bb_hip_thrust',
            'bb_close_grip_bench',
            'bw_decline_pushup'
        ]);

        const PULLUP_BAR_REQUIRED_EX_IDS = new Set([
            'bw_pullup',
            'bw_chinup',
            'bw_inverted_row',
            'bw_hanging_knee_raise',
            'bw_dips',
            'bw_hyperextension'
        ]);

        const PLATE_OVERRIDE_EX_IDS = new Set([
            'kneeling_plate_front_raise',
            'half_kneeling_plate_chop',
            'bear_crawl_pull_through',
            'lunge_with_twist'
        ]);

        function getExerciseRequiredEquipments(ex) {
            if (!ex) return [];
            const id = String(ex.id || '');
            const reqs = [];
            if (PLATE_OVERRIDE_EX_IDS.has(id)) {
                reqs.push('barbell');
            } else if (ex.equipment) {
                reqs.push(ex.equipment);
            }
            if (BENCH_REQUIRED_EX_IDS.has(id) && !reqs.includes('bench')) {
                reqs.push('bench');
            }
            if (PULLUP_BAR_REQUIRED_EX_IDS.has(id) && !reqs.includes('pullup_bar')) {
                reqs.push('pullup_bar');
            }
            return reqs;
        }
        window.getExerciseRequiredEquipments = getExerciseRequiredEquipments;

        function getExerciseEquipmentLabels(ex) {
            return getExerciseRequiredEquipments(ex).map(k => EQUIPMENT_DISPLAY_NAMES[k] || k);
        }
        window.getExerciseEquipmentLabels = getExerciseEquipmentLabels;

        function formatExerciseEquipmentText(ex) {
            return getExerciseEquipmentLabels(ex).join(' + ');
        }
        window.formatExerciseEquipmentText = formatExerciseEquipmentText;

        function isExerciseEquipmentAvailable(ex, allowedList = selectedEquipments) {
            if (!ex) return false;
            const reqs = getExerciseRequiredEquipments(ex);
            if (reqs.length === 0) return true;
            const list = Array.isArray(allowedList) ? allowedList : selectedEquipments;
            return reqs.every(r => list.includes(r));
        }
        window.isExerciseEquipmentAvailable = isExerciseEquipmentAvailable;
        let activeWorkoutSession = null;
        let activeWorkoutStartTime = null;
        let activeWorkoutIsPaused = false;
        let activeWorkoutPausedAt = null;
        let activeWorkoutTotalPausedMs = 0;
        let activeWorkoutSetsData = {};
        let workoutTimerInterval = null;
        let activeWorkoutViewMode = 'focus'; // 'focus' | 'list'
        let activeFocusExIndex = 0;
        let activeFocusSetIndex = null;
        let wakeLockSentinel = null;
        let isWakeLockEnabled = true;

        // REST TIMER STATE
        let timerInterval = null;
        let timerRemaining = 45;
        let isTimerRunning = false;

        // AUTH & ATHLETE SESSION
        let currentSession = null;
        let selectedNewAvatar = 'A';
        let selectedAvatar = 'A';
        let selectedTheme = 'gold';

        const THEMES = {
            gold: { gold: '#B45309', goldLight: '#9A3412', glow: 'rgba(180, 83, 9, 0.16)' },
            cyan: { gold: '#0369A1', goldLight: '#075985', glow: 'rgba(3, 105, 161, 0.16)' },
            green: { gold: '#15803D', goldLight: '#166534', glow: 'rgba(21, 128, 61, 0.16)' },
            red: { gold: '#BE123C', goldLight: '#9F1239', glow: 'rgba(190, 18, 60, 0.16)' },
            purple: { gold: '#7E22CE', goldLight: '#581C87', glow: 'rgba(126, 34, 206, 0.16)' }
        };

        // TAB SWITCHING & BOTTOM NAV CONTROL
        function switchTab(tabId) {
            let requestedStudio = false;
            if (tabId === 'studioTab') {
                tabId = 'activeWorkoutTab';
                requestedStudio = true;
            } else if (tabId === 'calendarTab') {
                tabId = 'activeWorkoutTab';
            }

            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => {
                if (c.id !== tabId) {
                    c.querySelectorAll('video').forEach(v => {
                        try { v.pause(); } catch(e) {}
                    });
                }
                c.classList.remove('active');
            });

            const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
            if (targetBtn) targetBtn.classList.add('active');

            // Sync bottom navigation items
            document.querySelectorAll('.bottom-nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.tab === tabId);
            });

            // Sync Stitch header active section label
            const headerTabLabel = document.getElementById('headerActiveTabLabel');
            if (headerTabLabel) {
                const tabLabels = {
                    generatorTab: 'ÜRETİCİ',
                    activeWorkoutTab: 'ANTRENMAN',
                    libraryTab: 'KÜTÜPHANE',
                    historyTab: 'GEÇMİŞ',
                    analyticsTab: 'ANALİZ',
                    profileTab: 'PROFİL & AYARLAR'
                };
                headerTabLabel.textContent = tabLabels[tabId] || 'ANTRENMAN';
            }

            // Close more sheet if open
            closeMoreSheet();

            const targetContent = document.getElementById(tabId);
            if (targetContent) targetContent.classList.add('active');

            if (tabId === 'activeWorkoutTab') {
                renderActiveWorkout();
                if (activeWorkoutSession) {
                    requestWakeLock();
                } else if (requestedStudio) {
                    setTimeout(() => {
                        openStudioAccordion();
                    }, 120);
                }
            }

            if (tabId === 'generatorTab') renderAiHybridHeroBanner();
            if (tabId === 'libraryTab') renderLibrary();
            if (tabId === 'historyTab') {
                renderHistory();
                if (typeof window.syncUserWorkoutLogsFromCloud === 'function' && typeof getActiveUserId === 'function') {
                    try {
                        const activeUid = getActiveUserId();
                        if (activeUid) window.syncUserWorkoutLogsFromCloud(activeUid, { throttleMs: 2500 });
                    } catch (e) {}
                }
            }
            if (tabId === 'analyticsTab') renderAnalytics();
            if (tabId === 'profileTab') updateProfileGeminiStatusUI();
            if (typeof refreshTopFitnessCardioScoreBars === 'function') refreshTopFitnessCardioScoreBars();

            if (!requestedStudio) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        // ==================== BOTTOM BAR & SHEET LOGIC ====================
        function toggleBottomBar() {
            showBottomBar();
        }

        function hideBottomBar() {
            showBottomBar();
        }

        function showBottomBar() {
            const w = document.getElementById('bottomNavWrapper');
            const pill = document.getElementById('bottomRestorePill');
            if (w) w.classList.remove('hidden');
            if (pill) pill.classList.remove('visible');
        }

        function openMoreSheet() {
            const overlay = document.getElementById('moreSheetOverlay');
            const sheet = document.getElementById('moreBottomSheet');
            if (overlay) overlay.classList.add('open');
            if (sheet) sheet.classList.add('open');
        }

        function closeMoreSheet() {
            const overlay = document.getElementById('moreSheetOverlay');
            const sheet = document.getElementById('moreBottomSheet');
            if (overlay) overlay.classList.remove('open');
            if (sheet) sheet.classList.remove('open');
        }


        const GEMINI_API_STORAGE_KEY = 'celik_kodu_gemini_api_key';

        const DAY_NAMES_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const DAY_SHORT_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

        function escapeHTML(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }


        // ==================== AKADEMİK BİYOMEKANİK, VÜCUT AĞIRLIĞI & TUT (SÜRE) YÖNETİCİSİ ====================
        // Brad Schoenfeld, Ebben et al. (2011) & Oranchuk et al. (2019) Biyomekanik Modeli
        const ACADEMIC_BODYWEIGHT_RATIOS = {
            'bw_pushup': 0.65,
            'bw_decline_pushup': 0.74,
            'bw_diamond_pushup': 0.68,
            'push-up': 0.65,
            'şınav': 0.65,
            'bw_pullup': 0.95,
            'bw_chinup': 0.95,
            'bw_inverted_row': 0.60,
            'bw_dips': 0.90,
            'barfiks': 0.95,
            'dips': 0.90,
            'bw_air_squat': 0.68,
            'bw_jump_squat': 0.75,
            'bw_sissy_squat': 0.70,
            'bw_glute_bridge': 0.40,
            'air squat': 0.68,
            'jump squat': 0.75,
            'glute bridge': 0.40,
            'bw_plank': 0.50,
            'bw_hollow_body': 0.55,
            'bw_hanging_knee_raise': 0.25,
            'plank': 0.50,
            'hollow body': 0.55,
            'default': 0.60
        };

        function _normMetricKey(str) {
            return String(str || '').replace(/[İIı]/g, 'i').toLowerCase().replace(/\u0307/g, '').trim();
        }

        function _findCanonicalDbExerciseRaw(ex) {
            if (!ex) return null;
            const idStr = typeof ex === 'string' ? ex : (ex.id || ex.exId || '');
            const nameStr = typeof ex === 'string' ? ex : (ex.name || '');
            const normId = _normMetricKey(idStr);
            const normName = _normMetricKey(nameStr);
            if (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) {
                const byId = normId ? EXERCISES_DB.find(e => e && _normMetricKey(e.id) === normId) : null;
                if (byId) return byId;
                if (normName) {
                    const exactName = EXERCISES_DB.find(e => e && _normMetricKey(e.name) === normName);
                    if (exactName) return exactName;
                    const baseName = normName.replace(/\s*\([^)]*\)/g, '').trim();
                    if (baseName) {
                        const byPrefix = EXERCISES_DB.find(e => e && _normMetricKey(e.name).replace(/\s*\([^)]*\)/g, '').trim() === baseName);
                        if (byPrefix) return byPrefix;
                    }
                }
            }
            try {
                if (typeof INTER_SET_QUICK_PRESETS !== 'undefined' && Array.isArray(INTER_SET_QUICK_PRESETS)) {
                    const preset = INTER_SET_QUICK_PRESETS.find(p => (normId && _normMetricKey(p.id) === normId) || (normName && _normMetricKey(p.name) === normName));
                    if (preset) return preset;
                }
            } catch (e) {}
            return null;
        }

        function resolveCanonicalDbExercise(ex) {
            if (!ex) return null;
            const dbEx = _findCanonicalDbExerciseRaw(ex);
            if (typeof ex === 'string') {
                return dbEx ? { ...dbEx } : { id: ex, name: ex };
            }
            if (!dbEx) return ex;
            return {
                ...dbEx,
                ...ex,
                id: ex.id || dbEx.id,
                name: ex.name || dbEx.name,
                equipment: ex.equipment || dbEx.equipment,
                category: ex.category || dbEx.category,
                metricUnit: ex.metricUnit || dbEx.metricUnit,
                trackingType: ex.trackingType || dbEx.trackingType
            };
        }

        function isExerciseCardioMinutes(ex) {
            if (!ex) return false;
            const dbEx = _findCanonicalDbExerciseRaw(ex);
            const targets = [typeof ex === 'object' ? ex : { id: ex, name: ex }, dbEx].filter(Boolean);
            for (const t of targets) {
                const metricUnit = _normMetricKey(t.metricUnit);
                const trackingType = _normMetricKey(t.trackingType);
                if (metricUnit === 'min' || trackingType === 'cardio_min' || trackingType === 'minutes') return true;
            }
            for (const t of targets) {
                const id = _normMetricKey(t.id || t.exId);
                const name = _normMetricKey(t.name);
                if (id.startsWith('bw_')
                    || id.includes('farmers_walk')
                    || id.includes('walking_lunge')
                    || id.includes('butt_kick')
                    || id.includes('high_knee')
                    || id.includes('jump_rope')
                    || id.includes('jumping_jack')
                    || name.includes('çiftçi yürüyüşü')
                    || name.includes('walking lunge')
                    || name.includes('yürüyüş lunge')
                    || name.includes('ip atlama')
                    || name.includes('yildiz siçrama')
                    || name.includes('yıldız sıçrama')
                    || name.includes('topuk kalçaya')) {
                    return false;
                }
            }
            for (const t of targets) {
                const id = _normMetricKey(t.id || t.exId);
                const name = _normMetricKey(t.name);

                if (/^cond_/.test(id)) return true;
                const cardioKeywords = ['indoor_row', 'indoor row', 'ergometre', 'kürek çekme', 'tempolu yürüyüş', 'doğa yürüyüşü', 'koşu bandı', 'treadmill', 'cardio_bike', 'bisiklet'];
                if (cardioKeywords.some(kw => id.includes(_normMetricKey(kw)) || name.includes(_normMetricKey(kw)))) return true;
                const isResistanceOrDyn = /(barbell|dambil|dumbbell|kettlebell|kablo|cable|mach_|db_|bb_|kb_|gorilla|pendlay|saw|renegade|inverted|bent|supported|farmers|lunge)/.test(`${id} ${name}`);
                if (!isResistanceOrDyn && /(^|\s)(kürek|koşu|yürüyüş|rowing|running|walking|cycling)(\s|\(|$)/.test(`${id} ${name}`)) {
                    return true;
                }
            }
            return false;
        }

        function isExerciseTimeBased(ex) {
            if (!ex) return false;
            if (isExerciseCardioMinutes(ex)) return false;
            const dbEx = _findCanonicalDbExerciseRaw(ex);
            const targets = [typeof ex === 'object' ? ex : { id: ex, name: ex }, dbEx].filter(Boolean);
            for (const t of targets) {
                const id = _normMetricKey(t.id || t.exId);
                const name = _normMetricKey(t.name);
                if (id.includes('plank_jack') || name.includes('plank jack') || name.includes('aç-kapa')) return false;
            }
            const timeKeywords = ['plank', 'hollow', 'carry', 'farmers_walk', 'suitcase_carry', 'waiter', 'cross_body', 'taşıma', 'çiftçi yürüyüşü', 'bavul', 'dead hang', 'wall sit', 'l-sit', 'izometrik'];
            for (const t of targets) {
                const id = _normMetricKey(t.id || t.exId);
                const name = _normMetricKey(t.name);
                if (timeKeywords.some(kw => id.includes(kw) || name.includes(kw))) return true;
                if (t.trackingType === 'time' || t.trackingType === 'duration' || t.isTimeBased === true) return true;
            }
            return false;
        }

        function getExerciseMetricMode(ex) {
            if (isExerciseCardioMinutes(ex)) return 'cardio_min';
            if (isExerciseTimeBased(ex)) return 'time_sec';
            return 'reps';
        }

        function isExerciseBodyweight(ex) {
            if (!ex) return false;
            const dbEx = _findCanonicalDbExerciseRaw(ex);
            const targets = [typeof ex === 'object' ? ex : { id: ex, name: ex }, dbEx].filter(Boolean);
            const bwKeywords = ['şınav', 'push-up', 'pushup', 'barfiks', 'pull-up', 'pullup', 'chin-up', 'chinup', 'dips', 'air squat', 'jump squat', 'glute bridge', 'hollow body', 'plank', 'burpee', 'mountain climber', 'hanging knee', 'barda dize', 'sissy squat'];
            for (const t of targets) {
                if (t.equipment === 'bodyweight' || t.trackingType === 'bodyweight' || t.isBodyweight === true) return true;
                if (Array.isArray(t.tags) && t.tags.includes('bodyweight')) return true;
                const id = _normMetricKey(t.id || t.exId);
                const name = _normMetricKey(t.name);
                if (id.startsWith('bw_')) return true;
                if (bwKeywords.some(kw => id.includes(kw) || name.includes(kw))) return true;
            }
            return false;
        }

        function getUserActiveBodyweightKg() {
            try {
                if (typeof getScaleLogs === 'function') {
                    const scaleLogs = getScaleLogs();
                    if (Array.isArray(scaleLogs) && scaleLogs.length > 0) {
                        const validScale = scaleLogs.find(s => s && parseFloat(s.weight) > 30);
                        if (validScale) return parseFloat(validScale.weight);
                    }
                }
                const u = typeof getActiveUser === 'function' ? getActiveUser() : null;
                if (u && u.telemetry && parseFloat(u.telemetry.currentWeight) > 30) {
                    return parseFloat(u.telemetry.currentWeight);
                }
                if (u && parseFloat(u.bodyweight) > 30) {
                    return parseFloat(u.bodyweight);
                }
            } catch(e) {}
            return 75; // Standart akademik referans vücut ağırlığı (kg)
        }

        function resolveDefaultExerciseSetTarget(ex, fallbackRepsSpec = '') {
            const mode = getExerciseMetricMode(ex);
            const dbEx = _findCanonicalDbExerciseRaw(ex);
            const specStr = String((ex && ex.targetReps) || (dbEx && dbEx.targetReps) || fallbackRepsSpec || '').trim();
            if (mode === 'cardio_min') {
                const rawMin = Number((ex && (ex.targetDurationMin || ex.targetMinutes)) || (dbEx && (dbEx.targetDurationMin || dbEx.targetMinutes)) || 0);
                if (rawMin > 0) return rawMin;
                if (specStr && !specStr.includes('-') && /^\d+\s*(dk|dak|min)?$/i.test(specStr)) {
                    const parsedMin = parseInt(specStr, 10);
                    if (parsedMin >= 3) return parsedMin;
                }
                return 20;
            }
            if (mode === 'time_sec') {
                const rawSec = Number((ex && (ex.targetDurationSec || ex.defaultVal)) || (dbEx && (dbEx.targetDurationSec || dbEx.defaultVal)) || 0);
                if (rawSec >= 10) return rawSec;
                if (specStr && /(\bsn\b|\bs\b|saniye|sec)/i.test(specStr)) {
                    const parsedSec = parseInt(specStr, 10);
                    if (parsedSec >= 10) return parsedSec;
                }
                return 30;
            }
            if (specStr) {
                const firstPart = specStr.split('-')[0].trim();
                const parsed = parseInt(firstPart, 10);
                if (!isNaN(parsed) && parsed > 0) return parsed;
            }
            return 10;
        }

        function _resolveAcademicBwRatio(ex) {
            const dbEx = _findCanonicalDbExerciseRaw(ex);
            const exId = _normMetricKey((ex && (ex.id || ex.exId)) || (dbEx && dbEx.id) || '');
            const exName = _normMetricKey((ex && ex.name) || (dbEx && dbEx.name) || '');
            let bwRatio = ACADEMIC_BODYWEIGHT_RATIOS['default'];
            for (const [k, ratio] of Object.entries(ACADEMIC_BODYWEIGHT_RATIOS)) {
                if (k === 'default') continue;
                if (exId.includes(k) || exName.includes(k)) {
                    bwRatio = ratio;
                    break;
                }
            }
            return bwRatio;
        }

        function computeSetEpleyE1RM(ex, weight, repsOrSecs) {
            const mode = getExerciseMetricMode(ex);
            const w = (weight !== '' && weight !== null && weight !== undefined && !isNaN(weight)) ? Math.max(0, parseFloat(weight)) : 0;
            const r = (repsOrSecs !== '' && repsOrSecs !== null && repsOrSecs !== undefined && !isNaN(repsOrSecs)) ? Math.max(0, parseFloat(repsOrSecs)) : 0;
            if (mode === 'cardio_min') return r;
            if (r <= 0 && w <= 0) return 0;

            const isBw = isExerciseBodyweight(ex);
            let effectiveLoad = w;
            if (isBw) {
                effectiveLoad = (getUserActiveBodyweightKg() * _resolveAcademicBwRatio(ex)) + w;
            } else if (effectiveLoad <= 0) {
                return r;
            }
            if (mode === 'time_sec') {
                const eqReps = r / 3.5;
                return effectiveLoad * (1 + eqReps / 30);
            }
            if (r <= 1) return effectiveLoad;
            return Math.round((effectiveLoad * (1 + r / 30)) * 100) / 100;
        }

        function pickSessionTopWorkingSet(ex, completedSets = []) {
            const list = Array.isArray(completedSets)
                ? completedSets.filter(s => s && (s.completed || (parseFloat(s.weight) || 0) > 0 || (parseInt(s.reps, 10) || 0) > 0))
                : [];
            if (list.length === 0) return null;
            const mode = getExerciseMetricMode(ex);
            if (mode === 'cardio_min') {
                return list.reduce((best, cur) => ((parseInt(cur.reps, 10) || 0) > (parseInt(best.reps, 10) || 0) ? cur : best), list[0]);
            }
            if (mode === 'time_sec') {
                return list.reduce((best, cur) => {
                    const cw = parseFloat(cur.weight) || 0;
                    const bw = parseFloat(best.weight) || 0;
                    if (cw > bw) return cur;
                    if (cw === bw && (parseInt(cur.reps, 10) || 0) > (parseInt(best.reps, 10) || 0)) return cur;
                    return best;
                }, list[0]);
            }
            return list.reduce((best, cur) => {
                const cw = parseFloat(cur.weight) || 0;
                const bw = parseFloat(best.weight) || 0;
                if (cw > bw) return cur;
                if (cw === bw && (parseInt(cur.reps, 10) || 0) > (parseInt(best.reps, 10) || 0)) return cur;
                return best;
            }, list[0]);
        }

        function pickBestPairedSet(ex, completedSets = []) {
            const list = Array.isArray(completedSets)
                ? completedSets.filter(s => s && (s.completed || (parseFloat(s.weight) || 0) > 0 || (parseInt(s.reps, 10) || 0) > 0))
                : [];
            if (list.length === 0) return null;
            const mode = getExerciseMetricMode(ex);
            if (mode === 'cardio_min') {
                return pickSessionTopWorkingSet(ex, list);
            }
            if (mode === 'time_sec') {
                const hasAddedLoad = list.some(s => (parseFloat(s.weight) || 0) > 0);
                if (!hasAddedLoad) {
                    return list.reduce((best, cur) => ((parseInt(cur.reps, 10) || 0) > (parseInt(best.reps, 10) || 0) ? cur : best), list[0]);
                }
            }
            return list.reduce((best, cur) => {
                const ce = computeSetEpleyE1RM(ex, cur.weight, cur.reps);
                const be = computeSetEpleyE1RM(ex, best.weight, best.reps);
                if (ce > be) return cur;
                if (ce === be) {
                    const cw = parseFloat(cur.weight) || 0;
                    const bw = parseFloat(best.weight) || 0;
                    if (cw > bw) return cur;
                    if (cw === bw && (parseInt(cur.reps, 10) || 0) > (parseInt(best.reps, 10) || 0)) return cur;
                }
                return best;
            }, list[0]);
        }

        function calculateExerciseSetVolume(ex, weight, repsOrSecs) {
            const mode = getExerciseMetricMode(ex);
            if (mode === 'cardio_min') return 0; // Kardiyo dakika kayıtları ağırlık tonajı olarak toplanmaz
            const isTime = mode === 'time_sec';
            const isBw = isExerciseBodyweight(ex);
            const userBw = getUserActiveBodyweightKg();
            const w = (weight !== '' && weight !== null && !isNaN(weight)) ? parseFloat(weight) : 0;
            const r = (repsOrSecs !== '' && repsOrSecs !== null && !isNaN(repsOrSecs)) ? parseFloat(repsOrSecs) : 0;
            if (r <= 0) return 0;

            let effectiveLoad = w;
            if (isBw) {
                const bwRatio = _resolveAcademicBwRatio(ex);
                effectiveLoad = (userBw * bwRatio) + w; // Güncel tartı kilosu oranı + ek yük
            }

            if (isTime) {
                // Akademik TUT & Dinamik Eşdeğerlik (Oranchuk 2019, Burd 2012):
                // 1 dinamik tekrar ortalama 3.5 sn TUT üretir.
                const eqReps = r / 3.5;
                return effectiveLoad * eqReps;
            }

            return effectiveLoad * r;
        }

        function formatSetWeightDisplay(isBw, weight) {
            if (isBw) {
                const numW = parseFloat(weight);
                if (!isNaN(numW) && numW > 0) {
                    return `BW +${numW}k`;
                }
                return 'BW';
            }
            if (weight !== '' && weight !== null && weight !== undefined && !isNaN(weight)) {
                return `${weight} kg`;
            }
            return '- kg';
        }

        function _resolveMetricModeFromArg(exOrModeOrIsTime) {
            if (exOrModeOrIsTime === true || exOrModeOrIsTime === 'time_sec') return 'time_sec';
            if (exOrModeOrIsTime === 'cardio_min') return 'cardio_min';
            if (exOrModeOrIsTime === false || exOrModeOrIsTime === null || exOrModeOrIsTime === undefined || exOrModeOrIsTime === 'reps') return 'reps';
            if (typeof exOrModeOrIsTime === 'object' || typeof exOrModeOrIsTime === 'string') {
                return getExerciseMetricMode(exOrModeOrIsTime);
            }
            return 'reps';
        }

        function formatSetMetricDisplay(exOrIsTime, reps) {
            const mode = _resolveMetricModeFromArg(exOrIsTime);
            if (mode === 'cardio_min') {
                const numMin = parseInt(reps, 10);
                return `${!isNaN(numMin) && numMin > 0 ? numMin : 20} dk`;
            }
            if (mode === 'time_sec') {
                const numSecs = parseInt(reps, 10);
                return `${!isNaN(numSecs) && numSecs > 0 ? numSecs : 30} sn`;
            }
            if (reps !== '' && reps !== null && reps !== undefined && !isNaN(reps)) {
                return `${reps} tk`;
            }
            return '- tk';
        }

        function formatPerformancePill(ex, weight, reps) {
            const mode = getExerciseMetricMode(ex);
            const isTime = mode === 'time_sec';
            const isCardio = mode === 'cardio_min';
            const isBw = isExerciseBodyweight(ex);
            const w = (weight !== '' && weight !== null && !isNaN(weight)) ? parseFloat(weight) : 0;
            const defaultMetric = isCardio ? 20 : (isTime ? 30 : 10);
            const r = (reps !== '' && reps !== null && !isNaN(reps) && parseInt(reps, 10) > 0) ? parseInt(reps, 10) : defaultMetric;

            if (isCardio) {
                return `${r}dk`;
            }
            let loadPart = '';
            if (isBw) {
                loadPart = w > 0 ? `BW(+${w}k)` : 'BW';
            } else {
                loadPart = `${w}kg`;
            }
            const metricPart = isTime ? `${r}sn` : `${r}tk`;
            return `${loadPart} × ${metricPart}`;
        }

        function rememberExerciseWeight(exId, exName, weightVal) {
            const probeEx = _findCanonicalDbExerciseRaw(exId || exName) || { id: exId, name: exName };
            if (isExerciseCardioMinutes(probeEx)) return;
            const parsedW = parseFloat(weightVal);
            if (isNaN(parsedW) || parsedW <= 0) return;
            const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : 'default';
            const storageKey = `celik_kodu_last_weights_${uid}`;
            try {
                const map = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
                if (exId) map[exId] = parsedW;
                if (exName) map[String(exName).trim().toLowerCase()] = parsedW;
                localStorage.setItem(storageKey, JSON.stringify(map));

                const user = typeof getActiveUser === 'function' ? getActiveUser() : null;
                if (user) {
                    user.lastExerciseWeights = Object.assign({}, user.lastExerciseWeights || {}, map);
                }
                if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(uid);
            } catch (e) {}
        }

        function getExerciseRememberedWeight(ex) {
            if (!ex) return '';
            const exObj = resolveCanonicalDbExercise(ex);
            const mode = getExerciseMetricMode(exObj);
            if (mode === 'cardio_min') return '';

            // 1. Önce antrenman geçmişindeki son çalışma setlerinin en ağır yüküne bak (Helms Top-Set Kuralı)
            const perf = (exObj.id && getLastExercisePerformance(exObj.id)) || (exObj.name && getLastExercisePerformance(exObj.name));
            if (perf) {
                if (perf.lastWeight !== '' && perf.lastWeight !== null && perf.lastWeight !== undefined && !isNaN(perf.lastWeight) && Number(perf.lastWeight) > 0) {
                    return Number(perf.lastWeight);
                }
                if (perf.isBodyweight) {
                    return '';
                }
            }

            // 2. Hafızadaki hızlı son ağırlık önbelleğine bak
            const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : 'default';
            try {
                const map = JSON.parse(localStorage.getItem(`celik_kodu_last_weights_${uid}`) || '{}') || {};
                if (exObj.id && map[exObj.id] > 0) return Number(map[exObj.id]);
                if (exObj.name) {
                    const normName = String(exObj.name).trim().toLowerCase();
                    if (map[normName] > 0) return Number(map[normName]);
                }
                const user = typeof getActiveUser === 'function' ? getActiveUser() : null;
                if (user && user.lastExerciseWeights) {
                    if (exObj.id && user.lastExerciseWeights[exObj.id] > 0) return Number(user.lastExerciseWeights[exObj.id]);
                    if (exObj.name) {
                        const normName = String(exObj.name).trim().toLowerCase();
                        if (user.lastExerciseWeights[normName] > 0) return Number(user.lastExerciseWeights[normName]);
                    }
                }
            } catch (e) {}

            return '';
        }

        function getLastExercisePerformance(exIdOrName) {
            if (!exIdOrName) return null;
            let history = [];
            try {
                if (typeof getWorkoutLogs === 'function') {
                    history = getWorkoutLogs() || [];
                } else {
                    const uid = getActiveUserId();
                    const raw = localStorage.getItem(`celik_kodu_history_${uid}`);
                    if (raw) history = JSON.parse(raw) || [];
                }
            } catch(e) {}

            const reqNormName = _normMetricKey(exIdOrName);
            const canonicalReq = _findCanonicalDbExerciseRaw(exIdOrName);

            for (const log of history) {
                if (!log) continue;
                const exList = log.detailedExercises || log.exercises;
                if (!exList || !Array.isArray(exList)) continue;
                const found = exList.find(e => {
                    if (!e) return false;
                    const idMatch = (e.id && (e.id === exIdOrName || (canonicalReq && e.id === canonicalReq.id))) || (e.name && _normMetricKey(e.name) === reqNormName);
                    if (!idMatch) return false;
                    return e.completedSetsCount > 0 || e.completedCount > 0 || (Array.isArray(e.sets) && e.sets.some(s => s && (s.completed || (parseFloat(s.weight) || 0) > 0)));
                });
                if (found && Array.isArray(found.sets)) {
                    const completedSets = found.sets.filter(s => s && (s.completed || (parseFloat(s.weight) || 0) > 0));
                    if (completedSets.length > 0) {
                        const mergedEx = resolveCanonicalDbExercise({ ...(canonicalReq || {}), ...found });
                        const mode = getExerciseMetricMode(mergedEx);
                        const isTime = mode === 'time_sec';
                        const isCardio = mode === 'cardio_min';
                        const isBw = isExerciseBodyweight(mergedEx);

                        const topWorkingSet = pickSessionTopWorkingSet(mergedEx, completedSets);
                        const bestPairedSet = pickBestPairedSet(mergedEx, completedSets) || topWorkingSet;
                        const topW = (topWorkingSet && topWorkingSet.weight !== '' && topWorkingSet.weight !== null && !isNaN(topWorkingSet.weight))
                            ? parseFloat(topWorkingSet.weight)
                            : 0;

                        const rememberedWeight = (!isCardio && topW > 0) ? topW : '';
                        const defaultMetric = isCardio ? 20 : (isTime ? 30 : 10);
                        const chosenReps = (topWorkingSet && parseInt(topWorkingSet.reps, 10) > 0)
                            ? parseInt(topWorkingSet.reps, 10)
                            : ((bestPairedSet && parseInt(bestPairedSet.reps, 10) > 0) ? parseInt(bestPairedSet.reps, 10) : defaultMetric);

                        return {
                            weight: isCardio ? '' : (rememberedWeight !== '' ? rememberedWeight : (isBw ? 0 : '')),
                            lastWeight: rememberedWeight,
                            reps: chosenReps,
                            topSet: topWorkingSet,
                            bestPairedSet: bestPairedSet,
                            metricMode: mode,
                            isCardioMinutes: isCardio,
                            isTimeBased: isTime,
                            isBodyweight: isBw,
                            dateFormatted: log.dateFormatted || log.date || 'Önceki seans'
                        };
                    }
                }
            }
            return null;
        }

