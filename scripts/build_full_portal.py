#!/usr/bin/env python3
import json
import os
import sys

# Import exercises
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from exercise_database import EXERCISES

INDEX_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/index.html"
MOBIL_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/salon_kilavuzu_mobil.html"

EXERCISES_JSON = json.dumps(EXERCISES, ensure_ascii=False)

# Load all SVGs into a dictionary
DIAGRAMS_MAP = {}
diagram_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "diagrams")
if os.path.isdir(diagram_dir):
    for fn in sorted(os.listdir(diagram_dir)):
        if fn.endswith(".svg"):
            with open(os.path.join(diagram_dir, fn), "r", encoding="utf-8") as sf:
                svg_str = sf.read().strip()
                if svg_str.startswith("<?xml"):
                    svg_str = svg_str[svg_str.find("?>")+2:].strip()
                DIAGRAMS_MAP[fn] = svg_str

DIAGRAMS_JSON = json.dumps(DIAGRAMS_MAP, ensure_ascii=False)

HTML_CONTENT = f"""<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <!-- Security: CSP & Permissions -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://*; img-src 'self' data: blob: https://*; media-src 'self' data: blob: https://*;">
    <meta name="theme-color" content="#090d16">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Çelik Kodu">
    
    <title>Çelik Kodu | Akıllı Antrenman Mimarı & Program Oluşturucu</title>
    <link rel="manifest" href="./manifest.json">
    <link rel="icon" type="image/svg+xml" href="assets/diagrams/seq_db_press.svg">

    <style>
        :root {{
            --bg-base: #090d16;
            --bg-surface: #0f172a;
            --bg-elevated: #1e293b;
            --bg-card: rgba(30, 41, 59, 0.7);
            --border: rgba(255, 255, 255, 0.1);
            --border-hover: rgba(245, 158, 11, 0.4);
            --gold: #f59e0b;
            --gold-light: #fde68a;
            --gold-glow: rgba(245, 158, 11, 0.25);
            --cyan: #38bdf8;
            --cyan-glow: rgba(56, 189, 248, 0.25);
            --red-alert: #e11d48;
            --green-success: #10b981;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --radius-lg: 16px;
            --radius-md: 12px;
            --radius-sm: 8px;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }}

        body {{
            background-color: var(--bg-base);
            background-image: 
                radial-gradient(circle at 50% 0%, #1e293b 0%, transparent 60%),
                radial-gradient(circle at 100% 100%, #172554 0%, transparent 50%);
            background-attachment: fixed;
            color: var(--text-primary);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            min-height: 100vh;
            padding-bottom: 90px;
        }}

        /* ==================== LOGIN SCREEN ==================== */
        #loginScreen {{
            display: none;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: radial-gradient(circle at top center, #1e293b 0%, #090d16 80%);
        }}
        #loginScreen.active {{
            display: flex;
        }}
        .login-card {{
            background: rgba(19, 28, 46, 0.95);
            border: 1px solid var(--gold);
            border-radius: 20px;
            padding: 32px 24px;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 30px var(--gold-glow);
            backdrop-filter: blur(16px);
            text-align: center;
        }}
        .login-logo {{
            font-size: 44px;
            margin-bottom: 8px;
            display: inline-block;
        }}
        .login-title {{
            font-size: 22px;
            font-weight: 800;
            color: #fff;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }}
        .login-subtitle {{
            font-size: 13px;
            color: var(--gold-light);
            margin-bottom: 22px;
        }}
        .login-error {{
            background: rgba(225, 29, 72, 0.15);
            border-left: 4px solid var(--red-alert);
            color: #fecdd3;
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 16px;
            text-align: left;
            display: none;
        }}
        .login-field {{
            margin-bottom: 16px;
            text-align: left;
        }}
        .login-label {{
            display: block;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--text-secondary);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .login-input {{
            width: 100%;
            background: #090d16;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 13px 14px;
            color: #fff;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            transition: all 0.2s;
        }}
        .login-input:focus {{
            border-color: var(--gold);
            box-shadow: 0 0 10px var(--gold-glow);
        }}
        .login-btn {{
            width: 100%;
            background: linear-gradient(135deg, var(--gold) 0%, #b45309 100%);
            border: none;
            color: #090d16;
            font-size: 15px;
            font-weight: 800;
            padding: 14px;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 6px 18px rgba(245, 158, 11, 0.4);
            margin-top: 8px;
            transition: all 0.2s;
        }}
        .login-btn:hover {{
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(245, 158, 11, 0.6);
        }}
        .login-hint {{
            margin-top: 18px;
            font-size: 11px;
            color: var(--text-secondary);
            background: rgba(0,0,0,0.3);
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.05);
        }}

        /* ==================== APP CONTAINER & HEADER ==================== */
        .app-container {{
            max-width: 800px;
            margin: 0 auto;
            padding: 16px;
        }}

        /* AUTH TOP BAR */
        .auth-bar {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(19, 28, 46, 0.95);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 10px 14px;
            margin-bottom: 16px;
            backdrop-filter: blur(10px);
        }}
        .auth-user-info {{
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }}
        .auth-avatar {{
            font-size: 26px;
            background: var(--bg-elevated);
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            border: 1.5px solid var(--gold);
        }}
        .auth-name-title {{
            font-size: 14px;
            font-weight: 800;
            color: #fff;
        }}
        .auth-role-tag {{
            font-size: 9.5px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-left: 4px;
        }}
        .role-admin {{
            background: rgba(245, 158, 11, 0.2);
            color: var(--gold);
            border: 1px solid var(--gold);
        }}
        .role-athlete {{
            background: rgba(56, 189, 248, 0.2);
            color: #38bdf8;
            border: 1px solid #0284c7;
        }}
        .auth-actions {{
            display: flex;
            gap: 6px;
        }}
        .btn-auth-action {{
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            color: var(--gold-light);
            font-size: 11.5px;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }}
        .btn-auth-action:hover {{
            border-color: var(--gold);
        }}
        .btn-logout {{
            color: #f87171 !important;
            border-color: rgba(239, 68, 68, 0.4) !important;
        }}
        .btn-logout:hover {{
            border-color: #ef4444 !important;
            background: rgba(239, 68, 68, 0.15) !important;
        }}

        /* HERO BRANDING */
        .hero-banner {{
            text-align: center;
            padding: 16px 12px 20px;
        }}
        .badge-brand {{
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            font-weight: 800;
            color: var(--gold);
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid var(--gold);
            padding: 4px 10px;
            border-radius: 20px;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }}
        .hero-title {{
            font-size: 24px;
            font-weight: 900;
            color: #fff;
            letter-spacing: 0.5px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.5);
            margin-bottom: 6px;
        }}
        .hero-subtitle {{
            font-size: 13px;
            color: var(--text-secondary);
            max-width: 520px;
            margin: 0 auto;
        }}

        /* NAVIGATION TABS */
        .tab-nav {{
            display: flex;
            gap: 6px;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid var(--border);
            padding: 6px;
            border-radius: var(--radius-lg);
            margin-bottom: 20px;
            overflow-x: auto;
            scrollbar-width: none;
            backdrop-filter: blur(12px);
        }}
        .tab-nav::-webkit-scrollbar {{
            display: none;
        }}
        .tab-btn {{
            flex: 1;
            min-width: 100px;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 700;
            padding: 10px 8px;
            border-radius: var(--radius-md);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
            white-space: nowrap;
        }}
        .tab-btn.active {{
            background: var(--gold);
            color: #090d16;
            font-weight: 800;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
        }}

        .tab-content {{
            display: none;
        }}
        .tab-content.active {{
            display: block;
            animation: fadeIn 0.25s ease-out;
        }}

        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(6px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

        .analytics-subtab-btn.active {{
            background: var(--gold) !important;
            color: #090d16 !important;
            font-weight: 800 !important;
            border-color: var(--gold) !important;
        }}
        .analytics-kpi-card {{
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 12px;
            text-align: center;
        }}
        .analytics-bar-bg {{
            background: rgba(255, 255, 255, 0.07);
            height: 9px;
            border-radius: 6px;
            overflow: hidden;
            margin-top: 4px;
        }}
        .analytics-bar-fill {{
            height: 100%;
            border-radius: 6px;
            transition: width 0.4s ease;
        }}

        /* ==================== WORKOUT GENERATOR UI ==================== */
        .generator-card {{
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }}
        .gen-step-title {{
            font-size: 15px;
            font-weight: 800;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }}
        .gen-step-badge {{
            background: var(--gold);
            color: #090d16;
            font-size: 11px;
            font-weight: 900;
            width: 22px;
            height: 22px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }}

        /* SPLIT SELECTION GRID */
        .split-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 10px;
            margin-bottom: 16px;
        }}
        .split-card {{
            background: var(--bg-surface);
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            padding: 12px 14px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
        }}
        .split-card:hover {{
            border-color: rgba(245, 158, 11, 0.5);
            transform: translateY(-2px);
        }}
        .split-card.selected {{
            border-color: var(--gold);
            background: rgba(245, 158, 11, 0.12);
            box-shadow: 0 4px 16px var(--gold-glow);
        }}
        .split-icon {{
            font-size: 24px;
            margin-bottom: 6px;
        }}
        .split-name {{
            font-size: 13.5px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 2px;
        }}
        .split-desc {{
            font-size: 10.5px;
            color: var(--text-secondary);
            line-height: 1.3;
        }}

        /* EQUIPMENT CHIPS (MULTI-SELECT) */
        .equip-chips-wrap {{
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
        }}
        .equip-chip {{
            background: var(--bg-surface);
            border: 1.5px solid var(--border);
            border-radius: 20px;
            padding: 8px 14px;
            font-size: 12.5px;
            font-weight: 700;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            user-select: none;
        }}
        .equip-chip:hover {{
            border-color: var(--cyan);
        }}
        .equip-chip.selected {{
            border-color: var(--cyan);
            background: rgba(56, 189, 248, 0.15);
            color: #fff;
            box-shadow: 0 2px 10px var(--cyan-glow);
        }}
        .equip-quick-actions {{
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 16px;
        }}
        .btn-quick-equip {{
            background: transparent;
            border: 1px dashed var(--border);
            color: var(--text-secondary);
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .btn-quick-equip:hover {{
            border-color: var(--gold);
            color: var(--gold);
        }}

        /* PARAMETERS ROW */
        .param-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }}
        .param-group label {{
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }}
        .param-select {{
            width: 100%;
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            color: #fff;
            padding: 10px 12px;
            font-size: 13px;
            outline: none;
            cursor: pointer;
        }}
        .param-select:focus {{
            border-color: var(--gold);
        }}

        /* GENERATE CTA BUTTON */
        .btn-generate-cta {{
            width: 100%;
            background: linear-gradient(135deg, var(--gold) 0%, #b45309 100%);
            border: none;
            color: #090d16;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 0.5px;
            padding: 16px;
            border-radius: var(--radius-md);
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
        }}
        .btn-generate-cta:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(245, 158, 11, 0.65);
        }}

        /* ==================== GENERATED WORKOUT VIEW ==================== */
        #generatedWorkoutOutput {{
            margin-top: 24px;
        }}
        .workout-header-card {{
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
            border: 1.5px solid var(--gold);
            border-radius: var(--radius-lg);
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px var(--gold-glow);
        }}
        .workout-title-row {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            flex-wrap: wrap;
            gap: 10px;
        }}
        .workout-main-title {{
            font-size: 20px;
            font-weight: 900;
            color: #fff;
        }}
        .workout-meta-badges {{
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }}
        .meta-pill {{
            font-size: 11px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 6px;
            background: rgba(255,255,255,0.06);
            border: 1px solid var(--border);
            color: var(--gold-light);
        }}

        /* WORKOUT ACTION BUTTONS */
        .workout-actions-bar {{
            display: grid;
            grid-template-columns: 1.5fr 1fr 1fr;
            gap: 8px;
            margin-top: 16px;
        }}
        @media (max-width: 600px) {{
            .workout-actions-bar {{
                grid-template-columns: 1fr;
            }}
        }}
        .btn-start-workout {{
            background: linear-gradient(135deg, var(--green-success) 0%, #047857 100%);
            border: none;
            color: #fff;
            font-size: 14px;
            font-weight: 800;
            padding: 12px;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }}
        .btn-action-secondary {{
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            color: var(--text-primary);
            font-size: 12.5px;
            font-weight: 700;
            padding: 12px;
            border-radius: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
        }}
        .btn-action-secondary:hover {{
            border-color: var(--gold);
            color: var(--gold);
        }}

        /* EXERCISE CARDS */
        .block-header {{
            font-size: 14px;
            font-weight: 800;
            color: var(--gold);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 20px 0 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        .block-header::after {{
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(to right, var(--gold), transparent);
        }}
        .ex-card {{
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 14px 16px;
            margin-bottom: 12px;
            transition: all 0.2s;
        }}
        .ex-card:hover {{
            border-color: rgba(255, 255, 255, 0.2);
        }}
        .ex-card-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            flex-wrap: wrap;
            gap: 6px;
        }}
        .ex-name {{
            font-size: 15px;
            font-weight: 800;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        .ex-tag-group {{
            display: flex;
            gap: 6px;
        }}
        .ex-badge {{
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
        }}
        .badge-equip {{
            background: rgba(56, 189, 248, 0.15);
            color: var(--cyan);
            border: 1px solid rgba(56, 189, 248, 0.3);
        }}
        .badge-muscle {{
            background: rgba(245, 158, 11, 0.15);
            color: var(--gold);
            border: 1px solid rgba(245, 158, 11, 0.3);
        }}
        .badge-target-weight {{
            background: rgba(16, 185, 129, 0.15);
            color: var(--green-success);
            border: 1px solid var(--green-success);
            font-size: 10.5px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
        }}
        .ex-meta-row {{
            display: flex;
            gap: 16px;
            font-size: 12px;
            color: var(--gold-light);
            font-weight: 700;
            margin-bottom: 8px;
        }}
        .ex-cue-box {{
            background: rgba(0, 0, 0, 0.3);
            border-left: 3px solid var(--gold);
            border-radius: 0 6px 6px 0;
            padding: 8px 10px;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 10px;
            line-height: 1.4;
        }}
        .btn-swap-ex {{
            background: transparent;
            border: 1px dashed var(--border);
            color: var(--cyan);
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }}
        .btn-swap-ex:hover {{
            border-color: var(--cyan);
            background: rgba(56, 189, 248, 0.1);
        }}

        /* ==================== EXERCISE POSITIONS & BIOMECHANICAL FLOW ==================== */
        .pos-guide-wrapper {{
            background: rgba(15, 23, 42, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            margin: 10px 0 12px 0;
            overflow: hidden;
            transition: all 0.2s ease;
        }}
        .pos-guide-wrapper:hover {{
            border-color: rgba(245, 158, 11, 0.25);
        }}
        .pos-guide-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            cursor: pointer;
            user-select: none;
            gap: 6px;
            flex-wrap: wrap;
        }}
        .pos-guide-header:hover {{
            background: rgba(255, 255, 255, 0.06);
        }}
        .pos-type-badge {{
            font-size: 10.5px;
            font-weight: 800;
            padding: 2.5px 8px;
            border-radius: 4px;
            letter-spacing: 0.3px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }}
        .pos-badge-complex {{
            background: rgba(244, 63, 94, 0.18);
            color: #fb7185;
            border: 1px solid rgba(244, 63, 94, 0.38);
            box-shadow: 0 0 10px rgba(244, 63, 94, 0.12);
        }}
        .pos-badge-standard {{
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.32);
        }}
        .pos-guide-hint {{
            font-size: 11px;
            color: var(--text-secondary);
        }}
        @media (max-width: 480px) {{
            .pos-guide-hint {{
                display: none;
            }}
        }}
        .btn-toggle-guide {{
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.25);
            color: var(--gold-light);
            font-size: 10.5px;
            font-weight: 700;
            cursor: pointer;
            padding: 3px 8px;
            border-radius: 4px;
            transition: all 0.2s;
        }}
        .btn-toggle-guide:hover {{
            background: rgba(245, 158, 11, 0.2);
            border-color: var(--gold);
        }}
        .pos-guide-content {{
            padding: 10px 12px;
            display: block;
        }}
        .pos-guide-content.collapsed {{
            display: none;
        }}
        .guide-toggle-tabs {{
            display: flex;
            gap: 6px;
            margin-bottom: 10px;
            background: rgba(0, 0, 0, 0.4);
            padding: 4px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }}
        .btn-guide-tab {{
            flex: 1;
            background: transparent;
            border: 1px solid transparent;
            color: var(--text-secondary);
            font-size: 11px;
            font-weight: 700;
            padding: 6px 8px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }}
        .btn-guide-tab:hover {{
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
        }}
        .btn-guide-tab.active {{
            background: rgba(245, 158, 11, 0.2);
            color: var(--gold-light);
            border-color: rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.1);
        }}
        .guide-tab-panel {{
            display: none;
        }}
        .guide-tab-panel.active {{
            display: block;
        }}
        .pos-diagram-wrap {{
            margin-bottom: 10px;
            text-align: center;
            background: #090d16;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 8px;
            overflow-x: auto;
        }}
        .pos-diagram-wrap svg {{
            width: 100%;
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            display: block;
            margin: 0 auto;
        }}
        .pos-diagram-img {{
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            display: block;
            margin: 0 auto;
        }}
        .pos-steps-grid {{
            display: grid;
            gap: 8px;
            grid-template-columns: 1fr;
        }}
        @media (min-width: 680px) {{
            .pos-steps-grid.cols-3 {{
                grid-template-columns: repeat(3, 1fr);
            }}
            .pos-steps-grid.cols-4 {{
                grid-template-columns: repeat(4, 1fr);
            }}
            .pos-steps-grid.cols-5 {{
                grid-template-columns: repeat(5, 1fr);
            }}
        }}
        .pos-step-card {{
            background: rgba(0, 0, 0, 0.28);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }}
        .pos-step-header {{
            font-size: 10.5px;
            font-weight: 800;
            padding: 3px 7px;
            border-radius: 4px;
            border-width: 1px;
            border-style: solid;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            width: fit-content;
        }}
        .pos-step-desc {{
            font-size: 11.5px;
            color: #cbd5e1;
            line-height: 1.4;
        }}

        /* ==================== LIVE WORKOUT TRACKER ==================== */
        .live-tracker-bar {{
            position: sticky;
            top: 10px;
            z-index: 100;
            background: rgba(15, 23, 42, 0.95);
            border: 1.5px solid var(--gold);
            border-radius: var(--radius-md);
            padding: 10px 14px;
            margin-bottom: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 15px var(--gold-glow);
            backdrop-filter: blur(12px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }}
        .tracker-timer-box {{
            display: flex;
            flex-direction: column;
            gap: 2px;
        }}
        .tracker-timer-label {{
            font-size: 10px;
            font-weight: 800;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .timer-display-workout {{
            font-family: monospace;
            font-size: 24px;
            font-weight: 900;
            color: var(--cyan);
            letter-spacing: 1px;
            line-height: 1;
        }}
        .timer-display {{
            font-family: monospace;
            font-size: 24px;
            font-weight: 900;
            color: var(--gold);
            letter-spacing: 1px;
            line-height: 1;
        }}
        .timer-controls {{
            display: flex;
            gap: 4px;
            align-items: center;
            flex-wrap: wrap;
        }}
        .btn-timer {{
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            padding: 5px 8px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .btn-timer:hover {{
            border-color: var(--gold);
        }}
        .btn-timer-sub {{
            background: rgba(255,255,255,0.06);
            border: 1px solid var(--border);
            color: var(--text-secondary);
            font-size: 10.5px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 2px;
            width: fit-content;
            transition: all 0.2s;
        }}
        .btn-timer-sub:hover {{
            border-color: var(--cyan);
            color: var(--cyan);
        }}

        /* SETS MANAGEMENT WRAP & ROWS */
        .sets-management-wrap {{
            background: #090d16;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 8px 10px;
            margin-top: 10px;
        }}
        .sets-header-row {{
            display: grid;
            grid-template-columns: 42px 65px 1fr 1fr 100px;
            gap: 6px;
            font-size: 10px;
            font-weight: 800;
            color: var(--text-secondary);
            text-transform: uppercase;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            text-align: center;
        }}
        .set-row {{
            display: grid;
            grid-template-columns: 42px 65px 1fr 1fr 100px;
            gap: 6px;
            align-items: center;
            padding: 6px 2px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            border-radius: 6px;
            transition: all 0.2s;
        }}
        .set-row:last-child {{
            border-bottom: none;
        }}
        .set-row.set-completed {{
            background: rgba(34, 197, 94, 0.12);
            border: 1px solid rgba(34, 197, 94, 0.35);
        }}
        .set-row.set-active-target {{
            border: 1px solid var(--gold);
            background: rgba(245, 158, 11, 0.08);
        }}
        .set-badge {{
            background: #1e293b;
            color: #fff;
            border-radius: 6px;
            padding: 4px 6px;
            font-size: 11px;
            font-weight: 800;
            text-align: center;
            display: inline-block;
        }}
        .set-row.set-completed .set-badge {{
            background: #16a34a;
            color: #fff;
        }}
        .set-col-target {{
            font-size: 11.5px;
            color: var(--text-secondary);
            text-align: center;
            font-weight: 600;
        }}
        .set-col-input {{
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }}
        .set-input-weight, .set-input-reps {{
            background: #0f172a;
            border: 1px solid var(--border);
            border-radius: 6px;
            color: #fff;
            font-weight: 800;
            font-size: 13px;
            text-align: center;
            padding: 5px 2px;
            width: 100%;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s;
        }}
        .set-input-weight:focus, .set-input-reps:focus {{
            border-color: var(--gold);
        }}
        .set-row.set-completed .set-input-weight, .set-row.set-completed .set-input-reps {{
            background: rgba(34, 197, 94, 0.08);
            border-color: rgba(34, 197, 94, 0.3);
            color: #86efac;
        }}
        .btn-set-status {{
            width: 100%;
            padding: 6px 4px;
            font-size: 11px;
            font-weight: 800;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            text-align: center;
            transition: all 0.2s;
        }}
        .btn-set-status.start {{
            background: var(--gold);
            color: #090d16;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
        }}
        .btn-set-status.start:hover {{
            background: #fbbf24;
            transform: translateY(-1px);
        }}
        .btn-set-status.done {{
            background: #16a34a;
            color: #fff;
            box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
        }}
        .btn-set-status.pending {{
            background: rgba(255,255,255,0.06);
            color: var(--text-secondary);
            border: 1px solid var(--border);
        }}
        .sets-footer-actions {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 8px;
            padding-top: 6px;
            border-top: 1px dashed rgba(255,255,255,0.08);
        }}
        .btn-set-mini {{
            background: transparent;
            border: 1px dashed var(--border);
            color: var(--text-secondary);
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .btn-set-mini:hover {{
            border-color: var(--cyan);
            color: var(--cyan);
        }}

        /* LOG STATS & RICH HISTORY */
        .log-stats-bar {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 10px;
            margin: 10px 0;
            text-align: center;
        }}
        .log-stat-item {{
            display: flex;
            flex-direction: column;
            gap: 2px;
        }}
        .log-stat-label {{
            font-size: 9.5px;
            color: var(--text-secondary);
            font-weight: 800;
            text-transform: uppercase;
        }}
        .log-stat-val {{
            font-size: 13.5px;
            font-weight: 900;
            color: var(--gold);
        }}
        .muscle-tag {{
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.3);
            color: var(--cyan);
            border-radius: 6px;
            font-size: 10.5px;
            padding: 2px 7px;
            font-weight: 700;
            display: inline-block;
        }}
        .log-exercises-list {{
            margin-top: 8px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }}
        .log-exercise-item {{
            background: rgba(0, 0, 0, 0.25);
            border-radius: 6px;
            padding: 8px 10px;
            border-left: 3px solid var(--gold);
        }}
        .log-sets-summary {{
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 4px;
        }}
        .log-set-pill {{
            background: #0f172a;
            border: 1px solid var(--border);
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
            color: var(--text-secondary);
        }}
        .log-set-pill.completed {{
            border-color: rgba(34, 197, 94, 0.5);
            color: #86efac;
            background: rgba(34, 197, 94, 0.08);
        }}
        .log-notes-box {{
            font-size: 11.5px;
            color: var(--text-secondary);
            background: rgba(0,0,0,0.3);
            padding: 6px 10px;
            border-radius: 6px;
            margin-top: 8px;
            border-left: 3px solid var(--border);
        }}

        /* ==================== FORMS & BUTTONS ==================== */
        .btn {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-weight: 800;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }}
        .btn-gold {{
            background: linear-gradient(135deg, var(--gold) 0%, #b45309 100%);
            border: none;
            color: #090d16;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
        }}
        .btn-gold:hover {{
            box-shadow: 0 6px 20px rgba(245, 158, 11, 0.55);
            transform: translateY(-1px);
        }}
        .btn-outline {{
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-primary);
        }}
        .btn-outline:hover {{
            border-color: var(--gold);
            color: var(--gold);
        }}

        /* MODALS */
        .modal-overlay {{
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }}
        .modal-overlay.active {{
            display: flex;
        }}
        .modal-box {{
            background: #0f172a;
            border: 1px solid var(--gold);
            border-radius: var(--radius-lg);
            padding: 24px;
            max-width: 480px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 30px var(--gold-glow);
        }}
        .modal-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }}
        .modal-title {{
            font-size: 16px;
            font-weight: 800;
            color: #fff;
        }}
        .modal-close {{
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 20px;
            cursor: pointer;
        }}

        .form-group {{
            margin-bottom: 14px;
        }}
        .form-label {{
            display: block;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--text-secondary);
            margin-bottom: 6px;
            text-transform: uppercase;
        }}
        .form-input, .form-select {{
            width: 100%;
            background: #090d16;
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px 12px;
            color: #fff;
            font-size: 13.5px;
            outline: none;
            box-sizing: border-box;
        }}
        .form-input:focus, .form-select:focus {{
            border-color: var(--gold);
        }}

        /* AVATAR & THEME PICKERS */
        .avatar-picker-grid {{
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
        }}
        .avatar-choice {{
            background: var(--bg-surface);
            border: 1.5px solid var(--border);
            border-radius: 10px;
            font-size: 24px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .avatar-choice.selected {{
            border-color: var(--gold);
            background: rgba(245, 158, 11, 0.2);
            transform: scale(1.05);
        }}

        .theme-picker-grid {{
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }}
        .theme-pill {{
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            color: #fff;
            cursor: pointer;
            border: 2px solid transparent;
        }}
        .theme-pill.selected {{
            border-color: #fff;
            box-shadow: 0 0 10px rgba(255,255,255,0.5);
        }}

        /* LOG HISTORY CARDS */
        .log-history-card {{
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 12px 14px;
            margin-bottom: 10px;
        }}
        .log-card-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }}
        .log-date {{
            font-size: 12.5px;
            font-weight: 800;
            color: #fff;
        }}
        .btn-delete-log {{
            background: transparent;
            border: none;
            color: #ef4444;
            font-size: 14px;
            cursor: pointer;
            padding: 2px 6px;
        }}

        /* ADMIN CARDS */
        .admin-user-card {{
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px 12px;
            margin-bottom: 8px;
        }}
    </style>
</head>
<body>

    <!-- ==================== LOGIN SCREEN ==================== -->
    <div id="loginScreen">
        <div class="login-card">
            <div class="login-logo">⚔️</div>
            <div class="badge-brand">LA FORJA • EL CÓDIGO DEL ACERO</div>
            <h1 class="login-title">AKILLI ANTRENMAN PORTALI</h1>
            <p class="login-subtitle">Hedef Bölgeni Seç • Ekipmanını Belirle • Anında Üret</p>

            <div id="loginErrorMsg" class="login-error"></div>

            <form id="loginForm" onsubmit="handleAuthLogin(event)">
                <div class="login-field">
                    <label class="login-label">Kullanıcı Adı</label>
                    <input type="text" id="loginUsername" class="login-input" placeholder="Örn: ferit veya admin" required autocomplete="username" autocapitalize="none">
                </div>

                <div class="login-field">
                    <label class="login-label">Şifre</label>
                    <input type="password" id="loginPassword" class="login-input" placeholder="••••••" required autocomplete="current-password">
                </div>

                <button type="submit" class="login-btn" id="loginSubmitBtn">GİRİŞ YAP ➔</button>
            </form>

            <div class="login-hint">
                🔑 <strong>Varsayılan Yönetici:</strong> admin | <strong>Şifre:</strong> 123<br>
                <em>(Yönetici panelinden yeni kullanıcılar ve sporcular açabilirsiniz).</em>
            </div>
        </div>
    </div>

    <!-- ==================== MAIN APPLICATION WRAPPER ==================== -->
    <div id="mainAppWrapper" style="display:none;">
        <div class="app-container">

            <!-- HEADER AUTH BAR -->
            <div class="auth-bar">
                <div class="auth-user-info" onclick="switchTab('profileTab')">
                    <span class="auth-avatar" id="headerUserAvatar">🥋</span>
                    <div>
                        <div style="display:flex; align-items:center; gap:4px;">
                            <span class="auth-name-title" id="headerUserName">Ferit</span>
                            <span class="auth-role-tag role-admin" id="headerUserRoleBadge">YÖNETİCİ</span>
                        </div>
                        <div style="font-size:11px; color:var(--text-secondary);" id="headerUserSub">🎯 Özel Kilolarım & Profil</div>
                    </div>
                </div>

                <div class="auth-actions">
                    <button class="btn-auth-action" id="btnAdminPanel" onclick="openAdminModal()" style="display:none;">
                        👑 Sporcular
                    </button>
                    <button class="btn-auth-action btn-logout" onclick="handleAuthLogout()" title="Oturumu Kapat">
                        🚪 Çıkış
                    </button>
                </div>
            </div>

            <!-- HERO BRANDING -->
            <div class="hero-banner">
                <div class="badge-brand">⚔️ ÇELİK KODU • PROGRAM MİMARI</div>
                <h1 class="hero-title">Kişisel Antrenmanını Oluştur</h1>
                <p class="hero-subtitle">Çalıştırmak istediğin bölgeyi ve elindeki ekipmanları seç, sana özel bilimsel antrenman programını anında hazırla.</p>
            </div>

            <!-- NAVIGATION TABS -->
            <div class="tab-nav">
                <button class="tab-btn active" onclick="switchTab('generatorTab')">
                    <span>⚡ Program</span>
                </button>
                <button class="tab-btn" onclick="switchTab('activeWorkoutTab')" id="tabBtnActiveWorkout">
                    <span>🏋️ Antrenman</span>
                </button>
                <button class="tab-btn" onclick="switchTab('libraryTab')">
                    <span>📚 Programlar</span>
                </button>
                <button class="tab-btn" onclick="switchTab('historyTab')">
                    <span>📋 Günlük</span>
                </button>
                <button class="tab-btn" onclick="switchTab('analyticsTab')">
                    <span>📈 Analiz & Tartı</span>
                </button>
                <button class="tab-btn" onclick="switchTab('profileTab')">
                    <span>👤 Profil</span>
                </button>
            </div>

            <!-- ==================== TAB 1: WORKOUT GENERATOR ==================== -->
            <div id="generatorTab" class="tab-content active">
                <div class="generator-card">
                    
                    <!-- STEP 1: MUSCLE SPLIT -->
                    <div class="gen-step-title">
                        <span class="gen-step-badge">1</span>
                        <span>Hangi Bölgeyi Çalıştıracağız?</span>
                    </div>
                    <div class="split-grid" id="splitGrid">
                        <div class="split-card selected" onclick="selectSplit('full_body')">
                            <div class="split-icon">⚡</div>
                            <div class="split-name">Tüm Vücut (Full Body)</div>
                            <div class="split-desc">Tüm kinetik zincir, yüksek nabız ve metabolik yağ yakımı.</div>
                        </div>
                        <div class="split-card" onclick="selectSplit('upper_push')">
                            <div class="split-icon">🛡️</div>
                            <div class="split-name">Üst İtiş (Push)</div>
                            <div class="split-desc">Göğüs, omuz başları ve triceps (arka kol) odaklı.</div>
                        </div>
                        <div class="split-card" onclick="selectSplit('upper_pull')">
                            <div class="split-icon">⚔️</div>
                            <div class="split-name">Üst Çekiş (Pull)</div>
                            <div class="split-desc">Kanat, geniş sırt, trapez, arka omuz ve biceps.</div>
                        </div>
                        <div class="split-card" onclick="selectSplit('lower')">
                            <div class="split-icon">🦵</div>
                            <div class="split-name">Alt Vücut & Bacak</div>
                            <div class="split-desc">Ön bacak (quad), arka bacak (hamstring) ve kalça.</div>
                        </div>
                        <div class="split-card" onclick="selectSplit('upper')">
                            <div class="split-icon">🦅</div>
                            <div class="split-name">Tüm Üst Vücut</div>
                            <div class="split-desc">Göğüs, sırt, omuz ve kollar dengeli süperset.</div>
                        </div>
                        <div class="split-card" onclick="selectSplit('core')">
                            <div class="split-icon">🧱</div>
                            <div class="split-name">Karın & Core Zırhı</div>
                            <div class="split-desc">Merkez bölge, rotasyonel güç ve omurga stabilitesi.</div>
                        </div>
                    </div>

                    <!-- STEP 2: AVAILABLE EQUIPMENT -->
                    <div class="gen-step-title">
                        <span class="gen-step-badge">2</span>
                        <span>Elimizde Hangi Aletler Var? (Çoklu Seçim)</span>
                    </div>
                    <div class="equip-chips-wrap" id="equipChipsWrap">
                        <div class="equip-chip selected" onclick="toggleEquip('dumbbell')">
                            <span>🏋️ Dambıllar (Dumbbell)</span>
                        </div>
                        <div class="equip-chip selected" onclick="toggleEquip('kettlebell')">
                            <span>🔔 Kettlebell (Girya)</span>
                        </div>
                        <div class="equip-chip" onclick="toggleEquip('barbell')">
                            <span>🛑 Bar & Plakalar (Barbell)</span>
                        </div>
                        <div class="equip-chip" onclick="toggleEquip('machine')">
                            <span>⚙️ Makineler & Kablolar</span>
                        </div>
                        <div class="equip-chip selected" onclick="toggleEquip('bodyweight')">
                            <span>🤸 Vücut Ağırlığı & Barfiks</span>
                        </div>
                    </div>
                    <div class="equip-quick-actions">
                        <button class="btn-quick-equip" onclick="setQuickEquip('all')">🏢 Tüm Spor Salonu Ekipmanları</button>
                        <button class="btn-quick-equip" onclick="setQuickEquip('db_only')">🏋️ Sadece Dambıl</button>
                        <button class="btn-quick-equip" onclick="setQuickEquip('db_kb_bw')">⚡ Dambıl + Kettlebell + Vücut</button>
                        <button class="btn-quick-equip" onclick="setQuickEquip('bw_only')">🏠 Sadece Vücut Ağırlığı (Ev)</button>
                    </div>

                    <!-- STEP 3: WORKOUT PARAMETERS -->
                    <div class="gen-step-title">
                        <span class="gen-step-badge">3</span>
                        <span>Antrenman Yapısı, Hedef ve Süre</span>
                    </div>
                    <div class="param-grid">
                        <div class="param-group">
                            <label>Antrenman Modeli</label>
                            <select id="paramStyle" class="param-select">
                                <option value="superset" selected>⚡ Çelik Süperset (A1/A2)</option>
                                <option value="straight">🧱 Klasik Düz Setler</option>
                                <option value="emom">⏱️ EMOM / Kondisyon</option>
                            </select>
                        </div>
                        <div class="param-group">
                            <label>Hedef</label>
                            <select id="paramGoal" class="param-select">
                                <option value="hypertrophy" selected>🛡️ Kas & Hacim (8-12 Tekrar)</option>
                                <option value="strength">💥 Kuvvet & Güç (4-6 Tekrar)</option>
                                <option value="endurance">🔥 Yağ Yakımı & Kondisyon (12-15+)</option>
                            </select>
                        </div>
                        <div class="param-group">
                            <label>Süre Hedefi</label>
                            <select id="paramDuration" class="param-select">
                                <option value="30">⏱️ 30 Dk (Hızlı Seans)</option>
                                <option value="45" selected>⏱️ 45-50 Dk (İdeal Çelik)</option>
                                <option value="60">⏱️ 60 Dk (Dolu Hacim)</option>
                            </select>
                        </div>
                    </div>

                    <!-- GENERATE CTA -->
                    <button class="btn-generate-cta" onclick="handleGenerateWorkout()">
                        <span>⚡ ÖZEL PROGRAMIMI OLUŞTUR ➔</span>
                    </button>
                </div>

                <!-- GENERATED WORKOUT CONTAINER -->
                <div id="generatedWorkoutOutput">
                    <!-- Populated dynamically -->
                </div>
            </div>

            <!-- ==================== TAB 2: ACTIVE LIVE WORKOUT TRACKER ==================== -->
            <div id="activeWorkoutTab" class="tab-content">
                <!-- DUAL LIVE TRACKER STICKY BAR: WORKOUT ELAPSED TIMER + REST COUNTDOWN -->
                <div class="live-tracker-bar">
                    <!-- TOTAL ELAPSED WORKOUT TIME -->
                    <div class="tracker-timer-box">
                        <div class="tracker-timer-label">⏱️ TOPLAM SÜRE</div>
                        <div class="timer-display-workout" id="workoutTotalTimerDisplay">00:00</div>
                        <button class="btn-timer-sub" id="btnToggleWorkoutPause" onclick="toggleWorkoutPause()">⏸️ Duraklat</button>
                    </div>

                    <!-- REST TIMER COUNTDOWN -->
                    <div class="tracker-timer-box" style="align-items:flex-end;">
                        <div class="tracker-timer-label">⏳ DİNLENME SAYACI</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="timer-display" id="timerDisplay">00:45</div>
                            <div class="timer-controls">
                                <button class="btn-timer" onclick="setTimerSecs(30)">30s</button>
                                <button class="btn-timer" onclick="setTimerSecs(45)">45s</button>
                                <button class="btn-timer" onclick="setTimerSecs(60)">60s</button>
                                <button class="btn-timer" onclick="setTimerSecs(90)">90s</button>
                                <button class="btn-timer" onclick="toggleTimer()" id="btnPlayPauseTimer" style="background:var(--gold); color:#090d16; font-weight:900;">▶ Başlat</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="activeWorkoutContainer">
                    <!-- Populated dynamically when a workout is started -->
                </div>
            </div>

            <!-- ==================== TAB 3: PROGRAM LIBRARY ==================== -->
            <div id="libraryTab" class="tab-content">
                <div class="generator-card">
                    <h2 style="font-size:18px; font-weight:900; color:#fff; margin-bottom:12px;">📚 Kayıtlı ve Hazır Programlar</h2>
                    
                    <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin-bottom:10px;">⭐ Kişisel Kayıtlı Programlarım</h3>
                    <div id="savedProgramsList">
                        <!-- Populated dynamically -->
                    </div>

                    <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin:24px 0 10px;">⚔️ Resmi Çelik Kodu (La Forja) Klasik Serisi</h3>
                    <div id="officialProgramsList">
                        <!-- Classic La Forja templates -->
                    </div>
                </div>
            </div>

            <!-- ==================== TAB 4: WORKOUT HISTORY & LOGS ==================== -->
            <div id="historyTab" class="tab-content">
                <div class="generator-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h2 style="font-size:18px; font-weight:900; color:#fff;">📊 Antrenman Günlüğüm</h2>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-outline" style="font-size:11px; padding:6px 10px;" onclick="exportCSV()">📊 Excel / CSV</button>
                            <button class="btn btn-outline" style="font-size:11px; padding:6px 10px;" onclick="exportData()">💾 Yedek İndir</button>
                            <label class="btn btn-outline" style="font-size:11px; padding:6px 10px; cursor:pointer;">
                                📥 Geri Yükle
                                <input type="file" onchange="importData(event)" accept=".json" style="display:none;">
                            </label>
                        </div>
                    </div>

                    <!-- STATS ROW -->
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:16px;">
                        <div style="background:var(--bg-surface); padding:12px; border-radius:10px; text-align:center; border:1px solid var(--border);">
                            <div style="font-size:11px; color:var(--text-secondary);">Toplam Seans</div>
                            <div style="font-size:22px; font-weight:900; color:var(--gold);" id="statTotalWorkouts">0</div>
                        </div>
                        <div style="background:var(--bg-surface); padding:12px; border-radius:10px; text-align:center; border:1px solid var(--border);">
                            <div style="font-size:11px; color:var(--text-secondary);">Bu Hafta</div>
                            <div style="font-size:22px; font-weight:900; color:var(--cyan);" id="statWeekWorkouts">0/3</div>
                        </div>
                        <div style="background:var(--bg-surface); padding:12px; border-radius:10px; text-align:center; border:1px solid var(--border);">
                            <div style="font-size:11px; color:var(--text-secondary);">Seri (Gün)</div>
                            <div style="font-size:22px; font-weight:900; color:var(--green-success);" id="statStreak">0</div>
                        </div>
                    </div>

                    <div id="logHistoryContainer">
                        <!-- Populated dynamically -->
                    </div>
                </div>
            </div>

            <!-- ==================== TAB 5: ADVANCED ANALYTICS, SCALE & MEASUREMENTS ==================== -->
            <div id="analyticsTab" class="tab-content">
                <div class="generator-card">
                    <!-- HEADER & ACTION BUTTONS -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
                        <div>
                            <h2 style="font-size:18px; font-weight:900; color:#fff;">📈 Gelişim, Kas Yükü & Tartı Analizi</h2>
                            <p style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">Biyomekanik kas tonajı, akıllı tartı kompozisyonu ve vücut ölçüleri takibi</p>
                        </div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button class="btn btn-gold" style="font-size:11px; padding:6px 12px; font-weight:800;" onclick="openScaleModal()">
                                ⚖️ Tartı Ekle
                            </button>
                            <button class="btn btn-outline" style="font-size:11px; padding:6px 12px; font-weight:800;" onclick="openMeasurementsModal()">
                                📏 Ölçüm Ekle
                            </button>
                            <button class="btn btn-outline" style="font-size:11px; padding:6px 10px;" onclick="exportAnalyticsCSV()" title="Tartı & Ölçüm Verilerini İndir">
                                📊 CSV
                            </button>
                        </div>
                    </div>

                    <!-- SUB VIEW TOGGLES -->
                    <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; margin-bottom:16px;" class="hide-scrollbar">
                        <button class="btn btn-outline analytics-subtab-btn active" id="btnSubAnalyticsMuscle" style="font-size:11.5px; padding:6px 12px; border-radius:20px; white-space:nowrap;" onclick="switchAnalyticsSubView('muscle')">
                            💪 Kas Yükü & Biyomekanik
                        </button>
                        <button class="btn btn-outline analytics-subtab-btn" id="btnSubAnalyticsScale" style="font-size:11.5px; padding:6px 12px; border-radius:20px; white-space:nowrap;" onclick="switchAnalyticsSubView('scale')">
                            ⚖️ Tartı & Yağ / Kas Oranı
                        </button>
                        <button class="btn btn-outline analytics-subtab-btn" id="btnSubAnalyticsMeasurements" style="font-size:11.5px; padding:6px 12px; border-radius:20px; white-space:nowrap;" onclick="switchAnalyticsSubView('measurements')">
                            📏 Mezura Ölçüleri (cm)
                        </button>
                        <button class="btn btn-outline analytics-subtab-btn" id="btnSubAnalyticsCombined" style="font-size:11.5px; padding:6px 12px; border-radius:20px; white-space:nowrap;" onclick="switchAnalyticsSubView('combined')">
                            🧠 Akıllı Koç Raporu
                        </button>
                    </div>

                    <!-- DYNAMIC ANALYTICS CONTAINER -->
                    <div id="analyticsContentContainer">
                        <!-- Populated dynamically by renderAnalytics() -->
                    </div>
                </div>
            </div>

            <!-- ==================== TAB 6: ATHLETE PROFILE & SETTINGS ==================== -->
            <div id="profileTab" class="tab-content">
                <div class="generator-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-size:36px; background:var(--bg-surface); width:54px; height:54px; display:flex; align-items:center; justify-content:center; border-radius:12px; border:2px solid var(--gold);" id="profileCardAvatar">🥋</span>
                            <div>
                                <h2 style="font-size:18px; font-weight:800; color:#fff;" id="profileCardName">Ferit</h2>
                                <p style="font-size:12px; color:var(--text-secondary);" id="profileCardMeta">Kişisel Sporcu Profili & Hedef Kilolar</p>
                            </div>
                        </div>
                        <button class="btn btn-outline" style="font-size:11.5px; padding:6px 12px; color:#f87171; border-color:rgba(239,68,68,0.4);" onclick="handleAuthLogout()">
                            🚪 Çıkış
                        </button>
                    </div>

                    <!-- CUSTOMIZATION FORM -->
                    <div class="form-group">
                        <label class="form-label">Sporcu Adı</label>
                        <input type="text" id="editUserName" class="form-input">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Avatar Seç</label>
                        <div class="avatar-picker-grid" id="avatarPicker">
                            <div class="avatar-choice" onclick="selectAvatar('🥋')">🥋</div>
                            <div class="avatar-choice" onclick="selectAvatar('🦁')">🦁</div>
                            <div class="avatar-choice" onclick="selectAvatar('⚡')">⚡</div>
                            <div class="avatar-choice" onclick="selectAvatar('🛡️')">🛡️</div>
                            <div class="avatar-choice" onclick="selectAvatar('🦅')">🦅</div>
                            <div class="avatar-choice" onclick="selectAvatar('🐺')">🐺</div>
                            <div class="avatar-choice" onclick="selectAvatar('👑')">👑</div>
                            <div class="avatar-choice" onclick="selectAvatar('🔥')">🔥</div>
                            <div class="avatar-choice" onclick="selectAvatar('🏋️‍♂️')">🏋️‍♂️</div>
                            <div class="avatar-choice" onclick="selectAvatar('🏋️‍♀️')">🏋️‍♀️</div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tema Rengi</label>
                        <div class="theme-picker-grid" id="themePicker">
                            <div class="theme-pill" style="background:#f59e0b;" onclick="selectTheme('gold')">Altın Çelik</div>
                            <div class="theme-pill" style="background:#0284c7;" onclick="selectTheme('cyan')">Siber Mavi</div>
                            <div class="theme-pill" style="background:#059669;" onclick="selectTheme('green')">Zümrüt Zırh</div>
                            <div class="theme-pill" style="background:#e11d48;" onclick="selectTheme('red')">Lav Kırmızı</div>
                            <div class="theme-pill" style="background:#7c3aed;" onclick="selectTheme('purple')">Gladyatör Mor</div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                        <div>
                            <label class="form-label">Seviye</label>
                            <select id="editUserLevel" class="form-select">
                                <option value="Başlangıç">Başlangıç (0-6 Ay)</option>
                                <option value="Orta Seviye">Orta Seviye (6-18 Ay)</option>
                                <option value="İleri Seviye">İleri Seviye (18+ Ay)</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Cinsiyet</label>
                            <select id="editUserGender" class="form-select">
                                <option value="Erkek">Erkek</option>
                                <option value="Kadın">Kadın</option>
                            </select>
                        </div>
                    </div>

                    <!-- CUSTOM WEIGHT BENCHMARKS -->
                    <h3 style="font-size:14px; font-weight:800; color:var(--gold); margin:20px 0 8px;">⚖️ Kişisel Çalışma Ağırlıklarım (KG)</h3>
                    <p style="font-size:11.5px; color:var(--text-secondary); margin-bottom:12px;">
                        Buraya girdiğiniz kilolar, program oluşturulduğunda ilgili hareket kartlarının üzerine <strong>"🎯 Hedefin: X kg"</strong> olarak otomatik yansır.
                    </p>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div class="form-group">
                            <label class="form-label">Omuz Presi (Çift Dambıl/Bar)</label>
                            <input type="number" id="w_press" class="form-input" placeholder="Örn: 16">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Goblet / Back Squat</label>
                            <input type="number" id="w_squat" class="form-input" placeholder="Örn: 22">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Testere / Sırt Çekiş (Row)</label>
                            <input type="number" id="w_row" class="form-input" placeholder="Örn: 20">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Romanian Deadlift (RDL)</label>
                            <input type="number" id="w_rdl" class="form-input" placeholder="Örn: 24">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Dambıl / Kettlebell Swing</label>
                            <input type="number" id="w_swing" class="form-input" placeholder="Örn: 18">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Lunge / Split Squat</label>
                            <input type="number" id="w_lunge" class="form-input" placeholder="Örn: 14">
                        </div>
                    </div>

                    <button class="btn btn-gold" style="width:100%; padding:14px; font-weight:800; margin-top:12px;" onclick="saveCurrentProfile()">
                        💾 DEĞİŞİKLİKLERİ VE KİLOLARIMI KAYDET
                    </button>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
                        <button class="btn btn-outline" id="profileTabAdminBtn" style="font-size:11px; border-color:var(--gold); color:var(--gold); display:none;" onclick="openAdminModal()">
                            👑 Sporcu Yönetim Portalı (Admin)
                        </button>
                    </div>
                </div>
            </div>

        </div><!-- END APP CONTAINER -->
    </div><!-- END MAIN APP WRAPPER -->

    <!-- ==================== ADMIN MANAGEMENT MODAL ==================== -->
    <div id="adminModal" class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header">
                <span class="modal-title">👑 Sporcu Yönetim Portalı (Admin)</span>
                <button class="modal-close" onclick="closeAdminModal()">✕</button>
            </div>

            <!-- ADD NEW USER SECTION -->
            <div style="background:var(--bg-surface); border:1px solid var(--gold); border-radius:10px; padding:14px; margin-bottom:16px;">
                <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin-bottom:10px;">➕ Yeni Sporcu Oluştur</h3>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;" class="form-group">
                    <div>
                        <label class="form-label">Kullanıcı Adı</label>
                        <input type="text" id="newUsername" class="form-input" placeholder="Örn: ahmet" autocapitalize="none">
                    </div>
                    <div>
                        <label class="form-label">Şifre</label>
                        <input type="text" id="newPassword" class="form-input" value="123456">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:8px;" class="form-group">
                    <div>
                        <label class="form-label">Ad Soyad</label>
                        <input type="text" id="newDisplayName" class="form-input" placeholder="Örn: Ahmet Yılmaz">
                    </div>
                    <div>
                        <label class="form-label">Rol</label>
                        <select id="newRole" class="form-select">
                            <option value="athlete">Sporcu</option>
                            <option value="admin">Yönetici (Admin)</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;" class="form-group">
                    <div>
                        <label class="form-label">Seviye</label>
                        <select id="newLevel" class="form-select">
                            <option value="Başlangıç">Başlangıç</option>
                            <option value="Orta Seviye" selected>Orta Seviye</option>
                            <option value="İleri Seviye">İleri Seviye</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cinsiyet</label>
                        <select id="newGender" class="form-select">
                            <option value="Erkek">Erkek</option>
                            <option value="Kadın">Kadın</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Avatar</label>
                    <div class="avatar-picker-grid" id="newAvatarPicker">
                        <div class="avatar-choice selected" onclick="selectNewAvatar('🥋')">🥋</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🦁')">🦁</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('⚡')">⚡</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🛡️')">🛡️</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🦅')">🦅</div>
                    </div>
                </div>

                <button class="btn btn-gold" style="width:100%; padding:10px; font-weight:800;" onclick="handleCreateUser()">
                    ➕ KULLANICIYI KAYDET
                </button>
            </div>

            <!-- ATHLETES LIST -->
            <h3 style="font-size:13px; font-weight:800; color:#fff; margin-bottom:10px;">📋 Kayıtlı Sporcular</h3>
            <div id="adminUserListContainer"></div>
        </div>
    </div>

    <!-- ==================== LOG WORKOUT COMPLETE MODAL ==================== -->
    <div id="completeModal" class="modal-overlay">
        <div class="modal-box" style="max-width: 560px; max-height: 92vh; overflow-y: auto;">
            <div class="modal-header">
                <span class="modal-title">🏁 Antrenmanı Tamamla & Kaydet</span>
                <button class="modal-close" onclick="closeCompleteModal()">✕</button>
            </div>

            <div class="form-group">
                <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>🏷️ Antrenman İsmi / Program Başlığı</span>
                    <span style="font-size:11px; color:var(--text-secondary); font-weight:normal;">(Hatırlamak için özelleştirin)</span>
                </label>
                <input type="text" id="logProgramName" class="form-input" placeholder="Örn: Pazartesi Ağır Çelik, Rodium Bacak Günü...">
            </div>

            <!-- MEKAN & SALON LOKASYONU -->
            <div class="form-group" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                <label class="form-label" style="margin-bottom:8px; display:flex; align-items:center; gap:6px;">
                    <span>📍 Antrenman Nerede Yapıldı?</span>
                    <span style="font-size:11px; color:var(--text-secondary); font-weight:normal;">(Mekan & Salon Analizi)</span>
                </label>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div>
                        <label style="font-size:11px; color:var(--text-secondary); font-weight:700; margin-bottom:4px; display:block;">Mekan Tipi</label>
                        <select id="logLocationType" class="form-select" onchange="handleLocationTypeChange()">
                            <option value="salon" selected>🏋️ Spor Salonu</option>
                            <option value="ev">🏠 Ev</option>
                            <option value="acik_hava">🌲 Açık Hava / Park</option>
                        </select>
                    </div>
                    <div id="gymSelectGroup">
                        <label style="font-size:11px; color:var(--text-secondary); font-weight:700; margin-bottom:4px; display:block;">Salon Seçimi</label>
                        <select id="logGymSelect" class="form-select" onchange="handleGymSelectChange()">
                            <option value="Rodium">Rodium</option>
                            <option value="Sports & More">Sports & More</option>
                            <option value="Samandağ">Samandağ</option>
                            <option value="MACFit">MACFit</option>
                            <option value="FitStop">FitStop</option>
                            <option value="custom">✏️ Diğer / Yeni Salon Yaz...</option>
                        </select>
                    </div>
                </div>

                <div id="gymCustomGroup" style="margin-top: 10px;">
                    <label id="gymCustomLabel" style="font-size:11px; color:var(--text-secondary); font-weight:700; margin-bottom:4px; display:block;">Salon / Konum Detayı</label>
                    <input type="text" id="logLocationName" class="form-input" value="Rodium" placeholder="Salon veya konum adını giriniz...">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                <div>
                    <label class="form-label">Süre (Dakika)</label>
                    <input type="number" id="logDuration" class="form-input" value="45">
                </div>
                <div>
                    <label class="form-label">Zorluk Derecesi (RPE)</label>
                    <select id="logRpe" class="form-select">
                        <option value="RPE 7 (Rahattı, 3 tekrar daha çıkardı)">RPE 7 (Hafif)</option>
                        <option value="RPE 8 (İdeal, cepte 2 tekrar kaldı)" selected>RPE 8 (İdeal Çelik)</option>
                        <option value="RPE 9 (Zordu, son tekrarda zorlandım)">RPE 9 (Yüksek Yoğunluk)</option>
                        <option value="RPE 10 (Tam Tükeniş, sınırdaydım)">RPE 10 (Maksimal)</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Günün Notları & Çalışılan Kilolar</label>
                <textarea id="logNotes" class="form-input" rows="3" placeholder="Örn: Squat 20 kg rahat çıktı, omuz presinde son sette zorlandım..."></textarea>
            </div>

            <div id="logWorkoutSummaryHint"></div>

            <button class="btn btn-gold" style="width:100%; padding:14px; font-weight:900;" onclick="saveCompletedWorkout()">
                ✅ GÜNLÜĞE KAYDET & SEANSI BİTİR
            </button>
        </div>
    </div>

    <!-- ==================== SCALE & BODY COMPOSITION MODAL ==================== -->
    <div id="scaleModal" class="modal-overlay">
        <div class="modal-box" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <span class="modal-title">⚖️ Tartı & Vücut Analizi Ekle</span>
                <button class="modal-close" onclick="closeScaleModal()">✕</button>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                <div>
                    <label class="form-label">Tarih</label>
                    <input type="date" id="scaleDate" class="form-input">
                </div>
                <div>
                    <label class="form-label">Kilo (kg) <span style="color:var(--gold);">*</span></label>
                    <input type="number" id="scaleWeight" class="form-input" step="0.1" placeholder="Örn: 82.4">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                <div>
                    <label class="form-label">Vücut Yağ Oranı (%)</label>
                    <input type="number" id="scaleBodyFat" class="form-input" step="0.1" placeholder="Örn: 18.5">
                </div>
                <div>
                    <label class="form-label">İskelet Kas Kütlesi (kg)</label>
                    <input type="number" id="scaleMuscleMass" class="form-input" step="0.1" placeholder="Örn: 38.2">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                <div>
                    <label class="form-label">Vücut Sıvı Oranı (%)</label>
                    <input type="number" id="scaleWaterPct" class="form-input" step="0.1" placeholder="Örn: 58.0">
                </div>
                <div>
                    <label class="form-label">İç Organ Yağlanması (1-15)</label>
                    <input type="number" id="scaleVisceralFat" class="form-input" step="1" placeholder="Örn: 6">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Bazal Metabolizma Hızı (BMR - kcal)</label>
                <input type="number" id="scaleBmr" class="form-input" placeholder="Örn: 1850">
            </div>

            <div class="form-group">
                <label class="form-label">Tartı Notu & Koşullar</label>
                <input type="text" id="scaleNotes" class="form-input" placeholder="Örn: Sabah aç karna, tuvalet sonrası...">
            </div>

            <button class="btn btn-gold" style="width:100%; padding:13px; font-weight:900;" onclick="saveScaleEntry()">
                💾 TARTI KAYDINI KAYDET
            </button>
        </div>
    </div>

    <!-- ==================== BODY MEASUREMENTS MODAL ==================== -->
    <div id="measurementsModal" class="modal-overlay">
        <div class="modal-box" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <span class="modal-title">📏 Mezura Vücut Ölçüleri Ekle</span>
                <button class="modal-close" onclick="closeMeasurementsModal()">✕</button>
            </div>

            <div class="form-group">
                <label class="form-label">Ölçüm Tarihi</label>
                <input type="date" id="measureDate" class="form-input">
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                <div>
                    <label class="form-label">Bel Çevresi (cm) <span style="color:var(--gold);">*</span></label>
                    <input type="number" id="measureWaist" class="form-input" step="0.5" placeholder="Göbek hizası (Örn: 86.5)">
                </div>
                <div>
                    <label class="form-label">Göğüs Çevresi (cm)</label>
                    <input type="number" id="measureChest" class="form-input" step="0.5" placeholder="Meme hizası (Örn: 104)">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                <div>
                    <label class="form-label">Omuz Çevresi (cm)</label>
                    <input type="number" id="measureShoulder" class="form-input" step="0.5" placeholder="Omuz tepe hattı">
                </div>
                <div>
                    <label class="form-label">Kol / Pazu (cm)</label>
                    <input type="number" id="measureArms" class="form-input" step="0.5" placeholder="Sıkılı pazu tepe">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                <div>
                    <label class="form-label">Bacak / Uyluk (cm)</label>
                    <input type="number" id="measureThigh" class="form-input" step="0.5" placeholder="Üst bacak orta">
                </div>
                <div>
                    <label class="form-label">Kalça (cm)</label>
                    <input type="number" id="measureHips" class="form-input" step="0.5" placeholder="En geniş kalça">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Boyun Çevresi (cm)</label>
                <input type="number" id="measureNeck" class="form-input" step="0.5" placeholder="Adem elması altı">
            </div>

            <div class="form-group">
                <label class="form-label">Ölçüm Notu</label>
                <input type="text" id="measureNotes" class="form-input" placeholder="Örn: Sabah aç karna, soğuk ölçüm...">
            </div>

            <button class="btn btn-gold" style="width:100%; padding:13px; font-weight:900;" onclick="saveMeasurementsEntry()">
                💾 VÜCUT ÖLÇÜLERİNİ KAYDET
            </button>
        </div>
    </div>

    <!-- ==================== EXERCISE PICKER & ALTERNATIVE MODAL ==================== -->
    <div id="exercisePickerModal" class="modal-overlay">
        <div class="modal-box" style="max-width: 600px;">
            <div class="modal-header">
                <span class="modal-title" id="pickerModalTitle">🔄 Alternatif Egzersiz Seç</span>
                <button class="modal-close" onclick="closeExercisePickerModal()">✕</button>
            </div>

            <!-- SEARCH & FILTERS -->
            <div style="margin-bottom: 10px;">
                <input type="text" id="pickerSearchInput" class="form-input" placeholder="🔍 Egzersiz adı veya kas ara... (Örn: Bench, Squat, Omuz)" oninput="renderPickerList()">
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;" id="pickerCategoryPills">
                <button class="btn-quick-equip" id="pill_cat_all" onclick="setPickerCategory('all')">Tümü</button>
                <button class="btn-quick-equip" id="pill_cat_push" onclick="setPickerCategory('push')">İtiş / Göğüs / Omuz</button>
                <button class="btn-quick-equip" id="pill_cat_pull" onclick="setPickerCategory('pull')">Çekiş / Sırt / Biceps</button>
                <button class="btn-quick-equip" id="pill_cat_legs_quad" onclick="setPickerCategory('legs_quad')">Ön Bacak / Quad</button>
                <button class="btn-quick-equip" id="pill_cat_legs_hinge" onclick="setPickerCategory('legs_hinge')">Arka Bacak / Kalça</button>
                <button class="btn-quick-equip" id="pill_cat_core" onclick="setPickerCategory('core')">Karın & Core</button>
            </div>

            <div style="max-height: 52vh; overflow-y: auto; padding-right: 4px;" id="pickerExercisesContainer">
                <!-- Dynamically rendered list of exercises -->
            </div>
        </div>
    </div>

    <!-- ==================== JAVASCRIPT APPLICATION CORE ==================== -->
    <script>
        // EXERCISE DATABASE
        const EXERCISES_DB = {EXERCISES_JSON};
        const DIAGRAMS_SVG_DB = {DIAGRAMS_JSON};

        // GLOBAL APP STATE
        let selectedSplit = 'full_body';
        let selectedEquipments = ['dumbbell', 'kettlebell', 'bodyweight'];
        let currentGeneratedWorkout = null;
        let activeWorkoutSession = null;
        let activeWorkoutStartTime = null;
        let activeWorkoutIsPaused = false;
        let activeWorkoutPausedAt = null;
        let activeWorkoutTotalPausedMs = 0;
        let activeWorkoutSetsData = {{}};
        let workoutTimerInterval = null;

        // REST TIMER STATE
        let timerInterval = null;
        let timerRemaining = 45;
        let isTimerRunning = false;

        // AUTH & ATHLETE SESSION
        let currentSession = null;
        let selectedNewAvatar = '🥋';
        let selectedAvatar = '🥋';
        let selectedTheme = 'gold';

        const THEMES = {{
            gold: {{ gold: '#f59e0b', goldLight: '#fde68a', glow: 'rgba(245, 158, 11, 0.25)' }},
            cyan: {{ gold: '#38bdf8', goldLight: '#bae6fd', glow: 'rgba(56, 189, 248, 0.25)' }},
            green: {{ gold: '#10b981', goldLight: '#a7f3d0', glow: 'rgba(16, 185, 129, 0.25)' }},
            red: {{ gold: '#f43f5e', goldLight: '#fecdd3', glow: 'rgba(244, 63, 94, 0.25)' }},
            purple: {{ gold: '#a855f7', goldLight: '#e9d5ff', glow: 'rgba(168, 85, 247, 0.25)' }}
        }};

        // TAB SWITCHING
        function switchTab(tabId) {{
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
            if (targetBtn) targetBtn.classList.add('active');

            const targetContent = document.getElementById(tabId);
            if (targetContent) targetContent.classList.add('active');

            if (tabId === 'libraryTab') renderLibrary();
            if (tabId === 'historyTab') renderHistory();
            if (tabId === 'analyticsTab') renderAnalytics();

            window.scrollTo({{ top: 0, behavior: 'smooth' }});
        }}

        // ==================== WORKOUT GENERATOR ENGINE ====================
        function selectSplit(split) {{
            selectedSplit = split;
            document.querySelectorAll('#splitGrid .split-card').forEach(card => {{
                card.classList.toggle('selected', card.getAttribute('onclick').includes(split));
            }});
        }}

        function toggleEquip(eq) {{
            const idx = selectedEquipments.indexOf(eq);
            if (idx > -1) {{
                if (selectedEquipments.length === 1) {{
                    alert("En az bir ekipman seçili olmalıdır!");
                    return;
                }}
                selectedEquipments.splice(idx, 1);
            }} else {{
                selectedEquipments.push(eq);
            }}
            renderEquipChips();
        }}

        function setQuickEquip(type) {{
            if (type === 'all') {{
                selectedEquipments = ['dumbbell', 'kettlebell', 'barbell', 'machine', 'bodyweight'];
            }} else if (type === 'db_only') {{
                selectedEquipments = ['dumbbell'];
            }} else if (type === 'db_kb_bw') {{
                selectedEquipments = ['dumbbell', 'kettlebell', 'bodyweight'];
            }} else if (type === 'bw_only') {{
                selectedEquipments = ['bodyweight'];
            }}
            renderEquipChips();
        }}

        function renderEquipChips() {{
            const chips = document.querySelectorAll('#equipChipsWrap .equip-chip');
            chips.forEach(chip => {{
                const match = chip.getAttribute('onclick').match(/'([^']+)'/);
                if (match) {{
                    chip.classList.toggle('selected', selectedEquipments.includes(match[1]));
                }}
            }});
        }}

        function getRepAndRestScheme(goal, style) {{
            if (goal === 'strength') {{
                return {{ sets: 4, reps: '4 - 6', rest: 90 }};
            }} else if (goal === 'endurance') {{
                return {{ sets: 3, reps: '12 - 15', rest: 30 }};
            }} else {{
                // hypertrophy
                return {{ sets: 3, reps: '8 - 12', rest: style === 'superset' ? 45 : 60 }};
            }}
        }}

        function filterExercises(category, excludeIds = []) {{
            return EXERCISES_DB.filter(ex => {{
                if (excludeIds.includes(ex.id)) return false;
                if (!selectedEquipments.includes(ex.equipment)) return false;
                if (category === 'any') return true;
                if (Array.isArray(category)) return category.includes(ex.category);
                return ex.category === category;
            }});
        }}

        function pickRandom(arr) {{
            if (!arr || arr.length === 0) return null;
            return arr[Math.floor(Math.random() * arr.length)];
        }}

        function handleGenerateWorkout() {{
            const style = document.getElementById('paramStyle').value;
            const goal = document.getElementById('paramGoal').value;
            const duration = parseInt(document.getElementById('paramDuration').value, 10);
            const scheme = getRepAndRestScheme(goal, style);

            const chosenExercises = [];
            const usedIds = [];

            function addEx(cat) {{
                let pool = filterExercises(cat, usedIds);
                let chosen = pickRandom(pool);
                if (!chosen) {{
                    let relatedCat = cat;
                    if (cat === 'push') relatedCat = ['push', 'core'];
                    else if (cat === 'pull') relatedCat = ['pull', 'core'];
                    else if (cat === 'legs_quad' || cat === 'legs_hinge') relatedCat = ['legs_quad', 'legs_hinge', 'core'];

                    const fallbackPool = EXERCISES_DB.filter(ex => 
                        selectedEquipments.includes(ex.equipment) && 
                        !usedIds.includes(ex.id) &&
                        (Array.isArray(relatedCat) ? relatedCat.includes(ex.category) : ex.category === relatedCat)
                    );
                    chosen = pickRandom(fallbackPool);
                }}
                if (chosen) {{
                    usedIds.push(chosen.id);
                    chosenExercises.push(chosen);
                }}
            }}

            // Split-based generation logic
            if (selectedSplit === 'full_body') {{
                // Block A: Quad + Row/Pull
                addEx('legs_quad');
                addEx('pull');
                // Block B: Hinge + Push
                addEx('legs_hinge');
                addEx('push');
                if (duration >= 45) {{
                    // Block C: Lunge/Single leg + Core/Arms
                    addEx(['legs_quad', 'legs_hinge']);
                    addEx('core');
                }}
                if (duration >= 60) {{
                    // Block D: Push + Pull accessories
                    addEx('push');
                    addEx('pull');
                }}
            }} else if (selectedSplit === 'upper_push') {{
                addEx('push');
                addEx('push');
                addEx('push');
                addEx('core');
                if (duration >= 45) {{
                    addEx('push');
                    addEx('core');
                }}
                if (duration >= 60) {{
                    addEx('push');
                    addEx('core');
                }}
            }} else if (selectedSplit === 'upper_pull') {{
                addEx('pull');
                addEx('pull');
                addEx(['legs_hinge', 'pull']);
                addEx('core');
                if (duration >= 45) {{
                    addEx('pull');
                    addEx('core');
                }}
                if (duration >= 60) {{
                    addEx('pull');
                    addEx('core');
                }}
            }} else if (selectedSplit === 'lower') {{
                addEx('legs_quad');
                addEx('legs_hinge');
                addEx('legs_quad');
                addEx('legs_hinge');
                if (duration >= 45) {{
                    addEx(['legs_quad', 'legs_hinge']);
                    addEx('core');
                }}
                if (duration >= 60) {{
                    addEx(['legs_quad', 'legs_hinge']);
                    addEx('core');
                }}
            }} else if (selectedSplit === 'upper') {{
                addEx('push');
                addEx('pull');
                addEx('push');
                addEx('pull');
                if (duration >= 45) {{
                    addEx('push');
                    addEx('pull');
                }}
                if (duration >= 60) {{
                    addEx('core');
                    addEx('core');
                }}
            }} else if (selectedSplit === 'core') {{
                for (let i = 0; i < (duration >= 45 ? 6 : 4); i++) {{
                    addEx('core');
                }}
            }}

            // Dynamic Warmups
            const warmups = [
                {{ name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ve geniş dairelerle ısıt." }},
                {{ name: "World's Greatest Stretch (Kalça & Torasik Açış)", dur: "60 sn", cue: "Derin lunge pozisyonunda göğsü tavana doğru çevir." }},
                {{ name: "Kedi - Deve & Kuş Köpeği (Omurga Aktivasyonu)", dur: "60 sn", cue: "Nefes alarak beli çukurlaştır, nefes vererek sırtı kabart." }}
            ];

            // Finisher
            const finishers = [
                {{ name: "3 Dk Tabata Balistik Bitiş", desc: "20 sn Maksimum Tempolu Swing / Burpee + 10 sn Dinlenme (4 Tur)" }},
                {{ name: "Çiftçi Taşıması (Farmer's Carry Burnout)", desc: "Mümkün olan en ağır dambıllarla 3 tur 40 metre kesintisiz yürüyüş." }}
            ];

            const splitNames = {{
                full_body: "Tüm Vücut (Full Body)",
                upper_push: "Üst İtiş (Push)",
                upper_pull: "Üst Çekiş (Pull)",
                lower: "Alt Vücut & Bacak",
                upper: "Tüm Üst Vücut",
                core: "Karın & Core Zırhı"
            }};

            currentGeneratedWorkout = {{
                id: 'gen_' + Date.now(),
                title: `${{splitNames[selectedSplit]}} • ${{style === 'superset' ? 'Süperset' : (style === 'emom' ? 'EMOM' : 'Klasik')}}`,
                split: selectedSplit,
                splitName: splitNames[selectedSplit],
                style,
                goal,
                duration,
                scheme,
                warmups,
                exercises: chosenExercises,
                finisher: finishers[Math.floor(Math.random() * finishers.length)],
                createdAt: Date.now()
            }};

            renderGeneratedWorkout();
            playAlertSound();
        }}

        function renderGeneratedWorkout() {{
            const w = currentGeneratedWorkout;
            const container = document.getElementById('generatedWorkoutOutput');
            if (!w || !container) return;

            const user = getActiveUser();
            const weights = user.weights || {{}};

            let blocksHtml = '';
            if (w.style === 'superset') {{
                for (let i = 0; i < w.exercises.length; i += 2) {{
                    const blockLetter = String.fromCharCode(65 + Math.floor(i / 2));
                    const ex1 = w.exercises[i];
                    const ex2 = w.exercises[i + 1];

                    blocksHtml += `
                        <div class="block-header">SÜPERSET BLOK ${{blockLetter}} (Dinlenmeden Peş Peşe)</div>
                        ${{renderSingleExerciseCard(ex1, `${{blockLetter}}1`, w.scheme, weights, 'generated')}}
                        ${{ex2 ? renderSingleExerciseCard(ex2, `${{blockLetter}}2`, w.scheme, weights, 'generated') : ''}}
                    `;
                }}
            }} else {{
                w.exercises.forEach((ex, idx) => {{
                    blocksHtml += renderSingleExerciseCard(ex, `${{idx + 1}}`, w.scheme, weights, 'generated');
                }});
            }}

            container.innerHTML = `
                <div class="workout-header-card">
                    <div class="workout-title-row">
                        <div>
                            <div class="badge-brand">HAZIRLANAN ANTRENMAN</div>
                            <h2 class="workout-main-title">${{escapeHTML(w.title)}}</h2>
                        </div>
                        <div class="workout-meta-badges">
                            <span class="meta-pill">⏱️ ${{w.duration}} Dk</span>
                            <span class="meta-pill">🎯 ${{w.scheme.sets}} Set x ${{w.scheme.reps}}</span>
                            <span class="meta-pill">⏳ ${{w.scheme.rest}}s Dinlenme</span>
                        </div>
                    </div>

                    <!-- ACTION BUTTONS -->
                    <div class="workout-actions-bar">
                        <button class="btn-start-workout" onclick="startActiveWorkoutFromGenerated()">
                            <span>▶️ ANTRENMANI BAŞLAT (SAYAÇ & SETLER)</span>
                        </button>
                        <button class="btn-action-secondary" onclick="saveGeneratedToLibrary()">
                            <span>💾 Programlarıma Kaydet</span>
                        </button>
                        <button class="btn-action-secondary" onclick="handleGenerateWorkout()">
                            <span>🎲 Farklı Varyasyon</span>
                        </button>
                    </div>

                    <!-- WARMUP SECTION -->
                    <div class="block-header" style="margin-top:24px;">🧘 Dinamik Isınma & Mobilite (5 Dakika)</div>
                    <div style="background:rgba(0,0,0,0.25); border-radius:10px; padding:10px 14px;">
                        ${{w.warmups.map(wm => `
                            <div style="font-size:12.5px; margin-bottom:6px;">
                                <strong style="color:var(--gold-light);">${{escapeHTML(wm.name)}}</strong> (${{wm.dur}}): 
                                <span style="color:var(--text-secondary);">${{escapeHTML(wm.cue)}}</span>
                            </div>
                        `).join('')}}
                    </div>

                    <!-- MAIN EXERCISES -->
                    ${{blocksHtml}}

                    <div style="text-align:center; margin:16px 0 24px;">
                        <button class="btn btn-outline" style="border-style:dashed; border-color:var(--cyan); color:var(--cyan); font-size:12.5px; padding:10px 18px;" onclick="openAddExerciseModal('generated')">
                            ➕ Bu Antrenmana Yeni Hareket Ekle
                        </button>
                    </div>

                    <!-- FINISHER -->
                    <div class="block-header">🔥 Balistik Bitiş / Finisher</div>
                    <div style="background:rgba(225, 29, 72, 0.1); border-left:4px solid var(--red-alert); border-radius:8px; padding:10px 14px;">
                        <strong style="color:#fff; font-size:13px;">${{escapeHTML(w.finisher.name)}}</strong>
                        <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${{escapeHTML(w.finisher.desc)}}</div>
                    </div>
                </div>
            `;

            if (container.scrollIntoView) container.scrollIntoView({{ behavior: 'smooth' }});
        }}

        function switchGuideTab(collapseId, tabName) {{
            const panels = ['form', 'anatomi', 'adimlar'];
            panels.forEach(p => {{
                const panelEl = document.getElementById(`panel_${{p}}_${{collapseId}}`);
                const btnEl = document.getElementById(`tab_btn_${{p}}_${{collapseId}}`);
                if (panelEl) {{
                    if (p === tabName) {{
                        panelEl.classList.add('active');
                    }} else {{
                        panelEl.classList.remove('active');
                    }}
                }}
                if (btnEl) {{
                    if (p === tabName) {{
                        btnEl.classList.add('active');
                    }} else {{
                        btnEl.classList.remove('active');
                    }}
                }}
            }});
        }}

        function togglePosGuide(collapseId) {{
            const el = document.getElementById(collapseId);
            const btn = document.getElementById('icon_' + collapseId);
            if (!el) return;
            if (el.classList.contains('collapsed')) {{
                el.classList.remove('collapsed');
                if (btn) btn.innerText = '📖 Formu Gizle ▲';
            }} else {{
                el.classList.add('collapsed');
                if (btn) btn.innerText = '📖 Formu Gör ▼';
            }}
        }}

        function renderExercisePositionsHtml(exInput, uniquePrefix = '', defaultCollapsed = false) {{
            if (!exInput) return '';
            const ex = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) 
                ? (EXERCISES_DB.find(e => e.id === exInput.id) || exInput)
                : exInput;

            if (!ex.positions || !Array.isArray(ex.positions) || ex.positions.length === 0) {{
                return '';
            }}

            const isComplex = !!ex.isComplex;
            const badgeType = isComplex ? 'pos-badge-complex' : 'pos-badge-standard';
            const typeLabel = isComplex 
                ? `🔥 Kompleks Hareket (${{ex.positions.length}} Aşama)` 
                : `📐 3 Aşamalı Form Kılavuzu`;

            const collapseId = `posGuide_${{uniquePrefix}}_${{ex.id}}`.replace(/[^a-zA-Z0-9_-]/g, '_');

            const badgeStyles = {{
                setup: {{ bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.35)', icon: '🟢' }},
                action: {{ bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)', icon: '⚡' }},
                trans: {{ bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.35)', icon: '🔄' }},
                finish: {{ bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)', icon: '🏁' }}
            }};

            const stepsHtml = ex.positions.map((p, idx) => {{
                const style = badgeStyles[p.badge] || badgeStyles.setup;
                return `
                    <div class="pos-step-card">
                        <div class="pos-step-header" style="background:${{style.bg}}; border-color:${{style.border}}; color:${{style.text}};">
                            <span>${{style.icon}} ${{escapeHTML(p.phase)}}</span>
                        </div>
                        <div class="pos-step-desc">
                            ${{escapeHTML(p.desc)}}
                        </div>
                    </div>
                `;
            }}).join('');

            const guidePhotos = {{
                'db_goblet_squat': {{ form: 'assets/guides/guide_db_goblet_squat_form.jpg', anatomi: 'assets/guides/guide_db_goblet_squat_anatomi.jpg' }},
                'db_front_squat': {{ form: 'assets/guides/guide_db_goblet_squat_form.jpg', anatomi: 'assets/guides/guide_db_goblet_squat_anatomi.jpg' }},
                'kb_goblet_squat': {{ form: 'assets/guides/guide_db_goblet_squat_form.jpg', anatomi: 'assets/guides/guide_db_goblet_squat_anatomi.jpg' }},
                'bw_air_squat': {{ form: 'assets/guides/guide_db_goblet_squat_form.jpg', anatomi: 'assets/guides/guide_db_goblet_squat_anatomi.jpg' }},
                'db_bench_press': {{ form: 'assets/guides/guide_db_bench_press_form.jpg', anatomi: 'assets/guides/guide_db_bench_press_anatomi.jpg' }},
                'db_floor_press': {{ form: 'assets/guides/guide_db_bench_press_form.jpg', anatomi: 'assets/guides/guide_db_bench_press_anatomi.jpg' }},
                'db_incline_press': {{ form: 'assets/guides/guide_db_bench_press_form.jpg', anatomi: 'assets/guides/guide_db_bench_press_anatomi.jpg' }},
                'db_overhead_press': {{ form: 'assets/guides/guide_db_overhead_press_form.jpg', anatomi: 'assets/guides/guide_db_overhead_press_anatomi.jpg' }},
                'db_arnold_press': {{ form: 'assets/guides/guide_db_overhead_press_form.jpg', anatomi: 'assets/guides/guide_db_overhead_press_anatomi.jpg' }},
                'kb_press': {{ form: 'assets/guides/guide_db_overhead_press_form.jpg', anatomi: 'assets/guides/guide_db_overhead_press_anatomi.jpg' }},
                'db_saw_row': {{ form: 'assets/guides/guide_db_saw_row_form.jpg', anatomi: 'assets/guides/guide_db_saw_row_anatomi.jpg' }},
                'db_chest_supported_row': {{ form: 'assets/guides/guide_db_saw_row_form.jpg', anatomi: 'assets/guides/guide_db_saw_row_anatomi.jpg' }},
                'kb_gorilla_row': {{ form: 'assets/guides/guide_db_saw_row_form.jpg', anatomi: 'assets/guides/guide_db_saw_row_anatomi.jpg' }},
                'db_rdl': {{ form: 'assets/guides/guide_db_rdl_form.jpg', anatomi: 'assets/guides/guide_db_rdl_anatomi.jpg' }},
                'db_single_leg_rdl': {{ form: 'assets/guides/guide_db_rdl_form.jpg', anatomi: 'assets/guides/guide_db_rdl_anatomi.jpg' }},
                'db_walking_lunge': {{ form: 'assets/guides/guide_db_walking_lunge_form.jpg', anatomi: 'assets/guides/guide_db_walking_lunge_anatomi.jpg' }},
                'db_reverse_lunge': {{ form: 'assets/guides/guide_db_walking_lunge_form.jpg', anatomi: 'assets/guides/guide_db_walking_lunge_anatomi.jpg' }},
                'db_snatch': {{ form: 'assets/guides/guide_db_snatch_form.jpg', anatomi: 'assets/guides/guide_db_snatch_anatomi.jpg' }},
                'kb_half_snatch': {{ form: 'assets/guides/guide_db_snatch_form.jpg', anatomi: 'assets/guides/guide_db_snatch_anatomi.jpg' }},
                'db_swing': {{ form: 'assets/guides/guide_db_swing_form.jpg', anatomi: 'assets/guides/guide_db_swing_anatomi.jpg' }},
                'kb_swing': {{ form: 'assets/guides/guide_db_swing_form.jpg', anatomi: 'assets/guides/guide_db_swing_anatomi.jpg' }},
                'bw_pushup': {{ form: 'assets/guides/guide_bw_pushup_form.jpg', anatomi: 'assets/guides/guide_bw_pushup_anatomi.jpg' }},
                'bw_diamond_pushup': {{ form: 'assets/guides/guide_bw_pushup_form.jpg', anatomi: 'assets/guides/guide_bw_pushup_anatomi.jpg' }}
            }};

            const photoGuide = guidePhotos[ex.id];
            const hasAnatomy = !!(photoGuide && photoGuide.anatomi);

            let formVisualHtml = '';
            if (photoGuide && photoGuide.form) {{
                formVisualHtml = `
                    <div class="pos-diagram-wrap">
                        <img src="${{photoGuide.form}}" alt="${{escapeHTML(ex.name)}} Form Rehberi" class="pos-diagram-img" loading="lazy">
                    </div>
                `;
            }} else {{
                const diagramFallbackMap = {{
                    'db_goblet_squat': 'seq_db_squat.svg',
                    'db_front_squat': 'seq_db_clean_squat.svg',
                    'kb_clean': 'seq_db_clean_squat.svg',
                    'db_bench_press': 'seq_floor_press.svg',
                    'db_floor_press': 'seq_floor_press.svg',
                    'db_overhead_press': 'seq_db_press.svg',
                    'db_saw_row': 'seq_db_row.svg',
                    'db_rdl': 'seq_db_rdl.svg',
                    'db_walking_lunge': 'seq_db_lunge.svg',
                    'db_snatch': 'seq_db_snatch.svg',
                    'db_swing': 'seq_db_swing.svg',
                    'bw_pushup': 'seq_pushup.svg',
                    'db_renegade_row': 'seq_renegade_row.svg',
                    'db_farmers_walk': 'seq_farmers_walk.svg',
                    'db_russian_twist': 'seq_russian_twist.svg',
                    'kb_windmill': 'seq_windmill.svg',
                    'kb_turkish_getup': 'seq_windmill.svg',
                    'kb_thruster': 'seq_thruster.svg',
                    'bw_burpee': 'seq_escalera.svg',
                    'bw_plank': 'seq_plank_pull_through.svg'
                }};
                const targetFname = (ex.diagram ? ex.diagram.split('/').pop() : '') || diagramFallbackMap[ex.id] || '';
                const inlineSvg = (typeof DIAGRAMS_SVG_DB !== 'undefined' && DIAGRAMS_SVG_DB[targetFname]) ? DIAGRAMS_SVG_DB[targetFname] : '';
                if (inlineSvg) {{
                    formVisualHtml = `
                        <div class="pos-diagram-wrap">
                            ${{inlineSvg}}
                        </div>
                    `;
                }} else if (ex.diagram) {{
                    formVisualHtml = `
                        <div class="pos-diagram-wrap">
                            <img src="${{ex.diagram}}" alt="${{escapeHTML(ex.name)}} Form Şeması" class="pos-diagram-img" loading="lazy">
                        </div>
                    `;
                }}
            }}

            let anatomiVisualHtml = '';
            if (hasAnatomy) {{
                anatomiVisualHtml = `
                    <div class="pos-diagram-wrap">
                        <img src="${{photoGuide.anatomi}}" alt="${{escapeHTML(ex.name)}} Hedef Kaslar" class="pos-diagram-img" loading="lazy">
                    </div>
                `;
            }} else {{
                anatomiVisualHtml = `
                    <div style="background:rgba(0,0,0,0.3); border-radius:8px; padding:16px; text-align:center; color:var(--text-secondary); font-size:12px;">
                        🎯 <strong>Hedeflenen Kas Grubu:</strong> <span style="color:var(--gold); font-weight:800;">${{escapeHTML(ex.muscle || '')}}</span>
                    </div>
                `;
            }}

            const contentClass = defaultCollapsed ? 'pos-guide-content collapsed' : 'pos-guide-content';
            const btnText = defaultCollapsed ? '📖 Formu Gör ▼' : '📖 Formu Gizle ▲';

            return `
                <div class="pos-guide-wrapper">
                    <div class="pos-guide-header" onclick="event.stopPropagation(); togglePosGuide('${{collapseId}}')">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="pos-type-badge ${{badgeType}}">${{typeLabel}}</span>
                            <span class="pos-guide-hint">📸 Form • 🧬 Anatomi • 📝 Talimatlar</span>
                        </div>
                        <button type="button" class="btn-toggle-guide" id="btn_${{collapseId}}" onclick="event.stopPropagation(); togglePosGuide('${{collapseId}}')">
                            <span id="icon_${{collapseId}}">${{btnText}}</span>
                        </button>
                    </div>
                    <div class="${{contentClass}}" id="${{collapseId}}">
                        <!-- TABS SWITCHER -->
                        <div class="guide-toggle-tabs">
                            <button type="button" class="btn-guide-tab active" id="tab_btn_form_${{collapseId}}" onclick="event.stopPropagation(); switchGuideTab('${{collapseId}}', 'form')">
                                📸 Form Rehberi
                            </button>
                            <button type="button" class="btn-guide-tab" id="tab_btn_anatomi_${{collapseId}}" onclick="event.stopPropagation(); switchGuideTab('${{collapseId}}', 'anatomi')">
                                🧬 Çalışan Kaslar
                            </button>
                            <button type="button" class="btn-guide-tab" id="tab_btn_adimlar_${{collapseId}}" onclick="event.stopPropagation(); switchGuideTab('${{collapseId}}', 'adimlar')">
                                📝 Adım Adım
                            </button>
                        </div>

                        <!-- PANEL 1: FORM PHOTO / VECTOR -->
                        <div class="guide-tab-panel active" id="panel_form_${{collapseId}}">
                            ${{formVisualHtml}}
                        </div>

                        <!-- PANEL 2: ANATOMY PHOTO -->
                        <div class="guide-tab-panel" id="panel_anatomi_${{collapseId}}">
                            ${{anatomiVisualHtml}}
                        </div>

                        <!-- PANEL 3: STEP-BY-STEP CARDS -->
                        <div class="guide-tab-panel" id="panel_adimlar_${{collapseId}}">
                            <div class="pos-steps-grid cols-${{ex.positions.length}}">
                                ${{stepsHtml}}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }}

        function renderSingleExerciseCard(ex, label, scheme, weights, scope = 'generated') {{
            const equipLabels = {{
                dumbbell: 'Dambıl',
                kettlebell: 'Kettlebell',
                barbell: 'Barbell',
                machine: 'Makine/Kablo',
                bodyweight: 'Vücut Ağırlığı'
            }};

            const targetW = ex.weightKey && weights[ex.weightKey] ? weights[ex.weightKey] : null;

            return `
                <div class="ex-card" id="card_${{ex.id}}">
                    <div class="ex-card-header">
                        <div class="ex-name">
                            <span style="color:var(--gold); font-weight:900;">${{label}}.</span>
                            <span>${{escapeHTML(ex.name)}}</span>
                        </div>
                        <div class="ex-tag-group">
                            <span class="ex-badge badge-equip">${{equipLabels[ex.equipment] || ex.equipment}}</span>
                            <span class="ex-badge badge-muscle">${{escapeHTML(ex.muscle.split(',')[0])}}</span>
                            ${{targetW ? `<span class="badge-target-weight">🎯 Hedefin: ${{targetW}} kg</span>` : ''}}
                        </div>
                    </div>

                    <div class="ex-meta-row">
                        <span>📊 ${{scheme.sets}} Set x ${{scheme.reps}} Tekrar</span>
                        <span>⏱️ Dinlenme: ${{scheme.rest}} sn</span>
                    </div>

                    <div class="ex-cue-box">
                        💡 <strong>Altın Kural:</strong> ${{escapeHTML(ex.cue)}}
                    </div>

                    ${{renderExercisePositionsHtml(ex, `${{scope}}_${{label}}`, false)}}

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px dashed var(--border);">
                        <button class="btn-swap-ex" style="color:#f87171; border-color:rgba(239,68,68,0.3);" onclick="removeExerciseFromWorkout('${{ex.id}}', '${{scope}}')" title="Bu hareketi kaldır">
                            🗑️ Kaldır
                        </button>
                        <div style="display:flex; gap:6px;">
                            <button class="btn-swap-ex" onclick="openAlternativeModal('${{ex.id}}', '${{scope}}')" title="Listeden alternatif seç">
                                📋 Alternatif Seç
                            </button>
                            <button class="btn-swap-ex" onclick="swapSingleExercise('${{ex.id}}', '${{scope}}')" title="Rastgele başka hareket ver">
                                🎲 Rastgele
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }}

        // ==================== EXERCISE PICKER & ALTERNATIVE MODAL LOGIC ====================
        let pickerContext = {{
            mode: 'replace', // 'replace' or 'add'
            targetExId: null,
            scope: 'generated', // 'generated' or 'active'
            categoryFilter: 'all'
        }};

        function openAlternativeModal(currentExId, scope = 'generated') {{
            const workout = scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) return;

            const currentEx = workout.exercises.find(e => e.id === currentExId);
            pickerContext = {{
                mode: 'replace',
                targetExId: currentExId,
                scope: scope,
                categoryFilter: currentEx ? currentEx.category : 'all'
            }};

            document.getElementById('pickerModalTitle').innerText = `🔄 "${{currentEx ? currentEx.name : 'Hareket'}}" İçin Alternatif Seç`;
            document.getElementById('pickerSearchInput').value = '';
            updatePickerCategoryPills();
            renderPickerList();
            document.getElementById('exercisePickerModal').classList.add('active');
        }}

        function openAddExerciseModal(scope = 'generated') {{
            const workout = scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) return;

            pickerContext = {{
                mode: 'add',
                targetExId: null,
                scope: scope,
                categoryFilter: 'all'
            }};

            document.getElementById('pickerModalTitle').innerText = "➕ Antrenmana Yeni Hareket Ekle";
            document.getElementById('pickerSearchInput').value = '';
            updatePickerCategoryPills();
            renderPickerList();
            document.getElementById('exercisePickerModal').classList.add('active');
        }}

        function closeExercisePickerModal() {{
            document.getElementById('exercisePickerModal').classList.remove('active');
        }}

        function setPickerCategory(cat) {{
            pickerContext.categoryFilter = cat;
            updatePickerCategoryPills();
            renderPickerList();
        }}

        function updatePickerCategoryPills() {{
            const cats = ['all', 'push', 'pull', 'legs_quad', 'legs_hinge', 'core'];
            cats.forEach(c => {{
                const el = document.getElementById('pill_cat_' + c);
                if (el) {{
                    if (pickerContext.categoryFilter === c) {{
                        el.style.borderColor = 'var(--gold)';
                        el.style.color = 'var(--gold)';
                        el.style.background = 'rgba(245, 158, 11, 0.15)';
                    }} else {{
                        el.style.borderColor = 'var(--border)';
                        el.style.color = 'var(--text-secondary)';
                        el.style.background = 'transparent';
                    }}
                }}
            }});
        }}

        function renderPickerList() {{
            const container = document.getElementById('pickerExercisesContainer');
            if (!container) return;

            const q = (document.getElementById('pickerSearchInput').value || '').trim().toLowerCase();
            const cat = pickerContext.categoryFilter;

            const workout = pickerContext.scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            const existingIds = workout ? workout.exercises.map(e => e.id) : [];

            const equipLabels = {{
                dumbbell: 'Dambıl',
                kettlebell: 'Kettlebell',
                barbell: 'Barbell',
                machine: 'Makine/Kablo',
                bodyweight: 'Vücut Ağırlığı'
            }};

            let filtered = EXERCISES_DB.filter(ex => {{
                if (pickerContext.mode === 'replace' && ex.id === pickerContext.targetExId) return false;
                if (pickerContext.mode === 'add' && existingIds.includes(ex.id)) return false;

                // equipment filter
                if (!selectedEquipments.includes(ex.equipment)) return false;

                // category filter
                if (cat !== 'all' && ex.category !== cat) return false;

                // search text filter
                if (q) {{
                    const matchName = ex.name.toLowerCase().includes(q);
                    const matchMuscle = ex.muscle.toLowerCase().includes(q);
                    const matchEquip = (equipLabels[ex.equipment] || '').toLowerCase().includes(q);
                    if (!matchName && !matchMuscle && !matchEquip) return false;
                }}
                return true;
            }});

            if (filtered.length === 0) {{
                container.innerHTML = `
                    <div style="text-align:center; padding:30px 10px; color:var(--text-secondary); font-size:12px;">
                        Kriterlere uygun başka egzersiz bulunamadı. Filtreleri temizleyip tekrar arayabilirsiniz.
                    </div>
                `;
                return;
            }}

            container.innerHTML = filtered.map(ex => `
                <div class="ex-card" style="margin-bottom:8px; padding:10px 12px; cursor:pointer;" onclick="selectExerciseFromPicker('${{ex.id}}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <strong style="color:#fff; font-size:13.5px;">${{escapeHTML(ex.name)}}</strong>
                        <div style="display:flex; gap:4px;">
                            <span class="ex-badge badge-equip">${{equipLabels[ex.equipment] || ex.equipment}}</span>
                            <span class="ex-badge badge-muscle">${{escapeHTML(ex.muscle.split(',')[0])}}</span>
                        </div>
                    </div>
                    <div style="font-size:11.5px; color:var(--text-secondary); line-height:1.3; margin-bottom:6px;">
                        💡 ${{escapeHTML(ex.cue)}}
                    </div>
                    ${{renderExercisePositionsHtml(ex, `picker_${{ex.id}}`, true)}}
                    <div style="text-align:right; margin-top:6px;">
                        <button class="btn btn-gold" style="font-size:11px; padding:4px 10px;">
                            ${{pickerContext.mode === 'replace' ? '✓ Bu Alternatifi Seç' : '➕ Bu Hareketi Ekle'}}
                        </button>
                    </div>
                </div>
            `).join('');
        }}

        function selectExerciseFromPicker(newExId) {{
            const newEx = EXERCISES_DB.find(e => e.id === newExId);
            if (!newEx) return;

            const workout = pickerContext.scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) return;

            if (pickerContext.mode === 'replace') {{
                const idx = workout.exercises.findIndex(e => e.id === pickerContext.targetExId);
                if (idx !== -1) {{
                    workout.exercises[idx] = newEx;
                }}
            }} else if (pickerContext.mode === 'add') {{
                workout.exercises.push(newEx);
            }}

            closeExercisePickerModal();

            if (pickerContext.scope === 'active') {{
                renderActiveWorkout();
            }} else {{
                renderGeneratedWorkout();
            }}
            playAlertSound();
        }}

        function removeExerciseFromWorkout(exId, scope = 'generated') {{
            const workout = scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) return;

            if (workout.exercises.length <= 1) {{
                alert("Antrenmanda en az 1 egzersiz kalmalıdır!");
                return;
            }}

            const ex = workout.exercises.find(e => e.id === exId);
            if (confirm(`"${{ex ? ex.name : 'Bu egzersizi'}}" antrenman programından kaldırmak istediğinize emin misiniz?`)) {{
                workout.exercises = workout.exercises.filter(e => e.id !== exId);
                if (scope === 'active') {{
                    renderActiveWorkout();
                }} else {{
                    renderGeneratedWorkout();
                }}
            }}
        }}

        function swapSingleExercise(currentExId, scope = 'generated') {{
            const workout = scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) return;

            const exIndex = workout.exercises.findIndex(e => e.id === currentExId);
            if (exIndex === -1) return;

            const currentEx = workout.exercises[exIndex];
            const usedIds = workout.exercises.map(e => e.id);

            // Pool of alternatives in the same category & available equipments
            const pool = filterExercises(currentEx.category, usedIds);
            let replacement = pickRandom(pool);
            if (!replacement) {{
                let relatedCat = currentEx.category;
                if (currentEx.category === 'push') relatedCat = ['push', 'core'];
                else if (currentEx.category === 'pull') relatedCat = ['pull', 'core'];
                else if (currentEx.category === 'legs_quad' || currentEx.category === 'legs_hinge') relatedCat = ['legs_quad', 'legs_hinge', 'core'];

                const fallback = EXERCISES_DB.filter(e => selectedEquipments.includes(e.equipment) && !usedIds.includes(e.id) && (Array.isArray(relatedCat) ? relatedCat.includes(e.category) : e.category === relatedCat));
                replacement = pickRandom(fallback);
            }}

            if (replacement) {{
                workout.exercises[exIndex] = replacement;
                if (scope === 'active') {{
                    renderActiveWorkout();
                }} else {{
                    renderGeneratedWorkout();
                }}
                playAlertSound();
            }} else {{
                alert("Seçili ekipman havuzunda bu kas grubu için başka alternatif bulunamadı.");
            }}
        }}

        // ==================== ACTIVE LIVE WORKOUT TRACKER ====================
        function startActiveWorkoutFromGenerated() {{
            if (!currentGeneratedWorkout) return;
            activeWorkoutSession = JSON.parse(JSON.stringify(currentGeneratedWorkout));
            activeWorkoutStartTime = Date.now();
            activeWorkoutIsPaused = false;
            activeWorkoutPausedAt = null;
            activeWorkoutTotalPausedMs = 0;
            activeWorkoutSetsData = {{}};

            const user = getActiveUser();
            const userWeights = user.weights || {{}};

            activeWorkoutSession.exercises.forEach(ex => {{
                const numSets = activeWorkoutSession.scheme.sets || 3;
                let defaultReps = 10;
                if (activeWorkoutSession.scheme.reps) {{
                    const firstPart = String(activeWorkoutSession.scheme.reps).split('-')[0].trim();
                    defaultReps = parseInt(firstPart) || 10;
                }}
                const defaultWeight = ex.weightKey && userWeights[ex.weightKey] ? (parseFloat(userWeights[ex.weightKey]) || '') : '';

                activeWorkoutSetsData[ex.id] = [];
                for (let s = 1; s <= numSets; s++) {{
                    activeWorkoutSetsData[ex.id].push({{
                        setNo: s,
                        weight: defaultWeight,
                        reps: defaultReps,
                        completed: false,
                        completedAt: null
                    }});
                }}
            }});

            saveActiveWorkoutStateToStorage();
            startWorkoutTimer();
            renderActiveWorkout();
            switchTab('activeWorkoutTab');
            resetTimer(activeWorkoutSession.scheme.rest || 45);
            playAlertSound();
        }}

        function getWorkoutElapsedSeconds() {{
            if (!activeWorkoutStartTime) return 0;
            if (activeWorkoutIsPaused && activeWorkoutPausedAt) {{
                return Math.max(0, Math.floor((activeWorkoutPausedAt - activeWorkoutStartTime - activeWorkoutTotalPausedMs) / 1000));
            }}
            return Math.max(0, Math.floor((Date.now() - activeWorkoutStartTime - activeWorkoutTotalPausedMs) / 1000));
        }}

        function formatSecondsToHMS(totalSecs) {{
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;
            if (hrs > 0) {{
                return `${{String(hrs).padStart(2, '0')}}:${{String(mins).padStart(2, '0')}}:${{String(secs).padStart(2, '0')}}`;
            }}
            return `${{String(mins).padStart(2, '0')}}:${{String(secs).padStart(2, '0')}}`;
        }}

        function updateWorkoutTimerDisplay() {{
            const el = document.getElementById('workoutTotalTimerDisplay');
            if (!el) return;
            const secs = getWorkoutElapsedSeconds();
            el.innerText = formatSecondsToHMS(secs);
        }}

        function startWorkoutTimer() {{
            clearInterval(workoutTimerInterval);
            updateWorkoutTimerDisplay();
            workoutTimerInterval = setInterval(() => {{
                if (!activeWorkoutIsPaused && activeWorkoutSession) {{
                    updateWorkoutTimerDisplay();
                }}
            }}, 1000);
        }}

        function toggleWorkoutPause() {{
            if (!activeWorkoutSession) return;
            const btn = document.getElementById('btnToggleWorkoutPause');
            if (!activeWorkoutIsPaused) {{
                activeWorkoutIsPaused = true;
                activeWorkoutPausedAt = Date.now();
                if (btn) btn.innerText = "▶️ Devam Et";
            }} else {{
                activeWorkoutIsPaused = false;
                if (activeWorkoutPausedAt) {{
                    activeWorkoutTotalPausedMs += (Date.now() - activeWorkoutPausedAt);
                    activeWorkoutPausedAt = null;
                }}
                if (btn) btn.innerText = "⏸️ Duraklat";
            }}
            saveActiveWorkoutStateToStorage();
            updateWorkoutTimerDisplay();
        }}

        function saveActiveWorkoutStateToStorage() {{
            const uid = getActiveUserId();
            if (!activeWorkoutSession) {{
                localStorage.removeItem(`celik_kodu_active_state_${{uid}}`);
                return;
            }}
            const state = {{
                session: activeWorkoutSession,
                startTime: activeWorkoutStartTime,
                isPaused: activeWorkoutIsPaused,
                pausedAt: activeWorkoutPausedAt,
                totalPausedMs: activeWorkoutTotalPausedMs,
                setsData: activeWorkoutSetsData
            }};
            try {{
                localStorage.setItem(`celik_kodu_active_state_${{uid}}`, JSON.stringify(state));
            }} catch(e) {{}}
        }}

        function restoreActiveWorkoutStateFromStorage() {{
            const uid = getActiveUserId();
            try {{
                const raw = localStorage.getItem(`celik_kodu_active_state_${{uid}}`);
                if (!raw) return false;
                const state = JSON.parse(raw);
                if (state && state.session && state.startTime) {{
                    activeWorkoutSession = state.session;
                    activeWorkoutStartTime = state.startTime;
                    activeWorkoutIsPaused = !!state.isPaused;
                    activeWorkoutPausedAt = state.pausedAt || null;
                    activeWorkoutTotalPausedMs = state.totalPausedMs || 0;
                    activeWorkoutSetsData = state.setsData || {{}};

                    renderActiveWorkout();
                    startWorkoutTimer();
                    const btn = document.getElementById('btnToggleWorkoutPause');
                    if (btn) btn.innerText = activeWorkoutIsPaused ? "▶️ Devam Et" : "⏸️ Duraklat";
                    return true;
                }}
            }} catch(e) {{}}
            return false;
        }}

        function renderActiveWorkout() {{
            const container = document.getElementById('activeWorkoutContainer');
            if (!activeWorkoutSession || !container) {{
                container.innerHTML = `
                    <div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
                        <div style="font-size:40px; margin-bottom:10px;">🏋️</div>
                        <h3>Aktif bir antrenman bulunmuyor.</h3>
                        <p style="font-size:12px; margin-top:4px;">Program Oluştur sekmesinden bir program üretip "Antrenmanı Başlat"a basarak başlayabilirsiniz.</p>
                        <button class="btn btn-gold" style="margin-top:16px; padding:10px 20px;" onclick="switchTab('generatorTab')">⚡ Program Oluştur</button>
                    </div>
                `;
                return;
            }}

            const s = activeWorkoutSession;
            const user = getActiveUser();
            const weights = user.weights || {{}};

            // Ensure setsData exists for each exercise
            s.exercises.forEach(ex => {{
                if (!activeWorkoutSetsData[ex.id]) {{
                    const numSets = s.scheme.sets || 3;
                    const defaultReps = parseInt(String(s.scheme.reps).split('-')[0].trim()) || 10;
                    const defaultWeight = ex.weightKey && weights[ex.weightKey] ? (parseFloat(weights[ex.weightKey]) || '') : '';
                    activeWorkoutSetsData[ex.id] = [];
                    for (let st = 1; st <= numSets; st++) {{
                        activeWorkoutSetsData[ex.id].push({{
                            setNo: st,
                            weight: defaultWeight,
                            reps: defaultReps,
                            completed: false,
                            completedAt: null
                        }});
                    }}
                }}
            }});

            const equipLabels = {{
                dumbbell: 'Dambıl',
                kettlebell: 'Kettlebell',
                barbell: 'Barbell',
                machine: 'Makine/Kablo',
                bodyweight: 'Vücut Ağırlığı'
            }};

            container.innerHTML = `
                <div class="workout-header-card" style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <span class="badge-brand">CANLI SEANS</span>
                            <h2 style="font-size:18px; font-weight:800; color:#fff;">${{escapeHTML(s.title)}}</h2>
                        </div>
                        <button class="btn btn-gold" style="padding:10px 14px; font-size:13px;" onclick="openCompleteModal()">
                            🏁 BİTİR & KAYDET
                        </button>
                    </div>
                </div>

                ${{s.exercises.map((ex, idx) => {{
                    const sets = activeWorkoutSetsData[ex.id] || [];
                    const nextUncompletedIdx = sets.findIndex(st => !st.completed);

                    return `
                        <div class="ex-card" data-exercise-id="${{ex.id}}">
                            <div class="ex-card-header">
                                <div class="ex-name">
                                    <span style="color:var(--gold); font-weight:900;">${{idx + 1}}.</span>
                                    <span>${{escapeHTML(ex.name)}}</span>
                                </div>
                                <div class="ex-tag-group">
                                    <span class="ex-badge badge-equip">${{equipLabels[ex.equipment] || ex.equipment}}</span>
                                    <span class="ex-badge badge-muscle">${{escapeHTML(ex.muscle ? ex.muscle.split(',')[0] : '')}}</span>
                                </div>
                            </div>

                            <div style="font-size:12px; color:var(--text-secondary); margin-bottom:6px;">
                                🎯 Hedef Şema: <strong style="color:var(--gold);">${{s.scheme.sets}} Set x ${{s.scheme.reps}}</strong> • Dinlenme: ${{s.scheme.rest}}s
                            </div>

                            ${{renderExercisePositionsHtml(ex, `active_${{idx}}`, false)}}

                            <!-- SET-BY-SET WORKFLOW TABLE -->
                            <div class="sets-management-wrap">
                                <div class="sets-header-row">
                                    <span>SET</span>
                                    <span>HEDEF</span>
                                    <span>KİLO (KG)</span>
                                    <span>TEKRAR</span>
                                    <span>İŞLEM</span>
                                </div>

                                ${{sets.map((st, setIdx) => {{
                                    const isTarget = setIdx === nextUncompletedIdx;
                                    const rowClass = st.completed ? 'set-completed' : (isTarget ? 'set-active-target' : '');

                                    return `
                                        <div class="set-row ${{rowClass}}" id="setRow_${{ex.id}}_${{setIdx}}">
                                            <div style="text-align:center;">
                                                <span class="set-badge">${{st.setNo}}</span>
                                            </div>
                                            <div class="set-col-target">
                                                ${{s.scheme.reps}}
                                            </div>
                                            <div class="set-col-input">
                                                <input type="number" step="0.5" class="set-input-weight" 
                                                       id="w_${{ex.id}}_${{setIdx}}" 
                                                       value="${{st.weight !== '' && st.weight !== null ? st.weight : ''}}" 
                                                       placeholder="kg" 
                                                       oninput="onSetWeightInput('${{ex.id}}', ${{setIdx}}, this.value)">
                                            </div>
                                            <div class="set-col-input">
                                                <input type="number" step="1" class="set-input-reps" 
                                                       id="r_${{ex.id}}_${{setIdx}}" 
                                                       value="${{st.reps !== '' && st.reps !== null ? st.reps : ''}}" 
                                                       placeholder="tk" 
                                                       oninput="onSetRepsInput('${{ex.id}}', ${{setIdx}}, this.value)">
                                            </div>
                                            <div>
                                                ${{st.completed
                                                    ? `<button class="btn-set-status done" onclick="toggleSetStatus('${{ex.id}}', ${{setIdx}})" title="Geri Al / Düzelt">✅ Bitti</button>`
                                                    : `<button class="btn-set-status start" onclick="completeSetAndStartRest('${{ex.id}}', ${{setIdx}})">▶ Bitir & Dinlen</button>`
                                                }}
                                            </div>
                                        </div>
                                    `;
                                }}).join('')}}

                                <div class="sets-footer-actions">
                                    <button class="btn-set-mini" onclick="addSetToExercise('${{ex.id}}')">➕ Set Ekle</button>
                                    <button class="btn-set-mini" onclick="removeSetFromExercise('${{ex.id}}')">➖ Set Sil</button>
                                </div>
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px dashed var(--border);">
                                <button class="btn-swap-ex" style="color:#f87171; border-color:rgba(239,68,68,0.3);" onclick="removeExerciseFromWorkout('${{ex.id}}', 'active')" title="Bu hareketi kaldır">
                                    🗑️ Kaldır
                                </button>
                                <div style="display:flex; gap:6px;">
                                    <button class="btn-swap-ex" onclick="openAlternativeModal('${{ex.id}}', 'active')" title="Listeden alternatif seç">
                                        📋 Alternatif Seç
                                    </button>
                                    <button class="btn-swap-ex" onclick="swapSingleExercise('${{ex.id}}', 'active')" title="Rastgele başka hareket ver">
                                        🎲 Rastgele
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }}).join('')}}

                <div style="text-align:center; margin:16px 0 24px;">
                    <button class="btn btn-outline" style="border-style:dashed; border-color:var(--cyan); color:var(--cyan); font-size:12.5px; padding:10px 18px;" onclick="openAddExerciseModal('active')">
                        ➕ Bu Antrenmana Yeni Hareket Ekle
                    </button>
                </div>

                <div style="text-align:center; margin:30px 0;">
                    <button class="btn btn-gold" style="padding:16px 28px; font-size:15px;" onclick="openCompleteModal()">
                        🏁 ANTRENMANI TAMAMLA & GÜNLÜĞE KAYDET
                    </button>
                </div>
            `;
        }}

        function onSetWeightInput(exId, setIdx, val) {{
            if (!activeWorkoutSetsData[exId] || !activeWorkoutSetsData[exId][setIdx]) return;
            activeWorkoutSetsData[exId][setIdx].weight = val;
            saveActiveWorkoutStateToStorage();
        }}

        function onSetRepsInput(exId, setIdx, val) {{
            if (!activeWorkoutSetsData[exId] || !activeWorkoutSetsData[exId][setIdx]) return;
            activeWorkoutSetsData[exId][setIdx].reps = parseInt(val) || 0;
            saveActiveWorkoutStateToStorage();
        }}

        function completeSetAndStartRest(exId, setIdx) {{
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;

            const st = sets[setIdx];
            const wInput = document.getElementById(`w_${{exId}}_${{setIdx}}`);
            const rInput = document.getElementById(`r_${{exId}}_${{setIdx}}`);

            if (wInput && wInput.value !== '') st.weight = parseFloat(wInput.value) || 0;
            if (rInput && rInput.value !== '') st.reps = parseInt(rInput.value) || 0;

            st.completed = true;
            st.completedAt = Date.now();

            // Auto-propagate weight to subsequent incomplete sets if they have no weight
            for (let i = setIdx + 1; i < sets.length; i++) {{
                if (!sets[i].completed && (sets[i].weight === '' || sets[i].weight === null || sets[i].weight === undefined)) {{
                    sets[i].weight = st.weight;
                }}
            }}

            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();

            // TRIGGER REST TIMER
            const restSecs = activeWorkoutSession && activeWorkoutSession.scheme ? (activeWorkoutSession.scheme.rest || 45) : 45;
            resetTimer(restSecs);
            startTimer();
            playAlertSound();
            if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
        }}

        function toggleSetStatus(exId, setIdx) {{
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            sets[setIdx].completed = !sets[setIdx].completed;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }}

        function addSetToExercise(exId) {{
            const sets = activeWorkoutSetsData[exId] || [];
            const lastWeight = sets.length > 0 ? sets[sets.length - 1].weight : '';
            const lastReps = sets.length > 0 ? sets[sets.length - 1].reps : 10;
            sets.push({{
                setNo: sets.length + 1,
                weight: lastWeight,
                reps: lastReps,
                completed: false,
                completedAt: null
            }});
            activeWorkoutSetsData[exId] = sets;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }}

        function removeSetFromExercise(exId) {{
            const sets = activeWorkoutSetsData[exId] || [];
            if (sets.length > 1) {{
                sets.pop();
                saveActiveWorkoutStateToStorage();
                renderActiveWorkout();
            }}
        }}

        // REST TIMER LOGIC
        function setTimerSecs(secs) {{
            resetTimer(secs);
            startTimer();
        }}

        function resetTimer(secs) {{
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerRemaining = secs;
            updateTimerDisplay();
            const btn = document.getElementById('btnPlayPauseTimer');
            if (btn) btn.innerText = "▶ Başlat";
        }}

        function toggleTimer() {{
            if (isTimerRunning) {{
                clearInterval(timerInterval);
                isTimerRunning = false;
                document.getElementById('btnPlayPauseTimer').innerText = "▶ Başlat";
            }} else {{
                startTimer();
            }}
        }}

        function startTimer() {{
            clearInterval(timerInterval);
            isTimerRunning = true;
            document.getElementById('btnPlayPauseTimer').innerText = "⏸ Duraklat";

            timerInterval = setInterval(() => {{
                if (timerRemaining > 0) {{
                    timerRemaining--;
                    updateTimerDisplay();
                }} else {{
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    document.getElementById('btnPlayPauseTimer').innerText = "▶ Başlat";
                    playAlertSound();
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100]);
                }}
            }}, 1000);
        }}

        function updateTimerDisplay() {{
            const mins = Math.floor(timerRemaining / 60);
            const secs = timerRemaining % 60;
            const str = `${{String(mins).padStart(2, '0')}}:${{String(secs).padStart(2, '0')}}`;
            const el = document.getElementById('timerDisplay');
            if (el) el.innerText = str;
        }}

        function playAlertSound() {{
            try {{
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            }} catch(e) {{}}
        }}

        // ==================== COMPLETE & LOG WORKOUT ====================
        function getSavedGymsList() {{
            const defaultGyms = ["Rodium", "Sports & More", "Samandağ", "MACFit", "FitStop"];
            try {{
                const stored = localStorage.getItem('celik_kodu_custom_gyms');
                if (stored) {{
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {{
                        parsed.forEach(g => {{
                            if (g && typeof g === 'string' && !defaultGyms.includes(g)) {{
                                defaultGyms.push(g);
                            }}
                        }});
                    }}
                }}
            }} catch(e) {{}}
            return defaultGyms;
        }}

        function saveCustomGym(gymName) {{
            if (!gymName || typeof gymName !== 'string') return;
            const trimmed = gymName.trim();
            if (!trimmed) return;
            const defaultGyms = ["Rodium", "Sports & More", "Samandağ", "MACFit", "FitStop"];
            try {{
                let stored = [];
                const existing = localStorage.getItem('celik_kodu_custom_gyms');
                if (existing) stored = JSON.parse(existing) || [];
                if (!defaultGyms.includes(trimmed) && !stored.includes(trimmed)) {{
                    stored.push(trimmed);
                    localStorage.setItem('celik_kodu_custom_gyms', JSON.stringify(stored));
                }}
            }} catch(e) {{}}
        }}

        function initCompleteModalLocation() {{
            const gyms = getSavedGymsList();
            const gymSelect = document.getElementById('logGymSelect');
            if (gymSelect) {{
                gymSelect.innerHTML = gyms.map(g => `<option value="${{escapeHTML(g)}}">${{escapeHTML(g)}}</option>`).join('') +
                    `<option value="custom">✏️ Diğer / Yeni Salon Yaz...</option>`;
            }}

            const uid = getActiveUserId();
            let lastLoc = null;
            try {{
                const s = localStorage.getItem(`celik_kodu_last_location_${{uid}}`);
                if (s) lastLoc = JSON.parse(s);
            }} catch(e) {{}}

            const locType = lastLoc?.type || 'salon';
            const locName = lastLoc?.name || 'Rodium';

            const locTypeEl = document.getElementById('logLocationType');
            if (locTypeEl) locTypeEl.value = locType;

            if (locType === 'salon' && gymSelect) {{
                if (gyms.includes(locName)) {{
                    gymSelect.value = locName;
                }} else {{
                    gymSelect.value = 'custom';
                }}
            }}

            const locNameEl = document.getElementById('logLocationName');
            if (locNameEl) locNameEl.value = locName;

            handleLocationTypeChange();
        }}

        function handleLocationTypeChange() {{
            const locTypeEl = document.getElementById('logLocationType');
            if (!locTypeEl) return;
            const locType = locTypeEl.value;
            const gymGroup = document.getElementById('gymSelectGroup');
            const customLabel = document.getElementById('gymCustomLabel');
            const locNameEl = document.getElementById('logLocationName');
            const gymSelect = document.getElementById('logGymSelect');

            if (locType === 'salon') {{
                if (gymGroup) gymGroup.style.display = 'block';
                if (customLabel) customLabel.innerText = 'Salon / Konum Detayı (Örn: Rodium, Sports & More...)';
                if (gymSelect && gymSelect.value !== 'custom') {{
                    locNameEl.value = gymSelect.value;
                }} else if (!locNameEl.value || locNameEl.value === 'Ev' || locNameEl.value === 'Açık Hava / Park') {{
                    locNameEl.value = 'Rodium';
                    if (gymSelect) gymSelect.value = 'Rodium';
                }}
            }} else if (locType === 'ev') {{
                if (gymGroup) gymGroup.style.display = 'none';
                if (customLabel) customLabel.innerText = 'Ev Lokasyonu / Detay Notu';
                locNameEl.value = 'Ev';
            }} else if (locType === 'acik_hava') {{
                if (gymGroup) gymGroup.style.display = 'none';
                if (customLabel) customLabel.innerText = 'Açık Alan / Park İsmi';
                locNameEl.value = 'Açık Hava / Park';
            }}
        }}

        function handleGymSelectChange() {{
            const gymSelect = document.getElementById('logGymSelect');
            const locNameEl = document.getElementById('logLocationName');
            if (!gymSelect || !locNameEl) return;

            if (gymSelect.value === 'custom') {{
                locNameEl.value = '';
                locNameEl.placeholder = 'Yeni salon adını buraya yazınız...';
                locNameEl.focus();
            }} else {{
                locNameEl.value = gymSelect.value;
            }}
        }}

        function openCompleteModal() {{
            if (!activeWorkoutSession) {{
                alert("Aktif bir antrenman bulunmuyor.");
                return;
            }}
            const elapsedSecs = getWorkoutElapsedSeconds();
            const elapsedMins = Math.max(1, Math.round(elapsedSecs / 60));

            document.getElementById('logProgramName').value = activeWorkoutSession.title || 'Çelik Kodu Antrenmanı';
            document.getElementById('logDuration').value = elapsedMins;
            initCompleteModalLocation();

            // Summary stats & detailed exercise breakdown calculation
            let totalCompletedSets = 0;
            let totalReps = 0;
            let totalVolume = 0;

            const exerciseSummaries = activeWorkoutSession.exercises.map(ex => {{
                const sets = activeWorkoutSetsData[ex.id] || [];
                let exVol = 0;
                let exCompletedSets = 0;
                const setSummaries = sets.map(st => {{
                    const w = parseFloat(st.weight) || 0;
                    const r = parseInt(st.reps) || 0;
                    if (st.completed) {{
                        totalCompletedSets++;
                        exCompletedSets++;
                        totalReps += r;
                        totalVolume += (w * r);
                        exVol += (w * r);
                    }}
                    return {{
                        setNo: st.setNo,
                        weight: w,
                        reps: r,
                        completed: st.completed
                    }};
                }});

                return {{
                    name: ex.name,
                    muscle: ex.muscle ? ex.muscle.split(',')[0].trim() : '',
                    equipment: ex.equipment,
                    sets: setSummaries,
                    volume: exVol,
                    completedCount: exCompletedSets
                }};
            }});

            const summaryHint = document.getElementById('logWorkoutSummaryHint');
            if (summaryHint) {{
                summaryHint.innerHTML = `
                    <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid var(--gold); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
                            <span style="font-size:11px; font-weight:800; color:var(--gold); text-transform:uppercase; letter-spacing:0.5px;">📋 Seans Özeti & Performans</span>
                            <span style="font-size:12px; font-weight:800; color:#fff;">⏱️ ${{formatSecondsToHMS(elapsedSecs)}}</span>
                        </div>

                        <!-- TOP STATS -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px; margin-bottom:12px; text-align:center;">
                            <div style="background:var(--bg-elevated); padding:8px 4px; border-radius:6px; border:1px solid var(--border);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                                <div style="font-size:14px; font-weight:900; color:var(--gold); margin-top:2px;">🏋️ ${{Math.round(totalVolume).toLocaleString('tr-TR')}} kg</div>
                            </div>
                            <div style="background:var(--bg-elevated); padding:8px 4px; border-radius:6px; border:1px solid var(--border);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">SET SAYISI</div>
                                <div style="font-size:14px; font-weight:900; color:var(--green-success); margin-top:2px;">✅ ${{totalCompletedSets}} Set</div>
                            </div>
                            <div style="background:var(--bg-elevated); padding:8px 4px; border-radius:6px; border:1px solid var(--border);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">TOPLAM TEKRAR</div>
                                <div style="font-size:14px; font-weight:900; color:var(--cyan); margin-top:2px;">🎯 ${{totalReps}} Tk</div>
                            </div>
                        </div>

                        <!-- EXERCISES & SETS BREAKDOWN -->
                        <div style="font-size:11px; font-weight:800; color:var(--text-secondary); margin-bottom:6px; text-transform:uppercase;">
                            Yapılan Hareketler, Kilo & Tekrarlar:
                        </div>
                        <div style="max-height: 220px; overflow-y: auto; padding-right: 4px; display:flex; flex-direction:column; gap:6px;">
                            ${{exerciseSummaries.map(ex => `
                                <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px 10px; border-left: 3px solid ${{ex.completedCount > 0 ? 'var(--green-success)' : 'var(--border)'}};">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <div>
                                            <strong style="color:#fff; font-size:12.5px;">${{escapeHTML(ex.name)}}</strong>
                                            ${{ex.muscle ? `<span style="font-size:10.5px; color:var(--cyan); margin-left:6px;">[${{escapeHTML(ex.muscle)}}]</span>` : ''}}
                                        </div>
                                        <span style="font-size:11px; font-weight:800; color:var(--gold);">
                                            ${{ex.volume > 0 ? `${{Math.round(ex.volume).toLocaleString('tr-TR')}} kg` : ''}}
                                        </span>
                                    </div>
                                    <div style="display:flex; flex-wrap:wrap; gap:4px;">
                                        ${{ex.sets.map(st => st.completed ? `
                                            <span style="background:rgba(34, 197, 94, 0.12); border:1px solid rgba(34, 197, 94, 0.4); color:#86efac; border-radius:4px; padding:2px 6px; font-size:10.5px; font-weight:700;">
                                                Set ${{st.setNo}}: <strong>${{st.weight || 0}} kg</strong> x ${{st.reps || 0}} ✓
                                            </span>
                                        ` : `
                                            <span style="background:rgba(239, 68, 68, 0.08); border:1px dashed rgba(239, 68, 68, 0.3); color:#fca5a5; opacity:0.65; border-radius:4px; padding:2px 6px; font-size:10.5px; font-weight:600; text-decoration:line-through;" title="Bitir butonuna basılmadı">
                                                Set ${{st.setNo}}: Atlandı
                                            </span>
                                        `).join('')}}
                                    </div>
                                </div>
                            `).join('')}}
                        </div>
                    </div>
                `;
            }}

            document.getElementById('completeModal').classList.add('active');
        }}

        function closeCompleteModal() {{
            document.getElementById('completeModal').classList.remove('active');
        }}

        function saveCompletedWorkout() {{
            if (!activeWorkoutSession) return;

            const programNameInput = document.getElementById('logProgramName');
            const programName = (programNameInput && programNameInput.value.trim()) ? programNameInput.value.trim() : (activeWorkoutSession.title || 'Çelik Kodu Antrenmanı');
            const duration = parseInt(document.getElementById('logDuration').value) || Math.max(1, Math.round(getWorkoutElapsedSeconds() / 60));
            const rpe = document.getElementById('logRpe').value;
            const notes = document.getElementById('logNotes').value;
            const elapsedSecs = getWorkoutElapsedSeconds();

            const locTypeEl = document.getElementById('logLocationType');
            const locType = locTypeEl ? locTypeEl.value : 'salon';
            const locNameEl = document.getElementById('logLocationName');
            let locName = (locNameEl && locNameEl.value.trim()) ? locNameEl.value.trim() : (locType === 'salon' ? 'Spor Salonu' : (locType === 'ev' ? 'Ev' : 'Açık Hava'));

            if (locType === 'salon' && locName && locName !== 'Spor Salonu') {{
                saveCustomGym(locName);
            }}

            const uid = getActiveUserId();
            try {{
                localStorage.setItem(`celik_kodu_last_location_${{uid}}`, JSON.stringify({{ type: locType, name: locName }}));
            }} catch(e) {{}}

            let totalVolume = 0;
            let totalCompletedSets = 0;
            let totalCompletedReps = 0;
            const allMuscles = [];

            const detailedExercises = activeWorkoutSession.exercises.map(ex => {{
                const sets = (activeWorkoutSetsData[ex.id] || []).map(st => {{
                    const isDone = !!st.completed;
                    const w = parseFloat(st.weight) || 0;
                    const r = parseInt(st.reps) || 0;
                    if (isDone) {{
                        totalCompletedSets++;
                        totalCompletedReps += r;
                        totalVolume += (w * r);
                    }}
                    return {{
                        setNo: st.setNo,
                        weight: isDone ? w : 0,
                        reps: isDone ? r : 0,
                        completed: isDone,
                        volume: isDone ? (w * r) : 0
                    }};
                }});

                const completedSets = sets.filter(st => st.completed);

                // Only credit muscle groups if at least one set of this exercise was actually completed
                if (completedSets.length > 0 && ex.muscle) {{
                    ex.muscle.split(',').forEach(m => {{
                        const trimmed = m.trim();
                        if (trimmed && !allMuscles.includes(trimmed)) {{
                            allMuscles.push(trimmed);
                        }}
                    }});
                }}

                const maxWeight = completedSets.length > 0 ? Math.max(0, ...completedSets.map(st => st.weight)) : 0;
                const exVolume = completedSets.reduce((sum, st) => sum + st.volume, 0);

                return {{
                    id: ex.id,
                    name: ex.name,
                    equipment: ex.equipment,
                    category: ex.category,
                    muscle: ex.muscle,
                    cue: ex.cue || '',
                    sets: sets,
                    completedSetsCount: completedSets.length,
                    maxWeight: maxWeight,
                    exerciseVolume: exVolume
                }};
            }});

            const newLog = {{
                id: 'log_' + Date.now(),
                date: new Date().toISOString().split('T')[0],
                dateFormatted: new Intl.DateTimeFormat('tr-TR', {{ dateStyle: 'medium', timeStyle: 'short' }}).format(new Date()),
                program: programName,
                locationType: locType,
                locationName: locName,
                duration: duration,
                durationFormatted: formatSecondsToHMS(elapsedSecs),
                durationSecs: elapsedSecs,
                rpe: rpe,
                notes: notes,
                totalVolumeKg: Math.round(totalVolume * 10) / 10,
                totalSetsCompleted: totalCompletedSets,
                totalRepsCompleted: totalCompletedReps,
                muscleGroups: allMuscles,
                exercises: detailedExercises,
                timestamp: Date.now()
            }};

            const logs = getWorkoutLogs();
            logs.unshift(newLog);
            setWorkoutLogs(logs);

            // Clear active workout session state
            localStorage.removeItem(`celik_kodu_active_state_${{uid}}`);
            clearInterval(workoutTimerInterval);
            clearInterval(timerInterval);
            activeWorkoutSession = null;
            activeWorkoutStartTime = null;
            activeWorkoutSetsData = {{}};

            closeCompleteModal();
            renderActiveWorkout();
            renderHistory();
            switchTab('historyTab');

            playAlertSound();
            alert(`🎉 TEBRİKLER ŞAMPİYON!\n\n${{duration}} dakikada toplam ${{Math.round(totalVolume).toLocaleString('tr-TR')}} kg tonaj kaldırıldı.\nAntrenman tüm setler, kilolar ve çalışan kas gruplarıyla günlüğe kaydedildi!`);
        }}

        // ==================== LIBRARY & SAVED PROGRAMS ====================
        function saveGeneratedToLibrary() {{
            if (!currentGeneratedWorkout) return;
            const user = getActiveUser();
            const key = `celik_kodu_custom_programs_${{user.id}}`;

            let saved = [];
            try {{
                const raw = localStorage.getItem(key);
                if (raw) saved = JSON.parse(raw);
            }} catch(e) {{}}

            const name = prompt("Bu antrenman programı için bir isim verin:", currentGeneratedWorkout.title);
            if (!name) return;

            const programToSave = JSON.parse(JSON.stringify(currentGeneratedWorkout));
            programToSave.id = 'saved_' + Date.now();
            programToSave.title = name.trim();

            saved.unshift(programToSave);
            localStorage.setItem(key, JSON.stringify(saved));
            alert("✅ Program başarıyla kütüphanenize kaydedildi!");
        }}

        function renderLibrary() {{
            const user = getActiveUser();
            const key = `celik_kodu_custom_programs_${{user.id}}`;
            let saved = [];
            try {{
                const raw = localStorage.getItem(key);
                if (raw) saved = JSON.parse(raw);
            }} catch(e) {{}}

            const customContainer = document.getElementById('savedProgramsList');
            if (saved.length === 0) {{
                customContainer.innerHTML = `
                    <div style="background:var(--bg-surface); padding:16px; border-radius:10px; border:1px dashed var(--border); text-align:center; font-size:12px; color:var(--text-secondary);">
                        Henüz kayıtlı özel bir programınız yok. Program Oluşturucu ile bir program üretip "Kütüphaneye Kaydet" butonuna basabilirsiniz!
                    </div>
                `;
            }} else {{
                customContainer.innerHTML = saved.map(p => `
                    <div class="log-history-card">
                        <div class="log-card-header">
                            <strong style="color:#fff; font-size:14px;">${{escapeHTML(p.title)}}</strong>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-gold" style="font-size:11px; padding:4px 10px;" onclick="loadSavedProgram('${{p.id}}')">
                                    ▶ Başlat
                                </button>
                                <button class="btn-delete-log" onclick="deleteSavedProgram('${{p.id}}')" title="Sil">✕</button>
                            </div>
                        </div>
                        <div style="font-size:11px; color:var(--text-secondary);">
                            ${{p.exercises.length}} Egzersiz • ${{p.duration}} Dk • ${{p.style === 'superset' ? 'Süperset' : 'Klasik'}}
                        </div>
                    </div>
                `).join('');
            }}

            // Render Official Classic Routines
            const officialContainer = document.getElementById('officialProgramsList');
            const officialRoutines = [
                {{
                    id: 'la_forja_day1',
                    title: '⚔️ Çelik Kodu Gün 1: Omuz & Bacak Ön Zırhı',
                    desc: 'Omuz Presi + Goblet Squat (A1/A2), Clean Front Squat + Şınav (B1/B2), Halo + Core (C1/C2)',
                    exercises: ['db_overhead_press', 'db_goblet_squat', 'db_front_squat', 'bw_pushup', 'kb_halo', 'bw_hollow_body'],
                    style: 'superset',
                    duration: 45
                }},
                {{
                    id: 'la_forja_day2',
                    title: '⚔️ Çelik Kodu Gün 2: Sırt Çekiş & Balistik Güç',
                    desc: 'Ağır Testere Row + RDL (A1/A2), Patlayıcı Dambıl Swing + Barfiks (B1/B2), Çiftçi Yürüyüşü (C1)',
                    exercises: ['db_saw_row', 'db_rdl', 'db_swing', 'bw_pullup', 'db_farmers_walk', 'db_russian_twist'],
                    style: 'superset',
                    duration: 45
                }},
                {{
                    id: 'la_forja_day3',
                    title: '⚔️ Çelik Kodu Gün 3: Kompleks & Merdiven',
                    desc: 'Dambıl Snatch + Walking Lunge (A1/A2), 5-4-3-2 Merdiven Row-Clean-Squat, Burpee Finisher',
                    exercises: ['db_snatch', 'db_walking_lunge', 'db_saw_row', 'db_front_squat', 'bw_burpee'],
                    style: 'superset',
                    duration: 50
                }}
            ];

            officialContainer.innerHTML = officialRoutines.map(r => `
                <div class="log-history-card" style="border-color:var(--border-hover);">
                    <div class="log-card-header">
                        <strong style="color:var(--gold-light); font-size:14px;">${{escapeHTML(r.title)}}</strong>
                        <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; color:var(--gold); border-color:var(--gold);" onclick="loadOfficialRoutine('${{r.id}}')">
                            ▶ Bu Programı Yükle
                        </button>
                    </div>
                    <div style="font-size:11.5px; color:var(--text-secondary); margin-top:2px;">
                        ${{escapeHTML(r.desc)}}
                    </div>
                </div>
            `).join('');
        }}

        function loadSavedProgram(progId) {{
            const user = getActiveUser();
            const key = `celik_kodu_custom_programs_${{user.id}}`;
            try {{
                const saved = JSON.parse(localStorage.getItem(key) || '[]');
                const found = saved.find(p => p.id === progId);
                if (found) {{
                    currentGeneratedWorkout = found;
                    startActiveWorkoutFromGenerated();
                }}
            }} catch(e) {{}}
        }}

        function deleteSavedProgram(progId) {{
            const user = getActiveUser();
            const key = `celik_kodu_custom_programs_${{user.id}}`;
            if (confirm("Bu kayıtlı programı silmek istediğinize emin misiniz?")) {{
                try {{
                    let saved = JSON.parse(localStorage.getItem(key) || '[]');
                    saved = saved.filter(p => p.id !== progId);
                    localStorage.setItem(key, JSON.stringify(saved));
                    renderLibrary();
                }} catch(e) {{}}
            }}
        }}

        function loadOfficialRoutine(routineId) {{
            const routines = {{
                la_forja_day1: {{
                    title: '⚔️ Çelik Kodu Gün 1: Omuz & Bacak Ön Zırhı',
                    split: 'upper_push',
                    style: 'superset',
                    duration: 45,
                    scheme: {{ sets: 4, reps: '8 - 10', rest: 45 }},
                    exerciseIds: ['db_overhead_press', 'db_goblet_squat', 'db_front_squat', 'bw_pushup', 'kb_halo', 'bw_hollow_body']
                }},
                la_forja_day2: {{
                    title: '⚔️ Çelik Kodu Gün 2: Sırt Çekiş & Balistik Güç',
                    split: 'upper_pull',
                    style: 'superset',
                    duration: 45,
                    scheme: {{ sets: 4, reps: '8 - 10', rest: 45 }},
                    exerciseIds: ['db_saw_row', 'db_rdl', 'db_swing', 'bw_pullup', 'db_farmers_walk', 'db_russian_twist']
                }},
                la_forja_day3: {{
                    title: '⚔️ Çelik Kodu Gün 3: Kompleks & Merdiven',
                    split: 'full_body',
                    style: 'superset',
                    duration: 50,
                    scheme: {{ sets: 4, reps: '8 - 10', rest: 45 }},
                    exerciseIds: ['db_snatch', 'db_walking_lunge', 'db_saw_row', 'db_front_squat', 'bw_burpee']
                }}
            }};

            const target = routines[routineId];
            if (!target) return;

            const exercises = target.exerciseIds.map(id => EXERCISES_DB.find(e => e.id === id)).filter(Boolean);

            currentGeneratedWorkout = {{
                id: 'gen_' + Date.now(),
                title: target.title,
                split: target.split,
                splitName: 'Çelik Kodu Klasik',
                style: target.style,
                goal: 'hypertrophy',
                duration: target.duration,
                scheme: target.scheme,
                warmups: [
                    {{ name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ve geniş dairelerle ısıt." }},
                    {{ name: "World's Greatest Stretch", dur: "60 sn", cue: "Derin lunge ile omurga rotasyonu." }}
                ],
                exercises: exercises,
                finisher: {{ name: "3 Dk Tabata Finisher", desc: "Patlayıcı kondisyon" }},
                createdAt: Date.now()
            }};

            startActiveWorkoutFromGenerated();
        }}

        // ==================== AUTHENTICATION & MULTI-USER SYSTEM ====================
        function initAuthDatabase() {{
            let users = [];
            try {{
                const raw = localStorage.getItem('celik_kodu_auth_users');
                if (raw) users = JSON.parse(raw);
            }} catch(e) {{}}

            if (!Array.isArray(users) || users.length === 0) {{
                users = [
                    {{
                        id: 'usr_admin',
                        username: 'admin',
                        password: '123',
                        role: 'admin',
                        name: 'Ferit (Admin)',
                        avatar: '🥋',
                        theme: 'gold',
                        level: 'İleri Seviye',
                        gender: 'Erkek',
                        weights: {{ press: '16', squat: '22', row: '20', rdl: '24', swing: '18', lunge: '14' }},
                        createdAt: Date.now()
                    }},
                    {{
                        id: 'usr_ferit',
                        username: 'ferit',
                        password: '123',
                        role: 'admin',
                        name: 'Ferit',
                        avatar: '🥋',
                        theme: 'gold',
                        level: 'İleri Seviye',
                        gender: 'Erkek',
                        weights: {{ press: '16', squat: '22', row: '20', rdl: '24', swing: '18', lunge: '14' }},
                        createdAt: Date.now()
                    }},
                    {{
                        id: 'usr_ismail',
                        username: 'ismail',
                        password: '123',
                        role: 'athlete',
                        name: 'İsmail',
                        avatar: '🦁',
                        theme: 'cyan',
                        level: 'Orta Seviye',
                        gender: 'Erkek',
                        weights: {{ press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' }},
                        createdAt: Date.now()
                    }}
                ];
                localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
            }}
            return users;
        }}

        function getAuthUsers() {{
            return initAuthDatabase();
        }}

        function saveAuthUsers(users) {{
            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
        }}

        function getSession() {{
            try {{
                const raw = localStorage.getItem('celik_kodu_session');
                return raw ? JSON.parse(raw) : null;
            }} catch(e) {{
                return null;
            }}
        }}

        function setSession(session) {{
            currentSession = session;
            if (session) {{
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
                localStorage.setItem('celik_kodu_active_user_id', session.userId);
            }} else {{
                localStorage.removeItem('celik_kodu_session');
                localStorage.removeItem('celik_kodu_active_user_id');
            }}
            syncAppViewState();
        }}

        function getActiveUserId() {{
            const session = getSession();
            if (session && session.userId) return session.userId;
            const fallback = localStorage.getItem('celik_kodu_active_user_id');
            return fallback || 'usr_admin';
        }}

        function getActiveUser() {{
            const uid = getActiveUserId();
            const users = getAuthUsers();
            return users.find(u => u.id === uid) || users[0];
        }}

        function syncAppViewState() {{
            const session = getSession();
            const loginScreen = document.getElementById('loginScreen');
            const mainAppWrapper = document.getElementById('mainAppWrapper');

            if (!session) {{
                if (loginScreen) loginScreen.classList.add('active');
                if (mainAppWrapper) mainAppWrapper.style.display = 'none';
            }} else {{
                if (loginScreen) loginScreen.classList.remove('active');
                if (mainAppWrapper) mainAppWrapper.style.display = 'block';

                const isAdmin = session.role === 'admin';

                const btnAdmin = document.getElementById('btnAdminPanel');
                if (btnAdmin) btnAdmin.style.display = isAdmin ? 'flex' : 'none';

                const profileTabAdminBtn = document.getElementById('profileTabAdminBtn');
                if (profileTabAdminBtn) profileTabAdminBtn.style.display = isAdmin ? 'inline-block' : 'none';

                const roleBadge = document.getElementById('headerUserRoleBadge');
                if (roleBadge) {{
                    roleBadge.innerText = isAdmin ? 'YÖNETİCİ' : 'SPORCU';
                    roleBadge.className = 'auth-role-tag ' + (isAdmin ? 'role-admin' : 'role-athlete');
                }}

                applyActiveUserProfile();
            }}
        }}

        function handleAuthLogin(e) {{
            e.preventDefault();
            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            const errorBox = document.getElementById('loginErrorMsg');

            const uname = (usernameInput.value || '').trim().toLowerCase();
            const pass = (passwordInput.value || '').trim();

            const users = getAuthUsers();
            const matched = users.find(u => u.username.toLowerCase() === uname && u.password === pass);

            if (matched) {{
                errorBox.style.display = 'none';
                setSession({{
                    userId: matched.id,
                    username: matched.username,
                    role: matched.role,
                    name: matched.name
                }});
                usernameInput.value = "";
                passwordInput.value = "";
            }} else {{
                errorBox.innerText = "❌ Hatalı kullanıcı adı veya şifre! (Varsayılan: admin / 123)";
                errorBox.style.display = 'block';
            }}
        }}

        function handleAuthLogout() {{
            if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) {{
                setSession(null);
            }}
        }}

        // ADMIN PANEL
        function openAdminModal() {{
            const session = getSession();
            if (!session || session.role !== 'admin') {{
                alert("Bu alana sadece yöneticiler erişebilir.");
                return;
            }}
            renderAdminUserList();
            document.getElementById('adminModal').classList.add('active');
        }}

        function closeAdminModal() {{
            document.getElementById('adminModal').classList.remove('active');
        }}

        function selectNewAvatar(av) {{
            selectedNewAvatar = av;
            document.querySelectorAll('#newAvatarPicker .avatar-choice').forEach(el => {{
                el.classList.toggle('selected', el.innerText.trim() === av);
            }});
        }}

        function handleCreateUser() {{
            const uname = (document.getElementById('newUsername').value || '').trim().toLowerCase();
            const pass = (document.getElementById('newPassword').value || '').trim();
            const dname = (document.getElementById('newDisplayName').value || '').trim();
            const role = document.getElementById('newRole').value;
            const level = document.getElementById('newLevel').value;
            const gender = document.getElementById('newGender').value;

            if (!uname || !pass || !dname) {{
                alert("Lütfen tüm alanları doldurun.");
                return;
            }}

            const users = getAuthUsers();
            if (users.some(u => u.username.toLowerCase() === uname)) {{
                alert("Bu kullanıcı adı zaten kullanımda!");
                return;
            }}

            const newUser = {{
                id: 'usr_' + Date.now(),
                username: uname,
                password: pass,
                role: role,
                name: dname,
                avatar: selectedNewAvatar,
                theme: role === 'admin' ? 'gold' : 'cyan',
                level: level,
                gender: gender,
                weights: {{ press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' }},
                createdAt: Date.now()
            }};

            users.push(newUser);
            saveAuthUsers(users);

            document.getElementById('newUsername').value = "";
            document.getElementById('newPassword').value = "123456";
            document.getElementById('newDisplayName').value = "";

            renderAdminUserList();
            alert(`✅ ${{dname}} (@${{uname}}) başarıyla oluşturuldu!`);
        }}

        function renderAdminUserList() {{
            const container = document.getElementById('adminUserListContainer');
            if (!container) return;

            const users = getAuthUsers();
            const session = getSession();

            container.innerHTML = users.map(u => {{
                const logs = getUserLogsById(u.id);
                const streak = calculateStreakForLogs(logs);
                const isSelf = session && session.userId === u.id;

                return `
                    <div class="admin-user-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:20px;">${{u.avatar || '🥋'}}</span>
                                <div>
                                    <strong style="color:#fff; font-size:13px;">${{escapeHTML(u.name)}}</strong>
                                    <span style="font-size:11px; color:var(--text-secondary);"> (@${{escapeHTML(u.username)}})</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-outline" style="font-size:10px; padding:3px 8px; color:var(--gold);" onclick="adminSwitchToUser('${{u.id}}')">
                                    ${{isSelf ? 'Aktif' : 'Hesabına Geç'}}
                                </button>
                                ${{!isSelf ? `
                                    <button class="btn btn-outline" style="font-size:10px; padding:3px 8px; color:#ef4444; border-color:#ef4444;" onclick="adminDeleteUser('${{u.id}}')">
                                        Sil
                                    </button>
                                ` : ''}}
                            </div>
                        </div>
                        <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
                            <span>Şifre: <code style="color:var(--gold-light);">${{escapeHTML(u.password)}}</code></span>
                            <span>${{logs.length}} Seans • Seri: ${{streak}} Gün</span>
                        </div>
                    </div>
                `;
            }}).join('');
        }}

        function adminSwitchToUser(targetUserId) {{
            const users = getAuthUsers();
            const target = users.find(u => u.id === targetUserId);
            if (!target) return;

            setSession({{
                userId: target.id,
                username: target.username,
                role: target.role,
                name: target.name
            }});
            closeAdminModal();
        }}

        function adminDeleteUser(userId) {{
            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) return;

            if (confirm(`@${{target.username}} kullanıcısını silmek istediğinize emin misiniz?`)) {{
                localStorage.removeItem(`celik_kodu_history_${{userId}}`);
                localStorage.removeItem(`celik_kodu_custom_programs_${{userId}}`);
                const updated = users.filter(u => u.id !== userId);
                saveAuthUsers(updated);
                renderAdminUserList();
            }}
        }}

        // PROFILE & THEME SETTINGS
        function applyTheme(themeKey) {{
            const theme = THEMES[themeKey] || THEMES.gold;
            document.documentElement.style.setProperty('--gold', theme.gold);
            document.documentElement.style.setProperty('--gold-light', theme.goldLight);
            document.documentElement.style.setProperty('--gold-glow', theme.glow);
        }}

        function selectAvatar(avatar) {{
            selectedAvatar = avatar;
            document.querySelectorAll('#avatarPicker .avatar-choice').forEach(el => {{
                el.classList.toggle('selected', el.innerText.trim() === avatar);
            }});
        }}

        function selectTheme(themeKey) {{
            selectedTheme = themeKey;
            document.querySelectorAll('#themePicker .theme-pill').forEach(el => {{
                const isSelected = el.getAttribute('onclick') && el.getAttribute('onclick').includes(themeKey);
                el.classList.toggle('selected', isSelected);
            }});
            applyTheme(themeKey);
        }}

        function applyActiveUserProfile() {{
            const user = getActiveUser();
            if (!user) return;

            applyTheme(user.theme || 'gold');

            const headerAvatar = document.getElementById('headerUserAvatar');
            if (headerAvatar) headerAvatar.innerText = user.avatar || '🥋';
            const headerName = document.getElementById('headerUserName');
            if (headerName) headerName.innerText = escapeHTML(user.name);

            const cardAvatar = document.getElementById('profileCardAvatar');
            if (cardAvatar) cardAvatar.innerText = user.avatar || '🥋';
            const cardName = document.getElementById('profileCardName');
            if (cardName) cardName.innerText = escapeHTML(user.name);
            const cardMeta = document.getElementById('profileCardMeta');
            if (cardMeta) cardMeta.innerText = `${{user.level}} (${{user.gender}}) • Özel Kilo Programı`;

            const nameInput = document.getElementById('editUserName');
            if (nameInput) nameInput.value = user.name || '';
            const levelSelect = document.getElementById('editUserLevel');
            if (levelSelect) levelSelect.value = user.level || 'Orta Seviye';
            const genderSelect = document.getElementById('editUserGender');
            if (genderSelect) genderSelect.value = user.gender || 'Erkek';

            selectAvatar(user.avatar || '🥋');
            selectTheme(user.theme || 'gold');

            const w = user.weights || {{}};
            if (document.getElementById('w_press')) document.getElementById('w_press').value = w.press || '';
            if (document.getElementById('w_squat')) document.getElementById('w_squat').value = w.squat || '';
            if (document.getElementById('w_row')) document.getElementById('w_row').value = w.row || '';
            if (document.getElementById('w_rdl')) document.getElementById('w_rdl').value = w.rdl || '';
            if (document.getElementById('w_swing')) document.getElementById('w_swing').value = w.swing || '';
            if (document.getElementById('w_lunge')) document.getElementById('w_lunge').value = w.lunge || '';

            renderHistory();
        }}

        function saveCurrentProfile() {{
            const user = getActiveUser();
            const nameInput = document.getElementById('editUserName');
            const newName = nameInput.value.trim() || 'Sporcu';

            user.name = newName;
            user.avatar = selectedAvatar;
            user.theme = selectedTheme;
            user.level = document.getElementById('editUserLevel').value;
            user.gender = document.getElementById('editUserGender').value;
            user.weights = {{
                press: document.getElementById('w_press').value,
                squat: document.getElementById('w_squat').value,
                row: document.getElementById('w_row').value,
                rdl: document.getElementById('w_rdl').value,
                swing: document.getElementById('w_swing').value,
                lunge: document.getElementById('w_lunge').value
            }};

            const users = getAuthUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) users[idx] = user;
            saveAuthUsers(users);

            const session = getSession();
            if (session && session.userId === user.id) {{
                session.name = newName;
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
            }}

            applyActiveUserProfile();
            playAlertSound();
            alert("✅ Profiliniz ve çalışma kilolarınız başarıyla kaydedildi!");
        }}

        // ==================== LOGS & STATS LOGIC ====================
        function escapeHTML(str) {{
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }}

        function getUserLogsById(userId) {{
            try {{
                const raw = localStorage.getItem(`celik_kodu_history_${{userId}}`);
                return raw ? JSON.parse(raw) : [];
            }} catch(e) {{
                return [];
            }}
        }}

        function getWorkoutLogs() {{
            const uid = getActiveUserId();
            return getUserLogsById(uid);
        }}

        function setWorkoutLogs(logs) {{
            const uid = getActiveUserId();
            localStorage.setItem(`celik_kodu_history_${{uid}}`, JSON.stringify(logs));
        }}

        function deleteLog(id) {{
            if (confirm("Bu antrenman kaydını silmek istediğinize emin misiniz?")) {{
                let logs = getWorkoutLogs();
                logs = logs.filter(l => l.id !== id);
                setWorkoutLogs(logs);
                renderHistory();
            }}
        }}

        function calculateStreakForLogs(logs) {{
            let streak = 0;
            const uniqueDates = [...new Set(logs.map(l => l.date))].sort().reverse();
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {{
                const dateStr = checkDate.toISOString().split('T')[0];
                if (uniqueDates.includes(dateStr)) {{
                    streak++;
                }} else if (i > 0) {{
                    break;
                }}
                checkDate.setDate(checkDate.getDate() - 1);
            }}
            return streak;
        }}

        let currentHistoryLocationFilter = 'all';

        function filterHistoryByLocation(loc) {{
            currentHistoryLocationFilter = loc;
            renderHistory();
        }}

        function renderHistory() {{
            const allLogs = getWorkoutLogs();
            const container = document.getElementById('logHistoryContainer');
            if (!container) return;

            const total = allLogs.length;
            const streak = calculateStreakForLogs(allLogs);

            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
            startOfWeek.setHours(0,0,0,0);
            const thisWeek = allLogs.filter(l => new Date(l.date) >= startOfWeek).length;

            if (document.getElementById('statTotalWorkouts')) document.getElementById('statTotalWorkouts').innerText = total;
            if (document.getElementById('statWeekWorkouts')) document.getElementById('statWeekWorkouts').innerText = `${{thisWeek}}/3`;
            if (document.getElementById('statStreak')) document.getElementById('statStreak').innerText = streak;

            if (allLogs.length === 0) {{
                container.innerHTML = `
                    <div style="background:var(--bg-surface); padding:20px; text-align:center; border:1px dashed var(--border); border-radius:10px; color:var(--text-secondary); font-size:12px;">
                        Henüz kayıtlı antrenman seansınız yok. Bugün ilk antrenmanınızı yapıp kaydedin! 🚀
                    </div>
                `;
                return;
            }}

            // Group by location for filtering & stats
            const locationCounts = {{ 'all': allLogs.length }};
            allLogs.forEach(l => {{
                const locKey = l.locationName || (l.locationType === 'ev' ? 'Ev' : 'Spor Salonu');
                locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
            }});

            const distinctLocations = Object.keys(locationCounts).filter(k => k !== 'all');

            let filterBarHTML = '';
            if (distinctLocations.length > 0) {{
                filterBarHTML = `
                    <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:12px;" class="hide-scrollbar">
                        <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:20px; white-space:nowrap; ${{currentHistoryLocationFilter === 'all' ? 'background:var(--gold); color:#000; font-weight:800;' : ''}}" onclick="filterHistoryByLocation('all')">
                            Tüm Mekanlar (${{locationCounts['all']}})
                        </button>
                        ${{distinctLocations.map(loc => {{
                            const isEv = loc === 'Ev';
                            const isPark = loc === 'Açık Hava / Park';
                            const icon = isEv ? '🏠' : (isPark ? '🌲' : '🏋️');
                            const isActive = currentHistoryLocationFilter === loc;
                            return `
                                <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:20px; white-space:nowrap; ${{isActive ? 'background:var(--gold); color:#000; font-weight:800;' : ''}}" onclick="filterHistoryByLocation('${{escapeHTML(loc)}}')">
                                    ${{icon}} ${{escapeHTML(loc)}} (${{locationCounts[loc]}})
                                </button>
                            `;
                        }}).join('')}}
                    </div>
                `;
            }}

            const logs = currentHistoryLocationFilter === 'all'
                ? allLogs
                : allLogs.filter(l => (l.locationName || (l.locationType === 'ev' ? 'Ev' : 'Spor Salonu')) === currentHistoryLocationFilter);

            if (logs.length === 0) {{
                container.innerHTML = filterBarHTML + `
                    <div style="background:var(--bg-surface); padding:16px; text-align:center; border:1px dashed var(--border); border-radius:10px; color:var(--text-secondary); font-size:12px;">
                        "${{escapeHTML(currentHistoryLocationFilter)}}" mekanında kayıtlı antrenman seansı bulunamadı.
                    </div>
                `;
                return;
            }}

            container.innerHTML = filterBarHTML + logs.map(l => {{
                const totalVol = l.totalVolumeKg ? `${{Math.round(l.totalVolumeKg).toLocaleString('tr-TR')}} kg` : 'Belirtilmedi';
                const setsReps = l.totalSetsCompleted ? `${{l.totalSetsCompleted}} Set • ${{l.totalRepsCompleted || 0}} Tk` : '-';
                const durStr = l.durationFormatted || `${{l.duration}} Dk`;
                const rpeLabel = l.rpe ? (l.rpe.split(' ')[0] + ' ' + (l.rpe.split(' ')[1] || '')) : 'RPE 8';

                const locType = l.locationType || (l.locationName === 'Ev' ? 'ev' : 'salon');
                const locName = l.locationName || (locType === 'ev' ? 'Ev' : 'Spor Salonu');
                const isEv = locType === 'ev';
                const isPark = locType === 'acik_hava';
                const locIcon = isEv ? '🏠' : (isPark ? '🌲' : '🏋️');
                const locBadgeStyle = isEv
                    ? 'background:rgba(59, 130, 246, 0.15); border:1px solid rgba(59, 130, 246, 0.4); color:#93c5fd;'
                    : (isPark
                        ? 'background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.4); color:#6ee7b7;'
                        : 'background:rgba(217, 119, 6, 0.15); border:1px solid rgba(217, 119, 6, 0.4); color:#fcd34d;');

                return `
                    <div class="log-history-card">
                        <div class="log-card-header">
                            <div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                                    <span class="log-date">📅 ${{escapeHTML(l.dateFormatted || l.date)}}</span>
                                    <span style="${{locBadgeStyle}} border-radius:4px; padding:2px 8px; font-size:11px; font-weight:700;">
                                        ${{locIcon}} ${{escapeHTML(locName)}}
                                    </span>
                                </div>
                                <h3 style="font-size:15px; font-weight:800; color:#fff; line-height:1.3;">${{escapeHTML(l.program)}}</h3>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="ex-badge badge-equip">${{escapeHTML(rpeLabel)}}</span>
                                <button class="btn-delete-log" onclick="deleteLog('${{l.id}}')" title="Kaydı Sil">✕</button>
                            </div>
                        </div>

                        <!-- STATS ROW -->
                        <div class="log-stats-bar">
                            <div class="log-stat-item">
                                <span class="log-stat-label">Toplam Tonaj</span>
                                <span class="log-stat-val">🏋️ ${{totalVol}}</span>
                            </div>
                            <div class="log-stat-item">
                                <span class="log-stat-label">Set / Tekrar</span>
                                <span class="log-stat-val">🎯 ${{setsReps}}</span>
                            </div>
                            <div class="log-stat-item">
                                <span class="log-stat-label">Toplam Süre</span>
                                <span class="log-stat-val">⏱️ ${{durStr}}</span>
                            </div>
                        </div>

                        <!-- MUSCLES WORKED -->
                        ${{l.muscleGroups && l.muscleGroups.length > 0 ? `
                            <div style="margin: 6px 0 8px; display:flex; flex-wrap:wrap; gap:4px;">
                                ${{l.muscleGroups.map(m => `<span class="muscle-tag">${{escapeHTML(m)}}</span>`).join('')}}
                            </div>
                        ` : ''}}

                        <!-- DETAILED EXERCISES & SETS -->
                        ${{l.exercises && l.exercises.length > 0 ? `
                            <div class="log-exercises-list">
                                ${{l.exercises.map(ex => `
                                    <div class="log-exercise-item">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                            <strong style="color:var(--gold-light); font-size:12px;">${{escapeHTML(ex.name)}}</strong>
                                            <span style="font-size:11px; color:var(--text-secondary);">${{escapeHTML(ex.muscle ? ex.muscle.split(',')[0] : '')}}${{ex.exerciseVolume ? ` • ${{Math.round(ex.exerciseVolume).toLocaleString('tr-TR')}} kg` : ''}}</span>
                                        </div>
                                        <div class="log-sets-summary">
                                            ${{(ex.sets || []).map(st => st.completed ? `
                                                <span class="log-set-pill completed">
                                                    S${{st.setNo}}: <strong>${{st.weight || 0}}kg</strong> x ${{st.reps || 0}} ✓
                                                </span>
                                            ` : `
                                                <span class="log-set-pill" style="opacity:0.4; border-style:dashed; text-decoration:line-through;">
                                                    S${{st.setNo}}: Atlandı
                                                </span>
                                            `).join('')}}
                                        </div>
                                    </div>
                                `).join('')}}
                            </div>
                        ` : ''}}

                        ${{l.notes ? `<div class="log-notes-box">📝 ${{escapeHTML(l.notes)}}</div>` : ''}}
                    </div>
                `;
            }}).join('');
        }}

        function exportCSV() {{
            const uid = getActiveUserId();
            const logs = getWorkoutLogs();
            if (logs.length === 0) {{
                alert("Henüz dışa aktarılacak bir antrenman kaydınız bulunmuyor.");
                return;
            }}

            const headers = ["Tarih", "Program", "Mekan_Tipi", "Salon_Adi", "Sure_Dk", "RPE", "Toplam_Tonaj_Kg", "Egzersiz", "Ekipman", "Kas_Grubu", "Set_No", "Kilo_Kg", "Tekrar", "Hacim_Kg", "Durum"];
            const rows = [headers.join(",")];

            logs.forEach(l => {{
                const date = `"${{l.dateFormatted || l.date}}"`;
                const prog = `"${{(l.program || '').replace(/"/g, '""')}}"`;
                const locType = `"${{(l.locationType === 'salon' ? 'Spor Salonu' : (l.locationType === 'ev' ? 'Ev' : (l.locationType === 'acik_hava' ? 'Açık Hava' : 'Diğer')))}}"`;
                const locName = `"${{(l.locationName || (l.locationType === 'ev' ? 'Ev' : 'Salon')).replace(/"/g, '""')}}"`;
                const dur = l.duration || '';
                const rpe = `"${{(l.rpe || '').replace(/"/g, '""')}}"`;
                const totalVol = l.totalVolumeKg || 0;

                if (l.exercises && l.exercises.length > 0) {{
                    l.exercises.forEach(ex => {{
                        const exName = `"${{ex.name.replace(/"/g, '""')}}"`;
                        const equip = `"${{ex.equipment || ''}}"`;
                        const muscle = `"${{(ex.muscle || '').replace(/"/g, '""')}}"`;
                        if (ex.sets && ex.sets.length > 0) {{
                            ex.sets.forEach(st => {{
                                const setNo = st.setNo;
                                const isDone = !!st.completed;
                                const w = isDone ? (st.weight || 0) : 0;
                                const r = isDone ? (st.reps || 0) : 0;
                                const v = isDone ? (w * r) : 0;
                                const status = isDone ? '"Tamamlandı"' : '"Atlandı"';
                                rows.push([date, prog, locType, locName, dur, rpe, totalVol, exName, equip, muscle, setNo, w, r, v, status].join(","));
                            }});
                        }} else {{
                            rows.push([date, prog, locType, locName, dur, rpe, totalVol, exName, equip, muscle, 1, 0, 0, 0, '"Atlandı"'].join(","));
                        }}
                    }});
                }} else {{
                    rows.push([date, prog, locType, locName, dur, rpe, totalVol, 'Genel', '', '', 1, 0, 0, 0, '"Tamamlandı"'].join(","));
                }}
            }});

            const csvContent = "\\uFEFF" + rows.join("\\r\\n"); // UTF-8 BOM for Excel Turkish characters
            const blob = new Blob([csvContent], {{ type: 'text/csv;charset=utf-8;' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_antrenman_analiz_${{uid}}_${{new Date().toISOString().split('T')[0]}}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }}

        function exportData() {{
            const uid = getActiveUserId();
            const logs = getWorkoutLogs();
            const data = {{
                userId: uid,
                history: logs,
                exportDate: new Date().toISOString()
            }};
            const blob = new Blob([JSON.stringify(data, null, 2)], {{ type: 'application/json' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_yedek_${{uid}}_${{new Date().toISOString().split('T')[0]}}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }}

        function importData(e) {{
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {{
                try {{
                    const data = JSON.parse(evt.target.result);
                    if (data.history && Array.isArray(data.history)) {{
                        setWorkoutLogs(data.history);
                        renderHistory();
                        alert("✅ Antrenman geçmişi başarıyla yüklendi!");
                    }}
                }} catch(err) {{
                    alert("❌ Hata: Geçersiz yedek dosyası!");
                }}
            }};
            reader.readAsText(file);
        }}

        // ==================== ADVANCED ANALYTICS, SCALE & MEASUREMENTS ENGINE ====================
        let currentAnalyticsSubView = 'muscle';
        let currentAnalyticsPeriodDays = 30;

        function switchAnalyticsSubView(view) {{
            currentAnalyticsSubView = view;
            const subBtns = [
                {{ id: 'btnSubAnalyticsMuscle', view: 'muscle' }},
                {{ id: 'btnSubAnalyticsScale', view: 'scale' }},
                {{ id: 'btnSubAnalyticsMeasurements', view: 'measurements' }},
                {{ id: 'btnSubAnalyticsCombined', view: 'combined' }}
            ];
            subBtns.forEach(b => {{
                const el = document.getElementById(b.id);
                if (el) {{
                    if (b.view === view) el.classList.add('active');
                    else el.classList.remove('active');
                }}
            }});
            renderAnalytics();
        }}

        function setAnalyticsPeriod(days) {{
            currentAnalyticsPeriodDays = parseInt(days) || 30;
            renderAnalytics();
        }}

        // ----- SCALE (TARTI) STORAGE & CRUD -----
        function getScaleLogs() {{
            const uid = getActiveUserId();
            try {{
                const raw = localStorage.getItem(`celik_kodu_scale_${{uid}}`);
                return raw ? JSON.parse(raw) : [];
            }} catch(e) {{
                return [];
            }}
        }}

        function setScaleLogs(logs) {{
            const uid = getActiveUserId();
            localStorage.setItem(`celik_kodu_scale_${{uid}}`, JSON.stringify(logs));
        }}

        function openScaleModal() {{
            const todayStr = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('scaleDate');
            if (dateInput) dateInput.value = todayStr;

            const logs = getScaleLogs();
            if (logs.length > 0) {{
                const last = logs[0];
                if (document.getElementById('scaleWeight')) document.getElementById('scaleWeight').value = last.weight || '';
                if (document.getElementById('scaleBodyFat')) document.getElementById('scaleBodyFat').value = last.bodyFat || '';
                if (document.getElementById('scaleMuscleMass')) document.getElementById('scaleMuscleMass').value = last.muscleMass || '';
                if (document.getElementById('scaleWaterPct')) document.getElementById('scaleWaterPct').value = last.waterPct || '';
                if (document.getElementById('scaleVisceralFat')) document.getElementById('scaleVisceralFat').value = last.visceralFat || '';
                if (document.getElementById('scaleBmr')) document.getElementById('scaleBmr').value = last.bmr || '';
            }}

            document.getElementById('scaleModal').classList.add('active');
        }}

        function closeScaleModal() {{
            document.getElementById('scaleModal').classList.remove('active');
        }}

        function saveScaleEntry() {{
            const date = document.getElementById('scaleDate').value || new Date().toISOString().split('T')[0];
            const weightVal = parseFloat(document.getElementById('scaleWeight').value);

            if (!weightVal || isNaN(weightVal) || weightVal <= 0) {{
                alert("Lütfen geçerli bir kilo (kg) değeri giriniz!");
                return;
            }}

            const bodyFat = parseFloat(document.getElementById('scaleBodyFat').value) || null;
            const muscleMass = parseFloat(document.getElementById('scaleMuscleMass').value) || null;
            const waterPct = parseFloat(document.getElementById('scaleWaterPct').value) || null;
            const visceralFat = parseInt(document.getElementById('scaleVisceralFat').value) || null;
            const bmr = parseInt(document.getElementById('scaleBmr').value) || null;
            const notes = document.getElementById('scaleNotes').value.trim();

            const entry = {{
                id: 'scale_' + Date.now(),
                date: date,
                weight: Math.round(weightVal * 10) / 10,
                bodyFat: bodyFat ? Math.round(bodyFat * 10) / 10 : null,
                muscleMass: muscleMass ? Math.round(muscleMass * 10) / 10 : null,
                waterPct: waterPct ? Math.round(waterPct * 10) / 10 : null,
                visceralFat: visceralFat,
                bmr: bmr,
                notes: notes,
                timestamp: Date.now()
            }};

            let logs = getScaleLogs();
            logs = logs.filter(l => l.date !== date);
            logs.unshift(entry);
            logs.sort((a, b) => new Date(b.date) - new Date(a.date));
            setScaleLogs(logs);

            closeScaleModal();
            renderAnalytics();
            playAlertSound();
            alert(`⚖️ Tartı kaydı kaydedildi!\n\nKilo: ${{entry.weight}} kg${{entry.bodyFat ? ` • Yağ: %${{entry.bodyFat}}` : ''}}${{entry.muscleMass ? ` • Kas: ${{entry.muscleMass}} kg` : ''}}`);
        }}

        function deleteScaleEntry(id) {{
            if (confirm("Bu tartı ölçümünü silmek istediğinize emin misiniz?")) {{
                let logs = getScaleLogs();
                logs = logs.filter(l => l.id !== id);
                setScaleLogs(logs);
                renderAnalytics();
            }}
        }}

        // ----- BODY MEASUREMENTS (MEZURA) STORAGE & CRUD -----
        function getMeasurementsLogs() {{
            const uid = getActiveUserId();
            try {{
                const raw = localStorage.getItem(`celik_kodu_measurements_${{uid}}`);
                return raw ? JSON.parse(raw) : [];
            }} catch(e) {{
                return [];
            }}
        }}

        function setMeasurementsLogs(logs) {{
            const uid = getActiveUserId();
            localStorage.setItem(`celik_kodu_measurements_${{uid}}`, JSON.stringify(logs));
        }}

        function openMeasurementsModal() {{
            const todayStr = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('measureDate');
            if (dateInput) dateInput.value = todayStr;

            const logs = getMeasurementsLogs();
            if (logs.length > 0) {{
                const last = logs[0];
                if (document.getElementById('measureWaist')) document.getElementById('measureWaist').value = last.waist || '';
                if (document.getElementById('measureChest')) document.getElementById('measureChest').value = last.chest || '';
                if (document.getElementById('measureShoulder')) document.getElementById('measureShoulder').value = last.shoulder || '';
                if (document.getElementById('measureArms')) document.getElementById('measureArms').value = last.arms || '';
                if (document.getElementById('measureThigh')) document.getElementById('measureThigh').value = last.thigh || '';
                if (document.getElementById('measureHips')) document.getElementById('measureHips').value = last.hips || '';
                if (document.getElementById('measureNeck')) document.getElementById('measureNeck').value = last.neck || '';
            }}

            document.getElementById('measurementsModal').classList.add('active');
        }}

        function closeMeasurementsModal() {{
            document.getElementById('measurementsModal').classList.remove('active');
        }}

        function saveMeasurementsEntry() {{
            const date = document.getElementById('measureDate').value || new Date().toISOString().split('T')[0];
            const waistVal = parseFloat(document.getElementById('measureWaist').value);

            if (!waistVal || isNaN(waistVal) || waistVal <= 0) {{
                alert("Lütfen en azından Bel Çevresi (cm) değerini giriniz!");
                return;
            }}

            const chest = parseFloat(document.getElementById('measureChest').value) || null;
            const shoulder = parseFloat(document.getElementById('measureShoulder').value) || null;
            const arms = parseFloat(document.getElementById('measureArms').value) || null;
            const thigh = parseFloat(document.getElementById('measureThigh').value) || null;
            const hips = parseFloat(document.getElementById('measureHips').value) || null;
            const neck = parseFloat(document.getElementById('measureNeck').value) || null;
            const notes = document.getElementById('measureNotes').value.trim();

            const entry = {{
                id: 'meas_' + Date.now(),
                date: date,
                waist: Math.round(waistVal * 10) / 10,
                chest: chest ? Math.round(chest * 10) / 10 : null,
                shoulder: shoulder ? Math.round(shoulder * 10) / 10 : null,
                arms: arms ? Math.round(arms * 10) / 10 : null,
                thigh: thigh ? Math.round(thigh * 10) / 10 : null,
                hips: hips ? Math.round(hips * 10) / 10 : null,
                neck: neck ? Math.round(neck * 10) / 10 : null,
                notes: notes,
                timestamp: Date.now()
            }};

            let logs = getMeasurementsLogs();
            logs = logs.filter(l => l.date !== date);
            logs.unshift(entry);
            logs.sort((a, b) => new Date(b.date) - new Date(a.date));
            setMeasurementsLogs(logs);

            closeMeasurementsModal();
            renderAnalytics();
            playAlertSound();
            alert(`📏 Vücut ölçüleri kaydedildi!\n\nBel: ${{entry.waist}} cm${{entry.chest ? ` • Göğüs: ${{entry.chest}} cm` : ''}}${{entry.arms ? ` • Kol: ${{entry.arms}} cm` : ''}}`);
        }}

        function deleteMeasurementsEntry(id) {{
            if (confirm("Bu vücut ölçümü kaydını silmek istediğinize emin misiniz?")) {{
                let logs = getMeasurementsLogs();
                logs = logs.filter(l => l.id !== id);
                setMeasurementsLogs(logs);
                renderAnalytics();
            }}
        }}

        function exportAnalyticsCSV() {{
            const uid = getActiveUserId();
            const scaleLogs = getScaleLogs();
            const measLogs = getMeasurementsLogs();

            let csv = "\\uFEFF=== TARTI VE VÜCUT KOMPOZİSYONU GEÇMİŞİ ===\\r\\n";
            csv += "Tarih,Kilo_Kg,Yag_Orani_Pct,Kas_Kutlesi_Kg,Sivi_Pct,Viseral_Yag,BMR_kcal,Notlar\\r\\n";
            scaleLogs.forEach(s => {{
                csv += `"${{s.date}}",${{s.weight || ''}},${{s.bodyFat || ''}},${{s.muscleMass || ''}},${{s.waterPct || ''}},${{s.visceralFat || ''}},${{s.bmr || ''}},"${{(s.notes || '').replace(/"/g, '""')}}"\\r\\n`;
            }});

            csv += "\\r\\n=== MEZURA VÜCUT ÖLÇÜLERİ GEÇMİŞİ ===\\r\\n";
            csv += "Tarih,Bel_cm,Gogus_cm,Omuz_cm,Kol_cm,Bacak_cm,Kalca_cm,Boyun_cm,Notlar\\r\\n";
            measLogs.forEach(m => {{
                csv += `"${{m.date}}",${{m.waist || ''}},${{m.chest || ''}},${{m.shoulder || ''}},${{m.arms || ''}},${{m.thigh || ''}},${{m.hips || ''}},${{m.neck || ''}},"${{(m.notes || '').replace(/"/g, '""')}}"\\r\\n`;
            }});

            const blob = new Blob([csv], {{ type: 'text/csv;charset=utf-8;' }});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_tarti_ve_olcum_${{uid}}_${{new Date().toISOString().split('T')[0]}}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }}

        // ----- MAIN RENDER ANALYTICS CONTROLLER -----
        function renderAnalytics() {{
            const container = document.getElementById('analyticsContentContainer');
            if (!container) return;

            // Highlight subview tab buttons
            const subBtns = [
                {{ id: 'btnSubAnalyticsMuscle', view: 'muscle' }},
                {{ id: 'btnSubAnalyticsScale', view: 'scale' }},
                {{ id: 'btnSubAnalyticsMeasurements', view: 'measurements' }},
                {{ id: 'btnSubAnalyticsCombined', view: 'combined' }}
            ];
            subBtns.forEach(b => {{
                const el = document.getElementById(b.id);
                if (el) {{
                    if (b.view === currentAnalyticsSubView) el.classList.add('active');
                    else el.classList.remove('active');
                }}
            }});

            if (currentAnalyticsSubView === 'muscle') {{
                renderMuscleAnalytics(container);
            }} else if (currentAnalyticsSubView === 'scale') {{
                renderScaleAnalytics(container);
            }} else if (currentAnalyticsSubView === 'measurements') {{
                renderMeasurementsAnalytics(container);
            }} else if (currentAnalyticsSubView === 'combined') {{
                renderCombinedCoachReport(container);
            }}
        }}

        function renderMuscleAnalytics(container) {{
            const allLogs = getWorkoutLogs();
            const days = currentAnalyticsPeriodDays;
            const now = new Date();
            const cutoff = days > 0 ? new Date(now.getTime() - (days * 24 * 60 * 60 * 1000)) : null;

            const filteredLogs = cutoff ? allLogs.filter(l => new Date(l.date) >= cutoff) : allLogs;

            const timeFilterHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:14px; background:rgba(0,0,0,0.25); padding:8px 12px; border-radius:10px; border:1px solid var(--border);">
                    <span style="font-size:11.5px; font-weight:800; color:var(--text-secondary); text-transform:uppercase;">📅 Analiz Zaman Dilimi:</span>
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${{days === 7 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}}" onclick="setAnalyticsPeriod(7)">Son 7 Gün</button>
                        <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${{days === 30 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}}" onclick="setAnalyticsPeriod(30)">Son 30 Gün</button>
                        <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${{days === 90 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}}" onclick="setAnalyticsPeriod(90)">Son 90 Gün</button>
                        <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${{days === 0 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}}" onclick="setAnalyticsPeriod(0)">Tüm Zamanlar</button>
                    </div>
                </div>
            `;

            if (filteredLogs.length === 0) {{
                container.innerHTML = timeFilterHTML + `
                    <div style="background:var(--bg-surface); padding:24px; text-align:center; border:1px dashed var(--border); border-radius:10px; color:var(--text-secondary); font-size:12.5px;">
                        Bu zaman aralığında kayıtlı antrenman seansı bulunamadı. Antrenmanlarınızı kaydederek kas yükü analizini görebilirsiniz! 🚀
                    </div>
                `;
                return;
            }}

            let totalVolume = 0;
            let totalSets = 0;
            let totalReps = 0;

            const pillars = {{
                legs: {{ label: 'Bacak & Kalça (Alt Vücut)', icon: '🦵', color: '#10b981', volume: 0, sets: 0 }},
                back: {{ label: 'Sırt & Çekiş (Posterior Zincir)', icon: '🛡️', color: '#38bdf8', volume: 0, sets: 0 }},
                chest: {{ label: 'Göğüs & İtiş (Anterior Zincir)', icon: '⚔️', color: '#f59e0b', volume: 0, sets: 0 }},
                arms: {{ label: 'Kollar (Biceps & Triceps)', icon: '💪', color: '#a855f7', volume: 0, sets: 0 }},
                core: {{ label: 'Karın & Core Zırhı', icon: '⚡', color: '#f43f5e', volume: 0, sets: 0 }}
            }};

            const prMap = {{}};

            filteredLogs.forEach(log => {{
                totalVolume += (log.totalVolumeKg || 0);
                totalSets += (log.totalSetsCompleted || 0);
                totalReps += (log.totalRepsCompleted || 0);

                if (log.exercises && log.exercises.length > 0) {{
                    log.exercises.forEach(ex => {{
                        const exVol = ex.exerciseVolume || 0;
                        const cSets = ex.completedSetsCount || 0;
                        if (cSets === 0) return;

                        const nameLower = (ex.name || '').toLowerCase();
                        const muscleLower = (ex.muscle || '').toLowerCase();
                        const catLower = (ex.category || '').toLowerCase();
                        const searchStr = `${{nameLower}} ${{muscleLower}} ${{catLower}}`;

                        let matched = false;
                        if (searchStr.includes('bacak') || searchStr.includes('squat') || searchStr.includes('lunge') || searchStr.includes('rdl') || searchStr.includes('deadlift') || searchStr.includes('quad') || searchStr.includes('kalça') || searchStr.includes('hamstring') || searchStr.includes('baldır')) {{
                            pillars.legs.volume += exVol;
                            pillars.legs.sets += cSets;
                            matched = true;
                        }}
                        if (searchStr.includes('sırt') || searchStr.includes('kürek') || searchStr.includes('row') || searchStr.includes('barfiks') || searchStr.includes('kanat') || searchStr.includes('trapez') || searchStr.includes('pull')) {{
                            pillars.back.volume += exVol;
                            pillars.back.sets += cSets;
                            matched = true;
                        }}
                        if (searchStr.includes('göğüs') || searchStr.includes('press') || searchStr.includes('şınav') || searchStr.includes('push') || searchStr.includes('omuz') || searchStr.includes('deltoid') || searchStr.includes('bench')) {{
                            pillars.chest.volume += exVol;
                            pillars.chest.sets += cSets;
                            matched = true;
                        }}
                        if (searchStr.includes('biceps') || searchStr.includes('triceps') || searchStr.includes('kol') || searchStr.includes('curl') || searchStr.includes('dips')) {{
                            pillars.arms.volume += exVol;
                            pillars.arms.sets += cSets;
                            matched = true;
                        }}
                        if (searchStr.includes('karın') || searchStr.includes('core') || searchStr.includes('plank') || searchStr.includes('twist') || searchStr.includes('hollow') || searchStr.includes('swing')) {{
                            pillars.core.volume += exVol;
                            pillars.core.sets += cSets;
                            matched = true;
                        }}
                        if (!matched) {{
                            pillars.legs.volume += (exVol * 0.5);
                            pillars.back.volume += (exVol * 0.5);
                        }}

                        // Track PRs
                        if (ex.maxWeight && ex.maxWeight > 0) {{
                            if (!prMap[ex.name] || ex.maxWeight > prMap[ex.name].weight) {{
                                prMap[ex.name] = {{ weight: ex.maxWeight, date: log.dateFormatted || log.date, muscle: ex.muscle }};
                            }}
                        }}
                    }});
                }}
            }});

            const sessionsCount = filteredLogs.length;
            const avgSessionVol = sessionsCount > 0 ? Math.round(totalVolume / sessionsCount) : 0;
            const totalPillarsVol = Object.values(pillars).reduce((sum, p) => sum + p.volume, 0) || 1;

            // Push vs Pull ratio
            const pushTotal = pillars.chest.volume + (pillars.arms.volume * 0.4);
            const pullTotal = pillars.back.volume + (pillars.arms.volume * 0.6);
            const pushPullRatio = pushTotal > 0 ? (pullTotal / pushTotal).toFixed(2) : '1.00';

            let balanceBadge = '✅ Mükemmel Denge';
            let balanceColor = '#10b981';
            let balanceDesc = 'İtiş ve çekiş hacminiz dengeli; omuz ve omurga sağlığınız korunuyor.';
            if (pushPullRatio < 0.85) {{
                balanceBadge = '⚠️ İtiş Hacmi Baskın';
                balanceColor = '#f59e0b';
                balanceDesc = 'Göğüs ve omuz itiş tonajınız sırttan yüksek. Omuz sakatlığı riskini önlemek için sırt ve kürek hareketlerine ağırlık verin.';
            }} else if (pushPullRatio > 1.35) {{
                balanceBadge = '⚠️ Çekiş Hacmi Baskın';
                balanceColor = '#38bdf8';
                balanceDesc = 'Sırt çekiş hacminiz itişten belirgin şekilde fazla. İtiş egzersizlerinizi artırabilirsiniz.';
            }}

            const sortedPrs = Object.keys(prMap).map(k => ({{ name: k, ...prMap[k] }})).sort((a,b) => b.weight - a.weight).slice(0, 6);

            container.innerHTML = timeFilterHTML + `
                <!-- KPI STATS -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                        <div style="font-size:18px; font-weight:900; color:var(--gold); margin-top:2px;">🏋️ ${{Math.round(totalVolume).toLocaleString('tr-TR')}} kg</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">${{sessionsCount}} Seans</div>
                    </div>
                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">SEANS BAŞI ORT.</div>
                        <div style="font-size:18px; font-weight:900; color:var(--cyan); margin-top:2px;">⚡ ${{avgSessionVol.toLocaleString('tr-TR')}} kg</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Yoğunluk</div>
                    </div>
                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">SET & TEKRAR</div>
                        <div style="font-size:18px; font-weight:900; color:var(--green-success); margin-top:2px;">🎯 ${{totalSets}} / ${{totalReps}}</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Hacim</div>
                    </div>
                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">İTİŞ / ÇEKİŞ ORANI</div>
                        <div style="font-size:18px; font-weight:900; color:${{balanceColor}}; margin-top:2px;">⚖️ ${{pushPullRatio}}</div>
                        <div style="font-size:10px; color:${{balanceColor}}; margin-top:2px;">${{balanceBadge}}</div>
                    </div>
                </div>

                <!-- MUSCLE PILLARS VOLUME BARS -->
                <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="font-size:13.5px; font-weight:800; color:#fff;">🧬 Kas Grubu Tonaj & Hacim Dağılımı</h3>
                        <span style="font-size:11px; color:var(--gold); font-weight:700;">Kümülatif Yük</span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${{Object.keys(pillars).map(key => {{
                            const p = pillars[key];
                            const pct = Math.round((p.volume / totalPillarsVol) * 100);
                            return `
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                                        <span style="color:#fff;">${{p.icon}} ${{p.label}}</span>
                                        <span style="color:${{p.color}};">${{Math.round(p.volume).toLocaleString('tr-TR')}} kg <span style="color:var(--text-secondary); font-size:11px;">(%${{pct}})</span></span>
                                    </div>
                                    <div class="analytics-bar-bg">
                                        <div class="analytics-bar-fill" style="width:${{Math.min(100, Math.max(4, pct))}}%; background:${{p.color}};"></div>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-secondary); margin-top:2px;">
                                        <span>Tamamlanan Set: ${{p.sets}}</span>
                                        <span>Ortalama Yük: ${{p.sets > 0 ? Math.round(p.volume / p.sets) : 0}} kg/set</span>
                                    </div>
                                </div>
                            `;
                        }}).join('')}}
                    </div>
                </div>

                <!-- BIOMECHANICAL BALANCE & COACH INSIGHT -->
                <div style="background:rgba(245, 158, 11, 0.04); border:1px solid rgba(245, 158, 11, 0.25); border-radius:12px; padding:14px; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <span style="font-size:18px;">🩺</span>
                        <h3 style="font-size:13.5px; font-weight:800; color:var(--gold-light);">Biyomekanik Postür & Sakatlık Önleme Raporu</h3>
                    </div>
                    <p style="font-size:12px; color:#cbd5e1; line-height:1.5; margin-bottom:8px;">
                        ${{balanceDesc}} Çekiş hacminiz: <strong>${{Math.round(pullTotal).toLocaleString('tr-TR')}} kg</strong>, İtiş hacminiz: <strong>${{Math.round(pushTotal).toLocaleString('tr-TR')}} kg</strong>.
                    </p>
                    <div style="font-size:11.5px; color:var(--text-secondary); background:rgba(0,0,0,0.25); padding:8px 10px; border-radius:8px;">
                        💡 <strong>Koç Tavsiyesi:</strong> Bacak ve arka zincir kasları metabolik motorunuzdur. Her seans öncesi kalça ve omuz mobilite protokolünü (CARs) eksiksiz uygulayarak eklem hareket açıklığınızı maksimize edin.
                    </div>
                </div>

                <!-- PR RECORDS TABLE -->
                ${{sortedPrs.length > 0 ? `
                    <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <h3 style="font-size:13.5px; font-weight:800; color:#fff;">🏆 Kişisel Ağırlık Rekorları (PR)</h3>
                            <span style="font-size:11px; color:var(--cyan); font-weight:700;">Zirve Kilolar</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            ${{sortedPrs.map((pr, idx) => `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:8px 10px; border-radius:8px; border-left:3px solid var(--gold);">
                                    <div>
                                        <div style="font-size:12.5px; font-weight:800; color:#fff;">#${{idx+1}} ${{escapeHTML(pr.name)}}</div>
                                        <div style="font-size:10.5px; color:var(--text-secondary);">${{escapeHTML(pr.muscle || '')}} • ${{escapeHTML(pr.date)}}</div>
                                    </div>
                                    <div style="font-size:15px; font-weight:900; color:var(--gold);">
                                        ${{pr.weight}} kg
                                    </div>
                                </div>
                            `).join('')}}
                        </div>
                    </div>
                ` : ''}}
            `;
        }}

        function renderScaleAnalytics(container) {{
            const logs = getScaleLogs();

            if (logs.length === 0) {{
                container.innerHTML = `
                    <div style="background:var(--bg-surface); padding:24px; text-align:center; border:1px dashed var(--border); border-radius:12px;">
                        <span style="font-size:36px; display:block; margin-bottom:10px;">⚖️</span>
                        <h3 style="font-size:15px; font-weight:800; color:#fff; margin-bottom:6px;">Henüz Tartı Kaydı Eklenmemiş</h3>
                        <p style="font-size:12px; color:var(--text-secondary); max-width:380px; margin:0 auto 16px;">
                            Akıllı tartı veya ev tartınızdan kilo, yağ oranı ve kas kütlesi verilerinizi girerek zaman içindeki değişiminizi takip edebilirsiniz.
                        </p>
                        <button class="btn btn-gold" style="font-size:12px; padding:10px 18px; font-weight:800;" onclick="openScaleModal()">
                            ⚖️ İlk Tartı Kaydınızı Ekleyin
                        </button>
                    </div>
                `;
                return;
            }}

            const latest = logs[0];
            const earliest = logs[logs.length - 1];

            const deltaWeight = logs.length > 1 ? (latest.weight - earliest.weight).toFixed(1) : null;
            const deltaFat = (logs.length > 1 && latest.bodyFat && earliest.bodyFat) ? (latest.bodyFat - earliest.bodyFat).toFixed(1) : null;
            const deltaMuscle = (logs.length > 1 && latest.muscleMass && earliest.muscleMass) ? (latest.muscleMass - earliest.muscleMass).toFixed(1) : null;

            container.innerHTML = `
                <!-- SCALE KPI CARDS -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">SON KİLO</div>
                        <div style="font-size:20px; font-weight:900; color:var(--gold); margin-top:2px;">${{latest.weight}} kg</div>
                        ${{deltaWeight !== null ? `
                            <div style="font-size:10.5px; font-weight:800; color:${{parseFloat(deltaWeight) <= 0 ? 'var(--green-success)' : 'var(--red-alert)'}}; margin-top:2px;">
                                ${{parseFloat(deltaWeight) > 0 ? '+' : ''}}${{deltaWeight}} kg
                            </div>
                        ` : '<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">İlk Ölçüm</div>'}}
                    </div>

                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">VÜCUT YAĞI</div>
                        <div style="font-size:20px; font-weight:900; color:var(--cyan); margin-top:2px;">${{latest.bodyFat ? `%${{latest.bodyFat}}` : '-'}}</div>
                        ${{deltaFat !== null ? `
                            <div style="font-size:10.5px; font-weight:800; color:${{parseFloat(deltaFat) <= 0 ? 'var(--green-success)' : 'var(--red-alert)'}}; margin-top:2px;">
                                ${{parseFloat(deltaFat) > 0 ? '+' : ''}}${{deltaFat}}%
                            </div>
                        ` : '<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Yağ Oranı</div>'}}
                    </div>

                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">İSKELET KASI</div>
                        <div style="font-size:20px; font-weight:900; color:var(--green-success); margin-top:2px;">${{latest.muscleMass ? `${{latest.muscleMass}} kg` : '-'}}</div>
                        ${{deltaMuscle !== null ? `
                            <div style="font-size:10.5px; font-weight:800; color:${{parseFloat(deltaMuscle) >= 0 ? 'var(--green-success)' : 'var(--red-alert)'}}; margin-top:2px;">
                                ${{parseFloat(deltaMuscle) > 0 ? '+' : ''}}${{deltaMuscle}} kg
                            </div>
                        ` : '<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Kas Kütlesi</div>'}}
                    </div>

                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">İÇ YAĞLANMA / SIVI</div>
                        <div style="font-size:18px; font-weight:900; color:#fff; margin-top:2px;">Sev. ${{latest.visceralFat || '-'}} / ${{latest.waterPct ? `%${{latest.waterPct}}` : '-'}}</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">${{latest.bmr ? `${{latest.bmr}} kcal` : 'Metabolizma'}}</div>
                    </div>
                </div>

                <!-- SCALE HISTORY LIST -->
                <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="font-size:13.5px; font-weight:800; color:#fff;">📋 Tartı Ölçüm Geçmişi</h3>
                        <button class="btn btn-gold" style="font-size:11px; padding:4px 10px; font-weight:800;" onclick="openScaleModal()">+ Yeni Tartı Ekle</button>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${{logs.map((l, idx) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:10px 12px; border-radius:8px; border-left:3px solid var(--gold);">
                                <div>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <strong style="font-size:14px; color:#fff;">${{l.weight}} kg</strong>
                                        <span style="font-size:11px; color:var(--text-secondary);">📅 ${{escapeHTML(l.date)}}</span>
                                    </div>
                                    <div style="font-size:11.5px; color:#94a3b8; margin-top:2px; display:flex; gap:8px; flex-wrap:wrap;">
                                        ${{l.bodyFat ? `<span>Yağ: <strong>%${{l.bodyFat}}</strong></span>` : ''}}
                                        ${{l.muscleMass ? `<span>Kas: <strong>${{l.muscleMass}} kg</strong></span>` : ''}}
                                        ${{l.waterPct ? `<span>Sıvı: <strong>%${{l.waterPct}}</strong></span>` : ''}}
                                        ${{l.visceralFat ? `<span>İç Yağ: <strong>${{l.visceralFat}}</strong></span>` : ''}}
                                        ${{l.bmr ? `<span>BMR: <strong>${{l.bmr}} kcal</strong></span>` : ''}}
                                    </div>
                                    ${{l.notes ? `<div style="font-size:11px; color:var(--gold-light); margin-top:3px;">📝 ${{escapeHTML(l.notes)}}</div>` : ''}}
                                </div>
                                <div>
                                    <button class="btn-delete-log" onclick="deleteScaleEntry('${{l.id}}')" title="Kaydı Sil">✕</button>
                                </div>
                            </div>
                        `).join('')}}
                    </div>
                </div>
            `;
        }}

        function renderMeasurementsAnalytics(container) {{
            const logs = getMeasurementsLogs();

            if (logs.length === 0) {{
                container.innerHTML = `
                    <div style="background:var(--bg-surface); padding:24px; text-align:center; border:1px dashed var(--border); border-radius:12px;">
                        <span style="font-size:36px; display:block; margin-bottom:10px;">📏</span>
                        <h3 style="font-size:15px; font-weight:800; color:#fff; margin-bottom:6px;">Henüz Vücut Ölçüsü Eklenmemiş</h3>
                        <p style="font-size:12px; color:var(--text-secondary); max-width:380px; margin:0 auto 16px;">
                            Mezura ile Bel, Göğüs, Omuz ve Kol çevrelerinizi santimetre (cm) cinsinden kaydederek bölgesel yağ yakımı ve kas büyümesini somut olarak görebilirsiniz.
                        </p>
                        <button class="btn btn-gold" style="font-size:12px; padding:10px 18px; font-weight:800;" onclick="openMeasurementsModal()">
                            📏 İlk Vücut Ölçünüzü Ekleyin
                        </button>
                    </div>
                `;
                return;
            }}

            const latest = logs[0];
            const earliest = logs[logs.length - 1];

            const deltaWaist = (logs.length > 1 && latest.waist && earliest.waist) ? (latest.waist - earliest.waist).toFixed(1) : null;
            const deltaChest = (logs.length > 1 && latest.chest && earliest.chest) ? (latest.chest - earliest.chest).toFixed(1) : null;
            const deltaArms = (logs.length > 1 && latest.arms && earliest.arms) ? (latest.arms - earliest.arms).toFixed(1) : null;

            container.innerHTML = `
                <!-- MEASUREMENTS KPI CARDS -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:16px;">
                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">BEL ÇEVRESİ</div>
                        <div style="font-size:20px; font-weight:900; color:var(--gold); margin-top:2px;">${{latest.waist}} cm</div>
                        ${{deltaWaist !== null ? `
                            <div style="font-size:10.5px; font-weight:800; color:${{parseFloat(deltaWaist) <= 0 ? 'var(--green-success)' : 'var(--red-alert)'}}; margin-top:2px;">
                                ${{parseFloat(deltaWaist) > 0 ? '+' : ''}}${{deltaWaist}} cm ${{parseFloat(deltaWaist) <= 0 ? '📉' : '📈'}}
                            </div>
                        ` : '<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Göbek Hattı</div>'}}
                    </div>

                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">GÖĞÜS ÇEVRESİ</div>
                        <div style="font-size:20px; font-weight:900; color:var(--cyan); margin-top:2px;">${{latest.chest ? `${{latest.chest}} cm` : '-'}}</div>
                        ${{deltaChest !== null ? `
                            <div style="font-size:10.5px; font-weight:800; color:${{parseFloat(deltaChest) >= 0 ? 'var(--green-success)' : 'var(--text-secondary)'}}; margin-top:2px;">
                                ${{parseFloat(deltaChest) > 0 ? '+' : ''}}${{deltaChest}} cm
                            </div>
                        ` : '<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Üst Gövde</div>'}}
                    </div>

                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">OMUZ & KOL</div>
                        <div style="font-size:18px; font-weight:900; color:var(--green-success); margin-top:2px;">${{latest.shoulder || '-'}} / ${{latest.arms || '-'}} cm</div>
                        ${{deltaArms !== null ? `
                            <div style="font-size:10.5px; font-weight:800; color:${{parseFloat(deltaArms) >= 0 ? 'var(--green-success)' : 'var(--text-secondary)'}}; margin-top:2px;">
                                Kol: ${{parseFloat(deltaArms) > 0 ? '+' : ''}}${{deltaArms}} cm
                            </div>
                        ` : '<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Hipertrofi</div>'}}
                    </div>

                    <div class="analytics-kpi-card">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">BACAK & KALÇA</div>
                        <div style="font-size:18px; font-weight:900; color:#fff; margin-top:2px;">${{latest.thigh || '-'}} / ${{latest.hips || '-'}} cm</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">Alt Vücut</div>
                    </div>
                </div>

                <!-- MEASUREMENTS HISTORY LIST -->
                <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:14px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="font-size:13.5px; font-weight:800; color:#fff;">📋 Vücut Ölçüleri Geçmişi</h3>
                        <button class="btn btn-gold" style="font-size:11px; padding:4px 10px; font-weight:800;" onclick="openMeasurementsModal()">+ Yeni Ölçüm Ekle</button>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${{logs.map((m, idx) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:10px 12px; border-radius:8px; border-left:3px solid var(--cyan);">
                                <div>
                                    <div style="display:flex; align-items:center; gap:8px;">
                                        <strong style="font-size:14px; color:#fff;">Bel: ${{m.waist}} cm</strong>
                                        <span style="font-size:11px; color:var(--text-secondary);">📅 ${{escapeHTML(m.date)}}</span>
                                    </div>
                                    <div style="font-size:11.5px; color:#94a3b8; margin-top:3px; display:flex; gap:8px; flex-wrap:wrap;">
                                        ${{m.chest ? `<span>Göğüs: <strong>${{m.chest}} cm</strong></span>` : ''}}
                                        ${{m.shoulder ? `<span>Omuz: <strong>${{m.shoulder}} cm</strong></span>` : ''}}
                                        ${{m.arms ? `<span>Kol: <strong>${{m.arms}} cm</strong></span>` : ''}}
                                        ${{m.thigh ? `<span>Bacak: <strong>${{m.thigh}} cm</strong></span>` : ''}}
                                        ${{m.hips ? `<span>Kalça: <strong>${{m.hips}} cm</strong></span>` : ''}}
                                        ${{m.neck ? `<span>Boyun: <strong>${{m.neck}} cm</strong></span>` : ''}}
                                    </div>
                                    ${{m.notes ? `<div style="font-size:11px; color:var(--gold-light); margin-top:3px;">📝 ${{escapeHTML(m.notes)}}</div>` : ''}}
                                </div>
                                <div>
                                    <button class="btn-delete-log" onclick="deleteMeasurementsEntry('${{m.id}}')" title="Kaydı Sil">✕</button>
                                </div>
                            </div>
                        `).join('')}}
                    </div>
                </div>
            `;
        }}

        function renderCombinedCoachReport(container) {{
            const workoutLogs = getWorkoutLogs();
            const scaleLogs = getScaleLogs();
            const measLogs = getMeasurementsLogs();

            const totalVolume = workoutLogs.reduce((sum, l) => sum + (l.totalVolumeKg || 0), 0);
            const totalSets = workoutLogs.reduce((sum, l) => sum + (l.totalSetsCompleted || 0), 0);

            const hasScale = scaleLogs.length > 0;
            const hasMeas = measLogs.length > 0;

            const latestScale = hasScale ? scaleLogs[0] : null;
            const earliestScale = hasScale ? scaleLogs[scaleLogs.length - 1] : null;
            const deltaWeight = (hasScale && scaleLogs.length > 1) ? (latestScale.weight - earliestScale.weight).toFixed(1) : null;
            const deltaFat = (hasScale && scaleLogs.length > 1 && latestScale.bodyFat && earliestScale.bodyFat) ? (latestScale.bodyFat - earliestScale.bodyFat).toFixed(1) : null;

            const latestMeas = hasMeas ? measLogs[0] : null;
            const earliestMeas = hasMeas ? measLogs[measLogs.length - 1] : null;
            const deltaWaist = (hasMeas && measLogs.length > 1 && latestMeas.waist && earliestMeas.waist) ? (latestMeas.waist - earliestMeas.waist).toFixed(1) : null;

            container.innerHTML = `
                <div style="background:linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(56, 189, 248, 0.05)); border:1px solid rgba(245, 158, 11, 0.3); border-radius:14px; padding:18px; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                        <span style="font-size:26px;">🧠</span>
                        <div>
                            <h3 style="font-size:16px; font-weight:900; color:#fff;">Bütünleşik Koç Değerlendirmesi & Biyomekanik Karne</h3>
                            <p style="font-size:11.5px; color:var(--text-secondary);">Antrenman hacmi, kilo dalgalanması ve bel ölçümü korelasyonu</p>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-bottom:14px;">
                        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; text-align:center;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">TOPLAM KALDIRILAN</div>
                            <div style="font-size:17px; font-weight:900; color:var(--gold); margin-top:2px;">${{Math.round(totalVolume).toLocaleString('tr-TR')}} kg</div>
                            <div style="font-size:10px; color:var(--text-secondary);">${{workoutLogs.length}} Seans / ${{totalSets}} Set</div>
                        </div>

                        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; text-align:center;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">KİLO & YAĞ DEĞİŞİMİ</div>
                            <div style="font-size:17px; font-weight:900; color:var(--cyan); margin-top:2px;">
                                ${{deltaWeight !== null ? `${{parseFloat(deltaWeight) > 0 ? '+' : ''}}${{deltaWeight}} kg` : (latestScale ? `${{latestScale.weight}} kg` : '-')}}
                            </div>
                            <div style="font-size:10px; color:var(--text-secondary);">
                                ${{deltaFat !== null ? `Yağ: ${{parseFloat(deltaFat) > 0 ? '+' : ''}}${{deltaFat}}%` : (latestScale?.bodyFat ? `Yağ: %${{latestScale.bodyFat}}` : 'Tartı Takibi')}}
                            </div>
                        </div>

                        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; text-align:center;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">BEL İNCELMESİ</div>
                            <div style="font-size:17px; font-weight:900; color:var(--green-success); margin-top:2px;">
                                ${{deltaWaist !== null ? `${{parseFloat(deltaWaist) > 0 ? '+' : ''}}${{deltaWaist}} cm` : (latestMeas ? `${{latestMeas.waist}} cm` : '-')}}
                            </div>
                            <div style="font-size:10px; color:var(--text-secondary);">Viseral Yağ Göstergesi</div>
                        </div>
                    </div>

                    <div style="background:rgba(0,0,0,0.4); border-radius:10px; padding:14px; border-left:4px solid var(--gold);">
                        <h4 style="font-size:13px; font-weight:800; color:var(--gold-light); margin-bottom:6px;">📊 Bilimsel Değerlendirme & Gelecek Planı:</h4>
                        <p style="font-size:12px; color:#e2e8f0; line-height:1.6; margin-bottom:8px;">
                            ${{totalVolume > 0 ? `
                                Kaldırdığınız toplam <strong>${{Math.round(totalVolume).toLocaleString('tr-TR')}} kg</strong> mekanik tonaj, kas dokularında mikro-hasar ve protein sentezi uyarımı sağladı.
                            ` : 'Henüz antrenman tonajınız kaydedilmedi.'}}
                            ${{deltaWaist && parseFloat(deltaWaist) <= 0 ? `
                                Bel çevrenizdeki <strong>${{Math.abs(deltaWaist)}} cm</strong> daralma, kas kütlenizi korurken derin viseral yağ depolarını başarıyla tükettiğinizi kanıtlıyor.
                            ` : ''}}
                            ${{deltaWeight && parseFloat(deltaWeight) <= 0 ? `
                                Kilonuzdaki <strong>${{Math.abs(deltaWeight)}} kg</strong> düşüş, kontrollü bir kalori açığı ve yüksek nabızlı süpersetlerin sinerjisini yansıtıyor.
                            ` : ''}}
                        </p>
                        <div style="font-size:11.5px; color:#94a3b8; line-height:1.5;">
                            🎯 <strong>Sıradaki Adım (Progressive Overload):</strong> Güç artışınızı sürdürmek için ana bileşik hareketlerde (Squat, Saw Row, Strict Press) tekrar sayılarınızı koruyarak ağırlığı 1-2 kg artırmayı hedefleyin. Dinlenme sürelerinde kronometreyi 60 saniyenin altında tutarak kardiyometabolik verimi zirvede tutun.
                        </div>
                    </div>
                </div>
            `;
        }}

        // RESUME / VISIBILITY LISTENERS
        document.addEventListener('visibilitychange', () => {{
            if (document.visibilityState === 'visible') {{
                updateWorkoutTimerDisplay();
                updateTimerDisplay();
            }}
        }});
        window.addEventListener('pageshow', () => {{
            updateWorkoutTimerDisplay();
            updateTimerDisplay();
        }});

        // PWA SERVICE WORKER
        if ('serviceWorker' in navigator) {{
            window.addEventListener('load', () => {{
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('SW scope:', reg.scope))
                    .catch(err => console.log('SW err:', err));
            }});
        }}

        // INITIALIZE APPLICATION
        window.addEventListener('DOMContentLoaded', () => {{
            initAuthDatabase();
            syncAppViewState();
            const hasRestored = restoreActiveWorkoutStateFromStorage();
            if (hasRestored) {{
                switchTab('activeWorkoutTab');
            }} else {{
                renderActiveWorkout();
            }}
        }});
    </script>
</body>
</html>
"""

with open(INDEX_FILE, 'w', encoding='utf-8') as f:
    f.write(HTML_CONTENT)

with open(MOBIL_FILE, 'w', encoding='utf-8') as f:
    f.write(HTML_CONTENT)

print("Both index.html and salon_kilavuzu_mobil.html built successfully!")
