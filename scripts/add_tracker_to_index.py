#!/usr/bin/env python3
import re
import os

HTML_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/index.html"

with open(HTML_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update <head> to add PWA manifest & apple icons
head_pwa = """    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/diagrams/seq_db_press.svg">
    <meta name="apple-mobile-web-app-title" content="Çelik Kodu">
    <meta name="application-name" content="Çelik Kodu">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">"""

if '<link rel="manifest"' not in content:
    content = content.replace('<meta name="apple-mobile-web-app-capable" content="yes">', head_pwa, 1)

# 2. Add Tracker CSS
tracker_css = """
        /* WORKOUT TRACKER & STATS */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 16px;
        }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px 8px;
            text-align: center;
        }
        .stat-val {
            font-size: 20px;
            font-weight: 800;
            color: var(--gold);
        }
        .stat-lbl {
            font-size: 10.5px;
            color: var(--text-secondary);
            font-weight: 600;
            margin-top: 2px;
        }
        .log-form-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 18px;
        }
        .form-group {
            margin-bottom: 12px;
        }
        .form-label {
            display: block;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--gold-light);
            margin-bottom: 5px;
        }
        .form-input, .form-select, .form-textarea {
            width: 100%;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 9px 12px;
            color: #fff;
            font-size: 13px;
            box-sizing: border-box;
            outline: none;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
            border-color: var(--gold);
        }
        .log-history-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
            position: relative;
        }
        .log-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        .log-date {
            font-size: 12px;
            font-weight: 700;
            color: #fff;
        }
        .log-badges {
            display: flex;
            gap: 6px;
        }
        .badge-sub {
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.4);
        }
        .badge-rpe {
            font-size: 9.5px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .log-notes {
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.4;
            white-space: pre-wrap;
            background: rgba(0,0,0,0.25);
            padding: 8px;
            border-radius: 6px;
            margin-top: 6px;
        }
        .btn-delete {
            background: none;
            border: none;
            color: #ef4444;
            cursor: pointer;
            font-size: 13px;
            padding: 2px 6px;
            opacity: 0.8;
        }
        .btn-delete:hover {
            opacity: 1;
        }
"""

if '.stats-grid' not in content:
    content = content.replace('/* CUE BOX (COACH TALİMATLARI) */', tracker_css + '\n        /* CUE BOX (COACH TALİMATLARI) */', 1)

# 3. Update tab bar
old_tab_bar = """    <nav class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('day1')">🔴 GÜN 1: İTİŞ</button>
        <button class="tab-btn" onclick="switchTab('day2')">🔵 GÜN 2: ÇEKİŞ</button>
        <button class="tab-btn" onclick="switchTab('day3')">🟡 GÜN 3: KOMPLEKS</button>
        <button class="tab-btn" onclick="switchTab('info')">📈 PERİYODİZASYON & KİLO</button>
    </nav>"""

new_tab_bar = """    <nav class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('day1')">🔴 GÜN 1</button>
        <button class="tab-btn" onclick="switchTab('day2')">🔵 GÜN 2</button>
        <button class="tab-btn" onclick="switchTab('day3')">🟡 GÜN 3</button>
        <button class="tab-btn" onclick="switchTab('trackerTab')">📊 GÜNLÜK & TAKİP</button>
        <button class="tab-btn" onclick="switchTab('info')">ℹ️ REHBER</button>
    </nav>"""

content = content.replace(old_tab_bar, new_tab_bar)

# 4. Add "Antrenmanı Kaydet" buttons at end of Day 1, 2, 3
btn_day1 = """
            <div style="margin: 20px 0 10px; text-align: center;">
                <button class="btn btn-gold" style="width: 100%; padding: 14px; font-size: 13px; font-weight: 800; border-radius: 10px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);" onclick="quickLogWorkout('Gün 1: Üst İtiş & Bacak')">
                    💾 BUGÜNKÜ GÜN 1 ANTRENMANINI GÜNLÜĞE KAYDET
                </button>
            </div>
        </div>"""

btn_day2 = """
            <div style="margin: 20px 0 10px; text-align: center;">
                <button class="btn btn-gold" style="width: 100%; padding: 14px; font-size: 13px; font-weight: 800; border-radius: 10px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);" onclick="quickLogWorkout('Gün 2: Çekiş & Arka Zincir')">
                    💾 BUGÜNKÜ GÜN 2 ANTRENMANINI GÜNLÜĞE KAYDET
                </button>
            </div>
        </div>"""

btn_day3 = """
            <div style="margin: 20px 0 10px; text-align: center;">
                <button class="btn btn-gold" style="width: 100%; padding: 14px; font-size: 13px; font-weight: 800; border-radius: 10px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.35);" onclick="quickLogWorkout('Gün 3: Tam Vücut Kompleks')">
                    💾 BUGÜNKÜ GÜN 3 ANTRENMANINI GÜNLÜĞE KAYDET
                </button>
            </div>
        </div>"""

if 'quickLogWorkout' not in content:
    # Day 1 replacement
    content = content.replace('            <!-- FINISHER -->\n            <div class="superset-header">\n                <span class="superset-title">⚡ BLOK D: The Anvil Finisher (5 Dk)</span>\n                <span class="superset-badge">AMRAP 4 Dakika</span>\n            </div>\n            <div class="exercise-card">\n                <div class="exercise-body cue-box">\n                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">5 Push-Press (Sağ) + 5 Push-Press (Sol) + 5 Dambıl Üstünden Burpee</p>\n                    <p style="color:var(--text-secondary);">4 dakika boyunca durmadan dön. Ritim ve nefes odaklı, sıfır mola!</p>\n                </div>\n            </div>\n        </div>', '            <!-- FINISHER -->\n            <div class="superset-header">\n                <span class="superset-title">⚡ BLOK D: The Anvil Finisher (5 Dk)</span>\n                <span class="superset-badge">AMRAP 4 Dakika</span>\n            </div>\n            <div class="exercise-card">\n                <div class="exercise-body cue-box">\n                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">5 Push-Press (Sağ) + 5 Push-Press (Sol) + 5 Dambıl Üstünden Burpee</p>\n                    <p style="color:var(--text-secondary);">4 dakika boyunca durmadan dön. Ritim ve nefes odaklı, sıfır mola!</p>\n                </div>\n            </div>' + btn_day1)
    
    # Day 2 replacement
    content = content.replace('            <!-- FINISHER -->\n            <div class="superset-header">\n                <span class="superset-title">⚡ BLOK D: Tabata Burnout (5 Dk)</span>\n                <span class="superset-badge">8 Raunt • 20 sn İş / 10 sn Mola</span>\n            </div>\n            <div class="exercise-card">\n                <div class="exercise-body cue-box">\n                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">Tek Rauntlar: Dambıl Snatch | Çift Rauntlar: Mountain Climber</p>\n                    <p style="color:var(--text-secondary);">Maksimum efor, patlayıcı tempo!</p>\n                </div>\n            </div>\n        </div>', '            <!-- FINISHER -->\n            <div class="superset-header">\n                <span class="superset-title">⚡ BLOK D: Tabata Burnout (5 Dk)</span>\n                <span class="superset-badge">8 Raunt • 20 sn İş / 10 sn Mola</span>\n            </div>\n            <div class="exercise-card">\n                <div class="exercise-body cue-box">\n                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">Tek Rauntlar: Dambıl Snatch | Çift Rauntlar: Mountain Climber</p>\n                    <p style="color:var(--text-secondary);">Maksimum efor, patlayıcı tempo!</p>\n                </div>\n            </div>' + btn_day2)

    # Day 3 replacement
    content = content.replace('            <!-- FINISHER -->\n            <div class="superset-header">\n                <span class="superset-title">⚡ BLOK D: The Iron Finisher (4 Dk)</span>\n                <span class="superset-badge">EMOM 4 Dakika</span>\n            </div>\n            <div class="exercise-card">\n                <div class="exercise-body cue-box">\n                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">10 Dambıl Swing + 10 Metre Bear Crawl (Ayı Emeklemesi)</p>\n                    <p style="color:var(--text-secondary);">Her dakika başında başla, kalanı dinlen (4 tur).</p>\n                </div>\n            </div>\n        </div>', '            <!-- FINISHER -->\n            <div class="superset-header">\n                <span class="superset-title">⚡ BLOK D: The Iron Finisher (4 Dk)</span>\n                <span class="superset-badge">EMOM 4 Dakika</span>\n            </div>\n            <div class="exercise-card">\n                <div class="exercise-body cue-box">\n                    <p style="font-weight:700; color:var(--gold-light); margin-bottom:4px;">10 Dambıl Swing + 10 Metre Bear Crawl (Ayı Emeklemesi)</p>\n                    <p style="color:var(--text-secondary);">Her dakika başında başla, kalanı dinlen (4 tur).</p>\n                </div>\n            </div>' + btn_day3)

# 5. Add Tracker Tab Content before <div id="info" class="tab-content">
tracker_tab_html = """
        <!-- ==================== TAB 4: GÜNLÜK & TAKİP ==================== -->
        <div id="trackerTab" class="tab-content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-val" id="statTotalWorkouts">0</div>
                    <div class="stat-lbl">TOPLAM SEANS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" id="statWeekWorkouts">0/3</div>
                    <div class="stat-lbl">BU HAFTA</div>
                </div>
                <div class="stat-card">
                    <div class="stat-val" id="statStreak">0</div>
                    <div class="stat-lbl">SERİ (GÜN)</div>
                </div>
            </div>

            <!-- WORKOUT ENTRY FORM -->
            <div class="log-form-card">
                <h3 style="font-size:14px; font-weight:800; color:var(--gold); margin-bottom:12px;">📝 Antrenman Kaydı Ekle</h3>
                
                <div class="form-group">
                    <label class="form-label">Antrenman Programı</label>
                    <select id="logProgram" class="form-select">
                        <option value="Gün 1: Üst İtiş & Bacak">🔴 Gün 1: Üst İtiş & Bacak</option>
                        <option value="Gün 2: Çekiş & Arka Zincir">🔵 Gün 2: Çekiş & Arka Zincir</option>
                        <option value="Gün 3: Tam Vücut Kompleks">🟡 Gün 3: Tam Vücut Kompleks</option>
                        <option value="Ekstra Kardiyo / Mobilite">🟢 Ekstra Kardiyo / Mobilite</option>
                    </select>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                    <div>
                        <label class="form-label">Tarih</label>
                        <input type="date" id="logDate" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Süre (Dk)</label>
                        <input type="number" id="logDuration" class="form-input" value="48">
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Zorluk Seviyesi (RPE Hissiyat)</label>
                    <select id="logRPE" class="form-select">
                        <option value="RPE 7 (Rahat / 3 tkr cepte)">RPE 7 (Rahat • 3 tkr cepte)</option>
                        <option value="RPE 8 (İdeal / 2 tkr cepte)" selected>RPE 8 (İdeal Çalışma • 2 tkr cepte)</option>
                        <option value="RPE 9 (Ağır / 1 tkr cepte)">RPE 9 (Ağır • 1 tkr cepte)</option>
                        <option value="RPE 10 (Maksimum Efor)">RPE 10 (Maksimum Efor • Sıfır pay)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Basılan Kilolar & Notlar</label>
                    <textarea id="logNotes" class="form-textarea" rows="3" placeholder="Örn: Omuz Pres: 16kg dambıl (3x10), Goblet Squat: 22kg, Lunge: 14kg. Enerji çok iyiydi."></textarea>
                </div>

                <button class="btn btn-gold" style="width:100%; padding:12px; font-weight:800;" onclick="saveWorkoutLog()">💾 ANTRENMANI KAYDET</button>
            </div>

            <!-- LOGBOOK HISTORY -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h3 style="font-size:14px; font-weight:800; color:#fff;">📜 Antrenman Geçmişi</h3>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="exportData()">📥 Yedek İndir</button>
                    <button class="btn btn-outline" style="font-size:10px; padding:4px 8px;" onclick="document.getElementById('importFile').click()">📤 Yükle</button>
                    <input type="file" id="importFile" style="display:none;" onchange="importData(event)">
                </div>
            </div>

            <div id="logHistoryContainer">
                <!-- Dynamically populated -->
            </div>
            
            <div style="text-align:center; margin-top:20px; margin-bottom:10px;">
                <button class="btn btn-outline" style="font-size:11px; color:#94a3b8; border-color:#334155;" onclick="resetCheckboxes()">
                    🔄 Kutucukları Sıfırla (Yeni Antrenman İçin)
                </button>
            </div>
        </div>
"""

if '<div id="trackerTab"' not in content:
    content = content.replace('        <!-- ==================== TAB 4: PERİYODİZASYON & KİLO ==================== -->', tracker_tab_html + '\n        <!-- ==================== TAB 4: PERİYODİZASYON & KİLO ==================== -->')

# 6. Add JavaScript for Tracking, History, Stats, and ServiceWorker
js_code = """
        // ==================== WORKOUT TRACKER & HISTORY ENGINE ====================
        function getWorkoutLogs() {
            try {
                return JSON.parse(localStorage.getItem('celik_kodu_history') || '[]');
            } catch(e) {
                return [];
            }
        }

        function setWorkoutLogs(logs) {
            localStorage.setItem('celik_kodu_history', JSON.stringify(logs));
            renderHistory();
        }

        function quickLogWorkout(programName) {
            switchTab('trackerTab');
            const progSelect = document.getElementById('logProgram');
            if (progSelect) progSelect.value = programName;
            const notes = document.getElementById('logNotes');
            if (notes && !notes.value) {
                notes.value = "Tüm süperset blokları eksiksiz tamamlandı.";
            }
        }

        function saveWorkoutLog() {
            const program = document.getElementById('logProgram').value;
            const date = document.getElementById('logDate').value || new Date().toISOString().split('T')[0];
            const duration = document.getElementById('logDuration').value || '45';
            const rpe = document.getElementById('logRPE').value;
            const notes = document.getElementById('logNotes').value.trim();

            const entry = {
                id: 'log_' + Date.now(),
                program: program,
                date: date,
                duration: duration,
                rpe: rpe,
                notes: notes,
                timestamp: Date.now()
            };

            const logs = getWorkoutLogs();
            logs.unshift(entry);
            setWorkoutLogs(logs);

            playAlertSound();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            alert("✅ Antrenman başarıyla kaydedildi!");

            document.getElementById('logNotes').value = "";
        }

        function deleteLog(id) {
            if (confirm("Bu antrenman kaydını silmek istediğinize emin misiniz?")) {
                let logs = getWorkoutLogs();
                logs = logs.filter(item => item.id !== id);
                setWorkoutLogs(logs);
            }
        }

        function renderHistory() {
            const logs = getWorkoutLogs();
            const container = document.getElementById('logHistoryContainer');
            if (!container) return;

            // Update stats
            const totalWorkouts = logs.length;
            document.getElementById('statTotalWorkouts').innerText = totalWorkouts;

            // This week workouts calculation
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
            startOfWeek.setHours(0,0,0,0);
            
            const thisWeekCount = logs.filter(l => new Date(l.date) >= startOfWeek).length;
            document.getElementById('statWeekWorkouts').innerText = thisWeekCount + '/3';

            // Streak calculation (days with workouts in the last 14 days)
            let streak = 0;
            const uniqueDates = [...new Set(logs.map(l => l.date))].sort().reverse();
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (uniqueDates.includes(dateStr)) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }
            document.getElementById('statStreak').innerText = streak;

            if (logs.length === 0) {
                container.innerHTML = `
                    <div style="background:var(--bg-card); border:1px dashed var(--border); border-radius:10px; padding:20px; text-align:center; color:var(--text-secondary); font-size:12px;">
                        Henüz kayıtlı antrenman yok. Bugün ilk antrenmanını tamamlayıp kaydet! 🚀
                    </div>
                `;
                return;
            }

            container.innerHTML = logs.map(log => `
                <div class="log-history-card">
                    <div class="log-card-header">
                        <span class="log-date">📅 ${log.date} (${log.duration} Dk)</span>
                        <div class="log-badges">
                            <span class="badge-sub">${log.program.split(':')[0]}</span>
                            <span class="badge-rpe">${log.rpe.split(' ')[0]} ${log.rpe.split(' ')[1]}</span>
                            <button class="btn-delete" title="Sil" onclick="deleteLog('${log.id}')">✕</button>
                        </div>
                    </div>
                    <div style="font-size:12px; font-weight:700; color:var(--gold-light); margin-bottom:4px;">${log.program}</div>
                    ${log.notes ? `<div class="log-notes">${log.notes}</div>` : ''}
                </div>
            `).join('');
        }

        function exportData() {
            const logs = getWorkoutLogs();
            const trackerState = localStorage.getItem('celik_kodu_workout_state');
            const data = {
                history: logs,
                checkboxState: trackerState ? JSON.parse(trackerState) : {},
                exportDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_yedek_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function importData(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data.history) {
                        localStorage.setItem('celik_kodu_history', JSON.stringify(data.history));
                    }
                    if (data.checkboxState) {
                        localStorage.setItem('celik_kodu_workout_state', JSON.stringify(data.checkboxState));
                        loadTrackerState();
                    }
                    renderHistory();
                    alert("✅ Veriler başarıyla geri yüklendi!");
                } catch(err) {
                    alert("❌ Hata: Geçersiz yedek dosyası!");
                }
            };
            reader.readAsText(file);
        }

        function resetCheckboxes() {
            if (confirm("Tüm set kutucuklarını temizlemek istediğinize emin misiniz? (Antrenman geçmişiniz silinmez, sadece kutucuklar sıfırlanır).")) {
                localStorage.removeItem('celik_kodu_workout_state');
                document.querySelectorAll('.set-pill').forEach(pill => {
                    pill.classList.remove('done');
                    const cb = pill.querySelector('input');
                    if (cb) cb.checked = false;
                });
                alert("Kutucuklar yeni antrenman için sıfırlandı!");
            }
        }

        // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('PWA ServiceWorker kayıtlı:', reg.scope))
                    .catch(err => console.log('PWA SW hatası:', err));
            });
        }

        // Initial setup for date field
        const todayStr = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('logDate');
        if (dateInput) dateInput.value = todayStr;
        renderHistory();
"""

if 'getWorkoutLogs()' not in content:
    content = content.replace('updateDisplay(75);\n        loadTrackerState();', 'updateDisplay(75);\n        loadTrackerState();\n' + js_code)

# Fix switchTab to handle direct calls or button clicks cleanly
old_switch = """        // TAB SWITCHING
        function switchTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            event.currentTarget.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }"""

new_switch = """        // TAB SWITCHING
        function switchTab(tabId) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
            if (targetBtn) {
                targetBtn.classList.add('active');
            } else if (window.event && window.event.currentTarget) {
                window.event.currentTarget.classList.add('active');
            }
            
            const targetContent = document.getElementById(tabId);
            if (targetContent) targetContent.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }"""

content = content.replace(old_switch, new_switch)

with open(HTML_FILE, "w", encoding="utf-8") as f:
    f.write(content)

# Also update salon_kilavuzu_mobil.html
with open("/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/salon_kilavuzu_mobil.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Index and Mobile HTML updated successfully!")
