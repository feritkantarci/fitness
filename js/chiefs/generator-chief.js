// ==================== ODA 1: PROGRAM ÜRETİCİ ŞEFİ (generator-guard) ====================
        // ==================== WORKOUT GENERATOR ENGINE ====================
        const SPLIT_METAS = {
            full_body: { name: "Tüm Vücut", shortName: "Tüm Vücut", icon: "⚡" },
            upper_push: { name: "Üst İtiş", shortName: "İtiş", icon: "🛡️" },
            upper_pull: { name: "Üst Çekiş", shortName: "Çekiş", icon: "⚔️" },
            lower: { name: "Alt Vücut", shortName: "Alt Vücut", icon: "🦵" },
            upper: { name: "Tüm Üst Vücut", shortName: "Üst Vücut", icon: "🦅" },
            core: { name: "Karın & Core", shortName: "Core", icon: "🧱" },
            functional: { name: "Fonksiyonel & Kondisyon", shortName: "Fonksiyonel", icon: "⚡" },
            flow_complex: { name: "⚔️ Çelik Akışı (Flow Kompleks)", shortName: "Çelik Akışı", icon: "⚔️" },
            iso_chest: { name: "Göğüs", shortName: "Göğüs", icon: "🎯" },
            iso_back: { name: "Sırt & Kanat", shortName: "Sırt", icon: "🎯" },
            iso_shoulders: { name: "Omuz", shortName: "Omuz", icon: "🎯" },
            iso_arms: { name: "Kol (Biceps & Triceps)", shortName: "Kol", icon: "🎯" },
            iso_legs: { name: "Bacak & Kalça", shortName: "Bacak", icon: "🎯" },
            iso_core: { name: "Karın & Core", shortName: "Karın", icon: "🎯" }
        };

        function updateSelectedSplitLabel() {
            const el = document.getElementById('selectedSplitLabel');
            if (!el) return;
            if (window.aiGeneratorScope === 'flow_complex') {
                el.innerText = '⚡ Çelik Akışı (20 Dk Dambıl Kompleksi)';
                return;
            }
            if (window.aiGeneratorScope === 'weekly') {
                const tplMap = {
                    ai_auto: 'AI Otomatik',
                    auto: 'AI Otomatik',
                    upper_lower_full: '3 Gün • Üst / Alt / Tüm Vücut',
                    ppl_3day: '3 Gün • İtiş / Çekiş / Bacak',
                    fullbody_3day: '3 Gün • Tüm Vücut',
                    full_body_abc: '3 Gün • Tüm Vücut',
                    upper_lower_4day: '4 Gün • Üst / Alt',
                    flow_complex_3day: '3 Gün • Çelik Akışı'
                };
                el.innerText = tplMap[window.selectedAiWeeklyTemplate] || 'AI Otomatik';
                return;
            }
            if (!selectedSplits || selectedSplits.length === 0) {
                el.innerText = '⚠️ Seçilmedi';
                return;
            }
            if (selectedSplits.length === 1) {
                const s = selectedSplits[0];
                const meta = SPLIT_METAS[s] || { name: s, icon: "⚡" };
                el.innerText = meta.name;
            } else {
                const names = selectedSplits.map(s => {
                    const m = SPLIT_METAS[s];
                    return m ? (m.shortName || m.name) : s;
                });
                el.innerText = names.join(' + ');
            }
        }

        function updateSelectedEquipLabel() {
            const el = document.getElementById('selectedEquipLabel');
            if (!el) return;
            const names = {
                dumbbell: 'Dambıl',
                bench: 'Sehpa',
                kettlebell: 'Kettlebell',
                barbell: 'Bar & Plaka',
                pullup_bar: 'Barfiks/Dips',
                machine: 'Makine',
                bodyweight: 'Vücut Ağ.'
            };
            const labels = selectedEquipments.map(e => names[e] || e);
            if (labels.length === ALL_EQUIPMENT_KEYS.length) {
                el.innerText = '🏢 Tüm Ekipmanlar (' + labels.length + ' Seçili)';
            } else if (labels.length === 0) {
                el.innerText = '⚠️ Seçilmedi';
            } else if (labels.length === 1) {
                el.innerText = `🏋️ ${labels[0]}`;
            } else {
                el.innerText = `🏋️ ${labels.join(', ')} (${labels.length} Seçili)`;
            }
        }

        function updateSelectedParamLabel() {
            const el = document.getElementById('selectedParamLabel');
            if (!el) return;
            const styleEl = document.getElementById('paramStyle');
            const goalEl = document.getElementById('paramGoal');
            const durEl = document.getElementById('paramDuration');
            
            const styleTxt = styleEl ? styleEl.options[styleEl.selectedIndex].text.replace(/^[^\w\sÇĞİÖŞÜçğıöşü]*\s*/, '').split('(')[0].trim() : 'Orta Süperset';
            const goalTxt = goalEl ? goalEl.options[goalEl.selectedIndex].text.replace(/^[^\w\sÇĞİÖŞÜçğıöşü]*\s*/, '').split('(')[0].trim() : 'Kas';
            const durTxt = durEl ? durEl.value + ' Dk' : '45 Dk';

            el.innerText = `⚡ ${styleTxt} • 🛡️ ${goalTxt} • ⏱️ ${durTxt}`;
        }

        function toggleGenSection(sectionId) {
            const sec = document.getElementById(sectionId);
            const arrow = document.getElementById(sectionId.replace('Section', 'PickerArrow'));
            if (!sec) return;
            const isOpen = sec.classList.contains('mobile-open');
            sec.classList.toggle('mobile-open', !isOpen);
            if (arrow) arrow.classList.toggle('arrow-up', !isOpen);
        }

        function closeGenSection(sectionId) {
            const sec = document.getElementById(sectionId);
            const arrow = document.getElementById(sectionId.replace('Section', 'PickerArrow'));
            if (sec) sec.classList.remove('mobile-open');
            if (arrow) arrow.classList.remove('arrow-up');
        }

        function renderSplitCards() {
            document.querySelectorAll('#splitGrid .split-card').forEach(card => {
                const splitKey = card.getAttribute('data-split-key') || (() => {
                    const onclickVal = card.getAttribute('onclick') || '';
                    const match = onclickVal.match(/'([^']+)'/);
                    return match ? match[1] : '';
                })();
                if (splitKey) {
                    const isSelected = selectedSplits.includes(splitKey);
                    card.classList.toggle('selected', isSelected);
                }
            });
            document.querySelectorAll('#isoMuscleGrid .iso-muscle-chip').forEach(chip => {
                const isoKey = chip.getAttribute('data-iso-key');
                if (isoKey) {
                    const isSelected = selectedSplits.includes(isoKey);
                    chip.classList.toggle('selected', isSelected);
                    chip.classList.toggle('active', isSelected);
                    chip.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
                }
            });
        }

        function toggleSplit(split) {
            // Bölge şablonu seçildiğinde izole kas seçimlerini temizle
            selectedSplits = selectedSplits.filter(s => !String(s).startsWith('iso_'));

            if (split === 'flow_complex') {
                selectedSplits = ['flow_complex'];
                selectedSplit = 'flow_complex';
                const styleEl = document.getElementById('paramStyle');
                const durEl = document.getElementById('paramDuration');
                if (styleEl) styleEl.value = 'complex';
                if (durEl) durEl.value = '20';
                if (typeof updateSelectedParamLabel === 'function') updateSelectedParamLabel();
                renderSplitCards();
                updateSelectedSplitLabel();
                return;
            }

            // Normal bir bölge seçildiğinde flow_complex'i kaldır
            selectedSplits = selectedSplits.filter(s => s !== 'flow_complex');

            if (split === 'full_body') {
                selectedSplits = ['full_body'];
            } else {
                const fbIdx = selectedSplits.indexOf('full_body');
                if (fbIdx > -1) {
                    selectedSplits.splice(fbIdx, 1);
                }

                const idx = selectedSplits.indexOf(split);
                if (idx > -1) {
                    if (selectedSplits.length === 1) {
                        selectedSplits = ['full_body'];
                    } else {
                        selectedSplits.splice(idx, 1);
                    }
                } else {
                    selectedSplits.push(split);
                }
            }
            selectedSplit = selectedSplits[0] || 'full_body';
            renderSplitCards();
            updateSelectedSplitLabel();
        }

        function toggleIsolatedMuscle(isoKey) {
            if (!isoKey) return;
            // İzole kas seçildiğinde genel bölge şablonlarını (Tüm Vücut / İtiş / Çekiş / Alt Vücut) devre dışı bırak
            const currentIso = selectedSplits.filter(s => String(s).startsWith('iso_'));
            const idx = currentIso.indexOf(isoKey);
            if (idx > -1) {
                currentIso.splice(idx, 1);
            } else {
                currentIso.push(isoKey);
            }
            selectedSplits = currentIso.length > 0 ? currentIso : ['full_body'];
            selectedSplit = selectedSplits[0] || 'full_body';
            renderSplitCards();
            updateSelectedSplitLabel();
        }
        window.toggleIsolatedMuscle = toggleIsolatedMuscle;

        function selectSplit(split) {
            if (Array.isArray(split)) {
                selectedSplits = split.length > 0 ? split : ['full_body'];
            } else if (typeof split === 'string') {
                selectedSplits = [split];
            }
            selectedSplit = selectedSplits[0] || 'full_body';
            if (selectedSplit === 'flow_complex') {
                const styleEl = document.getElementById('paramStyle');
                const durEl = document.getElementById('paramDuration');
                if (styleEl) styleEl.value = 'complex';
                if (durEl) durEl.value = '20';
                if (typeof updateSelectedParamLabel === 'function') updateSelectedParamLabel();
            }
            renderSplitCards();
            updateSelectedSplitLabel();
        }

        window.toggleGenSection = toggleGenSection;
        window.closeGenSection = closeGenSection;
        window.updateSelectedParamLabel = updateSelectedParamLabel;
        window.toggleSplit = toggleSplit;
        window.selectSplit = selectSplit;
        window.renderSplitCards = renderSplitCards;

        function toggleEquip(eq) {
            const idx = selectedEquipments.indexOf(eq);
            if (idx > -1) {
                if (selectedEquipments.length === 1) {
                    alert("En az bir ekipman seçili olmalıdır!");
                    return;
                }
                selectedEquipments.splice(idx, 1);
            } else {
                selectedEquipments.push(eq);
            }
            renderEquipChips();
            updateSelectedEquipLabel();
            if (typeof renderStudioOwnedEquipChips === 'function') renderStudioOwnedEquipChips();
            if (typeof renderCustomRoutine === 'function') renderCustomRoutine();
            if (typeof renderStudioExerciseCatalog === 'function') renderStudioExerciseCatalog();
        }

        function setQuickEquip(type) {
            if (type === 'all') {
                selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            } else if (type === 'db_only') {
                selectedEquipments = ['dumbbell'];
            } else if (type === 'db_kb_bw') {
                selectedEquipments = ['dumbbell', 'bench', 'kettlebell', 'bodyweight'];
            } else if (type === 'bw_only') {
                selectedEquipments = ['bodyweight'];
            }
            renderEquipChips();
            updateSelectedEquipLabel();
            if (typeof renderStudioOwnedEquipChips === 'function') renderStudioOwnedEquipChips();
            if (typeof renderCustomRoutine === 'function') renderCustomRoutine();
            if (typeof renderStudioExerciseCatalog === 'function') renderStudioExerciseCatalog();
        }

        function renderEquipChips() {
            const chips = document.querySelectorAll('#equipChipsWrap .equip-chip');
            chips.forEach(chip => {
                const match = chip.getAttribute('onclick').match(/'([^']+)'/);
                if (match) {
                    chip.classList.toggle('selected', selectedEquipments.includes(match[1]));
                }
            });
            updateSelectedEquipLabel();
        }

        function getRepAndRestScheme(goal, style) {
            if (goal === 'strength') {
                return { sets: 4, reps: '4 - 6', rest: 90, straightRest: 90, supersetRest: 60 };
            } else if (goal === 'endurance') {
                return { sets: 3, reps: '12 - 15', rest: 30, straightRest: 45, supersetRest: 30 };
            } else {
                // hypertrophy (Schumann et al. 2022 & Weakley et al. 2017)
                if (style === 'superset') {
                    // Orta / Akademik Hibrit: Ana bileşik düz setlerde 90s, süperset bloklarında 45-60s
                    return { sets: 3, reps: '8 - 12', rest: 60, straightRest: 90, supersetRest: 45 };
                } else if (style === 'superset_light') {
                    // Az Süperset: Düz setlerde 75-90s, kapanış süpersetinde 45s
                    return { sets: 3, reps: '8 - 12', rest: 75, straightRest: 90, supersetRest: 45 };
                } else if (style === 'superset_intense') {
                    // Yoğun Süperset: Tamamı ikili süperset, tur sonu 45s
                    return { sets: 3, reps: '8 - 12', rest: 45, straightRest: 60, supersetRest: 45 };
                } else if (style === 'emom') {
                    return { sets: 4, reps: '10 - 12', rest: 30, straightRest: 30, supersetRest: 30 };
                } else if (style === 'complex' || style === 'flow') {
                    // Akademik Kompleks (Javorek 1988 & McGill 2012): 4 Tur, 6-8 Akış Tekrarı, Dinlenme Sadece Tur Sonu 90s (İstasyon Arası 0s)
                    return { sets: 4, reps: '6 - 8', rest: 90, straightRest: 90, supersetRest: 0 };
                }
                return { sets: 3, reps: '8 - 12', rest: 75, straightRest: 75, supersetRest: 60 };
            }
        }

                // ==================== OPENGYM MEDYA KATALOĞU (95 ONAYLI HAREKET) ====================
        
        // ==================== EVRENSEL GÖRSEL MEDYA ÇÖZÜMLEYİCİ ====================
        function getExerciseVisualMedia(exId, category) {
            const opengym = (typeof OPENGYM_GLOBAL_CATALOG !== 'undefined' && OPENGYM_GLOBAL_CATALOG) ? OPENGYM_GLOBAL_CATALOG[exId] : null;
            const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[exId]) || 
                          (typeof window !== 'undefined' && window.exerciseGuideMap && window.exerciseGuideMap[exId]) || null;
            let diagram = null;
            if (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) {
                const ex = EXERCISES_DB.find(e => e.id === exId);
                if (ex && ex.diagram) diagram = ex.diagram;
            }
            const fallbackVisual = (guide && guide.form) ? guide.form : (diagram || null);
            return {
                clip: opengym ? opengym.clip : null,
                still: opengym ? opengym.still : fallbackVisual,
                form: fallbackVisual || (opengym ? opengym.still : null),
                anatomi: (guide && guide.anatomi) ? guide.anatomi : null,
                hasVideo: !!opengym
            };
        }
    
        window.OPENGYM_GLOBAL_CATALOG = {
            'db_bench_press': { id: '0289', name: "Dambıl Bench Press", clip: 'assets/opengym/clips/0289.mp4', still: 'assets/opengym/stills/0289.webp' },
            'db_incline_press': { id: '0314', name: "Incline Dambıl Press", clip: 'assets/opengym/clips/0314.mp4', still: 'assets/opengym/stills/0314.webp' },
            'db_floor_press': { id: '3668', name: "Dambıl Floor Press", clip: 'assets/opengym/clips/3668.mp4', still: 'assets/opengym/stills/3668.webp' },
            'db_overhead_press': { id: '0405', name: "Oturarak Dambıl Omuz Presi (Seated)", clip: 'assets/opengym/clips/0405.mp4', still: 'assets/opengym/stills/0405.webp' },
            'db_standing_overhead_press': { id: '0426', name: "Ayakta Dambıl Omuz Presi (Standing)", clip: 'assets/opengym/clips/0426.mp4', still: 'assets/opengym/stills/0426.webp' },
            'db_arnold_press': { id: '2137', name: "Arnold Press", clip: 'assets/opengym/clips/2137.mp4', still: 'assets/opengym/stills/2137.webp' },
            'db_lateral_raise': { id: '0334', name: "Dambıl Lateral Raise", clip: 'assets/opengym/clips/0334.mp4', still: 'assets/opengym/stills/0334.webp' },
            'db_triceps_overhead': { id: '2188', name: "Dambıl Başüstü Triceps", clip: 'assets/opengym/clips/2188.mp4', still: 'assets/opengym/stills/2188.webp' },
            'db_skullcrusher': { id: '2589', name: "Dambıl Skullcrusher", clip: 'assets/opengym/clips/2589.mp4', still: 'assets/opengym/stills/2589.webp' },
            'db_goblet_squat': { id: '4816', name: "Dambıl Goblet Squat", clip: 'assets/opengym/clips/4816.mp4', still: 'assets/opengym/stills/4816.webp' },
            'db_front_squat': { id: '1760', name: "Çift Dambıl Ön Squat (Front Squat)", clip: 'assets/opengym/clips/1760.mp4', still: 'assets/opengym/stills/1760.webp' },
            'db_bulgarian_squat': { id: '7590', name: "Bulgar Split Squat", clip: 'assets/opengym/clips/7590.mp4', still: 'assets/opengym/stills/7590.webp' },
            'db_walking_lunge': { id: '4295', name: "Walking Lunge", clip: 'assets/opengym/clips/4295.mp4', still: 'assets/opengym/stills/4295.webp' },
            'db_reverse_lunge': { id: '0381', name: "Reverse Lunge", clip: 'assets/opengym/clips/0381.mp4', still: 'assets/opengym/stills/0381.webp' },
            'db_rdl': { id: '1459', name: "Dambıl RDL", clip: 'assets/opengym/clips/1459.mp4', still: 'assets/opengym/stills/1459.webp' },
            'db_single_leg_rdl': { id: '1757', name: "Tek Bacak RDL", clip: 'assets/opengym/clips/1757.mp4', still: 'assets/opengym/stills/1757.webp' },
            'db_saw_row': { id: '0292', name: "Dambıl Saw Row", clip: 'assets/opengym/clips/0292.mp4', still: 'assets/opengym/stills/0292.webp' },
            'db_chest_supported_row': { id: '0293', name: "Göğüs Destekli Dambıl Row", clip: 'assets/opengym/clips/0293.mp4', still: 'assets/opengym/stills/0293.webp' },
            'db_renegade_row': { id: '2980', name: "Renegade Row", clip: 'assets/opengym/clips/2980.mp4', still: 'assets/opengym/stills/2980.webp' },
            'db_pullover': { id: '0375', name: "Dambıl Pullover", clip: 'assets/opengym/clips/0375.mp4', still: 'assets/opengym/stills/0375.webp' },
            'db_hammer_curl': { id: '0313', name: "Dambıl Hammer Curl", clip: 'assets/opengym/clips/0313.mp4', still: 'assets/opengym/stills/0313.webp' },
            'db_incline_curl': { id: '0317', name: "Incline Dambıl Curl", clip: 'assets/opengym/clips/0317.mp4', still: 'assets/opengym/stills/0317.webp' },
            'db_farmers_walk': { id: '2917', name: "Dambıl Çiftçi Yürüyüşü (Farmer's Walk)", clip: 'assets/opengym/clips/2917.mp4', still: 'assets/opengym/stills/2917.webp' },
            'db_russian_twist': { id: '3449', name: "Dambıl Russian Twist", clip: 'assets/opengym/clips/3449.mp4', still: 'assets/opengym/stills/3449.webp' },
            'db_snatch': { id: '3888', name: "Dambıl Snatch", clip: 'assets/opengym/clips/3888.mp4', still: 'assets/opengym/stills/3888.webp' },
            'db_swing': { id: '0549', name: "Dambıl Swing", clip: 'assets/opengym/clips/0549.mp4', still: 'assets/opengym/stills/0549.webp' },
            'kb_swing': { id: '0549', name: "Kettlebell Swing", clip: 'assets/opengym/clips/0549.mp4', still: 'assets/opengym/stills/0549.webp' },
            'kb_clean': { id: '4543', name: "Kettlebell Clean", clip: 'assets/opengym/clips/4543.mp4', still: 'assets/opengym/stills/4543.webp' },
            'kb_press': { id: '0538', name: "Kettlebell Press", clip: 'assets/opengym/clips/0538.mp4', still: 'assets/opengym/stills/0538.webp' },
            'kb_half_snatch': { id: '0529', name: "Kettlebell Half Snatch", clip: 'assets/opengym/clips/0529.mp4', still: 'assets/opengym/stills/0529.webp' },
            'kb_goblet_squat': { id: '2993', name: "Kettlebell Goblet Squat", clip: 'assets/opengym/clips/2993.mp4', still: 'assets/opengym/stills/2993.webp' },
            'kb_gorilla_row': { id: '0522', name: "Kettlebell Gorilla Row", clip: 'assets/opengym/clips/0522.mp4', still: 'assets/opengym/stills/0522.webp' },
            'kb_windmill': { id: '0554', name: "Kettlebell Windmill", clip: 'assets/opengym/clips/0554.mp4', still: 'assets/opengym/stills/0554.webp' },
            'kb_turkish_getup': { id: 'kb_turkish_getup', name: "Kettlebell Turkish Get-Up", clip: 'assets/opengym/clips/kb_turkish_getup.mp4', still: 'assets/opengym/stills/kb_turkish_getup.webp' },
            'kb_halo': { id: '6077', name: "Kettlebell Halo", clip: 'assets/opengym/clips/6077.mp4', still: 'assets/opengym/stills/6077.webp' },
            'kb_thruster': { id: '0538', name: "Kettlebell Thruster", clip: 'assets/opengym/clips/0538.mp4', still: 'assets/opengym/stills/0538.webp' },
            'bb_bench_press': { id: '0025', name: "Barbell Bench Press", clip: 'assets/opengym/clips/0025.mp4', still: 'assets/opengym/stills/0025.webp' },
            'bb_incline_bench': { id: '0047', name: "Incline Barbell Bench Press", clip: 'assets/opengym/clips/0047.mp4', still: 'assets/opengym/stills/0047.webp' },
            'bb_overhead_press': { id: '0091', name: "Overhead Press (Askeri Pres)", clip: 'assets/opengym/clips/0091.mp4', still: 'assets/opengym/stills/0091.webp' },
            'bb_back_squat': { id: 'bb_back_squat', name: "Barbell Back Squat", clip: 'assets/opengym/clips/bb_back_squat.mp4', still: 'assets/opengym/stills/bb_back_squat.webp' },
            'bb_front_squat': { id: '0042', name: "Barbell Front Squat", clip: 'assets/opengym/clips/0042.mp4', still: 'assets/opengym/stills/0042.webp' },
            'bb_deadlift': { id: '1543', name: "Geleneksel Deadlift (Conventional)", clip: 'assets/opengym/clips/1543.mp4', still: 'assets/opengym/stills/1543.webp' },
            'bb_rdl': { id: '0085', name: "Barbell RDL", clip: 'assets/opengym/clips/0085.mp4', still: 'assets/opengym/stills/0085.webp' },
            'bb_bent_over_row': { id: '0027', name: "Bent-Over Barbell Row", clip: 'assets/opengym/clips/0027.mp4', still: 'assets/opengym/stills/0027.webp' },
            'bb_pendlay_row': { id: '3017', name: "Pendlay Row", clip: 'assets/opengym/clips/3017.mp4', still: 'assets/opengym/stills/3017.webp' },
            'bb_biceps_curl': { id: '0031', name: "Barbell Biceps Curl", clip: 'assets/opengym/clips/0031.mp4', still: 'assets/opengym/stills/0031.webp' },
            'bb_close_grip_bench': { id: '0030', name: "Close Grip Bench Press", clip: 'assets/opengym/clips/0030.mp4', still: 'assets/opengym/stills/0030.webp' },
            'mach_lat_pulldown': { id: '0150', name: "Lat Pulldown", clip: 'assets/opengym/clips/0150.mp4', still: 'assets/opengym/stills/0150.webp' },
            'mach_cable_row': { id: '0861', name: "Seated Cable Row", clip: 'assets/opengym/clips/0861.mp4', still: 'assets/opengym/stills/0861.webp' },
            'mach_face_pull': { id: '5656', name: "Kablo Face Pull", clip: 'assets/opengym/clips/5656.mp4', still: 'assets/opengym/stills/5656.webp' },
            'mach_cable_crossover': { id: '8141', name: "Cable Crossover", clip: 'assets/opengym/clips/8141.mp4', still: 'assets/opengym/stills/8141.webp' },
            'mach_pec_deck': { id: '1030', name: "Pec Deck Fly", clip: 'assets/opengym/clips/1030.mp4', still: 'assets/opengym/stills/1030.webp' },
            'mach_triceps_pushdown': { id: '0241', name: "Kablo Triceps Pushdown", clip: 'assets/opengym/clips/0241.mp4', still: 'assets/opengym/stills/0241.webp' },
            'mach_cable_biceps': { id: '1607', name: "Kablo Biceps Curl", clip: 'assets/opengym/clips/1607.mp4', still: 'assets/opengym/stills/1607.webp' },
            'mach_cable_lateral': { id: '0178', name: "Kablo Lateral Raise", clip: 'assets/opengym/clips/0178.mp4', still: 'assets/opengym/stills/0178.webp' },
            'mach_leg_extension': { id: '0585', name: "Leg Extension", clip: 'assets/opengym/clips/0585.mp4', still: 'assets/opengym/stills/0585.webp' },
            'mach_leg_curl': { id: '3195', name: "Lying Leg Curl", clip: 'assets/opengym/clips/3195.mp4', still: 'assets/opengym/stills/3195.webp' },
            'mach_calf_raise': { id: '3018', name: "Standing Calf Raise", clip: 'assets/opengym/clips/3018.mp4', still: 'assets/opengym/stills/3018.webp' },
            'mach_cable_woodchopper': { id: '11251', name: "Cable Woodchopper", clip: 'assets/opengym/clips/11251.mp4', still: 'assets/opengym/stills/11251.webp' },
            'bw_pushup': { id: '0662', name: "Klasik Şınav (Push-Up)", clip: 'assets/opengym/clips/0662.mp4', still: 'assets/opengym/stills/0662.webp' },
            'bw_decline_pushup': { id: '0662', name: "Decline Push-Up", clip: 'assets/opengym/clips/0662.mp4', still: 'assets/opengym/stills/0662.webp' },
            'bw_diamond_pushup': { id: '0283', name: "Elmas Şınav (Diamond Push-Up)", clip: 'assets/opengym/clips/0283.mp4', still: 'assets/opengym/stills/0283.webp' },
            'bw_dips': { id: '1399', name: "Parallel Bar Dips", clip: 'assets/opengym/clips/1399.mp4', still: 'assets/opengym/stills/1399.webp' },
            'bw_pullup': { id: '0652', name: "Barfiks (Pull-Up)", clip: 'assets/opengym/clips/0652.mp4', still: 'assets/opengym/stills/0652.webp' },
            'bw_chinup': { id: '0670', name: "Ters Tutuş Barfiks (Chin-Up)", clip: 'assets/opengym/clips/0670.mp4', still: 'assets/opengym/stills/0670.webp' },
            'bw_inverted_row': { id: '0498', name: "Inverted Row", clip: 'assets/opengym/clips/0498.mp4', still: 'assets/opengym/stills/0498.webp' },
            'bw_air_squat': { id: '3948', name: "Vücut Ağırlığı Squat", clip: 'assets/opengym/clips/3948.mp4', still: 'assets/opengym/stills/3948.webp' },
            'bw_jump_squat': { id: '3222', name: "Zıplayan Squat (Jump Squat)", clip: 'assets/opengym/clips/3222.mp4', still: 'assets/opengym/stills/3222.webp' },
            'bw_glute_bridge': { id: '3013', name: "Glute Bridge", clip: 'assets/opengym/clips/3013.mp4', still: 'assets/opengym/stills/3013.webp' },
            'bw_hanging_knee_raise': { id: '9819', name: "Asılarak Diz Çekme", clip: 'assets/opengym/clips/9819.mp4', still: 'assets/opengym/stills/9819.webp' },
            'bw_hollow_body': { id: '1246', name: "Hollow Body Hold", clip: 'assets/opengym/clips/1246.mp4', still: 'assets/opengym/stills/1246.webp' },
            'bw_burpee': { id: '1160', name: "Burpee", clip: 'assets/opengym/clips/1160.mp4', still: 'assets/opengym/stills/1160.webp' },
            'bw_mountain_climber': { id: '0630', name: "Dağ Tırmanışı (Mountain Climber)", clip: 'assets/opengym/clips/0630.mp4', still: 'assets/opengym/stills/0630.webp' },
            'kneeling_plate_front_raise': { id: '0310', name: "Dizüstü Ön Omuz Kaldırma", clip: 'assets/opengym/clips/0310.mp4', still: 'assets/opengym/stills/0310.webp' },
            'half_kneeling_plate_chop': { id: '4572', name: "Half-Kneeling Rotational Chop", clip: 'assets/opengym/clips/4572.mp4', still: 'assets/opengym/stills/4572.webp' },
            'db_thruster': { id: '2968', name: "Dambıl Thruster", clip: 'assets/opengym/clips/2968.mp4', still: 'assets/opengym/stills/2968.webp' },
            'db_push_press': { id: '0426', name: "Dambıl Push Press", clip: 'assets/opengym/clips/0426.mp4', still: 'assets/opengym/stills/0426.webp' },
            'db_renegade_pushup': { id: '4736', name: "Renegade Row + Push-Up", clip: 'assets/opengym/clips/4736.mp4', still: 'assets/opengym/stills/4736.webp' },
            'bear_crawl_pull_through': { id: '3360', name: "Bear Crawl Dumbbell Pull-Through", clip: 'assets/opengym/clips/3360.mp4', still: 'assets/opengym/stills/3360.webp' },
            'db_clean_and_press': { id: '3400', name: "Tek Kol Dambıl Clean & Press", clip: 'assets/opengym/clips/3400.mp4', still: 'assets/opengym/stills/3400.webp' },
            'db_manmaker': { id: '3886', name: "Dambıl Manmaker", clip: 'assets/opengym/clips/3886.mp4', still: 'assets/opengym/stills/3886.webp' },
            'waiters_carry': { id: '9697', name: "Tek Kol Waiter's Walk", clip: 'assets/opengym/clips/9697.mp4', still: 'assets/opengym/stills/9697.webp' },
            'cross_body_carry': { id: '2911', name: "Cross-Body Carry", clip: 'assets/opengym/clips/2911.mp4', still: 'assets/opengym/stills/2911.webp' },
            'lunge_with_twist': { id: '5069', name: "Dambıl Lunge Rotasyonu", clip: 'assets/opengym/clips/5069.mp4', still: 'assets/opengym/stills/5069.webp' },
            'step_up_press': { id: '4185', name: "Box Step-Up + Press", clip: 'assets/opengym/clips/4185.mp4', still: 'assets/opengym/stills/4185.webp' },
            'bb_thruster': { id: '1540', name: "Barbell Thruster", clip: 'assets/opengym/clips/1540.mp4', still: 'assets/opengym/stills/1540.webp' },
            'bb_hang_power_clean': { id: '5704', name: "Barbell Hang Power Clean", clip: 'assets/opengym/clips/5704.mp4', still: 'assets/opengym/stills/5704.webp' },
            'bb_push_press': { id: '1540', name: "Barbell Push Press", clip: 'assets/opengym/clips/1540.mp4', still: 'assets/opengym/stills/1540.webp' },
            'bb_zercher_squat': { id: '5670', name: "Zercher Squat", clip: 'assets/opengym/clips/5670.mp4', still: 'assets/opengym/stills/5670.webp' },
            'bb_landmine_squat_press': { id: '1540', name: "Landmine Squat to Press", clip: 'assets/opengym/clips/1540.mp4', still: 'assets/opengym/stills/1540.webp' },
            'db_standing_calf_raise': { id: '0417', name: "Ayakta Dambıl Calf Raise", clip: 'assets/opengym/clips/0417.mp4', still: 'assets/opengym/stills/0417.webp' },
            'db_lying_leg_curl': { id: '6161', name: "Dambıl ile Yatarak Bacak Bükme", clip: 'assets/opengym/clips/6161.mp4', still: 'assets/opengym/stills/6161.webp' },
            'bw_plank': { id: '0463', name: "Klasik Plank", clip: 'assets/opengym/clips/0463.mp4', still: 'assets/opengym/stills/0463.webp' },
            'bw_sissy_squat': { id: '4723', name: "Sissy Squat (Quad İzolasyonu)", clip: 'assets/opengym/clips/4723.mp4', still: 'assets/opengym/stills/4723.webp' },
            'db_clean_squat_press': { id: 'db_clean_squat_press', name: "Dambıl Clean to Front Squat to Push Press", clip: 'assets/opengym/clips/db_clean_squat_press.mp4', still: 'assets/opengym/stills/db_clean_squat_press.webp' },
            'db_swing_to_goblet_squat': { id: 'db_swing_to_goblet_squat', name: "Dambıl Swing to Goblet Squat", clip: 'assets/opengym/clips/db_swing_to_goblet_squat.mp4', still: 'assets/opengym/stills/db_swing_to_goblet_squat.webp' },
            'db_rdl_to_high_pull': { id: 'db_rdl_to_high_pull', name: "Dambıl RDL to High Pull", clip: 'assets/opengym/clips/db_rdl_to_high_pull.mp4', still: 'assets/opengym/stills/db_rdl_to_high_pull.webp' },
            'db_lunge_to_curl_press': { id: 'db_lunge_to_curl_press', name: "Dambıl Lunge to Biceps Curl to Overhead Press", clip: 'assets/opengym/clips/db_lunge_to_curl_press.mp4', still: 'assets/opengym/stills/db_lunge_to_curl_press.webp' },
            'bw_inchworm_to_pushup': { id: 'bw_inchworm_to_pushup', name: "Vücut Ağırlığı Inchworm to Şınav", clip: 'assets/opengym/clips/bw_inchworm_to_pushup.mp4', still: 'assets/opengym/stills/bw_inchworm_to_pushup.webp' },
            'db_gorilla_row_to_clean': { id: 'db_gorilla_row_to_clean', name: "Dambıl Goril Row to Clean", clip: 'assets/opengym/clips/db_gorilla_row_to_clean.mp4', still: 'assets/opengym/stills/db_gorilla_row_to_clean.webp' },
            'db_floor_press_to_bridge': { id: 'db_floor_press_to_bridge', name: "Dambıl Floor Press to Glute Bridge", clip: 'assets/opengym/clips/db_floor_press_to_bridge.mp4', still: 'assets/opengym/stills/db_floor_press_to_bridge.webp' },
            'db_step_back_lunge_to_knee_drive': { id: 'db_step_back_lunge_to_knee_drive', name: "Dambıl Step Back Lunge to Knee Drive Press", clip: 'assets/opengym/clips/db_step_back_lunge_to_knee_drive.mp4', still: 'assets/opengym/stills/db_step_back_lunge_to_knee_drive.webp' },
            'db_pullover_to_halo': { id: 'db_pullover_to_halo', name: "Dambıl Pullover to Halo", clip: 'assets/opengym/clips/db_pullover_to_halo.mp4', still: 'assets/opengym/stills/db_pullover_to_halo.webp' },
            'db_seesaw_lunge': { id: 'db_seesaw_lunge', name: "Dambıl Seesaw Lunge", clip: 'assets/opengym/clips/db_seesaw_lunge.mp4', still: 'assets/opengym/stills/db_seesaw_lunge.webp' },
            'db_rotational_lunge_chop': { id: 'db_rotational_lunge_chop', name: "Rotasyonel Lunge & Dambıl Savuruş", clip: 'assets/opengym/clips/db_rotational_lunge_chop.mp4', still: 'assets/opengym/stills/db_rotational_lunge_chop.webp' },
            'db_rotational_gorilla_row': { id: 'db_rotational_gorilla_row', name: "Rotasyonel Gorilla Row", clip: 'assets/opengym/clips/db_rotational_gorilla_row.mp4', still: 'assets/opengym/stills/db_rotational_gorilla_row.webp' },
            'db_single_arm_rear_delt_row': { id: 'db_single_arm_rear_delt_row', name: "Eğilerek Tek Kol Arka Omuz Çekişi (Parabolik Sweep)", clip: 'assets/opengym/clips/db_single_arm_rear_delt_row.mp4?v=285', still: 'assets/opengym/stills/db_single_arm_rear_delt_row.webp?v=285' },
            'db_high_pull_cuban_rotation': { id: 'db_high_pull_cuban_rotation', name: "Eğilerek Row & High Pull + Cuban Rotasyon", clip: 'assets/opengym/clips/db_high_pull_cuban_rotation.mp4?v=284', still: 'assets/opengym/stills/db_high_pull_cuban_rotation.webp?v=284' },
            'db_dumbbell_shrug_burnout': { id: 'db_dumbbell_shrug_burnout', name: "Dambıl Trapez Silkme (Burnout)", clip: 'assets/opengym/clips/db_dumbbell_shrug_burnout.mp4', still: 'assets/opengym/stills/db_dumbbell_shrug_burnout.webp' },
            'db_quadruped_external_rotation': { id: 'db_quadruped_external_rotation', name: "Dört Ayak Pozisyonunda Yatay Arka Omuz Uçuşu", clip: 'assets/opengym/clips/db_quadruped_external_rotation.mp4', still: 'assets/opengym/stills/db_quadruped_external_rotation.webp' },
            'bw_jumping_jack': { id: 'bw_jumping_jack', name: "Jumping Jack", clip: 'assets/opengym/clips/bw_jumping_jack.mp4', still: 'assets/opengym/stills/bw_jumping_jack.webp' },
            'bw_high_knees': { id: '3556', name: "High Knees (Dize Çekerek Koşu)", clip: 'assets/opengym/clips/bw_high_knees.mp4', still: 'assets/opengym/stills/bw_high_knees.webp' },
            'bw_jump_rope': { id: '3676', name: "İp Atlama (Gölge İp / Jump Rope)", clip: 'assets/opengym/clips/bw_jump_rope.mp4', still: 'assets/opengym/stills/bw_jump_rope.webp' },
            'bw_butt_kicks': { id: '3037', name: "Topuk Kalçaya Koşu (Butt Kicks)", clip: 'assets/opengym/clips/bw_butt_kicks.mp4', still: 'assets/opengym/stills/bw_butt_kicks.webp' },
            'bw_skater_jumps': { id: '3361', name: "Skater Jumps (Paten Sıçraması)", clip: 'assets/opengym/clips/bw_skater_jumps.mp4', still: 'assets/opengym/stills/bw_skater_jumps.webp' },
            'bw_plank_jacks': { id: '1478', name: "Plank Jacks (Plank Bacak Aç-Kapa)", clip: 'assets/opengym/clips/bw_plank_jacks.mp4', still: 'assets/opengym/stills/bw_plank_jacks.webp' },
            'bw_squat_thrust': { id: '3705', name: "Squat Thrust (Yarım Burpee)", clip: 'assets/opengym/clips/bw_squat_thrust.mp4', still: 'assets/opengym/stills/bw_squat_thrust.webp' },
            'bw_lateral_shuffle': { id: '4241', name: "Lateral Shuffle (Yanal Hızlı Adımlama)", clip: 'assets/opengym/clips/bw_lateral_shuffle.mp4', still: 'assets/opengym/stills/bw_lateral_shuffle.webp' }
        };


        // ==================== AI HYBRID BLUEPRINT & DOCTRINE ARCHITECT ENGINE ====================
        let currentSelectedDoctrine = 'bb_hybrid';
        const AI_DOCTRINES = {
            bb_pure: {
                id: 'bb_pure',
                name: 'Saf Bodybuilding',
                shortTag: '%90 Kas / %10 Kond.',
                badgeColor: '#B45309',
                summary: 'Maksimum mekanik gerilim, izole kas tecridi ve simetri. Estetik ve hacim odaklı saf hipertrofi yaklaşımı.',
                academicRatio: { bb: 0.90, func: 0.10 }
            },
            bb_hybrid: {
                id: 'bb_hybrid',
                name: 'BB-Dominant Hibrit',
                shortTag: '%70 Kas / %30 Fonk.',
                badgeColor: '#7E22CE',
                summary: 'Ana gövde ağır hipertrofi; seans sonlarına veya aralara Kettlebell, Carry ve metabolik kondisyon. Kas yaparken eklemleri korur ve iş kapasitesini artırır.',
                academicRatio: { bb: 0.70, func: 0.30 }
            },
            balanced_hybrid: {
                id: 'balanced_hybrid',
                name: 'Dengeli Hibrit Atlet',
                shortTag: '%50 / %50 Eşit',
                badgeColor: '#0369A1',
                summary: 'Ağır compound güç blokları ile patlayıcı kettlebell, dinamik rotasyon ve core zırhının 50/50 eşit sinerjisi.',
                academicRatio: { bb: 0.50, func: 0.50 }
            },
            func_hybrid: {
                id: 'func_hybrid',
                name: 'Fonksiyonel-Dominant',
                shortTag: '%70 Fonk. / %30 Kas',
                badgeColor: '#B45309',
                summary: 'Ana omurga atletik güç ve yüksek dayanıklılık; zayıf kalan omuz, kol veya göğüs bölgelerine hedefe yönelik izole hipertrofi iğneleri.',
                academicRatio: { bb: 0.30, func: 0.70 }
            },
            func_pure: {
                id: 'func_pure',
                name: 'Saf Fonksiyonel & Kondisyon',
                shortTag: '%90 Fonksiyonel',
                badgeColor: '#15803D',
                summary: 'Çok düzlemli hareket kalıpları, kettlebell kompleksleri, yüksek VO2 Max ve kardiyovasküler savaşçı dayanıklılığı.',
                academicRatio: { bb: 0.10, func: 0.90 }
            }
        };
        Object.defineProperties(AI_DOCTRINES, {
            power_hypertrophy: { get() { return this.bb_pure; }, enumerable: false },
            metcon_athletic: { get() { return this.func_pure; }, enumerable: false }
        });

        function isExerciseFunctionalCategory(ex) {
            if (!ex) return false;
            const eq = (ex.equipment || '').toLowerCase();
            const cat = (ex.category || '').toLowerCase();
            const name = (ex.name || '').toLowerCase();
            const tags = Array.isArray(ex.tags) ? ex.tags.map(t => String(t).toLowerCase()) : [];

            if (eq === 'kettlebell') return true;
            if (cat === 'conditioning') return true;
            if (tags.includes('conditioning') || tags.includes('power') || tags.includes('mobility')) return true;
            if (name.includes('swing') || name.includes('snatch') || name.includes('clean') || 
                name.includes('turkish') || name.includes('carry') || name.includes('crawl') || 
                name.includes('manmaker') || name.includes('burpee') || name.includes('thruster') ||
                name.includes('woodchopper') || name.includes('renegade') || name.includes('twist')) {
                return true;
            }
            return false;
        }

        function getAiDoctrineTelemetry() {
            const logs = typeof getWorkoutLogs === 'function' ? getWorkoutLogs() : [];
            const scaleLogs = typeof getScaleLogs === 'function' ? getScaleLogs() : [];
            const measLogs = typeof getMeasurementsLogs === 'function' ? getMeasurementsLogs() : [];

            const totalLogsCount = logs.length;
            const recentLogs = logs.slice(0, 15);
            let totalExercisesCount = 0;
            let functionalCount = 0;
            let isolationCount = 0;
            let compoundBbCount = 0;
            let totalRpeSum = 0;
            let rpeLogsCount = 0;

            recentLogs.forEach(l => {
                if (l.rpe) {
                    const rMatch = String(l.rpe).match(/(\d+(?:\.\d+)?)/);
                    const rVal = rMatch ? parseFloat(rMatch[1]) : NaN;
                    if (!isNaN(rVal) && rVal > 0) {
                        totalRpeSum += rVal;
                        rpeLogsCount++;
                    }
                }
                if (Array.isArray(l.exercises)) {
                    l.exercises.forEach(ex => {
                        totalExercisesCount++;
                        if (isExerciseFunctionalCategory(ex)) {
                            functionalCount++;
                        } else if (ex.mechanic === 'isolation' || ex.category === 'core') {
                            isolationCount++;
                        } else {
                            compoundBbCount++;
                        }
                    });
                }
            });

            const bbCount = isolationCount + compoundBbCount;
            const bbRatio = totalExercisesCount > 0 ? (bbCount / totalExercisesCount) : 0.82;
            const funcRatio = totalExercisesCount > 0 ? (functionalCount / totalExercisesCount) : 0.18;
            const avgRpe = rpeLogsCount > 0 ? (totalRpeSum / rpeLogsCount).toFixed(1) : '8.0';

            // Kilo Telemetrisi (Tarih sınırlaması olmadan en güncel tartı kaydı esas alınır)
            const sortedScaleLogs = Array.isArray(scaleLogs)
                ? [...scaleLogs].filter(s => s && parseFloat(s.weight) > 30).sort((a, b) => {
                    const ta = new Date(a.date || a.timestamp || 0).getTime() || 0;
                    const tb = new Date(b.date || b.timestamp || 0).getTime() || 0;
                    return tb !== ta ? (tb - ta) : ((Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
                })
                : [];
            let currentWeight = null;
            let weightTrend = 'Sabit';
            let weightDelta = 0;
            if (sortedScaleLogs.length > 0) {
                currentWeight = parseFloat(sortedScaleLogs[0].weight) || null;
                if (sortedScaleLogs.length >= 2) {
                    const prev = parseFloat(sortedScaleLogs[1].weight);
                    if (currentWeight && prev) {
                        const rawDelta = Math.round((currentWeight - prev) * 10) / 10;
                        weightDelta = rawDelta.toFixed(1);
                        if (rawDelta > 0.4) weightTrend = `+${weightDelta} kg (Artış)`;
                        else if (rawDelta < -0.4) weightTrend = `${weightDelta} kg (Azalış)`;
                        else weightTrend = 'Dengeli / Sabit';
                    }
                }
            }

            // Ölçü Telemetrisi (Tarih sınırlaması olmadan en güncel mezura ölçümü esas alınır)
            const sortedMeasLogs = Array.isArray(measLogs)
                ? [...measLogs].filter(Boolean).sort((a, b) => {
                    const ta = new Date(a.date || a.timestamp || 0).getTime() || 0;
                    const tb = new Date(b.date || b.timestamp || 0).getTime() || 0;
                    return tb !== ta ? (tb - ta) : ((Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
                })
                : [];
            let currentWaist = null;
            let currentChest = null;
            let currentArms = null;
            if (sortedMeasLogs.length > 0) {
                currentWaist = parseFloat(sortedMeasLogs[0].waist) || null;
                currentChest = parseFloat(sortedMeasLogs[0].chest) || null;
                currentArms = parseFloat(sortedMeasLogs[0].arms) || null;
            }

            // Teşhis ve Öneri Mantığı
            let recommendedDoctrine = 'bb_hybrid';
            let headline = '';
            let summary = '';
            let academicBadge = 'Schumann (2022) Hibrit Model';

            if (totalLogsCount === 0) {
                recommendedDoctrine = 'bb_hybrid';
                headline = 'Biyomekanik Teşhis: Yeni Hibrit Döngü Başlangıcı';
                summary = 'Henüz kayıtlı antrenman geçmişin oluşmadığı için spor biliminin en yüksek adaptasyon sağlayan **BB-Dominant Hibrit (%70 Hipertrofi + %30 Fonksiyonel Kondisyon)** doktriniyle başlamanı öneriyorum. Bu yaklaşım kas kütlesi inşa ederken kettlebell ve core hareketleriyle eklemlerini korur ve iş kapasiteni artırır.';
            } else if (bbRatio >= 0.65) {
                recommendedDoctrine = 'bb_hybrid';
                headline = 'Biyomekanik Teşhis: Uzun Süredir Bodybuilding Tarzında Çalışıyorsun';
                summary = `Son antrenmanlarının **%${Math.round(bbRatio * 100)}** kadarı izole ve klasik hipertrofi odaklı. Kas dolgunluğun ve mekanik gerilim birikimin mükemmel seviyede; ancak eklemleri tek yönlü aşınmadan korumak, fasyal rotasyonları uyarmak ve seanslar arası toparlanma hızını (mitokondriyal yoğunluk) artırmak için **BB-Dominant Hibrit (%70 Hipertrofi + %30 Fonksiyonel)** doktrinine geçmeni öneriyorum. Schumann et al. (2022) araştırmalarına göre seans sonuna eklenecek Kettlebell Swing ve Carry kompleksleri kas hipertrofisini engellemez, toparlanma toleransını yükseltir.`;
            } else if (funcRatio >= 0.55) {
                recommendedDoctrine = 'func_hybrid';
                headline = 'Biyomekanik Teşhis: Yoğun Fonksiyonel Fitness & Kondisyon Çalışıyorsun';
                summary = `Son antrenmanlarının **%${Math.round(funcRatio * 100)}** kadarı dinamik ve metabolik kondisyon odaklı. Laktat eşiğin ve atletizmin zirvede; ancak maksimal kas kütlesini ve eklem çevresindeki kas zırhını pekiştirmek için aralara izole hipertrofi süpersetleri ekleyerek **Fonksiyonel-Dominant Hibrit (%70 Fonksiyonel + %30 Kas İğnesi)** doktrinine geçmeni öneriyorum.`;
            } else {
                recommendedDoctrine = 'balanced_hybrid';
                headline = 'Biyomekanik Teşhis: Dengeli Atletik Temel';
                summary = `Antrenman geçmişin dengeli bir çizgide seyrediyor (%${Math.round(bbRatio * 100)} Hipertrofi / %${Math.round(funcRatio * 100)} Fonksiyonel). Hem estetik ve hacimli bir fizik, hem de çevik ve patlayıcı bir güç için **%50 Hipertrofi / %50 Fonksiyonel Dengeli Hibrit Atlet** doktrinini korumanı öneriyorum.`;
            }

            if (rpeLogsCount > 0 && parseFloat(avgRpe) >= 9.0) {
                recommendedDoctrine = 'balanced_hybrid';
                summary += ` <br><br><em>⚠️ Son antrenmanlarında ortalama zorlanma düzeyin (RPE ${avgRpe}) merkezi sinir sistemi sınırına yaklaşmış; eklem ve MSS toparlanması için dengeli hibrit yüklenme önerildi.</em>`;
            }

            if (currentWaist && currentWaist > 90) {
                summary += ` <br><br><em>Bel çevren (${currentWaist} cm) metabolik uyarılmaya ihtiyaç olduğunu gösteriyor; seans sonu kettlebell/metabolik finisher yağ yakımını hızlandıracaktır.</em>`;
            }

            return {
                totalLogsCount,
                recentLogsCount: recentLogs.length,
                totalExercisesCount,
                bbCount,
                funcCount: functionalCount,
                bbRatio,
                funcRatio,
                avgRpe,
                currentWeight,
                weightTrend,
                currentWaist,
                currentChest,
                currentArms,
                recommendedDoctrine,
                headline,
                summary,
                academicBadge
            };
        }

        function toLocalYmdString(dateInput = new Date()) {
            const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
            if (isNaN(d.getTime())) return '';
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
        window.toLocalYmdString = toLocalYmdString;

        function parseWorkoutLogDateLocal(lg) {
            if (!lg) return null;
            const rawD = String(lg.date || '').trim();
            const isoDayMatch = rawD.match(/^(\d{4})-(\d{2})-(\d{2})$/);

            let candidateTs = null;
            if (lg.timestamp && !isNaN(Number(lg.timestamp)) && Number(lg.timestamp) > 0) {
                const tsDate = new Date(Number(lg.timestamp));
                if (!isNaN(tsDate.getTime())) candidateTs = tsDate;
            }
            if (!candidateTs && lg.completedAt && !isNaN(new Date(lg.completedAt).getTime())) {
                candidateTs = new Date(lg.completedAt);
            }
            if (!candidateTs && Array.isArray(lg.exercises)) {
                let latestSetMs = 0;
                lg.exercises.forEach(ex => {
                    if (!ex || !Array.isArray(ex.sets)) return;
                    ex.sets.forEach(st => {
                        const rawSt = st && (st.completedAt || st.watchStartTime);
                        if (!rawSt) return;
                        const d = new Date(rawSt);
                        if (!isNaN(d.getTime()) && d.getTime() > latestSetMs) {
                            latestSetMs = d.getTime();
                        }
                    });
                });
                if (latestSetMs > 0) candidateTs = new Date(latestSetMs);
            }

            if (isoDayMatch) {
                const y = parseInt(isoDayMatch[1], 10);
                const m = parseInt(isoDayMatch[2], 10) - 1;
                const d = parseInt(isoDayMatch[3], 10);
                const dayNoon = new Date(y, m, d, 12, 0, 0, 0);
                // Eğer timestamp aynı takvim gününe (±36 saat penceresine) aitse tam dakika/saniye bilgisini koru;
                // eski bir yedeğin içe aktarım anındaki Date.now() damgasıysa tarihi bozmasına izin verme!
                if (candidateTs && Math.abs(candidateTs.getTime() - dayNoon.getTime()) <= 36 * 60 * 60 * 1000) {
                    return candidateTs;
                }
                const fmtMatch = String(lg.dateFormatted || '').match(/(\d{1,2}):(\d{2})/);
                if (fmtMatch) {
                    const hh = Math.min(23, parseInt(fmtMatch[1], 10));
                    const mm = Math.min(59, parseInt(fmtMatch[2], 10));
                    return new Date(y, m, d, hh, mm, 0, 0);
                }
                const now = new Date();
                if (now.getFullYear() === y && now.getMonth() === m && now.getDate() === d) {
                    return new Date(now.getTime() - 60 * 60 * 1000);
                }
                return new Date(y, m, d, 18, 0, 0, 0);
            }

            if (candidateTs) return candidateTs;
            if (!rawD) return null;
            const parsed = new Date(rawD);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
        window.parseWorkoutLogDateLocal = parseWorkoutLogDateLocal;

        function getWorkoutLogTimestampMs(lg) {
            const d = parseWorkoutLogDateLocal(lg);
            return d && !isNaN(d.getTime()) ? d.getTime() : 0;
        }
        window.getWorkoutLogTimestampMs = getWorkoutLogTimestampMs;

        function sortWorkoutLogsDesc(logs) {
            if (!Array.isArray(logs)) return [];
            return logs.sort((a, b) => {
                const tb = getWorkoutLogTimestampMs(b);
                const ta = getWorkoutLogTimestampMs(a);
                if (tb !== ta) return tb - ta;
                return (Number(b && b.timestamp) || 0) - (Number(a && a.timestamp) || 0);
            });
        }
        window.sortWorkoutLogsDesc = sortWorkoutLogsDesc;

        function getPlannedSlotReferenceDate(dayIdx, isNextWeek = false, preferredHour = 19, preferredMinute = 30) {
            const baseDate = (typeof getDateForScheduleDay === 'function')
                ? new Date(getDateForScheduleDay(dayIdx, isNextWeek).getTime())
                : new Date();
            baseDate.setHours(preferredHour, preferredMinute, 0, 0);
            const now = new Date();
            if (
                baseDate.getFullYear() === now.getFullYear() &&
                baseDate.getMonth() === now.getMonth() &&
                baseDate.getDate() === now.getDate() &&
                baseDate.getTime() < now.getTime()
            ) {
                return new Date(now.getTime());
            }
            return baseDate;
        }
        window.getPlannedSlotReferenceDate = getPlannedSlotReferenceDate;

        function getWeeklyTrainingStatus() {
            const logs = typeof getWorkoutLogs === 'function' ? getWorkoutLogs() : [];
            const now = new Date();
            const todayIdx = now.getDay(); // 0=Paz, 1=Pzt ... 5=Cum, 6=Cmt
            const diffToMonday = todayIdx === 0 ? -6 : 1 - todayIdx;
            const monday = new Date(now);
            monday.setHours(0, 0, 0, 0);
            monday.setDate(now.getDate() + diffToMonday);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            const completedLogsThisWeek = [];
            const completedDaysSet = new Set();
            let completedToday = false;

            logs.forEach(lg => {
                const dObj = parseWorkoutLogDateLocal(lg);
                if (!dObj) return;
                if (dObj >= monday && dObj <= sunday) {
                    completedLogsThisWeek.push({ log: lg, dateObj: dObj });
                    completedDaysSet.add(dObj.getDay());
                    if (
                        dObj.getFullYear() === now.getFullYear() &&
                        dObj.getMonth() === now.getMonth() &&
                        dObj.getDate() === now.getDate()
                    ) {
                        completedToday = true;
                    }
                }
            });

            completedLogsThisWeek.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
            const sortedThisWeekRawLogs = completedLogsThisWeek.map(item => item.log);
            const lastCompletedDayIdx = completedLogsThisWeek.length > 0 ? completedLogsThisWeek[0].dateObj.getDay() : null;

            const completedThisWeekCount = Math.max(sortedThisWeekRawLogs.length, completedDaysSet.size);
            // Cuma günü antrenman tamamlanmışsa, veya bu hafta >=3 antrenman bittiyse, veya Cumartesi/Pazar ise bu haftanın ana döngüsü tamamlanmıştır -> Gelecek Hafta hedeflenir
            const isThisWeekComplete =
                completedThisWeekCount >= 3 ||
                (todayIdx === 5 && completedToday) ||
                todayIdx === 6 ||
                todayIdx === 0;

            const splitLabelMap = {
                full_body: 'Tüm Vücut',
                upper: 'Üst Vücut',
                lower: 'Alt Vücut & Bacak',
                upper_push: 'İtiş (Göğüs • Omuz • Triceps)',
                upper_pull: 'Çekiş (Sırt • Kanat • Biceps)',
                arms_shoulders: 'Kol & Omuz Zırhı',
                core_cond: 'Karın & Kondisyon'
            };

            const activeSplit = (Array.isArray(selectedSplits) && selectedSplits.length > 0) ? selectedSplits[0] : 'full_body';
            const activeSplitLabel = splitLabelMap[activeSplit] || 'Tüm Vücut';

            return {
                completedThisWeekCount,
                completedDays: Array.from(completedDaysSet),
                completedLogsThisWeek: sortedThisWeekRawLogs,
                lastCompletedLogThisWeek: sortedThisWeekRawLogs[0] || null,
                lastCompletedDayIdx,
                completedToday,
                todayIdx,
                todayName: (typeof DAY_NAMES_TR !== 'undefined' && DAY_NAMES_TR[todayIdx]) ? DAY_NAMES_TR[todayIdx] : 'Bugün',
                isThisWeekComplete,
                recommendedTargetWeek: isThisWeekComplete ? 'next' : 'current',
                activeSplit,
                activeSplitLabel
            };
        }
        window.getWeeklyTrainingStatus = getWeeklyTrainingStatus;

        function renderAiHybridHeroBanner() {
            const telemetry = getAiDoctrineTelemetry();
            const wkStatus = getWeeklyTrainingStatus();
            const badge = document.getElementById('aiDoctrineCurrentBadge');
            const teaser = document.getElementById('aiDoctrineHeroQuickTeaser');
            const stats = document.getElementById('aiDoctrineHeroQuickStats');

            const activeDoc = AI_DOCTRINES[currentSelectedDoctrine] || AI_DOCTRINES.bb_hybrid;

            if (badge) {
                badge.textContent = `${activeDoc.name} • ${wkStatus.activeSplitLabel}`;
            }

            if (teaser) {
                const note = '<div style="margin-top:4px; font-size:13px; color:var(--text-muted); font-weight:600;">Schumann (2022) Concurrent Training Destekli</div>';
                if (telemetry.totalLogsCount > 0) {
                    teaser.innerHTML = `<strong>AI Teşhisi:</strong> Son ${telemetry.recentLogsCount} antrenmanın <strong>%${Math.round(telemetry.bbRatio * 100)}</strong> Hipertrofi, <strong>%${Math.round(telemetry.funcRatio * 100)}</strong> Fonksiyonel. Önerilen: <strong>${(AI_DOCTRINES[telemetry.recommendedDoctrine] || {}).name}</strong>.${note}`;
                } else {
                    teaser.innerHTML = `Yapay zeka antrenman geçmişini, tartı trendini ve vücut ölçülerini analiz ederek sana özel <strong>Hipertrofi + Fonksiyonel Fitness</strong> dengesini program öncesinde baştan kurgular.${note}`;
                }
            }

            if (stats) {
                const pills = [];
                pills.push(`<span class="ai-rec-pill">${telemetry.totalLogsCount || 0} seans</span>`);
                pills.push(`<span class="ai-rec-pill">Kas ve fonksiyonel gelişim</span>`);
                if (wkStatus.completedThisWeekCount > 0) {
                    if (wkStatus.isThisWeekComplete) {
                        pills.push(`<span class="ai-rec-pill" style="border-color:rgba(74,222,128,0.45); color:#15803D;">✅ Bu hafta ${wkStatus.completedThisWeekCount} seans bitti • Hedef: Gelecek Hafta</span>`);
                    } else {
                        pills.push(`<span class="ai-rec-pill">Bu hafta ${wkStatus.completedThisWeekCount}/3 tamamlandı</span>`);
                    }
                }
                stats.innerHTML = pills.join('');
            }
        }

        window.aiGeneratorScope = 'weekly';
        window.selectedAiWeeklyTemplate = 'ai_auto';

        const AI_WEEKLY_TPL_LABELS = {
            ai_auto: 'AI Otomatik',
            auto: 'AI Otomatik',
            upper_lower_full: '3 Gün • Üst / Alt / Tüm Vücut',
            ppl_3day: '3 Gün • İtiş / Çekiş / Bacak',
            fullbody_3day: '3 Gün • Tüm Vücut',
            full_body_abc: '3 Gün • Tüm Vücut',
            upper_lower_4day: '4 Gün • Üst / Alt',
            flow_complex_3day: '3 Gün • Çelik Akışı'
        };

        function resolveAutoWeeklyTemplateKey() {
            const ctx = (typeof getRecentAndScheduledMuscleContext === 'function') ? getRecentAndScheduledMuscleContext() : null;
            if (ctx) {
                if (ctx.totalSessionsLastWeek >= 4) {
                    return 'upper_lower_4day';
                }
                const lastMap = ctx.lastSessionMuscleSets || {};
                const lastLeg = Number(lastMap['Bacak']) || 0;
                const lastUpper = (Number(lastMap['Göğüs']) || 0) + (Number(lastMap['Sırt']) || 0) + (Number(lastMap['Omuz']) || 0);
                if (lastLeg >= 3 && lastUpper >= 6) {
                    return 'fullbody_3day';
                }
                if (ctx.totalSessionsMonth < 5) {
                    return 'fullbody_3day';
                }
                const topDef = Array.isArray(ctx.deficitFocusKeys) && ctx.deficitFocusKeys.length > 0 ? ctx.deficitFocusKeys[0] : '';
                if (topDef === 'back' || topDef === 'chest' || topDef === 'shoulders') {
                    return 'upper_lower_full';
                }
                if (topDef === 'legs') {
                    return 'upper_lower_full';
                }
            }
            return 'upper_lower_full';
        }

        function setAiGeneratorScope(scope) {
            window.aiGeneratorScope = (scope === 'single') ? 'single' : (scope === 'flow_complex' ? 'flow_complex' : 'weekly');
            const btnW = document.getElementById('aiScopeBtnWeekly');
            const btnS = document.getElementById('aiScopeBtnSingle');
            const btnF = document.getElementById('aiScopeBtnFlow');
            const gridW = document.getElementById('aiWeeklyTemplateGrid');
            const gridS = document.getElementById('splitGrid');
            const flowSec = document.getElementById('flowConceptSection');
            const flowNotice = document.getElementById('flowParamNotice');
            const equipWrap = document.getElementById('equipChipsWrap');
            const paramGrid = document.querySelector('#paramSection .param-grid');
            const ctaBtn = document.getElementById('btnUnifiedAiGenerate');
            const hintEl = document.getElementById('aiQuickPreviewHint');
            const lblSplit = document.getElementById('selectedSplitLabel');

            if (btnW) btnW.classList.toggle('active', window.aiGeneratorScope === 'weekly');
            if (btnS) btnS.classList.toggle('active', window.aiGeneratorScope === 'single');
            if (btnF) btnF.classList.toggle('active', window.aiGeneratorScope === 'flow_complex');

            if (gridW) {
                gridW.style.display = (window.aiGeneratorScope === 'weekly') ? '' : 'none';
                gridW.classList.toggle('is-hidden-grid', window.aiGeneratorScope !== 'weekly');
            }
            if (gridS) {
                gridS.style.display = (window.aiGeneratorScope === 'single') ? '' : 'none';
                gridS.classList.toggle('is-hidden-grid', window.aiGeneratorScope !== 'single');
            }
            if (flowSec) {
                flowSec.style.display = (window.aiGeneratorScope === 'flow_complex') ? 'block' : 'none';
            }

            if (window.aiGeneratorScope === 'flow_complex') {
                if (lblSplit) lblSplit.innerText = '⚡ Çelik Akışı (20 Dk Dambıl Kompleksi)';

                // Diğer seçenekleri pasifleştir:
                if (equipWrap) equipWrap.classList.add('is-flow-locked');
                if (paramGrid) paramGrid.classList.add('is-flow-locked');
                if (flowNotice) flowNotice.style.display = 'block';

                // Ekipmanı dambıla sabitle
                selectedEquipments = ['dumbbell'];
                if (typeof renderEquipChips === 'function') renderEquipChips();
                const equipLbl = document.getElementById('selectedEquipLabel');
                if (equipLbl) equipLbl.innerText = '🏋️ Dambıl (Çelik Akışı için Sabit)';

                // Parametreleri komplekse sabitle
                const styleEl = document.getElementById('paramStyle');
                const goalEl = document.getElementById('paramGoal');
                const durEl = document.getElementById('paramDuration');
                if (styleEl) styleEl.value = 'complex';
                if (goalEl) goalEl.value = 'endurance';
                if (durEl) durEl.value = '20';
                const paramLbl = document.getElementById('selectedParamLabel');
                if (paramLbl) paramLbl.innerText = '⚡ Birleşik Akış • 🛡️ Kondisyon • ⏱️ 20 Dk';

                if (ctaBtn) ctaBtn.innerHTML = `${CANVA_ICONS.bolt} ⚡ Çelik Akışını Oluştur`;
                if (hintEl) hintEl.textContent = '20 Dk kesintisiz akış taslağı hazırlanır • Onaylamadan takvime eklenmez';
            } else {
                // Pasifliği kaldır
                if (equipWrap) equipWrap.classList.remove('is-flow-locked');
                if (paramGrid) paramGrid.classList.remove('is-flow-locked');
                if (flowNotice) flowNotice.style.display = 'none';

                if (typeof renderEquipChips === 'function') renderEquipChips();
                if (typeof updateSelectedEquipLabel === 'function') updateSelectedEquipLabel();
                if (typeof updateSelectedParamLabel === 'function') updateSelectedParamLabel();

                if (window.aiGeneratorScope === 'weekly') {
                    if (lblSplit) {
                        lblSplit.innerText = AI_WEEKLY_TPL_LABELS[window.selectedAiWeeklyTemplate] || 'Haftalık • AI Otomatik Teşhis';
                    }
                    if (ctaBtn) ctaBtn.innerHTML = `${CANVA_ICONS.bolt} Programı Oluştur`;
                    if (hintEl) hintEl.textContent = 'Onaylamadan takvime eklenmez';
                } else {
                    if (typeof renderSplitCards === 'function') renderSplitCards();
                    if (typeof updateSelectedSplitLabel === 'function') updateSelectedSplitLabel();
                    if (ctaBtn) ctaBtn.innerHTML = `${CANVA_ICONS.bolt} Antrenmanı Oluştur`;
                    if (hintEl) hintEl.textContent = 'Onaylamadan takvime eklenmez';
                }
            }
        }
        window.setAiGeneratorScope = setAiGeneratorScope;

        function selectAiWeeklyTemplateCard(tplKey) {
            const normalizedKey = (tplKey === 'full_body_abc') ? 'fullbody_3day' : (tplKey || 'ai_auto');
            window.selectedAiWeeklyTemplate = normalizedKey;
            document.querySelectorAll('#aiWeeklyTemplateGrid .split-card').forEach(card => {
                const key = card.getAttribute('data-wk-tpl');
                card.classList.toggle('selected', key === window.selectedAiWeeklyTemplate);
            });
            const lblEl = document.getElementById('selectedSplitLabel');
            if (lblEl && window.aiGeneratorScope === 'weekly') {
                lblEl.innerText = AI_WEEKLY_TPL_LABELS[window.selectedAiWeeklyTemplate] || 'Haftalık • AI Otomatik Teşhis';
            }
            const wkTplSelect = document.getElementById('aiModalWeeklyTemplateSelect');
            if (wkTplSelect && (AI_WEEKLY_TEMPLATES[window.selectedAiWeeklyTemplate] || window.selectedAiWeeklyTemplate === 'ai_auto')) {
                wkTplSelect.value = window.selectedAiWeeklyTemplate;
            }
        }
        window.selectAiWeeklyTemplateCard = selectAiWeeklyTemplateCard;

        const SPLIT_MUSCLE_INFO_MAP = {
            full_body: {
                title: 'Tüm Vücut (Full Body)',
                muscles: ['Göğüs', 'Sırt & Kanat', 'Omuz', 'Bacak & Kalça', 'Ön & Arka Kol', 'Karın & Core']
            },
            upper_push: {
                title: 'Üst İtiş (Push)',
                muscles: ['Göğüs (Üst • Orta • Alt)', 'Omuz (Ön & Yan Deltoid)', 'Triceps (Arka Kol)']
            },
            upper_pull: {
                title: 'Üst Çekiş (Pull)',
                muscles: ['Sırt & Kanat (Latissimus)', 'Orta Sırt & Trapez', 'Arka Omuz (Rear Deltoid)', 'Biceps (Ön Kol)']
            },
            lower: {
                title: 'Alt Vücut & Bacak',
                muscles: ['Ön Bacak (Quadriceps)', 'Arka Bacak (Hamstring)', 'Kalça (Gluteus)', 'Baldır (Calves)']
            },
            upper: {
                title: 'Tüm Üst Vücut',
                muscles: ['Göğüs', 'Sırt & Kanat', 'Omuz (Ön • Yan • Arka)', 'Biceps (Ön Kol)', 'Triceps (Arka Kol)']
            },
            core: {
                title: 'Karın & Core',
                muscles: ['Üst & Alt Karın', 'Yan Karın (Obliques)', 'Derin Merkez & Bel (Core)']
            },
            functional: {
                title: 'Fonksiyonel & Kondisyon',
                muscles: ['Tüm Vücut Kas Zinciri', 'Kalça & Arka Zincir', 'Omuz & Merkez Stabilizasyon']
            },
            flow_complex: {
                title: 'Çelik Akışı (Flow Kompleks)',
                muscles: ['Çok Fazlı Birleşik Hareketler', 'Kalça-Bacak-Omuz Hibrit İtiş', 'Arka Zincir & Torasik Mobilite']
            },
            flow_complex_3day: {
                title: 'Çelik Akışı — Kompleks (3 Gün)',
                muscles: ['1. Gün: Kuvvet & İtiş Akışı', '2. Gün: Arka Zincir & Omuz Akışı', '3. Gün: Tam Vücut Metcon Akışı']
            },
            ai_auto: {
                title: 'AI Otomatik Teşhis',
                muscles: ['Haftalık Eksik Kalan Kaslar', 'Göğüs • Sırt • Omuz • Kol', 'Bacak • Kalça • Core']
            },
            upper_lower_full: {
                title: 'Üst • Alt • Tüm Vücut (3 Gün)',
                muscles: ['1. Gün: Göğüs • Sırt • Omuz • Kol', '2. Gün: Bacak • Kalça • Core', '3. Gün: Tüm Vücut']
            },
            ppl_3day: {
                title: 'İtiş • Çekiş • Bacak (PPL)',
                muscles: ['1. Gün: Göğüs • Omuz • Arka Kol', '2. Gün: Sırt • Arka Omuz • Ön Kol', '3. Gün: Bacak • Kalça • Core']
            },
            fullbody_3day: {
                title: '3 Gün Tüm Vücut (A / B / C)',
                muscles: ['Her Gün: Göğüs • Sırt • Omuz', 'Her Gün: Bacak • Kalça • Kol • Core']
            },
            full_body_abc: {
                title: '3 Gün Tüm Vücut (A / B / C)',
                muscles: ['Her Gün: Göğüs • Sırt • Omuz', 'Her Gün: Bacak • Kalça • Kol • Core']
            },
            upper_lower_4day: {
                title: '4 Gün Üst / Alt Vücut',
                muscles: ['Pzt & Per: Göğüs • Sırt • Omuz • Kol', 'Sal & Cum: Bacak • Kalça • Core']
            }
        };

        let activeSplitPopoverKey = null;

        function closeSplitMusclePopover() {
            const existing = document.getElementById('splitMusclePopover');
            if (existing) existing.remove();
            document.querySelectorAll('.split-info-btn.active').forEach(b => b.classList.remove('active'));
            activeSplitPopoverKey = null;
        }
        window.closeSplitMusclePopover = closeSplitMusclePopover;

        function toggleSplitMusclePopover(event, key) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            const info = SPLIT_MUSCLE_INFO_MAP[key];
            if (!info) return;

            if (activeSplitPopoverKey === key && document.getElementById('splitMusclePopover')) {
                closeSplitMusclePopover();
                return;
            }

            closeSplitMusclePopover();
            activeSplitPopoverKey = key;

            const btn = event && event.currentTarget ? event.currentTarget : null;
            if (btn) btn.classList.add('active');

            const pop = document.createElement('div');
            pop.id = 'splitMusclePopover';
            pop.className = 'split-muscle-popover';
            pop.setAttribute('role', 'dialog');
            pop.setAttribute('aria-label', info.title);
            pop.onclick = (e) => e.stopPropagation();

            const pillsHtml = info.muscles.map(m => `
                <span class="split-pop-muscle-pill">
                    <span class="cv-muscle-dot"></span>${escapeHTML(m)}
                </span>
            `).join('');

            pop.innerHTML = `
                <div class="split-pop-header">
                    <span class="split-pop-title">${escapeHTML(info.title)}</span>
                    <button type="button" class="split-pop-close" onclick="closeSplitMusclePopover()" aria-label="Kapat">✕</button>
                </div>
                <div class="split-pop-sub">HEDEF KAS GRUPLARI</div>
                <div class="split-pop-pills">${pillsHtml}</div>
            `;

            document.body.appendChild(pop);

            if (btn) {
                const rect = btn.getBoundingClientRect();
                const popRect = pop.getBoundingClientRect();
                const vw = window.innerWidth;
                const vh = window.innerHeight;

                let top = rect.bottom + 8;
                if (top + popRect.height > vh - 12) {
                    top = Math.max(12, rect.top - popRect.height - 8);
                }
                let left = rect.right - popRect.width;
                if (left < 12) left = 12;
                if (left + popRect.width > vw - 12) left = vw - popRect.width - 12;

                pop.style.top = `${Math.round(top)}px`;
                pop.style.left = `${Math.round(left)}px`;
            }
        }
        window.toggleSplitMusclePopover = toggleSplitMusclePopover;

        document.addEventListener('click', (e) => {
            if (activeSplitPopoverKey && !e.target.closest('#splitMusclePopover') && !e.target.closest('.split-info-btn')) {
                closeSplitMusclePopover();
            }
        });
        window.addEventListener('scroll', () => {
            if (activeSplitPopoverKey) closeSplitMusclePopover();
        }, { passive: true });

        window.activePrecheckState = {
            scope: 'single',
            fatigue: 'none',
            scaleTrend: 'stable',
            isScaleFresh: false,
            scaleAgeDays: null
        };
        window._pendingPrecheckTplKey = null;
        window._pendingPrecheckSwitchToGenerator = false;

        function evaluateScaleFreshness30Days() {
            const logs = typeof getScaleLogs === 'function' ? getScaleLogs() : [];
            if (!Array.isArray(logs) || logs.length === 0 || !logs[0] || !logs[0].date) {
                return { isFresh: false, ageDays: null, latest: null };
            }
            const dObj = new Date(logs[0].date);
            if (isNaN(dObj.getTime())) {
                return { isFresh: false, ageDays: null, latest: null };
            }
            const ageDays = Math.floor((Date.now() - dObj.getTime()) / (24 * 60 * 60 * 1000));
            return {
                isFresh: ageDays <= 30,
                ageDays,
                latest: logs[0]
            };
        }
        window.evaluateScaleFreshness30Days = evaluateScaleFreshness30Days;

        function selectQuickPrecheckScope(val) {
            window.activePrecheckState.scope = (val === 'weekly') ? 'weekly' : 'single';
            const grp = document.getElementById('aiPrecheckScopeGroup');
            if (grp) {
                grp.querySelectorAll('button[data-val]').forEach(btn => {
                    const isSel = btn.getAttribute('data-val') === window.activePrecheckState.scope;
                    btn.style.background = isSel ? '#0F172A' : '#F8FAFC';
                    btn.style.color = isSel ? '#FFFFFF' : '#0F172A';
                    btn.style.borderColor = isSel ? '#0F172A' : '#CBD5E1';
                    btn.style.fontWeight = isSel ? '800' : '700';
                });
            }
            const noteEl = document.getElementById('aiPrecheckWeekProgressNote');
            if (noteEl) {
                const wkStatus = typeof getWeeklyTrainingStatus === 'function' ? getWeeklyTrainingStatus() : { completedThisWeekCount: 0, isThisWeekComplete: false };
                if (window.activePrecheckState.scope === 'weekly') {
                    noteEl.style.display = 'block';
                    if (wkStatus.completedThisWeekCount > 0 && !wkStatus.isThisWeekComplete) {
                        const rem = Math.max(1, 3 - wkStatus.completedThisWeekCount);
                        noteEl.textContent = `Bu hafta ${wkStatus.completedThisWeekCount} gün yaptın; kalan ${rem} gün yapılan güne ve geçmiş eksiklere göre tamamlanacak.`;
                    } else if (wkStatus.completedThisWeekCount >= 3) {
                        noteEl.textContent = `Bu hafta ${wkStatus.completedThisWeekCount} gün tamamlandı; gelecek haftanın planı geçmiş eksiklere göre hazırlanacak.`;
                    } else {
                        noteEl.textContent = `Bu hafta yapılan gün yok; geçmiş hafta eksiklerini kapatan tam haftalık plan hazırlanacak.`;
                    }
                } else {
                    if (wkStatus.completedThisWeekCount > 0) {
                        noteEl.style.display = 'block';
                        noteEl.textContent = `Bu hafta yapılan ${wkStatus.completedThisWeekCount} antrenman ve önceki haftaların eksikleri baz alınarak bugünkü seans kurulacak.`;
                    } else {
                        noteEl.style.display = 'none';
                    }
                }
            }
        }
        window.selectQuickPrecheckScope = selectQuickPrecheckScope;

        function selectQuickPrecheckFatigue(val) {
            window.activePrecheckState.fatigue = val || 'none';
            const grp = document.getElementById('aiPrecheckFatigueGroup');
            if (!grp) return;
            grp.querySelectorAll('button[data-val]').forEach(btn => {
                const isSel = btn.getAttribute('data-val') === window.activePrecheckState.fatigue;
                btn.style.background = isSel ? '#0F172A' : '#F8FAFC';
                btn.style.color = isSel ? '#FFFFFF' : '#0F172A';
                btn.style.borderColor = isSel ? '#0F172A' : '#CBD5E1';
                btn.style.fontWeight = isSel ? '800' : '700';
            });
        }
        window.selectQuickPrecheckFatigue = selectQuickPrecheckFatigue;

        function selectQuickPrecheckScale(val) {
            window.activePrecheckState.scaleTrend = val || 'stable';
            const grp = document.getElementById('aiPrecheckScaleGroup');
            if (!grp) return;
            grp.querySelectorAll('button[data-val]').forEach(btn => {
                const isSel = btn.getAttribute('data-val') === window.activePrecheckState.scaleTrend;
                btn.style.background = isSel ? '#0F172A' : '#F8FAFC';
                btn.style.color = isSel ? '#FFFFFF' : '#0F172A';
                btn.style.borderColor = isSel ? '#0F172A' : '#CBD5E1';
                btn.style.fontWeight = isSel ? '800' : '700';
            });
        }
        window.selectQuickPrecheckScale = selectQuickPrecheckScale;

        function openQuickAiPrecheckModal(preferredTplKey = null, switchToGen = false) {
            window._pendingPrecheckTplKey = preferredTplKey;
            window._pendingPrecheckSwitchToGenerator = Boolean(switchToGen);

            const scaleCheck = evaluateScaleFreshness30Days();
            window.activePrecheckState.isScaleFresh = scaleCheck.isFresh;
            window.activePrecheckState.scaleAgeDays = scaleCheck.ageDays;

            selectQuickPrecheckScope(window.activePrecheckState.scope || 'single');
            selectQuickPrecheckFatigue(window.activePrecheckState.fatigue || 'none');
            selectQuickPrecheckScale(window.activePrecheckState.scaleTrend || 'stable');

            const freshEl = document.getElementById('aiPrecheckScaleFreshNotice');
            const staleRow = document.getElementById('aiPrecheckScaleStaleRow');
            const staleBadge = document.getElementById('aiPrecheckScaleStaleBadge');

            if (scaleCheck.isFresh) {
                if (freshEl) freshEl.style.display = 'block';
                if (staleRow) staleRow.style.display = 'none';
            } else {
                if (freshEl) freshEl.style.display = 'none';
                if (staleRow) staleRow.style.display = 'block';
                if (staleBadge) {
                    staleBadge.textContent = scaleCheck.ageDays !== null
                        ? `Tartı Eski (${scaleCheck.ageDays} Gün)`
                        : 'Tartı Kaydı Yok';
                }
            }

            const modal = document.getElementById('aiQuickPrecheckModal');
            if (modal) modal.classList.add('active');
        }
        window.openQuickAiPrecheckModal = openQuickAiPrecheckModal;

        function closeQuickAiPrecheckModal() {
            const modal = document.getElementById('aiQuickPrecheckModal');
            if (modal) modal.classList.remove('active');
        }
        window.closeQuickAiPrecheckModal = closeQuickAiPrecheckModal;

        async function confirmQuickAiPrecheckAndGenerate() {
            closeQuickAiPrecheckModal();
            if (window._pendingPrecheckSwitchToGenerator && typeof switchTab === 'function') {
                switchTab('generatorTab');
            }
            await handleQuickAiGenerate(window._pendingPrecheckTplKey, true);
        }
        window.confirmQuickAiPrecheckAndGenerate = confirmQuickAiPrecheckAndGenerate;

        async function handleQuickAiGenerate(preferredTplKey = null, skipPrecheck = false) {
            if (!skipPrecheck) {
                openQuickAiPrecheckModal(preferredTplKey, false);
                return;
            }
            const goalEl = document.getElementById('paramGoal');
            const goalVal = goalEl ? goalEl.value : 'hypertrophy';
            const telemetry = getAiDoctrineTelemetry();
            const scaleCheck = evaluateScaleFreshness30Days();
            const precheck = window.activePrecheckState || { fatigue: 'none', scaleTrend: 'stable' };

            if (!scaleCheck.isFresh && precheck.scaleTrend === 'gained') {
                currentSelectedDoctrine = 'func_hybrid';
            } else if (!scaleCheck.isFresh && precheck.scaleTrend === 'lost') {
                currentSelectedDoctrine = 'bb_hybrid';
            } else if (goalVal === 'strength') {
                currentSelectedDoctrine = 'bb_pure';
            } else if (goalVal === 'endurance') {
                currentSelectedDoctrine = 'func_hybrid';
            } else if (telemetry && telemetry.recommendedDoctrine && AI_DOCTRINES[telemetry.recommendedDoctrine]) {
                currentSelectedDoctrine = telemetry.recommendedDoctrine;
            } else {
                currentSelectedDoctrine = 'bb_hybrid';
            }

            const unifiedWishEl = document.getElementById('aiUnifiedWishInput');
            const modalWishEl = document.getElementById('aiModalUserWishInput');
            const userWish = (unifiedWishEl && unifiedWishEl.value.trim())
                ? unifiedWishEl.value.trim()
                : (modalWishEl ? modalWishEl.value.trim() : '');

            // 🤖 Gemini Yapay Zeka İstek Analizi: Kullanıcı özel bir not girdiyse Gemini API ile anında analiz et
            const btnEl = document.getElementById('btnUnifiedAiGenerate');
            const originalBtnHtml = btnEl ? btnEl.innerHTML : '';
            const hintEl = document.getElementById('aiQuickPreviewHint');

            if (userWish && typeof parseUserWishWithGemini === 'function') {
                if (btnEl) {
                    btnEl.disabled = true;
                    btnEl.innerHTML = `<span style="display:inline-flex; align-items:center; gap:8px;">${CANVA_ICONS.sparkle || '✨'} Gemini AI İsteğinizi İnceliyor...</span>`;
                }
                if (hintEl) {
                    hintEl.textContent = '⏳ Gemini AI kısıtlamalarınızı ve odak tercihlerinizi inceliyor...';
                    hintEl.style.color = '#0369A1';
                }

                try {
                    await parseUserWishWithGemini(userWish);
                } catch (e) {
                    console.warn("Gemini analizi hatası, yerel kurallar devreye girdi:", e);
                } finally {
                    if (btnEl) {
                        btnEl.disabled = false;
                        btnEl.innerHTML = originalBtnHtml;
                    }
                }
            }

            // ⚡ Eğer Çelik Akışı (Yeni Konsept) seçiliyse doğrudan kompleks akışını taslak olarak hazırla
            if (window.aiGeneratorScope === 'flow_complex') {
                window.pendingAiWeeklyPlan = null;
                loadCelikAkisiWorkout(false);
                return;
            }

            const isComplexRequested = /birleşik|kompleks|akış|flow|chain|zincir|hibrit|kombinasyon/.test(userWish.toLocaleLowerCase('tr-TR')) ||
                                       selectedSplit === 'flow_complex' ||
                                       window.selectedAiWeeklyTemplate === 'flow_complex_3day' ||
                                       (document.getElementById('paramStyle') && document.getElementById('paramStyle').value === 'complex');

            if (isComplexRequested) {
                const styleEl = document.getElementById('paramStyle');
                if (styleEl && styleEl.value !== 'complex') styleEl.value = 'complex';
            }

            // Eğer birleşik akış/kompleks istenmişse ve haftalık 3 günlük kompleks şablonu özellikle seçilmemişse tek günlük flow üret
            if (isComplexRequested && window.selectedAiWeeklyTemplate !== 'flow_complex_3day' && !preferredTplKey) {
                window.aiGeneratorScope = 'single';
            } else if (!preferredTplKey && precheck.scope) {
                window.aiGeneratorScope = precheck.scope;
            }

            // Eğer kullanıcı pop-up'tan "Bugün İçin" (single) seçtiyse, yorgun kas ve geçmiş eksiklere göre bugünün bölgesini otomatik belirle
            if (window.aiGeneratorScope === 'single' && !preferredTplKey) {
                window.pendingAiWeeklyPlan = null;
                const histCtx = typeof getRecentAndScheduledMuscleContext === 'function' ? getRecentAndScheduledMuscleContext() : null;
                const hoursAgo = (histCtx && histCtx.lastSessionHoursAgo !== null && histCtx.lastSessionHoursAgo !== undefined)
                    ? Number(histCtx.lastSessionHoursAgo)
                    : 999;
                const lastMap = (histCtx && histCtx.lastSessionMuscleSets) ? histCtx.lastSessionMuscleSets : {};
                const lastWasBalancedFullBody = (Number(lastMap['Bacak']) || 0) >= 3 &&
                    ((Number(lastMap['Göğüs']) || 0) + (Number(lastMap['Sırt']) || 0) + (Number(lastMap['Omuz']) || 0)) >= 6;
                if (precheck.fatigue === 'legs') {
                    selectSplit('upper');
                } else if (precheck.fatigue === 'upper') {
                    selectSplit('lower');
                } else if (precheck.fatigue === 'back') {
                    selectSplit('upper_push');
                } else if (hoursAgo >= 40 && lastWasBalancedFullBody) {
                    selectSplit('full_body');
                } else if (histCtx && Array.isArray(histCtx.fatiguedMuscles48h)) {
                    if (histCtx.fatiguedMuscles48h.includes('Bacak') && !histCtx.fatiguedMuscles48h.includes('Göğüs')) {
                        selectSplit('upper');
                    } else if ((histCtx.fatiguedMuscles48h.includes('Göğüs') || histCtx.fatiguedMuscles48h.includes('Sırt')) && !histCtx.fatiguedMuscles48h.includes('Bacak')) {
                        selectSplit('lower');
                    } else {
                        selectSplit('full_body');
                    }
                } else {
                    selectSplit('full_body');
                }
                handleGenerateWorkout(currentSelectedDoctrine, userWish);
                if (hintEl) {
                    hintEl.textContent = '✅ Bugünün antrenmanı hazırlandı';
                    hintEl.style.color = '#15803D';
                }
                const outEl = document.getElementById('generatedWorkoutOutput');
                if (outEl) {
                    outEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }

            let targetTplKey = preferredTplKey;
            if (!targetTplKey) {
                targetTplKey = (window.selectedAiWeeklyTemplate && window.selectedAiWeeklyTemplate !== 'ai_auto')
                    ? window.selectedAiWeeklyTemplate
                    : resolveAutoWeeklyTemplateKey();
            } else {
                selectAiWeeklyTemplateCard(targetTplKey);
            }

            applyAiWeeklySchedule(targetTplKey);
            if (hintEl) {
                hintEl.textContent = '✅ Haftalık program hazırlandı';
                hintEl.style.color = '#15803D';
            }
        }
        window.handleQuickAiGenerate = handleQuickAiGenerate;

        async function switchQuickAiToSingleDay() {
            setAiGeneratorScope('single');
            window.pendingAiWeeklyPlan = null;
            const unifiedWishEl = document.getElementById('aiUnifiedWishInput');
            const modalWishEl = document.getElementById('aiModalUserWishInput');
            const userWish = (unifiedWishEl && unifiedWishEl.value.trim())
                ? unifiedWishEl.value.trim()
                : (modalWishEl ? modalWishEl.value.trim() : '');

            if (userWish && !window.lastGeminiWishAnalysis && typeof parseUserWishWithGemini === 'function') {
                await parseUserWishWithGemini(userWish);
            }
            handleGenerateWorkout(currentSelectedDoctrine, userWish);
            const outEl = document.getElementById('generatedWorkoutOutput');
            if (outEl) {
                outEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        window.switchQuickAiToSingleDay = switchQuickAiToSingleDay;

        function toggleAiDoctrineTeaser() {
            const el = document.getElementById('aiDoctrineHeroQuickTeaser');
            const btn = document.getElementById('aiDoctrineInfoBtn');
            if (!el) return;
            const isHidden = window.getComputedStyle(el).display === 'none';
            el.style.display = isHidden ? 'block' : 'none';
            if (btn) {
                btn.classList.toggle('active', isHidden);
                btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            }
        }
        window.toggleAiDoctrineTeaser = toggleAiDoctrineTeaser;

        function openAiHybridArchitectModal() {
            const telemetry = getAiDoctrineTelemetry();
            const modal = document.getElementById('aiHybridArchitectModal');
            if (!modal) return;

            // 1. Telemetri Gridini Doldur
            const teleGrid = document.getElementById('aiTelemetryGrid');
            if (teleGrid) {
                teleGrid.innerHTML = `
                    <div class="telemetry-pill">
                        <span class="telemetry-pill-label">Tamamlanan Seans</span>
                        <span class="telemetry-pill-val">${telemetry.totalLogsCount} Antrenman</span>
                    </div>
                    <div class="telemetry-pill">
                        <span class="telemetry-pill-label">Kas Hipertrofisi</span>
                        <span class="telemetry-pill-val" style="color:#f59e0b;">%${Math.round(telemetry.bbRatio * 100)}</span>
                    </div>
                    <div class="telemetry-pill">
                        <span class="telemetry-pill-label">Fonksiyonel Kondisyon</span>
                        <span class="telemetry-pill-val" style="color:#15803D;">%${Math.round(telemetry.funcRatio * 100)}</span>
                    </div>
                    <div class="telemetry-pill">
                        <span class="telemetry-pill-label">Son Kilo Durumu</span>
                        <span class="telemetry-pill-val" style="color:#0369A1;">${telemetry.currentWeight ? telemetry.currentWeight + ' kg' : 'Girilmedi'}</span>
                    </div>
                    <div class="telemetry-pill">
                        <span class="telemetry-pill-label">Bel Çevresi</span>
                        <span class="telemetry-pill-val" style="color:#7E22CE;">${telemetry.currentWaist ? telemetry.currentWaist + ' cm' : 'Girilmedi'}</span>
                    </div>
                    <div class="telemetry-pill">
                        <span class="telemetry-pill-label">Ortalama RPE</span>
                        <span class="telemetry-pill-val">⚡ ${telemetry.avgRpe} / 10</span>
                    </div>
                `;
            }

            // 2. Teşhis ve Rapor Kutusu
            const headlineEl = document.getElementById('aiDiagnosticHeadline');
            const contentEl = document.getElementById('aiDiagnosticContent');
            if (headlineEl) headlineEl.innerText = telemetry.headline;
            if (contentEl) contentEl.innerHTML = telemetry.summary;

            // Önerilen doktrini otomatik seç
            selectAiDoctrine(telemetry.recommendedDoctrine, false);

            modal.classList.add('active');
        }

        function closeAiHybridArchitectModal() {
            const modal = document.getElementById('aiHybridArchitectModal');
            if (modal) modal.classList.remove('active');
        }

        function selectAiDoctrine(docKey, updateHero = true) {
            if (!AI_DOCTRINES[docKey]) docKey = 'bb_hybrid';
            currentSelectedDoctrine = docKey;

            document.querySelectorAll('#doctrineSelectionGrid .doctrine-card').forEach(card => {
                const isTarget = card.id === `docCard_${docKey}`;
                card.classList.toggle('selected', isTarget);
            });

            if (updateHero) {
                renderAiHybridHeroBanner();
            }
        }

        async function requestGeminiDeepHybridReport() {
            const btn = document.getElementById('btnTriggerGeminiLiveReport');
            const container = document.getElementById('aiGeminiExtraReportContainer');
            if (!container) return;

            const telemetry = getAiDoctrineTelemetry();
            const activeDoc = AI_DOCTRINES[currentSelectedDoctrine] || AI_DOCTRINES.bb_hybrid;

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '⏳ Gemini Analiz Ediyor...';
            }

            container.style.display = 'block';
            container.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; color:var(--gold);">
                    <span class="loading-spinner" style="display:inline-block; width:14px; height:14px; border:2px solid var(--gold); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
                    <span>Google Gemini AI Biyomekanik Motoru canlı olarak antrenman geçmişini ve literatür verilerini analiz ediyor...</span>
                </div>
            `;

            const prompt = `Sen elit bir spor bilimci ve biyomekanik uzmanısın (Concurrent / Hybrid Training & Hypertrophy Specialist).
Aşağıdaki sporcu telemetri verilerini incele:
- Toplam Antrenman: ${telemetry.totalLogsCount} (Son 15 antrenmanda %${Math.round(telemetry.bbRatio * 100)} Bodybuilding, %${Math.round(telemetry.funcRatio * 100)} Fonksiyonel Fitness)
- Son Kilo: ${telemetry.currentWeight ? telemetry.currentWeight + ' kg' : 'Belirtilmedi'} (${telemetry.weightTrend})
- Bel Çevresi: ${telemetry.currentWaist ? telemetry.currentWaist + ' cm' : 'Belirtilmedi'}
- Ortalama RPE: ${telemetry.avgRpe}
- Seçilen Doktrin: ${activeDoc.name} (${activeDoc.shortTag})

Lütfen sporcuya hitaben:
1. Neden bu antrenman doktrininin (Schumann et al. 2022 Concurrent Training, Hickson interferans modeli ve Fasyal hatlar uyarınca) kendisi için en yüksek verimi sağlayacağını 2-3 vurucu paragrafta açıkla.
2. Bodybuilding izole kas hipertrofisi ile Kettlebell / Fonksiyonel fitness hareketlerinin nasıl bir sinerji oluşturacağını anlat.
3. Seans için 1 altın koç tavsiyesi ver.
Türkçe, son derece motive edici, akademik temelli ve net yaz.`;

            const sysPrompt = 'Sen Çelik Kodu platformunun Baş Biyomekanik ve Hibrit Antrenör yapay zekasısın. Bilimsel referanslarla doğrudan sporcuya konuşursun.';

            try {
                if (typeof callGeminiAPI === 'function') {
                    const reply = await callGeminiAPI(prompt, sysPrompt);
                    container.innerHTML = `
                        <div style="background:rgba(168,85,247,0.12); border:1px solid rgba(168,85,247,0.4); border-radius:10px; padding:12px; margin-top:4px;">
                            <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
                                <span style="font-size:14px;">✨</span>
                                <strong style="color:#7E22CE; font-size:13px;">Google Gemini AI Canlı Akademik Biyomekanik Raporu</strong>
                            </div>
                            <div style="font-size:12.5px; color:#0F172A; line-height:1.6; white-space:pre-line;">${reply}</div>
                        </div>
                    `;
                } else {
                    throw new Error("Gemini API fonksiyonu tanımlı değil.");
                }
            } catch (err) {
                console.warn("Gemini rapor hatası, yerel bilimsel analiz gösteriliyor:", err);
                container.innerHTML = `
                    <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:10px; padding:12px; margin-top:4px;">
                        <strong style="color:var(--gold); font-size:12.5px;">📚 Schumann et al. (2022) Hibrit Literatür Notu:</strong>
                        <p style="margin:6px 0 0 0; font-size:12px; color:#475569; line-height:1.5;">
                            Seçilen <strong>${activeDoc.name}</strong> doktrini; izole hipertrofi ile yüksek eşikli motor üniteleri rekrüte ederken, fonksiyonel kettlebell ve core kompleksleriyle mitokondriyal toparlanma hızını maksimize eder. Eklemler tek düzlemli aşınmadan korunur ve iş kapasitesi artar.
                        </p>
                    </div>
                `;
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '✨ Raporu Yenile';
                }
            }
        }

        function applyAiHybridProgram(startImmediately = false) {
            const splitSelect = document.getElementById('aiModalSplitSelect');
            const durSelect = document.getElementById('aiModalDurationSelect');
            const styleSelect = document.getElementById('aiModalStyleSelect');
            const wishInput = document.getElementById('aiModalUserWishInput');

            const chosenSplit = splitSelect ? splitSelect.value : 'full_body';
            const chosenDur = durSelect ? parseInt(durSelect.value, 10) : 45;
            const chosenStyle = styleSelect ? styleSelect.value : 'superset';
            const userWish = wishInput ? wishInput.value.trim() : '';

            window.pendingAiWeeklyPlan = null;

            // Split, süre ve süperset yoğunluğu seçimlerini ana ekrana yansıt
            selectSplit(chosenSplit);
            const paramDurEl = document.getElementById('paramDuration');
            if (paramDurEl) paramDurEl.value = String(chosenDur);
            const paramStyleEl = document.getElementById('paramStyle');
            if (paramStyleEl && chosenStyle) paramStyleEl.value = chosenStyle;
            if (typeof updateSelectedParamLabel === 'function') updateSelectedParamLabel();

            // Doktrini hero banner'a yansıt
            renderAiHybridHeroBanner();

            // Programı üret (Takvime otomatik yazmaz, önizleme kartı açar)
            handleGenerateWorkout(currentSelectedDoctrine, userWish);

            closeAiHybridArchitectModal();

            if (startImmediately && currentGeneratedWorkout) {
                setTimeout(() => {
                    startActiveWorkoutSession(currentGeneratedWorkout);
                }, 150);
            } else {
                // Program Oluşturucu sekmesinde oluşturulan program kutusuna kaydır
                switchTab('generatorTab');
                const outEl = document.getElementById('generatedWorkoutOutput');
                if (outEl) {
                    outEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }

        const AI_WEEKLY_TEMPLATES = {
            upper_lower_full: {
                name: 'Üst • Alt • Tüm Vücut (3 Gün)',
                days: [
                    { dayIdx: 1, split: 'upper',     label: 'Pzt: Üst Vücut' },
                    { dayIdx: 3, split: 'lower',     label: 'Çar: Alt Vücut & Core' },
                    { dayIdx: 5, split: 'full_body', label: 'Cum: Tüm Vücut' }
                ]
            },
            ppl_3day: {
                name: 'İtiş • Çekiş • Bacak (3 Gün)',
                days: [
                    { dayIdx: 1, split: 'upper_push', label: 'Pzt: İtiş (Göğüs • Omuz • Triceps)' },
                    { dayIdx: 3, split: 'upper_pull', label: 'Çar: Çekiş (Sırt • Biceps)' },
                    { dayIdx: 5, split: 'lower',      label: 'Cum: Alt Vücut & Bacak' }
                ]
            },
            fullbody_3day: {
                name: '3 Gün Tüm Vücut',
                days: [
                    { dayIdx: 1, split: 'full_body', label: 'Pzt: Tüm Vücut (1. Seans)' },
                    { dayIdx: 3, split: 'full_body', label: 'Çar: Tüm Vücut (2. Seans)' },
                    { dayIdx: 5, split: 'full_body', label: 'Cum: Tüm Vücut (3. Seans)' }
                ]
            },
            upper_lower_4day: {
                name: '4 Gün Üst / Alt',
                days: [
                    { dayIdx: 1, split: 'upper', label: 'Pzt: Üst Vücut (1. Seans)' },
                    { dayIdx: 2, split: 'lower', label: 'Sal: Alt Vücut (1. Seans)' },
                    { dayIdx: 4, split: 'upper', label: 'Per: Üst Vücut (2. Seans)' },
                    { dayIdx: 5, split: 'lower', label: 'Cum: Alt Vücut (2. Seans)' }
                ]
            },
            flow_complex_3day: {
                name: '3 Gün Çelik Akışı',
                days: [
                    { dayIdx: 1, split: 'flow_complex', label: 'Pzt: Çelik Akışı (Kuvvet)' },
                    { dayIdx: 3, split: 'flow_complex', label: 'Çar: Çelik Akışı (Arka Zincir)' },
                    { dayIdx: 5, split: 'flow_complex', label: 'Cum: Çelik Akışı (Metabolik)' }
                ]
            }
        };
        Object.defineProperty(AI_WEEKLY_TEMPLATES, 'full_body_abc', {
            get() { return this.fullbody_3day; },
            enumerable: false
        });
        window.AI_WEEKLY_TEMPLATES = AI_WEEKLY_TEMPLATES;

        function applyAiWeeklySchedule(overrideTplKey = null) {
            const paramDurEl = document.getElementById('paramDuration');
            const paramStyleEl = document.getElementById('paramStyle');
            const durSelect = document.getElementById('aiModalDurationSelect');
            const styleSelect = document.getElementById('aiModalStyleSelect');
            const wkTplSelect = document.getElementById('aiModalWeeklyTemplateSelect');
            const unifiedWishEl = document.getElementById('aiUnifiedWishInput');
            const modalWishEl = document.getElementById('aiModalUserWishInput');

            let chosenDur = paramDurEl ? parseInt(paramDurEl.value, 10) : (durSelect ? parseInt(durSelect.value, 10) : 45);
            let chosenStyle = paramStyleEl ? paramStyleEl.value : (styleSelect ? styleSelect.value : 'superset');
            const rawTplCandidate = overrideTplKey
                || ((window.selectedAiWeeklyTemplate && window.selectedAiWeeklyTemplate !== 'ai_auto') ? window.selectedAiWeeklyTemplate : '')
                || resolveAutoWeeklyTemplateKey();
            const normalizedTplKey = (rawTplCandidate === 'full_body_abc') ? 'fullbody_3day' : rawTplCandidate;
            const chosenTplKey = AI_WEEKLY_TEMPLATES[normalizedTplKey] ? normalizedTplKey : 'upper_lower_full';
            if (chosenTplKey === 'flow_complex_3day') {
                chosenStyle = 'complex';
                if (paramStyleEl) paramStyleEl.value = 'complex';
                if (styleSelect) styleSelect.value = 'complex';
                if (chosenDur > 25) {
                    chosenDur = 25;
                    if (paramDurEl) paramDurEl.value = '30';
                }
            }
            if (wkTplSelect && wkTplSelect.value !== chosenTplKey) {
                wkTplSelect.value = chosenTplKey;
            }
            const userWish = (unifiedWishEl && unifiedWishEl.value.trim())
                ? unifiedWishEl.value.trim()
                : (modalWishEl ? modalWishEl.value.trim() : '');

            if (durSelect) durSelect.value = String(chosenDur);
            if (styleSelect && chosenStyle) styleSelect.value = chosenStyle;
            if (typeof updateSelectedParamLabel === 'function') updateSelectedParamLabel();

            renderAiHybridHeroBanner();

            const tpl = AI_WEEKLY_TEMPLATES[chosenTplKey];
            const baseHistoryCtx = (typeof getRecentAndScheduledMuscleContext === 'function')
                ? getRecentAndScheduledMuscleContext()
                : { usedExerciseIds: new Set(), subKeyVolume: {}, usedFinishers: new Set(), fatiguedMuscles48h: [] };
            const wkStatus = getWeeklyTrainingStatus();
            const isTargetNextWeek = Boolean(wkStatus.isThisWeekComplete);

            const lastMuscleMap = baseHistoryCtx.lastSessionMuscleSets || {};
            const weekMuscleMap = baseHistoryCtx.thisWeekMuscleSets || {};
            const lastLegSets = Number(lastMuscleMap['Bacak']) || 0;
            const lastChestSets = Number(lastMuscleMap['Göğüs']) || 0;
            const lastBackSets = Number(lastMuscleMap['Sırt']) || 0;
            const lastPushSets = lastChestSets + ((Number(lastMuscleMap['Omuz']) || 0) * 0.4) + ((Number(lastMuscleMap['Arka Kol/Triceps']) || 0) * 0.35);
            const lastPullSets = lastBackSets + ((Number(lastMuscleMap['Ön Kol/Biceps']) || 0) * 0.4);
            const lastUpperSets = (Number(lastMuscleMap['Göğüs']) || 0) + (Number(lastMuscleMap['Omuz']) || 0) + (Number(lastMuscleMap['Sırt']) || 0) + (Number(lastMuscleMap['Arka Kol/Triceps']) || 0) + (Number(lastMuscleMap['Ön Kol/Biceps']) || 0);
            const lastWasFullBody = lastLegSets >= 3 && lastUpperSets >= 6;

            const precheck = window.activePrecheckState || { fatigue: 'none' };
            const hasThisWeekCompleted = wkStatus.completedThisWeekCount > 0 && !wkStatus.isThisWeekComplete;

            // ADIM 1: Önce kalan antrenman sayısını ve takvim günlerini (en az 1 dinlenme günü bırakarak) yerleştir
            let weeklyDays = tpl.days.map(d => Object.assign({}, d));
            const remCount = (hasThisWeekCompleted && weeklyDays.length > 1)
                ? Math.max(1, weeklyDays.length - Math.min(wkStatus.completedThisWeekCount, weeklyDays.length - 1))
                : weeklyDays.length;
            if (hasThisWeekCompleted && weeklyDays.length > remCount) {
                weeklyDays = weeklyDays.slice(weeklyDays.length - remCount);
            }

            const isoMap = (d) => (d === 0 ? 7 : d);
            if (!wkStatus.isThisWeekComplete) {
                const todayIdx = new Date().getDay();
                const todayIso = isoMap(todayIdx);
                const lastDoneIso = (wkStatus.lastCompletedDayIdx !== null && wkStatus.lastCompletedDayIdx !== undefined)
                    ? isoMap(wkStatus.lastCompletedDayIdx)
                    : 0;

                const allRemainingDays = [];
                for (let iso = todayIso; iso <= 7; iso++) {
                    const realDay = (iso === 7) ? 0 : iso;
                    if (!wkStatus.completedDays.includes(realDay)) {
                        allRemainingDays.push(realDay);
                    }
                }

                // Eğer dün veya bugün antrenman yapıldıysa ve haftada yeterli gün varsa araya 1 dinlenme günü koy (Örn: Pzt yapıldıysa Salı yerine Çarşamba'dan başlat)
                const minRestStartIso = lastDoneIso > 0 ? Math.max(todayIso, lastDoneIso + 2) : todayIso;
                const restedAvailableDays = allRemainingDays.filter(d => isoMap(d) >= minRestStartIso);
                const wCountTarget = Math.min(weeklyDays.length, Math.max(1, allRemainingDays.length));
                const availableDays = (restedAvailableDays.length >= wCountTarget) ? restedAvailableDays : allRemainingDays;

                if (availableDays.length > 0) {
                    if (weeklyDays.length > availableDays.length) {
                        weeklyDays = weeklyDays.slice(0, availableDays.length);
                    }
                    const wCount = weeklyDays.length;
                    const assignedDays = [];
                    if (wCount === 1) {
                        assignedDays.push(availableDays[0]);
                    } else if (wCount === 2) {
                        const firstDay = availableDays[0];
                        const firstIso = isoMap(firstDay);
                        const idealSecond = availableDays.find(d => isoMap(d) === firstIso + 2)
                            || availableDays.find(d => isoMap(d) > firstIso + 1)
                            || availableDays[availableDays.length - 1];
                        assignedDays.push(firstDay);
                        if (idealSecond !== undefined && idealSecond !== firstDay) {
                            assignedDays.push(idealSecond);
                        } else if (availableDays[1] !== undefined) {
                            assignedDays.push(availableDays[1]);
                        }
                    } else if (wCount === 3 && availableDays.length >= 5) {
                        assignedDays.push(availableDays[0], availableDays[2], availableDays[4]);
                    } else if (wCount === 3 && availableDays.length === 4) {
                        assignedDays.push(availableDays[0], availableDays[2], availableDays[3]);
                    } else {
                        const step = (availableDays.length - 1) / Math.max(1, wCount - 1);
                        for (let i = 0; i < wCount; i++) {
                            const idx = Math.min(Math.round(i * step), availableDays.length - 1);
                            if (!assignedDays.includes(availableDays[idx])) {
                                assignedDays.push(availableDays[idx]);
                            }
                        }
                    }
                    weeklyDays.forEach((slot, i) => {
                        if (assignedDays[i] !== undefined) {
                            slot.dayIdx = assignedDays[i];
                        }
                    });
                }
            }

            // ADIM 2: İlk planlanan günün gerçek saatine (firstSlotRefDate) göre kasların o gün hala yorgun olup olmadığını hesapla!
            const firstSlotDayIdx = weeklyDays.length > 0 ? weeklyDays[0].dayIdx : 1;
            const firstSlotRefDate = getPlannedSlotReferenceDate(firstSlotDayIdx, isTargetNextWeek);
            const includeFirstPrecheck = (firstSlotRefDate.getTime() - Date.now()) <= 36 * 60 * 60 * 1000;
            const firstSlotCtx = (typeof getRecentAndScheduledMuscleContext === 'function')
                ? getRecentAndScheduledMuscleContext({ referenceTimeMs: firstSlotRefDate.getTime(), includePrecheck: includeFirstPrecheck })
                : baseHistoryCtx;
            const hoursSinceLastAtFirstSlot = (firstSlotCtx && firstSlotCtx.lastSessionHoursAgo !== null && firstSlotCtx.lastSessionHoursAgo !== undefined)
                ? Number(firstSlotCtx.lastSessionHoursAgo)
                : null;
            const isRecentLastSessionAtFirstSlot = (hoursSinceLastAtFirstSlot !== null && hoursSinceLastAtFirstSlot < 38);

            const legsWorkedRecently = hasThisWeekCompleted && isRecentLastSessionAtFirstSlot && lastLegSets >= 3 && !lastWasFullBody;
            const upperOnlyRecently = hasThisWeekCompleted && isRecentLastSessionAtFirstSlot && lastLegSets < 2 && lastUpperSets >= 4;

            const legsFatiguedNow = (includeFirstPrecheck && precheck.fatigue === 'legs')
                || (Array.isArray(firstSlotCtx.fatiguedMuscles48h) && firstSlotCtx.fatiguedMuscles48h.includes('Bacak') && !lastWasFullBody)
                || legsWorkedRecently;
            const upperFatiguedNow = (includeFirstPrecheck && precheck.fatigue === 'upper')
                || (Array.isArray(firstSlotCtx.fatiguedMuscles48h) && (firstSlotCtx.fatiguedMuscles48h.includes('Göğüs') && firstSlotCtx.fatiguedMuscles48h.includes('Sırt')) && !legsFatiguedNow && !lastWasFullBody)
                || upperOnlyRecently;
            const backFatiguedNow = (includeFirstPrecheck && precheck.fatigue === 'back');

            // ADIM 3: Kalan günlerin bölgesel dağılımını (split) ilk günün gerçek toparlanma durumuna ve haftalık hacme göre kur
            if (hasThisWeekCompleted && chosenTplKey !== 'flow_complex_3day') {
                if (weeklyDays.length === 2) {
                    if (chosenTplKey === 'ppl_3day') {
                        if (legsFatiguedNow && lastUpperSets < 4) {
                            weeklyDays[0].split = lastPushSets <= lastPullSets ? 'upper_push' : 'upper_pull';
                            weeklyDays[1].split = lastPushSets <= lastPullSets ? 'upper_pull' : 'upper_push';
                        } else if (legsFatiguedNow) {
                            weeklyDays[0].split = lastPullSets <= lastPushSets ? 'upper_pull' : 'upper_push';
                            weeklyDays[1].split = 'lower';
                        } else if (lastPushSets > lastPullSets + 2) {
                            weeklyDays[0].split = 'upper_pull';
                            weeklyDays[1].split = 'lower';
                        } else {
                            weeklyDays[0].split = 'lower';
                            weeklyDays[1].split = lastPullSets <= lastPushSets ? 'upper_pull' : 'upper_push';
                        }
                    } else if (legsFatiguedNow) {
                        weeklyDays[0].split = 'upper';
                        weeklyDays[0].customRestNote = 'Bacak Korumalı';
                        weeklyDays[1].split = 'full_body';
                    } else if (upperFatiguedNow) {
                        weeklyDays[0].split = 'lower';
                        weeklyDays[0].customRestNote = 'Üst Vücut Korumalı';
                        weeklyDays[1].split = 'full_body';
                    }
                } else if (weeklyDays.length === 1) {
                    const wkLegs = Number(weekMuscleMap['Bacak']) || 0;
                    const wkUpper = (Number(weekMuscleMap['Göğüs']) || 0) + (Number(weekMuscleMap['Sırt']) || 0) + (Number(weekMuscleMap['Omuz']) || 0);
                    let finalSplit = 'full_body';
                    if (legsFatiguedNow || (wkLegs >= 8 && wkUpper < 8)) {
                        finalSplit = 'upper';
                    } else if (upperFatiguedNow || (wkUpper >= 12 && wkLegs < 4)) {
                        finalSplit = 'lower';
                    }
                    weeklyDays[0].split = finalSplit;
                }
            }

            const splitTitleForLabel = {
                upper: 'Üst Vücut',
                lower: 'Alt Vücut',
                full_body: 'Tüm Vücut',
                upper_push: 'Üst İtiş',
                upper_pull: 'Üst Çekiş',
                flow_complex: 'Çelik Akışı'
            };

            // 1. KURAL: Yorgun bölgeyi SADECE İLK GÜN (idx === 0) için koru; 2. güne (48+ saat sonra) dinlenmiş olarak yerleştir
            if (weeklyDays.length >= 1) {
                if (legsFatiguedNow && (weeklyDays[0].split === 'lower' || (weeklyDays[0].split === 'full_body' && chosenTplKey !== 'fullbody_3day'))) {
                    weeklyDays[0].split = 'upper';
                    weeklyDays[0].customRestNote = 'Bacak Korumalı';
                    if (weeklyDays.length >= 2 && weeklyDays[1].split === 'upper') {
                        weeklyDays[1].split = hasThisWeekCompleted ? 'full_body' : 'lower';
                    }
                } else if (upperFatiguedNow && (weeklyDays[0].split === 'upper' || weeklyDays[0].split === 'upper_push' || weeklyDays[0].split === 'upper_pull' || (weeklyDays[0].split === 'full_body' && chosenTplKey !== 'fullbody_3day'))) {
                    weeklyDays[0].split = 'lower';
                    weeklyDays[0].customRestNote = 'Üst Vücut Korumalı';
                    if (weeklyDays.length >= 2 && weeklyDays[1].split === 'lower') {
                        weeklyDays[1].split = hasThisWeekCompleted ? 'full_body' : 'upper';
                    }
                } else if (backFatiguedNow && (weeklyDays[0].split === 'upper_pull' || weeklyDays[0].split === 'lower' || weeklyDays[0].split === 'full_body')) {
                    weeklyDays[0].split = 'upper_push';
                    weeklyDays[0].customRestNote = 'Sırt/Bel Korumalı';
                    if (weeklyDays.length >= 2 && weeklyDays[1].split === 'upper_push') {
                        weeklyDays[1].split = 'lower';
                    }
                }
            }

            // 2. KURAL: Ardışık günler (örn. Cmt-Paz veya Per-Cum) varsa aynı kasa yük bindirme; zıt kas gruplarına (Üst / Alt veya İtiş / Çekiş) ayır
            for (let i = 1; i < weeklyDays.length; i++) {
                const prevSlot = weeklyDays[i - 1];
                const curSlot = weeklyDays[i];
                const isConsecutive = (isoMap(curSlot.dayIdx) - isoMap(prevSlot.dayIdx)) === 1;
                curSlot.isConsecutive = isConsecutive;
                if (isConsecutive) {
                    if (prevSlot.split === 'full_body' && curSlot.split === 'full_body') {
                        prevSlot.split = 'upper';
                        curSlot.split = 'lower';
                        curSlot.customRestNote = 'Ardışık Gün Dengeli';
                    } else if (prevSlot.split === curSlot.split || curSlot.split === 'full_body') {
                        if (prevSlot.split === 'lower') {
                            curSlot.split = 'upper';
                        } else if (prevSlot.split === 'upper' || prevSlot.split === 'upper_push') {
                            curSlot.split = 'lower';
                        } else if (prevSlot.split === 'upper_pull') {
                            curSlot.split = 'lower';
                        }
                        curSlot.customRestNote = 'Ardışık Gün Dengeli';
                    }
                }
            }

            weeklyDays.forEach((slot) => {
                const dName = DAY_NAMES_TR[slot.dayIdx] || 'Gün';
                const sTitle = splitTitleForLabel[slot.split] || 'Antrenman';
                slot.label = `${dName}: ${sTitle}`;
            });

            // Taslak takvim objesi (DOĞRUDAN TAKVİME YAZILMAZ — Kullanıcı onaylayana kadar önizlemede bekler!)
            const draftSchedule = {};
            for (let d = 0; d <= 6; d++) {
                draftSchedule[d] = {
                    id: 'rest',
                    title: '🧘 Dinlenme & Aktif Toparlanma',
                    type: 'rest',
                    desc: 'Hafif yürüyüş, mobilite veya tam istirahat',
                    rest: true
                };
            }

            // KATMAN 5: HER PLANLI GÜNÜN KENDİ SAATİNE GÖRE DİNLENME HESABI (referenceTimeMs) + ÖNCEKİ TASLAK GÜNLERİN HAFIZASI (virtualLogs)
            const priorDraftVirtualLogs = [];
            const cumulativeUsedIds = new Set(baseHistoryCtx.usedExerciseIds ? Array.from(baseHistoryCtx.usedExerciseIds) : []);
            const cumulativeThisWeekIds = new Set(baseHistoryCtx.thisWeekExerciseIds ? Array.from(baseHistoryCtx.thisWeekExerciseIds) : []);
            const cumulativeUsedFinishers = new Set(baseHistoryCtx.usedFinishers ? Array.from(baseHistoryCtx.usedFinishers) : []);
            let prevGeneratedDayMuscles = [];
            let prevGeneratedDaySubKeys = new Set();
            let prevGeneratedDaySubKeys31 = new Set();
            let prevGeneratedDayFamilies = new Set();
            let prevGeneratedDayHadSpinalHinge = false;

            const generatedDaysList = [];
            weeklyDays.forEach((slot, idx) => {
                const slotRefDate = getPlannedSlotReferenceDate(slot.dayIdx, isTargetNextWeek);
                const includeSlotPrecheck = idx === 0 && ((slotRefDate.getTime() - Date.now()) <= 36 * 60 * 60 * 1000);
                const slotHistoryCtx = (typeof getRecentAndScheduledMuscleContext === 'function')
                    ? getRecentAndScheduledMuscleContext({
                        referenceTimeMs: slotRefDate.getTime(),
                        virtualLogs: priorDraftVirtualLogs,
                        includePrecheck: includeSlotPrecheck
                    })
                    : baseHistoryCtx;

                cumulativeUsedIds.forEach(id => slotHistoryCtx.usedExerciseIds.add(id));
                cumulativeThisWeekIds.forEach(id => slotHistoryCtx.thisWeekExerciseIds.add(id));
                cumulativeUsedFinishers.forEach(fid => slotHistoryCtx.usedFinishers.add(fid));

                const dayContext = Object.assign({}, slotHistoryCtx, {
                    hasTimeTravelContext: true,
                    dayOrderIndex: idx,
                    isConsecutiveWithPrevDay: Boolean(slot.isConsecutive),
                    prevGeneratedDayMuscles: [...prevGeneratedDayMuscles],
                    prevGeneratedDaySubKeys: new Set(prevGeneratedDaySubKeys),
                    prevGeneratedDaySubKeys31: new Set(prevGeneratedDaySubKeys31),
                    prevGeneratedDayFamilies: new Set(prevGeneratedDayFamilies),
                    prevGeneratedDayHadSpinalHinge: Boolean(prevGeneratedDayHadSpinalHinge)
                });

                selectSplit(slot.split);
                const dayDoctrine = (chosenTplKey === 'flow_complex_3day' || slot.split === 'flow_complex') ? 'func_pure' : currentSelectedDoctrine;
                handleGenerateWorkout(dayDoctrine, userWish, dayContext);
                if (currentGeneratedWorkout) {
                    const wClone = JSON.parse(JSON.stringify(currentGeneratedWorkout));
                    wClone.id = 'ai_wk_' + slot.dayIdx + '_' + (Date.now() + idx);
                    wClone.title = slot.label;
                    wClone.weeklyTemplate = chosenTplKey;
                    wClone.plannedDate = toLocalYmdString(slotRefDate);

                    const dayMuscles = new Set();
                    const daySubKeys = new Set();
                    const daySubKeys31 = new Set();
                    const dayFamilies = new Set();
                    let dayHasSpinal = false;

                    (wClone.exercises || []).forEach(ex => {
                        if (ex && ex.id) {
                            cumulativeUsedIds.add(ex.id);
                            cumulativeThisWeekIds.add(ex.id);
                        }
                        const anat = typeof getExerciseAnatomy === 'function' ? getExerciseAnatomy(ex) : null;
                        const pName = anat && anat.primary ? anat.primary.split('(')[0].trim() : (ex.muscle || '');
                        if (pName) dayMuscles.add(pName);
                        const fam = typeof getExerciseMovementFamily === 'function' ? getExerciseMovementFamily(ex) : '';
                        if (fam) dayFamilies.add(fam);
                        if (anat && Array.isArray(anat.primarySubKeys)) {
                            anat.primarySubKeys.forEach(pk => daySubKeys31.add(pk));
                        }
                        if (typeof getExercisePrimaryMuscleKeys === 'function') {
                            getExercisePrimaryMuscleKeys(ex).forEach(sk => daySubKeys.add(sk));
                        }
                        if (typeof isSpinalAxialLoadedExercise === 'function' && isSpinalAxialLoadedExercise(ex)) {
                            dayHasSpinal = true;
                        }
                    });
                    if (wClone.finisher && wClone.finisher.exId) {
                        cumulativeUsedFinishers.add(wClone.finisher.exId);
                    }

                    prevGeneratedDayMuscles = Array.from(dayMuscles);
                    prevGeneratedDaySubKeys = daySubKeys;
                    prevGeneratedDaySubKeys31 = daySubKeys31;
                    prevGeneratedDayFamilies = dayFamilies;
                    prevGeneratedDayHadSpinalHinge = dayHasSpinal;

                    // Bu günün planlanan antrenmanını sanal geçmişe (virtualLogs) ekle ki Cuma günü Çarşamba'da yapılan tüm setleri ve yorgunluğu bilsin!
                    const defaultSets = Number(wClone.scheme && wClone.scheme.sets) || 3;
                    priorDraftVirtualLogs.push({
                        id: wClone.id,
                        date: toLocalYmdString(slotRefDate),
                        timestamp: slotRefDate.getTime(),
                        title: wClone.title,
                        program: wClone.title,
                        isVirtualPlanned: true,
                        rpe: 8,
                        exercises: (wClone.exercises || []).map(ex => ({
                            id: ex.id,
                            name: ex.name,
                            muscle: ex.muscle,
                            category: ex.category,
                            completedSetsCount: Number(ex.sets) || defaultSets
                        }))
                    });

                    draftSchedule[slot.dayIdx] = {
                        id: wClone.id,
                        title: wClone.title,
                        type: 'custom_generated',
                        desc: `${wClone.exercises.length} Hareket • ${wClone.duration} Dk${userWish ? ' • Özel Odak' : ''}`,
                        rest: false,
                        customWorkout: wClone,
                        exercises: wClone.exercises
                    };
                    generatedDaysList.push({
                        dayIdx: slot.dayIdx,
                        dayName: DAY_NAMES_TR[slot.dayIdx] || '',
                        label: slot.label,
                        workout: wClone
                    });
                }
            });

            // Varsayılan split'i tekrar Tüm Vücut'a çek
            selectSplit('full_body');

            window.pendingAiWeeklyPlan = {
                templateKey: chosenTplKey,
                templateName: tpl.name,
                userWish,
                aiAnalysis: window.lastGeminiWishAnalysis || null,
                targetWeek: wkStatus.recommendedTargetWeek,
                wkStatus,
                days: generatedDaysList,
                draftSchedule
            };

            window.activeWeeklyPreviewDayIdx = 0;
            try {
                if (generatedDaysList[0] && generatedDaysList[0].workout) {
                    if (typeof persistLastGeneratedWorkout === 'function') {
                        persistLastGeneratedWorkout(generatedDaysList[0].workout);
                    } else {
                        localStorage.setItem('celik_kodu_last_generated_workout', JSON.stringify(generatedDaysList[0].workout));
                    }
                }
            } catch (e) {}
            closeAiHybridArchitectModal();
            switchTab('generatorTab');
            renderPendingWeeklyPlanPreview();

            const outEl = document.getElementById('generatedWorkoutOutput');
            if (outEl) {
                setTimeout(() => {
                    outEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
            if (typeof showToast === 'function') {
                showToast(`AI Haftalık Program taslağı hazırlandı! Gün sekmelerinden inceleyip onaylayabilirsiniz.`);
            }
        }
        window.applyAiWeeklySchedule = applyAiWeeklySchedule;

        window.activeWeeklyPreviewDayIdx = 0;
        window.expandedWeeklyExIndex = null;

        function selectWeeklyPreviewDay(dayIdx) {
            window.activeWeeklyPreviewDayIdx = Number(dayIdx) || 0;
            window.expandedWeeklyExIndex = null;
            renderPendingWeeklyPlanPreview();
        }
        window.selectWeeklyPreviewDay = selectWeeklyPreviewDay;

        function toggleWeeklyPreviewExDetail(exIdx) {
            const idx = Number(exIdx);
            const container = document.getElementById('generatedWorkoutOutput');
            const oldRows = container ? container.querySelectorAll('.wk-ex-item-wrap') : null;
            const anchorOffsetTop = (oldRows && oldRows[idx]) ? oldRows[idx].getBoundingClientRect().top : null;
            if (window.expandedWeeklyExIndex === idx) {
                window.expandedWeeklyExIndex = null;
            } else {
                window.expandedWeeklyExIndex = idx;
            }
            renderPendingWeeklyPlanPreview({ preserveScroll: true });
            if (anchorOffsetTop !== null && container) {
                const newRows = container.querySelectorAll('.wk-ex-item-wrap');
                if (newRows[idx]) {
                    const delta = newRows[idx].getBoundingClientRect().top - anchorOffsetTop;
                    if (Math.abs(delta) > 1) {
                        window.scrollBy({ top: delta, left: 0, behavior: 'instant' });
                    }
                }
            }
        }
        window.toggleWeeklyPreviewExDetail = toggleWeeklyPreviewExDetail;

        function buildTimelineStationsHtml(structuredList, baseScheme, weights, mode) {
            const list = Array.isArray(structuredList) ? structuredList : [];
            const toggleFn = mode === 'weekly_preview' ? 'toggleWeeklyPreviewExDetail' : 'toggleGeneratedExDetail';
            const expandedIdx = mode === 'weekly_preview' ? window.expandedWeeklyExIndex : window.expandedGeneratedExIndex;

            const renderCleanExItem = (ex, idx) => {
                const label = ex.blockLabel || String(idx + 1);
                const exScheme = Object.assign({}, baseScheme || { sets: 3, reps: '8-12', rest: 60 }, {
                    rest: ex.customRest || (baseScheme ? baseScheme.rest : 60)
                });
                const targetW = typeof getExerciseRememberedWeight === 'function' ? getExerciseRememberedWeight(ex) : '';
                const isExpanded = expandedIdx === idx;
                const repsStr = String(exScheme.reps || '8-12');
                const repsSuffix = /sn|dk|metre|tur|ad[ıi]m|tekrar/i.test(repsStr) ? '' : ' Tekrar';
                const detailCardHtml = isExpanded
                    ? `<div class="wk-ex-detail-drawer" onclick="event.stopPropagation();">${renderSingleExerciseCard(ex, String(label), exScheme, weights, mode)}</div>`
                    : '';

                return `
                    <div class="wk-ex-item-wrap ${isExpanded ? 'is-expanded' : ''}">
                        <div class="wk-ex-row-clean" onclick="${toggleFn}(${idx})" title="Detaylı hareket kartını ${isExpanded ? 'kapatmak' : 'açmak'} için dokunun">
                            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                                <span style="font-weight:800; font-size:14.5px; color:#0F172A; line-height:1.3;">${escapeHTML(ex.name)}</span>
                                <div style="display:inline-flex; align-items:center; gap:6px; flex-shrink:0;">
                                    <button type="button" class="wk-i-badge" style="border:none; cursor:pointer; width:22px; height:22px; font-size:12px;" onclick="event.stopPropagation(); openExerciseQuickInfoModal(decodeURIComponent('${encodeURIComponent(ex.id)}'))" title="Ekipman ve Kas Bilgisi">i</button>
                                    <span class="wk-ex-expand-hint" aria-hidden="true">${isExpanded ? '▴' : '▾'}</span>
                                </div>
                            </div>
                            <div style="font-size:12px; font-weight:600; color:#64748B; margin-top:2px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                <span>🎯 ${exScheme.sets} Set × ${escapeHTML(repsStr)}${repsSuffix}</span>
                                ${targetW ? `<span style="color:#B45309; font-weight:700;">🏋️ Son: ${targetW} kg</span>` : ''}
                            </div>
                        </div>
                        ${detailCardHtml}
                    </div>
                `;
            };

            let stationsHtml = '';
            let i = 0;
            let stationNum = 1;
            while (i < list.length) {
                const ex = list[i];
                const pair = getSupersetPairInfo(list, i);
                const isSupersetStart = Boolean(pair && pair.firstIdx === i && list[i + 1]);
                const stationNumStr = String(stationNum).padStart(2, '0');
                stationNum++;

                if (isSupersetStart) {
                    const secondEx = list[i + 1];
                    const roundRest = pair.roundRest || secondEx.customRest || (baseScheme ? baseScheme.rest : 60);
                    stationsHtml += `
                        <div class="timeline-station-item">
                            <div style="display:flex; flex-direction:column; align-items:center;">
                                <div class="timeline-station-num" style="background:#FF5A36; box-shadow:0 2px 6px rgba(255,90,54,0.28);">${stationNumStr}</div>
                                <div class="timeline-station-line"></div>
                            </div>
                            <div class="timeline-station-card is-superset">
                                ${renderCleanExItem(ex, i)}
                                <div class="timeline-transition-divider">
                                    <div class="timeline-transition-line"></div>
                                    <span class="timeline-transition-badge">⚡ GEÇİŞ (0 SN)</span>
                                    <div class="timeline-transition-line"></div>
                                </div>
                                ${renderCleanExItem(secondEx, i + 1)}
                                <div style="margin-top:10px; padding-top:8px; border-top:1px solid #F1F5F9;">
                                    <span class="timeline-rest-pill">⏱️ ${roundRest} sn Dinlenme</span>
                                </div>
                            </div>
                        </div>
                    `;
                    i += 2;
                } else {
                    const exRest = ex.customRest || (baseScheme ? baseScheme.rest : 60);
                    stationsHtml += `
                        <div class="timeline-station-item">
                            <div style="display:flex; flex-direction:column; align-items:center;">
                                <div class="timeline-station-num">${stationNumStr}</div>
                                <div class="timeline-station-line"></div>
                            </div>
                            <div class="timeline-station-card">
                                ${renderCleanExItem(ex, i)}
                                <div style="margin-top:10px; padding-top:8px; border-top:1px solid #F1F5F9;">
                                    <span class="timeline-rest-pill">⏱️ ${exRest} sn Dinlenme</span>
                                </div>
                            </div>
                        </div>
                    `;
                    i += 1;
                }
            }

            return `<div class="timeline-container">${stationsHtml}</div>`;
        }
        window.buildTimelineStationsHtml = buildTimelineStationsHtml;

        function dismissGeneratedWorkoutView() {
            if (window.pendingAiWeeklyPlan && window._editingPendingWeeklyDayIdx !== null && window._editingPendingWeeklyDayIdx !== undefined) {
                renderPendingWeeklyPlanPreview();
                return;
            }
            window.expandedGeneratedExIndex = null;
            const container = document.getElementById('generatedWorkoutOutput');
            if (container) container.innerHTML = '';
        }
        window.dismissGeneratedWorkoutView = dismissGeneratedWorkoutView;

        function openWorkoutInfoModal(type) {
            const id = type === 'warmup' ? 'wkWarmupModalOverlay' : 'wkCoachSummaryModalOverlay';
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'flex';
                const box = el.querySelector('.wk-info-modal-box');
                if (box) box.scrollTop = 0;
            }
        }
        window.openWorkoutInfoModal = openWorkoutInfoModal;

        function closeWorkoutInfoModal(type) {
            const id = type === 'warmup' ? 'wkWarmupModalOverlay' : 'wkCoachSummaryModalOverlay';
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        }
        window.closeWorkoutInfoModal = closeWorkoutInfoModal;

        function buildWorkoutInfoModalsHtml(workout, scope) {
            const auditContainerId = scope === 'weekly_preview' ? 'aiAcademicWeeklyAuditContainer' : 'aiAcademicAuditContainer';
            const warmupsList = (workout && Array.isArray(workout.warmups)) ? workout.warmups : [];
            const warmupsBodyHtml = warmupsList.length > 0
                ? warmupsList.map(wm => `
                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; margin-bottom:8px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:3px;">
                            <strong style="color:#0F172A; font-size:13px;">${escapeHTML(wm.name)}</strong>
                            <span style="font-size:11px; font-weight:800; color:#B52603; background:#FFF1EE; border:1px solid #FFDAD2; padding:1px 7px; border-radius:999px;">${escapeHTML(wm.dur || '')}</span>
                        </div>
                        <div style="font-size:12px; color:#475569; line-height:1.45;">${escapeHTML(wm.cue || '')}</div>
                    </div>
                `).join('')
                : `<div style="font-size:12.5px; color:#64748B;">5 dakika eklem mobilizasyonu ve hafif dinamik ısınma uygulayın.</div>`;

            return `
                <div id="wkCoachSummaryModalOverlay" class="wk-info-modal-overlay" style="display:none;" onclick="if(event.target===this)closeWorkoutInfoModal('coach')">
                    <div class="wk-info-modal-box">
                        <div class="wk-info-modal-header">
                            <div style="display:flex; align-items:center; gap:7px;">
                                <span class="wk-i-badge">i</span>
                                <strong style="font-size:14px; font-weight:800; color:#0F172A;">Koç Özeti & Eksik Telafisi</strong>
                            </div>
                            <button type="button" class="wk-info-modal-close" onclick="closeWorkoutInfoModal('coach')" aria-label="Kapat">✕</button>
                        </div>
                        <div class="wk-info-modal-body">
                            <div id="${auditContainerId}" style="display:block;">
                                ${typeof buildAutoCoachThreeLineSummaryHtml === 'function' ? buildAutoCoachThreeLineSummaryHtml(workout, scope) : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="wkWarmupModalOverlay" class="wk-info-modal-overlay" style="display:none;" onclick="if(event.target===this)closeWorkoutInfoModal('warmup')">
                    <div class="wk-info-modal-box">
                        <div class="wk-info-modal-header">
                            <div style="display:flex; align-items:center; gap:7px;">
                                <span class="wk-i-badge">i</span>
                                <strong style="font-size:14px; font-weight:800; color:#0F172A;">Dinamik Isınma & Mobilite (5 Dk)</strong>
                            </div>
                            <button type="button" class="wk-info-modal-close" onclick="closeWorkoutInfoModal('warmup')" aria-label="Kapat">✕</button>
                        </div>
                        <div class="wk-info-modal-body">
                            ${warmupsBodyHtml}
                        </div>
                    </div>
                </div>
            `;
        }
        window.buildWorkoutInfoModalsHtml = buildWorkoutInfoModalsHtml;

        function dismissPendingWeeklyPlan() {
            window.pendingAiWeeklyPlan = null;
            window.expandedWeeklyExIndex = null;
            const container = document.getElementById('generatedWorkoutOutput');
            if (container) container.innerHTML = '';
        }
        window.dismissPendingWeeklyPlan = dismissPendingWeeklyPlan;

        function renderPendingWeeklyPlanPreview(options = {}) {
            const plan = window.pendingAiWeeklyPlan;
            const container = document.getElementById('generatedWorkoutOutput');
            if (!plan || !container || !Array.isArray(plan.days) || plan.days.length === 0) return;
            window._editingPendingWeeklyDayIdx = null;
            const savedScrollY = window.scrollY;

            let activeIdx = Number(window.activeWeeklyPreviewDayIdx) || 0;
            if (activeIdx < 0 || activeIdx >= plan.days.length) {
                activeIdx = 0;
                window.activeWeeklyPreviewDayIdx = 0;
            }

            const wkStatus = getWeeklyTrainingStatus();
            const isNextWeekRecommended = wkStatus.isThisWeekComplete;

            const nextMonDate = typeof getDateForScheduleDay === 'function' ? getDateForScheduleDay(1, true) : null;
            const nextFriDate = typeof getDateForScheduleDay === 'function' ? getDateForScheduleDay(5, true) : null;
            const fmtShort = (d) => d ? `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}` : '';
            const nextRangeStr = (nextMonDate && nextFriDate) ? ` (${fmtShort(nextMonDate)} - ${fmtShort(nextFriDate)})` : '';

            const timingBannerHtml = isNextWeekRecommended ? `
                <div class="wk-timing-banner" style="padding:8px 12px; align-items:center;">
                    <span style="color:#15803D; display:flex; align-items:center;">${CANVA_ICONS.calendar}</span>
                    <div style="font-size:12px;">
                        <strong style="color:#15803D;">Gelecek Hafta${escapeHTML(nextRangeStr)}</strong> • Bu hafta ${wkStatus.completedThisWeekCount} antrenman tamamlandı
                    </div>
                </div>
            ` : `
                <div class="wk-timing-banner" style="background:rgba(56,189,248,0.08); border-color:rgba(56,189,248,0.28); padding:8px 12px; align-items:center;">
                    <span style="color:#0369A1; display:flex; align-items:center;">${CANVA_ICONS.calendar}</span>
                    <div style="font-size:12px;">
                        <strong style="color:#0369A1;">Taslak Hazır</strong> • Günleri inceleyip takvime ekleyin
                    </div>
                </div>
            `;

            const tplOptionsHtml = Object.keys(AI_WEEKLY_TEMPLATES).map(k => {
                const t = AI_WEEKLY_TEMPLATES[k];
                const sel = k === plan.templateKey ? 'selected' : '';
                return `<option value="${k}" ${sel}>${escapeHTML(t.name)}</option>`;
            }).join('');

            // 1. Gün, 2. Gün, 3. Gün sekme çubuğu (Tek satırda eşit aralıklı)
            const dayTabsHtml = plan.days.map((dItem, dIdx) => {
                const isActive = dIdx === activeIdx;
                return `
                    <button type="button" class="wk-day-tab-btn ${isActive ? 'active' : ''}" onclick="selectWeeklyPreviewDay(${dIdx})">
                        ${dIdx + 1}. Gün
                    </button>
                `;
            }).join('');

            // Sadece seçili olan günün programını tam genişlikte oluştur
            const activeDayItem = plan.days[activeIdx];
            const activeW = activeDayItem.workout;
            currentGeneratedWorkout = activeW;
            const activeCleanTitle = activeDayItem.label.replace(/^(Pzt|Sal|Çar|Per|Cum|Cmt|Paz):\s*/i, '');
            const weights = {};

            const hasUnupgradedPair = (activeW.exercises || []).some(ex => ex.blockType === 'superset' && ex.supersetRole === undefined);
            const structuredList = (activeW.exercises && activeW.exercises.length > 0 && activeW.exercises[0].blockLabel && !hasUnupgradedPair)
                ? activeW.exercises
                : assignAcademicBlockStructure(activeW.exercises || [], activeW.style || 'superset', activeW.scheme);
            activeW.exercises = structuredList;

            const timelineStationsHtml = buildTimelineStationsHtml(structuredList, activeW.scheme, weights, 'weekly_preview');

            const singleDayCardHtml = `
                <div class="wk-day-card wk-single-active-card" style="padding:14px;">
                    <div>
                        <div class="wk-day-card-header" style="margin-bottom:14px;">
                            <div>
                                <div class="wk-day-badge-row" style="margin-bottom:4px;">
                                    <span class="wk-day-num-pill">${activeIdx + 1}. GÜN • ${escapeHTML(activeDayItem.dayName.toUpperCase())}</span>
                                    <span class="wk-day-meta-pill">${structuredList.length} Hrk • ${activeW.duration || 45} Dk</span>
                                </div>
                                <h3 class="wk-day-title">${escapeHTML(activeCleanTitle)}</h3>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <button type="button" class="btn-action-secondary" style="padding:7px 11px; font-size:12px; border-color:rgba(182,240,89,0.35); color:#15803D;" onclick="inspectDayFromPendingWeeklyPlan(${activeIdx})">
                                    ${CANVA_ICONS.sliders} Düzenle
                                </button>
                            </div>
                        </div>

                        ${timelineStationsHtml}

                        <div style="display:flex; align-items:center; gap:10px; margin-top:14px; padding-top:12px; border-top:1px solid #E2E8F0;">
                            <button type="button" class="btn-action-secondary" style="padding:12px 20px; font-size:13.5px; font-weight:800; color:#0F172A; background:#F1F5F9; border:1px solid #E2E8F0; border-radius:14px; justify-content:center;" onclick="dismissPendingWeeklyPlan()">
                                Vazgeç
                            </button>
                            <button type="button" class="btn-start-workout" style="flex:1; padding:12px 20px; font-size:14px; font-weight:800; background:#FF5A36; color:#FFFFFF; border:none; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 6px 18px rgba(255,90,54,0.28);" onclick="startSingleDayFromPendingWeeklyPlan(${activeIdx})">
                                <span>▶️ Seansı Başlat</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const wishNoticeHtml = plan.userWish ? `
                <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
                    <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(250,204,21,0.12); border:1px solid rgba(250,204,21,0.38); color:#92400E; font-size:11.5px; font-weight:800; padding:4px 11px; border-radius:999px; width:fit-content;">
                        ${CANVA_ICONS.sparkle} İsteğiniz: "${escapeHTML(plan.userWish)}"
                    </div>
                    ${(plan.aiAnalysis && plan.aiAnalysis.summary) ? `
                    <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(168,85,247,0.12); border:1px solid rgba(168,85,247,0.35); color:#7E22CE; font-size:11.5px; font-weight:600; padding:5px 12px; border-radius:8px; line-height:1.4;">
                        <span>🤖 <strong>Gemini AI Biyomekanik Uyarlaması:</strong> ${escapeHTML(plan.aiAnalysis.summary)}</span>
                    </div>` : ''}
                </div>
            ` : '';

            container.innerHTML = `
                <div class="wk-preview-shell">
                    <div class="wk-preview-top-bar">
                        <div>
                            <div class="wk-preview-pill">${CANVA_ICONS.sparkle} HAFTALIK PROGRAM</div>
                            <h2 class="wk-preview-title">${escapeHTML(plan.templateName)}</h2>
                            ${wishNoticeHtml}
                        </div>
                        <div class="wk-preview-controls">
                            <select class="wk-tpl-select" onchange="handleQuickAiGenerate(this.value)" aria-label="Haftalık Şablon Seç">
                                ${tplOptionsHtml}
                            </select>
                            <button type="button" class="btn-action-secondary" style="padding:7px 11px; font-size:12px; border-color:#283548;" onclick="handleQuickAiGenerate('${plan.templateKey}')" title="Farklı hareketlerle yeniden üret">
                                ${CANVA_ICONS.refresh} Yenile
                            </button>
                            <button type="button" class="btn-action-secondary" style="padding:7px 11px; font-size:12px; border-color:#283548; color:#94A3B8;" onclick="switchQuickAiToSingleDay()" title="Tek günlük antrenman üret">
                                ${CANVA_ICONS.bolt} Tek Gün
                            </button>
                        </div>
                    </div>

                    ${timingBannerHtml}

                    <div class="wk-day-tabs-bar" role="tablist" aria-label="Haftalık Gün Seçimi">
                        ${dayTabsHtml}
                    </div>

                    <div class="wk-info-triggers-row" style="margin:10px 0 12px 0;">
                        <button type="button" class="wk-info-i-btn" onclick="openWorkoutInfoModal('coach')" title="Koç Özeti ve Eksik Telafisi">
                            <span class="wk-i-badge">i</span>
                            <span>Koç Özeti</span>
                        </button>
                        <button type="button" class="wk-info-i-btn" onclick="openWorkoutInfoModal('warmup')" title="Dinamik Isınma ve Mobilite">
                            <span class="wk-i-badge">i</span>
                            <span>Dinamik Isınma</span>
                        </button>
                    </div>

                    ${singleDayCardHtml}

                    ${buildWorkoutInfoModalsHtml(activeW, 'weekly_preview')}

                    <div class="wk-confirm-bar" style="flex-wrap:wrap; gap:8px;">
                        <button type="button" class="btn-ai-create-primary" style="flex:1; min-width:170px;" onclick="confirmPendingAiWeeklyPlan('next')">
                            ${CANVA_ICONS.calendar} Gelecek Haftaya Ekle
                        </button>
                        <button type="button" class="btn-action-secondary" style="flex:1; min-width:160px; padding:12px 14px; font-size:13px; border-color:rgba(56,189,248,0.4); color:#0369A1; font-weight:800; justify-content:center;" onclick="confirmPendingAiWeeklyPlan('current_safe')">
                            ${CANVA_ICONS.bolt} Bu Haftaya Ekle
                        </button>
                    </div>
                </div>
            `;

            if (activeW && !activeW._aiAutoAudited && typeof getGeminiApiKey === 'function' && getGeminiApiKey()) {
                activeW._aiAutoAudited = true;
                setTimeout(() => {
                    if (typeof validateWorkoutWithAcademicAI === 'function') {
                        validateWorkoutWithAcademicAI('weekly_preview', { silentAuto: true });
                    }
                }, 80);
            }

            if (options && options.scrollToTop) {
                if (container.scrollIntoView) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (Math.abs(window.scrollY - savedScrollY) > 1) {
                window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
            }
        }
        window.renderPendingWeeklyPlanPreview = renderPendingWeeklyPlanPreview;

        function startSingleDayFromPendingWeeklyPlan(dayIndexInList) {
            const plan = window.pendingAiWeeklyPlan;
            if (!plan || !plan.days || !plan.days[dayIndexInList]) return;
            currentGeneratedWorkout = plan.days[dayIndexInList].workout;
            startActiveWorkoutFromGenerated();
        }
        window.startSingleDayFromPendingWeeklyPlan = startSingleDayFromPendingWeeklyPlan;

        function inspectDayFromPendingWeeklyPlan(dayIndexInList) {
            const plan = window.pendingAiWeeklyPlan;
            if (!plan || !plan.days || !plan.days[dayIndexInList]) return;
            const activeIdx = Number(dayIndexInList) || 0;
            window.activeWeeklyPreviewDayIdx = activeIdx;
            window._editingPendingWeeklyDayIdx = activeIdx;
            currentGeneratedWorkout = plan.days[activeIdx].workout;
            window.currentGeneratedWorkout = currentGeneratedWorkout;
            if (currentGeneratedWorkout && currentGeneratedWorkout.split) {
                selectSplit(currentGeneratedWorkout.split);
            }
            window.expandedGeneratedExIndex = null;
            renderGeneratedWorkout();
        }
        window.inspectDayFromPendingWeeklyPlan = inspectDayFromPendingWeeklyPlan;

        async function auditAndRestructureConsecutiveDaysWithAI(currentSched, consecutivePairs) {
            if (!Array.isArray(consecutivePairs) || consecutivePairs.length === 0) return;

            for (const pair of consecutivePairs) {
                const itemA = currentSched[pair.d1];
                const itemB = currentSched[pair.d2];
                if (!itemA || !itemB || itemA.rest || itemB.rest) continue;

                const wA = itemA.customWorkout;
                const wB = itemB.customWorkout;
                if (!wA || !wB || !Array.isArray(wA.exercises) || !Array.isArray(wB.exercises)) continue;

                const dayNameA = DAY_NAMES_TR[pair.d1] || '1. Gün';
                const dayNameB = DAY_NAMES_TR[pair.d2] || '2. Gün';

                // Kas ve omurga yükü çakışmasını kontrol et
                const musclesA = wA.exercises.map(e => `${e.category || ''} ${e.muscle || ''} ${e.name || ''}`.toLocaleLowerCase('tr-TR'));
                const musclesB = wB.exercises.map(e => `${e.category || ''} ${e.muscle || ''} ${e.name || ''}`.toLocaleLowerCase('tr-TR'));

                const hasUpperOverlap = musclesA.some(m => /göğüs|omuz|triceps|push/.test(m)) && musclesB.some(m => /göğüs|omuz|triceps|push/.test(m));
                const hasLowerOverlap = musclesA.some(m => /bacak|quad|squat|lunge/.test(m)) && musclesB.some(m => /bacak|quad|squat|lunge/.test(m));
                const hasSpineOverlap = musclesA.some(m => /deadlift|rdl|barbell row|good morning/.test(m)) && musclesB.some(m => /deadlift|rdl|barbell row|squat/.test(m));

                if (!hasUpperOverlap && !hasLowerOverlap && !hasSpineOverlap) {
                    continue; // Zaten çakışma yok (zıt kas grupları)
                }

                try {
                    const prompt = `Kullanıcı takviminde ARD ARDA 2 GÜN antrenman yapacak:
1. GÜN (${dayNameA}): ${wA.title}
Hareketler: ${wA.exercises.map(e => e.name + ' (' + e.muscle + ')').join(', ')}

2. GÜN (${dayNameB}): ${wB.title}
Hareketler: ${wB.exercises.map(e => e.name + ' (' + e.muscle + ')').join(', ')}

BİYOMEKANİK KURALLAR (Schumann 2022 & Dr. Stuart McGill):
1. Ard arda gelen günlerde AYNI KAS GRUBUNA (örn. iki gün üst üste göğüs/itiş veya iki gün üst üste bacak/squat) ağır yük binemez (en az 48 saat toparlanma zorunludur).
2. İki gün üst üste omurgaya ağır eksenel/makaslama yükü (Squat, Deadlift, Barbell Row) bindirilemez.
3. 2. Günün hareketleri 1. Gün ile zıt veya tamamlayıcı olmalıdır (örn: 1. Gün Üst Vücut İtiş ise 2. Gün Alt Vücut veya Çekiş olmalı).

GÖREV:
2. Gün (${dayNameB}) programında 1. Gün (${dayNameA}) ile çakışan hareketleri tespit et ve 2. Gün için antagonist (zıt) ikame hareketler öner.

Aşağıdaki JSON şemasında çıktı ver:
\`\`\`json
{
  "hasConflict": true,
  "explanation": "Ardışık günlerde kas çakışmasını önlemek için 2. gün zıt kas grubuyla dengelendi.",
  "suggestedReplacements": [
    { "from": "Mevcut Hareket", "to": "Önerilen Zıt Hareket", "reason": "İtiş yerine çekişe geçildi" }
  ]
}
\`\`\``;

                    const sysPrompt = "Sen Çelik Kodu platformunun Baş Biyomekanik Uzmanı Yapay Zekasısın. Ard arda antrenman günlerinde kas çakışmasını sıfırlayarak sadece JSON çıktısı verirsin.";

                    if (typeof callGeminiAPI === 'function') {
                        const aiResp = await callGeminiAPI(prompt, sysPrompt, '', 1000);
                        if (aiResp) {
                            const jsonMatch = aiResp.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || aiResp.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                                if (parsed && Array.isArray(parsed.suggestedReplacements)) {
                                    parsed.suggestedReplacements.forEach(rep => {
                                        const fromLow = String(rep.from || '').toLocaleLowerCase('tr-TR');
                                        const exIdx = wB.exercises.findIndex(e => (e.name || '').toLocaleLowerCase('tr-TR').includes(fromLow));
                                        if (exIdx > -1) {
                                            const toLow = String(rep.to || '').toLocaleLowerCase('tr-TR');
                                            const matchNew = (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : []).find(e =>
                                                (e.name || '').toLocaleLowerCase('tr-TR').includes(toLow) || toLow.includes((e.name || '').toLocaleLowerCase('tr-TR'))
                                            );
                                            if (matchNew) {
                                                wB.exercises[exIdx] = Object.assign({}, matchNew, { isAiConsecutiveBalanced: true });
                                            }
                                        }
                                    });
                                    wB.consecutiveNote = parsed.explanation || 'AI: Ardışık gün çakışması önlendi.';
                                    itemB.desc += ` • ⚡ ${wB.consecutiveNote}`;
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.warn("Ard arda gün AI optimizasyon hatası:", err);
                    wB.consecutiveNote = `${dayNameA} ile ${dayNameB} ard arda olduğu için kas toparlanma dengesi uygulandı.`;
                }
            }
        }
        window.auditAndRestructureConsecutiveDaysWithAI = auditAndRestructureConsecutiveDaysWithAI;

        async function confirmPendingAiWeeklyPlan(mode = 'next') {
            const plan = window.pendingAiWeeklyPlan;
            if (!plan || !plan.draftSchedule) {
                if (typeof showToast === 'function') showToast("⚠️ Onaylanacak haftalık taslak bulunamadı.");
                return;
            }
            const user = getActiveUser();
            const uid = user ? user.id : 'default';

            // Onay öncesi her günün workout objesiyle draftSchedule referanslarını son kez senkronize et
            if (Array.isArray(plan.days)) {
                plan.days.forEach(dItem => {
                    if (dItem && dItem.workout && plan.draftSchedule[dItem.dayIdx]) {
                        const wObj = dItem.workout;
                        plan.draftSchedule[dItem.dayIdx].customWorkout = wObj;
                        plan.draftSchedule[dItem.dayIdx].exercises = wObj.exercises || [];
                        plan.draftSchedule[dItem.dayIdx].desc = `${(wObj.exercises || []).length} Hareket • ${wObj.duration || 45} Dk`;
                        plan.draftSchedule[dItem.dayIdx].updatedAt = Date.now();
                    }
                });
            }

            if (mode === 'next') {
                saveNextWeeklySchedule(JSON.parse(JSON.stringify(plan.draftSchedule)), uid);
                activePlannerWeek = 'next';
                switchTab('activeWorkoutTab');
                renderActiveWorkout();
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                if (typeof showToast === 'function') {
                    showToast(`✅ "${plan.templateName}" Gelecek Hafta takvimine işlendi! Bu haftaki tamamlanan antrenmanlarınız korundu.`);
                }
            } else {
                // 'current_safe': Haftanın kalan günlerine esnek ve eşit aralıklı dağıtım (Hiçbir antrenman ezilmez!)
                const wkStatus = getWeeklyTrainingStatus();
                const currentSched = getWeeklySchedule(uid);
                const todayDate = new Date();
                const todayIdx = todayDate.getDay();
                const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
                const isoMap = (d) => (d === 0 ? 7 : d);
                const todayIso = isoMap(todayIdx);

                const templateWorkouts = (plan.days || []).map(d => d.workout).filter(Boolean);
                const workoutCount = templateWorkouts.length;

                // Haftanın bugünden itibaren kalan ve henüz tamamlanmamış günlerini bul (ISO sırasıyla)
                const availableDays = [];
                for (let iso = todayIso; iso <= 7; iso++) {
                    const realDay = (iso === 7) ? 0 : iso;
                    if (!wkStatus.completedDays.includes(realDay)) {
                        availableDays.push(realDay);
                    }
                }

                if (availableDays.length === 0) {
                    if (typeof showToast === 'function') showToast("⚠️ Bu hafta için uygun gün kalmadı; Gelecek Haftaya ekleyebilirsiniz.");
                    return;
                }

                // Kalan günlere antrenmanları en dengeli (maksimum dinlenme aralıklı) şekilde dağıt
                const assignedDays = [];
                if (workoutCount === 1) {
                    assignedDays.push(availableDays[0]);
                } else if (workoutCount === 3 && availableDays.length >= 5) {
                    // Örn: Çarşamba (3), Cuma (5), Pazar (0)
                    assignedDays.push(availableDays[0], availableDays[2], availableDays[4]);
                } else if (workoutCount === 3 && availableDays.length === 4) {
                    // Örn: Perşembe (4), Cumartesi (6), Pazar (0)
                    assignedDays.push(availableDays[0], availableDays[2], availableDays[3]);
                } else {
                    const step = (availableDays.length - 1) / Math.max(1, workoutCount - 1);
                    for (let i = 0; i < workoutCount; i++) {
                        const idx = Math.min(Math.round(i * step), availableDays.length - 1);
                        if (!assignedDays.includes(availableDays[idx])) {
                            assignedDays.push(availableDays[idx]);
                        }
                    }
                }

                const nowTs = Date.now();
                // Önce kalan günleri temizle (dinlenmeye çek), sadece geçmiş veya tamamlanmış günleri koru
                availableDays.forEach(d => {
                    currentSched[d] = {
                        id: 'rest',
                        title: '🧘 Dinlenme & Aktif Toparlanma',
                        type: 'rest',
                        desc: 'Hafif yürüyüş, mobilite veya tam istirahat',
                        rest: true,
                        updatedAt: nowTs
                    };
                });

                // Antrenmanları seçilen günlere ata
                templateWorkouts.forEach((wk, i) => {
                    const targetDay = assignedDays[i];
                    if (targetDay !== undefined) {
                        const wkClone = JSON.parse(JSON.stringify(wk));
                        wkClone.id = 'ai_dyn_' + targetDay + '_' + nowTs + '_' + i;
                        wkClone.updatedAt = nowTs;
                        const cleanSub = wkClone.title ? wkClone.title.replace(/^⚔️\s*(Pzt|Sal|Çar|Per|Cum|Cmt|Paz):\s*/i, '') : 'Antrenman';
                        wkClone.title = `⚔️ ${DAY_NAMES_TR[targetDay]}: ${cleanSub}`;
                        currentSched[targetDay] = {
                            id: wkClone.id,
                            title: wkClone.title,
                            type: 'custom_generated',
                            desc: `${wkClone.exercises ? wkClone.exercises.length : 0} Hareket • ${wkClone.duration || 45} Dk`,
                            rest: false,
                            customWorkout: wkClone,
                            exercises: wkClone.exercises,
                            updatedAt: nowTs
                        };
                    }
                });

                // ARD ARDA GÜN KONTROLÜ & AI YENİDEN DÜZENLEME:
                const sortedAssigned = assignedDays.slice().sort((a, b) => isoMap(a) - isoMap(b));
                const consecutivePairs = [];
                for (let i = 0; i < sortedAssigned.length - 1; i++) {
                    const d1 = sortedAssigned[i];
                    const d2 = sortedAssigned[i + 1];
                    if (isoMap(d2) === isoMap(d1) + 1) {
                        consecutivePairs.push({ d1, d2 });
                    }
                }

                let hasConsecutiveFix = false;
                if (consecutivePairs.length > 0) {
                    hasConsecutiveFix = true;
                    await auditAndRestructureConsecutiveDaysWithAI(currentSched, consecutivePairs);
                }

                saveWeeklySchedule(currentSched, uid);
                if (typeof saveDateScheduleOverride === 'function') {
                    availableDays.forEach(d => {
                        const dDate = (typeof getDateForScheduleDay === 'function') ? getDateForScheduleDay(d, false) : null;
                        const dYMD = (dDate && typeof formatDateYMD === 'function') ? formatDateYMD(dDate) : (d === todayIdx ? todayYMD : '');
                        if (dYMD && currentSched[d]) {
                            saveDateScheduleOverride(dYMD, currentSched[d], uid);
                        }
                    });
                }

                activePlannerWeek = 'current';
                switchTab('activeWorkoutTab');
                renderActiveWorkout();
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();

                if (typeof showToast === 'function') {
                    if (hasConsecutiveFix) {
                        showToast(`⚡ 3 antrenman haftaya dağıtıldı (${assignedDays.map(d => DAY_NAMES_TR[d]).join(' • ')}). Ard arda gelen günler için AI kas çakışmasını önleyen antagonist düzenleme uyguladı!`);
                    } else {
                        showToast(`✅ 3 antrenmanın tamamı haftaya (${assignedDays.map(d => DAY_NAMES_TR[d]).join(' • ')}) eşit aralıklarla yerleştirildi! Hiçbir antrenman ezilmedi.`);
                    }
                }
            }
        }
        window.confirmPendingAiWeeklyPlan = confirmPendingAiWeeklyPlan;

        function startActiveWorkoutSession(workout) {
            if (workout) {
                currentGeneratedWorkout = workout;
            }
            startActiveWorkoutFromGenerated();
        }
        window.startActiveWorkoutSession = startActiveWorkoutSession;

        function pickRandom(arr) {
            if (!arr || arr.length === 0) return null;
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // ==================== KATMAN 1: BİYOMEKANİK HAREKET KALIBI HARİTASI (VEKTÖR & KAS ÇAKIŞMA ENGELLEYİCİ) ====================
        // Aynı biyomekanik vektörü ve aynı birincil kas kombinasyonunu çalıştıran hareketler AYNI AİLEYİ paylaşır.
        // Böylece aynı antrenmana 2 Squat, 2 Dikey Omuz Pres, 2 Squat-to-Press (Thruster + Landmine Squat to Press),
        // 2 RDL/Deadlift, 2 Lunge veya 2 Loaded Carry ASLA atanamaz.
        const EXERCISE_MOVEMENT_FAMILY_MAP = {
            // 1. Yatay Orta Göğüs İtiş (Horizontal Mid-Chest Press)
            db_bench_press: 'horiz_chest_press',
            bb_bench_press: 'horiz_chest_press',
            db_floor_press: 'horiz_chest_press',
            bw_pushup: 'horiz_chest_press',
            // 2. Üst Göğüs (Incline) İtiş
            db_incline_press: 'incline_chest_press',
            bb_incline_bench: 'incline_chest_press',
            bw_decline_pushup: 'incline_chest_press',
            // 3. Alt Göğüs & Göğüs İzolasyon (Fly / Dips)
            bw_dips: 'lower_chest_dips',
            mach_cable_crossover: 'chest_fly_iso',
            mach_pec_deck: 'pec_deck_iso',
            // 4. Dikey Omuz Pres & Ön Omuz (Strict / Seated / Standing / Arnold / Push Press / Front Raise)
            db_overhead_press: 'vertical_shoulder_press',
            db_standing_overhead_press: 'vertical_shoulder_press',
            db_arnold_press: 'vertical_shoulder_press',
            bb_overhead_press: 'vertical_shoulder_press',
            kb_press: 'vertical_shoulder_press',
            db_push_press: 'vertical_shoulder_press',
            bb_push_press: 'vertical_shoulder_press',
            kneeling_plate_front_raise: 'front_raise_iso',
            // 5. Squat-to-Press & Clean-to-Press Hibrit Kompleksler (Bacak + Omuz + Triceps + Core)
            // Thruster, Landmine Squat to Press, Step-up to Press, Clean & Press, Turkish Get-Up aynı seansta ÇAKIŞMAZ!
            db_thruster: 'squat_or_clean_press_complex',
            kb_thruster: 'squat_or_clean_press_complex',
            bb_thruster: 'squat_or_clean_press_complex',
            bb_landmine_squat_press: 'squat_or_clean_press_complex',
            step_up_press: 'squat_or_clean_press_complex',
            db_clean_and_press: 'squat_or_clean_press_complex',
            db_clean_squat_press: 'squat_or_clean_press_complex',
            kb_turkish_getup: 'squat_or_clean_press_complex',
            // 6. Yan Omuz İzolasyon
            db_lateral_raise: 'lateral_raise_iso',
            mach_cable_lateral: 'lateral_raise_iso',
            // 7. Arka Omuz & Omuz Mobilite
            mach_face_pull: 'rear_delt_pull',
            kb_halo: 'shoulder_halo_mobility',
            db_pullover_to_halo: 'shoulder_halo_mobility',
            // 8. Triceps (Uzun Baş Overhead / Skullcrusher / Yan Baş Pushdown & Dar İtiş)
            db_triceps_overhead: 'triceps_long_overhead',
            db_skullcrusher: 'triceps_skullcrusher_iso',
            mach_triceps_pushdown: 'triceps_lateral_push',
            bb_close_grip_bench: 'triceps_close_grip_press',
            bw_diamond_pushup: 'triceps_close_grip_press',
            // 9. Dikey Kanat Çekiş (Vertical Pull)
            bw_pullup: 'vertical_lat_pull',
            bw_chinup: 'vertical_chinup_pull',
            mach_lat_pulldown: 'vertical_lat_pull',
            // 10. Tek Kol Kanat & Pullover
            db_saw_row: 'unilateral_lat_row',
            db_pullover: 'lat_pullover',
            mach_straight_arm_pulldown: 'lat_pullover',
            // 11. Yatay Orta Sırt Çekiş (Horizontal Row)
            db_chest_supported_row: 'supported_midback_row',
            mach_cable_row: 'supported_midback_row',
            bw_inverted_row: 'inverted_body_row',
            bb_bent_over_row: 'barbell_hinge_row',
            bb_pendlay_row: 'barbell_hinge_row',
            kb_gorilla_row: 'plank_or_hinge_renegade_row',
            db_renegade_row: 'plank_or_hinge_renegade_row',
            db_renegade_pushup: 'plank_or_hinge_renegade_row',
            // 12. Biceps (Supinated / Incline / Hammer)
            db_biceps_curl: 'biceps_supinated_curl',
            bb_biceps_curl: 'biceps_supinated_curl',
            mach_cable_biceps: 'biceps_supinated_curl',
            db_incline_curl: 'biceps_long_incline_curl',
            db_hammer_curl: 'biceps_hammer_brachialis',
            // 13. Bilateral Squat & Leg Press (Çift Bacak Diz Baskın Çömelme)
            db_goblet_squat: 'bilateral_squat',
            kb_goblet_squat: 'bilateral_squat',
            db_front_squat: 'bilateral_squat',
            bb_back_squat: 'bilateral_squat',
            bb_front_squat: 'bilateral_squat',
            bb_zercher_squat: 'bilateral_squat',
            mach_leg_press: 'bilateral_squat',
            bw_air_squat: 'bilateral_squat',
            bw_jump_squat: 'bilateral_squat',
            // 14. Unilateral Bacak (Lunge / Split Squat)
            db_bulgarian_squat: 'unilateral_lunge_split',
            db_walking_lunge: 'unilateral_lunge_split',
            db_reverse_lunge: 'unilateral_lunge_split',
            lunge_with_twist: 'unilateral_lunge_split',
            db_seesaw_lunge: 'unilateral_lunge_split',
            // 15. Quad İzolasyon
            mach_leg_extension: 'quad_extension_iso',
            bw_sissy_squat: 'quad_extension_iso',
            // 16. Kalça Menteşesi (RDL / Deadlift)
            db_rdl: 'hip_hinge_rdl_deadlift',
            bb_rdl: 'hip_hinge_rdl_deadlift',
            db_single_leg_rdl: 'hip_hinge_rdl_deadlift',
            bb_deadlift: 'hip_hinge_rdl_deadlift',
            bw_hyperextension: 'posterior_hyperextension',
            // 17. Hamstring İzolasyon (Leg Curl)
            mach_leg_curl: 'hamstring_curl_iso',
            db_lying_leg_curl: 'hamstring_curl_iso',
            // 18. Kalça (Glute Thrust / Bridge)
            bb_hip_thrust: 'glute_bridge_thrust',
            bw_glute_bridge: 'glute_bridge_thrust',
            // 19. Kalf
            mach_calf_raise: 'calf_raise_iso',
            db_standing_calf_raise: 'calf_raise_iso',
            // 20. Balistik Patlayıcı Kalça Menteşesi (Swing / Clean / Snatch)
            db_swing: 'ballistic_hip_hinge',
            kb_swing: 'ballistic_hip_hinge',
            kb_clean: 'ballistic_hip_hinge',
            bb_hang_power_clean: 'ballistic_hip_hinge',
            db_snatch: 'ballistic_hip_hinge',
            kb_half_snatch: 'ballistic_hip_hinge',
            // 21. Yük Taşımaları (Loaded Carries)
            db_farmers_walk: 'loaded_carry',
            db_suitcase_carry: 'loaded_carry',
            waiters_carry: 'loaded_carry',
            cross_body_carry: 'loaded_carry',
            // 22. Core Rotasyon (Oblik Twist / Woodchopper / Windmill)
            db_russian_twist: 'core_rotation',
            mach_cable_woodchopper: 'core_rotation',
            half_kneeling_plate_chop: 'core_rotation',
            kb_windmill: 'core_rotation',
            // 23. Core Ön Karın & Anti-Ekstansiyon
            bw_plank: 'core_anterior_plank',
            bw_hollow_body: 'core_anterior_hollow',
            bw_hanging_knee_raise: 'core_hanging_raise',
            bw_mountain_climber: 'core_dynamic_climber',
            bear_crawl_pull_through: 'core_bear_crawl',
            // 24. Birleşik Kompleks & Metcon Akışları (Akademik Javorek & McGill)
            db_rdl_to_high_pull: 'rdl_high_pull_complex',
            db_swing_to_goblet_squat: 'swing_goblet_complex',
            db_lunge_to_curl_press: 'lunge_curl_press_complex',
            db_gorilla_row_to_clean: 'gorilla_clean_complex',
            db_floor_press_to_bridge: 'bridge_press_complex',
            db_step_back_lunge_to_knee_drive: 'lunge_knee_drive_complex',
            bw_inchworm_to_pushup: 'inchworm_pushup_complex',
            db_rotational_lunge_chop: 'lunge_chop_rotational',
            db_rotational_gorilla_row: 'gorilla_row_rotational',
            db_single_arm_rear_delt_row: 'rear_delt_sweep_parabolic',
            db_high_pull_cuban_rotation: 'row_high_pull_cuban',
            db_dumbbell_shrug_burnout: 'shrug_burnout',
            db_quadruped_external_rotation: 'quadruped_horizontal_fly',
            db_manmaker: 'fullbody_metcon_burpee',
            bw_burpee: 'fullbody_metcon_burpee',
            bw_squat_thrust: 'fullbody_metcon_burpee',
            bw_jumping_jack: 'cardio_plyo_rebound',
            bw_jump_rope: 'cardio_plyo_rebound',
            bw_high_knees: 'cardio_running_drill',
            bw_butt_kicks: 'cardio_running_drill',
            bw_skater_jumps: 'cardio_lateral_agility',
            bw_lateral_shuffle: 'cardio_lateral_agility',
            bw_plank_jacks: 'core_dynamic_climber'
        };

        function getExerciseMovementFamily(ex) {
            if (!ex) return '';
            const id = ex.id || ex.exId || '';
            if (EXERCISE_MOVEMENT_FAMILY_MAP[id]) return EXERCISE_MOVEMENT_FAMILY_MAP[id];
            return id;
        }
        function getExerciseMediaId(ex) {
            if (!ex) return '';
            const id = ex.id || ex.exId || '';
            const catalog = (typeof window !== 'undefined' && window.OPENGYM_GLOBAL_CATALOG) ? window.OPENGYM_GLOBAL_CATALOG : null;
            const entry = catalog ? catalog[id] : null;
            return entry && entry.id ? String(entry.id) : '';
        }
        function getExerciseCoveredSubKeys(ex) {
            const anat = getExerciseAnatomy(ex);
            if (!anat) return [];
            if (Array.isArray(anat.allSubKeys) && anat.allSubKeys.length > 0) return anat.allSubKeys;
            return anat.subKey ? [anat.subKey] : [];
        }
        window.EXERCISE_MOVEMENT_FAMILY_MAP = EXERCISE_MOVEMENT_FAMILY_MAP;
        window.getExerciseMovementFamily = getExerciseMovementFamily;
        window.getExerciseMediaId = getExerciseMediaId;
        window.getExerciseCoveredSubKeys = getExerciseCoveredSubKeys;

        // ==================== AÇI VEKTÖRÜ + %70 KAS ÖRTÜŞME MOTORU ====================
        // Eğilerek yapılan her hareketi toptan yasaklamak yerine:
        // 1. Hareketin çekiş/itiş açısını ve duruş desteğini (Angle Vector) belirler.
        // 2. İki hareketin birincil çalışan kaslarının örtüşme oranını (%70 sınırı) hesaplar.
        // Böylece eğilerek yapılan Arka Omuz (Rear Delt Row) veya Arka Bacak (RDL) hareketleri kısıtlanmazken,
        // aynı sırt kaslarını aynı eğik yatay açıyla vuran Barbell Row + Rotasyonel Gorilla Row gibi ikizler engellenir.
        const EXERCISE_ANGLE_VECTOR_MAP = {
            // Desteksiz Eğik Yatay Sırt/Kanat Çekişleri (Aynı seansta en fazla 1 adet!)
            bb_bent_over_row: 'pull_hinge_unsupported_back',
            bb_pendlay_row: 'pull_hinge_unsupported_back',
            kb_gorilla_row: 'pull_hinge_unsupported_back',
            db_rotational_gorilla_row: 'pull_hinge_unsupported_back',
            db_gorilla_row_to_clean: 'pull_hinge_unsupported_back',
            db_renegade_row: 'pull_hinge_unsupported_back',
            // Göğüs veya Diz Destekli Yatay Sırt/Kanat Çekişleri
            db_chest_supported_row: 'pull_horiz_supported_back',
            mach_cable_row: 'pull_horiz_supported_back',
            bw_inverted_row: 'pull_horiz_supported_back',
            db_saw_row: 'pull_horiz_supported_back',
            // Dikey Kanat Çekişleri & Üstten Pullover
            bw_pullup: 'pull_vertical_back',
            bw_chinup: 'pull_vertical_back',
            mach_lat_pulldown: 'pull_vertical_back',
            db_pullover: 'pull_overhead_lat_extension',
            db_pullover_to_halo: 'pull_overhead_lat_extension',
            mach_straight_arm_pulldown: 'pull_overhead_lat_extension',
            // Arka Omuz & Skapular Dış Rotasyon (Eğik yapılsa bile hedef kası Arka Omuzdur; sırt row ile çakışmaz)
            mach_face_pull: 'pull_high_face_cuban',
            db_single_arm_rear_delt_row: 'pull_rear_delt_external',
            db_high_pull_cuban_rotation: 'pull_high_face_cuban',
            db_quadruped_external_rotation: 'pull_quadruped_rear_fly',
            kb_halo: 'shoulder_halo_mobility',
            // Yatay Düz Göğüs İtiş
            db_bench_press: 'push_horiz_flat_chest',
            bb_bench_press: 'push_horiz_flat_chest',
            db_floor_press: 'push_horiz_flat_chest',
            bw_pushup: 'push_horiz_flat_chest',
            db_floor_press_to_bridge: 'push_horiz_flat_chest',
            // Üst Göğüs Eğimli İtiş
            db_incline_press: 'push_incline_upper_chest',
            bb_incline_bench: 'push_incline_upper_chest',
            bw_decline_pushup: 'push_incline_upper_chest',
            // Göğüs Açış (Fly) & Alt Göğüs Dips
            mach_cable_crossover: 'push_chest_fly_adduction',
            mach_pec_deck: 'push_pec_deck_iso',
            bw_dips: 'push_dip_lower_chest',
            // Dikey Omuz İtiş & Ön Omuz Kaldırış
            db_overhead_press: 'push_vertical_shoulder',
            db_standing_overhead_press: 'push_vertical_shoulder',
            db_arnold_press: 'push_vertical_shoulder',
            bb_overhead_press: 'push_vertical_shoulder',
            kb_press: 'push_vertical_shoulder',
            db_push_press: 'push_vertical_shoulder',
            bb_push_press: 'push_vertical_shoulder',
            kneeling_plate_front_raise: 'push_front_raise_shoulder',
            // Yan Omuz Açış
            db_lateral_raise: 'push_lateral_shoulder',
            mach_cable_lateral: 'push_lateral_shoulder',
            // Lunge + Omuz Pres Hibrit Kompleksleri (Aynı seansta en fazla 1 adet!)
            db_step_back_lunge_to_knee_drive: 'lunge_overhead_press_complex',
            db_lunge_to_curl_press: 'lunge_overhead_press_complex',
            // Balistik Swing & Swing-Squat Akışları (Aynı seansta en fazla 1 adet!)
            db_swing: 'ballistic_swing_hinge',
            kb_swing: 'ballistic_swing_hinge',
            db_swing_to_goblet_squat: 'ballistic_swing_hinge'
        };

        function getExerciseAngleVector(ex) {
            if (!ex) return '';
            const id = ex.id || ex.exId || '';
            if (EXERCISE_ANGLE_VECTOR_MAP[id]) return EXERCISE_ANGLE_VECTOR_MAP[id];
            return getExerciseMovementFamily(ex) || id;
        }

        const SUB31_BROAD_LOOKUP = {"chest_upper":"chest_upper","chest_mid":"chest_mid","chest_lower":"chest_lower","shoulders_front":"shoulders_front","shoulders_side":"shoulders_side","shoulders_rear":"shoulders_rear","back_lats":"back_lats","back_mid":"back_mid","traps":"traps","back_lower":"back_lower","legs_quad_outer":"legs_quad","legs_quad_inner":"legs_quad","legs_quad_mid":"legs_quad","legs_ham_curl":"legs_hamstrings","legs_ham_hinge":"legs_hamstrings","legs_ham_chain":"legs_hamstrings","legs_glutes_max":"legs_glutes","legs_glutes_med":"legs_glutes","legs_glutes_min":"legs_glutes","biceps_long":"biceps","biceps_short":"biceps","brachialis":"biceps","triceps_long":"triceps_long","triceps_lateral":"triceps_lateral","triceps_medial":"triceps_lateral","core_front":"core_front","core_obliques":"core_obliques","core_deep":"core_front","calves_gastroc":"legs_calves","calves_soleus":"legs_calves","calves_tibialis":"legs_calves"};
        function getExercisePrimaryMuscleKeys(ex) {
            if (!ex) return [];
            const anat = getExerciseAnatomy(ex);
            if (anat && Array.isArray(anat.primarySubKeys) && anat.primarySubKeys.length > 0) {
                const mapped = new Set();
                anat.primarySubKeys.forEach(k => {
                    if (k === 'traps') mapped.add('traps');
                    if (SUB31_BROAD_LOOKUP[k]) mapped.add(SUB31_BROAD_LOOKUP[k]);
                    else mapped.add(k);
                });
                return Array.from(mapped);
            }
            const pText = ((anat && anat.primary) ? anat.primary : (ex.muscle || '')).toLocaleLowerCase('tr-TR');
            const keys = new Set();
            if (/kanat|latissimus|sırt geniş/.test(pText)) keys.add('back_lats');
            if (/orta sırt|kürek|rhomboid|sırt kalın/.test(pText)) keys.add('back_mid');
            if (/trapez|üst sırt|boyun kökü/.test(pText)) keys.add('traps');
            if (/arka omuz|posterior deltoid/.test(pText)) keys.add('shoulders_rear');
            if (/yan omuz|lateral deltoid/.test(pText)) keys.add('shoulders_side');
            if (/ön omuz|anterior deltoid/.test(pText)) keys.add('shoulders_front');
            if (/orta göğüs|iç göğüs/.test(pText)) keys.add('chest_mid');
            if (/üst göğüs/.test(pText)) keys.add('chest_upper');
            if (/alt göğüs/.test(pText)) keys.add('chest_lower');
            if (/biceps|pazı|dış kol/.test(pText)) keys.add('biceps');
            if (/(?:triceps|arka kol)[^,.;]*(?:iç|uzun)|(?:iç|uzun)[^,.;]*(?:triceps|arka kol)/.test(pText)) keys.add('triceps_long');
            if (/triceps dış|triceps alt|yan baş/.test(pText) || (/triceps|arka kol/.test(pText) && !/iç|uzun/.test(pText))) keys.add('triceps_lateral');
            if (/ön bacak|quad/.test(pText)) keys.add('legs_quad');
            if (/arka bacak|hamstring/.test(pText)) keys.add('legs_hamstrings');
            if (/kalça|glute/.test(pText)) keys.add('legs_glutes');
            if (/kalf|baldır/.test(pText)) keys.add('legs_calves');
            if (/ön karın|alt karın|derin iç karın|korse/.test(pText)) keys.add('core_front');
            if (/yan karın|oblik|simit|dönüş/.test(pText)) keys.add('core_obliques');
            if (keys.size === 0 && anat && anat.subKey) {
                keys.add(anat.subKey);
            }
            return Array.from(keys);
        }

        function calculateExerciseMuscleOverlap(exA, exB) {
            if (!exA || !exB) return { primaryOverlap: 0, totalOverlap: 0, sameAngle: false, bothUnsupportedBackRow: false };
            const primA = getExercisePrimaryMuscleKeys(exA);
            const primB = getExercisePrimaryMuscleKeys(exB);
            let primInter = 0;
            primA.forEach(k => { if (primB.includes(k)) primInter++; });
            const minPrimLen = Math.min(primA.length, primB.length);
            const maxPrimLen = Math.max(primA.length, primB.length);
            // En küçük küme kapsama ve Dice ortalaması ile gerçek birincil kas örtüşme oranı
            const containment = minPrimLen > 0 ? (primInter / minPrimLen) : 0;
            const jaccard = (primA.length + primB.length - primInter) > 0 ? (primInter / (primA.length + primB.length - primInter)) : 0;
            const primaryOverlap = maxPrimLen > 0 ? ((containment * 0.6) + (jaccard * 0.4)) : 0;

            const allA = getExerciseCoveredSubKeys(exA);
            const allB = getExerciseCoveredSubKeys(exB);
            let allInter = 0;
            allA.forEach(k => { if (allB.includes(k)) allInter++; });
            const totalUnion = new Set([...allA, ...allB]).size;
            const totalOverlap = totalUnion > 0 ? (allInter / totalUnion) : 0;

            const vecA = getExerciseAngleVector(exA);
            const vecB = getExerciseAngleVector(exB);
            const sameAngle = Boolean(vecA && vecB && vecA === vecB);
            const bothUnsupportedBackRow = (vecA === 'pull_hinge_unsupported_back' && vecB === 'pull_hinge_unsupported_back');

            return {
                primaryOverlap,
                totalOverlap,
                sameAngle,
                angleVector: sameAngle ? vecA : '',
                bothUnsupportedBackRow
            };
        }

        function hasBiomechAngleAndMuscleConflict(candidateEx, existingList) {
            if (!candidateEx || !Array.isArray(existingList) || existingList.length === 0) return false;
            const SINGLE_PER_SESSION_ANGLES = new Set([
                'pull_hinge_unsupported_back',
                'pull_horiz_supported_back',
                'pull_vertical_back',
                'pull_overhead_lat_extension',
                'lunge_overhead_press_complex',
                'ballistic_swing_hinge',
                'push_horiz_flat_chest',
                'push_incline_upper_chest',
                'push_vertical_shoulder',
                'push_lateral_shoulder'
            ]);
            for (let i = 0; i < existingList.length; i++) {
                const other = existingList[i];
                if (!other || other.id === candidateEx.id) continue;
                const ov = calculateExerciseMuscleOverlap(candidateEx, other);
                // 1. İki desteksiz eğik sırt çekişi (örn. Barbell Row + Rotasyonel Gorilla Row / Gorilla Row) aynı seansta ASLA bulunamaz
                if (ov.bothUnsupportedBackRow) return true;
                // 2. Aynı açı vektörü seans başına tekil tanımlanmışsa (örn. iki destekli yatay row veya iki Lunge+Press kompleksi veya iki Swing) engelle
                if (ov.sameAngle && SINGLE_PER_SESSION_ANGLES.has(ov.angleVector)) return true;
                // 3. Aynı açı vektöründe olup birincil kas örtüşmesi >= %70 olan hareketler aynı seansta bulunamaz
                if (ov.sameAngle && ov.primaryOverlap >= 0.70) return true;
            }
            return false;
        }
        window.getExerciseAngleVector = getExerciseAngleVector;
        window.calculateExerciseMuscleOverlap = calculateExerciseMuscleOverlap;
        window.hasBiomechAngleAndMuscleConflict = hasBiomechAngleAndMuscleConflict;

        // ==================== KATMAN 4: BİYOMEKANİK SÜPERSET EŞLEŞTİRME VE AKADEMİK BLOK MOTORU ====================
        function isSpinalAxialLoadedExercise(ex) {
            if (!ex) return false;
            const id = ex.id || '';
            const fam = getExerciseMovementFamily(ex);
            const vec = getExerciseAngleVector(ex);
            if (vec === 'pull_hinge_unsupported_back' || fam === 'barbell_hinge_row' || fam === 'hip_hinge_rdl_deadlift' || fam === 'ballistic_hip_hinge') return true;
            if (/deadlift|rdl|bent_over_row|pendlay_row|gorilla_row|zercher_squat|back_squat|good_morning/.test(id)) return true;
            return false;
        }

        // Biyomekanik Uyumluluk Testi: İki hareket arka arkaya SÜPERSET olarak güvenle ve verimle yapılabilir mi?
        function isSupersetPairValid(exA, exB) {
            if (!exA || !exB) return false;
            if (exA.id === exB.id) return false;

            const famA = getExerciseMovementFamily(exA);
            const famB = getExerciseMovementFamily(exB);

            // KURAL 1: Aynı hareket ailesi (twin family) asla süperset olamaz (Örn: Barbell Row + Pendlay Row)
            if (famA && famB && famA === famB) return false;

            // KURAL 2: Çift Eksenel/Omurga Yükü Yasağı (Double Spinal Hinge Collapse):
            // İki serbest bel bükmeli (bent-over / hinge) hareket dinlenmeden peş peşe ASLA yapılamaz!
            // (Örn: Barbell Row + Pendlay Row, Deadlift + Barbell Row, RDL + Pendlay Row)
            if (isSpinalAxialLoadedExercise(exA) && isSpinalAxialLoadedExercise(exB)) {
                return false;
            }

            const catA = getEffectiveExerciseCategory(exA);
            const catB = getEffectiveExerciseCategory(exB);
            const anatA = getExerciseAnatomy(exA);
            const anatB = getExerciseAnatomy(exB);
            const subA = anatA ? anatA.subKey : '';
            const subB = anatB ? anatB.subKey : '';

            // KURAL 3: İki Ağır Bileşik Çekiş (Double Heavy Compound Pull) Asla Süperset Olamaz!
            // (Örn: Pendlay Row + Barbell Row, Barbell Row + Saw Row, Pullup + Barbell Row)
            const isHeavyCompoundPull = (e) => {
                const c = getEffectiveExerciseCategory(e);
                return (c === 'pull' || /back|lat|row|pull/.test(e.category || '')) && e.mechanic === 'compound';
            };
            if (isHeavyCompoundPull(exA) && isHeavyCompoundPull(exB)) {
                return false;
            }

            // KURAL 4: İki Ağır Bileşik İtiş (Double Heavy Compound Push) Asla Süperset Olamaz!
            // (Örn: Bench Press + Incline Bench Press, Barbell OHP + Bench Press)
            const isHeavyCompoundPush = (e) => {
                const c = getEffectiveExerciseCategory(e);
                return (c === 'push' || /push|press|chest/.test(e.category || '')) && e.mechanic === 'compound';
            };
            if (isHeavyCompoundPush(exA) && isHeavyCompoundPush(exB)) {
                return false;
            }

            // KURAL 5: İki Ağır Çift Bacak Çömelme (Double Bilateral Compound Squat) Asla Süperset Olamaz!
            // (Örn: Back Squat + Front Squat, Back Squat + Leg Press)
            if (famA === 'bilateral_squat' && famB === 'bilateral_squat') {
                return false;
            }

            // KURAL 6: Aynı İzole Kol Kası (Double Same Arm Isolation) Peş Peşe Olamaz!
            if (subA && subB) {
                if (subA === 'biceps' && subB === 'biceps') return false;
                if ((subA === 'triceps_long' || subA === 'triceps_lateral') && (subB === 'triceps_long' || subB === 'triceps_lateral')) return false;
            }

            return true;
        }

        // Biyomekanik ve Nöromüsküler Süperset Uyumluluk Skoru
        function getSupersetCompatibilityScore(exA, exB) {
            if (!isSupersetPairValid(exA, exB)) return -1000;

            let score = 10;
            const catA = getEffectiveExerciseCategory(exA);
            const catB = getEffectiveExerciseCategory(exB);
            const anatA = getExerciseAnatomy(exA);
            const anatB = getExerciseAnatomy(exB);
            const subA = anatA ? anatA.subKey : '';
            const subB = anatB ? anatB.subKey : '';

            // 1. ANTAGONİSTİK İTİŞ - ÇEKİŞ (Agonist-Antagonist Upper): Altın Standart (+60)
            const isPushPull = (catA === 'push' && catB === 'pull') || (catA === 'pull' && catB === 'push');
            if (isPushPull) {
                score += 60;
                // Biceps + Triceps Antagonisti (+25)
                const isArmAntagonist = (subA === 'biceps' && (subB === 'triceps_long' || subB === 'triceps_lateral')) ||
                                        (subB === 'biceps' && (subA === 'triceps_long' || subA === 'triceps_lateral'));
                if (isArmAntagonist) score += 25;
            }

            // 2. ALT VÜCUT - ÜST VÜCUT (PHA / Peripheral Heart Action): (+45)
            const isUpperLower = ((catA.startsWith('legs') && (catB === 'push' || catB === 'pull')) ||
                                  (catB.startsWith('legs') && (catA === 'push' || catA === 'pull')));
            if (isUpperLower) {
                score += 45;
            }

            // 3. ALT VÜCUT ANTAGONİST (Quad + Hamstring / Glute): (+40)
            const isLegAntagonist = (catA === 'legs_quad' && catB === 'legs_hinge') || (catA === 'legs_hinge' && catB === 'legs_quad');
            if (isLegAntagonist) {
                score += 40;
            }

            // 4. BİLEŞİK / İTİŞ / ÇEKİŞ + CORE / KONDİSYON: (+35)
            const isWithCore = (catA === 'core' && catB !== 'core') || (catB === 'core' && catA !== 'core');
            if (isWithCore) {
                score += 35;
            }

            // 5. İTİŞ + ARKA OMUZ / MOBİLİTE: (+30)
            if ((catA === 'push' && subB === 'shoulders_rear') || (catB === 'push' && subA === 'shoulders_rear')) {
                score += 30;
            }

            return score;
        }

        // Seans içi egzersizleri akademik blok ve süperset kurallarına göre akıllıca sıralar
        function optimizeWorkoutExerciseOrderForSupersets(exercises, style) {
            if (!Array.isArray(exercises) || exercises.length <= 2) return exercises;
            if (style !== 'superset' && style !== 'superset_light' && style !== 'superset_intense') {
                return exercises;
            }

            const pool = exercises.slice();
            const result = [];
            const getStraightPriority = (ex) => {
                let p = 0;
                if (isSpinalAxialLoadedExercise(ex)) p += 50;
                if (ex.mechanic === 'compound') p += 30;
                if (ex.equipment === 'barbell') p += 20;
                return p;
            };

            if (style === 'superset') {
                // SCHUMANN & WEAKLEY AKADEMİK HİBRİT MODELİ:
                // Slot 0: Ana Bileşik Düz Set (En yüksek spinal/CNS bileşik)
                // Slot 1 & 2: Süperset Blok A (A1 + A2)
                // Slot 3: İkincil Düz Set (varsa ikinci ağır bileşik veya tek kalan hareket)
                // Slot 4 & 5: Süperset Blok B (B1 + B2)
                // Slot 6+: Tamamlayıcı Düz Setler

                // 1. Slot 0 için Ana Bileşik hareketi seç
                pool.sort((a, b) => getStraightPriority(b) - getStraightPriority(a));
                result.push(pool.shift());

                if (pool.length === 0) return result;

                // 2. Kalan havuzdan en yüksek uyumluluk skoruna sahip EN İYİ SÜPERSET ÇİFTİNİ (A1 + A2) bul
                let bestPair = null;
                let bestPairScore = -Infinity;
                let bestPairIndices = [-1, -1];

                for (let i = 0; i < pool.length; i++) {
                    for (let j = i + 1; j < pool.length; j++) {
                        if (isSupersetPairValid(pool[i], pool[j])) {
                            const sc = getSupersetCompatibilityScore(pool[i], pool[j]);
                            if (sc > bestPairScore) {
                                bestPairScore = sc;
                                bestPair = [pool[i], pool[j]];
                                bestPairIndices = [i, j];
                            }
                        }
                    }
                }

                if (bestPair) {
                    pool.splice(bestPairIndices[1], 1);
                    pool.splice(bestPairIndices[0], 1);
                    result.push(bestPair[0], bestPair[1]);
                }

                // 3. Slot 3 için İkincil Düz Set
                if (pool.length > 0) {
                    pool.sort((a, b) => getStraightPriority(b) - getStraightPriority(a));
                    result.push(pool.shift());
                }

                // 4. Kalan havuzdan varsa ikinci süperset çiftini (B1 + B2) bul
                if (pool.length >= 2) {
                    let pairB = null;
                    let pairBScore = -Infinity;
                    let pairBIndices = [-1, -1];

                    for (let i = 0; i < pool.length; i++) {
                        for (let j = i + 1; j < pool.length; j++) {
                            if (isSupersetPairValid(pool[i], pool[j])) {
                                const sc = getSupersetCompatibilityScore(pool[i], pool[j]);
                                if (sc > pairBScore) {
                                    pairBScore = sc;
                                    pairB = [pool[i], pool[j]];
                                    pairBIndices = [i, j];
                                }
                            }
                        }
                    }

                    if (pairB) {
                        pool.splice(pairBIndices[1], 1);
                        pool.splice(pairBIndices[0], 1);
                        result.push(pairB[0], pairB[1]);
                    }
                }

                // 5. Geriye kalan tüm hareketler düz set olarak sona eklenir
                while (pool.length > 0) {
                    result.push(pool.shift());
                }

                return result;
            } else if (style === 'superset_intense') {
                // YOĞUN SÜPERSET (Tüm hareketler biyomekanik olarak uyumlu ikililer halinde eşleştirilir)
                while (pool.length >= 2) {
                    let bestPair = null;
                    let bestPairScore = -Infinity;
                    let bestPairIndices = [-1, -1];

                    for (let i = 0; i < pool.length; i++) {
                        for (let j = i + 1; j < pool.length; j++) {
                            if (isSupersetPairValid(pool[i], pool[j])) {
                                const sc = getSupersetCompatibilityScore(pool[i], pool[j]);
                                if (sc > bestPairScore) {
                                    bestPairScore = sc;
                                    bestPair = [pool[i], pool[j]];
                                    bestPairIndices = [i, j];
                                }
                            }
                        }
                    }

                    if (bestPair) {
                        pool.splice(bestPairIndices[1], 1);
                        pool.splice(bestPairIndices[0], 1);
                        result.push(bestPair[0], bestPair[1]);
                    } else {
                        // Birbiriyle uyumsuz kalan egzersizleri güvenli düz set olarak sıraya ekle
                        result.push(pool.shift());
                    }
                }
                if (pool.length > 0) {
                    result.push(pool.shift());
                }
                return result;
            } else if (style === 'superset_light') {
                // AZ SÜPERSET (Son 2 hareket kapanış süperseti, öncekiler düz set)
                if (pool.length < 3) return exercises;

                let bestPair = null;
                let bestPairScore = -Infinity;
                let bestPairIndices = [-1, -1];

                for (let i = 0; i < pool.length; i++) {
                    for (let j = i + 1; j < pool.length; j++) {
                        if (isSupersetPairValid(pool[i], pool[j])) {
                            const sc = getSupersetCompatibilityScore(pool[i], pool[j]);
                            if (sc > bestPairScore) {
                                bestPairScore = sc;
                                bestPair = [pool[i], pool[j]];
                                bestPairIndices = [i, j];
                            }
                        }
                    }
                }

                if (bestPair) {
                    pool.splice(bestPairIndices[1], 1);
                    pool.splice(bestPairIndices[0], 1);
                    pool.sort((a, b) => getStraightPriority(b) - getStraightPriority(a));
                    return [...pool, bestPair[0], bestPair[1]];
                }
                return exercises;
            }

            return exercises;
        }

        function assignAcademicBlockStructure(exercises, style, baseScheme) {
            if (!Array.isArray(exercises)) return [];
            const straightRest = (baseScheme && baseScheme.straightRest) || 90;
            const supersetRest = (baseScheme && baseScheme.supersetRest) || 45;
            const midRest = 60;

            // ADIM 1: Biyomekanik süperset ve omurga güvenliği kurallarına göre egzersiz sırasını optimize et
            const optimized = optimizeWorkoutExerciseOrderForSupersets(exercises, style);
            const total = optimized.length;
            let straightSeq = 0;

            const structured = optimized.map((rawEx, idx) => {
                const ex = Object.assign({}, rawEx);
                const exMode = (typeof getExerciseMetricMode === 'function') ? getExerciseMetricMode(ex) : 'reps';
                ex.metricMode = exMode;
                if (exMode === 'cardio_min') {
                    const defMin = (typeof resolveDefaultExerciseSetTarget === 'function') ? resolveDefaultExerciseSetTarget(ex, '') : 20;
                    ex.targetSets = 1;
                    ex.sets = 1;
                    if (!ex.targetReps || !/\b(dk|dak|min)\b/i.test(String(ex.targetReps))) {
                        ex.targetReps = `${defMin} dk`;
                    }
                } else if (exMode === 'time_sec') {
                    const defSec = (typeof resolveDefaultExerciseSetTarget === 'function') ? resolveDefaultExerciseSetTarget(ex, '') : 30;
                    if (!ex.targetReps || /^\d+\s*-\s*\d+$/.test(String(ex.targetReps).trim()) || (!/\b(sn|saniye|sec)\b/i.test(String(ex.targetReps)) && Number(ex.targetReps) < 15)) {
                        ex.targetReps = `${defSec} sn`;
                    }
                } else if (!ex.targetReps && baseScheme && baseScheme.reps) {
                    ex.targetReps = baseScheme.reps;
                }
                if (style === 'superset') {
                    // ORTA / AKADEMİK HİBRİT (Schumann et al. 2022 & Weakley et al. 2017):
                    // 1 Düz Bileşik Set + 1 Süperset (A1+A2) + 1 Düz Bileşik Set + 1 Süperset (B1+B2)
                    if (idx === 0) {
                        straightSeq++;
                        ex.blockType = 'straight';
                        ex.blockLabel = String(straightSeq);
                        ex.blockHeader = `🎯 BLOK ${straightSeq}: ANA BİLEŞİK DÜZ SET (${straightRest} sn Tam Dinlenme)`;
                        ex.customRest = straightRest;
                    } else if (idx === 1 && total >= 3) {
                        const pairOk = (idx + 1 < total) && isSupersetPairValid(optimized[1], optimized[2]);
                        if (pairOk) {
                            ex.blockType = 'superset';
                            ex.blockLabel = 'A1';
                            ex.blockHeader = `🔥 SÜPERSET BLOK A (A1 + A2 Peş Peşe • Tur Sonu ${midRest} sn Dinlenme)`;
                            ex.customRest = midRest;
                        } else {
                            straightSeq++;
                            ex.blockType = 'straight';
                            ex.blockLabel = String(straightSeq);
                            ex.blockHeader = `🎯 BLOK ${straightSeq}: BİLEŞİK DÜZ SET (75 sn Dinlenme)`;
                            ex.customRest = 75;
                        }
                    } else if (idx === 2 && total >= 3) {
                        const pairOk = isSupersetPairValid(optimized[1], optimized[2]);
                        if (pairOk) {
                            ex.blockType = 'superset';
                            ex.blockLabel = 'A2';
                            ex.blockHeader = null;
                            ex.customRest = midRest;
                        } else {
                            straightSeq++;
                            ex.blockType = 'straight';
                            ex.blockLabel = String(straightSeq);
                            ex.blockHeader = `🎯 BLOK ${straightSeq}: TAMAMLAYICI DÜZ SET (75 sn Dinlenme)`;
                            ex.customRest = 75;
                        }
                    } else if (idx === 3) {
                        straightSeq++;
                        ex.blockType = 'straight';
                        ex.blockLabel = String(straightSeq);
                        ex.blockHeader = `🎯 BLOK ${straightSeq}: İKİNCİL BİLEŞİK DÜZ SET (75 sn Dinlenme)`;
                        ex.customRest = 75;
                    } else if (idx === 4 && total >= 6) {
                        const pairOk = (idx + 1 < total) && isSupersetPairValid(optimized[4], optimized[5]);
                        if (pairOk) {
                            ex.blockType = 'superset';
                            ex.blockLabel = 'B1';
                            ex.blockHeader = `🔥 SÜPERSET BLOK B (B1 + B2 Peş Peşe • Tur Sonu ${supersetRest} sn Dinlenme)`;
                            ex.customRest = supersetRest;
                        } else {
                            straightSeq++;
                            ex.blockType = 'straight';
                            ex.blockLabel = String(straightSeq);
                            ex.blockHeader = `🎯 BLOK ${straightSeq}: TAMAMLAYICI DÜZ SET (${supersetRest} sn Dinlenme)`;
                            ex.customRest = supersetRest;
                        }
                    } else if (idx === 5 && total >= 6) {
                        const pairOk = isSupersetPairValid(optimized[4], optimized[5]);
                        if (pairOk) {
                            ex.blockType = 'superset';
                            ex.blockLabel = 'B2';
                            ex.blockHeader = null;
                            ex.customRest = supersetRest;
                        } else {
                            straightSeq++;
                            ex.blockType = 'straight';
                            ex.blockLabel = String(straightSeq);
                            ex.blockHeader = `🎯 BLOK ${straightSeq}: TAMAMLAYICI DÜZ SET (${supersetRest} sn Dinlenme)`;
                            ex.customRest = supersetRest;
                        }
                    } else if (idx === 6) {
                        straightSeq++;
                        ex.blockType = 'straight';
                        ex.blockLabel = String(straightSeq);
                        ex.blockHeader = `🎯 BLOK ${straightSeq}: TAMAMLAYICI DÜZ SET (${midRest} sn Dinlenme)`;
                        ex.customRest = midRest;
                    } else {
                        straightSeq++;
                        ex.blockType = 'straight';
                        ex.blockLabel = String(straightSeq);
                        ex.blockHeader = `🎯 BLOK ${straightSeq}: TAMAMLAYICI SET (${supersetRest} sn Dinlenme)`;
                        ex.customRest = supersetRest;
                    }
                } else if (style === 'superset_light') {
                    // AZ SÜPERSET: İlk N-2 hareket Düz Set, yalnızca son 2 hareket Kapanış Süperseti (A1+A2)
                    const supersetStartIdx = total >= 3 ? total - 2 : -1;
                    const pairOk = supersetStartIdx !== -1 && isSupersetPairValid(optimized[supersetStartIdx], optimized[supersetStartIdx + 1]);
                    if (pairOk && idx === supersetStartIdx) {
                        ex.blockType = 'superset';
                        ex.blockLabel = 'A1';
                        ex.blockHeader = `🔥 KAPANIŞ SÜPERSETİ BLOK A (A1 + A2 Peş Peşe • Tur Sonu ${supersetRest} sn Dinlenme)`;
                        ex.customRest = supersetRest;
                    } else if (pairOk && idx === supersetStartIdx + 1) {
                        ex.blockType = 'superset';
                        ex.blockLabel = 'A2';
                        ex.blockHeader = null;
                        ex.customRest = supersetRest;
                    } else {
                        const straightNo = idx + 1;
                        ex.blockType = 'straight';
                        ex.blockLabel = String(straightNo);
                        ex.blockHeader = straightNo === 1
                            ? `🛡️ DÜZ SET BLOKLARI (75-${straightRest} sn Tam Toparlanma)`
                            : null;
                        ex.customRest = idx === 0 ? straightRest : 75;
                    }
                } else if (style === 'superset_intense') {
                    // YOĞUN SÜPERSET: Tüm hareketler ikili süperset (A1/A2, B1/B2, C1/C2...)
                    const pairIdx = Math.floor(idx / 2);
                    const blockLetter = String.fromCharCode(65 + pairIdx);
                    const isFirstInPair = idx % 2 === 0;
                    const hasPartner = (idx + 1) < total;
                    const partnerIdx = isFirstInPair ? idx + 1 : idx - 1;
                    const pairOk = hasPartner && isFirstInPair 
                        ? isSupersetPairValid(optimized[idx], optimized[idx + 1])
                        : (partnerIdx >= 0 && isSupersetPairValid(optimized[partnerIdx], optimized[idx]));

                    if (isFirstInPair && hasPartner && pairOk) {
                        ex.blockType = 'superset';
                        ex.blockLabel = `${blockLetter}1`;
                        ex.blockHeader = `🔥 SÜPERSET BLOK ${blockLetter} (${blockLetter}1 + ${blockLetter}2 Dinlenmeden Peş Peşe • ${supersetRest} sn Dinlenme)`;
                        ex.customRest = supersetRest;
                    } else if (!isFirstInPair && pairOk) {
                        ex.blockType = 'superset';
                        ex.blockLabel = `${blockLetter}2`;
                        ex.blockHeader = null;
                        ex.customRest = supersetRest;
                    } else {
                        ex.blockType = 'straight';
                        ex.blockLabel = String(idx + 1);
                        ex.blockHeader = `🎯 GÜVENLİ DÜZ SET ${idx + 1} (${straightRest} sn Dinlenme)`;
                        ex.customRest = straightRest;
                    }
                } else if (style === 'emom') {
                    ex.blockType = 'emom';
                    ex.blockLabel = `DK ${idx + 1}`;
                    ex.blockHeader = idx === 0 ? `⏱️ EMOM İSTASYON DÖNGÜSÜ (Her Dakika Başında 1 İstasyon)` : null;
                    ex.customRest = 30;
                } else if (style === 'complex' || style === 'flow') {
                    ex.blockType = 'complex';
                    ex.blockLabel = `İstasyon ${idx + 1}`;
                    ex.blockHeader = idx === 0 ? `⚔️ ÇELİK AKIŞI • KESİNTİSİZ KOMPLEKS (4 Tur • Tur Sonu ${(baseScheme && baseScheme.rest) || 90} sn Dinlenme)` : null;
                    ex.customRest = (idx === total - 1) ? ((baseScheme && baseScheme.rest) || 90) : 0;
                } else {
                    // KLASİK DÜZ SET (straight)
                    ex.blockType = 'straight';
                    ex.blockLabel = String(idx + 1);
                    ex.blockHeader = idx === 0 ? `🛡️ KLASİK DÜZ SET BLOKLARI (Set Arası ${baseScheme ? baseScheme.rest : 75} sn Dinlenme)` : null;
                    ex.customRest = (baseScheme && baseScheme.rest) || 75;
                }
                return ex;
            });
            // Explicit pair metadata keeps preview, focus navigation and rest timing in sync.
            structured.forEach((ex, idx) => {
                if (ex.blockType !== 'superset' || !/^[A-Z][12]$/.test(ex.blockLabel || '')) return;
                const role = Number(ex.blockLabel.slice(-1));
                const partnerIdx = idx + (role === 1 ? 1 : -1);
                const partner = structured[partnerIdx];
                if (!partner || partner.blockType !== 'superset' || !isSupersetPairValid(structured[Math.min(idx, partnerIdx)], structured[Math.max(idx, partnerIdx)])) return;
                const groupId = ex.blockLabel.slice(0, -1);
                const roundRest = (role === 1 && groupId === 'A' && style === 'superset') ? midRest : supersetRest;
                ex.supersetGroupId = partner.supersetGroupId = groupId;
                ex.supersetRole = role;
                partner.supersetRole = 3 - role;
                ex.supersetPartnerIdx = partnerIdx;
                partner.supersetPartnerIdx = idx;
                ex.supersetPartnerName = partner.name;
                partner.supersetPartnerName = ex.name;
                ex.transitionRest = partner.transitionRest = 0;
                ex.roundRest = partner.roundRest = roundRest;
                ex.customRest = role === 1 ? 0 : roundRest;
                partner.customRest = partner.supersetRole === 1 ? 0 : roundRest;
            });
            return structured;
        }
        function getSupersetPairInfo(exercises, exIndex) {
            if (!Array.isArray(exercises)) return null;
            const ex = exercises[exIndex];
            if (!ex || ex.blockType !== 'superset') return null;
            let firstIdx = ex.supersetRole === 1 ? exIndex : ex.supersetRole === 2 ? ex.supersetPartnerIdx : -1;
            if (!Number.isInteger(firstIdx) || firstIdx < 0 || firstIdx >= exercises.length) {
                firstIdx = ex.blockLabel && /1$/.test(ex.blockLabel) ? exIndex : exIndex - 1;
            }
            const firstEx = exercises[firstIdx];
            const secondEx = exercises[firstIdx + 1];
            if (!firstEx || !secondEx || firstEx.blockType !== 'superset' || secondEx.blockType !== 'superset') return null;
            if (firstEx.supersetGroupId && secondEx.supersetGroupId && firstEx.supersetGroupId !== secondEx.supersetGroupId) return null;
            return { firstEx, secondEx, firstIdx, secondIdx: firstIdx + 1, groupId: firstEx.supersetGroupId || (firstEx.blockLabel || 'A1').slice(0, -1), roundRest: secondEx.roundRest || secondEx.customRest || 60 };
        }
        window.getSupersetPairInfo = getSupersetPairInfo;
        window.isSpinalAxialLoadedExercise = isSpinalAxialLoadedExercise;
        window.isSupersetPairValid = isSupersetPairValid;
        window.getSupersetCompatibilityScore = getSupersetCompatibilityScore;
        window.optimizeWorkoutExerciseOrderForSupersets = optimizeWorkoutExerciseOrderForSupersets;
        window.assignAcademicBlockStructure = assignAcademicBlockStructure;

        // KATMAN 5: 3 KATMANLI GEÇMİŞ HAFIZA + 31 ALT KAS HARİTASI + SAAT/YORGUNLUK EĞRİSİ + 7 GÜN DOYGUNLUK FRENİ
        function getRecentAndScheduledMuscleContext(options = {}) {
            const refMs = (options && options.referenceTimeMs && !isNaN(Number(options.referenceTimeMs)))
                ? Number(options.referenceTimeMs)
                : Date.now();
            const nowObj = new Date(refMs);
            const nowMs = nowObj.getTime();
            const virtualLogs = (options && Array.isArray(options.virtualLogs)) ? options.virtualLogs : [];
            const includePrecheck = (options && options.includePrecheck !== undefined)
                ? Boolean(options.includePrecheck)
                : ((nowMs - Date.now()) <= 36 * 60 * 60 * 1000);

            const usedExerciseIds = new Set();
            const thisWeekExerciseIds = new Set();
            const recent14dExerciseIds = new Set();
            const lastSessionExerciseIds = new Set();
            const lastSessionFamilies = new Set();
            const overusedExerciseIds30d = new Set();
            const subKeyVolume = {};
            const usedFinishers = new Set();
            const fatiguedSubKeys48h = new Set();
            const lastSessionSubKeys = new Set();
            const deficitSubKeys = new Set();
            const exFreq30d = {};

            // 31 Alt Kas Bölmesi Takip Tabloları (1.0x Birincil / 0.35x İkincil)
            const subKey31Sets7d = {};
            const subKey31Sets30d = {};
            const subKey31Fatigue = {};
            const thisWeekSubKey31Sets = {};
            const lastSessionSubKey31Sets = {};
            const lastSessionSubKeys31 = new Set();
            const adjacentPrevDaySubKeys31 = new Set();
            const deficitSubKeys31 = new Set();
            const saturatedSubKeys31 = new Set();
            const refYmd = toLocalYmdString(nowObj);
            const yesterdayRefObj = new Date(nowObj.getFullYear(), nowObj.getMonth(), nowObj.getDate() - 1, 12, 0, 0, 0);
            const yesterdayYmd = toLocalYmdString(yesterdayRefObj);

            const muscleSets48h = {};
            const muscleSets7d = {};
            const muscleSets14d = {};
            const muscleSets30d = {};
            const lastSessionMuscleSets = {};
            const thisWeekMuscleSets = {};

            let calvesSets48h = 0;
            let calvesSets7d = 0;
            let calvesSets30d = 0;

            let hadSpinalHinge48h = false;
            let lastSessionHadSpinalHinge = false;
            let lastSessionTitle = '';
            let lastSessionHoursAgo = null;
            let totalSessionsLastWeek = 0;
            let totalSessionsMonth = 0;

            const mapAcademicToContextMuscle = (mName) => {
                if (!mName) return 'Genel';
                const s = String(mName).trim();
                if (s === 'Ön Bacak' || s === 'Arka Bacak' || s === 'Glute' || s === 'Kalf' || s === 'Bacak' || s === 'Kalça') return 'Bacak';
                if (s === 'Biceps' || s === 'Ön Kol/Biceps' || s === 'Ön Kol') return 'Ön Kol/Biceps';
                if (s === 'Triceps' || s === 'Arka Kol/Triceps' || s === 'Arka Kol') return 'Arka Kol/Triceps';
                if (s === 'Karın' || s === 'Core' || s === 'Karın/Core') return 'Karın/Core';
                if (s === 'Göğüs' || s === 'Sırt' || s === 'Omuz') return s;
                const low = normSearchText(s);
                if (low.includes('bacak') || low.includes('quad') || low.includes('hamstring') || low.includes('glute') || low.includes('kalca') || low.includes('kalf')) return 'Bacak';
                if (low.includes('biceps') || low.includes('on kol') || low.includes('pazu')) return 'Ön Kol/Biceps';
                if (low.includes('triceps') || low.includes('arka kol')) return 'Arka Kol/Triceps';
                if (low.includes('gogus') || low.includes('chest') || low.includes('pectoral')) return 'Göğüs';
                if (low.includes('sirt') || low.includes('kanat') || low.includes('lat') || low.includes('trapez') || low.includes('rhomboid')) return 'Sırt';
                if (low.includes('omuz') || low.includes('deltoid')) return 'Omuz';
                if (low.includes('karin') || low.includes('core') || low.includes('oblik') || low.includes('abs')) return 'Karın/Core';
                return s;
            };

            const resolveDbExercise = (exItem) => {
                if (!exItem) return null;
                if (typeof EXERCISES_DB === 'undefined' || !Array.isArray(EXERCISES_DB)) return exItem;
                const rawId = String(exItem.id || exItem.exId || '').trim();
                if (rawId) {
                    const byId = EXERCISES_DB.find(e => e.id === rawId);
                    if (byId) return byId;
                }
                const cleanName = normSearchText(exItem.name || rawId);
                if (!cleanName) return exItem;
                const cleanBase = cleanName.split('(')[0].trim();
                return EXERCISES_DB.find(e => normSearchText(e.id) === cleanName || normSearchText(e.name) === cleanName)
                    || EXERCISES_DB.find(e => {
                        const en = normSearchText(e.name);
                        const eb = en.split('(')[0].trim();
                        return cleanBase.length >= 4 && (en.includes(cleanBase) || (eb.length >= 4 && cleanName.includes(eb)));
                    })
                    || exItem;
            };

            const recordExObj = (exItem, weightFactor = 1, is48h = false, isThisWeek = false, isLatest = false) => {
                if (!exItem) return;
                const dbEx = resolveDbExercise(exItem);
                const canonicalId = (dbEx && dbEx.id) ? dbEx.id : (exItem.id || exItem.exId || '');
                if (canonicalId && !exItem.isInterSetExtra) {
                    if (isThisWeek || is48h || weightFactor >= 2) {
                        usedExerciseIds.add(canonicalId);
                    } else {
                        recent14dExerciseIds.add(canonicalId);
                    }
                    if (isThisWeek) thisWeekExerciseIds.add(canonicalId);
                    if (isLatest) lastSessionExerciseIds.add(canonicalId);
                }
                if (exItem.id && !exItem.isInterSetExtra && (isThisWeek || is48h || weightFactor >= 2)) {
                    usedExerciseIds.add(exItem.id);
                }
                const fam = (typeof getExerciseMovementFamily === 'function') ? getExerciseMovementFamily(dbEx) : '';
                if (fam && isLatest && !exItem.isInterSetExtra) {
                    lastSessionFamilies.add(fam);
                }
                const primaryBroad = new Set(typeof getExercisePrimaryMuscleKeys === 'function' ? getExercisePrimaryMuscleKeys(dbEx) : []);
                const covered = typeof getExerciseCoveredSubKeys === 'function' ? getExerciseCoveredSubKeys(dbEx) : [];
                covered.forEach(sk => {
                    const isPrim = primaryBroad.size === 0 || primaryBroad.has(sk);
                    const effW = isPrim ? weightFactor : Math.round(weightFactor * 0.35 * 10) / 10;
                    subKeyVolume[sk] = (subKeyVolume[sk] || 0) + effW;
                    if (is48h && isPrim) fatiguedSubKeys48h.add(sk);
                    if (isLatest && isPrim) lastSessionSubKeys.add(sk);
                });
                if (typeof isSpinalAxialLoadedExercise === 'function' && isSpinalAxialLoadedExercise(dbEx)) {
                    if (is48h) hadSpinalHinge48h = true;
                    if (isLatest) lastSessionHadSpinalHinge = true;
                }
            };

            try {
                // 1. Gerçek antrenman geçmişini + aynı taslak haftanın önceki planlı günlerini (virtualLogs) hedef günün saatine (nowMs) göre tara
                const realLogs = (typeof getWorkoutLogs === 'function') ? getWorkoutLogs() : [];
                const combinedLogs = virtualLogs.length > 0 ? [...realLogs, ...virtualLogs] : realLogs;

                const todayDayIdx = nowObj.getDay();
                const diffToMonday = todayDayIdx === 0 ? -6 : 1 - todayDayIdx;
                const mondayOfThisWeek = new Date(nowObj);
                mondayOfThisWeek.setHours(0, 0, 0, 0);
                mondayOfThisWeek.setDate(nowObj.getDate() + diffToMonday);

                const ms7d  = 7 * 24 * 60 * 60 * 1000;
                const ms14d = 14 * 24 * 60 * 60 * 1000;
                const ms30d = 30 * 24 * 60 * 60 * 1000;

                const parsedLogs = combinedLogs
                    .map(lg => ({ log: lg, dateObj: parseWorkoutLogDateLocal(lg) }))
                    .filter(item => item.log && item.dateObj && !isNaN(item.dateObj.getTime()) && item.dateObj.getTime() <= nowMs + 60000)
                    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

                if (parsedLogs.length > 0) {
                    const latestItem = parsedLogs[0];
                    const diffH = Math.max(0, (nowMs - latestItem.dateObj.getTime()) / (1000 * 60 * 60));
                    lastSessionHoursAgo = Math.round(diffH);
                    lastSessionTitle = latestItem.log.program || latestItem.log.title || latestItem.log.workoutName || 'Son Antrenman';
                }

                parsedLogs.forEach((item, logIdx) => {
                    const log = item.log;
                    const dObj = item.dateObj;
                    const logTs = dObj.getTime();
                    const ageMs = Math.max(0, nowMs - logTs);
                    if (ageMs > ms30d) return;

                    const isLatestLog = (logIdx === 0);
                    const isThisCalendarWeek = (dObj >= mondayOfThisWeek);
                    const isWithin14d = ageMs <= ms14d;
                    const isWithin7d  = ageMs <= ms7d || isThisCalendarWeek;
                    if (!log.isVirtualPlanned) {
                        totalSessionsMonth++;
                        if (isWithin7d) totalSessionsLastWeek++;
                    }

                    if (!Array.isArray(log.exercises)) return;

                    const rpeMatch = (log.rpe !== undefined && log.rpe !== null) ? String(log.rpe).match(/(\d+(?:\.\d+)?)/) : null;
                    const sessionRpe = rpeMatch ? parseFloat(rpeMatch[1]) : null;

                    // Log içinde en az 1 hareketin seti tamamlanmışsa, tamamlanan set sayısı 0 olan (atlanmış) hareketleri hariç tut
                    const hasAnyExplicitCompleted = log.exercises.some(e =>
                        (e && e.completedSetsCount !== undefined && Number(e.completedSetsCount) > 0) ||
                        (e && Array.isArray(e.sets) && e.sets.some(s => s && s.completed))
                    );

                    log.exercises.forEach(ex => {
                        if (!ex) return;
                        if (hasAnyExplicitCompleted) {
                            const explicitZero = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null && Number(ex.completedSetsCount) === 0) ||
                                (Array.isArray(ex.sets) && ex.sets.length > 0 && ex.sets.every(s => s && s.completed === false));
                            if (explicitZero) return;
                        }

                        const dbEx = resolveDbExercise(ex);
                        const exId = (dbEx && dbEx.id) ? dbEx.id : (ex.id || ex.exId || ex.name || '');
                        if (exId && !log.isVirtualPlanned && !ex.isInterSetExtra) {
                            exFreq30d[exId] = (exFreq30d[exId] || 0) + 1;
                            if (exFreq30d[exId] >= 3) overusedExerciseIds30d.add(exId);
                        }

                        const spec = (typeof resolveExerciseBiomechanics === 'function')
                            ? resolveExerciseBiomechanics(
                                ex.name || (dbEx && dbEx.name),
                                ex.muscle || (dbEx && dbEx.muscle),
                                ex.category || (dbEx && dbEx.category),
                                (dbEx && dbEx.id) || ex.id || ''
                            )
                            : null;
                        const rawPrimName = (spec && spec.primary) ? spec.primary : (ex.muscle || (dbEx && dbEx.muscle) || 'Genel');
                        const primName = mapAcademicToContextMuscle(rawPrimName);

                        const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                            ? Number(ex.completedSetsCount)
                            : (Array.isArray(ex.sets) ? ex.sets.filter(s => s && s.completed).length : (Number(ex.sets) || 3));
                        const setsCount = cSets > 0 ? cSets : 3;

                        // AKADEMİK + SAAT TELEMETRİSİ TOPARLANMA EĞRİSİ (Damas 2016, Pareja-Blanco 2020, Maeo 2023):
                        const ageHours = ageMs / (1000 * 60 * 60);
                        const isSpinalEx = typeof isSpinalAxialLoadedExercise === 'function' && isSpinalAxialLoadedExercise(dbEx);
                        if (isSpinalEx && ageHours <= 60 && !ex.isInterSetExtra) {
                            hadSpinalHinge48h = true;
                        }

                        // Seans içi ağırlık veya tekrar düşüşü (tükeniş / drop-off) tespiti (örn. 7.5kgx10 -> 5kgx7):
                        let hadSetDropOff = false;
                        if (Array.isArray(ex.sets) && ex.sets.length >= 2) {
                            const compSets = ex.sets.filter(st => st && (st.completed !== false) && (Number(st.reps) > 0 || Number(st.weight) > 0));
                            if (compSets.length >= 2) {
                                const firstW = Number(compSets[0].weight) || 0;
                                const lastW  = Number(compSets[compSets.length - 1].weight) || 0;
                                const firstR = Number(compSets[0].reps) || 0;
                                const lastR  = Number(compSets[compSets.length - 1].reps) || 0;
                                if ((firstW > 0 && lastW > 0 && lastW < firstW) || (firstR > 0 && lastR > 0 && lastR <= firstR - 2)) {
                                    hadSetDropOff = true;
                                }
                            }
                        }

                        let baseRecoveryHours = 42;
                        if (primName === 'Karın/Core' || primName === 'Ön Kol/Biceps' || rawPrimName === 'Kalf') {
                            baseRecoveryHours = 34;
                        } else if (primName === 'Bacak') {
                            baseRecoveryHours = 44;
                        }
                        if (isSpinalEx) {
                            baseRecoveryHours += 4;
                        }
                        if (spec && spec.lengthened) {
                            baseRecoveryHours += 4;
                        }
                        if (hadSetDropOff) {
                            baseRecoveryHours += 6;
                        }

                        // Saatten gelen gerçek yük altında geçen süre (TUT), nabız/zirve nabız, HRR ve seans zorluk (RPE) etkisi:
                        let setTutSec = 0;
                        if (Array.isArray(ex.sets) && ex.sets.some(st => st && (st.durationSec || st.duration))) {
                            setTutSec = ex.sets.reduce((s, st) => s + Math.min(90, Number(st && (st.durationSec || st.duration)) || 0), 0);
                        }
                        let telemetryTutSec = 0;
                        if (ex.healthTelemetry) {
                            const rawTut = Number(ex.healthTelemetry.totalTimeUnderTensionSec || ex.healthTelemetry.timeUnderTensionSec || 0);
                            telemetryTutSec = Math.min(setsCount * 75, rawTut);
                        }
                        const tutSec = Math.max(setTutSec, telemetryTutSec);
                        if (!ex.isInterSetExtra) {
                            if (tutSec >= 200) baseRecoveryHours += 4;
                            else if (tutSec >= 120) baseRecoveryHours += 2;
                        }

                        const exPeakHr = Number(
                            (ex.healthTelemetry && (ex.healthTelemetry.peakHeartrate || ex.healthTelemetry.maxHeartrate)) ||
                            (log.healthSummary && log.healthSummary.heartrateMax) || 0
                        );
                        const exAvgHr = Number(
                            (ex.healthTelemetry && ex.healthTelemetry.avgHeartrate) ||
                            (log.healthSummary && log.healthSummary.heartrateAvg) || 0
                        );
                        const exHrr = Number((ex.healthTelemetry && ex.healthTelemetry.heartrateRecovery) || 0);
                        if (exPeakHr >= 165 || exAvgHr >= 145) baseRecoveryHours += 4;
                        else if (exPeakHr >= 150 || exAvgHr >= 135) baseRecoveryHours += 2;
                        if (exHrr > 0 && exHrr < 15) baseRecoveryHours += 2;

                        if (sessionRpe !== null) {
                            if (sessionRpe >= 9.5) baseRecoveryHours += 6;
                            else if (sessionRpe >= 8.5) baseRecoveryHours += 4;
                            else if (sessionRpe <= 6.5) baseRecoveryHours -= 4;
                        }
                        if (setsCount >= 5) baseRecoveryHours += 4;
                        else if (setsCount === 4) baseRecoveryHours += 2;

                        if (ex.isInterSetExtra || setsCount <= 1) {
                            baseRecoveryHours = Math.round(baseRecoveryHours * 0.55);
                        }
                        baseRecoveryHours = Math.max(24, Math.min(62, baseRecoveryHours));

                        // Saatlik kademeli yorgunluk katsayısı (0 ile 1 arası): Toparlanma penceresi içinde yüksek, pencere dolunca 0!
                        const fatigueDecay = ageHours < baseRecoveryHours
                            ? Math.max(0, 1 - Math.pow(ageHours / baseRecoveryHours, 1.35))
                            : 0;
                        const isCurrentlyFatiguedByEx = fatigueDecay >= 0.25 || (isLatestLog && ageHours <= 60 && hadSetDropOff);

                        const subKeyWeight = isCurrentlyFatiguedByEx
                            ? Math.round((8 + (fatigueDecay * 8)) * 10) / 10
                            : (isWithin7d ? (isThisCalendarWeek ? 5 : 2.5) : (isWithin14d ? 0.6 : 0));

                        if (subKeyWeight > 0) {
                            recordExObj(ex, subKeyWeight, isCurrentlyFatiguedByEx, isThisCalendarWeek, isLatestLog);
                        }

                        // 31 Alt Kas Bölmesi Hacim ve Yorgunluk İşlemesi (Birincil 1.0x / İkincil 0.35x)
                        const anat = (typeof getExerciseAnatomy === 'function') ? getExerciseAnatomy(dbEx) : null;
                        const p31 = (anat && Array.isArray(anat.primarySubKeys)) ? anat.primarySubKeys : [];
                        const s31 = (anat && Array.isArray(anat.secondarySubKeys)) ? anat.secondarySubKeys : [];
                        const p31Set = new Set(p31);

                        p31.forEach(pk => {
                            subKey31Sets30d[pk] = (subKey31Sets30d[pk] || 0) + setsCount;
                            if (isWithin7d) subKey31Sets7d[pk] = (subKey31Sets7d[pk] || 0) + setsCount;
                            if (isThisCalendarWeek) thisWeekSubKey31Sets[pk] = (thisWeekSubKey31Sets[pk] || 0) + setsCount;
                            if (fatigueDecay > 0) subKey31Fatigue[pk] = (subKey31Fatigue[pk] || 0) + (setsCount * fatigueDecay);
                            if (isLatestLog && ageHours <= 60 && hadSetDropOff) {
                                subKey31Fatigue[pk] = (subKey31Fatigue[pk] || 0) + 1.4;
                                fatiguedSubKeys48h.add((typeof SUB31_BROAD_LOOKUP === 'object' && SUB31_BROAD_LOOKUP[pk]) || pk);
                            }
                            if (!ex.isInterSetExtra && (toLocalYmdString(dObj) === yesterdayYmd || (ageHours > 0 && ageHours <= 34 && toLocalYmdString(dObj) !== refYmd))) {
                                adjacentPrevDaySubKeys31.add(pk);
                            }
                            if (isLatestLog && !ex.isInterSetExtra) {
                                lastSessionSubKeys31.add(pk);
                                lastSessionSubKey31Sets[pk] = (lastSessionSubKey31Sets[pk] || 0) + setsCount;
                            }
                        });
                        s31.forEach(sk => {
                            if (p31Set.has(sk)) return;
                            const secVal = Math.round(setsCount * 0.35 * 100) / 100;
                            subKey31Sets30d[sk] = (subKey31Sets30d[sk] || 0) + secVal;
                            if (isWithin7d) subKey31Sets7d[sk] = (subKey31Sets7d[sk] || 0) + secVal;
                            if (isThisCalendarWeek) thisWeekSubKey31Sets[sk] = (thisWeekSubKey31Sets[sk] || 0) + secVal;
                            if (fatigueDecay > 0) subKey31Fatigue[sk] = (subKey31Fatigue[sk] || 0) + (secVal * fatigueDecay * 0.65);
                            if (isLatestLog && !ex.isInterSetExtra) {
                                lastSessionSubKey31Sets[sk] = (lastSessionSubKey31Sets[sk] || 0) + secVal;
                            }
                        });

                        // Baldır (Kalf) hacmini genel Bacak toplamının içinde kaybolmaması için ayrıca takip et
                        const hitsCalvesPrimary = rawPrimName === 'Kalf' || p31.some(k => k.startsWith('calves_'));
                        const hitsCalvesSecondary = !hitsCalvesPrimary && s31.some(k => k.startsWith('calves_'));
                        if (hitsCalvesPrimary || hitsCalvesSecondary) {
                            const cVal = hitsCalvesPrimary ? setsCount : Math.round(setsCount * 0.35 * 10) / 10;
                            calvesSets30d += cVal;
                            if (isWithin7d) calvesSets7d += cVal;
                            if (fatigueDecay > 0) calvesSets48h += cVal * (hitsCalvesPrimary ? fatigueDecay : fatigueDecay * 0.6);
                        }

                        const addMuscleVolume = (mKey, val, mFatigueDecay) => {
                            if (!mKey || val <= 0) return;
                            muscleSets30d[mKey] = (muscleSets30d[mKey] || 0) + val;
                            if (isWithin14d) muscleSets14d[mKey] = (muscleSets14d[mKey] || 0) + val;
                            if (isWithin7d)  muscleSets7d[mKey]  = (muscleSets7d[mKey] || 0) + val;
                            if (mFatigueDecay > 0) {
                                muscleSets48h[mKey] = (muscleSets48h[mKey] || 0) + (val * mFatigueDecay);
                            }
                            if (isLatestLog) lastSessionMuscleSets[mKey] = (lastSessionMuscleSets[mKey] || 0) + val;
                            if (isThisCalendarWeek) thisWeekMuscleSets[mKey] = (thisWeekMuscleSets[mKey] || 0) + val;
                        };

                        addMuscleVolume(primName, setsCount, fatigueDecay);

                        // Bileşik hareketlerin ikincil kas katkılarını da hesaba kat
                        if (spec && spec.sec && typeof spec.sec === 'object') {
                            Object.entries(spec.sec).forEach(([secRaw, factor]) => {
                                const secMapped = mapAcademicToContextMuscle(secRaw);
                                if (secMapped && secMapped !== primName) {
                                    const secSets = Math.round(setsCount * (Number(factor) || 0.35) * 10) / 10;
                                    addMuscleVolume(secMapped, secSets, fatigueDecay * 0.65);
                                }
                            });
                        }
                    });
                });
            } catch (e) {}

            // 2. Pop-up üzerinden bildirilen kayıtsız yorgunluk (yalnızca yakın zamanlı ilk seans için geçerli)
            if (includePrecheck) {
                const precheck = window.activePrecheckState || { fatigue: 'none' };
                if (precheck.fatigue === 'legs') {
                    muscleSets48h['Bacak'] = Math.max(muscleSets48h['Bacak'] || 0, 6);
                    ['legs_quad', 'legs_hamstrings', 'legs_glutes', 'legs_calves'].forEach(sk => fatiguedSubKeys48h.add(sk));
                    ['legs_quad_outer', 'legs_quad_inner', 'legs_quad_mid', 'legs_ham_curl', 'legs_ham_hinge', 'legs_ham_chain', 'legs_glutes_max', 'legs_glutes_med', 'legs_glutes_min'].forEach(k31 => {
                        subKey31Fatigue[k31] = Math.max(subKey31Fatigue[k31] || 0, 3);
                    });
                    hadSpinalHinge48h = true;
                } else if (precheck.fatigue === 'upper') {
                    muscleSets48h['Göğüs'] = Math.max(muscleSets48h['Göğüs'] || 0, 6);
                    muscleSets48h['Sırt'] = Math.max(muscleSets48h['Sırt'] || 0, 6);
                    muscleSets48h['Omuz'] = Math.max(muscleSets48h['Omuz'] || 0, 6);
                    ['chest_mid', 'chest_upper', 'back_lats', 'back_mid', 'shoulders_side', 'shoulders_rear', 'shoulders_front'].forEach(sk => fatiguedSubKeys48h.add(sk));
                    ['chest_upper', 'chest_mid', 'chest_lower', 'back_lats', 'back_mid', 'traps', 'shoulders_front', 'shoulders_side', 'shoulders_rear'].forEach(k31 => {
                        subKey31Fatigue[k31] = Math.max(subKey31Fatigue[k31] || 0, 3);
                    });
                } else if (precheck.fatigue === 'back') {
                    muscleSets48h['Sırt'] = Math.max(muscleSets48h['Sırt'] || 0, 6);
                    ['back_lats', 'back_mid'].forEach(sk => fatiguedSubKeys48h.add(sk));
                    ['back_lats', 'back_mid', 'back_lower'].forEach(k31 => {
                        subKey31Fatigue[k31] = Math.max(subKey31Fatigue[k31] || 0, 3);
                    });
                    hadSpinalHinge48h = true;
                }
            }

            // 3. 31 Alt Bölge Eksik & Doygunluk Tespiti (Tüm kas gruplarında son seansta >=3.3 set alan alt başları 60 saat koru)
            if (typeof SUB31_BROAD_LOOKUP === 'object' && SUB31_BROAD_LOOKUP) {
                Object.keys(SUB31_BROAD_LOOKUP).forEach(k31 => {
                    const lastSubSets = lastSessionSubKey31Sets[k31] || 0;
                    if (lastSessionHoursAgo !== null && lastSessionHoursAgo <= 60 && lastSubSets >= 3.3) {
                        subKey31Fatigue[k31] = Math.max(subKey31Fatigue[k31] || 0, 2.2);
                        fatiguedSubKeys48h.add(SUB31_BROAD_LOOKUP[k31] || k31);
                    }
                    const v7 = subKey31Sets7d[k31] || 0;
                    const f48 = subKey31Fatigue[k31] || 0;
                    if (v7 >= 6.5) {
                        saturatedSubKeys31.add(k31);
                    }
                    if (f48 >= 1.8) {
                        fatiguedSubKeys48h.add(SUB31_BROAD_LOOKUP[k31] || k31);
                    } else if (f48 < 1.2 && v7 < 1.5) {
                        deficitSubKeys31.add(k31);
                    }
                });
            }

            // 4. Ana Kas Grupları Yorgunluk, Eksik ve 7 Günlük Doygunluk Freni (max7d)
            const standardMuscleDefs = [
                { name: 'Sırt', focusKey: 'back', subKeys: ['back_lats', 'back_mid'], min7d: 8, max7d: 16, min30d: 20 },
                { name: 'Bacak', focusKey: 'legs', subKeys: ['legs_quad', 'legs_hamstrings', 'legs_glutes'], min7d: 8, max7d: 15, min30d: 20 },
                { name: 'Omuz', focusKey: 'shoulders', subKeys: ['shoulders_side', 'shoulders_rear', 'shoulders_front'], min7d: 6, max7d: 13, min30d: 16 },
                { name: 'Göğüs', focusKey: 'chest', subKeys: ['chest_mid', 'chest_upper'], min7d: 8, max7d: 15, min30d: 20 },
                { name: 'Ön Kol/Biceps', focusKey: 'arms', subKeys: ['biceps'], min7d: 4, max7d: 11, min30d: 12 },
                { name: 'Arka Kol/Triceps', focusKey: 'arms', subKeys: ['triceps_long', 'triceps_lateral'], min7d: 4, max7d: 11, min30d: 12 },
                { name: 'Karın/Core', focusKey: 'core', subKeys: ['core_front', 'core_obliques'], min7d: 4, max7d: 12, min30d: 12 }
            ];

            const fatiguedMuscles48h = [];
            const neglectedMuscles7d = [];
            const neglectedMuscles30d = [];
            const saturatedMuscles7d = [];
            const saturatedFocusKeys = [];
            const deficitFocusKeys = [];

            const scoredDefs = standardMuscleDefs.map(def => {
                const s48 = Math.round((muscleSets48h[def.name] || 0) * 10) / 10;
                const s7  = Math.round((muscleSets7d[def.name] || 0) * 10) / 10;
                const s30 = Math.round((muscleSets30d[def.name] || 0) * 10) / 10;
                const singleSessionOverloadCap = Math.max(5.5, Math.round(def.min7d * 0.9));
                const taxedInLastSession = lastSessionHoursAgo !== null && lastSessionHoursAgo <= 60 && (Number(lastSessionMuscleSets[def.name]) || 0) >= singleSessionOverloadCap;
                const isFatigued = (s48 >= 3.0 && (lastSessionHoursAgo === null || lastSessionHoursAgo < 40 || s48 >= 5.2)) || taxedInLastSession;
                const isSaturated = s7 >= def.max7d;
                if (isFatigued && !fatiguedMuscles48h.includes(def.name)) {
                    fatiguedMuscles48h.push(def.name);
                }
                if (isSaturated) {
                    saturatedMuscles7d.push(`${def.name} (${Math.round(s7)} set)`);
                    if (!saturatedFocusKeys.includes(def.focusKey)) {
                        saturatedFocusKeys.push(def.focusKey);
                    }
                }
                if (!isFatigued) {
                    if (s7 === 0) {
                        neglectedMuscles7d.push(`${def.name} (0 set)`);
                    } else if (s7 < def.min7d) {
                        const dispS7 = Math.round(s7) >= def.min7d ? Math.floor(s7) : Math.round(s7);
                        neglectedMuscles7d.push(`${def.name} (${dispS7} set)`);
                    }
                }
                if (s30 < def.min30d && s7 < def.min7d * 1.15) {
                    neglectedMuscles30d.push(`${def.name} (${Math.round(s30)} set/ay)`);
                }
                const ratio7d = s7 / def.min7d;
                const ratio30d = s30 / def.min30d;
                return Object.assign({}, def, { s48, s7, s30, isFatigued, isSaturated, deficitScore: (ratio7d * 0.65) + (ratio30d * 0.35) });
            }).sort((a, b) => a.deficitScore - b.deficitScore);

            scoredDefs.forEach(item => {
                const needsVolume = item.s7 < item.min7d || (item.s7 < item.min7d * 1.15 && item.s30 < item.min30d);
                if (!item.isFatigued && !item.isSaturated && needsVolume) {
                    if (!deficitFocusKeys.includes(item.focusKey)) {
                        deficitFocusKeys.push(item.focusKey);
                    }
                    item.subKeys.forEach(sk => {
                        if (!fatiguedSubKeys48h.has(sk)) {
                            deficitSubKeys.add(sk);
                        }
                    });
                }
            });

            // 5. Kas İçi Alt Bölge Boşlukları (Örn: Ön/Yan Omuz çalıştı ama Arka Omuz 0 set; Orta Göğüs çalıştı ama Üst Göğüs 0 set; Bacak çok çalıştı ama Baldır 0 set!)
            const rearDelt7d = subKey31Sets7d['shoulders_rear'] || 0;
            const frontSideDelt7d = (subKey31Sets7d['shoulders_front'] || 0) + (subKey31Sets7d['shoulders_side'] || 0);
            if (rearDelt7d < 1.5 && (subKey31Fatigue['shoulders_rear'] || 0) < 1.2) {
                deficitSubKeys.add('shoulders_rear');
                if (frontSideDelt7d >= 3 || totalSessionsLastWeek >= 1) {
                    if (!neglectedMuscles7d.some(x => x.startsWith('Arka Omuz'))) {
                        neglectedMuscles7d.push(`Arka Omuz (${Math.round(rearDelt7d)} set)`);
                    }
                    if (!deficitFocusKeys.includes('rear_delt')) deficitFocusKeys.push('rear_delt');
                }
            }

            const upperChest7d = subKey31Sets7d['chest_upper'] || 0;
            const midChest7d = subKey31Sets7d['chest_mid'] || 0;
            if (upperChest7d < 1.5 && (subKey31Fatigue['chest_upper'] || 0) < 1.2) {
                deficitSubKeys.add('chest_upper');
                if (midChest7d >= 3 && !deficitFocusKeys.includes('upper_chest')) {
                    if (!neglectedMuscles7d.some(x => x.startsWith('Üst Göğüs'))) {
                        neglectedMuscles7d.push(`Üst Göğüs (${Math.round(upperChest7d)} set)`);
                    }
                    deficitFocusKeys.push('upper_chest');
                }
            }

            if (calvesSets7d < 2 && calvesSets48h < 1.5 && totalSessionsLastWeek >= 1) {
                deficitSubKeys.add('legs_calves');
                if (calvesSets7d === 0 && !neglectedMuscles7d.some(x => x.startsWith('Baldır'))) {
                    neglectedMuscles7d.push('Baldır (0 set)');
                }
                if ((saturatedMuscles7d.length > 0 || calvesSets30d < 6) && !deficitFocusKeys.includes('calves')) {
                    deficitFocusKeys.push('calves');
                }
            }

            try {
                const uidForSched = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                if (uidForSched && yesterdayYmd) {
                    const rawSched = localStorage.getItem(`celik_kodu_date_schedule_${uidForSched}`);
                    const dateSched = rawSched ? JSON.parse(rawSched) : null;
                    const yEntry = dateSched && dateSched[yesterdayYmd];
                    if (yEntry && !yEntry.rest) {
                        const yExList = Array.isArray(yEntry.exercises)
                            ? yEntry.exercises
                            : (yEntry.customWorkout && Array.isArray(yEntry.customWorkout.exercises) ? yEntry.customWorkout.exercises : []);
                        yExList.forEach(ex => {
                            const dbEx = resolveDbExercise(ex);
                            const anat = (typeof getExerciseAnatomy === 'function') ? getExerciseAnatomy(dbEx) : null;
                            if (anat && Array.isArray(anat.primarySubKeys)) {
                                anat.primarySubKeys.forEach(pk => adjacentPrevDaySubKeys31.add(pk));
                            }
                        });
                    }
                }
            } catch (e) {}

            return {
                referenceTimeMs: nowMs,
                usedExerciseIds,
                thisWeekExerciseIds,
                recent14dExerciseIds,
                lastSessionExerciseIds,
                lastSessionFamilies,
                lastSessionSubKeys,
                lastSessionSubKeys31,
                adjacentPrevDaySubKeys31,
                lastSessionMuscleSets,
                thisWeekMuscleSets,
                thisWeekSubKey31Sets,
                lastSessionHadSpinalHinge,
                overusedExerciseIds30d,
                subKeyVolume,
                subKey31Sets7d,
                subKey31Sets30d,
                subKey31Fatigue,
                deficitSubKeys31,
                saturatedSubKeys31,
                usedFinishers,
                fatiguedSubKeys48h,
                fatiguedMuscles48h,
                hadSpinalHinge48h,
                lastSessionTitle,
                lastSessionHoursAgo,
                neglectedMuscles7d,
                neglectedMuscles30d,
                saturatedMuscles7d,
                saturatedFocusKeys,
                deficitFocusKeys,
                deficitSubKeys,
                totalSessionsLastWeek,
                totalSessionsMonth
            };
        }
        window.getRecentAndScheduledMuscleContext = getRecentAndScheduledMuscleContext;

        async function parseUserWishWithGemini(userWish) {
            if (!userWish || !userWish.trim()) return null;

            const trimmed = userWish.trim();
            if (window._cachedGeminiWishAnalysis && window._cachedGeminiWishText === trimmed) {
                return window._cachedGeminiWishAnalysis;
            }

            const prompt = `Sen profesyonel bir fitness ve biyomekanik uzmanı yapay zekasın.
Kullanıcının antrenman oluştururken girdiği özel istek ve kısıtlama notunu analiz et.

KULLANICI NOTU:
"${trimmed}"

GÖREVLER:
1. Kullanıcının KESİNLİKLE İSTEMEDİĞİ, yapamadığı, ağrı/sakatlık veya salon uygunsuzluğu (alan darlığı, yürüyüş koridoru olmaması vb.) nedeniyle PROGRAMDAN ÇIKARILMASI GEREKEN egzersiz isimlerini (excludedExerciseNames) ve anahtar kelimelerini (excludedKeywords) çıkar. Hem Türkçe hem İngilizce eşanlamlılarını (ör. pullup, chinup, barfiks, farmer walk, walking lunge, carry vb.) dahil et.
2. Kullanıcının özellikle ODAKLANMAK istediği kas gruplarını (focusMuscles: 'göğüs', 'omuz', 'bacak', 'kol', 'sırt', 'core') tespit et. (DİKKAT: Kullanıcı bir hareketi veya kası İSTEMİYORSA, onu asla focusMuscles listesine EKLEME!).
3. Kullanıcıya hitaben 1-2 cümlelik net, zeki ve profesyonel bir antrenör özeti (summary) yaz.

Aşağıdaki JSON şemasında çıktı ver (kod bloğu içinde):
\`\`\`json
{
  "excludedExerciseNames": ["Barfiks", "Pull-Up", "Chin-Up", "Farmer's Walk", "Walking Lunge"],
  "excludedKeywords": ["barfiks", "pullup", "chinup", "farmer", "walk", "carry", "yürüyüş"],
  "focusMuscles": [],
  "summary": "Barfiks varyasyonları ve yürüyüş mesafesi gerektiren Farmer's Walk türevleri programdan tamamen çıkarıldı."
}
\`\`\``;

            const sysPrompt = "Sen Çelik Kodu fitness platformunun Baş Biyomekanik Mimarı Yapay Zekasısın. Kullanıcı isteklerini derinlemesine anlayıp katı kısıtlamaları belirleyerek sadece JSON döndürürsün.";

            try {
                if (typeof callGeminiAPI !== 'function') return null;
                const responseText = await callGeminiAPI(prompt, sysPrompt, '', 1000);
                if (!responseText) return null;

                let parsed = null;
                const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[1]);
                } else {
                    const rawMatch = responseText.match(/\{[\s\S]*\}/);
                    if (rawMatch) parsed = JSON.parse(rawMatch[0]);
                }

                if (parsed && typeof parsed === 'object') {
                    const result = {
                        excludedExerciseNames: Array.isArray(parsed.excludedExerciseNames) ? parsed.excludedExerciseNames : [],
                        excludedKeywords: Array.isArray(parsed.excludedKeywords) ? parsed.excludedKeywords.map(k => String(k).toLocaleLowerCase('tr-TR').trim()).filter(Boolean) : [],
                        focusMuscles: Array.isArray(parsed.focusMuscles) ? parsed.focusMuscles.map(m => String(m).toLocaleLowerCase('tr-TR').trim()).filter(Boolean) : [],
                        summary: parsed.summary || 'Özel istekleriniz yapay zeka tarafından analiz edilerek programa yansıtıldı.'
                    };
                    window._cachedGeminiWishText = trimmed;
                    window._cachedGeminiWishAnalysis = result;
                    window.lastGeminiWishAnalysis = result;
                    return result;
                }
            } catch (err) {
                console.warn('Gemini istek analizi çağrısında hata oluştu, yerel kurallara geçiliyor:', err);
            }
            return null;
        }
        window.parseUserWishWithGemini = parseUserWishWithGemini;

        function parseUserWishConstraints(wishText, catalog = null, aiAnalysis = null) {
            if (!wishText || !wishText.trim()) {
                return { excludedIds: new Set(), excludedKeywords: [], focusMuscles: [], appliedFilters: [] };
            }

            const trimmed = wishText.trim();
            const activeAi = aiAnalysis || (window.lastGeminiWishAnalysis && window._cachedGeminiWishText === trimmed ? window.lastGeminiWishAnalysis : null);

            const raw = trimmed.toLocaleLowerCase('tr-TR');
            const excludedIds = new Set();
            const excludedKeywords = [];
            const focusMuscles = [];
            const appliedFilters = [];
            const db = Array.isArray(catalog) && catalog.length > 0 ? catalog : (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : []);

            // 0. Doğrudan Gemini AI Analizini Entegre Et
            if (activeAi) {
                if (Array.isArray(activeAi.excludedKeywords)) {
                    activeAi.excludedKeywords.forEach(kw => {
                        const cleanKw = String(kw).toLocaleLowerCase('tr-TR').trim();
                        if (cleanKw && cleanKw.length >= 2) excludedKeywords.push(cleanKw);
                    });
                }
                if (Array.isArray(activeAi.focusMuscles)) {
                    activeAi.focusMuscles.forEach(m => {
                        const cleanM = String(m).toLocaleLowerCase('tr-TR').trim();
                        if (cleanM && !excludedKeywords.includes(cleanM)) focusMuscles.push(cleanM);
                    });
                }
                if (activeAi.summary) {
                    appliedFilters.push(`🤖 AI: ${activeAi.summary}`);
                }
                if (Array.isArray(activeAi.excludedExerciseNames)) {
                    activeAi.excludedExerciseNames.forEach(exName => {
                        const targetNameLow = String(exName).toLocaleLowerCase('tr-TR').trim();
                        if (!targetNameLow || targetNameLow.length < 3) return;
                        db.forEach(ex => {
                            const exNameLow = (ex.name || '').toLocaleLowerCase('tr-TR');
                            const exIdLow = (ex.id || '').toLocaleLowerCase('tr-TR');
                            if (exNameLow.includes(targetNameLow) || targetNameLow.includes(exNameLow) || exIdLow.includes(targetNameLow.replace(/\s+/g, '_'))) {
                                excludedIds.add(ex.id);
                                appliedFilters.push(`"${ex.name}" elendi (AI)`);
                            }
                        });
                    });
                }
            }

            // 1. Negasyon ve Kısıtlama Kalıpları (Yerel Kural Tabanlı Güvenlik Katmanı)
            const negationRegex = /(istemiyorum|yapamıyorum|yapamam|olmasın|önerme|koyma|çıkar|kaldır|sevmiyorum|uygun değil|yasak|ağrıtıyor|zorluyor|çekemiyorum|yapmıyorum|hariç|dışında|yok)/i;
            const painRegex = /(ağrı|sakat|fıtık|hassas|incin|problem|menisküs|zorla)/i;
            const spatialRegex = /(dar|alan yok|yer yok|salon uygun değil|küçük salon|yürüyüş|yürüme|yürümeli|yer dar|yürümeye yer yok|koridor yok)/i;

            const clauses = raw.split(/[,.;\n]|\s+ve\s+|\s+veya\s+|\s+ama\s+|\s+fakat\s+|\s+ayrıca\s+/).map(c => c.trim()).filter(Boolean);

            clauses.forEach(clause => {
                const isNegated = negationRegex.test(clause);
                const hasPain = painRegex.test(clause);
                const hasSpatial = spatialRegex.test(clause);

                // Mekan / Salon Kısıtlaması (Farmer's Walk, Walking Lunge, Carry)
                if (hasSpatial || (isNegated && /farmer|yürüyüş|yürüme|carry|taşıma/.test(clause))) {
                    excludedKeywords.push('farmer', 'farmers_walk', 'walking_lunge', 'carry', 'suitcase_carry', 'yürüyüş', 'yürüme');
                    excludedIds.add('db_farmers_walk');
                    excludedIds.add('db_walking_lunge');
                    excludedIds.add('db_suitcase_carry');
                    appliedFilters.push("Yürüyüş/mesafe hareketleri (Farmer's Walk vb.) elendi");
                }

                // Hareket Bazlı Negasyon / Yapamama Kontrolleri
                if (isNegated || hasPain) {
                    if (/deadlift|rdl|romanian/.test(clause)) {
                        excludedKeywords.push('deadlift', 'rdl');
                        excludedIds.add('bb_deadlift');
                        excludedIds.add('db_rdl');
                        excludedIds.add('db_romanian_deadlift');
                        appliedFilters.push("Deadlift varyasyonları elendi");
                    }
                    if (/farmer|çiftçi/.test(clause)) {
                        excludedKeywords.push('farmer', 'carry');
                        excludedIds.add('db_farmers_walk');
                        appliedFilters.push("Farmer's Walk elendi");
                    }
                    if (/burpee/.test(clause)) {
                        excludedKeywords.push('burpee');
                        excludedIds.add('bw_burpee');
                        appliedFilters.push("Burpee elendi");
                    }
                    if (/şınav|pushup|push up|push-up/.test(clause)) {
                        excludedKeywords.push('pushup', 'push_up', 'şınav');
                        excludedIds.add('bw_pushup');
                        appliedFilters.push("Şınav varyasyonları elendi");
                    }
                    if (/barfiks|pullup|pull up|chinup|chin up/.test(clause)) {
                        excludedKeywords.push('pullup', 'chinup', 'barfiks');
                        excludedIds.add('bw_pullup');
                        excludedIds.add('bw_chinup');
                        excludedIds.add('bw_inverted_row');
                        appliedFilters.push("Barfiks varyasyonları elendi");
                    }
                    if (/overhead|omuz pres|ohp|askeri pres/.test(clause)) {
                        excludedKeywords.push('overhead', 'standing_overhead', 'push_press');
                        excludedIds.add('db_overhead_press');
                        excludedIds.add('db_standing_overhead_press');
                        appliedFilters.push("Baş üstü omuz presleri elendi");
                    }
                    if (/lunge|adım/.test(clause)) {
                        excludedKeywords.push('lunge');
                        excludedIds.add('db_walking_lunge');
                        appliedFilters.push("Lunge varyasyonları elendi");
                    }
                    if (/squat|çömelme/.test(clause)) {
                        excludedKeywords.push('squat');
                        appliedFilters.push("Squat varyasyonları elendi");
                    }
                    if (/dips|dip\b/.test(clause)) {
                        excludedKeywords.push('dips');
                        excludedIds.add('bw_dips');
                        appliedFilters.push("Dips elendi");
                    }
                    if (/swing/.test(clause)) {
                        excludedKeywords.push('swing');
                        excludedIds.add('db_swing');
                        excludedIds.add('kb_swing');
                        appliedFilters.push("Swing elendi");
                    }
                    if (/row|kürek/.test(clause) && /barbell/.test(clause)) {
                        excludedKeywords.push('bb_bent_over_row', 'bb_pendlay_row');
                        excludedIds.add('bb_bent_over_row');
                        excludedIds.add('bb_pendlay_row');
                        appliedFilters.push("Barbell Bent-Over Row elendi");
                    }

                    // Bölgesel ağrı ve sakatlık kuralları
                    if (/bel|omurga|fıtık/.test(clause)) {
                        excludedKeywords.push('deadlift', 'swing', 'snatch', 'good morning', 'bent over', 'clean');
                        appliedFilters.push("Omurga makaslama yükü olan hareketler elendi");
                    }
                    if (/diz|menisküs/.test(clause)) {
                        excludedKeywords.push('jump', 'sıçra', 'pistol', 'thruster', 'burpee');
                        appliedFilters.push("Dize patlayıcı yük bindiren hareketler elendi");
                    }
                    if (/omuz/.test(clause) && hasPain) {
                        excludedKeywords.push('overhead', 'snatch', 'push press', 'thruster', 'upright row');
                        appliedFilters.push("Omuz sıkışması yaratabilecek dikey presler elendi");
                    }

                    // Veritabanındaki özel egzersiz isimlerini dinamik tarama
                    db.forEach(ex => {
                        const nameLow = (ex.name || '').toLocaleLowerCase('tr-TR');
                        const idClean = (ex.id || '').replace(/^(db|bb|bw|kb|mach)_/, '').replace(/_/g, ' ');
                        if (nameLow.length > 5 && clause.includes(nameLow)) {
                            excludedIds.add(ex.id);
                            excludedKeywords.push(ex.id);
                            appliedFilters.push(`"${ex.name}" elendi`);
                        } else if (idClean.length > 5 && clause.includes(idClean)) {
                            excludedIds.add(ex.id);
                            excludedKeywords.push(idClean);
                            appliedFilters.push(`"${ex.name}" elendi`);
                        }
                    });
                }
            });

            // 2. Dışlanan anahtar kelimelerle eşleşen tüm egzersizleri veritabanından excludedIds içine dahil et
            if (excludedKeywords.length > 0) {
                db.forEach(ex => {
                    const nameLow = (ex.name || '').toLocaleLowerCase('tr-TR');
                    const idLow = (ex.id || '').toLocaleLowerCase('tr-TR');
                    const famLow = String(typeof getExerciseMovementFamily === 'function' ? getExerciseMovementFamily(ex) : '').toLocaleLowerCase('tr-TR');
                    if (excludedKeywords.some(kw => kw.length >= 3 && (nameLow.includes(kw) || idLow.includes(kw) || famLow.includes(kw)))) {
                        excludedIds.add(ex.id);
                    }
                });
            }

            // 3. Pozitif Odak Kas Grupları (Kullanıcı istemiyorum dediyse asla ekleme)
            const isExcludedOrNegated = (term) => excludedKeywords.includes(term) || new RegExp(`${term}.*(istemiyorum|ağrı|yapamıyorum|olmasın|önerme)`).test(raw);
            if (!focusMuscles.includes('sırt') && /sırt|kanat|çekiş/.test(raw) && !isExcludedOrNegated('sırt')) focusMuscles.push('sırt');
            if (!focusMuscles.includes('kol') && /kol|biceps|triceps|pazu/.test(raw) && !isExcludedOrNegated('kol')) focusMuscles.push('kol');
            if (!focusMuscles.includes('göğüs') && /göğüs|chest/.test(raw) && !isExcludedOrNegated('göğüs')) focusMuscles.push('göğüs');
            if (!focusMuscles.includes('omuz') && /omuz|deltoid/.test(raw) && !isExcludedOrNegated('omuz')) focusMuscles.push('omuz');
            if (!focusMuscles.includes('bacak') && /bacak|kalça|quad|glute/.test(raw) && !isExcludedOrNegated('bacak')) focusMuscles.push('bacak');
            if (!focusMuscles.includes('core') && /karın|core|abs/.test(raw) && !isExcludedOrNegated('core')) focusMuscles.push('core');

            return {
                excludedIds,
                excludedKeywords: [...new Set(excludedKeywords)],
                focusMuscles: [...new Set(focusMuscles)],
                appliedFilters: [...new Set(appliedFilters)]
            };
        }
        window.parseUserWishConstraints = parseUserWishConstraints;

        function handleGenerateWorkout(doctrineOverride = null, customWish = null, weeklyContext = null) {
            const activeDoctrineKey = doctrineOverride || currentSelectedDoctrine || 'bb_hybrid';
            const activeDoc = AI_DOCTRINES[activeDoctrineKey] || AI_DOCTRINES.bb_hybrid;

            if (customWish === null && !weeklyContext) {
                const unifiedWishEl = document.getElementById('aiUnifiedWishInput');
                const modalWishEl = document.getElementById('aiModalUserWishInput');
                customWish = (unifiedWishEl && unifiedWishEl.value.trim())
                    ? unifiedWishEl.value.trim()
                    : ((modalWishEl && modalWishEl.value.trim())
                        ? modalWishEl.value.trim()
                        : ((currentGeneratedWorkout && currentGeneratedWorkout.customWish) || ''));
            }
            customWish = customWish || '';

            const wishParsed = parseUserWishConstraints(customWish, (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : null), window.lastGeminiWishAnalysis);

            const styleEl = document.getElementById('paramStyle');
            const goalEl = document.getElementById('paramGoal');
            const durEl = document.getElementById('paramDuration');

            const style = (styleEl && styleEl.value) ? styleEl.value : 'superset';
            const goal = (goalEl && goalEl.value) ? goalEl.value : 'hypertrophy';
            const duration = (durEl && parseInt(durEl.value, 10) > 0) ? parseInt(durEl.value, 10) : 45;
            const scheme = getRepAndRestScheme(goal, style);

            const chosenExercises = [];
            const usedIds = [];
            const usedFamilies = new Set();
            const usedMediaIds = new Set();
            const subKeyCounts = {};
            const sessionSubKey31Counts = {};

            // Haftalık kurulumdaysa o günün saatine göre hesaplanmış weeklyContext'i kullan; günlük üretimdeyse 3 katmanlı geçmiş hafızasını baz al
            const activeWeeklyCtx = weeklyContext || getRecentAndScheduledMuscleContext();
            const hasTimeTravel = Boolean(weeklyContext && weeklyContext.hasTimeTravelContext);
            const isFirstOrSingleDay = !weeklyContext || weeklyContext.dayOrderIndex === 0;
            const isConsecutiveDay = Boolean(weeklyContext && weeklyContext.isConsecutiveWithPrevDay);

            // Ardışık günse toparlanmayı gözeterek dinlenme süresini +15 sn dengele
            if (isConsecutiveDay && scheme) {
                scheme.rest = (Number(scheme.rest) || 60) + 15;
                if (scheme.straightRest) scheme.straightRest = Number(scheme.straightRest) + 15;
                if (scheme.supersetRest) scheme.supersetRest = Number(scheme.supersetRest) + 15;
            }

            const weeklyUsedIds = (activeWeeklyCtx && activeWeeklyCtx.usedExerciseIds) ? activeWeeklyCtx.usedExerciseIds : new Set();
            const thisWeekUsedIds = (activeWeeklyCtx && activeWeeklyCtx.thisWeekExerciseIds) ? activeWeeklyCtx.thisWeekExerciseIds : new Set();
            const recent14dIds = (activeWeeklyCtx && activeWeeklyCtx.recent14dExerciseIds) ? activeWeeklyCtx.recent14dExerciseIds : new Set();
            const overusedIds30d = (activeWeeklyCtx && activeWeeklyCtx.overusedExerciseIds30d) ? activeWeeklyCtx.overusedExerciseIds30d : new Set();
            const prevSessionFamilies = hasTimeTravel
                ? new Set([
                    ...(activeWeeklyCtx.lastSessionFamilies || []),
                    ...((weeklyContext && weeklyContext.prevGeneratedDayFamilies) || [])
                ])
                : (isFirstOrSingleDay
                    ? ((activeWeeklyCtx && activeWeeklyCtx.lastSessionFamilies) ? activeWeeklyCtx.lastSessionFamilies : new Set())
                    : ((weeklyContext && weeklyContext.prevGeneratedDayFamilies) ? weeklyContext.prevGeneratedDayFamilies : new Set()));

            const fatiguedSubKeys48h = hasTimeTravel
                ? new Set([
                    ...(activeWeeklyCtx.fatiguedSubKeys48h || []),
                    ...(isConsecutiveDay && weeklyContext && weeklyContext.prevGeneratedDaySubKeys ? weeklyContext.prevGeneratedDaySubKeys : [])
                ])
                : (isFirstOrSingleDay
                    ? ((activeWeeklyCtx && activeWeeklyCtx.fatiguedSubKeys48h && activeWeeklyCtx.fatiguedSubKeys48h.size > 0)
                        ? activeWeeklyCtx.fatiguedSubKeys48h
                        : ((activeWeeklyCtx && activeWeeklyCtx.lastSessionSubKeys) ? activeWeeklyCtx.lastSessionSubKeys : new Set()))
                    : (isConsecutiveDay && weeklyContext && weeklyContext.prevGeneratedDaySubKeys ? weeklyContext.prevGeneratedDaySubKeys : new Set()));
            const deficitSubKeys = (activeWeeklyCtx && activeWeeklyCtx.deficitSubKeys) ? activeWeeklyCtx.deficitSubKeys : new Set();
            const adjacentDayWorkedSubKeys31 = new Set([
                ...((activeWeeklyCtx && activeWeeklyCtx.adjacentPrevDaySubKeys31) ? activeWeeklyCtx.adjacentPrevDaySubKeys31 : []),
                ...((isConsecutiveDay && weeklyContext && weeklyContext.prevGeneratedDaySubKeys31) ? weeklyContext.prevGeneratedDaySubKeys31 : [])
            ]);
            const hasAdjacentDaySubMuscleRule = adjacentDayWorkedSubKeys31.size > 0;
            const weeklySubKeyVolume = (activeWeeklyCtx && activeWeeklyCtx.subKeyVolume) ? activeWeeklyCtx.subKeyVolume : {};
            const weeklySubKey31Sets7d = Object.assign({}, (activeWeeklyCtx && activeWeeklyCtx.subKey31Sets7d) ? activeWeeklyCtx.subKey31Sets7d : {});
            const activeSubKey31Fatigue = (activeWeeklyCtx && activeWeeklyCtx.subKey31Fatigue) ? activeWeeklyCtx.subKey31Fatigue : {};
            const deficitSubKeys31 = (activeWeeklyCtx && activeWeeklyCtx.deficitSubKeys31) ? activeWeeklyCtx.deficitSubKeys31 : new Set();
            const saturatedSubKeys31 = (activeWeeklyCtx && activeWeeklyCtx.saturatedSubKeys31) ? activeWeeklyCtx.saturatedSubKeys31 : new Set();
            const saturatedFocusKeys = (activeWeeklyCtx && Array.isArray(activeWeeklyCtx.saturatedFocusKeys)) ? activeWeeklyCtx.saturatedFocusKeys : [];
            const weeklyUsedFinishers = (activeWeeklyCtx && activeWeeklyCtx.usedFinishers) ? activeWeeklyCtx.usedFinishers : new Set();
            const avoidSpinalHingeToday = hasTimeTravel
                ? Boolean(
                    activeWeeklyCtx.hadSpinalHinge48h ||
                    (isConsecutiveDay && weeklyContext && weeklyContext.prevGeneratedDayHadSpinalHinge)
                )
                : Boolean(
                    (isFirstOrSingleDay && activeWeeklyCtx && (activeWeeklyCtx.hadSpinalHinge48h || activeWeeklyCtx.lastSessionHadSpinalHinge)) ||
                    (weeklyContext && weeklyContext.prevGeneratedDayHadSpinalHinge)
                );

            // Saf Üst Vücut veya Saf Core seçiliyse Bacak+Omuz hibrit komplekslerini (Thruster, Landmine Squat to Press, Man Maker vb.) dışla
            const hasComplexWish = Boolean(customWish && /birleşik|kompleks|akış|flow|chain|zincir|hibrit|kombinasyon/i.test(customWish));
            const isFlowSplit = selectedSplits.includes('flow_complex') || selectedSplit === 'flow_complex';
            const isComplexFlow = style === 'complex' || style === 'flow' || isFlowSplit || hasComplexWish;
            const hasLowerOrFullOrFuncSplit = isComplexFlow || selectedSplits.some(s =>
                s === 'full_body' || s === 'lower' || s === 'iso_legs' || s === 'functional'
            );

            function isCandidateBiochemicallyCompatible(ex, allowLowerUpperComplexInSlot = false) {
                if (!ex || isExerciseExcludedByUser(ex.id)) return false;
                if (!isExerciseEquipmentAvailable(ex)) return false;
                if (usedIds.includes(ex.id)) return false;

                // Kullanıcı Özel Notu / Kısıtlama Filtresi (Kullanıcı yapamıyorum/istemiyorum dediyse ASLA seçme)
                if (wishParsed.excludedIds.has(ex.id)) return false;
                const exNameLow = (ex.name || '').toLocaleLowerCase('tr-TR');
                const exIdLow = (ex.id || '').toLocaleLowerCase('tr-TR');
                const famLow = String(getExerciseMovementFamily(ex) || '').toLocaleLowerCase('tr-TR');
                if (wishParsed.excludedKeywords.some(kw => kw.length >= 2 && (exNameLow.includes(kw) || exIdLow.includes(kw) || famLow.includes(kw)))) {
                    return false;
                }

                const fam = getExerciseMovementFamily(ex);
                if (fam && usedFamilies.has(fam)) return false;

                // Squat-to-Press / Hinge-Squat / RDL-HighPull kompleksleri ile ana bileşenleri aynı seansta çakışmasın
                if (fam === 'squat_or_clean_press_complex' && (usedFamilies.has('vertical_shoulder_press') || usedFamilies.has('bilateral_squat'))) return false;
                if ((fam === 'vertical_shoulder_press' || fam === 'bilateral_squat') && usedFamilies.has('squat_or_clean_press_complex')) return false;
                if (fam === 'swing_goblet_complex' && (usedFamilies.has('bilateral_squat') || usedFamilies.has('ballistic_hip_hinge') || usedFamilies.has('hip_hinge_rdl_deadlift'))) return false;
                if ((fam === 'bilateral_squat' || fam === 'ballistic_hip_hinge' || fam === 'hip_hinge_rdl_deadlift') && usedFamilies.has('swing_goblet_complex')) return false;
                if (fam === 'rdl_high_pull_complex' && (usedFamilies.has('hip_hinge_rdl_deadlift') || usedFamilies.has('row_high_pull_cuban'))) return false;
                if ((fam === 'hip_hinge_rdl_deadlift' || fam === 'row_high_pull_cuban') && usedFamilies.has('rdl_high_pull_complex')) return false;
                if ((fam === 'lunge_curl_press_complex' || fam === 'lunge_knee_drive_complex' || fam === 'lunge_chop_rotational') && usedFamilies.has('unilateral_lunge_split')) return false;
                if (fam === 'unilateral_lunge_split' && (usedFamilies.has('lunge_curl_press_complex') || usedFamilies.has('lunge_knee_drive_complex') || usedFamilies.has('lunge_chop_rotational'))) return false;

                // Aynı OpenGym video/görsel ID'sine sahip hareketler (örn. 1540, 0426, 0538) aynı seansta yan yana gelmesin
                const mediaId = getExerciseMediaId(ex);
                if (mediaId && usedMediaIds.has(mediaId)) return false;

                // AÇI VEKTÖRÜ + %70 KAS ÖRTÜŞME KALKANI:
                // Eğilerek yapılan farklı kas hareketlerini (Arka Omuz, Arka Bacak) kısıtlama;
                // ancak aynı kas grubunu aynı açıyla vuran (%70+ birincil kas örtüşmeli veya çift eğik sırt çekişi) hareketleri engelle!
                if (hasBiomechAngleAndMuscleConflict(ex, chosenExercises)) return false;

                const anat = getExerciseAnatomy(ex);
                if (!isComplexFlow && (!hasLowerOrFullOrFuncSplit || !allowLowerUpperComplexInSlot)) {
                    if (ex.isComplex || (anat && (anat.isComplex || anat.isLowerUpperComplex || anat.isFullBodyMetcon))) return false;
                }
                return true;
            }

            function getCandidatePrimary31SubKeys(ex) {
                if (!ex) return [];
                const anat = getExerciseAnatomy(ex);
                if (anat && Array.isArray(anat.primarySubKeys) && anat.primarySubKeys.length > 0) {
                    return anat.primarySubKeys;
                }
                return getExercisePrimaryMuscleKeys(ex);
            }

            function hasAdjacentDayPrimarySubMuscleOverlap(ex) {
                if (!ex || !hasAdjacentDaySubMuscleRule) return false;
                const p31 = getCandidatePrimary31SubKeys(ex);
                return p31.some(pk => adjacentDayWorkedSubKeys31.has(pk));
            }

            function filterToUnworkedAdjacentSubMuscles(pool, strictEmptyIfBlocked = false) {
                if (!Array.isArray(pool) || pool.length === 0 || !hasAdjacentDaySubMuscleRule) return pool;
                const zeroOverlap = pool.filter(ex => !hasAdjacentDayPrimarySubMuscleOverlap(ex));
                if (zeroOverlap.length > 0) {
                    const strictlyZero7d = zeroOverlap.filter(ex => {
                        const p31 = getCandidatePrimary31SubKeys(ex);
                        return p31.length > 0 && p31.some(pk => (weeklySubKey31Sets7d[pk] || 0) === 0 && !sessionSubKey31Counts[pk]);
                    });
                    return strictlyZero7d.length > 0 ? strictlyZero7d : zeroOverlap;
                }
                return strictEmptyIfBlocked ? [] : pool;
            }

            function scoreCandidateBy31SubMuscles(ex) {
                if (!ex) return 999;
                const anat = getExerciseAnatomy(ex);
                const p31 = (anat && Array.isArray(anat.primarySubKeys) && anat.primarySubKeys.length > 0)
                    ? anat.primarySubKeys
                    : getExercisePrimaryMuscleKeys(ex);
                const s31 = (anat && Array.isArray(anat.secondarySubKeys)) ? anat.secondarySubKeys : [];
                const candSpec = (typeof resolveExerciseBiomechanics === 'function')
                    ? resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category, ex.id)
                    : null;
                const isCandLengthened = Boolean(candSpec && candSpec.lengthened);
                let totalScore = 0;

                const evalSubKey31 = (k31, roleWeight, denom) => {
                    const sessCnt = sessionSubKey31Counts[k31] || 0;
                    const wkSets = weeklySubKey31Sets7d[k31] || 0;
                    const fatSets = activeSubKey31Fatigue[k31] || 0;
                    const broad = (typeof SUB31_BROAD_LOOKUP === 'object' && SUB31_BROAD_LOOKUP && SUB31_BROAD_LOOKUP[k31]) || k31;
                    const isBroadFatigued = fatiguedSubKeys48h.has(broad);
                    const isAdjacentWorked = hasAdjacentDaySubMuscleRule && adjacentDayWorkedSubKeys31.has(k31);
                    const is31Fatigued = isAdjacentWorked || fatSets >= 1.2 || isBroadFatigued;
                    const is31Saturated = saturatedSubKeys31.has(k31) || wkSets >= 6.5;
                    const is31Deficit = (deficitSubKeys31.has(k31) || deficitSubKeys.has(broad) || wkSets === 0) && !is31Fatigued;

                    let kScore = (sessCnt * 10) + (wkSets * 1.6) + ((subKeyCounts[broad] || 0) * 5);
                    if (isAdjacentWorked && roleWeight >= 1.0) {
                        kScore += 120;
                    }
                    if (fatSets > 0) {
                        kScore += Math.min(34, fatSets * 10);
                        if (isCandLengthened && roleWeight >= 1.0 && fatSets >= 0.85) {
                            kScore += 8;
                        }
                    } else if (isBroadFatigued) {
                        kScore += 18;
                    }
                    if (is31Saturated) kScore += 12;
                    if (is31Deficit) kScore -= (wkSets === 0 && sessCnt === 0 ? 18 : (wkSets === 0 ? 12 : 7));

                    totalScore += (kScore * roleWeight) / Math.max(1, denom);
                };

                p31.forEach(k => evalSubKey31(k, 1.0, p31.length));
                s31.forEach(k => evalSubKey31(k, 0.30, s31.length));
                return Math.round(totalScore * 100) / 100;
            }

            function recordChosenExercise(chosen) {
                if (!chosen) return false;
                const clone = Object.assign({}, chosen);
                usedIds.push(clone.id);
                weeklyUsedIds.add(clone.id);
                thisWeekUsedIds.add(clone.id);
                const fam = getExerciseMovementFamily(clone);
                if (fam) usedFamilies.add(fam);
                const mediaId = getExerciseMediaId(clone);
                if (mediaId) usedMediaIds.add(mediaId);
                const pBroad = new Set(getExercisePrimaryMuscleKeys(clone));
                const coveredKeys = getExerciseCoveredSubKeys(clone);
                coveredKeys.forEach(sk => {
                    const isPrim = pBroad.size === 0 || pBroad.has(sk);
                    const delta = isPrim ? 1 : 0.35;
                    subKeyCounts[sk] = (subKeyCounts[sk] || 0) + delta;
                    weeklySubKeyVolume[sk] = (weeklySubKeyVolume[sk] || 0) + delta;
                });
                const anat = getExerciseAnatomy(clone);
                const estSets = Number(scheme && scheme.sets) || 3;
                if (anat && Array.isArray(anat.primarySubKeys)) {
                    anat.primarySubKeys.forEach(pk => {
                        sessionSubKey31Counts[pk] = (sessionSubKey31Counts[pk] || 0) + 1;
                        weeklySubKey31Sets7d[pk] = (weeklySubKey31Sets7d[pk] || 0) + estSets;
                    });
                }
                if (anat && Array.isArray(anat.secondarySubKeys)) {
                    anat.secondarySubKeys.forEach(sk => {
                        sessionSubKey31Counts[sk] = (sessionSubKey31Counts[sk] || 0) + 0.35;
                        weeklySubKey31Sets7d[sk] = (weeklySubKey31Sets7d[sk] || 0) + Math.round(estSets * 0.35 * 10) / 10;
                    });
                }
                chosenExercises.push(clone);
                return true;
            }

            function applyDoctrineModeFilter(pool, filterMode) {
                if (!Array.isArray(pool) || pool.length === 0) return [];
                let base = pool;
                if (avoidSpinalHingeToday && typeof isSpinalAxialLoadedExercise === 'function' && base.length > 1) {
                    const spineSafe = base.filter(e => !isSpinalAxialLoadedExercise(e));
                    if (spineSafe.length > 0) base = spineSafe;
                }
                if (filterMode === 'functional') {
                    const funcPool = base.filter(e => isExerciseFunctionalCategory(e));
                    if (funcPool.length > 0) return funcPool;
                } else if (filterMode === 'bb_isolation') {
                    const isoPool = base.filter(e => !isExerciseFunctionalCategory(e) && (e.mechanic === 'isolation' || e.category === 'core'));
                    if (isoPool.length > 0) return isoPool;
                } else if (filterMode === 'bb_compound') {
                    const compPool = base.filter(e => !isExerciseFunctionalCategory(e) && e.mechanic === 'compound');
                    if (compPool.length > 0) {
                        const loadedComp = compPool.filter(e => e.equipment !== 'bodyweight' || e.id === 'bw_pullup' || e.id === 'bw_chinup' || e.id === 'bw_dips' || (avoidSpinalHingeToday && e.id === 'bw_glute_bridge'));
                        return loadedComp.length > 0 ? loadedComp : compPool;
                    }
                } else if (filterMode === 'bb_only') {
                    const bbPool = base.filter(e => !isExerciseFunctionalCategory(e));
                    if (bbPool.length > 0) return bbPool;
                }
                return base;
            }

            // Bu hafta tamamlanan veya önceki günlerde seçilen hareketleri KESİN olarak eler,
            // ayrıca bir önceki seansta kullanılan hareket ailesini (örn. RDL -> Tek Bacak RDL) üst üste seçmekten kaçınır.
            function preferWeeklyFreshExercises(pool) {
                if (!Array.isArray(pool) || pool.length <= 1) return pool;
                let working = pool;

                // 1. ÖNCE BU HAFTA YAPILAN (örn. 9 Kasım) VE BU PLANIN ÖNCEKİ GÜNLERİNDE SEÇİLEN HAREKETLERİ KESİN FİLTRELE
                const notDoneThisWeek = working.filter(e => !thisWeekUsedIds.has(e.id) && !weeklyUsedIds.has(e.id));
                if (notDoneThisWeek.length > 0) {
                    working = notDoneThisWeek;
                } else {
                    const notInStrictThisWeek = working.filter(e => !thisWeekUsedIds.has(e.id));
                    if (notInStrictThisWeek.length > 0) working = notInStrictThisWeek;
                }

                // 2. Bir önceki seansta (veya 9 Kasım antrenmanında) kullanılan hareket ailesini (örn. hip_hinge_rdl_deadlift) üst üste tekrar etme
                if (prevSessionFamilies && prevSessionFamilies.size > 0 && working.length > 1) {
                    const diffFamilyPool = working.filter(e => !prevSessionFamilies.has(getExerciseMovementFamily(e)));
                    if (diffFamilyPool.length > 0) working = diffFamilyPool;
                }

                // 3. Eğer son 48 saatte veya önceki günde ağır omurga yükü (Deadlift/Barbell Row/RDL) yapıldıysa bugün göğüs destekli / omurga dostu olanları tercih et
                if (avoidSpinalHingeToday && typeof isSpinalAxialLoadedExercise === 'function' && working.length > 1) {
                    const spineSafe = working.filter(e => !isSpinalAxialLoadedExercise(e));
                    if (spineSafe.length > 0) working = spineSafe;
                }

                // 4. Son 14 gün ve son 30 gün aşırı tekrar koruması (esnek tercih)
                if (working.length > 1) {
                    const fresh14d = working.filter(e => !recent14dIds.has(e.id));
                    const baseFresh = fresh14d.length > 0 ? fresh14d : working;
                    const notOverusedInMonth = baseFresh.filter(e => !overusedIds30d.has(e.id) && !overusedIds30d.has(e.name));
                    return notOverusedInMonth.length > 0 ? notOverusedInMonth : baseFresh;
                }
                return working;
            }

            // KATMAN 2: Önce Anatomik Alt Kas Grubu (subKey) -> Sonra Haftalık Eksik Açı & Doktrin Modu -> Sonra Günler Arası Taze Hareket Seçici
            function addSlotEx(slotSpec) {
                const cat = slotSpec.cat || 'push';
                const filterMode = slotSpec.mode || 'any';
                const allowComplex = Boolean(slotSpec.allowComplex);
                const strictIso = Boolean(slotSpec.strictIso);
                const preferredSubKeys = Array.isArray(slotSpec.subKeys) ? slotSpec.subKeys : (slotSpec.subKeys ? [slotSpec.subKeys] : []);

                // EĞER BİRLEŞİK AKIŞ / KOMPLEKS MODU AKTİFSE (100% Multi-Joint Kompleks ve Akış):
                if (isComplexFlow) {
                    let complexPool = EXERCISES_DB.filter(ex =>
                        (ex.isComplex || (ex.tags && (ex.tags.includes('complex') || ex.tags.includes('flow')))) &&
                        isCandidateBiochemicallyCompatible(ex, true)
                    );

                    // 1. Kategori uyumu
                    const catFiltered = complexPool.filter(ex => {
                        const effCat = getEffectiveExerciseCategory(ex);
                        return Array.isArray(cat) ? cat.includes(effCat) : (cat === 'any' || effCat === cat);
                    });
                    if (catFiltered.length > 0) complexPool = catFiltered;

                    // 2. Alt kas / kinetik hat uyumu
                    if (preferredSubKeys.length > 0) {
                        const subMatches = complexPool.filter(ex => {
                            const covered = getExerciseCoveredSubKeys(ex);
                            return covered.some(k => preferredSubKeys.includes(k));
                        });
                        if (subMatches.length > 0) complexPool = subMatches;
                    }

                    // 3. Ardışık gün çalışmayan alt kas filtresi + haftalık gün tazeliği
                    const freshPool = preferWeeklyFreshExercises(filterToUnworkedAdjacentSubMuscles(complexPool, false));
                    let chosen = pickRandom(freshPool);

                    // Fallback: Seans içi tekilliği koruyan herhangi bir taze kompleksten seç
                    if (!chosen) {
                        const anyFreshComplex = preferWeeklyFreshExercises(
                            filterToUnworkedAdjacentSubMuscles(
                                EXERCISES_DB.filter(ex =>
                                    (ex.isComplex || (ex.tags && (ex.tags.includes('complex') || ex.tags.includes('flow')))) &&
                                    isCandidateBiochemicallyCompatible(ex, true)
                                ),
                                false
                            )
                        );
                        chosen = pickRandom(anyFreshComplex);
                    }
                    if (chosen) {
                        recordChosenExercise(chosen);
                    }
                    return;
                }

                // KURAL 1: Aday havuzu KESİN OLARAK hem ID hem Biyomekanik Aile hem Medya açısından seansta benzersiz olmak zorundadır!
                const basePool = filterExercises(cat, usedIds).filter(e => isCandidateBiochemicallyCompatible(e, allowComplex));

                let finalPool = [];
                if (preferredSubKeys.length > 0) {
                    // Önce bugünkü seansta 0 set almış ve son seansta yorulmamış (fatiguedSubKeys48h dışı) alt başları, onların içinde de haftalık hacmi en düşük olanları seç!
                    const untouchedToday = preferredSubKeys.filter(sk => !subKeyCounts[sk]);
                    const rawCandidateSubKeys = untouchedToday.length > 0 ? untouchedToday : preferredSubKeys;
                    const nonFatiguedCandidates = rawCandidateSubKeys.filter(sk => !fatiguedSubKeys48h.has(sk));
                    const candidateSubKeys = nonFatiguedCandidates.length > 0 ? nonFatiguedCandidates : rawCandidateSubKeys;

                    let minWeeklyVol = Infinity;
                    candidateSubKeys.forEach(sk => {
                        const wVol = weeklySubKeyVolume[sk] || 0;
                        if (wVol < minWeeklyVol) minWeeklyVol = wVol;
                    });
                    const lowestWeeklySubKeys = candidateSubKeys.filter(sk => (weeklySubKeyVolume[sk] || 0) === minWeeklyVol);
                    const targetKeys = lowestWeeklySubKeys.length > 0 ? lowestWeeklySubKeys : candidateSubKeys;

                    const isPureTrapOrCarryOnBackSlot = (ex) => {
                        const anat = getExerciseAnatomy(ex);
                        // Evrensel Çapraz-Kas Yorgunluk Koruması: Bu slotta istenmeyen ama akut yorgun olan başka bir ana/alt kası birincil vuran hibrit hareketleri ele
                        if (anat && Array.isArray(anat.primarySubKeys) && anat.primarySubKeys.length > 1) {
                            const hitsUnrequestedFatiguedMuscle = anat.primarySubKeys.some(pk => {
                                const broad = (typeof SUB31_BROAD_LOOKUP === 'object' && SUB31_BROAD_LOOKUP && SUB31_BROAD_LOOKUP[pk]) || pk;
                                return !preferredSubKeys.includes(broad) && !preferredSubKeys.includes(pk) && fatiguedSubKeys48h.has(broad);
                            });
                            if (hitsUnrequestedFatiguedMuscle) return true;
                        }
                        if (preferredSubKeys.includes('traps')) return false;
                        const wantsLatOrMidBack = preferredSubKeys.includes('back_lats') || preferredSubKeys.includes('back_mid');
                        if (!wantsLatOrMidBack) return false;
                        if (ex.id === 'db_dumbbell_shrug_burnout' || ex.id === 'db_farmers_walk') return true;
                        if (anat && anat.subKey === 'traps') return true;
                        if (anat && Array.isArray(anat.primarySubKeys) && anat.primarySubKeys.length > 0 && anat.primarySubKeys.every(k => k === 'traps')) return true;
                        return false;
                    };
                    const matchesPrimaryFor = (keys) => (ex) => {
                        if (isPureTrapOrCarryOnBackSlot(ex)) return false;
                        if (strictIso) {
                            const fam = getExerciseMovementFamily(ex);
                            if (fam === 'plank_or_hinge_renegade_row' || fam === 'ballistic_hip_hinge') return false;
                            if (selectedSplit === 'iso_shoulders' && getExerciseAngleVector(ex) === 'pull_hinge_unsupported_back') return false;
                        }
                        const anat = getExerciseAnatomy(ex);
                        if (!anat) return false;
                        if (keys.includes(anat.subKey)) return true;
                        if (Array.isArray(anat.primarySubKeys)) {
                            return anat.primarySubKeys.some(pk => keys.includes(pk) || (SUB31_BROAD_LOOKUP[pk] && keys.includes(SUB31_BROAD_LOOKUP[pk])));
                        }
                        return false;
                    };
                    const matchesPrimaryMuscleKeysFor = (keys) => (ex) => {
                        if (isPureTrapOrCarryOnBackSlot(ex)) return false;
                        if (strictIso) {
                            if (getEffectiveExerciseCategory(ex) === 'conditioning') return false;
                            const fam = getExerciseMovementFamily(ex);
                            if (fam === 'ballistic_hip_hinge' || fam === 'plank_or_hinge_renegade_row' || fam === 'gorilla_clean_complex' || fam === 'rdl_high_pull_complex') return false;
                            if (selectedSplit === 'iso_shoulders' && getExerciseAngleVector(ex) === 'pull_hinge_unsupported_back') return false;
                        }
                        const pList = getExercisePrimaryMuscleKeys(ex);
                        return keys.some(k => pList.includes(k));
                    };
                    const matchesAnyCoveredFor = (keys) => (ex) => {
                        if (isPureTrapOrCarryOnBackSlot(ex)) return false;
                        if (strictIso && getEffectiveExerciseCategory(ex) === 'conditioning') return false;
                        const allKeys = getExerciseCoveredSubKeys(ex);
                        return allKeys.some(k => keys.includes(k));
                    };

                    // ADIM 1: Önce bu hafta yapılmamış taze havuzda (freshBasePool) en az çalışmış hedef alt kası (targetKeys) ve candidateSubKeys'i ara
                    const freshBasePool = basePool.filter(e => !thisWeekUsedIds.has(e.id) && !weeklyUsedIds.has(e.id));
                    const findSubMatchesIn = (poolToSearch) => {
                        let m = poolToSearch.filter(matchesPrimaryFor(targetKeys));
                        if (m.length === 0) m = poolToSearch.filter(matchesPrimaryFor(candidateSubKeys));
                        if (m.length === 0) m = poolToSearch.filter(matchesPrimaryMuscleKeysFor(targetKeys));
                        if (m.length === 0) m = poolToSearch.filter(matchesPrimaryMuscleKeysFor(candidateSubKeys));
                        if (m.length === 0 && !strictIso) m = poolToSearch.filter(matchesAnyCoveredFor(targetKeys));
                        if (m.length === 0 && !strictIso) m = poolToSearch.filter(matchesAnyCoveredFor(candidateSubKeys));
                        return m;
                    };

                    let subKeyMatches = freshBasePool.length > 0 ? findSubMatchesIn(freshBasePool) : [];
                    if (subKeyMatches.length === 0) {
                        subKeyMatches = findSubMatchesIn(basePool);
                    }
                    if (subKeyMatches.length === 0) {
                        // Tüm EXERCISES_DB içinde seçili ekipmanlarla bu subKey'i birincil olarak vuran ve ikiz olmayan hareketi ara
                        subKeyMatches = EXERCISES_DB.filter(ex =>
                            isCandidateBiochemicallyCompatible(ex, allowComplex) &&
                            (matchesPrimaryFor(candidateSubKeys)(ex) || matchesPrimaryMuscleKeysFor(candidateSubKeys)(ex) || (!strictIso && matchesAnyCoveredFor(candidateSubKeys)(ex)))
                        );
                    }
                    if (subKeyMatches.length === 0 && strictIso) {
                        // İzole kas modunda ekipman havuzu dar olsa bile ikiz hareket ailesini ve açı çakışmasını ASLA aynı seansa alma!
                        subKeyMatches = EXERCISES_DB.filter(ex =>
                            !isExerciseExcludedByUser(ex.id) &&
                            isExerciseEquipmentAvailable(ex) &&
                            !usedIds.includes(ex.id) &&
                            !usedFamilies.has(getExerciseMovementFamily(ex)) &&
                            !hasBiomechAngleAndMuscleConflict(ex, chosenExercises) &&
                            (Array.isArray(cat) ? cat.includes(getEffectiveExerciseCategory(ex)) : getEffectiveExerciseCategory(ex) === cat) &&
                            (matchesPrimaryFor(preferredSubKeys)(ex) || matchesPrimaryMuscleKeysFor(preferredSubKeys)(ex))
                        );
                    }

                    // ADIM 2: Bulunan alt kas adaylarının İÇİNDE doktrin modunu (functional / bb_compound / bb_isolation) uygula
                    subKeyMatches = applyDoctrineModeFilter(subKeyMatches, filterMode);

                    // ADIM 3: Haftanın önceki günlerinde kullanılmamış (A/B/C rotasyonuna uygun) hareketleri tercih et
                    subKeyMatches = preferWeeklyFreshExercises(subKeyMatches);

                    // ADIM 3.2 (ARDIŞIK GÜN DOĞRUDAN ÇALIŞMAYAN ALT KAS KURALI — A3):
                    // Dün birincil olarak çalışmış 31 alt kas bölmesini atla; aynı kategoride veya uyumlu havuzda doğrudan çalışmayan alt kasa geç!
                    if (hasAdjacentDaySubMuscleRule) {
                        subKeyMatches = filterToUnworkedAdjacentSubMuscles(subKeyMatches, true);
                        if (subKeyMatches.length === 0) {
                            subKeyMatches = filterToUnworkedAdjacentSubMuscles(
                                preferWeeklyFreshExercises(applyDoctrineModeFilter(basePool, filterMode)),
                                true
                            );
                        }
                        if (subKeyMatches.length === 0 && !strictIso) {
                            subKeyMatches = filterToUnworkedAdjacentSubMuscles(
                                preferWeeklyFreshExercises(
                                    EXERCISES_DB.filter(ex => isCandidateBiochemicallyCompatible(ex, hasLowerOrFullOrFuncSplit))
                                ),
                                true
                            );
                        }
                    }

                    // ADIM 3.5 (SİNERJİST / SEKONDER ODAK): Kullanıcı özel bir odak belirttiyse (örn. "sırt ve kol ağırlıklı"),
                    // diğer bölgelerin (Bacak, Kalça, İtiş, Core) hareketlerini seçerken istenen kası SEKONDER olarak da çalıştıran bileşik hareketleri (örn. Front/Goblet Squat, RDL/Deadlift, Dips/Şınav, Farmer's Walk) önceliklendir!
                    if (customWish && customWish.trim() && subKeyMatches.length > 1) {
                        const wLow = customWish.toLocaleLowerCase('tr-TR');
                        const getSynergyTags = (ex) => {
                            const anat = getExerciseAnatomy(ex);
                            const secText = `${anat.secondary || ''} ${(ex.secondaryMuscles || []).join(' ')} ${ex.cue || ''} ${ex.name || ''}`.toLocaleLowerCase('tr-TR');
                            const idStr = String(ex.id || '');
                            const tags = [];
                            if (/sırt|kanat|row|çekiş|lat|trapez/.test(wLow)) {
                                const hitsBackSec = /sırt|kanat|trapez|rhomboid|arka omuz|alt bel|torasik/.test(secText) ||
                                    /front_squat|goblet_squat|zercher_squat|deadlift|rdl|swing|clean|snatch|farmers_walk|suitcase_carry|renegade|pull_through/.test(idStr);
                                if (hitsBackSec) tags.push('Sırt');
                            }
                            if (/kol|biceps|triceps|pazu|arka kol|ön kol/.test(wLow)) {
                                const hitsArmSec = /triceps|biceps|ön kol|kavrama|kol/.test(secText) ||
                                    /pushup|bench|incline_press|floor_press|dips|overhead_press|arnold_press|push_press|thruster|clean|row|pullup|chinup|pulldown|farmers_walk|suitcase_carry|deadlift|rdl|swing|goblet_squat|front_squat|hanging/.test(idStr);
                                if (hitsArmSec) tags.push('Kol');
                            }
                            if (/omuz|deltoid/.test(wLow)) {
                                if (/omuz|deltoid|trapez/.test(secText)) tags.push('Omuz');
                            }
                            if (/göğüs|chest|şınav|bench/.test(wLow)) {
                                if (/göğüs|pectoral/.test(secText)) tags.push('Göğüs');
                            }
                            if (/karın|core|abs|plank/.test(wLow)) {
                                if (/core|karın|oblik/.test(secText)) tags.push('Core');
                            }
                            return tags;
                        };
                        const withSynergy = subKeyMatches.filter(ex => getSynergyTags(ex).length > 0);
                        if (withSynergy.length > 0) {
                            subKeyMatches = withSynergy;
                        }
                    }

                    // ADIM 4: 31 Alt Kas Bölmesi Puanlaması (Akut yorgunluktan ve 7 günlük doygunluktan kaçın, 0 set / eksik alt kasları önceliklendir!)
                    if (subKeyMatches.length > 1) {
                        let minOverlapScore = Infinity;
                        const scored = subKeyMatches.map(ex => {
                            const overlapScore = scoreCandidateBy31SubMuscles(ex);
                            if (overlapScore < minOverlapScore) minOverlapScore = overlapScore;
                            return { ex, overlapScore };
                        });
                        const freshest = scored.filter(item => item.overlapScore <= minOverlapScore + 2.5).map(item => item.ex);
                        if (freshest.length > 0) subKeyMatches = freshest;
                    }

                    finalPool = subKeyMatches;
                } else {
                    finalPool = filterToUnworkedAdjacentSubMuscles(
                        preferWeeklyFreshExercises(applyDoctrineModeFilter(basePool, filterMode)),
                        false
                    );
                }

                if (isComplexFlow && Array.isArray(finalPool)) {
                    const complexPreferred = finalPool.filter(e => e.isComplex || (e.tags && (e.tags.includes('complex') || e.tags.includes('flow'))));
                    if (complexPreferred.length > 0) finalPool = complexPreferred;
                }

                let chosen = pickRandom(finalPool);
                if (!chosen && !strictIso) {
                    const modeBase = filterToUnworkedAdjacentSubMuscles(
                        preferWeeklyFreshExercises(applyDoctrineModeFilter(basePool, filterMode)),
                        false
                    );
                    chosen = pickRandom(modeBase);
                }
                if (!chosen) {
                    let relatedCat = cat;
                    if (cat === 'push') relatedCat = ['push', 'core'];
                    else if (cat === 'pull') relatedCat = ['pull', 'core'];
                    else if (cat === 'legs_quad' || cat === 'legs_hinge') relatedCat = ['legs_quad', 'legs_hinge', 'core'];

                    const fallbackPool = filterToUnworkedAdjacentSubMuscles(
                        preferWeeklyFreshExercises(EXERCISES_DB.filter(ex => {
                            if (!isCandidateBiochemicallyCompatible(ex, allowComplex)) return false;
                            const effCat = getEffectiveExerciseCategory(ex);
                            return Array.isArray(relatedCat) ? relatedCat.includes(effCat) : effCat === relatedCat;
                        })),
                        false
                    );
                    chosen = pickRandom(fallbackPool);
                }
                if (!chosen) {
                    // Son çare: yine de ASLA aynı hareket ailesinden (ikiz) veya aynı medyadan olmayan, en az çakışan hareketi seç
                    const nonTwinAnyCatPool = filterToUnworkedAdjacentSubMuscles(
                        preferWeeklyFreshExercises(
                            EXERCISES_DB.filter(ex => isCandidateBiochemicallyCompatible(ex, hasLowerOrFullOrFuncSplit))
                        ),
                        false
                    );
                    chosen = pickRandom(nonTwinAnyCatPool);
                }
                if (chosen) {
                    recordChosenExercise(chosen);
                }
            }

            // ==================== ANATOMİK ALT BÖLGE SLOT ŞABLONLARI (ANATOMICAL SLOT BLUEPRINTS) ====================
            function getAnatomicalSlotsForSplit(splitKey, doctrineKey) {
                const isPureBb = doctrineKey === 'bb_pure';
                const isFuncDom = doctrineKey === 'func_hybrid' || doctrineKey === 'func_pure';
                const isBalanced = doctrineKey === 'balanced_hybrid';

                if (isComplexFlow) {
                    // AKADEMİK BİRLEŞİK AKIŞ & KOMPLEKS MOTORU (Javorek, McGill & Myers Ekolü)
                    return [
                        { subKeys: ['shoulders_front', 'legs_quad'], cat: ['push', 'legs_quad', 'conditioning'], mode: 'any', allowComplex: true },
                        { subKeys: ['legs_quad', 'legs_glutes'], cat: 'legs_quad', mode: 'any', allowComplex: true },
                        { subKeys: ['legs_hamstrings', 'back_mid'], cat: ['pull', 'legs_hinge'], mode: 'any', allowComplex: true },
                        { subKeys: ['back_lats', 'shoulders_rear', 'core_front'], cat: ['pull', 'core'], mode: 'any', allowComplex: true },
                        { subKeys: ['legs_quad', 'legs_hamstrings'], cat: ['legs_quad', 'legs_hinge', 'conditioning'], mode: 'any', allowComplex: true }
                    ];
                }

                if (splitKey === 'iso_chest') {
                    // İZOLE GÖĞÜS: Orta Göğüs + Üst Göğüs + Göğüs Açış (Fly) + Alt Göğüs Dips + Pec Deck + Dar İtiş / Triceps Sinerjisti
                    return [
                        { subKeys: ['chest_mid'], cat: 'push', mode: 'bb_compound', strictIso: true },
                        { subKeys: ['chest_upper'], cat: 'push', mode: 'bb_compound', strictIso: true },
                        { subKeys: ['chest_mid', 'chest_upper'], cat: 'push', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['chest_lower', 'chest_mid'], cat: 'push', mode: 'any', strictIso: true },
                        { subKeys: ['chest_mid', 'chest_upper'], cat: 'push', mode: 'any', strictIso: true },
                        { subKeys: ['triceps_lateral'], cat: 'push', mode: 'bb_compound', strictIso: true },
                        { subKeys: ['triceps_long', 'triceps_lateral'], cat: 'push', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['core_front', 'core_obliques'], cat: 'core', mode: 'any', strictIso: true }
                    ];
                } else if (splitKey === 'iso_back') {
                    // İZOLE SIRT & KANAT: Kanat Genişlik + Orta Sırt Kalınlık + Arka Omuz + Pullover + Trapez + Çekiş Sinerjistleri (8 Farklı Açı!)
                    return [
                        { subKeys: ['back_lats'], cat: 'pull', mode: 'bb_compound', strictIso: true },
                        { subKeys: ['back_mid'], cat: 'pull', mode: isFuncDom ? 'functional' : 'bb_compound', strictIso: true },
                        { subKeys: ['shoulders_rear'], cat: 'pull', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['back_lats', 'back_mid'], cat: 'pull', mode: 'any', strictIso: true },
                        { subKeys: ['traps', 'back_mid'], cat: 'pull', mode: 'any', strictIso: true },
                        { subKeys: ['shoulders_rear', 'back_mid'], cat: 'pull', mode: 'any', strictIso: true },
                        { subKeys: ['biceps'], cat: 'pull', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['core_obliques', 'core_front'], cat: 'core', mode: 'any', strictIso: true }
                    ];
                } else if (splitKey === 'iso_shoulders') {
                    // İZOLE OMUZ (3D DELTOİD & OMUZ KAVŞAĞI): Ön Omuz Pres + Yan Omuz Açış + Arka Omuz + Ön Kaldırış + Cuban/Face Pull + Trapez/Halo
                    return [
                        { subKeys: ['shoulders_front'], cat: 'push', mode: 'bb_compound', strictIso: true },
                        { subKeys: ['shoulders_side'], cat: 'push', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['shoulders_rear'], cat: 'pull', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['shoulders_front', 'shoulders_side'], cat: 'push', mode: 'any', strictIso: true },
                        { subKeys: ['shoulders_rear'], cat: 'pull', mode: 'any', strictIso: true },
                        { subKeys: ['traps', 'shoulders_side'], cat: ['pull', 'core'], mode: 'any', strictIso: true },
                        { subKeys: ['shoulders_side', 'shoulders_rear'], cat: ['core', 'pull'], mode: 'any', strictIso: true },
                        { subKeys: ['core_obliques', 'core_front'], cat: 'core', mode: 'any', strictIso: true }
                    ];
                } else if (splitKey === 'iso_arms') {
                    // İZOLE KOL (BICEPS & TRICEPS ANTAGONİST): Biceps + Triceps Uzun Baş + Hammer/Brachialis + Triceps Yan Baş
                    return [
                        { subKeys: ['biceps'], cat: 'pull', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['triceps_long'], cat: 'push', mode: 'bb_isolation', strictIso: true },
                        { subKeys: ['biceps'], cat: 'pull', mode: 'any', strictIso: true },
                        { subKeys: ['triceps_lateral'], cat: 'push', mode: 'any', strictIso: true },
                        { subKeys: ['biceps'], cat: 'pull', mode: 'any', strictIso: true },
                        { subKeys: ['triceps_long', 'triceps_lateral'], cat: 'push', mode: 'any', strictIso: true },
                        { subKeys: ['biceps'], cat: 'pull', mode: 'any', strictIso: true },
                        { subKeys: ['triceps_lateral', 'triceps_long'], cat: 'push', mode: 'any', strictIso: true }
                    ];
                } else if (splitKey === 'iso_legs' || splitKey === 'lower') {
                    // ALT VÜCUT / İZOLE BACAK: Ön Bacak (Quad) + Arka Bacak (Hamstring) + Kalça (Glute) + Kalf
                    return [
                        { subKeys: ['legs_quad'], cat: 'legs_quad', mode: 'bb_compound' },                                 // Slot 1 (Düz 1): Ana Squat / Leg Press
                        { subKeys: ['legs_hamstrings'], cat: 'legs_hinge', mode: isPureBb ? 'bb_isolation' : 'any' },      // Slot 2 (A1): Hamstring Curl / RDL
                        { subKeys: ['legs_calves', 'legs_glutes'], cat: ['legs_quad', 'legs_hinge'], mode: 'any' },        // Slot 3 (A2): Kalf veya Glute Bridge
                        { subKeys: ['legs_hamstrings', 'legs_glutes'], cat: 'legs_hinge', mode: isFuncDom ? 'functional' : 'bb_compound' }, // Slot 4 (Düz 2): RDL / Deadlift / Hip Thrust
                        { subKeys: ['legs_quad'], cat: 'legs_quad', mode: isFuncDom ? 'functional' : 'any' },              // Slot 5 (B1): Unilateral Lunge / Split Squat / Extension
                        { subKeys: ['legs_glutes', 'legs_quad'], cat: ['legs_hinge', 'legs_quad'], mode: 'any' },          // Slot 6 (B2): Kalça / Bacak Tamamlayıcı
                        { subKeys: ['legs_calves', 'legs_glutes'], cat: ['legs_hinge', 'legs_quad'], mode: 'any' },        // Slot 7 (60dk): Kalça / Kalf Tamamlayıcı
                        { subKeys: ['legs_hamstrings', 'core_front'], cat: ['legs_hinge', 'core'], mode: isPureBb ? 'bb_isolation' : 'functional' } // Slot 8 (60dk)
                    ];
                } else if (splitKey === 'iso_core' || splitKey === 'core') {
                    // İZOLE KARIN & CORE: Ön Karın + Oblik Rotasyon + Anti-Rotasyon Taşıma + Alt Karın
                    return [
                        { subKeys: ['core_front'], cat: 'core', mode: 'any', strictIso: true },
                        { subKeys: ['core_obliques'], cat: 'core', mode: isPureBb ? 'any' : 'functional', strictIso: true },
                        { subKeys: ['core_front'], cat: 'core', mode: 'any', strictIso: true },
                        { subKeys: ['core_obliques'], cat: 'core', mode: 'functional', strictIso: true },
                        { subKeys: ['core_front'], cat: 'core', mode: 'any', strictIso: true },
                        { subKeys: ['core_obliques'], cat: 'core', mode: 'any', strictIso: true },
                        { subKeys: ['core_front'], cat: 'core', mode: 'any', strictIso: true },
                        { subKeys: ['core_obliques'], cat: 'core', mode: 'any', strictIso: true }
                    ];
                } else if (splitKey === 'upper_push') {
                    // İTİŞ: Orta Göğüs + Yan Omuz + Üst Göğüs + Ön Omuz + Triceps Uzun Baş + Core + Alt Göğüs + Triceps Yan Baş
                    // Not: Saf İtiş gününde Squat-to-Press (Thruster / Landmine Squat to Press) YASAKTIR; saf üst vücut omuz/göğüs hareketleri seçilir.
                    return [
                        { subKeys: ['chest_mid'], cat: 'push', mode: isFuncDom ? 'functional' : 'bb_compound' },           // Slot 1 (Düz 1): Ana Orta Göğüs Pres
                        { subKeys: ['shoulders_side'], cat: 'push', mode: 'bb_isolation' },                                // Slot 2 (A1): Yan Omuz İzolasyon
                        { subKeys: ['chest_upper'], cat: 'push', mode: 'bb_compound' },                                    // Slot 3 (A2): Üst Göğüs Incline Pres
                        { subKeys: ['shoulders_front'], cat: 'push', mode: (isPureBb ? 'bb_compound' : (isFuncDom || isBalanced ? 'functional' : 'bb_compound')) }, // Slot 4 (Düz 2): Dikey Omuz Pres / Push Press
                        { subKeys: ['triceps_long'], cat: 'push', mode: 'bb_isolation' },                                  // Slot 5 (B1): Triceps Uzun Baş (Overhead / Skullcrusher)
                        { subKeys: ['core_front', 'core_obliques'], cat: 'core', mode: isPureBb ? 'any' : 'functional' },  // Slot 6 (B2): Core / Anti-Rotasyon
                        { subKeys: ['chest_lower', 'chest_mid'], cat: 'push', mode: 'any' },                               // Slot 7 (60dk): Alt Göğüs / Dips / Fly
                        { subKeys: ['triceps_lateral'], cat: 'push', mode: 'any' }                                         // Slot 8 (60dk): Triceps Yan Baş (Pushdown / Close-Grip / Diamond)
                    ];
                } else if (splitKey === 'upper_pull') {
                    // ÇEKİŞ: Kanat (Lats) + Arka Omuz + Biceps + Orta Sırt (Kalınlık) + Biceps/Brachialis + Oblik/Hinge
                    return [
                        { subKeys: ['back_lats'], cat: 'pull', mode: 'bb_compound' },                                      // Slot 1 (Düz 1): Kanat Genişlik (Pulldown/Pullup/Saw Row)
                        { subKeys: ['shoulders_rear'], cat: 'pull', mode: 'bb_isolation' },                                // Slot 2 (A1): Arka Omuz & Postür (Face Pull / Halo)
                        { subKeys: ['biceps'], cat: 'pull', mode: 'bb_isolation' },                                        // Slot 3 (A2): Biceps Ana Curl
                        { subKeys: ['back_mid'], cat: 'pull', mode: isFuncDom ? 'functional' : 'bb_compound' },            // Slot 4 (Düz 2): Orta Sırt Kalınlık Row
                        { subKeys: ['biceps'], cat: 'pull', mode: 'bb_isolation' },                                        // Slot 5 (B1): Biceps Farklı Açı (Hammer / Incline)
                        { subKeys: ['core_obliques', 'core_front'], cat: 'core', mode: isPureBb ? 'any' : 'functional' },  // Slot 6 (B2): Oblik Taşıma / Anti-Rotasyon
                        { subKeys: ['back_lats', 'back_mid'], cat: 'pull', mode: 'any' },                                  // Slot 7 (60dk): Pullover / İkincil Sırt
                        { subKeys: ['core_front', 'core_obliques'], cat: 'core', mode: isPureBb ? 'any' : 'functional' }   // Slot 8 (60dk): Ön Karın Zırhı
                    ];
                } else if (splitKey === 'upper') {
                    // ÜST VÜCUT: Göğüs + Kanat + Omuz (Yan/Arka/Ön eksik başa göre) + Orta Sırt + Triceps + Biceps + Arka Omuz/Üst Göğüs + Core
                    const shouldersTaxedInUpper = fatiguedSubKeys48h.has('shoulders_front') ||
                        fatiguedSubKeys48h.has('shoulders_side') ||
                        Boolean(activeWeeklyCtx && activeWeeklyCtx.lastSessionMuscleSets && Number(activeWeeklyCtx.lastSessionMuscleSets['Omuz']) >= 6 && (activeWeeklyCtx.lastSessionHoursAgo === null || activeWeeklyCtx.lastSessionHoursAgo <= 60));
                    return [
                        { subKeys: ['chest_upper', 'chest_mid'], cat: 'push', mode: 'bb_compound' },                       // Slot 1 (Düz 1): Ana Göğüs Pres (Üst/Orta)
                        { subKeys: ['back_lats'], cat: 'pull', mode: 'bb_compound' },                                      // Slot 2 (A1): Kanat Çekiş
                        shouldersTaxedInUpper
                            ? { subKeys: ['shoulders_rear'], cat: 'pull', mode: 'bb_isolation' }                           // Slot 3 (A2): Omuz yorgunsa yalnızca Arka Omuz / Postür
                            : { subKeys: ['shoulders_side', 'shoulders_rear', 'shoulders_front'], cat: ['push', 'pull'], mode: 'any' }, // Slot 3 (A2): En Taze / Eksik Omuz Başı
                        { subKeys: ['back_mid'], cat: 'pull', mode: (isFuncDom && !avoidSpinalHingeToday) ? 'functional' : 'bb_compound' }, // Slot 4 (Düz 2): Orta Sırt Row
                        { subKeys: ['biceps'], cat: 'pull', mode: 'bb_isolation' },                                        // Slot 5 (B1): Biceps (Antagonist Kol 1)
                        { subKeys: ['triceps_long', 'triceps_lateral'], cat: 'push', mode: 'bb_isolation' },               // Slot 6 (B2): Triceps (Antagonist Kol 2)
                        { subKeys: ['chest_mid', 'chest_upper'], cat: 'push', mode: 'any' },                               // Slot 7 (60dk): İkincil Göğüs Açısı
                        { subKeys: ['core_front', 'core_obliques'], cat: 'core', mode: isPureBb ? 'any' : 'functional' }   // Slot 8 (60dk): Core
                    ];
                } else if (splitKey === 'functional') {
                    // FONKSİYONEL FITNESS & KONDİSYON (Her slotta farklı bir biyomekanik vektör!)
                    return [
                        { subKeys: ['shoulders_front', 'legs_quad'], cat: ['conditioning', 'push', 'legs_quad'], mode: 'functional', allowComplex: true }, // Slot 1: Squat-to-Press / Overhead Kompleks
                        { subKeys: ['legs_hamstrings', 'legs_glutes'], cat: ['legs_hinge', 'conditioning'], mode: 'functional', allowComplex: true },      // Slot 2: Balistik Hinge (Swing / Clean / Snatch)
                        { subKeys: ['back_mid', 'back_lats'], cat: 'pull', mode: 'functional', allowComplex: true },                                       // Slot 3: Fonksiyonel Çekiş (Gorilla / Renegade / Inverted Row)
                        { subKeys: ['core_obliques'], cat: 'core', mode: 'functional', allowComplex: true },                                               // Slot 4: Yük Taşıma / Anti-Rotasyon (Carry / Chop / Windmill)
                        { subKeys: ['legs_quad'], cat: 'legs_quad', mode: 'functional', allowComplex: true },                                              // Slot 5: Unilateral Bacak / Goblet / Zercher Squat
                        { subKeys: ['chest_mid', 'triceps_lateral'], cat: ['push', 'conditioning'], mode: 'functional', allowComplex: true },              // Slot 6: Yatay İtiş / Man Maker / Burpee
                        { subKeys: ['core_front'], cat: 'core', mode: 'functional', allowComplex: true },                                                  // Slot 7 (60dk): Ön Core (Plank / Bear Crawl / Hanging Raise)
                        { subKeys: ['shoulders_rear'], cat: 'pull', mode: 'functional', allowComplex: true }                                               // Slot 8 (60dk): Omuz Mobilite & Arka Zincir (Halo / Face Pull)
                    ];
                } else {
                    // FULL BODY (TÜM VÜCUT):
                    // Slot 1 (Düz 1): Ön Bacak Squat
                    // Slot 2+3 (Süperset A1+A2): Göğüs İtiş + Sırt Çekiş (Agonist-Antagonist Eşleşme!)
                    // Slot 4 (Düz 2): Arka Zincir RDL / Deadlift / Swing / Leg Curl / Glute Bridge
                    // Slot 5+6 (Süperset B1+B2): Omuz yorgunsa Eksik Kol (Biceps) + Arka Omuz/Core; taze ise Omuz + Core
                    // Slot 7+8 (60dk): Kol (Biceps/Triceps) + Arka Omuz/Kalf
                    const shouldersTaxedInFull = fatiguedSubKeys48h.has('shoulders_front') ||
                        fatiguedSubKeys48h.has('shoulders_side') ||
                        Boolean(activeWeeklyCtx && activeWeeklyCtx.lastSessionMuscleSets && Number(activeWeeklyCtx.lastSessionMuscleSets['Omuz']) >= 6 && (activeWeeklyCtx.lastSessionHoursAgo === null || activeWeeklyCtx.lastSessionHoursAgo <= 60));
                    return [
                        { subKeys: ['legs_quad'], cat: 'legs_quad', mode: isFuncDom ? 'functional' : 'bb_compound', allowComplex: false },
                        { subKeys: ['chest_upper', 'chest_mid'], cat: 'push', mode: isFuncDom ? 'functional' : 'bb_compound', allowComplex: false },
                        { subKeys: ['back_lats', 'back_mid'], cat: 'pull', mode: (isFuncDom && !avoidSpinalHingeToday) ? 'functional' : 'bb_compound', allowComplex: false },
                        { subKeys: ['legs_glutes', 'legs_hamstrings'], cat: 'legs_hinge', mode: avoidSpinalHingeToday ? 'any' : (isPureBb ? 'bb_compound' : (isFuncDom || isBalanced ? 'functional' : 'bb_compound')), allowComplex: false },
                        shouldersTaxedInFull
                            ? { subKeys: ['biceps', 'triceps_long'], cat: ['pull', 'push'], mode: 'bb_isolation', allowComplex: false }
                            : { subKeys: ['shoulders_side', 'shoulders_front', 'shoulders_rear'], cat: isFuncDom ? ['push', 'pull', 'conditioning'] : ['push', 'pull'], mode: (isPureBb ? 'bb_isolation' : (isFuncDom ? 'functional' : 'any')), allowComplex: isFuncDom },
                        shouldersTaxedInFull
                            ? { subKeys: ['shoulders_rear', 'core_front', 'core_obliques'], cat: ['pull', 'core'], mode: 'any', allowComplex: false }
                            : { subKeys: ['core_front', 'core_obliques'], cat: 'core', mode: isPureBb ? 'any' : 'functional', allowComplex: false },
                        { subKeys: ['biceps', 'triceps_long', 'triceps_lateral'], cat: ['pull', 'push'], mode: 'bb_isolation', allowComplex: false },
                        { subKeys: ['shoulders_rear', 'legs_calves'], cat: ['pull', 'legs_quad'], mode: isPureBb ? 'bb_isolation' : 'any', allowComplex: false }
                    ];
                }
            }

            const targetCount = isComplexFlow ? (duration >= 25 ? 5 : 4) : (duration >= 60 ? 8 : (duration >= 45 ? 6 : 4));

            if (selectedSplits.length > 1) {
                // ÇOKLU BÖLGE SEÇİMİ: Seçilen bölgelerin anatomik slot şablonlarından sırayla (Round-Robin) çek
                const splitBlueprints = selectedSplits.map(sk => getAnatomicalSlotsForSplit(sk, activeDoctrineKey));
                let roundIndex = 0;
                while (chosenExercises.length < targetCount && roundIndex < 8) {
                    for (let sIdx = 0; sIdx < splitBlueprints.length && chosenExercises.length < targetCount; sIdx++) {
                        const bp = splitBlueprints[sIdx];
                        const slotSpec = bp[roundIndex % bp.length];
                        addSlotEx(slotSpec);
                    }
                    roundIndex++;
                }
            } else {
                const effectiveSplit = selectedSplits[0] || 'full_body';
                let blueprint = getAnatomicalSlotsForSplit(effectiveSplit, activeDoctrineKey).map(s => Object.assign({}, s));

                // Yorgun bölge zorunlu kutu kilidini kır: Yalnızca son 38 saatte ağır bacak yapılmışsa veya kullanıcı açıkça bacak yorgunluğu seçtiyse kutuyu değiştir
                const precheckNow = window.activePrecheckState || { fatigue: 'none' };
                const legsAcute38h = Array.isArray(activeWeeklyCtx.fatiguedMuscles48h) &&
                    activeWeeklyCtx.fatiguedMuscles48h.includes('Bacak') &&
                    (activeWeeklyCtx.lastSessionHoursAgo !== null && activeWeeklyCtx.lastSessionHoursAgo < 38);
                const legsFatiguedToday = hasTimeTravel
                    ? legsAcute38h
                    : (isFirstOrSingleDay && (precheckNow.fatigue === 'legs' || legsAcute38h));
                const upperFatiguedToday = hasTimeTravel
                    ? (Array.isArray(activeWeeklyCtx.fatiguedMuscles48h) && activeWeeklyCtx.fatiguedMuscles48h.includes('Göğüs') && activeWeeklyCtx.fatiguedMuscles48h.includes('Sırt') && !legsFatiguedToday)
                    : (isFirstOrSingleDay && precheckNow.fatigue === 'upper');

                if (legsFatiguedToday && (effectiveSplit === 'full_body' || effectiveSplit === 'functional')) {
                    blueprint = blueprint.map(slot => {
                        const isLegSlot = slot.cat === 'legs_quad' || slot.cat === 'legs_hinge' || (Array.isArray(slot.subKeys) && slot.subKeys.some(sk => sk.startsWith('legs_')));
                        if (isLegSlot) {
                            return { subKeys: ['chest_upper', 'chest_mid', 'back_lats', 'biceps'], cat: ['push', 'pull'], mode: 'any', allowComplex: false };
                        }
                        return slot;
                    });
                } else if (upperFatiguedToday && (effectiveSplit === 'full_body' || effectiveSplit === 'functional')) {
                    blueprint = blueprint.map(slot => {
                        const isUpperSlot = slot.cat === 'push' || slot.cat === 'pull';
                        if (isUpperSlot) {
                            return { subKeys: ['legs_quad', 'legs_hamstrings', 'legs_glutes', 'core_front'], cat: ['legs_quad', 'legs_hinge', 'core'], mode: 'any', allowComplex: false };
                        }
                        return slot;
                    });
                }

                for (let i = 0; i < targetCount && i < blueprint.length; i++) {
                    addSlotEx(blueprint[i]);
                }
            }

            // Özel İstek + Geçmiş Haftalık/Aylık Eksik Bölge Telafisi & Eklem Hassasiyeti Uyarlaması
            const wishLower = (customWish || '').toLocaleLowerCase('tr-TR');
            const hasWorkoutHistory = (typeof getWorkoutLogs === 'function') && getWorkoutLogs().length > 0;
            const autoDeficitKeys = (hasWorkoutHistory && activeWeeklyCtx && Array.isArray(activeWeeklyCtx.deficitFocusKeys))
                ? activeWeeklyCtx.deficitFocusKeys.slice(0, 2)
                : [];
            if ((customWish && customWish.trim()) || autoDeficitKeys.length > 0) {
                const hasPainWord = /ağrı|hassas|sakat|zorla|incin|problem|fıtık/.test(wishLower);

                // 1. Eklem hassasiyeti varsa zorlayıcı hareketleri güvenli ve ikiz olmayan alternatiflerle filtrele
                if (hasPainWord) {
                    for (let idx = chosenExercises.length - 1; idx >= 0; idx--) {
                        const ex = chosenExercises[idx];
                        const nameCue = `${ex.name || ''} ${ex.muscle || ''} ${ex.cue || ''}`.toLocaleLowerCase('tr-TR');
                        const kneeStress = /diz/.test(wishLower) && /jump|sıçra|pistol|snatch|thruster|derin squat|burpee/.test(nameCue);
                        const backStress = /bel|fıtık|omurga/.test(wishLower) && /deadlift|swing|snatch|clean|good morning|bent over/.test(nameCue);
                        const shoulderStress = /omuz/.test(wishLower) && /overhead|snatch|strict press|push press|thruster|handstand/.test(nameCue);
                        if (kneeStress || backStress || shoulderStress) {
                            const safeReplacement = filterToUnworkedAdjacentSubMuscles(
                                EXERCISES_DB.filter(c =>
                                    isCandidateBiochemicallyCompatible(c, hasLowerOrFullOrFuncSplit) &&
                                    getEffectiveExerciseCategory(c) === getEffectiveExerciseCategory(ex) &&
                                    !/jump|snatch|thruster|burpee|deadlift/.test((c.name || '').toLocaleLowerCase('tr-TR'))
                                ),
                                false
                            )[0];
                            if (safeReplacement) {
                                const repClone = Object.assign({}, safeReplacement);
                                usedIds.push(repClone.id);
                                usedFamilies.add(getExerciseMovementFamily(repClone));
                                const mId = getExerciseMediaId(repClone);
                                if (mId) usedMediaIds.add(mId);
                                chosenExercises[idx] = repClone;
                            }
                        }
                    }
                }

                // 2. Zayıf bölge / özel kas odaklarını ve geçmiş haftalarda eksik kalan kasları seans bölgesiyle uyumlu şekilde önceliklendir
                const currentSplitPrimary = selectedSplits[0] || 'full_body';
                const isUpperCompatibleSplit = ['full_body', 'upper', 'upper_push', 'upper_pull', 'functional'].includes(currentSplitPrimary);
                const isLowerCompatibleSplit = ['full_body', 'lower', 'functional'].includes(currentSplitPrimary);
                const shouldersTaxedForFocus = fatiguedSubKeys48h.has('shoulders_front') ||
                    fatiguedSubKeys48h.has('shoulders_side') ||
                    Boolean(activeWeeklyCtx && activeWeeklyCtx.lastSessionMuscleSets && Number(activeWeeklyCtx.lastSessionMuscleSets['Omuz']) >= 6 && (activeWeeklyCtx.lastSessionHoursAgo === null || activeWeeklyCtx.lastSessionHoursAgo <= 60));

                const focusMatchers = [
                    { key: 'back', label: 'Sırt', isGranular: false, allow: isUpperCompatibleSplit && currentSplitPrimary !== 'upper_push', targetMin: currentSplitPrimary === 'upper' ? 2 : 1, regex: /(?:^|\s)(?:sırt|kanat|kürek|çekiş|lat|latissimus)(?:$|\s|[.,])/i, testEx: e => { const pk = getExercisePrimaryMuscleKeys(e); if (avoidSpinalHingeToday && typeof isSpinalAxialLoadedExercise === 'function' && isSpinalAxialLoadedExercise(e)) return false; return (pk.includes('back_lats') || pk.includes('back_mid')) && !pk.includes('traps') && e.id !== 'db_dumbbell_shrug_burnout' && e.id !== 'db_farmers_walk' && !e.isComplex; } },
                    { key: 'arms', label: 'Kol', isGranular: true, allow: isUpperCompatibleSplit, targetMin: currentSplitPrimary === 'upper' ? 2 : 1, regex: /(?:^|\s)(?:kol|biceps|triceps|pazu|arka kol)(?:$|\s|[.,])/i, testEx: e => { const pk = getExercisePrimaryMuscleKeys(e); return (pk.includes('biceps') || pk.includes('triceps_long') || pk.includes('triceps_lateral')) && e.mechanic === 'isolation'; } },
                    { key: 'rear_delt', label: 'Arka Omuz', isGranular: true, allow: isUpperCompatibleSplit && currentSplitPrimary !== 'upper_push', targetMin: 1, regex: /arka omuz|rear delt|face pull/i, testEx: e => getExercisePrimaryMuscleKeys(e).includes('shoulders_rear') },
                    { key: 'upper_chest', label: 'Üst Göğüs', isGranular: true, allow: isUpperCompatibleSplit && currentSplitPrimary !== 'upper_pull', targetMin: 1, regex: /üst göğüs|incline/i, testEx: e => getExercisePrimaryMuscleKeys(e).includes('chest_upper') },
                    { key: 'calves', label: 'Baldır', isGranular: true, allow: isLowerCompatibleSplit, targetMin: 1, regex: /kalf|baldır|calf/i, testEx: e => getExercisePrimaryMuscleKeys(e).includes('legs_calves') },
                    { key: 'shoulders', label: 'Omuz', isGranular: false, allow: isUpperCompatibleSplit && currentSplitPrimary !== 'upper_pull' && (!shouldersTaxedForFocus || Boolean(wishLower)), targetMin: 1, regex: /(?:^|\s)(?:omuz|deltoid|trapez)(?:$|\s|[.,])/i, testEx: e => { const pk = getExercisePrimaryMuscleKeys(e); return pk.includes('shoulders_front') || pk.includes('shoulders_side') || pk.includes('shoulders_rear'); } },
                    { key: 'chest', label: 'Göğüs', isGranular: false, allow: isUpperCompatibleSplit && currentSplitPrimary !== 'upper_pull', targetMin: 1, regex: /(?:^|\s)(?:göğüs|chest|pectoral)(?:$|\s|[.,])/i, testEx: e => { const pk = getExercisePrimaryMuscleKeys(e); return pk.includes('chest_mid') || pk.includes('chest_upper') || pk.includes('chest_lower'); } },
                    { key: 'legs', label: 'Bacak', isGranular: false, allow: isLowerCompatibleSplit, targetMin: currentSplitPrimary === 'lower' ? 3 : 2, regex: /(?:^|\s)(?:bacak|kalça|glute|hamstring|quad)(?:$|\s|[.,])/i, testEx: e => { const pk = getExercisePrimaryMuscleKeys(e); return pk.includes('legs_quad') || pk.includes('legs_hamstrings') || pk.includes('legs_glutes'); } },
                    { key: 'core', label: 'Core', isGranular: true, allow: true, targetMin: 1, regex: /(?:^|\s)(?:karın|core|abs)(?:$|\s|[.,])/i, testEx: e => { const pk = getExercisePrimaryMuscleKeys(e); return pk.includes('core_front') || pk.includes('core_obliques'); } }
                ];

                const activeFocusMatchers = focusMatchers.filter(fm => {
                    if (!fm.allow) return false;
                    if (wishParsed.excludedKeywords.some(kw => kw.length >= 3 && (fm.key.includes(kw) || kw.includes(fm.key)))) return false;
                    const isAiFocus = Array.isArray(wishParsed.focusMuscles) && wishParsed.focusMuscles.some(m => fm.key.includes(m) || m.includes(fm.key));
                    const isRegexFocus = Boolean(wishLower) && fm.regex.test(wishLower);
                    const isAutoDeficit = !wishLower && autoDeficitKeys.includes(fm.key);
                    if (isAiFocus || isRegexFocus) {
                        fm.targetMin = Math.max(fm.targetMin, 2);
                    } else if (isAutoDeficit && !fm.isGranular) {
                        const isTopDeficit = autoDeficitKeys[0] === fm.key;
                        if (currentSplitPrimary !== 'full_body' && (saturatedFocusKeys.length > 0 || duration >= 60)) {
                            fm.targetMin = isTopDeficit ? Math.max(fm.targetMin, 2) : Math.max(fm.targetMin, 1);
                        }
                    }
                    return isAiFocus || isRegexFocus || isAutoDeficit;
                });
                const isAnyFocusMatch = (ex) => activeFocusMatchers.some(fm => fm.testEx(ex));

                const mapExToFocusDomain = (ex) => {
                    const pk = getExercisePrimaryMuscleKeys(ex);
                    if (pk.includes('legs_quad')) return 'legs_quad';
                    if (pk.some(k => k === 'legs_hamstrings' || k === 'legs_glutes')) return 'legs_posterior';
                    if (pk.some(k => k.startsWith('chest_'))) return 'chest';
                    if (pk.some(k => k.startsWith('back_'))) return 'back';
                    if (pk.some(k => k.startsWith('shoulders_'))) return 'shoulders';
                    if (pk.some(k => k === 'biceps' || k.startsWith('triceps_'))) return 'arms';
                    if (pk.some(k => k.startsWith('core_'))) return 'core';
                    if (pk.includes('legs_calves')) return 'calves';
                    return 'other';
                };

                activeFocusMatchers.forEach(fm => {
                    let existingMatches = chosenExercises.filter(fm.testEx);
                    if (!wishLower && autoDeficitKeys.includes(fm.key)) {
                        existingMatches.forEach(em => {
                            if (!em.synergyBadge) em.synergyBadge = 'Eksik Telafisi';
                        });
                    }
                    while (existingMatches.length < fm.targetMin) {
                        const rawCandidates = filterToUnworkedAdjacentSubMuscles(
                            preferWeeklyFreshExercises(EXERCISES_DB.filter(e =>
                                isCandidateBiochemicallyCompatible(e, hasLowerOrFullOrFuncSplit) &&
                                fm.testEx(e)
                            )),
                            Boolean(hasAdjacentDaySubMuscleRule && !wishLower)
                        );
                        let bestCandidates = rawCandidates;
                        if (rawCandidates.length > 1) {
                            let minCScore = Infinity;
                            const cScored = rawCandidates.map(e => {
                                const sc = scoreCandidateBy31SubMuscles(e);
                                if (sc < minCScore) minCScore = sc;
                                return { e, sc };
                            });
                            const topTier = cScored.filter(x => x.sc <= minCScore + 2.5).map(x => x.e);
                            if (topTier.length > 0) bestCandidates = topTier;
                        }
                        const picked = pickRandom(bestCandidates);
                        if (!picked) break;

                        const pickedClone = Object.assign({}, picked, {
                            isWishFocus: Boolean(wishLower),
                            synergyBadge: !wishLower ? 'Eksik Telafisi' : undefined
                        });
                        usedIds.push(pickedClone.id);
                        weeklyUsedIds.add(pickedClone.id);
                        thisWeekUsedIds.add(pickedClone.id);
                        const fam = getExerciseMovementFamily(pickedClone);
                        if (fam) usedFamilies.add(fam);
                        const mId = getExerciseMediaId(pickedClone);
                        if (mId) usedMediaIds.add(mId);

                        const domainCounts = {};
                        chosenExercises.forEach(ce => {
                            const dom = mapExToFocusDomain(ce);
                            domainCounts[dom] = (domainCounts[dom] || 0) + 1;
                        });

                        let replaceIdx = -1;
                        // 1. Öncelik (7 Günlük Doygunluk Freni): Geçen hafta aşırı çalışmış (saturatedFocusKeys) kasın ikincil slotunu eksik kasa devret!
                        for (let r = chosenExercises.length - 1; r >= 0; r--) {
                            const dom = mapExToFocusDomain(chosenExercises[r]);
                            const satDomKey = (dom === 'legs_quad' || dom === 'legs_posterior') ? 'legs' : dom;
                            if (!isAnyFocusMatch(chosenExercises[r]) && saturatedFocusKeys.includes(satDomKey) && (domainCounts[dom] >= 2 || currentSplitPrimary !== 'full_body')) {
                                replaceIdx = r;
                                break;
                            }
                        }
                        // 2. Öncelik: Aynı seansta 2+ kez yer alan odak dışı kas grubunun son slotunu devret (tekil ana Göğüs/Sırt/Bacak omurgasını bozma!)
                        if (replaceIdx === -1) {
                            for (let r = chosenExercises.length - 1; r >= 0; r--) {
                                const dom = mapExToFocusDomain(chosenExercises[r]);
                                if (!isAnyFocusMatch(chosenExercises[r]) && (domainCounts[dom] >= 2 || dom === 'core')) {
                                    replaceIdx = r;
                                    break;
                                }
                            }
                        }
                        // 3. Yedek: Odak dışı son uygun slot (Full Body ve Üst Vücut'ta tekil ana kas sütunlarını koru!)
                        if (replaceIdx === -1) {
                            for (let r = chosenExercises.length - 1; r >= 0; r--) {
                                const dom = mapExToFocusDomain(chosenExercises[r]);
                                if (['full_body', 'upper'].includes(currentSplitPrimary) && ['legs_quad', 'legs_posterior', 'chest', 'back'].includes(dom) && (domainCounts[dom] || 0) <= 1) {
                                    continue;
                                }
                                if (!isAnyFocusMatch(chosenExercises[r])) {
                                    replaceIdx = r;
                                    break;
                                }
                            }
                        }
                        if (replaceIdx > -1 && chosenExercises.length >= targetCount) {
                            chosenExercises[replaceIdx] = pickedClone;
                        } else if (chosenExercises.length < targetCount) {
                            chosenExercises.push(pickedClone);
                        } else {
                            break;
                        }
                        existingMatches = chosenExercises.filter(fm.testEx);
                    }
                });

                if (activeFocusMatchers.length > 0) {
                    chosenExercises.forEach(ex => {
                        if (isAnyFocusMatch(ex)) {
                            if (wishLower) {
                                ex.isWishFocus = true;
                            } else if (!ex.synergyBadge) {
                                ex.synergyBadge = 'Eksik Telafisi';
                            }
                        }
                    });
                }

                if (wishLower) {
                    const computeExSynergyLabel = (ex) => {
                        if (!ex || ex.isWishFocus) return '';
                        const anat = getExerciseAnatomy(ex);
                        const secText = `${anat.secondary || ''} ${(ex.secondaryMuscles || []).join(' ')} ${ex.cue || ''} ${ex.name || ''}`.toLocaleLowerCase('tr-TR');
                        const idStr = String(ex.id || '');
                        const matchedSec = [];
                        if (/sırt|kanat|row|çekiş|lat|trapez/.test(wishLower)) {
                            if (/sırt|kanat|trapez|rhomboid|arka omuz|alt bel|torasik/.test(secText) ||
                                /front_squat|goblet_squat|zercher_squat|deadlift|rdl|swing|clean|snatch|farmers_walk|suitcase_carry|renegade|pull_through/.test(idStr)) {
                                matchedSec.push('Sırt');
                            }
                        }
                        if (/kol|biceps|triceps|pazu|arka kol|ön kol/.test(wishLower)) {
                            if (/triceps|biceps|ön kol|kavrama|kol/.test(secText) ||
                                /pushup|bench|incline_press|floor_press|dips|overhead_press|arnold_press|push_press|thruster|clean|row|pullup|chinup|pulldown|farmers_walk|suitcase_carry|deadlift|rdl|swing|goblet_squat|front_squat|hanging/.test(idStr)) {
                                matchedSec.push('Kol');
                            }
                        }
                        if (/omuz|deltoid/.test(wishLower) && /omuz|deltoid|trapez/.test(secText)) matchedSec.push('Omuz');
                        if (/göğüs|chest|şınav|bench/.test(wishLower) && /göğüs|pectoral/.test(secText)) matchedSec.push('Göğüs');
                        if (/karın|core|abs|plank/.test(wishLower) && /core|karın|oblik/.test(secText)) matchedSec.push('Core');
                        return matchedSec.length > 0 ? `+${matchedSec.join('/')}` : '';
                    };

                    chosenExercises.forEach(ex => {
                        const synLbl = computeExSynergyLabel(ex);
                        if (synLbl) ex.synergyBadge = synLbl;
                    });
                }
            }

            // SON BİYOMEKANİK AÇI & %70 KAS ÖRTÜŞME DENETİMİ:
            // Seans içinde herhangi bir aşamada (fallback veya özel odak enjeksiyonu) aynı açılı ve %70+ kas örtüşmeli
            // iki hareket (örn. Barbell Row + Rotasyonel Gorilla Row) yan yana düşmüşse, ikincisini farklı açılı (dikey veya destekli) hareketle değiştir.
            for (let i = 1; i < chosenExercises.length; i++) {
                const curEx = chosenExercises[i];
                const priorList = chosenExercises.slice(0, i);
                if (hasBiomechAngleAndMuscleConflict(curEx, priorList)) {
                    const otherList = chosenExercises.filter((_, idx) => idx !== i);
                    const curCat = getEffectiveExerciseCategory(curEx);
                    const altPool = filterToUnworkedAdjacentSubMuscles(
                        preferWeeklyFreshExercises(EXERCISES_DB.filter(cand =>
                            !isExerciseExcludedByUser(cand.id) &&
                            isExerciseEquipmentAvailable(cand) &&
                            !usedIds.includes(cand.id) &&
                            !wishParsed.excludedIds.has(cand.id) &&
                            getEffectiveExerciseCategory(cand) === curCat &&
                            !otherList.some(o => getExerciseMovementFamily(o) === getExerciseMovementFamily(cand)) &&
                            !hasBiomechAngleAndMuscleConflict(cand, otherList)
                        )),
                        false
                    );
                    const altPick = pickRandom(altPool);
                    if (altPick) {
                        const altClone = Object.assign({}, altPick, {
                            isWishFocus: curEx.isWishFocus,
                            synergyBadge: curEx.synergyBadge
                        });
                        usedIds.push(altClone.id);
                        weeklyUsedIds.add(altClone.id);
                        usedFamilies.add(getExerciseMovementFamily(altClone));
                        chosenExercises[i] = altClone;
                    }
                }
            }

            // KATMAN 4: Seçilen Süperset Yoğunluğuna Göre Akademik Blok Etiketlerini Ata
            const structuredExercises = assignAcademicBlockStructure(chosenExercises, style, scheme);

            // Dynamic Warmups
            const warmups = [
                { name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ve geniş dairelerle ısıt." },
                { name: "World's Greatest Stretch (Kalça & Torasik Açış)", dur: "60 sn", cue: "Derin lunge pozisyonunda göğsü tavana doğru çevir." },
                { name: "Kedi - Deve & Kuş Köpeği (Omurga Aktivasyonu)", dur: "60 sn", cue: "Nefes alarak beli çukurlaştır, nefes vererek sırtı kabart." }
            ];

            // KATMAN 3: FINISHER ÇAKIŞMA VE KISITLAMA KORUMASI (Ana antrenmanda seçilen hareket veya kullanıcının istemediği hareketler Finisher olamaz!)
            const finisherCandidates = [
                { exId: "db_swing", family: "ballistic_hip_hinge", name: "3 Dk Tabata Balistik Bitiş", desc: "20 sn Maksimum Tempolu Swing / Snatch + 10 sn Dinlenme (4 Tur)" },
                { exId: "db_farmers_walk", family: "loaded_carry", name: "Çiftçi Yürüyüşü (Farmer's Walk / Carry Burnout)", desc: "Mümkün olan en ağır dambıllarla 3 tur 40 metre kesintisiz yürüyüş." },
                { exId: "bw_burpee", family: "fullbody_metcon_burpee", name: "3 Dk EMOM Kondisyon Zırhı (Burpee / Mountain Climber)", desc: "Her dakika başında 10 Burpee veya 30 sn Mountain Climber, kalan sürede aktif dinlenme." },
                { exId: "bw_plank", family: "core_anterior_plank", name: "2 Dk İzometrik Core & Hollow Hold Burnout", desc: "40 sn RKC Plank + 20 sn Dinlenme × 2 Tur maksimum karın duvarı sıkışı." }
            ];
            const fallbackRecoveryFinisher = {
                exId: "bw_hollow_body",
                family: "recovery",
                name: "2 Dk Diyafram Nefesi & Core Toparlanma",
                desc: "Sırtüstü uzanıp 4 sn nefes al, 4 sn tut, 6 sn ver; parasempatik toparlanmayı tetikle."
            };

            const deconflictedFinishers = finisherCandidates.filter(f => {
                if (usedIds.includes(f.exId) || usedFamilies.has(f.family)) return false;
                if (wishParsed.excludedIds.has(f.exId)) return false;
                const fNameLow = (f.name || '').toLocaleLowerCase('tr-TR');
                const fIdLow = (f.exId || '').toLocaleLowerCase('tr-TR');
                if (wishParsed.excludedKeywords.some(kw => fNameLow.includes(kw) || fIdLow.includes(kw))) return false;
                return true;
            });
            const weeklyFreshFinishers = deconflictedFinishers.filter(f => !weeklyUsedFinishers.has(f.exId));
            const selectedFinisher = pickRandom(
                weeklyFreshFinishers.length > 0
                    ? weeklyFreshFinishers
                    : (deconflictedFinishers.length > 0 ? deconflictedFinishers : [fallbackRecoveryFinisher])
            ) || fallbackRecoveryFinisher;
            if (selectedFinisher && selectedFinisher.exId) {
                weeklyUsedFinishers.add(selectedFinisher.exId);
            }

            const splitNames = {
                full_body: "Tüm Vücut Antrenmanı",
                upper_push: "Üst Vücut İtiş",
                upper_pull: "Üst Vücut Çekiş",
                lower: "Alt Vücut & Bacak",
                iso_chest: "Göğüs Antrenmanı",
                iso_back: "Sırt & Kanat",
                iso_shoulders: "Omuz Antrenmanı",
                iso_arms: "Kol Antrenmanı",
                iso_legs: "Bacak & Kalça",
                iso_core: "Karın & Core",
                upper: "Üst Vücut Antrenmanı",
                core: "Karın & Core",
                functional: "Fonksiyonel Güç"
            };

            const splitShortNames = {
                full_body: "Tüm Vücut",
                upper_push: "Üst İtiş",
                upper_pull: "Üst Çekiş",
                lower: "Alt Vücut",
                iso_chest: "Göğüs",
                iso_back: "Sırt",
                iso_shoulders: "Omuz",
                iso_arms: "Kol",
                iso_legs: "Bacak",
                iso_core: "Karın",
                upper: "Üst Vücut",
                core: "Core",
                functional: "Fonksiyonel"
            };

            let generatedSplitTitle = '';
            if (selectedSplits.length === 1) {
                generatedSplitTitle = splitNames[selectedSplits[0]] || selectedSplits[0];
            } else {
                generatedSplitTitle = selectedSplits.map(s => splitShortNames[s] || s).join(' + ');
            }

            currentGeneratedWorkout = {
                id: 'gen_' + Date.now(),
                title: generatedSplitTitle,
                split: selectedSplits.length === 1 ? selectedSplits[0] : 'custom',
                splits: [...selectedSplits],
                splitName: generatedSplitTitle,
                doctrine: activeDoctrineKey,
                doctrineName: activeDoc.name,
                doctrineShort: activeDoc.shortTag,
                doctrineBadgeColor: activeDoc.badgeColor,
                customWish: customWish || '',
                wishAppliedFilters: wishParsed.appliedFilters,
                style,
                goal,
                duration,
                scheme,
                warmups,
                exercises: structuredExercises,
                finisher: selectedFinisher,
                historyContext: {
                    fatiguedMuscles48h: hasTimeTravel
                        ? (Array.isArray(activeWeeklyCtx.fatiguedMuscles48h) ? activeWeeklyCtx.fatiguedMuscles48h : [])
                        : ((isFirstOrSingleDay && Array.isArray(activeWeeklyCtx.fatiguedMuscles48h)) ? activeWeeklyCtx.fatiguedMuscles48h : []),
                    hadSpinalHinge48h: hasTimeTravel
                        ? Boolean(activeWeeklyCtx.hadSpinalHinge48h || (isConsecutiveDay && activeWeeklyCtx.prevGeneratedDayHadSpinalHinge))
                        : Boolean((isFirstOrSingleDay && activeWeeklyCtx.hadSpinalHinge48h) || activeWeeklyCtx.prevGeneratedDayHadSpinalHinge),
                    prevDayMuscles: (!isFirstOrSingleDay && activeWeeklyCtx.prevGeneratedDayMuscles) ? Array.from(activeWeeklyCtx.prevGeneratedDayMuscles) : [],
                    adjacentBlockedSubKeys31: Array.from(adjacentDayWorkedSubKeys31),
                    isConsecutiveDay: isConsecutiveDay,
                    neglectedMuscles7d: Array.isArray(activeWeeklyCtx.neglectedMuscles7d) ? activeWeeklyCtx.neglectedMuscles7d : [],
                    neglectedMuscles30d: Array.isArray(activeWeeklyCtx.neglectedMuscles30d) ? activeWeeklyCtx.neglectedMuscles30d : [],
                    saturatedMuscles7d: Array.isArray(activeWeeklyCtx.saturatedMuscles7d) ? activeWeeklyCtx.saturatedMuscles7d : []
                },
                createdAt: Date.now()
            };

            window.currentGeneratedWorkout = currentGeneratedWorkout;
            if (!weeklyContext && window.pendingAiWeeklyPlan && window._editingPendingWeeklyDayIdx !== null && window._editingPendingWeeklyDayIdx !== undefined) {
                const editIdx = Number(window._editingPendingWeeklyDayIdx);
                const dayEntry = window.pendingAiWeeklyPlan.days && window.pendingAiWeeklyPlan.days[editIdx];
                if (dayEntry) {
                    currentGeneratedWorkout.id = dayEntry.workout ? dayEntry.workout.id : ('ai_wk_' + dayEntry.dayIdx + '_' + Date.now());
                    currentGeneratedWorkout.title = dayEntry.label;
                    dayEntry.workout = currentGeneratedWorkout;
                    if (window.pendingAiWeeklyPlan.draftSchedule && window.pendingAiWeeklyPlan.draftSchedule[dayEntry.dayIdx]) {
                        window.pendingAiWeeklyPlan.draftSchedule[dayEntry.dayIdx].customWorkout = currentGeneratedWorkout;
                        window.pendingAiWeeklyPlan.draftSchedule[dayEntry.dayIdx].exercises = currentGeneratedWorkout.exercises;
                        window.pendingAiWeeklyPlan.draftSchedule[dayEntry.dayIdx].desc = `${currentGeneratedWorkout.exercises.length} Hareket • ${currentGeneratedWorkout.duration} Dk`;
                    }
                }
            }
            try {
                if (typeof persistLastGeneratedWorkout === 'function') {
                    persistLastGeneratedWorkout(currentGeneratedWorkout);
                } else {
                    localStorage.setItem('celik_kodu_last_generated_workout', JSON.stringify(currentGeneratedWorkout));
                }
            } catch(e) {}

            window.expandedGeneratedExIndex = null;
            renderGeneratedWorkout();
            playAlertSound();
        }

        window.expandedGeneratedExIndex = null;
        function toggleGeneratedExDetail(exIdx) {
            const idx = Number(exIdx);
            const container = document.getElementById('generatedWorkoutOutput');
            const oldRows = container ? container.querySelectorAll('.wk-ex-item-wrap') : null;
            const anchorOffsetTop = (oldRows && oldRows[idx]) ? oldRows[idx].getBoundingClientRect().top : null;
            if (window.expandedGeneratedExIndex === idx) {
                window.expandedGeneratedExIndex = null;
            } else {
                window.expandedGeneratedExIndex = idx;
            }
            renderGeneratedWorkout({ preserveScroll: true });
            if (anchorOffsetTop !== null && container) {
                const newRows = container.querySelectorAll('.wk-ex-item-wrap');
                if (newRows[idx]) {
                    const delta = newRows[idx].getBoundingClientRect().top - anchorOffsetTop;
                    if (Math.abs(delta) > 1) {
                        window.scrollBy({ top: delta, left: 0, behavior: 'instant' });
                    }
                }
            }
        }
        window.toggleGeneratedExDetail = toggleGeneratedExDetail;

        function renderGeneratedWorkout(options = {}) {
            const w = currentGeneratedWorkout;
            const container = document.getElementById('generatedWorkoutOutput');
            if (!w || !container) return;
            const savedScrollY = window.scrollY;

            const user = getActiveUser();
            const weights = user ? (user.weights || {}) : {};
            const todayIdx = new Date().getDay();
            const todayName = DAY_NAMES_TR[todayIdx] || 'Bugün';
            const tomorrowIdx = (todayIdx + 1) % 7;
            const tomorrowName = DAY_NAMES_TR[tomorrowIdx] || 'Yarın';

            // Egzersizlerin blok etiketleri yoksa (eski kayıt) dinamik hesapla
            const hasUnupgradedPair = (w.exercises || []).some(ex => ex.blockType === 'superset' && ex.supersetRole === undefined);
            const structuredList = (w.exercises && w.exercises.length > 0 && w.exercises[0].blockLabel && !hasUnupgradedPair)
                ? w.exercises
                : assignAcademicBlockStructure(w.exercises || [], w.style || 'superset', w.scheme);
            w.exercises = structuredList;

            const timelineStationsHtml = buildTimelineStationsHtml(structuredList, w.scheme, weights, 'generated');

            const cleanWorkoutTitle = String(w.title || 'Antrenman')
                .replace(/^(?:⚔️\s*)?(?:BB-Dominant Hibrit|Saf Bodybuilding|Dengeli Hibrit Atlet|Fonksiyonel-Dominant|Saf Fonksiyonel & Kondisyon)\s*•\s*/i, '')
                .replace(/\s*\((?:Full Body|Push|Pull|İzole|Biceps & Triceps|%\d+[^)]*|AI Hibrit|Bacak Korumalı|Üst Vücut Korumalı|Sırt\/Bel Korumalı|Ardışık Gün Dengeli)\)/gi, '')
                .trim() || 'Tüm Vücut Antrenmanı';
            w.title = cleanWorkoutTitle;

            const wishBadge = w.customWish ? `
                <div style="font-size:11.5px; color:#475569; background:#F1F5F9; padding:4px 8px; border-radius:6px; margin-top:4px; display:inline-block;">
                    🎯 <strong>Özel İstek/Not:</strong> "${escapeHTML(w.customWish)}"
                </div>
            ` : '';
            const filterBadge = (w.wishAppliedFilters && w.wishAppliedFilters.length > 0) ? `
                <div style="font-size:11px; color:#991B1B; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-left:3px solid #EF4444; padding:5px 9px; border-radius:6px; margin-top:5px; display:block;">
                    🚫 <strong>AI Kısıtlama Filtresi:</strong> ${w.wishAppliedFilters.map(escapeHTML).join(' • ')}
                </div>
            ` : '';

            const wkStatus = typeof getWeeklyTrainingStatus === 'function' ? getWeeklyTrainingStatus() : { isThisWeekComplete: false, completedThisWeekCount: 0, todayName };

            const backToWeeklyBtn = window.pendingAiWeeklyPlan ? `
                <div style="margin-bottom:8px;">
                    <button type="button" class="btn-action-secondary" style="padding:6px 10px; font-size:11.5px; border-color:#15803D; color:#15803D; font-weight:800;" onclick="renderPendingWeeklyPlanPreview()">
                        ⬅️ Haftalık Programa Dön
                    </button>
                </div>
            ` : '';

            container.innerHTML = `
                <div class="workout-header-card">
                    ${backToWeeklyBtn}
                    <div style="margin-bottom:4px;">
                        <h2 class="workout-main-title" style="font-size:18px; line-height:1.25; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(cleanWorkoutTitle)}</h2>
                        ${wishBadge}
                        ${filterBadge}
                    </div>

                    <!-- COMPACT MOBILE ACTION BAR -->
                    <div class="wk-compact-action-wrap">
                        <div class="wk-compact-primary-row">
                            <button type="button" class="wk-btn-primary-compact" onclick="startActiveWorkoutFromGenerated()">
                                ${CANVA_ICONS.play} <span>Şimdi Başlat</span>
                            </button>
                            <button type="button" class="wk-btn-utility-compact" onclick="handleGenerateWorkout()" title="Farklı hareketlerle yeniden üret">
                                ${CANVA_ICONS.refresh} <span>Yenile</span>
                            </button>
                        </div>
                        <div class="wk-compact-secondary-grid">
                            ${wkStatus.isThisWeekComplete ? `
                                <button type="button" class="wk-chip-action highlight-green" onclick="assignGeneratedToNextWeekDay(1)">
                                    📅 Gelecek Hf.
                                </button>
                                <button type="button" class="wk-chip-action" onclick="assignGeneratedToToday()">
                                    ⚡ Bugüne
                                </button>
                                <button type="button" class="wk-chip-action" onclick="promptAssignGeneratedToAnyDay()">
                                    🗓️ Gün Seç
                                </button>
                            ` : `
                                <button type="button" class="wk-chip-action highlight-orange" onclick="assignGeneratedToToday()">
                                    ⚡ Bugüne
                                </button>
                                <button type="button" class="wk-chip-action" onclick="scheduleTomorrowFromGenerated()">
                                    📅 Yarına
                                </button>
                                <button type="button" class="wk-chip-action" onclick="promptAssignGeneratedToAnyDay()">
                                    🗓️ Gün Seç
                                </button>
                            `}
                            <button type="button" class="wk-chip-action" onclick="saveGeneratedToLibrary()">
                                💾 Kaydet
                            </button>
                        </div>
                    </div>

                    <!-- COMPACT INFO "i" TRIGGERS (KOÇ ÖZETİ & DİNAMİK ISINMA) -->
                    <div class="wk-info-triggers-row">
                        <button type="button" class="wk-info-i-btn" onclick="openWorkoutInfoModal('coach')" title="Koç Özeti ve Eksik Telafisi">
                            <span class="wk-i-badge">i</span>
                            <span>Koç Özeti</span>
                        </button>
                        <button type="button" class="wk-info-i-btn" onclick="openWorkoutInfoModal('warmup')" title="Dinamik Isınma ve Mobilite">
                            <span class="wk-i-badge">i</span>
                            <span>Dinamik Isınma</span>
                        </button>
                    </div>

                    ${buildWorkoutInfoModalsHtml(w, 'generated')}

                    <!-- MAIN EXERCISES LIST (TIMELINE FLOW) -->
                    <div style="margin-top:14px;"></div>

                    ${timelineStationsHtml}

                    <div style="text-align:center; margin:14px 0 20px;">
                        <button class="btn btn-outline" style="border-style:dashed; border-color:#0284C7; color:#0284C7; font-size:12px; padding:8px 16px; border-radius:8px; font-weight:700;" onclick="openAddExerciseModal('generated')">
                            ➕ Listeye Hareket Ekle
                        </button>
                    </div>

                    <!-- FINISHER -->
                    <div class="block-header">🔥 Balistik Bitiş / Finisher</div>
                    <div style="background:rgba(225, 29, 72, 0.05); border:1px solid rgba(225, 29, 72, 0.2); border-left:4px solid var(--red-alert); border-radius:10px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:200px;">
                            <strong style="color:#0F172A; font-size:13px;">${escapeHTML(w.finisher.name)}</strong>
                            <div style="font-size:12px; color:#64748B; margin-top:2px;">${escapeHTML(w.finisher.desc)}</div>
                        </div>
                        ${(() => {
                            const fName = (w.finisher && w.finisher.name) ? w.finisher.name.toLowerCase() : '';
                            const resolvedId = (w.finisher && w.finisher.exId && EXERCISES_DB.some(e => e.id === w.finisher.exId))
                                ? w.finisher.exId
                                : (fName.includes('tabata') || fName.includes('swing')
                                    ? 'db_swing'
                                    : (fName.includes('plank') || fName.includes('hollow') || fName.includes('core')
                                        ? 'bw_plank'
                                        : (fName.includes('burpee') || fName.includes('emom')
                                            ? 'bw_burpee'
                                            : (fName.includes('farmer') || fName.includes('yürüyüş') || fName.includes('taşıma') || fName.includes('carry')
                                                ? 'db_farmers_walk'
                                                : null))));
                            return resolvedId
                                ? `<button type="button" class="btn btn-outline" style="padding:6px 10px; font-size:11px; border-color:rgba(244,63,94,0.45); color:#E11D48; white-space:nowrap; font-weight:700;" onclick="openExerciseDetailModal(decodeURIComponent('${encodeURIComponent(resolvedId)}'))">📸 Form Rehberi</button>`
                                : '';
                        })()}
                    </div>

                    <!-- BOTTOM DUAL ACTION HIERARCHY (Vazgeç + Seansı Başlat) -->
                    <div style="display:flex; align-items:center; gap:10px; margin-top:18px; padding-top:14px; border-top:1px solid #E2E8F0;">
                        <button type="button" class="btn-action-secondary" style="padding:13px 22px; font-size:14px; font-weight:800; color:#0F172A; background:#F1F5F9; border:1px solid #E2E8F0; border-radius:14px; justify-content:center;" onclick="dismissGeneratedWorkoutView()">
                            Vazgeç
                        </button>
                        <button type="button" class="btn-start-workout" style="flex:1; padding:13px 20px; font-size:14.5px; font-weight:800; background:#FF5A36; color:#FFFFFF; border:none; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 6px 18px rgba(255,90,54,0.28);" onclick="startActiveWorkoutFromGenerated()">
                            <span>▶️ Seansı Başlat</span>
                        </button>
                    </div>
                </div>
            `;

            if (w && !w._aiAutoAudited && typeof getGeminiApiKey === 'function' && getGeminiApiKey()) {
                w._aiAutoAudited = true;
                setTimeout(() => {
                    if (typeof validateWorkoutWithAcademicAI === 'function') {
                        validateWorkoutWithAcademicAI('generated', { silentAuto: true });
                    }
                }, 80);
            }

            if (options && options.scrollToTop) {
                if (container.scrollIntoView) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (Math.abs(window.scrollY - savedScrollY) > 1) {
                window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
            }
        }

        function assignGeneratedToNextWeekDay(targetDayIdx = 1) {
            let workout = currentGeneratedWorkout;
            if (!workout) {
                try {
                    workout = typeof readActiveLastGeneratedWorkout === 'function'
                        ? readActiveLastGeneratedWorkout()
                        : JSON.parse(localStorage.getItem('celik_kodu_last_generated_workout') || 'null');
                } catch(e) {}
            }
            if (!workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
                if (typeof showToast === 'function') showToast("⚠️ Atanacak hazır program bulunamadı.");
                return;
            }
            const user = getActiveUser();
            const uid = user ? user.id : 'default';
            const nextSched = getNextWeeklySchedule(uid);
            const dayName = DAY_NAMES_TR[targetDayIdx] || 'Pazartesi';

            nextSched[targetDayIdx] = {
                id: workout.id || ('gen_next_' + targetDayIdx + '_' + Date.now()),
                title: workout.title || `Gelecek Hafta ${dayName} Programı`,
                type: 'custom_generated',
                desc: `${workout.exercises.length} Hareket • ${workout.duration || 45} Dk`,
                rest: false,
                customWorkout: JSON.parse(JSON.stringify(workout)),
                exercises: workout.exercises
            };
            saveNextWeeklySchedule(nextSched, uid);
            activePlannerWeek = 'next';
            if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            if (typeof playAlertSound === 'function') playAlertSound();
            if (typeof showToast === 'function') {
                showToast(`📅 "${workout.title}" Gelecek Hafta ${dayName} gününe başarıyla atandı! Bu haftaki tamamlanan antrenmanlarınız korundu.`);
            }
        }
        window.assignGeneratedToNextWeekDay = assignGeneratedToNextWeekDay;

        function switchGuideTab(collapseId, tabName) {
            const panels = ['animasyon', 'form', 'anatomi', 'adimlar'];
            panels.forEach(p => {
                const panelEl = document.getElementById(`panel_${p}_${collapseId}`);
                const btnEl = document.getElementById(`tab_btn_${p}_${collapseId}`);
                if (panelEl) {
                    if (p === tabName) {
                        panelEl.classList.add('active');
                        panelEl.querySelectorAll('video').forEach(v => {
                            v.muted = true;
                            v.defaultMuted = true;
                            v.playsInline = true;
                            v.play().catch(() => {});
                        });
                    } else {
                        panelEl.classList.remove('active');
                    }
                }
                if (btnEl) {
                    if (p === tabName) {
                        btnEl.classList.add('active');
                    } else {
                        btnEl.classList.remove('active');
                    }
                }
            });
        }

        function togglePosGuide(collapseId) {
            const el = document.getElementById(collapseId);
            const btn = document.getElementById('icon_' + collapseId);
            if (!el) return;
            if (el.classList.contains('collapsed')) {
                el.classList.remove('collapsed');
                if (btn) btn.innerText = '📖 Formu Gizle ▲';
                el.querySelectorAll('video').forEach(v => {
                    v.muted = true;
                    v.defaultMuted = true;
                    v.playsInline = true;
                    v.play().catch(() => {});
                });
            } else {
                el.classList.add('collapsed');
                if (btn) btn.innerText = '📖 Formu Gör ▼';
            }
        }

        function togglePosExtraInfo(infoId) {
            const body = document.getElementById('body_' + infoId);
            const arrow = document.getElementById('arrow_' + infoId);
            if (!body) return;
            const isHidden = (body.style.display === 'none' || body.classList.contains('collapsed'));
            if (isHidden) {
                body.style.display = 'block';
                body.classList.remove('collapsed');
                if (arrow) arrow.innerHTML = '▲ Gizle';
            } else {
                body.style.display = 'none';
                body.classList.add('collapsed');
                if (arrow) arrow.innerHTML = '▼ Göster';
            }
        }

        function openImageLightbox(src, title) {
            if (!src) return;
            const modal = document.getElementById('imageLightboxModal');
            const img = document.getElementById('lightboxImg');
            const videoEl = document.getElementById('lightboxVideo');
            const titleEl = document.getElementById('lightboxTitle');
            const zoomText = document.getElementById('lightboxZoomText');
            if (!modal) return;

            const isVideo = /\.(mp4|webm)(?:[?#].*)?$/i.test(src);
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
        }

        function toggleLightboxZoom() {
            const img = document.getElementById('lightboxImg');
            const zoomText = document.getElementById('lightboxZoomText');
            if (!img) return;
            const isZoomed = img.classList.toggle('zoomed');
            if (zoomText) {
                zoomText.textContent = isZoomed ? 'Sığdır' : 'Büyüt (%180)';
            }
        }

        function toggleDiagramScroll(wrapId) {
            const wrap = document.getElementById(wrapId);
            if (!wrap) return;
            const isEnlarged = wrap.classList.toggle('enlarged');
            const btn = wrap.querySelector('.btn-scroll-toggle');
            if (btn) {
                btn.classList.toggle('scroll-active', isEnlarged);
                const textSpan = btn.querySelector('.tool-text');
                if (textSpan) {
                    textSpan.textContent = isEnlarged ? 'Sığdır' : 'Kaydırarak Büyüt';
                }
            }
        }

        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('imageLightboxModal');
                if (modal && modal.classList.contains('active')) {
                    closeImageLightbox();
                    return;
                }
                document.querySelectorAll('.modal-overlay.active').forEach(el => el.classList.remove('active'));
            }
        });

        const guideLibrary = {
            db_thruster: { form: 'assets/guides/guide_db_thruster_form.jpg', anatomi: 'assets/guides/guide_db_thruster_anatomi.jpg' },
            db_push_press: { form: 'assets/guides/guide_db_push_press_form.jpg', anatomi: 'assets/guides/guide_db_push_press_anatomi.jpg' },
            db_renegade_pushup: { form: 'assets/guides/guide_db_renegade_pushup_form.jpg', anatomi: 'assets/guides/guide_db_renegade_pushup_anatomi.jpg' },
            bear_crawl_pull_through: { form: 'assets/guides/guide_bear_crawl_pull_through_form.jpg', anatomi: 'assets/guides/guide_bear_crawl_pull_through_anatomi.jpg' },
            db_clean_and_press: { form: 'assets/guides/guide_db_clean_and_press_form.jpg', anatomi: 'assets/guides/guide_db_clean_and_press_anatomi.jpg' },
            db_manmaker: { form: 'assets/guides/guide_db_manmaker_form.jpg', anatomi: 'assets/guides/guide_db_manmaker_anatomi.jpg' },
            waiters_carry: { form: 'assets/guides/guide_waiters_carry_form.jpg', anatomi: 'assets/guides/guide_waiters_carry_anatomi.jpg' },
            cross_body_carry: { form: 'assets/guides/guide_cross_body_carry_form.jpg', anatomi: 'assets/guides/guide_cross_body_carry_anatomi.jpg' },
            lunge_with_twist: { form: 'assets/guides/guide_lunge_with_twist_form.jpg', anatomi: 'assets/guides/guide_lunge_with_twist_anatomi.jpg' },
            step_up_press: { form: 'assets/guides/guide_step_up_press_form.jpg', anatomi: 'assets/guides/guide_step_up_press_anatomi.jpg' },
                half_kneeling_plate_chop: { form: 'assets/guides/guide_half_kneeling_plate_chop_form.jpg', anatomi: 'assets/guides/guide_half_kneeling_plate_chop_anatomi.jpg' },
                kneeling_plate_front_raise: { form: 'assets/guides/guide_kneeling_plate_front_raise_form.jpg', anatomi: 'assets/guides/guide_kneeling_plate_front_raise_anatomi.jpg' },
                goblet_squat: { form: 'assets/guides/guide_db_goblet_squat_form.jpg', anatomi: 'assets/guides/guide_db_goblet_squat_anatomi.jpg' },
                back_squat: { form: 'assets/guides/guide_bb_back_squat_form.jpg', anatomi: 'assets/guides/guide_bb_back_squat_anatomi.jpg' },
                lunge: { form: 'assets/guides/guide_db_walking_lunge_form.jpg', anatomi: 'assets/guides/guide_db_walking_lunge_anatomi.jpg' },
                bulgarian_squat: { form: 'assets/guides/guide_db_bulgarian_squat_form.jpg', anatomi: 'assets/guides/guide_db_bulgarian_squat_anatomi.jpg' },
                deadlift: { form: 'assets/guides/guide_bb_deadlift_form.jpg', anatomi: 'assets/guides/guide_bb_deadlift_anatomi.jpg' },
                rdl: { form: 'assets/guides/guide_db_rdl_form.jpg', anatomi: 'assets/guides/guide_db_rdl_anatomi.jpg' },
                single_leg_rdl: { form: 'assets/guides/guide_db_single_leg_rdl_form.jpg', anatomi: 'assets/guides/guide_db_single_leg_rdl_anatomi.jpg' },
                hip_thrust: { form: 'assets/guides/guide_bb_hip_thrust_form.jpg', anatomi: 'assets/guides/guide_bb_hip_thrust_anatomi.jpg' },
                bench: { form: 'assets/guides/guide_db_bench_press_form.jpg', anatomi: 'assets/guides/guide_db_bench_press_anatomi.jpg' },
                overhead: { form: 'assets/guides/guide_db_overhead_press_form.jpg', anatomi: 'assets/guides/guide_db_overhead_press_anatomi.jpg' },
                lateral_raise: { form: 'assets/guides/guide_db_lateral_raise_form.jpg', anatomi: 'assets/guides/guide_db_lateral_raise_anatomi.jpg' },
                saw_row: { form: 'assets/guides/guide_db_saw_row_form.jpg', anatomi: 'assets/guides/guide_db_saw_row_anatomi.jpg' },
                pullup: { form: 'assets/guides/guide_bw_pullup_form.jpg', anatomi: 'assets/guides/guide_bw_pullup_anatomi.jpg' },
                curl: { form: 'assets/guides/guide_db_biceps_curl_form.jpg', anatomi: 'assets/guides/guide_db_biceps_curl_anatomi.jpg' },
                triceps: { form: 'assets/guides/guide_mach_triceps_pushdown_form.jpg', anatomi: 'assets/guides/guide_mach_triceps_pushdown_anatomi.jpg' },
                skullcrusher: { form: 'assets/guides/guide_db_skullcrusher_form.jpg', anatomi: 'assets/guides/guide_db_skullcrusher_anatomi.jpg' },
                triceps_overhead: { form: 'assets/guides/guide_db_triceps_overhead_form.jpg', anatomi: 'assets/guides/guide_db_triceps_overhead_anatomi.jpg' },
                pushup: { form: 'assets/guides/guide_bw_pushup_form.jpg', anatomi: 'assets/guides/guide_bw_pushup_anatomi.jpg' },
                dips: { form: 'assets/guides/guide_bw_dips_form.jpg', anatomi: 'assets/guides/guide_bw_dips_anatomi.jpg' },
                face_pull: { form: 'assets/guides/guide_mach_face_pull_form.jpg', anatomi: 'assets/guides/guide_mach_face_pull_anatomi.jpg' },
                snatch: { form: 'assets/guides/guide_db_snatch_form.jpg', anatomi: 'assets/guides/guide_db_snatch_anatomi.jpg' },
            clean: { form: 'assets/guides/guide_kb_clean_form.jpg', anatomi: 'assets/guides/guide_kb_clean_anatomi.jpg' },
            leg_press: { form: 'assets/guides/guide_mach_leg_press_form.jpg', anatomi: 'assets/guides/guide_mach_leg_press_anatomi.jpg' },
            leg_extension: { form: 'assets/guides/guide_mach_leg_extension_form.jpg', anatomi: 'assets/guides/guide_mach_leg_extension_anatomi.jpg' },
            calf_raise: { form: 'assets/guides/guide_mach_calf_raise_form.jpg', anatomi: 'assets/guides/guide_mach_calf_raise_anatomi.jpg' },
            leg_curl: { form: 'assets/guides/guide_mach_leg_curl_form.jpg', anatomi: 'assets/guides/guide_mach_leg_curl_anatomi.jpg' },
            lat_pulldown: { form: 'assets/guides/guide_mach_lat_pulldown_form.jpg', anatomi: 'assets/guides/guide_mach_lat_pulldown_anatomi.jpg' },
                swing: { form: 'assets/guides/guide_db_swing_form.jpg', anatomi: 'assets/guides/guide_db_swing_anatomi.jpg' },
                plank: { form: 'assets/guides/guide_bw_plank_form.jpg', anatomi: 'assets/guides/guide_bw_plank_anatomi.jpg' },
                farmers_walk: { form: 'assets/guides/guide_db_farmers_walk_form.jpg', anatomi: 'assets/guides/guide_db_farmers_walk_anatomi.jpg' },
                suitcase_carry: { form: 'assets/guides/guide_db_suitcase_carry_form.jpg', anatomi: 'assets/guides/guide_db_suitcase_carry_anatomi.jpg' },
                russian_twist: { form: 'assets/guides/guide_db_russian_twist_form.jpg', anatomi: 'assets/guides/guide_db_russian_twist_anatomi.jpg' },
                hanging_knee_raise: { form: 'assets/guides/guide_bw_hanging_knee_raise_form.jpg', anatomi: 'assets/guides/guide_bw_hanging_knee_raise_anatomi.jpg' },
                halo: { form: 'assets/guides/guide_kb_halo_form.jpg', anatomi: 'assets/guides/guide_kb_halo_anatomi.jpg' },
                windmill: { form: 'assets/guides/guide_kb_windmill_form.jpg', anatomi: 'assets/guides/guide_kb_windmill_anatomi.jpg' },
            hollow_body: { form: 'assets/guides/guide_bw_hollow_body_form.jpg', anatomi: 'assets/guides/guide_bw_hollow_body_anatomi.jpg' },
            mountain_climber: { form: 'assets/guides/guide_bw_mountain_climber_form.jpg', anatomi: 'assets/guides/guide_bw_mountain_climber_anatomi.jpg' },
            burpee: { form: 'assets/guides/guide_bw_burpee_form.jpg', anatomi: 'assets/guides/guide_bw_burpee_anatomi.jpg' },
            pullover: { form: 'assets/guides/guide_db_pullover_form.jpg', anatomi: 'assets/guides/guide_db_pullover_anatomi.jpg' },
            cable_woodchopper: { form: 'assets/guides/guide_mach_cable_woodchopper_form.jpg', anatomi: 'assets/guides/guide_mach_cable_woodchopper_anatomi.jpg' },
            glute_bridge: { form: 'assets/guides/guide_bw_glute_bridge_form.jpg', anatomi: 'assets/guides/guide_bw_glute_bridge_anatomi.jpg' },
            kb_swing: { form: 'assets/guides/guide_kb_swing_form.jpg', anatomi: 'assets/guides/guide_kb_swing_anatomi.jpg' },
            air_squat: { form: 'assets/guides/guide_bw_air_squat_form.jpg', anatomi: 'assets/guides/guide_bw_air_squat_anatomi.jpg' },

            incline_press: { form: 'assets/guides/guide_db_incline_press_form.jpg', anatomi: 'assets/guides/guide_db_incline_press_anatomi.jpg' },
            floor_press: { form: 'assets/guides/guide_db_floor_press_form.jpg', anatomi: 'assets/guides/guide_db_floor_press_anatomi.jpg' },
            arnold_press: { form: 'assets/guides/guide_db_arnold_press_form.jpg', anatomi: 'assets/guides/guide_db_arnold_press_anatomi.jpg' },
            bb_bench: { form: 'assets/guides/guide_bb_bench_press_form.jpg', anatomi: 'assets/guides/guide_bb_bench_press_anatomi.jpg' },
            pec_deck: { form: 'assets/guides/guide_mach_pec_deck_form.jpg', anatomi: 'assets/guides/guide_mach_pec_deck_anatomi.jpg' },
            diamond_pushup: { form: 'assets/guides/guide_bw_diamond_pushup_form.jpg', anatomi: 'assets/guides/guide_bw_diamond_pushup_anatomi.jpg' },
            kb_press: { form: 'assets/guides/guide_kb_press_form.jpg', anatomi: 'assets/guides/guide_kb_press_anatomi.jpg' },
            cable_lateral: { form: 'assets/guides/guide_mach_cable_lateral_form.jpg', anatomi: 'assets/guides/guide_mach_cable_lateral_anatomi.jpg' },
            cable_row: { form: 'assets/guides/guide_mach_cable_row_form.jpg', anatomi: 'assets/guides/guide_mach_cable_row_anatomi.jpg' },
            chinup: { form: 'assets/guides/guide_bw_chinup_form.jpg', anatomi: 'assets/guides/guide_bw_chinup_anatomi.jpg' },
            inverted_row: { form: 'assets/guides/guide_bw_inverted_row_form.jpg', anatomi: 'assets/guides/guide_bw_inverted_row_anatomi.jpg' },
            chest_supported_row: { form: 'assets/guides/guide_db_chest_supported_row_form.jpg', anatomi: 'assets/guides/guide_db_chest_supported_row_anatomi.jpg' },
            renegade_row: { form: 'assets/guides/guide_db_renegade_row_form.jpg', anatomi: 'assets/guides/guide_db_renegade_row_anatomi.jpg' },
            incline_curl: { form: 'assets/guides/guide_db_incline_curl_form.jpg', anatomi: 'assets/guides/guide_db_incline_curl_anatomi.jpg' },
            gorilla_row: { form: 'assets/guides/guide_kb_gorilla_row_form.jpg', anatomi: 'assets/guides/guide_kb_gorilla_row_anatomi.jpg' },
            pendlay_row: { form: 'assets/guides/guide_bb_pendlay_row_form.jpg', anatomi: 'assets/guides/guide_bb_pendlay_row_anatomi.jpg' },
            bb_thruster: { form: 'assets/guides/guide_bb_thruster_form.png', anatomi: null },
            bb_hang_power_clean: { form: 'assets/guides/guide_bb_hang_power_clean_form.png', anatomi: null },
            bb_push_press: { form: 'assets/guides/guide_bb_push_press_form.png', anatomi: null },
            bb_zercher_squat: { form: 'assets/guides/guide_bb_zercher_squat_form.png', anatomi: null },
            bb_landmine_squat_press: { form: 'assets/guides/guide_bb_landmine_squat_press_form.png', anatomi: null },
            sissy_squat: { form: 'assets/guides/guide_bw_sissy_squat_form.jpg', anatomi: 'assets/guides/guide_bw_sissy_squat_anatomi.jpg' },
            straight_arm_pulldown: { form: 'assets/guides/guide_mach_straight_arm_pulldown_form.jpg', anatomi: 'assets/guides/guide_mach_straight_arm_pulldown_anatomi.jpg' },
            hyperextension: { form: 'assets/guides/guide_bw_hyperextension_form.jpg', anatomi: 'assets/guides/guide_bw_hyperextension_anatomi.jpg' },
        };

            const exerciseGuideMap = {
            'db_thruster': guideLibrary.db_thruster,
            'db_push_press': guideLibrary.db_push_press,
            'db_renegade_pushup': guideLibrary.db_renegade_pushup,
            'bear_crawl_pull_through': guideLibrary.bear_crawl_pull_through,
            'db_clean_and_press': guideLibrary.db_clean_and_press,
            'db_manmaker': guideLibrary.db_manmaker,
            'waiters_carry': guideLibrary.waiters_carry,
            'cross_body_carry': guideLibrary.cross_body_carry,
            'lunge_with_twist': guideLibrary.lunge_with_twist,
            'step_up_press': guideLibrary.step_up_press,
                'half_kneeling_plate_chop': guideLibrary.half_kneeling_plate_chop,
                'kneeling_plate_front_raise': guideLibrary.kneeling_plate_front_raise,
                // Squats & Quads
                'db_goblet_squat': guideLibrary.goblet_squat,
                'db_front_squat': guideLibrary.goblet_squat,
                'kb_goblet_squat': guideLibrary.goblet_squat,
                'bw_air_squat': guideLibrary.air_squat,
                'bw_jump_squat': guideLibrary.air_squat,
                'bb_back_squat': { form: 'assets/exercises/bb_back_squat.webp', anatomi: null },
                'bb_front_squat': guideLibrary.back_squat,
                'mach_leg_press': guideLibrary.leg_press,
                'mach_leg_extension': guideLibrary.leg_extension,
                'mach_calf_raise': guideLibrary.calf_raise,
            'db_standing_calf_raise': guideLibrary.calf_raise,
            'db_lying_leg_curl': guideLibrary.leg_curl,
            'bw_sissy_squat': guideLibrary.sissy_squat,

                // Lunges & Unilateral
                'db_walking_lunge': guideLibrary.lunge,
                'db_reverse_lunge': guideLibrary.lunge,
                'db_bulgarian_squat': guideLibrary.bulgarian_squat,

                // Deadlift, RDL & Glutes
                'bb_deadlift': guideLibrary.deadlift,
                'bb_rdl': guideLibrary.rdl,
                'db_rdl': guideLibrary.rdl,
                'db_single_leg_rdl': guideLibrary.single_leg_rdl,
                'mach_leg_curl': guideLibrary.leg_curl,
                'bb_hip_thrust': guideLibrary.hip_thrust,
                'bw_glute_bridge': guideLibrary.glute_bridge,
                'bw_hyperextension': guideLibrary.hyperextension,

                // Swings & Snatches
                'db_swing': guideLibrary.swing,
                'kb_swing': guideLibrary.kb_swing,
                'db_snatch': guideLibrary.snatch,
                'kb_half_snatch': guideLibrary.snatch,
                'kb_clean': guideLibrary.clean,

                // Horizontal Chest Push
                'db_bench_press': guideLibrary.bench,
                'db_floor_press': guideLibrary.floor_press,
                'db_incline_press': guideLibrary.incline_press,
                'bb_bench_press': guideLibrary.bb_bench,
                'bb_incline_bench': guideLibrary.incline_press,
                'mach_cable_crossover': guideLibrary.pec_deck,
                'mach_pec_deck': guideLibrary.pec_deck,

                // Push-ups & Dips
                'bw_pushup': guideLibrary.pushup,
                'bw_diamond_pushup': guideLibrary.diamond_pushup,
                'bw_decline_pushup': guideLibrary.pushup,
                'bw_dips': guideLibrary.dips,
                'bw_burpee': guideLibrary.burpee,

                // Overhead Shoulder Push
                'db_overhead_press': guideLibrary.overhead,
                'db_standing_overhead_press': guideLibrary.overhead,
                'db_arnold_press': guideLibrary.arnold_press,
                'kb_press': guideLibrary.kb_press,
                'bb_overhead_press': guideLibrary.overhead,
                'bb_push_press': guideLibrary.bb_push_press,
                'bb_thruster': guideLibrary.bb_thruster,
                'bb_hang_power_clean': guideLibrary.bb_hang_power_clean,
                'bb_zercher_squat': guideLibrary.bb_zercher_squat,
                'bb_landmine_squat_press': guideLibrary.bb_landmine_squat_press,
                'kb_thruster': guideLibrary.db_thruster,
                'kb_halo': guideLibrary.halo,

                // Lateral Shoulder
                'db_lateral_raise': guideLibrary.lateral_raise,
                'mach_cable_lateral': guideLibrary.cable_lateral,

                // Triceps
                'mach_triceps_pushdown': guideLibrary.triceps,
                'db_triceps_overhead': guideLibrary.triceps_overhead,
                'db_skullcrusher': guideLibrary.skullcrusher,
                'bb_close_grip_bench': guideLibrary.bb_bench,

                // Horizontal Pull (Rows) & Pullover
                'db_saw_row': guideLibrary.saw_row,
                'db_chest_supported_row': guideLibrary.chest_supported_row,
                'kb_gorilla_row': guideLibrary.gorilla_row,
                'db_renegade_row': guideLibrary.renegade_row,
                'bb_bent_over_row': guideLibrary.pendlay_row,
                'bb_pendlay_row': guideLibrary.pendlay_row,
                'mach_cable_row': guideLibrary.cable_row,
                'bw_inverted_row': guideLibrary.inverted_row,
                'db_pullover': guideLibrary.pullover,

                // Vertical Pull
                'bw_pullup': guideLibrary.pullup,
                'bw_chinup': guideLibrary.chinup,
                'mach_lat_pulldown': guideLibrary.lat_pulldown,
                'mach_straight_arm_pulldown': guideLibrary.straight_arm_pulldown,

                // Face Pull
                'mach_face_pull': guideLibrary.face_pull,

                // Biceps
                'db_hammer_curl': guideLibrary.curl,
                'db_incline_curl': guideLibrary.incline_curl,
                'bb_biceps_curl': guideLibrary.curl,
                'mach_cable_biceps': guideLibrary.curl,

                // Core, Carries & Rotations
                'db_farmers_walk': guideLibrary.farmers_walk,
                'db_suitcase_carry': guideLibrary.suitcase_carry,
                'db_russian_twist': guideLibrary.russian_twist,
                'mach_cable_woodchopper': guideLibrary.cable_woodchopper,
                'bw_plank': guideLibrary.plank,
                'bw_hollow_body': guideLibrary.hollow_body,
                'bw_mountain_climber': guideLibrary.mountain_climber,
                'bw_hanging_knee_raise': guideLibrary.hanging_knee_raise,
                'kb_windmill': guideLibrary.windmill,
                'kb_turkish_getup': { form: 'assets/exercises/kb_turkish_getup.webp', anatomi: null },

                // Kompleks & Fonksiyonel Akışlar (Gerçek Animasyonlu Kılavuzlar)
                'db_clean_squat_press': { form: 'assets/exercises/db_clean_squat_press.webp', anatomi: null },
                'db_swing_to_goblet_squat': { form: 'assets/exercises/db_swing_to_goblet_squat.webp', anatomi: null },
                'db_rdl_to_high_pull': { form: 'assets/exercises/db_rdl_to_high_pull.webp', anatomi: null },
                'db_lunge_to_curl_press': { form: 'assets/exercises/db_lunge_to_curl_press.webp', anatomi: null },
                'bw_inchworm_to_pushup': { form: 'assets/exercises/bw_inchworm_to_pushup.webp', anatomi: null },
                'db_gorilla_row_to_clean': { form: 'assets/exercises/db_gorilla_row_to_clean.webp', anatomi: null },
                'db_floor_press_to_bridge': { form: 'assets/exercises/db_floor_press_to_bridge.webp', anatomi: null },
                'db_step_back_lunge_to_knee_drive': { form: 'assets/exercises/db_step_back_lunge_to_knee_drive.webp', anatomi: null },
                'db_pullover_to_halo': { form: 'assets/exercises/db_pullover_to_halo.webp', anatomi: null },
                'db_seesaw_lunge': { form: 'assets/exercises/db_seesaw_lunge.webp', anatomi: null },
                'db_rotational_lunge_chop': { form: 'assets/exercises/db_rotational_lunge_chop.webp', anatomi: null },
                'db_rotational_gorilla_row': { form: 'assets/exercises/db_rotational_gorilla_row.webp', anatomi: null },
                'db_single_arm_rear_delt_row': { form: 'assets/exercises/db_single_arm_rear_delt_row.gif', anatomi: null },
                'db_high_pull_cuban_rotation': { form: 'assets/exercises/db_high_pull_cuban_rotation.gif', anatomi: null },
                'db_dumbbell_shrug_burnout': { form: 'assets/exercises/db_dumbbell_shrug_burnout.webp', anatomi: null },
                'db_quadruped_external_rotation': { form: 'assets/exercises/db_quadruped_external_rotation.webp', anatomi: null },
                'bw_jumping_jack': { form: 'assets/exercises/bw_jumping_jack.gif', anatomi: null },
                'bw_high_knees': { form: 'assets/exercises/bw_high_knees.webp', anatomi: null },
                'bw_jump_rope': { form: 'assets/exercises/bw_jump_rope.webp', anatomi: null },
                'bw_butt_kicks': { form: 'assets/exercises/bw_butt_kicks.webp', anatomi: null },
                'bw_skater_jumps': { form: 'assets/exercises/bw_skater_jumps.webp', anatomi: null },
                'bw_plank_jacks': { form: 'assets/exercises/bw_plank_jacks.webp', anatomi: null },
                'bw_squat_thrust': { form: 'assets/exercises/bw_squat_thrust.webp', anatomi: null },
                'bw_lateral_shuffle': { form: 'assets/exercises/bw_lateral_shuffle.webp', anatomi: null }
            };
        window.guideLibrary = guideLibrary;
        window.exerciseGuideMap = exerciseGuideMap;

        function renderExercisePositionsHtml(exInput, uniquePrefix = '', defaultCollapsed = false) {
            if (!exInput) return '';
            const ex = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) 
                ? (EXERCISES_DB.find(e => e.id === exInput.id) || exInput)
                : exInput;

            if (!ex.positions || !Array.isArray(ex.positions) || ex.positions.length === 0) {
                return '';
            }

            const isComplex = !!ex.isComplex;
            const badgeType = isComplex ? 'pos-badge-complex' : 'pos-badge-standard';
            const typeLabel = isComplex 
                ? `🔥 Kompleks Hareket (${ex.positions.length} Aşama)` 
                : `📐 3 Aşamalı Form Kılavuzu`;

            const collapseId = `posGuide_${uniquePrefix}_${ex.id}`.replace(/[^a-zA-Z0-9_-]/g, '_');

            const badgeStyles = {
                setup: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.35)', icon: '🟢' },
                action: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)', icon: '⚡' },
                trans: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.35)', icon: '🔄' },
                finish: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.35)', icon: '🏁' }
            };

            const stepsHtml = ex.positions.map((p, idx) => {
                const style = badgeStyles[p.badge] || badgeStyles.setup;
                return `
                    <div class="pos-step-card">
                        <div class="pos-step-header" style="background:${style.bg}; border-color:${style.border}; color:${style.text};">
                            <span>${style.icon} ${escapeHTML(p.phase)}</span>
                        </div>
                        <div class="pos-step-desc">
                            ${escapeHTML(p.desc)}
                        </div>
                    </div>
                `;
            }).join('');

            // Egzersize ait gerçek fotoğraf kılavuzunu al
            const activeGuideMap = (typeof window !== 'undefined' && window.exerciseGuideMap) 
                ? window.exerciseGuideMap 
                : (typeof exerciseGuideMap !== 'undefined' ? exerciseGuideMap : {});
            const exactPhoto = (activeGuideMap && activeGuideMap[ex.id]) || (exerciseGuideMap && exerciseGuideMap[ex.id]) || null;

            const diagramPath = ex.diagram || null;
            // Öncelik: Gerçek fotoğraf rehberi; fotoğraf yoksa vektörel diyagram
            const visualSrc = (exactPhoto && exactPhoto.form) ? exactPhoto.form : diagramPath;
            const isSvgDiagram = !!(visualSrc && visualSrc.toLowerCase().endsWith('.svg'));
            const hasVisual = !!visualSrc;
            const hasAnatomy = !!(exactPhoto && exactPhoto.anatomi);
            const hasPhotoGuide = !!(exactPhoto && exactPhoto.form && ex.id !== 'db_hammer_curl');

            const extraInfoId = `extra_info_${collapseId}`;
            const extraInfoHtml = `
                <div class="pos-extra-info-container">
                    <button type="button" class="btn-toggle-pos-info" onclick="event.stopPropagation(); togglePosExtraInfo('${extraInfoId}')" id="btn_${extraInfoId}">
                        <span>ℹ️ Kas Grupları &amp; Form / Güvenlik İpuçları</span>
                        <span class="pos-info-arrow" id="arrow_${extraInfoId}">▼ Göster</span>
                    </button>
                    <div class="pos-extra-info-body" id="body_${extraInfoId}" style="display:none; margin-top:8px;">
                        <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:8px; padding:8px 10px; margin-bottom:8px;">
                            <div style="font-size:10.5px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-bottom:5px;">🎯 Çalıştırılan Kas Grupları:</div>
                            <div style="display:flex; flex-wrap:wrap; gap:5px;">
                                ${(ex.primaryMuscles || []).map(m => `<span style="background:rgba(245,158,11,0.2); color:var(--gold); border:1px solid rgba(245,158,11,0.4); padding:2px 7px; border-radius:10px; font-size:10.5px; font-weight:800;">${(typeof STUDIO_REGION_MAP !== 'undefined' && STUDIO_REGION_MAP[m] ? STUDIO_REGION_MAP[m].icon + ' ' + STUDIO_REGION_MAP[m].name : m)} (Primer)</span>`).join('')}
                                ${(ex.secondaryMuscles || []).map(m => `<span style="background:rgba(56,189,248,0.15); color:var(--cyan); border:1px solid rgba(56,189,248,0.35); padding:2px 7px; border-radius:10px; font-size:10.5px; font-weight:700;">${(typeof STUDIO_REGION_MAP !== 'undefined' && STUDIO_REGION_MAP[m] ? STUDIO_REGION_MAP[m].icon + ' ' + STUDIO_REGION_MAP[m].name : m)} (Sekonder)</span>`).join('')}
                            </div>
                        </div>
                        ${ex.cue ? `
                            <div style="font-size:11.5px; color:#92400E; background:rgba(234,179,8,0.12); border-left:3px solid #eab308; padding:7px 10px; border-radius:6px; margin-bottom:6px; line-height:1.4;">
                                ⚠️ <strong>Kritik Form &amp; Güvenlik Uyarısı:</strong> ${escapeHTML(ex.cue)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            let formVisualHtml = '';
            if (hasVisual) {
                const visualTitle = isSvgDiagram ? `${escapeHTML(ex.name)} - Form Diyagramı` : `${escapeHTML(ex.name)} - Form Rehberi`;
                const scrollText = isSvgDiagram ? '↔️ Akış diyagramını sağa/sola kaydırarak inceleyin' : '↔️ Adımları yakından incelemek için sağa/sola kaydırın';
                formVisualHtml = `
                    <div class="pos-diagram-wrap" id="wrap_form_${collapseId}">
                        <div class="pos-diagram-toolbar">
                            <button type="button" class="btn-diagram-tool btn-scroll-toggle" onclick="event.stopPropagation(); toggleDiagramScroll('wrap_form_${collapseId}')" title="Genişlet ve parmakla sağa-sola kaydırarak incele">
                                <span class="tool-icon">↔️</span> <span class="tool-text">Kaydırarak Büyüt</span>
                            </button>
                            <button type="button" class="btn-diagram-tool" onclick="event.stopPropagation(); openImageLightbox(decodeURIComponent('${encodeURIComponent(visualSrc)}'), decodeURIComponent('${encodeURIComponent(visualTitle)}'))" title="Tam ekran mod">
                                <span class="tool-icon">⛶</span> <span class="tool-text">Tam Ekran</span>
                            </button>
                            <button type="button" class="btn-diagram-tool btn-report-bug" onclick="event.stopPropagation(); openExerciseBugReportModal(decodeURIComponent('${encodeURIComponent(ex.id)}'), decodeURIComponent('${encodeURIComponent(ex.name || '')}'), decodeURIComponent('${encodeURIComponent(visualSrc || '')}'), decodeURIComponent('${encodeURIComponent(ex.equipment || '')}'), decodeURIComponent('${encodeURIComponent(ex.muscle || '')}'))" title="Görsel veya hareket hatalıysa Firebase hata havuzuna bildir">
                                <span class="tool-icon">⚠️</span> <span class="tool-text">Hata Bildir</span>
                            </button>
                        </div>
                        <div class="pos-diagram-img-box" onclick="event.stopPropagation(); openImageLightbox(decodeURIComponent('${encodeURIComponent(visualSrc)}'), decodeURIComponent('${encodeURIComponent(visualTitle)}'))">
                            <img src="${visualSrc}" alt="${visualTitle}" class="pos-diagram-img" loading="lazy">
                            <div class="pos-diagram-zoom-hint">🔍 Dokun: Büyüt</div>
                        </div>
                        <div class="pos-diagram-scroll-indicator">
                            ${scrollText}
                        </div>
                    </div>
                    ${extraInfoHtml}
                `;
            } else {
                formVisualHtml = extraInfoHtml;
            }

            let anatomiVisualHtml = '';
            if (hasAnatomy) {
                anatomiVisualHtml = `
                    <div class="pos-diagram-wrap" id="wrap_anatomi_${collapseId}">
                        <div class="pos-diagram-toolbar">
                            <button type="button" class="btn-diagram-tool btn-scroll-toggle" onclick="event.stopPropagation(); toggleDiagramScroll('wrap_anatomi_${collapseId}')" title="Genişlet ve incele">
                                <span class="tool-icon">↔️</span> <span class="tool-text">Kaydırarak Büyüt</span>
                            </button>
                            <button type="button" class="btn-diagram-tool" onclick="event.stopPropagation(); openImageLightbox(decodeURIComponent('${encodeURIComponent(exactPhoto.anatomi)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - Hedef Kas Anatomisi')}'))" title="Tam ekran mod">
                                <span class="tool-icon">⛶</span> <span class="tool-text">Tam Ekran</span>
                            </button>
                        </div>
                        <div class="pos-diagram-img-box" onclick="event.stopPropagation(); openImageLightbox(decodeURIComponent('${encodeURIComponent(exactPhoto.anatomi)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - Hedef Kas Anatomisi')}'))">
                            <img src="${exactPhoto.anatomi}" alt="${escapeHTML(ex.name)} Hedef Kaslar" class="pos-diagram-img" loading="lazy">
                            <div class="pos-diagram-zoom-hint">🔍 Dokun: Büyüt</div>
                        </div>
                        <div class="pos-diagram-scroll-indicator">
                            ↔️ Kas gruplarını incelemek için sağa/sola kaydırın
                        </div>
                    </div>
                `;
            } else {
                anatomiVisualHtml = `
                    <div style="background:#F8FAFC; border-radius:8px; padding:16px; text-align:center; color:var(--text-secondary); font-size:12px;">
                        🎯 <strong>Hedeflenen Kas Grubu:</strong> <span style="color:var(--gold); font-weight:800;">${escapeHTML(ex.muscle || '')}</span>
                    </div>
                `;
            }

            const openGymMedia = (typeof window !== 'undefined' && window.OPENGYM_GLOBAL_CATALOG && window.OPENGYM_GLOBAL_CATALOG[ex.id]) ? window.OPENGYM_GLOBAL_CATALOG[ex.id] : null;
            const hasOpenGym = !!openGymMedia;

            const contentClass = defaultCollapsed ? 'pos-guide-content collapsed' : 'pos-guide-content';
            const btnText = defaultCollapsed ? '📖 Formu Gör ▼' : '📖 Formu Gizle ▲';

            return `
                <div class="pos-guide-wrapper">
                    <div class="pos-guide-header" onclick="event.stopPropagation(); togglePosGuide('${collapseId}')" style="padding:6px 10px;">
                        <span class="pos-type-badge ${badgeType}" style="padding:3px 8px; font-size:11px;">📐 Form Kılavuzu</span>
                        <button type="button" class="btn-toggle-guide" id="btn_${collapseId}" onclick="event.stopPropagation(); togglePosGuide('${collapseId}')" style="padding:3px 8px; font-size:11.5px;">
                            <span id="icon_${collapseId}">${btnText}</span>
                        </button>
                    </div>
                    <div class="${contentClass}" id="${collapseId}">
                        <!-- TABS SWITCHER (BASİT İKONLAR) -->
                        <div class="guide-toggle-tabs" style="display:flex; justify-content:center; gap:6px; padding:4px;">
                            ${hasOpenGym ? `
                                <button type="button" class="btn-guide-tab active" id="tab_btn_animasyon_${collapseId}" onclick="event.stopPropagation(); switchGuideTab('${collapseId}', 'animasyon')" title="Canlı Hareket Animasyonu" style="padding:5px 12px; font-size:12px; font-weight:800; background:rgba(56,189,248,0.15); color:var(--cyan); border:1px solid rgba(56,189,248,0.35);">
                                    🎬 Animasyon
                                </button>
                            ` : ''}
                            ${hasVisual ? `
                                <button type="button" class="btn-guide-tab ${!hasOpenGym ? 'active' : ''}" id="tab_btn_form_${collapseId}" onclick="event.stopPropagation(); switchGuideTab('${collapseId}', 'form')" title="${isSvgDiagram ? 'Form Diyagramı' : 'Form Rehberi'}" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                    ${isSvgDiagram ? '📐 Diyagram' : (hasOpenGym ? '📸 Fotoğraf' : '📸 Form')}
                                </button>
                            ` : ''}
                            <button type="button" class="btn-guide-tab ${(!hasOpenGym && !hasVisual) ? 'active' : ''}" id="tab_btn_anatomi_${collapseId}" onclick="event.stopPropagation(); switchGuideTab('${collapseId}', 'anatomi')" title="Çalışan Kaslar" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                🧬 Kaslar
                            </button>
                            <button type="button" class="btn-guide-tab" id="tab_btn_adimlar_${collapseId}" onclick="event.stopPropagation(); switchGuideTab('${collapseId}', 'adimlar')" title="Adım Adım Talimatlar" style="padding:5px 12px; font-size:12px; font-weight:800;">
                                📝 Adımlar
                            </button>
                        </div>

                        ${hasOpenGym ? `
                            <!-- PANEL 0: OPENGYM ANIMATION -->
                            <div class="guide-tab-panel active" id="panel_animasyon_${collapseId}">
                                <div class="pos-diagram-wrap" id="wrap_anim_${collapseId}" style="position:relative; background:#000; border-radius:12px; overflow:hidden; border:1px solid rgba(56,189,248,0.3); padding:4px;">
                                    <div class="pos-diagram-toolbar">
                                        <button type="button" class="btn-diagram-tool" onclick="event.stopPropagation(); openImageLightbox(decodeURIComponent('${encodeURIComponent(openGymMedia.clip)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - Canlı Animasyon')}'))" title="Tam ekran oynat">
                                            <span class="tool-icon">⛶</span> <span class="tool-text">Büyüt</span>
                                        </button>
                                        ${hasPhotoGuide ? `
                                            <button type="button" class="btn-diagram-tool" onclick="event.stopPropagation(); switchGuideTab('${collapseId}', 'form')" title="Fotoğraf rehberine bak">
                                                <span class="tool-icon">📸</span> <span class="tool-text">Fotoğrafa Geç</span>
                                            </button>
                                        ` : ''}
                                    </div>
                                    <div style="cursor:pointer; display:flex; justify-content:center; align-items:center; min-height:200px; max-height:280px;" onclick="event.stopPropagation(); openImageLightbox(decodeURIComponent('${encodeURIComponent(openGymMedia.clip)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - Canlı Animasyon')}'))">
                                        <video src="${openGymMedia.clip}" poster="${openGymMedia.still}" autoplay loop muted playsinline style="width:100%; max-height:260px; object-fit:contain; display:block;" onerror="this.style.display='none'; const st=document.getElementById('still_fallback_${collapseId}'); if(st) st.style.display='block';"></video>
                                        <img id="still_fallback_${collapseId}" src="${openGymMedia.still}" alt="${escapeHTML(ex.name)}" style="display:none; width:100%; max-height:260px; object-fit:contain;">
                                    </div>
                                    <div style="font-size:11px; color:#0369A1; font-weight:700; padding:6px 10px; background:#F1F5F9; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #CBD5E1;">
                                        <span>⚡ OpenGym Doğrulanmış Animasyon</span>
                                        <span style="color:var(--text-secondary); font-size:10px;">🔍 Dokun: Büyüt</span>
                                    </div>
                                </div>
                                ${extraInfoHtml}
                            </div>
                        ` : ''}

                        <!-- PANEL 1: FORM PHOTO / VECTOR -->
                        <div class="guide-tab-panel ${!hasOpenGym ? 'active' : ''}" id="panel_form_${collapseId}">
                            ${formVisualHtml}
                        </div>

                        <!-- PANEL 2: ANATOMY PHOTO -->
                        <div class="guide-tab-panel" id="panel_anatomi_${collapseId}">
                            ${anatomiVisualHtml}
                        </div>

                        <!-- PANEL 3: STEP-BY-STEP CARDS -->
                        <div class="guide-tab-panel" id="panel_adimlar_${collapseId}">
                            <div class="pos-steps-grid cols-${ex.positions.length}">
                                ${stepsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function openExerciseQuickInfoModal(exId) {
            const ex = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB) ? EXERCISES_DB.find(e => e.id === exId) : null)
                || (currentGeneratedWorkout && Array.isArray(currentGeneratedWorkout.exercises) ? currentGeneratedWorkout.exercises.find(e => e.id === exId) : null);
            if (!ex) return;

            const equipLabels = {
                dumbbell: 'Dambıl',
                kettlebell: 'Kettlebell',
                barbell: 'Barbell',
                machine: 'Makine/Kablo',
                bodyweight: 'Vücut Ağırlığı'
            };
            const anatomy = getExerciseAnatomy(ex);
            const equipText = (typeof formatExerciseEquipmentText === 'function' ? formatExerciseEquipmentText(ex) : '') || equipLabels[ex.equipment] || ex.equipment || '';
            const primaryText = anatomy.primary || ex.muscle || '';
            const secondaryText = anatomy.secondary || '';

            let overlay = document.getElementById('wkExQuickInfoModalOverlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'wkExQuickInfoModalOverlay';
                overlay.className = 'wk-info-modal-overlay';
                overlay.onclick = function(e) {
                    if (e.target === overlay) closeExerciseQuickInfoModal();
                };
                document.body.appendChild(overlay);
            }

            overlay.innerHTML = `
                <div class="wk-info-modal-box">
                    <div class="wk-info-modal-header">
                        <div style="display:flex; align-items:center; gap:7px; min-width:0;">
                            <span class="wk-i-badge">i</span>
                            <strong style="font-size:14px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(ex.name)}</strong>
                        </div>
                        <button type="button" class="wk-info-modal-close" onclick="closeExerciseQuickInfoModal()" aria-label="Kapat">✕</button>
                    </div>
                    <div class="wk-info-modal-body" style="display:flex; flex-direction:column; gap:8px;">
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                            <span class="wk-drawer-pill equip">🏋️ ${escapeHTML(equipText)}</span>
                            <span class="wk-drawer-pill primary">🎯 ${escapeHTML(primaryText)}</span>
                            ${secondaryText ? `<span class="wk-drawer-pill secondary">⚡ ${escapeHTML(secondaryText)}</span>` : ''}
                        </div>
                        ${ex.cue ? `
                            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-left:3px solid #FF5A36; border-radius:8px; padding:9px 11px; font-size:12px; color:#0F172A; line-height:1.45;">
                                💡 <strong>Altın Kural:</strong> ${escapeHTML(ex.cue)}
                            </div>
                        ` : ''}
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-top:4px; flex-wrap:wrap;">
                            <div style="display:flex; gap:6px;">
                                <button type="button" class="wk-chip-action" style="padding:5px 10px; font-size:11px;" onclick="closeExerciseQuickInfoModal(); openExerciseDetailModal('${ex.id}')">
                                    🎥 Tam Rehber
                                </button>
                                <button type="button" class="wk-chip-action" style="padding:5px 10px; font-size:11px; color:#64748B;" onclick="closeExerciseQuickInfoModal(); toggleExerciseExclusionAndRefresh('${ex.id}')">
                                    ${(typeof isExerciseExcluded === 'function' && isExerciseExcluded(ex.id)) ? '🔄 Havuza Geri Al' : '👁️ Havuzdan Gizle'}
                                </button>
                            </div>
                            <button type="button" class="btn-report-mini" style="padding:5px 10px; font-size:11px; height:auto;" onclick="closeExerciseQuickInfoModal(); openExerciseBugReportModal(decodeURIComponent('${encodeURIComponent(ex.id)}'), decodeURIComponent('${encodeURIComponent(ex.name || '')}'), '', decodeURIComponent('${encodeURIComponent(ex.equipment || '')}'), decodeURIComponent('${encodeURIComponent(ex.muscle || '')}'), 'Kütüphane')">
                                ⚠️ Bildir
                            </button>
                        </div>
                    </div>
                </div>
            `;
            overlay.style.display = 'flex';
        }
        window.openExerciseQuickInfoModal = openExerciseQuickInfoModal;

        function closeExerciseQuickInfoModal() {
            const overlay = document.getElementById('wkExQuickInfoModalOverlay');
            if (overlay) overlay.style.display = 'none';
        }
        window.closeExerciseQuickInfoModal = closeExerciseQuickInfoModal;

        function renderSingleExerciseCard(ex, label, scheme, weights, scope = 'generated') {
            return `
                <div class="ex-card wk-drawer-clean-card" id="card_${ex.id}">
                    ${renderExercisePositionsHtml(ex, `${scope}_${label}`, false)}

                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap; margin-top:8px; padding-top:8px; border-top:1px dashed #E2E8F0;">
                        <button class="btn-swap-ex" style="color:#DC2626; border-color:rgba(239,68,68,0.3); padding:5px 9px; font-size:11.5px;" onclick="removeExerciseFromWorkout('${ex.id}', '${scope}')" title="Bu hareketi kaldır">
                            🗑️ Kaldır
                        </button>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button class="btn-swap-ex" style="padding:5px 9px; font-size:11.5px;" onclick="openAlternativeModal('${ex.id}', '${scope}')" title="Listeden alternatif seç">
                                📋 Alternatif Seç
                            </button>
                            <button class="btn-swap-ex" style="padding:5px 9px; font-size:11.5px;" onclick="swapSingleExercise('${ex.id}', '${scope}')" title="Rastgele başka hareket ver">
                                🎲 Rastgele
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // ==================== EXERCISE PICKER & ALTERNATIVE MODAL LOGIC ====================
        const PICKER_MUSCLE_GROUPS = [
            { key: 'chest', name: 'Göğüs', icon: '🛡️', category: 'push' },
            { key: 'back', name: 'Sırt & Kanat', icon: '🏹', category: 'pull' },
            { key: 'shoulders', name: 'Omuz', icon: '⚔️', category: 'push' },
            { key: 'quads', name: 'Ön Bacak (Quad)', icon: '🦵', category: 'legs_quad' },
            { key: 'hamstrings', name: 'Arka Bacak (Hamstring)', icon: '🦿', category: 'legs_hinge' },
            { key: 'glutes', name: 'Kalça (Glute)', icon: '🍑', category: 'legs_hinge' },
            { key: 'biceps', name: 'Biceps (Pazı)', icon: '💪', category: 'pull' },
            { key: 'triceps', name: 'Triceps (Arka Kol)', icon: '⚡', category: 'push' },
            { key: 'core', name: 'Karın & Core', icon: '🧱', category: 'core' },
            { key: 'calves', name: 'Kalf & Alt Bacak', icon: '🦶', category: 'legs' }
        ];

        const EQUIP_LABELS = {
            dumbbell: { label: 'Dambıl', icon: '🏋️' },
            kettlebell: { label: 'Kettlebell', icon: '🔔' },
            barbell: { label: 'Barbell', icon: '⚡' },
            machine: { label: 'Makine/Kablo', icon: '⚙️' },
            bodyweight: { label: 'Vücut Ağırlığı', icon: '🤸' }
        };

        let pickerContext = {
            mode: 'replace', // 'replace' or 'add'
            targetExId: null,
            scope: 'studio', // 'studio', 'day_schedule', 'generated', 'active'
            studioIndex: null,
            dayIdx: null,
            scheduleExIndex: null,
            currentTab: 'same_muscle', // 'same_muscle', 'other_muscle', 'catalog'
            sameEquipFilter: 'all',
            otherSelectedMuscle: 'chest',
            categoryFilter: 'all',
            searchQuery: ''
        };

        function showToast(msg, type = 'success') {
            const oldToast = document.getElementById('appGlobalToast');
            if (oldToast) oldToast.remove();
            if (typeof window.pushAppNotification === 'function') {
                window.pushAppNotification(msg, type);
            }
        }
        window.showToast = showToast;

        function openStudioExerciseAlternativeModal(studioIndex) {
            const item = customRoutineState.exercises[studioIndex];
            if (!item) return;
            const currentEx = EXERCISES_DB.find(e => e.id === item.exId);
            if (!currentEx) return;

            const primaryM = (currentEx.primaryMuscles && currentEx.primaryMuscles[0]) || 'chest';

            pickerContext = {
                mode: 'replace',
                targetExId: currentEx.id,
                scope: 'studio',
                studioIndex: studioIndex,
                dayIdx: null,
                scheduleExIndex: null,
                currentTab: 'same_muscle',
                sameEquipFilter: 'all',
                reasonFilter: 'all',
                otherSelectedMuscle: primaryM,
                categoryFilter: 'all',
                searchQuery: ''
            };

            setupAlternativeModalUI(currentEx);
            document.getElementById('exercisePickerModal').classList.add('active');
        }

        // ==================== GEMINI AI BIOMECHANICAL COACH ENGINE ====================

        let isFetchingCloudAiConfig = false;

        function isCurrentUserAdmin() {
            const user = typeof getActiveUser === 'function' ? getActiveUser() : null;
            return !!(user && user.role === 'admin');
        }

        function getGeminiApiKey() {
            let key = (localStorage.getItem(GEMINI_API_STORAGE_KEY) || '').trim();
            if (!key) {
                const adminKey = (localStorage.getItem(`${GEMINI_API_STORAGE_KEY}_usr_admin`) || '').trim();
                if (adminKey) {
                    key = adminKey;
                    localStorage.setItem(GEMINI_API_STORAGE_KEY, adminKey);
                }
            }
            if (!key && typeof getAuthUsers === 'function') {
                const users = getAuthUsers();
                const adminUser = Array.isArray(users) ? users.find(u => u.role === 'admin' && u.geminiApiKey) : null;
                if (adminUser && adminUser.geminiApiKey) {
                    key = adminUser.geminiApiKey.trim();
                    localStorage.setItem(GEMINI_API_STORAGE_KEY, key);
                }
            }
            if (!key && !isFetchingCloudAiConfig) {
                // Arka planda tüm sporcular için sistem AI motorunu hazır tut
                fastFetchCloudAiConfig();
            }
            return key;
        }

        async function fastFetchCloudAiConfig() {
            if (isFetchingCloudAiConfig) return '';
            const existingKey = (localStorage.getItem(GEMINI_API_STORAGE_KEY) || '').trim();
            if (existingKey) return existingKey;

            isFetchingCloudAiConfig = true;
            try {
                const endpoint = 'https://firestore.googleapis.com/v1/projects/fitness-4f427/databases/(default)/documents/app_system/ai_config?key=' + (typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG.apiKey : '');
                const res = await fetch(endpoint);
                if (res.ok) {
                    const doc = await res.json();
                    const cloudKey = doc?.fields?.geminiApiKey?.stringValue?.trim();
                    if (cloudKey) {
                        localStorage.setItem(GEMINI_API_STORAGE_KEY, cloudKey);
                        if (typeof updateProfileGeminiStatusUI === 'function') updateProfileGeminiStatusUI();
                        const curEx = (typeof pickerContext !== 'undefined' && pickerContext && pickerContext.targetExId) ? EXERCISES_DB.find(e => e.id === pickerContext.targetExId) : null;
                        if (typeof updateGeminiAiModalUI === 'function') updateGeminiAiModalUI(curEx);
                        return cloudKey;
                    }
                }
            } catch (e) {
                console.warn("Hızlı AI anahtarı senkronu:", e);
            } finally {
                isFetchingCloudAiConfig = false;
            }
            return '';
        }

        function setGeminiApiKey(key, syncCloud = true) {
            if (!isCurrentUserAdmin()) return;
            const cleanKey = (key || '').trim();
            if (!cleanKey) {
                localStorage.removeItem(GEMINI_API_STORAGE_KEY);
                localStorage.removeItem(`${GEMINI_API_STORAGE_KEY}_usr_admin`);
            } else {
                localStorage.setItem(GEMINI_API_STORAGE_KEY, cleanKey);
                localStorage.setItem(`${GEMINI_API_STORAGE_KEY}_usr_admin`, cleanKey);
            }

            if (syncCloud && typeof getActiveUser === 'function') {
                const user = getActiveUser();
                if (user && user.role === 'admin') {
                    user.geminiApiKey = cleanKey;
                    const users = typeof getAuthUsers === 'function' ? getAuthUsers() : [];
                    const idx = users.findIndex(u => u.id === user.id);
                    if (idx !== -1) {
                        users[idx] = user;
                        if (typeof saveAuthUsers === 'function') saveAuthUsers(users);
                        if (typeof syncUsersToCloud === 'function') syncUsersToCloud(users);
                    }
                }
            }

            updateProfileGeminiStatusUI();
            const curEx = (pickerContext && pickerContext.targetExId) ? EXERCISES_DB.find(e => e.id === pickerContext.targetExId) : null;
            updateGeminiAiModalUI(curEx);
        }

        function updateProfileGeminiStatusUI() {
            const badge = document.getElementById('profileGeminiStatusBadge');
            const input = document.getElementById('profileGeminiApiKeyInput');
            const adminControls = document.getElementById('profileGeminiAdminControls');
            const modalEditBtn = document.getElementById('btnEditGeminiKeyModal');
            const isAdmin = isCurrentUserAdmin();
            const key = getGeminiApiKey();

            if (adminControls) {
                adminControls.style.display = isAdmin ? 'block' : 'none';
            }
            if (modalEditBtn) {
                modalEditBtn.style.display = isAdmin ? 'inline-block' : 'none';
            }

            if (input) {
                if (isAdmin) {
                    if (document.activeElement !== input) {
                        input.value = key;
                    }
                } else {
                    // Güvenlik: Yönetici olmayan sporcuların DOM'una API anahtarı asla yazılmaz
                    input.value = '';
                }
            }

            if (badge) {
                if (key) {
                    badge.innerText = '🟢 API Aktif (Gemini 3.8 Flash)';
                    badge.style.background = 'rgba(34, 197, 94, 0.15)';
                    badge.style.color = '#15803D';
                    badge.style.border = '1px solid rgba(34, 197, 94, 0.35)';
                } else {
                    badge.innerText = '⚪ Yapılandırılmadı';
                    badge.style.background = 'rgba(255, 255, 255, 0.08)';
                    badge.style.color = 'var(--text-secondary)';
                    badge.style.border = '1px solid var(--border)';
                }
            }
        }

        async function testAndSaveGeminiKeyFromProfile() {
            if (!isCurrentUserAdmin()) return;
            const input = document.getElementById('profileGeminiApiKeyInput');
            const key = input ? input.value.trim() : '';
            if (!key) {
                setGeminiApiKey('');
                showToast("ℹ️ Gemini API anahtarı temizlendi.");
                return;
            }

            showToast("⏳ Gemini API anahtarı test ediliyor...");
            try {
                const testResp = await callGeminiAPI("Biyomekanik test mesajı. Tek kelimeyle 'Hazır' de.", "Sen fitness koçusun.", key);
                if (testResp) {
                    setGeminiApiKey(key);
                    showToast("✅ Gemini API başarıyla doğrulandı ve kaydedildi!");
                }
            } catch (err) {
                alert("Gemini API Bağlantı Hatası:\n" + (err.message || err));
            }
        }

        async function saveGeminiApiKeyFromModal() {
            if (!isCurrentUserAdmin()) return;
            const input = document.getElementById('geminiApiKeyModalInput');
            const key = input ? input.value.trim() : '';
            if (!key) {
                alert("Lütfen geçerli bir Gemini API anahtarı girin.");
                return;
            }
            showToast("⏳ API anahtarı test ediliyor...");
            try {
                const testResp = await callGeminiAPI("Biyomekanik test mesajı. Tek kelimeyle 'Hazır' de.", "Sen fitness koçusun.", key);
                if (testResp) {
                    setGeminiApiKey(key);
                    showToast("✅ Gemini API başarıyla doğrulandı ve kaydedildi!");
                    const curEx = (pickerContext && pickerContext.targetExId) ? EXERCISES_DB.find(e => e.id === pickerContext.targetExId) : null;
                    updateGeminiAiModalUI(curEx);
                }
            } catch (err) {
                alert("Gemini API Bağlantı Hatası:\n" + (err.message || err));
            }
        }

        function editGeminiApiKey() {
            if (!isCurrentUserAdmin()) return;
            const curKey = getGeminiApiKey();
            const newKey = prompt("Google Gemini API Anahtarınızı güncelleyin (Silmek için boş bırakın):", curKey);
            if (newKey !== null) {
                setGeminiApiKey(newKey);
                showToast(newKey.trim() ? "✅ API Anahtarı güncellendi!" : "ℹ️ API Anahtarı silindi.");
            }
        }

        function updateGeminiAiModalUI(currentEx) {
            const missingBox = document.getElementById('geminiAiKeyMissingBox');
            const activeBox = document.getElementById('geminiAiActiveBox');
            const modalEditBtn = document.getElementById('btnEditGeminiKeyModal');
            const isAdmin = isCurrentUserAdmin();
            const key = getGeminiApiKey();

            if (modalEditBtn) {
                modalEditBtn.style.display = isAdmin ? 'inline-block' : 'none';
            }

            if (!key) {
                if (missingBox) missingBox.style.display = isAdmin ? 'block' : 'none';
                if (activeBox) activeBox.style.display = isAdmin ? 'none' : 'block';
                fastFetchCloudAiConfig();
            } else {
                if (missingBox) missingBox.style.display = 'none';
                if (activeBox) activeBox.style.display = 'block';
            }
        }

        let cachedGeminiWorkingModel = null;

        async function callGeminiAPI(prompt, systemInstruction = '', overrideKey = '', maxTokens = 3500) {
            let apiKey = overrideKey || getGeminiApiKey();
            if (!apiKey) {
                apiKey = await fastFetchCloudAiConfig();
            }
            if (!apiKey) throw new Error("Google Gemini API anahtarı eksik. Lütfen profilinizden veya modal üzerinden anahtar tanımlayın.");

            let candidateModels = [];
            if (cachedGeminiWorkingModel) {
                candidateModels.push(cachedGeminiWorkingModel);
            }

            // 1. Dinamik Model Keşfi: Bu API anahtarının ve bölgenin aktif desteklediği modelleri doğrudan Google'dan sorgula
            try {
                const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
                if (listResp.ok) {
                    const listData = await listResp.json();
                    if (listData && Array.isArray(listData.models)) {
                        const supported = listData.models
                            .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                            .map(m => m.name.replace(/^models\//, ''))
                            .filter(name => !/tts|image|vision|embedding|aqa|audio|robotics|computer-use|learnlm|gemma/i.test(name));
                        
                        // Gerçek ve kararlı Flash modellerini en öne al; omni/preview/exp modelleri sona bırak
                        const preferredFlash = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];
                        const prioritized = preferredFlash.filter(name => supported.includes(name));
                        const stableOtherFlash = supported.filter(m =>
                            m.includes('flash') && !preferredFlash.includes(m) && !/omni|preview|exp/i.test(m)
                        );
                        const stableOtherModels = supported.filter(m =>
                            !m.includes('flash') && !/omni|preview|exp/i.test(m)
                        );
                        const previewOrOmniModels = supported.filter(m =>
                            !prioritized.includes(m) && !stableOtherFlash.includes(m) && !stableOtherModels.includes(m)
                        );
                        const ordered = [...prioritized, ...stableOtherFlash, ...stableOtherModels, ...previewOrOmniModels];

                        ordered.forEach(m => {
                            if (!candidateModels.includes(m)) candidateModels.push(m);
                        });
                    }
                }
            } catch (e) {
                console.warn("Gemini model listesi sorgulanamadı, statik modellere geçiliyor:", e);
            }

            // Keşif başarısız olduysa veya modeller listelenemediyse denenmesi gereken güncel modeller
            const fallbackModels = [
                'gemini-3.8-flash',
                'gemini-flash-latest',
                'gemini-flash-lite-latest',
                'gemini-2.5-flash',
                'gemini-2.0-flash'
            ];
            fallbackModels.forEach(m => {
                if (!candidateModels.includes(m)) candidateModels.push(m);
            });

            let lastError = null;

            modelLoop: for (const model of candidateModels) {
                // Hem v1beta hem v1 sürümlerini dene
                const versions = ['v1beta', 'v1'];
                for (const ver of versions) {
                    const url = `https://generativelanguage.googleapis.com/${ver}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
                    const body = {
                        contents: [{
                            role: 'user',
                            parts: [{ text: prompt }]
                        }],
                        generationConfig: {
                            temperature: 0.35,
                            maxOutputTokens: maxTokens || 3500
                        }
                    };
                    if (systemInstruction) {
                        body.systemInstruction = {
                            parts: [{ text: systemInstruction }]
                        };
                    }

                    try {
                        const resp = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });

                        if (!resp.ok) {
                            const errData = await resp.json().catch(() => ({}));
                            const errMsg = (errData && errData.error && errData.error.message) || resp.statusText;
                            lastError = new Error(`Gemini API (${model}) [${resp.status}]: ${errMsg}`);
                            if (resp.status === 404 || resp.status === 400) {
                                // Bu sürümde veya model adında bulunamadı/uyumsuzsa sonraki sürüme veya modele geç
                                continue;
                            } else if (resp.status === 429 || resp.status === 503) {
                                // Kota veya geçici yoğunlukta sıradaki modele geç
                                break;
                            } else {
                                // Yetki (401, 403) hatasında tüm döngüyü durdur
                                break modelLoop;
                            }
                        }

                        const data = await resp.json();
                        const candidate = data?.candidates?.[0];
                        const text = candidate?.content?.parts?.[0]?.text;
                        if (text) {
                            cachedGeminiWorkingModel = model;
                            return text;
                        }
                    } catch (e) {
                        lastError = e;
                    }
                }
            }

            throw lastError || new Error("Gemini API yanıt üretemedi.");
        }

        function quickAskGemini(reasonType) {
            runGeminiExerciseAlternative(reasonType, '');
        }

        function submitGeminiCustomQuery() {
            const input = document.getElementById('geminiCustomQueryInput');
            const text = input ? input.value.trim() : '';
            if (!text) {
                alert("Lütfen sormak istediğiniz durumu veya sorunuzu yazın.");
                return;
            }
            runGeminiExerciseAlternative('custom', text);
        }

        async function runGeminiExerciseAlternative(reasonType, userCustomText) {
            const resArea = document.getElementById('geminiAiResponseArea');
            const currentEx = pickerContext.targetExId ? EXERCISES_DB.find(e => e.id === pickerContext.targetExId) : null;
            if (!currentEx) {
                alert("Değiştirilecek egzersiz bulunamadı.");
                return;
            }

            if (resArea) {
                resArea.style.display = 'block';
                resArea.innerHTML = `
                    <div style="text-align:center; padding:24px 14px; background:#F8FAFC; border-radius:8px; border:1px dashed #c084fc;">
                        <div style="font-size:24px; animation:spin 1s linear infinite; display:inline-block; margin-bottom:8px;">🧠</div>
                        <div style="font-size:12.5px; font-weight:800; color:#6B21A8;">Gemini Biyomekanik Motoru Analiz Ediyor...</div>
                        <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">"${escapeHTML(currentEx.name)}" için en güvenli ve bilimsel ikameler hesaplanıyor.</div>
                    </div>
                `;
            }

            const reasonDescriptions = {
                no_equip: `Salonda mevcut ekipman (${currentEx.equipment}) bulunmuyor veya istasyon dolu. Elimdeki dambıl, makine veya vücut ağırlığı ile aynı kas liflerini ateşleyecek birebir biyomekanik alternatif istiyorum.`,
                joint_pain: `Bu hareketi yaparken belimde veya eklemimde batma/hassasiyet hissediyorum. Omurgaya veya ekleme eksenel kompresyon (axial load) bindirmeyen, hedef kasları izole eden en güvenli alternatifi öner.`,
                easier: `Hareketi formunu tam çıkaramıyorum veya çok ağır/zor geldi. Biyomekanik motor öğrenmeyi sağlayan daha kontrollü, basit (regresyon) bir varyasyon öner.`,
                conditioning: `Bu hareketin kardiyovasküler, patlayıcı güç ve metabolik yakım etkisini koruyacak eşdeğer bir finisher/alternatif öner.`,
                custom: userCustomText
            };

            const userPromptText = reasonDescriptions[reasonType] || userCustomText || 'Uygun alternatif öner.';

            // Kütüphanemizden ilgili adayları Gemini'ye bağlam olarak veriyoruz (Master Pool SSOT)
            const candidates = EXERCISES_DB.filter(e => e.id !== currentEx.id && !isExerciseExcludedByUser(e.id));
            const candidateSummary = candidates.map(e => `ID:${e.id} | İsim:${e.name} | Ekipman:${e.equipment} | Patern:${e.category} | Kas:${e.muscle}`).join('\n');

            const systemInstruction = `Sen "Çelik Kodu (El Código del Acero)" metodolojisinin uzman Biyomekanik Koçusun.
Kullanıcı antrenman seansı sırasında, uzun metin okumadan hemen karar vermek istiyor.
DEĞİŞTİRİLECEK HAREKET:
- Adı: "${currentEx.name}"
- Ekipman: "${currentEx.equipment}"
- Patern/Kategori: "${currentEx.category}"
- Kas Grubu: "${currentEx.muscle}"

KULLANICININ DURUMU:
"${userPromptText}"

KÜTÜPHANEMİZDE BULUNAN TÜM HAREKETLER (YALNIZCA BU LİSTEDEN SEÇECEKSİN):
${candidateSummary}

KURALLAR:
1. HAREKET PATERNİNE VE KİNEMATİK ZİNCİRE KESİNLİKLE SADIK KAL! (Hip Hinge -> Swing/RDL; Squat -> diz dominant; İtiş -> itiş; Çekiş -> çekiş).
2. İstenmeyen/olmayan ekipmanı (${currentEx.equipment}) kesinlikle önerme. Bel/eklem hassasiyetinde omurgaya sıfır eksenel yük bindiren hareketleri seç.
3. KESİNLİKLE UZUN METİN, MAKALE VEYA PARAGRAF YAZMA! Kullanıcı sadece direkt öneri istiyor.
4. Önerdiğin 1 veya en fazla 2 hareketi MUTLAKA şu etiketle belirt: [[EX_ID:hareketin_id_si]]
5. Metin olarak YALNIZCA 1-2 CÜMLELİK çok kısa ve vurucu bir biyomekanik gerekçe yaz. (Örn: "Dambıl RDL, omurgaya eksenel kompresyon bindirmeden kalça ve hamstring liflerini birebir ateşler.")`;

            try {
                const aiResponse = await callGeminiAPI(`"${currentEx.name}" yerine kütüphanemizden en uygun 1-2 alternatifi seç. Uzun metin yazma, sadece etiketleri ([[EX_ID:id]]) ve 1-2 cümlelik çok kısa gerekçeni belirt.`, systemInstruction, '', 1000);
                renderGeminiAiResult(aiResponse, currentEx);
            } catch (err) {
                if (resArea) {
                    resArea.innerHTML = `
                        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:12px; font-size:11.5px; color:#DC2626;">
                            ⚠️ <strong>Gemini Bağlantı Hatası:</strong> ${escapeHTML(err.message || 'Bilinmeyen hata')}<br>
                            <span style="font-size:10.5px; color:var(--text-secondary); margin-top:4px; display:inline-block;">API anahtarınızın geçerli olduğundan ve internet bağlantınızdan emin olun.</span>
                        </div>
                    `;
                }
            }
        }

        function formatAiCoachInline(str) {
            return escapeHTML(str)
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0F172A; font-weight:700;">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em style="color:#d8b4fe;">$1</em>')
                .replace(/`([^`]+)`/g, '<code style="background:#FCE7F3; padding:1px 5px; border-radius:3px; font-size:11px; color:#9D174D; font-weight:700;">$1</code>');
        }

        function formatAiCoachMarkdown(text) {
            if (!text) return '';
            const lines = text.split('\n');
            let html = '';
            let inList = false;
            let listType = null;

            lines.forEach(line => {
                let trimmed = line.trim();
                if (!trimmed) {
                    if (inList) {
                        html += listType === 'ul' ? '</ul>' : '</ol>';
                        inList = false;
                        listType = null;
                    }
                    html += '<div style="height:4px;"></div>';
                    return;
                }

                // Başlıklar (###, ##, #)
                if (/^#{1,4}\s+/.test(trimmed)) {
                    if (inList) {
                        html += listType === 'ul' ? '</ul>' : '</ol>';
                        inList = false;
                        listType = null;
                    }
                    const headingText = trimmed.replace(/^#{1,4}\s+/, '');
                    html += `<div style="font-size:11.5px; font-weight:800; color:#6B21A8; margin-top:6px; margin-bottom:2px; display:flex; align-items:center; gap:5px;">
                        <span style="display:inline-block; width:3px; height:10px; background:#c084fc; border-radius:2px; flex-shrink:0;"></span>
                        <span>${formatAiCoachInline(headingText)}</span>
                    </div>`;
                    return;
                }

                // Madde listeleri (- , * , • )
                if (/^[-*•]\s+/.test(trimmed)) {
                    if (!inList || listType !== 'ul') {
                        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
                        html += '<ul style="margin:2px 0; padding-left:16px; list-style-type:disc;">';
                        inList = true;
                        listType = 'ul';
                    }
                    const itemText = trimmed.replace(/^[-*•]\s+/, '');
                    html += `<li style="margin-bottom:2px; line-height:1.4;">${formatAiCoachInline(itemText)}</li>`;
                    return;
                }

                // Numaralı listeler (1. , 2. )
                if (/^\d+[\.\)]\s+/.test(trimmed)) {
                    if (!inList || listType !== 'ol') {
                        if (inList) html += listType === 'ul' ? '</ul>' : '</ol>';
                        html += '<ol style="margin:2px 0; padding-left:16px;">';
                        inList = true;
                        listType = 'ol';
                    }
                    const itemText = trimmed.replace(/^\d+[\.\)]\s+/, '');
                    html += `<li style="margin-bottom:2px; line-height:1.4;">${formatAiCoachInline(itemText)}</li>`;
                    return;
                }

                // Düz paragraf satırı
                if (inList) {
                    html += listType === 'ul' ? '</ul>' : '</ol>';
                    inList = false;
                    listType = null;
                }
                html += `<p style="margin:2px 0; line-height:1.4;">${formatAiCoachInline(trimmed)}</p>`;
            });

            if (inList) {
                html += listType === 'ul' ? '</ul>' : '</ol>';
            }

            return html;
        }

        function renderGeminiAiResult(aiText, targetEx) {
            const resArea = document.getElementById('geminiAiResponseArea');
            if (!resArea) return;

            // Extract recommended exercise IDs using regex: [[EX_ID:ex_id]]
            const idMatches = [];
            const regex = /\[\[(?:EX_ID|ex_id)\s*:\s*([a-zA-Z0-9_\-]+)\]\]/gi;
            let m;
            while ((m = regex.exec(aiText)) !== null) {
                if (m[1] && !idMatches.includes(m[1])) {
                    idMatches.push(m[1]);
                }
            }

            // Fallback: If no tag was matched, check if any DB exercise name is mentioned directly
            if (idMatches.length === 0 && targetEx) {
                EXERCISES_DB.forEach(e => {
                    if (e.id !== targetEx.id && aiText.toLowerCase().includes(e.name.toLowerCase())) {
                        if (!idMatches.includes(e.id) && idMatches.length < 2) {
                            idMatches.push(e.id);
                        }
                    }
                });
            }

            // Clean text from tags for neat reading
            let cleanedText = aiText.replace(/\[\[(?:EX_ID|ex_id)\s*:\s*[a-zA-Z0-9_\-]+\]\]/gi, '').trim();
            let formattedHtml = formatAiCoachMarkdown(cleanedText);

            let cardsHtml = '';
            idMatches.forEach(exId => {
                const ex = EXERCISES_DB.find(e => e.id === exId);
                if (ex) {
                    const eqMeta = EQUIP_LABELS[ex.equipment] || { label: ex.equipment || '', icon: '🏋️' };
                    const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) || null;
                    const thumbImg = (guide && guide.form) ? guide.form : (ex.diagram || '');

                    cardsHtml += `
                        <div style="background:rgba(192, 132, 252, 0.08); border:1px solid rgba(192, 132, 252, 0.35); border-radius:8px; padding:10px 12px; margin-bottom:8px; box-shadow:0 2px 8px rgba(0,0,0,0.25);">
                            <!-- ÜST SATIR: TAM BAŞLIK, ROZETLER VE '✓ SEÇ' BUTONU -->
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                                <div style="flex:1; min-width:0;">
                                    <div style="font-size:9.5px; color:#7E22CE; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">ÖNERİLEN İKAME</div>
                                    <div style="font-size:14px; font-weight:800; color:#0F172A; line-height:1.25; margin:2px 0 3px 0; word-break:break-word;">
                                        ${escapeHTML(ex.name)}
                                    </div>
                                    <div style="font-size:10px; color:var(--text-secondary); display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
                                        <span style="color:#475569; font-weight:700;">${eqMeta.icon} ${eqMeta.label}</span>
                                        <span>•</span>
                                        <span style="color:var(--gold); font-weight:700;">${CANVA_ICONS.crosshair} ${escapeHTML(ex.muscle || '')}</span>
                                    </div>
                                </div>
                                <div style="flex-shrink:0;">
                                    <button type="button" class="btn btn-gold" style="font-size:12px; padding:6px 14px; font-weight:800; background:#9333ea; border-color:#a855f7; color:#FFFFFF; white-space:nowrap; box-shadow:0 0 10px rgba(168,85,247,0.35); border-radius:6px;" onclick="selectExerciseFromPicker('${ex.id}')">
                                        ✓ Seç
                                    </button>
                                </div>
                            </div>

                            <!-- FORM GÖRSELİ (GENİŞ, NET VE DETAYLI) -->
                            ${thumbImg ? `
                                <div style="width:100%; height:115px; border-radius:6px; background:#000; overflow:hidden; border:1px solid rgba(192,132,252,0.25); margin-top:8px; display:flex; align-items:center; justify-content:center; position:relative; cursor:pointer;" onclick="openExerciseDetailModal('${ex.id}')" title="Form rehberini incele">
                                    <img src="${thumbImg}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="${escapeHTML(ex.name)}" loading="lazy">
                                    <div style="position:absolute; bottom:4px; right:4px; background:#F8FAFC; backdrop-filter:blur(4px); border:1px solid #E2E8F0; border-radius:4px; padding:2px 6px; font-size:9.5px; color:#6B21A8; font-weight:700; display:flex; align-items:center; gap:3px;">
                                        <span>🔍 Büyüt / İncele</span>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- FORM İPUCU -->
                            ${ex.cue ? `<div style="font-size:10.5px; color:#6B21A8; margin-top:6px; background:#F8FAFC; padding:5px 8px; border-radius:4px; border:1px solid rgba(192,132,252,0.15); line-height:1.35;">💡 <strong>İpucu:</strong> ${escapeHTML(ex.cue)}</div>` : ''}
                        </div>
                    `;
                }
            });

            resArea.innerHTML = `
                <div style="background:#F8FAFC; border:1px solid rgba(192, 132, 252, 0.35); border-radius:10px; padding:10px 12px; margin-top:6px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(192,132,252,0.2); padding-bottom:5px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:15px;">🤖</span>
                            <span style="font-size:12px; font-weight:800; color:#6B21A8;">Gemini Biyomekanik İkameler</span>
                        </div>
                        <span style="font-size:9.5px; color:#7E22CE; background:rgba(192,132,252,0.15); padding:2px 6px; border-radius:4px; font-weight:700;">Hızlı Seçim</span>
                    </div>

                    <!-- 1. HAREKET KARTLARI (FORM GÖRSELİ + TAM İSİM + '✓ SEÇ' BUTONU) -->
                    ${cardsHtml ? `<div>${cardsHtml}</div>` : ''}

                    <!-- 2. İSTEĞE BAĞLI / KAPALI KOÇ GEREKÇESİ (ALAN KAZANMAK İÇİN VARSAYILAN GİZLİ) -->
                    ${cleanedText ? `
                        <div style="margin-top:6px;">
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:4px 8px; border:none; color:var(--text-secondary); width:100%; text-align:center; display:flex; align-items:center; justify-content:center; gap:4px; cursor:pointer;" onclick="const b = document.getElementById('aiCoachWhyBox'); if(b) b.style.display = b.style.display === 'none' ? 'block' : 'none';">
                                <span>💡 Biyomekanik Gerekçeyi Gör / Gizle</span>
                            </button>
                            <div id="aiCoachWhyBox" style="display:none; background:rgba(192, 132, 252, 0.06); border:1px solid rgba(192, 132, 252, 0.2); border-radius:6px; padding:8px 10px; margin-top:4px; font-size:10.5px; color:#475569; line-height:1.4;">
                                ${formattedHtml}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        function getAthleteDeficitProfileForAudit() {
            const allLogs = (typeof getWorkoutLogs === 'function') ? getWorkoutLogs() : [];
            const now = new Date();
            const ms4Weeks = 28 * 24 * 60 * 60 * 1000;
            const ms1Week = 7 * 24 * 60 * 60 * 1000;
            const cutoff28 = new Date(now.getTime() - ms4Weeks);
            const cutoff7 = new Date(now.getTime() - ms1Week);

            const monthLogs = allLogs.filter(l => l && l.date && new Date(l.date) >= cutoff28);
            const lastWeekLogs = allLogs.filter(l => l && l.date && new Date(l.date) >= cutoff7);

            // Kas gruplarını hesapla
            const monthMuscleSets = {};
            const lastWeekMuscleSets = {};
            const completedExercisesMap = {};

            monthLogs.forEach(log => {
                if (!Array.isArray(log.exercises)) return;
                const isLastWeek = log.date && new Date(log.date) >= cutoff7;

                log.exercises.forEach(ex => {
                    const exName = ex.name || 'Egzersiz';
                    completedExercisesMap[exName] = (completedExercisesMap[exName] || 0) + 1;

                    const spec = (typeof resolveExerciseBiomechanics === 'function')
                        ? resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category)
                        : null;
                    const primName = (spec && spec.primary) ? spec.primary : (ex.muscle || 'Genel');

                    const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                        ? Number(ex.completedSetsCount)
                        : (Array.isArray(ex.sets) ? ex.sets.filter(s => s && s.completed).length : (Number(ex.sets) || 3));

                    const setsToAdd = cSets > 0 ? cSets : 3;
                    monthMuscleSets[primName] = (monthMuscleSets[primName] || 0) + setsToAdd;
                    if (isLastWeek) {
                        lastWeekMuscleSets[primName] = (lastWeekMuscleSets[primName] || 0) + setsToAdd;
                    }
                });
            });

            // Standart kaslar
            const allStandardMuscles = ['Göğüs', 'Sırt', 'Omuz', 'Bacak', 'Ön Kol/Biceps', 'Arka Kol/Triceps', 'Karın/Core'];
            const neglectedLastWeek = [];
            const strongLastWeek = [];
            const neglectedMonth = [];

            allStandardMuscles.forEach(m => {
                const lwSets = lastWeekMuscleSets[m] || 0;
                const mSets = monthMuscleSets[m] || 0;

                if (lwSets === 0) neglectedLastWeek.push(m + ' (0 set)');
                else if (lwSets < 6) neglectedLastWeek.push(m + ' (' + lwSets + ' set - yetersiz)');
                else strongLastWeek.push(m + ' (' + lwSets + ' set)');

                if (mSets < 16) neglectedMonth.push(m + ' (aylık ' + mSets + ' set)');
            });

            let lastSessionNote = 'Son 48 saatte kayıtlı seans yok';
            if (allLogs.length > 0) {
                const sortedLogs = sortWorkoutLogsDesc([...allLogs]);
                const latest = sortedLogs[0];
                const latestDateObj = latest ? parseWorkoutLogDateLocal(latest) : null;
                if (latest && latestDateObj) {
                    const diffHours = Math.max(0, (now.getTime() - latestDateObj.getTime()) / (1000 * 60 * 60));
                    if (diffHours <= 54) {
                        const exNames = Array.isArray(latest.exercises) ? latest.exercises.slice(0, 4).map(e => e.name).join(', ') : '';
                        lastSessionNote = Math.round(diffHours) + ' saat önce yapıldı (' + (latest.title || latest.program || 'Seans') + ' - ' + exNames + ')';
                    }
                }
            }

            return {
                totalSessionsMonth: monthLogs.length,
                totalSessionsLastWeek: lastWeekLogs.length,
                neglectedLastWeek: neglectedLastWeek.length > 0 ? neglectedLastWeek.join(', ') : 'Tüm ana kaslar çalıştırıldı',
                strongLastWeek: strongLastWeek.length > 0 ? strongLastWeek.join(', ') : 'Düşük hacim',
                neglectedMonth: neglectedMonth.length > 0 ? neglectedMonth.join(', ') : 'Dengeli hacim dağılımı',
                lastSessionNote: lastSessionNote
            };
        }

        function buildAutoCoachThreeLineSummaryHtml(workout, scope = 'generated') {
            if (!workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0) return '';

            const ctx = workout.historyContext || (typeof getRecentAndScheduledMuscleContext === 'function' ? getRecentAndScheduledMuscleContext() : {});
            const exList = workout.exercises;

            // 1. Satır: Önceki Gün & Kas Koruması (48 Saat / Ardışık Gün Koruması)
            const protectedList = []
                .concat(Array.isArray(ctx.fatiguedMuscles48h) ? ctx.fatiguedMuscles48h : [])
                .concat(Array.isArray(ctx.prevDayMuscles) ? ctx.prevDayMuscles : []);
            const uniqueProtected = [...new Set(protectedList.filter(Boolean))].slice(0, 3);
            const spinalNote = ctx.hadSpinalHinge48h ? 'alt bel makaslama yükü kesildi' : 'omurga binmesi dengelendi';

            const line1 = uniqueProtected.length > 0
                ? `${uniqueProtected.join(', ')} dinlenmeye alındı; ${spinalNote}.`
                : `Son 48 saatte çakışan yorgun kas yok; ${spinalNote} ve zıt kas akışı kuruldu.`;

            // 2. Satır: Geçmiş Hafta & Ay Eksik Telafisi
            const compensatedEx = exList.filter(e => e && (e.synergyBadge === 'Eksik Telafisi' || e.isWishFocus));
            const neglected7d = Array.isArray(ctx.neglectedMuscles7d) ? ctx.neglectedMuscles7d.slice(0, 3) : [];
            const neglected30d = Array.isArray(ctx.neglectedMuscles30d) ? ctx.neglectedMuscles30d.slice(0, 2) : [];
            const deficitTargets = neglected7d.length > 0 ? neglected7d : neglected30d;

            let line2 = '';
            if (compensatedEx.length > 0 && deficitTargets.length > 0) {
                const exNames = compensatedEx.slice(0, 2).map(e => e.name).join(' & ');
                line2 = `Geçmişte eksik kalan ${deficitTargets.join(', ')} bölgesi için ${exNames} eklendi.`;
            } else if (deficitTargets.length > 0) {
                const matchingEx = exList.slice(0, 2).map(e => e.name).join(' & ');
                line2 = `Haftalık/aylık eksik (${deficitTargets.join(', ')}) hacmi ${matchingEx} ile kapatılıyor.`;
            } else {
                const topEx = exList.slice(0, 2).map(e => e.name).join(' & ');
                line2 = `Geçmiş hafta kas dağılımı dengeli; ${topEx} ile haftalık hacim korunuyor.`;
            }

            // 3. Satır: Seans Uygulama Notu
            const firstEx = exList[0] ? exList[0].name : 'İlk bileşik hareket';
            const finisherName = (workout.finisher && workout.finisher.name) ? workout.finisher.name : 'bitiş bloğu';
            const line3 = `${firstEx} setlerinde kontrollü negatif tempo koru; ${finisherName} bloğunda formu bozmadan hızlan.`;

            return `
                <div style="background:#F8FAFC; border:1.5px solid #CBD5E1; border-left:4px solid #7E22CE; border-radius:12px; padding:12px 14px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:15px;">🧠</span>
                            <strong style="color:#0F172A; font-size:12.5px; font-weight:900; letter-spacing:0.3px;">KOÇ ÖZETİ & EKSİK TELAFİSİ</strong>
                        </div>
                        <span style="font-size:10.5px; background:#F3E8FF; color:#6B21A8; border:1px solid #D8B4FE; padding:2px 8px; border-radius:6px; font-weight:800;">3 Katmanlı Analiz</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px; font-size:12px; color:#0F172A; line-height:1.45;">
                        <div>🛡️ <strong style="color:#0F172A;">Kas Koruması:</strong> <span style="color:#334155;">${escapeHTML(line1)}</span></div>
                        <div>🎯 <strong style="color:#0F172A;">Eksik Telafisi:</strong> <span style="color:#334155;">${escapeHTML(line2)}</span></div>
                        <div>💡 <strong style="color:#0F172A;">Seans Notu:</strong> <span style="color:#334155;">${escapeHTML(line3)}</span></div>
                    </div>
                </div>
            `;
        }
        window.buildAutoCoachThreeLineSummaryHtml = buildAutoCoachThreeLineSummaryHtml;

        async function validateWorkoutWithAcademicAI(scope = 'generated', options = {}) {
            const silentAuto = Boolean(options && options.silentAuto);
            let workout = null;
            let containerId = 'aiAcademicAuditContainer';

            if (scope === 'weekly_preview') {
                containerId = 'aiAcademicWeeklyAuditContainer';
                const plan = window.pendingAiWeeklyPlan;
                const actIdx = Number(window.activeWeeklyPreviewDayIdx) || 0;
                if (plan && plan.days && plan.days[actIdx]) {
                    workout = plan.days[actIdx].workout;
                }
            } else {
                workout = currentGeneratedWorkout;
                if (!workout) {
                    try {
                        workout = typeof readActiveLastGeneratedWorkout === 'function'
                            ? readActiveLastGeneratedWorkout()
                            : JSON.parse(localStorage.getItem('celik_kodu_last_generated_workout') || 'null');
                    } catch (e) {}
                }
            }

            const container = document.getElementById(containerId);
            if (!container) {
                if (!silentAuto && typeof showToast === 'function') showToast("⚠️ Denetim kutusu bulunamadı.");
                return;
            }

            if (!workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
                if (!silentAuto && typeof showToast === 'function') showToast("⚠️ Denetlenecek aktif bir antrenman bulunamadı.");
                return;
            }

            container.style.display = 'block';
            if (!silentAuto) {
                container.innerHTML = buildAutoCoachThreeLineSummaryHtml(workout, scope);
            }

            const deficitProfile = getAthleteDeficitProfileForAudit();

            const exListSummary = workout.exercises.map((ex, idx) => {
                const lbl = ex.blockLabel || String(idx + 1);
                const blkType = ex.blockType || 'straight';
                const angleVec = typeof getExerciseAngleVector === 'function' ? getExerciseAngleVector(ex) : '';
                const anat = typeof getExerciseAnatomy === 'function' ? getExerciseAnatomy(ex) : null;
                const primMuscles = (anat && anat.primary) ? anat.primary : (ex.muscle || '');
                return `[${lbl}] (${blkType.toUpperCase()}) - ID:${ex.id} | ${ex.name} (Ekipman: ${ex.equipment}, Açı/Vektör: ${angleVec}, Birincil Kaslar: ${primMuscles})`;
            }).join('\n');

            const prompt = `Aşağıdaki antrenman programını sporcunun geçmiş 48 saat, 7 gün ve 30 günlük geçmişine göre değerlendir ve TAM 3 SATIRLIK özet üret:

ANTRENMAN: ${workout.title} (${workout.splitName || workout.split || ''})
STİL: ${workout.style} | HEDEF: ${workout.goal} | SÜRE: ${workout.duration} dk

SPORCUNUN GEÇMİŞ PROFİLİ:
- Son 48 Saat (Toparlanma): ${deficitProfile.lastSessionNote}
- Geçtiğimiz Hafta Eksik / Atlanan Kaslar: ${deficitProfile.neglectedLastWeek}
- Son 30 Günde Düşük Kalan Bölgeler: ${deficitProfile.neglectedMonth}

HAREKETLER:
${exListSummary}

BİTİŞ (FINISHER): ${workout.finisher ? workout.finisher.name : 'Yok'}`;

            const academicSystemPrompt = `Sen "Çelik Kodu" platformunun Kıdemli Antrenörüsün.
KESİN KURALLAR:
1. ASLA akademisyen ismi (McGill, Schumann, Weakley, Hickson, Robbins, Schoenfeld vb.) KULLANMA.
2. Yanıtın SADECE aşağıdaki 3 tek satırlık maddeden oluşsun (her satır maksimum 18 kelime, net ve göz yormayan mikro-metin):
🛡️ **Kas Koruması:** (Son 48 saatte yorulan kasların ve alt belin nasıl korunduğu)
🎯 **Eksik Telafisi:** (Geçen hafta/ay eksik kalan hangi kasın bu programdaki hangi hareketle telafi edildiği)
💡 **Seans Notu:** (Antrenman sırasındaki en kritik 1 cümlelik uygulama/tempo ipucu)
3. BİYOMEKANİK AÇI & %70 KAS ÖRTÜŞME KONTROLÜ:
   - Eğilerek yapılan ama FARKLI kasları hedefleyen hareketleri (örn. Arka Bacak RDL ile Sırt Row veya Arka Omuz Açış) ASLA çakışma sayma.
   - Ancak aynı birincil kas grubunu (%70+ örtüşme) aynı çekiş/itiş açısıyla vuran iki hareket varsa (örn. Barbell Row ile Rotasyonel Gorilla Row gibi iki eğik sırt çekişi) en sona \`\`\`json {"actions":[{"type":"replace","fromId":"eski_id","toId":"yeni_id","reason":"Aynı kası aynı açıyla vuran ikiz hareket farklı açılı alternatifle dengelendi"}]} \`\`\` ekle; yoksa JSON ekleme.`;

            try {
                if (typeof callGeminiAPI !== 'function') {
                    throw new Error("callGeminiAPI fonksiyonu bulunamadı.");
                }
                const reply = await callGeminiAPI(prompt, academicSystemPrompt);

                let aiSuggestedActions = [];
                const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[1]);
                        if (parsed && Array.isArray(parsed.actions)) {
                            aiSuggestedActions = parsed.actions;
                        }
                    } catch (e) {}
                }

                window.lastAiAuditActions = {
                    scope,
                    actions: aiSuggestedActions,
                    targetDayIdx: (scope === 'weekly_preview' ? (Number(window.activeWeeklyPreviewDayIdx) || 0) : null)
                };

                const cleanReply = reply.replace(/```json[\s\S]*?```/g, '').trim();
                const formattedHtml = typeof formatAiCoachMarkdown === 'function' ? formatAiCoachMarkdown(cleanReply) : escapeHTML(cleanReply).replace(/\n/g, '<br>');

                // Eğer otomatik denetim sırasında AI açı/kas örtüşmesi bulduysa bekletmeden anında uygula!
                if (silentAuto && aiSuggestedActions.length > 0) {
                    applyAcademicAiCorrections({ silentAuto: true, formattedAuditHtml: formattedHtml });
                    return;
                }

                const applyActionBtnHtml = aiSuggestedActions.length > 0 ? `
                    <div style="margin-top:10px; padding-top:8px; border-top:1px solid #CBD5E1; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
                        <span style="font-size:11.5px; color:#6B21A8; font-weight:700;">⚡ ${aiSuggestedActions.length} hareket telafi önerisi hazır</span>
                        <button type="button" class="btn btn-gold" style="padding:6px 12px; font-size:11.5px; font-weight:800; background:#7E22CE; border:none; color:#FFFFFF; border-radius:6px; cursor:pointer;" onclick="applyAcademicAiCorrections()">
                            ⚡ Tek Tıkla Uygula
                        </button>
                    </div>
                ` : '';

                container.innerHTML = `
                    <div style="background:#F8FAFC; border:1.5px solid #CBD5E1; border-left:4px solid #7E22CE; border-radius:12px; padding:12px 14px;">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="font-size:15px;">✨</span>
                                <strong style="color:#0F172A; font-size:12.5px; font-weight:900; letter-spacing:0.3px;">KOÇ ÖZETİ & EKSİK TELAFİSİ</strong>
                            </div>
                            <span style="font-size:10.5px; background:#F3E8FF; color:#6B21A8; border:1px solid #D8B4FE; padding:2px 8px; border-radius:6px; font-weight:800;">AI + 3 Katmanlı Analiz</span>
                        </div>
                        <div style="font-size:12px; color:#0F172A; line-height:1.5;">
                            ${formattedHtml}
                        </div>
                        ${applyActionBtnHtml}
                    </div>
                `;
            } catch (err) {
                container.innerHTML = buildAutoCoachThreeLineSummaryHtml(workout, scope);
            }
        }
        window.validateWorkoutWithAcademicAI = validateWorkoutWithAcademicAI;

        function applyAcademicAiCorrections(options = {}) {
            const silentAuto = Boolean(options && options.silentAuto);
            const formattedAuditHtml = (options && options.formattedAuditHtml) ? options.formattedAuditHtml : '';
            const auditData = window.lastAiAuditActions;
            if (!auditData || !Array.isArray(auditData.actions) || auditData.actions.length === 0) {
                if (!silentAuto && typeof showToast === 'function') showToast("⚠️ Uygulanacak geçerli bir düzeltme bulunamadı.");
                return;
            }

            let workout = null;
            if (auditData.scope === 'weekly_preview') {
                const plan = window.pendingAiWeeklyPlan;
                const actIdx = Number(auditData.targetDayIdx !== null ? auditData.targetDayIdx : window.activeWeeklyPreviewDayIdx) || 0;
                if (plan && plan.days && plan.days[actIdx]) {
                    workout = plan.days[actIdx].workout;
                }
            } else {
                workout = currentGeneratedWorkout;
            }

            if (!workout || !Array.isArray(workout.exercises)) {
                if (!silentAuto && typeof showToast === 'function') showToast("⚠️ Hedef antrenman bulunamadı.");
                return;
            }

            let appliedCount = 0;
            const appliedMessages = [];

            auditData.actions.forEach(action => {
                if (action.type === 'replace') {
                    const fromTerm = action.fromId || action.fromName;
                    const toTerm = action.toId || action.toName;
                    if (!fromTerm || !toTerm) return;

                    let exIdx = workout.exercises.findIndex(e =>
                        e.id === fromTerm ||
                        (e.name && e.name.toLowerCase() === String(fromTerm).toLowerCase()) ||
                        (e.name && e.name.toLowerCase().includes(String(fromTerm).toLowerCase()))
                    );

                    if (exIdx === -1 && typeof findBestExerciseMatch === 'function') {
                        const matchedFrom = findBestExerciseMatch(fromTerm, workout.exercises);
                        if (matchedFrom) {
                            exIdx = workout.exercises.findIndex(e => e.id === matchedFrom.id);
                        }
                    }

                    if (exIdx !== -1) {
                        const otherExercises = workout.exercises.filter((_, idx) => idx !== exIdx);
                        let replacement = findBestExerciseMatch(toTerm);
                        if (replacement && (
                            otherExercises.some(o => o.id === replacement.id || getExerciseMovementFamily(o) === getExerciseMovementFamily(replacement)) ||
                            hasBiomechAngleAndMuscleConflict(replacement, otherExercises)
                        )) {
                            replacement = null;
                        }
                        if (!replacement) {
                            const targetCat = getEffectiveExerciseCategory(workout.exercises[exIdx]);
                            const safeAltPool = EXERCISES_DB.filter(cand =>
                                !isExerciseExcludedByUser(cand.id) &&
                                isExerciseEquipmentAvailable(cand) &&
                                getEffectiveExerciseCategory(cand) === targetCat &&
                                !otherExercises.some(o => o.id === cand.id || getExerciseMovementFamily(o) === getExerciseMovementFamily(cand)) &&
                                !hasBiomechAngleAndMuscleConflict(cand, otherExercises)
                            );
                            replacement = pickRandom(safeAltPool);
                        }
                        if (replacement) {
                            const oldName = workout.exercises[exIdx].name;
                            const prevBlockLabel = workout.exercises[exIdx].blockLabel;
                            const prevBlockType = workout.exercises[exIdx].blockType;
                            workout.exercises[exIdx] = Object.assign({}, replacement, {
                                blockLabel: prevBlockLabel,
                                blockType: prevBlockType
                            });
                            appliedMessages.push(`"${oldName}" ➔ "${replacement.name}"`);
                            appliedCount++;
                        }
                    }
                } else if (action.type === 'reorder' && Array.isArray(action.orderIds)) {
                    const reordered = [];
                    const remaining = [...workout.exercises];
                    action.orderIds.forEach(idTerm => {
                        const foundIdx = remaining.findIndex(e => e.id === idTerm || (e.name && e.name.toLowerCase().includes(String(idTerm).toLowerCase())));
                        if (foundIdx !== -1) {
                            reordered.push(remaining.splice(foundIdx, 1)[0]);
                        }
                    });
                    workout.exercises = reordered.concat(remaining);
                    appliedCount++;
                    appliedMessages.push('Egzersiz sıralaması optimize edildi');
                }
            });

            if (appliedCount > 0) {
                workout.exercises = assignAcademicBlockStructure(workout.exercises, workout.style || 'superset', workout.scheme);
                window.lastAiAuditActions = null;

                if (auditData.scope === 'weekly_preview') {
                    const plan = window.pendingAiWeeklyPlan;
                    const actIdx = Number(auditData.targetDayIdx !== null ? auditData.targetDayIdx : window.activeWeeklyPreviewDayIdx) || 0;
                    if (plan && plan.days && plan.days[actIdx]) {
                        const dayEntry = plan.days[actIdx];
                        dayEntry.workout = workout;
                        const schedIdx = (dayEntry.dayIdx !== undefined && dayEntry.dayIdx !== null) ? dayEntry.dayIdx : actIdx;
                        if (plan.draftSchedule && plan.draftSchedule[schedIdx]) {
                            plan.draftSchedule[schedIdx].customWorkout = workout;
                            plan.draftSchedule[schedIdx].exercises = workout.exercises;
                            plan.draftSchedule[schedIdx].desc = `${workout.exercises.length} Hareket • ${workout.duration || 45} Dk`;
                        }
                    }
                    if (typeof renderPendingWeeklyPlanPreview === 'function') renderPendingWeeklyPlanPreview({ preserveScroll: true });
                } else {
                    currentGeneratedWorkout = workout;
                    window.currentGeneratedWorkout = workout;
                    try {
                        if (typeof persistLastGeneratedWorkout === 'function') {
                            persistLastGeneratedWorkout(workout);
                        } else {
                            localStorage.setItem('celik_kodu_last_generated_workout', JSON.stringify(workout));
                        }
                    } catch(e) {}
                    window.expandedGeneratedExIndex = null;
                    if (typeof renderGeneratedWorkout === 'function') renderGeneratedWorkout({ preserveScroll: true });
                }

                const containerId = auditData.scope === 'weekly_preview' ? 'aiAcademicWeeklyAuditContainer' : 'aiAcademicAuditContainer';
                const container = document.getElementById(containerId);
                if (container) {
                    container.style.display = 'block';
                    container.innerHTML = `
                        <div style="background:#F8FAFC; border:1.5px solid #CBD5E1; border-left:4px solid #15803D; border-radius:12px; padding:12px 14px;">
                            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span style="font-size:15px;">✅</span>
                                    <strong style="color:#0F172A; font-size:12.5px; font-weight:900;">KOÇ ÖZETİ & AI AÇI DÜZELTMESİ</strong>
                                </div>
                                <span style="font-size:10.5px; background:#DCFCE7; color:#15803D; border:1px solid #86EFAC; padding:2px 8px; border-radius:6px; font-weight:800;">Otomatik Dengelendi</span>
                            </div>
                            ${formattedAuditHtml ? `<div style="font-size:12px; color:#0F172A; line-height:1.5; margin-bottom:8px;">${formattedAuditHtml}</div>` : ''}
                            <div style="font-size:11.5px; color:#15803D; font-weight:700; background:#DCFCE7; padding:6px 10px; border-radius:8px;">
                                ${appliedMessages.map(m => `<div>⚡ ${escapeHTML(m)}</div>`).join('')}
                            </div>
                        </div>
                    `;
                }

                if (typeof showToast === 'function') {
                    showToast(`✅ AI Denetimi: ${appliedMessages.join(' | ')}`);
                }
                if (!silentAuto && typeof playAlertSound === 'function') playAlertSound();
            } else if (!silentAuto) {
                if (typeof showToast === 'function') {
                    showToast("ℹ️ Eşleşen bir düzeltme bulunamadı veya program zaten güncel.");
                }
            }
        }
        window.applyAcademicAiCorrections = applyAcademicAiCorrections;

        function openScheduleExerciseAlternativeModal(dayIdx, currentExId, exIdx, dateStr = null) {
            if (dateStr) {
                activeSchedulingDateStr = dateStr;
                activeSchedulingDayIdx = dayIdx;
            }
            let currentEx = EXERCISES_DB.find(e => e.id === currentExId);
            if (!currentEx) {
                currentEx = EXERCISES_DB.find(e => e.name && e.name.toLowerCase() === String(currentExId).toLowerCase());
            }
            if (!currentEx && typeof findBestExerciseMatch === 'function') {
                currentEx = findBestExerciseMatch(currentExId);
            }
            if (!currentEx) {
                const effDateStr = dateStr || activeSchedulingDateStr || null;
                const sched = typeof activePlannerWeek !== 'undefined' && activePlannerWeek === 'next' ? getNextWeeklySchedule() : getWeeklySchedule();
                const plan = (effDateStr && typeof activePlannerWeek !== 'undefined' && activePlannerWeek !== 'next' && typeof getPlanForDate === 'function')
                    ? getPlanForDate(new Date(effDateStr + 'T00:00:00'))
                    : (sched && sched[dayIdx]);
                if (plan) {
                    const det = typeof getWorkoutDetailsForPlan === 'function' ? getWorkoutDetailsForPlan(plan) : null;
                    if (det && Array.isArray(det.exercises) && det.exercises[exIdx]) {
                        const targetItem = det.exercises[exIdx];
                        currentEx = EXERCISES_DB.find(e => e.id === targetItem.id) || (typeof findBestExerciseMatch === 'function' ? findBestExerciseMatch(targetItem.name || targetItem.id) : null) || targetItem;
                    }
                }
            }
            if (!currentEx) {
                showToast('⚠️ Hareket alternatifi bulunamadı.');
                return;
            }

            const primaryM = (currentEx.primaryMuscles && currentEx.primaryMuscles[0]) || (currentEx.muscle && currentEx.muscle.toLowerCase().includes('sırt') ? 'back' : 'chest');

            pickerContext = {
                mode: 'replace',
                targetExId: currentEx.id || currentExId,
                scope: 'day_schedule',
                studioIndex: null,
                dayIdx: dayIdx,
                dateStr: dateStr || activeSchedulingDateStr || null,
                scheduleExIndex: exIdx,
                currentTab: 'same_muscle',
                sameEquipFilter: 'all',
                reasonFilter: 'all',
                otherSelectedMuscle: primaryM,
                categoryFilter: 'all',
                searchQuery: ''
            };

            setupAlternativeModalUI(currentEx);
            document.getElementById('exercisePickerModal').classList.add('active');
        }

        function openAlternativeModal(currentExId, scope = 'generated') {
            let currentEx = null;
            if (scope === 'active' && activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises)) {
                currentEx = activeWorkoutSession.exercises.find(e => e.id === currentExId);
            } else if ((scope === 'generated' || scope === 'weekly_preview') && currentGeneratedWorkout && Array.isArray(currentGeneratedWorkout.exercises)) {
                currentEx = currentGeneratedWorkout.exercises.find(e => e.id === currentExId);
            }
            if (!currentEx) {
                currentEx = EXERCISES_DB.find(e => e.id === currentExId) || (typeof findBestExerciseMatch === 'function' ? findBestExerciseMatch(currentExId) : null);
            }
            if (!currentEx) return;

            const primaryM = (currentEx.primaryMuscles && currentEx.primaryMuscles[0]) || 'chest';

            pickerContext = {
                mode: 'replace',
                targetExId: currentEx.id,
                scope: scope,
                studioIndex: null,
                dayIdx: null,
                scheduleExIndex: null,
                currentTab: 'same_muscle',
                sameEquipFilter: 'all',
                reasonFilter: 'all',
                otherSelectedMuscle: primaryM,
                categoryFilter: 'all',
                searchQuery: ''
            };

            setupAlternativeModalUI(currentEx);
            document.getElementById('exercisePickerModal').classList.add('active');
        }

        function openAddExerciseModal(scope = 'generated') {
            pickerContext = {
                mode: 'add',
                targetExId: null,
                scope: scope,
                studioIndex: null,
                dayIdx: null,
                scheduleExIndex: null,
                currentTab: 'catalog',
                sameEquipFilter: 'all',
                reasonFilter: 'all',
                otherSelectedMuscle: 'chest',
                categoryFilter: 'all',
                searchQuery: ''
            };

            setupAlternativeModalUI(null);
            document.getElementById('exercisePickerModal').classList.add('active');
        }

        function setupAlternativeModalUI(currentEx) {
            const titleEl = document.getElementById('pickerModalTitle');
            const subEl = document.getElementById('pickerModalSubtitle');
            const banner = document.getElementById('pickerCurrentExBanner');
            const nameEl = document.getElementById('pickerCurrentExName');
            const thumbEl = document.getElementById('pickerCurrentExThumb');
            const badgesEl = document.getElementById('pickerCurrentExBadges');
            const muscleGrid = document.getElementById('pickerMuscleGrid');

            if (pickerContext.mode === 'replace' && currentEx) {
                if (titleEl) titleEl.innerText = currentEx.name;
                if (subEl) subEl.style.display = 'none';
                if (banner) banner.style.display = 'none';
                if (nameEl) nameEl.innerText = currentEx.name;
                if (badgesEl) badgesEl.innerHTML = '';
            } else {
                if (titleEl) titleEl.innerText = "Egzersiz Ekle";
                if (subEl) subEl.style.display = 'none';
                if (banner) banner.style.display = 'none';
            }

            // Render muscle selection grid for Tab 2
            if (muscleGrid) {
                muscleGrid.innerHTML = PICKER_MUSCLE_GROUPS.map(m => `
                    <button type="button" class="btn-quick-equip" id="pill_picker_m_${m.key}" onclick="setOtherMuscle('${m.key}')" style="display:flex; align-items:center; gap:4px; font-weight:700; border-style:solid;">
                        <span>${m.name}</span>
                    </button>
                `).join('');
            }

            // Clear search input
            const searchInput = document.getElementById('pickerSearchInput');
            if (searchInput) searchInput.value = '';

            // Reset AI response area and custom query for clean start
            const resArea = document.getElementById('geminiAiResponseArea');
            if (resArea) {
                resArea.style.display = 'none';
                resArea.innerHTML = '';
            }
            const queryInput = document.getElementById('geminiCustomQueryInput');
            if (queryInput) queryInput.value = '';

            updatePickerReasonPills();
            updateGeminiAiModalUI(currentEx);

            switchPickerTab(pickerContext.currentTab);
            const listEl = document.getElementById('pickerExercisesContainer');
            if (listEl) listEl.scrollTop = 0;
        }

        function closeExercisePickerModal() {
            const modal = document.getElementById('exercisePickerModal');
            if (modal) modal.classList.remove('active');
        }

        function switchPickerTab(tab) {
            pickerContext.currentTab = tab;

            const btnSame = document.getElementById('pickerTabBtnSame');
            const btnAI = document.getElementById('pickerTabBtnAI');
            const btnOther = document.getElementById('pickerTabBtnOther');
            const btnCatalog = document.getElementById('pickerTabBtnCatalog');

            const panSame = document.getElementById('pickerSubPanelSame');
            const panAI = document.getElementById('pickerSubPanelAI');
            const panOther = document.getElementById('pickerSubPanelOther');
            const panCatalog = document.getElementById('pickerSubPanelCatalog');
            const container = document.getElementById('pickerExercisesContainer');

            const activeStyle = "padding:6px 4px; font-size:11px; font-weight:800; border-radius:7px; border-color:#0F172A; color:#FFFFFF; background:#0F172A; white-space:nowrap;";
            const activeAIStyle = "padding:6px 4px; font-size:11px; font-weight:800; border-radius:7px; border-color:#7E22CE; color:#FFFFFF; background:#7E22CE; white-space:nowrap;";
            const inactiveStyle = "padding:6px 4px; font-size:11px; font-weight:700; border-radius:7px; border-color:transparent; color:#475569; background:transparent; white-space:nowrap;";

            if (btnSame) btnSame.style.cssText = tab === 'same_muscle' ? activeStyle : inactiveStyle;
            if (btnAI) btnAI.style.cssText = tab === 'ai_coach' ? activeAIStyle : inactiveStyle;
            if (btnOther) btnOther.style.cssText = tab === 'other_muscle' ? activeStyle : inactiveStyle;
            if (btnCatalog) btnCatalog.style.cssText = tab === 'catalog' ? activeStyle : inactiveStyle;

            if (panSame) panSame.style.display = tab === 'same_muscle' ? 'block' : 'none';
            if (panAI) panAI.style.display = tab === 'ai_coach' ? 'block' : 'none';
            if (panOther) panOther.style.display = tab === 'other_muscle' ? 'block' : 'none';
            if (panCatalog) panCatalog.style.display = tab === 'catalog' ? 'block' : 'none';

            if (tab === 'ai_coach') {
                const currentEx = pickerContext.targetExId ? EXERCISES_DB.find(e => e.id === pickerContext.targetExId) : null;
                updateGeminiAiModalUI(currentEx);
                if (container) container.style.display = 'none';
            } else {
                if (container) container.style.display = 'block';
                updateSameEquipPills();
                updatePickerReasonPills();
                updateOtherMusclePills();
                updatePickerCategoryPills();
                renderPickerList();
            }
        }

        function setPickerReasonFilter(reason) {
            pickerContext.reasonFilter = reason;
            updatePickerReasonPills();
            renderPickerList();
        }

        function updatePickerReasonPills() {
            const reasons = ['all', 'no_equip', 'joint', 'easier'];
            const cur = pickerContext.reasonFilter || 'all';
            reasons.forEach(r => {
                const el = document.getElementById('pill_reason_' + r);
                if (el) {
                    if (cur === r) {
                        el.style.borderColor = '#FF5A36';
                        el.style.color = '#FF5A36';
                        el.style.background = '#FFF7ED';
                        el.style.fontWeight = '800';
                    } else {
                        el.style.borderColor = '#E2E8F0';
                        el.style.color = '#475569';
                        el.style.background = '#FFFFFF';
                        el.style.fontWeight = '600';
                    }
                }
            });
        }

        function setSameEquipFilter(equip) {
            pickerContext.sameEquipFilter = equip;
            updateSameEquipPills();
            renderPickerList();
        }

        function updateSameEquipPills() {
            const equips = ['all', 'dumbbell', 'kettlebell', 'barbell', 'machine', 'bodyweight'];
            equips.forEach(eq => {
                const el = document.getElementById('pill_seq_' + eq);
                if (el) {
                    if (pickerContext.sameEquipFilter === eq) {
                        el.style.borderColor = '#FF5A36';
                        el.style.color = '#C2410C';
                        el.style.background = '#FFF7ED';
                        el.style.fontWeight = '800';
                        el.style.borderStyle = 'solid';
                    } else {
                        el.style.borderColor = '#E2E8F0';
                        el.style.color = '#475569';
                        el.style.background = '#FFFFFF';
                        el.style.fontWeight = '700';
                        el.style.borderStyle = 'solid';
                    }
                }
            });
        }

        function setOtherMuscle(mKey) {
            pickerContext.otherSelectedMuscle = mKey;
            updateOtherMusclePills();
            renderPickerList();
        }

        function updateOtherMusclePills() {
            PICKER_MUSCLE_GROUPS.forEach(m => {
                const el = document.getElementById('pill_picker_m_' + m.key);
                if (el) {
                    if (pickerContext.otherSelectedMuscle === m.key) {
                        el.style.borderColor = 'var(--gold)';
                        el.style.color = 'var(--gold)';
                        el.style.background = 'rgba(245, 158, 11, 0.18)';
                        el.style.fontWeight = '800';
                    } else {
                        el.style.borderColor = 'var(--border)';
                        el.style.color = 'var(--text-secondary)';
                        el.style.background = 'transparent';
                        el.style.fontWeight = '500';
                    }
                }
            });
        }

        function setPickerCategory(cat) {
            pickerContext.categoryFilter = cat;
            updatePickerCategoryPills();
            renderPickerList();
        }

        function updatePickerCategoryPills() {
            const cats = ['all', 'push', 'pull', 'legs_quad', 'legs_hinge', 'core', 'conditioning'];
            cats.forEach(c => {
                const el = document.getElementById('pill_cat_' + c);
                if (el) {
                    if (pickerContext.categoryFilter === c) {
                        el.style.borderColor = 'var(--gold)';
                        el.style.color = 'var(--gold)';
                        el.style.background = 'rgba(245, 158, 11, 0.15)';
                    } else {
                        el.style.borderColor = 'var(--border)';
                        el.style.color = 'var(--text-secondary)';
                        el.style.background = 'transparent';
                    }
                }
            });
        }

        function handlePickerSearchInput() {
            renderPickerList();
        }

        function getExercisesInCurrentScope(ctx) {
            if (!ctx) return [];
            let list = [];
            const scope = ctx.scope;

            if (scope === 'studio') {
                if (typeof customRoutineState !== 'undefined' && customRoutineState && Array.isArray(customRoutineState.exercises)) {
                    list = customRoutineState.exercises.map(e => e.exId || e.id).filter(Boolean);
                }
            } else if (scope === 'day_schedule' && ctx.dayIdx !== null && ctx.dayIdx !== undefined) {
                const sched = typeof getWeeklySchedule === 'function' ? getWeeklySchedule() : [];
                const plan = sched[ctx.dayIdx];
                if (plan && !plan.rest) {
                    const det = typeof getWorkoutDetailsForPlan === 'function' ? getWorkoutDetailsForPlan(plan) : null;
                    if (det && Array.isArray(det.exercises)) {
                        list = det.exercises.map(e => e.id || e.exId).filter(Boolean);
                    }
                }
            } else if (scope === 'active') {
                if (typeof activeWorkoutSession !== 'undefined' && activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises)) {
                    list = activeWorkoutSession.exercises.map(e => e.id || e.exId).filter(Boolean);
                }
            } else {
                // 'generated' or general workout
                if (typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && Array.isArray(currentGeneratedWorkout.exercises)) {
                    list = currentGeneratedWorkout.exercises.map(e => e.id || e.exId).filter(Boolean);
                }
            }

            // In replace mode, ensure target exercise is also included in exclusion list
            if (ctx.mode === 'replace' && ctx.targetExId) {
                if (!list.includes(ctx.targetExId)) {
                    list.push(ctx.targetExId);
                }
            }

            return list;
        }

        function renderPickerList() {
            const container = document.getElementById('pickerExercisesContainer');
            if (!container) return;

            const tab = pickerContext.currentTab;
            const currentEx = pickerContext.targetExId ? EXERCISES_DB.find(e => e.id === pickerContext.targetExId) : null;
            const existingIds = getExercisesInCurrentScope(pickerContext);
            let filtered = [];

            if (tab === 'same_muscle') {
                const pMuscles = (currentEx && currentEx.primaryMuscles) ? currentEx.primaryMuscles : [];
                const sMuscles = (currentEx && currentEx.secondaryMuscles) ? currentEx.secondaryMuscles : [];
                const cat = currentEx ? currentEx.category : null;
                const currentEq = currentEx ? currentEx.equipment : null;
                const reason = pickerContext.reasonFilter || 'all';

                // Kinematik patern kategorisi eşleme (Hinge -> Hinge, Squat -> Squat vs.)
                const isHinge = cat === 'legs_hinge' || (pMuscles.includes('hamstrings') && !pMuscles.includes('quads'));
                const isQuad = cat === 'legs_quad' || pMuscles.includes('quads');
                const isPush = cat === 'push';
                const isPull = cat === 'pull';
                const isCore = cat === 'core';

                filtered = EXERCISES_DB.filter(ex => {
                    // Exclude hidden exercises
                    if (isExerciseExcludedByUser(ex.id)) return false;
                    // Exclude all exercises already in current routine
                    if (existingIds.includes(ex.id)) return false;

                    // BİYOMEKANİK KİNEMATİK KİLİT (Kettlebell Swing yerine ASLA Plank veya Goblet Squat çıkamaz!)
                    if (isHinge) {
                        // Sadece Hinge veya Hamstring/Glute çekiş hareketleri kabul edilir! Core (plank) veya Quad (squat) kesinlikle elenir!
                        if (ex.category === 'core' || ex.category === 'legs_quad') return false;
                        const hitHinge = ex.category === 'legs_hinge' || (ex.primaryMuscles || []).includes('hamstrings') || (ex.primaryMuscles || []).includes('glutes');
                        if (!hitHinge) return false;
                    } else if (isQuad) {
                        // Squat/Lunge için Hinge veya Core elenir
                        if (ex.category === 'core' || ex.category === 'legs_hinge') return false;
                        const hitQuad = ex.category === 'legs_quad' || (ex.primaryMuscles || []).includes('quads');
                        if (!hitQuad) return false;
                    } else if (isPush) {
                        if (ex.category !== 'push' && !(ex.primaryMuscles || []).some(m => ['chest', 'shoulders', 'triceps'].includes(m))) return false;
                    } else if (isPull) {
                        if (ex.category !== 'pull' && !(ex.primaryMuscles || []).some(m => ['back', 'lats', 'traps', 'biceps'].includes(m))) return false;
                    } else if (isCore) {
                        if (ex.category !== 'core' && !(ex.primaryMuscles || []).includes('core')) return false;
                    } else {
                        const hasPrimaryHit = pMuscles.some(m => (ex.primaryMuscles || []).includes(m));
                        const hasCatHit = cat && ex.category === cat;
                        if (!hasPrimaryHit && !hasCatHit) return false;
                    }

                    // Equipment filter
                    if (pickerContext.sameEquipFilter !== 'all' && ex.equipment !== pickerContext.sameEquipFilter) {
                        return false;
                    }

                    // Neden filtresi: Alet Yok / Dolu
                    if (reason === 'no_equip' && currentEq && ex.equipment === currentEq) {
                        return false;
                    }

                    return true;
                });

                // Biyomekanik Uygunluk Sıralaması
                filtered.sort((a, b) => {
                    let scoreA = 0;
                    let scoreB = 0;

                    if (a.category === cat) scoreA += 60;
                    if (b.category === cat) scoreB += 60;

                    const aPriHits = (a.primaryMuscles || []).filter(m => pMuscles.includes(m)).length;
                    const bPriHits = (b.primaryMuscles || []).filter(m => pMuscles.includes(m)).length;
                    scoreA += aPriHits * 30;
                    scoreB += bPriHits * 30;

                    if (reason === 'joint') {
                        const friendly = ['bridge', 'curl', 'cable', 'support', 'seated', 'floor', 'machine', 'thrust'];
                        if (friendly.some(k => a.id.includes(k) || a.name.toLowerCase().includes(k))) scoreA += 50;
                        if (friendly.some(k => b.id.includes(k) || b.name.toLowerCase().includes(k))) scoreB += 50;
                    }

                    if (reason === 'easier') {
                        if (a.mechanic === 'isolation' || a.equipment === 'bodyweight') scoreA += 40;
                        if (b.mechanic === 'isolation' || b.equipment === 'bodyweight') scoreB += 40;
                    }

                    return scoreB - scoreA;
                });
            } else if (tab === 'other_muscle') {
                const targetM = pickerContext.otherSelectedMuscle;
                filtered = EXERCISES_DB.filter(ex => {
                    // Exclude hidden exercises
                    if (isExerciseExcludedByUser(ex.id)) return false;
                    // Exclude all exercises already in current routine
                    if (existingIds.includes(ex.id)) return false;

                    const hit = (ex.primaryMuscles || []).includes(targetM) || (ex.secondaryMuscles || []).includes(targetM);
                    return hit;
                });
            } else {
                // 'catalog' / 'diğer' tab
                ensureBilingualExerciseNames();
                const q = (document.getElementById('pickerSearchInput')?.value || '').trim();
                const cat = pickerContext.categoryFilter;

                filtered = EXERCISES_DB.filter(ex => {
                    // Exclude hidden exercises unless explicitly searched by query
                    if (!q && isExerciseExcludedByUser(ex.id)) return false;
                    // Exclude all exercises already in current routine
                    if (existingIds.includes(ex.id)) return false;

                    if (cat !== 'all' && ex.category !== cat) return false;
                    if (q && !matchesExerciseSearch(ex, q)) return false;
                    return true;
                });
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:32px 14px; background:#F8FAFC; border-radius:8px; border:1px dashed var(--border);">
                        <div style="font-size:20px; margin-bottom:6px;">🔍</div>
                        <div style="font-size:12.5px; font-weight:700; color:#0F172A;">Bu kriterlere uygun başka egzersiz bulunamadı</div>
                        <div style="font-size:11px; color:var(--text-secondary); margin:4px 0 12px;">Mevcut listenizde yer almayan alternatifler için farklı bir ekipman filtresi seçebilir veya tüm kataloğu inceleyebilirsiniz.</div>
                        <button type="button" class="btn btn-gold" style="font-size:11px; padding:6px 14px; font-weight:800;" onclick="switchPickerTab('catalog')">
                            ➕ Diğer (Tüm Egzersiz Kataloğunu Aç)
                        </button>
                    </div>
                `;
                return;
            }

            let cardsHtml = filtered.map(ex => {
                const media = getExerciseVisualMedia(ex.id, ex.category);
                const thumbImg = media.still || '';
                const eqMeta = EQUIP_LABELS[ex.equipment] || { label: ex.equipment || '', icon: '🏋️' };

                return `
                    <div style="margin-bottom:6px; padding:8px 10px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <div style="display:flex; align-items:center; gap:9px; min-width:0; flex:1; cursor:pointer;" onclick="togglePickerExerciseForm('${ex.id}')">
                                <div style="width:38px; height:38px; border-radius:8px; background:#FFFFFF; overflow:hidden; flex-shrink:0; border:1px solid #E2E8F0; display:flex; align-items:center; justify-content:center;">
                                    ${thumbImg ? `<img src="${thumbImg}" style="width:100%; height:100%; object-fit:contain;" alt="${escapeHTML(ex.name)}">` : '🏋️'}
                                </div>
                                <div style="min-width:0; flex:1;">
                                    <div style="font-size:13px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                        ${escapeHTML(ex.name)}
                                    </div>
                                    <div style="font-size:10.5px; font-weight:700; color:#64748B; margin-top:1px;">
                                        ${escapeHTML(eqMeta.label)}
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                                <button type="button" class="wk-ex-i-btn" onclick="event.stopPropagation(); openExerciseQuickInfoModal('${ex.id}')" title="Hareket Bilgisi">i</button>
                                <button type="button" class="stitch-ex-swap-pill" style="background:#FF5A36; color:#FFFFFF; border-color:#FF5A36; padding:6px 12px; font-size:11.5px; font-weight:800;" onclick="event.stopPropagation(); selectExerciseFromPicker('${ex.id}')">
                                    ${pickerContext.mode === 'replace' ? 'Seç' : 'Ekle'}
                                </button>
                            </div>
                        </div>

                        <!-- INLINE FORM EXPANDER (SADE GÖRSEL ÖNİZLEME - LAZY VIDEO) -->
                        <div id="picker_form_expand_${ex.id}" data-clip="${escapeHTML(media.clip || '')}" data-thumb="${escapeHTML(thumbImg)}" data-name="${escapeHTML(ex.name || '')}" style="display:none; margin-top:8px; padding-top:8px; border-top:1px solid #E2E8F0;"></div>
                    </div>
                `;
            }).join('');

            if (tab === 'same_muscle' || tab === 'other_muscle') {
                cardsHtml += `
                    <div style="text-align:center; padding:8px; margin-top:4px;">
                        <button type="button" class="wk-btn-utility-compact" style="width:100%;" onclick="switchPickerTab('catalog')">
                            Tüm Kataloğu Aç
                        </button>
                    </div>
                `;
            }

            container.innerHTML = cardsHtml;
        }

        function togglePickerExerciseForm(exId) {
            const box = document.getElementById('picker_form_expand_' + exId);
            if (!box) {
                openExerciseDetailModal(exId);
                return;
            }
            const isHidden = box.style.display === 'none' || !box.style.display;
            if (isHidden) {
                if (!box.hasChildNodes()) {
                    const clipUrl = box.getAttribute('data-clip') || '';
                    const thumbImg = box.getAttribute('data-thumb') || '';
                    const exName = box.getAttribute('data-name') || '';
                    if (clipUrl) {
                        box.innerHTML = `
                            <div style="text-align:center; background:#FFFFFF; border-radius:8px; overflow:hidden; border:1px solid #E2E8F0; min-height:150px; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="event.stopPropagation(); openImageLightbox(decodeURIComponent('${encodeURIComponent(clipUrl)}'), decodeURIComponent('${encodeURIComponent(exName)}'))">
                                <video src="${escapeHTML(clipUrl)}" poster="${escapeHTML(thumbImg)}" autoplay loop muted playsinline style="max-width:100%; max-height:36vh; object-fit:contain; display:block; margin:0 auto;" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';"></video>
                                <img src="${escapeHTML(thumbImg)}" style="display:none; max-width:100%; max-height:36vh; object-fit:contain; margin:0 auto;" alt="${escapeHTML(exName)} Form">
                            </div>
                        `;
                    } else if (thumbImg) {
                        box.innerHTML = `
                            <div style="text-align:center; background:#FFFFFF; border-radius:8px; overflow:hidden; border:1px solid #E2E8F0; min-height:150px; display:flex; align-items:center; justify-content:center;">
                                <img src="${escapeHTML(thumbImg)}" style="max-width:100%; max-height:36vh; object-fit:contain; display:block; margin:0 auto;" alt="${escapeHTML(exName)} Form">
                            </div>
                        `;
                    } else {
                        box.innerHTML = `<div style="text-align:center; padding:12px; color:#64748B; font-size:11.5px;">Görsel hazırlanıyor.</div>`;
                    }
                }
                box.style.display = 'block';
                box.querySelectorAll('video').forEach(v => {
                    v.muted = true;
                    v.defaultMuted = true;
                    v.playsInline = true;
                    v.play().catch(() => {});
                });
            } else {
                box.querySelectorAll('video').forEach(v => {
                    try { v.pause(); v.removeAttribute('src'); v.load(); } catch(e) {}
                });
                box.innerHTML = '';
                box.style.display = 'none';
            }
        }

        function syncWorkoutPersistenceAfterEdit(workout, scope = 'generated', oldExId = null, newEx = null) {
            if (!workout || !Array.isArray(workout.exercises)) return;
            const nowTs = Date.now();
            workout.updatedAt = nowTs;
            workout.exercises = assignAcademicBlockStructure(workout.exercises, workout.style || 'superset', workout.scheme);

            // 1. Tek günlük oluşturulan antrenmanı localStorage'da da güncelle
            if (workout === currentGeneratedWorkout) {
                window.currentGeneratedWorkout = currentGeneratedWorkout;
                try {
                    if (typeof persistLastGeneratedWorkout === 'function') {
                        persistLastGeneratedWorkout(currentGeneratedWorkout);
                    } else {
                        localStorage.setItem('celik_kodu_last_generated_workout', JSON.stringify(currentGeneratedWorkout));
                    }
                } catch(e) {}
            }

            // 2. Haftalık AI program taslağındaki (pendingAiWeeklyPlan) hem days hem draftSchedule referanslarını senkronize et
            if (window.pendingAiWeeklyPlan && Array.isArray(window.pendingAiWeeklyPlan.days)) {
                window.pendingAiWeeklyPlan.days.forEach(dItem => {
                    if (dItem && dItem.workout && (dItem.workout === workout || (workout.id && dItem.workout.id === workout.id))) {
                        dItem.workout = workout;
                        if (window.pendingAiWeeklyPlan.draftSchedule && window.pendingAiWeeklyPlan.draftSchedule[dItem.dayIdx]) {
                            const slotObj = window.pendingAiWeeklyPlan.draftSchedule[dItem.dayIdx];
                            slotObj.customWorkout = workout;
                            slotObj.exercises = workout.exercises;
                            slotObj.desc = `${workout.exercises.length} Hareket • ${workout.duration || 45} Dk`;
                            slotObj.updatedAt = nowTs;
                        }
                    }
                });
            }

            // 3. Canlı antrenman (active) ise set verilerini (activeWorkoutSetsData) ve bugünün takvim programını senkronize et
            if (scope === 'active' && activeWorkoutSession) {
                if (oldExId && newEx && oldExId !== newEx.id) {
                    const prevSets = activeWorkoutSetsData[oldExId];
                    const numSets = (Array.isArray(prevSets) && prevSets.length > 0)
                        ? prevSets.length
                        : ((newEx.targetSets || (activeWorkoutSession.scheme && activeWorkoutSession.scheme.sets)) || 3);
                    const repsSpec = newEx.targetReps || (activeWorkoutSession.scheme && activeWorkoutSession.scheme.reps);
                    const defaultReps = resolveDefaultExerciseSetTarget(newEx, repsSpec);
                    const defaultWeight = isExerciseCardioMinutes(newEx) ? '' : getExerciseRememberedWeight(newEx);
                    activeWorkoutSetsData[newEx.id] = [];
                    for (let s = 1; s <= numSets; s++) {
                        activeWorkoutSetsData[newEx.id].push({
                            setNo: s,
                            weight: defaultWeight,
                            reps: defaultReps,
                            completed: false,
                            completedAt: null
                        });
                    }
                    delete activeWorkoutSetsData[oldExId];
                } else if (!oldExId && newEx && !activeWorkoutSetsData[newEx.id]) {
                    const numSets = (newEx.targetSets || (activeWorkoutSession.scheme && activeWorkoutSession.scheme.sets)) || 3;
                    const repsSpec = newEx.targetReps || (activeWorkoutSession.scheme && activeWorkoutSession.scheme.reps);
                    const defaultReps = resolveDefaultExerciseSetTarget(newEx, repsSpec);
                    const defaultWeight = isExerciseCardioMinutes(newEx) ? '' : getExerciseRememberedWeight(newEx);
                    activeWorkoutSetsData[newEx.id] = [];
                    for (let s = 1; s <= numSets; s++) {
                        activeWorkoutSetsData[newEx.id].push({
                            setNo: s,
                            weight: defaultWeight,
                            reps: defaultReps,
                            completed: false,
                            completedAt: null
                        });
                    }
                } else if (oldExId && !newEx) {
                    delete activeWorkoutSetsData[oldExId];
                }

                // Yalnızca bu aktif antrenman gerçekten takvimdeki bir güne aitse o günün takvim programını güncelle
                try {
                    const todayDate = new Date();
                    const todayIdx = todayDate.getDay();
                    const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
                    const isNextWk = Boolean(activeWorkoutSession.scheduledIsNextWeek);
                    const sched = isNextWk
                        ? (typeof getNextWeeklySchedule === 'function' ? getNextWeeklySchedule() : null)
                        : (typeof getWeeklySchedule === 'function' ? getWeeklySchedule() : null);
                    const candidateDayIdx = (activeWorkoutSession.scheduledDayIdx !== undefined && activeWorkoutSession.scheduledDayIdx !== null)
                        ? activeWorkoutSession.scheduledDayIdx
                        : todayIdx;
                    const daySlot = sched && sched[candidateDayIdx];
                    const isMatchingScheduledSession = Boolean(
                        daySlot && !daySlot.rest && (
                            activeWorkoutSession.scheduledDayIdx === candidateDayIdx ||
                            (activeWorkoutSession.id && (
                                daySlot.id === activeWorkoutSession.id ||
                                (daySlot.customWorkout && daySlot.customWorkout.id === activeWorkoutSession.id)
                            ))
                        )
                    );
                    if (isMatchingScheduledSession) {
                        const clonedActive = JSON.parse(JSON.stringify(activeWorkoutSession));
                        clonedActive.updatedAt = nowTs;
                        daySlot.customWorkout = clonedActive;
                        daySlot.exercises = clonedActive.exercises;
                        daySlot.desc = `${clonedActive.exercises.length} Hareket • ${clonedActive.duration || 45} Dk`;
                        daySlot.updatedAt = nowTs;
                        if (isNextWk && typeof saveNextWeeklySchedule === 'function') {
                            saveNextWeeklySchedule(sched);
                        } else if (typeof saveWeeklySchedule === 'function') {
                            saveWeeklySchedule(sched);
                        }
                        const targetYMD = activeWorkoutSession.scheduledDateStr || (!isNextWk && candidateDayIdx === todayIdx ? todayYMD : '');
                        if (targetYMD && typeof saveDateScheduleOverride === 'function') {
                            saveDateScheduleOverride(targetYMD, daySlot);
                        }
                    }
                } catch(e) {}
            }
        }

        function selectExerciseFromPicker(newExId) {
            const newEx = EXERCISES_DB.find(e => e.id === newExId);
            if (!newEx) return;

            // 1. STUDIO SCOPE (Custom Routine Builder)
            if (pickerContext.scope === 'studio') {
                if (pickerContext.mode === 'replace' && pickerContext.studioIndex !== null) {
                    if (customRoutineState && customRoutineState.exercises && customRoutineState.exercises[pickerContext.studioIndex]) {
                        customRoutineState.exercises[pickerContext.studioIndex].exId = newEx.id;
                    }
                } else {
                    customRoutineState.exercises.push({
                        exId: newEx.id,
                        sets: 3,
                        reps: '8-12',
                        weight: ''
                    });
                }

                closeExercisePickerModal();
                renderCustomRoutine();
                renderRegionStatus();
                showToast(`✅ "${newEx.name}" programa eklendi!`);
                playAlertSound();
                return;
            }

            // 2. DAY SCHEDULE MODAL SCOPE
            if (pickerContext.scope === 'day_schedule' && pickerContext.dayIdx !== null && pickerContext.dayIdx !== undefined) {
                const dayIdx = pickerContext.dayIdx;
                const preservedDateStr = pickerContext.dateStr || activeSchedulingDateStr || (
                    typeof getDateForScheduleDay === 'function' && typeof formatDateYMD === 'function'
                        ? formatDateYMD(getDateForScheduleDay(dayIdx, activePlannerWeek === 'next'))
                        : null
                );
                const schedule = activePlannerWeek === 'next' ? getNextWeeklySchedule() : getWeeklySchedule();
                let plan = (preservedDateStr && activePlannerWeek !== 'next' && typeof getPlanForDate === 'function')
                    ? getPlanForDate(new Date(preservedDateStr + 'T00:00:00'))
                    : schedule[dayIdx];
                if (!plan || plan.rest) plan = schedule[dayIdx];

                if (plan && !plan.rest) {
                    const details = getWorkoutDetailsForPlan(plan) || {};
                    const user = getActiveUser();

                    const targetItemIdx = pickerContext.scheduleExIndex !== null ? pickerContext.scheduleExIndex : 0;
                    const currentExs = (details && Array.isArray(details.exercises)) ? details.exercises : [];

                    // Build updated full exercises array
                    const newExercises = currentExs.map((e, idx) => {
                        if (idx === targetItemIdx) {
                            return Object.assign({}, newEx, {
                                targetSets: e.targetSets || e.sets || (details.scheme ? details.scheme.sets : 3),
                                targetReps: e.targetReps || e.reps || (details.scheme ? details.scheme.reps : '8-12'),
                                logs: []
                            });
                        }
                        const exId = e.id || e.exId;
                        const dbMatch = EXERCISES_DB.find(x => x.id === exId);
                        return Object.assign({}, dbMatch || e, {
                            id: exId,
                            targetSets: e.targetSets || e.sets || (details.scheme ? details.scheme.sets : 3),
                            targetReps: e.targetReps || e.reps || (details.scheme ? details.scheme.reps : '8-12')
                        });
                    });

                    const cleanTitle = (details.title || plan.title || 'Özel Program').replace(/⚔️|Çelik Kodu/g, '').trim();
                    const progId = (plan.id && plan.id.startsWith('custom_')) ? plan.id : ('custom_day_' + dayIdx + '_' + Date.now());
                    const nowTs = Date.now();

                    const updatedWorkout = {
                        id: progId,
                        title: cleanTitle,
                        split: details.split || 'custom',
                        style: details.style || 'classic',
                        goal: 'hypertrophy',
                        duration: Math.round(newExercises.length * 7) || 45,
                        scheme: details.scheme || { sets: 3, reps: '8-12', rest: details.rest || 60 },
                        rest: details.rest || 60,
                        warmups: details.warmups || [
                            { name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ısıt." }
                        ],
                        exercises: newExercises,
                        finisher: details.finisher || { name: "Balistik Bitiş", desc: "Maksimum tempolu seans." },
                        updatedAt: nowTs,
                        isCustom: true
                    };

                    // 1. Direct update on the weekly schedule & date override
                    const existingCardio = (plan && Array.isArray(plan.extraCardioSessions))
                        ? plan.extraCardioSessions
                        : ((schedule[dayIdx] && Array.isArray(schedule[dayIdx].extraCardioSessions)) ? schedule[dayIdx].extraCardioSessions : []);
                    const updatedPlanObj = {
                        id: progId,
                        title: cleanTitle,
                        type: 'custom_saved',
                        desc: `${newExercises.length} Hareket • ${updatedWorkout.duration} Dk`,
                        rest: false,
                        customWorkout: updatedWorkout,
                        exercises: newExercises,
                        extraCardioSessions: existingCardio,
                        updatedAt: nowTs
                    };
                    schedule[dayIdx] = updatedPlanObj;
                    if (activePlannerWeek === 'next') {
                        saveNextWeeklySchedule(schedule);
                    } else {
                        saveWeeklySchedule(schedule);
                        if (preservedDateStr && typeof saveDateScheduleOverride === 'function') {
                            saveDateScheduleOverride(preservedDateStr, updatedPlanObj);
                        }
                    }

                    // 2. Also persist in custom programs library
                    upsertUserCustomProgram(updatedWorkout, user.id);
                    if (typeof renderLibrary === 'function') renderLibrary();

                    // 3. Update active day and calendar view
                    renderActiveWorkout();
                    if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                }

                const wasSchedModalOpen = document.getElementById('scheduleDayModal')?.classList.contains('active');
                closeExercisePickerModal();
                if (wasSchedModalOpen) {
                    openScheduleDayModal(dayIdx, preservedDateStr);
                }
                showToast(`✅ "${newEx.name}" güncellendi ve kaydedildi!`);
                playAlertSound();
                return;
            }

            // 3. ACTIVE WORKOUT OR GENERATED WORKOUT SCOPE
            const workout = pickerContext.scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) {
                closeExercisePickerModal();
                return;
            }

            let oldReplacedId = null;
            if (pickerContext.mode === 'replace') {
                const idx = workout.exercises.findIndex(e => e.id === pickerContext.targetExId);
                if (idx !== -1) {
                    const oldEx = workout.exercises[idx];
                    oldReplacedId = oldEx.id;
                    workout.exercises[idx] = {
                        ...newEx,
                        targetSets: oldEx.targetSets || 3,
                        targetReps: oldEx.targetReps || '8-12',
                        logs: oldEx.logs || []
                    };
                } else if (workout.finisher && (workout.finisher.exId === pickerContext.targetExId || (pickerContext.targetExId === 'db_farmers_walk' && workout.finisher.name && workout.finisher.name.toLowerCase().includes('farmer')))) {
                    workout.finisher = {
                        exId: newEx.id,
                        family: typeof getExerciseMovementFamily === 'function' ? getExerciseMovementFamily(newEx) : 'custom_finisher',
                        name: `${newEx.name} (Bitiş / Finisher)`,
                        desc: newEx.cue || 'Maksimum tempolu bitiş seansı.'
                    };
                }
            } else if (pickerContext.mode === 'add') {
                workout.exercises.push({
                    ...newEx,
                    targetSets: 3,
                    targetReps: '8-12',
                    logs: []
                });
                if (pickerContext.scope === 'active') {
                    activeFocusExIndex = workout.exercises.length - 1;
                    activeFocusSetIndex = null;
                }
            }

            syncWorkoutPersistenceAfterEdit(workout, pickerContext.scope, oldReplacedId, newEx);
            closeExercisePickerModal();

            if (pickerContext.scope === 'active') {
                saveActiveWorkoutStateToStorage();
                const savedScrollY = window.scrollY;
                renderActiveWorkout();
                if (pickerContext.mode === 'add' && activeWorkoutViewMode === 'focus') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (Math.abs(window.scrollY - savedScrollY) > 1) {
                    window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
                }
                showToast(`✅ Aktif antrenmanda "${newEx.name}" alternatifi seçildi!`);
            } else if (pickerContext.scope === 'weekly_preview' && window.pendingAiWeeklyPlan) {
                renderPendingWeeklyPlanPreview({ preserveScroll: true });
                showToast(`✅ "${newEx.name}" alternatifi seçildi!`);
            } else {
                renderGeneratedWorkout({ preserveScroll: true });
                showToast(`✅ "${newEx.name}" alternatifi seçildi!`);
            }
            playAlertSound();
        }

        // ==================== FINISHER & EXTRA EXERCISES SYSTEM ====================
        function openAddFinisherModal() {
            if (!activeWorkoutSession) {
                alert("Önce bir antrenman başlatmalısınız.");
                return;
            }
            const modal = document.getElementById('addFinisherModal');
            if (modal) modal.classList.add('active');
        }

        function closeAddFinisherModal() {
            const modal = document.getElementById('addFinisherModal');
            if (modal) modal.classList.remove('active');
        }

        function addPresetFinisher(presetKey) {
            if (!activeWorkoutSession) return;
            const presets = {
                core_armor: [
                    { id: 'bw_plank', name: 'Plank', equipment: 'bodyweight', muscle: 'Core, Karın', cue: 'Karnı ve kalçayı sıkın, düz bir hat koruyun.', category: 'core', weightKey: 'bw' },
                    { id: 'bw_hanging_knee_raise', name: 'Hanging Knee Raise', equipment: 'bodyweight', muscle: 'Alt Karın', cue: 'Salınım yapmadan dizleri göğse çekin.', category: 'core', weightKey: 'bw' }
                ],
                arms_pump: [
                    { id: 'db_hammer_curl', name: 'Dambıl Hammer Curl', equipment: 'dumbbell', muscle: 'Biceps, Ön Kol', cue: 'Dirsekleri gövdeye sabitleyin, nötr tutuşla kaldırın.', category: 'pull', weightKey: 'db_curl' },
                    { id: 'db_triceps_overhead', name: 'Dambıl Overhead Triceps', equipment: 'dumbbell', muscle: 'Triceps', cue: 'Dirsekleri açmadan baş arkasından yukarı itin.', category: 'push', weightKey: 'db_triceps' }
                ],
                shoulder_wings: [
                    { id: 'db_lateral_raise', name: 'Dambıl Lateral Raise', equipment: 'dumbbell', muscle: 'Yan Omuz', cue: 'Dirsekleri hafif bükülü tutarak yana açın.', category: 'push', weightKey: 'db_lateral' },
                    { id: 'mach_face_pull', name: 'Kablo / Lastik Face Pull', equipment: 'machine', muscle: 'Arka Omuz, Trapez', cue: 'Halatı alına doğru çekin, kürek kemiklerini sıkın.', category: 'pull', weightKey: 'mach_pull' }
                ],
                farmers_walk: [
                    { id: 'db_farmers_walk', name: 'Dambıl Çift Yürüyüş (Farmer’s Carry)', equipment: 'dumbbell', muscle: 'Kavrama, Trapez, Core', cue: 'Omuzlar geride, göğüs dik, kontrollü adımlarla yürüyün.', category: 'core', weightKey: 'db_carry' }
                ],
                cardio_burn: [
                    { id: 'db_swing', name: 'Dambıl / Kettlebell Swing', equipment: 'dumbbell', muscle: 'Kalça, Arka Bacak, Kondisyon', cue: 'Kalça menteşesiyle patlayıcı güç üretin.', category: 'legs_hinge', weightKey: 'db_swing' },
                    { id: 'bw_burpee', name: 'Burpee Finisher', equipment: 'bodyweight', muscle: 'Tüm Vücut, Kalp-Damar', cue: 'Hızlıca şınav pozisyonuna inip sıçrayarak kalkın.', category: 'conditioning', weightKey: 'bw' }
                ]
            };

            const selectedList = presets[presetKey];
            if (!selectedList) return;

            const user = getActiveUser();
            const weights = (user && user.weights) ? user.weights : {};

            selectedList.forEach(item => {
                const found = EXERCISES_DB.find(e => e.id === item.id) || item;
                const alreadyExists = activeWorkoutSession.exercises.some(e => e.id === found.id);
                if (!alreadyExists) {
                    activeWorkoutSession.exercises.push(found);
                }

                if (!alreadyExists || !Array.isArray(activeWorkoutSetsData[found.id]) || activeWorkoutSetsData[found.id].length === 0) {
                    const isBw = isExerciseBodyweight(found);
                    const isCardio = isExerciseCardioMinutes(found);
                    let defaultWeight = isCardio ? '' : getExerciseRememberedWeight(found);
                    if (isBw && !isCardio && (defaultWeight === '' || defaultWeight === null || isNaN(defaultWeight))) {
                        defaultWeight = 0;
                    }
                    const defaultReps = resolveDefaultExerciseSetTarget(found, '12');
                    activeWorkoutSetsData[found.id] = [
                        { setNo: 1, weight: defaultWeight, reps: defaultReps, completed: false, completedAt: null },
                        { setNo: 2, weight: defaultWeight, reps: defaultReps, completed: false, completedAt: null },
                        { setNo: 3, weight: defaultWeight, reps: defaultReps, completed: false, completedAt: null }
                    ];
                }
            });

            closeAddFinisherModal();
            activeFocusExIndex = activeWorkoutSession.exercises.length - 1;
            activeFocusSetIndex = 0;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            playAlertSound();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert("🔥 İlave Finisher seansınıza eklendi! Son egzersiz olarak odaklandınız.");
        }

        // ==================== FIREBASE FIRESTORE BUG REPORT ENGINE ====================
        let currentBugReportTarget = null;
        let selectedBugCategory = 'image_mismatch';

        function openExerciseBugReportModal(exId, exName, imageSrc, equip, muscle, sourceScreen) {
            let finalName = exName || '';
            let finalImage = imageSrc || '';
            let finalEquip = equip || '';
            let finalMuscle = muscle || '';

            if (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) {
                const ex = EXERCISES_DB.find(e => e.id === exId);
                if (ex) {
                    if (!finalName) finalName = ex.name;
                    if (!finalEquip) finalEquip = ex.equipment;
                    if (!finalMuscle) finalMuscle = ex.muscle;
                    if (!finalImage) {
                        const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) || null;
                        if (guide && guide.form) finalImage = guide.form;
                        else if (ex.diagram) finalImage = ex.diagram;
                    }
                }
            }

            let autoScreen = sourceScreen;
            if (!autoScreen) {
                if (activeWorkoutSession) {
                    autoScreen = (activeWorkoutViewMode === 'focus') ? 'Canlı Antrenman (Odak Modu)' : 'Canlı Antrenman (Liste Görünümü)';
                } else {
                    const activeTab = document.querySelector('.tab-content.active');
                    if (activeTab) {
                        if (activeTab.id === 'generatorTab') autoScreen = 'Sihirbaz (Oluştur Sekmesi)';
                        else if (activeTab.id === 'activeWorkoutTab') autoScreen = 'Antrenman / Atölye';
                        else if (activeTab.id === 'historyTab') autoScreen = 'Geçmiş';
                        else if (activeTab.id === 'libraryTab') autoScreen = 'Kütüphane';
                        else autoScreen = activeTab.id;
                    } else {
                        autoScreen = 'Genel Egzersiz Kartı';
                    }
                }
            }

            currentBugReportTarget = {
                id: exId,
                name: finalName,
                imageSrc: finalImage || '',
                equipment: finalEquip || '',
                muscle: finalMuscle || '',
                sourceScreen: autoScreen
            };

            const exNameEl = document.getElementById('bugReportExName');
            const exMetaEl = document.getElementById('bugReportExMeta');
            const imgEl = document.getElementById('bugReportImgPreview');
            const imgBox = document.getElementById('bugReportImgPreviewBox');
            const noteEl = document.getElementById('bugReportUserNote');

            if (exNameEl) exNameEl.innerText = finalName;
            if (exMetaEl) exMetaEl.innerText = `[${autoScreen}] • ${finalEquip || 'Genel'} • ${finalMuscle || 'Kas'}`;
            if (noteEl) noteEl.value = '';

            if (imgEl && imgBox) {
                if (finalImage) {
                    imgEl.src = finalImage;
                    imgEl.style.display = 'block';
                } else {
                    imgEl.style.display = 'none';
                    imgBox.innerHTML = '<span style="font-size:24px;">🏋️</span>';
                }
            }

            selectBugCategory('image_mismatch');
            const modal = document.getElementById('exerciseBugReportModal');
            if (modal) modal.classList.add('active');
        }

        function closeExerciseBugReportModal() {
            const modal = document.getElementById('exerciseBugReportModal');
            if (modal) modal.classList.remove('active');
            currentBugReportTarget = null;
        }

        function selectBugCategory(cat) {
            selectedBugCategory = cat;
            const cats = ['image_mismatch', 'equipment_mismatch', 'cue_technique', 'name_mismatch', 'other'];
            cats.forEach(c => {
                const el = document.getElementById('bugCat_' + c);
                if (el) el.classList.toggle('selected', c === cat);
            });
        }

        async function submitExerciseBugReport() {
            if (!currentBugReportTarget) return;

            const categoryLabels = {
                image_mismatch: "Görsel Harekete Uymuyor",
                equipment_mismatch: "Ekipman / Pozisyon Yanlış",
                cue_technique: "Form / İpucu Hatalı",
                name_mismatch: "İsim / Adlandırma Hatalı",
                other: "Diğer / Genel Aksaklık"
            };

            const user = getActiveUser();
            const noteVal = (document.getElementById('bugReportUserNote').value || '').trim();
            const docId = `bug_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

            const report = {
                id: docId,
                exerciseId: currentBugReportTarget.id,
                exerciseName: currentBugReportTarget.name,
                category: selectedBugCategory,
                categoryLabel: categoryLabels[selectedBugCategory] || selectedBugCategory,
                userNote: noteVal,
                currentImageSrc: currentBugReportTarget.imageSrc || '',
                equipment: currentBugReportTarget.equipment || '',
                muscle: currentBugReportTarget.muscle || '',
                sourceScreen: currentBugReportTarget.sourceScreen || 'Egzersiz Kartı',
                workoutTitle: (activeWorkoutSession && activeWorkoutSession.title) ? activeWorkoutSession.title : (currentBugReportTarget.sourceScreen || 'Serbest İnceleme'),
                userId: getActiveUserId(),
                userName: user.name || 'Ferit',
                status: 'pending_ai_review',
                aiResolutionNote: '',
                createdAt: new Date().toISOString(),
                createdAtFormatted: new Date().toLocaleString('tr-TR')
            };

            try {
                let localReports = [];
                const raw = localStorage.getItem('celik_kodu_bug_reports');
                if (raw) localReports = JSON.parse(raw) || [];
                localReports.unshift(report);
                localStorage.setItem('celik_kodu_bug_reports', JSON.stringify(localReports));
            } catch(e) {}

            let cloudSaved = false;
            if (fbDb && isFirebaseReady) {
                try {
                    await fbDb.collection('exercise_bug_reports').doc(docId).set({
                        ...report,
                        serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    cloudSaved = true;
                    console.log("🔥 Hata bildirimi Firestore SDK ile yazıldı:", docId);
                } catch(err) {
                    console.warn("Firestore SDK yazma hatası, REST deneniyor:", err);
                }
            }

            if (!cloudSaved) {
                try {
                    const restFields = {};
                    for (const [k, v] of Object.entries(report)) {
                        if (typeof v === 'string') restFields[k] = { stringValue: v };
                        else if (typeof v === 'number') restFields[k] = { doubleValue: v };
                        else if (typeof v === 'boolean') restFields[k] = { booleanValue: v };
                        else if (v === null || v === undefined) restFields[k] = { nullValue: null };
                    }
                    const restUrl = `https://firestore.googleapis.com/v1/projects/fitness-4f427/databases/(default)/documents/exercise_bug_reports?documentId=${docId}`;
                    const resp = await fetch(restUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fields: restFields })
                    });
                    if (resp.ok) {
                        cloudSaved = true;
                        console.log("🔥 Hata bildirimi Firestore REST ile yazıldı:", docId);
                    }
                } catch(restErr) {
                    console.warn("Firestore REST yazma hatası (Yerelde saklandı):", restErr);
                }
            }

            closeExerciseBugReportModal();
            playAlertSound();
            alert(`✅ Bildiriminiz ${cloudSaved ? 'Firebase bulut havuzuna' : 'havuza'} kaydedildi!\n\nAI antrenörüne talimat verdiğinizde bu rapor doğrudan incelenecek ve siz onay verdikten sonra silinecektir.`);
        }

        async function openBugReportsPoolModal() {
            const modal = document.getElementById('bugReportsPoolModal');
            if (modal) modal.classList.add('active');

            const listEl = document.getElementById('bugReportsPoolList');
            const countEl = document.getElementById('bugPoolCountText');
            if (listEl) listEl.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-secondary);"><span style="font-size:24px;">🔄</span><br>Firebase veritabanı taranıyor...</div>`;

            let reports = [];

            if (fbDb && isFirebaseReady) {
                try {
                    const snap = await fbDb.collection('exercise_bug_reports').get();
                    snap.forEach(doc => {
                        const d = doc.data();
                        d._docId = doc.id;
                        reports.push(d);
                    });
                } catch(e) {
                    console.warn("Firestore SDK okuma hatası, REST deneniyor:", e);
                }
            }

            if (reports.length === 0) {
                try {
                    const resp = await fetch('https://firestore.googleapis.com/v1/projects/fitness-4f427/databases/(default)/documents/exercise_bug_reports');
                    if (resp.ok) {
                        const data = await resp.json();
                        const docs = data.documents || [];
                        docs.forEach(doc => {
                            const name = doc.name || '';
                            const docId = name.split('/').pop();
                            const fields = doc.fields || {};
                            const parsed = { _docId: docId };
                            for (const [k, v] of Object.entries(fields)) {
                                parsed[k] = v.stringValue || v.integerValue || v.doubleValue || (v.booleanValue !== undefined ? v.booleanValue : '');
                            }
                            reports.push(parsed);
                        });
                    }
                } catch(restErr) {
                    console.warn("REST okuma hatası:", restErr);
                }
            }

            if (reports.length === 0) {
                try {
                    const raw = localStorage.getItem('celik_kodu_bug_reports');
                    if (raw) reports = JSON.parse(raw) || [];
                } catch(e) {}
            }

            reports = (reports || []).filter(r => r && !String(r._docId || r.id || '').startsWith('garmin_relay_') && !r.payloadJson);

            if (countEl) countEl.innerText = `${reports.length} Bildirim Havuzda`;

            if (reports.length === 0) {
                if (listEl) {
                    listEl.innerHTML = `
                        <div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
                            <span style="font-size:36px;">🎉</span>
                            <div style="font-size:14px; font-weight:800; color:#0F172A; margin-top:8px;">Hata Havuzu Tertemiz!</div>
                            <p style="font-size:12px; margin-top:4px;">Şu an bekleyen veya bildirilmiş bir egzersiz hatası bulunmuyor.</p>
                        </div>
                    `;
                }
                return;
            }

            if (listEl) {
                listEl.innerHTML = reports.map(r => {
                    const docId = r._docId || r.id;
                    const isPending = r.status === 'pending_ai_review';
                    const isProcessed = r.status === 'ai_processed_awaiting_user_ok';
                    const statusText = isPending ? '🟡 AI İncelemesi Bekliyor' : (isProcessed ? '🔵 AI Düzeltti (Onay Bekliyor)' : '🟢 Tamamlandı');

                    return `
                        <div class="bug-pool-card ${isPending ? 'pending' : (isProcessed ? 'processed' : 'resolved')}">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                                <div>
                                    <div style="font-size:14px; font-weight:900; color:#0F172A;">
                                        ${escapeHTML(r.exerciseName || r.exerciseId)}
                                    </div>
                                    <div style="font-size:11px; color:var(--gold); font-weight:700; margin-top:2px;">
                                        ${escapeHTML(r.categoryLabel || r.category)}
                                    </div>
                                </div>
                                <span style="font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:4px; background:#F1F5F9;">
                                    ${statusText}
                                </span>
                            </div>

                            ${r.userNote ? `
                                <div style="font-size:12px; color:#475569; margin-top:8px; background:#F8FAFC; padding:6px 10px; border-radius:6px; border-left:2px solid var(--cyan);">
                                    💬 <em>"${escapeHTML(r.userNote)}"</em>
                                </div>
                            ` : ''}

                            ${r.aiResolutionNote ? `
                                <div style="font-size:11.5px; color:#15803D; margin-top:6px; background:rgba(34,197,94,0.1); padding:6px 10px; border-radius:6px;">
                                    🤖 <strong>AI Notu:</strong> ${escapeHTML(r.aiResolutionNote)}
                                </div>
                            ` : ''}

                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:10.5px; color:var(--text-secondary); flex-wrap:wrap; gap:6px;">
                                <span>📅 ${escapeHTML(r.createdAtFormatted || (r.createdAt ? r.createdAt.substring(0, 16) : ''))}</span>
                                <button type="button" class="btn btn-outline" style="border-color:#22c55e; color:#15803D; font-size:11px; padding:4px 10px; font-weight:800;" onclick="confirmAndDeleteBugReport(decodeURIComponent('${encodeURIComponent(docId)}'))">
                                    ✅ Onayla & Havuzdan Sil
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        function closeBugReportsPoolModal() {
            const modal = document.getElementById('bugReportsPoolModal');
            if (modal) modal.classList.remove('active');
        }

        async function confirmAndDeleteBugReport(docId) {
            if (!confirm("Bu hata düzeltmesini onaylıyor musunuz? Kayıt Firebase Firestore havuzundan kalıcı olarak silinecektir.")) {
                return;
            }

            if (fbDb && isFirebaseReady) {
                try {
                    await fbDb.collection('exercise_bug_reports').doc(docId).delete();
                    console.log("🔥 Firebase dokümanı silindi:", docId);
                } catch(e) {
                    console.warn("Firestore silme hatası:", e);
                }
            }

            try {
                const raw = localStorage.getItem('celik_kodu_bug_reports');
                if (raw) {
                    let list = JSON.parse(raw) || [];
                    list = list.filter(r => (r._docId !== docId && r.id !== docId));
                    localStorage.setItem('celik_kodu_bug_reports', JSON.stringify(list));
                }
            } catch(e) {}

            alert("✅ Kayıt başarıyla silindi ve havuz güncellendi.");
            openBugReportsPoolModal();
        }

        async function copyBugReportsToClipboard() {
            let reports = [];
            if (fbDb && isFirebaseReady) {
                try {
                    const snap = await fbDb.collection('exercise_bug_reports').get();
                    snap.forEach(doc => {
                        const d = doc.data();
                        d._docId = doc.id;
                        reports.push(d);
                    });
                } catch(e) {}
            }
            if (reports.length === 0) {
                try {
                    const raw = localStorage.getItem('celik_kodu_bug_reports');
                    if (raw) reports = JSON.parse(raw) || [];
                } catch(e) {}
            }

            if (reports.length === 0) {
                alert("Havuzda bekleyen hata bildirimi bulunmuyor.");
                return;
            }

            let text = "Antigravity AI Antrenörüne Görev Emri:\n";
            text += "Aşağıdaki egzersiz hata bildirimleri antrenman esnasında Firebase havuzuna kaydedildi. Lütfen kodda ve görsellerde düzeltmeleri yap:\n\n";

            reports.forEach((r, idx) => {
                text += `${idx + 1}. [${r.exerciseId}] ${r.exerciseName}\n`;
                text += `   - Hata Türü: ${r.categoryLabel || r.category}\n`;
                text += `   - Kullanıcı Notu: ${r.userNote || 'Belirtilmedi'}\n`;
                text += `   - Mevcut Görsel: ${r.currentImageSrc || 'Yok'}\n`;
                text += `   - Rapor ID: ${r._docId || r.id}\n\n`;
            });

            text += "Düzeltmeleri tamamladıktan sonra bana rapor ver, benden onay aldıktan sonra bu kayıtları Firebase'den sileceğiz.";

            try {
                await navigator.clipboard.writeText(text);
                alert("📋 Hazır AI Talimat Metni panoya kopyalandı!\n\nŞimdi sohbet alanına yapıştırıp gönderebilirsiniz.");
            } catch(e) {
                prompt("Aşağıdaki metni kopyalayıp AI sohbetine iletebilirsiniz:", text);
            }
        }

        function removeExerciseFromWorkout(exId, scope = 'generated') {
            const workout = scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) return;

            if (workout.exercises.length <= 1) {
                alert("Antrenmanda en az 1 egzersiz kalmalıdır!");
                return;
            }

            const ex = workout.exercises.find(e => e.id === exId);
            if (confirm(`"${ex ? ex.name : 'Bu egzersizi'}" antrenman programından kaldırmak istediğinize emin misiniz?`)) {
                workout.exercises = workout.exercises.filter(e => e.id !== exId);
                syncWorkoutPersistenceAfterEdit(workout, scope, exId, null);
                if (scope === 'active') {
                    saveActiveWorkoutStateToStorage();
                    const savedScrollY = window.scrollY;
                    renderActiveWorkout();
                    if (Math.abs(window.scrollY - savedScrollY) > 1) {
                        window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
                    }
                } else if (scope === 'weekly_preview' && window.pendingAiWeeklyPlan) {
                    window.expandedWeeklyExIndex = null;
                    renderPendingWeeklyPlanPreview({ preserveScroll: true });
                } else {
                    window.expandedGeneratedExIndex = null;
                    renderGeneratedWorkout({ preserveScroll: true });
                }
            }
        }

        function swapSingleExercise(currentExId, scope = 'generated') {
            const workout = scope === 'active' ? activeWorkoutSession : currentGeneratedWorkout;
            if (!workout) return;

            const exIndex = workout.exercises.findIndex(e => e.id === currentExId);
            if (exIndex === -1) return;

            const currentEx = workout.exercises[exIndex];
            const usedIds = workout.exercises.map(e => e.id);
            const otherExercises = workout.exercises.filter((_, i) => i !== exIndex);
            const otherFamilies = new Set(
                otherExercises.map(e => getExerciseMovementFamily(e)).filter(Boolean)
            );
            const currentSubKey = getExerciseAnatomy(currentEx)?.subKey;

            // Pool of alternatives in the same category & available equipments (without movement family twins or >=70% angle+muscle overlap)
            let pool = filterExercises(currentEx.category, usedIds).filter(e =>
                !otherFamilies.has(getExerciseMovementFamily(e)) &&
                !hasBiomechAngleAndMuscleConflict(e, otherExercises)
            );
            // Önce aynı anatomik alt başı (subKey) vuran alternatifleri tercih et
            if (currentSubKey) {
                const sameSubPool = pool.filter(e => getExerciseAnatomy(e)?.subKey === currentSubKey);
                if (sameSubPool.length > 0) pool = sameSubPool;
            }
            let replacement = pickRandom(pool);
            if (!replacement) {
                let relatedCat = currentEx.category;
                if (currentEx.category === 'push') relatedCat = ['push', 'core'];
                else if (currentEx.category === 'pull') relatedCat = ['pull', 'core'];
                else if (currentEx.category === 'legs_quad' || currentEx.category === 'legs_hinge') relatedCat = ['legs_quad', 'legs_hinge', 'core'];

                const fallback = EXERCISES_DB.filter(e =>
                    !isExerciseExcludedByUser(e.id) &&
                    isExerciseEquipmentAvailable(e) &&
                    !usedIds.includes(e.id) &&
                    !otherFamilies.has(getExerciseMovementFamily(e)) &&
                    !hasBiomechAngleAndMuscleConflict(e, otherExercises) &&
                    (Array.isArray(relatedCat) ? relatedCat.includes(e.category) : e.category === relatedCat)
                );
                replacement = pickRandom(fallback);
            }

            if (replacement) {
                const newExObj = Object.assign({}, replacement, {
                    targetSets: currentEx.targetSets || 3,
                    targetReps: currentEx.targetReps || '8-12',
                    logs: currentEx.logs || []
                });
                workout.exercises[exIndex] = newExObj;
                syncWorkoutPersistenceAfterEdit(workout, scope, currentExId, newExObj);
                if (scope === 'active') {
                    saveActiveWorkoutStateToStorage();
                    const savedScrollY = window.scrollY;
                    renderActiveWorkout();
                    if (Math.abs(window.scrollY - savedScrollY) > 1) {
                        window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
                    }
                } else if (scope === 'weekly_preview' && window.pendingAiWeeklyPlan) {
                    renderPendingWeeklyPlanPreview({ preserveScroll: true });
                } else {
                    renderGeneratedWorkout({ preserveScroll: true });
                }
                playAlertSound();
            } else {
                alert("Seçili ekipman havuzunda bu kas grubu için başka alternatif bulunamadı.");
            }
        }

