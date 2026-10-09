/**
 * ÇELİK KODU KOÇ İSTASYONU - RENDERER CONTROLLER
 * 
 * Masaüstü arayüz kontrolcüsü, interaktif grafikler,
 * spor bilimi motoru entegrasyonu ve Firebase web dağıtımı.
 */

// Uygulama Durumu
let state = {
    currentView: 'dashboard',
    users: [],
    selectedUserId: null,
    selectedUser: null,
    workoutLogs: [],
    academicAnalysis: null,
    lastAiReport: null,
    volumeChart: null,
    // Lab Durumu
    catalog: [],
    labFiltered: [],
    selectedExercise: null,
    visualTab: 'form', // 'form' | 'anatomi'
    labFilter: 'ALL',
    labSearch: '',
    excludedExerciseIds: JSON.parse(localStorage.getItem('fitlab_excluded_exercises') || '[]')
};

// DOM Elemanları
const el = {
    // Navigasyon & Görünümler
    viewDashboard: document.getElementById('viewDashboard'),
    viewLab: document.getElementById('viewLab'),
    tabBtnDashboard: document.getElementById('tabBtnDashboard'),
    tabBtnLab: document.getElementById('tabBtnLab'),

    // Dashboard Elemanları
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

    // Lab Elemanları
    labSearchInput: document.getElementById('labSearchInput'),
    btnClearLabSearch: document.getElementById('btnClearLabSearch'),
    labExerciseCount: document.getElementById('labExerciseCount'),
    labFilterBar: document.getElementById('labFilterBar'),
    chipLabExcluded: document.getElementById('chipLabExcluded'),
    labExcludedBadgeCount: document.getElementById('labExcludedBadgeCount'),
    labGrid: document.getElementById('labGrid'),
    labInspector: document.getElementById('labInspector'),
    inspectorPlaceholder: document.getElementById('inspectorPlaceholder'),
    inspectorContent: document.getElementById('inspectorContent'),
    inspTypeBadge: document.getElementById('inspTypeBadge'),
    inspSfrBadge: document.getElementById('inspSfrBadge'),
    btnToggleHideExercise: document.getElementById('btnToggleHideExercise'),
    btnToggleHideIcon: document.getElementById('btnToggleHideIcon'),
    btnToggleHideText: document.getElementById('btnToggleHideText'),
    btnCloseInspector: document.getElementById('btnCloseInspector'),
    inspTitle: document.getElementById('inspTitle'),
    inspMuscleTag: document.getElementById('inspMuscleTag'),
    inspKeyTag: document.getElementById('inspKeyTag'),
    btnTabForm: document.getElementById('btnTabForm'),
    btnTabAnatomi: document.getElementById('btnTabAnatomi'),
    inspImage: document.getElementById('inspImage'),
    inspImageFallback: document.getElementById('inspImageFallback'),
    inspValMtf: document.getElementById('inspValMtf'),
    inspValLengthened: document.getElementById('inspValLengthened'),
    labResizer: document.getElementById('labResizer'),
    inspPillMtf: document.getElementById('inspPillMtf'),
    inspDescMtf: document.getElementById('inspDescMtf'),
    inspDescLengthened: document.getElementById('inspDescLengthened'),
    inspActivationBars: document.getElementById('inspActivationBars'),
    inspCueText: document.getElementById('inspCueText'),

    // Sistem & Ayarlar
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
    loadExerciseCatalog(); // Egzersiz atlasını arka planda hazırla

    // Canlı antrenman dinleyicisi
    if (window.coachAPI && window.coachAPI.onLiveWorkoutUpdated) {
        window.coachAPI.onLiveWorkoutUpdated(async (data) => {
            if (data.uid === state.selectedUserId) {
                showToast(`⚡ Canlı Bildirim: ${state.selectedUser?.name || 'Sporcu'} yeni antrenman kaydetti!`);
                state.workoutLogs = data.logs || [];
                const analysis = await window.coachAPI.analyzeHistory(state.workoutLogs, state.selectedUser);
                state.academicAnalysis = analysis;
                renderDashboard(analysis);
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

    // ==================== LAB EVENT LISTENERS ====================
    // Görünüm / Sekme Değişimi
    el.tabBtnDashboard.addEventListener('click', () => switchView('dashboard'));
    el.tabBtnLab.addEventListener('click', () => switchView('lab'));

    // Arama ve Filtreler
    el.labSearchInput.addEventListener('input', (e) => {
        state.labSearch = e.target.value.trim().toLowerCase();
        el.btnClearLabSearch.style.display = state.labSearch ? 'block' : 'none';
        applyLabFilters();
    });

    el.btnClearLabSearch.addEventListener('click', () => {
        el.labSearchInput.value = '';
        state.labSearch = '';
        el.btnClearLabSearch.style.display = 'none';
        applyLabFilters();
    });

    el.labFilterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-chip');
        if (!btn) return;
        el.labFilterBar.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.labFilter = btn.dataset.filter;
        applyLabFilters();
    });

    // Lab Inspector Kontrolleri
    if (el.btnToggleHideExercise) {
        el.btnToggleHideExercise.addEventListener('click', () => {
            if (state.selectedExercise) {
                toggleExerciseExclusion(state.selectedExercise.id);
            }
        });
    }

    el.btnCloseInspector.addEventListener('click', () => {
        closeInspector();
    });

    el.btnTabForm.addEventListener('click', () => {
        setVisualTab('form');
    });

    el.btnTabAnatomi.addEventListener('click', () => {
        setVisualTab('anatomi');
    });

    // Resizer (Sürüklenebilir Genişlik Ayarı)
    setupLabResizer();
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

        if (!users || users.length === 0) {
            el.athleteSelect.innerHTML = '<option value="">Sporcu Bulunamadı</option>';
            return;
        }

        // Her kullanıcının antrenman kayıt sayısını öğren
        const usersWithCounts = await Promise.all(users.map(async u => {
            try {
                const logs = await window.coachAPI.getWorkoutLogs(u.id);
                const validCount = (logs || []).filter(l => l.totalSetsCompleted > 0 || (l.exercises || []).some(ex => (ex.sets || []).some(s => s.completed || parseInt(s.reps, 10) > 0))).length;
                return { ...u, validLogCount: validCount };
            } catch(e) {
                return { ...u, validLogCount: 0 };
            }
        }));

        // En çok antrenmanı olan kullanıcıyı en başa al (Örn: Ferit (Admin) 8 antrenmanla başa gelir)
        usersWithCounts.sort((a, b) => b.validLogCount - a.validLogCount);
        state.users = usersWithCounts;

        el.athleteSelect.innerHTML = usersWithCounts.map(u => 
            `<option value="${u.id}">${u.name || u.username} • ${u.validLogCount > 0 ? `${u.validLogCount} Antrenman Kaydı` : 'Kayıt Yok'} (${u.role === 'admin' ? 'Admin' : 'Sporcu'})</option>`
        ).join('');

        // İlk kullanıcıyı seç (En çok antrenman kaydı olan sporcu)
        const defaultUser = usersWithCounts[0];
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
    const formatSetNum = (s) => (s % 1 === 0 ? s : s.toFixed(1));
    if (deficits && deficits.length > 0) {
        el.deficitList.innerHTML = deficits.map(d => `
            <div class="deficit-item">
                <span class="name">${d.muscle}</span>
                <span class="tag">${formatSetNum(d.actual)} / ${d.target} Set (${d.status})</span>
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

    const backgroundColors = actualSets.map((s, idx) => {
        if (s === 0) return 'rgba(239, 68, 68, 0.7)'; // Atlandı
        if (s < mevLimits[idx]) return 'rgba(245, 158, 11, 0.7)'; // MEV Altı
        if (s > mrvLimits[idx]) return 'rgba(239, 68, 68, 0.9)'; // Aşırı Yük
        return 'rgba(234, 179, 8, 0.85)'; // Optimal
    });

    // Eğer grafik zaten varsa, yok edip baştan oluşturmak yerine yerinde pürüzsüz güncelle (titremeyi önler)
    if (state.volumeChart) {
        state.volumeChart.data.labels = muscles;
        state.volumeChart.data.datasets[0].data = actualSets;
        state.volumeChart.data.datasets[0].backgroundColor = backgroundColors;
        state.volumeChart.data.datasets[1].data = mevLimits;
        state.volumeChart.data.datasets[2].data = mavLimits;
        state.volumeChart.data.datasets[3].data = mrvLimits;
        state.volumeChart.update('none');
        return;
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
                    backgroundColor: backgroundColors,
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
            animation: {
                duration: 500,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const muscle = muscles[context.dataIndex];
                            const s = muscleBreakdown[muscle].sets;
                            const formatted = s % 1 === 0 ? s : s.toFixed(1);
                            return ` ${context.dataset.label}: ${formatted} Hard Set`;
                        },
                        afterLabel: function(context) {
                            const muscle = muscles[context.dataIndex];
                            return `${muscleBreakdown[muscle].recommendation}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 25,
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

// ==================== LAB (BİYOMEKANİK ATLAS) MODÜLÜ ====================
function switchView(viewName) {
    state.currentView = viewName;
    if (viewName === 'dashboard') {
        el.viewDashboard.style.display = 'flex';
        el.viewLab.style.display = 'none';
        el.tabBtnDashboard.classList.add('active');
        el.tabBtnLab.classList.remove('active');
    } else {
        el.viewDashboard.style.display = 'none';
        el.viewLab.style.display = 'flex';
        el.tabBtnDashboard.classList.remove('active');
        el.tabBtnLab.classList.add('active');
        if (state.catalog.length === 0) {
            loadExerciseCatalog();
        }
    }
}

async function loadExerciseCatalog() {
    try {
        const catalog = await window.coachAPI.getExerciseCatalog();
        state.catalog = catalog || [];
        applyLabFilters();
    } catch (err) {
        console.error("Katalog yüklenemedi:", err);
        showToast('⚠️ Egzersiz atlası yüklenirken hata oluştu.');
    }
}

function applyLabFilters() {
    const q = state.labSearch;
    const f = state.labFilter;

    // Gizlenen egzersiz sayacını güncelle
    if (el.labExcludedBadgeCount) {
        el.labExcludedBadgeCount.textContent = (state.excludedExerciseIds || []).length;
    }

    let filtered = state.catalog.filter(item => {
        const isExcluded = (state.excludedExerciseIds || []).includes(item.id);

        // Gizlenenler modunda sadece gizlenenler, diğer modlarda gizlenmeyenler listelenir
        if (f === 'EXCLUDED') {
            if (!isExcluded) return false;
        } else {
            if (isExcluded) return false;
        }

        // Arama filtresi
        const matchesQuery = !q || 
            item.name.toLowerCase().includes(q) || 
            item.rawKey.toLowerCase().includes(q) || 
            item.primary.toLowerCase().includes(q) ||
            (item.typeLabel && item.typeLabel.toLowerCase().includes(q));

        if (!matchesQuery) return false;

        // Kategori filtresi
        if (f === 'ALL' || f === 'EXCLUDED') return true;
        if (f === 'Kol') return item.primary === 'Biceps' || item.primary === 'Triceps';
        return item.primary.includes(f) || (item.sec && Object.keys(item.sec).some(k => k.includes(f)));
    });

    state.labFiltered = filtered;
    el.labExerciseCount.textContent = filtered.length;
    renderLabGrid(filtered);
}

function renderLabGrid(exercises) {
    if (!exercises || exercises.length === 0) {
        const isExcludedView = state.labFilter === 'EXCLUDED';
        el.labGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
                <div style="font-size: 36px; margin-bottom: 10px;">${isExcludedView ? '✨' : '🔍'}</div>
                <p style="font-size: 14px;">${isExcludedView ? 'Kişisel havuzunuzdan gizlenmiş hiçbir hareket yok. Tüm egzersizler aktif!' : 'Aradığınız kriterlere uygun egzersiz bulunamadı.'}</p>
            </div>
        `;
        return;
    }

    el.labGrid.innerHTML = exercises.map(ex => {
        const isActive = state.selectedExercise && state.selectedExercise.id === ex.id;
        const isExcluded = (state.excludedExerciseIds || []).includes(ex.id);
        const pFactor = typeof ex.pFactor === 'number' ? ex.pFactor : 1.0;
        
        let mtfPillHtml = '';
        if (pFactor === 0 || ex.type === 'CONDITIONING') {
            mtfPillHtml = `<span class="mtf-pill mtf-cardio">🏃 Kondisyon (0 Yük)</span>`;
        } else if (pFactor >= 0.85) {
            mtfPillHtml = `<span class="mtf-pill mtf-full">⚡ %${Math.round(pFactor * 100)} Tam Yük</span>`;
        } else {
            mtfPillHtml = `<span class="mtf-pill mtf-partial">⚡ %${Math.round(pFactor * 100)} Kısmi Yük</span>`;
        }

        const typeLabel = ex.typeLabel ? ex.typeLabel.split(' ')[0] : 'Kuvvet';

        return `
            <div class="lab-card ${isActive ? 'active' : ''} ${isExcluded ? 'is-card-excluded' : ''}" data-id="${ex.id}">
                <div class="lab-card-header">
                    <div class="lab-card-title">${ex.name} ${isExcluded ? '<span style="color:#f87171; font-size:10px; font-weight:800; margin-left:4px;">[GİZLENDİ]</span>' : ''}</div>
                </div>
                <div class="lab-card-tags">
                    <span class="muscle-pill">${ex.primary}</span>
                    <span class="type-pill">${typeLabel}</span>
                    ${mtfPillHtml}
                </div>
            </div>
        `;
    }).join('');

    // Kart tıklama dinleyicileri
    el.labGrid.querySelectorAll('.lab-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const found = state.catalog.find(c => c.id === id);
            if (found) {
                selectLabExercise(found);
            }
        });
    });
}

function updateExcludeButtonState(exId) {
    if (!el.btnToggleHideExercise) return;
    const isExcluded = (state.excludedExerciseIds || []).includes(exId);
    if (isExcluded) {
        el.btnToggleHideExercise.className = 'btn-toggle-exclude is-excluded';
        if (el.btnToggleHideIcon) el.btnToggleHideIcon.textContent = '🔄';
        if (el.btnToggleHideText) el.btnToggleHideText.textContent = 'Geri Al';
        el.btnToggleHideExercise.title = 'Aktif havuzunuza geri ekleyin';
    } else {
        el.btnToggleHideExercise.className = 'btn-toggle-exclude';
        if (el.btnToggleHideIcon) el.btnToggleHideIcon.textContent = '👁️';
        if (el.btnToggleHideText) el.btnToggleHideText.textContent = 'Gizle';
        el.btnToggleHideExercise.title = 'Kişisel havuzunuzdan gizleyin';
    }
}

function toggleExerciseExclusion(exId) {
    if (!exId) return;
    const ex = state.catalog.find(c => c.id === exId);
    const exName = ex ? ex.name : exId;
    
    let list = state.excludedExerciseIds || [];
    const idx = list.indexOf(exId);

    if (idx >= 0) {
        list.splice(idx, 1);
        showToast(`✅ "${exName}" geri alındı.`);
    } else {
        list.push(exId);
        showToast(`👁️ "${exName}" gizlendi.`);
    }

    state.excludedExerciseIds = list;
    try {
        localStorage.setItem('fitlab_excluded_exercises', JSON.stringify(list));
    } catch(e) {}

    updateExcludeButtonState(exId);
    applyLabFilters();
}

function selectLabExercise(ex) {
    state.selectedExercise = ex;

    // Aktif kart vurgusu
    el.labGrid.querySelectorAll('.lab-card').forEach(card => {
        card.classList.toggle('active', card.dataset.id === ex.id);
    });

    // Inspector paneli göster
    el.inspectorPlaceholder.style.display = 'none';
    el.inspectorContent.style.display = 'flex';

    // Gizle / Geri Getir butonunu güncelle
    updateExcludeButtonState(ex.id);

    // Başlık ve Etiketler
    el.inspTitle.textContent = ex.name;
    el.inspKeyTag.textContent = ex.rawKey || ex.id;
    el.inspMuscleTag.textContent = `${ex.primary} Odaklı`;

    // Tip Rozeti (Kısa ve net)
    let shortType = ex.typeLabel || ex.type || 'Egzersiz';
    if (shortType.includes('Ağır Serbest Ağırlık Bileşik')) shortType = 'Ağır Bileşik';
    else if (shortType.includes('Bileşik')) shortType = 'Bileşik';
    else if (shortType.includes('İzolasyon')) shortType = 'İzolasyon';
    else if (shortType.includes('Kondisyon')) shortType = 'Kondisyon';
    el.inspTypeBadge.textContent = shortType;
    
    // SFR Rozeti (Kısa ve net)
    let shortSfr = 'N/A';
    if (ex.sfr === 'HIGH' || (ex.sfrLabel && ex.sfrLabel.includes('Yüksek'))) shortSfr = 'Yüksek';
    else if (ex.sfr === 'MODERATE' || (ex.sfrLabel && ex.sfrLabel.includes('Orta'))) shortSfr = 'Orta';
    else if (ex.sfr === 'LOW' || (ex.sfrLabel && ex.sfrLabel.includes('Düşük'))) shortSfr = 'Düşük';
    el.inspSfrBadge.textContent = `SFR: ${shortSfr}`;
    el.inspSfrBadge.className = `badge-sfr ${ex.sfr === 'N/A' ? 'na' : ''}`;
    el.inspSfrBadge.title = ex.sfrLabel || `SFR Seviyesi: ${shortSfr}`;

    // MTF Değer ve Açıklama Hesaplama
    const pFactor = typeof ex.pFactor === 'number' ? ex.pFactor : 1.0;
    const inspPill = document.getElementById('inspPillMtf');
    const inspDesc = document.getElementById('inspDescMtf');
    const inspDescLengthened = document.getElementById('inspDescLengthened');

    if (pFactor === 0 || ex.type === 'CONDITIONING') {
        el.inspValMtf.textContent = '0.00x';
        if (inspPill) {
            inspPill.textContent = '0 Yük / Kondisyon';
            inspPill.style.background = 'rgba(148, 163, 184, 0.2)';
            inspPill.style.color = '#94a3b8';
        }
        if (inspDesc) {
            inspDesc.textContent = 'Metabolik dayanıklılık ve kardiyo hareketi. Kalp ritmini ve kalori tüketimini artırır; ancak kas hipertrofisine doğrudan 0 set olarak işlenir.';
        }
    } else if (pFactor >= 0.85) {
        el.inspValMtf.textContent = `${pFactor.toFixed(2)}x`;
        if (inspPill) {
            inspPill.textContent = `%${Math.round(pFactor * 100)} Tam Mekanik Yük`;
            inspPill.style.background = 'rgba(16, 185, 129, 0.2)';
            inspPill.style.color = '#10b981';
        }
        if (inspDesc) {
            inspDesc.textContent = `Ağır serbest ağırlık veya doğrudan yüklenme. Kas liflerine %100 mekanik gerilim biner; yapılan 1 set tam ${pFactor.toFixed(2)} setlik hipertrofi sayılır.`;
        }
    } else {
        el.inspValMtf.textContent = `${pFactor.toFixed(2)}x`;
        if (inspPill) {
            inspPill.textContent = `%${Math.round(pFactor * 100)} Kısmi Mekanik Yük`;
            inspPill.style.background = 'rgba(234, 179, 8, 0.2)';
            inspPill.style.color = 'var(--gold)';
        }
        if (inspDesc) {
            inspDesc.textContent = `Yük vücut ağırlığıyla paylaşılır veya açı gereği kas gerilimi kısmi kalır. Bu nedenle 1 tam set = ${pFactor.toFixed(2)} setlik efektif hipertrofi olarak hesaba katılır.`;
        }
    }

    // Lengthened Overload
    el.inspValLengthened.textContent = ex.lengthened ? 'Evet ✅' : 'Hayır ❌';
    if (inspDescLengthened) {
        inspDescLengthened.textContent = ex.lengthened
            ? 'Kas lifleri gerilmiş (uzamış) pozisyondayken maksimum mekanik gerilim üretir (Stretch-Mediated Hipertrofi avantajı).'
            : 'Hareket tepe sıkıştırma veya kısalmış pozisyon odaklıdır; uzamış aşırı yüklenme etkisi sınırlıdır.';
    }

    // Biyomekanik Form Cues
    el.inspCueText.textContent = ex.cue || 'Standart biyomekanik form ve eklem hizalanmasına dikkat edin.';

    // Görseli Güncelle
    updateInspectorImage();

    // Kas Aktivasyon Barlarını Oluştur
    renderActivationBars(ex);
}

function setVisualTab(tabName) {
    state.visualTab = tabName;
    el.btnTabForm.classList.toggle('active', tabName === 'form');
    el.btnTabAnatomi.classList.toggle('active', tabName === 'anatomi');
    updateInspectorImage();
}

function updateInspectorImage() {
    if (!state.selectedExercise) return;
    const ex = state.selectedExercise;
    const imgSrc = state.visualTab === 'form' ? ex.formImage : ex.anatomiImage;

    el.inspImageFallback.style.display = 'none';
    el.inspImage.style.display = 'block';

    if (imgSrc) {
        el.inspImage.onerror = () => {
            el.inspImage.style.display = 'none';
            el.inspImageFallback.style.display = 'flex';
        };
        el.inspImage.onload = () => {
            el.inspImage.style.display = 'block';
            el.inspImageFallback.style.display = 'none';
        };
        el.inspImage.src = imgSrc;
    } else {
        el.inspImage.style.display = 'none';
        el.inspImageFallback.style.display = 'flex';
    }
}

function renderActivationBars(ex) {
    const barsContainer = el.inspActivationBars;
    barsContainer.innerHTML = '';

    const pFactor = typeof ex.pFactor === 'number' ? ex.pFactor : 1.0;

    if (pFactor === 0 || ex.type === 'CONDITIONING') {
        barsContainer.innerHTML = `
            <div style="background: rgba(148, 163, 184, 0.1); border: 1px dashed rgba(148, 163, 184, 0.3); border-radius: 8px; padding: 12px; font-size: 11.5px; color: #94a3b8; line-height: 1.5;">
                ⚡ <strong>Metabolik / Kardiyo Protokolü:</strong><br>
                Bu hareket kardiyovasküler dayanıklılık ve kalori harcaması sağlar. Brad Schoenfeld ve RP katsayı modelinde hipertrofik kas büyümesine doğrudan <strong>0 set</strong> olarak etki eder.
            </div>
        `;
        return;
    }

    const items = [];

    // Birincil Kas
    items.push({
        muscle: ex.primary,
        factor: pFactor,
        isPrimary: true,
        color: '#eab308' // Gold
    });

    // İkincil / Sinerjist Kaslar
    if (ex.sec && typeof ex.sec === 'object') {
        const secColors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];
        let colorIdx = 0;
        for (const [secMuscle, factor] of Object.entries(ex.sec)) {
            items.push({
                muscle: secMuscle,
                factor: factor,
                isPrimary: false,
                color: secColors[colorIdx % secColors.length]
            });
            colorIdx++;
        }
    }

    barsContainer.innerHTML = items.map(item => `
        <div class="act-row">
            <div class="act-header">
                <span class="act-name">
                    ${item.muscle}
                    <span class="role-pill ${item.isPrimary ? 'role-primary' : 'role-sec'}">
                        ${item.isPrimary ? 'Birincil Hedef (1.0x)' : 'Sinerjist Destek'}
                    </span>
                </span>
                <span class="act-factor" style="color: ${item.color};">
                    ${(item.factor * 100).toFixed(0)}% (${item.factor.toFixed(2)} Set Katkısı)
                </span>
            </div>
            <div class="act-bar-track">
                <div class="act-bar-fill" style="width: ${Math.min(100, item.factor * 100)}%; background: ${item.color};"></div>
            </div>
        </div>
    `).join('');
}

function closeInspector() {
    state.selectedExercise = null;
    el.inspectorPlaceholder.style.display = 'flex';
    el.inspectorContent.style.display = 'none';
    el.labGrid.querySelectorAll('.lab-card').forEach(card => card.classList.remove('active'));
}

function setupLabResizer() {
    const resizer = document.getElementById('labResizer');
    const inspector = document.getElementById('labInspector');
    if (!resizer || !inspector) return;

    // Kaydedilmiş genişlik varsa uygula (Varsayılan 560px)
    const savedWidth = localStorage.getItem('fitlab_inspector_width');
    if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (parsed >= 420 && parsed <= 900) {
            inspector.style.width = `${parsed}px`;
        }
    }

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizer.classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        // Ekranın sağ kenarından fareye olan mesafe = inspector genişliği
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 420 && newWidth <= 920) {
            inspector.style.width = `${newWidth}px`;
        }
    });

    window.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            const finalWidth = parseInt(inspector.style.width, 10);
            if (finalWidth) {
                localStorage.setItem('fitlab_inspector_width', finalWidth);
            }
        }
    });
}


