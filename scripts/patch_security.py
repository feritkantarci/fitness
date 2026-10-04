#!/usr/bin/env python3
import re

INDEX_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/index.html"
MOBIL_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/salon_kilavuzu_mobil.html"

with open(INDEX_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Security Meta Headers in <head>
sec_meta = """    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';">"""

if 'Content-Security-Policy' not in content:
    content = content.replace('<meta name="apple-mobile-web-app-capable" content="yes">', sec_meta + '\n    <meta name="apple-mobile-web-app-capable" content="yes">', 1)

# 2. Add escapeHTML helper and secure renderHistory + secure importData
secure_tracker_js = """
        // ==================== WORKOUT TRACKER & HISTORY ENGINE (SECURED) ====================
        function escapeHTML(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function getWorkoutLogs() {
            try {
                const raw = localStorage.getItem('celik_kodu_history');
                if (!raw) return [];
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
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
                id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
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

            // Streak calculation (days with workouts in the last 30 days)
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

            container.innerHTML = logs.map(log => {
                const safeId = encodeURIComponent(log.id || '');
                const safeDate = escapeHTML(log.date || '');
                const safeDuration = escapeHTML(log.duration || '45');
                const safeProgram = escapeHTML(log.program || '');
                const safeRpe = escapeHTML(log.rpe || '');
                const safeNotes = escapeHTML(log.notes || '');

                const programBadge = safeProgram.split(':')[0] || 'Antrenman';
                const rpeBadge = safeRpe.split(' ')[0] + ' ' + (safeRpe.split(' ')[1] || '');

                return `
                    <div class="log-history-card">
                        <div class="log-card-header">
                            <span class="log-date">📅 ${safeDate} (${safeDuration} Dk)</span>
                            <div class="log-badges">
                                <span class="badge-sub">${programBadge}</span>
                                <span class="badge-rpe">${rpeBadge}</span>
                                <button class="btn-delete" title="Sil" onclick="deleteLog('${safeId}')">✕</button>
                            </div>
                        </div>
                        <div style="font-size:12px; font-weight:700; color:var(--gold-light); margin-bottom:4px;">${safeProgram}</div>
                        ${safeNotes ? `<div class="log-notes">${safeNotes}</div>` : ''}
                    </div>
                `;
            }).join('');
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

            // Security check: File size limit (max 2 MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("❌ Hata: Dosya boyutu çok büyük (Maksimum 2MB)!");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    
                    // Strict Schema Validation
                    if (data.history && Array.isArray(data.history)) {
                        const sanitizedHistory = data.history
                            .filter(item => item && typeof item === 'object')
                            .map(item => ({
                                id: String(item.id || ('log_' + Date.now())).slice(0, 50),
                                program: String(item.program || '').slice(0, 100),
                                date: String(item.date || '').slice(0, 20),
                                duration: String(item.duration || '').slice(0, 10),
                                rpe: String(item.rpe || '').slice(0, 50),
                                notes: String(item.notes || '').slice(0, 3000),
                                timestamp: Number(item.timestamp) || Date.now()
                            }));
                        localStorage.setItem('celik_kodu_history', JSON.stringify(sanitizedHistory));
                    }
                    if (data.checkboxState && typeof data.checkboxState === 'object') {
                        localStorage.setItem('celik_kodu_workout_state', JSON.stringify(data.checkboxState));
                        loadTrackerState();
                    }
                    renderHistory();
                    alert("✅ Veriler güvenli bir şekilde geri yüklendi!");
                } catch(err) {
                    alert("❌ Hata: Geçersiz veya bozuk yedek dosyası!");
                }
            };
            reader.readAsText(file);
        }
"""

# Replace tracker JS block
pattern = r"// ==================== WORKOUT TRACKER & HISTORY ENGINE ====================.*(?=function resetCheckboxes\(\))"
content = re.sub(pattern, secure_tracker_js + "\n        ", content, flags=re.DOTALL)

with open(INDEX_FILE, "w", encoding="utf-8") as f:
    f.write(content)

with open(MOBIL_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Security hardening applied successfully!")
