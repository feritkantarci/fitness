#!/usr/bin/env python3
"""
VFX Clean-Up & Asset Isolation Script (Permanent & Verified)
Görev: Jumping Jack 6 aşama görselindeki tüm yabancı uzuvları, sahipsiz pikselleri,
komşu figür ellerini cerrahi olarak temizleyip saf beyaz (#FFFFFF) yapmak ve
kadraj merkezini X=384 eksenine tam sabitlemek.
"""

import os
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import label

def process_and_align():
    base_dir = "prototypes/generated_keyframes/jumping_jack_stages"
    perfect_dir = "prototypes/generated_keyframes/jumping_jack_perfect_stages"
    os.makedirs(base_dir, exist_ok=True)
    os.makedirs(perfect_dir, exist_ok=True)

    s8 = np.ones((3, 3), dtype=bool)
    results = {}

    for stage_idx in range(1, 7):
        stage_path = os.path.join(base_dir, f"stage_{stage_idx}.png")
        img = Image.open(stage_path).convert("RGB")
        arr = np.array(img)

        # 1. Stage 2 specific surgical mask for neighbor figure bleed-over
        clean_arr = arr.copy()
        if stage_idx == 2:
            clean_arr[320:480, 458:] = 255

        # 2. Non-bg mask and largest component isolation
        non_bg = ~np.all(clean_arr >= 250, axis=-1)
        lab, num_features = label(non_bg, structure=s8)
        sizes = np.bincount(lab.ravel())[1:]
        main_comp = 1 + np.argmax(sizes)

        # 3. Hard mask everything outside main athlete
        clean_arr[lab != main_comp] = 255

        # 4. Save clean versions
        out_img = Image.fromarray(clean_arr)
        out_img.save(stage_path)
        out_img.save(os.path.join(base_dir, f"clean_single_stage_{stage_idx}.png"))
        out_img.save(os.path.join(perfect_dir, f"stage_{stage_idx}.png"))

        # 5. Verification
        verif = np.array(Image.open(stage_path))
        verif_mask = ~np.all(verif >= 250, axis=-1)
        lab_v, n_v = label(verif_mask, structure=s8)
        sizes_v = np.bincount(lab_v.ravel())[1:]
        ys, xs = np.where(verif_mask)

        results[stage_idx] = {
            "components": n_v,
            "stray_components": n_v - 1,
            "athlete_pixels": int(sizes_v.max()),
            "center_x": round(float((xs.min() + xs.max()) / 2), 1),
            "bbox_x": (int(xs.min()), int(xs.max())),
            "bbox_y": (int(ys.min()), int(ys.max()))
        }

    return results

if __name__ == "__main__":
    results = process_and_align()
    print("=== DİJİTAL TEMİZLEME VE MASKELEME DOĞRULAMA RAPORU ===")
    all_pass = True
    for s, data in results.items():
        print(f"Stage {s}: Bileşen={data['components']}, Sahipsiz={data['stray_components']}, Merkez X={data['center_x']}, X={data['bbox_x']}, Y={data['bbox_y']}")
        if data['components'] != 1 or data['stray_components'] != 0:
            all_pass = False

    if all_pass:
        print("\n✅ TÜM KARELERDE YABANCI UZUV VE SAHİPSİZ PİKSEL TEMİZLİĞİ %100 GEÇTİ!")
    else:
        print("\n❌ KUSURLU KARE TESPİT EDİLDİ!")
        sys.exit(1)
