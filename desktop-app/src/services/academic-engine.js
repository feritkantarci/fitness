/**
 * ÇELİK KODU - AKADEMİK SPOR BİLİMİ MOTORU (Academic Sports Science Engine)
 * 
 * Bilimsel Referanslar ve Modeller:
 * - Brad Schoenfeld (2010, 2019): "Dose-response relationship between weekly resistance training volume and increases in muscle mass"
 * - Dr. Mike Israetel (Renaissance Periodization): Volume Landmarks (MV, MEV, MAV, MRV)
 * - Chris Beardsley: Effective Reps Model & Mechanical Tension
 * - Eric Helms & Greg Nuckols: Progressive Overload & Periodization
 * - Dr. Stuart McGill & Bret Contreras: Structural Balance & Spine/Joint Biomechanics
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
 * Antrenman loglarından egzersizleri kas gruplarına göre ayrıştırıp akademik analiz yapar.
 */
function analyzeAthleteHistory(workoutLogs, userProfile = {}) {
    if (!Array.isArray(workoutLogs) || workoutLogs.length === 0) {
        return {
            status: 'NO_DATA',
            message: 'Analiz edilecek antrenman kaydı bulunamadı.'
        };
    }

    // 1. Son 7 günün ve son 28 günün antrenmanlarını ayıkla
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const weeklyLogs = workoutLogs.filter(l => new Date(l.date || l.timestamp) >= oneWeekAgo);
    const monthlyLogs = workoutLogs.filter(l => new Date(l.date || l.timestamp) >= fourWeeksAgo);

    // 2. Haftalık Kas Grubu Set Dağılımı ve Çöp Hacim (Junk Volume) Analizi
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
            const muscle = mapMuscleName(ex.muscle || ex.category || ex.name);
            const sets = Array.isArray(ex.sets) ? ex.sets : [];

            sessionMuscleCounts[muscle] = (sessionMuscleCounts[muscle] || 0) + sets.length;

            sets.forEach(s => {
                const weight = parseFloat(s.weight) || 0;
                const reps = parseInt(s.reps, 10) || 0;
                const rpe = parseFloat(s.rpe) || (s.rir !== undefined ? 10 - parseFloat(s.rir) : 8);

                // Tonaj: Kilo x Tekrar
                totalTonnageWeekly += (weight * reps);

                // Chris Beardsley Effective Reps Modeli:
                // RPE >= 7 (RIR <= 3) ise son 5 tekrar gerçek mekanik gerilim üretir
                if (rpe >= 7) {
                    const stimReps = Math.min(reps, 5);
                    totalEffectiveReps += stimReps;
                }

                // Junk Volume Tespiti (RPE < 6 veya tek seansta aynı kasa 10 setten fazla girilmişse)
                if (rpe < 6 || sessionMuscleCounts[muscle] > 10) {
                    junkVolumeMap[muscle] = (junkVolumeMap[muscle] || 0) + 1;
                } else {
                    weeklyVolumeMap[muscle] = (weeklyVolumeMap[muscle] || 0) + 1;
                }

                // Biyomekanik Oran Takibi
                const landmark = VOLUME_LANDMARKS[muscle];
                if (landmark) {
                    if (landmark.category.includes('push')) pushSets++;
                    if (landmark.category.includes('pull')) pullSets++;
                    if (landmark.category.includes('quad')) quadSets++;
                    if (landmark.category.includes('hip')) hipSets++;
                }
            });
        });
    });

    // 3. Akademik Hacim Eşiği Karşılaştırması (Dr. Mike Israetel Kriterleri)
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
            recommendation = `Bu kas grubu hiç çalıştırılmadı. Minimum etkili hacim (MEV: ${limits.MEV} set) eklenmeli.`;
            deficitMuscles.push({ muscle, actual: 0, target: limits.MEV, status: 'Atlandı' });
        } else if (actualSets < limits.MEV) {
            tier = 'BELOW_MEV';
            recommendation = `Mevcut ${actualSets} set, kas büyümesi için gereken asgari eşik olan ${limits.MEV} setin altında.`;
            deficitMuscles.push({ muscle, actual: actualSets, target: limits.MEV, status: 'Yetersiz' });
        } else if (actualSets >= limits.MAV_MIN && actualSets <= limits.MAV_MAX) {
            tier = 'MAV_SWEET_SPOT';
            recommendation = `Harika! ${actualSets} set ile Maksimum Adaptif Hacim (MAV) altın oranında (${limits.MAV_MIN}-${limits.MAV_MAX} set).`;
            optimalMuscles.push({ muscle, actual: actualSets });
        } else if (actualSets > limits.MRV) {
            tier = 'OVER_MRV';
            recommendation = `DİKKAT: ${actualSets} set, toparlanma tavanı olan ${limits.MRV} seti aştı. Aşırı antrenman ve sakatlık riski!`;
            overreachedMuscles.push({ muscle, actual: actualSets, limit: limits.MRV });
        } else {
            tier = 'ACCEPTABLE';
            recommendation = `${actualSets} set ile gelişim aralığında.`;
        }

        muscleStatus[muscle] = {
            sets: actualSets,
            junkSets: junkVolumeMap[muscle] || 0,
            limits: limits,
            tier: tier,
            recommendation: recommendation
        };
    });

    // 4. Biyomekanik Yapısal Denge Oranları (McGill / Contreras)
    const pushPullRatio = pullSets > 0 ? (pushSets / pullSets).toFixed(2) : pushSets.toFixed(2);
    const quadHipRatio = hipSets > 0 ? (quadSets / hipSets).toFixed(2) : quadSets.toFixed(2);

    let biomechanicalWarnings = [];
    if (parseFloat(pushPullRatio) > 1.25) {
        biomechanicalWarnings.push(`⚠️ İtiş/Çekiş Dengesizliği (${pushPullRatio}:1): İtiş hacmi çekişten %25 daha fazla. Omuz impingement (sıkışma) riskini önlemek için sırt/arka omuz hacmi artırılmalıdır.`);
    } else if (parseFloat(pushPullRatio) < 0.75 && pullSets > 0) {
        biomechanicalWarnings.push(`ℹ️ Çekiş baskın profil (${pushPullRatio}:1). Göğüs ve omuz itiş hacmi MEV bandında tutulmalı.`);
    }

    if (parseFloat(quadHipRatio) > 1.4) {
        biomechanicalWarnings.push(`⚠️ Ön/Arka Bacak Dengesizliği (${quadHipRatio}:1): Diz dominant (Quad) çalışmalar kalça/arka bacak çalışmalarını çok aşmış. ACL ve diz sağlığı için RDL/Glute Bridge eklenmelidir.`);
    }

    // 5. Progresif Aşırı Yüklenme (Progressive Overload) Eğilimi
    const weeklyTonnageTrend = calculateTonnageTrend(monthlyLogs);

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
 * Son 4 haftalık tonaj trendini hesaplar
 */
function calculateTonnageTrend(logs) {
    const weeklyMap = {};
    logs.forEach(l => {
        const d = new Date(l.date || l.timestamp);
        // Hafta başlangıcı (Pazartesi)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff)).toISOString().split('T')[0];

        let sessionTonnage = 0;
        (l.exercises || []).forEach(ex => {
            (ex.sets || []).forEach(s => {
                sessionTonnage += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0);
            });
        });

        weeklyMap[monday] = (weeklyMap[monday] || 0) + sessionTonnage;
    });

    return Object.entries(weeklyMap)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([week, tonnage]) => ({ week, tonnage: Math.round(tonnage) }));
}

/**
 * Egzersiz isminden veya etiketinden ana kas grubuna eşleme
 */
function mapMuscleName(raw = '') {
    const text = String(raw).toLowerCase();
    if (text.includes('göğüs') || text.includes('chest') || text.includes('press') && !text.includes('omuz') && !text.includes('overhead')) return 'Göğüs';
    if (text.includes('sırt') || text.includes('lat') || text.includes('row') || text.includes('pull') || text.includes('barfiks')) return 'Sırt';
    if (text.includes('omuz') || text.includes('deltoid') || text.includes('overhead') || text.includes('lateral')) return 'Omuz';
    if (text.includes('ön bacak') || text.includes('quad') || text.includes('squat') || text.includes('lunge')) return 'Ön Bacak';
    if (text.includes('arka bacak') || text.includes('hamstring') || text.includes('rdl') || text.includes('deadlift')) return 'Arka Bacak';
    if (text.includes('glute') || text.includes('kalça') || text.includes('hip thrust') || text.includes('swing')) return 'Glute';
    if (text.includes('biceps') || text.includes('pazu') || text.includes('curl')) return 'Biceps';
    if (text.includes('triceps') || text.includes('arka kol') || text.includes('pushdown')) return 'Triceps';
    if (text.includes('karın') || text.includes('core') || text.includes('plank') || text.includes('crunch')) return 'Karın/Core';
    if (text.includes('kalf') || text.includes('baldır') || text.includes('calf')) return 'Kalf';
    return 'Göğüs'; // varsayılan
}

module.exports = {
    VOLUME_LANDMARKS,
    analyzeAthleteHistory,
    mapMuscleName
};
