import os
import shutil
import subprocess
from PIL import Image

def main():
    exercise_id = "db_pullover_to_halo"
    
    frames_src = [
        "/Users/mrkantarci/.gemini/antigravity/brain/d6e361e7-ba2e-4e7f-8fd0-ced4e736d2a2/db_pullover_to_halo_3q_frame1_1792244014892.jpg",
        "/Users/mrkantarci/.gemini/antigravity/brain/d6e361e7-ba2e-4e7f-8fd0-ced4e736d2a2/db_pullover_to_halo_3q_frame2_1792244034645.jpg",
        "/Users/mrkantarci/.gemini/antigravity/brain/d6e361e7-ba2e-4e7f-8fd0-ced4e736d2a2/db_pullover_to_halo_3q_frame3_v3_1792244103568.jpg",
        "/Users/mrkantarci/.gemini/antigravity/brain/d6e361e7-ba2e-4e7f-8fd0-ced4e736d2a2/db_pullover_to_halo_3q_frame4_1792244128763.jpg",
        "/Users/mrkantarci/.gemini/antigravity/brain/d6e361e7-ba2e-4e7f-8fd0-ced4e736d2a2/db_pullover_to_halo_3q_frame5_1792244153359.jpg"
    ]
    
    # 0. Archive raw keyframes
    os.makedirs("prototypes/generated_keyframes", exist_ok=True)
    for i, src in enumerate(frames_src):
        dst = f"prototypes/generated_keyframes/{exercise_id}_3q_f{i+1}.jpg"
        shutil.copy2(src, dst)
        print(f"Archived: {dst}")

    os.makedirs("assets/opengym/stills", exist_ok=True)
    os.makedirs("assets/opengym/clips", exist_ok=True)
    os.makedirs("assets/exercises", exist_ok=True)

    print(f"\n=== Compiling 3/4 Perspective {exercise_id} ===")
    processed = []
    for i, path in enumerate(frames_src):
        im = Image.open(path).convert("RGB").resize((360, 360), Image.Resampling.LANCZOS)
        temp_file = f"temp_{exercise_id}_{i}.jpg"
        im.save(temp_file, quality=95)
        processed.append(im)

    # 1. Still Poster (Use Frame 2 - Seated Upright Chest Rack, or Frame 1)
    # Using Frame 2 gives a great upright identifiable starting point, or Frame 1.
    # In OpenGym, poster is usually starting pose (Frame 1):
    still_path = f"assets/opengym/stills/{exercise_id}.webp"
    processed[0].save(still_path, "WEBP", quality=85)
    print(f"Still saved: {still_path} ({os.path.getsize(still_path) / 1024:.1f} KB)")

    # Sequence Loop:
    # 0: Pullover stretch (arms back)
    # 1: Sit-up rise to chest rack
    # 2: Halo circling right ear/temple (high elbow flare)
    # 3: Halo behind head (crown / wide elbows)
    # 4: Halo circling left ear/temple back to chest
    # 1: Seated chest rack (halo completed)
    loop_indices = [0, 1, 2, 3, 4, 1]
    durations_ms = [1200, 900, 850, 900, 850, 900]

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

    # 3. MP4 Video (H.264 baseline 3.0, faststart)
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
    for i in range(len(frames_src)):
        tfile = f"temp_{exercise_id}_{i}.jpg"
        if os.path.exists(tfile):
            os.remove(tfile)
    if os.path.exists(concat_txt):
        os.remove(concat_txt)
    print(f"Done compiling 3/4 perspective {exercise_id}!\n")

if __name__ == "__main__":
    main()
