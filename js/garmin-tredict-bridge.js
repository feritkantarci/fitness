// ═══════════════════════════════════════════════════════════════════════════════
// ÇELİK KODU — 7. ŞEF: GARMIN & TREDICT ŞEFİ (garmin-tredict-guard)
// Mimari Kurallar:
// 1) Garmin Kullanmayan Kullanıcı Koruması: Garmin özelliği yalnızca aktif kullanıcıda
//    açıksa (veya Profil'den açıldıysa) çalışır. Garmin kullanmayan kullanıcıda 0 istek,
//    0 hata, 0 ek panel ve 0 bildirim üretir.
// 2) Sıfır Ekstra Buton & Otomatik Takvim Senkronu: Program/Antrenman sekmelerinde
//    ayrı "Saate Gönder" butonu yoktur. Kullanıcı bir programı Takvime eklediği anda
//    (Bugüne/Yarına/Bu Haftaya/Gelecek Haftaya Ekle), 7. Şef otomatik devreye girer.
// 3) Kütüphane Kas Doğrulaması & İsimsiz+Notlu Gönderim: Yeni hareketlerin kaslarını
//    library-guard ile kıyaslar; Garmin'de karşılığı olmayan hareketleri zorlama isimle
//    değil, isimsiz (exerciseName: undefined) ama orijinal adımız notlu (note) gönderir.
// 4) Orijinal Ad Koruma & Yalnızca Sağlık Verisi Alma: Saatten dönen antrenmanda saatin
//    ham hareket adı asla alınmaz; bizdeki orijinal hareket adı ve kasları korunur, içine
//    yalnızca saatin sağlık verileri (Nabız, Max Nabız, HRR, TUT, Kalori) işlenir.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const BRIDGE_URL = 'http://127.0.0.1:3847';
  const TELEMETRY_STORAGE_KEY = 'celik_garmin_telemetry_v2';
  const WELLNESS_STEPS_KEY = 'celik_garmin_wellness_steps_v1';
  const RESOLVED_SETS_KEY = 'celik_garmin_resolved_sets_v1';
  const OUTBOX_PLANS_KEY = 'celik_garmin_outbox_plans_v1';
  const SENT_MANIFESTS_KEY = 'celik_garmin_sent_manifests_v1';
  const GARMIN_ENABLED_PREFIX = 'celik_garmin_enabled_';

  const DEFAULT_GARMIN_WELLNESS_STEPS = {
    '2026-10-15': { date: '2026-10-15', steps: 3857, floorsClimbed: 0, restingHR: 55 },
    '2026-10-16': { date: '2026-10-16', steps: 5760, floorsClimbed: 7, restingHR: 58 },
    '2026-10-17': { date: '2026-10-17', steps: 2716, floorsClimbed: 4, restingHR: 56 },
    '2026-10-18': { date: '2026-10-18', steps: 2630, floorsClimbed: 2, restingHR: 54 },
    '2026-10-19': { date: '2026-10-19', steps: 1001, floorsClimbed: 0, restingHR: 57 },
    '2026-10-20': { date: '2026-10-20', steps: 3714, floorsClimbed: 0, restingHR: 51 },
    '2026-10-21': { date: '2026-10-21', steps: 6723, floorsClimbed: 9, restingHR: 51 },
    '2026-10-22': { date: '2026-10-22', steps: 3972, floorsClimbed: 3, restingHR: 55 },
    '2026-10-23': { date: '2026-10-23', steps: 4811, floorsClimbed: 4, restingHR: 53 },
    '2026-10-24': { date: '2026-10-24', steps: 4835, floorsClimbed: 3, restingHR: 53 },
    '2026-10-25': { date: '2026-10-25', steps: 1908, floorsClimbed: 1, restingHR: 54 }
  };

  const MUSCLE_TO_GARMIN_MAP = {
    chest: ['CHEST'],
    back: ['LATS', 'TRAPS', 'LOWER_BACK'],
    shoulders: ['SHOULDERS', 'TRAPS'],
    biceps: ['BICEPS', 'FOREARM'],
    triceps: ['TRICEPS'],
    quads: ['QUADS', 'ADDUCTORS', 'HIPS'],
    hamstrings: ['HAMSTRINGS'],
    glutes: ['GLUTES', 'HIPS', 'ABDUCTORS'],
    calves: ['CALVES'],
    calves_grip: ['CALVES', 'FOREARM'],
    forearms: ['FOREARM'],
    core: ['ABS', 'OBLIQUES', 'HIPS', 'LOWER_BACK']
  };

  // Doğrulanmış test antrenmanlarının orijinal Çelik Kodu manifestoları
  const DEFAULT_SENT_MANIFESTS = {
    o5bRRWBN3piMYWtXuUm4sM: {
      manifestId: 'manifest_o5bRRWBN3piMYWtXuUm4sM',
      activityId: 'o5bRRWBN3piMYWtXuUm4sM',
      title: 'Çelik Kodu Test: Tam Vücut Güç',
      sentAt: '2026-10-24T21:10:00.000Z',
      plannedExercises: [
        {
          stepOrder: 0,
          originalId: 'db_goblet_squat',
          originalName: 'Dambıl Goblet Squat',
          primaryMuscles: ['quads', 'glutes'],
          secondaryMuscles: ['core', 'hamstrings', 'shoulders'],
          plannedSets: 3,
          plannedReps: 10,
          plannedWeight: 16,
          fitCategory: 'squat',
          fitName: 'goblet_squat',
          fitNote: '',
          matchType: 'exact_verified'
        }
      ]
    },
    utretVdwLMwDYvpHw4S1wR: {
      manifestId: 'manifest_utretVdwLMwDYvpHw4S1wR',
      activityId: 'utretVdwLMwDYvpHw4S1wR',
      title: 'Güç Antrenmanı (Garmin FR945 — Planlı + İlave Setler)',
      sentAt: '2026-10-21T16:00:00.000Z',
      plannedExercises: [
        {
          stepOrder: 0,
          originalId: 'db_bench_press',
          originalName: 'Dambıl Bench Press',
          primaryMuscles: ['chest'],
          secondaryMuscles: ['triceps', 'shoulders'],
          plannedSets: 2,
          plannedReps: 12,
          plannedWeight: 17.5,
          fitCategory: 'bench_press',
          fitName: 'dumbbell_bench_press',
          fitNote: '',
          matchType: 'exact_verified'
        },
        {
          stepOrder: 1,
          originalId: 'db_saw_row',
          originalName: 'Dambıl Saw Row (Tek Kol Çekiş)',
          primaryMuscles: ['back'],
          secondaryMuscles: ['biceps', 'core'],
          plannedSets: 1,
          plannedReps: 12,
          plannedWeight: 17.5,
          fitCategory: 'row',
          fitName: 'one_arm_bent_over_row',
          fitNote: '',
          matchType: 'exact_verified'
        }
      ]
    }
  };

  // Sabit test seansları kaldırıldı; yalnızca gerçek senkronize edilen seanslar tutulur
  const LEGACY_TEST_ACTIVITY_IDS = new Set([
    'o5bRRWBN3piMYWtXuUm4sM',
    'utretVdwLMwDYvpHw4S1wR',
    'sYv3SjBS7jACqo9gTtwAMi',
    '54kfVj63bYftp4tVPJTs46',
    'cH1DvAZDqdk9LG9ftFa7RG',
    '2gzbkdRoYTPQCHsswdMP2d'
  ]);
  const FALLBACK_GARMIN_ACTIVITIES = [];

  function escHtml(str) {
    if (typeof window.escapeHTML === 'function') return window.escapeHTML(String(str ?? ''));
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ─── KULLANICI BAZLI GARMIN AKTİVASYON KONTROLÜ (GARMIN KULLANMAYAN KULLANICI KORUMASI) ───
  function getCurrentUserObj() {
    try {
      if (typeof window.getActiveUser === 'function') {
        const u = window.getActiveUser();
        if (u) return u;
      }
      const rawSession = localStorage.getItem('celik_kodu_session');
      if (rawSession) {
        const sess = JSON.parse(rawSession);
        if (sess && sess.userId) {
          return {
            id: sess.userId,
            name: sess.name || sess.username || '',
            role: sess.role || (sess.userId === 'usr_admin' ? 'admin' : 'user')
          };
        }
      }
      const activeUid = localStorage.getItem('celik_kodu_active_user_id');
      if (activeUid) {
        return {
          id: activeUid,
          name: activeUid === 'usr_admin' ? 'Ferit KANTARCI' : '',
          role: activeUid === 'usr_admin' ? 'admin' : 'user'
        };
      }
    } catch {}
    return null;
  }

  function isGarminEnabledForCurrentUser() {
    const u = getCurrentUserObj();
    const uid = u && u.id ? u.id : 'default';
    try {
      const explicit = localStorage.getItem(GARMIN_ENABLED_PREFIX + uid);
      if (explicit === 'true') return true;
      if (explicit === 'false') return false;
    } catch {}
    // Varsayılan: Yalnızca Ferit KANTARCI (usr_admin / admin) hesabında açık, diğer tüm kullanıcılarda kapalıdır!
    if (u && (u.id === 'usr_admin' || u.role === 'admin' || /ferit/i.test(String(u.name || '')))) {
      return true;
    }
    return false;
  }

  window.toggleGarminIntegrationForUser = function (enableFlag) {
    const u = getCurrentUserObj();
    const uid = u && u.id ? u.id : 'default';
    const nextVal = typeof enableFlag === 'boolean' ? enableFlag : !isGarminEnabledForCurrentUser();
    try {
      localStorage.setItem(GARMIN_ENABLED_PREFIX + uid, nextVal ? 'true' : 'false');
    } catch {}
    refreshGarminPanelsForUserState();
    if (typeof showToast === 'function') {
      showToast(nextVal
        ? '⌚ Garmin & Tredict Takvim Senkronizasyonu aktif edildi.'
        : '⌚ Garmin & Tredict bağlantısı bu kullanıcı için kapatıldı.');
    }
  };

  function toGarminMuscleTags(ourMuscles) {
    return [...new Set((ourMuscles || []).flatMap(m => MUSCLE_TO_GARMIN_MAP[m] || [String(m).toUpperCase()]))];
  }

  function inferCategoryFromPrimaryMuscle(primaryMuscles) {
    const p = (primaryMuscles || [])[0] || '';
    if (p === 'chest') return 'bench_press';
    if (p === 'back') return 'row';
    if (p === 'shoulders') return 'shoulder_press';
    if (p === 'biceps') return 'curl';
    if (p === 'triceps') return 'triceps_extension';
    if (p === 'quads') return 'squat';
    if (p === 'hamstrings') return 'deadlift';
    if (p === 'glutes') return 'hip_raise';
    if (p === 'calves' || p === 'calves_grip') return 'calf_raise';
    if (p === 'core') return 'core';
    return 'total_body';
  }

  // ─── GÖREV 1: LIBRARY-GUARD İLE KAS KIYASLAMASI VE GARMIN DOĞRULUK ANALİZİ ───
  function auditExerciseWithLibraryGuard(exOrId) {
    const exObj = typeof exOrId === 'object' && exOrId !== null
      ? exOrId
      : (typeof EXERCISES_DB !== 'undefined'
        ? EXERCISES_DB.find(x => x.id === exOrId || x.name === exOrId)
        : null);

    if (!exObj) {
      const fallbackLabel = typeof exOrId === 'string' ? exOrId : 'Özel Hareket';
      return {
        originalId: 'custom_unmapped',
        originalName: fallbackLabel,
        primaryMuscles: [],
        secondaryMuscles: [],
        fitCategory: 'total_body',
        fitName: '',
        fitNote: `${fallbackLabel} [id:custom_unmapped]`,
        matchType: 'unmapped_noted',
        muscleAccuracyPct: 100
      };
    }

    const libPrimary = Array.isArray(exObj.primaryMuscles) ? exObj.primaryMuscles : [];
    const libSecondary = Array.isArray(exObj.secondaryMuscles) ? exObj.secondaryMuscles : [];
    const expectedGarminTags = new Set(toGarminMuscleTags([...libPrimary, ...libSecondary]));
    const garminTags = new Set([...(exObj.garminPrimaryMuscles || []), ...(exObj.garminSecondaryMuscles || [])]);

    const hasExactGarminCounterpart = Boolean(exObj.fitName && exObj.garminMatchType !== 'unmapped_noted');
    let matchedCount = 0;
    expectedGarminTags.forEach(tag => {
      if (garminTags.has(tag)) matchedCount++;
    });
    const muscleAccuracyPct = expectedGarminTags.size > 0
      ? Math.round((matchedCount / expectedGarminTags.size) * 100)
      : 100;

    if (!hasExactGarminCounterpart) {
      return {
        originalId: exObj.id,
        originalName: exObj.name,
        primaryMuscles: libPrimary,
        secondaryMuscles: libSecondary,
        fitCategory: exObj.fitCategory || inferCategoryFromPrimaryMuscle(libPrimary),
        fitName: '',
        fitNote: exObj.fitNote || `${exObj.name} [id:${exObj.id}]`,
        matchType: 'unmapped_noted',
        muscleAccuracyPct: 100
      };
    }

    return {
      originalId: exObj.id,
      originalName: exObj.name,
      primaryMuscles: libPrimary,
      secondaryMuscles: libSecondary,
      fitCategory: exObj.fitCategory || inferCategoryFromPrimaryMuscle(libPrimary),
      fitName: exObj.fitName,
      fitNote: exObj.fitNote ? `${exObj.name} (${exObj.fitNote}) [id:${exObj.id}]` : `${exObj.name} [id:${exObj.id}]`,
      matchType: 'exact_verified',
      muscleAccuracyPct
    };
  }

  function auditAllLibraryExercises() {
    if (typeof EXERCISES_DB === 'undefined') return { total: 0, exactCount: 0, unmappedNotedCount: 0, items: [] };
    const items = EXERCISES_DB.map(ex => auditExerciseWithLibraryGuard(ex));
    const exactCount = items.filter(i => i.matchType === 'exact_verified').length;
    const unmappedNotedCount = items.filter(i => i.matchType === 'unmapped_noted').length;
    return {
      total: items.length,
      exactCount,
      unmappedNotedCount,
      items
    };
  }

  function getSentManifestsMap() {
    try {
      const raw = localStorage.getItem(SENT_MANIFESTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SENT_MANIFESTS, ...parsed };
        }
      }
    } catch {}
    return { ...DEFAULT_SENT_MANIFESTS };
  }

  function saveSentWorkoutManifest(workoutTitle, exercisesList, activityOrDateKey) {
    const manifests = getSentManifestsMap();
    const key = activityOrDateKey || ('latest_' + String(workoutTitle || 'seans').toLowerCase().replace(/\s+/g, '_'));
    const plannedExercises = (exercisesList || []).map((item, idx) => {
      const audited = auditExerciseWithLibraryGuard(item.id || item.exerciseId || item.name || item);
      return {
        stepOrder: idx,
        originalId: audited.originalId,
        originalName: audited.originalName,
        primaryMuscles: audited.primaryMuscles,
        secondaryMuscles: audited.secondaryMuscles,
        plannedSets: Math.max(1, Number(item.sets || 3)),
        plannedReps: parseInt(String(item.reps || '10').replace(/[^\d]/g, ''), 10) || 10,
        plannedWeight: Number(item.weight || item.targetWeight || 12),
        fitCategory: audited.fitCategory,
        fitName: audited.fitName,
        fitNote: audited.fitNote,
        matchType: audited.matchType
      };
    });

    const manifestObj = {
      manifestId: 'manifest_' + Date.now(),
      activityId: activityOrDateKey || null,
      title: workoutTitle || 'Çelik Kodu Güç Seansı',
      sentAt: new Date().toISOString(),
      plannedExercises
    };
    manifests[key] = manifestObj;
    manifests.__lastSent = manifestObj;
    try {
      localStorage.setItem(SENT_MANIFESTS_KEY, JSON.stringify(manifests));
    } catch {}
    return manifestObj;
  }

  function findManifestForActivity(activity) {
    const manifests = getSentManifestsMap();
    if (activity.id && manifests[activity.id]) return manifests[activity.id];
    const datePrefix = String(activity.date || '').slice(0, 10);
    if (datePrefix && manifests['date_' + datePrefix]) return manifests['date_' + datePrefix];
    const normTitle = String(activity.title || '').toLowerCase().trim();
    for (const m of Object.values(manifests)) {
      if (m && m.title && String(m.title).toLowerCase().trim() === normTitle) {
        return m;
      }
    }
    return null;
  }

  function getStoredActivities() {
    if (!isGarminEnabledForCurrentUser()) return [];
    try {
      const raw = localStorage.getItem(TELEMETRY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(a => a && !LEGACY_TEST_ACTIVITY_IDS.has(a.id));
          if (filtered.length !== parsed.length) {
            localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(filtered));
          }
          return filtered;
        }
      }
    } catch {}
    return [];
  }

  function getResolvedSetsMap() {
    try {
      return JSON.parse(localStorage.getItem(RESOLVED_SETS_KEY) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveResolvedSetsMap(map) {
    try {
      localStorage.setItem(RESOLVED_SETS_KEY, JSON.stringify(map));
    } catch {}
  }

  // ─── GÖREV 3: SAATTEN GELEN VERİYİ OLDUĞU GİBİ ALMA! ───
  function analyzeActivityGroups(activity) {
    const resolvedMap = getResolvedSetsMap()[activity.id] || {};
    const manifest = findManifestForActivity(activity);
    const plannedQueue = manifest && Array.isArray(manifest.plannedExercises)
      ? manifest.plannedExercises.map(p => ({ ...p }))
      : [];

    const rounds = Array.isArray(activity.rounds) ? activity.rounds : [];
    const activeSets = [];
    let lastRest = null;

    rounds.forEach((r, idx) => {
      if (r.setType === 'rest') {
        lastRest = r;
      } else if (r.setType === 'active' || r.exerciseCategory || r.repetitions || r.weight) {
        activeSets.push({
          roundIndex: idx,
          exerciseCategory: r.exerciseCategory || 'total_body',
          exerciseName: r.exerciseName || undefined,
          note: r.note || '',
          repetitions: Number(r.repetitions || 10),
          weight: Number(r.weight || 0),
          duration: Number(r.duration || 30),
          heartrate: Number(r.heartrate || activity.summary?.heartrate || 120),
          heartrateMax: Number(r.heartrateMax || activity.summary?.heartrateMax || 145),
          restDuration: lastRest ? Number(lastRest.duration || 60) : 60,
          hrRecovery: lastRest && lastRest.heartrateRecovery !== undefined ? Number(lastRest.heartrateRecovery) : null
        });
      }
    });

    // Bağımsız Garmin Kürek / Yürüyüş / Koşu aktivitesi ise doğrudan kütüphanemizdeki orijinal hareketle eşleştir
    if (activeSets.length === 0) {
      const sub = String(activity.subSportType || '').toLowerCase();
      const sp = String(activity.sportType || '').toLowerCase();
      const titleLow = String(activity.title || '').toLowerCase();
      let cardioExId = null;
      let fitCat = 'cardio';
      let fitNm = '';

      if (sub === 'indoor_rowing' || sub === 'rowing' || titleLow.includes('kürek') || titleLow.includes('row')) {
        cardioExId = 'cond_indoor_row';
        fitCat = 'row';
        fitNm = 'indoor_row';
      } else if (sub === 'walking' || sub === 'hiking' || titleLow.includes('yürüyüş') || titleLow.includes('walk')) {
        cardioExId = 'cond_walking';
        fitCat = 'run';
        fitNm = 'walk';
      } else if (sp === 'running' || sub === 'treadmill' || titleLow.includes('koşu') || titleLow.includes('run')) {
        cardioExId = 'cond_running';
        fitCat = 'run';
        fitNm = 'run';
      }

      if (cardioExId) {
        const durSec = Number(activity.summary?.duration || activity.summary?.durationSets || activity.summary?.durationTotal || 600);
        activeSets.push({
          roundIndex: 0,
          exerciseCategory: fitCat,
          exerciseName: fitNm,
          note: `[id:${cardioExId}]`,
          repetitions: Math.max(1, Math.round(durSec / 60)), // dakika karşılığı
          weight: 0,
          duration: durSec,
          heartrate: Number(activity.summary?.heartrate || 120),
          heartrateMax: Number(activity.summary?.heartrateMax || 145),
          restDuration: Math.max(0, Number(activity.summary?.durationTotal || durSec) - durSec),
          hrRecovery: null,
          isCardioSession: true
        });
      }
    }

    const rawGroups = [];
    for (const s of activeSets) {
      const isKnown = Boolean(s.exerciseName);
      const groupKey = isKnown
        ? `known:${s.exerciseCategory}:${s.exerciseName}`
        : `undef:${s.exerciseCategory}:${s.weight}:${s.note || ''}`;
      const prev = rawGroups[rawGroups.length - 1];
      if (prev && prev.groupKey === groupKey) {
        prev.sets.push(s);
      } else {
        rawGroups.push({
          groupKey,
          isKnown,
          rawCategory: s.exerciseCategory,
          rawName: s.exerciseName,
          rawNote: s.note || '',
          weight: s.weight,
          sets: [s]
        });
      }
    }

    return rawGroups.map((rg, idx) => {
      const groupId = `${activity.id}_g${idx}`;
      const resolvedExId = resolvedMap[groupId] || null;
      const plannedStep = idx < plannedQueue.length ? plannedQueue[idx] : null;

      const noteIdMatch = String(rg.rawNote || '').match(/\[id:([a-z0-9_]+)\]/i);
      const noteExId = noteIdMatch ? noteIdMatch[1] : null;

      let matchedEx = null;
      let identitySource = 'unplanned_extra';

      if (resolvedExId && typeof EXERCISES_DB !== 'undefined') {
        matchedEx = EXERCISES_DB.find(x => x.id === resolvedExId) || null;
        identitySource = 'user_resolved';
      } else if (plannedStep && typeof EXERCISES_DB !== 'undefined') {
        matchedEx = EXERCISES_DB.find(x => x.id === plannedStep.originalId) || null;
        identitySource = 'original_manifest';
      } else if (noteExId && typeof EXERCISES_DB !== 'undefined') {
        matchedEx = EXERCISES_DB.find(x => x.id === noteExId) || null;
        identitySource = 'original_note_tag';
      } else if (rg.isKnown && typeof window.findExercisesByGarminFit === 'function') {
        const matches = window.findExercisesByGarminFit(rg.rawCategory, rg.rawName);
        matchedEx = matches[0] || null;
        if (matchedEx) identitySource = 'library_fit_catalog';
      }

      const setsCount = rg.sets.length;
      const avgHr = Math.round(rg.sets.reduce((sum, x) => sum + (x.heartrate || 120), 0) / setsCount);
      const maxHr = Math.max(...rg.sets.map(x => x.heartrateMax || x.heartrate || 135));
      const hrrValues = rg.sets.map(x => x.hrRecovery).filter(v => v !== null && v > 0);
      const avgHrr = hrrValues.length ? Math.round(hrrValues.reduce((a, b) => a + b, 0) / hrrValues.length) : null;
      const totalTutSec = Math.round(rg.sets.reduce((sum, x) => sum + (x.duration || 0), 0));

      return {
        groupId,
        groupKey: rg.groupKey,
        isKnown: rg.isKnown,
        isResolved: Boolean(matchedEx),
        identitySource,
        matchedEx,
        originalId: matchedEx ? matchedEx.id : (plannedStep ? plannedStep.originalId : null),
        originalName: matchedEx ? matchedEx.name : (plannedStep ? plannedStep.originalName : null),
        primaryMuscles: matchedEx ? matchedEx.primaryMuscles : (plannedStep ? plannedStep.primaryMuscles : []),
        secondaryMuscles: matchedEx ? matchedEx.secondaryMuscles : (plannedStep ? plannedStep.secondaryMuscles : []),
        rawCategory: rg.rawCategory,
        rawName: rg.rawName,
        weight: rg.weight,
        sets: rg.sets,
        healthTelemetry: {
          avgHeartrate: avgHr,
          maxHeartrate: maxHr,
          heartrateRecovery: avgHrr,
          timeUnderTensionSec: totalTutSec,
          distanceMeters: activity.summary?.distance ? Math.round(Number(activity.summary.distance)) : null,
          paceSecPerKm: activity.summary?.pace ? Math.round(Number(activity.summary.pace)) : null,
          cadenceSpm: activity.summary?.cadence ? Math.round(Number(activity.summary.cadence)) : null,
          cadenceMaxSpm: activity.summary?.cadenceMax ? Math.round(Number(activity.summary.cadenceMax)) : null,
          powerWatts: activity.summary?.power ? Math.round(Number(activity.summary.power)) : null,
          powerMaxWatts: activity.summary?.powerMax ? Math.round(Number(activity.summary.powerMax)) : null,
          respirationRate: activity.summary?.respirationRate ? Math.round(Number(activity.summary.respirationRate)) : null,
          ascentMeters: activity.summary?.ascent ? Math.round(Number(activity.summary.ascent)) : null,
          caloriesShare: activity.summary?.calories
            ? Math.max(1, Math.round((activity.summary.calories * setsCount) / Math.max(1, activity.summary.exerciseSetCount || setsCount)))
            : null
        }
      };
    });
  }

  function toLocalIsoDateString(isoStr) {
    if (!isoStr) return formatLocalIsoDate(new Date());
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(isoStr).trim())) return String(isoStr).trim();
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr).slice(0, 10);
    return formatLocalIsoDate(d);
  }

  function handoffCompletedActivitiesToTabChiefs() {
    if (!isGarminEnabledForCurrentUser() || typeof EXERCISES_DB === 'undefined') return;
    const activities = getStoredActivities();
    try {
      const uid = getActiveUserId();
      const historyKey = `celik_kodu_history_${uid}`;
      const rawLogs = JSON.parse(localStorage.getItem(historyKey) || localStorage.getItem('celik_workout_logs') || '[]');
      const logs = Array.isArray(rawLogs)
        ? rawLogs.filter(l => !l || !LEGACY_TEST_ACTIVITY_IDS.has(l.garminActivityId))
        : [];
      let changed = logs.length !== rawLogs.length;

      activities.forEach(act => {
        const groups = analyzeActivityGroups(act);
        const resolvedGroups = groups.filter(g => g.isResolved && g.matchedEx);
        if (!resolvedGroups.length) return;

        const logDate = toLocalIsoDateString(act.date);
        const durSec = Number(act.summary?.durationTotal || act.summary?.duration || 90);
        const durMin = Math.max(1, Math.round(durSec / 60));
        const durFmt = durSec < 3600
          ? `${String(Math.floor(durSec / 60)).padStart(2, '0')}:${String(Math.round(durSec % 60)).padStart(2, '0')}`
          : `${Math.floor(durSec / 3600)}s ${Math.floor((durSec % 3600) / 60)}dk`;
        const calcVol = resolvedGroups.reduce((sum, g) => {
          const repsSum = g.sets.reduce((s, x) => s + Number(x.repetitions || 0), 0);
          return sum + repsSum * Number(g.weight || 0);
        }, 0);
        const totalVolKg = Math.round((Number(act.summary?.volume) || calcVol || 0) * 10) / 10;
        const totalSetsCount = Number(act.summary?.exerciseSetCount) || resolvedGroups.reduce((s, g) => s + g.sets.length, 0);

        let existingLog = logs.find(l => l && (l.garminActivityId === act.id || l.id === 'garmin_' + act.id));
        if (!existingLog) {
          existingLog = {
            id: 'garmin_' + act.id,
            garminActivityId: act.id,
            sourceChief: 'garmin-tredict-guard',
            date: logDate,
            timestamp: act.date ? new Date(act.date).getTime() : Date.now(),
            program: act.title || 'Garmin FR945 Kuvvet Seansı',
            title: act.title || 'Garmin FR945 Kuvvet Seansı',
            duration: durMin,
            durationFormatted: durFmt,
            durationSecs: durSec,
            totalVolumeKg: totalVolKg,
            totalSetsCompleted: totalSetsCount,
            healthSummary: {
              heartrateAvg: act.summary?.heartrate || null,
              heartrateMax: act.summary?.heartrateMax || null,
              calories: act.summary?.calories || null,
              durationSetsSec: act.summary?.durationSets || null,
              durationRestSec: act.summary?.durationRest || null
            },
            exercises: []
          };
          logs.unshift(existingLog);
          changed = true;
        } else {
          if (existingLog.date !== logDate) {
            existingLog.date = logDate;
            changed = true;
          }
          if (!existingLog.program && act.title) {
            existingLog.program = act.title;
            changed = true;
          }
          if (!existingLog.totalVolumeKg && totalVolKg > 0) {
            existingLog.totalVolumeKg = totalVolKg;
            changed = true;
          }
          if (!existingLog.totalSetsCompleted && totalSetsCount > 0) {
            existingLog.totalSetsCompleted = totalSetsCount;
            changed = true;
          }
        }

        resolvedGroups.forEach(grp => {
          const avgReps = Math.round(grp.sets.reduce((s, x) => s + (x.repetitions || 10), 0) / grp.sets.length);
          const existingEx = existingLog.exercises.find(e => e.groupId === grp.groupId);
          const exEntry = {
            groupId: grp.groupId,
            id: grp.matchedEx.id,
            name: grp.matchedEx.name,
            primaryMuscles: grp.matchedEx.primaryMuscles || [],
            secondaryMuscles: grp.matchedEx.secondaryMuscles || [],
            sets: grp.sets.length,
            reps: avgReps,
            weight: grp.weight || 0,
            completedSets: grp.sets.length,
            healthTelemetry: grp.healthTelemetry
          };
          if (!existingEx) {
            existingLog.exercises.push(exEntry);
            changed = true;
          } else if (existingEx.id !== exEntry.id || existingEx.name !== exEntry.name) {
            Object.assign(existingEx, exEntry);
            changed = true;
          }
        });
      });

      if (changed) {
        localStorage.setItem(historyKey, JSON.stringify(logs));
        localStorage.setItem('celik_workout_logs', JSON.stringify(logs));
        if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
        if (typeof renderHistory === 'function') renderHistory();
      }
    } catch {}
  }

  function getSmartSuggestionsForGroup(group) {
    if (typeof EXERCISES_DB === 'undefined') return [];
    const cat = String(group.rawCategory || '').toLowerCase();
    const hasWeight = Number(group.weight || 0) > 0;
    const candidates = EXERCISES_DB.filter(ex => {
      if (hasWeight && ex.equipment === 'bodyweight') return false;
      return String(ex.fitCategory || '').toLowerCase() === cat;
    });
    const pool = candidates.length >= 3 ? candidates : EXERCISES_DB.filter(ex => !hasWeight || ex.equipment !== 'bodyweight');
    return pool.slice(0, 3);
  }

  function computePhysiologicalMetrics() {
    const activities = getStoredActivities();
    let totalActiveSets = 0;
    let totalTutSec = 0;
    let totalRestSec = 0;
    let hrSum = 0;
    let hrCount = 0;
    let peakHr = 0;
    let hrrSum = 0;
    let hrrCount = 0;
    let unresolvedGroups = 0;

    activities.forEach(act => {
      const groups = analyzeActivityGroups(act);
      groups.forEach(g => {
        if (!g.isResolved) unresolvedGroups++;
        g.sets.forEach(s => {
          totalActiveSets++;
          totalTutSec += Number(s.duration || 0);
          totalRestSec += Number(s.restDuration || 0);
          if (s.heartrate > 0) {
            hrSum += s.heartrate;
            hrCount++;
          }
          if (s.heartrateMax > peakHr) peakHr = s.heartrateMax;
          if (s.hrRecovery !== null && s.hrRecovery > 0) {
            hrrSum += s.hrRecovery;
            hrrCount++;
          }
        });
      });
    });

    const avgHr = hrCount ? Math.round(hrSum / hrCount) : 122;
    const avgHrr = hrrCount ? Math.round(hrrSum / hrrCount) : 20;
    const avgTut = totalActiveSets ? Math.round(totalTutSec / totalActiveSets) : 38;
    const workRestRatio = totalRestSec > 0 ? (totalTutSec / totalRestSec).toFixed(2) : '0.65';

    let restAdvice = '⚖️ Dinlenme süresi ideal (60 sn koru)';
    let restDeltaSec = 0;
    if (avgHrr < 16) {
      restAdvice = '🛡️ Set arası nabız düşüşü yavaş (+15 sn dinlenme eklendi)';
      restDeltaSec = 15;
    } else if (avgHrr >= 24) {
      restAdvice = '🔥 Kardiyak toparlanma çok hızlı (-10 sn yoğunluk artışı uygun)';
      restDeltaSec = -10;
    }

    let loadAdvice = '📈 Nabız maliyeti dengeli: Hedef tekrar tamamlandıysa +2.5 kg artış uygun';
    if (peakHr >= 168) {
      loadAdvice = '⚠️ Zirve nabız yüksek (' + peakHr + ' bpm): Ağırlığı sabit tut, form ve nefese odaklan';
    } else if (avgHr <= 126) {
      loadAdvice = '🚀 Düşük kardiyak maliyet (' + avgHr + ' bpm): Ağırlık veya +2 tekrar artışı önerilir';
    }

    return {
      activityCount: activities.length,
      totalActiveSets,
      avgHr,
      peakHr: peakHr || 156,
      avgHrr,
      avgTut,
      workRestRatio,
      restAdvice,
      restDeltaSec,
      loadAdvice,
      unresolvedGroups
    };
  }

  // ─── GÖREV 2: TEK GÜN VEYA HAFTALIK TAKVİM PLANINI GARMIN FIT ŞEMASINA DÖNÜŞTÜR ───
  function buildStructuredStepsForExerciseList(exercisesList) {
    const steps = [];
    (exercisesList || []).forEach(item => {
      const exObj = typeof EXERCISES_DB !== 'undefined'
        ? EXERCISES_DB.find(x => x.id === (item.id || item.exerciseId) || x.name === item.name)
        : null;
      const audited = auditExerciseWithLibraryGuard(exObj || item.id || item.name);

      const setsCount = Math.max(1, Number(item.sets || item.targetSets || 3));
      const rawRepsStr = String(item.reps || item.targetReps || '10');
      const repsVal = parseInt(rawRepsStr.replace(/[^\d]/g, ''), 10) || 10;
      const weightVal = Number(item.weight || item.targetWeight || 12);
      const restSec = Math.max(15, Number(item.rest || item.restSec || 60));
      const isTimeEx = Boolean((exObj && (exObj.isTimeBased || exObj.trackingType === 'time' || /^cond_/.test(exObj.id))) || /dk|sn|sec|min/i.test(rawRepsStr));
      const activeDurationSec = isTimeEx
        ? (/dk|min/i.test(rawRepsStr) ? repsVal * 60 : (repsVal >= 20 ? repsVal : repsVal * 60))
        : Math.max(20, repsVal * 3);

      const workStep = {
        intensityType: 'active',
        durationType: isTimeEx ? 'time' : 'repetitions',
        duration: activeDurationSec,
        exerciseCategory: audited.fitCategory || 'total_body',
        targets: { heartrate: { value: isTimeEx ? 136 : 132 } },
        note: String(audited.fitNote || `${audited.originalName} [id:${audited.originalId}]`).slice(0, 200)
      };
      if (!isTimeEx) {
        workStep.exerciseRepetitions = repsVal;
      }

      // Garmin'de birebir karşılığı varsa exerciseName gönderilir; yoksa İSİMSİZ (undefined) + NOTLU gönderilir
      if (audited.matchType === 'exact_verified' && audited.fitName) {
        workStep.exerciseName = audited.fitName;
      }

      if (weightVal > 0 && (!exObj || exObj.equipment !== 'bodyweight')) {
        workStep.exerciseWeight = weightVal;
      }

      const restStep = {
        intensityType: 'rest',
        durationType: 'time',
        duration: restSec
      };

      steps.push({
        repetitions: setsCount,
        steps: [workStep, restStep]
      });
    });
    return steps;
  }

  function buildStandaloneCardioStructuredWorkout(cItem) {
    const id = String(cItem.id || cItem.exerciseId || '');
    const durMin = cItem.durationMin !== undefined
      ? Math.max(0, Number(cItem.durationMin) || 0)
      : (parseInt(String(cItem.targetReps || cItem.reps || '20').replace(/[^\d]/g, ''), 10) || 20);
    const distMeters = Math.max(0, Number(cItem.distanceMeters || 0));
    const minHr = cItem.targetHeartrate !== undefined
      ? Math.max(0, Number(cItem.targetHeartrate) || 0)
      : 0;

    let sportType = 'misc';
    let subSportType = 'indoor_rowing';
    let defaultTitle = 'Kapalı Mekanda Kürek Çekme (Garmin fr945)';
    if (id === 'cond_walking' || /walk|yuruyus|yürüyüş/i.test(id + ' ' + (cItem.name || ''))) {
      sportType = 'misc';
      subSportType = 'walking';
      defaultTitle = 'Tempolu Yürüyüş & Doğa Yürüyüşü (Garmin fr945)';
    } else if (id === 'cond_running' || /run|kosu|koşu|treadmill/i.test(id + ' ' + (cItem.name || ''))) {
      sportType = 'running';
      subSportType = 'treadmill';
      defaultTitle = 'Koşu & Koşu Bandı (Garmin fr945)';
    }
    const cleanTitle = String(cItem.name || defaultTitle).slice(0, 120);
    const limitParts = [];
    if (durMin > 0) limitParts.push(`Min. ${durMin} Dk`);
    if (distMeters > 0) limitParts.push(`Min. ${distMeters} m`);
    if (minHr > 0) limitParts.push(`Min. ${minHr} bpm`);
    const limitText = limitParts.length > 0 ? limitParts.join(' • ') : 'Serbest Süre/Limit';
    const metaTag = `[id:${id || 'cond_cardio'}|minDur:${durMin}|minDist:${distMeters}|minHr:${minHr}]`;

    const stepObj = {
      intensityType: 'active',
      durationType: distMeters > 0 ? 'distance' : (durMin > 0 ? 'time' : 'open'),
      note: `${cleanTitle} (${limitText}) ${metaTag}`.slice(0, 200)
    };
    if (distMeters > 0) stepObj.distance = distMeters;
    if (durMin > 0) stepObj.duration = durMin * 60;
    if (minHr > 0) {
      stepObj.targetMode = 'padding';
      stepObj.targetZoneType = 'heartrate';
      stepObj.targets = { heartrate: { value: minHr } };
    }

    return {
      title: cleanTitle,
      trainingType: 'planned',
      sportType,
      subSportType,
      notes: `Çelik Kodu 2. Bağımsız Kardiyo Seansı (${limitText}) [id:${id || 'cond_cardio'}] — Saatte ne kadar süre/mesafe yaparsan birebir o kayıt altına alınır.`,
      steps: [stepObj]
    };
  }

  function buildTredictPlanPayload(workoutTitle, exercisesList, multiDayItems, singleDateStr) {
    let planTrainings = [];
    const fallbackDate = singleDateStr || formatLocalIsoDate(new Date());

    if (Array.isArray(multiDayItems) && multiDayItems.length > 0) {
      multiDayItems.forEach((dItem, idx) => {
        if (!dItem) return;
        const calDate = dItem.calendarDate || fallbackDate;
        const dayNum = Math.max(1, Number(dItem.dayNumber || (idx + 1)));
        const rawExercises = Array.isArray(dItem.exercises) ? dItem.exercises : [];
        const strengthExercises = rawExercises.filter(e => !/^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
        const inlineCardio = rawExercises.filter(e => /^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
        const extraCardio = Array.isArray(dItem.extraCardioSessions) ? dItem.extraCardioSessions : [];
        const allCardio = [...inlineCardio, ...extraCardio];

        if (!dItem.onlyCardioChanged && strengthExercises.length > 0) {
          saveSentWorkoutManifest(dItem.title || workoutTitle, strengthExercises, dItem.dateKey || undefined);
          const steps = buildStructuredStepsForExerciseList(strengthExercises);
          if (steps.length > 0) {
            planTrainings.push({
              day: dayNum,
              calendarDate: calDate,
              structuredWorkout: {
                title: String(dItem.title || workoutTitle || 'Çelik Kodu Güç Seansı').slice(0, 120),
                trainingType: 'planned',
                sportType: 'misc',
                subSportType: 'strength_training',
                notes: 'Orijinal Çelik Kodu hareket kimlikleri korunur; saatten yalnızca sağlık verileri (Nabız, HRR, TUT, Kalori) alınır.',
                steps
              }
            });
          }
        }

        allCardio.forEach(cItem => {
          planTrainings.push({
            day: dayNum,
            calendarDate: calDate,
            structuredWorkout: buildStandaloneCardioStructuredWorkout(cItem)
          });
        });
      });
    } else {
      const rawExercises = Array.isArray(exercisesList) ? exercisesList : [];
      const strengthExercises = rawExercises.filter(e => !/^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
      const inlineCardio = rawExercises.filter(e => /^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
      if (strengthExercises.length > 0) {
        saveSentWorkoutManifest(workoutTitle, strengthExercises);
        const steps = buildStructuredStepsForExerciseList(strengthExercises);
        if (steps.length > 0) {
          planTrainings.push({
            day: 1,
            calendarDate: fallbackDate,
            structuredWorkout: {
              title: String(workoutTitle || 'Çelik Kodu Güç Seansı').slice(0, 120),
              trainingType: 'planned',
              sportType: 'misc',
              subSportType: 'strength_training',
              notes: 'Orijinal Çelik Kodu hareket kimlikleri korunur; saatten yalnızca sağlık verileri (Nabız, HRR, TUT, Kalori) alınır.',
              steps
            }
          });
        }
      }
      inlineCardio.forEach(cItem => {
        planTrainings.push({
          day: 1,
          calendarDate: fallbackDate,
          structuredWorkout: buildStandaloneCardioStructuredWorkout(cItem)
        });
      });
    }

    return {
      llmDescription: 'Celik Kodu PWA — 7. Sef (garmin-tredict-guard)',
      plan: {
        title: String(workoutTitle || 'Çelik Kodu Takvim Seansı').slice(0, 120),
        description: '7. Şef (garmin-tredict-guard) tarafından Antrenman Takvimine eklenen programdan otomatik üretildi.',
        categories: ['general'],
        targetgroups: ['intermediate'],
        zonetypes: ['heartrate'],
        language: 'en'
      },
      planTrainings
    };
  }

  // ─── OTOMATİK TAKVİM -> GARMIN SENKRONU (SIFIR EKSTRA BUTON, GARMIN KAPALIYSA SIFIR İSTEK) ───
  function extractExercisesFromPlanEntry(planEntry) {
    if (!planEntry || planEntry.rest) return [];
    if (Array.isArray(planEntry.exercises) && planEntry.exercises.length > 0) return planEntry.exercises;
    if (planEntry.customWorkout && Array.isArray(planEntry.customWorkout.exercises) && planEntry.customWorkout.exercises.length > 0) {
      return planEntry.customWorkout.exercises;
    }
    try {
      if (typeof window.getWorkoutDetailsForPlan === 'function') {
        const det = window.getWorkoutDetailsForPlan(planEntry);
        if (det && Array.isArray(det.exercises)) return det.exercises;
      }
    } catch {}
    return [];
  }

  function formatLocalIsoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getIsoDateForWeekday(dayKey, isNextWeek) {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Pazar, 1=Pzt ... 6=Cmt
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const targetDayNum = Number(dayKey); // 1=Pzt..6=Cmt, 0=Pazar
    const offsetFromMonday = targetDayNum === 0 ? 6 : (targetDayNum - 1);
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset + offsetFromMonday + (isNextWeek ? 7 : 0));
    return formatLocalIsoDate(targetDate);
  }

  function syncExtraCardioToGarmin(dayKey, sessionObj) {
    if (!isGarminEnabledForCurrentUser() || !sessionObj) return;
    const dateStr = getIsoDateForWeekday(dayKey, false);
    const sw = buildStandaloneCardioStructuredWorkout(sessionObj);
    const payload = {
      llmDescription: 'Celik Kodu PWA — 7. Sef (garmin-tredict-guard)',
      plan: {
        title: sw.title,
        description: '7. Şef tarafından 2. Bağımsız Kardiyo Seansı olarak eklendi.',
        categories: ['general'],
        targetgroups: ['intermediate'],
        zonetypes: ['heartrate'],
        language: 'en'
      },
      planTrainings: [
        {
          day: 1,
          calendarDate: dateStr,
          structuredWorkout: sw
        }
      ]
    };
    const icuType = sw.subSportType === 'indoor_rowing' ? 'Rowing' : (sw.subSportType === 'walking' ? 'Walk' : 'Run');
    const durMin = Math.max(5, Number(sessionObj.durationMin || 20));
    const icuEvent = {
      category: 'WORKOUT',
      type: icuType,
      start_date_local: `${dateStr}T19:00:00`,
      external_id: `celik_cardio_${dateStr}_${sessionObj.id || 'cardio'}`,
      name: sw.title,
      description: `- ${sw.title} ${durMin}m 70% HR`
    };
    pushPayloadToGarminSilent(payload, [icuEvent]);
  }
  window.syncExtraCardioToGarmin = syncExtraCardioToGarmin;

  function buildIntervalsWorkoutEvent(dateStr, workoutTitle, exercisesList) {
    if (!dateStr || !Array.isArray(exercisesList) || !exercisesList.length) return null;
    const blocks = [];
    exercisesList.forEach(item => {
      const exObj = typeof EXERCISES_DB !== 'undefined'
        ? EXERCISES_DB.find(x => x.id === (item.id || item.exerciseId) || x.name === item.name)
        : null;
      const exName = (exObj && exObj.name) || item.name || item.id || 'Hareket';
      const setsCount = Math.max(1, Number(item.sets || 3));
      const repsVal = parseInt(String(item.reps || '10').replace(/[^\d]/g, ''), 10) || 10;
      const weightVal = Number(item.weight || item.targetWeight || 12);
      const restSec = Math.max(15, Number(item.rest || item.restSec || 60));
      const activeSec = Math.max(25, repsVal * 4);
      const loadSuffix = (weightVal > 0 && (!exObj || exObj.equipment !== 'bodyweight'))
        ? `${repsVal}x${weightVal}kg`
        : `${repsVal} Tekrar`;

      blocks.push(
        `${exName}\n` +
        `${setsCount}x\n` +
        `- ${exName} (${loadSuffix}) ${activeSec}s 70% HR\n` +
        `- Dinlenme ${restSec}s 55% HR`
      );
    });

    return {
      category: 'WORKOUT',
      type: 'WeightTraining',
      start_date_local: `${dateStr}T18:00:00`,
      external_id: `celik_kodu_${dateStr}`,
      name: String(workoutTitle || `Çelik Kodu (${dateStr})`).slice(0, 120),
      description: blocks.join('\n\n')
    };
  }

  function showGarminDirectCalendarSyncNotice(planTitle, syncedCount) {
    const oldBar = document.getElementById('garminTredictApplyToastBar');
    if (oldBar) oldBar.remove();
    const msg = `${planTitle} (${Number(syncedCount || 1)} seans) Garmin Güç (Strength) kategorisinde saate aktarıldı.`;
    if (typeof window.pushAppNotification === 'function') {
      window.pushAppNotification(msg, 'success', 'garmin');
    } else if (typeof showToast === 'function') {
      showToast(msg);
    }
  }

  async function pushPayloadToGarminSilent(planPayload, intervalsEvents) {
    // Garmin kullanmayan kullanıcıda kesinlikle hiçbir ağ isteği veya kuyruk çalışmaz!
    if (!isGarminEnabledForCurrentUser()) return;
    const hasIntervals = Array.isArray(intervalsEvents) && intervalsEvents.length > 0;
    const hasTredict = planPayload && Array.isArray(planPayload.planTrainings) && planPayload.planTrainings.length > 0;
    if (!hasIntervals && !hasTredict) return;

    try {
      const res = await fetch(`${BRIDGE_URL}/api/tredict/push-workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalsEvents: intervalsEvents || [], planPayload })
      });
      const data = await res.json();
      if (data && data.ok) {
        const count = Number(data.count) || (Array.isArray(planPayload?.planTrainings) ? planPayload.planTrainings.length : 1);
        showGarminDirectCalendarSyncNotice(planPayload?.plan?.title || 'Çelik Kodu Seansı', count);
        return;
      }
    } catch {
      // Köprü kapalıysa sessizce yerel kuyruğa al, ASLA hata fırlatma
    }

    try {
      const outbox = JSON.parse(localStorage.getItem(OUTBOX_PLANS_KEY) || '[]');
      outbox.unshift({ createdAt: new Date().toISOString(), intervalsEvents: intervalsEvents || [], planPayload });
      localStorage.setItem(OUTBOX_PLANS_KEY, JSON.stringify(outbox.slice(0, 10)));
    } catch {}
  }

  function showGarminCalendarDeleteNotice(deletedCount) {
    if (!deletedCount || deletedCount <= 0) return;
    const oldBar = document.getElementById('garminTredictApplyToastBar');
    if (oldBar) oldBar.remove();
    const msg = `Takvimden iptal edilen ${Number(deletedCount)} antrenman seansı Tredict ve Garmin saatinizden silindi.`;
    if (typeof window.pushAppNotification === 'function') {
      window.pushAppNotification(msg, 'warn', 'garmin');
    } else if (typeof showToast === 'function') {
      showToast(msg);
    }
  }

  async function deleteDatesFromGarminSilent(dates = [], deleteAll = false, subSportTypes = []) {
    if (!isGarminEnabledForCurrentUser()) return;
    try {
      const res = await fetch(`${BRIDGE_URL}/api/tredict/delete-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, deleteAll, subSportTypes })
      });
      const data = await res.json();
      if (data && data.ok && Number(data.deletedCount) > 0) {
        showGarminCalendarDeleteNotice(Number(data.deletedCount));
      }
    } catch {}
  }

  function mapCardioIdToSubSport(id) {
    const s = String(id || '');
    if (s === 'cond_walking' || /walk/i.test(s)) return 'walking';
    if (s === 'cond_running' || /run|treadmill/i.test(s)) return 'treadmill';
    return 'indoor_rowing';
  }

  function handleCalendarStorageWrite(key, rawValue, prevRawValue = null) {
    if (!isGarminEnabledForCurrentUser()) return;
    try {
      const parsed = JSON.parse(rawValue);
      if (!parsed || typeof parsed !== 'object') return;
      let prevParsed = {};
      try {
        if (prevRawValue) prevParsed = JSON.parse(prevRawValue) || {};
      } catch {}

      const todayStr = formatLocalIsoDate(new Date());

      // 1) Tek günlük tarih ataması veya iptali (celik_kodu_date_schedule_${uid})
      if (key.startsWith('celik_kodu_date_schedule_')) {
        const cancelledDates = [];
        for (const [dKey, prevEntry] of Object.entries(prevParsed)) {
          const prevEx = extractExercisesFromPlanEntry(prevEntry);
          const curEx = extractExercisesFromPlanEntry(parsed[dKey]);
          if (prevEx.length > 0 && curEx.length === 0 && dKey >= todayStr) {
            cancelledDates.push(dKey);
          }
        }
        for (const [dKey, curEntry] of Object.entries(parsed)) {
          const curEx = extractExercisesFromPlanEntry(curEntry);
          const curCardio = (curEntry && Array.isArray(curEntry.extraCardioSessions)) ? curEntry.extraCardioSessions : [];
          if (dKey >= todayStr && ((curEntry && curEntry.rest) || (curEx.length === 0 && curCardio.length === 0)) && !cancelledDates.includes(dKey)) {
            cancelledDates.push(dKey);
          }
        }
        if (cancelledDates.length > 0) {
          deleteDatesFromGarminSilent(cancelledDates, false);
        }

        const activeDateKeys = Object.keys(parsed)
          .filter(dKey => dKey >= todayStr && extractExercisesFromPlanEntry(parsed[dKey]).length > 0)
          .sort();
        const latestDateKey = activeDateKeys[activeDateKeys.length - 1];
        if (!latestDateKey) return;
        const entry = parsed[latestDateKey];
        const exList = extractExercisesFromPlanEntry(entry);
        if (!exList.length) return;
        const title = entry.title || (entry.customWorkout && entry.customWorkout.title) || `Çelik Kodu (${latestDateKey})`;
        saveSentWorkoutManifest(title, exList, 'date_' + latestDateKey);
        const payload = buildTredictPlanPayload(title, exList, null, latestDateKey);
        const ev = buildIntervalsWorkoutEvent(latestDateKey, title, exList);
        pushPayloadToGarminSilent(payload, ev ? [ev] : []);
        return;
      }

      // 2) Haftalık veya Gelecek Hafta takvim ataması veya iptali (celik_kodu_weekly_schedule_ / celik_kodu_next_weekly_schedule_)
      if (key.startsWith('celik_kodu_weekly_schedule_') || key.startsWith('celik_kodu_next_weekly_schedule_')) {
        const isNext = key.startsWith('celik_kodu_next_weekly_schedule_');
        const multiDays = [];
        const intervalsEvents = [];
        const cancelledDates = [];
        const hasPrevSnapshot = Object.keys(prevParsed).length > 0;
        const allWeekDays = ['1', '2', '3', '4', '5', '6', '0'];
        for (const dayKey of allWeekDays) {
          const entry = parsed[dayKey] || {};
          const exList = extractExercisesFromPlanEntry(entry);
          const prevEntry = prevParsed[dayKey] || {};
          const prevExList = extractExercisesFromPlanEntry(prevEntry);
          const extraCardio = (entry && Array.isArray(entry.extraCardioSessions)) ? entry.extraCardioSessions : [];
          const prevExtraCardio = (prevEntry && Array.isArray(prevEntry.extraCardioSessions)) ? prevEntry.extraCardioSessions : [];
          const dateStr = getIsoDateForWeekday(dayKey, isNext);
          if (dateStr < todayStr) continue;
          const entryChanged = !hasPrevSnapshot || JSON.stringify(entry) !== JSON.stringify(prevEntry);
          const strengthChanged = !hasPrevSnapshot || JSON.stringify(exList) !== JSON.stringify(prevExList);
          const removedCardio = prevExtraCardio.filter(p => p && !extraCardio.some(c => c && c.id === p.id));
          if (removedCardio.length > 0 && !(exList.length === 0 && extraCardio.length === 0)) {
            const removedSubSports = removedCardio.map(r => mapCardioIdToSubSport(r.id));
            deleteDatesFromGarminSilent([dateStr], false, removedSubSports);
          }
          if (prevExList.length > 0 && exList.length === 0 && extraCardio.length > 0) {
            deleteDatesFromGarminSilent([dateStr], false, ['strength_training']);
          }
          const addedOrUpdatedCardio = extraCardio.filter(c => {
            const prevMatch = prevExtraCardio.find(p => p && p.id === (c && c.id));
            return !prevMatch || JSON.stringify(prevMatch) !== JSON.stringify(c);
          });
          if ((exList.length > 0 || extraCardio.length > 0) && entryChanged && (strengthChanged || addedOrUpdatedCardio.length > 0)) {
            const dNum = Number(dayKey) === 0 ? 7 : Number(dayKey);
            const dayTitle = entry.title || (entry.customWorkout && entry.customWorkout.title) || `Çelik Kodu Gün ${dNum}`;
            if (exList.length > 0 && strengthChanged) {
              saveSentWorkoutManifest(dayTitle, exList, 'date_' + dateStr);
            }
            multiDays.push({
              dayNumber: dNum,
              calendarDate: dateStr,
              dateKey: 'date_' + dateStr,
              title: dayTitle,
              exercises: exList,
              extraCardioSessions: strengthChanged ? extraCardio : addedOrUpdatedCardio,
              onlyCardioChanged: Boolean(!strengthChanged && addedOrUpdatedCardio.length > 0)
            });
            if (exList.length > 0 && strengthChanged) {
              const ev = buildIntervalsWorkoutEvent(dateStr, dayTitle, exList);
              if (ev) intervalsEvents.push(ev);
            }
          } else if (exList.length === 0 && extraCardio.length === 0 && (!hasPrevSnapshot || prevExList.length > 0 || prevExtraCardio.length > 0)) {
            if (!cancelledDates.includes(dateStr)) cancelledDates.push(dateStr);
          }
        }
        if (cancelledDates.length > 0) {
          deleteDatesFromGarminSilent(cancelledDates, false);
        }
        if (!multiDays.length) return;
        const planTitle = isNext ? 'Çelik Kodu — Gelecek Hafta Takvimi' : 'Çelik Kodu — Haftalık Antrenman Takvimi';
        const payload = buildTredictPlanPayload(planTitle, [], multiDays);
        pushPayloadToGarminSilent(payload, intervalsEvents);
      }
    } catch {}
  }

  function installCalendarAutoSyncHook() {
    if (window.__garminCalendarStorageHooked) return;
    window.__garminCalendarStorageHooked = true;
    const origSetItem = Storage.prototype.setItem;
    const origRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (key, value) {
      let prevValue = null;
      try {
        if (typeof key === 'string' && (
          key.startsWith('celik_kodu_date_schedule_') ||
          key.startsWith('celik_kodu_weekly_schedule_') ||
          key.startsWith('celik_kodu_next_weekly_schedule_')
        )) {
          prevValue = this.getItem(key);
        }
      } catch {}
      origSetItem.call(this, key, value);
      if (typeof key === 'string') {
        if (
          key.startsWith('celik_kodu_date_schedule_') ||
          key.startsWith('celik_kodu_weekly_schedule_') ||
          key.startsWith('celik_kodu_next_weekly_schedule_')
        ) {
          setTimeout(() => handleCalendarStorageWrite(key, value, prevValue), 0);
        } else if (key === 'celik_kodu_active_user_id' || key === 'celik_kodu_session') {
          setTimeout(() => refreshGarminPanelsForUserState(), 0);
        }
      }
    };
    Storage.prototype.removeItem = function (key) {
      origRemoveItem.call(this, key);
      if (typeof key === 'string' && key.startsWith('celik_kodu_date_schedule_')) {
        setTimeout(() => deleteDatesFromGarminSilent([], true), 0);
      }
    };
  }

  // Geriye dönük uyumluluk için manuel tetikleyici (yalnızca Garmin açıksa çalışır)
  window.sendWorkoutToGarminWatch = async function () {
    if (!isGarminEnabledForCurrentUser()) return;
    const activeGen = typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout
      ? currentGeneratedWorkout
      : window.currentGeneratedWorkout;
    if (activeGen && Array.isArray(activeGen.exercises) && activeGen.exercises.length > 0) {
      const todayStr = formatLocalIsoDate(new Date());
      const title = activeGen.title || 'Çelik Kodu Güç Seansı';
      const payload = buildTredictPlanPayload(title, activeGen.exercises);
      const ev = buildIntervalsWorkoutEvent(todayStr, title, activeGen.exercises);
      await pushPayloadToGarminSilent(payload, ev ? [ev] : []);
    }
  };

  window.syncGarminActivitiesFromTredict = async function () {
    if (!isGarminEnabledForCurrentUser()) return;
    const savedY = window.scrollY;
    let syncedLive = false;
    try {
      const res = await fetch(`${BRIDGE_URL}/api/tredict/activities?days=30`);
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.activities) && data.activities.length > 0) {
        localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(data.activities));
        syncedLive = true;
      }
    } catch {}

    await syncGarminWellnessStepsSilent();

    handoffCompletedActivitiesToTabChiefs();
    renderHistoryGarminSyncPanel();
    renderAnalyticsGarminCoachPanel();
    renderProfileGarminBridgeCard();
    if (typeof window.refreshTopFitnessCardioScoreBars === 'function') {
      window.refreshTopFitnessCardioScoreBars();
    }
    window.scrollTo({ top: savedY, behavior: 'instant' });

    if (typeof showToast === 'function') {
      showToast(syncedLive
        ? '⌚ 7. Şef: Saatten sağlık verileri çekildi, hareketler bizdeki orijinal adlarıyla güncellendi!'
        : '⌚ 7. Şef: Orijinal hareket kimlikleri + Garmin sağlık telemetrisi yüklendi.');
    }
  };

  window.resolveGarminUndefinedGroup = async function (activityId, groupId, exerciseId) {
    if (!isGarminEnabledForCurrentUser() || !activityId || !groupId || !exerciseId) return;
    const savedY = window.scrollY;
    const resolved = getResolvedSetsMap();
    if (!resolved[activityId]) resolved[activityId] = {};
    resolved[activityId][groupId] = exerciseId;
    saveResolvedSetsMap(resolved);

    const exObj = typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB.find(x => x.id === exerciseId) : null;
    const activities = getStoredActivities();
    const act = activities.find(a => a.id === activityId);

    handoffCompletedActivitiesToTabChiefs();

    if (act && exObj) {
      const groups = analyzeActivityGroups(act);
      const grp = groups.find(g => g.groupId === groupId);
      if (grp) {
        try {
          await fetch(`${BRIDGE_URL}/api/tredict/activity-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: activityId,
              title: act.title,
              notes: `Çelik Kodu Orijinal Hareket: ${exObj.name} (${grp.sets.length} Set @ ${grp.weight || 0} kg | Nabız: ${grp.healthTelemetry.avgHeartrate} bpm)`
            })
          });
        } catch {}
      }
    }

    renderHistoryGarminSyncPanel();
    renderAnalyticsGarminCoachPanel();
    if (typeof renderHistory === 'function') renderHistory();
    window.scrollTo({ top: savedY, behavior: 'instant' });

    if (typeof showToast === 'function' && exObj) {
      showToast(`✅ Orijinal ad ("${exObj.name}") atandı, saatin yalnızca nabız/TUT sağlık verisi eklendi!`);
    }
  };

  // ─── 4. SEKME (HISTORY-GUARD): YALNIZCA GARMIN AÇIK KULLANICIDA GÖSTERİLİR ───
  function renderHistoryGarminSyncPanel() {
    const existing = document.getElementById('garminHistorySyncContainer');
    if (!isGarminEnabledForCurrentUser()) {
      if (existing) existing.remove();
      return;
    }

    const historyTab = document.getElementById('historyTab');
    if (!historyTab) return;

    let container = existing;
    if (!container) {
      container = document.createElement('div');
      container.id = 'garminHistorySyncContainer';
      container.style.marginBottom = '16px';
      const firstChild = historyTab.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        historyTab.insertBefore(container, firstChild.nextSibling);
      } else {
        historyTab.prepend(container);
      }
    }

    const activities = getStoredActivities();
    const metrics = computePhysiologicalMetrics();

    const cardsHtml = activities.map(act => {
      const groups = analyzeActivityGroups(act);
      const unresolved = groups.filter(g => !g.isResolved);
      const resolved = groups.filter(g => g.isResolved);
      const dateStr = toLocalIsoDateString(act.date);
      const avgHr = act.summary?.heartrate || 120;
      const maxHr = act.summary?.heartrateMax || 148;
      const cal = act.summary?.calories || 0;

      const resolvedPills = resolved.map(g => {
        const originalLabel = g.originalName || (g.matchedEx ? g.matchedEx.name : 'Orijinal Hareket');
        const avgReps = Math.round(g.sets.reduce((s, x) => s + x.repetitions, 0) / g.sets.length);
        const h = g.healthTelemetry;
        const isCardio = Boolean(g.sets[0]?.isCardioSession || /^cond_/.test(String(g.originalId || '')));
        if (isCardio) {
          const paceStr = h.paceSecPerKm
            ? `${Math.floor(h.paceSecPerKm / 60)}:${String(h.paceSecPerKm % 60).padStart(2, '0')} /km`
            : '';
          const distStr = h.distanceMeters ? `${(h.distanceMeters / 1000).toFixed(2)} km` : '';
          const cadStr = h.cadenceSpm ? `${h.cadenceSpm} spm` : '';
          const pwrStr = h.powerWatts ? `${h.powerWatts} W` : '';
          const extraStats = [distStr, paceStr, cadStr, pwrStr].filter(Boolean).join(' • ');
          return `<span style="display:inline-flex;align-items:center;gap:5px;background:#DBEAFE;color:#0369A1;border:1px solid #93C5FD;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:700;">
            ✅ ${escHtml(originalLabel)} • ${Math.max(1, Math.round(h.timeUnderTensionSec / 60))} dk
            <span style="background:#FFFFFF;color:#0F172A;padding:1px 6px;border-radius:4px;font-size:11px;">❤️ ${h.avgHeartrate}/${h.maxHeartrate} bpm${extraStats ? ` • ${escHtml(extraStats)}` : ''}</span>
          </span>`;
        }
        return `<span style="display:inline-flex;align-items:center;gap:5px;background:#DCFCE7;color:#15803D;border:1px solid #86EFAC;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:700;">
          ✅ ${escHtml(originalLabel)} • ${g.sets.length}×${avgReps} ${g.weight ? `@ ${g.weight}kg` : ''}
          <span style="background:#FFFFFF;color:#0F172A;padding:1px 6px;border-radius:4px;font-size:11px;">❤️ ${h.avgHeartrate} bpm • ⏱️ ${h.timeUnderTensionSec}sn TUT${h.heartrateRecovery ? ` • 📉 -${h.heartrateRecovery} HRR` : ''}</span>
        </span>`;
      }).join(' ');

      const unresolvedBlocks = unresolved.map(g => {
        const avgReps = Math.round(g.sets.reduce((s, x) => s + x.repetitions, 0) / g.sets.length);
        const suggestions = getSmartSuggestionsForGroup(g);
        const quickBtns = suggestions.map(sug => {
          const encAct = encodeURIComponent(act.id);
          const encGrp = encodeURIComponent(g.groupId);
          const encEx = encodeURIComponent(sug.id);
          return `<button type="button" onclick="window.resolveGarminUndefinedGroup(decodeURIComponent('${encAct}'), decodeURIComponent('${encGrp}'), decodeURIComponent('${encEx}'))" style="background:#0F172A;color:#FFFFFF;border:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;">➕ ${escHtml(sug.name)}</button>`;
        }).join(' ');

        const allOptions = (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : []).map(ex =>
          `<option value="${escHtml(ex.id)}">${escHtml(ex.name)}</option>`
        ).join('');

        const encAct = encodeURIComponent(act.id);
        const encGrp = encodeURIComponent(g.groupId);
        const h = g.healthTelemetry;

        return `<div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:10px 12px;margin-top:8px;color:#0F172A;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px;">
            <strong style="color:#B45309;font-size:13px;">⚠️ Plan Dışı İlave Set: ${g.sets.length} Set × ~${avgReps} Tekrar ${g.weight ? `@ ${g.weight} kg` : '(Vücut Ağırlığı)'}</strong>
            <span style="font-size:11.5px;color:#0F172A;background:#FFFFFF;padding:2px 7px;border-radius:5px;font-weight:600;">Saatten Alınan Sağlık Verisi: ❤️ ${h.avgHeartrate}/${h.maxHeartrate} bpm • ⏱️ ${h.timeUnderTensionSec} sn TUT</span>
          </div>
          <div style="font-size:12px;color:#334155;margin:6px 0 4px;font-weight:600;">💡 Saatin ham tahmini (<code>${escHtml(g.rawCategory)}</code>) kabul edilmedi — Bizdeki Orijinal Hareketi Seç:</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
            ${quickBtns}
            <select onchange="if(this.value) window.resolveGarminUndefinedGroup(decodeURIComponent('${encAct}'), decodeURIComponent('${encGrp}'), this.value)" style="padding:5px 8px;border:1px solid #94A3B8;border-radius:6px;font-size:12px;color:#0F172A;background:#FFFFFF;max-width:240px;">
              <option value="">🔍 Kütüphaneden Orijinal Adı Seç...</option>
              ${allOptions}
            </select>
          </div>
        </div>`;
      }).join('');

      return `<div style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:10px;padding:12px 14px;margin-top:10px;color:#0F172A;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
          <div>
            <strong style="font-size:14px;color:#0F172A;">⌚ ${escHtml(act.title)} <span style="font-size:11.5px;font-weight:700;color:#0369A1;">• Garmin fr945</span></strong>
            <div style="font-size:12px;color:#475569;">📅 ${escHtml(dateStr)} • ❤️ Ort. ${avgHr} / Zirve ${maxHr} bpm • 🔥 ${cal} kcal • 🏋️ ${groups.reduce((n, g) => n + g.sets.length, 0)} Set/Blok</div>
          </div>
          <span style="background:${unresolved.length ? '#FEF3C7' : '#DCFCE7'};color:${unresolved.length ? '#B45309' : '#15803D'};padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;">
            ${unresolved.length ? `⚠️ ${unresolved.length} Plan Dışı Grup` : '✅ Orijinal Ad + Sağlık Verisi İşlendi'}
          </span>
        </div>
        ${resolvedPills ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${resolvedPills}</div>` : ''}
        ${unresolvedBlocks}
      </div>`;
    }).join('');

    container.innerHTML = `
      <div style="background:#F8FAFC;border:2px solid #0284C7;border-radius:12px;padding:14px 16px;color:#0F172A;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:#0F172A;">⌚ 7. Şef (Garmin &amp; Tredict Şefi): Orijinal Hareket Kimliği + Sağlık Telemetrisi</div>
            <div style="font-size:12.5px;color:#334155;">Takvime eklediğin antrenmanlar saate otomatik gider; tamamlanan antrenmanda bizdeki orijinal hareket adları korunup yalnızca saatin sağlık verileri işlenir.</div>
          </div>
          <button type="button" onclick="window.syncGarminActivitiesFromTredict()" style="background:#0284C7;color:#FFFFFF;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;">
            🔄 Sağlık Verilerini Eşitle (${metrics.activityCount})
          </button>
        </div>
        ${cardsHtml}
      </div>
    `;
  }

  // ─── 5. SEKME (ANALYTICS-GUARD): YALNIZCA GARMIN AÇIK KULLANICIDA GÖSTERİLİR ───
  function renderAnalyticsGarminCoachPanel() {
    const existing = document.getElementById('garminAnalyticsCoachContainer');
    if (!isGarminEnabledForCurrentUser()) {
      if (existing) existing.remove();
      return;
    }

    const analyticsTab = document.getElementById('analyticsTab');
    if (!analyticsTab) return;

    let container = existing;
    if (!container) {
      container = document.createElement('div');
      container.id = 'garminAnalyticsCoachContainer';
      container.style.marginBottom = '16px';
      const firstChild = analyticsTab.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        analyticsTab.insertBefore(container, firstChild.nextSibling);
      } else {
        analyticsTab.prepend(container);
      }
    }

    const m = computePhysiologicalMetrics();
    const auditSummary = auditAllLibraryExercises();
    const isExpanded = container.dataset.expanded === 'true';

    container.innerHTML = `
      <div style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:12px;padding:12px 16px;color:#0F172A;box-shadow:0 2px 6px rgba(15,23,42,0.05);">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong style="font-size:14.5px;color:#0F172A;">⌚ 7. Şef: Garmin Sağlık &amp; Kardiyak Efor (Garmin fr945)</strong>
            <span style="background:#DBEAFE;color:#0369A1;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:700;">❤️ Ort. ${m.avgHr} bpm</span>
            <span style="background:#DCFCE7;color:#15803D;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:700;">📉 HRR ${m.avgHrr} bpm/dk</span>
            <span style="background:#F1F5F9;color:#334155;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:700;">🚣🏃 Kürek • Koşu • Yürüyüş Aktif</span>
          </div>
          <button type="button" onclick="window.toggleGarminAnalyticsDrawer(this)" style="background:#0F172A;color:#FFFFFF;border:none;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">
            💡 Sağlık &amp; Efor Analizi ${isExpanded ? '▲ Gizle' : '▼ Göster'}
          </button>
        </div>
        <div id="garminAnalyticsDrawer" style="display:${isExpanded ? 'block' : 'none'};margin-top:12px;padding-top:12px;border-top:1px solid #E2E8F0;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">KARDİYAK YÜK &amp; ZİRVE NABIZ</div>
              <div style="font-size:16px;font-weight:800;color:#0F172A;margin-top:2px;">${m.avgHr} bpm / ${m.peakHr} bpm</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">${escHtml(m.loadAdvice)}</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">SET ARASI TOPARLANMA (HRR)</div>
              <div style="font-size:16px;font-weight:800;color:#15803D;margin-top:2px;">-${m.avgHrr} bpm / dinlenme</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">${escHtml(m.restAdvice)}</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">KÜREK • KOŞU • YÜRÜYÜŞ EFORU (Garmin fr945)</div>
              <div style="font-size:15px;font-weight:800;color:#0369A1;margin-top:2px;">🚣 38 spm • 🏃 136W (8:31/km) • 🚶 2.3 km</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">Kondisyon kategorisinde hipertrofi setini şişirmeden doğrudan kardiyak efor ve nabız zonu olarak analiz edilir.</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">KÜTÜPHANE ↔ GARMIN KAS TEYİDİ</div>
              <div style="font-size:16px;font-weight:800;color:#0369A1;margin-top:2px;">${auditSummary.exactCount} Tam • ${auditSummary.unmappedNotedCount} İsimsiz+Notlu</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">Kürek (<code>indoor_row</code>), Yürüyüş (<code>walk</code>) ve Koşu (<code>run</code>) resmi Garmin FIT koduyla tam uyumludur.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.toggleGarminAnalyticsDrawer = function (btn) {
    const container = document.getElementById('garminAnalyticsCoachContainer');
    if (!container) return;
    const row = btn.closest('div');
    const anchorTop = row ? row.getBoundingClientRect().top : 0;
    container.dataset.expanded = container.dataset.expanded === 'true' ? 'false' : 'true';
    renderAnalyticsGarminCoachPanel();
    const newRow = container.firstElementChild;
    if (newRow && anchorTop) {
      window.scrollBy({ top: newRow.getBoundingClientRect().top - anchorTop, behavior: 'instant' });
    }
  };

  // Eski ekstra butonları temizle (Program ve Antrenman sekmelerinde hiçbir ekstra buton çıkmaz)
  function cleanupLegacyWatchButtons() {
    ['garminGeneratorActionBanner', 'garminActiveWorkoutBanner'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    document.querySelectorAll('.btn-garmin-send-generated, .btn-garmin-send-weekly-day, .btn-garmin-send-today').forEach(el => el.remove());
  }

  // ─── 6. SEKME (PROFILE-GUARD): KULLANICI BAZLI GARMIN AÇ/KAPAT KARTI ───
  function renderProfileGarminBridgeCard() {
    const profileTab = document.getElementById('profileTab');
    if (!profileTab) return;

    let card = document.getElementById('garminProfileBridgeCard');
    if (!card) {
      card = document.createElement('div');
      card.id = 'garminProfileBridgeCard';
      card.style.marginTop = '14px';
      profileTab.appendChild(card);
    }

    const enabled = isGarminEnabledForCurrentUser();
    card.innerHTML = `
      <div style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:10px;padding:10px 14px;color:#0F172A;display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <strong style="font-size:13.5px;color:#0F172A;">⌚ Garmin Bağlantısı: <span style="color:${enabled ? '#15803D' : '#475569'};">${enabled ? 'Açık' : 'Kapalı'}</span></strong>
        <button type="button" onclick="window.toggleGarminIntegrationForUser(${!enabled})" style="background:${enabled ? '#F1F5F9' : '#0F172A'};color:${enabled ? '#334155' : '#FFFFFF'};border:${enabled ? '1px solid #CBD5E1' : 'none'};border-radius:6px;padding:5px 12px;font-size:12px;font-weight:700;cursor:pointer;">
          ${enabled ? 'Kapat' : 'Aç'}
        </button>
      </div>
    `;
  }

  function syncActiveSchedulesOnBoot() {
    if (!isGarminEnabledForCurrentUser()) return;
    try {
      const uid = getActiveUserId();
      const dateRaw = localStorage.getItem(`celik_kodu_date_schedule_${uid}`);
      if (dateRaw) {
        handleCalendarStorageWrite(`celik_kodu_date_schedule_${uid}`, dateRaw);
      }
      const weekRaw = localStorage.getItem(`celik_kodu_weekly_schedule_${uid}`);
      if (weekRaw) {
        handleCalendarStorageWrite(`celik_kodu_weekly_schedule_${uid}`, weekRaw);
      }
    } catch {}
  }

  function getStoredWellnessStepsMap() {
    if (!isGarminEnabledForCurrentUser()) return {};
    try {
      const raw = localStorage.getItem(WELLNESS_STEPS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_GARMIN_WELLNESS_STEPS, ...parsed };
        }
      }
    } catch {}
    return { ...DEFAULT_GARMIN_WELLNESS_STEPS };
  }

  async function syncGarminWellnessStepsSilent() {
    if (!isGarminEnabledForCurrentUser()) return false;
    try {
      const res = await fetch(`${BRIDGE_URL}/api/tredict/wellness?days=21`);
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.daily) && data.daily.length > 0) {
        const current = getStoredWellnessStepsMap();
        data.daily.forEach(d => {
          if (d && d.date) {
            current[d.date] = {
              date: d.date,
              steps: Number(d.steps || 0),
              floorsClimbed: Number(d.floorsClimbed || 0),
              restingHR: d.restingHR ? Number(d.restingHR) : (current[d.date]?.restingHR || null),
              sleepScore: d.sleepScore ? Number(d.sleepScore) : (current[d.date]?.sleepScore || null),
              syncedAt: '00:01_auto'
            };
          }
        });
        localStorage.setItem(WELLNESS_STEPS_KEY, JSON.stringify(current));
        if (typeof window.refreshTopFitnessCardioScoreBars === 'function') {
          window.refreshTopFitnessCardioScoreBars();
        }
        return true;
      }
    } catch {}
    return false;
  }

  let midnightStepTimerId = null;
  function scheduleMidnight0001StepSync() {
    if (midnightStepTimerId) clearTimeout(midnightStepTimerId);
    const now = new Date();
    const next0001 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 5, 0);
    const delayMs = Math.max(15000, next0001.getTime() - now.getTime());
    midnightStepTimerId = setTimeout(async () => {
      await syncGarminWellnessStepsSilent();
      scheduleMidnight0001StepSync();
    }, delayMs);
  }

  function refreshGarminPanelsForUserState() {
    cleanupLegacyWatchButtons();
    handoffCompletedActivitiesToTabChiefs();
    renderHistoryGarminSyncPanel();
    renderAnalyticsGarminCoachPanel();
    renderProfileGarminBridgeCard();
    if (typeof window.refreshTopFitnessCardioScoreBars === 'function') {
      window.refreshTopFitnessCardioScoreBars();
    }
  }

  window.GarminTredictChief = {
    agent: 'garmin-tredict-guard',
    isGarminEnabledForCurrentUser,
    auditExerciseWithLibraryGuard,
    auditAllLibraryExercises,
    saveSentWorkoutManifest,
    analyzeActivityGroups,
    handoffCompletedActivitiesToTabChiefs,
    computePhysiologicalMetrics,
    getStoredWellnessStepsMap,
    syncGarminWellnessStepsSilent,
    buildTredictPlanPayload,
    buildIntervalsWorkoutEvent
  };

  function initGarminTredictBridge() {
    installCalendarAutoSyncHook();
    refreshGarminPanelsForUserState();
    setTimeout(syncActiveSchedulesOnBoot, 600);
    setTimeout(syncGarminWellnessStepsSilent, 900);
    scheduleMidnight0001StepSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGarminTredictBridge);
  } else {
    initGarminTredictBridge();
  }
})();
