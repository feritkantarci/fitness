const CACHE_NAME = 'celik-kodu-cache-v265';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/exercises-db.js',
  './js/app.js',
  './assets/diagrams/canva_anatomy_neutral.png',
  './assets/diagrams/seq_manmaker.svg',
  './assets/guides/guide_bb_thruster_form.png',
  './assets/guides/guide_bb_hang_power_clean_form.png',
  './assets/guides/guide_bb_push_press_form.png',
  './assets/guides/guide_bb_zercher_squat_form.png',
  './assets/guides/guide_bb_landmine_squat_press_form.png',
  './assets/guides/guide_db_thruster_form.jpg',
  './assets/guides/guide_db_thruster_anatomi.jpg',
  './assets/guides/guide_db_push_press_form.jpg',
  './assets/guides/guide_db_renegade_pushup_form.jpg',
  './assets/guides/guide_bear_crawl_pull_through_form.jpg',
  './assets/guides/guide_db_clean_and_press_form.jpg',
  './assets/guides/guide_db_manmaker_form.jpg',
  './assets/guides/guide_db_manmaker_anatomi.jpg',
  './assets/guides/guide_waiters_carry_form.jpg',
  './assets/guides/guide_cross_body_carry_form.jpg',
  './assets/guides/guide_lunge_with_twist_form.jpg',
  './assets/guides/guide_step_up_press_form.jpg',
  './assets/guides/guide_half_kneeling_plate_chop_form.jpg',
  './assets/guides/guide_half_kneeling_plate_chop_anatomi.jpg',
  './assets/diagrams/seq_half_kneeling_plate_chop.svg',
  './assets/guides/guide_kneeling_plate_front_raise_form.jpg',
  './assets/guides/guide_kneeling_plate_front_raise_anatomi.jpg',
  './assets/diagrams/seq_kneeling_plate_front_raise.svg',
  './assets/guides/guide_bb_pendlay_row_anatomi.jpg',
  './assets/guides/guide_bb_pendlay_row_form.jpg',
  './assets/guides/guide_kb_gorilla_row_anatomi.jpg',
  './assets/guides/guide_kb_gorilla_row_form.jpg',
  './assets/guides/guide_db_incline_curl_anatomi.jpg',
  './assets/guides/guide_db_incline_curl_form.jpg',
  './assets/guides/guide_db_renegade_row_anatomi.jpg',
  './assets/guides/guide_db_renegade_row_form.jpg',
  './assets/guides/guide_db_chest_supported_row_anatomi.jpg',
  './assets/guides/guide_db_chest_supported_row_form.jpg',
  './assets/guides/guide_bw_inverted_row_anatomi.jpg',
  './assets/guides/guide_bw_inverted_row_form.jpg',
  './assets/guides/guide_bw_chinup_anatomi.jpg',
  './assets/guides/guide_bw_chinup_form.jpg',
  './assets/guides/guide_mach_cable_row_anatomi.jpg',
  './assets/guides/guide_mach_cable_row_form.jpg',
  './assets/guides/guide_mach_cable_lateral_anatomi.jpg',
  './assets/guides/guide_mach_cable_lateral_form.jpg',
  './assets/guides/guide_kb_press_anatomi.jpg',
  './assets/guides/guide_kb_press_form.jpg',
  './assets/guides/guide_bw_diamond_pushup_anatomi.jpg',
  './assets/guides/guide_bw_diamond_pushup_form.jpg',
  './assets/guides/guide_mach_pec_deck_anatomi.jpg',
  './assets/guides/guide_mach_pec_deck_form.jpg',
  './assets/guides/guide_mach_chest_press_anatomi.jpg',
  './assets/guides/guide_mach_chest_press_form.jpg',
  './assets/guides/guide_bb_bench_press_anatomi.jpg',
  './assets/guides/guide_bb_bench_press_form.jpg',
  './assets/guides/guide_db_arnold_press_anatomi.jpg',
  './assets/guides/guide_db_arnold_press_form.jpg',
  './assets/guides/guide_db_floor_press_anatomi.jpg',
  './assets/guides/guide_db_floor_press_form.jpg',
  './assets/guides/guide_db_incline_press_anatomi.jpg',
  './assets/guides/guide_db_incline_press_form.jpg',
  './assets/diagrams/seq_biceps_curl.svg',
  './assets/diagrams/seq_chinup.svg',
  './assets/diagrams/seq_pullover.svg',
  './assets/guides/guide_bw_air_squat_form.jpg',
  './assets/guides/guide_bw_air_squat_anatomi.jpg',
  './assets/guides/guide_kb_swing_form.jpg',
  './assets/guides/guide_kb_swing_anatomi.jpg',
  './assets/guides/guide_bw_glute_bridge_form.jpg',
  './assets/guides/guide_bw_glute_bridge_anatomi.jpg',
  './assets/guides/guide_mach_cable_woodchopper_form.jpg',
  './assets/guides/guide_mach_cable_woodchopper_anatomi.jpg',
  './assets/guides/guide_db_pullover_form.jpg',
  './assets/guides/guide_db_pullover_anatomi.jpg',
  './assets/guides/guide_bw_burpee_form.jpg',
  './assets/guides/guide_bw_burpee_anatomi.jpg',
  './assets/guides/guide_bw_mountain_climber_form.jpg',
  './assets/guides/guide_bw_mountain_climber_anatomi.jpg',
  './assets/guides/guide_bw_hollow_body_form.jpg',
  './assets/guides/guide_bw_hollow_body_anatomi.jpg',
  './index.html',
  './manifest.json',
  './assets/guides/guide_db_skullcrusher_anatomi.jpg',
  './assets/guides/guide_db_skullcrusher_form.jpg',
  './assets/guides/guide_db_triceps_overhead_anatomi.jpg',
  './assets/guides/guide_db_triceps_overhead_form.jpg',
  './assets/guides/guide_bw_pushup_anatomi.jpg',
  './assets/guides/guide_bw_pushup_form.jpg',
  './assets/guides/guide_db_bench_press_anatomi.jpg',
  './assets/guides/guide_db_bench_press_form.jpg',
  './assets/guides/guide_db_goblet_squat_anatomi.jpg',
  './assets/guides/guide_db_goblet_squat_form.jpg',
  './assets/guides/guide_db_overhead_press_anatomi.jpg',
  './assets/guides/guide_db_overhead_press_form.jpg',
  './assets/guides/guide_db_rdl_anatomi.jpg',
  './assets/guides/guide_db_rdl_form.jpg',
  './assets/guides/guide_db_single_leg_rdl_anatomi.jpg',
  './assets/guides/guide_db_single_leg_rdl_form.jpg',
  './assets/guides/guide_db_saw_row_anatomi.jpg',
  './assets/guides/guide_db_saw_row_form.jpg',
  './assets/guides/guide_db_snatch_anatomi.jpg',
  './assets/guides/guide_db_snatch_form.jpg',
  './assets/guides/guide_db_swing_anatomi.jpg',
  './assets/guides/guide_db_swing_form.jpg',
  './assets/guides/guide_db_walking_lunge_anatomi.jpg',
  './assets/guides/guide_db_walking_lunge_form.jpg',
  './assets/guides/guide_bw_pullup_anatomi.jpg',
  './assets/guides/guide_bw_pullup_form.jpg',
  './assets/guides/guide_bb_deadlift_anatomi.jpg',
  './assets/guides/guide_bb_deadlift_form.jpg',
  './assets/guides/guide_db_biceps_curl_anatomi.jpg',
  './assets/guides/guide_db_biceps_curl_form.jpg',
  './assets/guides/guide_bw_plank_anatomi.jpg',
  './assets/guides/guide_bw_plank_form.jpg',
  './assets/guides/guide_bb_back_squat_anatomi.jpg',
  './assets/guides/guide_bb_back_squat_form.jpg',
  './assets/guides/guide_bb_hip_thrust_anatomi.jpg',
  './assets/guides/guide_bb_hip_thrust_form.jpg',
  './assets/guides/guide_bw_dips_anatomi.jpg',
  './assets/guides/guide_bw_dips_form.jpg',
  './assets/guides/guide_bw_hanging_knee_raise_anatomi.jpg',
  './assets/guides/guide_bw_hanging_knee_raise_form.jpg',
  './assets/guides/guide_db_bulgarian_squat_anatomi.jpg',
  './assets/guides/guide_db_bulgarian_squat_form.jpg',
  './assets/guides/guide_db_farmers_walk_anatomi.jpg',
  './assets/guides/guide_db_farmers_walk_form.jpg',
  './assets/guides/guide_db_lateral_raise_anatomi.jpg',
  './assets/guides/guide_db_lateral_raise_form.jpg',
  './assets/guides/guide_db_russian_twist_anatomi.jpg',
  './assets/guides/guide_db_russian_twist_form.jpg',
  './assets/guides/guide_mach_face_pull_anatomi.jpg',
  './assets/guides/guide_mach_face_pull_form.jpg',
  './assets/guides/guide_mach_triceps_pushdown_anatomi.jpg',
  './assets/guides/guide_mach_triceps_pushdown_form.jpg',
  './assets/guides/guide_kb_halo_anatomi.jpg',
  './assets/guides/guide_kb_halo_form.jpg',
  './assets/guides/guide_kb_windmill_anatomi.jpg',
  './assets/guides/guide_kb_windmill_form.jpg',
  './assets/guides/guide_mach_leg_press_anatomi.jpg',
  './assets/guides/guide_mach_leg_press_form.jpg',
  './assets/guides/guide_mach_leg_extension_anatomi.jpg',
  './assets/guides/guide_mach_leg_extension_form.jpg',
  './assets/guides/guide_mach_calf_raise_anatomi.jpg',
  './assets/guides/guide_mach_calf_raise_form.jpg',
  './assets/guides/guide_mach_leg_curl_anatomi.jpg',
  './assets/guides/guide_mach_leg_curl_form.jpg',
  './assets/guides/guide_mach_lat_pulldown_anatomi.jpg',
  './assets/guides/guide_mach_lat_pulldown_form.jpg',
  './assets/guides/guide_kb_clean_anatomi.jpg',
  './assets/guides/guide_kb_clean_form.jpg',
  './assets/diagrams/seq_db_clean_squat.svg',
  './assets/diagrams/seq_db_lunge.svg',
  './assets/diagrams/seq_db_press.svg',
  './assets/diagrams/seq_db_rdl.svg',
  './assets/diagrams/seq_db_single_leg_rdl.svg',
  './assets/diagrams/seq_db_row.svg',
  './assets/diagrams/seq_db_snatch.svg',
  './assets/diagrams/seq_db_squat.svg',
  './assets/diagrams/seq_db_swing.svg',
  './assets/diagrams/seq_diamond_pushup.svg',
  './assets/diagrams/seq_escalera.svg',
  './assets/diagrams/seq_farmers_walk.svg',
  './assets/diagrams/seq_floor_press.svg',
  './assets/diagrams/seq_incline_row.svg',
  './assets/diagrams/seq_lateral_raise.svg',
  './assets/diagrams/seq_leg_raise.svg',
  './assets/diagrams/seq_overhead_carry.svg',
  './assets/diagrams/seq_plank_pull_through.svg',
  './assets/diagrams/seq_pushup.svg',
  './assets/diagrams/seq_renegade_row.svg',
  './assets/diagrams/seq_russian_twist.svg',
  './assets/diagrams/seq_skull_crusher.svg',
  './assets/diagrams/seq_thruster.svg',
  './assets/diagrams/seq_windmill.svg',
  './assets/exercises/db_clean_squat_press.webp',
  './assets/exercises/db_swing_to_goblet_squat.webp',
  './assets/exercises/db_rdl_to_high_pull.webp',
  './assets/exercises/db_lunge_to_curl_press.webp',
  './assets/exercises/bw_inchworm_to_pushup.webp',
  './assets/exercises/db_gorilla_row_to_clean.webp',
  './assets/exercises/db_floor_press_to_bridge.webp',
  './assets/exercises/db_step_back_lunge_to_knee_drive.webp',
  './assets/exercises/db_pullover_to_halo.webp',
  './assets/exercises/db_seesaw_lunge.webp',
  './assets/exercises/kb_turkish_getup.webp',
  './assets/exercises/bb_back_squat.webp',
  './assets/exercises/db_rotational_lunge_chop.webp',
  './assets/exercises/db_rotational_gorilla_row.webp',
  './assets/exercises/db_single_arm_rear_delt_row.webp',
  './assets/exercises/db_high_pull_cuban_rotation.webp',
  './assets/exercises/db_dumbbell_shrug_burnout.webp',
  './assets/exercises/db_quadruped_external_rotation.webp',
  './assets/exercises/bw_jumping_jack.gif',
  './assets/exercises/bw_jumping_jack.webp',
  './assets/exercises/bw_high_knees.webp',
  './assets/exercises/bw_jump_rope.webp',
  './assets/exercises/bw_butt_kicks.webp',
  './assets/exercises/bw_skater_jumps.webp',
  './assets/exercises/bw_plank_jacks.webp',
  './assets/exercises/bw_squat_thrust.webp',
  './assets/exercises/bw_lateral_shuffle.webp',
  './assets/guides/guide_db_suitcase_carry_form.jpg',
  './assets/guides/guide_db_suitcase_carry_anatomi.jpg',
  './assets/guides/guide_bw_sissy_squat_form.jpg',
  './assets/guides/guide_bw_sissy_squat_anatomi.jpg',
  './assets/guides/guide_mach_straight_arm_pulldown_form.jpg',
  './assets/guides/guide_mach_straight_arm_pulldown_anatomi.jpg',
  './assets/guides/guide_bw_hyperextension_form.jpg',
  './assets/guides/guide_bw_hyperextension_anatomi.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('Cache pre-fill warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Firebase Firestore, Google API ve OCR CDN çağrılarını doğrudan ağa yönlendir
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('identitytoolkit') ||
      event.request.url.includes('securetoken') ||
      event.request.url.includes('jsdelivr') ||
      event.request.url.includes('tesseract') ||
      event.request.url.includes('tessdata') ||
      event.request.url.includes('test-live-workout.html')) {
    return;
  }

  // Sayfa gezintileri (HTML) ve kod dosyaları (JS/CSS) için Network-First stratejisi (Canlı güncellemeler anında yansısın)
  if (event.request.mode === 'navigate' || 
      event.request.destination === 'document' || 
      event.request.destination === 'script' ||
      event.request.destination === 'style' ||
      event.request.url.includes('.js') ||
      event.request.url.includes('.css') ||
      event.request.url.includes('index.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
        })
    );
    return;
  }

  // Statik medya ve varlıklar için Cache-First stratejisi
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      });
    })
  );
});
