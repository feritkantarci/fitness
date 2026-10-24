#!/usr/bin/env python3
"""
generate_review_board.py
Generates the interactive review staging HTML (preview.html) for visual quality audits,
frame inspections, and structured per-exercise feedback collection.
Part of the fitvid_generate skill.
"""

import os
import sys
import json
import argparse


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page_title}</title>
  <style>
    :root {{
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f2937;
      --accent: #10b981;
      --accent-gold: #f59e0b;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --highlight: #3b82f6;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 24px;
      line-height: 1.5;
    }}
    .header {{
      max-width: 1200px;
      margin: 0 auto 28px auto;
      text-align: center;
      padding: 24px;
      background: linear-gradient(180deg, #161e2e 0%, #111827 100%);
      border: 1px solid var(--card-border);
      border-radius: 16px;
    }}
    .header h1 {{
      font-size: 24px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
    }}
    .header p {{
      color: var(--text-muted);
      font-size: 14px;
      max-width: 800px;
      margin: 0 auto;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 10px;
    }}
    .badge-review {{ background: #1e3a8a; color: #93c5fd; border: 1px solid #3b82f6; }}
    .badge-protocol {{ background: #1e293b; color: #93c5fd; border: 1px solid #3b82f6; font-size: 12px; }}
    .badge-primary {{ background: #14532d; color: #86efac; border: 1px solid #16a34a; font-size: 11px; }}
    .badge-secondary {{ background: #374151; color: #d1d5db; font-size: 11px; }}
    .badge-approved {{ background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }}

    .approved-summary-bar {{
      max-width: 1200px;
      margin: 0 auto 28px auto;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }}
    .approved-summary-bar .title {{
      font-weight: 700;
      color: #34d399;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .approved-chips {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .approved-chip {{
      background: #064e3b;
      color: #a7f3d0;
      border: 1px solid #059669;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
    }}

    .grid-container {{
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }}
    .exercise-card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }}
    .card-top {{
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 16px;
    }}
    .card-title-group h2 {{
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .card-title-group .ex-id {{
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--text-muted);
      font-size: 13px;
      margin-top: 4px;
    }}
    .card-content {{
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 24px;
    }}
    @media (max-width: 860px) {{
      .card-content {{
        grid-template-columns: 1fr;
      }}
    }}
    .media-player-box {{
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .media-wrapper {{
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--card-border);
    }}
    .media-wrapper img, .media-wrapper video {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .media-controls {{
      display: flex;
      gap: 8px;
    }}
    .btn-toggle {{
      flex: 1;
      background: #1f2937;
      border: 1px solid #374151;
      color: #e5e7eb;
      padding: 8px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }}
    .btn-toggle:hover {{
      background: #374151;
    }}
    .btn-toggle.active {{
      background: var(--highlight);
      border-color: #60a5fa;
      color: #fff;
    }}
    .info-pane {{
      display: flex;
      flex-direction: column;
      gap: 16px;
    }}
    .cue-box {{
      background: rgba(59, 130, 246, 0.08);
      border-left: 3px solid var(--highlight);
      padding: 10px 14px;
      border-radius: 0 8px 8px 0;
      font-size: 13px;
      color: #dbeafe;
    }}
    .cue-box strong {{
      color: #93c5fd;
    }}
    .revision-changelog-box {{
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 12px;
    }}
    .revision-changelog-box h4 {{
      color: #fbbf24;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .revision-changelog-box ul {{
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: #e2e8f0;
    }}
    .revision-changelog-box li {{
      display: flex;
      align-items: flex-start;
      gap: 6px;
      line-height: 1.4;
    }}
    .tag-group {{
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }}
    .tabs-wrap {{
      display: flex;
      flex-direction: column;
      gap: 8px;
    }}
    .tabs-header {{
      display: flex;
      gap: 6px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 8px;
      overflow-x: auto;
    }}
    .tab-btn {{
      background: #1f2937;
      border: 1px solid transparent;
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }}
    .tab-btn.active {{
      background: #374151;
      color: #fff;
      border-color: var(--highlight);
    }}
    .tab-pane {{
      display: none;
      font-size: 13px;
      color: #d1d5db;
      background: #131b2e;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--card-border);
    }}
    .tab-pane.active {{
      display: block;
    }}
    .tab-pane h5 {{
      color: #93c5fd;
      font-size: 13px;
      margin-bottom: 4px;
    }}
    .strip-container {{
      margin-top: 16px;
      background: #090d16;
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 12px;
    }}
    .strip-container h4 {{
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 8px;
    }}
    .strip-img-wrap {{
      width: 100%;
      overflow-x: auto;
      border-radius: 6px;
    }}
    .strip-img-wrap img {{
      height: 120px;
      display: block;
    }}
    .feedback-section {{
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--card-border);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .feedback-section label {{
      font-size: 13px;
      font-weight: 700;
      color: #fbbf24;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .feedback-textarea {{
      width: 100%;
      height: 72px;
      background: #0b0f19;
      border: 1px solid #374151;
      border-radius: 8px;
      color: #fff;
      padding: 10px;
      font-family: inherit;
      font-size: 13px;
      resize: vertical;
    }}
    .feedback-textarea:focus {{
      outline: none;
      border-color: var(--highlight);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }}
    .feedback-actions {{
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-end;
    }}
    .btn-copy {{
      background: #1f2937;
      border: 1px solid #374151;
      color: #93c5fd;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .btn-copy:hover {{
      background: #374151;
      color: #fff;
    }}
    .aggregate-box {{
      max-width: 1200px;
      margin: 40px auto 0 auto;
      background: #111827;
      border: 1px solid #3b82f6;
      border-radius: 16px;
      padding: 24px;
    }}
    .aggregate-box h3 {{
      font-size: 18px;
      color: #93c5fd;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .aggregate-box p {{
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }}
    .btn-copy-all {{
      background: #2563eb;
      border: none;
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .btn-copy-all:hover {{
      background: #1d4ed8;
    }}
    .toast {{
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #fff;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 100;
    }}
  </style>
</head>
<body>

  <div class="header">
    <h1>{header_title}</h1>
    <p>{header_desc}</p>
    <div class="badge badge-review">{badge_text}</div>
  </div>

  {approved_bar}

  <div class="grid-container">
    {cards_html}
  </div>

  <div class="aggregate-box">
    <h3>📋 Toplu Geri Bildirim Toplayıcı</h3>
    <p>Aşağıdaki butona tıkladığında tüm hareketlerin geri bildirim kutularındaki notları tek ve düzenli bir rapor halinde panoya kopyalar. Kopyaladıktan sonra doğrudan chat'e yapıştırabilirsin.</p>
    <button class="btn-copy-all" onclick="copyAggregatedFeedback()">📋 Tüm Geri Bildirimleri Topla ve Kopyala</button>
  </div>

  <div class="toast" id="toast">Metin panoya kopyalandı!</div>

  <script>
    function switchMedia(cardId, type) {{
      const img = document.getElementById(cardId + '-img');
      const vid = document.getElementById(cardId + '-vid');
      const btnWebp = document.getElementById(cardId + '-btn-webp');
      const btnMp4 = document.getElementById(cardId + '-btn-mp4');
      
      if (type === 'webp') {{
        img.style.display = 'block';
        vid.style.display = 'none';
        vid.pause();
        btnWebp.classList.add('active');
        btnMp4.classList.remove('active');
      }} else {{
        img.style.display = 'none';
        vid.style.display = 'block';
        vid.play();
        btnMp4.classList.add('active');
        btnWebp.classList.remove('active');
      }}
    }}

    function switchTab(cardId, tabIdx) {{
      const card = document.getElementById(cardId);
      const btns = card.querySelectorAll('.tab-btn');
      const panes = card.querySelectorAll('.tab-pane');
      
      btns.forEach((btn, i) => {{
        if (i === tabIdx) btn.classList.add('active');
        else btn.classList.remove('active');
      }});
      
      panes.forEach((pane, i) => {{
        if (i === tabIdx) pane.classList.add('active');
        else pane.classList.remove('active');
      }});
    }}

    function showToast(msg) {{
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => {{ t.style.display = 'none'; }}, 2500);
    }}

    function copyCardFeedback(cardId, title, code) {{
      const textarea = document.getElementById('fb-' + cardId);
      const val = textarea ? textarea.value.trim() : '';
      if (!val) {{
        showToast('⚠️ Lütfen önce geri bildirim metni yazın.');
        return;
      }}
      const text = `### ${{title}} (${{code}})\\n${{val}}`;
      navigator.clipboard.writeText(text).then(() => {{
        showToast('Kopyalandı: ' + title);
      }});
    }}

    function copyAggregatedFeedback() {{
      const cards = document.querySelectorAll('.exercise-card');
      let report = `### 🏋️ ÇELİK KODU — GERİ BİLDİRİM RAPORU\\n\\n`;
      let count = 0;
      cards.forEach((card, idx) => {{
        const title = card.getAttribute('data-title');
        const code = card.getAttribute('data-code');
        const textarea = card.querySelector('.feedback-textarea');
        const val = textarea ? textarea.value.trim() : '';
        if (val) {{
          count++;
          report += `### ${{count}}. ${{title}} (${{code}})\\n${{val}}\\n\\n---\\n\\n`;
        }}
      }});
      if (count === 0) {{
        showToast('⚠️ Hiçbir hareket için geri bildirim yazılmamış.');
        return;
      }}
      navigator.clipboard.writeText(report.trim()).then(() => {{
        showToast(`Toplam ${{count}} hareketin geri bildirimi kopyalandı!`);
      }});
    }}
  </script>
</body>
</html>
"""


def generate_board(spec_path, output_html_path):
    with open(spec_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    page_title = data.get("page_title", "Çelik Kodu — Egzersiz İnceleme Galerisi")
    header_title = data.get("header_title", "🏋️ Çelik Kodu — Egzersiz Biyomekanik İnceleme Galerisi")
    header_desc = data.get("header_desc", "Yapay zeka ile üretilen 5 aşamalı durak akışlarını, WebP animasyonları ve MP4 kliplerini tek merkezden denetleyin.")
    badge_text = data.get("badge_text", "Biyomekanik Staging & Kalite Kontrol")

    approved_list = data.get("approved_exercises", [])
    approved_bar = ""
    if approved_list:
        chips = "".join([f'<div class="approved-chip">✅ {name}</div>' for name in approved_list])
        approved_bar = f"""
        <div class="approved-summary-bar">
          <div class="title"><span>🎉</span> <span>Önceki Turda Onaylanan Hareketler:</span></div>
          <div class="approved-chips">{chips}</div>
        </div>
        """

    movements = data.get("movements", [])
    cards_html = []

    for idx, m in enumerate(movements):
        card_id = f"ex-{idx+1}"
        rel_dir = m.get("relative_dir", m.get("id"))
        title = m.get("name", "Egzersiz")
        ex_code = m.get("id", "ex_id")
        protocol = m.get("protocol", "4 Set x 8-10 Tekrar | RPE 8")
        primary_muscles = ", ".join(m.get("primary_muscles", ["Hedef Kas"]))
        secondary_muscles = ", ".join(m.get("secondary_muscles", ["Sinerjist"]))
        cue = m.get("cue", "")
        changelog = m.get("changelog", [])
        stages = m.get("stages", [])

        # Changelog HTML
        changelog_html = ""
        if changelog:
            items = "".join([f"<li>{item}</li>" for item in changelog])
            changelog_html = f"""
            <div class="revision-changelog-box">
              <h4>🔄 Bu Turda Yapılan Biyomekanik Düzeltmeler:</h4>
              <ul>{items}</ul>
            </div>
            """

        # Tabs HTML
        tab_buttons = []
        tab_panes = []
        for s_idx, s in enumerate(stages):
            active_cls = " active" if s_idx == 0 else ""
            tab_name = s.get("short_name", f"Aşama {s_idx+1}")
            phase_desc = s.get("desc", "")
            img_src = f"{rel_dir}/frames/frame_{s_idx+1}.jpg"

            tab_buttons.append(f'<button class="tab-btn{active_cls}" onclick="switchTab(\'{card_id}\', {s_idx})">{tab_name}</button>')
            tab_panes.append(f"""
            <div class="tab-pane{active_cls}">
              <h5>{s.get('phase', tab_name)}</h5>
              <p>{phase_desc}</p>
            </div>
            """)

        tabs_header_html = "".join(tab_buttons)
        tabs_panes_html = "".join(tab_panes)

        card = f"""
        <div class="exercise-card" id="{card_id}" data-title="{title}" data-code="{ex_code}">
          <div class="card-top">
            <div class="card-title-group">
              <h2><span>#{idx+1}</span> {title}</h2>
              <div class="ex-id">ID: {ex_code}</div>
            </div>
            <div class="tag-group">
              <span class="badge badge-protocol">{protocol}</span>
              <span class="badge badge-primary">Primer: {primary_muscles}</span>
              <span class="badge badge-secondary">Sekonder: {secondary_muscles}</span>
            </div>
          </div>

          <div class="card-content">
            <div class="media-player-box">
              <div class="media-wrapper">
                <img id="{card_id}-img" src="{rel_dir}/ai_animation.webp" alt="{title}">
                <video id="{card_id}-vid" src="{rel_dir}/ai_clip.mp4" loop muted playsinline style="display:none;"></video>
              </div>
              <div class="media-controls">
                <button class="btn-toggle active" id="{card_id}-btn-webp" onclick="switchMedia('{card_id}', 'webp')">⚡ WebP (Döngü)</button>
                <button class="btn-toggle" id="{card_id}-btn-mp4" onclick="switchMedia('{card_id}', 'mp4')">🎬 MP4 Video</button>
              </div>
            </div>

            <div class="info-pane">
              <div class="cue-box">
                <strong>Koç İpucu:</strong> {cue}
              </div>

              {changelog_html}

              <div class="tabs-wrap">
                <div class="tabs-header">
                  {tabs_header_html}
                </div>
                {tabs_panes_html}
              </div>
            </div>
          </div>

          <div class="strip-container">
            <h4>📐 5 Aşamalı Biyomekanik İlerleme Şeridi</h4>
            <div class="strip-img-wrap">
              <img src="{rel_dir}/ai_progression_strip.jpg" alt="{title} Şeridi">
            </div>
          </div>

          <div class="feedback-section">
            <label for="fb-{card_id}">✍️ Bu Hareket İçin Geri Bildirimin:</label>
            <textarea class="feedback-textarea" id="fb-{card_id}" placeholder="Örn: Ayak duruşu, kol açısı, gövde rotasyonu veya '✅ Onaylandı'"></textarea>
            <div class="feedback-actions">
              <button class="btn-copy" onclick="copyCardFeedback('{card_id}', '{title}', '{ex_code}')">📋 Bu Hareketin Geri Bildirimini Kopyala</button>
            </div>
          </div>
        </div>
        """
        cards_html.append(card)

    rendered_html = HTML_TEMPLATE.format(
        page_title=page_title,
        header_title=header_title,
        header_desc=header_desc,
        badge_text=badge_text,
        approved_bar=approved_bar,
        cards_html="\n".join(cards_html)
    )

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(rendered_html)

    print(f"Generated review board at: {output_html_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate preview.html staging review board.")
    parser.add_argument("--spec", required=True, help="Path to JSON specifications file")
    parser.add_argument("--out", required=True, help="Output HTML path (e.g., preview.html)")
    args = parser.parse_args()

    generate_board(args.spec, args.out)


if __name__ == "__main__":
    main()
