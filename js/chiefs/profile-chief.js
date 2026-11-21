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

        let _firebaseInitialAuthResolved = false;
        let _bootCloudSyncTriggered = false;
        let _cloudSyncLastIssue = null;

        function updateCloudSyncBadge(status, text) {
            const esc = (typeof escapeHTML === 'function')
                ? escapeHTML
                : (v) => String(v || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
            const badges = document.querySelectorAll('.cloud-sync-badge');
            badges.forEach(badge => {
                badge.className = 'cloud-sync-badge ' + (status || '');
                if (status === 'synced') {
                    badge.innerHTML = `<span class="cloud-sync-dot" aria-hidden="true"></span><span>${esc(text || 'Bulut Aktif')}</span>`;
                    badge.title = "Firebase bulut veritabanı canlı ve eşitlenmiş durumda";
                } else if (status === 'syncing') {
                    badge.innerHTML = `<span class="cloud-sync-dot" aria-hidden="true"></span><span>${esc(text || 'Eşitleniyor...')}</span>`;
                    badge.title = "Veriler Firebase bulutuna aktarılıyor...";
                } else if (status === 'auth-required') {
                    badge.innerHTML = `<span class="cloud-sync-dot" aria-hidden="true"></span><span>${esc(text || 'Bulut Girişi Gerekli')}</span>`;
                    badge.title = "Bulut eşitlemesini yenilemek için dokunup şifrenizle giriş yapın";
                } else {
                    badge.innerHTML = `<span class="cloud-sync-dot" aria-hidden="true"></span><span>${esc(text || 'Yerel Önbellek')}</span>`;
                    badge.title = "Çevrimdışı mod: Veriler cihazda güvende, internet gelince eşitlenecek";
                }
            });
            if (typeof document !== 'undefined') {
                const reauthBtn = document.getElementById('headerReauthCloudBtn');
                if (reauthBtn) reauthBtn.style.display = (status === 'auth-required') ? 'flex' : 'none';
                const profileBanner = document.getElementById('profileCloudAuthBanner');
                if (profileBanner) profileBanner.style.display = (status === 'auth-required') ? 'flex' : 'none';
            }
        }

        function reauthToLoginScreenPreservingLocalData() {
            const prevSess = typeof getSession === 'function' ? getSession() : null;
            const prefillIdent = (prevSess && (prevSess.username || prevSess.name)) ? String(prevSess.username || prevSess.name) : '';
            if (typeof fbAuth !== 'undefined' && fbAuth) {
                try { fbAuth.signOut().catch(() => {}); } catch {}
            }
            if (typeof setSession === 'function') {
                setSession(null);
            }
            if (typeof switchAuthScreenTab === 'function') {
                switchAuthScreenTab('login');
            }
            if (typeof document !== 'undefined') {
                const uEl = document.getElementById('loginUsername');
                const pEl = document.getElementById('loginPassword');
                const errEl = document.getElementById('loginErrorMsg');
                if (uEl && prefillIdent) uEl.value = prefillIdent;
                if (errEl) {
                    errEl.innerText = 'Bulut senkronizasyonunu açmak için şifrenizi girin (yerel verileriniz korunur).';
                    errEl.style.display = 'block';
                    errEl.style.background = 'rgba(245, 158, 11, 0.14)';
                    errEl.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                    errEl.style.color = '#FDE68A';
                }
                if (pEl) setTimeout(() => { try { pEl.focus(); } catch {} }, 60);
            }
        }
        if (typeof window !== 'undefined') {
            window.reauthToLoginScreenPreservingLocalData = reauthToLoginScreenPreservingLocalData;
        }

        // ==================== MERKEZ KASA MÜHÜRLEME KODEĞİ (SAFE UTF-8 + BASE64) ====================
        const SYSTEM_AI_VAULT_KEY = 'celik_kodu_sealed_ai_vault';
        const MASTER_CATALOG_META_KEY = 'celik_kodu_master_catalog_meta';
        const VAULT_B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234' + '56789+/';

        function vaultUtf8ToBytes(str) {
            const s = String(str || '');
            const bytes = [];
            for (let i = 0; i < s.length; i++) {
                let code = s.charCodeAt(i);
                if (code >= 0xD800 && code <= 0xDBFF && i + 1 < s.length) {
                    const next = s.charCodeAt(i + 1);
                    if (next >= 0xDC00 && next <= 0xDFFF) {
                        code = 0x10000 + ((code - 0xD800) << 10) + (next - 0xDC00);
                        i++;
                    }
                }
                if (code < 0x80) {
                    bytes.push(code);
                } else if (code < 0x800) {
                    bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
                } else if (code < 0x10000) {
                    bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
                } else {
                    bytes.push(
                        0xF0 | (code >> 18),
                        0x80 | ((code >> 12) & 0x3F),
                        0x80 | ((code >> 6) & 0x3F),
                        0x80 | (code & 0x3F)
                    );
                }
            }
            return bytes;
        }

        function vaultBytesToUtf8(bytes) {
            let out = '';
            for (let i = 0; i < bytes.length;) {
                const b0 = bytes[i++];
                if (b0 < 0x80) {
                    out += String.fromCharCode(b0);
                } else if ((b0 & 0xE0) === 0xC0 && i < bytes.length) {
                    const b1 = bytes[i++] & 0x3F;
                    out += String.fromCharCode(((b0 & 0x1F) << 6) | b1);
                } else if ((b0 & 0xF0) === 0xE0 && i + 1 < bytes.length) {
                    const b1 = bytes[i++] & 0x3F;
                    const b2 = bytes[i++] & 0x3F;
                    out += String.fromCharCode(((b0 & 0x0F) << 12) | (b1 << 6) | b2);
                } else if ((b0 & 0xF8) === 0xF0 && i + 2 < bytes.length) {
                    const b1 = bytes[i++] & 0x3F;
                    const b2 = bytes[i++] & 0x3F;
                    const b3 = bytes[i++] & 0x3F;
                    const cp = ((b0 & 0x07) << 18) | (b1 << 12) | (b2 << 6) | b3;
                    const adj = cp - 0x10000;
                    out += String.fromCharCode(0xD800 + (adj >> 10), 0xDC00 + (adj & 0x3FF));
                }
            }
            return out;
        }

        function vaultEncodeBase64(bytes) {
            let out = '';
            for (let i = 0; i < bytes.length; i += 3) {
                const b0 = bytes[i];
                const has1 = i + 1 < bytes.length;
                const has2 = i + 2 < bytes.length;
                const b1 = has1 ? bytes[i + 1] : 0;
                const b2 = has2 ? bytes[i + 2] : 0;
                const trip = (b0 << 16) | (b1 << 8) | b2;
                out += VAULT_B64_CHARS[(trip >> 18) & 0x3F];
                out += VAULT_B64_CHARS[(trip >> 12) & 0x3F];
                out += has1 ? VAULT_B64_CHARS[(trip >> 6) & 0x3F] : '=';
                out += has2 ? VAULT_B64_CHARS[trip & 0x3F] : '=';
            }
            return out;
        }

        function vaultDecodeBase64(b64) {
            const clean = String(b64 || '').replace(/[^A-Za-z0-9+/=]/g, '');
            const bytes = [];
            for (let i = 0; i < clean.length; i += 4) {
                const c0 = VAULT_B64_CHARS.indexOf(clean[i]);
                const c1 = VAULT_B64_CHARS.indexOf(clean[i + 1]);
                const ch2 = clean[i + 2];
                const ch3 = clean[i + 3];
                if (c0 < 0 || c1 < 0) break;
                const c2 = ch2 && ch2 !== '=' ? VAULT_B64_CHARS.indexOf(ch2) : -1;
                const c3 = ch3 && ch3 !== '=' ? VAULT_B64_CHARS.indexOf(ch3) : -1;
                const trip = (c0 << 18) | (c1 << 12) | ((c2 >= 0 ? c2 : 0) << 6) | (c3 >= 0 ? c3 : 0);
                bytes.push((trip >> 16) & 0xFF);
                if (c2 >= 0) bytes.push((trip >> 8) & 0xFF);
                if (c3 >= 0) bytes.push(trip & 0xFF);
            }
            return bytes;
        }

        function sealWithKey(plaintext, secretKey) {
            const clean = String(plaintext || '');
            if (!clean) return '';
            const pBytes = vaultUtf8ToBytes(clean);
            const rawKey = vaultUtf8ToBytes(String(secretKey || 'celik-kodu-default-seal'));
            const kBytes = rawKey.length ? rawKey : [99, 101, 108, 105, 107];
            const xBytes = pBytes.map((b, idx) => (b ^ kBytes[idx % kBytes.length] ^ ((idx * 31 + 17) & 0xFF)) & 0xFF);
            return 'v1:' + vaultEncodeBase64(xBytes);
        }

        function unsealWithKey(sealed, secretKey) {
            const raw = String(sealed || '').trim();
            if (!raw || !raw.startsWith('v1:')) return '';
            const xBytes = vaultDecodeBase64(raw.slice(3));
            const rawKey = vaultUtf8ToBytes(String(secretKey || 'celik-kodu-default-seal'));
            const kBytes = rawKey.length ? rawKey : [99, 101, 108, 105, 107];
            const pBytes = xBytes.map((b, idx) => (b ^ kBytes[idx % kBytes.length] ^ ((idx * 31 + 17) & 0xFF)) & 0xFF);
            return vaultBytesToUtf8(pBytes);
        }

        function getSystemVaultPassphrase() {
            const pid = (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG.projectId) ? FIREBASE_CONFIG.projectId : 'fitness-4f427';
            return `${pid}:celik-kodu-sys-vault-v1`;
        }

        function sealSystemAiKey(plainKey) {
            const clean = String(plainKey || '').trim();
            return clean ? sealWithKey(clean, getSystemVaultPassphrase()) : '';
        }

        function unsealSystemAiKey(sealedKey) {
            const raw = String(sealedKey || '').trim();
            if (!raw) return '';
            if (raw.startsWith('v1:')) return unsealWithKey(raw, getSystemVaultPassphrase());
            return raw;
        }

        function applyMasterCatalogMeta(meta) {
            if (!meta || typeof meta !== 'object') return;
            try {
                localStorage.setItem(MASTER_CATALOG_META_KEY, JSON.stringify(meta));
            } catch {}
            if (typeof window !== 'undefined') {
                window.CELIK_MASTER_CATALOG_META = meta;
            }
        }

        const CLOUD_MASTER_CATALOG_STORAGE_KEY = 'celik_kodu_cloud_master_catalog_v1';
        const CENTRAL_BRIDGE_URL_KEY = 'celik_kodu_central_bridge_url';
        const _BUNDLED_EXERCISES_SNAPSHOT = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB))
            ? EXERCISES_DB.map(ex => (ex && typeof ex === 'object' ? { ...ex } : ex))
            : [];

        function applyCloudMasterCatalogPayload(payload, persistLocal = true) {
            if (!payload || typeof payload !== 'object') return false;
            try {
                const parsedExercises = Array.isArray(payload.exercises)
                    ? payload.exercises
                    : (typeof payload.exercisesJson === 'string' && payload.exercisesJson.trim() ? JSON.parse(payload.exercisesJson) : null);
                const parsedOpengym = (payload.opengymCatalog && typeof payload.opengymCatalog === 'object')
                    ? payload.opengymCatalog
                    : (typeof payload.opengymCatalogJson === 'string' && payload.opengymCatalogJson.trim() ? JSON.parse(payload.opengymCatalogJson) : null);
                const parsedGuideMap = (payload.exerciseGuideMap && typeof payload.exerciseGuideMap === 'object')
                    ? payload.exerciseGuideMap
                    : (typeof payload.exerciseGuideMapJson === 'string' && payload.exerciseGuideMapJson.trim() ? JSON.parse(payload.exerciseGuideMapJson) : null);

                const bundledHasNewerEntries = (typeof _BUNDLED_EXERCISES_SNAPSHOT !== 'undefined' && Array.isArray(_BUNDLED_EXERCISES_SNAPSHOT) && Array.isArray(parsedExercises) && parsedExercises.length > 0)
                    ? _BUNDLED_EXERCISES_SNAPSHOT.some(ex => ex && ex.id && !new Set(parsedExercises.map(p => p && p.id).filter(Boolean)).has(ex.id))
                    : false;

                if (Array.isArray(parsedExercises) && parsedExercises.length > 0 && typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) {
                    const mergedMap = new Map();

                    if (bundledHasNewerEntries) {
                        // Güncel uygulama paketi eski bulut kopyasından silinemez: yerel paket esas alınır, yalnızca buluttaki ek hareketler eklenir
                        _BUNDLED_EXERCISES_SNAPSHOT.forEach(ex => { if (ex && ex.id) mergedMap.set(ex.id, ex); });
                        parsedExercises.forEach(ex => { if (ex && ex.id && !mergedMap.has(ex.id)) mergedMap.set(ex.id, ex); });
                    } else {
                        // Bulut kataloğu tüm paket hareketlerini içeriyorsa bulut güncellemelerini uygula, paket dışı kalanları da koru
                        _BUNDLED_EXERCISES_SNAPSHOT.forEach(ex => { if (ex && ex.id) mergedMap.set(ex.id, ex); });
                        parsedExercises.forEach(ex => { if (ex && ex.id) mergedMap.set(ex.id, ex); });
                    }

                    EXERCISES_DB.splice(0, EXERCISES_DB.length, ...Array.from(mergedMap.values()));
                    if (typeof window !== 'undefined') window.EXERCISES_DB = EXERCISES_DB;
                }
                const mergeCatalogMap = (target, incoming, preserveExisting) => {
                    if (!target || !incoming) return;
                    Object.keys(incoming).forEach(k => {
                        if (!preserveExisting || !Object.prototype.hasOwnProperty.call(target, k)) {
                            target[k] = incoming[k];
                        }
                    });
                };
                if (parsedOpengym && typeof parsedOpengym === 'object' && !Array.isArray(parsedOpengym) && typeof window !== 'undefined') {
                    if (window.OPENGYM_GLOBAL_CATALOG && typeof window.OPENGYM_GLOBAL_CATALOG === 'object') {
                        mergeCatalogMap(window.OPENGYM_GLOBAL_CATALOG, parsedOpengym, bundledHasNewerEntries);
                    } else {
                        window._pendingCloudOpengymCatalog = window._pendingCloudOpengymCatalog || {};
                        mergeCatalogMap(window._pendingCloudOpengymCatalog, parsedOpengym, bundledHasNewerEntries);
                    }
                }
                if (parsedGuideMap && typeof parsedGuideMap === 'object' && !Array.isArray(parsedGuideMap) && typeof window !== 'undefined') {
                    if (window.exerciseGuideMap && typeof window.exerciseGuideMap === 'object') {
                        mergeCatalogMap(window.exerciseGuideMap, parsedGuideMap, bundledHasNewerEntries);
                    } else {
                        window._pendingCloudGuideMap = window._pendingCloudGuideMap || {};
                        mergeCatalogMap(window._pendingCloudGuideMap, parsedGuideMap, bundledHasNewerEntries);
                    }
                }

                const metaObj = {
                    version: Number(payload.version || 0),
                    exerciseCount: Number(payload.exerciseCount || (Array.isArray(parsedExercises) ? parsedExercises.length : 0)),
                    totalCatalogIds: Number(payload.totalCatalogIds || 0),
                    opengymCount: Number(payload.opengymCount || 0),
                    guideCount: Number(payload.guideCount || 0),
                    updatedAt: Number(payload.updatedAt || Date.now())
                };
                if (typeof window !== 'undefined') {
                    window.CELIK_MASTER_CATALOG_META = Object.assign({}, window.CELIK_MASTER_CATALOG_META || {}, metaObj);
                }

                if (persistLocal) {
                    const cacheRecord = {
                        ...metaObj,
                        exercisesJson: typeof payload.exercisesJson === 'string'
                            ? payload.exercisesJson
                            : (Array.isArray(parsedExercises) ? JSON.stringify(parsedExercises) : ''),
                        opengymCatalogJson: typeof payload.opengymCatalogJson === 'string'
                            ? payload.opengymCatalogJson
                            : (parsedOpengym ? JSON.stringify(parsedOpengym) : ''),
                        exerciseGuideMapJson: typeof payload.exerciseGuideMapJson === 'string'
                            ? payload.exerciseGuideMapJson
                            : (parsedGuideMap ? JSON.stringify(parsedGuideMap) : '')
                    };
                    localStorage.setItem(CLOUD_MASTER_CATALOG_STORAGE_KEY, JSON.stringify(cacheRecord));
                }
                return true;
            } catch (err) {
                console.warn('Bulut ana katalogu uygulanamadı:', err);
                return false;
            }
        }

        function loadCachedCloudMasterCatalogOnBoot() {
            try {
                const raw = localStorage.getItem(CLOUD_MASTER_CATALOG_STORAGE_KEY);
                if (!raw) return false;
                const parsed = JSON.parse(raw);
                return applyCloudMasterCatalogPayload(parsed, false);
            } catch {
                return false;
            }
        }

        function parseFirestoreValueForCatalog(val) {
            if (!val || typeof val !== 'object') return null;
            if ('nullValue' in val) return null;
            if ('booleanValue' in val) return Boolean(val.booleanValue);
            if ('integerValue' in val) return Number(val.integerValue);
            if ('doubleValue' in val) return Number(val.doubleValue);
            if ('stringValue' in val) return String(val.stringValue);
            if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseFirestoreValueForCatalog);
            if ('mapValue' in val) {
                const out = {};
                for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
                    out[k] = parseFirestoreValueForCatalog(v);
                }
                return out;
            }
            return null;
        }

        async function syncMasterCatalogFromCloud(expectedVersion = 0) {
            try {
                const cachedRaw = localStorage.getItem(CLOUD_MASTER_CATALOG_STORAGE_KEY);
                const cachedObj = cachedRaw ? JSON.parse(cachedRaw) : null;
                const localVersion = Number(cachedObj?.version || 0);
                if (cachedObj && Number(expectedVersion || 0) > 0 && localVersion >= Number(expectedVersion)) {
                    loadCachedCloudMasterCatalogOnBoot();
                    return true;
                }

                let cloudPayload = null;
                if (isFirebaseReady && fbDb) {
                    const catSnap = await fbDb.collection('app_system').doc('master_catalog').get();
                    if (catSnap && catSnap.exists) {
                        cloudPayload = catSnap.data();
                    }
                }
                if (!cloudPayload) {
                    const apiKeyParam = (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG.apiKey) ? `?key=${encodeURIComponent(FIREBASE_CONFIG.apiKey)}` : '';
                    const restUrl = `https://firestore.googleapis.com/v1/projects/fitness-4f427/databases/(default)/documents/app_system/master_catalog${apiKeyParam}`;
                    const restRes = await fetch(restUrl);
                    if (restRes.ok) {
                        const docJson = await restRes.json();
                        cloudPayload = {};
                        for (const [k, v] of Object.entries(docJson?.fields || {})) {
                            cloudPayload[k] = parseFirestoreValueForCatalog(v);
                        }
                    }
                }

                if (cloudPayload && applyCloudMasterCatalogPayload(cloudPayload, true)) {
                    if (typeof updateLibrarySubTabButtons === 'function') updateLibrarySubTabButtons();
                    if (typeof document !== 'undefined') {
                        const isLibActive = document.getElementById('libraryTab')?.classList.contains('active');
                        if (isLibActive && typeof renderLibrary === 'function') renderLibrary();
                    }
                    return true;
                }
            } catch (err) {
                console.warn('Ana katalog buluttan eşitlenemedi:', err);
            }
            return false;
        }

        async function publishMasterCatalogToCloud(newVersion) {
            if (typeof isVerifiedAdminSession === 'function' && !isVerifiedAdminSession()) return false;
            if (!isFirebaseReady || !fbDb) return false;
            const versionNum = Number(newVersion || (Number(window.CELIK_MASTER_CATALOG_META?.version || 293) + 1));
            const exercisesArr = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB)) ? EXERCISES_DB : [];
            const opengymObj = (typeof window !== 'undefined' && window.OPENGYM_GLOBAL_CATALOG) ? window.OPENGYM_GLOBAL_CATALOG : {};
            const guideObj = (typeof window !== 'undefined' && window.exerciseGuideMap) ? window.exerciseGuideMap : {};
            const nowTs = Date.now();
            const payload = {
                version: versionNum,
                updatedAt: nowTs,
                exerciseCount: exercisesArr.length,
                totalCatalogIds: exercisesArr.length,
                opengymCount: Object.keys(opengymObj).length,
                guideCount: Object.keys(guideObj).length,
                exercisesJson: JSON.stringify(exercisesArr),
                opengymCatalogJson: JSON.stringify(opengymObj),
                exerciseGuideMapJson: JSON.stringify(guideObj)
            };
            await fbDb.collection('app_system').doc('master_catalog').set(payload, { merge: true });
            await fbDb.collection('app_system').doc('ai_config').set({
                masterCatalogMeta: {
                    version: versionNum,
                    docPath: 'app_system/master_catalog',
                    exerciseCount: payload.exerciseCount,
                    totalCatalogIds: payload.totalCatalogIds,
                    opengymCount: payload.opengymCount,
                    guideCount: payload.guideCount,
                    muscleCount: 10,
                    subMuscleCount: 31,
                    updatedAt: nowTs
                }
            }, { merge: true });
            applyCloudMasterCatalogPayload(payload, true);
            return true;
        }

        loadCachedCloudMasterCatalogOnBoot();
        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
            document.addEventListener('DOMContentLoaded', () => {
                loadCachedCloudMasterCatalogOnBoot();
            });
        }

        if (typeof window !== 'undefined') {
            window.applyCloudMasterCatalogPayload = applyCloudMasterCatalogPayload;
            window.syncMasterCatalogFromCloud = syncMasterCatalogFromCloud;
            window.publishMasterCatalogToCloud = publishMasterCatalogToCloud;
            window.CelikVaultCodec = {
                sealWithKey,
                unsealWithKey,
                sealSystemAiKey,
                unsealSystemAiKey,
                applyMasterCatalogMeta,
                applyCloudMasterCatalogPayload,
                SYSTEM_AI_VAULT_KEY,
                MASTER_CATALOG_META_KEY,
                CLOUD_MASTER_CATALOG_STORAGE_KEY,
                CENTRAL_BRIDGE_URL_KEY
            };
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

        function recordCloudGateTelemetry(severity, action, inputSummary, outcome, uidOverride) {
            try {
                if (typeof window !== 'undefined' && window.CelikKaraKutu && typeof window.CelikKaraKutu.record === 'function') {
                    window.CelikKaraKutu.record({
                        gate: 'K4',
                        severity: severity === 'error' ? 'error' : 'warn',
                        module: 'Bulut Eşitleme',
                        action: String(action || 'Bulut İşlemi'),
                        inputSummary: String(inputSummary || ''),
                        outcome: String(outcome || ''),
                        uid: uidOverride || undefined
                    });
                }
            } catch {}
        }

        function diagnoseCloudPayloadPreFlight(colName, payload, sealUsed) {
            try {
                const ver = (typeof window !== 'undefined' && window.CelikKaraKutu && typeof window.CelikKaraKutu.getAppVersion === 'function')
                    ? window.CelikKaraKutu.getAppVersion()
                    : 'v349';
                const keys = payload && typeof payload === 'object' ? Object.keys(payload) : [];
                const undefKeys = [];
                const overLimit = [];
                for (const k of keys) {
                    const v = payload[k];
                    if (v === undefined) undefKeys.push(k);
                    else if (Array.isArray(v) && v.length > 500) overLimit.push(`${k}:${v.length}`);
                    else if (v && typeof v === 'object' && !Array.isArray(v) && typeof v._methodName !== 'string' && Object.keys(v).length > 100 && !['dateSchedule', 'rememberedWeights', 'garminManifests'].includes(k)) {
                        overLimit.push(`${k}:${Object.keys(v).length}k`);
                    }
                }
                const sealStr = String(sealUsed || '');
                const sealStatus = sealStr.length >= 10 && sealStr.length <= 120 ? `${sealStr.length}krk` : `GEÇERSİZ(${sealStr.length})`;
                const authOpen = (typeof fbAuth !== 'undefined' && fbAuth && fbAuth.currentUser) ? 'Açık' : 'Kapalı';
                const schemaNote = undefKeys.length > 0
                    ? `Tanımsız:${undefKeys.slice(0, 3).join(',')}`
                    : (overLimit.length > 0 ? `Sınır:${overLimit.slice(0, 2).join(',')}` : 'Temiz');
                return `Sürüm:${ver} | Alan:${keys.length} | Şema:${schemaNote} | Mühür:${sealStatus} | Oturum:${authOpen}`;
            } catch {
                return 'Tanı:Bilinmiyor';
            }
        }

        function clearResolvedCloudErrors(colName, uid) {
            try {
                if (typeof window === 'undefined' || !window.CelikKaraKutu || typeof window.CelikKaraKutu.resolveAction !== 'function') return;
                window.CelikKaraKutu.resolveAction({ uid, gate: 'K4', actionPrefix: colName });
                const aliasPrefixMap = {
                    user_state: 'Durum Bulut',
                    workout_logs: 'Antrenman Bulut',
                    scale_logs: 'Tartı Bulut',
                    measurement_logs: 'Mezura Bulut'
                };
                if (aliasPrefixMap[colName]) {
                    window.CelikKaraKutu.resolveAction({ uid, gate: 'K4', actionPrefix: aliasPrefixMap[colName] });
                }
            } catch {}
        }

        async function writeAthleteDocWithSealHeal(colName, uid, buildPayloadFn) {
            const docRef = fbDb.collection(colName).doc(uid);
            const firstSeal = getAthleteCloudSeal(uid, colName);
            const isTelCol = colName === 'system_telemetry';
            let attemptLabel = 'İlkYazım';
            let usedSeal = firstSeal;
            let lastPayload = buildPayloadFn(firstSeal);
            const allowedKeysMap = {
                workout_logs: new Set(['logs', 'updatedAt', 'clientUpdatedAt', 'lastUpdatedBy', 'syncSeal']),
                scale_logs: new Set(['logs', 'updatedAt', 'clientUpdatedAt', 'syncSeal']),
                measurement_logs: new Set(['logs', 'updatedAt', 'clientUpdatedAt', 'syncSeal']),
                user_state: new Set([
                    'weeklySchedule', 'nextWeeklySchedule', 'dateSchedule', 'rememberedWeights',
                    'excludedExercises', 'excludedExercisesUpdatedAt', 'customPrograms',
                    'deletedCustomProgramIds', 'deletedWorkoutLogIds', 'mobilityTests',
                    'selectedEquipments', 'customGyms', 'aiDoctrine', 'aiCoachSummary',
                    'lastGeneratedWorkout', 'activeWorkoutDraft', 'garminManifests',
                    'updatedAt', 'clientUpdatedAt', 'syncSeal'
                ]),
                system_telemetry: new Set(['uid', 'userName', 'events', 'openErrorCount', 'openWarnCount', 'clientUpdatedAt', 'updatedAt', 'syncSeal'])
            };
            try {
                await docRef.set(lastPayload, { merge: true });
                if (!IS_LOCAL_DEV && !isTelCol) clearResolvedCloudErrors(colName, uid);
                return true;
            } catch (err) {
                const isPermErr = err && (err.code === 'permission-denied' || /permission|insufficient/i.test(String(err.message || '')));
                if (isPermErr) {
                    try {
                        const snap = (typeof fetchCloudDocPreferServer === 'function')
                            ? await fetchCloudDocPreferServer(docRef)
                            : await docRef.get();
                        const snapData = (snap && snap.exists && typeof snap.data === 'function') ? (snap.data() || {}) : null;
                        const remoteSeal = snapData ? adoptCloudSyncSealIfPresent(colName, uid, snapData) : '';
                        const allowedSet = allowedKeysMap[colName];
                        const extraLegacyKeys = (snapData && allowedSet)
                            ? Object.keys(snapData).filter(k => !allowedSet.has(k))
                            : [];
                        const hasFieldDelete = typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue && typeof firebase.firestore.FieldValue.delete === 'function';

                        if ((remoteSeal && remoteSeal !== firstSeal) || (extraLegacyKeys.length > 0 && hasFieldDelete)) {
                            attemptLabel = extraLegacyKeys.length > 0 ? 'ŞemaVeMühürOnarımı' : 'MühürYenileme';
                            usedSeal = remoteSeal || firstSeal;
                            lastPayload = buildPayloadFn(usedSeal);
                            const healPayload = Object.assign({}, lastPayload);
                            if (extraLegacyKeys.length > 0 && hasFieldDelete) {
                                extraLegacyKeys.forEach(k => {
                                    healPayload[k] = firebase.firestore.FieldValue.delete();
                                });
                            }
                            await docRef.set(healPayload, { merge: true });
                            if (!IS_LOCAL_DEV && !isTelCol) {
                                clearResolvedCloudErrors(colName, uid);
                                recordCloudGateTelemetry('warn', `${colName} Mühür Onarımı`, uid, extraLegacyKeys.length > 0 ? 'Eski şema alanları ve mühür onarıldı' : 'Bulut mühür uyuşmazlığı otomatik onarıldı', uid);
                            }
                            return true;
                        }
                    } catch (healErr) {
                        err = healErr;
                    }
                }
                const finalIsPerm = Boolean(isPermErr || (err && (err.code === 'permission-denied' || /permission|insufficient/i.test(String(err.message || '')))));
                if (err && typeof err === 'object') err._k4IsPerm = finalIsPerm;
                if (!IS_LOCAL_DEV && !isTelCol) {
                    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
                    const diagSummary = diagnoseCloudPayloadPreFlight(colName, lastPayload, usedSeal);
                    recordCloudGateTelemetry(offline ? 'warn' : 'error', `${colName} Bulut Yazımı`, `${uid} (${diagSummary} | Deneme:${attemptLabel})`, String((err && err.message) || err || 'Bulut yazım hatası'), uid);
                    if (err && typeof err === 'object') err._k4Recorded = true;
                }
                throw err;
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

        const systemTelemetrySyncTimers = {};

        async function syncSystemTelemetryToCloud(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (IS_LOCAL_DEV || !uid || !/^usr_[a-zA-Z0-9_-]{1,64}$/.test(uid)) return false;
            if (!isFirebaseReady || !fbDb || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
                try { localStorage.setItem(`celik_kodu_pending_telemetry_sync_${uid}`, '1'); } catch {}
                return false;
            }
            if (typeof window === 'undefined' || !window.CelikKaraKutu) return false;
            try {
                const rawEvents = window.CelikKaraKutu.getEventsForUser(uid).slice(0, 50);
                let cleanEvents = [];
                try { cleanEvents = JSON.parse(JSON.stringify(rawEvents)); } catch { cleanEvents = []; }
                let openErrorCount = 0;
                let openWarnCount = 0;
                cleanEvents.forEach(ev => {
                    if (ev && ev.severity === 'error') openErrorCount++;
                    else openWarnCount++;
                });
                const users = typeof getAuthUsers === 'function' ? getAuthUsers() : [];
                const uObj = users.find(u => u && u.id === uid);
                const userName = String((uObj && (uObj.name || uObj.username)) || (cleanEvents[0] && cleanEvents[0].userName) || uid).slice(0, 120);

                await writeAthleteDocWithSealHeal('system_telemetry', uid, (seal) => ({
                    uid,
                    userName,
                    events: cleanEvents,
                    openErrorCount,
                    openWarnCount,
                    clientUpdatedAt: Date.now(),
                    syncSeal: seal,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }));
                try { localStorage.removeItem(`celik_kodu_pending_telemetry_sync_${uid}`); } catch {}
                return true;
            } catch {
                try { localStorage.setItem(`celik_kodu_pending_telemetry_sync_${uid}`, '1'); } catch {}
                return false;
            }
        }

        function scheduleSystemTelemetryCloudSync(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid || !/^usr_[a-zA-Z0-9_-]{1,64}$/.test(uid)) return;
            if (IS_LOCAL_DEV) return;
            if (!isFirebaseReady || !fbDb || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
                try { localStorage.setItem(`celik_kodu_pending_telemetry_sync_${uid}`, '1'); } catch {}
                return;
            }
            if (systemTelemetrySyncTimers[uid]) clearTimeout(systemTelemetrySyncTimers[uid]);
            systemTelemetrySyncTimers[uid] = setTimeout(() => {
                syncSystemTelemetryToCloud(uid);
            }, 1500);
        }

        async function fetchAllCloudSystemTelemetryForAdmin() {
            const session = typeof getSession === 'function' ? getSession() : null;
            if (typeof isVerifiedAdminSession === 'function' ? !isVerifiedAdminSession(session) : (!session || session.role !== 'admin' || session.authVerified !== true)) return false;
            if (IS_LOCAL_DEV || !isFirebaseReady || !fbDb || (typeof navigator !== 'undefined' && navigator.onLine === false)) return false;
            if (typeof window === 'undefined' || !window.CelikKaraKutu) return false;

            try {
                const docEntries = [];
                try {
                    const snap = await fbDb.collection('system_telemetry').get();
                    if (snap && typeof snap.forEach === 'function') {
                        snap.forEach(doc => {
                            if (doc && doc.exists) docEntries.push({ id: doc.id, data: doc.data() || {} });
                        });
                    }
                } catch {
                    const users = typeof getAuthUsers === 'function' ? getAuthUsers() : [];
                    for (const u of users) {
                        if (!u || !u.id) continue;
                        try {
                            const d = await fbDb.collection('system_telemetry').doc(u.id).get();
                            if (d && d.exists) docEntries.push({ id: d.id, data: d.data() || {} });
                        } catch {}
                    }
                }

                docEntries.forEach(({ id, data }) => {
                    const targetUid = String(data.uid || id || '').trim();
                    if (!targetUid || !Array.isArray(data.events)) return;
                    const clearedAt = Number(localStorage.getItem(`celik_kodu_telemetry_cleared_at_${targetUid}`) || 0);
                    const remoteUpdated = Number(data.clientUpdatedAt || 0);
                    if (clearedAt > 0 && remoteUpdated > 0 && clearedAt >= remoteUpdated) return;

                    const localEvents = window.CelikKaraKutu.getEventsForUser(targetUid);
                    const byId = new Map();
                    localEvents.forEach(ev => { if (ev && ev.id) byId.set(ev.id, ev); });
                    data.events.forEach(rawEv => {
                        const cleanEv = window.CelikKaraKutu.sanitizeEvent(Object.assign({}, rawEv, { uid: targetUid }));
                        if (!cleanEv) return;
                        if (clearedAt > 0 && Number(cleanEv.at || 0) <= clearedAt) return;
                        const prev = byId.get(cleanEv.id);
                        if (!prev || Number(cleanEv.at || 0) > Number(prev.at || 0) || Number(cleanEv.repeatCount || 1) > Number(prev.repeatCount || 1)) {
                            byId.set(cleanEv.id, cleanEv);
                        }
                    });
                    const merged = Array.from(byId.values())
                        .sort((a, b) => Number(b.at || 0) - Number(a.at || 0))
                        .slice(0, 50);
                    window.CelikKaraKutu.setEventsForUser(targetUid, merged);
                });

                updateAdminPendingBadges();
                const telView = document.getElementById('adminViewTelemetry');
                if (telView && telView.style.display !== 'none' && typeof renderAdminSystemTelemetry === 'function') {
                    renderAdminSystemTelemetry();
                }
                return true;
            } catch {
                return false;
            }
        }

        if (typeof window !== 'undefined') {
            window.scheduleSystemTelemetryCloudSync = scheduleSystemTelemetryCloudSync;
            window.syncSystemTelemetryToCloud = syncSystemTelemetryToCloud;
            window.fetchAllCloudSystemTelemetryForAdmin = fetchAllCloudSystemTelemetryForAdmin;
        }

        async function flushPendingCloudOutbox() {
            if (IS_LOCAL_DEV || !isFirebaseReady || !fbDb || !navigator.onLine) return;
            if (!isDemoGuestSession() && fbAuth && _firebaseInitialAuthResolved && !fbAuth.currentUser) return;
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
                if (localStorage.getItem(`celik_kodu_pending_telemetry_sync_${uid}`) === '1') {
                    await syncSystemTelemetryToCloud(uid);
                }
            } catch {}
        }

        async function waitForFirebaseAuthReady(authInstance, timeoutMs = 2500) {
            if (!authInstance) {
                _firebaseInitialAuthResolved = true;
                return null;
            }
            if (_firebaseInitialAuthResolved) return authInstance.currentUser || null;
            if (typeof authInstance.authStateReady === 'function') {
                try {
                    await Promise.race([
                        authInstance.authStateReady(),
                        new Promise(resolve => setTimeout(resolve, timeoutMs))
                    ]);
                    _firebaseInitialAuthResolved = true;
                    return authInstance.currentUser || null;
                } catch {}
            }
            return await new Promise((resolve) => {
                let settled = false;
                let unsub = null;
                const done = (user) => {
                    if (settled) return;
                    settled = true;
                    _firebaseInitialAuthResolved = true;
                    if (typeof unsub === 'function') {
                        try { unsub(); } catch {}
                    }
                    resolve(user || null);
                };
                const timer = setTimeout(() => done(authInstance.currentUser || null), timeoutMs);
                try {
                    unsub = authInstance.onAuthStateChanged((u) => {
                        clearTimeout(timer);
                        done(u || null);
                    });
                } catch {
                    clearTimeout(timer);
                    done(authInstance.currentUser || null);
                }
            });
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
                    if (typeof window !== 'undefined') window._initialWorkoutLogsCloudSyncDone = true;
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
                        fbAuth.onAuthStateChanged(async fbUser => {
                            _firebaseInitialAuthResolved = true;
                            const curSess = typeof getSession === 'function' ? getSession() : null;
                            if (fbUser) {
                                await refreshVerifiedAdminClaim(fbUser);
                                if (typeof syncUserRoleDocument === 'function') {
                                    const activeU = typeof getActiveUser === 'function' ? getActiveUser() : null;
                                    try { await syncUserRoleDocument(fbUser, activeU); } catch {}
                                }
                                if (curSess && typeof syncAppViewState === 'function') {
                                    syncAppViewState();
                                } else if (curSess && curSess.role === 'admin' && typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession(curSess)) {
                                    await ensureAdminPortalLoadedAndMounted(curSess);
                                    if (typeof updateAdminPendingBadges === 'function') updateAdminPendingBadges();
                                } else {
                                    unmountAdminPortalFromDOM();
                                }
                                if (_bootCloudSyncTriggered && navigator.onLine !== false && curSess && !isDemoGuestSession(curSess)) {
                                    flushPendingCloudOutbox().then(() => syncAllFromCloud()).catch(() => {});
                                }
                            } else {
                                await refreshVerifiedAdminClaim(null);
                                if (!IS_LOCAL_DEV) {
                                    unmountAdminPortalFromDOM();
                                    if (curSess && !isDemoGuestSession(curSess)) {
                                        if (typeof syncAppViewState === 'function') syncAppViewState();
                                        updateCloudSyncBadge('auth-required', 'Bulut Girişi Gerekli');
                                    }
                                }
                            }
                        });
                    } catch {}
                }

                fbDb = firebase.firestore();

                // T24: Tek bir boş (undefined) alan tüm bulut yazımını reddettirmesin
                try { fbDb.settings({ ignoreUndefinedProperties: true }); } catch (e) {
                    console.warn("Firestore ayarı uygulanamadı:", e);
                }

                // Çevrimdışı desteği (Offline-first IndexedDB önbellekleme)
                fbDb.enablePersistence({ synchronizeTabs: true }).catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.warn("Firestore çoklu sekme açık, önbellek tek sekmede çalışacak.");
                    } else if (err.code === 'unimplemented') {
                        console.warn("Mevcut tarayıcı IndexedDB kalıcılığını desteklemiyor.");
                    }
                });

                isFirebaseReady = true;
                updateCloudSyncBadge('syncing', 'Bağlanıyor...');
                console.log("Firebase Firestore başarıyla bağlandı.");

                // İlk bulut veri senkronizasyonunu Firebase Auth durumu netleştikten sonra başlat
                (async () => {
                    try {
                        if (fbAuth) {
                            await waitForFirebaseAuthReady(fbAuth, 2500);
                        } else {
                            _firebaseInitialAuthResolved = true;
                        }
                        if (fbAuth && fbAuth.currentUser) {
                            await refreshVerifiedAdminClaim(fbAuth.currentUser);
                            const activeU = typeof getActiveUser === 'function' ? getActiveUser() : null;
                            try { await syncUserRoleDocument(fbAuth.currentUser, activeU); } catch {}
                        } else {
                            await refreshVerifiedAdminClaim(null);
                        }
                        if (typeof getSession === 'function' && getSession() && typeof syncAppViewState === 'function') {
                            syncAppViewState();
                        }
                        _bootCloudSyncTriggered = true;
                        if (fbAuth && fbAuth.currentUser) {
                            await flushPendingCloudOutbox();
                            await syncAllFromCloud();
                        } else {
                            if (typeof window !== 'undefined') window._initialWorkoutLogsCloudSyncDone = true;
                            if (typeof syncMasterCatalogFromCloud === 'function') {
                                try { await syncMasterCatalogFromCloud(0); } catch {}
                            }
                            const curSess = typeof getSession === 'function' ? getSession() : null;
                            if (curSess && isDemoGuestSession(curSess)) {
                                updateCloudSyncBadge('synced', 'Demo Modu');
                            } else if (curSess) {
                                updateCloudSyncBadge('auth-required', 'Bulut Girişi Gerekli');
                            } else {
                                updateCloudSyncBadge('offline', 'Bulut Hazır');
                            }
                        }
                    } catch {}
                })();

            } catch (err) {
                if (typeof window !== 'undefined') window._initialWorkoutLogsCloudSyncDone = true;
                console.error("Firebase başlatma hatası:", err);
                updateCloudSyncBadge('offline', 'Yerel Mod');
            }
        }

        let workoutLogsRealtimeUnsub = null;
        let workoutLogsRealtimeUid = null;
        const workoutLogsLastFetchAt = {};
        if (typeof window !== 'undefined' && window._initialWorkoutLogsCloudSyncDone === undefined) {
            window._initialWorkoutLogsCloudSyncDone = false;
        }

        async function fetchCloudDocPreferServer(docRef) {
            if (!docRef || typeof docRef.get !== 'function') return null;
            if (typeof navigator === 'undefined' || navigator.onLine !== false) {
                try {
                    return await docRef.get({ source: 'server' });
                } catch (e) {}
            }
            return await docRef.get();
        }

        // Buluttan verileri çekme ve birleştirme (Merge)
        const DEMO_GUEST_UID = 'usr_demo_guest';
        const DEMO_GUEST_USER = {
            id: DEMO_GUEST_UID,
            username: 'demo',
            name: 'Misafir Sporcu',
            role: 'athlete',
            status: 'active',
            isDemoGuest: true,
            level: 'Orta Seviye',
            gender: 'Erkek',
            theme: 'purple',
            avatar: 'SP'
        };

        function isDemoGuestSession(sessionOverride) {
            const s = sessionOverride || (typeof getSession === 'function' ? getSession() : null);
            return Boolean(s && (s.isDemoGuest === true || s.userId === DEMO_GUEST_UID));
        }
        window.isDemoGuestSession = isDemoGuestSession;

        function toUsernameDocId(rawUname) {
            return normalizeAuthString(rawUname)
                .replace(/ç/g, 'c')
                .replace(/ğ/g, 'g')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ş/g, 's')
                .replace(/ü/g, 'u')
                .replace(/[^a-z0-9._-]/g, '');
        }

        function sanitizeAvatarMonogram(av, fallback = 'SP') {
            const clean = String(av || '').trim();
            if (!clean || /\p{Extended_Pictographic}/u.test(clean)) return fallback;
            return clean.slice(0, 4);
        }

        function buildUserProfileDocPayload(userObj, authUid, overrides = {}) {
            const src = Object.assign({}, userObj || {}, overrides || {});
            const cleanAuthUid = String(authUid || src.authUid || '').trim();
            let cleanId = String(src.id || '').trim();
            if (!/^usr_[a-zA-Z0-9_-]{1,64}$/.test(cleanId)) {
                const safeSuffix = cleanAuthUid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || String(Date.now());
                cleanId = 'usr_' + safeSuffix;
            }
            const cleanRole = String(src.role || 'athlete').trim() === 'admin' ? 'admin' : 'athlete';
            const rawStatus = String(src.status || 'pending').trim();
            const cleanStatus = (rawStatus === 'approved' || rawStatus === 'active') ? 'approved' : 'pending';

            const payload = {
                id: cleanId,
                authUid: cleanAuthUid,
                username: String(src.username || '').trim().slice(0, 80),
                fbAuthEmail: String(src.fbAuthEmail || src.email || `${cleanId}@auth.celikkodu.app`).trim().toLowerCase().slice(0, 254),
                role: cleanRole,
                status: cleanStatus,
                name: String(src.name || 'Sporcu').trim().slice(0, 120) || 'Sporcu',
                avatar: sanitizeAvatarMonogram(src.avatar, 'SP'),
                theme: String(src.theme || (cleanRole === 'admin' ? 'gold' : 'cyan')).trim().slice(0, 32),
                level: String(src.level || 'Orta Seviye').trim().slice(0, 64),
                gender: String(src.gender || 'Erkek').trim().slice(0, 32),
                mustChangePassword: Boolean(src.mustChangePassword),
                createdAt: Number.isFinite(Number(src.createdAt)) && Number(src.createdAt) > 0 ? Number(src.createdAt) : Date.now(),
                updatedAt: Number.isFinite(Number(src.updatedAt)) && Number(src.updatedAt) > 0 ? Number(src.updatedAt) : Date.now()
            };
            if (src.email) payload.email = String(src.email).trim().toLowerCase().slice(0, 254);
            if (src.weights && typeof src.weights === 'object' && !Array.isArray(src.weights)) {
                const wClean = {};
                ['press', 'squat', 'row', 'rdl', 'swing', 'lunge'].forEach(k => {
                    if (src.weights[k] !== undefined && src.weights[k] !== null) {
                        wClean[k] = String(src.weights[k]).slice(0, 16);
                    }
                });
                payload.weights = wClean;
            }
            if (src.passwordStrengthLevel) payload.passwordStrengthLevel = String(src.passwordStrengthLevel).slice(0, 64);
            if (Number.isFinite(Number(src.passwordUpdatedAt)) && Number(src.passwordUpdatedAt) > 0) {
                payload.passwordUpdatedAt = Number(src.passwordUpdatedAt);
            }
            if (Number.isFinite(Number(src.approvedAt)) && Number(src.approvedAt) > 0) {
                payload.approvedAt = Number(src.approvedAt);
            }
            return payload;
        }

        function stripSecretsFromUserRecord(rawUser) {
            if (!rawUser || typeof rawUser !== 'object') return null;
            const clean = { ...rawUser };
            delete clean.password;
            delete clean.passwordHash;
            delete clean.salt;
            delete clean.geminiApiKey;
            delete clean.tredictToken;
            delete clean.intervalsToken;
            if (clean.avatar) clean.avatar = sanitizeAvatarMonogram(clean.avatar, 'SP');
            return clean;
        }

        function upsertLocalUserRecord(userObj) {
            const clean = stripSecretsFromUserRecord(userObj);
            if (!clean || !clean.id) return null;
            const users = getAuthUsers();
            const idx = users.findIndex(u => u && (u.id === clean.id || (clean.authUid && u.authUid === clean.authUid)));
            if (idx === -1) {
                users.push(clean);
            } else {
                users[idx] = stripSecretsFromUserRecord(Object.assign({}, users[idx], clean));
            }
            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
            return idx === -1 ? clean : users[idx];
        }

        async function syncOwnUserProfileFromCloud(fbUserOverride) {
            if (IS_LOCAL_DEV || !isFirebaseReady || !fbDb) return null;
            const fbUser = fbUserOverride || (typeof fbAuth !== 'undefined' && fbAuth ? fbAuth.currentUser : null);
            if (!fbUser || !fbUser.uid) return null;
            try {
                let cloudProfile = null;
                let cloudRoleDoc = null;
                try {
                    const profSnap = await fetchCloudDocPreferServer(fbDb.collection('user_profiles').doc(fbUser.uid));
                    if (profSnap && profSnap.exists) cloudProfile = profSnap.data() || null;
                } catch {}
                try {
                    const roleSnap = await fbDb.collection('user_roles').doc(fbUser.uid).get();
                    if (roleSnap && roleSnap.exists) cloudRoleDoc = roleSnap.data() || null;
                } catch {}
                if (!cloudProfile && !cloudRoleDoc) return null;

                const cleanFbUid = String(fbUser.uid).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
                const resolvedId = (cloudProfile && cloudProfile.id)
                    || (cloudRoleDoc && cloudRoleDoc.appUid)
                    || ('usr_' + cleanFbUid);
                const isClaimAdmin = typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession();
                const mergedUser = stripSecretsFromUserRecord(Object.assign(
                    {},
                    cloudProfile || {},
                    {
                        id: resolvedId,
                        authUid: fbUser.uid,
                        email: (cloudProfile && cloudProfile.email) || fbUser.email || '',
                        fbAuthEmail: (cloudProfile && cloudProfile.fbAuthEmail) || fbUser.email || '',
                        role: isClaimAdmin ? 'admin' : ((cloudProfile && cloudProfile.role) || (cloudRoleDoc && cloudRoleDoc.role) || 'athlete')
                    }
                ));
                if (!mergedUser.status) mergedUser.status = 'approved';
                const saved = upsertLocalUserRecord(mergedUser);
                const curSess = typeof getSession === 'function' ? getSession() : null;
                if (curSess && curSess.userId === resolvedId && saved) {
                    if (saved.name && curSess.name !== saved.name) {
                        curSess.name = saved.name;
                        localStorage.setItem('celik_kodu_session', JSON.stringify(curSess));
                    }
                    if (typeof applyActiveUserProfile === 'function') applyActiveUserProfile();
                }
                return saved;
            } catch (err) {
                console.warn('Kullanıcı profili buluttan eşitlenemedi:', err);
                return null;
            }
        }

        async function syncOwnUserProfileToCloud(userObj, fbUserOverride) {
            if (IS_LOCAL_DEV || !isFirebaseReady || !fbDb) return false;
            const fbUser = fbUserOverride || (typeof fbAuth !== 'undefined' && fbAuth ? fbAuth.currentUser : null);
            if (!fbUser || !fbUser.uid || !userObj) return false;
            try {
                const docRef = fbDb.collection('user_profiles').doc(fbUser.uid);
                const existingSnap = await docRef.get();
                const existingData = (existingSnap && existingSnap.exists && typeof existingSnap.data === 'function') ? (existingSnap.data() || {}) : null;
                const isAdmin = typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession();
                if (!existingData && !isAdmin) {
                    return false;
                }
                const preservedOverrides = (existingData && !isAdmin)
                    ? { id: existingData.id, role: existingData.role, status: existingData.status }
                    : {};
                const payload = buildUserProfileDocPayload(userObj, fbUser.uid, preservedOverrides);
                await docRef.set(payload, { merge: true });
                return true;
            } catch (err) {
                console.warn('Kullanıcı profili buluta yazılamadı:', err);
                return false;
            }
        }

        async function syncAllFromCloud() {
            if (isDemoGuestSession()) {
                updateCloudSyncBadge('synced', 'Demo Modu');
                return;
            }
            if (!isFirebaseReady || !fbDb) return;
            _cloudSyncLastIssue = null;
            updateCloudSyncBadge('syncing', 'Eşitleniyor...');

            try {
                if (!IS_LOCAL_DEV && typeof fbAuth !== 'undefined' && fbAuth && !_firebaseInitialAuthResolved) {
                    await waitForFirebaseAuthReady(fbAuth, 2500);
                }

                // 1. Oturum açılmadan app_system/ai_config veya app_system/users kesinlikle okunmaz
                const uid = getActiveUserId();
                const isCloudUserSignedIn = Boolean(IS_LOCAL_DEV || !fbAuth || fbAuth.currentUser);
                if (!isCloudUserSignedIn) {
                    if (typeof window !== 'undefined') window._initialWorkoutLogsCloudSyncDone = true;
                    if (typeof syncMasterCatalogFromCloud === 'function') {
                        try { await syncMasterCatalogFromCloud(0); } catch {}
                    }
                    updateCloudSyncBadge(uid ? 'auth-required' : 'offline', uid ? 'Bulut Girişi Gerekli' : 'Bulut Hazır');
                    return;
                }

                const priorityTasks = [];
                if (IS_LOCAL_DEV || (typeof fbAuth !== 'undefined' && fbAuth && fbAuth.currentUser)) {
                    priorityTasks.push(syncAiConfigFromCloud());
                }
                if (uid) priorityTasks.push(syncUserWorkoutLogsFromCloud(uid, { forceServer: true }));
                await Promise.all(priorityTasks);

                // 2. Kişisel profili (user_profiles/{authUid}) eşitle; yöneticiyse tam listeyi yönetici portalından eşitle
                if (typeof fbAuth !== 'undefined' && fbAuth && fbAuth.currentUser) {
                    await syncOwnUserProfileFromCloud(fbAuth.currentUser);
                }
                if (typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession()) {
                    if (typeof ensureAdminPortalLoadedAndMounted === 'function') {
                        await ensureAdminPortalLoadedAndMounted();
                    }
                    if (typeof window !== 'undefined' && typeof window.syncAllUsersForAdmin === 'function') {
                        await window.syncAllUsersForAdmin();
                    }
                }

                // 3. Kalan aktif kullanıcı verilerini eşitle (otomatik direktif/program dinleme stabilite için kapalıdır)
                if (uid) {
                    await syncUserScaleLogsFromCloud(uid);
                    await syncUserMeasurementsFromCloud(uid);
                    await syncUserStateFromCloud(uid);
                }

                const hasPendingWorkout = Boolean(uid && localStorage.getItem(`celik_kodu_pending_workout_sync_${uid}`) === '1');
                if (_cloudSyncLastIssue === 'auth-required') {
                    updateCloudSyncBadge('auth-required', 'Bulut Girişi Gerekli');
                } else if (_cloudSyncLastIssue === 'permission-denied') {
                    updateCloudSyncBadge('auth-required', 'Bulut Yetki Hatası');
                } else if (_cloudSyncLastIssue === 'offline' || navigator.onLine === false) {
                    updateCloudSyncBadge('offline', 'Kuyrukta (İnternet Bekleniyor)');
                } else if (_cloudSyncLastIssue || hasPendingWorkout) {
                    updateCloudSyncBadge('offline', 'Eşitleme Bekliyor');
                } else {
                    updateCloudSyncBadge('synced', 'Bulut Aktif');
                }
            } catch (e) {
                console.warn("Bulut eşitleme gecikti:", e);
                const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
                const authMissing = Boolean(!IS_LOCAL_DEV && typeof fbAuth !== 'undefined' && fbAuth && !fbAuth.currentUser);
                if (authMissing) {
                    updateCloudSyncBadge('auth-required', 'Bulut Girişi Gerekli');
                } else if (offline) {
                    updateCloudSyncBadge('offline', 'Kuyrukta (İnternet Bekleniyor)');
                } else {
                    updateCloudSyncBadge('offline', 'Çevrimdışı');
                }
            }
        }

        async function syncAiConfigFromCloud() {
            if (!isFirebaseReady || !fbDb) return;
            if (!IS_LOCAL_DEV && (!fbAuth || !fbAuth.currentUser)) return;
            try {
                const docRef = fbDb.collection('app_system').doc('ai_config');
                const docSnap = await docRef.get();

                if (docSnap && docSnap.exists) {
                    const data = docSnap.data() || {};
                    if (data.centralBridgeConfig && typeof data.centralBridgeConfig === 'object') {
                        const baseUrl = String(data.centralBridgeConfig.baseUrl || '').trim().replace(/\/+$/, '');
                        try {
                            if (baseUrl && /^https:\/\//i.test(baseUrl)) {
                                localStorage.setItem(CENTRAL_BRIDGE_URL_KEY, baseUrl);
                            } else {
                                localStorage.removeItem(CENTRAL_BRIDGE_URL_KEY);
                            }
                        } catch {}
                    }
                    if (data.masterCatalogMeta && typeof data.masterCatalogMeta === 'object') {
                        applyMasterCatalogMeta(data.masterCatalogMeta);
                        const metaVer = Number(data.masterCatalogMeta.version || 0);
                        syncMasterCatalogFromCloud(metaVer);
                    } else {
                        syncMasterCatalogFromCloud(0);
                    }
                    try {
                        localStorage.removeItem(`${GEMINI_API_STORAGE_KEY}_usr_admin`);
                    } catch {}
                }
            } catch (err) {
                console.warn("AI config buluttan eşitlenemedi:", err);
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

        async function fetchWorkoutLogsFromLocalBridge() {
            return [];
        }

        // ANTRENMAN GEÇMİŞİ BULUT EŞİTLEME
        function mergeWorkoutLogCollections(baseLogs, incomingLogs, uid) {
            const deletedSet = new Set(typeof getDeletedWorkoutLogIds === 'function' ? getDeletedWorkoutLogIds(uid) : []);
            const logMap = new Map();
            let filteredCloudDeletion = false;

            const pickTitle = (winner, other) => {
                const w = String((winner && (winner.program || winner.title)) || '').trim();
                const o = String((other && (other.program || other.title)) || '').trim();
                return w || o || '';
            };

            const normalizeCopy = (rawLog) => {
                const copy = Object.assign({}, rawLog);
                const resolvedTitle = pickTitle(copy, null);
                if (resolvedTitle) {
                    if (!copy.program) copy.program = resolvedTitle;
                    if (!copy.title) copy.title = resolvedTitle;
                }
                return copy;
            };

            const hasTelemetry = (exList) => Array.isArray(exList) && exList.some(e => e && e.healthTelemetry);

            // T24: Firestore set() 'undefined' alanı reddeder; birleşmede boş kalan alanlar tamamen silinir
            const dropUndefinedKeys = (obj) => {
                if (obj && typeof obj === 'object') {
                    Object.keys(obj).forEach(k => { if (obj[k] === undefined) delete obj[k]; });
                }
                return obj;
            };

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
                    logMap.set(lid, normalizeCopy(l));
                    return;
                }
                const prevEd = Number(prev.userEditedAt || 0);
                const nextEd = Number(l.userEditedAt || 0);
                if (prevEd > nextEd) {
                    const winnerTitle = pickTitle(prev, l);
                    logMap.set(lid, dropUndefinedKeys(Object.assign({}, prev, {
                        program: winnerTitle || prev.program,
                        title: winnerTitle || prev.title,
                        garminActivityId: prev.garminActivityId || l.garminActivityId,
                        healthSummary: prev.healthSummary || l.healthSummary,
                        isCardioActivity: Boolean(prev.isCardioActivity || l.isCardioActivity)
                    })));
                } else {
                    const winnerTitle = pickTitle(l, prev);
                    const merged = Object.assign({}, prev, l, {
                        program: winnerTitle || l.program || prev.program,
                        title: winnerTitle || l.title || prev.title,
                        garminActivityId: l.garminActivityId || prev.garminActivityId,
                        healthSummary: l.healthSummary || prev.healthSummary,
                        isCardioActivity: Boolean(l.isCardioActivity || prev.isCardioActivity),
                        exercises: nextEd > prevEd
                            ? l.exercises
                            : (hasTelemetry(l.exercises)
                                ? l.exercises
                                : (hasTelemetry(prev.exercises) ? prev.exercises : l.exercises))
                    });
                    if (nextEd > prevEd) merged.userEditedAt = nextEd;
                    else if (prevEd > 0 && !merged.userEditedAt) merged.userEditedAt = prevEd;
                    logMap.set(lid, dropUndefinedKeys(merged));
                }
            };

            (Array.isArray(baseLogs) ? baseLogs : []).forEach(upsertLog);
            (Array.isArray(incomingLogs) ? incomingLogs : []).forEach(upsertLog);

            // Aynı gün aynı saat diliminde olan mükerrer saat kuvvet kayıtlarını zaman penceresiyle temizle;
            // farklı saatlerde yapılan 2., 3. ve 4. antrenmanlar (hem saat hem uygulama) kesinlikle korunur
            const appStrengthLogs = [];
            for (const item of logMap.values()) {
                if (item && !String(item.id || '').startsWith('garmin_') && item.sourceChief !== 'garmin-tredict-guard' && !item.isCardioActivity && item.date) {
                    appStrengthLogs.push(item);
                }
            }
            const hasSessionOverlapFn = (typeof window !== 'undefined' && window.GarminTredictChief && typeof window.GarminTredictChief.areSameDaySessionTimeWindow === 'function');
            for (const [k, item] of logMap.entries()) {
                if (
                    String(k).startsWith('garmin_') &&
                    item &&
                    item.date &&
                    !item.isCardioActivity &&
                    !item.userEditedAt
                ) {
                    const matchedApp = appStrengthLogs.find(appItem => {
                        if (hasSessionOverlapFn) {
                            return window.GarminTredictChief.areSameDaySessionTimeWindow(item, appItem);
                        }
                        const gAid = item.garminActivityId || String(item.id || '').slice('garmin_'.length);
                        return Boolean(appItem.garminActivityId && gAid && String(appItem.garminActivityId) === String(gAid));
                    });
                    if (matchedApp) {
                        if (!matchedApp.garminActivityId && item.garminActivityId) {
                            matchedApp.garminActivityId = item.garminActivityId;
                        }
                        if (!matchedApp.healthSummary && item.healthSummary) {
                            matchedApp.healthSummary = item.healthSummary;
                        }
                        logMap.delete(k);
                    }
                }
            }

            return {
                mergedLogs: sortWorkoutLogsDesc(Array.from(logMap.values())),
                filteredCloudDeletion
            };
        }

        function ensureWorkoutLogsRealtimeListener(uid) {
            if (IS_LOCAL_DEV || !isFirebaseReady || !fbDb || !uid) return;
            if (workoutLogsRealtimeUid === uid && typeof workoutLogsRealtimeUnsub === 'function') return;
            if (typeof workoutLogsRealtimeUnsub === 'function') {
                try { workoutLogsRealtimeUnsub(); } catch {}
                workoutLogsRealtimeUnsub = null;
            }
            workoutLogsRealtimeUid = uid;
            try {
                const docRef = fbDb.collection('workout_logs').doc(uid);
                if (typeof docRef.onSnapshot !== 'function') return;
                workoutLogsRealtimeUnsub = docRef.onSnapshot((snap) => {
                    if (!snap || !snap.exists) return;
                    if (snap.metadata && (snap.metadata.hasPendingWrites || snap.metadata.fromCache)) return;
                    const data = snap.data() || {};
                    if (!Array.isArray(data.logs)) return;
                    syncUserWorkoutLogsFromCloud(uid, { snapshotLogs: data.logs, snapshotData: data });
                }, (err) => {
                    console.warn("Antrenman canlı dinleyicisi geçici olarak durakladı:", err);
                });
            } catch (e) {}
        }

        async function syncUserWorkoutLogsFromCloud(uid, options = {}) {
            if (!uid) return;
            const opts = options && typeof options === 'object' ? options : {};
            ensureWorkoutLogsRealtimeListener(uid);

            if (
                !opts.snapshotLogs &&
                !opts.forceServer &&
                opts.throttleMs &&
                workoutLogsLastFetchAt[uid] &&
                (Date.now() - workoutLogsLastFetchAt[uid]) < Number(opts.throttleMs)
            ) {
                return;
            }

            try {
                const localLogs = getUserLogsById(uid);

                let cloudLogs = [];
                let cloudFetchOk = Array.isArray(opts.snapshotLogs);
                if (Array.isArray(opts.snapshotLogs)) {
                    cloudLogs = opts.snapshotLogs;
                    if (opts.snapshotData) adoptCloudSyncSealIfPresent('workout_logs', uid, opts.snapshotData);
                } else {
                    try {
                        if (isFirebaseReady && fbDb) {
                            const docRef = fbDb.collection('workout_logs').doc(uid);
                            const doc = await fetchCloudDocPreferServer(docRef);
                            workoutLogsLastFetchAt[uid] = Date.now();
                            cloudFetchOk = true;
                            if (doc && doc.exists) {
                                const data = doc.data();
                                adoptCloudSyncSealIfPresent('workout_logs', uid, data);
                                if (data && Array.isArray(data.logs)) {
                                    cloudLogs = data.logs;
                                }
                            }
                        }
                    } catch (err) {
                        console.warn("Antrenmanlar buluttan doğrudan çekilemedi:", err);
                        const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
                        const authMissing = Boolean(!IS_LOCAL_DEV && typeof fbAuth !== 'undefined' && fbAuth && !fbAuth.currentUser);
                        const isPerm = Boolean(err && (err.code === 'permission-denied' || /permission|insufficient/i.test(String(err.message || ''))));
                        if (authMissing) _cloudSyncLastIssue = 'auth-required';
                        else if (isPerm) _cloudSyncLastIssue = 'permission-denied';
                        else if (offline) _cloudSyncLastIssue = 'offline';
                        else _cloudSyncLastIssue = 'error';
                        if (!IS_LOCAL_DEV && !offline) {
                            recordCloudGateTelemetry('error', 'Antrenman Bulut Okuma', uid, String((err && err.message) || err || 'Bulut okuma hatası'), uid);
                        }
                    }
                }

                const cloudById = new Map();
                cloudLogs.forEach(c => { if (c && c.id) cloudById.set(String(c.id), c); });
                const hasLocalEditNewerThanCloud = localLogs.some(l => {
                    if (!l || !l.id) return false;
                    const cloudMatch = cloudById.get(String(l.id));
                    return Number(l.userEditedAt || 0) > Number((cloudMatch && cloudMatch.userEditedAt) || 0);
                });

                // localLogs taban, cloudLogs öncelikli: eşit zaman damgasında güncel bulut kazanır
                const { mergedLogs, filteredCloudDeletion } = mergeWorkoutLogCollections(localLogs, cloudLogs, uid);
                let normalizedCloudLogs = false;
                if (typeof window.recalculateWorkoutLogMetrics === 'function') {
                    mergedLogs.forEach(logItem => {
                        const rec = window.recalculateWorkoutLogMetrics(logItem);
                        if (rec && rec.changed) normalizedCloudLogs = true;
                    });
                }

                if (mergedLogs.length > 0 || (cloudLogs.length > 0 && filteredCloudDeletion)) {
                    localStorage.setItem(`celik_kodu_history_${uid}`, JSON.stringify(mergedLogs));
                    if (typeof window !== 'undefined') window._initialWorkoutLogsCloudSyncDone = true;
                    if (window.GarminTredictChief && typeof window.GarminTredictChief.syncWatchTitlesFromWorkoutLogs === 'function') {
                        window.GarminTredictChief.syncWatchTitlesFromWorkoutLogs(mergedLogs, uid);
                    }
                    if (window.GarminTredictChief && typeof window.GarminTredictChief.handoffCompletedActivitiesToTabChiefs === 'function') {
                        window.GarminTredictChief.handoffCompletedActivitiesToTabChiefs();
                    }
                    if (typeof renderHistory === 'function') renderHistory();
                    if (window.GarminTredictChief && typeof window.GarminTredictChief.renderHistoryGarminSyncPanel === 'function') {
                        window.GarminTredictChief.renderHistoryGarminSyncPanel();
                    }
                    applyWednesdayHammerCurlPatch();

                    if (!IS_LOCAL_DEV && cloudFetchOk && (mergedLogs.length !== cloudLogs.length || hasLocalEditNewerThanCloud || filteredCloudDeletion || normalizedCloudLogs)) {
                        await syncWorkoutLogsToCloud(mergedLogs, uid);
                    }
                }
            } finally {
                if (typeof window !== 'undefined') window._initialWorkoutLogsCloudSyncDone = true;
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
                    const docRef = fbDb.collection('workout_logs').doc(uid);
                    let logsToWrite = Array.isArray(logs) ? logs : [];
                    try {
                        const remoteDoc = await fetchCloudDocPreferServer(docRef);
                        if (remoteDoc && remoteDoc.exists) {
                            const remoteData = remoteDoc.data() || {};
                            adoptCloudSyncSealIfPresent('workout_logs', uid, remoteData);
                            const remoteLogs = Array.isArray(remoteData.logs) ? remoteData.logs : [];
                            if (remoteLogs.length > 0) {
                                const merged = mergeWorkoutLogCollections(remoteLogs, logsToWrite, uid);
                                logsToWrite = merged.mergedLogs;
                                if (JSON.stringify(logsToWrite) !== JSON.stringify(logs || [])) {
                                    try { localStorage.setItem(`celik_kodu_history_${uid}`, JSON.stringify(logsToWrite)); } catch {}
                                    if (window.GarminTredictChief && typeof window.GarminTredictChief.syncWatchTitlesFromWorkoutLogs === 'function') {
                                        window.GarminTredictChief.syncWatchTitlesFromWorkoutLogs(logsToWrite, uid);
                                    }
                                    if (typeof renderHistory === 'function') renderHistory();
                                }
                            }
                        }
                    } catch (preMergeErr) {
                        console.warn("Bulut ön birleştirme atlandı, yerel kayıt yazılıyor:", preMergeErr);
                    }

                    // T24: JSON temizliği — undefined alanlar yazımdan önce düşürülür
                    try { logsToWrite = JSON.parse(JSON.stringify(logsToWrite)); } catch {}
                    await writeAthleteDocWithSealHeal('workout_logs', uid, (seal) => ({
                        logs: logsToWrite,
                        clientUpdatedAt: Date.now(),
                        syncSeal: seal,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }));
                    localStorage.removeItem(`celik_kodu_pending_workout_sync_${uid}`);
                    _cloudSyncLastIssue = null;
                    updateCloudSyncBadge('synced', 'Bulut Aktif');
                } else {
                    const offlineErr = new Error('Firebase offline or unavailable');
                    offlineErr.code = 'unavailable';
                    throw offlineErr;
                }
            } catch (err) {
                try {
                    localStorage.setItem(`celik_kodu_pending_workout_sync_${uid}`, '1');
                } catch {}
                const offline = (typeof navigator !== 'undefined' && navigator.onLine === false) ||
                    (err && (err.code === 'unavailable' || /offline|network|failed to get/i.test(String(err.message || ''))));
                const authMissing = Boolean(!IS_LOCAL_DEV && typeof fbAuth !== 'undefined' && fbAuth && !fbAuth.currentUser);
                const isPermErr = Boolean(err && (err._k4IsPerm || err.code === 'permission-denied' || /permission|insufficient/i.test(String(err.message || ''))));
                if (!IS_LOCAL_DEV && !(err && err._k4Recorded)) {
                    recordCloudGateTelemetry(offline ? 'warn' : 'error', 'Antrenman Bulut Yazımı', uid, offline ? 'Çevrimdışı kuyruğa alındı' : String((err && err.message) || err || 'Bulut yazım hatası'), uid);
                }
                console.warn("Antrenmanlar bulut eşitleme kuyruğuna alındı:", err);
                if (offline) {
                    _cloudSyncLastIssue = 'offline';
                    updateCloudSyncBadge('offline', 'Kuyrukta (İnternet Bekleniyor)');
                } else if (authMissing) {
                    _cloudSyncLastIssue = 'auth-required';
                    updateCloudSyncBadge('auth-required', 'Bulut Girişi Gerekli');
                } else if (isPermErr) {
                    _cloudSyncLastIssue = 'permission-denied';
                    updateCloudSyncBadge('auth-required', 'Bulut Yetki Hatası');
                } else {
                    _cloudSyncLastIssue = 'error';
                    updateCloudSyncBadge('offline', 'Eşitleme Bekliyor');
                }
            }
        }
        if (typeof window !== 'undefined') {
            window.syncUserWorkoutLogsFromCloud = syncUserWorkoutLogsFromCloud;
            window.syncWorkoutLogsToCloud = syncWorkoutLogsToCloud;
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
                    console.log("7 Ekim 2026 Çarşamba seansına Dambıl Hammer Curl (3 set: 10kg, 10kg, 15kg) başarıyla eklendi.");
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
            } catch (e) {
                if (!(e && e._k4Recorded)) {
                    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
                    recordCloudGateTelemetry(offline ? 'warn' : 'error', 'Tartı Bulut Yazımı', uid, String((e && e.message) || e || 'Tartı yazım hatası'), uid);
                }
            }
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
            } catch (e) {
                if (!(e && e._k4Recorded)) {
                    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
                    recordCloudGateTelemetry(offline ? 'warn' : 'error', 'Mezura Bulut Yazımı', uid, String((e && e.message) || e || 'Mezura yazım hatası'), uid);
                }
            }
        }

        // ==================== KULLANICI DURUMU (TAKVİM, AI KOÇ, AĞIRLIK HAFIZASI, GİZLİ HAREKETLER) BULUT SENKRONU ====================
        let userStateSyncTimer = null;

        function scheduleUserStateCloudSync(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid || uid === DEMO_GUEST_UID || isDemoGuestSession()) return;
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

        const SEVEN_DAYS_RETENTION_MS = 7 * 86400000;

        function isGeneratedWorkoutDraftExpired(workout, nowMs = Date.now()) {
            if (!workout || typeof workout !== 'object' || Array.isArray(workout)) return false;
            const rawTs = Number(workout.updatedAt || workout.createdAt || 0);
            const idTsMatch = (typeof workout.id === 'string') ? workout.id.match(/^gen_(\d{12,14})$/) : null;
            const ts = (Number.isFinite(rawTs) && rawTs > 0) ? rawTs : (idTsMatch ? Number(idTsMatch[1]) : 0);
            return Boolean(ts > 0 && (nowMs - ts) > SEVEN_DAYS_RETENTION_MS);
        }

        function isWatchRecordStale7d(isoOrDate, nowMs = Date.now()) {
            if (!isoOrDate) return false;
            const iso = String(isoOrDate).slice(0, 10);
            if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                const dMs = Date.parse(iso + 'T12:00:00Z');
                return Boolean(Number.isFinite(dMs) && (nowMs - dMs) > SEVEN_DAYS_RETENTION_MS);
            }
            const parsed = Date.parse(String(isoOrDate));
            return Boolean(Number.isFinite(parsed) && (nowMs - parsed) > SEVEN_DAYS_RETENTION_MS);
        }

        function pruneStaleWatchTelemetryAndDrafts(uidOverride, options = {}) {
            const uid = uidOverride || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid) return { prunedDraft: false, prunedWatch: false, prunedManifests: false, changed: false };
            const nowMs = Number(options.nowMs) || Date.now();
            let prunedDraft = false;
            let prunedWatch = false;
            let prunedManifests = false;

            try {
                const scopedKey = getLastGeneratedWorkoutStorageKey(uid);
                const rawScoped = localStorage.getItem(scopedKey);
                if (rawScoped) {
                    const parsed = JSON.parse(rawScoped);
                    if (isGeneratedWorkoutDraftExpired(parsed, nowMs)) {
                        localStorage.removeItem(scopedKey);
                        prunedDraft = true;
                    }
                }
                const rawGlobal = localStorage.getItem('celik_kodu_last_generated_workout');
                if (rawGlobal) {
                    const parsedG = JSON.parse(rawGlobal);
                    if (parsedG && (!parsedG.userId || parsedG.userId === uid) && isGeneratedWorkoutDraftExpired(parsedG, nowMs)) {
                        localStorage.removeItem('celik_kodu_last_generated_workout');
                        if (typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && (!currentGeneratedWorkout.userId || currentGeneratedWorkout.userId === uid)) {
                            currentGeneratedWorkout = null;
                            window.currentGeneratedWorkout = null;
                        }
                        prunedDraft = true;
                    }
                }
            } catch {}

            try {
                const tKey = `celik_garmin_telemetry_v2_${uid}`;
                const rawActs = localStorage.getItem(tKey);
                if (rawActs) {
                    const arr = JSON.parse(rawActs);
                    if (Array.isArray(arr)) {
                        const fresh = arr.filter(a => a && typeof a === 'object' && !isWatchRecordStale7d(a.date, nowMs));
                        if (fresh.length !== arr.length) {
                            localStorage.setItem(tKey, JSON.stringify(fresh));
                            prunedWatch = true;
                        }
                    }
                }
            } catch {}

            try {
                const mKey = `celik_garmin_sent_manifests_v1_${uid}`;
                const rawMan = localStorage.getItem(mKey);
                if (rawMan) {
                    const manObj = JSON.parse(rawMan);
                    if (manObj && typeof manObj === 'object' && !Array.isArray(manObj)) {
                        const entries = Object.entries(manObj);
                        const freshEntries = entries.filter(([k, v]) => {
                            if (!v || typeof v !== 'object') return false;
                            if (k === '__lastSent') return true;
                            const mDate = String(k).match(/^date_(\d{4}-\d{2}-\d{2})$/);
                            const iso = mDate ? mDate[1] : String(v.sentAt || '');
                            return !isWatchRecordStale7d(iso, nowMs);
                        });
                        if (freshEntries.length !== entries.length) {
                            localStorage.setItem(mKey, JSON.stringify(Object.fromEntries(freshEntries)));
                            prunedManifests = true;
                        }
                    }
                }
            } catch {}

            return {
                prunedDraft,
                prunedWatch,
                prunedManifests,
                changed: prunedDraft || prunedWatch || prunedManifests
            };
        }
        window.pruneStaleWatchTelemetryAndDrafts = pruneStaleWatchTelemetryAndDrafts;

        function refreshWorkoutLogsForCurrentBodyweight(uidOverride, options = {}) {
            const uid = uidOverride || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!uid || typeof window.recalculateWorkoutLogMetrics !== 'function') return false;
            try {
                const historyKey = `celik_kodu_history_${uid}`;
                const raw = localStorage.getItem(historyKey);
                if (!raw) return false;
                const logs = JSON.parse(raw);
                if (!Array.isArray(logs) || logs.length === 0) return false;
                let anyChanged = false;
                logs.forEach(log => {
                    const res = window.recalculateWorkoutLogMetrics(log);
                    if (res && res.changed) anyChanged = true;
                });
                if (!anyChanged) return false;
                localStorage.setItem(historyKey, JSON.stringify(logs));
                if (options.syncToCloud !== false && !IS_LOCAL_DEV && typeof syncWorkoutLogsToCloud === 'function') {
                    syncWorkoutLogsToCloud(logs, uid);
                }
                if (!options.skipRender) {
                    if (typeof renderHistory === 'function') renderHistory();
                }
                return true;
            } catch {
                return false;
            }
        }
        window.refreshWorkoutLogsForCurrentBodyweight = refreshWorkoutLogsForCurrentBodyweight;

        function readActiveLastGeneratedWorkout(uid) {
            const targetUid = uid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            const parseValid = (raw, keyToClearIfExpired) => {
                if (!raw) return null;
                try {
                    const obj = JSON.parse(raw);
                    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
                    if (obj.userId && targetUid && obj.userId !== targetUid) return null;
                    if (obj.userId && !targetUid) return null;
                    if (isGeneratedWorkoutDraftExpired(obj)) {
                        if (keyToClearIfExpired) {
                            try { localStorage.removeItem(keyToClearIfExpired); } catch {}
                        }
                        return null;
                    }
                    return obj;
                } catch (e) {
                    return null;
                }
            };
            if (targetUid) {
                const sKey = getLastGeneratedWorkoutStorageKey(targetUid);
                const scoped = parseValid(localStorage.getItem(sKey), sKey);
                if (scoped) return scoped;
            }
            return parseValid(localStorage.getItem('celik_kodu_last_generated_workout'), 'celik_kodu_last_generated_workout');
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
            if (!uid || uid === DEMO_GUEST_UID || isDemoGuestSession()) return;
            if (!isFirebaseReady || !fbDb || navigator.onLine === false) {
                try { localStorage.setItem(`celik_kodu_pending_state_sync_${uid}`, '1'); } catch {}
                recordCloudGateTelemetry('warn', 'Durum Bulut Yazımı', uid, 'Çevrimdışı kuyruğa alındı', uid);
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
                if (lastGenVal && isGeneratedWorkoutDraftExpired(lastGenVal)) {
                    try {
                        localStorage.removeItem(`celik_kodu_last_generated_workout_${uid}`);
                        if (activeUid === uid) localStorage.removeItem('celik_kodu_last_generated_workout');
                    } catch {}
                    lastGenVal = null;
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
                delete manifestsMerged.__watchVault;
                delete manifestsMerged.__watchActivities;
                delete manifestsMerged.__wellnessSteps;
                delete manifestsMerged.__approvedWatchIds;
                delete manifestsMerged.__dismissedWatchIds;

                const localHistoryLogs = safeParse(`celik_kodu_history_${uid}`, []);
                const rawWatchTelemetry = safeParse(`celik_garmin_telemetry_v2_${uid}`, []);
                const approvedWatchIds = (Array.isArray(safeParse(`celik_garmin_approved_activities_v1_${uid}`, []))
                    ? safeParse(`celik_garmin_approved_activities_v1_${uid}`, [])
                    : []).map(String).filter(Boolean).slice(-40);
                const dismissedWatchIds = (Array.isArray(safeParse(`celik_garmin_dismissed_activities_v1_${uid}`, []))
                    ? safeParse(`celik_garmin_dismissed_activities_v1_${uid}`, [])
                    : []).map(String).filter(Boolean).slice(-40);
                const deletedWorkoutLogIds = (Array.isArray(safeParse(`celik_kodu_deleted_logs_${uid}`, []))
                    ? safeParse(`celik_kodu_deleted_logs_${uid}`, [])
                    : []).map(String).filter(Boolean).slice(-60);

                let refDayMs = NaN;
                const considerRefDate = (val) => {
                    if (!val) return;
                    const iso = String(val).slice(0, 10);
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
                    const ms = Date.parse(iso + 'T12:00:00Z');
                    if (Number.isFinite(ms) && (!Number.isFinite(refDayMs) || ms > refDayMs)) refDayMs = ms;
                };
                if (Array.isArray(localHistoryLogs)) localHistoryLogs.forEach(l => considerRefDate(l?.date));
                if (Array.isArray(rawWatchTelemetry)) rawWatchTelemetry.forEach(a => considerRefDate(a?.date));
                refDayMs = Math.max(Date.now(), Number.isFinite(refDayMs) ? refDayMs : 0);

                const prunedManifestEntries = Object.entries(manifestsMerged)
                    .filter(([k, v]) => {
                        if (!v || typeof v !== 'object') return false;
                        if (k === '__lastSent') return true;
                        const mDate = String(k).match(/^date_(\d{4}-\d{2}-\d{2})$/);
                        const iso = mDate ? mDate[1] : String(v.sentAt || '').slice(0, 10);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                            const dMs = Date.parse(iso + 'T12:00:00Z');
                            if (Number.isFinite(dMs) && (refDayMs - dMs) > SEVEN_DAYS_RETENTION_MS) return false;
                        }
                        return true;
                    })
                    .sort((a, b) => {
                        if (a[0] === '__lastSent') return -1;
                        if (b[0] === '__lastSent') return 1;
                        return String(b[1]?.sentAt || b[0]).localeCompare(String(a[1]?.sentAt || a[0]));
                    })
                    .slice(0, 12);
                const leanManifests = Object.fromEntries(prunedManifestEntries);
                if (approvedWatchIds.length > 0) leanManifests.__approvedWatchIds = approvedWatchIds;
                if (dismissedWatchIds.length > 0) leanManifests.__dismissedWatchIds = dismissedWatchIds;

                const localWatchVault = safeParse(`celik_garmin_watch_vault_v1_${uid}`, null);
                if (localWatchVault && typeof localWatchVault === 'object' && !Array.isArray(localWatchVault)) {
                    leanManifests.__watchVault = {
                        enabled: localWatchVault.enabled !== false,
                        sealedTredict: typeof localWatchVault.sealedTredict === 'string' ? localWatchVault.sealedTredict : '',
                        sealedIntervals: typeof localWatchVault.sealedIntervals === 'string' ? localWatchVault.sealedIntervals : '',
                        sealedGateway: typeof localWatchVault.sealedGateway === 'string' ? localWatchVault.sealedGateway : '',
                        sealRef: typeof localWatchVault.sealRef === 'string' ? localWatchVault.sealRef : '',
                        updatedAt: Number(localWatchVault.updatedAt || Date.now())
                    };
                }

                if (Array.isArray(rawWatchTelemetry) && rawWatchTelemetry.length > 0) {
                    const approvedSet = new Set(approvedWatchIds);
                    const dismissedSet = new Set(dismissedWatchIds);
                    const deletedSet = new Set(deletedWorkoutLogIds);
                    const historyActIds = new Set();
                    if (Array.isArray(localHistoryLogs)) {
                        localHistoryLogs.forEach(l => {
                            if (!l) return;
                            if (l.garminActivityId) historyActIds.add(String(l.garminActivityId));
                            const lid = String(l.id || '');
                            if (lid.startsWith('garmin_')) historyActIds.add(lid.slice('garmin_'.length));
                        });
                    }
                    const compactWatchList = rawWatchTelemetry
                        .filter(a => {
                            if (!a || typeof a !== 'object' || !a.id) return false;
                            const aid = String(a.id);
                            if (dismissedSet.has(aid) || approvedSet.has(aid) || historyActIds.has(aid) || deletedSet.has(aid) || deletedSet.has(`garmin_${aid}`)) {
                                return false;
                            }
                            const iso = String(a.date || '').slice(0, 10);
                            if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
                                const dMs = Date.parse(iso + 'T12:00:00Z');
                                if (Number.isFinite(dMs) && (refDayMs - dMs) > 7 * 86400000) return false;
                            }
                            return true;
                        })
                        .slice(0, 5)
                        .map(a => {
                            const sm = (a.summary && typeof a.summary === 'object') ? a.summary : a;
                            return {
                                id: String(a.id),
                                date: String(a.date || ''),
                                title: String(a.title || ''),
                                sportType: String(a.sportType || ''),
                                subSportType: String(a.subSportType || ''),
                                summary: {
                                    duration: Number(sm.duration || 0),
                                    durationTotal: Number(sm.durationTotal || sm.duration || 0),
                                    distance: Number(sm.distance || 0),
                                    calories: Number(sm.calories || 0),
                                    heartrate: Number(sm.heartrate || 0),
                                    heartrateMax: Number(sm.heartrateMax || 0),
                                    pace: Number(sm.pace || 0),
                                    cadence: Number(sm.cadence || 0),
                                    cadenceMax: Number(sm.cadenceMax || 0)
                                },
                                sourceProvider: String(a.sourceProvider || '')
                            };
                        });
                    if (compactWatchList.length > 0) {
                        leanManifests.__watchActivities = compactWatchList;
                    }
                }

                const rawWellnessSteps = safeParse(`celik_garmin_wellness_steps_v1_${uid}`, null);
                if (rawWellnessSteps && typeof rawWellnessSteps === 'object' && !Array.isArray(rawWellnessSteps)) {
                    const stepDates = Object.keys(rawWellnessSteps)
                        .filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k))
                        .sort()
                        .slice(-30);
                    if (stepDates.length > 0) {
                        const compactWellness = {};
                        stepDates.forEach(dt => {
                            const entry = rawWellnessSteps[dt];
                            if (entry && typeof entry === 'object') compactWellness[dt] = entry;
                        });
                        leanManifests.__wellnessSteps = compactWellness;
                    }
                }

                const ensureMapOr = (val, maxKeys, fallback) => {
                    if (!val || typeof val !== 'object' || Array.isArray(val)) return fallback;
                    return Object.keys(val).length <= maxKeys ? val : fallback;
                };
                const ensureListMax = (val, maxItems) => (Array.isArray(val) ? val.slice(0, maxItems) : []);

                let diagForCatch = uid;
                try {
                    const clientUpdatedAt = Number(localStorage.getItem(`celik_kodu_state_updated_at_${uid}`) || Date.now());
                    const statePayloadCore = stripWatchBridgeSecretsFromObj({
                        weeklySchedule: ensureMapOr(safeParse(`celik_kodu_weekly_schedule_${uid}`, {}), 50, {}),
                        nextWeeklySchedule: ensureMapOr(safeParse(`celik_kodu_next_weekly_schedule_${uid}`, {}), 50, {}),
                        dateSchedule: ensureMapOr(safeParse(`celik_kodu_date_schedule_${uid}`, {}), 1500, {}),
                        rememberedWeights: ensureMapOr(safeParse(`celik_kodu_last_weights_${uid}`, {}), 1500, {}),
                        excludedExercises: ensureListMax(safeExclIds, 1000),
                        excludedExercisesUpdatedAt: Number.isFinite(Number(exclUpdatedAt)) ? Number(exclUpdatedAt) : 0,
                        customPrograms: ensureListMax(safeCustomPrograms, 200),
                        deletedCustomProgramIds: ensureListMax(safeDeletedIds, 500),
                        deletedWorkoutLogIds: ensureListMax(deletedWorkoutLogIds, 500),
                        mobilityTests: ensureMapOr(safeMobilityTests, 20, { history: [], updatedAt: 0 }),
                        selectedEquipments: ensureListMax(Array.isArray(selectedEquipments) ? selectedEquipments : [], 200),
                        customGyms: ensureListMax(safeParse(`celik_kodu_custom_gyms_${uid}`, []), 200),
                        aiDoctrine: String(currentSelectedDoctrine || 'bb_hybrid').slice(0, 120),
                        aiCoachSummary: ensureMapOr(safeParse(`celik_kodu_ai_program_${uid}`, null), 100, null),
                        lastGeneratedWorkout: ensureMapOr(safeLastGen, 100, null),
                        activeWorkoutDraft: ensureMapOr(safeParse(`celik_kodu_active_state_${uid}`, null), 100, null),
                        garminManifests: ensureMapOr(leanManifests, 1500, {})
                    });
                    diagForCatch = `${uid} (${diagnoseCloudPayloadPreFlight('user_state', statePayloadCore, '')})`;
                    await writeAthleteDocWithSealHeal('user_state', uid, (seal) => Object.assign({}, statePayloadCore, {
                        clientUpdatedAt,
                        syncSeal: seal,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }));
                    localStorage.removeItem(`celik_kodu_pending_state_sync_${uid}`);
                } catch (innerErr) {
                    if (innerErr && typeof innerErr === 'object' && !innerErr._k4DiagSummary) innerErr._k4DiagSummary = diagForCatch;
                    throw innerErr;
                }
            } catch (err) {
                try { localStorage.setItem(`celik_kodu_pending_state_sync_${uid}`, '1'); } catch {}
                if (!(err && err._k4Recorded)) {
                    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
                    recordCloudGateTelemetry(offline ? 'warn' : 'error', 'Durum Bulut Yazımı', (err && err._k4DiagSummary) || uid, String((err && err.message) || err || 'Durum yazım hatası'), uid);
                }
                console.warn("Kullanıcı durumu çevrimdışı kuyruğa alındı:", err);
            }
        }
        window.syncUserStateToCloud = syncUserStateToCloud;

        async function syncUserStateFromCloud(targetUid) {
            const uid = targetUid || (typeof getActiveUserId === 'function' ? getActiveUserId() : null);
            if (!isFirebaseReady || !fbDb || !uid || uid === DEMO_GUEST_UID || isDemoGuestSession()) return;
            try {
                const docRef = fbDb.collection('user_state').doc(uid);
                const doc = await fetchCloudDocPreferServer(docRef);
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

                // Merge lastGeneratedWorkout with timestamp comparison, 7-day expiry, and repair writeback
                const rawLocalGen = safeParseCloud(`celik_kodu_last_generated_workout_${uid}`, null)
                    || (activeUid === uid ? safeParseCloud('celik_kodu_last_generated_workout', null) : null);
                let localGenValid = (rawLocalGen && typeof rawLocalGen === 'object' && (!rawLocalGen.userId || rawLocalGen.userId === uid))
                    ? rawLocalGen
                    : null;
                if (localGenValid && isGeneratedWorkoutDraftExpired(localGenValid)) {
                    persistLastGeneratedWorkout(null, uid, { clearIfNull: true, skipCloudSync: true });
                    localGenValid = null;
                    hasUnsyncedLocalDiff = true;
                }
                if (data.lastGeneratedWorkout && typeof data.lastGeneratedWorkout === 'object') {
                    if (isGeneratedWorkoutDraftExpired(data.lastGeneratedWorkout)) {
                        persistLastGeneratedWorkout(null, uid, { clearIfNull: true, skipCloudSync: true });
                        if (activeUid === uid && typeof currentGeneratedWorkout !== 'undefined') {
                            currentGeneratedWorkout = null;
                            window.currentGeneratedWorkout = null;
                        }
                        hasUnsyncedLocalDiff = true;
                    } else {
                        const cloudGenTs = Number(data.lastGeneratedWorkout.updatedAt || data.lastGeneratedWorkout.createdAt || cloudUpdatedAt || 0);
                        const localGenTs = Number(localGenValid?.updatedAt || localGenValid?.createdAt || localUpdatedAt || 0);
                        if (!localGenValid || (!hasPendingLocalState && cloudGenTs >= localGenTs)) {
                            const beforeSig = JSON.stringify((data.lastGeneratedWorkout.exercises || []).map(e => [
                                e && e.id, e && e.targetSets, e && e.targetReps, e && e.metricMode, e && e.isCardioMinutes, e && e.isTimeBased
                            ]));
                            const savedGen = persistLastGeneratedWorkout(data.lastGeneratedWorkout, uid, {
                                fromCloud: true,
                                skipCloudSync: true,
                                preserveUpdatedAt: true
                            });
                            if (savedGen) {
                                const afterSig = JSON.stringify((savedGen.exercises || []).map(e => [
                                    e && e.id, e && e.targetSets, e && e.targetReps, e && e.metricMode, e && e.isCardioMinutes, e && e.isTimeBased
                                ]));
                                if (beforeSig !== afterSig) {
                                    hasUnsyncedLocalDiff = true;
                                }
                            }
                            if (activeUid === uid && savedGen && typeof currentGeneratedWorkout !== 'undefined') {
                                currentGeneratedWorkout = savedGen;
                                window.currentGeneratedWorkout = savedGen;
                            }
                        } else if (localGenValid && localGenTs > cloudGenTs) {
                            hasUnsyncedLocalDiff = true;
                        }
                    }
                } else if (localGenValid) {
                    hasUnsyncedLocalDiff = true;
                }

                if (data.activeWorkoutDraft && typeof data.activeWorkoutDraft === 'object' && !localStorage.getItem(`celik_kodu_active_state_${uid}`)) {
                    localStorage.setItem(`celik_kodu_active_state_${uid}`, JSON.stringify(data.activeWorkoutDraft));
                }

                // Silinen geçmiş kayıtlarını çift yönlü birleştir (yeni eklenen silme kararları buluta da çıkar)
                const delLogKey = `celik_kodu_deleted_logs_${uid}`;
                const localDeletedLogs = Array.isArray(safeParseCloud(delLogKey, []))
                    ? safeParseCloud(delLogKey, []).map(String).filter(Boolean)
                    : [];
                const cloudDeletedLogs = Array.isArray(data.deletedWorkoutLogIds)
                    ? data.deletedWorkoutLogIds.map(String).filter(Boolean)
                    : [];
                const cloudDeletedLogsSet = new Set(cloudDeletedLogs);
                if (localDeletedLogs.some(id => !cloudDeletedLogsSet.has(id))) {
                    hasUnsyncedLocalDiff = true;
                }
                const mergedDeletedLogs = Array.from(new Set([...cloudDeletedLogs, ...localDeletedLogs])).slice(-60);
                if (mergedDeletedLogs.length > 0) {
                    localStorage.setItem(delLogKey, JSON.stringify(mergedDeletedLogs));
                }
                const mergedDeletedLogsSet = new Set(mergedDeletedLogs);

                if (data.garminManifests && typeof data.garminManifests === 'object') {
                    const cloudManifests = Object.assign({}, data.garminManifests);
                    const cloudWatchVault = cloudManifests.__watchVault;
                    const cloudWatchActivities = cloudManifests.__watchActivities;
                    const cloudWellnessSteps = cloudManifests.__wellnessSteps;
                    const cloudApprovedWatchIds = Array.isArray(cloudManifests.__approvedWatchIds)
                        ? cloudManifests.__approvedWatchIds.map(String).filter(Boolean)
                        : [];
                    const cloudDismissedWatchIds = Array.isArray(cloudManifests.__dismissedWatchIds)
                        ? cloudManifests.__dismissedWatchIds.map(String).filter(Boolean)
                        : [];
                    delete cloudManifests.__watchVault;
                    delete cloudManifests.__watchActivities;
                    delete cloudManifests.__wellnessSteps;
                    delete cloudManifests.__approvedWatchIds;
                    delete cloudManifests.__dismissedWatchIds;

                    const appWatchKey = `celik_garmin_approved_activities_v1_${uid}`;
                    const localApprovedWatchIds = Array.isArray(safeParseCloud(appWatchKey, []))
                        ? safeParseCloud(appWatchKey, []).map(String).filter(Boolean)
                        : [];
                    const cloudAppSet = new Set(cloudApprovedWatchIds);
                    if (localApprovedWatchIds.some(id => !cloudAppSet.has(id))) {
                        hasUnsyncedLocalDiff = true;
                    }
                    const mergedApprovedWatchIds = Array.from(new Set([...cloudApprovedWatchIds, ...localApprovedWatchIds])).slice(-100);
                    if (mergedApprovedWatchIds.length > 0) {
                        localStorage.setItem(appWatchKey, JSON.stringify(mergedApprovedWatchIds));
                    }

                    const disWatchKey = `celik_garmin_dismissed_activities_v1_${uid}`;
                    const localDismissedWatchIds = Array.isArray(safeParseCloud(disWatchKey, []))
                        ? safeParseCloud(disWatchKey, []).map(String).filter(Boolean)
                        : [];
                    const cloudDisSet = new Set(cloudDismissedWatchIds);
                    if (localDismissedWatchIds.some(id => !cloudDisSet.has(id))) {
                        hasUnsyncedLocalDiff = true;
                    }
                    const mergedDismissedWatchIds = Array.from(new Set([...cloudDismissedWatchIds, ...localDismissedWatchIds])).slice(-100);
                    if (mergedDismissedWatchIds.length > 0) {
                        localStorage.setItem(disWatchKey, JSON.stringify(mergedDismissedWatchIds));
                    }
                    const mergedDismissedSet = new Set(mergedDismissedWatchIds);

                    if (cloudWatchVault && typeof cloudWatchVault === 'object' && !Array.isArray(cloudWatchVault)) {
                        const vKey = `celik_garmin_watch_vault_v1_${uid}`;
                        const localVault = safeParseCloud(vKey, null);
                        const cloudVaultTs = Number(cloudWatchVault.updatedAt || 0);
                        const localVaultTs = Number(localVault?.updatedAt || 0);
                        const cloudHasCreds = Boolean(cloudWatchVault.sealedTredict || cloudWatchVault.sealedIntervals);
                        const localHasCreds = Boolean(localVault?.sealedTredict || localVault?.sealedIntervals);
                        if (!localVault || (!hasPendingLocalState && cloudVaultTs >= localVaultTs) || (cloudHasCreds && !localHasCreds)) {
                            localStorage.setItem(vKey, JSON.stringify(cloudWatchVault));
                        } else if (localVaultTs > cloudVaultTs && localHasCreds) {
                            hasUnsyncedLocalDiff = true;
                        }
                    }

                    if (Array.isArray(cloudWatchActivities) && cloudWatchActivities.length > 0) {
                        const tKey = `celik_garmin_telemetry_v2_${uid}`;
                        const localActs = safeParseCloud(tKey, []);
                        const actMap = new Map();
                        const pickPreferredWatchAct = (prev, next) => {
                            if (!prev) return next;
                            if (!next) return prev;
                            const prevEd = Number(prev.userEditedAt || 0);
                            const nextEd = Number(next.userEditedAt || 0);
                            const prevRounds = Array.isArray(prev.rounds) ? prev.rounds.length : 0;
                            const nextRounds = Array.isArray(next.rounds) ? next.rounds.length : 0;
                            const base = nextRounds > prevRounds
                                ? Object.assign({}, prev, next)
                                : Object.assign({}, next, prev);
                            if (prevEd > nextEd) {
                                base.title = prev.title || next.title;
                                base.userEditedAt = prevEd;
                            } else if (nextEd > prevEd) {
                                base.title = next.title || prev.title;
                                base.userEditedAt = nextEd;
                            } else if (prev.title) {
                                base.title = prev.title;
                            }
                            return base;
                        };
                        cloudWatchActivities.forEach(a => {
                            if (!a || !a.id) return;
                            const aid = String(a.id);
                            if (isWatchRecordStale7d(a.date)) {
                                hasUnsyncedLocalDiff = true;
                                return;
                            }
                            if (mergedDismissedSet.has(aid) || mergedDeletedLogsSet.has(aid) || mergedDeletedLogsSet.has(`garmin_${aid}`)) return;
                            actMap.set(aid, a);
                        });
                        if (Array.isArray(localActs)) {
                            localActs.forEach(a => {
                                if (!a || !a.id) return;
                                const aid = String(a.id);
                                if (isWatchRecordStale7d(a.date)) {
                                    hasUnsyncedLocalDiff = true;
                                    return;
                                }
                                if (mergedDismissedSet.has(aid) || mergedDeletedLogsSet.has(aid) || mergedDeletedLogsSet.has(`garmin_${aid}`)) return;
                                actMap.set(aid, pickPreferredWatchAct(actMap.get(aid), a));
                            });
                        }
                        const mergedActs = Array.from(actMap.values())
                            .sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')))
                            .slice(0, 12);
                        localStorage.setItem(tKey, JSON.stringify(mergedActs));
                    }

                    if (cloudWellnessSteps && typeof cloudWellnessSteps === 'object' && !Array.isArray(cloudWellnessSteps)) {
                        const wKey = `celik_garmin_wellness_steps_v1_${uid}`;
                        const localW = safeParseCloud(wKey, {}) || {};
                        const cloudDateSource = (cloudWellnessSteps.days && typeof cloudWellnessSteps.days === 'object')
                            ? cloudWellnessSteps.days
                            : cloudWellnessSteps;
                        const mergedW = Object.assign({}, localW);
                        delete mergedW.days;
                        delete mergedW.updatedAt;
                        for (const [dKey, cVal] of Object.entries(cloudDateSource)) {
                            if (!/^\d{4}-\d{2}-\d{2}$/.test(dKey) || !cVal || typeof cVal !== 'object') continue;
                            const lVal = mergedW[dKey];
                            if (!lVal || Number(cVal.steps || 0) >= Number(lVal.steps || 0)) {
                                mergedW[dKey] = Object.assign({}, lVal || {}, cVal, { date: cVal.date || dKey });
                            }
                        }
                        localStorage.setItem(wKey, JSON.stringify(mergedW));
                    }

                    const mKey = `celik_garmin_sent_manifests_v1_${uid}`;
                    const localM = safeParseCloud(mKey, {}) || {};
                    delete localM.__watchVault;
                    delete localM.__watchActivities;
                    delete localM.__wellnessSteps;
                    delete localM.__approvedWatchIds;
                    delete localM.__dismissedWatchIds;
                    const combinedManifestEntries = Object.entries(Object.assign({}, cloudManifests, localM))
                        .filter(([k, v]) => {
                            if (!v || typeof v !== 'object') return false;
                            if (k === '__lastSent') return true;
                            const mDate = String(k).match(/^date_(\d{4}-\d{2}-\d{2})$/);
                            const iso = mDate ? mDate[1] : String(v.sentAt || '');
                            if (isWatchRecordStale7d(iso)) {
                                hasUnsyncedLocalDiff = true;
                                return false;
                            }
                            return true;
                        })
                        .sort((a, b) => {
                            if (a[0] === '__lastSent') return -1;
                            if (b[0] === '__lastSent') return 1;
                            return String(b[1]?.sentAt || b[0]).localeCompare(String(a[1]?.sentAt || a[0]));
                        })
                        .slice(0, 12);
                    localStorage.setItem(mKey, JSON.stringify(Object.fromEntries(combinedManifestEntries)));

                    if (typeof window !== 'undefined' && window.GarminTredictChief && typeof window.GarminTredictChief.refreshFromCentralVault === 'function') {
                        try { window.GarminTredictChief.refreshFromCentralVault(uid); } catch {}
                    }
                }
                if (pruneStaleWatchTelemetryAndDrafts(uid).changed) {
                    hasUnsyncedLocalDiff = true;
                }
                if (!hasPendingLocalState && cloudUpdatedAt > localUpdatedAt && !hasUnsyncedLocalDiff) {
                    localStorage.setItem(`celik_kodu_state_updated_at_${uid}`, String(cloudUpdatedAt));
                } else if (!IS_LOCAL_DEV && (hasPendingLocalState || localUpdatedAt > cloudUpdatedAt || hasUnsyncedLocalDiff)) {
                    if (hasUnsyncedLocalDiff && cloudUpdatedAt >= localUpdatedAt) {
                        localStorage.setItem(`celik_kodu_state_updated_at_${uid}`, String(Date.now()));
                    }
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
                if (isActiveTab('generatorTab') && window.generatedWorkoutNeedsPreview === true && typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout && typeof renderGeneratedWorkout === 'function') {
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
            'a924925a37aaa6c8e9f3d54b4f00a30b1d7445611efb0ee3641b3c959e13fea7', // legacy 3-digit sequential
            '03cde27561b94bc8b0f58721b21c3c5010435fd22dc6d202106c262c7e010bbc'  // legacy 6-digit sequential
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
                users = [];
            } else {
                let hasChanged = false;
                if (users.some(u => u && u.id === 'usr_1792524620913')) {
                    users = users.filter(u => u && u.id !== 'usr_1792524620913');
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
                    // Geçerli güçlü yerel doğrulayıcı varsa izole kasaya taşı
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
                    if (u.avatar && /\p{Extended_Pictographic}/u.test(String(u.avatar))) {
                        u.avatar = sanitizeAvatarMonogram(u.avatar, 'SP');
                        hasChanged = true;
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
            const sanitized = (Array.isArray(users) ? users : []).map(u => stripSecretsFromUserRecord(u)).filter(Boolean);
            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(sanitized));
            if (typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession() && typeof window !== 'undefined' && typeof window.syncUsersToCloud === 'function') {
                window.syncUsersToCloud(sanitized);
            }
        }

        function sanitizeSessionRecord(session) {
            if (!session || typeof session !== 'object') return session;
            const legacyAdminFlagKey = 'fbAdmin' + 'Verified';
            if (legacyAdminFlagKey in session) {
                delete session[legacyAdminFlagKey];
            }
            return session;
        }

        function getSession() {
            try {
                const raw = localStorage.getItem('celik_kodu_session');
                if (raw) {
                    const session = sanitizeSessionRecord(JSON.parse(raw));
                    const isValidDemoSession = Boolean(
                        session &&
                        session.isDemoGuest === true &&
                        session.userId === DEMO_GUEST_UID &&
                        session.role === 'athlete' &&
                        session.authVerified === false
                    );
                    // Güvenlik Doğrulaması: Yalnızca şifre ile doğrulanmış oturumları veya yetkisiz demo misafir oturumunu tanı.
                    if ((session && session.userId && session.authVerified === true) || isValidDemoSession) {
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
            sanitizeSessionRecord(session);
            currentSession = session;
            if (session) {
                if (session.isDemoGuest === true || session.userId === DEMO_GUEST_UID) {
                    session.isDemoGuest = true;
                    session.authVerified = false;
                } else {
                    session.authVerified = true;
                }
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
                if (session.isDemoGuest) {
                    updateCloudSyncBadge('synced', 'Demo Modu');
                } else {
                    flushPendingCloudOutbox().then(() => syncAllFromCloud()).catch(() => {});
                }
            } else {
                unmountAdminPortalFromDOM();
                localStorage.removeItem('celik_kodu_session');
                currentSession = null;
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
            if (uid === DEMO_GUEST_UID) return { ...DEMO_GUEST_USER };
            const users = getAuthUsers();
            return users.find(u => u.id === uid) || null;
        }

        function enterGuestDemoMode() {
            setSession({
                userId: DEMO_GUEST_UID,
                username: 'demo',
                role: 'athlete',
                name: 'Misafir Sporcu',
                isDemoGuest: true,
                authVerified: false,
                passwordPolicyVerified: true,
                loginAt: Date.now()
            });
            updateCloudSyncBadge('synced', 'Demo Modu');
            if (typeof selectedEquipments !== 'undefined') selectedEquipments = ['dumbbell', 'bench', 'bodyweight'];
            if (typeof selectedSplits !== 'undefined') selectedSplits = ['full_body'];
            if (typeof selectedSplit !== 'undefined') selectedSplit = 'full_body';
            window.aiGeneratorScope = 'single';
            if (typeof setAiGeneratorScope === 'function') setAiGeneratorScope('single');
            if (typeof renderEquipChips === 'function') renderEquipChips();
            if (typeof renderSplitCards === 'function') renderSplitCards();
            if (typeof handleGenerateWorkout === 'function') handleGenerateWorkout('bb_hybrid', '');
            if (typeof renderLibrary === 'function') renderLibrary();
            if (typeof renderLibraryExerciseCatalog === 'function') renderLibraryExerciseCatalog();
            if (typeof switchTab === 'function') switchTab('generatorTab');
        }
        window.enterGuestDemoMode = enterGuestDemoMode;

        let _adminPortalScriptLoadingPromise = null;

        const {
            refreshVerifiedAdminClaim,
            isVerifiedAdminSession
        } = (() => {
            let _verifiedAdminFirebaseUid = null;

            async function refreshVerifiedAdminClaim(fbUser) {
                if (!fbUser || typeof fbUser.getIdTokenResult !== 'function') {
                    _verifiedAdminFirebaseUid = null;
                    return false;
                }
                try {
                    const tokenRes = await fbUser.getIdTokenResult();
                    const claims = (tokenRes && tokenRes.claims) || {};
                    const isAdminClaim = Boolean(claims.admin === true || claims.role === 'admin');
                    _verifiedAdminFirebaseUid = isAdminClaim && fbUser.uid ? String(fbUser.uid) : null;
                    return isAdminClaim;
                } catch (e) {
                    _verifiedAdminFirebaseUid = null;
                    return false;
                }
            }

            function isVerifiedAdminSession(sessionOverride) {
                const session = sessionOverride || getSession();
                if (!session || session.role !== 'admin' || session.authVerified !== true) return false;
                if (
                    typeof IS_LOCAL_DEV !== 'undefined' && !IS_LOCAL_DEV &&
                    typeof isFirebaseReady !== 'undefined' && isFirebaseReady &&
                    typeof fbAuth !== 'undefined' && fbAuth
                ) {
                    const cu = fbAuth.currentUser;
                    return Boolean(cu && _verifiedAdminFirebaseUid && cu.uid === _verifiedAdminFirebaseUid);
                }
                return true;
            }

            return { refreshVerifiedAdminClaim, isVerifiedAdminSession };
        })();

        function unmountAdminPortalFromDOM() {
            if (typeof window !== 'undefined' && window.CelikAdminPortal && typeof window.CelikAdminPortal.unmountAdminPortalDOM === 'function') {
                window.CelikAdminPortal.unmountAdminPortalDOM();
                return;
            }
            if (typeof document === 'undefined') return;
            ['adminModal', 'approvalEmailDispatchModal', 'profileTabAdminBtn', 'headerAdminTelemetryBtn', 'btnAdminPanelPopup', 'sheetAdminBtn'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.classList && typeof el.classList.remove === 'function') el.classList.remove('active');
                    if (el.style) el.style.display = 'none';
                    if (typeof el.remove === 'function') el.remove();
                }
            });
            const profileMount = document.getElementById('profileAdminMountPoint');
            if (profileMount) profileMount.innerHTML = '';
        }

        function ensureAdminPortalMountedSync(sessionOverride) {
            if (!isVerifiedAdminSession(sessionOverride)) {
                unmountAdminPortalFromDOM();
                return false;
            }
            if (typeof window !== 'undefined' && window.CelikAdminPortal && typeof window.CelikAdminPortal.mountAdminPortalDOM === 'function') {
                const ok = window.CelikAdminPortal.mountAdminPortalDOM();
                if (ok && typeof applyProfileTabDarkSurfaceStyles === 'function') applyProfileTabDarkSurfaceStyles();
                return ok;
            }
            return false;
        }

        async function ensureAdminPortalLoadedAndMounted(sessionOverride) {
            if (!isVerifiedAdminSession(sessionOverride)) {
                unmountAdminPortalFromDOM();
                return false;
            }
            if (ensureAdminPortalMountedSync(sessionOverride)) {
                return true;
            }
            if (typeof document === 'undefined' || typeof document.createElement !== 'function' || !document.head || typeof document.head.appendChild !== 'function') {
                return false;
            }
            if (!_adminPortalScriptLoadingPromise) {
                _adminPortalScriptLoadingPromise = new Promise((resolve) => {
                    try {
                        const script = document.createElement('script');
                        script.src = 'js/chiefs/admin-portal.js?v=349';
                        script.async = false;
                        script.onload = () => resolve(true);
                        script.onerror = () => {
                            _adminPortalScriptLoadingPromise = null;
                            resolve(false);
                        };
                        document.head.appendChild(script);
                    } catch (e) {
                        _adminPortalScriptLoadingPromise = null;
                        resolve(false);
                    }
                });
            }
            const loaded = await _adminPortalScriptLoadingPromise;
            if (loaded && ensureAdminPortalMountedSync()) {
                if (typeof updateAdminPendingBadges === 'function') updateAdminPendingBadges();
                return true;
            }
            return false;
        }

        async function syncUserRoleDocument(fbUser, appUser) {
            if (IS_LOCAL_DEV || !isFirebaseReady || !fbDb || !fbUser || !fbUser.uid) return false;
            if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
            try {
                const email = String(fbUser.email || (appUser && appUser.fbAuthEmail) || '').trim().toLowerCase();
                let isClaimAdmin = false;
                try {
                    const tok = await fbUser.getIdTokenResult();
                    if (tok && tok.claims && (tok.claims.role === 'admin' || tok.claims.admin === true)) {
                        isClaimAdmin = true;
                    }
                } catch {}
                const roleRef = fbDb.collection('user_roles').doc(fbUser.uid);
                let existingData = null;
                try {
                    const snap = await roleRef.get();
                    if (snap && snap.exists) existingData = snap.data() || null;
                } catch {}
                if (existingData && !isClaimAdmin) {
                    return true;
                }
                const resolvedRole = isClaimAdmin ? 'admin' : 'athlete';
                const cleanFbUid = String(fbUser.uid).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
                const resolvedAppUid = (appUser && appUser.id)
                    ? String(appUser.id)
                    : ((existingData && existingData.appUid) || ('usr_' + cleanFbUid));
                await roleRef.set({
                    role: resolvedRole,
                    appUid: resolvedAppUid,
                    email,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                return true;
            } catch (e) {
                return false;
            }
        }

        if (typeof window !== 'undefined') {
            window.isVerifiedAdminSession = isVerifiedAdminSession;
            window.refreshVerifiedAdminClaim = refreshVerifiedAdminClaim;
            window.unmountAdminPortalFromDOM = unmountAdminPortalFromDOM;
            window.ensureAdminPortalLoadedAndMounted = ensureAdminPortalLoadedAndMounted;
            window.getAuthUsers = getAuthUsers;
            window.saveAuthUsers = saveAuthUsers;
            window.getSession = getSession;
            window.getActiveUserId = getActiveUserId;
            window.getActiveUser = getActiveUser;
            window.normalizeAuthString = normalizeAuthString;
            window.toUsernameDocId = toUsernameDocId;
            window.sanitizeAvatarMonogram = sanitizeAvatarMonogram;
            window.generateSecureSalt = generateSecureSalt;
            window.sha256Hex = sha256Hex;
            window.setLocalUserCred = setLocalUserCred;
            window.getLocalUserCred = getLocalUserCred;
            window.getCanonicalFbAuthEmail = getCanonicalFbAuthEmail;
            window.getSecondaryFirebaseAuth = getSecondaryFirebaseAuth;
            window.buildUserProfileDocPayload = buildUserProfileDocPayload;
            window.syncOwnUserProfileToCloud = syncOwnUserProfileToCloud;
            window.__celikGetFirebaseHandles = () => ({ fbDb, fbAuth, secondaryFbApp, isFirebaseReady, IS_LOCAL_DEV });
        }

        function syncAppViewState() {
            const session = getSession();
            const loginScreen = document.getElementById('loginScreen');
            const mainAppWrapper = document.getElementById('mainAppWrapper');

            if (!session) {
                unmountAdminPortalFromDOM();
                if (loginScreen) loginScreen.classList.add('active');
                if (mainAppWrapper) mainAppWrapper.style.display = 'none';
                return;
            }

            // Mevcut açık oturumda yalnızca açıkça geçici şifre (mustChangePassword) işaretliyse şifre yenilemeye yönlendir;
            // bulut eşitlemesi kaynaklı eksik alanlar yüzünden doğrulanmış aktif oturumu asla düşürme!
            const users = getAuthUsers();
            const activeUser = users.find(u => u.id === session.userId);
            if (activeUser && activeUser.mustChangePassword === true && !session.passwordPolicyVerified) {
                unmountAdminPortalFromDOM();
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

            const isAdmin = isVerifiedAdminSession(session);
            if (isAdmin) {
                if (!ensureAdminPortalMountedSync(session)) {
                    ensureAdminPortalLoadedAndMounted(session);
                }
            } else {
                unmountAdminPortalFromDOM();
            }

            const roleBadge = document.getElementById('headerUserRoleBadge');
            if (roleBadge) {
                roleBadge.innerText = isAdmin ? 'YÖNETİCİ' : (isDemoGuestSession(session) ? 'DEMO' : 'SPORCU');
                roleBadge.className = 'auth-role-tag ' + (isAdmin ? 'role-admin' : 'role-athlete');
                roleBadge.style.display = (isAdmin || isDemoGuestSession(session)) ? 'inline-block' : 'none';
            }

            updateAdminPendingBadges();

            applyActiveUserProfile();
        }

        let pendingForgotOtpState = null;
        let pendingWeakPasswordUpgradeState = null;

        const COMMON_WEAK_PASSWORDS_SET = new Set([
            '123', '1234', '12345', '111111', '11111111', '000000', '00000000',
            '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999',
            'password', 'password1', 'password123', 'pass1234', 'qwerty', 'qwerty123', 'qwertyui',
            'asdfgh', 'asdfghjk', 'asdf1234', 'zxcvbnm', 'admin', 'admin123', 'admin1234',
            'celik', 'celik123', 'celikkodu', 'celikkodu123', 'sanane', 'sanane123', 'deneme', 'deneme123',
            'fitness', 'fitness123', 'sporcu123', 'turkiye123', 'istanbul34'
        ]);

        function hasSequentialRun(input, minRun = 4) {
            const s = String(input || '').toLowerCase()
                .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
                .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
            if (s.length < minRun) return false;
            let asc = 1;
            let desc = 1;
            for (let i = 1; i < s.length; i++) {
                const prev = s.charCodeAt(i - 1);
                const curr = s.charCodeAt(i);
                const isNumPrev = prev >= 48 && prev <= 57;
                const isNumCurr = curr >= 48 && curr <= 57;
                const isAlphaPrev = prev >= 97 && prev <= 122;
                const isAlphaCurr = curr >= 97 && curr <= 122;
                if ((isNumPrev && isNumCurr) || (isAlphaPrev && isAlphaCurr)) {
                    const isAscWrap = isNumPrev && prev === 57 && curr === 48;
                    const isDescWrap = isNumPrev && prev === 48 && curr === 57;
                    asc = (curr - prev === 1 || isAscWrap) ? asc + 1 : 1;
                    desc = (prev - curr === 1 || isDescWrap) ? desc + 1 : 1;
                    if (asc >= minRun || desc >= minRun) return true;
                } else {
                    asc = 1;
                    desc = 1;
                }
            }
            return false;
        }

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
            } else if (hasSequentialRun(pwd, 4)) {
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
                    const suffixLower = lower.startsWith(tk) ? lower.slice(tk.length) : '';
                    const suffixAscii = asciiLower.startsWith(tk) ? asciiLower.slice(tk.length) : '';
                    const isTrivialSuffix = (sfx) => Boolean(sfx && (sfx === '12' || /^(?:0+|1+|123\d*)$/.test(sfx)));
                    if (isTrivialSuffix(suffixLower) || isTrivialSuffix(suffixAscii)) {
                        isUnpredictable = false;
                        weakReason = 'İsminizin sonuna ardışık rakam eklenmiş basit şifreler kullanılamaz.';
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
        if (typeof window !== 'undefined') {
            window.evaluatePasswordSecurity = evaluatePasswordSecurity;
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
                    btnReg.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)';
                    btnReg.style.color = '#FFFFFF';
                    btnReg.style.borderColor = 'rgba(167, 139, 250, 0.55)';
                    btnReg.style.boxShadow = '0 4px 12px rgba(109, 40, 217, 0.35)';
                }
                if (btnLogin) {
                    btnLogin.style.background = 'transparent';
                    btnLogin.style.color = '#E2E8F0';
                    btnLogin.style.borderColor = 'transparent';
                    btnLogin.style.boxShadow = 'none';
                }
            } else if (mode === 'forgot') {
                if (loginForm) loginForm.style.display = 'none';
                if (regForm) regForm.style.display = 'none';
                if (forgotForm) forgotForm.style.display = 'block';
                pendingForgotOtpState = null;
                const step2El = document.getElementById('forgotStep2Container');
                const otpEl = document.getElementById('forgotOtpCode');
                const newPassEl = document.getElementById('forgotNewPass');
                const confirmPassEl = document.getElementById('forgotNewPassConfirm');
                const forgotBtn = document.getElementById('forgotSubmitBtn');
                if (step2El) step2El.style.display = 'none';
                if (otpEl) { otpEl.value = ''; otpEl.required = false; otpEl.removeAttribute('maxlength'); }
                if (newPassEl) { newPassEl.value = ''; newPassEl.required = false; }
                if (confirmPassEl) { confirmPassEl.value = ''; confirmPassEl.required = false; }
                if (forgotBtn) forgotBtn.textContent = 'Sıfırlama Kodu Gönder';
                const loginUnameEl = document.getElementById('loginUsername');
                const forgotIdEl = document.getElementById('forgotIdentity');
                if (loginUnameEl && forgotIdEl && loginUnameEl.value.trim() && !forgotIdEl.value.trim()) {
                    forgotIdEl.value = loginUnameEl.value.trim();
                }
                if (btnLogin) {
                    btnLogin.style.background = 'transparent';
                    btnLogin.style.color = '#E2E8F0';
                    btnLogin.style.borderColor = 'transparent';
                    btnLogin.style.boxShadow = 'none';
                }
                if (btnReg) {
                    btnReg.style.background = 'transparent';
                    btnReg.style.color = '#E2E8F0';
                    btnReg.style.borderColor = 'transparent';
                    btnReg.style.boxShadow = 'none';
                }
            } else {
                if (loginForm) loginForm.style.display = 'block';
                if (regForm) regForm.style.display = 'none';
                if (forgotForm) forgotForm.style.display = 'none';
                if (btnLogin) {
                    btnLogin.style.background = 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)';
                    btnLogin.style.color = '#FFFFFF';
                    btnLogin.style.borderColor = 'rgba(167, 139, 250, 0.55)';
                    btnLogin.style.boxShadow = '0 4px 12px rgba(109, 40, 217, 0.35)';
                }
                if (btnReg) {
                    btnReg.style.background = 'transparent';
                    btnReg.style.color = '#E2E8F0';
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
                    el.style.background = '#14532D';
                    el.style.color = '#BBF7D0';
                    el.style.borderColor = '#22C55E';
                } else {
                    el.style.background = '#121024';
                    el.style.color = '#CBD5E1';
                    el.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                }
            };

            stylePill(lenPill, res.hasMinLength);
            stylePill(mixPill, res.hasLetterAndNumber);
            stylePill(safePill, safeOk);

            if (strengthLabel) {
                if (!val) {
                    strengthLabel.textContent = 'Bekleniyor';
                    strengthLabel.style.color = '#CBD5E1';
                } else if (res.isValid && !isSameAsOld) {
                    strengthLabel.textContent = `Güvenlik: ${res.levelLabel}`;
                    strengthLabel.style.color = '#4ADE80';
                } else {
                    strengthLabel.textContent = isSameAsOld ? 'Eski şifreyle aynı olamaz' : 'Geliştirilmeli';
                    strengthLabel.style.color = '#FDE68A';
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
            if (errorBox) {
                errorBox.style.display = 'none';
                errorBox.style.background = '';
                errorBox.style.borderColor = '';
                errorBox.style.color = '';
            }

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
                    errorBox.innerText = 'Yeni şifreniz mevcut zayıf şifrenizle aynı olamaz.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            const evalRes = evaluatePasswordSecurity(newPass, user);
            if (!evalRes.isValid) {
                if (errorBox) {
                    errorBox.innerText = `${evalRes.reason}`;
                    errorBox.style.display = 'block';
                }
                return;
            }

            if (newPass !== confirmPass) {
                if (errorBox) {
                    errorBox.innerText = 'Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.';
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
                            await refreshVerifiedAdminClaim(fbAuth.currentUser);
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
            syncOwnUserProfileToCloud(user).catch(() => {});
            if (typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession() && typeof syncUsersToCloud === 'function') {
                syncUsersToCloud().catch(() => {});
            }

            if (newPassEl) newPassEl.value = '';
            if (confirmPassEl) confirmPassEl.value = '';
            pendingWeakPasswordUpgradeState = null;
            switchAuthScreenTab('login');
            completeAuthenticatedLogin(user);
        }
        window.handleForcePasswordUpgradeSubmit = handleForcePasswordUpgradeSubmit;

        async function sendForgotResetStage1() {
            const idEl = document.getElementById('forgotIdentity');
            const step2El = document.getElementById('forgotStep2Container');
            const otpContainer = document.getElementById('forgotOtpContainer');
            const otpEl = document.getElementById('forgotOtpCode');
            const passEl = document.getElementById('forgotNewPass');
            const passConfirmEl = document.getElementById('forgotNewPassConfirm');
            const submitBtn = document.getElementById('forgotSubmitBtn');
            const errorBox = document.getElementById('loginErrorMsg');
            const successBox = document.getElementById('loginSuccessMsg');

            if (errorBox) errorBox.style.display = 'none';
            if (successBox) successBox.style.display = 'none';

            const rawIdentity = (idEl ? idEl.value : '').trim();
            if (!rawIdentity) {
                if (errorBox) {
                    errorBox.innerText = 'Önce kayıtlı e-posta adresinizi veya kullanıcı adınızı yazın.';
                    errorBox.style.display = 'block';
                }
                return false;
            }
            if (navigator.onLine === false) {
                if (errorBox) {
                    errorBox.innerText = 'İnternet bağlantınız yok. Şifre sıfırlama için çevrimiçi olun.';
                    errorBox.style.display = 'block';
                }
                return false;
            }

            const normId = normalizeAuthString(rawIdentity);
            const emailId = rawIdentity.toLowerCase();
            const users = getAuthUsers();
            const matchedUser = users.find(u => {
                const uUname = normalizeAuthString(u.username);
                const uEmail = (u.email || '').trim().toLowerCase();
                const aliases = Array.isArray(u.aliases) ? u.aliases.map(normalizeAuthString) : [];
                return (uUname && uUname === normId) ||
                    (uEmail && uEmail === emailId) ||
                    (u.id === 'usr_admin' && normId === 'admin') ||
                    aliases.includes(normId);
            }) || null;

            let targetEmail = matchedUser ? getCanonicalFbAuthEmail(matchedUser) : (emailId.includes('@') ? emailId : '');
            if ((!targetEmail || targetEmail.endsWith('@auth.celikkodu.app')) && !emailId.includes('@') && isFirebaseReady && fbDb && !IS_LOCAL_DEV) {
                const unameKey = toUsernameDocId(rawIdentity);
                if (unameKey && /^[a-z0-9._-]{2,40}$/.test(unameKey)) {
                    try {
                        const uSnap = await fbDb.collection('usernames').doc(unameKey).get();
                        if (uSnap && uSnap.exists) {
                            const uData = uSnap.data() || {};
                            if (uData.authEmail) targetEmail = String(uData.authEmail).trim().toLowerCase();
                        }
                    } catch {}
                }
            }
            if (!targetEmail || targetEmail.endsWith('@auth.celikkodu.app')) {
                if (errorBox) {
                    errorBox.innerText = 'Bu hesapta tanımlı geçerli bir e-posta adresi bulunamadı.';
                    errorBox.style.display = 'block';
                }
                return false;
            }

            const openStage2UI = (msgText) => {
                if (step2El) step2El.style.display = 'block';
                if (otpContainer) otpContainer.style.display = 'block';
                if (otpEl) {
                    otpEl.value = '';
                    otpEl.required = true;
                    otpEl.removeAttribute('maxlength');
                }
                if (passEl) passEl.required = true;
                if (passConfirmEl) passConfirmEl.required = true;
                if (submitBtn) submitBtn.textContent = 'Yeni Şifreyi Kaydet';
                if (successBox) {
                    successBox.innerText = msgText;
                    successBox.style.display = 'block';
                }
            };

            if (!fbAuth) {
                if (errorBox) {
                    errorBox.innerText = 'Sıfırlama servisi şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
                    errorBox.style.display = 'block';
                }
                return false;
            }

            let fbMailOk = false;
            try {
                await fbAuth.sendPasswordResetEmail(targetEmail);
                fbMailOk = true;
            } catch (err) {
                if (!IS_LOCAL_DEV) {
                    if (errorBox) {
                        errorBox.innerText = 'Sıfırlama e-postası gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin.';
                        errorBox.style.display = 'block';
                    }
                    return false;
                }
            }

            if (fbMailOk || IS_LOCAL_DEV) {
                pendingForgotOtpState = {
                    mode: 'firebase_oob',
                    userId: matchedUser ? matchedUser.id : null,
                    email: targetEmail,
                    createdAt: Date.now()
                };
                openStage2UI(`Sıfırlama e-postası (${targetEmail}) adresinize gönderildi. E-postadaki bağlantıyı kullanabilir veya sıfırlama kodunu aşağıya girerek yeni şifrenizi belirleyebilirsiniz.`);
                return true;
            }
            return false;
        }

        async function handleSendFirebaseResetLink() {
            return await sendForgotResetStage1();
        }
        window.handleSendFirebaseResetLink = handleSendFirebaseResetLink;

        async function resendForgotVerificationCode() {
            pendingForgotOtpState = null;
            return await sendForgotResetStage1();
        }
        window.resendForgotVerificationCode = resendForgotVerificationCode;

        async function handleForgotPasswordSubmit(e) {
            e.preventDefault();
            const idEl = document.getElementById('forgotIdentity');
            const step2El = document.getElementById('forgotStep2Container');
            const otpContainer = document.getElementById('forgotOtpContainer');
            const otpEl = document.getElementById('forgotOtpCode');
            const passEl = document.getElementById('forgotNewPass');
            const passConfirmEl = document.getElementById('forgotNewPassConfirm');
            const errorBox = document.getElementById('loginErrorMsg');
            const successBox = document.getElementById('loginSuccessMsg');

            if (errorBox) errorBox.style.display = 'none';
            if (successBox) successBox.style.display = 'none';

            const isStep2Open = step2El && step2El.style.display !== 'none';
            if (!isStep2Open || !pendingForgotOtpState) {
                await sendForgotResetStage1();
                return;
            }

            const rawIdentity = (idEl ? idEl.value : '').trim();
            const enteredOtp = (otpEl ? otpEl.value : '').trim();
            const newPass = (passEl ? passEl.value : '').trim();
            const newPassConfirm = (passConfirmEl ? passConfirmEl.value : '').trim();

            if (!enteredOtp) {
                if (otpContainer) otpContainer.style.display = 'block';
                if (errorBox) {
                    errorBox.innerText = 'Lütfen e-postanıza gelen sıfırlama kodunu girin.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            if (Date.now() - Number(pendingForgotOtpState.createdAt || 0) > 10 * 60 * 1000) {
                pendingForgotOtpState = null;
                if (step2El) step2El.style.display = 'none';
                const submitBtn = document.getElementById('forgotSubmitBtn');
                if (submitBtn) submitBtn.textContent = 'Sıfırlama Kodu Gönder';
                if (errorBox) {
                    errorBox.innerText = 'Sıfırlama kodunun süresi doldu. Lütfen yeniden kod isteyin.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            if (!newPass || !newPassConfirm) {
                if (errorBox) {
                    errorBox.innerText = 'Lütfen yeni şifre alanlarını doldurun.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            if (newPass !== newPassConfirm) {
                if (errorBox) {
                    errorBox.innerText = 'Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.';
                    errorBox.style.display = 'block';
                }
                return;
            }

            const users = getAuthUsers();
            const matchedUser = users.find(u =>
                (pendingForgotOtpState.userId && u.id === pendingForgotOtpState.userId) ||
                ((u.email || '').trim().toLowerCase() === String(pendingForgotOtpState.email || '').toLowerCase())
            ) || null;

            const fullSecCheck = evaluatePasswordSecurity(newPass, matchedUser || { username: rawIdentity, email: pendingForgotOtpState.email });
            if (!fullSecCheck.isValid) {
                if (errorBox) {
                    errorBox.innerText = fullSecCheck.reason;
                    errorBox.style.display = 'block';
                }
                return;
            }

            if (pendingForgotOtpState.mode === 'firebase_oob') {
                if (!fbAuth || typeof fbAuth.verifyPasswordResetCode !== 'function' || typeof fbAuth.confirmPasswordReset !== 'function') {
                    if (errorBox) {
                        errorBox.innerText = 'Sunucu kod doğrulaması şu an kullanılamıyor. E-postadaki bağlantıyı kullanabilirsiniz.';
                        errorBox.style.display = 'block';
                    }
                    return;
                }
                try {
                    await fbAuth.verifyPasswordResetCode(enteredOtp);
                    await fbAuth.confirmPasswordReset(enteredOtp, newPass);
                } catch (fbErr) {
                    if (errorBox) {
                        errorBox.innerText = 'Geçersiz veya süresi dolmuş sıfırlama kodu. E-postadaki bağlantıyı kullanabilir veya yeni kod isteyebilirsiniz.';
                        errorBox.style.display = 'block';
                    }
                    return;
                }
            } else {
                return;
            }

            if (matchedUser) {
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
            }

            const loginHintValue = (matchedUser && (matchedUser.username || matchedUser.email)) || pendingForgotOtpState.email || rawIdentity;
            pendingForgotOtpState = null;

            if (idEl) idEl.value = '';
            if (otpEl) otpEl.value = '';
            if (passEl) passEl.value = '';
            if (passConfirmEl) passConfirmEl.value = '';
            if (step2El) step2El.style.display = 'none';

            switchAuthScreenTab('login');
            const loginUnameEl = document.getElementById('loginUsername');
            if (loginUnameEl && loginHintValue) loginUnameEl.value = loginHintValue;

            if (successBox) {
                successBox.innerText = 'Yeni şifreniz kaydedildi! Hesabınızla şimdi giriş yapabilirsiniz.';
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
                errorBox.innerText = "Lütfen Ad Soyad, E-Posta, Kullanıcı Adı ve Şifre alanlarını doldurun.";
                errorBox.style.display = 'block';
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
                errorBox.innerText = "Lütfen geçerli bir e-posta adresi girin.";
                errorBox.style.display = 'block';
                return;
            }

            const secCheck = evaluatePasswordSecurity(pass, { username: rawUname, name: dname, email: rawEmail });
            if (!secCheck.isValid) {
                errorBox.innerText = secCheck.reason;
                errorBox.style.display = 'block';
                return;
            }

            const users = getAuthUsers();
            const finalUname = toUsernameDocId(rawUname);
            if (!/^[a-z0-9._-]{2,40}$/.test(finalUname) || finalUname === 'admin') {
                errorBox.innerText = "Kullanıcı adı 2-40 karakter olmalı ve yalnızca harf, rakam, nokta, alt çizgi veya tire içermelidir.";
                errorBox.style.display = 'block';
                return;
            }

            const existingByEmail = users.find(u => u.email && u.email.toLowerCase() === rawEmail);
            if (existingByEmail) {
                if (existingByEmail.status === 'pending') {
                    errorBox.innerText = "Bu e-posta adresiyle yapılmış başvuru zaten yönetici onayında bekliyor.";
                } else {
                    errorBox.innerText = "Bu e-posta adresi zaten kayıtlı! Giriş Yap sekmesinden giriş yapabilirsiniz.";
                }
                errorBox.style.display = 'block';
                return;
            }

            const existingByUname = users.find(u => toUsernameDocId(u.username) === finalUname || normalizeAuthString(u.username) === normalizeAuthString(rawUname));
            if (existingByUname) {
                errorBox.innerText = `"@${finalUname}" kullanıcı adı zaten kullanımda! Lütfen farklı bir kullanıcı adı seçin.`;
                errorBox.style.display = 'block';
                return;
            }

            if (!IS_LOCAL_DEV && isFirebaseReady && fbDb && navigator.onLine !== false) {
                try {
                    const existingCloudUname = await fbDb.collection('usernames').doc(finalUname).get();
                    if (existingCloudUname && existingCloudUname.exists) {
                        errorBox.innerText = `"@${finalUname}" kullanıcı adı zaten kullanımda! Lütfen farklı bir kullanıcı adı seçin.`;
                        errorBox.style.display = 'block';
                        return;
                    }
                } catch {}
            }

            const nowMs = Date.now();
            const salt = generateSecureSalt();
            const passHash = await sha256Hex(salt + pass);
            let assignedId = 'usr_' + nowMs;
            let assignedAuthUid = '';

            const secAuth = getSecondaryFirebaseAuth();
            if (secAuth && navigator.onLine !== false) {
                try {
                    const cred = await secAuth.createUserWithEmailAndPassword(rawEmail, pass);
                    try {
                        if (cred && cred.user && cred.user.uid) {
                            assignedAuthUid = cred.user.uid;
                            const cleanFbUid = String(cred.user.uid).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
                            if (cleanFbUid) assignedId = 'usr_' + cleanFbUid;
                            if (!IS_LOCAL_DEV && secondaryFbApp && typeof secondaryFbApp.firestore === 'function') {
                                const secDb = secondaryFbApp.firestore();
                                try { secDb.settings({ ignoreUndefinedProperties: true }); } catch {}
                                const rolePromise = secDb.collection('user_roles').doc(cred.user.uid).set({
                                    role: 'athlete',
                                    appUid: assignedId,
                                    email: rawEmail,
                                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true });
                                const profilePayload = buildUserProfileDocPayload({
                                    id: assignedId,
                                    authUid: cred.user.uid,
                                    username: finalUname,
                                    email: rawEmail,
                                    fbAuthEmail: rawEmail,
                                    role: 'athlete',
                                    status: 'pending',
                                    name: dname,
                                    avatar: 'SP',
                                    theme: 'cyan',
                                    level,
                                    gender,
                                    weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
                                    passwordStrengthLevel: secCheck.levelLabel,
                                    mustChangePassword: false,
                                    passwordUpdatedAt: nowMs,
                                    createdAt: nowMs,
                                    updatedAt: nowMs
                                }, cred.user.uid);
                                const profilePromise = secDb.collection('user_profiles').doc(cred.user.uid).set(profilePayload, { merge: true });
                                const unamePromise = secDb.collection('usernames').doc(finalUname).set({
                                    authUid: cred.user.uid,
                                    appUid: assignedId,
                                    authEmail: rawEmail,
                                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true });
                                await Promise.all([rolePromise, profilePromise, unamePromise]);
                            }
                        }
                    } finally {
                        await secAuth.signOut().catch(() => {});
                    }
                } catch (fbRegErr) {
                    const code = (fbRegErr && fbRegErr.code) || '';
                    if (code === 'auth/email-already-in-use') {
                        errorBox.innerText = "Bu e-posta adresi zaten kayıtlı! Giriş Yap sekmesinden giriş yapabilirsiniz.";
                        errorBox.style.display = 'block';
                        return;
                    }
                    if (code === 'auth/invalid-email' || code === 'auth/weak-password') {
                        errorBox.innerText = "Lütfen geçerli bir e-posta ve güçlü bir şifre girin.";
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
                authUid: assignedAuthUid,
                username: finalUname,
                email: rawEmail,
                fbAuthEmail: rawEmail,
                passwordStrengthLevel: secCheck.levelLabel,
                mustChangePassword: false,
                passwordUpdatedAt: nowMs,
                role: 'athlete',
                status: 'pending',
                name: dname,
                avatar: 'SP',
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
                successBox.innerText = `Kayıt başvurunuz alındı! Yönetici onayından sonra kullanıcı adınız (@${finalUname}) veya e-postanız (${rawEmail}) ile giriş yapabileceksiniz.`;
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
                    errorBox.innerText = "Lütfen kullanıcı adı/e-posta ve şifrenizi girin.";
                    errorBox.style.display = 'block';
                }
                return;
            }

            const lockRem = getRemainingAuthLockoutSeconds(uname);
            if (lockRem > 0) {
                if (errorBox) {
                    errorBox.innerText = `Çok fazla hatalı giriş denemesi yapıldı. Güvenliğiniz için ${lockRem} saniye bekleyin.`;
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
                        (u.id === 'usr_admin' && uname === 'admin') ||
                        aliases.includes(uname);
                });

                let matched = null;
                let rateLimitedByServer = false;
                let fbNetworkUnavailable = (navigator.onLine === false || !fbAuth);
                let targetEmail = '';

                if (rawInput.includes('@')) {
                    targetEmail = emailInput;
                } else {
                    const localWithEmail = candidates.find(c => Boolean(getCanonicalFbAuthEmail(c)));
                    if (localWithEmail) {
                        targetEmail = getCanonicalFbAuthEmail(localWithEmail);
                    }
                    if (!targetEmail && isFirebaseReady && fbDb && !IS_LOCAL_DEV && navigator.onLine !== false) {
                        const unameDocKey = toUsernameDocId(rawInput);
                        if (unameDocKey && /^[a-z0-9._-]{2,40}$/.test(unameDocKey)) {
                            try {
                                const unameSnap = await fbDb.collection('usernames').doc(unameDocKey).get();
                                if (unameSnap && unameSnap.exists) {
                                    const unameData = unameSnap.data() || {};
                                    if (unameData.authEmail) {
                                        targetEmail = String(unameData.authEmail).trim().toLowerCase();
                                    }
                                }
                            } catch {}
                        }
                    }
                }

                // 1. Birincil Kurumsal Doğrulama: Google Firebase Authentication (Per-User Profile & Custom Claim)
                if (fbAuth && targetEmail && navigator.onLine !== false) {
                    try {
                        const cred = await fbAuth.signInWithEmailAndPassword(targetEmail, pass);
                        if (cred && cred.user) {
                            const fbUser = cred.user;
                            const hasAdminClaim = await refreshVerifiedAdminClaim(fbUser);
                            let cloudProfile = null;
                            let cloudRoleDoc = null;
                            if (isFirebaseReady && fbDb && !IS_LOCAL_DEV) {
                                try {
                                    const profSnap = await fbDb.collection('user_profiles').doc(fbUser.uid).get();
                                    if (profSnap && profSnap.exists) cloudProfile = profSnap.data() || null;
                                } catch {}
                                try {
                                    const roleSnap = await fbDb.collection('user_roles').doc(fbUser.uid).get();
                                    if (roleSnap && roleSnap.exists) cloudRoleDoc = roleSnap.data() || null;
                                } catch {}
                            }

                            const cleanFbUid = String(fbUser.uid).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
                            const localMatch = candidates.find(u =>
                                u && (
                                    u.authUid === fbUser.uid ||
                                    u.id === fbUser.uid ||
                                    u.id === ('usr_' + fbUser.uid) ||
                                    u.id === ('usr_' + cleanFbUid) ||
                                    (u.email || '').toLowerCase() === targetEmail ||
                                    (u.fbAuthEmail || '').toLowerCase() === targetEmail
                                )
                            ) || candidates[0] || null;

                            const resolvedId = (cloudProfile && cloudProfile.id)
                                || (cloudRoleDoc && cloudRoleDoc.appUid)
                                || (localMatch && localMatch.id)
                                || ('usr_' + (cleanFbUid || Date.now()));
                            const resolvedRole = hasAdminClaim
                                ? 'admin'
                                : ((cloudProfile && cloudProfile.role) || (cloudRoleDoc && cloudRoleDoc.role) || (localMatch && localMatch.role) || 'athlete');
                            const resolvedStatus = hasAdminClaim
                                ? 'approved'
                                : ((cloudProfile && cloudProfile.status) || (localMatch && localMatch.status) || 'approved');
                            const evalRes = evaluatePasswordSecurity(pass, cloudProfile || localMatch || { username: rawInput, email: targetEmail });
                            const mergedMatched = stripSecretsFromUserRecord(Object.assign(
                                {},
                                localMatch || {},
                                cloudProfile || {},
                                {
                                    id: resolvedId,
                                    authUid: fbUser.uid,
                                    username: (cloudProfile && cloudProfile.username) || (localMatch && localMatch.username) || toUsernameDocId(rawInput) || targetEmail.split('@')[0],
                                    email: (cloudProfile && cloudProfile.email) || (localMatch && localMatch.email) || targetEmail,
                                    fbAuthEmail: targetEmail,
                                    role: resolvedRole,
                                    status: resolvedStatus,
                                    name: (cloudProfile && cloudProfile.name) || (localMatch && localMatch.name) || fbUser.displayName || 'Sporcu',
                                    avatar: sanitizeAvatarMonogram((cloudProfile && cloudProfile.avatar) || (localMatch && localMatch.avatar), 'SP'),
                                    passwordStrengthLevel: evalRes.levelLabel || (cloudProfile && cloudProfile.passwordStrengthLevel) || (localMatch && localMatch.passwordStrengthLevel) || 'Güçlü'
                                }
                            ));

                            upsertLocalUserRecord(mergedMatched);

                            const freshSalt = generateSecureSalt();
                            const freshHash = await sha256Hex(freshSalt + pass);
                            setLocalUserCred(mergedMatched.id, {
                                salt: freshSalt,
                                passwordHash: freshHash,
                                passwordStrengthLevel: mergedMatched.passwordStrengthLevel,
                                mustChangePassword: Boolean(mergedMatched.mustChangePassword),
                                passwordUpdatedAt: Date.now()
                            });

                            try { await syncUserRoleDocument(fbUser, mergedMatched); } catch {}
                            matched = mergedMatched;
                        }
                    } catch (fbErr) {
                        const code = (fbErr && fbErr.code) || '';
                        if (code === 'auth/too-many-requests') {
                            rateLimitedByServer = true;
                        } else if (code === 'auth/network-request-failed' || code === 'auth/internal-error') {
                            fbNetworkUnavailable = true;
                        }
                    }
                }

                // 2. Çevrimdışı / Yerel Geliştirme Kasa Doğrulaması (İnternet yokken veya IS_LOCAL_DEV testlerinde)
                if (!matched && !rateLimitedByServer) {
                    for (const u of candidates) {
                        const vaultCred = getLocalUserCred(u.id);
                        const effSalt = (vaultCred && vaultCred.salt) || u.salt || '';
                        const effHash = (vaultCred && vaultCred.passwordHash) || u.passwordHash || '';
                        if (effHash && effSalt) {
                            const isDefaultWeakOnAdmin = (u.id === 'usr_admin') && (effSalt === 'celik_salt_default' || KNOWN_WEAK_HASHES_GLOBAL.has(effHash));
                            const allowLocalFallback = !isDefaultWeakOnAdmin && (fbNetworkUnavailable || IS_LOCAL_DEV);
                            if (allowLocalFallback) {
                                const enteredHash = await sha256Hex(effSalt + pass);
                                if (enteredHash === effHash) {
                                    matched = u;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (rateLimitedByServer) {
                    if (errorBox) {
                        errorBox.innerText = "Çok fazla başarısız giriş denemesi tespit edildi. Lütfen birkaç dakika bekleyip tekrar deneyin.";
                        errorBox.style.display = 'block';
                    }
                    return;
                }

                if (matched) {
                    clearAuthFailures(uname);

                    // YÖNETİCİ ONAYI KONTROLÜ (status === 'pending' veya 'rejected' ise girişi engelle)
                    if (matched.role !== 'admin' && matched.status === 'pending') {
                        if (fbAuth) { try { await fbAuth.signOut(); } catch (e) {} }
                        await refreshVerifiedAdminClaim(null);
                        errorBox.innerText = `Hesabınız henüz yönetici onayında bekliyor. Onaylandığında ${matched.email ? '(' + matched.email + ') adresinize' : 'size'} onay e-postası gönderilecektir.`;
                        errorBox.style.display = 'block';
                        return;
                    }
                    if (matched.role !== 'admin' && matched.status === 'rejected') {
                        if (fbAuth) { try { await fbAuth.signOut(); } catch (e) {} }
                        await refreshVerifiedAdminClaim(null);
                        errorBox.innerText = "Kayıt başvurunuz yönetici tarafından onaylanmadı.";
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
                        upsertLocalUserRecord(matched);
                    }

                    completeAuthenticatedLogin(matched);
                } else {
                    const newLockSec = recordAuthFailure(uname);
                    if (errorBox) {
                        errorBox.innerText = newLockSec > 0
                            ? `Hatalı şifre! Çok sayıda deneme nedeniyle ${newLockSec} saniye güvenlik kilidi uygulandı.`
                            : "Hatalı kullanıcı adı/e-posta veya şifre!";
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
            if (isDemoGuestSession()) {
                setSession(null);
                return;
            }
            if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) {
                refreshVerifiedAdminClaim(null).catch(() => {});
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
                alert("Mevcut şifreniz hatalı.");
                return;
            }

            if (newPass === currentPass) {
                alert("Yeni şifreniz mevcut şifrenizle aynı olamaz.");
                return;
            }

            const secCheck = evaluatePasswordSecurity(newPass, user);
            if (!secCheck.isValid) {
                alert(secCheck.reason);
                return;
            }

            if (fbSignedForChange && fbAuth && fbAuth.currentUser) {
                try {
                    await fbAuth.currentUser.updatePassword(newPass);
                    await refreshVerifiedAdminClaim(fbAuth.currentUser);
                } catch (updErr) {
                    alert("Şifre sunucuda güncellenemedi. Lütfen tekrar giriş yapıp deneyin.");
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
            syncOwnUserProfileToCloud(user).catch(() => {});
            if (typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession() && typeof syncUsersToCloud === 'function') {
                syncUsersToCloud().catch(() => {});
            }

            if (currentPassEl) currentPassEl.value = '';
            if (newPassEl) newPassEl.value = '';

            playAlertSound();
            alert("Güçlü şifreniz tüm cihazlarınız için başarıyla kaydedildi.");
        }

        // ADMIN BADGE GUARD (Yönetici Portalı js/chiefs/admin-portal.js içinde izoledir)
        function updateAdminPendingBadges() {
            const session = getSession();
            const isAdmin = isVerifiedAdminSession(session);
            if (!isAdmin) {
                const manageBadge = document.getElementById('adminManagePendingBadge');
                if (manageBadge) manageBadge.style.display = 'none';
                const headerTelBtn = document.getElementById('headerAdminTelemetryBtn');
                if (headerTelBtn) headerTelBtn.style.display = 'none';
                ['popupAdminTelemetryBadge', 'sheetAdminTelemetryBadge', 'profileAdminTelemetryBadge', 'adminTelemetryTabBadge'].forEach(elId => {
                    const el = document.getElementById(elId);
                    if (el) el.style.display = 'none';
                });
                unmountAdminPortalFromDOM();
                return;
            }

            ensureAdminPortalMountedSync(session);
            const users = getAuthUsers();
            const pendingCount = users.filter(u => u && u.status === 'pending').length;

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
            if (roleBadge) {
                roleBadge.innerText = pendingCount > 0 ? `YÖNETİCİ (${pendingCount} ONAY)` : 'YÖNETİCİ';
                roleBadge.className = 'auth-role-tag role-admin';
                roleBadge.style.display = 'inline-block';
            }

            const telEvents = (typeof window !== 'undefined' && window.CelikKaraKutu && typeof window.CelikKaraKutu.getAllLocalEventsAcrossUsers === 'function')
                ? window.CelikKaraKutu.getAllLocalEventsAcrossUsers(users)
                : [];
            const errEvents = telEvents.filter(ev => ev && ev.severity === 'error');
            const errCount = errEvents.length;
            const errLabel = errCount > 99 ? '99+' : String(errCount);

            const headerTelBtn = document.getElementById('headerAdminTelemetryBtn');
            const headerTelBadge = document.getElementById('headerAdminTelemetryBadge');
            if (headerTelBadge) headerTelBadge.innerText = errLabel;
            if (headerTelBtn) headerTelBtn.style.display = (errCount > 0) ? 'inline-flex' : 'none';

            ['popupAdminTelemetryBadge', 'sheetAdminTelemetryBadge', 'profileAdminTelemetryBadge', 'adminTelemetryTabBadge'].forEach(elId => {
                const el = document.getElementById(elId);
                if (!el) return;
                if (errCount > 0) {
                    el.innerText = errLabel;
                    el.style.display = 'inline-block';
                } else {
                    el.style.display = 'none';
                }
            });
        }
        if (typeof window !== 'undefined') {
            window.updateAdminPendingBadges = updateAdminPendingBadges;
        }

        // PROFILE & THEME SETTINGS
        const PROFILE_DARK_THEME_PILL_COLORS = {
            gold: '#B45309',
            cyan: '#0369A1',
            green: '#15803D',
            red: '#BE123C',
            purple: '#6D28D9'
        };

        function applyProfileTabDarkSurfaceStyles() {
            const profileRoot = document.getElementById('profileTab');
            if (profileRoot) {
                const outerCard = profileRoot.querySelector('.generator-card');
                if (outerCard) {
                    outerCard.style.background = 'linear-gradient(165deg, #181530 0%, #100E22 100%)';
                    outerCard.style.backgroundColor = '#181530';
                    outerCard.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                    outerCard.style.color = '#F8FAFC';
                }
            }

            const cardName = document.getElementById('profileCardName');
            if (cardName) cardName.style.color = '#FFFFFF';
            const cardMeta = document.getElementById('profileCardMeta');
            if (cardMeta) cardMeta.style.color = '#CBD5E1';

            const btn = document.getElementById('profileEditToggleBtn');
            if (btn) {
                btn.style.background = '#121024';
                btn.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                btn.style.color = '#FFFFFF';
                btn.querySelectorAll('div').forEach(divEl => {
                    if (divEl.style && (divEl.style.color === '#0F172A' || divEl.style.color === 'rgb(15, 23, 42)')) {
                        divEl.style.color = '#FFFFFF';
                    } else if (divEl.style && (divEl.style.color === '#475569' || divEl.style.color === 'rgb(71, 85, 105)')) {
                        divEl.style.color = '#CBD5E1';
                    }
                });
            }

            const arrow = document.getElementById('profileEditToggleArrow');
            if (arrow) {
                arrow.style.background = '#2C2550';
                arrow.style.color = '#F3E8FF';
                arrow.style.border = '1px solid rgba(167, 139, 250, 0.35)';
            }

            const drawer = document.getElementById('profileCustomizationDrawer');
            if (drawer) {
                drawer.style.background = '#121024';
                drawer.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                drawer.style.color = '#F8FAFC';
                drawer.querySelectorAll('.form-label').forEach(lbl => {
                    lbl.style.color = '#E2E8F0';
                });
                drawer.querySelectorAll('.form-input, .form-select').forEach(inp => {
                    inp.style.background = '#181530';
                    inp.style.color = '#FFFFFF';
                    inp.style.borderColor = 'rgba(167, 139, 250, 0.3)';
                });
            }

            document.querySelectorAll('#themePicker .theme-pill').forEach(el => {
                const onclickAttr = el.getAttribute('onclick') || '';
                Object.keys(PROFILE_DARK_THEME_PILL_COLORS).forEach(k => {
                    if (onclickAttr.includes(`'${k}'`) || onclickAttr.includes(`"${k}"`)) {
                        el.style.background = PROFILE_DARK_THEME_PILL_COLORS[k];
                        el.style.color = '#FFFFFF';
                    }
                });
            });

            const currPassInput = document.getElementById('profileCurrentPassword');
            if (currPassInput) {
                const pwCard = currPassInput.closest('div[style*="border-radius"]');
                if (pwCard) {
                    pwCard.style.background = '#121024';
                    pwCard.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                    const h4 = pwCard.querySelector('h4');
                    if (h4) h4.style.color = '#FFFFFF';
                    pwCard.querySelectorAll('.form-label').forEach(lbl => {
                        lbl.style.color = '#E2E8F0';
                    });
                    pwCard.querySelectorAll('.form-input').forEach(inp => {
                        inp.style.background = '#181530';
                        inp.style.color = '#FFFFFF';
                        inp.style.borderColor = 'rgba(167, 139, 250, 0.3)';
                    });
                    const pwBtn = pwCard.querySelector('button');
                    if (pwBtn) {
                        pwBtn.style.background = '#2C2550';
                        pwBtn.style.color = '#FDE68A';
                        pwBtn.style.borderColor = 'rgba(251, 191, 36, 0.45)';
                    }
                }
            }

            const geminiCard = document.getElementById('profileGeminiConfigCard');
            if (geminiCard) {
                geminiCard.style.background = '#121024';
                geminiCard.style.borderColor = 'rgba(167, 139, 250, 0.35)';
                const h4 = geminiCard.querySelector('h4');
                if (h4) h4.style.color = '#F3E8FF';
                geminiCard.querySelectorAll('.form-label').forEach(lbl => {
                    lbl.style.color = '#E2E8F0';
                });
                const gemInput = document.getElementById('profileGeminiApiKeyInput');
                if (gemInput) {
                    gemInput.style.background = '#181530';
                    gemInput.style.color = '#FFFFFF';
                    gemInput.style.borderColor = 'rgba(167, 139, 250, 0.3)';
                }
                const gemBtns = geminiCard.querySelectorAll('button');
                gemBtns.forEach(gemBtn => {
                    gemBtn.style.background = '#2C2550';
                    gemBtn.style.color = '#F3E8FF';
                    gemBtn.style.borderColor = 'rgba(192, 132, 252, 0.45)';
                });
                const gemLink = geminiCard.querySelector('a');
                if (gemLink) {
                    gemLink.style.color = '#BAE6FD';
                }
            }

            const badge = document.getElementById('profileGeminiStatusBadge');
            if (badge) {
                const hasKey = (typeof getGeminiApiKey === 'function') && Boolean(getGeminiApiKey());
                const badgeTxt = String(badge.innerText || '');
                if (hasKey || badgeTxt.includes('Aktif') || badgeTxt.includes('Hazır')) {
                    badge.style.background = '#14532D';
                    badge.style.color = '#BBF7D0';
                    badge.style.border = '1px solid rgba(74, 222, 128, 0.45)';
                } else {
                    badge.style.background = '#2C2550';
                    badge.style.color = '#F3E8FF';
                    badge.style.border = '1px solid rgba(167, 139, 250, 0.35)';
                }
            }

            const adminBtn = document.getElementById('profileTabAdminBtn');
            if (adminBtn) {
                adminBtn.style.background = '#2C2550';
                adminBtn.style.color = '#FDE68A';
                adminBtn.style.borderColor = 'rgba(251, 191, 36, 0.45)';
            }
        }

        function ensureProfileGeminiStatusDarkHook() {
            if (typeof window !== 'undefined' && typeof window.updateProfileGeminiStatusUI === 'function' && !window.updateProfileGeminiStatusUI._profileDarkHooked) {
                const origFn = window.updateProfileGeminiStatusUI;
                const wrapped = function(...args) {
                    const res = origFn.apply(this, args);
                    applyProfileTabDarkSurfaceStyles();
                    return res;
                };
                wrapped._profileDarkHooked = true;
                window.updateProfileGeminiStatusUI = wrapped;
                try { updateProfileGeminiStatusUI = wrapped; } catch (e) {}
            }
        }

        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
            document.addEventListener('DOMContentLoaded', () => {
                ensureProfileGeminiStatusDarkHook();
                applyProfileTabDarkSurfaceStyles();
            });
        }

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
            applyProfileTabDarkSurfaceStyles();
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
            applyProfileTabDarkSurfaceStyles();
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

            selectAvatar(sanitizeAvatarMonogram(user.avatar, 'SP'));
            selectTheme(user.theme || 'gold');

            ensureProfileGeminiStatusDarkHook();
            if (typeof updateProfileGeminiStatusUI === 'function') {
                updateProfileGeminiStatusUI();
            }
            applyProfileTabDarkSurfaceStyles();

            renderHistory();
        }
        if (typeof window !== 'undefined') {
            window.applyActiveUserProfile = applyActiveUserProfile;
        }

        function saveCurrentProfile() {
            if (isDemoGuestSession()) {
                alert("Demo modunda profil değişiklikleri kaydedilmez. Kendi hesabınızı oluşturmak için kayıt olabilirsiniz.");
                return;
            }
            const user = getActiveUser();
            if (!user) return;
            const nameInput = document.getElementById('editUserName');
            const newName = (nameInput ? nameInput.value : '').trim() || 'Sporcu';

            user.name = newName;
            user.avatar = sanitizeAvatarMonogram(selectedAvatar, 'SP');
            user.theme = selectedTheme;
            user.level = document.getElementById('editUserLevel').value;
            user.gender = document.getElementById('editUserGender').value;
            user.updatedAt = Date.now();

            const geminiInput = document.getElementById('profileGeminiApiKeyInput');
            if (geminiInput) {
                const gKey = geminiInput.value.trim();
                if (gKey) {
                    setGeminiApiKey(gKey, false);
                }
            }
            if (user.geminiApiKey) delete user.geminiApiKey;

            const users = getAuthUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) users[idx] = stripSecretsFromUserRecord(user);
            saveAuthUsers(users);
            syncOwnUserProfileToCloud(user).catch(() => {});
            if (typeof isVerifiedAdminSession === 'function' && isVerifiedAdminSession() && typeof syncUsersToCloud === 'function') {
                syncUsersToCloud().catch(() => {});
            }

            const session = getSession();
            if (session && session.userId === user.id) {
                session.name = newName;
                sanitizeSessionRecord(session);
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
            }

            applyActiveUserProfile();
            playAlertSound();
            alert("Profil değişiklikleriniz başarıyla kaydedildi.");
        }

