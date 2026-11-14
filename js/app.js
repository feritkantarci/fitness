// ==================== ORKESTRA ŞEFİ & 7 BAĞIMSIZ ODA KAYIT HARİTASI (tab-orchestra) ====================
window.CELIK_CHIEF_ROOMS = Object.freeze({
    "generator-guard": "js/chiefs/generator-chief.js",
    "workout-guard": "js/chiefs/workout-chief.js",
    "library-guard": "js/chiefs/library-chief.js",
    "history-guard": "js/chiefs/history-chief.js",
    "analytics-guard": "js/chiefs/analytics-chief.js",
    "profile-guard": "js/chiefs/profile-chief.js",
    "garmin-tredict-guard": "js/garmin-tredict-bridge.js",
    "bridge-customs": "js/chiefs/bridge-customs.js",
    "liaison-subchiefs": "js/chiefs/liaison-subchiefs.js",
    "shared-core": "js/chiefs/shared-core.js"
});
        // RESUME / VISIBILITY LISTENERS
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                updateWorkoutTimerDisplay();
                updateTimerDisplay();
            }
        });
        window.addEventListener('pageshow', () => {
            updateWorkoutTimerDisplay();
            updateTimerDisplay();
        });

        // PWA SERVICE WORKER & FORCE CACHE CLEAR
        async function forceAppUpdate() {
            try {
                if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(k => caches.delete(k)));
                }
                if ('serviceWorker' in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    for (const r of regs) await r.unregister();
                }
            } catch(e) {}
            window.location.href = window.location.origin + window.location.pathname + '?v=' + Date.now();
        }

        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker) {
                window.addEventListener('load', () => {
                    try {
                        navigator.serviceWorker.register('./sw.js?v=292')
                            .then(reg => {
                                console.log('SW scope:', reg.scope);
                                if (reg.update) reg.update();
                            })
                            .catch(err => console.log('SW err:', err));
                    } catch (e) {}
                });

                // Yeni SW devraldığında sayfayı yenileyerek güncel içeriği yükle
                let refreshing = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (!refreshing) {
                        refreshing = true;
                        window.location.reload();
                    }
                });
            }
        } catch (e) {}

        // INITIALIZE APPLICATION
        window.addEventListener('DOMContentLoaded', () => {
            ensureBilingualExerciseNames();
            initAuthDatabase();
            initFirebaseEngine();
            hydrateLocalSnapshotIfDev();
            syncAppViewState();
            const session = getSession();
            if (session) {
                // Kullanıcı talebi: Takvimi sıfırla ve izinsiz otomatik program atamalarını temizle
                if (!localStorage.getItem('celik_kodu_calendar_zeroed_v4')) {
                    purgeAllUnrequestedSchedules();
                    localStorage.setItem('celik_kodu_calendar_zeroed_v4', 'true');
                }
                applyWednesdayHammerCurlPatch();
                updateProfileGeminiStatusUI();
                renderAiHybridHeroBanner();
                updateSelectedSplitLabel();
                renderSplitCards();
                updateSelectedEquipLabel();
                updateSelectedParamLabel();
                refreshTopFitnessCardioScoreBars();
                const hasRestored = restoreActiveWorkoutStateFromStorage();
                if (hasRestored) {
                    switchTab('activeWorkoutTab');
                } else {
                    renderActiveWorkout();
                }
            }
        });
    

