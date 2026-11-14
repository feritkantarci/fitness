// ==================== ODA 2: CANLI ANTRENMAN, STÜDYO & TAKVİM ŞEFİ (workout-guard) ====================
        // ==================== ACTIVE LIVE WORKOUT TRACKER ====================
        let noSleepVideoEl = null;
        let wakeLockKeepAliveTimer = null;
        let isHUDCollapsed = false;

        function initNoSleepVideoFallback() {
            if (noSleepVideoEl) return;
            try {
                // 1x1 sessiz video akışı (Canvas captureStream ile oluşturulur, iOS Safari & Android WebViews ekranı kapatmaz)
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, 1, 1);
                if (canvas.captureStream) {
                    const stream = canvas.captureStream(1);
                    noSleepVideoEl = document.createElement('video');
                    noSleepVideoEl.setAttribute('playsinline', '');
                    noSleepVideoEl.setAttribute('muted', '');
                    noSleepVideoEl.setAttribute('loop', '');
                    noSleepVideoEl.muted = true;
                    noSleepVideoEl.loop = true;
                    noSleepVideoEl.style.position = 'fixed';
                    noSleepVideoEl.style.top = '-9999px';
                    noSleepVideoEl.style.left = '-9999px';
                    noSleepVideoEl.style.width = '1px';
                    noSleepVideoEl.style.height = '1px';
                    noSleepVideoEl.style.opacity = '0.01';
                    noSleepVideoEl.style.pointerEvents = 'none';
                    noSleepVideoEl.srcObject = stream;
                    document.body.appendChild(noSleepVideoEl);
                }
            } catch(e) {
                console.warn("NoSleep fallback init:", e);
            }
        }

        async function requestWakeLock() {
            if (!isWakeLockEnabled) return;
            let ok = false;
            if ('wakeLock' in navigator) {
                try {
                    wakeLockSentinel = await navigator.wakeLock.request('screen');
                    ok = true;
                    wakeLockSentinel.addEventListener('release', () => {
                        if (activeWorkoutSession && isWakeLockEnabled) {
                            setTimeout(() => { if (activeWorkoutSession && isWakeLockEnabled) requestWakeLock(); }, 1500);
                        } else {
                            updateWakeLockUI(false);
                        }
                    });
                } catch (err) {
                    console.warn("WakeLock request:", err);
                }
            }

            // Fallback video player (iOS Safari'de ekran kararmasını kesin olarak durdurur)
            try {
                if (!noSleepVideoEl) initNoSleepVideoFallback();
                if (noSleepVideoEl) {
                    noSleepVideoEl.play().then(() => { ok = true; }).catch(() => {});
                }
            } catch(e) {}

            updateWakeLockUI(ok || ('wakeLock' in navigator));

            // Periyodik kontrol: Antrenman devam ettiği sürece ekran kilidinin canlı olduğundan emin ol
            if (!wakeLockKeepAliveTimer) {
                wakeLockKeepAliveTimer = setInterval(() => {
                    if (activeWorkoutSession && isWakeLockEnabled) {
                        if (!wakeLockSentinel && 'wakeLock' in navigator) {
                            requestWakeLock();
                        }
                    } else {
                        clearInterval(wakeLockKeepAliveTimer);
                        wakeLockKeepAliveTimer = null;
                    }
                }, 20000);
            }
        }

        function releaseWakeLock() {
            if (wakeLockSentinel) {
                try { wakeLockSentinel.release(); } catch(e) {}
                wakeLockSentinel = null;
            }
            if (noSleepVideoEl && !noSleepVideoEl.paused) {
                try { noSleepVideoEl.pause(); } catch(e) {}
            }
            if (wakeLockKeepAliveTimer) {
                clearInterval(wakeLockKeepAliveTimer);
                wakeLockKeepAliveTimer = null;
            }
            updateWakeLockUI(false);
        }

        function toggleWakeLockManual() {
            isWakeLockEnabled = !isWakeLockEnabled;
            if (isWakeLockEnabled) {
                requestWakeLock();
            } else {
                releaseWakeLock();
            }
        }

        function updateWakeLockUI(active) {
            const el = document.getElementById('wakeLockStatusBtn');
            if (!el) return;
            if (active) {
                el.className = "wake-lock-pill";
                el.innerHTML = "🟢 Ekran Açık";
                el.title = "Ekranın otomatik kararması engelleniyor (Dokunarak kapatabilirsiniz)";
            } else {
                el.className = "wake-lock-pill disabled";
                el.innerHTML = "⚪ Ekran Normal";
                el.title = "Ekran normal zaman aşımında kapanacaktır (Dokunarak açık tutabilirsiniz)";
            }
        }

        function toggleHUDCollapse() {
            isHUDCollapsed = !isHUDCollapsed;
            const hud = document.getElementById('activeWorkoutHUD');
            const icon = document.getElementById('hudCollapseIcon');
            if (hud) hud.classList.toggle('collapsed', isHUDCollapsed);
            if (icon) icon.innerText = isHUDCollapsed ? '▼' : '▲';
        }

        function adjustTimer(deltaSec) {
            timerRemaining = Math.max(0, timerRemaining + deltaSec);
            updateTimerDisplay();
            if (!isTimerRunning && timerRemaining > 0) {
                startTimer();
            }
        }



        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible' && activeWorkoutSession && isWakeLockEnabled) {
                await requestWakeLock();
            }
        });

        function setActiveWorkoutViewMode(mode) {
            activeWorkoutViewMode = mode;
            const btnFocus = document.getElementById('btnViewFocus');
            const btnList = document.getElementById('btnViewList');
            if (btnFocus && btnList) {
                btnFocus.classList.toggle('active', mode === 'focus');
                btnList.classList.toggle('active', mode === 'list');
            }
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        function goToPrevExercise() {
            if (!activeWorkoutSession || activeFocusExIndex <= 0) return;
            const exercises = activeWorkoutSession.exercises;
            const pair = getSupersetPairInfo(exercises, activeFocusExIndex);
            activeFocusExIndex = pair ? pair.firstIdx - 1 : activeFocusExIndex - 1;
            if (activeFocusExIndex < 0) activeFocusExIndex = 0;
            const previousPair = getSupersetPairInfo(exercises, activeFocusExIndex);
            if (previousPair) activeFocusExIndex = previousPair.firstIdx;
            activeFocusSetIndex = null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function goToNextExercise() {
            if (!activeWorkoutSession || activeFocusExIndex >= activeWorkoutSession.exercises.length - 1) return;
            const exercises = activeWorkoutSession.exercises;
            const pair = getSupersetPairInfo(exercises, activeFocusExIndex);
            activeFocusExIndex = pair ? pair.secondIdx + 1 : activeFocusExIndex + 1;
            if (activeFocusExIndex >= exercises.length) activeFocusExIndex = exercises.length - 1;
            const nextPair = getSupersetPairInfo(exercises, activeFocusExIndex);
            if (nextPair) activeFocusExIndex = nextPair.firstIdx;
            activeFocusSetIndex = null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function selectFocusSet(exId, setIdx) {
            activeFocusSetIndex = setIdx;
            renderActiveWorkout();
        }

        let focusDiagramCollapsed = {};
        function toggleFocusDiagram(exId) {
            focusDiagramCollapsed[exId] = !focusDiagramCollapsed[exId];
            renderActiveWorkout();
        }

        let extraToolsOpen = {};
        function toggleExtraTools(exId) {
            extraToolsOpen[exId] = !extraToolsOpen[exId];
            const body = document.getElementById('toolsBody_' + exId);
            const arrow = document.getElementById('toolsArrow_' + exId);
            if (body) {
                const isOpen = body.style.display !== 'none';
                body.style.display = isOpen ? 'none' : 'block';
                if (arrow) arrow.innerText = isOpen ? '▼ Aç' : '▲ Kapat';
            }
        }


        let workoutFormGuideOpenState = {};
        function toggleWorkoutFormGuide(exId) {
            const isOpen = !workoutFormGuideOpenState[exId];
            workoutFormGuideOpenState[exId] = isOpen;
            const body = document.getElementById(`formGuideBody_${exId}`);
            const arrow = document.getElementById(`formGuideArrow_${exId}`);
            if (body) {
                if (isOpen) {
                    if (!body.innerHTML.trim()) {
                        const exObj = (activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises) ? activeWorkoutSession.exercises.find(e => e.id === exId) : null)
                            || (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB) ? EXERCISES_DB.find(e => e.id === exId) : null);
                        if (exObj) {
                            body.innerHTML = renderExercisePositionsHtml(exObj, `focus_${exId}`, false);
                        }
                    }
                    body.style.display = 'block';
                    body.querySelectorAll('video').forEach(v => {
                        v.muted = true;
                        v.defaultMuted = true;
                        v.playsInline = true;
                        v.play().catch(() => {});
                    });
                } else {
                    body.querySelectorAll('video').forEach(v => {
                        try { v.pause(); v.removeAttribute('src'); v.load(); } catch(e) {}
                    });
                    body.innerHTML = '';
                    body.style.display = 'none';
                }
            }
            if (arrow) arrow.innerText = isOpen ? '▲ Gizle' : '▼ Göster';
        }

        function applyGhostToSet(exId, setIdx, weight, reps) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            sets[setIdx].weight = weight;
            sets[setIdx].reps = reps;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            if (typeof showToast === 'function') showToast(`⚡ Set ${setIdx + 1}'e ${weight}kg × ${reps}tk uygulandı!`);
        }

        function jumpToExercise(idx) {
            if (!activeWorkoutSession || idx < 0 || idx >= activeWorkoutSession.exercises.length) return;
            activeFocusExIndex = idx;
            activeFocusSetIndex = null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function handleSetCheckClick(exId, setIdx) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            if (sets[setIdx].completed) {
                toggleSetStatus(exId, setIdx);
            } else {
                completeSetAndStartRest(exId, setIdx);
            }
        }

        function copyLastPerformanceToCurrent(exId, weight, reps) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets) return;
            sets.forEach(st => {
                if (!st.completed) {
                    st.weight = weight;
                    st.reps = reps;
                }
            });
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            playAlertSound();
        }

        // LISTBOX PICKER STATE & HANDLERS (NO + -)
        let currentListboxPickerState = { exId: null, setIdx: null, type: 'weight' };

        const COMMON_WEIGHT_OPTIONS = [
            0, 2, 2.5, 4, 5, 6, 7, 7.5, 8, 9, 10, 
            12, 12.5, 14, 15, 16, 17.5, 18, 20, 22, 22.5, 24, 25, 26, 27.5, 28, 30, 
            32, 32.5, 34, 35, 36, 37.5, 38, 40, 42.5, 45, 47.5, 50, 
            52.5, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 150
        ];
        const COMMON_REPS_OPTIONS = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
            11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
            22, 25, 30, 35, 40, 50
        ];

        function openListboxPicker(exId, setIdx, type) {
            currentListboxPickerState = { exId, setIdx, type };
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            const st = sets[setIdx];
            const isWeight = (type === 'weight');

            let foundEx = null;
            let exName = 'Egzersiz';
            if (activeWorkoutSession && activeWorkoutSession.exercises) {
                foundEx = activeWorkoutSession.exercises.find(e => e.id === exId);
                if (foundEx) exName = foundEx.name;
            }
            if (!foundEx && typeof EXERCISES_DB !== 'undefined') {
                foundEx = EXERCISES_DB.find(e => e.id === exId);
            }
            const isBw = isExerciseBodyweight(foundEx);
            const isTime = isExerciseTimeBased(foundEx);

            const curVal = isWeight ? parseFloat(st.weight) : parseInt(st.reps, 10);

            const titleEl = document.getElementById('listboxTitle');
            const subEl = document.getElementById('listboxSub');
            const customInput = document.getElementById('listboxCustomInput');
            const modal = document.getElementById('quickListboxModal');
            const container = document.getElementById('listboxItemsContainer');

            if (isWeight) {
                if (isBw) {
                    if (titleEl) titleEl.innerText = '⚖️ Vücut Ağırlığı & Ek Yük (KG)';
                    if (subEl) subEl.innerText = `${exName} • Set ${st.setNo} (Calisthenics)`;
                    if (customInput) customInput.placeholder = 'Ek ağırlık gir (örn: 5, 10)';
                } else {
                    if (titleEl) titleEl.innerText = '⚖️ Ağırlık Seç (KG)';
                    if (subEl) subEl.innerText = `${exName} • Set ${st.setNo}`;
                    if (customInput) customInput.placeholder = 'Örn: 27.5';
                }
            } else {
                if (isTime) {
                    if (titleEl) titleEl.innerText = '⏱️ Süre / TUT Seç (Saniye)';
                    if (subEl) subEl.innerText = `${exName} • Set ${st.setNo} (İzometrik Tutuş)`;
                    if (customInput) customInput.placeholder = 'Örn: 45 (saniye)';
                } else {
                    if (titleEl) titleEl.innerText = '🔄 Tekrar Sayısı Seç';
                    if (subEl) subEl.innerText = `${exName} • Set ${st.setNo}`;
                    if (customInput) customInput.placeholder = 'Örn: 14';
                }
            }

            let list = [];
            if (isWeight) {
                if (isBw) {
                    list = [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 25, 30, 35, 40, 50];
                } else {
                    list = COMMON_WEIGHT_OPTIONS.slice();
                }
            } else {
                const isCardioPicker = isExerciseCardioMinutes(foundEx);
                if (isCardioPicker) {
                    if (titleEl) titleEl.innerText = '⏱️ Kardiyo Süresi Seç (Dakika)';
                    if (subEl) subEl.innerText = `${exName} • Set ${st.setNo} (Aerobik / Kondisyon)`;
                    if (customInput) customInput.placeholder = 'Örn: 20 (dakika)';
                    list = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 120];
                } else if (isTime) {
                    list = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 90, 105, 120, 150, 180];
                } else {
                    list = COMMON_REPS_OPTIONS.slice();
                }
            }

            if (!isNaN(curVal) && curVal !== null && curVal !== '' && !list.includes(curVal)) {
                list.push(curVal);
                list.sort((a, b) => a - b);
            }

            if (container) {
                const isCardioPicker = isExerciseCardioMinutes(foundEx);
                container.innerHTML = list.map(val => {
                    const isSelected = (val === curVal || (isWeight && isBw && (isNaN(curVal) || curVal === null || curVal === '') && val === 0));
                    let label = '';
                    if (isWeight) {
                        if (isBw) {
                            label = (val === 0) ? 'BW (Sadece Vücut Ağırlığın)' : `BW + ${val} kg (Ek Yük)`;
                        } else {
                            label = `${val} kg`;
                        }
                    } else {
                        if (isCardioPicker) {
                            label = `${val} dakika (${val} dk)`;
                        } else if (isTime) {
                            label = `${val} saniye (${val} sn)`;
                        } else {
                            label = `${val} tekrar`;
                        }
                    }
                    return `
                        <div class="listbox-option-item ${isSelected ? 'selected' : ''}" 
                             onclick="selectListboxValue(${val})">
                            <span>${label}</span>
                            ${isSelected ? '<span class="listbox-option-check">✓</span>' : ''}
                        </div>
                    `;
                }).join('');
            }

            if (modal) {
                modal.classList.add('active');
                setTimeout(() => {
                    const sel = container ? container.querySelector('.listbox-option-item.selected') : null;
                    if (sel) sel.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }, 50);
            }
        }

        function selectListboxValue(val) {
            const { exId, setIdx, type } = currentListboxPickerState;
            if (!exId || setIdx === null || !activeWorkoutSetsData[exId] || !activeWorkoutSetsData[exId][setIdx]) return;
            const st = activeWorkoutSetsData[exId][setIdx];

            let foundEx = null;
            if (activeWorkoutSession && activeWorkoutSession.exercises) {
                foundEx = activeWorkoutSession.exercises.find(e => e.id === exId);
            }
            if (!foundEx && typeof EXERCISES_DB !== 'undefined') {
                foundEx = EXERCISES_DB.find(e => e.id === exId);
            }
            const isBw = isExerciseBodyweight(foundEx);
            const isCardio = isExerciseCardioMinutes(foundEx);
            const isTime = isExerciseTimeBased(foundEx);

            if (type === 'weight') {
                st.weight = val;
                // 1. sette veya mevcut sette seçilen kiloyu henüz tamamlanmamış sonraki setlere otomatik aktar
                const sets = activeWorkoutSetsData[exId];
                for (let i = setIdx + 1; i < sets.length; i++) {
                    if (!sets[i].completed) {
                        sets[i].weight = val;
                    }
                }
                if (typeof showToast === 'function') {
                    const wStr = isBw ? (val === 0 ? 'BW (Vücut Ağırlığı)' : `BW +${val} kg`) : `${val} kg`;
                    if (setIdx === 0 && sets.length > 1) {
                        showToast(`⚖️ Set 1: ${wStr} seçildi (Sonraki setlere aktarıldı)`);
                    } else {
                        showToast(`⚖️ Set ${st.setNo}: ${wStr} seçildi`);
                    }
                }
            } else {
                st.reps = val;
                if (typeof showToast === 'function') {
                    showToast(isCardio ? `⏱️ Set ${st.setNo}: ${val} dakika seçildi` : (isTime ? `⏱️ Set ${st.setNo}: ${val} saniye tutuş seçildi` : `🔄 Set ${st.setNo}: ${val} tekrar seçildi`));
                }
            }

            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            closeListboxPicker();

            if (navigator.vibrate) navigator.vibrate(35);
            playAlertSound();
        }

        function applyCustomListboxValue() {
            const input = document.getElementById('listboxCustomInput');
            if (!input) return;
            const val = parseFloat(input.value);
            if (!isNaN(val) && val >= 0) {
                selectListboxValue(val);
            }
        }

        function closeListboxPicker(e) {
            if (e && e.target !== e.currentTarget) return;
            const modal = document.getElementById('quickListboxModal');
            if (modal) modal.classList.remove('active');
        }

        function stepSetWeight(exId, setIdx, delta) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            let cur = parseFloat(sets[setIdx].weight);
            if (isNaN(cur)) cur = 0;
            cur = Math.max(0, Math.round((cur + delta) * 10) / 10);
            sets[setIdx].weight = cur;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        function setQuickWeight(exId, setIdx, weightVal) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            sets[setIdx].weight = weightVal;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        function stepSetReps(exId, setIdx, delta) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            let cur = parseInt(sets[setIdx].reps);
            if (isNaN(cur)) cur = 10;
            cur = Math.max(1, cur + delta);
            sets[setIdx].reps = cur;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        function stepExerciseSets(exId, delta) {
            if (!activeWorkoutSetsData[exId]) {
                activeWorkoutSetsData[exId] = [];
            }
            const sets = activeWorkoutSetsData[exId];
            if (delta > 0) {
                for (let i = 0; i < delta; i++) {
                    const lastWeight = sets.length > 0 ? sets[sets.length - 1].weight : '';
                    const lastReps = sets.length > 0 ? sets[sets.length - 1].reps : 10;
                    sets.push({
                        setNo: sets.length + 1,
                        weight: lastWeight,
                        reps: lastReps,
                        completed: false,
                        completedAt: null
                    });
                }
                showToast(`➕ ${delta} set eklendi (Toplam: ${sets.length} Set)`);
            } else if (delta < 0) {
                const removeCount = Math.abs(delta);
                let removed = 0;
                for (let i = 0; i < removeCount; i++) {
                    if (sets.length > 1) {
                        sets.pop();
                        removed++;
                    }
                }
                if (removed > 0) {
                    showToast(`➖ ${removed} set çıkarıldı (Kalan: ${sets.length} Set)`);
                } else {
                    showToast(`⚠️ En az 1 set bulunmalıdır.`);
                }
            }
            if (activeFocusSetIndex !== null && activeFocusSetIndex >= sets.length) {
                activeFocusSetIndex = sets.length - 1;
            }
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        let activeWorkoutMoreDrawersState = {};
        function toggleExerciseMoreActions(exId) {
            activeWorkoutMoreDrawersState[exId] = !activeWorkoutMoreDrawersState[exId];
            const drawer = document.getElementById(`moreActionsDrawer_${exId}`);
            const btn = document.getElementById(`btnMoreActions_${exId}`);
            if (drawer) {
                const isOpen = activeWorkoutMoreDrawersState[exId];
                drawer.style.display = isOpen ? 'block' : 'none';
                if (btn) {
                    btn.classList.toggle('active', isOpen);
                    const icon = btn.querySelector('.more-toggle-icon');
                    if (icon) icon.innerText = isOpen ? '▲ Kapat' : '•••';
                }
            }
        }

        function deferExerciseToEnd(exId) {
            if (!activeWorkoutSession || !activeWorkoutSession.exercises) return;
            const idx = activeWorkoutSession.exercises.findIndex(e => e.id === exId);
            if (idx === -1 || activeWorkoutSession.exercises.length <= 1) return;
            if (idx === activeWorkoutSession.exercises.length - 1) {
                alert("Bu hareket zaten seansın en sonunda.");
                return;
            }
            const [deferredEx] = activeWorkoutSession.exercises.splice(idx, 1);
            activeWorkoutSession.exercises.push(deferredEx);
            activeWorkoutSession.exercises = assignAcademicBlockStructure(activeWorkoutSession.exercises, activeWorkoutSession.style || 'superset', activeWorkoutSession.scheme);
            if (activeFocusExIndex >= activeWorkoutSession.exercises.length) {
                activeFocusExIndex = activeWorkoutSession.exercises.length - 1;
            }
            activeFocusSetIndex = null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            playAlertSound();
        }

        function moveExerciseOrder(exId, direction) {
            if (!activeWorkoutSession || !activeWorkoutSession.exercises) return;
            const idx = activeWorkoutSession.exercises.findIndex(e => e.id === exId);
            if (idx === -1) return;
            const targetIdx = idx + direction;
            if (targetIdx < 0 || targetIdx >= activeWorkoutSession.exercises.length) return;

            const temp = activeWorkoutSession.exercises[idx];
            activeWorkoutSession.exercises[idx] = activeWorkoutSession.exercises[targetIdx];
            activeWorkoutSession.exercises[targetIdx] = temp;
            activeWorkoutSession.exercises = assignAcademicBlockStructure(activeWorkoutSession.exercises, activeWorkoutSession.style || 'superset', activeWorkoutSession.scheme);

            if (activeWorkoutViewMode === 'focus') {
                activeFocusExIndex = targetIdx;
            }
            activeFocusSetIndex = null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        function updateLiveProgressBar() {
            const fill = document.getElementById('liveProgressBarFill');
            const txt = document.getElementById('liveProgressText');
            const detail = document.getElementById('liveProgressDetail');
            if (!fill || !txt) return;

            if (!activeWorkoutSession || !activeWorkoutSetsData) {
                fill.style.width = '0%';
                txt.innerText = 'Set İlerlemesi: 0 / 0 (%0)';
                if (detail) detail.innerText = 'Hazır';
                return;
            }

            let total = 0;
            let completed = 0;
            activeWorkoutSession.exercises.forEach(ex => {
                const sets = activeWorkoutSetsData[ex.id] || [];
                total += sets.length;
                completed += sets.filter(s => s.completed).length;
            });
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            fill.style.width = `${percent}%`;
            txt.innerText = `Set İlerlemesi: ${completed} / ${total} Set (%${percent})`;
            if (detail) {
                if (percent === 100) detail.innerText = '🎉 Tamamlandı!';
                else if (activeWorkoutViewMode === 'focus') {
                    detail.innerText = `Egzersiz ${activeFocusExIndex + 1}/${activeWorkoutSession.exercises.length}`;
                } else {
                    detail.innerText = `%${percent} Bitti`;
                }
            }
        }

        function confirmOverwriteActiveWorkoutIfNeeded(newTitle = 'Yeni Seans') {
            if (!activeWorkoutSession || !Array.isArray(activeWorkoutSession.exercises) || activeWorkoutSession.exercises.length === 0) {
                return true;
            }
            const currentTitle = activeWorkoutSession.title || 'Mevcut Seans';
            if (currentTitle === newTitle) return true;
            const ok = confirm(`⚠️ Şu anda devam eden "${currentTitle}" seansınız açık.\n\nOnu kapatıp "${newTitle}" seansını başlatmak istiyor musunuz?\n(Mevcut seansı kaydetmek için İptal'e basıp önce seansı bitirebilirsiniz.)`);
            if (!ok) {
                switchTab('activeWorkoutTab');
                return false;
            }
            return true;
        }

        function startActiveWorkoutFromGenerated() {
            if (!currentGeneratedWorkout) {
                console.warn("startActiveWorkoutFromGenerated: currentGeneratedWorkout boş.");
                return;
            }
            if (!confirmOverwriteActiveWorkoutIfNeeded(currentGeneratedWorkout.title || 'Fitness Seansı')) {
                return;
            }
            activeWorkoutSession = JSON.parse(JSON.stringify(currentGeneratedWorkout));
            activeWorkoutStartTime = Date.now();
            activeWorkoutIsPaused = false;
            activeWorkoutPausedAt = null;
            activeWorkoutTotalPausedMs = 0;
            activeWorkoutSetsData = {};
            activeWorkoutViewMode = 'focus';
            activeFocusExIndex = 0;
            activeFocusSetIndex = null;

            const user = getActiveUser();
            const userWeights = user ? (user.weights || {}) : {};

            if (!activeWorkoutSession.scheme) {
                activeWorkoutSession.scheme = { sets: 3, reps: '8-12', rest: 45 };
            }

            if (!Array.isArray(activeWorkoutSession.exercises) || activeWorkoutSession.exercises.length === 0) {
                alert("Bu antrenmanda egzersiz bulunamadı.");
                return;
            }

            // Normalise string ID exercises to full exercise objects if needed
            activeWorkoutSession.exercises = activeWorkoutSession.exercises.filter(Boolean).map(ex => {
                if (typeof ex === 'string') {
                    const dbEx = EXERCISES_DB.find(e => e.id === ex);
                    return dbEx || { id: ex, name: ex, equipment: 'bodyweight' };
                }
                return ex;
            });

            activeWorkoutSession.exercises.forEach(ex => {
                if (!ex || !ex.id) return;
                const isTime = isExerciseTimeBased(ex);
                const isBw = isExerciseBodyweight(ex);
                const isCardio = isExerciseCardioMinutes(ex);
                const numSets = isCardio ? 1 : ((ex.targetSets || (activeWorkoutSession.scheme && activeWorkoutSession.scheme.sets)) || 3);
                const repsSpec = ex.targetReps || (activeWorkoutSession.scheme && activeWorkoutSession.scheme.reps);
                const defaultReps = resolveDefaultExerciseSetTarget(ex, repsSpec);
                const rememberedW = isCardio ? '' : getExerciseRememberedWeight(ex);
                const defaultWeight = rememberedW !== '' ? rememberedW : (isBw && !isCardio ? 0 : '');

                activeWorkoutSetsData[ex.id] = [];
                for (let s = 1; s <= numSets; s++) {
                    activeWorkoutSetsData[ex.id].push({
                        setNo: s,
                        weight: defaultWeight,
                        reps: defaultReps,
                        completed: false,
                        completedAt: null
                    });
                }
            });

            saveActiveWorkoutStateToStorage();
            startWorkoutTimer();
            renderActiveWorkout();
            switchTab('activeWorkoutTab');
            resetTimer((activeWorkoutSession.scheme && activeWorkoutSession.scheme.rest) || 45);
            playAlertSound();
            requestWakeLock();
        }

        function loadCelikAkisiWorkout(autoStart = true) {
            const flowWorkout = {
                id: 'celik_akisi_20dk',
                title: '⚔️ 20 Dk Çelik Akışı (Dambıl Kompleksi)',
                split: 'full_body',
                splitName: 'Çelik Akışı (Flow Complex)',
                style: 'complex',
                goal: 'endurance',
                duration: 20,
                scheme: { sets: 4, reps: '6-8', rest: 90 },
                warmups: [
                    { name: "World's Greatest Stretch", dur: "60 sn", cue: "Kalça ve göğüs kafesi mobilitesi." },
                    { name: "Dambıl Halo Isınması", dur: "60 sn", cue: "Hafif dambılla omuz kapsülünü aç." }
                ],
                exercises: [
                    { id: 'db_swing_to_goblet_squat', name: 'Dambıl Swing to Goblet Squat (Hinge-Squat Akışı)', equipment: 'dumbbell', targetSets: 4, targetReps: '6 - 8', cue: 'Kalça itişiyle yükselen dambılı göğüste dikey yakalayıp derin çömelmeye bağlanın.', customRest: 0, blockType: 'complex', blockLabel: 'İstasyon 1', blockHeader: '⚔️ ÇELİK AKIŞI • KESİNTİSİZ KOMPLEKS (4 Tur • Tur Sonu 90 sn Dinlenme)' },
                    { id: 'db_clean_squat_press', name: 'Dambıl Clean to Front Squat to Push Press', equipment: 'dumbbell', targetSets: 4, targetReps: '6', cue: 'Hang clean ile omuzlara al, derin ön squat yap ve baş üstüne kilitle.', customRest: 0, blockType: 'complex', blockLabel: 'İstasyon 2' },
                    { id: 'db_seesaw_lunge', name: 'Dambıl Seesaw Lunge (Dinamik İleri-Geri Lunge)', equipment: 'dumbbell', targetSets: 4, targetReps: '6', cue: 'Öne lunge çöküşünden dönerken ayağı yere basmadan duraksız geriye lunge yapın.', customRest: 0, blockType: 'complex', blockLabel: 'İstasyon 3' },
                    { id: 'db_rdl_to_high_pull', name: 'Dambıl RDL to High Pull (Arka Zincir & Üst Çekiş)', equipment: 'dumbbell', targetSets: 4, targetReps: '6 - 8', cue: 'RDL ile gerilen hamstringleri patlatırken dambılları göğse çekip dirsekleri yükseltin.', customRest: 0, blockType: 'complex', blockLabel: 'İstasyon 4' },
                    { id: 'db_pullover_to_halo', name: 'Dambıl Pullover to Halo (Torasik & Omuz Akışı)', equipment: 'dumbbell', targetSets: 4, targetReps: '6', cue: 'Pullover esnemesinden doğrulurken baş çevresinde akıcı 360° halo çizin.', customRest: 90, blockType: 'complex', blockLabel: 'İstasyon 5' }
                ],
                finisher: { name: "Nefes Toparlanması", desc: "Burundan derin nefes, nabzı düşür." },
                createdAt: Date.now()
            };
            currentGeneratedWorkout = flowWorkout;
            window.currentGeneratedWorkout = currentGeneratedWorkout;
            try {
                if (typeof persistLastGeneratedWorkout === 'function') {
                    persistLastGeneratedWorkout(currentGeneratedWorkout);
                } else {
                    localStorage.setItem('celik_kodu_last_generated_workout', JSON.stringify(currentGeneratedWorkout));
                }
            } catch (e) {}
            if (autoStart) {
                startActiveWorkoutFromGenerated();
                switchTab('activeWorkoutTab');
                if (typeof showToast === 'function') showToast("⚡ 20 Dk Çelik Akışı (Dambıl Kompleksi) Başlatıldı!");
            } else {
                window.expandedGeneratedExIndex = null;
                renderGeneratedWorkout();
                const hintEl = document.getElementById('aiQuickPreviewHint');
                if (hintEl) {
                    hintEl.textContent = '✅ 20 Dk Çelik Akışı hazırlandı • İnceleyip başlatabilir veya takvime ekleyebilirsiniz';
                    hintEl.style.color = '#15803D';
                }
                const outEl = document.getElementById('generatedWorkoutOutput');
                if (outEl) {
                    outEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                if (typeof showToast === 'function') showToast("⚡ 20 Dk Çelik Akışı oluşturuldu!");
            }
        }
        window.loadCelikAkisiWorkout = loadCelikAkisiWorkout;

        function getWorkoutElapsedSeconds() {
            if (!activeWorkoutStartTime) return 0;
            if (activeWorkoutIsPaused && activeWorkoutPausedAt) {
                return Math.max(0, Math.floor((activeWorkoutPausedAt - activeWorkoutStartTime - activeWorkoutTotalPausedMs) / 1000));
            }
            return Math.max(0, Math.floor((Date.now() - activeWorkoutStartTime - activeWorkoutTotalPausedMs) / 1000));
        }

        function formatSecondsToHMS(totalSecs) {
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor((totalSecs % 3600) / 60);
            const secs = totalSecs % 60;
            if (hrs > 0) {
                return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function updateWorkoutTimerDisplay() {
            const el = document.getElementById('workoutTotalTimerDisplay');
            if (!el) return;
            const secs = getWorkoutElapsedSeconds();
            el.innerText = formatSecondsToHMS(secs);
        }

        function startWorkoutTimer() {
            clearInterval(workoutTimerInterval);
            updateWorkoutTimerDisplay();
            workoutTimerInterval = setInterval(() => {
                if (!activeWorkoutIsPaused && activeWorkoutSession) {
                    updateWorkoutTimerDisplay();
                }
            }, 1000);
        }

        function toggleWorkoutPause() {
            if (!activeWorkoutSession) return;
            const btn = document.getElementById('btnToggleWorkoutPause');
            if (!activeWorkoutIsPaused) {
                activeWorkoutIsPaused = true;
                activeWorkoutPausedAt = Date.now();
                if (btn) btn.innerText = "▶️ Devam Et";
            } else {
                activeWorkoutIsPaused = false;
                if (activeWorkoutPausedAt) {
                    activeWorkoutTotalPausedMs += (Date.now() - activeWorkoutPausedAt);
                    activeWorkoutPausedAt = null;
                }
                if (btn) btn.innerText = "⏸️ Duraklat";
            }
            saveActiveWorkoutStateToStorage();
            updateWorkoutTimerDisplay();
        }

        function saveActiveWorkoutStateToStorage() {
            const uid = getActiveUserId();
            if (!activeWorkoutSession) {
                localStorage.removeItem(`celik_kodu_active_state_${uid}`);
                return;
            }
            const cleanSession = (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.sanitizeActiveSession === 'function')
                ? window.CelikBridgeCustoms.sanitizeActiveSession(activeWorkoutSession)
                : activeWorkoutSession;
            if (!cleanSession) return;
            const state = {
                session: cleanSession,
                startTime: activeWorkoutStartTime,
                isPaused: activeWorkoutIsPaused,
                pausedAt: activeWorkoutPausedAt,
                totalPausedMs: activeWorkoutTotalPausedMs,
                setsData: activeWorkoutSetsData,
                viewMode: activeWorkoutViewMode,
                focusIndex: activeFocusExIndex
            };
            try {
                localStorage.setItem(`celik_kodu_active_state_${uid}`, JSON.stringify(state));
                if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(uid);
            } catch(e) {}
        }

        function restoreActiveWorkoutStateFromStorage() {
            const uid = getActiveUserId();
            try {
                const raw = localStorage.getItem(`celik_kodu_active_state_${uid}`);
                if (!raw) return false;
                const state = JSON.parse(raw);
                if (state && state.session && state.startTime) {
                    activeWorkoutSession = state.session;
                    activeWorkoutStartTime = state.startTime;
                    activeWorkoutIsPaused = !!state.isPaused;
                    activeWorkoutPausedAt = state.pausedAt || null;
                    activeWorkoutTotalPausedMs = state.totalPausedMs || 0;
                    activeWorkoutSetsData = state.setsData || {};
                    if (state.viewMode) activeWorkoutViewMode = state.viewMode;
                    if (typeof state.focusIndex === 'number') activeFocusExIndex = state.focusIndex;

                    renderActiveWorkout();
                    startWorkoutTimer();
                    const btn = document.getElementById('btnToggleWorkoutPause');
                    if (btn) btn.innerText = activeWorkoutIsPaused ? "▶️ Devam Et" : "⏸️ Duraklat";
                    requestWakeLock();
                    return true;
                }
            } catch(e) {}
            return false;
        }

        function toggleStudioAccordion(forceOpen) {
            const body = document.getElementById('studioAccordionBody');
            const arrow = document.getElementById('studioAccordionArrow');
            if (!body) return;
            const isCurrentlyOpen = body.style.display !== 'none';
            const shouldOpen = (forceOpen !== undefined) ? forceOpen : !isCurrentlyOpen;
            body.style.display = shouldOpen ? 'block' : 'none';
            if (arrow) arrow.innerText = shouldOpen ? '▲ Kapat' : '▼ Aç';
            if (shouldOpen) {
                initStudioTab();
            }
        }

        function openStudioAccordion() {
            toggleStudioAccordion(true);
            const sec = document.getElementById('studioSectionInWorkout');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        }

        function openManualBuilderInWorkout() {
            switchTab('activeWorkoutTab');
            toggleStudioAccordion(true);
            setTimeout(() => {
                const sec = document.getElementById('studioSectionInWorkout');
                if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        }

        function renderActiveWorkout() {
            const container = document.getElementById('activeWorkoutContainer');
            const liveTrackerBar = document.querySelector('.live-tracker-bar');
            const hud = document.getElementById('activeWorkoutHUD');
            const dock = document.getElementById('workoutFloatingDock');
            const studioSec = document.getElementById('studioSectionInWorkout');
            const calSec = document.getElementById('embeddedCalendarSection');

            if (!activeWorkoutSession || !container) {
                if (liveTrackerBar) liveTrackerBar.style.display = 'none';
                if (hud) hud.style.display = 'none';
                if (dock) dock.style.display = 'none';
                if (studioSec) {
                    studioSec.style.display = 'block';
                    if (typeof renderCustomRoutineEquipmentSummary === 'function') {
                        renderCustomRoutineEquipmentSummary();
                    }
                }
                if (calSec) calSec.style.display = 'block';
                if (container) {
                    try {
                        const user = getActiveUser();
                        const uid = (user && user.id) ? user.id : getActiveUserId();

                        const todayDate = new Date();
                        const todayIdx = todayDate.getDay();
                        const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
                        const isNextWeek = activePlannerWeek === 'next';
                        const schedule = isNextWeek ? getNextWeeklySchedule(uid) : getWeeklySchedule(uid);
                        const todayPlan = (!isNextWeek && typeof getPlanForDate === 'function')
                            ? getPlanForDate(todayDate)
                            : (schedule[todayIdx] || { id: 'rest', rest: true, title: 'Dinlenme & Aktif Toparlanma' });

                        let aiProgData = null;
                        try {
                            const rawAi = localStorage.getItem(`celik_kodu_ai_program_${uid}`);
                            if (rawAi) aiProgData = JSON.parse(rawAi);
                        } catch(e) {}
                        const hasIncomingAi = !!(aiProgData && aiProgData.active);

                        let heroBannerHtml = '';
                        if (isNextWeek) {
                            const isExpandedNext = !!localStorage.getItem(`celik_kodu_next_week_expanded_${uid}`);
                            heroBannerHtml = `
                                <div class="collapsible-panel ${isExpandedNext ? 'open' : ''}" id="nextWeekHeroPanel_${uid}">
                                    <div class="collapsible-panel-header" onclick="toggleNextWeekHeroPanel('${uid}')">
                                        <div class="collapsible-panel-title">
                                            <span class="icon">🚀</span>
                                            <span class="text">Gelecek Hafta Antrenman Planı (Önizleme)</span>
                                        </div>
                                        <div class="collapsible-panel-meta">
                                            <span class="collapsible-panel-badge">${hasIncomingAi ? 'FitLAB Reçetesi' : 'Plan Hazır'}</span>
                                            <span class="collapsible-panel-arrow">▼</span>
                                        </div>
                                    </div>
                                    <div class="collapsible-panel-body">
                                        <h3 style="font-size:13.5px; font-weight:800; color:#0F172A; margin:0 0 6px 0;">Gelecek Haftaya Özel Hipertrofi Bloğu</h3>
                                        <p style="font-size:12px; color:#475569; line-height:1.5; margin:0 0 12px 0;">Masaüstü istasyonundan gelen bilimsel reçete gün gün takviminize işlendi. Salona girmeden önce günlerin içeriğini inceleyebilir veya tek dokunuşla bu planı aktif haftanız olarak başlatabilirsiniz.</p>
                                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                            <button class="btn btn-gold" style="padding:9px 16px; font-size:12px; font-weight:900; flex:1;" onclick="promoteNextWeekToCurrent('${uid}')">
                                                ⚡ BU PROGRAMI AKTİF HAFTAM YAP
                                            </button>
                                            <button class="btn btn-outline" style="padding:9px 14px; font-size:12px; font-weight:700; border-color:#CBD5E1; color:#475569;" onclick="switchPlannerWeek('current')">
                                                ⬅️ Bu Haftaya Dön
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }

                        const lastMoveSummaryBannerHtml = (typeof buildGlobalScheduleMoveSummaryBannerHtml === 'function')
                            ? buildGlobalScheduleMoveSummaryBannerHtml()
                            : '';

                        container.innerHTML = `
                            <div style="padding:2px 4px 0;">
                                <!-- FİTLAB MASAÜSTÜ YENİ PROGRAM BİLDİRİMİ -->
                                ${getFitLabIncomingProgramHtml(uid)}

                                <!-- AKADEMİK KOÇ İSTASYONU DİREKTİFİ -->
                                ${getCoachStationDirectiveHtml(uid)}

                                <!-- GELECEK HAFTA ÖNİZLEME PANELİ (VARSA) -->
                                ${heroBannerHtml}

                                <!-- GÜN TAŞIMA & AI ARDIŞIK GÜN REVİZYON ÖZETİ -->
                                ${lastMoveSummaryBannerHtml}
                            </div>
                        `;
                    } catch(renderErr) {
                        console.error("renderActiveWorkout hatası:", renderErr);
                    }
                }
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                updateLiveProgressBar();
                return;
            }

            if (liveTrackerBar) liveTrackerBar.style.display = 'block';
            if (hud) hud.style.display = 'block';
            if (studioSec) studioSec.style.display = 'none';
            if (calSec) calSec.style.display = 'none';

            const s = activeWorkoutSession;
            const user = getActiveUser();
            const weights = user ? (user.weights || {}) : {};

            if (!s.scheme) {
                s.scheme = { sets: 3, reps: '8-12', rest: 45 };
            }

            if (!Array.isArray(s.exercises) || s.exercises.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
                        <p style="font-size:16px; font-weight:700; color:#0F172A;">Bu antrenmanda egzersiz bulunamadı.</p>
                        <button class="btn btn-gold" onclick="cancelActiveWorkout()" style="margin-top:12px;">Antrenmanı İptal Et</button>
                    </div>
                `;
                return;
            }

            s.exercises = s.exercises.filter(Boolean).map(ex => {
                if (typeof ex === 'string') {
                    const dbEx = EXERCISES_DB.find(e => e.id === ex);
                    return dbEx || { id: ex, name: ex, equipment: 'bodyweight' };
                }
                return ex;
            });

            const hasUnupgradedSuperset = s.exercises.some(ex => ex.blockType === 'superset' && ex.supersetRole === undefined);
            if (s.exercises.length > 0 && (!s.exercises[0].blockLabel || hasUnupgradedSuperset) && typeof assignAcademicBlockStructure === 'function') {
                s.exercises = assignAcademicBlockStructure(s.exercises, s.style || 'superset', s.scheme);
            }

            // Ensure setsData exists for each exercise
            s.exercises.forEach(ex => {
                if (!ex || !ex.id) return;
                if (!activeWorkoutSetsData[ex.id]) {
                    const isTime = isExerciseTimeBased(ex);
                    const isBw = isExerciseBodyweight(ex);
                    const isCardio = isExerciseCardioMinutes(ex);
                    const numSets = isCardio ? 1 : ((ex.targetSets || (s.scheme && s.scheme.sets)) || 3);
                    const repsSpec = ex.targetReps || (s.scheme && s.scheme.reps);
                    const defaultReps = resolveDefaultExerciseSetTarget(ex, repsSpec);
                    const rememberedW = isCardio ? '' : getExerciseRememberedWeight(ex);
                    const defaultWeight = rememberedW !== '' ? rememberedW : (isBw && !isCardio ? 0 : '');
                    activeWorkoutSetsData[ex.id] = [];
                    for (let st = 1; st <= numSets; st++) {
                        activeWorkoutSetsData[ex.id].push({
                            setNo: st,
                            weight: defaultWeight,
                            reps: defaultReps,
                            completed: false,
                            completedAt: null
                        });
                    }
                }
            });

            // Update top view toggle buttons
            const btnFocus = document.getElementById('btnViewFocus');
            const btnList = document.getElementById('btnViewList');
            if (btnFocus && btnList) {
                btnFocus.classList.toggle('active', activeWorkoutViewMode === 'focus');
                btnList.classList.toggle('active', activeWorkoutViewMode === 'list');
            }

            // Update sticky progress bar
            updateLiveProgressBar();

            const equipLabels = {
                dumbbell: 'Dambıl',
                kettlebell: 'Kettlebell',
                barbell: 'Barbell',
                machine: 'Makine/Kablo',
                bodyweight: 'Vücut Ağırlığı'
            };

            // Clamp activeFocusExIndex
            if (activeFocusExIndex < 0) activeFocusExIndex = 0;
            if (activeFocusExIndex >= s.exercises.length) activeFocusExIndex = s.exercises.length - 1;

            // ==================== MODE 1: CANLI ODAK MODU (STITCH ODAK BÜYÜK SET KARTI) ====================
            const renderFocusSingleCardHtml = (cardEx, cardIdx, isPairCard = false, isPairTarget = false, pairObj = null) => {
                const isBw = isExerciseBodyweight(cardEx);
                const isTime = isExerciseTimeBased(cardEx);
                const sets = activeWorkoutSetsData[cardEx.id] || [];
                const firstIncompleteIdx = sets.findIndex(st => !st.completed);
                const isAllSetsDone = sets.length > 0 && sets.every(st => st.completed);
                const lastPerf = getLastExercisePerformance(cardEx.id) || getLastExercisePerformance(cardEx.name);
                const isFormOpen = !!workoutFormGuideOpenState[cardEx.id];
                const stepWeightDelta = 2.5;
                const stepRepsDelta = isTime ? 5 : 1;

                return `
                    <div class="hevy-exercise-card stitch-focus-ex-card ${isPairTarget ? 'is-pair-target' : ''}" data-exercise-id="${cardEx.id}">
                        <div class="stitch-focus-head">
                            <div class="stitch-focus-head-left">
                                ${(typeof OPENGYM_GLOBAL_CATALOG !== 'undefined' && OPENGYM_GLOBAL_CATALOG[cardEx.id]) ? `
                                    <div class="stitch-focus-thumb" onclick="toggleWorkoutFormGuide('${cardEx.id}')" title="Form rehberini aç/kapat">
                                        <img src="${OPENGYM_GLOBAL_CATALOG[cardEx.id].still}" width="40" height="40" loading="lazy" decoding="async" alt="${escapeHTML(cardEx.name)}" style="width:100%; height:100%; object-fit:cover;">
                                    </div>
                                ` : ''}
                                <div class="stitch-focus-title-col">
                                    <div class="stitch-focus-kicker">AKTİF HAREKET (${cardIdx + 1} / ${s.exercises.length})</div>
                                    <h2 class="stitch-focus-title">${escapeHTML(cardEx.name)}</h2>
                                </div>
                            </div>
                            <div class="stitch-focus-head-actions">
                                <button type="button" class="wk-ex-i-btn" onclick="openExerciseQuickInfoModal('${escapeHTML(String(cardEx.id || ''))}')" title="Hareket Bilgisi">i</button>
                                <button type="button" class="stitch-form-icon-btn ${isFormOpen ? 'active' : ''}" onclick="toggleWorkoutFormGuide('${cardEx.id}')" title="Form Rehberi">📖</button>
                            </div>
                        </div>

                        <div id="formGuideBody_${cardEx.id}" class="hevy-form-guide-body stitch-flush-form-drawer" style="display:${isFormOpen ? 'block' : 'none'};">
                            ${isFormOpen ? renderExercisePositionsHtml(cardEx, `focus_${cardEx.id}`, false) : ''}
                        </div>

                        <div class="stitch-sets-stack">
                            ${sets.map((st, sIdx) => {
                                const isDone = st.completed;
                                const isTarget = !isDone && sIdx === firstIncompleteIdx && (!isPairCard || isPairTarget);
                                const prevText = lastPerf ? formatPerformancePill(cardEx, lastPerf.weight, lastPerf.reps) : '';
                                const wDisp = formatSetWeightDisplay(isBw, st.weight);
                                const rDisp = formatSetMetricDisplay(cardEx, st.reps);

                                if (isDone) {
                                    return `
                                        <div class="stitch-set-done-row" id="setRow_${cardEx.id}_${sIdx}">
                                            <div class="stitch-set-done-left" onclick="openListboxPicker('${cardEx.id}', ${sIdx}, 'weight')">
                                                <span class="stitch-set-num-pill done">${st.setNo}</span>
                                                <span class="stitch-set-done-text">${wDisp} × ${rDisp}</span>
                                            </div>
                                            <button type="button" class="stitch-check-done-btn" onclick="handleSetCheckClick('${cardEx.id}', ${sIdx})" title="Geri Al">✓</button>
                                        </div>
                                        ${renderInterSetSlotHtml(cardEx.id, st, sIdx, sets.length)}
                                    `;
                                }

                                if (isTarget) {
                                    return `
                                        <div class="stitch-active-set-box" id="setRow_${cardEx.id}_${sIdx}">
                                            <div class="stitch-active-set-top">
                                                <span class="stitch-active-set-badge">ŞU ANKİ SET • ${st.setNo}. SET</span>
                                                ${lastPerf ? `
                                                    <button type="button" class="stitch-ghost-pill-btn" onclick="applyGhostToSet('${cardEx.id}', ${sIdx}, ${lastPerf.weight}, ${lastPerf.reps})">
                                                        Önceki: ${prevText}
                                                    </button>
                                                ` : ''}
                                            </div>
                                            <div class="stitch-stepper-grid">
                                                <div class="stitch-stepper-box">
                                                    <div class="stitch-stepper-lbl">${isBw ? 'EK YÜK (KG)' : 'AĞIRLIK (KG)'}</div>
                                                    <div class="stitch-stepper-controls">
                                                        <button type="button" class="stitch-step-btn" onclick="stepActiveSetValue('${cardEx.id}', ${sIdx}, 'weight', -${stepWeightDelta})">−</button>
                                                        <button type="button" class="stitch-step-val-btn" onclick="openListboxPicker('${cardEx.id}', ${sIdx}, 'weight')">${wDisp}</button>
                                                        <button type="button" class="stitch-step-btn" onclick="stepActiveSetValue('${cardEx.id}', ${sIdx}, 'weight', ${stepWeightDelta})">+</button>
                                                    </div>
                                                </div>
                                                <div class="stitch-stepper-box">
                                                    <div class="stitch-stepper-lbl">${isTime ? 'SÜRE (SN)' : 'TEKRAR'}</div>
                                                    <div class="stitch-stepper-controls">
                                                        <button type="button" class="stitch-step-btn" onclick="stepActiveSetValue('${cardEx.id}', ${sIdx}, 'reps', -${stepRepsDelta})">−</button>
                                                        <button type="button" class="stitch-step-val-btn" onclick="openListboxPicker('${cardEx.id}', ${sIdx}, 'reps')">${rDisp}</button>
                                                        <button type="button" class="stitch-step-btn" onclick="stepActiveSetValue('${cardEx.id}', ${sIdx}, 'reps', ${stepRepsDelta})">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button type="button" class="stitch-complete-set-cta" onclick="handleSetCheckClick('${cardEx.id}', ${sIdx})">
                                                ✓ ${st.setNo}. Seti Tamamla
                                            </button>
                                        </div>
                                        ${renderInterSetSlotHtml(cardEx.id, st, sIdx, sets.length)}
                                    `;
                                }

                                return `
                                    <div class="stitch-set-upcoming-row" id="setRow_${cardEx.id}_${sIdx}">
                                        <div class="stitch-set-done-left" onclick="openListboxPicker('${cardEx.id}', ${sIdx}, 'weight')">
                                            <span class="stitch-set-num-pill">${st.setNo}</span>
                                            <span class="stitch-set-upcoming-text">Hedef: ${wDisp} × ${rDisp}</span>
                                        </div>
                                        <button type="button" class="stitch-check-upcoming-btn" onclick="handleSetCheckClick('${cardEx.id}', ${sIdx})" title="Seti Tamamla">○</button>
                                    </div>
                                    ${renderInterSetSlotHtml(cardEx.id, st, sIdx, sets.length)}
                                `;
                            }).join('')}

                            <div class="stitch-set-footer-actions">
                                <button type="button" class="stitch-set-mini-btn" onclick="addSetToExercise('${cardEx.id}')">+ Set Ekle</button>
                                ${sets.length > 1 ? `
                                    <button type="button" class="stitch-set-mini-btn danger" onclick="removeSetFromExercise('${cardEx.id}')">− Set Sil</button>
                                ` : ''}
                            </div>
                        </div>

                        ${(!isPairCard && isAllSetsDone) ? `
                            <div class="hevy-exercise-done-banner">
                                <div class="hevy-done-title">🎉 ${escapeHTML(cardEx.name)} Bitti!</div>
                                <div class="hevy-done-sub">Tüm ${sets.length} set başarıyla tamamlandı.</div>
                                ${cardIdx < s.exercises.length - 1 ? `
                                    <button type="button" class="btn-hevy-next-cta" onclick="goToNextExercise()">
                                        Sıradaki Egzersize Geç (${cardIdx + 2}/${s.exercises.length}) ➔
                                    </button>
                                ` : `
                                    <button type="button" class="btn-hevy-finish-cta" onclick="openCompleteModal()">
                                        🏁 Antrenmanı Tamamla & Günlüğe Kaydet
                                    </button>
                                `}
                            </div>
                        ` : ''}

                        <div class="hevy-more-wrapper">
                            <button type="button" class="btn-hevy-more-toggle" onclick="toggleExerciseMoreActions('${cardEx.id}')" id="btnMoreActions_${cardEx.id}">
                                <span>⚙️ Diğer Seçenekler (Alternatif, Alet...)</span>
                                <span class="more-toggle-icon">${activeWorkoutMoreDrawersState[cardEx.id] ? '▲ Kapat' : '•••'}</span>
                            </button>
                            <div class="hevy-more-drawer" id="moreActionsDrawer_${cardEx.id}" style="display:${activeWorkoutMoreDrawersState[cardEx.id] ? 'grid' : 'none'};">
                                <button class="btn-hevy-action" onclick="openAlternativeModal('${cardEx.id}', 'active')">
                                    📋 Alternatif Seç
                                </button>
                                <button class="btn-hevy-action" onclick="deferExerciseToEnd('${cardEx.id}')" style="color:#f59e0b;">
                                    ⏳ Alet Dolu (Sona At)
                                </button>
                                <button class="btn-hevy-action" onclick="moveExerciseOrder('${cardEx.id}', -1)">
                                    ⬆️ Sırayı Öne Al
                                </button>
                                <button class="btn-hevy-action" onclick="moveExerciseOrder('${cardEx.id}', 1)">
                                    ⬇️ Sırayı Arkaya Al
                                </button>
                                <button class="btn-hevy-action" onclick="openAddFinisherModal()">
                                    ➕ Finisher Ekle
                                </button>
                                <button class="btn-hevy-action" onclick="openExerciseBugReportModal(decodeURIComponent('${encodeURIComponent(cardEx.id)}'), decodeURIComponent('${encodeURIComponent(cardEx.name || '')}'), '', decodeURIComponent('${encodeURIComponent(cardEx.equipment || '')}'), decodeURIComponent('${encodeURIComponent(cardEx.muscle || '')}'))">
                                    ⚠️ Hata Bildir
                                </button>
                                <button class="btn-hevy-action danger" onclick="removeExerciseFromWorkout('${cardEx.id}', 'active')">
                                    🗑️ Hareketi Kaldır
                                </button>
                                <button class="btn-hevy-action danger" onclick="cancelActiveWorkout()">
                                    🛑 İptal Et
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            };

            if (activeWorkoutViewMode === 'focus') {
                const ex = s.exercises[activeFocusExIndex];
                const focusPair = getSupersetPairInfo(s.exercises, activeFocusExIndex);
                const allWorkoutDone = s.exercises.every(e => (activeWorkoutSetsData[e.id] || []).every(st => st.completed));

                let navCounterHtml = '';
                let mainFocusBodyHtml = '';
                const isFirstNavDisabled = focusPair ? (focusPair.firstIdx === 0) : (activeFocusExIndex === 0);
                const isLastNavDisabled = focusPair ? (focusPair.secondIdx >= s.exercises.length - 1) : (activeFocusExIndex === s.exercises.length - 1);

                if (focusPair) {
                    const setsA = activeWorkoutSetsData[focusPair.firstEx.id] || [];
                    const setsB = activeWorkoutSetsData[focusPair.secondEx.id] || [];
                    const totalRounds = Math.max(setsA.length, setsB.length, 1);
                    let activeRoundIdx = 0;
                    let targetExId = null;
                    for (let r = 0; r < totalRounds; r++) {
                        const aDone = setsA[r] ? setsA[r].completed : true;
                        const bDone = setsB[r] ? setsB[r].completed : true;
                        if (!aDone) {
                            activeRoundIdx = r;
                            targetExId = focusPair.firstEx.id;
                            break;
                        }
                        if (!bDone) {
                            activeRoundIdx = r;
                            targetExId = focusPair.secondEx.id;
                            break;
                        }
                    }
                    const isPairAllDone = !targetExId;
                    const activeRoundNo = isPairAllDone ? totalRounds : (activeRoundIdx + 1);
                    const lblA = focusPair.firstEx.blockLabel || 'A1';
                    const lblB = focusPair.secondEx.blockLabel || 'A2';
                    navCounterHtml = `🔥 SÜPERSET BLOK ${escapeHTML(focusPair.groupId)} (${escapeHTML(lblA)} + ${escapeHTML(lblB)}) • TUR ${activeRoundNo} / ${totalRounds}`;

                    const stepBannerText = isPairAllDone
                        ? `✅ Süperset Blok ${escapeHTML(focusPair.groupId)} (${totalRounds} Tur) Tamamlandı!`
                        : (targetExId === focusPair.firstEx.id
                            ? `⚡ Sıradaki Adım: Tur ${activeRoundNo} • ${escapeHTML(lblA)} (${escapeHTML(focusPair.firstEx.name)}) ➔ Dinlenmeden ${escapeHTML(lblB)}'ye geç`
                            : `⚡ Sıradaki Adım: Tur ${activeRoundNo} • ${escapeHTML(lblB)} (${escapeHTML(focusPair.secondEx.name)}) ➔ Tur sonu ${focusPair.roundRest}s dinlenme`);

                    const roundPillsHtml = Array.from({ length: totalRounds }, (_, rIdx) => {
                        const aDone = setsA[rIdx] ? setsA[rIdx].completed : true;
                        const bDone = setsB[rIdx] ? setsB[rIdx].completed : true;
                        const rDone = aDone && bDone;
                        const rCur = !isPairAllDone && rIdx === activeRoundIdx;
                        return `<span style="padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800; border:1px solid ${rDone ? '#86EFAC' : (rCur ? '#B45309' : '#CBD5E1')}; background:${rDone ? '#DCFCE7' : (rCur ? '#FEF3C7' : '#FFFFFF')}; color:${rDone ? '#166534' : (rCur ? '#92400E' : '#475569')};">Tur ${rIdx + 1}: ${aDone ? '✓' : lblA} ➔ ${bDone ? '✓' : lblB}</span>`;
                    }).join('');

                    mainFocusBodyHtml = `
                        <div class="superset-round-tracker">
                            <div style="margin-bottom:6px; color:#92400E; font-weight:900;">${stepBannerText}</div>
                            <div style="display:flex; flex-wrap:wrap; gap:6px;">${roundPillsHtml}</div>
                        </div>
                        <div class="superset-pair-focus-shell">
                            ${renderFocusSingleCardHtml(focusPair.firstEx, focusPair.firstIdx, true, targetExId === focusPair.firstEx.id, focusPair)}
                            <div class="superset-focus-connector">
                                ⚡ DİNLENMEDEN ${escapeHTML(lblB)} (${escapeHTML(focusPair.secondEx.name)}) HAREKETİNE GEÇ (0 sn) ➔
                            </div>
                            ${renderFocusSingleCardHtml(focusPair.secondEx, focusPair.secondIdx, true, targetExId === focusPair.secondEx.id, focusPair)}
                            ${isPairAllDone ? `
                                <div class="hevy-exercise-done-banner" style="margin-top:4px;">
                                    <div class="hevy-done-title">🎉 Süperset Blok ${escapeHTML(focusPair.groupId)} Bitti!</div>
                                    <div class="hevy-done-sub">Her iki hareketin tüm turları tamamlandı.</div>
                                    ${!isLastNavDisabled ? `
                                        <button type="button" class="btn-hevy-next-cta" onclick="goToNextExercise()">
                                            Sıradaki Bloğa Geç ➔
                                        </button>
                                    ` : `
                                        <button type="button" class="btn-hevy-finish-cta" onclick="openCompleteModal()">
                                            🏁 Antrenmanı Tamamla & Günlüğe Kaydet
                                        </button>
                                    `}
                                </div>
                            ` : ''}
                        </div>
                    `;
                } else {
                    const exBlockTag = ex.blockType === 'superset'
                        ? `🔥 Süperset (${ex.blockLabel})`
                        : `🎯 Düz Set (${ex.blockLabel || (activeFocusExIndex + 1)})`;
                    navCounterHtml = `EGZERSİZ ${activeFocusExIndex + 1} / ${s.exercises.length} • ${escapeHTML(exBlockTag)}`;
                    mainFocusBodyHtml = renderFocusSingleCardHtml(ex, activeFocusExIndex, false, false, null);
                }

                container.innerHTML = `
                    <div class="hevy-workout-wrapper">
                        <!-- TOP EXERCISE NAVIGATION STEPPER -->
                        <div class="hevy-exercise-nav">
                            <button type="button" class="hevy-nav-arrow" onclick="goToPrevExercise()" ${isFirstNavDisabled ? 'disabled' : ''} title="Önceki Blok/Egzersiz">
                                ◀
                            </button>
                            <div class="hevy-nav-center">
                                <div class="hevy-nav-counter">${navCounterHtml}</div>
                                <div class="hevy-nav-pills">
                                    ${s.exercises.map((e, eIdx) => {
                                        const eSets = activeWorkoutSetsData[e.id] || [];
                                        const isDone = eSets.length > 0 && eSets.every(st => st.completed);
                                        const isCur = focusPair ? (eIdx === focusPair.firstIdx || eIdx === focusPair.secondIdx) : eIdx === activeFocusExIndex;
                                        const pillLbl = e.blockLabel || (eIdx + 1);
                                        return `
                                            <button type="button" 
                                                    class="hevy-pill-dot ${isCur ? 'active' : ''} ${isDone ? 'done' : ''}" 
                                                    onclick="jumpToExercise(${eIdx})" 
                                                    title="${escapeHTML(e.name)}">
                                                ${isDone ? '✓' : escapeHTML(String(pillLbl))}
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            <button type="button" class="hevy-nav-arrow" onclick="goToNextExercise()" ${isLastNavDisabled ? 'disabled' : ''} title="Sonraki Blok/Egzersiz">
                                ▶
                            </button>
                        </div>

                        ${mainFocusBodyHtml}

                        <!-- NAVIGATION FOOTER -->
                        <div class="hevy-footer-nav">
                            <button type="button" class="btn-hevy-nav" onclick="goToPrevExercise()" ${isFirstNavDisabled ? 'disabled' : ''}>
                                ◀ Önceki Hrk
                            </button>
                            <button type="button" class="btn-hevy-nav" style="border-color:var(--gold); color:var(--gold); font-weight:900;" onclick="openCompleteModal()">
                                🏁 Seansı Bitir
                            </button>
                            <button type="button" class="btn-hevy-nav" onclick="goToNextExercise()" ${isLastNavDisabled ? 'disabled' : ''}>
                                Sonraki Hrk ▶
                            </button>
                        </div>

                        ${allWorkoutDone ? `
                            <div style="text-align:center; margin:14px 0 20px;">
                                <button type="button" class="btn-hevy-finish-cta" style="padding:16px; font-size:15px; box-shadow:0 0 25px rgba(245,158,11,0.6);" onclick="openCompleteModal()">
                                    🏆 TEBRİKLER! TÜM SETLER BİTTİ • BİTİR & GÜNLÜĞE KAYDET
                                </button>
                            </div>
                        ` : ''}

                        <!-- ODAK MODU ALT İPTAL BUTONU -->
                        <div style="display:flex; justify-content:center; margin-top:6px; padding-top:10px; border-top:1px dashed var(--border);">
                            <button type="button" class="btn btn-danger-soft" style="padding:8px 18px; font-size:12px; font-weight:700;" onclick="cancelActiveWorkout()">
                                🛑 Antrenmanı İptal Et
                            </button>
                        </div>
                    </div>
                `;
                return;
            }

            // ==================== MODE 2: TÜM LİSTE GÖRÜNÜMÜ (LIST VIEW - HEVY / STRONG STYLE) ====================
            if (dock) dock.style.display = 'none';

            container.innerHTML = `
                <div class="hevy-workout-wrapper">
                    ${s.exercises.map((ex, idx) => {
                        const pair = getSupersetPairInfo(s.exercises, idx);
                        const isBw = isExerciseBodyweight(ex);
                        const isTime = isExerciseTimeBased(ex);
                        const sets = activeWorkoutSetsData[ex.id] || [];
                        const firstIncompleteIdx = sets.findIndex(st => !st.completed);
                        let isPairTarget = false;
                        if (pair) {
                            const setsA = activeWorkoutSetsData[pair.firstEx.id] || [];
                            const setsB = activeWorkoutSetsData[pair.secondEx.id] || [];
                            const totalR = Math.max(setsA.length, setsB.length, 1);
                            let pairTargetExId = null;
                            for (let r = 0; r < totalR; r++) {
                                const aDone = setsA[r] ? setsA[r].completed : true;
                                const bDone = setsB[r] ? setsB[r].completed : true;
                                if (!aDone) { pairTargetExId = pair.firstEx.id; break; }
                                if (!bDone) { pairTargetExId = pair.secondEx.id; break; }
                            }
                            isPairTarget = (pairTargetExId === ex.id);
                        }
                        const lastPerf = getLastExercisePerformance(ex.id) || getLastExercisePerformance(ex.name);
                        const isFormOpen = !!workoutFormGuideOpenState[ex.id];
                        const exRestSecs = (ex.customRest !== undefined && ex.customRest !== null) ? ex.customRest : ((s.scheme && s.scheme.rest) || 45);
                        const targetMetricStr = isTime ? (String(s.scheme.reps).includes('sn') ? s.scheme.reps : `${s.scheme.reps || 30} sn`) : `${s.scheme.reps}`;
                        const blockHdrHtml = ex.blockHeader ? `
                            <div class="block-header" style="${ex.blockType === 'superset' ? 'border-left:3px solid #f59e0b; background:rgba(245,158,11,0.08); color:#B45309;' : 'border-left:3px solid #38bdf8; background:rgba(56,189,248,0.08); color:#0369A1;'} padding:6px 10px; border-radius:6px; margin-bottom:8px;">
                                ${escapeHTML(ex.blockHeader)}
                            </div>
                        ` : '';
                        const partnerBadgeHtml = pair
                            ? `<span class="superset-partner-badge">🔗 Partner: ${ex.supersetRole === 1 ? escapeHTML((pair.secondEx.blockLabel || 'A2') + ' ' + pair.secondEx.name) + ' (0s Geçiş)' : escapeHTML((pair.firstEx.blockLabel || 'A1') + ' ' + pair.firstEx.name) + ' (Tur Sonu ' + pair.roundRest + 's)'}</span>`
                            : '';

                        return `
                            ${blockHdrHtml}
                            <div class="hevy-exercise-card ${pair ? 'superset-pair-item' : ''} ${isPairTarget ? 'is-pair-target' : ''}" data-exercise-id="${ex.id}">
                                <div class="hevy-exercise-header">
                                    <div class="hevy-title-row">
                                        <div class="hevy-exercise-title">
                                            <span style="color:var(--gold); font-weight:900;">${escapeHTML(String(ex.blockLabel || (idx + 1)))}.</span>
                                            <span>${escapeHTML(ex.name)}</span>
                                        </div>
                                        <span class="hevy-equip-badge">${equipLabels[ex.equipment] || ex.equipment}</span>
                                    </div>
                                    <div class="hevy-meta-row">
                                        <span class="hevy-meta-item">🎯 <strong>${sets.length} Set × ${targetMetricStr}</strong></span>
                                        <span class="hevy-meta-item">⏱️ Dinlenme: <strong>${pair && ex.supersetRole === 1 ? '0s (Dinlenmesiz)' : `${exRestSecs}s`}</strong></span>
                                        ${partnerBadgeHtml}
                                    </div>
                                </div>

                                <div class="hevy-form-collapsible">
                                    <button type="button" class="btn-hevy-form-toggle" onclick="toggleWorkoutFormGuide('${ex.id}')">
                                        <span>📖 Form & Biyomekanik Rehberi</span>
                                        <span id="formGuideArrow_${ex.id}" style="color:var(--gold); font-weight:800;">${isFormOpen ? '▲ Gizle' : '▼ Göster'}</span>
                                    </button>
                                    <div id="formGuideBody_${ex.id}" class="hevy-form-guide-body" style="display:${isFormOpen ? 'block' : 'none'};">
                                        ${isFormOpen ? renderExercisePositionsHtml(ex, `active_${idx}`, false) : ''}
                                    </div>
                                </div>

                                ${lastPerf ? `
                                    <div class="hevy-ghost-bar">
                                        <div class="hevy-ghost-info">
                                            <span>📌 Önceki: <strong>${formatPerformancePill(ex, lastPerf.weight, lastPerf.reps)}</strong></span>
                                        </div>
                                        <button type="button" class="btn-hevy-ghost-apply" onclick="copyLastPerformanceToCurrent('${ex.id}', ${lastPerf.weight}, ${lastPerf.reps})">
                                            ⚡ Tümüne Yaz
                                        </button>
                                    </div>
                                ` : ''}

                                <div class="hevy-sets-card">
                                    <div class="hevy-sets-table">
                                        <div class="hevy-th-row">
                                            <div class="hevy-th">SET</div>
                                            <div class="hevy-th">ÖNCEKİ</div>
                                            <div class="hevy-th">${isExerciseCardioMinutes(ex) ? 'MOD' : (isBw ? 'YÜK (BW)' : 'KG')}</div>
                                            <div class="hevy-th">${isExerciseCardioMinutes(ex) ? 'SÜRE (DK)' : (isTime ? 'SÜRE (SN)' : 'TEKRAR')}</div>
                                            <div class="hevy-th">✓</div>
                                        </div>

                                        ${sets.map((st, sIdx) => {
                                            const isDone = st.completed;
                                            const isCardioRow = isExerciseCardioMinutes(ex);
                                            const isTarget = !isDone && sIdx === firstIncompleteIdx && (!pair || isPairTarget);
                                            const prevText = lastPerf ? formatPerformancePill(ex, lastPerf.weight, lastPerf.reps) : '-';

                                            return `
                                                <div class="hevy-tr-row ${isDone ? 'done' : ''} ${isTarget ? 'active-target' : ''}" id="setRow_${ex.id}_${sIdx}">
                                                    <div class="hevy-td">
                                                        <span class="hevy-set-pill ${isDone ? 'done' : (isTarget ? 'target' : '')}">${st.setNo}</span>
                                                    </div>

                                                    <div class="hevy-td"
                                                         title="${lastPerf && !isDone ? 'Bu sete önceki veriyi aktarmak için dokunun' : ''}"
                                                         ${lastPerf && !isDone ? `onclick="applyGhostToSet('${ex.id}', ${sIdx}, ${isCardioRow ? 0 : (lastPerf.weight || 0)}, ${lastPerf.reps})"` : ''}>
                                                        <span class="hevy-prev-text ${lastPerf && !isDone ? 'clickable' : ''}">${prevText}</span>
                                                    </div>

                                                    <!-- AĞIRLIK (KG / BW / KARDİYO) - LISTBOX PICKER -->
                                                    <div class="hevy-td">
                                                        ${isCardioRow ? `
                                                            <button type="button" class="hevy-listbox-btn bw-load-btn" disabled style="opacity:0.75; cursor:default;" title="Dakika bazlı kardiyo aktivitesi">
                                                                <span>Kardiyo</span>
                                                            </button>
                                                        ` : `
                                                            <button type="button" class="hevy-listbox-btn ${isBw ? 'bw-load-btn' : ''}" onclick="openListboxPicker('${ex.id}', ${sIdx}, 'weight')" title="${isBw ? 'Vücut ağırlığı veya ek yük seçin' : 'Kilo seçmek için dokunun'}">
                                                                <span>${formatSetWeightDisplay(isBw, st.weight)}</span>
                                                                <span class="listbox-btn-arrow">▾</span>
                                                            </button>
                                                        `}
                                                    </div>

                                                    <!-- TEKRAR / SÜRE (SN / DK) - LISTBOX PICKER -->
                                                    <div class="hevy-td">
                                                        <button type="button" class="hevy-listbox-btn ${(isTime || isCardioRow) ? 'time-metric-btn' : ''}" onclick="openListboxPicker('${ex.id}', ${sIdx}, 'reps')" title="${isCardioRow ? 'Süre (dakika) seçmek için dokunun' : (isTime ? 'Süre (saniye) seçmek için dokunun' : 'Tekrar seçmek için dokunun')}">
                                                            <span>${formatSetMetricDisplay(ex, st.reps)}</span>
                                                            <span class="listbox-btn-arrow">▾</span>
                                                        </button>
                                                    </div>

                                                    <div class="hevy-td">
                                                        <button type="button" 
                                                                class="btn-hevy-check ${isDone ? 'checked' : (isTarget ? 'target' : '')}" 
                                                                onclick="handleSetCheckClick('${ex.id}', ${sIdx})"
                                                                title="${isDone ? 'Set Tamamlandı (Geri Almak İçin Dokunun)' : 'Seti Bitir ve Dinlenmeyi Başlat'}">
                                                            ${isDone ? '✓' : (isTarget ? '⚡' : '○')}
                                                        </button>
                                                    </div>
                                                </div>
                                                ${renderInterSetSlotHtml(ex.id, st, sIdx, sets.length)}
                                            `;
                                        }).join('')}
                                    </div>

                                    <div class="hevy-table-footer">
                                        <button type="button" class="btn-hevy-add-set" onclick="addSetToExercise('${ex.id}')">
                                            ➕ Set Ekle
                                        </button>
                                        ${sets.length > 1 ? `
                                            <button type="button" class="btn-hevy-del-set" onclick="removeSetFromExercise('${ex.id}')" title="Son seti sil">
                                                🗑️ Set Sil
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>

                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:6px; border-top:1px dashed var(--border); flex-wrap:wrap; gap:6px;">
                                    <div style="display:flex; gap:6px;">
                                        <button class="btn-swap-ex" style="color:#f59e0b; border-color:rgba(245,158,11,0.4);" onclick="deferExerciseToEnd('${ex.id}')" title="Bu istasyon doluysa en sona at">
                                            ⏳ Sona Ertele
                                        </button>
                                        <button class="btn-swap-ex" onclick="moveExerciseOrder('${ex.id}', -1)" title="Sırayı öne al">
                                            ⬆️
                                        </button>
                                        <button class="btn-swap-ex" onclick="moveExerciseOrder('${ex.id}', 1)" title="Sırayı arkaya al">
                                            ⬇️
                                        </button>
                                    </div>
                                    <div style="display:flex; gap:6px;">
                                        <button class="btn-swap-ex" onclick="openAlternativeModal('${ex.id}', 'active')" title="Listeden alternatif seç">
                                            📋 Alternatif
                                        </button>
                                        <button class="btn-swap-ex" style="color:#DC2626; border-color:rgba(239,68,68,0.3);" onclick="removeExerciseFromWorkout('${ex.id}', 'active')" title="Bu hareketi kaldır">
                                            🗑️ Kaldır
                                        </button>
                                    </div>
                                </div>
                            </div>
                            ${pair && ex.supersetRole === 1 ? `<div class="superset-focus-connector" style="margin:-4px 0 8px 0;">⚡ DİNLENMEDEN ${escapeHTML(pair.secondEx.blockLabel || 'A2')} (${escapeHTML(pair.secondEx.name)}) HAREKETİNE GEÇ (0 sn) ➔</div>` : ''}
                        `;
                    }).join('')}

                    <div style="text-align:center; margin:16px 0 20px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
                        <button class="btn btn-outline" style="border-style:dashed; border-color:var(--cyan); color:var(--cyan); font-size:12px; padding:9px 16px; font-weight:700;" onclick="openAddExerciseModal('active')">
                            ➕ Yeni Hareket Ekle
                        </button>
                        <button class="btn btn-outline" style="border-color:var(--gold); color:var(--gold); font-size:12px; padding:9px 16px; font-weight:800;" onclick="openAddFinisherModal()">
                            ⚡ Hızlı Finisher Ekle
                        </button>
                    </div>

                    <div class="hevy-workout-finish-bar" style="margin-bottom:24px;">
                        <button type="button" class="btn-hevy-workout-cancel" onclick="cancelActiveWorkout()">
                            🛑 Antrenmanı İptal Et
                        </button>
                        <button type="button" class="btn-hevy-workout-finish" onclick="openCompleteModal()">
                            🏁 ANTRENMANI TAMAMLA & GÜNLÜĞE KAYDET
                        </button>
                    </div>
                </div>
            `;
        }

        function onSetWeightInput(exId, setIdx, val) {
            if (!activeWorkoutSetsData[exId] || !activeWorkoutSetsData[exId][setIdx]) return;
            activeWorkoutSetsData[exId][setIdx].weight = val;
            saveActiveWorkoutStateToStorage();
        }

        function onSetRepsInput(exId, setIdx, val) {
            if (!activeWorkoutSetsData[exId] || !activeWorkoutSetsData[exId][setIdx]) return;
            activeWorkoutSetsData[exId][setIdx].reps = parseInt(val) || 0;
            saveActiveWorkoutStateToStorage();
        }

        function completeSetAndStartRest(exId, setIdx) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;

            const st = sets[setIdx];
            const wInput = document.getElementById(`w_${exId}_${setIdx}`);
            const rInput = document.getElementById(`r_${exId}_${setIdx}`);

            if (wInput && wInput.value !== '') st.weight = parseFloat(wInput.value) || 0;
            if (rInput && rInput.value !== '') st.reps = parseInt(rInput.value) || 0;
            if (st.weight === '' || st.weight === null || st.weight === undefined) {
                if (setIdx > 0 && sets[setIdx - 1].weight !== '' && sets[setIdx - 1].weight !== null && sets[setIdx - 1].weight !== undefined) {
                    st.weight = sets[setIdx - 1].weight;
                } else {
                    st.weight = 0;
                }
            }
            if (st.reps === '' || st.reps === null || st.reps === undefined) {
                if (setIdx > 0 && sets[setIdx - 1].reps) {
                    st.reps = sets[setIdx - 1].reps;
                } else {
                    st.reps = 10;
                }
            }

            st.completed = true;
            st.completedAt = Date.now();

            // Tamamlanan setin kilosunu henüz tamamlanmamış sonraki tüm setlere aktar (kullanıcı isterse sonra değiştirebilir)
            if (st.weight !== '' && st.weight !== null && st.weight !== undefined && !isNaN(st.weight)) {
                for (let i = setIdx + 1; i < sets.length; i++) {
                    if (!sets[i].completed) {
                        sets[i].weight = st.weight;
                    }
                }
            }

            const curExObj = activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises)
                ? activeWorkoutSession.exercises.find(e => e.id === exId)
                : null;
            const liveCompletedSets = sets.filter(s => s && s.completed);
            const liveTopSet = pickSessionTopWorkingSet(curExObj || exId, liveCompletedSets);
            if (!isExerciseCardioMinutes(curExObj || exId) && liveTopSet && Number(liveTopSet.weight) > 0) {
                rememberExerciseWeight(exId, curExObj ? curExObj.name : '', liveTopSet.weight);
            }
            const curIdx = curExObj ? activeWorkoutSession.exercises.indexOf(curExObj) : -1;
            const pair = curIdx >= 0 ? getSupersetPairInfo(activeWorkoutSession.exercises, curIdx) : null;

            if (pair && curExObj.supersetRole === 1) {
                const partnerSets = activeWorkoutSetsData[pair.secondEx.id] || [];
                if (partnerSets[setIdx] && !partnerSets[setIdx].completed) {
                    activeFocusExIndex = pair.secondIdx;
                }
            } else if (pair && curExObj.supersetRole === 2) {
                const firstSets = activeWorkoutSetsData[pair.firstEx.id] || [];
                const hasMoreFirstSets = firstSets.some(sItem => !sItem.completed);
                if (hasMoreFirstSets) {
                    activeFocusExIndex = pair.firstIdx;
                }
            }

            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();

            // TRIGGER REST TIMER (Blok bazlı akademik dinlenme süresi varsa onu kullan)
            if (pair && curExObj.supersetRole === 1) {
                const partnerSets = activeWorkoutSetsData[pair.secondEx.id] || [];
                const targetPartnerIdx = (partnerSets[setIdx] && !partnerSets[setIdx].completed)
                    ? setIdx
                    : partnerSets.findIndex(sItem => !sItem.completed);
                if (targetPartnerIdx !== -1) {
                    resetTimer(0);
                    const lblA = pair.firstEx.blockLabel || 'A1';
                    const lblB = pair.secondEx.blockLabel || 'A2';
                    if (typeof showToast === 'function') showToast(`⚡ ${lblA} Set ${setIdx + 1} tamam! Dinlenmeden ${lblB} (${pair.secondEx.name}) Set ${targetPartnerIdx + 1}'e geçin!`);
                    setTimeout(() => {
                        const row = document.getElementById(`setRow_${pair.secondEx.id}_${targetPartnerIdx}`);
                        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 60);
                    requestWakeLock();
                    return;
                }
            }
            if (pair && curExObj.supersetRole === 2) {
                const roundRest = pair.roundRest || curExObj.roundRest || curExObj.customRest || 60;
                const firstSets = activeWorkoutSetsData[pair.firstEx.id] || [];
                const secondSets = activeWorkoutSetsData[pair.secondEx.id] || [];
                let nextFirstIdx = firstSets.findIndex((sItem, idx) => idx > setIdx && !sItem.completed);
                if (nextFirstIdx === -1) nextFirstIdx = firstSets.findIndex(sItem => !sItem.completed);
                const nextSecondIdx = secondSets.findIndex(sItem => !sItem.completed);
                const lblA = pair.firstEx.blockLabel || 'A1';

                resetTimer(roundRest);
                startTimer();
                if (nextFirstIdx !== -1) {
                    if (typeof showToast === 'function') showToast(`⏱️ Tur ${setIdx + 1} bitti (${roundRest}sn dinlenme) • Sıradaki: ${lblA} (${pair.firstEx.name}) Set ${nextFirstIdx + 1}`);
                    setTimeout(() => {
                        const nextRow = document.getElementById(`setRow_${pair.firstEx.id}_${nextFirstIdx}`);
                        if (nextRow) nextRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 60);
                } else if (nextSecondIdx !== -1) {
                    if (typeof showToast === 'function') showToast(`⏱️ Tur ${setIdx + 1} bitti (${roundRest}sn dinlenme) • Sıradaki Set ${nextSecondIdx + 1}`);
                    setTimeout(() => {
                        const nextRow = document.getElementById(`setRow_${pair.secondEx.id}_${nextSecondIdx}`);
                        if (nextRow) nextRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 60);
                } else {
                    if (typeof showToast === 'function') showToast(`🎉 Süperset Blok ${pair.groupId} tamamlandı! (${roundRest}sn dinlenme)`);
                    setTimeout(() => {
                        const doneBanner = document.querySelector('.hevy-exercise-done-banner');
                        if (doneBanner) doneBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 60);
                }
                playAlertSound();
                if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
                requestWakeLock();
                return;
            }
            const restSecs = (curExObj && curExObj.customRest !== undefined && curExObj.customRest !== null)
                ? curExObj.customRest
                : (activeWorkoutSession && activeWorkoutSession.scheme ? (activeWorkoutSession.scheme.rest || 45) : 45);
            if (restSecs > 0) {
                resetTimer(restSecs);
                startTimer();
                playAlertSound();
                if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
            } else {
                resetTimer(0);
            }

            // Ekran kilidini canlı tut
            requestWakeLock();
        }

        function toggleSetStatus(exId, setIdx) {
            const sets = activeWorkoutSetsData[exId];
            if (!sets || !sets[setIdx]) return;
            sets[setIdx].completed = !sets[setIdx].completed;
            sets[setIdx].completedAt = sets[setIdx].completed ? Date.now() : null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        function addSetToExercise(exId) {
            const sets = activeWorkoutSetsData[exId] || [];
            let ex = null;
            if (activeWorkoutSession && Array.isArray(activeWorkoutSession.exercises)) {
                ex = activeWorkoutSession.exercises.find(e => e.id === exId);
            }
            if (!ex && typeof EXERCISES_DB !== 'undefined') {
                ex = EXERCISES_DB.find(e => e.id === exId);
            }
            const isBw = isExerciseBodyweight(ex);
            const isCardio = isExerciseCardioMinutes(ex);
            const isTime = isExerciseTimeBased(ex);

            const lastWeight = sets.length > 0 ? sets[sets.length - 1].weight : (isCardio ? '' : (isBw ? 0 : ''));
            const lastReps = sets.length > 0 ? sets[sets.length - 1].reps : (isCardio ? 20 : (isTime ? 30 : 10));
            sets.push({
                setNo: sets.length + 1,
                weight: lastWeight,
                reps: lastReps,
                completed: false,
                completedAt: null
            });
            activeWorkoutSetsData[exId] = sets;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }

        function removeSetFromExercise(exId) {
            const sets = activeWorkoutSetsData[exId] || [];
            if (sets.length > 1) {
                sets.pop();
                saveActiveWorkoutStateToStorage();
                renderActiveWorkout();
            }
        }

        // ==================== SET ARASI İLAVE HAREKET (INTER-SET EXTRA) ENGINE ====================
        let activeInterSetContext = {
            exId: null,
            setIdx: 0,
            selectedExercise: null,
            metricType: 'time',
            value: 45
        };

        const INTER_SET_QUICK_PRESETS = [
            { id: 'bw_jumping_jack', name: 'Jumping Jack', icon: '⚡', muscle: 'Kondisyon, Tüm Vücut', category: 'conditioning', equipment: 'bodyweight', defaultType: 'time', defaultVal: 45 },
            { id: 'bw_plank', name: 'Plank', icon: '🛡️', muscle: 'Core, Karın', category: 'core', equipment: 'bodyweight', defaultType: 'time', defaultVal: 45 },
            { id: 'bw_mountain_climber', name: 'Mountain Climber', icon: '⛰️', muscle: 'Core, Kondisyon', category: 'conditioning', equipment: 'bodyweight', defaultType: 'time', defaultVal: 40 },
            { id: 'bw_pushup', name: 'Şınav (Push-Up)', icon: '💪', muscle: 'Göğüs, Triceps, Ön Omuz', category: 'push', equipment: 'bodyweight', defaultType: 'reps', defaultVal: 15 },
            { id: 'bw_crunch', name: 'Mekik / Crunch', icon: '🔥', muscle: 'Karın, Core', category: 'core', equipment: 'bodyweight', defaultType: 'reps', defaultVal: 20 },
            { id: 'bw_burpee', name: 'Burpee', icon: '🚀', muscle: 'Tüm Vücut, Kondisyon', category: 'conditioning', equipment: 'bodyweight', defaultType: 'reps', defaultVal: 10 },
            { id: 'db_swing', name: 'Kettlebell / Dambıl Swing', icon: '🔔', muscle: 'Kalça, Arka Bacak, Kondisyon', category: 'legs_hinge', equipment: 'kettlebell', defaultType: 'reps', defaultVal: 15 },
            { id: 'bw_hollow_body', name: 'Hollow Body Hold', icon: '🧱', muscle: 'Core, Alt Karın', category: 'core', equipment: 'bodyweight', defaultType: 'time', defaultVal: 30 },
            { id: 'cond_indoor_row', name: 'Kürek Çekme (Indoor Row)', icon: '🚣', muscle: 'Sırt, Bacak, Kondisyon', category: 'conditioning', equipment: 'machine', defaultType: 'time', defaultVal: 180 },
            { id: 'cond_walking', name: 'Tempolu Yürüyüş (Walking)', icon: '🚶', muscle: 'Bacak, Kalça, Kondisyon', category: 'conditioning', equipment: 'bodyweight', defaultType: 'time', defaultVal: 300 },
            { id: 'cond_running', name: 'Koşu / Koşu Bandı', icon: '🏃', muscle: 'Bacak, Kalf, Kondisyon', category: 'conditioning', equipment: 'bodyweight', defaultType: 'time', defaultVal: 300 }
        ];

        function renderInterSetSlotHtml(exId, st, sIdx, totalSets) {
            if (sIdx >= totalSets - 1) return '';
            const safeExId = encodeURIComponent(exId);
            const item = st && st.interSet ? st.interSet : null;
            if (!item) {
                return `
                    <div class="hevy-interset-slot">
                        <button type="button"
                                class="btn-interset-plus"
                                onclick="openInterSetModal(decodeURIComponent('${safeExId}'), ${sIdx})"
                                title="Set ${sIdx + 1} - Set ${sIdx + 2} arasına ilave hareket ekle (Jumping Jack, Plank vb.)"
                                aria-label="Set ${sIdx + 1} ile ${sIdx + 2} arasına ilave hareket ekle">
                            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="2.5" x2="6" y2="9.5"></line><line x1="2.5" y1="6" x2="9.5" y2="6"></line></svg>
                        </button>
                    </div>
                `;
            }
            const isDone = !!item.completed;
            const metricLbl = item.metricType === 'time' ? `${item.value} sn` : `${item.value} tk`;
            return `
                <div class="hevy-interset-row ${isDone ? 'done' : ''}">
                    <div class="hevy-interset-info" onclick="openInterSetModal(decodeURIComponent('${safeExId}'), ${sIdx})" title="Set arası hareketi düzenlemek için dokunun">
                        <span class="hevy-interset-tag">⚡ Set ${sIdx + 1}-${sIdx + 2} Arası</span>
                        <span class="hevy-interset-name">${escapeHTML(item.name)}</span>
                        <span class="hevy-interset-metric">${escapeHTML(metricLbl)}</span>
                    </div>
                    <div class="hevy-interset-actions">
                        <button type="button"
                                class="btn-interset-del"
                                onclick="removeInterSetExercise(decodeURIComponent('${safeExId}'), ${sIdx})"
                                title="Set arası hareketi kaldır">✕</button>
                        <button type="button"
                                class="btn-interset-check ${isDone ? 'checked' : ''}"
                                onclick="toggleInterSetCheck(decodeURIComponent('${safeExId}'), ${sIdx})"
                                title="${isDone ? 'Tamamlandı (Geri almak için dokunun)' : 'Set arası hareketi tamamla'}">
                            ${isDone ? '✓' : '○'}
                        </button>
                    </div>
                </div>
            `;
        }

        function openInterSetModal(exId, setIdx) {
            const sets = activeWorkoutSetsData[exId] || [];
            const st = sets[setIdx];
            if (!st) return;

            const existing = st.interSet || null;
            const defaultPreset = INTER_SET_QUICK_PRESETS[0];

            activeInterSetContext = {
                exId: exId,
                setIdx: setIdx,
                selectedExercise: existing ? {
                    id: existing.id,
                    name: existing.name,
                    muscle: existing.muscle || 'Kondisyon, Tüm Vücut',
                    category: existing.category || 'conditioning',
                    equipment: existing.equipment || 'bodyweight'
                } : {
                    id: defaultPreset.id,
                    name: defaultPreset.name,
                    muscle: defaultPreset.muscle,
                    category: defaultPreset.category,
                    equipment: defaultPreset.equipment
                },
                metricType: existing ? existing.metricType : defaultPreset.defaultType,
                value: existing ? existing.value : defaultPreset.defaultVal
            };

            const titleEl = document.getElementById('interSetModalTitle');
            if (titleEl) {
                titleEl.textContent = `⚡ Set ${setIdx + 1} – Set ${setIdx + 2} Arası İlave Hareket`;
            }
            const btnSingle = document.getElementById('btnSaveSingleInterSet');
            if (btnSingle) {
                btnSingle.textContent = `➕ Sadece Set ${setIdx + 1}–${setIdx + 2} Arasına Ekle`;
            }

            const searchInput = document.getElementById('interSetSearchInput');
            if (searchInput) searchInput.value = '';
            const searchRes = document.getElementById('interSetSearchResults');
            if (searchRes) {
                searchRes.style.display = 'none';
                searchRes.innerHTML = '';
            }

            renderInterSetModalContent();
            const modal = document.getElementById('interSetModal');
            if (modal) modal.classList.add('active');
        }

        function closeInterSetModal() {
            const modal = document.getElementById('interSetModal');
            if (modal) modal.classList.remove('active');
        }

        function renderInterSetModalContent() {
            const chipsContainer = document.getElementById('interSetQuickChips');
            const selId = activeInterSetContext.selectedExercise ? activeInterSetContext.selectedExercise.id : '';
            if (chipsContainer) {
                chipsContainer.innerHTML = INTER_SET_QUICK_PRESETS.map((p, idx) => {
                    const isSel = p.id === selId || (activeInterSetContext.selectedExercise && activeInterSetContext.selectedExercise.name === p.name);
                    return `
                        <button type="button"
                                class="interset-quick-chip ${isSel ? 'selected' : ''}"
                                onclick="selectInterSetQuickPreset(${idx})">
                            <div style="font-size:12.5px; font-weight:800; color:#0F172A;">${p.icon} ${escapeHTML(p.name)}</div>
                            <div style="font-size:10.5px; color:#475569; margin-top:2px;">${escapeHTML(p.muscle)} • ${p.defaultVal} ${p.defaultType === 'time' ? 'sn' : 'tk'}</div>
                        </button>
                    `;
                }).join('');
            }

            const selNameEl = document.getElementById('interSetSelectedName');
            if (selNameEl && activeInterSetContext.selectedExercise) {
                selNameEl.textContent = activeInterSetContext.selectedExercise.name;
            }

            const isTime = activeInterSetContext.metricType === 'time';
            const btnTime = document.getElementById('btnInterSetTypeTime');
            const btnReps = document.getElementById('btnInterSetTypeReps');
            if (btnTime) btnTime.classList.toggle('active', isTime);
            if (btnReps) btnReps.classList.toggle('active', !isTime);

            const lblEl = document.getElementById('interSetValInputLabel');
            if (lblEl) lblEl.textContent = isTime ? 'Hedef Süre (Saniye):' : 'Hedef Tekrar Sayısı:';

            const valInput = document.getElementById('interSetCustomValInput');
            if (valInput) valInput.value = activeInterSetContext.value;

            const quickVals = isTime ? [20, 30, 45, 60, 90] : [10, 15, 20, 25, 30, 50];
            const quickRow = document.getElementById('interSetQuickValuesRow');
            if (quickRow) {
                quickRow.innerHTML = quickVals.map(v => `
                    <button type="button"
                            class="interset-metric-pill ${Number(activeInterSetContext.value) === v ? 'active' : ''}"
                            onclick="setInterSetMetricValue(${v})">
                        ${v} ${isTime ? 'sn' : 'tk'}
                    </button>
                `).join('');
            }
        }

        function selectInterSetQuickPreset(presetIdx) {
            const p = INTER_SET_QUICK_PRESETS[presetIdx];
            if (!p) return;
            const dbEx = (typeof EXERCISES_DB !== 'undefined') ? EXERCISES_DB.find(e => e.id === p.id) : null;
            activeInterSetContext.selectedExercise = {
                id: p.id,
                name: dbEx ? dbEx.name : p.name,
                muscle: dbEx && dbEx.muscle ? dbEx.muscle : p.muscle,
                category: dbEx && dbEx.category ? dbEx.category : p.category,
                equipment: dbEx && dbEx.equipment ? dbEx.equipment : p.equipment
            };
            activeInterSetContext.metricType = p.defaultType;
            activeInterSetContext.value = p.defaultVal;
            renderInterSetModalContent();
        }

        function filterInterSetPoolSearch() {
            const input = document.getElementById('interSetSearchInput');
            const resBox = document.getElementById('interSetSearchResults');
            if (!input || !resBox) return;
            const q = input.value.trim().toLocaleLowerCase('tr-TR');
            if (!q) {
                resBox.style.display = 'none';
                resBox.innerHTML = '';
                return;
            }
            const pool = (typeof getActiveExercisePool === 'function')
                ? getActiveExercisePool()
                : (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : []);
            const matches = pool.filter(e => {
                const hay = `${e.name || ''} ${e.muscle || ''} ${e.category || ''}`.toLocaleLowerCase('tr-TR');
                return hay.includes(q);
            }).slice(0, 15);

            resBox.style.display = 'block';
            if (matches.length === 0) {
                resBox.innerHTML = `<div style="font-size:11.5px; color:#64748B; padding:6px;">Eşleşen hareket bulunamadı; özel isim olarak "${escapeHTML(input.value.trim())}" ekleyebilirsiniz: <button type="button" class="btn btn-outline" style="padding:3px 8px; font-size:11px; margin-left:6px;" onclick="selectCustomNamedInterSetExercise()">Seç</button></div>`;
                return;
            }
            resBox.innerHTML = matches.map(e => {
                const safeId = encodeURIComponent(e.id);
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 8px; border-bottom:1px solid #E2E8F0; cursor:pointer;"
                         onclick="selectInterSetPoolExercise(decodeURIComponent('${safeId}'))">
                        <div>
                            <div style="font-size:12px; font-weight:800; color:#0F172A;">${escapeHTML(e.name)}</div>
                            <div style="font-size:10.5px; color:#475569;">${escapeHTML(e.muscle || '')}</div>
                        </div>
                        <span style="font-size:11px; font-weight:800; color:#0284C7;">Seç ➔</span>
                    </div>
                `;
            }).join('');
        }

        function selectCustomNamedInterSetExercise() {
            const input = document.getElementById('interSetSearchInput');
            const rawName = input ? input.value.trim() : '';
            if (!rawName) return;
            activeInterSetContext.selectedExercise = {
                id: 'custom_interset_' + rawName.toLocaleLowerCase('tr-TR').replace(/[^a-z0-9ğüşıöç]/g, '_'),
                name: rawName,
                muscle: 'Kondisyon, Tüm Vücut',
                category: 'conditioning',
                equipment: 'bodyweight'
            };
            const resBox = document.getElementById('interSetSearchResults');
            if (resBox) resBox.style.display = 'none';
            renderInterSetModalContent();
        }

        function selectInterSetPoolExercise(exId) {
            const dbEx = (typeof EXERCISES_DB !== 'undefined') ? EXERCISES_DB.find(e => e.id === exId) : null;
            if (!dbEx) return;
            const isTime = isExerciseTimeBased(dbEx);
            activeInterSetContext.selectedExercise = {
                id: dbEx.id,
                name: dbEx.name,
                muscle: dbEx.muscle || 'Kondisyon, Tüm Vücut',
                category: dbEx.category || 'conditioning',
                equipment: dbEx.equipment || 'bodyweight'
            };
            activeInterSetContext.metricType = isTime ? 'time' : 'reps';
            activeInterSetContext.value = isTime ? 45 : 15;
            const resBox = document.getElementById('interSetSearchResults');
            if (resBox) resBox.style.display = 'none';
            renderInterSetModalContent();
        }

        function setInterSetMetricType(type) {
            activeInterSetContext.metricType = (type === 'reps') ? 'reps' : 'time';
            activeInterSetContext.value = activeInterSetContext.metricType === 'time' ? 45 : 15;
            renderInterSetModalContent();
        }

        function setInterSetMetricValue(val) {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) {
                activeInterSetContext.value = num;
                renderInterSetModalContent();
            }
        }

        function onInterSetCustomValueInput(val) {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num > 0) {
                activeInterSetContext.value = num;
            }
        }

        function saveInterSetExercise(applyToAllGaps) {
            const { exId, setIdx, selectedExercise, metricType, value } = activeInterSetContext;
            if (!exId || !selectedExercise) return;
            const sets = activeWorkoutSetsData[exId] || [];
            if (sets.length < 2) return;

            const payload = {
                id: selectedExercise.id,
                name: selectedExercise.name,
                muscle: selectedExercise.muscle || 'Kondisyon, Tüm Vücut',
                category: selectedExercise.category || 'conditioning',
                equipment: selectedExercise.equipment || 'bodyweight',
                metricType: metricType === 'reps' ? 'reps' : 'time',
                value: Math.max(1, parseInt(value, 10) || 30),
                completed: false
            };

            if (applyToAllGaps) {
                for (let i = 0; i < sets.length - 1; i++) {
                    const prevDone = sets[i].interSet ? !!sets[i].interSet.completed : (i === setIdx);
                    const prevAt = (sets[i].interSet && sets[i].interSet.completedAt) ? sets[i].interSet.completedAt : (prevDone ? Date.now() : null);
                    sets[i].interSet = Object.assign({}, payload, { completed: prevDone, completedAt: prevAt });
                }
            } else if (sets[setIdx]) {
                sets[setIdx].interSet = Object.assign({}, payload, { completed: true, completedAt: Date.now() });
            }

            closeInterSetModal();
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            if (typeof showToast === 'function') {
                showToast(applyToAllGaps
                    ? `⚡ "${payload.name}" tüm set aralarına eklendi!`
                    : `⚡ "${payload.name}" Set ${setIdx + 1}-${setIdx + 2} arasına eklendi!`);
            }
        }

        function toggleInterSetCheck(exId, setIdx) {
            const sets = activeWorkoutSetsData[exId] || [];
            if (!sets[setIdx] || !sets[setIdx].interSet) return;
            sets[setIdx].interSet.completed = !sets[setIdx].interSet.completed;
            sets[setIdx].interSet.completedAt = sets[setIdx].interSet.completed ? Date.now() : null;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
            if (sets[setIdx].interSet.completed && typeof playAlertSound === 'function') {
                playAlertSound();
            }
        }

        function removeInterSetExercise(exId, setIdx) {
            const sets = activeWorkoutSetsData[exId] || [];
            if (!sets[setIdx] || !sets[setIdx].interSet) return;
            delete sets[setIdx].interSet;
            saveActiveWorkoutStateToStorage();
            renderActiveWorkout();
        }


        // REST TIMER LOGIC & ENHANCEMENTS
        function setTimerSecs(secs) {
            resetTimer(secs);
            startTimer();
        }

        function adjustTimerSecs(delta) {
            timerRemaining = Math.max(0, timerRemaining + delta);
            updateTimerDisplay();
            if (!isTimerRunning && timerRemaining > 0) {
                startTimer();
            }
        }

        function skipRestTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerRemaining = 0;
            updateTimerDisplay();
            const btn = document.getElementById('btnPlayPauseTimer');
            if (btn) btn.innerText = "▶ Başlat";
            const restBox = document.getElementById('hudRestBox');
            if (restBox) restBox.classList.remove('resting');
            playAlertSound();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }

        function resetTimer(secs) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerRemaining = secs;
            updateTimerDisplay();
            const btn = document.getElementById('btnPlayPauseTimer');
            if (btn) btn.innerText = "▶ Başlat";
            const restBox = document.getElementById('hudRestBox');
            if (restBox) restBox.classList.remove('resting');
        }

        function toggleTimer() {
            if (isTimerRunning) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                const btn = document.getElementById('btnPlayPauseTimer');
                if (btn) btn.innerText = "▶ Başlat";
                const restBox = document.getElementById('hudRestBox');
                if (restBox) restBox.classList.remove('resting');
            } else {
                startTimer();
            }
        }

        function startTimer() {
            clearInterval(timerInterval);
            isTimerRunning = true;
            const btn = document.getElementById('btnPlayPauseTimer');
            if (btn) btn.innerText = "⏸ Duraklat";
            const restBox = document.getElementById('hudRestBox');
            if (restBox) restBox.classList.add('resting');

            timerInterval = setInterval(() => {
                if (timerRemaining > 0) {
                    timerRemaining--;
                    updateTimerDisplay();

                    // Rhythmic countdown beeps on last 3 seconds
                    if (timerRemaining === 3) playCountdownBeep(520);
                    else if (timerRemaining === 2) playCountdownBeep(520);
                    else if (timerRemaining === 1) playCountdownBeep(660);

                } else {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    const btn = document.getElementById('btnPlayPauseTimer');
                    if (btn) btn.innerText = "▶ Başlat";
                    const restBox = document.getElementById('hudRestBox');
                    if (restBox) restBox.classList.remove('resting');
                    playAlertSound();
                    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100]);
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const mins = Math.floor(timerRemaining / 60);
            const secs = timerRemaining % 60;
            const str = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            const el = document.getElementById('timerDisplay');
            if (el) el.innerText = str;
        }

        function playCountdownBeep(freq = 600) {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.12);
            } catch(e) {}
        }

        function playAlertSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } catch(e) {}
        }

        // ==================== COMPLETE & LOG WORKOUT ====================
        function getSavedGymsList() {
            const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
            const defaultGyms = uid === 'usr_admin'
                ? ["Rodium", "Sports & More", "Samandağ", "MACFit", "FitStop"]
                : ["Spor Salonu", "MACFit"];
            try {
                const scopedKey = uid ? `celik_kodu_custom_gyms_${uid}` : 'celik_kodu_custom_gyms';
                const stored = localStorage.getItem(scopedKey) || (uid === 'usr_admin' ? localStorage.getItem('celik_kodu_custom_gyms') : null);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        parsed.forEach(g => {
                            if (g && typeof g === 'string' && !defaultGyms.includes(g)) {
                                defaultGyms.push(g);
                            }
                        });
                    }
                }
            } catch(e) {}
            return defaultGyms;
        }

        function saveCustomGym(gymName) {
            if (!gymName || typeof gymName !== 'string') return;
            const trimmed = gymName.trim();
            if (!trimmed) return;
            const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
            const defaultGyms = getSavedGymsList();
            try {
                const scopedKey = uid ? `celik_kodu_custom_gyms_${uid}` : 'celik_kodu_custom_gyms';
                let stored = [];
                const existing = localStorage.getItem(scopedKey);
                if (existing) stored = JSON.parse(existing) || [];
                if (!defaultGyms.includes(trimmed) && !stored.includes(trimmed)) {
                    stored.push(trimmed);
                    localStorage.setItem(scopedKey, JSON.stringify(stored));
                    if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(uid);
                }
            } catch(e) {}
        }

        function initCompleteModalLocation() {
            const gyms = getSavedGymsList();
            const gymSelect = document.getElementById('logGymSelect');
            if (gymSelect) {
                gymSelect.innerHTML = gyms.map(g => `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`).join('') +
                    `<option value="custom">✏️ Diğer / Yeni Salon Yaz...</option>`;
            }

            const uid = getActiveUserId();
            let lastLoc = null;
            try {
                const s = localStorage.getItem(`celik_kodu_last_location_${uid}`);
                if (s) lastLoc = JSON.parse(s);
            } catch(e) {}

            const locType = lastLoc?.type || 'salon';
            const locName = lastLoc?.name || 'Rodium';

            const locTypeEl = document.getElementById('logLocationType');
            if (locTypeEl) locTypeEl.value = locType;

            if (locType === 'salon' && gymSelect) {
                if (gyms.includes(locName)) {
                    gymSelect.value = locName;
                } else {
                    gymSelect.value = 'custom';
                }
            }

            const locNameEl = document.getElementById('logLocationName');
            if (locNameEl) locNameEl.value = locName;

            handleLocationTypeChange();
        }

        function handleLocationTypeChange() {
            const locTypeEl = document.getElementById('logLocationType');
            if (!locTypeEl) return;
            const locType = locTypeEl.value;
            const gymGroup = document.getElementById('gymSelectGroup');
            const customLabel = document.getElementById('gymCustomLabel');
            const locNameEl = document.getElementById('logLocationName');
            const gymSelect = document.getElementById('logGymSelect');

            if (locType === 'salon') {
                if (gymGroup) gymGroup.style.display = 'block';
                if (customLabel) customLabel.innerText = 'Salon / Konum Detayı (Örn: Rodium, Sports & More...)';
                if (gymSelect && gymSelect.value !== 'custom') {
                    locNameEl.value = gymSelect.value;
                } else if (!locNameEl.value || locNameEl.value === 'Ev' || locNameEl.value === 'Açık Hava / Park') {
                    locNameEl.value = 'Rodium';
                    if (gymSelect) gymSelect.value = 'Rodium';
                }
            } else if (locType === 'ev') {
                if (gymGroup) gymGroup.style.display = 'none';
                if (customLabel) customLabel.innerText = 'Ev Lokasyonu / Detay Notu';
                locNameEl.value = 'Ev';
            } else if (locType === 'acik_hava') {
                if (gymGroup) gymGroup.style.display = 'none';
                if (customLabel) customLabel.innerText = 'Açık Alan / Park İsmi';
                locNameEl.value = 'Açık Hava / Park';
            }
        }

        function handleGymSelectChange() {
            const gymSelect = document.getElementById('logGymSelect');
            const locNameEl = document.getElementById('logLocationName');
            if (!gymSelect || !locNameEl) return;

            if (gymSelect.value === 'custom') {
                locNameEl.value = '';
                locNameEl.placeholder = 'Yeni salon adını buraya yazınız...';
                locNameEl.focus();
            } else {
                locNameEl.value = gymSelect.value;
            }
        }

        function calculateWorkoutPRs(exerciseSummaries, uid) {
            let history = [];
            try {
                const raw = localStorage.getItem(`celik_kodu_history_${uid}`);
                if (raw) history = JSON.parse(raw) || [];
            } catch(e) {}

            const prs = [];
            exerciseSummaries.forEach(ex => {
                if (!ex || ex.completedCount === 0) return;
                if (isExerciseCardioMinutes(ex)) return;
                const isTime = isExerciseTimeBased(ex);
                const isBw = isExerciseBodyweight(ex);
                const completedSets = (ex.sets || []).filter(s => s.completed);
                if (completedSets.length === 0) return;

                if (isTime) {
                    const currentMaxSecs = Math.max(0, ...completedSets.map(s => parseInt(s.reps, 10) || 0));
                    if (currentMaxSecs <= 0) return;

                    let prevMaxSecs = 0;
                    history.forEach(log => {
                        if (!log.detailedExercises && !log.exercises) return;
                        const list = log.detailedExercises || log.exercises || [];
                        const prevEx = list.find(e => e.name === ex.name || (e.id && e.id === ex.id));
                        if (prevEx && Array.isArray(prevEx.sets)) {
                            prevEx.sets.filter(s => s.completed).forEach(s => {
                                const r = parseInt(s.reps, 10) || 0;
                                if (r > prevMaxSecs) prevMaxSecs = r;
                            });
                        }
                    });

                    if (prevMaxSecs > 0 && currentMaxSecs > prevMaxSecs) {
                        prs.push({
                            name: ex.name,
                            metricType: 'time',
                            newVal: `${currentMaxSecs} sn`,
                            oldVal: `${prevMaxSecs} sn`,
                            diff: `+${currentMaxSecs - prevMaxSecs} sn`
                        });
                    }
                } else if (isBw) {
                    const currentMaxWeight = Math.max(0, ...completedSets.map(s => parseFloat(s.weight) || 0));
                    const currentMaxReps = Math.max(0, ...completedSets.map(s => parseInt(s.reps, 10) || 0));

                    let prevMaxWeight = 0;
                    let prevMaxReps = 0;
                    history.forEach(log => {
                        if (!log.detailedExercises && !log.exercises) return;
                        const list = log.detailedExercises || log.exercises || [];
                        const prevEx = list.find(e => e.name === ex.name || (e.id && e.id === ex.id));
                        if (prevEx && Array.isArray(prevEx.sets)) {
                            prevEx.sets.filter(s => s.completed).forEach(s => {
                                const w = parseFloat(s.weight) || 0;
                                const r = parseInt(s.reps, 10) || 0;
                                if (w > prevMaxWeight) prevMaxWeight = w;
                                if (r > prevMaxReps) prevMaxReps = r;
                            });
                        }
                    });

                    if (currentMaxWeight > 0 && currentMaxWeight > prevMaxWeight) {
                        prs.push({
                            name: ex.name,
                            metricType: 'weight',
                            newVal: `BW +${currentMaxWeight} kg`,
                            oldVal: prevMaxWeight > 0 ? `BW +${prevMaxWeight} kg` : 'BW (Ek Yüksüz)',
                            diff: `+${Math.round((currentMaxWeight - prevMaxWeight) * 10) / 10} kg`
                        });
                    } else if (prevMaxReps > 0 && currentMaxReps > prevMaxReps) {
                        prs.push({
                            name: ex.name,
                            metricType: 'reps',
                            newVal: `${currentMaxReps} Tekrar`,
                            oldVal: `${prevMaxReps} Tekrar`,
                            diff: `+${currentMaxReps - prevMaxReps} Tk`
                        });
                    }
                } else {
                    const currentMaxWeight = Math.max(0, ...completedSets.map(s => parseFloat(s.weight) || 0));
                    if (currentMaxWeight <= 0) return;

                    let previousAllTimeMax = 0;
                    history.forEach(log => {
                        if (!log.detailedExercises && !log.exercises) return;
                        const list = log.detailedExercises || log.exercises || [];
                        const prevEx = list.find(e => e.name === ex.name || (e.id && e.id === ex.id));
                        if (prevEx && prevEx.maxWeight && prevEx.maxWeight > previousAllTimeMax) {
                            previousAllTimeMax = prevEx.maxWeight;
                        }
                    });

                    if (previousAllTimeMax > 0 && currentMaxWeight > previousAllTimeMax) {
                        prs.push({
                            name: ex.name,
                            metricType: 'weight',
                            newVal: `${currentMaxWeight} kg`,
                            oldVal: `${previousAllTimeMax} kg`,
                            diff: `+${Math.round((currentMaxWeight - previousAllTimeMax) * 10) / 10} kg`
                        });
                    }
                }
            });
            return prs;
        }

        function cancelActiveWorkoutFromModal() {
            closeScheduleDayModal();
            cancelActiveWorkout();
        }

        function cancelActiveWorkout() {
            const user = getActiveUser();
            const uid = user ? user.id : 'default';
            const hasActive = activeWorkoutSession || localStorage.getItem(`celik_kodu_active_state_${uid}`);
            if (!hasActive) {
                alert("Aktif bir antrenman bulunmuyor.");
                return;
            }
            const ok = confirm("Antrenmanı iptal etmek istediğinize emin misiniz?\n\nBu seans sonlandırılacak ve yapılan ilerlemeler günlüğe kaydedilmeyecektir.");
            if (!ok) return;

            localStorage.removeItem(`celik_kodu_active_state_${uid}`);
            if (typeof workoutTimerInterval !== 'undefined') clearInterval(workoutTimerInterval);
            if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
            activeWorkoutSession = null;
            activeWorkoutStartTime = null;
            activeWorkoutIsPaused = false;
            activeWorkoutPausedAt = null;
            activeWorkoutTotalPausedMs = 0;
            activeWorkoutSetsData = {};
            activeFocusExIndex = 0;
            activeFocusSetIndex = null;
            if (typeof releaseWakeLock === 'function') releaseWakeLock();

            if (typeof closeCompleteModal === 'function') closeCompleteModal();
            if (typeof closeScheduleDayModal === 'function') closeScheduleDayModal();
            if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
            alert("Antrenman iptal edildi.");
        }

        function openCompleteModal() {
            if (!activeWorkoutSession) {
                try {
                    const uid = getActiveUserId();
                    const raw = localStorage.getItem(`celik_kodu_active_state_${uid}`);
                    if (raw) {
                        const state = JSON.parse(raw);
                        if (state && state.session) {
                            activeWorkoutSession = state.session;
                            if (state.setsData) activeWorkoutSetsData = state.setsData;
                            if (state.startTime) activeWorkoutStartTime = state.startTime;
                        }
                    }
                } catch(e) {}
            }
            if (!activeWorkoutSession) {
                alert("Aktif bir antrenman bulunmuyor.");
                return;
            }
            const elapsedSecs = getWorkoutElapsedSeconds();
            const elapsedMins = Math.max(1, Math.round(elapsedSecs / 60));

            document.getElementById('logProgramName').value = activeWorkoutSession.title || 'Çelik Kodu Antrenmanı';
            document.getElementById('logDuration').value = elapsedMins;
            initCompleteModalLocation();

            // Summary stats & detailed exercise breakdown calculation
            let totalCompletedSets = 0;
            let totalReps = 0;
            let totalIsometricSecs = 0;
            let totalVolume = 0;

            const exerciseSummaries = activeWorkoutSession.exercises.map(ex => {
                const sets = activeWorkoutSetsData[ex.id] || [];
                const isBw = isExerciseBodyweight(ex);
                const isCardio = isExerciseCardioMinutes(ex);
                const isTime = isExerciseTimeBased(ex);
                let exVol = 0;
                let exCompletedSets = 0;
                const setSummaries = sets.map(st => {
                    const w = (st.weight !== '' && st.weight !== null && !isNaN(st.weight)) ? parseFloat(st.weight) : 0;
                    const r = (st.reps !== '' && st.reps !== null && !isNaN(st.reps)) ? parseInt(st.reps, 10) : 0;
                    const setVol = st.completed ? calculateExerciseSetVolume(ex, w, r) : 0;
                    if (st.completed) {
                        totalCompletedSets++;
                        exCompletedSets++;
                        if (isTime) {
                            totalIsometricSecs += r;
                        } else if (!isCardio) {
                            totalReps += r;
                        }
                        totalVolume += setVol;
                        exVol += setVol;
                    }
                    if (st.interSet && st.interSet.completed) {
                        const isExtraTime = st.interSet.metricType === 'time';
                        const extraVal = parseInt(st.interSet.value, 10) || 0;
                        const extraVol = calculateExerciseSetVolume({ id: st.interSet.id, equipment: st.interSet.equipment || 'bodyweight' }, 0, extraVal);
                        totalCompletedSets++;
                        exCompletedSets++;
                        if (isExtraTime) {
                            totalIsometricSecs += extraVal;
                        } else {
                            totalReps += extraVal;
                        }
                        totalVolume += extraVol;
                        exVol += extraVol;
                    }
                    return {
                        setNo: st.setNo,
                        weight: w,
                        reps: r,
                        isBodyweight: isBw,
                        isTimeBased: isTime,
                        completed: st.completed,
                        interSet: st.interSet || null
                    };
                });

                return {
                    id: ex.id,
                    name: ex.name,
                    muscle: ex.muscle ? ex.muscle.split(',')[0].trim() : '',
                    equipment: ex.equipment,
                    isBodyweight: isBw,
                    isTimeBased: isTime,
                    sets: setSummaries,
                    volume: Math.round(exVol),
                    completedCount: exCompletedSets
                };
            });

            const uid = getActiveUserId();
            const prs = calculateWorkoutPRs(exerciseSummaries, uid);

            const summaryHint = document.getElementById('logWorkoutSummaryHint');
            if (summaryHint) {
                summaryHint.innerHTML = `
                    <div style="background:#F8FAFC; border: 1.5px solid var(--gold); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #E2E8F0; padding-bottom:8px;">
                            <span style="font-size:11px; font-weight:800; color:var(--gold); text-transform:uppercase; letter-spacing:0.5px;">📋 Seans Özeti & Performans</span>
                            <span style="font-size:12px; font-weight:800; color:#0F172A;">⏱️ ${formatSecondsToHMS(elapsedSecs)}</span>
                        </div>

                        ${prs.length > 0 ? `
                            <div class="pr-celebration-banner">
                                <div style="font-size:12.5px; font-weight:900; color:var(--gold); display:flex; align-items:center; gap:6px;">
                                    🔥 BU SEANSTA YENİ REKOR(LAR) KIRDIN!
                                </div>
                                ${prs.map(p => `
                                    <div class="pr-badge-item">
                                        🏆 <strong>${escapeHTML(p.name)}:</strong> Yeni Zirve: <strong style="color:#0F172A;">${escapeHTML(p.newVal || `${p.newWeight} kg`)}</strong> (Eski: ${escapeHTML(p.oldVal || `${p.oldWeight} kg`)} ➔ <strong style="color:var(--green-success);">${escapeHTML(p.diff)}</strong>)
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <!-- TOP STATS -->
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px; margin-bottom:12px; text-align:center;">
                            <div style="background:var(--bg-elevated); padding:8px 4px; border-radius:6px; border:1px solid var(--border);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">TOPLAM İŞ / TONAJ</div>
                                <div style="font-size:14px; font-weight:900; color:var(--gold); margin-top:2px;">🏋️ ${Math.round(totalVolume).toLocaleString('tr-TR')} kg</div>
                            </div>
                            <div style="background:var(--bg-elevated); padding:8px 4px; border-radius:6px; border:1px solid var(--border);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">SET SAYISI</div>
                                <div style="font-size:14px; font-weight:900; color:var(--green-success); margin-top:2px;">✅ ${totalCompletedSets} Set</div>
                            </div>
                            <div style="background:var(--bg-elevated); padding:8px 4px; border-radius:6px; border:1px solid var(--border);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">${totalIsometricSecs > 0 ? 'TEKRAR / TUT' : 'TOPLAM TEKRAR'}</div>
                                <div style="font-size:14px; font-weight:900; color:var(--cyan); margin-top:2px;">🎯 ${totalReps} Tk ${totalIsometricSecs > 0 ? `• ⏱️ ${totalIsometricSecs}s` : ''}</div>
                            </div>
                        </div>

                        <!-- EXERCISES & SETS BREAKDOWN -->
                        <div style="font-size:11px; font-weight:800; color:var(--text-secondary); margin-bottom:6px; text-transform:uppercase;">
                            Yapılan Hareketler, Kilo & Tekrarlar:
                        </div>
                        <div style="max-height: 220px; overflow-y: auto; padding-right: 4px; display:flex; flex-direction:column; gap:6px;">
                            ${exerciseSummaries.map(ex => `
                                <div style="background:#F8FAFC; border-radius: 6px; padding: 8px 10px; border-left: 3px solid ${ex.completedCount > 0 ? 'var(--green-success)' : 'var(--border)'};">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <div>
                                            <strong style="color:#0F172A; font-size:12.5px;">${escapeHTML(ex.name)}</strong>
                                            ${ex.muscle ? `<span style="font-size:10.5px; color:var(--cyan); margin-left:6px;">[${escapeHTML(ex.muscle)}]</span>` : ''}
                                        </div>
                                        <span style="font-size:11px; font-weight:800; color:var(--gold);">
                                            ${ex.volume > 0 ? `${Math.round(ex.volume).toLocaleString('tr-TR')} kg` : ''}
                                        </span>
                                    </div>
                                    <div style="display:flex; flex-wrap:wrap; gap:4px;">
                                        ${ex.sets.map(st => {
                                            const mainSetBadge = st.completed ? (isExerciseCardioMinutes(ex) ? `
                                                <span style="background:rgba(2, 132, 199, 0.12); border:1px solid rgba(2, 132, 199, 0.4); color:#0369A1; border-radius:4px; padding:2px 6px; font-size:10.5px; font-weight:700;">
                                                    Kardiyo: ${formatSetMetricDisplay(ex, st.reps)} ✓
                                                </span>
                                            ` : `
                                                <span style="background:rgba(34, 197, 94, 0.12); border:1px solid rgba(34, 197, 94, 0.4); color:#15803D; border-radius:4px; padding:2px 6px; font-size:10.5px; font-weight:700;">
                                                    Set ${st.setNo}: <strong>${formatSetWeightDisplay(ex.isBodyweight, st.weight)}</strong> × ${formatSetMetricDisplay(ex, st.reps)} ✓
                                                </span>
                                            `) : `
                                                <span style="background:rgba(239, 68, 68, 0.08); border:1px dashed rgba(239, 68, 68, 0.3); color:#DC2626; opacity:0.65; border-radius:4px; padding:2px 6px; font-size:10.5px; font-weight:600; text-decoration:line-through;" title="Bitir butonuna basılmadı">
                                                    Set ${st.setNo}: Atlandı
                                                </span>
                                            `;
                                            const interBadge = (st.interSet && st.interSet.completed) ? `
                                                <span style="background:rgba(2, 132, 199, 0.12); border:1px solid rgba(2, 132, 199, 0.4); color:#0369A1; border-radius:4px; padding:2px 6px; font-size:10.5px; font-weight:800;">
                                                    ⚡ Set ${st.setNo}-${st.setNo + 1} Arası: ${escapeHTML(st.interSet.name)} × ${st.interSet.value} ${st.interSet.metricType === 'time' ? 'sn' : 'tk'} ✓
                                                </span>
                                            ` : '';
                                            return mainSetBadge + interBadge;
                                        }).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            document.getElementById('completeModal').classList.add('active');
        }

        function closeCompleteModal() {
            document.getElementById('completeModal').classList.remove('active');
        }

        function saveCompletedWorkout() {
            if (!activeWorkoutSession) return;

            const programNameInput = document.getElementById('logProgramName');
            const programName = (programNameInput && programNameInput.value.trim()) ? programNameInput.value.trim() : (activeWorkoutSession.title || 'Çelik Kodu Antrenmanı');
            const duration = parseInt(document.getElementById('logDuration').value) || Math.max(1, Math.round(getWorkoutElapsedSeconds() / 60));
            const rpe = document.getElementById('logRpe').value;
            const notes = document.getElementById('logNotes').value;
            const elapsedSecs = getWorkoutElapsedSeconds();

            const locTypeEl = document.getElementById('logLocationType');
            const locType = locTypeEl ? locTypeEl.value : 'salon';
            const locNameEl = document.getElementById('logLocationName');
            let locName = (locNameEl && locNameEl.value.trim()) ? locNameEl.value.trim() : (locType === 'salon' ? 'Spor Salonu' : (locType === 'ev' ? 'Ev' : 'Açık Hava'));

            if (locType === 'salon' && locName && locName !== 'Spor Salonu') {
                saveCustomGym(locName);
            }

            const uid = getActiveUserId();
            try {
                localStorage.setItem(`celik_kodu_last_location_${uid}`, JSON.stringify({ type: locType, name: locName }));
            } catch(e) {}

            let totalVolume = 0;
            let totalCompletedSets = 0;
            let totalCompletedReps = 0;
            let totalIsometricSeconds = 0;
            const allMuscles = [];
            const interSetAggMap = {};

            const detailedExercises = activeWorkoutSession.exercises.map(ex => {
                const isBw = isExerciseBodyweight(ex);
                const isTime = isExerciseTimeBased(ex);
                const isCardio = isExerciseCardioMinutes(ex);

                const sets = (activeWorkoutSetsData[ex.id] || []).map(st => {
                    const isDone = !!st.completed;
                    const w = (st.weight !== '' && st.weight !== null && !isNaN(st.weight)) ? parseFloat(st.weight) : 0;
                    const r = (st.reps !== '' && st.reps !== null && !isNaN(st.reps)) ? parseInt(st.reps, 10) : 0;
                    const setVol = isDone ? calculateExerciseSetVolume(ex, w, r) : 0;

                    if (isDone) {
                        totalCompletedSets++;
                        if (isTime) {
                            totalIsometricSeconds += r;
                        } else if (!isCardio) {
                            totalCompletedReps += r;
                        }
                        totalVolume += setVol;
                    }

                    if (st.interSet && st.interSet.completed) {
                        const extra = st.interSet;
                        const isExtraTime = extra.metricType === 'time';
                        const extraVal = parseInt(extra.value, 10) || 0;
                        const extraVol = calculateExerciseSetVolume({ id: extra.id, equipment: extra.equipment || 'bodyweight' }, 0, extraVal);
                        totalCompletedSets++;
                        if (isExtraTime) {
                            totalIsometricSeconds += extraVal;
                        } else {
                            totalCompletedReps += extraVal;
                        }
                        totalVolume += extraVol;

                        const key = extra.id || extra.name;
                        if (!interSetAggMap[key]) {
                            interSetAggMap[key] = {
                                id: extra.id || key,
                                name: `${extra.name} (Set Arası)`,
                                equipment: extra.equipment || 'bodyweight',
                                category: extra.category || 'conditioning',
                                muscle: extra.muscle || 'Kondisyon, Tüm Vücut',
                                cue: 'Set arası aktif dinlenme / ilave hareket.',
                                isBodyweight: (extra.equipment || 'bodyweight') === 'bodyweight',
                                isTimeBased: isExtraTime,
                                isInterSetExtra: true,
                                sets: []
                            };
                        }
                        interSetAggMap[key].sets.push({
                            setNo: interSetAggMap[key].sets.length + 1,
                            weight: 0,
                            reps: extraVal,
                            isBodyweight: (extra.equipment || 'bodyweight') === 'bodyweight',
                            isTimeBased: isExtraTime,
                            completed: true,
                            completedAt: extra.completedAt || st.completedAt || null,
                            volume: Math.round(extraVol)
                        });
                    }

                    return {
                        setNo: st.setNo,
                        weight: isDone ? w : 0,
                        reps: isDone ? r : 0,
                        isBodyweight: isBw,
                        isTimeBased: isTime,
                        isCardioMinutes: isCardio,
                        completed: isDone,
                        completedAt: isDone ? (st.completedAt || null) : null,
                        volume: isDone ? Math.round(setVol) : 0,
                        interSet: st.interSet || null
                    };
                });

                const completedSets = sets.filter(st => st.completed);

                // Only credit muscle groups if at least one set of this exercise was actually completed
                if (completedSets.length > 0 && ex.muscle) {
                    ex.muscle.split(',').forEach(m => {
                        const trimmed = m.trim();
                        if (trimmed && !allMuscles.includes(trimmed)) {
                            allMuscles.push(trimmed);
                        }
                    });
                }

                const pairedBest = pickBestPairedSet(ex, completedSets);
                const topWorkingSet = pickSessionTopWorkingSet(ex, completedSets);
                const maxWeight = (!isCardio && pairedBest) ? (Number(pairedBest.weight) || 0) : 0;
                const maxReps = pairedBest ? (parseInt(pairedBest.reps, 10) || 0) : 0;
                const exVolume = completedSets.reduce((sum, st) => sum + st.volume, 0);
                if (!isCardio && topWorkingSet && Number(topWorkingSet.weight) > 0) {
                    rememberExerciseWeight(ex.id, ex.name, topWorkingSet.weight);
                }

                return {
                    id: ex.id,
                    name: ex.name,
                    equipment: ex.equipment,
                    category: ex.category,
                    muscle: ex.muscle,
                    cue: ex.cue || '',
                    isBodyweight: isBw,
                    isTimeBased: isTime,
                    isCardioMinutes: isCardio,
                    sets: sets,
                    completedSetsCount: completedSets.length,
                    maxWeight: maxWeight,
                    maxReps: maxReps,
                    exerciseVolume: Math.round(exVolume)
                };
            });

            Object.values(interSetAggMap).forEach(extraEx => {
                if (extraEx.muscle) {
                    extraEx.muscle.split(',').forEach(m => {
                        const trimmed = m.trim();
                        if (trimmed && !allMuscles.includes(trimmed)) {
                            allMuscles.push(trimmed);
                        }
                    });
                }
                const maxReps = extraEx.sets.length > 0 ? Math.max(0, ...extraEx.sets.map(st => st.reps)) : 0;
                const exVolume = extraEx.sets.reduce((sum, st) => sum + st.volume, 0);
                detailedExercises.push({
                    id: extraEx.id,
                    name: extraEx.name,
                    equipment: extraEx.equipment,
                    category: extraEx.category,
                    muscle: extraEx.muscle,
                    cue: extraEx.cue,
                    isBodyweight: extraEx.isBodyweight,
                    isTimeBased: extraEx.isTimeBased,
                    isInterSetExtra: true,
                    sets: extraEx.sets,
                    completedSetsCount: extraEx.sets.length,
                    maxWeight: 0,
                    maxReps: maxReps,
                    exerciseVolume: Math.round(exVolume)
                });
            });

            const newLog = {
                id: 'log_' + Date.now(),
                date: toLocalYmdString(new Date()),
                dateFormatted: new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
                program: programName,
                locationType: locType,
                locationName: locName,
                duration: duration,
                durationFormatted: formatSecondsToHMS(elapsedSecs),
                durationSecs: elapsedSecs,
                rpe: rpe,
                notes: notes,
                totalVolumeKg: Math.round(totalVolume * 10) / 10,
                totalSetsCompleted: totalCompletedSets,
                totalRepsCompleted: totalCompletedReps,
                totalIsometricSecsCompleted: totalIsometricSeconds,
                muscleGroups: allMuscles,
                exercises: detailedExercises,
                timestamp: Date.now()
            };

            const liaisonLog = (window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.inspectOutgoingCompletedSession === 'function')
                ? window.CelikLiaisonSubChiefs.inspectOutgoingCompletedSession(newLog)
                : newLog;
            const logs = getWorkoutLogs();
            logs.unshift(liaisonLog);
            setWorkoutLogs(logs);

            // Clear active workout session state
            localStorage.removeItem(`celik_kodu_active_state_${uid}`);
            clearInterval(workoutTimerInterval);
            clearInterval(timerInterval);
            activeWorkoutSession = null;
            activeWorkoutStartTime = null;
            activeWorkoutSetsData = {};
            activeFocusExIndex = 0;
            activeFocusSetIndex = null;
            releaseWakeLock();

            closeCompleteModal();
            renderActiveWorkout();
            renderHistory();
            switchTab('historyTab');

            playAlertSound();
            alert(`🎉 TEBRİKLER ŞAMPİYON!

${duration} dakikada toplam ${Math.round(totalVolume).toLocaleString('tr-TR')} kg tonaj kaldırıldı.
Antrenman tüm setler, kilolar ve çalışan kas gruplarıyla günlüğe kaydedildi!`);
        }


        // ==================== WEEKLY SCHEDULE & PERIODIZATION ====================


        let activePlannerWeek = 'current'; // 'current' | 'next'

        function switchPlannerWeek(week) {
            activePlannerWeek = week;
            if (typeof renderActiveWorkout === 'function') {
                renderActiveWorkout();
            }
        }

        function getDefaultWeeklySchedule() {
            return {
                1: { id: 'rest', title: '🧘 Dinlenme', type: 'rest', desc: 'Dinlenme & Toparlanma', rest: true },
                2: { id: 'rest', title: '🧘 Dinlenme', type: 'rest', desc: 'Dinlenme & Toparlanma', rest: true },
                3: { id: 'rest', title: '🧘 Dinlenme', type: 'rest', desc: 'Dinlenme & Toparlanma', rest: true },
                4: { id: 'rest', title: '🧘 Dinlenme', type: 'rest', desc: 'Dinlenme & Toparlanma', rest: true },
                5: { id: 'rest', title: '🧘 Dinlenme', type: 'rest', desc: 'Dinlenme & Toparlanma', rest: true },
                6: { id: 'rest', title: '🧘 Dinlenme', type: 'rest', desc: 'Dinlenme & Toparlanma', rest: true },
                0: { id: 'rest', title: '🧘 Dinlenme', type: 'rest', desc: 'Dinlenme & Toparlanma', rest: true }
            };
        }

        function getWeeklySchedule(targetUid) {
            const user = getActiveUser();
            const uid = targetUid || (user ? user.id : null) || (window.CelikLiaisonSubChiefs && window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid ? window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid() : 'default');
            const key = `celik_kodu_weekly_schedule_${uid}`;
            try {
                const raw = localStorage.getItem(key);
                if (raw) return JSON.parse(raw);
            } catch(e) {}
            const def = getDefaultWeeklySchedule();
            try { localStorage.setItem(key, JSON.stringify(def)); } catch(e) {}
            return def;
        }

        function stripScheduleUpdatedAtForCmp(slot) {
            if (!slot || typeof slot !== 'object') return slot;
            const copy = Object.assign({}, slot);
            delete copy.updatedAt;
            delete copy._explicitCardioUpdate;
            return copy;
        }

        function persistWeeklyScheduleSlotSet(key, schedule, uid) {
            try {
                let prevSchedule = null;
                try {
                    const rawPrev = localStorage.getItem(key);
                    if (rawPrev) prevSchedule = JSON.parse(rawPrev);
                } catch (_) {}
                const nowTs = Date.now();
                if (schedule && typeof schedule === 'object') {
                    [0, 1, 2, 3, 4, 5, 6].forEach(d => {
                        const slot = schedule[d];
                        if (!slot || typeof slot !== 'object') return;
                        const prevSlot = prevSchedule && prevSchedule[d];
                        if (slot._explicitCardioUpdate) {
                            delete slot._explicitCardioUpdate;
                            slot.updatedAt = nowTs;
                            return;
                        }
                        const prevCardio = (prevSlot && Array.isArray(prevSlot.extraCardioSessions)) ? prevSlot.extraCardioSessions : [];
                        const currCardio = Array.isArray(slot.extraCardioSessions) ? slot.extraCardioSessions : [];
                        if (prevCardio.length > 0 || currCardio.length > 0) {
                            slot.extraCardioSessions = mergeExtraCardioSessions(prevCardio, currCardio);
                        }
                        const changed = !prevSlot || JSON.stringify(stripScheduleUpdatedAtForCmp(prevSlot)) !== JSON.stringify(stripScheduleUpdatedAtForCmp(slot));
                        if (changed || !slot.updatedAt) {
                            slot.updatedAt = nowTs;
                        }
                    });
                }
                localStorage.setItem(key, JSON.stringify(schedule));
                if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(uid);
            } catch(e) {}
        }

        function mergeExtraCardioSessions(listA, listB) {
            const map = new Map();
            const addAll = (arr) => {
                if (!Array.isArray(arr)) return;
                arr.forEach(item => {
                    if (!item || !item.id) return;
                    const prev = map.get(item.id);
                    if (!prev || Number(item.addedAt || 0) >= Number(prev.addedAt || 0)) {
                        map.set(item.id, Object.assign({}, item));
                    }
                });
            };
            addAll(listA);
            addAll(listB);
            return Array.from(map.values());
        }

        function saveWeeklySchedule(schedule, targetUid) {
            const user = getActiveUser();
            const uid = targetUid || (user ? user.id : null) || (window.CelikLiaisonSubChiefs && window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid ? window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid() : 'default');
            persistWeeklyScheduleSlotSet(`celik_kodu_weekly_schedule_${uid}`, schedule, uid);
        }

        // ==================== GELECEK HAFTA & AI REÇETE KÖPRÜSÜ ====================
        function getNextWeeklySchedule(targetUid) {
            const user = getActiveUser();
            const uid = targetUid || (user ? user.id : 'default');
            const key = `celik_kodu_next_weekly_schedule_${uid}`;
            try {
                const raw = localStorage.getItem(key);
                if (raw) return JSON.parse(raw);
            } catch(e) {}
            const def = getDefaultWeeklySchedule();
            try { localStorage.setItem(key, JSON.stringify(def)); } catch(e) {}
            return def;
        }

        function saveNextWeeklySchedule(schedule, targetUid) {
            const user = getActiveUser();
            const uid = targetUid || (user ? user.id : 'default');
            persistWeeklyScheduleSlotSet(`celik_kodu_next_weekly_schedule_${uid}`, schedule, uid);
        }

        function promoteNextWeekToCurrent(targetUid) {
            const user = getActiveUser();
            const uid = targetUid || (user ? user.id : 'default');
            try {
                const nextSchedule = getNextWeeklySchedule(uid);
                saveWeeklySchedule(nextSchedule, uid);

                // AI Program bayrağını "uygulandı" olarak güncelle
                const aiRaw = localStorage.getItem(`celik_kodu_ai_program_${uid}`);
                if (aiRaw) {
                    const aiData = JSON.parse(aiRaw);
                    aiData.applied = true;
                    aiData.dismissed = true;
                    localStorage.setItem(`celik_kodu_ai_program_${uid}`, JSON.stringify(aiData));
                }

                activePlannerWeek = 'current';
                if (typeof renderActiveWorkout === 'function') {
                    renderActiveWorkout();
                }

                if (typeof showSystemNotice === 'function') {
                    showSystemNotice("🎉 Harika!", "Gelecek hafta için hazırlanan program başarıyla aktif haftalık antrenman planınız yapıldı.");
                } else {
                    alert("🎉 Harika! Gelecek hafta programı başarıyla aktif haftalık antrenman planınız yapıldı.");
                }
            } catch(e) {
                console.error("Gelecek hafta aktarılırken hata:", e);
            }
        }

        function parseMarkdownProgramClient(text) {
            if (!text) return [];
            
            // GÜN, SEANS, DAY, ANTRENMAN veya gün isimleri yakalama
            const dayRegex = /(?:^|\n)(?:#{1,4}\s*|\*{0,2})(?:[0-9]\.\s*)?(GÜN\s*[0-9A-ZÇĞİÖŞÜ]+|SEANS\s*[0-9A-ZÇĞİÖŞÜ]+|DAY\s*[0-9A-Z]+|ANTRENMAN\s*[0-9A-ZÇĞİÖŞÜ]+|PAZARTESİ|SALI|ÇARŞAMBA|PERŞEMBE|CUMA|CUMARTESİ|PAZAR)[^\n]*/gi;
            
            const matches = [];
            let match;
            while ((match = dayRegex.exec(text)) !== null) {
                const fullTitle = match[0].trim().replace(/^#+\s*/, '').replace(/\*+/g, '');
                const lower = fullTitle.toLowerCase();
                // Hacim/değişim/özet tablolarını gün olarak algılamayı engelle
                if (!lower.includes('hacim') && !lower.includes('özet') && !lower.includes('tablo') && !lower.includes('değişim')) {
                    matches.push({ title: fullTitle, index: match.index });
                }
            }

            const extractExercisesFromBlock = (block) => {
                const list = [];
                const lines = block.split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
                        const lower = trimmed.toLowerCase();
                        if (lower.includes('egzersiz') || lower.includes('hareket') || lower.includes('kas grubu')) continue;
                        const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
                        if (cells.length >= 3) {
                            const rawName = cells[0].replace(/\*+/g, '').trim();
                            const sets = parseInt(cells[2]) || 3;
                            const reps = cells[3] || '8-12';
                            const note = cells[cells.length - 1] || '';
                            list.push({
                                name: rawName,
                                targetSets: sets,
                                targetReps: reps,
                                note: note
                            });
                        }
                    } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                        const bulletMatch = trimmed.match(/^[-*]\s*\*{0,2}(.*?)\*{0,2}\s*:\s*(.*)/);
                        if (bulletMatch && !bulletMatch[1].toLowerCase().includes('hacim')) {
                            list.push({
                                name: bulletMatch[1].trim(),
                                targetSets: 3,
                                targetReps: '8-12',
                                note: bulletMatch[2].trim()
                            });
                        }
                    }
                }
                return list;
            };

            if (matches.length === 0) {
                // Fallback: search for any generic ### or #### header
                const genericHeaderRegex = /(?:^|\n)(#{3,4}\s+[^\n]+)/g;
                let gMatch;
                while ((gMatch = genericHeaderRegex.exec(text)) !== null) {
                    const title = gMatch[1].replace(/^#+\s*/, '').trim();
                    const lower = title.toLowerCase();
                    if (!lower.includes('hacim') && !lower.includes('özet') && !lower.includes('reçete')) {
                        matches.push({ title: title, index: gMatch.index });
                    }
                }
            }

            if (matches.length === 0) {
                return [{ dayTitle: 'FitLAB AI Antrenmanı', exercises: extractExercisesFromBlock(text) }];
            }

            const days = [];
            for (let i = 0; i < matches.length; i++) {
                const start = matches[i].index;
                const end = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
                const block = text.substring(start, end);
                const exercises = extractExercisesFromBlock(block);
                if (exercises.length > 0) {
                    days.push({
                        dayTitle: matches[i].title,
                        exercises: exercises
                    });
                }
            }

            if (days.length === 0) {
                return [{ dayTitle: 'FitLAB AI Antrenmanı', exercises: extractExercisesFromBlock(text) }];
            }

            return days;
        }

        function normalizeExerciseName(str) {
            if (!str) return '';
            return String(str).toLowerCase()
                .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
                .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
                .replace(/[()]/g, ' ')
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function findBestExerciseMatch(rawName, customCatalog) {
            if (!rawName) return null;
            const catalog = customCatalog || (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : []);
            if (!Array.isArray(catalog) || catalog.length === 0) return null;

            let cleanRaw = String(rawName).replace(/\*+/g, '').trim();
            if (cleanRaw.toLowerCase().startsWith('ai_')) {
                cleanRaw = cleanRaw.substring(3).replace(/_/g, ' ');
            }

            const exerciseAliases = {
                'pullup': 'bw_pullup', 'pull up': 'bw_pullup', 'pull-up': 'bw_pullup', 'barfiks': 'bw_pullup',
                'chinup': 'bw_chinup', 'chin up': 'bw_chinup', 'chin-up': 'bw_chinup', 'ters barfiks': 'bw_chinup',
                'pushup': 'bw_pushup', 'push up': 'bw_pushup', 'push-up': 'bw_pushup', 'sinav': 'bw_pushup', 'şınav': 'bw_pushup',
                'dips': 'bw_dips', 'dip': 'bw_dips',
                'burpee': 'bw_burpee',
                'deadlift': 'bb_deadlift', 'barbell deadlift': 'bb_deadlift',
                'rdl': 'db_rdl', 'romanian deadlift': 'db_rdl',
                'swing': 'kb_swing', 'kettlebell swing': 'kb_swing', 'dambıl swing': 'db_swing',
                'saw row': 'db_saw_row', 'dambıl saw row': 'db_saw_row',
                'farmers walk': 'db_farmers_walk', 'farmer walk': 'db_farmers_walk', "farmer's walk": 'db_farmers_walk',
                'bench press': 'bb_bench_press', 'incline bench': 'bb_incline_bench',
                'overhead press': 'db_overhead_press', 'shoulder press': 'db_overhead_press',
                'goblet squat': 'db_goblet_squat', 'front squat': 'db_front_squat', 'back squat': 'bb_back_squat',
                'bulgarian split squat': 'db_bulgarian_squat', 'walking lunge': 'db_walking_lunge'
            };

            const lowerClean = cleanRaw.toLowerCase();
            const compactClean = lowerClean.replace(/[^a-z0-9]/g, '');

            if (exerciseAliases[lowerClean]) {
                const found = catalog.find(e => e.id === exerciseAliases[lowerClean]);
                if (found) return found;
            }
            if (exerciseAliases[compactClean]) {
                const found = catalog.find(e => e.id === exerciseAliases[compactClean]);
                if (found) return found;
            }

            // Stripped prefix ID match (e.g. 'pullup' matches 'bw_pullup')
            let match = catalog.find(e => e.id.replace(/^(bw|db|bb|kb|mach)_/, '').replace(/_/g, '') === compactClean);
            if (match) return match;

            // 1. Doğrudan ID veya İsim Eşleşmesi
            match = catalog.find(e => e.id === cleanRaw || (e.name && e.name.toLowerCase() === lowerClean));
            if (match) return match;

            const normRaw = normalizeExerciseName(cleanRaw);
            // 2. Normalleştirilmiş isim eşleşmesi
            match = catalog.find(e => normalizeExerciseName(e.name) === normRaw);
            if (match) return match;

            // 3. Kelime/Token skoru eşleşmesi
            const rawTokens = normRaw.split(' ').filter(t => t.length >= 3);
            let bestMatch = null;
            let maxScore = 0;

            for (const ex of catalog) {
                const normEx = normalizeExerciseName(ex.name) + ' ' + (ex.id || '').replace(/_/g, ' ');
                let score = 0;
                for (const token of rawTokens) {
                    if (normEx.includes(token)) {
                        score += (token.length > 4 ? 2 : 1);
                    }
                }
                if (score > maxScore && score >= 1) {
                    maxScore = score;
                    bestMatch = ex;
                }
            }
            return bestMatch;
        }

        function resolveDaySlot(dayTitle, dayIndex, totalDays) {
            const slotMap = { 1: [1], 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] };
            const defaultSlots = slotMap[totalDays] || [1, 2, 3, 4, 5, 6, 0];
            let slot = defaultSlots[dayIndex] !== undefined ? defaultSlots[dayIndex] : (dayIndex + 1);

            const title = (dayTitle || '').toLowerCase();

            // 1. Açık GÜN 1..7 / DAY 1..7 / SEANS 1..7 tespiti
            const numMatch = title.match(/(?:gün|seans|day|antrenman)\s*([1-7])/i);
            if (numMatch) {
                const num = parseInt(numMatch[1], 10);
                if (num >= 1 && num <= totalDays) {
                    return defaultSlots[num - 1] !== undefined ? defaultSlots[num - 1] : slot;
                }
            }
            const letterMatch = title.match(/seans\s*([a-c])/i);
            if (letterMatch) {
                const charCode = letterMatch[1].charCodeAt(0) - 97;
                if (charCode >= 0 && charCode < totalDays) {
                    return defaultSlots[charCode] !== undefined ? defaultSlots[charCode] : slot;
                }
            }

            // 2. Katı kelime sınırı kontrolü (hipertrofi içindeki 'per' veya aksiyel içindeki 'sal' asla gün tetiklemez!)
            if (/\b(pazartesi|pzt)\b/i.test(title)) return 1;
            if (/\b(salı|sal)\b/i.test(title)) return 2;
            if (/\b(çarşamba|çar)\b/i.test(title)) return 3;
            if (/\b(perşembe|per)\b/i.test(title)) return 4;
            if (/\b(cuma|cum)\b/i.test(title) && !title.includes('cumartesi')) return 5;
            if (/\b(cumartesi|cmt)\b/i.test(title)) return 6;
            if (/\b(pazar|paz)\b/i.test(title) && !title.includes('pazartesi')) return 0;

            return slot;
        }

        function convertParsedDaysToWeeklySchedule(parsedDays) {
            const schedule = {
                1: { id: 'rest', title: '🧘 Dinlenme & Aktif Toparlanma', type: 'rest', rest: true, desc: 'Hafif yürüyüş, esneme veya tam istirahat' },
                2: { id: 'rest', title: '🧘 Dinlenme & Mobilite', type: 'rest', rest: true, desc: 'Eklem mobilizasyonu, masaj rulosu' },
                3: { id: 'rest', title: '🧘 Dinlenme & Aktif Toparlanma', type: 'rest', rest: true, desc: 'Hafif yürüyüş, esneme veya tam istirahat' },
                4: { id: 'rest', title: '🧘 Dinlenme & Mobilite', type: 'rest', rest: true, desc: 'Eklem mobilizasyonu, masaj rulosu' },
                5: { id: 'rest', title: '🧘 Dinlenme & Aktif Toparlanma', type: 'rest', rest: true, desc: 'Hafif yürüyüş, esneme veya tam istirahat' },
                6: { id: 'rest', title: '🧘 Serbest Kardiyo / Core', type: 'rest', rest: true, desc: '30 dk tempolu yürüyüş, bisiklet veya karın' },
                0: { id: 'rest', title: '🧘 Tam Dinlenme & Zihinsel Hazırlık', type: 'rest', rest: true, desc: 'Yeni haftaya kasları ve sinir sistemini dinlendirme' }
            };
            if (!Array.isArray(parsedDays) || parsedDays.length === 0) return schedule;

            const occupiedSlots = new Set();
            parsedDays.forEach((pDay, idx) => {
                let slot = resolveDaySlot(pDay.dayTitle, idx, parsedDays.length);
                if (occupiedSlots.has(slot)) {
                    const fallbackOrder = [1, 3, 5, 2, 4, 6, 0];
                    const nextFree = fallbackOrder.find(s => !occupiedSlots.has(s));
                    if (nextFree !== undefined) slot = nextFree;
                }
                occupiedSlots.add(slot);

                // Her egzersizi EXERCISES_DB kütüphanesiyle zenginleştir ve garantili benzersiz ID/hareket ailesi bağla
                const dayUsedIds = [];
                const dayUsedFamilies = new Set();
                const enrichedExercises = (pDay.exercises || []).map((rawEx, eIdx) => {
                    const rawName = (rawEx.name || '').replace(/\*+/g, '').trim();
                    let matchedDb = findBestExerciseMatch(rawName);
                    const sets = rawEx.targetSets || rawEx.sets || 3;
                    const reps = rawEx.targetReps || rawEx.reps || '8-12';
                    const note = rawEx.note || rawEx.cue || '';

                    if (matchedDb && (dayUsedIds.includes(matchedDb.id) || isExerciseExcludedByUser(matchedDb.id))) {
                        // Aynı günde birebir aynı hareket ID'si tekrar ediyorsa aynı alt bölgeden farklı bir hareketle ikame et
                        const targetSubKey = (typeof EXERCISE_ANATOMY_MAP !== 'undefined' && EXERCISE_ANATOMY_MAP[matchedDb.id])
                            ? EXERCISE_ANATOMY_MAP[matchedDb.id].subKey
                            : null;
                        const altPool = EXERCISES_DB.filter(e =>
                            !isExerciseExcludedByUser(e.id) &&
                            !dayUsedIds.includes(e.id) &&
                            !dayUsedFamilies.has(getExerciseMovementFamily(e)) &&
                            e.category === matchedDb.category &&
                            (!targetSubKey || (typeof EXERCISE_ANATOMY_MAP !== 'undefined' && EXERCISE_ANATOMY_MAP[e.id] && EXERCISE_ANATOMY_MAP[e.id].subKey === targetSubKey))
                        );
                        if (altPool.length > 0) {
                            matchedDb = altPool[0];
                        }
                    }

                    if (matchedDb) {
                        dayUsedIds.push(matchedDb.id);
                        dayUsedFamilies.add(getExerciseMovementFamily(matchedDb));
                        return Object.assign({}, matchedDb, {
                            id: matchedDb.id,
                            name: matchedDb.name,
                            originalAiName: rawName,
                            targetSets: sets,
                            targetReps: reps,
                            note: note,
                            cue: note ? (note + (matchedDb.cue ? ' • ' + matchedDb.cue : '')) : (matchedDb.cue || '')
                        });
                    }

                    const slugId = 'ai_' + (rawName || ('ex_' + eIdx)).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '_' + eIdx;
                    dayUsedIds.push(slugId);
                    return {
                        id: slugId,
                        name: rawName || 'Özel Hipertrofi Hareketi',
                        originalAiName: rawName,
                        targetSets: sets,
                        targetReps: reps,
                        note: note,
                        muscle: rawEx.muscle || 'Genel Kas Gelişimi & Fonksiyonel Güç',
                        primaryMuscles: ['full_body'],
                        equipment: 'dumbbell',
                        cue: note || 'FitLAB AI Koçu tarafından sporcuya özel reçete edilen hareket.',
                        isCustomAi: true
                    };
                });

                const exNames = enrichedExercises.map(e => e.name).join(' • ');
                schedule[slot] = {
                    id: 'fitlab_ai_day_' + slot,
                    title: '🔬 ' + (pDay.dayTitle || ('Gün ' + (idx + 1))),
                    desc: exNames || 'FitLAB AI Hipertrofi Bloğu',
                    type: 'custom_ai',
                    rest: false,
                    source: 'FitLAB AI',
                    exercises: enrichedExercises
                };
            });
            return schedule;
        }

        function getFitLabIncomingProgramHtml(uid) {
            if (!uid) return '';
            try {
                const raw = localStorage.getItem(`celik_kodu_ai_program_${uid}`);
                if (!raw) return '';
                const prog = JSON.parse(raw);
                if (!prog || !prog.active || prog.dismissed || prog.applied) return '';

                let shortSummary = 'FitLAB masaüstü istasyonundan sizin için optimize edilmiş yeni bir antrenman bloğu gönderildi.';
                if (prog.programText) {
                    const lines = prog.programText.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('|'));
                    if (lines.length > 0) {
                        shortSummary = lines[0].replace(/\*+/g, '').substring(0, 180) + '...';
                    }
                }

                const isExpanded = !!localStorage.getItem(`celik_kodu_incoming_prog_expanded_${uid}`);
                const todayIdx = new Date().getDay();

                return `
                    <div class="collapsible-panel ${isExpanded ? 'open' : ''}" id="incomingProgramPanel_${uid}">
                        <div class="collapsible-panel-header" onclick="toggleIncomingProgramPanel('${uid}')">
                            <div class="collapsible-panel-title">
                                <span class="icon">💻</span>
                                <span class="text">FitLAB • Yeni Masaüstü Programı</span>
                            </div>
                            <div class="collapsible-panel-meta">
                                <span class="collapsible-panel-badge">Yeni Reçete</span>
                                <span class="collapsible-panel-arrow">▼</span>
                            </div>
                        </div>
                        <div class="collapsible-panel-body">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:8px;">
                                <h3 style="font-size:13.5px; font-weight:800; color:#0F172A; margin:0;">${escapeHTML(prog.title || 'Gelecek Hafta İçin AI Reçetesi Hazır')}</h3>
                                <button type="button" onclick="dismissFitLabProgram('${uid}')" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:14px; padding:2px 6px;" title="Bildirimi Kapat">✕</button>
                            </div>
                            <p style="font-size:12px; color:#475569; line-height:1.5; margin:0 0 12px; background:#F8FAFC; padding:8px 10px; border-radius:8px; border:1px solid #E2E8F0;">
                                <strong>Koç Analizi:</strong> ${escapeHTML(shortSummary)}
                            </p>
                            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                <button type="button" class="btn btn-gold" style="font-size:12px; padding:10px 14px; font-weight:900; flex:1; box-shadow:0 0 15px rgba(245,158,11,0.3);" onclick="assignIncomingProgramToToday('${uid}')">
                                    🔥 BU PROGRAMI BUGÜNE (${DAY_NAMES_TR[todayIdx].toUpperCase()}) ATA & BAŞLAT
                                </button>
                                <button type="button" class="btn btn-outline" style="font-size:11.5px; padding:8px 12px; font-weight:700; border-color:var(--cyan); color:var(--cyan);" onclick="viewIncomingFitLabProgram('${uid}')">
                                    👁️ Takvimde İncele & Güne Planla
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } catch(e) {
                return '';
            }
        }

        function toggleIncomingProgramPanel(uid) {
            const panel = document.getElementById(`incomingProgramPanel_${uid}`);
            if (!panel) return;
            const isOpen = panel.classList.toggle('open');
            if (isOpen) {
                localStorage.setItem(`celik_kodu_incoming_prog_expanded_${uid}`, '1');
            } else {
                localStorage.removeItem(`celik_kodu_incoming_prog_expanded_${uid}`);
            }
        }

        function dismissFitLabProgram(uid) {
            try {
                const raw = localStorage.getItem(`celik_kodu_ai_program_${uid}`);
                if (raw) {
                    const prog = JSON.parse(raw);
                    prog.dismissed = true;
                    localStorage.setItem(`celik_kodu_ai_program_${uid}`, JSON.stringify(prog));
                    if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
                }
            } catch(e) {}
        }

        function assignIncomingProgramToToday(targetUid) {
            const user = getActiveUser();
            const uid = targetUid || (user ? user.id : 'default');
            try {
                const aiRaw = localStorage.getItem(`celik_kodu_ai_program_${uid}`);
                if (!aiRaw) {
                    showToast("⚠️ FitLAB programı bulunamadı.");
                    return;
                }
                const aiData = JSON.parse(aiRaw);
                let days = Array.isArray(aiData.structuredDays) && aiData.structuredDays.length > 0 ? aiData.structuredDays : null;
                if (!days) {
                    days = parseMarkdownProgramClient(aiData.programText);
                }
                if (!Array.isArray(days) || days.length === 0) {
                    showToast("⚠️ Program içerisinde geçerli bir antrenman günü bulunamadı.");
                    return;
                }

                const firstDay = days[0];
                const todayIdx = new Date().getDay();
                const todayName = DAY_NAMES_TR[todayIdx];
                const exercisesList = (firstDay.exercises || []).map(item => {
                    let matched = null;
                    if (typeof EXERCISES_DB !== 'undefined') {
                        const cleanN = (item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                        matched = EXERCISES_DB.find(e => (e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanN));
                    }
                    return {
                        id: matched ? matched.id : ('gen_' + Math.random().toString(36).substring(2, 8)),
                        name: matched ? matched.name : (item.name || 'Özel Egzersiz'),
                        category: matched ? matched.category : 'dumbbell',
                        equipment: matched ? matched.equipment : 'Dambıl',
                        targetSets: item.targetSets || 3,
                        targetReps: item.targetReps || '8-12',
                        note: item.note || ''
                    };
                });

                const workoutObj = {
                    id: 'fitlab_prog_' + Date.now(),
                    title: firstDay.dayTitle || aiData.title || 'FitLAB Özel Antrenmanı',
                    split: 'custom',
                    splitName: firstDay.dayTitle || aiData.title,
                    duration: Math.round(exercisesList.length * 7),
                    exercises: exercisesList,
                    createdAt: Date.now(),
                    isCustom: true
                };

                const schedule = getWeeklySchedule();
                schedule[todayIdx] = {
                    id: workoutObj.id,
                    title: workoutObj.title,
                    type: 'custom_saved',
                    desc: `${exercisesList.length} Hareket • ${workoutObj.duration} Dk`,
                    rest: false,
                    customWorkout: workoutObj,
                    exercises: exercisesList
                };
                saveWeeklySchedule(schedule);

                const todayDate = new Date();
                const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
                if (todayYMD && typeof saveDateScheduleOverride === 'function') {
                    saveDateScheduleOverride(todayYMD, schedule[todayIdx], uid);
                }
                activePlannerWeek = 'current';

                aiData.applied = true;
                aiData.dismissed = true;
                localStorage.setItem(`celik_kodu_ai_program_${uid}`, JSON.stringify(aiData));

                renderActiveWorkout();
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                playAlertSound();
                showToast(`🔥 "${workoutObj.title}" bugüne (${todayName}) başarıyla atandı! Hemen seansı başlatabilirsiniz.`);
            } catch(e) {
                console.error("assignIncomingProgramToToday hatası:", e);
                showToast("⚠️ Program atanırken hata oluştu.");
            }
        }

        function viewIncomingFitLabProgram(uid) {
            switchPlannerWeek('next');
            const sec = document.querySelector('.weekly-planner-section');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        }

        // ==================== UNIVERSAL WORKOUT PLAN RESOLVER ====================
        function saveAthletesToStorage() {
            try {
                const users = getAuthUsers();
                if (typeof saveAuthUsers === 'function') {
                    saveAuthUsers(users);
                } else {
                    localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
                }
            } catch(e) {}
        }

        function getWorkoutDetailsForPlan(plan) {
            if (!plan || plan.rest) return null;

            const normalizeExerciseItem = (e) => {
                if (!e) return null;
                if (typeof e === 'string') {
                    e = { name: e, sets: 3, reps: '8-12' };
                }
                const exId = e.id || e.exId;
                let dbEx = EXERCISES_DB.find(x => x.id === exId);
                if (!dbEx && (e.name || exId)) {
                    dbEx = findBestExerciseMatch(e.name || exId);
                }
                const resolvedId = (dbEx ? dbEx.id : exId) || ('ai_' + (e.name || 'ex').toLowerCase().replace(/[^a-z0-9]+/g, '_'));
                return Object.assign({}, dbEx || e, {
                    id: resolvedId,
                    name: (dbEx ? dbEx.name : e.name) || 'Egzersiz',
                    originalAiName: e.originalAiName || e.name,
                    targetSets: e.targetSets || e.sets || 3,
                    targetReps: e.targetReps || e.reps || '8-12',
                    note: e.note || e.cue || '',
                    cue: e.note || e.cue || (dbEx ? dbEx.cue : ''),
                    isAiConsecutiveBalanced: Boolean(e.isAiConsecutiveBalanced),
                    aiReplacedFrom: e.aiReplacedFrom || null,
                    aiRevisionNote: e.aiRevisionNote || null,
                    logs: e.logs || []
                });
            };

            const normalizeWorkout = (w) => {
                if (!w) return null;
                const clone = Object.assign({}, w);
                if (Array.isArray(clone.exercises)) {
                    clone.exercises = clone.exercises.map(normalizeExerciseItem).filter(Boolean);
                }
                return clone;
            };

            // 1. Directly attached custom workout object (ignore legacy auto-synthesized ghost workouts)
            if (plan.customWorkout && !plan.customWorkout.isSynthesized && Array.isArray(plan.customWorkout.exercises) && plan.customWorkout.exercises.length > 0) {
                return normalizeWorkout(plan.customWorkout);
            }

            // 2. Direct exercises array on plan
            if (!plan.isSynthesized && Array.isArray(plan.exercises) && plan.exercises.length > 0) {
                return normalizeWorkout(plan);
            }

            const planId = (plan.id || '').trim();
            const planTitle = (plan.title || '').trim().toLowerCase();

            // FitLAB AI plan lookup from schedule
            if (planId.startsWith('fitlab_ai_day_')) {
                const slot = parseInt(planId.replace('fitlab_ai_day_', ''), 10);
                const nextSched = typeof getNextWeeklySchedule === 'function' ? getNextWeeklySchedule() : null;
                if (nextSched && nextSched[slot] && Array.isArray(nextSched[slot].exercises) && nextSched[slot].exercises.length > 0) {
                    return normalizeWorkout(nextSched[slot]);
                }
                const currSched = typeof getWeeklySchedule === 'function' ? getWeeklySchedule() : null;
                if (currSched && currSched[slot] && Array.isArray(currSched[slot].exercises) && currSched[slot].exercises.length > 0) {
                    return normalizeWorkout(currSched[slot]);
                }
            }

            // 3. Search ONLY active user's custom programs FIRST (respecting deletion tombstones)
            try {
                const activeUid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                if (activeUid && typeof getUserCustomPrograms === 'function') {
                    const saved = getUserCustomPrograms(activeUid);
                    if (Array.isArray(saved)) {
                        let found = saved.find(p => p && p.id === planId);
                        if (found && Array.isArray(found.exercises) && found.exercises.length > 0) return normalizeWorkout(found);
                        if (planTitle) {
                            found = saved.find(p => p && p.title && p.title.trim().toLowerCase() === planTitle);
                            if (found && Array.isArray(found.exercises) && found.exercises.length > 0) return normalizeWorkout(found);
                        }
                    }
                }
            } catch(e) {}

            // 4. Search ONLY active user's savedWorkouts (respecting deletion tombstones)
            try {
                const activeUid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                const deletedSet = activeUid && typeof getDeletedCustomProgramIds === 'function'
                    ? new Set(getDeletedCustomProgramIds(activeUid))
                    : new Set();
                const u = typeof getActiveUser === 'function' ? getActiveUser() : null;
                if (u && Array.isArray(u.savedWorkouts)) {
                    let found = u.savedWorkouts.find(p => p && p.id === planId && !deletedSet.has(p.id));
                    if (found && Array.isArray(found.exercises) && found.exercises.length > 0) return normalizeWorkout(found);
                    if (planTitle) {
                        found = u.savedWorkouts.find(p => p && !deletedSet.has(p.id) && p.title && p.title.trim().toLowerCase() === planTitle);
                        if (found && Array.isArray(found.exercises) && found.exercises.length > 0) return normalizeWorkout(found);
                    }
                }
            } catch(e) {}

            // 5. Currently generated workout in memory
            if (currentGeneratedWorkout && Array.isArray(currentGeneratedWorkout.exercises) && currentGeneratedWorkout.exercises.length > 0) {
                if (currentGeneratedWorkout.id === planId || planId.startsWith('gen_') || (planTitle && currentGeneratedWorkout.title && currentGeneratedWorkout.title.toLowerCase().includes(planTitle))) {
                    return currentGeneratedWorkout;
                }
            }

            // 6. Last generated workout persisted for active user in localStorage
            try {
                const activeUid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                const scopedKey = activeUid ? `celik_kodu_last_generated_workout_${activeUid}` : 'celik_kodu_last_generated_workout';
                const rawLastGen = (activeUid && localStorage.getItem(scopedKey)) || localStorage.getItem('celik_kodu_last_generated_workout');
                if (rawLastGen) {
                    const lastGen = JSON.parse(rawLastGen);
                    const ownerOk = !lastGen?.userId || !activeUid || lastGen.userId === activeUid;
                    if (ownerOk && lastGen && Array.isArray(lastGen.exercises) && lastGen.exercises.length > 0) {
                        if (lastGen.id === planId || planId.startsWith('gen_') || plan.type === 'custom_generated' || (planTitle && lastGen.title && lastGen.title.toLowerCase().includes(planTitle))) {
                            return lastGen;
                        }
                    }
                }
            } catch(e) {}

            // 7. Official classic routines
            const officialRoutines = {
                la_forja_day1: {
                    id: 'la_forja_day1',
                    title: '⚔️ Çelik Kodu Gün 1: Omuz & Bacak Ön Zırhı',
                    split: 'upper_push',
                    style: 'superset',
                    duration: 45,
                    scheme: { sets: 4, reps: '8 - 10', rest: 45 },
                    exerciseIds: ['db_overhead_press', 'db_goblet_squat', 'db_front_squat', 'bw_pushup', 'kb_halo', 'bw_hollow_body']
                },
                la_forja_day2: {
                    id: 'la_forja_day2',
                    title: '⚔️ Çelik Kodu Gün 2: Sırt Çekiş & Balistik Güç',
                    split: 'upper_pull',
                    style: 'superset',
                    duration: 45,
                    scheme: { sets: 4, reps: '8 - 10', rest: 45 },
                    exerciseIds: ['db_saw_row', 'db_rdl', 'db_swing', 'bw_pullup', 'db_farmers_walk', 'db_russian_twist']
                },
                la_forja_day3: {
                    id: 'la_forja_day3',
                    title: '⚔️ Çelik Kodu Gün 3: Kompleks & Merdiven',
                    split: 'full_body',
                    style: 'superset',
                    duration: 50,
                    scheme: { sets: 4, reps: '8 - 10', rest: 45 },
                    exerciseIds: ['db_snatch', 'db_walking_lunge', 'db_saw_row', 'db_front_squat', 'bw_burpee']
                }
            };

            const buildOfficial = (off) => {
                const exercises = off.exerciseIds.map(id => EXERCISES_DB.find(e => e.id === id)).filter(Boolean);
                return {
                    id: off.id,
                    title: off.title,
                    split: off.split,
                    style: off.style,
                    duration: off.duration,
                    scheme: off.scheme,
                    exercises: exercises,
                    isOfficial: true
                };
            };

            if (officialRoutines[planId]) {
                return buildOfficial(officialRoutines[planId]);
            }

            // 8. If customRoutineState has exercises and matches
            if (typeof customRoutineState !== 'undefined' && Array.isArray(customRoutineState.exercises) && customRoutineState.exercises.length > 0) {
                const studioList = customRoutineState.exercises.map(item => {
                    const ex = EXERCISES_DB.find(e => e.id === item.exId);
                    return ex ? Object.assign({}, ex, { targetSets: item.sets, targetReps: item.reps }) : null;
                }).filter(Boolean);
                if (studioList.length > 0 && (planId.startsWith('custom_') || plan.type === 'custom' || plan.type === 'custom_saved')) {
                    return {
                        id: planId || ('custom_' + Date.now()),
                        title: plan.title || 'Özel Çelik Programı',
                        exercises: studioList,
                        duration: Math.round(studioList.length * 7),
                        scheme: { sets: 3, reps: '8-12', rest: customRoutineState.rest || 60 },
                        isCustom: true
                    };
                }
            }

            return null;
        }

        function startScheduledWorkoutForDay(dayIdx, targetDateStr = null) {
            const user = getActiveUser();
            const uid = user ? user.id : 'default';
            const todayDate = new Date();
            const todayIdx = todayDate.getDay();
            const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
            const effectiveDateStr = targetDateStr || (dayIdx === todayIdx ? todayYMD : null);

            let plan = null;
            if (effectiveDateStr && activePlannerWeek !== 'next' && typeof getPlanForDate === 'function') {
                plan = getPlanForDate(new Date(effectiveDateStr + 'T00:00:00'));
            }
            if (!plan) {
                const isNextWeek = activePlannerWeek === 'next';
                const schedule = isNextWeek ? getNextWeeklySchedule(uid) : getWeeklySchedule(uid);
                plan = schedule ? schedule[dayIdx] : null;
            }

            if (!plan || plan.rest) {
                openScheduleDayModal(dayIdx, effectiveDateStr);
                return;
            }

            const details = getWorkoutDetailsForPlan(plan);
            if (details && Array.isArray(details.exercises) && details.exercises.length > 0) {
                currentGeneratedWorkout = JSON.parse(JSON.stringify(details));
                currentGeneratedWorkout.scheduledDayIdx = dayIdx;
                currentGeneratedWorkout.scheduledIsNextWeek = Boolean(isNextWeek);
                currentGeneratedWorkout.scheduledDateStr = effectiveDateStr || null;
                startActiveWorkoutFromGenerated();
                return;
            }

            if (plan.type === 'official' || (plan.id && plan.id.startsWith('la_forja_'))) {
                loadOfficialRoutine(plan.id || 'la_forja_day1');
            } else if (plan.type === 'custom' || plan.type === 'custom_saved' || (plan.id && (plan.id.startsWith('saved_') || plan.type === 'custom'))) {
                loadSavedProgram(plan.id);
            } else if (plan.type === 'custom_generated' && plan.customWorkout) {
                currentGeneratedWorkout = JSON.parse(JSON.stringify(plan.customWorkout));
                currentGeneratedWorkout.scheduledDayIdx = dayIdx;
                currentGeneratedWorkout.scheduledIsNextWeek = Boolean(isNextWeek);
                currentGeneratedWorkout.scheduledDateStr = effectiveDateStr || null;
                startActiveWorkoutFromGenerated();
            } else {
                loadOfficialRoutine('la_forja_day1');
            }
        }

        let activeSchedulingDayIdx = null;
        let activeSchedulingDateStr = null;

        function openScheduleDayModal(dayIdx, targetDateStr = null) {
            if (!targetDateStr && typeof getWeekDaysMapForDateStr === 'function') {
                const { map: fallbackMap } = getWeekDaysMapForDateStr(null, 0);
                if (fallbackMap && fallbackMap[dayIdx]) {
                    targetDateStr = fallbackMap[dayIdx].dateYMD;
                }
            }
            activeSchedulingDayIdx = dayIdx;
            activeSchedulingDateStr = targetDateStr || null;
            window._schedModalMoveWeekOffset = 0;
            const modal = document.getElementById('scheduleDayModal');
            const dayTitle = document.getElementById('schedModalDayTitle');
            const dayBadge = document.getElementById('schedModalDayBadge');
            const assignedSection = document.getElementById('schedAssignedWorkoutSection');
            if (!modal) return;

            const dayName = DAY_NAMES_TR[dayIdx];
            const todayIdx = new Date().getDay();
            const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(new Date()) : '';
            const isToday = activeSchedulingDateStr ? (activeSchedulingDateStr === todayYMD) : (dayIdx === todayIdx);
            const isTomorrow = dayIdx === ((todayIdx + 1) % 7);

            let titleLabel = `${dayName} Günü Antrenman Planı`;
            if (activeSchedulingDateStr) {
                const parts = activeSchedulingDateStr.split('-');
                if (parts.length === 3) {
                    const mIdx = parseInt(parts[1], 10) - 1;
                    const mName = (typeof CAL_MONTH_NAMES_TR !== 'undefined' && CAL_MONTH_NAMES_TR[mIdx]) ? CAL_MONTH_NAMES_TR[mIdx] : '';
                    titleLabel = `${parseInt(parts[2], 10)} ${mName} (${dayName}) Planı`;
                }
            }

            const completedOnDate = (activeSchedulingDateStr && typeof getCompletedWorkoutsForDate === 'function')
                ? getCompletedWorkoutsForDate(new Date(activeSchedulingDateStr + 'T00:00:00'))
                : [];
            const hasCompletedSession = completedOnDate.length > 0;

            if (dayTitle) {
                dayTitle.innerText = hasCompletedSession
                    ? (activeSchedulingDateStr ? `${titleLabel.replace('Planı', '')} - Tamamlanan Seans` : `${dayName} - Tamamlanan Seans`)
                    : titleLabel;
            }
            if (dayBadge) {
                if (hasCompletedSession) {
                    dayBadge.innerText = '✅ SEANS TAMAMLANDI';
                    dayBadge.style.background = '#10b981';
                    dayBadge.style.color = '#000';
                } else {
                    dayBadge.innerText = isToday ? 'BUGÜNÜN PROGRAMI' : (isTomorrow ? 'YARINKİ PROGRAM' : 'HAFTALIK PLAN');
                    dayBadge.style.background = '';
                    dayBadge.style.color = '';
                }
            }
            const subDesc = document.getElementById('schedModalDaySubDesc');
            if (subDesc) {
                subDesc.innerText = hasCompletedSession
                    ? 'Bu tarihte başarıyla tamamlanan seansınızın hareketleri, setleri ve tonaj detayları aşağıda listelenmiştir.'
                    : 'Bu güne atanan antrenmanın içeriğini inceleyin veya düzenleyin.';
            }

            let currentPlan;
            if (activeSchedulingDateStr && typeof getPlanForDate === 'function') {
                currentPlan = getPlanForDate(new Date(activeSchedulingDateStr + 'T00:00:00'));
            } else {
                const schedule = activePlannerWeek === 'next' ? getNextWeeklySchedule() : getWeeklySchedule();
                currentPlan = schedule[dayIdx] || { id: 'rest', rest: true };
            }
            const workoutDetails = getWorkoutDetailsForPlan(currentPlan);

            if (typeof updateScheduleDayModalTimingCard === 'function') {
                updateScheduleDayModalTimingCard(dayIdx, currentPlan, workoutDetails);
            }

            // 1. RENDER ASSIGNED WORKOUT DETAILED CONTENT SECTION
            if (assignedSection) {
                // If there are completed workouts for this day, render the actual completed session details
                let completedCardsHtml = '';
                if (hasCompletedSession) {
                    completedCardsHtml = completedOnDate.map(cLog => {
                        const totalVol = cLog.totalVolumeKg ? `${Math.round(cLog.totalVolumeKg).toLocaleString('tr-TR')} kg` : 'Belirtilmedi';
                        const setsReps = cLog.totalSetsCompleted ? `${cLog.totalSetsCompleted} Set • ${cLog.totalRepsCompleted || 0} Tk` : '-';
                        const durStr = cLog.durationFormatted || (cLog.duration ? `${cLog.duration} Dk` : '-');
                        const rpeLabel = cLog.rpe ? (cLog.rpe.split(' ')[0] + ' ' + (cLog.rpe.split(' ')[1] || '')) : 'RPE 8';

                        const locType = cLog.locationType || (cLog.locationName === 'Ev' ? 'ev' : 'salon');
                        const locName = cLog.locationName || (locType === 'ev' ? 'Ev' : 'Spor Salonu');
                        const isEv = locType === 'ev';
                        const isPark = locType === 'acik_hava';
                        const locIcon = isEv ? '🏠' : (isPark ? '🌲' : '🏋️');

                        const exercises = cLog.exercises || [];
                        let exsHtml = '';
                        if (exercises.length === 0) {
                            exsHtml = `<div style="font-size:12px; color:var(--text-secondary); padding:8px 0; text-align:center;">Detaylı hareket kaydı bulunamadı.</div>`;
                        } else {
                            exsHtml = exercises.map(ex => {
                                const exName = escapeHTML(ex.name || 'Egzersiz');
                                const targetParam = encodeURIComponent(ex.id || ex.name || '');
                                const setsList = ex.sets || [];
                                return `
                                    <div class="log-exercise-item" style="background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:12px; padding:10px 12px; margin-bottom:8px; box-shadow:0 2px 8px rgba(15,23,42,0.04);">
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;">
                                            <div style="min-width:0; flex:1;">
                                                <strong class="log-ex-name" style="color:#0F172A; font-size:13px; font-weight:800; word-break:break-word;">${exName}</strong>
                                                <div style="font-size:11px; color:#64748B; margin-top:2px; font-weight:600;">
                                                    ${escapeHTML(ex.muscle ? ex.muscle.split(',')[0] : '')}${ex.exerciseVolume ? ` • ${Math.round(ex.exerciseVolume).toLocaleString('tr-TR')} kg` : ''}
                                                </div>
                                            </div>
                                            <button type="button" class="btn btn-outline" style="padding:4px 8px; font-size:11px; border-radius:6px; flex-shrink:0; font-weight:700;" onclick="openExerciseDetailModal(decodeURIComponent('${targetParam}'))" title="Hareket Rehberi">
                                                👁️ Rehber
                                            </button>
                                        </div>
                                        <div class="log-sets-summary" style="display:flex; flex-wrap:wrap; gap:4px;">
                                            ${setsList.map(st => st.completed ? `
                                                <span class="log-set-pill completed" style="background:rgba(34, 197, 94, 0.12); border:1px solid rgba(34, 197, 94, 0.4); color:#15803D; border-radius:5px; padding:3px 7px; font-size:11px; font-weight:700;">
                                                    S${st.setNo}: <strong style="color:#15803D;">${st.weight || 0}kg</strong> x ${st.reps || 0} ✓
                                                </span>
                                            ` : `
                                                <span class="log-set-pill" style="opacity:0.6; border:1px dashed #ef4444; color:#dc2626; border-radius:5px; padding:3px 7px; font-size:11px; text-decoration:line-through; font-weight:600;">
                                                    S${st.setNo}: Atlandı
                                                </span>
                                            `).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('');
                        }

                        return `
                            <div style="background:linear-gradient(135deg, #ECFDF5, #FFFFFF); border:1.5px solid #10B981; border-radius:14px; padding:14px; box-shadow:0 4px 14px rgba(16,185,129,0.12); margin-bottom:12px;">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:10px; border-bottom:1px solid rgba(16,185,129,0.25); padding-bottom:10px;">
                                    <div>
                                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                                            <span style="background:#10b981; color:#000; font-weight:900; font-size:9.5px; border-radius:4px; padding:2px 8px;">
                                                ✅ BU TARİHTE TAMAMLANAN SEANS
                                            </span>
                                            <span style="font-size:11px; color:#065F46; font-weight:700;">
                                                📅 ${escapeHTML(cLog.dateFormatted || cLog.date)}
                                            </span>
                                            <span style="background:rgba(217, 119, 6, 0.15); border:1px solid rgba(217, 119, 6, 0.4); color:#92400E; border-radius:4px; padding:2px 7px; font-size:10.5px; font-weight:700;">
                                                ${locIcon} ${escapeHTML(locName)}
                                            </span>
                                        </div>
                                        <h3 style="font-size:16px; font-weight:900; color:#0F172A; margin:4px 0 2px; line-height:1.3;">
                                            ${escapeHTML(cLog.program || 'Tamamlanan Antrenman')}
                                        </h3>
                                    </div>
                                    <span class="ex-badge badge-equip" style="flex-shrink:0;">${escapeHTML(rpeLabel)}</span>
                                </div>

                                <!-- STATS ROW -->
                                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px; margin-bottom:12px; text-align:center;">
                                    <div style="background:#FFFFFF; padding:8px 4px; border-radius:8px; border:1px solid #E2E8F0;">
                                        <div style="font-size:9.5px; color:#475569; font-weight:700;">TOPLAM TONAJ</div>
                                        <div style="font-size:13px; font-weight:900; color:#B45309; margin-top:2px;">🏋️ ${totalVol}</div>
                                    </div>
                                    <div style="background:#FFFFFF; padding:8px 4px; border-radius:8px; border:1px solid #E2E8F0;">
                                        <div style="font-size:9.5px; color:#475569; font-weight:700;">SET / TEKRAR</div>
                                        <div style="font-size:13px; font-weight:900; color:#15803D; margin-top:2px;">✅ ${setsReps}</div>
                                    </div>
                                    <div style="background:#FFFFFF; padding:8px 4px; border-radius:8px; border:1px solid #E2E8F0;">
                                        <div style="font-size:9.5px; color:#475569; font-weight:700;">SEANS SÜRESİ</div>
                                        <div style="font-size:13px; font-weight:900; color:#0369A1; margin-top:2px;">⏱️ ${durStr}</div>
                                    </div>
                                </div>

                                <!-- MUSCLES WORKED CHIPS -->
                                ${cLog.muscleGroups && cLog.muscleGroups.length > 0 ? `
                                    <div style="margin: 0 0 10px; display:flex; flex-wrap:wrap; gap:4px;">
                                        ${cLog.muscleGroups.map(m => `<span class="muscle-tag" style="font-size:10.5px; padding:2px 7px;">${escapeHTML(m)}</span>`).join('')}
                                    </div>
                                ` : ''}

                                <!-- COMPLETED EXERCISES & SETS -->
                                <div style="font-size:11.5px; font-weight:800; color:#065F46; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">
                                    🎯 Yapılan Egzersizler, Kilolar & Tekrarlar (${exercises.length} Hareket):
                                </div>
                                <div style="max-height: 280px; overflow-y: auto; padding-right: 4px; display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
                                    ${exsHtml}
                                </div>

                                ${cLog.notes ? `<div class="log-notes-box" style="margin-bottom:10px;">📝 ${escapeHTML(cLog.notes)}</div>` : ''}

                                <!-- ACTIONS BAR -->
                                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; border-top:1px solid rgba(16,185,129,0.25); padding-top:10px; flex-wrap:wrap;">
                                    <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 12px; color:#065F46; border-color:#10b981;" onclick="switchTab('historyTab'); closeScheduleDayModal();">
                                        📋 Tüm Geçmiş Günlüğünde Gör
                                    </button>
                                    <div style="display:flex; gap:6px; align-items:center;">
                                        <button type="button" class="btn-edit-log" onclick="editWorkoutLog(decodeURIComponent('${encodeURIComponent(cLog.id)}'))" title="Antrenmanı Düzenle">
                                            Düzenle
                                        </button>
                                        <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 10px; color:#DC2626; border-color:rgba(239,68,68,0.4);" onclick="deleteLogFromScheduleModal(decodeURIComponent('${encodeURIComponent(cLog.id)}'))">
                                            🗑️ Bu Seans Kaydını Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }

                // Render Template Plan Card (Sade & Nizami - Sıfır İç İçe Çerçeve)
                let templatePlanHtml = '';
                if (!currentPlan.rest) {
                    const details = workoutDetails || getWorkoutDetailsForPlan(currentPlan) || {};
                    const exercises = details.exercises || [];
                    const rawTitleStr = details.title || currentPlan.title || 'Atanmış Antrenman';
                    const cleanTitleStr = String(rawTitleStr)
                        .replace(/^⚔️\s*[^:]+:\s*/i, '')
                        .replace(/^BB-Dominant Hibrit\s*•\s*/i, '')
                        .replace(/\s*\([^)]*\)\s*/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim() || 'Antrenman Seansı';

                    if (dayTitle && !hasCompletedSession) {
                        dayTitle.innerText = cleanTitleStr;
                    }
                    if (dayBadge && !hasCompletedSession) {
                        dayBadge.innerText = `${titleLabel.replace(' Planı', '').toUpperCase()} • ${exercises.length} HAREKET`;
                    }
                    const hdrTimeLbl = document.getElementById('schedHeaderTimeLabel');
                    if (hdrTimeLbl) hdrTimeLbl.textContent = currentPlan.time || '18:30';

                    let exercisesHtml = '';
                    if (exercises.length === 0) {
                        exercisesHtml = `
                            <div style="text-align:center; padding:16px 12px; font-size:12px; color:#475569; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px;">
                                Bu programda henüz hareket yok.
                                <div style="margin-top:8px;">
                                    <button type="button" class="wk-btn-primary-compact" style="width:100%;" onclick="editProgramForDay(${dayIdx}, decodeURIComponent('${encodeURIComponent(activeSchedulingDateStr || '')}'))">
                                        + Hareket Ekle
                                    </button>
                                </div>
                            </div>
                        `;
                    } else {
                        exercisesHtml = exercises.map((ex, idx) => {
                            let dbEx = EXERCISES_DB.find(e => e.id === ex.id);
                            if (!dbEx && (ex.name || ex.id)) {
                                dbEx = findBestExerciseMatch(ex.name || ex.id);
                            }
                            const effectiveId = (dbEx ? dbEx.id : ex.id) || '';
                            const displayName = (ex.name && !ex.name.startsWith('ai_')) ? ex.name : (dbEx ? dbEx.name : (ex.name || 'Egzersiz'));
                            const exName = escapeHTML(displayName);
                            const targetExParam = encodeURIComponent(effectiveId || displayName);
                            const numStr = String(idx + 1).padStart(2, '0');

                            return `
                                <div class="stitch-sel-ex-row" style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:8px 10px;">
                                    <span class="stitch-sel-ex-num">${numStr}</span>
                                    <span class="stitch-sel-ex-name" onclick="openExerciseQuickInfoModal(decodeURIComponent('${targetExParam}'))" style="cursor:pointer;">${exName}</span>
                                    <button type="button" class="stitch-ex-swap-pill" onclick="openScheduleExerciseAlternativeModal(${dayIdx}, decodeURIComponent('${targetExParam}'), ${idx})" title="Alternatif Seç">Değiştir</button>
                                    <button type="button" class="wk-ex-i-btn" onclick="openExerciseQuickInfoModal(decodeURIComponent('${targetExParam}'))" title="Hareket Bilgisi">i</button>
                                </div>
                            `;
                        }).join('');
                    }

                    const moveDayPanelHtml = typeof buildSchedModalMoveDayPanelHtml === 'function'
                        ? buildSchedModalMoveDayPanelHtml(dayIdx, activeSchedulingDateStr)
                        : '';

                    templatePlanHtml = `
                        <div>
                            <!-- 2'Lİ KOMPAKT YÖNETİM BAR -->
                            <div class="stitch-sched-top-actions">
                                <button type="button" class="wk-chip-action highlight-orange" id="btnToggleSchedMoveStrip" onclick="toggleSchedMoveDayDrawer()">
                                    📅 Gün Değiştir
                                </button>
                                <button type="button" class="wk-chip-action" style="color:#B91C1C; border-color:#FECACA; background:#FEF2F2;" onclick="setDayAsRest()">
                                    🧘 Dinlenmeye Al
                                </button>
                            </div>

                            <!-- SADE 7 GÜNLÜK TAŞIMA ŞERİDİ (VARSAYILAN KAPALI) -->
                            ${moveDayPanelHtml}

                            <!-- HAREKET LİSTESİ -->
                            <div id="schedModalAssignedExList" style="display:flex; flex-direction:column; gap:6px; max-height:320px; overflow-y:auto; margin:8px 0 12px 0;">
                                ${exercisesHtml}
                            </div>

                            <!-- ALT ANA BAŞLAT BUTONU -->
                            <button type="button" class="wk-btn-primary-compact" style="width:100%;" onclick="closeScheduleDayModal(); startScheduledWorkoutForDay(${dayIdx}, decodeURIComponent('${encodeURIComponent(activeSchedulingDateStr || '')}'))">
                                ▶️ Seansı Başlat
                            </button>
                        </div>
                    `;
                } else {
                    templatePlanHtml = `
                        <div style="background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:12px; padding:18px; text-align:center;">
                            <div style="font-size:14px; font-weight:800; color:#0F172A;">${dayName} Günü Dinlenme</div>
                            <button type="button" class="wk-btn-primary-compact" style="margin-top:10px; width:100%;" onclick="editProgramForDay(${dayIdx}, decodeURIComponent('${encodeURIComponent(activeSchedulingDateStr || '')}'))">
                                + Başka Günden Buraya Taşı
                            </button>
                        </div>
                    `;
                }

                const hasCompletedFitnessOnDate = completedOnDate.some(cLog => {
                    const exs = Array.isArray(cLog && cLog.exercises) ? cLog.exercises : [];
                    if (exs.length === 0) return true;
                    return exs.some(ex => !/^cond_/.test(String(ex.id || ex.exId || '')));
                });

                if (hasCompletedSession && (hasCompletedFitnessOnDate || currentPlan.rest)) {
                    assignedSection.innerHTML = completedCardsHtml + `
                        <div style="margin-top:14px; border:1.5px dashed #CBD5E1; border-radius:12px; padding:10px 12px; background:#F8FAFC;">
                            <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleSchedModalTemplateAccordion()">
                                <div>
                                    <span style="font-size:12px; font-weight:800; color:#B45309; display:block;">
                                        📅 Bu Gün İçin Gelecek Şablon Planı
                                    </span>
                                    <span style="font-size:10.5px; color:#475569;">
                                        Haftalık rutin şablonunu ve atanan hareketleri inceleyin
                                    </span>
                                </div>
                                <span id="schedModalTemplateAccordionArrow" style="font-size:12px; color:#B45309; font-weight:800;">
                                    ▼ Göster
                                </span>
                            </div>
                            <div id="schedModalTemplateAccordionBody" style="display:none; margin-top:12px; border-top:1px solid #E2E8F0; padding-top:12px;">
                                ${templatePlanHtml}
                            </div>
                        </div>
                    `;
                } else if (hasCompletedSession) {
                    assignedSection.innerHTML = completedCardsHtml + `
                        <div style="margin-top:12px;">
                            ${templatePlanHtml}
                        </div>
                    `;
                } else {
                    assignedSection.innerHTML = templatePlanHtml;
                }
                if (currentPlan && Array.isArray(currentPlan.extraCardioSessions) && currentPlan.extraCardioSessions.length > 0) {
                    const extraHtml = currentPlan.extraCardioSessions.map(c => `
                        <div style="margin-top:10px; background:#F0F9FF; border:1.5px solid #0284C7; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                            <div>
                                <span style="font-size:9.5px; font-weight:900; background:#0369A1; color:#FFFFFF; padding:2px 7px; border-radius:4px;">
                                    🚣🏃 2. BAĞIMSIZ KARDİYO SEANSI • GARMIN fr945
                                </span>
                                <div style="font-size:14px; font-weight:900; color:#0F172A; margin-top:5px;">
                                    ${escapeHTML(c.name || 'Kardiyo Seansı')} • <span style="color:#0369A1;">⏱️ ${Number(c.durationMin || 20)} Dk</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:6px; align-items:center;">
                                <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 10px; font-weight:800; color:#FFFFFF; background:#0369A1; border-color:#0284C7;" onclick="closeScheduleDayModal(); startQuickWorkoutWithExercise('${c.id}')">
                                    ▶️ Başlat
                                </button>
                                <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 9px; font-weight:800; color:#B91C1C; border-color:#FCA5A5; background:#FFFFFF;" onclick="removeExtraCardioSessionFromDay(${dayIdx}, '${c.id}', decodeURIComponent('${encodeURIComponent(activeSchedulingDateStr || '')}'))" title="Bu kardiyo seansını kaldır">
                                    ✕ Kaldır
                                </button>
                            </div>
                        </div>
                    `).join('');
                    assignedSection.innerHTML += extraHtml;
                }
            }

            const timingSection = document.getElementById('schedDayTimingSection');
            if (timingSection) {
                timingSection.style.display = 'none';
            }
            modal.classList.add('active');
        }

        function toggleSchedTimingDrawer() {
            const timingSection = document.getElementById('schedDayTimingSection');
            if (!timingSection) return;
            timingSection.style.display = timingSection.style.display === 'none' ? 'block' : 'none';
        }

        function toggleSchedMoveDayDrawer() {
            const moveBox = document.getElementById('schedModalMoveDayBox');
            if (!moveBox) return;
            moveBox.style.display = moveBox.style.display === 'none' ? 'block' : 'none';
        }

        function toggleSchedModalTemplateAccordion() {
            const body = document.getElementById('schedModalTemplateAccordionBody');
            const arrow = document.getElementById('schedModalTemplateAccordionArrow');
            if (!body) return;
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'block' : 'none';
            if (arrow) arrow.textContent = isHidden ? '▲ Gizle' : '▼ Göster';
        }

        function deleteLogFromScheduleModal(id) {
            if (!confirm("Bu tamamlanan antrenman kaydını silmek istediğinize emin misiniz?")) return;
            deleteLog(id, true);
        }

        function closeScheduleDayModal() {
            const modal = document.getElementById('scheduleDayModal');
            if (modal) modal.classList.remove('active');
            activeSchedulingDayIdx = null;
            activeSchedulingDateStr = null;
        }

        function toggleSchedModalExerciseList() {
            const list = document.getElementById('schedModalAssignedExList');
            const btn = document.getElementById('schedModalExListToggleBtn');
            if (!list || !btn) return;
            const isHidden = list.style.display === 'none';
            list.style.display = isHidden ? 'flex' : 'none';
            btn.innerText = isHidden ? '👁️ Egzersizleri Gizle ▲' : '👁️ Egzersizleri Göster ▼';
        }

        function editProgramForDay(dayIdx, targetDateStr = null) {
            const modal = document.getElementById('scheduleDayModal');
            if (!modal || !modal.classList.contains('active')) {
                openScheduleDayModal(dayIdx, targetDateStr);
            }
            const moveBox = document.getElementById('schedModalMoveDayBox');
            if (moveBox) {
                moveBox.style.display = moveBox.style.display === 'none' ? 'block' : 'none';
            }
        }
        window.editProgramForDay = editProgramForDay;

        function getWeekDaysMapForDateStr(refDateStr = null, weekOffset = 0) {
            let baseDate = null;
            if (refDateStr && /^\d{4}-\d{2}-\d{2}$/.test(String(refDateStr).trim())) {
                baseDate = new Date(String(refDateStr).trim() + 'T00:00:00');
            } else if (typeof calendarScreenState !== 'undefined' && calendarScreenState.anchorDate) {
                baseDate = new Date(calendarScreenState.anchorDate);
            } else {
                baseDate = new Date();
            }
            baseDate.setHours(0, 0, 0, 0);
            const dow = baseDate.getDay();
            const diffToMon = (dow === 0 ? -6 : 1 - dow);
            const monday = new Date(baseDate);
            monday.setDate(baseDate.getDate() + diffToMon + (Number(weekOffset || 0) * 7));

            const map = {};
            const ordered = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                const dIdx = d.getDay();
                const dYMD = typeof formatDateYMD === 'function' ? formatDateYMD(d) : '';
                const item = { dayIdx: dIdx, dateObj: d, dateYMD: dYMD, isoOrder: i + 1 };
                map[dIdx] = item;
                ordered.push(item);
            }
            return { map, ordered };
        }

        function isScheduleDayActiveOrCompleted(dayItem, isNextWeek = false, scheduleObj = null) {
            if (!dayItem) return false;
            if (!isNextWeek && typeof getCompletedWorkoutsForDate === 'function') {
                const logs = getCompletedWorkoutsForDate(dayItem.dateObj);
                if (Array.isArray(logs) && logs.length > 0) return true;
            }
            let plan = null;
            if (!isNextWeek && typeof getPlanForDate === 'function') {
                plan = getPlanForDate(dayItem.dateObj);
            } else if (scheduleObj && scheduleObj[dayItem.dayIdx]) {
                plan = scheduleObj[dayItem.dayIdx];
            }
            return Boolean(plan && !plan.rest && plan.type !== 'rest');
        }

        function buildSchedModalMoveDayPanelHtml(sourceDayIdx, currentDateStr = null, weekOffset = null) {
            const effOffset = weekOffset !== null ? Number(weekOffset) : Number(window._schedModalMoveWeekOffset || 0);
            const isNext = (typeof activePlannerWeek !== 'undefined' && activePlannerWeek === 'next');
            const schedule = isNext ? getNextWeeklySchedule() : getWeeklySchedule();
            const { ordered } = getWeekDaysMapForDateStr(currentDateStr, effOffset);
            const shortNames = { 1: 'PZT', 2: 'SAL', 3: 'ÇAR', 4: 'PER', 5: 'CUM', 6: 'CMT', 0: 'PAZ' };

            const buttonsHtml = ordered.map((dItem) => {
                const dIdx = dItem.dayIdx;
                const dYMD = dItem.dateYMD || '';
                const isCurrent = currentDateStr
                    ? (dYMD === currentDateStr)
                    : (effOffset === 0 && dIdx === sourceDayIdx);
                const dateNum = dItem.dateObj.getDate();

                const completedLogs = (!isNext && typeof getCompletedWorkoutsForDate === 'function')
                    ? getCompletedWorkoutsForDate(dItem.dateObj)
                    : [];
                const hasCompleted = completedLogs.length > 0;
                const plan = (!isNext && typeof getPlanForDate === 'function')
                    ? getPlanForDate(dItem.dateObj)
                    : (schedule[dIdx] || { rest: true });
                const isRest = Boolean(!plan || plan.rest || plan.type === 'rest');

                const dotClass = hasCompleted ? 'done' : (!isRest ? 'planned' : 'rest');
                const clickAttr = isCurrent
                    ? 'disabled'
                    : `onclick="moveScheduledWorkoutToDay(${sourceDayIdx}, ${dIdx}, decodeURIComponent('${encodeURIComponent(currentDateStr || '')}'), '${dYMD}')"`;

                return `
                    <button type="button" class="stitch-day-pill ${isCurrent ? 'active' : ''}" ${clickAttr} title="${isCurrent ? 'Mevcut Gün' : (!isRest ? 'Dolu Gün (Takas Et)' : 'Boş Gün (Buraya Taşı)')}">
                        <span class="stitch-day-pill-lbl">${shortNames[dIdx]}</span>
                        <strong class="stitch-day-pill-num">${dateNum}</strong>
                        <span class="stitch-day-pill-dot ${dotClass}"></span>
                    </button>
                `;
            }).join('');

            return `
                <div id="schedModalMoveDayBox" style="display:none; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:8px; margin:8px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:7px;">
                        <div style="display:inline-flex; background:#E2E8F0; padding:2px; border-radius:8px; gap:2px;">
                            <button type="button" onclick="switchSchedMoveWeekOffset(0)" style="border:none; border-radius:6px; padding:4px 9px; font-size:10.5px; font-weight:800; cursor:pointer; background:${effOffset === 0 ? '#0F172A' : 'transparent'}; color:${effOffset === 0 ? '#FFFFFF' : '#334155'};">Bu Hafta</button>
                            <button type="button" onclick="switchSchedMoveWeekOffset(1)" style="border:none; border-radius:6px; padding:4px 9px; font-size:10.5px; font-weight:800; cursor:pointer; background:${effOffset === 1 ? '#0F172A' : 'transparent'}; color:${effOffset === 1 ? '#FFFFFF' : '#334155'};">Gelecek Hafta</button>
                        </div>
                        <span style="font-size:10px; font-weight:800; color:#475569; white-space:nowrap;">🟠 Takas • ⚪ Taşı</span>
                    </div>
                    <div class="stitch-day-strip" style="margin:0; padding:0; border:none; background:transparent;">
                        ${buttonsHtml}
                    </div>
                </div>
            `;
        }
        window.buildSchedModalMoveDayPanelHtml = buildSchedModalMoveDayPanelHtml;

        function switchSchedMoveWeekOffset(offset) {
            window._schedModalMoveWeekOffset = Number(offset) || 0;
            const box = document.getElementById('schedModalMoveDayBox');
            if (!box || activeSchedulingDayIdx === null) return;
            const temp = document.createElement('div');
            temp.innerHTML = buildSchedModalMoveDayPanelHtml(activeSchedulingDayIdx, activeSchedulingDateStr, window._schedModalMoveWeekOffset);
            const newBox = temp.firstElementChild;
            if (newBox) {
                newBox.style.display = 'block';
                box.replaceWith(newBox);
            }
        }
        window.switchSchedMoveWeekOffset = switchSchedMoveWeekOffset;

        function renderRevisionSummaryCardHtml(summaryObj, isGlobalBanner = false) {
            if (!summaryObj) return '';
            const changes = Array.isArray(summaryObj.changes) ? summaryObj.changes : [];
            const changesHtml = changes.length > 0 ? `
                <div style="margin-top:7px; display:flex; flex-direction:column; gap:4px;">
                    ${changes.map(c => `
                        <div style="background:#FFFFFF; border:1px solid #D8B4FE; border-radius:6px; padding:5px 8px; font-size:11.5px; color:#0F172A; display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap;">
                            <div>
                                <span style="color:#64748B; text-decoration:line-through; font-weight:700;">${escapeHTML(c.fromName || '')}</span>
                                <span style="color:#6B21A8; font-weight:900; margin:0 4px;">➔</span>
                                <strong style="color:#0F172A; font-weight:900;">${escapeHTML(c.toName || '')}</strong>
                            </div>
                            ${c.reason ? `<span style="font-size:10.5px; font-weight:800; color:#6B21A8; background:#F3E8FF; padding:2px 6px; border-radius:4px;">${escapeHTML(c.reason)}</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : '';

            const closeBtnHtml = isGlobalBanner ? `
                <button type="button" onclick="dismissLastScheduleMoveSummary()" style="background:transparent; border:none; color:#475569; font-size:13px; font-weight:900; cursor:pointer; padding:2px 6px;" title="Özeti Kapat">✕</button>
            ` : '';

            const statusBadge = summaryObj.isConsecutive
                ? (summaryObj.needsRevision
                    ? `<span style="font-size:10px; font-weight:900; background:#7E22CE; color:#FFFFFF; padding:2px 7px; border-radius:5px;">AI Revizyon (${changes.length} Hareket)</span>`
                    : `<span style="font-size:10px; font-weight:900; background:#15803D; color:#FFFFFF; padding:2px 7px; border-radius:5px;">Ardışık Uygun</span>`)
                : `<span style="font-size:10px; font-weight:900; background:#0369A1; color:#FFFFFF; padding:2px 7px; border-radius:5px;">Gün Taşındı</span>`;

            return `
                <div style="background:#FAF5FF; border:1.5px solid #C084FC; border-left:4px solid #7E22CE; border-radius:10px; padding:10px 12px; margin-top:10px; margin-bottom:${isGlobalBanner ? '10px' : '4px'};">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:4px;">
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <strong style="font-size:12px; font-weight:900; color:#0F172A;">🤖 İşlem & AI Revizyon Özeti</strong>
                            ${statusBadge}
                        </div>
                        ${closeBtnHtml}
                    </div>
                    <div style="font-size:11.5px; font-weight:800; color:#0F172A; line-height:1.4;">
                        📅 ${escapeHTML(summaryObj.moveLine || '')}
                    </div>
                    <div style="font-size:11.5px; font-weight:700; color:#334155; margin-top:2px; line-height:1.4;">
                        ${escapeHTML(summaryObj.summary || '')}
                    </div>
                    ${changesHtml}
                </div>
            `;
        }

        function buildSchedModalAiSummaryHtml(currentPlan, dayIdx) {
            if (window._isRunningScheduleAiRevision && window._runningScheduleAiDayIdx === dayIdx) {
                return `
                    <div style="background:#FAF5FF; border:1.5px solid #C084FC; border-radius:10px; padding:10px 12px; margin-top:10px; display:flex; align-items:center; gap:8px;">
                        <span style="font-size:16px;">🤖</span>
                        <div style="font-size:12px; font-weight:800; color:#6B21A8;">
                            Ardışık gün tespit edildi. AI hareketleri kontrol edip revize ediyor...
                        </div>
                    </div>
                `;
            }
            const summaryObj = (currentPlan && currentPlan.aiMoveSummary)
                || (window.lastScheduleMoveSummary && window.lastScheduleMoveSummary.toDayIdx === dayIdx ? window.lastScheduleMoveSummary : null);
            if (!summaryObj) return '';
            return renderRevisionSummaryCardHtml(summaryObj, false);
        }
        window.buildSchedModalAiSummaryHtml = buildSchedModalAiSummaryHtml;

        function buildGlobalScheduleMoveSummaryBannerHtml() {
            if (!window.lastScheduleMoveSummary) return '';
            return renderRevisionSummaryCardHtml(window.lastScheduleMoveSummary, true);
        }
        window.buildGlobalScheduleMoveSummaryBannerHtml = buildGlobalScheduleMoveSummaryBannerHtml;

        function dismissLastScheduleMoveSummary() {
            window.lastScheduleMoveSummary = null;
            if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
        }
        window.dismissLastScheduleMoveSummary = dismissLastScheduleMoveSummary;

        function getMuscleTagsForConsecutiveCheck(ex) {
            const text = `${ex.category || ''} ${ex.muscle || ''} ${ex.name || ''} ${(ex.primaryMuscles || []).join(' ')}`.toLocaleLowerCase('tr-TR');
            const tags = new Set();
            if (/göğüs|pectoral|bench|şınav|push-up|fly|dip/.test(text)) tags.add('chest');
            if (/omuz|deltoid|overhead|military|pike|lateral raise|arnold/.test(text)) tags.add('shoulders');
            if (/triceps|arka kol|skull|pushdown|extension/.test(text)) tags.add('triceps');
            if (/sırt|kanat|lat|row|çekiş|barfiks|pull-up|chin-up|rhomboid|trapez/.test(text)) tags.add('back');
            if (/biceps|ön kol|curl|pazu|pazı/.test(text)) tags.add('biceps');
            if (/quad|ön bacak|squat|lunge|split squat|step-up|thruster|wall sit/.test(text)) tags.add('quads');
            if (/hamstring|arka bacak|kalça|glute|deadlift|rdl|swing|hip thrust|bridge|good morning|hinge/.test(text)) tags.add('posterior');
            if (/karın|core|abs|plank|deadbug|hollow|crunch|pallof|carry|farmers/.test(text)) tags.add('core');
            const isAxialSpine = /deadlift|rdl|romanian|good morning|bent over|barbell row|swing|clean|snatch|back squat/.test(text);
            return { tags: Array.from(tags), isAxialSpine };
        }

        function computeLocalConsecutiveRevision(targetExercises, neighborExercises, neighborNamesStr) {
            const neighborTagCounts = {};
            let neighborSpineCount = 0;
            const usedIds = new Set();

            neighborExercises.forEach(ne => {
                if (ne && ne.id) usedIds.add(ne.id);
                const info = getMuscleTagsForConsecutiveCheck(ne || {});
                info.tags.forEach(t => { neighborTagCounts[t] = (neighborTagCounts[t] || 0) + 1; });
                if (info.isAxialSpine) neighborSpineCount++;
            });

            targetExercises.forEach(te => {
                if (te && te.id) usedIds.add(te.id);
            });

            const changes = [];
            const pool = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB))
                ? EXERCISES_DB.filter(e => e && e.id && (typeof isExerciseExcluded !== 'function' || !isExerciseExcluded(e.id)))
                : [];

            const labelMap = {
                chest: 'Göğüs dinlenmesi',
                shoulders: 'Omuz koruması',
                triceps: 'Arka kol dinlenmesi',
                back: 'Sırt toparlanması',
                biceps: 'Ön kol dinlenmesi',
                quads: 'Ön bacak koruması',
                posterior: 'Arka bacak/kalça dengesi',
                spine: 'Alt bel koruması'
            };

            targetExercises.forEach((ex, idx) => {
                if (changes.length >= 3) return;
                const info = getMuscleTagsForConsecutiveCheck(ex || {});
                const exactSameEx = neighborExercises.some(ne => ne && (ne.id === ex.id || (ne.name && ne.name === ex.name)));
                const overlappingTags = info.tags.filter(t => t !== 'core' && (neighborTagCounts[t] || 0) >= 1);
                const spineConflict = info.isAxialSpine && neighborSpineCount >= 1;

                if (!exactSameEx && overlappingTags.length === 0 && !spineConflict) return;

                // Pick a candidate from EXERCISES_DB that avoids neighbor's taxed tags and spine load
                const candidate = pool.find(cand => {
                    if (usedIds.has(cand.id)) return false;
                    if (typeof isExerciseExcluded === 'function' && isExerciseExcluded(cand.id)) return false;
                    const cInfo = getMuscleTagsForConsecutiveCheck(cand);
                    if (cInfo.isAxialSpine && neighborSpineCount >= 1) return false;
                    if (cInfo.tags.length === 0) return false;
                    const hasClash = cInfo.tags.some(t => t !== 'core' && (neighborTagCounts[t] || 0) >= 1);
                    return !hasClash;
                }) || pool.find(cand => {
                    if (usedIds.has(cand.id)) return false;
                    if (typeof isExerciseExcluded === 'function' && isExerciseExcluded(cand.id)) return false;
                    const cInfo = getMuscleTagsForConsecutiveCheck(cand);
                    if (spineConflict && cInfo.isAxialSpine) return false;
                    const overlapCount = cInfo.tags.filter(t => (neighborTagCounts[t] || 0) >= 1).length;
                    return overlapCount === 0;
                }) || pool.find(cand => {
                    if (usedIds.has(cand.id)) return false;
                    if (typeof isExerciseExcluded === 'function' && isExerciseExcluded(cand.id)) return false;
                    const cInfo = getMuscleTagsForConsecutiveCheck(cand);
                    if (cInfo.isAxialSpine) return false;
                    return info.tags[0] ? !cInfo.tags.includes(info.tags[0]) : true;
                });

                if (candidate) {
                    usedIds.add(candidate.id);
                    const reasonKey = spineConflict ? 'spine' : (overlappingTags[0] || 'quads');
                    changes.push({
                        index: idx,
                        fromId: ex.id,
                        fromName: ex.name,
                        toEx: candidate,
                        toId: candidate.id,
                        toName: candidate.name,
                        reason: exactSameEx ? 'Ardışık gün aynı hareket değişimi' : (labelMap[reasonKey] || 'Kas çakışması önlendi')
                    });
                }
            });

            if (changes.length > 0) {
                return {
                    needsRevision: true,
                    summary: `${neighborNamesStr} ile ardışık güne geldiği için ${changes.length} çakışan hareket revize edildi.`,
                    changes
                };
            }
            return {
                needsRevision: false,
                summary: `${neighborNamesStr} ile ardışık gün kontrol edildi; kas grupları dengeli olduğu için hareketler korundu.`,
                changes: []
            };
        }

        async function reviseConsecutiveDayWorkoutWithAI(targetDayIdx, targetDateStr, adjacentNeighbors, isNextWeek, moveMeta) {
            const user = getActiveUser();
            const uid = user ? user.id : 'default';
            const schedule = isNextWeek ? getNextWeeklySchedule(uid) : getWeeklySchedule(uid);
            let targetPlan = (!isNextWeek && targetDateStr && typeof getPlanForDate === 'function')
                ? getPlanForDate(new Date(targetDateStr + 'T00:00:00'))
                : schedule[targetDayIdx];
            if (!targetPlan || targetPlan.rest) targetPlan = schedule[targetDayIdx];
            if (!targetPlan || targetPlan.rest) return;

            const details = getWorkoutDetailsForPlan(targetPlan) || targetPlan.customWorkout || {};
            const targetExercises = Array.isArray(details.exercises)
                ? details.exercises.map(e => {
                    const dbMatch = EXERCISES_DB.find(x => x.id === (e.id || e.exId)) || (typeof findBestExerciseMatch === 'function' ? findBestExerciseMatch(e.name || e.id) : null);
                    return Object.assign({}, dbMatch || e, {
                        id: (dbMatch ? dbMatch.id : (e.id || e.exId)),
                        name: (dbMatch ? dbMatch.name : (e.name || 'Egzersiz')),
                        targetSets: e.targetSets || e.sets || 3,
                        targetReps: e.targetReps || e.reps || '8-12'
                    });
                })
                : [];

            if (targetExercises.length === 0) return;

            const neighborExercises = [];
            const neighborDayNames = [];
            adjacentNeighbors.forEach(nb => {
                neighborDayNames.push(DAY_NAMES_TR[nb.dayIdx]);
                (nb.exercises || []).forEach(ne => neighborExercises.push(ne));
            });
            const neighborNamesStr = neighborDayNames.join(' ve ');
            const fromDayName = DAY_NAMES_TR[moveMeta.fromDayIdx] || '';
            const toDayName = DAY_NAMES_TR[targetDayIdx] || '';
            const moveLine = `${fromDayName} antrenmanı ${toDayName} gününe ${moveMeta.wasSwapped ? 'takas edilerek ' : ''}taşındı.`;

            // Helper to apply and persist a revision immediately
            const applyAndPersistRevision = (revResult) => {
                const nowTs = Date.now();
                const updatedExercises = targetExercises.map((ex, idx) => {
                    const foundChange = revResult.changes.find(c => c.index === idx);
                    if (foundChange && foundChange.toEx) {
                        return Object.assign({}, foundChange.toEx, {
                            targetSets: ex.targetSets || 3,
                            targetReps: ex.targetReps || '8-12',
                            isAiConsecutiveBalanced: true,
                            aiReplacedFrom: foundChange.fromName,
                            aiRevisionNote: foundChange.reason
                        });
                    }
                    return ex;
                });

                const summaryObj = {
                    timestamp: nowTs,
                    fromDayIdx: moveMeta.fromDayIdx,
                    toDayIdx: targetDayIdx,
                    fromDayName,
                    toDayName,
                    moveLine,
                    isConsecutive: true,
                    needsRevision: revResult.needsRevision,
                    summary: revResult.summary,
                    changes: revResult.changes.map(c => ({
                        fromId: c.fromId,
                        fromName: c.fromName,
                        toId: c.toId,
                        toName: c.toName,
                        reason: c.reason
                    }))
                };

                const cleanTitle = (details.title || targetPlan.title || `${toDayName} Antrenmanı`).replace(/^⚔️\s*(Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar|Pzt|Sal|Çar|Per|Cum|Cmt|Paz):\s*/i, '').trim();
                const progId = 'custom_day_' + targetDayIdx + '_' + nowTs;
                const updatedWorkout = Object.assign({}, details, {
                    id: progId,
                    title: cleanTitle,
                    exercises: updatedExercises,
                    updatedAt: nowTs,
                    isCustom: true
                });

                const updatedPlanObj = Object.assign({}, targetPlan, {
                    id: progId,
                    title: cleanTitle,
                    type: 'custom_saved',
                    desc: `${updatedExercises.length} Hareket • ${updatedWorkout.duration || Math.round(updatedExercises.length * 7) || 45} Dk`,
                    rest: false,
                    customWorkout: updatedWorkout,
                    exercises: updatedExercises,
                    aiMoveSummary: summaryObj,
                    updatedAt: nowTs
                });

                if (!moveMeta || !moveMeta.isCrossWeekMove) {
                    schedule[targetDayIdx] = updatedPlanObj;
                    if (isNextWeek) {
                        saveNextWeeklySchedule(schedule, uid);
                    } else {
                        saveWeeklySchedule(schedule, uid);
                    }
                }
                if (!isNextWeek && targetDateStr && typeof saveDateScheduleOverride === 'function') {
                    saveDateScheduleOverride(targetDateStr, updatedPlanObj, uid);
                }

                try {
                    if (updatedWorkout && typeof upsertUserCustomProgram === 'function') {
                        const withId = updatedWorkout.id ? updatedWorkout : Object.assign({}, updatedWorkout, { id: 'moved_' + Date.now() });
                        upsertUserCustomProgram(withId, uid);
                    }
                } catch (e) {}

                window.lastScheduleMoveSummary = summaryObj;
                return summaryObj;
            };

            // 1. Apply deterministic biomechanical revision IMMEDIATELY (0ms, no waiting spinner)
            const localResult = computeLocalConsecutiveRevision(targetExercises, neighborExercises, neighborNamesStr);
            window._isRunningScheduleAiRevision = false;
            window._runningScheduleAiDayIdx = null;
            applyAndPersistRevision(localResult);
            renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            openScheduleDayModal(targetDayIdx, targetDateStr);

            // 2. Optional fast Gemini refinement (capped at 3 seconds so it never hangs)
            try {
                if (typeof callGeminiAPI === 'function' && typeof getGeminiApiKey === 'function' && getGeminiApiKey()) {
                    const usedSet = new Set([
                        ...targetExercises.map(e => e.id),
                        ...neighborExercises.map(e => e.id)
                    ]);
                    const candidatePool = (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : [])
                        .filter(e => e && e.id && !usedSet.has(e.id) && (typeof isExerciseExcluded !== 'function' || !isExerciseExcluded(e.id)))
                        .slice(0, 35)
                        .map(e => `${e.id} | ${e.name} | ${e.muscle || e.category}`)
                        .join('\n');

                    const prompt = `Kullanıcı antrenman takviminde ${fromDayName} günündeki antrenmanı ${toDayName} gününe taşıdı.
Böylece ${neighborNamesStr} ile ${toDayName} ARDIŞIK GÜNLER oldu.

KOMŞU GÜN (${neighborNamesStr}) HAREKETLERİ:
${neighborExercises.map(e => `- ${e.name} (${e.muscle || e.category || ''})`).join('\n')}

TAŞINAN GÜN (${toDayName}) MEVCUT HAREKETLERİ:
${targetExercises.map(e => `- ID: ${e.id} | ${e.name} (${e.muscle || e.category || ''})`).join('\n')}

ADAY HAVUZU (Değişim gerekirse SADECE buradaki ID'lerden seç):
${candidatePool}

KURALLAR:
1. Ardışık iki günde aynı kas grubuna veya alt bele üst üste aşırı yük biniyorsa çakışan 1 ila 3 hareketi aday havuzundan zıt/tamamlayıcı hareketle değiştir ("needsRevision": true).
2. Eğer kas grupları zaten farklıysa ve çakışma yoksa değişiklik yapma ("needsRevision": false, "changes": []).
3. Sadece aşağıdaki JSON formatında yanıt ver:
\`\`\`json
{
  "needsRevision": true,
  "summary": "1 kısa cümlelik net Türkçe özet",
  "changes": [
    { "fromId": "mevcut_id", "toId": "aday_id", "reason": "2-4 kelimelik kısa neden" }
  ]
}
\`\`\``;

                    const sysPrompt = "Sen Çelik Kodu antrenman koçusun. Ardışık günlerde kas ve alt bel çakışmasını denetleyip yalnızca geçerli JSON döndürürsün.";
                    const aiResp = await Promise.race([
                        callGeminiAPI(prompt, sysPrompt, '', 900),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 3000))
                    ]);
                    if (aiResp) {
                        const jsonMatch = aiResp.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || aiResp.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                            if (parsed && typeof parsed.needsRevision === 'boolean') {
                                const validatedChanges = [];
                                const pickedIds = new Set(targetExercises.map(e => e.id));
                                if (Array.isArray(parsed.changes)) {
                                    parsed.changes.forEach(ch => {
                                        const exIdx = targetExercises.findIndex(e => e.id === ch.fromId || (e.name && ch.fromId && e.name.toLocaleLowerCase('tr-TR').includes(String(ch.fromId).toLocaleLowerCase('tr-TR'))));
                                        if (exIdx === -1) return;
                                        let newEx = EXERCISES_DB.find(e => e.id === ch.toId);
                                        if (!newEx && typeof findBestExerciseMatch === 'function') {
                                            newEx = findBestExerciseMatch(ch.toId);
                                        }
                                        if (newEx && !pickedIds.has(newEx.id) && (typeof isExerciseExcluded !== 'function' || !isExerciseExcluded(newEx.id))) {
                                            pickedIds.add(newEx.id);
                                            validatedChanges.push({
                                                index: exIdx,
                                                fromId: targetExercises[exIdx].id,
                                                fromName: targetExercises[exIdx].name,
                                                toEx: newEx,
                                                toId: newEx.id,
                                                toName: newEx.name,
                                                reason: ch.reason || 'Ardışık gün dengesi'
                                            });
                                        }
                                    });
                                }
                                if (validatedChanges.length > 0) {
                                    applyAndPersistRevision({
                                        needsRevision: true,
                                        summary: parsed.summary || `${neighborNamesStr} ile ardışık gün çakışmasını önlemek için ${validatedChanges.length} hareket revize edildi.`,
                                        changes: validatedChanges
                                    });
                                    renderActiveWorkout();
                                    if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                                    if (activeSchedulingDayIdx === targetDayIdx) {
                                        openScheduleDayModal(targetDayIdx, targetDateStr);
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                // Local biomechanical revision is already applied and displayed
            }
        }
        window.reviseConsecutiveDayWorkoutWithAI = reviseConsecutiveDayWorkoutWithAI;

        async function moveScheduledWorkoutToDay(sourceDayIdx, targetDayIdx, sourceDateStr = '', targetDateStr = '') {
            if (sourceDayIdx === targetDayIdx && (!sourceDateStr || sourceDateStr === targetDateStr)) {
                if (typeof showToast === 'function') showToast("ℹ️ Bu antrenman zaten seçilen günde.");
                return;
            }

            const user = getActiveUser();
            const uid = user ? user.id : 'default';
            const isNext = (typeof activePlannerWeek !== 'undefined' && activePlannerWeek === 'next');
            const schedule = isNext ? getNextWeeklySchedule(uid) : getWeeklySchedule(uid);
            const { map: srcWeekMap, ordered: srcOrdered } = getWeekDaysMapForDateStr(sourceDateStr || targetDateStr, 0);

            const srcDateYMD = sourceDateStr || (srcWeekMap[sourceDayIdx] ? srcWeekMap[sourceDayIdx].dateYMD : '');
            const { map: tgtWeekMap, ordered } = getWeekDaysMapForDateStr(targetDateStr || srcDateYMD, 0);
            const tgtDateYMD = targetDateStr || (tgtWeekMap[targetDayIdx] ? tgtWeekMap[targetDayIdx].dateYMD : '');
            const isCrossWeekMove = Boolean(srcDateYMD && tgtDateYMD && srcOrdered[0]?.dateYMD !== ordered[0]?.dateYMD);

            let sourcePlan = (!isNext && srcDateYMD && typeof getPlanForDate === 'function')
                ? getPlanForDate(new Date(srcDateYMD + 'T00:00:00'))
                : schedule[sourceDayIdx];
            if (!sourcePlan || sourcePlan.rest) sourcePlan = schedule[sourceDayIdx];

            if (!sourcePlan || sourcePlan.rest) {
                if (typeof showToast === 'function') showToast("⚠️ Taşınacak aktif bir antrenman bulunamadı.");
                return;
            }

            let targetPlan = (!isNext && tgtDateYMD && typeof getPlanForDate === 'function')
                ? getPlanForDate(new Date(tgtDateYMD + 'T00:00:00'))
                : schedule[targetDayIdx];
            if (!targetPlan) targetPlan = schedule[targetDayIdx] || { id: 'rest', rest: true };

            const isTargetRest = Boolean(!targetPlan || targetPlan.rest || targetPlan.type === 'rest');
            const nowTs = Date.now();

            // Resolve full workout details for sourcePlan so exercises are preserved and editable
            const srcDetails = getWorkoutDetailsForPlan(sourcePlan) || sourcePlan.customWorkout || {};
            const srcExercises = Array.isArray(srcDetails.exercises) ? JSON.parse(JSON.stringify(srcDetails.exercises)) : [];
            const srcCleanTitle = (srcDetails.title || sourcePlan.title || 'Antrenman')
                .replace(/^⚔️\s*(Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar|Pzt|Sal|Çar|Per|Cum|Cmt|Paz):\s*/i, '')
                .trim();

            const movedWorkoutId = (sourcePlan.id && String(sourcePlan.id).startsWith('custom_'))
                ? sourcePlan.id
                : ('custom_day_' + targetDayIdx + '_' + nowTs);

            const movedWorkoutObj = Object.assign({}, JSON.parse(JSON.stringify(srcDetails)), {
                id: movedWorkoutId,
                title: srcCleanTitle,
                exercises: srcExercises,
                updatedAt: nowTs,
                isCustom: true
            });

            const movedPlanObj = {
                id: movedWorkoutId,
                title: srcCleanTitle,
                type: 'custom_saved',
                desc: `${srcExercises.length} Hareket • ${movedWorkoutObj.duration || Math.round(srcExercises.length * 7) || 45} Dk`,
                rest: false,
                time: sourcePlan.time || '18:30',
                duration: movedWorkoutObj.duration || sourcePlan.duration || 45,
                customWorkout: movedWorkoutObj,
                exercises: srcExercises,
                updatedAt: nowTs
            };

            if (isTargetRest) {
                const restPlan = {
                    id: 'rest',
                    title: '🧘 Dinlenme & Aktif Toparlanma',
                    type: 'rest',
                    desc: `${DAY_NAMES_TR[targetDayIdx]} gününe taşındı • İstirahat`,
                    rest: true,
                    updatedAt: nowTs
                };
                if (!isCrossWeekMove) {
                    schedule[sourceDayIdx] = restPlan;
                }
                if (!isNext && srcDateYMD && typeof saveDateScheduleOverride === 'function') {
                    saveDateScheduleOverride(srcDateYMD, restPlan, uid);
                }
            } else {
                // Swap targetPlan onto sourceDayIdx
                const tgtDetails = getWorkoutDetailsForPlan(targetPlan) || targetPlan.customWorkout || {};
                const tgtExercises = Array.isArray(tgtDetails.exercises) ? JSON.parse(JSON.stringify(tgtDetails.exercises)) : [];
                const tgtCleanTitle = (tgtDetails.title || targetPlan.title || 'Antrenman')
                    .replace(/^⚔️\s*(Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar|Pzt|Sal|Çar|Per|Cum|Cmt|Paz):\s*/i, '')
                    .trim();
                const swappedWorkoutObj = Object.assign({}, JSON.parse(JSON.stringify(tgtDetails)), {
                    id: targetPlan.id || ('custom_day_' + sourceDayIdx + '_' + nowTs),
                    title: tgtCleanTitle,
                    exercises: tgtExercises,
                    updatedAt: nowTs,
                    isCustom: true
                });
                const swappedPlanObj = {
                    id: swappedWorkoutObj.id,
                    title: tgtCleanTitle,
                    type: 'custom_saved',
                    desc: `${tgtExercises.length} Hareket • ${swappedWorkoutObj.duration || 45} Dk`,
                    rest: false,
                    time: targetPlan.time || '18:30',
                    duration: swappedWorkoutObj.duration || targetPlan.duration || 45,
                    customWorkout: swappedWorkoutObj,
                    exercises: tgtExercises,
                    updatedAt: nowTs
                };
                if (!isCrossWeekMove) {
                    schedule[sourceDayIdx] = swappedPlanObj;
                }
                if (!isNext && srcDateYMD && typeof saveDateScheduleOverride === 'function') {
                    saveDateScheduleOverride(srcDateYMD, swappedPlanObj, uid);
                }
            }

            if (!isCrossWeekMove) {
                schedule[targetDayIdx] = movedPlanObj;
                if (isNext) {
                    saveNextWeeklySchedule(schedule, uid);
                } else {
                    saveWeeklySchedule(schedule, uid);
                }
            }
            if (!isNext && tgtDateYMD && typeof saveDateScheduleOverride === 'function') {
                saveDateScheduleOverride(tgtDateYMD, movedPlanObj, uid);
            }

            if (typeof calendarScreenState !== 'undefined' && tgtDateYMD) {
                calendarScreenState.anchorDate = new Date(tgtDateYMD + 'T00:00:00');
                calendarScreenState.selectedDayYMD = tgtDateYMD;
            }

            // Detect consecutive workout days around targetDayIdx
            const targetPos = ordered.findIndex(item => item.dayIdx === targetDayIdx);
            const neighborCandidates = [];
            if (targetPos > 0) neighborCandidates.push(ordered[targetPos - 1]);
            if (targetPos < ordered.length - 1) neighborCandidates.push(ordered[targetPos + 1]);

            const adjacentNeighbors = [];
            neighborCandidates.forEach(nbItem => {
                if (!nbItem) return;
                const completedLogs = (!isNext && typeof getCompletedWorkoutsForDate === 'function')
                    ? getCompletedWorkoutsForDate(nbItem.dateObj)
                    : [];
                if (Array.isArray(completedLogs) && completedLogs.length > 0) {
                    const logExs = completedLogs[0].exercises || [];
                    if (logExs.length > 0) {
                        adjacentNeighbors.push({ dayIdx: nbItem.dayIdx, dateYMD: nbItem.dateYMD, exercises: logExs, isCompleted: true });
                        return;
                    }
                }
                const nbPlan = (!isNext && typeof getPlanForDate === 'function')
                    ? getPlanForDate(nbItem.dateObj)
                    : schedule[nbItem.dayIdx];
                if (nbPlan && !nbPlan.rest && nbPlan.type !== 'rest') {
                    const nbDetails = getWorkoutDetailsForPlan(nbPlan) || nbPlan.customWorkout || {};
                    const nbExs = nbDetails.exercises || nbPlan.exercises || [];
                    if (nbExs.length > 0) {
                        adjacentNeighbors.push({ dayIdx: nbItem.dayIdx, dateYMD: nbItem.dateYMD, exercises: nbExs, isCompleted: false });
                    }
                }
            });

            const fromDayName = DAY_NAMES_TR[sourceDayIdx] || '';
            const toDayName = DAY_NAMES_TR[targetDayIdx] || '';
            const moveLine = `${fromDayName} antrenmanı ${isCrossWeekMove ? 'gelecek hafta ' : ''}${toDayName} gününe ${!isTargetRest ? 'takas edilerek ' : ''}taşındı.`;

            if (adjacentNeighbors.length === 0) {
                const noConflictSummary = {
                    timestamp: nowTs,
                    fromDayIdx: sourceDayIdx,
                    toDayIdx: targetDayIdx,
                    fromDayName,
                    toDayName,
                    moveLine,
                    isConsecutive: false,
                    needsRevision: false,
                    summary: 'Önceki ve sonraki gün dinlenme olduğu için ardışık gün çakışması oluşmadı; hareketler korundu.',
                    changes: []
                };
                movedPlanObj.aiMoveSummary = noConflictSummary;
                if (!isCrossWeekMove) {
                    schedule[targetDayIdx] = movedPlanObj;
                    if (isNext) saveNextWeeklySchedule(schedule, uid);
                    else saveWeeklySchedule(schedule, uid);
                }
                if (!isNext && tgtDateYMD && typeof saveDateScheduleOverride === 'function') {
                    saveDateScheduleOverride(tgtDateYMD, movedPlanObj, uid);
                }
                window.lastScheduleMoveSummary = noConflictSummary;
                renderActiveWorkout();
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                openScheduleDayModal(targetDayIdx, tgtDateYMD);
                if (typeof showToast === 'function') {
                    showToast(`✅ ${moveLine}`);
                }
                return;
            }

            // Consecutive days exist -> Trigger AI revision & summary immediately
            await reviseConsecutiveDayWorkoutWithAI(
                targetDayIdx,
                tgtDateYMD,
                adjacentNeighbors,
                isNext,
                { fromDayIdx: sourceDayIdx, wasSwapped: !isTargetRest, isCrossWeekMove }
            );

            if (typeof playAlertSound === 'function') playAlertSound();
            if (typeof showToast === 'function') {
                const sum = window.lastScheduleMoveSummary;
                if (sum && sum.needsRevision) {
                    showToast(`⚡ ${moveLine} Ardışık gün nedeniyle AI ${sum.changes.length} hareketi revize etti!`);
                } else {
                    showToast(`✅ ${moveLine} Ardışık gün AI kontrolünden geçti.`);
                }
            }
        }
        window.moveScheduledWorkoutToDay = moveScheduledWorkoutToDay;

        function startNewStudioProgramForDay(dayIdx, targetDateStr = null) {
            const dateStr = targetDateStr || activeSchedulingDateStr || null;
            customRoutineState = {
                title: `${DAY_NAMES_TR[dayIdx]} Özel Antrenmanım`,
                rest: 60,
                exercises: [],
                editingDayIdx: dayIdx,
                editingDateStr: dateStr,
                editingProgramId: null,
                isEditingExisting: true
            };

            closeScheduleDayModal();
            switchTab('activeWorkoutTab');
            toggleStudioAccordion(true);

            const titleInput = document.getElementById('customWorkoutTitleInput');
            const restSelect = document.getElementById('customWorkoutRestSelect');
            if (titleInput) titleInput.value = customRoutineState.title;
            if (restSelect) restSelect.value = customRoutineState.rest;

            renderCustomRoutine();
            renderRegionStatus();
            renderStudioExerciseCatalog();

            updateStudioEditingBanner(dayIdx, customRoutineState.title);

            setTimeout(() => {
                const sec = document.getElementById('studioSectionInWorkout');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

        function saveEditingRoutineToDay() {
            if (customRoutineState.editingDayIdx === null || customRoutineState.editingDayIdx === undefined) {
                saveCustomRoutineToLibrary();
                return;
            }

            const dayIdx = customRoutineState.editingDayIdx;
            if (customRoutineState.exercises.length === 0) {
                alert("Lütfen önce programınıza en az 1 egzersiz ekleyin.");
                return;
            }

            const title = (document.getElementById('customWorkoutTitleInput')?.value || '').trim() || `${DAY_NAMES_TR[dayIdx]} Özel Programım`;
            const rest = parseInt(document.getElementById('customWorkoutRestSelect')?.value) || 60;

            const exercisesList = customRoutineState.exercises.map(item => {
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                return ex ? Object.assign({}, ex, { targetSets: item.sets, targetReps: item.reps }) : null;
            }).filter(Boolean);

            const progId = (customRoutineState.editingProgramId && customRoutineState.editingProgramId.startsWith('custom_')) 
                ? customRoutineState.editingProgramId 
                : ('custom_day_' + dayIdx + '_' + Date.now());

            const updatedWorkout = {
                id: progId,
                title: title,
                split: 'custom',
                splitName: title,
                style: 'classic',
                goal: 'hypertrophy',
                duration: Math.round(exercisesList.length * 7),
                scheme: { sets: 3, reps: '8-12', rest: rest },
                warmups: [
                    { name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ve dairesel ısıt." },
                    { name: "Dinamik Esneme", dur: "60 sn", cue: "Kalça menteşesi ve omurga rotasyonu." }
                ],
                exercises: exercisesList,
                finisher: { name: "Balistik Bitiş / Finisher", desc: "Maksimum tempolu swing veya taşıma seansı." },
                updatedAt: Date.now(),
                isCustom: true
            };

            const planObj = {
                id: progId,
                title: title,
                type: 'custom_saved',
                desc: `${exercisesList.length} Hareket • ${updatedWorkout.duration} Dk`,
                rest: false,
                customWorkout: updatedWorkout,
                exercises: exercisesList
            };

            const schedule = activePlannerWeek === 'next' ? getNextWeeklySchedule() : getWeeklySchedule();
            schedule[dayIdx] = planObj;
            if (activePlannerWeek === 'next') {
                saveNextWeeklySchedule(schedule);
            } else {
                saveWeeklySchedule(schedule);
            }

            // Keep dateScheduleOverride in sync
            const todayDate = new Date();
            const todayIdx = todayDate.getDay();
            const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
            const targetDateStr = customRoutineState.editingDateStr || (dayIdx === todayIdx ? todayYMD : null);
            if (targetDateStr && typeof saveDateScheduleOverride === 'function') {
                saveDateScheduleOverride(targetDateStr, planObj);
            }

            // Also update or add to custom programs in library
            const user = getActiveUser();
            if (user && typeof upsertUserCustomProgram === 'function') {
                upsertUserCustomProgram(updatedWorkout, user.id);
            }

            // Clear editing state cleanly without prompt
            cancelStudioEditingSilent();

            renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            renderLibrary();
            playAlertSound();
            showToast(`✅ "${title}" ${DAY_NAMES_TR[dayIdx]} gününe kaydedildi!`);
        }

        function updateStudioEditingBanner(dayIdx, title) {
            const container = document.getElementById('studioEditingBannerContainer');
            if (!container) return;

            if (dayIdx !== null && dayIdx !== undefined) {
                container.innerHTML = `
                    <div style="background:rgba(245,158,11,0.12); border:1.5px solid var(--gold); border-radius:10px; padding:12px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div>
                            <div style="font-size:10px; font-weight:900; color:var(--gold); text-transform:uppercase; letter-spacing:0.5px;">
                                ✏️ ${DAY_NAMES_TR[dayIdx].toUpperCase()} GÜNÜ PROGRAMI DÜZENLENİYOR
                            </div>
                            <div style="font-size:14px; font-weight:800; color:#0F172A; margin-top:2px;">
                                "${escapeHTML(title || '')}"
                            </div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                Hareketleri silebilir (✕), yenilerini ekleyebilir (➕), sıralamayı (▲/▼) veya set/tekrar sayılarını değiştirebilirsiniz.
                            </div>
                        </div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button type="button" class="btn btn-gold" style="font-weight:900; font-size:12px; padding:8px 14px; box-shadow:0 0 15px rgba(245,158,11,0.4);" onclick="saveEditingRoutineToDay()">
                                💾 ${DAY_NAMES_TR[dayIdx]} Gününe Kaydet
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:8px 10px;" onclick="cancelStudioEditing(true)">
                                Vazgeç
                            </button>
                        </div>
                    </div>
                `;
            } else if (customRoutineState.editingProgramId) {
                container.innerHTML = `
                    <div style="background:rgba(56,189,248,0.12); border:1.5px solid var(--cyan); border-radius:10px; padding:12px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div>
                            <div style="font-size:10px; font-weight:900; color:var(--cyan); text-transform:uppercase; letter-spacing:0.5px;">
                                ✏️ KAYITLI PROGRAM DÜZENLENİYOR
                            </div>
                            <div style="font-size:14px; font-weight:800; color:#0F172A; margin-top:2px;">
                                "${escapeHTML(title || '')}"
                            </div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                Değişiklikleri tamamlayınca aşağıdaki veya buradaki butondan kütüphanenize kaydedin.
                            </div>
                        </div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            <button type="button" class="btn btn-gold" style="font-weight:900; font-size:12px; padding:8px 14px; box-shadow:0 0 15px rgba(245,158,11,0.4);" onclick="saveCustomRoutineToLibrary()">
                                💾 Değişiklikleri Kaydet
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:8px 10px;" onclick="cancelStudioEditing(true)">
                                Vazgeç
                            </button>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = '';
            }

            updateStudioSaveActionsGroup();
        }

        function updateStudioSaveActionsGroup() {
            const group = document.getElementById('studioSaveActionsGroup');
            if (!group) return;

            if (customRoutineState.editingDayIdx !== null && customRoutineState.editingDayIdx !== undefined) {
                group.innerHTML = `
                    <button class="btn btn-gold" style="font-size:11px; padding:5px 12px; font-weight:900; box-shadow:0 0 12px rgba(245,158,11,0.3);" onclick="saveEditingRoutineToDay()">
                        💾 ${DAY_NAMES_TR[customRoutineState.editingDayIdx]} Gününe Kaydet
                    </button>
                    <button class="btn btn-outline" style="font-size:10.5px; padding:4px 8px;" onclick="saveCustomRoutineToLibrary()">
                        💾 Kütüphaneye de Kaydet
                    </button>
                `;
            } else if (customRoutineState.editingProgramId) {
                group.innerHTML = `
                    <button class="btn btn-gold" style="font-size:11px; padding:5px 12px; font-weight:900;" onclick="saveCustomRoutineToLibrary()">
                        💾 Değişiklikleri Kaydet
                    </button>
                `;
            } else {
                group.innerHTML = `
                    <button class="btn btn-outline" style="font-size:10.5px; padding:4px 8px;" onclick="saveCustomRoutineToLibrary()">
                        💾 Kütüphaneye Kaydet
                    </button>
                `;
            }
        }

        function cancelStudioEditingSilent() {
            customRoutineState.editingDayIdx = null;
            customRoutineState.editingProgramId = null;
            customRoutineState.isEditingExisting = false;
            customRoutineState.exercises = [];
            const container = document.getElementById('studioEditingBannerContainer');
            if (container) container.innerHTML = '';
            updateStudioSaveActionsGroup();
            renderCustomRoutine();
            renderRegionStatus();
            renderStudioExerciseCatalog();
        }

        function cancelStudioEditing(promptConfirm = false) {
            if (promptConfirm && !confirm("Düzenleme modundan çıkmak istediğinize emin misiniz?")) {
                return;
            }
            cancelStudioEditingSilent();
        }

        function promptAssignStudioRoutineToDay() {
            if (customRoutineState.exercises.length === 0) {
                alert("Lütfen önce taslağınıza en az 1 egzersiz ekleyin.");
                return;
            }

            const title = (document.getElementById('customWorkoutTitleInput')?.value || '').trim() || "Özel Çelik Programım";
            const rest = parseInt(document.getElementById('customWorkoutRestSelect')?.value) || 60;
            const exercisesList = customRoutineState.exercises.map(item => {
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                return ex ? Object.assign({}, ex, { targetSets: item.sets, targetReps: item.reps }) : null;
            }).filter(Boolean);

            const progId = customRoutineState.editingProgramId || ('custom_' + Date.now());
            const workoutObj = {
                id: progId,
                title: title,
                split: 'custom',
                splitName: title,
                style: 'classic',
                goal: 'hypertrophy',
                duration: Math.round(exercisesList.length * 7),
                scheme: { sets: 3, reps: '8-12', rest: rest },
                warmups: [
                    { name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ve dairesel ısıt." }
                ],
                exercises: exercisesList,
                finisher: { name: "Balistik Bitiş", desc: "Maksimum tempolu swing veya taşıma." },
                createdAt: Date.now(),
                isCustom: true
            };

            openAssignWorkoutCalendarModal(workoutObj);
        }

        // ==================== WORKOUT PREVIEW MODAL LOGIC ====================
        function previewWorkoutModal(workoutOrId) {
            let workout = null;
            if (typeof workoutOrId === 'string') {
                workout = getWorkoutDetailsForPlan({ id: workoutOrId });
            } else if (typeof workoutOrId === 'object' && workoutOrId !== null) {
                workout = workoutOrId;
            }

            if (!workout) {
                alert("Program detayları bulunamadı.");
                return;
            }

            const modal = document.getElementById('workoutPreviewModal');
            const titleEl = document.getElementById('previewModalTitle');
            const metaEl = document.getElementById('previewModalMeta');
            const listEl = document.getElementById('previewModalExercisesList');
            const actionsEl = document.getElementById('previewModalActions');
            if (!modal) return;

            const exercises = workout.exercises || [];
            const rest = (workout.scheme && workout.scheme.rest) || workout.rest || 60;
            const duration = workout.duration || Math.round(exercises.length * 7) || 45;
            const setsReps = workout.scheme ? `${workout.scheme.sets} Set x ${workout.scheme.reps}` : '3 Set x 8-12 Tekrar';

            if (titleEl) titleEl.innerText = workout.title || 'Program Detayı';
            if (metaEl) {
                const previewStyleLabels = {
                    superset: 'Süperset',
                    superset_light: 'Az Süperset',
                    superset_intense: 'Yoğun Süperset',
                    superset_max: 'Maksimum Süperset',
                    complex: 'Birleşik Akış (Kompleks)',
                    emom: 'EMOM Döngüsü',
                    straight: 'Klasik Düz Set',
                    classic: 'Klasik'
                };
                const styleLabel = previewStyleLabels[workout.style] || 'Klasik';
                const uniqueEquipLabels = [];
                exercises.forEach(ex => {
                    const dbEx = EXERCISES_DB.find(e => e.id === ex.id) || ex;
                    const labels = typeof getExerciseEquipmentLabels === 'function' ? getExerciseEquipmentLabels(dbEx) : [];
                    labels.forEach(lbl => {
                        if (!uniqueEquipLabels.includes(lbl)) uniqueEquipLabels.push(lbl);
                    });
                });
                const equipRowHtml = uniqueEquipLabels.length > 0 ? `
                    <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap; margin-top:6px; padding:6px 10px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px;">
                        <span style="font-size:10px; font-weight:800; color:#475569; text-transform:uppercase;">Kullanılan Aletler:</span>
                        ${uniqueEquipLabels.map(lbl => `<span style="font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:999px; background:#0F172A; color:#FFFFFF;">${escapeHTML(lbl)}</span>`).join('')}
                    </div>
                ` : '';
                metaEl.innerHTML = `
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <span class="meta-pill" style="font-size:11px; padding:4px 8px;">⏱️ ${duration} Dakika</span>
                        <span class="meta-pill" style="font-size:11px; padding:4px 8px;">🎯 ${exercises.length} Hareket (${setsReps})</span>
                        <span class="meta-pill" style="font-size:11px; padding:4px 8px;">⏳ ${rest}s Dinlenme</span>
                        <span class="meta-pill" style="font-size:11px; padding:4px 8px;">🏋️ ${escapeHTML(styleLabel)}</span>
                    </div>
                    ${equipRowHtml}
                `;
            }

            if (listEl) {
                listEl.innerHTML = exercises.map((ex, idx) => {
                    const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) || {};
                    const thumb = guide.form || ex.diagram || '';
                    const sets = ex.targetSets || (workout.scheme ? workout.scheme.sets : 3);
                    const reps = ex.targetReps || (workout.scheme ? workout.scheme.reps : '8-12');

                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:10px; padding:8px 10px;">
                            <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:0;">
                                <span style="font-size:12px; font-weight:900; color:#B45309; width:18px;">${idx + 1}.</span>
                                <div class="ex-thumb-wrap" style="width:38px; height:38px; border-radius:6px; flex-shrink:0;">
                                    ${thumb ? `<img src="${thumb}" class="ex-thumb-img" alt="${escapeHTML(ex.name)}">` : '🏋️'}
                                </div>
                                <div style="min-width:0; flex:1;">
                                    <div style="font-size:13px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;" onclick="openExerciseDetailModal('${ex.id}')">
                                        ${escapeHTML(ex.name)}
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                                <span style="background:rgba(245,158,11,0.15); color:#B45309; border:1px solid rgba(245,158,11,0.3); font-size:11px; font-weight:800; border-radius:4px; padding:3px 7px;">
                                    ${sets} x ${reps}
                                </span>
                                <button type="button" class="wk-ex-i-btn" onclick="openExerciseQuickInfoModal('${ex.id}')" title="Bilgi">i</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            if (actionsEl) {
                const escapedTitle = escapeHTML(workout.title || 'Program').replace(/'/g, "\\'");
                const progId = workout.id || '';
                const isSavedCustom = progId.startsWith('saved_') || progId.startsWith('custom_');

                actionsEl.innerHTML = `
                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                        <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 10px; color:var(--cyan); border-color:var(--cyan);" onclick="closeWorkoutPreviewModal(); promptAssignToDay('${progId}', '${escapedTitle}', '${isSavedCustom ? 'custom_saved' : 'official'}', '${exercises.length} Hareket')">
                            📅 Güne Planla
                        </button>
                        ${isSavedCustom ? `
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 10px; color:var(--gold); border-color:var(--gold);" onclick="closeWorkoutPreviewModal(); editSavedProgram('${progId}')">
                                ✏️ Düzenle
                            </button>
                        ` : ''}
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="btn btn-gold" style="font-size:12px; padding:8px 14px; font-weight:900;" onclick="closeWorkoutPreviewModal(); currentGeneratedWorkout = window._activePreviewWorkout; startActiveWorkoutFromGenerated();">
                            ▶️ Şimdi Başlat
                        </button>
                        <button type="button" class="btn btn-outline" style="font-size:11px; padding:8px 12px;" onclick="closeWorkoutPreviewModal()">
                            Kapat
                        </button>
                    </div>
                `;
            }

            window._activePreviewWorkout = workout;
            modal.classList.add('active');
        }

        function closeWorkoutPreviewModal() {
            const modal = document.getElementById('workoutPreviewModal');
            if (modal) modal.classList.remove('active');
            window._activePreviewWorkout = null;
        }

        function editSavedProgram(progId) {
            const prog = getWorkoutDetailsForPlan({ id: progId });
            if (!prog) {
                alert("Program detayları bulunamadı.");
                return;
            }

            const cleanTitle = (prog.title || 'Özel Programım').replace(/⚔️|Çelik Kodu/g, '').trim();

            customRoutineState = {
                title: cleanTitle,
                rest: (prog.scheme && prog.scheme.rest) || prog.rest || 60,
                exercises: (prog.exercises || []).map(ex => ({
                    exId: ex.id || ex.exId,
                    sets: ex.targetSets || ex.sets || (prog.scheme ? prog.scheme.sets : 3),
                    reps: String(ex.targetReps || ex.reps || (prog.scheme ? prog.scheme.reps : '8-12')).replace(/\s+/g, ''),
                    weight: ''
                })).filter(item => Boolean(item.exId)),
                editingDayIdx: null,
                editingProgramId: progId,
                isEditingExisting: true
            };

            switchTab('activeWorkoutTab');
            toggleStudioAccordion(true);

            const titleInput = document.getElementById('customWorkoutTitleInput');
            const restSelect = document.getElementById('customWorkoutRestSelect');
            if (titleInput) titleInput.value = customRoutineState.title;
            if (restSelect) restSelect.value = customRoutineState.rest;

            renderCustomRoutine();
            renderRegionStatus();
            renderStudioExerciseCatalog();

            updateStudioEditingBanner(null, customRoutineState.title);

            setTimeout(() => {
                const sec = document.getElementById('studioSectionInWorkout');
                if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

        function assignRoutineToActiveDay(id, title, type, desc, keepModalOpen = false) {
            if (activeSchedulingDayIdx === null) return;
            const targetDay = activeSchedulingDayIdx;
            const isNext = (typeof activePlannerWeek !== 'undefined' && activePlannerWeek === 'next');
            const schedule = isNext ? getNextWeeklySchedule() : getWeeklySchedule();
            const details = getWorkoutDetailsForPlan({ id: id, type: type, title: title });
            const planObj = {
                id: id,
                title: title,
                type: type,
                desc: desc || '',
                rest: false,
                customWorkout: details ? JSON.parse(JSON.stringify(details)) : null
            };
            schedule[targetDay] = planObj;
            if (isNext) {
                saveNextWeeklySchedule(schedule);
            } else {
                saveWeeklySchedule(schedule);
            }

            if (activeSchedulingDateStr && typeof saveDateScheduleOverride === 'function') {
                saveDateScheduleOverride(activeSchedulingDateStr, planObj);
            }

            renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            playAlertSound();
            if (keepModalOpen) {
                openScheduleDayModal(targetDay, activeSchedulingDateStr);
            } else {
                closeScheduleDayModal();
            }
        }

        function assignGeneratedToActiveDay(keepModalOpen = false) {
            if (activeSchedulingDayIdx === null) return;
            const targetDay = activeSchedulingDayIdx;
            let workoutToAssign = currentGeneratedWorkout;
            if (!workoutToAssign) {
                try {
                    workoutToAssign = typeof readActiveLastGeneratedWorkout === 'function'
                        ? readActiveLastGeneratedWorkout()
                        : JSON.parse(localStorage.getItem('celik_kodu_last_generated_workout') || 'null');
                } catch(e) {}
            }
            if (!workoutToAssign) return;

            const isNext = (typeof activePlannerWeek !== 'undefined' && activePlannerWeek === 'next');
            const schedule = isNext ? getNextWeeklySchedule() : getWeeklySchedule();
            const planObj = {
                id: workoutToAssign.id || ('gen_' + Date.now()),
                title: workoutToAssign.title || 'Özel Sihirbaz Antrenmanı',
                type: 'custom_generated',
                desc: `${workoutToAssign.exercises.length} Hareket • ${workoutToAssign.duration} Dk`,
                rest: false,
                customWorkout: JSON.parse(JSON.stringify(workoutToAssign))
            };
            schedule[targetDay] = planObj;
            if (isNext) {
                saveNextWeeklySchedule(schedule);
            } else {
                saveWeeklySchedule(schedule);
            }

            if (activeSchedulingDateStr && typeof saveDateScheduleOverride === 'function') {
                saveDateScheduleOverride(activeSchedulingDateStr, planObj);
            }

            renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            playAlertSound();
            if (keepModalOpen) {
                openScheduleDayModal(targetDay, activeSchedulingDateStr);
            } else {
                closeScheduleDayModal();
            }
        }

        // ==================== UNIFIED WORKOUT ASSIGNMENT TO CALENDAR ENGINE ====================
        let pendingWorkoutToAssign = null;
        let assignModalTargetWeek = 'current';

        function openAssignWorkoutCalendarModal(workoutObj, preferredWeek = 'current') {
            if (!workoutObj) {
                if (typeof showToast === 'function') showToast("⚠️ Atanacak antrenman bulunamadı.");
                return;
            }
            pendingWorkoutToAssign = workoutObj;
            assignModalTargetWeek = preferredWeek === 'next' ? 'next' : 'current';
            renderAssignWorkoutCalendarModal();
            const modal = document.getElementById('assignWorkoutCalendarModal');
            if (modal) modal.classList.add('active');
        }
        window.openAssignWorkoutCalendarModal = openAssignWorkoutCalendarModal;

        function closeAssignWorkoutCalendarModal() {
            const modal = document.getElementById('assignWorkoutCalendarModal');
            if (modal) modal.classList.remove('active');
            pendingWorkoutToAssign = null;
        }
        window.closeAssignWorkoutCalendarModal = closeAssignWorkoutCalendarModal;

        function switchAssignModalWeek(week) {
            assignModalTargetWeek = week === 'next' ? 'next' : 'current';
            renderAssignWorkoutCalendarModal();
        }
        window.switchAssignModalWeek = switchAssignModalWeek;

        function renderAssignWorkoutCalendarModal() {
            const workout = pendingWorkoutToAssign;
            if (!workout) return;

            const infoEl = document.getElementById('assignModalWorkoutInfo');
            const todayBox = document.getElementById('assignModalQuickTodayBox');
            const gridEl = document.getElementById('assignModalDaysGrid');
            const currBtn = document.getElementById('assignModalWeekCurrentBtn');
            const nextBtn = document.getElementById('assignModalWeekNextBtn');

            const isNext = assignModalTargetWeek === 'next';
            if (currBtn) {
                currBtn.style.background = isNext ? 'transparent' : '#84CC16';
                currBtn.style.color = isNext ? 'var(--text-secondary)' : '#0A0E17';
                currBtn.style.borderColor = isNext ? 'transparent' : '#65A30D';
            }
            if (nextBtn) {
                nextBtn.style.background = isNext ? '#84CC16' : 'transparent';
                nextBtn.style.color = isNext ? '#0A0E17' : 'var(--text-secondary)';
                nextBtn.style.borderColor = isNext ? '#65A30D' : 'transparent';
            }

            const details = (workout.exercises && Array.isArray(workout.exercises)) 
                ? workout 
                : ((typeof getWorkoutDetailsForPlan === 'function' ? getWorkoutDetailsForPlan(workout) : null) || workout);
            const exCount = (details.exercises || []).length;
            const duration = details.duration || Math.round(exCount * 7) || 45;
            const titleStr = details.title || workout.title || 'Antrenman Programı';

            if (infoEl) {
                infoEl.innerHTML = `
                    <div style="background:rgba(245,158,11,0.1); border:1.5px solid var(--gold); border-radius:10px; padding:12px 14px;">
                        <span style="font-size:9.5px; font-weight:900; color:var(--gold); text-transform:uppercase; letter-spacing:0.5px;">ATANACAK PROGRAM</span>
                        <h4 style="font-size:15px; font-weight:900; color:#0F172A; margin:4px 0 2px;">${escapeHTML(titleStr)}</h4>
                        <div style="font-size:11px; color:var(--text-secondary);">
                            ⏱️ ${duration} Dk • 🎯 ${exCount} Hareket • ⏳ ${(details.scheme && details.scheme.rest) || details.rest || 60}s Dinlenme
                        </div>
                    </div>
                `;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayIdx = today.getDay();
            const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(today) : '';
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const tomorrowIdx = tomorrow.getDay();
            const tomorrowYMD = typeof formatDateYMD === 'function' ? formatDateYMD(tomorrow) : '';

            // Compute Monday of target week
            const diffToMonday = todayIdx === 0 ? -6 : 1 - todayIdx;
            const baseMonday = new Date(today);
            baseMonday.setDate(today.getDate() + diffToMonday);
            if (isNext) {
                baseMonday.setDate(baseMonday.getDate() + 7);
            }

            if (todayBox) {
                if (!isNext) {
                    todayBox.innerHTML = `
                        <button type="button" class="btn btn-gold" style="width:100%; font-size:13px; font-weight:900; padding:12px; display:flex; justify-content:center; align-items:center; gap:8px; box-shadow:0 0 18px rgba(245,158,11,0.35); border-radius:8px;" onclick="executeAssignWorkoutToDay(${todayIdx}, '${todayYMD}', 'current')">
                            <span>⚡</span> HEMEN BUGÜNE ATA & BAŞLAT (${DAY_NAMES_TR[todayIdx].toUpperCase()})
                        </button>
                    `;
                } else {
                    todayBox.innerHTML = `
                        <button type="button" class="btn btn-gold" style="width:100%; font-size:12.5px; font-weight:900; padding:11px; display:flex; justify-content:center; align-items:center; gap:8px; box-shadow:0 0 15px rgba(245,158,11,0.25); border-radius:8px;" onclick="executeAssignWorkoutToDay(1, null, 'next')">
                            <span>🚀</span> GELECEK HAFTA PAZARTESİYE ATA
                        </button>
                    `;
                }
            }

            if (gridEl) {
                const user = getActiveUser();
                const uid = user ? user.id : 'default';
                const nextSched = isNext ? getNextWeeklySchedule(uid) : null;
                const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon through Sun

                gridEl.innerHTML = dayOrder.map(dIdx => {
                    const dayDate = new Date(baseMonday);
                    dayDate.setDate(baseMonday.getDate() + (dIdx === 0 ? 6 : dIdx - 1));
                    const dYMD = typeof formatDateYMD === 'function' ? formatDateYMD(dayDate) : '';
                    const isCardToday = !isNext && dYMD === todayYMD;
                    const isCardTomorrow = !isNext && dYMD === tomorrowYMD;

                    const dayName = DAY_NAMES_TR[dIdx];
                    const dateFormatted = `${dayDate.getDate()} ${CAL_MONTH_NAMES_TR[dayDate.getMonth()]}`;

                    let plan;
                    if (isNext) {
                        plan = (nextSched && nextSched[dIdx]) ? nextSched[dIdx] : { rest: true };
                    } else {
                        plan = (typeof getPlanForDate === 'function') ? getPlanForDate(dayDate) : { rest: true };
                    }

                    const isRest = plan.rest || plan.type === 'rest';
                    const currentTitle = isRest ? 'Dinlenme & Toparlanma' : (plan.title || 'Mevcut Antrenman');

                    let badgeHtml = '';
                    if (isCardToday) {
                        badgeHtml = `<span style="font-size:9.5px; font-weight:900; background:var(--gold); color:#000; padding:2px 6px; border-radius:4px;">BUGÜN</span>`;
                    } else if (isCardTomorrow) {
                        badgeHtml = `<span style="font-size:9.5px; font-weight:800; background:rgba(56,189,248,0.2); color:var(--cyan); border:1px solid rgba(56,189,248,0.4); padding:2px 6px; border-radius:4px;">YARIN</span>`;
                    }

                    return `
                        <div style="background:#FFFFFF; border:1.5px solid ${isCardToday ? 'var(--gold)' : '#E2E8F0'}; border-radius:10px; padding:9px 12px; display:flex; justify-content:space-between; align-items:center; gap:8px; cursor:pointer; transition:all 0.15s ease;" onclick="executeAssignWorkoutToDay(${dIdx}, '${dYMD}', '${isNext ? 'next' : 'current'}')">
                            <div style="min-width:0; flex:1;">
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <strong style="font-size:13px; color:${isCardToday ? '#B45309' : '#0F172A'};">${dayName}</strong>
                                    <span style="font-size:11px; color:var(--text-secondary);">${dateFormatted}</span>
                                    ${badgeHtml}
                                </div>
                                <div style="font-size:11px; color:${isRest ? '#64748B' : '#334155'}; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                    ${isRest ? '🧘 Dinlenme' : `⚔️ ${escapeHTML(currentTitle)}`}
                                </div>
                            </div>
                            <button type="button" class="btn ${isCardToday ? 'btn-gold' : 'btn-outline'}" style="font-size:11px; padding:6px 12px; font-weight:800; flex-shrink:0;" onclick="event.stopPropagation(); executeAssignWorkoutToDay(${dIdx}, '${dYMD}', '${isNext ? 'next' : 'current'}')">
                                ${isCardToday ? '⚡ Bugüne Ata' : '➕ Seç & Ata'}
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }
        window.renderAssignWorkoutCalendarModal = renderAssignWorkoutCalendarModal;

        function executeAssignWorkoutToDay(dayIdx, dateStr = null, targetWeek = 'current') {
            if (!pendingWorkoutToAssign) return;
            const workout = pendingWorkoutToAssign;
            const user = getActiveUser();
            const uid = user ? user.id : 'default';
            const dayName = DAY_NAMES_TR[dayIdx] || '';
            const todayDate = new Date();
            const todayIdx = todayDate.getDay();
            const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
            const isAssigningToToday = (targetWeek === 'current' && (dayIdx === todayIdx || dateStr === todayYMD));

            const details = (workout.exercises && Array.isArray(workout.exercises)) 
                ? workout 
                : ((typeof getWorkoutDetailsForPlan === 'function' ? getWorkoutDetailsForPlan(workout) : null) || workout);
            const exercisesList = details.exercises || [];
            const cleanTitle = details.title || workout.title || `${dayName} Antrenmanı`;

            const planObj = {
                id: workout.id || ('assigned_' + dayIdx + '_' + Date.now()),
                title: cleanTitle,
                type: workout.type || (workout.isCustom ? 'custom_saved' : 'custom_generated'),
                desc: `${exercisesList.length} Hareket • ${details.duration || 45} Dk`,
                rest: false,
                customWorkout: JSON.parse(JSON.stringify(details)),
                exercises: exercisesList
            };

            if (targetWeek === 'next') {
                const nextSched = getNextWeeklySchedule(uid);
                nextSched[dayIdx] = planObj;
                saveNextWeeklySchedule(nextSched, uid);
                activePlannerWeek = 'next';
            } else {
                const sched = getWeeklySchedule(uid);
                sched[dayIdx] = planObj;
                saveWeeklySchedule(sched, uid);
                activePlannerWeek = 'current';

                const targetDateYMD = dateStr || (dayIdx === todayIdx ? todayYMD : null);
                if (targetDateYMD && typeof saveDateScheduleOverride === 'function') {
                    saveDateScheduleOverride(targetDateYMD, planObj, uid);
                }
            }

            if (workout.isCustom || workout.type === 'custom' || workout.type === 'custom_saved' || workout.type === 'custom_generated') {
                try {
                    if (planObj && planObj.customWorkout && typeof upsertUserCustomProgram === 'function') {
                        upsertUserCustomProgram(planObj.customWorkout, uid);
                    }
                } catch(e) {}
            }

            if (isAssigningToToday) {
                currentGeneratedWorkout = planObj.customWorkout;
                window.currentGeneratedWorkout = planObj.customWorkout;
                try {
                    if (typeof persistLastGeneratedWorkout === 'function') {
                        persistLastGeneratedWorkout(planObj.customWorkout, uid);
                    } else {
                        localStorage.setItem('celik_kodu_last_generated_workout', JSON.stringify(planObj.customWorkout));
                    }
                } catch(e) {}
            }

            closeAssignWorkoutCalendarModal();

            if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            if (typeof renderLibrary === 'function') renderLibrary();
            if (typeof playAlertSound === 'function') playAlertSound();

            switchTab('activeWorkoutTab');

            const targetLabel = isAssigningToToday
                ? `BUGÜNE (${dayName})`
                : (targetWeek === 'next' ? `Gelecek Hafta ${dayName}` : dayName);
            if (typeof showToast === 'function') {
                showToast(`🔥 "${cleanTitle}" başarıyla ${targetLabel} gününe atandı!`);
            }
        }
        window.executeAssignWorkoutToDay = executeAssignWorkoutToDay;

        function promptAssignGeneratedToAnyDay() {
            let workoutToAssign = currentGeneratedWorkout;
            if (!workoutToAssign) {
                try {
                    workoutToAssign = typeof readActiveLastGeneratedWorkout === 'function'
                        ? readActiveLastGeneratedWorkout()
                        : JSON.parse(localStorage.getItem('celik_kodu_last_generated_workout') || 'null');
                } catch(e) {}
            }
            if (!workoutToAssign) {
                if (typeof showToast === 'function') showToast("⚠️ Önce bir program oluşturmanız gerekmektedir.");
                return;
            }
            openAssignWorkoutCalendarModal(workoutToAssign);
        }

        function setDayAsRest() {
            if (activeSchedulingDayIdx === null) return;
            const isNext = activePlannerWeek === 'next';
            const user = getActiveUser();
            const schedule = isNext ? getNextWeeklySchedule(user.id) : getWeeklySchedule(user.id);
            const oldPlan = schedule[activeSchedulingDayIdx];
            if (oldPlan && oldPlan.googleEventId && typeof deleteCalendarEventQuiet === 'function') {
                deleteCalendarEventQuiet(oldPlan.googleEventId);
            }
            const restPlan = {
                id: 'rest',
                title: '🧘 Dinlenme & Aktif Toparlanma',
                type: 'rest',
                desc: 'Hafif yürüyüş, esneme veya tam istirahat',
                rest: true
            };
            schedule[activeSchedulingDayIdx] = restPlan;
            if (isNext) saveNextWeeklySchedule(schedule, user.id);
            else saveWeeklySchedule(schedule, user.id);

            if (activeSchedulingDateStr && typeof saveDateScheduleOverride === 'function') {
                saveDateScheduleOverride(activeSchedulingDateStr, restPlan);
            }

            closeScheduleDayModal();
            renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
        }

        function resetWeeklyScheduleTemplate(templateType = 'standard_3day') {
            let sched;
            if (templateType === 'standard_3day') {
                sched = getDefaultWeeklySchedule();
            } else if (templateType === 'split_4day') {
                sched = {
                    1: { id: 'la_forja_day1', title: '⚔️ Pzt: İtiş Zırhı (Omuz & Bacak)', type: 'official', desc: 'Pres + Squat • Şınav', rest: false },
                    2: { id: 'la_forja_day2', title: '⚔️ Salı: Çekiş & Sırt (Row & RDL)', type: 'official', desc: 'Row + RDL • Pullup', rest: false },
                    3: { id: 'rest', title: '🧘 Çarşamba: Dinlenme & Mobilite', type: 'rest', desc: 'Masaj rulosu & toparlanma', rest: true },
                    4: { id: 'la_forja_day3', title: '⚔️ Perşembe: Kompleks Bacak & Kondisyon', type: 'official', desc: 'Squat + Lunge • Snatch', rest: false },
                    5: { id: 'la_forja_day1', title: '⚔️ Cuma: Zırh Güçlendirme & Süperset', type: 'official', desc: 'Swing + Burpee Finisher', rest: false },
                    6: { id: 'rest', title: '🧘 Cumartesi: Dinlenme / Kardiyo', type: 'rest', desc: 'Hafif aerobik seans', rest: true },
                    0: { id: 'rest', title: '🧘 Pazar: Tam Dinlenme & Zihinsel Hazırlık', type: 'rest', desc: 'Yeni haftaya hazırlık', rest: true }
                };
            }
            saveWeeklySchedule(sched);
            renderActiveWorkout();
            playAlertSound();
            alert("✅ Haftalık antrenman şablonu güncellendi!");
        }

        function scheduleTomorrowFromGenerated() {
            let workoutToSchedule = currentGeneratedWorkout;
            if (!workoutToSchedule) {
                try {
                    workoutToSchedule = typeof readActiveLastGeneratedWorkout === 'function'
                        ? readActiveLastGeneratedWorkout()
                        : JSON.parse(localStorage.getItem('celik_kodu_last_generated_workout') || 'null');
                } catch(e) {}
            }
            if (!workoutToSchedule) {
                if (typeof showToast === 'function') showToast("⚠️ Atanacak hazır program bulunamadı.");
                return;
            }

            const todayDate = new Date();
            const tomorrow = new Date(todayDate);
            tomorrow.setDate(todayDate.getDate() + 1);
            const tomorrowIdx = tomorrow.getDay();
            const tomorrowYMD = typeof formatDateYMD === 'function' ? formatDateYMD(tomorrow) : '';

            pendingWorkoutToAssign = workoutToSchedule;
            executeAssignWorkoutToDay(tomorrowIdx, tomorrowYMD, 'current');
        }

        function promptAssignToDay(id, title, type, desc) {
            const details = (typeof getWorkoutDetailsForPlan === 'function')
                ? getWorkoutDetailsForPlan({ id: id, type: type, title: title })
                : null;
            const workoutObj = details || { id: id, title: title, type: type, desc: desc };
            if (!workoutObj.title) workoutObj.title = title;
            openAssignWorkoutCalendarModal(workoutObj);
        }


        // ==================== AKADEMİK KOÇ İSTASYONU KÖPRÜSÜ ====================
        let coachDirectiveLiveUnsub = null;

        // Web açılışında FitLAB direktiflerini otomatik dinleme/çekme stabilite için kapatıldı
        async function syncCoachDirectiveFromCloud() {
            return;
        }

        function parseDirectiveWorkout(fullReport, directiveTitle) {
            if (!fullReport) return null;
            const lines = fullReport.split('\n');
            const exercises = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('|') && trimmed.endsWith('|') && !trimmed.includes('---')) {
                    const lower = trimmed.toLowerCase();
                    if (lower.includes('blok') && lower.includes('hareket')) continue;
                    if (lower.includes('egzersiz') && lower.includes('set')) continue;
                    const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
                    if (cells.length >= 2) {
                        let rawName = cells[0].replace(/\*+/g, '').trim();
                        let setRepCell = cells[1] || '';
                        let note = cells.slice(2).join(' • ');

                        // Eğer ilk hücre A1, B1, 1, Blok vb. etiketse egzersiz adı 2. hücrededir
                        if (rawName.length <= 4 || /^[A-Z0-9\.\-\s]{1,5}$/i.test(rawName) || ['blok', 'bitiriş', 'finisher', 'isinma'].includes(rawName.toLowerCase())) {
                            rawName = (cells[1] || '').replace(/\*+/g, '').trim();
                            setRepCell = cells[2] || '';
                            note = cells.slice(3).join(' • ');
                        }

                        if (!rawName || rawName.length < 3) continue;

                        let sets = 3;
                        let reps = '8-12';
                        const srMatch = setRepCell.match(/(\d+)\s*[xX*]\s*([0-9\-–]+)/);
                        if (srMatch) {
                            sets = parseInt(srMatch[1], 10) || 3;
                            reps = srMatch[2] || '8-12';
                        } else {
                            const sMatch = setRepCell.match(/(\d+)\s*set/i);
                            if (sMatch) sets = parseInt(sMatch[1], 10) || 3;
                            const rMatch = setRepCell.match(/([0-9\-–]+)\s*(?:tekrar|rep)/i);
                            if (rMatch) reps = rMatch[1];
                        }

                        let matchedEx = null;
                        if (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) {
                            const normRaw = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
                            matchedEx = EXERCISES_DB.find(e => {
                                const n = (e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                                return n === normRaw || n.includes(normRaw) || normRaw.includes(n);
                            });
                        }

                        const exObj = {
                            id: matchedEx ? matchedEx.id : ('gen_' + Math.random().toString(36).substring(2, 8)),
                            name: matchedEx ? matchedEx.name : rawName,
                            category: matchedEx ? matchedEx.category : 'dumbbell',
                            equipment: matchedEx ? matchedEx.equipment : 'Dambıl & Sehpa',
                            targetSets: sets,
                            targetReps: reps,
                            note: note || ''
                        };
                        if (matchedEx) {
                            exObj.primaryMuscles = matchedEx.primaryMuscles;
                            exObj.level = matchedEx.level;
                        }
                        exercises.push(exObj);
                    }
                }
            }

            if (exercises.length === 0) return null;

            return {
                id: 'directive_workout_' + Date.now(),
                title: directiveTitle || 'FitLAB Antrenman Protokolü',
                duration: Math.max(30, Math.round(exercises.length * 6.5)),
                exercises: exercises,
                isDirective: true,
                source: 'fitlab_consult'
            };
        }

        // ==================== CUMA GÜNÜ & ÖZEL PROGRAM KURTARMA MOTORU ====================
        function recoverLostFridayWorkout(targetUid) {
            // Kullanıcı onayı olmaksızın otomatik takvime program ekleme devre dışı bırakıldı.
            return null;
        }

        function processIncomingCoachDirective(uid, data) {
            try {
                if (!data) return;
                // Sadece direktif taslağını kaydet, asla kullanıcının takvimini otomatik ezme!
                if (!data.parsedWorkout && data.fullReport && typeof parseDirectiveWorkout === 'function') {
                    data.parsedWorkout = parseDirectiveWorkout(data.fullReport, data.title);
                }
                localStorage.setItem(`celik_kodu_coach_directive_${uid}`, JSON.stringify(data));
                if (typeof renderActiveWorkout === 'function') {
                    renderActiveWorkout();
                }
            } catch(e) {
                console.warn("processIncomingCoachDirective hatası:", e);
            }
        }

        // ==================== TAKVİMİ TAMAMEN SIFIRLAMA & İZİNSİZ ATAMALARI TEMİZLEME ====================
        function purgeAllUnrequestedSchedules(targetUid) {
            try {
                const user = (typeof getActiveUser === 'function') ? getActiveUser() : null;
                const uid = targetUid || (user ? user.id : 'default');
                const emptySched = getDefaultWeeklySchedule();

                saveWeeklySchedule(emptySched, uid);
                saveNextWeeklySchedule(emptySched, uid);

                localStorage.removeItem(`celik_kodu_date_schedule_${uid}`);
                localStorage.removeItem(`celik_kodu_date_overrides_${uid}`);
                localStorage.removeItem(`celik_kodu_coach_directive_${uid}`);
                localStorage.removeItem(`celik_kodu_ai_program_${uid}`);
                localStorage.removeItem(`celik_kodu_applied_coach_directive_${uid}`);
                localStorage.removeItem(`celik_kodu_pending_ai_weekly_${uid}`);

                // Tüm kullanıcıların yerel hafızasındaki otomatik atanmış programları da temizle
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && (k.startsWith('celik_kodu_weekly_schedule_') || k.startsWith('celik_kodu_next_weekly_schedule_'))) {
                        localStorage.setItem(k, JSON.stringify(emptySched));
                    }
                    if (k && (k.startsWith('celik_kodu_date_schedule_') || k.startsWith('celik_kodu_date_overrides_'))) {
                        localStorage.removeItem(k);
                    }
                    if (k && (k.startsWith('celik_kodu_coach_directive_') || k.startsWith('celik_kodu_ai_program_'))) {
                        localStorage.removeItem(k);
                    }
                }

                if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                if (typeof showToast === 'function') showToast("🧹 Takvim tamamen sıfırlandı. Tüm günler dinlenmeye alındı.");
            } catch(e) {
                console.warn("purgeAllUnrequestedSchedules hatası:", e);
            }
        }
        window.purgeAllUnrequestedSchedules = purgeAllUnrequestedSchedules;

        function assignDirectiveWorkoutToToday(uid) {
            try {
                const raw = localStorage.getItem(`celik_kodu_coach_directive_${uid}`);
                if (!raw) {
                    showToast("⚠️ FitLAB direktifi bulunamadı.");
                    return;
                }
                const dir = JSON.parse(raw);
                let workout = dir.parsedWorkout;
                if (!workout && dir.fullReport) {
                    workout = parseDirectiveWorkout(dir.fullReport, dir.title);
                }
                if (!workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
                    showToast("⚠️ Direktif içerisinde egzersiz tablosu bulunamadı.");
                    return;
                }

                const todayIdx = new Date().getDay();
                const todayName = DAY_NAMES_TR[todayIdx];
                const schedule = getWeeklySchedule();
                schedule[todayIdx] = {
                    id: workout.id || ('directive_' + Date.now()),
                    title: workout.title || 'FitLAB Özel Seansı',
                    type: 'custom_saved',
                    desc: `${workout.exercises.length} Hareket • ${workout.duration || 45} Dk`,
                    rest: false,
                    customWorkout: JSON.parse(JSON.stringify(workout)),
                    exercises: workout.exercises
                };
                saveWeeklySchedule(schedule);

                // Kütüphaneye de kaydet
                const user = getActiveUser();
                if (user && typeof upsertUserCustomProgram === 'function') {
                    const progEntry = workout.id ? workout : Object.assign({}, workout, { id: schedule[todayIdx].id, isCustom: true });
                    upsertUserCustomProgram(progEntry, user.id);
                }

                renderActiveWorkout();
                playAlertSound();
                showToast(`🔥 "${workout.title}" bugüne (${todayName}) başarıyla atandı! Hemen seansı başlatabilirsiniz.`);
            } catch(e) {
                console.error("assignDirectiveWorkoutToToday hatası:", e);
                showToast("⚠️ Antrenman bugüne atanırken bir hata oluştu.");
            }
        }

        function previewDirectiveWorkoutModal(uid) {
            try {
                const raw = localStorage.getItem(`celik_kodu_coach_directive_${uid}`);
                if (!raw) return;
                const dir = JSON.parse(raw);
                let workout = dir.parsedWorkout;
                if (!workout && dir.fullReport) {
                    workout = parseDirectiveWorkout(dir.fullReport, dir.title);
                }
                if (!workout) {
                    showToast("⚠️ Önizlenecek egzersiz listesi bulunamadı.");
                    return;
                }
                previewWorkoutModal(workout);
            } catch(e) {}
        }

        function copyDayProgramToToday(sourceDayIdx, sourceDateStr = null, clearSourceDate = false) {
            const todayDate = new Date();
            const todayIdx = todayDate.getDay();
            const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
            const cleanSourceDate = sourceDateStr ? String(sourceDateStr).trim() : '';

            if ((cleanSourceDate && cleanSourceDate === todayYMD) || (!cleanSourceDate && sourceDayIdx === todayIdx)) {
                showToast("ℹ️ Bu program zaten bugünün programı.");
                closeScheduleDayModal();
                return;
            }
            if (clearSourceDate && typeof moveScheduledWorkoutToDay === 'function') {
                moveScheduledWorkoutToDay(sourceDayIdx, todayIdx, cleanSourceDate, todayYMD);
                return;
            }
            const schedule = getWeeklySchedule();
            let sourcePlan = null;
            if (cleanSourceDate && typeof getPlanForDate === 'function') {
                sourcePlan = getPlanForDate(new Date(cleanSourceDate + 'T00:00:00'));
            }
            if (!sourcePlan) {
                sourcePlan = schedule[sourceDayIdx];
            }
            if (!sourcePlan || sourcePlan.rest) {
                alert("Taşınacak/kopyalanacak gün bir dinlenme günü veya boş.");
                return;
            }

            const clonedPlan = JSON.parse(JSON.stringify(sourcePlan));
            clonedPlan.rest = false;
            schedule[todayIdx] = clonedPlan;

            if (clearSourceDate) {
                const restPlan = {
                    id: 'rest',
                    title: '🧘 Dinlenme & Aktif Toparlanma',
                    type: 'rest',
                    desc: 'Bugüne taşındı • İstirahat',
                    rest: true
                };
                if (cleanSourceDate && typeof saveDateScheduleOverride === 'function') {
                    saveDateScheduleOverride(cleanSourceDate, restPlan);
                }
                if (sourceDayIdx !== todayIdx) {
                    schedule[sourceDayIdx] = restPlan;
                }
            }

            saveWeeklySchedule(schedule);

            if (todayYMD && typeof saveDateScheduleOverride === 'function') {
                saveDateScheduleOverride(todayYMD, clonedPlan);
            }

            activePlannerWeek = 'current';
            closeScheduleDayModal();
            renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            playAlertSound();
            if (clearSourceDate) {
                showToast(`📅 ${DAY_NAMES_TR[sourceDayIdx]} antrenmanı bugüne (${DAY_NAMES_TR[todayIdx]}) taşındı (başlatılmadı, hazır bekliyor)!`);
            } else {
                showToast(`📋 ${DAY_NAMES_TR[sourceDayIdx]} antrenmanı bugüne (${DAY_NAMES_TR[todayIdx]}) kopyalandı!`);
            }
        }

        function assignGeneratedToToday() {
            let workout = currentGeneratedWorkout;
            if (!workout) {
                try {
                    workout = typeof readActiveLastGeneratedWorkout === 'function'
                        ? readActiveLastGeneratedWorkout()
                        : JSON.parse(localStorage.getItem('celik_kodu_last_generated_workout') || 'null');
                } catch(e) {}
            }
            if (!workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
                showToast("⚠️ Atanacak hazır program bulunamadı.");
                return;
            }

            const todayDate = new Date();
            const todayIdx = todayDate.getDay();
            const todayYMD = typeof formatDateYMD === 'function' ? formatDateYMD(todayDate) : '';
            pendingWorkoutToAssign = workout;
            executeAssignWorkoutToDay(todayIdx, todayYMD, 'current');
        }

        let aiProgramLiveUnsub = null;

        // Web açılışında FitLAB özel programlarını otomatik dinleme/çekme stabilite için kapatıldı
        async function syncCustomProgramsFromCloud() {
            return;
        }

        function processIncomingAiProgram(uid, data) {
            try {
                const currentRaw = localStorage.getItem(`celik_kodu_ai_program_${uid}`);
                const current = currentRaw ? JSON.parse(currentRaw) : null;
                const isNew = !current || (data.assignedAt && data.assignedAt !== current.assignedAt);
                if (isNew) {
                    data.dismissed = false;
                    data.applied = false;
                } else if (current) {
                    data.dismissed = current.dismissed;
                    data.applied = current.applied;
                }

                localStorage.setItem(`celik_kodu_ai_program_${uid}`, JSON.stringify(data));

                let days = data.structuredDays;
                if (!Array.isArray(days) || days.length === 0) {
                    days = parseMarkdownProgramClient(data.programText);
                }
                if (Array.isArray(days) && days.length > 0) {
                    const nextSchedule = convertParsedDaysToWeeklySchedule(days);
                    saveNextWeeklySchedule(nextSchedule, uid);
                }

                if (typeof renderActiveWorkout === 'function') {
                    renderActiveWorkout();
                }
            } catch(e) {
                console.warn("processIncomingAiProgram hatası:", e);
            }
        }

        function getCoachStationDirectiveHtml(uid) {
            if (!uid) return '';
            try {
                const raw = localStorage.getItem(`celik_kodu_coach_directive_${uid}`);
                if (!raw) return '';
                const dir = JSON.parse(raw);
                if (!dir || !dir.active) return '';

                let workout = dir.parsedWorkout;
                if (!workout && dir.fullReport && typeof parseDirectiveWorkout === 'function') {
                    workout = parseDirectiveWorkout(dir.fullReport, dir.title);
                    if (workout) {
                        dir.parsedWorkout = workout;
                        localStorage.setItem(`celik_kodu_coach_directive_${uid}`, JSON.stringify(dir));
                    }
                }

                const todayIdx = new Date().getDay();
                const todayName = DAY_NAMES_TR[todayIdx];

                let formattedText = escapeHTML(dir.text || '')
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0F172A;">$1</strong>')
                    .replace(/•/g, '<span style="color:var(--gold); margin-right:4px;">•</span>')
                    .replace(/#/g, '')
                    .trim();

                const isExpanded = !!localStorage.getItem(`celik_kodu_coach_dir_expanded_${uid}`);

                return `
                    <div class="collapsible-panel ${isExpanded ? 'open' : ''}" id="coachDirectivePanel_${uid}" style="border:1.5px solid var(--gold); box-shadow:0 0 25px rgba(245,158,11,0.25); margin-bottom:12px;">
                        <div class="collapsible-panel-header" onclick="toggleCoachDirectivePanel('${uid}')" style="background:rgba(245,158,11,0.12);">
                            <div class="collapsible-panel-title">
                                <span class="icon">🎓</span>
                                <span class="text" style="color:var(--gold); font-weight:900;">${escapeHTML(dir.title || 'FİTLAB DİREKTİFİ')}</span>
                            </div>
                            <div class="collapsible-panel-meta">
                                <span class="collapsible-panel-badge" style="background:var(--gold); color:#000; font-weight:900;">${workout ? `${workout.exercises.length} Hareket` : 'Reçete'}</span>
                                <span class="collapsible-panel-arrow">▼</span>
                            </div>
                        </div>
                        <div class="collapsible-panel-body">
                            <div style="font-size:12px; color:#475569; line-height:1.55; margin-bottom:12px;">
                                ${formattedText}
                            </div>
                            ${workout ? `
                                <div style="margin-bottom:12px; background:#F8FAFC; border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                                    <div>
                                        <div style="font-size:13px; font-weight:900; color:#0F172A;">⚡ ${escapeHTML(workout.title)}</div>
                                        <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                            🎯 ${workout.exercises.length} Egzersiz • ⏱️ ${workout.duration || 45} Dk Hedef Süre
                                        </div>
                                    </div>
                                    <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                        <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 10px; color:var(--cyan); border-color:var(--cyan);" onclick="previewDirectiveWorkoutModal('${uid}')">
                                            👁️ Hareketleri Gör (${workout.exercises.length})
                                        </button>
                                        <button type="button" class="btn btn-gold" style="font-size:12px; padding:8px 16px; font-weight:900; box-shadow:0 0 15px rgba(245,158,11,0.4);" onclick="assignDirectiveWorkoutToToday('${uid}')">
                                            🔥 BU ANTRENMANI BUGÜNE (${todayName.toUpperCase()}) ATA & BAŞLAT
                                        </button>
                                    </div>
                                </div>
                            ` : ''}
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                                ${dir.fullReport ? `
                                    <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 12px; border-color:var(--gold); color:var(--gold); font-weight:700;" onclick="openFullAcademicReportModal('${uid}')">
                                        🔬 Bilimsel Analiz Raporunu İncele
                                    </button>
                                ` : '<div></div>'}
                                <button type="button" onclick="dismissCoachStationDirective('${uid}')" style="background:transparent; border:1px solid #E2E8F0; border-radius:6px; color:var(--text-muted); cursor:pointer; font-size:11px; padding:5px 10px;" title="Direktifi Gizle">
                                    ✕ Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } catch(e) {
                console.warn("getCoachStationDirectiveHtml hatası:", e);
                return '';
            }
        }

        function toggleCoachDirectivePanel(uid) {
            const panel = document.getElementById(`coachDirectivePanel_${uid}`);
            if (!panel) return;
            const isOpen = panel.classList.toggle('open');
            if (isOpen) {
                localStorage.setItem(`celik_kodu_coach_dir_expanded_${uid}`, '1');
            } else {
                localStorage.removeItem(`celik_kodu_coach_dir_expanded_${uid}`);
            }
        }

        function toggleNextWeekHeroPanel(uid) {
            const panel = document.getElementById(`nextWeekHeroPanel_${uid}`);
            if (!panel) return;
            const isOpen = panel.classList.toggle('open');
            if (isOpen) {
                localStorage.setItem(`celik_kodu_next_week_expanded_${uid}`, '1');
            } else {
                localStorage.removeItem(`celik_kodu_next_week_expanded_${uid}`);
            }
        }

        function dismissCoachStationDirective(uid) {
            try {
                const raw = localStorage.getItem(`celik_kodu_coach_directive_${uid}`);
                if (raw) {
                    const dir = JSON.parse(raw);
                    dir.active = false;
                    localStorage.setItem(`celik_kodu_coach_directive_${uid}`, JSON.stringify(dir));
                    renderActiveWorkout();
                }
            } catch(e) {}
        }

        function openFullAcademicReportModal(uid) {
            try {
                const raw = localStorage.getItem(`celik_kodu_coach_directive_${uid}`);
                if (!raw) return;
                const dir = JSON.parse(raw);
                if (!dir.fullReport) return;

                const modal = document.getElementById('academicReportModal');
                const content = document.getElementById('academicReportModalContent');
                if (modal && content) {
                    content.innerText = dir.fullReport;
                    modal.style.display = 'flex';
                }
            } catch(e) {}
        }

        // ==================== GOOGLE & DEVICE CALENDAR LIVE SYNC ENGINE ====================
        const FITLAB_CALENDAR_SUMMARY = 'FitLab • Antrenmanlarım';
        const FITLAB_CALENDAR_DESC = 'Çelik Kodu & FitLab Antrenman Programı ve İlerleyiş Takvimi';

        function getCalendarPreferences(uid) {
            const user = getActiveUser();
            const targetUid = uid || (user ? user.id : 'guest');
            const key = `celik_kodu_calendar_prefs_${targetUid}`;
            try {
                const raw = localStorage.getItem(key);
                if (raw) return JSON.parse(raw);
            } catch(e) {}
            return {
                defaultTime: '18:30',
                reminderMin: 30,
                autoSync: true,
                customClientId: ''
            };
        }

        function saveCalendarPreferences(newPrefs, uid) {
            const user = getActiveUser();
            const targetUid = uid || (user ? user.id : 'guest');
            const key = `celik_kodu_calendar_prefs_${targetUid}`;
            const current = getCalendarPreferences(targetUid);
            const timeEl = document.getElementById('calPrefDefaultTime');
            const remEl = document.getElementById('calPrefReminderMin');
            if (timeEl) current.defaultTime = timeEl.value || '18:30';
            if (remEl) current.reminderMin = parseInt(remEl.value, 10) || 30;
            if (newPrefs) Object.assign(current, newPrefs);
            try {
                localStorage.setItem(key, JSON.stringify(current));
            } catch(e) {}
        }

        function getGoogleCalendarToken(uid) {
            const user = getActiveUser();
            const targetUid = uid || (user ? user.id : 'guest');
            try {
                const raw = localStorage.getItem(`celik_kodu_gcal_token_${targetUid}`) || sessionStorage.getItem(`celik_kodu_gcal_token_${targetUid}`);
                if (!raw) return null;
                const tokenData = JSON.parse(raw);
                if (tokenData && tokenData.token && tokenData.expiresAt && tokenData.expiresAt > Date.now()) {
                    return tokenData.token;
                }
            } catch(e) {}
            return null;
        }

        function saveGoogleCalendarToken(token, expiresInSec = 3600, uid) {
            const user = getActiveUser();
            const targetUid = uid || (user ? user.id : 'guest');
            const data = {
                token: token,
                savedAt: Date.now(),
                expiresAt: Date.now() + (expiresInSec * 1000)
            };
            try {
                localStorage.setItem(`celik_kodu_gcal_token_${targetUid}`, JSON.stringify(data));
                sessionStorage.setItem(`celik_kodu_gcal_token_${targetUid}`, JSON.stringify(data));
            } catch(e) {}
        }

        function clearGoogleCalendarToken(uid) {
            const user = getActiveUser();
            const targetUid = uid || (user ? user.id : 'guest');
            try {
                localStorage.removeItem(`celik_kodu_gcal_token_${targetUid}`);
                sessionStorage.removeItem(`celik_kodu_gcal_token_${targetUid}`);
                localStorage.removeItem(`celik_kodu_gcal_calendar_id_${targetUid}`);
            } catch(e) {}
        }

        function isGoogleCalendarConnected(uid) {
            return !!getGoogleCalendarToken(uid);
        }

        function getStoredCalendarId(uid) {
            const user = getActiveUser();
            const targetUid = uid || (user ? user.id : 'guest');
            return localStorage.getItem(`celik_kodu_gcal_calendar_id_${targetUid}`);
        }

        function saveStoredCalendarId(calId, uid) {
            const user = getActiveUser();
            const targetUid = uid || (user ? user.id : 'guest');
            try {
                localStorage.setItem(`celik_kodu_gcal_calendar_id_${targetUid}`, calId);
            } catch(e) {}
        }

        const DEFAULT_GOOGLE_CLIENT_ID = "304204226730-rrs9u26odr8f2e1j0lpndlmba36ah20j.apps.googleusercontent.com";

        function getGoogleClientId() {
            const prefs = getCalendarPreferences();
            if (prefs && prefs.customClientId && prefs.customClientId.trim()) {
                return prefs.customClientId.trim();
            }
            const custom = localStorage.getItem('celik_kodu_gcal_custom_client_id');
            if (custom && custom.trim()) return custom.trim();
            return DEFAULT_GOOGLE_CLIENT_ID;
        }

        function saveCustomGoogleClientId(val) {
            const clean = (val || '').trim();
            try {
                localStorage.setItem('celik_kodu_gcal_custom_client_id', clean);
            } catch(e) {}
            const prefs = getCalendarPreferences();
            prefs.customClientId = clean;
            saveCalendarPreferences(prefs);
            if (typeof showToast === 'function') showToast("✅ Google Client ID kaydedildi.");
        }

        function applyManualGoogleToken() {
            const input = document.getElementById('calCustomTokenInput');
            if (!input || !input.value.trim()) {
                alert("Lütfen geçerli bir Google OAuth erişim belirteci (Access Token) yapıştırın.");
                return;
            }
            saveGoogleCalendarToken(input.value.trim(), 7200);
            input.value = '';
            if (typeof showToast === 'function') showToast("✅ Google erişim belirteci uygulandı! Test ediliyor...");
            performFullCalendarSync().then(() => {
                if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
                renderCalendarConnectionCard();
            });
        }

        function disconnectGoogleCalendar() {
            if (confirm("Google Takvim bağlantısını kesmek istediğinize emin misiniz?")) {
                clearGoogleCalendarToken();
                if (typeof showToast === 'function') showToast("ℹ️ Google Takvim bağlantısı kaldırıldı.");
                if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
                renderCalendarConnectionCard();
            }
        }

        async function callGoogleCalendarApi(endpoint, options = {}) {
            const token = getGoogleCalendarToken();
            if (!token) throw new Error("Google Takvim oturumu açık değil.");
            const url = endpoint.startsWith('http') ? endpoint : `https://www.googleapis.com/calendar/v3${endpoint}`;
            const headers = Object.assign({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }, options.headers || {});

            const resp = await fetch(url, Object.assign({}, options, { headers }));
            if (resp.status === 401) {
                clearGoogleCalendarToken();
                throw new Error("Google oturum süresi doldu. Lütfen tekrar bağlanın.");
            }
            if (resp.status === 204) return null;
            if (!resp.ok) {
                const errText = await resp.text();
                let errMsg = `Google API Hatası (${resp.status})`;
                try {
                    const parsed = JSON.parse(errText);
                    if (parsed.error && parsed.error.message) errMsg = parsed.error.message;
                } catch(e) {}
                throw new Error(errMsg);
            }
            return await resp.json();
        }

        async function getOrCreateFitLabCalendar() {
            let calId = getStoredCalendarId();
            if (calId) {
                try {
                    const existing = await callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}`);
                    if (existing && existing.id) return existing.id;
                } catch(e) {
                    console.warn("Kayıtlı FitLab takvim kimliği doğrulanamadı, yeniden aranıyor...", e);
                }
            }

            // Takvim listesinden ara
            try {
                const calList = await callGoogleCalendarApi('/users/me/calendarList');
                if (calList && Array.isArray(calList.items)) {
                    const found = calList.items.find(c => 
                        (c.summary && (c.summary.includes('FitLab') || c.summary.includes('Çelik Kodu')))
                    );
                    if (found && found.id) {
                        saveStoredCalendarId(found.id);
                        return found.id;
                    }
                }
            } catch(e) {
                console.warn("Takvim listesi alınamadı:", e);
            }

            // Yoksa oluştur
            const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';
            try {
                const newCal = await callGoogleCalendarApi('/calendars', {
                    method: 'POST',
                    body: JSON.stringify({
                        summary: FITLAB_CALENDAR_SUMMARY,
                        description: FITLAB_CALENDAR_DESC,
                        timeZone: userTz
                    })
                });

                if (newCal && newCal.id) {
                    saveStoredCalendarId(newCal.id);
                    return newCal.id;
                }
            } catch(createErr) {
                console.warn("Özel takvim oluşturulamadı, birincil takvime yönlendiriliyor:", createErr);
            }
            return 'primary';
        }

        function formatIsoDateTimeWithOffset(date) {
            const pad = n => String(n).padStart(2, '0');
            const year = date.getFullYear();
            const month = pad(date.getMonth() + 1);
            const day = pad(date.getDate());
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());
            const tzOffset = -date.getTimezoneOffset();
            const sign = tzOffset >= 0 ? '+' : '-';
            const offH = pad(Math.floor(Math.abs(tzOffset) / 60));
            const offM = pad(Math.abs(tzOffset) % 60);
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offH}:${offM}`;
        }

        function getDateForScheduleDay(dayIdx, isNextWeek = false) {
            const now = new Date();
            const currentDay = now.getDay();
            const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
            const monday = new Date(now);
            monday.setHours(0, 0, 0, 0);
            monday.setDate(now.getDate() + diffToMonday);
            if (isNextWeek) {
                monday.setDate(monday.getDate() + 7);
            }
            const offset = dayIdx === 0 ? 6 : (dayIdx - 1);
            const targetDate = new Date(monday);
            targetDate.setDate(monday.getDate() + offset);
            return targetDate;
        }

        function buildEventDescription(plan, dayIdx, duration = 50, restSec = 60) {
            const workoutDetails = getWorkoutDetailsForPlan(plan) || {};
            const exercises = workoutDetails.exercises || plan.exercises || [];
            const schemeStr = workoutDetails.scheme ? `${workoutDetails.scheme.sets} Set x ${workoutDetails.scheme.reps}` : `${exercises.length} Hareket`;
            
            let desc = `🏋️ FITLAB • ÇELİK KODU ANTRENMAN SEANSI\n`;
            desc += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            desc += `🎯 Program: ${plan.title || 'Antrenman Seansı'}\n`;
            desc += `⏱️ Tahmini Süre: ${duration} Dakika\n`;
            desc += `⏳ Dinlenme: ${restSec} Saniye\n`;
            desc += `📊 Egzersiz Sayısı: ${exercises.length} Hareket (${schemeStr})\n\n`;

            if (exercises.length > 0) {
                desc += `📋 EGZERSİZ PLANI & HEDEFLER:\n`;
                exercises.forEach((ex, idx) => {
                    const sets = ex.targetSets || (workoutDetails.scheme ? workoutDetails.scheme.sets : 3);
                    const reps = ex.targetReps || (workoutDetails.scheme ? workoutDetails.scheme.reps : '8-12');
                    const anatomy = typeof getExerciseAnatomy === 'function' ? getExerciseAnatomy(ex) : null;
                    desc += `${idx + 1}. ${ex.name || 'Egzersiz'} — ${sets} Set x ${reps}`;
                    if (anatomy && anatomy.primary) desc += ` (🎯 ${anatomy.primary})`;
                    desc += `\n`;
                });
            } else if (plan.desc) {
                desc += `📋 Detay: ${plan.desc}\n`;
            }

            desc += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            desc += `🚀 Salona girdiğinizde tek dokunuşla seansı başlatın:\n`;
            desc += `👉 https://fitness.kantarci.io/?startWorkout=${encodeURIComponent(plan.id || '')}&day=${dayIdx}\n`;
            return desc;
        }

        async function syncFitLabToGoogleCalendar(targetWeek = null) {
            const week = targetWeek || activePlannerWeek || 'current';
            const isNext = week === 'next';
            const user = getActiveUser();
            const schedule = isNext ? getNextWeeklySchedule(user.id) : getWeeklySchedule(user.id);
            const prefs = getCalendarPreferences(user.id);
            const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Istanbul';

            const calId = await getOrCreateFitLabCalendar();
            let createdCount = 0;
            let updatedCount = 0;
            let cleanedDuplicates = 0;

            // 1. Bu haftaya ait mevcut Google Takvim etkinliklerini çek
            const startOfWeek = getDateForScheduleDay(1, isNext);
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = getDateForScheduleDay(0, isNext);
            endOfWeek.setHours(23, 59, 59, 999);

            const startIso = formatIsoDateTimeWithOffset(startOfWeek);
            const endIso = formatIsoDateTimeWithOffset(endOfWeek);

            let existingEvents = [];
            try {
                const eventsData = await callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}/events?timeMin=${encodeURIComponent(startIso)}&timeMax=${encodeURIComponent(endIso)}&singleEvents=true`);
                existingEvents = (eventsData && Array.isArray(eventsData.items)) ? eventsData.items : [];
            } catch(e) {
                console.warn("Mevcut takvim etkinlikleri çekilemedi:", e);
            }

            // Etkinlikleri gün tarihine (YYYY-MM-DD) göre grupla
            const eventsByDate = {};
            existingEvents.forEach(ev => {
                if (!ev.start) return;
                const isFitLab = (ev.extendedProperties?.private?.fitLabSource === 'FitLab_PWA') || (ev.summary && ev.summary.includes('FitLab'));
                if (!isFitLab) return;

                const dStr = (ev.start.dateTime || ev.start.date || '').substring(0, 10);
                if (!dStr) return;
                if (!eventsByDate[dStr]) eventsByDate[dStr] = [];
                eventsByDate[dStr].push(ev);
            });

            // 2. Her gün için senkronizasyon ve mükerrer temizliği yap
            for (let d = 0; d < 7; d++) {
                try {
                    const plan = schedule[d];
                    if (!plan) continue;

                    const targetDate = getDateForScheduleDay(d, isNext);
                    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
                    const dayEvents = eventsByDate[dateKey] || [];

                    // Dinlenme günüyse o güne ait tüm etkinlikleri takvimden temizle
                    if (plan.rest) {
                        for (const ev of dayEvents) {
                            try {
                                await callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(ev.id)}`, {
                                    method: 'DELETE'
                                });
                                cleanedDuplicates++;
                            } catch(e) {}
                        }
                        if (plan.googleEventId) delete plan.googleEventId;
                        continue;
                    }

                    // Antrenman günü
                    const workoutDetails = getWorkoutDetailsForPlan(plan) || {};
                    const duration = parseInt(plan.duration, 10) || parseInt(workoutDetails.duration, 10) || 50;
                    const restSec = (workoutDetails.scheme && workoutDetails.scheme.rest) || workoutDetails.rest || 60;
                    const timeStr = plan.time || prefs.defaultTime || '18:30';
                    const [hStr, mStr] = timeStr.split(':');
                    const startHour = parseInt(hStr, 10) || 18;
                    const startMin = parseInt(mStr, 10) || 30;

                    targetDate.setHours(startHour, startMin, 0, 0);
                    const endDate = new Date(targetDate.getTime() + (duration * 60 * 1000));

                    const startIsoStr = formatIsoDateTimeWithOffset(targetDate);
                    const endIsoStr = formatIsoDateTimeWithOffset(endDate);

                    const cleanTitle = (plan.title || 'Antrenman Seansı').replace(/^[⚔️🧘🔬🔥\s]+/, '');
                    const summary = `⚔️ FitLab: ${cleanTitle}`;
                    const description = buildEventDescription(plan, d, duration, restSec);

                    const eventBody = {
                        summary: summary,
                        description: description,
                        start: { dateTime: startIsoStr, timeZone: userTz },
                        end: { dateTime: endIsoStr, timeZone: userTz },
                        colorId: '6',
                        reminders: {
                            useDefault: false,
                            overrides: [
                                { method: 'popup', minutes: prefs.reminderMin || 30 }
                            ]
                        },
                        extendedProperties: {
                            private: {
                                fitLabWorkoutId: String(plan.id || ''),
                                fitLabDayIdx: String(d),
                                fitLabWeek: week,
                                fitLabSource: 'FitLab_PWA'
                            }
                        }
                    };

                    let primaryEvent = null;
                    if (dayEvents.length > 0) {
                        // İlk etkinliği koru ve güncelle
                        primaryEvent = dayEvents[0];
                        try {
                            await callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(primaryEvent.id)}`, {
                                method: 'PATCH',
                                body: JSON.stringify(eventBody)
                            });
                            updatedCount++;
                        } catch(patchErr) {
                            console.warn("Patch hatası:", patchErr);
                        }

                        // Aynı günde 1'den fazla etkinlik varsa diğer mükerrer olanları SİL!
                        for (let i = 1; i < dayEvents.length; i++) {
                            try {
                                await callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(dayEvents[i].id)}`, {
                                    method: 'DELETE'
                                });
                                cleanedDuplicates++;
                            } catch(e) {}
                        }
                    } else {
                        // O günde henüz hiç etkinlik yoksa yeni oluştur
                        try {
                            primaryEvent = await callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}/events`, {
                                method: 'POST',
                                body: JSON.stringify(eventBody)
                            });
                            createdCount++;
                        } catch(postErr) {
                            console.error(`Gün ${d} (${dateKey}) POST hatası:`, postErr);
                        }
                    }

                    if (primaryEvent && primaryEvent.id) {
                        plan.googleEventId = primaryEvent.id;
                        plan.googleHtmlLink = primaryEvent.htmlLink;
                        plan.lastSyncedAt = Date.now();
                    }
                } catch(loopErr) {
                    console.error(`Gün ${d} işleme hatası:`, loopErr);
                }
            }

            if (isNext) saveNextWeeklySchedule(schedule, user.id);
            else saveWeeklySchedule(schedule, user.id);

            return { createdCount, updatedCount, cleanedDuplicates };
        }

        async function syncGoogleCalendarToFitLab(targetWeek = null) {
            const week = targetWeek || activePlannerWeek || 'current';
            const isNext = week === 'next';
            const user = getActiveUser();
            const schedule = isNext ? getNextWeeklySchedule(user.id) : getWeeklySchedule(user.id);
            const calId = await getOrCreateFitLabCalendar();

            const startOfWeek = getDateForScheduleDay(1, isNext);
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = getDateForScheduleDay(0, isNext);
            endOfWeek.setHours(23, 59, 59, 999);

            const startIso = formatIsoDateTimeWithOffset(startOfWeek);
            const endIso = formatIsoDateTimeWithOffset(endOfWeek);

            const eventsData = await callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}/events?timeMin=${encodeURIComponent(startIso)}&timeMax=${encodeURIComponent(endIso)}&singleEvents=true`);
            const events = (eventsData && Array.isArray(eventsData.items)) ? eventsData.items : [];

            let timeCorrections = 0;
            let dayMoves = 0;

            events.forEach(ev => {
                if (!ev.start) return;
                const isFitLab = (ev.extendedProperties && ev.extendedProperties.private && ev.extendedProperties.private.fitLabSource === 'FitLab_PWA') || (ev.summary && ev.summary.includes('FitLab'));
                if (!isFitLab) return;

                const evDate = new Date(ev.start.dateTime || ev.start.date);
                const actualDayIdx = evDate.getDay();
                const pad = n => String(n).padStart(2, '0');
                const evTimeStr = `${pad(evDate.getHours())}:${pad(evDate.getMinutes())}`;

                const origDayIdxStr = ev.extendedProperties?.private?.fitLabDayIdx;
                const origDayIdx = origDayIdxStr !== undefined ? parseInt(origDayIdxStr, 10) : actualDayIdx;

                if (origDayIdx !== actualDayIdx && schedule[origDayIdx] && !schedule[origDayIdx].rest) {
                    const workoutToMove = Object.assign({}, schedule[origDayIdx]);
                    workoutToMove.time = evTimeStr;
                    workoutToMove.googleEventId = ev.id;
                    workoutToMove.lastSyncedAt = Date.now();

                    schedule[actualDayIdx] = workoutToMove;
                    schedule[origDayIdx] = {
                        id: 'rest',
                        title: '🧘 Dinlenme & Aktif Toparlanma',
                        type: 'rest',
                        desc: 'Hafif yürüyüş, esneme veya tam istirahat',
                        rest: true
                    };
                    dayMoves++;
                } else if (schedule[actualDayIdx]) {
                    const curPlan = schedule[actualDayIdx];
                    if (!curPlan.rest) {
                        curPlan.googleEventId = ev.id;
                        curPlan.googleHtmlLink = ev.htmlLink;
                        if (curPlan.time !== evTimeStr) {
                            curPlan.time = evTimeStr;
                            timeCorrections++;
                        }
                    }
                }
            });

            if (isNext) saveNextWeeklySchedule(schedule, user.id);
            else saveWeeklySchedule(schedule, user.id);

            return { timeCorrections, dayMoves, totalEvents: events.length };
        }

        async function performFullCalendarSync() {
            if (!isGoogleCalendarConnected()) {
                downloadFullScheduleICS();
                if (typeof showToast === 'function') showToast("📥 Tüm haftalık antrenman takvimi (.ics) indirildi! Takviminize aktarabilirsiniz.");
                return;
            }
            try {
                if (typeof showToast === 'function') showToast("🔄 Takvim ile canlı çift yönlü eşitleniyor...");
                
                // 1. Önce hem bu haftayı hem gelecek haftayı Google'dan çek
                let dayMoves = 0;
                let timeCorrections = 0;
                try {
                    const pullCur = await syncGoogleCalendarToFitLab('current');
                    dayMoves += (pullCur && pullCur.dayMoves) || 0;
                    timeCorrections += (pullCur && pullCur.timeCorrections) || 0;
                } catch(e) {}
                try {
                    const pullNext = await syncGoogleCalendarToFitLab('next');
                    dayMoves += (pullNext && pullNext.dayMoves) || 0;
                    timeCorrections += (pullNext && pullNext.timeCorrections) || 0;
                } catch(e) {}

                // 2. Hem bu haftayı hem de gelecek haftayı Google Takvim'e eksiksiz yaz
                const syncCur = await syncFitLabToGoogleCalendar('current');
                const syncNext = await syncFitLabToGoogleCalendar('next');

                if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
                renderCalendarConnectionCard();

                const totalSynced = (syncCur.createdCount || 0) + (syncCur.updatedCount || 0) + (syncNext.createdCount || 0) + (syncNext.updatedCount || 0);
                const totalCleaned = (syncCur.cleanedDuplicates || 0) + (syncNext.cleanedDuplicates || 0);

                let msg = `✅ Canlı Takvim Senkronize Edildi! (${totalSynced} seans aktif)`;
                if (totalCleaned > 0) msg += ` • 🧹 ${totalCleaned} mükerrer kayıt temizlendi.`;
                if (dayMoves > 0) msg += ` • 📅 ${dayMoves} seans yeni gününe taşındı.`;
                if (timeCorrections > 0) msg += ` • 🕒 ${timeCorrections} seans saati güncellendi.`;
                if (typeof showToast === 'function') showToast(msg);
                else alert(msg);
            } catch(e) {
                console.error("Takvim senkronizasyon hatası:", e);
                if (typeof showToast === 'function') showToast("❌ Takvim senkronize edilemedi: " + (e.message || e));
            }
        }

        function triggerManualCalendarSync() {
            performFullCalendarSync();
        }

        async function syncCurrentDayToCalendar() {
            if (activeSchedulingDayIdx === null) return;
            if (!isGoogleCalendarConnected()) {
                openSingleDayDirectGoogleCalendar();
                return;
            }
            try {
                if (typeof showToast === 'function') showToast("📅 Günlük antrenman takvime işleniyor...");
                const isNext = activePlannerWeek === 'next';
                const user = getActiveUser();
                const schedule = isNext ? getNextWeeklySchedule(user.id) : getWeeklySchedule(user.id);
                const plan = schedule[activeSchedulingDayIdx];
                if (!plan || plan.rest) {
                    if (typeof showToast === 'function') showToast("ℹ️ Dinlenme günleri için takvim etkinliği oluşturulmaz.");
                    return;
                }

                await syncFitLabToGoogleCalendar(activePlannerWeek);
                if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
                openScheduleDayModal(activeSchedulingDayIdx);
                if (typeof showToast === 'function') showToast("✅ Güncellendi! Antrenman Google Takvim'e işlendi.");
            } catch(e) {
                console.warn("Canlı takvim yazma hatası, doğrudan web takvim şablonu açılıyor:", e);
                openSingleDayDirectGoogleCalendar();
            }
        }

        function deleteCalendarEventQuiet(eventId) {
            if (!eventId || !isGoogleCalendarConnected()) return;
            const calId = getStoredCalendarId() || 'primary';
            callGoogleCalendarApi(`/calendars/${encodeURIComponent(calId)}/events/${encodeURIComponent(eventId)}`, {
                method: 'DELETE'
            }).catch(() => {});
        }

        function openSingleDayDirectGoogleCalendar() {
            if (activeSchedulingDateStr) {
                const dayDate = new Date(activeSchedulingDateStr + 'T00:00:00');
                openDirectGoogleCalendarForSpecificDate(activeSchedulingDateStr, dayDate.getDay());
                return;
            }
            if (activeSchedulingDayIdx === null) return;
            const isNext = activePlannerWeek === 'next';
            const dayDate = getDateForScheduleDay(activeSchedulingDayIdx, isNext);
            openDirectGoogleCalendarForSpecificDate(formatDateYMD(dayDate), activeSchedulingDayIdx);
        }

        function openDirectGoogleCalendarForSpecificDate(dateStr, dayIdx) {
            if (!dateStr) return;
            const targetDate = new Date(dateStr + 'T00:00:00');
            const plan = (typeof getPlanForDate === 'function') ? getPlanForDate(targetDate) : null;
            if (!plan || plan.rest || plan.type === 'rest') {
                alert("Dinlenme günü için takvim kaydı oluşturulamaz.");
                return;
            }

            if (plan.googleHtmlLink) {
                window.open(plan.googleHtmlLink, '_blank');
                return;
            }

            const workoutDetails = getWorkoutDetailsForPlan(plan) || {};
            const duration = parseInt(plan.duration, 10) || parseInt(workoutDetails.duration, 10) || 50;
            const timeStr = plan.time || getCalendarPreferences().defaultTime || '18:30';
            const [hStr, mStr] = timeStr.split(':');
            const startHour = parseInt(hStr, 10) || 18;
            const startMin = parseInt(mStr, 10) || 30;

            const startDate = new Date(targetDate);
            startDate.setHours(startHour, startMin, 0, 0);
            const endDate = new Date(startDate.getTime() + (duration * 60 * 1000));

            const formatUtcCompact = d => {
                return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            const datesParam = `${formatUtcCompact(startDate)}/${formatUtcCompact(endDate)}`;
            const cleanTitle = (plan.title || 'Antrenman Seansı').replace(/^[⚔️🧘🔬🔥\s]+/, '');
            const titleParam = `⚔️ FitLab: ${cleanTitle}`;
            const descParam = buildEventDescription(plan, dayIdx, duration);
            const user = getActiveUser();

            const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titleParam)}&dates=${encodeURIComponent(datesParam)}&details=${encodeURIComponent(descParam)}&add=${encodeURIComponent((user && user.email) || '')}`;
            window.open(gcalUrl, '_blank');
        }

        function openGoogleCalendarExportModal() {
            const modal = document.getElementById('googleCalendarExportModal');
            if (!modal) {
                openGoogleCalendarLegacyFallback();
                return;
            }

            // Aktif incelenen haftanın başlangıç Pazartesi ve bitiş Pazar günlerini hesapla
            const anchor = new Date((calendarScreenState && calendarScreenState.anchorDate) || new Date());
            anchor.setHours(0, 0, 0, 0);
            const dayOfWeek = anchor.getDay();
            const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
            const monday = new Date(anchor);
            monday.setDate(anchor.getDate() + diffToMon);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const sD = monday.getDate();
            const sM = CAL_MONTH_NAMES_TR[monday.getMonth()];
            const eD = sunday.getDate();
            const eM = CAL_MONTH_NAMES_TR[sunday.getMonth()];
            const yr = sunday.getFullYear();
            const periodStr = (sM === eM) ? `${sD} - ${eD} ${sM} ${yr}` : `${sD} ${sM} - ${eD} ${eM} ${yr}`;

            const titleEl = document.getElementById('gcalExportModalTitle');
            if (titleEl) {
                titleEl.innerText = `📅 Google Takvim'e Aktar (${periodStr})`;
            }

            // Otomatik canlı bağlantı kartını güncelle
            const autoCardTitle = document.getElementById('gcalAutoSyncCardTitle');
            const autoCardBadge = document.getElementById('gcalAutoSyncCardBadge');
            const autoCardDesc = document.getElementById('gcalAutoSyncCardDesc');
            const autoCardAction = document.getElementById('gcalAutoSyncCardAction');
            const isConn = (typeof isGoogleCalendarConnected === 'function') && isGoogleCalendarConnected();

            if (autoCardTitle && autoCardAction) {
                if (isConn) {
                    autoCardTitle.innerText = "🟢 Google Takvim Canlı Bağlı (Otomatik Mod Aktif)";
                    if (autoCardBadge) {
                        autoCardBadge.innerText = "BAĞLANDI";
                        autoCardBadge.style.background = "#10b981";
                    }
                    if (autoCardDesc) {
                        autoCardDesc.innerHTML = "Google hesabınız bağlı durumda. FitLAB veya web takvimine atanan seanslar arka planda Google Takviminize <strong>otomatik yüklenir</strong>.";
                    }
                    autoCardAction.innerHTML = `
                        <button type="button" class="btn btn-gold" style="font-size:11.5px; padding:7px 14px; font-weight:800;" onclick="performFullCalendarSync()">
                            🔄 Şimdi Eşitle
                        </button>
                        <button type="button" class="btn btn-outline" style="font-size:11px; padding:7px 10px; color:#DC2626; border-color:rgba(239,68,68,0.4);" onclick="disconnectGoogleCalendar(); openGoogleCalendarExportModal();">
                            Bağlantıyı Kes
                        </button>
                    `;
                } else {
                    autoCardTitle.innerText = "1 Kereye Mahsus Onay: Sıfır Tıklama & Tam Otomasyon";
                    if (autoCardBadge) {
                        autoCardBadge.innerText = "CANLI API";
                        autoCardBadge.style.background = "#10b981";
                    }
                    if (autoCardDesc) {
                        autoCardDesc.innerHTML = "Google hesabınızı <strong>1 kere bağlayın</strong>. Artık hiçbir dosya indirmekle veya butona basmakla uğraşmayın; FitLAB veya web üzerinden atanan tüm programlar Google Takviminize <strong>kendiliğinden otomatik yüklensin</strong>.";
                    }
                    autoCardAction.innerHTML = `
                        <button type="button" class="btn btn-gold" style="font-size:12px; padding:9px 18px; font-weight:900; box-shadow:0 0 15px rgba(245,158,11,0.3); white-space:nowrap;" onclick="connectGoogleCalendarPrompt()">
                            ⚡ Google Hesabımı Bağla
                        </button>
                    `;
                }
            }

            // Günlük buton listesini oluştur
            const daysListEl = document.getElementById('gcalExportDaysList');
            if (daysListEl) {
                let itemsHtml = '';
                let activeCount = 0;

                for (let i = 0; i < 7; i++) {
                    const dayDate = new Date(monday);
                    dayDate.setDate(monday.getDate() + i);
                    const dayIdx = dayDate.getDay();
                    const dayYMD = formatDateYMD(dayDate);
                    const plan = (typeof getPlanForDate === 'function') ? getPlanForDate(dayDate) : null;

                    if (plan && !plan.rest && plan.type !== 'rest') {
                        activeCount++;
                        const cleanTitle = (plan.title || 'Antrenman Seansı').replace(/^[⚔️🧘🔬🔥\s]+/, '');
                        const timeStr = plan.time || '18:30';
                        const durMin = plan.duration || 50;
                        const dName = DAY_NAMES_TR[dayIdx];
                        const dNum = dayDate.getDate();
                        const mName = CAL_MONTH_NAMES_TR[dayDate.getMonth()].slice(0, 3);

                        itemsHtml += `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:8px; padding:9px 12px; gap:8px;">
                                <div style="min-width:0; flex:1;">
                                    <div style="font-size:12.5px; font-weight:800; color:#0F172A;">
                                        ⚔️ ${dName}, ${dNum} ${mName} • <span style="color:#B45309;">${timeStr}</span>
                                    </div>
                                    <div style="font-size:11px; color:#475569; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                        ${escapeHTML(cleanTitle)} • ${durMin} Dk
                                    </div>
                                </div>
                                <button type="button" class="btn btn-gold" style="font-size:11px; padding:6px 12px; font-weight:800; flex-shrink:0;" onclick="openDirectGoogleCalendarForSpecificDate('${dayYMD}', ${dayIdx})">
                                    ➕ Ekle ➔
                                </button>
                            </div>
                        `;
                    }
                }

                if (activeCount === 0) {
                    itemsHtml = `<div style="text-align:center; padding:12px; font-size:12px; color:var(--text-secondary);">Bu haftada planlanmış aktif antrenman seansı bulunamadı.</div>`;
                }
                daysListEl.innerHTML = itemsHtml;
            }

            modal.classList.add('active');
            modal.style.display = 'flex';
        }

        function closeGoogleCalendarExportModal() {
            const modal = document.getElementById('googleCalendarExportModal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        }

        function executeOneClickGoogleCalendarExport() {
            downloadFullScheduleICS();
            const importUrl = 'https://calendar.google.com/calendar/u/0/r/settings/export';
            window.open(importUrl, '_blank');
            if (typeof showToast === 'function') {
                showToast("📥 Takvim dosyanız indi! Google Takvim İçe Aktarma ekranı açıldı.");
            }
        }

        function openGoogleCalendarWeb() {
            openGoogleCalendarExportModal();
        }

        function openGoogleCalendarLegacyFallback() {
            try {
                const win = window.open('https://calendar.google.com/calendar/u/0/r', '_blank');
                if (!win || win.closed || typeof win.closed === 'undefined') {
                    window.location.href = 'https://calendar.google.com/calendar/u/0/r';
                }
            } catch(e) {
                window.location.href = 'https://calendar.google.com/calendar/u/0/r';
            }
        }

        function generateScheduleICS(targetAnchorDate = null) {
            const anchor = new Date(targetAnchorDate || (calendarScreenState && calendarScreenState.anchorDate) || new Date());
            anchor.setHours(0, 0, 0, 0);
            const dayOfWeek = anchor.getDay();
            const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
            const monday = new Date(anchor);
            monday.setDate(anchor.getDate() + diffToMon);

            const user = getActiveUser();
            const prefs = getCalendarPreferences(user ? user.id : 'usr_admin');

            const formatIcsDate = d => {
                return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            let ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//FitLab//Celik Kodu PWA//TR',
                'CALSCALE:GREGORIAN',
                'METHOD:PUBLISH',
                'X-WR-CALNAME:FitLab • Antrenmanlarım',
                'X-WR-TIMEZONE:Europe/Istanbul'
            ];

            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(monday);
                dayDate.setDate(monday.getDate() + i);
                const dayIdx = dayDate.getDay();
                const plan = (typeof getPlanForDate === 'function') ? getPlanForDate(dayDate) : null;
                if (!plan || plan.rest || plan.type === 'rest') continue;

                const workoutDetails = getWorkoutDetailsForPlan(plan) || {};
                const duration = parseInt(plan.duration, 10) || parseInt(workoutDetails.duration, 10) || 50;
                const timeStr = plan.time || prefs.defaultTime || '18:30';
                const [hStr, mStr] = timeStr.split(':');
                const startHour = parseInt(hStr, 10) || 18;
                const startMin = parseInt(mStr, 10) || 30;

                const startDate = new Date(dayDate);
                startDate.setHours(startHour, startMin, 0, 0);
                const endDate = new Date(startDate.getTime() + (duration * 60 * 1000));

                const cleanTitle = (plan.title || 'Antrenman Seansı').replace(/^[⚔️🧘🔬🔥\s]+/, '');
                const summary = `⚔️ FitLab: ${cleanTitle}`;
                const descText = buildEventDescription(plan, dayIdx, duration)
                    .replace(/\\/g, '\\\\')
                    .replace(/;/g, '\\;')
                    .replace(/,/g, '\\,')
                    .replace(/\n/g, '\\n');

                ics.push(
                    'BEGIN:VEVENT',
                    `UID:fitlab-${formatDateYMD(dayDate)}-${startDate.getTime()}@fitness.kantarci.io`,
                    `DTSTAMP:${formatIcsDate(new Date())}`,
                    `DTSTART:${formatIcsDate(startDate)}`,
                    `DTEND:${formatIcsDate(endDate)}`,
                    `SUMMARY:${summary}`,
                    `DESCRIPTION:${descText}`,
                    'BEGIN:VALARM',
                    'ACTION:DISPLAY',
                    `TRIGGER:-PT${prefs.reminderMin || 30}M`,
                    'DESCRIPTION:FitLab Antrenman Vakti!',
                    'END:VALARM',
                    'END:VEVENT'
                );
            }

            ics.push('END:VCALENDAR');
            return ics.join('\r\n');
        }

        function downloadFullScheduleICS() {
            const anchor = new Date((calendarScreenState && calendarScreenState.anchorDate) || new Date());
            const icsContent = generateScheduleICS(anchor);
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `fitlab-haftalik-antrenman.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (typeof showToast === 'function') showToast("📥 Haftalık takvim (.ics) indirildi! Apple Takvim veya Google Takvim ile anında açabilirsiniz.");
        }

        function downloadSingleDayICS() {
            if (activeSchedulingDayIdx === null) return;
            const isNext = activePlannerWeek === 'next';
            const user = getActiveUser();
            const schedule = isNext ? getNextWeeklySchedule(user.id) : getWeeklySchedule(user.id);
            const plan = schedule[activeSchedulingDayIdx];
            if (!plan || plan.rest) {
                alert("Dinlenme günü için takvim dosyası üretilmez.");
                return;
            }

            const icsContent = generateScheduleICS();
            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `fitlab-gun-${activeSchedulingDayIdx}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (typeof showToast === 'function') showToast("📥 Seans (.ics) indirildi!");
        }

        function getCalendarLiveBarHtml() {
            const connected = isGoogleCalendarConnected();
            if (connected) {
                return `
                    <div class="calendar-live-bar">
                        <div class="calendar-live-info">
                            <span class="weekly-day-sync-dot"></span>
                            <span style="color:#0F172A;">FitLab • Antrenmanlarım</span>
                            <span style="font-size:10px; color:#10b981; font-weight:800;">(Canlı Eşitli)</span>
                        </div>
                        <div class="calendar-live-actions">
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:3px 8px; color:var(--cyan); border-color:rgba(56,189,248,0.4);" onclick="triggerManualCalendarSync()" title="Takvimle iki yönlü eşitle">
                                🔄 Canlı Eşitle
                            </button>
                            <button type="button" class="btn btn-gold" style="font-size:11px; padding:3px 8px; font-weight:800;" onclick="openGoogleCalendarWeb()" title="Google Takvim uygulamasını aç">
                                📅 Takvim
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:3px 7px;" onclick="openCalendarSyncModal()" title="Takvim Ayarları">
                                ⚙️
                            </button>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="calendar-live-bar" style="background:rgba(245,158,11,0.06); border-color:rgba(245,158,11,0.25);">
                        <div class="calendar-live-info" style="font-size:11px;">
                            <span>📅</span>
                            <span style="font-weight:700; color:#0F172A;">Takvim Entegrasyonu</span>
                        </div>
                        <div class="calendar-live-actions">
                            <button type="button" class="btn btn-gold" style="font-size:11px; padding:3px 9px; font-weight:800;" onclick="openGoogleCalendarWeb()" title="Google Takvim uygulamasını aç">
                                📅 Google Takvim'i Aç
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:3px 8px; color:#475569;" onclick="downloadFullScheduleICS()" title="Apple / Cihaz Takvimine Aktar (.ics)">
                                🍏 Cihaza Aktar
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:3px 7px;" onclick="openCalendarSyncModal()" title="Takvim Yönetimi & Ayarları">
                                ⚙️
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        function updateScheduleDayModalTimingCard(dayIdx, currentPlan, workoutDetails) {
            const timingSec = document.getElementById('schedDayTimingSection');
            if (!timingSec) return;

            if (currentPlan.rest) {
                timingSec.style.display = 'none';
                return;
            }
            timingSec.style.display = 'block';

            const prefs = getCalendarPreferences();
            const timeInput = document.getElementById('schedDayTimeInput');
            if (timeInput) {
                timeInput.value = currentPlan.time || prefs.defaultTime || '18:30';
            }

            const durInput = document.getElementById('schedDayDurationInput');
            if (durInput) {
                durInput.value = currentPlan.duration || (workoutDetails && workoutDetails.duration) || 50;
            }

            const badge = document.getElementById('schedDaySyncStatusBadge');
            const syncBtn = document.getElementById('btnSyncSingleDayGCal');

            if (badge) {
                if (currentPlan.googleEventId) {
                    badge.innerHTML = '🟢 Google Takvimde Eşitlendi';
                    badge.style.background = '#DCFCE7';
                    badge.style.color = '#15803D';
                    badge.style.borderColor = '#86EFAC';
                } else if (isGoogleCalendarConnected()) {
                    badge.innerHTML = '🟡 Senkronizasyon Bekliyor';
                    badge.style.background = '#FEF3C7';
                    badge.style.color = '#B45309';
                    badge.style.borderColor = '#FDE68A';
                } else {
                    badge.innerHTML = 'Yerel Plan';
                    badge.style.background = '#F1F5F9';
                    badge.style.color = '#334155';
                    badge.style.borderColor = '#CBD5E1';
                }
            }

            if (syncBtn) {
                syncBtn.innerText = currentPlan.googleEventId ? '🔄 Takvimi Yeniden Güncelle' : '📅 Bu Günü Takvime İşle';
            }
        }

        function updateScheduledDayTime(timeVal) {
            if (activeSchedulingDayIdx === null) return;
            const isNext = activePlannerWeek === 'next';
            const user = getActiveUser();
            const schedule = isNext ? getNextWeeklySchedule(user.id) : getWeeklySchedule(user.id);
            if (schedule[activeSchedulingDayIdx]) {
                schedule[activeSchedulingDayIdx].time = timeVal || '18:30';
                if (isNext) saveNextWeeklySchedule(schedule, user.id);
                else saveWeeklySchedule(schedule, user.id);

                if (isGoogleCalendarConnected() && schedule[activeSchedulingDayIdx].googleEventId) {
                    syncFitLabToGoogleCalendar(activePlannerWeek).catch(() => {});
                }
                if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
            }
        }

        function updateScheduledDayDuration(durVal) {
            if (activeSchedulingDayIdx === null) return;
            const isNext = activePlannerWeek === 'next';
            const user = getActiveUser();
            const schedule = isNext ? getNextWeeklySchedule(user.id) : getWeeklySchedule(user.id);
            if (schedule[activeSchedulingDayIdx]) {
                schedule[activeSchedulingDayIdx].duration = parseInt(durVal, 10) || 50;
                if (isNext) saveNextWeeklySchedule(schedule, user.id);
                else saveWeeklySchedule(schedule, user.id);

                if (isGoogleCalendarConnected() && schedule[activeSchedulingDayIdx].googleEventId) {
                    syncFitLabToGoogleCalendar(activePlannerWeek).catch(() => {});
                }
            }
        }

        function openCalendarSyncModal() {
            const modal = document.getElementById('calendarSyncModal');
            if (!modal) return;
            renderCalendarConnectionCard();

            const prefs = getCalendarPreferences();
            const timeEl = document.getElementById('calPrefDefaultTime');
            const remEl = document.getElementById('calPrefReminderMin');
            const clientEl = document.getElementById('calCustomClientId');

            if (timeEl) timeEl.value = prefs.defaultTime || '18:30';
            if (remEl) remEl.value = String(prefs.reminderMin || 30);
            if (clientEl) clientEl.value = prefs.customClientId || '';

            modal.style.display = 'flex';
        }

        function closeCalendarSyncModal() {
            const modal = document.getElementById('calendarSyncModal');
            if (modal) modal.style.display = 'none';
        }

        function renderCalendarConnectionCard() {
            const card = document.getElementById('calendarConnectionCard');
            if (!card) return;
            const connected = isGoogleCalendarConnected();

            if (connected) {
                card.innerHTML = `
                    <div style="background:linear-gradient(135deg, #ECFDF5, #F0FDF4); border:1.5px solid #10B981; border-radius:10px; padding:12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:22px;">🟢</span>
                                <div>
                                    <div style="font-size:13px; font-weight:800; color:#0F172A;">Google Takvim Canlı Bağlı</div>
                                    <div style="font-size:11px; color:#065F46; margin-top:2px;">Özel Takvim: <strong>FitLab • Antrenmanlarım</strong></div>
                                </div>
                            </div>
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:5px 10px; color:#DC2626; border-color:rgba(239,68,68,0.4);" onclick="disconnectGoogleCalendar()">
                                Bağlantıyı Kes
                            </button>
                        </div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div style="background:rgba(245,158,11,0.08); border:1.5px solid rgba(245,158,11,0.3); border-radius:10px; padding:12px;">
                        <div style="margin-bottom:8px;">
                            <div style="font-size:13px; font-weight:800; color:#0F172A;">📅 Google & Cihaz Takvim Entegrasyonu</div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-top:3px; line-height:1.4;">
                                Antrenman seanslarınızı Google Takvim web uygulamasında doğrudan açabilir veya tüm haftayı Apple / cihaz takviminize tek dokunuşla aktarabilirsiniz.
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
                            <button type="button" class="btn btn-gold" style="font-size:11.5px; padding:7px 14px; font-weight:800;" onclick="openGoogleCalendarWeb()">
                                📅 Google Takvim'i Aç
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:11.5px; padding:7px 12px; color:#475569;" onclick="downloadFullScheduleICS()">
                                🍏 Tüm Programı İndir (.ics)
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        async function connectGoogleCalendarPrompt() {
            const clientId = getGoogleClientId();

            // 1. Google Identity Services (GIS) ile resmi Google OAuth izin penceresini aç
            if (clientId && window.google && window.google.accounts && window.google.accounts.oauth2) {
                try {
                    const client = google.accounts.oauth2.initTokenClient({
                        client_id: clientId,
                        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
                        callback: async (resp) => {
                            if (resp && resp.access_token) {
                                saveGoogleCalendarToken(resp.access_token, resp.expires_in || 3600);
                                if (typeof showToast === 'function') {
                                    showToast("🟢 Google Takvim başarıyla bağlandı! Programınız otomatik yükleniyor...");
                                }
                                await performFullCalendarSync();
                                if (typeof openGoogleCalendarExportModal === 'function') {
                                    const modal = document.getElementById('googleCalendarExportModal');
                                    if (modal && modal.style.display !== 'none') openGoogleCalendarExportModal();
                                }
                                if (typeof renderCalendarConnectionCard === 'function') {
                                    renderCalendarConnectionCard();
                                }
                            } else if (resp && resp.error) {
                                console.warn("Google OAuth yanıt hatası:", resp);
                                if (typeof showToast === 'function') showToast("❌ Google izin hatası: " + (resp.error_description || resp.error));
                            }
                        },
                        error_callback: (err) => {
                            console.warn("GIS hata callback:", err);
                            if (typeof showToast === 'function') showToast("❌ Google kimlik doğrulama başlatılamadı.");
                        }
                    });
                    client.requestAccessToken();
                    return;
                } catch(gisErr) {
                    console.warn("GIS denemesi:", gisErr);
                }
            }

            // 2. Firebase Google Auth ile dene (İkincil yöntem)
            if (typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    const provider = new firebase.auth.GoogleAuthProvider();
                    provider.addScope('https://www.googleapis.com/auth/calendar');
                    provider.addScope('https://www.googleapis.com/auth/calendar.events');
                    const cred = await firebase.auth().signInWithPopup(provider);
                    if (cred && cred.credential && cred.credential.accessToken) {
                        saveGoogleCalendarToken(cred.credential.accessToken, 3600);
                        await performFullCalendarSync();
                        if (typeof showToast === 'function') {
                            showToast("🟢 Google Takvim canlı bağlandı! Programlar otomatik eşitleniyor.");
                        }
                        if (typeof openGoogleCalendarExportModal === 'function') {
                            const modal = document.getElementById('googleCalendarExportModal');
                            if (modal && modal.style.display !== 'none') openGoogleCalendarExportModal();
                        }
                        return;
                    }
                } catch(fbErr) {
                    console.warn("Firebase Auth Google Calendar denemesi:", fbErr);
                }
            }

            // 3. Fallback: Kullanıcıyı takvim modalına yönlendir
            openCalendarSyncModal();
        }

        function initCalendarLiveSyncOnLoad() {
            // Açılışta otomatik takvim dinleme/çekme stabilite için kapatıldı
            return;
        }

        // ==================== SMART CALENDAR SCREEN ENGINE (WEEKLY & MONTHLY) ====================
        const CAL_MONTH_NAMES_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

        const calendarScreenState = {
            viewMode: 'weekly', // 'weekly' | 'monthly'
            anchorDate: new Date()
        };

        function formatDateYMD(d) {
            if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        function getDateScheduleOverrides(uid) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : 'default');
            try {
                const raw = localStorage.getItem(`celik_kodu_date_schedule_${targetUid}`);
                return raw ? JSON.parse(raw) : {};
            } catch(e) {
                return {};
            }
        }

        function saveDateScheduleOverride(dateStr, plan, uid) {
            if (!dateStr) return;
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : 'default');
            const overrides = getDateScheduleOverrides(targetUid);
            if (!plan || plan.id === 'default') {
                delete overrides[dateStr];
            } else {
                const cloned = Object.assign({}, plan);
                if (cloned._explicitCardioUpdate) {
                    delete cloned._explicitCardioUpdate;
                } else {
                    const prevOv = overrides[dateStr];
                    const prevOvCardio = (prevOv && Array.isArray(prevOv.extraCardioSessions)) ? prevOv.extraCardioSessions : [];
                    let schedCardio = [];
                    try {
                        if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
                            const dIdx = new Date(dateStr + 'T00:00:00').getDay();
                            const sched = getWeeklySchedule(targetUid);
                            if (sched && sched[dIdx] && Array.isArray(sched[dIdx].extraCardioSessions)) {
                                schedCardio = sched[dIdx].extraCardioSessions;
                            }
                        }
                    } catch (_) {}
                    const currCardio = Array.isArray(cloned.extraCardioSessions) ? cloned.extraCardioSessions : [];
                    const merged = mergeExtraCardioSessions(mergeExtraCardioSessions(prevOvCardio, schedCardio), currCardio);
                    if (merged.length > 0) {
                        cloned.extraCardioSessions = merged;
                    }
                }
                if (!cloned.updatedAt) cloned.updatedAt = Date.now();
                overrides[dateStr] = cloned;
            }
            try {
                localStorage.setItem(`celik_kodu_date_schedule_${targetUid}`, JSON.stringify(overrides));
                if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(targetUid);
            } catch(e) {}
        }

        function getCompletedWorkoutsForDate(dateObj) {
            const targetYMD = formatDateYMD(dateObj);
            if (!targetYMD) return [];
            const logs = (typeof getWorkoutLogs === 'function') ? getWorkoutLogs() : [];
            return logs.filter(l => {
                if (!l || !l.date) return false;
                const dStr = String(l.date).split('T')[0];
                return dStr === targetYMD;
            });
        }

        function getPlanForDate(dateObj) {
            const dStr = formatDateYMD(dateObj);
            const dayIdx = dateObj.getDay();
            const schedule = (typeof getWeeklySchedule === 'function') ? getWeeklySchedule() : {};
            const basePlan = schedule[dayIdx] || { id: 'rest', title: '🧘 Dinlenme & Toparlanma', rest: true, type: 'rest' };

            const overrides = getDateScheduleOverrides();
            if (overrides && overrides[dStr]) {
                const ovPlan = overrides[dStr];
                const mergedCardio = mergeExtraCardioSessions(basePlan.extraCardioSessions, ovPlan.extraCardioSessions);
                const baseTs = Number(basePlan.updatedAt || (basePlan.customWorkout && (basePlan.customWorkout.updatedAt || basePlan.customWorkout.createdAt)) || 0);
                const ovTs = Number(ovPlan.updatedAt || (ovPlan.customWorkout && (ovPlan.customWorkout.updatedAt || ovPlan.customWorkout.createdAt)) || 0);
                // Ana haftalık planda daha yeni bir güncelleme (örn: alternatif hareket seçimi) varsa eski dateOverride kaydının onu ezmesine izin verme!
                if (baseTs > 0 && baseTs > ovTs) {
                    if (mergedCardio.length > 0) basePlan.extraCardioSessions = mergedCardio;
                    saveDateScheduleOverride(dStr, basePlan);
                    return basePlan;
                }
                if (!ovTs && !basePlan.rest && !ovPlan.rest && typeof getWorkoutDetailsForPlan === 'function') {
                    const baseDetails = getWorkoutDetailsForPlan(basePlan);
                    const ovDetails = getWorkoutDetailsForPlan(ovPlan);
                    const baseExCount = (baseDetails && Array.isArray(baseDetails.exercises)) ? baseDetails.exercises.length : 0;
                    const ovExCount = (ovDetails && Array.isArray(ovDetails.exercises)) ? ovDetails.exercises.length : 0;
                    if (baseExCount > ovExCount) {
                        if (mergedCardio.length > 0) basePlan.extraCardioSessions = mergedCardio;
                        saveDateScheduleOverride(dStr, null);
                        return basePlan;
                    }
                }
                if (mergedCardio.length > 0) ovPlan.extraCardioSessions = mergedCardio;
                return ovPlan;
            }
            return basePlan;
        }

        function setCalendarViewMode(mode) {
            calendarScreenState.viewMode = mode === 'monthly' ? 'monthly' : 'weekly';
            renderCalendarScreen();
        }

        function navigateCalendar(dir) {
            if (!calendarScreenState.anchorDate) calendarScreenState.anchorDate = new Date();
            const d = new Date(calendarScreenState.anchorDate);
            if (calendarScreenState.viewMode === 'monthly') {
                d.setMonth(d.getMonth() + dir);
            } else {
                d.setDate(d.getDate() + (dir * 7));
            }
            calendarScreenState.anchorDate = d;
            renderCalendarScreen();
        }

        function jumpCalendarToToday() {
            calendarScreenState.anchorDate = new Date();
            renderCalendarScreen();
        }

        function quickSetDateRest(dateStr, dayIdx) {
            const uid = getActiveUserId();
            const restPlan = {
                id: 'rest',
                title: '🧘 Dinlenme & Aktif Toparlanma',
                type: 'rest',
                desc: 'Hafif yürüyüş, esneme veya tam istirahat',
                rest: true
            };
            saveDateScheduleOverride(dateStr, restPlan, uid);
            if (typeof showToast === 'function') {
                showToast(`🧘 ${dateStr} dinlenme günü olarak ayarlandı.`);
            }
            renderCalendarScreen();
            if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
        }

        function assignDirectiveToActiveDay() {
            if (activeSchedulingDayIdx === null) return;
            const uid = getActiveUserId();
            let coachDir = null;
            try {
                const rawDir = localStorage.getItem(`celik_kodu_coach_directive_${uid}`);
                if (rawDir) coachDir = JSON.parse(rawDir);
            } catch(e) {}
            if (!coachDir) {
                if (typeof showToast === 'function') showToast("⚠️ FitLAB direktifi bulunamadı.");
                return;
            }
            const dirWorkout = coachDir.parsedWorkout || (coachDir.fullReport ? parseDirectiveWorkout(coachDir.fullReport, coachDir.title) : null);
            if (!dirWorkout) {
                if (typeof showToast === 'function') showToast("⚠️ FitLAB egzersiz detayları ayrıştırılamadı.");
                return;
            }
            const targetDay = activeSchedulingDayIdx;
            const schedule = getWeeklySchedule();
            const newPlan = {
                id: dirWorkout.id || ('directive_' + Date.now()),
                title: dirWorkout.title || 'FitLAB Özel Seansı',
                type: 'custom_saved',
                desc: `${dirWorkout.exercises ? dirWorkout.exercises.length : 0} Hareket • ${dirWorkout.duration || 45} Dk`,
                rest: false,
                customWorkout: dirWorkout,
                exercises: dirWorkout.exercises
            };
            schedule[targetDay] = newPlan;
            saveWeeklySchedule(schedule);

            if (activeSchedulingDateStr) {
                saveDateScheduleOverride(activeSchedulingDateStr, newPlan);
            }
            if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            if (typeof showToast === 'function') showToast(`✅ "${newPlan.title}" ${DAY_NAMES_TR[targetDay]} gününe atandı!`);
            if (typeof playAlertSound === 'function') playAlertSound();
            openScheduleDayModal(targetDay, activeSchedulingDateStr);
        }

        function stepActiveSetValue(exId, setIdx, type, delta) {
            if (!exId || setIdx === null || !activeWorkoutSetsData[exId] || !activeWorkoutSetsData[exId][setIdx]) return;
            const sets = activeWorkoutSetsData[exId];
            const st = sets[setIdx];

            let foundEx = null;
            if (activeWorkoutSession && activeWorkoutSession.exercises) {
                foundEx = activeWorkoutSession.exercises.find(e => e.id === exId);
            }
            if (!foundEx && typeof EXERCISES_DB !== 'undefined') {
                foundEx = EXERCISES_DB.find(e => e.id === exId);
            }
            const isBw = isExerciseBodyweight(foundEx);
            const isTime = isExerciseTimeBased(foundEx);

            if (type === 'weight') {
                const curW = parseFloat(st.weight) || 0;
                const nextW = Math.max(0, Math.round((curW + Number(delta)) * 10) / 10);
                st.weight = nextW;
                for (let i = setIdx + 1; i < sets.length; i++) {
                    if (!sets[i].completed) sets[i].weight = nextW;
                }
            } else {
                const curR = parseInt(st.reps, 10) || (isTime ? 30 : 10);
                const minR = isTime ? 5 : 1;
                const nextR = Math.max(minR, curR + Number(delta));
                st.reps = nextR;
                for (let i = setIdx + 1; i < sets.length; i++) {
                    if (!sets[i].completed) sets[i].reps = nextR;
                }
            }

            if (typeof saveActiveWorkoutState === 'function') saveActiveWorkoutState();
            const savedScrollY = window.scrollY;
            renderActiveWorkout();
            window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        }

        function openCalendarToolsModal() {
            const m = document.getElementById('calendarToolsModalOverlay');
            if (m) m.style.display = 'flex';
        }

        function closeCalendarToolsModal() {
            const m = document.getElementById('calendarToolsModalOverlay');
            if (m) m.style.display = 'none';
        }

        function selectCalendarStripDay(ymd) {
            if (!ymd) return;
            calendarScreenState.selectedDayYMD = ymd;
            const savedScrollY = window.scrollY;
            renderCalendarScreen();
            window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        }

        function renderCalendarScreen() {
            const container = document.getElementById('calendarMainContainer');
            if (!container) return;

            const weeklyBtn = document.getElementById('calViewWeeklyBtn');
            const monthlyBtn = document.getElementById('calViewMonthlyBtn');
            if (weeklyBtn) weeklyBtn.classList.toggle('active', calendarScreenState.viewMode === 'weekly');
            if (monthlyBtn) monthlyBtn.classList.toggle('active', calendarScreenState.viewMode === 'monthly');

            if (calendarScreenState.viewMode === 'monthly') {
                renderCalendarMonthlyView(container);
            } else {
                renderCalendarWeeklyView(container);
            }
        }

        function renderCalendarWeeklyView(container) {
            const anchor = new Date(calendarScreenState.anchorDate || new Date());
            anchor.setHours(0, 0, 0, 0);
            const dayOfWeek = anchor.getDay(); // 0 is Sun, 1 is Mon
            const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
            const monday = new Date(anchor);
            monday.setDate(anchor.getDate() + diffToMon);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const titleEl = document.getElementById('calPeriodTitle');
            if (titleEl) {
                const sD = monday.getDate();
                const sM = CAL_MONTH_NAMES_TR[monday.getMonth()];
                const eD = sunday.getDate();
                const eM = CAL_MONTH_NAMES_TR[sunday.getMonth()];
                const yr = sunday.getFullYear();
                if (sM === eM) {
                    titleEl.innerHTML = `<span>${sD} - ${eD} ${sM} ${yr}</span>`;
                } else {
                    titleEl.innerHTML = `<span>${sD} ${sM.slice(0, 3)} - ${eD} ${eM.slice(0, 3)} ${yr}</span>`;
                }
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayYMD = formatDateYMD(today);

            const SHORT_DAYS_TR = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'];
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(monday);
                dayDate.setDate(monday.getDate() + i);
                const dayYMD = formatDateYMD(dayDate);
                const dayIdx = dayDate.getDay();
                const isToday = dayYMD === todayYMD;
                const isPast = dayDate < today;
                const completedLogs = getCompletedWorkoutsForDate(dayDate);
                const hasCompleted = completedLogs.length > 0;
                const plan = getPlanForDate(dayDate);
                const isRest = plan.rest || plan.type === 'rest';

                weekDays.push({
                    dayDate,
                    dayYMD,
                    dayIdx,
                    shortLabel: SHORT_DAYS_TR[dayIdx],
                    fullDayName: DAY_NAMES_TR[dayIdx],
                    isToday,
                    isPast,
                    completedLogs,
                    hasCompleted,
                    plan,
                    isRest
                });
            }

            let selectedYMD = calendarScreenState.selectedDayYMD;
            if (!selectedYMD || !weekDays.some(d => d.dayYMD === selectedYMD)) {
                const todayInWeek = weekDays.find(d => d.isToday);
                selectedYMD = todayInWeek ? todayInWeek.dayYMD : weekDays[0].dayYMD;
                calendarScreenState.selectedDayYMD = selectedYMD;
            }

            const selDay = weekDays.find(d => d.dayYMD === selectedYMD) || weekDays[0];

            // 1. 7-Day Horizontal Strip
            const stripHtml = `
                <div class="stitch-day-strip">
                    ${weekDays.map(d => {
                        const isSelected = d.dayYMD === selDay.dayYMD;
                        const dotClass = d.hasCompleted ? 'done' : (!d.isRest ? 'planned' : 'rest');
                        return `
                            <button type="button" class="stitch-day-pill ${isSelected ? 'active' : ''} ${d.isToday ? 'is-today' : ''}" onclick="selectCalendarStripDay('${d.dayYMD}')">
                                <span class="stitch-day-pill-lbl">${d.shortLabel}</span>
                                <strong class="stitch-day-pill-num">${d.dayDate.getDate()}</strong>
                                <span class="stitch-day-pill-dot ${dotClass}"></span>
                            </button>
                        `;
                    }).join('')}
                </div>
            `;

            // 2. Selected Day Focus Card
            let statusBadgeHtml = '';
            if (selDay.hasCompleted) {
                statusBadgeHtml = `<span class="stitch-day-status-pill done">✓ Tamamlandı</span>`;
            } else if (selDay.isToday) {
                statusBadgeHtml = `<span class="stitch-day-status-pill today">BUGÜN</span>`;
            } else if (selDay.isPast && !selDay.isRest) {
                statusBadgeHtml = `<span class="stitch-day-status-pill missed">Yapılmadı</span>`;
            } else if (selDay.isRest) {
                statusBadgeHtml = `<span class="stitch-day-status-pill rest">Dinlenme</span>`;
            } else {
                statusBadgeHtml = `<span class="stitch-day-status-pill planned">Planlandı</span>`;
            }

            const cleanWorkoutTitle = (raw) => {
                if (!raw) return 'Antrenman Seansı';
                return String(raw)
                    .replace(/^BB-Dominant Hibrit\s*•\s*/i, '')
                    .replace(/\s*\([^)]*\)\s*/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim() || 'Antrenman Seansı';
            };

            const isStandaloneCardioLog = (logItem) => {
                const exs = Array.isArray(logItem && logItem.exercises) ? logItem.exercises : [];
                if (exs.length === 0) return false;
                return exs.every(ex => /^cond_/.test(String(ex.id || ex.exId || '')));
            };
            const hasCompletedFitnessSession = selDay.completedLogs.some(l => !isStandaloneCardioLog(l));

            const buildPendingFitnessPlanHtml = () => {
                const planDetails = (typeof getWorkoutDetailsForPlan === 'function') ? getWorkoutDetailsForPlan(selDay.plan) : null;
                const exList = (planDetails && Array.isArray(planDetails.exercises)) ? planDetails.exercises : [];
                const exCount = exList.length;

                const exRowsHtml = exList.length > 0 ? `
                    <div class="stitch-sel-ex-list">
                        ${exList.slice(0, 8).map((exItem, idx) => {
                            const exObj = (typeof exItem === 'string')
                                ? (EXERCISES_DB.find(e => e.id === exItem) || { id: exItem, name: exItem })
                                : exItem;
                            const numStr = String(idx + 1).padStart(2, '0');
                            const targetExParam = encodeURIComponent(exObj.id || exObj.name || '');
                            return `
                                <div class="stitch-sel-ex-row">
                                    <span class="stitch-sel-ex-num">${numStr}</span>
                                    <span class="stitch-sel-ex-name" onclick="openScheduleExerciseAlternativeModal(${selDay.dayIdx}, decodeURIComponent('${targetExParam}'), ${idx}, '${selDay.dayYMD}')" style="cursor:pointer;">${escapeHTML(exObj.name || 'Hareket')}</span>
                                    <button type="button" class="stitch-ex-swap-pill" onclick="event.stopPropagation(); openScheduleExerciseAlternativeModal(${selDay.dayIdx}, decodeURIComponent('${targetExParam}'), ${idx}, '${selDay.dayYMD}')" title="Başka Hareketle Değiştir">Değiştir</button>
                                    ${exObj.id ? `<button type="button" class="wk-ex-i-btn" onclick="event.stopPropagation(); openExerciseQuickInfoModal('${escapeHTML(String(exObj.id))}')" title="Hareket Bilgisi">i</button>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '';

                return `
                    <div class="stitch-sel-title-row">
                        <h3 class="stitch-sel-workout-title">${escapeHTML(cleanWorkoutTitle(selDay.plan.title || 'Planlı Antrenman'))}</h3>
                        ${exCount ? `<span class="stitch-sel-count-badge">${exCount} Hareket</span>` : ''}
                    </div>
                    ${exRowsHtml}
                    <div class="stitch-sel-action-grid">
                        <button type="button" class="wk-btn-primary-compact" onclick="startScheduledWorkoutForDay(${selDay.dayIdx}, '${selDay.dayYMD}')">
                            ▶️ Seansı Başlat
                        </button>
                        <button type="button" class="wk-btn-utility-compact" onclick="openScheduleDayModal(${selDay.dayIdx}, '${selDay.dayYMD}')">
                            Düzenle
                        </button>
                    </div>
                    ${!selDay.isToday ? `
                        <div style="margin-top:6px;">
                            <button type="button" class="wk-btn-utility-compact" style="width:100%;" onclick="copyDayProgramToToday(${selDay.dayIdx}, '${selDay.dayYMD}', true)">
                                Bugüne Taşı
                            </button>
                        </div>
                    ` : ''}
                `;
            };

            let focusBodyHtml = '';
            if (selDay.hasCompleted) {
                const completedRowsHtml = selDay.completedLogs.map(log => {
                    const logVol = log.totalVolumeKg ? `${Math.round(log.totalVolumeKg).toLocaleString('tr-TR')} kg` : '';
                    const logDur = log.durationFormatted || (log.duration ? `${log.duration} Dk` : '');
                    return `
                        <div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #E2E8F0;">
                            <div class="stitch-sel-title-row">
                                <h3 class="stitch-sel-workout-title">${escapeHTML(cleanWorkoutTitle(log.program || log.title || 'Antrenman'))}</h3>
                                ${log.totalSetsCompleted ? `<span class="stitch-sel-count-badge">${log.totalSetsCompleted} Set</span>` : ''}
                            </div>
                            <div class="stitch-sel-meta-line" style="color:#15803D;">
                                ✓ Tamamlandı${logDur ? ` • ${logDur}` : ''}${logVol ? ` • ${logVol} Toplam Hacim` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                focusBodyHtml = `
                    ${completedRowsHtml}
                    <div class="stitch-sel-actions-row" style="margin-top:6px;">
                        <button type="button" class="wk-btn-utility-compact" style="width:100%;" onclick="openScheduleDayModal(${selDay.dayIdx}, '${selDay.dayYMD}')">Seans Özeti & Detay</button>
                    </div>
                `;
                if (!selDay.isRest && !hasCompletedFitnessSession) {
                    focusBodyHtml += `
                        <div style="margin-top:12px; padding-top:12px; border-top:1.5px dashed #CBD5E1;">
                            ${buildPendingFitnessPlanHtml()}
                        </div>
                    `;
                }
            } else if (!selDay.isRest) {
                focusBodyHtml = buildPendingFitnessPlanHtml();
            } else {
                focusBodyHtml = `
                    <div class="stitch-sel-rest-box">
                        <div class="stitch-sel-workout-title" style="font-size:15px;">Dinlenme ve Toparlanma Günü</div>
                        <button type="button" class="wk-btn-utility-compact" style="margin-top:10px;" onclick="openScheduleDayModal(${selDay.dayIdx}, '${selDay.dayYMD}')">
                            + Bu Güne Antrenman Ekle
                        </button>
                    </div>
                `;
            }

            if (Array.isArray(selDay.plan.extraCardioSessions) && selDay.plan.extraCardioSessions.length > 0) {
                focusBodyHtml += selDay.plan.extraCardioSessions.map(c => {
                    const isCardioDone = selDay.completedLogs.some(l => Array.isArray(l.exercises) && l.exercises.some(ex => (ex.id || ex.exId) === c.id));
                    return `
                        <div style="margin-top:8px; background:#F0F9FF; border:1px solid #BAE6FD; color:#0369A1; border-radius:10px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                            <div style="font-size:12px; font-weight:800; color:#0F172A;">
                                🚣 ${escapeHTML((c.name || 'Kardiyo').split('(')[0].trim())} • <span style="color:#0369A1;">${Number(c.durationMin || 20)} Dk</span>
                            </div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                ${isCardioDone ? `
                                    <span style="font-size:10.5px; font-weight:800; color:#15803D; background:#DCFCE7; border:1px solid #86EFAC; padding:3px 8px; border-radius:6px;">✓ Tamamlandı</span>
                                ` : `
                                    <button type="button" style="background:#0369A1; color:#FFFFFF; border:none; border-radius:6px; padding:5px 10px; font-size:11px; font-weight:800; cursor:pointer;" onclick="startQuickWorkoutWithExercise('${c.id}')">▶️ Başlat</button>
                                `}
                                <button type="button" style="background:#FFFFFF; color:#B91C1C; border:1px solid #FECACA; border-radius:6px; padding:4px 8px; font-size:11px; font-weight:800; cursor:pointer;" onclick="removeExtraCardioSessionFromDay(${selDay.dayIdx}, '${c.id}', '${selDay.dayYMD}')" title="Kardiyo seansını kaldır">✕</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            const dateStr = `${selDay.fullDayName}, ${selDay.dayDate.getDate()} ${CAL_MONTH_NAMES_TR[selDay.dayDate.getMonth()]}`;

            container.innerHTML = `
                ${stripHtml}
                <div class="stitch-selected-day-card">
                    <div class="stitch-selected-day-head">
                        <span class="stitch-selected-day-date">${escapeHTML(dateStr)}</span>
                        ${statusBadgeHtml}
                    </div>
                    ${focusBodyHtml}
                </div>
            `;
        }

        function renderCalendarMonthlyView(container) {
            const anchor = new Date(calendarScreenState.anchorDate || new Date());
            const year = anchor.getFullYear();
            const month = anchor.getMonth();

            const titleEl = document.getElementById('calPeriodTitle');
            if (titleEl) {
                titleEl.innerHTML = `🗓️ <span>${CAL_MONTH_NAMES_TR[month]} ${year}</span>`;
            }

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();

            // Monday-first offset
            const firstDayOfWeek = firstDay.getDay(); // 0 is Sun
            const startOffset = (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayYMD = formatDateYMD(today);

            let html = `
                <div class="cal-month-table">
                    <div class="cal-month-header-row">
                        <div>Pzt</div>
                        <div>Sal</div>
                        <div>Çar</div>
                        <div>Per</div>
                        <div>Cum</div>
                        <div>Cmt</div>
                        <div>Paz</div>
                    </div>
                    <div class="cal-month-days-grid">
            `;

            // Previous month padding days
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            for (let p = startOffset - 1; p >= 0; p--) {
                const dayNum = prevMonthLastDay - p;
                html += `
                    <div class="cal-month-cell is-other-month">
                        <div class="cal-month-cell-header">
                            <span>${dayNum}</span>
                        </div>
                    </div>
                `;
            }

            // Current month days
            for (let d = 1; d <= daysInMonth; d++) {
                const dayDate = new Date(year, month, d);
                const dayYMD = formatDateYMD(dayDate);
                const dayIdx = dayDate.getDay();
                const isToday = dayYMD === todayYMD;

                const completedLogs = getCompletedWorkoutsForDate(dayDate);
                const hasCompleted = completedLogs.length > 0;
                const plan = getPlanForDate(dayDate);
                const isRest = plan.rest || plan.type === 'rest';

                let pillHtml = '';
                if (hasCompleted) {
                    const titleShort = (completedLogs[0].program || completedLogs[0].title || 'Tamamlandı').slice(0, 11);
                    pillHtml = `<div class="cal-tag-pill completed" title="${escapeHTML(completedLogs[0].program || completedLogs[0].title)}">✅ ${escapeHTML(titleShort)}</div>`;
                } else if (!isRest) {
                    const cleanTitle = (plan.title || 'Plan').replace(/⚔️/g, '').trim().slice(0, 11);
                    pillHtml = `<div class="cal-tag-pill scheduled" title="${escapeHTML(plan.title)}">⚔️ ${escapeHTML(cleanTitle)}</div>`;
                } else {
                    pillHtml = `<div class="cal-tag-pill rest">🧘 Dinlenme</div>`;
                }

                html += `
                    <div class="cal-month-cell ${isToday ? 'is-today' : ''}" onclick="openScheduleDayModal(${dayIdx}, '${dayYMD}')">
                        <div class="cal-month-cell-header">
                            <span style="${isToday ? 'font-weight:900; color:var(--gold);' : ''}">${d}</span>
                            ${isToday ? '<span style="font-size:8px; color:var(--gold); font-weight:900;">BUGÜN</span>' : ''}
                        </div>
                        ${pillHtml}
                    </div>
                `;
            }

            // Trailing padding days to fill the row
            const totalCells = startOffset + daysInMonth;
            const remainingCells = (7 - (totalCells % 7)) % 7;
            for (let n = 1; n <= remainingCells; n++) {
                html += `
                    <div class="cal-month-cell is-other-month">
                        <div class="cal-month-cell-header">
                            <span>${n}</span>
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }


        // ==================== WORKOUT STUDIO & MUSCLE RADAR ENGINE ====================

        var STUDIO_REGION_MAP = {
            chest: { name: "Göğüs", icon: "🛡️" },
            back: { name: "Sırt", icon: "🏹" },
            shoulders: { name: "Omuz", icon: "⚔️" },
            biceps: { name: "Biceps", icon: "💪" },
            triceps: { name: "Triceps", icon: "⚡" },
            quads: { name: "Ön Bacak", icon: "🦵" },
            hamstrings: { name: "Arka Bacak", icon: "🦿" },
            glutes: { name: "Kalça", icon: "🍑" },
            core: { name: "Karın", icon: "🧱" },
            calves: { name: "Kalf", icon: "🦶" }
        };

        var STUDIO_FILTER_TABS = [
            { id: 'all', label: 'Tümü', muscles: [] },
            { id: 'chest', label: 'Göğüs', muscles: ['chest'] },
            { id: 'back', label: 'Sırt', muscles: ['back'] },
            { id: 'shoulders', label: 'Omuz', muscles: ['shoulders'] },
            { id: 'legs', label: 'Bacak', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
            { id: 'arms', label: 'Kol', muscles: ['biceps', 'triceps'] },
            { id: 'core', label: 'Karın', muscles: ['core'] }
        ];

        var selectedTargetMuscles = [];
        var activeStudioRegion = 'all';

        function initStudioTab() {
            renderStudioOwnedEquipChips();
            renderStudioRegionChips();
            renderRegionStatus();
            renderCustomRoutine();
            renderStudioExerciseCatalog();
        }

        function renderStudioOwnedEquipChips() {
            const wrap = document.getElementById('studioOwnedEquipChips');
            if (!wrap) return;

            const eqOrder = ['dumbbell', 'bench', 'kettlebell', 'barbell', 'pullup_bar', 'machine', 'bodyweight'];
            wrap.innerHTML = eqOrder.map(eqKey => {
                const isSelected = selectedEquipments.includes(eqKey);
                const label = (typeof EQUIPMENT_DISPLAY_NAMES !== 'undefined' && EQUIPMENT_DISPLAY_NAMES[eqKey]) || eqKey;
                return `
                    <button type="button"
                            onclick="toggleEquip('${eqKey}')"
                            style="border-radius:8px; padding:6px 10px; font-size:11.5px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.12s; ${isSelected ? 'background:#2563EB; border:1.5px solid #3B82F6; color:#FFFFFF;' : 'background:#F8FAFC; border:1.5px solid #CBD5E1; color:#64748B; text-decoration:line-through;'}">
                        <span>${isSelected ? '✓' : '✕'}</span>
                        <span>${escapeHTML(label)}</span>
                    </button>
                `;
            }).join('');
        }

        function renderCustomRoutineEquipmentSummary() {
            const bar = document.getElementById('customRoutineEquipSummaryBar');
            if (!bar) return;

            const items = (customRoutineState && Array.isArray(customRoutineState.exercises)) ? customRoutineState.exercises : [];
            if (items.length === 0) {
                bar.innerHTML = `
                    <span style="font-size:10.5px; font-weight:900; color:#475569; text-transform:uppercase; letter-spacing:0.4px;">KULLANILAN ALETLER:</span>
                    <span style="font-size:11.5px; font-weight:700; color:#64748B;">Hareket eklendikçe otomatik listelenir</span>
                `;
                return;
            }

            const reqKeys = [];
            let totalSets = 0;
            items.forEach(item => {
                totalSets += (parseInt(item.sets, 10) || 3);
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                if (!ex) return;
                const exReqs = typeof getExerciseRequiredEquipments === 'function' ? getExerciseRequiredEquipments(ex) : [ex.equipment || 'dumbbell'];
                exReqs.forEach(k => {
                    if (!reqKeys.includes(k)) reqKeys.push(k);
                });
            });

            const restSec = parseInt(document.getElementById('customWorkoutRestSelect')?.value, 10) || customRoutineState.rest || 60;
            const estMinutes = Math.max(5, Math.round((totalSets * (40 + restSec)) / 60));

            const badgesHtml = reqKeys.map(k => {
                const label = (typeof EQUIPMENT_DISPLAY_NAMES !== 'undefined' && EQUIPMENT_DISPLAY_NAMES[k]) || k;
                const isOwned = selectedEquipments.includes(k);
                if (isOwned) {
                    return `<span style="display:inline-flex; align-items:center; gap:4px; background:#0F172A; border:1px solid #334155; color:#FFFFFF; font-size:11px; font-weight:800; padding:3px 9px; border-radius:999px;">${escapeHTML(label)}</span>`;
                }
                return `<span style="display:inline-flex; align-items:center; gap:4px; background:#FEF2F2; border:1px solid #EF4444; color:#B91C1C; font-size:11px; font-weight:800; padding:3px 9px; border-radius:999px;" title="Elimdeki aletlerde seçili değil">${escapeHTML(label)} (Eksik)</span>`;
            }).join('');

            bar.innerHTML = `
                <span style="font-size:10.5px; font-weight:900; color:#0F172A; text-transform:uppercase; letter-spacing:0.4px;">KULLANILAN ALETLER:</span>
                <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">${badgesHtml}</div>
                <span style="margin-left:auto; font-size:11px; font-weight:800; color:#475569;">${items.length} Hareket • ${totalSets} Set • ~${estMinutes} Dk</span>
            `;
        }

        function renderStudioRegionChips() {
            const container = document.getElementById('studioRegionChips');
            if (!container) return;

            container.innerHTML = STUDIO_FILTER_TABS.map(tab => {
                const isActive = activeStudioRegion === tab.id;
                return `
                    <button type="button"
                            onclick="setStudioRegionTab('${tab.id}')"
                            style="border-radius:7px; padding:5px 10px; font-size:11.5px; font-weight:800; cursor:pointer; transition:all 0.12s; ${isActive ? 'background:#0F172A; color:#FFFFFF; border:1.5px solid #0F172A;' : 'background:#FFFFFF; color:#334155; border:1.5px solid #CBD5E1;'}">
                        ${escapeHTML(tab.label)}
                    </button>
                `;
            }).join('');
        }

        function setStudioRegionTab(tabId) {
            activeStudioRegion = tabId || 'all';
            const found = STUDIO_FILTER_TABS.find(t => t.id === activeStudioRegion);
            selectedTargetMuscles = found ? [...found.muscles] : [];
            renderStudioRegionChips();
            renderStudioExerciseCatalog();
        }

        function toggleTargetMuscle(key) {
            setStudioRegionTab(key);
        }

        function selectPresetRegions(preset) {
            setStudioRegionTab(preset === 'all' ? 'all' : 'all');
        }

        function renderRegionStatus() {
            const grid = document.getElementById('studioRegionStatusGrid');
            if (!grid) return;
        }

        function removeIncompatibleFromCustomRoutine() {
            if (!customRoutineState || !Array.isArray(customRoutineState.exercises)) return;
            customRoutineState.exercises = customRoutineState.exercises.filter(item => {
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                return ex ? isExerciseEquipmentAvailable(ex) : false;
            });
            renderCustomRoutine();
            renderStudioExerciseCatalog();
        }

        function renderCustomRoutine() {
            const container = document.getElementById('customWorkoutExercisesList');
            const countBadge = document.getElementById('customRoutineCountBadge');
            const warnEl = document.getElementById('studioMissingEquipWarning');
            if (typeof updateStudioSaveActionsGroup === 'function') {
                updateStudioSaveActionsGroup();
            }
            renderCustomRoutineEquipmentSummary();
            if (!container) return;
            const savedScrollY = window.scrollY;

            if (countBadge) {
                countBadge.innerText = `${customRoutineState.exercises.length} Hareket`;
            }

            if (warnEl) {
                const incompatibleNames = [];
                customRoutineState.exercises.forEach(item => {
                    const ex = EXERCISES_DB.find(e => e.id === item.exId);
                    if (ex && !isExerciseEquipmentAvailable(ex)) {
                        incompatibleNames.push(ex.name);
                    }
                });
                if (incompatibleNames.length > 0) {
                    warnEl.style.display = 'flex';
                    warnEl.innerHTML = `
                        <span>⚠️ Programda seçili olmayan alet gerektiren <strong>${incompatibleNames.length} hareket</strong> var (${escapeHTML(incompatibleNames.join(', '))}).</span>
                        <button type="button" onclick="removeIncompatibleFromCustomRoutine()" style="background:#DC2626; border:none; color:#FFFFFF; font-size:11px; font-weight:800; padding:5px 10px; border-radius:6px; cursor:pointer;">Uyumsuzları Çıkar</button>
                    `;
                } else {
                    warnEl.style.display = 'none';
                    warnEl.innerHTML = '';
                }
            }

            if (customRoutineState.exercises.length === 0) {
                container.innerHTML = `
                    <div style="text-align:center; padding:14px; color:#64748B; background:#F8FAFC; border-radius:8px; border:1px dashed #CBD5E1; font-size:12px; font-weight:700;">
                        Henüz hareket eklenmedi. Aşağıdaki listeden <strong>+ Ekle</strong> ile seçin.
                    </div>
                `;
                return;
            }

            let html = '';
            customRoutineState.exercises.forEach((item, index) => {
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                if (!ex) return;

                const isCompat = isExerciseEquipmentAvailable(ex);
                const rowBorder = isCompat ? '#E2E8F0' : '#EF4444';
                const rowBg = isCompat ? '#FFFFFF' : '#FEF2F2';

                html += `
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:${rowBg}; border:1.5px solid ${rowBorder}; border-radius:9px; padding:7px 10px; flex-wrap:wrap;">
                        <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:150px;">
                            <span style="width:22px; height:22px; border-radius:6px; background:#F1F5F9; color:#0F172A; font-size:11px; font-weight:900; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                                ${String(index + 1).padStart(2, '0')}
                            </span>
                            <div style="font-size:12.5px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;" onclick="openExerciseQuickInfoModal('${ex.id}')">
                                ${escapeHTML(ex.name)}
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
                            <select class="form-input" style="padding:4px 6px; font-size:11.5px; font-weight:800; width:64px; height:30px;" onchange="updateCustomExerciseSets(${index}, this.value)">
                                <option value="2" ${item.sets == 2 ? 'selected' : ''}>2 Set</option>
                                <option value="3" ${item.sets == 3 ? 'selected' : ''}>3 Set</option>
                                <option value="4" ${item.sets == 4 ? 'selected' : ''}>4 Set</option>
                                <option value="5" ${item.sets == 5 ? 'selected' : ''}>5 Set</option>
                            </select>

                            <select class="form-input" style="padding:4px 6px; font-size:11.5px; font-weight:800; width:76px; height:30px;" onchange="updateCustomExerciseReps(${index}, this.value)">
                                ${(() => {
                                    const normR = String(item.reps || '8-12').replace(/\s+/g, '');
                                    const opts = ['5-6', '6-8', '8-10', '8-12', '10-12', '12-15', '15-20', 'Maks'];
                                    const list = opts.includes(normR) ? opts : [normR, ...opts];
                                    return list.map(opt => `<option value="${escapeHTML(opt)}" ${normR === opt ? 'selected' : ''}>${opt === 'Maks' ? 'Maks' : escapeHTML(opt) + ' T.'}</option>`).join('');
                                })()}
                            </select>

                            <button type="button" class="wk-ex-i-btn" onclick="openExerciseQuickInfoModal('${ex.id}')" title="Hareket Bilgisi">i</button>
                            <button type="button" onclick="removeExerciseFromCustomRoutine(${index})" style="width:26px; height:26px; border-radius:6px; border:1px solid #FECACA; background:#FEF2F2; color:#DC2626; font-size:11px; font-weight:900; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;" title="Çıkar">✕</button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
            if (Math.abs(window.scrollY - savedScrollY) > 1) {
                window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
            }
        }

        function renderStudioExerciseCatalog() {
            ensureBilingualExerciseNames();
            renderStudioOwnedEquipChips();
            const container = document.getElementById('studioExercisesCatalog');
            const totalCountEl = document.getElementById('studioExTotalCount');
            if (!container) return;
            const savedCatalogScrollTop = container.scrollTop;
            const savedScrollY = window.scrollY;

            const q = (document.getElementById('studioSearchInput')?.value || '').trim();
            const activeTabObj = STUDIO_FILTER_TABS.find(t => t.id === activeStudioRegion) || STUDIO_FILTER_TABS[0];
            const targetMuscles = activeTabObj.muscles || [];

            const filtered = EXERCISES_DB.filter(ex => {
                if (!q && isExerciseExcludedByUser(ex.id)) return false;
                if (!isExerciseEquipmentAvailable(ex)) return false;
                if (q && !matchesExerciseSearch(ex, q)) return false;
                if (targetMuscles.length > 0) {
                    const pList = ex.primaryMuscles || [];
                    const sList = ex.secondaryMuscles || [];
                    const hits = pList.some(m => targetMuscles.includes(m)) || sList.some(m => targetMuscles.includes(m));
                    if (!hits) return false;
                }
                return true;
            });

            if (totalCountEl) {
                totalCountEl.innerText = `(${filtered.length} Hareket)`;
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align:center; padding:18px; color:#64748B; font-size:12px; font-weight:700;">
                        Seçili alet ve bölgeye uygun hareket bulunamadı. Yukarıdan alet veya bölge seçimini genişletin.
                    </div>
                `;
                return;
            }

            let html = '';
            filtered.forEach(ex => {
                const isAlreadyInRoutine = customRoutineState.exercises.some(item => item.exId === ex.id);

                html += `
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:#FFFFFF; border:1.5px solid ${isAlreadyInRoutine ? '#2563EB' : '#CBD5E1'}; border-radius:9px; padding:8px 10px;">
                        <div style="min-width:0; flex:1;">
                            <div style="font-size:12.5px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;" onclick="openExerciseQuickInfoModal('${ex.id}')">
                                ${escapeHTML(ex.name)}
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
                            <button type="button" class="wk-ex-i-btn" onclick="openExerciseQuickInfoModal('${ex.id}')" title="Hareket Bilgisi">i</button>
                            <button type="button"
                                    onclick="addExerciseToCustomRoutine('${ex.id}')"
                                    style="border:none; border-radius:7px; padding:6px 10px; font-size:11.5px; font-weight:800; cursor:pointer; white-space:nowrap; ${isAlreadyInRoutine ? 'background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;' : 'background:#2563EB; color:#FFFFFF;'}">
                                ${isAlreadyInRoutine ? '✓ Eklendi' : '+ Ekle'}
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
            container.scrollTop = savedCatalogScrollTop;
            if (Math.abs(window.scrollY - savedScrollY) > 1) {
                window.scrollTo({ top: savedScrollY, left: 0, behavior: 'instant' });
            }
        }

        function addExerciseToCustomRoutine(exId) {
            const ex = EXERCISES_DB.find(e => e.id === exId);
            if (!ex) return;

            const existingIdx = customRoutineState.exercises.findIndex(item => item.exId === exId);
            if (existingIdx !== -1) {
                customRoutineState.exercises.splice(existingIdx, 1);
            } else {
                customRoutineState.exercises.push({
                    exId: exId,
                    sets: 3,
                    reps: '8-12',
                    weight: ''
                });
            }

            renderCustomRoutine();
            renderRegionStatus();
            renderStudioExerciseCatalog();
        }

        function removeExerciseFromCustomRoutine(index) {
            customRoutineState.exercises.splice(index, 1);
            renderCustomRoutine();
            renderRegionStatus();
            renderStudioExerciseCatalog();
        }

        function moveCustomRoutineExercise(index, direction) {
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= customRoutineState.exercises.length) return;
            const temp = customRoutineState.exercises[index];
            customRoutineState.exercises[index] = customRoutineState.exercises[newIndex];
            customRoutineState.exercises[newIndex] = temp;
            renderCustomRoutine();
        }

        function updateCustomExerciseSets(index, val) {
            if (customRoutineState.exercises[index]) {
                customRoutineState.exercises[index].sets = parseInt(val) || 3;
                renderCustomRoutineEquipmentSummary();
                renderRegionStatus();
            }
        }

        function updateCustomExerciseReps(index, val) {
            if (customRoutineState.exercises[index]) {
                customRoutineState.exercises[index].reps = val;
            }
        }

        function updateCustomRoutineRest(val) {
            customRoutineState.rest = parseInt(val) || 60;
            renderCustomRoutineEquipmentSummary();
        }

        function resetCustomRoutine() {
            if (customRoutineState.exercises.length === 0) return;
            if (confirm("Program taslağını sıfırlamak istediğinize emin misiniz?")) {
                customRoutineState.exercises = [];
                renderCustomRoutine();
                renderRegionStatus();
                renderStudioExerciseCatalog();
            }
        }

        function saveCustomRoutineToLibrary() {
            if (customRoutineState.exercises.length === 0) {
                alert("Lütfen önce programınıza en az 1 egzersiz ekleyin.");
                return;
            }

            // If we are editing a day's program, save to that day as well!
            if (customRoutineState.editingDayIdx !== null && customRoutineState.editingDayIdx !== undefined) {
                saveEditingRoutineToDay();
                return;
            }

            const title = (document.getElementById('customWorkoutTitleInput')?.value || '').trim() || "Özel Çelik Programım";
            const rest = parseInt(document.getElementById('customWorkoutRestSelect')?.value) || 60;

            const exercisesList = customRoutineState.exercises.map(item => {
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                return ex ? Object.assign({}, ex, { targetSets: item.sets, targetReps: item.reps }) : null;
            }).filter(Boolean);

            const user = getActiveUser();
            const progId = customRoutineState.editingProgramId || ('custom_' + Date.now());

            const newRoutine = {
                id: progId,
                title: title,
                split: selectedTargetMuscles.join('_') || 'custom',
                splitName: title,
                style: 'classic',
                goal: 'hypertrophy',
                duration: Math.round(exercisesList.length * 7),
                scheme: { sets: 3, reps: '8-12', rest: rest },
                warmups: [
                    { name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ısıt." }
                ],
                exercises: exercisesList,
                finisher: { name: "Balistik Bitiş", desc: "Maksimum tempolu taşıma veya swing." },
                updatedAt: Date.now(),
                isCustom: true
            };

            if (user && typeof upsertUserCustomProgram === 'function') {
                upsertUserCustomProgram(newRoutine, user.id);
            }

            // Synchronize any day in weeklySchedule using this program
            const schedule = getWeeklySchedule();
            let schedChanged = false;
            for (let d = 0; d < 7; d++) {
                if (schedule[d] && (schedule[d].id === progId || (schedule[d].customWorkout && schedule[d].customWorkout.id === progId))) {
                    schedule[d].title = title;
                    schedule[d].desc = `${exercisesList.length} Hareket • ${newRoutine.duration} Dk`;
                    schedule[d].customWorkout = newRoutine;
                    schedChanged = true;
                }
            }
            if (schedChanged) {
                saveWeeklySchedule(schedule);
            }

            // Check for missing sub-regions for friendly coach advice BEFORE clearing customRoutineState.exercises:
            const coveredSubKeys = new Set();
            customRoutineState.exercises.forEach(item => {
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                if (ex) {
                    const anatomy = getExerciseAnatomy(ex);
                    if (anatomy.subKey) coveredSubKeys.add(anatomy.subKey);
                    if (Array.isArray(anatomy.allSubKeys)) anatomy.allSubKeys.forEach(sk => coveredSubKeys.add(sk));
                }
            });
            let missingSubTips = [];
            selectedTargetMuscles.forEach(key => {
                const subDefs = (typeof STUDIO_SUB_REGIONS !== 'undefined' && STUDIO_SUB_REGIONS[key]) || [];
                subDefs.forEach(sub => {
                    if (!coveredSubKeys.has(sub.key)) {
                        const mName = (typeof STUDIO_REGION_MAP !== 'undefined' && STUDIO_REGION_MAP[key]?.name) || key;
                        missingSubTips.push(`${mName}: ${sub.name}`);
                    }
                });
            });

            if (typeof cancelStudioEditingSilent === 'function') {
                cancelStudioEditingSilent();
            }

            showToast(`✅ "${title}" kaydedildi!`);
            let alertMsg = `✅ "${title}" kaydedildi! '📚 Programlar' sekmesinden veya Haftalık Plandan başlatabilirsiniz.`;
            if (missingSubTips.length > 0) {
                alertMsg += `\n\n💡 Koç Notu: Seçtiğiniz hedeflerde şu alt bölgeler boşta kaldı:\n• ${missingSubTips.slice(0, 4).join('\n• ')}\n\nSonraki antrenmanınızda bu açıları da ekleyerek tam denge sağlayabilirsiniz.`;
            } else if (selectedTargetMuscles.length > 0) {
                alertMsg += `\n\n🎉 Kusursuz! Seçilen tüm kas bölgeleri ve açıları eksiksiz kapsandı.`;
            }
            alert(alertMsg);
            renderLibrary();
            renderActiveWorkout();
        }

        function startActiveWorkoutFromCustom() {
            if (customRoutineState.exercises.length === 0) {
                alert("Lütfen önce en az 1 egzersiz ekleyin.");
                return;
            }

            const title = (document.getElementById('customWorkoutTitleInput')?.value || '').trim() || "Özel Çelik Programım";
            const rest = parseInt(document.getElementById('customWorkoutRestSelect')?.value) || 60;

            const exercisesList = customRoutineState.exercises.map(item => {
                const ex = EXERCISES_DB.find(e => e.id === item.exId);
                return ex ? Object.assign({}, ex, { targetSets: item.sets, targetReps: item.reps }) : null;
            }).filter(Boolean);

            const sessionObj = {
                id: 'custom_' + Date.now(),
                title: title,
                split: selectedTargetMuscles.join('_') || 'custom',
                splitName: title,
                style: 'classic',
                goal: 'hypertrophy',
                duration: Math.round(exercisesList.length * 7),
                scheme: { sets: 3, reps: '8-12', rest: rest },
                warmups: [
                    { name: "Eklemsel CARs", dur: "90 sn", cue: "Tüm eklemleri kontrollü ısıt." }
                ],
                exercises: exercisesList,
                finisher: { name: "Balistik Bitiş", desc: "Maksimum tempolu taşıma veya swing." },
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

            const user = getActiveUser();
            const userWeights = (user && user.weights) ? user.weights : {};

            activeWorkoutSession.exercises.forEach(ex => {
                const numSets = isExerciseCardioMinutes(ex) ? 1 : (ex.targetSets || 3);
                const isBw = isExerciseBodyweight(ex);
                const isCardio = isExerciseCardioMinutes(ex);
                const defaultReps = resolveDefaultExerciseSetTarget(ex);
                let defaultWeight = isCardio ? '' : getExerciseRememberedWeight(ex);
                if (isBw && !isCardio && (defaultWeight === '' || defaultWeight === null || isNaN(defaultWeight))) {
                    defaultWeight = 0;
                }

                activeWorkoutSetsData[ex.id] = [];
                for (let s = 1; s <= numSets; s++) {
                    activeWorkoutSetsData[ex.id].push({
                        setNo: s,
                        weight: defaultWeight,
                        reps: defaultReps,
                        completed: false,
                        completedAt: null
                    });
                }
            });

            saveActiveWorkoutStateToStorage();
            startWorkoutTimer();
            renderActiveWorkout();
            switchTab('activeWorkoutTab');
            resetTimer(rest);
            playAlertSound();
            requestWakeLock();
        }

