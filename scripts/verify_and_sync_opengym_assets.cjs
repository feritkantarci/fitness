const fs = require('fs');
const path = require('path');

const APPROVED_MAPPING = {
  "db_bench_press": { id: "0289", name: "Dambıl Bench Press" },
  "db_incline_press": { id: "0314", name: "Incline Dambıl Press" },
  "db_floor_press": { id: "3668", name: "Dambıl Floor Press" },
  "db_overhead_press": { id: "0405", name: "Oturarak Dambıl Omuz Presi (Seated)" },
  "db_standing_overhead_press": { id: "0426", name: "Ayakta Dambıl Omuz Presi (Standing)" },
  "db_arnold_press": { id: "2137", name: "Arnold Press" },
  "db_lateral_raise": { id: "0334", name: "Dambıl Lateral Raise" },
  "db_triceps_overhead": { id: "2188", name: "Dambıl Başüstü Triceps" },
  "db_skullcrusher": { id: "2589", name: "Dambıl Skullcrusher" },
  "db_goblet_squat": { id: "4816", name: "Dambıl Goblet Squat" },
  "db_front_squat": { id: "1760", name: "Çift Dambıl Ön Squat (Front Squat)" },
  "db_bulgarian_squat": { id: "7590", name: "Bulgar Split Squat" },
  "db_walking_lunge": { id: "4295", name: "Walking Lunge" },
  "db_reverse_lunge": { id: "0381", name: "Reverse Lunge" },
  "db_rdl": { id: "1459", name: "Dambıl RDL" },
  "db_single_leg_rdl": { id: "1757", name: "Tek Bacak RDL" },
  "db_saw_row": { id: "0292", name: "Dambıl Saw Row" },
  "db_chest_supported_row": { id: "0293", name: "Göğüs Destekli Dambıl Row" },
  "db_renegade_row": { id: "2980", name: "Renegade Row" },
  "db_pullover": { id: "0375", name: "Dambıl Pullover" },
  "db_hammer_curl": { id: "0313", name: "Dambıl Hammer Curl" },
  "db_incline_curl": { id: "0317", name: "Incline Dambıl Curl" },
  "db_farmers_walk": { id: "2917", name: "Dambıl Çiftçi Yürüyüşü (Farmer's Walk)" },
  "db_suitcase_carry": { id: "4133", name: "Suitcase Carry" },
  "db_russian_twist": { id: "3449", name: "Dambıl Russian Twist" },
  "db_snatch": { id: "3888", name: "Dambıl Snatch" },
  "db_swing": { id: "0549", name: "Dambıl Swing" },
  "kb_swing": { id: "0549", name: "Kettlebell Swing" },
  "kb_clean": { id: "4543", name: "Kettlebell Clean" },
  "kb_press": { id: "0538", name: "Kettlebell Press" },
  "kb_half_snatch": { id: "0529", name: "Kettlebell Half Snatch" },
  "kb_goblet_squat": { id: "2993", name: "Kettlebell Goblet Squat" },
  "kb_gorilla_row": { id: "0522", name: "Kettlebell Gorilla Row" },
  "kb_windmill": { id: "0554", name: "Kettlebell Windmill" },
  "kb_turkish_getup": { id: "4057", name: "Kettlebell Turkish Get-Up" },
  "kb_halo": { id: "6077", name: "Kettlebell Halo" },
  "kb_thruster": { id: "0538", name: "Kettlebell Thruster" },
  "bb_bench_press": { id: "0025", name: "Barbell Bench Press" },
  "bb_incline_bench": { id: "0047", name: "Incline Barbell Bench Press" },
  "bb_overhead_press": { id: "0091", name: "Overhead Press (Askeri Pres)" },
  "bb_back_squat": { id: "3593", name: "Barbell Back Squat" },
  "bb_front_squat": { id: "0042", name: "Barbell Front Squat" },
  "bb_deadlift": { id: "1543", name: "Geleneksel Deadlift (Conventional)" },
  "bb_rdl": { id: "0085", name: "Barbell RDL" },
  "bb_hip_thrust": { id: "0044", name: "Barbell Hip Thrust" },
  "bb_bent_over_row": { id: "0027", name: "Bent-Over Barbell Row" },
  "bb_pendlay_row": { id: "3017", name: "Pendlay Row" },
  "bb_biceps_curl": { id: "0031", name: "Barbell Biceps Curl" },
  "bb_close_grip_bench": { id: "0030", name: "Close Grip Bench Press" },
  "mach_lat_pulldown": { id: "0150", name: "Lat Pulldown" },
  "mach_cable_row": { id: "0861", name: "Seated Cable Row" },
  "mach_face_pull": { id: "5656", name: "Kablo Face Pull" },
  "mach_cable_crossover": { id: "8141", name: "Cable Crossover" },
  "mach_pec_deck": { id: "1030", name: "Pec Deck Fly" },
  "mach_triceps_pushdown": { id: "0241", name: "Kablo Triceps Pushdown" },
  "mach_cable_biceps": { id: "1607", name: "Kablo Biceps Curl" },
  "mach_cable_lateral": { id: "0178", name: "Kablo Lateral Raise" },
  "mach_leg_press": { id: "0599", name: "Leg Press" },
  "mach_leg_extension": { id: "0585", name: "Leg Extension" },
  "mach_leg_curl": { id: "3195", name: "Lying Leg Curl" },
  "mach_calf_raise": { id: "3018", name: "Standing Calf Raise" },
  "mach_cable_woodchopper": { id: "11251", name: "Cable Woodchopper" },
  "bw_pushup": { id: "0662", name: "Klasik Şınav (Push-Up)" },
  "bw_decline_pushup": { id: "0662", name: "Decline Push-Up" },
  "bw_diamond_pushup": { id: "0283", name: "Elmas Şınav (Diamond Push-Up)" },
  "bw_dips": { id: "1399", name: "Parallel Bar Dips" },
  "bw_pullup": { id: "0652", name: "Barfiks (Pull-Up)" },
  "bw_chinup": { id: "0670", name: "Ters Tutuş Barfiks (Chin-Up)" },
  "bw_inverted_row": { id: "0498", name: "Inverted Row" },
  "bw_air_squat": { id: "3948", name: "Vücut Ağırlığı Squat" },
  "bw_jump_squat": { id: "3222", name: "Zıplayan Squat (Jump Squat)" },
  "bw_glute_bridge": { id: "3013", name: "Glute Bridge" },
  "bw_hanging_knee_raise": { id: "9819", name: "Asılarak Diz Çekme" },
  "bw_hollow_body": { id: "1246", name: "Hollow Body Hold" },
  "bw_burpee": { id: "1160", name: "Burpee" },
  "bw_mountain_climber": { id: "0630", name: "Dağ Tırmanışı (Mountain Climber)" },
  "kneeling_plate_front_raise": { id: "0310", name: "Dizüstü Ön Omuz Kaldırma" },
  "half_kneeling_plate_chop": { id: "4572", name: "Half-Kneeling Rotational Chop" },
  "db_thruster": { id: "2968", name: "Dambıl Thruster" },
  "db_push_press": { id: "0426", name: "Dambıl Push Press" },
  "db_renegade_pushup": { id: "4736", name: "Renegade Row + Push-Up" },
  "bear_crawl_pull_through": { id: "3360", name: "Bear Crawl Dumbbell Pull-Through" },
  "db_clean_and_press": { id: "3400", name: "Tek Kol Dambıl Clean & Press" },
  "db_manmaker": { id: "3886", name: "Dambıl Manmaker" },
  "waiters_carry": { id: "9697", name: "Tek Kol Waiter's Walk" },
  "cross_body_carry": { id: "2911", name: "Cross-Body Carry" },
  "lunge_with_twist": { id: "5069", name: "Dambıl Lunge Rotasyonu" },
  "step_up_press": { id: "4185", name: "Box Step-Up + Press" },
  "bb_thruster": { id: "1540", name: "Barbell Thruster" },
  "bb_hang_power_clean": { id: "5704", name: "Barbell Hang Power Clean" },
  "bb_push_press": { id: "1540", name: "Barbell Push Press" },
  "bb_zercher_squat": { id: "5670", name: "Zercher Squat" },
  "bb_landmine_squat_press": { id: "1540", name: "Landmine Squat to Press" },
  "db_standing_calf_raise": { id: "0417", name: "Ayakta Dambıl Calf Raise" },
  "db_lying_leg_curl": { id: "6161", name: "Dambıl ile Yatarak Bacak Bükme" }
};

console.log(`Checking ${Object.keys(APPROVED_MAPPING).length} approved exercises...`);

let missingClips = [];
let missingStills = [];
const clipsDir = path.join(__dirname, '../assets/opengym/clips');
const stillsDir = path.join(__dirname, '../assets/opengym/stills');

// Check assets/opengym_all or assets/opengym_sample if missing in assets/opengym
const backupClipsDirs = [
  clipsDir,
  path.join(__dirname, '../assets/opengym_all/clips'),
  path.join(__dirname, '../assets/opengym_sample/clips')
];
const backupStillsDirs = [
  stillsDir,
  path.join(__dirname, '../assets/opengym_all/stills'),
  path.join(__dirname, '../assets/opengym_sample/stills')
];

for (const [key, item] of Object.entries(APPROVED_MAPPING)) {
  const clipName = `${item.id}.mp4`;
  const stillName = `${item.id}.webp`;

  let clipFound = false;
  let targetClipPath = path.join(clipsDir, clipName);
  for (const bDir of backupClipsDirs) {
    const src = path.join(bDir, clipName);
    if (fs.existsSync(src)) {
      if (!fs.existsSync(targetClipPath)) {
        fs.copyFileSync(src, targetClipPath);
      }
      clipFound = true;
      break;
    }
  }
  if (!clipFound) missingClips.push(`${key} (${item.id})`);

  let stillFound = false;
  let targetStillPath = path.join(stillsDir, stillName);
  for (const bDir of backupStillsDirs) {
    const src = path.join(bDir, stillName);
    if (fs.existsSync(src)) {
      if (!fs.existsSync(targetStillPath)) {
        fs.copyFileSync(src, targetStillPath);
      }
      stillFound = true;
      break;
    }
  }
  if (!stillFound) missingStills.push(`${key} (${item.id})`);
}

console.log(`Missing clips: ${missingClips.length}`);
if (missingClips.length) console.log(missingClips);
console.log(`Missing stills: ${missingStills.length}`);
if (missingStills.length) console.log(missingStills);
