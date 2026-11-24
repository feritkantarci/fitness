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
                const replaceExcludedInList = (arr) => arr.map(ex => {
                    const exId = typeof ex === 'string' ? ex : ex?.id;
                    if (exId === excludedId) {
                        fixedSchedule++;
                        schedChanged = true;
                        return typeof ex === 'string' ? replacement.id : Object.assign({}, replacement);
                    }
                    return ex;
                });
                for (const d of Object.keys(sched || {})) {
                    const dayPlan = sched[d];
                    if (dayPlan && dayPlan.customWorkout && Array.isArray(dayPlan.customWorkout.exercises)) {
                        dayPlan.customWorkout.exercises = replaceExcludedInList(dayPlan.customWorkout.exercises);
                        if (Array.isArray(dayPlan.exercises)) {
                            delete dayPlan.exercises;
                            schedChanged = true;
                        }
                    } else if (dayPlan && Array.isArray(dayPlan.exercises)) {
                        dayPlan.exercises = replaceExcludedInList(dayPlan.exercises);
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

    // 8) BULUT BAĞLANTI ALT ŞEFİ (KOTA, PAKET BOYUTU & v2 ZARF GÖZCÜSÜ) -> Alıcı: [Yönetici İzleme, Profil]
    const cloudSubChiefStats = {
        readsCount: 0,
        writesCount: 0,
        savedWritesCount: 0,
        savedReadsCount: 0,
        timeoutsCount: 0,
        quotaTripsCount: 0,
        lastSyncAt: 0,
        lastOperation: '',
        recentOps: []
    };

    function measureUtf8Bytes(raw) {
        try {
            const s = typeof raw === 'string' ? raw : JSON.stringify(raw);
            if (!s) return 0;
            if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
            return s.length * 2;
        } catch {
            return 0;
        }
    }

    function noteCloudSubChiefEvent(kind, target, detail, count = 1) {
        const n = Math.max(1, Number(count) || 1);
        const k = String(kind || 'info').trim();
        if (k === 'read') {
            cloudSubChiefStats.readsCount += n;
            cloudSubChiefStats.lastSyncAt = Date.now();
        } else if (k === 'write') {
            cloudSubChiefStats.writesCount += n;
            cloudSubChiefStats.lastSyncAt = Date.now();
        } else if (k === 'saved_write') {
            cloudSubChiefStats.savedWritesCount += n;
        } else if (k === 'saved_read') {
            cloudSubChiefStats.savedReadsCount += n;
        } else if (k === 'timeout') {
            cloudSubChiefStats.timeoutsCount += n;
        } else if (k === 'quota') {
            cloudSubChiefStats.quotaTripsCount += n;
        }
        const targetLabel = String(target || 'bulut').trim();
        const detailLabel = String(detail || k).trim();
        cloudSubChiefStats.lastOperation = `${targetLabel} (${detailLabel})`;
        cloudSubChiefStats.recentOps.unshift({
            at: Date.now(),
            kind: k,
            target: targetLabel,
            detail: detailLabel,
            count: n
        });
        if (cloudSubChiefStats.recentOps.length > 15) {
            cloudSubChiefStats.recentOps.length = 15;
        }
        return cloudSubChiefStats;
    }

    function inspectCloudHealthSnapshot(uidOverride) {
        const uid = String(uidOverride || resolveCanonicalActiveUid() || 'default');
        const safeGetItem = (key) => {
            try {
                return (typeof localStorage !== 'undefined' && localStorage) ? localStorage.getItem(key) : null;
            } catch {
                return null;
            }
        };
        const safeParseObj = (raw, fallback) => {
            if (!raw) return fallback;
            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === 'object' ? parsed : fallback;
            } catch {
                return fallback;
            }
        };

        const historyRaw = safeGetItem(`celik_kodu_history_${uid}`) || '[]';
        const historyBytes = measureUtf8Bytes(historyRaw);
        const logs = safeParseObj(historyRaw, []);
        let workoutCount = 0;
        let maxSingleWorkoutBytes = 0;
        let sumSingleWorkoutBytes = 0;
        if (Array.isArray(logs)) {
            workoutCount = logs.length;
            for (const log of logs) {
                const b = measureUtf8Bytes(log);
                if (b > maxSingleWorkoutBytes) maxSingleWorkoutBytes = b;
                sumSingleWorkoutBytes += b;
            }
        }
        const avgSingleWorkoutBytes = workoutCount > 0 ? Math.round(sumSingleWorkoutBytes / workoutCount) : 0;

        const dateSchedRaw = safeGetItem(`celik_kodu_date_schedule_${uid}`) || '{}';
        const dateScheduleBytes = measureUtf8Bytes(dateSchedRaw);
        const dateSchedObj = safeParseObj(dateSchedRaw, {});
        let calendarDayCount = 0;
        let maxSingleDayBytes = 0;
        if (dateSchedObj && typeof dateSchedObj === 'object' && !Array.isArray(dateSchedObj)) {
            const entries = Object.values(dateSchedObj);
            calendarDayCount = entries.length;
            for (const dayEntry of entries) {
                const b = measureUtf8Bytes(dayEntry);
                if (b > maxSingleDayBytes) maxSingleDayBytes = b;
            }
        }

        const weeklyBytes =
            measureUtf8Bytes(safeGetItem(`celik_kodu_weekly_schedule_${uid}`) || '{}') +
            measureUtf8Bytes(safeGetItem(`celik_kodu_next_weekly_schedule_${uid}`) || '{}');
        const customProgramsBytes = measureUtf8Bytes(safeGetItem(`celik_kodu_custom_programs_${uid}`) || '[]');
        const weightsBytes = measureUtf8Bytes(safeGetItem(`celik_kodu_last_weights_${uid}`) || '{}');

        const workoutSigsObj = safeParseObj(safeGetItem(`celik_kodu_cloud_item_sigs_workout_${uid}`), {});
        const daySigsObj = safeParseObj(safeGetItem(`celik_kodu_cloud_item_sigs_days_${uid}`), {});
        const v2WorkoutSigsCount = (workoutSigsObj && !Array.isArray(workoutSigsObj)) ? Object.keys(workoutSigsObj).length : 0;
        const v2CalendarDaySigsCount = (daySigsObj && !Array.isArray(daySigsObj)) ? Object.keys(daySigsObj).length : 0;

        const v2Migrated = safeGetItem(`celik_kodu_v2_subdoc_migrated_${uid}`) === '1';
        const v2LegacyPurged = safeGetItem(`celik_kodu_v2_legacy_purged_${uid}`) === '1';
        const v2DaysActive = v2Migrated || v2CalendarDaySigsCount > 0;
        const estimatedParentStateBytes = weeklyBytes + customProgramsBytes + weightsBytes + (v2DaysActive ? 0 : dateScheduleBytes) + 12000;

        const limitBytes = 1048576;
        const parentStateLimitPct = Math.round((estimatedParentStateBytes / limitBytes) * 1000) / 10;
        const maxSingleWorkoutLimitPct = Math.round((maxSingleWorkoutBytes / limitBytes) * 1000) / 10;
        const legacyMonolithBytes = (v2Migrated && v2LegacyPurged) ? 0 : historyBytes;
        const legacyMonolithWorkoutPct = Math.round((legacyMonolithBytes / limitBytes) * 1000) / 10;

        const pendingWorkoutSync = safeGetItem(`celik_kodu_pending_workout_sync_${uid}`) === '1';
        const pendingStateSync = safeGetItem(`celik_kodu_pending_state_sync_${uid}`) === '1';
        const deferredWorkoutStateSync = safeGetItem(`celik_kodu_deferred_state_sync_${uid}`) === '1';
        const pendingSystemLogSync = safeGetItem(`celik_kodu_pending_telemetry_sync_${uid}`) === '1';
        const pendingTotalCount = [pendingWorkoutSync, pendingStateSync, deferredWorkoutStateSync, pendingSystemLogSync].filter(Boolean).length;

        const lastWorkoutPullAt = Number(safeGetItem(`celik_kodu_cloud_pull_at_workout_${uid}`) || 0);
        const lastDaysPullAt = Number(safeGetItem(`celik_kodu_cloud_pull_at_days_${uid}`) || 0);

        let circuitState = { isOpen: false, reason: '', remainingMs: 0, slowStreak: 0, badgeText: 'Bulut Aktif', lastIssue: null };
        try {
            if (typeof globalScope.getCloudCircuitDiagnosticState === 'function') {
                const rawCircuit = globalScope.getCloudCircuitDiagnosticState();
                if (rawCircuit && typeof rawCircuit === 'object') {
                    circuitState = Object.assign({}, circuitState, rawCircuit);
                }
            }
        } catch {}

        const appVer = (globalScope.CelikKaraKutu && typeof globalScope.CelikKaraKutu.getAppVersion === 'function')
            ? globalScope.CelikKaraKutu.getAppVersion()
            : 'v356';

        return {
            uid,
            appVersion: appVer,
            readsCount: cloudSubChiefStats.readsCount,
            writesCount: cloudSubChiefStats.writesCount,
            savedWritesCount: cloudSubChiefStats.savedWritesCount,
            savedReadsCount: cloudSubChiefStats.savedReadsCount,
            timeoutsCount: cloudSubChiefStats.timeoutsCount,
            quotaTripsCount: cloudSubChiefStats.quotaTripsCount,
            lastSyncAt: cloudSubChiefStats.lastSyncAt,
            lastOperation: cloudSubChiefStats.lastOperation,
            recentOps: cloudSubChiefStats.recentOps.slice(0, 8),
            workoutCount,
            historyBytes,
            maxSingleWorkoutBytes,
            avgSingleWorkoutBytes,
            calendarDayCount,
            dateScheduleBytes,
            maxSingleDayBytes,
            weeklyBytes,
            customProgramsBytes,
            weightsBytes,
            estimatedParentStateBytes,
            parentStateLimitPct,
            maxSingleWorkoutLimitPct,
            legacyMonolithBytes,
            legacyMonolithWorkoutPct,
            v2Migrated,
            v2LegacyPurged,
            v2DaysActive,
            v2WorkoutSigsCount,
            v2CalendarDaySigsCount,
            lastWorkoutPullAt,
            lastDaysPullAt,
            pendingWorkoutSync,
            pendingStateSync,
            deferredWorkoutStateSync,
            pendingSystemLogSync,
            pendingTotalCount,
            circuitState
        };
    }

    function buildCloudSubChiefDiagnosticReport(uidOverride) {
        const snap = inspectCloudHealthSnapshot(uidOverride);
        const toKb = (b) => `${(Number(b || 0) / 1024).toFixed(1)} KB`;
        const fmtTs = (ts) => (ts > 0 ? new Date(ts).toISOString() : 'Yok');
        const c = snap.circuitState || {};
        const circuitLabel = c.isOpen
            ? (c.reason === 'slow' ? 'Yavas Ag Korumasi Acik' : 'Kota Korumasi Acik') + ` (${Math.ceil(Number(c.remainingMs || 0) / 60000)} dk kaldi)`
            : 'Normal (Devrede)';
        const pendingTags = [];
        if (snap.pendingWorkoutSync) pendingTags.push('Antrenman');
        if (snap.pendingStateSync) pendingTags.push('Durum');
        if (snap.deferredWorkoutStateSync) pendingTags.push('AntrenmanSonuErteli');
        if (snap.pendingSystemLogSync) pendingTags.push('SistemKaydi');
        const savedTotal = snap.savedWritesCount + snap.savedReadsCount;

        const lines = [
            'CELIK KODU BULUT ALT SEFI DIAGNOSTIK RAPORU',
            `Sporcu: ${snap.uid} | Surum: ${snap.appVersion} | Zarf Yapisi v2: ${snap.v2Migrated ? 'Tam Gecildi' : (snap.v2DaysActive ? 'Kismi Aktif' : 'Bekliyor')}`,
            `Kota / Devre Durumu: ${circuitLabel} (Ardisik Zaman Asimi: ${c.slowStreak || 0} | Son Sorun: ${c.lastIssue || 'Yok'})`,
            `Oturum Trafigi: Okuma=${snap.readsCount}, Yazma=${snap.writesCount}, Tasarruf=${savedTotal} (Atlanan Yazma=${snap.savedWritesCount}, Onbellek Okuma=${snap.savedReadsCount}), ZamanAsimi=${snap.timeoutsCount}, KotaKesimi=${snap.quotaTripsCount}`,
            `1 MB Paket Sagligi: Ana Durum=${toKb(snap.estimatedParentStateBytes)} (%${snap.parentStateLimitPct}) | En Buyuk Antrenman Zarfi=${toKb(snap.maxSingleWorkoutBytes)} (%${snap.maxSingleWorkoutLimitPct}, Ort=${toKb(snap.avgSingleWorkoutBytes)}) | Eski Tekil Gecmis Toplami=${toKb(snap.legacyMonolithBytes)} (%${snap.legacyMonolithWorkoutPct})`,
            `Takvim & Zarf Sayilari: Kayitli Antrenman=${snap.workoutCount} (v2 Zarf=${snap.v2WorkoutSigsCount}) | Takvim Gunu=${snap.calendarDayCount} (${toKb(snap.dateScheduleBytes)}, v2 Gun=${snap.v2CalendarDaySigsCount}, En Buyuk Gun=${toKb(snap.maxSingleDayBytes)})`,
            `Bekleyen Kuyruk (${snap.pendingTotalCount}): ${pendingTags.length ? pendingTags.join(', ') : 'Temiz'}`,
            `Son Cekme Zamanlari: Antrenman=${fmtTs(snap.lastWorkoutPullAt)} | Takvim=${fmtTs(snap.lastDaysPullAt)} | Son Islem=${snap.lastOperation || 'Yok'}`
        ];
        if (Array.isArray(snap.recentOps) && snap.recentOps.length > 0) {
            lines.push('Son Oturum Islemleri:');
            snap.recentOps.slice(0, 6).forEach((op, idx) => {
                lines.push(`  ${idx + 1}. [${op.kind}] ${op.target} -> ${op.detail} (x${op.count}) @ ${fmtTs(op.at)}`);
            });
        }
        const rawReport = lines.join('\n');
        try {
            if (globalScope.CelikKaraKutu && typeof globalScope.CelikKaraKutu.maskSecrets === 'function') {
                return globalScope.CelikKaraKutu.maskSecrets(rawReport);
            }
        } catch {}
        return rawReport;
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
        noteCloudSubChiefEvent,
        inspectCloudHealthSnapshot,
        buildCloudSubChiefDiagnosticReport,
        getCloudSubChiefStats: () => Object.assign({}, cloudSubChiefStats, {
            recentOps: cloudSubChiefStats.recentOps.slice()
        }),
        getNotices: () => auditNotices.slice(),
        clearNotices: () => { auditNotices.length = 0; },
        getLoopBlockedCount: () => loopBlockedCount,
        getStats: () => ({
            totalFixesCount,
            totalQuarantinedCount,
            loopBlockedCount,
            recentNoticesCount: auditNotices.length,
            cloudReads: cloudSubChiefStats.readsCount,
            cloudWrites: cloudSubChiefStats.writesCount,
            cloudSavedOps: cloudSubChiefStats.savedWritesCount + cloudSubChiefStats.savedReadsCount
        })
    };

    if (globalScope) {
        globalScope.CelikLiaisonSubChiefs = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
