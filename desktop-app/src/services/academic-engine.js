/**
 * FitLAB - AKADEMİK SPOR BİLİMİ MOTORU (Academic Sports Science Engine)
 * 
 * Bilimsel Referanslar ve Biyomekanik Modeller:
 * - Brad Schoenfeld (2010, 2019): "Dose-response relationship between resistance training volume and hypertrophy" & "Exercise Selection"
 * - Chris Beardsley (Strength & Conditioning Research): "Mechanical Tension & Effective Reps Model"
 * - Dr. Mike Israetel (Renaissance Periodization): Volume Landmarks (MV, MEV, MAV, MRV) & Compound Fractional Loading
 * - Eric Helms & Greg Nuckols: SFR (Stimulus-to-Fatigue Ratio) & Calisthenics vs Free-Weight Equivalence
 */

// Kas Grubu Başına Haftalık Bilimsel Hacim Eşikleri (Hard Sets / Hafta)
const VOLUME_LANDMARKS = {
    'Göğüs':      { MV: 6,  MEV: 10, MAV_MIN: 12, MAV_MAX: 20, MRV: 22, category: 'push_horiz' },
    'Sırt':       { MV: 8,  MEV: 10, MAV_MIN: 14, MAV_MAX: 22, MRV: 25, category: 'pull' },
    'Omuz':       { MV: 6,  MEV: 8,  MAV_MIN: 12, MAV_MAX: 20, MRV: 24, category: 'push_vert' },
    'Ön Bacak':   { MV: 6,  MEV: 8,  MAV_MIN: 12, MAV_MAX: 18, MRV: 22, category: 'quad_dom' },
    'Arka Bacak': { MV: 4,  MEV: 6,  MAV_MIN: 10, MAV_MAX: 16, MRV: 20, category: 'hip_dom' },
    'Glute':      { MV: 0,  MEV: 4,  MAV_MIN: 8,  MAV_MAX: 16, MRV: 20, category: 'hip_dom' },
    'Biceps':     { MV: 4,  MEV: 8,  MAV_MIN: 10, MAV_MAX: 16, MRV: 20, category: 'pull' },
    'Triceps':    { MV: 4,  MEV: 6,  MAV_MIN: 10, MAV_MAX: 16, MRV: 18, category: 'push' },
    'Karın/Core': { MV: 0,  MEV: 4,  MAV_MIN: 8,  MAV_MAX: 14, MRV: 18, category: 'core' },
    'Kalf':       { MV: 4,  MEV: 6,  MAV_MIN: 8,  MAV_MAX: 16, MRV: 20, category: 'calves' }
};

/**
 * MEKANİK GERİLİM VE BİYOMEKANİK STİMULUS KATALOGU
 * 
 * Egzersiz Tipleri:
 * - HEAVY_COMPOUND: Harici yüklü serbest ağırlık / dambıl / barbell bileşik hareket (MTF = 1.0)
 * - ISOLATION: Doğrudan tek eklem hedef kas izolasyonu (MTF = 1.0)
 * - BODYWEIGHT_STRENGTH: Vücut ağırlığı kuvvet hareketi (MTF = 0.65 - 0.85)
 * - BALLISTIC_POWER: Hızlı, patlayıcı arka zincir hareketi (MTF = 0.50 - 0.60)
 * - LOADED_CARRY_CORE: Omurga zırhı ve izometrik stabilizasyon (MTF = 0.50 - 0.70)
 * - CONDITIONING: Kardiyovasküler & metabolik dayanıklılık. HİPERTROFİK KATSAYISI = 0.0 (SIFIR)!
 */
const EXERCISE_SPEC = {
    // === GÖĞÜS & İTİŞ (PUSH) ===
    'dambıl bench press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'bench press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'eğimli sehpa dambıl pres (incline db press)': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.40, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'incline bench press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.40, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'kablo göğüs sıkıştırma (cable flyes / crossover)': { primary: 'Göğüs', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'dips': { primary: 'Göğüs', pFactor: 0.85, sec: { 'Triceps': 0.40, 'Omuz': 0.30 }, type: 'BODYWEIGHT_STRENGTH' },
    'şınav (push-up)': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH' },
    'klasik şınav (floor push-up)': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH' },
    'şınav': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH' },
    'elmas şınav': { primary: 'Triceps', pFactor: 0.70, sec: { 'Göğüs': 0.30 }, type: 'BODYWEIGHT_STRENGTH' },

    // === OMUZ (DELTOIDS) ===
    'dambıl omuz presi': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'kettlebell strict overhead press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'overhead press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'arnold pres (rotasyonel omuz presi)': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'lateral raise': { primary: 'Omuz', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'yan omuz açış': { primary: 'Omuz', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'dambıl snatch': { primary: 'Omuz', pFactor: 0.50, sec: { 'Arka Bacak': 0.30, 'Glute': 0.30 }, type: 'BALLISTIC_POWER' },
    'kettlebell half snatch (yarım koparma)': { primary: 'Omuz', pFactor: 0.50, sec: { 'Arka Bacak': 0.30, 'Glute': 0.30 }, type: 'BALLISTIC_POWER' },
    'kettlebell halo': { primary: 'Omuz', pFactor: 0.40, sec: { 'Karın/Core': 0.30 }, type: 'MOBILITY_STABILITY' },

    // === KOL (BICEPS / TRICEPS) ===
    'dambıl başüstü triceps': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'dambıl skullcrusher': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'triceps pushdown': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'incline dambıl curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'hammer curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'biceps curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION' },

    // === SIRT & ÇEKİŞ (PULL) ===
    'dambıl saw row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40 }, type: 'HEAVY_COMPOUND' },
    'göğüs destekli dambıl sırt çekiş': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40 }, type: 'HEAVY_COMPOUND' },
    'oturarak kablo sırt çekiş (seated cable row)': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40 }, type: 'HEAVY_COMPOUND' },
    'lat pulldown': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.35 }, type: 'HEAVY_COMPOUND' },
    'barfiks (pull-up)': { primary: 'Sırt', pFactor: 0.85, sec: { 'Biceps': 0.40 }, type: 'BODYWEIGHT_STRENGTH' },
    'yatay barfiks': { primary: 'Sırt', pFactor: 0.70, sec: { 'Biceps': 0.35 }, type: 'BODYWEIGHT_STRENGTH' },
    'ters tutuş barfiks (chin-up)': { primary: 'Biceps', pFactor: 0.85, sec: { 'Sırt': 0.60 }, type: 'BODYWEIGHT_STRENGTH' },

    // === BACAK - QUAD DOMINANT (ÖN BACAK) ===
    'çift dambıl ön squat (front squat)': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40, 'Karın/Core': 0.30 }, type: 'HEAVY_COMPOUND' },
    'dambıl goblet squat': { primary: 'Ön Bacak', pFactor: 0.90, sec: { 'Glute': 0.40, 'Karın/Core': 0.30 }, type: 'HEAVY_COMPOUND' },
    'walking lunge': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND' },
    'dambıl yürüyüş hamlesi (walking lunges)': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND' },
    'reverse lunge': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND' },
    'bulgar split squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND' },
    'vücut ağırlığı squat (air squat)': { primary: 'Ön Bacak', pFactor: 0.30, sec: { 'Glute': 0.20 }, type: 'BODYWEIGHT_STRENGTH' },
    'air squat': { primary: 'Ön Bacak', pFactor: 0.30, sec: { 'Glute': 0.20 }, type: 'BODYWEIGHT_STRENGTH' },
    'leg extension': { primary: 'Ön Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION' },

    // === BACAK - POSTERIOR CHAIN & GLUTE (ARKA BACAK & KALÇA) ===
    'dambıl rdl': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Sırt': 0.30 }, type: 'HEAVY_COMPOUND' },
    'barbell romanian deadlift (rdl)': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Sırt': 0.30 }, type: 'HEAVY_COMPOUND' },
    'barbell konvansiyonel deadlift': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.60, 'Sırt': 0.50 }, type: 'HEAVY_COMPOUND' },
    'yatarak / oturarak arka bacak makinesi (leg curl)': { primary: 'Arka Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'dambıl swing': { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40 }, type: 'BALLISTIC_POWER' },
    'kettlebell swing': { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40 }, type: 'BALLISTIC_POWER' },
    'dambıl salınım (dumbbell swing)': { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40 }, type: 'BALLISTIC_POWER' },
    'glute bridge': { primary: 'Glute', pFactor: 1.0, sec: { 'Arka Bacak': 0.30 }, type: 'HEAVY_COMPOUND' },
    'hip thrust': { primary: 'Glute', pFactor: 1.0, sec: { 'Arka Bacak': 0.30 }, type: 'HEAVY_COMPOUND' },

    // === CORE, KALF & İZOLASYON ===
    'calf raise': { primary: 'Kalf', pFactor: 1.0, sec: {}, type: 'ISOLATION' },
    'russian twist': { primary: 'Karın/Core', pFactor: 0.70, sec: {}, type: 'CORE' },
    'dambıl russian twist (oturarak rotasyon)': { primary: 'Karın/Core', pFactor: 0.70, sec: {}, type: 'CORE' },
    "farmer's walk": { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Sırt': 0.30 }, type: 'LOADED_CARRY' },
    "dambıl çiftçi yürüyüşü (farmer's walk)": { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Sırt': 0.30 }, type: 'LOADED_CARRY' },
    'suitcase carry': { primary: 'Karın/Core', pFactor: 0.60, sec: {}, type: 'LOADED_CARRY' },
    'dambıl bavul taşıma (tek taraflı yürüyüş)': { primary: 'Karın/Core', pFactor: 0.60, sec: {}, type: 'LOADED_CARRY' },
    'kettlebell windmill': { primary: 'Karın/Core', pFactor: 0.50, sec: { 'Omuz': 0.30 }, type: 'MOBILITY_STABILITY' },
    'kablo odun kesme (cable woodchopper)': { primary: 'Karın/Core', pFactor: 0.80, sec: { 'Omuz': 0.20 }, type: 'CORE' },
    'plank': { primary: 'Karın/Core', pFactor: 0.50, sec: {}, type: 'CORE' },

    // === METABOLİK KONDİSYON & KARDİYO (HİPERTROFİK KATSAYISI: 0.0) ===
    // Bu hareketler göğüs veya bacak "hard set"i olarak işlenemez; kardiyo hacmine kaydedilir!
    'burpee': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING' },
    'mountain climber': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING' },
    'jumping jack': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING' },
    'ip atlama': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING' }
};

/**
 * Egzersiz ismi ve kategorisinden biyomekanik modeli çözümler
 */
function resolveExerciseBiomechanics(name = '', rawMuscle = '', category = '') {
    const cleanName = String(name).trim().toLowerCase();

    // 1. Doğrudan sözlük eşleşmesi
    if (EXERCISE_SPEC[cleanName]) {
        return EXERCISE_SPEC[cleanName];
    }

    // 2. Kısmi sözlük eşleşmesi
    for (const [key, val] of Object.entries(EXERCISE_SPEC)) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
            return val;
        }
    }

    // 3. Heuristic Çözümleyici
    const text = `${cleanName} ${String(rawMuscle).toLowerCase()} ${String(category).toLowerCase()}`;

    // Eğer kardiyo/kondisyon kelimesi geçiyorsa sıfırla
    if (text.includes('burpee') || text.includes('climber') || text.includes('cardio') || text.includes('kondisyon') || text.includes('jumping')) {
        return { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING' };
    }

    let primary = 'Göğüs';
    let pFactor = 1.0;
    let sec = {};
    let type = 'HEAVY_COMPOUND';

    if (text.includes('bench') || (text.includes('press') && !text.includes('omuz') && !text.includes('overhead'))) {
        primary = 'Göğüs';
        sec = { 'Omuz': 0.35, 'Triceps': 0.35 };
    } else if (text.includes('şınav') || text.includes('push-up') || text.includes('pushup')) {
        primary = 'Göğüs';
        pFactor = 0.65;
        sec = { 'Omuz': 0.25, 'Triceps': 0.25 };
        type = 'BODYWEIGHT_STRENGTH';
    } else if (text.includes('row') || text.includes('lat') || text.includes('barfiks') || text.includes('pull-up') || text.includes('çekiş')) {
        primary = 'Sırt';
        sec = { 'Biceps': 0.40 };
    } else if (text.includes('omuz') || text.includes('overhead') || text.includes('arnold') || text.includes('deltoid')) {
        primary = 'Omuz';
        sec = { 'Triceps': 0.35 };
    } else if (text.includes('squat') || text.includes('lunge') || text.includes('ön bacak') || text.includes('kuadriseps') || text.includes('quad')) {
        primary = 'Ön Bacak';
        sec = { 'Glute': 0.40 };
    } else if (text.includes('rdl') || text.includes('deadlift') || text.includes('hamstring') || text.includes('leg curl') || text.includes('arka bacak')) {
        primary = 'Arka Bacak';
        sec = { 'Glute': 0.50 };
    } else if (text.includes('swing') || text.includes('glute') || text.includes('kalça') || text.includes('hip thrust')) {
        primary = 'Glute';
        sec = { 'Arka Bacak': 0.40 };
        pFactor = 0.60;
        type = 'BALLISTIC_POWER';
    } else if (text.includes('curl') || text.includes('biceps')) {
        primary = 'Biceps';
        type = 'ISOLATION';
    } else if (text.includes('triceps') || text.includes('arka kol') || text.includes('pushdown')) {
        primary = 'Triceps';
        type = 'ISOLATION';
    } else if (text.includes('kalf') || text.includes('calf') || text.includes('baldır')) {
        primary = 'Kalf';
        type = 'ISOLATION';
    } else if (text.includes('core') || text.includes('karın') || text.includes('twist') || text.includes('carry')) {
        primary = 'Karın/Core';
        pFactor = 0.60;
        type = 'CORE';
    }

    return { primary, pFactor, sec, type };
}

/**
 * Antrenman loglarından egzersizleri mekanik gerilim katsayılarına göre analiz eder.
 */
function analyzeAthleteHistory(workoutLogs, userProfile = {}) {
    if (!Array.isArray(workoutLogs) || workoutLogs.length === 0) {
        return {
            status: 'NO_DATA',
            message: 'Analiz edilecek antrenman kaydı bulunamadı.'
        };
    }

    // 1. Sadece tamamlanmış set içeren gerçek antrenmanları al
    const validLogs = workoutLogs.filter(l => {
        const hasCompletedSets = (l.exercises || []).some(ex => 
            (ex.sets || []).some(s => s.completed || parseInt(s.reps, 10) > 0)
        );
        return (l.totalSetsCompleted > 0 || hasCompletedSets);
    });

    if (validLogs.length === 0) {
        return {
            status: 'NO_DATA',
            message: 'Tamamlanmış hard set içeren antrenman kaydı bulunamadı.'
        };
    }

    // 2. Mikro-döngü penceresi
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    let weeklyLogs = validLogs.filter(l => new Date(l.date || l.timestamp) >= oneWeekAgo);

    if (weeklyLogs.length < 3 && validLogs.length >= 3) {
        weeklyLogs = validLogs.slice(0, 3);
    } else if (weeklyLogs.length === 0 && validLogs.length > 0) {
        weeklyLogs = validLogs.slice(0, Math.min(validLogs.length, 3));
    }

    const monthlyLogs = validLogs.filter(l => new Date(l.date || l.timestamp) >= fourWeeksAgo);

    // 3. Mekanik Gerilim Hacmi Hesaplama
    const weeklyVolumeMap = {};
    const junkVolumeMap = {};
    let totalTonnageWeekly = 0;
    let totalEffectiveReps = 0;
    let conditioningSetsTotal = 0;
    let pushSets = 0;
    let pullSets = 0;
    let quadSets = 0;
    let hipSets = 0;

    Object.keys(VOLUME_LANDMARKS).forEach(k => {
        weeklyVolumeMap[k] = 0;
        junkVolumeMap[k] = 0;
    });

    weeklyLogs.forEach(session => {
        const exercises = session.exercises || [];
        const sessionMuscleCounts = {};

        exercises.forEach(ex => {
            const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
            const allSets = Array.isArray(ex.sets) ? ex.sets : [];

            // Gerçekten yapılmış setleri filtrele
            const completedSets = allSets.filter(s => s.completed || parseInt(s.reps, 10) > 0);
            if (completedSets.length === 0) return;

            // KONDİSYON EGZERSİZİ KONTROLÜ (Örn: Burpee)
            if (spec.type === 'CONDITIONING') {
                conditioningSetsTotal += completedSets.length;
                return; // Kas hipertrofisi havuzuna aktarılmaz!
            }

            completedSets.forEach(s => {
                const weight = parseFloat(s.weight) || 0;
                const reps = parseInt(s.reps, 10) || 0;
                const rpe = parseFloat(s.rpe) || (s.rir !== undefined ? 10 - parseFloat(s.rir) : 8);

                // Tonaj: Kilo x Tekrar
                totalTonnageWeekly += (weight * reps);

                // Chris Beardsley Effective Reps Modeli:
                // RPE >= 7 (RIR <= 3) ve harici ağırlık varsa son 5 tekrar mekanik gerilim üretir
                if (rpe >= 7 && reps > 0) {
                    const stimReps = Math.min(reps, 5);
                    totalEffectiveReps += stimReps;
                }

                // Birincil Kas Grubu (Mekanik Gerilim Katsayısı MTF uygulanır)
                const prim = spec.primary;
                if (prim && spec.pFactor > 0) {
                    const effectivePrimarySet = spec.pFactor;
                    sessionMuscleCounts[prim] = (sessionMuscleCounts[prim] || 0) + effectivePrimarySet;

                    // Junk Volume Tespiti (RPE < 6 veya tek seansta aynı kasa 10 setten fazla girilmişse)
                    if (rpe < 6 || sessionMuscleCounts[prim] > 10) {
                        junkVolumeMap[prim] = (junkVolumeMap[prim] || 0) + effectivePrimarySet;
                    } else {
                        weeklyVolumeMap[prim] = (weeklyVolumeMap[prim] || 0) + effectivePrimarySet;
                    }

                    // Biyomekanik Oran Takibi
                    const landmark = VOLUME_LANDMARKS[prim];
                    if (landmark) {
                        if (landmark.category.includes('push')) pushSets += effectivePrimarySet;
                        if (landmark.category.includes('pull')) pullSets += effectivePrimarySet;
                        if (landmark.category.includes('quad')) quadSets += effectivePrimarySet;
                        if (landmark.category.includes('hip')) hipSets += effectivePrimarySet;
                    }
                }

                // İkincil Kas Grupları (Sinerjist Sarkaç)
                Object.entries(spec.sec || {}).forEach(([secMuscle, secFactor]) => {
                    sessionMuscleCounts[secMuscle] = (sessionMuscleCounts[secMuscle] || 0) + secFactor;
                    weeklyVolumeMap[secMuscle] = (weeklyVolumeMap[secMuscle] || 0) + secFactor;
                });
            });
        });
    });

    // 4. Akademik Hacim Eşiği Karşılaştırması (Dr. Mike Israetel Kriterleri)
    const muscleStatus = {};
    const deficitMuscles = [];
    const optimalMuscles = [];
    const overreachedMuscles = [];

    Object.entries(VOLUME_LANDMARKS).forEach(([muscle, limits]) => {
        const rawSets = weeklyVolumeMap[muscle] || 0;
        // Küsuratları düzenle (Örn: 11.2 -> 11.2, 12.0 -> 12)
        const actualSets = Math.round(rawSets * 10) / 10;
        let tier = 'OPTIMAL';
        let recommendation = 'Hacim optimal hipertrofi bandında.';

        if (actualSets === 0) {
            tier = 'UNWORKED';
            recommendation = `Bu kas grubu bu mikro-döngüde mekanik gerilim almadı. MEV (${limits.MEV} set) eklenmeli.`;
            deficitMuscles.push({ muscle, actual: 0, target: limits.MEV, status: 'Atlandı' });
        } else if (actualSets < limits.MEV) {
            tier = 'BELOW_MEV';
            recommendation = `Mevcut ${actualSets} efektif set, gelişim eşiği olan ${limits.MEV} setin altında (MEV altı).`;
            deficitMuscles.push({ muscle, actual: actualSets, target: limits.MEV, status: 'Yetersiz' });
        } else if (actualSets >= limits.MAV_MIN && actualSets <= limits.MAV_MAX) {
            tier = 'MAV_SWEET_SPOT';
            recommendation = `Mükemmel! ${actualSets} efektif set ile Maksimum Adaptif Hacim (MAV) altın oranında (${limits.MAV_MIN}-${limits.MAV_MAX} set).`;
            optimalMuscles.push({ muscle, actual: actualSets });
        } else if (actualSets > limits.MRV) {
            tier = 'OVER_MRV';
            recommendation = `DİKKAT: ${actualSets} set, toparlanma tavanı olan ${limits.MRV} seti aştı. Aşırı antrenman ve toparlanma yetersizliği riski!`;
            overreachedMuscles.push({ muscle, actual: actualSets, limit: limits.MRV });
        } else {
            tier = 'ACCEPTABLE';
            recommendation = `${actualSets} efektif set ile gelişim aralığında (${limits.MEV}-${limits.MAV_MIN} set).`;
        }

        muscleStatus[muscle] = {
            sets: actualSets,
            junkSets: Math.round((junkVolumeMap[muscle] || 0) * 10) / 10,
            limits: limits,
            tier: tier,
            recommendation: recommendation
        };
    });

    // 5. Biyomekanik Yapısal Denge Oranları (McGill / Contreras)
    const pushPullRatio = pullSets > 0 ? (pushSets / pullSets).toFixed(2) : pushSets.toFixed(2);
    const quadHipRatio = hipSets > 0 ? (quadSets / hipSets).toFixed(2) : quadSets.toFixed(2);

    let biomechanicalWarnings = [];
    if (parseFloat(pushPullRatio) > 1.35) {
        biomechanicalWarnings.push(`⚠️ İtiş/Çekiş Dengesizliği (${pushPullRatio}:1): İtiş hacmi çekişten belirgin şekilde fazla. Omuz eklemini korumak için sırt ve arka omuz hacmi artırılmalıdır.`);
    } else if (parseFloat(pushPullRatio) < 0.70 && pullSets > 0) {
        biomechanicalWarnings.push(`ℹ️ Çekiş baskın profil (${pushPullRatio}:1). Göğüs ve omuz itiş hacmi MEV bandında tutulmalı.`);
    }

    if (parseFloat(quadHipRatio) > 1.45) {
        biomechanicalWarnings.push(`⚠️ Ön/Arka Bacak Dengesizliği (${quadHipRatio}:1): Diz dominant (Quad) çalışmalar kalça/arka bacak çalışmalarını aşmış. Patellar tendon sağlığı için RDL/Glute Bridge eklenmelidir.`);
    }

    // 6. Progresif Aşırı Yüklenme (Progressive Overload) Eğilimi
    const weeklyTonnageTrend = calculateTonnageTrend(monthlyLogs.length > 0 ? monthlyLogs : validLogs);

    return {
        status: 'SUCCESS',
        calculatedAt: new Date().toISOString(),
        summary: {
            weeklySessionsCount: weeklyLogs.length,
            totalWeeklyTonnageKg: Math.round(totalTonnageWeekly),
            effectiveRepsCount: totalEffectiveReps,
            conditioningSetsCount: conditioningSetsTotal,
            pushPullRatio: pushPullRatio,
            quadHipRatio: quadHipRatio,
            deficitCount: deficitMuscles.length,
            optimalCount: optimalMuscles.length,
            overreachedCount: overreachedMuscles.length
        },
        muscleBreakdown: muscleStatus,
        deficits: deficitMuscles,
        optimalMuscles: optimalMuscles,
        overreached: overreachedMuscles,
        biomechanicalWarnings: biomechanicalWarnings,
        tonnageTrend: weeklyTonnageTrend
    };
}

/**
 * Haftalık tonaj trendini hesaplar
 */
function calculateTonnageTrend(logs) {
    const weeklyMap = {};
    logs.forEach(l => {
        const d = new Date(l.date || l.timestamp);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff)).toISOString().split('T')[0];

        let sessionTonnage = 0;
        (l.exercises || []).forEach(ex => {
            (ex.sets || []).forEach(s => {
                if (s.completed || parseInt(s.reps, 10) > 0) {
                    sessionTonnage += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
                }
            });
        });

        weeklyMap[monday] = (weeklyMap[monday] || 0) + sessionTonnage;
    });

    return Object.entries(weeklyMap)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([week, tonnage]) => ({ week, tonnage: Math.round(tonnage) }));
}

module.exports = {
    VOLUME_LANDMARKS,
    EXERCISE_SPEC,
    resolveExerciseBiomechanics,
    analyzeAthleteHistory
};
