const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '../js/app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. Kas Haritası: db_standing_overhead_press ekle
if (!code.includes('db_standing_overhead_press:')) {
    code = code.replace(
        "db_overhead_press: { primary: 'Ön Omuz', secondary: 'Triceps, Üst Göğüs, Core', subKey: 'shoulders_front' },",
        "db_overhead_press: { primary: 'Ön Omuz (Seated)', secondary: 'Triceps, Üst Göğüs, Core', subKey: 'shoulders_front' },\n            db_standing_overhead_press: { primary: 'Ön Omuz (Standing)', secondary: 'Triceps, Üst Göğüs, Core', subKey: 'shoulders_front' },"
    );
    console.log('1. Kas haritasına db_standing_overhead_press eklendi.');
}

// 2. 95 Onaylı OpenGym Kataloğu
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

let catalogEntries = [];
for (const [key, val] of Object.entries(APPROVED_MAPPING)) {
    catalogEntries.push(`            '${key}': { id: '${val.id}', name: ${JSON.stringify(val.name)}, clip: 'assets/opengym/clips/${val.id}.mp4', still: 'assets/opengym/stills/${val.id}.webp' }`);
}

const replacementCatalog = `        // ==================== OPENGYM MEDYA KATALOĞU (95 ONAYLI HAREKET) ====================
        window.OPENGYM_GLOBAL_CATALOG = {
${catalogEntries.join(',\n')}
        };

        // ==================== KULLANICI ÖZEL HAVUZ & GİZLEME YASASI ====================`;

code = code.replace(
    /\/\/\s*====================\s*KULLANICI ÖZEL HAVUZ & GİZLEME YASASI\s*====================/,
    replacementCatalog
);
console.log('2. window.OPENGYM_GLOBAL_CATALOG eklendi.');

// 3. switchGuideTab 'animasyon' paneli desteği
code = code.replace(
    "const panels = ['form', 'anatomi', 'adimlar'];",
    "const panels = ['animasyon', 'form', 'anatomi', 'adimlar'];"
);
console.log('3. switchGuideTab güncellendi.');

// 4. openImageLightbox & closeImageLightbox Video desteği
const targetLightboxBlock = `        function openImageLightbox(src, title) {
            if (!src) return;
            const modal = document.getElementById('imageLightboxModal');
            const img = document.getElementById('lightboxImg');
            const titleEl = document.getElementById('lightboxTitle');
            const zoomText = document.getElementById('lightboxZoomText');
            if (!modal || !img) return;

            img.src = src;
            img.classList.remove('zoomed');
            if (titleEl) titleEl.textContent = title || 'Egzersiz Formu';
            if (zoomText) zoomText.textContent = 'Büyüt (%180)';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeImageLightbox(event) {
            if (event && event.target && event.target.closest('.lightbox-content-box') && !event.target.classList.contains('btn-lightbox-close')) {
                return;
            }
            const modal = document.getElementById('imageLightboxModal');
            if (modal) {
                modal.classList.remove('active');
                const img = document.getElementById('lightboxImg');
                if (img) img.classList.remove('zoomed');
            }
            document.body.style.overflow = '';
        }`;

const replacementLightboxBlock = `        function openImageLightbox(src, title) {
            if (!src) return;
            const modal = document.getElementById('imageLightboxModal');
            const img = document.getElementById('lightboxImg');
            const videoEl = document.getElementById('lightboxVideo');
            const titleEl = document.getElementById('lightboxTitle');
            const zoomText = document.getElementById('lightboxZoomText');
            if (!modal) return;

            const isVideo = /\\.(mp4|webm)$/i.test(src);
            if (isVideo) {
                if (img) img.style.display = 'none';
                if (videoEl) {
                    videoEl.src = src;
                    videoEl.style.display = 'block';
                    videoEl.play().catch(() => {});
                }
                if (zoomText) zoomText.textContent = 'Canlı Döngü';
            } else {
                if (videoEl) {
                    videoEl.pause();
                    videoEl.style.display = 'none';
                }
                if (img) {
                    img.src = src;
                    img.style.display = 'block';
                    img.classList.remove('zoomed');
                }
                if (zoomText) zoomText.textContent = 'Büyüt (%180)';
            }

            if (titleEl) titleEl.textContent = title || 'Egzersiz Formu';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeImageLightbox(event) {
            if (event && event.target && event.target.closest('.lightbox-content-box') && !event.target.classList.contains('btn-lightbox-close')) {
                return;
            }
            const modal = document.getElementById('imageLightboxModal');
            if (modal) {
                modal.classList.remove('active');
                const img = document.getElementById('lightboxImg');
                const videoEl = document.getElementById('lightboxVideo');
                if (img) img.classList.remove('zoomed');
                if (videoEl) {
                    videoEl.pause();
                    videoEl.src = '';
                }
            }
            document.body.style.overflow = '';
        }`;

code = code.replace(targetLightboxBlock, replacementLightboxBlock);
console.log('4. Lightbox video oynatıcı fonksiyonları entegre edildi.');

// 5. Form Kılavuzu Sekmeleri & OpenGym Animasyon Paneli Entegrasyonu
const targetGuideTabBlock = `            return \`
                <div class="pos-guide-wrapper">
                    <div class="pos-guide-header" onclick="event.stopPropagation(); togglePosGuide('\${collapseId}')" style="padding:6px 10px;">
                        <span class="pos-type-badge \${badgeType}" style="padding:3px 8px; font-size:11px;">📐 Form Kılavuzu</span>
                        <button type="button" class="btn-toggle-guide" id="btn_\${collapseId}" onclick="event.stopPropagation(); togglePosGuide('\${collapseId}')" style="padding:3px 8px; font-size:11.5px;">
                            <span id="icon_\${collapseId}">\${btnText}</span>
                        </button>
                    </div>
                    <div class="\${contentClass}" id="\${collapseId}">
                        <!-- TABS SWITCHER (BASİT İKONLAR) -->
                        <div class="guide-toggle-tabs" style="display:flex; justify-content:center; gap:6px; padding:4px;">
                            <button type="button" class="btn-guide-tab active" id="tab_btn_form_\${collapseId}" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'form')" title="Form Görseli" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                📸 Form
                            </button>
                            <button type="button" class="btn-guide-tab" id="tab_btn_anatomi_\${collapseId}" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'anatomi')" title="Çalışan Kaslar" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                🧬 Kaslar
                            </button>
                            <button type="button" class="btn-guide-tab" id="tab_btn_adimlar_\${collapseId}" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'adimlar')" title="Adım Adım Talimatlar" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                📝 Adımlar
                            </button>
                        </div>

                        <!-- PANEL 1: FORM PHOTO / VECTOR -->
                        <div class="guide-tab-panel active" id="panel_form_\${collapseId}">
                            \${formVisualHtml}
                        </div>`;

const replacementGuideTabBlock = `            const openGymMedia = (window.OPENGYM_GLOBAL_CATALOG && window.OPENGYM_GLOBAL_CATALOG[ex.id]) || null;
            const hasOpenGym = !!openGymMedia;

            return \`
                <div class="pos-guide-wrapper">
                    <div class="pos-guide-header" onclick="event.stopPropagation(); togglePosGuide('\${collapseId}')" style="padding:6px 10px;">
                        <span class="pos-type-badge \${badgeType}" style="padding:3px 8px; font-size:11px;">📐 Form Kılavuzu</span>
                        <button type="button" class="btn-toggle-guide" id="btn_\${collapseId}" onclick="event.stopPropagation(); togglePosGuide('\${collapseId}')" style="padding:3px 8px; font-size:11.5px;">
                            <span id="icon_\${collapseId}">\${btnText}</span>
                        </button>
                    </div>
                    <div class="\${contentClass}" id="\${collapseId}">
                        <!-- TABS SWITCHER (BASİT İKONLAR) -->
                        <div class="guide-toggle-tabs" style="display:flex; justify-content:center; gap:6px; padding:4px;">
                            \${hasOpenGym ? \`
                                <button type="button" class="btn-guide-tab active" id="tab_btn_animasyon_\${collapseId}" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'animasyon')" title="Canlı Hareket Animasyonu" style="padding:5px 12px; font-size:12px; font-weight:800; background:rgba(56,189,248,0.15); color:var(--cyan); border:1px solid rgba(56,189,248,0.35);">
                                    🎬 Animasyon
                                </button>
                            \` : ''}
                            <button type="button" class="btn-guide-tab \${!hasOpenGym ? 'active' : ''}" id="tab_btn_form_\${collapseId}" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'form')" title="Form Rehberi" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                📸 \${hasOpenGym ? 'Fotoğraf' : 'Form'}
                            </button>
                            <button type="button" class="btn-guide-tab" id="tab_btn_anatomi_\${collapseId}" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'anatomi')" title="Çalışan Kaslar" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                🧬 Kaslar
                            </button>
                            <button type="button" class="btn-guide-tab" id="tab_btn_adimlar_\${collapseId}" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'adimlar')" title="Adım Adım Talimatlar" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                📝 Adımlar
                            </button>
                        </div>

                        \${hasOpenGym ? \`
                            <!-- PANEL 0: OPENGYM ANIMATION -->
                            <div class="guide-tab-panel active" id="panel_animasyon_\${collapseId}">
                                <div class="pos-diagram-wrap" id="wrap_anim_\${collapseId}" style="position:relative; background:#000; border-radius:12px; overflow:hidden; border:1px solid rgba(56,189,248,0.3); padding:4px;">
                                    <div class="pos-diagram-toolbar">
                                        <button type="button" class="btn-diagram-tool" onclick="event.stopPropagation(); openImageLightbox('\${openGymMedia.clip}', '\${escapeHTML(ex.name)} - Canlı Animasyon')" title="Tam ekran oynat">
                                            <span class="tool-icon">⛶</span> <span class="tool-text">Büyüt</span>
                                        </button>
                                        <button type="button" class="btn-diagram-tool" onclick="event.stopPropagation(); switchGuideTab('\${collapseId}', 'form')" title="Orijinal Çelik Kodu rehberine bak">
                                            <span class="tool-icon">📸</span> <span class="tool-text">Fotoğrafa Geç</span>
                                        </button>
                                    </div>
                                    <div style="cursor:pointer; display:flex; justify-content:center; align-items:center; min-height:200px; max-height:280px;" onclick="event.stopPropagation(); openImageLightbox('\${openGymMedia.clip}', '\${escapeHTML(ex.name)} - Canlı Animasyon')">
                                        <video src="\${openGymMedia.clip}" autoplay loop muted playsinline style="width:100%; max-height:260px; object-fit:contain; display:block;" onerror="this.style.display='none'; const st=document.getElementById('still_fallback_\${collapseId}'); if(st) st.style.display='block';"></video>
                                        <img id="still_fallback_\${collapseId}" src="\${openGymMedia.still}" alt="\${escapeHTML(ex.name)}" style="display:none; width:100%; max-height:260px; object-fit:contain;">
                                    </div>
                                    <div style="font-size:11px; color:#38bdf8; font-weight:700; padding:6px 10px; background:rgba(0,0,0,0.6); display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06);">
                                        <span>⚡ OpenGym Akıcı Mikro Animasyon</span>
                                        <span style="color:var(--text-secondary); font-size:10px;">🔍 Dokun: Büyüt</span>
                                    </div>
                                </div>
                                \${extraInfoHtml}
                            </div>
                        \` : ''}

                        <!-- PANEL 1: FORM PHOTO / VECTOR -->
                        <div class="guide-tab-panel \${!hasOpenGym ? 'active' : ''}" id="panel_form_\${collapseId}">
                            \${formVisualHtml}
                        </div>`;

code = code.replace(targetGuideTabBlock, replacementGuideTabBlock);
console.log('5. Form kılavuzu paneli OpenGym tab desteği ile zenginleştirildi.');

// 6. Antrenman kartlarına video thumbnail entegrasyonu (Tekil ve çoklu egzersiz kartları)
// Single exercise header
code = code.replace(
    `<h2 class="hevy-exercise-title">\${escapeHTML(ex.name)}</h2>`,
    `\${(typeof OPENGYM_GLOBAL_CATALOG !== 'undefined' && OPENGYM_GLOBAL_CATALOG[ex.id]) ? \`
        <div style="width:44px; height:44px; border-radius:8px; overflow:hidden; background:#000; border:1px solid rgba(56,189,248,0.35); flex:none; cursor:pointer;" onclick="toggleWorkoutFormGuide('\${ex.id}')" title="Form rehberini aç/kapat">
            <video src="\${OPENGYM_GLOBAL_CATALOG[ex.id].clip}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>
        </div>
    \` : ''}
    <div style="flex:1; min-width:0;">
        <h2 class="hevy-exercise-title" style="margin:0;">\${escapeHTML(ex.name)}</h2>
    </div>`
);

// Multiple exercises header
code = code.replace(
    `<div class="hevy-exercise-title">\n                                        <span style="color:var(--gold); font-weight:900;">\${idx + 1}.</span>\n                                        <span>\${escapeHTML(ex.name)}</span>\n                                    </div>`,
    `<div class="hevy-title-row" style="display:flex; align-items:center; gap:10px;">
        \${(typeof OPENGYM_GLOBAL_CATALOG !== 'undefined' && OPENGYM_GLOBAL_CATALOG[ex.id]) ? \`
            <div style="width:44px; height:44px; border-radius:8px; overflow:hidden; background:#000; border:1px solid rgba(56,189,248,0.35); flex:none; cursor:pointer;" onclick="toggleWorkoutFormGuide('\${ex.id}')" title="Form rehberini aç/kapat">
                <video src="\${OPENGYM_GLOBAL_CATALOG[ex.id].clip}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>
            </div>
        \` : ''}
        <div class="hevy-exercise-title" style="flex:1; min-width:0;">
            <span style="color:var(--gold); font-weight:900;">\${idx + 1}.</span>
            <span>\${escapeHTML(ex.name)}</span>
        </div>`
);
console.log('6. Antrenman kartlarına video thumbnail entegrasyonu uygulandı.');

// 7. Service Worker Registration: Bump to v=174
code = code.replace(
    "navigator.serviceWorker.register('./sw.js?v=173')",
    "navigator.serviceWorker.register('./sw.js?v=174')"
);
console.log('7. Service worker registration v=174 olarak güncellendi.');

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('app.js BAŞARIYLA GÜNCELLENDİ!');
