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
        try {
            if (typeof recordTelemetryEvent === 'function') {
                recordTelemetryEvent({
                    gate: 'K1',
                    severity: type === 'rejected' ? 'error' : 'warn',
                    module: 'Köprü Gümrüğü',
                    action: String(bridge || 'Veri Geçişi'),
                    inputSummary: String(bridge || 'Veri Geçişi'),
                    outcome: String(detail || (type === 'rejected' ? 'Bozuk veri engellendi' : 'Eksik alan onarıldı'))
                });
            }
        } catch {}
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
            if (workout.equipmentWarning || workout.fatigueWarning) {
                const blockedCopy = Object.assign({}, workout, { exercises: [], isBlockedEmpty: true });
                if (!blockedCopy.id) blockedCopy.id = 'gen_' + Date.now();
                return blockedCopy;
            }
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
            if (cleanWorkout.equipmentWarning || cleanWorkout.fatigueWarning) {
                cleanWorkout.exercises = [];
                cleanWorkout.isBlockedEmpty = true;
                if (!cleanWorkout.id) cleanWorkout.id = 'gen_' + Date.now();
                return cleanWorkout;
            }
            recordCustomsEvent('rejected', 'generator', 'Tüm hareketleri geçersiz/gizli program engellendi');
            return null;
        }
        if (typeof enforceUniversalBiomechanicalOrder === 'function' && filteredExercises.length >= 2) {
            const ordered = enforceUniversalBiomechanicalOrder(filteredExercises, cleanWorkout.style || 'superset');
            const changedOrder = ordered.some((e, i) => e !== filteredExercises[i]);
            if (changedOrder && typeof assignAcademicBlockStructure === 'function') {
                cleanWorkout.exercises = assignAcademicBlockStructure(ordered, cleanWorkout.style || 'superset', cleanWorkout.scheme || null);
                repaired = true;
            } else {
                cleanWorkout.exercises = ordered;
            }
        } else {
            cleanWorkout.exercises = filteredExercises;
        }
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

    // ==================== 4 KAPILI KARA KUTU (MODÜLER SİSTEM İZLEME MOTORU) ====================
    const TELEMETRY_STORAGE_PREFIX = 'celik_kodu_system_telemetry_';
    const TELEMETRY_UIDS_INDEX_KEY = 'celik_kodu_telemetry_uids';
    const TELEMETRY_MAX_EVENTS_PER_USER = 50;
    const TELEMETRY_DEDUP_WINDOW_MS = 5000;
    const VALID_TELEMETRY_GATES = new Set(['K1', 'K2', 'K3', 'K4']);
    const EXTRA_TELEMETRY_SECRET_KEYS = new Set(['syncseal', 'sealedtredict', 'sealedintervals', 'sealedgateway', 'sealedaikey', 'sealref']);
    let isRecordingTelemetry = false;

    function resolveTelemetryUid(uidOverride) {
        const cleanOverride = String(uidOverride || '').trim();
        if (cleanOverride && !PROTO_KEYS.has(cleanOverride)) return cleanOverride.slice(0, 64);
        try {
            if (globalScope && typeof globalScope.getActiveUserId === 'function') {
                const u = globalScope.getActiveUserId();
                if (u) return String(u).trim().slice(0, 64);
            }
        } catch {}
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                const rawSess = localStorage.getItem('celik_kodu_session');
                if (rawSess) {
                    const s = JSON.parse(rawSess);
                    if (s && s.userId) return String(s.userId).trim().slice(0, 64);
                }
                const aid = localStorage.getItem('celik_kodu_active_user_id');
                if (aid) return String(aid).trim().slice(0, 64);
            }
        } catch {}
        return 'guest';
    }

    function resolveTelemetryUserName(uid, nameOverride) {
        const cleanName = String(nameOverride || '').trim();
        if (cleanName) return cleanName.slice(0, 80);
        try {
            if (globalScope && typeof globalScope.getActiveUser === 'function') {
                const u = globalScope.getActiveUser();
                if (u && (!uid || u.id === uid)) {
                    const nm = String(u.name || u.username || '').trim();
                    if (nm) return nm.slice(0, 80);
                }
            }
        } catch {}
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                const rawUsers = localStorage.getItem('celik_kodu_auth_users');
                if (rawUsers) {
                    const arr = JSON.parse(rawUsers);
                    if (Array.isArray(arr)) {
                        const found = arr.find(u => u && String(u.id) === String(uid));
                        if (found) {
                            const nm = String(found.name || found.username || '').trim();
                            if (nm) return nm.slice(0, 80);
                        }
                    }
                }
                const rawSess = localStorage.getItem('celik_kodu_session');
                if (rawSess) {
                    const s = JSON.parse(rawSess);
                    if (s && String(s.userId) === String(uid) && (s.name || s.username)) {
                        return String(s.name || s.username).trim().slice(0, 80);
                    }
                }
            }
        } catch {}
        return String(uid || 'Sporcu').slice(0, 80);
    }

    function stripTelemetrySecretKeysDeep(val, depth = 0) {
        if (depth > 6 || val === null || val === undefined) return val;
        if (typeof val === 'string') return maskTelemetryString(val);
        if (typeof val !== 'object') return val;
        if (Array.isArray(val)) {
            return val.slice(0, 30).map(item => stripTelemetrySecretKeysDeep(item, depth + 1));
        }
        const clean = {};
        for (const [k, v] of Object.entries(val)) {
            if (PROTO_KEYS.has(k)) continue;
            const kl = String(k || '').toLowerCase();
            if (isSensitiveSecretEntry(k, v) || EXTRA_TELEMETRY_SECRET_KEYS.has(kl)) {
                clean[k] = '[GİZLİ]';
                continue;
            }
            if (v !== undefined) {
                clean[k] = stripTelemetrySecretKeysDeep(v, depth + 1);
            }
        }
        return clean;
    }

    function maskTelemetryString(raw) {
        let s = String(raw === undefined || raw === null ? '' : raw);
        if (!s) return '';
        s = s.replace(/([?&](?:key|api_key|apikey|token|access_token|secret|password)=)[^&\s]+/gi, '$1[GİZLİ]');
        s = s.replace(/AIza[0-9A-Za-z_-]{10,}/g, '[GEMINI_ANAHTARI_GİZLİ]');
        s = s.replace(/sk-[0-9A-Za-z_-]{10,}/g, '[API_ANAHTARI_GİZLİ]');
        s = s.replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{6,}/gi, '[YETKİ_ANAHTARI_GİZLİ]');
        s = s.replace(/(?:password|passwordHash|salt|geminiApiKey|tredictToken|intervalsToken|apiKey|syncSeal|sealedTredict|sealedIntervals|sealedGateway|sealedAiKey)\s*[:=]\s*(?:'[^']*'|"[^"]*"|[^\s,'"}]+)/gi, '[GİZLİ_ALAN]');
        return s;
    }

    function maskTelemetrySecrets(val) {
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') {
            try {
                const stripped = stripTelemetrySecretKeysDeep(val, 0);
                return maskTelemetryString(JSON.stringify(stripped));
            } catch {
                return '[Nesne]';
            }
        }
        return maskTelemetryString(String(val));
    }

    function resolveAppVersionTag() {
        try {
            if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
                const badge = document.getElementById('appVersionBadge');
                const txt = badge && String(badge.innerText || badge.textContent || '').trim();
                if (txt && /^v?\d+/i.test(txt)) {
                    return (txt.startsWith('v') || txt.startsWith('V')) ? txt.slice(0, 20) : ('v' + txt).slice(0, 20);
                }
            }
        } catch {}
        return 'v326';
    }

    function sanitizeTelemetryEvent(raw) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
        const gateRaw = String(raw.gate || 'K1').trim().toUpperCase();
        const gate = VALID_TELEMETRY_GATES.has(gateRaw) ? gateRaw : 'K1';
        const severity = raw.severity === 'error' ? 'error' : 'warn';
        const uid = resolveTelemetryUid(raw.uid);
        const userName = maskTelemetrySecrets(resolveTelemetryUserName(uid, raw.userName)).slice(0, 80) || uid;
        const mod = maskTelemetrySecrets(raw.module || 'Sistem').trim().slice(0, 80) || 'Sistem';
        const action = maskTelemetrySecrets(raw.action || 'İşlem').trim().slice(0, 120) || 'İşlem';
        const inputSummary = maskTelemetrySecrets(raw.inputSummary || '').trim().slice(0, 240);
        const outcome = maskTelemetrySecrets(raw.outcome || '').trim().slice(0, 300) || (severity === 'error' ? 'İşlem başarısız oldu' : 'Veri otomatik onarıldı');
        const appVersion = maskTelemetrySecrets(raw.appVersion || resolveAppVersionTag()).trim().slice(0, 20) || 'v326';
        const atNum = Number(raw.at);
        const at = (Number.isFinite(atNum) && atNum > 0) ? Math.round(atNum) : Date.now();
        const repNum = Number(raw.repeatCount);
        const repeatCount = (Number.isFinite(repNum) && repNum >= 1) ? Math.min(999, Math.round(repNum)) : 1;
        const idRaw = String(raw.id || '').trim();
        const id = (idRaw && idRaw.length <= 100)
            ? idRaw
            : ('tel_' + at + '_' + Math.random().toString(36).slice(2, 6));

        return {
            id,
            uid,
            userName,
            gate,
            severity,
            module: mod,
            action,
            inputSummary,
            outcome,
            appVersion,
            repeatCount,
            at,
            status: 'open'
        };
    }

    function readTelemetryUidIndex() {
        try {
            if (typeof localStorage === 'undefined' || !localStorage) return [];
            const raw = localStorage.getItem(TELEMETRY_UIDS_INDEX_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.map(x => String(x || '').trim()).filter(Boolean) : [];
        } catch {
            return [];
        }
    }

    function writeTelemetryUidIndex(uids) {
        try {
            if (typeof localStorage === 'undefined' || !localStorage) return;
            const clean = Array.from(new Set((uids || []).map(x => String(x || '').trim()).filter(Boolean))).slice(0, 200);
            if (clean.length > 0) {
                localStorage.setItem(TELEMETRY_UIDS_INDEX_KEY, JSON.stringify(clean));
            } else {
                localStorage.removeItem(TELEMETRY_UIDS_INDEX_KEY);
            }
        } catch {}
    }

    function getEventsForUser(uidOverride) {
        const uid = resolveTelemetryUid(uidOverride);
        try {
            if (typeof localStorage === 'undefined' || !localStorage) return [];
            const raw = localStorage.getItem(`${TELEMETRY_STORAGE_PREFIX}${uid}`);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return [];
            return arr.map(sanitizeTelemetryEvent).filter(Boolean).slice(0, TELEMETRY_MAX_EVENTS_PER_USER);
        } catch {
            return [];
        }
    }

    function setEventsForUser(uidOverride, events) {
        const uid = resolveTelemetryUid(uidOverride);
        const cleanList = Array.isArray(events)
            ? events.map(e => sanitizeTelemetryEvent(Object.assign({}, e, { uid }))).filter(Boolean).slice(0, TELEMETRY_MAX_EVENTS_PER_USER)
            : [];
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                const key = `${TELEMETRY_STORAGE_PREFIX}${uid}`;
                const idxList = readTelemetryUidIndex();
                if (cleanList.length > 0) {
                    localStorage.setItem(key, JSON.stringify(cleanList));
                    if (!idxList.includes(uid)) {
                        idxList.push(uid);
                        writeTelemetryUidIndex(idxList);
                    }
                } else {
                    localStorage.removeItem(key);
                    writeTelemetryUidIndex(idxList.filter(u => u !== uid));
                }
            }
        } catch {}
        return cleanList;
    }

    function getAllLocalEventsAcrossUsers(knownUsers) {
        const uidSet = new Set(readTelemetryUidIndex());
        if (Array.isArray(knownUsers)) {
            knownUsers.forEach(u => {
                const id = typeof u === 'string' ? u : (u && u.id);
                if (id) uidSet.add(String(id).trim());
            });
        }
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                const rawUsers = localStorage.getItem('celik_kodu_auth_users');
                if (rawUsers) {
                    const parsedUsers = JSON.parse(rawUsers);
                    if (Array.isArray(parsedUsers)) {
                        parsedUsers.forEach(u => { if (u && u.id) uidSet.add(String(u.id).trim()); });
                    }
                }
                if (typeof localStorage.key === 'function' && typeof localStorage.length === 'number') {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (typeof k === 'string' && k.startsWith(TELEMETRY_STORAGE_PREFIX)) {
                            const uidPart = k.slice(TELEMETRY_STORAGE_PREFIX.length).trim();
                            if (uidPart) uidSet.add(uidPart);
                        }
                    }
                }
            }
        } catch {}
        uidSet.add(resolveTelemetryUid());

        const all = [];
        uidSet.forEach(u => {
            if (!u) return;
            const list = getEventsForUser(u);
            list.forEach(ev => all.push(ev));
        });
        all.sort((a, b) => Number(b.at || 0) - Number(a.at || 0));
        return all;
    }

    let isPageUnloading = false;
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window._celikKaraKutuLifecycleHooked) {
        window._celikKaraKutuLifecycleHooked = true;
        window.addEventListener('beforeunload', () => { isPageUnloading = true; });
        window.addEventListener('pagehide', () => { isPageUnloading = true; });
        window.addEventListener('pageshow', () => { isPageUnloading = false; });
    }

    function isBenignTransientTelemetry(payload) {
        if (!payload || typeof payload !== 'object') return false;
        const outcomeStr = String(payload.outcome || '');
        const inputStr = String(payload.inputSummary || '');
        const combined = outcomeStr + ' ' + inputStr;
        if (/\bsw\.js(?:\?v=[^\s]+)?\s+load\s+failed\b/i.test(combined)) return true;
        if (/Failed to update a ServiceWorker/i.test(combined)) return true;
        if (/\b(?:AbortError|The user aborted a request|Fetch is aborted)\b/i.test(combined)) return true;
        if (isPageUnloading && /\b(?:Load failed|Failed to fetch|NetworkError)\b/i.test(combined)) return true;
        return false;
    }

    function recordTelemetryEvent(payload) {
        if (isRecordingTelemetry || !payload || typeof payload !== 'object') return null;
        if (isBenignTransientTelemetry(payload)) return null;
        isRecordingTelemetry = true;
        try {
            const cleanEv = sanitizeTelemetryEvent(payload);
            if (!cleanEv) return null;
            const uid = cleanEv.uid;
            const events = getEventsForUser(uid);
            const head = events[0];
            if (
                head &&
                head.status === 'open' &&
                head.gate === cleanEv.gate &&
                head.module === cleanEv.module &&
                head.action === cleanEv.action &&
                head.outcome === cleanEv.outcome &&
                (cleanEv.at - Number(head.at || 0)) <= TELEMETRY_DEDUP_WINDOW_MS
            ) {
                head.repeatCount = Math.min(999, Number(head.repeatCount || 1) + 1);
                head.at = cleanEv.at;
                if (cleanEv.severity === 'error') head.severity = 'error';
            } else {
                events.unshift(cleanEv);
            }
            const saved = setEventsForUser(uid, events);
            try {
                if (globalScope && typeof globalScope.scheduleSystemTelemetryCloudSync === 'function') {
                    globalScope.scheduleSystemTelemetryCloudSync(uid);
                }
            } catch {}
            try {
                if (globalScope && typeof globalScope.updateAdminPendingBadges === 'function') {
                    globalScope.updateAdminPendingBadges();
                }
            } catch {}
            return saved[0] || cleanEv;
        } catch {
            return null;
        } finally {
            isRecordingTelemetry = false;
        }
    }

    function resolveTelemetryAction(criteria) {
        if (!criteria || typeof criteria !== 'object') return 0;
        const uid = resolveTelemetryUid(criteria.uid);
        const gateFilter = criteria.gate ? String(criteria.gate).trim().toUpperCase() : '';
        const modFilter = criteria.module ? String(criteria.module).trim() : '';
        const actionPrefix = criteria.actionPrefix ? String(criteria.actionPrefix).trim() : '';
        const inputMatch = criteria.inputMatch ? String(criteria.inputMatch).trim() : '';

        const events = getEventsForUser(uid);
        if (!events.length) return 0;
        let removedCount = 0;
        const remaining = events.filter(ev => {
            if (!ev || ev.severity !== 'error') return true;
            if (gateFilter && ev.gate !== gateFilter) return true;
            if (modFilter && ev.module !== modFilter) return true;
            if (actionPrefix && !String(ev.action || '').includes(actionPrefix)) return true;
            if (inputMatch && !String(ev.inputSummary || '').includes(inputMatch) && !String(ev.action || '').includes(inputMatch)) return true;
            removedCount++;
            return false;
        });

        if (removedCount > 0) {
            setEventsForUser(uid, remaining);
            try {
                if (globalScope && typeof globalScope.scheduleSystemTelemetryCloudSync === 'function') {
                    globalScope.scheduleSystemTelemetryCloudSync(uid);
                }
            } catch {}
            try {
                if (globalScope && typeof globalScope.updateAdminPendingBadges === 'function') {
                    globalScope.updateAdminPendingBadges();
                }
            } catch {}
        }
        return removedCount;
    }

    function removeTelemetryEvent(uidOverride, eventId) {
        const uid = resolveTelemetryUid(uidOverride);
        const targetId = String(eventId || '').trim();
        if (!targetId) return getEventsForUser(uid);
        const filtered = getEventsForUser(uid).filter(ev => ev.id !== targetId);
        const saved = setEventsForUser(uid, filtered);
        try {
            if (globalScope && typeof globalScope.scheduleSystemTelemetryCloudSync === 'function') {
                globalScope.scheduleSystemTelemetryCloudSync(uid);
            }
            if (globalScope && typeof globalScope.updateAdminPendingBadges === 'function') {
                globalScope.updateAdminPendingBadges();
            }
        } catch {}
        return saved;
    }

    function clearUserTelemetryEvents(uidOverride) {
        const uid = resolveTelemetryUid(uidOverride);
        setEventsForUser(uid, []);
        try {
            if (globalScope && typeof globalScope.updateAdminPendingBadges === 'function') {
                globalScope.updateAdminPendingBadges();
            }
        } catch {}
        return [];
    }

    function clearAllTelemetryEvents(knownUsers) {
        const uidSet = new Set(readTelemetryUidIndex());
        if (Array.isArray(knownUsers)) {
            knownUsers.forEach(u => {
                const id = typeof u === 'string' ? u : (u && u.id);
                if (id) uidSet.add(String(id).trim());
            });
        }
        try {
            if (typeof localStorage !== 'undefined' && localStorage) {
                const rawUsers = localStorage.getItem('celik_kodu_auth_users');
                if (rawUsers) {
                    const parsedUsers = JSON.parse(rawUsers);
                    if (Array.isArray(parsedUsers)) {
                        parsedUsers.forEach(u => { if (u && u.id) uidSet.add(String(u.id).trim()); });
                    }
                }
                if (typeof localStorage.key === 'function' && typeof localStorage.length === 'number') {
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (typeof k === 'string' && k.startsWith(TELEMETRY_STORAGE_PREFIX)) {
                            const uidPart = k.slice(TELEMETRY_STORAGE_PREFIX.length).trim();
                            if (uidPart) uidSet.add(uidPart);
                        }
                    }
                }
            }
        } catch {}
        uidSet.add(resolveTelemetryUid());
        uidSet.forEach(u => {
            if (u) setEventsForUser(u, []);
        });
        writeTelemetryUidIndex([]);
        try {
            if (globalScope && typeof globalScope.updateAdminPendingBadges === 'function') {
                globalScope.updateAdminPendingBadges();
            }
        } catch {}
        return true;
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window._celikKaraKutuGlobalHooked) {
        window._celikKaraKutuGlobalHooked = true;
        window.addEventListener('error', (ev) => {
            try {
                const msg = (ev && ev.message) || (ev && ev.error && ev.error.message) || 'Beklenmeyen çalışma zamanı hatası';
                const src = ev && ev.filename ? String(ev.filename).split('/').pop().split('?')[0] : 'sayfa';
                recordTelemetryEvent({
                    gate: 'K1',
                    severity: 'error',
                    module: 'Çalışma Zamanı',
                    action: 'Sayfa Hatası',
                    inputSummary: `${src}:${Number(ev?.lineno || 0)}`,
                    outcome: msg
                });
            } catch {}
        });
        window.addEventListener('unhandledrejection', (ev) => {
            try {
                const r = ev && ev.reason;
                const msg = (r && r.message) ? r.message : String(r || 'Beklenmeyen asenkron hata');
                recordTelemetryEvent({
                    gate: 'K1',
                    severity: 'error',
                    module: 'Çalışma Zamanı',
                    action: 'Asenkron İşlem Hatası',
                    inputSummary: 'Promise',
                    outcome: msg
                });
            } catch {}
        });
    }

    const karaKutuApi = {
        record: recordTelemetryEvent,
        getEventsForUser,
        setEventsForUser,
        getAllLocalEventsAcrossUsers,
        removeEvent: removeTelemetryEvent,
        resolveAction: resolveTelemetryAction,
        clearUserEvents: clearUserTelemetryEvents,
        clearAllEvents: clearAllTelemetryEvents,
        sanitizeEvent: sanitizeTelemetryEvent,
        maskSecrets: maskTelemetrySecrets,
        getAppVersion: resolveAppVersionTag,
        MAX_EVENTS_PER_USER: TELEMETRY_MAX_EVENTS_PER_USER
    };

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
        globalScope.CelikKaraKutu = karaKutuApi;
    }
})(typeof window !== 'undefined' ? window : globalThis);
