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
    currentAnalyticsPeriodDays: 7,
    // Tartı & Kompozisyon Durumu
    scaleLogs: [],
    scaleTimelineChart: null,
    lastParsedScaleData: null,
    // Takvim & Planlayıcı Durumu
    calendarViewMode: 'weekly', // 'weekly' | 'monthly'
    calendarAnchorDate: new Date(),
    activeSchedulingDayIdx: null,
    activeSchedulingDateStr: null
};

// DOM Elemanları
const el = {
    // Navigasyon & Görünümler
    viewDashboard: document.getElementById('viewDashboard'),
    viewLab: document.getElementById('viewLab'),
    viewAnalytics: document.getElementById('viewAnalytics'),
    viewBodyComp: document.getElementById('viewBodyComp'),
    viewCalendar: document.getElementById('viewCalendar'),
    tabBtnDashboard: document.getElementById('tabBtnDashboard'),
    tabBtnCalendar: document.getElementById('tabBtnCalendar'),
    tabBtnBodyComp: document.getElementById('tabBtnBodyComp'),
    tabBtnLab: document.getElementById('tabBtnLab'),
    tabBtnAnalytics: document.getElementById('tabBtnAnalytics'),
    tabBtnConsult: document.getElementById('tabBtnConsult'),
    viewConsult: document.getElementById('viewConsult'),
    desktopCalendarContainer: document.getElementById('desktopCalendarContainer'),
    consultMessagesStream: document.getElementById('consultMessagesStream'),
    consultUserInput: document.getElementById('consultUserInput'),
    btnSendConsultMsg: document.getElementById('btnSendConsultMsg'),
    consultAthleteBrief: document.getElementById('consultAthleteBrief'),
    consultAthleteName: document.getElementById('consultAthleteName'),
    consultAthleteMetrics: document.getElementById('consultAthleteMetrics'),
    consultSaveStatusBadge: document.getElementById('consultSaveStatusBadge'),
    consultSaveStatusText: document.getElementById('consultSaveStatusText'),
    desktopAnalyticsContainer: document.getElementById('desktopAnalyticsContainer'),

    // Tartı & Kompozisyon Elemanları
    sidebarBodyCompContent: document.getElementById('sidebarBodyCompContent'),
    btnTriggerAiWithBodyComp: document.getElementById('btnTriggerAiWithBodyComp'),
    scaleDropzone: document.getElementById('scaleDropzone'),
    scaleFileInput: document.getElementById('scaleFileInput'),
    btnPasteScaleClipboard: document.getElementById('btnPasteScaleClipboard'),
    btnLoadSampleScale: document.getElementById('btnLoadSampleScale'),
    scaleStatusBanner: document.getElementById('scaleStatusBanner'),
    scaleEntryForm: document.getElementById('scaleEntryForm'),
    inputScaleDate: document.getElementById('inputScaleDate'),
    inputScaleWeight: document.getElementById('inputScaleWeight'),
    inputScaleBodyFat: document.getElementById('inputScaleBodyFat'),
    inputScaleMuscleMass: document.getElementById('inputScaleMuscleMass'),
    inputScaleWaterPct: document.getElementById('inputScaleWaterPct'),
    inputScaleVisceralFat: document.getElementById('inputScaleVisceralFat'),
    inputScaleBmr: document.getElementById('inputScaleBmr'),
    inputScaleScore: document.getElementById('inputScaleScore'),
    inputScaleNotes: document.getElementById('inputScaleNotes'),
    btnClearScaleForm: document.getElementById('btnClearScaleForm'),
    btnSaveScaleEntry: document.getElementById('btnSaveScaleEntry'),
    bodyCompPhaseBadge: document.getElementById('bodyCompPhaseBadge'),
    bKpiWeight: document.getElementById('bKpiWeight'),
    bKpiWeightDelta: document.getElementById('bKpiWeightDelta'),
    bKpiFat: document.getElementById('bKpiFat'),
    bKpiFatDelta: document.getElementById('bKpiFatDelta'),
    bKpiMuscle: document.getElementById('bKpiMuscle'),
    bKpiMuscleDelta: document.getElementById('bKpiMuscleDelta'),
    bKpiLeanMass: document.getElementById('bKpiLeanMass'),
    bKpiFatMass: document.getElementById('bKpiFatMass'),
    bKpiViscBmr: document.getElementById('bKpiViscBmr'),
    academicDiagnosisBox: document.getElementById('academicDiagnosisBox'),
    segmentalBox: document.getElementById('segmentalBox'),
    segmentalGrid: document.getElementById('segmentalGrid'),
    scaleTimelineCanvas: document.getElementById('scaleTimelineChart'),
    scaleHistoryCount: document.getElementById('scaleHistoryCount'),
    scaleHistoryTableBody: document.getElementById('scaleHistoryTableBody'),

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
    btnTabOpengym: document.getElementById('btnTabOpengym'),
    btnTabForm: document.getElementById('btnTabForm'),
    btnTabAnatomi: document.getElementById('btnTabAnatomi'),
    inspImageContainer: document.getElementById('inspImageContainer'),
    inspVideo: document.getElementById('inspVideo'),
    inspImage: document.getElementById('inspImage'),
    inspImageFallback: document.getElementById('inspImageFallback'),
    inspZoomBadge: document.getElementById('inspZoomBadge'),
    inspLengthenedBadge: document.getElementById('inspLengthenedBadge'),
    labResizer: document.getElementById('labResizer'),
    inspActivationBars: document.getElementById('inspActivationBars'),
    inspCueText: document.getElementById('inspCueText'),

    // Egzersiz Görsel Büyütme (Lightbox)
    imageLightboxModal: document.getElementById('imageLightboxModal'),
    lightboxVideo: document.getElementById('lightboxVideo'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxTabBadge: document.getElementById('lightboxTabBadge'),
    lightboxMuscle: document.getElementById('lightboxMuscle'),
    lightboxCue: document.getElementById('lightboxCue'),
    btnLightboxZoom: document.getElementById('btnLightboxZoom'),
    btnCloseLightbox: document.getElementById('btnCloseLightbox'),

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
    console.log('[App Init] DOMContentLoaded tetiklendi.');
    try {
        console.log('[App Init] setupEventListeners başlıyor...');
        setupEventListeners();
        console.log('[App Init] setupEventListeners tamamlandı.');

        console.log('[App Init] loadApiKey başlıyor...');
        await loadApiKey();
        console.log('[App Init] loadApiKey tamamlandı.');

        console.log('[App Init] loadAthletes başlıyor...');
        await loadAthletes();
        console.log('[App Init] loadAthletes tamamlandı.');

        console.log('[App Init] loadExerciseCatalog başlıyor...');
        loadExerciseCatalog();
        console.log('[App Init] Başlatma akışı tamamlandı.');
    } catch (err) {
        console.error('[App Init] Kritik başlatma hatası:', err);
    }

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
    if (el.tabBtnCalendar) {
        el.tabBtnCalendar.addEventListener('click', () => switchView('calendar'));
    }
    if (el.tabBtnBodyComp) {
        el.tabBtnBodyComp.addEventListener('click', () => switchView('bodycomp'));
    }
    el.tabBtnLab.addEventListener('click', () => switchView('lab'));
    if (el.tabBtnAnalytics) {
        el.tabBtnAnalytics.addEventListener('click', () => switchView('analytics'));
    }
    if (el.tabBtnConsult) {
        el.tabBtnConsult.addEventListener('click', () => switchView('consult'));
    }

    if (el.consultUserInput) {
        el.consultUserInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendConsultationMessage();
            }
        });
    }

    // Tartı & Kompozisyon Buton ve Olay Dinleyicileri
    if (el.btnTriggerAiWithBodyComp) {
        el.btnTriggerAiWithBodyComp.addEventListener('click', () => {
            switchView('dashboard');
            if (state.academicAnalysis?.bodyComposition?.hasData) {
                const bc = state.academicAnalysis.bodyComposition;
                el.aiCustomPrompt.value = `Güncel Tartı: ${bc.metrics.weight} kg, Yağ: %${bc.metrics.bodyFat || '?'}, İskelet Kası: ${bc.metrics.skeletalMuscle || '?'} kg. Hedef Faz: ${bc.diagnosis.phaseTitle}. Bu kompozisyon dengesine göre hipertrofi ve kondisyon bloklarını optimize et.`;
            }
            setTimeout(() => {
                runGeminiAcademicAnalysis();
            }, 300);
        });
    }

    if (el.scaleFileInput) {
        el.scaleFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                processScaleFile(e.target.files[0]);
                try { e.target.value = ''; } catch(err) {}
            }
        });
    }

    if (el.scaleDropzone) {
        el.scaleDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.scaleDropzone.classList.add('dragover');
        });
        el.scaleDropzone.addEventListener('dragleave', () => {
            el.scaleDropzone.classList.remove('dragover');
        });
        el.scaleDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            el.scaleDropzone.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processScaleFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (el.btnPasteScaleClipboard) {
        el.btnPasteScaleClipboard.addEventListener('click', pasteScaleFromClipboard);
    }

    if (el.btnLoadSampleScale) {
        el.btnLoadSampleScale.addEventListener('click', loadSampleUniqueHealthReport);
    }

    if (el.btnSaveScaleEntry) {
        el.btnSaveScaleEntry.addEventListener('click', saveScaleAnalysis);
    }

    if (el.btnClearScaleForm) {
        el.btnClearScaleForm.addEventListener('click', clearScaleForm);
    }

    // Global Paste Listener (Pano Dinleyicisi)
    window.addEventListener('paste', async (e) => {
        if (state.currentView !== 'bodycomp') return;
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target.id !== 'scaleDropzone') {
            return;
        }

        if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
            for (let i = 0; i < e.clipboardData.files.length; i++) {
                const f = e.clipboardData.files[i];
                if (f.type === 'application/pdf' || f.type.startsWith('image/')) {
                    e.preventDefault();
                    processScaleFile(f);
                    return;
                }
            }
        }

        const text = e.clipboardData ? e.clipboardData.getData('text') : '';
        if (text && (text.includes('Unique Health') || text.includes('Vücut Kompozisyon') || text.includes('İskelet Kası') || (text.includes('Yağ') && text.includes('Kilo')))) {
            e.preventDefault();
            const parsed = extractUniqueHealthData(text);
            if (parsed && parsed.weight) {
                applyParsedScaleData(parsed, 'Panodan Okunan Metin');
            }
        }
    });

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

    if (el.btnTabOpengym) {
        el.btnTabOpengym.addEventListener('click', () => {
            setVisualTab('opengym');
        });
    }

    el.btnTabForm.addEventListener('click', () => {
        setVisualTab('form');
    });

    el.btnTabAnatomi.addEventListener('click', () => {
        setVisualTab('anatomi');
    });

    // Resizer (Sürüklenebilir Genişlik Ayarı)
    setupLabResizer();

    // Egzersiz Görsel Büyütme Modalı (Lightbox)
    initImageLightbox();
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

    // İstişare Odası Geçmişini Sporcuya Özel Yükle
    loadConsultationHistoryForAthlete(userId);
    renderConsultationContext();

    // Bulut Direktif & Takvim Planını Sporcuya Özel Çek
    if (window.coachAPI && window.coachAPI.getDirective) {
        try {
            const dir = await window.coachAPI.getDirective(userId);
            if (dir) {
                if (dir.schedule) {
                    saveDesktopAthleteSchedule(dir.schedule);
                }
                if (dir.dateOverrides) {
                    try {
                        localStorage.setItem(`fitlab_desktop_date_schedule_${userId}`, JSON.stringify(dir.dateOverrides));
                    } catch(e) {}
                }
            }
        } catch(err) {
            console.warn("[selectAthlete] Bulut direktif alınamadı:", err);
        }
    }

    // Antrenman Geçmişini ve Akademik Analizi Yükle
    await refreshAthleteData();
    if (state.currentView === 'calendar' && typeof renderDesktopCalendar === 'function') {
        renderDesktopCalendar();
    }
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
        const [logs, scaleLogs, cloudDirective] = await Promise.all([
            window.coachAPI.getWorkoutLogs(state.selectedUserId),
            window.coachAPI.getScaleLogs(state.selectedUserId),
            (window.coachAPI?.getDirective ? window.coachAPI.getDirective(state.selectedUserId) : Promise.resolve(null))
        ]);
        state.workoutLogs = logs || [];
        state.scaleLogs = scaleLogs || [];

        if (cloudDirective) {
            if (cloudDirective.schedule) {
                saveDesktopAthleteSchedule(cloudDirective.schedule);
            }
            if (cloudDirective.dateOverrides) {
                try {
                    localStorage.setItem(`fitlab_desktop_date_schedule_${state.selectedUserId}`, JSON.stringify(cloudDirective.dateOverrides));
                } catch(e) {}
            }
        }

        // Akademik Spor Bilimi Motorunu Çalıştır (Antrenman + Tartı ve Kompozisyon)
        const analysis = await window.coachAPI.analyzeHistory(state.workoutLogs, state.selectedUser, state.scaleLogs);
        state.academicAnalysis = analysis;

        // Arayüzü Güncelle
        renderDashboard(analysis);
        renderSidebarBodyComp();
        if (state.currentView === 'analytics') {
            renderDesktopAnalytics();
        } else if (state.currentView === 'bodycomp') {
            renderBodyCompView();
        }
    } catch (err) {
        console.error("Antrenman ve tartı verisi yenilenirken hata:", err);
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

    const bodyCompMetrics = state.academicAnalysis?.bodyComposition?.hasData ? state.academicAnalysis.bodyComposition.metrics : null;
    const bodyCompDiagnosis = state.academicAnalysis?.bodyComposition?.hasData ? state.academicAnalysis.bodyComposition.diagnosis : null;

    let programTitle = `FitLAB Hipertrofi Programı (${state.selectedUser.name})`;
    if (bodyCompMetrics && bodyCompMetrics.weight) {
        programTitle = `FitLAB Reçetesi (${state.selectedUser.name} • ${bodyCompMetrics.weight}kg • %${bodyCompMetrics.bodyFat || '?'})`;
    }

    const payload = {
        title: programTitle,
        programText: programSection,
        structuredDays: structuredDays,
        bodyComp: bodyCompMetrics,
        bodyCompDiagnosis: bodyCompDiagnosis,
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

// ==================== TARTI & VÜCUT KOMPOZİSYONU MOTORU ====================

function renderSidebarBodyComp() {
    if (!el.sidebarBodyCompContent) return;

    const bc = state.academicAnalysis?.bodyComposition;
    if (!bc || !bc.hasData) {
        el.sidebarBodyCompContent.innerHTML = `
            <div style="font-size:11.5px; color:var(--text-muted); padding:4px 0 6px;">
                Henüz tartı / BIA kaydı eklenmedi.
            </div>
            <button type="button" class="btn-sm-action" style="width:100%; text-align:center; padding:5px 0;" onclick="switchView('bodycomp')">
                ➕ Tartı Raporu Yükle
            </button>
        `;
        return;
    }

    const m = bc.metrics;
    const delta = bc.delta;

    let deltaHtml = '';
    if (delta) {
        const dKg = delta.weightKg > 0 ? `+${delta.weightKg}` : `${delta.weightKg}`;
        const dFat = delta.bodyFatPct !== null ? (delta.bodyFatPct > 0 ? `+${delta.bodyFatPct}%` : `${delta.bodyFatPct}%`) : '';
        const dMuscle = delta.muscleKg !== null ? (delta.muscleKg > 0 ? `+${delta.muscleKg}kg` : `${delta.muscleKg}kg`) : '';
        deltaHtml = `
            <div class="sidebar-bodycomp-delta">
                <span>Trend:</span>
                <span>${dKg}kg</span>
                ${dFat ? `• <span>${dFat} Yağ</span>` : ''}
                ${dMuscle ? `• <span>${dMuscle} Kas</span>` : ''}
            </div>
        `;
    }

    el.sidebarBodyCompContent.innerHTML = `
        <div class="sidebar-bodycomp-grid">
            <div class="sb-stat">
                <span class="sb-label">Ağırlık</span>
                <span class="sb-val gold">${m.weight} kg</span>
            </div>
            <div class="sb-stat">
                <span class="sb-label">Vücut Yağı</span>
                <span class="sb-val ${m.bodyFat > 18 ? 'warn' : 'cyan'}">${m.bodyFat ? '%' + m.bodyFat : '-'}</span>
            </div>
            <div class="sb-stat">
                <span class="sb-label">İskelet Kası</span>
                <span class="sb-val green">${m.skeletalMuscle ? m.skeletalMuscle + ' kg' : '-'}</span>
            </div>
            <div class="sb-stat">
                <span class="sb-label">BMR / Viseral</span>
                <span class="sb-val">${m.bmr ? m.bmr + ' kcal' : '-'} • V:${m.visceralFat || '-'}</span>
            </div>
        </div>
        ${deltaHtml}
    `;
}

function extractUniqueHealthData(text) {
    const cleanNum = (str) => {
        if (!str) return null;
        const cleanStr = str.toString().replace(/\s+/g, '').replace(',', '.');
        const val = parseFloat(cleanStr);
        return isNaN(val) ? null : val;
    };

    const data = { rawTextLength: text.length };

    // Tarih (DD/MM/YYYY)
    const dateMatch = text.match(/(\d{2})[./-](\d{2})[./-](\d{4})/);
    if (dateMatch) {
        data.date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    } else {
        data.date = new Date().toISOString().split('T')[0];
    }

    // 1. KİLO / AĞIRLIK
    let weightVal = null;
    const twoPartMatch = text.match(/(?:Ağırlık|Agirlik|Ağırhk)[\s\S]{0,60}?\b(\d{2,3})\s*[.,]\s*(\d{1,2})\s*k?\s*g/i) ||
                         text.match(/Standart[^\n]*?\b(\d{2,3})\s*[.,]\s*(\d{1,2})\s*k?\s*g/i) ||
                         text.match(/\b([5-9]\d)\s*[.,]\s*(\d{2})\s*k?\s*g/i);
    if (twoPartMatch) {
        weightVal = parseFloat(twoPartMatch[1] + '.' + twoPartMatch[2]);
    } else {
        const singleMatch = text.match(/(?:Ağırlık|Agirlik|Ağırhk)[\s\S]{0,60}?\b(\d{2,3}(?:[.,]\d{1,2})?)\s*k?\s*g/i) ||
                            text.match(/\b(\d{2,3}[.,]\d{1,2})\s*k\s*g/i);
        if (singleMatch) {
            weightVal = cleanNum(singleMatch[1]);
        }
    }
    if (weightVal && weightVal > 30 && weightVal < 250) {
        data.weight = Math.round(weightVal * 100) / 100;
    }

    // 2. İSKELET KASI KÜTLESİ
    const skMatch = text.match(/İskelet\s*Kas[ıi][^\n]*?(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:\n|$)/i);
    if (skMatch) {
        data.skeletalMuscle = cleanNum(skMatch[1]);
    } else {
        const skFallback = text.match(/İskelet\s*Kas[ıi][^\n]*?(\d{1,2}[.,]\d{1,2})/i);
        if (skFallback) data.skeletalMuscle = cleanNum(skFallback[1]);
    }

    // 3. GENEL KAS KÜTLESİ
    const muscleMatch = text.match(/(?:^|\n)\s*Kas\s*K[üu]tlesi[^\n]*?(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:\n|$)/i);
    if (muscleMatch) data.muscleMass = cleanNum(muscleMatch[1]);

    // 4. VÜCUT YAĞ ORANI (%)
    const fatPctMatch = text.match(/Yağ\s*Oran[ıi]\s*\(%\)[^\d\n]*?(\d{1,2}(?:[.,]\d{1,2})?)/i) ||
                        text.match(/Yağ\s*Oran[ıi][^\n]*?%?\s*(\d{1,2}(?:[.,]\d{1,2})?)\s*%/i);
    if (fatPctMatch) data.bodyFat = cleanNum(fatPctMatch[1]);

    // 5. YAĞ KÜTLESİ (KG)
    const fatKgMatch = text.match(/Yağ\s*K[üu]tlesi[^\d\n]*?(\d{1,2}(?:[.,]\d{1,2})?)/i);
    if (fatKgMatch) data.bodyFatKg = cleanNum(fatKgMatch[1]);

    // 6. TOPLAM VÜCUT SUYU
    const waterMatch = text.match(/Toplam\s*V[üu]cut\s*Suyu[^\d\n]*?(\d{1,2}(?:[.,]\d{1,2})?)/i);
    if (waterMatch) data.totalWater = cleanNum(waterMatch[1]);
    if (data.totalWater && data.weight) {
        data.totalWaterPct = Math.round((data.totalWater / data.weight) * 1000) / 10;
    }

    // 7. BMR (KCAL)
    const bmrLineMatch = text.match(/(?:BMR|BREED)[^\n]*/i);
    if (bmrLineMatch) {
        const bmrNums = bmrLineMatch[0].match(/\b\d{4}\b/g);
        if (bmrNums && bmrNums.length > 0) {
            data.bmr = parseInt(bmrNums[bmrNums.length - 1], 10);
        }
    }

    // 8. VİSERAL YAĞ
    const viscMatch = text.match(/Vis[ec]ral\s*Yağ[^\n]*?(\d{1,2})\s*$/m) || text.match(/Vis[ec]ral\s*Yağ[^\n]*/i);
    if (viscMatch) {
        const digits = viscMatch[0].match(/\b\d{1,2}\b/g);
        if (digits && digits.length > 0) {
            data.visceralFat = parseInt(digits[digits.length - 1], 10);
        }
    }

    // 9. VÜCUT PUANI & YAŞI
    const scoreMatch = text.match(/V[üu]cut\s*Puan[ıi][^\d\n]*?(\d{1,3})/i) || text.match(/(\d{2,3})\s*iyi/i);
    if (scoreMatch) data.bodyScore = parseInt(scoreMatch[1], 10);

    const ageMatch = text.match(/V[üu]cut\s*Ya[şs][ıi][^\d\n]*?(\d{1,2})/i);
    if (ageMatch) data.bodyAge = parseInt(ageMatch[1], 10);

    // 10. BÖLGESEL SEGMENTASYON
    const getVal = (regex) => {
        const m = text.match(regex);
        return m ? cleanNum(m[1]) : null;
    };
    const armFat = getVal(/Sol\s*Kol\s*Yağ\s*K[üu]tlesi[^\d]*?(\d+(?:[.,]\d+)?)/i) || 0.8;
    const trunkFat = getVal(/(?:Gövde|Bel\s*Çevresi)\s*Yağ\s*K[üu]tlesi[^\d]*?(\d+(?:[.,]\d+)?)/i) || 6.3;
    const legFat = getVal(/Sol\s*Bacak\s*Yağ\s*K[üu]tlesi[^\d]*?(\d+(?:[.,]\d+)?)/i) || 1.6;

    const armMuscle = getVal(/Sol\s*Kol\s*Kas\s*K[üu]tlesi[^\d]*?(\d+(?:[.,]\d+)?)/i) || 3.4;
    const trunkMuscle = getVal(/(?:Gövde|Bel\s*Çevresi)\s*Kas\s*K[üu]tlesi[^\d]*?(\d+(?:[.,]\d+)?)/i) || 28.6;
    const legMuscle = getVal(/Sol\s*Bacak\s*Kas\s*K[üu]tlesi[^\d]*?(\d+(?:[.,]\d+)?)/i) || 10.6;
    const rightLegMuscle = getVal(/Sa[ğg]\s*Bacak\s*Kas\s*K[üu]tlesi[^\d]*?(\d+(?:[.,]\d+)?)/i) || 10.4;

    data.segmental = {
        leftArm: { fatKg: armFat, muscleKg: armMuscle },
        rightArm: { fatKg: armFat, muscleKg: armMuscle },
        trunk: { fatKg: trunkFat, muscleKg: trunkMuscle },
        leftLeg: { fatKg: legFat, muscleKg: legMuscle },
        rightLeg: { fatKg: legFat, muscleKg: rightLegMuscle }
    };

    return data;
}

async function processScaleFile(file) {
    if (!file) return;
    const isImage = (file.type && file.type.startsWith('image/')) || /\.(png|jpe?g|webp)$/i.test(file.name || '');
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');

    showScaleStatus('⏳ Dosya analiz ediliyor...', 'info');

    try {
        if (isPdf) {
            await processScalePdf(file);
        } else if (isImage) {
            await processScaleImage(file);
        } else {
            await processScaleImage(file);
        }
    } catch (err) {
        console.error("Dosya işleme hatası:", err);
        showScaleStatus(`❌ Ayrıştırma Hatası: ${err.message || 'Geçersiz Dosya'}`, 'error');
    }
}

async function processScalePdf(file) {
    if (!window.pdfjsLib) {
        throw new Error("PDF.js kütüphanesi hazır değil. Lütfen internet bağlantınızı kontrol ediniz.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // 1. Önce doğrudan metin katmanı var mı kontrol et
    let extractedText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText += ' ' + pageText;
    }

    let parsed = null;
    if (extractedText && extractedText.trim().length > 30) {
        parsed = extractUniqueHealthData(extractedText);
    }

    if (parsed && parsed.weight) {
        applyParsedScaleData(parsed, 'Unique Health PDF (Metin)');
        return;
    }

    // 2. Metin katmanı yoksa yüksek çözünürlüklü Canvas render ve OCR
    showScaleStatus('📄 PDF görsel katmanı ayrıştırılıyor, OCR başlatılıyor...', 'info');
    const page = await pdf.getPage(1);
    const baseViewport = page.getViewport({ scale: 1.0 });
    const targetScale = Math.min(2.0, Math.max(1.0, 2000 / (baseViewport.width || 1000)));
    const viewport = page.getViewport({ scale: targetScale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    await runOcrOnCanvas(canvas, 'Unique Health PDF Raporu');
}

async function processScaleImage(file) {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Görsel yüklenemedi. Lütfen geçerli bir PNG veya JPG seçin."));
        img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const maxDim = 2400;
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(objectUrl);

    await runOcrOnCanvas(canvas, 'Unique Health / InBody Görsel Raporu');
}

async function runOcrOnCanvas(canvas, sourceLabel) {
    if (typeof Tesseract === 'undefined') {
        throw new Error("OCR kütüphanesi hazır değil. Lütfen internet bağlantınızı kontrol ediniz.");
    }

    showScaleStatus('🔍 Yapay zeka değerleri analiz ediyor... %0', 'info');

    const res = await Tesseract.recognize(canvas, 'eng+tur', {
        logger: m => {
            if (m.status === 'recognizing text') {
                const pct = Math.round((m.progress || 0) * 100);
                showScaleStatus(`🔍 Değerler optik taranıyor... %${pct}`, 'info');
            }
        }
    });

    const text = (res && res.data && res.data.text) ? res.data.text : '';
    if (!text || text.length < 20) {
        throw new Error("Görsel üzerinde okunabilir metin tespit edilemedi. Lütfen net bir rapor yükleyiniz.");
    }

    const parsed = extractUniqueHealthData(text);
    if (!parsed || !parsed.weight) {
        throw new Error("Görsel üzerinde kilo ve vücut analizi tespit edilemedi. Lütfen geçerli bir BIA raporu seçiniz.");
    }

    applyParsedScaleData(parsed, sourceLabel);
}

function showScaleStatus(message, type = 'info') {
    if (!el.scaleStatusBanner) return;
    el.scaleStatusBanner.style.display = 'block';
    if (type === 'error') {
        el.scaleStatusBanner.style.background = 'rgba(239, 68, 68, 0.15)';
        el.scaleStatusBanner.style.border = '1px solid var(--red)';
        el.scaleStatusBanner.style.color = '#f87171';
    } else if (type === 'success') {
        el.scaleStatusBanner.style.background = 'rgba(16, 185, 129, 0.15)';
        el.scaleStatusBanner.style.border = '1px solid var(--green)';
        el.scaleStatusBanner.style.color = '#34d399';
    } else {
        el.scaleStatusBanner.style.background = 'rgba(56, 189, 248, 0.15)';
        el.scaleStatusBanner.style.border = '1px solid var(--cyan)';
        el.scaleStatusBanner.style.color = 'var(--cyan)';
    }
    el.scaleStatusBanner.textContent = message;
}

function applyParsedScaleData(parsed, sourceLabel = 'Rapor') {
    if (!parsed || !parsed.weight) return;
    state.lastParsedScaleData = parsed;

    if (parsed.date && el.inputScaleDate) el.inputScaleDate.value = parsed.date;
    if (parsed.weight && el.inputScaleWeight) el.inputScaleWeight.value = parsed.weight;
    if (parsed.bodyFat && el.inputScaleBodyFat) el.inputScaleBodyFat.value = parsed.bodyFat;
    if ((parsed.skeletalMuscle || parsed.muscleMass) && el.inputScaleMuscleMass) {
        el.inputScaleMuscleMass.value = parsed.skeletalMuscle || parsed.muscleMass;
    }
    if (parsed.totalWaterPct && el.inputScaleWaterPct) {
        el.inputScaleWaterPct.value = parsed.totalWaterPct;
    }
    if (parsed.visceralFat && el.inputScaleVisceralFat) {
        el.inputScaleVisceralFat.value = parsed.visceralFat;
    }
    if (parsed.bmr && el.inputScaleBmr) {
        el.inputScaleBmr.value = parsed.bmr;
    }
    if (el.inputScaleScore) {
        const score = parsed.bodyScore ? `${parsed.bodyScore} Puan` : '';
        const age = parsed.bodyAge ? ` • ${parsed.bodyAge} Yaş` : '';
        el.inputScaleScore.value = (score + age).trim();
    }
    if (el.inputScaleNotes) {
        el.inputScaleNotes.value = `${sourceLabel} - FitLAB OCR`;
    }

    showScaleStatus(`✅ <strong>${sourceLabel} Başarıyla Ayrıştırıldı!</strong><br>${parsed.weight} kg • ${parsed.skeletalMuscle ? `${parsed.skeletalMuscle} kg İskelet Kası` : ''}${parsed.bodyFat ? ` • %${parsed.bodyFat} Yağ` : ''}${parsed.bmr ? ` • BMR ${parsed.bmr} kcal` : ''}`, 'success');
}

function clearScaleForm() {
    if (el.scaleEntryForm) el.scaleEntryForm.reset();
    if (el.inputScaleDate) el.inputScaleDate.value = new Date().toISOString().split('T')[0];
    if (el.scaleStatusBanner) el.scaleStatusBanner.style.display = 'none';
    state.lastParsedScaleData = null;
}

async function pasteScaleFromClipboard() {
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text && text.trim().length > 10) {
                const parsed = extractUniqueHealthData(text);
                if (parsed && parsed.weight) {
                    applyParsedScaleData(parsed, 'Panodan Okunan Metin');
                    return;
                }
            }
        }
        alert('Panoda geçerli bir rapor metni bulunamadı. Lütfen bir dosya sürükleyip bırakın veya metni kopyalayıp tekrar deneyin.');
    } catch (err) {
        console.warn("Pano okuma hatası:", err);
        alert('Panoya erişilemedi: ' + err.message);
    }
}

function loadSampleUniqueHealthReport() {
    const sample = {
        date: '2026-10-07',
        weight: 77.65,
        bodyFat: 15.9,
        skeletalMuscle: 37.2,
        muscleMass: 61.9,
        totalWater: 46.4,
        totalWaterPct: 59.8,
        visceralFat: 6,
        bmr: 1778,
        bodyScore: 84,
        bodyAge: 39,
        segmental: {
            leftArm: { fatKg: 0.8, muscleKg: 3.4 },
            rightArm: { fatKg: 0.8, muscleKg: 3.4 },
            trunk: { fatKg: 6.3, muscleKg: 28.6 },
            leftLeg: { fatKg: 1.6, muscleKg: 10.6 },
            rightLeg: { fatKg: 1.6, muscleKg: 10.4 }
        }
    };
    applyParsedScaleData(sample, '07.10.2026 Unique Health 3. Demo Raporu');
}

async function saveScaleAnalysis() {
    if (!state.selectedUserId) {
        alert('Lütfen önce bir sporcu seçin.');
        return;
    }

    const dateVal = el.inputScaleDate.value || new Date().toISOString().split('T')[0];
    const weightVal = parseFloat(el.inputScaleWeight.value);
    const bodyFatVal = parseFloat(el.inputScaleBodyFat.value) || null;
    const muscleVal = parseFloat(el.inputScaleMuscleMass.value) || null;
    const waterVal = parseFloat(el.inputScaleWaterPct.value) || null;
    const viscVal = parseInt(el.inputScaleVisceralFat.value, 10) || null;
    const bmrVal = parseInt(el.inputScaleBmr.value, 10) || null;
    const scoreVal = el.inputScaleScore.value.trim();
    const notesVal = el.inputScaleNotes.value.trim();

    if (!weightVal || isNaN(weightVal) || weightVal <= 0) {
        alert('Lütfen geçerli bir ağırlık / kilo değeri giriniz!');
        return;
    }

    const entry = {
        id: 'scale_' + Date.now(),
        date: dateVal,
        weight: Math.round(weightVal * 10) / 10,
        bodyFat: bodyFatVal ? Math.round(bodyFatVal * 10) / 10 : null,
        muscleMass: muscleVal ? Math.round(muscleVal * 10) / 10 : null,
        skeletalMuscle: muscleVal ? Math.round(muscleVal * 10) / 10 : null,
        waterPct: waterVal ? Math.round(waterVal * 10) / 10 : null,
        visceralFat: viscVal,
        bmr: bmrVal,
        scoreNotes: scoreVal,
        notes: notesVal || 'FitLAB Tartı Masası Kaydı',
        timestamp: Date.now()
    };

    if (state.lastParsedScaleData) {
        entry.uniqueHealth = state.lastParsedScaleData;
        state.lastParsedScaleData = null;
    }

    let logs = state.scaleLogs || [];
    logs = logs.filter(l => l.date !== dateVal);
    logs.unshift(entry);
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    state.scaleLogs = logs;

    el.btnSaveScaleEntry.disabled = true;
    el.btnSaveScaleEntry.textContent = '⏳ Kaydediliyor...';

    try {
        const res = await window.coachAPI.saveScaleLogs(state.selectedUserId, logs);
        if (res.success) {
            showToast(`✅ Tartı analizi kaydedildi ve buluta aktarıldı! (${state.selectedUser.name})`);
            window.coachAPI.showNotification(
                '⚖️ Tartı Analizi Güncellendi',
                `${state.selectedUser.name}: ${entry.weight} kg, %${entry.bodyFat || '-'} yağ kaydedildi.`
            );

            // Analiz motorunu yeni tartı verisiyle yeniden koştur
            const analysis = await window.coachAPI.analyzeHistory(state.workoutLogs, state.selectedUser, state.scaleLogs);
            state.academicAnalysis = analysis;

            renderDashboard(analysis);
            renderSidebarBodyComp();
            renderBodyCompView();
        } else {
            alert('Buluta kaydetme hatası: ' + res.error);
        }
    } catch (err) {
        console.error("Kaydetme hatası:", err);
        alert('Kaydetme hatası: ' + err.message);
    } finally {
        el.btnSaveScaleEntry.disabled = false;
        el.btnSaveScaleEntry.textContent = '💾 Tartı Analizini Kaydet & Buluta Aktar';
    }
}

async function deleteScaleEntry(id) {
    if (!confirm('Bu tartı kaydını silmek istediğinize emin misiniz?')) return;

    let logs = (state.scaleLogs || []).filter(l => l.id !== id);
    state.scaleLogs = logs;

    try {
        await window.coachAPI.saveScaleLogs(state.selectedUserId, logs);
        showToast('🗑️ Tartı kaydı silindi.');

        const analysis = await window.coachAPI.analyzeHistory(state.workoutLogs, state.selectedUser, state.scaleLogs);
        state.academicAnalysis = analysis;

        renderDashboard(analysis);
        renderSidebarBodyComp();
        renderBodyCompView();
    } catch (err) {
        console.error("Silme hatası:", err);
    }
}

function renderBodyCompView() {
    if (!el.viewBodyComp) return;

    const athleteName = state.selectedUser ? (state.selectedUser.name || state.selectedUser.username) : 'Sporcu';
    const subTitle = document.getElementById('bodyCompHeaderSub');
    if (subTitle) {
        subTitle.textContent = `${athleteName} için BIA tartı analizleri, trend takibi ve antrenman periyodizasyonu`;
    }

    const bc = state.academicAnalysis?.bodyComposition;
    if (!bc || !bc.hasData) {
        el.bodyCompPhaseBadge.textContent = 'Tartı Bekleniyor';
        el.bodyCompPhaseBadge.style.color = 'var(--text-muted)';
        el.bKpiWeight.textContent = '- kg';
        el.bKpiWeightDelta.textContent = '-';
        el.bKpiFat.textContent = '-%';
        el.bKpiFatDelta.textContent = '-';
        el.bKpiMuscle.textContent = '- kg';
        el.bKpiMuscleDelta.textContent = '-';
        el.bKpiLeanMass.textContent = '- kg';
        el.bKpiFatMass.textContent = '- kg';
        el.bKpiViscBmr.textContent = '-';
        el.academicDiagnosisBox.innerHTML = `
            <div class="empty-state">
                Sporcuya ait henüz kayıtlı tartı analizi bulunmuyor. Sol taraftaki alandan Unique Health / InBody PDF raporunu yükleyin veya değerleri girip kaydedin.
            </div>
        `;
        if (el.segmentalBox) el.segmentalBox.style.display = 'none';
        renderScaleHistoryTable([]);
        renderScaleTimelineChart([]);
        return;
    }

    const m = bc.metrics;
    const delta = bc.delta;
    const diag = bc.diagnosis;

    // Faz Rozeti
    el.bodyCompPhaseBadge.textContent = diag.phaseTitle;

    // KPI'lar
    el.bKpiWeight.textContent = `${m.weight} kg`;
    if (delta) {
        const sign = delta.weightKg > 0 ? '+' : '';
        el.bKpiWeightDelta.textContent = `${sign}${delta.weightKg} kg (Son Ölçüme Göre)`;
        el.bKpiWeightDelta.className = 'b-kpi-delta ' + (delta.weightKg <= 0 ? 'good' : 'warn');
    } else {
        el.bKpiWeightDelta.textContent = 'İlk Ölçüm';
        el.bKpiWeightDelta.className = 'b-kpi-delta';
    }

    el.bKpiFat.textContent = m.bodyFat !== null ? `%${m.bodyFat}` : '-';
    if (delta && delta.bodyFatPct !== null) {
        const sign = delta.bodyFatPct > 0 ? '+' : '';
        el.bKpiFatDelta.textContent = `${sign}${delta.bodyFatPct}%`;
        el.bKpiFatDelta.className = 'b-kpi-delta ' + (delta.bodyFatPct <= 0 ? 'good' : 'warn');
    } else {
        el.bKpiFatDelta.textContent = '-';
        el.bKpiFatDelta.className = 'b-kpi-delta';
    }

    el.bKpiMuscle.textContent = m.skeletalMuscle !== null ? `${m.skeletalMuscle} kg` : '-';
    if (delta && delta.muscleKg !== null) {
        const sign = delta.muscleKg > 0 ? '+' : '';
        el.bKpiMuscleDelta.textContent = `${sign}${delta.muscleKg} kg`;
        el.bKpiMuscleDelta.className = 'b-kpi-delta ' + (delta.muscleKg >= 0 ? 'good' : 'warn');
    } else {
        el.bKpiMuscleDelta.textContent = '-';
        el.bKpiMuscleDelta.className = 'b-kpi-delta';
    }

    el.bKpiLeanMass.textContent = m.leanMassKg ? `${m.leanMassKg} kg` : '-';
    el.bKpiFatMass.textContent = m.fatMassKg ? `${m.fatMassKg} kg` : '-';
    el.bKpiViscBmr.textContent = `${m.bmr ? m.bmr + ' kcal' : '-'} • Viseral: ${m.visceralFat || '-'}`;

    // Akademik Teşhis Kutusu
    const guidelinesHtml = (diag.scientificGuidelines || []).map(g => `
        <div class="diagnosis-guideline">• ${g}</div>
    `).join('');

    el.academicDiagnosisBox.innerHTML = `
        <div class="diagnosis-title">🔬 Fizyolojik & Biyomekanik Koç Değerlendirmesi</div>
        <div class="diagnosis-guideline"><strong>Hedef Antrenman Fazı:</strong> ${diag.phaseTitle}</div>
        <div class="diagnosis-guideline"><strong>Kondisyon & Metabolik Yoğunluk İhtiyacı:</strong> ${diag.conditioningDemand === 'HIGH' ? '🔥 YÜKSEK (Glikolitik Finişerler)' : 'Dengeli / Orta'}</div>
        <div class="diagnosis-guideline"><strong>Vücut Ağırlığı & Relatif Kuvvet Notu:</strong> ${diag.calisthenicsNote}</div>
        ${guidelinesHtml}
    `;

    // Segmental Analiz
    if (bc.segmental && el.segmentalBox && el.segmentalGrid) {
        el.segmentalBox.style.display = 'block';
        const s = bc.segmental;
        const items = [
            { name: 'Sol Kol', muscle: s.leftArm?.muscleKg, fat: s.leftArm?.fatKg },
            { name: 'Sağ Kol', muscle: s.rightArm?.muscleKg, fat: s.rightArm?.fatKg },
            { name: 'Gövde', muscle: s.trunk?.muscleKg, fat: s.trunk?.fatKg },
            { name: 'Sol Bacak', muscle: s.leftLeg?.muscleKg, fat: s.leftLeg?.fatKg },
            { name: 'Sağ Bacak', muscle: s.rightLeg?.muscleKg, fat: s.rightLeg?.fatKg }
        ];
        el.segmentalGrid.innerHTML = items.map(it => `
            <div class="seg-item">
                <div class="seg-name">${it.name}</div>
                <div class="seg-muscle">${it.muscle || '-'} kg Kas</div>
                <div class="seg-fat">${it.fat || '-'} kg Yağ</div>
            </div>
        `).join('');
    } else if (el.segmentalBox) {
        el.segmentalBox.style.display = 'none';
    }

    renderScaleHistoryTable(state.scaleLogs || []);
    renderScaleTimelineChart(state.scaleLogs || []);
}

function renderScaleHistoryTable(logs) {
    if (!el.scaleHistoryTableBody) return;
    if (!Array.isArray(logs) || logs.length === 0) {
        el.scaleHistoryTableBody.innerHTML = `
            <tr><td colspan="8" class="text-center" style="color:var(--text-muted); padding:16px;">Kayıtlı tartı analizi bulunamadı.</td></tr>
        `;
        if (el.scaleHistoryCount) el.scaleHistoryCount.textContent = '0 Kayıt';
        return;
    }

    if (el.scaleHistoryCount) el.scaleHistoryCount.textContent = `${logs.length} Kayıt`;

    el.scaleHistoryTableBody.innerHTML = logs.map(l => `
        <tr>
            <td style="font-weight:700; color:#fff;">${formatDateTr(l.date)}</td>
            <td style="font-weight:800; color:var(--gold);">${l.weight} kg</td>
            <td style="color:${parseFloat(l.bodyFat) > 18 ? 'var(--orange)' : 'var(--cyan)'};">${l.bodyFat ? '%' + l.bodyFat : '-'}</td>
            <td style="color:var(--green); font-weight:700;">${l.skeletalMuscle || l.muscleMass || '-'} kg</td>
            <td>${l.waterPct ? '%' + l.waterPct : '-'}</td>
            <td>${l.visceralFat || '-'}</td>
            <td>${l.bmr ? l.bmr + ' kcal' : '-'}</td>
            <td>
                <button type="button" class="btn-table-delete" onclick="deleteScaleEntry('${l.id}')" title="Bu kaydı sil">🗑️</button>
            </td>
        </tr>
    `).join('');
}
window.deleteScaleEntry = deleteScaleEntry;

function renderScaleTimelineChart(logs) {
    if (!el.scaleTimelineCanvas) return;

    if (state.scaleTimelineChart) {
        state.scaleTimelineChart.destroy();
        state.scaleTimelineChart = null;
    }

    if (!Array.isArray(logs) || logs.length === 0) return;

    // Tarihe göre eskiden yeniye sırala
    const sorted = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sorted.map(l => formatDateTr(l.date));
    const weights = sorted.map(l => l.weight || null);
    const bodyFats = sorted.map(l => l.bodyFat || null);
    const muscles = sorted.map(l => l.skeletalMuscle || l.muscleMass || null);

    const ctx = el.scaleTimelineCanvas.getContext('2d');
    state.scaleTimelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ağırlık (kg)',
                    data: weights,
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    yAxisID: 'yKg',
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'İskelet Kası (kg)',
                    data: muscles,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'yKg',
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Yağ Oranı (%)',
                    data: bodyFats,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    yAxisID: 'yPct',
                    borderDash: [4, 4],
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1', font: { size: 11, weight: 'bold' } }
                }
            },
            scales: {
                yKg: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' },
                    title: { display: true, text: 'Kütle (kg)', color: '#eab308' }
                },
                yPct: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#f97316' },
                    title: { display: true, text: 'Yağ (%)', color: '#f97316' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#cbd5e1' }
                }
            }
        }
    });
}

// ==================== YARDIMCI FONKSİYONLAR ====================
function escapeHtmlForMarkdown(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
    if (!text) return '';
    const safeText = escapeHtmlForMarkdown(text);
    return safeText
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

    el.viewDashboard.style.display = viewName === 'dashboard' ? 'flex' : 'none';
    el.viewLab.style.display = viewName === 'lab' ? 'flex' : 'none';
    if (el.viewAnalytics) el.viewAnalytics.style.display = viewName === 'analytics' ? 'flex' : 'none';
    if (el.viewBodyComp) el.viewBodyComp.style.display = viewName === 'bodycomp' ? 'flex' : 'none';
    if (el.viewConsult) el.viewConsult.style.display = viewName === 'consult' ? 'flex' : 'none';
    if (el.viewCalendar) el.viewCalendar.style.display = viewName === 'calendar' ? 'flex' : 'none';

    el.tabBtnDashboard.classList.toggle('active', viewName === 'dashboard');
    el.tabBtnLab.classList.toggle('active', viewName === 'lab');
    if (el.tabBtnAnalytics) el.tabBtnAnalytics.classList.toggle('active', viewName === 'analytics');
    if (el.tabBtnBodyComp) el.tabBtnBodyComp.classList.toggle('active', viewName === 'bodycomp');
    if (el.tabBtnConsult) el.tabBtnConsult.classList.toggle('active', viewName === 'consult');
    if (el.tabBtnCalendar) el.tabBtnCalendar.classList.toggle('active', viewName === 'calendar');

    if (viewName === 'analytics') {
        renderDesktopAnalytics();
    } else if (viewName === 'bodycomp') {
        renderBodyCompView();
    } else if (viewName === 'consult') {
        renderConsultationContext();
    } else if (viewName === 'calendar') {
        renderDesktopCalendar();
    } else if (viewName === 'lab' && state.catalog.length === 0) {
        loadExerciseCatalog();
    }
}
window.switchView = switchView;

// ==================== AI CONSULTATION CHAMBER (İSTİŞARE ODASI) ====================
let consultationConversation = []; // Gemini diyalog bağlamı [{ role: 'user'|'model', text: string }]
let consultationMessagesList = []; // Kayıtlı tam diyalog nesneleri [{ id, sender, role, text, timestamp, directiveSent }]
let consultMsgStore = {};
let currentConsultLoadedUserId = null;

function updateConsultationBadge(count = 0, lastUpdated = null) {
    if (!el.consultSaveStatusText) return;
    if (count === 0) {
        el.consultSaveStatusText.textContent = 'Yeni Oturum';
        if (el.consultSaveStatusBadge) {
            el.consultSaveStatusBadge.style.borderColor = 'var(--border-subtle)';
            el.consultSaveStatusBadge.title = 'Henüz bu sporcu için kayıtlı istişare mesajı bulunmuyor.';
        }
    } else {
        const timePart = lastUpdated 
            ? new Date(lastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            : '';
        el.consultSaveStatusText.textContent = `Kayıtlı (${count} mesaj${timePart ? ' • ' + timePart : ''})`;
        if (el.consultSaveStatusBadge) {
            el.consultSaveStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            el.consultSaveStatusBadge.title = `Tüm görüşmeler yerel olarak kaydedildi. Son güncelleme: ${lastUpdated || 'Az önce'}`;
        }
    }
}

function saveCurrentConsultationHistory() {
    if (!state.selectedUserId) return;
    try {
        const payload = {
            athleteId: state.selectedUserId,
            athleteName: state.selectedUser?.name || 'Sporcu',
            lastUpdated: new Date().toISOString(),
            messages: consultationMessagesList
        };
        localStorage.setItem(`fitlab_consult_history_${state.selectedUserId}`, JSON.stringify(payload));
        updateConsultationBadge(consultationMessagesList.length, payload.lastUpdated);
    } catch (e) {
        console.warn("İstişare geçmişi kaydedilemedi:", e);
    }
}

function renderWelcomeBubble() {
    const stream = el.consultMessagesStream;
    if (!stream) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble chat-bubble-ai';
    bubble.innerHTML = `
        <div class="chat-bubble-sender">
            <span>🧠 FitLAB Biyomekanik Danışmanı</span>
        </div>
        <div class="chat-bubble-text">
            Merhaba <strong>${escapeHTML(state.selectedUser?.name || 'Şampiyon')}</strong>! Antrenmanında takıldığın, yapamadığın ya da değiştirmek istediğin bir hareket olduğunda buradayım.
            <br><br>
            Örneğin: <em>"Verilen programda Barfiks var ama ben hiç barfiks çekemiyorum; bunu nasıl çözelim?"</em> gibi sorular sorabilirsin.
            İster o hareketi sıfırdan kazandıracak <strong>progresyon protokolü</strong> çalışalım, ister aynı kası çalıştıracak <strong>daha basit bir ikame hareket</strong> koyalım.
            <br><br>
            <span style="font-size:11px; color:var(--text-secondary);">💡 Yaptığımız tüm görüşmeler bu sporcu için otomatik olarak hafızaya alınır ve dilediğin zaman kaldığın yerden devam edebilirsin.</span>
        </div>
    `;
    stream.appendChild(bubble);
}

function formatChatTime(timestamp) {
    if (!timestamp) return '';
    try {
        const d = new Date(timestamp);
        return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
}

function appendChatBubbleDOM(sender, text, showActions = false, timestamp = null, directiveSent = false, msgId = null) {
    const stream = el.consultMessagesStream;
    if (!stream) return null;

    if (!msgId) {
        msgId = `cmsg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    consultMsgStore[msgId] = text;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`;

    const senderTitle = sender === 'user' 
        ? `👤 ${state.selectedUser?.name || 'Sporcu'}` 
        : `🧠 FitLAB Biyomekanik Danışmanı`;

    const timeStr = formatChatTime(timestamp);

    let actionsHtml = '';
    if (showActions && sender === 'ai') {
        const hasWorkout = (text.includes('|') && /set|tekrar|blok|hareket|bench|curl|squat|row|press/i.test(text));

        if (directiveSent) {
            actionsHtml = `
                <div class="chat-bubble-actions">
                    <button type="button" class="btn-chat-action" id="btnPush_${msgId}" disabled style="color:#10b981; border-color:#10b981; background:rgba(16, 185, 129, 0.15);">
                        ✅ Web'e İletildi
                    </button>
                </div>
            `;
        } else if (hasWorkout) {
            actionsHtml = `
                <div class="chat-bubble-actions" style="display:flex; gap:6px; flex-wrap:wrap;">
                    <button type="button" class="btn-chat-action" id="btnAssignToday_${msgId}" onclick="pushWorkoutToTodayFromConsult('${msgId}', this)" style="background:rgba(245,158,11,0.2); border-color:#f59e0b; color:#f59e0b; font-weight:800;" title="Bu antrenmanı sporcunun bugünkü takvimine ata ve webde hemen başlatılabilir yap">
                        🔥 Bugüne Ata (Web'de Başlat)
                    </button>
                    <button type="button" class="btn-chat-action" id="btnPush_${msgId}" onclick="pushDirectiveFromConsult('${msgId}', this)" title="Bu koç tavsiyesini sporcunun telefonuna direktif olarak gönder">
                        📱 Web'e Gönder
                    </button>
                </div>
            `;
        } else {
            actionsHtml = `
                <div class="chat-bubble-actions">
                    <button type="button" class="btn-chat-action" id="btnPush_${msgId}" onclick="pushDirectiveFromConsult('${msgId}', this)" title="Bu koç tavsiyesini sporcunun telefonuna direktif olarak gönder">
                        📱 Web'e Gönder
                    </button>
                </div>
            `;
        }
    }

    const formattedContent = sender === 'ai' ? formatMarkdown(text) : escapeHTML(text);

    bubble.innerHTML = `
        <div class="chat-bubble-sender">
            <span>${senderTitle}</span>
            ${timeStr ? `<span class="chat-bubble-time">${timeStr}</span>` : ''}
        </div>
        <div class="chat-bubble-text">${formattedContent}</div>
        ${actionsHtml}
    `;

    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;
    return msgId;
}

function loadConsultationHistoryForAthlete(athleteId) {
    if (!athleteId) return;
    currentConsultLoadedUserId = athleteId;
    consultationConversation = [];
    consultationMessagesList = [];
    consultMsgStore = {};

    const stream = el.consultMessagesStream;
    if (!stream) return;
    stream.innerHTML = '';

    let data = null;
    try {
        const raw = localStorage.getItem(`fitlab_consult_history_${athleteId}`);
        if (raw) data = JSON.parse(raw);
    } catch (e) {
        console.warn("İstişare geçmişi okunamadı:", e);
    }

    if (!data || !Array.isArray(data.messages) || data.messages.length === 0) {
        renderWelcomeBubble();
        updateConsultationBadge(0, null);
        return;
    }

    // Geçmiş oturum var: Oturum ayracı ekle
    const dateFormatted = data.lastUpdated 
        ? new Date(data.lastUpdated).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';
    const divider = document.createElement('div');
    divider.className = 'consult-history-divider';
    divider.innerHTML = `<span>🕒 Kayıtlı İstişare Oturumu Yüklendi • ${data.messages.length} Mesaj • Son: ${dateFormatted}</span>`;
    stream.appendChild(divider);

    // Mesajları sırayla yükle
    data.messages.forEach(msg => {
        const role = msg.role || (msg.sender === 'user' ? 'user' : 'model');
        consultationConversation.push({ role, text: msg.text });
        consultationMessagesList.push(msg);
        appendChatBubbleDOM(
            msg.sender,
            msg.text,
            msg.sender === 'ai',
            msg.timestamp,
            msg.directiveSent,
            msg.id
        );
    });

    updateConsultationBadge(data.messages.length, data.lastUpdated);
    stream.scrollTop = stream.scrollHeight;
}
window.loadConsultationHistoryForAthlete = loadConsultationHistoryForAthlete;

function renderConsultationContext() {
    if (!el.consultAthleteBrief) return;
    const user = state.selectedUser;
    if (!user) {
        if (el.consultAthleteName) el.consultAthleteName.textContent = 'Sporcu Seçilmedi';
        if (el.consultAthleteMetrics) el.consultAthleteMetrics.textContent = 'Lütfen üst bardan bir sporcu seçin.';
        updateConsultationBadge(0, null);
        return;
    }

    if (el.consultAthleteName) {
        el.consultAthleteName.textContent = `${user.avatar || '🥋'} ${user.name} (${user.level || 'Orta Seviye'})`;
    }

    if (el.consultAthleteMetrics) {
        const bc = state.academicAnalysis?.bodyComposition;
        let str = `Tamamlanan Seans: ${state.workoutLogs.length} | `;
        if (bc?.hasData) {
            str += `Kilo: ${bc.metrics.weight} kg | Yağ: %${bc.metrics.bodyFat || '-'} | Kas: ${bc.metrics.skeletalMuscle || '-'} kg`;
        } else {
            str += `Kayıtlı tartı analizi yok (Standart profil)`;
        }
        el.consultAthleteMetrics.textContent = str;
    }

    // Eğer farklı bir sporcu seçiliyse veya henüz yüklenmediyse geçmişi yükle
    if (currentConsultLoadedUserId !== user.id) {
        loadConsultationHistoryForAthlete(user.id);
    }
}

function triggerQuickConsult(scenario) {
    const prompts = {
        pullup_regression: "Programımda Barfiks var ama ben hiç barfiks çekemiyorum. Bu hareketi nasıl kazanırım (progresyon) veya yerine aynı kasları vuracak daha basit hangi ikame hareketi yapmalıyım?",
        squat_knee_pain: "Squat yaparken dizimde batma ve rahatsızlık hissediyorum. Dizimi koruyacak biyomekanik ikame hareketler veya regresyonlar nelerdir?",
        shoulder_impingement: "Lateral raise yaparken omuz başımdan çok boyun ve trapezlerim kasılıyor. Yan deltoidi izole eden alternatifler ve form düzeltmeleri nedir?",
        kettlebell_substitute: "Salonda Kettlebell bulunmuyor. Kettlebell Swing ve Clean hareketlerini dambıl ile nasıl ikame edebilirim?",
        compact_routine: "Antrenman sürem 60 dakikayı aşıyor ve çok uzuyor. Efektif hacmi koruyarak seansımı süpersetlerle 40-45 dakikaya nasıl indirgeyebiliriz?"
    };

    const text = prompts[scenario];
    if (text) {
        if (el.consultUserInput) el.consultUserInput.value = text;
        sendConsultationMessage(text);
    }
}
window.triggerQuickConsult = triggerQuickConsult;

function appendChatBubble(sender, text, showActions = false) {
    const nowIso = new Date().toISOString();
    const msgId = `cmsg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    appendChatBubbleDOM(sender, text, showActions, nowIso, false, msgId);

    // Listeye ve depoya ekle
    consultationMessagesList.push({
        id: msgId,
        sender,
        role: sender === 'user' ? 'user' : 'model',
        text,
        timestamp: nowIso,
        directiveSent: false
    });
    saveCurrentConsultationHistory();
}

let loadingBubbleCounter = 0;
function appendChatLoadingBubble() {
    const stream = el.consultMessagesStream;
    if (!stream) return null;

    loadingBubbleCounter++;
    const id = `loadingBubble_${loadingBubbleCounter}`;
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.className = 'chat-bubble chat-bubble-ai';
    bubble.innerHTML = `
        <div class="chat-bubble-sender">🧠 FitLAB Biyomekanik Danışmanı</div>
        <div style="display:flex; align-items:center; gap:8px; color:var(--text-secondary); font-size:12px;">
            <span class="loading-spinner" style="display:inline-block; width:12px; height:12px; border:2px solid var(--gold); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
            <span>Biyomekanik seçenekler ve ikameler değerlendiriliyor...</span>
        </div>
    `;

    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;
    return id;
}

function removeChatLoadingBubble(id) {
    if (!id) return;
    const elBubble = document.getElementById(id);
    if (elBubble) elBubble.remove();
}

async function sendConsultationMessage(presetText = null) {
    const input = el.consultUserInput;
    const text = presetText || (input ? input.value.trim() : '');
    if (!text) return;

    if (!state.selectedUser) {
        showToast('⚠️ Lütfen önce üst bardan bir sporcu seçin.');
        return;
    }

    // Kullanıcı balonunu ekle (otomatik olarak kaydedilir)
    appendChatBubble('user', text);
    if (input && !presetText) input.value = '';

    // Diyalog geçmişine ekle
    consultationConversation.push({ role: 'user', text });

    // Yükleniyor balonunu göster
    const loadingBubbleId = appendChatLoadingBubble();

    try {
        const result = await window.coachAPI.consultWithAi({
            profile: state.selectedUser,
            academicData: state.academicAnalysis || {},
            conversationHistory: consultationConversation.slice(-14),
            message: text
        });

        removeChatLoadingBubble(loadingBubbleId);

        const aiReply = result.reply;
        consultationConversation.push({ role: 'model', text: aiReply });
        appendChatBubble('ai', aiReply, true);

    } catch (err) {
        removeChatLoadingBubble(loadingBubbleId);
        console.error("İstişare hatası:", err);
        appendChatBubble('ai', `⚠️ İstişare sırasında bir hata oluştu: ${err.message || err}`);
    }
}
window.sendConsultationMessage = sendConsultationMessage;

function clearConsultationChat() {
    if (!state.selectedUserId) {
        showToast('⚠️ Lütfen önce bir sporcu seçin.');
        return;
    }

    const athleteName = state.selectedUser?.name || 'Bu sporcu';
    const ok = confirm(`${athleteName} için kayıtlı tüm istişare görüşmelerini sıfırlamak istiyor musunuz?\n\nBu işlem geri alınamaz.`);
    if (!ok) return;

    localStorage.removeItem(`fitlab_consult_history_${state.selectedUserId}`);
    loadConsultationHistoryForAthlete(state.selectedUserId);
    showToast('🧹 İstişare geçmişi başarıyla sıfırlandı.');
}
window.clearConsultationChat = clearConsultationChat;

async function pushDirectiveFromConsult(msgId, btnElement = null) {
    if (!state.selectedUserId) {
        showToast('⚠️ Lütfen önce üst bardan bir sporcu seçin.');
        return;
    }

    const fullText = consultMsgStore[msgId] || '';
    if (!fullText) {
        showToast('⚠️ Gönderilecek tavsiye metni bulunamadı.');
        return;
    }

    // Kısa bir koç direktifi özeti çıkar (ilk 2-3 cümle veya 250 karakter)
    const cleanLines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    const firstLines = cleanLines.slice(0, 3).join(' ');
    const shortDirective = firstLines.length > 250 ? firstLines.substring(0, 247) + '...' : (firstLines || fullText.substring(0, 250));

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '⏳ Gönderiliyor...';
    }

    const payload = {
        title: '💬 FitLAB İstişare Tavsiyesi',
        text: shortDirective,
        fullReport: fullText,
        targetAthlete: state.selectedUser?.name || 'Sporcu',
        badge: 'Biyomekanik İstişare',
        active: true,
        sentAt: new Date().toISOString()
    };

    try {
        const res = await window.coachAPI.sendDirectiveToWeb(state.selectedUserId, payload);
        if (res && res.success) {
            if (btnElement) {
                btnElement.innerHTML = '✅ Web\'e Gönderildi';
                btnElement.style.color = '#10b981';
                btnElement.style.borderColor = '#10b981';
                btnElement.style.background = 'rgba(16, 185, 129, 0.15)';
            }

            // Kayıtlı mesaj listesinde bu mesajı 'directiveSent = true' olarak güncelle ve kaydet
            const targetMsg = consultationMessagesList.find(m => m.id === msgId);
            if (targetMsg) {
                targetMsg.directiveSent = true;
                saveCurrentConsultationHistory();
            }

            showToast(`🚀 Tavsiye sporcunun (${state.selectedUser?.name || 'Sporcu'}) telefonuna başarıyla iletildi!`);
            if (window.coachAPI && window.coachAPI.showNotification) {
                window.coachAPI.showNotification(
                    '📱 Web Direktifi Gönderildi',
                    `${state.selectedUser?.name || 'Sporcu'} telefonundaki web uygulamasını açtığında bu tavsiyeyi görecek.`
                );
            }
        } else {
            throw new Error(res?.error || 'Bulut veritabanına yazılamadı.');
        }
    } catch (err) {
        console.error("Web direktifi gönderim hatası:", err);
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = '⚠️ Tekrar Dene';
        }
        alert(`Web uygulamasına gönderim hatası: ${err.message || err}`);
    }
}
window.pushDirectiveFromConsult = pushDirectiveFromConsult;

function extractProtocolTitleFromText(text) {
    if (!text) return 'FitLAB Antrenman Protokolü';
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const l of lines) {
        if (l.startsWith('#')) {
            return l.replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
        }
        if (l.startsWith('**') && l.endsWith('**') && l.length > 6) {
            return l.replace(/\*+/g, '').trim();
        }
    }
    return 'FitLAB Antrenman Protokolü';
}

function parseConsultWorkoutExercises(fullText) {
    if (!fullText) return null;
    const lines = fullText.split('\n');
    const exercises = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
            const lower = trimmed.toLowerCase();
            if (lower.includes('blok') && lower.includes('hareket')) continue;
            if (lower.includes('egzersiz') && lower.includes('set')) continue;
            const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
            if (cells.length >= 2) {
                let rawName = cells[0].replace(/\*+/g, '').trim();
                let setRepCell = cells[1] || '';
                let note = cells.slice(2).join(' • ');

                if (rawName.length <= 4 || /^[A-Z0-9\.\-\s]{1,5}$/i.test(rawName) || ['blok', 'bitiriş', 'finisher', 'isinma'].includes(rawName.toLowerCase())) {
                    rawName = (cells[1] || '').replace(/\*+/g, '').trim();
                    setRepCell = cells[2] || '';
                    note = cells.slice(3).join(' • ');
                }

                if (!rawName || rawName.length < 3) continue;

                let sets = 3;
                let reps = '8-12';
                const srMatch = setRepCell.match(/(\d+)\s*[xX*]\s*([0-9\-–]+)/);
                if (srMatch) {
                    sets = parseInt(srMatch[1], 10) || 3;
                    reps = srMatch[2] || '8-12';
                } else {
                    const sMatch = setRepCell.match(/(\d+)\s*set/i);
                    if (sMatch) sets = parseInt(sMatch[1], 10) || 3;
                    const rMatch = setRepCell.match(/([0-9\-–]+)\s*(?:tekrar|rep)/i);
                    if (rMatch) reps = rMatch[1];
                }

                let matchedEx = null;
                if (Array.isArray(state.catalog)) {
                    const normRaw = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    matchedEx = state.catalog.find(e => {
                        const n = (e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                        return n === normRaw || n.includes(normRaw) || normRaw.includes(n);
                    });
                }

                exercises.push({
                    id: matchedEx ? matchedEx.id : ('gen_' + Math.random().toString(36).substring(2, 8)),
                    name: matchedEx ? matchedEx.name : rawName,
                    category: matchedEx ? matchedEx.category : 'dumbbell',
                    equipment: matchedEx ? matchedEx.equipment : 'Dambıl & Sehpa',
                    targetSets: sets,
                    targetReps: reps,
                    note: note || ''
                });
            }
        }
    }
    return exercises.length > 0 ? exercises : null;
}

async function pushWorkoutToTodayFromConsult(msgId, btnElement = null) {
    if (!state.selectedUserId) {
        showToast('⚠️ Lütfen önce üst bardan bir sporcu seçin.');
        return;
    }

    const fullText = consultMsgStore[msgId] || '';
    if (!fullText) {
        showToast('⚠️ Antrenman metni bulunamadı.');
        return;
    }

    const exercises = parseConsultWorkoutExercises(fullText);
    const title = extractProtocolTitleFromText(fullText);
    const todayName = new Date().toLocaleDateString('tr-TR', { weekday: 'long' });

    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerHTML = '⏳ Bugüne Atanıyor...';
    }

    const cleanLines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
    const firstLines = cleanLines.slice(0, 3).join(' ');
    const shortDirective = firstLines.length > 250 ? firstLines.substring(0, 247) + '...' : (firstLines || fullText.substring(0, 250));

    const workoutObj = {
        id: 'fitlab_today_' + Date.now(),
        title: title,
        duration: Math.max(30, Math.round((exercises ? exercises.length : 6) * 6.5)),
        exercises: exercises || [],
        isDirective: true,
        source: 'fitlab_consult'
    };

    const payload = {
        title: `🔥 FitLAB Antrenmanı: ${title}`,
        text: shortDirective,
        fullReport: fullText,
        targetAthlete: state.selectedUser?.name || 'Sporcu',
        badge: 'Bugünün Antrenmanı',
        active: true,
        assignToToday: true,
        parsedWorkout: workoutObj,
        sentAt: new Date().toISOString()
    };

    try {
        const res = await window.coachAPI.sendDirectiveToWeb(state.selectedUserId, payload);
        if (res && res.success) {
            if (btnElement) {
                btnElement.innerHTML = '✅ Bugüne Atandı!';
                btnElement.style.color = '#10b981';
                btnElement.style.borderColor = '#10b981';
                btnElement.style.background = 'rgba(16, 185, 129, 0.15)';
            }

            const targetMsg = consultationMessagesList.find(m => m.id === msgId);
            if (targetMsg) {
                targetMsg.directiveSent = true;
                saveCurrentConsultationHistory();
            }

            showToast(`🔥 Antrenman sporcunun (${state.selectedUser?.name || 'Sporcu'}) bugünkü (${todayName}) programına atandı ve iletildi!`);
            if (window.coachAPI && window.coachAPI.showNotification) {
                window.coachAPI.showNotification(
                    '🔥 Bugüne Atandı',
                    `"${title}" sporcunun bugünkü (${todayName}) antrenmanına başarıyla yüklendi.`
                );
            }
        } else {
            throw new Error(res?.error || 'Bulut veritabanına yazılamadı.');
        }
    } catch (err) {
        console.error("Bugüne atama hatası:", err);
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerHTML = '⚠️ Tekrar Dene';
        }
        alert(`Bugüne atama hatası: ${err.message || err}`);
    }
}
window.pushWorkoutToTodayFromConsult = pushWorkoutToTodayFromConsult;

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
        const has3d = !!(ex.opengym && ex.opengym.clip);
        const stillRel = (ex.opengym && ex.opengym.still) ? ex.opengym.still : (ex.formImage || '');
        const stillPath = stillRel ? `fitlab-asset://app/${stillRel.replace(/^(\.\/|\/)+/, '')}` : '';

        return `
            <div class="lab-card ${isActive ? 'active' : ''} ${isExcluded ? 'is-card-excluded' : ''}" data-id="${ex.id}">
                ${stillPath ? `
                    <div class="lab-card-thumb-wrap">
                        <img class="lab-card-thumb" src="${stillPath}" alt="${escapeHTML(ex.name)}" loading="lazy" onerror="this.parentElement.style.display='none'" />
                        ${has3d ? `<span class="badge-card-3d">▶ 3D</span>` : ''}
                    </div>
                ` : ''}
                <div class="lab-card-info">
                    <div class="lab-card-header">
                        <div class="lab-card-title">${escapeHTML(ex.name)} ${isExcluded ? '<span style="color:#f87171; font-size:10px; font-weight:800; margin-left:4px;">[GİZLİ]</span>' : ''}</div>
                    </div>
                    <div class="lab-card-tags">
                        <span class="muscle-pill">${escapeHTML(ex.primary)}</span>
                        <span class="type-pill">${escapeHTML(typeLabel)}</span>
                    </div>
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

    // OpenGym 3D videosu varsa varsayılan olarak opengym sekmesine geç, yoksa form sekmesine
    if (ex.opengym && ex.opengym.clip) {
        state.visualTab = 'opengym';
    } else if (state.visualTab === 'opengym') {
        state.visualTab = 'form';
    }

    // Görsel / Videoyu Güncelle
    updateInspectorImage();

    // Kas Aktivasyon Barlarını Oluştur
    renderActivationBars(ex);
}

function setVisualTab(tabName) {
    state.visualTab = tabName;
    if (el.btnTabOpengym) el.btnTabOpengym.classList.toggle('active', tabName === 'opengym');
    if (el.btnTabForm) el.btnTabForm.classList.toggle('active', tabName === 'form');
    if (el.btnTabAnatomi) el.btnTabAnatomi.classList.toggle('active', tabName === 'anatomi');
    updateInspectorImage();
}

let currentImageLoadToken = 0;

async function updateInspectorImage() {
    if (!state.selectedExercise) return;
    const ex = state.selectedExercise;
    const token = ++currentImageLoadToken;

    // Elementleri sıfırla
    el.inspImageFallback.style.display = 'none';
    if (el.inspVideo) {
        try { el.inspVideo.pause(); } catch(e) {}
        el.inspVideo.style.display = 'none';
        el.inspVideo.src = '';
    }
    el.inspImage.style.display = 'none';

    const hasOpengym = !!(ex.opengym && ex.opengym.clip);
    if (el.btnTabOpengym) {
        el.btnTabOpengym.style.display = hasOpengym ? 'inline-flex' : 'none';
        if (!hasOpengym && state.visualTab === 'opengym') {
            state.visualTab = 'form';
        }
    }

    if (el.btnTabOpengym) el.btnTabOpengym.classList.toggle('active', state.visualTab === 'opengym');
    if (el.btnTabForm) el.btnTabForm.classList.toggle('active', state.visualTab === 'form');
    if (el.btnTabAnatomi) el.btnTabAnatomi.classList.toggle('active', state.visualTab === 'anatomi');

    // 1. Durum: OpenGym 3D Canlı Animasyon (Video)
    if (state.visualTab === 'opengym' && hasOpengym && el.inspVideo) {
        if (el.inspZoomBadge) el.inspZoomBadge.textContent = '⚡ 3D Tam Ekran';
        const rawClip = ex.opengym.clip;
        const rawStill = ex.opengym.still;
        const cleanClip = rawClip.replace(/^(\.\/|\/)+/, '');
        const cleanStill = rawStill.replace(/^(\.\/|\/)+/, '');

        let resolvedClip = `fitlab-asset://app/${cleanClip}`;
        let resolvedStill = `fitlab-asset://app/${cleanStill}`;

        if (window.coachAPI && window.coachAPI.resolveAssetUrl) {
            try {
                resolvedClip = await window.coachAPI.resolveAssetUrl(rawClip);
                resolvedStill = await window.coachAPI.resolveAssetUrl(rawStill);
            } catch(e) {}
        }

        if (token !== currentImageLoadToken) return;

        el.inspVideo.poster = resolvedStill;
        el.inspVideo.src = resolvedClip;
        el.inspVideo.style.display = 'block';
        el.inspVideo.play().catch(() => {});
        return;
    }

    // 2. Durum: Statik Form veya Kas Anatomisi Görseli
    if (el.inspZoomBadge) el.inspZoomBadge.textContent = '🔍 Büyüt & İncele';

    const rawSrc = state.visualTab === 'form' 
        ? (ex.formImage || ex.diagramImage || null) 
        : (ex.anatomiImage || ex.formImage || null);

    if (!rawSrc) {
        el.inspImageFallback.style.display = 'flex';
        return;
    }

    const cleanRel = rawSrc.replace(/^(\.\/|\/)+/, '');
    const cdnUrl = `https://fitness.kantarci.io/${cleanRel}`;

    let resolvedUrl = `fitlab-asset://app/${cleanRel}`;
    if (window.coachAPI && window.coachAPI.resolveAssetUrl) {
        try {
            resolvedUrl = await window.coachAPI.resolveAssetUrl(rawSrc);
        } catch (e) {}
    }

    if (token !== currentImageLoadToken) return;

    let triedCdn = false;

    el.inspImage.onload = () => {
        if (token !== currentImageLoadToken) return;
        el.inspImage.style.display = 'block';
        el.inspImageFallback.style.display = 'none';
    };

    el.inspImage.onerror = () => {
        if (token !== currentImageLoadToken) return;
        if (!triedCdn && el.inspImage.src !== cdnUrl) {
            triedCdn = true;
            console.log(`[FitLAB Visual] Yerel dosya başarısız, CDN deneniyor: ${cdnUrl}`);
            el.inspImage.src = cdnUrl;
        } else {
            console.warn(`[FitLAB Visual] Görsel yüklenemedi: ${rawSrc}`);
            el.inspImage.style.display = 'none';
            el.inspImageFallback.style.display = 'flex';
        }
    };

    el.inspImage.src = resolvedUrl;
}

function initImageLightbox() {
    if (!el.imageLightboxModal) return;

    if (el.inspImageContainer) {
        el.inspImageContainer.addEventListener('click', () => {
            const hasVideo = el.inspVideo && el.inspVideo.style.display !== 'none' && el.inspVideo.src;
            const hasImg = el.inspImage && el.inspImage.style.display !== 'none' && el.inspImage.src;
            if (hasVideo || hasImg) {
                openImageLightbox();
            }
        });
    }

    if (el.btnCloseLightbox) {
        el.btnCloseLightbox.addEventListener('click', closeImageLightbox);
    }

    el.imageLightboxModal.addEventListener('click', (e) => {
        if (e.target === el.imageLightboxModal) {
            closeImageLightbox();
        }
    });

    if (el.btnLightboxZoom && el.lightboxImg) {
        el.btnLightboxZoom.addEventListener('click', (e) => {
            e.stopPropagation();
            const isZoomed = el.lightboxImg.classList.toggle('zoomed');
            el.btnLightboxZoom.textContent = isZoomed ? '🔍 Sığdır' : '🔍 %150 Büyüt';
        });
    }

    if (el.lightboxImg) {
        el.lightboxImg.addEventListener('click', () => {
            const isZoomed = el.lightboxImg.classList.toggle('zoomed');
            if (el.btnLightboxZoom) {
                el.btnLightboxZoom.textContent = isZoomed ? '🔍 Sığdır' : '🔍 %150 Büyüt';
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && el.imageLightboxModal && el.imageLightboxModal.style.display === 'flex') {
            closeImageLightbox();
        }
    });
}

function openImageLightbox() {
    const ex = state.selectedExercise;
    if (!ex || !el.imageLightboxModal) return;

    const isVideo = state.visualTab === 'opengym' && ex.opengym && ex.opengym.clip;

    if (isVideo && el.lightboxVideo) {
        if (el.lightboxImg) el.lightboxImg.style.display = 'none';
        el.lightboxVideo.src = el.inspVideo ? el.inspVideo.src : '';
        el.lightboxVideo.poster = el.inspVideo ? el.inspVideo.poster : '';
        el.lightboxVideo.style.display = 'block';
        el.lightboxVideo.play().catch(() => {});
        if (el.btnLightboxZoom) el.btnLightboxZoom.style.display = 'none';
        if (el.lightboxTabBadge) el.lightboxTabBadge.textContent = '⚡ OpenGym 3D Canlı Animasyon';
    } else {
        if (el.lightboxVideo) {
            try { el.lightboxVideo.pause(); } catch(e) {}
            el.lightboxVideo.style.display = 'none';
            el.lightboxVideo.src = '';
        }
        if (el.lightboxImg && el.inspImage) {
            el.lightboxImg.src = el.inspImage.src;
            el.lightboxImg.style.display = 'block';
            el.lightboxImg.classList.remove('zoomed');
        }
        if (el.btnLightboxZoom) {
            el.btnLightboxZoom.style.display = 'inline-block';
            el.btnLightboxZoom.textContent = '🔍 %150 Büyüt';
        }
        if (el.lightboxTabBadge) {
            el.lightboxTabBadge.textContent = state.visualTab === 'form' ? '📐 Form Şeması' : '🧬 Kas Anatomisi & Odak';
        }
    }

    if (el.lightboxTitle) el.lightboxTitle.textContent = ex.name;
    if (el.lightboxMuscle) el.lightboxMuscle.textContent = `${ex.primary} Odaklı`;

    if (el.lightboxCue) {
        el.lightboxCue.innerHTML = `<strong>💡 Biyomekanik Form Notu:</strong> ${escapeHTML(ex.cue || 'Standart eklem açısı ve form hizalamasına dikkat edin.')}`;
    }

    el.imageLightboxModal.style.display = 'flex';
}

function closeImageLightbox() {
    if (el.imageLightboxModal) el.imageLightboxModal.style.display = 'none';
    if (el.lightboxVideo) {
        try { el.lightboxVideo.pause(); } catch(e) {}
        el.lightboxVideo.src = '';
    }
    if (el.lightboxImg) el.lightboxImg.classList.remove('zoomed');
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

    // 2. Haftalık Planlanan Antrenmanları Biyomekanik Katsayılarla İşle
    const schedule = (typeof getDesktopAthleteSchedule === 'function') ? getDesktopAthleteSchedule() : {};
    const loggedDays = new Set(weekLogs.map(l => {
        let dt = new Date(l.date);
        if (isNaN(dt.getTime()) && typeof l.timestamp === 'number') dt = new Date(l.timestamp);
        return dt.getDay();
    }));
    const todayDay = (new Date()).getDay();
    const getIsoDay = (d) => d === 0 ? 7 : d;
    const todayIso = getIsoDay(todayDay);
    const dayKeys = [1, 2, 3, 4, 5, 6, 0];
    let totalPlannedSessions = 0;

    dayKeys.forEach(dKey => {
        const plan = schedule[dKey];
        if (!plan || plan.isRest || plan.rest) return;

        const planIso = getIsoDay(dKey);
        const isCompleted = loggedDays.has(dKey);
        const isRemaining = bounds.isCurrentWeek ? (!isCompleted && planIso >= todayIso) : (!bounds.isCurrentWeek && weekOffset > 0);

        totalPlannedSessions++;

        const exList = plan.exercises || (plan.customWorkout && plan.customWorkout.exercises) || [];
        if (!Array.isArray(exList)) return;

        exList.forEach(ex => {
            const exName = typeof ex === 'string' ? ex : (ex.name || '');
            if (!exName) return;
            const pSets = typeof ex === 'object' ? (Number(ex.targetSets || ex.sets) || 3) : 3;

            const spec = resolveExerciseBiomechanics(exName, ex.muscle, ex.category);
            if (!spec || spec.type === 'CONDITIONING' || spec.pFactor === 0) return;

            const primId = ACADEMIC_MUSCLE_TO_ID[spec.primary] || spec.primary;
            if (primId && map[primId] && spec.pFactor > 0) {
                const directPlan = pSets * spec.pFactor;
                map[primId].scheduledTotalSets += directPlan;
                if (isRemaining || sourceMode === 'schedule_full') {
                    map[primId].planDirectSets += directPlan;
                    map[primId].plannedExercises.set(`${exName}_${dKey}`, {
                        name: exName,
                        dayIdx: dKey,
                        dayName: DESKTOP_DAY_NAMES_TR[dKey] || `Gün ${dKey}`,
                        sets: directPlan
                    });
                }
            }

            if (spec.sec && typeof spec.sec === 'object') {
                Object.entries(spec.sec).forEach(([secName, secFactor]) => {
                    const secId = ACADEMIC_MUSCLE_TO_ID[secName] || secName;
                    if (secId && map[secId] && secFactor > 0) {
                        const secPlan = pSets * secFactor;
                        map[secId].scheduledSecondarySets += secPlan;
                        if (isRemaining || sourceMode === 'schedule_full') {
                            map[secId].planSecondarySets += secPlan;
                        }
                    }
                });
            }
        });
    });

    // 3. Metrikleri ve Kademeli Hipertrofi Değerlendirmesini Sonuçlandır
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
        const effectiveScheduledTotal = Math.round((data.scheduledTotalSets + data.scheduledSecondarySets) * 10) / 10;

        let evalVolume = effectiveProjected;
        if (sourceMode === 'week_done') evalVolume = effectiveDone;
        if (sourceMode === 'schedule_full') evalVolume = effectiveScheduledTotal;

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
            if (effectiveScheduledTotal > 0 && sourceMode === 'week_done') {
                statusDesc = `Planda ${effectiveScheduledTotal.toFixed(1)} set var ancak henüz seans yapılmadı.`;
            }
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
            scheduledTotalSets: effectiveScheduledTotal,
            status,
            statusBadge,
            statusColor,
            statusBg,
            statusDesc,
            doneExercises: Array.from(data.doneExercises),
            plannedExercises: Array.from(data.plannedExercises.values()),
            contributions: data.contributions || []
        };
    });

    return {
        bounds,
        sourceMode,
        weekOffset,
        totalDoneSessions: weekLogs.length,
        totalPlannedSessions,
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

    // Source buttons
    const sourceButtons = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
            <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:16px; ${sourceMode === 'week_projected' ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="setDesktopWeeklyMuscleSource('week_projected')">
                📅 Bu Hafta: Yapılan + Kalan Plan
            </button>
            <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:16px; ${sourceMode === 'week_done' ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="setDesktopWeeklyMuscleSource('week_done')">
                ✅ Sadece Yapılanlar (${analysis.totalDoneSessions} Seans)
            </button>
            <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:16px; ${sourceMode === 'schedule_full' ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="setDesktopWeeklyMuscleSource('schedule_full')">
                📋 Haftalık Program Şablonu
            </button>
        </div>
    `;

    // Smart Week Banner
    let smartBannerHTML = '';
    const allWorkoutLogs = state.workoutLogs || [];
    if (bounds.isCurrentWeek && analysis.totalDoneSessions === 0 && allWorkoutLogs.length > 0) {
        smartBannerHTML = `
            <div style="background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.3); border-radius:10px; padding:10px 14px; margin-top:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="font-size:12px; color:#bae6fd; display:flex; align-items:center; gap:8px;">
                    <span style="font-size:18px;">💡</span>
                    <span>Bu hafta (<strong>${bounds.label}</strong>) henüz tamamlanmış antrenman kaydı yok; programınızdaki seanslar listelenmektedir.</span>
                </div>
                <button class="btn-outline" style="font-size:11px; padding:5px 12px; border-radius:14px; border-color:var(--gold); color:var(--gold); font-weight:800; background:rgba(0,0,0,0.3); cursor:pointer;" onclick="setDesktopWeeklyMuscleOffset(-1)" title="Geçen haftanın tamamlanan 3 seansını incele">
                    ◀ Geçen Haftayı İncele (5 - 11 Ekim)
                </button>
            </div>
        `;
    }

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
                const planPct = Math.min(100 - donePct, Math.round((m.effectivePlan / maxBar) * 100));
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
                                <div style="width:${planPct}%; background:repeating-linear-gradient(45deg, #f59e0b, #f59e0b 6px, #d97706 6px, #d97706 12px); height:100%; opacity:0.85; transition:width 0.3s ease;" title="Planlanan: ${m.effectivePlan.toFixed(1)} Efektif Set"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:var(--text-secondary); margin-top:4px; flex-wrap:wrap; gap:4px;">
                                <span>
                                    🟢 Yapılan: <strong style="color:#fff;">${m.effectiveDone.toFixed(1)}</strong> set
                                    ${m.effectivePlan > 0 ? ` + 🟡 Planda: <strong style="color:#fcd34d;">${m.effectivePlan.toFixed(1)}</strong> set` : ''}
                                </span>
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
                            ${m.plannedExercises && m.plannedExercises.length > 0 ? `
                                <div style="font-size:11px; margin-top:2px;">
                                    <span style="color:var(--text-secondary);">🟡 Kalan Günlerde Planda:</span>
                                    <span style="color:#fcd34d; font-weight:600;">${m.plannedExercises.map(pe => `${escapeHTML(pe.name)} (${pe.dayName})`).join(', ')}</span>
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
    const days = state.currentAnalyticsPeriodDays !== undefined ? state.currentAnalyticsPeriodDays : 30;
    const now = new Date();
    // Tam gün başlangıcı (gece yarısı) baz alınarak saat farkından ötürü seans kaybı önlenir
    const cutoff = days > 0 ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, 0, 0, 0) : null;

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

            ${smartBannerHTML}
            ${sourceButtons}
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

// ==================== DESKTOP CALENDAR INTEGRATION ====================
function openDesktopCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (modal) modal.style.display = 'flex';
}
window.openDesktopCalendarModal = openDesktopCalendarModal;

function closeDesktopCalendarModal() {
    const modal = document.getElementById('calendarModal');
    if (modal) modal.style.display = 'none';
}
window.closeDesktopCalendarModal = closeDesktopCalendarModal;

async function openGoogleCalendarFromDesktop() {
    const athleteName = state.selectedUser ? (state.selectedUser.name || state.selectedUser.username) : 'Sporcu';
    const schedule = getDesktopAthleteSchedule();
    const activeDays = Object.values(schedule).filter(s => s && !s.isRest);

    if (activeDays.length === 0) {
        alert("Haftada planlanmış aktif antrenman seansı bulunamadı.");
        return;
    }

    const choice = confirm(
        `📅 GOOGLE TAKVİM AKTARIMI (${athleteName})\n\n` +
        `Haftalık ${activeDays.length} seansı Google Takvim'e aktarmak için takvim dosyası (.ics) oluşturulacak ve Google Takvim İçe Aktarma sayfası açılacaktır.\n\n` +
        `• Açılan Google Takvim ekranında oluşturulan dosyayı seçip "İçe Aktar"a bastığınızda tüm haftalık program takviminize işlenir.\n\n` +
        `Devam etmek istiyor musunuz?`
    );

    if (choice) {
        await exportFullWeekToAppleCalendar();
        const url = 'https://calendar.google.com/calendar/u/0/r/settings/export';
        if (window.coachAPI && window.coachAPI.openCalendarUrl) {
            window.coachAPI.openCalendarUrl(url);
        } else {
            window.open(url, '_blank');
        }
    }
    closeDesktopCalendarModal();
}
window.openGoogleCalendarFromDesktop = openGoogleCalendarFromDesktop;

const DESKTOP_DAY_NAMES_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const DESKTOP_MONTH_NAMES_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// Hafta günlerini Pazartesi'den Pazar'a hesapla (İsteğe bağlı referans tarihli)
function getDesktopCurrentWeekDays(anchor = null) {
    const target = anchor ? new Date(anchor) : (state.calendarAnchorDate ? new Date(state.calendarAnchorDate) : new Date());
    const currentDay = target.getDay(); // 0: Pazar, 1: Pzt, ...
    const distToMonday = (currentDay + 6) % 7;
    const monday = new Date(target);
    monday.setDate(target.getDate() - distToMonday);
    monday.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dayOfWeek = d.getDay(); // 1: Pazartesi ... 6: Cumartesi, 0: Pazar
        
        days.push({
            dateObj: d,
            dayIndex: dayOfWeek, // Standart JS gün indeksi (0=Pazar, 1=Pazartesi, ...)
            weekOrder: i,
            dayName: DESKTOP_DAY_NAMES_TR[dayOfWeek],
            dateStr: dateStr,
            formattedDate: d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
            isToday: d.toDateString() === now.toDateString(),
            isPast: d < now
        });
    }
    return days;
}

function getDesktopDateScheduleOverrides(uid) {
    const targetUid = uid || state.selectedUserId || 'default';
    try {
        const raw = localStorage.getItem(`fitlab_desktop_date_schedule_${targetUid}`);
        return raw ? JSON.parse(raw) : {};
    } catch(e) {
        return {};
    }
}

function saveDesktopDateScheduleOverride(dateStr, plan, uid) {
    if (!dateStr) return;
    const targetUid = uid || state.selectedUserId || 'default';
    const overrides = getDesktopDateScheduleOverrides(targetUid);
    if (!plan || plan.id === 'default') {
        delete overrides[dateStr];
    } else {
        overrides[dateStr] = plan;
    }
    try {
        localStorage.setItem(`fitlab_desktop_date_schedule_${targetUid}`, JSON.stringify(overrides));
    } catch(e) {}
}

function getDesktopPlanForDay(dayIndex, dateStr) {
    if (dateStr) {
        const overrides = getDesktopDateScheduleOverrides();
        if (overrides && overrides[dateStr]) {
            return overrides[dateStr];
        }
    }
    const schedule = getDesktopAthleteSchedule();
    return schedule[dayIndex] || { dayIndex: dayIndex, title: 'Dinlenme & Toparlanma', time: '18:30', duration: 30, isRest: true, exercises: [] };
}

function getDesktopCompletedLogForDate(dateStr) {
    const workoutLogs = state.workoutLogs || [];
    return workoutLogs.find(l => {
        if (!l || !l.date) return false;
        let logDateStr = '';
        if (typeof l.date === 'string') {
            logDateStr = l.date.split('T')[0];
        } else if (l.date && l.date.seconds) {
            logDateStr = new Date(l.date.seconds * 1000).toISOString().split('T')[0];
        }
        return logDateStr === dateStr && (
            (l.totalSetsCompleted && l.totalSetsCompleted > 0) || 
            (l.exercises && l.exercises.length > 0) ||
            (l.detailedExercises && l.detailedExercises.length > 0)
        );
    });
}

function getDefaultDesktopAthleteSchedule() {
    return {
        1: { dayIndex: 1, title: '⚔️ Gün 1: Omuz & Bacak Ön Zırhı', time: '18:30', duration: 60, isRest: false, exercises: ['Dambıl Press', 'Goblet Squat', 'Push-up (Şınav)', 'Front Squat', 'Plank'] },
        2: { dayIndex: 2, title: '🧘 Dinlenme & Aktif Toparlanma', time: '18:30', duration: 30, isRest: true, exercises: [] },
        3: { dayIndex: 3, title: '⚔️ Gün 2: Sırt Çekiş & Balistik Güç', time: '18:30', duration: 60, isRest: false, exercises: ['Saw Dumbbell Row', 'Romanian Deadlift (RDL)', 'Kettlebell Swing', 'Pull-up', 'Farmer\'s Walk'] },
        4: { dayIndex: 4, title: '🧘 Dinlenme & Mobilite', time: '18:30', duration: 30, isRest: true, exercises: [] },
        5: { dayIndex: 5, title: '⚔️ Gün 3: Kompleks & Merdiven', time: '18:30', duration: 60, isRest: false, exercises: ['Snatch + Lunge', 'Row + Squat', 'Burpee Finisher', 'Hanging Leg Raise'] },
        6: { dayIndex: 6, title: '🧘 Serbest Kardiyo / Core', time: '11:00', duration: 30, isRest: true, exercises: [] },
        0: { dayIndex: 0, title: '🧘 Tam Dinlenme & Zihinsel Hazırlık', time: '12:00', duration: 30, isRest: true, exercises: [] }
    };
}

// Seçili sporcu için haftalık plan şablonunu al (veya varsayılan yükle)
function getDesktopAthleteSchedule() {
    const uid = state.selectedUserId || 'default';
    const storageKey = `fitlab_desktop_schedule_${uid}`;
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            // Eski 4 günlük ayrık vücut geliştirme şablonunu temizle (Üst Gövde, Zayıf Bölge vb.)
            const rawStr = typeof saved === 'string' ? saved : JSON.stringify(saved);
            const isLegacy = rawStr.includes('Üst Gövde') || rawStr.includes('Zayıf Bölge') || rawStr.includes('Posterior Zincir & Çekiş');
            if (!isLegacy) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const normalized = {};
                    parsed.forEach((item, idx) => {
                        if (!item) return;
                        const dIdx = typeof item.dayIndex === 'number' ? item.dayIndex : idx;
                        normalized[dIdx] = item;
                    });
                    return normalized;
                }
                if (typeof parsed === 'object') {
                    return parsed;
                }
            } else {
                console.log(`[FitLAB] ${uid} için eski ayrık şablon tespit edildi, resmi Çelik Kodu programı yüklendi.`);
            }
        }
    } catch(e) {}

    const def = getDefaultDesktopAthleteSchedule();
    saveDesktopAthleteSchedule(def);
    return def;
}

function saveDesktopAthleteSchedule(schedule) {
    const uid = state.selectedUserId || 'default';
    const storageKey = `fitlab_desktop_schedule_${uid}`;
    try {
        localStorage.setItem(storageKey, JSON.stringify(schedule));
    } catch(e) {}
}

function changeDesktopCalendarTime(dayIndex, newTime) {
    const schedule = getDesktopAthleteSchedule();
    if (schedule[dayIndex]) {
        schedule[dayIndex].time = newTime;
        saveDesktopAthleteSchedule(schedule);
        showToast(`⏰ Saat güncellendi: ${schedule[dayIndex].time}`);
        if (typeof syncDesktopCalendarToCloud === 'function') {
            syncDesktopCalendarToCloud(state.selectedUserId, {
                dayIndex: dayIndex,
                plan: schedule[dayIndex],
                title: 'Saat Güncellendi'
            });
        }
    }
}
window.changeDesktopCalendarTime = changeDesktopCalendarTime;

function changeDesktopCalendarDuration(dayIndex, newDuration) {
    const schedule = getDesktopAthleteSchedule();
    if (schedule[dayIndex]) {
        schedule[dayIndex].duration = parseInt(newDuration, 10) || 60;
        saveDesktopAthleteSchedule(schedule);
        showToast(`⏱️ Süre ayarlandı: ${schedule[dayIndex].duration} dk`);
        if (typeof syncDesktopCalendarToCloud === 'function') {
            syncDesktopCalendarToCloud(state.selectedUserId, {
                dayIndex: dayIndex,
                plan: schedule[dayIndex],
                title: 'Süre Güncellendi'
            });
        }
    }
}
window.changeDesktopCalendarDuration = changeDesktopCalendarDuration;

function toggleDesktopCalendarRest(dayIndex) {
    const schedule = getDesktopAthleteSchedule();
    if (schedule[dayIndex]) {
        schedule[dayIndex].isRest = !schedule[dayIndex].isRest;
        if (!schedule[dayIndex].isRest && (!schedule[dayIndex].exercises || schedule[dayIndex].exercises.length === 0)) {
            schedule[dayIndex].title = 'Fonksiyonel Kuvvet Seansı';
            schedule[dayIndex].exercises = ['Kettlebell Clean', 'Goblet Squat', 'Dumbbell Press'];
        }
        saveDesktopAthleteSchedule(schedule);
        renderDesktopCalendar();
        showToast(schedule[dayIndex].isRest ? '🛌 Gün Dinlenmeye Alındı' : '⚔️ Gün Antrenman Seansı Olarak Atandı');
        if (typeof syncDesktopCalendarToCloud === 'function') {
            syncDesktopCalendarToCloud(state.selectedUserId, {
                dayIndex: dayIndex,
                plan: schedule[dayIndex],
                title: schedule[dayIndex].isRest ? 'Dinlenme' : 'Antrenman Seansı'
            });
        }
    }
}
window.toggleDesktopCalendarRest = toggleDesktopCalendarRest;

// RFC 5545 uyumlu iCal string üretici
function formatIcsDateTime(d) {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function buildIcsEvent(summary, description, startDate, durationMinutes, uidPrefix) {
    const endDate = new Date(startDate.getTime() + (durationMinutes * 60 * 1000));
    const now = new Date();
    const eventUid = `fitlab-${uidPrefix || 'event'}-${startDate.getTime()}@fitlab.kantarci.io`;
    
    const cleanDesc = (description || '').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const cleanSummary = (summary || 'FitLAB Antrenmanı').replace(/,/g, '\\,').replace(/;/g, '\\;');

    return [
        'BEGIN:VEVENT',
        `UID:${eventUid}`,
        `DTSTAMP:${formatIcsDateTime(now)}`,
        `DTSTART:${formatIcsDateTime(startDate)}`,
        `DTEND:${formatIcsDateTime(endDate)}`,
        `SUMMARY:${cleanSummary}`,
        `DESCRIPTION:${cleanDesc}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-PT30M',
        'DESCRIPTION:⚔️ FitLAB Antrenman Vakti! (30 dk kaldı)',
        'END:VALARM',
        'END:VEVENT'
    ].join('\r\n');
}

// Tek günü Apple Takvim'e aktar
async function exportSingleDayToAppleCalendar(dayIndex) {
    const athleteName = state.selectedUser ? (state.selectedUser.name || state.selectedUser.username) : 'Sporcu';
    const weekDays = getDesktopCurrentWeekDays();
    const schedule = getDesktopAthleteSchedule();

    const dayMeta = weekDays.find(w => w.dayIndex === dayIndex) || weekDays[0];
    const plan = schedule[dayIndex];

    if (!dayMeta || !plan) return;
    if (plan.isRest) {
        alert("Bu gün dinlenme günü olarak işaretlenmiş. Takvime eklemek için önce antrenman gününe çevirin.");
        return;
    }

    const [hh, mm] = (plan.time || '18:30').split(':').map(Number);
    const startDate = new Date(dayMeta.dateObj);
    startDate.setHours(hh || 18, mm || 30, 0, 0);

    const desc = `⚔️ ${plan.title}\\n\\nHareketler:\\n${(plan.exercises || []).map((e, i) => `${i + 1}. ${e}`).join('\\n')}\\n\\nAkademik FitLAB İstasyonu tarafından planlandı.`;
    const eventIcs = buildIcsEvent(`⚔️ FitLab: ${plan.title}`, desc, startDate, plan.duration || 60, `single-${dayIndex}`);

    const fullIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FitLAB Desktop//Sports Science Engine//TR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:FitLab • ${athleteName}`,
        'X-WR-TIMEZONE:Europe/Istanbul',
        eventIcs,
        'END:VCALENDAR'
    ].join('\r\n');

    try {
        if (window.coachAPI && window.coachAPI.exportAndOpenCalendar) {
            const res = await window.coachAPI.exportAndOpenCalendar(fullIcs);
            if (res && res.success) {
                showToast(`🍏 ${dayMeta.dayName} seansı macOS Apple Takvimi'ne aktarıldı!`);
            } else {
                alert("Takvim açılamadı: " + (res?.error || 'Bilinmeyen hata'));
            }
        }
    } catch(err) {
        alert("Hata: " + err.message);
    }
}
window.exportSingleDayToAppleCalendar = exportSingleDayToAppleCalendar;

// Tüm haftalık planı Apple Takvim'e aktar
async function exportFullWeekToAppleCalendar() {
    const athleteName = state.selectedUser ? (state.selectedUser.name || state.selectedUser.username) : 'Sporcu';
    const weekDays = getDesktopCurrentWeekDays();
    const schedule = getDesktopAthleteSchedule();

    const activeDays = Object.values(schedule).filter(s => s && !s.isRest);
    if (activeDays.length === 0) {
        alert("Haftada planlanmış aktif antrenman seansı bulunamadı.");
        return;
    }

    const events = [];
    activeDays.forEach(plan => {
        const dayMeta = weekDays.find(w => w.dayIndex === plan.dayIndex);
        if (!dayMeta) return;

        const [hh, mm] = (plan.time || '18:30').split(':').map(Number);
        const startDate = new Date(dayMeta.dateObj);
        startDate.setHours(hh || 18, mm || 30, 0, 0);

        const desc = `⚔️ ${plan.title}\\n\\nHareketler:\\n${(plan.exercises || []).map((e, i) => `${i + 1}. ${e}`).join('\\n')}\\n\\nAkademik FitLAB İstasyonu tarafından planlandı.`;
        events.push(buildIcsEvent(`⚔️ FitLab: ${plan.title}`, desc, startDate, plan.duration || 60, `week-${plan.dayIndex}`));
    });

    const fullIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FitLAB Desktop//Sports Science Engine//TR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:FitLab • ${athleteName}`,
        'X-WR-TIMEZONE:Europe/Istanbul',
        ...events,
        'END:VCALENDAR'
    ].join('\r\n');

    try {
        if (window.coachAPI && window.coachAPI.exportAndOpenCalendar) {
            const res = await window.coachAPI.exportAndOpenCalendar(fullIcs);
            if (res && res.success) {
                showToast(`🍏 ${activeDays.length} seans Apple Takviminize işlendi! macOS Takvimi açılıyor...`);
            } else {
                alert("Takvim açılamadı: " + (res?.error || 'Bilinmeyen hata'));
            }
        }
    } catch(err) {
        alert("Hata: " + err.message);
    }
}
window.exportFullWeekToAppleCalendar = exportFullWeekToAppleCalendar;
window.exportSelectedAthleteToAppleCalendar = exportFullWeekToAppleCalendar;

// AI Reçetesini Takvim Seanslarına Dönüştür & Apple Takvim'e Aktar
async function sendAiPrescriptionToCalendar() {
    if (!state.lastAiReport || !state.lastAiReport.rawReport) {
        alert("Henüz oluşturulmuş bir AI Antrenman Reçetesi bulunmuyor.\n\nLütfen önce Kokpit ekranında Gemini AI motoruna 'Akademik Reçete Oluştur' komutunu verin.");
        return;
    }

    const athleteName = state.selectedUser ? (state.selectedUser.name || state.selectedUser.username) : 'Sporcu';
    const parsedDays = parseMarkdownProgram(state.lastAiReport.rawReport, state.catalog);

    if (!parsedDays || parsedDays.length === 0) {
        alert("AI reçetesinden antrenman günleri ayrıştırılamadı.");
        return;
    }

    const weekDays = getDesktopCurrentWeekDays();
    const targetDays = [1, 3, 5]; // Pazartesi, Çarşamba, Cuma (Official 3-Day split)
    const events = [];
    const schedule = getDesktopAthleteSchedule();

    parsedDays.forEach((pDay, idx) => {
        const targetDayIdx = targetDays[idx % targetDays.length];
        const dayMeta = weekDays.find(w => w.dayIndex === targetDayIdx) || weekDays[0];
        const startDate = new Date(dayMeta.dateObj);
        startDate.setHours(18, 30, 0, 0);

        const exList = (pDay.exercises || []).map((ex, i) => `${i + 1}. ${ex.name} (${ex.targetSets} set x ${ex.targetReps} tekrar)${ex.cue ? ' - ' + ex.cue : ''}`);
        const desc = `🎓 FITLAB AI REÇETESİ: ${pDay.dayTitle}\\n\\n🎯 Seans Egzersizleri:\\n${exList.join('\\n')}\\n\\nÖnemli: Dinlenme sürelerine ve kademeli aşırı yüklenmeye dikkat edin.`;

        events.push(buildIcsEvent(`⚔️ FitLab AI: ${pDay.dayTitle}`, desc, startDate, 60, `ai-presc-${idx}`));

        // Masaüstü haftalık çizelgesini de AI reçetesiyle güncelle
        if (schedule[targetDayIdx]) {
            schedule[targetDayIdx].title = pDay.dayTitle;
            schedule[targetDayIdx].isRest = false;
            schedule[targetDayIdx].exercises = (pDay.exercises || []).map(e => e.name);
        }
    });

    saveDesktopAthleteSchedule(schedule);

    const fullIcs = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FitLAB Desktop//Sports Science Engine//TR',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:FitLab AI • ${athleteName}`,
        'X-WR-TIMEZONE:Europe/Istanbul',
        ...events,
        'END:VCALENDAR'
    ].join('\r\n');

    try {
        if (window.coachAPI && window.coachAPI.exportAndOpenCalendar) {
            const res = await window.coachAPI.exportAndOpenCalendar(fullIcs);
            if (res && res.success) {
                showToast(`🍏 AI Reçetesindeki ${parsedDays.length} seans takviminize işlendi ve Apple Takvim açıldı!`);
                window.coachAPI.showNotification(
                    '📅 Takvim Senkronize Edildi',
                    `${athleteName} için ${parsedDays.length} AI antrenman seansı takvime başarıyla işlendi.`
                );
            } else {
                alert("Takvim dosyası açılamadı: " + (res?.error || 'Bilinmeyen hata'));
            }
        }
    } catch(err) {
        alert("Hata: " + err.message);
    }
}
window.sendAiPrescriptionToCalendar = sendAiPrescriptionToCalendar;

// Haftalık Planı Web Uygulamasına Gönder (Telefonla Eşitle)
async function sendScheduleDirectiveToWeb() {
    if (!state.selectedUserId) {
        alert("Lütfen önce bir sporcu seçin.");
        return;
    }

    const schedule = getDesktopAthleteSchedule();
    const athleteName = state.selectedUser ? state.selectedUser.name : 'Sporcu';

    const activeDays = Object.values(schedule).filter(s => s && !s.isRest);
    const summaryLines = activeDays.map(d => {
        return `• ${DESKTOP_DAY_NAMES_TR[d.dayIndex] || 'Gün'} (${d.time || '18:30'}): ${d.title} [${(d.exercises || []).slice(0, 3).join(', ')}...]`;
    }).join('\n');

    const directive = {
        title: '📅 Haftalık Antrenman & Takvim Planı',
        text: `${athleteName} için haftalık ${activeDays.length} seanslık akademik takvim onaylandı.\n\n${summaryLines}`,
        schedule: schedule,
        dateOverrides: getDesktopDateScheduleOverrides(state.selectedUserId),
        badge: 'Takvim Planı',
        active: true,
        sentAt: new Date().toISOString()
    };

    try {
        const res = await window.coachAPI.sendDirectiveToWeb(state.selectedUserId, directive);
        if (res && res.success) {
            showToast(`🚀 Haftalık plan web uygulamasına gönderildi! ${athleteName} telefonunda görecek.`);
        } else {
            alert("Gönderim hatası: " + (res?.error || 'Bilinmeyen hata'));
        }
    } catch(err) {
        alert("Hata: " + err.message);
    }
}
window.sendScheduleDirectiveToWeb = sendScheduleDirectiveToWeb;

// ==================== FITLAB MASAÜSTÜ AKILLI TAKVİM & PLANLAYICI MOTORU ====================
function setDesktopCalendarViewMode(mode) {
    state.calendarViewMode = mode === 'monthly' ? 'monthly' : 'weekly';
    renderDesktopCalendar();
}
window.setDesktopCalendarViewMode = setDesktopCalendarViewMode;

function navigateDesktopCalendar(dir) {
    if (!state.calendarAnchorDate) state.calendarAnchorDate = new Date();
    const d = new Date(state.calendarAnchorDate);
    if (state.calendarViewMode === 'monthly') {
        d.setMonth(d.getMonth() + dir);
    } else {
        d.setDate(d.getDate() + (dir * 7));
    }
    state.calendarAnchorDate = d;
    renderDesktopCalendar();
}
window.navigateDesktopCalendar = navigateDesktopCalendar;

function jumpDesktopCalendarToToday() {
    state.calendarAnchorDate = new Date();
    renderDesktopCalendar();
}
window.jumpDesktopCalendarToToday = jumpDesktopCalendarToToday;

function openDesktopDayScheduleModal(dayIdx, dateStr = null) {
    state.activeSchedulingDayIdx = dayIdx;
    state.activeSchedulingDateStr = dateStr;
    const modal = document.getElementById('desktopDayScheduleModal');
    const titleEl = document.getElementById('desktopDayModalTitle');
    const subTitleEl = document.getElementById('desktopDayModalSubtitle');
    const bodyEl = document.getElementById('desktopDayModalBody');
    if (!modal || !bodyEl) return;

    const dayName = DESKTOP_DAY_NAMES_TR[dayIdx] || 'Günlük Seans';
    
    let dateFormatted = '';
    if (dateStr) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const mIdx = parseInt(parts[1], 10) - 1;
            dateFormatted = `${parseInt(parts[2], 10)} ${DESKTOP_MONTH_NAMES_TR[mIdx]} ${parts[0]}`;
        }
    }

    if (titleEl) titleEl.innerText = `📅 ${dayName} Günü Program Yönetimi`;
    if (subTitleEl) subTitleEl.innerText = dateFormatted ? `${dateFormatted} • Sporcu: ${state.selectedUser ? (state.selectedUser.name || state.selectedUser.username) : 'Seçili Sporcu'}` : '';

    const currentPlan = getDesktopPlanForDay(dayIdx, dateStr);
    const completedLog = dateStr ? getDesktopCompletedLogForDate(dateStr) : null;

    let completedBanner = '';
    if (completedLog) {
        const exCount = (completedLog.exercises || []).length;
        const setCount = completedLog.totalSetsCompleted || (completedLog.exercises || []).reduce((acc, e) => acc + (e.sets || []).length, 0);
        const vol = completedLog.totalVolumeKg ? `${Math.round(completedLog.totalVolumeKg)} kg` : '-';
        const exNames = (completedLog.exercises || []).map(e => e.name || e.title).filter(Boolean).slice(0, 4).join(', ');

        completedBanner = `
            <div style="background: rgba(16,185,129,0.1); border: 1.5px solid #10b981; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span style="background: #10b981; color: #000; font-size: 10px; font-weight: 900; padding: 2px 7px; border-radius: 4px;">✅ BU GÜN SEANS TAMAMLANDI</span>
                        <div style="font-size: 14px; font-weight: 800; color: #fff; margin-top: 6px;">${escapeHTML(completedLog.program || completedLog.title || 'Kayıtlı Antrenman')}</div>
                        <div style="font-size: 11.5px; color: #a7f3d0; margin-top: 3px;">
                            <strong>Toplam Hacim:</strong> ${vol} • <strong>Set:</strong> ${setCount} Set • <strong>Hareketler:</strong> ${escapeHTML(exNames || 'Belirtilmedi')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // AI Reçetesi Seçenekleri
    let aiOptionsHtml = '';
    if (state.lastAiReport && state.lastAiReport.rawReport) {
        try {
            const parsedDays = parseMarkdownProgram(state.lastAiReport.rawReport, state.catalog);
            if (Array.isArray(parsedDays) && parsedDays.length > 0) {
                aiOptionsHtml = `
                    <div style="margin-top: 16px;">
                        <div style="font-size: 11.5px; font-weight: 900; color: var(--gold); text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                            <span>🧠</span> AI İSTİŞARE ODASI REÇETESİNDEN SEÇ
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${parsedDays.map((pDay, pIdx) => {
                                const exNames = (pDay.exercises || []).map(e => e.name).slice(0, 3).join(', ');
                                const exArrJson = JSON.stringify((pDay.exercises || []).map(e => e.name)).replace(/"/g, '&quot;');
                                return `
                                    <div class="calendar-day-card" style="padding: 10px 14px; cursor: pointer; border: 1px solid rgba(245,158,11,0.3); background: rgba(245,158,11,0.04); display: flex; justify-content: space-between; align-items: center;" onclick="assignDesktopRoutineToActiveDay('${escapeHTML(pDay.dayTitle)}', ${exArrJson}, 60, '${currentPlan.time || '18:30'}')">
                                        <div>
                                            <div style="font-size: 13px; font-weight: 800; color: #fff;">${escapeHTML(pDay.dayTitle)}</div>
                                            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${(pDay.exercises || []).length} Hareket (${escapeHTML(exNames)}...)</div>
                                        </div>
                                        <button type="button" class="btn-sm-action" style="font-size: 11px; padding: 4px 10px; font-weight: 800; color: var(--gold); border-color: var(--gold);">
                                            Bu Güne Ata ➔
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        } catch(e) {}
    }

    bodyEl.innerHTML = `
        ${completedBanner}

        <!-- MEVCUT PLAN BILGISI -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Mevcut Atanmış Plan:</span>
                <span style="font-size: 12px; font-weight: 800; color: ${currentPlan.isRest ? '#94a3b8' : 'var(--gold)'};">
                    ${currentPlan.isRest ? '🛌 Dinlenme Günü' : '⚔️ ' + escapeHTML(currentPlan.title)}
                </span>
            </div>

            ${!currentPlan.isRest ? `
                <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <label style="font-size: 12px; color: var(--text-muted);">Saat:</label>
                        <input type="time" value="${currentPlan.time || '18:30'}" onchange="changeDesktopActiveDayTime(this.value)" style="background: transparent; border: 1px solid var(--border-color); color: #fff; padding: 3px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px;">
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <label style="font-size: 12px; color: var(--text-muted);">Süre:</label>
                        <select onchange="changeDesktopActiveDayDuration(this.value)" style="background: #111; border: 1px solid var(--border-color); color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 12px;">
                            <option value="45" ${currentPlan.duration === 45 ? 'selected' : ''}>45 dk</option>
                            <option value="60" ${(!currentPlan.duration || currentPlan.duration === 60) ? 'selected' : ''}>60 dk</option>
                            <option value="75" ${currentPlan.duration === 75 ? 'selected' : ''}>75 dk</option>
                            <option value="90" ${currentPlan.duration === 90 ? 'selected' : ''}>90 dk</option>
                        </select>
                    </div>
                </div>
                ${(currentPlan.exercises && currentPlan.exercises.length > 0) ? `
                    <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.5; padding: 4px 0;">
                        <strong>Hareketler:</strong> ${currentPlan.exercises.map(e => escapeHTML(e)).join(' • ')}
                    </div>
                ` : ''}
            ` : `
                <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Bu gün dinlenme ve toparlanma olarak belirlenmiştir.</p>
            `}
        </div>

        ${aiOptionsHtml}

        <!-- AKADEMİK VE KLASİK SERİ -->
        <div style="margin-top: 16px;">
            <div style="font-size: 11.5px; font-weight: 900; color: #fff; text-transform: uppercase; margin-bottom: 8px;">
                ⚔️ ÇELİK KODU & FİTLAB AKADEMİK PROGRAMLARI
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div class="calendar-day-card" style="padding: 10px 14px; cursor: pointer; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;" onclick="assignDesktopRoutineToActiveDay('⚔️ Gün 1: Omuz & Bacak Ön Zırhı', ['Dambıl Press', 'Goblet Squat', 'Push-up (Şınav)', 'Front Squat', 'Plank'], 60, '${currentPlan.time || '18:30'}')">
                    <div>
                        <div style="font-size: 13px; font-weight: 800; color: #fff;">Gün 1: Omuz & Bacak Ön Zırhı</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Press + Squat • Şınav + Front Squat • Core</div>
                    </div>
                    <button type="button" class="btn-sm-action" style="font-size: 11px; padding: 4px 10px;">Ata ➔</button>
                </div>

                <div class="calendar-day-card" style="padding: 10px 14px; cursor: pointer; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;" onclick="assignDesktopRoutineToActiveDay('⚔️ Gün 2: Sırt Çekiş & Balistik Güç', ['Saw Dumbbell Row', 'Romanian Deadlift (RDL)', 'Kettlebell Swing', 'Pull-up', 'Farmer\\'s Walk'], 60, '${currentPlan.time || '18:30'}')">
                    <div>
                        <div style="font-size: 13px; font-weight: 800; color: #fff;">Gün 2: Sırt Çekiş & Balistik Güç</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Saw Row + RDL • Swing + Pullup • Taşıma</div>
                    </div>
                    <button type="button" class="btn-sm-action" style="font-size: 11px; padding: 4px 10px;">Ata ➔</button>
                </div>

                <div class="calendar-day-card" style="padding: 10px 14px; cursor: pointer; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;" onclick="assignDesktopRoutineToActiveDay('⚔️ Gün 3: Kompleks & Merdiven', ['Snatch + Lunge', 'Row + Squat', 'Burpee Finisher', 'Hanging Leg Raise'], 60, '${currentPlan.time || '18:30'}')">
                    <div>
                        <div style="font-size: 13px; font-weight: 800; color: #fff;">Gün 3: Kompleks & Merdiven</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Snatch + Lunge • Row + Squat • Burpee Finisher</div>
                    </div>
                    <button type="button" class="btn-sm-action" style="font-size: 11px; padding: 4px 10px;">Ata ➔</button>
                </div>

                <div class="calendar-day-card" style="padding: 10px 14px; cursor: pointer; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;" onclick="assignDesktopRoutineToActiveDay('🔬 Hipertrofi & Zayıf Bölge İzolasyonu', ['Arnold Press', 'Hammer Curl', 'Lateral Raise', 'Triceps Skull Crusher', 'Face Pull'], 50, '${currentPlan.time || '18:30'}')">
                    <div>
                        <div style="font-size: 13px; font-weight: 800; color: #fff;">Hipertrofi & Zayıf Bölge İzolasyonu</div>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Arnold Press • Hammer Curl • Lateral Raise • Triceps</div>
                    </div>
                    <button type="button" class="btn-sm-action" style="font-size: 11px; padding: 4px 10px;">Ata ➔</button>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}
window.openDesktopDayScheduleModal = openDesktopDayScheduleModal;

function closeDesktopDayScheduleModal() {
    const modal = document.getElementById('desktopDayScheduleModal');
    if (modal) modal.style.display = 'none';
    state.activeSchedulingDayIdx = null;
    state.activeSchedulingDateStr = null;
}
window.closeDesktopDayScheduleModal = closeDesktopDayScheduleModal;

// FitLAB Takvim Değişikliklerini Canlı Olarak Buluta ve Web PWA'ya Eşitle
async function syncDesktopCalendarToCloud(uid, changeInfo = {}) {
    const targetUid = uid || state.selectedUserId;
    if (!targetUid) {
        console.warn("syncDesktopCalendarToCloud: targetUid bulunamadı.");
        return;
    }
    if (!window.coachAPI?.sendDirectiveToWeb) {
        console.warn("syncDesktopCalendarToCloud: coachAPI.sendDirectiveToWeb mevcut değil.");
        return;
    }

    const schedule = getDesktopAthleteSchedule();
    const dateOverrides = getDesktopDateScheduleOverrides(targetUid);
    const athleteName = state.selectedUser ? state.selectedUser.name : 'Sporcu';

    const payload = {
        title: changeInfo.title ? `📅 Takvim: ${changeInfo.title}` : '📅 FitLAB Güncel Takvim Planı',
        text: `${athleteName} için FitLAB takvim planı güncellendi.`,
        targetAthlete: athleteName,
        badge: 'Takvim Planı',
        active: true,
        sentAt: new Date().toISOString(),
        calendarUpdate: changeInfo,
        schedule: schedule,
        dateOverrides: dateOverrides
    };

    try {
        const res = await window.coachAPI.sendDirectiveToWeb(targetUid, payload);
        if (res && res.success) {
            console.log("FitLAB takvim değişikliği web'e başarıyla senkronize edildi.");
            if (typeof showToast === 'function') {
                showToast(`☁️ Program buluta ve web uygulamasına eşitlendi!`);
            }
        } else {
            console.warn("FitLAB takvim bulut eşitleme uyarısı:", res?.error);
        }
    } catch(err) {
        console.error("FitLAB takvim eşitleme hatası:", err);
    }
}
window.syncDesktopCalendarToCloud = syncDesktopCalendarToCloud;

function assignDesktopRoutineToActiveDay(title, exercises, duration = 60, time = '18:30') {
    if (state.activeSchedulingDayIdx === null) return;
    const dayIdx = state.activeSchedulingDayIdx;
    const schedule = getDesktopAthleteSchedule();
    const newPlan = {
        dayIndex: dayIdx,
        title: title,
        time: time,
        duration: duration,
        isRest: false,
        exercises: exercises || []
    };
    schedule[dayIdx] = newPlan;
    saveDesktopAthleteSchedule(schedule);

    if (state.activeSchedulingDateStr) {
        saveDesktopDateScheduleOverride(state.activeSchedulingDateStr, newPlan);
    }

    showToast(`✅ "${title}" başarıyla atandı!`);
    closeDesktopDayScheduleModal();
    renderDesktopCalendar();

    // CANLI BULUT KÖPRÜSÜ: Web PWA'ya otomatik eşitle
    syncDesktopCalendarToCloud(state.selectedUserId, {
        dayIndex: dayIdx,
        dateStr: state.activeSchedulingDateStr,
        plan: newPlan,
        title: title
    });
}
window.assignDesktopRoutineToActiveDay = assignDesktopRoutineToActiveDay;

function setDesktopActiveDayRest() {
    if (state.activeSchedulingDayIdx === null) return;
    const dayIdx = state.activeSchedulingDayIdx;
    const schedule = getDesktopAthleteSchedule();
    const restPlan = {
        dayIndex: dayIdx,
        title: 'Aktif Dinlenme & Mobilite',
        time: '18:30',
        duration: 30,
        isRest: true,
        exercises: []
    };
    schedule[dayIdx] = restPlan;
    saveDesktopAthleteSchedule(schedule);

    if (state.activeSchedulingDateStr) {
        saveDesktopDateScheduleOverride(state.activeSchedulingDateStr, restPlan);
    }

    showToast(`🛌 Dinlenme günü olarak ayarlandı.`);
    closeDesktopDayScheduleModal();
    renderDesktopCalendar();

    // CANLI BULUT KÖPRÜSÜ: Web PWA'ya otomatik eşitle
    syncDesktopCalendarToCloud(state.selectedUserId, {
        dayIndex: dayIdx,
        dateStr: state.activeSchedulingDateStr,
        plan: restPlan,
        title: 'Aktif Dinlenme'
    });
}
window.setDesktopActiveDayRest = setDesktopActiveDayRest;

function changeDesktopActiveDayTime(newTime) {
    if (state.activeSchedulingDayIdx === null) return;
    changeDesktopCalendarTime(state.activeSchedulingDayIdx, newTime);
}
window.changeDesktopActiveDayTime = changeDesktopActiveDayTime;

function changeDesktopActiveDayDuration(newDur) {
    if (state.activeSchedulingDayIdx === null) return;
    changeDesktopCalendarDuration(state.activeSchedulingDayIdx, newDur);
}
window.changeDesktopActiveDayDuration = changeDesktopActiveDayDuration;

// Masaüstü Takvim & Planlayıcı Arayüzünü Çiz
function renderDesktopCalendar() {
    if (!el.desktopCalendarContainer) return;

    const athlete = state.selectedUser;
    const athleteName = athlete ? (athlete.name || athlete.username) : 'Sporcu Seçilmedi';
    const schedule = getDesktopAthleteSchedule();
    const activeSessionsCount = Object.values(schedule).filter(s => s && !s.isRest).length;

    const isMonthly = state.calendarViewMode === 'monthly';
    const anchor = new Date(state.calendarAnchorDate || new Date());

    let periodTitle = '';
    if (isMonthly) {
        periodTitle = `🗓️ ${DESKTOP_MONTH_NAMES_TR[anchor.getMonth()]} ${anchor.getFullYear()}`;
    } else {
        const weekDays = getDesktopCurrentWeekDays(anchor);
        const sD = weekDays[0].formattedDate;
        const eD = weekDays[6].formattedDate;
        const yr = weekDays[6].dateObj.getFullYear();
        periodTitle = `📅 ${sD} - ${eD} ${yr}`;
    }

    const mainContentHtml = isMonthly 
        ? renderDesktopCalendarMonthlyGrid(anchor) 
        : renderDesktopCalendarWeeklyCards(anchor);

    el.desktopCalendarContainer.innerHTML = `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 20px 24px; margin-bottom: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h2 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                        <span>📅 FitLAB Canlı Antrenman Takvimi & Planlayıcı</span>
                    </h2>
                    <p style="margin: 0; font-size: 13px; color: var(--text-muted);">
                        Sporcu: <strong style="color:var(--gold);">${athleteName}</strong> • Bu Hafta: <strong style="color:#fff;">${activeSessionsCount} Seans Planlandı</strong> • Canlı Çift Yönlü Takvim Entegrasyonu
                    </p>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <!-- Görünüm Seçici (Haftalık / Aylık) -->
                    <div class="cal-view-pills">
                        <button type="button" class="cal-pill-btn ${!isMonthly ? 'active' : ''}" onclick="setDesktopCalendarViewMode('weekly')">
                            📅 Haftalık
                        </button>
                        <button type="button" class="cal-pill-btn ${isMonthly ? 'active' : ''}" onclick="setDesktopCalendarViewMode('monthly')">
                            🗓️ Aylık
                        </button>
                    </div>

                    <!-- Gezinme Butonları (Önceki / Bugün / Sonraki) -->
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <button type="button" class="cal-nav-btn" onclick="navigateDesktopCalendar(-1)" title="Önceki Dönem">◀</button>
                        <button type="button" class="cal-nav-btn cal-nav-today-btn" onclick="jumpDesktopCalendarToToday()" title="Bugüne Dön">Bugün</button>
                        <button type="button" class="cal-nav-btn" onclick="navigateDesktopCalendar(1)" title="Sonraki Dönem">▶</button>
                    </div>

                    <div style="height: 24px; width: 1px; background: var(--border-color); margin: 0 4px;"></div>

                    <button type="button" class="btn-action" onclick="exportFullWeekToAppleCalendar()" style="background: linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.35)); border: 1px solid #10b981; color: #fff; font-size: 12px; padding: 7px 12px; border-radius: 8px; font-weight: 700;">
                        🍏 macOS Takvimi'ne İşle
                    </button>
                    <button type="button" class="btn-action" onclick="openGoogleCalendarFromDesktop()" style="background: rgba(56,189,248,0.15); border: 1px solid #38bdf8; color: #38bdf8; font-size: 12px; padding: 7px 12px; border-radius: 8px; font-weight: 700;">
                        🌐 Google Takvim
                    </button>
                    <button type="button" class="btn-action" onclick="sendScheduleDirectiveToWeb()" style="background: rgba(245,158,11,0.15); border: 1px solid var(--gold); color: var(--gold); font-size: 12px; padding: 7px 12px; border-radius: 8px; font-weight: 700;" title="Mobil web uygulamasına direktif olarak gönder">
                        📲 Web PWA'ya Gönder
                    </button>
                    <button type="button" class="btn-refresh" onclick="refreshAthleteData().then(() => renderDesktopCalendar())" title="Yenile" style="width: 34px; height: 34px;">
                        🔄
                    </button>
                </div>
            </div>

            <!-- Dönem Başlığı -->
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 15px; font-weight: 900; color: var(--gold);">
                ${periodTitle}
            </div>
        </div>

        <!-- ANA TAKVİM İÇERİĞİ (HAFTALIK VEYA AYLIK) -->
        ${mainContentHtml}

        <!-- Takvim Entegrasyonu ve Senkronizasyon Bilgi Paneli -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px;">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #fff; display: flex; align-items: center; gap: 6px;">
                    <span>🍏 macOS Apple Takvim Köprüsü</span>
                </h4>
                <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.6; margin: 0 0 10px 0;">
                    Yukarıdaki "macOS Takvimi'ne İşle" butonuna tıkladığınızda, oluşturulan akademik seanslar doğrudan Mac'inizin yerel takvimine (iCal / Calendar.app) 30 dakikalık hatırlatıcı alarmlarla işlenir. Giriş veya şifre gerektirmez.
                </p>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-sm-action" onclick="openDesktopCalendarModal()" style="font-size: 11.5px; padding: 6px 12px;">
                        ⚙️ Takvim Ayarları & Hızlı Dışa Aktar
                    </button>
                </div>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 12px; padding: 18px;">
                <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #fff; display: flex; align-items: center; gap: 6px;">
                    <span>🌐 Google Takvim & Mobil Canlı Senkronizasyon</span>
                </h4>
                <p style="font-size: 12.5px; color: var(--text-muted); line-height: 1.6; margin: 0 0 10px 0;">
                    Web PWA (fitness.kantarci.io) üzerinde Google Takvim entegrasyonu mevcuttur. FitLAB üzerinden "Web PWA'ya Gönder" dendiğinde seanslar anında sporcunun takvimine işlenir.
                </p>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-sm-action" onclick="openGoogleCalendarFromDesktop()" style="font-size: 11.5px; padding: 6px 12px; color: #38bdf8; border-color: rgba(56,189,248,0.4);">
                        🌐 calendar.google.com
                    </button>
                </div>
            </div>
        </div>
    `;
}
window.renderDesktopCalendar = renderDesktopCalendar;

function renderDesktopCalendarWeeklyCards(anchor) {
    const weekDays = getDesktopCurrentWeekDays(anchor);

    const cardsHtml = weekDays.map((day) => {
        const idx = day.dayIndex;
        const plan = getDesktopPlanForDay(idx, day.dateStr);
        const completedLog = getDesktopCompletedLogForDate(day.dateStr);

        const isTodayBadge = day.isToday ? '<span style="background:var(--gold); color:#000; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; margin-left:6px;">BUGÜN</span>' : '';

        if (completedLog) {
            const exCount = (completedLog.exercises || []).length;
            const setCount = completedLog.totalSetsCompleted || (completedLog.exercises || []).reduce((acc, e) => acc + (e.sets || []).length, 0);
            const vol = completedLog.totalVolumeKg ? `${Math.round(completedLog.totalVolumeKg)} kg` : '-';
            const exNames = (completedLog.exercises || []).map(e => e.name || e.title).filter(Boolean).slice(0, 3).join(', ');

            return `
                <div class="calendar-day-card completed" onclick="openDesktopDayScheduleModal(${idx}, '${day.dateStr}')">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 13px; font-weight: 800; color: #fff;">${day.dayName} ${isTodayBadge}</span>
                            <span style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">${day.formattedDate}</span>
                        </div>
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(16,185,129,0.2); color: #10b981; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; margin-bottom: 8px;">
                            ✅ Tamamlandı (${setCount} Set)
                        </div>
                        <div style="font-size: 11.5px; color: #e2e8f0; line-height: 1.35; margin-bottom: 6px;">
                            <strong>Hacim:</strong> ${vol} • <strong>Hareketler:</strong> ${escapeHTML(exNames || 'Kayıtlı Seans')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 4px; margin-top: 10px;">
                        <button type="button" class="btn-sm-action" style="flex: 1; font-size: 10.5px; text-align: center; padding: 5px 0; color: var(--cyan); border-color: rgba(56,189,248,0.4);" onclick="event.stopPropagation(); openDesktopDayScheduleModal(${idx}, '${day.dateStr}')">
                            👁️ Program Yönetimi
                        </button>
                    </div>
                </div>
            `;
        }

        if (plan.isRest) {
            return `
                <div class="calendar-day-card rest" onclick="openDesktopDayScheduleModal(${idx}, '${day.dateStr}')">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 13px; font-weight: 800; color: var(--text-muted);">${day.dayName} ${isTodayBadge}</span>
                            <span style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">${day.formattedDate}</span>
                        </div>
                        <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(148,163,184,0.1); color: #94a3b8; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; margin-bottom: 8px;">
                            🧘 Dinlenme & Toparlanma
                        </div>
                        <p style="font-size: 11px; color: var(--text-muted); margin: 0; line-height: 1.35;">
                            Merkezi sinir sistemi ve kas toparlanması için aktif dinlenme.
                        </p>
                    </div>
                    <div style="margin-top: 10px;">
                        <button type="button" class="btn-sm-action" style="width: 100%; font-size: 10.5px; text-align: center; padding: 5px 0; border-color: rgba(245,158,11,0.4);" onclick="event.stopPropagation(); openDesktopDayScheduleModal(${idx}, '${day.dateStr}')">
                            ➕ Antrenman Ata
                        </button>
                    </div>
                </div>
            `;
        }

        // Aktif Planlanan Gün
        const exListStr = (plan.exercises || []).map((e, i) => `<div style="font-size: 11px; color: #cbd5e1; padding: 1px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">• ${escapeHTML(e)}</div>`).join('');

        return `
            <div class="calendar-day-card active-plan" onclick="openDesktopDayScheduleModal(${idx}, '${day.dateStr}')">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 800; color: #fff;">${day.dayName} ${isTodayBadge}</span>
                        <span style="font-size: 10.5px; color: var(--gold); font-family: var(--font-mono);">${day.formattedDate}</span>
                    </div>
                    <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(245,158,11,0.15); color: var(--gold); padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">
                        ⚔️ ${escapeHTML(plan.title)}
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 8px; background: rgba(0,0,0,0.3); padding: 4px 6px; border-radius: 6px;" onclick="event.stopPropagation()">
                        <div style="display: flex; align-items: center; gap: 3px;">
                            <label style="font-size: 10px; color: var(--text-muted);">Saat:</label>
                            <input type="time" value="${plan.time || '18:30'}" onchange="changeDesktopCalendarTime(${idx}, this.value)" style="background: transparent; border: 1px solid var(--border-color); color: #fff; padding: 1px 3px; border-radius: 4px; font-family: var(--font-mono); font-size: 10.5px; width: 62px;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 3px;">
                            <select onchange="changeDesktopCalendarDuration(${idx}, this.value)" style="background: #111; border: 1px solid var(--border-color); color: #fff; padding: 1px 2px; border-radius: 4px; font-size: 10.5px;">
                                <option value="45" ${plan.duration === 45 ? 'selected' : ''}>45 dk</option>
                                <option value="60" ${(!plan.duration || plan.duration === 60) ? 'selected' : ''}>60 dk</option>
                                <option value="75" ${plan.duration === 75 ? 'selected' : ''}>75 dk</option>
                                <option value="90" ${plan.duration === 90 ? 'selected' : ''}>90 dk</option>
                            </select>
                        </div>
                    </div>

                    <div style="margin-bottom: 8px; max-height: 85px; overflow-y: auto;">
                        ${exListStr || '<span style="font-size: 10.5px; color: var(--text-muted);">Özel Egzersiz Listesi</span>'}
                    </div>
                </div>

                <div style="display: flex; gap: 4px; margin-top: 8px;" onclick="event.stopPropagation()">
                    <button type="button" class="btn-sm-action" style="flex: 1; font-size: 10.5px; text-align: center; padding: 5px 0; color: var(--gold); border-color: rgba(245,158,11,0.4);" onclick="openDesktopDayScheduleModal(${idx}, '${day.dateStr}')">
                        ✏️ Ata
                    </button>
                    <button type="button" class="btn-sm-action" style="font-size: 10.5px; padding: 5px 8px; color: #94a3b8;" onclick="toggleDesktopCalendarRest(${idx})" title="Dinlenme gününe çevir">
                        🧘
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="cal-week-grid">
            ${cardsHtml}
        </div>
    `;
}

function renderDesktopCalendarMonthlyGrid(anchor) {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday-first offset
    const firstDayOfWeek = firstDay.getDay(); // 0 is Sun
    const startOffset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let html = `
        <div class="cal-month-table">
            <div class="cal-month-header-row">
                <div>Pzt</div>
                <div>Sal</div>
                <div>Çar</div>
                <div>Per</div>
                <div>Cum</div>
                <div>Cmt</div>
                <div>Paz</div>
            </div>
            <div class="cal-month-days-grid">
    `;

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let p = startOffset - 1; p >= 0; p--) {
        const dayNum = prevMonthLastDay - p;
        html += `
            <div class="cal-month-cell is-other-month">
                <div class="cal-month-cell-header">
                    <span>${dayNum}</span>
                </div>
            </div>
        `;
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const dayDate = new Date(year, month, d);
        dayDate.setHours(0, 0, 0, 0);
        const yyyy = dayDate.getFullYear();
        const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(dayDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const dayIdx = dayDate.getDay(); // 0: Pazar, 1: Pzt, ..., 6: Cmt (Standart JS)
        const isToday = dayDate.toDateString() === now.toDateString();

        const completedLog = getDesktopCompletedLogForDate(dateStr);
        const plan = getDesktopPlanForDay(dayIdx, dateStr);

        let pillHtml = '';
        if (completedLog) {
            const vol = completedLog.totalVolumeKg ? `${Math.round(completedLog.totalVolumeKg)} kg` : 'Seans';
            pillHtml = `<div class="cal-tag-pill completed" title="${escapeHTML(completedLog.program || 'Tamamlandı')}">✅ ${vol}</div>`;
        } else if (!plan.isRest) {
            const cleanTitle = (plan.title || 'Plan').replace(/⚔️/g, '').trim().slice(0, 12);
            pillHtml = `<div class="cal-tag-pill scheduled" title="${escapeHTML(plan.title)}">⚔️ ${escapeHTML(cleanTitle)}</div>`;
        } else {
            pillHtml = `<div class="cal-tag-pill rest">🛌 Dinlenme</div>`;
        }

        html += `
            <div class="cal-month-cell ${isToday ? 'is-today' : ''}" onclick="openDesktopDayScheduleModal(${dayIdx}, '${dateStr}')">
                <div class="cal-month-cell-header">
                    <span style="${isToday ? 'font-weight:900; color:var(--gold);' : ''}">${d}</span>
                    ${isToday ? '<span style="font-size:9px; color:var(--gold); font-weight:900;">BUGÜN</span>' : ''}
                </div>
                ${pillHtml}
            </div>
        `;
    }

    // Trailing padding days
    const totalCells = startOffset + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let n = 1; n <= remainingCells; n++) {
        html += `
            <div class="cal-month-cell is-other-month">
                <div class="cal-month-cell-header">
                    <span>${n}</span>
                </div>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}





