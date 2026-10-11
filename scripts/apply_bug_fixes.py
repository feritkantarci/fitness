#!/usr/bin/env python3
"""
apply_bug_fixes.py
Applies fixes for all 20 exercise bug reports:
- Updates diagram paths in scripts/exercise_database.py and index.html
- Extends guideLibrary with dedicated guides for all 17 new exercises
- Remaps exerciseGuideMap in index.html to the dedicated guides
- Updates sw.js with all new assets and bumps cache version
"""

import re
import sys
import pprint

def update_exercise_database():
    print("1. Updating scripts/exercise_database.py...")
    sys.path.insert(0, 'scripts')
    import exercise_database
    exercises = exercise_database.EXERCISES

    diagram_fixes = {
        'db_pullover': 'assets/diagrams/seq_pullover.svg',
        'db_incline_curl': 'assets/diagrams/seq_biceps_curl.svg',
        'bw_chinup': 'assets/diagrams/seq_chinup.svg',
    }

    for ex in exercises:
        if ex['id'] in diagram_fixes:
            ex['diagram'] = diagram_fixes[ex['id']]
            print(f"   Updated {ex['id']} diagram -> {ex['diagram']}")

    with open('scripts/exercise_database.py', 'w', encoding='utf-8') as f:
        f.write("# -*- coding: utf-8 -*-\nEXERCISES = ")
        pprint.pprint(exercises, stream=f, indent=4, width=120)
        f.write("\n")
    print("   ✅ scripts/exercise_database.py saved successfully.")

def update_index_html():
    print("\n2. Updating index.html...")
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # A. Update diagram paths in EXERCISES_DB
    html = html.replace('"id": "db_pullover", "isComplex": false, "mechanic": "compound", "muscle": "Geniş Sırt & Göğüs & Serratus", "name": "Dambıl Pullover", "positions":',
                        '"id": "db_pullover", "isComplex": false, "mechanic": "compound", "muscle": "Geniş Sırt & Göğüs & Serratus", "name": "Dambıl Pullover", "positions":') # anchor check
    
    # We can do regex replacements for the specific diagrams in EXERCISES_DB JSON
    def fix_diagram(match):
        obj = match.group(0)
        if '"id": "db_pullover"' in obj:
            obj = re.sub(r'"diagram":\s*"assets/diagrams/seq_skull_crusher\.svg"', '"diagram": "assets/diagrams/seq_pullover.svg"', obj)
        elif '"id": "db_incline_curl"' in obj:
            obj = re.sub(r'"diagram":\s*"assets/diagrams/seq_db_row\.svg"', '"diagram": "assets/diagrams/seq_biceps_curl.svg"', obj)
        elif '"id": "bw_chinup"' in obj:
            obj = re.sub(r'"diagram":\s*"assets/diagrams/seq_incline_row\.svg"', '"diagram": "assets/diagrams/seq_chinup.svg"', obj)
        return obj

    html = re.sub(r'\{[^{}]*"id":\s*"(?:db_pullover|db_incline_curl|bw_chinup)"[^{}]*\}', fix_diagram, html)

    # Direct safety string replace for diagrams
    html = html.replace('{"category": "pull", "cue": "Sehpada sırtüstü uzan, dambılı iki elle başın arkasına dirsekleri kırmadan uzat, kanatlarla göğüs üstüne çek.", "diagram": "assets/diagrams/seq_skull_crusher.svg", "equipment": "dumbbell", "id": "db_pullover"',
                        '{"category": "pull", "cue": "Sehpada sırtüstü uzan, dambılı iki elle başın arkasına dirsekleri kırmadan uzat, kanatlarla göğüs üstüne çek.", "diagram": "assets/diagrams/seq_pullover.svg", "equipment": "dumbbell", "id": "db_pullover"')

    html = html.replace('{"category": "pull", "cue": "Sehpayı 45-60° eğ, kollar arkada tamamen sarkıtılsın, omuzları oynatmadan biceps ile kıvır.", "diagram": "assets/diagrams/seq_db_row.svg", "equipment": "dumbbell", "id": "db_incline_curl"',
                        '{"category": "pull", "cue": "Sehpayı 45-60° eğ, kollar arkada tamamen sarkıtılsın, omuzları oynatmadan biceps ile kıvır.", "diagram": "assets/diagrams/seq_biceps_curl.svg", "equipment": "dumbbell", "id": "db_incline_curl"')

    html = html.replace('{"category": "pull", "cue": "Barı avuç içleri kendine bakacak şekilde omuz genişliğinde tut, çene barı tamamen geçene kadar çek.", "diagram": "assets/diagrams/seq_incline_row.svg", "equipment": "bodyweight", "id": "bw_chinup"',
                        '{"category": "pull", "cue": "Barı avuç içleri kendine bakacak şekilde omuz genişliğinde tut, çene barı tamamen geçene kadar çek.", "diagram": "assets/diagrams/seq_chinup.svg", "equipment": "bodyweight", "id": "bw_chinup"')

    new_guides_block = """
            incline_press: { form: 'assets/guides/guide_db_incline_press_form.jpg', anatomi: 'assets/guides/guide_db_incline_press_anatomi.jpg' },
            floor_press: { form: 'assets/guides/guide_db_floor_press_form.jpg', anatomi: 'assets/guides/guide_db_floor_press_anatomi.jpg' },
            arnold_press: { form: 'assets/guides/guide_db_arnold_press_form.jpg', anatomi: 'assets/guides/guide_db_arnold_press_anatomi.jpg' },
            bb_bench: { form: 'assets/guides/guide_bb_bench_press_form.jpg', anatomi: 'assets/guides/guide_bb_bench_press_anatomi.jpg' },
            chest_press: { form: 'assets/guides/guide_mach_chest_press_form.jpg', anatomi: 'assets/guides/guide_mach_chest_press_anatomi.jpg' },
            pec_deck: { form: 'assets/guides/guide_mach_pec_deck_form.jpg', anatomi: 'assets/guides/guide_mach_pec_deck_anatomi.jpg' },
            diamond_pushup: { form: 'assets/guides/guide_bw_diamond_pushup_form.jpg', anatomi: 'assets/guides/guide_bw_diamond_pushup_anatomi.jpg' },
            kb_press: { form: 'assets/guides/guide_kb_press_form.jpg', anatomi: 'assets/guides/guide_kb_press_anatomi.jpg' },
            cable_lateral: { form: 'assets/guides/guide_mach_cable_lateral_form.jpg', anatomi: 'assets/guides/guide_mach_cable_lateral_anatomi.jpg' },
            cable_row: { form: 'assets/guides/guide_mach_cable_row_form.jpg', anatomi: 'assets/guides/guide_mach_cable_row_anatomi.jpg' },
            chinup: { form: 'assets/guides/guide_bw_chinup_form.jpg', anatomi: 'assets/guides/guide_bw_chinup_anatomi.jpg' },
            inverted_row: { form: 'assets/guides/guide_bw_inverted_row_form.jpg', anatomi: 'assets/guides/guide_bw_inverted_row_anatomi.jpg' },
            chest_supported_row: { form: 'assets/guides/guide_db_chest_supported_row_form.jpg', anatomi: 'assets/guides/guide_db_chest_supported_row_anatomi.jpg' },
            renegade_row: { form: 'assets/guides/guide_db_renegade_row_form.jpg', anatomi: 'assets/guides/guide_db_renegade_row_anatomi.jpg' },
            incline_curl: { form: 'assets/guides/guide_db_incline_curl_form.jpg', anatomi: 'assets/guides/guide_db_incline_curl_anatomi.jpg' },
            gorilla_row: { form: 'assets/guides/guide_kb_gorilla_row_form.jpg', anatomi: 'assets/guides/guide_kb_gorilla_row_anatomi.jpg' },
            pendlay_row: { form: 'assets/guides/guide_bb_pendlay_row_form.jpg', anatomi: 'assets/guides/guide_bb_pendlay_row_anatomi.jpg' },
        };"""

    # Replace closing of guideLibrary with new guides + closing
    html = re.sub(r"air_squat:\s*\{\s*form:\s*'assets/guides/guide_bw_air_squat_form\.jpg',\s*anatomi:\s*'assets/guides/guide_bw_air_squat_anatomi\.jpg'\s*\},?\s*\}",
                  f"air_squat: {{ form: 'assets/guides/guide_bw_air_squat_form.jpg', anatomi: 'assets/guides/guide_bw_air_squat_anatomi.jpg' }},\n{new_guides_block}",
                  html)

    # B. Update exerciseGuideMap in index.html
    mappings_to_update = {
        "'db_incline_press': guideLibrary.bench": "'db_incline_press': guideLibrary.incline_press",
        "'bb_incline_bench': guideLibrary.bench": "'bb_incline_bench': guideLibrary.incline_press",
        "'db_floor_press': guideLibrary.bench": "'db_floor_press': guideLibrary.floor_press",
        "'bb_bench_press': guideLibrary.bench": "'bb_bench_press': guideLibrary.bb_bench",
        "'mach_chest_press': guideLibrary.bench": "'mach_chest_press': guideLibrary.chest_press",
        "'mach_cable_crossover': guideLibrary.bench": "'mach_cable_crossover': guideLibrary.chest_press",
        "'mach_pec_deck': guideLibrary.bench": "'mach_pec_deck': guideLibrary.pec_deck",
        "'bw_diamond_pushup': guideLibrary.pushup": "'bw_diamond_pushup': guideLibrary.diamond_pushup",
        "'db_arnold_press': guideLibrary.overhead": "'db_arnold_press': guideLibrary.arnold_press",
        "'kb_press': guideLibrary.overhead": "'kb_press': guideLibrary.kb_press",
        "'mach_cable_lateral': guideLibrary.lateral_raise": "'mach_cable_lateral': guideLibrary.cable_lateral",
        "'mach_cable_row': guideLibrary.saw_row": "'mach_cable_row': guideLibrary.cable_row",
        "'bw_chinup': guideLibrary.pullup": "'bw_chinup': guideLibrary.chinup",
        "'bw_inverted_row': guideLibrary.saw_row": "'bw_inverted_row': guideLibrary.inverted_row",
        "'db_chest_supported_row': guideLibrary.saw_row": "'db_chest_supported_row': guideLibrary.chest_supported_row",
        "'db_renegade_row': guideLibrary.saw_row": "'db_renegade_row': guideLibrary.renegade_row",
        "'db_incline_curl': guideLibrary.curl": "'db_incline_curl': guideLibrary.incline_curl",
        "'kb_gorilla_row': guideLibrary.saw_row": "'kb_gorilla_row': guideLibrary.gorilla_row",
        "'bb_pendlay_row': guideLibrary.saw_row": "'bb_pendlay_row': guideLibrary.pendlay_row",
    }

    for old_m, new_m in mappings_to_update.items():
        count = html.count(old_m)
        html = html.replace(old_m, new_m)
        print(f"   Replaced ({count}x): {old_m} -> {new_m}")

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("   ✅ index.html updated successfully.")

def update_service_worker():
    print("\n3. Updating sw.js (Cache v41 & New Assets)...")
    with open('sw.js', 'r', encoding='utf-8') as f:
        sw = f.read()

    # Bump cache version
    sw = re.sub(r"const CACHE_NAME = 'celik-kodu-cache-v\d+';", "const CACHE_NAME = 'celik-kodu-cache-v41';", sw)

    new_assets = [
        "'./assets/diagrams/seq_pullover.svg'",
        "'./assets/diagrams/seq_chinup.svg'",
        "'./assets/diagrams/seq_biceps_curl.svg'",
        "'./assets/guides/guide_db_incline_press_form.jpg'",
        "'./assets/guides/guide_db_incline_press_anatomi.jpg'",
        "'./assets/guides/guide_db_floor_press_form.jpg'",
        "'./assets/guides/guide_db_floor_press_anatomi.jpg'",
        "'./assets/guides/guide_db_arnold_press_form.jpg'",
        "'./assets/guides/guide_db_arnold_press_anatomi.jpg'",
        "'./assets/guides/guide_bb_bench_press_form.jpg'",
        "'./assets/guides/guide_bb_bench_press_anatomi.jpg'",
        "'./assets/guides/guide_mach_chest_press_form.jpg'",
        "'./assets/guides/guide_mach_chest_press_anatomi.jpg'",
        "'./assets/guides/guide_mach_pec_deck_form.jpg'",
        "'./assets/guides/guide_mach_pec_deck_anatomi.jpg'",
        "'./assets/guides/guide_bw_diamond_pushup_form.jpg'",
        "'./assets/guides/guide_bw_diamond_pushup_anatomi.jpg'",
        "'./assets/guides/guide_kb_press_form.jpg'",
        "'./assets/guides/guide_kb_press_anatomi.jpg'",
        "'./assets/guides/guide_mach_cable_lateral_form.jpg'",
        "'./assets/guides/guide_mach_cable_lateral_anatomi.jpg'",
        "'./assets/guides/guide_mach_cable_row_form.jpg'",
        "'./assets/guides/guide_mach_cable_row_anatomi.jpg'",
        "'./assets/guides/guide_bw_chinup_form.jpg'",
        "'./assets/guides/guide_bw_chinup_anatomi.jpg'",
        "'./assets/guides/guide_bw_inverted_row_form.jpg'",
        "'./assets/guides/guide_bw_inverted_row_anatomi.jpg'",
        "'./assets/guides/guide_db_chest_supported_row_form.jpg'",
        "'./assets/guides/guide_db_chest_supported_row_anatomi.jpg'",
        "'./assets/guides/guide_db_renegade_row_form.jpg'",
        "'./assets/guides/guide_db_renegade_row_anatomi.jpg'",
        "'./assets/guides/guide_db_incline_curl_form.jpg'",
        "'./assets/guides/guide_db_incline_curl_anatomi.jpg'",
        "'./assets/guides/guide_kb_gorilla_row_form.jpg'",
        "'./assets/guides/guide_kb_gorilla_row_anatomi.jpg'",
        "'./assets/guides/guide_bb_pendlay_row_form.jpg'",
        "'./assets/guides/guide_bb_pendlay_row_anatomi.jpg'"
    ]

    for asset in new_assets:
        if asset not in sw:
            sw = sw.replace("const ASSETS = [\n  './',", f"const ASSETS = [\n  './',\n  {asset},")

    with open('sw.js', 'w', encoding='utf-8') as f:
        f.write(sw)
    print("   ✅ sw.js updated to celik-kodu-cache-v41 with all new assets.")

if __name__ == '__main__':
    update_exercise_database()
    update_index_html()
    update_service_worker()
