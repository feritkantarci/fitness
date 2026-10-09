/**
 * FitLAB BİYOMEKANİK EGZERSİZ ATLAŞI & KÜTÜPHANESİ
 * Otomatik üretilmiş zengin egzersiz kataloğu
 */

const EXERCISE_CATALOG = [
  {
    "id": "ex_barbell_bench",
    "name": "Barbell Bench",
    "rawKey": "barbell bench",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.35,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bench_press_anatomi.jpg",
    "cue": "Omuz bıçaklarını geriye ve aşağıya kilitle. Dambılları göğüs hizasına 45-60 derece dirsek açısıyla indir ve tepe noktada göğsü sıkarak presle."
  },
  {
    "id": "ex_damb_l_bench_press",
    "name": "Dambıl Bench Press",
    "rawKey": "dambıl bench press",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.35,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bench_press_anatomi.jpg",
    "cue": "Omuz bıçaklarını geriye ve aşağıya kilitle. Dambılları göğüs hizasına 45-60 derece dirsek açısıyla indir ve tepe noktada göğsü sıkarak presle."
  },
  {
    "id": "ex_bench_press",
    "name": "Bench Press",
    "rawKey": "bench press",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.35,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bench_press_anatomi.jpg",
    "cue": "Omuz bıçaklarını geriye ve aşağıya kilitle. Dambılları göğüs hizasına 45-60 derece dirsek açısıyla indir ve tepe noktada göğsü sıkarak presle."
  },
  {
    "id": "ex_incline_barbell_bench",
    "name": "Incline Barbell Bench",
    "rawKey": "incline barbell bench",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.45,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bench_press_anatomi.jpg",
    "cue": "Omuz bıçaklarını geriye ve aşağıya kilitle. Dambılları göğüs hizasına 45-60 derece dirsek açısıyla indir ve tepe noktada göğsü sıkarak presle."
  },
  {
    "id": "ex_incline_damb_l_press",
    "name": "Incline Dambıl Press",
    "rawKey": "incline dambıl press",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.45,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_e_imli_sehpa_damb_l_pres_incline_db_press_",
    "name": "Eğimli Sehpa Dambıl Pres (incline Db Press)",
    "rawKey": "eğimli sehpa dambıl pres (incline db press)",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.45,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_damb_l_floor_press",
    "name": "Dambıl Floor Press",
    "rawKey": "dambıl floor press",
    "primary": "Göğüs",
    "pFactor": 0.85,
    "sec": {
      "Triceps": 0.45,
      "Omuz": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_floor_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_floor_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_makine_g_s_presi",
    "name": "Makine Göğüs Presi",
    "rawKey": "makine göğüs presi",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.3,
      "Omuz": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kablo_crossover",
    "name": "Kablo Crossover",
    "rawKey": "kablo crossover",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kablo_g_s_s_k_t_rma_cable_flyes_crossover_",
    "name": "Kablo Göğüs Sıkıştırma (cable Flyes / Crossover)",
    "rawKey": "kablo göğüs sıkıştırma (cable flyes / crossover)",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_cable_lateral_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_lateral_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_pec_deck_kelebek",
    "name": "Pec Deck Kelebek",
    "rawKey": "pec deck kelebek",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_pec_deck_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_pec_deck_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_dips",
    "name": "Dips",
    "rawKey": "dips",
    "primary": "Göğüs",
    "pFactor": 0.85,
    "sec": {
      "Triceps": 0.4,
      "Omuz": 0.3
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_dips_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_dips_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex__nav_push_up_",
    "name": "Şınav (push-up)",
    "rawKey": "şınav (push-up)",
    "primary": "Göğüs",
    "pFactor": 0.65,
    "sec": {
      "Omuz": 0.25,
      "Triceps": 0.25,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_push_press_form.png",
    "anatomiImage": "assets/guides/guide_bw_diamond_pushup_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_klasik_nav_floor_push_up_",
    "name": "Klasik Şınav (floor Push-up)",
    "rawKey": "klasik şınav (floor push-up)",
    "primary": "Göğüs",
    "pFactor": 0.65,
    "sec": {
      "Omuz": 0.25,
      "Triceps": 0.25,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_push_press_form.png",
    "anatomiImage": "assets/guides/guide_bw_diamond_pushup_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex__nav",
    "name": "Şınav",
    "rawKey": "şınav",
    "primary": "Göğüs",
    "pFactor": 0.65,
    "sec": {
      "Omuz": 0.25,
      "Triceps": 0.25,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_decline_nav",
    "name": "Decline Şınav",
    "rawKey": "decline şınav",
    "primary": "Göğüs",
    "pFactor": 0.75,
    "sec": {
      "Omuz": 0.35,
      "Triceps": 0.25,
      "Karın/Core": 0.25
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_damb_l_pullover",
    "name": "Dambıl Pullover",
    "rawKey": "dambıl pullover",
    "primary": "Göğüs",
    "pFactor": 0.5,
    "sec": {
      "Sırt": 0.5,
      "Triceps": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_pullover_form.jpg",
    "anatomiImage": "assets/guides/guide_db_pullover_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_barbell_row",
    "name": "Barbell Row",
    "rawKey": "barbell row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Omuz": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_pendlay_row",
    "name": "Pendlay Row",
    "rawKey": "pendlay row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.35,
      "Omuz": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_damb_l_saw_row",
    "name": "Dambıl Saw Row",
    "rawKey": "dambıl saw row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_saw_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_saw_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_g_s_destekli_row",
    "name": "Göğüs Destekli Row",
    "rawKey": "göğüs destekli row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Omuz": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_gorilla_row",
    "name": "Gorilla Row",
    "rawKey": "gorilla row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Karın/Core": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": true,
    "formImage": "assets/guides/guide_kb_gorilla_row_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_gorilla_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_lat_pulldown",
    "name": "Lat Pulldown",
    "rawKey": "lat pulldown",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.35,
      "Omuz": 0.2
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_lat_pulldown_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_lat_pulldown_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kablo_row",
    "name": "Kablo Row",
    "rawKey": "kablo row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_barfiks_pull_up_",
    "name": "Barfiks (pull-up)",
    "rawKey": "barfiks (pull-up)",
    "primary": "Sırt",
    "pFactor": 0.85,
    "sec": {
      "Biceps": 0.4,
      "Karın/Core": 0.25
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bear_crawl_pull_through_form.jpg",
    "anatomiImage": "assets/guides/guide_bear_crawl_pull_through_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_yatay_barfiks",
    "name": "Yatay Barfiks",
    "rawKey": "yatay barfiks",
    "primary": "Sırt",
    "pFactor": 0.7,
    "sec": {
      "Biceps": 0.35,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_chin_up_ters_barfiks_",
    "name": "Chin-up (ters Barfiks)",
    "rawKey": "chin-up (ters barfiks)",
    "primary": "Biceps",
    "pFactor": 0.85,
    "sec": {
      "Sırt": 0.65
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_chinup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_chinup_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_renegade_row",
    "name": "Renegade Row",
    "rawKey": "renegade row",
    "primary": "Sırt",
    "pFactor": 0.7,
    "sec": {
      "Karın/Core": 0.7,
      "Biceps": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_renegade_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_renegade_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_renegade_row_nav",
    "name": "Renegade Row + Şınav",
    "rawKey": "renegade row + şınav",
    "primary": "Sırt",
    "pFactor": 0.6,
    "sec": {
      "Göğüs": 0.5,
      "Karın/Core": 0.6,
      "Triceps": 0.25
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_renegade_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_renegade_row_anatomi.jpg",
    "cue": "Dirseği kalçaya doğru bir kavisle çek. Kürek kemiklerini birbirine sıkıştır, gövdeyi gereksiz sallama."
  },
  {
    "id": "ex_barbell_omuz_presi",
    "name": "Barbell Omuz Presi",
    "rawKey": "barbell omuz presi",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_damb_l_omuz_presi",
    "name": "Dambıl Omuz Presi",
    "rawKey": "dambıl omuz presi",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35,
      "Karın/Core": 0.2
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kettlebell_press",
    "name": "Kettlebell Press",
    "rawKey": "kettlebell press",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_kettlebell_strict_overhead_press",
    "name": "Kettlebell Strict Overhead Press",
    "rawKey": "kettlebell strict overhead press",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_overhead_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_overhead_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_arnold_press",
    "name": "Arnold Press",
    "rawKey": "arnold press",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_arnold_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_arnold_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_barbell_push_press",
    "name": "Barbell Push Press",
    "rawKey": "barbell push press",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Triceps": 0.3,
      "Ön Bacak": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_damb_l_push_press",
    "name": "Dambıl Push Press",
    "rawKey": "dambıl push press",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Triceps": 0.3,
      "Ön Bacak": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_damb_l_lateral_raise",
    "name": "Dambıl Lateral Raise",
    "rawKey": "dambıl lateral raise",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_lateral_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_db_lateral_raise_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kablo_lateral_raise",
    "name": "Kablo Lateral Raise",
    "rawKey": "kablo lateral raise",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_lateral_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_db_lateral_raise_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_face_pull",
    "name": "Face Pull",
    "rawKey": "face pull",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Sırt": 0.5
    },
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_face_pull_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_face_pull_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_diz_st_plaka_n_omuz_kald_r_",
    "name": "Diz Üstü Plaka Ön Omuz Kaldırış",
    "rawKey": "diz üstü plaka ön omuz kaldırış",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Karın/Core": 0.3
    },
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kettlebell_halo",
    "name": "Kettlebell Halo",
    "rawKey": "kettlebell halo",
    "primary": "Omuz",
    "pFactor": 0.4,
    "sec": {
      "Karın/Core": 0.4
    },
    "type": "MOBILITY_STABILITY",
    "typeLabel": "Eklem Hareket Açıklığı & Stabilite",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_halo_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_halo_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_damb_l_snatch",
    "name": "Dambıl Snatch",
    "rawKey": "dambıl snatch",
    "primary": "Omuz",
    "pFactor": 0.5,
    "sec": {
      "Arka Bacak": 0.3,
      "Glute": 0.3,
      "Karın/Core": 0.3
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_snatch_form.jpg",
    "anatomiImage": "assets/guides/guide_db_snatch_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kettlebell_snatch",
    "name": "Kettlebell Snatch",
    "rawKey": "kettlebell snatch",
    "primary": "Omuz",
    "pFactor": 0.5,
    "sec": {
      "Arka Bacak": 0.3,
      "Glute": 0.3,
      "Karın/Core": 0.3
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_snatch_form.jpg",
    "anatomiImage": "assets/guides/guide_db_snatch_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_damb_l_clean_press",
    "name": "Dambıl Clean & Press",
    "rawKey": "dambıl clean & press",
    "primary": "Omuz",
    "pFactor": 0.7,
    "sec": {
      "Glute": 0.35,
      "Arka Bacak": 0.3,
      "Triceps": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_clean_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_clean_anatomi.jpg",
    "cue": "Core bölgesini ve glute kaslarını sık, kaburgaların dışarı fırlamasına izin vermeden ağırlığı baş üstüne dikey hatta kilitle."
  },
  {
    "id": "ex_step_up_omuz_presi",
    "name": "Step-up + Omuz Presi",
    "rawKey": "step-up + omuz presi",
    "primary": "Ön Bacak",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.6,
      "Glute": 0.4
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_step_up_press_form.jpg",
    "anatomiImage": "assets/guides/guide_step_up_press_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_barbell_back_squat",
    "name": "Barbell Back Squat",
    "rawKey": "barbell back squat",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_barbell_front_squat",
    "name": "Barbell Front Squat",
    "rawKey": "barbell front squat",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.4
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex__ift_damb_l_n_squat_front_squat_",
    "name": "Çift Dambıl Ön Squat (front Squat)",
    "rawKey": "çift dambıl ön squat (front squat)",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.4
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_barbell_zercher_squat",
    "name": "Barbell Zercher Squat",
    "rawKey": "barbell zercher squat",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.5,
      "Biceps": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_damb_l_goblet_squat",
    "name": "Dambıl Goblet Squat",
    "rawKey": "dambıl goblet squat",
    "primary": "Ön Bacak",
    "pFactor": 0.9,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_kettlebell_goblet_squat",
    "name": "Kettlebell Goblet Squat",
    "rawKey": "kettlebell goblet squat",
    "primary": "Ön Bacak",
    "pFactor": 0.9,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_45_leg_press",
    "name": "45° Leg Press",
    "rawKey": "45° leg press",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_leg_press_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_press_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_bulgar_split_squat",
    "name": "Bulgar Split Squat",
    "rawKey": "bulgar split squat",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.6
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_walking_lunge",
    "name": "Walking Lunge",
    "rawKey": "walking lunge",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_walking_lunge_form.jpg",
    "anatomiImage": "assets/guides/guide_db_walking_lunge_anatomi.jpg",
    "cue": "Omurgayı bir çelik sütun gibi dimdik tut, omuzları geriye kilitle ve kontrollü, sarsıntısız adımlarla yürü."
  },
  {
    "id": "ex_reverse_lunge",
    "name": "Reverse Lunge",
    "rawKey": "reverse lunge",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_walking_lunge_form.jpg",
    "anatomiImage": "assets/guides/guide_db_walking_lunge_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_leg_extension",
    "name": "Leg Extension",
    "rawKey": "leg extension",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_mach_leg_extension_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_extension_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_air_squat",
    "name": "Air Squat",
    "rawKey": "air squat",
    "primary": "Ön Bacak",
    "pFactor": 0.3,
    "sec": {
      "Glute": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_air_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_air_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_jump_squat",
    "name": "Jump Squat",
    "rawKey": "jump squat",
    "primary": "Ön Bacak",
    "pFactor": 0.5,
    "sec": {
      "Glute": 0.35
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_lunge_g_vde_rotasyonu",
    "name": "Lunge + Gövde Rotasyonu",
    "rawKey": "lunge + gövde rotasyonu",
    "primary": "Ön Bacak",
    "pFactor": 0.8,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.5
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_walking_lunge_form.jpg",
    "anatomiImage": "assets/guides/guide_db_walking_lunge_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_barbell_rdl",
    "name": "Barbell Rdl",
    "rawKey": "barbell rdl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Sırt": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_rdl_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, kalçayı arkadaki duvara dokunacakmış gibi geriye it. Omurgayı nötr tut ve hamstringlerde gerilim hisset."
  },
  {
    "id": "ex_damb_l_rdl",
    "name": "Dambıl Rdl",
    "rawKey": "dambıl rdl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Sırt": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_rdl_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, kalçayı arkadaki duvara dokunacakmış gibi geriye it. Omurgayı nötr tut ve hamstringlerde gerilim hisset."
  },
  {
    "id": "ex_tek_bacak_rdl",
    "name": "Tek Bacak Rdl",
    "rawKey": "tek bacak rdl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.6,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_rdl_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, kalçayı arkadaki duvara dokunacakmış gibi geriye it. Omurgayı nötr tut ve hamstringlerde gerilim hisset."
  },
  {
    "id": "ex_barbell_deadlift",
    "name": "Barbell Deadlift",
    "rawKey": "barbell deadlift",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.65,
      "Sırt": 0.5,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "LOW",
    "sfrLabel": "Yüksek Sistemik Yorgunluk (Aksiyel Omurga Yükü)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_deadlift_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_deadlift_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, kalçayı arkadaki duvara dokunacakmış gibi geriye it. Omurgayı nötr tut ve hamstringlerde gerilim hisset."
  },
  {
    "id": "ex_leg_curl",
    "name": "Leg Curl",
    "rawKey": "leg curl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_leg_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_curl_anatomi.jpg",
    "cue": "Dirsekleri gövdenin yanında sabitle. Ağırlığı kaldırırken omuzları öne kaçırmadan sadece biceps kasılmasını kullan."
  },
  {
    "id": "ex_barbell_hang_power_clean",
    "name": "Barbell Hang Power Clean",
    "rawKey": "barbell hang power clean",
    "primary": "Arka Bacak",
    "pFactor": 0.5,
    "sec": {
      "Glute": 0.5,
      "Omuz": 0.3,
      "Sırt": 0.3
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_clean_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_clean_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kettlebell_clean",
    "name": "Kettlebell Clean",
    "rawKey": "kettlebell clean",
    "primary": "Glute",
    "pFactor": 0.5,
    "sec": {
      "Arka Bacak": 0.4,
      "Karın/Core": 0.3
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_clean_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_clean_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_barbell_hip_thrust",
    "name": "Barbell Hip Thrust",
    "rawKey": "barbell hip thrust",
    "primary": "Glute",
    "pFactor": 1,
    "sec": {
      "Arka Bacak": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_hip_thrust_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_hip_thrust_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_glute_bridge",
    "name": "Glute Bridge",
    "rawKey": "glute bridge",
    "primary": "Glute",
    "pFactor": 1,
    "sec": {
      "Arka Bacak": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_glute_bridge_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_glute_bridge_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_damb_l_swing",
    "name": "Dambıl Swing",
    "rawKey": "dambıl swing",
    "primary": "Glute",
    "pFactor": 0.6,
    "sec": {
      "Arka Bacak": 0.4,
      "Karın/Core": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_swing_form.jpg",
    "anatomiImage": "assets/guides/guide_db_swing_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kettlebell_swing",
    "name": "Kettlebell Swing",
    "rawKey": "kettlebell swing",
    "primary": "Glute",
    "pFactor": 0.6,
    "sec": {
      "Arka Bacak": 0.4,
      "Karın/Core": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_swing_form.jpg",
    "anatomiImage": "assets/guides/guide_db_swing_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_incline_damb_l_curl",
    "name": "Incline Dambıl Curl",
    "rawKey": "incline dambıl curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Dirsekleri gövdenin yanında sabitle. Ağırlığı kaldırırken omuzları öne kaçırmadan sadece biceps kasılmasını kullan."
  },
  {
    "id": "ex_barbell_curl",
    "name": "Barbell Curl",
    "rawKey": "barbell curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Dirsekleri gövdenin yanında sabitle. Ağırlığı kaldırırken omuzları öne kaçırmadan sadece biceps kasılmasını kullan."
  },
  {
    "id": "ex_hammer_curl",
    "name": "Hammer Curl",
    "rawKey": "hammer curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Dirsekleri gövdenin yanında sabitle. Ağırlığı kaldırırken omuzları öne kaçırmadan sadece biceps kasılmasını kullan."
  },
  {
    "id": "ex_kablo_biceps_curl",
    "name": "Kablo Biceps Curl",
    "rawKey": "kablo biceps curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Dirsekleri gövdenin yanında sabitle. Ağırlığı kaldırırken omuzları öne kaçırmadan sadece biceps kasılmasını kullan."
  },
  {
    "id": "ex_damb_l_ba_st_triceps",
    "name": "Dambıl Başüstü Triceps",
    "rawKey": "dambıl başüstü triceps",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_triceps_pushdown_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_triceps_pushdown_anatomi.jpg",
    "cue": "Üst kolu tavana dik sabitle, dirsekleri açmadan yalnızca ön kolu bükerek arka kolda derin bir esneme hisset."
  },
  {
    "id": "ex_damb_l_skullcrusher",
    "name": "Dambıl Skullcrusher",
    "rawKey": "dambıl skullcrusher",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_skullcrusher_form.jpg",
    "anatomiImage": "assets/guides/guide_db_skullcrusher_anatomi.jpg",
    "cue": "Üst kolu tavana dik sabitle, dirsekleri açmadan yalnızca ön kolu bükerek arka kolda derin bir esneme hisset."
  },
  {
    "id": "ex_halat_triceps_pushdown",
    "name": "Halat Triceps Pushdown",
    "rawKey": "halat triceps pushdown",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_mach_triceps_pushdown_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_triceps_pushdown_anatomi.jpg",
    "cue": "Üst kolu tavana dik sabitle, dirsekleri açmadan yalnızca ön kolu bükerek arka kolda derin bir esneme hisset."
  },
  {
    "id": "ex_dar_tutu_bench",
    "name": "Dar Tutuş Bench",
    "rawKey": "dar tutuş bench",
    "primary": "Triceps",
    "pFactor": 0.85,
    "sec": {
      "Göğüs": 0.5,
      "Omuz": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bench_press_anatomi.jpg",
    "cue": "Omuz bıçaklarını geriye ve aşağıya kilitle. Dambılları göğüs hizasına 45-60 derece dirsek açısıyla indir ve tepe noktada göğsü sıkarak presle."
  },
  {
    "id": "ex_elmas_nav",
    "name": "Elmas Şınav",
    "rawKey": "elmas şınav",
    "primary": "Triceps",
    "pFactor": 0.7,
    "sec": {
      "Göğüs": 0.35,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_calf_raise",
    "name": "Calf Raise",
    "rawKey": "calf raise",
    "primary": "Kalf",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Doğrudan Hedef İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_calf_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_calf_raise_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_russian_twist",
    "name": "Russian Twist",
    "rawKey": "russian twist",
    "primary": "Karın/Core",
    "pFactor": 0.7,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Omurga & Karın Rotasyon / Anti-Rotasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_russian_twist_form.jpg",
    "anatomiImage": "assets/guides/guide_db_russian_twist_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kablo_woodchopper",
    "name": "Kablo Woodchopper",
    "rawKey": "kablo woodchopper",
    "primary": "Karın/Core",
    "pFactor": 0.8,
    "sec": {
      "Omuz": 0.2
    },
    "type": "CORE",
    "typeLabel": "Omurga & Karın Rotasyon / Anti-Rotasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_mach_cable_woodchopper_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_woodchopper_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_yar_m_diz_st_plaka_oduncu_woodchopper_",
    "name": "Yarım Diz Üstü Plaka Oduncu (woodchopper)",
    "rawKey": "yarım diz üstü plaka oduncu (woodchopper)",
    "primary": "Karın/Core",
    "pFactor": 0.8,
    "sec": {
      "Omuz": 0.2
    },
    "type": "CORE",
    "typeLabel": "Omurga & Karın Rotasyon / Anti-Rotasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_mach_cable_woodchopper_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_woodchopper_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_plank",
    "name": "Plank",
    "rawKey": "plank",
    "primary": "Karın/Core",
    "pFactor": 0.5,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Omurga & Karın Rotasyon / Anti-Rotasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_hollow_body",
    "name": "Hollow Body",
    "rawKey": "hollow body",
    "primary": "Karın/Core",
    "pFactor": 0.8,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Omurga & Karın Rotasyon / Anti-Rotasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_hollow_body_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_hollow_body_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_barda_dize_ekme",
    "name": "Barda Dize Çekme",
    "rawKey": "barda dize çekme",
    "primary": "Karın/Core",
    "pFactor": 0.85,
    "sec": {
      "Sırt": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Vücut Ağırlığı Kuvvet Hareketi",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_farmer_s_walk",
    "name": "Farmer's Walk",
    "rawKey": "farmer's walk",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Sırt": 0.35
    },
    "type": "LOADED_CARRY",
    "typeLabel": "Yüklü Omurga Taşıma / Core",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_farmers_walk_form.jpg",
    "anatomiImage": "assets/guides/guide_db_farmers_walk_anatomi.jpg",
    "cue": "Omurgayı bir çelik sütun gibi dimdik tut, omuzları geriye kilitle ve kontrollü, sarsıntısız adımlarla yürü."
  },
  {
    "id": "ex_suitcase_carry",
    "name": "Suitcase Carry",
    "rawKey": "suitcase carry",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {},
    "type": "LOADED_CARRY",
    "typeLabel": "Yüklü Omurga Taşıma / Core",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_cross_body_carry_form.jpg",
    "anatomiImage": "assets/guides/guide_cross_body_carry_anatomi.jpg",
    "cue": "Omurgayı bir çelik sütun gibi dimdik tut, omuzları geriye kilitle ve kontrollü, sarsıntısız adımlarla yürü."
  },
  {
    "id": "ex_garson_ta_mas_waiter_carry_",
    "name": "Garson Taşıması (waiter Carry)",
    "rawKey": "garson taşıması (waiter carry)",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Omuz": 0.4
    },
    "type": "LOADED_CARRY",
    "typeLabel": "Yüklü Omurga Taşıma / Core",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_cross_body_carry_form.jpg",
    "anatomiImage": "assets/guides/guide_cross_body_carry_anatomi.jpg",
    "cue": "Omurgayı bir çelik sütun gibi dimdik tut, omuzları geriye kilitle ve kontrollü, sarsıntısız adımlarla yürü."
  },
  {
    "id": "ex__apraz_ta_ma_cross_body_carry_",
    "name": "Çapraz Taşıma (cross-body Carry)",
    "rawKey": "çapraz taşıma (cross-body carry)",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Omuz": 0.3
    },
    "type": "LOADED_CARRY",
    "typeLabel": "Yüklü Omurga Taşıma / Core",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_cross_body_carry_form.jpg",
    "anatomiImage": "assets/guides/guide_cross_body_carry_anatomi.jpg",
    "cue": "Omurgayı bir çelik sütun gibi dimdik tut, omuzları geriye kilitle ve kontrollü, sarsıntısız adımlarla yürü."
  },
  {
    "id": "ex_ay_emeklemesi_plaka_eki_i",
    "name": "Ayı Emeklemesi Plaka Çekişi",
    "rawKey": "ayı emeklemesi plaka çekişi",
    "primary": "Karın/Core",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.35
    },
    "type": "CORE",
    "typeLabel": "Omurga & Karın Rotasyon / Anti-Rotasyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_turkish_get_up",
    "name": "Turkish Get-up",
    "rawKey": "turkish get-up",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Omuz": 0.5,
      "Glute": 0.35
    },
    "type": "MOBILITY_STABILITY",
    "typeLabel": "Eklem Hareket Açıklığı & Stabilite",
    "sfr": "MODERATE",
    "sfrLabel": "Orta Denge (Temel Kuvvet & Yüklenme)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_barbell_thruster",
    "name": "Barbell Thruster",
    "rawKey": "barbell thruster",
    "primary": "Ön Bacak",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.7,
      "Glute": 0.35,
      "Triceps": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "LOW",
    "sfrLabel": "Yüksek Sistemik Yorgunluk (Aksiyel Omurga Yükü)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_thruster_form.png",
    "anatomiImage": "assets/guides/guide_db_thruster_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_damb_l_thruster",
    "name": "Dambıl Thruster",
    "rawKey": "dambıl thruster",
    "primary": "Ön Bacak",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.7,
      "Glute": 0.35,
      "Triceps": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "LOW",
    "sfrLabel": "Yüksek Sistemik Yorgunluk (Aksiyel Omurga Yükü)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_thruster_form.png",
    "anatomiImage": "assets/guides/guide_db_thruster_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_kettlebell_thruster",
    "name": "Kettlebell Thruster",
    "rawKey": "kettlebell thruster",
    "primary": "Ön Bacak",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.7,
      "Glute": 0.35,
      "Triceps": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Patlayıcı / Balistik Güç Hareketi",
    "sfr": "LOW",
    "sfrLabel": "Yüksek Sistemik Yorgunluk (Aksiyel Omurga Yükü)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_thruster_form.png",
    "anatomiImage": "assets/guides/guide_db_thruster_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_landmine_squat_to_press",
    "name": "Landmine Squat To Press",
    "rawKey": "landmine squat to press",
    "primary": "Ön Bacak",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.65,
      "Glute": 0.35,
      "Triceps": 0.2
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Göğsü dik tut, dizleri ayak parmak uçlarının istikametine doğru açarak kalçayı diz seviyesinin altına kadar kontrollü çökert."
  },
  {
    "id": "ex_burpee",
    "name": "Burpee",
    "rawKey": "burpee",
    "primary": "Kondisyon / Kardiyo",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_burpee_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_burpee_anatomi.jpg",
    "cue": "Avuçları yere koy, ayakları geriye fırlat, göğsü yere değdirip hızlıca toparlanarak patlayıcı zıpla (Metabolik kondisyon)."
  },
  {
    "id": "ex_mountain_climber",
    "name": "Mountain Climber",
    "rawKey": "mountain climber",
    "primary": "Kondisyon / Kardiyo",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_mountain_climber_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_mountain_climber_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_damb_l_manmaker",
    "name": "Dambıl Manmaker",
    "rawKey": "dambıl manmaker",
    "primary": "Kondisyon / Kardiyo",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_manmaker_form.jpg",
    "anatomiImage": "assets/guides/guide_db_manmaker_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_jumping_jack",
    "name": "Jumping Jack",
    "rawKey": "jumping jack",
    "primary": "Kondisyon / Kardiyo",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  },
  {
    "id": "ex_ip_atlama",
    "name": "Ip Atlama",
    "rawKey": "ip atlama",
    "primary": "Kondisyon / Kardiyo",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Hareketi tam hareket açıklığında (ROM), 2-3 saniye kontrollü eksantrik iniş ve patlayıcı konsantrik itiş ile gerçekleştirin."
  }
];

function getFullCatalog() {
    return EXERCISE_CATALOG;
}

function getExerciseByKey(rawKey = "") {
    const clean = String(rawKey).trim().toLowerCase();
    return EXERCISE_CATALOG.find(e => e.rawKey === clean || e.name.toLowerCase() === clean) || null;
}

module.exports = {
    EXERCISE_CATALOG,
    getFullCatalog,
    getExerciseByKey
};
