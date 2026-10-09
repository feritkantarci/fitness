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
    excludedExerciseIds: JSON.parse(localStorage.getItem('fitlab_excluded_exercises') || '[]'),
    // Analytics Durumu (Web İle Birebir Eşit)
    currentWeeklyMuscleSource: 'week_projected',
    currentWeeklyMuscleFilter: 'all',
    currentWeeklyMuscleWeekOffset: 0,
    currentAnalyticsPeriodDays: 7
};

// DOM Elemanları
const el = {
    // Navigasyon & Görünümler
    viewDashboard: document.getElementById('viewDashboard'),
    viewLab: document.getElementById('viewLab'),
    viewAnalytics: document.getElementById('viewAnalytics'),
    tabBtnDashboard: document.getElementById('tabBtnDashboard'),
    tabBtnLab: document.getElementById('tabBtnLab'),
    tabBtnAnalytics: document.getElementById('tabBtnAnalytics'),
    desktopAnalyticsContainer: document.getElementById('desktopAnalyticsContainer'),

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
    inspLengthenedBadge: document.getElementById('inspLengthenedBadge'),
    labResizer: document.getElementById('labResizer'),
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
                renderDesktopAnalytics();
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
    if (el.tabBtnAnalytics) {
        el.tabBtnAnalytics.addEventListener('click', () => switchView('analytics'));
    }

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

        el.athleteSelect.innerHTML = usersWithCounts.map(u => {
            const rawName = u.name || u.username || 'Sporcu';
            const cleanName = rawName.replace(/\s*\(Admin\)/gi, '').trim();
            const roleTag = u.role === 'admin' ? ' (Admin)' : '';
            return `<option value="${u.id}">${cleanName}${roleTag}</option>`;
        }).join('');

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
        renderDesktopAnalytics();
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

function normalizeExerciseName(str) {
    if (!str) return '';
    return String(str).toLowerCase()
        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
        .replace(/\(.*?\)/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function findBestExerciseMatch(rawName, customCatalog) {
    if (!rawName) return null;
    const catalog = customCatalog || state.catalog || [];
    if (!Array.isArray(catalog) || catalog.length === 0) return null;

    const cleanRaw = String(rawName).replace(/\*+/g, '').trim();
    let match = catalog.find(e => e.id === cleanRaw || (e.name && e.name.toLowerCase() === cleanRaw.toLowerCase()));
    if (match) return match;

    const normRaw = normalizeExerciseName(cleanRaw);
    match = catalog.find(e => normalizeExerciseName(e.name) === normRaw);
    if (match) return match;

    const rawTokens = normRaw.split(' ').filter(t => t.length > 2);
    let bestMatch = null;
    let maxScore = 0;

    for (const ex of catalog) {
        const normEx = normalizeExerciseName(ex.name) + ' ' + (ex.id || '').replace(/_/g, ' ');
        let score = 0;
        for (const token of rawTokens) {
            if (normEx.includes(token)) {
                score += (token.length > 4 ? 2 : 1);
            }
        }
        if (score > maxScore && score >= 2) {
            maxScore = score;
            bestMatch = ex;
        }
    }
    return bestMatch;
}

function parseMarkdownProgram(text, catalog) {
    if (!text) return [];
    
    // Day header regex matching GÜN, SEANS, DAY, ANTRENMAN, or WEEKDAYS
    const dayRegex = /(?:^|\n)(?:#{1,4}\s*|\*{0,2})(?:[0-9]\.\s*)?(GÜN\s*[0-9A-ZÇĞİÖŞÜ]+|SEANS\s*[0-9A-ZÇĞİÖŞÜ]+|DAY\s*[0-9A-Z]+|ANTRENMAN\s*[0-9A-ZÇĞİÖŞÜ]+|PAZARTESİ|SALI|ÇARŞAMBA|PERŞEMBE|CUMA|CUMARTESİ|PAZAR)[^\n]*/gi;
    
    const matches = [];
    let match;
    while ((match = dayRegex.exec(text)) !== null) {
        const fullTitle = match[0].trim().replace(/^#+\s*/, '').replace(/\*+/g, '');
        // Filter out summary / analysis tables
        const lower = fullTitle.toLowerCase();
        if (!lower.includes('hacim') && !lower.includes('özet') && !lower.includes('tablo') && !lower.includes('değişim')) {
            matches.push({ title: fullTitle, index: match.index });
        }
    }

    const extractExercisesFromBlock = (block) => {
        const list = [];
        const lines = block.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
                const lower = trimmed.toLowerCase();
                if (lower.includes('egzersiz') || lower.includes('hareket') || lower.includes('kas grubu')) continue;
                const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
                if (cells.length >= 3) {
                    const rawName = cells[0].replace(/\*+/g, '').trim();
                    const sets = parseInt(cells[2]) || 3;
                    const reps = cells[3] || '8-12';
                    const note = cells[cells.length - 1] || '';
                    const matchedDb = findBestExerciseMatch(rawName, catalog);
                    const slugId = matchedDb ? matchedDb.id : ('ai_' + rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));

                    list.push({
                        id: slugId,
                        name: matchedDb ? matchedDb.name : rawName,
                        originalAiName: rawName,
                        targetSets: sets,
                        targetReps: reps,
                        note: note,
                        cue: note ? (note + (matchedDb && matchedDb.cue ? ' • ' + matchedDb.cue : '')) : (matchedDb ? matchedDb.cue : ''),
                        muscle: matchedDb ? matchedDb.muscle : 'Genel Kas Gelişimi & Fonksiyonel Güç',
                        equipment: matchedDb ? matchedDb.equipment : 'dumbbell',
                        diagram: matchedDb ? (matchedDb.formImage || null) : null,
                        formImage: matchedDb ? matchedDb.formImage : null,
                        anatomiImage: matchedDb ? matchedDb.anatomiImage : null
                    });
                }
            } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const bulletMatch = trimmed.match(/^[-*]\s*\*{0,2}(.*?)\*{0,2}\s*:\s*(.*)/);
                if (bulletMatch && !bulletMatch[1].toLowerCase().includes('hacim')) {
                    const rawName = bulletMatch[1].trim();
                    const matchedDb = findBestExerciseMatch(rawName, catalog);
                    const slugId = matchedDb ? matchedDb.id : ('ai_' + rawName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
                    list.push({
                        id: slugId,
                        name: matchedDb ? matchedDb.name : rawName,
                        originalAiName: rawName,
                        targetSets: 3,
                        targetReps: '8-12',
                        note: bulletMatch[2].trim(),
                        cue: bulletMatch[2].trim(),
                        muscle: matchedDb ? matchedDb.muscle : 'Genel Kas Gelişimi & Fonksiyonel Güç',
                        equipment: matchedDb ? matchedDb.equipment : 'dumbbell',
                        diagram: matchedDb ? (matchedDb.formImage || null) : null,
                        formImage: matchedDb ? matchedDb.formImage : null,
                        anatomiImage: matchedDb ? matchedDb.anatomiImage : null
                    });
                }
            }
        }
        return list;
    };

    if (matches.length === 0) {
        // Fallback: search for any ### or #### header
        const genericHeaderRegex = /(?:^|\n)(#{3,4}\s+[^\n]+)/g;
        let gMatch;
        while ((gMatch = genericHeaderRegex.exec(text)) !== null) {
            const title = gMatch[1].replace(/^#+\s*/, '').trim();
            const lower = title.toLowerCase();
            if (!lower.includes('hacim') && !lower.includes('özet') && !lower.includes('reçete')) {
                matches.push({ title: title, index: gMatch.index });
            }
        }
    }

    if (matches.length === 0) {
        return [{ dayTitle: 'FitLAB AI Antrenmanı', exercises: extractExercisesFromBlock(text) }];
    }

    const days = [];
    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
        const block = text.substring(start, end);
        const exercises = extractExercisesFromBlock(block);
        if (exercises.length > 0) {
            days.push({
                dayTitle: matches[i].title,
                exercises: exercises
            });
        }
    }

    if (days.length === 0) {
        return [{ dayTitle: 'FitLAB AI Antrenmanı', exercises: extractExercisesFromBlock(text) }];
    }

    return days;
}

async function pushProgramToAthleteWeb() {
    if (!state.lastAiReport || !state.selectedUserId) {
        alert('Lütfen önce bir analiz üretin.');
        return;
    }

    if (!Array.isArray(state.catalog) || state.catalog.length === 0) {
        try {
            state.catalog = await window.coachAPI.getExerciseCatalog() || [];
        } catch(e) {}
    }

    let programSection = state.lastAiReport.rawReport;
    const match = programSection.match(/### 3\..*?\n([\s\S]*?)$/i);
    if (match && match[1]) {
        programSection = match[1].trim();
    }

    const structuredDays = parseMarkdownProgram(programSection, state.catalog);

    const payload = {
        title: `FitLAB Hipertrofi & Güç Programı (${state.selectedUser.name})`,
        programText: programSection,
        structuredDays: structuredDays,
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

// ==================== VIEW CONTROLLER ====================
function switchView(viewName) {
    state.currentView = viewName;
    if (viewName === 'dashboard') {
        el.viewDashboard.style.display = 'flex';
        el.viewLab.style.display = 'none';
        if (el.viewAnalytics) el.viewAnalytics.style.display = 'none';
        el.tabBtnDashboard.classList.add('active');
        el.tabBtnLab.classList.remove('active');
        if (el.tabBtnAnalytics) el.tabBtnAnalytics.classList.remove('active');
    } else if (viewName === 'analytics') {
        el.viewDashboard.style.display = 'none';
        el.viewLab.style.display = 'none';
        if (el.viewAnalytics) el.viewAnalytics.style.display = 'flex';
        el.tabBtnDashboard.classList.remove('active');
        el.tabBtnLab.classList.remove('active');
        if (el.tabBtnAnalytics) el.tabBtnAnalytics.classList.add('active');
        renderDesktopAnalytics();
    } else {
        el.viewDashboard.style.display = 'none';
        el.viewLab.style.display = 'flex';
        if (el.viewAnalytics) el.viewAnalytics.style.display = 'none';
        el.tabBtnDashboard.classList.remove('active');
        el.tabBtnLab.classList.add('active');
        if (el.tabBtnAnalytics) el.tabBtnAnalytics.classList.remove('active');
        if (state.catalog.length === 0) {
            loadExerciseCatalog();
        }
    }
}
window.switchView = switchView;

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
        const typeLabel = ex.typeLabel ? ex.typeLabel.split(' ')[0] : 'Kuvvet';

        return `
            <div class="lab-card ${isActive ? 'active' : ''} ${isExcluded ? 'is-card-excluded' : ''}" data-id="${ex.id}">
                <div class="lab-card-header">
                    <div class="lab-card-title">${ex.name} ${isExcluded ? '<span style="color:#f87171; font-size:10px; font-weight:800; margin-left:4px;">[GİZLİ]</span>' : ''}</div>
                </div>
                <div class="lab-card-tags">
                    <span class="muscle-pill">${ex.primary}</span>
                    <span class="type-pill">${typeLabel}</span>
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

    // Uzamışta Gerilim Rozeti
    if (el.inspLengthenedBadge) {
        el.inspLengthenedBadge.textContent = ex.lengthened ? 'Uzamış Gerilim: Var' : 'Uzamış Gerilim: Yok';
        el.inspLengthenedBadge.className = `badge-lengthened ${ex.lengthened ? '' : 'no'}`;
        el.inspLengthenedBadge.title = ex.lengthened 
            ? 'Kas gergin pozisyondayken maksimum mekanik gerilim üretir (Stretch-Mediated Hipertrofi).'
            : 'Hareket tepe sıkıştırma veya kısalmış pozisyon odaklıdır.';
    }

    // Biyomekanik Form Cues & Pozisyon Adımları
    if (Array.isArray(ex.positions) && ex.positions.length > 0) {
        let posHtml = `<p style="margin-bottom:8px;">${ex.cue || ''}</p><div class="cue-phases" style="display:flex; flex-direction:column; gap:6px; margin-top:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">`;
        ex.positions.forEach(p => {
            posHtml += `<div style="font-size:0.82rem; line-height:1.4;"><strong style="color:var(--cyan, #38bdf8);">${p.phase}:</strong> <span style="color:#94a3b8;">${p.desc}</span></div>`;
        });
        posHtml += `</div>`;
        el.inspCueText.innerHTML = posHtml;
    } else {
        el.inspCueText.textContent = ex.cue || 'Standart biyomekanik form ve eklem hizalanmasına dikkat edin.';
    }

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
    // Form sekmesinde sadece Gerçek İnsan Fotoğraflı Form Rehberi (formImage), anatomi sekmesinde anatomi görseli
    const imgSrc = state.visualTab === 'form' 
        ? (ex.formImage || null) 
        : (ex.anatomiImage || ex.formImage || null);

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
                        ${item.isPrimary ? 'Ana Kas' : 'Destek Kas'}
                    </span>
                </span>
                <span class="act-factor" style="color: ${item.color}; font-weight: 800;">
                    +${item.factor.toFixed(2)} Set (%${Math.round(item.factor * 100)})
                </span>
            </div>
            <div class="act-bar-track">
                <div class="act-bar-fill" style="width: ${Math.min(100, item.factor * 100)}%; background: ${item.color};"></div>
            </div>
        </div>
    `).join('') + `
        <div style="margin-top: 14px; padding: 10px 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: 8px; font-size: 11.5px; color: var(--text-muted); line-height: 1.45;">
            💡 <em>Bu egzersizden yapacağınız her 1 çalışma seti, kas gruplarınıza yukarıdaki oranlarda eklenir (Örn: 4 set = her kas için set × oran).</em>
        </div>
    `;
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

// ==================== BİYOMEKANİK ANALİZ & ÇUBUKLAR MODÜLÜ (WEB İLE BİREBİR EŞİT) ====================

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHTML = escapeHTML;

const ACADEMIC_MUSCLE_TO_ID = {
    'Göğüs': 'chest',
    'Sırt': 'back',
    'Omuz': 'shoulders',
    'Ön Bacak': 'quads',
    'Arka Bacak': 'hamstrings',
    'Glute': 'glutes',
    'Kalça': 'glutes',
    'Biceps': 'biceps',
    'Triceps': 'triceps',
    'Karın/Core': 'core',
    'Karın': 'core',
    'Core': 'core',
    'Kalf': 'calves',
    'chest': 'chest',
    'back': 'back',
    'shoulders': 'shoulders',
    'quads': 'quads',
    'hamstrings': 'hamstrings',
    'glutes': 'glutes',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'core': 'core',
    'calves': 'calves'
};

const WEEKLY_MUSCLE_CONFIG = [
    { id: 'chest', name: 'Göğüs', icon: '🛡️', optimalMin: 8, optimalMax: 18, desc: 'Pectoralis Major & Minor' },
    { id: 'back', name: 'Sırt & Kanat', icon: '🏹', optimalMin: 8, optimalMax: 20, desc: 'Latissimus, Rhomboid, Trapez' },
    { id: 'shoulders', name: 'Omuz', icon: '⚔️', optimalMin: 8, optimalMax: 18, desc: 'Ön, Yan, Arka Deltoid' },
    { id: 'quads', name: 'Ön Bacak', icon: '🦵', optimalMin: 8, optimalMax: 18, desc: 'Quadriceps (Squat/Lunge)' },
    { id: 'hamstrings', name: 'Arka Bacak', icon: '🦿', optimalMin: 6, optimalMax: 16, desc: 'Biceps Femoris (RDL/Hinge)' },
    { id: 'glutes', name: 'Kalça', icon: '🍑', optimalMin: 6, optimalMax: 16, desc: 'Gluteus Maximus / Medius' },
    { id: 'biceps', name: 'Biceps (Pazı)', icon: '💪', optimalMin: 6, optimalMax: 16, desc: 'Biceps Brachii & Kol Çekiş' },
    { id: 'triceps', name: 'Triceps (Arka Kol)', icon: '⚡', optimalMin: 6, optimalMax: 16, desc: 'Triceps Brachii & Kol İtiş' },
    { id: 'core', name: 'Karın & Core', icon: '🧱', optimalMin: 6, optimalMax: 16, desc: 'Rectus Abdominis & Oblikler' },
    { id: 'calves', name: 'Kalf & Alt Bacak', icon: '🦶', optimalMin: 3, optimalMax: 12, desc: 'Gastrocnemius & Soleus' }
];

function resolveExerciseBiomechanics(rawName, muscleHint, categoryHint) {
    if (!rawName) return { primary: 'Göğüs', pFactor: 0.5, sec: {}, type: 'HYBRID', sfr: 'MODERATE', lengthened: false };
    const normKey = String(rawName).trim().toLowerCase();

    // 1. Katalogda ara
    if (state.catalog && state.catalog.length > 0) {
        const found = state.catalog.find(c => c.name.toLowerCase() === normKey || c.rawKey === normKey || (c.id && normKey.includes(c.id)));
        if (found) {
            return {
                primary: found.primary,
                pFactor: typeof found.pFactor === 'number' ? found.pFactor : 1.0,
                sec: found.sec || {},
                type: found.type || 'STRENGTH',
                sfr: found.sfr || 'MODERATE',
                lengthened: Boolean(found.lengthened)
            };
        }
    }

    // 2. Kural Tabanlı Fallback
    const text = normKey;
    if (text.includes('burpee') || text.includes('mountain') || text.includes('jumping') || text.includes('cardio') || text.includes('koşu') || text.includes('ip atlama')) {
        return { primary: 'Kondisyon / Kardiyo', pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'LOW', lengthened: false };
    }
    if (text.includes('bench') || text.includes('şınav') || text.includes('push-up') || text.includes('chest') || text.includes('göğüs')) {
        const isBw = text.includes('şınav') || text.includes('push-up');
        return { primary: 'Göğüs', pFactor: isBw ? 0.65 : 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: isBw ? 'BODYWEIGHT_STRENGTH' : 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true };
    }
    if (text.includes('row') || text.includes('lat') || text.includes('barfiks') || text.includes('pull-up') || text.includes('çekiş') || text.includes('sırt')) {
        return { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true };
    }
    if (text.includes('press') && (text.includes('omuz') || text.includes('overhead') || text.includes('arnold'))) {
        return { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true };
    }
    if (text.includes('squat') || text.includes('lunge') || text.includes('bacak') || text.includes('quad')) {
        return { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true };
    }
    if (text.includes('rdl') || text.includes('deadlift') || text.includes('hamstring') || (text.includes('curl') && text.includes('leg'))) {
        return { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true };
    }
    if (text.includes('swing') || text.includes('thrust') || text.includes('glute') || text.includes('kalça')) {
        return { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40 }, type: 'BALLISTIC_POWER', sfr: 'HIGH', lengthened: false };
    }
    if (text.includes('curl') || text.includes('biceps')) {
        return { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false };
    }
    if (text.includes('triceps') || text.includes('pushdown') || text.includes('skull')) {
        return { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true };
    }
    if (text.includes('calf') || text.includes('kalf') || text.includes('baldır')) {
        return { primary: 'Kalf', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true };
    }
    if (text.includes('plank') || text.includes('core') || text.includes('karın') || text.includes('twist') || text.includes('crunch')) {
        return { primary: 'Karın/Core', pFactor: 0.60, sec: {}, type: 'CORE', sfr: 'MODERATE', lengthened: false };
    }
    return { primary: muscleHint || 'Göğüs', pFactor: 0.70, sec: {}, type: 'HYBRID', sfr: 'MODERATE', lengthened: false };
}

function getWeeklyMuscleBounds(weekOffset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + (weekOffset * 7));
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const label = `${monday.getDate()} ${months[monday.getMonth()]} - ${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;

    return { monday, sunday, label, isCurrentWeek: weekOffset === 0 };
}

function getDesktopRecommendationsForMuscle(muscleId, max = 4) {
    if (!Array.isArray(state.catalog) || state.catalog.length === 0) return [];
    const cfg = WEEKLY_MUSCLE_CONFIG.find(m => m.id === muscleId);
    const mName = cfg ? cfg.name : muscleId;

    let list = state.catalog.filter(e => {
        const pId = ACADEMIC_MUSCLE_TO_ID[e.primary] || e.primary;
        return pId === muscleId || (e.primary && e.primary.includes(mName));
    });

    if (list.length < max) {
        const secList = state.catalog.filter(e => {
            if (list.includes(e)) return false;
            if (e.sec && typeof e.sec === 'object') {
                return Object.keys(e.sec).some(k => {
                    const sId = ACADEMIC_MUSCLE_TO_ID[k] || k;
                    return sId === muscleId || k.includes(mName);
                });
            }
            return false;
        });
        list = list.concat(secList);
    }

    return list.slice(0, max);
}

function openLabExerciseFromAnalytics(exId) {
    if (!exId) return;
    const found = (state.catalog || []).find(c => c.id === exId) || (state.catalog || []).find(c => c.name.toLowerCase() === exId.toLowerCase());
    if (found) {
        switchView('lab');
        selectLabExercise(found);
    }
}
window.openLabExerciseFromAnalytics = openLabExerciseFromAnalytics;

function formatDateTr(rawDate) {
    if (!rawDate) return '-';
    const dt = new Date(rawDate);
    if (isNaN(dt.getTime())) return String(rawDate);
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return `${dt.getDate()} ${months[dt.getMonth()]} ${days[dt.getDay()]}`;
}
window.formatDateTr = formatDateTr;

function calculateDesktopWeeklyMuscleSufficiency(sourceMode = 'week_projected', weekOffset = 0) {
    const bounds = getWeeklyMuscleBounds(weekOffset);
    const allLogs = state.workoutLogs || [];

    const weekLogs = allLogs.filter(l => {
        let dt = new Date(l.date);
        if (isNaN(dt.getTime()) && typeof l.timestamp === 'number') {
            dt = new Date(l.timestamp);
        }
        return dt >= bounds.monday && dt <= bounds.sunday;
    });

    const map = {};
    WEEKLY_MUSCLE_CONFIG.forEach(m => {
        map[m.id] = {
            id: m.id,
            name: m.name,
            icon: m.icon,
            desc: m.desc,
            optimalMin: m.optimalMin,
            optimalMax: m.optimalMax,
            doneDirectSets: 0,
            doneSecondarySets: 0,
            planDirectSets: 0,
            planSecondarySets: 0,
            scheduledTotalSets: 0,
            scheduledSecondarySets: 0,
            doneExercises: new Set(),
            plannedExercises: new Map(),
            contributions: []
        };
    });

    // 1. Gerçekleşen Antrenman Loglarını Biyomekanik Katsayılarla İşle
    weekLogs.forEach(log => {
        if (!log.exercises || !Array.isArray(log.exercises)) return;
        const dateStr = log.dateFormatted || formatDateTr(log.date || log.timestamp);
        const sessionTitle = log.title || log.workoutName || 'Antrenman Seansı';

        log.exercises.forEach(ex => {
            const cSets = Number(ex.completedSetsCount) || 
                (Array.isArray(ex.sets) ? ex.sets.filter(s => s.completed || parseInt(s.reps, 10) > 0).length : 0) || 
                Number(ex.targetSets) || Number(ex.sets) || 0;
            if (cSets <= 0) return;

            const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
            if (!spec || spec.type === 'CONDITIONING' || spec.pFactor === 0) {
                return;
            }

            // Birincil Hedef Kas Grubu
            const primId = ACADEMIC_MUSCLE_TO_ID[spec.primary] || spec.primary;
            if (primId && map[primId] && spec.pFactor > 0) {
                const directAdd = cSets * spec.pFactor;
                map[primId].doneDirectSets += directAdd;
                map[primId].doneExercises.add(ex.name);

                map[primId].contributions.push({
                    date: dateStr,
                    sessionTitle: sessionTitle,
                    exercise: ex.name,
                    rawSets: cSets,
                    role: 'Birincil',
                    factor: spec.pFactor,
                    earnedSets: Math.round(directAdd * 10) / 10
                });
            }

            // İkincil / Sinerjist Kas Grupları
            if (spec.sec && typeof spec.sec === 'object') {
                Object.entries(spec.sec).forEach(([secName, secFactor]) => {
                    const secId = ACADEMIC_MUSCLE_TO_ID[secName] || secName;
                    if (secId && map[secId] && secFactor > 0) {
                        const secAdd = cSets * secFactor;
                        map[secId].doneSecondarySets += secAdd;

                        map[secId].contributions.push({
                            date: dateStr,
                            sessionTitle: sessionTitle,
                            exercise: ex.name,
                            rawSets: cSets,
                            role: 'Sinerjist / Destek',
                            factor: secFactor,
                            earnedSets: Math.round(secAdd * 10) / 10
                        });
                    }
                });
            }
        });
    });

    // 2. Metrikleri ve Kademeli Hipertrofi Değerlendirmesini Sonuçlandır
    const summary = {
        totalMuscles: WEEKLY_MUSCLE_CONFIG.length,
        workedCount: 0,
        optimalCount: 0,
        insufficientCount: 0,
        unworkedCount: 0,
        highCount: 0
    };

    const unworkedNames = [];
    const insufficientNames = [];
    const optimalNames = [];

    const muscles = WEEKLY_MUSCLE_CONFIG.map(cfg => {
        const data = map[cfg.id];
        const effectiveDone = Math.round((data.doneDirectSets + data.doneSecondarySets) * 10) / 10;
        const effectivePlan = Math.round((data.planDirectSets + data.planSecondarySets) * 10) / 10;
        const effectiveProjected = Math.round((effectiveDone + effectivePlan) * 10) / 10;

        let evalVolume = effectiveDone;
        if (effectiveDone > 0) summary.workedCount++;

        let status = 'unworked';
        let statusBadge = '❌ Hiç Çalıştırılmadı';
        let statusColor = '#ef4444';
        let statusBg = 'rgba(239, 68, 68, 0.12)';
        let statusDesc = 'Bu kas grubu için antrenman hacmi bulunmuyor.';

        if (evalVolume === 0) {
            status = 'unworked';
            summary.unworkedCount++;
            unworkedNames.push(cfg.name);
        } else if (evalVolume < cfg.optimalMin) {
            status = 'insufficient';
            statusBadge = '⚠️ Yetersiz Hacim';
            statusColor = '#f59e0b';
            statusBg = 'rgba(245, 158, 11, 0.12)';
            statusDesc = `Minimum gelişim eşiğinin altında (${evalVolume.toFixed(1)}/${cfg.optimalMin} set).`;
            summary.insufficientCount++;
            insufficientNames.push(cfg.name);
        } else if (evalVolume <= cfg.optimalMax) {
            status = 'optimal';
            statusBadge = '✅ Yeterli & Optimal';
            statusColor = '#10b981';
            statusBg = 'rgba(16, 185, 129, 0.12)';
            statusDesc = `İdeal hipertrofi & adaptasyon aralığında (${evalVolume.toFixed(1)} set).`;
            summary.optimalCount++;
            optimalNames.push(cfg.name);
        } else {
            status = 'high';
            statusBadge = '🔥 Yüksek Hacim';
            statusColor = '#818cf8';
            statusBg = 'rgba(129, 140, 248, 0.12)';
            statusDesc = `Yoğun aşırı yükleme (${evalVolume.toFixed(1)} set); toparlanmaya özen gösterin.`;
            summary.highCount++;
            optimalNames.push(cfg.name);
        }

        return {
            id: cfg.id,
            name: cfg.name,
            icon: cfg.icon,
            desc: cfg.desc,
            optimalMin: cfg.optimalMin,
            optimalMax: cfg.optimalMax,
            doneDirectSets: Math.round(data.doneDirectSets * 10) / 10,
            doneSecondarySets: Math.round(data.doneSecondarySets * 10) / 10,
            effectiveDone,
            planDirectSets: Math.round(data.planDirectSets * 10) / 10,
            planSecondarySets: Math.round(data.planSecondarySets * 10) / 10,
            effectivePlan,
            projectedSets: effectiveProjected,
            effectiveTotal: evalVolume,
            status,
            statusBadge,
            statusColor,
            statusBg,
            statusDesc,
            doneExercises: Array.from(data.doneExercises),
            contributions: data.contributions || []
        };
    });

    return {
        bounds,
        sourceMode,
        weekOffset,
        totalDoneSessions: weekLogs.length,
        summary,
        unworkedNames,
        insufficientNames,
        optimalNames,
        muscles
    };
}

function setDesktopWeeklyMuscleFilter(f) {
    state.currentWeeklyMuscleFilter = f;
    renderDesktopAnalytics();
}
window.setDesktopWeeklyMuscleFilter = setDesktopWeeklyMuscleFilter;

function setDesktopWeeklyMuscleSource(s) {
    state.currentWeeklyMuscleSource = s;
    renderDesktopAnalytics();
}
window.setDesktopWeeklyMuscleSource = setDesktopWeeklyMuscleSource;

function setDesktopWeeklyMuscleOffset(o) {
    state.currentWeeklyMuscleWeekOffset = o;
    renderDesktopAnalytics();
}
window.setDesktopWeeklyMuscleOffset = setDesktopWeeklyMuscleOffset;

function setDesktopAnalyticsPeriod(p) {
    state.currentAnalyticsPeriodDays = p;
    renderDesktopAnalytics();
}
window.setDesktopAnalyticsPeriod = setDesktopAnalyticsPeriod;

const MUSCLE_DIAGRAM_DEFS = {
    shoulders: {
        title: 'OMUZ',
        columns: [
            { key: 'front', label: 'ÖN DELTOİT', subKeys: ['shoulders_front'], recId: 'db_overhead_press', recName: 'Omuz Presi', keywords: ['ön omuz', 'front delt', 'overhead', 'arnold', 'press', 'snatch'] },
            { key: 'side', label: 'YAN DELTOİT', subKeys: ['shoulders_side'], recId: 'db_lateral_raise', recName: 'Lateral Raise', keywords: ['yan omuz', 'side delt', 'lateral'] },
            { key: 'rear', label: 'ARKA DELTOİT', subKeys: ['shoulders_rear'], recId: 'mach_face_pull', recName: 'Face Pull', keywords: ['arka omuz', 'rear delt', 'face pull', 'halo'] }
        ]
    },
    back: {
        title: 'SIRT',
        columns: [
            { key: 'lats', label: 'LATİSSİMUS (KANAT)', subKeys: ['back_lats'], recId: 'mach_lat_pulldown', recName: 'Lat Pulldown', keywords: ['kanat', 'lats', 'latissimus', 'pulldown', 'pullup', 'chinup', 'saw row', 'pullover'] },
            { key: 'mid', label: 'RHOMBOİD (ORTA SIRT)', subKeys: ['back_mid'], recId: 'db_chest_supported_row', recName: 'Göğüs Destekli Row', keywords: ['orta sırt', 'rhomboid', 'row', 'kürek', 'pendlay', 'renegade row'] },
            { key: 'traps', label: 'TRAPEZ (ÜST SIRT)', subKeys: ['traps'], recId: 'mach_face_pull', recName: 'Face Pull / Shrug', keywords: ['trapez', 'shrug', 'face pull', 'clean', 'farmers', 'halo', 'deadlift'] }
        ]
    },
    chest: {
        title: 'GÖĞÜS',
        columns: [
            { key: 'upper', label: 'ÜST GÖĞÜS (CLAVICULAR)', subKeys: ['chest_upper'], recId: 'db_incline_press', recName: 'Incline Press', keywords: ['üst göğüs', 'incline', 'decline pushup', 'landmine'] },
            { key: 'mid', label: 'ORTA GÖĞÜS (STERNAL)', subKeys: ['chest_mid'], recId: 'db_bench_press', recName: 'Bench Press', keywords: ['orta göğüs', 'bench press', 'floor press', 'pushup', 'şınav', 'pec deck', 'crossover', 'renegade'] },
            { key: 'lower', label: 'ALT GÖĞÜS (COSTAL)', subKeys: ['chest_lower'], recId: 'bw_dips', recName: 'Dips', keywords: ['alt göğüs', 'dips', 'crossover alt'] }
        ]
    },
    quads: {
        title: 'ÖN BACAK (QUADRICEPS)',
        columns: [
            { key: 'vastus_lat', label: 'VASTUS LATERALIS (DIŞ)', subKeys: ['legs_quad'], recId: 'bb_back_squat', recName: 'Squat', keywords: ['squat', 'leg press', 'front squat', 'goblet'] },
            { key: 'vastus_med', label: 'VASTUS MEDIALIS (GÖZYAŞI)', subKeys: ['legs_quad'], recId: 'db_bulgarian_squat', recName: 'Bulgarian Split Squat', keywords: ['bulgarian', 'lunge', 'step up', 'zercher'] },
            { key: 'rectus_fem', label: 'RECTUS FEMORIS (DÜZ)', subKeys: ['legs_quad'], recId: 'mach_leg_extension', recName: 'Leg Extension', keywords: ['leg extension', 'quad izole', 'jump'] }
        ]
    },
    hamstrings: {
        title: 'ARKA BACAK (POSTERIOR CHAIN)',
        columns: [
            { key: 'biceps_fem', label: 'BICEPS FEMORIS (DIŞ)', subKeys: ['legs_hamstrings'], recId: 'mach_leg_curl', recName: 'Leg Curl', keywords: ['leg curl', 'curl', 'arka bacak'] },
            { key: 'semitend', label: 'SEMİTENDİNOSUS (İÇ)', subKeys: ['legs_hamstrings'], recId: 'db_rdl', recName: 'Romanian Deadlift (RDL)', keywords: ['rdl', 'romanian', 'deadlift'] },
            { key: 'hinge_chain', label: 'POSTERIOR HİNGE ZİNCİRİ', subKeys: ['legs_hamstrings'], recId: 'db_swing', recName: 'Kettlebell Swing', keywords: ['swing', 'single leg rdl', 'good morning'] }
        ]
    },
    glutes: {
        title: 'KALÇA (GLUTEUS)',
        columns: [
            { key: 'maximus', label: 'GLUTEUS MAXIMUS (BÜYÜK)', subKeys: ['legs_glutes'], recId: 'bb_hip_thrust', recName: 'Hip Thrust', keywords: ['hip thrust', 'glute bridge', 'deadlift', 'squat'] },
            { key: 'medius', label: 'GLUTEUS MEDIUS (YAN/DENGE)', subKeys: ['legs_glutes'], recId: 'db_bulgarian_squat', recName: 'Bulgarian Split Squat', keywords: ['bulgarian', 'lunge', 'abduction', 'tek bacak', 'denge'] },
            { key: 'minimus', label: 'PELVİK & ROTATÖR STABİLİTE', subKeys: ['legs_glutes'], recId: 'db_single_leg_rdl', recName: 'Tek Bacak RDL', keywords: ['single leg', 'rotatör', 'pelvik'] }
        ]
    },
    biceps: {
        title: 'BICEPS & ÖN KOL',
        columns: [
            { key: 'long_head', label: 'UZUN BAŞ (DIŞ/ZİRVE)', subKeys: ['biceps'], recId: 'db_incline_curl', recName: 'Incline Curl', keywords: ['incline curl', 'pazu tepe', 'uzun baş'] },
            { key: 'short_head', label: 'KISA BAŞ (İÇ KÜTLE)', subKeys: ['biceps'], recId: 'bb_biceps_curl', recName: 'Barbell / Biceps Curl', keywords: ['biceps curl', 'barbell curl', 'cable curl'] },
            { key: 'brachialis', label: 'BRACHIALIS & ÖN KOL', subKeys: ['biceps'], recId: 'db_hammer_curl', recName: 'Hammer Curl', keywords: ['hammer', 'chinup', 'ön kol', 'kavrama', 'brachialis'] }
        ]
    },
    triceps: {
        title: 'TRICEPS (ARKA KOL)',
        columns: [
            { key: 'long', label: 'UZUN BAŞ (BAŞÜSTÜ)', subKeys: ['triceps_long'], recId: 'db_triceps_overhead', recName: 'Overhead Triceps', keywords: ['overhead', 'skullcrusher', 'french', 'uzun baş'] },
            { key: 'lateral', label: 'YAN/DIŞ BAŞ (AT NALI)', subKeys: ['triceps_lateral'], recId: 'mach_triceps_pushdown', recName: 'Triceps Pushdown', keywords: ['pushdown', 'close grip', 'cable triceps'] },
            { key: 'medial', label: 'MEDİAL BAŞ (DİRSEK KİLİT)', subKeys: ['triceps_lateral'], recId: 'bw_diamond_pushup', recName: 'Diamond Pushup / Dips', keywords: ['dips', 'diamond', 'bench', 'itiş'] }
        ]
    },
    core: {
        title: 'KARIN & MERKEZ (CORE)',
        columns: [
            { key: 'rectus', label: 'REKTUS ABDOMİNİS (ÖN DUVAR)', subKeys: ['core_front'], recId: 'bw_hanging_knee_raise', recName: 'Hanging Knee Raise', keywords: ['plank', 'hanging', 'hollow', 'crunch', 'mountain'] },
            { key: 'obliques', label: 'OBLİKLER (YAN KARIN/ROTASYON)', subKeys: ['core_obliques'], recId: 'db_russian_twist', recName: 'Russian Twist', keywords: ['twist', 'woodchopper', 'suitcase', 'oblik', 'renegade', 'chop'] },
            { key: 'transverse', label: 'TRANSVERSUS & DERİN ZIRH', subKeys: ['core_front'], recId: 'db_farmers_walk', recName: 'Farmers Walk', keywords: ['farmers', 'carry', 'bear crawl', 'stabilite', 'zırh'] }
        ]
    },
    calves: {
        title: 'BALDIR & KALF',
        columns: [
            { key: 'gastrocnemius', label: 'GASTROCNEMİUS (AYAKTA)', subKeys: ['legs_calves'], recId: 'mach_calf_raise', recName: 'Ayakta Calf Raise', keywords: ['standing calf', 'calf raise', 'zıplama', 'jump', 'ayakta kalf', 'baldır'] },
            { key: 'soleus', label: 'SOLEUS (OTURARAK)', subKeys: ['legs_calves'], recId: 'mach_calf_raise', recName: 'Oturarak Calf Raise', keywords: ['seated calf', 'baldır'] },
            { key: 'tibialis', label: 'TİBİALİS ANTERİOR (KAVAL)', subKeys: ['legs_calves'], recId: 'mach_calf_raise', recName: 'Kaval & Denge', keywords: ['ayak bileği', 'kaval', 'yürüme'] }
        ]
    }
};

function getDesktopExerciseCompartmentForMuscle(muscleId, exNameOrId) {
    const def = MUSCLE_DIAGRAM_DEFS[muscleId];
    if (!def) return null;

    const catalog = state.catalog || [];
    const dbEx = catalog.find(e => e.id === exNameOrId || (e.name && e.name.toLowerCase() === (exNameOrId || '').toLowerCase()));
    const textToSearch = [
        exNameOrId || '',
        dbEx ? dbEx.name : '',
        dbEx ? dbEx.primary : '',
        dbEx ? dbEx.rawKey : ''
    ].join(' ').toLowerCase();

    for (const col of def.columns) {
        for (const kw of col.keywords) {
            if (textToSearch.includes(kw.toLowerCase())) {
                return col.key;
            }
        }
    }
    return def.columns[0].key;
}

function renderDesktopMuscleCompartmentDiagram(m) {
    const def = MUSCLE_DIAGRAM_DEFS[m.id];
    if (!def) return '';

    const compMap = {};
    def.columns.forEach(col => {
        compMap[col.key] = {
            col,
            earnedSets: 0,
            plannedCount: 0,
            doneExs: new Set(),
            plannedExs: new Set()
        };
    });

    (m.contributions || []).forEach(c => {
        const cKey = getDesktopExerciseCompartmentForMuscle(m.id, c.exercise);
        if (cKey && compMap[cKey]) {
            compMap[cKey].earnedSets += (Number(c.earnedSets) || 0);
            compMap[cKey].doneExs.add(c.exercise);
        }
    });

    if ((!m.contributions || m.contributions.length === 0) && m.doneExercises && Array.isArray(m.doneExercises)) {
        m.doneExercises.forEach(exName => {
            const cKey = getDesktopExerciseCompartmentForMuscle(m.id, exName);
            if (cKey && compMap[cKey]) {
                compMap[cKey].doneExs.add(exName);
                if (compMap[cKey].earnedSets === 0) compMap[cKey].earnedSets = 1;
            }
        });
    }

    (m.plannedExercises || []).forEach(pe => {
        const pName = typeof pe === 'string' ? pe : (pe.name || '');
        const cKey = getDesktopExerciseCompartmentForMuscle(m.id, pName);
        if (cKey && compMap[cKey]) {
            compMap[cKey].plannedCount += 1;
            compMap[cKey].plannedExs.add(pName);
        }
    });

    const columnsHTML = def.columns.map(col => {
        const data = compMap[col.key];
        const isDone = data.earnedSets > 0;
        const isPlanned = !isDone && data.plannedExs.size > 0;

        let statusBadge = '';
        let contentHTML = '';
        let cellBg = 'rgba(255,255,255,0.02)';
        let cellBorder = '1px solid rgba(255,255,255,0.07)';

        if (isDone) {
            cellBg = 'rgba(16, 185, 129, 0.07)';
            cellBorder = '1px solid rgba(16, 185, 129, 0.28)';
            statusBadge = `<span style="display:inline-block; font-size:10px; font-weight:800; color:#34d399; background:rgba(16,185,129,0.18); border:1px solid rgba(16,185,129,0.35); border-radius:4px; padding:2px 6px;">✅ ${data.earnedSets.toFixed(1)} Set</span>`;
            const exList = Array.from(data.doneExs).map(escapeHTML).join(', ');
            const planList = data.plannedExs.size > 0 ? `<div style="font-size:9.5px; color:#fcd34d; margin-top:3px;">+ ${Array.from(data.plannedExs).map(escapeHTML).join(', ')} (Planda)</div>` : '';
            contentHTML = `<div style="font-size:10px; color:#cbd5e1; margin-top:4px; line-height:1.35;"><strong>${exList}</strong>${planList}</div>`;
        } else if (isPlanned) {
            cellBg = 'rgba(245, 158, 11, 0.07)';
            cellBorder = '1px solid rgba(245, 158, 11, 0.28)';
            statusBadge = `<span style="display:inline-block; font-size:10px; font-weight:800; color:#fbbf24; background:rgba(245,158,11,0.18); border:1px solid rgba(245,158,11,0.35); border-radius:4px; padding:2px 6px;">🟡 Planda (${data.plannedCount} Hrk)</span>`;
            const planList = Array.from(data.plannedExs).map(escapeHTML).join(', ');
            contentHTML = `<div style="font-size:10px; color:#fde68a; margin-top:4px; line-height:1.35;">${planList}</div>`;
        } else {
            cellBg = 'rgba(239, 68, 68, 0.06)';
            cellBorder = '1px solid rgba(239, 68, 68, 0.28)';
            statusBadge = `<span style="display:inline-block; font-size:9.5px; font-weight:800; color:#f87171; background:rgba(239,68,68,0.16); border:1px solid rgba(239,68,68,0.32); border-radius:4px; padding:2px 5px;">⚠️ 0 Set (Boşta!)</span>`;
            contentHTML = `
                <div style="margin-top:6px;">
                    <button class="btn btn-outline" style="font-size:9.5px; padding:3px 6px; border-radius:5px; color:var(--gold); border-color:rgba(245,158,11,0.5); width:100%; text-align:center; font-weight:700; background:rgba(0,0,0,0.4); cursor:pointer;" onclick="openLabExerciseFromAnalytics('${col.recId}')" title="Bu başı çalıştırmak için Lab Atlasında ${col.recName} incele">
                        ➕ ${escapeHTML(col.recName)} İncele
                    </button>
                </div>
            `;
        }

        return `
            <div style="background:${cellBg}; border:${cellBorder}; border-radius:6px; padding:8px; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <div style="font-size:10.5px; font-weight:800; color:#fff; margin-bottom:5px; letter-spacing:0.3px;">${escapeHTML(col.label)}</div>
                    <div>${statusBadge}</div>
                </div>
                ${contentHTML}
            </div>
        `;
    }).join('');

    return `
        <div style="margin-top:10px; border:1px solid rgba(255,255,255,0.12); border-radius:8px; overflow:hidden; background:rgba(0,0,0,0.35);">
            <div style="background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.1); padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11px; font-weight:900; letter-spacing:0.8px; color:var(--gold); text-transform:uppercase;">
                    📐 ${escapeHTML(def.title)} — ANATOMİK ALT BÖLGE DAĞILIMI
                </span>
                <span style="font-size:9.5px; color:var(--text-secondary);">
                    Hangi Baş Çalıştı?
                </span>
            </div>
            <div style="padding:8px; display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:6px;">
                ${columnsHTML}
            </div>
        </div>
    `;
}

function renderDesktopAnalytics() {
    if (!el.desktopAnalyticsContainer) return;

    if (!state.selectedUserId) {
        el.desktopAnalyticsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="font-size: 40px; margin-bottom: 12px;">👤</div>
                <h3 style="font-size: 16px; color: #fff;">Sporcu Seçilmedi</h3>
                <p style="font-size: 13px; margin-top: 4px;">Sol panelden bir sporcu seçerek biyomekanik analiz çubuklarını ve karnesini görüntüleyin.</p>
            </div>
        `;
        return;
    }

    const analysis = calculateDesktopWeeklyMuscleSufficiency(state.currentWeeklyMuscleSource, state.currentWeeklyMuscleWeekOffset);
    const filter = state.currentWeeklyMuscleFilter;

    let filteredMuscles = analysis.muscles;
    if (filter === 'optimal') {
        filteredMuscles = analysis.muscles.filter(m => m.status === 'optimal' || m.status === 'high');
    } else if (filter === 'insufficient') {
        filteredMuscles = analysis.muscles.filter(m => m.status === 'insufficient');
    } else if (filter === 'unworked') {
        filteredMuscles = analysis.muscles.filter(m => m.status === 'unworked');
    }

    const { summary, bounds, sourceMode, weekOffset } = analysis;
    const optimalTotal = summary.optimalCount + summary.highCount;

    // Filter pills
    const filterPills = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
            <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:16px; ${filter === 'all' ? 'background:#38bdf8; color:#000; font-weight:800;' : ''}" onclick="setDesktopWeeklyMuscleFilter('all')">
                Tümü (${summary.totalMuscles})
            </button>
            <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:16px; ${filter === 'optimal' ? 'background:#10b981; color:#000; font-weight:800;' : ''}" onclick="setDesktopWeeklyMuscleFilter('optimal')">
                ✅ Yeterli / Optimal (${optimalTotal})
            </button>
            <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:16px; ${filter === 'insufficient' ? 'background:#f59e0b; color:#000; font-weight:800;' : ''}" onclick="setDesktopWeeklyMuscleFilter('insufficient')">
                ⚠️ Yetersiz Hacim (${summary.insufficientCount})
            </button>
            <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:16px; ${filter === 'unworked' ? 'background:#ef4444; color:#fff; font-weight:800;' : ''}" onclick="setDesktopWeeklyMuscleFilter('unworked')">
                ❌ Çalıştırılmayan (${summary.unworkedCount})
            </button>
        </div>
    `;

    // Diagnostic coach alert
    let coachAlertHTML = '';
    if (summary.unworkedCount > 0) {
        coachAlertHTML = `
            <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.3); border-radius:10px; padding:10px 14px; margin-top:12px; display:flex; align-items:flex-start; gap:10px;">
                <span style="font-size:18px;">🚨</span>
                <div style="font-size:12px; color:#fca5a5; line-height:1.45;">
                    <strong>Atlanan / Çalıştırılmayan Kaslar:</strong> Bu hafta <strong>${escapeHTML(analysis.unworkedNames.join(', '))}</strong> bölgesi için henüz antrenman hacmi bulunmuyor. Kas dengesizliğini ve sakatlık riskini önlemek için aşağıda listelenen hareketleri programa dahil edebilirsiniz.
                </div>
            </div>
        `;
    } else if (summary.insufficientCount > 0) {
        coachAlertHTML = `
            <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.3); border-radius:10px; padding:10px 14px; margin-top:12px; display:flex; align-items:flex-start; gap:10px;">
                <span style="font-size:18px;">⚠️</span>
                <div style="font-size:12px; color:#fde68a; line-height:1.45;">
                    <strong>Düşük Hacim Uyarısı:</strong> <strong>${escapeHTML(analysis.insufficientNames.join(', '))}</strong> bölgesi minimum gelişim eşiğinin (MEV) altında kaldı. İlgili hareketlerin setlerini artırarak hipertrofi eşiğine ulaşabilirsiniz.
                </div>
            </div>
        `;
    } else {
        coachAlertHTML = `
            <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.3); border-radius:10px; padding:10px 14px; margin-top:12px; display:flex; align-items:flex-start; gap:10px;">
                <span style="font-size:18px;">🏆</span>
                <div style="font-size:12px; color:#6ee7b7; line-height:1.45;">
                    <strong>Kusursuz Kas Dengesi!</strong> Tüm kas grupları bu hafta bilimsel olarak önerilen optimal hipertrofi ve güç kazanım aralığında yer alıyor.
                </div>
            </div>
        `;
    }

    // Muscle Cards HTML
    const muscleCardsHTML = filteredMuscles.length === 0 ? `
        <div style="text-align:center; padding:24px; color:var(--text-muted); font-size:12px; background:rgba(0,0,0,0.2); border-radius:8px; margin-top:10px;">
            Bu filtreye uyan kas grubu bulunamadı.
        </div>
    ` : `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap:12px; margin-top:12px;">
            ${filteredMuscles.map(m => {
                const maxBar = Math.max(22, m.optimalMax + 4);
                const donePct = Math.min(100, Math.round((m.effectiveDone / maxBar) * 100));
                const recs = getDesktopRecommendationsForMuscle(m.id, 3);
                const isWeak = (m.status === 'unworked' || m.status === 'insufficient');

                return `
                    <div style="background:var(--bg-surface); border:1px solid ${m.statusColor}33; border-left:4px solid ${m.statusColor}; border-radius:10px; padding:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                            <div>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-size:18px;">${m.icon}</span>
                                    <h4 style="font-size:14px; font-weight:800; color:#fff; margin:0;">${m.name}</h4>
                                </div>
                            </div>
                            <span class="badge" style="background:${m.statusBg}; color:${m.statusColor}; border:1px solid ${m.statusColor}44; font-size:11px; padding:3px 10px; font-weight:800; border-radius:12px;">
                                ${m.statusBadge}
                            </span>
                        </div>

                        <!-- PROGRESS BAR & BENCHMARK -->
                        <div style="margin-top:10px;">
                            <div style="position:relative; height:12px; background:rgba(255,255,255,0.06); border-radius:6px; overflow:hidden; display:flex;">
                                <div style="width:${donePct}%; background:${m.statusColor}; height:100%; transition:width 0.4s ease;" title="Yapılan: ${m.effectiveDone.toFixed(1)} Efektif Set"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:var(--text-secondary); margin-top:4px; flex-wrap:wrap; gap:4px;">
                                <span>🟢 Yapılan: <strong style="color:#fff;">${m.effectiveDone.toFixed(1)}</strong> set <span style="font-size:9.5px; opacity:0.8;">(${m.doneDirectSets.toFixed(1)} ana + ${m.doneSecondarySets.toFixed(1)} destek)</span></span>
                                <span>🎯 Hedef: <strong style="color:var(--gold);">${m.optimalMin}-${m.optimalMax} set/hf</strong></span>
                            </div>
                        </div>

                        <!-- STATUS DESCRIPTION & EXERCISES -->
                        <div style="margin-top:8px; font-size:11.5px; color:#cbd5e1; display:flex; flex-direction:column; gap:4px;">
                            <div>
                                <span style="color:${m.statusColor}; font-weight:700;">${m.statusDesc}</span>
                                <span style="color:var(--text-secondary);"> (Toplam Efektif: <strong style="color:#fff;">${m.effectiveTotal.toFixed(1)} set</strong>)</span>
                            </div>

                            ${m.doneExercises.length > 0 ? `
                                <div style="font-size:11px; margin-top:2px;">
                                    <span style="color:var(--text-secondary);">✅ Bu Hafta Yapılanlar:</span>
                                    <span style="color:#fff; font-weight:600;">${m.doneExercises.map(escapeHTML).join(', ')}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- ANATOMİK ALT BÖLGE DAĞILIM TABLOSU -->
                        ${renderDesktopMuscleCompartmentDiagram(m)}

                        <!-- BİYOMEKANİK KAYNAK & KATKI DÖKÜMÜ (DRILL-DOWN) -->
                        <div style="margin-top:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.1);">
                            <button id="lineage_btn_${m.id}" class="btn-outline" style="width:100%; font-size:11px; padding:6px 10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border-color:rgba(255,255,255,0.12); cursor:pointer;" onclick="toggleMuscleLineage('${m.id}')">
                                <span>🔬 Hangi Seans & Hareketten Geldi? (${(m.contributions || []).length} Kayıt)</span>
                                <span style="color:var(--gold); font-size:10px; font-weight:800;">▼ Detay</span>
                            </button>

                            <div id="lineage_box_${m.id}" data-count="${(m.contributions || []).length}" style="display:none; margin-top:8px; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px;">
                                ${(m.contributions && m.contributions.length > 0) ? `
                                    <div style="display:flex; flex-direction:column; gap:6px;">
                                        <div style="font-size:10.5px; color:var(--text-secondary); margin-bottom:2px; font-weight:700;">
                                            📋 Tamamlanan Seanslar & Puan Katkısı:
                                        </div>
                                        ${m.contributions.map(c => `
                                            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:6px 10px; font-size:11px;">
                                                <div>
                                                    <div style="display:flex; align-items:center; gap:6px;">
                                                        <strong style="color:#fff;">${escapeHTML(c.exercise)}</strong>
                                                        <span style="font-size:9.5px; padding:1px 5px; border-radius:4px; font-weight:700; ${c.role === 'Birincil' ? 'background:rgba(234,179,8,0.18); color:var(--gold);' : 'background:rgba(6,182,212,0.18); color:#06b6d4;'}">
                                                            ${c.role} (${c.factor}x)
                                                        </span>
                                                    </div>
                                                    <div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">
                                                        📅 ${escapeHTML(c.date)} • ${escapeHTML(c.sessionTitle)}
                                                    </div>
                                                </div>
                                                <div style="text-align:right;">
                                                    <div style="font-size:12.5px; font-weight:900; color:#10b981;">+${c.earnedSets.toFixed(1)} Set</div>
                                                    <div style="font-size:9.5px; color:var(--text-secondary);">${c.rawSets} Set Yapıldı</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 4px 2px 4px; border-top:1px dashed rgba(255,255,255,0.1); font-size:11px;">
                                            <span style="color:var(--text-secondary);">Haftalık Toplam Katkı:</span>
                                            <strong style="color:var(--gold); font-size:12px;">${m.effectiveDone.toFixed(1)} Efektif Set</strong>
                                        </div>
                                    </div>
                                ` : `
                                    <div style="font-size:11px; color:var(--text-secondary); text-align:center; padding:8px 6px;">
                                        Bu hafta bu kas grubu için henüz tamamlanmış bir seans kaydı bulunmuyor.
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- RECOMMENDATIONS / DRILL-DOWN INTO LAB -->
                        ${recs.length > 0 ? `
                            <div style="margin-top:10px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.1);">
                                <div style="font-size:10.5px; color:${isWeak ? 'var(--gold)' : 'var(--cyan)'}; font-weight:700; margin-bottom:6px;">
                                    ${isWeak ? '💡 Koç Tavsiyesi (Eksik Bölge Takviyesi) — Lab Atlasında İncele:' : '✨ Bu Bölgenin Lab Egzersizleri:'}
                                </div>
                                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                    ${recs.map(r => `
                                        <button class="btn-outline" style="font-size:10.5px; padding:3px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;" onclick="openLabExerciseFromAnalytics('${r.id}')" title="Lab Atlasında 3D / Anatomi / Formunu Aç">
                                            🏋️ ${escapeHTML(r.name)} <span style="color:var(--gold); font-size:9.5px; font-weight:800;">➔</span>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // 2. KÜMÜLATİF ANALİZ VE 5 SÜTUN YÜK DAĞILIMI
    const allLogs = state.workoutLogs || [];
    const days = state.currentAnalyticsPeriodDays || 7;
    const now = new Date();
    const cutoff = days > 0 ? new Date(now.getTime() - (days * 24 * 60 * 60 * 1000)) : null;

    const filteredLogs = cutoff ? allLogs.filter(l => {
        let dt = new Date(l.date);
        if (isNaN(dt.getTime()) && typeof l.timestamp === 'number') dt = new Date(l.timestamp);
        return dt >= cutoff;
    }) : allLogs;

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    const pillars = {
        legs: { label: 'Bacak & Kalça (Alt Vücut)', icon: '🦵', color: '#10b981', volume: 0, sets: 0 },
        back: { label: 'Sırt & Çekiş (Posterior Zincir)', icon: '🛡️', color: '#38bdf8', volume: 0, sets: 0 },
        chest: { label: 'Göğüs & İtiş (Anterior Zincir)', icon: '⚔️', color: '#f59e0b', volume: 0, sets: 0 },
        arms: { label: 'Kollar (Biceps & Triceps)', icon: '💪', color: '#a855f7', volume: 0, sets: 0 },
        core: { label: 'Karın & Core Zırhı', icon: '⚡', color: '#f43f5e', volume: 0, sets: 0 }
    };

    const prMap = {};

    filteredLogs.forEach(log => {
        totalVolume += (log.totalVolumeKg || 0);
        totalSets += (log.totalSetsCompleted || 0);
        totalReps += (log.totalRepsCompleted || 0);

        if (log.exercises && log.exercises.length > 0) {
            log.exercises.forEach(ex => {
                const exVol = ex.exerciseVolume || 0;
                const cSets = ex.completedSetsCount || (Array.isArray(ex.sets) ? ex.sets.filter(s => s.completed || parseInt(s.reps, 10) > 0).length : 0) || 0;
                if (cSets === 0 && exVol === 0) return;

                const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
                const shares = [];
                if (spec.primary && spec.pFactor > 0) {
                    shares.push({ muscle: spec.primary, factor: spec.pFactor });
                }
                if (spec.sec && typeof spec.sec === 'object') {
                    Object.entries(spec.sec).forEach(([mName, factor]) => {
                        if (factor > 0) shares.push({ muscle: mName, factor: factor });
                    });
                }

                const sumFactor = shares.reduce((acc, s) => acc + s.factor, 0);

                if (sumFactor > 0) {
                    shares.forEach(s => {
                        const ratio = s.factor / sumFactor;
                        const mId = ACADEMIC_MUSCLE_TO_ID[s.muscle] || s.muscle;
                        let targetPillar = null;
                        if (['quads', 'hamstrings', 'glutes', 'calves'].includes(mId)) targetPillar = pillars.legs;
                        else if (mId === 'back') targetPillar = pillars.back;
                        else if (['chest', 'shoulders'].includes(mId)) targetPillar = pillars.chest;
                        else if (['biceps', 'triceps'].includes(mId)) targetPillar = pillars.arms;
                        else if (mId === 'core') targetPillar = pillars.core;

                        if (targetPillar) {
                            targetPillar.volume += (exVol * ratio);
                            targetPillar.sets += Math.round((cSets * ratio) * 10) / 10;
                        }
                    });
                } else if (spec.type === 'CONDITIONING') {
                    const pKeys = Object.keys(pillars);
                    pKeys.forEach(k => {
                        pillars[k].volume += (exVol / pKeys.length);
                        pillars[k].sets += Math.round((cSets / pKeys.length) * 10) / 10;
                    });
                } else {
                    pillars.legs.volume += (exVol * 0.5);
                    pillars.back.volume += (exVol * 0.5);
                    pillars.legs.sets += (cSets * 0.5);
                    pillars.back.sets += (cSets * 0.5);
                }

                // Track PRs
                if (ex.maxWeight && ex.maxWeight > 0) {
                    if (!prMap[ex.name] || ex.maxWeight > prMap[ex.name].weight) {
                        prMap[ex.name] = { weight: ex.maxWeight, date: log.dateFormatted || log.date, muscle: ex.muscle || spec.primary || '' };
                    }
                }
            });
        }
    });

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
    if (pushPullRatio < 0.85) {
        balanceBadge = '⚠️ İtiş Hacmi Baskın';
        balanceColor = '#f59e0b';
        balanceDesc = 'Göğüs ve omuz itiş tonajınız sırttan yüksek. Omuz sakatlığı riskini önlemek için sırt ve kürek hareketlerine ağırlık verin.';
    } else if (pushPullRatio > 1.35) {
        balanceBadge = '⚠️ Çekiş Hacmi Baskın';
        balanceColor = '#38bdf8';
        balanceDesc = 'Sırt çekiş hacminiz itişten belirgin şekilde fazla. İtiş egzersizlerinizi artırabilirsiniz.';
    }

    const sortedPrs = Object.keys(prMap).map(k => ({ name: k, ...prMap[k] })).sort((a,b) => b.weight - a.weight).slice(0, 6);

    // Kümülatif Periyot Butonları
    const periodButtonsHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:24px; margin-bottom:14px; background:rgba(0,0,0,0.25); padding:10px 14px; border-radius:10px; border:1px solid var(--border-subtle);">
            <div>
                <span style="font-size:13px; font-weight:800; color:#fff; display:block;">📊 Kümülatif Tonaj & Biyomekanik Geçmişi</span>
                <span style="font-size:11px; color:var(--text-secondary);">Sporcunun tüm seanslarının bilimsel kümülatif analizi</span>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${days === 7 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="setDesktopAnalyticsPeriod(7)">Son 7 Gün</button>
                <button class="btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${days === 30 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="setDesktopAnalyticsPeriod(30)">Son 30 Gün</button>
                <button class="btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${days === 90 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="setDesktopAnalyticsPeriod(90)">Son 90 Gün</button>
                <button class="btn-outline" style="font-size:11px; padding:4px 10px; border-radius:16px; ${days === 0 ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="setDesktopAnalyticsPeriod(0)">Tüm Zamanlar</button>
            </div>
        </div>
    `;

    // Render Full Container
    el.desktopAnalyticsContainer.innerHTML = `
        <!-- 1. HAFTALIK KAS DENGESİ & YETERLİLİK KARNESİ -->
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:14px; padding:18px; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
            <!-- HEADER & WEEK SELECTOR -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
                <div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:22px;">🧬</span>
                        <h3 style="font-size:16px; font-weight:800; color:#fff; margin:0;">Haftalık Kas Dengesi & Yeterlilik Karnesi</h3>
                    </div>
                    <p style="font-size:12px; color:var(--text-secondary); margin:4px 0 0 0;">
                        Tamamlanan seansların her kas grubuna mekanik gerilim ve sinerjist katsayılarıyla katkısı (Dr. Mike Israetel / Schoenfeld modeli).
                    </p>
                </div>

                <div style="display:flex; align-items:center; gap:6px; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:20px; border:1px solid var(--border-subtle);">
                    <button class="btn-outline" style="font-size:11px; padding:2px 8px; border-radius:12px;" onclick="setDesktopWeeklyMuscleOffset(${weekOffset - 1})" title="Önceki Hafta">◀</button>
                    <span style="font-size:11px; font-weight:800; color:var(--gold); padding:0 4px;">${bounds.label} ${bounds.isCurrentWeek ? '<span style="color:#10b981;">(Bu Hafta)</span>' : ''}</span>
                    <button class="btn-outline" style="font-size:11px; padding:2px 8px; border-radius:12px;" onclick="setDesktopWeeklyMuscleOffset(${weekOffset + 1})" title="Sonraki Hafta">▶</button>
                    ${!bounds.isCurrentWeek ? `<button class="btn-outline" style="font-size:10px; padding:2px 6px; border-radius:10px; color:var(--cyan);" onclick="setDesktopWeeklyMuscleOffset(0)">Bu Hafta</button>` : ''}
                </div>
            </div>

            ${filterPills}
            ${coachAlertHTML}
            ${muscleCardsHTML}
        </div>

        <!-- 2. KÜMÜLATİF ANALİZ VE 5 SÜTUN YÜK DAĞILIMI -->
        ${periodButtonsHTML}

        <!-- KPI STATS -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:12px; margin-bottom:16px;">
            <div class="analytics-kpi-card">
                <div style="font-size:11px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                <div style="font-size:20px; font-weight:900; color:var(--gold); margin-top:2px;">🏋️ ${Math.round(totalVolume).toLocaleString('tr-TR')} kg</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">${sessionsCount} Seans</div>
            </div>
            <div class="analytics-kpi-card">
                <div style="font-size:11px; color:var(--text-secondary); font-weight:700;">SEANS BAŞI ORTALAMA</div>
                <div style="font-size:20px; font-weight:900; color:var(--cyan); margin-top:2px;">⚡ ${avgSessionVol.toLocaleString('tr-TR')} kg</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Yoğunluk</div>
            </div>
            <div class="analytics-kpi-card">
                <div style="font-size:11px; color:var(--text-secondary); font-weight:700;">SET & TEKRAR</div>
                <div style="font-size:20px; font-weight:900; color:#10b981; margin-top:2px;">🎯 ${totalSets} / ${totalReps}</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Toplam Hacim</div>
            </div>
            <div class="analytics-kpi-card">
                <div style="font-size:11px; color:var(--text-secondary); font-weight:700;">İTİŞ / ÇEKİŞ ORANI</div>
                <div style="font-size:20px; font-weight:900; color:${balanceColor}; margin-top:2px;">⚖️ ${pushPullRatio}</div>
                <div style="font-size:11px; color:${balanceColor}; margin-top:2px;">${balanceBadge}</div>
            </div>
        </div>

        <!-- 5-PILLAR MUSCLE GROUP TONAJ & HACİM DAĞILIMI -->
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <h3 style="font-size:14px; font-weight:800; color:#fff;">🧬 5 Temel Sütun Tonaj & Hacim Dağılımı</h3>
                <span style="font-size:11.5px; color:var(--gold); font-weight:700;">Kümülatif Yük</span>
            </div>

            <div style="display:flex; flex-direction:column; gap:14px;">
                ${Object.keys(pillars).map(key => {
                    const p = pillars[key];
                    const pct = Math.round((p.volume / totalPillarsVol) * 100);
                    return `
                        <div>
                            <div style="display:flex; justify-content:space-between; font-size:12.5px; font-weight:700;">
                                <span style="color:#fff;">${p.icon} ${p.label}</span>
                                <span style="color:${p.color};">${Math.round(p.volume).toLocaleString('tr-TR')} kg <span style="color:var(--text-secondary); font-size:11.5px;">(%${pct})</span></span>
                            </div>
                            <div class="analytics-bar-bg">
                                <div class="analytics-bar-fill" style="width:${Math.min(100, Math.max(4, pct))}%; background:${p.color};"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:10.5px; color:var(--text-secondary); margin-top:3px;">
                                <span>Tamamlanan Efektif Set: ${(Math.round(p.sets * 10) / 10).toFixed(1)}</span>
                                <span>Ortalama Yük: ${p.sets > 0 ? Math.round(p.volume / p.sets) : 0} kg/set</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <!-- BIOMECHANICAL BALANCE & COACH INSIGHT -->
        <div style="background:rgba(245, 158, 11, 0.04); border:1px solid rgba(245, 158, 11, 0.25); border-radius:12px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span style="font-size:20px;">🩺</span>
                <h3 style="font-size:14px; font-weight:800; color:var(--gold);">Biyomekanik Postür & Sakatlık Önleme Raporu</h3>
            </div>
            <p style="font-size:12.5px; color:#cbd5e1; line-height:1.55; margin-bottom:8px;">
                ${balanceDesc} Çekiş hacmi: <strong>${Math.round(pullTotal).toLocaleString('tr-TR')} kg</strong>, İtiş hacmi: <strong>${Math.round(pushTotal).toLocaleString('tr-TR')} kg</strong>.
            </p>
            <div style="font-size:11.5px; color:var(--text-secondary); background:rgba(0,0,0,0.25); padding:8px 12px; border-radius:8px;">
                💡 <strong>Koç Tavsiyesi:</strong> Bacak ve arka zincir kasları metabolik motorunuzdur. Her seans öncesi kalça ve omuz mobilite protokolünü (CARs) eksiksiz uygulayarak eklem hareket açıklığınızı maksimize edin.
            </div>
        </div>

        <!-- PR RECORDS TABLE -->
        ${sortedPrs.length > 0 ? `
            <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:12px; padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <h3 style="font-size:14px; font-weight:800; color:#fff;">🏆 Kişisel Ağırlık Rekorları (PR)</h3>
                    <span style="font-size:11.5px; color:var(--cyan); font-weight:700;">Zirve Kilolar</span>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:8px;">
                    ${sortedPrs.map((pr, idx) => `
                        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:10px 12px; border-radius:8px; border-left:3px solid var(--gold);">
                            <div>
                                <div style="font-size:13px; font-weight:800; color:#fff;">#${idx+1} ${escapeHTML(pr.name)}</div>
                                <div style="font-size:11px; color:var(--text-secondary);">${escapeHTML(pr.muscle || '')} • ${escapeHTML(pr.date)}</div>
                            </div>
                            <div style="font-size:16px; font-weight:900; color:var(--gold);">
                                ${pr.weight} kg
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}
window.renderDesktopAnalytics = renderDesktopAnalytics;

function toggleMuscleLineage(muscleId) {
    const elBox = document.getElementById(`lineage_box_${muscleId}`);
    const elBtn = document.getElementById(`lineage_btn_${muscleId}`);
    if (!elBox) return;
    const isHidden = elBox.style.display === 'none';
    elBox.style.display = isHidden ? 'block' : 'none';
    if (elBtn) {
        const count = elBox.dataset.count || 0;
        elBtn.innerHTML = isHidden 
            ? `<span>🔬 Hangi Seans & Hareketten Geldi? (${count} Kayıt)</span><span style="color:var(--gold); font-size:10px; font-weight:800;">▲ Kapat</span>`
            : `<span>🔬 Hangi Seans & Hareketten Geldi? (${count} Kayıt)</span><span style="color:var(--gold); font-size:10px; font-weight:800;">▼ Detay</span>`;
    }
}
window.toggleMuscleLineage = toggleMuscleLineage;




