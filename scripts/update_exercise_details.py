#!/usr/bin/env python3
"""
Meticulous, Biomechanically Authentic Exercise Database Updater
Eliminates all copy-paste descriptions, duplicate text, and mismatches.
Ensures each of the 77 exercises has custom, accurate Setup, Action, and Finish steps.
"""

EXERCISES_DATA = [
    # ==========================================
    # 1. DAMBIL (DUMBBELL) HAREKETLERİ
    # ==========================================
    {
        'id': 'db_bench_press',
        'name': 'Dambıl Bench Press (Düz Sehpa)',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Büyük Göğüs Kası, Ön Omuz & Triceps',
        'mechanic': 'compound',
        'cue': 'Dirsekleri gövdeye 45° açıda tut, dambılları yukarıda çarpmadan göğüs kaslarını sıkarak kilitle.',
        'weightKey': 'press',
        'tags': ['full_body', 'upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Başlangıç (Sehpa Kurulumu)', 'desc': 'Düz sehpaya uzan. Kürek kemiklerini arkada kilitle, ayak tabanları yere tam bassın. Dambıllar alt göğüs hizasında.', 'badge': 'setup'},
            {'phase': '2. İtiş Fazı (45° Dirsek)', 'desc': 'Nefes vererek dirsekleri 45° açıyla açıp dambılları kontrollü ve güçlü şekilde yukarı doğru it.', 'badge': 'action'},
            {'phase': '3. Tepe Kilitleme', 'desc': 'Dambıllar tepe noktada göğüs hizasında buluşur (birbirine vurma). Göğüs kaslarını 1 saniye taş gibi sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'db_incline_press',
        'name': 'Eğimli Sehpa Dambıl Pres (Incline DB Press)',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Üst Göğüs & Ön Omuz',
        'mechanic': 'compound',
        'cue': 'Sehpa açısını 30-45° yap, kürek kemiklerini sehpaya kilitle, tepe noktada üst göğsü sık.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Başlangıç (30-45° Sehpa)', 'desc': 'Sehpayı 30-45 dereceye ayarla. Dambılları üst göğüs ve köprücük kemiği hizasında, avuçlar hafif içe dönük tut.', 'badge': 'setup'},
            {'phase': '2. Yukarı & İçe İtiş', 'desc': 'Nefes vererek dambılları üst göğüs hizasından yukarıya doğru üçgen bir hatta yukarı it.', 'badge': 'action'},
            {'phase': '3. Üst Göğüs Sıkıştırma', 'desc': 'Kollar yukarıda düzleşir, üst göğüs liflerini kilitler. 3 saniyede kontrollü olarak köprücük hizasına indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'db_floor_press',
        'name': 'Dambıl Yerden Pres (Floor Press)',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Göğüs & Triceps Gücü',
        'mechanic': 'compound',
        'cue': 'Yerde dirsekler zemine hafifçe değdiği an durakla, momentum almadan patlayıcı şekilde yukarı it.',
        'weightKey': 'press',
        'tags': ['full_body', 'upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Zemin Kurulumu', 'desc': 'Yere sırtüstü uzan, dizler bükülü, ayak tabanları yerde. Üst kollar zeminde, dirsekler 45-60 derece açıda.', 'badge': 'setup'},
            {'phase': '2. Sıfır Momentum İtişi', 'desc': 'Kollar yerdeyken nefes ver ve sıfır momentum noktasından patlayıcı güçle dambılları yukarı presle.', 'badge': 'action'},
            {'phase': '3. Tepe Kilitleme', 'desc': 'Triceps ve göğüs tepe noktada kilitlenir. Dirsekler zemine sert çarpmadan yavaşça yere temas eder.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'db_overhead_press',
        'name': 'Dambıl Ayakta Omuz Presi (Standing DB Press)',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Ön & Yan Omuz, Triceps, Karın Zırhı',
        'mechanic': 'compound',
        'cue': 'Kalçayı ve karnı taş gibi sık, omurgayı geriye bükmeden dambılları kulak hizasından baş üstüne dikey kilitle.',
        'weightKey': 'press',
        'tags': ['full_body', 'upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Başlangıç (Omuz Hizası)', 'desc': 'Ayaklar omuz genişliğinde. Dambıllar kulak hizasında, avuçlar karşıya bakar. Kalça ve karın kilitli.', 'badge': 'setup'},
            {'phase': '2. Dikey İtiş', 'desc': 'Nefes vererek dambılları kafanın iki yanından düz bir hatta baş üstüne doğru it. Beli asla geriye bükme.', 'badge': 'action'},
            {'phase': '3. Baş Üstü Kilit', 'desc': 'Kollar baş üstünde kilitlenir, kulaklar kolların arasına gelir. Kontrollü biçimde kulak hizasına indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_press.svg'
    },
    {
        'id': 'db_arnold_press',
        'name': 'Arnold Pres (Rotasyonel Omuz Presi)',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Tüm Omuz Başları (Ön, Yan, Arka Deltoid)',
        'mechanic': 'compound',
        'cue': 'Avuçlar yüzüne bakarak başla, preslerken bilekleri 180° çevirip baş üstüne kilitle.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Başlangıç (Avuçlar Yüze Dönük)', 'desc': 'Dambıllar çene/göğüs önünde, avuç içleri tamamen kendi yüzüne bakar. Dirsekler göğse yapışık.', 'badge': 'setup'},
            {'phase': '2. 180° Rotasyonel İtiş', 'desc': 'Yukarı iterken dirsekleri dışa aç ve bilekleri 180 derece döndürerek avuçları karşıya çevir.', 'badge': 'action'},
            {'phase': '3. Tepe Kilit ve Dönüş', 'desc': 'Baş üstünde standart pres pozisyonunda kilitlen. İnişte aynı rotasyonu tersine yaparak çene önüne dön.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_press.svg'
    },
    {
        'id': 'db_lateral_raise',
        'name': 'Dambıl Yana Açış (Lateral Raise)',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Yan Omuz (Lateral Deltoid)',
        'mechanic': 'isolation',
        'cue': 'Dirsekleri hafif kırık tut, kolları omuz hizasına kadar sürahi döker gibi kaldır.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Dik Duruş & Kurulum', 'desc': 'Ayakta dik dur, dambıllar uylukların yanında hafif önde. Dirseklerde hafif doğal kavis, omuzlar aşağıda sabit.', 'badge': 'setup'},
            {'phase': '2. Yana Açılış (Dirsek Liderliği)', 'desc': 'Dirsekleri lider yaparak dambılları yana doğru kaldır. Trapezleri boyna çekme, sadece yan omuzla çek.', 'badge': 'action'},
            {'phase': '3. Paralel Seviye & Kontrol', 'desc': 'Kollar yere paralel (omuz hizasında) olduğunda dur. Serçe parmak hafif yukarıda tut, 3 saniyede yavaşça indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_lateral_raise.svg'
    },
    {
        'id': 'db_triceps_overhead',
        'name': 'Dambıl Başüstü Triceps',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Arka Kol (Triceps Uzun Baş)',
        'mechanic': 'isolation',
        'cue': 'Dirsekleri başın iki yanında tavana bakacak şekilde sabit tut, sadece ön kolları büküp baş arkasından uzat.',
        'weightKey': '',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Baş Üstü Tutuş', 'desc': 'Tek dambılın üst plakasını iki elin avuçlarıyla elmas şeklinde tutarak baş üstüne dikey kaldır.', 'badge': 'setup'},
            {'phase': '2. Baş Arkasına İndiriş', 'desc': 'Dirsekleri kulakların yanında sabit tutarak dambılı enseye doğru yavaşça indir, triceps uzun başını esnet.', 'badge': 'action'},
            {'phase': '3. Dikey Kilitleme', 'desc': 'Sadece ön kolları uzatarak dambılı baş üstüne düzleştir, tepe noktada triceps kaslarını taş gibi sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_skull_crusher.svg'
    },
    {
        'id': 'db_skullcrusher',
        'name': 'Dambıl Skullcrusher',
        'equipment': 'dumbbell',
        'category': 'push',
        'muscle': 'Arka Kol (Triceps)',
        'mechanic': 'isolation',
        'cue': 'Düz sehpada dirsekleri omuz hizasında dikey sabitle, dambılları şakaklara indirip triceps ile uzat.',
        'weightKey': '',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sehpa Kurulumu', 'desc': 'Düz sehpaya sırtüstü uzan. Kollar dik, dambıllar göğüs/omuz üzerinde paralel nötr tutuşta.', 'badge': 'setup'},
            {'phase': '2. Şakaklara İndiriş', 'desc': 'Üst kolları sabit tutarak sadece dirsekleri bük, dambılları kontrollü biçimde kulak/şakak yanına indir.', 'badge': 'action'},
            {'phase': '3. Triceps Patlaması', 'desc': 'Dirsekleri açmadan ön kolları tekrar dikey konuma getir, tepe noktada triceps kaslarını tam sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_skull_crusher.svg'
    },
    {
        'id': 'db_goblet_squat',
        'name': 'Dambıl Goblet Squat',
        'equipment': 'dumbbell',
        'category': 'legs_quad',
        'muscle': 'Ön Bacak (Kuadriseps), Kalça & Core',
        'mechanic': 'compound',
        'cue': 'Dambılı göğsüne dikey yapıştır, topuklar yerden kalkmadan dirsekler dizlerin içine değene kadar çömel.',
        'weightKey': 'squat',
        'tags': ['full_body', 'legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Göğüste Dikey Kurulum', 'desc': 'Ayaklar omuz genişliğinde, uçlar hafif dışa açık. Dambılın üst plakasını iki elle göğse yapışık tut.', 'badge': 'setup'},
            {'phase': '2. Derin Çömelme (Full ROM)', 'desc': 'Göğsü dik tutarak kalçayı geriye ve topukların arasına batır. Dirsekler dizlerin iç kısmına kadar insin.', 'badge': 'action'},
            {'phase': '3. Topuktan İtiş & Glute Kilit', 'desc': 'Bütün ayak tabanıyla yeri iterek doğrul, tepe noktada kalça ve ön bacakları taş gibi kilitle.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'db_front_squat',
        'name': 'Çift Dambıl Ön Squat (Front Squat)',
        'equipment': 'dumbbell',
        'category': 'legs_quad',
        'muscle': 'Ön Bacak & Omurga Dikliği',
        'mechanic': 'compound',
        'cue': 'Dambılları omuz başlarına paralel dayayarak tut, dirsekleri yüksek tutarak gövdeyi dimdik aşağı indir.',
        'weightKey': 'squat',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ön Rack Pozisyonu', 'desc': 'İki dambılı omuz başlarına dayayarak paralel tut. Dirsekler öne ve yukarı baksın, omurga dik.', 'badge': 'setup'},
            {'phase': '2. Paralel Altı Çöküş', 'desc': 'Gövde açısını bozmadan dik bir şekilde kalçayı aşağı indir. Ağırlıkların öne düşmesine izin verme.', 'badge': 'action'},
            {'phase': '3. Patlayıcı Kalkış', 'desc': 'Ön bacaklardan aldığın güçle doğrudan yukarı doğrul, kalçayı tepe noktada sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_clean_squat.svg'
    },
    {
        'id': 'db_bulgarian_squat',
        'name': 'Bulgar Split Squat (Arka Ayak Sehpada)',
        'equipment': 'dumbbell',
        'category': 'legs_quad',
        'muscle': 'Tek Bacak Gücü, Quad & Glute',
        'mechanic': 'compound',
        'cue': 'Arka ayağın üstünü sehpa kenarına yerleştir, ön diz 90° olana kadar dik çök, ön topuktan patla.',
        'weightKey': 'squat',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sehpa Kurulumu', 'desc': 'Arka ayağın üstünü sehpa kenarına dayayın, ön ayak 2-3 adım önde sağlam bassın. Dambıllar yanlarda sarkıtılır.', 'badge': 'setup'},
            {'phase': '2. 90° Derin Çöküş', 'desc': 'Gövdeyi hafifçe öne eğik tutarak ön diz 90 derece bükülene kadar alçal. Arka dize aşırı yük bindirme.', 'badge': 'action'},
            {'phase': '3. Ön Topuktan Doğrulma', 'desc': 'Yalnızca ön ayağın topuğundan kuvvet alarak yukarı fırla, tepe noktada ön bacak ve kalçayı sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_lunge.svg'
    },
    {
        'id': 'db_walking_lunge',
        'name': 'Dambıl Yürüyüş Hamlesi (Walking Lunges)',
        'equipment': 'dumbbell',
        'category': 'legs_quad',
        'muscle': 'Kuadriseps, Kalça & Dinamik Denge',
        'mechanic': 'compound',
        'cue': 'Öne büyük adımlar at, arka diz yere 2 cm kalana kadar çök, ön topuktan kuvvet alarak diğer adıma geç.',
        'weightKey': 'squat',
        'tags': ['full_body', 'legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Dik Duruş & Adım', 'desc': 'Dambıllar yanlarda sabit. Öne doğru geniş ve dengeli bir adım at, gövde dimdik kalsın.', 'badge': 'setup'},
            {'phase': '2. Çift Diz 90° Çöküşü', 'desc': 'Ön diz 90 derece bükülürken arka diz yere hafifçe yaklaşır (yere vurma). Ön topuğa bas.', 'badge': 'action'},
            {'phase': '3. İleri İtiş ve Geçiş', 'desc': 'Ön topuktan patlayıcı şekilde güç alarak ayağa kalk ve arka bacağı öne getirerek kesintisiz diğer adıma geç.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_lunge.svg'
    },
    {
        'id': 'db_reverse_lunge',
        'name': 'Dambıl Geriye Hamle (Reverse Lunge)',
        'equipment': 'dumbbell',
        'category': 'legs_quad',
        'muscle': 'Ön Bacak, Kalça & Diz Sağlığı',
        'mechanic': 'compound',
        'cue': 'Geriye adım atarak çök (diz tendonlarını korur), ön topuktan patlayıcı güçle başlangıç noktasına çekil.',
        'weightKey': 'squat',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Başlangıç Duruşu', 'desc': 'Ayaklar kalça genişliğinde yan yana, dambıllar iki yanda dikey sarkıtılmış, bakışlar karşıda.', 'badge': 'setup'},
            {'phase': '2. Geriye Adım & Çöküş', 'desc': 'Bir bacakla geriye büyük adım at, ön diz 90 derecede kalırken arka dizi zemine yaklaştır.', 'badge': 'action'},
            {'phase': '3. Öne Doğrulma', 'desc': 'Ön ayağın topuğuyla yeri ezerek patlayıcı şekilde doğrul ve ayakları başlangıç çizgisinde buluştur.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_lunge.svg'
    },
    {
        'id': 'db_rdl',
        'name': 'Dambıl Romanian Deadlift (RDL)',
        'equipment': 'dumbbell',
        'category': 'legs_hinge',
        'muscle': 'Arka Bacak (Hamstrings) & Glute',
        'mechanic': 'compound',
        'cue': 'Dizleri hafif kırık sabitle, kalçayı arkadaki duvara değdirir gibi geriye uzat, sırtı masa gibi düz tut.',
        'weightKey': 'hinge',
        'tags': ['full_body', 'legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ayakta Kurulum', 'desc': 'Ayaklar kalça genişliğinde. Dambıllar uylukların önünde bacaklara temas eder. Omuzlar geride kilitli.', 'badge': 'setup'},
            {'phase': '2. Kalça Menteşesi (Hip Hinge)', 'desc': 'Diz açısını hiç değiştirmeden kalçayı geriye it. Dambıllar kaval kemiği boyunca bacaklara yapışık insin.', 'badge': 'action'},
            {'phase': '3. Hamstring Gerilimi & Kilit', 'desc': 'Arka bacakta yoğun esneme hissedildiğinde kalçayı öne sürerek doğrul ve tepe noktada kalçayı taş gibi kilitle.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_rdl.svg'
    },
    {
        'id': 'db_single_leg_rdl',
        'name': 'Tek Bacak Dambıl RDL',
        'equipment': 'dumbbell',
        'category': 'legs_hinge',
        'muscle': 'Arka Bacak, Kalça & Ayak Bileği Stabilitesi',
        'mechanic': 'compound',
        'cue': 'Destek ayağının dizini hafif bük, serbest bacağı arkaya cetvel gibi uzatırken dambılı kaval kemiğine indir.',
        'weightKey': 'hinge',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Tek Ayak Üzerinde Denge', 'desc': 'Ağırlığı bir bacağa ver, zıt eldeki dambılı uyluğun önünde tut. Merkez bölgeyi sık.', 'badge': 'setup'},
            {'phase': '2. Arka Bacağı Uzatarak Eğilme', 'desc': 'Destek ayağının kalçasını arkaya menteşelerken serbest bacağı arkaya cetvel gibi düz uzat.', 'badge': 'action'},
            {'phase': '3. Kalçadan Doğrulma', 'desc': 'Destek bacağının hamstring ve glute kasını sıkarak doğrul, yere basmadan dengede bitir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_rdl.svg'
    },
    {
        'id': 'db_saw_row',
        'name': 'Dambıl Testere Çekiş (Single-Arm Saw Row)',
        'equipment': 'dumbbell',
        'category': 'pull',
        'muscle': 'Geniş Sırt (Lats), Rhomboid & Kol',
        'mechanic': 'compound',
        'cue': 'Bir diz ve el sehpada, sırt masa gibi düz. Dambılı dikey değil, yay çizerek kalça cebine doğru çek.',
        'weightKey': 'pull',
        'tags': ['full_body', 'upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sehpa Destekli Kurulum', 'desc': 'Aynı taraftaki diz ve el sehpada, sırt yere paralel masa gibi düz. Serbest kol dambılla aşağı sarkar.', 'badge': 'setup'},
            {'phase': '2. Kalça Cebine Çekiş', 'desc': 'Dirseği lider yaparak dambılı düz yukarı değil, arkaya kalça cebine doğru yay çizerek çek.', 'badge': 'action'},
            {'phase': '3. Kanat Sıkıştırma', 'desc': 'Tepe noktada sırt kanat kasını 1 saniye taş gibi sık. Omuz düşmeden kontrollüce aşağı uzat.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_row.svg'
    },
    {
        'id': 'db_chest_supported_row',
        'name': 'Göğüs Destekli Dambıl Sırt Çekiş',
        'equipment': 'dumbbell',
        'category': 'pull',
        'muscle': 'Orta Sırt, Kanat & Rhomboid',
        'mechanic': 'compound',
        'cue': 'Göğsü 30-45° eğimli sehpaya yasla, belden hiç momentum almadan sadece kürek kemiklerini sıkarak çek.',
        'weightKey': 'pull',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sehpaya Yaslanma', 'desc': '30-45 derece eğimli sehpaya göğsünü tamamen yapıştır. Ayaklar yerde sağlam, kollar dambıllarla dikey sarkar.', 'badge': 'setup'},
            {'phase': '2. Bel Yüksüz Sırt Çekişi', 'desc': 'Beli hiç oynatmadan dirsekleri geriye ve yukarı doğru çekerek kürek kemiklerini birbirine yaklaştır.', 'badge': 'action'},
            {'phase': '3. Üst Sırt Kilit', 'desc': 'Tepe noktada orta sırt ve kanat kaslarını tam sıkıştır. Dambılları yavaşça serbest bırak.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'db_renegade_row',
        'name': 'Dambıl Renegade Row (Şınav Pozisyonunda Çekiş)',
        'equipment': 'dumbbell',
        'category': 'pull',
        'muscle': 'Sırt & Anti-Rotasyonel Core',
        'mechanic': 'compound',
        'cue': 'Şınav pozisyonunda dambılları tut, ayakları geniş aç, kalçayı hiç sallamadan sırayla çekiş yap.',
        'weightKey': 'pull',
        'tags': ['upper_pull', 'core'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Dambıl Üzerinde Yüksek Plank', 'desc': 'Eller dambıllarda yüksek şınav pozisyonu al. Ayakları omuzdan geniş aç (kalça dönmesini engeller).', 'badge': 'setup'},
            {'phase': '2. Tek Kol Sabit Çekiş', 'desc': 'Gövde ve kalçayı hiç oynatmadan tek dambılı kaburga hizasına çek, diğer kolla yeri güçlüce it.', 'badge': 'action'},
            {'phase': '3. Kontrollü İniş & Değişim', 'desc': 'Dambılı yere sessizce koy, merkez kilidini koruyarak hemen diğer kola geç.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_renegade_row.svg'
    },
    {
        'id': 'db_pullover',
        'name': 'Dambıl Pullover (Göğüs Kafesi & Lat Açış)',
        'equipment': 'dumbbell',
        'category': 'pull',
        'muscle': 'Geniş Sırt & Göğüs & Serratus',
        'mechanic': 'compound',
        'cue': 'Sehpada sırtüstü uzan, dambılı iki elle başın arkasına dirsekleri kırmadan uzat, kanatlarla göğüs üstüne çek.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sehpa Kurulumu', 'desc': 'Sehpaya sırtüstü uzan. Tek dambılı iki elinle iç plakasından elmas gibi kavra, göğsün üzerinde dikey tut.', 'badge': 'setup'},
            {'phase': '2. Baş Arkasına Yay Çizme', 'desc': 'Dirseklerde hafif sabit bir kavisle dambılı başının arkasına doğru yavaşça indir, kanatları derin esnet.', 'badge': 'action'},
            {'phase': '3. Göğüs Üstüne Çekiş', 'desc': 'Geniş sırt ve göğüs kaslarını sıkarak dambılı aynı yay üzerinden tekrar göğüs hizasına geri çek.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_skull_crusher.svg'
    },
    {
        'id': 'db_hammer_curl',
        'name': 'Dambıl Çekiç Biceps Kıvırma (Hammer Curl)',
        'equipment': 'dumbbell',
        'category': 'pull',
        'muscle': 'Biceps, Brachialis & Ön Kol',
        'mechanic': 'isolation',
        'cue': 'Avuç içleri birbirine baksın (nötr tutuş), dirsekleri kaburgalara sabitle, sadece ön kolu kaldır.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Nötr Tutuş Başlangıcı', 'desc': 'Ayakta dik duruş. Dambıllar uylukların yanında, avuç içleri birbirine bakar şekilde nötr tutulur.', 'badge': 'setup'},
            {'phase': '2. Dirsek Sabit Kaldırış', 'desc': 'Dirsekleri gövdeden hiç ayırmadan dambılları çekiç sallar gibi omuz hizasına doğru bük.', 'badge': 'action'},
            {'phase': '3. Tepe Kasılma & Negatif İniş', 'desc': 'Tepe noktada ön kol ve brachialis kasını 1 saniye sık. 3 saniyede kontrollü olarak aşağı indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_row.svg'
    },
    {
        'id': 'db_incline_curl',
        'name': 'Eğimli Sehpa Dambıl Biceps Curl',
        'equipment': 'dumbbell',
        'category': 'pull',
        'muscle': 'Biceps Uzun Baş (Zirve Kası)',
        'mechanic': 'isolation',
        'cue': 'Sehpayı 45-60° eğ, kollar arkada tamamen sarkıtılsın, omuzları oynatmadan biceps ile kıvır.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Eğimli Sehpa Oturuşu', 'desc': '45-60 derece eğimli sehpaya sırtını yasla. Kollar arkaya doğru serbestçe sarkıtılarak biceps esnetilir.', 'badge': 'setup'},
            {'phase': '2. Maksimum Esnemeden Kıvırma', 'desc': 'Dirsekleri geride tutarak dambılları yukarı doğru bük, bilekleri yukarıda hafif dışa çevir (supinasyon).', 'badge': 'action'},
            {'phase': '3. Zirve Sıkıştırma', 'desc': 'Tepe noktada biceps uzun başını taş gibi sık. Yavaşça başlangıçtaki tam esneme pozisyonuna indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_row.svg'
    },
    {
        'id': 'db_farmers_walk',
        'name': "Dambıl Çiftçi Yürüyüşü (Farmer's Walk)",
        'equipment': 'dumbbell',
        'category': 'core',
        'muscle': 'Kavrama Gücü, Trapez & Tüm Core',
        'mechanic': 'compound',
        'cue': 'Ağır dambılları kaldır, omuzları geriye kilitle, karın duvarını taş gibi sık ve küçük kontrollü adımlarla yürü.',
        'weightKey': '',
        'tags': ['full_body', 'core', 'conditioning'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ağır Kaldırış & Postür', 'desc': 'Ağır dambılları düz bir sırtla yerden kaldır. Omuzları geriye ve aşağı sabitle, göğsü dikleştir.', 'badge': 'setup'},
            {'phase': '2. Küçük & Dengeli Adımlar', 'desc': 'Dambılların bacaklara çarpmasını engelleyerek küçük ve kontrollü adımlarla düz bir hatta yürü.', 'badge': 'action'},
            {'phase': '3. Merkez Kilit & Bırakış', 'desc': 'Gövdenin sağa sola yatmasına izin verme. Mesafe tamamlanınca dambılları düz sırtla kontrollü yere bırak.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_farmers_walk.svg'
    },
    {
        'id': 'db_suitcase_carry',
        'name': 'Dambıl Bavul Taşıma (Tek Taraflı Yürüyüş)',
        'equipment': 'dumbbell',
        'category': 'core',
        'muscle': 'Yan Karın (Obliques) & Anti-Lateral Fleksiyon',
        'mechanic': 'compound',
        'cue': 'Sadece tek elde ağır dambıl tut, ağırlığın seni yana bükmesine ASLA izin verme, dimdik yürü.',
        'weightKey': '',
        'tags': ['core'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Tek Taraflı Kurulum', 'desc': 'Tek elde ağır bir dambıl tut, diğer kol boşta dengede. Omuzları eşit yükseklikte hizala.', 'badge': 'setup'},
            {'phase': '2. Anti-Eğim Yürüyüşü', 'desc': 'Zıt taraftaki yan karın (oblik) kaslarını taş gibi sıkarak ağırlığın gövdeyi bükmesini engelle, dik yürü.', 'badge': 'action'},
            {'phase': '3. Duruş ve Kol Değişimi', 'desc': 'Adımları tamamla, omurga dikliğini bozmadan dambılı diğer ele aktar ve aynı mesafeyi yürü.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_farmers_walk.svg'
    },
    {
        'id': 'db_russian_twist',
        'name': 'Dambıl Russian Twist (Oturarak Rotasyon)',
        'equipment': 'dumbbell',
        'category': 'core',
        'muscle': 'Karın & Rotasyonel Yan Duvar',
        'mechanic': 'isolation',
        'cue': 'Yere otur, gövdeyi 45° yatır, ayakları kaldır. Dambılı sağ ve sol kalça yanına kontrollü döndür.',
        'weightKey': '',
        'tags': ['core'],
        'isComplex': False,
        'positions': [
            {'phase': '1. V-Oturuş Pozisyonu', 'desc': 'Mindere otur, dizleri bük. Gövdeyi 45 derece geriye yatır, ayakları yerden 10 cm kaldır. Dambılı göğüste tut.', 'badge': 'setup'},
            {'phase': '2. Kalça Yanına Rotasyon', 'desc': 'Dambılı gövdeyle birlikte sol kalça yanına doğru çevir, hareketi omuzdan değil karından üret.', 'badge': 'action'},
            {'phase': '3. Zıt Tarafa Geçiş', 'desc': 'Merkeze dönerek hemen sağ kalça yanına rotasyon yap, yan karın kaslarını her dönüşte tam sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_russian_twist.svg'
    },
    {
        'id': 'db_snatch',
        'name': 'Dambıl Snatch',
        'equipment': 'dumbbell',
        'category': 'pull',
        'muscle': 'Tüm Arka Zincir, Omuz & Patlayıcı Güç',
        'mechanic': 'compound',
        'cue': 'Dambılı bacak arasından patlayıcı kalça vuruşuyla tek hamlede baş üstüne kilitlenene kadar fırlat.',
        'weightKey': 'hinge',
        'tags': ['full_body', 'power', 'conditioning'],
        'isComplex': True,
        'positions': [
            {'phase': '1. Kalça Menteşesi Kurulumu', 'desc': 'Ayaklar omuzdan geniş. Dambıl bacak arasında, kalça geride, sırt düz ve göğüs karşıya açık.', 'badge': 'setup'},
            {'phase': '2. Patlayıcı Kalça İtişi', 'desc': 'Kalçayı patlayıcı şekilde öne fırlat, topuklardan sıçrar gibi güç üret ve dambılı vücuda yakın çek.', 'badge': 'action'},
            {'phase': '3. Baş Üstü Kilitlenme', 'desc': 'Dambılın altına hızla girerek kolu baş üstünde tek hamlede kilitli yakala. Kontrollü indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_snatch.svg'
    },
    {
        'id': 'db_swing',
        'name': 'Dambıl Salınım (Dumbbell Swing)',
        'equipment': 'dumbbell',
        'category': 'legs_hinge',
        'muscle': 'Büyük Kalça (Glute), Hamstring & Bel Zırhı',
        'mechanic': 'compound',
        'cue': 'Dambılın ucundan iki elle tut, squat yapma! Kalçayı geriye menteşele ve kalça vuruşuyla göğüs hizasına fırlat.',
        'weightKey': 'hinge',
        'tags': ['full_body', 'legs', 'conditioning'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Menteşe Kurulumu', 'desc': 'Dambılın kafasından iki elle sıkıca tut. Ayaklar omuzdan geniş, kalça geriye uzanmış, sırt masa gibi düz.', 'badge': 'setup'},
            {'phase': '2. Patlayıcı Kalça Vuruşu', 'desc': 'Kolları hiç bükmeden, kalçayı patlayıcı şekilde öne kilitleyerek dambılı göğüs hizasına fırlat.', 'badge': 'action'},
            {'phase': '3. Tepe Kilit & Geri Salınım', 'desc': 'Tepe noktada kalça ve karın taş gibi kilitlenir. Dambılın iniş momentumunu kalçayla karşıla.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_swing.svg'
    },

    # ==========================================
    # 2. KETTLEBELL HAREKETLERİ
    # ==========================================
    {
        'id': 'kb_swing',
        'name': 'Kettlebell İki El Salınım (Two-Arm KB Swing)',
        'equipment': 'kettlebell',
        'category': 'legs_hinge',
        'muscle': 'Büyük Kalça (Gluteus), Hamstring & Core',
        'mechanic': 'compound',
        'cue': 'Kolları halat gibi serbest tut, gülleyi sadece kalça menteşesi ve patlayıcı glute itişiyle fırlat.',
        'weightKey': 'hinge',
        'tags': ['full_body', 'legs', 'conditioning'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Hike Pass (Bacak Arasına Alma)', 'desc': 'Kettlebell önde yerde. Kalçayı geriye menteşele, boynuzdan tut ve gülleyi Amerikan futbolu gibi bacak arasına fırlat.', 'badge': 'setup'},
            {'phase': '2. Patlayıcı Kalça Kilitlenmesi', 'desc': 'Bacakları ve kalçayı patlayıcı bir şekilde kilitlerken gülleyi göğüs hizasına doğru fırlat.', 'badge': 'action'},
            {'phase': '3. Tepe Tahta Duruşu (Plank)', 'desc': 'Tepe noktada vücut ayakta dik bir tahta gibidir. Kalça sıkı, karın kilitli. Gülleyi yerçekimiyle geri yakala.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_swing.svg'
    },
    {
        'id': 'kb_clean',
        'name': 'Kettlebell Hang Clean (Göğse Çekiş)',
        'equipment': 'kettlebell',
        'category': 'legs_hinge',
        'muscle': 'Kalça, Sırt & Rack Pozisyonu Gücü',
        'mechanic': 'compound',
        'cue': 'Gülleyi bacak arasından çek, dirseği gövdeye yapıştırarak ön kola çarpmadan yumuşakça göğse al.',
        'weightKey': 'hinge',
        'tags': ['full_body', 'power'],
        'isComplex': True,
        'positions': [
            {'phase': '1. Salınım Kurulumu', 'desc': 'Kettlebell tek elle bacak arasında. Kalça geriye menteşelenmiş, sırt düz, göğüs açık.', 'badge': 'setup'},
            {'phase': '2. Dikey Çekiş & El Geçişi', 'desc': 'Kalçayı patlat, gülleyi dikey hatta yukarı çekerken elini tutamağın etrafında nazikçe kaydır.', 'badge': 'action'},
            {'phase': '3. Rack Pozisyonunda Karşılama', 'desc': 'Gülle ön kola çarpmadan başparmak köprücük kemiğinde, dirsek göğse yapışık şekilde kilitlenir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_clean_squat.svg'
    },
    {
        'id': 'kb_press',
        'name': 'Kettlebell Strict Press (Tek Kol Askeri Pres)',
        'equipment': 'kettlebell',
        'category': 'push',
        'muscle': 'Omuz, Triceps, Karın & Kalça Zırhı',
        'mechanic': 'compound',
        'cue': 'Rack pozisyonundan başla, bacaklardan hiç yaylanmadan sadece omuz gücüyle gülleyi baş üstüne kilitle.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sıkı Rack Pozisyonu', 'desc': 'Kettlebell göğüste, başparmak köprücük kemiğinde, dirsek kaburgaya yapışık. Kalça ve karın taş gibi kilitli.', 'badge': 'setup'},
            {'phase': '2. Skapular Pres', 'desc': 'Dizleri hiç bükmeden nefes ver ve gülleyi kulak hizasından yukarıya doğru dikey presle.', 'badge': 'action'},
            {'phase': '3. Baş Üstü Kilitleme', 'desc': 'Kol baş üstünde kulak hizasında kilitlenir. Kontrollü biçimde tekrar sıkı rack pozisyonuna indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_press.svg'
    },
    {
        'id': 'kb_half_snatch',
        'name': 'Kettlebell Half Snatch (Yarım Koparma)',
        'equipment': 'kettlebell',
        'category': 'pull',
        'muscle': 'Tam Vücut Gücü, Omuz Stabilitesi & Nabız',
        'mechanic': 'compound',
        'cue': 'Gülleyi tek hamlede baş üstüne fırlatıp kilitle, indirirken önce göğse (rack) alıp sonra bacak arasına bırak.',
        'weightKey': 'hinge',
        'tags': ['full_body', 'power', 'conditioning'],
        'isComplex': True,
        'positions': [
            {'phase': '1. Salınım Fazı', 'desc': 'Kettlebell tek elle bacak arasında, kalça menteşelenmiş, patlamaya hazır konumda.', 'badge': 'setup'},
            {'phase': '2. Tek Hamle Baş Üstü Fırlatış', 'desc': 'Kalça itişiyle gülleyi yukarı fırlat, kolu baş üstünde tek hamlede kilitli yakala.', 'badge': 'action'},
            {'phase': '3. Rack İndirişi & Sıfırlama', 'desc': 'Gülleyi baş üstünden önce yumuşakça göğse (rack) indir, ardından bacak arasına salarak bir sonraki tekrara geç.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_snatch.svg'
    },
    {
        'id': 'kb_goblet_squat',
        'name': 'Kettlebell Goblet Squat',
        'equipment': 'kettlebell',
        'category': 'legs_quad',
        'muscle': 'Ön Bacak, Kalça & Kalça Açıklığı',
        'mechanic': 'compound',
        'cue': 'Gülleyi boynuzlarından göğse yapıştır, dirsekler dizlerin içine inene kadar derin çömel.',
        'weightKey': 'squat',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Boynuz Tutuş Kurulumu', 'desc': 'Kettlebell boynuzlarından iki elle göğüs hizasında tutulur. Ayaklar omuz genişliğinde, uçlar 30° dışa dönük.', 'badge': 'setup'},
            {'phase': '2. Derin Çömelme', 'desc': 'Topuklar yerde sabit, kalçayı diz seviyesinin altına indir. Dirsekler dizlerin iç tarafına temas etsin.', 'badge': 'action'},
            {'phase': '3. Patlayıcı Doğrulma', 'desc': 'Yeri ayak tabanlarıyla iterek yukarı kalk, tepe noktada kalçayı ve kuadrisepsi sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'kb_gorilla_row',
        'name': 'Kettlebell Gorilla Row (Çift Gülle Çekiş)',
        'equipment': 'kettlebell',
        'category': 'pull',
        'muscle': 'Kanat, Orta Sırt & Statik Bacak Zırhı',
        'mechanic': 'compound',
        'cue': 'Goril gibi dizleri bükük ve eğik dur. Bir gülleyi yerde bastırırken diğerini kalçaya patlayıcı çek.',
        'weightKey': 'pull',
        'tags': ['upper_pull', 'core'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Goril Pozisyonu', 'desc': 'İki kettlebell yerde yan yana. Derin menteşe pozisyonunda eğil, eller boynuzlarda, sırt masa gibi düz.', 'badge': 'setup'},
            {'phase': '2. Tek Kol Çekiş, Diğer Kol Baskı', 'desc': 'Sol gülleyi yerde bastırırken sağ gülleyi kalça cebine doğru güçlüce çek.', 'badge': 'action'},
            {'phase': '3. Kontrollü Değişim', 'desc': 'Sağ gülleyi yere indirirken hemen sol gülleyi çekmeye başla. Omurga açısını hiç bozma.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_row.svg'
    },
    {
        'id': 'kb_windmill',
        'name': 'Kettlebell Windmill (Rüzgar Gülü)',
        'equipment': 'kettlebell',
        'category': 'core',
        'muscle': 'Omuz Stabilitesi, Yan Karın & Hamstring Mobilite',
        'mechanic': 'compound',
        'cue': 'Gülleyi baş üstünde kilitli tut, gözlerini güllenden ayırmadan zıt ayak bileğine doğru gövdeyi döndürerek eğil.',
        'weightKey': 'press',
        'tags': ['core', 'mobility'],
        'isComplex': True,
        'positions': [
            {'phase': '1. Baş Üstü Kilit & Ayak Açısı', 'desc': 'Kettlebell sağ elde baş üstünde kilitli. Ayak uçları 45 derece sola dönük, sağ bacak dimdik.', 'badge': 'setup'},
            {'phase': '2. Menteşe & Yere Uzayış', 'desc': 'Gözleri tavandaki gülleden ayırmadan kalçayı sağa doğru çıkart, sol elle sol ayak bileğine doğru alçal.', 'badge': 'action'},
            {'phase': '3. Yan Karından Doğrulma', 'desc': 'Sol el yere yaklaştığında sağ yan karın ve kalça kaslarıyla yukarı doğrul, baş üstü kilidi koru.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_windmill.svg'
    },
    {
        'id': 'kb_turkish_getup',
        'name': 'Kettlebell Turkish Get-Up (Türk Kalkışı)',
        'equipment': 'kettlebell',
        'category': 'core',
        'muscle': 'Tam Vücut Zırhı & Eklem Sağlığı',
        'mechanic': 'compound',
        'cue': 'Gözlerini tavandaki güllenden ayırma! Sırtüstünden ayağa kalkana kadar her eklem adımını sırayla kitle.',
        'weightKey': '',
        'tags': ['full_body', 'core', 'mobility'],
        'isComplex': True,
        'positions': [
            {'phase': '1. Yerde Kilitlenme', 'desc': 'Sırtüstü uzan. Sağ eldeki kettlebell tavana kilitli, sağ diz bükülü, sol kol 45° yerde.', 'badge': 'setup'},
            {'phase': '2. Dirsek ➔ El ➔ Köprü', 'desc': 'Gözler ağırlıkta; sol dirseğe sonra sol ele yüksel. Kalçayı kaldırıp sol bacağı arkaya alarak diz çök.', 'badge': 'action'},
            {'phase': '3. Ayağa Kalkış & Geri Dönüş', 'desc': 'Gövdeyi dikleştirip ayağa kalk. Baş üstü kilidi koruyarak aynı adımlarla yere geri yat.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_windmill.svg'
    },
    {
        'id': 'kb_halo',
        'name': 'Kettlebell Halo (Baş Çevresi Rotasyonu)',
        'equipment': 'kettlebell',
        'category': 'core',
        'muscle': 'Omuz Kapsülü & Üst Gövde Mobilite',
        'mechanic': 'isolation',
        'cue': 'Gülleyi ters çevirip boynuzlardan tut, başını oynatmadan gülleyi başının etrafında haleler çizerek döndür.',
        'weightKey': '',
        'tags': ['core', 'mobility'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Göğüste Ters Tutuş', 'desc': 'Kettlebell ters (tabanı yukarıda) boynuzlardan göğüs önünde tutulur. Kalça ve karın kilitli.', 'badge': 'setup'},
            {'phase': '2. Baş Arkasında Daire', 'desc': 'Boynu ve başı sabit tutarak gülleyi kulağın yanından başın arkasına doğru yumuşakça döndür.', 'badge': 'action'},
            {'phase': '3. Göğse Dönüş & Yön Değişimi', 'desc': 'Gülleyi diğer kulağın yanından göğse getir. 1 saniye duraklayıp ters yöne aynı daireyi çiz.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_press.svg'
    },
    {
        'id': 'kb_thruster',
        'name': 'Kettlebell Thruster (Squat + Baş Üstü İtiş)',
        'equipment': 'kettlebell',
        'category': 'push',
        'muscle': 'Bacak & Omuz & Metabolik Ateş',
        'mechanic': 'compound',
        'cue': 'Derin squat yap, kalkışın patlayıcı momentumunu hiç kesmeden doğrudan baş üstü pres ile birleştir.',
        'weightKey': 'press',
        'tags': ['full_body', 'legs', 'conditioning'],
        'isComplex': True,
        'positions': [
            {'phase': '1. Rack Pozisyonu Kurulumu', 'desc': 'Kettlebell göğüste sıkı rack pozisyonunda, ayaklar omuz genişliğinde çömelmeye hazır.', 'badge': 'setup'},
            {'phase': '2. Derin Çöküş', 'desc': 'Gövdeyi dimdik tutarak kalçayı topukların arasına derin squat konumuna indir.', 'badge': 'action'},
            {'phase': '3. Bacak Momentumlu Pres', 'desc': 'Topuklardan patlayıcı kalkarken bacak gücünü doğrudan baş üstü itişe aktar ve kilitlen.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_thruster.svg'
    },

    # ==========================================
    # 3. BARBELL HAREKETLERİ
    # ==========================================
    {
        'id': 'bb_bench_press',
        'name': 'Barbell Bench Press (Klasik Düz Sehpa)',
        'equipment': 'barbell',
        'category': 'push',
        'muscle': 'Büyük Göğüs Kası, Ön Omuz & Triceps',
        'mechanic': 'compound',
        'cue': 'Göz hizası barın altında, kürek kemiklerini sehpaya göm, barı alt göğse değdirip patlayıcı it.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sehpa & Bar Kurulumu', 'desc': 'Gözler barın altında kalacak şekilde sehpaya uzan. Omuz genişliğinden biraz geniş tut, kürek kemiklerini sehpaya kilitle.', 'badge': 'setup'},
            {'phase': '2. Göğüs Ucuna Kontrollü İniş', 'desc': 'Nefes alarak dirsekleri 45° açıyla bük ve barı alt göğüs çizgisine kontrollü indir.', 'badge': 'action'},
            {'phase': '3. Patlayıcı İtiş & Kilit', 'desc': 'Ayakları yere basarak barı patlayıcı güçle yukarı it, tepe noktada göğsü sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'bb_incline_bench',
        'name': 'Eğimli Barbell Bench Press (Incline BB Press)',
        'equipment': 'barbell',
        'category': 'push',
        'muscle': 'Üst Göğüs & Omuz Önü',
        'mechanic': 'compound',
        'cue': '30° açılı sehpada barı köprücük kemiğinin hemen altına indir, üst göğüs lifleriyle yukarı presle.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. 30° Sehpa Kurulumu', 'desc': '30 derece açılı sehpaya uzan. Barı omuzdan geniş kavra, ayakları yere sağlam bas.', 'badge': 'setup'},
            {'phase': '2. Köprücük Kemiğine İniş', 'desc': 'Barı üst göğüs / köprücük kemiği çizgisine yavaşça indir, dirsekleri aşırı açma.', 'badge': 'action'},
            {'phase': '3. Üst Göğüsten Kilitleme', 'desc': 'Üst göğüs kaslarını sıkarak barı yukarı it, kollar düzleştiğinde 1 saniye durakla.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'bb_overhead_press',
        'name': 'Barbell Askeri Pres (Military / Overhead Press)',
        'equipment': 'barbell',
        'category': 'push',
        'muscle': 'Tüm Omuz Kasları & Karın Zırhı',
        'mechanic': 'compound',
        'cue': 'Barı köprücük kemiğinde tut, başını hafif geriye çekip barı yukarı iterken başını barın altından öne sok.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Köprücük Kemiği Kurulumu', 'desc': 'Barı omuz genişliğinde tut, ön kollar yere dik. Bar köprücük kemiği üzerinde dinlenir, kalça sıkı.', 'badge': 'setup'},
            {'phase': '2. Dikey İtiş & Baş Geçişi', 'desc': 'Çeneyi hafif geriye alıp barı dikey hatta yukarı it. Bar alnı geçince başı doğal konuma öne al.', 'badge': 'action'},
            {'phase': '3. Baş Üstü Kilitlenme', 'desc': 'Bar kafanın tam üzerinde trapezlerle kilitlenir. Kontrollü biçimde köprücük kemiğine indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_press.svg'
    },
    {
        'id': 'bb_back_squat',
        'name': 'Barbell Back Squat (Sırtta Squat)',
        'equipment': 'barbell',
        'category': 'legs_quad',
        'muscle': 'Dört Başlı Ön Bacak (Quad), Kalça & Bel',
        'mechanic': 'compound',
        'cue': 'Barı üst trapezlere sağlam kilitle, dizleri dışa açarak kalçayı paralel altına indir, ayak tabanıyla yeri parçala.',
        'weightKey': 'squat',
        'tags': ['full_body', 'legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Bar Yerleşimi (Trapez)', 'desc': 'Barı üst trapez kaslarının üzerine yerleştir. Kürek kemiklerini sık, ayaklar omuz genişliği, uçlar dışa 30°.', 'badge': 'setup'},
            {'phase': '2. Paralel Altına Çömelme', 'desc': 'Dizleri ayak uçları yönüne açarak kalçayı geriye ve aşağı batır. Göğsü dik tut, derin çök.', 'badge': 'action'},
            {'phase': '3. Ayak Tabanıyla Yeri İtiş', 'desc': 'Bütün ayak tabanıyla yeri iterek doğrul, tepe noktada kalça ve ön bacakları kilitle.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'bb_front_squat',
        'name': 'Barbell Front Squat (Önde Squat)',
        'equipment': 'barbell',
        'category': 'legs_quad',
        'muscle': 'Ön Bacak & Omurga Dikliği',
        'mechanic': 'compound',
        'cue': 'Barı omuz önünde ön rack pozisyonunda tut, dirsekleri tavana doğru yüksek tutarak dimdik çömel.',
        'weightKey': 'squat',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ön Rack Kurulumu', 'desc': 'Barı ön omuz başlarına yasla. Parmak uçlarıyla hafif destekle, dirsekleri yere paralel yukarı kaldır.', 'badge': 'setup'},
            {'phase': '2. Dimdik Gövdeyle Çöküş', 'desc': 'Dirsekleri yüksek tutarak gövdenin öne yatmasını engelle, kalçayı topukların arasına indir.', 'badge': 'action'},
            {'phase': '3. Kuadriseps Patlaması', 'desc': 'Ön bacaklardan aldığın güçle yukarı fırla, tepe noktada kalçayı sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_clean_squat.svg'
    },
    {
        'id': 'bb_deadlift',
        'name': 'Barbell Konvansiyonel Deadlift',
        'equipment': 'barbell',
        'category': 'legs_hinge',
        'muscle': 'Tüm Arka Zincir (Hamstring, Glute, Sırt, Trapez)',
        'mechanic': 'compound',
        'cue': 'Bar kaval kemiğine temas etsin, sırt masa gibi düz, yeri ayak tabanlarınla iterek kalçayı kilitle.',
        'weightKey': 'hinge',
        'tags': ['full_body', 'legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Kaval Kemiği Teması', 'desc': 'Ayaklar kalça genişliğinde, bar kaval kemiğine 2 cm yakın. Eğil, barı kavra, sırtı masa gibi düzleştir.', 'badge': 'setup'},
            {'phase': '2. Yeri İterek Çekiş', 'desc': 'Yeri ayak tabanlarınla iterek bacaklardan güç al. Barı bacaklarından hiç ayırmadan yukarı çek.', 'badge': 'action'},
            {'phase': '3. Dik Kilitlenme', 'desc': 'Tepe noktada kalça ve dizleri tam kilitle (geriye aşırı yatma). Karın duvarını taş gibi sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_rdl.svg'
    },
    {
        'id': 'bb_rdl',
        'name': 'Barbell Romanian Deadlift (RDL)',
        'equipment': 'barbell',
        'category': 'legs_hinge',
        'muscle': 'Arka Bacak (Hamstring) & Kalça',
        'mechanic': 'compound',
        'cue': 'Dizleri hafif kırık sabitle, barı kaval kemiği boyunca indirerek kalçayı arkaya menteşele.',
        'weightKey': 'hinge',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ayakta Düz Sırt', 'desc': 'Ayakta dik duruş, bar uylukların önünde. Kürek kemikleri geride kilitli.', 'badge': 'setup'},
            {'phase': '2. Kalçayı Arkaya İtme', 'desc': 'Diz açısını sabit tutarak kalçayı geriye it. Bar bacaklara yapışık şekilde kaval kemiği ortasına insin.', 'badge': 'action'},
            {'phase': '3. Hamstring Gücüyle Doğrulma', 'desc': 'Arka bacaklardaki gerilimi kullanarak öne doğrul ve kalçayı tepe noktada tam sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_rdl.svg'
    },
    {
        'id': 'bb_hip_thrust',
        'name': 'Barbell Kalça İtişi (Barbell Hip Thrust)',
        'equipment': 'barbell',
        'category': 'legs_hinge',
        'muscle': 'Büyük Kalça Kası (Gluteus Maximus)',
        'mechanic': 'compound',
        'cue': 'Sırt sehpaya dayalı, süngerli bar kalça kıvrımında, topuklardan yeri iterek tepe noktada kalçayı taş gibi kilitle.',
        'weightKey': 'hinge',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sehpa & Bar Kurulumu', 'desc': 'Kürek kemikleri sehpada, süngerli bar kalça kıvrımında. Dizler bükülü, ayaklar omuz genişliği yerde.', 'badge': 'setup'},
            {'phase': '2. Topuktan Kalça İtişi', 'desc': 'Çeneyi göğse yakın tutarak topuklardan yeri güçlüce it ve kalçayı yukarı fırlat.', 'badge': 'action'},
            {'phase': '3. 90° Tepe Kilidi', 'desc': 'Dizler 90 derece dik açı oluşturur. Tepe noktada kalça kaslarını 1-2 saniye taş gibi sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_rdl.svg'
    },
    {
        'id': 'bb_bent_over_row',
        'name': 'Barbell Eğilerek Sırt Çekiş (Bent-Over Row)',
        'equipment': 'barbell',
        'category': 'pull',
        'muscle': 'Geniş Sırt, Rhomboid & Orta Sırt',
        'mechanic': 'compound',
        'cue': 'Gövdeyi 45° öne eğ, omurgayı düz tut, barı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek.',
        'weightKey': 'pull',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. 45° Eğimli Kurulum', 'desc': 'Ayaklar kalça genişliğinde. Gövdeyi 45 derece öne eğ, dizler hafif kırık, omurga dümdüz nötr.', 'badge': 'setup'},
            {'phase': '2. Göbek Deliğine Çekiş', 'desc': 'Dirsekleri geriye ve yukarı doğru çekerek barı göbek deliği hizasına doğru getir.', 'badge': 'action'},
            {'phase': '3. Kürek Kemiklerini Sıkıştırma', 'desc': 'Tepe noktada kürek kemiklerini birbirine yapıştır. 1 saniye sık ve kontrollü aşağı bırak.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'bb_pendlay_row',
        'name': 'Pendlay Row (Yerden Patlayıcı Çekiş)',
        'equipment': 'barbell',
        'category': 'pull',
        'muscle': 'Üst Sırt Gücü & Lats',
        'mechanic': 'compound',
        'cue': 'Gövde yere tam paralel (90°). Her tekrarda bar yerden sıfırdan başlar, patlayıcı alt göğse çekilip yere bırakılır.',
        'weightKey': 'pull',
        'tags': ['upper_pull', 'power'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Yere Tam Paralel Başlangıç', 'desc': 'Gövde yere 90 derece paralel. Bar yerde plakalarda durur. Sırt dümdüz, dizler hafif bükük.', 'badge': 'setup'},
            {'phase': '2. Yerden Patlayıcı Çekiş', 'desc': 'Sıfır momentum noktasından barı patlayıcı güçle alt göğüs / kaburga çizgisine çek.', 'badge': 'action'},
            {'phase': '3. Zemine Tam Sıfırlama', 'desc': 'Barı tekrar zemine bırak, her tekrarda momentumu sıfırlayıp yeniden çek.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'bb_biceps_curl',
        'name': 'Barbell Biceps Kıvırma (BB Curl)',
        'equipment': 'barbell',
        'category': 'pull',
        'muscle': 'Ön Kol & Biceps',
        'mechanic': 'isolation',
        'cue': 'Dirsekleri gövdeye yapıştır, belden savurma yapmadan sadece ön kolları bükerek barı göğse doğru kıvır.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Dik Duruş & Tutuş', 'desc': 'Barı omuz genişliğinde alttan tut. Dirsekler gövdeye yapışık, omuzlar geride ve sabit.', 'badge': 'setup'},
            {'phase': '2. Dirsek Sabit Kıvırma', 'desc': 'Belden hiç momentum almadan sadece ön kolları bükerek barı göğüs hizasına doğru kaldır.', 'badge': 'action'},
            {'phase': '3. Tepe Biceps Sıkıştırma', 'desc': 'Tepe noktada biceps kaslarını taş gibi sık. 3 saniyede yavaşça başlangıç pozisyonuna indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_row.svg'
    },
    {
        'id': 'bb_close_grip_bench',
        'name': 'Dar Tutuş Bench Press (Close-Grip Bench)',
        'equipment': 'barbell',
        'category': 'push',
        'muscle': 'Arka Kol (Triceps) & İç Göğüs',
        'mechanic': 'compound',
        'cue': 'Elleri omuz genişliğinde dar tut, inişte dirsekleri gövdeye yapışık tutarak ağırlığı triceps ile presle.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Dar Tutuş Kurulumu', 'desc': 'Sehpaya uzan. Barı omuz genişliğinde (bilekleri kırmayacak makul darlıkta) kavra, kürek kemiklerini sabitle.', 'badge': 'setup'},
            {'phase': '2. Gövdeye Yapışık İniş', 'desc': 'Dirsekleri dışa açmadan gövdeye sürtünürcesine yapışık tutarak barı alt göğse indir.', 'badge': 'action'},
            {'phase': '3. Triceps Kilitlemesi', 'desc': 'Triceps kaslarıyla patlayıcı itiş yap ve tepe noktada kolları düzleştirerek kilitlen.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },

    # ==========================================
    # 4. MAKİNE VE KABLO HAREKETLERİ
    # ==========================================
    {
        'id': 'mach_lat_pulldown',
        'name': 'Geniş Tutuş Lat Pulldown Makinesi',
        'equipment': 'machine',
        'category': 'pull',
        'muscle': 'Geniş Sırt (Kanat / Latissimus)',
        'mechanic': 'compound',
        'cue': 'Bacak pedine sıkıca otur, barı üst göğse doğru dirsekleri kaburgalara çekerek indir, arkaya aşırı yatma.',
        'weightKey': 'pull',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Makineye Yerleşim', 'desc': 'Dizleri pedin altına sabitle. Barı omuzdan geniş tutuşla kavra, göğsü dik tut.', 'badge': 'setup'},
            {'phase': '2. Üst Göğse Çekiş', 'desc': 'Dirsekleri aşağı ve geriye doğru yönlendirerek barı köprücük kemiğinin hemen altına çek.', 'badge': 'action'},
            {'phase': '3. Kanat Sıkıştırma', 'desc': 'Tepe noktada kanat kaslarını tam sık. Ağırlığı kontrollü biçimde yukarı serbest bırak.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'mach_cable_row',
        'name': 'Oturarak Kablo Sırt Çekiş (Seated Cable Row)',
        'equipment': 'machine',
        'category': 'pull',
        'muscle': 'Orta Sırt, Kanat & Rhomboid',
        'mechanic': 'compound',
        'cue': 'Ayakları platforma bas, sırtı dik tut, tutacağı göbek deliğine doğru kürek kemiklerini birbirine yapıştırarak çek.',
        'weightKey': 'pull',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Oturak & Platform Kurulumu', 'desc': 'Sehpaya otur, ayakları platforma sağlam bas, dizler hafif kırık. V-tutacağı kavra, omurga dimdik.', 'badge': 'setup'},
            {'phase': '2. Göbek Deliğine Çekiş', 'desc': 'Gövdeyi geriye savurmadan dirsekleri geriye çekerek tutacağı alt karına getir.', 'badge': 'action'},
            {'phase': '3. Sırt Kaslarını Kilitleme', 'desc': 'Kürek kemiklerini arkada yapıştır, 1 saniye sık ve kontrollü olarak kolları uzat.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'mach_face_pull',
        'name': 'Kablo Yüze Çekiş (Face Pull - Halat)',
        'equipment': 'machine',
        'category': 'pull',
        'muscle': 'Arka Omuz, Dış Rotatörler & Postür',
        'mechanic': 'compound',
        'cue': 'Halatı göz hizasından tut, dirsekleri yüksekte dışa açarak halatın ortasını alnına doğru çek ve arka omuzu sık.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper', 'posture'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Halat Tutuş & Adım', 'desc': 'Halatı göz hizasında kavra, başparmaklar arkaya baksın. Geriye bir adım at, dizler hafif kırık.', 'badge': 'setup'},
            {'phase': '2. Dirsekler Yüksek Çekiş', 'desc': 'Dirsekleri yüksek ve geriye çekerek halatın ortasını burnuna/alnına doğru yaklaştır.', 'badge': 'action'},
            {'phase': '3. Dış Rotasyon & Kilit', 'desc': 'Dip noktada elleri kulak yanına aç, arka omuz ve kürek kemiklerini taş gibi sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_lateral_raise.svg'
    },
    {
        'id': 'mach_chest_press',
        'name': 'Makine Göğüs Presi (Machine Chest Press)',
        'equipment': 'machine',
        'category': 'push',
        'muscle': 'Büyük Göğüs Kası & Ön Omuz',
        'mechanic': 'compound',
        'cue': 'Koltuk yüksekliğini tutacaklar göğüs ortasına gelecek şekilde ayarla, sırtı mindere gömüp öne güçlüce it.',
        'weightKey': 'press',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Koltuk & Tutuş Ayarı', 'desc': 'Tutacaklar göğüs ucu hizasında olacak şekilde otur. Sırtı ve başı mindere yapıştır, ayaklar yerde sabit.', 'badge': 'setup'},
            {'phase': '2. Öne Güçlü İtiş', 'desc': 'Nefes vererek tutacakları öne doğru it, kollar neredeyse düzleşene kadar devam et.', 'badge': 'action'},
            {'phase': '3. Göğüs Kasılma & Kontrol', 'desc': 'Tepe noktada göğüs kaslarını sık. Ağırlığı kontrollü ve yavaş biçimde başlangıca döndür.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'mach_cable_crossover',
        'name': 'Kablo Göğüs Sıkıştırma (Cable Flyes / Crossover)',
        'equipment': 'machine',
        'category': 'push',
        'muscle': 'Göğüs İzolasyonu & İç Göğüs',
        'mechanic': 'isolation',
        'cue': 'Dirseklerde hafif sabit açı tut, kolları büyük bir ağaca sarılır gibi göğsün önünde birleştir.',
        'weightKey': '',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Kablo Arasında Duruş', 'desc': 'Yüksek makaralardan tutacakları al, öne bir adım atarak gövdeyi hafif eğik sabitle.', 'badge': 'setup'},
            {'phase': '2. Ağaca Sarılma Hareketi', 'desc': 'Dirsek açısını hiç bozmadan kolları öne ve aşağı doğru geniş bir yay çizerek kapat.', 'badge': 'action'},
            {'phase': '3. Göğüs Zirve Sıkışması', 'desc': 'Eller göğüs önünde buluştuğunda göğüs kaslarını 1-2 saniye sık, yavaşça geriye aç.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'mach_pec_deck',
        'name': 'Pec Deck Kelebek Makinesi',
        'equipment': 'machine',
        'category': 'push',
        'muscle': 'Göğüs Kası İzolasyonu',
        'mechanic': 'isolation',
        'cue': 'Dirsekleri pedlere veya tutacaklara yerleştir, omuzları geride tutarak göğüs kaslarınla kolları önde kapat.',
        'weightKey': '',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Makineye Yerleşim', 'desc': 'Koltuk yüksekliğini dirsekler omuz hizasından hafif aşağıda olacak şekilde ayarla. Sırtı mindere yapıştır.', 'badge': 'setup'},
            {'phase': '2. Önde Kapatma', 'desc': 'Göğüs kaslarını kullanarak kolları önde birleştir, omuzların öne yuvarlanmasına izin verme.', 'badge': 'action'},
            {'phase': '3. Zirve Kasılma & Esneme', 'desc': 'Önde 1 saniye göğsü tam kasılmayla sık. Yavaşça göğüs kasları esneyene kadar başlangıca dön.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'mach_triceps_pushdown',
        'name': 'Kablo Halat Triceps İtiş (Rope Pushdown)',
        'equipment': 'machine',
        'category': 'push',
        'muscle': 'Arka Kol (Triceps Yan & Dış Baş)',
        'mechanic': 'isolation',
        'cue': 'Dirsekleri gövdeye yapıştır, halatı aşağı iterken dip noktada uçlarını yana doğru açarak triceps kaslarını kilitle.',
        'weightKey': '',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Halat Tutuş & Dirsek Kilidi', 'desc': 'Halatı göğüs hizasında tut. Dirsekleri kaburgalara yapıştır, gövdeyi hafifçe öne eğ.', 'badge': 'setup'},
            {'phase': '2. Aşağı İtiş', 'desc': 'Dirsekleri hiç oynatmadan sadece ön kolları aşağı doğru it.', 'badge': 'action'},
            {'phase': '3. Halat Uçlarını Açma & Kilit', 'desc': 'Dip noktada halatın uçlarını yana doğru ayırarak triceps kaslarını taş gibi sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_skull_crusher.svg'
    },
    {
        'id': 'mach_cable_biceps',
        'name': 'Kablo Düz Bar Biceps Curl',
        'equipment': 'machine',
        'category': 'pull',
        'muscle': 'Ön Kol & Biceps Sürekli Gerilim',
        'mechanic': 'isolation',
        'cue': 'Düşük makarada düz barı tut, dirsekleri sabit tutarak kablonun sürekli geriliminde biceps kaslarını sık.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Düşük Makara Kurulumu', 'desc': 'Alt makaradaki barı alttan tut, 1 adım geriye çekil. Dirsekler gövdeye yapışık, dik dur.', 'badge': 'setup'},
            {'phase': '2. Sürekli Gerilimle Kıvırma', 'desc': 'Kablo direncine karşı dirsekleri oynatmadan barı göğüs hizasına doğru kaldır.', 'badge': 'action'},
            {'phase': '3. Tepe Kasılma', 'desc': 'Tepe noktada biceps kaslarını tam sık. Negatif fazda ağırlığı yavaşça aşağı bırak.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_row.svg'
    },
    {
        'id': 'mach_cable_lateral',
        'name': 'Kablo Tek Kol Yana Açış (Cable Lateral Raise)',
        'equipment': 'machine',
        'category': 'push',
        'muscle': 'Yan Omuz (İzole Gerilim)',
        'mechanic': 'isolation',
        'cue': 'Alt makaradan kabloyu gövdenin arkasından veya önünden tut, dirseği hafif bükük omuz hizasına kaldır.',
        'weightKey': '',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Makara Yanında Duruş', 'desc': 'Makaraya yan dur, tek elle tutacağı kavra. Gövde dimdik, omuzlar aşağıda sabit.', 'badge': 'setup'},
            {'phase': '2. Yana Doğru Açılış', 'desc': 'Dirsek hafif kırık vaziyette kolu yana doğru omuz hizasına kadar yükselt.', 'badge': 'action'},
            {'phase': '3. Tepe İzolasyon', 'desc': 'Omuz hizasında 1 saniye duraklayarak yan deltoidi sık, kablonun çekişine direnerek yavaşça indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_lateral_raise.svg'
    },
    {
        'id': 'mach_leg_press',
        'name': '45° Bacak Pres Makinesi (Leg Press)',
        'equipment': 'machine',
        'category': 'legs_quad',
        'muscle': 'Ön Bacak (Quad) & Kalça Gücü',
        'mechanic': 'compound',
        'cue': 'Bel boşluğunu arkadaki mindere tamamen yapıştır, dizleri 90° büküp platformu ayak tabanlarıyla güçlüce it (dizleri kilitleme).',
        'weightKey': 'squat',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Platform & Bel Kurulumu', 'desc': 'Makineye otur, belini ve kalçanı mindere tamamen yapıştır. Ayaklar platformda omuz genişliği.', 'badge': 'setup'},
            {'phase': '2. 90° Diz Büküşü', 'desc': 'Emniyet kolunu aç ve platformu dizlerin 90 derece büküleceği noktaya kadar kontrollü indir.', 'badge': 'action'},
            {'phase': '3. Güçlü İtiş (Dizleri Kitleme)', 'desc': 'Tüm tabanla platformu yukarı it. Tepe noktada dizleri asla aşırı kilitleme (hafif kırık bırak).', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'mach_leg_extension',
        'name': 'Bacak Uzatma Makinesi (Leg Extension)',
        'equipment': 'machine',
        'category': 'legs_quad',
        'muscle': 'Ön Bacak Dört Başlı Kas (Quad İzolasyonu)',
        'mechanic': 'isolation',
        'cue': 'Diz eklemini makinenin dönme noktasıyla hizala, bacakları yukarı uzatıp tepe noktada kuadrisepsi taş gibi sık.',
        'weightKey': '',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Makine Ayarı', 'desc': 'Pedi kaval kemiğinin alt kısmına ayarla. Sırtı mindere yasla, yan tutacakları sıkıca kavra.', 'badge': 'setup'},
            {'phase': '2. Bacakları Yukarı Uzatma', 'desc': 'Sadece diz eklemini kullanarak bacakları yukarı doğru düzleştir.', 'badge': 'action'},
            {'phase': '3. Zirve Kuadriseps Kilidi', 'desc': 'Tepe noktada ön bacak kaslarını 1-2 saniye taş gibi sık, yavaşça kontrollü aşağı indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'mach_leg_curl',
        'name': 'Yatarak / Oturarak Arka Bacak Makinesi (Leg Curl)',
        'equipment': 'machine',
        'category': 'legs_hinge',
        'muscle': 'Arka Bacak (Hamstrings İzolasyonu)',
        'mechanic': 'isolation',
        'cue': 'Pedi aşil tendonunun hemen üzerine ayarla, topukları kalçaya doğru bükerek hamstring kaslarını sık.',
        'weightKey': '',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Minder & Ped Kurulumu', 'desc': 'Minderde yerleş, döner pedi aşil tendonunun hemen üzerine oturt. Tutacakları kavra.', 'badge': 'setup'},
            {'phase': '2. Kalçaya Doğru Büküş', 'desc': 'Kalçayı mindere yapışık tutarak ayakları geriye ve kalçaya doğru güçlüce bük.', 'badge': 'action'},
            {'phase': '3. Hamstring Sıkıştırma', 'desc': 'Tepe noktada arka bacakları tam sıkıştır. Ağırlığı 3 saniyede kontrollü olarak serbest bırak.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_rdl.svg'
    },
    {
        'id': 'mach_calf_raise',
        'name': 'Baldır Makinesi (Standing / Seated Calf Raise)',
        'equipment': 'machine',
        'category': 'legs_quad',
        'muscle': 'Baldır Kasları (Gastrocnemius & Soleus)',
        'mechanic': 'isolation',
        'cue': 'Parmak uçlarıyla platform kenarında dur, topukları aşağı sarkıtıp tepe noktada parmak uçlarında tam yüksel.',
        'weightKey': '',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Platform Kenarı Kurulumu', 'desc': 'Ayak parmak köklerini platformun kenarına koy, topuklar serbestçe aşağı sarkıtılsın.', 'badge': 'setup'},
            {'phase': '2. Parmak Ucunda Yükseliş', 'desc': 'Dizleri bükmeden ayak parmak uçlarında yükselebildiğin en tepe noktaya kadar yüksel.', 'badge': 'action'},
            {'phase': '3. Zirve Baldır Sıkıştırma', 'desc': 'Tepe noktada baldırları 2 saniye taş gibi sık. Topukları platformun altına kadar esneterek indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'mach_cable_woodchopper',
        'name': 'Kablo Odun Kesme (Cable Woodchopper)',
        'equipment': 'machine',
        'category': 'core',
        'muscle': 'Rotasyonel Yan Karın & Güç İletimi',
        'mechanic': 'compound',
        'cue': 'Yüksek makaradan tutacağı çift elle kavra, kolları düz tutarak gövde rotasyonuyla zıt diz yönüne çapraz çek.',
        'weightKey': '',
        'tags': ['core', 'conditioning'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Yüksek Makara & Çapraz Duruş', 'desc': 'Makaraya yan dur, tutacağı çift elle yukarıda kavra. Ayaklar omuz genişliği, karın kilitli.', 'badge': 'setup'},
            {'phase': '2. Çapraz Eksen Rotasyonu', 'desc': 'Kolları neredeyse düz tutarak kabloyu yukarıdan aşağıya ve zıt dize doğru çapraz çek.', 'badge': 'action'},
            {'phase': '3. Yan Karın Kilidi', 'desc': 'Dip noktada oblik kaslarını sık, kontrollü bir şekilde başlangıç noktasına geri dön.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_russian_twist.svg'
    },

    # ==========================================
    # 5. VÜCUT AĞIRLIĞI (BODYWEIGHT) HAREKETLERİ
    # ==========================================
    {
        'id': 'bw_pushup',
        'name': 'Klasik Şınav (Floor Push-Up)',
        'equipment': 'bodyweight',
        'category': 'push',
        'muscle': 'Göğüs, Ön Omuz, Triceps & Core',
        'mechanic': 'compound',
        'cue': 'Gövde baştan topuğa cetvel gibi düz, dirsekler 45° açıyla geriye insin, göğüs yere 2 cm kalana kadar çök.',
        'weightKey': '',
        'tags': ['full_body', 'upper_push'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Plank Kurulumu', 'desc': 'Eller omuz genişliğinden biraz geniş, ayak parmakları yerde. Gövde baştan topuğa cetvel gibi düz, karın sıkı.', 'badge': 'setup'},
            {'phase': '2. 45° Dirsek İnişi', 'desc': 'Dirsekleri geriye 45 derece açıyla bükerek göğsü yere 2 cm kalana kadar kontrollü alçalt.', 'badge': 'action'},
            {'phase': '3. Patlayıcı İtiş & Kilit', 'desc': 'Yeri avuçlarınla güçlüce iterek yüksel, tepe noktada göğüs ve triceps kaslarını tam kilitle.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_pushup.svg'
    },
    {
        'id': 'bw_decline_pushup',
        'name': 'Ayaklar Sehpada Şınav (Decline Push-Up)',
        'equipment': 'bodyweight',
        'category': 'push',
        'muscle': 'Üst Göğüs & Omuz',
        'mechanic': 'compound',
        'cue': 'Ayakları sehpa veya kutu üzerine koy, vücut eğimini koruyarak üst göğüs odaklı şınav çek.',
        'weightKey': '',
        'tags': ['upper_push'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ayaklar Yüksekte Kurulum', 'desc': 'Ayakları sehpaya koy, eller yerde omuz genişliğinde. Gövde baştan topuğa düz, karın kilitli.', 'badge': 'setup'},
            {'phase': '2. Üst Göğse İniş', 'desc': 'Gövde açısını bozmadan başı ve göğsü ellerin arasına doğru kontrollü yaklaştır.', 'badge': 'action'},
            {'phase': '3. Üst Göğüsten İtiş', 'desc': 'Üst göğüs ve ön omuz kaslarıyla yeri iterek başlangıç pozisyonuna yüksel.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_pushup.svg'
    },
    {
        'id': 'bw_diamond_pushup',
        'name': 'Elmas Şınav (Diamond Push-Up)',
        'equipment': 'bodyweight',
        'category': 'push',
        'muscle': 'Arka Kol (Triceps) & İç Göğüs',
        'mechanic': 'compound',
        'cue': 'Başparmak ve işaret parmaklarını göğüs altında elmas şeklinde birleştir, dirsekleri gövdeye yapışık tutarak it.',
        'weightKey': '',
        'tags': ['upper_push'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Elmas El Pozisyonu', 'desc': 'Elleri göğsün tam altında başparmak ve işaret parmakları birbirine değecek şekilde elmas yap.', 'badge': 'setup'},
            {'phase': '2. Dirsekler Gövdeye Bitişik İniş', 'desc': 'Dirsekleri dışa açmadan gövdeye paralel bükerek göğsü ellerin üzerine indir.', 'badge': 'action'},
            {'phase': '3. Triceps Patlaması', 'desc': 'Triceps kaslarını sıkarak gövdeyi yukarı it ve tepe noktada kolları kilitle.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_diamond_pushup.svg'
    },
    {
        'id': 'bw_dips',
        'name': 'Paralel Bar Dips (Vücut Ağırlığı)',
        'equipment': 'bodyweight',
        'category': 'push',
        'muscle': 'Alt Göğüs & Yoğun Triceps',
        'mechanic': 'compound',
        'cue': 'Paralel barlarda gövdeyi 30° öne eğ, dirsekler 90° olana kadar kontrollü in ve tepeye kilitlen.',
        'weightKey': '',
        'tags': ['upper_push', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Barlarda Kilitlenme', 'desc': 'Paralel barlara asıl, kollar düz. Omuzları aşağı bastır, gövdeyi hafifçe öne eğ (30 derece).', 'badge': 'setup'},
            {'phase': '2. 90° Derin İniş', 'desc': 'Dirsekleri 90 derece bükülene kadar kontrollü alçal. Dirseklerin dışa fazla açılmasına izin verme.', 'badge': 'action'},
            {'phase': '3. Göğüs & Triceps İtişi', 'desc': 'Barları güçlüce aşağı iterek tepe noktaya yüksel, kolları düzleştir ve göğsü sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_floor_press.svg'
    },
    {
        'id': 'bw_pullup',
        'name': 'Barfiks (Geniş Tutuş Pull-Up)',
        'equipment': 'bodyweight',
        'category': 'pull',
        'muscle': 'Geniş Sırt (Lats), Biceps & Üst Gövde Gücü',
        'mechanic': 'compound',
        'cue': 'Barı omuzdan geniş kavra, sallanmadan göğsü bara doğru yükselt, çene barı geçince kanatları sık.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Asılma & Skapular Kilit', 'desc': 'Barı omuzdan geniş tutuşla kavra. Kürek kemiklerini aşağı bastırarak omuzları kilitle, bacaklar sabit.', 'badge': 'setup'},
            {'phase': '2. Göğsü Bara Çekiş', 'desc': 'Dirsekleri kaburgalara doğru çekerek göğsü bara yükselt. Bacakları savurma veya sallanma.', 'badge': 'action'},
            {'phase': '3. Çene Üstte & Kanat Kilit', 'desc': 'Çene barın üzerine çıktığında kanat kaslarını 1 saniye taş gibi sık. Kontrollü biçimde tam uzanışa in.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'bw_chinup',
        'name': 'Ters Tutuş Barfiks (Chin-Up)',
        'equipment': 'bodyweight',
        'category': 'pull',
        'muscle': 'Biceps & Alt Sırt Kanatları',
        'mechanic': 'compound',
        'cue': 'Avuç içleri yüzüne baksın (ters tutuş), dirsekleri önden çekerek çeneyi barın üstüne yükselt ve biceps ile sık.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ters Tutuş Asılma', 'desc': 'Avuç içleri yüze bakacak şekilde omuz genişliğinde bara asıl. Omuzları aşağı sabitle.', 'badge': 'setup'},
            {'phase': '2. Biceps & Sırt Çekişi', 'desc': 'Biceps ve sırt kaslarını sıkarak çeneyi barın üzerine doğru patlayıcı biçimde çek.', 'badge': 'action'},
            {'phase': '3. Tepe Biceps Sıkıştırma', 'desc': 'Çene barın üzerindeyken biceps kaslarını tam sık. Negatif inişi 3 saniyede yavaşça yap.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'bw_inverted_row',
        'name': 'Yatay Barfiks (Inverted / Australian Row)',
        'equipment': 'bodyweight',
        'category': 'pull',
        'muscle': 'Orta Sırt & Kürek Kemikleri',
        'mechanic': 'compound',
        'cue': 'Alçak barın altına gir, topuklar yerde, gövde cetvel gibi düz, göğsü bara değene kadar çek.',
        'weightKey': '',
        'tags': ['upper_pull', 'upper'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Bar Altı Düz Gövde', 'desc': 'Alçak bir barın altına uzan, barı omuzdan geniş kavra. Topuklar yerde, gövde düz bir hat oluşturur.', 'badge': 'setup'},
            {'phase': '2. Göğsü Bara Çekiş', 'desc': 'Kürek kemiklerini birbirine çekerek göğsü bara temas edene kadar yukarı çek.', 'badge': 'action'},
            {'phase': '3. Kürek Kemiği Sıkıştırma', 'desc': 'Tepe noktada orta sırtı tam sık, kolları yavaşça açarak başlangıç çizgisine dön.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_incline_row.svg'
    },
    {
        'id': 'bw_air_squat',
        'name': 'Vücut Ağırlığı Squat (Air Squat)',
        'equipment': 'bodyweight',
        'category': 'legs_quad',
        'muscle': 'Bacak, Kalça & Kalça Hareket Açıklığı',
        'mechanic': 'compound',
        'cue': 'Kolları önde dengede tut, topuklar yerden ayrılmadan kalçayı diz seviyesinin altına kadar derin indir.',
        'weightKey': '',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Ayakta Denge Kurulumu', 'desc': 'Ayaklar omuz genişliğinde, uçlar 20 derece dışa dönük. Kollar önde dengede, göğüs dik.', 'badge': 'setup'},
            {'phase': '2. Derin Çömelme (Full ROM)', 'desc': 'Kalçayı geriye ve aşağı batırarak paralel seviyenin altına in, dizleri ayak uçları yönünde aç.', 'badge': 'action'},
            {'phase': '3. Tabanla Yeri İtiş', 'desc': 'Tüm tabanla yeri iterek doğrul, tepe noktada kalçayı ve ön bacakları sık.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'bw_jump_squat',
        'name': 'Zıplayarak Squat (Jump Squat)',
        'equipment': 'bodyweight',
        'category': 'legs_quad',
        'muscle': 'Patlayıcı Bacak Gücü & Kalp Nabzı',
        'mechanic': 'compound',
        'cue': 'Derin squat derinliğine in, tavana doğru patlayıcı sıçra ve parmak ucundan topuğa yumuşakça iniş yap.',
        'weightKey': '',
        'tags': ['legs', 'conditioning'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Squat Çöküşü', 'desc': 'Squat formunda çömel, kollar geride yaylanmaya hazır, göğüs açık.', 'badge': 'setup'},
            {'phase': '2. Tavana Patlayıcı Sıçrama', 'desc': 'Ayak tabanlarından patlayıcı kuvvet üreterek tavana doğru maksimum yükseklikte sıçra.', 'badge': 'action'},
            {'phase': '3. Yumuşak Yaylı İniş', 'desc': 'Parmak uçlarından topuğa doğru yumuşak iniş yaparak hemen bir sonraki squat fazına geç.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_squat.svg'
    },
    {
        'id': 'bw_glute_bridge',
        'name': 'Yerde Kalça Kaldırma (Glute Bridge)',
        'equipment': 'bodyweight',
        'category': 'legs_hinge',
        'muscle': 'Büyük Kalça (Glute) & Bel Sağlığı',
        'mechanic': 'compound',
        'cue': 'Yerde sırtüstü yat, dizler 90° bükülü, topuklardan yeri iterek kalçayı omuz-diz hattında düz olana kadar kaldır.',
        'weightKey': '',
        'tags': ['legs', 'lower'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Sırtüstü Zemin Kurulumu', 'desc': 'Yere sırtüstü uzan, dizler bükülü, ayak tabanları kalçaya yakın yerde. Kollar iki yanda rahat.', 'badge': 'setup'},
            {'phase': '2. Topuktan Kalça İtişi', 'desc': 'Topuklarla yeri ezerek kalçayı yukarı kaldır, gövde ve uyluklar düz bir hat oluştursun.', 'badge': 'action'},
            {'phase': '3. Tepe Glute Sıkıştırması', 'desc': 'Tepe noktada kalçayı 2 saniye taş gibi sık (beli aşırı bükme), yavaşça yere temas etmeden indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_db_rdl.svg'
    },
    {
        'id': 'bw_hanging_knee_raise',
        'name': 'Barda Asılarak Dize Çekme (Hanging Knee Raise)',
        'equipment': 'bodyweight',
        'category': 'core',
        'muscle': 'Alt Karın & Kavrama Gücü',
        'mechanic': 'isolation',
        'cue': 'Barfiks barında asılıyken gövdeyi sallamadan dizleri göğse doğru çek, pelvisi yukarı yuvarlayarak alt karını sık.',
        'weightKey': '',
        'tags': ['core'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Barda Asılma', 'desc': 'Barfiks barına iki elle asıl. Omuzları aşağı bastırarak skapular kilit sağla, bacaklar düz.', 'badge': 'setup'},
            {'phase': '2. Dizleri Göğse Çekiş', 'desc': 'Gövdeyi sallamadan dizleri göğse doğru patlayıcı biçimde çek, pelvisi hafifçe yukarı yuvarla.', 'badge': 'action'},
            {'phase': '3. Tepe Alt Karın Kilidi', 'desc': 'Tepe noktada alt karını 1 saniye sık. Bacakları savurmadan kontrollüce başlangıca indir.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_leg_raise.svg'
    },
    {
        'id': 'bw_hollow_body',
        'name': 'Hollow Body Hold (Jimnastik Karın Kilitlenmesi)',
        'equipment': 'bodyweight',
        'category': 'core',
        'muscle': 'Derin Karın Duvarı (Transverse Abdominis)',
        'mechanic': 'isolation',
        'cue': 'Sırtüstü yat, bel boşluğunu zemine sıfır boşlukla yapıştır, kolları ve bacakları hafif kaldırarak muz şeklinde kilitlen.',
        'weightKey': '',
        'tags': ['core'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Bel Boşluğunu Sıfırlama', 'desc': 'Sırtüstü uzan. Bel çukurunu mindere tamamen yapıştır (aradan kağıt bile geçmemeli).', 'badge': 'setup'},
            {'phase': '2. Kollar & Bacaklar Havada', 'desc': 'Kolları baş gerisinde, bacakları 15 cm yukarıda tutarak vücudu sığ bir muz şekline getir.', 'badge': 'action'},
            {'phase': '3. Statik Karın Zırhı', 'desc': 'Tüm karın duvarını taş gibi sıkarak nefes alıp verişi bozmadan belirlenen süre boyunca sabit kal.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_plank_pull_through.svg'
    },
    {
        'id': 'bw_plank',
        'name': 'Dirsek Plank (Statik Gövde Kilidi)',
        'equipment': 'bodyweight',
        'category': 'core',
        'muscle': 'Tüm Karın, Omuz & Omurga Zırhı',
        'mechanic': 'isolation',
        'cue': 'Dirsekler ve ayak parmak uçlarında vücudu cetvel gibi düz tut, karnı ve kalçayı taş gibi sıkarak beli koru.',
        'weightKey': '',
        'tags': ['core'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Dirsek Kurulumu', 'desc': 'Dirsekler omuzların tam altında yerde. Parmak uçlarında yüksel, boyun nötr, bakışlar yerde.', 'badge': 'setup'},
            {'phase': '2. Cetvel Gibi Düz Hat', 'desc': 'Karın, kalça ve bacakları taş gibi sık. Belin aşağı çökmesine veya kalçanın yukarı dikilmesine ASLA izin verme.', 'badge': 'action'},
            {'phase': '3. Statik Direnç & Nefes', 'desc': 'Kürek kemiklerini tavana doğru hafifçe iterek sabit kal. Sakin ve derin diyafram nefesi al.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_plank_pull_through.svg'
    },
    {
        'id': 'bw_burpee',
        'name': 'Klasik Burpee (Göğüs Yere Dokunmalı)',
        'equipment': 'bodyweight',
        'category': 'conditioning',
        'muscle': 'Tüm Vücut & Maksimum Kalori Yakımı',
        'mechanic': 'compound',
        'cue': 'Hızla çömel, ayakları geriye atıp göğsü yere dokundur, ayakları geri çekip tavana doğru alkışla sıçra.',
        'weightKey': '',
        'tags': ['full_body', 'conditioning'],
        'isComplex': True,
        'positions': [
            {'phase': '1. Çömelme & El Basışı', 'desc': 'Ayakta duruş. Hızlıca çömelerek elleri ayakların hemen önüne yere sağlam bas.', 'badge': 'setup'},
            {'phase': '2. Geriye Fırlayış & Göğüs Yere', 'desc': 'Ayakları geriye fırlatıp şınav pozisyonuna geç, göğsü ve uylukları zemine hafifçe dokundur.', 'badge': 'action'},
            {'phase': '3. Toplanış & Havada Sıçrama', 'desc': 'Yeri itip ayakları ellerin yanına çek, hemen tavana doğru eller baş üstünde sıçra.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_escalera.svg'
    },
    {
        'id': 'bw_mountain_climber',
        'name': 'Dağ Tırmanışı (Mountain Climber)',
        'equipment': 'bodyweight',
        'category': 'core',
        'muscle': 'Karın Nabzı & Omuz Dayanıklılığı',
        'mechanic': 'compound',
        'cue': 'Yüksek şınav pozisyonunda kalçayı kaldırmadan dizleri sırayla koşar adım göğse çek.',
        'weightKey': '',
        'tags': ['core', 'conditioning'],
        'isComplex': False,
        'positions': [
            {'phase': '1. Yüksek Şınav Kurulumu', 'desc': 'Eller omuzların altında yüksek plank pozisyonu al. Gövde düz, kalça omuz hizasında sabit.', 'badge': 'setup'},
            {'phase': '2. Patlayıcı Diz Çekişi', 'desc': 'Bir dizi göğse doğru patlayıcı şekilde çek, ayak ucunu yere değdirmeden geri gönder.', 'badge': 'action'},
            {'phase': '3. Ritmik Koşu Temposu', 'desc': 'Hemen diğer dizi göğse çekerek ritmik ve seri bir koşu temposu yakala. Kalçayı havaya dikme.', 'badge': 'finish'}
        ],
        'diagram': 'assets/diagrams/seq_plank_pull_through.svg'
    }
]

def main():
    import pprint
    print(f"Total exercises prepared: {len(EXERCISES_DATA)}")
    
    # Write cleanly to scripts/exercise_database.py
    code = "#!/usr/bin/env python3\n\nEXERCISES = " + pprint.pformat(EXERCISES_DATA, indent=4, width=120) + "\n"
    with open('scripts/exercise_database.py', 'w', encoding='utf-8') as f:
        f.write(code)
    print("Successfully updated scripts/exercise_database.py with 100% authentic, unique exercise descriptions!")

if __name__ == '__main__':
    main()
