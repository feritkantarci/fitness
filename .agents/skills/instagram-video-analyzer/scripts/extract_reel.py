#!/usr/bin/env python3
"""
Instagram Video & Reels Extractor for AI Agent Analysis.
Downloads Instagram Reels/Videos, extracts audio, metadata, and key visual frames.
"""
import sys
import os
import json
import subprocess
import argparse
from pathlib import Path

def run_cmd(cmd):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"Command failed ({p.returncode}): {' '.join(cmd)}\nStderr: {p.stderr}")
    return p.stdout.strip()

def extract_reel(url_or_file, output_dir=None):
    if not output_dir:
        import tempfile
        output_dir = tempfile.mkdtemp(prefix="reel_analysis_")
    
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Download or use local file
    is_url = str(url_or_file).startswith("http://") or str(url_or_file).startswith("https://")
    video_file = None
    info_json = {}
    
    if is_url:
        print(f"[*] Downloading Reel from URL: {url_or_file}...", file=sys.stderr)
        raw_template = str(out_path / "video.%(ext)s")
        # Run yt-dlp to download and output metadata
        cmd = [
            "yt-dlp",
            "--no-playlist",
            "--write-info-json",
            "-o", raw_template,
            str(url_or_file)
        ]
        run_cmd(cmd)
        
        # Locate video and info json
        for f in out_path.iterdir():
            if f.suffix in [".mp4", ".mov", ".mkv", ".webm"] and f.stem.startswith("video"):
                video_file = f
            elif f.suffix == ".json" and "info" in f.name:
                try:
                    with open(f, "r", encoding="utf-8") as jf:
                        info_json = json.load(jf)
                except Exception:
                    pass
    else:
        video_file = Path(url_or_file).resolve()
        if not video_file.exists():
            raise FileNotFoundError(f"Local video not found: {video_file}")

    if not video_file or not video_file.exists():
        raise RuntimeError(f"Could not locate downloaded video in {out_path}")

    # 2. Extract Duration and Dimensions via ffprobe
    probe_cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration:stream=width,height,r_frame_rate",
        "-of", "json",
        str(video_file)
    ]
    probe_out = json.loads(run_cmd(probe_cmd))
    duration = float(probe_out.get("format", {}).get("duration", 0.0))
    streams = probe_out.get("streams", [{}])
    v_stream = next((s for s in streams if "width" in s), {})
    width = v_stream.get("width", 0)
    height = v_stream.get("height", 0)
    aspect_ratio = f"{width}:{height}" if width and height else "unknown"

    # 3. Extract Audio
    audio_file = out_path / "audio.mp3"
    audio_cmd = [
        "ffmpeg", "-y", "-i", str(video_file),
        "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k",
        str(audio_file)
    ]
    try:
        run_cmd(audio_cmd)
    except Exception:
        audio_file = None

    # 4. Extract Key Frames (0.5s, 1.5s, 3.0s hook frames, midpoint, and 1s before end)
    frames = {}
    timestamps = {
        "hook_start": min(0.5, max(0.1, duration / 4)),
        "hook_peak": min(1.5, max(0.5, duration / 3)),
        "hook_decision": min(3.0, max(1.0, duration / 2)),
        "middle": duration / 2.0 if duration > 0 else 2.0,
        "cta_end": max(0.5, duration - 1.0) if duration > 2 else duration
    }

    for label, ts in timestamps.items():
        frame_file = out_path / f"frame_{label}.jpg"
        frame_cmd = [
            "ffmpeg", "-y", "-ss", f"{ts:.2f}",
            "-i", str(video_file),
            "-vframes", "1",
            "-q:v", "2",
            str(frame_file)
        ]
        try:
            run_cmd(frame_cmd)
            if frame_file.exists():
                frames[label] = {
                    "path": str(frame_file),
                    "timestamp_sec": round(ts, 2)
                }
        except Exception:
            pass

    result = {
        "success": True,
        "title": info_json.get("title", ""),
        "description": info_json.get("description", ""),
        "uploader": info_json.get("uploader", ""),
        "duration_seconds": round(duration, 2),
        "resolution": f"{width}x{height}",
        "aspect_ratio": aspect_ratio,
        "is_vertical": height > width,
        "video_path": str(video_file),
        "audio_path": str(audio_file) if audio_file and audio_file.exists() else None,
        "frames": frames,
        "output_dir": str(out_path)
    }
    return result

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Instagram Video & Reels Extractor")
    parser.add_argument("source", help="Instagram URL or local video file path")
    parser.add_argument("--out-dir", "-o", help="Custom output directory")
    args = parser.parse_args()

    try:
        res = extract_reel(args.source, args.out_dir)
        print(json.dumps(res, indent=2, ensure_ascii=False))
    except Exception as err:
        print(json.dumps({"success": False, "error": str(err)}, indent=2, ensure_ascii=False), file=sys.stderr)
        sys.exit(1)
