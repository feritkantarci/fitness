/**
 * FitLAB - AKADEMİK SPOR BİLİMİ MOTORU (Academic Sports Science Engine)
 * 
 * Bilimsel Referanslar ve Modeller:
 * - Brad Schoenfeld (2010, 2019): "Dose-response relationship between weekly resistance training volume and increases in muscle mass"
 * - Dr. Mike Israetel (Renaissance Periodization): Volume Landmarks (MV, MEV, MAV, MRV) & Compound Fractions
 * - Chris Beardsley: Effective Reps Model & Mechanical Tension
 * - Eric Helms & Greg Nuckols: Progressive Overload & Periodization
 * - Dr. Stuart McGill & Bret Contreras: Structural Balance & Joint Biomechanics
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

// Bilimsel Egzersiz Anatomisi ve Birincil / İkincil Kas Dağılım Haritası (Schoenfeld / Israetel)
const EXERCISE_DATABASE = {
    // === GÖĞÜS & İTİŞ (PUSH) ===
    'dambıl bench press': { primary: 'Göğüs', secondary: ['Omuz', 'Triceps'] },
    'bench press': { primary: 'Göğüs', secondary: ['Omuz', 'Triceps'] },
    'şınav (push-up)': { primary: 'Göğüs', secondary: ['Omuz', 'Triceps', 'Karın/Core'] },
    'klasik şınav (floor push-up)': { primary: 'Göğüs', secondary: ['Omuz', 'Triceps', 'Karın/Core'] },
    'şınav': { primary: 'Göğüs', secondary: ['Omuz', 'Triceps', 'Karın/Core'] },
    'elmas şınav': { primary: 'Triceps', secondary: ['Göğüs'] },
    'eğimli sehpa dambıl pres (incline db press)': { primary: 'Göğüs', secondary: ['Omuz', 'Triceps'] },
    'incline bench press': { primary: 'Göğüs', secondary: ['Omuz', 'Triceps'] },
    'kablo göğüs sıkıştırma (cable flyes / crossover)': { primary: 'Göğüs', secondary: [] },
    'dips': { primary: 'Göğüs', secondary: ['Triceps', 'Omuz'] },

    // === OMUZ (DELTOIDS) ===
    'dambıl omuz presi': { primary: 'Omuz', secondary: ['Triceps', 'Karın/Core'] },
    'kettlebell strict overhead press': { primary: 'Omuz', secondary: ['Triceps', 'Karın/Core'] },
    'overhead press': { primary: 'Omuz', secondary: ['Triceps', 'Karın/Core'] },
    'arnold pres (rotasyonel omuz presi)': { primary: 'Omuz', secondary: ['Triceps'] },
    'dambıl snatch': { primary: 'Omuz', secondary: ['Sırt', 'Arka Bacak', 'Karın/Core'] },
    'kettlebell half snatch (yarım koparma)': { primary: 'Omuz', secondary: ['Sırt', 'Arka Bacak', 'Karın/Core'] },
    'kettlebell halo': { primary: 'Omuz', secondary: ['Karın/Core'] },
    'lateral raise': { primary: 'Omuz', secondary: [] },
    'yan omuz açış': { primary: 'Omuz', secondary: [] },

    // === KOL (BICEPS / TRICEPS) ===
    'dambıl başüstü triceps': { primary: 'Triceps', secondary: [] },
    'dambıl skullcrusher': { primary: 'Triceps', secondary: [] },
    'triceps pushdown': { primary: 'Triceps', secondary: [] },
    'incline dambıl curl': { primary: 'Biceps', secondary: [] },
    'hammer curl': { primary: 'Biceps', secondary: [] },
    'biceps curl': { primary: 'Biceps', secondary: [] },

    // === SIRT & ÇEKİŞ (PULL) ===
    'dambıl saw row': { primary: 'Sırt', secondary: ['Biceps', 'Karın/Core'] },
    'göğüs destekli dambıl sırt çekiş': { primary: 'Sırt', secondary: ['Biceps'] },
    'oturarak kablo sırt çekiş (seated cable row)': { primary: 'Sırt', secondary: ['Biceps'] },
    'lat pulldown': { primary: 'Sırt', secondary: ['Biceps'] },
    'barfiks (pull-up)': { primary: 'Sırt', secondary: ['Biceps', 'Karın/Core'] },
    'yatay barfiks': { primary: 'Sırt', secondary: ['Biceps'] },
    'ters tutuş barfiks (chin-up)': { primary: 'Biceps', secondary: ['Sırt'] },

    // === BACAK - QUAD DOMINANT (ÖN BACAK) ===
    'çift dambıl ön squat (front squat)': { primary: 'Ön Bacak', secondary: ['Glute', 'Karın/Core'] },
    'dambıl goblet squat': { primary: 'Ön Bacak', secondary: ['Glute', 'Karın/Core'] },
    'vücut ağırlığı squat (air squat)': { primary: 'Ön Bacak', secondary: ['Glute'] },
    'air squat': { primary: 'Ön Bacak', secondary: ['Glute'] },
    'walking lunge': { primary: 'Ön Bacak', secondary: ['Glute', 'Karın/Core'] },
    'dambıl yürüyüş hamlesi (walking lunges)': { primary: 'Ön Bacak', secondary: ['Glute', 'Karın/Core'] },
    'reverse lunge': { primary: 'Ön Bacak', secondary: ['Glute'] },
    'bulgar split squat': { primary: 'Ön Bacak', secondary: ['Glute'] },
    'leg extension': { primary: 'Ön Bacak', secondary: [] },

    // === BACAK - POSTERIOR CHAIN & GLUTE (ARKA BACAK & KALÇA) ===
    'dambıl rdl': { primary: 'Arka Bacak', secondary: ['Glute', 'Sırt'] },
    'barbell romanian deadlift (rdl)': { primary: 'Arka Bacak', secondary: ['Glute', 'Sırt'] },
    'barbell konvansiyonel deadlift': { primary: 'Arka Bacak', secondary: ['Glute', 'Sırt', 'Karın/Core'] },
    'yatarak / oturarak arka bacak makinesi (leg curl)': { primary: 'Arka Bacak', secondary: [] },
    'dambıl swing': { primary: 'Glute', secondary: ['Arka Bacak', 'Karın/Core'] },
    'kettlebell swing': { primary: 'Glute', secondary: ['Arka Bacak', 'Karın/Core'] },
    'dambıl salınım (dumbbell swing)': { primary: 'Glute', secondary: ['Arka Bacak', 'Karın/Core'] },
    'glute bridge': { primary: 'Glute', secondary: ['Arka Bacak'] },
    'hip thrust': { primary: 'Glute', secondary: ['Arka Bacak'] },

    // === CORE, KALF & İZOLASYON ===
    'calf raise': { primary: 'Kalf', secondary: [] },
    'russian twist': { primary: 'Karın/Core', secondary: [] },
    'dambıl russian twist (oturarak rotasyon)': { primary: 'Karın/Core', secondary: [] },
    "farmer's walk": { primary: 'Karın/Core', secondary: ['Sırt'] },
    "dambıl çiftçi yürüyüşü (farmer's walk)": { primary: 'Karın/Core', secondary: ['Sırt'] },
    'suitcase carry': { primary: 'Karın/Core', secondary: [] },
    'dambıl bavul taşıma (tek taraflı yürüyüş)': { primary: 'Karın/Core', secondary: [] },
    'kettlebell windmill': { primary: 'Karın/Core', secondary: ['Omuz', 'Arka Bacak'] },
    'kablo odun kesme (cable woodchopper)': { primary: 'Karın/Core', secondary: ['Omuz'] },
    'plank': { primary: 'Karın/Core', secondary: [] },
    'burpee': { primary: 'Ön Bacak', secondary: ['Göğüs', 'Karın/Core'] }
};

/**
 * Egzersiz ismi ve ham kas etiketinden anatomik hedefi çözümler
 */
function resolveExerciseMuscles(name = '', rawMuscle = '', category = '') {
    const cleanName = String(name).trim().toLowerCase();
    
    // 1. Doğrudan sözlük eşleşmesi
    if (EXERCISE_DATABASE[cleanName]) {
        return EXERCISE_DATABASE[cleanName];
    }

    // 2. Kısmi sözlük eşleşmesi
    for (const [key, val] of Object.entries(EXERCISE_DATABASE)) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
            return val;
        }
    }

    // 3. Anatomik anahtar kelime çözümlemesi (Heuristic Parser)
    const text = `${cleanName} ${String(rawMuscle).toLowerCase()} ${String(category).toLowerCase()}`;
    let primary = 'Göğüs';
    let secondary = [];

    if (text.includes('bench') || (text.includes('press') && !text.includes('omuz') && !text.includes('overhead'))) {
        primary = 'Göğüs';
        secondary = ['Omuz', 'Triceps'];
    } else if (text.includes('şınav') || text.includes('push-up') || text.includes('pushup')) {
        primary = 'Göğüs';
        secondary = ['Omuz', 'Triceps', 'Karın/Core'];
    } else if (text.includes('row') || text.includes('lat') || text.includes('barfiks') || text.includes('pull-up') || text.includes('chin-up') || text.includes('çekiş')) {
        primary = 'Sırt';
        secondary = ['Biceps'];
    } else if (text.includes('omuz') || text.includes('overhead') || text.includes('arnold') || text.includes('deltoid') || text.includes('snatch') || text.includes('halo')) {
        primary = 'Omuz';
        secondary = ['Triceps'];
    } else if (text.includes('squat') || text.includes('lunge') || text.includes('ön bacak') || text.includes('kuadriseps') || text.includes('quad')) {
        primary = 'Ön Bacak';
        secondary = ['Glute'];
    } else if (text.includes('rdl') || text.includes('deadlift') || text.includes('hamstring') || text.includes('leg curl') || text.includes('arka bacak')) {
        primary = 'Arka Bacak';
        secondary = ['Glute'];
    } else if (text.includes('swing') || text.includes('glute') || text.includes('kalça') || text.includes('hip thrust') || text.includes('salınım')) {
        primary = 'Glute';
        secondary = ['Arka Bacak'];
    } else if (text.includes('curl') || text.includes('biceps') || text.includes('pazu')) {
        primary = 'Biceps';
    } else if (text.includes('triceps') || text.includes('arka kol') || text.includes('skullcrusher') || text.includes('pushdown')) {
        primary = 'Triceps';
    } else if (text.includes('kalf') || text.includes('calf') || text.includes('baldır')) {
        primary = 'Kalf';
    } else if (text.includes('core') || text.includes('karın') || text.includes('twist') || text.includes('plank') || text.includes('carry') || text.includes('walk')) {
        primary = 'Karın/Core';
    }

    return { primary, secondary };
}

/**
 * Antrenman loglarından egzersizleri kas gruplarına göre ayrıştırıp akademik analiz yapar.
 */
function analyzeAthleteHistory(workoutLogs, userProfile = {}) {
    if (!Array.isArray(workoutLogs) || workoutLogs.length === 0) {
        return {
            status: 'NO_DATA',
            message: 'Analiz edilecek antrenman kaydı bulunamadı.'
        };
    }

    // 1. Geçerli ve tamamlanmış antrenmanları ayıkla (boş/iptal edilmiş seansları yoksay)
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

    // 2. Mikro-Döngü Zaman Penceresi (Son 7 Gün veya Son Tamamlanmış 3-4 Seans)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    let weeklyLogs = validLogs.filter(l => new Date(l.date || l.timestamp) >= oneWeekAgo);

    // Eğer son 7 takvim gününde 3'ten az antrenman varsa ama geçmişte antrenmanları varsa,
    // sporcunun son haftalık mikro-döngüsünü (en son 3-4 seansı) baz al
    if (weeklyLogs.length < 3 && validLogs.length >= 3) {
        weeklyLogs = validLogs.slice(0, 3);
    } else if (weeklyLogs.length === 0 && validLogs.length > 0) {
        weeklyLogs = validLogs.slice(0, Math.min(validLogs.length, 3));
    }

    const monthlyLogs = validLogs.filter(l => new Date(l.date || l.timestamp) >= fourWeeksAgo);

    // 3. Haftalık Kas Grubu Set Dağılımı ve Çöp Hacim (Junk Volume) Analizi
    const weeklyVolumeMap = {};
    const junkVolumeMap = {};
    let totalTonnageWeekly = 0;
    let totalEffectiveReps = 0;
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
            const muscles = resolveExerciseMuscles(ex.name, ex.muscle, ex.category);
            const allSets = Array.isArray(ex.sets) ? ex.sets : [];

            // Sadece gerçekten yapılmış tamamlanan setleri al!
            const completedSets = allSets.filter(s => s.completed || parseInt(s.reps, 10) > 0);
            if (completedSets.length === 0) return;

            completedSets.forEach(s => {
                const weight = parseFloat(s.weight) || 0;
                const reps = parseInt(s.reps, 10) || 0;
                const rpe = parseFloat(s.rpe) || (s.rir !== undefined ? 10 - parseFloat(s.rir) : 8);

                // Tonaj: Kilo x Tekrar
                totalTonnageWeekly += (weight * reps);

                // Chris Beardsley Effective Reps Modeli:
                // RPE >= 7 (RIR <= 3) ise son 5 tekrar gerçek mekanik gerilim üretir
                if (rpe >= 7 && reps > 0) {
                    const stimReps = Math.min(reps, 5);
                    totalEffectiveReps += stimReps;
                }

                // Birincil Kas Grubu (Tam 1.0 Set)
                const prim = muscles.primary;
                sessionMuscleCounts[prim] = (sessionMuscleCounts[prim] || 0) + 1;

                // Junk Volume Tespiti (RPE < 6 veya tek seansta aynı kasa 10 setten fazla girilmişse)
                if (rpe < 6 || sessionMuscleCounts[prim] > 10) {
                    junkVolumeMap[prim] = (junkVolumeMap[prim] || 0) + 1;
                } else {
                    weeklyVolumeMap[prim] = (weeklyVolumeMap[prim] || 0) + 1;
                }

                // İkincil Kas Grupları (Bileşik hareket transferi: 0.5 Set - Brad Schoenfeld)
                (muscles.secondary || []).forEach(sec => {
                    sessionMuscleCounts[sec] = (sessionMuscleCounts[sec] || 0) + 0.5;
                    weeklyVolumeMap[sec] = (weeklyVolumeMap[sec] || 0) + 0.5;
                });

                // Biyomekanik Oran Takibi
                const landmark = VOLUME_LANDMARKS[prim];
                if (landmark) {
                    if (landmark.category.includes('push')) pushSets++;
                    if (landmark.category.includes('pull')) pullSets++;
                    if (landmark.category.includes('quad')) quadSets++;
                    if (landmark.category.includes('hip')) hipSets++;
                }
            });
        });
    });

    // 4. Akademik Hacim Eşiği Karşılaştırması (Dr. Mike Israetel Kriterleri)
    const muscleStatus = {};
    const deficitMuscles = [];
    const optimalMuscles = [];
    const overreachedMuscles = [];

    Object.entries(VOLUME_LANDMARKS).forEach(([muscle, limits]) => {
        const actualSets = weeklyVolumeMap[muscle] || 0;
        let tier = 'OPTIMAL';
        let recommendation = 'Hacim optimal hipertrofi bandında.';

        if (actualSets === 0) {
            tier = 'UNWORKED';
            recommendation = `Bu kas grubu bu mikro-döngüde çalıştırılmadı. MEV (${limits.MEV} set) eklenmeli.`;
            deficitMuscles.push({ muscle, actual: 0, target: limits.MEV, status: 'Atlandı' });
        } else if (actualSets < limits.MEV) {
            tier = 'BELOW_MEV';
            recommendation = `Mevcut ${actualSets} set, gelişim eşiği olan ${limits.MEV} setin altında (MEV altı).`;
            deficitMuscles.push({ muscle, actual: actualSets, target: limits.MEV, status: 'Yetersiz' });
        } else if (actualSets >= limits.MAV_MIN && actualSets <= limits.MAV_MAX) {
            tier = 'MAV_SWEET_SPOT';
            recommendation = `Mükemmel! ${actualSets} set ile Maksimum Adaptif Hacim (MAV) altın oranında (${limits.MAV_MIN}-${limits.MAV_MAX} set).`;
            optimalMuscles.push({ muscle, actual: actualSets });
        } else if (actualSets > limits.MRV) {
            tier = 'OVER_MRV';
            recommendation = `DİKKAT: ${actualSets} set, toparlanma tavanı olan ${limits.MRV} seti aştı. Aşırı antrenman ve sakatlık riski!`;
            overreachedMuscles.push({ muscle, actual: actualSets, limit: limits.MRV });
        } else {
            tier = 'ACCEPTABLE';
            recommendation = `${actualSets} set ile gelişim aralığında (${limits.MEV}-${limits.MAV_MIN} set).`;
        }

        muscleStatus[muscle] = {
            sets: actualSets,
            junkSets: junkVolumeMap[muscle] || 0,
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
        biomechanicalWarnings.push(`⚠️ İtiş/Çekiş Dengesizliği (${pushPullRatio}:1): İtiş hacmi çekişten belirgin şekilde fazla. Omuz impingement riskini önlemek için sırt/arka omuz hacmi artırılmalıdır.`);
    } else if (parseFloat(pushPullRatio) < 0.70 && pullSets > 0) {
        biomechanicalWarnings.push(`ℹ️ Çekiş baskın profil (${pushPullRatio}:1). Göğüs ve omuz itiş hacmi MEV bandında tutulmalı.`);
    }

    if (parseFloat(quadHipRatio) > 1.45) {
        biomechanicalWarnings.push(`⚠️ Ön/Arka Bacak Dengesizliği (${quadHipRatio}:1): Diz dominant (Quad) çalışmalar kalça/arka bacak çalışmalarını aşmış. Patella ve diz sağlığı için RDL/Glute Bridge eklenmelidir.`);
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
    EXERCISE_DATABASE,
    resolveExerciseMuscles,
    analyzeAthleteHistory
};
