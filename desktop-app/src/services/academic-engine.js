/**
 * FitLAB - AKADEMİK SPOR BİLİMİ MOTORU (Academic Sports Science Engine)
 * 
 * Bilimsel Referanslar ve Biyomekanik Modeller:
 * - Brad Schoenfeld (2010, 2019): "Dose-response relationship between resistance training volume and hypertrophy" & "Exercise Selection"
 * - Chris Beardsley (Strength & Conditioning Research): "Mechanical Tension & Effective Reps Model"
 * - Dr. Mike Israetel (Renaissance Periodization): Volume Landmarks (MV, MEV, MAV, MRV) & Compound Fractional Loading
 * - Eric Helms & Greg Nuckols: SFR (Stimulus-to-Fatigue Ratio) & Calisthenics vs Free-Weight Equivalence
 * - Pedrosa et al. (2022) & Maeo et al. (2021): Stretch-Mediated Hypertrophy (Lengthened Overload)
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
 * FitLAB AKADEMİK EGZERSİZ BİYOMEKANİK SÖZLÜĞÜ (94 Egzersizin Tam Haritası)
 * 
 * Egzersiz Tipleri ve Mekanik Gerilim Katsayısı (MTF):
 * - HEAVY_COMPOUND: Serbest ağırlık/dambıl bileşik (MTF: 1.0)
 * - ISOLATION: Doğrudan hedef kas izolasyonu (MTF: 1.0)
 * - BODYWEIGHT_STRENGTH: Vücut ağırlığı kuvvet hareketi (MTF: 0.65 - 0.85)
 * - BALLISTIC_POWER: Patlayıcı arka zincir / omuz (MTF: 0.50 - 0.60)
 * - LOADED_CARRY: Yüklü omurga zırhı ve stabilizasyon (MTF: 0.60)
 * - CORE: Karın ve omurga rotasyon/anti-rotasyon (MTF: 0.50 - 0.85)
 * - MOBILITY_STABILITY: Eklem kapsülü ve dinamik stabilite (MTF: 0.40 - 0.60)
 * - CONDITIONING: Kardiyovasküler & metabolik dayanıklılık. HİPERTROFİK KATSAYISI = 0.0 (SIFIR)!
 */
const EXERCISE_SPEC = {
    // ==========================================
    // 1. GÖĞÜS & YATAY İTİŞ (CHEST & HORIZONTAL PUSH)
    // ==========================================
    'barbell bench': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'dambıl bench press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'bench press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'incline barbell bench': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.45, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'incline dambıl press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.45, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'eğimli sehpa dambıl pres (incline db press)': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.45, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'dambıl floor press': { primary: 'Göğüs', pFactor: 0.85, sec: { 'Triceps': 0.45, 'Omuz': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },
    'makine göğüs presi': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Triceps': 0.30, 'Omuz': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'kablo crossover': { primary: 'Göğüs', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'kablo göğüs sıkıştırma (cable flyes / crossover)': { primary: 'Göğüs', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'pec deck kelebek': { primary: 'Göğüs', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'dips': { primary: 'Göğüs', pFactor: 0.85, sec: { 'Triceps': 0.40, 'Omuz': 0.30 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'MODERATE', lengthened: true },
    'şınav (push-up)': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25, 'Karın/Core': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
    'klasik şınav (floor push-up)': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25, 'Karın/Core': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
    'şınav': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25, 'Karın/Core': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
    'decline şınav': { primary: 'Göğüs', pFactor: 0.75, sec: { 'Omuz': 0.35, 'Triceps': 0.25, 'Karın/Core': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
    'dambıl pullover': { primary: 'Göğüs', pFactor: 0.50, sec: { 'Sırt': 0.50, 'Triceps': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },

    // ==========================================
    // 2. SIRT & ÇEKİŞ (BACK, LATS & PULL)
    // ==========================================
    'barbell row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40, 'Omuz': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
    'pendlay row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.35, 'Omuz': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },
    'dambıl saw row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40, 'Karın/Core': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'göğüs destekli row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40, 'Omuz': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'gorilla row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40, 'Karın/Core': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
    'lat pulldown': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.35, 'Omuz': 0.20 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'kablo row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'barfiks (pull-up)': { primary: 'Sırt', pFactor: 0.85, sec: { 'Biceps': 0.40, 'Karın/Core': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
    'yatay barfiks': { primary: 'Sırt', pFactor: 0.70, sec: { 'Biceps': 0.35, 'Karın/Core': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
    'chin-up (ters barfiks)': { primary: 'Biceps', pFactor: 0.85, sec: { 'Sırt': 0.65 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
    'renegade row': { primary: 'Sırt', pFactor: 0.70, sec: { 'Karın/Core': 0.70, 'Biceps': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },
    'renegade row + şınav': { primary: 'Sırt', pFactor: 0.60, sec: { 'Göğüs': 0.50, 'Karın/Core': 0.60, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'MODERATE', lengthened: false },

    // ==========================================
    // 3. OMUZ (DELTOIDS - ANTERIOR, LATERAL, POSTERIOR)
    // ==========================================
    'barbell omuz presi': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35, 'Karın/Core': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'dambıl omuz presi': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35, 'Karın/Core': 0.20 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'kettlebell press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35, 'Karın/Core': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'kettlebell strict overhead press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35, 'Karın/Core': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'arnold press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'barbell push press': { primary: 'Omuz', pFactor: 0.80, sec: { 'Triceps': 0.30, 'Ön Bacak': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
    'dambıl push press': { primary: 'Omuz', pFactor: 0.80, sec: { 'Triceps': 0.30, 'Ön Bacak': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
    'dambıl lateral raise': { primary: 'Omuz', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
    'kablo lateral raise': { primary: 'Omuz', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'face pull': { primary: 'Omuz', pFactor: 0.80, sec: { 'Sırt': 0.50 }, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'diz üstü plaka ön omuz kaldırış': { primary: 'Omuz', pFactor: 0.80, sec: { 'Karın/Core': 0.30 }, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
    'kettlebell halo': { primary: 'Omuz', pFactor: 0.40, sec: { 'Karın/Core': 0.40 }, type: 'MOBILITY_STABILITY', sfr: 'HIGH', lengthened: false },
    'dambıl snatch': { primary: 'Omuz', pFactor: 0.50, sec: { 'Arka Bacak': 0.30, 'Glute': 0.30, 'Karın/Core': 0.30 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
    'kettlebell snatch': { primary: 'Omuz', pFactor: 0.50, sec: { 'Arka Bacak': 0.30, 'Glute': 0.30, 'Karın/Core': 0.30 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
    'dambıl clean & press': { primary: 'Omuz', pFactor: 0.70, sec: { 'Glute': 0.35, 'Arka Bacak': 0.30, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
    'step-up + omuz presi': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.60, 'Glute': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },

    // ==========================================
    // 4. BACAK - QUAD DOMINANT (ÖN BACAK)
    // ==========================================
    'barbell back squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Karın/Core': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
    'barbell front squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40, 'Karın/Core': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'çift dambıl ön squat (front squat)': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40, 'Karın/Core': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'barbell zercher squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40, 'Karın/Core': 0.50, 'Biceps': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
    'dambıl goblet squat': { primary: 'Ön Bacak', pFactor: 0.90, sec: { 'Glute': 0.40, 'Karın/Core': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'kettlebell goblet squat': { primary: 'Ön Bacak', pFactor: 0.90, sec: { 'Glute': 0.40, 'Karın/Core': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    '45° leg press': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'bulgar split squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.60 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'walking lunge': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Karın/Core': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'reverse lunge': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'leg extension': { primary: 'Ön Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
    'air squat': { primary: 'Ön Bacak', pFactor: 0.30, sec: { 'Glute': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
    'jump squat': { primary: 'Ön Bacak', pFactor: 0.50, sec: { 'Glute': 0.35 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
    'lunge + gövde rotasyonu': { primary: 'Ön Bacak', pFactor: 0.80, sec: { 'Glute': 0.40, 'Karın/Core': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },

    // ==========================================
    // 5. BACAK - POSTERIOR CHAIN & ARKA BACAK (HAMSTRINGS)
    // ==========================================
    'barbell rdl': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Sırt': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'dambıl rdl': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Sırt': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'tek bacak rdl': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.60, 'Karın/Core': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'barbell deadlift': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.65, 'Sırt': 0.50, 'Karın/Core': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'LOW', lengthened: true },
    'leg curl': { primary: 'Arka Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'barbell hang power clean': { primary: 'Arka Bacak', pFactor: 0.50, sec: { 'Glute': 0.50, 'Omuz': 0.30, 'Sırt': 0.30 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
    'kettlebell clean': { primary: 'Glute', pFactor: 0.50, sec: { 'Arka Bacak': 0.40, 'Karın/Core': 0.30 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },

    // ==========================================
    // 6. BÜYÜK KALÇA (GLUTEUS MAXIMUS / MEDIUS)
    // ==========================================
    'barbell hip thrust': { primary: 'Glute', pFactor: 1.0, sec: { 'Arka Bacak': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: false },
    'glute bridge': { primary: 'Glute', pFactor: 1.0, sec: { 'Arka Bacak': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: false },
    'dambıl swing': { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40, 'Karın/Core': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'HIGH', lengthened: true },
    'kettlebell swing': { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40, 'Karın/Core': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'HIGH', lengthened: true },

    // ==========================================
    // 7. KOL - PAZU (BICEPS)
    // ==========================================
    'incline dambıl curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'barbell curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
    'hammer curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
    'kablo biceps curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },

    // ==========================================
    // 8. KOL - ARKA KOL (TRICEPS)
    // ==========================================
    'dambıl başüstü triceps': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'dambıl skullcrusher': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
    'halat triceps pushdown': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
    'dar tutuş bench': { primary: 'Triceps', pFactor: 0.85, sec: { 'Göğüs': 0.50, 'Omuz': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
    'elmas şınav': { primary: 'Triceps', pFactor: 0.70, sec: { 'Göğüs': 0.35, 'Karın/Core': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },

    // ==========================================
    // 9. BALDIR (CALVES)
    // ==========================================
    'calf raise': { primary: 'Kalf', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },

    // ==========================================
    // 10. KARIN & OMURGA CORE ZIRHI (CORE & CARRIES)
    // ==========================================
    'russian twist': { primary: 'Karın/Core', pFactor: 0.70, sec: {}, type: 'CORE', sfr: 'HIGH', lengthened: false },
    'kablo woodchopper': { primary: 'Karın/Core', pFactor: 0.80, sec: { 'Omuz': 0.20 }, type: 'CORE', sfr: 'HIGH', lengthened: false },
    'yarım diz üstü plaka oduncu (woodchopper)': { primary: 'Karın/Core', pFactor: 0.80, sec: { 'Omuz': 0.20 }, type: 'CORE', sfr: 'HIGH', lengthened: false },
    'plank': { primary: 'Karın/Core', pFactor: 0.50, sec: {}, type: 'CORE', sfr: 'HIGH', lengthened: false },
    'hollow body': { primary: 'Karın/Core', pFactor: 0.80, sec: {}, type: 'CORE', sfr: 'HIGH', lengthened: false },
    'barda dize çekme': { primary: 'Karın/Core', pFactor: 0.85, sec: { 'Sırt': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
    "farmer's walk": { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Sırt': 0.35 }, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
    'suitcase carry': { primary: 'Karın/Core', pFactor: 0.60, sec: {}, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
    'garson taşıması (waiter carry)': { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Omuz': 0.40 }, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
    'çapraz taşıma (cross-body carry)': { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Omuz': 0.30 }, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
    'ayı emeklemesi plaka çekişi': { primary: 'Karın/Core', pFactor: 0.70, sec: { 'Omuz': 0.35 }, type: 'CORE', sfr: 'MODERATE', lengthened: false },
    'turkish get-up': { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Omuz': 0.50, 'Glute': 0.35 }, type: 'MOBILITY_STABILITY', sfr: 'MODERATE', lengthened: false },

    // ==========================================
    // 11. HİBRİT GÜÇ / KOMPLEKS EGZERSİZLER
    // ==========================================
    'barbell thruster': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.70, 'Glute': 0.35, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'LOW', lengthened: false },
    'dambıl thruster': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.70, 'Glute': 0.35, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'LOW', lengthened: false },
    'kettlebell thruster': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.70, 'Glute': 0.35, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'LOW', lengthened: false },
    'landmine squat to press': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.65, 'Glute': 0.35, 'Triceps': 0.20 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: false },

    // ==========================================
    // 12. METABOLİK KONDİSYON (KAS HİPERTROFİSİNE KESİNLİKLE 0.0x VERİR)
    // ==========================================
    'burpee': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
    'mountain climber': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
    'dambıl manmaker': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
    'jumping jack': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
    'ip atlama': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false }
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

    // 3. Heuristic Çözümleyici (Fallback)
    const text = `${cleanName} ${String(rawMuscle).toLowerCase()} ${String(category).toLowerCase()}`;

    // Kardiyo / Kondisyon tespiti -> Kesinlikle 0x
    if (text.includes('burpee') || text.includes('climber') || text.includes('cardio') || text.includes('kondisyon') || text.includes('jumping') || text.includes('manmaker')) {
        return { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false };
    }

    let primary = 'Göğüs';
    let pFactor = 1.0;
    let sec = {};
    let type = 'HEAVY_COMPOUND';
    let sfr = 'HIGH';
    let lengthened = false;

    if (text.includes('bench') || (text.includes('press') && !text.includes('omuz') && !text.includes('overhead') && !text.includes('leg'))) {
        primary = 'Göğüs';
        sec = { 'Omuz': 0.35, 'Triceps': 0.35 };
        lengthened = true;
    } else if (text.includes('şınav') || text.includes('push-up') || text.includes('pushup')) {
        primary = 'Göğüs';
        pFactor = 0.65;
        sec = { 'Omuz': 0.25, 'Triceps': 0.25, 'Karın/Core': 0.20 };
        type = 'BODYWEIGHT_STRENGTH';
    } else if (text.includes('row') || text.includes('lat') || text.includes('barfiks') || text.includes('pull-up') || text.includes('çekiş')) {
        primary = 'Sırt';
        sec = { 'Biceps': 0.40 };
        lengthened = true;
    } else if (text.includes('omuz') || text.includes('overhead') || text.includes('arnold') || text.includes('deltoid')) {
        primary = 'Omuz';
        sec = { 'Triceps': 0.35 };
        lengthened = true;
    } else if (text.includes('squat') || text.includes('lunge') || text.includes('ön bacak') || text.includes('kuadriseps') || text.includes('quad')) {
        primary = 'Ön Bacak';
        sec = { 'Glute': 0.40 };
        lengthened = true;
    } else if (text.includes('rdl') || text.includes('deadlift') || text.includes('hamstring') || text.includes('leg curl') || text.includes('arka bacak')) {
        primary = 'Arka Bacak';
        sec = { 'Glute': 0.50 };
        lengthened = true;
    } else if (text.includes('swing') || text.includes('glute') || text.includes('kalça') || text.includes('hip thrust')) {
        primary = 'Glute';
        sec = { 'Arka Bacak': 0.40 };
        pFactor = 0.60;
        type = 'BALLISTIC_POWER';
    } else if (text.includes('curl') || text.includes('biceps')) {
        primary = 'Biceps';
        type = 'ISOLATION';
        lengthened = text.includes('incline');
    } else if (text.includes('triceps') || text.includes('arka kol') || text.includes('pushdown')) {
        primary = 'Triceps';
        type = 'ISOLATION';
        lengthened = text.includes('başüstü') || text.includes('overhead');
    } else if (text.includes('kalf') || text.includes('calf') || text.includes('baldır')) {
        primary = 'Kalf';
        type = 'ISOLATION';
        lengthened = true;
    } else if (text.includes('core') || text.includes('karın') || text.includes('twist') || text.includes('carry')) {
        primary = 'Karın/Core';
        pFactor = 0.60;
        type = 'CORE';
    }

    return { primary, pFactor, sec, type, sfr, lengthened };
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
    let lengthenedSetsTotal = 0;
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

            if (spec.lengthened) {
                lengthenedSetsTotal += completedSets.length;
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
            lengthenedSetsCount: lengthenedSetsTotal,
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
