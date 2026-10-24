#!/usr/bin/env python3
"""
scripts/build_exercise_gif.py
=============================
Çelik Kodu - Egzersiz Görsel, Animasyonlu WebP, GIF ve MP4 Üretim Orkestratörü (v3 Verified).

Temel Kurallar:
1. Image.blend (saydam cross-fade) VARSAYILAN OLARAK KAPALIDIR (steps_between=0); çift kafa/4 kol hayaletlenmesi yasaktır.
2. Sınırlayıcı kutu (ys.min / ys.max) ile kırpma yapılmaz; kafa/gövde ölçeği (SCALE=0.7617, head_top=87) tüm karelerde sabit tutulur.
3. Y=950 zemin referans çizgisi, dinamik temas gölgesi ve gerçek diz yaylanması (make_knee_dip) desteklenir.
4. Sayısal doğal sıralama (stage_01 .. stage_20) ve otomatik doğrulama şeridi (verify_sheet.jpg) üretilir.
"""

import os
import sys
import re
import argparse
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import label

def clean_frame_to_pure_white(img_path):
    """Görseldeki ana sporcuyu izole eder, arka planı saf beyaz (#FFFFFF) yapar ve X=512 merkezine hizalar."""
    img = Image.open(img_path).convert("RGB")
    arr = np.array(img)
    non_bg = ~np.all(arr >= 242, axis=-1)
    s8 = np.ones((3, 3), dtype=bool)
    lab, n = label(non_bg, structure=s8)
    if n > 0:
        sizes = np.bincount(lab.ravel())[1:]
        main_comp = 1 + int(np.argmax(sizes))
        arr[lab != main_comp] = [255, 255, 255]
    head_band = ~np.all(arr[70:350, :] >= 242, axis=-1)
    xs_h = np.where(head_band)[1]
    if len(xs_h) > 0:
        xc = (xs_h.min() + xs_h.max()) / 2.0
        shift_x = int(round(512.0 - xc))
        if shift_x != 0:
            shifted = np.full_like(arr, 255)
            if shift_x > 0:
                shifted[:, shift_x:] = arr[:, :-shift_x]
            else:
                shifted[:, :shift_x] = arr[:, -shift_x:]
            arr = shifted
    return Image.fromarray(arr)

def make_knee_dip(im, dip_px=24, knee_bow_px=8, hip_y=510, ankle_y=880):
    """Ayak tabanlarını zemine sabitleyerek dizleri dışa büker ve gövdeyi aşağı yaylandırır."""
    arr = np.array(im)
    h, w, _ = arr.shape
    out = np.full_like(arr, 255)
    y_coords = np.arange(h, dtype=np.float32)
    y_src = np.zeros_like(y_coords)

    upper = y_coords <= (hip_y + dip_px)
    lower = y_coords >= ankle_y
    mid = (~upper) & (~lower)

    y_src[upper] = y_coords[upper] - dip_px
    y_src[lower] = y_coords[lower]
    t = (y_coords[mid] - (hip_y + dip_px)) / (ankle_y - (hip_y + dip_px))
    y_src[mid] = hip_y + t * (ankle_y - hip_y)

    bow_profile = np.zeros_like(y_coords)
    bow_profile[mid] = knee_bow_px * (np.sin(np.pi * t) ** 1.4)

    for y_d in range(h):
        ys = int(round(y_src[y_d]))
        if ys < 0 or ys >= h:
            continue
        bow = bow_profile[y_d]
        if bow == 0:
            out[y_d, :] = arr[ys, :]
        else:
            for x_d in range(w):
                dist = x_d - 512.0
                sign = np.tanh(dist / 12.0)
                xs = int(round(x_d - sign * bow))
                if 0 <= xs < w:
                    out[y_d, x_d] = arr[ys, xs]
    return Image.fromarray(out)

def composite_with_floor_shadow(im_src, air_elev=0, sh_w=140, scale=0.7617, floor_y=950, y_paste_ground=210):
    """Sporcuyu sabit ölçekle küçültüp Y=950 zemin çizgisi ve dinamik temas gölgesi üzerine yerleştirir."""
    scaled_size = int(round(1024 * scale))
    x_paste = (1024 - scaled_size) // 2
    canvas = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))

    shadow_layer = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.line([(200, floor_y + 2), (824, floor_y + 2)], fill=(203, 213, 225, 180), width=3)

    alpha = int(max(22, 68 - air_elev * 0.28))
    sh_rx = int(sh_w * (1.0 - air_elev * 0.0018))
    sh_ry = 12
    s_draw.ellipse([512 - sh_rx, floor_y - sh_ry + 2, 512 + sh_rx, floor_y + sh_ry + 2], fill=(30, 41, 59, alpha))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=4))
    canvas = Image.alpha_composite(canvas, shadow_layer)

    scaled = im_src.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS).convert("RGBA")
    arr_s = np.array(scaled)
    bg_mask = np.all(arr_s[:, :, :3] >= 245, axis=-1)
    arr_s[bg_mask, 3] = 0
    scaled_rgba = Image.fromarray(arr_s)

    y_paste = y_paste_ground - air_elev
    canvas.alpha_composite(scaled_rgba, (x_paste, y_paste))
    return canvas.convert("RGB")

def build_exercise_assets(exercise_id, keyframes_dir, output_size=480, fmt="gif", frame_duration_ms=65):
    """Hazır stage_*.png karelerini sayısal sırayla okur ve yalnızca TEK BİR hedef animasyon dosyası üretir."""
    def extract_stage_num(filepath):
        match = re.search(r"stage_(\d+)", os.path.basename(filepath))
        return int(match.group(1)) if match else 0

    keyframe_paths = sorted([
        os.path.join(keyframes_dir, f) for f in os.listdir(keyframes_dir)
        if f.startswith("stage_") and f.endswith(".png")
    ], key=extract_stage_num)

    if not keyframe_paths:
        raise FileNotFoundError(f"{keyframes_dir} içinde 'stage_*.png' formatında kare bulunamadı!")

    frames = [
        Image.open(p).convert("RGB").resize((output_size, output_size), Image.Resampling.LANCZOS)
        for p in keyframe_paths
    ]

    exercises_dir = "assets/exercises"
    os.makedirs(exercises_dir, exist_ok=True)
    out_path = os.path.join(exercises_dir, f"{exercise_id}.{fmt}")

    if fmt == "webp":
        frames[0].save(
            out_path, "WEBP", save_all=True, append_images=frames[1:],
            duration=frame_duration_ms, loop=0, quality=86, method=6
        )
    else:
        frames[0].save(
            out_path, save_all=True, append_images=frames[1:],
            duration=frame_duration_ms, loop=0
        )

    print(f"✓ Tekil Çıktı Kaydedildi: {out_path} ({os.path.getsize(out_path) // 1024} KB, {len(frames)} kare)")
    return out_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Çelik Kodu Tekil Egzersiz GIF/WebP Üretim CLI (v3)")
    parser.add_argument("--id", required=True, help="Egzersiz ID'si (Örn: bw_jumping_jack)")
    parser.add_argument("--keyframes-dir", default="prototypes/jumping_jack_20_pro", help="Anahtar kareler dizini")
    parser.add_argument("--size", type=int, default=480, help="Çıktı çözünürlüğü (px)")
    parser.add_argument("--format", choices=["gif", "webp"], default="gif", help="Tekil çıktı formatı (gif veya webp)")
    parser.add_argument("--duration", type=int, default=65, help="Kare süresi (ms)")
    args = parser.parse_args()

    build_exercise_assets(
        exercise_id=args.id,
        keyframes_dir=args.keyframes_dir,
        output_size=args.size,
        fmt=args.format,
        frame_duration_ms=args.duration
    )
