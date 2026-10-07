#!/usr/bin/env python3
import json
import os
import re

# Load existing exercises
from exercise_database import EXERCISES

DIAGRAMS = {
    "db_bench_press": "assets/diagrams/seq_floor_press.svg",
    "db_floor_press": "assets/diagrams/seq_floor_press.svg",
    "db_overhead_press": "assets/diagrams/seq_db_press.svg",
    "db_arnold_press": "assets/diagrams/seq_db_press.svg",
    "db_lateral_raise": "assets/diagrams/seq_lateral_raise.svg",
    "db_skullcrusher": "assets/diagrams/seq_skull_crusher.svg",
    "db_saw_row": "assets/diagrams/seq_db_row.svg",
    "db_chest_supported_row": "assets/diagrams/seq_incline_row.svg",
    "db_renegade_row": "assets/diagrams/seq_renegade_row.svg",
    "db_goblet_squat": "assets/diagrams/seq_db_squat.svg",
    "db_front_squat": "assets/diagrams/seq_db_clean_squat.svg",
    "db_walking_lunge": "assets/diagrams/seq_db_lunge.svg",
    "db_reverse_lunge": "assets/diagrams/seq_db_lunge.svg",
    "db_rdl": "assets/diagrams/seq_db_rdl.svg",
    "db_single_leg_rdl": "assets/diagrams/seq_db_single_leg_rdl.svg",
    "db_swing": "assets/diagrams/seq_db_swing.svg",
    "db_snatch": "assets/diagrams/seq_db_snatch.svg",
    "db_farmers_walk": "assets/diagrams/seq_farmers_walk.svg",
    "db_suitcase_carry": "assets/diagrams/seq_farmers_walk.svg",
    "db_russian_twist": "assets/diagrams/seq_russian_twist.svg",
    "kb_swing": "assets/diagrams/seq_db_swing.svg",
    "kb_clean": "assets/diagrams/seq_db_clean_squat.svg",
    "kb_press": "assets/diagrams/seq_db_press.svg",
    "kb_goblet_squat": "assets/diagrams/seq_db_squat.svg",
    "kb_half_snatch": "assets/diagrams/seq_db_snatch.svg",
    "kb_gorilla_row": "assets/diagrams/seq_db_row.svg",
    "kb_windmill": "assets/diagrams/seq_windmill.svg",
    "kb_turkish_getup": "assets/diagrams/seq_windmill.svg",
    "kb_thruster": "assets/diagrams/seq_thruster.svg",
    "bw_pushup": "assets/diagrams/seq_pushup.svg",
    "bw_diamond_pushup": "assets/diagrams/seq_diamond_pushup.svg",
    "bw_air_squat": "assets/diagrams/seq_db_squat.svg",
    "bw_hanging_knee_raise": "assets/diagrams/seq_leg_raise.svg",
    "bw_burpee": "assets/diagrams/seq_escalera.svg",
    "bw_plank": "assets/diagrams/seq_plank_pull_through.svg"
}

# Helper to build positions for any exercise
def generate_positions_for_exercise(ex):
    eid = ex["id"]
    name = ex["name"]
    cat = ex["category"]
    equip = ex["equipment"]
    cue = ex.get("cue", "")

    # Check if complex movement
    is_complex = False
    complex_ids = [
        "kb_half_snatch", "db_snatch", "kb_clean", "kb_thruster",
        "db_renegade_row", "kb_windmill", "kb_turkish_getup", "bw_burpee",
        "bb_deadlift", "bb_pendlay_row", "bw_jump_squat", "mach_cable_woodchopper"
    ]
    if eid in complex_ids or "snatch" in eid or "clean" in eid or "thruster" in eid or "burpee" in eid or "turkish" in eid or "renegade" in eid:
        is_complex = True

    # 1. Complex specific hand-crafted biomechanical positions
    if eid in ["db_snatch", "kb_half_snatch"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Kalça Menteşesi)", "desc": "Ayaklar omuz genişliğinde. Ağırlık bacak arasında, göğüs dik, bel kavisli ve kalça geriye itilmiş.", "badge": "setup"},
            {"phase": "2. Patlayıcı İvmelenme (Triple Ext.)", "desc": "Topuklardan ve kalçadan patlayıcı güç üreterek dizleri ve kalçayı düzleştir, ağırlığı dikey fırlat.", "badge": "action"},
            {"phase": "3. Altına Girme & Karşılama", "desc": "Ağırlık göğüs hizasına çıktığında elini ağırlığın altından kaydırarak baş üstüne doğru uzat.", "badge": "trans"},
            {"phase": "4. Bitiriş & Tepe Kilitleme", "desc": "Kol baş üstünde dimdik kilitlenir, gövde stabil, bakışlar karşıda. Kontrollü indirip başlangıca dön.", "badge": "finish"}
        ]
    elif eid in ["kb_clean"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Bacak Arası Duruş)", "desc": "Kettlebell bacak arasında, sırt düz, kalça menteşesi kurulu, serbest kol dengede.", "badge": "setup"},
            {"phase": "2. Patlayıcı Kalça İtişi", "desc": "Kalçayı güçlüce öne vurarak ağırlığa dikey ivme kazandır, dirseği gövdeye yakın tut.", "badge": "action"},
            {"phase": "3. Rack Pozisyonuna Yumuşak Geçiş", "desc": "Gülle ön kola çarpmadan elini tutamaktan yumuşakça kaydırarak göğse al.", "badge": "trans"},
            {"phase": "4. Bitiriş & Kilitleme", "desc": "Ağırlık göğüs-omuz çukurunda (rack), dirsek kaburga üzerinde destekli, karın ve kalça kilitli.", "badge": "finish"}
        ]
    elif eid in ["kb_thruster"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Front Rack Duruş)", "desc": "Ağırlıklar göğüs hizasında (rack pozisyonu), dirsekler dik, ayaklar squat genişliğinde.", "badge": "setup"},
            {"phase": "2. Derin Çömelme (Squat)", "desc": "Göğsü düşürmeden kalçayı topuklara doğru kontrollü indir, dizler ayak uçlarını takip etsin.", "badge": "action"},
            {"phase": "3. Patlayıcı İtiş & Güç Aktarımı", "desc": "Topuklardan patlayıcı kalkarken bacakların ürettiği itme gücünü doğrudan omuzlara aktar.", "badge": "trans"},
            {"phase": "4. Bitiriş (Baş Üstü Kilit)", "desc": "Kollar baş üstünde kilitlenir, kulaklar kolların arasında kalır. Ağırlığı göğse indirerek ritmi koru.", "badge": "finish"}
        ]
    elif eid in ["db_renegade_row"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Yüksek Şınav Plank)", "desc": "Eller dambılların üzerinde, ayaklar omuzdan biraz daha geniş (denge için), gövde taş gibi düz.", "badge": "setup"},
            {"phase": "2. Sağ Kol Testere Çekiş", "desc": "Kalçayı hiç sağa sola oynatmadan sağ dambılı kalça cebine doğru kavisli çek, küreği sıkıştır.", "badge": "action"},
            {"phase": "3. Kontrollü İniş & Dengeleme", "desc": "Dambılı zemine sessizce bırak, karın kaslarını kilitleyerek gövdeyi hizala.", "badge": "trans"},
            {"phase": "4. Sol Kol Çekiş & Bitiriş", "desc": "Aynı stabiliteyle sol dambılı çek, tepe noktada sık ve başlangıç plank pozisyonuna dön.", "badge": "finish"}
        ]
    elif eid in ["kb_windmill"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Baş Üstü Kilitleme)", "desc": "Ağırlık tek elle baş üstünde kilitli. Ayaklar ağırlığın ters yönüne 45° döndürülmüş.", "badge": "setup"},
            {"phase": "2. Kalça Kaydırma & Menteşe", "desc": "Gözlerini tavandaki ağırlıktan ayırmadan kalçayı ağırlığın olduğu yöne doğru dışa it.", "badge": "action"},
            {"phase": "3. Gövde Rotasyonu & İniş", "desc": "Serbest eli bacak boyunca yere doğru kaydır, göğsü açık tutarak yere dokunmaya çalış.", "badge": "trans"},
            {"phase": "4. Bitiriş & Doğrulma", "desc": "Yan karın (oblik) ve kalçadan güç alarak gövdeyi dikleştir, ağırlık baş üstünde sabit kalır.", "badge": "finish"}
        ]
    elif eid in ["kb_turkish_getup"]:
        return is_complex, [
            {"phase": "1. Yerde Başlangıç (Pres Duruşu)", "desc": "Sırtüstü yat, ağırlık olan el yukarı kilitli, aynı tarafın dizi bükülü ve taban yerde.", "badge": "setup"},
            {"phase": "2. Dirseğe ve Avuca Kalkış", "desc": "Gözler ağırlıkta, serbest dirseğe sonra avuca yaslanarak gövdeyi 45° kaldır.", "badge": "action"},
            {"phase": "3. Kalça Köprüsü & Bacak Çekme", "desc": "Kalçayı yerden fırlat (köprü), alttaki düz bacağı geriye bükerek dizini yere koy.", "badge": "trans"},
            {"phase": "4. Gövdeyi Doğrultma (Lunge Duruşu)", "desc": "Elin yerden temasını kes, gövdeyi dikleştirerek klasik lunge konumuna gel.", "badge": "trans"},
            {"phase": "5. Bitiriş (Tam Ayağa Kalkış)", "desc": "Öndeki bacakla ayağa kalk, ayakları birleştir, baş üstü kilitli dur. Adımları geriye takip ederek yat.", "badge": "finish"}
        ]
    elif eid in ["bw_burpee"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Ayakta Hazır Duruş)", "desc": "Ayaklar omuz genişliğinde, dik duruş, nefes al ve konsantre ol.", "badge": "setup"},
            {"phase": "2. Çömelme & Elleri Yere Koyma", "desc": "Hızlıca çömelerek elleri ayakların hemen önüne sağlamca zeminle birleştir.", "badge": "action"},
            {"phase": "3. Geriye Sıçrama & Şınav", "desc": "Ayakları geriye sıçratarak şınav pozisyonuna gel ve göğsünü zemine hafifçe dokundur.", "badge": "trans"},
            {"phase": "4. Ayakları Toplama", "desc": "Yerden kendini iterek ayakları ellerin hemen yanına doğru patlayıcı sıçrat.", "badge": "trans"},
            {"phase": "5. Bitiriş & Zıplama", "desc": "Kolları baş üstüne kaldırarak yukarı zıpla, tepe noktada alkış yap ve yumuşak in.", "badge": "finish"}
        ]
    elif eid in ["bb_deadlift"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Bar Kaval Hizasında)", "desc": "Bar kaval kemiğine 2-3 cm yakın, kalça dizlerden yukarıda, göğüs dik, omuzlar barın hizasında.", "badge": "setup"},
            {"phase": "2. Yerden Çekiş (Diz Altı Fazı)", "desc": "Zemini ayaklarınla iterek bacaklardan güç al, bar kaval boyunca dik bir hatta yükselsin.", "badge": "action"},
            {"phase": "3. Diz Geçişi & Kalça İtişi", "desc": "Bar diz kapağını geçer geçmez kalçayı güçlüce öne sür, sırt açısını bozma.", "badge": "trans"},
            {"phase": "4. Bitiriş (Tam Kilit)", "desc": "Kalça ve dizler tam kilitlenir, göğüs dik, omuzlar geride (beli geriye bükme). Barı kontrollü indir.", "badge": "finish"}
        ]
    elif eid in ["mach_cable_woodchopper"]:
        return is_complex, [
            {"phase": "1. Başlangıç (Yüksek Tutuş)", "desc": "Kablonun yanında dur, çift elle tutamağı yukarıda kavra, gövde hafifçe makineye dönük.", "badge": "setup"},
            {"phase": "2. Diagonal Çekiş & Rotasyon", "desc": "Kolları hafif bükük tutarak ağırlığı yukarıdan çapraz olarak karşı diz hizasına doğru indir.", "badge": "action"},
            {"phase": "3. Karın Sıkıştırma (Pik Faz)", "desc": "Gövde rotasyonunu tamamla, arka ayak parmak ucunda dönsün, oblik kaslarını sonuna kadar sık.", "badge": "trans"},
            {"phase": "4. Bitiriş & Kontrollü Dönüş", "desc": "Kasılmayı 1 saniye koruduktan sonra karın kaslarıyla direnerek kontrollü şekilde başlangıca dön.", "badge": "finish"}
        ]

    # 2. General Categories
    if cat == "push":
        if "bench" in eid or "floor" in eid or "chest" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Sehpaya veya zemine sağlam uzan. Kürek kemiklerini birbirine yanaştır, ayaklar yerde sabit, dambıllar göğüs hizasında.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (İtiş Fazı)", "desc": "Nefes vererek dirsekleri 45° açıda tutarak dambılları dikey hatta yukarı doğru patlayıcı it.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Kollar yukarıda dik kilitlenir, göğüs kasları tepe noktada sıkılır, dambıllar birbirine çarpmadan kontrollü iner.", "badge": "finish"}
            ]
        elif "press" in eid or "shoulder" in eid or "arnold" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Dambıllar omuz hizasında, avuçlar karşıya bakar. Karın ve kalça kilitli, omurga dimdik nötr pozisyonda.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Pres Fazı)", "desc": "Nefes vererek ağırlığı dikey bir hatta baş üstüne doğru it. Beli geriye doğru bükmemeye dikkat et.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Kollar baş üstünde kilitlenir, kulaklar kolların arasına gelir. 1 saniye duraklayıp kontrollü omuza indir.", "badge": "finish"}
            ]
        elif "lateral" in eid or "fly" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Ayakta dik dur, ağırlıklar bacakların yanında, dirsekler hafif kırık (sabit açı), omuzlar geride.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Kaldırış)", "desc": "Dirsekleri lider yaparak ağırlıkları yana doğru omuz hizasına kadar sürahi döker gibi kaldır.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Kollar omuz hizasında yatay durur, yan omuz tepe kasılmada sıkılır. Yerçekimine direnerek yavaşça indir.", "badge": "finish"}
            ]
        elif "pushup" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Eller göğüs hizasında omuzdan biraz geniş, parmaklar açık, ayaklar bitişik, vücut baştan topuğa taş gibi düz.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (İniş)", "desc": "Dirsekleri 45° açıyla geriye doğru bükerek göğsü zemine 2-3 cm kalana kadar kontrollü indir.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Zemini avuç içlerinle güçlüce iterek kolları tam kilitle, göğsü ve tricepsleri tepe noktada sık.", "badge": "finish"}
            ]
        else: # triceps etc
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Dirsekleri gövdeye veya başın iki yanına sabitle. Omuz hareketini sıfırla, yükü sadece arka kola ver.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Açılış/İtiş)", "desc": "Dirsek eklemini hiç oynatmadan sadece ön kolları ileriye/yukarıya doğru açarak tricepsleri kas.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Kollar tam düzleştiğinde arka kolda maksimum yanmayı hisset, 1 saniye kilitli kalıp yavaşça bük.", "badge": "finish"}
            ]

    elif cat == "pull":
        if "pulldown" in eid or "pullup" in eid or "chinup" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Bara asıl veya makinede otur. Omuz bıçaklarını aşağı çek (depresyon), göğsü hafifçe yukarı kaldır.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Çekiş Fazı)", "desc": "Dirsekleri kalçaya doğru çeker gibi çekerek barı üst göğüs / köprücük kemiğine yaklaştır.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Bar çene altında, kürek kemikleri birbirine sımsıkı kenetli, sırt kasları kilitli. Yavaşça kollar düzleşene kadar bırak.", "badge": "finish"}
            ]
        elif "row" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Bel 45° eğik veya sehpaya dayalı, omurga dümdüz nötr. Kollar ağırlıkla dikey sarkıtılmış, omuzlar rahat.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Küreğe Çekiş)", "desc": "Dirseği arkaya ve kalça cebine doğru kavisli çek. Bicepsle değil, sırt kaslarını sıkıştırarak çek.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Dirsek gövdenin gerisine geçer, kürek kemiği omurgaya yapışır. 1 sn sık ve kontrollü şekilde uzat.", "badge": "finish"}
            ]
        else: # bicep curl / face pull
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Kollar bacakların yanında düz, omuzlar sabit, göğüs dik. Dirsekler gövdeye hafifçe yapışık.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Kıvırma Fazı)", "desc": "Sadece ön kollar hareket ederek ağırlığı omuza doğru kaldır, dirsekleri öne arkaya sallama.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Tepe noktada pazuları (biceps) sonuna kadar sıkıştır, 1 sn durakla ve ağırlığı frenleyerek 3 saniyede indir.", "badge": "finish"}
            ]

    elif cat == "legs_quad":
        if "squat" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Ayaklar omuz genişliğinde, ayak uçları 15-30° dışa dönük. Ağırlık göğüste sıkıca tutulur, göğüs dik.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Derin Çömelme)", "desc": "Dizleri ayak uçları yönünde açarak kalçayı topuklara doğru indir. Sırt düz, ağırlık tabanın ortasında.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Uyluklar en az yere paralel olduğunda dur. Topuklardan yeri iterek dikleş, tepe noktada kalçayı sık.", "badge": "finish"}
            ]
        elif "lunge" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Dik duruş, ellerde dambıllar yanda sarkıtılmış, bakışlar karşıda, karın sıkı.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Adım ve Çöküş)", "desc": "Geniş bir adım at ve her iki dizin açısı 90° olana kadar dikey çök. Öndeki diz ayak parmak ucunu geçmesin.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Arka diz yere hafifçe değmeden dur. Öndeki bacağın topuğuyla yeri güçlüce iterek başlangıca dön.", "badge": "finish"}
            ]
        else: # leg press / extension
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Makineye tam yerleş, bel boşluğunu mindere yapıştır, eklem açısını doğru hizala.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (İtiş/Uzatma)", "desc": "Nefes vererek ön bacak kaslarını sıkarak platformu it veya bacakları dümdüz uzat.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Tepe noktada kuadriseps kaslarını taş gibi sık (dizleri aşırı kilitleme). Kontrollü geri dön.", "badge": "finish"}
            ]

    elif cat == "legs_hinge":
        if "swing" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu (Menteşe Kurulumu)", "desc": "Ayaklar omuzdan geniş. Ağırlık bacak arasında, kalça geride, kaval kemikleri dik, göğüs karşıya bakar.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Patlayıcı Kalça Vuruşu)", "desc": "Topuklardan yeri itip kalçayı güçlüce öne vur. Kollar sadece halat gibi ağırlığı taşır.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu (Çelik Zırh Kilidi)", "desc": "Ağırlık göğüs hizasında süzülür, vücut ayakta plank gibi dimdik kilitlenir. Ağırlığı bacak arasına bırak.", "badge": "finish"}
            ]
        elif "rdl" in eid or "deadlift" in eid:
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Ayakta dik duruş, ağırlıklar uylukların önünde. Omuzlar geride, kürek kemikleri kilitli.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Kalça Geriye Menteşe)", "desc": "Dizleri kırmadan sadece kalçayı arkaya iterek ağırlıkları bacaklara yakın şekilde diz altına kadar kaydır.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Hamstring ve kalçada yoğun esneme hissedildiğinde kalçayı sıkarak doğrul ve dik duruşa kilitlen.", "badge": "finish"}
            ]
        else: # hip thrust / leg curl
            return False, [
                {"phase": "1. Başlangıç Pozisyonu", "desc": "Kürek kemikleri sehpada veya mindere uzanmış. Dizler 90° bükülü, ağırlık kalça kıvrımında sabit.", "badge": "setup"},
                {"phase": "2. Ara Pozisyon (Kalça Kaldırışı)", "desc": "Topuklardan yeri iterek kalçayı yukarı fırlat. Gövde dizden omuza düz bir çizgi olmalı.", "badge": "action"},
                {"phase": "3. Bitiriş Pozisyonu", "desc": "Tepe noktada kalçayı 2 saniye maksimum güçle sıkıştır, beli aşırı kavis yapmadan yavaşça indir.", "badge": "finish"}
            ]

    else: # core / conditioning
        return False, [
            {"phase": "1. Başlangıç Pozisyonu", "desc": "Mindere yerleş veya ağırlığı kavra. Omurga ve karın kaslarını içeri çekerek merkez bölgesini kilitle.", "badge": "setup"},
            {"phase": "2. Ara Pozisyon (Hareketi Yürütme)", "desc": "Nefes vererek hareketi kontrollü tamamla (rotasyon, diz çekiş veya bacak kaldırma).", "badge": "action"},
            {"phase": "3. Bitiriş Pozisyonu", "desc": "Karın kaslarında maksimum gerilim sağla, 1 saniye durakla ve başlangıç pozisyonuna kontrollü dön.", "badge": "finish"}
        ]

# Update exercises
enriched_count = 0
for ex in EXERCISES:
    is_complex, positions = generate_positions_for_exercise(ex)
    ex["isComplex"] = is_complex
    ex["positions"] = positions
    if ex["id"] in DIAGRAMS:
        ex["diagram"] = DIAGRAMS[ex["id"]]
    else:
        ex["diagram"] = None
    enriched_count += 1

import pprint

output_path = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/scripts/exercise_database.py"

with open(output_path, "w", encoding="utf-8") as f:
    f.write("#!/usr/bin/env python3\n\n")
    f.write("EXERCISES = " + pprint.pformat(EXERCISES, indent=4, width=120, sort_dicts=False) + "\n")

print(f"Successfully enriched {enriched_count} exercises with step positions and diagrams!")
