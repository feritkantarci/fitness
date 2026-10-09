/**
 * ÇELİK KODU KOÇ İSTASYONU - RENDERER CONTROLLER
 * 
 * Masaüstü arayüz kontrolcüsü, interaktif grafikler,
 * spor bilimi motoru entegrasyonu ve Firebase web dağıtımı.
 */

// Uygulama Durumu
let state = {
    users: [],
    selectedUserId: null,
    selectedUser: null,
    workoutLogs: [],
    academicAnalysis: null,
    lastAiReport: null,
    volumeChart: null
};

// DOM Elemanları
const el = {
    athleteSelect: document.getElementById('athleteSelect'),
    btnRefresh: document.getElementById('btnRefresh'),
    athleteAvatar: document.getElementById('athleteAvatar'),
    athleteName: document.getElementById('athleteName'),
    athleteLevel: document.getElementById('athleteLevel'),
    weightsGrid: document.getElementById('weightsGrid'),
    biomechAlerts: document.getElementById('biomechAlerts'),
    deficitList: document.getElementById('deficitList'),

    valWeeklyTonnage: document.getElementById('valWeeklyTonnage'),
    valEffectiveReps: document.getElementById('valEffectiveReps'),
    valPushPull: document.getElementById('valPushPull'),
    valJunkVolume: document.getElementById('valJunkVolume'),

    volumeChartCanvas: document.getElementById('volumeChart'),
    aiCustomPrompt: document.getElementById('aiCustomPrompt'),
    btnRunAiAnalysis: document.getElementById('btnRunAiAnalysis'),
    aiOutputWrap: document.getElementById('aiOutputWrap'),
    aiReportContent: document.getElementById('aiReportContent'),
    btnPushDirectiveToWeb: document.getElementById('btnPushDirectiveToWeb'),
    btnPushProgramToWeb: document.getElementById('btnPushProgramToWeb'),

    btnOpenSettings: document.getElementById('btnOpenSettings'),
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    btnCancelSettings: document.getElementById('btnCancelSettings'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),
    inputApiKey: document.getElementById('inputApiKey'),
    toastNotification: document.getElementById('toastNotification')
};

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadApiKey();
    await loadAthletes();

    // Canlı antrenman dinleyicisi
    if (window.coachAPI && window.coachAPI.onLiveWorkoutUpdated) {
        window.coachAPI.onLiveWorkoutUpdated((data) => {
            if (data.uid === state.selectedUserId) {
                showToast(`⚡ Canlı Bildirim: ${state.selectedUser?.name || 'Sporcu'} yeni antrenman kaydetti!`);
                refreshAthleteData();
            }
        });
    }
});

function setupEventListeners() {
    el.athleteSelect.addEventListener('change', (e) => {
        selectAthlete(e.target.value);
    });

    el.btnRefresh.addEventListener('click', () => {
        refreshAthleteData();
    });

    el.btnRunAiAnalysis.addEventListener('click', () => {
        runGeminiAcademicAnalysis();
    });

    el.btnPushDirectiveToWeb.addEventListener('click', () => {
        pushDirectiveToAthleteWeb();
    });

    el.btnPushProgramToWeb.addEventListener('click', () => {
        pushProgramToAthleteWeb();
    });

    // Ayarlar Modalı
    el.btnOpenSettings.addEventListener('click', async () => {
        const key = await window.coachAPI.getApiKey();
        el.inputApiKey.value = key || '';
        el.settingsModal.style.display = 'flex';
    });

    el.btnCloseSettings.addEventListener('click', () => {
        el.settingsModal.style.display = 'none';
    });

    el.btnCancelSettings.addEventListener('click', () => {
        el.settingsModal.style.display = 'none';
    });

    el.btnSaveSettings.addEventListener('click', async () => {
        const key = el.inputApiKey.value.trim();
        await window.coachAPI.saveApiKey(key);
        showToast('✅ Gemini API Anahtarı başarıyla kaydedildi!');
        el.settingsModal.style.display = 'none';
    });
}

// ==================== DATA LOADING ====================
async function loadApiKey() {
    try {
        const key = await window.coachAPI.getApiKey();
        if (key) {
            document.getElementById('aiStatusPill').innerHTML = '<span class="dot"></span> AI: Hazır';
        } else {
            document.getElementById('aiStatusPill').innerHTML = '<span class="dot" style="background:#f59e0b"></span> AI: Anahtar Bekleniyor';
        }
    } catch(e) {}
}

async function loadAthletes() {
    try {
        el.athleteSelect.innerHTML = '<option value="">Sporcular yükleniyor...</option>';
        const users = await window.coachAPI.getUsers();
        state.users = users;

        if (!users || users.length === 0) {
            el.athleteSelect.innerHTML = '<option value="">Sporcu Bulunamadı</option>';
            return;
        }

        el.athleteSelect.innerHTML = users.map(u => 
            `<option value="${u.id}">${u.name || u.username} (${u.role === 'admin' ? 'Admin' : 'Sporcu'})</option>`
        ).join('');

        // İlk kullanıcıyı seç (varsayılan Ferit veya ilk kullanıcı)
        const defaultUser = users.find(u => u.username === 'ferit') || users[0];
        el.athleteSelect.value = defaultUser.id;
        await selectAthlete(defaultUser.id);
    } catch (err) {
        console.error("Sporcular yüklenirken hata:", err);
        showToast('⚠️ Sporcular Firebase bulutundan çekilemedi.');
    }
}

async function selectAthlete(userId) {
    state.selectedUserId = userId;
    state.selectedUser = state.users.find(u => u.id === userId) || null;

    if (!state.selectedUser) return;

    // Profil Arayüzünü Güncelle
    el.athleteName.textContent = state.selectedUser.name || state.selectedUser.username;
    el.athleteLevel.textContent = state.selectedUser.level || 'Orta Seviye';
    el.athleteAvatar.textContent = state.selectedUser.avatar || '🥋';

    // Referans Ağırlıklar Tablosu
    renderWeightsTable(state.selectedUser.weights || {});

    // Antrenman Geçmişini ve Akademik Analizi Yükle
    await refreshAthleteData();
}

function renderWeightsTable(weights) {
    const list = [
        { key: 'squat', label: 'Squat' },
        { key: 'press', label: 'D. Press' },
        { key: 'row', label: 'D. Row' },
        { key: 'rdl', label: 'RDL' },
        { key: 'swing', label: 'KB Swing' },
        { key: 'lunge', label: 'Lunge' }
    ];

    el.weightsGrid.innerHTML = list.map(item => `
        <div class="weight-item">
            <span class="label">${item.label}</span>
            <span class="val">${weights[item.key] || '-'} kg</span>
        </div>
    `).join('');
}

async function refreshAthleteData() {
    if (!state.selectedUserId) return;

    el.btnRefresh.classList.add('rotating');
    try {
        const logs = await window.coachAPI.getWorkoutLogs(state.selectedUserId);
        state.workoutLogs = logs || [];

        // Akademik Spor Bilimi Motorunu Çalıştır
        const analysis = await window.coachAPI.analyzeHistory(state.workoutLogs, state.selectedUser);
        state.academicAnalysis = analysis;

        // Arayüzü Güncelle
        renderDashboard(analysis);
    } catch (err) {
        console.error("Antrenman verisi yenilenirken hata:", err);
    } finally {
        el.btnRefresh.classList.remove('rotating');
    }
}

// ==================== DASHBOARD RENDERING ====================
function renderDashboard(analysis) {
    if (!analysis || analysis.status === 'NO_DATA') {
        el.valWeeklyTonnage.textContent = '0 kg';
        el.valEffectiveReps.textContent = '0';
        el.valPushPull.textContent = '1.00';
        el.valJunkVolume.textContent = '0 Set';
        el.biomechAlerts.innerHTML = '<div class="empty-state">Henüz antrenman kaydı bulunmuyor.</div>';
        el.deficitList.innerHTML = '<div class="empty-state">Hacim açığı taranıyor...</div>';
        return;
    }

    const { summary, deficits, biomechanicalWarnings, muscleBreakdown } = analysis;

    // 1. KPI Kartları
    el.valWeeklyTonnage.textContent = `${(summary.totalWeeklyTonnageKg || 0).toLocaleString('tr-TR')} kg`;
    el.valEffectiveReps.textContent = summary.effectiveRepsCount || 0;
    el.valPushPull.textContent = `${summary.pushPullRatio} : 1`;

    let totalJunk = 0;
    Object.values(muscleBreakdown).forEach(m => totalJunk += (m.junkSets || 0));
    el.valJunkVolume.textContent = `${totalJunk} Set`;

    // 2. Biyomekanik Uyarılar
    if (biomechanicalWarnings && biomechanicalWarnings.length > 0) {
        el.biomechAlerts.innerHTML = biomechanicalWarnings.map(w => `
            <div class="biomech-alert-item">${w}</div>
        `).join('');
    } else {
        el.biomechAlerts.innerHTML = `
            <div style="font-size:11.5px; color:#6ee7b7; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); padding:8px 10px; border-radius:8px;">
                ✅ İtiş/Çekiş ve eklem açıları ideal anatomik dengede.
            </div>
        `;
    }

    // 3. Hacim Açıkları (MEV Altı Kaslar)
    if (deficits && deficits.length > 0) {
        el.deficitList.innerHTML = deficits.map(d => `
            <div class="deficit-item">
                <span class="name">${d.muscle}</span>
                <span class="tag">${d.actual} / ${d.target} Set (${d.status})</span>
            </div>
        `).join('');
    } else {
        el.deficitList.innerHTML = `
            <div style="font-size:11.5px; color:#6ee7b7; padding:8px 10px; background:rgba(16, 185, 129, 0.08); border-radius:8px;">
                🏆 Tüm kaslar minimum gelişim eşiğinin (MEV) üzerinde!
            </div>
        `;
    }

    // 4. Chart.js Akademik Hacim Eşikleri Grafiği
    renderVolumeChart(muscleBreakdown);
}

function renderVolumeChart(muscleBreakdown) {
    const muscles = Object.keys(muscleBreakdown);
    const actualSets = muscles.map(m => muscleBreakdown[m].sets);
    const mevLimits = muscles.map(m => muscleBreakdown[m].limits.MEV);
    const mavLimits = muscles.map(m => muscleBreakdown[m].limits.MAV_MIN);
    const mrvLimits = muscles.map(m => muscleBreakdown[m].limits.MRV);

    if (state.volumeChart) {
        state.volumeChart.destroy();
    }

    const ctx = el.volumeChartCanvas.getContext('2d');
    state.volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: muscles,
            datasets: [
                {
                    label: 'Yapılan Set',
                    data: actualSets,
                    backgroundColor: actualSets.map((s, idx) => {
                        if (s === 0) return 'rgba(239, 68, 68, 0.7)'; // Atlandı
                        if (s < mevLimits[idx]) return 'rgba(245, 158, 11, 0.7)'; // MEV Altı
                        if (s > mrvLimits[idx]) return 'rgba(239, 68, 68, 0.9)'; // Aşırı Yük
                        return 'rgba(234, 179, 8, 0.85)'; // Optimal
                    }),
                    borderRadius: 6,
                    barPercentage: 0.6
                },
                {
                    label: 'MEV (Asgari)',
                    data: mevLimits,
                    type: 'line',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'MAV Altın Eşik',
                    data: mavLimits,
                    type: 'line',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'MRV Tavanı',
                    data: mrvLimits,
                    type: 'line',
                    borderColor: '#f97316',
                    borderWidth: 1.5,
                    borderDash: [3, 3],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const muscle = muscles[context.dataIndex];
                            return muscleBreakdown[muscle].recommendation;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8', font: { size: 10 } },
                    title: { display: true, text: 'Haftalık Hard Set Sayısı', color: '#64748b', font: { size: 11 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#cbd5e1', font: { size: 11, weight: 'bold' } }
                }
            }
        }
    });
}

// ==================== AI COACH & REÇETE ====================
async function runGeminiAcademicAnalysis() {
    if (!state.academicAnalysis || state.academicAnalysis.status === 'NO_DATA') {
        alert('Lütfen önce antrenman geçmişi olan bir sporcu seçin.');
        return;
    }

    const customPrompt = el.aiCustomPrompt.value.trim();
    el.btnRunAiAnalysis.disabled = true;
    el.btnRunAiAnalysis.innerHTML = '<span class="icon">⏳</span> Literatür Taranıyor & AI Analiz Yapılıyor...';

    try {
        const result = await window.coachAPI.generatePrescription({
            profile: state.selectedUser,
            academicData: state.academicAnalysis,
            prompt: customPrompt
        });

        state.lastAiReport = result;

        // Çıktıyı Formatla ve Göster
        el.aiReportContent.innerHTML = formatMarkdown(result.rawReport);
        el.aiOutputWrap.style.display = 'flex';

        showToast('🧠 Akademik analiz ve reçete başarıyla tamamlandı!');
        window.coachAPI.showNotification(
            '🎓 Akademik Reçete Hazır!',
            `${state.selectedUser.name} için spor bilimi analizi ve program önerisi oluşturuldu.`
        );
    } catch (err) {
        console.error("AI Analiz hatası:", err);
        alert(`AI Analiz Başarısız Oldu: ${err.message}\n\nLütfen sağ üstteki ayarlar (⚙️) butonundan geçerli bir Google Gemini API anahtarı girdiğinizden emin olun.`);
    } finally {
        el.btnRunAiAnalysis.disabled = false;
        el.btnRunAiAnalysis.innerHTML = '<span class="icon">🧠</span> Akademik Analiz & Reçete Üret';
    }
}

// ==================== WEB'E DAĞITIM (SEND TO WEB) ====================
async function pushDirectiveToAthleteWeb() {
    if (!state.lastAiReport || !state.selectedUserId) {
        alert('Lütfen önce bir analiz üretin.');
        return;
    }

    // AI raporundan "WEB UYGULAMASI DİREKTİFİ" bölümünü ayıkla veya özet oluştur
    let directiveText = state.lastAiReport.rawReport;
    const match = directiveText.match(/### 2\..*?\n([\s\S]*?)(?=### 3\.|$)/i);
    if (match && match[1]) {
        directiveText = match[1].trim();
    } else {
        directiveText = directiveText.substring(0, 300) + '...';
    }

    const payload = {
        title: '🎓 FitLAB Direktifi',
        text: directiveText,
        fullReport: state.lastAiReport.rawReport,
        targetAthlete: state.selectedUser.name,
        badge: 'FitLAB Spor Bilimi',
        active: true,
        sentAt: new Date().toISOString()
    };

    const res = await window.coachAPI.sendDirectiveToWeb(state.selectedUserId, payload);
    if (res.success) {
        showToast(`🚀 Direktif web uygulamasına iletildi! ${state.selectedUser.name} telefonunda görecek.`);
        window.coachAPI.showNotification(
            '📱 Web Direktifi Gönderildi',
            `${state.selectedUser.name} telefonundaki web uygulamasını açtığında FitLAB direktifini görecek.`
        );
    } else {
        alert(`Gönderim hatası: ${res.error}`);
    }
}

async function pushProgramToAthleteWeb() {
    if (!state.lastAiReport || !state.selectedUserId) {
        alert('Lütfen önce bir analiz üretin.');
        return;
    }

    let programSection = state.lastAiReport.rawReport;
    const match = programSection.match(/### 3\..*?\n([\s\S]*?)$/i);
    if (match && match[1]) {
        programSection = match[1].trim();
    }

    const payload = {
        title: `FitLAB Hipertrofi & Güç Programı (${state.selectedUser.name})`,
        programText: programSection,
        author: 'FitLAB AI Engine',
        assignedTo: state.selectedUserId,
        active: true,
        assignedAt: new Date().toISOString()
    };

    const res = await window.coachAPI.sendProgramToWeb(state.selectedUserId, payload);
    if (res.success) {
        showToast(`📋 Yeni akademik program web uygulamasına başarıyla yüklendi!`);
        window.coachAPI.showNotification(
            '📋 Yeni Program Web\'e Atandı',
            `${state.selectedUser.name} için optimize edilmiş antrenman şablonu yüklendi.`
        );
    } else {
        alert(`Program yükleme hatası: ${res.error}`);
    }
}

// ==================== YARDIMCI FONKSİYONLAR ====================
function formatMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/### (.*?)\n/g, '<h3>$1</h3>')
        .replace(/## (.*?)\n/g, '<h2 style="color:var(--gold); font-size:15px; margin:12px 0 6px;">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(.*?)```/gs, '<pre style="background:#000; padding:10px; border-radius:6px; font-family:var(--font-mono); font-size:11px; margin:8px 0;">$1</pre>');
}

function showToast(msg) {
    el.toastNotification.textContent = msg;
    el.toastNotification.style.display = 'block';
    setTimeout(() => {
        el.toastNotification.style.display = 'none';
    }, 4000);
}
