#!/usr/bin/env python3
"""
compile_progression.py
Slices 5-figure panoramic AI progression images, centers figures onto 768x768 frames,
and compiles optimized progression strips, WebP animations (<150KB), and MP4 clips (<300KB).
Part of the fitvid_generate skill.
"""

import os
import sys
import json
import argparse
import subprocess
import numpy as np
from PIL import Image

FRAME_SIZE = 768
TARGET_X = 384
DEFAULT_DURATIONS = [600, 320, 450, 320, 700, 280, 280, 300]


def auto_detect_cuts_and_centers(arr, num_figures=5):
    """
    Detects figure boundaries and centers by analyzing column activity
    against the background edge color.
    """
    H, W, _ = arr.shape
    bg_sample = arr[:, :15, :].mean(axis=(0, 1))
    
    # Calculate difference from background per column
    diff_per_col = np.linalg.norm(arr - bg_sample, axis=2).mean(axis=0)
    
    # Divide the image roughly into segments and find local minima for gaps
    approx_w = W // num_figures
    gaps = []
    for i in range(1, num_figures):
        search_min = int((i - 0.35) * approx_w)
        search_max = int((i + 0.35) * approx_w)
        gap_idx = search_min + np.argmin(diff_per_col[search_min:search_max])
        gaps.append(int(gap_idx))
    
    # Find centers of mass in each section
    bounds = [0] + gaps + [W]
    centers = []
    for i in range(num_figures):
        b1, b2 = bounds[i], bounds[i+1]
        col_weights = diff_per_col[b1:b2]
        if col_weights.sum() > 0:
            center_x = b1 + int(np.average(np.arange(b2 - b1), weights=col_weights))
        else:
            center_x = (b1 + b2) // 2
        centers.append(int(center_x))
        
    return gaps, centers


def compile_movement(output_dir, image_path, gaps=None, centers=None, durations=None):
    """
    Processes a single 5-stage progression strip image.
    """
    durations = durations or DEFAULT_DURATIONS
    os.makedirs(output_dir, exist_ok=True)
    frames_dir = os.path.join(output_dir, "frames")
    os.makedirs(frames_dir, exist_ok=True)
    
    im = Image.open(image_path)
    arr = np.array(im)
    H, W, _ = arr.shape
    bg_col = arr[:, min(15, W-1), :].astype(float)
    
    if not gaps or not centers or len(gaps) != 4 or len(centers) != 5:
        auto_gaps, auto_centers = auto_detect_cuts_and_centers(arr, 5)
        gaps = gaps or auto_gaps
        centers = centers or auto_centers
        print(f"  [Auto-Detected] Gaps: {gaps}, Centers: {centers}")
        
    bounds = [0] + gaps + [W]
    cropped_frames = []
    
    for idx in range(5):
        bx1, bx2 = bounds[idx], bounds[idx+1]
        cx = centers[idx]
        
        canvas = np.repeat(bg_col[:, np.newaxis, :], FRAME_SIZE, axis=1)
        tx = TARGET_X - cx
        
        dest_x1 = max(0, bx1 + tx)
        dest_x2 = min(FRAME_SIZE, bx2 + tx)
        src_x1 = dest_x1 - tx
        src_x2 = dest_x2 - tx
        
        canvas[:, dest_x1:dest_x2] = arr[:, src_x1:src_x2]
        f_img = Image.fromarray(canvas.astype(np.uint8))
        cropped_frames.append(f_img)
        
        f_img.save(os.path.join(output_dir, f"ai_frame_{idx+1}.jpg"), quality=95)
        f_img.save(os.path.join(frames_dir, f"frame_{idx+1}.jpg"), quality=95)
        
    # 1. Progression strip (5 x 768 = 3840 x 768)
    strip_w = FRAME_SIZE * 5
    strip_img = Image.new("RGB", (strip_w, FRAME_SIZE))
    for i, f_img in enumerate(cropped_frames):
        strip_img.paste(f_img, (i * FRAME_SIZE, 0))
    strip_path = os.path.join(output_dir, "ai_progression_strip.jpg")
    strip_img.save(strip_path, quality=92)
    print(f"  Saved progression strip: {os.path.getsize(strip_path)/1024:.1f} KB")
    
    # 2. Still WebP poster
    still_path = os.path.join(output_dir, "still.webp")
    ai_still_path = os.path.join(output_dir, "ai_still.webp")
    cropped_frames[0].save(still_path, "WEBP", quality=85)
    cropped_frames[0].save(ai_still_path, "WEBP", quality=85)
    
    # 3. Animated WebP: 1 -> 2 -> 3 -> 4 -> 5 -> 4 -> 3 -> 2
    loop_frames = [
        cropped_frames[0],
        cropped_frames[1],
        cropped_frames[2],
        cropped_frames[3],
        cropped_frames[4],
        cropped_frames[3],
        cropped_frames[2],
        cropped_frames[1]
    ]
    webp_path = os.path.join(output_dir, "ai_animation.webp")
    reg_webp = os.path.join(output_dir, "animation.webp")
    for wpath in [webp_path, reg_webp]:
        loop_frames[0].save(
            wpath,
            "WEBP",
            save_all=True,
            append_images=loop_frames[1:],
            duration=durations,
            loop=0,
            quality=80,
            method=6
        )
    print(f"  Saved animated WebP: {os.path.getsize(webp_path)/1024:.1f} KB")
    
    # 4. MP4 Video clip via ffmpeg
    temp_list = os.path.join(output_dir, ".temp_ffmpeg_filelist.txt")
    with open(temp_list, "w") as f:
        for f_idx, dur in zip([1, 2, 3, 4, 5, 4, 3, 2], durations):
            f.write(f"file '{frames_dir}/frame_{f_idx}.jpg'\n")
            f.write(f"duration {dur / 1000.0:.3f}\n")
        f.write(f"file '{frames_dir}/frame_1.jpg'\n")
        
    mp4_path = os.path.join(output_dir, "ai_clip.mp4")
    mp4_reg = os.path.join(output_dir, "clip.mp4")
    
    ffmpeg_bin = "ffmpeg"
    if os.path.exists("/opt/homebrew/bin/ffmpeg"):
        ffmpeg_bin = "/opt/homebrew/bin/ffmpeg"
        
    for target in [mp4_path, mp4_reg]:
        cmd = [
            ffmpeg_bin,
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", temp_list,
            "-vf", "scale=768:768,format=yuv420p",
            "-c:v", "libx264",
            "-crf", "23",
            "-preset", "slow",
            "-movflags", "+faststart",
            target
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
    if os.path.exists(temp_list):
        os.remove(temp_list)
        
    print(f"  Saved MP4 clip: {os.path.getsize(mp4_path)/1024:.1f} KB")
    return {
        "strip": strip_path,
        "still": still_path,
        "webp": webp_path,
        "mp4": mp4_path,
        "gaps": gaps,
        "centers": centers
    }


def main():
    parser = argparse.ArgumentParser(description="Compile 5-stage progression images into optimized media assets.")
    parser.add_argument("--spec", help="Path to JSON batch specifications file")
    parser.add_argument("--dir", help="Output directory for single movement")
    parser.add_argument("--image", help="Input progression strip image path")
    parser.add_argument("--gaps", type=int, nargs=4, help="4 X-axis divider coordinates")
    parser.add_argument("--centers", type=int, nargs=5, help="5 X-axis figure center coordinates")
    
    args = parser.parse_args()
    
    if args.spec:
        with open(args.spec, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        movements = data.get("movements", data if isinstance(data, list) else [])
        for m in movements:
            m_dir = m.get("output_dir") or m.get("dir")
            m_img = m.get("image_path") or m.get("image")
            gaps = m.get("gaps")
            centers = m.get("centers")
            durations = m.get("durations")
            print(f"\nProcessing movement in {m_dir}...")
            compile_movement(m_dir, m_img, gaps=gaps, centers=centers, durations=durations)
            
    elif args.dir and args.image:
        print(f"\nProcessing movement in {args.dir}...")
        compile_movement(args.dir, args.image, gaps=args.gaps, centers=args.centers)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
