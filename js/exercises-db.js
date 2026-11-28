// ==================== EXERCISES & ASSETS DATABASE ====================
        // EXERCISE DATABASE
        const EXERCISES_DB = [
  {
    "category": "push",
    "cue": "Dirsekleri gövdeye 45° açıda tut, dambılları yukarıda çarpmadan göğüs kaslarını sıkarak kilitle.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "dumbbell",
    "id": "db_bench_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Göğüs",
    "name": "Dambıl Bench Press",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "tags": [
      "full_body",
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Orta Göğüs",
    "secondarySubMuscles": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "biomechanicalProof": "Düz sehpada dirsekleri 45° açıyla indirip itmek, göğsün tam orta kısmını en geniş açıda gerip sıkıştırır; kolları düzleştirirken triceps ve ön omuz da yardıma girer.",
    "fitCategory": "bench_press",
    "fitName": "dumbbell_bench_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Sehpa açısını 30-45° yap, kürek kemiklerini sehpaya kilitle, tepe noktada üst göğsü sık.",
    "diagram": "assets/diagrams/seq_incline_press.svg",
    "equipment": "dumbbell",
    "id": "db_incline_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Üst Göğüs",
    "name": "Incline Dambıl Press",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Üst Göğüs",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "biomechanicalProof": "Sehpayı 30-45° yukarı kaldırmak itiş yönünü köprücük kemiğine taşır; böylece yük orta göğüsten doğrudan üst göğse ve ön omuza geçer.",
    "fitCategory": "bench_press",
    "fitName": "incline_dumbbell_bench_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Yerde dirsekler zemine hafifçe değdiği an durakla, momentum almadan patlayıcı şekilde yukarı it.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "dumbbell",
    "id": "db_floor_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Dambıl Floor Press",
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
    ],
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "full_body",
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Orta Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Ön Omuz",
    "biomechanicalProof": "Yerde yatarken dirseklerin zemine değmesi kolun fazla geriye gitmesini önler; dipten hız almadan yapılan itiş orta göğsü ve özellikle tricepsin kol kilitleme gücünü vurur.",
    "fitCategory": "bench_press",
    "fitName": "dumbbell_floor_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Sehpa açısını 80-85° dik konuma getir, sırtını sehpaya yapıştır, dambılları kulak hizasından baş üstüne dikey kilitle.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "dumbbell",
    "id": "db_overhead_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Omuz",
    "name": "Oturarak Dambıl Omuz Presi (Seated)",
    "positions": [
      {
        "badge": "setup",
        "desc": "80-85° dik sehpaya otur, sırtını ve belini mindere tam yasla. Ayak tabanları yerde sabit, dambıllar kulak hizasında.",
        "phase": "1. Dik Sehpa Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Sırtını sehpadan ayırmadan nefes vererek dambılları baş üstüne doğru dikey bir hatta güçlüce it.",
        "phase": "2. Destekli Dikey İtiş"
      },
      {
        "badge": "finish",
        "desc": "Kollar baş üstünde kilitlenir. Dambılları birbirine çarpmadan kontrollü şekilde kulak hizasına indir.",
        "phase": "3. Baş Üstü Kilit & Kontrol"
      }
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "tags": [
      "full_body",
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez",
    "biomechanicalProof": "Sırtı 80-85° dik sehpaya yaslayıp ağırlığı baş üstüne itmek bacaklardan hız almayı keser; ön omuzu ana hedef yaparken yan omuz ve arka kolu yardımcı çalıştırır.",
    "fitCategory": "shoulder_press",
    "fitName": "seated_dumbbell_shoulder_press",
    "fitNote": "Oturarak",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "TRICEPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Kalçayı ve karnı taş gibi sık, omurgayı geriye bükmeden dambılları kulak hizasından baş üstüne dikey kilitle.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "dumbbell",
    "id": "db_standing_overhead_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Omuz",
    "name": "Ayakta Dambıl Omuz Presi (Standing)",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez, Derin İç Karın",
    "biomechanicalProof": "Ayakta dambılları baş üstüne iterken ön ve yan omuz ana işi yapar; ağırlık tepedeyken sağa sola sallanmamak için tüm karın (core) ve kalça kasları kilitlenir.",
    "fitCategory": "shoulder_press",
    "fitName": "overhead_dumbbell_press",
    "fitNote": "Ayakta",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "TRICEPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Avuçlar yüzüne bakarak başla, preslerken bilekleri 180° çevirip baş üstüne kilitle.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "dumbbell",
    "id": "db_arnold_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Omuz, Yan Omuz",
    "name": "Arnold Press",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz, Yan Omuz",
    "secondarySubMuscles": "Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez",
    "biomechanicalProof": "Avuç içleri sana bakarken başlayıp yukarı iterken dışa çevirmek, hareketin başında ön omzu, yukarı çıkarken ise yan omzu kesintisiz çalıştırır.",
    "fitCategory": "shoulder_press",
    "fitName": "arnold_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "TRICEPS",
      "CHEST",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dirsekleri hafif kırık tut, kolları omuz hizasına kadar sürahi döker gibi kaldır.",
    "diagram": "assets/diagrams/seq_lateral_raise.svg",
    "equipment": "dumbbell",
    "id": "db_lateral_raise",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Yan Omuz",
    "name": "Dambıl Lateral Raise",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Yan Omuz",
    "secondarySubMuscles": "Üst Sırt & Trapez",
    "biomechanicalProof": "Kolları yanlardan omuz hizasına doğru açmak, omuza genişlik veren yan omuz kasını doğrudan ve tek başına hedef alır.",
    "fitCategory": "lateral_raise",
    "fitName": "dumbbell_lateral_raise",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dirsekleri başın iki yanında tavana bakacak şekilde sabit tut, sadece ön kolları büküp baş arkasından uzat.",
    "diagram": "assets/diagrams/seq_overhead_triceps.svg",
    "equipment": "dumbbell",
    "id": "db_triceps_overhead",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Arka Kol Uzun Baş",
    "name": "Dambıl Başüstü Triceps",
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
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Arka Kol Uzun Baş",
    "secondarySubMuscles": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "biomechanicalProof": "Arka kolun en büyük parçası olan iç/uzun kısım omuzdan başladığı için, ancak kol başın üstüne kaldırıldığında tam gerilir ve maksimum çalışır.",
    "fitCategory": "triceps_extension",
    "fitName": "overhead_dumbbell_triceps_extension",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Düz sehpada dirsekleri omuz hizasında dikey sabitle, dambılları şakaklara indirip triceps ile uzat.",
    "diagram": "assets/diagrams/seq_skull_crusher.svg",
    "equipment": "dumbbell",
    "id": "db_skullcrusher",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Arka Kol Uzun Baş, Arka Kol Dış Baş",
    "name": "Dambıl Skullcrusher",
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
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Arka Kol Uzun Baş, Arka Kol Dış Baş",
    "secondarySubMuscles": "Arka Kol Alt Baş",
    "biomechanicalProof": "Sırtüstü yatarken dambılları alnına/baş gerisine indirip kaldırmak, arka kolun hem uzun iç kısmını hem de dış kısmını aynı anda yoğun çalıştırır.",
    "fitCategory": "triceps_extension",
    "fitName": "dumbbell_lying_triceps_extension",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Dambılı göğsüne dikey yapıştır, topuklar yerden kalkmadan dirsekler dizlerin içine değene kadar çömel.",
    "diagram": "assets/diagrams/seq_db_squat.svg",
    "equipment": "dumbbell",
    "id": "db_goblet_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak",
    "name": "Dambıl Goblet Squat",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "lower"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Orta Ön Bacak, Ana Kalça, Derin İç Karın",
    "biomechanicalProof": "Ağırlığı göğüs önünde tutmak sırtı dik tutmayı kolaylaştırır ve derin çömelme sağlar; böylece ön bacağın dış, orta ve diz üstü iç kısmı tam çalışır.",
    "fitCategory": "squat",
    "fitName": "goblet_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "GLUTES",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Dambılları omuz başlarına paralel dayayarak tut, dirsekleri yüksek tutarak gövdeyi dimdik aşağı indir.",
    "diagram": "assets/diagrams/seq_db_clean_squat.svg",
    "equipment": "dumbbell",
    "id": "db_front_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak",
    "name": "Çift Dambıl Ön Squat (Front Squat)",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Orta Ön Bacak, Ana Kalça, Orta Sırt, Derin İç Karın",
    "biomechanicalProof": "İki dambılı omuz önünde tutarak dik gövdeyle çömelmek, yükü kalçadan çok dizlere ve ön bacak kaslarına odaklar.",
    "fitCategory": "squat",
    "fitName": "dumbbell_front_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "GLUTES",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Arka ayağın üstünü sehpa kenarına yerleştir, ön diz 90° olana kadar dik çök, ön topuktan patla.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "db_bulgarian_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Bulgar Split Squat",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Kalça",
    "secondarySubMuscles": "Derin Kalça, Orta Ön Bacak",
    "biomechanicalProof": "Arka ayağı sehpaya koyup tek bacakla derin çömelmek, öndeki bacağın diz üstü iç kısmını ve ana kalçayı vururken, devrilmemek için yan kalça denge kasını çok yoğun çalıştırır.",
    "fitCategory": "lunge",
    "fitName": "dumbbell_bulgarian_split_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Öne büyük adımlar at, arka diz yere 2 cm kalana kadar çök, ön topuktan kuvvet alarak diğer adıma geç.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "db_walking_lunge",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Yürüyerek Lunge (Walking Lunge)",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "calves"
    ],
    "tags": [
      "full_body",
      "legs",
      "lower",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "secondarySubMuscles": "Yan Kalça, Orta Ön Bacak, Üst Baldır",
    "biomechanicalProof": "İleri adım atıp çömelmek ve öndeki bacakla kendini yukarı-ileri çekmek, ön bacak ile ana ve yan kalça kaslarını her adımda güçlü çalıştırır.",
    "fitCategory": "lunge",
    "fitName": "walking_dumbbell_lunge",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Geriye adım atarak çök (diz tendonlarını korur), ön topuktan patlayıcı güçle başlangıç noktasına çekil.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "db_reverse_lunge",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Reverse Lunge",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "secondarySubMuscles": "Yan Kalça, Orta Ön Bacak, Derin İç Karın",
    "biomechanicalProof": "Geriye doğru adım atmak dize binen baskıyı azaltır; öndeki bacağın ön kısmını ve ana kalça kasını diz dostu açıda çalıştırır.",
    "fitCategory": "lunge",
    "fitName": "dumbbell_reverse_lunge",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Dizleri hafif kırık sabitle, kalçayı arkadaki duvara değdirir gibi geriye uzat, sırtı masa gibi düz tut.",
    "diagram": "assets/diagrams/seq_db_rdl.svg",
    "equipment": "dumbbell",
    "id": "db_rdl",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Arka Bacak, Arka Bacak & Kalça Bağı, Ana Kalça",
    "name": "Dambıl RDL",
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
    ],
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "lower"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Arka Bacak, Arka Bacak & Kalça Bağı, Ana Kalça",
    "secondarySubMuscles": "Alt Sırt & Bel, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Dizleri çok az kırıp kalçayı geriye iterek öne eğilmek, arka bacağın üst/uzun kısmını sonuna kadar esnetir ve doğrulurken ana kalça kasıyla birlikte kasar.",
    "fitCategory": "deadlift",
    "fitName": "romanian_deadlift",
    "fitNote": "DB RDL",
    "garminPrimaryMuscles": [
      "HAMSTRINGS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "ADDUCTORS",
      "FOREARM",
      "LATS",
      "LOWER_BACK",
      "TRAPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Destek ayağının dizini hafif bük, serbest bacağı arkaya cetvel gibi uzatırken dambılı kaval kemiğine indir.",
    "diagram": "assets/diagrams/seq_db_single_leg_rdl.svg",
    "equipment": "dumbbell",
    "id": "db_single_leg_rdl",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Arka Bacak, Ana Kalça, Yan Kalça",
    "name": "Tek Bacak RDL",
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
    ],
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "secondaryMuscles": [
      "core",
      "calves"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Arka Bacak, Ana Kalça, Yan Kalça, Derin Kalça",
    "secondarySubMuscles": "Arka Bacak & Kalça Bağı, Alt Sırt & Bel, Yan Karın, Ön Kaval & Bilek",
    "biomechanicalProof": "Tek ayak üzerinde öne eğilip kalkmak arka bacak ve ana kalçayı çalıştırırken, kalçanın yana devrilmesini önlemek için yan kalça ve ayak bileği denge kaslarını yoğun çalıştırır.",
    "fitCategory": "deadlift",
    "fitName": "single_leg_romanian_deadlift_with_dumbbell",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "HAMSTRINGS",
      "LOWER_BACK"
    ],
    "garminSecondaryMuscles": [
      "TRAPS",
      "LATS",
      "GLUTES",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Bir diz ve el sehpada, sırt masa gibi düz. Dambılı dikey değil, yay çizerek kalça cebine doğru çek.",
    "diagram": "assets/diagrams/seq_db_row.svg",
    "equipment": "dumbbell",
    "id": "db_saw_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Kanatlar",
    "name": "Dambıl Saw Row",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps"
    ],
    "tags": [
      "full_body",
      "upper_pull",
      "upper"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Kanatlar",
    "secondarySubMuscles": "Orta Sırt, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Dirseği gövdeye yakın tutup dambılı göğse değil arka cebe doğru (testere gibi) çekmek, sırtı üçgenleştiren kanat kaslarını en alt ucuna kadar çalıştırır.",
    "fitCategory": "row",
    "fitName": "one_arm_bent_over_row",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Göğsü 30-45° eğimli sehpaya yasla, belden hiç momentum almadan sadece kürek kemiklerini sıkarak çek.",
    "diagram": "assets/diagrams/seq_incline_row.svg",
    "equipment": "dumbbell",
    "id": "db_chest_supported_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Sırt, Kanatlar",
    "name": "Göğüs Destekli Row",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Orta Sırt, Kanatlar",
    "secondarySubMuscles": "Arka Omuz, Üst Sırt & Trapez, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Göğsü sehpaya dayamak belden hız almayı tamamen keser; kürek kemiklerini arkada birbirine sıkıştırarak çekmek orta sırt kalınlığını doğrudan vurur.",
    "fitCategory": "row",
    "fitName": "chest_supported_dumbbell_row",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Şınav pozisyonunda dambılları tut, ayakları geniş aç, kalçayı hiç sallamadan sırayla çekiş yap.",
    "diagram": "assets/diagrams/seq_renegade_row.svg",
    "equipment": "dumbbell",
    "id": "db_renegade_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Sırt, Kanatlar, Yan Karın",
    "name": "Renegade Row",
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
    ],
    "primaryMuscles": [
      "back",
      "core"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders",
      "triceps",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "core",
      "functional_fitness"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Orta Sırt, Kanatlar, Yan Karın, Derin İç Karın",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz, Arka Kol Alt Baş, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Şınav duruşunda tek kolla yerden dambıl çekerken gövdenin dönmemesi için kendini sıkmak, orta sırt/kanatlarla birlikte yan karın kaslarını çok sert çalıştırır.",
    "fitCategory": "row",
    "fitName": "renegade_row",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Sehpada sırtüstü uzan, dambılı iki elle başın arkasına dirsekleri kırmadan uzat, kanatlarla göğüs üstüne çek.",
    "diagram": "assets/diagrams/seq_pullover.svg",
    "equipment": "dumbbell",
    "id": "db_pullover",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Kanatlar",
    "name": "Dambıl Pullover",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "chest",
      "triceps"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Kanatlar",
    "secondarySubMuscles": "Alt Göğüs, Orta Göğüs, Arka Kol Uzun Baş",
    "biomechanicalProof": "Sırtüstü yatarken kolları başın gerisinden yukarı çekmek, kanat kaslarını boydan boya esnetip çalıştırırken göğüs kafesini ve orta/alt göğsü de devreye sokar.",
    "fitCategory": "pull_up",
    "fitName": "ez_bar_pullover",
    "fitNote": "DB Pullover",
    "garminPrimaryMuscles": [
      "LATS",
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "ABS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Avuç içleri birbirine baksın (nötr tutuş), dirsekleri kaburgalara sabitle, sadece ön kolu kaldır.",
    "diagram": "assets/diagrams/seq_hammer_curl.svg",
    "equipment": "dumbbell",
    "id": "db_hammer_curl",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Kol & Dış Pazı, Pazı Dış Baş",
    "name": "Hammer Curl",
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
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Kol & Dış Pazı, Pazı Dış Baş",
    "secondarySubMuscles": "Pazı İç Baş",
    "biomechanicalProof": "Avuç içleri birbirine bakacak şekilde (çekiç tutuşu) kaldırmak, yükü bicepsin altındaki kol kalınlaştırıcı kasa ve ön kolun üst kısmına kaydırır.",
    "fitCategory": "curl",
    "fitName": "dumbbell_hammer_curl",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "BICEPS"
    ],
    "garminSecondaryMuscles": [
      "FOREARM"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Sehpayı 45-60° eğ, kollar arkada tamamen sarkıtılsın, omuzları oynatmadan biceps ile kıvır.",
    "diagram": "assets/diagrams/seq_biceps_curl.svg",
    "equipment": "dumbbell",
    "id": "db_incline_curl",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Pazı Dış Baş",
    "name": "Incline Dambıl Curl",
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
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Pazı Dış Baş",
    "secondarySubMuscles": "Pazı İç Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Eğimli sehpada otururken kolların gövdenin gerisinde kalması, pazının dış/tepe kısmını (uzun baş) hareketin en başında maksimum gerer ve tepe görünümünü büyütür.",
    "fitCategory": "curl",
    "fitName": "incline_dumbbell_biceps_curl",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "BICEPS"
    ],
    "garminSecondaryMuscles": [
      "FOREARM"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Ağır dambılları kaldır, omuzları geriye kilitle, karın duvarını taş gibi sık ve küçük kontrollü adımlarla yürü.",
    "diagram": "assets/diagrams/seq_farmers_walk.svg",
    "equipment": "dumbbell",
    "id": "db_farmers_walk",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Derin İç Karın, Üst Sırt & Trapez, Ön Kol & Dış Pazı",
    "name": "Çiftçi Yürüyüşü (Farmer's Walk / Carry)",
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
    ],
    "primaryMuscles": [
      "core",
      "back",
      "forearms"
    ],
    "secondaryMuscles": [
      "glutes",
      "calves"
    ],
    "tags": [
      "full_body",
      "core",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Üst Sırt & Trapez, Ön Kol & Dış Pazı",
    "secondarySubMuscles": "Yan Karın, Yan Kalça, Alt Sırt & Bel, Üst Baldır",
    "biomechanicalProof": "İki elde ağır yükle dik yürümek; karnı içe tutan derin korse kasını, yan karınları, omuzları taşıyan üst trapezi ve el/bilek kavrama kaslarını aynı anda çalıştırır.",
    "fitCategory": "carry",
    "fitName": "farmers_walk",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "FOREARM"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "QUADS",
      "LOWER_BACK",
      "TRAPS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Sadece tek elde ağır dambıl tut, ağırlığın seni yana bükmesine ASLA izin verme, dimdik yürü.",
    "diagram": "assets/diagrams/seq_farmers_walk.svg",
    "equipment": "dumbbell",
    "id": "db_suitcase_carry",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Karın, Derin İç Karın",
    "name": "Tek El Çanta Taşıma (Suitcase Carry)",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "glutes",
      "back",
      "forearms"
    ],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Kalça, Üst Sırt & Trapez, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Sadece tek elde ağır dambıl taşırken vücudun o tarafa yatmasını engellemek, ağırlığın tam tersi taraftaki yan karın ve bel yanı kaslarını çok güçlü çalıştırır.",
    "fitCategory": "carry",
    "fitName": "farmers_walk",
    "fitNote": "Tek El",
    "garminPrimaryMuscles": [
      "FOREARM"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "QUADS",
      "LOWER_BACK",
      "TRAPS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Yere otur, gövdeyi 45° yatır, ayakları kaldır. Dambılı sağ ve sol kalça yanına kontrollü döndür.",
    "diagram": "assets/diagrams/seq_russian_twist.svg",
    "equipment": "dumbbell",
    "id": "db_russian_twist",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Yan Karın",
    "name": "Russian Twist",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın",
    "secondarySubMuscles": "Ön Karın, Derin İç Karın",
    "biomechanicalProof": "Yerde gövde hafif geriye yatıkken ağırlığı sağa sola döndürmek, belin yanlarındaki dönüş kaslarını (yan karın) doğrudan çalıştırır.",
    "fitCategory": "core",
    "fitName": "russian_twist",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "OBLIQUES"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Dambılı bacak arasından patlayıcı kalça vuruşuyla tek hamlede baş üstüne kilitlenene kadar fırlat.",
    "diagram": "assets/diagrams/seq_db_snatch.svg",
    "equipment": "dumbbell",
    "id": "db_snatch",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak, Ön Omuz",
    "name": "Dambıl Snatch",
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
    ],
    "primaryMuscles": [
      "shoulders",
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "quads",
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "power",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Ana Kalça, Arka Bacak, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Üst Sırt & Trapez, Alt Sırt & Bel, Dış Ön Bacak, Arka Kol Alt Baş, Derin İç Karın",
    "biomechanicalProof": "Yerdeki dambılı bacak ve kalça patlamasıyla tek hamlede baş üstüne çekip kilitlemek; kalça, arka/ön bacak, üst sırt ve omuzları patlayıcı çalıştırır.",
    "fitCategory": "olympic_lift",
    "fitName": "dumbbell_snatch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "GLUTES",
      "SHOULDERS",
      "QUADS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "BICEPS",
      "HAMSTRINGS",
      "LOWER_BACK",
      "TRAPS",
      "TRICEPS",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Dambılın ucundan iki elle tut, squat yapma! Kalçayı geriye menteşele ve kalça vuruşuyla göğüs hizasına fırlat.",
    "diagram": "assets/diagrams/seq_db_swing.svg",
    "equipment": "dumbbell",
    "id": "db_swing",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak & Kalça Bağı, Arka Bacak",
    "name": "Dambıl Swing",
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
    ],
    "primaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Ana Kalça, Arka Bacak & Kalça Bağı, Arka Bacak",
    "secondarySubMuscles": "Alt Sırt & Bel, Derin İç Karın, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Dambılı bacak arasından kalçayı ileri patlatarak savurmak, ana kalça kasını ve arka bacakları güçlü çalıştırırken en üst noktada karın ve beli kilitler.",
    "fitCategory": "hip_swing",
    "fitName": "single_arm_dumbbell_swing",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "HAMSTRINGS",
      "CALVES"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Kolları halat gibi serbest tut, gülleyi sadece kalça menteşesi ve patlayıcı glute itişiyle fırlat.",
    "diagram": "assets/diagrams/seq_db_swing.svg",
    "equipment": "kettlebell",
    "id": "kb_swing",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak & Kalça Bağı, Arka Bacak",
    "name": "Kettlebell Swing",
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
    ],
    "primaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Ana Kalça, Arka Bacak & Kalça Bağı, Arka Bacak",
    "secondarySubMuscles": "Alt Sırt & Bel, Derin İç Karın, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Kettlebell'i kollarla değil kalçanın ileri patlamasıyla savurmak, ana kalça, arka bacak ve alt sırt zincirinin tamamını çalıştırır.",
    "fitCategory": "hip_swing",
    "fitName": "single_arm_kettlebell_swing",
    "fitNote": "KB Swing",
    "garminPrimaryMuscles": [
      "QUADS",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "HAMSTRINGS",
      "CALVES"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Gülleyi bacak arasından çek, dirseği gövdeye yapıştırarak ön kola çarpmadan yumuşakça göğse al.",
    "diagram": "assets/diagrams/seq_db_clean_squat.svg",
    "equipment": "kettlebell",
    "id": "kb_clean",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak, Üst Sırt & Trapez",
    "name": "Kettlebell Clean",
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
    ],
    "primaryMuscles": [
      "glutes",
      "hamstrings",
      "back"
    ],
    "secondaryMuscles": [
      "biceps",
      "core"
    ],
    "tags": [
      "full_body",
      "power",
      "functional_fitness"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Ana Kalça, Arka Bacak, Üst Sırt & Trapez, Orta Sırt",
    "secondarySubMuscles": "Alt Sırt & Bel, Ön Kol & Dış Pazı, Pazı Dış Baş, Derin İç Karın",
    "biomechanicalProof": "Ağırlığı kalça gücüyle yerden hızlandırıp dirseği bükerek omuz önüne (göğüs hizasına) almak; kalça, arka bacak, orta/üst sırt ve bicepsleri birlikte çalıştırır.",
    "fitCategory": "olympic_lift",
    "fitName": "clean",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "HAMSTRINGS",
      "GLUTES",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "CALVES",
      "SHOULDERS",
      "TRAPS",
      "BICEPS",
      "FOREARM",
      "LOWER_BACK",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Rack pozisyonundan başla, bacaklardan hiç yaylanmadan sadece omuz gücüyle gülleyi baş üstüne kilitle.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "kettlebell",
    "id": "kb_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Omuz",
    "name": "Kettlebell Press",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "upper_push",
      "upper",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez, Yan Karın",
    "biomechanicalProof": "Kettlebell'in topuzu elin dış kısmında durduğu için yukarı iterken omuzun iç denge kasları dambıla göre çok daha fazla çalışır; tek kolla yapılması yan karnı da devreye sokar.",
    "fitCategory": "shoulder_press",
    "fitName": "overhead_dumbbell_press",
    "fitNote": "KB Press",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "TRICEPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Gülleyi tek hamlede baş üstüne fırlatıp kilitle, indirirken önce göğse (rack) alıp sonra bacak arasına bırak.",
    "diagram": "assets/diagrams/seq_db_snatch.svg",
    "equipment": "kettlebell",
    "id": "kb_half_snatch",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak, Ön Omuz",
    "name": "Kettlebell Snatch",
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
    ],
    "primaryMuscles": [
      "shoulders",
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "quads",
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "power",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Ana Kalça, Arka Bacak, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Üst Sırt & Trapez, Alt Sırt & Bel, Dış Ön Bacak, Arka Kol Alt Baş, Yan Karın",
    "biomechanicalProof": "Kettlebell'i bacak arasından tek hamlede baş üstüne fırlatıp kilitlemek; alt vücutta kalça ve arka bacağı, üstte ise sırt, omuz ve karın kaslarını çalıştırır.",
    "fitCategory": "olympic_lift",
    "fitName": "single_arm_kettlebell_snatch",
    "fitNote": "Yarım",
    "garminPrimaryMuscles": [
      "GLUTES",
      "SHOULDERS",
      "QUADS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "BICEPS",
      "HAMSTRINGS",
      "LOWER_BACK",
      "TRAPS",
      "TRICEPS",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Gülleyi boynuzlarından göğse yapıştır, dirsekler dizlerin içine inene kadar derin çömel.",
    "diagram": "assets/diagrams/seq_db_squat.svg",
    "equipment": "kettlebell",
    "id": "kb_goblet_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak",
    "name": "Kettlebell Goblet Squat",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "legs",
      "lower",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Orta Ön Bacak, Ana Kalça, Derin İç Karın",
    "biomechanicalProof": "Kettlebell'i göğüs önünde tutarak en dibe kadar çömelmek, ön bacak kaslarını, ana kalçayı ve kasık/iç bacak kaslarını tam açıda çalıştırır.",
    "fitCategory": "squat",
    "fitName": "goblet_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "GLUTES",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Goril gibi dizleri bükük ve eğik dur. Bir gülleyi yerde bastırırken diğerini kalçaya patlayıcı çek.",
    "diagram": "assets/diagrams/seq_db_row.svg",
    "equipment": "kettlebell",
    "id": "kb_gorilla_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Kanatlar, Orta Sırt",
    "name": "Gorilla Row",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "core",
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "core",
      "functional_fitness"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Kanatlar, Orta Sırt",
    "secondarySubMuscles": "Alt Sırt & Bel, Yan Karın, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Geniş çömelme duruşunda yerdeki iki ağırlığı sırayla çekmek, kanat ve orta sırtı çalıştırırken gövdenin dönmesini önleyen yan karın ve bacakları da aktif tutar.",
    "fitCategory": "row",
    "fitName": "kettlebell_row",
    "fitNote": "Gorilla Row",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Gülleyi baş üstünde kilitli tut, gözlerini güllenden ayırmadan zıt ayak bileğine doğru gövdeyi döndürerek eğil.",
    "diagram": "assets/diagrams/seq_windmill.svg",
    "equipment": "kettlebell",
    "id": "kb_windmill",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Yan Karın, Yan Kalça, Derin Kalça",
    "name": "Kettlebell Windmill",
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
    ],
    "primaryMuscles": [
      "core",
      "glutes"
    ],
    "secondaryMuscles": [
      "shoulders",
      "hamstrings"
    ],
    "tags": [
      "core",
      "mobility",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Yan Karın, Yan Kalça, Derin Kalça",
    "secondarySubMuscles": "Ön Omuz, Arka Omuz, Arka Bacak, Derin İç Karın",
    "biomechanicalProof": "Ağırlık baş üstünde havadayken kalçayı yana itip yere doğru eğilmek, yan karın ve bel yanlarını çalıştırırken arka bacağı esnetir ve omzu dengede tutar.",
    "fitCategory": "core",
    "fitName": "kettlebell_windmill",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Gözlerini tavandaki güllenden ayırma! Sırtüstünden ayağa kalkana kadar her eklem adımını sırayla kitle.",
    "diagram": "assets/diagrams/seq_windmill.svg",
    "equipment": "kettlebell",
    "id": "kb_turkish_getup",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Derin İç Karın, Ön Karın, Yan Karın",
    "name": "Turkish Get-Up",
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
    ],
    "primaryMuscles": [
      "core",
      "shoulders"
    ],
    "secondaryMuscles": [
      "glutes",
      "quads",
      "triceps"
    ],
    "tags": [
      "full_body",
      "core",
      "mobility",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Ön Karın, Yan Karın, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Ana Kalça, Yan Kalça, Dış Ön Bacak, Arka Kol Alt Baş",
    "biomechanicalProof": "Ağırlığı baş üstünde tutarak yerden adım adım ayağa kalkıp geri yatmak; omuz denge kaslarını, tüm karın/bel çevresini ve bacak/kalça kaslarını tek harekette birleştirir.",
    "fitCategory": "core",
    "fitName": "turkish_get_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "OBLIQUES",
      "LOWER_BACK",
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Gülleyi ters çevirip boynuzlardan tut, başını oynatmadan gülleyi başının etrafında haleler çizerek döndür.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "kettlebell",
    "id": "kb_halo",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Arka Omuz, Yan Omuz",
    "name": "Kettlebell Halo",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "core",
      "mobility",
      "upper_pull",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Arka Omuz, Yan Omuz",
    "secondarySubMuscles": "Üst Sırt & Trapez, Orta Sırt, Derin İç Karın",
    "biomechanicalProof": "Ağırlığı başın etrafında tam tur döndürmek omuz eklemini her açıdan çalıştırır; özellikle arka/yan omuz, omuz iç denge kasları ve kürek kemiği çevresini açar.",
    "fitCategory": "shoulder_stability",
    "fitName": "shoulder_stability",
    "fitNote": "KB Halo",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs",
    "cue": "Plakayı iki yanından tutup geniş duruşla derin çömel, kalkışta gövdeyi sabit tutarak plakayı başının etrafında sağa ve sola döndür.",
    "diagram": "assets/diagrams/plate_squat_halo.webp",
    "equipment": "dumbbell",
    "id": "db_plate_squat_halo",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Arka Omuz, Yan Omuz, Ön Omuz",
    "name": "Plaka Squat & Halo",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinden biraz açık, ağırlık plakası iki yanından kavranır; karın ve kalça sıkı.",
        "phase": "1. Geniş Duruş & Plaka Tutuş"
      },
      {
        "badge": "action",
        "desc": "Dizleri dışa açarak kalçayı geriye ve aşağı indir; plaka bacak arasında yere paralel konuma gelir.",
        "phase": "2. Derin Squat Çöküşü"
      },
      {
        "badge": "finish",
        "desc": "Topuklardan iterek ayağa kalk ve plakayı başın etrafında tam daire döndür; her tekrarda yön değiştir.",
        "phase": "3. Kalkış & Baş Çevresi Halo"
      }
    ],
    "primaryMuscles": [
      "quads",
      "shoulders",
      "glutes"
    ],
    "secondaryMuscles": [
      "core",
      "back",
      "biceps"
    ],
    "tags": [
      "full_body",
      "legs",
      "core",
      "mobility",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Arka Omuz, Yan Omuz, Ön Omuz",
    "secondarySubMuscles": "Ön Karın, Yan Karın, Derin İç Karın, Üst Sırt & Trapez, Orta Sırt, Ön Kol & Bilek",
    "biomechanicalProof": "Geniş duruşlu squat ile baş çevresi halo dönüşünü birleştirmek alt vücut gücünü, omuz mobilitesini ve anti-rotasyon gövde stabilitesini tek akışta çalıştırır.",
    "fitCategory": "squat",
    "fitName": "",
    "fitNote": "Plaka Squat & Halo [id:db_plate_squat_halo]",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "OBLIQUES",
      "UPPER_BACK",
      "FOREARMS"
    ],
    "garminMatchType": "unmapped_noted"
  },
  {
    "category": "push",
    "cue": "Derin squat yap, kalkışın patlayıcı momentumunu hiç kesmeden doğrudan baş üstü pres ile birleştir.",
    "diagram": "assets/diagrams/seq_thruster.svg",
    "equipment": "kettlebell",
    "id": "kb_thruster",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "name": "Kettlebell Thruster",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın, Üst Sırt & Trapez",
    "biomechanicalProof": "Kettlebell'lerle derin çömelip kalkarken baş üstüne pres yapmak; ön bacak, kalça ve omuz kaslarını yüksek nabızla çalıştırır.",
    "fitCategory": "squat",
    "fitName": "dumbbell_thrusters",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "CALVES",
      "CHEST",
      "HAMSTRINGS",
      "HIPS",
      "LOWER_BACK",
      "TRAPS",
      "TRICEPS",
      "FOREARM"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Göz hizası barın altında, kürek kemiklerini sehpaya göm, barı alt göğse değdirip patlayıcı it.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "barbell",
    "id": "bb_bench_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Göğüs",
    "name": "Barbell Bench",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Orta Göğüs",
    "secondarySubMuscles": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "biomechanicalProof": "Düz sehpada iki eli sabit barla birleştirerek ağır itiş yapmak, orta göğse en yüksek ağırlığı yüklerken kolları kilitleyen tricepsi ve ön omzu güçlü çalıştırır.",
    "fitCategory": "bench_press",
    "fitName": "barbell_bench_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "30° açılı sehpada barı köprücük kemiğinin hemen altına indir, üst göğüs lifleriyle yukarı presle.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "barbell",
    "id": "bb_incline_bench",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Üst Göğüs",
    "name": "Incline Barbell Bench",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Üst Göğüs",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "biomechanicalProof": "Yukarı eğimli sehpada barı üst göğse indirip itmek, göğsün üst kısmını (köprücük kemiği altını) ve ön omuzları ana hedef yapar.",
    "fitCategory": "bench_press",
    "fitName": "incline_barbell_bench_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Barı köprücük kemiğinde tut, başını hafif geriye çekip barı yukarı iterken başını barın altından öne sok.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "barbell",
    "id": "bb_overhead_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Omuz",
    "name": "Barbell Omuz Presi",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Üst Sırt & Trapez, Derin İç Karın",
    "biomechanicalProof": "Ayakta düz barı baş üstüne ağır şekilde itmek ön ve yan omuzları büyütürken, barı dengede tutmak için karın, alt bel ve üst sırtı taş gibi sıkar.",
    "fitCategory": "shoulder_press",
    "fitName": "overhead_barbell_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "TRICEPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Barı üst trapezlere sağlam kilitle, dizleri dışa açarak kalçayı paralel altına indir, ayak tabanıyla yeri parçala.",
    "diagram": "assets/diagrams/seq_db_squat.svg",
    "equipment": "barbell",
    "id": "bb_back_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "name": "Barbell Back Squat",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "lower"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "secondarySubMuscles": "Orta Ön Bacak, Alt Sırt & Bel, Derin İç Karın",
    "biomechanicalProof": "Sırtta ağır barla çömelip kalkmak, tüm ön bacak kaslarını, ana kalçayı ve dip noktadan çıkarken iç bacak kaslarını en yüksek ağırlıkla çalıştırır.",
    "fitCategory": "squat",
    "fitName": "barbell_back_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Barı omuz önünde ön rack pozisyonunda tut, dirsekleri tavana doğru yüksek tutarak dimdik çömel.",
    "diagram": "assets/diagrams/seq_db_clean_squat.svg",
    "equipment": "barbell",
    "id": "bb_front_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak",
    "name": "Barbell Front Squat",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Orta Ön Bacak, Ana Kalça, Orta Sırt, Derin İç Karın",
    "biomechanicalProof": "Barı ön omuzda taşımak gövdeyi dimdik tutmaya zorlar; bu da ön bacak kaslarını ve sırtın üst/orta kısmını normal squat'tan daha fazla çalıştırır.",
    "fitCategory": "squat",
    "fitName": "barbell_front_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "GLUTES",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Bar kaval kemiğine temas etsin, sırt masa gibi düz, yeri ayak tabanlarınla iterek kalçayı kilitle.",
    "diagram": "assets/diagrams/seq_db_rdl.svg",
    "equipment": "barbell",
    "id": "bb_deadlift",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak, Arka Bacak & Kalça Bağı",
    "name": "Barbell Deadlift",
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
    ],
    "primaryMuscles": [
      "hamstrings",
      "glutes",
      "back"
    ],
    "secondaryMuscles": [
      "quads",
      "biceps",
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "lower"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Ana Kalça, Arka Bacak, Arka Bacak & Kalça Bağı, Alt Sırt & Bel",
    "secondarySubMuscles": "Dış Ön Bacak, Üst Sırt & Trapez, Orta Sırt, Ön Kol & Dış Pazı, Derin İç Karın",
    "biomechanicalProof": "Yerdeki ağır barı ayağa kalkarak kaldırmak; yerden keserken ön bacağı, doğrulurken arka bacak ve ana kalçayı, omurgayı düz tutarken de alt/üst tüm sırtı çalıştırır.",
    "fitCategory": "deadlift",
    "fitName": "barbell_deadlift",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "HAMSTRINGS",
      "LOWER_BACK"
    ],
    "garminSecondaryMuscles": [
      "LATS",
      "TRAPS",
      "FOREARM",
      "QUADS",
      "GLUTES",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Dizleri hafif kırık sabitle, barı kaval kemiği boyunca indirerek kalçayı arkaya menteşele.",
    "diagram": "assets/diagrams/seq_db_rdl.svg",
    "equipment": "barbell",
    "id": "bb_rdl",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Arka Bacak, Arka Bacak & Kalça Bağı, Ana Kalça",
    "name": "Barbell RDL",
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
    ],
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Arka Bacak, Arka Bacak & Kalça Bağı, Ana Kalça",
    "secondarySubMuscles": "Alt Sırt & Bel, Üst Sırt & Trapez, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Ağır barı bacaklara sürterek kalçayı geriye itmek, arka bacak kaslarının tamamında ve ana kalça kasında en yüksek gerilimi üretir.",
    "fitCategory": "deadlift",
    "fitName": "romanian_deadlift",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "HAMSTRINGS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "ADDUCTORS",
      "FOREARM",
      "LATS",
      "LOWER_BACK",
      "TRAPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Sırt sehpaya dayalı, süngerli bar kalça kıvrımında, topuklardan yeri iterek tepe noktada kalçayı taş gibi kilitle.",
    "diagram": "assets/diagrams/seq_db_rdl.svg",
    "equipment": "barbell",
    "id": "bb_hip_thrust",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ana Kalça",
    "name": "Barbell Hip Thrust",
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
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Ana Kalça",
    "secondarySubMuscles": "Yan Kalça, Arka Bacak & Kalça Bağı",
    "biomechanicalProof": "Sırt sehpada ve dizler bükülüyken barı kalçayla yukarı itmek, arka bacağın yük çalmasını engeller ve bütün gücü doğrudan ana kalça kasına verir.",
    "fitCategory": "hip_raise",
    "fitName": "barbell_hip_thrust_with_bench",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Gövdeyi 45° öne eğ, omurgayı düz tut, barı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek.",
    "diagram": "assets/diagrams/seq_incline_row.svg",
    "equipment": "barbell",
    "id": "bb_bent_over_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Sırt, Kanatlar",
    "name": "Barbell Row",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Orta Sırt, Kanatlar",
    "secondarySubMuscles": "Alt Sırt & Bel, Üst Sırt & Trapez, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Kalçadan öne eğilerek ağır barı karna çekmek orta sırt ve kanatları büyütürken, eğik gövdeyi sabit tutmak için alt sırt ve bel kaslarını da güçlü çalıştırır.",
    "fitCategory": "row",
    "fitName": "bent_over_row_with_barbell",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Gövde yere tam paralel (90°). Her tekrarda bar yerden sıfırdan başlar, patlayıcı alt göğse çekilip yere bırakılır.",
    "diagram": "assets/diagrams/seq_incline_row.svg",
    "equipment": "barbell",
    "id": "bb_pendlay_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Sırt, Kanatlar, Üst Sırt & Trapez",
    "name": "Pendlay Row",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "power"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Orta Sırt, Kanatlar, Üst Sırt & Trapez",
    "secondarySubMuscles": "Alt Sırt & Bel, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Gövde yere paralelken her tekrarda yerdeki barı patlayıcı şekilde karnına çekmek, üst/orta sırt ve kanatlarda saf çekiş gücü üretir.",
    "fitCategory": "row",
    "fitName": "bent_over_row_with_barbell",
    "fitNote": "Pendlay Row",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Dirsekleri gövdeye yapıştır, belden savurma yapmadan sadece ön kolları bükerek barı göğse doğru kıvır.",
    "diagram": "assets/diagrams/seq_biceps_curl.svg",
    "equipment": "barbell",
    "id": "bb_biceps_curl",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Pazı İç Baş, Pazı Dış Baş",
    "name": "Barbell Curl",
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
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Pazı İç Baş, Pazı Dış Baş",
    "secondarySubMuscles": "Ön Kol & Dış Pazı",
    "biomechanicalProof": "Düz barla avuç içleri tam yukarı bakarak iki elle ağır kaldırmak, özellikle kolun ön/iç dolgunluğunu veren biceps iç ve dış kısmına en yüksek yükü bindirir.",
    "fitCategory": "curl",
    "fitName": "barbell_biceps_curl",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "BICEPS"
    ],
    "garminSecondaryMuscles": [
      "FOREARM"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Elleri omuz genişliğinde dar tut, inişte dirsekleri gövdeye yapışık tutarak ağırlığı triceps ile presle.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "barbell",
    "id": "bb_close_grip_bench",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Dar Tutuş Bench",
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
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz, Arka Kol Uzun Baş",
    "biomechanicalProof": "Barı dar tutup dirsekleri gövdeye yakın indirip itmek, göğsün yükünü azaltır ve arka kolun dış ile alt kısmına çok yüksek itiş gücü bindirir.",
    "fitCategory": "bench_press",
    "fitName": "close_grip_barbell_bench_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Bacak pedine sıkıca otur, barı üst göğse doğru dirsekleri kaburgalara çekerek indir, arkaya aşırı yatma.",
    "diagram": "assets/diagrams/seq_incline_row.svg",
    "equipment": "machine",
    "id": "mach_lat_pulldown",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Kanatlar",
    "name": "Lat Pulldown",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Kanatlar",
    "secondarySubMuscles": "Orta Sırt, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Yukarıdaki barı göğse doğru çekmek, sırta genişlik (V görünümü) veren kanat kaslarını doğrudan çalıştırır; çekiş sırasında biceps ve ön kollar yardımcı olur.",
    "fitCategory": "pull_up",
    "fitName": "lat_pulldown",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "TRAPS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Ayakları platforma bas, sırtı dik tut, tutacağı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek.",
    "diagram": "assets/diagrams/seq_incline_row.svg",
    "equipment": "machine",
    "id": "mach_cable_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Sırt, Kanatlar",
    "name": "Kablo Row",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Orta Sırt, Kanatlar",
    "secondarySubMuscles": "Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Oturarak kabloyu karnına doğru çekerken omuzları geriye alıp kürek kemiklerini birbirine yaklaştırmak, orta sırt kalınlığını ve kanatları birlikte çalıştırır.",
    "fitCategory": "row",
    "fitName": "cable_row_standing",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Halatı göz hizasından tut, dirsekleri yüksekte dışa açarak halatın ortasını alnına doğru çek ve arka omuzu sık.",
    "diagram": "assets/diagrams/seq_lateral_raise.svg",
    "equipment": "machine",
    "id": "mach_face_pull",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Arka Omuz",
    "name": "Face Pull",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "back"
    ],
    "tags": [
      "upper_pull",
      "upper",
      "posture"
    ],
    "weightKey": "",
    "primarySubMuscles": "Arka Omuz",
    "secondarySubMuscles": "Orta Sırt, Üst Sırt & Trapez",
    "biomechanicalProof": "Halatı yüzüne doğru çekip elleri iki yana açmak, duruşu dikleştiren arka omuzları, kürek kemiği çevresini ve omuz eklemini koruyan iç denge kaslarını doğrudan çalıştırır.",
    "fitCategory": "row",
    "fitName": "face_pull",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LATS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dirseklerde hafif sabit açı tut, kolları büyük bir ağaca sarılır gibi göğsün önünde birleştir.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "machine",
    "id": "mach_cable_crossover",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Orta Göğüs, Alt Göğüs",
    "name": "Kablo Crossover",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Orta Göğüs, Alt Göğüs",
    "secondarySubMuscles": "Ön Omuz",
    "biomechanicalProof": "Dirsekleri büküp açmadan kolları önde birbirine kavuşturmak (sarılmak gibi), tricepsi devre dışı bırakır ve doğrudan orta ile iç göğüs liflerini sıkıştırır.",
    "fitCategory": "flye",
    "fitName": "cable_crossover",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dirsekleri pedlere veya tutacaklara yerleştir, omuzları geride tutarak göğüs kaslarınla kolları önde kapat.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "machine",
    "id": "mach_pec_deck",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Orta Göğüs",
    "name": "Pec Deck Kelebek",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Orta Göğüs",
    "secondarySubMuscles": "Ön Omuz",
    "biomechanicalProof": "Makinede oturarak kolları önde birleştirmek, kol kaslarını yormadan sadece orta ve iç göğsü izole şekilde çalıştırır.",
    "fitCategory": "flye",
    "fitName": "cable_crossover",
    "fitNote": "Pec Deck",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dirsekleri gövdeye yapıştır, halatı aşağı iterken dip noktada uçlarını yana doğru açarak triceps kaslarını kilitle.",
    "diagram": "assets/diagrams/seq_skull_crusher.svg",
    "equipment": "machine",
    "id": "mach_triceps_pushdown",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Halat Triceps Pushdown",
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
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Arka Kol Uzun Baş",
    "biomechanicalProof": "Dirsekleri bel yanında sabit tutup halatı aşağı itmek ve en altta iki yana açmak, arka kolun dış (at nalı) kısmını ve alt kısmını tam sıkıştırır.",
    "fitCategory": "triceps_extension",
    "fitName": "triceps_pressdown",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Düşük makarada düz barı tut, dirsekleri sabit tutarak kablonun sürekli geriliminde biceps kaslarını sık.",
    "diagram": "assets/diagrams/seq_biceps_curl.svg",
    "equipment": "machine",
    "id": "mach_cable_biceps",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Pazı İç Baş, Pazı Dış Baş",
    "name": "Kablo Biceps Curl",
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
    ],
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Pazı İç Baş, Pazı Dış Baş",
    "secondarySubMuscles": "Ön Kol & Dış Pazı",
    "biomechanicalProof": "Kablo makarası hareketin en altında da en üstünde de yükü hiç boşaltmadığı için bicepsin iç ve dış kısmında kesintisiz yanma ve gerilim sağlar.",
    "fitCategory": "curl",
    "fitName": "cable_biceps_curl",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "BICEPS"
    ],
    "garminSecondaryMuscles": [
      "FOREARM"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Alt makaradan kabloyu gövdenin arkasından veya önünden tut, dirseği hafif bükük omuz hizasına kaldır.",
    "diagram": "assets/diagrams/seq_lateral_raise.svg",
    "equipment": "machine",
    "id": "mach_cable_lateral",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Yan Omuz",
    "name": "Kablo Lateral Raise",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Omuz",
    "secondarySubMuscles": "Üst Sırt & Trapez",
    "biomechanicalProof": "Dambılda kol aşağıdayken yük sıfırlanır ama kablo makarası hareketin en alt noktasından en üst noktasına kadar yan omuza sürekli yük bindirir.",
    "fitCategory": "lateral_raise",
    "fitName": "one_arm_cable_lateral_raise",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Bel boşluğunu arkadaki mindere tamamen yapıştır, dizleri 90° büküp platformu ayak tabanlarıyla güçlüce it (dizleri kilitleme).",
    "diagram": "assets/diagrams/seq_db_squat.svg",
    "equipment": "machine",
    "id": "mach_leg_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak",
    "name": "45° Leg Press",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Orta Ön Bacak, Ana Kalça",
    "biomechanicalProof": "Sırt ve bel koltukta sabitken bacaklarla ağır platformu itmek, beli hiç yormadan tüm yükü ön bacak ve kalça kaslarına verir.",
    "fitCategory": "squat",
    "fitName": "leg_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Diz eklemini makinenin dönme noktasıyla hizala, bacakları yukarı uzatıp tepe noktada kuadrisepsi taş gibi sık.",
    "diagram": "assets/diagrams/seq_leg_extension.svg",
    "equipment": "machine",
    "id": "mach_leg_extension",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Orta Ön Bacak, Dış Ön Bacak, İç Ön Bacak",
    "name": "Leg Extension",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "",
    "primarySubMuscles": "Orta Ön Bacak, Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "",
    "biomechanicalProof": "Oturarak sadece dizleri düzleştirmek, başka hiçbir kası karıştırmadan ön bacağın orta, dış ve diz üstü iç kısmını tek başına izole eder.",
    "fitCategory": "banded_exercises",
    "fitName": "leg_extension",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Pedi aşil tendonunun hemen üzerine ayarla, topukları kalçaya doğru bükerek hamstring kaslarını sık.",
    "diagram": "assets/diagrams/seq_leg_curl.svg",
    "equipment": "machine",
    "id": "mach_leg_curl",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Diz Büken Arka Bacak",
    "name": "Leg Curl",
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
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "calves"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "",
    "primarySubMuscles": "Diz Büken Arka Bacak",
    "secondarySubMuscles": "Arka Bacak, Üst Baldır",
    "biomechanicalProof": "Makinede sadece dizleri bükmek, eğilme hareketlerinde (RDL) tam çalışmayan arka bacağın diz üstü alt kısmını da doğrudan ve izole çalıştırır.",
    "fitCategory": "leg_curl",
    "fitName": "leg_curl",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Makinenin omuz pedleri altına yerleş, ayak parmak kökleriyle platform kenarına bas. Topukları en tepeye kaldırıp baldırı 2 saniye sık, 3 saniyede esneterek indir.",
    "diagram": "assets/diagrams/seq_calf_raise.svg",
    "equipment": "machine",
    "id": "mach_calf_raise",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Üst Baldır, Alt Baldır",
    "name": "Calf Raise",
    "positions": [
      {
        "badge": "setup",
        "desc": "Omuz pedlerinin altına yerleşip gövdeyi dik kilitle. Ayak parmak kökleri makine platformunun kenarında, topuklar boşlukta.",
        "phase": "1. Omuz Pedi & Platform Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Dizleri bükmeden parmak köklerine basarak topukları maksimum yüksekliğe kaldır ve baldırı zirvede 2 sn sıkıştır.",
        "phase": "2. Zirve Sıkıştırma"
      },
      {
        "badge": "lock",
        "desc": "Yaylanmadan 3 saniyede kontrollü inerek topukları platform seviyesinin altına indir ve baldırı derin esnet.",
        "phase": "3. 3 Sn Kontrollü Esneme"
      }
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "calves",
    "primarySubMuscles": "Üst Baldır, Alt Baldır",
    "secondarySubMuscles": "Ön Kaval & Bilek",
    "biomechanicalProof": "Ayakta kalf makinesinde omuz pedleriyle sabit yük altında tam esneme ve zirve sıkıştırma yapmak, üst ve alt baldır kaslarını en güvenli ve yüksek yükle çalıştırır.",
    "fitCategory": "calf_raise",
    "fitName": "standing_calf_raise",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CALVES"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Yüksek makaradan tutacağı çift elle kavra, kolları düz tutarak gövde rotasyonuyla zıt diz yönüne çapraz çek.",
    "diagram": "assets/diagrams/seq_russian_twist.svg",
    "equipment": "machine",
    "id": "mach_cable_woodchopper",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Karın, Derin İç Karın",
    "name": "Kablo Woodchopper",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "glutes"
    ],
    "tags": [
      "core",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Derin İç Karın",
    "secondarySubMuscles": "Ön Karın, Ön Omuz, Yan Kalça",
    "biomechanicalProof": "Kabloyu odun keser gibi çapraz çekip gövdeyi döndürmek, sağ ve sol yan karın kaslarını ile derin iç karın kasını güçlü şekilde çalıştırır.",
    "fitCategory": "chop",
    "fitName": "kneeling_woodchopper",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "OBLIQUES"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Gövde baştan topuğa cetvel gibi düz, dirsekler 45° açıyla geriye insin, göğüs yere 2 cm kalana kadar çök.",
    "diagram": "assets/diagrams/seq_pushup.svg",
    "equipment": "bodyweight",
    "id": "bw_pushup",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Göğüs",
    "name": "Şınav (Push-Up)",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "upper_push"
    ],
    "weightKey": "",
    "primarySubMuscles": "Orta Göğüs",
    "secondarySubMuscles": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın",
    "biomechanicalProof": "Yerde vücudu düz bir tahta gibi tutarak kendini yukarı itmek orta göğsü ve tricepsi çalıştırırken, belin sarkmasını önlemek için karın (core) kaslarını sürekli sıkar.",
    "fitCategory": "push_up",
    "fitName": "push_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Ayakları sehpa veya kutu üzerine koy, vücut eğimini koruyarak üst göğüs odaklı şınav çek.",
    "diagram": "assets/diagrams/seq_pushup.svg",
    "equipment": "bodyweight",
    "id": "bw_decline_pushup",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Üst Göğüs",
    "name": "Decline Şınav",
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
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps",
      "core"
    ],
    "tags": [
      "upper_push"
    ],
    "weightKey": "",
    "primarySubMuscles": "Üst Göğüs",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın",
    "biomechanicalProof": "Ayakları sehpaya koyup eller yerde şınav çekmek, vücut açısını yukarı eğimli (incline) prese çevirir ve yükü üst göğüs ile ön omuza bindirir.",
    "fitCategory": "push_up",
    "fitName": "decline_push_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Başparmak ve işaret parmaklarını göğüs altında elmas şeklinde birleştir, dirsekleri gövdeye yapışık tutarak it.",
    "diagram": "assets/diagrams/seq_diamond_pushup.svg",
    "equipment": "bodyweight",
    "id": "bw_diamond_pushup",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Elmas Şınav",
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
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "shoulders",
      "core"
    ],
    "tags": [
      "upper_push"
    ],
    "weightKey": "",
    "primarySubMuscles": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz, Derin İç Karın",
    "biomechanicalProof": "Eller göğüs altında birbirine yakın (elmas şeklinde) şınav çekildiğinde dirsekler tamamen bükülüp açılır; arka kolu en sert çalıştıran vücut ağırlığı hareketidir.",
    "fitCategory": "push_up",
    "fitName": "diamond_push_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST",
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Paralel barlarda gövdeyi 30° öne eğ, dirsekler 90° olana kadar kontrollü in ve tepeye kilitlen.",
    "diagram": "assets/exercises/bw_dips.gif",
    "equipment": "bodyweight",
    "id": "bw_dips",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Dips",
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
    ],
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz",
    "biomechanicalProof": "Gövdeyi hafif öne eğerek paralel barda kendini yukarı itmek, göğsün alt çizgisini (alt göğüs) ve arka kolun dış/alt kısmını çok yoğun çalıştırır.",
    "fitCategory": "triceps_extension",
    "fitName": "body_weight_dip",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Eller omuz genişliğinde arkadaki sehpada, bacaklar öne uzatılmış. Sırtı sehpaya yakın tutarak dirsekleri 90° bük ve arka kolla it.",
    "diagram": "assets/opengym/stills/1399.webp",
    "equipment": "bodyweight",
    "id": "bw_bench_dips",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Sehpada Dips (Bench Dips)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Avuç içleri öne bakacak şekilde sehpanın kenarını kavra, topuklar yerde bacaklar düz veya hafif bükülü.",
        "phase": "1. Sehpa Duruşu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı sehpanın önüne yakın tutarak dirsekler 90 derece olana dek kontrollü in; omuzları öne düşürme.",
        "phase": "2. Kontrollü 90° İniş"
      },
      {
        "badge": "finish",
        "desc": "Avuç içleriyle sehpayı iterek arka kolları sıkıp başlangıca yüksel.",
        "phase": "3. Arka Kol İtişi"
      }
    ],
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Ön Omuz",
    "biomechanicalProof": "Eller sırt arkasında sehpadayken gövde dik kalır; yük alt göğüs yerine doğrudan arka kol (triceps) ve ön omuz üzerine biner.",
    "fitCategory": "triceps_extension",
    "fitName": "bench_dip",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Barı omuzdan geniş kavra, sallanmadan göğsü bara doğru yükselt, çene barı geçince kanatları sık.",
    "diagram": "assets/diagrams/seq_chinup.svg",
    "equipment": "bodyweight",
    "id": "bw_pullup",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Kanatlar",
    "name": "Barfiks (Pull-Up)",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps",
      "core"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Kanatlar",
    "secondarySubMuscles": "Orta Sırt, Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı, Ön Karın",
    "biomechanicalProof": "Avuç içleri karşıya bakacak şekilde geniş tutuşla barfiks çekmek, bicepsin yardımını azaltıp bütün yükü üst ve dış kanat kaslarına bindirir.",
    "fitCategory": "pull_up",
    "fitName": "pull_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "FOREARM",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Avuç içleri yüzüne baksın (ters tutuş), dirsekleri önden çekerek çeneyi barın üstüne yükselt ve biceps ile sık.",
    "diagram": "assets/diagrams/seq_chinup.svg",
    "equipment": "bodyweight",
    "id": "bw_chinup",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Kanatlar, Pazı İç Baş, Pazı Dış Baş",
    "name": "Chin-Up (Ters Barfiks)",
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
    ],
    "primaryMuscles": [
      "back",
      "biceps"
    ],
    "secondaryMuscles": [
      "shoulders",
      "core"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Kanatlar, Pazı İç Baş, Pazı Dış Baş",
    "secondarySubMuscles": "Orta Sırt, Ön Kol & Dış Pazı, Arka Omuz, Ön Karın",
    "biomechanicalProof": "Avuç içleri sana bakacak şekilde omuz genişliğinde barfiks çekmek, hem kanat kaslarını tam boyda çalıştırır hem de bicepsleri en güçlü açısında kasar.",
    "fitCategory": "pull_up",
    "fitName": "chin_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "BICEPS",
      "LATS"
    ],
    "garminSecondaryMuscles": [
      "TRAPS",
      "FOREARM",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Alçak barın altına gir, topuklar yerde, gövde cetvel gibi düz, göğsü bara değene kadar çek.",
    "diagram": "assets/diagrams/seq_incline_row.svg",
    "equipment": "bodyweight",
    "id": "bw_inverted_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Orta Sırt, Kanatlar",
    "name": "Yatay Barfiks",
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
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps",
      "core"
    ],
    "tags": [
      "upper_pull",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Orta Sırt, Kanatlar",
    "secondarySubMuscles": "Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı, Derin İç Karın",
    "biomechanicalProof": "Alçak barın altına girip göğsü bara çekmek, bele hiç yük bindirmeden kürek kemiklerini birbirine kenetler ve orta sırt ile arka omzu çalıştırır.",
    "fitCategory": "row",
    "fitName": "inverted_row",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRAPS",
      "LATS"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "CHEST"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Kolları önde dengede tut, topuklar yerden ayrılmadan kalçayı diz seviyesinin altına kadar derin indir.",
    "diagram": "assets/diagrams/seq_db_squat.svg",
    "equipment": "bodyweight",
    "id": "bw_air_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak",
    "name": "Air Squat",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Ana Kalça, Derin İç Karın",
    "biomechanicalProof": "Kendi vücut ağırlığınla tam çömelip kalkmak, ön bacak ve kalça kaslarını doğal hareket açıklığında çalıştırır.",
    "fitCategory": "squat",
    "fitName": "air_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Derin squat derinliğine in, tavana doğru patlayıcı sıçra ve parmak ucundan topuğa yumuşakça iniş yap.",
    "diagram": "assets/diagrams/seq_db_squat.svg",
    "equipment": "bodyweight",
    "id": "bw_jump_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, Orta Ön Bacak, Ana Kalça",
    "name": "Jump Squat",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "calves",
      "core"
    ],
    "tags": [
      "legs",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Dış Ön Bacak, Orta Ön Bacak, Ana Kalça, Üst Baldır",
    "secondarySubMuscles": "İç Ön Bacak, Alt Baldır, Derin İç Karın",
    "biomechanicalProof": "Çömelip yukarı doğru patlayıcı sıçramak; ön bacak, ana kalça ve parmak ucundan itiş yapan kalf (baldır) kaslarının patlayıcı liflerini ateşler.",
    "fitCategory": "plyo",
    "fitName": "body_weight_jump_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "CALVES",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Yerde sırtüstü yat, dizler 90° bükülü, topuklardan yeri iterek kalçayı omuz-diz hattında düz olana kadar kaldır.",
    "diagram": "assets/diagrams/seq_db_rdl.svg",
    "equipment": "bodyweight",
    "id": "bw_glute_bridge",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ana Kalça",
    "name": "Glute Bridge",
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
    ],
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "tags": [
      "legs",
      "lower"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ana Kalça",
    "secondarySubMuscles": "Yan Kalça, Arka Bacak & Kalça Bağı",
    "biomechanicalProof": "Sırtüstü yatarken dizler bükülü şekilde kalçayı yukarı kaldırıp sıkmak, bele yük bindirmeden doğrudan ana kalça kasını çalıştırır.",
    "fitCategory": "hip_raise",
    "fitName": "hip_raise",
    "fitNote": "Glute Bridge",
    "garminPrimaryMuscles": [
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Barfiks barında asılıyken gövdeyi sallamadan dizleri göğse doğru çek, pelvisi yukarı yuvarlayarak alt karını sık.",
    "diagram": "assets/diagrams/seq_leg_raise.svg",
    "equipment": "bodyweight",
    "id": "bw_hanging_knee_raise",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın",
    "name": "Barda Dize Çekme",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads",
      "biceps",
      "back"
    ],
    "tags": [
      "core"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın",
    "secondarySubMuscles": "Derin İç Karın, Orta Ön Bacak, Ön Kol & Dış Pazı, Kanatlar",
    "biomechanicalProof": "Barda asılıyken dizleri göğse doğru çekip kalçayı yukarı kıvırmak, özellikle göbek deliğinin altındaki alt karın kaslarını doğrudan çalıştırır.",
    "fitCategory": "leg_raise",
    "fitName": "hanging_knee_raise",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "HIPS",
      "FOREARM",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Sırtüstü yat, bel boşluğunu zemine sıfır boşlukla yapıştır, kolları ve bacakları hafif kaldırarak muz şeklinde kilitlen.",
    "diagram": "assets/diagrams/seq_plank_pull_through.svg",
    "equipment": "bodyweight",
    "id": "bw_hollow_body",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "Hollow Body",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Karın, Orta Ön Bacak",
    "biomechanicalProof": "Sırtüstü yatarken beli yere tam yapıştırıp kol ve bacakları yerden kesmek, ön karın (üst ve alt) ile derin iç karın kaslarını en zorlu açıda çalıştırır.",
    "fitCategory": "crunch",
    "fitName": "hollow_rock",
    "fitNote": "Hollow Hold",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "LOWER_BACK"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Dirsekler ve ayak parmak uçlarında vücudu cetvel gibi düz tut, karnı ve kalçayı taş gibi sıkarak beli koru.",
    "diagram": "assets/diagrams/seq_plank_pull_through.svg",
    "equipment": "bodyweight",
    "id": "bw_plank",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Derin İç Karın, Ön Karın",
    "name": "Plank",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Ön Karın",
    "secondarySubMuscles": "Yan Karın, Ön Omuz",
    "biomechanicalProof": "Dirsekler üzerinde vücudu düz tutarken belin çukurlaşmasına direnmek, karnı içe çeken derin korse kasını ve ön karın kaslarını baştan sona kilitler.",
    "fitCategory": "plank",
    "fitName": "plank",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Hızla çömel, ayakları geriye atıp göğsü yere dokundur, ayakları geri çekip tavana doğru alkışla sıçra.",
    "diagram": "assets/diagrams/seq_escalera.svg",
    "equipment": "bodyweight",
    "id": "bw_burpee",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, Ana Kalça, Orta Göğüs",
    "name": "Burpee",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps",
      "core",
      "calves"
    ],
    "tags": [
      "full_body",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Dış Ön Bacak, Ana Kalça, Orta Göğüs",
    "secondarySubMuscles": "Ön Omuz, Arka Kol Alt Baş, Ön Karın, Üst Baldır",
    "biomechanicalProof": "Yere inip şınav çekmek göğüs, omuz ve tricepsi; ayakları karna çekip yukarı sıçramak ise karın, ön bacak, kalça ve kalfları çalıştırır.",
    "fitCategory": "total_body",
    "fitName": "burpee",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "CHEST",
      "CALVES",
      "GLUTES",
      "HIPS",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Yüksek şınav pozisyonunda kalçayı kaldırmadan dizleri sırayla koşar adım göğse çek.",
    "diagram": "assets/diagrams/seq_plank_pull_through.svg",
    "equipment": "bodyweight",
    "id": "bw_mountain_climber",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "Mountain Climber",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads",
      "shoulders"
    ],
    "tags": [
      "core",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Orta Ön Bacak, Ön Omuz, Yan Karın",
    "biomechanicalProof": "Şınav duruşunda gövdeyi bozmadan dizleri hızla karna çekmek, ön/alt karın ve ön kalça kaslarını çalıştırırken nabzı hızla yükseltir.",
    "fitCategory": "plank",
    "fitName": "mountain_climber",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS",
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dizler üzerinde dik dur, ağırlık plakasını iki elle kollarını bükmeden tut. Bacaklardan hiç savurmadan sadece omuz gücüyle omuz hizasına (paralel) kadar kaldır ve kontrollü indir.",
    "diagram": "assets/diagrams/seq_kneeling_plate_front_raise.svg",
    "equipment": "barbell",
    "id": "kneeling_plate_front_raise",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Omuz",
    "name": "Diz Üstü Plaka Ön Omuz Kaldırış",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "chest",
      "core"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz",
    "secondarySubMuscles": "Üst Göğüs, Derin İç Karın",
    "biomechanicalProof": "İki diz üstünde durmak belden hız almayı keser; plakayı önden yüz hizasına kaldırmak doğrudan ön omuz ve üst göğsü çalıştırır.",
    "fitCategory": "shoulder_press",
    "fitName": "weight_plate_front_raise",
    "fitNote": "Diz Üstü",
    "garminPrimaryMuscles": [
      "SHOULDERS",
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Yarım diz üstü duruş al (bir diz yerde, diğer bacak 90° önde). Plakayı yerde olan dizinin kalça yanından başlatıp iki elle çapraz şekilde zıt omzun üstüne doğru fırlatır gibi savur, gövdeyi ve yan karnı sıkarak kilitle.",
    "diagram": "assets/diagrams/seq_half_kneeling_plate_chop.svg",
    "equipment": "barbell",
    "id": "half_kneeling_plate_chop",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Yan Karın, Derin İç Karın",
    "name": "Yarım Diz Üstü Plaka Oduncu (Woodchopper)",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "glutes"
    ],
    "tags": [
      "core",
      "upper_push",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Derin İç Karın",
    "secondarySubMuscles": "Ön Karın, Ön Omuz, Yan Kalça",
    "biomechanicalProof": "Tek diz yerde durmak bacaklardan hız almayı engeller; plakayı çapraz savurup durdurmak sadece yan karın ve derin kor kaslarının gücüyle yapılır.",
    "fitCategory": "chop",
    "fitName": "half_kneeling_rotational_chop",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "OBLIQUES"
    ],
    "garminSecondaryMuscles": [
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dambılları omuzda tutarak derin squat yap, kalkarken bacakların patlayıcı gücünü hiç kesmeden ağırlığı baş üstüne kilitle.",
    "diagram": "assets/diagrams/seq_thruster.svg",
    "equipment": "dumbbell",
    "id": "db_thruster",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "name": "Dambıl Thruster",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın, Üst Sırt & Trapez",
    "biomechanicalProof": "Dambıllarla tam çömelip kalkarken kazandığın hızla ağırlığı kesintisiz baş üstüne itmek; ön bacak, kalça, ön/yan omuz ve tricepsi aynı anda çalıştırır.",
    "fitCategory": "squat",
    "fitName": "dumbbell_thrusters",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "CALVES",
      "CHEST",
      "HAMSTRINGS",
      "HIPS",
      "LOWER_BACK",
      "TRAPS",
      "TRICEPS",
      "FOREARM"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dambıllar omuzdayken dizleri 20° hafifçe büküp yaylan, bacaklardan aldığın yaylanma gücüyle dambılları baş üstüne fırlat.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "dumbbell",
    "id": "db_push_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Omuz",
    "name": "Dambıl Push Press",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "quads",
      "core"
    ],
    "tags": [
      "upper_push",
      "upper",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Dış Ön Bacak, Derin İç Karın",
    "biomechanicalProof": "Bacak itişiyle hız kazandırıp dambılları baş üstüne kilitlemek; ön/yan omuz, triceps ve bacak itiş gücünü aynı anda çalıştırır.",
    "fitCategory": "shoulder_press",
    "fitName": "dumbbell_push_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "HIPS",
      "CHEST",
      "TRICEPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dambıllar üzerinde tam şınav yapıp doğrul, kalçayı hiç sallamadan tek kolla dambılı kaburgana çek, ardından diğer kola geç.",
    "diagram": "assets/diagrams/seq_renegade_row.svg",
    "equipment": "dumbbell",
    "id": "db_renegade_pushup",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Orta Göğüs, Kanatlar, Orta Sırt",
    "name": "Renegade Row + Şınav",
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
    ],
    "primaryMuscles": [
      "back",
      "chest",
      "core"
    ],
    "secondaryMuscles": [
      "triceps",
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_push",
      "upper_pull",
      "core",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Orta Göğüs, Kanatlar, Orta Sırt, Yan Karın",
    "secondarySubMuscles": "Arka Kol Dış Baş, Arka Kol Alt Baş, Ön Omuz, Pazı Dış Baş, Derin İç Karın",
    "biomechanicalProof": "Şınav kısmında orta göğüs ve triceps iterken, tek kolla dambılı çektiğin kısımda kanat ve orta sırt çalışır; tek el üstünde dengede kalmak yan karın kaslarını ateşler.",
    "fitCategory": "push_up",
    "fitName": "push_up_and_row",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CHEST",
      "LATS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Dizler 90° bükük fakat yerden 5 cm havada (ayı duruşu) kal. Plakayı gövdenin altından zıt elle çapraz yana çekip bırak.",
    "diagram": "assets/diagrams/seq_plank_pull_through.svg",
    "equipment": "barbell",
    "id": "bear_crawl_pull_through",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Derin İç Karın, Yan Karın",
    "name": "Ayı Emeklemesi Plaka Çekişi",
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
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "back",
      "quads"
    ],
    "tags": [
      "core",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Yan Karın",
    "secondarySubMuscles": "Ön Karın, Ön Omuz, Kanatlar, Orta Ön Bacak",
    "biomechanicalProof": "Dizler yerden 2-3 parmak havadayken tek elle ağırlığı alttan çekmek, gövdenin sağa sola devrilmesini önleyen derin iç karın ve yan karın kaslarını yoğun çalıştırır.",
    "fitCategory": "sandbag",
    "fitName": "bear_crawl_pull_through",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "HIPS",
      "LOWER_BACK",
      "LATS",
      "OBLIQUES"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Dambılları kalça menteşesiyle bacak arasından patlayıcı çekerek omuza al (clean), ardından doğrudan baş üstüne presle.",
    "diagram": "assets/diagrams/seq_db_snatch.svg",
    "equipment": "dumbbell",
    "id": "db_clean_and_press",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak, Ön Omuz",
    "name": "Dambıl Clean & Press",
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
    ],
    "primaryMuscles": [
      "shoulders",
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "power",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ana Kalça, Arka Bacak, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Üst Sırt & Trapez, Orta Sırt, Arka Kol Dış Baş, Arka Kol Alt Baş, Ön Kol & Dış Pazı, Derin İç Karın",
    "biomechanicalProof": "İlk kısımda kalça ve sırt gücüyle omuza alınan dambıllar, ikinci kısımda omuz ve triceps gücüyle baş üstüne itilir.",
    "fitCategory": "olympic_lift",
    "fitName": "clean_and_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "HAMSTRINGS",
      "GLUTES",
      "TRAPS",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "CALVES",
      "SHOULDERS",
      "TRAPS",
      "BICEPS",
      "FOREARM",
      "LOWER_BACK",
      "ADDUCTORS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "1. Şınav ➔ 2. Sağ Row ➔ 3. Sol Row ➔ 4. Squat Clean ➔ 5. Baş Üstü Thruster zincirini omurga dikliğini bozmadan kesintisiz uygula.",
    "diagram": "assets/diagrams/seq_manmaker.svg",
    "equipment": "dumbbell",
    "id": "db_manmaker",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Orta Göğüs, Kanatlar, Dış Ön Bacak",
    "name": "Dambıl Manmaker",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıllar yerde omuz genişliğinde şınav pozisyonu al. Dirsekleri 45° açıyla bükerek göğsü dambılların arasına indir ve patlayıcı güçle yeri it.",
        "phase": "1. Tam Şınav (Push-Up)"
      },
      {
        "badge": "action",
        "desc": "Sol kolla zemini güçlüce iterken ve kalçayı hiç oynatmadan sağ dambılı kaburga hizasına çek. Kanat kasını 1 sn sık.",
        "phase": "2. Sağ Kol Renegade Row"
      },
      {
        "badge": "action",
        "desc": "Sağ dambılı sessizce yere koy. Anti-rotasyonel dengeyi koruyarak sol dambılı aynı kontrolle sol kalça cebine doğru çek.",
        "phase": "3. Sol Kol Renegade Row"
      },
      {
        "badge": "action",
        "desc": "Ayakları dambılların dışına çekip yere sağlam bas. Dambılları omuzlara alırken derin ön squat pozisyonuna çök.",
        "phase": "4. Squat Clean (Ön Rack)"
      },
      {
        "badge": "finish",
        "desc": "Squat tabanından bacakların kinetik gücüyle yukarı fırla, momentumu baş üstü dikey presle birleştirerek kollar, kalça ve dizleri tam kilitle.",
        "phase": "5. Patlayıcı Thruster & Kilit"
      }
    ],
    "primaryMuscles": [
      "quads",
      "chest",
      "back",
      "glutes",
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "conditioning",
      "power",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Orta Göğüs, Kanatlar, Dış Ön Bacak, Ana Kalça, Ön Omuz",
    "secondarySubMuscles": "Orta Sırt, Yan Omuz, Arka Kol Alt Baş, Yan Karın, Derin İç Karın",
    "biomechanicalProof": "Şınav + sağ/sol sırt çekişi + çömelerek omuza alma + baş üstü pres birleşimi; göğüs, sırt, bacak, kalça, omuz ve karın kaslarının tamamını çalıştırır.",
    "fitCategory": "total_body",
    "fitName": "man_makers",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "CHEST",
      "CALVES",
      "GLUTES",
      "HIPS",
      "QUADS",
      "TRAPS",
      "LATS",
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Tek elindeki dambılı baş üstünde kilitli tut, dirseği bükmeden dik ve küçük adımlarla yürü.",
    "diagram": "assets/diagrams/seq_overhead_carry.svg",
    "equipment": "dumbbell",
    "id": "waiters_carry",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Karın, Derin İç Karın, Ön Omuz",
    "name": "Garson Taşıması (Waiter Carry)",
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
    ],
    "primaryMuscles": [
      "core",
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "tags": [
      "core",
      "upper_push",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Derin İç Karın, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Üst Sırt & Trapez, Arka Kol Alt Baş",
    "biomechanicalProof": "Ağırlığı tek elle garson tepsisi gibi baş üstünde tutarak yürümek, omuz iç denge kaslarını ve gövdenin yana yatmasını önleyen yan karın kaslarını aralıksız çalıştırır.",
    "fitCategory": "carry",
    "fitName": "dumbbell_waiter_carry",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Bir elinde baş üstünde dambıl, diğer elinde bacak yanında ağır dambıl tut. Asimetrik yüke direnerek dimdik yürü.",
    "diagram": "assets/diagrams/seq_farmers_walk.svg",
    "equipment": "dumbbell",
    "id": "cross_body_carry",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Karın, Derin İç Karın, Ön Omuz",
    "name": "Çapraz Taşıma (Cross-Body Carry)",
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
    ],
    "primaryMuscles": [
      "core",
      "shoulders"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "core",
      "full_body",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Derin İç Karın, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Üst Sırt & Trapez, Ön Kol & Dış Pazı, Yan Kalça",
    "biomechanicalProof": "Bir dambılı baş üstünde, diğerini yanda tutarak yürümek; hem üstteki omuz denge kaslarını hem de çapraz yan karın ve bel kaslarını çalıştırır.",
    "fitCategory": "carry",
    "fitName": "farmers_walk",
    "fitNote": "Çapraz Carry",
    "garminPrimaryMuscles": [
      "FOREARM"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "QUADS",
      "LOWER_BACK",
      "TRAPS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Öne derin lunge adımı at. İnişte elindeki plakayı öndeki bacağının yönüne doğru gövdeden çevir, toparlanırken merkeze dön.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "barbell",
    "id": "lunge_with_twist",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Lunge + Gövde Rotasyonu",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "legs",
      "core",
      "lower",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Karın",
    "secondarySubMuscles": "Yan Kalça, Orta Ön Bacak, Derin İç Karın",
    "biomechanicalProof": "Öne adım atıp çömelirken gövdeyi öndeki bacak yönüne çevirmek; alt vücutta ön bacak ve kalçayı, üst vücutta ise yan karın kaslarını çalıştırır.",
    "fitCategory": "lunge",
    "fitName": "reverse_lunge_with_twist_and_overhead_reach",
    "fitNote": "Lunge+Twist",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "SHOULDERS",
      "OBLIQUES"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Kutuya tek ayakla çıkarken ön topuktan güç al, tepe noktada doğrulurken zıt elindeki dambılı baş üstüne presle.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "step_up_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Step-Up + Omuz Presi",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "legs",
      "upper_push",
      "lower",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Ön Omuz",
    "secondarySubMuscles": "Yan Kalça, Yan Omuz, Arka Kol Alt Baş, Yan Karın",
    "biomechanicalProof": "Yüksek kutuya tek ayakla çıkarken ön bacak ve ana/yan kalça tüm vücudu yukarı kaldırır; tepede ağırlığı baş üstüne itmek ön ve yan omzu çalıştırır.",
    "fitCategory": "shoulder_press",
    "fitName": "single_arm_step_up_and_press",
    "fitNote": "Kombine",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "CHEST",
      "TRICEPS",
      "TRAPS",
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Barı köprücük kemiğinde (front rack) tutarak tam squat yap, kalkış momentumunu hiç kesmeden barı baş üstüne güçlüce presle.",
    "diagram": "assets/diagrams/seq_thruster.svg",
    "equipment": "barbell",
    "id": "bb_thruster",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "name": "Barbell Thruster",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "conditioning",
      "power",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın, Üst Sırt & Trapez",
    "biomechanicalProof": "Omuzda barla tam çömelme (Front Squat) ve kalkarken baş üstü itiş; ön bacak, kalça, omuz ve tricepsi ağır yük altında birleştirir.",
    "fitCategory": "squat",
    "fitName": "thrusters",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "CALVES",
      "CHEST",
      "HAMSTRINGS",
      "HIPS",
      "LOWER_BACK",
      "TRAPS",
      "TRICEPS",
      "FOREARM"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Barı diz kapağı hizasından başlat, kalçayı kırbaç gibi öne patlat (triple extension) ve barı omuzlarda dirsekleri öne fırlatarak yakala.",
    "diagram": "assets/diagrams/seq_db_snatch.svg",
    "equipment": "barbell",
    "id": "bb_hang_power_clean",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak, Üst Sırt & Trapez",
    "name": "Barbell Hang Power Clean",
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
    ],
    "primaryMuscles": [
      "glutes",
      "hamstrings",
      "back"
    ],
    "secondaryMuscles": [
      "quads",
      "calves",
      "biceps",
      "core"
    ],
    "tags": [
      "full_body",
      "upper_pull",
      "power",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Ana Kalça, Arka Bacak, Üst Sırt & Trapez, Orta Sırt",
    "secondarySubMuscles": "Dış Ön Bacak, Alt Sırt & Bel, Üst Baldır, Ön Kol & Dış Pazı, Derin İç Karın",
    "biomechanicalProof": "Diz üstünden barı kalça patlaması ve omuz çekişiyle bir anda ön omuzlara almak; kalça, arka bacak ve üst sırt (trapez) kaslarında patlayıcı güç üretir.",
    "fitCategory": "olympic_lift",
    "fitName": "barbell_hang_power_clean",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "HAMSTRINGS",
      "GLUTES",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "CALVES",
      "SHOULDERS",
      "FOREARM",
      "BICEPS",
      "LOWER_BACK",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Bar köprücük kemiğinde dinlenirken dizleri 10-15 cm bükerek yaylan (dip), bacaklardan gelen yay kuvvetiyle barı baş üstüne patlat.",
    "diagram": "assets/diagrams/seq_db_press.svg",
    "equipment": "barbell",
    "id": "bb_push_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Omuz",
    "name": "Barbell Push Press",
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
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "quads",
      "core"
    ],
    "tags": [
      "upper_push",
      "upper",
      "power",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Dış Ön Bacak, Derin İç Karın",
    "biomechanicalProof": "Dizleri hafif büküp bacaklardan patlayıcı güç alarak barı baş üstüne fırlatmak, normalden daha ağır kilolarla ön/yan omuz ve tricepsi çalıştırmanı sağlar.",
    "fitCategory": "shoulder_press",
    "fitName": "barbell_push_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "HIPS",
      "CHEST",
      "TRICEPS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Barı dirsek içlerinde kucakla, ellerini kenetle. Dirseklerin bacak arasına inmesine izin vererek derin çömel, gövdenin öne devrilmesine diren.",
    "diagram": "assets/diagrams/seq_db_squat.svg",
    "equipment": "barbell",
    "id": "bb_zercher_squat",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "name": "Barbell Zercher Squat",
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
    ],
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "glutes",
      "core"
    ],
    "tags": [
      "legs",
      "lower",
      "core",
      "power",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "secondarySubMuscles": "Orta Sırt, Üst Sırt & Trapez, Derin İç Karın, Pazı İç Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Barı dirseklerin iç kısmında kucaklayarak çömelmek; ön bacak ve kalçanın yanı sıra gövdeyi öne yıkılmaktan koruyan üst sırt, karın (core) ve bicepsleri çok sert çalıştırır.",
    "fitCategory": "squat",
    "fitName": "zercher_squat",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "GLUTES",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "CHEST",
      "FOREARM",
      "HAMSTRINGS",
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Barın ucunu göğüs hizasında iki elle tut. Derin squat yap, kalkış momentumuyla barı 45 derecelik açıyla ileri ve yukarı presle.",
    "diagram": "assets/diagrams/seq_thruster.svg",
    "equipment": "barbell",
    "id": "bb_landmine_squat_press",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ön Omuz",
    "name": "Landmine Squat to Press",
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
    ],
    "primaryMuscles": [
      "quads",
      "shoulders",
      "chest"
    ],
    "secondaryMuscles": [
      "glutes",
      "triceps",
      "core"
    ],
    "tags": [
      "full_body",
      "legs",
      "upper_push",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ön Omuz, Üst Göğüs",
    "secondarySubMuscles": "Ana Kalça, Arka Kol Dış Baş, Arka Kol Alt Baş, Derin İç Karın",
    "biomechanicalProof": "Barın ucunu göğüste tutup çömelmek ön bacak ve kalçayı, kalkarken ileri-yukarı doğru itmek ise ön omuz ve üst göğsü omuzları zorlamadan çalıştırır.",
    "fitCategory": "shoulder_press",
    "fitName": "barbell_front_squat_to_push_press",
    "fitNote": "Landmine",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "CALVES",
      "CHEST",
      "HAMSTRINGS",
      "HIPS",
      "LOWER_BACK",
      "TRAPS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Topukları yerden maksimum yüksekliğe kaldırarak TAMAMEN AYAK PARMAK UÇLARINDA YÜKSEL. Tepe noktada baldır kaslarını (kalf) 2 saniye kilitli tut, topukları yere çarpmadan 3 saniyede kontrollü indir.",
    "diagram": "assets/diagrams/seq_calf_raise.svg",
    "equipment": "dumbbell",
    "id": "db_standing_calf_raise",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Üst Baldır, Alt Baldır",
    "name": "Dambıl Ayakta Kalf Yükseltme",
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
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "tags": [
      "legs",
      "calves",
      "isolation",
      "hypertrophy"
    ],
    "weightKey": "calves",
    "primarySubMuscles": "Üst Baldır, Alt Baldır",
    "secondarySubMuscles": "Ön Kaval & Bilek",
    "biomechanicalProof": "Elde dambılla ayakta parmak ucuna yükselip tepe noktada sıkıştırmak, üst ve alt kalf kaslarını doğrudan çalıştırır.",
    "fitCategory": "calf_raise",
    "fitName": "standing_dumbbell_calf_raise",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CALVES"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Düz sehpaya yüzüstü uzan, dambılı iki ayak tabanı arasına sıkıştır. Kalçayı mindere yapışık tutarak topukları kalçaya doğru bük, zirvede hamstringi 1.5 sn sık.",
    "diagram": "assets/diagrams/seq_leg_curl.svg",
    "equipment": "dumbbell",
    "id": "db_lying_leg_curl",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Diz Büken Arka Bacak",
    "name": "Dambıl Yatarak Leg Curl",
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
    ],
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "calves"
    ],
    "tags": [
      "legs",
      "hamstrings",
      "isolation",
      "hypertrophy"
    ],
    "weightKey": "hamstrings",
    "primarySubMuscles": "Diz Büken Arka Bacak",
    "secondarySubMuscles": "Arka Bacak, Üst Baldır",
    "biomechanicalProof": "Yüzüstü yatarken iki ayak arasındaki dambılı kalçaya doğru bükmek, arka bacağın diz büken alt/dış kısmını ve iç kısmını doğrudan çalıştırır.",
    "fitCategory": "leg_curl",
    "fitName": "leg_curl",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Parmak ucuna kalkıp dizleri öne iterken gövdeyi arkaya yatır. Düz bir çizgi halinde uylukları ger ve sadece quad gücüyle kendini doğrult.",
    "diagram": "assets/diagrams/seq_leg_extension.svg",
    "equipment": "bodyweight",
    "id": "bw_sissy_squat",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Orta Ön Bacak, İç Ön Bacak",
    "name": "Sissy Squat (Quad İzolasyonu)",
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
    ],
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "core",
      "calves"
    ],
    "tags": [
      "legs",
      "quads",
      "bodyweight",
      "isolation"
    ],
    "weightKey": "quads",
    "primarySubMuscles": "Orta Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Dış Ön Bacak, Ön Karın, Üst Baldır",
    "biomechanicalProof": "Kalçayı hiç kırmadan dizleri öne verip gövdeyi geriye yatırmak, ön bacağın kalçaya kadar uzanan tam orta kasını maksimum gererek çalıştırır.",
    "fitCategory": "squat",
    "fitName": "balancing_squat",
    "fitNote": "Sissy Squat",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "ADDUCTORS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Mindere sırtüstü uzanıp pullover esnemesini yapın; dambılı göğse çekerken karından oturur konuma doğrulup baş çevresinde akıcı 360° halo ile çevirin.",
    "diagram": "assets/diagrams/seq_pullover.svg",
    "equipment": "dumbbell",
    "id": "db_pullover_to_halo",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Kanatlar, Arka Omuz, Yan Omuz",
    "name": "Dambıl Pullover to Halo (Torasik & Omuz Akışı)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Mindere sırtüstü uzan, dizler bükülü, ayak tabanları yerde. Dambılı iki elle tutarak baş arkasına uzatıp kanatları derin esnet.",
        "phase": "1. Sırtüstü Pullover Esnemesi"
      },
      {
        "badge": "action",
        "desc": "Dambılı göğse doğru çekerken karın kaslarını sıkarak ayak tabanlarını yerden kaldırmadan oturur konuma doğrul.",
        "phase": "2. Sit-Up ile Doğrulma"
      },
      {
        "badge": "finish",
        "desc": "Dik oturuşta dambılı başın etrafında yatay 360° dairesel yörüngede (halo) çevirip göğse getir ve kontrollüce geriye yat.",
        "phase": "3. 360° Halo & Geri Yatış"
      }
    ],
    "primaryMuscles": [
      "back",
      "shoulders",
      "core"
    ],
    "secondaryMuscles": [
      "chest",
      "triceps"
    ],
    "tags": [
      "complex",
      "flow",
      "upper_pull",
      "mobility",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Kanatlar, Arka Omuz, Yan Omuz, Ön Karın",
    "secondarySubMuscles": "Orta Göğüs, Arka Kol Uzun Baş, Üst Sırt & Trapez, Derin İç Karın",
    "biomechanicalProof": "Yatarken ağırlığı baş gerisinden çekmek kanat ve göğüs kafesini çalıştırır; ardından baş etrafında döndürmek (Halo) arka/yan omuz ve omuz iç kaslarını açar.",
    "fitCategory": "pull_up",
    "fitName": "ez_bar_pullover",
    "fitNote": "Pullover+Halo",
    "garminPrimaryMuscles": [
      "LATS",
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "CHEST",
      "ABS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Öne lunge ile 90° çöküşten dönerken ayağı orta hatta yere basmadan sarkaç gibi kesintisiz geriye lunge fazına aktarın.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "db_seesaw_lunge",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Dambıl Seesaw Lunge (Dinamik İleri-Geri Lunge)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıllar iki yanda dik duruş. Tek bacakla öne kontrollü ve geniş bir adım at.",
        "phase": "1. İleri Lunge Fazı"
      },
      {
        "badge": "action",
        "desc": "Ön topuktan patlayarak geri it, ancak orta çizgide ayağı yere basmadan doğrudan geriye lungea uzat.",
        "phase": "2. Sarkaç (Seesaw) Geçişi"
      },
      {
        "badge": "finish",
        "desc": "Geriye lungeda arka diz yere 2 cm kala dengelen ve ön topuktan patlayıcı şekilde başlangıca dön.",
        "phase": "3. Geri Lunge & Kilit"
      }
    ],
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "complex",
      "flow",
      "legs",
      "lower",
      "unilateral",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Kalça",
    "secondarySubMuscles": "Orta Ön Bacak, Derin İç Karın",
    "biomechanicalProof": "Bir ayak yerde sabitken diğer ayakla hiç durmadan bir ileri bir geri lunge yapmak, sabit kalan bacağın ön kısmını ve kalçasını aralıksız çalıştırır.",
    "fitCategory": "lunge",
    "fitName": "walking_dumbbell_lunge",
    "fitNote": "Seesaw Lunge",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Dambılları kalça menteşesiyle omuzlara al, derin ön squata in ve kalkışın kinetik momentumunu dikey baş üstü prese aktar.",
    "diagram": "assets/diagrams/seq_db_clean_squat.svg",
    "equipment": "dumbbell",
    "id": "db_clean_squat_press",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça",
    "name": "Dambıl Clean to Front Squat to Push Press",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıllar diz hizasında, kalça menteşelenmiş. Patlayıcı kalça itişiyle dambılları omuz başlarına (front rack) çek.",
        "phase": "1. Hang Clean Fazı"
      },
      {
        "badge": "action",
        "desc": "Dambıllar omuzdayken omurgayı dik tutarak kalçayı topukların arasına derin front squata indir.",
        "phase": "2. Derin Front Squat"
      },
      {
        "badge": "finish",
        "desc": "Squat kalkış hızını hiç kesmeden bacak gücünü kollarla birleştir ve dambılları baş üstüne kilitle.",
        "phase": "3. Patlayıcı Push Press Kilit"
      }
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "shoulders"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "triceps",
      "core"
    ],
    "tags": [
      "complex",
      "flow",
      "full_body",
      "power",
      "conditioning",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Dış Ön Bacak, İç Ön Bacak, Ana Kalça, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Arka Bacak, Üst Sırt & Trapez, Arka Kol Alt Baş, Derin İç Karın",
    "biomechanicalProof": "Clean aşamasında arka bacak ve kalça patlayıcı gücü üretir; Front Squat aşamasında ön bacak ve kalça çömelmeyi yönetir; Push Press aşamasında ise omuzlar ana itişi yaparken karın/bel, trapez, triceps, ön kol ve kalflar hareketi destekler.",
    "fitCategory": "olympic_lift",
    "fitName": "dumbbell_power_clean_and_push_press",
    "fitNote": "Clean+Sq+Prs",
    "garminPrimaryMuscles": [
      "GLUTES",
      "SHOULDERS",
      "QUADS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "BICEPS",
      "HAMSTRINGS",
      "LOWER_BACK",
      "TRICEPS",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "RDL ile gerilen arka bacakları patlayıcı kalça sürüşüyle fırlatırken dambılları göğüs hizasına dirsekler yüksekte çekin.",
    "diagram": "assets/diagrams/seq_db_rdl.svg",
    "equipment": "dumbbell",
    "id": "db_rdl_to_high_pull",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Arka Bacak, Ana Kalça, Üst Sırt & Trapez",
    "name": "Dambıl RDL to High Pull (Arka Zincir & Üst Çekiş)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde. Kalçayı arkaya menteşele, dambıllar bacaklara yapışık kaval kemiğine insin.",
        "phase": "1. RDL Menteşesi"
      },
      {
        "badge": "action",
        "desc": "Arka bacaklardaki gerilimle kalçayı patlayıcı öne sür ve ayak bileklerinden yükselerek momentum üret.",
        "phase": "2. Patlayıcı Kalça Sürüşü"
      },
      {
        "badge": "finish",
        "desc": "Momentumu kullanarak dirsekleri kulak yönünde dışa ve yukarı çek, dambılları göğüs hizasında kilitle.",
        "phase": "3. Dirsek Yüksek High Pull"
      }
    ],
    "primaryMuscles": [
      "hamstrings",
      "glutes",
      "back",
      "shoulders"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "tags": [
      "complex",
      "flow",
      "upper_pull",
      "lower",
      "posterior_chain",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "hinge",
    "primarySubMuscles": "Arka Bacak, Ana Kalça, Üst Sırt & Trapez, Yan Omuz",
    "secondarySubMuscles": "Arka Bacak & Kalça Bağı, Orta Sırt, Arka Omuz, Alt Sırt & Bel, Ön Kol & Dış Pazı",
    "biomechanicalProof": "RDL (öne eğilme) fazında arka bacak ve ana kalça kası yükü çekerken; High Pull (yukarı çekiş) fazında omuz silkme ile trapezler ve yan/ön omuzlar ağırlığı göğüs/çene hizasına ivmelendirir.",
    "fitCategory": "deadlift",
    "fitName": "sumo_deadlift_high_pull",
    "fitNote": "RDL+HighPull",
    "garminPrimaryMuscles": [
      "HAMSTRINGS",
      "ADDUCTORS",
      "LOWER_BACK",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "FOREARM",
      "QUADS",
      "GLUTES"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Kalça itişiyle yükselen dambılı göğüste dikey yakalayıp momentumunu hiç kesmeden derin çömelmeye aktarın.",
    "diagram": "assets/diagrams/seq_db_swing.svg",
    "equipment": "dumbbell",
    "id": "db_swing_to_goblet_squat",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Ana Kalça, Arka Bacak & Kalça Bağı, Dış Ön Bacak",
    "name": "Dambıl Swing to Goblet Squat (Hinge-Squat Akışı)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambılı iki elle tabanından tut. Kalçayı geriye menteşele ve patlayıcı kalça vuruşuyla dambılı göğüs hizasına fırlat.",
        "phase": "1. Patlayıcı Hinge Swing"
      },
      {
        "badge": "action",
        "desc": "Dambıl göğüs hizasında hafiflediğinde iki elle kadehi sar ve dirsekleri göğse topla.",
        "phase": "2. Göğüste Yakalama (Catch)"
      },
      {
        "badge": "finish",
        "desc": "Yakalama anındaki ivmeyle duraksamadan kalçayı topukların arasına derin çömelmeye indir ve patlayıcı doğrul.",
        "phase": "3. Derin Goblet Squat & Kilit"
      }
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "complex",
      "flow",
      "full_body",
      "legs",
      "conditioning",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "Ana Kalça, Arka Bacak & Kalça Bağı, Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Arka Bacak, Alt Sırt & Bel, Derin İç Karın, Ön Kol & Dış Pazı",
    "biomechanicalProof": "İlk savuruşta (Swing) kalça ve arka bacak çalışır; ağırlığı göğüste yakalayıp çömeldiğinde (Goblet Squat) ise ön bacak devreye girer.",
    "fitCategory": "squat",
    "fitName": "goblet_squat",
    "fitNote": "Swing+Goblet",
    "garminPrimaryMuscles": [
      "GLUTES",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Lunge ile derin çöküşten doğrulurken bacak momentumuyla eşzamanlı dambılları biceps curl ile omuzlara ve duraksamadan baş üstüne presleyin.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "db_lunge_to_curl_press",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Dambıl Lunge to Biceps Curl to Overhead Press",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıllar iki yanda dik duruş. Tek bacakla öne kontrollü lunge adım atarak 90° çök.",
        "phase": "1. Derin Lunge Çöküşü"
      },
      {
        "badge": "action",
        "desc": "Ön topuktan doğrularak kalkarken eşzamanlı çekiç tutuşla dambılları omuz başlarına (curl) çek.",
        "phase": "2. Biceps Curl ile Doğrulma"
      },
      {
        "badge": "finish",
        "desc": "Kalkışın son ivmesini kullanarak duraksamadan dambılları baş üstüne presle ve tepe noktasında kilitle.",
        "phase": "3. Baş Üstü Omuz Presi"
      }
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "biceps",
      "shoulders"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "complex",
      "flow",
      "full_body",
      "legs",
      "arms",
      "push",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Ön Kol & Dış Pazı, Pazı Dış Baş, Ön Omuz",
    "secondarySubMuscles": "Yan Omuz, Yan Kalça, Arka Kol Alt Baş, Derin İç Karın",
    "biomechanicalProof": "Adım alıp çömelirken ön bacak ve kalça, kalkarken dambılı büktüğünde biceps, baş üstüne ittiğinde ise ön/yan omuz ve triceps sırasıyla çalışır.",
    "fitCategory": "shoulder_press",
    "fitName": "dumbbell_hammer_curl_to_lunge_to_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "BICEPS",
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "TRAPS",
      "TRICEPS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Yerde derin menteşede çift dambıl gorilla row ardından patlayıcı kalça ekstansiyonuyla ağırlıkları omuza alın (clean).",
    "diagram": "assets/diagrams/seq_db_row.svg",
    "equipment": "dumbbell",
    "id": "db_gorilla_row_to_clean",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Kanatlar, Orta Sırt, Üst Sırt & Trapez",
    "name": "Dambıl Goril Row to Clean (Menteşe & Çekiş Akışı)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Geniş bacak tabanı, gövde 45° öne eğik, dambıllar yerde. Sırayla sağ ve sol dambılla göğse patlayıcı gorilla row çek.",
        "phase": "1. Çift Yönlü Goril Row"
      },
      {
        "badge": "action",
        "desc": "Row bitiminde iki dambılı tut, omurgayı nötralize et ve kalçayı arkaya derin menteşele.",
        "phase": "2. Menteşe Kurulumu"
      },
      {
        "badge": "finish",
        "desc": "Patlayıcı kalça itişiyle bacak gücünü kollarla birleştirip dambılları omuz başlarına yumuşakça kondur.",
        "phase": "3. Patlayıcı Hang Clean Kilit"
      }
    ],
    "primaryMuscles": [
      "back",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "biceps",
      "core"
    ],
    "tags": [
      "complex",
      "flow",
      "upper_pull",
      "posterior_chain",
      "core",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "row",
    "primarySubMuscles": "Kanatlar, Orta Sırt, Üst Sırt & Trapez, Ana Kalça",
    "secondarySubMuscles": "Arka Bacak, Alt Sırt & Bel, Pazı Dış Baş, Ön Kol & Dış Pazı, Derin İç Karın",
    "biomechanicalProof": "Row aşamasında kanatlar ve üst sırt/kürek kemikleri dambılı yerden çeker; Clean aşamasında ise kalça patlaması ve trapez silkmesiyle ağırlık omuz hizasına alınır.",
    "fitCategory": "row",
    "fitName": "barbell_straight_leg_deadlift_to_row",
    "fitNote": "Row+Clean",
    "garminPrimaryMuscles": [
      "HAMSTRINGS",
      "LOWER_BACK",
      "HIPS",
      "TRAPS",
      "LATS"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "BICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Yerde sırtüstü glute bridge ile kalçayı tavana sıkıştırırken iki dambılı göğüsten tavana presleyin.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "dumbbell",
    "id": "db_floor_press_to_bridge",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Orta Göğüs, Ana Kalça, Arka Kol Dış Baş",
    "name": "Dambıl Floor Press to Glute Bridge (Göğüs & Kalça Köprüsü)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yere sırtüstü uzan, dizler bükülü, dambıllar göğüs hizasında, dirsekler yerde 45° açıda.",
        "phase": "1. Zemin Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Topukları yere gömerek kalçayı tavana kaldırıp glute köprüsünü kitle; gövde düz bir rampa oluştursun.",
        "phase": "2. Kalça Köprüsü Kitleme"
      },
      {
        "badge": "finish",
        "desc": "Köprü pozisyonunu hiç bozmadan dambılları göğüs kaslarını sıkarak tavana presle ve kontrollü zemine indir.",
        "phase": "3. Göğüs Presi & Kilit"
      }
    ],
    "primaryMuscles": [
      "chest",
      "glutes",
      "triceps"
    ],
    "secondaryMuscles": [
      "shoulders",
      "hamstrings",
      "core"
    ],
    "tags": [
      "complex",
      "flow",
      "chest",
      "legs_glutes",
      "posterior_chain",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Orta Göğüs, Ana Kalça, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Ön Omuz, Arka Bacak & Kalça Bağı, Derin İç Karın",
    "biomechanicalProof": "Kalçayı yukarı kaldırıp sıkarak (ana kalça) tutarken aynı anda dambılları yukarı preslemek (orta göğüs ve triceps) alt ve üst vücudu birlikte çalıştırır.",
    "fitCategory": "bench_press",
    "fitName": "",
    "fitNote": "Dambıl Floor Press to Glute Bridge [id:db_floor_press_to_bridge]",
    "garminPrimaryMuscles": [
      "CHEST",
      "GLUTES",
      "HIPS",
      "ABDUCTORS"
    ],
    "garminSecondaryMuscles": [
      "TRICEPS",
      "HAMSTRINGS",
      "ABS",
      "OBLIQUES",
      "HIPS",
      "LOWER_BACK"
    ],
    "garminMatchType": "unmapped_noted"
  },
  {
    "category": "push",
    "cue": "Geriye lunge çöküşünden tek bacak üzerinde doğrularak yükselirken diğer dizi göğse çekin ve karşı kolla dambılı presleyin.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "db_step_back_lunge_to_knee_drive",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Dambıl Geri Lunge to Diz Çekme & Tek Kol Omuz Pres",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dambıl omuzda tek taraflı (ipsilateral/contralateral). Zıt bacakla geriye kontrollü lunge adım atıp çök.",
        "phase": "1. Geri Lunge Çöküşü"
      },
      {
        "badge": "action",
        "desc": "Ön topuktan patlayıcı fırlayarak ayağa kalkarken arka dizi 90° göğüs hizasına (high knee) fırla.",
        "phase": "2. Patlayıcı Diz Sürüşü"
      },
      {
        "badge": "finish",
        "desc": "Tek ayak üzerinde dengede kalırken omuzdaki dambılı tavana presle, 1 sn kitle ve kontrollü başlangıca dön.",
        "phase": "3. Tek Kol Pres & Denge"
      }
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "shoulders"
    ],
    "secondaryMuscles": [
      "core",
      "triceps"
    ],
    "tags": [
      "complex",
      "flow",
      "legs_quad",
      "shoulders_front",
      "core_obliques",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Ön Omuz",
    "secondarySubMuscles": "Orta Ön Bacak, Yan Kalça, Yan Karın, Arka Kol Alt Baş",
    "biomechanicalProof": "Geri lunge'dan tek ayak üzerinde yükselip arka dizi yukarı çekerken aynı anda tek kol omuz presi yapmak; ön bacak, kalça, ön kalça ve omzu birlikte çalıştırır.",
    "fitCategory": "lunge",
    "fitName": "dumbbell_reverse_lunge_to_high_knee_and_press",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Ayakta düz bacak esnemesiyle eller üzerinde şınav pozisyonuna yürüyün, derin şınav çekip ellerle geri yürüyerek doğrulun.",
    "diagram": "assets/diagrams/seq_pushup.svg",
    "equipment": "bodyweight",
    "id": "bw_inchworm_to_pushup",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Orta Göğüs, Ön Karın, Derin İç Karın",
    "name": "Vücut Ağırlığı Inchworm to Şınav (Mobilite & İtiş Akışı)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakta dik dur. Dizleri kırmadan kalçadan eğilip avuçları yere koy; arka bacakları derin esnet.",
        "phase": "1. Düz Bacak Zemin Teması"
      },
      {
        "badge": "action",
        "desc": "Eller üzerinde adım adım öne yürüyerek gövdeyi düz bir şınav ve plank tahtası pozisyonuna al.",
        "phase": "2. İleri Yürüyüş (Inchworm)"
      },
      {
        "badge": "finish",
        "desc": "Derin ve kontrollü bir göğüs şınavı çek, ardından ellerle ayaklara doğru geri yürüyerek patlayıcı ayağa kalk.",
        "phase": "3. Şınav & Geri Yürüyüş"
      }
    ],
    "primaryMuscles": [
      "chest",
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps",
      "hamstrings"
    ],
    "tags": [
      "complex",
      "flow",
      "mobility",
      "chest",
      "core",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Orta Göğüs, Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Ön Omuz, Arka Kol Dış Baş, Arka Kol Alt Baş, Arka Bacak",
    "biomechanicalProof": "Eller üzerinde yürürken ve şınav çekerken göğüs, ön omuz, triceps ve karın (core) ana işi üstlenir; başlangıç ve bitişteki eğilme/yürüme fazında arka bacaklar esner, bel/kalça ve üst sırt/kanatlar duruşu korur.",
    "fitCategory": "push_up",
    "fitName": "pilates_pushup",
    "fitNote": "Inchworm+Şınav",
    "garminPrimaryMuscles": [
      "CHEST",
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Dirsekleri hafif bükülü ve sabit tut; kolları bükmeden kalça hizasına doğru yay çizerek çek, tepe noktada alt kanat liflerini sık.",
    "diagram": "assets/diagrams/seq_pullover.svg",
    "equipment": "machine",
    "id": "mach_straight_arm_pulldown",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Kanatlar",
    "name": "Kablo Düz Kol Çekiş (Straight-Arm Pulldown)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kablo makarasını en üst seviyeye al, düz veya halat barı kavra. Gövdeyi kalçadan hafifçe (15-20°) öne eğ, kollar baş hizasında ileri uzansın.",
        "phase": "1. Kablo Kurulumu & Duruş"
      },
      {
        "badge": "action",
        "desc": "Dirsek açısını hiç bozmadan (hafif kırık ve kilitli), sırt kaslarını sıkarak barı uyluk/kalça hizasına doğru geniş bir yay çizerek bastır.",
        "phase": "2. Yay Çizerek Bastırma"
      },
      {
        "badge": "finish",
        "desc": "Alt kanat liflerini kalça yanında 1-2 saniye taş gibi sıkıştır. Ağırlığı kontrollü ve gerilimi hissettirerek baş hizasına geri bırak.",
        "phase": "3. Alt Kanat Zirve Kilidi"
      }
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "tags": [
      "upper_pull",
      "upper",
      "isolation"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Kanatlar",
    "secondarySubMuscles": "Arka Kol Uzun Baş, Ön Karın",
    "biomechanicalProof": "Dirsekleri hiç bükmeden düz kollarla barı yukarıdan bacaklarına indirmek, bicepsi tamamen devre dışı bırakır ve sadece kanat kaslarını (özellikle alt kanadı) çalıştırır.",
    "fitCategory": "pull_up",
    "fitName": "straight_arm_pulldown",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LATS",
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [
      "ABS",
      "CHEST",
      "SHOULDERS",
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_hinge",
    "cue": "Pedi kalça kıvrımının hemen altına sabitle; beli yuvarlamadan kalçadan öne eğil, omurga nötr ve düz bir hatta olana kadar doğrul.",
    "diagram": "assets/diagrams/seq_db_rdl.svg",
    "equipment": "bodyweight",
    "id": "bw_hyperextension",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Alt Sırt & Bel, Ana Kalça",
    "name": "45° Hiperekstansiyon (Back Extension)",
    "positions": [
      {
        "badge": "setup",
        "desc": "45° sehpa pedini kalça kemiğinin hemen altına ayarla (kalçanın serbestçe bükülmesini sağla). Topukları arkaya kilitle, elleri göğüste çapraz tut.",
        "phase": "1. 45° Sehpa Ayarı"
      },
      {
        "badge": "action",
        "desc": "Omurgayı bükmeden, hareketi tamamen kalça ekleminden menteşeleyerek (hip hinge) üst gövdeyi yavaşça öne doğru sarkıt.",
        "phase": "2. Kalça Menteşesi ile İniş"
      },
      {
        "badge": "finish",
        "desc": "Kalça ve alt sırt kaslarını (erector spinae) sıkarak gövdeyi bacaklarla düz bir hat oluşturana kadar kaldır. Beli geriye aşırı bükme.",
        "phase": "3. Nötr Omurga Doğrulması"
      }
    ],
    "primaryMuscles": [
      "back",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "tags": [
      "legs_hinge",
      "lower",
      "posterior_chain"
    ],
    "weightKey": "",
    "primarySubMuscles": "Alt Sırt & Bel, Ana Kalça",
    "secondarySubMuscles": "Arka Bacak & Kalça Bağı, Arka Bacak",
    "biomechanicalProof": "Sehpada öne eğilip kalça ve bel gücüyle doğrulmak, omurgayı dik tutan alt sırt/bel kaslarını, ana kalça kasını ve arka bacakları doğrudan güçlendirir.",
    "fitCategory": "hyperextension",
    "fitName": "hyperextension",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "LOWER_BACK"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "legs_quad",
    "cue": "Lunge adımında dambılı iki elle göğüste tut, kalkarken gövdeyi 180° çevirip dambılı baş üstüne çapraz savur.",
    "diagram": "assets/diagrams/seq_db_lunge.svg",
    "equipment": "dumbbell",
    "id": "db_rotational_lunge_chop",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça",
    "name": "Rotasyonel Lunge & Dambıl Savuruş",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ters lunge pozisyonunda ön diz 90°, dambıl iki elle çene/göğüs önünde dikey tutulur. Omurga dik ve nötr.",
        "phase": "1. Başlangıç (Lunge & İki El Kupa Tutuşu)"
      },
      {
        "badge": "action",
        "desc": "Ön topuktan güç alarak doğrul, arka ayak parmak ucunda dönerken gövdeyi 180° çevirip kollarla dambılı çapraz yukarı savur.",
        "phase": "2. Kalkış & 180° Spiral Rotasyon"
      },
      {
        "badge": "finish",
        "desc": "Sırt kasları arkaya dönük, kollar dambılı iki elle çapraz tepe noktada tam kilitler.",
        "phase": "3. Tepe Çapraz Kilitlenme"
      }
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "core"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "complex",
      "flow",
      "legs",
      "core",
      "power",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "squat",
    "primarySubMuscles": "İç Ön Bacak, Dış Ön Bacak, Ana Kalça, Yan Karın",
    "secondarySubMuscles": "Ön Omuz, Yan Kalça, Derin İç Karın",
    "biomechanicalProof": "Ters lunge adımından doğrulurken gövdeyi 180° çevirip dambılı çapraz yukarı savurmak; ön bacak ve ana kalçayla birlikte yan karın kaslarını patlayıcı çalıştırır.",
    "fitCategory": "lunge",
    "fitName": "side_to_side_lunge_chops",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "ADDUCTORS",
      "ABDUCTORS",
      "OBLIQUES",
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Geniş sumo menteşesinde bir dambılı yere bastırırken diğerini gövdeyi döndürerek kaburgaya patlayıcı çek.",
    "diagram": "assets/diagrams/seq_db_row.svg",
    "equipment": "dumbbell",
    "id": "db_rotational_gorilla_row",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Kanatlar, Orta Sırt",
    "name": "Rotasyonel Gorilla Row",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar geniş sumo duruşunda, kalça geride, omurga 45°. İki dambıl bacak arasında yerde, eller dambıllarda.",
        "phase": "1. Başlangıç (Geniş Sumo Menteşesi)"
      },
      {
        "badge": "action",
        "desc": "Sol dambılı yere bastırırken sağ dirseği kaburga hizasını geçecek şekilde yukarı patlat, göğsü 25° sağa döndür.",
        "phase": "2. İtiş-Çekiş & Torasik Dönüş"
      },
      {
        "badge": "finish",
        "desc": "Dambılı sessizce yere koy, push desteğini aktarıp beklemeden diğer kolla çekişe geç.",
        "phase": "3. Zemin Sıfırlaması & Değişim"
      }
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "core",
      "shoulders",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "back",
      "core",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Kanatlar, Orta Sırt",
    "secondarySubMuscles": "Yan Karın, Arka Omuz, Alt Sırt & Bel, Pazı Dış Baş, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Eğik duruşta dambılı çekerken gövdeyi de hafifçe döndürmek, kanat ve orta sırt çekişine yan karın (oblik) ve arka omuz kaslarını dahil eder.",
    "fitCategory": "row",
    "fitName": "kettlebell_row",
    "fitNote": "Rot Gorilla",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Destek elini dize koy, dambılı karşı diz altından omuz hizasına geniş bir parabolik yay çizerek süpür.",
    "diagram": "assets/exercises/db_single_arm_rear_delt_row.gif",
    "equipment": "dumbbell",
    "id": "db_single_arm_rear_delt_row",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Arka Omuz",
    "name": "Eğilerek Tek Kol Arka Omuz Çekişi (Parabolik Sweep)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Gövde 60° kalçadan eğik, destek eli dizde. Çalışan kol karşı diz altına doğru uzanmış arka omuzu esnetir.",
        "phase": "1. Başlangıç (Eğilme & Çapraz Uzayış)"
      },
      {
        "badge": "action",
        "desc": "Dirseği kırmadan dambılı dışarı ve yukarı doğru geniş bir dairesel yayla süpürerek kaldır.",
        "phase": "2. Parabolik Süpürme Yayı"
      },
      {
        "badge": "finish",
        "desc": "Kol omuz ve sırt çizgisine paralel olduğunda arka omuzu 1 saniye taş gibi sık ve kontrollü indir.",
        "phase": "3. Tepe Kilitlenme (Reverse Fly)"
      }
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "back",
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "shoulders",
      "isolation",
      "dumbbell"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Arka Omuz",
    "secondarySubMuscles": "Orta Sırt, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Öne eğilip dirseği vücuda yapıştırmak yerine yana doğru geniş açıyla çekmek, yükü kanatlardan alıp doğrudan arka omuza ve kürek kemiği çevresine verir.",
    "fitCategory": "lateral_raise",
    "fitName": "overhand_grip_rear_lateral_raise",
    "fitNote": "Rear Delt Row",
    "garminPrimaryMuscles": [
      "SHOULDERS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Kalçadan 45-60° öne eğil, sırtını düz tut ve iki dambılı dirsekleri hafif bükülü şekilde yana yukarı aç.",
    "diagram": "assets/exercises/db_rear_delt_fly.gif",
    "equipment": "dumbbell",
    "id": "db_rear_delt_fly",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Arka Omuz, Orta Sırt",
    "name": "Dambıl Rear Delt Fly (Eğilerek Ters Açış)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde, dizler hafif bükülü. Gövde kalçadan 45-60° öne eğik, sırt düz ve dambıllar göğüs altında serbest.",
        "phase": "1. Başlangıç (Öne Eğik Duruş)"
      },
      {
        "badge": "action",
        "desc": "Dirseklerdeki hafif açıyı bozmadan iki dambılı aynı anda geniş bir yay çizerek yana ve yukarı kaldır.",
        "phase": "2. Yana Yukarı Açış"
      },
      {
        "badge": "finish",
        "desc": "Kollar omuz hizasına (T pozisyonu) ulaşınca kürek kemiklerini ve arka omuzu 1 saniye sık, sonra kontrollü indir.",
        "phase": "3. Tepe Sıkıştırma"
      }
    ],
    "primaryMuscles": [
      "shoulders",
      "back"
    ],
    "secondaryMuscles": [
      "traps"
    ],
    "tags": [
      "upper_pull",
      "shoulders",
      "back",
      "isolation",
      "dumbbell"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Arka Omuz, Orta Sırt",
    "secondarySubMuscles": "Üst Sırt & Trapez",
    "biomechanicalProof": "Öne eğik pozisyonda kolları yana yukarı açmak arka omuzları, kürek kemikleri arasındaki orta sırt (rhomboid) ve orta trapez kaslarını doğrudan çalıştırır.",
    "fitCategory": "lateral_raise",
    "fitName": "bent_over_dumbbell_lateral_raise",
    "fitNote": "Dumbbell Rear Delt Fly",
    "garminPrimaryMuscles": [
      "SHOULDERS",
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "LATS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Eğilerek row yap, doğrulurken dirsekleri yüksek çekip scarecrow pozisyonundan bilekleri W şeklinde tavana çevir.",
    "diagram": "assets/exercises/db_high_pull_cuban_rotation.gif",
    "equipment": "dumbbell",
    "id": "db_high_pull_cuban_rotation",
    "isComplex": true,
    "mechanic": "compound",
    "muscle": "Arka Omuz, Orta Sırt, Üst Sırt & Trapez",
    "name": "Eğilerek Row & High Pull + Cuban Rotasyon",
    "positions": [
      {
        "badge": "setup",
        "desc": "Menteşede dambılları karna doğru çek, latissimus ve sırt kaslarını sıkıştır.",
        "phase": "1. Bent-Over Row"
      },
      {
        "badge": "action",
        "desc": "Kalçayı itip doğrul, dambılları göğse çekerken dirsekleri omuz hizasında yüksek tut (scarecrow).",
        "phase": "2. Dikleşme & High Pull"
      },
      {
        "badge": "finish",
        "desc": "Dirsek ekseninde ön kolları 90° yukarı çevirerek kulak yanında W pozisyonunda kilitle.",
        "phase": "3. Cuban 90° Dış Rotasyon"
      }
    ],
    "primaryMuscles": [
      "shoulders",
      "back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "tags": [
      "complex",
      "upper_pull",
      "shoulders",
      "rotator_cuff",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Arka Omuz, Orta Sırt, Üst Sırt & Trapez",
    "secondarySubMuscles": "Yan Omuz, Alt Sırt & Bel, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Eğilerek yapılan yüksek çekiş ve kolları yukarı döndürme (Cuban rotasyon) hareketinde omuz iç denge kasları (rotator manşet), arka omuz, trapez ve kürek kemiği kasları ana yükü çeker; eğik duruşta bel, karın ve arka bacak/kalça vücudu sabit tutar.",
    "fitCategory": "lateral_raise",
    "fitName": "combo_shoulder_raise",
    "fitNote": "HighPull+Cuban",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "TRAPS",
      "CHEST"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Kolları bükmeden omuz başlarını doğrudan kulaklara doğru dikey silkin, yuvarlama yapmadan tepe noktada sık.",
    "diagram": "assets/diagrams/seq_farmers_walk.svg",
    "equipment": "dumbbell",
    "id": "db_dumbbell_shrug_burnout",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Üst Sırt & Trapez",
    "name": "Dambıl Trapez Silkme (Burnout)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar kalça genişliğinde dik duruş, kollar sarkık dambıllar yanlarda, trapezler tamamen esnek.",
        "phase": "1. Başlangıç (Dikey Duruş & Esneme)"
      },
      {
        "badge": "action",
        "desc": "Kolları hiç bükmeden kürek kemiklerini doğrudan dikey hatta kulaklara doğru yükselt.",
        "phase": "2. Dikey Silkme"
      },
      {
        "badge": "finish",
        "desc": "Omuzlar en üst noktada kulak hizasında 1 saniye izometrik sıkıştırılır ve kontrollü indirilir.",
        "phase": "3. Tepe Skapular Elevasyon"
      }
    ],
    "primaryMuscles": [
      "back"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "tags": [
      "upper_pull",
      "back",
      "traps",
      "dumbbell"
    ],
    "weightKey": "pull",
    "primarySubMuscles": "Üst Sırt & Trapez",
    "secondarySubMuscles": "Orta Sırt, Ön Kol & Dış Pazı",
    "biomechanicalProof": "Kolları bükmeden omuzları kulaklara doğru yukarı çekip sıkmak, doğrudan boyun iki yanındaki üst trapez kaslarını çalıştırır.",
    "fitCategory": "shrug",
    "fitName": "dumbbell_shrug",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "TRAPS"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "pull",
    "cue": "Masa duruşunda bir el yerde, dambılı göğüs altından zemin paralelinde sağa doğru kanat gibi açıp 90° T pozisyonunda kilitle.",
    "diagram": "assets/diagrams/seq_floor_press.svg",
    "equipment": "dumbbell",
    "id": "db_quadruped_external_rotation",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Arka Omuz",
    "name": "Dört Ayak Pozisyonunda Yatay Arka Omuz Uçuşu",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dizler ve destek eli yerde masa pozisyonu, çalışan kol dambılla göğüs altından çapraz uzanmış.",
        "phase": "1. Masa Duruşu (Dört Ayak & Çapraz Başlangıç)"
      },
      {
        "badge": "action",
        "desc": "Kol zemin paralelinde dışarı doğru yatay süpürür, gövde dengesi korunur.",
        "phase": "2. Yatay Süpürme Fazı"
      },
      {
        "badge": "finish",
        "desc": "Kol gövdeyle 90° T-pozisyonu oluşturacak şekilde sırt seviyesinde yana açılır ve kilitlenir.",
        "phase": "3. Tepe Yatay Kilitlenme (T-Pozisyonu)"
      }
    ],
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "mobility",
      "shoulders",
      "rotator_cuff",
      "isolation",
      "dumbbell",
      "functional_fitness"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Arka Omuz",
    "secondarySubMuscles": "Orta Sırt, Derin İç Karın",
    "biomechanicalProof": "Dört ayak üzerinde tek kolu yana açıp döndürmek arka omuz ve omuz iç kaslarını çalıştırırken, üç uzuv üstünde düz kalmak karın ve kürek kemiği kaslarını dengeler.",
    "fitCategory": "shoulder_stability",
    "fitName": "dumbbell_face_pull_with_external_rotation",
    "fitNote": "Quad Ext Rot",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Önce ayakların bitişikken dikey sıçra ve havadayken kollarını-bacaklarını X formunda aç; inişlerde dizlerini hafifçe bükerek yaylan, topuklarını yere sert vurma.",
    "diagram": "assets/exercises/bw_jumping_jack.gif",
    "equipment": "bodyweight",
    "id": "bw_jumping_jack",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Üst Baldır, Alt Baldır, Yan Omuz",
    "name": "Jumping Jack (Yıldız Sıçrama)",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Zemin Kurulum & Diz Yaylanması",
        "desc": "Ayaklar bitişik, kollar gövde yanında dik dur. Sıçramadan hemen önce ayak tabanlarını yerden kesmeden dizlerini hafifçe dışa bükerek yaylan ve kalf/uyluk kaslarını yükle."
      },
      {
        "badge": "action",
        "phase": "2. Bitişik Dikey Sıçrama & Havada X Açılışı",
        "desc": "Önce bacakların henüz bitişikken yerden dikey olarak havalan; yerden kesildikten sonra havadayken bacaklarını omuz genişliğinden genişe, kollarını ise baş üstünde V formuna aç."
      },
      {
        "badge": "action",
        "phase": "3. Geniş İniş & İkinci Yaylanma",
        "desc": "Ön ayak parmak uçlarınla geniş duruşta yumuşakça yere kon, dizlerini dışa doğru bükerek darbeyi sönümle ve bekletmeden zemini tekrar yukarı it."
      },
      {
        "badge": "finish",
        "phase": "4. Havada Kapanış & Yumuşak Konuş",
        "desc": "İkinci sıçramayla tekrar havalanırken bacaklarını havada merkezde birleştir, kollarını yanlara indir ve dizlerini esneterek başlangıç duruşuna yumuşakça kon."
      }
    ],
    "primaryMuscles": [
      "calves",
      "shoulders",
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "full_body",
      "conditioning",
      "bodyweight",
      "aerobic",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Üst Baldır, Alt Baldır, Yan Omuz, Yan Kalça",
    "secondarySubMuscles": "Üst Sırt & Trapez, Derin İç Karın",
    "biomechanicalProof": "Zıplayarak bacakları ve kolları açıp kapamak; parmak ucunda sıçrama ile kalfları, kolları yukarı kaldırma ile yan omuzları, bacak açma ile yan kalça ve iç bacağı çalıştırır.",
    "fitCategory": "cardio",
    "fitName": "jumping_jacks",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES",
      "ADDUCTORS",
      "ABDUCTORS"
    ],
    "garminSecondaryMuscles": [
      "CALVES",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Gövdeyi geriye yatırma, dizlerini 90 derece kalça hizasına patlayıcı çek ve zıt kolla ritmi hızlandır.",
    "diagram": "assets/diagrams/seq_escalera.svg",
    "equipment": "bodyweight",
    "id": "bw_high_knees",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Karın, Orta Ön Bacak, Üst Baldır",
    "name": "High Knees (Dize Çekerek Koşu)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayakta dik duruş, ağırlık parmak ucunda, dirsekler 90° koşu modunda.",
        "phase": "1. Atletik Kurulum"
      },
      {
        "badge": "action",
        "desc": "Sağ dizi 90° kalça hizasına patlayıcı çek, sol kolu öne fırlat.",
        "phase": "2. Sağ Dize Patlayıcı Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Hızla bacak değiştirip sol dizi kalçaya çek, gövdeyi dik tutarak seri devam et.",
        "phase": "3. Sol Dize Geçiş & Süreklilik"
      }
    ],
    "primaryMuscles": [
      "core",
      "quads",
      "calves"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "tags": [
      "full_body",
      "conditioning",
      "bodyweight",
      "cardio",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Orta Ön Bacak, Üst Baldır",
    "secondarySubMuscles": "Alt Baldır, Yan Kalça",
    "biomechanicalProof": "Olduğun yerde dizleri hızla bel hizasına çekerek koşmak; bacağı yukarı çeken ön kalça ve alt karın kasları ile yerden sıçrayan kalfları çalıştırır.",
    "fitCategory": "plyo",
    "fitName": "front_knee_strike",
    "fitNote": "High Knees",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "QUADS",
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Topukları yere vurma, sadece ayak parmak ucunda minik yaylanmalar yap, bilekleri ritmik çevir.",
    "diagram": "assets/diagrams/seq_escalera.svg",
    "equipment": "bodyweight",
    "id": "bw_jump_rope",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Üst Baldır, Alt Baldır, Ön Kaval & Bilek",
    "name": "İp Atlama (Gölge İp / Jump Rope)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar yan yana, dirsekler kaburgalara yakın, eller bel hizasında hazır.",
        "phase": "1. Hazırlık & Duruş"
      },
      {
        "badge": "action",
        "desc": "Parmak ucunda 2-3 cm elastik sıçrama yaparken bileklerle dairesel ip çevir.",
        "phase": "2. Elastik Sıçrama & İp Çevirme"
      },
      {
        "badge": "finish",
        "desc": "Dizleri hafif kırık tutarak yumuşak in, zeminle temas süresini minimumda tut.",
        "phase": "3. Reaktif İniş & Devamlılık"
      }
    ],
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [
      "core",
      "shoulders"
    ],
    "tags": [
      "conditioning",
      "bodyweight",
      "aerobic",
      "calves",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Üst Baldır, Alt Baldır, Ön Kaval & Bilek",
    "secondarySubMuscles": "Ön Kol & Dış Pazı, Yan Omuz, Derin İç Karın",
    "biomechanicalProof": "Parmak ucunda ritmik sıçramak doğrudan üst ve alt kalf (baldır) ile ayak bileği kaslarını, ip çevirme hareketi ise ön kol ve omuzları çalıştırır.",
    "fitCategory": "cardio",
    "fitName": "jump_rope",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "CALVES"
    ],
    "garminSecondaryMuscles": [
      "HAMSTRINGS",
      "GLUTES"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Yana doğru genişçe sıçra, iniş yapan tek bacağınla şoku absorbe et, arka ayağı çapraz arkaya süzdür.",
    "diagram": "assets/diagrams/seq_escalera.svg",
    "equipment": "bodyweight",
    "id": "bw_skater_jumps",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Kalça, Ana Kalça, Dış Ön Bacak",
    "name": "Skater Jumps (Paten Sıçraması)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sağ bacakta hafif çömelmiş atletik pozisyon al, sol ayağı hafif arkada tut.",
        "phase": "1. Yanal Yüklenme"
      },
      {
        "badge": "action",
        "desc": "Sağ bacakla sola doğru patlayıcı sıçra, havada dinamik dengeni koru.",
        "phase": "2. Havada Yanal Sıçrama"
      },
      {
        "badge": "finish",
        "desc": "Sol bacağa diz bükük yumuşakça kon, sağ ayağı çapraz arkaya al ve yön değiştir.",
        "phase": "3. Tek Bacak Sönümleme & Geri İtiş"
      }
    ],
    "primaryMuscles": [
      "glutes",
      "quads"
    ],
    "secondaryMuscles": [
      "calves",
      "core"
    ],
    "tags": [
      "legs",
      "conditioning",
      "power",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Kalça, Ana Kalça, Dış Ön Bacak",
    "secondarySubMuscles": "Üst Baldır, Ön Kaval & Bilek, Yan Karın",
    "biomechanicalProof": "Buz patencisi gibi sağa ve sola tek ayak üstüne sıçramak; yana itiş yapan yan kalça, ana kalça ve ön bacak kaslarını patlayıcı çalıştırır.",
    "fitCategory": "plyo",
    "fitName": "lateral_leap_and_hop",
    "fitNote": "Skater Jump",
    "garminPrimaryMuscles": [
      "QUADS",
      "CALVES"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "HAMSTRINGS",
      "ADDUCTORS",
      "ABDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Eller omuz altında sert, kalçanın yukarı fırlamasına veya aşağı çökmesine izin vermeden ayakları aç-kapa.",
    "diagram": "assets/diagrams/seq_escalera.svg",
    "equipment": "bodyweight",
    "id": "bw_plank_jacks",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Derin İç Karın, Ön Karın",
    "name": "Plank Jacks (Plank Bacak Aç-Kapa)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yüksek plank pozisyonu; bilekler omuz altında, sırt düz, ayaklar birleşik.",
        "phase": "1. Plank Kilit Duruşu"
      },
      {
        "badge": "action",
        "desc": "Karın kilitliyken iki ayağı birden yana sıçratarak omuzdan geniş aç.",
        "phase": "2. Bacakları Yana Sıçratma"
      },
      {
        "badge": "finish",
        "desc": "Kalçayı hiç düşürmeden ayakları ortaya topla, bel çukurunu sabit tut.",
        "phase": "3. Merkeze Dönüş & Kor Kontrolü"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "glutes",
      "shoulders",
      "calves"
    ],
    "tags": [
      "core",
      "conditioning",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Ön Karın",
    "secondarySubMuscles": "Yan Kalça, Ön Omuz, Üst Baldır",
    "biomechanicalProof": "Şınav/Plank duruşunda beli düşürmeden ayakları zıplayarak açıp kapamak; ön/derin karın kaslarını, omuzları ve yan kalça/iç bacak kaslarını çalıştırır.",
    "fitCategory": "plank",
    "fitName": "elbow_plank_pike_jacks",
    "fitNote": "Plank Jacks",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "LOWER_BACK"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Hızla çömelip elleri yere koy, ayakları planka fırlat; şınav ve zıplama olmadan hemen squata geri toplan.",
    "diagram": "assets/diagrams/seq_escalera.svg",
    "equipment": "bodyweight",
    "id": "bw_squat_thrust",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Dış Ön Bacak, Ana Kalça, Ön Karın",
    "name": "Squat Thrust (Yarım Burpee)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Ayaklar omuz genişliğinde dik duruş, hızla derin squata çök ve elleri bas.",
        "phase": "1. Hızlı Çöküş & El Basışı"
      },
      {
        "badge": "action",
        "desc": "İki ayağı geriye fırlatıp sağlam yüksek plank pozisyonu al (şınav çekme).",
        "phase": "2. Planka Fırlama"
      },
      {
        "badge": "finish",
        "desc": "Ayakları ellerin yanına geri fırlatıp hemen ayağa dikil ve tekrar başla.",
        "phase": "3. Squata Dönüş & Doğrulma"
      }
    ],
    "primaryMuscles": [
      "quads",
      "glutes",
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "chest",
      "calves"
    ],
    "tags": [
      "full_body",
      "conditioning",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Dış Ön Bacak, Ana Kalça, Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Ön Omuz, Orta Göğüs, Üst Baldır",
    "biomechanicalProof": "Çömelip elleri yere koyarak ayakları geriye fırlatmak ve tekrar toplayıp ayağa kalkmak; ön bacak, kalça ve karın (core) kaslarını birlikte çalıştırır.",
    "fitCategory": "total_body",
    "fitName": "squat_thrusts",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "CHEST",
      "CALVES",
      "GLUTES",
      "HIPS",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS",
      "HAMSTRINGS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Kısa direnç bandını ayak bileklerinin veya dizlerinin etrafına geçir; alçak atletik pozisyonda bant gerginliğini kaybetmeden yana seri adımlarla kay.",
    "diagram": "assets/exercises/bw_lateral_shuffle.webp",
    "equipment": "mini_band",
    "id": "bw_lateral_shuffle",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Kalça, Dış Ön Bacak, İç Ön Bacak",
    "name": "Lateral Shuffle (Kısa Bantlı Yanal Adımlama)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kısa direnç bandı bileklerde gergin, çeyrek squat derinliğinde alçak atletik duruş.",
        "phase": "1. Bant Kurulumu & Duruş"
      },
      {
        "badge": "action",
        "desc": "Bandın tamamen gevşemesine izin vermeden sağa doğru seri yanal adımlarla kay.",
        "phase": "2. Bantlı Yanal Kayma"
      },
      {
        "badge": "finish",
        "desc": "Dıştaki ayakla zemine fren basıp hemen sola doğru aynı gerginlikle kaymaya geç.",
        "phase": "3. Fren & Yön Değiştirme"
      }
    ],
    "primaryMuscles": [
      "glutes",
      "quads"
    ],
    "secondaryMuscles": [
      "calves",
      "core"
    ],
    "tags": [
      "legs",
      "conditioning",
      "mini_band",
      "agility",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Kalça, Dış Ön Bacak, İç Ön Bacak",
    "secondarySubMuscles": "Üst Baldır, Ön Kaval & Bilek, Derin İç Karın",
    "biomechanicalProof": "Ayak bileklerindeki kısa direnç bandına karşı alçak atletik duruşta sağa sola hızlı adımlamak; yan kalça (gluteus medius) ve dış ön bacak kaslarını sürekli elastik gerilim altında çalıştırır.",
    "fitCategory": "plyo",
    "fitName": "side_to_side_shuffle_jump",
    "fitNote": "Mini Band Lateral Shuffle",
    "garminPrimaryMuscles": [
      "QUADS",
      "CALVES"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "HAMSTRINGS",
      "ABDUCTORS",
      "ADDUCTORS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "İtişi önce bacaklarla başlat, ardından gövdeyi hafif geriye yaslayıp kolları alt kaburgaya çek; dönüşte önce kolları uzat sonra dizleri bük.",
    "diagram": "assets/diagrams/seq_row.svg",
    "equipment": "machine",
    "id": "cond_indoor_row",
    "isComplex": false,
    "isCardioMinutes": true,
    "trackingType": "time",
    "mechanic": "compound",
    "muscle": "Kanatlar, Orta Sırt, Dış Ön Bacak",
    "name": "Kürek Çekme (Indoor Rowing / Ergometre)",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Yakalama (Catch) Pozisyonu",
        "desc": "Dizler bükülü, kaval kemikleri yere dik, kollar ileride düz, omuzlar gevşek ve omurga dik şekilde koltuğun önünde kurul."
      },
      {
        "badge": "action",
        "phase": "2. Bacak İtişi & Sırt Çekişi (Drive)",
        "desc": "Topuklardan güçlüce iterek bacakları aç, kalça menteşesiyle gövdeyi 11 yönüne yasla ve elciği alt göğüs/üst karın hizasına çek."
      },
      {
        "badge": "finish",
        "phase": "3. Kontrollü Dönüş (Recovery)",
        "desc": "Önce kollarını ileri uzat, gövdeni kalçadan öne eğ ve en son dizlerini bükerek akıcı ritimle başlangıca dön."
      }
    ],
    "primaryMuscles": [
      "back",
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "shoulders",
      "biceps",
      "hamstrings",
      "core"
    ],
    "tags": [
      "full_body",
      "conditioning",
      "machine",
      "aerobic",
      "rowing"
    ],
    "weightKey": "",
    "primarySubMuscles": "Kanatlar, Orta Sırt, Dış Ön Bacak, Ana Kalça",
    "secondarySubMuscles": "Arka Omuz, Pazı Dış Baş, Ön Kol & Dış Pazı, Arka Bacak, Ön Karın",
    "biomechanicalProof": "Kürek ergometresinde itiş fazının %60'ı bacak ve kalça itişinden, %20'si gövde menteşesinden, %20'si ise kanat, orta sırt ve kol çekişinden üretilir.",
    "fitCategory": "row",
    "fitName": "indoor_row",
    "fitNote": "Indoor Row",
    "garminPrimaryMuscles": [
      "LATS",
      "TRAPS",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS",
      "LOWER_BACK",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Göğsü dik tut, bakışlar ileride olsun; topuktan parmak ucuna yuvarlanan adımlarla ve doğal kol salınımıyla ritmik tempoyu koru.",
    "diagram": "assets/diagrams/seq_farmers_walk.svg",
    "equipment": "bodyweight",
    "id": "cond_walking",
    "isComplex": false,
    "isCardioMinutes": true,
    "trackingType": "time",
    "mechanic": "compound",
    "muscle": "Üst Baldır, Alt Baldır, Dış Ön Bacak",
    "name": "Tempolu Yürüyüş & Doğa Yürüyüşü (Walking)",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Dik Postür & Core Aktivasyonu",
        "desc": "Omuzları kulaklardan uzaklaştırıp geriye al, göğsü dik tut ve karın duvarını hafifçe aktif tutarak yürüyüşe başla."
      },
      {
        "badge": "action",
        "phase": "2. Topuk-Taban-Parmak Ucu Yuvarlanması",
        "desc": "Yere yumuşakça topuk dış kenarıyla bas, ağırlığı ayak tabanından öne aktar ve başparmak kökünden yeri iterek ilerle."
      },
      {
        "badge": "finish",
        "phase": "3. Ritmik Kol Salınımı & Nefes",
        "desc": "Dirsekleri 90° civarında bükülü tutarak bacaklarla çapraz senkronda salla; burundan derin ve ritmik nefes alışverişini sürdür."
      }
    ],
    "primaryMuscles": [
      "calves",
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "core"
    ],
    "tags": [
      "legs",
      "conditioning",
      "bodyweight",
      "aerobic",
      "walking"
    ],
    "weightKey": "",
    "primarySubMuscles": "Üst Baldır, Alt Baldır, Dış Ön Bacak, Ana Kalça",
    "secondarySubMuscles": "Yan Kalça, Ön Kaval & Bilek, Arka Bacak, Derin İç Karın",
    "biomechanicalProof": "Tempolu ve eğimli yürüyüş; her adımda ayak bileği itişiyle kalfları, diz ve kalça açılımıyla ön bacak ile kalça kaslarını aerobik dayanıklılık altında çalıştırır.",
    "fitCategory": "run",
    "fitName": "walk",
    "fitNote": "Walking",
    "garminPrimaryMuscles": [
      "QUADS",
      "HIPS",
      "HAMSTRINGS",
      "GLUTES",
      "CALVES"
    ],
    "garminSecondaryMuscles": [
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "conditioning",
    "cue": "Gövdeyi ayak bileğinden hafif öne eğ, adımlarını ağırlık merkezinin tam altına indir; yüksek kadans ve elastik ayak bileği yaylanmasıyla koş.",
    "diagram": "assets/exercises/bw_high_knees.webp",
    "equipment": "bodyweight",
    "id": "cond_running",
    "isComplex": false,
    "isCardioMinutes": true,
    "trackingType": "time",
    "mechanic": "compound",
    "muscle": "Üst Baldır, Alt Baldır, Arka Bacak",
    "name": "Koşu & Koşu Bandı (Running / Treadmill)",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Atletik Koşu Postürü",
        "desc": "Baş dik, omuzlar rahat, gövde belden değil ayak bileklerinden 3-5° hafif öne eğimli; kollar 90° açıyla gövde yanında."
      },
      {
        "badge": "action",
        "phase": "2. Orta Taban Basışı (Midfoot Strike)",
        "desc": "Ayağını vücudun çok önüne uzatmadan (overstride yapmadan) kalça izdüşümünün hemen altına orta tabanla elastik şekilde bas."
      },
      {
        "badge": "finish",
        "phase": "3. Üçlü İtiş & Diz Çekişi",
        "desc": "Kalça, diz ve ayak bileği üçlü açılımıyla yeri geriye it; topuğu kalçaya doğru doğal döngüyle toplayarak kadansı koru."
      }
    ],
    "primaryMuscles": [
      "calves",
      "hamstrings",
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "tags": [
      "legs",
      "conditioning",
      "bodyweight",
      "aerobic",
      "running"
    ],
    "weightKey": "",
    "primarySubMuscles": "Üst Baldır, Alt Baldır, Arka Bacak, Dış Ön Bacak, Ana Kalça",
    "secondarySubMuscles": "Orta Ön Bacak, Yan Kalça, Ön Kaval & Bilek, Derin İç Karın",
    "biomechanicalProof": "Koşu sırasında yere temas ve itiş fazı kalf, arka bacak ve kalçayı yüksek elastik gerilimle yüklerken, tek ayak üzerindeki denge fazı yan kalça ve core kaslarını çalıştırır.",
    "fitCategory": "run",
    "fitName": "run",
    "fitNote": "Running / Treadmill",
    "garminPrimaryMuscles": [
      "QUADS",
      "HIPS",
      "HAMSTRINGS",
      "GLUTES",
      "CALVES"
    ],
    "garminSecondaryMuscles": [
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "mb_monster_walk",
    "name": "Mini Bant Yan Yürüyüş (Monster Walk)",
    "category": "legs_hinge",
    "equipment": "mini_band",
    "mechanic": "isolation",
    "isComplex": false,
    "muscle": "Yan Kalça (Gluteus Medius), Dış Ön Bacak",
    "primaryMuscles": [
      "glutes",
      "quads"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "primarySubMuscles": "Yan Kalça, Dış Ön Bacak",
    "secondarySubMuscles": "Derin İç Karın",
    "cue": "Mini bandı dizlerin veya bileklerin etrafına geçir, yarım squat pozisyonunda gerginliği bozmadan yana adımla.",
    "diagram": "assets/exercises/mb_monster_walk.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Başlangıç",
        "desc": "Mini bant diz üstünde gergin, kalça hafif geride yarım atletik çömelme pozisyonunda."
      },
      {
        "badge": "action",
        "phase": "2. Yana Adım",
        "desc": "Dizi içe düşürmeden yana kontrollü adım at, ardından diğer ayağı bant gevşemeden yaklaştır."
      }
    ],
    "tags": [
      "legs",
      "glutes",
      "mini_band",
      "activation",
      "functional_fitness"
    ],
    "weightKey": "",
    "fitCategory": "squat",
    "fitName": "lateral_band_walk",
    "fitNote": "Mini Band Monster Walk",
    "garminPrimaryMuscles": [
      "GLUTES",
      "QUADS"
    ],
    "garminSecondaryMuscles": [
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "mb_glute_bridge_abduction",
    "name": "Mini Bantlı Kalça Köprüsü & Açış",
    "category": "legs_hinge",
    "equipment": "mini_band",
    "mechanic": "compound",
    "isComplex": false,
    "muscle": "Ana Kalça, Yan Kalça, Arka Bacak",
    "primaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "primarySubMuscles": "Ana Kalça, Yan Kalça, Arka Bacak",
    "secondarySubMuscles": "Derin İç Karın",
    "cue": "Mini bant dizlerin hemen üstünde; kalçayı yukarı sıkarken dizleri kontrollü dışa açıp 1 saniye bekle.",
    "diagram": "assets/exercises/mb_glute_bridge_abduction.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Köprü Kurulumu",
        "desc": "Sırtüstü yat, ayak tabanları yerde, mini bant diz üstünde hafif gergin."
      },
      {
        "badge": "action",
        "phase": "2. Zirve Sıkışı",
        "desc": "Topuklardan itip kalçayı kaldır, zirvede dizleri yana açarak yan kalçayı sık."
      }
    ],
    "tags": [
      "legs",
      "glutes",
      "mini_band"
    ],
    "weightKey": "",
    "fitCategory": "hip_raise",
    "fitName": "glute_bridge",
    "fitNote": "Mini Band Glute Bridge Abduction",
    "garminPrimaryMuscles": [
      "GLUTES",
      "HAMSTRINGS"
    ],
    "garminSecondaryMuscles": [
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "mb_banded_squat",
    "name": "Mini Bantlı Squat (Diz Açışı)",
    "category": "legs_quad",
    "equipment": "mini_band",
    "mechanic": "compound",
    "isComplex": false,
    "muscle": "Ön Bacak (Quad), Yan Kalça, Ana Kalça",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "primarySubMuscles": "Dış Ön Bacak, Orta Ön Bacak, Yan Kalça, Ana Kalça",
    "secondarySubMuscles": "Derin İç Karın",
    "cue": "Mini bandı dizlerin üzerine tak, çömelirken dizlerini banda karşı dışa doğru iterek hizayı koru.",
    "diagram": "assets/exercises/mb_banded_squat.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Duruş",
        "desc": "Ayaklar omuz genişliğinde, bant diz üstünde gergin."
      },
      {
        "badge": "action",
        "phase": "2. Çömelme & İtiş",
        "desc": "Dizleri dışa iterek paralel seviyeye in ve topuklardan patlayıcı kalk."
      }
    ],
    "tags": [
      "legs",
      "quads",
      "mini_band"
    ],
    "weightKey": "",
    "fitCategory": "squat",
    "fitName": "squat",
    "fitNote": "Mini Band Squat",
    "garminPrimaryMuscles": [
      "QUADS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "mb_external_rotation",
    "name": "Mini Bant Omuz Dış Rotasyon",
    "category": "pull",
    "equipment": "mini_band",
    "mechanic": "isolation",
    "isComplex": false,
    "muscle": "Arka Omuz, Yan Omuz, Rotator Cuff",
    "primaryMuscles": [
      "shoulders"
    ],
    "secondaryMuscles": [],
    "primarySubMuscles": "Arka Omuz, Yan Omuz",
    "secondarySubMuscles": "Orta Sırt",
    "cue": "Dirsekleri 90° büküp kaburgaya sabitle; mini bandı ön kollarla dışa doğru açıp omuz dış rotatorlarını sık.",
    "diagram": "assets/exercises/mb_external_rotation.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Sabitleme",
        "desc": "Mini bant iki elin bilek veya el sırtında, dirsekler gövdeye yapışık."
      },
      {
        "badge": "action",
        "phase": "2. Dışa Açış",
        "desc": "Dirsekleri vücuttan ayırmadan elleri dışa doğru aç ve 2 sn tut."
      }
    ],
    "tags": [
      "shoulders",
      "rear_delt",
      "mini_band",
      "rehab"
    ],
    "weightKey": "",
    "fitCategory": "shoulder_raise",
    "fitName": "external_rotation",
    "fitNote": "Mini Band External Rotation",
    "garminPrimaryMuscles": [
      "SHOULDERS"
    ],
    "garminSecondaryMuscles": [
      "BACK"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "mb_clamshell",
    "name": "Mini Bant Clamshell (İstiridye Açışı)",
    "category": "legs_hinge",
    "equipment": "mini_band",
    "mechanic": "isolation",
    "isComplex": false,
    "muscle": "Yan Kalça (Gluteus Medius)",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "core"
    ],
    "primarySubMuscles": "Yan Kalça",
    "secondarySubMuscles": "Derin İç Karın",
    "cue": "Yan yatıp dizleri 45° bük; ayak tabanlarını birleşik tutarak üstteki dizi banda karşı tavana aç.",
    "diagram": "assets/exercises/mb_clamshell.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Yan Yatış",
        "desc": "Kalça ve omuzlar tek çizgide, bant diz üstünde."
      },
      {
        "badge": "action",
        "phase": "2. Dizi Açış",
        "desc": "Beli geriye devirmeden üstteki dizi yukarı aç ve yan kalçada yanmayı hisset."
      }
    ],
    "tags": [
      "glutes",
      "mini_band",
      "isolation"
    ],
    "weightKey": "",
    "fitCategory": "hip_raise",
    "fitName": "clamshell",
    "fitNote": "Mini Band Clamshell",
    "garminPrimaryMuscles": [
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "ABS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "rb_pull_apart",
    "name": "Uzun Bant Açış (Band Pull-Apart)",
    "category": "pull",
    "equipment": "resistance_band",
    "mechanic": "isolation",
    "isComplex": false,
    "muscle": "Arka Omuz, Orta Sırt (Rhomboid)",
    "primaryMuscles": [
      "shoulders",
      "back"
    ],
    "secondaryMuscles": [
      "traps"
    ],
    "primarySubMuscles": "Arka Omuz, Orta Sırt",
    "secondarySubMuscles": "Üst Trapez",
    "cue": "Uzun bandı omuz hizasında iki elle tut, kolları düz tutarak kürek kemiklerini birbirine sıkıştır.",
    "diagram": "assets/exercises/rb_pull_apart.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Ön Tutuş",
        "desc": "Kollar yere paralel ve omuz genişliğinde bandı kavramış."
      },
      {
        "badge": "action",
        "phase": "2. Göğüse Açış",
        "desc": "Omuzları yukarı kaldırmadan bandı göğüs hattına doğru iki yana aç."
      }
    ],
    "tags": [
      "pull",
      "rear_delt",
      "resistance_band"
    ],
    "weightKey": "",
    "fitCategory": "row",
    "fitName": "band_pull_apart",
    "fitNote": "Resistance Band Pull-Apart",
    "garminPrimaryMuscles": [
      "SHOULDERS",
      "BACK"
    ],
    "garminSecondaryMuscles": [
      "TRAPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "rb_lat_pulldown",
    "name": "Uzun Bant Üstten Çekiş (Band Pulldown)",
    "category": "pull",
    "equipment": "resistance_band",
    "mechanic": "compound",
    "isComplex": false,
    "muscle": "Kanat (Latissimus), Orta Sırt, Biceps",
    "primaryMuscles": [
      "lats",
      "back"
    ],
    "secondaryMuscles": [
      "biceps",
      "shoulders"
    ],
    "primarySubMuscles": "Kanat (Lat), Orta Sırt",
    "secondarySubMuscles": "Pazu (Biceps), Arka Omuz",
    "cue": "Bandı yüksek bir noktaya sabitle (veya tek diz üstünde çek), dirsekleri kalçana doğru çekerek kanadı sık.",
    "diagram": "assets/exercises/rb_lat_pulldown.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Yüksek Uzatma",
        "desc": "Kollar baş üstünde gergin, gövde dik."
      },
      {
        "badge": "action",
        "phase": "2. Dirsek İndirişi",
        "desc": "Omuzları aşağı bastırıp dirsekleri kaburgaya doğru çek."
      }
    ],
    "tags": [
      "pull",
      "lats",
      "resistance_band"
    ],
    "weightKey": "",
    "fitCategory": "pull_up",
    "fitName": "lat_pulldown",
    "fitNote": "Resistance Band Lat Pulldown",
    "garminPrimaryMuscles": [
      "LATS",
      "BACK"
    ],
    "garminSecondaryMuscles": [
      "BICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "rb_seated_row",
    "name": "Uzun Bant Oturarak Çekiş (Seated Row)",
    "category": "pull",
    "equipment": "resistance_band",
    "mechanic": "compound",
    "isComplex": false,
    "muscle": "Orta Sırt, Kanat, Biceps",
    "primaryMuscles": [
      "back",
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "shoulders"
    ],
    "primarySubMuscles": "Orta Sırt, Kanat (Lat)",
    "secondarySubMuscles": "Pazu (Biceps), Arka Omuz",
    "cue": "Yerde oturup bandı ayak tabanlarından geçir; sırtı dik tutup dirsekleri geriye çekerek kürek kemiklerini sık.",
    "diagram": "assets/exercises/rb_seated_row.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Dik Oturuş",
        "desc": "Bacaklar hafif bükülü, bant ayak tabanında gergin."
      },
      {
        "badge": "action",
        "phase": "2. Sırt Çekişi",
        "desc": "Beli yuvarlamadan bandı göbek hizasına çekip 1 sn tut."
      }
    ],
    "tags": [
      "pull",
      "back",
      "resistance_band"
    ],
    "weightKey": "",
    "fitCategory": "row",
    "fitName": "seated_row",
    "fitNote": "Resistance Band Seated Row",
    "garminPrimaryMuscles": [
      "BACK",
      "LATS"
    ],
    "garminSecondaryMuscles": [
      "BICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "rb_chest_press",
    "name": "Uzun Bant Göğüs İtiş (Band Chest Press)",
    "category": "push",
    "equipment": "resistance_band",
    "mechanic": "compound",
    "isComplex": false,
    "muscle": "Orta Göğüs, Ön Omuz, Triceps",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "primarySubMuscles": "Orta Göğüs, Üst Göğüs",
    "secondarySubMuscles": "Ön Omuz, Arka Kol Yan Baş",
    "cue": "Bandı sırtının arkasından geçirip iki elinle tut; göğüs hizasından ileri doğru güçlü itiş yap.",
    "diagram": "assets/exercises/rb_chest_press.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Sırt Destekli Kurulum",
        "desc": "Bant kürek kemiklerinin altından geçer, gövde hafif önde."
      },
      {
        "badge": "action",
        "phase": "2. İleri İtiş",
        "desc": "Dirsekleri hafif içeride tutarak kolları öne kilitle ve göğsü sık."
      }
    ],
    "tags": [
      "push",
      "chest",
      "resistance_band"
    ],
    "weightKey": "",
    "fitCategory": "bench_press",
    "fitName": "chest_press",
    "fitNote": "Resistance Band Chest Press",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "rb_bicep_curl",
    "name": "Uzun Bant Biceps Curl",
    "category": "pull",
    "equipment": "resistance_band",
    "mechanic": "isolation",
    "isComplex": false,
    "muscle": "Pazu (Biceps)",
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [
      "forearms"
    ],
    "primarySubMuscles": "Pazu (Biceps)",
    "secondarySubMuscles": "Ön Kol",
    "cue": "Bandın ortasına iki ayağınla bas, dirsekleri gövde yanında sabit tutup avuç içlerini omuza doğru bük.",
    "diagram": "assets/exercises/rb_bicep_curl.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Ayak Basışı",
        "desc": "Bant ayak altında gergin, dirsekler yanlarda sabit."
      },
      {
        "badge": "action",
        "phase": "2. Tepe Kasılma",
        "desc": "Bant gerilimi arttıkça kontrollü yukarı çek ve yavaşça indir."
      }
    ],
    "tags": [
      "arms",
      "biceps",
      "resistance_band"
    ],
    "weightKey": "",
    "fitCategory": "curl",
    "fitName": "bicep_curl",
    "fitNote": "Resistance Band Bicep Curl",
    "garminPrimaryMuscles": [
      "BICEPS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "rb_triceps_pushdown",
    "name": "Uzun Bant Triceps Pushdown",
    "category": "push",
    "equipment": "resistance_band",
    "mechanic": "isolation",
    "isComplex": false,
    "muscle": "Arka Kol (Triceps Yan & Uzun Baş)",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "primarySubMuscles": "Arka Kol Yan Baş, Arka Kol Uzun Baş",
    "secondarySubMuscles": [],
    "cue": "Bandı yüksek bir noktaya as, dirsekleri gövdeye kilitleyip ön kolları yere doğru tamamen aç.",
    "diagram": "assets/exercises/rb_triceps_pushdown.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Dirsek Kilidi",
        "desc": "Dirsekler 90° bükülü, üst kollar yere dik."
      },
      {
        "badge": "action",
        "phase": "2. Tam Açılış",
        "desc": "Yalnızca dirsekten hareketle bandı aşağı it ve triceps'i sık."
      }
    ],
    "tags": [
      "arms",
      "triceps",
      "resistance_band"
    ],
    "weightKey": "",
    "fitCategory": "triceps_extension",
    "fitName": "triceps_pushdown",
    "fitNote": "Resistance Band Triceps Pushdown",
    "garminPrimaryMuscles": [
      "TRICEPS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "id": "rb_good_morning",
    "name": "Uzun Bant Good Morning / RDL",
    "category": "legs_hinge",
    "equipment": "resistance_band",
    "mechanic": "compound",
    "isComplex": false,
    "muscle": "Arka Bacak (Hamstring), Ana Kalça, Alt Bel",
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "secondaryMuscles": [
      "lower_back",
      "core"
    ],
    "primarySubMuscles": "Arka Bacak, Ana Kalça",
    "secondarySubMuscles": "Alt Bel, Derin İç Karın",
    "cue": "Bandın altına iki ayağınla bas, diğer ucunu omuzlarına veya ellerine al; omurgayı düz tutup kalçayı geriye it.",
    "diagram": "assets/exercises/rb_good_morning.gif",
    "positions": [
      {
        "badge": "setup",
        "phase": "1. Dik Başlangıç",
        "desc": "Ayaklar omuz genişliğinde, dizler hafif kırık."
      },
      {
        "badge": "action",
        "phase": "2. Kalça Menteşesi",
        "desc": "Kalçayı geriye iterek eğil ve kalçayı sıkıp patlayıcı doğrul."
      }
    ],
    "tags": [
      "legs",
      "hamstrings",
      "glutes",
      "resistance_band"
    ],
    "weightKey": "",
    "fitCategory": "deadlift",
    "fitName": "good_morning",
    "fitNote": "Resistance Band Good Morning",
    "garminPrimaryMuscles": [
      "HAMSTRINGS",
      "GLUTES"
    ],
    "garminSecondaryMuscles": [
      "LOWER_BACK"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "push",
    "cue": "Kalçayı yukarıda sabitleyip gövdeyi aşağı eğimli açıya getir; dambılları alt göğüs hizasından it.",
    "diagram": "assets/exercises/db_glute_bridge_chest_press.gif",
    "equipment": "dumbbell",
    "id": "db_glute_bridge_chest_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Kalça Köprüsü Dambıl Presi",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yere sırtüstü uzan, dizler bükülü ve ayak tabanları yerde. Kalçayı tavana kaldırıp köprü pozisyonunu sabitle.",
        "phase": "1. Köprü Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Gövde aşağı eğimli açıdayken dirsekleri yere hafifçe değdirip dambılları alt göğüs hizasında tut.",
        "phase": "2. Kontrollü İniş"
      },
      {
        "badge": "finish",
        "desc": "Kalçayı düşürmeden dambılları alt göğsü sıkarak yukarı it ve tepe noktada kilitle.",
        "phase": "3. Alt Göğüs İtişi"
      }
    ],
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "secondaryMuscles": [
      "shoulders",
      "glutes"
    ],
    "tags": [
      "full_body",
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz, Ana Kalça",
    "biomechanicalProof": "Yerde kalça köprüsü kurulduğunda gövde aşağı eğimli açıya geçer; dambılları alt göğüs hizasına indirip itmek sehpa olmadan alt göğüs liflerini doğrudan hedefler.",
    "fitCategory": "bench_press",
    "fitName": "dumbbell_floor_press",
    "fitNote": "Kalça Köprüsü Dambıl Presi [id:db_glute_bridge_chest_press]",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "TRICEPS",
      "SHOULDERS",
      "GLUTES"
    ]
  },
  {
    "category": "push",
    "cue": "Makaraları baş üstü hizasına al, tutacakları öne ve hafif aşağı iterek alt göğsü sık.",
    "diagram": "assets/exercises/mach_decline_cable_press.gif",
    "equipment": "machine",
    "id": "mach_decline_cable_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Aşağı Açılı Kablo Göğüs Presi",
    "positions": [
      {
        "badge": "setup",
        "desc": "Makaraları baş üstü hizasına ayarla, sırtın kabloya dönük bir adım öne çıkıp tutacakları göğüs yanına al.",
        "phase": "1. Yüksek Kablo Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi hafif öne eğik sabitleyip tutacakları öne ve hafif aşağı doğru güçlüce it.",
        "phase": "2. Aşağı Açılı İtiş"
      },
      {
        "badge": "finish",
        "desc": "Eller alt göğüs önünde birleşirken kasları sık ve kablo gerginliğini bozmadan başlangıca dön.",
        "phase": "3. Tepe Sıkıştırma"
      }
    ],
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "full_body",
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz",
    "biomechanicalProof": "Yüksek makaradan öne ve aşağı doğru yapılan itiş, kablodaki kesintisiz direnci doğrudan alt göğüs liflerinin çekiş hattına hizalar.",
    "fitCategory": "bench_press",
    "fitName": "cable_chest_press",
    "fitNote": "Aşağı Açılı Kablo Göğüs Presi [id:mach_decline_cable_press]",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "TRICEPS",
      "SHOULDERS"
    ]
  },
  {
    "category": "push",
    "cue": "Tek makarayı en üste al, kolu aşağı ve gövde orta çizgisinin biraz ötesine çapraz kapat.",
    "diagram": "assets/exercises/mach_single_arm_decline_cable_fly.gif",
    "equipment": "machine",
    "id": "mach_single_arm_decline_cable_fly",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Alt Göğüs, Orta Göğüs",
    "name": "Tek Kol Yüksekten Aşağıya Kablo Çekişi",
    "positions": [
      {
        "badge": "setup",
        "desc": "Tek makarayı en üst seviyeye ayarla, tutacağı kavrayıp bir adım yana ve öne çık.",
        "phase": "1. Tek Kol Kablo Duruşu"
      },
      {
        "badge": "action",
        "desc": "Dirsekteki hafif sabit açıyı koruyarak kolu yukarıdan aşağı ve içe doğru yay çizerek çek.",
        "phase": "2. Aşağı Çapraz Çekiş"
      },
      {
        "badge": "finish",
        "desc": "El göbek-alt göğüs orta çizgisinin biraz ötesine geçtiğinde 1 saniye sık ve kontrollü aç.",
        "phase": "3. Orta Çizgi Sıkışması"
      }
    ],
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "shoulders",
      "core"
    ],
    "tags": [
      "upper_push",
      "upper"
    ],
    "weightKey": "",
    "primarySubMuscles": "Alt Göğüs, Orta Göğüs",
    "secondarySubMuscles": "Ön Omuz, Yan Karın",
    "biomechanicalProof": "Tek kolla yukarıdan aşağıya orta çizgiyi geçecek şekilde yapılan çekiş, alt ve iç göğüs liflerinde maksimum kısalma sağlar.",
    "fitCategory": "fly",
    "fitName": "cable_crossover",
    "fitNote": "Tek Kol Yüksekten Aşağıya Kablo Çekişi [id:mach_single_arm_decline_cable_fly]",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "ABS"
    ]
  },
  {
    "category": "push",
    "cue": "Koltuğu tutacaklar alt göğüs hizasına gelecek şekilde ayarla ve omuzları geride tutarak ileri it.",
    "diagram": "assets/exercises/mach_decline_chest_press.gif",
    "equipment": "machine",
    "id": "mach_decline_chest_press",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "name": "Makinede Aşağı İtiş (Decline Chest Press)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Koltuğu tutacaklar göğsün alt çizgisine denk gelecek yükseklikte ayarla, sırtı ve kürek kemiklerini mindere yasla.",
        "phase": "1. Makine Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Nefes vererek kolları öne ve hafif aşağı açıda güçlüce it, omuzları öne düşürme.",
        "phase": "2. Kontrollü Aşağı İtiş"
      },
      {
        "badge": "finish",
        "desc": "Dirsekleri tamamen kilitlemeden alt göğsü sık ve ağırlığı çarptırmadan başlangıca indir.",
        "phase": "3. Tam Kasılma & Dönüş"
      }
    ],
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "secondaryMuscles": [
      "shoulders"
    ],
    "tags": [
      "full_body",
      "upper_push",
      "upper"
    ],
    "weightKey": "press",
    "primarySubMuscles": "Alt Göğüs, Arka Kol Dış Baş, Arka Kol Alt Baş",
    "secondarySubMuscles": "Orta Göğüs, Ön Omuz",
    "biomechanicalProof": "Makine rayının sabit aşağı açılı itiş yolu, denge ihtiyacını ortadan kaldırarak alt göğse yüksek mekanik gerilim yükler.",
    "fitCategory": "bench_press",
    "fitName": "leverage_decline_chest_press",
    "fitNote": "Makinede Aşağı İtiş [id:mach_decline_chest_press]",
    "garminPrimaryMuscles": [
      "CHEST"
    ],
    "garminSecondaryMuscles": [
      "TRICEPS",
      "SHOULDERS"
    ]
  },
  {
    "category": "core",
    "cue": "Beli yere tam yapıştır, zıt kol ve bacağı yere değdirmeden kontrollü açıp kapat.",
    "diagram": "assets/opengym/stills/0276.webp",
    "equipment": "bodyweight",
    "id": "bw_dead_bug",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Derin İç Karın, Ön Karın",
    "name": "Dead Bug",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, kolları tavana uzat ve dizleri 90 derece bükerek havada tut.",
        "phase": "1. Başlangıç Duruşu"
      },
      {
        "badge": "action",
        "desc": "Beli yerden kaldırmadan sağ kolu geriye, sol bacağı öne doğru yere paralel uzat.",
        "phase": "2. Çapraz Uzatma"
      },
      {
        "badge": "finish",
        "desc": "Nefes vererek merkeze dön ve diğer çaprazla tekrarla.",
        "phase": "3. Merkeze Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Ön Karın",
    "secondarySubMuscles": "Yan Karın",
    "biomechanicalProof": "Uzuvlar yere yaklaşırken bel boşluğunu sıfırda tutmak, omurgayı koruyan derin karın kaslarını doğrudan çalıştırır.",
    "fitCategory": "crunch",
    "fitName": "dead_bug",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Omuzları yerden kaldır, zıt dirseği dize götürürken diğer bacağı düz uzat.",
    "diagram": "assets/opengym/stills/0443.webp",
    "equipment": "bodyweight",
    "id": "bw_bicycle_crunch",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Karın, Ön Karın",
    "name": "Bicycle Crunch (Bisiklet Mekik)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, eller başın arkasında hafifçe dursun, bacakları yerden kes.",
        "phase": "1. Hazır Pozisyon"
      },
      {
        "badge": "action",
        "desc": "Sağ dirseği sol dize yaklaştırırken sağ bacağı öne düz uzat.",
        "phase": "2. Çapraz Dönüş"
      },
      {
        "badge": "finish",
        "desc": "Boynu çekmeden akıcı bisiklet ritmiyle diğer tarafa dön.",
        "phase": "3. Akıcı Değişim"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "bodyweight"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Gövde rotasyonu ile bacak pedalını birleştirmek hem ön karnı hem yan karın kaslarını aynı anda yüksek gerilime sokar.",
    "fitCategory": "crunch",
    "fitName": "bicycle_crunch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Dizleri göğse çekerken kalçayı yerden hafifçe yuvarlayıp alt karnı sık.",
    "diagram": "assets/opengym/stills/0872.webp",
    "equipment": "bodyweight",
    "id": "bw_reverse_crunch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "Reverse Crunch (Ters Mekik)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, elleri iki yanda yere sabitle, dizleri 90 derece kaldır.",
        "phase": "1. Kalça Sabitleme"
      },
      {
        "badge": "action",
        "desc": "Dizleri göğse doğru çekip kuyruk sokumunu yerden hafifçe kaldır.",
        "phase": "2. Alt Karın Sıkışması"
      },
      {
        "badge": "finish",
        "desc": "Hızla bırakmadan kalçayı ve bacakları kontrollü başlangıca indir.",
        "phase": "3. Kontrollü İniş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "bodyweight"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Karın",
    "biomechanicalProof": "Leğen kemiğini göğse doğru yuvarlamak, alt karın bölgesini bacak savurmadan doğrudan izole eder.",
    "fitCategory": "crunch",
    "fitName": "reverse_crunch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Boynu çekmeden sadece kürek kemiklerini yerden sıyırıp üst karnı sık.",
    "diagram": "assets/opengym/stills/0274.webp",
    "equipment": "bodyweight",
    "id": "bw_crunch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın",
    "name": "Abdominal Crunch (Klasik Mekik)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, dizler bükülü, ayaklar yerde; eller göğüste veya şakaklarda.",
        "phase": "1. Mat Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Nefes vererek kaburgaları kalçaya yaklaştır ve kürek kemiklerini yerden kaldır.",
        "phase": "2. Üst Karın Kasılması"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada kısa bekle, beli vurmadan yavaşça başlangıca in.",
        "phase": "3. Kontrollü Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "bodyweight"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Bel yerdeyken göğüs kafesini öne bükmek, üst karın liflerini eklem yükü olmadan izole eder.",
    "fitCategory": "crunch",
    "fitName": "crunch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Omuzlar hafif kalkıkken gövdeyi yana bükerek sırayla topuklara dokun.",
    "diagram": "assets/opengym/stills/0006.webp",
    "equipment": "bodyweight",
    "id": "bw_heel_touches",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Yan Karın, Ön Karın",
    "name": "Heel Touches (Topuk Dokunuşu)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dizler bükülü sırtüstü yat, kolları iki yana uzat ve omuzları hafifçe kaldır.",
        "phase": "1. Başlangıç Gerilimi"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi sağa bükerek sağ elinle sağ topuğuna uzanıp dokun.",
        "phase": "2. Yanal Sıkıştırma"
      },
      {
        "badge": "finish",
        "desc": "Omuzları yere indirmeden sol tarafa bükülüp sol topuğa dokun.",
        "phase": "3. Çift Yönlü Akış"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "bodyweight"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Üst gövde havadayken yana eğilmek, yan karın kaslarını doğrudan sıkıştırır.",
    "fitCategory": "crunch",
    "fitName": "heel_touches",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Yan dirsek üzerinde kalçayı yukarı iterek baştan topuğa düz bir hat koru.",
    "diagram": "assets/opengym/stills/0705.webp",
    "equipment": "bodyweight",
    "id": "bw_side_plank",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Yan Karın, Derin İç Karın",
    "name": "Side Plank (Yan Plank)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yan yat, alt dirseği omuzun tam altına yerleştir ve ayakları üst üste koy.",
        "phase": "1. Yan Dirsek Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı yerden kaldırıp gövdeyi düz bir çizgiye getir.",
        "phase": "2. Yan Çizgi Kilidi"
      },
      {
        "badge": "finish",
        "desc": "Kalçayı düşürmeden yan karnı sıkılı tutup nefesle süreyi tamamla.",
        "phase": "3. Statik Yan Direnç"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "glutes"
    ],
    "tags": [
      "core",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Kalça, Yan Omuz",
    "biomechanicalProof": "Yerçekimine karşı yan gövdeyi sabit tutmak, yan karın ve omurga yan destek kaslarını izometrik olarak güçlendirir.",
    "fitCategory": "plank",
    "fitName": "side_plank",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "GLUTES",
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Düz kollar ve düz bacakları aynı anda yukarı kaldırıp ortada V harfi oluştur.",
    "diagram": "assets/opengym/stills/0507.webp",
    "equipment": "bodyweight",
    "id": "bw_v_up",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "V-Up (Çakı)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü tamamen düz uzan, kolları baş gerisine aç.",
        "phase": "1. Açık Vücut Duruşu"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi ve düz bacakları eşzamanlı kaldırarak elleri ayak uçlarına uzat.",
        "phase": "2. Zirvede V Kapanışı"
      },
      {
        "badge": "finish",
        "desc": "Kontrolü kaybetmeden yavaşça açılıp başlangıç pozisyonuna in.",
        "phase": "3. Kontrollü Açılış"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Orta Ön Bacak",
    "biomechanicalProof": "Üst gövde ve bacakların aynı anda kapanması, tüm ön karın duvarını en yüksek kaldıraçla çalıştırır.",
    "fitCategory": "sit_up",
    "fitName": "v_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Dizler bükülü sırtüstü yatarken elleri ileri uzatıp diz kapaklarına dokunarak üst karnı sık.",
    "diagram": "assets/opengym/stills/3640.webp",
    "equipment": "bodyweight",
    "id": "bw_knee_touch_crunch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın",
    "name": "Knee Touch Crunch (Dize Dokunarak Mekik)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dizler bükülü ve ayaklar yerde sırtüstü yat, avuç içlerini uylukların üzerine koy.",
        "phase": "1. Başlangıç Duruşu"
      },
      {
        "badge": "action",
        "desc": "Nefes vererek ellerini bacakların üzerinden kaydırıp diz kapaklarına dokun.",
        "phase": "2. Dize Uzanma"
      },
      {
        "badge": "finish",
        "desc": "Tepe noktada kısa sıkıştır, boynu zorlamadan kontrollü in.",
        "phase": "3. Kontrollü Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "bodyweight"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Ellerin dizlere kadar kaydırılması üst karın kasılma mesafesini sabitler ve boyun çekmesini önler.",
    "fitCategory": "crunch",
    "fitName": "knee_touch_crunch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Dizler 90 derece havada sabitken kürek kemiklerini yerden kaldırıp üst karnı sık.",
    "diagram": "assets/opengym/stills/0871.webp",
    "equipment": "bodyweight",
    "id": "bw_tuck_crunch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "Tuck Crunch (Dizler Havada Mekik)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, dizleri 90 derece büküp havada tut, eller göğüste veya şakaklarda.",
        "phase": "1. Masa Pozisyonu"
      },
      {
        "badge": "action",
        "desc": "Nefes vererek göğsü dizlere yaklaştırıp üst ve alt karnı aynı anda sık.",
        "phase": "2. Merkez Sıkışması"
      },
      {
        "badge": "finish",
        "desc": "Bacakları indirmeden omuzları yavaşça başlangıca yaklaştır.",
        "phase": "3. Kontrollü Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "bodyweight"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Karın",
    "biomechanicalProof": "Bacakları yerden kesip masa pozisyonunda mekik çekmek, kalça fleksörlerini devreden çıkarıp ön karnı doğrudan zorlar.",
    "fitCategory": "crunch",
    "fitName": "tuck_crunch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Bir ayak diğer dizin üstündeyken zıt dirseği yukarıdaki dize doğru çapraz çevir.",
    "diagram": "assets/opengym/stills/0262.webp",
    "equipment": "bodyweight",
    "id": "bw_cross_body_crunch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Yan Karın, Ön Karın",
    "name": "Cross-Body Crunch (Çapraz Mekik)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, sağ ayak bileğini sol dizin üstüne koy, sol el baş arkasında.",
        "phase": "1. Çapraz Kurulum"
      },
      {
        "badge": "action",
        "desc": "Sol omuzu yerden kaldırıp sol dirseği sağ dize doğru çevir.",
        "phase": "2. Yan Karın Sıkışması"
      },
      {
        "badge": "finish",
        "desc": "Kontrollü biçimde in, set bitiminde diğer tarafa geç.",
        "phase": "3. Kontrollü Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "bodyweight"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Sabit bacak düzeninde çapraz omuz rotasyonu yapmak, yan karın kaslarını ivmesiz izole eder.",
    "fitCategory": "crunch",
    "fitName": "cross_body_crunch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Eller kalça yanında yerde, bitişik düz bacakları ortadaki noktanın bir sağından bir solundan aşır.",
    "diagram": "assets/opengym/stills/bw_seated_leg_overs.webp",
    "equipment": "bodyweight",
    "id": "bw_seated_leg_overs",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Karın, Yan Karın",
    "name": "Seated Leg Overs (Oturarak Bacak Aşırma)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yerde hafif geriye yaslanıp elleri kalça yanına koy, düz bacakları bitişik tut.",
        "phase": "1. Oturma Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Bacakları yerden kesip ortadaki hayali bir engelin üzerinden sağa doğru yay çizerek geçir.",
        "phase": "2. Sağdan Aşırma"
      },
      {
        "badge": "finish",
        "desc": "Ayakları yere değdirmeden aynı yayla sola doğru aşırarak alt ve yan karnı sık.",
        "phase": "3. Soldan Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Yan Karın",
    "secondarySubMuscles": "Derin İç Karın, Orta Ön Bacak",
    "biomechanicalProof": "Oturur pozisyonda düz bacakları sağa sola yay çizerek aşırmak alt karın, yan karın ve kalça fleksörlerini yüksek gerilimde çalıştırır.",
    "fitCategory": "leg_raise",
    "fitName": "seated_leg_overs",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Eller arkada destekliyken bitişik dizleri bir sağa bir sola çevirerek göğse çek.",
    "diagram": "assets/opengym/stills/bw_seated_oblique_knee_tucks.webp",
    "equipment": "bodyweight",
    "id": "bw_seated_oblique_knee_tucks",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Karın, Ön Karın",
    "name": "Seated Oblique Knee Tucks (Oturarak Yana Diz Çekme)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Kalça gerisinde ellerden destek alarak otur, ayakları bitişik şekilde yerden kaldır.",
        "phase": "1. Başlangıç Dengesi"
      },
      {
        "badge": "action",
        "desc": "Kalçayı hafif yana yatırıp bitişik dizleri sağ omza doğru göğse çek.",
        "phase": "2. Sağ Yana Diz Çekişi"
      },
      {
        "badge": "finish",
        "desc": "Bacakları ileri uzatıp hemen sol tarafa çevirerek aynı çekişi tekrarla.",
        "phase": "3. Sol Yana Geçiş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "bodyweight",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Otururken bitişik dizleri sağa ve sola döndürerek karna çekmek, yan karın ve alt karın kaslarını aynı anda sıkıştırır.",
    "fitCategory": "crunch",
    "fitName": "seated_oblique_knee_tucks",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Sırtüstü yatışta ayakları yerden kes, dambıllarla ters kol ve ters bacağı belini yerden kaldırmadan uzat.",
    "diagram": "assets/opengym/stills/db_dead_bug.webp",
    "equipment": "dumbbell",
    "id": "db_dead_bug",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "Dumbbell Dead Bug (Dambıl Dead Bug)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, iki elde birer dambıl göğüs üzerinde ve dizler 90 derece havada sabit.",
        "phase": "1. Masa Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Belini mattan kaldırmadan sağ kolu dambılla baş arkasına uzatırken sol bacağı ileri düz aç.",
        "phase": "2. Ters Kol & Bacak Açılışı"
      },
      {
        "badge": "finish",
        "desc": "Karın merkezini sıkarak başlangıca dön ve hemen diğer kol ile bacağa geç.",
        "phase": "3. Kontrollü Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Karın",
    "biomechanicalProof": "Sırtüstü bel yeri kavrarken iki eldeki dambıllarla ters kol ve bacak açmak, omurgayı sabit tutmak için derin iç karın ve ön karın kaslarını sürekli gerilimde çalıştırır.",
    "fitCategory": "crunch",
    "fitName": "dumbbell_dead_bug",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Dizler bükülü yatıştan tek dambılı düz kollarla yukarı tutarak kalk ve gövdeyi sırayla sağa sola çevir.",
    "diagram": "assets/opengym/stills/4251.webp",
    "equipment": "dumbbell",
    "id": "db_alternating_twist_situp",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Yan Karın, Ön Karın",
    "name": "Alternating Twist Sit-Up (Dambıllı Döner Mekik)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Dizler bükülü sırtüstü yat, tek dambılı iki elinle göğüs hizasında düz kollarla tut.",
        "phase": "1. Başlangıç Yatışı"
      },
      {
        "badge": "action",
        "desc": "Gövdeyi yukarı kaldırırken dambılı sağa doğru çevirerek yan karın kaslarını sık.",
        "phase": "2. Kalkış & Dönüş"
      },
      {
        "badge": "finish",
        "desc": "Kontrollü biçimde yere inip sonraki tekrarda gövdeyi sol tarafa çevirerek kalk.",
        "phase": "3. Ters Yana Geçiş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Düz kollarla tutulan dambılı kalkış anında sağa ve sola döndürmek, ön karın fleksiyonu ile yan karın rotasyonunu aynı anda yüksek dirençte birleştirir.",
    "fitCategory": "sit_up",
    "fitName": "dumbbell_alternating_twist_sit_up",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "OBLIQUES",
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Dizler havada ayı duruşunda dambılı alttan karşıya çek, ardından ayaklarla geriye plank adım at.",
    "diagram": "assets/opengym/stills/db_bear_plank_pull_walkout.webp",
    "equipment": "dumbbell",
    "id": "db_bear_plank_pull_walkout",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Derin İç Karın, Yan Karın, Ön Karın",
    "name": "Bear Plank DB Pull-Through Walk-Out (Ayı Duruşu Dambıl Çekiş & Adımlama)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Eller omuz altında, dizler yerden 3-5 cm havada ayı duruşuna geç; dambıl gövdenin yanında.",
        "phase": "1. Asılı Ayı Duruşu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı sallamadan karşı elinle dambılı gövde altından diğer yana çek ve eli yere sabitle.",
        "phase": "2. Dambıl Altından Çekiş"
      },
      {
        "badge": "finish",
        "desc": "Ayakları sırayla geriye uzatarak düz planka açıl ve tekrar dizleri öne toplayıp ayı duruşuna dön.",
        "phase": "3. Plank Adımlama & Dönüş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "quads"
    ],
    "tags": [
      "core",
      "conditioning",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Yan Karın, Ön Karın",
    "secondarySubMuscles": "Ön Omuz, Orta Ön Bacak",
    "biomechanicalProof": "Asılı ayı duruşunda dambılı alttan çekip ardından düz planka adım atmak, anti-rotasyon ve anti-ekstansiyon yükünü kesintisiz birleştirir.",
    "fitCategory": "core",
    "fitName": "bear_plank_db_pull_through_walk_out",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "OBLIQUES"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Bir diz bükülü yerde sabitken tek eldeki dambılla düz kalkan karşı ayak parmak ucuna uzan.",
    "diagram": "assets/opengym/stills/db_single_arm_straight_leg_toe_touch.webp",
    "equipment": "dumbbell",
    "id": "db_single_arm_straight_leg_toe_touch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın, Yan Karın",
    "name": "Single-Arm Dumbbell Straight-Leg Toe Touch (Tek Kol Dambıl Tek Düz Bacak Uzanış)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, bir bacağı dizden büküp yere bas; diğer bacak düz, karşı elde dambıl yukarıda.",
        "phase": "1. Tek Bacak Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Düz bacağı yukarı kaldırırken tek eldeki dambılı karşı ayak ucuna doğru çapraz uzat.",
        "phase": "2. Çapraz Ayak Ucuna Dokunuş"
      },
      {
        "badge": "finish",
        "desc": "Belin kontrolünü bozmadan yavaşça başlangıca in ve set bitiminde diğer tarafa geç.",
        "phase": "3. Kontrollü İniş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Yan Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Tek taraflı dambıl yüküyle karşı düz bacağa çapraz kalkış yapmak, ön karın ve yan karın kaslarında yüksek asimetrik gerilim oluşturur.",
    "fitCategory": "crunch",
    "fitName": "single_arm_dumbbell_straight_leg_toe_touch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "OBLIQUES"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Sırtüstü düz yatıştan tek eldeki dambılı ve karşı düz bacağı aynı anda kaldırıp çaprazda buluştur.",
    "diagram": "assets/opengym/stills/db_cross_toe_touch.webp",
    "equipment": "dumbbell",
    "id": "db_cross_toe_touch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Yan Karın, Ön Karın",
    "name": "Cross Toe Touch (Tek El Dambıl Çapraz Ayak Ucu Uzanış)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü düz uzan, bir elde dambıl yukarıda sabit, diğer kol dengede ve bacaklar düz.",
        "phase": "1. Düz Yatış Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Dambılı tutan kolu ve karşı düz bacağı aynı anda yerden kesip çaprazda ayak ucuna dokun.",
        "phase": "2. Çapraz V-Kalkış"
      },
      {
        "badge": "finish",
        "desc": "Yere çarpmadan yavaşça uzanıp bir sonraki tekrara geç.",
        "phase": "3. Kontrollü Açılış"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Yan Karın, Ön Karın",
    "secondarySubMuscles": "Derin İç Karın",
    "biomechanicalProof": "Düz bacak ve tek el dambılın gövde merkezini çapraz keserek buluşması, oblik liflerini ve alt-üst ön karnı güçlü şekilde kasar.",
    "fitCategory": "crunch",
    "fitName": "dumbbell_cross_toe_touch",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "OBLIQUES",
      "ABS"
    ],
    "garminSecondaryMuscles": [],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "İki eldeki dambılı tavana doğru sabit tut; düz bacakları belini yerden kaldırmadan yere indirip kaldır.",
    "diagram": "assets/opengym/stills/db_toe_touch_crunch.webp",
    "equipment": "dumbbell",
    "id": "db_toe_touch_crunch",
    "isComplex": false,
    "mechanic": "isolation",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "Dumbbell Toe Touch Crunch (Dambıllar Havada Sabit Bacak İndirme)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, iki eldeki dambılları düz kollarla yukarıda sabitle ve bacakları dik konuma getir.",
        "phase": "1. Havada Dambıl Sabitleme"
      },
      {
        "badge": "action",
        "desc": "Kolları hiç oynatmadan belini yere bastırıp düz bacakları kontrollü biçimde yere yaklaştır.",
        "phase": "2. Kontrollü Bacak İndirme"
      },
      {
        "badge": "finish",
        "desc": "Topukları yere değdirmeden karın gücüyle bacakları tekrar başlangıç noktasına çek.",
        "phase": "3. Yukarı Çekiş"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Karın, Orta Ön Bacak",
    "biomechanicalProof": "Üst gövde dambıllarla sabitlenirken bacakları indirip kaldırmak, leğen kemiğini dengelemek için alt karın ve derin iç karın kaslarını yoğun çalıştırır.",
    "fitCategory": "leg_raise",
    "fitName": "dumbbell_hold_leg_raise",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Düz plank pozisyonunda kalçayı hiç oynatmadan dambılı gövdenin altından karşı tarafa geçir.",
    "diagram": "assets/opengym/stills/5497.webp",
    "equipment": "dumbbell",
    "id": "db_plank_pass_through",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Derin İç Karın, Yan Karın, Ön Karın",
    "name": "Dumbbell Plank Pass-Through (Plank Altından Dambıl Geçişi)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Yüksek plank pozisyonuna geç, ayakları omuz genişliğinden biraz açık tut; dambıl bir elin yanında.",
        "phase": "1. Yüksek Plank Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Kalçayı döndürmeden karşı elinle gövde altından uzanıp dambılı diğer tarafa çek ve bırak.",
        "phase": "2. Gövde Altı Geçiş"
      },
      {
        "badge": "finish",
        "desc": "Eli yere sabitleyip hemen diğer elinle dambılı başlangıç yönüne geri çek.",
        "phase": "3. Zıt Yöne Tekrar"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "shoulders",
      "triceps"
    ],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Derin İç Karın, Yan Karın, Ön Karın",
    "secondarySubMuscles": "Ön Omuz, Arka Kol Alt Baş",
    "biomechanicalProof": "Üç destek noktası üzerinde ağırlığı yatay taşımak, gövde rotasyonunu frenleyen yan karın ve derin iç karın kaslarını maksimum seviyede devreye sokar.",
    "fitCategory": "core",
    "fitName": "dumbbell_plank_pass_through",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS",
      "OBLIQUES"
    ],
    "garminSecondaryMuscles": [
      "SHOULDERS",
      "TRICEPS"
    ],
    "garminMatchType": "exact_verified"
  },
  {
    "category": "core",
    "cue": "Sırtüstü uzanıp dambılı iki elle tut; kolları baş arkasına, bacakları ileri açıp ortada ayak ucunda buluş.",
    "diagram": "assets/opengym/stills/db_jackknife_toe_reach.webp",
    "equipment": "dumbbell",
    "id": "db_jackknife_toe_reach",
    "isComplex": false,
    "mechanic": "compound",
    "muscle": "Ön Karın, Derin İç Karın",
    "name": "Dumbbell Jackknife Toe Reach (Dambıl Jackknife / Dinamik Ayak Ucu Crunch)",
    "positions": [
      {
        "badge": "setup",
        "desc": "Sırtüstü yat, iki elle tek dambılı baş arkasına uzatırken düz bacakları yerden hafif kaldır.",
        "phase": "1. Açık V Kurulumu"
      },
      {
        "badge": "action",
        "desc": "Omuzları ve düz bacakları aynı anda yukarı kaldırarak dambılı ayak parmak uçlarına doğru uzat.",
        "phase": "2. Ortada Kapanış"
      },
      {
        "badge": "finish",
        "desc": "Bel kontrolünü koruyarak kolları baş arkasına, bacakları ileri yavaşça geri aç.",
        "phase": "3. Kontrollü Açılış"
      }
    ],
    "primaryMuscles": [
      "core"
    ],
    "secondaryMuscles": [
      "quads"
    ],
    "tags": [
      "core",
      "functional_fitness"
    ],
    "weightKey": "",
    "primarySubMuscles": "Ön Karın, Derin İç Karın",
    "secondarySubMuscles": "Yan Karın, Orta Ön Bacak",
    "biomechanicalProof": "Açık vücut pozisyonundan kol ve bacakların ağırlıkla merkezde buluşması, üst ve alt ön karın liflerini tam hareket açıklığında kasar.",
    "fitCategory": "sit_up",
    "fitName": "dumbbell_jackknife_toe_reach",
    "fitNote": "",
    "garminPrimaryMuscles": [
      "ABS"
    ],
    "garminSecondaryMuscles": [
      "HIPS"
    ],
    "garminMatchType": "exact_verified"
  }
];
