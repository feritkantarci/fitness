/**
 * FitLAB BİYOMEKANİK EGZERSİZ ATLAŞI & KÜTÜPHANESİ
 * Single Source of Truth (SSOT): index.html EXERCISES_DB & exerciseGuideMap ile senkronize.
 * Toplam 96 Orijinal Egzersiz (Diyagram & Form Kılavuzları Dahil)
 */
const fs = require("fs");
const path = require("path");
const academicEngine = require("./academic-engine");

const STATIC_FALLBACK_CATALOG = [
  {
    "id": "db_bench_press",
    "name": "Dambıl Bench Press",
    "rawKey": "dambıl bench press",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.35,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_floor_press.svg",
    "formImage": "assets/guides/guide_db_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bench_press_anatomi.jpg",
    "cue": "Dirsekleri gövdeye 45° açıda tut, dambılları yukarıda çarpmadan göğüs kaslarını sıkarak kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Düz sehpaya uzan. Kürek kemiklerini arkada kilitle, ayak tabanları yere tam bassın. Dambıllar alt göğüs hizasında.",
        "phase": "1. Başlangıç (Sehpa Kurulumu)"
      },
      {
        "badge": "action",
        "desc": "Nefes vererek dirsekleri 45° açıyla açıp dambılları kontrollü ve güçlü şekilde yukarı doğru it.",
        "phase": "2. İtiş Fazı (45° Dirsek)"
      },
      {
        "badge": "finish",
        "desc": "Dambıllar tepe noktada göğüs hizasında buluşur (birbirine vurma). Göğüs kaslarını 1 saniye taş gibi sık.",
        "phase": "3. Tepe Kilitleme"
      }
    ]
  },
  {
    "id": "db_incline_press",
    "name": "Incline Dambıl Press",
    "rawKey": "incline dambıl press",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.45,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_incline_press.svg",
    "formImage": "assets/guides/guide_db_incline_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_incline_press_anatomi.jpg",
    "cue": "Sehpa açısını 30-45° yap, kürek kemiklerini sehpaya kilitle, tepe noktada üst göğsü sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sehpayı 30-45 dereceye ayarla. Dambılları üst göğüs ve köprücük kemiği hizasında, avuçlar hafif içe dönük tut.",
        "phase": "1. Başlangıç (30-45° Sehpa)"
      },
      {
        "badge": "action",
        "desc": "Nefes vererek dambılları üst göğüs hizasından yukarıya doğru üçgen bir hatta yukarı it.",
        "phase": "2. Yukarı & İçe İtiş"
      },
      {
        "badge": "finish",
        "desc": "Kollar yukarıda düzleşir, üst göğüs liflerini kilitler. 3 saniyede kontrollü olarak köprücük hizasına indir.",
        "phase": "3. Üst Göğüs Sıkıştırma"
      }
    ]
  },
  {
    "id": "db_floor_press",
    "name": "Dambıl Floor Press",
    "rawKey": "dambıl floor press",
    "primary": "Göğüs",
    "pFactor": 0.85,
    "sec": {
      "Triceps": 0.45,
      "Omuz": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_floor_press.svg",
    "formImage": "assets/guides/guide_db_floor_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_floor_press_anatomi.jpg",
    "cue": "Yerde dirsekler zemine hafifçe değdiği an durakla, momentum almadan patlayıcı şekilde yukarı it.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yere sırtüstü uzan, dizler bükülü, ayak tabanları yerde. Üst kollar zeminde, dirsekler 45-60 derece açıda.",
        "phase": "1. Zemin Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kollar yerdeyken nefes ver ve sıfır momentum noktasından patlayıcı güçle dambılları yukarı presle.",
        "phase": "2. Sıfır Momentum İtişi"
      },
      {
        "badge": "finish",
        "desc": "Triceps ve göğüs tepe noktada kilitlenir. Dirsekler zemine sert çarpmadan yavaşça yere temas eder.",
        "phase": "3. Tepe Kilitleme"
      }
    ]
  },
  {
    "id": "db_overhead_press",
    "name": "Dambıl Omuz Presi",
    "rawKey": "dambıl omuz presi",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35,
      "Karın/Core": 0.2
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_press.svg",
    "formImage": "assets/guides/guide_db_overhead_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_overhead_press_anatomi.jpg",
    "cue": "Kalçayı ve karnı taş gibi sık, omurgayı geriye bükmeden dambılları kulak hizasından baş üstüne dikey kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde. Dambıllar kulak hizasında, avuçlar karşıya bakar. Kalça ve karın kilitli.",
        "phase": "1. Başlangıç (Omuz Hizası)"
      },
      {
        "badge": "action",
        "desc": "Nefes vererek dambılları kafanın iki yanından düz bir hatta baş üstüne doğru it. Beli asla geriye bükme.",
        "phase": "2. Dikey İtiş"
      },
      {
        "badge": "finish",
        "desc": "Kollar baş üstünde kilitlenir, kulaklar kolların arasına gelir. Kontrollü biçimde kulak hizasına indir.",
        "phase": "3. Baş Üstü Kilit"
      }
    ]
  },
  {
    "id": "db_arnold_press",
    "name": "Arnold Press",
    "rawKey": "arnold press",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_press.svg",
    "formImage": "assets/guides/guide_db_arnold_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_arnold_press_anatomi.jpg",
    "cue": "Avuçlar yüzüne bakarak başla, preslerken bilekleri 180° çevirip baş üstüne kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıllar çene/göğüs önünde, avuç içleri tamamen kendi yüzüne bakar. Dirsekler göğse yapışık.",
        "phase": "1. Başlangıç (Avuçlar Yüze Dönük)"
      },
      {
        "badge": "action",
        "desc": "Yukarı iterken dirsekleri dışa aç ve bilekleri 180 derece döndürerek avuçları karşıya çevir.",
        "phase": "2. 180° Rotasyonel İtiş"
      },
      {
        "badge": "finish",
        "desc": "Baş üstünde standart pres pozisyonunda kilitlen. İnişte aynı rotasyonu tersine yaparak çene önüne dön.",
        "phase": "3. Tepe Kilit ve Dönüş"
      }
    ]
  },
  {
    "id": "db_lateral_raise",
    "name": "Dambıl Lateral Raise",
    "rawKey": "dambıl lateral raise",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_lateral_raise.svg",
    "formImage": "assets/guides/guide_db_lateral_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_db_lateral_raise_anatomi.jpg",
    "cue": "Dirsekleri hafif kırık tut, kolları omuz hizasına kadar sürahi döker gibi kaldır.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakta dik dur, dambıllar uylukların yanında hafif önde. Dirseklerde hafif doğal kavis, omuzlar aşağıda sabit.",
        "phase": "1. Dik Duruş & Kurulum"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri lider yaparak dambılları yana doğru kaldır. Trapezleri boyna çekme, sadece yan omuzla çek.",
        "phase": "2. Yana Açılış (Dirsek Liderliği)"
      },
      {
        "badge": "finish",
        "desc": "Kollar yere paralel (omuz hizasında) olduğunda dur. Serçe parmak hafif yukarıda tut, 3 saniyede yavaşça indir.",
        "phase": "3. Paralel Seviye & Kontrol"
      }
    ]
  },
  {
    "id": "db_triceps_overhead",
    "name": "Dambıl Başüstü Triceps",
    "rawKey": "dambıl başüstü triceps",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_overhead_triceps.svg",
    "formImage": "assets/guides/guide_db_triceps_overhead_form.jpg",
    "anatomiImage": "assets/guides/guide_db_triceps_overhead_anatomi.jpg",
    "cue": "Dirsekleri başın iki yanında tavana bakacak şekilde sabit tut, sadece ön kolları büküp baş arkasından uzat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Tek dambılın üst plakasını iki elin avuçlarıyla elmas şeklinde tutarak baş üstüne dikey kaldır.",
        "phase": "1. Baş Üstü Tutuş"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri kulakların yanında sabit tutarak dambılı enseye doğru yavaşça indir, triceps uzun başını esnet.",
        "phase": "2. Baş Arkasına İndiriş"
      },
      {
        "badge": "finish",
        "desc": "Sadece ön kolları uzatarak dambılı baş üstüne düzleştir, tepe noktada triceps kaslarını taş gibi sık.",
        "phase": "3. Dikey Kilitleme"
      }
    ]
  },
  {
    "id": "db_skullcrusher",
    "name": "Dambıl Skullcrusher",
    "rawKey": "dambıl skullcrusher",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_skull_crusher.svg",
    "formImage": "assets/guides/guide_db_skullcrusher_form.jpg",
    "anatomiImage": "assets/guides/guide_db_skullcrusher_anatomi.jpg",
    "cue": "Düz sehpada dirsekleri omuz hizasında dikey sabitle, dambılları şakaklara indirip triceps ile uzat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Düz sehpaya sırtüstü uzan. Kollar dik, dambıllar göğüs/omuz üzerinde paralel nötr tutuşta.",
        "phase": "1. Sehpa Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Üst kolları sabit tutarak sadece dirsekleri bük, dambılları kontrollü biçimde kulak/şakak yanına indir.",
        "phase": "2. Şakaklara İndiriş"
      },
      {
        "badge": "finish",
        "desc": "Dirsekleri açmadan ön kolları tekrar dikey konuma getir, tepe noktada triceps kaslarını tam sık.",
        "phase": "3. Triceps Patlaması"
      }
    ]
  },
  {
    "id": "db_goblet_squat",
    "name": "Dambıl Goblet Squat",
    "rawKey": "dambıl goblet squat",
    "primary": "Ön Bacak",
    "pFactor": 0.9,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_squat.svg",
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Dambılı göğsüne dikey yapıştır, topuklar yerden kalkmadan dirsekler dizlerin içine değene kadar çömel.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde, uçlar hafif dışa açık. Dambılın üst plakasını iki elle göğse yapışık tut.",
        "phase": "1. Göğüste Dikey Kurulum"
      },
      {
        "badge": "action",
        "desc": "Göğsü dik tutarak kalçayı geriye ve topukların arasına batır. Dirsekler dizlerin iç kısmına kadar insin.",
        "phase": "2. Derin Çömelme (Full ROM)"
      },
      {
        "badge": "finish",
        "desc": "Bütün ayak tabanıyla yeri iterek doğrul, tepe noktada kalça ve ön bacakları taş gibi kilitle.",
        "phase": "3. Topuktan İtiş & Glute Kilit"
      }
    ]
  },
  {
    "id": "db_front_squat",
    "name": "Çift Dambıl Ön Squat (Front Squat)",
    "rawKey": "çift dambıl ön squat (front squat)",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.4
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_clean_squat.svg",
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Dambılları omuz başlarına paralel dayayarak tut, dirsekleri yüksek tutarak gövdeyi dimdik aşağı indir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "İki dambılı omuz başlarına dayayarak paralel tut. Dirsekler öne ve yukarı baksın, omurga dik.",
        "phase": "1. Ön Rack Pozisyonu"
      },
      {
        "badge": "action",
        "desc": "Gövde açısını bozmadan dik bir şekilde kalçayı aşağı indir. Ağırlıkların öne düşmesine izin verme.",
        "phase": "2. Paralel Altı Çöküş"
      },
      {
        "badge": "finish",
        "desc": "Ön bacaklardan aldığın güçle doğrudan yukarı doğrul, kalçayı tepe noktada sık.",
        "phase": "3. Patlayıcı Kalkış"
      }
    ]
  },
  {
    "id": "db_bulgarian_squat",
    "name": "Bulgar Split Squat",
    "rawKey": "bulgar split squat",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.6
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_lunge.svg",
    "formImage": "assets/guides/guide_db_bulgarian_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bulgarian_squat_anatomi.jpg",
    "cue": "Arka ayağın üstünü sehpa kenarına yerleştir, ön diz 90° olana kadar dik çök, ön topuktan patla.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Arka ayağın üstünü sehpa kenarına dayayın, ön ayak 2-3 adım önde sağlam bassın. Dambıllar yanlarda sarkıtılır.",
        "phase": "1. Sehpa Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi hafifçe öne eğik tutarak ön diz 90 derece bükülene kadar alçal. Arka dize aşırı yük bindirme.",
        "phase": "2. 90° Derin Çöküş"
      },
      {
        "badge": "finish",
        "desc": "Yalnızca ön ayağın topuğundan kuvvet alarak yukarı fırla, tepe noktada ön bacak ve kalçayı sık.",
        "phase": "3. Ön Topuktan Doğrulma"
      }
    ]
  },
  {
    "id": "db_walking_lunge",
    "name": "Walking Lunge",
    "rawKey": "walking lunge",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_lunge.svg",
    "formImage": "assets/guides/guide_db_walking_lunge_form.jpg",
    "anatomiImage": "assets/guides/guide_db_walking_lunge_anatomi.jpg",
    "cue": "Öne büyük adımlar at, arka diz yere 2 cm kalana kadar çök, ön topuktan kuvvet alarak diğer adıma geç.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıllar yanlarda sabit. Öne doğru geniş ve dengeli bir adım at, gövde dimdik kalsın.",
        "phase": "1. Dik Duruş & Adım"
      },
      {
        "badge": "action",
        "desc": "Ön diz 90 derece bükülürken arka diz yere hafifçe yaklaşır (yere vurma). Ön topuğa bas.",
        "phase": "2. Çift Diz 90° Çöküşü"
      },
      {
        "badge": "finish",
        "desc": "Ön topuktan patlayıcı şekilde güç alarak ayağa kalk ve arka bacağı öne getirerek kesintisiz diğer adıma geç.",
        "phase": "3. İleri İtiş ve Geçiş"
      }
    ]
  },
  {
    "id": "db_reverse_lunge",
    "name": "Reverse Lunge",
    "rawKey": "reverse lunge",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_lunge.svg",
    "formImage": "assets/guides/guide_db_walking_lunge_form.jpg",
    "anatomiImage": "assets/guides/guide_db_walking_lunge_anatomi.jpg",
    "cue": "Geriye adım atarak çök (diz tendonlarını korur), ön topuktan patlayıcı güçle başlangıç noktasına çekil.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde yan yana, dambıllar iki yanda dikey sarkıtılmış, bakışlar karşıda.",
        "phase": "1. Başlangıç Duruşu"
      },
      {
        "badge": "action",
        "desc": "Bir bacakla geriye büyük adım at, ön diz 90 derecede kalırken arka dizi zemine yaklaştır.",
        "phase": "2. Geriye Adım & Çöküş"
      },
      {
        "badge": "finish",
        "desc": "Ön ayağın topuğuyla yeri ezerek patlayıcı şekilde doğrul ve ayakları başlangıç çizgisinde buluştur.",
        "phase": "3. Öne Doğrulma"
      }
    ]
  },
  {
    "id": "db_rdl",
    "name": "Dambıl RDL",
    "rawKey": "dambıl rdl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Sırt": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_rdl.svg",
    "formImage": "assets/guides/guide_db_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_rdl_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, kalçayı arkadaki duvara değdirir gibi geriye uzat, sırtı masa gibi düz tut.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde. Dambıllar uylukların önünde bacaklara temas eder. Omuzlar geride kilitli.",
        "phase": "1. Ayakta Kurulum"
      },
      {
        "badge": "action",
        "desc": "Diz açısını hiç değiştirmeden kalçayı geriye it. Dambıllar kaval kemiği boyunca bacaklara yapışık insin.",
        "phase": "2. Kalça Menteşesi (Hip Hinge)"
      },
      {
        "badge": "finish",
        "desc": "Arka bacakta yoğun esneme hissedildiğinde kalçayı öne sürerek doğrul ve tepe noktada kalçayı taş gibi kilitle.",
        "phase": "3. Hamstring Gerilimi & Kilit"
      }
    ]
  },
  {
    "id": "db_single_leg_rdl",
    "name": "Tek Bacak RDL",
    "rawKey": "tek bacak rdl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.6,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_single_leg_rdl.svg",
    "formImage": "assets/guides/guide_db_single_leg_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_single_leg_rdl_anatomi.jpg",
    "cue": "Destek ayağının dizini hafif bük, serbest bacağı arkaya cetvel gibi uzatırken dambılı kaval kemiğine indir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ağırlığı bir bacağa ver, zıt eldeki dambılı uyluğun önünde tut. Merkez bölgeyi sık.",
        "phase": "1. Tek Ayak Üzerinde Denge"
      },
      {
        "badge": "action",
        "desc": "Destek ayağının kalçasını arkaya menteşelerken serbest bacağı arkaya cetvel gibi düz uzat.",
        "phase": "2. Arka Bacağı Uzatarak Eğilme"
      },
      {
        "badge": "finish",
        "desc": "Destek bacağının hamstring ve glute kasını sıkarak doğrul, yere basmadan dengede bitir.",
        "phase": "3. Kalçadan Doğrulma"
      }
    ]
  },
  {
    "id": "db_saw_row",
    "name": "Dambıl Saw Row",
    "rawKey": "dambıl saw row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_row.svg",
    "formImage": "assets/guides/guide_db_saw_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_saw_row_anatomi.jpg",
    "cue": "Bir diz ve el sehpada, sırt masa gibi düz. Dambılı dikey değil, yay çizerek kalça cebine doğru çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Aynı taraftaki diz ve el sehpada, sırt yere paralel masa gibi düz. Serbest kol dambılla aşağı sarkar.",
        "phase": "1. Sehpa Destekli Kurulum"
      },
      {
        "badge": "action",
        "desc": "Dirseği lider yaparak dambılı düz yukarı değil, arkaya kalça cebine doğru yay çizerek çek.",
        "phase": "2. Kalça Cebine Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada sırt kanat kasını 1 saniye taş gibi sık. Omuz düşmeden kontrollüce aşağı uzat.",
        "phase": "3. Kanat Sıkıştırma"
      }
    ]
  },
  {
    "id": "db_chest_supported_row",
    "name": "Göğüs Destekli Row",
    "rawKey": "göğüs destekli row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Omuz": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_incline_row.svg",
    "formImage": "assets/guides/guide_db_chest_supported_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_chest_supported_row_anatomi.jpg",
    "cue": "Göğsü 30-45° eğimli sehpaya yasla, belden hiç momentum almadan sadece kürek kemiklerini sıkarak çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "30-45 derece eğimli sehpaya göğsünü tamamen yapıştır. Ayaklar yerde sağlam, kollar dambıllarla dikey sarkar.",
        "phase": "1. Sehpaya Yaslanma"
      },
      {
        "badge": "action",
        "desc": "Beli hiç oynatmadan dirsekleri geriye ve yukarı doğru çekerek kürek kemiklerini birbirine yaklaştır.",
        "phase": "2. Bel Yüksüz Sırt Çekişi"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada orta sırt ve kanat kaslarını tam sıkıştır. Dambılları yavaşça serbest bırak.",
        "phase": "3. Üst Sırt Kilit"
      }
    ]
  },
  {
    "id": "db_renegade_row",
    "name": "Renegade Row",
    "rawKey": "renegade row",
    "primary": "Sırt",
    "pFactor": 0.7,
    "sec": {
      "Karın/Core": 0.7,
      "Biceps": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_renegade_row.svg",
    "formImage": "assets/guides/guide_db_renegade_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_renegade_row_anatomi.jpg",
    "cue": "Şınav pozisyonunda dambılları tut, ayakları geniş aç, kalçayı hiç sallamadan sırayla çekiş yap.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Eller dambıllarda yüksek şınav pozisyonu al. Ayakları omuzdan geniş aç (kalça dönmesini engeller).",
        "phase": "1. Dambıl Üzerinde Yüksek Plank"
      },
      {
        "badge": "action",
        "desc": "Gövde ve kalçayı hiç oynatmadan tek dambılı kaburga hizasına çek, diğer kolla yeri güçlüce it.",
        "phase": "2. Tek Kol Sabit Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Dambılı yere sessizce koy, merkez kilidini koruyarak hemen diğer kola geç.",
        "phase": "3. Kontrollü İniş & Değişim"
      }
    ]
  },
  {
    "id": "db_pullover",
    "name": "Dambıl Pullover",
    "rawKey": "dambıl pullover",
    "primary": "Göğüs",
    "pFactor": 0.5,
    "sec": {
      "Sırt": 0.5,
      "Triceps": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_pullover.svg",
    "formImage": "assets/guides/guide_db_pullover_form.jpg",
    "anatomiImage": "assets/guides/guide_db_pullover_anatomi.jpg",
    "cue": "Sehpada sırtüstü uzan, dambılı iki elle başın arkasına dirsekleri kırmadan uzat, kanatlarla göğüs üstüne çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sehpaya sırtüstü uzan. Tek dambılı iki elinle iç plakasından elmas gibi kavra, göğsün üzerinde dikey tut.",
        "phase": "1. Sehpa Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Dirseklerde hafif sabit bir kavisle dambılı başının arkasına doğru yavaşça indir, kanatları derin esnet.",
        "phase": "2. Baş Arkasına Yay Çizme"
      },
      {
        "badge": "finish",
        "desc": "Geniş sırt ve göğüs kaslarını sıkarak dambılı aynı yay üzerinden tekrar göğüs hizasına geri çek.",
        "phase": "3. Göğüs Üstüne Çekiş"
      }
    ]
  },
  {
    "id": "db_hammer_curl",
    "name": "Hammer Curl",
    "rawKey": "hammer curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_hammer_curl.svg",
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Avuç içleri birbirine baksın (nötr tutuş), dirsekleri kaburgalara sabitle, sadece ön kolu kaldır.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakta dik duruş. Dambıllar uylukların yanında, avuç içleri birbirine bakar şekilde nötr tutulur.",
        "phase": "1. Nötr Tutuş Başlangıcı"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri gövdeden hiç ayırmadan dambılları çekiç sallar gibi omuz hizasına doğru bük.",
        "phase": "2. Dirsek Sabit Kaldırış"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada ön kol ve brachialis kasını 1 saniye sık. 3 saniyede kontrollü olarak aşağı indir.",
        "phase": "3. Tepe Kasılma & Negatif İniş"
      }
    ]
  },
  {
    "id": "db_incline_curl",
    "name": "Incline Dambıl Curl",
    "rawKey": "incline dambıl curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_biceps_curl.svg",
    "formImage": "assets/guides/guide_db_incline_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_incline_curl_anatomi.jpg",
    "cue": "Sehpayı 45-60° eğ, kollar arkada tamamen sarkıtılsın, omuzları oynatmadan biceps ile kıvır.",
    "positions": [
      {
        "badge": "setup",
        "desc": "45-60 derece eğimli sehpaya sırtını yasla. Kollar arkaya doğru serbestçe sarkıtılarak biceps esnetilir.",
        "phase": "1. Eğimli Sehpa Oturuşu"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri geride tutarak dambılları yukarı doğru bük, bilekleri yukarıda hafif dışa çevir (supinasyon).",
        "phase": "2. Maksimum Esnemeden Kıvırma"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada biceps uzun başını taş gibi sık. Yavaşça başlangıçtaki tam esneme pozisyonuna indir.",
        "phase": "3. Zirve Sıkıştırma"
      }
    ]
  },
  {
    "id": "db_farmers_walk",
    "name": "Farmer's Walk",
    "rawKey": "farmer's walk",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Sırt": 0.35
    },
    "type": "LOADED_CARRY",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_farmers_walk.svg",
    "formImage": "assets/guides/guide_db_farmers_walk_form.jpg",
    "anatomiImage": "assets/guides/guide_db_farmers_walk_anatomi.jpg",
    "cue": "Ağır dambılları kaldır, omuzları geriye kilitle, karın duvarını taş gibi sık ve küçük kontrollü adımlarla yürü.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ağır dambılları düz bir sırtla yerden kaldır. Omuzları geriye ve aşağı sabitle, göğsü dikleştir.",
        "phase": "1. Ağır Kaldırış & Postür"
      },
      {
        "badge": "action",
        "desc": "Dambılların bacaklara çarpmasını engelleyerek küçük ve kontrollü adımlarla düz bir hatta yürü.",
        "phase": "2. Küçük & Dengeli Adımlar"
      },
      {
        "badge": "finish",
        "desc": "Gövdenin sağa sola yatmasına izin verme. Mesafe tamamlanınca dambılları düz sırtla kontrollü yere bırak.",
        "phase": "3. Merkez Kilit & Bırakış"
      }
    ]
  },
  {
    "id": "db_suitcase_carry",
    "name": "Suitcase Carry",
    "rawKey": "suitcase carry",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {},
    "type": "LOADED_CARRY",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_farmers_walk.svg",
    "formImage": "assets/guides/guide_db_farmers_walk_form.jpg",
    "anatomiImage": "assets/guides/guide_db_farmers_walk_anatomi.jpg",
    "cue": "Sadece tek elde ağır dambıl tut, ağırlığın seni yana bükmesine ASLA izin verme, dimdik yürü.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Tek elde ağır bir dambıl tut, diğer kol boşta dengede. Omuzları eşit yükseklikte hizala.",
        "phase": "1. Tek Taraflı Kurulum"
      },
      {
        "badge": "action",
        "desc": "Zıt taraftaki yan karın (oblik) kaslarını taş gibi sıkarak ağırlığın gövdeyi bükmesini engelle, dik yürü.",
        "phase": "2. Anti-Eğim Yürüyüşü"
      },
      {
        "badge": "finish",
        "desc": "Adımları tamamla, omurga dikliğini bozmadan dambılı diğer ele aktar ve aynı mesafeyi yürü.",
        "phase": "3. Duruş ve Kol Değişimi"
      }
    ]
  },
  {
    "id": "db_russian_twist",
    "name": "Russian Twist",
    "rawKey": "russian twist",
    "primary": "Karın/Core",
    "pFactor": 0.7,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_russian_twist.svg",
    "formImage": "assets/guides/guide_db_russian_twist_form.jpg",
    "anatomiImage": "assets/guides/guide_db_russian_twist_anatomi.jpg",
    "cue": "Yere otur, gövdeyi 45° yatır, ayakları kaldır. Dambılı sağ ve sol kalça yanına kontrollü döndür.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Mindere otur, dizleri bük. Gövdeyi 45 derece geriye yatır, ayakları yerden 10 cm kaldır. Dambılı göğüste tut.",
        "phase": "1. V-Oturuş Pozisyonu"
      },
      {
        "badge": "action",
        "desc": "Dambılı gövdeyle birlikte sol kalça yanına doğru çevir, hareketi omuzdan değil karından üret.",
        "phase": "2. Kalça Yanına Rotasyon"
      },
      {
        "badge": "finish",
        "desc": "Merkeze dönerek hemen sağ kalça yanına rotasyon yap, yan karın kaslarını her dönüşte tam sık.",
        "phase": "3. Zıt Tarafa Geçiş"
      }
    ]
  },
  {
    "id": "db_snatch",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_snatch.svg",
    "formImage": "assets/guides/guide_db_snatch_form.jpg",
    "anatomiImage": "assets/guides/guide_db_snatch_anatomi.jpg",
    "cue": "Dambılı bacak arasından patlayıcı kalça vuruşuyla tek hamlede baş üstüne kilitlenene kadar fırlat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuzdan geniş. Dambıl bacak arasında, kalça geride, sırt düz ve göğüs karşıya açık.",
        "phase": "1. Kalça Menteşesi Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı patlayıcı şekilde öne fırlat, topuklardan sıçrar gibi güç üret ve dambılı vücuda yakın çek.",
        "phase": "2. Patlayıcı Kalça İtişi"
      },
      {
        "badge": "finish",
        "desc": "Dambılın altına hızla girerek kolu baş üstünde tek hamlede kilitli yakala. Kontrollü indir.",
        "phase": "3. Baş Üstü Kilitlenme"
      }
    ]
  },
  {
    "id": "db_swing",
    "name": "Dambıl Swing",
    "rawKey": "dambıl swing",
    "primary": "Glute",
    "pFactor": 0.6,
    "sec": {
      "Arka Bacak": 0.4,
      "Karın/Core": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_swing.svg",
    "formImage": "assets/guides/guide_db_swing_form.jpg",
    "anatomiImage": "assets/guides/guide_db_swing_anatomi.jpg",
    "cue": "Dambılın ucundan iki elle tut, squat yapma! Kalçayı geriye menteşele ve kalça vuruşuyla göğüs hizasına fırlat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambılın kafasından iki elle sıkıca tut. Ayaklar omuzdan geniş, kalça geriye uzanmış, sırt masa gibi düz.",
        "phase": "1. Menteşe Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kolları hiç bükmeden, kalçayı patlayıcı şekilde öne kilitleyerek dambılı göğüs hizasına fırlat.",
        "phase": "2. Patlayıcı Kalça Vuruşu"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada kalça ve karın taş gibi kilitlenir. Dambılın iniş momentumunu kalçayla karşıla.",
        "phase": "3. Tepe Kilit & Geri Salınım"
      }
    ]
  },
  {
    "id": "kb_swing",
    "name": "Kettlebell Swing",
    "rawKey": "kettlebell swing",
    "primary": "Glute",
    "pFactor": 0.6,
    "sec": {
      "Arka Bacak": 0.4,
      "Karın/Core": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_swing.svg",
    "formImage": "assets/guides/guide_kb_swing_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_swing_anatomi.jpg",
    "cue": "Kolları halat gibi serbest tut, gülleyi sadece kalça menteşesi ve patlayıcı glute itişiyle fırlat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell önde yerde. Kalçayı geriye menteşele, boynuzdan tut ve gülleyi Amerikan futbolu gibi bacak arasına fırlat.",
        "phase": "1. Hike Pass (Bacak Arasına Alma)"
      },
      {
        "badge": "action",
        "desc": "Bacakları ve kalçayı patlayıcı bir şekilde kilitlerken gülleyi göğüs hizasına doğru fırlat.",
        "phase": "2. Patlayıcı Kalça Kilitlenmesi"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada vücut ayakta dik bir tahta gibidir. Kalça sıkı, karın kilitli. Gülleyi yerçekimiyle geri yakala.",
        "phase": "3. Tepe Tahta Duruşu (Plank)"
      }
    ]
  },
  {
    "id": "kb_clean",
    "name": "Kettlebell Clean",
    "rawKey": "kettlebell clean",
    "primary": "Glute",
    "pFactor": 0.5,
    "sec": {
      "Arka Bacak": 0.4,
      "Karın/Core": 0.3
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_clean_squat.svg",
    "formImage": "assets/guides/guide_kb_clean_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_clean_anatomi.jpg",
    "cue": "Gülleyi bacak arasından çek, dirseği gövdeye yapıştırarak ön kola çarpmadan yumuşakça göğse al.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell tek elle bacak arasında. Kalça geriye menteşelenmiş, sırt düz, göğüs açık.",
        "phase": "1. Salınım Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı patlat, gülleyi dikey hatta yukarı çekerken elini tutamağın etrafında nazikçe kaydır.",
        "phase": "2. Dikey Çekiş & El Geçişi"
      },
      {
        "badge": "finish",
        "desc": "Gülle ön kola çarpmadan başparmak köprücük kemiğinde, dirsek göğse yapışık şekilde kilitlenir.",
        "phase": "3. Rack Pozisyonunda Karşılama"
      }
    ]
  },
  {
    "id": "kb_press",
    "name": "Kettlebell Press",
    "rawKey": "kettlebell press",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_press.svg",
    "formImage": "assets/guides/guide_kb_press_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_press_anatomi.jpg",
    "cue": "Rack pozisyonundan başla, bacaklardan hiç yaylanmadan sadece omuz gücüyle gülleyi baş üstüne kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell göğüste, başparmak köprücük kemiğinde, dirsek kaburgaya yapışık. Kalça ve karın taş gibi kilitli.",
        "phase": "1. Sıkı Rack Pozisyonu"
      },
      {
        "badge": "action",
        "desc": "Dizleri hiç bükmeden nefes ver ve gülleyi kulak hizasından yukarıya doğru dikey presle.",
        "phase": "2. Skapular Pres"
      },
      {
        "badge": "finish",
        "desc": "Kol baş üstünde kulak hizasında kilitlenir. Kontrollü biçimde tekrar sıkı rack pozisyonuna indir.",
        "phase": "3. Baş Üstü Kilitleme"
      }
    ]
  },
  {
    "id": "kb_half_snatch",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_snatch.svg",
    "formImage": "assets/guides/guide_db_snatch_form.jpg",
    "anatomiImage": "assets/guides/guide_db_snatch_anatomi.jpg",
    "cue": "Gülleyi tek hamlede baş üstüne fırlatıp kilitle, indirirken önce göğse (rack) alıp sonra bacak arasına bırak.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell tek elle bacak arasında, kalça menteşelenmiş, patlamaya hazır konumda.",
        "phase": "1. Salınım Fazı"
      },
      {
        "badge": "action",
        "desc": "Kalça itişiyle gülleyi yukarı fırlat, kolu baş üstünde tek hamlede kilitli yakala.",
        "phase": "2. Tek Hamle Baş Üstü Fırlatış"
      },
      {
        "badge": "finish",
        "desc": "Gülleyi baş üstünden önce yumuşakça göğse (rack) indir, ardından bacak arasına salarak bir sonraki tekrara geç.",
        "phase": "3. Rack İndirişi & Sıfırlama"
      }
    ]
  },
  {
    "id": "kb_goblet_squat",
    "name": "Kettlebell Goblet Squat",
    "rawKey": "kettlebell goblet squat",
    "primary": "Ön Bacak",
    "pFactor": 0.9,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_squat.svg",
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Gülleyi boynuzlarından göğse yapıştır, dirsekler dizlerin içine inene kadar derin çömel.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell boynuzlarından iki elle göğüs hizasında tutulur. Ayaklar omuz genişliğinde, uçlar 30° dışa dönük.",
        "phase": "1. Boynuz Tutuş Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Topuklar yerde sabit, kalçayı diz seviyesinin altına indir. Dirsekler dizlerin iç tarafına temas etsin.",
        "phase": "2. Derin Çömelme"
      },
      {
        "badge": "finish",
        "desc": "Yeri ayak tabanlarıyla iterek yukarı kalk, tepe noktada kalçayı ve kuadrisepsi sık.",
        "phase": "3. Patlayıcı Doğrulma"
      }
    ]
  },
  {
    "id": "kb_gorilla_row",
    "name": "Gorilla Row",
    "rawKey": "gorilla row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Karın/Core": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_row.svg",
    "formImage": "assets/guides/guide_kb_gorilla_row_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_gorilla_row_anatomi.jpg",
    "cue": "Goril gibi dizleri bükük ve eğik dur. Bir gülleyi yerde bastırırken diğerini kalçaya patlayıcı çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "İki kettlebell yerde yan yana. Derin menteşe pozisyonunda eğil, eller boynuzlarda, sırt masa gibi düz.",
        "phase": "1. Goril Pozisyonu"
      },
      {
        "badge": "action",
        "desc": "Sol gülleyi yerde bastırırken sağ gülleyi kalça cebine doğru güçlüce çek.",
        "phase": "2. Tek Kol Çekiş, Diğer Kol Baskı"
      },
      {
        "badge": "finish",
        "desc": "Sağ gülleyi yere indirirken hemen sol gülleyi çekmeye başla. Omurga açısını hiç bozma.",
        "phase": "3. Kontrollü Değişim"
      }
    ]
  },
  {
    "id": "kb_windmill",
    "name": "Kettlebell Windmill",
    "rawKey": "kettlebell windmill",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_windmill.svg",
    "formImage": "assets/guides/guide_kb_windmill_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_windmill_anatomi.jpg",
    "cue": "Gülleyi baş üstünde kilitli tut, gözlerini güllenden ayırmadan zıt ayak bileğine doğru gövdeyi döndürerek eğil.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell sağ elde baş üstünde kilitli. Ayak uçları 45 derece sola dönük, sağ bacak dimdik.",
        "phase": "1. Baş Üstü Kilit & Ayak Açısı"
      },
      {
        "badge": "action",
        "desc": "Gözleri tavandaki gülleden ayırmadan kalçayı sağa doğru çıkart, sol elle sol ayak bileğine doğru alçal.",
        "phase": "2. Menteşe & Yere Uzayış"
      },
      {
        "badge": "finish",
        "desc": "Sol el yere yaklaştığında sağ yan karın ve kalça kaslarıyla yukarı doğrul, baş üstü kilidi koru.",
        "phase": "3. Yan Karından Doğrulma"
      }
    ]
  },
  {
    "id": "kb_turkish_getup",
    "name": "Turkish Get-Up",
    "rawKey": "turkish get-up",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Omuz": 0.5,
      "Glute": 0.35
    },
    "type": "MOBILITY_STABILITY",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_windmill.svg",
    "formImage": "assets/guides/guide_kb_windmill_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_windmill_anatomi.jpg",
    "cue": "Gözlerini tavandaki güllenden ayırma! Sırtüstünden ayağa kalkana kadar her eklem adımını sırayla kitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü uzan. Sağ eldeki kettlebell tavana kilitli, sağ diz bükülü, sol kol 45° yerde.",
        "phase": "1. Yerde Kilitlenme"
      },
      {
        "badge": "action",
        "desc": "Gözler ağırlıkta; sol dirseğe sonra sol ele yüksel. Kalçayı kaldırıp sol bacağı arkaya alarak diz çök.",
        "phase": "2. Dirsek ➔ El ➔ Köprü"
      },
      {
        "badge": "finish",
        "desc": "Gövdeyi dikleştirip ayağa kalk. Baş üstü kilidi koruyarak aynı adımlarla yere geri yat.",
        "phase": "3. Ayağa Kalkış & Geri Dönüş"
      }
    ]
  },
  {
    "id": "kb_halo",
    "name": "Kettlebell Halo",
    "rawKey": "kettlebell halo",
    "primary": "Omuz",
    "pFactor": 0.4,
    "sec": {
      "Karın/Core": 0.4
    },
    "type": "MOBILITY_STABILITY",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_press.svg",
    "formImage": "assets/guides/guide_kb_halo_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_halo_anatomi.jpg",
    "cue": "Gülleyi ters çevirip boynuzlardan tut, başını oynatmadan gülleyi başının etrafında haleler çizerek döndür.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell ters (tabanı yukarıda) boynuzlardan göğüs önünde tutulur. Kalça ve karın kilitli.",
        "phase": "1. Göğüste Ters Tutuş"
      },
      {
        "badge": "action",
        "desc": "Boynu ve başı sabit tutarak gülleyi kulağın yanından başın arkasına doğru yumuşakça döndür.",
        "phase": "2. Baş Arkasında Daire"
      },
      {
        "badge": "finish",
        "desc": "Gülleyi diğer kulağın yanından göğse getir. 1 saniye duraklayıp ters yöne aynı daireyi çiz.",
        "phase": "3. Göğse Dönüş & Yön Değişimi"
      }
    ]
  },
  {
    "id": "kb_thruster",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "LOW",
    "sfrLabel": "LOW",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_thruster.svg",
    "formImage": "assets/guides/guide_db_thruster_form.jpg",
    "anatomiImage": "assets/guides/guide_db_thruster_anatomi.jpg",
    "cue": "Derin squat yap, kalkışın patlayıcı momentumunu hiç kesmeden doğrudan baş üstü pres ile birleştir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kettlebell göğüste sıkı rack pozisyonunda, ayaklar omuz genişliğinde çömelmeye hazır.",
        "phase": "1. Rack Pozisyonu Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi dimdik tutarak kalçayı topukların arasına derin squat konumuna indir.",
        "phase": "2. Derin Çöküş"
      },
      {
        "badge": "finish",
        "desc": "Topuklardan patlayıcı kalkarken bacak gücünü doğrudan baş üstü itişe aktar ve kilitlen.",
        "phase": "3. Bacak Momentumlu Pres"
      }
    ]
  },
  {
    "id": "bb_bench_press",
    "name": "Barbell Bench",
    "rawKey": "barbell bench",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.35,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_floor_press.svg",
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Göz hizası barın altında, kürek kemiklerini sehpaya göm, barı alt göğse değdirip patlayıcı it.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Gözler barın altında kalacak şekilde sehpaya uzan. Omuz genişliğinden biraz geniş tut, kürek kemiklerini sehpaya kilitle.",
        "phase": "1. Sehpa & Bar Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Nefes alarak dirsekleri 45° açıyla bük ve barı alt göğüs çizgisine kontrollü indir.",
        "phase": "2. Göğüs Ucuna Kontrollü İniş"
      },
      {
        "badge": "finish",
        "desc": "Ayakları yere basarak barı patlayıcı güçle yukarı it, tepe noktada göğsü sık.",
        "phase": "3. Patlayıcı İtiş & Kilit"
      }
    ]
  },
  {
    "id": "bb_incline_bench",
    "name": "Incline Barbell Bench",
    "rawKey": "incline barbell bench",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {
      "Omuz": 0.45,
      "Triceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_floor_press.svg",
    "formImage": "assets/guides/guide_db_incline_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_incline_press_anatomi.jpg",
    "cue": "30° açılı sehpada barı köprücük kemiğinin hemen altına indir, üst göğüs lifleriyle yukarı presle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "30 derece açılı sehpaya uzan. Barı omuzdan geniş kavra, ayakları yere sağlam bas.",
        "phase": "1. 30° Sehpa Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Barı üst göğüs / köprücük kemiği çizgisine yavaşça indir, dirsekleri aşırı açma.",
        "phase": "2. Köprücük Kemiğine İniş"
      },
      {
        "badge": "finish",
        "desc": "Üst göğüs kaslarını sıkarak barı yukarı it, kollar düzleştiğinde 1 saniye durakla.",
        "phase": "3. Üst Göğüsten Kilitleme"
      }
    ]
  },
  {
    "id": "bb_overhead_press",
    "name": "Barbell Omuz Presi",
    "rawKey": "barbell omuz presi",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {
      "Triceps": 0.35,
      "Karın/Core": 0.25
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_press.svg",
    "formImage": "assets/guides/guide_db_overhead_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_overhead_press_anatomi.jpg",
    "cue": "Barı köprücük kemiğinde tut, başını hafif geriye çekip barı yukarı iterken başını barın altından öne sok.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barı omuz genişliğinde tut, ön kollar yere dik. Bar köprücük kemiği üzerinde dinlenir, kalça sıkı.",
        "phase": "1. Köprücük Kemiği Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Çeneyi hafif geriye alıp barı dikey hatta yukarı it. Bar alnı geçince başı doğal konuma öne al.",
        "phase": "2. Dikey İtiş & Baş Geçişi"
      },
      {
        "badge": "finish",
        "desc": "Bar kafanın tam üzerinde trapezlerle kilitlenir. Kontrollü biçimde köprücük kemiğine indir.",
        "phase": "3. Baş Üstü Kilitlenme"
      }
    ]
  },
  {
    "id": "bb_back_squat",
    "name": "Barbell Back Squat",
    "rawKey": "barbell back squat",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Karın/Core": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_squat.svg",
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Barı üst trapezlere sağlam kilitle, dizleri dışa açarak kalçayı paralel altına indir, ayak tabanıyla yeri parçala.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barı üst trapez kaslarının üzerine yerleştir. Kürek kemiklerini sık, ayaklar omuz genişliği, uçlar dışa 30°.",
        "phase": "1. Bar Yerleşimi (Trapez)"
      },
      {
        "badge": "action",
        "desc": "Dizleri ayak uçları yönüne açarak kalçayı geriye ve aşağı batır. Göğsü dik tut, derin çök.",
        "phase": "2. Paralel Altına Çömelme"
      },
      {
        "badge": "finish",
        "desc": "Bütün ayak tabanıyla yeri iterek doğrul, tepe noktada kalça ve ön bacakları kilitle.",
        "phase": "3. Ayak Tabanıyla Yeri İtiş"
      }
    ]
  },
  {
    "id": "bb_front_squat",
    "name": "Barbell Front Squat",
    "rawKey": "barbell front squat",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.4
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_clean_squat.svg",
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Barı omuz önünde ön rack pozisyonunda tut, dirsekleri tavana doğru yüksek tutarak dimdik çömel.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barı ön omuz başlarına yasla. Parmak uçlarıyla hafif destekle, dirsekleri yere paralel yukarı kaldır.",
        "phase": "1. Ön Rack Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri yüksek tutarak gövdenin öne yatmasını engelle, kalçayı topukların arasına indir.",
        "phase": "2. Dimdik Gövdeyle Çöküş"
      },
      {
        "badge": "finish",
        "desc": "Ön bacaklardan aldığın güçle yukarı fırla, tepe noktada kalçayı sık.",
        "phase": "3. Kuadriseps Patlaması"
      }
    ]
  },
  {
    "id": "bb_deadlift",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "LOW",
    "sfrLabel": "LOW",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_rdl.svg",
    "formImage": "assets/guides/guide_bb_deadlift_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_deadlift_anatomi.jpg",
    "cue": "Bar kaval kemiğine temas etsin, sırt masa gibi düz, yeri ayak tabanlarınla iterek kalçayı kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde, bar kaval kemiğine 2 cm yakın. Eğil, barı kavra, sırtı masa gibi düzleştir.",
        "phase": "1. Kaval Kemiği Teması"
      },
      {
        "badge": "action",
        "desc": "Yeri ayak tabanlarınla iterek bacaklardan güç al. Barı bacaklarından hiç ayırmadan yukarı çek.",
        "phase": "2. Yeri İterek Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada kalça ve dizleri tam kilitle (geriye aşırı yatma). Karın duvarını taş gibi sık.",
        "phase": "3. Dik Kilitlenme"
      }
    ]
  },
  {
    "id": "bb_rdl",
    "name": "Barbell RDL",
    "rawKey": "barbell rdl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.5,
      "Sırt": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_rdl.svg",
    "formImage": "assets/guides/guide_db_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_rdl_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, barı kaval kemiği boyunca indirerek kalçayı arkaya menteşele.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakta dik duruş, bar uylukların önünde. Kürek kemikleri geride kilitli.",
        "phase": "1. Ayakta Düz Sırt"
      },
      {
        "badge": "action",
        "desc": "Diz açısını sabit tutarak kalçayı geriye it. Bar bacaklara yapışık şekilde kaval kemiği ortasına insin.",
        "phase": "2. Kalçayı Arkaya İtme"
      },
      {
        "badge": "finish",
        "desc": "Arka bacaklardaki gerilimi kullanarak öne doğrul ve kalçayı tepe noktada tam sık.",
        "phase": "3. Hamstring Gücüyle Doğrulma"
      }
    ]
  },
  {
    "id": "bb_hip_thrust",
    "name": "Barbell Hip Thrust",
    "rawKey": "barbell hip thrust",
    "primary": "Glute",
    "pFactor": 1,
    "sec": {
      "Arka Bacak": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_rdl.svg",
    "formImage": "assets/guides/guide_bb_hip_thrust_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_hip_thrust_anatomi.jpg",
    "cue": "Sırt sehpaya dayalı, süngerli bar kalça kıvrımında, topuklardan yeri iterek tepe noktada kalçayı taş gibi kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kürek kemikleri sehpada, süngerli bar kalça kıvrımında. Dizler bükülü, ayaklar omuz genişliği yerde.",
        "phase": "1. Sehpa & Bar Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Çeneyi göğse yakın tutarak topuklardan yeri güçlüce it ve kalçayı yukarı fırlat.",
        "phase": "2. Topuktan Kalça İtişi"
      },
      {
        "badge": "finish",
        "desc": "Dizler 90 derece dik açı oluşturur. Tepe noktada kalça kaslarını 1-2 saniye taş gibi sık.",
        "phase": "3. 90° Tepe Kilidi"
      }
    ]
  },
  {
    "id": "bb_bent_over_row",
    "name": "Barbell Row",
    "rawKey": "barbell row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.4,
      "Omuz": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_incline_row.svg",
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Gövdeyi 45° öne eğ, omurgayı düz tut, barı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde. Gövdeyi 45 derece öne eğ, dizler hafif kırık, omurga dümdüz nötr.",
        "phase": "1. 45° Eğimli Kurulum"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri geriye ve yukarı doğru çekerek barı göbek deliği hizasına doğru getir.",
        "phase": "2. Göbek Deliğine Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada kürek kemiklerini birbirine yapıştır. 1 saniye sık ve kontrollü aşağı bırak.",
        "phase": "3. Kürek Kemiklerini Sıkıştırma"
      }
    ]
  },
  {
    "id": "bb_pendlay_row",
    "name": "Pendlay Row",
    "rawKey": "pendlay row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.35,
      "Omuz": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_incline_row.svg",
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Gövde yere tam paralel (90°). Her tekrarda bar yerden sıfırdan başlar, patlayıcı alt göğse çekilip yere bırakılır.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Gövde yere 90 derece paralel. Bar yerde plakalarda durur. Sırt dümdüz, dizler hafif bükük.",
        "phase": "1. Yere Tam Paralel Başlangıç"
      },
      {
        "badge": "action",
        "desc": "Sıfır momentum noktasından barı patlayıcı güçle alt göğüs / kaburga çizgisine çek.",
        "phase": "2. Yerden Patlayıcı Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Barı tekrar zemine bırak, her tekrarda momentumu sıfırlayıp yeniden çek.",
        "phase": "3. Zemine Tam Sıfırlama"
      }
    ]
  },
  {
    "id": "bb_biceps_curl",
    "name": "Barbell Curl",
    "rawKey": "barbell curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_biceps_curl.svg",
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Dirsekleri gövdeye yapıştır, belden savurma yapmadan sadece ön kolları bükerek barı göğse doğru kıvır.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barı omuz genişliğinde alttan tut. Dirsekler gövdeye yapışık, omuzlar geride ve sabit.",
        "phase": "1. Dik Duruş & Tutuş"
      },
      {
        "badge": "action",
        "desc": "Belden hiç momentum almadan sadece ön kolları bükerek barı göğüs hizasına doğru kaldır.",
        "phase": "2. Dirsek Sabit Kıvırma"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada biceps kaslarını taş gibi sık. 3 saniyede yavaşça başlangıç pozisyonuna indir.",
        "phase": "3. Tepe Biceps Sıkıştırma"
      }
    ]
  },
  {
    "id": "bb_close_grip_bench",
    "name": "Dar Tutuş Bench",
    "rawKey": "dar tutuş bench",
    "primary": "Triceps",
    "pFactor": 0.85,
    "sec": {
      "Göğüs": 0.5,
      "Omuz": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_floor_press.svg",
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Elleri omuz genişliğinde dar tut, inişte dirsekleri gövdeye yapışık tutarak ağırlığı triceps ile presle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sehpaya uzan. Barı omuz genişliğinde (bilekleri kırmayacak makul darlıkta) kavra, kürek kemiklerini sabitle.",
        "phase": "1. Dar Tutuş Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri dışa açmadan gövdeye sürtünürcesine yapışık tutarak barı alt göğse indir.",
        "phase": "2. Gövdeye Yapışık İniş"
      },
      {
        "badge": "finish",
        "desc": "Triceps kaslarıyla patlayıcı itiş yap ve tepe noktada kolları düzleştirerek kilitlen.",
        "phase": "3. Triceps Kilitlemesi"
      }
    ]
  },
  {
    "id": "mach_lat_pulldown",
    "name": "Lat Pulldown",
    "rawKey": "lat pulldown",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.35,
      "Omuz": 0.2
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_incline_row.svg",
    "formImage": "assets/guides/guide_mach_lat_pulldown_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_lat_pulldown_anatomi.jpg",
    "cue": "Bacak pedine sıkıca otur, barı üst göğse doğru dirsekleri kaburgalara çekerek indir, arkaya aşırı yatma.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dizleri pedin altına sabitle. Barı omuzdan geniş tutuşla kavra, göğsü dik tut.",
        "phase": "1. Makineye Yerleşim"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri aşağı ve geriye doğru yönlendirerek barı köprücük kemiğinin hemen altına çek.",
        "phase": "2. Üst Göğse Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada kanat kaslarını tam sık. Ağırlığı kontrollü biçimde yukarı serbest bırak.",
        "phase": "3. Kanat Sıkıştırma"
      }
    ]
  },
  {
    "id": "mach_cable_row",
    "name": "Kablo Row",
    "rawKey": "kablo row",
    "primary": "Sırt",
    "pFactor": 1,
    "sec": {
      "Biceps": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_incline_row.svg",
    "formImage": "assets/guides/guide_mach_cable_row_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_row_anatomi.jpg",
    "cue": "Ayakları platforma bas, sırtı dik tut, tutacağı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sehpaya otur, ayakları platforma sağlam bas, dizler hafif kırık. V-tutacağı kavra, omurga dimdik.",
        "phase": "1. Oturak & Platform Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi geriye savurmadan dirsekleri geriye çekerek tutacağı alt karına getir.",
        "phase": "2. Göbek Deliğine Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Kürek kemiklerini arkada yapıştır, 1 saniye sık ve kontrollü olarak kolları uzat.",
        "phase": "3. Sırt Kaslarını Kilitleme"
      }
    ]
  },
  {
    "id": "mach_face_pull",
    "name": "Face Pull",
    "rawKey": "face pull",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Sırt": 0.5
    },
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_lateral_raise.svg",
    "formImage": "assets/guides/guide_mach_face_pull_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_face_pull_anatomi.jpg",
    "cue": "Halatı göz hizasından tut, dirsekleri yüksekte dışa açarak halatın ortasını alnına doğru çek ve arka omuzu sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Halatı göz hizasında kavra, başparmaklar arkaya baksın. Geriye bir adım at, dizler hafif kırık.",
        "phase": "1. Halat Tutuş & Adım"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri yüksek ve geriye çekerek halatın ortasını burnuna/alnına doğru yaklaştır.",
        "phase": "2. Dirsekler Yüksek Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Dip noktada elleri kulak yanına aç, arka omuz ve kürek kemiklerini taş gibi sık.",
        "phase": "3. Dış Rotasyon & Kilit"
      }
    ]
  },
  {
    "id": "mach_cable_crossover",
    "name": "Kablo Crossover",
    "rawKey": "kablo crossover",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_floor_press.svg",
    "formImage": "assets/guides/guide_mach_pec_deck_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_pec_deck_anatomi.jpg",
    "cue": "Dirseklerde hafif sabit açı tut, kolları büyük bir ağaca sarılır gibi göğsün önünde birleştir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yüksek makaralardan tutacakları al, öne bir adım atarak gövdeyi hafif eğik sabitle.",
        "phase": "1. Kablo Arasında Duruş"
      },
      {
        "badge": "action",
        "desc": "Dirsek açısını hiç bozmadan kolları öne ve aşağı doğru geniş bir yay çizerek kapat.",
        "phase": "2. Ağaca Sarılma Hareketi"
      },
      {
        "badge": "finish",
        "desc": "Eller göğüs önünde buluştuğunda göğüs kaslarını 1-2 saniye sık, yavaşça geriye aç.",
        "phase": "3. Göğüs Zirve Sıkışması"
      }
    ]
  },
  {
    "id": "mach_pec_deck",
    "name": "Pec Deck Kelebek",
    "rawKey": "pec deck kelebek",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_floor_press.svg",
    "formImage": "assets/guides/guide_mach_pec_deck_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_pec_deck_anatomi.jpg",
    "cue": "Dirsekleri pedlere veya tutacaklara yerleştir, omuzları geride tutarak göğüs kaslarınla kolları önde kapat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Koltuk yüksekliğini dirsekler omuz hizasından hafif aşağıda olacak şekilde ayarla. Sırtı mindere yapıştır.",
        "phase": "1. Makineye Yerleşim"
      },
      {
        "badge": "action",
        "desc": "Göğüs kaslarını kullanarak kolları önde birleştir, omuzların öne yuvarlanmasına izin verme.",
        "phase": "2. Önde Kapatma"
      },
      {
        "badge": "finish",
        "desc": "Önde 1 saniye göğsü tam kasılmayla sık. Yavaşça göğüs kasları esneyene kadar başlangıca dön.",
        "phase": "3. Zirve Kasılma & Esneme"
      }
    ]
  },
  {
    "id": "mach_triceps_pushdown",
    "name": "Halat Triceps Pushdown",
    "rawKey": "halat triceps pushdown",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_skull_crusher.svg",
    "formImage": "assets/guides/guide_mach_triceps_pushdown_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_triceps_pushdown_anatomi.jpg",
    "cue": "Dirsekleri gövdeye yapıştır, halatı aşağı iterken dip noktada uçlarını yana doğru açarak triceps kaslarını kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Halatı göğüs hizasında tut. Dirsekleri kaburgalara yapıştır, gövdeyi hafifçe öne eğ.",
        "phase": "1. Halat Tutuş & Dirsek Kilidi"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri hiç oynatmadan sadece ön kolları aşağı doğru it.",
        "phase": "2. Aşağı İtiş"
      },
      {
        "badge": "finish",
        "desc": "Dip noktada halatın uçlarını yana doğru ayırarak triceps kaslarını taş gibi sık.",
        "phase": "3. Halat Uçlarını Açma & Kilit"
      }
    ]
  },
  {
    "id": "mach_cable_biceps",
    "name": "Kablo Biceps Curl",
    "rawKey": "kablo biceps curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_biceps_curl.svg",
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Düşük makarada düz barı tut, dirsekleri sabit tutarak kablonun sürekli geriliminde biceps kaslarını sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Alt makaradaki barı alttan tut, 1 adım geriye çekil. Dirsekler gövdeye yapışık, dik dur.",
        "phase": "1. Düşük Makara Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kablo direncine karşı dirsekleri oynatmadan barı göğüs hizasına doğru kaldır.",
        "phase": "2. Sürekli Gerilimle Kıvırma"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada biceps kaslarını tam sık. Negatif fazda ağırlığı yavaşça aşağı bırak.",
        "phase": "3. Tepe Kasılma"
      }
    ]
  },
  {
    "id": "mach_cable_lateral",
    "name": "Kablo Lateral Raise",
    "rawKey": "kablo lateral raise",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_lateral_raise.svg",
    "formImage": "assets/guides/guide_mach_cable_lateral_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_lateral_anatomi.jpg",
    "cue": "Alt makaradan kabloyu gövdenin arkasından veya önünden tut, dirseği hafif bükük omuz hizasına kaldır.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Makaraya yan dur, tek elle tutacağı kavra. Gövde dimdik, omuzlar aşağıda sabit.",
        "phase": "1. Makara Yanında Duruş"
      },
      {
        "badge": "action",
        "desc": "Dirsek hafif kırık vaziyette kolu yana doğru omuz hizasına kadar yükselt.",
        "phase": "2. Yana Doğru Açılış"
      },
      {
        "badge": "finish",
        "desc": "Omuz hizasında 1 saniye duraklayarak yan deltoidi sık, kablonun çekişine direnerek yavaşça indir.",
        "phase": "3. Tepe İzolasyon"
      }
    ]
  },
  {
    "id": "mach_leg_press",
    "name": "45° Leg Press",
    "rawKey": "45° leg press",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.35
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_squat.svg",
    "formImage": "assets/guides/guide_mach_leg_press_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_press_anatomi.jpg",
    "cue": "Bel boşluğunu arkadaki mindere tamamen yapıştır, dizleri 90° büküp platformu ayak tabanlarıyla güçlüce it (dizleri kilitleme).",
    "positions": [
      {
        "badge": "setup",
        "desc": "Makineye otur, belini ve kalçanı mindere tamamen yapıştır. Ayaklar platformda omuz genişliği.",
        "phase": "1. Platform & Bel Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Emniyet kolunu aç ve platformu dizlerin 90 derece büküleceği noktaya kadar kontrollü indir.",
        "phase": "2. 90° Diz Büküşü"
      },
      {
        "badge": "finish",
        "desc": "Tüm tabanla platformu yukarı it. Tepe noktada dizleri asla aşırı kilitleme (hafif kırık bırak).",
        "phase": "3. Güçlü İtiş (Dizleri Kitleme)"
      }
    ]
  },
  {
    "id": "mach_leg_extension",
    "name": "Leg Extension",
    "rawKey": "leg extension",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_leg_extension.svg",
    "formImage": "assets/guides/guide_mach_leg_extension_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_extension_anatomi.jpg",
    "cue": "Diz eklemini makinenin dönme noktasıyla hizala, bacakları yukarı uzatıp tepe noktada kuadrisepsi taş gibi sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Pedi kaval kemiğinin alt kısmına ayarla. Sırtı mindere yasla, yan tutacakları sıkıca kavra.",
        "phase": "1. Makine Ayarı"
      },
      {
        "badge": "action",
        "desc": "Sadece diz eklemini kullanarak bacakları yukarı doğru düzleştir.",
        "phase": "2. Bacakları Yukarı Uzatma"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada ön bacak kaslarını 1-2 saniye taş gibi sık, yavaşça kontrollü aşağı indir.",
        "phase": "3. Zirve Kuadriseps Kilidi"
      }
    ]
  },
  {
    "id": "mach_leg_curl",
    "name": "Leg Curl",
    "rawKey": "leg curl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_leg_curl.svg",
    "formImage": "assets/guides/guide_mach_leg_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_curl_anatomi.jpg",
    "cue": "Pedi aşil tendonunun hemen üzerine ayarla, topukları kalçaya doğru bükerek hamstring kaslarını sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Minderde yerleş, döner pedi aşil tendonunun hemen üzerine oturt. Tutacakları kavra.",
        "phase": "1. Minder & Ped Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı mindere yapışık tutarak ayakları geriye ve kalçaya doğru güçlüce bük.",
        "phase": "2. Kalçaya Doğru Büküş"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada arka bacakları tam sıkıştır. Ağırlığı 3 saniyede kontrollü olarak serbest bırak.",
        "phase": "3. Hamstring Sıkıştırma"
      }
    ]
  },
  {
    "id": "mach_calf_raise",
    "name": "Calf Raise",
    "rawKey": "calf raise",
    "primary": "Kalf",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_calf_raise.svg",
    "formImage": "assets/guides/guide_mach_calf_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_calf_raise_anatomi.jpg",
    "cue": "Topukları yerden maksimum yüksekliğe kaldırarak TAMAMEN AYAK PARMAK UÇLARINDA YÜKSEL. Tepe noktada baldır kaslarını (kalf) 2 saniye kilitli tut, topukları yere çarpmadan 3 saniyede kontrollü indir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "İki elde dambıllarla dik duruş. Ayak parmak kökleri düz zemine veya basamak kenarına basar, topuklar gergin.",
        "phase": "1. Düz Taban & Kurulum"
      },
      {
        "badge": "action",
        "desc": "Ayak parmak köklerine tüm gücünle basarak topukları göğe dik. Vücut ağırlığını ve dambılları tamamen parmak uçlarında taşıyarak kalf kaslarını zirvede 2 sn boyunca taş gibi sıkıştır.",
        "phase": "2. Parmak Ucunda Maksimum Zirve"
      },
      {
        "badge": "lock",
        "desc": "Topukları yere çarpmadan veya yaylanmadan, 3 saniyede kontrollü olarak tabana indirerek aşil tendonunu ve baldırı derinlemesine esnet.",
        "phase": "3. 3 Sn Kontrollü Negatif İniş"
      }
    ]
  },
  {
    "id": "mach_cable_woodchopper",
    "name": "Kablo Woodchopper",
    "rawKey": "kablo woodchopper",
    "primary": "Karın/Core",
    "pFactor": 0.8,
    "sec": {
      "Omuz": 0.2
    },
    "type": "CORE",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_russian_twist.svg",
    "formImage": "assets/guides/guide_mach_cable_woodchopper_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_woodchopper_anatomi.jpg",
    "cue": "Yüksek makaradan tutacağı çift elle kavra, kolları düz tutarak gövde rotasyonuyla zıt diz yönüne çapraz çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Makaraya yan dur, tutacağı çift elle yukarıda kavra. Ayaklar omuz genişliği, karın kilitli.",
        "phase": "1. Yüksek Makara & Çapraz Duruş"
      },
      {
        "badge": "action",
        "desc": "Kolları neredeyse düz tutarak kabloyu yukarıdan aşağıya ve zıt dize doğru çapraz çek.",
        "phase": "2. Çapraz Eksen Rotasyonu"
      },
      {
        "badge": "finish",
        "desc": "Dip noktada oblik kaslarını sık, kontrollü bir şekilde başlangıç noktasına geri dön.",
        "phase": "3. Yan Karın Kilidi"
      }
    ]
  },
  {
    "id": "bw_pushup",
    "name": "Şınav (Push-Up)",
    "rawKey": "şınav (push-up)",
    "primary": "Göğüs",
    "pFactor": 0.65,
    "sec": {
      "Omuz": 0.25,
      "Triceps": 0.25,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_pushup.svg",
    "formImage": "assets/guides/guide_bw_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_pushup_anatomi.jpg",
    "cue": "Gövde baştan topuğa cetvel gibi düz, dirsekler 45° açıyla geriye insin, göğüs yere 2 cm kalana kadar çök.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Eller omuz genişliğinden biraz geniş, ayak parmakları yerde. Gövde baştan topuğa cetvel gibi düz, karın sıkı.",
        "phase": "1. Plank Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri geriye 45 derece açıyla bükerek göğsü yere 2 cm kalana kadar kontrollü alçalt.",
        "phase": "2. 45° Dirsek İnişi"
      },
      {
        "badge": "finish",
        "desc": "Yeri avuçlarınla güçlüce iterek yüksel, tepe noktada göğüs ve triceps kaslarını tam kilitle.",
        "phase": "3. Patlayıcı İtiş & Kilit"
      }
    ]
  },
  {
    "id": "bw_decline_pushup",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_pushup.svg",
    "formImage": "assets/guides/guide_bw_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_pushup_anatomi.jpg",
    "cue": "Ayakları sehpa veya kutu üzerine koy, vücut eğimini koruyarak üst göğüs odaklı şınav çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakları sehpaya koy, eller yerde omuz genişliğinde. Gövde baştan topuğa düz, karın kilitli.",
        "phase": "1. Ayaklar Yüksekte Kurulum"
      },
      {
        "badge": "action",
        "desc": "Gövde açısını bozmadan başı ve göğsü ellerin arasına doğru kontrollü yaklaştır.",
        "phase": "2. Üst Göğse İniş"
      },
      {
        "badge": "finish",
        "desc": "Üst göğüs ve ön omuz kaslarıyla yeri iterek başlangıç pozisyonuna yüksel.",
        "phase": "3. Üst Göğüsten İtiş"
      }
    ]
  },
  {
    "id": "bw_diamond_pushup",
    "name": "Elmas Şınav",
    "rawKey": "elmas şınav",
    "primary": "Triceps",
    "pFactor": 0.7,
    "sec": {
      "Göğüs": 0.35,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_diamond_pushup.svg",
    "formImage": "assets/guides/guide_bw_diamond_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_diamond_pushup_anatomi.jpg",
    "cue": "Başparmak ve işaret parmaklarını göğüs altında elmas şeklinde birleştir, dirsekleri gövdeye yapışık tutarak it.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Elleri göğsün tam altında başparmak ve işaret parmakları birbirine değecek şekilde elmas yap.",
        "phase": "1. Elmas El Pozisyonu"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri dışa açmadan gövdeye paralel bükerek göğsü ellerin üzerine indir.",
        "phase": "2. Dirsekler Gövdeye Bitişik İniş"
      },
      {
        "badge": "finish",
        "desc": "Triceps kaslarını sıkarak gövdeyi yukarı it ve tepe noktada kolları kilitle.",
        "phase": "3. Triceps Patlaması"
      }
    ]
  },
  {
    "id": "bw_dips",
    "name": "Dips",
    "rawKey": "dips",
    "primary": "Göğüs",
    "pFactor": 0.85,
    "sec": {
      "Triceps": 0.4,
      "Omuz": 0.3
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_dips.svg",
    "formImage": "assets/guides/guide_bw_dips_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_dips_anatomi.jpg",
    "cue": "Paralel barlarda gövdeyi 30° öne eğ, dirsekler 90° olana kadar kontrollü in ve tepeye kilitlen.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Paralel barlara asıl, kollar düz. Omuzları aşağı bastır, gövdeyi hafifçe öne eğ (30 derece).",
        "phase": "1. Barlarda Kilitlenme"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri 90 derece bükülene kadar kontrollü alçal. Dirseklerin dışa fazla açılmasına izin verme.",
        "phase": "2. 90° Derin İniş"
      },
      {
        "badge": "finish",
        "desc": "Barları güçlüce aşağı iterek tepe noktaya yüksel, kolları düzleştir ve göğsü sık.",
        "phase": "3. Göğüs & Triceps İtişi"
      }
    ]
  },
  {
    "id": "bw_pullup",
    "name": "Barfiks (Pull-Up)",
    "rawKey": "barfiks (pull-up)",
    "primary": "Sırt",
    "pFactor": 0.85,
    "sec": {
      "Biceps": 0.4,
      "Karın/Core": 0.25
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_chinup.svg",
    "formImage": "assets/guides/guide_bw_pullup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_pullup_anatomi.jpg",
    "cue": "Barı omuzdan geniş kavra, sallanmadan göğsü bara doğru yükselt, çene barı geçince kanatları sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barı omuzdan geniş tutuşla kavra. Kürek kemiklerini aşağı bastırarak omuzları kilitle, bacaklar sabit.",
        "phase": "1. Asılma & Skapular Kilit"
      },
      {
        "badge": "action",
        "desc": "Dirsekleri kaburgalara doğru çekerek göğsü bara yükselt. Bacakları savurma veya sallanma.",
        "phase": "2. Göğsü Bara Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Çene barın üzerine çıktığında kanat kaslarını 1 saniye taş gibi sık. Kontrollü biçimde tam uzanışa in.",
        "phase": "3. Çene Üstte & Kanat Kilit"
      }
    ]
  },
  {
    "id": "bw_chinup",
    "name": "Chin-Up (Ters Barfiks)",
    "rawKey": "chin-up (ters barfiks)",
    "primary": "Biceps",
    "pFactor": 0.85,
    "sec": {
      "Sırt": 0.65
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_chinup.svg",
    "formImage": "assets/guides/guide_bw_chinup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_chinup_anatomi.jpg",
    "cue": "Avuç içleri yüzüne baksın (ters tutuş), dirsekleri önden çekerek çeneyi barın üstüne yükselt ve biceps ile sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Avuç içleri yüze bakacak şekilde omuz genişliğinde bara asıl. Omuzları aşağı sabitle.",
        "phase": "1. Ters Tutuş Asılma"
      },
      {
        "badge": "action",
        "desc": "Biceps ve sırt kaslarını sıkarak çeneyi barın üzerine doğru patlayıcı biçimde çek.",
        "phase": "2. Biceps & Sırt Çekişi"
      },
      {
        "badge": "finish",
        "desc": "Çene barın üzerindeyken biceps kaslarını tam sık. Negatif inişi 3 saniyede yavaşça yap.",
        "phase": "3. Tepe Biceps Sıkıştırma"
      }
    ]
  },
  {
    "id": "bw_inverted_row",
    "name": "Yatay Barfiks",
    "rawKey": "yatay barfiks",
    "primary": "Sırt",
    "pFactor": 0.7,
    "sec": {
      "Biceps": 0.35,
      "Karın/Core": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_incline_row.svg",
    "formImage": "assets/guides/guide_bw_inverted_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_inverted_row_anatomi.jpg",
    "cue": "Alçak barın altına gir, topuklar yerde, gövde cetvel gibi düz, göğsü bara değene kadar çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Alçak bir barın altına uzan, barı omuzdan geniş kavra. Topuklar yerde, gövde düz bir hat oluşturur.",
        "phase": "1. Bar Altı Düz Gövde"
      },
      {
        "badge": "action",
        "desc": "Kürek kemiklerini birbirine çekerek göğsü bara temas edene kadar yukarı çek.",
        "phase": "2. Göğsü Bara Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada orta sırtı tam sık, kolları yavaşça açarak başlangıç çizgisine dön.",
        "phase": "3. Kürek Kemiği Sıkıştırma"
      }
    ]
  },
  {
    "id": "bw_air_squat",
    "name": "Air Squat",
    "rawKey": "air squat",
    "primary": "Ön Bacak",
    "pFactor": 0.3,
    "sec": {
      "Glute": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_squat.svg",
    "formImage": "assets/guides/guide_bw_air_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_air_squat_anatomi.jpg",
    "cue": "Kolları önde dengede tut, topuklar yerden ayrılmadan kalçayı diz seviyesinin altına kadar derin indir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde, uçlar 20 derece dışa dönük. Kollar önde dengede, göğüs dik.",
        "phase": "1. Ayakta Denge Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı geriye ve aşağı batırarak paralel seviyenin altına in, dizleri ayak uçları yönünde aç.",
        "phase": "2. Derin Çömelme (Full ROM)"
      },
      {
        "badge": "finish",
        "desc": "Tüm tabanla yeri iterek doğrul, tepe noktada kalçayı ve ön bacakları sık.",
        "phase": "3. Tabanla Yeri İtiş"
      }
    ]
  },
  {
    "id": "bw_jump_squat",
    "name": "Jump Squat",
    "rawKey": "jump squat",
    "primary": "Ön Bacak",
    "pFactor": 0.5,
    "sec": {
      "Glute": 0.35
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_squat.svg",
    "formImage": "assets/guides/guide_bw_air_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_air_squat_anatomi.jpg",
    "cue": "Derin squat derinliğine in, tavana doğru patlayıcı sıçra ve parmak ucundan topuğa yumuşakça iniş yap.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Squat formunda çömel, kollar geride yaylanmaya hazır, göğüs açık.",
        "phase": "1. Squat Çöküşü"
      },
      {
        "badge": "action",
        "desc": "Ayak tabanlarından patlayıcı kuvvet üreterek tavana doğru maksimum yükseklikte sıçra.",
        "phase": "2. Tavana Patlayıcı Sıçrama"
      },
      {
        "badge": "finish",
        "desc": "Parmak uçlarından topuğa doğru yumuşak iniş yaparak hemen bir sonraki squat fazına geç.",
        "phase": "3. Yumuşak Yaylı İniş"
      }
    ]
  },
  {
    "id": "bw_glute_bridge",
    "name": "Glute Bridge",
    "rawKey": "glute bridge",
    "primary": "Glute",
    "pFactor": 1,
    "sec": {
      "Arka Bacak": 0.3
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_rdl.svg",
    "formImage": "assets/guides/guide_bw_glute_bridge_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_glute_bridge_anatomi.jpg",
    "cue": "Yerde sırtüstü yat, dizler 90° bükülü, topuklardan yeri iterek kalçayı omuz-diz hattında düz olana kadar kaldır.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yere sırtüstü uzan, dizler bükülü, ayak tabanları kalçaya yakın yerde. Kollar iki yanda rahat.",
        "phase": "1. Sırtüstü Zemin Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Topuklarla yeri ezerek kalçayı yukarı kaldır, gövde ve uyluklar düz bir hat oluştursun.",
        "phase": "2. Topuktan Kalça İtişi"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada kalçayı 2 saniye taş gibi sık (beli aşırı bükme), yavaşça yere temas etmeden indir.",
        "phase": "3. Tepe Glute Sıkıştırması"
      }
    ]
  },
  {
    "id": "bw_hanging_knee_raise",
    "name": "Barda Dize Çekme",
    "rawKey": "barda dize çekme",
    "primary": "Karın/Core",
    "pFactor": 0.85,
    "sec": {
      "Sırt": 0.2
    },
    "type": "BODYWEIGHT_STRENGTH",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_leg_raise.svg",
    "formImage": "assets/guides/guide_bw_hanging_knee_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_hanging_knee_raise_anatomi.jpg",
    "cue": "Barfiks barında asılıyken gövdeyi sallamadan dizleri göğse doğru çek, pelvisi yukarı yuvarlayarak alt karını sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barfiks barına iki elle asıl. Omuzları aşağı bastırarak skapular kilit sağla, bacaklar düz.",
        "phase": "1. Barda Asılma"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi sallamadan dizleri göğse doğru patlayıcı biçimde çek, pelvisi hafifçe yukarı yuvarla.",
        "phase": "2. Dizleri Göğse Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada alt karını 1 saniye sık. Bacakları savurmadan kontrollüce başlangıca indir.",
        "phase": "3. Tepe Alt Karın Kilidi"
      }
    ]
  },
  {
    "id": "bw_hollow_body",
    "name": "Hollow Body",
    "rawKey": "hollow body",
    "primary": "Karın/Core",
    "pFactor": 0.8,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_plank_pull_through.svg",
    "formImage": "assets/guides/guide_bw_hollow_body_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_hollow_body_anatomi.jpg",
    "cue": "Sırtüstü yat, bel boşluğunu zemine sıfır boşlukla yapıştır, kolları ve bacakları hafif kaldırarak muz şeklinde kilitlen.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü uzan. Bel çukurunu mindere tamamen yapıştır (aradan kağıt bile geçmemeli).",
        "phase": "1. Bel Boşluğunu Sıfırlama"
      },
      {
        "badge": "action",
        "desc": "Kolları baş gerisinde, bacakları 15 cm yukarıda tutarak vücudu sığ bir muz şekline getir.",
        "phase": "2. Kollar & Bacaklar Havada"
      },
      {
        "badge": "finish",
        "desc": "Tüm karın duvarını taş gibi sıkarak nefes alıp verişi bozmadan belirlenen süre boyunca sabit kal.",
        "phase": "3. Statik Karın Zırhı"
      }
    ]
  },
  {
    "id": "bw_plank",
    "name": "Plank",
    "rawKey": "plank",
    "primary": "Karın/Core",
    "pFactor": 0.5,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_plank_pull_through.svg",
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Dirsekler ve ayak parmak uçlarında vücudu cetvel gibi düz tut, karnı ve kalçayı taş gibi sıkarak beli koru.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dirsekler omuzların tam altında yerde. Parmak uçlarında yüksel, boyun nötr, bakışlar yerde.",
        "phase": "1. Dirsek Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Karın, kalça ve bacakları taş gibi sık. Belin aşağı çökmesine veya kalçanın yukarı dikilmesine ASLA izin verme.",
        "phase": "2. Cetvel Gibi Düz Hat"
      },
      {
        "badge": "finish",
        "desc": "Kürek kemiklerini tavana doğru hafifçe iterek sabit kal. Sakin ve derin diyafram nefesi al.",
        "phase": "3. Statik Direnç & Nefes"
      }
    ]
  },
  {
    "id": "bw_burpee",
    "name": "Burpee",
    "rawKey": "burpee",
    "primary": "Kondisyon / Kardiyo",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "N/A",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_escalera.svg",
    "formImage": "assets/guides/guide_bw_burpee_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_burpee_anatomi.jpg",
    "cue": "Hızla çömel, ayakları geriye atıp göğsü yere dokundur, ayakları geri çekip tavana doğru alkışla sıçra.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakta duruş. Hızlıca çömelerek elleri ayakların hemen önüne yere sağlam bas.",
        "phase": "1. Çömelme & El Basışı"
      },
      {
        "badge": "action",
        "desc": "Ayakları geriye fırlatıp şınav pozisyonuna geç, göğsü ve uylukları zemine hafifçe dokundur.",
        "phase": "2. Geriye Fırlayış & Göğüs Yere"
      },
      {
        "badge": "finish",
        "desc": "Yeri itip ayakları ellerin yanına çek, hemen tavana doğru eller baş üstünde sıçra.",
        "phase": "3. Toplanış & Havada Sıçrama"
      }
    ]
  },
  {
    "id": "bw_mountain_climber",
    "name": "Mountain Climber",
    "rawKey": "mountain climber",
    "primary": "Tüm Vücut",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "N/A",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_plank_pull_through.svg",
    "formImage": "assets/guides/guide_bw_mountain_climber_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_mountain_climber_anatomi.jpg",
    "cue": "Yüksek şınav pozisyonunda kalçayı kaldırmadan dizleri sırayla koşar adım göğse çek.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Eller omuzların altında yüksek plank pozisyonu al. Gövde düz, kalça omuz hizasında sabit.",
        "phase": "1. Yüksek Şınav Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Bir dizi göğse doğru patlayıcı şekilde çek, ayak ucunu yere değdirmeden geri gönder.",
        "phase": "2. Patlayıcı Diz Çekişi"
      },
      {
        "badge": "finish",
        "desc": "Hemen diğer dizi göğse çekerek ritmik ve seri bir koşu temposu yakala. Kalçayı havaya dikme.",
        "phase": "3. Ritmik Koşu Temposu"
      }
    ]
  },
  {
    "id": "kneeling_plate_front_raise",
    "name": "Diz Üstü Plaka Ön Omuz Kaldırış",
    "rawKey": "diz üstü plaka ön omuz kaldırış",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Karın/Core": 0.3
    },
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_kneeling_plate_front_raise.svg",
    "formImage": "assets/guides/guide_kneeling_plate_front_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_kneeling_plate_front_raise_anatomi.jpg",
    "cue": "Dizler üzerinde dik dur, ağırlık plakasını iki elle kollarını bükmeden tut. Bacaklardan hiç savurmadan sadece omuz gücüyle omuz hizasına (paralel) kadar kaldır ve kontrollü indir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dizlerinin üzerine dik otur/dur. Gövdeyi dik tut, kalçayı ve karnı sık. Ağırlık plakasını iki elle uylukların önünde kollar düz sarkıtarak kavra.",
        "phase": "1. Diz Üstü Dik Kurulum"
      },
      {
        "badge": "action",
        "desc": "Kolları dirsekten bükmeden, gövdeyi geriye savurmadan plakayı kontrollü şekilde öne ve yukarı doğru kaldır.",
        "phase": "2. Düz Kol Kaldırışı"
      },
      {
        "badge": "finish",
        "desc": "Plaka tam omuz hizasına (yere paralel) geldiğinde 1 saniye bekle, ön omuzlarını sık. Ardından 3 saniyede yavaşça başlangıca indir.",
        "phase": "3. Omuz Hizası Zirve & Kontrol"
      }
    ]
  },
  {
    "id": "half_kneeling_plate_chop",
    "name": "Yarım Diz Üstü Plaka Oduncu (Woodchopper)",
    "rawKey": "yarım diz üstü plaka oduncu (woodchopper)",
    "primary": "Karın/Core",
    "pFactor": 0.8,
    "sec": {
      "Omuz": 0.2
    },
    "type": "CORE",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_half_kneeling_plate_chop.svg",
    "formImage": "assets/guides/guide_half_kneeling_plate_chop_form.jpg",
    "anatomiImage": "assets/guides/guide_half_kneeling_plate_chop_anatomi.jpg",
    "cue": "Yarım diz üstü duruş al (bir diz yerde, diğer bacak 90° önde). Plakayı yerde olan dizinin kalça yanından başlatıp iki elle çapraz şekilde zıt omzun üstüne doğru fırlatır gibi savur, gövdeyi ve yan karnı sıkarak kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Bir dizin üzerinde dik dur, diğer ayak 90 derece bükülü olarak önde sağlam bassın (yarım diz üstü). Plakayı iki elle direksiyon gibi tutarak yerde olan dizinin kalça yanına doğru indir.",
        "phase": "1. Yarım Diz Üstü Kurulum (Alt Çapraz)"
      },
      {
        "badge": "action",
        "desc": "Kalçayı sabit tutarak yalnızca üst gövdeyi döndür; kolları dirsekten hafif gergin tutarak plakayı göğüs önünden zıt omza doğru çapraz bir hat boyunca yukarı çek.",
        "phase": "2. Çapraz Torasik Rotasyon"
      },
      {
        "badge": "finish",
        "desc": "Plaka zıt omuz hizasının yukarısına ulaştığında yan karın kaslarını taş gibi sık, 1 saniye bekle ve yavaşça başladığın kalça yanına indir.",
        "phase": "3. Zirve Çapraz Kilit"
      }
    ]
  },
  {
    "id": "db_thruster",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "LOW",
    "sfrLabel": "LOW",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_thruster.svg",
    "formImage": "assets/guides/guide_db_thruster_form.jpg",
    "anatomiImage": "assets/guides/guide_db_thruster_anatomi.jpg",
    "cue": "Dambılları omuzda tutarak derin squat yap, kalkarken bacakların patlayıcı gücünü hiç kesmeden ağırlığı baş üstüne kilitle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde, dambıllar omuz hizasında rack pozisyonunda, göğüs dik.",
        "phase": "1. Ön Rack Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı paralel altına indirerek derin squat yap, topuklardan patlayıcı kalkış başlat.",
        "phase": "2. Derin Squat & Patlama"
      },
      {
        "badge": "finish",
        "desc": "Bacakların momentumunu kollara aktararak dambılları baş üstünde kilitli durdur.",
        "phase": "3. Baş Üstü Kilit"
      }
    ]
  },
  {
    "id": "db_push_press",
    "name": "Dambıl Push Press",
    "rawKey": "dambıl push press",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Triceps": 0.3,
      "Ön Bacak": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_press.svg",
    "formImage": "assets/guides/guide_db_push_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_push_press_anatomi.jpg",
    "cue": "Dambıllar omuzdayken dizleri 20° hafifçe büküp yaylan, bacaklardan aldığın yaylanma gücüyle dambılları baş üstüne fırlat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde dik dur, dambıllar omuz başlarında paralel, dirsekler önde.",
        "phase": "1. Omuz Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Dizleri hafifçe büküp yaylan (dip), hemen ardından bacakları patlatarak dikey kuvvet üret.",
        "phase": "2. Bacak Yaylanması (Dip & Drive)"
      },
      {
        "badge": "finish",
        "desc": "Dambılları baş üstünde kollar dik olana kadar presle ve kilitlen.",
        "phase": "3. Dikey Kilitlenme"
      }
    ]
  },
  {
    "id": "db_renegade_pushup",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_renegade_row.svg",
    "formImage": "assets/guides/guide_db_renegade_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_db_renegade_pushup_anatomi.jpg",
    "cue": "Dambıllar üzerinde tam şınav yapıp doğrul, kalçayı hiç sallamadan tek kolla dambılı kaburgana çek, ardından diğer kola geç.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Eller köşeli dambıllarda yüksek plank pozisyonu, ayaklar omuzdan geniş.",
        "phase": "1. Yüksek Plank Duruşu"
      },
      {
        "badge": "action",
        "desc": "Göğsü yere yaklaştırarak tam şınav yap, yeri itip kalktıktan sonra bir dambılı kalçaya çek.",
        "phase": "2. Şınav & Tek Kol Row"
      },
      {
        "badge": "finish",
        "desc": "Dambılı yere indirip diğer kolla row yap. Gövdeyi asla yana yatırma.",
        "phase": "3. Karşı Kol Çekiş & Sıfırlama"
      }
    ]
  },
  {
    "id": "bear_crawl_pull_through",
    "name": "Ayı Emeklemesi Plaka Çekişi",
    "rawKey": "ayı emeklemesi plaka çekişi",
    "primary": "Karın/Core",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.35
    },
    "type": "CORE",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_plank_pull_through.svg",
    "formImage": "assets/guides/guide_bear_crawl_pull_through_form.jpg",
    "anatomiImage": "assets/guides/guide_bear_crawl_pull_through_anatomi.jpg",
    "cue": "Dizler 90° bükük fakat yerden 5 cm havada (ayı duruşu) kal. Plakayı gövdenin altından zıt elle çapraz yana çekip bırak.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dört ayak üzerinde dizleri yerden 5 cm kaldır. Sırt masa gibi düz, plaka gövdenin altında.",
        "phase": "1. Asılı Ayı Duruşu"
      },
      {
        "badge": "action",
        "desc": "Zıt elinle ağırlığı gövdenin altından çapraz tarafa çek, kalçayı ve omurgayı hiç oynatma.",
        "phase": "2. Gövde Altı Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Eli yere koyup ağırlığı bu kez diğer elle geriye çek. Dizleri yere değdirme.",
        "phase": "3. Denge & Kol Değişimi"
      }
    ]
  },
  {
    "id": "db_clean_and_press",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_snatch.svg",
    "formImage": "assets/guides/guide_db_clean_and_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_clean_and_press_anatomi.jpg",
    "cue": "Dambılları kalça menteşesiyle bacak arasından patlayıcı çekerek omuza al (clean), ardından doğrudan baş üstüne presle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde, dambıllar uyluk önünde, kalça geriye menteşeli.",
        "phase": "1. Kalça Menteşesi"
      },
      {
        "badge": "action",
        "desc": "Kalçayı patlatarak dambılları dikey çek, dirsekleri çevirip omuz hizasında yakala (clean).",
        "phase": "2. Patlayıcı Clean"
      },
      {
        "badge": "finish",
        "desc": "Beklemeden dambılları baş üstüne presle, kollar kilitlendiğinde yavaşça indir.",
        "phase": "3. Baş Üstü Pres"
      }
    ]
  },
  {
    "id": "db_manmaker",
    "name": "Dambıl Manmaker",
    "rawKey": "dambıl manmaker",
    "primary": "Kondisyon / Kardiyo",
    "pFactor": 0,
    "sec": {},
    "type": "CONDITIONING",
    "typeLabel": "Metabolik Kondisyon & Kardiyo",
    "sfr": "N/A",
    "sfrLabel": "N/A",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_escalera.svg",
    "formImage": "assets/guides/guide_db_manmaker_form.jpg",
    "anatomiImage": "assets/guides/guide_db_manmaker_anatomi.jpg",
    "cue": "Şınav + Sağ/Sol Row + Ayakları çekip Squat Clean + Baş üstü Thruster zincirini tek akışta kesintisiz uygula.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıllar elde yere şınav pozisyonuna in.",
        "phase": "1. Şınav & Plank"
      },
      {
        "badge": "action",
        "desc": "Şınav yap, ardından sağ ve sol kolla renegade row çekişi tamamla.",
        "phase": "2. Şınav + Çift Row"
      },
      {
        "badge": "finish",
        "desc": "Ayakları dambılların yanına fırlatıp squat clean ile kalk ve baş üstü thruster ile bitir.",
        "phase": "3. Squat Clean & Thruster"
      }
    ]
  },
  {
    "id": "waiters_carry",
    "name": "Garson Taşıması (Waiter Carry)",
    "rawKey": "garson taşıması (waiter carry)",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Omuz": 0.4
    },
    "type": "LOADED_CARRY",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_overhead_carry.svg",
    "formImage": "assets/guides/guide_waiters_carry_form.jpg",
    "anatomiImage": "assets/guides/guide_waiters_carry_anatomi.jpg",
    "cue": "Tek elindeki dambılı baş üstünde kilitli tut, dirseği bükmeden dik ve küçük adımlarla yürü.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Tek dambılı baş üstüne presle, dirsek tam kilitli, kulak hizasında sabit.",
        "phase": "1. Baş Üstü Kilit"
      },
      {
        "badge": "action",
        "desc": "Gövdenin yana yatmasına izin vermeden kontrollü ve dik adımlarla ileri yürü.",
        "phase": "2. Dik Adımlarla Yürüyüş"
      },
      {
        "badge": "finish",
        "desc": "Mesafeyi bitirince ağırlığı kontrollü omuza indir ve diğer kola geç.",
        "phase": "3. Kol Değişimi & Kilit"
      }
    ]
  },
  {
    "id": "cross_body_carry",
    "name": "Çapraz Taşıma (Cross-Body Carry)",
    "rawKey": "çapraz taşıma (cross-body carry)",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {
      "Omuz": 0.3
    },
    "type": "LOADED_CARRY",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_farmers_walk.svg",
    "formImage": "assets/guides/guide_cross_body_carry_form.jpg",
    "anatomiImage": "assets/guides/guide_cross_body_carry_anatomi.jpg",
    "cue": "Bir elinde baş üstünde dambıl, diğer elinde bacak yanında ağır dambıl tut. Asimetrik yüke direnerek dimdik yürü.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Bir el baş üstünde kilitli, diğer el bacak yanında ağır dambılla dik duruş al.",
        "phase": "1. Çapraz Yük Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Vücudun eğilmesine izin vermeden yan karın kaslarını sıkarak dik bir çizgide yürü.",
        "phase": "2. Asimetrik Yürüyüş"
      },
      {
        "badge": "finish",
        "desc": "Ağırlıkları kontrollü indirip ellerin görevini değiştirerek aynı mesafeyi tekrarla.",
        "phase": "3. Kol Değişimi"
      }
    ]
  },
  {
    "id": "lunge_with_twist",
    "name": "Lunge + Gövde Rotasyonu",
    "rawKey": "lunge + gövde rotasyonu",
    "primary": "Ön Bacak",
    "pFactor": 0.8,
    "sec": {
      "Glute": 0.4,
      "Karın/Core": 0.5
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_lunge.svg",
    "formImage": "assets/guides/guide_lunge_with_twist_form.jpg",
    "anatomiImage": "assets/guides/guide_lunge_with_twist_anatomi.jpg",
    "cue": "Öne derin lunge adımı at. İnişte elindeki plakayı öndeki bacağının yönüne doğru gövdeden çevir, toparlanırken merkeze dön.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakta dik dur, ağırlık plakasını göğüs önünde iki elle tut.",
        "phase": "1. Dik Başlangıç"
      },
      {
        "badge": "action",
        "desc": "Öne doğru lunge adımı at, dizler 90 derecedeyken gövdeyi öndeki bacağın tarafına çevir.",
        "phase": "2. Lunge & Yan Rotasyon"
      },
      {
        "badge": "finish",
        "desc": "Gövdeyi merkeze döndür, ön topuktan patlayarak ayağa kalk ve diğer bacağa geç.",
        "phase": "3. Doğrulma & Değişim"
      }
    ]
  },
  {
    "id": "step_up_press",
    "name": "Step-Up + Omuz Presi",
    "rawKey": "step-up + omuz presi",
    "primary": "Ön Bacak",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.6,
      "Glute": 0.4
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_lunge.svg",
    "formImage": "assets/guides/guide_step_up_press_form.jpg",
    "anatomiImage": "assets/guides/guide_step_up_press_anatomi.jpg",
    "cue": "Kutuya tek ayakla çıkarken ön topuktan güç al, tepe noktada doğrulurken zıt elindeki dambılı baş üstüne presle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Bir ayak kutunun üzerinde sağlam, zıt eldeki dambıl omuz hizasında hazır.",
        "phase": "1. Kutuda Kurulum"
      },
      {
        "badge": "action",
        "desc": "Kutudaki topuktan güç alarak yukarı yüksel, aynı anda dambılı baş üstüne güçlüce presle.",
        "phase": "2. Yükseliş & Pres"
      },
      {
        "badge": "finish",
        "desc": "Kutunun üzerinde dik kilitlen, ardından yavaşça başlangıç pozisyonuna in.",
        "phase": "3. Kilit ve Kontrollü İniş"
      }
    ]
  },
  {
    "id": "bb_thruster",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "LOW",
    "sfrLabel": "LOW",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_thruster.svg",
    "formImage": "assets/guides/guide_bb_thruster_form.png",
    "anatomiImage": "",
    "cue": "Barı köprücük kemiğinde (front rack) tutarak tam squat yap, kalkış momentumunu hiç kesmeden barı baş üstüne güçlüce presle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barı omuz ve köprücük kemiğinde dinlendir, dirsekler yüksekte. Göğsü dik tutarak kalçayı paralel altına indir.",
        "phase": "1. Front Rack & Çöküş"
      },
      {
        "badge": "action",
        "desc": "Topuklardan yeri iterek patlayıcı şekilde doğrul, kalça tam kilitlendiğinde dikey momentumu bara aktar.",
        "phase": "2. Patlayıcı Kalkış (Drive)"
      },
      {
        "badge": "finish",
        "desc": "Barı başın üzerinde tam kilitli tut, başı kolların arasından hafifçe öne alarak dikey çizgiyi tamamla.",
        "phase": "3. Baş Üstü Kilit (Lockout)"
      }
    ]
  },
  {
    "id": "bb_hang_power_clean",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_snatch.svg",
    "formImage": "assets/guides/guide_bb_hang_power_clean_form.png",
    "anatomiImage": "",
    "cue": "Barı diz kapağı hizasından başlat, kalçayı kırbaç gibi öne patlat (triple extension) ve barı omuzlarda dirsekleri öne fırlatarak yakala.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde, kalça geriye menteşeli (hinge), bar dizlerin hemen üstünde asılı, sırt kilitli.",
        "phase": "1. Diz Üstü Kurulum (Hang)"
      },
      {
        "badge": "action",
        "desc": "Kalça ve dizleri patlayıcı şekilde aç, ayak uçlarına yükselirken omuzları yukarı silk (shrug).",
        "phase": "2. Üçlü Eklem Patlaması (Jump & Shrug)"
      },
      {
        "badge": "finish",
        "desc": "Hızla barın altına çeyrek squat ile gir, dirsekleri öne fırlatarak barı omuz başında yumuşakça yakala.",
        "phase": "3. Ön Rack Yakalama (Catch)"
      }
    ]
  },
  {
    "id": "bb_push_press",
    "name": "Barbell Push Press",
    "rawKey": "barbell push press",
    "primary": "Omuz",
    "pFactor": 0.8,
    "sec": {
      "Triceps": 0.3,
      "Ön Bacak": 0.25
    },
    "type": "BALLISTIC_POWER",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_db_press.svg",
    "formImage": "assets/guides/guide_bb_push_press_form.png",
    "anatomiImage": "",
    "cue": "Bar köprücük kemiğinde dinlenirken dizleri 10-15 cm bükerek yaylan (dip), bacaklardan gelen yay kuvvetiyle barı baş üstüne patlat.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Bar köprücük kemiğinde ve ön omuzda, dirsekler barın hafifçe önünde, core taş gibi sıkı.",
        "phase": "1. Front Rack & Dik Duruş"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi öne eğmeden, kalçayı doğrudan aşağı indirerek dizleri hafifçe bük (sığ yaylanma / dip).",
        "phase": "2. Bacak Yaylanması (Dip)"
      },
      {
        "badge": "finish",
        "desc": "Bacakları patlayıcı uzatarak barı yukarı fırlat, tepe noktada kolları baş üstünde kilitle.",
        "phase": "3. Dikey Sürüş & Kilit (Drive & Press)"
      }
    ]
  },
  {
    "id": "bb_zercher_squat",
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
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "MODERATE",
    "sfrLabel": "MODERATE",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_db_squat.svg",
    "formImage": "assets/guides/guide_bb_zercher_squat_form.png",
    "anatomiImage": "",
    "cue": "Barı dirsek içlerinde kucakla, ellerini kenetle. Dirseklerin bacak arasına inmesine izin vererek derin çömel, gövdenin öne devrilmesine diren.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Barı dirsek kıvrımlarına yerleştir, elleri göğüs hizasında kenetle, omuzları geriye kilitle.",
        "phase": "1. Dirsek İçi Kucaklama (Zercher Hold)"
      },
      {
        "badge": "action",
        "desc": "Ayaklar omuzdan biraz geniş, dizleri dışa açarak çömel; dirseklerin bacakların arasına rahatça girmesini sağla.",
        "phase": "2. Derin Çömelme"
      },
      {
        "badge": "finish",
        "desc": "Topuklardan kuvvet alarak doğrul, merkez bölgeyi (core) hiç gevşetmeden tepe noktada kalçayı sık.",
        "phase": "3. Dik Gövdeyle Doğrulma"
      }
    ]
  },
  {
    "id": "bb_landmine_squat_press",
    "name": "Landmine Squat to Press",
    "rawKey": "landmine squat to press",
    "primary": "Ön Bacak",
    "pFactor": 0.7,
    "sec": {
      "Omuz": 0.65,
      "Glute": 0.35,
      "Triceps": 0.2
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": false,
    "diagramImage": "assets/diagrams/seq_thruster.svg",
    "formImage": "assets/guides/guide_bb_landmine_squat_press_form.png",
    "anatomiImage": "",
    "cue": "Barın ucunu göğüs hizasında iki elle tut. Derin squat yap, kalkış momentumuyla barı 45 derecelik açıyla ileri ve yukarı presle.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde, barın ucunu iki elle göğsün hemen önünde parmaklar kenetli kavra.",
        "phase": "1. Landmine Göğüs Tutuşu"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi hafifçe barın açısına doğru yönlendirerek derin squata in, dirsekleri göğse yakın tut.",
        "phase": "2. Açılı Squat"
      },
      {
        "badge": "finish",
        "desc": "Bacaklarla patlayıcı kalkarken barı 45° açıyla çapraz tavana doğru iki kolla it ve kilitlen.",
        "phase": "3. İleri-Yukarı Patlayıcı Pres"
      }
    ]
  },
  {
    "id": "db_standing_calf_raise",
    "name": "Dambıl Ayakta Kalf Yükseltme",
    "rawKey": "dambıl ayakta kalf yükseltme",
    "primary": "Kalf",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_calf_raise.svg",
    "formImage": "assets/guides/guide_mach_calf_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_calf_raise_anatomi.jpg",
    "cue": "Topukları yerden maksimum yüksekliğe kaldırarak TAMAMEN AYAK PARMAK UÇLARINDA YÜKSEL. Tepe noktada baldır kaslarını (kalf) 2 saniye kilitli tut, topukları yere çarpmadan 3 saniyede kontrollü indir.",
    "positions": [
      {
        "badge": "setup",
        "desc": "İki elde dambıllarla dik duruş. Ayak parmak kökleri düz zemine veya basamak kenarına basar, topuklar gergin.",
        "phase": "1. Düz Taban & Kurulum"
      },
      {
        "badge": "action",
        "desc": "Ayak parmak köklerine tüm gücünle basarak topukları göğe dik. Vücut ağırlığını ve dambılları tamamen parmak uçlarında taşıyarak kalf kaslarını zirvede 2 sn boyunca taş gibi sıkıştır.",
        "phase": "2. Parmak Ucunda Maksimum Zirve"
      },
      {
        "badge": "lock",
        "desc": "Topukları yere çarpmadan veya yaylanmadan, 3 saniyede kontrollü olarak tabana indirerek aşil tendonunu ve baldırı derinlemesine esnet.",
        "phase": "3. 3 Sn Kontrollü Negatif İniş"
      }
    ]
  },
  {
    "id": "db_lying_leg_curl",
    "name": "Dambıl Yatarak Leg Curl",
    "rawKey": "dambıl yatarak leg curl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_leg_curl.svg",
    "formImage": "assets/guides/guide_mach_leg_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_curl_anatomi.jpg",
    "cue": "Düz sehpaya yüzüstü uzan, dambılı iki ayak tabanı arasına sıkıştır. Kalçayı mindere yapışık tutarak topukları kalçaya doğru bük, zirvede hamstringi 1.5 sn sık.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Düz sehpaya yüzüstü uzan. Dikey duran dambılın gövdesini iki ayak tabanının arasına güvenle kilitle, ellerle sehpayı kavra.",
        "phase": "1. Yüzüstü Kurulum & Kavrama"
      },
      {
        "badge": "action",
        "desc": "Kalçayı sehpaya yapışık tutarak dizleri bük, dambılı kalçaya doğru 90 derecenin üzerine çek ve arka bacakları zirvede kilitle.",
        "phase": "2. Diz Fleksiyonu (Çekiş)"
      },
      {
        "badge": "lock",
        "desc": "3 saniye boyunca bacakları kontrollü düzleştir, hamstring gerilimini hiç kaybetmeden başlangıç açısına dön.",
        "phase": "3. Kontrollü Uzama"
      }
    ]
  },
  {
    "id": "bw_sissy_squat",
    "name": "Sissy Squat (Quad İzolasyonu)",
    "rawKey": "sissy squat (quad i̇zolasyonu)",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {
      "Glute": 0.4
    },
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Kuvvet Egzersizi",
    "sfr": "HIGH",
    "sfrLabel": "HIGH",
    "lengthened": true,
    "diagramImage": "assets/diagrams/seq_leg_extension.svg",
    "formImage": "assets/guides/guide_mach_leg_extension_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_extension_anatomi.jpg",
    "cue": "Parmak ucuna kalkıp dizleri öne iterken gövdeyi arkaya yatır. Düz bir çizgi halinde uylukları ger ve sadece quad gücüyle kendini doğrult.",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde dik duruş. Denge için bir elinle direğe veya duvara hafifçe tutun.",
        "phase": "1. Denge & Duruş"
      },
      {
        "badge": "action",
        "desc": "Parmak uçlarına yükselerek dizleri öne doğru sür, aynı anda gövde ve kalçayı arkaya yatırarak derin quad esnemesi yarat.",
        "phase": "2. Diz İleri, Gövde Geriye"
      },
      {
        "badge": "lock",
        "desc": "Diz eklemini zorlamadan, ön bacak kaslarını patlayıcı sıkarak başlangıç dikliğine yüksel.",
        "phase": "3. Quad İtişiyle Kilitlenme"
      }
    ]
  }
];

function getFullCatalog() {
    try {
        const candidatePaths = [
            path.join(__dirname, "../../../index.html"),
            path.join(process.cwd(), "index.html")
        ];
        let html = null;
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                html = fs.readFileSync(p, "utf8");
                break;
            }
        }
        if (html) {
            const dbMatch = html.match(/const EXERCISES_DB = (\[[\s\S]*?\]);/m);
            const egmMatch = html.match(/const exerciseGuideMap = ({[\s\S]*?^        };)/m);
            const glMatch = html.match(/const guideLibrary = ({[\s\S]*?^        };)/m);
            if (dbMatch && egmMatch && glMatch) {
                let guideLibrary = {};
                eval("guideLibrary = " + glMatch[1].replace(/;$/, ""));
                let exerciseGuideMap = {};
                eval("exerciseGuideMap = " + egmMatch[1].replace(/;$/, ""));
                let EXERCISES_DB = [];
                eval("EXERCISES_DB = " + dbMatch[1]);

                return EXERCISES_DB.map(ex => {
                    const guide = exerciseGuideMap[ex.id] || {};
                    const biomech = academicEngine.resolveExerciseBiomechanics(ex.name);
                    return {
                        id: ex.id,
                        name: ex.name,
                        rawKey: ex.name.toLowerCase(),
                        primary: biomech.primary || (ex.category === "conditioning" ? "Kondisyon / Kardiyo" : "Tüm Vücut"),
                        pFactor: biomech.pFactor,
                        sec: biomech.sec || {},
                        type: biomech.type || "HEAVY_COMPOUND",
                        typeLabel: (biomech.type === "CONDITIONING") ? "Metabolik Kondisyon & Kardiyo" : "Kuvvet Egzersizi",
                        sfr: biomech.sfr || "HIGH",
                        sfrLabel: biomech.sfr || "Standart",
                        lengthened: !!biomech.lengthened,
                        diagramImage: ex.diagram || "",
                        formImage: guide.form || "",
                        anatomiImage: guide.anatomi || "",
                        cue: ex.cue || "",
                        positions: ex.positions || []
                    };
                });
            }
        }
    } catch (e) {
        // Fallback to static catalog
    }
    return STATIC_FALLBACK_CATALOG;
}

function findExercise(query) {
    if (!query) return null;
    const q = query.trim().toLowerCase();
    const cat = getFullCatalog();
    return cat.find(e => e.id === q || e.name.toLowerCase() === q || e.rawKey === q) || null;
}

module.exports = {
    getFullCatalog,
    findExercise
};
