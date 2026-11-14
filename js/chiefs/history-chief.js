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
                <span>Toplam: ${Math.round(stats.totalVolumeKg).toLocaleString('tr-TR')} kg</span>
                <span>${stats.totalSetsCompleted} Set • ${stats.totalRepsCompleted} Tekrar${timePart}</span>
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
                container.innerHTML = `<div style="font-size:11.5px; color:#64748B; padding:6px;">Sonuç bulunamadı</div>`;
                return;
            }
            container.innerHTML = matches.map(dbEx => {
                const cleanTitle = String(dbEx.name || '').replace(/\s*\([^)]*\)/g, '').trim() || dbEx.name;
                return `
                    <button type="button" class="edit-log-picker-item" onclick="selectEditLogSwapExercise(${exIdx}, decodeURIComponent('${encodeURIComponent(dbEx.id)}'))">
                        <span>${escapeHTML(cleanTitle)}</span>
                        <span style="font-size:10.5px; color:#64748B; font-weight:700;">${escapeHTML(dbEx.equipment || '')}</span>
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
                container.innerHTML = `<div style="padding:14px; text-align:center; background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:10px; font-size:12px; color:#475569;">Henüz hareket yok. Aşağıdan hareket ekleyin.</div>`;
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
                            <span style="font-size:11.5px; font-weight:900; color:#475569;">S${sIdx + 1}</span>
                            ${isCardio ? `<span style="font-size:11px; font-weight:800; color:#0369A1; text-align:center;">Kardiyo</span>` : `<input type="number" class="edit-log-num-input" step="any" min="0" max="1000" inputmode="decimal" aria-label="${escapeHTML(cleanName)} Set ${sIdx + 1} ${weightUnit}" placeholder="${weightUnit}" value="${st.weight}" oninput="onEditLogSetFieldInput(${exIdx}, ${sIdx}, 'weight', this.value)">`}
                            <span style="font-size:11.5px; font-weight:800; color:#64748B; text-align:center;">×</span>
                            <input type="number" class="edit-log-num-input" step="1" min="0" max="3600" inputmode="numeric" aria-label="${escapeHTML(cleanName)} Set ${sIdx + 1} ${metricUnit}" placeholder="${metricUnit}" value="${st.reps}" oninput="onEditLogSetFieldInput(${exIdx}, ${sIdx}, 'reps', this.value)">
                            <button type="button" class="edit-log-status-btn ${st.completed ? 'done' : 'skipped'}" onclick="toggleEditLogSetCompleted(${exIdx}, ${sIdx})">${st.completed ? '✓ Tamam' : 'Atlandı'}</button>
                            <button type="button" class="edit-log-del-set-btn" aria-label="Seti sil" onclick="removeEditLogSet(${exIdx}, ${sIdx})">✕</button>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="edit-log-ex-card">
                        <div class="edit-log-ex-head">
                            <div style="min-width:0; flex:1;">
                                <div class="edit-log-ex-title">${escapeHTML(cleanName + extraSuffix)}</div>
                                <div style="font-size:11px; font-weight:700; color:#475569;" id="editLogExCardVol_${exIdx}">${isCardio ? 'Kardiyo Süresi • Süre (dk)' : `${Math.round(exVol).toLocaleString('tr-TR')} kg • ${isBw ? 'Vücut Ağırlığı' : 'Kilo'} / ${isTime ? 'Süre (sn)' : 'Tekrar'}`}</div>
                            </div>
                            <div style="display:flex; gap:5px; flex-shrink:0;">
                                <button type="button" class="edit-log-mini-btn" onclick="toggleEditLogSwapPicker(${exIdx})">${isSwapOpen ? 'Kapat' : 'Değiştir'}</button>
                                <button type="button" class="edit-log-mini-btn danger" onclick="removeEditLogExercise(${exIdx})">Sil</button>
                            </div>
                        </div>
                        ${isSwapOpen ? `
                            <div style="margin-bottom:8px;">
                                <input type="text" class="form-input edit-log-input" placeholder="Yeni hareket ara..." value="${escapeHTML(editingWorkoutLogState.swapQuery || '')}" oninput="onEditLogSwapSearchInput(this.value)">
                                <div id="editLogSwapResults_${exIdx}" class="edit-log-picker-list"></div>
                            </div>
                        ` : ''}
                        <div>${setsHtml}</div>
                        <button type="button" class="edit-log-secondary-btn" style="margin-top:6px; padding:6px 8px; font-size:11.5px;" onclick="addEditLogSet(${exIdx})">+ Set Ekle</button>
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
                container.innerHTML = `<div style="font-size:11.5px; color:#64748B; padding:6px;">Sonuç bulunamadı</div>`;
                return;
            }
            container.innerHTML = matches.map(dbEx => {
                const cleanTitle = String(dbEx.name || '').replace(/\s*\([^)]*\)/g, '').trim() || dbEx.name;
                return `
                    <button type="button" class="edit-log-picker-item" onclick="appendExerciseToEditLog(decodeURIComponent('${encodeURIComponent(dbEx.id)}'))">
                        <span>${escapeHTML(cleanTitle)}</span>
                        <span style="font-size:10.5px; color:#64748B; font-weight:700;">${escapeHTML(dbEx.equipment || '')}</span>
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

        function filterHistoryByLocation(loc) {
            currentHistoryLocationFilter = loc;
            renderHistory();
        }

        function renderHistory() {
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

            if (document.getElementById('statTotalWorkouts')) document.getElementById('statTotalWorkouts').innerText = total;
            if (document.getElementById('statWeekWorkouts')) document.getElementById('statWeekWorkouts').innerText = `${thisWeek}/3`;
            if (document.getElementById('statStreak')) document.getElementById('statStreak').innerText = streak;

            if (allLogs.length === 0) {
                container.innerHTML = `
                    <div style="background:var(--bg-surface); padding:20px; text-align:center; border:1px dashed var(--border); border-radius:10px; color:var(--text-secondary); font-size:12px;">
                        Henüz kayıtlı antrenman seansınız yok. Bugün ilk antrenmanınızı yapıp kaydedin! 🚀
                    </div>
                `;
                return;
            }

            // Group by location for filtering & stats
            const locationCounts = { 'all': allLogs.length };
            allLogs.forEach(l => {
                const locKey = l.locationName || (l.locationType === 'ev' ? 'Ev' : 'Spor Salonu');
                locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
            });

            const distinctLocations = Object.keys(locationCounts).filter(k => k !== 'all');

            let filterBarHTML = '';
            if (distinctLocations.length > 0) {
                filterBarHTML = `
                    <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:12px;" class="hide-scrollbar">
                        <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:20px; white-space:nowrap; ${currentHistoryLocationFilter === 'all' ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="filterHistoryByLocation('all')">
                            Tüm Mekanlar (${locationCounts['all']})
                        </button>
                        ${distinctLocations.map(loc => {
                            const isEv = loc === 'Ev';
                            const isPark = loc === 'Açık Hava / Park';
                            const icon = isEv ? '🏠' : (isPark ? '🌲' : '🏋️');
                            const isActive = currentHistoryLocationFilter === loc;
                            return `
                                <button class="btn btn-outline" style="font-size:11px; padding:4px 10px; border-radius:20px; white-space:nowrap; ${isActive ? 'background:var(--gold); color:#000; font-weight:800;' : ''}" onclick="filterHistoryByLocation(decodeURIComponent('${encodeURIComponent(loc)}'))">
                                    ${icon} ${escapeHTML(loc)} (${locationCounts[loc]})
                                </button>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            const logs = currentHistoryLocationFilter === 'all'
                ? allLogs
                : allLogs.filter(l => (l.locationName || (l.locationType === 'ev' ? 'Ev' : 'Spor Salonu')) === currentHistoryLocationFilter);

            if (logs.length === 0) {
                container.innerHTML = filterBarHTML + `
                    <div style="background:var(--bg-surface); padding:16px; text-align:center; border:1px dashed var(--border); border-radius:10px; color:var(--text-secondary); font-size:12px;">
                        "${escapeHTML(currentHistoryLocationFilter)}" mekanında kayıtlı antrenman seansı bulunamadı.
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
                const totalVol = logVol > 0 ? `${Math.round(logVol).toLocaleString('tr-TR')} kg` : 'Belirtilmedi';
                const setsReps = l.totalSetsCompleted ? `${l.totalSetsCompleted} Set • ${l.totalRepsCompleted || 0} Tk` : '-';
                const durStr = l.durationFormatted || `${l.duration} Dk`;
                const rpeLabel = l.rpe ? (l.rpe.split(' ')[0] + ' ' + (l.rpe.split(' ')[1] || '')) : 'RPE 8';

                const locType = l.locationType || (l.locationName === 'Ev' ? 'ev' : 'salon');
                const locName = l.locationName || (locType === 'ev' ? 'Ev' : 'Spor Salonu');
                const isEv = locType === 'ev';
                const isPark = locType === 'acik_hava';
                const locIcon = isEv ? '🏠' : (isPark ? '🌲' : '🏋️');
                const locBadgeStyle = isEv
                    ? 'background:rgba(59, 130, 246, 0.15); border:1px solid rgba(59, 130, 246, 0.4); color:#1D4ED8;'
                    : (isPark
                        ? 'background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.4); color:#047857;'
                        : 'background:rgba(217, 119, 6, 0.15); border:1px solid rgba(217, 119, 6, 0.4); color:#92400E;');

                return `
                    <div class="log-history-card">
                        <div class="log-card-header">
                            <div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                                    <span class="log-date">📅 ${escapeHTML(l.dateFormatted || l.date)}</span>
                                    <span style="${locBadgeStyle} border-radius:4px; padding:2px 8px; font-size:11px; font-weight:700;">
                                        ${locIcon} ${escapeHTML(locName)}
                                    </span>
                                    ${l.healthSummary && l.healthSummary.heartrateAvg ? `
                                        <span style="background:#DCFCE7; border:1px solid #86EFAC; color:#15803D; border-radius:4px; padding:2px 8px; font-size:11px; font-weight:700;">
                                            ⌚ ❤️ Ort. ${Number(l.healthSummary.heartrateAvg)} / Zirve ${Number(l.healthSummary.heartrateMax || l.healthSummary.heartrateAvg)} bpm${l.healthSummary.calories ? ` • 🔥 ${Number(l.healthSummary.calories)} kcal` : ''}
                                        </span>
                                    ` : ''}
                                </div>
                                <h3 style="font-size:15px; font-weight:800; color:#0F172A; line-height:1.3;">${escapeHTML(l.program)}</h3>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="ex-badge badge-equip">${escapeHTML(rpeLabel)}</span>
                                <button type="button" class="btn-edit-log" onclick="editWorkoutLog(decodeURIComponent('${encodeURIComponent(l.id)}'))" title="Antrenmanı Düzenle">Düzenle</button>
                                <button type="button" class="btn-delete-log" onclick="deleteWorkoutLog(decodeURIComponent('${encodeURIComponent(l.id)}'))" title="Kaydı Sil">✕</button>
                            </div>
                        </div>

                        <!-- STATS ROW -->
                        <div class="log-stats-bar">
                            <div class="log-stat-item">
                                <span class="log-stat-label">Toplam Tonaj</span>
                                <span class="log-stat-val">🏋️ ${totalVol}</span>
                            </div>
                            <div class="log-stat-item">
                                <span class="log-stat-label">Set / Tekrar</span>
                                <span class="log-stat-val">🎯 ${setsReps}</span>
                            </div>
                            <div class="log-stat-item">
                                <span class="log-stat-label">Toplam Süre</span>
                                <span class="log-stat-val">⏱️ ${durStr}</span>
                            </div>
                        </div>

                        <!-- MUSCLES WORKED (Kısa Ana Kas Özeti) -->
                        ${l.muscleGroups && l.muscleGroups.length > 0 ? (() => {
                            const shortMuscles = [];
                            l.muscleGroups.forEach(rawM => {
                                const s = String(rawM || '').replace(/\s*\([^)]*\)/g, '').trim();
                                let tag = s;
                                if (/kanat|sırt|kürek|trapez/i.test(s)) tag = 'Sırt';
                                else if (/göğüs/i.test(s)) tag = 'Göğüs';
                                else if (/omuz/i.test(s)) tag = 'Omuz';
                                else if (/ön bacak|arka bacak|bacak|kalf|baldır/i.test(s)) tag = 'Bacak';
                                else if (/kalça/i.test(s)) tag = 'Kalça';
                                else if (/triceps|arka kol/i.test(s)) tag = 'Triceps';
                                else if (/biceps|ön kol|pazı/i.test(s)) tag = 'Biceps';
                                else if (/karın|core|korse/i.test(s)) tag = 'Karın';
                                if (tag && !shortMuscles.includes(tag)) shortMuscles.push(tag);
                            });
                            return shortMuscles.length > 0 ? `
                                <div style="margin: 6px 0 8px; display:flex; flex-wrap:wrap; gap:4px;">
                                    ${shortMuscles.slice(0, 7).map(m => `<span class="muscle-tag">${escapeHTML(m)}</span>`).join('')}
                                </div>
                            ` : '';
                        })() : ''}

                        <!-- DETAILED EXERCISES & SETS -->
                        ${l.exercises && l.exercises.length > 0 ? `
                            <div class="log-exercises-list">
                                ${l.exercises.map(ex => {
                                    const isBw = isExerciseBodyweight(ex);
                                    const isTime = isExerciseTimeBased(ex);
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
                                                exVol += calculateExerciseSetVolume(ex, st.weight, st.reps);
                                            }
                                        });
                                    }
                                    const volText = exVol > 0 ? `${Math.round(exVol).toLocaleString('tr-TR')} kg` : '';
                                    const cleanExTitle = String(ex.name || '').replace(/\s*\([^)]*\)/g, '').trim() || ex.name;
                                    return `
                                    <div class="log-exercise-item">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                            <strong class="log-ex-name" style="color:#0F172A; font-size:12.5px; font-weight:800;">${escapeHTML(cleanExTitle)}</strong>
                                            <span style="font-size:11px; color:#64748B; font-weight:600;">${volText}</span>
                                        </div>
                                        <div class="log-sets-summary">
                                            ${safeSetsArr.map(st => st.completed ? `
                                                <span class="log-set-pill completed">
                                                    ${isExerciseCardioMinutes(ex) ? `${formatSetMetricDisplay(ex, st.reps)} ✓` : `S${st.setNo}: <strong>${formatSetWeightDisplay(isBw, st.weight)}</strong> × ${formatSetMetricDisplay(ex, st.reps)} ✓`}
                                                </span>
                                            ` : `
                                                <span class="log-set-pill" style="opacity:0.6; border-style:dashed; text-decoration:line-through; font-weight:600;">
                                                    S${st.setNo}: Atlandı
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}

                        ${l.notes ? `<div class="log-notes-box">📝 ${escapeHTML(l.notes)}</div>` : ''}
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

