// ==================== BAĞLANTI ALT ŞEFLERİ & 3 KATMANLI ARIZA DUVARI (LIAISON SUB-CHIEFS) ====================
// Her ana şefin altında iç/dış alıcıları tanıyan, hata çıkaracak veriyi alıcıya gitmeden düzeltip
// ekranda bildiren 7 Bağlantı Alt Şefi, Tek Yönlü Döngü Kilidi ve Kutu Bazlı Arıza Duvarı.
(function initCelikLiaisonSubChiefs(globalScope) {
    const activeDispatchLocks = new Set();
    const auditNotices = [];
    let loopBlockedCount = 0;
    let totalFixesCount = 0;
    let totalQuarantinedCount = 0;
    let toastHideTimer = null;

    function resolveCanonicalActiveUid() {
        try {
            if (typeof globalScope.getActiveUserId === 'function') {
                const u = globalScope.getActiveUserId();
                if (u) return String(u);
            }
        } catch (e) {}
        try {
            const rawSess = localStorage.getItem('celik_kodu_session');
            if (rawSess) {
                const s = JSON.parse(rawSess);
                if (s && s.userId) return String(s.userId);
            }
        } catch (e) {}
        try {
            const aid = localStorage.getItem('celik_kodu_active_user_id');
            if (aid) return String(aid);
        } catch (e) {}
        return 'default';
    }

    function renderNoticeBanner(text) {
        if (typeof document === 'undefined' || !document.body) return;
        let bar = document.getElementById('celikSubChiefToast');
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'celikSubChiefToast';
            bar.setAttribute('role', 'status');
            bar.setAttribute('aria-live', 'polite');
            bar.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;background:#0F172A;color:#FFFFFF;border:1px solid #334155;padding:10px 16px;border-radius:12px;font-size:12.5px;font-weight:700;box-shadow:0 8px 24px rgba(15,23,42,0.28);max-width:92vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity 0.2s ease;';
            document.body.appendChild(bar);
        }
        bar.textContent = text;
        bar.style.opacity = '1';
        bar.style.display = 'block';
        bar.dataset.visible = 'true';
        if (toastHideTimer) clearTimeout(toastHideTimer);
        toastHideTimer = setTimeout(() => {
            try {
                bar.style.opacity = '0';
                bar.dataset.visible = 'false';
                setTimeout(() => { if (bar.dataset.visible === 'false') bar.style.display = 'none'; }, 220);
            } catch (e) {}
        }, 4500);
    }

    function pushUserNotice(subChiefTitle, receiverLabel, actionSummary) {
        const item = {
            id: 'ntc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            subChief: subChiefTitle,
            receiver: receiverLabel,
            message: `${subChiefTitle}: ${actionSummary} (${receiverLabel} korundu)`,
            at: Date.now()
        };
        auditNotices.unshift(item);
        if (auditNotices.length > 40) auditNotices.length = 40;
        renderNoticeBanner(item.message);
        return item;
    }

    // Tek Yönlü Döngü Kilidi: A -> B -> A sonsuz tetiklenmesini anında keser
    function withLoopGuard(channelKey, fn) {
        if (activeDispatchLocks.has(channelKey)) {
            loopBlockedCount++;
            return { blockedByLoopGuard: true };
        }
        activeDispatchLocks.add(channelKey);
        try {
            return fn();
        } finally {
            activeDispatchLocks.delete(channelKey);
        }
    }

    // 3 Katmanlı Çalışma Anı Arıza Duvarı (Kutu Bazlı Karantina)
    function runWithFaultWall(zoneName, containerEl, renderFn, fallbackSummary) {
        const prevHtml = containerEl ? containerEl.innerHTML : '';
        try {
            return { ok: true, value: renderFn() };
        } catch (err) {
            totalQuarantinedCount++;
            if (containerEl) {
                containerEl.innerHTML = prevHtml || (
                    '<div data-quarantined="true" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;padding:12px;border-radius:12px;font-size:12.5px;font-weight:700;">' +
                    String(zoneName || 'Bölüm') + ' geçici koruma moduna alındı • ' + String(fallbackSummary || 'Diğer bölümler çalışmaya devam ediyor') +
                    '</div>'
                );
            }
            pushUserNotice('Arıza Duvarı', zoneName || 'Ekran Kutusu', 'Hatalı kutu karantinaya alındı');
            return { ok: false, quarantined: true, error: String((err && err.message) || err) };
        }
    }

    function getCatalogList() {
        if (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) return EXERCISES_DB;
        if (Array.isArray(globalScope.EXERCISES_DB)) return globalScope.EXERCISES_DB;
        return [];
    }

    // 1) ÜRETİCİ BAĞLANTI ALT ŞEFİ -> Alıcılar: [Antrenman, Takvim, Analiz]
    function inspectGeneratedWorkoutForReceivers(workout) {
        return withLoopGuard('generator->receivers', () => {
            if (!workout || typeof workout !== 'object' || !Array.isArray(workout.exercises)) return workout;
            let fixes = 0;
            const db = getCatalogList();
            const isExcluded = (id) => typeof globalScope.isExerciseExcludedByUser === 'function' && globalScope.isExerciseExcludedByUser(id);

            workout.exercises = workout.exercises.map(ex => {
                if (!ex || typeof ex !== 'object') return ex;
                let cur = ex;
                if (cur.id && isExcluded(cur.id)) {
                    const repl = db.find(e => e.id !== cur.id && !isExcluded(e.id) && e.category === cur.category)
                        || db.find(e => e.id !== cur.id && !isExcluded(e.id));
                    if (repl) {
                        cur = Object.assign({}, repl, { targetSets: cur.targetSets || 3, targetReps: cur.targetReps || '8-12' });
                        fixes++;
                    }
                }
                const mode = typeof globalScope.getExerciseMetricMode === 'function' ? globalScope.getExerciseMetricMode(cur) : 'reps';
                if (mode === 'time_sec') {
                    const parsedSec = parseInt(String(cur.targetReps || '').replace(/[^0-9]/g, ''), 10);
                    if (!parsedSec || parsedSec < 15) {
                        cur = Object.assign({}, cur, { isTimeBased: true, targetReps: '30-45 sn' });
                        fixes++;
                    }
                } else if (mode === 'cardio_min') {
                    if (!cur.isCardioMinutes) {
                        cur = Object.assign({}, cur, { isCardioMinutes: true, targetSets: 1 });
                        fixes++;
                    }
                }
                return cur;
            });

            if (fixes > 0) {
                totalFixesCount += fixes;
                pushUserNotice('Üretici Alt Şefi', 'Antrenman ve Analiz', `${fixes} gizli/birim uyumsuzluğu düzeltildi`);
            }
            return workout;
        });
    }

    // 2) ANTRENMAN BAĞLANTI ALT ŞEFİ -> İç Alıcı: [Ağırlık Hafızası], Dış Alıcılar: [Geçmiş, Analiz]
    function inspectOutgoingCompletedSession(sessionLog) {
        return withLoopGuard('workout->history_analytics', () => {
            if (!sessionLog || typeof sessionLog !== 'object' || !Array.isArray(sessionLog.exercises)) return sessionLog;
            let fixes = 0;
            let cleanTotalReps = 0;
            let cleanTotalVol = 0;

            for (const ex of sessionLog.exercises) {
                if (!ex || typeof ex !== 'object') continue;
                const mode = typeof globalScope.getExerciseMetricMode === 'function' ? globalScope.getExerciseMetricMode(ex) : 'reps';
                if (mode === 'cardio_min') {
                    if (!ex.isCardioMinutes) { ex.isCardioMinutes = true; fixes++; }
                    for (const s of (ex.sets || [])) {
                        if (Number(s.weight) > 0) { s.weight = 0; fixes++; }
                    }
                    ex.maxWeight = 0;
                    ex.exerciseVolume = 0;
                } else if (mode === 'time_sec') {
                    if (!ex.isTimeBased) { ex.isTimeBased = true; fixes++; }
                    for (const s of (ex.sets || [])) {
                        if (s.completed) {
                            const vol = typeof globalScope.calculateExerciseSetVolume === 'function'
                                ? globalScope.calculateExerciseSetVolume(ex, s.weight, s.reps)
                                : 0;
                            cleanTotalVol += vol;
                        }
                    }
                } else {
                    for (const s of (ex.sets || [])) {
                        if (s.completed) {
                            cleanTotalReps += Number(s.reps) || 0;
                            const vol = typeof globalScope.calculateExerciseSetVolume === 'function'
                                ? globalScope.calculateExerciseSetVolume(ex, s.weight, s.reps)
                                : (Number(s.weight) || 0) * (Number(s.reps) || 0);
                            cleanTotalVol += vol;
                        }
                    }
                }
            }

            if (sessionLog.totalRepsCompleted !== undefined && sessionLog.totalRepsCompleted !== cleanTotalReps) {
                sessionLog.totalRepsCompleted = cleanTotalReps;
                fixes++;
            }
            if (sessionLog.totalVolumeKg !== undefined && Math.round(Number(sessionLog.totalVolumeKg) || 0) !== Math.round(cleanTotalVol)) {
                sessionLog.totalVolumeKg = Math.round(cleanTotalVol * 10) / 10;
                fixes++;
            }

            if (fixes > 0) {
                totalFixesCount += fixes;
                pushUserNotice('Antrenman Alt Şefi', 'Ağırlık Hafızası, Geçmiş ve Analiz', `${fixes} alıcı uyumsuzluğu düzeltildi`);
            }
            return sessionLog;
        });
    }

    // 3) KÜTÜPHANE BAĞLANTI ALT ŞEFİ -> Alıcılar: [Üretici Taslağı, Haftalık/Günlük Takvim]
    function inspectLibraryExclusionChange(excludedId) {
        return withLoopGuard('library->receivers:' + excludedId, () => {
            if (!excludedId) return { fixedDraft: 0, fixedSchedule: 0 };
            let fixedDraft = 0;
            let fixedSchedule = 0;
            const db = getCatalogList();
            const isExcluded = (id) => id === excludedId || (typeof globalScope.isExerciseExcludedByUser === 'function' && globalScope.isExerciseExcludedByUser(id));
            const targetEx = db.find(e => e.id === excludedId);
            const replacement = db.find(e => !isExcluded(e.id) && targetEx && e.category === targetEx.category)
                || db.find(e => !isExcluded(e.id));

            if (globalScope.currentGeneratedWorkout && Array.isArray(globalScope.currentGeneratedWorkout.exercises) && replacement) {
                globalScope.currentGeneratedWorkout.exercises = globalScope.currentGeneratedWorkout.exercises.map(ex => {
                    if (ex && ex.id === excludedId) {
                        fixedDraft++;
                        return Object.assign({}, replacement, { targetSets: ex.targetSets || 3, targetReps: ex.targetReps || '8-12' });
                    }
                    return ex;
                });
            }

            const uid = resolveCanonicalActiveUid();
            if (typeof globalScope.getWeeklySchedule === 'function' && typeof globalScope.saveWeeklySchedule === 'function' && replacement) {
                const sched = globalScope.getWeeklySchedule(uid);
                let schedChanged = false;
                for (const d of Object.keys(sched || {})) {
                    const dayPlan = sched[d];
                    if (dayPlan && Array.isArray(dayPlan.exercises)) {
                        dayPlan.exercises = dayPlan.exercises.map(ex => {
                            const exId = typeof ex === 'string' ? ex : ex?.id;
                            if (exId === excludedId) {
                                fixedSchedule++;
                                schedChanged = true;
                                return typeof ex === 'string' ? replacement.id : Object.assign({}, replacement);
                            }
                            return ex;
                        });
                    }
                }
                if (schedChanged) globalScope.saveWeeklySchedule(sched, uid);
            }

            if (fixedDraft > 0 || fixedSchedule > 0) {
                totalFixesCount += (fixedDraft + fixedSchedule);
                pushUserNotice(
                    'Kütüphane Alt Şefi',
                    'Üretici ve Takvim',
                    `Gizlenen hareket ${fixedDraft + fixedSchedule} aktif planda değiştirildi`
                );
            }
            return { fixedDraft, fixedSchedule, replacementId: replacement ? replacement.id : null };
        });
    }

    // 4) GEÇMİŞ BAĞLANTI ALT ŞEFİ -> Alıcılar: [Analiz, Ağırlık Hafızası]
    function inspectHistoryMutationForReceivers(logs) {
        return withLoopGuard('history->analytics_memory', () => {
            if (!Array.isArray(logs)) return [];
            let fixes = 0;
            const out = logs.map(log => {
                if (!log || typeof log !== 'object' || !Array.isArray(log.exercises)) return log;
                const prevVol = Number(log.totalVolumeKg);
                const prevReps = log.totalRepsCompleted;
                let cleanVol = 0;
                let cleanReps = 0;
                for (const ex of log.exercises) {
                    const mode = typeof globalScope.getExerciseMetricMode === 'function' ? globalScope.getExerciseMetricMode(ex) : 'reps';
                    if (mode === 'cardio_min') {
                        for (const s of (ex.sets || [])) {
                            if (Number(s.weight) > 0) { s.weight = 0; fixes++; }
                        }
                    } else if (mode === 'time_sec') {
                        for (const s of (ex.sets || [])) {
                            if (s.completed && typeof globalScope.calculateExerciseSetVolume === 'function') {
                                cleanVol += globalScope.calculateExerciseSetVolume(ex, s.weight, s.reps);
                            }
                        }
                    } else {
                        for (const s of (ex.sets || [])) {
                            if (s.completed) {
                                cleanReps += Number(s.reps) || 0;
                                cleanVol += typeof globalScope.calculateExerciseSetVolume === 'function'
                                    ? globalScope.calculateExerciseSetVolume(ex, s.weight, s.reps)
                                    : (Number(s.weight) || 0) * (Number(s.reps) || 0);
                            }
                        }
                    }
                }
                if (prevReps !== undefined && prevReps !== cleanReps) {
                    log.totalRepsCompleted = cleanReps;
                    fixes++;
                }
                if (!isNaN(prevVol) && Math.round(prevVol) !== Math.round(cleanVol)) {
                    log.totalVolumeKg = Math.round(cleanVol * 10) / 10;
                    fixes++;
                }
                return log;
            });

            if (fixes > 0) {
                totalFixesCount += fixes;
                pushUserNotice('Geçmiş Alt Şefi', 'Analiz ve Ağırlık Hafızası', `${fixes} geçmiş kayıt birimi düzeltildi`);
            }
            return out;
        });
    }

    // 5) ANALİZ İÇ BAĞLANTI ALT ŞEFİ -> İç Alıcılar: [Koç Özeti, Vücut Ağırlığı Tonajı]
    function inspectScaleInputForReceivers(rawEntry) {
        return withLoopGuard('analytics.scale->internal_receivers', () => {
            if (!rawEntry || typeof rawEntry !== 'object') return null;
            let w = rawEntry.weight;
            let repairedText = false;
            if (typeof w === 'string') {
                const parsed = parseFloat(w.replace(',', '.').replace(/[^0-9.]/g, ''));
                if (!isNaN(parsed)) {
                    w = parsed;
                    repairedText = true;
                }
            }
            if (typeof w !== 'number' || isNaN(w) || w < 25 || w > 300) {
                totalFixesCount++;
                pushUserNotice('Analiz Alt Şefi', 'Koç Özeti ve Vücut Tonajı', `Hatalı tartı verisi (${rawEntry.weight}) engellendi`);
                // Sayısal aralık dışı veriyi Köprü Gümrüğü'nün de reddedip sayaç işlemesi için null yerine ham geçersiz değeri bırak
                return rawEntry;
            }
            const clean = Object.assign({}, rawEntry, {
                weight: Math.round(w * 100) / 100,
                date: rawEntry.date || (typeof globalScope.toIsoDateKeyLocal === 'function' ? globalScope.toIsoDateKeyLocal(new Date()) : new Date().toISOString().slice(0, 10))
            });
            if (repairedText) {
                totalFixesCount++;
                pushUserNotice('Analiz Alt Şefi', 'Koç Özeti ve Vücut Tonajı', `Tartı verisi (${clean.weight} kg) düzeltildi`);
            }
            return clean;
        });
    }

    // 6) PROFİL BAĞLANTI ALT ŞEFİ -> Alıcılar: [Bulut Yedekleme, Tüm Kullanıcı Odaları]
    function inspectProfileSyncForReceivers(payload) {
        return withLoopGuard('profile->cloud_rooms', () => {
            if (!payload || typeof payload !== 'object') return payload;
            const beforeJson = JSON.stringify(payload);
            const cleaned = (globalScope.CelikBridgeCustoms && typeof globalScope.CelikBridgeCustoms.sanitizeCloudExportBundle === 'function')
                ? globalScope.CelikBridgeCustoms.sanitizeCloudExportBundle(payload)
                : payload;
            const afterJson = JSON.stringify(cleaned);
            if (beforeJson.length > afterJson.length) {
                totalFixesCount++;
                pushUserNotice('Profil Alt Şefi', 'Bulut ve Dışa Aktarım', 'Hassas parola/anahtar alanı temizlendi');
            }
            return cleaned;
        });
    }

    // 7) SAAT (GARMIN & TREDICT) BAĞLANTI ALT ŞEFİ -> Alıcılar: [Geçmiş, Analiz, Antrenman]
    function inspectGarminIncomingForReceivers(activityLog) {
        return withLoopGuard('garmin->history_analytics', () => {
            if (!activityLog || typeof activityLog !== 'object' || !Array.isArray(activityLog.exercises)) return activityLog;
            let fixes = 0;
            const db = getCatalogList();
            activityLog.exercises = activityLog.exercises.map(ex => {
                if (!ex || typeof ex !== 'object') return ex;
                const dbMatch = ex.id ? db.find(d => d.id === ex.id) : null;
                if (dbMatch && ex.name !== dbMatch.name && ex.originalName) {
                    ex.name = ex.originalName;
                    fixes++;
                }
                const mode = typeof globalScope.getExerciseMetricMode === 'function' ? globalScope.getExerciseMetricMode(ex) : 'reps';
                if (mode === 'cardio_min') {
                    for (const s of (ex.sets || [])) {
                        if (Number(s.weight) > 0) { s.weight = 0; fixes++; }
                    }
                }
                return ex;
            });
            if (fixes > 0) {
                totalFixesCount += fixes;
                pushUserNotice('Saat Alt Şefi', 'Geçmiş ve Analiz', `${fixes} saat verisi orijinal ada/birime çevrildi`);
            }
            return activityLog;
        });
    }

    const api = {
        resolveCanonicalActiveUid,
        withLoopGuard,
        runWithFaultWall,
        inspectGeneratedWorkoutForReceivers,
        inspectOutgoingCompletedSession,
        inspectLibraryExclusionChange,
        inspectHistoryMutationForReceivers,
        inspectScaleInputForReceivers,
        inspectProfileSyncForReceivers,
        inspectGarminIncomingForReceivers,
        getNotices: () => auditNotices.slice(),
        clearNotices: () => { auditNotices.length = 0; },
        getLoopBlockedCount: () => loopBlockedCount,
        getStats: () => ({
            totalFixesCount,
            totalQuarantinedCount,
            loopBlockedCount,
            recentNoticesCount: auditNotices.length
        })
    };

    if (globalScope) {
        globalScope.CelikLiaisonSubChiefs = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
