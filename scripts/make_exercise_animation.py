#!/usr/bin/env python3
"""
Çelik Kodu - Egzersiz Hareketli WebP Üretici
Girdi: AI keyframe görselleri ve faz etiketleri
Çıktı: Ultra hafif (~40 KB), yüksek kaliteli Hareketli WebP ve optimize GIF
"""

import sys
import os
from PIL import Image, ImageDraw

def build_animation(frame_paths, labels, output_name, target_dir="assets/exercises", size=(440, 440)):
    os.makedirs(target_dir, exist_ok=True)
    processed = []
    
    for path, label in zip(frame_paths, labels):
        img = Image.open(path).convert("RGBA").resize(size, Image.Resampling.LANCZOS)
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        # Çelik Kodu standart alt bilgi şeridi
        draw.rectangle([0, size[1]-45, size[0], size[1]], fill=(15, 23, 42, 220))
        draw.text((12, size[1]-30), f"ÇELİK KODU • {label}", fill=(56, 189, 248, 255))
        composite = Image.alpha_composite(img, overlay).convert("RGB")
        processed.append(composite)

    # Doğal kinetik akış döngüsü (Başa dönüş)
    if len(processed) == 4:
        loop = [processed[0], processed[1], processed[2], processed[3], processed[2], processed[0]]
        durations = [900, 700, 700, 1100, 600, 800]
    else:
        loop = processed
        durations = [800] * len(processed)

    # 1. Standart Hareketli WebP (Ana format)
    webp_path = os.path.join(target_dir, f"{output_name}.webp")
    loop[0].save(
        webp_path,
        save_all=True,
        append_images=loop[1:],
        duration=durations,
        loop=0,
        quality=80,
        method=6
    )
    webp_kb = os.path.getsize(webp_path) / 1024

    # 2. Optimize Edilmiş Fallback GIF
    gif_path = os.path.join(target_dir, f"{output_name}.gif")
    quantized_loop = [im.quantize(colors=128, method=Image.Resampling.LANCZOS) for im in loop]
    quantized_loop[0].save(
        gif_path,
        save_all=True,
        append_images=quantized_loop[1:],
        duration=durations,
        loop=0,
        optimize=True
    )
    gif_kb = os.path.getsize(gif_path) / 1024

    print(f"✅ Başarılı: {output_name}")
    print(f"   - WebP (PWA Standardı): {webp_path} ({webp_kb:.1f} KB)")
    print(f"   - GIF (Geri Uyumluluk): {gif_path} ({gif_kb:.1f} KB)")
    return webp_path

if __name__ == "__main__":
    print("Çelik Kodu Hareketli WebP Motoru Hazır.")
