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
        }}
        .timer-display {{
            font-family: monospace;
            font-size: 26px;
            font-weight: 900;
            color: var(--gold);
            letter-spacing: 1px;
        }}
        .timer-controls {{
            display: flex;
            gap: 6px;
        }}
        .btn-timer {{
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            color: #fff;
            font-size: 11.5px;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
        }}
        .btn-timer:hover {{
            border-color: var(--gold);
        }}

        /* SET CHECKBOXES (PILLS) */
        .set-pills-row {{
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
        }}
        .set-pill {{
            background: var(--bg-elevated);
            border: 1.5px solid var(--border);
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 800;
            color: var(--text-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            user-select: none;
        }}
        .set-pill.done {{
            background: rgba(245, 158, 11, 0.2);
            border-color: var(--gold);
            color: #fff;
            box-shadow: 0 0 10px var(--gold-glow);
        }}
        .set-pill input[type="checkbox"] {{
            accent-color: var(--gold);
            width: 14px;
            height: 14px;
            pointer-events: none;
        }}

        /* WEIGHT INPUT INSIDE EX CARD */
        .weight-input-wrap {{
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 2px 6px;
            margin-left: 8px;
        }}
        .weight-input-wrap input {{
            width: 44px;
            background: transparent;
            border: none;
            color: #fff;
            font-weight: 800;
            font-size: 13px;
            text-align: center;
            outline: none;
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
                    <span>⚡ Program Oluştur</span>
                </button>
                <button class="tab-btn" onclick="switchTab('activeWorkoutTab')" id="tabBtnActiveWorkout">
                    <span>🏋️ Canlı Antrenman</span>
                </button>
                <button class="tab-btn" onclick="switchTab('libraryTab')">
                    <span>📚 Programlarım</span>
                </button>
                <button class="tab-btn" onclick="switchTab('historyTab')">
                    <span>📊 Günlük</span>
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
                <!-- REST TIMER STICKY BAR -->
                <div class="live-tracker-bar">
                    <div>
                        <div style="font-size:10px; font-weight:800; color:var(--text-secondary); text-transform:uppercase;">⏱️ Dinlenme Sayacı</div>
                        <div class="timer-display" id="timerDisplay">00:45</div>
                    </div>
                    <div class="timer-controls">
                        <button class="btn-timer" onclick="setTimerSecs(30)">30s</button>
                        <button class="btn-timer" onclick="setTimerSecs(45)">45s</button>
                        <button class="btn-timer" onclick="setTimerSecs(60)">60s</button>
                        <button class="btn-timer" onclick="setTimerSecs(90)">90s</button>
                        <button class="btn-timer" onclick="toggleTimer()" id="btnPlayPauseTimer" style="background:var(--gold); color:#090d16; font-weight:900;">▶ Başlat</button>
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

            <!-- ==================== TAB 5: ATHLETE PROFILE & SETTINGS ==================== -->
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
        <div class="modal-box">
            <div class="modal-header">
                <span class="modal-title">🏁 Antrenmanı Tamamla & Kaydet</span>
                <button class="modal-close" onclick="closeCompleteModal()">✕</button>
            </div>

            <div class="form-group">
                <label class="form-label">Antrenman Programı</label>
                <input type="text" id="logProgramName" class="form-input" readonly>
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

            <button class="btn btn-gold" style="width:100%; padding:14px; font-weight:900;" onclick="saveCompletedWorkout()">
                ✅ GÜNLÜĞE KAYDET & SEANSI BİTİR
            </button>
        </div>
    </div>

    <!-- ==================== JAVASCRIPT APPLICATION CORE ==================== -->
    <script>
        // EXERCISE DATABASE
        const EXERCISES_DB = {EXERCISES_JSON};

        // GLOBAL APP STATE
        let selectedSplit = 'full_body';
        let selectedEquipments = ['dumbbell', 'kettlebell', 'bodyweight'];
        let currentGeneratedWorkout = null;
        let activeWorkoutSession = null;
        let activeWorkoutExerciseWeights = {{}};

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
                        ${{renderSingleExerciseCard(ex1, `${{blockLetter}}1`, w.scheme, weights)}}
                        ${{ex2 ? renderSingleExerciseCard(ex2, `${{blockLetter}}2`, w.scheme, weights) : ''}}
                    `;
                }}
            }} else {{
                w.exercises.forEach((ex, idx) => {{
                    blocksHtml += renderSingleExerciseCard(ex, `${{idx + 1}}`, w.scheme, weights);
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

        function renderSingleExerciseCard(ex, label, scheme, weights) {{
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

                    <div style="text-align:right;">
                        <button class="btn-swap-ex" onclick="swapSingleExercise('${{ex.id}}')">
                            🔄 Başka Hareket Ver
                        </button>
                    </div>
                </div>
            `;
        }}

        function swapSingleExercise(currentExId) {{
            if (!currentGeneratedWorkout) return;
            const exIndex = currentGeneratedWorkout.exercises.findIndex(e => e.id === currentExId);
            if (exIndex === -1) return;

            const currentEx = currentGeneratedWorkout.exercises[exIndex];
            const usedIds = currentGeneratedWorkout.exercises.map(e => e.id);

            // Pool of alternatives in the same category & available equipments
            const pool = filterExercises(currentEx.category, usedIds);
            let replacement = pickRandom(pool);
            if (!replacement) {{
                // fallback to any exercise with active equipment
                const fallback = EXERCISES_DB.filter(e => selectedEquipments.includes(e.equipment) && !usedIds.includes(e.id));
                replacement = pickRandom(fallback);
            }}

            if (replacement) {{
                currentGeneratedWorkout.exercises[exIndex] = replacement;
                renderGeneratedWorkout();
            }} else {{
                alert("Seçili ekipman havuzunda bu kas grubu için başka alternatif bulunamadı.");
            }}
        }}

        // ==================== ACTIVE LIVE WORKOUT TRACKER ====================
        function startActiveWorkoutFromGenerated() {{
            if (!currentGeneratedWorkout) return;
            activeWorkoutSession = JSON.parse(JSON.stringify(currentGeneratedWorkout));
            activeWorkoutExerciseWeights = {{}};

            renderActiveWorkout();
            switchTab('activeWorkoutTab');
            resetTimer(activeWorkoutSession.scheme.rest || 45);
            playAlertSound();
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
                    const defaultW = ex.weightKey && weights[ex.weightKey] ? weights[ex.weightKey] : '';
                    return `
                        <div class="ex-card" data-exercise-id="${{ex.id}}">
                            <div class="ex-card-header">
                                <div class="ex-name">
                                    <span style="color:var(--gold); font-weight:900;">${{idx + 1}}.</span>
                                    <span>${{escapeHTML(ex.name)}}</span>
                                </div>
                                <div style="display:flex; align-items:center;">
                                    <span style="font-size:11px; color:var(--text-secondary);">Kilo:</span>
                                    <div class="weight-input-wrap">
                                        <input type="number" value="${{defaultW}}" placeholder="kg" onchange="updateExerciseWeight('${{ex.id}}', this.value)">
                                        <span style="font-size:11px; color:var(--text-secondary);">kg</span>
                                    </div>
                                </div>
                            </div>

                            <div style="font-size:12px; color:var(--gold-light); margin-bottom:8px;">
                                🎯 Hedef: ${{s.scheme.sets}} Set x ${{s.scheme.reps}} Tekrar
                            </div>

                            <div class="set-pills-row">
                                ${{Array.from({{ length: s.scheme.sets }}).map((_, setIdx) => `
                                    <div class="set-pill" onclick="toggleSetPill(this, ${{s.scheme.rest}})">
                                        <input type="checkbox">
                                        <span>Set ${{setIdx + 1}}</span>
                                    </div>
                                `).join('')}}
                            </div>
                        </div>
                    `;
                }}).join('')}}

                <div style="text-align:center; margin:30px 0;">
                    <button class="btn btn-gold" style="padding:16px 28px; font-size:15px;" onclick="openCompleteModal()">
                        🏁 ANTRENMANI TAMAMLA & GÜNLÜĞE KAYDET
                    </button>
                </div>
            `;
        }}

        function toggleSetPill(pill, restSecs) {{
            const cb = pill.querySelector('input[type="checkbox"]');
            cb.checked = !cb.checked;
            pill.classList.toggle('done', cb.checked);

            if (cb.checked) {{
                resetTimer(restSecs);
                startTimer();
                playAlertSound();
                if (navigator.vibrate) navigator.vibrate(80);
            }}
        }}

        function updateExerciseWeight(exId, val) {{
            activeWorkoutExerciseWeights[exId] = val;
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
        function openCompleteModal() {{
            if (!activeWorkoutSession) {{
                alert("Aktif bir antrenman bulunmuyor.");
                return;
            }}
            document.getElementById('logProgramName').value = activeWorkoutSession.title;
            document.getElementById('logDuration').value = activeWorkoutSession.duration || 45;
            document.getElementById('completeModal').classList.add('active');
        }}

        function closeCompleteModal() {{
            document.getElementById('completeModal').classList.remove('active');
        }}

        function saveCompletedWorkout() {{
            const programName = document.getElementById('logProgramName').value;
            const duration = document.getElementById('logDuration').value;
            const rpe = document.getElementById('logRpe').value;
            const notes = document.getElementById('logNotes').value;

            const newLog = {{
                id: 'log_' + Date.now(),
                date: new Date().toISOString().split('T')[0],
                program: programName,
                duration: duration,
                rpe: rpe,
                notes: notes,
                timestamp: Date.now()
            }};

            const logs = getWorkoutLogs();
            logs.unshift(newLog);
            setWorkoutLogs(logs);

            closeCompleteModal();
            activeWorkoutSession = null;
            renderActiveWorkout();
            switchTab('historyTab');
            alert("🎉 Tebrikler! Antrenman başarıyla günlüğe kaydedildi.");
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

        function renderHistory() {{
            const logs = getWorkoutLogs();
            const container = document.getElementById('logHistoryContainer');
            if (!container) return;

            const total = logs.length;
            const streak = calculateStreakForLogs(logs);

            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
            startOfWeek.setHours(0,0,0,0);
            const thisWeek = logs.filter(l => new Date(l.date) >= startOfWeek).length;

            if (document.getElementById('statTotalWorkouts')) document.getElementById('statTotalWorkouts').innerText = total;
            if (document.getElementById('statWeekWorkouts')) document.getElementById('statWeekWorkouts').innerText = `${{thisWeek}}/3`;
            if (document.getElementById('statStreak')) document.getElementById('statStreak').innerText = streak;

            if (logs.length === 0) {{
                container.innerHTML = `
                    <div style="background:var(--bg-surface); padding:20px; text-align:center; border:1px dashed var(--border); border-radius:10px; color:var(--text-secondary); font-size:12px;">
                        Henüz kayıtlı antrenman seansınız yok. Bugün ilk antrenmanınızı yapıp kaydedin! 🚀
                    </div>
                `;
                return;
            }}

            container.innerHTML = logs.map(l => `
                <div class="log-history-card">
                    <div class="log-card-header">
                        <span class="log-date">📅 ${{escapeHTML(l.date)}} (${{l.duration}} Dk)</span>
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span class="ex-badge badge-equip">${{escapeHTML(l.rpe.split(' ')[0] + ' ' + l.rpe.split(' ')[1])}}</span>
                            <button class="btn-delete-log" onclick="deleteLog('${{l.id}}')">✕</button>
                        </div>
                    </div>
                    <div style="font-size:13px; font-weight:800; color:var(--gold-light); margin-bottom:4px;">
                        ${{escapeHTML(l.program)}}
                    </div>
                    ${{l.notes ? `<div style="font-size:11.5px; color:var(--text-secondary); background:rgba(0,0,0,0.25); padding:6px 10px; border-radius:6px; margin-top:4px;">${{escapeHTML(l.notes)}}</div>` : ''}}
                </div>
            `).join('');
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
            renderActiveWorkout();
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
