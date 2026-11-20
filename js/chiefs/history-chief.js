// ==================== ODA 4: GEÇMİŞ & KAYIT ŞEFİ (history-guard) ====================
        // ==================== LOGS & STATS LOGIC ====================

        function getUserLogsById(userId) {
            try {
                const raw = localStorage.getItem(`celik_kodu_history_${userId}`);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? sortWorkoutLogsDesc(parsed) : [];
            } catch(e) {
                return [];
            }
        }

        function getWorkoutLogs() {
            const uid = getActiveUserId();
            return getUserLogsById(uid);
        }

        function setWorkoutLogs(logs) {
            const uid = getActiveUserId() || (window.CelikLiaisonSubChiefs && window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid ? window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid() : 'default');
            const customsCleaned = (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.sanitizeWorkoutLogsList === 'function')
                ? window.CelikBridgeCustoms.sanitizeWorkoutLogsList(logs)
                : (Array.isArray(logs) ? logs : []);
            const liaisonChecked = (window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.inspectHistoryMutationForReceivers === 'function')
                ? window.CelikLiaisonSubChiefs.inspectHistoryMutationForReceivers(customsCleaned)
                : customsCleaned;
            const sorted = Array.isArray(liaisonChecked) ? sortWorkoutLogsDesc([...liaisonChecked]) : [];
            localStorage.setItem(`celik_kodu_history_${uid}`, JSON.stringify(sorted));
            syncWorkoutLogsToCloud(sorted, uid);
        }

        function getDeletedWorkoutLogIds(uid) {
            const targetUid = uid || getActiveUserId();
            if (!targetUid) return [];
            try {
                const parsed = JSON.parse(localStorage.getItem(`celik_kodu_deleted_logs_${targetUid}`) || '[]');
                return Array.isArray(parsed) ? parsed.map(x => String(x)).filter(Boolean) : [];
            } catch {
                return [];
            }
        }

        function markWorkoutLogDeleted(uid, logObjOrId) {
            const targetUid = uid || getActiveUserId();
            if (!targetUid || !logObjOrId) return;
            const list = getDeletedWorkoutLogIds(targetUid);
            const set = new Set(list);
            if (typeof logObjOrId === 'string') {
                set.add(logObjOrId);
            } else if (typeof logObjOrId === 'object') {
                if (logObjOrId.id) set.add(String(logObjOrId.id));
                if (logObjOrId.garminActivityId) set.add(String(logObjOrId.garminActivityId));
            }
            const next = Array.from(set).slice(-250);
            try {
                localStorage.setItem(`celik_kodu_deleted_logs_${targetUid}`, JSON.stringify(next));
            } catch {}
        }

        function syncLastWeightsCacheFromHistory(affectedExercises = []) {
            if (!Array.isArray(affectedExercises) || affectedExercises.length === 0) return;
            const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : 'default';
            const storageKey = `celik_kodu_last_weights_${uid}`;
            try {
                const map = JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
                const seen = new Set();
                affectedExercises.forEach(ex => {
                    if (!ex || (!ex.id && !ex.name)) return;
                    const id = ex.id ? String(ex.id) : '';
                    const nameKey = ex.name ? String(ex.name).trim().toLowerCase() : '';
                    const sig = `${id}::${nameKey}`;
                    if (seen.has(sig)) return;
                    seen.add(sig);

                    const perf = (id && typeof getLastExercisePerformance === 'function' && getLastExercisePerformance(id))
                        || (ex.name && typeof getLastExercisePerformance === 'function' && getLastExercisePerformance(ex.name));
                    const wNum = perf ? parseFloat(perf.lastWeight !== '' && perf.lastWeight != null ? perf.lastWeight : perf.weight) : NaN;
                    if (!isNaN(wNum) && wNum > 0) {
                        if (id) map[id] = wNum;
                        if (nameKey) map[nameKey] = wNum;
                    } else {
                        if (id) delete map[id];
                        if (nameKey) delete map[nameKey];
                    }
                });
                localStorage.setItem(storageKey, JSON.stringify(map));
                const user = typeof getActiveUser === 'function' ? getActiveUser() : null;
                if (user) {
                    user.lastExerciseWeights = Object.assign({}, map);
                }
                if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(uid);
            } catch (e) {}
        }

        function refreshViewsAfterHistoryMutation(affectedExercises = []) {
            syncLastWeightsCacheFromHistory(affectedExercises);
            const savedScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
            renderHistory();
            if (typeof window !== 'undefined') window.scrollTo({ top: savedScrollY, behavior: 'instant' });
            if (typeof renderAnalytics === 'function') renderAnalytics();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            if (typeof refreshTopFitnessCardioScoreBars === 'function') refreshTopFitnessCardioScoreBars();
            const schedModal = document.getElementById('scheduleDayModal');
            if (schedModal && schedModal.classList.contains('active') && activeSchedulingDayIdx !== null && typeof openScheduleDayModal === 'function') {
                openScheduleDayModal(activeSchedulingDayIdx, activeSchedulingDateStr);
            }
        }

        function deleteLog(id, skipConfirm = false) {
            if (!skipConfirm && !confirm("Bu antrenman kaydını silmek istediğinize emin misiniz?")) return;
            const uid = getActiveUserId();
            let logs = getWorkoutLogs();
            const targetLog = logs.find(l => l && String(l.id) === String(id));
            markWorkoutLogDeleted(uid, targetLog || id);
            logs = logs.filter(l => l && String(l.id) !== String(id));
            setWorkoutLogs(logs);
            refreshViewsAfterHistoryMutation(targetLog && Array.isArray(targetLog.exercises) ? targetLog.exercises : []);
        }

        function deleteWorkoutLog(id) {
            return deleteLog(id, false);
        }

        // ==================== EDIT COMPLETED WORKOUT LOG MODAL ====================
        let editingWorkoutLogState = null;

        function normalizeEditLogExercise(ex) {
            const dbEx = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB))
                ? (EXERCISES_DB.find(e => e.id === ex.id) || EXERCISES_DB.find(e => e.name === ex.name))
                : null;
            const mergedEx = Object.assign({}, ex, {
                id: ex.id || (dbEx ? dbEx.id : 'custom'),
                name: ex.name || (dbEx ? dbEx.name : 'Hareket'),
                equipment: ex.equipment || (dbEx ? dbEx.equipment : 'dumbbell'),
                category: ex.category || (dbEx ? dbEx.category : 'push'),
                muscle: ex.muscle || (dbEx ? dbEx.muscle : ''),
                cue: ex.cue || (dbEx ? dbEx.cue : '')
            });
            const isBw = isExerciseBodyweight(mergedEx);
            const isTb = isExerciseTimeBased(mergedEx);
            mergedEx.isBodyweight = isBw;
            mergedEx.isTimeBased = isTb;

            const rawSets = Array.isArray(ex.sets)
                ? ex.sets
                : Array.from({ length: Math.max(1, Number(ex.sets || ex.completedSets || 1)) }, (_, idx) => ({
                    setNo: idx + 1,
                    weight: Number(ex.weight || 0),
                    reps: Number(ex.reps || (isTb ? 30 : 10)),
                    completed: true
                }));

            mergedEx.sets = rawSets.map((st, idx) => {
                const cloneSet = Object.assign({}, st);
                cloneSet.setNo = idx + 1;
                cloneSet.weight = st && st.weight !== '' && st.weight !== null && !isNaN(st.weight) ? Number(st.weight) : 0;
                cloneSet.reps = st && st.reps !== '' && st.reps !== null && !isNaN(st.reps) ? parseInt(st.reps, 10) : 0;
                cloneSet.isBodyweight = isBw;
                cloneSet.isTimeBased = isTb;
                cloneSet.completed = st ? st.completed !== false : true;
                return cloneSet;
            });
            return mergedEx;
        }

        function computeEditLogDraftStats(draft) {
            let totalVolumeKg = 0;
            let totalSetsCompleted = 0;
            let totalRepsCompleted = 0;
            let totalIsometricSecsCompleted = 0;
            const musclesSet = new Set();

            const exercises = (Array.isArray(draft.exercises) ? draft.exercises : []).map(ex => {
                const canonicalEx = resolveCanonicalDbExercise(ex);
                const isTime = isExerciseTimeBased(canonicalEx);
                const isCardio = isExerciseCardioMinutes(canonicalEx);
                let exVol = 0;
                let completedCount = 0;

                const nextSets = (Array.isArray(ex.sets) ? ex.sets : []).map((st, sIdx) => {
                    const isDone = !!st.completed;
                    const w = Math.max(0, Number(st.weight) || 0);
                    const r = Math.max(0, parseInt(st.reps, 10) || 0);
                    const setVol = isDone ? Math.round(calculateExerciseSetVolume(canonicalEx, w, r) * 10) / 10 : 0;
                    if (isDone) {
                        completedCount++;
                        totalSetsCompleted++;
                        if (isTime) totalIsometricSecsCompleted += r;
                        else if (!isCardio) totalRepsCompleted += r;
                        exVol += setVol;
                        totalVolumeKg += setVol;
                    }
                    return Object.assign({}, st, {
                        setNo: sIdx + 1,
                        weight: w,
                        reps: r,
                        isBodyweight: isExerciseBodyweight(canonicalEx),
                        isTimeBased: isTime,
                        isCardioMinutes: isCardio,
                        completed: isDone,
                        volume: setVol
                    });
                });

                const pairedBest = pickBestPairedSet(canonicalEx, nextSets.filter(s => s.completed));
                const maxWeight = (!isCardio && pairedBest) ? (Number(pairedBest.weight) || 0) : 0;
                const maxReps = pairedBest ? (parseInt(pairedBest.reps, 10) || 0) : 0;

                if (completedCount > 0 && ex.muscle) {
                    ex.muscle.split(',').forEach(m => {
                        const t = m.trim();
                        if (t) musclesSet.add(t);
                    });
                }

                return Object.assign({}, ex, {
                    isBodyweight: isExerciseBodyweight(canonicalEx),
                    isTimeBased: isTime,
                    isCardioMinutes: isCardio,
                    sets: nextSets,
                    completedSetsCount: completedCount,
                    completedSets: completedCount,
                    maxWeight,
                    maxReps,
                    exerciseVolume: Math.round(exVol * 10) / 10
                });
            });

            return {
                exercises,
                totalVolumeKg: Math.round(totalVolumeKg * 10) / 10,
                totalSetsCompleted,
                totalRepsCompleted,
                totalIsometricSecsCompleted,
                muscleGroups: Array.from(musclesSet)
            };
        }

        function updateEditWorkoutLogLiveTotals() {
            if (!editingWorkoutLogState) return;
            const stats = computeEditLogDraftStats(editingWorkoutLogState.draft);
            const bar = document.getElementById('editLogLiveTotalsBar');
            if (!bar) return;
            const timePart = stats.totalIsometricSecsCompleted > 0 ? ` • ${stats.totalIsometricSecsCompleted} sn` : '';
            bar.innerHTML = `
                <span style="color:#FFFFFF;">Toplam: ${Math.round(stats.totalVolumeKg).toLocaleString('tr-TR')} kg</span>
                <span style="color:#E2E8F0;">${stats.totalSetsCompleted} Set • ${stats.totalRepsCompleted} Tekrar${timePart}</span>
            `;
        }

        function filterEditLogDbExercises(query) {
            if (typeof EXERCISES_DB === 'undefined' || !Array.isArray(EXERCISES_DB)) return [];
            const q = normSearchText(query);
            return EXERCISES_DB.filter(ex => {
                if (!ex || !ex.id) return false;
                if (!q && typeof isExerciseExcludedByUser === 'function' && isExerciseExcludedByUser(ex.id)) return false;
                if (!q) return true;
                const hay = normSearchText(`${ex.name || ''} ${ex.muscle || ''} ${ex.equipment || ''} ${ex.category || ''}`);
                return hay.includes(q);
            }).slice(0, 40);
        }

        function renderEditLogSwapResults(exIdx) {
            if (!editingWorkoutLogState) return;
            const container = document.getElementById(`editLogSwapResults_${exIdx}`);
            if (!container) return;
            const matches = filterEditLogDbExercises(editingWorkoutLogState.swapQuery || '');
            if (matches.length === 0) {
                container.innerHTML = `<div style="font-size:11.5px; color:#E2E8F0; padding:6px;">Sonuç bulunamadı</div>`;
                return;
            }
            container.innerHTML = matches.map(dbEx => {
                const cleanTitle = String(dbEx.name || '').replace(/\s*\([^)]*\)/g, '').trim() || dbEx.name;
                return `
                    <button type="button" class="edit-log-picker-item" style="background:#121024; border:1px solid rgba(167, 139, 250, 0.25); color:#FFFFFF;" onclick="selectEditLogSwapExercise(${exIdx}, decodeURIComponent('${encodeURIComponent(dbEx.id)}'))">
                        <span style="color:#FFFFFF;">${escapeHTML(cleanTitle)}</span>
                        <span style="font-size:10.5px; color:#E2E8F0; font-weight:700;">${escapeHTML(dbEx.equipment || '')}</span>
                    </button>
                `;
            }).join('');
        }

        function renderEditWorkoutLogExercises() {
            if (!editingWorkoutLogState) return;
            const modalBox = document.getElementById('editWorkoutLogModalBox');
            const savedModalScroll = modalBox ? modalBox.scrollTop : 0;
            const container = document.getElementById('editLogExercisesContainer');
            if (!container) return;

            const exercises = editingWorkoutLogState.draft.exercises || [];
            if (exercises.length === 0) {
                container.innerHTML = `<div style="padding:14px; text-align:center; background:#121024; border:1px dashed rgba(167, 139, 250, 0.35); border-radius:10px; font-size:12px; color:#E2E8F0;">Henüz hareket yok. Aşağıdan hareket ekleyin.</div>`;
                if (modalBox) modalBox.scrollTop = savedModalScroll;
                return;
            }

            container.innerHTML = exercises.map((ex, exIdx) => {
                const isBw = isExerciseBodyweight(ex);
                const isCardio = isExerciseCardioMinutes(ex);
                const isTime = isExerciseTimeBased(ex);
                const cleanName = String(ex.name || 'Hareket').replace(/\s*\([^)]*\)/g, '').trim() || ex.name;
                const extraSuffix = ex.isInterSetExtra ? ' • Set Arası' : '';
                const exVol = (Array.isArray(ex.sets) ? ex.sets : []).reduce((s, st) => s + (st.completed ? calculateExerciseSetVolume(ex, st.weight, st.reps) : 0), 0);
                const isSwapOpen = editingWorkoutLogState.swapExIdx === exIdx;

                const setsHtml = (Array.isArray(ex.sets) ? ex.sets : []).map((st, sIdx) => {
                    const weightUnit = isBw ? 'ek kg' : 'kg';
                    const metricUnit = isCardio ? 'dk' : (isTime ? 'sn' : 'tk');
                    return `
                        <div class="edit-log-set-row ${st.completed ? '' : 'is-skipped'}">
                            <span style="font-size:11.5px; font-weight:900; color:#E2E8F0;">S${sIdx + 1}</span>
                            ${isCardio ? `<span style="font-size:11px; font-weight:800; color:#7DD3FC; text-align:center;">Kardiyo</span>` : `<input type="number" class="edit-log-num-input" style="background:#181530 !important; color:#FFFFFF !important; border:1px solid rgba(167, 139, 250, 0.35) !important;" step="any" min="0" max="1000" inputmode="decimal" aria-label="${escapeHTML(cleanName)} Set ${sIdx + 1} ${weightUnit}" placeholder="${weightUnit}" value="${st.weight}" oninput="onEditLogSetFieldInput(${exIdx}, ${sIdx}, 'weight', this.value)">`}
                            <span style="font-size:11.5px; font-weight:800; color:#E2E8F0; text-align:center;">×</span>
                            <input type="number" class="edit-log-num-input" style="background:#181530 !important; color:#FFFFFF !important; border:1px solid rgba(167, 139, 250, 0.35) !important;" step="1" min="0" max="3600" inputmode="numeric" aria-label="${escapeHTML(cleanName)} Set ${sIdx + 1} ${metricUnit}" placeholder="${metricUnit}" value="${st.reps}" oninput="onEditLogSetFieldInput(${exIdx}, ${sIdx}, 'reps', this.value)">
                            <button type="button" class="edit-log-status-btn ${st.completed ? 'done' : 'skipped'}" style="${st.completed ? 'background:#14532D; border-color:#22C55E; color:#BBF7D0;' : 'background:#1E293B; border-color:#475569; color:#E2E8F0;'}" onclick="toggleEditLogSetCompleted(${exIdx}, ${sIdx})">${st.completed ? '✓ Tamam' : 'Atlandı'}</button>
                            <button type="button" class="edit-log-del-set-btn" style="background:#7F1D1D; border:1px solid #EF4444; color:#FECACA;" aria-label="Seti sil" onclick="removeEditLogSet(${exIdx}, ${sIdx})">✕</button>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="edit-log-ex-card" style="background:#121024; border:1px solid rgba(167, 139, 250, 0.25);">
                        <div class="edit-log-ex-head">
                            <div style="min-width:0; flex:1;">
                                <div class="edit-log-ex-title" style="color:#FFFFFF;">${escapeHTML(cleanName + extraSuffix)}</div>
                                <div style="font-size:11px; font-weight:700; color:#E2E8F0;" id="editLogExCardVol_${exIdx}">${isCardio ? 'Kardiyo Süresi • Süre (dk)' : `${Math.round(exVol).toLocaleString('tr-TR')} kg • ${isBw ? 'Vücut Ağırlığı' : 'Kilo'} / ${isTime ? 'Süre (sn)' : 'Tekrar'}`}</div>
                            </div>
                            <div style="display:flex; gap:5px; flex-shrink:0;">
                                <button type="button" class="edit-log-mini-btn" style="background:#2C2550; border:1px solid rgba(167, 139, 250, 0.4); color:#F3E8FF;" onclick="toggleEditLogSwapPicker(${exIdx})">${isSwapOpen ? 'Kapat' : 'Değiştir'}</button>
                                <button type="button" class="edit-log-mini-btn danger" style="background:#7F1D1D; border:1px solid #EF4444; color:#FECACA;" onclick="removeEditLogExercise(${exIdx})">Sil</button>
                            </div>
                        </div>
                        ${isSwapOpen ? `
                            <div style="margin-bottom:8px;">
                                <input type="text" class="form-input edit-log-input" style="background:#181530 !important; color:#FFFFFF !important; border:1px solid rgba(167, 139, 250, 0.35) !important;" placeholder="Yeni hareket ara..." value="${escapeHTML(editingWorkoutLogState.swapQuery || '')}" oninput="onEditLogSwapSearchInput(this.value)">
                                <div id="editLogSwapResults_${exIdx}" class="edit-log-picker-list"></div>
                            </div>
                        ` : ''}
                        <div>${setsHtml}</div>
                        <button type="button" class="edit-log-secondary-btn" style="margin-top:6px; padding:6px 8px; font-size:11.5px; background:#181530; border:1px dashed rgba(167, 139, 250, 0.45); color:#E2E8F0;" onclick="addEditLogSet(${exIdx})">+ Set Ekle</button>
                    </div>
                `;
            }).join('');

            if (editingWorkoutLogState.swapExIdx !== null) {
                renderEditLogSwapResults(editingWorkoutLogState.swapExIdx);
            }
            if (modalBox) modalBox.scrollTop = savedModalScroll;
        }

        function onEditLogSetFieldInput(exIdx, sIdx, field, rawVal) {
            if (!editingWorkoutLogState) return;
            const ex = editingWorkoutLogState.draft.exercises[exIdx];
            const st = ex && Array.isArray(ex.sets) ? ex.sets[sIdx] : null;
            if (!st) return;
            if (field === 'weight') {
                const parsed = parseFloat(rawVal);
                st.weight = (!isNaN(parsed) && parsed >= 0) ? parsed : 0;
            } else {
                const parsed = parseInt(rawVal, 10);
                st.reps = (!isNaN(parsed) && parsed >= 0) ? parsed : 0;
            }
            const volEl = document.getElementById(`editLogExCardVol_${exIdx}`);
            if (volEl) {
                const isBw = isExerciseBodyweight(ex);
                const isCardio = isExerciseCardioMinutes(ex);
                const isTime = isExerciseTimeBased(ex);
                const exVol = ex.sets.reduce((s, x) => s + (x.completed ? calculateExerciseSetVolume(ex, x.weight, x.reps) : 0), 0);
                volEl.textContent = isCardio ? 'Kardiyo Süresi • Süre (dk)' : `${Math.round(exVol).toLocaleString('tr-TR')} kg • ${isBw ? 'Vücut Ağırlığı' : 'Kilo'} / ${isTime ? 'Süre (sn)' : 'Tekrar'}`;
            }
            updateEditWorkoutLogLiveTotals();
        }

        function toggleEditLogSetCompleted(exIdx, sIdx) {
            if (!editingWorkoutLogState) return;
            const st = editingWorkoutLogState.draft.exercises[exIdx]?.sets?.[sIdx];
            if (!st) return;
            st.completed = !st.completed;
            renderEditWorkoutLogExercises();
            updateEditWorkoutLogLiveTotals();
        }

        function addEditLogSet(exIdx) {
            if (!editingWorkoutLogState) return;
            const ex = editingWorkoutLogState.draft.exercises[exIdx];
            if (!ex) return;
            if (!Array.isArray(ex.sets)) ex.sets = [];
            const lastSet = ex.sets[ex.sets.length - 1];
            const isBw = isExerciseBodyweight(ex);
            const isCardio = isExerciseCardioMinutes(ex);
            const isTime = isExerciseTimeBased(ex);
            const fallbackWeight = isCardio ? 0 : (lastSet ? Number(lastSet.weight || 0) : (isBw ? 0 : (Number(getExerciseRememberedWeight(ex)) || 0)));
            const defaultTarget = resolveDefaultExerciseSetTarget(ex);
            const fallbackReps = lastSet ? Number(lastSet.reps || defaultTarget) : defaultTarget;
            ex.sets.push({
                setNo: ex.sets.length + 1,
                weight: fallbackWeight,
                reps: fallbackReps,
                isBodyweight: isBw,
                isTimeBased: isTime,
                isCardioMinutes: isCardio,
                completed: true
            });
            renderEditWorkoutLogExercises();
            updateEditWorkoutLogLiveTotals();
        }

        function removeEditLogSet(exIdx, sIdx) {
            if (!editingWorkoutLogState) return;
            const ex = editingWorkoutLogState.draft.exercises[exIdx];
            if (!ex || !Array.isArray(ex.sets)) return;
            if (ex.sets.length <= 1) {
                editingWorkoutLogState.draft.exercises.splice(exIdx, 1);
                if (editingWorkoutLogState.swapExIdx === exIdx) editingWorkoutLogState.swapExIdx = null;
            } else {
                ex.sets.splice(sIdx, 1);
                ex.sets.forEach((st, i) => { st.setNo = i + 1; });
            }
            renderEditWorkoutLogExercises();
            updateEditWorkoutLogLiveTotals();
        }

        function removeEditLogExercise(exIdx) {
            if (!editingWorkoutLogState) return;
            editingWorkoutLogState.draft.exercises.splice(exIdx, 1);
            if (editingWorkoutLogState.swapExIdx === exIdx) editingWorkoutLogState.swapExIdx = null;
            else if (editingWorkoutLogState.swapExIdx !== null && editingWorkoutLogState.swapExIdx > exIdx) {
                editingWorkoutLogState.swapExIdx--;
            }
            renderEditWorkoutLogExercises();
            updateEditWorkoutLogLiveTotals();
        }

        function toggleEditLogSwapPicker(exIdx) {
            if (!editingWorkoutLogState) return;
            editingWorkoutLogState.swapExIdx = editingWorkoutLogState.swapExIdx === exIdx ? null : exIdx;
            editingWorkoutLogState.swapQuery = '';
            renderEditWorkoutLogExercises();
        }

        function onEditLogSwapSearchInput(val) {
            if (!editingWorkoutLogState || editingWorkoutLogState.swapExIdx === null) return;
            editingWorkoutLogState.swapQuery = String(val || '');
            renderEditLogSwapResults(editingWorkoutLogState.swapExIdx);
        }

        function selectEditLogSwapExercise(exIdx, newExId) {
            if (!editingWorkoutLogState || typeof EXERCISES_DB === 'undefined') return;
            const dbEx = EXERCISES_DB.find(e => e.id === newExId);
            const curEx = editingWorkoutLogState.draft.exercises[exIdx];
            if (!dbEx || !curEx) return;
            const isBw = isExerciseBodyweight(dbEx);
            const isCardio = isExerciseCardioMinutes(dbEx);
            const isTime = isExerciseTimeBased(dbEx);
            curEx.id = dbEx.id;
            curEx.name = dbEx.name;
            curEx.equipment = dbEx.equipment || 'dumbbell';
            curEx.category = dbEx.category || 'push';
            curEx.muscle = dbEx.muscle || '';
            curEx.cue = dbEx.cue || '';
            curEx.isBodyweight = isBw;
            curEx.isTimeBased = isTime;
            curEx.isCardioMinutes = isCardio;
            (curEx.sets || []).forEach(st => {
                st.isBodyweight = isBw;
                st.isTimeBased = isTime;
                st.isCardioMinutes = isCardio;
                if (isCardio) st.weight = 0;
            });
            editingWorkoutLogState.swapExIdx = null;
            editingWorkoutLogState.swapQuery = '';
            renderEditWorkoutLogExercises();
            updateEditWorkoutLogLiveTotals();
        }

        function toggleEditLogMetaDrawer() {
            const drawer = document.getElementById('editLogMetaDrawer');
            const arrow = document.getElementById('editLogMetaToggleArrow');
            if (!drawer) return;
            const isHidden = drawer.style.display === 'none';
            drawer.style.display = isHidden ? 'block' : 'none';
            if (arrow) arrow.textContent = isHidden ? '▲ Kapat' : '▼ Aç';
        }

        function toggleEditLogAddExerciseDrawer() {
            const drawer = document.getElementById('editLogAddExDrawer');
            if (!drawer) return;
            const isHidden = drawer.style.display === 'none';
            drawer.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                const inp = document.getElementById('editLogAddExSearchInput');
                if (inp) inp.value = '';
                renderEditLogAddExerciseResults();
            }
        }

        function renderEditLogAddExerciseResults() {
            const container = document.getElementById('editLogAddExResults');
            const inp = document.getElementById('editLogAddExSearchInput');
            if (!container) return;
            const matches = filterEditLogDbExercises(inp ? inp.value : '');
            if (matches.length === 0) {
                container.innerHTML = `<div style="font-size:11.5px; color:#E2E8F0; padding:6px;">Sonuç bulunamadı</div>`;
                return;
            }
            container.innerHTML = matches.map(dbEx => {
                const cleanTitle = String(dbEx.name || '').replace(/\s*\([^)]*\)/g, '').trim() || dbEx.name;
                return `
                    <button type="button" class="edit-log-picker-item" style="background:#121024; border:1px solid rgba(167, 139, 250, 0.25); color:#FFFFFF;" onclick="appendExerciseToEditLog(decodeURIComponent('${encodeURIComponent(dbEx.id)}'))">
                        <span style="color:#FFFFFF;">${escapeHTML(cleanTitle)}</span>
                        <span style="font-size:10.5px; color:#E2E8F0; font-weight:700;">${escapeHTML(dbEx.equipment || '')}</span>
                    </button>
                `;
            }).join('');
        }

        function appendExerciseToEditLog(exId) {
            if (!editingWorkoutLogState || typeof EXERCISES_DB === 'undefined') return;
            const dbEx = EXERCISES_DB.find(e => e.id === exId);
            if (!dbEx) return;
            const isBw = isExerciseBodyweight(dbEx);
            const isCardio = isExerciseCardioMinutes(dbEx);
            const isTime = isExerciseTimeBased(dbEx);
            const remembered = (isBw || isCardio) ? 0 : (Number(getExerciseRememberedWeight(dbEx)) || 0);
            const defaultMetric = resolveDefaultExerciseSetTarget(dbEx);
            editingWorkoutLogState.draft.exercises.push({
                id: dbEx.id,
                name: dbEx.name,
                equipment: dbEx.equipment || 'dumbbell',
                category: dbEx.category || 'push',
                muscle: dbEx.muscle || '',
                cue: dbEx.cue || '',
                isBodyweight: isBw,
                isTimeBased: isTime,
                isCardioMinutes: isCardio,
                sets: Array.from({ length: isCardio ? 1 : 3 }, (_, idx) => ({
                    setNo: idx + 1,
                    weight: remembered,
                    reps: defaultMetric,
                    isBodyweight: isBw,
                    isTimeBased: isTime,
                    isCardioMinutes: isCardio,
                    completed: true
                }))
            });
            const drawer = document.getElementById('editLogAddExDrawer');
            if (drawer) drawer.style.display = 'none';
            renderEditWorkoutLogExercises();
            updateEditWorkoutLogLiveTotals();
        }

        function editWorkoutLog(id) {
            const logs = getWorkoutLogs();
            const target = logs.find(l => l && String(l.id) === String(id));
            if (!target) return;

            const draft = JSON.parse(JSON.stringify(target));
            draft.exercises = (Array.isArray(draft.exercises) ? draft.exercises : []).map(normalizeEditLogExercise);
            const origDurationSecs = Number(target.durationSecs || 0);
            const origDurationMin = Number(target.duration) || Math.max(1, Math.round((origDurationSecs || 2700) / 60));

            editingWorkoutLogState = {
                originalId: target.id,
                originalExercises: JSON.parse(JSON.stringify(draft.exercises)),
                originalDate: String(target.date || '').slice(0, 10),
                originalDuration: origDurationMin,
                originalDurationSecs: origDurationSecs,
                originalDateFormatted: String(target.dateFormatted || ''),
                originalTimestamp: Number(target.timestamp || 0),
                draft,
                swapExIdx: null,
                swapQuery: ''
            };

            const progEl = document.getElementById('editLogProgramInput');
            const durEl = document.getElementById('editLogDurationInput');
            const dateEl = document.getElementById('editLogDateInput');
            const rpeEl = document.getElementById('editLogRpeSelect');
            const locTypeEl = document.getElementById('editLogLocationTypeSelect');
            const locNameEl = document.getElementById('editLogLocationNameInput');
            const notesEl = document.getElementById('editLogNotesInput');

            if (progEl) progEl.value = draft.program || draft.title || '';
            if (durEl) durEl.value = String(origDurationMin);
            if (dateEl) dateEl.value = String(draft.date || '').slice(0, 10);
            if (rpeEl) {
                const rpePrefix = String(draft.rpe || 'RPE 8').match(/RPE\s*\d+/i)?.[0]?.toUpperCase() || 'RPE 8';
                const matchOpt = Array.from(rpeEl.options).find(opt => opt.value.toUpperCase().startsWith(rpePrefix));
                rpeEl.value = matchOpt ? matchOpt.value : rpeEl.options[1].value;
            }
            if (locTypeEl) {
                const lt = draft.locationType || (draft.locationName === 'Ev' ? 'ev' : (draft.locationName === 'Açık Hava' ? 'acik_hava' : 'salon'));
                locTypeEl.value = ['salon', 'ev', 'acik_hava'].includes(lt) ? lt : 'salon';
            }
            if (locNameEl) locNameEl.value = draft.locationName || '';
            if (notesEl) notesEl.value = draft.notes || '';

            const metaDrawer = document.getElementById('editLogMetaDrawer');
            const metaArrow = document.getElementById('editLogMetaToggleArrow');
            if (metaDrawer) metaDrawer.style.display = 'none';
            if (metaArrow) metaArrow.textContent = '▼ Aç';

            const addDrawer = document.getElementById('editLogAddExDrawer');
            if (addDrawer) addDrawer.style.display = 'none';

            renderEditWorkoutLogExercises();
            updateEditWorkoutLogLiveTotals();

            const modal = document.getElementById('editWorkoutLogModal');
            const modalBox = document.getElementById('editWorkoutLogModalBox');
            if (modal) modal.classList.add('active');
            if (modalBox) modalBox.scrollTop = 0;
        }

        function closeEditWorkoutLogModal() {
            const modal = document.getElementById('editWorkoutLogModal');
            if (modal) modal.classList.remove('active');
            editingWorkoutLogState = null;
        }

        function saveEditedWorkoutLog() {
            if (!editingWorkoutLogState) return;
            const st = editingWorkoutLogState;
            const draft = st.draft;
            if (!Array.isArray(draft.exercises) || draft.exercises.length === 0) {
                alert('En az 1 hareket kalmalıdır.');
                return;
            }

            const progVal = (document.getElementById('editLogProgramInput')?.value || '').trim() || 'Antrenman Seansı';
            const durRaw = parseInt(document.getElementById('editLogDurationInput')?.value, 10);
            const duration = (!isNaN(durRaw) && durRaw >= 1 && durRaw <= 600) ? durRaw : st.originalDuration;
            const dateInputVal = (document.getElementById('editLogDateInput')?.value || '').trim();
            const nextDate = /^\d{4}-\d{2}-\d{2}$/.test(dateInputVal) ? dateInputVal : (st.originalDate || toLocalYmdString(new Date()));
            const rpeVal = document.getElementById('editLogRpeSelect')?.value || 'RPE 8 (İdeal, cepte 2 tekrar kaldı)';
            const locTypeVal = document.getElementById('editLogLocationTypeSelect')?.value || 'salon';
            const defaultLocName = locTypeVal === 'ev' ? 'Ev' : (locTypeVal === 'acik_hava' ? 'Açık Hava' : 'Spor Salonu');
            const locNameVal = (document.getElementById('editLogLocationNameInput')?.value || '').trim() || defaultLocName;
            const notesVal = (document.getElementById('editLogNotesInput')?.value || '').trim();

            const durationSecs = (duration === st.originalDuration && st.originalDurationSecs > 0) ? st.originalDurationSecs : duration * 60;
            const durationFormatted = formatSecondsToHMS(durationSecs);

            let dateFormatted = st.originalDateFormatted;
            let timestamp = st.originalTimestamp || Date.now();
            if (nextDate !== st.originalDate) {
                const timeMatch = String(st.originalDateFormatted || '').match(/(\d{2}:\d{2})\s*$/);
                const hhmm = timeMatch ? timeMatch[1] : new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(timestamp || Date.now()));
                const parts = nextDate.split('-').map(Number);
                const [hh, mm] = hhmm.split(':').map(Number);
                const localDt = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1, hh || 12, mm || 0, 0);
                const datePart = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium' }).format(localDt);
                dateFormatted = `${datePart} ${hhmm}`;
                timestamp = localDt.getTime();
            }

            const stats = computeEditLogDraftStats(draft);
            const logs = getWorkoutLogs();
            const targetIdx = logs.findIndex(l => l && String(l.id) === String(st.originalId));
            if (targetIdx === -1) {
                closeEditWorkoutLogModal();
                return;
            }

            const updatedLog = Object.assign({}, logs[targetIdx], {
                program: progVal,
                title: progVal,
                duration,
                durationSecs,
                durationFormatted,
                date: nextDate,
                dateFormatted,
                timestamp,
                rpe: rpeVal,
                locationType: locTypeVal,
                locationName: locNameVal,
                notes: notesVal,
                exercises: stats.exercises,
                totalVolumeKg: stats.totalVolumeKg,
                totalSetsCompleted: stats.totalSetsCompleted,
                totalRepsCompleted: stats.totalRepsCompleted,
                totalIsometricSecsCompleted: stats.totalIsometricSecsCompleted,
                muscleGroups: stats.muscleGroups,
                userEditedAt: Date.now()
            });
            if ('programName' in updatedLog) updatedLog.programName = progVal;

            logs[targetIdx] = updatedLog;
            setWorkoutLogs(logs);

            if (
                (updatedLog.garminActivityId || String(updatedLog.id || '').startsWith('garmin_')) &&
                window.GarminTredictChief &&
                typeof window.GarminTredictChief.propagateWorkoutLogTitleToWatch === 'function'
            ) {
                try { window.GarminTredictChief.propagateWorkoutLogTitleToWatch(updatedLog); } catch {}
            }

            const affectedExercises = [...(st.originalExercises || []), ...(updatedLog.exercises || [])];
            closeEditWorkoutLogModal();
            refreshViewsAfterHistoryMutation(affectedExercises);
        }

        window.editWorkoutLog = editWorkoutLog;
        window.deleteWorkoutLog = deleteWorkoutLog;
        window.closeEditWorkoutLogModal = closeEditWorkoutLogModal;
        window.saveEditedWorkoutLog = saveEditedWorkoutLog;
        window.toggleEditLogMetaDrawer = toggleEditLogMetaDrawer;
        window.toggleEditLogAddExerciseDrawer = toggleEditLogAddExerciseDrawer;
        window.renderEditLogAddExerciseResults = renderEditLogAddExerciseResults;
        window.appendExerciseToEditLog = appendExerciseToEditLog;
        window.toggleEditLogSwapPicker = toggleEditLogSwapPicker;
        window.onEditLogSwapSearchInput = onEditLogSwapSearchInput;
        window.selectEditLogSwapExercise = selectEditLogSwapExercise;
        window.onEditLogSetFieldInput = onEditLogSetFieldInput;
        window.toggleEditLogSetCompleted = toggleEditLogSetCompleted;
        window.addEditLogSet = addEditLogSet;
        window.removeEditLogSet = removeEditLogSet;
        window.removeEditLogExercise = removeEditLogExercise;
        window.syncLastWeightsCacheFromHistory = syncLastWeightsCacheFromHistory;

        // ==================== WORKOUT DETAILS MODAL (CAROUSEL / SWIPEABLE & LIST MODE) ====================
        let workoutDetailsModalState = {
            logId: null,
            exercises: [],
            currentIndex: 0,
            viewMode: 'card',
            isEditingCurrentCard: false,
            cardEditSets: [],
            isEditingSubModal: false,
            subModalEditIndex: null,
            subModalEditSets: []
        };

        function toggleWorkoutDetailsViewMode() {
            if (!workoutDetailsModalState) return;
            const newMode = workoutDetailsModalState.viewMode === 'card' ? 'list' : 'card';
            workoutDetailsModalState.viewMode = newMode;
            applyWorkoutDetailsViewMode();
        }

        function applyWorkoutDetailsViewMode() {
            const cardNav = document.getElementById('workoutDetailsCarouselNav');
            const cardViewport = document.getElementById('workoutDetailsCardViewport');
            const listView = document.getElementById('workoutDetailsSimpleListView');
            const iconEl = document.getElementById('workoutDetailsViewModeIcon');
            const textEl = document.getElementById('workoutDetailsViewModeText');

            if (!workoutDetailsModalState) return;
            const isList = workoutDetailsModalState.viewMode === 'list';

            if (cardNav) cardNav.style.display = isList ? 'none' : 'flex';
            if (cardViewport) cardViewport.style.display = isList ? 'none' : 'block';
            if (listView) listView.style.display = isList ? 'flex' : 'none';

            if (iconEl) iconEl.textContent = isList ? 'Kart' : 'Liste';
            if (textEl) textEl.textContent = isList ? 'Kart' : 'Liste';

            if (isList) {
                renderWorkoutDetailsSimpleList();
            } else {
                renderWorkoutDetailsCurrentCard(0);
            }
        }

        function renderWorkoutDetailsSimpleList() {
            const listEl = document.getElementById('workoutDetailsSimpleListView');
            if (!listEl || !workoutDetailsModalState) return;
            const { exercises } = workoutDetailsModalState;

            if (!exercises || exercises.length === 0) {
                listEl.innerHTML = `<div style="text-align:center; padding:16px; color:#E2E8F0; font-size:13px;">Kayıtlı hareket bulunamadı.</div>`;
                return;
            }

            listEl.innerHTML = exercises.map((ex, idx) => {
                const cleanExTitle = String(ex.name || '').replace(/\s*\([^)]*\)/g, '').trim() || ex.name;
                const setsArr = Array.isArray(ex.sets) ? ex.sets : [];
                const completedSetsCount = setsArr.filter(s => s && s.completed).length || Number(ex.completedSets || setsArr.length || 1);

                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:#121024; border:1px solid rgba(167, 139, 250, 0.25); border-radius:10px; padding:10px 12px; box-shadow:0 2px 8px rgba(0,0,0,0.25);">
                        <div style="min-width:0; flex:1; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:11px; font-weight:800; color:#F3E8FF; background:#2C2550; border:1px solid rgba(167, 139, 250, 0.35); border-radius:6px; padding:2px 7px;">
                                ${idx + 1}
                            </span>
                            <span style="font-size:13px; font-weight:800; color:#FFFFFF; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${escapeHTML(cleanExTitle)}
                            </span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                            <span style="font-size:11px; font-weight:700; color:#E2E8F0;">
                                ${completedSetsCount} Set
                            </span>
                            <button type="button" onclick="window.openWorkoutExerciseDetailSubModal(${idx})" style="height:28px; width:28px; background:#181530; border:1px solid rgba(167, 139, 250, 0.3); color:#CBD5E1; border-radius:50%; font-size:12px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;" title="Set Detaylarını Gör">
                                i
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function toggleWorkoutDetailsMuscles() {
            const musclesEl = document.getElementById('workoutDetailsMuscles');
            const arrowEl = document.getElementById('workoutDetailsMusclesArrow');
            if (!musclesEl) return;
            const isOpen = musclesEl.style.display === 'flex';
            musclesEl.style.display = isOpen ? 'none' : 'flex';
            if (arrowEl) arrowEl.textContent = isOpen ? '▼' : '▲';
        }

        function updateWorkoutDetailsModalStats(l) {
            const statsEl = document.getElementById('workoutDetailsStats');
            if (statsEl) {
                statsEl.style.background = '#121024';
                statsEl.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                const durSecs = Number(l.durationSecs || 0);
                const durMin = Number(l.duration || 0);
                let durStr = durSecs > 0 ? formatSecondsToHMS(durSecs) : (durMin > 0 ? `${durMin} Dk` : '-');
                const computedVol = Number(l.totalVolumeKg) || 0;
                const isCardio = isHistoryCardioSession(l, computedVol);

                if (isCardio) {
                    const hs = l.healthSummary || l.summary || {};
                    const avgHr = Number(hs.heartrateAvg || hs.heartrate || l.avgHeartrate || 0);
                    const cal = Number(hs.calories || l.calories || 0);
                    if (durStr === '-' && Array.isArray(l.exercises)) {
                        let mSum = 0;
                        l.exercises.forEach(ex => {
                            if (Array.isArray(ex.sets)) ex.sets.forEach(st => { if (st.completed) mSum += (Number(st.reps) || 0); });
                        });
                        if (mSum > 0) durStr = `${mSum} Dk`;
                    }
                    statsEl.innerHTML = `
                        <div>
                            <div style="font-size:10.5px; font-weight:700; color:#94A3B8;">Ort. Nabız</div>
                            <div style="font-size:13.5px; font-weight:900; color:#FFFFFF; margin-top:2px;">${avgHr > 0 ? `${Math.round(avgHr)} bpm` : '—'}</div>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; color:#94A3B8;">Kalori</div>
                            <div style="font-size:13.5px; font-weight:900; color:#FFFFFF; margin-top:2px;">${cal > 0 ? `${Math.round(cal)} kcal` : '—'}</div>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; color:#94A3B8;">Süre</div>
                            <div style="font-size:13.5px; font-weight:900; color:#FFFFFF; margin-top:2px;">${durStr}</div>
                        </div>
                    `;
                } else {
                    const totalVol = computedVol > 0 ? `${Math.round(computedVol).toLocaleString('tr-TR')} kg` : 'Vücut Ağırlığı';
                    const setsCount = l.totalSetsCompleted || l.completedSetsCount || (l.exercises ? l.exercises.reduce((a, b) => a + (b.completedSets || (b.sets ? b.sets.filter(s => s.completed).length : 0)), 0) : 0);
                    const repsCount = l.totalRepsCompleted || l.completedRepsCount || (l.exercises ? l.exercises.reduce((a, b) => a + (b.sets ? b.sets.filter(s => s.completed).reduce((rA, rB) => rA + (Number(rB.reps) || 0), 0) : 0), 0) : 0);
                    const setsReps = repsCount > 0 ? `${setsCount} Set • ${repsCount} Tk` : `${setsCount} Set`;
                    if (durStr === '-') durStr = '00:00';

                    statsEl.innerHTML = `
                        <div>
                            <div style="font-size:10.5px; font-weight:700; color:#94A3B8;">Toplam Tonaj</div>
                            <div style="font-size:13.5px; font-weight:900; color:#FFFFFF; margin-top:2px;">${totalVol}</div>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; color:#94A3B8;">Set / Tekrar</div>
                            <div style="font-size:13.5px; font-weight:900; color:#FFFFFF; margin-top:2px;">${setsReps}</div>
                        </div>
                        <div>
                            <div style="font-size:10.5px; font-weight:700; color:#94A3B8;">Toplam Süre</div>
                            <div style="font-size:13.5px; font-weight:900; color:#FFFFFF; margin-top:2px;">${durStr}</div>
                        </div>
                    `;
                }
            }

            const musclesContainer = document.getElementById('workoutDetailsMusclesContainer');
            const musclesEl = document.getElementById('workoutDetailsMuscles');
            const countTextEl = document.getElementById('workoutDetailsMusclesCountText');
            const toggleBtn = document.getElementById('workoutDetailsMusclesToggleBtn');
            if (toggleBtn) {
                toggleBtn.style.background = '#14532D';
                toggleBtn.style.borderColor = '#22C55E';
                toggleBtn.style.color = '#BBF7D0';
            }
            if (musclesEl && musclesContainer) {
                musclesEl.style.background = '#121024';
                musclesEl.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                const mList = Array.isArray(l.muscleGroups) ? l.muscleGroups : [];
                const shortMuscles = [];
                mList.forEach(rawM => {
                    let s = String(rawM || '').replace(/[()]/g, '').trim();
                    if (!s) return;
                    let tag = s;
                    if (/kanat|sırt|kürek|trapez/i.test(s)) tag = 'Sırt';
                    else if (/göğüs/i.test(s)) tag = 'Göğüs';
                    else if (/omuz/i.test(s)) tag = 'Omuz';
                    else if (/ön bacak|arka bacak|bacak|kalf|baldır|diz/i.test(s)) tag = 'Bacak';
                    else if (/kalça/i.test(s)) tag = 'Kalça';
                    else if (/triceps|arka kol/i.test(s)) tag = 'Triceps';
                    else if (/biceps|ön kol|pazı/i.test(s)) tag = 'Biceps';
                    else if (/karın|core|korse/i.test(s)) tag = 'Karın';
                    if (tag && !shortMuscles.includes(tag)) shortMuscles.push(tag);
                });

                if (shortMuscles.length > 0) {
                    musclesContainer.style.display = 'block';
                    if (countTextEl) countTextEl.textContent = `${shortMuscles.length} Kas`;
                    musclesEl.innerHTML = shortMuscles.map(m => `
                        <span style="background:#14532D; border:1px solid #22C55E; color:#BBF7D0; font-size:11px; font-weight:700; padding:2px 7px; border-radius:6px;">
                            ${escapeHTML(m)}
                        </span>
                    `).join('');
                } else {
                    musclesContainer.style.display = 'none';
                }
            }
        }

        // ==================== INLINE CARD EXERCISE EDIT ====================
        function startDetailCardExerciseEdit() {
            if (!workoutDetailsModalState || !workoutDetailsModalState.exercises) return;
            const ex = workoutDetailsModalState.exercises[workoutDetailsModalState.currentIndex];
            if (!ex) return;
            const origSets = (Array.isArray(ex.sets) && ex.sets.length > 0)
                ? ex.sets
                : [{ setNo: 1, weight: Number(ex.weight || 0), reps: Number(ex.reps || 10), completed: true }];
            workoutDetailsModalState.cardEditSets = JSON.parse(JSON.stringify(origSets));
            workoutDetailsModalState.isEditingCurrentCard = true;
            renderWorkoutDetailsCurrentCard(0);
        }

        function cancelDetailCardExerciseEdit() {
            if (!workoutDetailsModalState) return;
            workoutDetailsModalState.isEditingCurrentCard = false;
            workoutDetailsModalState.cardEditSets = [];
            renderWorkoutDetailsCurrentCard(0);
        }

        function syncCardEditInputsToState() {
            if (!workoutDetailsModalState || !workoutDetailsModalState.cardEditSets) return;
            workoutDetailsModalState.cardEditSets.forEach((st, idx) => {
                const wInput = document.getElementById(`cardEditWeight_${idx}`);
                const rInput = document.getElementById(`cardEditReps_${idx}`);
                if (wInput) st.weight = Math.max(0, parseFloat(wInput.value) || 0);
                if (rInput) st.reps = Math.max(0, parseInt(rInput.value, 10) || 0);
            });
        }

        function addCardEditSet() {
            if (!workoutDetailsModalState || !workoutDetailsModalState.cardEditSets) return;
            syncCardEditInputsToState();
            const sets = workoutDetailsModalState.cardEditSets;
            const lastSet = sets[sets.length - 1] || { weight: 10, reps: 10 };
            sets.push({
                setNo: sets.length + 1,
                weight: Number(lastSet.weight || 0),
                reps: Number(lastSet.reps || 10),
                completed: true
            });
            renderWorkoutDetailsCurrentCard(0);
        }

        function removeCardEditSet(sIdx) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.cardEditSets) return;
            syncCardEditInputsToState();
            const sets = workoutDetailsModalState.cardEditSets;
            if (sets.length <= 1) {
                alert('En az 1 set bulunmalıdır.');
                return;
            }
            sets.splice(sIdx, 1);
            sets.forEach((st, i) => { st.setNo = i + 1; });
            renderWorkoutDetailsCurrentCard(0);
        }

        function toggleCardEditSetCompleted(sIdx) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.cardEditSets) return;
            syncCardEditInputsToState();
            const st = workoutDetailsModalState.cardEditSets[sIdx];
            if (st) {
                st.completed = !st.completed;
                renderWorkoutDetailsCurrentCard(0);
            }
        }

        function saveDetailCardExerciseEdit() {
            if (!workoutDetailsModalState || !workoutDetailsModalState.logId) return;
            syncCardEditInputsToState();
            const currentIdx = workoutDetailsModalState.currentIndex;
            const ex = workoutDetailsModalState.exercises[currentIdx];
            if (!ex) return;

            const sets = workoutDetailsModalState.cardEditSets;
            if (!sets || sets.length === 0) {
                alert('En az 1 set bulunmalıdır.');
                return;
            }

            ex.sets = JSON.parse(JSON.stringify(sets));

            const logs = getWorkoutLogs();
            const targetLogIdx = logs.findIndex(l => l && String(l.id) === String(workoutDetailsModalState.logId));
            if (targetLogIdx === -1) {
                alert('Kayıt bulunamadı.');
                return;
            }

            const draft = { exercises: workoutDetailsModalState.exercises };
            const stats = computeEditLogDraftStats(draft);
            const targetLog = logs[targetLogIdx];

            const updatedLog = Object.assign({}, targetLog, {
                exercises: stats.exercises,
                totalVolumeKg: stats.totalVolumeKg,
                totalSetsCompleted: stats.totalSetsCompleted,
                totalRepsCompleted: stats.totalRepsCompleted,
                totalIsometricSecsCompleted: stats.totalIsometricSecsCompleted,
                muscleGroups: stats.muscleGroups,
                userEditedAt: Date.now()
            });

            logs[targetLogIdx] = updatedLog;
            setWorkoutLogs(logs);

            workoutDetailsModalState.exercises = stats.exercises;
            workoutDetailsModalState.isEditingCurrentCard = false;
            workoutDetailsModalState.cardEditSets = [];

            updateWorkoutDetailsModalStats(updatedLog);
            renderWorkoutDetailsCurrentCard(0);
            refreshViewsAfterHistoryMutation([ex]);
        }

        // ==================== INLINE SUB-MODAL EXERCISE EDIT ====================
        function startSubModalExerciseEdit(idx) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.exercises) return;
            const targetIdx = (typeof idx === 'number') ? idx : (workoutDetailsModalState.selectedSubModalIdx ?? 0);
            const ex = workoutDetailsModalState.exercises[targetIdx];
            if (!ex) return;
            const origSets = (Array.isArray(ex.sets) && ex.sets.length > 0)
                ? ex.sets
                : [{ setNo: 1, weight: Number(ex.weight || 0), reps: Number(ex.reps || 10), completed: true }];
            workoutDetailsModalState.isEditingSubModal = true;
            workoutDetailsModalState.subModalEditIndex = targetIdx;
            workoutDetailsModalState.subModalEditSets = JSON.parse(JSON.stringify(origSets));
            renderSubModalExerciseEditView();
        }

        function cancelSubModalExerciseEdit() {
            if (!workoutDetailsModalState) return;
            workoutDetailsModalState.isEditingSubModal = false;
            workoutDetailsModalState.subModalEditSets = [];
            openWorkoutExerciseDetailSubModal(workoutDetailsModalState.subModalEditIndex);
        }

        function syncSubModalEditInputsToState() {
            if (!workoutDetailsModalState || !workoutDetailsModalState.subModalEditSets) return;
            workoutDetailsModalState.subModalEditSets.forEach((st, idx) => {
                const wInput = document.getElementById(`subModalEditWeight_${idx}`);
                const rInput = document.getElementById(`subModalEditReps_${idx}`);
                if (wInput) st.weight = Math.max(0, parseFloat(wInput.value) || 0);
                if (rInput) st.reps = Math.max(0, parseInt(rInput.value, 10) || 0);
            });
        }

        function addSubModalEditSet() {
            if (!workoutDetailsModalState || !workoutDetailsModalState.subModalEditSets) return;
            syncSubModalEditInputsToState();
            const sets = workoutDetailsModalState.subModalEditSets;
            const lastSet = sets[sets.length - 1] || { weight: 10, reps: 10 };
            sets.push({
                setNo: sets.length + 1,
                weight: Number(lastSet.weight || 0),
                reps: Number(lastSet.reps || 10),
                completed: true
            });
            renderSubModalExerciseEditView();
        }

        function removeSubModalEditSet(sIdx) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.subModalEditSets) return;
            syncSubModalEditInputsToState();
            const sets = workoutDetailsModalState.subModalEditSets;
            if (sets.length <= 1) {
                alert('En az 1 set bulunmalıdır.');
                return;
            }
            sets.splice(sIdx, 1);
            sets.forEach((st, i) => { st.setNo = i + 1; });
            renderSubModalExerciseEditView();
        }

        function toggleSubModalEditSetCompleted(sIdx) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.subModalEditSets) return;
            syncSubModalEditInputsToState();
            const st = workoutDetailsModalState.subModalEditSets[sIdx];
            if (st) {
                st.completed = !st.completed;
                renderSubModalExerciseEditView();
            }
        }

        function saveSubModalExerciseEdit() {
            if (!workoutDetailsModalState || !workoutDetailsModalState.logId) return;
            syncSubModalEditInputsToState();
            const targetIdx = workoutDetailsModalState.subModalEditIndex;
            const ex = workoutDetailsModalState.exercises[targetIdx];
            if (!ex) return;

            const sets = workoutDetailsModalState.subModalEditSets;
            if (!sets || sets.length === 0) {
                alert('En az 1 set bulunmalıdır.');
                return;
            }

            ex.sets = JSON.parse(JSON.stringify(sets));

            const logs = getWorkoutLogs();
            const targetLogIdx = logs.findIndex(l => l && String(l.id) === String(workoutDetailsModalState.logId));
            if (targetLogIdx === -1) {
                alert('Kayıt bulunamadı.');
                return;
            }

            const draft = { exercises: workoutDetailsModalState.exercises };
            const stats = computeEditLogDraftStats(draft);
            const targetLog = logs[targetLogIdx];

            const updatedLog = Object.assign({}, targetLog, {
                exercises: stats.exercises,
                totalVolumeKg: stats.totalVolumeKg,
                totalSetsCompleted: stats.totalSetsCompleted,
                totalRepsCompleted: stats.totalRepsCompleted,
                totalIsometricSecsCompleted: stats.totalIsometricSecsCompleted,
                muscleGroups: stats.muscleGroups,
                userEditedAt: Date.now()
            });

            logs[targetLogIdx] = updatedLog;
            setWorkoutLogs(logs);

            workoutDetailsModalState.exercises = stats.exercises;
            workoutDetailsModalState.isEditingSubModal = false;
            workoutDetailsModalState.subModalEditSets = [];

            updateWorkoutDetailsModalStats(updatedLog);
            openWorkoutExerciseDetailSubModal(targetIdx);
            renderWorkoutDetailsSimpleList();
            refreshViewsAfterHistoryMutation([ex]);
        }

        function renderSubModalExerciseEditView() {
            const bodyEl = document.getElementById('subModalExerciseBody');
            const footerEl = document.getElementById('subModalExerciseFooter');
            const targetIdx = workoutDetailsModalState.subModalEditIndex;
            const ex = workoutDetailsModalState.exercises[targetIdx];
            if (!bodyEl || !ex) return;

            const isCardio = (typeof isExerciseCardioMinutes === 'function') ? isExerciseCardioMinutes(ex) : Boolean(ex.isCardio);
            const isTime = (typeof isExerciseTimeBased === 'function') ? isExerciseTimeBased(ex) : false;
            const editSets = workoutDetailsModalState.subModalEditSets || [];

            if (footerEl) footerEl.style.display = 'none';

            bodyEl.innerHTML = `
                <div style="font-size:11px; font-weight:800; color:#7DD3FC; text-transform:uppercase; margin-bottom:8px;">
                    ✏️ Setleri ve Ağırlıkları Düzenle
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${editSets.map((st, sIdx) => `
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#121024; border:1px solid rgba(167, 139, 250, 0.25); border-radius:8px; padding:6px 10px; gap:6px;">
                            <span style="font-size:11px; font-weight:800; color:#F3E8FF; background:#2C2550; border:1px solid rgba(167, 139, 250, 0.35); border-radius:4px; padding:3px 6px;">
                                S${st.setNo || sIdx + 1}
                            </span>
                            <div style="display:flex; align-items:center; gap:3px;">
                                <input type="number" id="subModalEditWeight_${sIdx}" step="0.5" min="0" value="${st.weight ?? 0}" style="width:58px; height:32px; text-align:center; font-weight:800; border:1px solid rgba(167, 139, 250, 0.35); border-radius:6px; font-size:13px; color:#FFFFFF; background:#181530;">
                                <span style="font-size:11px; font-weight:700; color:#E2E8F0;">kg</span>
                            </div>
                            <span style="color:#E2E8F0; font-weight:700;">×</span>
                            <div style="display:flex; align-items:center; gap:3px;">
                                <input type="number" id="subModalEditReps_${sIdx}" step="1" min="0" value="${st.reps ?? 10}" style="width:48px; height:32px; text-align:center; font-weight:800; border:1px solid rgba(167, 139, 250, 0.35); border-radius:6px; font-size:13px; color:#FFFFFF; background:#181530;">
                                <span style="font-size:11px; font-weight:700; color:#E2E8F0;">${isCardio ? 'dk' : (isTime ? 'sn' : 'tk')}</span>
                            </div>
                            <button type="button" onclick="window.toggleSubModalEditSetCompleted(${sIdx})" style="padding:4px 7px; border-radius:6px; font-size:11px; font-weight:800; border:1px solid ${st.completed ? '#22C55E' : '#475569'}; background:${st.completed ? '#14532D' : '#1E293B'}; color:${st.completed ? '#BBF7D0' : '#E2E8F0'}; cursor:pointer;">
                                ${st.completed ? '✓' : '—'}
                            </button>
                            <button type="button" onclick="window.removeSubModalEditSet(${sIdx})" style="background:none; border:none; color:#FCA5A5; font-size:13px; cursor:pointer; padding:2px 4px;" title="Seti Sil">
                                🗑️
                            </button>
                        </div>
                    `).join('')}
                </div>

                <button type="button" onclick="window.addSubModalEditSet()" style="width:100%; margin-top:8px; padding:7px; background:#121024; border:1px dashed rgba(167, 139, 250, 0.45); color:#7DD3FC; font-size:11.5px; font-weight:800; border-radius:8px; cursor:pointer;">
                    ➕ Set Ekle
                </button>

                <div style="display:flex; gap:8px; margin-top:14px; padding-top:10px; border-top:1px solid rgba(167, 139, 250, 0.25);">
                    <button type="button" onclick="window.saveSubModalExerciseEdit()" style="flex:1; background:#6D28D9; border:none; color:#FFFFFF; border-radius:10px; padding:10px; font-size:13px; font-weight:800; cursor:pointer;">
                        💾 Kaydet
                    </button>
                    <button type="button" onclick="window.cancelSubModalExerciseEdit()" style="flex:1; background:#2C2550; border:1px solid rgba(167, 139, 250, 0.35); color:#F3E8FF; border-radius:10px; padding:10px; font-size:13px; font-weight:800; cursor:pointer;">
                        ✕ İptal
                    </button>
                </div>
            `;
        }

        function openWorkoutExerciseDetailSubModal(idx) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.exercises) return;
            workoutDetailsModalState.selectedSubModalIdx = idx;
            workoutDetailsModalState.isEditingSubModal = false;
            const ex = workoutDetailsModalState.exercises[idx];
            if (!ex) return;

            const modal = document.getElementById('workoutExerciseDetailSubModal');
            const modalBox = document.getElementById('workoutExerciseDetailSubModalBox');
            const catEl = document.getElementById('subModalExerciseCategory');
            const titleEl = document.getElementById('subModalExerciseTitle');
            const bodyEl = document.getElementById('subModalExerciseBody');
            const footerEl = document.getElementById('subModalExerciseFooter');
            const subModalEditBtn = document.getElementById('subModalExerciseEditBtn');
            if (footerEl) footerEl.style.display = 'flex';
            if (subModalEditBtn) {
                subModalEditBtn.style.background = '#2C2550';
                subModalEditBtn.style.borderColor = 'rgba(167, 139, 250, 0.4)';
                subModalEditBtn.style.color = '#F3E8FF';
                subModalEditBtn.onclick = function () {
                    window.startSubModalExerciseEdit(idx);
                };
            }
            if (!modal || !bodyEl) return;

            const isBw = (typeof isExerciseBodyweight === 'function') ? isExerciseBodyweight(ex) : Boolean(ex.isBodyweight);
            const isCardio = (typeof isExerciseCardioMinutes === 'function') ? isExerciseCardioMinutes(ex) : Boolean(ex.isCardio);
            const safeSetsArr = Array.isArray(ex.sets)
                ? ex.sets
                : Array.from({ length: Math.max(1, Number(ex.sets || ex.completedSets || 1)) }, (_, sIdx) => ({
                    setNo: sIdx + 1,
                    weight: Number(ex.weight || 0),
                    reps: Number(ex.reps || 10),
                    completed: true
                }));

            let exVol = ex.exerciseVolume || 0;
            if (exVol === 0 && safeSetsArr.length > 0) {
                safeSetsArr.forEach(st => {
                    if (st.completed || parseInt(st.reps, 10) > 0) {
                        exVol += (typeof calculateExerciseSetVolume === 'function')
                            ? calculateExerciseSetVolume(ex, st.weight, st.reps)
                            : ((Number(st.weight) || 0) * (Number(st.reps) || 0));
                    }
                });
            }
            const volText = exVol > 0 ? `${Math.round(exVol).toLocaleString('tr-TR')} kg` : '';
            const cleanExTitle = String(ex.name || '').replace(/\s*\([^)]*\)/g, '').trim() || ex.name;

            if (catEl) {
                catEl.style.color = '#E2E8F0';
                catEl.textContent = `${idx + 1}. Egzersiz ${ex.muscle ? `• ${ex.muscle}` : ''}`;
            }
            if (titleEl) {
                titleEl.style.color = '#FFFFFF';
                titleEl.textContent = cleanExTitle;
            }

            bodyEl.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid rgba(167, 139, 250, 0.25);">
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        ${ex.equipment ? `<span style="font-size:10.5px; font-weight:700; background:#2C2550; border:1px solid rgba(167, 139, 250, 0.35); color:#F3E8FF; padding:2px 6px; border-radius:4px; text-transform:capitalize;">🔧 ${escapeHTML(ex.equipment)}</span>` : ''}
                    </div>
                    ${volText ? `<span style="font-size:11.5px; font-weight:800; color:#FDE68A; background:#451A03; border:1px solid #D97706; border-radius:6px; padding:2px 7px;">🏋️ ${volText}</span>` : ''}
                </div>

                <div style="font-size:12px; font-weight:800; color:#FFFFFF; margin-bottom:6px;">Tamamlanan Setler:</div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                    ${safeSetsArr.map((st, sIdx) => {
                        const wDisp = (typeof formatSetWeightDisplay === 'function') ? formatSetWeightDisplay(isBw, st.weight) : (Number(st.weight) > 0 ? `${st.weight} kg` : (isBw ? 'Vücut Ağ.' : '0 kg'));
                        const rDisp = (typeof formatSetMetricDisplay === 'function') ? formatSetMetricDisplay(ex, st.reps) : `${st.reps} tk`;
                        return st.completed ? `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#121024; border:1px solid rgba(167, 139, 250, 0.25); border-radius:8px; padding:8px 12px;">
                                <span style="font-size:12px; font-weight:800; color:#FFFFFF;">Set ${st.setNo || sIdx + 1}</span>
                                <span style="background:#14532D; border:1px solid #22C55E; color:#BBF7D0; font-size:12px; font-weight:800; padding:2px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">
                                    ${isCardio ? `${rDisp} ✓` : `${wDisp} × ${rDisp} ✓`}
                                </span>
                            </div>
                        ` : `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#121024; border:1px dashed rgba(167, 139, 250, 0.3); border-radius:8px; padding:8px 12px;">
                                <span style="font-size:12px; font-weight:800; color:#E2E8F0;">Set ${st.setNo || sIdx + 1}</span>
                                <span style="font-size:11.5px; font-weight:600; color:#E2E8F0; text-decoration:line-through;">Atlandı</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            modal.classList.add('active');
            modal.style.display = 'flex';
            if (modalBox) modalBox.scrollTop = 0;
        }

        function closeWorkoutExerciseDetailSubModal() {
            const modal = document.getElementById('workoutExerciseDetailSubModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        }

        function renderWorkoutDetailsCurrentCard(direction = 0) {
            if (!workoutDetailsModalState) return;
            const { exercises, currentIndex } = workoutDetailsModalState;
            const navEl = document.getElementById('workoutDetailsCarouselNav');
            const counterEl = document.getElementById('workoutDetailsCarouselCounter');
            const dotsEl = document.getElementById('workoutDetailsCarouselDots');
            const prevBtn = document.getElementById('workoutDetailsPrevBtn');
            const nextBtn = document.getElementById('workoutDetailsNextBtn');
            const cardEl = document.getElementById('workoutDetailsActiveCard');

            if (navEl) {
                navEl.style.background = '#121024';
                navEl.style.borderColor = 'rgba(167, 139, 250, 0.25)';
            }
            if (counterEl) {
                counterEl.style.color = '#FFFFFF';
            }
            if (prevBtn) {
                prevBtn.style.background = '#181530';
                prevBtn.style.borderColor = 'rgba(167, 139, 250, 0.35)';
                prevBtn.style.color = '#FFFFFF';
            }
            if (nextBtn) {
                nextBtn.style.background = '#181530';
                nextBtn.style.borderColor = 'rgba(167, 139, 250, 0.35)';
                nextBtn.style.color = '#FFFFFF';
            }
            if (cardEl) {
                cardEl.style.background = '#121024';
                cardEl.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                cardEl.style.color = '#FFFFFF';
            }

            if (!exercises || exercises.length === 0) {
                if (counterEl) counterEl.textContent = 'Hareket Yok';
                if (cardEl) cardEl.innerHTML = `<div style="text-align:center; padding:20px; color:#E2E8F0; font-size:13px;">Kayıtlı hareket bulunamadı.</div>`;
                return;
            }

            if (counterEl) {
                counterEl.textContent = `Hareket ${currentIndex + 1} / ${exercises.length}`;
            }

            if (dotsEl) {
                if (exercises.length <= 15) {
                    dotsEl.innerHTML = exercises.map((_, i) => `
                        <span onclick="window.jumpToWorkoutDetailsExercise(${i})" style="cursor:pointer; height:6px; width:${i === currentIndex ? '18px' : '6px'}; background:${i === currentIndex ? '#A78BFA' : 'rgba(167, 139, 250, 0.35)'}; border-radius:3px; transition:all 0.2s ease;"></span>
                    `).join('');
                } else {
                    dotsEl.innerHTML = '';
                }
            }

            if (prevBtn) {
                prevBtn.disabled = currentIndex === 0;
                prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
                prevBtn.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
            }
            if (nextBtn) {
                nextBtn.disabled = currentIndex === exercises.length - 1;
                nextBtn.style.opacity = currentIndex === exercises.length - 1 ? '0.35' : '1';
                nextBtn.style.cursor = currentIndex === exercises.length - 1 ? 'not-allowed' : 'pointer';
            }

            const ex = exercises[currentIndex];
            if (!ex || !cardEl) return;

            const isBw = (typeof isExerciseBodyweight === 'function') ? isExerciseBodyweight(ex) : Boolean(ex.isBodyweight);
            const isCardio = (typeof isExerciseCardioMinutes === 'function') ? isExerciseCardioMinutes(ex) : Boolean(ex.isCardio);
            const safeSetsArr = Array.isArray(ex.sets)
                ? ex.sets
                : Array.from({ length: Math.max(1, Number(ex.sets || ex.completedSets || 1)) }, (_, sIdx) => ({
                    setNo: sIdx + 1,
                    weight: Number(ex.weight || 0),
                    reps: Number(ex.reps || 10),
                    completed: true
                }));

            let exVol = ex.exerciseVolume || 0;
            if (exVol === 0 && safeSetsArr.length > 0) {
                safeSetsArr.forEach(st => {
                    if (st.completed || parseInt(st.reps, 10) > 0) {
                        exVol += (typeof calculateExerciseSetVolume === 'function')
                            ? calculateExerciseSetVolume(ex, st.weight, st.reps)
                            : ((Number(st.weight) || 0) * (Number(st.reps) || 0));
                    }
                });
            }
            const volText = exVol > 0 ? `${Math.round(exVol).toLocaleString('tr-TR')} kg` : '';
            const cleanExTitle = String(ex.name || '').replace(/\s*\([^)]*\)/g, '').trim() || ex.name;
            const completedSetsCount = safeSetsArr.filter(s => s.completed).length;

            if (workoutDetailsModalState.isEditingCurrentCard) {
                const isTime = (typeof isExerciseTimeBased === 'function') ? isExerciseTimeBased(ex) : false;
                const editSets = workoutDetailsModalState.cardEditSets || [];
                cardEl.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid rgba(167, 139, 250, 0.25);">
                        <div>
                            <span style="font-size:11px; font-weight:800; color:#C4B5FD; text-transform:uppercase; letter-spacing:0.5px;">
                                SETLERİ DÜZENLE
                            </span>
                            <h4 style="font-size:14.5px; font-weight:900; color:#FFFFFF; margin:2px 0 0 0; line-height:1.25;">
                                ${escapeHTML(cleanExTitle)}
                            </h4>
                        </div>
                        <span style="font-size:11px; font-weight:700; color:#E2E8F0;">
                            ${editSets.length} Set
                        </span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:8px;">
                        ${editSets.map((st, sIdx) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#181530; border:1px solid rgba(167, 139, 250, 0.25); border-radius:8px; padding:6px 10px; gap:6px;">
                                <span style="font-size:11px; font-weight:800; color:#F3E8FF; background:#2C2550; border:1px solid rgba(167, 139, 250, 0.35); border-radius:4px; padding:3px 6px;">
                                    S${st.setNo || sIdx + 1}
                                </span>
                                <div style="display:flex; align-items:center; gap:3px;">
                                    <input type="number" id="cardEditWeight_${sIdx}" step="0.5" min="0" value="${st.weight ?? 0}" style="width:58px; height:32px; text-align:center; font-weight:800; border:1px solid rgba(167, 139, 250, 0.35); border-radius:6px; font-size:13px; color:#FFFFFF; background:#121024;">
                                    <span style="font-size:11px; font-weight:700; color:#E2E8F0;">kg</span>
                                </div>
                                <span style="color:#E2E8F0; font-weight:700;">×</span>
                                <div style="display:flex; align-items:center; gap:3px;">
                                    <input type="number" id="cardEditReps_${sIdx}" step="1" min="0" value="${st.reps ?? 10}" style="width:48px; height:32px; text-align:center; font-weight:800; border:1px solid rgba(167, 139, 250, 0.35); border-radius:6px; font-size:13px; color:#FFFFFF; background:#121024;">
                                    <span style="font-size:11px; font-weight:700; color:#E2E8F0;">${isCardio ? 'dk' : (isTime ? 'sn' : 'tk')}</span>
                                </div>
                                <button type="button" onclick="window.toggleCardEditSetCompleted(${sIdx})" style="padding:4px 7px; border-radius:6px; font-size:11px; font-weight:800; border:1px solid ${st.completed ? '#22C55E' : '#475569'}; background:${st.completed ? '#14532D' : '#1E293B'}; color:${st.completed ? '#BBF7D0' : '#E2E8F0'}; cursor:pointer;">
                                    ${st.completed ? '✓' : '—'}
                                </button>
                                <button type="button" onclick="window.removeCardEditSet(${sIdx})" style="background:none; border:none; color:#94A3B8; font-size:13px; cursor:pointer; padding:2px 4px;" title="Seti Sil">
                                    ✕
                                </button>
                            </div>
                        `).join('')}
                    </div>

                    <button type="button" onclick="window.addCardEditSet()" style="width:100%; margin-top:8px; padding:7px; background:#181530; border:1px dashed rgba(167, 139, 250, 0.45); color:#C4B5FD; font-size:11.5px; font-weight:800; border-radius:8px; cursor:pointer;">
                        + Set Ekle
                    </button>

                    <div style="display:flex; gap:8px; margin-top:12px; padding-top:10px; border-top:1px solid rgba(167, 139, 250, 0.25);">
                        <button type="button" onclick="window.saveDetailCardExerciseEdit()" style="flex:1; background:#6D28D9; border:none; color:#FFFFFF; border-radius:8px; padding:9px; font-size:12.5px; font-weight:800; cursor:pointer;">
                            Kaydet
                        </button>
                        <button type="button" onclick="window.cancelDetailCardExerciseEdit()" style="flex:1; background:#2C2550; border:1px solid rgba(167, 139, 250, 0.35); color:#F3E8FF; border-radius:8px; padding:9px; font-size:12.5px; font-weight:800; cursor:pointer;">
                            İptal
                        </button>
                    </div>
                `;
                return;
            }

            const cardHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:8px;">
                    <div style="min-width:0; flex:1;">
                        <span style="font-size:11px; font-weight:700; color:#E2E8F0; text-transform:uppercase; letter-spacing:0.5px;">
                            ${currentIndex + 1}. Egzersiz ${ex.muscle ? `• ${escapeHTML(ex.muscle)}` : ''}
                        </span>
                        <h4 style="font-size:15px; font-weight:900; color:#FFFFFF; margin:2px 0 0 0; line-height:1.25;">
                            ${escapeHTML(cleanExTitle)}
                        </h4>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                        ${volText ? `
                            <span style="font-size:11px; font-weight:700; color:#CBD5E1; padding:3px 7px; white-space:nowrap;">
                                ${volText}
                            </span>
                        ` : ''}
                        <button type="button" onclick="window.startDetailCardExerciseEdit()" style="background:#2C2550; border:1px solid rgba(167, 139, 250, 0.4); color:#F3E8FF; border-radius:7px; padding:4px 10px; font-size:11px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Bu Hareketi Düzenle">
                            Düzenle
                        </button>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid rgba(167, 139, 250, 0.2); font-size:11.5px; color:#E2E8F0; font-weight:700;">
                    <span>Toplam ${completedSetsCount} / ${safeSetsArr.length} Set</span>
                    ${ex.equipment ? `<span style="text-transform:capitalize;">${escapeHTML(ex.equipment)}</span>` : ''}
                </div>

                <!-- SETS LIST -->
                <div style="display:flex; flex-direction:column; gap:6px;">
                    ${safeSetsArr.map((st, idx) => {
                        const wDisp = (typeof formatSetWeightDisplay === 'function') ? formatSetWeightDisplay(isBw, st.weight) : (Number(st.weight) > 0 ? `${st.weight} kg` : (isBw ? 'Vücut Ağ.' : '0 kg'));
                        const rDisp = (typeof formatSetMetricDisplay === 'function') ? formatSetMetricDisplay(ex, st.reps) : `${st.reps} tk`;
                        return st.completed ? `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#181530; border:1px solid rgba(167, 139, 250, 0.25); border-radius:8px; padding:8px 12px;">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span style="font-size:11px; font-weight:800; color:#F3E8FF; background:#2C2550; border:1px solid rgba(167, 139, 250, 0.35); border-radius:4px; padding:2px 6px;">
                                        S${st.setNo || idx + 1}
                                    </span>
                                    <span style="font-size:12.5px; font-weight:800; color:#FFFFFF;">
                                        ${isCardio ? 'Kardiyo Süresi' : `<strong>${wDisp}</strong>`}
                                    </span>
                                </div>
                                <span style="background:#14532D; border:1px solid #22C55E; color:#BBF7D0; font-size:12px; font-weight:800; padding:2px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">
                                    ${rDisp} ✓
                                </span>
                            </div>
                        ` : `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#181530; border:1px dashed rgba(167, 139, 250, 0.3); border-radius:8px; padding:8px 12px;">
                                <span style="font-size:11px; font-weight:800; color:#E2E8F0; background:#2C2550; border-radius:4px; padding:2px 6px;">
                                    S${st.setNo || idx + 1}
                                </span>
                                <span style="font-size:11.5px; font-weight:600; color:#E2E8F0; text-decoration:line-through;">
                                    Set Atlandı
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- SWIPE GUIDANCE -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:8px; border-top:1px solid rgba(255, 255, 255, 0.06); font-size:11px; color:#94A3B8; font-weight:600; user-select:none;">
                    <span style="cursor:pointer;" onclick="window.navigateWorkoutDetailsExercise(-1)">${currentIndex > 0 ? 'Önceki' : ''}</span>
                    <span>Sağa / Sola Kaydırın</span>
                    <span style="cursor:pointer;" onclick="window.navigateWorkoutDetailsExercise(1)">${currentIndex < exercises.length - 1 ? 'Sonraki' : ''}</span>
                </div>
            `;

            if (direction !== 0 && typeof setTimeout === 'function') {
                cardEl.style.opacity = '0';
                cardEl.style.transform = direction > 0 ? 'translateX(10px)' : 'translateX(-10px)';
                setTimeout(() => {
                    cardEl.innerHTML = cardHTML;
                    cardEl.style.transform = 'translateX(0)';
                    cardEl.style.opacity = '1';
                }, 80);
            } else {
                cardEl.innerHTML = cardHTML;
                cardEl.style.opacity = '1';
                cardEl.style.transform = 'translateX(0)';
            }
        }

        function navigateWorkoutDetailsExercise(direction) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.exercises.length) return;
            if (workoutDetailsModalState.isEditingCurrentCard) {
                workoutDetailsModalState.isEditingCurrentCard = false;
                workoutDetailsModalState.cardEditSets = [];
            }
            const nextIdx = workoutDetailsModalState.currentIndex + direction;
            if (nextIdx < 0 || nextIdx >= workoutDetailsModalState.exercises.length) return;
            workoutDetailsModalState.currentIndex = nextIdx;
            renderWorkoutDetailsCurrentCard(direction);
        }

        function jumpToWorkoutDetailsExercise(index) {
            if (!workoutDetailsModalState || !workoutDetailsModalState.exercises.length) return;
            if (index < 0 || index >= workoutDetailsModalState.exercises.length) return;
            if (workoutDetailsModalState.isEditingCurrentCard) {
                workoutDetailsModalState.isEditingCurrentCard = false;
                workoutDetailsModalState.cardEditSets = [];
            }
            const dir = index > workoutDetailsModalState.currentIndex ? 1 : -1;
            workoutDetailsModalState.currentIndex = index;
            renderWorkoutDetailsCurrentCard(dir);
        }

        let detailsSwipeStartX = 0;
        let detailsSwipeStartY = 0;

        function setupWorkoutDetailsSwipe() {
            const viewport = document.getElementById('workoutDetailsCardViewport');
            if (!viewport || viewport._swipeBound) return;
            viewport._swipeBound = true;

            viewport.addEventListener('touchstart', (e) => {
                if (!e.touches || !e.touches[0]) return;
                detailsSwipeStartX = e.touches[0].clientX;
                detailsSwipeStartY = e.touches[0].clientY;
            }, { passive: true });

            viewport.addEventListener('touchend', (e) => {
                if (!e.changedTouches || !e.changedTouches[0]) return;
                const deltaX = e.changedTouches[0].clientX - detailsSwipeStartX;
                const deltaY = e.changedTouches[0].clientY - detailsSwipeStartY;
                if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
                    if (deltaX < 0) {
                        navigateWorkoutDetailsExercise(1);
                    } else {
                        navigateWorkoutDetailsExercise(-1);
                    }
                }
            }, { passive: true });
        }

        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const subModal = document.getElementById('workoutExerciseDetailSubModal');
                    if (subModal && subModal.style.display !== 'none' && subModal.classList.contains('active')) {
                        closeWorkoutExerciseDetailSubModal();
                        e.stopPropagation();
                        return;
                    }
                    const modal = document.getElementById('workoutDetailsModal');
                    if (modal && modal.style.display !== 'none' && modal.classList.contains('active')) {
                        closeWorkoutDetailsModal();
                        return;
                    }
                }
                const modal = document.getElementById('workoutDetailsModal');
                if (!modal || modal.style.display === 'none' || !modal.classList.contains('active')) return;
                if (workoutDetailsModalState && workoutDetailsModalState.viewMode === 'card') {
                    if (e.key === 'ArrowLeft') {
                        navigateWorkoutDetailsExercise(-1);
                    } else if (e.key === 'ArrowRight') {
                        navigateWorkoutDetailsExercise(1);
                    }
                }
            });
        }

        function openWorkoutDetailsModal(logId) {
            try {
                const logs = getWorkoutLogs();
                const l = logs.find(item => item && (String(item.id) === String(logId) || String(item.timestamp) === String(logId)));
                if (!l) {
                    console.warn('[History] Seans kaydi bulunamadi:', logId);
                    return;
                }

                const modal = document.getElementById('workoutDetailsModal');
                const modalBox = document.getElementById('workoutDetailsModalBox');
                if (!modal) return;

                const viewModeBtn = document.getElementById('workoutDetailsViewModeBtn');
                if (viewModeBtn) {
                    viewModeBtn.style.background = '#2C2550';
                    viewModeBtn.style.borderColor = 'rgba(167, 139, 250, 0.4)';
                    viewModeBtn.style.color = '#F3E8FF';
                }

                const subtitleEl = document.getElementById('workoutDetailsSubtitle');
                if (subtitleEl) {
                    subtitleEl.style.color = '#CBD5E1';
                    const locType = l.locationType || (l.locationName === 'Ev' ? 'ev' : 'salon');
                    const locName = l.locationName || (locType === 'ev' ? 'Ev' : (locType === 'acik_hava' ? 'Açık Hava' : 'Spor Salonu'));
                    const cleanDateText = formatHistoryDateShortTR(l.date || l.dateFormatted, l.timestamp);

                    subtitleEl.innerHTML = `
                        <span style="font-size:12px; font-weight:700; color:#CBD5E1; white-space:nowrap;">${escapeHTML(cleanDateText)}</span>
                        <span style="color:#94A3B8; font-size:11.5px; font-weight:600; white-space:nowrap;">• ${escapeHTML(stripHistoryEmojis(locName))}</span>
                        ${l.healthSummary && l.healthSummary.heartrateAvg ? `
                            <span style="color:#94A3B8; font-size:11.5px; font-weight:600; white-space:nowrap;">
                                • Ort. ${Number(l.healthSummary.heartrateAvg)} bpm${l.healthSummary.calories ? ` • ${Number(l.healthSummary.calories)} kcal` : ''}
                            </span>
                        ` : ''}
                    `;
                }

                const titleEl = document.getElementById('workoutDetailsTitle');
                if (titleEl) {
                    titleEl.style.color = '#FFFFFF';
                    const cleanProgramTitle = cleanHistorySessionTitle(l.program || l.programName || l.title || 'Antrenman Seansı');
                    titleEl.textContent = cleanProgramTitle;
                }

                updateWorkoutDetailsModalStats(l);

                // Initialize Carousel & View State
                const exercises = Array.isArray(l.exercises) ? l.exercises : [];
                workoutDetailsModalState = {
                    logId: l.id,
                    exercises: exercises,
                    currentIndex: 0,
                    viewMode: 'card',
                    isEditingCurrentCard: false,
                    cardEditSets: [],
                    isEditingSubModal: false,
                    subModalEditIndex: null,
                    subModalEditSets: []
                };

                applyWorkoutDetailsViewMode();
                setupWorkoutDetailsSwipe();

                const notesEl = document.getElementById('workoutDetailsNotes');
                if (notesEl) {
                    notesEl.style.background = 'transparent';
                    notesEl.style.borderColor = 'transparent';
                    notesEl.style.color = '#94A3B8';
                    notesEl.style.fontStyle = 'italic';
                    const cleanNoteModal = stripHistoryEmojis(l.notes);
                    if (cleanNoteModal) {
                        notesEl.style.display = 'block';
                        notesEl.textContent = cleanNoteModal;
                    } else {
                        notesEl.style.display = 'none';
                        notesEl.textContent = '';
                    }
                }

                const editBtn = document.getElementById('workoutDetailsEditBtn');
                if (editBtn) {
                    editBtn.onclick = function () {
                        closeWorkoutDetailsModal();
                        editWorkoutLog(decodeURIComponent(encodeURIComponent(l.id)));
                    };
                }

                modal.classList.add('active');
                modal.style.display = 'flex';
                if (modalBox) modalBox.scrollTop = 0;
            } catch (err) {
                console.error('[History] Detay modali acilirken hata:', err);
            }
        }

        function closeWorkoutDetailsModal() {
            closeWorkoutExerciseDetailSubModal();
            const modal = document.getElementById('workoutDetailsModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            workoutDetailsModalState = {
                logId: null,
                exercises: [],
                currentIndex: 0,
                viewMode: 'card',
                isEditingCurrentCard: false,
                cardEditSets: [],
                isEditingSubModal: false,
                subModalEditIndex: null,
                subModalEditSets: []
            };
        }

        function editSpecificExerciseFromDetailsModal(idx) {
            startDetailCardExerciseEdit();
        }

        window.openWorkoutDetailsModal = openWorkoutDetailsModal;
        window.closeWorkoutDetailsModal = closeWorkoutDetailsModal;
        window.navigateWorkoutDetailsExercise = navigateWorkoutDetailsExercise;
        window.jumpToWorkoutDetailsExercise = jumpToWorkoutDetailsExercise;
        window.toggleWorkoutDetailsViewMode = toggleWorkoutDetailsViewMode;
        window.openWorkoutExerciseDetailSubModal = openWorkoutExerciseDetailSubModal;
        window.closeWorkoutExerciseDetailSubModal = closeWorkoutExerciseDetailSubModal;
        window.editSpecificExerciseFromDetailsModal = editSpecificExerciseFromDetailsModal;
        window.toggleWorkoutDetailsMuscles = toggleWorkoutDetailsMuscles;
        window.startDetailCardExerciseEdit = startDetailCardExerciseEdit;
        window.cancelDetailCardExerciseEdit = cancelDetailCardExerciseEdit;
        window.addCardEditSet = addCardEditSet;
        window.removeCardEditSet = removeCardEditSet;
        window.toggleCardEditSetCompleted = toggleCardEditSetCompleted;
        window.saveDetailCardExerciseEdit = saveDetailCardExerciseEdit;
        window.startSubModalExerciseEdit = startSubModalExerciseEdit;
        window.cancelSubModalExerciseEdit = cancelSubModalExerciseEdit;
        window.addSubModalEditSet = addSubModalEditSet;
        window.removeSubModalEditSet = removeSubModalEditSet;
        window.toggleSubModalEditSetCompleted = toggleSubModalEditSetCompleted;
        window.saveSubModalExerciseEdit = saveSubModalExerciseEdit;

        function calculateStreakForLogs(logs) {
            let streak = 0;
            const uniqueDates = [...new Set(logs.map(l => l.date))].sort().reverse();
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                const dateStr = toLocalYmdString(checkDate);
                if (uniqueDates.includes(dateStr)) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }
            return streak;
        }

        let currentHistoryLocationFilter = 'all';

        const HISTORY_MONTHS_SHORT_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        const HISTORY_MONTH_FULL_TO_SHORT_TR = {
            ocak: 'Oca', subat: 'Şub', şubat: 'Şub', mart: 'Mar', nisan: 'Nis',
            mayis: 'May', mayıs: 'May', haziran: 'Haz', temmuz: 'Tem',
            agustos: 'Ağu', ağustos: 'Ağu', eylul: 'Eyl', eylül: 'Eyl',
            ekim: 'Eki', kasim: 'Kas', kasım: 'Kas', aralik: 'Ara', aralık: 'Ara'
        };

        function stripHistoryEmojis(str) {
            return String(str || '')
                .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function formatHistoryDateShortTR(rawDate, fallbackTs) {
            const rawStr = stripHistoryEmojis(rawDate);
            if (rawStr) {
                const ymdMatch = rawStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (ymdMatch) {
                    const mIdx = Number(ymdMatch[2]) - 1;
                    if (mIdx >= 0 && mIdx < 12) {
                        return `${Number(ymdMatch[3])} ${HISTORY_MONTHS_SHORT_TR[mIdx]} ${ymdMatch[1]}`;
                    }
                }
                if (/^\d{4}-\d{2}-\d{2}T/.test(rawStr)) {
                    const isoDt = new Date(rawStr);
                    if (!isNaN(isoDt.getTime())) {
                        return `${isoDt.getDate()} ${HISTORY_MONTHS_SHORT_TR[isoDt.getMonth()]} ${isoDt.getFullYear()}`;
                    }
                }
                const dotMatch = rawStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
                if (dotMatch) {
                    const mIdx = Number(dotMatch[2]) - 1;
                    if (mIdx >= 0 && mIdx < 12) {
                        return `${Number(dotMatch[1])} ${HISTORY_MONTHS_SHORT_TR[mIdx]} ${dotMatch[3]}`;
                    }
                }
                const trNoTime = rawStr.replace(/\s*[•·,-]?\s*\d{1,2}:\d{2}(:\d{2})?.*$/, '').trim();
                const trTextMatch = trNoTime.match(/^(\d{1,2})\s+([A-Za-zÇŞĞÖÜıİçşğöü]+)\s+(\d{4})$/);
                if (trTextMatch) {
                    const mKey = trTextMatch[2].replace(/[İIı]/g, 'i').toLowerCase();
                    const shortM = HISTORY_MONTH_FULL_TO_SHORT_TR[mKey] || trTextMatch[2];
                    return `${Number(trTextMatch[1])} ${shortM} ${trTextMatch[3]}`;
                }
                const parsedDt = new Date(rawStr);
                if (!isNaN(parsedDt.getTime())) {
                    return `${parsedDt.getDate()} ${HISTORY_MONTHS_SHORT_TR[parsedDt.getMonth()]} ${parsedDt.getFullYear()}`;
                }
            }
            const tsNum = Number(fallbackTs);
            if (Number.isFinite(tsNum) && tsNum > 0) {
                const tsDt = new Date(tsNum);
                if (!isNaN(tsDt.getTime())) {
                    return `${tsDt.getDate()} ${HISTORY_MONTHS_SHORT_TR[tsDt.getMonth()]} ${tsDt.getFullYear()}`;
                }
            }
            return rawStr || '';
        }

        function isHistoryCardioSession(log, computedVolKg) {
            if (!log || typeof log !== 'object') return false;
            if (log.isCardioActivity === true) return true;
            const exs = Array.isArray(log.exercises) ? log.exercises : [];
            if (exs.length > 0 && exs.every(ex => ex && ((typeof isExerciseCardioMinutes === 'function' && isExerciseCardioMinutes(ex)) || /^cond_/.test(String(ex.id || ex.exId || ''))))) {
                return true;
            }
            const vol = Number(computedVolKg) || 0;
            const reps = Number(log.totalRepsCompleted) || 0;
            if (vol === 0 && reps === 0 && /yürüyüş|koşu|kürek|kardiyo|walking|running|rowing|bisiklet/i.test(String(log.program || log.title || ''))) {
                return true;
            }
            return false;
        }

        function normalizeHistoryTextKey(str) {
            return String(str || '')
                .replace(/[İIı]/g, 'i')
                .toLowerCase()
                .replace(/\u0307/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function getCanonicalHistoryLocation(log) {
            const raw = stripHistoryEmojis(log && (log.locationName || (log.locationType === 'ev' ? 'Ev' : (log.locationType === 'acik_hava' ? 'Açık Hava' : 'Spor Salonu')))) || 'Spor Salonu';
            const key = normalizeHistoryTextKey(raw) || 'spor salonu';
            let label = raw;
            if (key === 'ev') label = 'Ev';
            else if (key === 'spor salonu' || key === 'salon') label = 'Spor Salonu';
            else if (key === 'acik hava' || key === 'acik hava / park' || key === 'açık hava' || key === 'açık hava / park') label = 'Açık Hava';
            else {
                label = raw.split(' ').map(w => w ? (w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR')) : '').join(' ');
            }
            return { key, label };
        }

        function cleanHistorySessionTitle(rawTitle) {
            let s = stripHistoryEmojis(String(rawTitle || '').replace(/\s*\([^)]*\)/g, ''));
            const colonParts = s.split(/\s*:\s*/);
            if (colonParts.length >= 2) {
                const deduped = [];
                colonParts.forEach(part => {
                    const t = part.trim();
                    if (!t) return;
                    const prevNorm = deduped.length ? normalizeHistoryTextKey(deduped[deduped.length - 1]) : '';
                    if (normalizeHistoryTextKey(t) !== prevNorm) deduped.push(t);
                });
                s = deduped.join(': ');
            }
            return s.replace(/\s+/g, ' ').trim() || 'Antrenman Seansı';
        }

        function formatHistoryCompactMinutes(log) {
            if (!log || typeof log !== 'object') return '';
            const durMinNum = Number(log.duration);
            if (Number.isFinite(durMinNum) && durMinNum > 0) {
                return `${Math.round(durMinNum)} dk`;
            }
            const durSecNum = Number(log.durationSecs);
            if (Number.isFinite(durSecNum) && durSecNum > 0) {
                return `${Math.max(1, Math.round(durSecNum / 60))} dk`;
            }
            const rawFmt = String(log.durationFormatted || '').trim();
            if (rawFmt) {
                const hmsMatch = rawFmt.match(/^(\d+):(\d{2}):(\d{2})$/);
                if (hmsMatch) {
                    const mins = Number(hmsMatch[1]) * 60 + Number(hmsMatch[2]) + (Number(hmsMatch[3]) >= 30 ? 1 : 0);
                    if (mins > 0) return `${mins} dk`;
                }
                const msMatch = rawFmt.match(/^(\d+):(\d{2})$/);
                if (msMatch) {
                    const mins = Number(msMatch[1]) + (Number(msMatch[2]) >= 30 ? 1 : 0);
                    return `${Math.max(1, mins)} dk`;
                }
            }
            if (Array.isArray(log.exercises)) {
                let cardioMinsSum = 0;
                log.exercises.forEach(ex => {
                    const isCardioEx = (typeof isExerciseCardioMinutes === 'function' && isExerciseCardioMinutes(ex)) || /^cond_/.test(String(ex && (ex.id || ex.exId) || ''));
                    if (isCardioEx && Array.isArray(ex.sets)) {
                        ex.sets.forEach(st => {
                            if (st.completed !== false) cardioMinsSum += (Number(st.reps) || 0);
                        });
                    }
                });
                if (cardioMinsSum > 0) return `${Math.round(cardioMinsSum)} dk`;
            }
            return '';
        }

        window.formatHistoryDateShortTR = formatHistoryDateShortTR;
        window.stripHistoryEmojis = stripHistoryEmojis;
        window.cleanHistorySessionTitle = cleanHistorySessionTitle;

        function filterHistoryByLocation(loc) {
            currentHistoryLocationFilter = loc === 'all' ? 'all' : (normalizeHistoryTextKey(loc) || 'all');
            renderHistory();
        }

        window.closeHistoryTopMenu = function () {
            const menu = document.getElementById('historyTopDropdownMenu');
            if (menu) menu.style.display = 'none';
        };

        window.toggleHistoryTopMenu = function (e) {
            if (e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
            }
            const menu = document.getElementById('historyTopDropdownMenu');
            if (!menu) return;
            const isClosed = menu.style.display === 'none' || !menu.style.display;
            document.querySelectorAll('[id^="menu_actions_"]').forEach(el => el.style.display = 'none');
            document.querySelectorAll('[id^="bubble_muscles_"]').forEach(el => el.style.display = 'none');
            menu.style.display = isClosed ? 'block' : 'none';
        };

        window.toggleHistoryMuscleBubble = function (key, e) {
            if (e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
            }
            const target = document.getElementById('bubble_muscles_' + key);
            if (!target) return;
            const isClosed = target.style.display === 'none' || !target.style.display;
            document.querySelectorAll('[id^="bubble_muscles_"]').forEach(el => el.style.display = 'none');
            document.querySelectorAll('[id^="menu_actions_"]').forEach(el => el.style.display = 'none');
            window.closeHistoryTopMenu();
            if (isClosed) {
                target.style.display = 'block';
            }
        };

        window.toggleHistoryActionMenu = function (key, e) {
            if (e) {
                if (e.stopPropagation) e.stopPropagation();
                if (e.preventDefault) e.preventDefault();
            }
            const target = document.getElementById('menu_actions_' + key);
            if (!target) return;
            const isClosed = target.style.display === 'none' || !target.style.display;
            document.querySelectorAll('[id^="menu_actions_"]').forEach(el => el.style.display = 'none');
            document.querySelectorAll('[id^="bubble_muscles_"]').forEach(el => el.style.display = 'none');
            window.closeHistoryTopMenu();
            if (isClosed) {
                target.style.display = 'block';
            }
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('[id^="bubble_muscles_"]') && !e.target.closest('button[onclick*="toggleHistoryMuscleBubble"]')) {
                    document.querySelectorAll('[id^="bubble_muscles_"]').forEach(el => el.style.display = 'none');
                }
                if (!e.target.closest('[id^="menu_actions_"]') && !e.target.closest('button[onclick*="toggleHistoryActionMenu"]')) {
                    document.querySelectorAll('[id^="menu_actions_"]').forEach(el => el.style.display = 'none');
                }
                if (!e.target.closest('#historyTopDropdownMenu') && !e.target.closest('#btnHistoryTopMenu')) {
                    window.closeHistoryTopMenu();
                }
            });
        }

        function renderHistory() {
            if (window.GarminTredictChief && typeof window.GarminTredictChief.renderHistoryGarminSyncPanel === 'function') {
                try { window.GarminTredictChief.renderHistoryGarminSyncPanel(); } catch (e) {}
            }
            const allLogs = getWorkoutLogs();
            if (typeof refreshTopFitnessCardioScoreBars === 'function') refreshTopFitnessCardioScoreBars();
            const container = document.getElementById('logHistoryContainer');
            if (!container) return;

            const total = allLogs.length;
            const streak = calculateStreakForLogs(allLogs);

            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)));
            startOfWeek.setHours(0,0,0,0);
            const thisWeek = allLogs.filter(l => new Date(l.date) >= startOfWeek).length;

            const statTotalEl = document.getElementById('statTotalWorkouts');
            const statWeekEl = document.getElementById('statWeekWorkouts');
            const statStreakEl = document.getElementById('statStreak');
            if (statTotalEl) {
                statTotalEl.innerText = total;
                if (statTotalEl.style && typeof statTotalEl.style.setProperty === 'function') statTotalEl.style.setProperty('color', '#FFFFFF', 'important');
            }
            if (statWeekEl) {
                statWeekEl.innerText = `${thisWeek}/3`;
                if (statWeekEl.style && typeof statWeekEl.style.setProperty === 'function') statWeekEl.style.setProperty('color', '#FFFFFF', 'important');
            }
            if (statStreakEl) {
                statStreakEl.innerText = streak;
                if (statStreakEl.style && typeof statStreakEl.style.setProperty === 'function') statStreakEl.style.setProperty('color', '#FFFFFF', 'important');
            }

            if (allLogs.length === 0) {
                container.innerHTML = `
                    <div style="background:#121024; padding:20px; text-align:center; border:1px dashed rgba(167, 139, 250, 0.3); border-radius:12px; color:#94A3B8; font-size:12.5px;">
                        Henüz kayıtlı antrenman seansınız yok. İlk antrenmanınızı tamamlayıp kaydedin.
                    </div>
                `;
                return;
            }

            // Group by location for filtering & stats (case-insensitive)
            const locationGroups = {};
            allLogs.forEach(l => {
                const { key, label } = getCanonicalHistoryLocation(l);
                if (!locationGroups[key]) locationGroups[key] = { key, label, count: 0 };
                locationGroups[key].count += 1;
            });

            const distinctLocations = Object.values(locationGroups);
            const activeLocKey = currentHistoryLocationFilter === 'all' ? 'all' : normalizeHistoryTextKey(currentHistoryLocationFilter);

            let filterBarHTML = '';
            if (distinctLocations.length > 0) {
                filterBarHTML = `
                    <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:4px; margin-bottom:8px;" class="hide-scrollbar">
                        <button type="button" class="history-loc-chip ${activeLocKey === 'all' ? 'is-active' : ''}" onclick="filterHistoryByLocation('all')">
                            Tümü (${allLogs.length})
                        </button>
                        ${distinctLocations.map(grp => {
                            const isActive = activeLocKey === grp.key;
                            return `
                                <button type="button" class="history-loc-chip ${isActive ? 'is-active' : ''}" onclick="filterHistoryByLocation(decodeURIComponent('${encodeURIComponent(grp.key)}'))">
                                    ${escapeHTML(grp.label)} (${grp.count})
                                </button>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            const logs = activeLocKey === 'all'
                ? allLogs
                : allLogs.filter(l => getCanonicalHistoryLocation(l).key === activeLocKey);

            if (logs.length === 0) {
                const activeGroupLabel = (locationGroups[activeLocKey] && locationGroups[activeLocKey].label) || currentHistoryLocationFilter;
                container.innerHTML = filterBarHTML + `
                    <div style="background:#121024; padding:16px; text-align:center; border:1px dashed rgba(167, 139, 250, 0.3); border-radius:12px; color:#94A3B8; font-size:12px;">
                        "${escapeHTML(activeGroupLabel)}" mekanında kayıtlı antrenman seansı bulunamadı.
                    </div>
                `;
                return;
            }

            container.innerHTML = filterBarHTML + logs.map(l => {
                let logVol = l.totalVolumeKg || 0;
                if (logVol === 0 && Array.isArray(l.exercises)) {
                    l.exercises.forEach(ex => {
                        if (Array.isArray(ex.sets)) {
                            ex.sets.forEach(st => {
                                if (st.completed || parseInt(st.reps, 10) > 0) {
                                    logVol += calculateExerciseSetVolume(ex, st.weight, st.reps);
                                }
                            });
                        }
                    });
                }

                const durCompact = formatHistoryCompactMinutes(l);
                const isCardioLog = isHistoryCardioSession(l, logVol);
                let inlineMetricParts = [];

                if (isCardioLog) {
                    const hs = l.healthSummary || l.summary || {};
                    let avgHr = Number(hs.heartrateAvg || hs.heartrate || l.avgHeartrate || 0);
                    if (avgHr === 0 && Array.isArray(l.exercises)) {
                        const hrVals = l.exercises.map(ex => Number(ex && ex.healthTelemetry && ex.healthTelemetry.avgHeartrate || 0)).filter(v => v > 0);
                        if (hrVals.length > 0) avgHr = hrVals.reduce((a, b) => a + b, 0) / hrVals.length;
                    }
                    const calVal = Number(hs.calories || l.calories || 0);
                    if (avgHr > 0) inlineMetricParts.push(`${Math.round(avgHr)} bpm`);
                    if (calVal > 0) inlineMetricParts.push(`${Math.round(calVal)} kcal`);
                    if (durCompact) inlineMetricParts.push(durCompact);
                    if (inlineMetricParts.length === 0) inlineMetricParts.push('Kardiyo');
                } else {
                    inlineMetricParts.push(logVol > 0 ? `${Math.round(logVol).toLocaleString('tr-TR')} kg` : 'Vücut Ağırlığı');
                    const setsCnt = Number(l.totalSetsCompleted || 0);
                    const repsCnt = Number(l.totalRepsCompleted || 0);
                    if (setsCnt > 0) {
                        inlineMetricParts.push(repsCnt > 0 ? `${setsCnt} Set (${repsCnt} Tk)` : `${setsCnt} Set`);
                    }
                    if (durCompact) inlineMetricParts.push(durCompact);
                }

                const statsInlineText = inlineMetricParts.join(' · ');
                const displayDate = formatHistoryDateShortTR(l.date || l.dateFormatted, l.timestamp);
                const safeLogKey = String(l.id || Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9_]/g, '_');
                const cleanProgramTitle = cleanHistorySessionTitle(l.program || l.title || 'Antrenman Seansı');
                const cleanNote = stripHistoryEmojis(l.notes);

                return `
                    <div class="log-history-card">
                        <div class="log-card-header">
                            <h3 class="log-card-title">${escapeHTML(cleanProgramTitle)}</h3>
                            <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                                <span class="log-date">${escapeHTML(displayDate)}</span>
                                <div style="position:relative; display:inline-block;">
                                    <button type="button" onclick="window.toggleHistoryActionMenu('${safeLogKey}', event)" title="Seans İşlemleri" style="height:24px; width:24px; background:transparent; border:none; color:#94A3B8; border-radius:6px; font-size:15px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;">
                                        ⋮
                                    </button>
                                    <div id="menu_actions_${safeLogKey}" style="display:none; position:absolute; right:0; top:calc(100% + 4px); z-index:9999; background:#181530; border:1px solid rgba(167, 139, 250, 0.3); border-radius:12px; padding:6px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.6); width:145px; animation:popIn 0.15s ease-out;">
                                        <button type="button" class="btn-view-log" onclick="window.toggleHistoryActionMenu('${safeLogKey}'); window.openWorkoutDetailsModal(decodeURIComponent('${encodeURIComponent(l.id)}'));" style="width:100%; text-align:left; background:none; border:none; padding:8px 10px; border-radius:6px; font-size:12px; font-weight:700; color:#FFFFFF; cursor:pointer; display:flex; align-items:center; gap:8px;">
                                            <span>Görüntüle</span>
                                        </button>
                                        <div style="height:1px; background:rgba(255, 255, 255, 0.06); margin:4px 0;"></div>
                                        <button type="button" class="btn-delete-log" onclick="window.toggleHistoryActionMenu('${safeLogKey}'); deleteWorkoutLog(decodeURIComponent('${encodeURIComponent(l.id)}'));" style="width:100%; text-align:left; background:none; border:none; padding:8px 10px; border-radius:6px; font-size:12px; font-weight:700; color:#FCA5A5; cursor:pointer; display:flex; align-items:center; gap:8px;">
                                            <span>Seansı Sil</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="log-stats-inline tabular-nums">${escapeHTML(statsInlineText)}</div>

                        ${cleanNote ? `<div class="log-note-inline" title="${escapeHTML(cleanNote)}">${escapeHTML(cleanNote)}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        function sanitizeCsvCell(val) {
            let str = String(val === null || val === undefined ? '' : val);
            if (/^[=+\-@\t\r]/.test(str)) {
                str = "'" + str;
            }
            return `"${str.replace(/"/g, '""')}"`;
        }

        function exportCSV() {
            const uid = getActiveUserId();
            const logs = getWorkoutLogs();
            if (logs.length === 0) {
                alert("Henüz dışa aktarılacak bir antrenman kaydınız bulunmuyor.");
                return;
            }

            const headers = ["Tarih", "Program", "Mekan_Tipi", "Salon_Adi", "Sure_Dk", "RPE", "Toplam_Tonaj_Kg", "Egzersiz", "Ekipman", "Kas_Grubu", "Set_No", "Kilo_Kg", "Tekrar", "Hacim_Kg", "Durum"];
            const rows = [headers.join(",")];

            logs.forEach(l => {
                const date = sanitizeCsvCell(l.dateFormatted || l.date);
                const prog = sanitizeCsvCell(l.program);
                const locType = sanitizeCsvCell(l.locationType === 'salon' ? 'Spor Salonu' : (l.locationType === 'ev' ? 'Ev' : (l.locationType === 'acik_hava' ? 'Açık Hava' : 'Diğer')));
                const locName = sanitizeCsvCell(l.locationName || (l.locationType === 'ev' ? 'Ev' : 'Salon'));
                const dur = sanitizeCsvCell(l.duration || '');
                const rpe = sanitizeCsvCell(l.rpe || '');
                const totalVol = Number(l.totalVolumeKg) || 0;

                if (l.exercises && l.exercises.length > 0) {
                    l.exercises.forEach(ex => {
                        const exName = sanitizeCsvCell(ex.name);
                        const equip = sanitizeCsvCell(ex.equipment || '');
                        const muscle = sanitizeCsvCell(ex.muscle || '');
                        if (ex.sets && ex.sets.length > 0) {
                            ex.sets.forEach(st => {
                                const setNo = Number(st.setNo) || 1;
                                const isDone = !!st.completed;
                                const w = isDone ? (Number(st.weight) || 0) : 0;
                                const r = isDone ? (Number(st.reps) || 0) : 0;
                                const v = isDone ? (w * r) : 0;
                                const status = isDone ? '"Tamamlandı"' : '"Atlandı"';
                                rows.push([date, prog, locType, locName, dur, rpe, totalVol, exName, equip, muscle, setNo, w, r, v, status].join(","));
                            });
                        } else {
                            rows.push([date, prog, locType, locName, dur, rpe, totalVol, exName, equip, muscle, 1, 0, 0, 0, '"Atlandı"'].join(","));
                        }
                    });
                } else {
                    rows.push([date, prog, locType, locName, dur, rpe, totalVol, sanitizeCsvCell('Genel'), '""', '""', 1, 0, 0, 0, '"Tamamlandı"'].join(","));
                }
            });

            const csvContent = "\uFEFF" + rows.join("\r\n"); // UTF-8 BOM for Excel Turkish characters
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_antrenman_analiz_${uid}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function exportData() {
            const uid = getActiveUserId();
            const logs = getWorkoutLogs();
            const rawData = {
                userId: uid,
                history: logs,
                exportDate: new Date().toISOString()
            };
            const data = (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.sanitizeCloudExportBundle === 'function')
                ? window.CelikBridgeCustoms.sanitizeCloudExportBundle(rawData)
                : rawData;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_yedek_${uid}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function importData(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Güvenlik: Maksimum 2 MB dosya sınırı (bellek tükenmesi ve DoS önleme)
            if (file.size > 2 * 1024 * 1024) {
                alert("❌ Güvenlik Uyarısı: Yedek dosya boyutu 2 MB sınırından büyüktür!");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data && typeof data === 'object' && Array.isArray(data.history)) {
                        // Şema doğrulama ve veri temizliği (mevcut geçmişle akıllı birleştirme)
                        const sanitizedHistory = data.history
                            .filter(item => item && typeof item === 'object')
                            .slice(0, 500)
                            .map(item => ({
                                id: String(item.id || ('log_' + Date.now())).slice(0, 50),
                                program: String(item.program || '').slice(0, 150),
                                date: String(item.date || '').slice(0, 30),
                                duration: Number.isFinite(Number(item.duration)) ? Number(item.duration) : String(item.duration || '').slice(0, 10),
                                rpe: String(item.rpe || '').slice(0, 50),
                                notes: String(item.notes || '').slice(0, 2000),
                                locationName: String(item.locationName || '').slice(0, 50),
                                locationType: String(item.locationType || '').slice(0, 30),
                                exercises: Array.isArray(item.exercises) ? item.exercises.slice(0, 30) : [],
                                muscleGroups: Array.isArray(item.muscleGroups) ? item.muscleGroups.slice(0, 20) : [],
                                dateFormatted: item.dateFormatted ? String(item.dateFormatted).slice(0, 40) : undefined,
                                durationFormatted: item.durationFormatted ? String(item.durationFormatted).slice(0, 20) : undefined,
                                durationSecs: Number(item.durationSecs) || 0,
                                totalVolumeKg: Number(item.totalVolumeKg) || 0,
                                totalSetsCompleted: Number(item.totalSetsCompleted) || 0,
                                totalRepsCompleted: Number(item.totalRepsCompleted) || 0,
                                totalIsometricSecsCompleted: Number(item.totalIsometricSecsCompleted) || 0,
                                garminActivityId: item.garminActivityId ? String(item.garminActivityId).slice(0, 60) : undefined,
                                healthSummary: item.healthSummary && typeof item.healthSummary === 'object' ? item.healthSummary : undefined,
                                userEditedAt: Number(item.userEditedAt) || undefined,
                                timestamp: Number(item.timestamp) || getWorkoutLogTimestampMs({ date: item.date, dateFormatted: item.dateFormatted }) || Date.now()
                            }));
                        const existingLogs = getWorkoutLogs();
                        const mergedById = new Map();
                        existingLogs.forEach(item => {
                            if (item && item.id) mergedById.set(String(item.id), item);
                        });
                        sanitizedHistory.forEach(item => {
                            if (!item || !item.id) return;
                            const prev = mergedById.get(String(item.id));
                            if (!prev) {
                                mergedById.set(String(item.id), item);
                                return;
                            }
                            const prevEd = Number(prev.userEditedAt || 0);
                            const nextEd = Number(item.userEditedAt || 0);
                            if (prevEd > nextEd) {
                                mergedById.set(String(item.id), Object.assign({}, prev, {
                                    garminActivityId: prev.garminActivityId || item.garminActivityId,
                                    healthSummary: prev.healthSummary || item.healthSummary
                                }));
                            } else {
                                mergedById.set(String(item.id), Object.assign({}, prev, item, {
                                    garminActivityId: item.garminActivityId || prev.garminActivityId,
                                    healthSummary: item.healthSummary || prev.healthSummary
                                }));
                            }
                        });
                        const mergedList = sortWorkoutLogsDesc(Array.from(mergedById.values()));
                        setWorkoutLogs(mergedList);
                        if (window.GarminTredictChief && typeof window.GarminTredictChief.handoffCompletedActivitiesToTabChiefs === 'function') {
                            window.GarminTredictChief.handoffCompletedActivitiesToTabChiefs();
                        }
                        if (typeof window.syncGarminActivitiesFromTredict === 'function') {
                            window.syncGarminActivitiesFromTredict();
                        }
                        renderHistory();
                        alert("✅ Antrenman geçmişi yüklendi ve Garmin saat verileriyle eşleştirildi!");
                    } else {
                        alert("❌ Hata: Geçersiz yedek dosyası şeması!");
                    }
                } catch(err) {
                    alert("❌ Hata: Geçersiz veya bozuk yedek dosyası!");
                }
            };
            reader.readAsText(file);
        }

