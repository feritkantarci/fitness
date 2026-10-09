/**
 * FitLAB BİYOMEKANİK EGZERSİZ ATLAŞI & KÜTÜPHANESİ
 * Single Source of Truth (SSOT): index.html EXERCISES_DB & exerciseGuideMap ile senkronize.
 * Toplam 93 Orijinal Egzersiz
 */
const fs = require('fs');
const path = require('path');
const academicEngine = require('./academic-engine');

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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bench_press_anatomi.jpg",
    "cue": "Dirsekleri gövdeye 45° açıda tut, dambılları yukarıda çarpmadan göğüs kaslarını sıkarak kilitle."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_incline_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_incline_press_anatomi.jpg",
    "cue": "Sehpa açısını 30-45° yap, kürek kemiklerini sehpaya kilitle, tepe noktada üst göğsü sık."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_floor_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_floor_press_anatomi.jpg",
    "cue": "Yerde dirsekler zemine hafifçe değdiği an durakla, momentum almadan patlayıcı şekilde yukarı it."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_overhead_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_overhead_press_anatomi.jpg",
    "cue": "Kalçayı ve karnı taş gibi sık, omurgayı geriye bükmeden dambılları kulak hizasından baş üstüne dikey kilitle."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_arnold_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_arnold_press_anatomi.jpg",
    "cue": "Avuçlar yüzüne bakarak başla, preslerken bilekleri 180° çevirip baş üstüne kilitle."
  },
  {
    "id": "db_lateral_raise",
    "name": "Dambıl Lateral Raise",
    "rawKey": "dambıl lateral raise",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_lateral_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_db_lateral_raise_anatomi.jpg",
    "cue": "Dirsekleri hafif kırık tut, kolları omuz hizasına kadar sürahi döker gibi kaldır."
  },
  {
    "id": "db_triceps_overhead",
    "name": "Dambıl Başüstü Triceps",
    "rawKey": "dambıl başüstü triceps",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_triceps_overhead_form.jpg",
    "anatomiImage": "assets/guides/guide_db_triceps_overhead_anatomi.jpg",
    "cue": "Dirsekleri başın iki yanında tavana bakacak şekilde sabit tut, sadece ön kolları büküp baş arkasından uzat."
  },
  {
    "id": "db_skullcrusher",
    "name": "Dambıl Skullcrusher",
    "rawKey": "dambıl skullcrusher",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_skullcrusher_form.jpg",
    "anatomiImage": "assets/guides/guide_db_skullcrusher_anatomi.jpg",
    "cue": "Düz sehpada dirsekleri omuz hizasında dikey sabitle, dambılları şakaklara indirip triceps ile uzat."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Dambılı göğsüne dikey yapıştır, topuklar yerden kalkmadan dirsekler dizlerin içine değene kadar çömel."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Dambılları omuz başlarına paralel dayayarak tut, dirsekleri yüksek tutarak gövdeyi dimdik aşağı indir."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_bulgarian_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_bulgarian_squat_anatomi.jpg",
    "cue": "Arka ayağın üstünü sehpa kenarına yerleştir, ön diz 90° olana kadar dik çök, ön topuktan patla."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_walking_lunge_form.jpg",
    "anatomiImage": "assets/guides/guide_db_walking_lunge_anatomi.jpg",
    "cue": "Öne büyük adımlar at, arka diz yere 2 cm kalana kadar çök, ön topuktan kuvvet alarak diğer adıma geç."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_walking_lunge_form.jpg",
    "anatomiImage": "assets/guides/guide_db_walking_lunge_anatomi.jpg",
    "cue": "Geriye adım atarak çök (diz tendonlarını korur), ön topuktan patlayıcı güçle başlangıç noktasına çekil."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_rdl_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, kalçayı arkadaki duvara değdirir gibi geriye uzat, sırtı masa gibi düz tut."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_single_leg_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_single_leg_rdl_anatomi.jpg",
    "cue": "Destek ayağının dizini hafif bük, serbest bacağı arkaya cetvel gibi uzatırken dambılı kaval kemiğine indir."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_saw_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_saw_row_anatomi.jpg",
    "cue": "Bir diz ve el sehpada, sırt masa gibi düz. Dambılı dikey değil, yay çizerek kalça cebine doğru çek."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_chest_supported_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_chest_supported_row_anatomi.jpg",
    "cue": "Göğsü 30-45° eğimli sehpaya yasla, belden hiç momentum almadan sadece kürek kemiklerini sıkarak çek."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_renegade_row_form.jpg",
    "anatomiImage": "assets/guides/guide_db_renegade_row_anatomi.jpg",
    "cue": "Şınav pozisyonunda dambılları tut, ayakları geniş aç, kalçayı hiç sallamadan sırayla çekiş yap."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_pullover_form.jpg",
    "anatomiImage": "assets/guides/guide_db_pullover_anatomi.jpg",
    "cue": "Sehpada sırtüstü uzan, dambılı iki elle başın arkasına dirsekleri kırmadan uzat, kanatlarla göğüs üstüne çek."
  },
  {
    "id": "db_hammer_curl",
    "name": "Hammer Curl",
    "rawKey": "hammer curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Avuç içleri birbirine baksın (nötr tutuş), dirsekleri kaburgalara sabitle, sadece ön kolu kaldır."
  },
  {
    "id": "db_incline_curl",
    "name": "Incline Dambıl Curl",
    "rawKey": "incline dambıl curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_incline_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_incline_curl_anatomi.jpg",
    "cue": "Sehpayı 45-60° eğ, kollar arkada tamamen sarkıtılsın, omuzları oynatmadan biceps ile kıvır."
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
    "typeLabel": "Yüklü Taşıma & Omurga Zırhı",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_farmers_walk_form.jpg",
    "anatomiImage": "assets/guides/guide_db_farmers_walk_anatomi.jpg",
    "cue": "Ağır dambılları kaldır, omuzları geriye kilitle, karın duvarını taş gibi sık ve küçük kontrollü adımlarla yürü."
  },
  {
    "id": "db_suitcase_carry",
    "name": "Suitcase Carry",
    "rawKey": "suitcase carry",
    "primary": "Karın/Core",
    "pFactor": 0.6,
    "sec": {},
    "type": "LOADED_CARRY",
    "typeLabel": "Yüklü Taşıma & Omurga Zırhı",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_farmers_walk_form.jpg",
    "anatomiImage": "assets/guides/guide_db_farmers_walk_anatomi.jpg",
    "cue": "Sadece tek elde ağır dambıl tut, ağırlığın seni yana bükmesine ASLA izin verme, dimdik yürü."
  },
  {
    "id": "db_russian_twist",
    "name": "Russian Twist",
    "rawKey": "russian twist",
    "primary": "Karın/Core",
    "pFactor": 0.7,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Karın & Core Stabilizasyonu",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_russian_twist_form.jpg",
    "anatomiImage": "assets/guides/guide_db_russian_twist_anatomi.jpg",
    "cue": "Yere otur, gövdeyi 45° yatır, ayakları kaldır. Dambılı sağ ve sol kalça yanına kontrollü döndür."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_snatch_form.jpg",
    "anatomiImage": "assets/guides/guide_db_snatch_anatomi.jpg",
    "cue": "Dambılı bacak arasından patlayıcı kalça vuruşuyla tek hamlede baş üstüne kilitlenene kadar fırlat."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_swing_form.jpg",
    "anatomiImage": "assets/guides/guide_db_swing_anatomi.jpg",
    "cue": "Dambılın ucundan iki elle tut, squat yapma! Kalçayı geriye menteşele ve kalça vuruşuyla göğüs hizasına fırlat."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_kb_swing_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_swing_anatomi.jpg",
    "cue": "Kolları halat gibi serbest tut, gülleyi sadece kalça menteşesi ve patlayıcı glute itişiyle fırlat."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_clean_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_clean_anatomi.jpg",
    "cue": "Gülleyi bacak arasından çek, dirseği gövdeye yapıştırarak ön kola çarpmadan yumuşakça göğse al."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_kb_press_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_press_anatomi.jpg",
    "cue": "Rack pozisyonundan başla, bacaklardan hiç yaylanmadan sadece omuz gücüyle gülleyi baş üstüne kilitle."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_snatch_form.jpg",
    "anatomiImage": "assets/guides/guide_db_snatch_anatomi.jpg",
    "cue": "Gülleyi tek hamlede baş üstüne fırlatıp kilitle, indirirken önce göğse (rack) alıp sonra bacak arasına bırak."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_goblet_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_db_goblet_squat_anatomi.jpg",
    "cue": "Gülleyi boynuzlarından göğse yapıştır, dirsekler dizlerin içine inene kadar derin çömel."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": true,
    "formImage": "assets/guides/guide_kb_gorilla_row_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_gorilla_row_anatomi.jpg",
    "cue": "Goril gibi dizleri bükük ve eğik dur. Bir gülleyi yerde bastırırken diğerini kalçaya patlayıcı çek."
  },
  {
    "id": "kb_windmill",
    "name": "Kettlebell Windmill",
    "rawKey": "kettlebell windmill",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "HEAVY_COMPOUND",
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_windmill_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_windmill_anatomi.jpg",
    "cue": "Gülleyi baş üstünde kilitli tut, gözlerini güllenden ayırmadan zıt ayak bileğine doğru gövdeyi döndürerek eğil."
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
    "typeLabel": "Eklem Kapsülü & Dinamik Mobilite",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_windmill_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_windmill_anatomi.jpg",
    "cue": "Gözlerini tavandaki güllenden ayırma! Sırtüstünden ayağa kalkana kadar her eklem adımını sırayla kitle."
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
    "typeLabel": "Eklem Kapsülü & Dinamik Mobilite",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kb_halo_form.jpg",
    "anatomiImage": "assets/guides/guide_kb_halo_anatomi.jpg",
    "cue": "Gülleyi ters çevirip boynuzlardan tut, başını oynatmadan gülleyi başının etrafında haleler çizerek döndür."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "LOW",
    "sfrLabel": "Düşük (Yüksek Eklem Aşınması)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_thruster_form.jpg",
    "anatomiImage": "assets/guides/guide_db_thruster_anatomi.jpg",
    "cue": "Derin squat yap, kalkışın patlayıcı momentumunu hiç kesmeden doğrudan baş üstü pres ile birleştir."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Göz hizası barın altında, kürek kemiklerini sehpaya göm, barı alt göğse değdirip patlayıcı it."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_incline_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_incline_press_anatomi.jpg",
    "cue": "30° açılı sehpada barı köprücük kemiğinin hemen altına indir, üst göğüs lifleriyle yukarı presle."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_overhead_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_overhead_press_anatomi.jpg",
    "cue": "Barı köprücük kemiğinde tut, başını hafif geriye çekip barı yukarı iterken başını barın altından öne sok."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Barı üst trapezlere sağlam kilitle, dizleri dışa açarak kalçayı paralel altına indir, ayak tabanıyla yeri parçala."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_back_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_back_squat_anatomi.jpg",
    "cue": "Barı omuz önünde ön rack pozisyonunda tut, dirsekleri tavana doğru yüksek tutarak dimdik çömel."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "LOW",
    "sfrLabel": "Düşük (Yüksek Eklem Aşınması)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_deadlift_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_deadlift_anatomi.jpg",
    "cue": "Bar kaval kemiğine temas etsin, sırt masa gibi düz, yeri ayak tabanlarınla iterek kalçayı kilitle."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_rdl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_rdl_anatomi.jpg",
    "cue": "Dizleri hafif kırık sabitle, barı kaval kemiği boyunca indirerek kalçayı arkaya menteşele."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_hip_thrust_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_hip_thrust_anatomi.jpg",
    "cue": "Sırt sehpaya dayalı, süngerli bar kalça kıvrımında, topuklardan yeri iterek tepe noktada kalçayı taş gibi kilitle."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Gövdeyi 45° öne eğ, omurgayı düz tut, barı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_pendlay_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_pendlay_row_anatomi.jpg",
    "cue": "Gövde yere tam paralel (90°). Her tekrarda bar yerden sıfırdan başlar, patlayıcı alt göğse çekilip yere bırakılır."
  },
  {
    "id": "bb_biceps_curl",
    "name": "Barbell Curl",
    "rawKey": "barbell curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Dirsekleri gövdeye yapıştır, belden savurma yapmadan sadece ön kolları bükerek barı göğse doğru kıvır."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_bench_press_form.jpg",
    "anatomiImage": "assets/guides/guide_bb_bench_press_anatomi.jpg",
    "cue": "Elleri omuz genişliğinde dar tut, inişte dirsekleri gövdeye yapışık tutarak ağırlığı triceps ile presle."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_lat_pulldown_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_lat_pulldown_anatomi.jpg",
    "cue": "Bacak pedine sıkıca otur, barı üst göğse doğru dirsekleri kaburgalara çekerek indir, arkaya aşırı yatma."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_cable_row_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_row_anatomi.jpg",
    "cue": "Ayakları platforma bas, sırtı dik tut, tutacağı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek."
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
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_face_pull_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_face_pull_anatomi.jpg",
    "cue": "Halatı göz hizasından tut, dirsekleri yüksekte dışa açarak halatın ortasını alnına doğru çek ve arka omuzu sık."
  },
  {
    "id": "mach_cable_crossover",
    "name": "Kablo Crossover",
    "rawKey": "kablo crossover",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_pec_deck_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_pec_deck_anatomi.jpg",
    "cue": "Dirseklerde hafif sabit açı tut, kolları büyük bir ağaca sarılır gibi göğsün önünde birleştir."
  },
  {
    "id": "mach_pec_deck",
    "name": "Pec Deck Kelebek",
    "rawKey": "pec deck kelebek",
    "primary": "Göğüs",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_pec_deck_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_pec_deck_anatomi.jpg",
    "cue": "Dirsekleri pedlere veya tutacaklara yerleştir, omuzları geride tutarak göğüs kaslarınla kolları önde kapat."
  },
  {
    "id": "mach_triceps_pushdown",
    "name": "Halat Triceps Pushdown",
    "rawKey": "halat triceps pushdown",
    "primary": "Triceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_mach_triceps_pushdown_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_triceps_pushdown_anatomi.jpg",
    "cue": "Dirsekleri gövdeye yapıştır, halatı aşağı iterken dip noktada uçlarını yana doğru açarak triceps kaslarını kilitle."
  },
  {
    "id": "mach_cable_biceps",
    "name": "Kablo Biceps Curl",
    "rawKey": "kablo biceps curl",
    "primary": "Biceps",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_db_biceps_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_db_biceps_curl_anatomi.jpg",
    "cue": "Düşük makarada düz barı tut, dirsekleri sabit tutarak kablonun sürekli geriliminde biceps kaslarını sık."
  },
  {
    "id": "mach_cable_lateral",
    "name": "Kablo Lateral Raise",
    "rawKey": "kablo lateral raise",
    "primary": "Omuz",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_cable_lateral_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_lateral_anatomi.jpg",
    "cue": "Alt makaradan kabloyu gövdenin arkasından veya önünden tut, dirseği hafif bükük omuz hizasına kaldır."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_leg_press_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_press_anatomi.jpg",
    "cue": "Bel boşluğunu arkadaki mindere tamamen yapıştır, dizleri 90° büküp platformu ayak tabanlarıyla güçlüce it (dizleri kilitleme)."
  },
  {
    "id": "mach_leg_extension",
    "name": "Leg Extension",
    "rawKey": "leg extension",
    "primary": "Ön Bacak",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_mach_leg_extension_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_extension_anatomi.jpg",
    "cue": "Diz eklemini makinenin dönme noktasıyla hizala, bacakları yukarı uzatıp tepe noktada kuadrisepsi taş gibi sık."
  },
  {
    "id": "mach_leg_curl",
    "name": "Leg Curl",
    "rawKey": "leg curl",
    "primary": "Arka Bacak",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_leg_curl_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_leg_curl_anatomi.jpg",
    "cue": "Pedi aşil tendonunun hemen üzerine ayarla, topukları kalçaya doğru bükerek hamstring kaslarını sık."
  },
  {
    "id": "mach_calf_raise",
    "name": "Calf Raise",
    "rawKey": "calf raise",
    "primary": "Kalf",
    "pFactor": 1,
    "sec": {},
    "type": "ISOLATION",
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_mach_calf_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_calf_raise_anatomi.jpg",
    "cue": "Parmak uçlarıyla platform kenarında dur, topukları aşağı sarkıtıp tepe noktada parmak uçlarında tam yüksel."
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
    "typeLabel": "Karın & Core Stabilizasyonu",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_mach_cable_woodchopper_form.jpg",
    "anatomiImage": "assets/guides/guide_mach_cable_woodchopper_anatomi.jpg",
    "cue": "Yüksek makaradan tutacağı çift elle kavra, kolları düz tutarak gövde rotasyonuyla zıt diz yönüne çapraz çek."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_pushup_anatomi.jpg",
    "cue": "Gövde baştan topuğa cetvel gibi düz, dirsekler 45° açıyla geriye insin, göğüs yere 2 cm kalana kadar çök."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_pushup_anatomi.jpg",
    "cue": "Ayakları sehpa veya kutu üzerine koy, vücut eğimini koruyarak üst göğüs odaklı şınav çek."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_diamond_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_diamond_pushup_anatomi.jpg",
    "cue": "Başparmak ve işaret parmaklarını göğüs altında elmas şeklinde birleştir, dirsekleri gövdeye yapışık tutarak it."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_dips_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_dips_anatomi.jpg",
    "cue": "Paralel barlarda gövdeyi 30° öne eğ, dirsekler 90° olana kadar kontrollü in ve tepeye kilitlen."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_pullup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_pullup_anatomi.jpg",
    "cue": "Barı omuzdan geniş kavra, sallanmadan göğsü bara doğru yükselt, çene barı geçince kanatları sık."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_chinup_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_chinup_anatomi.jpg",
    "cue": "Avuç içleri yüzüne baksın (ters tutuş), dirsekleri önden çekerek çeneyi barın üstüne yükselt ve biceps ile sık."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_inverted_row_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_inverted_row_anatomi.jpg",
    "cue": "Alçak barın altına gir, topuklar yerde, gövde cetvel gibi düz, göğsü bara değene kadar çek."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_air_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_air_squat_anatomi.jpg",
    "cue": "Kolları önde dengede tut, topuklar yerden ayrılmadan kalçayı diz seviyesinin altına kadar derin indir."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_air_squat_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_air_squat_anatomi.jpg",
    "cue": "Derin squat derinliğine in, tavana doğru patlayıcı sıçra ve parmak ucundan topuğa yumuşakça iniş yap."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_glute_bridge_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_glute_bridge_anatomi.jpg",
    "cue": "Yerde sırtüstü yat, dizler 90° bükülü, topuklardan yeri iterek kalçayı omuz-diz hattında düz olana kadar kaldır."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bw_hanging_knee_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_hanging_knee_raise_anatomi.jpg",
    "cue": "Barfiks barında asılıyken gövdeyi sallamadan dizleri göğse doğru çek, pelvisi yukarı yuvarlayarak alt karını sık."
  },
  {
    "id": "bw_hollow_body",
    "name": "Hollow Body",
    "rawKey": "hollow body",
    "primary": "Karın/Core",
    "pFactor": 0.8,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Karın & Core Stabilizasyonu",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_hollow_body_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_hollow_body_anatomi.jpg",
    "cue": "Sırtüstü yat, bel boşluğunu zemine sıfır boşlukla yapıştır, kolları ve bacakları hafif kaldırarak muz şeklinde kilitlen."
  },
  {
    "id": "bw_plank",
    "name": "Plank",
    "rawKey": "plank",
    "primary": "Karın/Core",
    "pFactor": 0.5,
    "sec": {},
    "type": "CORE",
    "typeLabel": "Karın & Core Stabilizasyonu",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_plank_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_plank_anatomi.jpg",
    "cue": "Dirsekler ve ayak parmak uçlarında vücudu cetvel gibi düz tut, karnı ve kalçayı taş gibi sıkarak beli koru."
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
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_burpee_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_burpee_anatomi.jpg",
    "cue": "Hızla çömel, ayakları geriye atıp göğsü yere dokundur, ayakları geri çekip tavana doğru alkışla sıçra."
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
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bw_mountain_climber_form.jpg",
    "anatomiImage": "assets/guides/guide_bw_mountain_climber_anatomi.jpg",
    "cue": "Yüksek şınav pozisyonunda kalçayı kaldırmadan dizleri sırayla koşar adım göğse çek."
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
    "typeLabel": "Hedefe Yönelik İzolasyon",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_kneeling_plate_front_raise_form.jpg",
    "anatomiImage": "assets/guides/guide_kneeling_plate_front_raise_anatomi.jpg",
    "cue": "Dizler üzerinde dik dur, ağırlık plakasını iki elle kollarını bükmeden tut. Bacaklardan hiç savurmadan sadece omuz gücüyle omuz hizasına (paralel) kadar kaldır ve kontrollü indir."
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
    "typeLabel": "Karın & Core Stabilizasyonu",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_half_kneeling_plate_chop_form.jpg",
    "anatomiImage": "assets/guides/guide_half_kneeling_plate_chop_anatomi.jpg",
    "cue": "Yarım diz üstü duruş al (bir diz yerde, diğer bacak 90° önde). Plakayı yerde olan dizinin kalça yanından başlatıp iki elle çapraz şekilde zıt omzun üstüne doğru fırlatır gibi savur, gövdeyi ve yan karnı sıkarak kilitle."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "LOW",
    "sfrLabel": "Düşük (Yüksek Eklem Aşınması)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_thruster_form.jpg",
    "anatomiImage": "assets/guides/guide_db_thruster_anatomi.jpg",
    "cue": "Dambılları omuzda tutarak derin squat yap, kalkarken bacakların patlayıcı gücünü hiç kesmeden ağırlığı baş üstüne kilitle."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_push_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_push_press_anatomi.jpg",
    "cue": "Dambıllar omuzdayken dizleri 20° hafifçe büküp yaylan, bacaklardan aldığın yaylanma gücüyle dambılları baş üstüne fırlat."
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
    "typeLabel": "Vücut Ağırlığı Kuvvet (Calisthenics)",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_renegade_pushup_form.jpg",
    "anatomiImage": "assets/guides/guide_db_renegade_pushup_anatomi.jpg",
    "cue": "Dambıllar üzerinde tam şınav yapıp doğrul, kalçayı hiç sallamadan tek kolla dambılı kaburgana çek, ardından diğer kola geç."
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
    "typeLabel": "Karın & Core Stabilizasyonu",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bear_crawl_pull_through_form.jpg",
    "anatomiImage": "assets/guides/guide_bear_crawl_pull_through_anatomi.jpg",
    "cue": "Dizler 90° bükük fakat yerden 5 cm havada (ayı duruşu) kal. Plakayı gövdenin altından zıt elle çapraz yana çekip bırak."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_clean_and_press_form.jpg",
    "anatomiImage": "assets/guides/guide_db_clean_and_press_anatomi.jpg",
    "cue": "Dambılları kalça menteşesiyle bacak arasından patlayıcı çekerek omuza al (clean), ardından doğrudan baş üstüne presle."
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
    "sfrLabel": "Kondisyon (Kas Büyütme Amaçlı Değil)",
    "lengthened": false,
    "formImage": "assets/guides/guide_db_manmaker_form.jpg",
    "anatomiImage": "assets/guides/guide_db_manmaker_anatomi.jpg",
    "cue": "Şınav + Sağ/Sol Row + Ayakları çekip Squat Clean + Baş üstü Thruster zincirini tek akışta kesintisiz uygula."
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
    "typeLabel": "Yüklü Taşıma & Omurga Zırhı",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_waiters_carry_form.jpg",
    "anatomiImage": "assets/guides/guide_waiters_carry_anatomi.jpg",
    "cue": "Tek elindeki dambılı baş üstünde kilitli tut, dirseği bükmeden dik ve küçük adımlarla yürü."
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
    "typeLabel": "Yüklü Taşıma & Omurga Zırhı",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_cross_body_carry_form.jpg",
    "anatomiImage": "assets/guides/guide_cross_body_carry_anatomi.jpg",
    "cue": "Bir elinde baş üstünde dambıl, diğer elinde bacak yanında ağır dambıl tut. Asimetrik yüke direnerek dimdik yürü."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": true,
    "formImage": "assets/guides/guide_lunge_with_twist_form.jpg",
    "anatomiImage": "assets/guides/guide_lunge_with_twist_anatomi.jpg",
    "cue": "Öne derin lunge adımı at. İnişte elindeki plakayı öndeki bacağının yönüne doğru gövdeden çevir, toparlanırken merkeze dön."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_step_up_press_form.jpg",
    "anatomiImage": "assets/guides/guide_step_up_press_anatomi.jpg",
    "cue": "Kutuya tek ayakla çıkarken ön topuktan güç al, tepe noktada doğrulurken zıt elindeki dambılı baş üstüne presle."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "LOW",
    "sfrLabel": "Düşük (Yüksek Eklem Aşınması)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_thruster_form.png",
    "anatomiImage": "",
    "cue": "Barı köprücük kemiğinde (front rack) tutarak tam squat yap, kalkış momentumunu hiç kesmeden barı baş üstüne güçlüce presle."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_hang_power_clean_form.png",
    "anatomiImage": "",
    "cue": "Barı diz kapağı hizasından başlat, kalçayı kırbaç gibi öne patlat (triple extension) ve barı omuzlarda dirsekleri öne fırlatarak yakala."
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
    "typeLabel": "Patlayıcı Güç & Kondisyon",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_push_press_form.png",
    "anatomiImage": "",
    "cue": "Bar köprücük kemiğinde dinlenirken dizleri 10-15 cm bükerek yaylan (dip), bacaklardan gelen yay kuvvetiyle barı baş üstüne patlat."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "MODERATE",
    "sfrLabel": "Orta / Modere (Yüksek Nöral Yorgunluk)",
    "lengthened": true,
    "formImage": "assets/guides/guide_bb_zercher_squat_form.png",
    "anatomiImage": "",
    "cue": "Barı dirsek içlerinde kucakla, ellerini kenetle. Dirseklerin bacak arasına inmesine izin vererek derin çömel, gövdenin öne devrilmesine diren."
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
    "typeLabel": "Ağır Serbest Ağırlık Bileşik",
    "sfr": "HIGH",
    "sfrLabel": "Yüksek Verim (Eklem Dostu, Güçlü Hipertrofi)",
    "lengthened": false,
    "formImage": "assets/guides/guide_bb_landmine_squat_press_form.png",
    "anatomiImage": "",
    "cue": "Barın ucunu göğüs hizasında iki elle tut. Derin squat yap, kalkış momentumuyla barı 45 derecelik açıyla ileri ve yukarı presle."
  }
];

function getFullCatalog() {
    try {
        const candidatePaths = [
            path.join(__dirname, '../../../index.html'),
            path.join(process.cwd(), 'index.html')
        ];
        let html = null;
        for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
                html = fs.readFileSync(p, 'utf8');
                break;
            }
        }
        if (html) {
            const dbMatch = html.match(/const EXERCISES_DB = (\[[\s\S]*?\]);/m);
            const egmMatch = html.match(/const exerciseGuideMap = ({[\s\S]*?^        };)/m);
            const glMatch = html.match(/const guideLibrary = ({[\s\S]*?^        };)/m);
            if (dbMatch && egmMatch && glMatch) {
                let guideLibrary = {};
                eval('guideLibrary = ' + glMatch[1].replace(/;$/, ''));
                let exerciseGuideMap = {};
                eval('exerciseGuideMap = ' + egmMatch[1].replace(/;$/, ''));
                let EXERCISES_DB = [];
                eval('EXERCISES_DB = ' + dbMatch[1]);

                return EXERCISES_DB.map(ex => {
                    const guide = exerciseGuideMap[ex.id] || {};
                    const biomech = academicEngine.resolveExerciseBiomechanics(ex.name);
                    return {
                        id: ex.id,
                        name: ex.name,
                        rawKey: ex.name.toLowerCase(),
                        primary: biomech.primary || (ex.category === 'conditioning' ? 'Kondisyon / Kardiyo' : 'Tüm Vücut'),
                        pFactor: biomech.pFactor,
                        sec: biomech.sec || {},
                        type: biomech.type || 'HEAVY_COMPOUND',
                        typeLabel: (biomech.type === 'CONDITIONING') ? 'Metabolik Kondisyon & Kardiyo' : 'Kuvvet Egzersizi',
                        sfr: biomech.sfr || 'HIGH',
                        sfrLabel: biomech.sfr || 'Standart',
                        lengthened: !!biomech.lengthened,
                        formImage: guide.form || '',
                        anatomiImage: guide.anatomi || '',
                        cue: ex.cue || ''
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
