// ==================== ODA 6: PROFİL & GÜVENLİK ŞEFİ (profile-guard) ====================
        // ==================== FIREBASE FIRESTORE CLOUD ENGINE ====================
        const FIREBASE_CONFIG = {
            apiKey: "AIzaSyBieTQ50PsVTLW1gTfsx52l42RJJ63xNqo",
            authDomain: "fitness-4f427.firebaseapp.com",
            projectId: "fitness-4f427",
            storageBucket: "fitness-4f427.firebasestorage.app",
            messagingSenderId: "974918246558",
            appId: "1:974918246558:web:200df22163c9d6f6271b8f",
            measurementId: "G-Y9B0DFQZT5"
        };

        let fbApp = null;
        let fbAuth = null;
        let secondaryFbApp = null;
        let fbDb = null;
        let isFirebaseReady = false;

        function getSecondaryFirebaseAuth() {
            try {
                if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') return null;
                if (!secondaryFbApp) {
                    const existing = (firebase.apps || []).find(a => a && a.name === 'CelikSecondaryAuthWorker');
                    secondaryFbApp = existing || firebase.initializeApp(FIREBASE_CONFIG, 'CelikSecondaryAuthWorker');
                }
                const secAuth = secondaryFbApp.auth();
                if (firebase.auth.Auth && firebase.auth.Auth.Persistence) {
                    secAuth.setPersistence(firebase.auth.Auth.Persistence.NONE).catch(() => {});
                }
                return secAuth;
            } catch (e) {
                return null;
            }
        }

        function updateCloudSyncBadge(status, text) {
            const badges = document.querySelectorAll('.cloud-sync-badge');
            badges.forEach(badge => {
                badge.className = 'cloud-sync-badge ' + (status || '');
                if (status === 'synced') {
                    badge.innerHTML = `🟢 ${text || 'Bulut Aktif'}`;
                    badge.title = "Firebase Firestore canlı ve eşitlenmiş durumda";
                } else if (status === 'syncing') {
                    badge.innerHTML = `🔄 ${text || 'Eşitleniyor...'}`;
                    badge.title = "Veriler Firebase bulutuna aktarılıyor...";
                } else {
                    badge.innerHTML = `☁️ ${text || 'Yerel Önbellek'}`;
                    badge.title = "Çevrimdışı mod: Veriler cihazda güvende, internet olunca eşitlenecek";
                }
            });
        }

        function getAthleteCloudSeal(targetUid, colName = '') {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : 'usr_admin');
            const colSealKey = colName ? `celik_kodu_cloud_seal_${colName}_${uid}` : '';
            const sealKey = `celik_kodu_cloud_seal_${uid}`;
            try {
                if (colSealKey) {
                    const colSaved = localStorage.getItem(colSealKey);
                    if (colSaved && colSaved.length >= 10) return colSaved;
                }
                const saved = localStorage.getItem(sealKey);
                if (saved && saved.length >= 10) return saved;
                const localCred = typeof getLocalUserCred === 'function' ? getLocalUserCred(uid) : null;
                if (localCred && localCred.passwordHash && String(localCred.passwordHash).length >= 16) {
                    const derived = 'seal_' + String(localCred.passwordHash).slice(0, 28);
                    localStorage.setItem(sealKey, derived);
                    return derived;
                }
                const users = typeof getAuthUsers === 'function' ? getAuthUsers() : [];
                const u = Array.isArray(users) ? users.find(x => x && x.id === uid) : null;
                if (u && u.passwordHash && String(u.passwordHash).length >= 16) {
                    const derived = 'seal_' + String(u.passwordHash).slice(0, 28);
                    localStorage.setItem(sealKey, derived);
                    return derived;
                }
            } catch {}
            return 'seal_ck_v1_' + String(uid);
        }

        function adoptCloudSyncSealIfPresent(colName, targetUid, cloudData) {
            if (!targetUid || !cloudData || typeof cloudData.syncSeal !== 'string') return '';
            const seal = cloudData.syncSeal.trim();
            if (seal.length < 10 || seal.length > 120) return '';
            try {
                if (colName) localStorage.setItem(`celik_kodu_cloud_seal_${colName}_${targetUid}`, seal);
                localStorage.setItem(`celik_kodu_cloud_seal_${targetUid}`, seal);
            } catch {}
            return seal;
        }

        async function writeAthleteDocWithSealHeal(colName, uid, buildPayloadFn) {
            const docRef = fbDb.collection(colName).doc(uid);
            const firstSeal = getAthleteCloudSeal(uid, colName);
            try {
                await docRef.set(buildPayloadFn(firstSeal), { merge: true });
                return true;
            } catch (err) {
                const isPermErr = err && (err.code === 'permission-denied' || /permission|insufficient/i.test(String(err.message || '')));
                if (!isPermErr) throw err;
                const snap = await docRef.get();
                const remoteSeal = snap.exists ? adoptCloudSyncSealIfPresent(colName, uid, snap.data()) : '';
                if (!remoteSeal || remoteSeal === firstSeal) throw err;
                await docRef.set(buildPayloadFn(remoteSeal), { merge: true });
                return true;
            }
        }

        function markLocalUserStateModified(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid) return;
            try {
                localStorage.setItem(`celik_kodu_state_updated_at_${uid}`, String(Date.now()));
                if (!IS_LOCAL_DEV) {
                    localStorage.setItem(`celik_kodu_pending_state_sync_${uid}`, '1');
                }
            } catch {}
        }

        async function flushPendingCloudOutbox() {
            if (IS_LOCAL_DEV || !isFirebaseReady || !fbDb || !navigator.onLine) return;
            const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
            if (!uid) return;
            try {
                if (localStorage.getItem(`celik_kodu_pending_workout_sync_${uid}`) === '1') {
                    const logs = getUserLogsById(uid);
                    if (logs.length > 0) await syncWorkoutLogsToCloud(logs, uid);
                }
                if (localStorage.getItem(`celik_kodu_pending_state_sync_${uid}`) === '1') {
                    await syncUserStateToCloud(uid);
                }
            } catch {}
        }

        let lastForegroundCloudRefreshAt = 0;
        let foregroundCloudRefreshPromise = null;

        function triggerForegroundCloudRefresh() {
            if (IS_LOCAL_DEV || navigator.onLine === false) return Promise.resolve();
            const uid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
            if (!uid) return Promise.resolve();
            const now = Date.now();
            if (foregroundCloudRefreshPromise) return foregroundCloudRefreshPromise;
            if (now - lastForegroundCloudRefreshAt < 8000) return Promise.resolve();
            lastForegroundCloudRefreshAt = now;
            foregroundCloudRefreshPromise = (async () => {
                try {
                    await flushPendingCloudOutbox();
                    if (typeof syncAllFromCloud === 'function') {
                        await syncAllFromCloud();
                    }
                } catch (e) {
                } finally {
                    foregroundCloudRefreshPromise = null;
                }
            })();
            return foregroundCloudRefreshPromise;
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                flushPendingCloudOutbox();
                if (typeof syncAllFromCloud === 'function') syncAllFromCloud();
            });
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && navigator.onLine !== false) {
                    triggerForegroundCloudRefresh();
                }
            });
            window.addEventListener('focus', () => {
                if (navigator.onLine !== false) {
                    triggerForegroundCloudRefresh();
                }
            });
        }

        function initFirebaseEngine() {
            try {
                if (typeof firebase === 'undefined') {
                    console.warn("Firebase SDK yüklenemedi. Yerel modda devam ediliyor.");
                    updateCloudSyncBadge('offline', 'Yerel Mod');
                    return;
                }

                if (!firebase.apps || !firebase.apps.length) {
                    fbApp = firebase.initializeApp(FIREBASE_CONFIG);
                } else {
                    fbApp = firebase.app();
                }

                if (typeof firebase.auth === 'function') {
                    try {
                        fbAuth = firebase.auth();
                        if (firebase.auth.Auth && firebase.auth.Auth.Persistence) {
                            fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
                        }
                        fbAuth.onAuthStateChanged(fbUser => {
                            if (fbUser && navigator.onLine) {
                                flushPendingCloudOutbox();
                            }
                        });
                    } catch {}
                }

                fbDb = firebase.firestore();

                // Çevrimdışı desteği (Offline-first IndexedDB önbellekleme)
                fbDb.enablePersistence({ synchronizeTabs: true }).catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.warn("Firestore çoklu sekme açık, önbellek tek sekmede çalışacak.");
                    } else if (err.code === 'unimplemented') {
                        console.warn("Mevcut tarayıcı IndexedDB kalıcılığını desteklemiyor.");
                    }
                });

                isFirebaseReady = true;
                updateCloudSyncBadge('synced', 'Bulut Aktif');
                console.log("🔥 Firebase Firestore başarıyla bağlandı!");

                // İlk bulut veri senkronizasyonunu başlat
                flushPendingCloudOutbox().then(() => syncAllFromCloud());

            } catch (err) {
                console.error("Firebase başlatma hatası:", err);
                updateCloudSyncBadge('offline', 'Yerel Mod');
            }
        }

        // Buluttan verileri çekme ve birleştirme (Merge)
        async function syncAllFromCloud() {
            if (!isFirebaseReady || !fbDb) return;
            updateCloudSyncBadge('syncing', 'Eşitleniyor...');

            try {
                // 1. AI Biyomekanik Koç Anahtarını Eşitle (Öncelikli hızlı senkron)
                await syncAiConfigFromCloud();

                // 2. Kullanıcıları eşitle
                await syncUsersFromCloud();

                // 3. Aktif kullanıcının verilerini eşitle (FitLAB otomatik direktif/program dinleme stabilite için kapalıdır)
                const uid = getActiveUserId();
                if (uid) {
                    await syncUserWorkoutLogsFromCloud(uid);
                    await syncUserScaleLogsFromCloud(uid);
                    await syncUserMeasurementsFromCloud(uid);
                    await syncUserStateFromCloud(uid);
                }

                updateCloudSyncBadge('synced', 'Bulut Aktif');
            } catch (e) {
                console.warn("Bulut eşitleme gecikti (çevrimdışı olabilir):", e);
                updateCloudSyncBadge('offline', 'Çevrimdışı');
            }
        }

        async function syncAiConfigFromCloud() {
            if (!isFirebaseReady || !fbDb) return;
            try {
                const localKey = (localStorage.getItem(GEMINI_API_STORAGE_KEY) || '').trim();
                const docRef = fbDb.collection('app_system').doc('ai_config');
                const docSnap = await docRef.get();

                if (docSnap && docSnap.exists) {
                    const data = docSnap.data();
                    if (data && data.geminiApiKey) {
                        const cloudKey = data.geminiApiKey.trim();
                        if (cloudKey) {
                            if (localKey !== cloudKey) {
                                localStorage.setItem(GEMINI_API_STORAGE_KEY, cloudKey);
                            }
                            if (typeof updateProfileGeminiStatusUI === 'function') updateProfileGeminiStatusUI();
                            const curEx = (typeof pickerContext !== 'undefined' && pickerContext && pickerContext.targetExId) ? EXERCISES_DB.find(e => e.id === pickerContext.targetExId) : null;
                            if (typeof updateGeminiAiModalUI === 'function') updateGeminiAiModalUI(curEx);
                            return;
                        }
                    }
                }
            } catch (err) {
                console.warn("AI config buluttan eşitlenemedi:", err);
            }
        }

        // KULLANICILAR BULUT EŞİTLEME
        async function syncUsersFromCloud() {
            if (!isFirebaseReady || !fbDb) return;
            try {
                const docRef = fbDb.collection('app_system').doc('users');
                let doc;
                try {
                    doc = await docRef.get({ source: 'server' });
                } catch (srvErr) {
                    doc = await docRef.get();
                }
                const localUsers = getAuthUsers();

                if (doc.exists) {
                    const data = doc.data();
                    if (data && Array.isArray(data.users) && data.users.length > 0) {
                        const cloudIds = new Set(data.users.map(cu => cu.id));
                        const cloudUnames = new Set(data.users.map(cu => normalizeAuthString(cu.username)).filter(Boolean));
                        const mergedMap = new Map();

                        // Yerelde olup bulutta aynı kullanıcı adıyla çakışmayanları koru
                        localUsers.forEach(u => {
                            const normU = normalizeAuthString(u.username);
                            if (!cloudIds.has(u.id) && normU && cloudUnames.has(normU)) {
                                return; // Buluttaki resmi hesap mükerrer yerel kaydı ezer
                            }
                            mergedMap.set(u.id, u);
                        });

                        data.users.forEach(rawCloudU => {
                            if (!rawCloudU || !rawCloudU.id) return;
                            if (rawCloudU.id === 'usr_1792524620913') return;
                            const u = { ...rawCloudU };
                            // Güvenlik & Stabilite: Buluttan gelebilecek eski/zayıf şifre kalıntılarını asla yerel doğrulayıcıya bulaştırma
                            delete u.password;
                            delete u.passwordHash;
                            delete u.salt;
                            delete u.geminiApiKey;

                            const localU = mergedMap.get(u.id) || {};
                            const isLocalNewer = (localU.updatedAt || 0) > (u.updatedAt || 0);
                            const merged = isLocalNewer ? { ...u, ...localU } : { ...localU, ...u };
                            // Bulutta onaylanmış (status !== 'pending') bir hesap varsa yerel pending durumunu ez
                            if (u.status !== 'pending' && merged.status === 'pending') {
                                merged.status = u.status || 'approved';
                            }
                            if (u.fbAuthEmail || localU.fbAuthEmail) {
                                merged.fbAuthEmail = u.fbAuthEmail || localU.fbAuthEmail;
                            }
                            if (localU.passwordStrengthLevel && !merged.passwordStrengthLevel) {
                                merged.passwordStrengthLevel = localU.passwordStrengthLevel;
                            }
                            const vaultCred = typeof getLocalUserCred === 'function' ? getLocalUserCred(u.id) : null;
                            if (vaultCred && vaultCred.passwordHash) {
                                merged.passwordStrengthLevel = vaultCred.passwordStrengthLevel || merged.passwordStrengthLevel || 'Güçlü';
                                if (vaultCred.mustChangePassword === false) merged.mustChangePassword = false;
                            }
                            delete merged.password;
                            delete merged.passwordHash;
                            delete merged.salt;
                            mergedMap.set(u.id, merged);
                        });
                        const finalUsers = Array.from(mergedMap.values());
                        localStorage.setItem('celik_kodu_auth_users', JSON.stringify(finalUsers));
                        if (typeof updateAdminPendingBadges === 'function') updateAdminPendingBadges();
                        return finalUsers;
                    }
                } else {
                    if (localUsers.length > 0) {
                        await syncUsersToCloud(localUsers);
                    }
                }
            } catch (err) {
                console.warn("Kullanıcılar buluttan çekilemedi:", err);
            }
        }

        // YEREL GELİŞTİRME & TEST ORTAMI KORUMASI (Canlı buluta yazmayı engeller, yerel snapshot yükler)
        const IS_LOCAL_DEV = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:'
        );

        async function hydrateLocalSnapshotIfDev() {
            if (!IS_LOCAL_DEV) return false;
            try {
                const res = await fetch('./data/local-cloud-snapshot.json', { cache: 'no-store' });
                if (!res.ok) return false;
                const snap = await res.json();
                let didHydrate = false;

                const snapUsersArr = Array.isArray(snap.users)
                    ? snap.users
                    : (snap.collections && snap.collections.app_system && snap.collections.app_system.users && Array.isArray(snap.collections.app_system.users.users)
                        ? snap.collections.app_system.users.users
                        : []);
                if (snapUsersArr.length > 0) {
                    const localUsers = getAuthUsers();
                    const mergedMap = new Map();
                    snapUsersArr.forEach(u => {
                        if (!u || !u.id) return;
                        if (u.salt && u.salt !== 'celik_salt_default' && u.passwordHash && typeof setLocalUserCred === 'function') {
                            const existingVault = getLocalUserCred(u.id);
                            if (!existingVault || (Number(u.passwordUpdatedAt || 0) > Number(existingVault.passwordUpdatedAt || 0))) {
                                setLocalUserCred(u.id, {
                                    salt: u.salt,
                                    passwordHash: u.passwordHash,
                                    passwordStrengthLevel: u.passwordStrengthLevel || 'Çok Güçlü',
                                    mustChangePassword: Boolean(u.mustChangePassword),
                                    passwordUpdatedAt: u.passwordUpdatedAt || Date.now()
                                });
                            }
                        }
                        const cleanU = { ...u };
                        delete cleanU.password;
                        delete cleanU.passwordHash;
                        delete cleanU.salt;
                        mergedMap.set(cleanU.id, cleanU);
                    });
                    localUsers.forEach(u => mergedMap.set(u.id, Object.assign({}, mergedMap.get(u.id) || {}, u)));
                    localStorage.setItem('celik_kodu_auth_users', JSON.stringify(Array.from(mergedMap.values())));
                    didHydrate = true;
                }
                const workoutLogsSource = snap.workout_logs || (snap.collections && snap.collections.workout_logs);
                if (workoutLogsSource && typeof workoutLogsSource === 'object') {
                    Object.entries(workoutLogsSource).forEach(([uid, entry]) => {
                        const logs = Array.isArray(entry) ? entry : (entry && Array.isArray(entry.logs) ? entry.logs : []);
                        if (logs.length > 0) {
                            const deletedSet = new Set(typeof getDeletedWorkoutLogIds === 'function' ? getDeletedWorkoutLogIds(uid) : []);
                            const existing = getUserLogsById(uid);
                            const map = new Map();
                            const pushLog = (l, preferOnTie) => {
                                if (!l || !l.id) return;
                                const lid = String(l.id);
                                const gid = l.garminActivityId ? String(l.garminActivityId) : '';
                                if (deletedSet.has(lid) || (gid && deletedSet.has(gid))) return;
                                const prev = map.get(lid);
                                if (!prev) {
                                    map.set(lid, l);
                                    return;
                                }
                                const prevEd = Number(prev.userEditedAt || 0);
                                const nextEd = Number(l.userEditedAt || 0);
                                if (nextEd > prevEd || (preferOnTie && nextEd === prevEd)) {
                                    map.set(lid, l);
                                }
                            };
                            logs.forEach(l => pushLog(l, false));
                            existing.forEach(l => pushLog(l, true));
                            const merged = sortWorkoutLogsDesc(Array.from(map.values()));
                            localStorage.setItem(`celik_kodu_history_${uid}`, JSON.stringify(merged));
                        }
                    });
                    didHydrate = true;
                }
                const scaleLogsSource = snap.scale_logs || (snap.collections && snap.collections.scale_logs);
                if (scaleLogsSource && typeof scaleLogsSource === 'object') {
                    Object.entries(scaleLogsSource).forEach(([uid, entry]) => {
                        const logs = Array.isArray(entry) ? entry : (entry && Array.isArray(entry.logs) ? entry.logs : []);
                        if (logs.length > 0) {
                            localStorage.setItem(`celik_kodu_scale_${uid}`, JSON.stringify(logs));
                        }
                    });
                }
                const measLogsSource = snap.measurement_logs || (snap.collections && snap.collections.measurement_logs);
                if (measLogsSource && typeof measLogsSource === 'object') {
                    Object.entries(measLogsSource).forEach(([uid, entry]) => {
                        const logs = Array.isArray(entry) ? entry : (entry && Array.isArray(entry.logs) ? entry.logs : []);
                        if (logs.length > 0) {
                            localStorage.setItem(`celik_kodu_measurements_${uid}`, JSON.stringify(logs));
                        }
                    });
                }
                if (didHydrate) {
                    updateCloudSyncBadge('synced', 'Yerel Test (Snapshot)');
                    syncAppViewState();
                    renderHistory();
                    renderActiveWorkout();
                }
                return didHydrate;
            } catch (e) {
                console.warn('Yerel snapshot yüklenemedi:', e);
                return false;
            }
        }
        window.hydrateLocalSnapshotIfDev = hydrateLocalSnapshotIfDev;

        async function syncUsersToCloud(users) {
            if (IS_LOCAL_DEV) {
                updateCloudSyncBadge('synced', 'Yerel Test (İzole)');
                return;
            }
            if (!isFirebaseReady || !fbDb) return;
            try {
                updateCloudSyncBadge('syncing', 'Kaydediliyor...');
                // Güvenlik: Açık metin şifreler (password), passwordHash, salt ve üçüncü taraf özel API anahtarları (geminiApiKey) asla buluta yazılmaz.
                // Kimlik doğrulama verileri istemci cihazda yerel (IndexedDB/localStorage) olarak izole edilir.
                const sanitizedUsers = (users || []).map(u => {
                    const copy = { ...u };
                    delete copy.password;
                    delete copy.passwordHash;
                    delete copy.salt;
                    delete copy.geminiApiKey;
                    Object.keys(copy).forEach(k => {
                        if (copy[k] === undefined) delete copy[k];
                    });
                    return copy;
                });
                await fbDb.collection('app_system').doc('users').set({
                    users: sanitizedUsers,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                updateCloudSyncBadge('synced', 'Bulut Aktif');
            } catch (err) {
                console.warn("Kullanıcılar buluta yüklenemedi:", err);
                updateCloudSyncBadge('offline', 'Kayıt Yerelde');
            }
        }

        async function fetchWorkoutLogsFromLocalBridge() {
            return [];
        }

        // ANTRENMAN GEÇMİŞİ BULUT EŞİTLEME
        async function syncUserWorkoutLogsFromCloud(uid) {
            if (!uid) return;
            const localLogs = getUserLogsById(uid);

            // Mükerrer yerel usr_ferit kayıtlarını da güvenle dahil et
            if (uid === 'usr_admin') {
                try {
                    const feritRaw = localStorage.getItem('celik_kodu_history_usr_ferit');
                    if (feritRaw) {
                        const feritLocal = JSON.parse(feritRaw);
                        if (Array.isArray(feritLocal)) {
                            feritLocal.forEach(fl => {
                                if (!localLogs.some(l => l.id === fl.id || (l.date === fl.date && l.totalSetsCompleted === fl.totalSetsCompleted))) {
                                    localLogs.push(fl);
                                }
                            });
                        }
                    }
                } catch(e) {}
            }

            let cloudLogs = [];
            try {
                if (isFirebaseReady && fbDb) {
                    const docRef = fbDb.collection('workout_logs').doc(uid);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data();
                        adoptCloudSyncSealIfPresent('workout_logs', uid, data);
                        if (data && Array.isArray(data.logs)) {
                            cloudLogs = data.logs;
                        }
                    }
                }
            } catch (err) {
                console.warn("Antrenmanlar buluttan doğrudan çekilemedi:", err);
            }

            const deletedSet = new Set(typeof getDeletedWorkoutLogIds === 'function' ? getDeletedWorkoutLogIds(uid) : []);
            const cloudById = new Map();
            cloudLogs.forEach(c => { if (c && c.id) cloudById.set(String(c.id), c); });
            const logMap = new Map();
            let filteredCloudDeletion = false;
            const upsertLog = (l) => {
                if (!l || !l.id) return;
                const lid = String(l.id);
                const gid = l.garminActivityId ? String(l.garminActivityId) : '';
                if (deletedSet.has(lid) || (gid && deletedSet.has(gid))) {
                    filteredCloudDeletion = true;
                    return;
                }
                const prev = logMap.get(lid);
                if (!prev) {
                    logMap.set(lid, l);
                    return;
                }
                const prevEd = Number(prev.userEditedAt || 0);
                const nextEd = Number(l.userEditedAt || 0);
                if (prevEd > nextEd) {
                    logMap.set(lid, Object.assign({}, prev, {
                        garminActivityId: prev.garminActivityId || l.garminActivityId,
                        healthSummary: prev.healthSummary || l.healthSummary
                    }));
                } else {
                    logMap.set(lid, Object.assign({}, prev, l, {
                        garminActivityId: l.garminActivityId || prev.garminActivityId,
                        healthSummary: l.healthSummary || prev.healthSummary,
                        exercises: nextEd > prevEd
                            ? l.exercises
                            : ((Array.isArray(l.exercises) && l.exercises.some(e => e && e.healthTelemetry))
                                ? l.exercises
                                : (Array.isArray(prev.exercises) && prev.exercises.some(e => e && e.healthTelemetry) ? prev.exercises : l.exercises))
                    }));
                }
            };
            cloudLogs.forEach(upsertLog);
            localLogs.forEach(upsertLog);

            // Aynı gün gerçek uygulama kaydı varsa mükerrer garmin_... kaydını temizle
            const realDates = new Set();
            for (const item of logMap.values()) {
                if (item && !String(item.id || '').startsWith('garmin_') && item.date) {
                    realDates.add(String(item.date).slice(0, 10));
                }
            }
            for (const [k, item] of logMap.entries()) {
                if (String(k).startsWith('garmin_') && item && item.date && realDates.has(String(item.date).slice(0, 10))) {
                    logMap.delete(k);
                }
            }

            const hasLocalEditNewerThanCloud = localLogs.some(l => {
                if (!l || !l.id) return false;
                const cloudMatch = cloudById.get(String(l.id));
                return Number(l.userEditedAt || 0) > Number((cloudMatch && cloudMatch.userEditedAt) || 0);
            });

            if (logMap.size > 0 || (cloudLogs.length > 0 && filteredCloudDeletion)) {
                const mergedLogs = sortWorkoutLogsDesc(Array.from(logMap.values()));
                localStorage.setItem(`celik_kodu_history_${uid}`, JSON.stringify(mergedLogs));
                if (window.GarminTredictChief && typeof window.GarminTredictChief.handoffCompletedActivitiesToTabChiefs === 'function') {
                    window.GarminTredictChief.handoffCompletedActivitiesToTabChiefs();
                }
                renderHistory();
                applyWednesdayHammerCurlPatch();

                if (!IS_LOCAL_DEV && (mergedLogs.length !== cloudLogs.length || hasLocalEditNewerThanCloud || filteredCloudDeletion)) {
                    syncWorkoutLogsToCloud(mergedLogs, uid);
                }
            }
        }

        async function syncWorkoutLogsToCloud(logs, uid) {
            if (IS_LOCAL_DEV) {
                updateCloudSyncBadge('synced', 'Yerel Test (İzole)');
                return;
            }
            if (!uid) return;
            try {
                updateCloudSyncBadge('syncing', 'Kaydediliyor...');
                if (isFirebaseReady && fbDb && navigator.onLine !== false) {
                    await writeAthleteDocWithSealHeal('workout_logs', uid, (seal) => ({
                        logs: logs,
                        clientUpdatedAt: Date.now(),
                        syncSeal: seal,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }));
                    localStorage.removeItem(`celik_kodu_pending_workout_sync_${uid}`);
                    updateCloudSyncBadge('synced', 'Bulut Aktif');
                } else {
                    throw new Error('Firebase offline or unavailable');
                }
            } catch (err) {
                try {
                    localStorage.setItem(`celik_kodu_pending_workout_sync_${uid}`, '1');
                } catch {}
                console.warn("Antrenmanlar çevrimdışı kuyruğa alındı (internet gelince eşitlenecek):", err);
                updateCloudSyncBadge('offline', 'Kuyrukta (İnternet Bekleniyor)');
            }
        }

        // ==================== 7 EKİM 2026 ÇARŞAMBA DÖNÜK VERİ ENJEKSİYONU ====================
        function applyWednesdayHammerCurlPatch() {
            try {
                let anyModified = false;
                const targetDate = '2026-10-07';

                // Yalnızca usr_admin geçmiş kaydını tara (diğer kullanıcıların geçmişine müdahale edilmez)
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key !== 'celik_kodu_history_usr_admin') continue;

                    const uid = key.replace('celik_kodu_history_', '');
                    let logs = [];
                    try { logs = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { logs = []; }
                    if (!Array.isArray(logs) || logs.length === 0) continue;

                    let fileModified = false;
                    const deletedSet = (typeof getDeletedWorkoutLogIds === 'function')
                        ? new Set(getDeletedWorkoutLogIds(uid))
                        : new Set();
                    const nov9RecoveredLog = {"id":"log_1794246654598","date":"2026-11-09","dateFormatted":"9 Kas 2026 20:50","title":"Pazartesi: Tüm Vücut","program":"Pazartesi: Tüm Vücut","programName":"Pazartesi: Tüm Vücut","locationType":"salon","locationName":"Rodium","duration":59,"durationFormatted":"59:30","durationSecs":3570,"rpe":"RPE 8 (İdeal, cepte 2 tekrar kaldı)","notes":"","totalVolumeKg":5616.8,"totalSetsCompleted":27,"totalRepsCompleted":276,"totalIsometricSecsCompleted":20,"muscleGroups":["Kanatlar (Sırt Genişliği)","Orta Sırt & Kürek Kemiği Kasları","Arka Bacak (Kalçadan Eğilen Üst/Uzun Kısım)","Ana Kalça Kası","Orta Göğüs","Ön Bacak (Diz Üstü İç ve Dış Kısım)","Ana ve Yan Kalça","Ön Omuz","Yan Omuz","Ön Karın (Üst ve Alt Karın)","Derin İç Karın","Ön Kalça Kası","Triceps İç / Uzun Kısım","Triceps Dış Kısım","Ön Bacak & Ana Kalça Kası","Orta Göğüs & Ön Omuz","Derin İç Karın (Korse Kası)"],"exercises":[{"id":"db_rotational_gorilla_row","name":"Rotasyonel Gorilla Row","equipment":"dumbbell","category":"pull","muscle":"Kanatlar (Sırt Genişliği), Orta Sırt & Kürek Kemiği Kasları","cue":"Geniş sumo menteşesinde bir dambılı yere bastırırken diğerini gövdeyi döndürerek kaburgaya patlayıcı çek.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":10,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":120,"interSet":null,"heartrate":114,"heartrateMax":124,"durationSec":82,"watchStartTime":"2026-11-09T16:51:44.000Z","matchedBy":"sequence"},{"setNo":2,"weight":10,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":120,"interSet":null,"heartrate":122,"heartrateMax":131,"durationSec":25,"watchStartTime":"2026-11-09T16:53:17.000Z","matchedBy":"sequence"},{"setNo":3,"weight":10,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":120,"interSet":null,"heartrate":135,"heartrateMax":138,"durationSec":26,"watchStartTime":"2026-11-09T16:55:10.000Z","matchedBy":"sequence"}],"completedSetsCount":3,"maxWeight":10,"maxReps":12,"exerciseVolume":360,"healthTelemetry":{"avgHeartrate":119,"peakHeartrate":131,"totalTimeUnderTensionSec":118}},{"id":"db_rdl","name":"Dambıl RDL","equipment":"dumbbell","category":"legs_hinge","muscle":"Arka Bacak (Kalçadan Eğilen Üst/Uzun Kısım), Ana Kalça Kası","cue":"Dizleri hafif kırık sabitle, kalçayı arkadaki duvara değdirir gibi geriye uzat, sırtı masa gibi düz tut.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":15,"reps":15,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":225,"interSet":null,"heartrate":119,"heartrateMax":126,"durationSec":57,"watchStartTime":"2026-11-09T16:57:54.000Z","matchedBy":"sequence"},{"setNo":2,"weight":17.5,"reps":15,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":263,"interSet":null,"heartrate":122,"heartrateMax":137,"durationSec":81,"watchStartTime":"2026-11-09T16:59:05.000Z","matchedBy":"sequence"},{"setNo":3,"weight":20,"reps":15,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":300,"interSet":null,"heartrate":129,"heartrateMax":129,"durationSec":2,"watchStartTime":"2026-11-09T17:01:00.000Z","matchedBy":"sequence"}],"completedSetsCount":3,"maxWeight":20,"maxReps":15,"exerciseVolume":788,"healthTelemetry":{"avgHeartrate":131,"peakHeartrate":141,"totalTimeUnderTensionSec":252}},{"id":"db_bench_press","name":"Dambıl Bench Press","equipment":"dumbbell","category":"push","muscle":"Orta Göğüs","cue":"Dirsekleri gövdeye 45° açıda tut, dambılları yukarıda çarpmadan göğüs kaslarını sıkarak kilitle.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":35,"reps":9,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":315,"interSet":null,"heartrate":134,"heartrateMax":148,"durationSec":63,"watchStartTime":"2026-11-09T17:02:18.000Z","matchedBy":"sequence"},{"setNo":2,"weight":30,"reps":10,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":300,"interSet":null,"heartrate":142,"heartrateMax":144,"durationSec":66,"watchStartTime":"2026-11-09T17:03:32.000Z","matchedBy":"sequence"},{"setNo":3,"weight":30,"reps":10,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":300,"interSet":null,"heartrate":126,"heartrateMax":139,"durationSec":69,"watchStartTime":"2026-11-09T17:07:47.000Z","matchedBy":"sequence"}],"completedSetsCount":3,"maxWeight":35,"maxReps":10,"exerciseVolume":915,"healthTelemetry":{"avgHeartrate":121,"peakHeartrate":137,"totalTimeUnderTensionSec":152}},{"id":"db_seesaw_lunge","name":"Dambıl Seesaw Lunge (Dinamik İleri-Geri Lunge)","equipment":"dumbbell","category":"legs_quad","muscle":"Ön Bacak (Diz Üstü İç ve Dış Kısım), Ana ve Yan Kalça","cue":"Öne lunge ile 90° çöküşten dönerken ayağı orta hatta yere basmadan sarkaç gibi kesintisiz geriye lunge fazına aktarın.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":7.5,"reps":6,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":45,"interSet":null,"heartrate":132,"heartrateMax":144,"durationSec":43,"watchStartTime":"2026-11-09T17:09:28.000Z","matchedBy":"sequence"},{"setNo":2,"weight":7.5,"reps":6,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":45,"interSet":null,"heartrate":132,"heartrateMax":147,"durationSec":111,"watchStartTime":"2026-11-09T17:14:10.000Z","matchedBy":"sequence"},{"setNo":3,"weight":2.5,"reps":6,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":15,"interSet":null,"heartrate":138,"heartrateMax":138,"durationSec":1,"watchStartTime":"2026-11-09T17:22:19.000Z","matchedBy":"sequence"}],"completedSetsCount":3,"maxWeight":7.5,"maxReps":6,"exerciseVolume":105,"healthTelemetry":{"avgHeartrate":131,"peakHeartrate":138,"totalTimeUnderTensionSec":112}},{"id":"db_push_press","name":"Dambıl Push Press","equipment":"dumbbell","category":"push","muscle":"Ön Omuz, Yan Omuz","cue":"Dambıllar omuzdayken dizleri 20° hafifçe büküp yaylan, bacaklardan aldığın yaylanma gücüyle dambılları baş üstüne fırlat.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":7.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":90,"interSet":null,"heartrate":133,"heartrateMax":137,"durationSec":26,"watchStartTime":"2026-11-09T17:26:45.000Z","matchedBy":"sequence"},{"setNo":2,"weight":10,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":120,"interSet":{"id":"bw_burpee","name":"Burpee","muscle":"Ön Bacak & Ana Kalça Kası, Orta Göğüs & Ön Omuz","category":"conditioning","equipment":"bodyweight","metricType":"reps","value":10,"completed":true},"heartrate":131,"heartrateMax":131,"durationSec":2,"watchStartTime":"2026-11-09T17:27:31.000Z","matchedBy":"sequence"},{"setNo":3,"weight":12.5,"reps":10,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":125,"interSet":null,"heartrate":131,"heartrateMax":131,"durationSec":1,"watchStartTime":"2026-11-09T17:28:19.000Z","matchedBy":"sequence"}],"completedSetsCount":3,"maxWeight":12.5,"maxReps":12,"exerciseVolume":335,"healthTelemetry":{"avgHeartrate":140,"peakHeartrate":148,"totalTimeUnderTensionSec":141}},{"id":"bw_mountain_climber","name":"Mountain Climber","equipment":"bodyweight","category":"core","muscle":"Ön Karın (Üst ve Alt Karın), Derin İç Karın, Ön Kalça Kası","cue":"Yüksek şınav pozisyonunda kalçayı kaldırmadan dizleri sırayla koşar adım göğse çek.","isBodyweight":true,"isTimeBased":false,"sets":[{"setNo":1,"weight":0,"reps":15,"isBodyweight":true,"isTimeBased":false,"completed":true,"volume":675,"interSet":null,"heartrate":122,"heartrateMax":127,"durationSec":24,"watchStartTime":"2026-11-09T17:30:02.000Z","matchedBy":"sequence"},{"setNo":2,"weight":0,"reps":15,"isBodyweight":true,"isTimeBased":false,"completed":true,"volume":675,"interSet":null,"heartrate":128,"heartrateMax":135,"durationSec":44,"watchStartTime":"2026-11-09T17:30:57.000Z","matchedBy":"sequence"},{"setNo":3,"weight":0,"reps":15,"isBodyweight":true,"isTimeBased":false,"completed":true,"volume":675,"interSet":null,"heartrate":137,"heartrateMax":137,"durationSec":1,"watchStartTime":"2026-11-09T17:31:55.000Z","matchedBy":"sequence"}],"completedSetsCount":3,"maxWeight":0,"maxReps":15,"exerciseVolume":2025,"healthTelemetry":{"avgHeartrate":128,"peakHeartrate":142,"totalTimeUnderTensionSec":289}},{"id":"db_skullcrusher","name":"Dambıl Skullcrusher","equipment":"dumbbell","category":"push","muscle":"Triceps İç / Uzun Kısım, Triceps Dış Kısım","cue":"Düz sehpada dirsekleri omuz hizasında dikey sabitle, dambılları şakaklara indirip triceps ile uzat.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":7.5,"reps":8,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":60,"interSet":null,"heartrate":133,"heartrateMax":136,"durationSec":32,"watchStartTime":"2026-11-09T17:32:02.000Z","matchedBy":"sequence"},{"setNo":2,"weight":7.5,"reps":8,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":60,"interSet":{"id":"bw_plank","name":"Plank","muscle":"Derin İç Karın (Korse Kası), Ön Karın (Üst ve Alt Karın)","category":"core","equipment":"bodyweight","metricType":"time","value":20,"completed":true},"heartrate":121,"heartrateMax":135,"durationSec":37,"watchStartTime":"2026-11-09T17:34:20.000Z","matchedBy":"sequence"},{"setNo":3,"weight":7.5,"reps":6,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":45,"interSet":null,"heartrate":132,"heartrateMax":132,"durationSec":5,"watchStartTime":"2026-11-09T17:35:22.000Z","matchedBy":"sequence"}],"completedSetsCount":3,"maxWeight":7.5,"maxReps":8,"exerciseVolume":165,"healthTelemetry":{"avgHeartrate":131,"peakHeartrate":151,"totalTimeUnderTensionSec":393}},{"id":"db_lateral_raise","name":"Dambıl Lateral Raise","equipment":"dumbbell","category":"push","muscle":"Yan Omuz","cue":"Dirsekleri hafif kırık tut, kolları omuz hizasına kadar sürahi döker gibi kaldır.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":7.5,"reps":10,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":75,"interSet":null,"heartrate":130,"heartrateMax":133,"durationSec":37,"watchStartTime":"2026-11-09T17:35:36.000Z","matchedBy":"sequence"},{"setNo":2,"weight":7.5,"reps":10,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":75,"interSet":null,"heartrate":124,"heartrateMax":128,"durationSec":35,"watchStartTime":"2026-11-09T17:38:44.000Z","matchedBy":"sequence"},{"setNo":3,"weight":7.5,"reps":10,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":75,"interSet":null,"heartrate":118,"heartrateMax":122,"durationSec":34,"watchStartTime":"2026-11-09T17:41:01.000Z","matchedBy":"sequence"},{"setNo":4,"weight":5,"reps":7,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":35,"interSet":null,"heartrate":120,"heartrateMax":132,"durationSec":108,"watchStartTime":"2026-11-09T17:41:41.000Z","matchedBy":"sequence"}],"completedSetsCount":4,"maxWeight":7.5,"maxReps":10,"exerciseVolume":260,"healthTelemetry":{"avgHeartrate":131,"peakHeartrate":146,"totalTimeUnderTensionSec":670}},{"id":"bw_burpee","name":"Burpee (Set Arası)","equipment":"bodyweight","category":"conditioning","muscle":"Ön Bacak & Ana Kalça Kası, Orta Göğüs & Ön Omuz","cue":"Set arası aktif dinlenme / ilave hareket.","isBodyweight":true,"isTimeBased":false,"isInterSetExtra":true,"sets":[{"setNo":1,"weight":0,"reps":10,"isBodyweight":true,"isTimeBased":false,"completed":true,"volume":450,"heartrate":121,"heartrateMax":128,"durationSec":29,"watchStartTime":"2026-11-09T17:45:26.000Z","matchedBy":"sequence"}],"completedSetsCount":1,"maxWeight":0,"maxReps":10,"exerciseVolume":450,"healthTelemetry":{"avgHeartrate":136,"peakHeartrate":137,"totalTimeUnderTensionSec":20}},{"id":"bw_plank","name":"Plank (Set Arası)","equipment":"bodyweight","category":"core","muscle":"Derin İç Karın (Korse Kası), Ön Karın (Üst ve Alt Karın)","cue":"Set arası aktif dinlenme / ilave hareket.","isBodyweight":true,"isTimeBased":true,"isInterSetExtra":true,"sets":[{"setNo":1,"weight":0,"reps":20,"isBodyweight":true,"isTimeBased":true,"completed":true,"volume":214,"heartrate":116,"heartrateMax":134,"durationSec":41,"watchStartTime":"2026-11-09T17:47:22.000Z","matchedBy":"sequence"}],"completedSetsCount":1,"maxWeight":0,"maxReps":20,"exerciseVolume":214,"healthTelemetry":{"avgHeartrate":131,"peakHeartrate":131,"totalTimeUnderTensionSec":2}}],"timestamp":1794246654602,"garminActivityId":"sfWR98KCBGqhDxBKYXULr2","healthSummary":{"durationTotalSec":3581,"durationSetsSec":1142,"durationRestSec":2440,"calories":375,"heartrateAvg":127,"heartrateMax":151}};
                    if (!deletedSet.has('log_1794246654598') && !deletedSet.has('sfWR98KCBGqhDxBKYXULr2') && !deletedSet.has('garmin_sfWR98KCBGqhDxBKYXULr2')) {
                        const nov9Idx = logs.findIndex(l => l && (l.id === 'log_1794246654598' || String(l.date || '').slice(0, 10) === '2026-11-09'));
                        if (nov9Idx === -1) {
                            logs.unshift(nov9RecoveredLog);
                            sortWorkoutLogsDesc(logs);
                            fileModified = true;
                            anyModified = true;
                        } else if ((!logs[nov9Idx].healthSummary || !logs[nov9Idx].garminActivityId) && !logs[nov9Idx].userEditedAt) {
                            logs[nov9Idx] = Object.assign({}, logs[nov9Idx], nov9RecoveredLog);
                            fileModified = true;
                            anyModified = true;
                        }
                    }
                    const nov13RecoveredLog = {"id":"garmin_ezUmorGZxaWoPigQdmGbrX","garminActivityId":"ezUmorGZxaWoPigQdmGbrX","sourceChief":"garmin-tredict-guard","date":"2026-11-13","dateFormatted":"13 Kas 2026 19:26","timestamp":1794587163223,"program":"⚔️ Cuma: Cuma: Tüm Vücut","title":"⚔️ Cuma: Cuma: Tüm Vücut","locationType":"salon","locationName":"Garmin FR945","duration":44,"durationFormatted":"44:27","durationSecs":2667,"totalVolumeKg":5387.5,"totalSetsCompleted":25,"totalRepsCompleted":277,"totalIsometricSecsCompleted":0,"muscleGroups":["Arka Bacak","Arka Bacak & Kalça Bağı","Ana Kalça","Arka Kol Uzun Baş","Pazı İç Baş","Pazı Dış Baş","Üst Göğüs","Kanatlar","Yan Omuz","Dış Ön Bacak","İç Ön Bacak","Yan Karın","Derin İç Karın"],"exercises":[{"id":"db_rdl","name":"Dambıl RDL","equipment":"dumbbell","category":"legs_hinge","muscle":"Arka Bacak, Arka Bacak & Kalça Bağı, Ana Kalça","cue":"Dizleri hafif kırık sabitle, kalçayı arkadaki duvara değdirir gibi geriye uzat, sırtı masa gibi düz tut.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":15,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":180,"interSet":null,"heartrate":93,"heartrateMax":101,"durationSec":55,"watchStartTime":"2026-11-13T16:26:03.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":17.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":210,"interSet":null,"heartrate":97,"heartrateMax":106,"durationSec":53,"watchStartTime":"2026-11-13T16:27:43.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":17.5,"reps":15,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":262.5,"interSet":null,"heartrate":105,"heartrateMax":112,"durationSec":58,"watchStartTime":"2026-11-13T16:29:36.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":17.5,"maxReps":15,"exerciseVolume":652.5,"healthTelemetry":{"avgHeartrate":98,"peakHeartrate":112,"totalTimeUnderTensionSec":166}},{"id":"db_triceps_overhead","name":"Dambıl Başüstü Triceps","equipment":"dumbbell","category":"push","muscle":"Arka Kol Uzun Baş","cue":"Dirsekleri başın iki yanında tavana bakacak şekilde sabit tut, sadece ön kolları büküp baş arkasından uzat.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":12.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":150,"interSet":null,"heartrate":91,"heartrateMax":107,"durationSec":48,"watchStartTime":"2026-11-13T16:31:44.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":12.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":150,"interSet":null,"heartrate":110,"heartrateMax":115,"durationSec":44,"watchStartTime":"2026-11-13T16:33:21.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":10,"reps":0,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":0,"interSet":null,"heartrate":122,"heartrateMax":122,"durationSec":8,"watchStartTime":"2026-11-13T16:35:05.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":12.5,"maxReps":12,"exerciseVolume":300,"healthTelemetry":{"avgHeartrate":102,"peakHeartrate":122,"totalTimeUnderTensionSec":100}},{"id":"mach_cable_biceps","name":"Kablo Biceps Curl","equipment":"machine","category":"pull","muscle":"Pazı İç Baş, Pazı Dış Baş","cue":"Düşük makarada düz barı tut, dirsekleri sabit tutarak kablonun sürekli geriliminde biceps kaslarını sık.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":12,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":144,"interSet":null,"heartrate":116,"heartrateMax":119,"durationSec":31,"watchStartTime":"2026-11-13T16:35:28.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":20,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":240,"interSet":null,"heartrate":131,"heartrateMax":135,"durationSec":21,"watchStartTime":"2026-11-13T16:36:44.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":20,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":240,"interSet":null,"heartrate":114,"heartrateMax":122,"durationSec":26,"watchStartTime":"2026-11-13T16:37:44.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":20,"maxReps":12,"exerciseVolume":624,"healthTelemetry":{"avgHeartrate":119,"peakHeartrate":135,"totalTimeUnderTensionSec":78}},{"id":"bb_incline_bench","name":"Incline Barbell Bench","equipment":"barbell","category":"push","muscle":"Üst Göğüs","cue":"30° açılı sehpada barı köprücük kemiğinin hemen altına indir, üst göğüs lifleriyle yukarı presle.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":30,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":360,"interSet":null,"heartrate":119,"heartrateMax":131,"durationSec":101,"watchStartTime":"2026-11-13T16:38:56.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":30,"reps":10,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":300,"interSet":null,"heartrate":125,"heartrateMax":133,"durationSec":49,"watchStartTime":"2026-11-13T16:41:51.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":30,"reps":7,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":210,"interSet":null,"heartrate":122,"heartrateMax":127,"durationSec":59,"watchStartTime":"2026-11-13T16:43:49.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":30,"maxReps":12,"exerciseVolume":870,"healthTelemetry":{"avgHeartrate":121,"peakHeartrate":133,"totalTimeUnderTensionSec":209}},{"id":"mach_lat_pulldown","name":"Lat Pulldown","equipment":"machine","category":"pull","muscle":"Kanatlar","cue":"Bacak pedine sıkıca otur, barı üst göğse doğru dirsekleri kaburgalara çekerek indir, arkaya aşırı yatma.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":25,"reps":15,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":375,"interSet":null,"heartrate":122,"heartrateMax":131,"durationSec":91,"watchStartTime":"2026-11-13T16:46:02.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":30,"reps":15,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":450,"interSet":null,"heartrate":125,"heartrateMax":130,"durationSec":43,"watchStartTime":"2026-11-13T16:48:25.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":40,"reps":15,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":600,"interSet":null,"heartrate":120,"heartrateMax":124,"durationSec":43,"watchStartTime":"2026-11-13T16:50:08.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":40,"maxReps":15,"exerciseVolume":1425,"healthTelemetry":{"avgHeartrate":122,"peakHeartrate":131,"totalTimeUnderTensionSec":177}},{"id":"db_lateral_raise","name":"Dambıl Lateral Raise","equipment":"dumbbell","category":"push","muscle":"Yan Omuz","cue":"Dirsekleri hafif kırık tut, kolları omuz hizasına kadar sürahi döker gibi kaldır.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":7.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":90,"interSet":null,"heartrate":112,"heartrateMax":120,"durationSec":53,"watchStartTime":"2026-11-13T16:51:51.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":7.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":90,"interSet":null,"heartrate":120,"heartrateMax":124,"durationSec":44,"watchStartTime":"2026-11-13T16:53:29.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":7,"reps":16,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":112,"interSet":null,"heartrate":121,"heartrateMax":127,"durationSec":59,"watchStartTime":"2026-11-13T16:54:57.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":7.5,"maxReps":16,"exerciseVolume":292,"healthTelemetry":{"avgHeartrate":118,"peakHeartrate":127,"totalTimeUnderTensionSec":156}},{"id":"db_goblet_squat","name":"Dambıl Goblet Squat","equipment":"dumbbell","category":"legs_quad","muscle":"Dış Ön Bacak, İç Ön Bacak","cue":"Dambılı göğsüne dikey yapıştır, topuklar yerden kalkmadan dirsekler dizlerin içine değene kadar çömel.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":12.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":150,"interSet":null,"heartrate":121,"heartrateMax":145,"durationSec":49,"watchStartTime":"2026-11-13T16:56:00.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":15,"reps":4,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":60,"interSet":null,"heartrate":132,"heartrateMax":141,"durationSec":36,"watchStartTime":"2026-11-13T16:57:49.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":17.5,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":210,"interSet":null,"heartrate":135,"heartrateMax":147,"durationSec":115,"watchStartTime":"2026-11-13T16:59:13.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":17.5,"maxReps":12,"exerciseVolume":420,"healthTelemetry":{"avgHeartrate":131,"peakHeartrate":147,"totalTimeUnderTensionSec":200}},{"id":"mach_cable_woodchopper","name":"Kablo Woodchopper","equipment":"machine","category":"core","muscle":"Yan Karın, Derin İç Karın","cue":"Yüksek makaradan tutacağı çift elle kavra, kolları düz tutarak gövde rotasyonuyla zıt diz yönüne çapraz çek.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":25,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":300,"interSet":null,"heartrate":136,"heartrateMax":155,"durationSec":172,"watchStartTime":"2026-11-13T17:02:10.000Z","matchedBy":"planned_workout_step"},{"setNo":2,"weight":22,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":264,"interSet":null,"heartrate":144,"heartrateMax":155,"durationSec":83,"watchStartTime":"2026-11-13T17:05:47.000Z","matchedBy":"planned_workout_step"},{"setNo":3,"weight":20,"reps":12,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":240,"interSet":null,"heartrate":137,"heartrateMax":155,"durationSec":117,"watchStartTime":"2026-11-13T17:07:55.000Z","matchedBy":"planned_workout_step"}],"completedSetsCount":3,"maxWeight":25,"maxReps":12,"exerciseVolume":804,"healthTelemetry":{"avgHeartrate":138,"peakHeartrate":155,"totalTimeUnderTensionSec":372}},{"id":"mach_cable_biceps","name":"Kablo Biceps Curl","equipment":"machine","category":"pull","muscle":"Pazı İç Baş, Pazı Dış Baş","cue":"Düşük makarada düz barı tut, dirsekleri sabit tutarak kablonun sürekli geriliminde biceps kaslarını sık.","isBodyweight":false,"isTimeBased":false,"sets":[{"setNo":1,"weight":0,"reps":0,"isBodyweight":false,"isTimeBased":false,"completed":true,"volume":0,"interSet":null,"heartrate":139,"heartrateMax":140,"durationSec":2,"watchStartTime":"2026-11-13T17:10:28.000Z","matchedBy":"watch_category_extra"}],"completedSetsCount":1,"maxWeight":0,"maxReps":0,"exerciseVolume":0,"healthTelemetry":{"avgHeartrate":139,"peakHeartrate":140,"totalTimeUnderTensionSec":2},"isInterSetExtra":true}],"healthSummary":{"durationTotalSec":2667,"durationSetsSec":1459,"durationRestSec":1207,"calories":287,"heartrateAvg":122,"heartrateMax":156},"programName":"⚔️ Cuma: Cuma: Tüm Vücut"};
                    if (!deletedSet.has('garmin_ezUmorGZxaWoPigQdmGbrX') && !deletedSet.has('ezUmorGZxaWoPigQdmGbrX')) {
                        const nov13Idx = logs.findIndex(l => l && (String(l.id || '') === 'garmin_ezUmorGZxaWoPigQdmGbrX' || String(l.garminActivityId || '') === 'ezUmorGZxaWoPigQdmGbrX'));
                        if (nov13Idx === -1) {
                            logs.unshift(nov13RecoveredLog);
                            sortWorkoutLogsDesc(logs);
                            fileModified = true;
                            anyModified = true;
                        } else if ((!logs[nov13Idx].healthSummary || !logs[nov13Idx].garminActivityId) && !logs[nov13Idx].userEditedAt) {
                            logs[nov13Idx] = Object.assign({}, logs[nov13Idx], nov13RecoveredLog);
                            fileModified = true;
                            anyModified = true;
                        }
                    }
                    logs.forEach(log => {
                        const logDate = String(log.date || '').split('T')[0];
                        const isWed = (logDate === targetDate) || 
                                      (log.dateFormatted && log.dateFormatted.includes('7 Eki 2026')) ||
                                      (log.dateFormatted && log.dateFormatted.includes('07.10.2026'));

                        if (isWed && !log.userEditedAt) {
                            if (!Array.isArray(log.exercises)) log.exercises = [];
                            const alreadyHasHammer = log.exercises.some(e => 
                                e.id === 'db_hammer_curl' || 
                                (e.name && e.name.toLowerCase().includes('hammer curl'))
                            );

                            if (!alreadyHasHammer) {
                                const hammerEx = {
                                    id: 'db_hammer_curl',
                                    name: 'Dambıl Hammer Curl',
                                    equipment: 'dumbbell',
                                    category: 'pull',
                                    muscle: 'Biceps, Ön Kol',
                                    cue: 'Dirsekleri gövdeye sabitleyin, nötr tutuşla kaldırın.',
                                    sets: [
                                        { setNo: 1, weight: 10, reps: 12, completed: true, volume: 120 },
                                        { setNo: 2, weight: 10, reps: 12, completed: true, volume: 120 },
                                        { setNo: 3, weight: 15, reps: 12, completed: true, volume: 180 }
                                    ],
                                    completedSetsCount: 3,
                                    maxWeight: 15,
                                    exerciseVolume: 420
                                };

                                log.exercises.push(hammerEx);
                                log.totalVolumeKg = Math.round(((log.totalVolumeKg || 0) + 420) * 10) / 10;
                                log.totalSetsCompleted = (log.totalSetsCompleted || 0) + 3;
                                log.totalRepsCompleted = (log.totalRepsCompleted || 0) + 36;

                                if (!Array.isArray(log.muscleGroups)) log.muscleGroups = [];
                                if (!log.muscleGroups.includes('Biceps')) log.muscleGroups.push('Biceps');
                                if (!log.muscleGroups.includes('Ön Kol')) log.muscleGroups.push('Ön Kol');

                                fileModified = true;
                                anyModified = true;
                            }
                        }
                    });

                    if (fileModified) {
                        localStorage.setItem(key, JSON.stringify(logs));
                        if (typeof syncWorkoutLogsToCloud === 'function') {
                            syncWorkoutLogsToCloud(logs, uid);
                        }
                    }
                }

                if (anyModified) {
                    console.log("🦾 7 Ekim 2026 Çarşamba seansına Dambıl Hammer Curl (3 set: 10kg, 10kg, 15kg) başarıyla eklendi.");
                    if (typeof renderHistory === 'function') renderHistory();
                    if (typeof renderMuscleAnalytics === 'function') {
                        const container = document.getElementById('muscleAnalyticsContainer');
                        if (container) renderMuscleAnalytics(container);
                    }
                }
            } catch (err) {
                console.warn("Hammer curl patch error:", err);
            }
        }

        // TARTI & ÖLÇÜM BULUT EŞİTLEME
        let scaleLogsLiveUnsub = null;

        async function syncUserScaleLogsFromCloud(uid) {
            if (!isFirebaseReady || !fbDb || !uid) return;
            try {
                const docRef = fbDb.collection('scale_logs').doc(uid);
                const doc = await docRef.get();
                const localLogs = getScaleLogs();

                if (doc.exists) {
                    const data = doc.data();
                    adoptCloudSyncSealIfPresent('scale_logs', uid, data);
                    if (data && Array.isArray(data.logs)) {
                        const logMap = new Map();
                        localLogs.forEach(l => logMap.set(l.id, l));
                        data.logs.forEach(l => logMap.set(l.id, l));
                        const merged = Array.from(logMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
                        localStorage.setItem(`celik_kodu_scale_${uid}`, JSON.stringify(merged));
                        return;
                    }
                }
                if (!IS_LOCAL_DEV && localLogs.length > 0) {
                    await writeAthleteDocWithSealHeal('scale_logs', uid, (seal) => ({
                        logs: localLogs,
                        clientUpdatedAt: Date.now(),
                        syncSeal: seal,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }));
                }
            } catch(e) {}
        }

        async function syncScaleLogsToCloud(logs, uid) {
            if (IS_LOCAL_DEV) return;
            if (!isFirebaseReady || !fbDb || !uid) return;
            try {
                await writeAthleteDocWithSealHeal('scale_logs', uid, (seal) => ({
                    logs: logs,
                    clientUpdatedAt: Date.now(),
                    syncSeal: seal,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }));
            } catch(e) {}
        }

        async function syncUserMeasurementsFromCloud(uid) {
            if (!isFirebaseReady || !fbDb || !uid) return;
            try {
                const docRef = fbDb.collection('measurement_logs').doc(uid);
                const doc = await docRef.get();
                const localLogs = getMeasurementsLogs();

                if (doc.exists) {
                    const data = doc.data();
                    adoptCloudSyncSealIfPresent('measurement_logs', uid, data);
                    if (data && Array.isArray(data.logs)) {
                        const logMap = new Map();
                        localLogs.forEach(l => logMap.set(l.id, l));
                        data.logs.forEach(l => logMap.set(l.id, l));
                        const merged = Array.from(logMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
                        localStorage.setItem(`celik_kodu_measurements_${uid}`, JSON.stringify(merged));
                        return;
                    }
                }
                if (!IS_LOCAL_DEV && localLogs.length > 0) {
                    await writeAthleteDocWithSealHeal('measurement_logs', uid, (seal) => ({
                        logs: localLogs,
                        clientUpdatedAt: Date.now(),
                        syncSeal: seal,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }));
                }
            } catch(e) {}
        }

        async function syncMeasurementLogsToCloud(logs, uid) {
            if (IS_LOCAL_DEV) return;
            if (!isFirebaseReady || !fbDb || !uid) return;
            try {
                await writeAthleteDocWithSealHeal('measurement_logs', uid, (seal) => ({
                    logs: logs,
                    clientUpdatedAt: Date.now(),
                    syncSeal: seal,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }));
            } catch(e) {}
        }

        // ==================== KULLANICI DURUMU (TAKVİM, AI KOÇ, AĞIRLIK HAFIZASI, GİZLİ HAREKETLER) BULUT SENKRONU ====================
        let userStateSyncTimer = null;

        function scheduleUserStateCloudSync(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid) return;
            markLocalUserStateModified(uid);
            if (IS_LOCAL_DEV) return;
            if (userStateSyncTimer) clearTimeout(userStateSyncTimer);
            userStateSyncTimer = setTimeout(() => {
                syncUserStateToCloud(uid);
            }, 900);
        }
        window.scheduleUserStateCloudSync = scheduleUserStateCloudSync;

        const CLOUD_SECRET_KEY_SET = new Set([
            'password', 'passwordhash', 'salt', 'geminiapikey', 'apikey',
            'tredicttoken', 'intervalstoken', 'gcaltoken', 'accesstoken', 'refreshtoken'
        ]);
        const CLOUD_SECRET_KEY_RE = /(password|passwd|pwd|(^|[_-])salt($|[_-])|api[_-]?key|gemini.*key|openai.*key|client[_-]?secret|private[_-]?key|access[_-]?token|refresh[_-]?token|tredict[_-]?token|intervals[_-]?token|gcal[_-]?token)/i;
        const CLOUD_SECRET_VAL_RE = /^(AIza[0-9A-Za-z_-]{16,}|sk-[0-9A-Za-z_-]{16,})$/;
        const PROTO_POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

        function stripWatchBridgeSecretsFromObj(val, depth = 0) {
            if (val === undefined) return undefined;
            if (!val || typeof val !== 'object') return val;
            const proto = Object.getPrototypeOf(val);
            const isCrossRealmPlain = Boolean(
                proto &&
                Object.getPrototypeOf(proto) === null &&
                proto.constructor &&
                proto.constructor.name === 'Object'
            );
            const isPlain = proto === Object.prototype || proto === null || isCrossRealmPlain;
            if (
                val instanceof Date ||
                Object.prototype.toString.call(val) === '[object Date]' ||
                typeof val._methodName === 'string' ||
                typeof val.toDate === 'function' ||
                (!Array.isArray(val) && !isPlain)
            ) {
                return val;
            }
            if (depth > 12) return Array.isArray(val) ? [] : {};
            if (Array.isArray(val)) {
                const out = [];
                for (let i = 0; i < val.length; i++) {
                    const item = stripWatchBridgeSecretsFromObj(val[i], depth + 1);
                    if (item !== undefined) out.push(item);
                }
                return out;
            }
            const clean = {};
            for (const [k, v] of Object.entries(val)) {
                if (PROTO_POLLUTION_KEYS.has(k)) continue;
                const kStr = String(k);
                if (CLOUD_SECRET_KEY_SET.has(kStr.toLowerCase()) || CLOUD_SECRET_KEY_RE.test(kStr)) continue;
                if (typeof v === 'string' && CLOUD_SECRET_VAL_RE.test(v.trim())) continue;
                if (v === undefined) continue;
                const cleanedVal = stripWatchBridgeSecretsFromObj(v, depth + 1);
                if (cleanedVal !== undefined) clean[k] = cleanedVal;
            }
            return clean;
        }

        function getJsonByteSize(val) {
            try {
                const s = JSON.stringify(val);
                if (typeof s !== 'string') return 0;
                if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
                return s.length * 2;
            } catch (e) {
                return Infinity;
            }
        }

        function sanitizeExcludedExerciseIds(raw) {
            if (!Array.isArray(raw)) return [];
            const seen = new Set();
            const out = [];
            for (let i = 0; i < raw.length && out.length < 500; i++) {
                if (typeof raw[i] !== 'string') continue;
                const cleanId = raw[i].trim();
                if (!cleanId || cleanId.length > 120 || PROTO_POLLUTION_KEYS.has(cleanId)) continue;
                if (seen.has(cleanId)) continue;
                seen.add(cleanId);
                out.push(cleanId);
            }
            return out;
        }

        function sanitizeDeletedProgramIds(raw) {
            if (!Array.isArray(raw)) return [];
            const seen = new Set();
            const out = [];
            for (let i = 0; i < raw.length && out.length < 300; i++) {
                if (typeof raw[i] !== 'string') continue;
                const cleanId = raw[i].trim();
                if (!cleanId || cleanId.length > 120 || PROTO_POLLUTION_KEYS.has(cleanId)) continue;
                if (seen.has(cleanId)) continue;
                seen.add(cleanId);
                out.push(cleanId);
            }
            return out;
        }

        function sanitizeCustomProgramEntry(raw) {
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
            const cleaned = stripWatchBridgeSecretsFromObj(raw, 0);
            if (!cleaned || typeof cleaned !== 'object' || Array.isArray(cleaned)) return null;
            const rawId = typeof cleaned.id === 'string' ? cleaned.id.trim() : '';
            if (!rawId || rawId.length > 120 || PROTO_POLLUTION_KEYS.has(rawId)) return null;
            if (!Array.isArray(cleaned.exercises)) return null;

            const safeExercises = [];
            for (let i = 0; i < cleaned.exercises.length && safeExercises.length < 80; i++) {
                const ex = cleaned.exercises[i];
                if (!ex || typeof ex !== 'object' || Array.isArray(ex)) continue;
                safeExercises.push(ex);
            }

            const rawTitle = typeof cleaned.title === 'string' ? cleaned.title.trim() : '';
            const updatedAtNum = Number(cleaned.updatedAt);
            const entry = {
                ...cleaned,
                id: rawId,
                title: (rawTitle || 'Kayıtlı Program').slice(0, 160),
                exercises: safeExercises,
                updatedAt: (Number.isFinite(updatedAtNum) && updatedAtNum > 0) ? updatedAtNum : 0
            };
            if (getJsonByteSize(entry) > 128000) return null;
            return entry;
        }

        function sanitizeCustomProgramsList(raw) {
            if (!Array.isArray(raw)) return [];
            const byId = new Map();
            const order = [];
            for (let i = 0; i < raw.length; i++) {
                const entry = sanitizeCustomProgramEntry(raw[i]);
                if (!entry) continue;
                if (!byId.has(entry.id)) {
                    order.push(entry.id);
                    byId.set(entry.id, entry);
                } else {
                    const existing = byId.get(entry.id);
                    if ((entry.updatedAt || 0) > (existing.updatedAt || 0)) {
                        byId.set(entry.id, entry);
                    }
                }
            }
            const out = [];
            let totalBytes = 2;
            for (let i = 0; i < order.length && out.length < 200; i++) {
                const entry = byId.get(order[i]);
                const itemBytes = getJsonByteSize(entry) + 1;
                if (totalBytes + itemBytes > 512000) break;
                totalBytes += itemBytes;
                out.push(entry);
            }
            return out;
        }

        function sanitizeMobilityTestsPayload(raw) {
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { history: [], updatedAt: 0 };
            const cleaned = stripWatchBridgeSecretsFromObj(raw, 0);
            if (!cleaned || typeof cleaned !== 'object' || Array.isArray(cleaned)) return { history: [], updatedAt: 0 };

            const safeHistory = [];
            if (Array.isArray(cleaned.history)) {
                for (let i = 0; i < cleaned.history.length && safeHistory.length < 200; i++) {
                    const h = cleaned.history[i];
                    if (!h || typeof h !== 'object' || Array.isArray(h)) continue;
                    const ts = Number(h.timestamp);
                    const dateStr = typeof h.date === 'string' ? h.date.trim().slice(0, 32) : '';
                    const safeLevels = {};
                    if (h.levels && typeof h.levels === 'object' && !Array.isArray(h.levels)) {
                        let keyCount = 0;
                        for (const [lk, lv] of Object.entries(h.levels)) {
                            if (keyCount >= 40) break;
                            if (PROTO_POLLUTION_KEYS.has(lk) || lk.length > 80) continue;
                            if (typeof lv === 'number' && Number.isFinite(lv)) {
                                safeLevels[lk] = lv;
                                keyCount++;
                            } else if (typeof lv === 'string') {
                                safeLevels[lk] = lv.slice(0, 80);
                                keyCount++;
                            }
                        }
                    }
                    safeHistory.push({
                        date: dateStr,
                        timestamp: (Number.isFinite(ts) && ts >= 0) ? ts : 0,
                        levels: safeLevels
                    });
                }
            }

            const updatedAtNum = Number(cleaned.updatedAt);
            const result = {
                history: safeHistory,
                updatedAt: (Number.isFinite(updatedAtNum) && updatedAtNum >= 0) ? updatedAtNum : 0
            };
            if (getJsonByteSize(result) > 65536) {
                result.history = safeHistory.slice(-50);
            }
            return result;
        }

        function getDeletedCustomProgramIds(uid) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!targetUid) return [];
            try {
                const raw = localStorage.getItem(`celik_kodu_deleted_programs_${targetUid}`);
                if (!raw) return [];
                return sanitizeDeletedProgramIds(JSON.parse(raw));
            } catch (e) {
                return [];
            }
        }

        function saveDeletedCustomProgramIds(ids, uid) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!targetUid) return [];
            const cleanIds = sanitizeDeletedProgramIds(ids);
            try {
                localStorage.setItem(`celik_kodu_deleted_programs_${targetUid}`, JSON.stringify(cleanIds));
            } catch (e) {}
            return cleanIds;
        }

        function getUserCustomPrograms(uid) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!targetUid) return [];
            try {
                const raw = localStorage.getItem(`celik_kodu_custom_programs_${targetUid}`);
                if (!raw) return [];
                const deletedSet = new Set(getDeletedCustomProgramIds(targetUid));
                return sanitizeCustomProgramsList(JSON.parse(raw)).filter(p => !deletedSet.has(p.id));
            } catch (e) {
                return [];
            }
        }

        function saveUserCustomPrograms(arr, uid, options = {}) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!targetUid) return [];
            const deletedSet = options.skipDeletedFilter ? new Set() : new Set(getDeletedCustomProgramIds(targetUid));
            const cleanList = sanitizeCustomProgramsList(arr).filter(p => !deletedSet.has(p.id));
            try {
                localStorage.setItem(`celik_kodu_custom_programs_${targetUid}`, JSON.stringify(cleanList));
            } catch (e) {}

            if (!options.skipAthleteSync && typeof getAuthUsers === 'function') {
                try {
                    const users = getAuthUsers();
                    const userObj = Array.isArray(users) ? users.find(u => u && u.id === targetUid) : null;
                    if (userObj) {
                        userObj.savedWorkouts = cleanList.slice(0, 50);
                        if (options.fromCloud) {
                            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
                        } else if (typeof saveAuthUsers === 'function') {
                            saveAuthUsers(users);
                        } else {
                            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
                        }
                    }
                } catch (e) {}
            }

            if (!options.skipCloudSync && !options.fromCloud && typeof window.scheduleUserStateCloudSync === 'function') {
                window.scheduleUserStateCloudSync(targetUid);
            }
            return cleanList;
        }

        function upsertUserCustomProgram(progObj, uid, options = {}) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!targetUid || !progObj || typeof progObj !== 'object') return null;
            const prepared = { ...progObj };
            if (!options.preserveUpdatedAt) {
                prepared.updatedAt = Date.now();
            }
            const cleanEntry = sanitizeCustomProgramEntry(prepared);
            if (!cleanEntry) return null;

            const deletedIds = getDeletedCustomProgramIds(targetUid).filter(id => id !== cleanEntry.id);
            saveDeletedCustomProgramIds(deletedIds, targetUid);

            const current = getUserCustomPrograms(targetUid).filter(p => p.id !== cleanEntry.id);
            current.unshift(cleanEntry);
            saveUserCustomPrograms(current, targetUid, options);
            return cleanEntry;
        }

        function removeUserCustomProgram(progId, uid, options = {}) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!targetUid || typeof progId !== 'string' || !progId.trim()) return [];
            const cleanId = progId.trim();
            const deletedIds = getDeletedCustomProgramIds(targetUid).filter(id => id !== cleanId);
            deletedIds.unshift(cleanId);
            saveDeletedCustomProgramIds(deletedIds.slice(0, 300), targetUid);

            const current = getUserCustomPrograms(targetUid).filter(p => p.id !== cleanId);
            return saveUserCustomPrograms(current, targetUid, options);
        }

        function getLastGeneratedWorkoutStorageKey(uid) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            return targetUid ? `celik_kodu_last_generated_workout_${targetUid}` : 'celik_kodu_last_generated_workout';
        }

        function persistLastGeneratedWorkout(workout, uid, options = {}) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            const activeUid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
            if (!targetUid) return null;
            const scopedKey = getLastGeneratedWorkoutStorageKey(targetUid);

            if (!workout || typeof workout !== 'object') {
                if (options.clearIfNull) {
                    try {
                        localStorage.removeItem(scopedKey);
                        if (targetUid === activeUid) localStorage.removeItem('celik_kodu_last_generated_workout');
                    } catch (e) {}
                    if (!options.skipCloudSync && !options.fromCloud && typeof window.scheduleUserStateCloudSync === 'function') {
                        window.scheduleUserStateCloudSync(targetUid);
                    }
                }
                return null;
            }

            const customsWorkout = (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.sanitizeGeneratedWorkoutPayload === 'function')
                ? window.CelikBridgeCustoms.sanitizeGeneratedWorkoutPayload(workout)
                : workout;
            if (!customsWorkout) return null;

            const liaisonWorkout = (window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.inspectGeneratedWorkoutForReceivers === 'function')
                ? window.CelikLiaisonSubChiefs.inspectGeneratedWorkoutForReceivers(customsWorkout)
                : customsWorkout;

            const cleaned = stripWatchBridgeSecretsFromObj(liaisonWorkout, 0);
            if (!cleaned || typeof cleaned !== 'object' || Array.isArray(cleaned)) return null;
            cleaned.userId = targetUid;
            const existingTs = Number(cleaned.updatedAt);
            cleaned.updatedAt = (!options.preserveUpdatedAt && !options.fromCloud)
                ? Date.now()
                : ((Number.isFinite(existingTs) && existingTs > 0) ? existingTs : Date.now());
            if (getJsonByteSize(cleaned) > 256000) return null;

            try {
                const serialized = JSON.stringify(cleaned);
                localStorage.setItem(scopedKey, serialized);
                if (targetUid === activeUid) {
                    localStorage.setItem('celik_kodu_last_generated_workout', serialized);
                }
            } catch (e) {}

            if (!options.skipCloudSync && !options.fromCloud && typeof window.scheduleUserStateCloudSync === 'function') {
                window.scheduleUserStateCloudSync(targetUid);
            }
            return cleaned;
        }

        function readActiveLastGeneratedWorkout(uid) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            const parseValid = (raw) => {
                if (!raw) return null;
                try {
                    const obj = JSON.parse(raw);
                    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
                    if (obj.userId && targetUid && obj.userId !== targetUid) return null;
                    if (obj.userId && !targetUid) return null;
                    return obj;
                } catch (e) {
                    return null;
                }
            };
            if (targetUid) {
                const scoped = parseValid(localStorage.getItem(getLastGeneratedWorkoutStorageKey(targetUid)));
                if (scoped) return scoped;
            }
            return parseValid(localStorage.getItem('celik_kodu_last_generated_workout'));
        }

        function scheduleHasActiveWorkoutContent(sched) {
            if (!sched || typeof sched !== 'object') return false;
            return [0, 1, 2, 3, 4, 5, 6].some(d => {
                const s = sched[d];
                if (!s || typeof s !== 'object') return false;
                if (!s.rest) {
                    if (Array.isArray(s.exercises) && s.exercises.length > 0) return true;
                    if (s.customWorkout && Array.isArray(s.customWorkout.exercises) && s.customWorkout.exercises.length > 0) return true;
                    if (s.program) return true;
                }
                return Array.isArray(s.extraCardioSessions) && s.extraCardioSessions.length > 0;
            });
        }

        function scheduleSlotHasContent(slot) {
            if (!slot || typeof slot !== 'object') return false;
            if (!slot.rest) {
                if (Array.isArray(slot.exercises) && slot.exercises.length > 0) return true;
                if (slot.customWorkout && Array.isArray(slot.customWorkout.exercises) && slot.customWorkout.exercises.length > 0) return true;
                if (slot.program) return true;
            }
            return Array.isArray(slot.extraCardioSessions) && slot.extraCardioSessions.length > 0;
        }

        function mergeWeeklyScheduleSafely(storageKey, cloudSched, cloudUpdatedAt, localUpdatedAt, isPendingLocal) {
            if (!cloudSched || typeof cloudSched !== 'object' || Object.keys(cloudSched).length === 0) return;
            let localSched = null;
            try {
                const raw = localStorage.getItem(storageKey);
                if (raw) localSched = JSON.parse(raw);
            } catch {}

            if (!localSched || Object.keys(localSched).length === 0 || !scheduleHasActiveWorkoutContent(localSched)) {
                localStorage.setItem(storageKey, JSON.stringify(cloudSched));
                return;
            }

            const merged = Object.assign({}, cloudSched);
            const preferLocalByDefault = Boolean(isPendingLocal || localUpdatedAt > cloudUpdatedAt);
            [0, 1, 2, 3, 4, 5, 6].forEach(d => {
                const lSlot = localSched[d];
                const cSlot = cloudSched[d];
                if (!lSlot) return;
                const lTs = Number(lSlot.updatedAt || localUpdatedAt || 0);
                const cTs = Number((cSlot && cSlot.updatedAt) || cloudUpdatedAt || 0);

                if (preferLocalByDefault) {
                    if (cSlot && Number(cSlot.updatedAt || 0) > Math.max(lTs, localUpdatedAt)) {
                        merged[d] = cSlot;
                    } else {
                        merged[d] = lSlot;
                    }
                    return;
                }

                // Bulut genel olarak yeni görünse bile yereldeki saat damgalı aktif günü eski bir "rest: true" günle ezme
                if (scheduleSlotHasContent(lSlot) && (!cSlot || cSlot.rest) && lTs > cTs) {
                    merged[d] = lSlot;
                }
            });
            localStorage.setItem(storageKey, JSON.stringify(merged));
        }

        async function syncUserStateToCloud(targetUid) {
            if (IS_LOCAL_DEV) return;
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid) return;
            if (!isFirebaseReady || !fbDb || navigator.onLine === false) {
                try { localStorage.setItem(`celik_kodu_pending_state_sync_${uid}`, '1'); } catch {}
                return;
            }
            try {
                const safeParse = (k, fallback) => {
                    try {
                        const r = localStorage.getItem(k);
                        return r ? JSON.parse(r) : fallback;
                    } catch { return fallback; }
                };
                const activeUid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                let lastGenVal = safeParse(`celik_kodu_last_generated_workout_${uid}`, null);
                if (!lastGenVal && activeUid === uid) {
                    const activeGen = safeParse('celik_kodu_last_generated_workout', null);
                    if (activeGen && (!activeGen.userId || activeGen.userId === uid)) {
                        lastGenVal = activeGen;
                    }
                }
                const cleanLastGen = lastGenVal ? stripWatchBridgeSecretsFromObj(lastGenVal, 0) : null;
                const safeLastGen = (
                    cleanLastGen &&
                    typeof cleanLastGen === 'object' &&
                    !Array.isArray(cleanLastGen) &&
                    Object.keys(cleanLastGen).length <= 100 &&
                    getJsonByteSize(cleanLastGen) <= 256000
                ) ? cleanLastGen : null;

                const safeExclIds = sanitizeExcludedExerciseIds(safeParse(getExcludedExercisesStorageKey(uid), []));
                const exclUpdatedAt = typeof getExcludedExercisesUpdatedAt === 'function'
                    ? getExcludedExercisesUpdatedAt(uid)
                    : 0;
                const safeCustomPrograms = typeof getUserCustomPrograms === 'function'
                    ? getUserCustomPrograms(uid)
                    : [];
                const safeDeletedIds = typeof getDeletedCustomProgramIds === 'function'
                    ? getDeletedCustomProgramIds(uid)
                    : [];
                const safeMobilityTests = sanitizeMobilityTestsPayload(
                    safeParse(`celik_kodu_mobility_tests_${uid}`, { history: [], updatedAt: 0 })
                );

                const manifestsMerged = Object.assign(
                    {},
                    safeParse(`celik_kodu_garmin_sent_manifests_v1__${uid}`, {}),
                    safeParse(`celik_garmin_sent_manifests_v1_${uid}`, {})
                );
                const clientUpdatedAt = Number(localStorage.getItem(`celik_kodu_state_updated_at_${uid}`) || Date.now());
                await writeAthleteDocWithSealHeal('user_state', uid, (seal) => stripWatchBridgeSecretsFromObj({
                    weeklySchedule: safeParse(`celik_kodu_weekly_schedule_${uid}`, {}),
                    nextWeeklySchedule: safeParse(`celik_kodu_next_weekly_schedule_${uid}`, {}),
                    dateSchedule: safeParse(`celik_kodu_date_schedule_${uid}`, {}),
                    rememberedWeights: safeParse(`celik_kodu_last_weights_${uid}`, {}),
                    excludedExercises: safeExclIds,
                    excludedExercisesUpdatedAt: exclUpdatedAt,
                    customPrograms: safeCustomPrograms,
                    deletedCustomProgramIds: safeDeletedIds,
                    mobilityTests: safeMobilityTests,
                    selectedEquipments: Array.isArray(selectedEquipments) ? selectedEquipments : [],
                    customGyms: safeParse(`celik_kodu_custom_gyms_${uid}`, []),
                    aiDoctrine: String(currentSelectedDoctrine || 'bb_hybrid'),
                    aiCoachSummary: safeParse(`celik_kodu_ai_program_${uid}`, null),
                    lastGeneratedWorkout: safeLastGen,
                    activeWorkoutDraft: safeParse(`celik_kodu_active_state_${uid}`, null),
                    garminManifests: manifestsMerged,
                    clientUpdatedAt,
                    syncSeal: seal,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }));
                localStorage.removeItem(`celik_kodu_pending_state_sync_${uid}`);
            } catch (err) {
                try { localStorage.setItem(`celik_kodu_pending_state_sync_${uid}`, '1'); } catch {}
                console.warn("Kullanıcı durumu çevrimdışı kuyruğa alındı:", err);
            }
        }
        window.syncUserStateToCloud = syncUserStateToCloud;

        async function syncUserStateFromCloud(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!isFirebaseReady || !fbDb || !uid) return;
            try {
                const docRef = fbDb.collection('user_state').doc(uid);
                const doc = await docRef.get();
                if (!doc.exists) {
                    if (!IS_LOCAL_DEV) await syncUserStateToCloud(uid);
                    return;
                }
                const data = doc.data() || {};
                adoptCloudSyncSealIfPresent('user_state', uid, data);
                const cloudUpdatedAt = Number(data.clientUpdatedAt || 0);
                const localUpdatedAt = Number(localStorage.getItem(`celik_kodu_state_updated_at_${uid}`) || 0);
                const hasPendingLocalState = localStorage.getItem(`celik_kodu_pending_state_sync_${uid}`) === '1';
                const isCloudNewerOrEqual = !hasPendingLocalState && cloudUpdatedAt >= localUpdatedAt;
                const activeUid = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
                let hasUnsyncedLocalDiff = false;

                const safeParseCloud = (k, fallback) => {
                    try {
                        const r = localStorage.getItem(k);
                        return r ? JSON.parse(r) : fallback;
                    } catch { return fallback; }
                };
                const parseCloudTimestamp = (val) => {
                    if (val == null) return 0;
                    if (typeof val === 'number') return (Number.isFinite(val) && val > 0) ? val : 0;
                    if (typeof val.toMillis === 'function') {
                        const ms = val.toMillis();
                        return (Number.isFinite(ms) && ms > 0) ? ms : 0;
                    }
                    if (typeof val === 'string') {
                        const num = Number(val);
                        if (Number.isFinite(num) && num > 0) return num;
                        const ms = Date.parse(val);
                        return (Number.isFinite(ms) && ms > 0) ? ms : 0;
                    }
                    return 0;
                };

                mergeWeeklyScheduleSafely(`celik_kodu_weekly_schedule_${uid}`, data.weeklySchedule, cloudUpdatedAt, localUpdatedAt, hasPendingLocalState);
                mergeWeeklyScheduleSafely(`celik_kodu_next_weekly_schedule_${uid}`, data.nextWeeklySchedule, cloudUpdatedAt, localUpdatedAt, hasPendingLocalState);

                if (data.dateSchedule && typeof data.dateSchedule === 'object') {
                    const localDateSched = JSON.parse(localStorage.getItem(`celik_kodu_date_schedule_${uid}`) || '{}') || {};
                    const mergedDateSched = Object.assign({}, data.dateSchedule, localDateSched);
                    for (const [dt, entry] of Object.entries(data.dateSchedule)) {
                        const locEntry = localDateSched[dt];
                        const entryTs = Number(entry?.updatedAt || cloudUpdatedAt || 0);
                        const locTs = Number(locEntry?.updatedAt || localUpdatedAt || 0);
                        if (!locEntry || (!hasPendingLocalState && entryTs >= locTs)) {
                            mergedDateSched[dt] = entry;
                        }
                    }
                    localStorage.setItem(`celik_kodu_date_schedule_${uid}`, JSON.stringify(mergedDateSched));
                }
                if (data.rememberedWeights && typeof data.rememberedWeights === 'object') {
                    const localW = JSON.parse(localStorage.getItem(`celik_kodu_last_weights_${uid}`) || '{}') || {};
                    const mergedW = isCloudNewerOrEqual
                        ? Object.assign({}, localW, data.rememberedWeights)
                        : Object.assign({}, data.rememberedWeights, localW);
                    localStorage.setItem(`celik_kodu_last_weights_${uid}`, JSON.stringify(mergedW));
                }

                // Merge custom program deletion tombstones + custom programs
                const localDeletedIds = getDeletedCustomProgramIds(uid);
                const cloudDeletedIds = Array.isArray(data.deletedCustomProgramIds)
                    ? sanitizeDeletedProgramIds(data.deletedCustomProgramIds)
                    : [];
                const cloudDeletedSet = new Set(cloudDeletedIds);
                const mergedDeletedIds = sanitizeDeletedProgramIds([...cloudDeletedIds, ...localDeletedIds]);
                saveDeletedCustomProgramIds(mergedDeletedIds, uid);
                const deletedSet = new Set(mergedDeletedIds);

                const localProgs = sanitizeCustomProgramsList(safeParseCloud(`celik_kodu_custom_programs_${uid}`, []));
                const cloudProgs = Array.isArray(data.customPrograms) ? sanitizeCustomProgramsList(data.customPrograms) : [];
                if (localDeletedIds.some(id => !cloudDeletedSet.has(id))) hasUnsyncedLocalDiff = true;
                if (!hasUnsyncedLocalDiff && cloudProgs.some(p => p && p.id && deletedSet.has(p.id))) {
                    hasUnsyncedLocalDiff = true;
                }
                const mergedProgMap = new Map();
                cloudProgs.forEach(p => {
                    if (!p || !p.id || deletedSet.has(p.id)) return;
                    mergedProgMap.set(p.id, p);
                });
                localProgs.forEach(p => {
                    if (!p || !p.id || deletedSet.has(p.id)) return;
                    const existing = mergedProgMap.get(p.id);
                    if (!existing) {
                        mergedProgMap.set(p.id, p);
                        hasUnsyncedLocalDiff = true;
                    } else {
                        const lTs = Number(p.updatedAt || 0);
                        const cTs = Number(existing.updatedAt || 0);
                        if (lTs > cTs || (lTs === cTs && !isCloudNewerOrEqual)) {
                            mergedProgMap.set(p.id, p);
                            if (lTs > cTs) hasUnsyncedLocalDiff = true;
                        }
                    }
                });
                const mergedProgs = Array.from(mergedProgMap.values())
                    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
                saveUserCustomPrograms(mergedProgs, uid, { fromCloud: true, skipCloudSync: true });

                // Timestamp-authoritative excludedExercises merge (empty list [] propagates un-hide)
                const cloudExclTs = parseCloudTimestamp(data.excludedExercisesUpdatedAt);
                const localExclTs = getExcludedExercisesUpdatedAt(uid);
                const localExclArr = getUserExcludedExerciseIds(uid);
                if (Array.isArray(data.excludedExercises)) {
                    const cloudExclArr = sanitizeExcludedExerciseIds(data.excludedExercises);
                    if (cloudExclTs > 0 || localExclTs > 0) {
                        if (!hasPendingLocalState && cloudExclTs >= localExclTs) {
                            const localExclSet = new Set(localExclArr);
                            setUserExcludedExerciseIds(cloudExclArr, {
                                uid,
                                updatedAt: cloudExclTs,
                                fromCloud: true,
                                skipCloudSync: true
                            });
                            cloudExclArr.forEach(exId => {
                                if (!localExclSet.has(exId)) purgeExcludedExerciseFromSavedPlans(exId);
                            });
                        } else if (localExclTs > cloudExclTs || hasPendingLocalState) {
                            hasUnsyncedLocalDiff = true;
                        }
                    } else if (isCloudNewerOrEqual) {
                        const localExclSet = new Set(localExclArr);
                        setUserExcludedExerciseIds(cloudExclArr, {
                            uid,
                            updatedAt: 0,
                            fromCloud: true,
                            skipCloudSync: true
                        });
                        cloudExclArr.forEach(exId => {
                            if (!localExclSet.has(exId)) purgeExcludedExerciseFromSavedPlans(exId);
                        });
                    } else if (localExclArr.length > 0) {
                        hasUnsyncedLocalDiff = true;
                    }
                } else if (localExclTs > 0 || localExclArr.length > 0) {
                    hasUnsyncedLocalDiff = true;
                }

                // Merge mobilityTests by date keeping newer timestamp
                const localMobRaw = safeParseCloud(`celik_kodu_mobility_tests_${uid}`, null);
                const localMob = sanitizeMobilityTestsPayload(localMobRaw || { history: [], updatedAt: 0 });
                if (data.mobilityTests && typeof data.mobilityTests === 'object') {
                    const cloudMob = sanitizeMobilityTestsPayload(data.mobilityTests);
                    const byDate = new Map();
                    const addMobEntry = (entry) => {
                        if (!entry || typeof entry !== 'object') return;
                        const key = entry.date || String(entry.timestamp || '');
                        if (!key) return;
                        const prev = byDate.get(key);
                        if (!prev || Number(entry.timestamp || 0) > Number(prev.timestamp || 0)) {
                            byDate.set(key, entry);
                        } else if (Number(entry.timestamp || 0) === Number(prev.timestamp || 0)) {
                            byDate.set(key, {
                                date: prev.date || entry.date,
                                timestamp: Math.max(Number(prev.timestamp || 0), Number(entry.timestamp || 0)),
                                levels: Object.assign({}, entry.levels || {}, prev.levels || {})
                            });
                        }
                    };
                    cloudMob.history.forEach(addMobEntry);
                    localMob.history.forEach(addMobEntry);
                    const mergedHistory = Array.from(byDate.values())
                        .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0) || String(b.date || '').localeCompare(String(a.date || '')))
                        .slice(0, 200);
                    const mergedMob = sanitizeMobilityTestsPayload({
                        history: mergedHistory,
                        updatedAt: Math.max(Number(cloudMob.updatedAt || 0), Number(localMob.updatedAt || 0))
                    });
                    localStorage.setItem(`celik_kodu_mobility_tests_${uid}`, JSON.stringify(mergedMob));
                    if (Number(localMob.updatedAt || 0) > Number(cloudMob.updatedAt || 0) || mergedHistory.length > cloudMob.history.length) {
                        hasUnsyncedLocalDiff = true;
                    }
                } else if (localMob.history.length > 0) {
                    hasUnsyncedLocalDiff = true;
                }

                if (Array.isArray(data.customGyms) && data.customGyms.length > 0) {
                    const gymKey = `celik_kodu_custom_gyms_${uid}`;
                    const localGyms = JSON.parse(localStorage.getItem(gymKey) || '[]') || [];
                    const mergedGyms = Array.from(new Set([...data.customGyms, ...localGyms]));
                    localStorage.setItem(gymKey, JSON.stringify(mergedGyms));
                }
                if (data.aiCoachSummary && typeof data.aiCoachSummary === 'object' && isCloudNewerOrEqual) {
                    localStorage.setItem(`celik_kodu_ai_program_${uid}`, JSON.stringify(data.aiCoachSummary));
                }

                // Merge lastGeneratedWorkout with timestamp comparison and memory isolation
                const rawLocalGen = safeParseCloud(`celik_kodu_last_generated_workout_${uid}`, null)
                    || (activeUid === uid ? safeParseCloud('celik_kodu_last_generated_workout', null) : null);
                const localGenValid = (rawLocalGen && typeof rawLocalGen === 'object' && (!rawLocalGen.userId || rawLocalGen.userId === uid))
                    ? rawLocalGen
                    : null;
                if (data.lastGeneratedWorkout && typeof data.lastGeneratedWorkout === 'object') {
                    const cloudGenTs = Number(data.lastGeneratedWorkout.updatedAt || data.lastGeneratedWorkout.createdAt || cloudUpdatedAt || 0);
                    const localGenTs = Number(localGenValid?.updatedAt || localGenValid?.createdAt || localUpdatedAt || 0);
                    if (!localGenValid || (!hasPendingLocalState && cloudGenTs >= localGenTs)) {
                        const savedGen = persistLastGeneratedWorkout(data.lastGeneratedWorkout, uid, {
                            fromCloud: true,
                            skipCloudSync: true,
                            preserveUpdatedAt: true
                        });
                        if (activeUid === uid && savedGen && typeof currentGeneratedWorkout !== 'undefined') {
                            currentGeneratedWorkout = savedGen;
                            window.currentGeneratedWorkout = savedGen;
                        }
                    } else if (localGenValid && localGenTs > cloudGenTs) {
                        hasUnsyncedLocalDiff = true;
                    }
                } else if (localGenValid) {
                    hasUnsyncedLocalDiff = true;
                }

                if (data.activeWorkoutDraft && typeof data.activeWorkoutDraft === 'object' && !localStorage.getItem(`celik_kodu_active_state_${uid}`)) {
                    localStorage.setItem(`celik_kodu_active_state_${uid}`, JSON.stringify(data.activeWorkoutDraft));
                }
                if (data.garminManifests && typeof data.garminManifests === 'object') {
                    const mKey = `celik_garmin_sent_manifests_v1_${uid}`;
                    const localM = JSON.parse(localStorage.getItem(mKey) || '{}') || {};
                    localStorage.setItem(mKey, JSON.stringify(Object.assign({}, data.garminManifests, localM)));
                }
                if (!hasPendingLocalState && cloudUpdatedAt > localUpdatedAt && !hasUnsyncedLocalDiff) {
                    localStorage.setItem(`celik_kodu_state_updated_at_${uid}`, String(cloudUpdatedAt));
                } else if (!IS_LOCAL_DEV && (hasPendingLocalState || localUpdatedAt > cloudUpdatedAt || hasUnsyncedLocalDiff)) {
                    await syncUserStateToCloud(uid);
                }

                const savedScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                if (typeof renderAiHybridHeroBanner === 'function') renderAiHybridHeroBanner();
                if (typeof updateLibrarySubTabButtons === 'function') updateLibrarySubTabButtons();
                const isActiveTab = (tabId) => {
                    const el = typeof document !== 'undefined' ? document.getElementById(tabId) : null;
                    return !!(el && (el.classList.contains('active') || el.style.display === 'block'));
                };
                if (isActiveTab('libraryTab') && typeof renderLibrary === 'function') renderLibrary();
                if (isActiveTab('analyticsTab') && typeof renderAnalytics === 'function') renderAnalytics();
                if (isActiveTab('generatorTab') && typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && typeof renderGeneratedWorkout === 'function') {
                    renderGeneratedWorkout({ preserveScroll: true });
                }
                if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
                    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
                }
            } catch (err) {
                console.warn("Kullanıcı durumu buluttan çekilemedi:", err);
            }
        }
        window.syncUserStateFromCloud = syncUserStateFromCloud;


        // ==================== AUTHENTICATION & MULTI-USER SYSTEM ====================
        function generateSecureSalt() {
            try {
                if (window.crypto && window.crypto.getRandomValues) {
                    const arr = new Uint8Array(16);
                    window.crypto.getRandomValues(arr);
                    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
                }
            } catch(e) {}
            return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        }

        async function sha256Hex(message) {
            try {
                if (window.crypto && window.crypto.subtle) {
                    const msgBuffer = new TextEncoder().encode(message);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                }
            } catch(e) {}
            // Pure-JS SHA-256 fallback for HTTP LAN testing (http://192.168.x.x:8080 where crypto.subtle is unavailable)
            const K = [
                0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
            ];
            const rotr = (n, x) => (x >>> n) | (x << (32 - n));
            const bytes = Array.from(new TextEncoder().encode(message));
            const bitLen = bytes.length * 8;
            bytes.push(0x80);
            while ((bytes.length % 64) !== 56) bytes.push(0);
            const hi = Math.floor(bitLen / 0x100000000);
            const lo = bitLen >>> 0;
            for (let i = 3; i >= 0; i--) bytes.push((hi >>> (i * 8)) & 0xff);
            for (let i = 3; i >= 0; i--) bytes.push((lo >>> (i * 8)) & 0xff);

            let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
            const W = new Array(64);
            for (let i = 0; i < bytes.length; i += 64) {
                for (let t = 0; t < 16; t++) {
                    const j = i + t * 4;
                    W[t] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
                }
                for (let t = 16; t < 64; t++) {
                    const s0 = rotr(7, W[t - 15]) ^ rotr(18, W[t - 15]) ^ (W[t - 15] >>> 3);
                    const s1 = rotr(17, W[t - 2]) ^ rotr(19, W[t - 2]) ^ (W[t - 2] >>> 10);
                    W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
                }
                let [a, b, c, d, e, f, g, h] = H;
                for (let t = 0; t < 64; t++) {
                    const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
                    const ch = (e & f) ^ (~e & g);
                    const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
                    const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
                    const maj = (a & b) ^ (a & c) ^ (b & c);
                    const temp2 = (S0 + maj) >>> 0;
                    h = g; g = f; f = e; e = (d + temp1) >>> 0;
                    d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
                }
                H = [(H[0] + a) >>> 0, (H[1] + b) >>> 0, (H[2] + c) >>> 0, (H[3] + d) >>> 0, (H[4] + e) >>> 0, (H[5] + f) >>> 0, (H[6] + g) >>> 0, (H[7] + h) >>> 0];
            }
            return H.map(v => v.toString(16).padStart(8, '0')).join('');
        }

        function normalizeAuthString(str) {
            if (!str) return '';
            return String(str).trim().replace(/^@+/, '').toLocaleLowerCase('tr-TR').normalize('NFC');
        }

        const LOCAL_CRED_VAULT_STORAGE_KEY = 'celik_kodu_cred_vault_v2';
        const AUTH_RATE_LIMIT_STORAGE_KEY = 'celik_kodu_auth_ratelimit_v1';
        const KNOWN_WEAK_HASHES_GLOBAL = new Set([
            'a924925a37aaa6c8e9f3d54b4f00a30b1d7445611efb0ee3641b3c959e13fea7', // 123
            '03cde27561b94bc8b0f58721b21c3c5010435fd22dc6d202106c262c7e010bbc'  // 123456
        ]);

        function getLocalCredVault() {
            try {
                const raw = localStorage.getItem(LOCAL_CRED_VAULT_STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : {};
                return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
            } catch (e) {
                return {};
            }
        }

        function getLocalUserCred(uid) {
            if (!uid) return null;
            const vault = getLocalCredVault();
            return vault[uid] || null;
        }

        function setLocalUserCred(uid, credObj) {
            if (!uid || !credObj || !credObj.passwordHash || !credObj.salt) return;
            try {
                const vault = getLocalCredVault();
                vault[uid] = {
                    salt: String(credObj.salt),
                    passwordHash: String(credObj.passwordHash),
                    passwordStrengthLevel: credObj.passwordStrengthLevel || 'Güçlü',
                    mustChangePassword: Boolean(credObj.mustChangePassword),
                    passwordUpdatedAt: Number(credObj.passwordUpdatedAt) || Date.now()
                };
                localStorage.setItem(LOCAL_CRED_VAULT_STORAGE_KEY, JSON.stringify(vault));
            } catch (e) {}
        }

        function getCanonicalFbAuthEmail(user) {
            if (!user) return '';
            if (user.id === 'usr_admin') {
                return String(user.fbAuthEmail || user.email || 'feritkantarci@gmail.com').trim().toLowerCase();
            }
            const raw = user.fbAuthEmail || user.email || (user.id ? `${user.id}@auth.celikkodu.app` : '');
            return String(raw).trim().toLowerCase();
        }

        function clearAuthInlineError() {
            const errBox = document.getElementById('loginErrorMsg');
            if (errBox && errBox.style.display !== 'none') {
                errBox.style.display = 'none';
            }
        }
        window.clearAuthInlineError = clearAuthInlineError;

        function togglePasswordFieldVisibility(inputId, btnEl) {
            const input = document.getElementById(inputId);
            if (!input) return;
            const makeVisible = input.type === 'password';
            input.type = makeVisible ? 'text' : 'password';
            if (btnEl) {
                btnEl.setAttribute('aria-pressed', makeVisible ? 'true' : 'false');
                btnEl.setAttribute('aria-label', makeVisible ? 'Şifreyi gizle' : 'Şifreyi göster');
                btnEl.textContent = makeVisible ? 'Gizle' : 'Göster';
            }
        }
        window.togglePasswordFieldVisibility = togglePasswordFieldVisibility;

        function getRemainingAuthLockoutSeconds(identKey) {
            if (!identKey) return 0;
            try {
                const map = JSON.parse(localStorage.getItem(AUTH_RATE_LIMIT_STORAGE_KEY) || '{}');
                const entry = map[identKey];
                if (!entry || !entry.lockedUntil) return 0;
                const rem = Math.ceil((entry.lockedUntil - Date.now()) / 1000);
                return rem > 0 ? rem : 0;
            } catch (e) {
                return 0;
            }
        }

        function recordAuthFailure(identKey) {
            if (!identKey) return 0;
            try {
                const map = JSON.parse(localStorage.getItem(AUTH_RATE_LIMIT_STORAGE_KEY) || '{}');
                const now = Date.now();
                const prev = map[identKey] || { count: 0, firstAt: now, lockedUntil: 0 };
                if (now - (prev.firstAt || 0) > 10 * 60 * 1000) {
                    prev.count = 0;
                    prev.firstAt = now;
                }
                prev.count = (prev.count || 0) + 1;
                if (prev.count >= 5) {
                    const penaltySec = Math.min(120, 30 * (prev.count - 4));
                    prev.lockedUntil = now + penaltySec * 1000;
                }
                map[identKey] = prev;
                localStorage.setItem(AUTH_RATE_LIMIT_STORAGE_KEY, JSON.stringify(map));
                return prev.lockedUntil > now ? Math.ceil((prev.lockedUntil - now) / 1000) : 0;
            } catch (e) {
                return 0;
            }
        }

        function clearAuthFailures(identKey) {
            if (!identKey) return;
            try {
                const map = JSON.parse(localStorage.getItem(AUTH_RATE_LIMIT_STORAGE_KEY) || '{}');
                if (map[identKey]) {
                    delete map[identKey];
                    localStorage.setItem(AUTH_RATE_LIMIT_STORAGE_KEY, JSON.stringify(map));
                }
            } catch (e) {}
        }

        function initAuthDatabase() {
            let users = [];
            try {
                const raw = localStorage.getItem('celik_kodu_auth_users');
                if (raw) users = JSON.parse(raw);
            } catch(e) {}

            if (!Array.isArray(users) || users.length === 0) {
                users = [
                    {
                        id: 'usr_admin',
                        username: 'admin',
                        aliases: ['ferit', 'admin'],
                        email: 'feritkantarci@gmail.com',
                        fbAuthEmail: 'feritkantarci@gmail.com',
                        role: 'admin',
                        status: 'approved',
                        passwordStrengthLevel: 'Çok Güçlü',
                        mustChangePassword: false,
                        name: 'Ferit KANTARCI',
                        avatar: '🥋',
                        theme: 'gold',
                        level: 'İleri Seviye',
                        gender: 'Erkek',
                        weights: { press: '16', squat: '22', row: '20', rdl: '24', swing: '18', lunge: '14' },
                        createdAt: Date.now()
                    },
                    {
                        id: 'usr_ismail',
                        username: 'ismail',
                        fbAuthEmail: 'usr_ismail@auth.celikkodu.app',
                        role: 'athlete',
                        status: 'approved',
                        mustChangePassword: true,
                        name: 'İsmail',
                        avatar: '🦁',
                        theme: 'cyan',
                        level: 'Orta Seviye',
                        gender: 'Erkek',
                        weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
                        createdAt: Date.now()
                    }
                ];
                localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
            } else {
                let hasChanged = false;
                // Otomatik temizleme: Eski mükerrer usr_ferit veya eski sinan kopyasını temizle
                if (users.some(u => u && (u.id === 'usr_ferit' || u.id === 'usr_1792524620913'))) {
                    users = users.filter(u => u && u.id !== 'usr_ferit' && u.id !== 'usr_1792524620913');
                    const adminUser = users.find(u => u.id === 'usr_admin');
                    if (adminUser) {
                        adminUser.aliases = ['ferit', 'admin'];
                    }
                    hasChanged = true;
                }

                // Otomatik temizleme: Aynı kullanıcı adıyla mükerrer kayıt varsa en güncel olanı koru
                const byUname = new Map();
                const dedupedUsers = [];
                users.forEach(u => {
                    if (!u) return;
                    const unameKey = normalizeAuthString(u.username || u.name || u.id);
                    if (!unameKey) {
                        dedupedUsers.push(u);
                        return;
                    }
                    const prevIdx = byUname.get(unameKey);
                    if (prevIdx === undefined) {
                        byUname.set(unameKey, dedupedUsers.length);
                        dedupedUsers.push(u);
                    } else {
                        const prev = dedupedUsers[prevIdx];
                        const curTime = Number(u.updatedAt || u.createdAt || 0);
                        const prevTime = Number(prev.updatedAt || prev.createdAt || 0);
                        if (curTime >= prevTime) {
                            dedupedUsers[prevIdx] = Object.assign({}, prev, u);
                        }
                        hasChanged = true;
                    }
                });
                if (dedupedUsers.length !== users.length) {
                    users = dedupedUsers;
                }

                users.forEach(u => {
                    // Geçerli güçlü yerel doğrulayıcı varsa izole kasaya taşı; usr_admin üzerindeki eski varsayılan 123 kalıntısını temizle
                    if (u.passwordHash && u.salt) {
                        const isLegacyWeak = u.salt === 'celik_salt_default' || KNOWN_WEAK_HASHES_GLOBAL.has(u.passwordHash);
                        if (!isLegacyWeak) {
                            const existingVault = getLocalUserCred(u.id);
                            if (!existingVault || Number(u.passwordUpdatedAt || 0) >= Number(existingVault.passwordUpdatedAt || 0)) {
                                setLocalUserCred(u.id, {
                                    salt: u.salt,
                                    passwordHash: u.passwordHash,
                                    passwordStrengthLevel: u.passwordStrengthLevel || 'Güçlü',
                                    mustChangePassword: Boolean(u.mustChangePassword),
                                    passwordUpdatedAt: u.passwordUpdatedAt || u.updatedAt || Date.now()
                                });
                            }
                        } else if (u.id !== 'usr_admin') {
                            if (!getLocalUserCred(u.id)) {
                                setLocalUserCred(u.id, {
                                    salt: u.salt,
                                    passwordHash: u.passwordHash,
                                    passwordStrengthLevel: 'Zayıf',
                                    mustChangePassword: true,
                                    passwordUpdatedAt: u.createdAt || 0
                                });
                            }
                        }
                        delete u.passwordHash;
                        delete u.salt;
                        hasChanged = true;
                    }
                    if (u.password) {
                        delete u.password;
                        hasChanged = true;
                    }
                    if (u.id === 'usr_admin') {
                        if (!u.email) { u.email = 'feritkantarci@gmail.com'; hasChanged = true; }
                        if (!u.fbAuthEmail) { u.fbAuthEmail = 'feritkantarci@gmail.com'; hasChanged = true; }
                        if (!Array.isArray(u.aliases) || !u.aliases.includes('ferit')) {
                            u.aliases = ['ferit', 'admin'];
                            hasChanged = true;
                        }
                        if (!u.passwordStrengthLevel) { u.passwordStrengthLevel = 'Çok Güçlü'; hasChanged = true; }
                        if (u.mustChangePassword) { u.mustChangePassword = false; hasChanged = true; }
                    }
                    // Güvenlik: Yönetici olmayan kullanıcılara buluttan sızmış eski paylaşımlı Gemini API anahtarını temizle
                    if (u.role !== 'admin' && u.geminiApiKey && !u.geminiKeyOwnedByUser) {
                        delete u.geminiApiKey;
                        hasChanged = true;
                    }
                });

                if (hasChanged) {
                    localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
                }
            }
            return users;
        }

        function getAuthUsers() {
            return initAuthDatabase();
        }

        function saveAuthUsers(users) {
            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
            syncUsersToCloud(users);
        }

        function getSession() {
            try {
                const raw = localStorage.getItem('celik_kodu_session');
                if (raw) {
                    const session = JSON.parse(raw);
                    // Güvenlik Doğrulaması: Yalnızca açıkça şifre ile giriş yapılmış (authVerified: true) oturumları tanı.
                    // Önceki sürümlerden kalan sahte veya otomatik usr_admin oturumlarını anında temizle.
                    if (session && session.userId && session.authVerified === true) {
                        return session;
                    }
                    localStorage.removeItem('celik_kodu_session');
                    localStorage.removeItem('celik_kodu_active_user_id');
                    return null;
                }
                return null;
            } catch(e) {
                return null;
            }
        }

        function setSession(session) {
            currentSession = session;
            if (session) {
                session.authVerified = true;
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
                localStorage.setItem('celik_kodu_active_user_id', session.userId);
                localStorage.removeItem('celik_kodu_logged_out');
                try {
                    const scopedKey = typeof getLastGeneratedWorkoutStorageKey === 'function'
                        ? getLastGeneratedWorkoutStorageKey(session.userId)
                        : `celik_kodu_last_generated_workout_${session.userId}`;
                    const scopedRaw = localStorage.getItem(scopedKey);
                    if (scopedRaw) {
                        const parsed = JSON.parse(scopedRaw);
                        if (parsed && typeof parsed === 'object' && (!parsed.userId || parsed.userId === session.userId)) {
                            localStorage.setItem('celik_kodu_last_generated_workout', scopedRaw);
                            currentGeneratedWorkout = parsed;
                            window.currentGeneratedWorkout = parsed;
                        }
                    } else {
                        const legacyRaw = localStorage.getItem('celik_kodu_last_generated_workout');
                        if (legacyRaw) {
                            const legacyParsed = JSON.parse(legacyRaw);
                            if (legacyParsed && legacyParsed.userId && legacyParsed.userId !== session.userId) {
                                localStorage.removeItem('celik_kodu_last_generated_workout');
                                currentGeneratedWorkout = null;
                                window.currentGeneratedWorkout = null;
                            }
                        } else if (typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && currentGeneratedWorkout.userId && currentGeneratedWorkout.userId !== session.userId) {
                            currentGeneratedWorkout = null;
                            window.currentGeneratedWorkout = null;
                        }
                    }
                } catch (e) {}
                syncAllFromCloud();
            } else {
                localStorage.removeItem('celik_kodu_session');
                localStorage.removeItem('celik_kodu_active_user_id');
                localStorage.removeItem('celik_kodu_last_generated_workout');
                if (typeof currentGeneratedWorkout !== 'undefined') currentGeneratedWorkout = null;
                window.currentGeneratedWorkout = null;
                localStorage.setItem('celik_kodu_logged_out', 'true');
            }
            syncAppViewState();
        }

        function getActiveUserId() {
            const session = getSession();
            if (session && session.userId) {
                if (session.userId === 'usr_ferit') {
                    session.userId = 'usr_admin';
                    session.name = 'Ferit (Admin)';
                    setSession(session);
                }
                return session.userId;
            }
            try {
                if (localStorage.getItem('celik_kodu_logged_out') !== 'true') {
                    const fallbackAid = localStorage.getItem('celik_kodu_active_user_id');
                    if (fallbackAid) return fallbackAid;
                }
            } catch (e) {}
            return null;
        }

        function getActiveUser() {
            const uid = getActiveUserId();
            if (!uid) return null;
            const users = getAuthUsers();
            return users.find(u => u.id === uid) || null;
        }

        function syncAppViewState() {
            const session = getSession();
            const loginScreen = document.getElementById('loginScreen');
            const mainAppWrapper = document.getElementById('mainAppWrapper');

            if (!session) {
                if (loginScreen) loginScreen.classList.add('active');
                if (mainAppWrapper) mainAppWrapper.style.display = 'none';
                return;
            }

            // Mevcut açık oturumda yalnızca açıkça geçici şifre (mustChangePassword) işaretliyse şifre yenilemeye yönlendir;
            // bulut eşitlemesi kaynaklı eksik alanlar yüzünden doğrulanmış aktif oturumu asla düşürme!
            const users = getAuthUsers();
            const activeUser = users.find(u => u.id === session.userId);
            if (activeUser && activeUser.mustChangePassword === true && !session.passwordPolicyVerified) {
                localStorage.removeItem('celik_kodu_session');
                currentSession = null;
                if (loginScreen) loginScreen.classList.add('active');
                if (mainAppWrapper) mainAppWrapper.style.display = 'none';
                openForcePasswordUpgradeStep(
                    activeUser,
                    'Hesabınızda geçici şifre tanımlı. Devam etmek için kendinize özel güçlü bir şifre belirleyin.',
                    ''
                );
                return;
            }

            if (loginScreen) loginScreen.classList.remove('active');
            if (mainAppWrapper) mainAppWrapper.style.display = 'block';

            const isAdmin = session.role === 'admin';

            const btnAdmin = document.getElementById('btnAdminPanel');
            if (btnAdmin) btnAdmin.style.display = isAdmin ? 'flex' : 'none';

            const btnAdminPopup = document.getElementById('btnAdminPanelPopup');
            if (btnAdminPopup) btnAdminPopup.style.display = isAdmin ? 'flex' : 'none';

            const sheetAdmin = document.getElementById('sheetAdminBtn');
            if (sheetAdmin) sheetAdmin.style.display = isAdmin ? 'flex' : 'none';

            const profileTabAdminBtn = document.getElementById('profileTabAdminBtn');
            if (profileTabAdminBtn) profileTabAdminBtn.style.display = isAdmin ? 'inline-block' : 'none';

            const roleBadge = document.getElementById('headerUserRoleBadge');
            if (roleBadge) {
                roleBadge.innerText = isAdmin ? 'YÖNETİCİ' : 'SPORCU';
                roleBadge.className = 'auth-role-tag ' + (isAdmin ? 'role-admin' : 'role-athlete');
            }

            if (isAdmin) {
                updateAdminPendingBadges();
            }

            applyActiveUserProfile();
        }

        let pendingForgotOtpState = null;
        let pendingWeakPasswordUpgradeState = null;

        const COMMON_WEAK_PASSWORDS_SET = new Set([
            '123', '1234', '12345', '123456', '1234567', '12345678', '123456789', '1234567890',
            '654321', '87654321', '987654321', '111111', '11111111', '000000', '00000000',
            '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999',
            'password', 'password1', 'password123', 'pass1234', 'qwerty', 'qwerty123', 'qwertyui',
            'asdfgh', 'asdfghjk', 'asdf1234', 'zxcvbnm', 'admin', 'admin123', 'admin1234',
            'celik', 'celik123', 'celikkodu', 'celikkodu123', 'sanane', 'sanane123', 'deneme', 'deneme123',
            'fitness', 'fitness123', 'sporcu123', 'turkiye123', 'istanbul34'
        ]);

        function evaluatePasswordSecurity(password, userContext) {
            const pwd = String(password || '').trim();
            const lower = pwd.toLocaleLowerCase('tr-TR');
            const asciiLower = lower
                .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
                .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');

            const hasMinLength = pwd.length >= 8;
            const hasLetter = /[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(pwd);
            const hasNumber = /[0-9]/.test(pwd);
            const hasLetterAndNumber = hasLetter && hasNumber;
            const hasUpperAndLower = /[a-zçğıöşü]/.test(pwd) && /[A-ZÇĞİÖŞÜ]/.test(pwd);
            const hasSymbol = /[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s]/.test(pwd);

            let isUnpredictable = pwd.length > 0;
            let weakReason = '';

            if (COMMON_WEAK_PASSWORDS_SET.has(lower) || COMMON_WEAK_PASSWORDS_SET.has(asciiLower)) {
                isUnpredictable = false;
                weakReason = 'Çok yaygın kullanılan kolay bir şifre seçtiniz.';
            } else if (/^(.)\1{4,}$/.test(pwd)) {
                isUnpredictable = false;
                weakReason = 'Tekrarlayan aynı karakterlerden oluşan şifre kullanılamaz.';
            } else if ('01234567890123456789'.includes(pwd) || '98765432109876543210'.includes(pwd) || 'abcdefghijklmnopqrstuvwxyz'.includes(asciiLower)) {
                isUnpredictable = false;
                weakReason = 'Ardışık sıralı harf veya rakam dizisi kullanılamaz.';
            }

            if (isUnpredictable && userContext) {
                const tokens = [];
                const uName = normalizeAuthString(userContext.username || '');
                const fName = normalizeAuthString((userContext.name || '').split(/\s+/)[0] || '');
                const emailLocal = String(userContext.email || '').split('@')[0].toLowerCase().trim();
                if (uName.length >= 3) tokens.push(uName);
                if (fName.length >= 3) tokens.push(fName);
                if (emailLocal.length >= 3) tokens.push(emailLocal);

                for (const tk of tokens) {
                    if (lower === tk || asciiLower === tk) {
                        isUnpredictable = false;
                        weakReason = 'Şifreniz kullanıcı adınız veya isminizle aynı olamaz.';
                        break;
                    }
                    const trivialMatches = [tk + '1', tk + '12', tk + '123', tk + '1234', tk + '12345', tk + '123456', tk + '111', tk + '000'];
                    if (trivialMatches.includes(lower) || trivialMatches.includes(asciiLower)) {
                        isUnpredictable = false;
                        weakReason = 'İsminizin sonuna ardışık rakam (123 vb.) eklenmiş basit şifreler kullanılamaz.';
                        break;
                    }
                }
            }

            const isValid = hasMinLength && hasLetterAndNumber && isUnpredictable;

            let score = 0;
            if (hasMinLength) score += 1;
            if (pwd.length >= 10) score += 1;
            if (hasLetterAndNumber) score += 1;
            if (isUnpredictable && pwd.length >= 6) score += 1;
            if (hasUpperAndLower || hasSymbol) score += 1;

            let levelLabel = 'Zayıf';
            if ( isValid ) {
                levelLabel = score >= 5 ? 'Çok Güçlü' : (score >= 4 ? 'Güçlü' : 'Yeterli');
            } else if (pwd.length >= 5) {
                levelLabel = 'Geliştirilmeli';
            }

            let reason = 'Şifre güvenlik kriterlerini karşılıyor.';
            if (!hasMinLength) {
                reason = 'Şifreniz en az 8 karakter uzunluğunda olmalıdır.';
            } else if (!hasLetterAndNumber) {
                reason = 'Şifreniz en az 1 harf ve 1 rakam içermelidir.';
            } else if (!isUnpredictable) {
                reason = weakReason || 'Bu şifre çok kolay tahmin edilebilir düzeyde.';
            }

            return {
                isValid,
                hasMinLength,
                hasLetterAndNumber,
                isUnpredictable,
                score,
                levelLabel,
                reason
            };
        }

        function isUserStoredCredentialWeak(user, plainPasswordIfKnown) {
            if (!user) return { isWeak: false, reason: '' };
            if (user.mustChangePassword === true) {
                return {
                    isWeak: true,
                    reason: 'Hesabınızda geçici şifre tanımlı. Devam etmek için kendinize özel güçlü bir şifre belirleyin.'
                };
            }
            const vaultCred = getLocalUserCred(user.id);
            const effSalt = (vaultCred && vaultCred.salt) || user.salt || '';
            const effHash = (vaultCred && vaultCred.passwordHash) || user.passwordHash || '';
            if (effSalt === 'celik_salt_default' || KNOWN_WEAK_HASHES_GLOBAL.has(effHash)) {
                return {
                    isWeak: true,
                    reason: 'Varsayılan başlangıç şifresi kullanıyorsunuz. Hesabınızı korumak için güçlü bir şifre oluşturun.'
                };
            }
            if (typeof plainPasswordIfKnown === 'string' && plainPasswordIfKnown.length > 0) {
                const evalRes = evaluatePasswordSecurity(plainPasswordIfKnown, user);
                if (!evalRes.isValid) {
                    return {
                        isWeak: true,
                        reason: `Mevcut şifreniz güvenlik standardının altında (${evalRes.reason})`
                    };
                }
            }
            return { isWeak: false, reason: '' };
        }

        function switchAuthScreenTab(mode) {
            const loginForm = document.getElementById('loginForm');
            const regForm = document.getElementById('registerForm');
            const forgotForm = document.getElementById('forgotPasswordForm');
            const forceUpgradeForm = document.getElementById('forcePasswordUpgradeForm');
            const btnLogin = document.getElementById('authTabBtnLogin');
            const btnReg = document.getElementById('authTabBtnRegister');
            const errBox = document.getElementById('loginErrorMsg');
            const okBox = document.getElementById('loginSuccessMsg');

            if (errBox) errBox.style.display = 'none';
            if (okBox && mode !== 'login') okBox.style.display = 'none';
            if (forceUpgradeForm && mode !== 'force_upgrade') forceUpgradeForm.style.display = 'none';
            if (mode !== 'force_upgrade') pendingWeakPasswordUpgradeState = null;

            if (mode === 'force_upgrade') {
                if (loginForm) loginForm.style.display = 'none';
                if (regForm) regForm.style.display = 'none';
                if (forgotForm) forgotForm.style.display = 'none';
                if (forceUpgradeForm) forceUpgradeForm.style.display = 'block';
                return;
            }

            if (mode === 'register') {
                if (loginForm) loginForm.style.display = 'none';
                if (regForm) regForm.style.display = 'block';
                if (forgotForm) forgotForm.style.display = 'none';
                if (btnReg) {
                    btnReg.style.background = 'linear-gradient(135deg, #FF5A36 0%, #E03410 100%)';
                    btnReg.style.color = '#FFFFFF';
                    btnReg.style.borderColor = '#B52603';
                    btnReg.style.boxShadow = '0 3px 10px rgba(255,90,54,0.28)';
                }
                if (btnLogin) {
                    btnLogin.style.background = 'transparent';
                    btnLogin.style.color = '#334155';
                    btnLogin.style.borderColor = 'transparent';
                    btnLogin.style.boxShadow = 'none';
                }
            } else if (mode === 'forgot') {
                if (loginForm) loginForm.style.display = 'none';
                if (regForm) regForm.style.display = 'none';
                if (forgotForm) forgotForm.style.display = 'block';
                const loginUnameEl = document.getElementById('loginUsername');
                const forgotIdEl = document.getElementById('forgotIdentity');
                if (loginUnameEl && forgotIdEl && loginUnameEl.value.trim() && !forgotIdEl.value.trim()) {
                    forgotIdEl.value = loginUnameEl.value.trim();
                }
                if (btnLogin) {
                    btnLogin.style.background = 'transparent';
                    btnLogin.style.color = '#334155';
                    btnLogin.style.borderColor = 'transparent';
                    btnLogin.style.boxShadow = 'none';
                }
                if (btnReg) {
                    btnReg.style.background = 'transparent';
                    btnReg.style.color = '#334155';
                    btnReg.style.borderColor = 'transparent';
                    btnReg.style.boxShadow = 'none';
                }
            } else {
                if (loginForm) loginForm.style.display = 'block';
                if (regForm) regForm.style.display = 'none';
                if (forgotForm) forgotForm.style.display = 'none';
                if (btnLogin) {
                    btnLogin.style.background = 'linear-gradient(135deg, #FF5A36 0%, #E03410 100%)';
                    btnLogin.style.color = '#FFFFFF';
                    btnLogin.style.borderColor = '#B52603';
                    btnLogin.style.boxShadow = '0 3px 10px rgba(255,90,54,0.28)';
                }
                if (btnReg) {
                    btnReg.style.background = 'transparent';
                    btnReg.style.color = '#334155';
                    btnReg.style.borderColor = 'transparent';
                    btnReg.style.boxShadow = 'none';
                }
            }
        }

        function openForcePasswordUpgradeStep(user, reasonText, oldPlainPassword) {
            pendingWeakPasswordUpgradeState = {
                userId: user.id,
                oldPlainPassword: oldPlainPassword || ''
            };
            switchAuthScreenTab('force_upgrade');

            const greetingEl = document.getElementById('forceUpgradeUserGreeting');
            const reasonEl = document.getElementById('forceUpgradeReasonText');
            const newPassEl = document.getElementById('forceUpgradeNewPass');
            const confirmPassEl = document.getElementById('forceUpgradeConfirmPass');

            if (greetingEl) greetingEl.textContent = `Merhaba ${user.name || user.username}, Güvenli Şifre Belirleyin`;
            if (reasonEl) reasonEl.textContent = reasonText || 'Mevcut şifreniz kolay tahmin edilebilir düzeyde. Hesabınızı korumak için yeni bir şifre belirleyin.';
            if (newPassEl) newPassEl.value = '';
            if (confirmPassEl) confirmPassEl.value = '';
            updateForceUpgradePasswordPreview();
            if (newPassEl) setTimeout(() => newPassEl.focus(), 60);
        }

        function updateForceUpgradePasswordPreview() {
            const newPassEl = document.getElementById('forceUpgradeNewPass');
            const lenPill = document.getElementById('pwRuleLenPill');
            const mixPill = document.getElementById('pwRuleMixPill');
            const safePill = document.getElementById('pwRuleSafePill');
            const strengthLabel = document.getElementById('forceUpgradeStrengthLabel');

            const val = (newPassEl ? newPassEl.value : '').trim();
            const users = getAuthUsers();
            const targetUser = pendingWeakPasswordUpgradeState
                ? users.find(u => u.id === pendingWeakPasswordUpgradeState.userId)
                : null;
            const res = evaluatePasswordSecurity(val, targetUser);
            const isSameAsOld = Boolean(
                val &&
                pendingWeakPasswordUpgradeState &&
                pendingWeakPasswordUpgradeState.oldPlainPassword &&
                val === pendingWeakPasswordUpgradeState.oldPlainPassword
            );
            const safeOk = val.length > 0 && res.isUnpredictable && !isSameAsOld;

            const stylePill = (el, active) => {
                if (!el) return;
                if (active) {
                    el.style.background = '#DCFCE7';
                    el.style.color = '#15803D';
                    el.style.borderColor = '#86EFAC';
                } else {
                    el.style.background = '#F1F5F9';
                    el.style.color = '#475569';
                    el.style.borderColor = '#CBD5E1';
                }
            };

            stylePill(lenPill, res.hasMinLength);
            stylePill(mixPill, res.hasLetterAndNumber);
            stylePill(safePill, safeOk);

            if (strengthLabel) {
                if (!val) {
                    strengthLabel.textContent = 'Bekleniyor';
                    strengthLabel.style.color = '#475569';
                } else if (res.isValid && !isSameAsOld) {
                    strengthLabel.textContent = `Güvenlik: ${res.levelLabel}`;
                    strengthLabel.style.color = '#15803D';
                } else {
                    strengthLabel.textContent = isSameAsOld ? 'Eski şifreyle aynı olamaz' : 'Geliştirilmeli';
                    strengthLabel.style.color = '#B45309';
                }
            }
        }
        window.updateForceUpgradePasswordPreview = updateForceUpgradePasswordPreview;

        function cancelForcePasswordUpgrade() {
            pendingWeakPasswordUpgradeState = null;
            const passInput = document.getElementById('loginPassword');
            if (passInput) passInput.value = '';
            switchAuthScreenTab('login');
        }
        window.cancelForcePasswordUpgrade = cancelForcePasswordUpgrade;

        function completeAuthenticatedLogin(matched) {
            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            const errorBox = document.getElementById('loginErrorMsg');
            if (errorBox) errorBox.style.display = 'none';

            setSession({
                userId: matched.id,
                username: matched.username,
                role: matched.role,
                name: matched.name,
                authVerified: true,
                passwordPolicyVerified: true,
                loginAt: Date.now()
            });
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.type = 'password';
            }

            applyWednesdayHammerCurlPatch();
            updateProfileGeminiStatusUI();
            renderAiHybridHeroBanner();
            updateSelectedSplitLabel();
            renderSplitCards();
            updateSelectedEquipLabel();
            updateSelectedParamLabel();
            refreshTopFitnessCardioScoreBars();
            const hasRestored = restoreActiveWorkoutStateFromStorage();
            if (hasRestored) {
                switchTab('activeWorkoutTab');
            } else {
                renderActiveWorkout();
            }
        }

        async function handleForcePasswordUpgradeSubmit(e) {
            e.preventDefault();
            const newPassEl = document.getElementById('forceUpgradeNewPass');
            const confirmPassEl = document.getElementById('forceUpgradeConfirmPass');
            const errorBox = document.getElementById('loginErrorMsg');

            if (errorBox) errorBox.style.display = 'none';

            if (!pendingWeakPasswordUpgradeState || !pendingWeakPasswordUpgradeState.userId) {
                switchAuthScreenTab('login');
                return;
            }

            const newPass = (newPassEl ? newPassEl.value : '').trim();
            const confirmPass = (confirmPassEl ? confirmPassEl.value : '').trim();

            const users = getAuthUsers();
            const userIdx = users.findIndex(u => u.id === pendingWeakPasswordUpgradeState.userId);
            if (userIdx === -1) {
                switchAuthScreenTab('login');
                return;
            }
            const user = users[userIdx];

            if (pendingWeakPasswordUpgradeState.oldPlainPassword && newPass === pendingWeakPasswordUpgradeState.oldPlainPassword) {
                if (errorBox) {
                    errorBox.innerText = '❌ Yeni şifreniz mevcut zayıf şifrenizle aynı olamaz!';
                    errorBox.style.display = 'block';
                }
                return;
            }

            const evalRes = evaluatePasswordSecurity(newPass, user);
            if (!evalRes.isValid) {
                if (errorBox) {
                    errorBox.innerText = `❌ ${evalRes.reason}`;
                    errorBox.style.display = 'block';
                }
                return;
            }

            if (newPass !== confirmPass) {
                if (errorBox) {
                    errorBox.innerText = '❌ Girdiğiniz yeni şifreler birbiriyle eşleşmiyor!';
                    errorBox.style.display = 'block';
                }
                return;
            }

            // Firebase Auth üzerinde de şifreyi senkron güncelle
            if (fbAuth && navigator.onLine !== false) {
                const fbEmail = getCanonicalFbAuthEmail(user);
                if (fbEmail) {
                    try {
                        if (!fbAuth.currentUser || (fbAuth.currentUser.email || '').toLowerCase() !== fbEmail) {
                            if (pendingWeakPasswordUpgradeState.oldPlainPassword) {
                                await fbAuth.signInWithEmailAndPassword(fbEmail, pendingWeakPasswordUpgradeState.oldPlainPassword);
                            }
                        }
                        if (fbAuth.currentUser && (fbAuth.currentUser.email || '').toLowerCase() === fbEmail) {
                            await fbAuth.currentUser.updatePassword(newPass);
                        }
                    } catch (fbErr) {
                        console.warn('Firebase Auth şifre yükseltme uyarısı:', fbErr && fbErr.code);
                    }
                }
            }

            const nowMs = Date.now();
            const newSalt = generateSecureSalt();
            const newHash = await sha256Hex(newSalt + newPass);
            setLocalUserCred(user.id, {
                salt: newSalt,
                passwordHash: newHash,
                passwordStrengthLevel: evalRes.levelLabel,
                mustChangePassword: false,
                passwordUpdatedAt: nowMs
            });
            delete user.password;
            delete user.passwordHash;
            delete user.salt;
            user.mustChangePassword = false;
            user.passwordStrengthLevel = evalRes.levelLabel;
            user.passwordUpdatedAt = nowMs;
            user.updatedAt = nowMs;

            users[userIdx] = user;
            saveAuthUsers(users);

            if (newPassEl) newPassEl.value = '';
            if (confirmPassEl) confirmPassEl.value = '';
            pendingWeakPasswordUpgradeState = null;
            switchAuthScreenTab('login');
            completeAuthenticatedLogin(user);
        }
        window.handleForcePasswordUpgradeSubmit = handleForcePasswordUpgradeSubmit;

        async function handleSendFirebaseResetLink() {
            const idEl = document.getElementById('forgotIdentity');
            const errorBox = document.getElementById('loginErrorMsg');
            const successBox = document.getElementById('loginSuccessMsg');
            if (errorBox) errorBox.style.display = 'none';
            if (successBox) successBox.style.display = 'none';

            const rawIdentity = (idEl ? idEl.value : '').trim();
            if (!rawIdentity) {
                if (errorBox) {
                    errorBox.innerText = '❌ Önce kayıtlı e-posta adresinizi veya kullanıcı adınızı yazın.';
                    errorBox.style.display = 'block';
                }
                return;
            }
            if (!fbAuth || navigator.onLine === false) {
                if (errorBox) {
                    errorBox.innerText = '❌ Şu an çevrimdışısınız. Aşağıdaki doğrudan yenileme alanını kullanın.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            if (typeof syncUsersFromCloud === 'function' && isFirebaseReady && !IS_LOCAL_DEV) {
                try {
                    await Promise.race([
                        syncUsersFromCloud(),
                        new Promise(resolve => setTimeout(resolve, 3000))
                    ]);
                } catch (e) {}
            }

            const normId = normalizeAuthString(rawIdentity);
            const emailId = rawIdentity.toLowerCase();
            const users = getAuthUsers();
            const matched = users.find(u => {
                const uUname = normalizeAuthString(u.username);
                const uEmail = (u.email || '').trim().toLowerCase();
                const aliases = Array.isArray(u.aliases) ? u.aliases.map(normalizeAuthString) : [];
                return (uUname && uUname === normId) ||
                    (uEmail && uEmail === emailId) ||
                    (u.id === 'usr_admin' && (normId === 'admin' || normId === 'ferit')) ||
                    aliases.includes(normId);
            });

            const targetEmail = matched ? getCanonicalFbAuthEmail(matched) : (emailId.includes('@') ? emailId : '');
            if (!targetEmail || targetEmail.endsWith('@auth.celikkodu.app')) {
                if (errorBox) {
                    errorBox.innerText = '❌ Bu hesapta tanımlı gerçek bir e-posta adresi bulunamadı. Lütfen aşağıdaki Ad Soyad doğrulama alanıyla şifrenizi yenileyin.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            try {
                await fbAuth.sendPasswordResetEmail(targetEmail);
                switchAuthScreenTab('login');
                if (successBox) {
                    successBox.innerText = `📩 Şifre sıfırlama bağlantısı (${targetEmail}) adresinize gönderildi. E-postadaki bağlantıdan yeni şifrenizi belirleyip giriş yapabilirsiniz.`;
                    successBox.style.display = 'block';
                }
            } catch (err) {
                if (errorBox) {
                    errorBox.innerText = '❌ Sıfırlama e-postası gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin.';
                    errorBox.style.display = 'block';
                }
            }
        }
        window.handleSendFirebaseResetLink = handleSendFirebaseResetLink;

        async function handleForgotPasswordSubmit(e) {
            e.preventDefault();
            const idEl = document.getElementById('forgotIdentity');
            const nameEl = document.getElementById('forgotFullName');
            const otpContainer = document.getElementById('forgotOtpContainer');
            const otpEl = document.getElementById('forgotOtpCode');
            const passEl = document.getElementById('forgotNewPass');
            const passConfirmEl = document.getElementById('forgotNewPassConfirm');
            const errorBox = document.getElementById('loginErrorMsg');
            const successBox = document.getElementById('loginSuccessMsg');

            if (errorBox) errorBox.style.display = 'none';
            if (successBox) successBox.style.display = 'none';

            const rawIdentity = (idEl ? idEl.value : '').trim();
            const normIdentity = normalizeAuthString(rawIdentity);
            const emailIdentity = rawIdentity.toLowerCase();
            const rawFullName = (nameEl ? nameEl.value : '').trim();
            const normFullName = normalizeAuthString(rawFullName);
            const newPass = (passEl ? passEl.value : '').trim();
            const newPassConfirm = (passConfirmEl ? passConfirmEl.value : '').trim();

            if (!normIdentity || !normFullName || !newPass || !newPassConfirm) {
                errorBox.innerText = "❌ Lütfen tüm alanları eksiksiz doldurun.";
                errorBox.style.display = 'block';
                return;
            }

            const prelimCheck = evaluatePasswordSecurity(newPass, { username: normIdentity, name: rawFullName });
            if (!prelimCheck.isValid) {
                errorBox.innerText = `❌ ${prelimCheck.reason}`;
                errorBox.style.display = 'block';
                return;
            }

            if (newPass !== newPassConfirm) {
                errorBox.innerText = "❌ Girdiğiniz yeni şifreler birbiriyle eşleşmiyor!";
                errorBox.style.display = 'block';
                return;
            }

            if (typeof syncUsersFromCloud === 'function' && isFirebaseReady && !IS_LOCAL_DEV) {
                try { await syncUsersFromCloud(); } catch (err) {}
            }

            const users = getAuthUsers();
            const matchedUser = users.find(u => {
                const uUname = normalizeAuthString(u.username);
                const uEmail = (u.email || '').trim().toLowerCase();
                const uName = normalizeAuthString(u.name);
                const aliases = Array.isArray(u.aliases) ? u.aliases.map(normalizeAuthString) : [];

                const idMatches = (uUname && uUname === normIdentity) ||
                    (uEmail && uEmail === emailIdentity) ||
                    aliases.includes(normIdentity);
                if (!idMatches) return false;

                const nameMatches = (uName && uName === normFullName) ||
                    (u.id === 'usr_admin' && (normFullName === 'ferit' || normFullName.includes('ferit')));
                return nameMatches;
            });

            if (!matchedUser) {
                errorBox.innerText = "❌ E-posta/kullanıcı adı ile kayıtlı Ad Soyad bilgisi eşleşmedi. Lütfen kayıtlı bilgilerinizi kontrol edin.";
                errorBox.style.display = 'block';
                return;
            }

            const fullSecCheck = evaluatePasswordSecurity(newPass, matchedUser);
            if (!fullSecCheck.isValid) {
                errorBox.innerText = `❌ ${fullSecCheck.reason}`;
                errorBox.style.display = 'block';
                return;
            }

            // Eğer EmailJS aktifse ve kullanıcının e-postası varsa 6 haneli doğrulama kodu (OTP) kontrolü
            const cfg = typeof getAdminEmailJsConfig === 'function' ? getAdminEmailJsConfig() : null;
            if (cfg && cfg.serviceId && cfg.templateId && cfg.publicKey && matchedUser.email) {
                const enteredOtp = (otpEl ? otpEl.value : '').trim();
                const isOtpActiveForUser = pendingForgotOtpState &&
                    pendingForgotOtpState.userId === matchedUser.id &&
                    (Date.now() - pendingForgotOtpState.createdAt < 10 * 60 * 1000);

                if (!isOtpActiveForUser) {
                    const randArr = new Uint32Array(1);
                    if (window.crypto && window.crypto.getRandomValues) {
                        window.crypto.getRandomValues(randArr);
                    } else {
                        randArr[0] = Math.floor(Math.random() * 900000) + 100000;
                    }
                    const code = String((randArr[0] % 900000) + 100000);
                    pendingForgotOtpState = { userId: matchedUser.id, code, createdAt: Date.now() };

                    try {
                        const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                service_id: cfg.serviceId,
                                template_id: cfg.templateId,
                                user_id: cfg.publicKey,
                                template_params: {
                                    to_email: matchedUser.email,
                                    to_name: matchedUser.name,
                                    username: matchedUser.username,
                                    subject: '🔐 Çelik Kodu | Şifre Sıfırlama Doğrulama Kodu',
                                    message: `Merhaba ${matchedUser.name},\n\nŞifre yenileme işleminiz için 6 haneli doğrulama kodunuz: ${code}\n\nBu kod 10 dakika boyunca geçerlidir.`
                                }
                            })
                        });
                        if (resp.ok) {
                            if (otpContainer) otpContainer.style.display = 'block';
                            if (successBox) {
                                successBox.innerText = `📩 (${matchedUser.email}) adresinize 6 haneli doğrulama kodu gönderildi. Kodu girip tekrar 'Şifremi Yenile' butonuna basın.`;
                                successBox.style.display = 'block';
                            }
                            return;
                        }
                    } catch (err) {
                        // EmailJS erişilemezse kimlik doğrulamasıyla devam et
                        pendingForgotOtpState = null;
                    }
                } else {
                    if (enteredOtp !== pendingForgotOtpState.code) {
                        if (otpContainer) otpContainer.style.display = 'block';
                        errorBox.innerText = "❌ Girdiğiniz 6 haneli e-posta doğrulama kodu hatalı!";
                        errorBox.style.display = 'block';
                        return;
                    }
                }
            }

            // Yeni şifreyi izole yerel kasaya kriptografik Salted SHA-256 ile kaydet
            const nowMs = Date.now();
            const salt = generateSecureSalt();
            const passHash = await sha256Hex(salt + newPass);
            setLocalUserCred(matchedUser.id, {
                salt,
                passwordHash: passHash,
                passwordStrengthLevel: fullSecCheck.levelLabel,
                mustChangePassword: false,
                passwordUpdatedAt: nowMs
            });
            delete matchedUser.password;
            delete matchedUser.passwordHash;
            delete matchedUser.salt;
            matchedUser.mustChangePassword = false;
            matchedUser.passwordStrengthLevel = fullSecCheck.levelLabel;
            matchedUser.passwordUpdatedAt = nowMs;
            matchedUser.updatedAt = nowMs;

            saveAuthUsers(users);
            pendingForgotOtpState = null;

            if (idEl) idEl.value = '';
            if (nameEl) nameEl.value = '';
            if (otpEl) otpEl.value = '';
            if (otpContainer) otpContainer.style.display = 'none';
            if (passEl) passEl.value = '';
            if (passConfirmEl) passConfirmEl.value = '';

            switchAuthScreenTab('login');
            const loginUnameEl = document.getElementById('loginUsername');
            if (loginUnameEl) loginUnameEl.value = matchedUser.username || matchedUser.email;

            if (successBox) {
                successBox.innerText = `✅ Güçlü şifreniz kaydedildi! Kullanıcı adınız (@${matchedUser.username}) veya e-postanızla hemen giriş yapabilirsiniz.`;
                successBox.style.display = 'block';
            }
        }

        async function handleAuthRegister(e) {
            e.preventDefault();
            const dnameEl = document.getElementById('regDisplayName');
            const emailEl = document.getElementById('regEmail');
            const unameEl = document.getElementById('regUsername');
            const passEl = document.getElementById('regPassword');
            const levelEl = document.getElementById('regLevel');
            const genderEl = document.getElementById('regGender');
            const errorBox = document.getElementById('loginErrorMsg');
            const successBox = document.getElementById('loginSuccessMsg');

            if (errorBox) errorBox.style.display = 'none';
            if (successBox) successBox.style.display = 'none';

            const dname = (dnameEl ? dnameEl.value : '').trim();
            const rawEmail = (emailEl ? emailEl.value : '').trim().toLowerCase();
            const rawUname = (unameEl ? unameEl.value : '').trim();
            const pass = (passEl ? passEl.value : '').trim();
            const level = levelEl ? levelEl.value : 'Orta Seviye';
            const gender = genderEl ? genderEl.value : 'Erkek';

            if (!dname || !rawEmail || !rawUname || !pass) {
                errorBox.innerText = "❌ Lütfen Ad Soyad, E-Posta, Kullanıcı Adı ve Şifre alanlarını doldurun.";
                errorBox.style.display = 'block';
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
                errorBox.innerText = "❌ Lütfen geçerli bir e-posta adresi girin.";
                errorBox.style.display = 'block';
                return;
            }

            const secCheck = evaluatePasswordSecurity(pass, { username: rawUname, name: dname, email: rawEmail });
            if (!secCheck.isValid) {
                errorBox.innerText = `❌ ${secCheck.reason}`;
                errorBox.style.display = 'block';
                return;
            }

            // Buluttaki en güncel kullanıcı listesini çek (varsa)
            if (typeof syncUsersFromCloud === 'function' && isFirebaseReady && !IS_LOCAL_DEV) {
                try { await syncUsersFromCloud(); } catch (err) {}
            }

            const users = getAuthUsers();
            const derivedUname = normalizeAuthString(rawUname);

            const existingByEmail = users.find(u => u.email && u.email.toLowerCase() === rawEmail);
            if (existingByEmail) {
                if (existingByEmail.status === 'pending') {
                    errorBox.innerText = "⏳ Bu e-posta adresiyle yapılmış başvuru zaten yönetici onayında bekliyor.";
                } else {
                    errorBox.innerText = "❌ Bu e-posta adresi zaten kayıtlı! Giriş Yap sekmesinden giriş yapabilirsiniz.";
                }
                errorBox.style.display = 'block';
                return;
            }

            const existingByUname = users.find(u => normalizeAuthString(u.username) === derivedUname);
            if (existingByUname) {
                errorBox.innerText = `❌ "@${derivedUname}" kullanıcı adı zaten kullanımda! Lütfen farklı bir kullanıcı adı seçin.`;
                errorBox.style.display = 'block';
                return;
            }
            const finalUname = derivedUname;

            const nowMs = Date.now();
            const salt = generateSecureSalt();
            const passHash = await sha256Hex(salt + pass);
            let assignedId = 'usr_' + nowMs;

            const secAuth = getSecondaryFirebaseAuth();
            if (secAuth && navigator.onLine !== false) {
                try {
                    const cred = await secAuth.createUserWithEmailAndPassword(rawEmail, pass);
                    if (cred && cred.user && cred.user.uid) {
                        const cleanFbUid = String(cred.user.uid).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
                        if (cleanFbUid) assignedId = 'usr_' + cleanFbUid;
                    }
                    await secAuth.signOut().catch(() => {});
                } catch (fbRegErr) {
                    if (fbRegErr && fbRegErr.code === 'auth/email-already-in-use') {
                        errorBox.innerText = "❌ Bu e-posta adresi zaten kayıtlı! Giriş Yap sekmesinden giriş yapabilirsiniz.";
                        errorBox.style.display = 'block';
                        return;
                    }
                }
            }

            setLocalUserCred(assignedId, {
                salt,
                passwordHash: passHash,
                passwordStrengthLevel: secCheck.levelLabel,
                mustChangePassword: false,
                passwordUpdatedAt: nowMs
            });

            const newPendingUser = {
                id: assignedId,
                username: finalUname,
                email: rawEmail,
                fbAuthEmail: rawEmail,
                passwordStrengthLevel: secCheck.levelLabel,
                mustChangePassword: false,
                passwordUpdatedAt: nowMs,
                role: 'athlete',
                status: 'pending',
                name: dname,
                avatar: '🥋',
                theme: 'cyan',
                level: level,
                gender: gender,
                weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
                createdAt: nowMs,
                updatedAt: nowMs
            };

            users.push(newPendingUser);
            saveAuthUsers(users);

            if (dnameEl) dnameEl.value = '';
            if (emailEl) emailEl.value = '';
            if (unameEl) unameEl.value = '';
            if (passEl) passEl.value = '';

            switchAuthScreenTab('login');
            const loginUnameEl = document.getElementById('loginUsername');
            if (loginUnameEl) loginUnameEl.value = finalUname;

            if (successBox) {
                successBox.innerText = `✅ Kayıt başvurunuz alındı! Yönetici onayından sonra kullanıcı adınız (@${finalUname}) veya e-postanız (${rawEmail}) ile giriş yapabileceksiniz.`;
                successBox.style.display = 'block';
            }
        }

        let isAuthLoginInProgress = false;

        async function handleAuthLogin(e) {
            e.preventDefault();
            if (isAuthLoginInProgress) return;

            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            const submitBtn = document.getElementById('loginSubmitBtn');
            const errorBox = document.getElementById('loginErrorMsg');
            const successBox = document.getElementById('loginSuccessMsg');

            if (successBox) successBox.style.display = 'none';
            if (errorBox) errorBox.style.display = 'none';

            const rawInput = (usernameInput ? usernameInput.value : '').trim();
            const uname = normalizeAuthString(rawInput);
            const emailInput = rawInput.toLowerCase();
            const pass = (passwordInput ? passwordInput.value : '').trim();

            if (!uname || !pass) {
                if (errorBox) {
                    errorBox.innerText = "❌ Lütfen kullanıcı adı/e-posta ve şifrenizi girin.";
                    errorBox.style.display = 'block';
                }
                return;
            }

            const lockRem = getRemainingAuthLockoutSeconds(uname);
            if (lockRem > 0) {
                if (errorBox) {
                    errorBox.innerText = `⏳ Çok fazla hatalı giriş denemesi yapıldı. Güvenliğiniz için ${lockRem} saniye bekleyin.`;
                    errorBox.style.display = 'block';
                }
                return;
            }

            isAuthLoginInProgress = true;
            const prevBtnLabel = submitBtn ? submitBtn.textContent : 'GİRİŞ YAP';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'DOĞRULANIYOR...';
            }

            try {
                // Buluttan güncel kullanıcı dizinini çek (maks. 3.5 sn zaman aşımı ile mobil gecikmeye takılmaz)
                if (typeof syncUsersFromCloud === 'function' && isFirebaseReady && !IS_LOCAL_DEV && navigator.onLine !== false) {
                    try {
                        await Promise.race([
                            syncUsersFromCloud(),
                            new Promise(resolve => setTimeout(resolve, 3500))
                        ]);
                    } catch (err) {}
                }

                const users = getAuthUsers();
                const candidates = users.filter(u => {
                    if (!u) return false;
                    const uUsername = normalizeAuthString(u.username);
                    const uName = normalizeAuthString(u.name);
                    const uEmail = (u.email || '').trim().toLowerCase();
                    const aliases = Array.isArray(u.aliases) ? u.aliases.map(normalizeAuthString) : [];
                    return (uUsername && uUsername === uname) ||
                        (uName && uName === uname) ||
                        (uEmail && uEmail === emailInput) ||
                        (u.id === 'usr_admin' && (uname === 'admin' || uname === 'ferit' || emailInput === 'feritkantarci@gmail.com')) ||
                        aliases.includes(uname);
                });

                let matched = null;
                let rateLimitedByServer = false;

                for (const u of candidates) {
                    const fbEmail = getCanonicalFbAuthEmail(u);
                    let fbVerified = false;
                    let fbNetworkUnavailable = (navigator.onLine === false || !fbAuth);

                    // 1. Birincil Kurumsal Doğrulama: Google Firebase Authentication (Tüm cihaz ve tarayıcılarda tek doğruluk kaynağı)
                    if (fbAuth && fbEmail && navigator.onLine !== false) {
                        try {
                            await fbAuth.signInWithEmailAndPassword(fbEmail, pass);
                            fbVerified = true;
                        } catch (fbErr) {
                            const code = (fbErr && fbErr.code) || '';
                            if (code === 'auth/too-many-requests') {
                                rateLimitedByServer = true;
                                break;
                            }
                            if (code === 'auth/network-request-failed' || code === 'auth/internal-error') {
                                fbNetworkUnavailable = true;
                            }
                        }
                    }

                    if (fbVerified) {
                        const evalRes = evaluatePasswordSecurity(pass, u);
                        const freshSalt = generateSecureSalt();
                        const freshHash = await sha256Hex(freshSalt + pass);
                        setLocalUserCred(u.id, {
                            salt: freshSalt,
                            passwordHash: freshHash,
                            passwordStrengthLevel: evalRes.levelLabel || u.passwordStrengthLevel || 'Güçlü',
                            mustChangePassword: Boolean(u.mustChangePassword),
                            passwordUpdatedAt: Date.now()
                        });
                        matched = u;
                        break;
                    }

                    // 2. Çevrimdışı / Yerel Kasa Doğrulaması (İnternet yokken veya yerel şifre yenileme sonrası)
                    const vaultCred = getLocalUserCred(u.id);
                    const effSalt = (vaultCred && vaultCred.salt) || u.salt || '';
                    const effHash = (vaultCred && vaultCred.passwordHash) || u.passwordHash || '';
                    if (effHash && effSalt) {
                        const isDefaultWeakOnAdmin = (u.id === 'usr_admin') && (effSalt === 'celik_salt_default' || KNOWN_WEAK_HASHES_GLOBAL.has(effHash));
                        const allowLocalFallback = !isDefaultWeakOnAdmin && (
                            fbNetworkUnavailable ||
                            IS_LOCAL_DEV ||
                            ((vaultCred && Number(vaultCred.passwordUpdatedAt || 0)) > Number(u.passwordUpdatedAt || 0))
                        );
                        if (allowLocalFallback) {
                            const enteredHash = await sha256Hex(effSalt + pass);
                            if (enteredHash === effHash) {
                                matched = u;
                                break;
                            }
                        }
                    }
                }

                // Aday bulunamadıysa ancak e-posta girildiyse doğrudan Firebase Auth üzerinden dene
                if (!matched && !rateLimitedByServer && candidates.length === 0 && emailInput.includes('@') && fbAuth && navigator.onLine !== false) {
                    try {
                        const cred = await fbAuth.signInWithEmailAndPassword(emailInput, pass);
                        if (cred && cred.user) {
                            if (typeof syncUsersFromCloud === 'function' && !IS_LOCAL_DEV) {
                                try { await syncUsersFromCloud(); } catch (e) {}
                            }
                            const refreshedUsers = getAuthUsers();
                            matched = refreshedUsers.find(u => u && (
                                u.id === cred.user.uid ||
                                u.id === ('usr_' + cred.user.uid) ||
                                (u.email || '').toLowerCase() === emailInput ||
                                (u.fbAuthEmail || '').toLowerCase() === emailInput
                            )) || null;
                        }
                    } catch (directErr) {
                        if (directErr && directErr.code === 'auth/too-many-requests') {
                            rateLimitedByServer = true;
                        }
                    }
                }

                if (rateLimitedByServer) {
                    if (errorBox) {
                        errorBox.innerText = "⏳ Çok fazla başarısız giriş denemesi tespit edildi. Lütfen birkaç dakika bekleyip tekrar deneyin.";
                        errorBox.style.display = 'block';
                    }
                    return;
                }

                if (matched) {
                    clearAuthFailures(uname);

                    // YÖNETİCİ ONAYI KONTROLÜ (status === 'pending' veya 'rejected' ise girişi engelle)
                    if (matched.role !== 'admin' && matched.status === 'pending') {
                        if (fbAuth) { try { await fbAuth.signOut(); } catch (e) {} }
                        errorBox.innerText = `⏳ Hesabınız henüz yönetici onayında bekliyor. Onaylandığında ${matched.email ? '(' + matched.email + ') adresinize' : 'size'} onay e-postası gönderilecektir.`;
                        errorBox.style.display = 'block';
                        return;
                    }
                    if (matched.role !== 'admin' && matched.status === 'rejected') {
                        if (fbAuth) { try { await fbAuth.signOut(); } catch (e) {} }
                        errorBox.innerText = "❌ Kayıt başvurunuz yönetici tarafından onaylanmadı.";
                        errorBox.style.display = 'block';
                        return;
                    }

                    // ZAYIF ŞİFRE DENETİMİ: Şifre basitse siteye almadan önce güvenli şifre oluşturma adımına yönlendir
                    const weakCheck = isUserStoredCredentialWeak(matched, pass);
                    if (weakCheck.isWeak) {
                        errorBox.style.display = 'none';
                        openForcePasswordUpgradeStep(matched, weakCheck.reason, pass);
                        return;
                    }

                    if (!matched.passwordStrengthLevel) {
                        const evalRes = evaluatePasswordSecurity(pass, matched);
                        matched.passwordStrengthLevel = evalRes.levelLabel || 'Güçlü';
                        saveAuthUsers(users);
                    }

                    completeAuthenticatedLogin(matched);
                } else {
                    const newLockSec = recordAuthFailure(uname);
                    if (errorBox) {
                        errorBox.innerText = newLockSec > 0
                            ? `❌ Hatalı şifre! Çok sayıda deneme nedeniyle ${newLockSec} saniye güvenlik kilidi uygulandı.`
                            : "❌ Hatalı kullanıcı adı/e-posta veya şifre!";
                        errorBox.style.display = 'block';
                    }
                }
            } finally {
                isAuthLoginInProgress = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = prevBtnLabel;
                }
            }
        }

        function handleAuthLogout() {
            if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) {
                if (fbAuth) {
                    try { fbAuth.signOut().catch(() => {}); } catch (e) {}
                }
                setSession(null);
            }
        }

        async function handleUserChangePassword() {
            const currentPassEl = document.getElementById('profileCurrentPassword');
            const newPassEl = document.getElementById('profileNewPassword');
            const currentPass = (currentPassEl ? currentPassEl.value : '').trim();
            const newPass = (newPassEl ? newPassEl.value : '').trim();

            if (!currentPass || !newPass) {
                alert("Lütfen mevcut şifrenizi ve yeni şifrenizi girin.");
                return;
            }

            const activeUid = getActiveUserId();
            if (!activeUid) {
                alert("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
                return;
            }

            const users = getAuthUsers();
            const userIdx = users.findIndex(u => u.id === activeUid);
            if (userIdx === -1) {
                alert("Kullanıcı kaydı bulunamadı.");
                return;
            }

            const user = users[userIdx];
            const fbEmail = getCanonicalFbAuthEmail(user);
            let isCurrentCorrect = false;
            let fbSignedForChange = false;

            if (fbAuth && fbEmail && navigator.onLine !== false) {
                try {
                    await fbAuth.signInWithEmailAndPassword(fbEmail, currentPass);
                    isCurrentCorrect = true;
                    fbSignedForChange = true;
                } catch (fbErr) {
                    const code = (fbErr && fbErr.code) || '';
                    if (code !== 'auth/network-request-failed' && code !== 'auth/internal-error') {
                        isCurrentCorrect = false;
                    }
                }
            }

            if (!isCurrentCorrect) {
                const vaultCred = getLocalUserCred(user.id);
                const effSalt = (vaultCred && vaultCred.salt) || user.salt || '';
                const effHash = (vaultCred && vaultCred.passwordHash) || user.passwordHash || '';
                if (effHash && effSalt && (navigator.onLine === false || !fbAuth || IS_LOCAL_DEV)) {
                    const testHash = await sha256Hex(effSalt + currentPass);
                    isCurrentCorrect = (testHash === effHash);
                }
            }

            if (!isCurrentCorrect) {
                alert("❌ Mevcut şifreniz hatalı!");
                return;
            }

            if (newPass === currentPass) {
                alert("❌ Yeni şifreniz mevcut şifrenizle aynı olamaz!");
                return;
            }

            const secCheck = evaluatePasswordSecurity(newPass, user);
            if (!secCheck.isValid) {
                alert(`❌ ${secCheck.reason}`);
                return;
            }

            if (fbSignedForChange && fbAuth && fbAuth.currentUser) {
                try {
                    await fbAuth.currentUser.updatePassword(newPass);
                } catch (updErr) {
                    alert("❌ Şifre sunucuda güncellenemedi. Lütfen tekrar giriş yapıp deneyin.");
                    return;
                }
            }

            const nowMs = Date.now();
            const newSalt = generateSecureSalt();
            const newHash = await sha256Hex(newSalt + newPass);

            setLocalUserCred(user.id, {
                salt: newSalt,
                passwordHash: newHash,
                passwordStrengthLevel: secCheck.levelLabel,
                mustChangePassword: false,
                passwordUpdatedAt: nowMs
            });

            delete user.password;
            delete user.passwordHash;
            delete user.salt;
            user.mustChangePassword = false;
            user.passwordStrengthLevel = secCheck.levelLabel;
            user.passwordUpdatedAt = nowMs;
            user.updatedAt = nowMs;

            users[userIdx] = user;
            saveAuthUsers(users);

            if (currentPassEl) currentPassEl.value = '';
            if (newPassEl) newPassEl.value = '';

            playAlertSound();
            alert("✅ Güçlü şifreniz tüm cihazlarınız için başarıyla kaydedildi!");
        }

        // ADMIN PANEL
        function updateAdminPendingBadges() {
            const users = getAuthUsers();
            const pendingCount = users.filter(u => u.status === 'pending').length;

            const manageBadge = document.getElementById('adminManagePendingBadge');
            if (manageBadge) {
                if (pendingCount > 0) {
                    manageBadge.innerText = String(pendingCount);
                    manageBadge.style.display = 'inline-block';
                } else {
                    manageBadge.style.display = 'none';
                }
            }

            const roleBadge = document.getElementById('headerUserRoleBadge');
            const session = getSession();
            if (roleBadge && session && session.role === 'admin') {
                roleBadge.innerText = pendingCount > 0 ? `YÖNETİCİ (${pendingCount} ONAY)` : 'YÖNETİCİ';
            }
        }

        function renderPendingApprovalsBanner() {
            const section = document.getElementById('adminPendingApprovalsSection');
            const listEl = document.getElementById('adminPendingApprovalsList');
            const countLabel = document.getElementById('adminPendingCountLabel');
            updateAdminPendingBadges();
            if (!section || !listEl) return;

            const users = getAuthUsers();
            const pendingUsers = users.filter(u => u.status === 'pending');

            if (pendingUsers.length === 0) {
                section.style.display = 'none';
                listEl.innerHTML = '';
                return;
            }

            section.style.display = 'block';
            if (countLabel) countLabel.innerText = `${pendingUsers.length} Bekleyen Başvuru`;

            listEl.innerHTML = pendingUsers.map(u => {
                const reqDate = u.createdAt ? new Date(u.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
                return `
                    <div style="background:#F8FAFC; border:1px solid rgba(245,158,11,0.35); border-radius:9px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
                        <div>
                            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <strong style="color:#0F172A; font-size:13px;">${escapeHTML(u.name)}</strong>
                                <span style="font-size:11px; color:var(--text-secondary);">(@${escapeHTML(u.username)})</span>
                                <span style="font-size:10px; background:rgba(245,158,11,0.2); color:var(--gold); padding:1px 6px; border-radius:6px; font-weight:800;">⏳ ONAY BEKLİYOR</span>
                            </div>
                            <div style="font-size:11.5px; color:var(--cyan); margin-top:2px;">
                                ✉️ ${escapeHTML(u.email || 'E-posta belirtilmedi')}
                            </div>
                            <div style="font-size:10.5px; color:var(--text-secondary); margin-top:2px;">
                                ${escapeHTML(u.level || 'Orta Seviye')} • ${escapeHTML(u.gender || 'Erkek')} ${reqDate ? '• ' + escapeHTML(reqDate) : ''}
                            </div>
                        </div>
                        <div style="display:flex; gap:6px; flex-shrink:0;">
                            <button type="button" class="btn btn-gold" style="font-size:11px; padding:6px 10px; font-weight:800; background:#10b981; border-color:#10b981; color:#06281e;" onclick="adminApproveUser(decodeURIComponent('${encodeURIComponent(u.id)}'))">
                                ✅ Onayla & Mail Gönder
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 10px; color:#ef4444; border-color:#ef4444; font-weight:800;" onclick="adminRejectUser(decodeURIComponent('${encodeURIComponent(u.id)}'))">
                                ✕ Reddet
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function openAdminModal() {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Bu alana sadece yöneticiler erişebilir.");
                return;
            }
            if (typeof syncUsersFromCloud === 'function' && isFirebaseReady && !IS_LOCAL_DEV) {
                try { await syncUsersFromCloud(); } catch (err) {}
            }
            loadAdminEmailJsConfigUI();
            renderPendingApprovalsBanner();
            renderAdminAthleteStatuses();
            renderAdminUserList();
            switchAdminModalTab('status');
            document.getElementById('adminModal').classList.add('active');
        }

        function closeAdminModal() {
            document.getElementById('adminModal').classList.remove('active');
        }

        function switchAdminModalTab(tabKey) {
            const statusView = document.getElementById('adminViewStatus');
            const manageView = document.getElementById('adminViewManage');
            const btnStatus = document.getElementById('adminTabBtnStatus');
            const btnManage = document.getElementById('adminTabBtnManage');

            renderPendingApprovalsBanner();

            if (tabKey === 'status') {
                if (statusView) statusView.style.display = 'block';
                if (manageView) manageView.style.display = 'none';
                if (btnStatus) {
                    btnStatus.className = 'btn btn-gold';
                    btnStatus.style.color = '#000';
                }
                if (btnManage) {
                    btnManage.className = 'btn btn-outline';
                    btnManage.style.color = 'var(--text-secondary)';
                }
                renderAdminAthleteStatuses();
            } else {
                if (statusView) statusView.style.display = 'none';
                if (manageView) manageView.style.display = 'block';
                if (btnStatus) {
                    btnStatus.className = 'btn btn-outline';
                    btnStatus.style.color = 'var(--text-secondary)';
                }
                if (btnManage) {
                    btnManage.className = 'btn btn-gold';
                    btnManage.style.color = '#000';
                }
                renderAdminUserList();
            }
        }

        function selectNewAvatar(av) {
            selectedNewAvatar = av;
            document.querySelectorAll('#newAvatarPicker .avatar-choice').forEach(el => {
                el.classList.toggle('selected', el.innerText.trim() === av);
            });
        }

        async function handleCreateUser() {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Bu işlem için yönetici yetkisi gereklidir.");
                return;
            }

            const rawUname = (document.getElementById('newUsername').value || '').trim();
            const uname = normalizeAuthString(rawUname);
            const pass = (document.getElementById('newPassword').value || '').trim();
            const dname = (document.getElementById('newDisplayName').value || '').trim();
            const emailEl = document.getElementById('newEmail');
            const rawEmail = (emailEl ? emailEl.value : '').trim().toLowerCase();
            const role = document.getElementById('newRole').value;
            const level = document.getElementById('newLevel').value;
            const gender = document.getElementById('newGender').value;

            if (!uname || !pass || !dname) {
                alert("Lütfen kullanıcı adı, şifre ve ad soyad alanlarını doldurun.");
                return;
            }

            if (pass.length < 6) {
                alert("Parola en az 6 karakter olmalıdır!");
                return;
            }

            const users = getAuthUsers();
            if (users.some(u => normalizeAuthString(u.username) === uname)) {
                alert("Bu kullanıcı adı zaten kullanımda!");
                return;
            }

            const nowMs = Date.now();
            const salt = generateSecureSalt();
            const passHash = await sha256Hex(salt + pass);
            const secCheck = evaluatePasswordSecurity(pass, { username: uname, name: dname, email: rawEmail });
            let assignedId = 'usr_' + nowMs;
            const fbEmailForNew = rawEmail || `${assignedId}@auth.celikkodu.app`;

            const secAuth = getSecondaryFirebaseAuth();
            if (secAuth && navigator.onLine !== false) {
                try {
                    const cred = await secAuth.createUserWithEmailAndPassword(fbEmailForNew, pass);
                    if (cred && cred.user && cred.user.uid) {
                        const cleanFbUid = String(cred.user.uid).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
                        if (cleanFbUid) assignedId = 'usr_' + cleanFbUid;
                    }
                    await secAuth.signOut().catch(() => {});
                } catch (fbCreateErr) {
                    if (fbCreateErr && fbCreateErr.code === 'auth/email-already-in-use') {
                        alert("Bu e-posta adresi zaten başka bir hesapta kayıtlı!");
                        return;
                    }
                }
            }

            setLocalUserCred(assignedId, {
                salt,
                passwordHash: passHash,
                passwordStrengthLevel: secCheck.levelLabel,
                mustChangePassword: !secCheck.isValid,
                passwordUpdatedAt: nowMs
            });

            const newUser = {
                id: assignedId,
                username: uname,
                fbAuthEmail: fbEmailForNew,
                mustChangePassword: !secCheck.isValid,
                passwordStrengthLevel: secCheck.levelLabel,
                passwordUpdatedAt: nowMs,
                role: role,
                status: 'approved',
                name: dname,
                avatar: selectedNewAvatar,
                theme: role === 'admin' ? 'gold' : 'cyan',
                level: level,
                gender: gender,
                weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
                createdAt: nowMs,
                updatedAt: nowMs
            };
            if (rawEmail) newUser.email = rawEmail;

            users.push(newUser);
            saveAuthUsers(users);

            document.getElementById('newUsername').value = "";
            document.getElementById('newPassword').value = "123456";
            document.getElementById('newDisplayName').value = "";
            if (emailEl) emailEl.value = "";

            renderPendingApprovalsBanner();
            renderAdminUserList();
            renderAdminAthleteStatuses();
            alert(`✅ ${dname} (@${uname}) başarıyla oluşturuldu!\n🔑 Belirlenen Şifre: ${pass}`);
        }

        function adminApproveUser(userId) {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Bu işlem için yönetici yetkisi gereklidir.");
                return;
            }
            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) return;

            target.status = 'approved';
            target.approvedAt = Date.now();
            target.updatedAt = Date.now();
            saveAuthUsers(users);

            renderPendingApprovalsBanner();
            renderAdminUserList();
            renderAdminAthleteStatuses();

            openApprovalEmailDispatchModal(target);
        }

        function adminRejectUser(userId) {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Bu işlem için yönetici yetkisi gereklidir.");
                return;
            }
            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) return;

            if (confirm(`${target.name} (@${target.username}) adlı kullanıcının kayıt başvurusunu reddedip silmek istediğinize emin misiniz?`)) {
                const updated = users.filter(u => u.id !== userId);
                saveAuthUsers(updated);
                renderPendingApprovalsBanner();
                renderAdminUserList();
                renderAdminAthleteStatuses();
            }
        }

        let lastApprovalMessageCache = '';

        function buildApprovalEmailPayload(user) {
            const appUrl = (window.location.origin && window.location.origin !== 'null' && !IS_LOCAL_DEV)
                ? (window.location.origin + window.location.pathname)
                : 'https://fitness.kantarci.io/';
            const subject = '✅ Çelik Kodu | Hesabınız Onaylandı - Giriş Yapabilirsiniz';
            const body = [
                `Merhaba ${user.name},`,
                ``,
                `Çelik Kodu Akıllı Antrenman Portalı üyelik başvurunuz yönetici tarafından onaylanmıştır!`,
                ``,
                `🔑 Giriş Bilgileriniz:`,
                `• Giriş Adresi: ${appUrl}`,
                `• E-Posta / Kullanıcı Adı: ${user.email || user.username} (@${user.username})`,
                `• Şifre: Kayıt olurken belirlediğiniz şifreniz`,
                ``,
                `Hemen giriş yaparak antrenman programınızı oluşturabilir ve seanslarınızı takip edebilirsiniz.`,
                ``,
                `Çelik Kodu Performans Sistemi`
            ].join('\n');
            return { to: user.email || '', subject, body, appUrl };
        }

        async function openApprovalEmailDispatchModal(user) {
            const modal = document.getElementById('approvalEmailDispatchModal');
            if (!modal || !user) return;

            const payload = buildApprovalEmailPayload(user);
            lastApprovalMessageCache = payload.body;

            const nameEl = document.getElementById('approvalModalUserName');
            const emailEl = document.getElementById('approvalModalUserEmail');
            const subjEl = document.getElementById('approvalModalSubject');
            const bodyEl = document.getElementById('approvalModalBodyPreview');
            const mailtoBtn = document.getElementById('approvalModalMailtoBtn');
            const gmailBtn = document.getElementById('approvalModalGmailBtn');
            const autoStatusEl = document.getElementById('approvalModalAutoStatus');

            if (nameEl) nameEl.innerText = `${user.name} (@${user.username})`;
            if (emailEl) emailEl.innerText = payload.to || 'E-posta kayıtlı değil';
            if (subjEl) subjEl.innerText = payload.subject;
            if (bodyEl) bodyEl.innerText = payload.body;

            const encTo = encodeURIComponent(payload.to);
            const encSubj = encodeURIComponent(payload.subject);
            const encBody = encodeURIComponent(payload.body);

            if (mailtoBtn) {
                mailtoBtn.href = `mailto:${encTo}?subject=${encSubj}&body=${encBody}`;
                mailtoBtn.style.display = payload.to ? 'block' : 'none';
            }
            if (gmailBtn) {
                gmailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubj}&body=${encBody}`;
                gmailBtn.style.display = payload.to ? 'block' : 'none';
            }

            if (autoStatusEl) {
                autoStatusEl.style.display = 'none';
                autoStatusEl.innerText = '';
            }

            modal.classList.add('active');

            // Otomatik EmailJS yapılandırılmışsa arka planda anında gönder
            if (payload.to) {
                const cfg = getAdminEmailJsConfig();
                if (cfg && cfg.serviceId && cfg.templateId && cfg.publicKey) {
                    if (autoStatusEl) {
                        autoStatusEl.style.display = 'block';
                        autoStatusEl.style.background = 'rgba(56,189,248,0.12)';
                        autoStatusEl.style.color = '#0369A1';
                        autoStatusEl.innerText = '⏳ Otomatik onay e-postası gönderiliyor...';
                    }
                    try {
                        const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                service_id: cfg.serviceId,
                                template_id: cfg.templateId,
                                user_id: cfg.publicKey,
                                template_params: {
                                    to_email: payload.to,
                                    to_name: user.name,
                                    username: user.username,
                                    subject: payload.subject,
                                    message: payload.body,
                                    app_url: payload.appUrl
                                }
                            })
                        });
                        if (resp.ok && autoStatusEl) {
                            autoStatusEl.style.background = 'rgba(16,185,129,0.18)';
                            autoStatusEl.style.color = '#047857';
                            autoStatusEl.innerText = `🚀 Otomatik onay e-postası (${payload.to}) adresine başarıyla gönderildi!`;
                        } else if (autoStatusEl) {
                            autoStatusEl.style.background = 'rgba(245,158,11,0.18)';
                            autoStatusEl.style.color = '#92400E';
                            autoStatusEl.innerText = '⚠️ Otomatik servis yanıt vermedi; aşağıdaki butonlarla tek tıkla gönderebilirsiniz.';
                        }
                    } catch (err) {
                        if (autoStatusEl) {
                            autoStatusEl.style.background = 'rgba(245,158,11,0.18)';
                            autoStatusEl.style.color = '#92400E';
                            autoStatusEl.innerText = '⚠️ Otomatik gönderim yapılamadı; aşağıdaki butonlarla tek tıkla gönderebilirsiniz.';
                        }
                    }
                }
            }
        }

        function openApprovalEmailDispatchById(userId) {
            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (target) openApprovalEmailDispatchModal(target);
        }

        function closeApprovalEmailModal() {
            const modal = document.getElementById('approvalEmailDispatchModal');
            if (modal) modal.classList.remove('active');
        }

        function copyApprovalMessageToClipboard() {
            if (!lastApprovalMessageCache) return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(lastApprovalMessageCache).then(() => {
                    alert("📋 Onay mesajı panoya kopyalandı!");
                });
            }
        }

        function toggleAdminEmailConfigAccordion() {
            const body = document.getElementById('adminEmailConfigBody');
            const label = document.getElementById('adminEmailConfigToggleLabel');
            if (!body || !label) return;
            const isHidden = body.style.display === 'none' || !body.style.display;
            body.style.display = isHidden ? 'block' : 'none';
            label.innerText = isHidden ? '▲ Gizle' : '▼ Göster';
        }

        function getAdminEmailJsConfig() {
            try {
                const raw = localStorage.getItem('celik_kodu_emailjs_config');
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        }

        function loadAdminEmailJsConfigUI() {
            const cfg = getAdminEmailJsConfig() || {};
            const sEl = document.getElementById('emailJsServiceId');
            const tEl = document.getElementById('emailJsTemplateId');
            const kEl = document.getElementById('emailJsPublicKey');
            if (sEl) sEl.value = cfg.serviceId || '';
            if (tEl) tEl.value = cfg.templateId || '';
            if (kEl) kEl.value = cfg.publicKey || '';
        }

        function saveAdminEmailJsConfig() {
            const sEl = document.getElementById('emailJsServiceId');
            const tEl = document.getElementById('emailJsTemplateId');
            const kEl = document.getElementById('emailJsPublicKey');
            const cfg = {
                serviceId: (sEl ? sEl.value : '').trim(),
                templateId: (tEl ? tEl.value : '').trim(),
                publicKey: (kEl ? kEl.value : '').trim()
            };
            localStorage.setItem('celik_kodu_emailjs_config', JSON.stringify(cfg));
            alert("✅ Otomatik e-posta (EmailJS) ayarları yerel olarak kaydedildi!");
        }

        function renderAdminAthleteStatuses() {
            const container = document.getElementById('adminAthleteStatusContainer');
            const kpisEl = document.getElementById('adminSummaryKpis');
            if (!container) return;

            const users = getAuthUsers();
            let totalWorkoutsAll = 0;
            let totalTonajAll = 0;
            let activeAthletesCount = 0;

            const cardsHTML = users.map(u => {
                const logs = getUserLogsById(u.id);
                const streak = calculateStreakForLogs(logs);
                const sessionCount = logs.length;
                if (sessionCount > 0) activeAthletesCount++;

                let userTonaj = 0;
                logs.forEach(l => {
                    userTonaj += (parseFloat(l.totalVolumeKg) || 0);
                });
                totalWorkoutsAll += sessionCount;
                totalTonajAll += userTonaj;

                const lastLog = logs.length > 0 ? logs[0] : null;
                const activeStateRaw = localStorage.getItem(`celik_kodu_active_state_${u.id}`);
                const isLiveWorking = !!activeStateRaw;
                const w = u.weights || {};

                // Exercise details for the latest workout
                let lastLogDetailsHTML = '';
                if (lastLog) {
                    const exList = lastLog.exercises || lastLog.detailedExercises || [];
                    lastLogDetailsHTML = `
                        <div id="adminExDetails_${u.id}" style="display:none; margin-top:10px; padding:10px 12px; background:#F8FAFC; border-radius:8px; border:1px solid rgba(245,158,11,0.25);">
                            <div style="font-size:11px; font-weight:800; color:var(--gold); margin-bottom:8px; text-transform:uppercase; display:flex; justify-content:space-between;">
                                <span>📋 ${escapeHTML(lastLog.title)}</span>
                                <span style="color:#0F172A;">${lastLog.dateFormatted || lastLog.date}</span>
                            </div>
                            ${exList.length > 0 ? `
                                <div style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto; padding-right:4px;">
                                    ${exList.map(ex => {
                                        const sets = (ex.sets || []).filter(s => s.completed || (parseFloat(s.weight) > 0));
                                        const setsStr = sets.length > 0
                                            ? sets.map((s, idx) => `Set ${idx+1}: <strong style="color:var(--gold);">${s.weight}kg</strong> x ${s.reps}`).join(' • ')
                                            : '<span style="color:var(--text-secondary);">Set kaydı yok</span>';
                                        return `
                                            <div style="font-size:11px; padding:6px 8px; background:#F1F5F9; border-radius:6px; border-left:3px solid var(--gold);">
                                                <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                                                    <strong style="color:#0F172A;">${escapeHTML(ex.name)}</strong>
                                                    ${ex.muscle ? `<span style="font-size:10px; color:var(--cyan);">[${escapeHTML(ex.muscle)}]</span>` : ''}
                                                </div>
                                                <div style="font-size:10.5px; color:var(--text-secondary);">${setsStr}</div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : '<div style="font-size:11px; color:var(--text-secondary);">Detaylı set kaydı bulunamadı.</div>'}
                        </div>
                    `;
                }

                return `
                    <div style="background:var(--bg-surface); border:1px solid #E2E8F0; border-radius:12px; padding:14px; margin-bottom:12px; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                        <!-- ATHLETE HEADER -->
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:26px; width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:var(--bg-elevated); border-radius:10px; border:1px solid var(--gold);">${u.avatar || '🥋'}</span>
                                <div>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <strong style="color:#0F172A; font-size:14px;">${escapeHTML(u.name)}</strong>
                                        <span style="font-size:11px; color:var(--text-secondary);">@${escapeHTML(u.username)}</span>
                                        <span class="auth-role-tag ${u.role === 'admin' ? 'role-admin' : 'role-athlete'}" style="font-size:9px; padding:2px 6px;">
                                            ${u.role === 'admin' ? 'YÖNETİCİ' : 'SPORCU'}
                                        </span>
                                    </div>
                                    <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                        ${escapeHTML(u.level || 'Orta Seviye')} • ${escapeHTML(u.gender || 'Erkek')}
                                    </div>
                                </div>
                            </div>
                            ${isLiveWorking ? `
                                <span style="background:rgba(34,197,94,0.15); border:1px solid var(--green-success); color:var(--green-success); font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px; display:flex; align-items:center; gap:5px;">
                                    <span style="width:6px; height:6px; border-radius:50%; background:var(--green-success); display:inline-block;"></span>
                                    Antrenmanda
                                </span>
                            ` : ''}
                        </div>

                        <!-- 3-COL KPI STATS -->
                        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:10px; text-align:center;">
                            <div style="background:var(--bg-card); padding:8px 4px; border-radius:8px; border:1px solid #E2E8F0;">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">TOPLAM SEANS</div>
                                <div style="font-size:13px; font-weight:800; color:#0F172A; margin-top:2px;">🏋️ ${sessionCount} Seans</div>
                            </div>
                            <div style="background:var(--bg-card); padding:8px 4px; border-radius:8px; border:1px solid #E2E8F0;">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">SERİ DURUMU</div>
                                <div style="font-size:13px; font-weight:800; color:var(--gold); margin-top:2px;">🔥 ${streak} Gün</div>
                            </div>
                            <div style="background:var(--bg-card); padding:8px 4px; border-radius:8px; border:1px solid #E2E8F0;">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                                <div style="font-size:13px; font-weight:800; color:var(--cyan); margin-top:2px;">⚡ ${Math.round(userTonaj).toLocaleString('tr-TR')} kg</div>
                            </div>
                        </div>

                        <!-- LAST WORKOUT PREVIEW -->
                        <div style="background:var(--bg-card); border-radius:8px; padding:10px 12px; border:1px solid #E2E8F0; font-size:11.5px; margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <span style="font-weight:700; color:var(--gold);">Son Antrenman Seansı:</span>
                                <span style="color:var(--text-secondary); font-size:10.5px;">
                                    ${lastLog ? (lastLog.dateFormatted || lastLog.date) : 'Kayıt Yok'}
                                </span>
                            </div>
                            ${lastLog ? `
                                <div style="color:#0F172A; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
                                    <span>${escapeHTML(lastLog.title)}</span>
                                    <span style="color:#0F172A; font-size:11px;">⏱️ ${lastLog.duration || 0} dk • ${lastLog.totalSetsCompleted || 0} Set</span>
                                </div>
                            ` : `
                                <div style="color:var(--text-secondary); font-style:italic;">Henüz tamamlanmış antrenman seansı bulunmuyor.</div>
                            `}
                        </div>

                        <!-- TOGGLE LAST WORKOUT DETAILS BUTTON -->
                        ${lastLog ? `
                            <button class="btn btn-outline" style="width:100%; font-size:11px; padding:7px; border-color:rgba(245,158,11,0.4); color:var(--gold);" onclick="toggleAdminAthleteDetails('${u.id}')">
                                🔍 Son Antrenman Hareket ve Set Detaylarını İncele
                            </button>
                            ${lastLogDetailsHTML}
                        ` : ''}
                    </div>
                `;
            }).join('');

            if (kpisEl) {
                kpisEl.innerHTML = `
                    <div style="background:var(--bg-surface); padding:8px 6px; border-radius:8px; border:1px solid #E2E8F0; text-align:center;">
                        <div style="font-size:9px; color:var(--text-secondary); font-weight:700;">KAYITLI SPORCU</div>
                        <div style="font-size:14px; font-weight:900; color:var(--gold); margin-top:2px;">👥 ${users.length}</div>
                    </div>
                    <div style="background:var(--bg-surface); padding:8px 6px; border-radius:8px; border:1px solid #E2E8F0; text-align:center;">
                        <div style="font-size:9px; color:var(--text-secondary); font-weight:700;">TOPLAM SEANS</div>
                        <div style="font-size:14px; font-weight:900; color:var(--green-success); margin-top:2px;">✅ ${totalWorkoutsAll}</div>
                    </div>
                    <div style="background:var(--bg-surface); padding:8px 6px; border-radius:8px; border:1px solid #E2E8F0; text-align:center;">
                        <div style="font-size:9px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                        <div style="font-size:14px; font-weight:900; color:var(--cyan); margin-top:2px;">⚡ ${Math.round(totalTonajAll).toLocaleString('tr-TR')} kg</div>
                    </div>
                `;
            }

            container.innerHTML = cardsHTML;
        }

        function toggleAdminAthleteDetails(uid) {
            const el = document.getElementById(`adminExDetails_${uid}`);
            if (el) {
                const isHidden = el.style.display === 'none' || !el.style.display;
                el.style.display = isHidden ? 'block' : 'none';
            }
        }

        function renderAdminUserList() {
            const container = document.getElementById('adminUserListContainer');
            if (!container) return;

            const users = getAuthUsers();
            const session = getSession();

            container.innerHTML = users.map(u => {
                const logs = getUserLogsById(u.id);
                const streak = calculateStreakForLogs(logs);
                const isSelf = session && session.userId === u.id;
                const isPending = u.status === 'pending';
                const safeIdAttr = encodeURIComponent(u.id);

                return `
                    <div class="admin-user-card" style="background:var(--bg-surface); border:1px solid ${isSelf ? 'var(--gold)' : (isPending ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)')}; border-radius:10px; padding:12px; margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px; flex-wrap:wrap;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:22px;">${u.avatar || '🥋'}</span>
                                <div>
                                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                        <strong style="color:#0F172A; font-size:13px;">${escapeHTML(u.name)}</strong>
                                        <span style="font-size:11.5px; color:#15803D; font-weight:800;">(@${escapeHTML(u.username)})</span>
                                        ${isSelf ? '<span class="auth-role-tag role-admin" style="font-size:9px; padding:1px 6px;">GİRİŞ YAPILAN HESAP</span>' : ''}
                                        ${!isSelf ? (isPending
                                            ? '<span style="font-size:9.5px; background:rgba(245,158,11,0.2); color:var(--gold); padding:1px 6px; border-radius:6px; font-weight:800;">⏳ ONAY BEKLİYOR</span>'
                                            : '<span style="font-size:9.5px; background:rgba(16,185,129,0.15); color:#10b981; padding:1px 6px; border-radius:6px; font-weight:800;">✅ ONAYLI</span>') : ''}
                                    </div>
                                    ${u.email ? `<div style="font-size:11px; color:var(--cyan); margin-top:2px;">✉️ ${escapeHTML(u.email)}</div>` : ''}
                                    <div style="font-size:11px; color:var(--text-secondary);">
                                        ${escapeHTML(u.level || 'Orta Seviye')} • ${escapeHTML(u.gender || 'Erkek')}
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex; gap:6px; flex-wrap:wrap;">
                                ${!isSelf && isPending ? `
                                    <button class="btn btn-gold" style="font-size:10px; padding:4px 8px; background:#10b981; border-color:#10b981; color:#06281e; font-weight:800;" onclick="adminApproveUser(decodeURIComponent('${safeIdAttr}'))">
                                        ✅ Onayla & Mail
                                    </button>
                                ` : (!isSelf && u.email ? `
                                    <button class="btn btn-outline" style="font-size:10px; padding:4px 8px; color:var(--cyan); border-color:var(--cyan);" onclick="openApprovalEmailDispatchById(decodeURIComponent('${safeIdAttr}'))" title="Onay E-Postasını Gönder">
                                        📧 Mail Gönder
                                    </button>
                                ` : '')}
                                <button class="btn btn-outline" style="font-size:10px; padding:4px 8px; color:#0F172A; border-color:#CBD5E1; font-weight:800;" onclick="toggleAdminEditUserBox(decodeURIComponent('${safeIdAttr}'))" title="Kullanıcı Adı, Ad Soyad ve E-Posta Düzenle">
                                    ✏️ Kullanıcı Adı
                                </button>
                                <button class="btn btn-outline" style="font-size:10px; padding:4px 8px; color:var(--gold); border-color:var(--gold);" onclick="adminResetUserPassword(decodeURIComponent('${safeIdAttr}'))" title="Şifre Belirle / Sıfırla">
                                    🔑 Şifre
                                </button>
                                ${!isSelf ? `
                                    <button class="btn btn-outline" style="font-size:10px; padding:4px 8px; color:#ef4444; border-color:#ef4444;" onclick="adminDeleteUser(decodeURIComponent('${safeIdAttr}'))" title="Kullanıcıyı Sil">
                                        🗑️ Sil
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- INLINE KULLANICI ADI / AD SOYAD / E-POSTA DÜZENLEME PANELİ (VARSAYILAN KAPALI) -->
                        <div id="adminEditBox_${escapeHTML(u.id)}" style="display:none; margin-top:8px; padding:10px; background:#F8FAFC; border:1.5px solid #CBD5E1; border-radius:8px;">
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                                <div>
                                    <label class="form-label" style="font-size:10.5px; color:#334155;">Yeni Kullanıcı Adı (@)</label>
                                    <input type="text" id="adminEditUname_${escapeHTML(u.id)}" class="form-input" value="${escapeHTML(u.username || '')}" style="font-size:12px; padding:6px 8px;" autocapitalize="none" spellcheck="false">
                                </div>
                                <div>
                                    <label class="form-label" style="font-size:10.5px; color:#334155;">Ad Soyad</label>
                                    <input type="text" id="adminEditName_${escapeHTML(u.id)}" class="form-input" value="${escapeHTML(u.name || '')}" style="font-size:12px; padding:6px 8px;">
                                </div>
                            </div>
                            <div style="margin-bottom:8px;">
                                <label class="form-label" style="font-size:10.5px; color:#334155;">E-Posta Adresi</label>
                                <input type="email" id="adminEditEmail_${escapeHTML(u.id)}" class="form-input" value="${escapeHTML(u.email || '')}" placeholder="ornek@gmail.com" style="font-size:12px; padding:6px 8px;" autocapitalize="none" spellcheck="false">
                            </div>
                            <div style="display:flex; justify-content:flex-end; gap:6px;">
                                <button type="button" class="btn btn-outline" style="font-size:11px; padding:5px 10px;" onclick="toggleAdminEditUserBox(decodeURIComponent('${safeIdAttr}'))">Vazgeç</button>
                                <button type="button" class="btn btn-gold" style="font-size:11px; padding:5px 12px; font-weight:800;" onclick="adminSaveUserIdentity(decodeURIComponent('${safeIdAttr}'))">💾 Değişiklikleri Kaydet</button>
                            </div>
                        </div>

                        <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between; border-top:1px solid #E2E8F0; padding-top:6px; margin-top:6px;">
                            <span>Güvenlik: <span style="color:#10B981; font-weight:700;">🔒 Salted SHA-256</span></span>
                            <span>${logs.length} Seans • Seri: ${streak} Gün</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function toggleAdminEditUserBox(userId) {
            const box = document.getElementById(`adminEditBox_${userId}`);
            if (!box) return;
            const isHidden = box.style.display === 'none' || !box.style.display;
            box.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                const input = document.getElementById(`adminEditUname_${userId}`);
                if (input) input.focus();
            }
        }

        function adminSaveUserIdentity(userId) {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Yalnızca yöneticiler kullanıcı bilgilerini düzenleyebilir.");
                return;
            }

            const unameEl = document.getElementById(`adminEditUname_${userId}`);
            const nameEl = document.getElementById(`adminEditName_${userId}`);
            const emailEl = document.getElementById(`adminEditEmail_${userId}`);

            const rawUname = (unameEl ? unameEl.value : '').trim();
            const newUname = normalizeAuthString(rawUname);
            const newName = (nameEl ? nameEl.value : '').trim();
            const newEmail = (emailEl ? emailEl.value : '').trim().toLowerCase();

            if (!newUname || !newName) {
                alert("❌ Kullanıcı adı ve Ad Soyad boş bırakılamaz!");
                return;
            }

            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) {
                alert("Kullanıcı bulunamadı.");
                return;
            }

            const duplicateUname = users.some(u => u.id !== userId && normalizeAuthString(u.username) === newUname);
            if (duplicateUname) {
                alert(`❌ "@${newUname}" kullanıcı adı başka bir hesapta zaten kullanılıyor!`);
                return;
            }

            if (newEmail) {
                const duplicateEmail = users.some(u => u.id !== userId && u.email && u.email.toLowerCase() === newEmail);
                if (duplicateEmail) {
                    alert(`❌ "${newEmail}" e-posta adresi başka bir hesapta zaten kullanılıyor!`);
                    return;
                }
            }

            const oldUname = target.username;
            target.username = newUname;
            target.name = newName;
            target.updatedAt = Date.now();
            if (newEmail) {
                target.email = newEmail;
            } else {
                delete target.email;
            }

            if (Array.isArray(target.aliases) && !target.aliases.includes(newUname)) {
                target.aliases.push(newUname);
            }

            saveAuthUsers(users);

            if (session.userId === userId) {
                session.username = newUname;
                session.name = newName;
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
                applyActiveUserProfile();
            }

            renderPendingApprovalsBanner();
            renderAdminUserList();
            renderAdminAthleteStatuses();
            alert(`✅ Kullanıcı bilgileri güncellendi!\n• Kullanıcı Adı: @${oldUname} ➔ @${newUname}\n• Ad Soyad: ${newName}`);
        }

        async function adminResetUserPassword(userId) {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Yalnızca yöneticiler şifre sıfırlayabilir.");
                return;
            }
            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) {
                alert("Kullanıcı bulunamadı.");
                return;
            }
            const fbEmail = getCanonicalFbAuthEmail(target);
            if (session.userId !== userId && fbAuth && fbEmail && !fbEmail.endsWith('@auth.celikkodu.app') && navigator.onLine !== false) {
                const sendLink = confirm(`@${target.username} (${fbEmail}) adresine resmi şifre sıfırlama bağlantısı gönderilsin mi?\n\nTamam: E-postaya sıfırlama bağlantısı gönderir\nİptal: Bu cihaz için geçici şifre tanımlar`);
                if (sendLink) {
                    try {
                        await fbAuth.sendPasswordResetEmail(fbEmail);
                        alert(`📩 Şifre sıfırlama bağlantısı (${fbEmail}) adresine gönderildi.`);
                        return;
                    } catch (e) {}
                }
            }

            const newPass = prompt(`@${target.username} (${target.name}) için yeni şifre belirleyin (en az 6 karakter):`, "123456");
            if (!newPass) return;
            const cleanPass = newPass.trim();
            if (cleanPass.length < 6) {
                alert("Parola en az 6 karakter olmalıdır!");
                return;
            }
            if (session.userId === userId && fbAuth && fbAuth.currentUser && navigator.onLine !== false) {
                try {
                    await fbAuth.currentUser.updatePassword(cleanPass);
                } catch (e) {}
            }
            const nowMs = Date.now();
            const salt = generateSecureSalt();
            const passHash = await sha256Hex(salt + cleanPass);
            const secCheck = evaluatePasswordSecurity(cleanPass, target);
            setLocalUserCred(target.id, {
                salt,
                passwordHash: passHash,
                passwordStrengthLevel: secCheck.levelLabel,
                mustChangePassword: !secCheck.isValid,
                passwordUpdatedAt: nowMs
            });
            delete target.password;
            delete target.passwordHash;
            delete target.salt;
            target.mustChangePassword = !secCheck.isValid;
            target.passwordStrengthLevel = secCheck.levelLabel;
            target.passwordUpdatedAt = nowMs;
            target.updatedAt = nowMs;
            saveAuthUsers(users);
            renderAdminUserList();
            const noteMsg = secCheck.isValid
                ? 'Güçlü şifre tanımlandı.'
                : 'Geçici şifre tanımlandı; kullanıcı ilk girişte güvenli şifre oluşturmaya yönlendirilecek.';
            alert(`✅ @${target.username} kullanıcısının şifresi "${cleanPass}" olarak güncellendi.\nℹ️ ${noteMsg}`);
        }

        function adminSwitchToUser(targetUserId) {
            alert("Güvenlik nedeniyle hesaplar arası geçiş devre dışı bırakılmıştır.");
        }

        function adminDeleteUser(userId) {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Bu işlem için yönetici yetkisi gereklidir.");
                return;
            }

            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) return;

            if (confirm(`@${target.username} (${target.name}) kullanıcısını silmek istediğinize emin misiniz?`)) {
                localStorage.removeItem(`celik_kodu_history_${userId}`);
                localStorage.removeItem(`celik_kodu_custom_programs_${userId}`);
                localStorage.removeItem(`celik_kodu_deleted_programs_${userId}`);
                localStorage.removeItem(`celik_kodu_mobility_tests_${userId}`);
                localStorage.removeItem(`celik_excluded_exercises_${userId}`);
                localStorage.removeItem(`celik_excluded_updated_at_${userId}`);
                localStorage.removeItem(`celik_kodu_last_generated_workout_${userId}`);
                localStorage.removeItem(`celik_kodu_state_updated_at_${userId}`);
                localStorage.removeItem(`celik_kodu_pending_state_sync_${userId}`);
                localStorage.removeItem(`celik_kodu_active_state_${userId}`);
                const updated = users.filter(u => u.id !== userId);
                saveAuthUsers(updated);
                renderAdminUserList();
                renderAdminAthleteStatuses();
            }
        }

        // PROFILE & THEME SETTINGS
        function applyTheme(themeKey) {
            const theme = THEMES[themeKey] || THEMES.gold;
            document.documentElement.style.setProperty('--gold', theme.gold);
            document.documentElement.style.setProperty('--gold-light', theme.goldLight);
            document.documentElement.style.setProperty('--gold-glow', theme.glow);
        }

        function selectAvatar(avatar) {
            selectedAvatar = avatar;
            document.querySelectorAll('#avatarPicker .avatar-choice').forEach(el => {
                el.classList.toggle('selected', el.innerText.trim() === avatar);
            });
        }

        function selectTheme(themeKey) {
            selectedTheme = themeKey;
            document.querySelectorAll('#themePicker .theme-pill').forEach(el => {
                const isSelected = el.getAttribute('onclick') && el.getAttribute('onclick').includes(themeKey);
                el.classList.toggle('selected', isSelected);
            });
            applyTheme(themeKey);
        }

        function toggleProfileCustomizationDrawer() {
            const drawer = document.getElementById('profileCustomizationDrawer');
            const arrow = document.getElementById('profileEditToggleArrow');
            const btn = document.getElementById('profileEditToggleBtn');
            if (!drawer) return;
            const isOpen = drawer.style.display !== 'none';
            drawer.style.display = isOpen ? 'none' : 'block';
            if (arrow) arrow.textContent = isOpen ? '▼ Göster' : '▲ Gizle';
            if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
        }

        function applyActiveUserProfile() {
            const user = getActiveUser();
            if (!user) return;

            applyTheme(user.theme || 'gold');

            const cleanShortName = String(user.name || 'Sporcu').replace(/\s*\([^)]*\)\s*/g, '').trim() || 'Sporcu';
            const headerAvatar = document.getElementById('headerUserAvatar');
            if (headerAvatar) {
                headerAvatar.innerText = cleanShortName.charAt(0).toUpperCase();
                headerAvatar.style.display = 'inline-flex';
            }
            const headerName = document.getElementById('headerUserName');
            if (headerName) headerName.innerText = escapeHTML(cleanShortName);

            const cardAvatar = document.getElementById('profileCardAvatar');
            if (cardAvatar) cardAvatar.innerText = cleanShortName.charAt(0).toUpperCase();
            const cardName = document.getElementById('profileCardName');
            if (cardName) cardName.innerText = escapeHTML(cleanShortName);
            const cardMeta = document.getElementById('profileCardMeta');
            if (cardMeta) cardMeta.innerText = `${user.level || 'Orta Seviye'} • Sporcu Profili`;

            const nameInput = document.getElementById('editUserName');
            if (nameInput) nameInput.value = user.name || '';
            const levelSelect = document.getElementById('editUserLevel');
            if (levelSelect) levelSelect.value = user.level || 'Orta Seviye';
            const genderSelect = document.getElementById('editUserGender');
            if (genderSelect) genderSelect.value = user.gender || 'Erkek';

            selectAvatar(user.avatar || '🥋');
            selectTheme(user.theme || 'gold');

            if (typeof updateProfileGeminiStatusUI === 'function') {
                updateProfileGeminiStatusUI();
            }

            renderHistory();
        }

        function saveCurrentProfile() {
            const user = getActiveUser();
            const nameInput = document.getElementById('editUserName');
            const newName = nameInput.value.trim() || 'Sporcu';

            user.name = newName;
            user.avatar = selectedAvatar;
            user.theme = selectedTheme;
            user.level = document.getElementById('editUserLevel').value;
            user.gender = document.getElementById('editUserGender').value;

            const geminiInput = document.getElementById('profileGeminiApiKeyInput');
            if (geminiInput && user.role === 'admin') {
                const gKey = geminiInput.value.trim();
                setGeminiApiKey(gKey, true);
                user.geminiApiKey = gKey;
            }

            const users = getAuthUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) users[idx] = user;
            saveAuthUsers(users);
            if (typeof syncUsersToCloud === 'function') syncUsersToCloud(users);

            const session = getSession();
            if (session && session.userId === user.id) {
                session.name = newName;
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
            }

            applyActiveUserProfile();
            playAlertSound();
            alert("✅ Profil değişiklikleriniz başarıyla kaydedildi!");
        }

