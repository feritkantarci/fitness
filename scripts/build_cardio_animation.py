#!/usr/bin/env python3
"""
scripts/build_cardio_animation.py
=================================
Çelik Kodu Visual Pipeline v3 - Standart Kardiyo Animasyon Derleyicisi

Özellikler:
1. Kaynak görselleri saf beyaza (#FFFFFF) temizler.
2. Dikey duruşlarda kafa (head), zemin duruşlarında tüm gövde (body) merkezini X=512'ye kilitler.
3. Sabit ölçek (SCALE=0.7617) ve kafa tepe noktası (head_top=87) korur; boy küçülmesi veya yo-yo sıçraması yapmaz.
4. Y=950 zemin çizgisi ve dinamik temas gölgesi ekler.
5. Image.blend KULLANMAZ (Zero-Ghosting / 0 bulanıklık).
6. Tek hedef çıktı: assets/exercises/{id}.webp (PWA için < 150 KB, 480x480).
"""

import os
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import label

def clean_to_pure_white(im_path, center_mode="head"):
    """Arka planı saf beyaz (#FFFFFF) yapar ve X=512 eksenine ortalar."""
    im = Image.open(im_path).convert("RGB")
    arr = np.array(im)
    non_bg = ~np.all(arr >= 242, axis=-1)
    s8 = np.ones((3, 3), dtype=bool)
    lab, n = label(non_bg, structure=s8)
    if n > 0:
        sizes = np.bincount(lab.ravel())[1:]
        main_comp = 1 + int(np.argmax(sizes))
        arr[lab != main_comp] = [255, 255, 255]
    
    non_bg_clean = ~np.all(arr >= 242, axis=-1)
    ys_all, xs_all = np.where(non_bg_clean)
    if len(xs_all) == 0:
        return Image.fromarray(arr)

    if center_mode == "body":
        xc = (xs_all.min() + xs_all.max()) / 2.0
    else:
        # Dikey duruş: kafa bandını baz alarak merkezle
        head_band = ~np.all(arr[60:320, :] >= 242, axis=-1)
        xs_h = np.where(head_band)[1]
        if len(xs_h) > 0:
            xc = (xs_h.min() + xs_h.max()) / 2.0
        else:
            xc = (xs_all.min() + xs_all.max()) / 2.0

    shift_x = int(round(512.0 - xc))
    if shift_x != 0:
        shifted = np.full_like(arr, 255)
        if shift_x > 0:
            shifted[:, shift_x:] = arr[:, :-shift_x]
        else:
            shifted[:, :shift_x] = arr[:, -shift_x:]
        arr = shifted

    return Image.fromarray(arr)

def composite_frame(im_src, air_elev=0, sh_w=130, scale=0.7617, floor_y=950, y_paste_ground=210):
    """Sporcuyu sabit ölçekle küçültüp zemin çizgisi ve temas gölgesiyle birleştirir."""
    scaled_size = int(round(1024 * scale))
    x_paste = (1024 - scaled_size) // 2
    canvas = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))

    # Zemin referans çizgisi ve dinamik gölge
    shadow_layer = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.line([(140, floor_y + 2), (884, floor_y + 2)], fill=(203, 213, 225, 180), width=3)

    alpha = int(max(20, 65 - air_elev * 0.3))
    sh_rx = int(sh_w * (1.0 - air_elev * 0.002))
    sh_ry = 12
    s_draw.ellipse([512 - sh_rx, floor_y - sh_ry + 2, 512 + sh_rx, floor_y + sh_ry + 2], fill=(30, 41, 59, alpha))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=4))
    canvas = Image.alpha_composite(canvas, shadow_layer)

    # Sporcu katmanı
    scaled = im_src.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS).convert("RGBA")
    arr_s = np.array(scaled)
    bg_mask = np.all(arr_s[:, :, :3] >= 245, axis=-1)
    arr_s[bg_mask, 3] = 0
    scaled_rgba = Image.fromarray(arr_s)

    y_paste = y_paste_ground - air_elev
    canvas.alpha_composite(scaled_rgba, (x_paste, y_paste))
    return canvas.convert("RGB")

def export_exercise(exercise_id, frames_1024, duration_ms=100, output_size=480):
    """Tek hedef animasyonlu WebP çıktısını kaydeder."""
    os.makedirs("assets/exercises", exist_ok=True)
    frames_resized = [
        f.resize((output_size, output_size), Image.Resampling.LANCZOS)
        for f in frames_1024
    ]
    out_path = f"assets/exercises/{exercise_id}.webp"
    frames_resized[0].save(
        out_path,
        "WEBP",
        save_all=True,
        append_images=frames_resized[1:],
        duration=duration_ms,
        loop=0,
        quality=84,
        method=6
    )
    kb_size = os.path.getsize(out_path) // 1024
    print(f"✅ [TEKİL ÇIKTI] {out_path} ({kb_size} KB, {len(frames_resized)} kare)")
    return out_path
