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

    function pushUserNotice(subChiefTitle, receiverLabel, actionSummary, options) {
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
        if (!(options && options.skipTelemetry)) {
            try {
                if (globalScope && globalScope.CelikKaraKutu && typeof globalScope.CelikKaraKutu.record === 'function') {
                    globalScope.CelikKaraKutu.record({
                        gate: 'K1',
                        severity: subChiefTitle === 'Arıza Duvarı' ? 'error' : 'warn',
                        module: String(subChiefTitle || 'Bağlantı Alt Şefi'),
                        action: String(receiverLabel || 'Alıcı Koruma'),
                        inputSummary: String(receiverLabel || ''),
                        outcome: String(actionSummary || '')
                    });
                }
            } catch {}
        }
        return item;
    }

    // Tek Yönlü Döngü Kilidi: A -> B -> A sonsuz tetiklenmesini anında keser
    function withLoopGuard(channelKey, fn) {
        if (activeDispatchLocks.has(channelKey)) {
            loopBlockedCount++;
            try {
                if (globalScope && globalScope.CelikKaraKutu && typeof globalScope.CelikKaraKutu.record === 'function') {
                    globalScope.CelikKaraKutu.record({
                        gate: 'K1',
                        severity: 'warn',
                        module: 'Döngü Kilidi',
                        action: String(channelKey || 'Döngü'),
                        inputSummary: String(channelKey || 'Döngü'),
                        outcome: 'Sonsuz tetikleme döngüsü kesildi'
                    });
                }
            } catch {}
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
            const errMsg = String((err && err.message) || err || 'Bilinmeyen ekran hatası');
            if (containerEl) {
                containerEl.innerHTML = prevHtml || (
                    '<div data-quarantined="true" style="background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;padding:12px;border-radius:12px;font-size:12.5px;font-weight:700;">' +
                    String(zoneName || 'Bölüm') + ' geçici koruma moduna alındı • ' + String(fallbackSummary || 'Diğer bölümler çalışmaya devam ediyor') +
                    '</div>'
                );
            }
            pushUserNotice('Arıza Duvarı', zoneName || 'Ekran Kutusu', 'Hatalı kutu karantinaya alındı', { skipTelemetry: true });
            try {
                if (globalScope && globalScope.CelikKaraKutu && typeof globalScope.CelikKaraKutu.record === 'function') {
                    globalScope.CelikKaraKutu.record({
                        gate: 'K1',
                        severity: 'error',
                        module: 'Arıza Duvarı',
                        action: String(zoneName || 'Ekran Kutusu'),
                        inputSummary: String(zoneName || 'Ekran Kutusu'),
                        outcome: errMsg
                    });
                }
            } catch {}
            return { ok: false, quarantined: true, error: errMsg };
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
                        const normRepl = typeof globalScope.normalizeExerciseTargetSpec === 'function'
                            ? globalScope.normalizeExerciseTargetSpec(repl, cur.targetSets || 3, cur.targetReps || '8-12')
                            : { sets: cur.targetSets || 3, reps: cur.targetReps || '8-12', metricMode: 'reps', isCardioMinutes: false, isTimeBased: false };
                        cur = Object.assign({}, repl, {
                            targetSets: normRepl.sets,
                            targetReps: normRepl.reps,
                            metricMode: normRepl.metricMode,
                            isCardioMinutes: normRepl.isCardioMinutes,
                            isTimeBased: normRepl.isTimeBased
                        });
                        fixes++;
                    }
                }
                const mode = typeof globalScope.getExerciseMetricMode === 'function' ? globalScope.getExerciseMetricMode(cur) : 'reps';
                if (typeof globalScope.normalizeExerciseTargetSpec === 'function') {
                    const norm = globalScope.normalizeExerciseTargetSpec(cur, cur.targetSets || 3, cur.targetReps || '8-12');
                    if (norm.repsCorrected || norm.setsCorrected) {
                        cur = Object.assign({}, cur, {
                            targetSets: norm.sets,
                            sets: mode === 'cardio_min' ? 1 : cur.sets,
                            targetReps: norm.reps,
                            metricMode: mode,
                            isTimeBased: mode === 'time_sec',
                            isCardioMinutes: mode === 'cardio_min'
                        });
                        fixes++;
                    } else if (cur.metricMode !== mode || cur.isTimeBased !== (mode === 'time_sec') || cur.isCardioMinutes !== (mode === 'cardio_min')) {
                        cur = Object.assign({}, cur, {
                            metricMode: mode,
                            isTimeBased: mode === 'time_sec',
                            isCardioMinutes: mode === 'cardio_min'
                        });
                    }
                } else if (mode === 'time_sec') {
                    const rawR = String(cur.targetReps || '').trim();
                    const numS = parseFloat(rawR);
                    const badTime = !rawR || /^\d+\s*[-–—]\s*\d+$/.test(rawR) || /\b(dk|dak|min|maks|max|tk|tekrar|rep)\b/i.test(rawR) || (!/\b(sn|saniye|sec)\b/i.test(rawR) && (isNaN(numS) || numS < 15));
                    if (badTime) {
                        cur = Object.assign({}, cur, { isTimeBased: true, isCardioMinutes: false, targetReps: '30 sn' });
                        fixes++;
                    }
                } else if (mode === 'cardio_min') {
                    const rawR = String(cur.targetReps || '').trim();
                    const badMin = !rawR || !/\b(dk|dak|min)\b/i.test(rawR) || Number(cur.targetSets) !== 1;
                    if (badMin) {
                        cur = Object.assign({}, cur, { isCardioMinutes: true, isTimeBased: false, targetSets: 1, targetReps: /\b(dk|dak|min)\b/i.test(rawR) ? rawR : '20 dk' });
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
            if (typeof globalScope.recalculateWorkoutLogMetrics === 'function') {
                const res = globalScope.recalculateWorkoutLogMetrics(sessionLog);
                if (res && res.unitCorruptionFixed) fixes++;
            } else {
                let cleanTotalReps = 0;
                let cleanTotalVol = 0;

                for (const ex of sessionLog.exercises) {
                    if (!ex || typeof ex !== 'object') continue;
                    const mode = typeof globalScope.getExerciseMetricMode === 'function' ? globalScope.getExerciseMetricMode(ex) : 'reps';
                    if (mode === 'cardio_min') {
                        if (!ex.isCardioMinutes || ex.isTimeBased) {
                            ex.isCardioMinutes = true;
                            ex.isTimeBased = false;
                            fixes++;
                        }
                        for (const s of (ex.sets || [])) {
                            if (Number(s.weight) > 0) { s.weight = 0; fixes++; }
                        }
                        ex.maxWeight = 0;
                        ex.exerciseVolume = 0;
                    } else if (mode === 'time_sec') {
                        if (!ex.isTimeBased) { ex.isTimeBased = true; fixes++; }
                        for (const s of (ex.sets || [])) {
                            if (s && s.completed !== false && typeof globalScope.calculateExerciseSetVolume === 'function') {
                                cleanTotalVol += globalScope.calculateExerciseSetVolume(ex, s.weight, s.reps);
                            }
                        }
                    } else {
                        for (const s of (ex.sets || [])) {
                            if (s && s.completed !== false) {
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
                        const normRepl = typeof globalScope.normalizeExerciseTargetSpec === 'function'
                            ? globalScope.normalizeExerciseTargetSpec(replacement, ex.targetSets || 3, ex.targetReps || '8-12')
                            : { sets: ex.targetSets || 3, reps: ex.targetReps || '8-12', metricMode: 'reps', isCardioMinutes: false, isTimeBased: false };
                        return Object.assign({}, replacement, {
                            targetSets: normRepl.sets,
                            targetReps: normRepl.reps,
                            metricMode: normRepl.metricMode,
                            isCardioMinutes: normRepl.isCardioMinutes,
                            isTimeBased: normRepl.isTimeBased
                        });
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
            const hasCanonicalRecalc = typeof globalScope.recalculateWorkoutLogMetrics === 'function';
            const out = logs.map(log => {
                if (!log || typeof log !== 'object' || !Array.isArray(log.exercises)) return log;
                if (hasCanonicalRecalc) {
                    const res = globalScope.recalculateWorkoutLogMetrics(log);
                    if (res && res.unitCorruptionFixed) {
                        fixes++;
                    }
                    return res && res.log ? res.log : log;
                }
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
                            if (s && s.completed !== false && typeof globalScope.calculateExerciseSetVolume === 'function') {
                                cleanVol += globalScope.calculateExerciseSetVolume(ex, s.weight, s.reps);
                            }
                        }
                    } else {
                        for (const s of (ex.sets || [])) {
                            if (s && s.completed !== false) {
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
