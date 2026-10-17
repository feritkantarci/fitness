#!/usr/bin/env python3
import os
import sys
import subprocess
from PIL import Image

def compile_media(exercise_id, frames, loop_pattern=None, durations_ms=None):
    if loop_pattern is None:
        # Standart 3 duraklı sarkaç/akış döngüsü: Nötr -> Durak 1 -> Nötr -> Durak 2 -> Nötr
        loop_pattern = [0, 1, 0, 2, 0]
    if durations_ms is None:
        durations_ms = [900, 1100, 750, 1100, 800]

    os.makedirs("assets/opengym/stills", exist_ok=True)
    os.makedirs("assets/opengym/clips", exist_ok=True)
    os.makedirs("assets/exercises", exist_ok=True)

    print(f"\n==========================================")
    print(f"🎬 Medya Derleme Başladı: {exercise_id}")
    print(f"==========================================")

    processed_images = []
    temp_files = []

    for i, fpath in enumerate(frames):
        if not os.path.exists(fpath):
            raise FileNotFoundError(f"Görsel bulunamadı: {fpath}")
        im = Image.open(fpath).convert("RGB").resize((480, 480), Image.Resampling.LANCZOS)
        t_name = f"temp_{exercise_id}_{i}.jpg"
        im.save(t_name, quality=95)
        temp_files.append(t_name)
        processed_images.append(im)

    # 1. Poster Kapak (Still WebP)
    still_path = f"assets/opengym/stills/{exercise_id}.webp"
    processed_images[0].save(still_path, "WEBP", quality=85)
    still_size = os.path.getsize(still_path) // 1024
    print(f"✅ [1/3] Poster WebP Hazır: {still_path} ({still_size} KB)")

    # 2. Animasyonlu WebP
    loop_images = [processed_images[idx] for idx in loop_pattern]
    anim_path = f"assets/exercises/{exercise_id}.webp"
    loop_images[0].save(
        anim_path,
        save_all=True,
        append_images=loop_images[1:],
        duration=durations_ms,
        loop=0,
        quality=80,
        method=6
    )
    anim_size = os.path.getsize(anim_path) // 1024
    print(f"✅ [2/3] Animasyonlu WebP: {anim_path} ({anim_size} KB)")

    # 3. MP4 Video Döngüsü (H.264 Baseline, Faststart)
    concat_txt = f"temp_{exercise_id}_concat.txt"
    with open(concat_txt, "w") as f:
        for idx, dur in enumerate(durations_ms):
            f_idx = loop_pattern[idx]
            f.write(f"file '{temp_files[f_idx]}'\n")
            f.write(f"duration {dur / 1000.0}\n")
        f.write(f"file '{temp_files[loop_pattern[0]]}'\n")

    mp4_path = f"assets/opengym/clips/{exercise_id}.mp4"
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-vf", "scale=480:480:flags=lanczos,format=yuv420p",
        "-c:v", "libx264", "-profile:v", "baseline", "-level", "3.0",
        "-pix_fmt", "yuv420p", "-crf", "24", "-movflags", "+faststart",
        mp4_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    mp4_size = os.path.getsize(mp4_path) // 1024
    print(f"✅ [3/3] MP4 Video Hazır: {mp4_path} ({mp4_size} KB)")

    # Temizlik
    for tf in temp_files:
        if os.path.exists(tf): os.remove(tf)
    if os.path.exists(concat_txt): os.remove(concat_txt)

    print(f"🎉 Tüm medya formatları başarıyla senkronize edildi!\n")

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Kullanım: python3 scripts/compile_exercise_media.py <exercise_id> <f1.jpg> <f2.jpg> <f3.jpg>")
        sys.exit(1)
    compile_media(sys.argv[1], sys.argv[2:5])
