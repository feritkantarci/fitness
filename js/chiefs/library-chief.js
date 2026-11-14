// ==================== ODA 3: KÜTÜPHANE & KİŞİSEL HAVUZ ŞEFİ (library-guard) ====================
        // ==================== KULLANICI ÖZEL HAVUZ & GİZLEME YASASI ====================
        function purgeExcludedExerciseFromSavedPlans(exId) {
            if (!exId) return;
            try {
                const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                const stripEx = (arr) => Array.isArray(arr) ? arr.filter(item => item && item.id !== exId && item.exId !== exId) : arr;
                const cleanGenWorkoutKey = (storageKey, requireUidMatch) => {
                    const rawGen = localStorage.getItem(storageKey);
                    if (!rawGen || !rawGen.includes(exId)) return;
                    const parsedGen = JSON.parse(rawGen);
                    if (!parsedGen || typeof parsedGen !== 'object') return;
                    if (requireUidMatch && parsedGen.userId && uid && parsedGen.userId !== uid) return;
                    if (Array.isArray(parsedGen.exercises)) {
                        const next = stripEx(parsedGen.exercises);
                        if (next.length !== parsedGen.exercises.length) {
                            parsedGen.exercises = next;
                            if (typeof persistLastGeneratedWorkout === 'function') {
                                persistLastGeneratedWorkout(parsedGen, parsedGen.userId || uid, { skipCloudSync: true });
                            } else {
                                localStorage.setItem(storageKey, JSON.stringify(parsedGen));
                            }
                        }
                    }
                };
                if (uid) cleanGenWorkoutKey(`celik_kodu_last_generated_workout_${uid}`, true);
                cleanGenWorkoutKey('celik_kodu_last_generated_workout', true);
                if (typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && Array.isArray(currentGeneratedWorkout.exercises)) {
                    currentGeneratedWorkout.exercises = stripEx(currentGeneratedWorkout.exercises);
                }
                if (typeof activeWorkoutSession !== 'undefined' && activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises)) {
                    activeWorkoutSession.exercises = stripEx(activeWorkoutSession.exercises);
                }
                if (typeof customRoutineState !== 'undefined' && customRoutineState && Array.isArray(customRoutineState.exercises)) {
                    customRoutineState.exercises = stripEx(customRoutineState.exercises);
                }
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (!k) continue;
                    if (
                        k.startsWith('celik_kodu_active_state_') ||
                        k.startsWith('celik_kodu_weekly_schedule_') ||
                        k.startsWith('celik_kodu_next_weekly_schedule_') ||
                        k.startsWith('celik_kodu_date_schedule_') ||
                        k.startsWith('celik_kodu_date_overrides_') ||
                        k.startsWith('celik_kodu_pending_ai_weekly_')
                    ) {
                        const rawVal = localStorage.getItem(k);
                        if (!rawVal || !rawVal.includes(exId)) continue;
                        const obj = JSON.parse(rawVal);
                        if (!obj || typeof obj !== 'object') continue;
                        let changed = false;
                        if (Array.isArray(obj.exercises)) {
                            const next = stripEx(obj.exercises);
                            if (next.length !== obj.exercises.length) { obj.exercises = next; changed = true; }
                        }
                        if (obj.workout && Array.isArray(obj.workout.exercises)) {
                            const next = stripEx(obj.workout.exercises);
                            if (next.length !== obj.workout.exercises.length) { obj.workout.exercises = next; changed = true; }
                        }
                        Object.keys(obj).forEach(subKey => {
                            const dayObj = obj[subKey];
                            if (dayObj && typeof dayObj === 'object') {
                                if (Array.isArray(dayObj.exercises)) {
                                    const next = stripEx(dayObj.exercises);
                                    if (next.length !== dayObj.exercises.length) { dayObj.exercises = next; changed = true; }
                                }
                                if (dayObj.customWorkout && Array.isArray(dayObj.customWorkout.exercises)) {
                                    const next = stripEx(dayObj.customWorkout.exercises);
                                    if (next.length !== dayObj.customWorkout.exercises.length) { dayObj.customWorkout.exercises = next; changed = true; }
                                }
                            }
                        });
                        if (changed) {
                            localStorage.setItem(k, JSON.stringify(obj));
                        }
                    }
                }
            } catch (e) {}
        }

        function getExcludedExercisesStorageKey(targetUid) {
            const uid = targetUid
                || (typeof getActiveUserId === 'function' ? getActiveUserId() : null)
                || (window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid === 'function'
                    ? window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid()
                    : null);
            return uid ? `celik_excluded_exercises_${uid}` : 'celik_excluded_exercises';
        }

        function getExcludedExercisesUpdatedAt(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid) return 0;
            try {
                const n = Number(localStorage.getItem(`celik_excluded_updated_at_${uid}`) || 0);
                return (Number.isFinite(n) && n > 0) ? n : 0;
            } catch (e) {
                return 0;
            }
        }

        function getUserExcludedExerciseIds(targetUid) {
            try {
                const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
                const scopedKey = getExcludedExercisesStorageKey(uid);
                let raw = localStorage.getItem(scopedKey);
                if (!raw && uid === 'usr_admin') {
                    raw = localStorage.getItem('celik_excluded_exercises');
                }
                let arr = typeof sanitizeExcludedExerciseIds === 'function'
                    ? sanitizeExcludedExerciseIds(JSON.parse(raw || '[]'))
                    : JSON.parse(raw || '[]');
                if (!Array.isArray(arr)) arr = [];
                if (uid === 'usr_admin' && !localStorage.getItem('celik_excl_seed_sissy_v1')) {
                    if (!arr.includes('bw_sissy_squat')) {
                        arr.push('bw_sissy_squat');
                        localStorage.setItem(scopedKey, JSON.stringify(arr));
                    }
                    localStorage.setItem('celik_excl_seed_sissy_v1', '1');
                    purgeExcludedExerciseFromSavedPlans('bw_sissy_squat');
                }
                return arr;
            } catch(e) {
                return [];
            }
        }
        getUserExcludedExerciseIds();

        function setUserExcludedExerciseIds(arr, options = {}) {
            try {
                const uid = options.uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
                const scopedKey = getExcludedExercisesStorageKey(uid);
                const cleanArr = typeof sanitizeExcludedExerciseIds === 'function'
                    ? sanitizeExcludedExerciseIds(arr)
                    : (Array.isArray(arr) ? arr : []);
                localStorage.setItem(scopedKey, JSON.stringify(cleanArr));
                if (uid === 'usr_admin') {
                    localStorage.setItem('celik_excluded_exercises', JSON.stringify(cleanArr));
                }
                if (uid) {
                    const ts = (Number.isFinite(Number(options.updatedAt)) && Number(options.updatedAt) >= 0)
                        ? Number(options.updatedAt)
                        : Date.now();
                    localStorage.setItem(`celik_excluded_updated_at_${uid}`, String(ts));
                }
                if (!options.fromCloud && !options.skipCloudSync && typeof window.scheduleUserStateCloudSync === 'function') {
                    window.scheduleUserStateCloudSync(uid);
                }
            } catch(e) {}
        }

        function isExerciseExcludedByUser(exId) {
            if (!exId) return false;
            const excluded = getUserExcludedExerciseIds();
            return excluded.includes(exId);
        }

        function toggleExcludeExercise(exId, opts = {}) {
            if (!exId) return [];
            if (opts && opts.silent) {
                const current = getUserExcludedExerciseIds();
                const isAdding = !current.includes(exId);
                const next = isAdding ? [...current, exId] : current.filter(id => id !== exId);
                const saved = setUserExcludedExerciseIds(next, { skipCloudSync: true });
                if (isAdding && window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.inspectLibraryExclusionChange === 'function') {
                    if (typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && !window.currentGeneratedWorkout) {
                        window.currentGeneratedWorkout = currentGeneratedWorkout;
                    }
                    window.CelikLiaisonSubChiefs.inspectLibraryExclusionChange(exId);
                    if (typeof currentGeneratedWorkout !== 'undefined' && window.currentGeneratedWorkout) {
                        currentGeneratedWorkout = window.currentGeneratedWorkout;
                    }
                }
                return saved;
            }
            return toggleExerciseExclusionAndRefresh(exId);
        }
        window.toggleExcludeExercise = toggleExcludeExercise;

        function toggleExerciseExclusionAndRefresh(exId) {
            if (!exId) return false;
            const ex = EXERCISES_DB.find(e => e.id === exId);
            const exName = ex ? ex.name : exId;
            let list = getUserExcludedExerciseIds();
            const idx = list.indexOf(exId);
            let isNowExcluded = false;

            if (idx >= 0) {
                list.splice(idx, 1);
                isNowExcluded = false;
                if (typeof showToast === 'function') {
                    showToast(`✅ "${exName}" geri alındı.`);
                }
            } else {
                list.push(exId);
                isNowExcluded = true;
                if (typeof showToast === 'function') {
                    showToast(`👁️ "${exName}" gizlendi.`);
                }
            }

            setUserExcludedExerciseIds(list);
            if (isNowExcluded) {
                purgeExcludedExerciseFromSavedPlans(exId);
                if (window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.inspectLibraryExclusionChange === 'function') {
                    if (typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && !window.currentGeneratedWorkout) {
                        window.currentGeneratedWorkout = currentGeneratedWorkout;
                    }
                    window.CelikLiaisonSubChiefs.inspectLibraryExclusionChange(exId);
                    if (typeof currentGeneratedWorkout !== 'undefined' && window.currentGeneratedWorkout) {
                        currentGeneratedWorkout = window.currentGeneratedWorkout;
                    }
                }
            }

            if (typeof updateExDetailModalHideButton === 'function') {
                updateExDetailModalHideButton(exId);
            }
            if (typeof renderLibraryExerciseCatalog === 'function') {
                renderLibraryExerciseCatalog();
            }
            if (typeof renderStudioExerciseCatalog === 'function') {
                renderStudioExerciseCatalog();
            }
            if (typeof renderGeneratedWorkout === 'function' && currentGeneratedWorkout) {
                renderGeneratedWorkout();
            }
            if (typeof renderActiveWorkout === 'function' && activeWorkoutSession) {
                renderActiveWorkout();
            }
            if (typeof renderExercisePicker === 'function' && document.getElementById('exercisePickerModal')?.classList.contains('active')) {
                renderExercisePicker();
            }
            return isNowExcluded;
        }

        function updateExDetailModalHideButton(exId) {
            const btn = document.getElementById('btnExDetailToggleHide');
            if (!btn) return;
            const isExcluded = isExerciseExcludedByUser(exId);
            if (isExcluded) {
                btn.innerHTML = '🔄 Geri Al';
                btn.style.color = '#15803D';
                btn.style.borderColor = '#10b981';
                btn.style.background = 'rgba(16, 185, 129, 0.15)';
                btn.title = 'Aktif havuzunuza geri ekleyin';
            } else {
                btn.innerHTML = '👁️ Gizle';
                btn.style.color = '#DC2626';
                btn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                btn.style.background = 'rgba(239, 68, 68, 0.1)';
                btn.title = 'Kişisel havuzunuzdan gizleyin';
            }
        }

        function getEffectiveExerciseCategory(ex) {
            if (!ex) return '';
            if (ex.id === 'db_lying_leg_curl') return 'legs_hinge';
            if (ex.id === 'db_standing_calf_raise' || ex.id === 'bw_sissy_squat') return 'legs_quad';
            return ex.category || '';
        }

        function filterExercises(category, excludeIds = []) {
            return EXERCISES_DB.filter(ex => {
                if (isExerciseExcludedByUser(ex.id)) return false;
                if (excludeIds.includes(ex.id)) return false;
                if (!isExerciseEquipmentAvailable(ex)) return false;
                if (category === 'any') return true;
                const effCat = getEffectiveExerciseCategory(ex);
                if (Array.isArray(category)) return category.includes(effCat);
                return effCat === category;
            });
        }


        // ==================== LIBRARY & SAVED PROGRAMS ====================
        function saveGeneratedToLibrary() {
            if (!currentGeneratedWorkout) return;
            const user = typeof getActiveUser === 'function' ? getActiveUser() : null;
            const uid = (user && user.id) || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid) return;

            const name = prompt("Bu antrenman programı için bir isim verin:", currentGeneratedWorkout.title);
            if (!name || !name.trim()) return;

            const programToSave = JSON.parse(JSON.stringify(currentGeneratedWorkout));
            programToSave.id = 'saved_' + Date.now();
            programToSave.title = name.trim().slice(0, 160);
            programToSave.isCustom = true;
            programToSave.updatedAt = Date.now();

            upsertUserCustomProgram(programToSave, uid);
            if (typeof renderLibrary === 'function') renderLibrary();
            if (typeof showToast === 'function') {
                showToast("✅ Program kütüphaneye kaydedildi!");
            } else {
                alert("✅ Program başarıyla kütüphanenize kaydedildi!");
            }
        }

        // ==================== LIBRARY SUB-TABS & EXERCISE CATALOG ====================
        let currentLibrarySubTab = 'exercises';

        function updateLibrarySubTabButtons() {
            const btnEx = document.getElementById('libSubTabExercisesBtn');
            const btnProg = document.getElementById('libSubTabProgramsBtn');
            const isProg = currentLibrarySubTab === 'programs';
            if (btnEx) {
                btnEx.style.background = isProg ? '#F1F5F9' : '#0F172A';
                btnEx.style.color = isProg ? '#334155' : '#FFFFFF';
            }
            if (btnProg) {
                btnProg.style.background = isProg ? '#0F172A' : '#F1F5F9';
                btnProg.style.color = isProg ? '#FFFFFF' : '#334155';
                const savedCount = typeof getUserCustomPrograms === 'function' ? getUserCustomPrograms().length : 0;
                btnProg.textContent = savedCount > 0 ? `Programlarım (${savedCount})` : 'Programlarım';
            }
        }

        function switchLibrarySubTab(tab) {
            currentLibrarySubTab = (tab === 'programs') ? 'programs' : 'exercises';
            const paneProg = document.getElementById('libPanePrograms');
            const paneEx = document.getElementById('libPaneExercises');

            if (paneProg) paneProg.style.display = currentLibrarySubTab === 'programs' ? 'block' : 'none';
            if (paneEx) paneEx.style.display = currentLibrarySubTab === 'programs' ? 'none' : 'block';

            updateLibrarySubTabButtons();
            if (currentLibrarySubTab === 'programs') {
                renderSavedProgramsPane();
            } else {
                renderLibraryExerciseCatalog();
            }
        }

        function openExerciseLibraryTab(searchQuery = '') {
            switchTab('libraryTab');
            switchLibrarySubTab('exercises');
            if (searchQuery) {
                const inp = document.getElementById('libExSearchInput');
                if (inp) inp.value = searchQuery;
            }
            renderLibraryExerciseCatalog();
        }

        function normalizeSearchTextTR(str) {
            if (!str) return '';
            return String(str)
                .toLocaleLowerCase('tr-TR')
                .replace(/ı/g, 'i')
                .replace(/İ/g, 'i')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/['’`\-_\/()]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        const EXERCISE_BILINGUAL_NAME_PATCHES = {
            db_farmers_walk: "Çiftçi Yürüyüşü (Farmer's Walk / Carry)",
            db_suitcase_carry: "Tek El Çanta Taşıma (Suitcase Carry)",
            db_walking_lunge: "Yürüyerek Lunge (Walking Lunge)"
        };

        let _bilingualNamesPatched = false;
        function ensureBilingualExerciseNames() {
            if (_bilingualNamesPatched) return;
            if (typeof EXERCISES_DB === 'undefined' || !Array.isArray(EXERCISES_DB)) return;
            EXERCISES_DB.forEach(ex => {
                if (ex && EXERCISE_BILINGUAL_NAME_PATCHES[ex.id]) {
                    ex.name = EXERCISE_BILINGUAL_NAME_PATCHES[ex.id];
                }
            });
            _bilingualNamesPatched = true;
        }

        const EXERCISE_SEARCH_SYNONYMS = {
            db_farmers_walk: "ciftci yuruyusu ciftci tasimasi cift yuruyus farmer walk farmers walk farmer carry farmers carry agirlik tasima",
            db_suitcase_carry: "tek el canta tasima valiz tasima suitcase carry",
            db_walking_lunge: "yuruyerek lunge adim lunge walking lunge",
            db_swing: "kettlebell dambil swing salinim rus swing",
            bw_pushup: "sinav push up pushup",
            bw_pullup: "barfiks pull up pullup",
            bw_chinup: "barfiks chin up chinup",
            bw_plank: "plank karin",
            bw_burpee: "burpee kondisyon",
            bw_jumping_jack: "jumping jack yildiz sicrama ziplama kardiyo kondisyon isinma",
            bw_high_knees: "high knees dize cekerek kosu diz cekme kardiyo isinma",
            bw_jump_rope: "jump rope ip atlama golge ip sicrama kalf kardiyo",
            bw_butt_kicks: "butt kicks topuk kalcaya kosu hamstring isinma kardiyo",
            bw_skater_jumps: "skater jumps paten sicramasi yanal sicrama",
            bw_plank_jacks: "plank jacks plank bacak ac kapa karin kardiyo",
            bw_squat_thrust: "squat thrust yarim burpee kondisyon",
            bw_lateral_shuffle: "lateral shuffle yanal kayma hizli adimlama ceviklik",
            cond_indoor_row: "kurek cekme indoor row rowing ergometre kardiyo kondisyon isinma",
            cond_walking: "yuruyus walking doga yuruyusu hiking kardiyo kondisyon",
            cond_running: "kosu kosu bandi running treadmill jog sprint kardiyo kondisyon"
        };

        function getExerciseSearchHaystack(ex) {
            if (!ex) return '';
            if (typeof ex._cachedSearchHaystack === 'string') return ex._cachedSearchHaystack;
            const eqLabel = (typeof EQUIP_LABELS !== 'undefined' && EQUIP_LABELS[ex.equipment]?.label) || '';
            const syn = EXERCISE_SEARCH_SYNONYMS[ex.id] || '';
            const patchedName = EXERCISE_BILINGUAL_NAME_PATCHES[ex.id] || '';
            ex._cachedSearchHaystack = normalizeSearchTextTR(
                (ex.name || '') + ' ' +
                patchedName + ' ' +
                (ex.id || '') + ' ' +
                (ex.muscle || '') + ' ' +
                (ex.cue || '') + ' ' +
                (ex.equipment || '') + ' ' +
                eqLabel + ' ' +
                (ex.category || '') + ' ' +
                syn
            );
            return ex._cachedSearchHaystack;
        }

        function matchesExerciseSearch(ex, rawQuery, precomputedTokens = null) {
            if (!rawQuery && !precomputedTokens) return true;
            const tokens = precomputedTokens || normalizeSearchTextTR(rawQuery).split(' ').filter(Boolean);
            if (tokens.length === 0) return true;
            const haystack = getExerciseSearchHaystack(ex);
            return tokens.every(tok => haystack.includes(tok));
        }

        function clearLibExSearch() {
            const inp = document.getElementById('libExSearchInput');
            if (inp) inp.value = '';
            renderLibraryExerciseCatalog();
        }

        let currentLibraryExerciseMode = 'fitness'; // 'fitness' | 'cardio'

        function switchLibraryExerciseMode(mode) {
            currentLibraryExerciseMode = mode === 'cardio' ? 'cardio' : 'fitness';
            const fitBtn = document.getElementById('libModeFitnessBtn');
            const carBtn = document.getElementId('libModeCardioBtn');
            if (fitBtn) {
                const isFit = currentLibraryExerciseMode === 'fitness';
                fitBtn.style.background = isFit ? '#0F172A' : 'transparent';
                fitBtn.style.color = isFit ? '#FFFFFF' : '#0F172A';
                fitBtn.style.borderColor = isFit ? '#0F172A' : 'transparent';
            }
            if (carBtn) {
                const isCar = currentLibraryExerciseMode === 'cardio';
                carBtn.style.background = isCar ? '#0369A1' : 'transparent';
                carBtn.style.color = isCar ? '#FFFFFF' : '#0F172A';
                carBtn.style.borderColor = isCar ? '#0369A1' : 'transparent';
            }
            renderLibraryExerciseCatalog();
        }

        function buildLibraryCatalogDOM(container, excludedIds) {
            const excludedSet = new Set(excludedIds);
            const orderedDb = [...EXERCISES_DB];
            if (currentLibraryExerciseMode === 'cardio') {
                orderedDb.sort((a, b) => (/^cond_/.test(b.id) ? 1 : 0) - (/^cond_/.test(a.id) ? 1 : 0));
            }
            let html = '';
            orderedDb.forEach(ex => {
                const isExcluded = excludedSet.has(ex.id);
                const media = getExerciseVisualMedia(ex.id, ex.category);
                const thumbImg = media.still || '';
                const clipUrl = media.clip || '';
                const eqLabel = (typeof formatExerciseEquipmentText === 'function' && formatExerciseEquipmentText(ex))
                    ? formatExerciseEquipmentText(ex)
                    : ((typeof EQUIP_LABELS !== 'undefined' && EQUIP_LABELS[ex.equipment])
                        ? EQUIP_LABELS[ex.equipment].label
                        : (ex.equipment || 'Serbest'));

                html += `
                    <div data-lib-ex-id="${ex.id}" style="padding:8px 10px; background:${isExcluded ? '#FEF2F2' : '#F8FAFC'}; border:1px solid ${isExcluded ? '#FECACA' : '#E2E8F0'}; border-radius:10px; content-visibility:auto; contain-intrinsic-size:0 58px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            <div style="display:flex; align-items:center; gap:9px; min-width:0; flex:1; cursor:pointer;" onclick="toggleLibExerciseForm('${ex.id}')">
                                <div style="width:40px; height:40px; border-radius:8px; background:#FFFFFF; overflow:hidden; flex-shrink:0; border:1px solid #E2E8F0; display:flex; align-items:center; justify-content:center;">
                                    ${thumbImg ? `<img src="${thumbImg}" width="40" height="40" decoding="async" style="width:100%; height:100%; object-fit:contain;" alt="${escapeHTML(ex.name)}" loading="lazy">` : '🏋️'}
                                </div>
                                <div style="min-width:0; flex:1;">
                                    <div style="font-size:13px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                        ${escapeHTML(ex.name)}
                                    </div>
                                    <div style="font-size:10.5px; font-weight:700; color:${isExcluded ? '#B91C1C' : '#64748B'}; margin-top:1px;">
                                        ${escapeHTML(eqLabel)}${isExcluded ? ' • Gizli' : ''}
                                    </div>
                                </div>
                            </div>

                            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                                <button type="button" class="wk-ex-i-btn" onclick="event.stopPropagation(); openExerciseQuickInfoModal('${ex.id}')" title="Hareket Bilgisi">i</button>
                                ${isExcluded ? `
                                    <button type="button" class="stitch-ex-swap-pill" style="background:#15803D; color:#FFFFFF; border-color:#15803D; padding:6px 11px; font-size:11px; font-weight:800;" onclick="event.stopPropagation(); toggleExerciseExclusionAndRefresh('${ex.id}')">
                                        Geri Al
                                    </button>
                                ` : `
                                    <button type="button" class="stitch-ex-swap-pill" style="background:#FF5A36; color:#FFFFFF; border-color:#FF5A36; padding:6px 12px; font-size:11.5px; font-weight:800;" onclick="event.stopPropagation(); openAddToProgramOptions('${ex.id}')">
                                        + Ekle
                                    </button>
                                `}
                            </div>
                        </div>

                        <div id="lib_form_expand_${ex.id}" data-clip="${escapeHTML(clipUrl)}" data-thumb="${escapeHTML(thumbImg)}" data-name="${escapeHTML(ex.name || '')}" style="display:none; margin-top:8px; padding-top:8px; border-top:1px solid #E2E8F0;"></div>
                    </div>
                `;
            });
            html += `<div id="libCatalogEmptyState" style="display:none; grid-column: 1 / -1; text-align:center; padding:32px 16px; background:#F8FAFC; border-radius:12px; border:1px dashed var(--border);"></div>`;
            container.innerHTML = html;
        }

        function renderLibraryExerciseCatalog() {
            ensureBilingualExerciseNames();
            const container = document.getElementById('libExercisesCatalogGrid');
            const countBadge = document.getElementById('libExCountBadge');
            const subCountBadge = document.getElementById('libExSubCountBadge');
            const clearBtn = document.getElementById('libExClearSearchBtn');
            const excludedCountEl = document.getElementById('libExcludedCount');
            if (!container) return;

            const q = (document.getElementById('libExSearchInput')?.value || '').trim();
            const qTokens = q ? normalizeSearchTextTR(q).split(' ').filter(Boolean) : null;
            const muscle = document.getElementById('libExMuscleFilter')?.value || 'all';
            const equip = document.getElementById('libExEquipFilter')?.value || 'all';
            const showExcluded = !!document.getElementById('chkLibShowExcluded')?.checked;
            const excludedIds = getUserExcludedExerciseIds();
            const excludedSet = new Set(excludedIds);

            if (excludedCountEl) {
                excludedCountEl.innerText = excludedIds.length;
            }

            if (clearBtn) {
                clearBtn.style.display = q ? 'block' : 'none';
            }

            const cacheKey = `${currentLibraryExerciseMode}|${excludedIds.join(',')}`;
            if (container._libCatalogCacheKey !== cacheKey || !container.querySelector('[data-lib-ex-id]')) {
                buildLibraryCatalogDOM(container, excludedIds);
                container._libCatalogCacheKey = cacheKey;
            }

            const filtered = EXERCISES_DB.filter(ex => {
                const isExcluded = excludedSet.has(ex.id);
                const isStandaloneCardio = /^cond_/.test(String(ex.id || ''));
                if (currentLibraryExerciseMode === 'cardio') {
                    if (!isStandaloneCardio) return false;
                } else if (!q) {
                    if (isStandaloneCardio) return false;
                }
                // Arama kutusu doluyken (q varsa) gizlenmiş egzersiz de aramayla eşleşiyorsa kullanıcıya gösterilsin (Gizli etiketiyle)
                if (!q && (showExcluded ? !isExcluded : isExcluded)) return false;

                if (equip !== 'all' && !(typeof getExerciseRequiredEquipments === 'function' ? getExerciseRequiredEquipments(ex).includes(equip) : ex.equipment === equip)) return false;

                if (muscle !== 'all') {
                    const p = ex.primaryMuscles || [];
                    const s = ex.secondaryMuscles || [];
                    const allM = [...p, ...s];

                    if (muscle === 'chest') {
                        if (!allM.includes('chest') && ex.category !== 'push') return false;
                    } else if (muscle === 'back') {
                        if (!allM.includes('back') && ex.category !== 'pull') return false;
                    } else if (muscle === 'shoulders') {
                        if (!allM.includes('shoulders')) return false;
                    } else if (muscle === 'legs') {
                        const legMuscles = ['quads', 'hamstrings', 'glutes', 'calves'];
                        if (!allM.some(m => legMuscles.includes(m)) && !['legs_quad', 'legs_hinge'].includes(ex.category)) return false;
                    } else if (muscle === 'core') {
                        if (!allM.includes('core') && ex.category !== 'core') return false;
                    } else if (muscle === 'arms') {
                        if (!allM.some(m => ['biceps', 'triceps'].includes(m))) return false;
                    } else if (muscle === 'conditioning') {
                        if (ex.category !== 'conditioning' && !(ex.tags || []).includes('conditioning') && !ex.isComplex) return false;
                    }
                }

                if (qTokens && qTokens.length > 0 && !matchesExerciseSearch(ex, q, qTokens)) return false;

                return true;
            });

            const badgeText = `${filtered.length} ${currentLibraryExerciseMode === 'cardio' ? 'Kardiyo & Kondisyon' : 'Egzersiz'} ${showExcluded ? '(Gizlenenler)' : ''}`;
            if (countBadge) countBadge.innerText = badgeText;
            if (subCountBadge) subCountBadge.innerText = badgeText;

            const visibleIdSet = new Set(filtered.map(ex => ex.id));
            const cards = container.children;
            for (let i = 0; i < cards.length; i++) {
                const card = cards[i];
                const exId = card.getAttribute('data-lib-ex-id');
                if (!exId) continue;
                const isVis = visibleIdSet.has(exId);
                if (card.style.display !== (isVis ? '' : 'none')) {
                    card.style.display = isVis ? '' : 'none';
                }
            }

            const emptyEl = document.getElementById('libCatalogEmptyState');
            if (emptyEl) {
                if (filtered.length === 0) {
                    emptyEl.style.display = 'block';
                    emptyEl.innerHTML = `
                        <div style="font-size:28px; margin-bottom:8px;">${showExcluded ? '✨' : '🔍'}</div>
                        <div style="font-size:13.5px; font-weight:800; color:#0F172A; margin-bottom:4px;">${showExcluded ? 'Kişisel Havuzunuzdan Gizlenmiş Egzersiz Yok' : 'Aramanıza Uygun Egzersiz Bulunamadı'}</div>
                        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">${showExcluded ? 'Bir hareketi istemediğinizde "👁️‍🗨️ Gizle" butonuna basarak bu listeye alabilirsiniz.' : 'Filtreleri veya arama kelimesini değiştirerek tekrar deneyebilirsiniz.'}</div>
                        ${!showExcluded ? `<button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 12px;" onclick="document.getElementById('libExSearchInput').value=''; document.getElementById('libExMuscleFilter').value='all'; document.getElementById('libExEquipFilter').value='all'; renderLibraryExerciseCatalog();">Filtreleri Sıfırla</button>` : ''}
                    `;
                } else {
                    emptyEl.style.display = 'none';
                }
            }
        }

        function toggleLibExerciseForm(exId) {
            const box = document.getElementById('lib_form_expand_' + exId);
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
        window.toggleLibExerciseForm = toggleLibExerciseForm;

        // ==================== ADD TO PROGRAM OPTIONS MODAL LOGIC ====================
        function openAddToProgramOptions(exId) {
            const ex = EXERCISES_DB.find(e => e.id === exId);
            if (!ex) return;

            activeQuickAddExId = exId;
            const modal = document.getElementById('addToProgramOptionsModal');
            if (!modal) return;

            const titleEl = document.getElementById('addToProgModalTitle');
            if (/^cond_/.test(String(exId || ''))) { openQuickAddToDayModal(exId); return; }
            const subEl = document.getElementById('addToProgModalSubtitle');
            const dynamicBody = document.getElementById('addToProgModalBody');

            if (titleEl) titleEl.innerText = ex.name;
            if (subEl) subEl.style.display = 'none';

            const isWorkoutActive = Boolean(activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises));

            let html = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div class="add-to-prog-card" style="padding:10px 12px;" onclick="closeAddToProgramOptionsModal(); openQuickAddToDayModal(decodeURIComponent('${encodeURIComponent(ex.id)}'));">
                        <div style="font-size:20px; flex-shrink:0;">📅</div>
                        <div style="flex:1; font-size:13px; font-weight:800; color:#0F172A;">Haftalık Güne Planla</div>
                        <div style="font-size:12px; color:#FF5A36; font-weight:800;">Güne Ata ➔</div>
                    </div>

                    <div class="add-to-prog-card" style="padding:10px 12px; cursor:default;">
                        <div style="font-size:20px; flex-shrink:0;">🛠️</div>
                        <div style="flex:1;">
                            <div style="font-size:13px; font-weight:800; color:#0F172A; margin-bottom:6px;">Program Atölyesine Ekle</div>
                            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <select id="addToStudioSetsSelect" class="form-input" style="width:74px; padding:5px 6px; font-size:11.5px;">
                                    <option value="2">2 Set</option>
                                    <option value="3" selected>3 Set</option>
                                    <option value="4">4 Set</option>
                                    <option value="5">5 Set</option>
                                </select>
                                <select id="addToStudioRepsSelect" class="form-input" style="width:88px; padding:5px 6px; font-size:11.5px;">
                                    <option value="6-8">6-8 T.</option>
                                    <option value="8-10">8-10 T.</option>
                                    <option value="8-12" selected>8-12 T.</option>
                                    <option value="10-12">10-12 T.</option>
                                    <option value="12-15">12-15 T.</option>
                                    <option value="Maks">Maks</option>
                                </select>
                                <button type="button" class="stitch-ex-swap-pill" style="background:#FF5A36; color:#FFFFFF; border-color:#FF5A36; padding:6px 12px; font-size:11.5px; font-weight:800;" onclick="applyAddToStudioRoutine(decodeURIComponent('${encodeURIComponent(ex.id)}'))">
                                    + Ekle
                                </button>
                            </div>
                        </div>
                    </div>
            `;

            if (isWorkoutActive) {
                html += `
                    <div class="add-to-prog-card active-workout-highlight" style="padding:10px 12px;" onclick="applyAddToActiveWorkout('${ex.id}')">
                        <div style="font-size:20px; flex-shrink:0;">🏋️</div>
                        <div style="flex:1; font-size:13px; font-weight:800; color:#0F172A;">Canlı Antrenmana Ekle</div>
                        <div style="font-size:12px; color:#15803D; font-weight:800;">Ekle ➔</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="add-to-prog-card" style="padding:10px 12px;" onclick="startQuickWorkoutWithExercise('${ex.id}')">
                        <div style="font-size:20px; flex-shrink:0;">⚡</div>
                        <div style="flex:1; font-size:13px; font-weight:800; color:#0F172A;">Hızlı Seans Başlat</div>
                        <div style="font-size:12px; color:#0369A1; font-weight:800;">Başlat ➔</div>
                    </div>
                `;
            }

            html += `</div>`;
            dynamicBody.innerHTML = html;
            modal.classList.add('active');
        }

        function closeAddToProgramOptionsModal() {
            const modal = document.getElementById('addToProgramOptionsModal');
            if (modal) modal.classList.remove('active');
        }

        function applyAddToStudioRoutine(exId) {
            const sets = parseInt(document.getElementById('addToStudioSetsSelect')?.value) || 3;
            const reps = document.getElementById('addToStudioRepsSelect')?.value || '8-12';
            
            const ex = EXERCISES_DB.find(e => e.id === exId);
            if (!ex) return;

            if (!customRoutineState.exercises) customRoutineState.exercises = [];
            customRoutineState.exercises.push({
                exId: exId,
                sets: sets,
                reps: reps,
                weight: ''
            });

            closeAddToProgramOptionsModal();
            if (typeof renderCustomRoutine === 'function') renderCustomRoutine();
            if (typeof renderRegionStatus === 'function') renderRegionStatus();
            
            showToast(`✅ "${ex.name}" Program Atölyesi taslağınıza eklendi! (Toplam ${customRoutineState.exercises.length} hareket)`);
            playAlertSound();
        }

        function applyAddToActiveWorkout(exId) {
            const ex = EXERCISES_DB.find(e => e.id === exId);
            if (!ex || !activeWorkoutSession) return;

            activeWorkoutSession.exercises.push({
                ...ex,
                targetSets: 3,
                targetReps: '8-12',
                logs: []
            });

            if (!activeWorkoutSetsData[ex.id]) {
                activeWorkoutSetsData[ex.id] = [];
                const isBw = isExerciseBodyweight(ex);
                const isCardio = isExerciseCardioMinutes(ex);
                let defaultWeight = isCardio ? '' : getExerciseRememberedWeight(ex);
                if (isBw && !isCardio && (defaultWeight === '' || defaultWeight === null || isNaN(defaultWeight))) {
                    defaultWeight = 0;
                }
                const defaultReps = resolveDefaultExerciseSetTarget(ex, '8-12');
                const targetCount = isCardio ? 1 : 3;
                for (let s = 1; s <= targetCount; s++) {
                    activeWorkoutSetsData[ex.id].push({
                        setNo: s,
                        weight: defaultWeight,
                        reps: defaultReps,
                        completed: false,
                        completedAt: null
                    });
                }
            }

            activeFocusExIndex = activeWorkoutSession.exercises.length - 1;
            activeFocusSetIndex = null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            
            closeAddToProgramOptionsModal();
            switchTab('activeWorkoutTab');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast(`✅ "${ex.name}" canlı antrenmanınıza eklendi!`);
            playAlertSound();
        }

        function startQuickWorkoutWithExercise(exId) {
            const ex = EXERCISES_DB.find(e => e.id === exId);
            if (!ex) return;

            const sessionTitle = `${ex.name} Odaklı Seans`;
            if (!confirmOverwriteActiveWorkoutIfNeeded(sessionTitle)) {
                return;
            }

            const isStandaloneCardio = /^cond_/.test(String(ex.id || ''));
            let scheduledCardio = null;
            if (isStandaloneCardio) {
                try {
                    const todayPlan = (typeof getPlanForDate === 'function') ? getPlanForDate(new Date()) : null;
                    if (todayPlan && Array.isArray(todayPlan.extraCardioSessions)) {
                        scheduledCardio = todayPlan.extraCardioSessions.find(c => c && c.id === ex.id) || null;
                    }
                } catch (_) {}
            }

            const cardioDurMin = scheduledCardio && Number(scheduledCardio.durationMin) > 0
                ? Number(scheduledCardio.durationMin)
                : 20;
            const targetSetsCount = isStandaloneCardio ? 1 : 3;
            const targetRepsLabel = isStandaloneCardio
                ? (scheduledCardio && scheduledCardio.targetReps ? scheduledCardio.targetReps : `${cardioDurMin} dk`)
                : '8-12';

            const sessionObj = {
                id: 'quick_' + Date.now(),
                title: sessionTitle,
                split: 'custom',
                splitName: ex.name,
                style: 'classic',
                goal: isStandaloneCardio ? 'conditioning' : 'hypertrophy',
                duration: isStandaloneCardio ? cardioDurMin : 30,
                scheme: { sets: targetSetsCount, reps: targetRepsLabel, rest: 60 },
                warmups: [
                    { name: "Eklemsel CARs (Dinamik Isınma)", dur: "90 sn", cue: "Eklem kapsüllerini uyar ve ısıt." }
                ],
                exercises: [{
                    ...ex,
                    targetSets: targetSetsCount,
                    targetReps: targetRepsLabel,
                    cardioLimits: scheduledCardio ? {
                        durationMin: Number(scheduledCardio.durationMin || 0),
                        distanceMeters: Number(scheduledCardio.distanceMeters || 0),
                        targetHeartrate: Number(scheduledCardio.targetHeartrate || 0)
                    } : null,
                    logs: []
                }],
                finisher: { name: "Balistik Bitiş", desc: "Tempolu taşıma veya swing." },
                createdAt: Date.now()
            };

            activeWorkoutSession = sessionObj;
            activeWorkoutStartTime = Date.now();
            activeWorkoutIsPaused = false;
            activeWorkoutPausedAt = null;
            activeWorkoutTotalPausedMs = 0;
            activeWorkoutSetsData = {};
            activeWorkoutViewMode = 'focus';
            activeFocusExIndex = 0;
            activeFocusSetIndex = null;

            const isBw = isExerciseBodyweight(ex);
            const isTime = isExerciseTimeBased(ex);
            let defaultWeight = getExerciseRememberedWeight(ex);
            if (isBw && (defaultWeight === '' || defaultWeight === null || isNaN(defaultWeight))) {
                defaultWeight = 0;
            }
            const defaultReps = isStandaloneCardio ? cardioDurMin : (isTime ? 30 : 10);

            activeWorkoutSetsData[ex.id] = [];
            for (let s = 1; s <= targetSetsCount; s++) {
                activeWorkoutSetsData[ex.id].push({
                    setNo: s,
                    weight: defaultWeight,
                    reps: defaultReps,
                    completed: false,
                    completedAt: null
                });
            }

            closeAddToProgramOptionsModal();
            saveActiveWorkoutStateToStorage();
            startWorkoutTimer();
            renderActiveWorkout();
            switchTab('activeWorkoutTab');
            resetTimer(60);
            playAlertSound();
            requestWakeLock();
            showToast(`🚀 "${ex.name}" ile canlı antrenman başladı!`);
        }

        function renderSavedProgramsPane() {
            if (typeof updateLibrarySubTabButtons === 'function') updateLibrarySubTabButtons();
            const savedListEl = document.getElementById('savedProgramsList');
            const officialListEl = document.getElementById('officialProgramsList');
            const esc = typeof escapeHTML === 'function' ? escapeHTML : (s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));

            if (savedListEl) {
                const saved = typeof getUserCustomPrograms === 'function' ? getUserCustomPrograms() : [];
                if (!saved.length) {
                    savedListEl.innerHTML = `<div style="background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:10px; padding:14px; text-align:center; color:#475569; font-size:13px; font-weight:600;">Henüz kayıtlı program yok.</div>`;
                } else {
                    savedListEl.innerHTML = saved.map(prog => {
                        const titleText = esc(prog.title || 'Kayıtlı Program');
                        const exCount = Array.isArray(prog.exercises) ? prog.exercises.length : 0;
                        const dur = Number(prog.duration) > 0 ? Math.round(Number(prog.duration)) : 0;
                        const metaText = dur > 0 ? `${exCount} Hareket • ${dur} Dk` : `${exCount} Hareket`;
                        const encodedId = encodeURIComponent(String(prog.id || ''));
                        return `
                            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:12px 14px; margin-bottom:8px; box-shadow:0 1px 2px rgba(15,23,42,0.04);">
                                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                                    <div style="min-width:0;">
                                        <div style="font-size:14px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${titleText}</div>
                                        <div style="font-size:12px; font-weight:600; color:#475569; margin-top:2px;">${esc(metaText)}</div>
                                    </div>
                                </div>
                                <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                    <button type="button" onclick="loadSavedProgram(decodeURIComponent('${encodedId}'))" style="flex:1; min-width:80px; padding:8px 10px; font-size:12px; font-weight:800; border-radius:8px; border:none; background:#0F172A; color:#FFFFFF; cursor:pointer; white-space:nowrap;">Başlat</button>
                                    <button type="button" onclick="assignSavedProgramToCalendar(decodeURIComponent('${encodedId}'))" style="flex:1; min-width:96px; padding:8px 10px; font-size:12px; font-weight:800; border-radius:8px; border:1px solid #BFDBFE; background:#EFF6FF; color:#1D4ED8; cursor:pointer; white-space:nowrap;">Takvime Ekle</button>
                                    <button type="button" onclick="deleteSavedProgram(decodeURIComponent('${encodedId}'))" style="padding:8px 12px; font-size:12px; font-weight:800; border-radius:8px; border:1px solid #FECACA; background:#FEF2F2; color:#B91C1C; cursor:pointer; white-space:nowrap;">Sil</button>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            if (officialListEl) {
                const templates = [
                    { id: 'la_forja_day1', title: 'Çelik Kodu Gün 1', meta: '45 Dk • 6 Hareket • Omuz & Bacak Ön' },
                    { id: 'la_forja_day2', title: 'Çelik Kodu Gün 2', meta: '45 Dk • 6 Hareket • Sırt & Balistik Güç' },
                    { id: 'la_forja_day3', title: 'Çelik Kodu Gün 3', meta: '50 Dk • 5 Hareket • Kompleks & Merdiven' }
                ];
                officialListEl.innerHTML = templates.map(tpl => {
                    const encodedId = encodeURIComponent(tpl.id);
                    return `
                        <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:12px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
                            <div style="min-width:0;">
                                <div style="font-size:14px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${esc(tpl.title)}</div>
                                <div style="font-size:12px; font-weight:600; color:#475569; margin-top:2px;">${esc(tpl.meta)}</div>
                            </div>
                            <button type="button" onclick="loadOfficialRoutine(decodeURIComponent('${encodedId}'))" style="padding:8px 14px; font-size:12px; font-weight:800; border-radius:8px; border:none; background:#0F172A; color:#FFFFFF; cursor:pointer; white-space:nowrap; flex-shrink:0;">Aç</button>
                        </div>
                    `;
                }).join('');
            }
        }

        function renderLibrary(options = {}) {
            if (options && (options.subTab === 'programs' || options.subTab === 'exercises')) {
                currentLibrarySubTab = options.subTab;
            }
            const paneProg = document.getElementById('libPanePrograms');
            const paneEx = document.getElementById('libPaneExercises');
            const isProg = currentLibrarySubTab === 'programs';
            if (paneProg) paneProg.style.display = isProg ? 'block' : 'none';
            if (paneEx) paneEx.style.display = isProg ? 'none' : 'block';
            if (typeof updateLibrarySubTabButtons === 'function') updateLibrarySubTabButtons();
            if (isProg) {
                renderSavedProgramsPane();
            } else {
                renderLibraryExerciseCatalog();
            }
        }

        function loadSavedProgram(progId) {
            try {
                const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                const saved = typeof getUserCustomPrograms === 'function' ? getUserCustomPrograms(uid) : [];
                const found = saved.find(p => p && p.id === progId);
                if (found) {
                    const cloned = JSON.parse(JSON.stringify(found));
                    currentGeneratedWorkout = cloned;
                    window.currentGeneratedWorkout = cloned;
                    if (typeof persistLastGeneratedWorkout === 'function') {
                        persistLastGeneratedWorkout(cloned, uid, { skipCloudSync: true });
                    }
                    startActiveWorkoutFromGenerated();
                }
            } catch(e) {}
        }

        function assignSavedProgramToCalendar(progId) {
            try {
                const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                const saved = typeof getUserCustomPrograms === 'function' ? getUserCustomPrograms(uid) : [];
                const found = saved.find(p => p && p.id === progId);
                if (found && typeof openAssignWorkoutCalendarModal === 'function') {
                    openAssignWorkoutCalendarModal(JSON.parse(JSON.stringify(found)), 'current');
                }
            } catch(e) {}
        }

        function deleteSavedProgram(progId) {
            if (confirm("Bu kayıtlı programı silmek istediğinize emin misiniz?")) {
                try {
                    const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                    if (typeof removeUserCustomProgram === 'function') {
                        removeUserCustomProgram(progId, uid);
                    }
                    renderLibrary();
                } catch(e) {}
            }
        }

        function loadOfficialRoutine(routineId) {
            const routines = {
                la_forja_day1: {
                    title: '⚔️ Çelik Kodu Gün 1: Omuz & Bacak Ön Zırhı',
                    split: 'upper_push',
                    style: 'superset',
                    duration: 45,
                    scheme: { sets: 4, reps: '8 - 10', rest: 45 },
                    exerciseIds: ['db_overhead_press', 'db_goblet_squat', 'db_front_squat', 'bw_pushup', 'kb_halo', 'bw_hollow_body']
                },
                la_forja_day2: {
                    title: '⚔️ Çelik Kodu Gün 2: Sırt Çekiş & Balistik Güç',
                    split: 'upper_pull',
                    style: 'superset',
                    duration: 45,
                    scheme: { sets: 4, reps: '8 - 10', rest: 45 },
                    exerciseIds: ['db_saw_row', 'db_rdl', 'db_swing', 'bw_pullup', 'db_farmers_walk', 'db_russian_twist']
                },
                la_forja_day3: {
                    title: '⚔️ Çelik Kodu Gün 3: Kompleks & Merdiven',
                    split: 'full_body',
                    style: 'superset',
                    duration: 50,
                    scheme: { sets: 4, reps: '8 - 10', rest: 45 },
                    exerciseIds: ['db_snatch', 'db_walking_lunge', 'db_saw_row', 'db_front_squat', 'bw_burpee']
                }
            };

            const target = routines[routineId];
            if (!target) return;

            const exercises = target.exerciseIds.map(id => EXERCISES_DB.find(e => e.id === id)).filter(Boolean);

            currentGeneratedWorkout = {
                id: 'gen_' + Date.now(),
                title: target.title,
                split: target.split,
                splitName: 'Çelik Kodu Klasik',
                style: target.style,
                goal: 'hypertrophy',
                duration: target.duration,
                scheme: target.scheme,
                warmups: [
                    { name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ve geniş dairelerle ısıt." },
                    { name: "World's Greatest Stretch", dur: "60 sn", cue: "Derin lunge ile omurga rotasyonu." }
                ],
                exercises: exercises,
                finisher: { name: "3 Dk Tabata Finisher", desc: "Patlayıcı kondisyon" },
                createdAt: Date.now()
            };

            startActiveWorkoutFromGenerated();
        }


        // ==================== EXERCISE DETAIL MODAL LOGIC ====================
        function openExerciseDetailModal(exIdOrObj) {
            let ex = null;
            if (typeof exIdOrObj === 'object' && exIdOrObj !== null) {
                ex = exIdOrObj;
                if (!EXERCISES_DB.some(e => e.id === ex.id) && typeof findBestExerciseMatch === 'function') {
                    const dbMatch = findBestExerciseMatch(ex.name || ex.id);
                    if (dbMatch) {
                        ex = Object.assign({}, dbMatch, ex, { id: dbMatch.id, name: dbMatch.name });
                    }
                }
            } else if (typeof exIdOrObj === 'string' && exIdOrObj.trim() && exIdOrObj !== 'undefined' && exIdOrObj !== 'null') {
                const query = exIdOrObj.trim();
                ex = EXERCISES_DB.find(e => e.id === query);
                if (!ex) ex = EXERCISES_DB.find(e => e.name && e.name.toLowerCase() === query.toLowerCase());
                if (!ex && typeof findBestExerciseMatch === 'function') ex = findBestExerciseMatch(query);
                if (!ex) {
                    const nextSched = typeof getNextWeeklySchedule === 'function' ? getNextWeeklySchedule() : null;
                    if (nextSched) {
                        for (let d = 0; d < 7; d++) {
                            const p = nextSched[d];
                            if (p && Array.isArray(p.exercises)) {
                                const found = p.exercises.find(x => x && (x.id === query || x.name === query || x.originalAiName === query));
                                if (found) {
                                    ex = (typeof findBestExerciseMatch === 'function' ? findBestExerciseMatch(found.name || found.id) : null) || found;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!ex) {
                    const currSched = typeof getWeeklySchedule === 'function' ? getWeeklySchedule() : null;
                    if (currSched) {
                        for (let d = 0; d < 7; d++) {
                            const p = currSched[d];
                            if (p && Array.isArray(p.exercises)) {
                                const found = p.exercises.find(x => x && (x.id === query || x.name === query || x.originalAiName === query));
                                if (found) {
                                    ex = (typeof findBestExerciseMatch === 'function' ? findBestExerciseMatch(found.name || found.id) : null) || found;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (!ex) {
                    ex = {
                        id: 'ai_' + query.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                        name: query,
                        muscle: 'Genel Kas Gelişimi & Fonksiyonel Güç',
                        primaryMuscles: ['full_body'],
                        equipment: 'dumbbell',
                        cue: 'FitLAB AI Koçu tarafından sporcuya özel reçete edilen egzersiz.',
                        isCustomAi: true
                    };
                }
            }
            if (!ex) return;

            document.getElementById('exDetailModalTitle').innerText = ex.name;
            const anatomy = getExerciseAnatomy(ex);
            const subTitleEl = document.getElementById('exDetailModalSubtitle');
            if (subTitleEl) {
                subTitleEl.innerHTML = `<span style="color:var(--gold); font-weight:800;">${CANVA_ICONS.crosshair} Ana: ${escapeHTML(anatomy.primary)}</span>${anatomy.secondary ? ` • <span style="color:var(--cyan); font-weight:700;">⚡ Destek: ${escapeHTML(anatomy.secondary)}</span>` : ''} • <span style="color:var(--text-secondary);">${ex.equipment ? ex.equipment.toUpperCase() : ''}</span>`;
            }

            const photoGuide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) ? exerciseGuideMap[ex.id] : null;
            const guide = photoGuide;

            const btnReport = document.getElementById('btnExDetailReport');
            if (btnReport) {
                btnReport.onclick = () => openExerciseBugReportModal(ex.id, ex.name, (guide && guide.form) ? guide.form : '', ex.equipment || '', ex.muscle || '', 'Egzersiz Detayı');
            }

            const btnHide = document.getElementById('btnExDetailToggleHide');
            if (btnHide) {
                btnHide.onclick = () => toggleExerciseExclusionAndRefresh(ex.id);
                updateExDetailModalHideButton(ex.id);
            }

            // Muscle breakdown helper with exact biomechanical factors
            const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
            let pMuscleLabels = '';
            let sMuscleLabels = '';

            if (spec.type === 'CONDITIONING' || spec.pFactor === 0) {
                pMuscleLabels = `<span style="background:rgba(148,163,184,0.15); color:#94a3b8; border:1px solid rgba(148,163,184,0.3); padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">⚡ Metabolik Kondisyon (0 Set Hipertrofi)</span>`;
            } else {
                pMuscleLabels = `<span style="background:rgba(245,158,11,0.2); color:var(--gold); border:1px solid rgba(245,158,11,0.4); padding:3px 8px; border-radius:12px; font-size:11px; font-weight:800;">${spec.primary} (Ana Kas: +${spec.pFactor.toFixed(2)} Set)</span>`;
            }

            if (spec.sec && typeof spec.sec === 'object' && Object.keys(spec.sec).length > 0) {
                sMuscleLabels = Object.entries(spec.sec).map(([sM, sF]) => {
                    return `<span style="background:rgba(56,189,248,0.15); color:var(--cyan); border:1px solid rgba(56,189,248,0.35); padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">${sM} (+${sF.toFixed(2)} Set / %${Math.round(sF * 100)})</span>`;
                }).join(' ');
            }

            // Steps HTML Generator (shared between Form and Steps tab)
            let stepsHtml = '';
            if (ex.positions && ex.positions.length > 0) {
                const badgeStyles = {
                    setup: { bg: 'rgba(56, 189, 248, 0.2)', border: 'var(--cyan)', text: 'var(--cyan)', icon: '🟢' },
                    action: { bg: 'rgba(245, 158, 11, 0.2)', border: 'var(--gold)', text: 'var(--gold)', icon: '🟠' },
                    finish: { bg: 'rgba(16, 185, 129, 0.2)', border: 'var(--green-success)', text: 'var(--green-success)', icon: '🏁' }
                };
                stepsHtml = ex.positions.map(p => {
                    const style = badgeStyles[p.badge] || badgeStyles.setup;
                    return `
                        <div class="pos-step-card" style="margin-bottom:8px;">
                            <div class="pos-step-header" style="background:${style.bg}; border-color:${style.border}; color:${style.text};">
                                <span>${style.icon} ${escapeHTML(p.phase)}</span>
                            </div>
                            <div class="pos-step-desc">
                                ${escapeHTML(p.desc)}
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Form Tab (OpenGym Canlı Animasyon Öncelikli)
            const formContainer = document.getElementById('exDetailTabContentForm');
            const opengymEx = (typeof OPENGYM_GLOBAL_CATALOG !== 'undefined') ? OPENGYM_GLOBAL_CATALOG[ex.id] : null;
            const photoSrc = (photoGuide && photoGuide.form) ? photoGuide.form : (ex.diagram || ex.formImage || null);
            const isSvgForm = !!(photoSrc && photoSrc.toLowerCase().endsWith('.svg'));

            let visualsHtml = '';
            if (opengymEx) {
                visualsHtml = `
                    <div style="background:#FFFFFF; border-radius:12px; overflow:hidden; border:1.5px solid #BAE6FD; margin-bottom:12px; box-shadow:0 4px 14px rgba(15,23,42,0.06);">
                        <div style="background:#F0F9FF; border-bottom:1px solid #BAE6FD; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11.5px; font-weight:900; color:#0369A1; letter-spacing:0.5px;">⚡ OPENGYM CANLI HAREKET ANİMASYONU</span>
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:3px 9px; border-radius:4px; color:#0369A1; border-color:#38BDF8; background:#FFFFFF; font-weight:700;" onclick="openImageLightbox(decodeURIComponent('${encodeURIComponent(opengymEx.clip)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - Canlı Animasyon')}'))">⛶ Tam Ekran Oynat</button>
                        </div>
                        <div style="text-align:center; padding:8px; cursor:pointer; background:#F8FAFC;" onclick="openImageLightbox(decodeURIComponent('${encodeURIComponent(opengymEx.clip)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - Canlı Animasyon')}'))" title="Tam ekran oynatmak için dokunun">
                            <video src="${opengymEx.clip}" poster="${opengymEx.still}" autoplay loop muted playsinline style="max-width:100%; max-height:46vh; object-fit:contain; display:block; margin:0 auto; border-radius:6px;"></video>
                            <div style="font-size:10.5px; color:#475569; margin-top:6px; font-weight:600;">🔍 Dokunarak tam ekranda canlı döngüde izleyebilirsiniz</div>
                        </div>
                    </div>
                    ${photoSrc ? `
                        <div style="margin-bottom:12px; border-radius:8px; border:1px solid #E2E8F0; background:#F8FAFC; overflow:hidden;">
                            <div style="padding:6px 10px; background:#F1F5F9; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="const el=document.getElementById('ex_detail_legacy_photo'); if(el) el.style.display=el.style.display==='none'?'block':'none';">
                                <span style="font-size:11px; font-weight:700; color:#334155;">${isSvgForm ? '📐 Vektörel Form Akışı' : '📸 Statik Fotoğraf & Form Kılavuzu'}</span>
                                <span style="font-size:10px; color:#B45309; font-weight:800;">Gör ▼</span>
                            </div>
                            <div id="ex_detail_legacy_photo" style="display:none; padding:8px; text-align:center;">
                                <img src="${photoSrc}" style="max-width:100%; max-height:38vh; object-fit:contain; border-radius:6px;" alt="${escapeHTML(ex.name)}">
                            </div>
                        </div>
                    ` : ''}
                `;
            } else if (photoSrc) {
                visualsHtml = `
                    <div style="background:#FFFFFF; border-radius:12px; overflow:hidden; border:1.5px solid #FDE68A; margin-bottom:12px; box-shadow:0 4px 14px rgba(15,23,42,0.06);">
                        <div style="background:#FFFBEB; border-bottom:1px solid #FDE68A; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11.5px; font-weight:900; color:#B45309; letter-spacing:0.5px;">${isSvgForm ? '📐 FORM VEKTÖR DİYAGRAMI' : '📸 GERÇEK FORM REHBERİ'}</span>
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:3px 9px; border-radius:4px; color:#0369A1; border-color:#38BDF8; background:#FFFFFF; font-weight:700;" onclick="openImageLightbox(decodeURIComponent('${encodeURIComponent(photoSrc)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - ' + (isSvgForm ? 'Form Diyagramı' : 'Form Rehberi'))}'))">⛶ Tam Ekran Büyüt</button>
                        </div>
                        <div style="text-align:center; padding:8px; cursor:pointer; background:#F8FAFC;" onclick="openImageLightbox(decodeURIComponent('${encodeURIComponent(photoSrc)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - ' + (isSvgForm ? 'Form Diyagramı' : 'Form Rehberi'))}'))" title="Büyütmek için dokunun">
                            <img src="${photoSrc}" style="max-width:100%; max-height:46vh; object-fit:contain; display:block; margin:0 auto; border-radius:6px;" alt="${escapeHTML(ex.name)} Form">
                            <div style="font-size:10.5px; color:#475569; margin-top:6px; font-weight:600;">🔍 Dokunarak tam ekran inceleyebilirsiniz</div>
                        </div>
                    </div>
                `;
            }

            if (visualsHtml) {
                formContainer.innerHTML = `
                    ${visualsHtml}
                    <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:8px; padding:10px 12px; margin-bottom:10px;">
                        <div style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-bottom:6px;">🎯 Çalışan Alt Kas Grupları (Primer & Sekonder):</div>
                        <div style="font-size:12px; line-height:1.5; margin-bottom:8px;">
                            <div style="margin-bottom:4px;"><strong style="color:#15803D;">🎯 Primer (Ana) Kaslar:</strong> <span style="color:#0F172A; font-weight:700;">${escapeHTML(anatomy.primary || ex.muscle || '')}</span></div>
                            ${anatomy.secondary ? `<div style="margin-bottom:4px;"><strong style="color:#0369A1;">⚡ Sekonder (Yardımcı) Kaslar:</strong> <span style="color:#334155; font-weight:600;">${escapeHTML(anatomy.secondary)}</span></div>` : ''}
                            ${anatomy.proof ? `<div style="margin-top:6px; padding-top:6px; border-top:1px dashed var(--border); font-size:11.5px; color:#475569;"><strong>🔬 Neden Bu Kaslar?</strong> ${escapeHTML(anatomy.proof)}</div>` : ''}
                        </div>
                        <div style="display:flex; flex-wrap:wrap; gap:6px;">
                            ${pMuscleLabels}
                            ${sMuscleLabels || '<span style="font-size:11px; color:var(--text-secondary);">İzole hareket (saf primer odak)</span>'}
                        </div>
                    </div>
                    ${stepsHtml ? `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:11px; font-weight:800; color:var(--cyan); text-transform:uppercase; margin-bottom:6px;">📋 Uygulama Aşamaları & Form Rehberi:</div>
                            ${stepsHtml}
                        </div>
                    ` : ''}
                    ${ex.cue ? `
                        <div class="cue-box" style="margin-top:6px;">
                            <span class="cue-icon">⚠️</span>
                            <span><strong>Kritik Form & Güvenlik Uyarısı:</strong> ${escapeHTML(ex.cue)}</span>
                        </div>
                    ` : ''}
                `;
            } else {
                formContainer.innerHTML = `
                    <div style="padding:24px 16px; text-align:center; background:#F8FAFC; border-radius:8px; border:1px dashed var(--border);">
                        <div style="font-size:24px; margin-bottom:6px;">🏋️</div>
                        <div style="font-weight:700; color:#0F172A; font-size:13.5px;">${escapeHTML(ex.name)}</div>
                        <div style="color:var(--text-secondary); font-size:11.5px; margin-top:4px;">Görsel form rehberi optimize ediliyor.</div>
                        <div style="margin-top:10px; display:flex; justify-content:center; gap:6px; flex-wrap:wrap;">
                            ${pMuscleLabels}
                            ${sMuscleLabels}
                        </div>
                        ${stepsHtml ? `
                            <div style="margin-top:12px; text-align:left;">
                                ${stepsHtml}
                            </div>
                        ` : ''}
                        ${ex.cue ? `<div class="cue-box" style="margin-top:12px; text-align:left;"><span class="cue-icon">⚠️</span><span><strong>Güvenlik Uyarısı:</strong> ${escapeHTML(ex.cue)}</span></div>` : ''}
                    </div>
                `;
            }

            // Anatomy Tab
            const anatomyContainer = document.getElementById('exDetailTabContentAnatomy');
            if (photoGuide && photoGuide.anatomi) {
                anatomyContainer.innerHTML = `
                    <div style="text-align:center; background:#000; border-radius:8px; overflow:hidden; border:1px solid var(--border); min-height:160px; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="openImageLightbox(decodeURIComponent('${encodeURIComponent(photoGuide.anatomi)}'), decodeURIComponent('${encodeURIComponent((ex.name || '') + ' - Anatomi')}'))">
                        <img src="${photoGuide.anatomi}" style="max-width:100%; max-height:48vh; object-fit:contain; display:block; margin:0 auto;" alt="${escapeHTML(ex.name)} Anatomi">
                    </div>
                    <div style="background:#F8FAFC; border:1px solid var(--border); border-radius:8px; padding:12px; margin-top:10px;">
                        <div style="font-size:12.5px; line-height:1.55; margin-bottom:10px;">
                            <div style="margin-bottom:6px; padding:8px 10px; background:#F0FDF4; border:1px solid #86EFAC; border-radius:6px;">
                                <strong style="color:#15803D;">🎯 Primer (Ana Hedef) Kaslar:</strong><br>
                                <span style="color:#0F172A; font-weight:700;">${escapeHTML(anatomy.primary || ex.muscle || '')}</span>
                            </div>
                            ${anatomy.secondary ? `
                            <div style="margin-bottom:6px; padding:8px 10px; background:#F0F9FF; border:1px solid #7DD3FC; border-radius:6px;">
                                <strong style="color:#0369A1;">⚡ Sekonder (Yardımcı & Sabitleyici) Kaslar:</strong><br>
                                <span style="color:#0F172A; font-weight:600;">${escapeHTML(anatomy.secondary)}</span>
                            </div>` : ''}
                            ${anatomy.proof ? `
                            <div style="padding:8px 10px; background:#F8FAFC; border-left:3px solid #0369A1; border-radius:4px; font-size:12px; color:#334155;">
                                <strong>🔬 Biyomekanik Açıklama:</strong> ${escapeHTML(anatomy.proof)}
                            </div>` : ''}
                        </div>
                        <div style="font-size:12px; font-weight:800; color:#0F172A; margin-bottom:6px;">🎯 1 Çalışma Setinin Kaslara Dağılımı:</div>
                        <div style="font-size:11.5px; color:var(--text-secondary); line-height:1.6;">
                            • <strong>Ana Çalışan Kas:</strong> ${pMuscleLabels}<br>
                            • <strong>Yardımcı Kaslar:</strong> ${sMuscleLabels || '<span style="color:var(--text-secondary);">Yok (Sadece Tek Bölgeye Odaklanır)</span>'}<br>
                            • <strong>Hareket Tipi:</strong> ${ex.mechanic === 'compound' ? '⚡ Birden Fazla Kası Çalıştıran (Genel Hareket)' : '🎯 Tek Bölgeye Odaklanan Hareket'}
                        </div>
                    </div>
                `;
            } else {
                anatomyContainer.innerHTML = `
                    <div style="padding:16px; background:#F8FAFC; border:1px solid var(--border); border-radius:8px; text-align:left;">
                        <div style="font-size:13px; font-weight:800; color:#0F172A; margin-bottom:10px;">🧬 Çalışan Alt Kaslar & Biyomekanik Detay:</div>
                        <div style="font-size:12.5px; line-height:1.55; margin-bottom:10px;">
                            <div style="margin-bottom:6px; padding:8px 10px; background:#F0FDF4; border:1px solid #86EFAC; border-radius:6px;">
                                <strong style="color:#15803D;">🎯 Primer (Ana Hedef) Kaslar:</strong><br>
                                <span style="color:#0F172A; font-weight:700;">${escapeHTML(anatomy.primary || ex.muscle || '')}</span>
                            </div>
                            ${anatomy.secondary ? `
                            <div style="margin-bottom:6px; padding:8px 10px; background:#F0F9FF; border:1px solid #7DD3FC; border-radius:6px;">
                                <strong style="color:#0369A1;">⚡ Sekonder (Yardımcı & Sabitleyici) Kaslar:</strong><br>
                                <span style="color:#0F172A; font-weight:600;">${escapeHTML(anatomy.secondary)}</span>
                            </div>` : ''}
                            ${anatomy.proof ? `
                            <div style="padding:8px 10px; background:#F8FAFC; border-left:3px solid #0369A1; border-radius:4px; font-size:12px; color:#334155;">
                                <strong>🔬 Biyomekanik Açıklama:</strong> ${escapeHTML(anatomy.proof)}
                            </div>` : ''}
                        </div>
                        <div style="font-size:11.5px; font-weight:800; color:#475569; margin-bottom:6px;">📊 Haftalık Set Hesabına Katkısı:</div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            ${pMuscleLabels}
                            ${sMuscleLabels}
                        </div>
                    </div>
                `;
            }

            // Steps Tab
            const stepsContainer = document.getElementById('exDetailTabContentSteps');
            stepsContainer.innerHTML = stepsHtml + (ex.cue ? `
                <div class="cue-box" style="margin-top:10px;">
                    <span class="cue-icon">💡</span>
                    <span><strong>Altın Kural:</strong> ${escapeHTML(ex.cue)}</span>
                </div>
            ` : '');

            // Check if opened from exercisePickerModal
            const isPickerActive = document.getElementById('exercisePickerModal')?.classList.contains('active');
            const btnAdd = document.getElementById('btnExDetailAdd');
            const btnAlt = document.getElementById('btnExDetailAlt');

            if (isPickerActive) {
                if (btnAlt) btnAlt.style.display = 'none';
                if (btnAdd) {
                    btnAdd.innerText = (pickerContext.mode === 'replace') ? '✓ Bu Alternatifi Seç' : '➕ Programa Ekle';
                    btnAdd.onclick = () => {
                        selectExerciseFromPicker(ex.id);
                        closeExerciseDetailModal();
                    };
                }
            } else {
                if (btnAlt) {
                    btnAlt.style.display = 'inline-block';
                    btnAlt.onclick = () => {
                        closeExerciseDetailModal();
                        const schedModalOpen = document.getElementById('scheduleDayModal')?.classList.contains('active');
                        if (schedModalOpen && activeSchedulingDayIdx !== null && activeSchedulingDayIdx !== undefined) {
                            const sched = activePlannerWeek === 'next' ? getNextWeeklySchedule() : getWeeklySchedule();
                            const dPlan = (activeSchedulingDateStr && activePlannerWeek !== 'next' && typeof getPlanForDate === 'function')
                                ? getPlanForDate(new Date(activeSchedulingDateStr + 'T00:00:00'))
                                : (sched && sched[activeSchedulingDayIdx]);
                            const det = dPlan && typeof getWorkoutDetailsForPlan === 'function' ? getWorkoutDetailsForPlan(dPlan) : null;
                            const foundIdx = (det && Array.isArray(det.exercises)) ? det.exercises.findIndex(item => (item.id || item.exId) === ex.id) : 0;
                            openScheduleExerciseAlternativeModal(activeSchedulingDayIdx, ex.id, foundIdx >= 0 ? foundIdx : 0);
                            return;
                        }
                        const isGenTabActive = document.getElementById('generatorTab')?.classList.contains('active');
                        const isActTabActive = document.getElementById('activeWorkoutTab')?.classList.contains('active');
                        if (isActTabActive && activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises) && activeWorkoutSession.exercises.some(e => e.id === ex.id)) {
                            openAlternativeModal(ex.id, 'active');
                            return;
                        }
                        if (isGenTabActive && currentGeneratedWorkout) {
                            const isWeeklyPreview = Boolean(window.pendingAiWeeklyPlan && document.querySelector('#generatedWorkoutOutput .wk-preview-shell'));
                            openAlternativeModal(ex.id, isWeeklyPreview ? 'weekly_preview' : 'generated');
                            return;
                        }
                        if (customRoutineState && Array.isArray(customRoutineState.exercises)) {
                            const stuIdx = customRoutineState.exercises.findIndex(item => item.exId === ex.id);
                            if (stuIdx !== -1) {
                                openStudioExerciseAlternativeModal(stuIdx);
                                return;
                            }
                        }
                        if (currentGeneratedWorkout && Array.isArray(currentGeneratedWorkout.exercises) && currentGeneratedWorkout.exercises.some(e => e.id === ex.id)) {
                            const isWeeklyPreview = Boolean(window.pendingAiWeeklyPlan && document.querySelector('#generatedWorkoutOutput .wk-preview-shell'));
                            openAlternativeModal(ex.id, isWeeklyPreview ? 'weekly_preview' : 'generated');
                            return;
                        }
                        openAlternativeModal(ex.id, pickerContext.scope || 'studio');
                    };
                }
                if (btnAdd) {
                    btnAdd.innerText = '➕ Programa Ekle';
                    btnAdd.onclick = () => {
                        closeExerciseDetailModal();
                        openAddToProgramOptions(ex.id);
                    };
                }
            }

            switchExDetailTab('form');
            const detailModal = document.getElementById('exerciseDetailModal');
            if (detailModal) {
                detailModal.classList.add('active');
                const detailBox = detailModal.querySelector('.modal-box');
                if (detailBox) detailBox.scrollTop = 0;
                detailModal.querySelectorAll('video').forEach(v => {
                    v.muted = true;
                    v.defaultMuted = true;
                    v.playsInline = true;
                    v.play().catch(() => {});
                });
            }
        }

        function closeExerciseDetailModal() {
            document.getElementById('exerciseDetailModal').classList.remove('active');
        }

        function switchExDetailTab(tab) {
            document.getElementById('btnExDetailTabForm').classList.toggle('active', tab === 'form');
            document.getElementById('btnExDetailTabAnatomy').classList.toggle('active', tab === 'anatomy');
            document.getElementById('btnExDetailTabSteps').classList.toggle('active', tab === 'steps');

            const formEl = document.getElementById('exDetailTabContentForm');
            formEl.style.display = (tab === 'form') ? 'block' : 'none';
            document.getElementById('exDetailTabContentAnatomy').style.display = (tab === 'anatomy') ? 'block' : 'none';
            document.getElementById('exDetailTabContentSteps').style.display = (tab === 'steps') ? 'block' : 'none';
            if (tab === 'form' && formEl) {
                formEl.querySelectorAll('video').forEach(v => {
                    v.muted = true;
                    v.defaultMuted = true;
                    v.playsInline = true;
                    v.play().catch(() => {});
                });
            }
        }

