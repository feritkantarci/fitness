#!/usr/bin/env python3
"""
Çelik Kodu Visual Pipeline v3.1 — Yeniden Kullanılabilir Hızlı Derleyici ve 3B Eklem Kılavuz Aracı

Kullanım (Yeni Konuşmalarda Sıfırdan Kod Yazmadan Doğrudan Çalıştırın):
  python3 .agents/skills/exercise-visual-pipeline/scripts/compile_studio_exercise.py \
    --id db_ornek_hareket \
    --spec /tmp/ornek_spec.json \
    --artifact-gif /path/to/brain/preview.gif \
    --verify-sheet /path/to/brain/scratch/verify_sheet.jpg

spec.json formatı:
{
  "fixed_scale": 0.80,
  "floor_y": 942,
  "out_size": 540,
  "still_pose": "P8_top",
  "poses": {
    "P1_start": "/abs/path/to/p1.jpg",
    "P2_mid": "/abs/path/to/p2.jpg",
    "P8_top": "/abs/path/to/p8.jpg"
  },
  "sequence": [
    ["P1_start", 200, "01 Baslangic"],
    ["P2_mid",   150, "02 Orta Faz"],
    ["P8_top",   230, "03 Tepe Kilit"]
  ]
}
"""
import argparse
import json
import os
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import label


def clean_fg(im_path):
    im = Image.open(im_path).convert("RGB")
    if im.size != (1024, 1024):
        im = im.resize((1024, 1024), Image.Resampling.LANCZOS)
    arr = np.array(im)
    non_bg = ~np.all(arr >= 244, axis=-1)
    s8 = np.ones((3, 3), dtype=bool)
    lab, n = label(non_bg, structure=s8)
    if n > 0:
        sizes = np.bincount(lab.ravel())
        keep = np.zeros(n + 1, dtype=bool)
        for cid in range(1, n + 1):
            if sizes[cid] >= 90:
                keep[cid] = True
        arr[~keep[lab]] = [255, 255, 255]
    return arr


def get_metrics(arr):
    non_bg = ~np.all(arr >= 242, axis=-1)
    ys, _ = np.where(non_bg)
    y_min, y_max = int(ys.min()), int(ys.max())
    foot_band = non_bg[max(0, y_max - 85):y_max + 1, :]
    _, f_xs = np.where(foot_band)
    foot_xc = float(f_xs.min() + f_xs.max()) / 2.0 if len(f_xs) > 0 else 512.0
    return {"y_min": y_min, "y_max": y_max, "foot_xc": foot_xc}


def place_on_studio_floor(arr, target_foot_xc=512.0, floor_y=942, fixed_scale=0.8000, air_elev=0):
    m = get_metrics(arr)
    new_sz = int(round(1024 * fixed_scale))
    im_rgba = Image.fromarray(arr).convert("RGBA").resize((new_sz, new_sz), Image.Resampling.LANCZOS)
    s_arr = np.array(im_rgba)
    s_arr[np.all(s_arr[:, :, :3] >= 245, axis=-1), 3] = 0
    scaled_rgba = Image.fromarray(s_arr)

    paste_x = int(round(target_foot_xc - m["foot_xc"] * fixed_scale))
    paste_y = int(round((floor_y - air_elev) - m["y_max"] * fixed_scale))

    canvas = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
    shadow_layer = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    s_draw.line([(170, floor_y + 3), (854, floor_y + 3)], fill=(203, 213, 225, 185), width=3)
    sh_scale = max(0.55, 1.0 - air_elev / 260.0)
    rx = int(142 * sh_scale)
    alpha = int(60 * sh_scale)
    s_draw.ellipse([int(target_foot_xc - rx), floor_y - 10, int(target_foot_xc + rx), floor_y + 16], fill=(30, 41, 59, alpha))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=5))
    canvas = Image.alpha_composite(canvas, shadow_layer)
    canvas.alpha_composite(scaled_rgba, (paste_x, paste_y))
    return canvas.convert("RGB"), m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True, help="Exercise ID (e.g. db_high_pull_cuban_rotation)")
    ap.add_argument("--spec", required=True, help="JSON spec path")
    ap.add_argument("--repo", default="/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS")
    ap.add_argument("--artifact-gif", required=True, help="Output preview GIF path in brain dir")
    ap.add_argument("--verify-sheet", required=True, help="Output contact sheet JPG path")
    ap.add_argument("--write-repo", action="store_true", help="Also write GIF/WebP/MP4/Still into repo assets/")
    args = ap.parse_args()

    with open(args.spec, "r", encoding="utf-8") as f:
        spec = json.load(f)

    fixed_scale = float(spec.get("fixed_scale", 0.8000))
    floor_y = int(spec.get("floor_y", 942))
    out_size = int(spec.get("out_size", 540))
    poses = spec["poses"]
    sequence = spec["sequence"]
    still_pose = spec.get("still_pose", sequence[len(sequence) // 2][0])

    raw_cleaned = {k: clean_fg(v) for k, v in poses.items()}

    frames_rgb = []
    durations = []
    cols = 5
    rows = (len(sequence) + cols - 1) // cols
    cell = 340
    sheet = Image.new("RGB", (cols * cell, rows * cell), (241, 245, 249))
    draw = ImageDraw.Draw(sheet)

    composited_cache = {}
    for idx, item in enumerate(sequence):
        pname, dur, label_txt = item[0], int(item[1]), item[2]
        air_elev = int(item[3]) if len(item) > 3 else 0
        ckey = (pname, air_elev)
        if ckey not in composited_cache:
            comp_im, _ = place_on_studio_floor(raw_cleaned[pname], 512.0, floor_y, fixed_scale, air_elev)
            composited_cache[ckey] = comp_im
        fr_full = composited_cache[ckey]
        frames_rgb.append(fr_full.resize((out_size, out_size), Image.Resampling.LANCZOS))
        durations.append(dur)

        r, c = divmod(idx, cols)
        thumb = fr_full.resize((cell - 8, cell - 28), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (c * cell + 4, r * cell + 24))
        draw.text((c * cell + 10, r * cell + 5), label_txt, fill=(15, 23, 42))

    os.makedirs(os.path.dirname(args.verify_sheet), exist_ok=True)
    sheet.save(args.verify_sheet, quality=94)

    sample_indices = np.linspace(0, len(frames_rgb) - 1, min(4, len(frames_rgb)), dtype=int)
    montage = Image.new("RGB", (out_size * len(sample_indices), out_size), (255, 255, 255))
    for i, sidx in enumerate(sample_indices):
        montage.paste(frames_rgb[int(sidx)], (i * out_size, 0))
    shared_pal = montage.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal_frames = [fr.quantize(palette=shared_pal, dither=Image.Dither.NONE) for fr in frames_rgb]

    os.makedirs(os.path.dirname(args.artifact_gif), exist_ok=True)
    pal_frames[0].save(args.artifact_gif, save_all=True, append_images=pal_frames[1:], duration=durations, loop=0, optimize=False)
    print("Saved preview GIF:", args.artifact_gif)

    if args.write_repo:
        gif_repo = os.path.join(args.repo, f"assets/exercises/{args.id}.gif")
        webp_repo = os.path.join(args.repo, f"assets/exercises/{args.id}.webp")
        still_repo = os.path.join(args.repo, f"assets/opengym/stills/{args.id}.webp")
        mp4_repo = os.path.join(args.repo, f"assets/opengym/clips/{args.id}.mp4")

        pal_frames[0].save(gif_repo, save_all=True, append_images=pal_frames[1:], duration=durations, loop=0, optimize=False)
        frames_rgb[0].save(webp_repo, format="WEBP", save_all=True, append_images=frames_rgb[1:], duration=durations, loop=0, quality=90, method=6)

        still_comp, _ = place_on_studio_floor(raw_cleaned[still_pose], 512.0, floor_y, fixed_scale, 0)
        still_comp.resize((out_size, out_size), Image.Resampling.LANCZOS).save(still_repo, format="WEBP", quality=92)

        tmp_mp4 = os.path.join(os.path.dirname(args.verify_sheet), f"mp4_tmp_{args.id}")
        os.makedirs(tmp_mp4, exist_ok=True)
        concat_txt = os.path.join(tmp_mp4, "concat.txt")
        with open(concat_txt, "w") as cf:
            for cyc in range(2):
                for idx, (fr, dur) in enumerate(zip(frames_rgb, durations)):
                    fp = os.path.join(tmp_mp4, f"f_{cyc}_{idx:02d}.png")
                    fr.save(fp)
                    cf.write(f"file '{fp}'\n")
                    cf.write(f"duration {dur / 1000.0:.4f}\n")
            cf.write(f"file '{os.path.join(tmp_mp4, f'f_1_{len(frames_rgb)-1:02d}.png')}'\n")

        subprocess.run(
            ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt, "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-movflags", "+faststart", mp4_repo],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        print("Wrote repo assets for:", args.id)


if __name__ == "__main__":
    main()
