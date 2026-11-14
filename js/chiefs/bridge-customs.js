// ==================== KÖPRÜ GÜMRÜĞÜ (BRIDGE CUSTOMS — 7 ŞEF ARASI VERİ DENETÇİSİ) ====================
// Kural (A2): Eksik birim/tarih/kategori alanlarını otomatik onarır; içi boş/bozuk kayıtları sessizce engeller.
(function initCelikBridgeCustoms(globalScope) {
    const SECRET_KEYS_LOWER = new Set([
        'password', 'passwordhash', 'salt', 'geminiapikey', 'apikey',
        'accesstoken', 'refreshtoken', 'clientsecret', 'tredicttoken', 'intervalstoken', 'gcaltoken', 'privatekey'
    ]);
    const SECRET_KEY_PATTERN = /(password|passwd|pwd|(^|[_-])salt($|[_-])|api[_-]?key|gemini.*key|openai.*key|client[_-]?secret|private[_-]?key|access[_-]?token|refresh[_-]?token|tredict[_-]?token|intervals[_-]?token|gcal[_-]?token)/i;
    const SECRET_VALUE_PATTERN = /^(AIza[0-9A-Za-z_-]{16,}|sk-[0-9A-Za-z_-]{16,})$/;

    function isSensitiveSecretEntry(key, val) {
        const kStr = String(key || '');
        const kl = kStr.toLowerCase();
        if (SECRET_KEYS_LOWER.has(kl) || SECRET_KEY_PATTERN.test(kStr)) return true;
        if (typeof val === 'string' && SECRET_VALUE_PATTERN.test(val.trim())) return true;
        return false;
    }
    const PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
    const MEAS_FIELDS = ['waist', 'chest', 'shoulder', 'arms', 'thigh', 'hips', 'neck'];

    const stats = {
        repairedCount: 0,
        rejectedCount: 0,
        lastEvents: []
    };

    function recordCustomsEvent(type, bridge, detail) {
        if (type === 'repaired') stats.repairedCount++;
        else if (type === 'rejected') stats.rejectedCount++;
        stats.lastEvents.push({
            type,
            bridge,
            detail: String(detail || '').slice(0, 120),
            at: Date.now()
        });
        if (stats.lastEvents.length > 50) {
            stats.lastEvents.splice(0, stats.lastEvents.length - 50);
        }
    }

    function toIsoDateFallback(rawDate, rawTs) {
        const s = String(rawDate || '').trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { iso: s, repaired: false };
        if (s) {
            const parsed = new Date(s);
            if (!isNaN(parsed.getTime())) {
                const y = parsed.getFullYear();
                const m = String(parsed.getMonth() + 1).padStart(2, '0');
                const d = String(parsed.getDate()).padStart(2, '0');
                return { iso: `${y}-${m}-${d}`, repaired: true };
            }
            // Explicit invalid date string with no valid numeric timestamp -> rejectable if negative/garbage
            if (rawTs === undefined || rawTs === null || isNaN(Number(rawTs)) || Number(rawTs) <= 0) {
                return { iso: null, repaired: false };
            }
        }
        const tsNum = Number(rawTs);
        const dObj = (!isNaN(tsNum) && tsNum > 0) ? new Date(tsNum) : new Date();
        if (isNaN(dObj.getTime())) return { iso: null, repaired: false };
        const y = dObj.getFullYear();
        const m = String(dObj.getMonth() + 1).padStart(2, '0');
        const d = String(dObj.getDate()).padStart(2, '0');
        return { iso: `${y}-${m}-${d}`, repaired: true };
    }

    function sanitizeWorkoutLogExercise(rawEx) {
        if (!rawEx || typeof rawEx !== 'object' || Array.isArray(rawEx)) {
            recordCustomsEvent('rejected', 'history.exercise', 'Geçersiz egzersiz nesnesi');
            return null;
        }
        const rawId = String(rawEx.id || rawEx.exId || '').trim();
        const rawName = String(rawEx.name || '').trim();
        if (!rawId && !rawName) {
            recordCustomsEvent('rejected', 'history.exercise', 'İsimsiz ve kimliksiz boş egzersiz');
            return null;
        }

        let repaired = false;
        const canonical = (typeof resolveCanonicalDbExercise === 'function')
            ? resolveCanonicalDbExercise(rawEx)
            : rawEx;
        const ex = Object.assign({}, rawEx);
        if (!ex.id && canonical && canonical.id) {
            ex.id = canonical.id;
            repaired = true;
        }
        if (!ex.name && canonical && canonical.name) {
            ex.name = canonical.name;
            repaired = true;
        }
        if (!ex.category && canonical && canonical.category) {
            ex.category = canonical.category;
            repaired = true;
        }
        if (!ex.equipment && canonical && canonical.equipment) {
            ex.equipment = canonical.equipment;
            repaired = true;
        }

        const mode = (typeof getExerciseMetricMode === 'function')
            ? getExerciseMetricMode(ex)
            : 'reps';
        const isCardio = mode === 'cardio_min';
        const isTime = mode === 'time_sec';
        const isBw = (typeof isExerciseBodyweight === 'function')
            ? isExerciseBodyweight(ex)
            : Boolean(ex.isBodyweight);

        if (ex.metricMode !== mode) {
            ex.metricMode = mode;
            repaired = true;
        }
        if (ex.isCardioMinutes !== isCardio) {
            ex.isCardioMinutes = isCardio;
            repaired = true;
        }
        if (ex.isTimeBased !== isTime) {
            ex.isTimeBased = isTime;
            repaired = true;
        }
        if (ex.isBodyweight !== isBw) {
            ex.isBodyweight = isBw;
        }

        if (typeof ex.sets === 'number') {
            const cnt = Math.max(1, Math.min(20, Math.round(ex.sets)));
            const repVal = Math.max(1, Number(ex.reps) || (isCardio ? 20 : (isTime ? 30 : 10)));
            const wVal = isCardio ? 0 : Math.max(0, Number(ex.weight) || 0);
            ex.sets = Array.from({ length: cnt }, (_, idx) => ({
                setNo: idx + 1,
                weight: wVal,
                reps: repVal,
                completed: true,
                volume: isCardio ? 0 : (wVal * repVal)
            }));
            repaired = true;
        } else if (Array.isArray(ex.sets)) {
            ex.sets = ex.sets
                .filter(st => st && typeof st === 'object')
                .map((st, idx) => {
                    const stClone = Object.assign({}, st);
                    if (!stClone.setNo) stClone.setNo = idx + 1;
                    if (isCardio && ((Number(stClone.weight) || 0) > 0 || (Number(stClone.volume) || 0) > 0)) {
                        stClone.weight = 0;
                        stClone.volume = 0;
                        repaired = true;
                    }
                    return stClone;
                });
        }

        if (isCardio) {
            if ((Number(ex.exerciseVolume) || 0) > 0 || (Number(ex.maxWeight) || 0) > 0 || (Number(ex.weight) || 0) > 0) {
                repaired = true;
            }
            ex.exerciseVolume = 0;
            ex.maxWeight = 0;
            if (ex.weight !== undefined) ex.weight = 0;
        }

        if (repaired) {
            recordCustomsEvent('repaired', 'history.exercise', ex.id || ex.name);
        }
        return ex;
    }

    function sanitizeWorkoutLogEntry(rawLog) {
        if (!rawLog || typeof rawLog !== 'object' || Array.isArray(rawLog)) {
            recordCustomsEvent('rejected', 'history', 'Geçersiz kayıt türü');
            return null;
        }
        const rawExercises = Array.isArray(rawLog.exercises)
            ? rawLog.exercises
            : (Array.isArray(rawLog.detailedExercises) ? rawLog.detailedExercises : null);
        if (!rawExercises || rawExercises.length === 0) {
            recordCustomsEvent('rejected', 'history', 'Hareket listesi boş antrenman engellendi');
            return null;
        }

        const dateCheck = toIsoDateFallback(rawLog.date, rawLog.timestamp || rawLog.completedAt);
        if (!dateCheck.iso) {
            recordCustomsEvent('rejected', 'history', 'Bozuk tarih bilgisi engellendi');
            return null;
        }

        const cleanExercises = rawExercises.map(sanitizeWorkoutLogExercise).filter(Boolean);
        if (cleanExercises.length === 0) {
            recordCustomsEvent('rejected', 'history', 'Geçerli hareket içermeyen kayıt engellendi');
            return null;
        }

        let repaired = dateCheck.repaired || (cleanExercises.length !== rawExercises.length);
        const log = Object.assign({}, rawLog);
        if (!log.id) {
            log.id = 'log_' + (Number(rawLog.timestamp) || Date.now()) + '_' + Math.random().toString(36).slice(2, 6);
            repaired = true;
        }
        if (log.date !== dateCheck.iso) {
            log.date = dateCheck.iso;
            repaired = true;
        }
        if (!log.timestamp || isNaN(Number(log.timestamp)) || Number(log.timestamp) <= 0) {
            const parsedD = new Date(dateCheck.iso + 'T18:00:00');
            log.timestamp = !isNaN(parsedD.getTime()) ? parsedD.getTime() : Date.now();
            repaired = true;
        }
        log.exercises = cleanExercises;
        if (Array.isArray(log.detailedExercises)) {
            log.detailedExercises = cleanExercises;
        }

        // Toplam tonajda dakikalı kardiyo şişmesi varsa otomatik onar
        const hasCardio = cleanExercises.some(e => e.isCardioMinutes);
        if (hasCardio && typeof calculateExerciseSetVolume === 'function') {
            let recomputedVol = 0;
            let hasExplicitSets = false;
            cleanExercises.forEach(e => {
                if (Array.isArray(e.sets) && e.sets.length > 0) {
                    hasExplicitSets = true;
                }
                if (e.isCardioMinutes) return;
                if (Array.isArray(e.sets) && e.sets.length > 0) {
                    e.sets.forEach(st => {
                        if (st && st.completed !== false) {
                            recomputedVol += calculateExerciseSetVolume(e, st.weight, st.reps);
                        }
                    });
                } else if (Number(e.exerciseVolume) > 0) {
                    recomputedVol += Number(e.exerciseVolume);
                }
            });
            if (hasExplicitSets && Number(log.totalVolumeKg) > Math.round(recomputedVol) + 1) {
                log.totalVolumeKg = Math.round(recomputedVol);
                repaired = true;
            }
        }

        if (repaired) {
            recordCustomsEvent('repaired', 'history', log.id);
        }
        return log;
    }

    function sanitizeWorkoutLogsList(logs) {
        if (!Array.isArray(logs)) {
            if (logs !== null && logs !== undefined) {
                recordCustomsEvent('rejected', 'history.list', 'Dizi olmayan geçmiş verisi');
            }
            return [];
        }
        return logs.map(sanitizeWorkoutLogEntry).filter(Boolean);
    }

    function sanitizeGeneratedWorkoutPayload(workout) {
        if (!workout || typeof workout !== 'object' || Array.isArray(workout)) {
            recordCustomsEvent('rejected', 'generator', 'Geçersiz program nesnesi');
            return null;
        }
        if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
            recordCustomsEvent('rejected', 'generator', 'Hareket listesi boş program engellendi');
            return null;
        }

        let repaired = false;
        const cleanWorkout = Object.assign({}, workout);
        const filteredExercises = [];

        for (const rawEx of workout.exercises) {
            if (!rawEx || typeof rawEx !== 'object') {
                repaired = true;
                continue;
            }
            const ex = (typeof resolveCanonicalDbExercise === 'function')
                ? Object.assign({}, resolveCanonicalDbExercise(rawEx), rawEx)
                : Object.assign({}, rawEx);
            if (!ex.id && !ex.name) {
                repaired = true;
                continue;
            }
            if (ex.id && typeof isExerciseExcludedByUser === 'function' && isExerciseExcludedByUser(ex.id)) {
                repaired = true;
                continue;
            }
            const mode = (typeof getExerciseMetricMode === 'function') ? getExerciseMetricMode(ex) : 'reps';
            ex.metricMode = mode;
            if (mode === 'cardio_min') {
                const defMin = (typeof resolveDefaultExerciseSetTarget === 'function') ? resolveDefaultExerciseSetTarget(ex, '') : 20;
                if (Number(ex.targetSets) !== 1 && ex.targetSets !== undefined) repaired = true;
                ex.targetSets = 1;
                ex.sets = 1;
                if (!ex.targetReps || !/\b(dk|dak|min)\b/i.test(String(ex.targetReps))) {
                    ex.targetReps = `${defMin} dk`;
                    repaired = true;
                }
            } else if (mode === 'time_sec') {
                const defSec = (typeof resolveDefaultExerciseSetTarget === 'function') ? resolveDefaultExerciseSetTarget(ex, '') : 30;
                if (!ex.targetReps || /^\d+\s*-\s*\d+$/.test(String(ex.targetReps).trim()) || (!/\b(sn|saniye|sec)\b/i.test(String(ex.targetReps)) && Number(ex.targetReps) < 15)) {
                    ex.targetReps = `${defSec} sn`;
                    repaired = true;
                }
            }
            filteredExercises.push(ex);
        }

        if (filteredExercises.length === 0) {
            recordCustomsEvent('rejected', 'generator', 'Tüm hareketleri geçersiz/gizli program engellendi');
            return null;
        }
        cleanWorkout.exercises = filteredExercises;
        if (!cleanWorkout.id) {
            cleanWorkout.id = 'gen_' + Date.now();
            repaired = true;
        }
        if (repaired) {
            recordCustomsEvent('repaired', 'generator', cleanWorkout.id);
        }
        return cleanWorkout;
    }

    function sanitizeActiveSession(session) {
        if (!session || typeof session !== 'object' || !Array.isArray(session.exercises) || session.exercises.length === 0) {
            recordCustomsEvent('rejected', 'active_workout', 'Boş aktif antrenman oturumu engellendi');
            return null;
        }
        return session;
    }

    function sanitizeScaleEntry(entry) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            recordCustomsEvent('rejected', 'scale', 'Geçersiz tartı kaydı');
            return null;
        }
        const w = parseFloat(entry.weight);
        if (isNaN(w) || !isFinite(w) || w < 25 || w > 300) {
            recordCustomsEvent('rejected', 'scale', `Geçersiz kilo değeri (${entry.weight})`);
            return null;
        }
        const dateCheck = toIsoDateFallback(entry.date, entry.timestamp);
        if (!dateCheck.iso) {
            recordCustomsEvent('rejected', 'scale', 'Geçersiz tartı tarihi');
            return null;
        }
        let repaired = dateCheck.repaired;
        const clean = Object.assign({}, entry);
        clean.weight = Math.round(w * 100) / 100;
        if (!clean.id) {
            clean.id = 'scale_' + (Number(entry.timestamp) || Date.now());
            repaired = true;
        }
        if (clean.date !== dateCheck.iso) {
            clean.date = dateCheck.iso;
            repaired = true;
        }
        if (!clean.timestamp || isNaN(Number(clean.timestamp)) || Number(clean.timestamp) <= 0) {
            const dObj = new Date(dateCheck.iso + 'T09:00:00');
            clean.timestamp = !isNaN(dObj.getTime()) ? dObj.getTime() : Date.now();
            repaired = true;
        }
        if (repaired) recordCustomsEvent('repaired', 'scale', clean.id);
        return clean;
    }

    function sanitizeScaleLogsList(logs) {
        if (!Array.isArray(logs)) return [];
        return logs.map(sanitizeScaleEntry).filter(Boolean);
    }

    function sanitizeMeasurementEntry(entry) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            recordCustomsEvent('rejected', 'measurements', 'Geçersiz mezura kaydı');
            return null;
        }
        let validCount = 0;
        let repaired = false;
        const clean = Object.assign({}, entry);
        for (const k of MEAS_FIELDS) {
            if (clean[k] === null || clean[k] === undefined || clean[k] === '') {
                clean[k] = null;
                continue;
            }
            const v = parseFloat(clean[k]);
            if (!isNaN(v) && isFinite(v) && v >= 10 && v <= 250) {
                clean[k] = Math.round(v * 10) / 10;
                validCount++;
            } else {
                clean[k] = null;
                repaired = true;
            }
        }
        if (validCount === 0) {
            recordCustomsEvent('rejected', 'measurements', 'Tüm ölçü alanları boş/geçersiz mezura kaydı');
            return null;
        }
        const dateCheck = toIsoDateFallback(entry.date, entry.timestamp);
        if (!dateCheck.iso) {
            recordCustomsEvent('rejected', 'measurements', 'Geçersiz mezura tarihi');
            return null;
        }
        if (dateCheck.repaired || clean.date !== dateCheck.iso) {
            clean.date = dateCheck.iso;
            repaired = true;
        }
        if (!clean.id) {
            clean.id = 'meas_' + (Number(entry.timestamp) || Date.now());
            repaired = true;
        }
        if (!clean.timestamp || isNaN(Number(clean.timestamp)) || Number(clean.timestamp) <= 0) {
            const dObj = new Date(dateCheck.iso + 'T09:00:00');
            clean.timestamp = !isNaN(dObj.getTime()) ? dObj.getTime() : Date.now();
            repaired = true;
        }
        if (repaired) recordCustomsEvent('repaired', 'measurements', clean.id);
        return clean;
    }

    function sanitizeMeasurementLogsList(logs) {
        if (!Array.isArray(logs)) return [];
        return logs.map(sanitizeMeasurementEntry).filter(Boolean);
    }

    function sanitizeCloudExportBundle(obj, depth = 0) {
        if (depth > 8 || obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeCloudExportBundle(item, depth + 1));
        }
        const out = {};
        let stripped = false;
        for (const [k, v] of Object.entries(obj)) {
            if (PROTO_KEYS.has(k)) continue;
            if (isSensitiveSecretEntry(k, v)) {
                stripped = true;
                continue;
            }
            out[k] = sanitizeCloudExportBundle(v, depth + 1);
        }
        if (stripped) {
            recordCustomsEvent('repaired', 'cloud_security', 'Gizli anahtar/parola alanı temizlendi');
        }
        return out;
    }

    function getStats() {
        return {
            repairedCount: stats.repairedCount,
            rejectedCount: stats.rejectedCount,
            lastEvents: stats.lastEvents.slice()
        };
    }

    function resetStats() {
        stats.repairedCount = 0;
        stats.rejectedCount = 0;
        stats.lastEvents = [];
    }

    const api = {
        sanitizeWorkoutLogEntry,
        sanitizeWorkoutLogsList,
        sanitizeGeneratedWorkoutPayload,
        sanitizeActiveSession,
        sanitizeScaleEntry,
        sanitizeScaleLogsList,
        sanitizeMeasurementEntry,
        sanitizeMeasurementLogsList,
        sanitizeCloudExportBundle,
        getStats,
        resetStats
    };

    if (globalScope) {
        globalScope.CelikBridgeCustoms = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
