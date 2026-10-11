import os
import re
import shutil

print("Building new salon_kilavuzu.html...")

html_content = '''<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#090d16">
    <title>ÇELİK KODU | Dambıl Süperset Salon Kılavuzu & PWA</title>
    <style>
        :root {
            --bg-primary: #090d16;
            --bg-card: #131c2e;
            --bg-elevated: #1e293b;
            --gold: #f59e0b;
            --gold-light: #fde68a;
            --red-alert: #e11d48;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border: #25334d;
            --accent-green: #10b981;
            --accent-cyan: #38bdf8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.5;
            padding-bottom: 90px;
        }

        /* PRINT & PDF PERFECTION */
        @page {
            size: A4 portrait;
            margin: 7mm;
        }

        @media print {
            *, *::before, *::after {
                animation: none !important;
                transition: none !important;
            }
            body {
                background-color: #090d16 !important;
                color: #f8fafc !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                padding-bottom: 0 !important;
            }
            .tab-bar, .timer-card, .btn, .set-tracker {
                display: none !important;
            }
            .tab-content {
                display: block !important;
                opacity: 1 !important;
                animation: none !important;
            }
            .tab-content.active {
                opacity: 1 !important;
                animation: none !important;
            }
            .page-break {
                page-break-before: always !important;
                break-before: page !important;
            }
            .header {
                padding: 10px 10px 6px !important;
                margin-bottom: 6px !important;
            }
            .header h1 {
                font-size: 17px !important;
                margin-bottom: 2px !important;
            }
            .badge {
                font-size: 9px !important;
                padding: 1px 7px !important;
                margin-bottom: 2px !important;
            }
            .quote {
                font-size: 10px !important;
            }
            .container {
                max-width: 100% !important;
                padding: 0 !important;
            }
            .superset-header {
                page-break-after: avoid !important;
                break-after: avoid !important;
                margin: 8px 0 6px !important;
                padding: 5px 8px !important;
            }
            .exercise-card {
                background: #131c2e !important;
                border: 1px solid #25334d !important;
                color: #f8fafc !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                margin-bottom: 8px !important;
            }
            .exercise-header {
                background: #1e293b !important;
                padding: 6px 10px !important;
            }
            .exercise-name {
                color: #fff !important;
                font-size: 12.5px !important;
            }
            .exercise-body {
                padding: 8px 10px !important;
            }
            .exercise-img-wrap {
                background: transparent !important;
                margin-bottom: 6px !important;
            }
            .exercise-img-wrap img, .exercise-img-wrap svg {
                max-height: 140px !important;
            }
            .step-guide-box {
                background: rgba(0,0,0,0.3) !important;
                padding: 5px 8px !important;
                margin-bottom: 6px !important;
                font-size: 10px !important;
                line-height: 1.35 !important;
            }
            .step-item {
                margin-bottom: 2px !important;
            }
            .cue-box {
                font-size: 10px !important;
                line-height: 1.35 !important;
            }
            .cue-item {
                margin-bottom: 3px !important;
            }
            .cue-label, .step-badge {
                font-size: 8.5px !important;
                padding: 1px 4px !important;
            }
        }

        .header {
            background: linear-gradient(180deg, #182235 0%, var(--bg-primary) 100%);
            padding: 22px 16px 14px;
            text-align: center;
            border-bottom: 1px solid rgba(245, 158, 11, 0.25);
        }

        .badge {
            display: inline-block;
            background: rgba(245, 158, 11, 0.15);
            color: var(--gold);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 3px 10px;
            border-radius: 20px;
            border: 1px solid var(--gold);
            margin-bottom: 6px;
        }

        h1 {
            font-size: 21px;
            letter-spacing: 0.5px;
            color: #ffffff;
            margin-bottom: 4px;
            font-weight: 800;
        }

        .quote {
            font-size: 12px;
            color: var(--gold-light);
            font-style: italic;
        }

        /* STICKY TAB BAR */
        .tab-bar {
            display: flex;
            background: var(--bg-card);
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid var(--border);
            overflow-x: auto;
        }

        .tab-btn {
            flex: 1;
            padding: 12px 6px;
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            white-space: nowrap;
            transition: all 0.2s ease;
        }

        .tab-btn.active {
            color: var(--gold);
            border-bottom-color: var(--gold);
            background: rgba(245, 158, 11, 0.08);
        }

        .container {
            max-width: 720px;
            margin: 0 auto;
            padding: 12px;
        }

        /* PWA REST TIMER */
        .timer-card {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid var(--gold);
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 16px;
            text-align: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        }

        .timer-title {
            font-size: 11px;
            letter-spacing: 1.5px;
            color: var(--gold);
            font-weight: 800;
            text-transform: uppercase;
        }

        .timer-display {
            font-size: 42px;
            font-weight: 800;
            font-variant-numeric: tabular-nums;
            color: #ffffff;
            margin: 2px 0 10px;
            text-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
        }

        .timer-controls {
            display: flex;
            gap: 6px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            border: none;
            transition: transform 0.1s, opacity 0.2s;
        }

        .btn:active {
            transform: scale(0.95);
        }

        .btn-gold {
            background: var(--gold);
            color: #000;
        }

        .btn-outline {
            background: transparent;
            color: var(--text-secondary);
            border: 1px solid var(--border);
        }

        .superset-header {
            background: linear-gradient(90deg, rgba(245, 158, 11, 0.18) 0%, rgba(30, 41, 59, 0.6) 100%);
            border-left: 4px solid var(--gold);
            padding: 8px 12px;
            margin: 16px 0 10px;
            border-radius: 0 8px 8px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .superset-title {
            font-size: 13px;
            font-weight: 800;
            color: var(--gold-light);
        }

        .superset-badge {
            font-size: 10px;
            font-weight: 800;
            color: var(--gold);
            background: #090d16;
            padding: 3px 8px;
            border-radius: 4px;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .exercise-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .exercise-header {
            padding: 10px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-elevated);
            border-bottom: 1px solid var(--border);
        }

        .exercise-name {
            font-size: 14px;
            font-weight: 800;
            color: #fff;
        }

        .exercise-tag {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 4px;
            background: rgba(245, 158, 11, 0.15);
            color: var(--gold);
            border: 1px solid rgba(245, 158, 11, 0.4);
        }

        .exercise-body {
            padding: 12px;
        }

        /* SEQUENCE DIAGRAM CONTAINER */
        .exercise-img-wrap {
            text-align: center;
            background: #090d16;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 10px;
            border: 1px solid var(--border);
        }

        .exercise-img-wrap img {
            width: 100%;
            height: auto;
            max-height: 230px;
            object-fit: contain;
            display: block;
        }

        /* STEP-BY-STEP POSITION GUIDE BAR */
        .step-guide-box {
            background: rgba(0,0,0,0.25);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 8px;
            padding: 8px 10px;
            margin-bottom: 10px;
            font-size: 11px;
            line-height: 1.45;
        }

        .step-item {
            margin-bottom: 4px;
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .step-item:last-child {
            margin-bottom: 0;
        }

        .step-badge {
            font-size: 9.5px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 1px 5px;
            border-radius: 3px;
            white-space: nowrap;
        }

        .sb-start { background: rgba(56, 189, 248, 0.2); color: #7dd3fc; border: 1px solid #0284c7; }
        .sb-mid { background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid #b45309; }
        .sb-end { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid #059669; }
        .sb-extra { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 1px solid #7e22ce; }

        /* SET TRACKER CHECKBOXES */
        .set-tracker {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0,0,0,0.3);
            padding: 8px 10px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid rgba(255,255,255,0.06);
        }

        .set-tracker-title {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-secondary);
            margin-right: 4px;
        }

        .set-pill {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--bg-elevated);
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid var(--border);
            user-select: none;
        }

        .set-pill.done {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border-color: #10b981;
        }

        .set-pill input {
            cursor: pointer;
        }

        /* CUE BOX (COACH TALİMATLARI) */
        .cue-box {
            font-size: 11.5px;
            line-height: 1.45;
        }

        .cue-item {
            margin-bottom: 5px;
            display: flex;
            align-items: baseline;
            gap: 6px;
        }

        .cue-item:last-child {
            margin-bottom: 0;
        }

        .cue-label {
            font-weight: 800;
            white-space: nowrap;
            font-size: 9.5px;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
        }

        .lbl-target { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
        .lbl-stance { background: #334155; color: #f8fafc; border: 1px solid #475569; }
        .lbl-cue { background: #78350f; color: var(--gold-light); border: 1px solid #b45309; }
        .lbl-avoid { background: #881337; color: #fecdd3; border: 1px solid #be123c; }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>

    <header class="header">
        <div class="badge">LA FORJA • EL CÓDIGO DEL ACERO</div>
        <h1>ÇELİK KODU: DAMBIL SALON REHBERİ</h1>
        <p class="quote">"Sert kas kırılır. Çelik bükülür ve geri döner." (Adım Adım Pozisyon & Süperset PWA)</p>
    </header>

    <nav class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('day1')">🔴 GÜN 1: İTİŞ</button>
        <button class="tab-btn" onclick="switchTab('day2')">🔵 GÜN 2: ÇEKİŞ</button>
        <button class="tab-btn" onclick="switchTab('day3')">🟡 GÜN 3: KOMPLEKS</button>
        <button class="tab-btn" onclick="switchTab('info')">📈 PERİYODİZASYON & KİLO</button>
    </nav>

    <main class="container">

        <!-- PWA REST TIMER -->
        <div class="timer-card">
            <div class="timer-title" id="timerStatus">⏱️ SALON DİNLENME SAYAÇI (SESLİ & TİTREŞİMLİ)</div>
            <div class="timer-display" id="timeDisplay">01:15</div>
            <div class="timer-controls">
                <button class="btn btn-gold" id="startBtn" onclick="toggleTimer()">BAŞLAT</button>
                <button class="btn btn-outline" onclick="resetTimer(15)">15 SN (GEÇİŞ)</button>
                <button class="btn btn-outline" onclick="resetTimer(60)">60 SN</button>
                <button class="btn btn-outline" onclick="resetTimer(75)">75 SN (SÜPERSET)</button>
                <button class="btn btn-outline" onclick="resetTimer(90)">90 SN</button>
            </div>
        </div>

        <!-- ==================== TAB 1: GÜN 1 ==================== -->
        <div id="day1" class="tab-content active">

            <!-- ISINMA -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">🔥 1. Dinamik Isınma (5 Dk)</span>
                    <span class="exercise-tag">Mola Yok</span>
                </div>
                <div class="exercise-body cue-box">
                    <div class="cue-item"><span class="cue-label lbl-stance">Akış</span> World's Greatest Stretch (5/yön) ➔ Dambıl Halo (2x8) ➔ Deep Squat Pry (60 sn) ➔ Scapular Push-Up (10 tkr).</div>
                </div>
            </div>

            <!-- SÜPERSET A -->
            <div class="superset-header">
                <span class="superset-title">🛡️ SÜPERSET A: Güç & Bacak (12 Dk)</span>
                <span class="superset-badge">3 Set • A1 ➔ 15 sn ➔ A2 ➔ 75 sn Mola</span>
            </div>

            <!-- A1: Omuz Presi -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">A1: Çift Dambıl Omuz Presi</span>
                    <span class="exercise-tag">3 x 8-10 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g1_a1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <!-- 3-STEP SEQUENCE IMAGE -->
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_press.svg" alt="Çift Dambıl Omuz Presi Adımları">
                    </div>

                    <!-- STEP POSITION GUIDE -->
                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Dambıllar omuzda, dirsekler 45° önde, ayaklar kalça genişliğinde, karın ve glute taş gibi.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Dirsekleri dışa açmadan dikey hatta baş üstüne doğru patlayıcı presleme.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Kollar baş üstünde kilitli, kulaklar kolların arasında, omurga nötr kilitli.</div>
                    </div>

                    <!-- COACH CUES -->
                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Ön ve Yan Deltoid (Omuz), Triceps, Üst Göğüs, Karın.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Dik duruş, kaburgalar içeri kilitli, belde geriye eğilme sıfır.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> İtiş esnasında göbek deliğini omurgaya çek, tüm vücuttan güç al.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Bacaklardan yaylanmak ve beli arkaya bükmek (hiperlordoz).</div>
                    </div>
                </div>
            </div>

            <!-- A2: Goblet Squat -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">A2: Dikey Dambıl Goblet Squat</span>
                    <span class="exercise-tag">3 x 10-12 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g1_a2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 90)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_squat.svg" alt="Dikey Dambıl Goblet Squat Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Dambıl göğüs önünde dikey iki elle tutulu, ayaklar omuz hizasında, parmaklar 15° dışarı.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Kalçayı arkaya ve aşağı 3 sn kontrollü indir, dizler parmak uçları yönünde açılsın.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Dip noktada uyluklar yere paralel, dirsekler dizin içinde; topuktan iterek doğrul.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Quadriceps (Ön Bacak), Gluteus (Kalça), Adductor, Sırt.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Göğüs dimdik kalkık, bakışlar karşıda, tabanlar yere tam basılı.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Topuklara bas, 3 sn yavaş in, dipte 1 sn duraklayıp patlayarak kalk.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Topukların yerden kalkması ve sırtın öne bükülerek kamburlaşması.</div>
                    </div>
                </div>
            </div>

            <!-- PAGE BREAK FOR PDF -->
            <div class="page-break"></div>

            <!-- SÜPERSET B -->
            <div class="superset-header">
                <span class="superset-title">⚔️ SÜPERSET B: Hipertrofi & Güç (12 Dk)</span>
                <span class="superset-badge">3 Set • B1 ➔ 15 sn ➔ B2 ➔ 60 sn Mola</span>
            </div>

            <!-- B1: Hang Clean to Front Squat -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">B1: Dambıl Hang Clean to Front Squat</span>
                    <span class="exercise-tag">3 x 6-8 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g1_b1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_clean_squat.svg" alt="Hang Clean to Squat Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Dambıllar diz hizasında asılı, sırt 45° düz, kalça geride yaylanmış.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Patlayıcı İtiş</span> Kalçayı öne patlat ve omuzları silkerek dambılları yukarı ivmelendir.</div>
                        <div class="step-item"><span class="step-badge sb-extra">3. Rack Yakalama</span> Dambılları omuzda yumuşakça karşıla, dirsekler öne baksın.</div>
                        <div class="step-item"><span class="step-badge sb-end">4. Front Squat</span> Beklemeden derin squata in ve topuklardan patlayıcı şekilde doğrul.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Kalça Patlayıcılığı, Quadriceps, Sırt, Omuz, Biceps.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Omurga düz, boyun nötr, ayak tabanları yere sağlam yapışık.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Güç kollardan değil, kalça menteşesi ve kalça fırlatmasından gelmelidir.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Ağırlığı curl yaparak çekmek ve squatta göğsü düşürmek.</div>
                    </div>
                </div>
            </div>

            <!-- B2: Push-Up -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">B2: Hand-Release Deficit Push-Up</span>
                    <span class="exercise-tag">3 x 12-15 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g1_b2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_pushup.svg" alt="Push-Up Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Yüksek plank, eller omuz hizasında, baştan topuğa çelik gibi düz hat.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Göğüs ve karın yere tamamen iner, iki el 1 sn yerden 2 cm kaldırılır (momentumu sıfırla).</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Eller yere yapıştırılır, gövde tek parça tahta gibi patlayıcı şekilde yukarı itilir.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Göğüs (Pectoralis), Ön Omuz, Triceps, Karın (Plank).</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Boyun omurgayla aynı hizada, dirsekler gövdeye 45° açıda.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Yere indiğinde elleri kaldırarak esneme refleksini kır, her tekrara sıfırdan başla.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Belin aşağı sarkması (yılan gibi kalkmak) ve kalçanın havaya dikilmesi.</div>
                    </div>
                </div>
            </div>

            <!-- PAGE BREAK FOR PDF -->
            <div class="page-break"></div>

            <!-- SÜPERSET C -->
            <div class="superset-header">
                <span class="superset-title">🛡️ SÜPERSET C: Triceps & Karın Zırhı (9 Dk)</span>
                <span class="superset-badge">3 Set • C1 ➔ 10 sn ➔ C2 ➔ 45 sn Mola</span>
            </div>

            <!-- C1: Skull Crusher -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">C1: Çift Dambıl Alna Pres (Skull Crusher)</span>
                    <span class="exercise-tag">3 x 10-12 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g1_c1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 10)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 10)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_skull_crusher.svg" alt="Skull Crusher Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Sırtüstü sehpada/yerde yatış, dambıllar göğüs üstünde, dirsekler tavana dik kilitli.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Dirsekler sabit, sadece ön kol bükülerek dambıllar şakaklara doğru kontrollü iner.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Triceps sıkılarak tavana doğru tam kilit itiş yapılır, dirsekler açılmaz.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Triceps Brachii (Arka Kol - 3 Baş).</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Dirsekler omuz genişliğinde paralel, sırt ve ayak tabanları yere sağlam basılı.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Dirseklerin dışa açılmasına izin verme; ağırlığı şakaklara 3 sn negatifle indir.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Dirsekleri öne arkaya sallayarak omuzdan yardım almak.</div>
                    </div>
                </div>
            </div>

            <!-- C2: Plank Pull-Through -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">C2: Dambıl Plank Pull-Through</span>
                    <span class="exercise-tag">3 x 12 Çekiş (6 Sağ, 6 Sol)</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g1_c2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_plank_pull_through.svg" alt="Plank Pull-Through Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Dambıl gövdenin sağında, eller omuz altında yüksek plank pozisyonu.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Sol el gövdenin altından uzanıp dambılı kavrar, kalça sıfır oynamalıdır.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Dambıl sol tarafa sürüklenip bırakılır, el basılır; taraf değiştirilir.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Anti-Rotasyonel Core, Transversus Abdominis, Omuz Stabilizasyonu.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Ayaklar omuzdan biraz daha geniş (denge tabanı), karın ve kalça kilitli.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Çekiş esnasında kalçanın milimetrik bile dönmesine izin verme.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Kalçayı yukarı dikmek veya çekiş yönüne doğru vücudu çevirmek.</div>
                    </div>
                </div>
            </div>

            <!-- FINISHER -->
            <div class="superset-header">
                <span class="superset-title">⚡ BLOK D: The Anvil Finisher (5 Dk)</span>
                <span class="superset-badge">AMRAP 4 Dakika</span>
            </div>
            <div class="exercise-card">
                <div class="exercise-body cue-box">
                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">5 Push-Press (Sağ) + 5 Push-Press (Sol) + 5 Dambıl Üstünden Burpee</p>
                    <p style="color:var(--text-secondary);">4 dakika boyunca durmadan dön. Ritim ve nefes odaklı, sıfır mola!</p>
                </div>
            </div>
        </div>

        <!-- ==================== TAB 2: GÜN 2 ==================== -->
        <div id="day2" class="tab-content">
            <div class="page-break"></div>

            <!-- ISINMA -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">🔥 1. Dinamik Isınma (5 Dk)</span>
                    <span class="exercise-tag">Mola Yok</span>
                </div>
                <div class="exercise-body cue-box">
                    <div class="cue-item"><span class="cue-label lbl-stance">Akış</span> Inchworm (5) ➔ Dambıl Good Morning (10) ➔ Glute Bridge (12) ➔ Arm Circles (15).</div>
                </div>
            </div>

            <!-- SÜPERSET A -->
            <div class="superset-header">
                <span class="superset-title">🛡️ SÜPERSET A: Ağır Sırt & Hamstring (12 Dk)</span>
                <span class="superset-badge">3 Set • A1 ➔ 20 sn ➔ A2 ➔ 75 sn Mola</span>
            </div>

            <!-- A1: Saw Row -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">A1: Ağır Dambıl Testere Çekiş (Row)</span>
                    <span class="exercise-tag">3 x 8-10 Tekrar / Kol</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g2_a1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 20)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 20)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_row.svg" alt="Testere Çekiş Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Bir el/diz sehpada, sırt yere 45° düz, dambıl omuz altında serbest sarkar.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Dambılı tavana değil, geriye **kalça cebine** doğru yay çizerek çek.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Tepe noktada dirsek kaburgaya yapışık, lat kası 1 sn ezilir, gövde dönmez.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Latissimus Dorsi (Kanat), Rhomboids, Arka Omuz, Biceps.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Omuzlar yere paralel, boyun düz, omurgada rotasyon yok.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Kolun ucundaki eli kanca gibi düşün, çekişi dirsekten başlat.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Gövdeyi döndürerek ağırlığı savurmak veya kambur durmak.</div>
                    </div>
                </div>
            </div>

            <!-- A2: RDL -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">A2: Çift Dambıl Romanian Deadlift (RDL)</span>
                    <span class="exercise-tag">3 x 10-12 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g2_a2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 90)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_rdl.svg" alt="Romanian Deadlift Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Ayakta dimdik duruş, dambıllar uyluk önünde yapışık, kürek kemikleri geride.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Dizler hafif kırık sabit, kalçayı arkadaki duvara uzatır gibi geriye menteşele.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Kaval kemiği ortasında arka bacak gerilimi zirvedeyken kalçayı öne sıkarak doğrul.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Hamstrings (Arka Bacak), Gluteus (Kalça), Bel Doğrultucular.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Ağırlık topuklarda, omurga baştan kuyruk sokumuna tek parça çelik.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Dambıllar bacaklara yapışık sürtünerek inmeli; hareket kalçanın geriye gitmesidir.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Dizleri aşırı büküp squata dönüştürmek veya omurgayı kamburlaştırmak.</div>
                    </div>
                </div>
            </div>

            <!-- PAGE BREAK FOR PDF -->
            <div class="page-break"></div>

            <!-- SÜPERSET B -->
            <div class="superset-header">
                <span class="superset-title">⚔️ SÜPERSET B: Balistik & Sırt (11 Dk)</span>
                <span class="superset-badge">3 Set • B1 ➔ 15 sn ➔ B2 ➔ 60 sn Mola</span>
            </div>

            <!-- B1: DB Swing -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">B1: İki El Dambıl Swing</span>
                    <span class="exercise-tag">3 x 15-20 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g2_b1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_swing.svg" alt="Dambıl Swing Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Dambıl dik tutulur, üst diskinden iki elle kavranır, kalça arkaya menteşelenir.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Dambıl bacak arasından geçerken kalça yaylanır, göğüs kalkık tutulur.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Kalça öne patlayıcı şekilde kilitlenir, dambıl göğüs hizasına uçar; tepede tahta plank.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Gluteus, Hamstrings, Core, Kalp-Dolaşım Dayanıklılığı.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Ayaklar omuz genişliğinde, sırt düz, boyun nötr.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Kollar sadece birer halattır; dambılı fırlatan tek güç kalça vuruşudur.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Dambılı omuzlarla kaldırmak veya çömelme (squat) yapmak.</div>
                    </div>
                </div>
            </div>

            <!-- B2: Incline Row / Barfiks -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">B2: Barfiks VEYA Eğimli Çift Dambıl Çekiş</span>
                    <span class="exercise-tag">3 x 8-10 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g2_b2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_incline_row.svg" alt="Eğimli Sehpada Çekiş Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Göğüs 30-45° eğimli sehpada, kollar aşağı serbest sarkık nötr tutuşta.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Dirsekler geriye ve yukarı çekilir, kürek kemikleri birbirine kilitlenir.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Tepe noktada sırt/kanat kasları 1 sn sıkıştırılır, 3 sn'de kontrollü indirilir.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Rhomboids, Orta Sırt, Latissimus Dorsi, Arka Omuz.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Göğüs sehpaya tam temas eder, omurga nötr, boyun kasmadan karşıya bakar.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Sehpa beli tamamen izole eder; tüm yükü sırt kaslarına bindir.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Başını yukarı fırlatıp boynu kasmak veya omuzları kulaklara çekmek.</div>
                    </div>
                </div>
            </div>

            <!-- PAGE BREAK FOR PDF -->
            <div class="page-break"></div>

            <!-- SÜPERSET C -->
            <div class="superset-header">
                <span class="superset-title">🛡️ SÜPERSET C: Taşıma & Core (9 Dk)</span>
                <span class="superset-badge">3 Set • C1 ➔ 15 sn ➔ C2 ➔ 45 sn Mola</span>
            </div>

            <!-- C1: Windmill -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">C1: Dambıl Windmill (Yel Değirmeni)</span>
                    <span class="exercise-tag">3 x 6-8 Tekrar / Taraf</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g2_c1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_windmill.svg" alt="Dambıl Windmill Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Tek dambıl baş üstünde kilitli, ayaklar dambılın tersi yöne 45° açılı.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Gözler tavandaki dambılda, kalça yana itilerek serbest el ayağa doğru uzanır.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Dip noktada hamstring ve oblik gerilimi hissedilir, dik konuma dönülür.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Yan Karın (Oblikler), Omuz Stabilizasyonu (Rotator Cuff), Hamstrings.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Yukarıdaki kol kulağa yapışık ve kilitli, omurga yana esnek.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Ağırlığı taşıyan kol milim kıpırdamamalı; hareket kalçanın yana ötelenmesidir.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Gözleri dambıldan ayırmak ve yukarıdaki dirseği bükmek.</div>
                    </div>
                </div>
            </div>

            <!-- C2: Farmer's Walk -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">C2: Ağır Dambıl Çiftçi Yürüyüşü (Farmer's Walk)</span>
                    <span class="exercise-tag">3 x 35-40 Metre</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g2_c2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_farmers_walk.svg" alt="Farmer's Walk Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Ağır iki dambıl yanlarda, dik duruş, omuzlar geride ve aşağıda.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Küçük, sağlam ve ritmik adımlarla yalpalamadan dik yürüyüş.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Mesafe tamamlandığında dambılları squat formunda düz sırtla yere bırakış.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Trapezius, Kavrama Gücü (Ön Kol), Tüm Core, Kalça.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Göğüs kabarık, baş dik, omurga baştan ayağa çelik sütun gibi.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Dambılların bacaklara çarpıp sallanmasını önle; gövdeni kaya gibi tut.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Ağırlığı bırakırken beli büküp kamburlaşmak (squat ile bırak).</div>
                    </div>
                </div>
            </div>

            <!-- FINISHER -->
            <div class="superset-header">
                <span class="superset-title">⚡ BLOK D: Tabata Burnout (5 Dk)</span>
                <span class="superset-badge">8 Raunt • 20 sn İş / 10 sn Mola</span>
            </div>
            <div class="exercise-card">
                <div class="exercise-body cue-box">
                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">Tek Rauntlar: Dambıl Snatch | Çift Rauntlar: Mountain Climber</p>
                    <p style="color:var(--text-secondary);">Maksimum efor, patlayıcı tempo!</p>
                </div>
            </div>
        </div>

        <!-- ==================== TAB 3: GÜN 3 ==================== -->
        <div id="day3" class="tab-content">
            <div class="page-break"></div>

            <!-- ISINMA -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">🔥 1. Dinamik Isınma (5 Dk)</span>
                    <span class="exercise-tag">Mola Yok</span>
                </div>
                <div class="exercise-body cue-box">
                    <div class="cue-item"><span class="cue-label lbl-stance">Akış</span> Spiderman Lunge (5) ➔ Deadlift to High Pull (10) ➔ İp Atlama / Jumping Jacks (60 sn).</div>
                </div>
            </div>

            <!-- SÜPERSET A -->
            <div class="superset-header">
                <span class="superset-title">🛡️ SÜPERSET A: Balistik Snatch & Lunge (12 Dk)</span>
                <span class="superset-badge">3 Set • A1 ➔ 15 sn ➔ A2 ➔ 60 sn Mola</span>
            </div>

            <!-- A1: Snatch -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">A1: Tek Kol Dambıl Hang Snatch</span>
                    <span class="exercise-tag">3 x 8 Tekrar / Kol</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g3_a1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_snatch.svg" alt="Hang Snatch Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Dambıl diz hizasında asılı, sırt düz, kalça geride yaylanmış.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Kalçadan dikey patlama ve omuz silkme ile dambıl vücuda yakın düz hatta fırlar.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Baş üstünde dirsek bir anda kilitlenir, kol kulağın yanında dimdik karşılanır.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Bütün Vücut Patlayıcılığı, Trapez, Omuz, Kalça, Hamstrings.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Ayaklar omuz genişliğinde, dambıl vücuttan ayrılmaz (fermuar çeker gibi).</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Dambıl göğüs hizasına geldiğinde elin altından altına girip yumuşakça kilitle.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Ağırlığı öne doğru yay çizerek savurmak ve omuzu zorlamak.</div>
                    </div>
                </div>
            </div>

            <!-- A2: Walking Lunge -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">A2: Dambıl Yürüyüş Lunge (Walking Lunge)</span>
                    <span class="exercise-tag">3 x 16-20 Adım</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g3_a2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 3</div>
                    </div>
                    
                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_db_lunge.svg" alt="Walking Lunge Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Ayakta dik, ellerde iki dambıl yanlarda sarkık nötr tutuşta.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Öne büyük adım, arka diz yere 2-3 cm kalana dek dikey eksende iniş.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Ön topuktan güç alarak kalkılır ve diğer bacakla ileri adım atılır.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Quadriceps, Gluteus, Hamstrings, Denge & Ayak Bileği.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Gövde zemine 90° dik, adımlar dengeli genişlikte tren rayı gibi.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Yükselişte arka bacakla zıplamak yerine ön topukla yeri it.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Öndeki dizin ayak ucunu aşırı geçmesi veya gövdenin öne yatması.</div>
                    </div>
                </div>
            </div>

            <!-- PAGE BREAK FOR PDF -->
            <div class="page-break"></div>

            <!-- SÜPERSET B -->
            <div class="superset-header">
                <span class="superset-title">⚔️ SÜPERSET B: Dambıl Merdiven Kompleksi & Şınav (14 Dk)</span>
                <span class="superset-badge">4 Raunt (5-4-3-2) • B1 ➔ B2 ➔ 75 sn Mola</span>
            </div>

            <!-- B1: Escalera Merdiven Kompleksi -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">B1: La Forja Merdiven Kompleksi (Escalera)</span>
                    <span class="exercise-tag">5-4-3-2 Tekrar (Ağırlık Yere Konmaz!)</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g3_b1">
                        <span class="set-tracker-title">Rauntlar:</span>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> R1: 5 tkr</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> R2: 4 tkr</div>
                        <div class="set-pill" onclick="toggleSet(this, 15)"><input type="checkbox"> R3: 3 tkr</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> R4: 2 tkr</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_escalera.svg" alt="Merdiven Kompleksi Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Testere Çekiş</span> Düz sırtla kalça cebine patlayıcı çekiş.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Hang Clean</span> Kalça itişiyle omuza fırlatıp rack yakalama.</div>
                        <div class="step-item"><span class="step-badge sb-extra">3. Front Squat</span> Dambıl omuzdayken tam derinlikte çömelme.</div>
                        <div class="step-item"><span class="step-badge sb-end">4. Push-Press</span> Bacak kalkış momentumuyla dambılı baş üstüne presleme.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Bütün Vücut Fonksiyonel Güç & Laktik Asit Dayanıklılığı.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Ağırlık set bitene kadar asla yere bırakılmaz; tek kol bitince diğerine geçilir.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Raunt 1: 5'er, Raunt 2: 4'er, Raunt 3: 3'er, Raunt 4: 2'şer tekrar.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Hareketi aceleye getirip formdan ödün vermek; her hareketin kilitlenmesini tamamla.</div>
                    </div>
                </div>
            </div>

            <!-- B2: Diamond Push-Up -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">B2: Close-Grip / Diamond (Dar) Şınav</span>
                    <span class="exercise-tag">Her Kompleks Sonrası 8-10 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g3_b2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 75)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_diamond_pushup.svg" alt="Diamond Şınav Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Yüksek plank, eller göğüs altında birleşik elmas şekli, karın ve bacak tahta.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Dirsekler gövdeye yapışık şekilde göğüs ellere doğru 2 sn kontrollü iner.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Triceps ve iç göğüsle patlayıcı şekilde yukarı itilip tam kilitlenir.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Triceps (Arka Kol), Pectoralis (İç Göğüs), Ön Omuz.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Sırt cetvel gibi düz, boyun omurga hizasında, belde çökme sıfır.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Dirsekleri asla dışa açma; vücuduna yapışık geriye doğru bük.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Belin aşağı sarkması veya kalçanın havaya kalkması.</div>
                    </div>
                </div>
            </div>

            <!-- PAGE BREAK FOR PDF -->
            <div class="page-break"></div>

            <!-- SÜPERSET C -->
            <div class="superset-header">
                <span class="superset-title">🛡️ SÜPERSET C: Thruster & Core (8 Dk)</span>
                <span class="superset-badge">3 Set • C1 ➔ 10 sn ➔ C2 ➔ 45 sn Mola</span>
            </div>

            <!-- C1: Thruster -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">C1: Çift Dambıl Thruster (Squat + Pres)</span>
                    <span class="exercise-tag">3 x 8-10 Tekrar</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g3_c1">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 10)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 10)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_thruster.svg" alt="Thruster Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Dambıllar omuzlarda hazır, derin squata kontrollü çöküş.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Tabandan patlayıcı kalkış başlatılır, bacak momentumu dambıllara aktarılır.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Ayakta kilitlenirken dambıllar baş üstüne fırlar, tepede tam kilit.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Quadriceps, Kalça, Omuz, Triceps, Akciğer Kapasitesi.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Squat formunda göğüs dik, tepe noktada kulaklar kolların arasında.</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Squat ve pres iki ayrı hareket değildir; tek bir akıcı patlamadır.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Squattan tam kalkmadan erken preslemeye başlamak (bacak gücünü boşa harcar).</div>
                    </div>
                </div>
            </div>

            <!-- C2: Russian Twist -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">C2: Dambıl Rus Dönüşü (Russian Twist)</span>
                    <span class="exercise-tag">3 x 20 Dönüş (10 Sağ, 10 Sol)</span>
                </div>
                <div class="exercise-body">
                    <div class="set-tracker" data-exercise="g3_c2">
                        <span class="set-tracker-title">Setler:</span>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 1</div>
                        <div class="set-pill" onclick="toggleSet(this, 45)"><input type="checkbox"> Set 2</div>
                        <div class="set-pill" onclick="toggleSet(this, 60)"><input type="checkbox"> Set 3</div>
                    </div>

                    <div class="exercise-img-wrap">
                        <img src="assets/diagrams/seq_russian_twist.svg" alt="Russian Twist Adımları">
                    </div>

                    <div class="step-guide-box">
                        <div class="step-item"><span class="step-badge sb-start">1. Başlangıç</span> Yerde V-oturuşu, dizler bükük, dambıl göğüs önünde iki elle tutulu.</div>
                        <div class="step-item"><span class="step-badge sb-mid">2. Ara Geçiş</span> Gövde kontrollü şekilde sağa çevrilir, dambıl kalça yanına yaklaşır.</div>
                        <div class="step-item"><span class="step-badge sb-end">3. Son Bitiriş</span> Merkeze dönülüp sola çevrilir; rotasyon kollarla değil omurgayla yapılır.</div>
                    </div>

                    <div class="cue-box">
                        <div class="cue-item"><span class="cue-label lbl-target">Hedef Kas</span> Yan Karın (Oblikler), Rektus Abdominis, Derin Core.</div>
                        <div class="cue-item"><span class="cue-label lbl-stance">Duruş</span> Göğüs açık, sırt düz, ayaklar hafifçe yerden kesik (veya topuklar hafif temaslı).</div>
                        <div class="cue-item"><span class="cue-label lbl-cue">Püf Noktası</span> Dambılı yere hızlıca çarpmak yerine yavaş dönerek oblik kasını hisset.</div>
                        <div class="cue-item"><span class="cue-label lbl-avoid">Kaçın</span> Sadece kolları sallamak veya sırtı kamburlaştırıp boynu sıkıştırmak.</div>
                    </div>
                </div>
            </div>

            <!-- FINISHER -->
            <div class="superset-header">
                <span class="superset-title">⚡ BLOK D: The Iron Finisher (4 Dk)</span>
                <span class="superset-badge">EMOM 4 Dakika</span>
            </div>
            <div class="exercise-card">
                <div class="exercise-body cue-box">
                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">10 Dambıl Swing + 10 Metre Bear Crawl (Ayı Emeklemesi)</p>
                    <p style="color:var(--text-secondary);">Her dakika başında başla, kalanı dinlen (4 tur).</p>
                </div>
            </div>
        </div>

        <!-- ==================== TAB 4: PERİYODİZASYON & KİLO ==================== -->
        <div id="info" class="tab-content">
            <div class="page-break"></div>
            
            <!-- PERIODIZATION ARCHITECT 3+1 MODEL -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">📈 4 Haftalık Mikro-Döngü Modeli (3+1 Blok)</span>
                    <span class="exercise-tag">Plato Önleme</span>
                </div>
                <div class="exercise-body">
                    <p style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">
                        Merkezi sinir sistemini ve eklemleri koruyarak sürekli güç kazanmak için 3 yüklenme + 1 deload haftası esastır:
                    </p>
                    <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:8px;">
                        <tr style="border-bottom:1px solid var(--border); color:var(--gold);">
                            <th style="text-align:left; padding:5px 0;">Hafta</th>
                            <th style="text-align:left; padding:5px 0;">Aşama</th>
                            <th style="text-align:left; padding:5px 0;">Hacim / Şema</th>
                            <th style="text-align:left; padding:5px 0;">RPE</th>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:5px 0;"><strong>Hafta 1</strong></td>
                            <td>Temel & Uyum</td>
                            <td>3 set x 8-10 tkr</td>
                            <td>RPE 7.5</td>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:5px 0;"><strong>Hafta 2</strong></td>
                            <td>Kademeli Yüklenme</td>
                            <td>3-4 set x 10 tkr (+1-2 kg)</td>
                            <td>RPE 8.0</td>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:5px 0;"><strong>Hafta 3</strong></td>
                            <td>Zirve (Peak)</td>
                            <td>4 set x 10-12 tkr</td>
                            <td>RPE 8.5-9</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0; color:#34d399;"><strong>Hafta 4</strong></td>
                            <td style="color:#34d399;">Stratejik Deload</td>
                            <td style="color:#34d399;">2 set x 8 tkr (Ağırlık -%20)</td>
                            <td style="color:#34d399;">RPE 6.0</td>
                        </tr>
                    </table>
                    <div class="cue-item"><span class="cue-label lbl-cue">2-for-2 Kuralı</span> Son sette 2 tekrar fazlasını 2 seans üst üste kusursuz çıkarırsan, ağırlığı +1-2 kg artır!</div>
                </div>
            </div>

            <!-- DAMBIL KİLO SEÇİMİ -->
            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">⚖️ Salonda Dambıl Ağırlık Seçimi</span>
                </div>
                <div class="exercise-body">
                    <table style="width:100%; border-collapse:collapse; font-size:12px;">
                        <tr style="border-bottom:1px solid var(--border); color:var(--gold);">
                            <th style="text-align:left; padding:5px 0;">Hareket</th>
                            <th style="text-align:left; padding:5px 0;">Erkekler</th>
                            <th style="text-align:left; padding:5px 0;">Kadınlar</th>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:5px 0;">Omuz Presi</td>
                            <td>10 - 16 kg (çift)</td>
                            <td>4 - 8 kg (çift)</td>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:5px 0;">Goblet Squat & RDL</td>
                            <td>14 - 24 kg</td>
                            <td>8 - 16 kg</td>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:5px 0;">Testere Çekiş (Row)</td>
                            <td>14 - 24 kg</td>
                            <td>7 - 14 kg</td>
                        </tr>
                        <tr style="border-bottom:1px solid #1e293b;">
                            <td style="padding:5px 0;">Dambıl Swing</td>
                            <td>12 - 20 kg</td>
                            <td>6 - 12 kg</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;">Merdiven Kompleksi</td>
                            <td>10 - 16 kg (tek)</td>
                            <td>4 - 8 kg (tek)</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="exercise-card">
                <div class="exercise-header">
                    <span class="exercise-name">🛡️ 3 Kırmızı Çizgi Emniyet Protokolü</span>
                </div>
                <div class="exercise-body cue-box">
                    <div class="cue-item"><span class="cue-label lbl-avoid">1. Bel Konuşursa</span> Menteşe kaçmış, omura yük binmiştir. Anında seti bırak.</div>
                    <div class="cue-item"><span class="cue-label lbl-avoid">2. Omuz Sıkışırsa</span> Ağırlığı 45° açıyla presle, asla tam yana 90° açma.</div>
                    <div class="cue-item"><span class="cue-label lbl-avoid">3. Form Bozulursa</span> Son tekrar ilkine benzemiyorsa seti anında tamamla.</div>
                </div>
            </div>
        </div>

    </main>

    <script>
        // TAB SWITCHING
        function switchTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            event.currentTarget.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // WEB AUDIO API SYNTHESIZER
        function playAlertSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } catch (e) {
                console.warn("Ses calinamadi:", e);
            }
        }

        // REST TIMER
        let timerSeconds = 75;
        let timerInterval = null;
        let isRunning = false;
        let targetEndTime = 0;

        function updateDisplay(secs) {
            const mins = Math.floor(secs / 60);
            const remaining = secs % 60;
            document.getElementById('timeDisplay').innerText = 
                (mins < 10 ? '0' : '') + mins + ':' + (remaining < 10 ? '0' : '') + remaining;
        }

        function toggleTimer() {
            const startBtn = document.getElementById('startBtn');
            if (isRunning) {
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.innerText = "DEVAM ET";
                startBtn.classList.remove('btn-outline');
                startBtn.classList.add('btn-gold');
            } else {
                isRunning = true;
                targetEndTime = Date.now() + timerSeconds * 1000;
                startBtn.innerText = "DURAKLAT";
                startBtn.classList.remove('btn-gold');
                startBtn.classList.add('btn-outline');

                timerInterval = setInterval(() => {
                    const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
                    timerSeconds = remaining;
                    updateDisplay(remaining);

                    if (remaining <= 0) {
                        clearInterval(timerInterval);
                        isRunning = false;
                        startBtn.innerText = "BİTTİ";
                        startBtn.classList.remove('btn-outline');
                        startBtn.classList.add('btn-gold');
                        playAlertSound();
                        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                    }
                }, 250);
            }
        }

        function resetTimer(secs) {
            clearInterval(timerInterval);
            isRunning = false;
            timerSeconds = secs;
            updateDisplay(secs);
            const startBtn = document.getElementById('startBtn');
            startBtn.innerText = "BAŞLAT";
            startBtn.classList.remove('btn-outline');
            startBtn.classList.add('btn-gold');
            toggleTimer();
        }

        // SET TRACKER
        function toggleSet(pillElement, restSecs) {
            const checkbox = pillElement.querySelector('input[type="checkbox"]');
            if (event.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            if (checkbox.checked) {
                pillElement.classList.add('done');
                resetTimer(restSecs);
            } else {
                pillElement.classList.remove('done');
            }
            saveTrackerState();
        }

        function saveTrackerState() {
            const state = {};
            document.querySelectorAll('.set-tracker').forEach(tracker => {
                const ex = tracker.dataset.exercise;
                const checked = [];
                tracker.querySelectorAll('input[type="checkbox"]').forEach((cb, idx) => {
                    if (cb.checked) checked.push(idx);
                });
                state[ex] = checked;
            });
            localStorage.setItem('celik_kodu_workout_state', JSON.stringify(state));
        }

        function loadTrackerState() {
            try {
                const saved = localStorage.getItem('celik_kodu_workout_state');
                if (!saved) return;
                const state = JSON.parse(saved);
                document.querySelectorAll('.set-tracker').forEach(tracker => {
                    const ex = tracker.dataset.exercise;
                    if (state[ex]) {
                        tracker.querySelectorAll('.set-pill').forEach((pill, idx) => {
                            const cb = pill.querySelector('input');
                            if (state[ex].includes(idx)) {
                                cb.checked = true;
                                pill.classList.add('done');
                            }
                        });
                    }
                });
            } catch(e) {}
        }

        updateDisplay(75);
        loadTrackerState();
    </script>
</body>
</html>
'''

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR) if os.path.basename(SCRIPT_DIR) == 'scripts' else SCRIPT_DIR

out_html = os.path.join(PROJECT_ROOT, 'salon_kilavuzu.html')
out_mobil = os.path.join(PROJECT_ROOT, 'salon_kilavuzu_mobil.html')

with open(out_html, 'w', encoding='utf-8') as f:
    f.write(html_content)
print(f"Saved {out_html}")

# Create standalone self-contained salon_kilavuzu_mobil.html with inlined SVGs!
print(f"Creating {out_mobil} with inlined SVGs...")
mobil_content = html_content

# Replace img src="assets/diagrams/..." with direct inline SVG markup
svg_pattern = re.compile(r'<div class="exercise-img-wrap">\s*<img src="(assets/diagrams/[^"]+)"[^>]*>\s*</div>')

def replace_svg(match):
    rel_path = match.group(1)
    full_path = os.path.join(PROJECT_ROOT, rel_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as sf:
            svg_text = sf.read()
            svg_text = re.sub(r'<\?xml[^>]*\?>', '', svg_text).strip()
            return f'<div class="exercise-img-wrap">{svg_text}</div>'
    return match.group(0)

mobil_content = svg_pattern.sub(replace_svg, mobil_content)

with open(out_mobil, 'w', encoding='utf-8') as f:
    f.write(mobil_content)
print(f"Saved {out_mobil} (self-contained with vector graphics)")

