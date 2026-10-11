#!/usr/bin/env python3
import json
import re
import sys

def apply_fixes():
    print("--- 1. Updating exercise_database.py ---")
    with open('scripts/exercise_database.py', 'r', encoding='utf-8') as f:
        ed_code = f.read()

    name_map = {
        'bw_hanging_knee_raise': ('Barda Dize Çekme', ['core'], ['back', 'shoulders']),
        'bw_hollow_body': ('Hollow Body', ['core'], []),
        'bw_plank': ('Plank', ['core'], ['shoulders', 'glutes']),
        'bw_burpee': ('Burpee', ['chest', 'quads'], ['core', 'shoulders']),
        'bw_mountain_climber': ('Mountain Climber', ['core'], ['quads', 'shoulders']),
        'db_pullover': ('Dambıl Pullover', None, None),
        'mach_cable_woodchopper': ('Kablo Woodchopper', None, None),
        'bw_glute_bridge': ('Glute Bridge', None, None),
        'bw_air_squat': ('Air Squat', None, None),
        'bw_jump_squat': ('Jump Squat', None, None),
        'kb_swing': ('Kettlebell Swing', None, None),
        'db_swing': ('Dambıl Swing', None, None),
        'kb_clean': ('Kettlebell Clean', None, None),
        'kb_press': ('Kettlebell Press', None, None),
        'kb_half_snatch': ('Kettlebell Snatch', None, None),
        'kb_gorilla_row': ('Gorilla Row', None, None),
        'kb_windmill': ('Kettlebell Windmill', None, None),
        'kb_turkish_getup': ('Turkish Get-Up', None, None),
        'kb_halo': ('Kettlebell Halo', None, None),
        'kb_thruster': ('Kettlebell Thruster', None, None),
        'bb_bench_press': ('Barbell Bench', None, None),
        'bb_incline_bench': ('Incline Barbell Bench', None, None),
        'bb_overhead_press': ('Barbell Omuz Presi', None, None),
        'bb_back_squat': ('Barbell Back Squat', None, None),
        'bb_front_squat': ('Barbell Front Squat', None, None),
        'bb_deadlift': ('Barbell Deadlift', None, None),
        'bb_rdl': ('Barbell RDL', None, None),
        'bb_hip_thrust': ('Barbell Hip Thrust', None, None),
        'bb_bent_over_row': ('Barbell Row', None, None),
        'bb_pendlay_row': ('Pendlay Row', None, None),
        'bb_biceps_curl': ('Barbell Curl', None, None),
        'bb_close_grip_bench': ('Dar Tutuş Bench', None, None),
        'mach_lat_pulldown': ('Lat Pulldown', None, None),
        'mach_cable_row': ('Kablo Row', None, None),
        'mach_face_pull': ('Face Pull', None, None),
        'mach_chest_press': ('Makine Göğüs Presi', None, None),
        'mach_cable_crossover': ('Kablo Crossover', None, None),
        'mach_pec_deck': ('Pec Deck Kelebek', None, None),
        'mach_triceps_pushdown': ('Halat Triceps Pushdown', None, None),
        'mach_cable_biceps': ('Kablo Biceps Curl', None, None),
        'mach_cable_lateral': ('Kablo Lateral Raise', None, None),
        'mach_leg_press': ('45° Leg Press', None, None),
        'mach_leg_extension': ('Leg Extension', None, None),
        'mach_leg_curl': ('Leg Curl', None, None),
        'mach_calf_raise': ('Calf Raise', None, None),
        'bw_pushup': ('Şınav (Push-Up)', None, None),
        'bw_decline_pushup': ('Decline Şınav', None, None),
        'bw_diamond_pushup': ('Elmas Şınav', None, None),
        'bw_dips': ('Dips', None, None),
        'bw_pullup': ('Barfiks (Pull-Up)', None, None),
        'bw_chinup': ('Chin-Up (Ters Barfiks)', None, None),
        'bw_inverted_row': ('Yatay Barfiks', None, None),
        'db_bench_press': ('Dambıl Bench Press', None, None),
        'db_incline_press': ('Incline Dambıl Press', None, None),
        'db_floor_press': ('Dambıl Floor Press', None, None),
        'db_overhead_press': ('Dambıl Omuz Presi', None, None),
        'db_arnold_press': ('Arnold Press', None, None),
        'db_lateral_raise': ('Dambıl Lateral Raise', None, None),
        'db_bulgarian_squat': ('Bulgar Split Squat', None, None),
        'db_walking_lunge': ('Walking Lunge', None, None),
        'db_reverse_lunge': ('Reverse Lunge', None, None),
        'db_rdl': ('Dambıl RDL', None, None),
        'db_single_leg_rdl': ('Tek Bacak RDL', None, None),
        'db_saw_row': ('Dambıl Saw Row', None, None),
        'db_chest_supported_row': ('Göğüs Destekli Row', None, None),
        'db_renegade_row': ('Renegade Row', None, None),
        'db_hammer_curl': ('Hammer Curl', None, None),
        'db_incline_curl': ('Incline Dambıl Curl', None, None),
        'db_farmers_walk': ('Farmer\'s Walk', None, None),
        'db_suitcase_carry': ('Suitcase Carry', None, None),
        'db_russian_twist': ('Russian Twist', None, None)
    }

    # Import EXERCISES from exercise_database
    sys.path.insert(0, 'scripts')
    import exercise_database
    exercises = exercise_database.EXERCISES

    for ex in exercises:
        eid = ex['id']
        if eid in name_map:
            new_name, new_prim, new_sec = name_map[eid]
            ex['name'] = new_name
            if new_prim is not None:
                ex['primaryMuscles'] = new_prim
            if new_sec is not None:
                ex['secondaryMuscles'] = new_sec

    import pprint
    with open('scripts/exercise_database.py', 'w', encoding='utf-8') as f:
        f.write("# -*- coding: utf-8 -*-\nEXERCISES = ")
        pprint.pprint(exercises, stream=f, indent=4, width=120)
        f.write("\n")
    print("Updated scripts/exercise_database.py successfully!")

    # Helper function to update HTML files (index.html, salon_kilavuzu_mobil.html)
    def update_html_file(file_path):
        print(f"Updating {file_path}...")
        with open(file_path, 'r', encoding='utf-8') as f:
            html = f.read()

        # 1. Update EXERCISES_DB JSON
        exercises_json = json.dumps(exercises, ensure_ascii=False)
        html = re.sub(r'const EXERCISES_DB = \[.*?\];', f'const EXERCISES_DB = {exercises_json};', html)

        # 2. Update guideLibrary definitions
        # Find guideLibrary and inject the new entries if missing
        new_guide_entries = """
            hollow_body: { form: 'assets/guides/guide_bw_hollow_body_form.jpg', anatomi: 'assets/guides/guide_bw_hollow_body_anatomi.jpg' },
            mountain_climber: { form: 'assets/guides/guide_bw_mountain_climber_form.jpg', anatomi: 'assets/guides/guide_bw_mountain_climber_anatomi.jpg' },
            burpee: { form: 'assets/guides/guide_bw_burpee_form.jpg', anatomi: 'assets/guides/guide_bw_burpee_anatomi.jpg' },
            pullover: { form: 'assets/guides/guide_db_pullover_form.jpg', anatomi: 'assets/guides/guide_db_pullover_anatomi.jpg' },
            cable_woodchopper: { form: 'assets/guides/guide_mach_cable_woodchopper_form.jpg', anatomi: 'assets/guides/guide_mach_cable_woodchopper_anatomi.jpg' },
            glute_bridge: { form: 'assets/guides/guide_bw_glute_bridge_form.jpg', anatomi: 'assets/guides/guide_bw_glute_bridge_anatomi.jpg' },
            kb_swing: { form: 'assets/guides/guide_kb_swing_form.jpg', anatomi: 'assets/guides/guide_kb_swing_anatomi.jpg' },
            air_squat: { form: 'assets/guides/guide_bw_air_squat_form.jpg', anatomi: 'assets/guides/guide_bw_air_squat_anatomi.jpg' },"""

        # In both guideLibrary blocks, add after windmill or at end of guideLibrary
        def add_guides(match):
            block = match.group(0)
            if 'hollow_body:' in block:
                return block
            # insert before the closing brace
            last_brace = block.rfind('}')
            return block[:last_brace].rstrip() + ',' + new_guide_entries + '\n        }'

        html = re.sub(r'const guideLibrary = \{[\s\S]*?\};', add_guides, html)

        # 3. Update exerciseGuideMap mappings
        mapping_updates = {
            "'bw_hollow_body': guideLibrary.plank": "'bw_hollow_body': guideLibrary.hollow_body",
            "'bw_mountain_climber': guideLibrary.plank": "'bw_mountain_climber': guideLibrary.mountain_climber",
            "'bw_burpee': guideLibrary.pushup": "'bw_burpee': guideLibrary.burpee",
            "'db_pullover': guideLibrary.saw_row": "'db_pullover': guideLibrary.pullover",
            "'mach_cable_woodchopper': guideLibrary.russian_twist": "'mach_cable_woodchopper': guideLibrary.cable_woodchopper",
            "'bw_glute_bridge': guideLibrary.hip_thrust": "'bw_glute_bridge': guideLibrary.glute_bridge",
            "'kb_swing': guideLibrary.swing": "'kb_swing': guideLibrary.kb_swing",
            "'bw_air_squat': guideLibrary.goblet_squat": "'bw_air_squat': guideLibrary.air_squat",
            "'bw_jump_squat': guideLibrary.goblet_squat": "'bw_jump_squat': guideLibrary.air_squat",
        }

        for old_map, new_map in mapping_updates.items():
            html = html.replace(old_map, new_map)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Successfully updated {file_path}")

    update_html_file('index.html')
    update_html_file('salon_kilavuzu_mobil.html')

    # Update sw.js
    print("Updating sw.js...")
    with open('sw.js', 'r', encoding='utf-8') as f:
        sw_code = f.read()

    new_assets = [
        "'./assets/guides/guide_bw_hollow_body_anatomi.jpg'",
        "'./assets/guides/guide_bw_hollow_body_form.jpg'",
        "'./assets/guides/guide_bw_mountain_climber_anatomi.jpg'",
        "'./assets/guides/guide_bw_mountain_climber_form.jpg'",
        "'./assets/guides/guide_bw_burpee_anatomi.jpg'",
        "'./assets/guides/guide_bw_burpee_form.jpg'",
        "'./assets/guides/guide_db_pullover_anatomi.jpg'",
        "'./assets/guides/guide_db_pullover_form.jpg'",
        "'./assets/guides/guide_mach_cable_woodchopper_anatomi.jpg'",
        "'./assets/guides/guide_mach_cable_woodchopper_form.jpg'",
        "'./assets/guides/guide_bw_glute_bridge_anatomi.jpg'",
        "'./assets/guides/guide_bw_glute_bridge_form.jpg'",
        "'./assets/guides/guide_kb_swing_anatomi.jpg'",
        "'./assets/guides/guide_kb_swing_form.jpg'",
        "'./assets/guides/guide_bw_air_squat_anatomi.jpg'",
        "'./assets/guides/guide_bw_air_squat_form.jpg'"
    ]

    # Bump cache version
    sw_code = re.sub(r"const CACHE_NAME = 'celik-kodu-cache-v\d+';", "const CACHE_NAME = 'celik-kodu-cache-v25';", sw_code)

    for na in new_assets:
        if na not in sw_code:
            sw_code = sw_code.replace("const ASSETS = [\n  './',", f"const ASSETS = [\n  './',\n  {na},")

    with open('sw.js', 'w', encoding='utf-8') as f:
        f.write(sw_code)
    print("Updated sw.js to celik-kodu-cache-v25!")

if __name__ == '__main__':
    apply_fixes()
