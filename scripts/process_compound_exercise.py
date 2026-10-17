import os
import sys
import subprocess
from PIL import Image

def compile_exercise(exercise_id, frame_paths, loop_indices=None, durations_ms=None):
    if loop_indices is None:
        loop_indices = [0, 1, 2, 3, 2, 1, 0]
    if durations_ms is None:
        durations_ms = [800, 700, 700, 900, 600, 600, 800]

    os.makedirs("assets/opengym/stills", exist_ok=True)
    os.makedirs("assets/opengym/clips", exist_ok=True)
    os.makedirs("assets/exercises", exist_ok=True)

    print(f"=== Compiling {exercise_id} ===")
    processed = []
    for i, path in enumerate(frame_paths):
        im = Image.open(path).convert("RGB").resize((360, 360), Image.Resampling.LANCZOS)
        temp_file = f"temp_{exercise_id}_{i}.jpg"
        im.save(temp_file, quality=95)
        processed.append(im)

    # 1. Still Poster
    still_path = f"assets/opengym/stills/{exercise_id}.webp"
    processed[0].save(still_path, "WEBP", quality=85)
    print(f"Still saved: {still_path} ({os.path.getsize(still_path) / 1024:.1f} KB)")

    # 2. Animated WebP
    loop = [processed[idx] for idx in loop_indices]
    anim_path = f"assets/exercises/{exercise_id}.webp"
    loop[0].save(
        anim_path,
        save_all=True,
        append_images=loop[1:],
        duration=durations_ms,
        loop=0,
        quality=80,
        method=6
    )
    print(f"Animated WebP saved: {anim_path} ({os.path.getsize(anim_path) / 1024:.1f} KB)")

    # 3. MP4 Video
    concat_txt = f"temp_{exercise_id}_concat.txt"
    with open(concat_txt, "w") as f:
        for idx, d in enumerate(durations_ms):
            frame_idx = loop_indices[idx]
            f.write(f"file 'temp_{exercise_id}_{frame_idx}.jpg'\n")
            f.write(f"duration {d/1000.0}\n")
        f.write(f"file 'temp_{exercise_id}_{loop_indices[0]}.jpg'\n")

    mp4_path = f"assets/opengym/clips/{exercise_id}.mp4"
    cmd = [
        "/opt/homebrew/bin/ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_txt,
        "-vf", "scale=360:360:flags=lanczos,format=yuv420p",
        "-c:v", "libx264", "-profile:v", "baseline", "-level", "3.0",
        "-pix_fmt", "yuv420p", "-crf", "24", "-movflags", "+faststart",
        mp4_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"MP4 saved: {mp4_path} ({os.path.getsize(mp4_path) / 1024:.1f} KB)")

    # Clean up temp files
    for i in range(len(frame_paths)):
        tfile = f"temp_{exercise_id}_{i}.jpg"
        if os.path.exists(tfile):
            os.remove(tfile)
    if os.path.exists(concat_txt):
        os.remove(concat_txt)
    print(f"Done compiling {exercise_id}!\n")

if __name__ == "__main__":
    if len(sys.argv) < 6:
        print("Usage: python3 scripts/process_compound_exercise.py <exercise_id> <f1> <f2> <f3> <f4>")
        sys.exit(1)
    compile_exercise(sys.argv[1], sys.argv[2:6])
