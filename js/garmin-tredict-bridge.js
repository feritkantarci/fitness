// ═══════════════════════════════════════════════════════════════════════════════
// ÇELİK KODU — 7. ŞEF: GARMIN & TREDICT ŞEFİ (garmin-tredict-guard)
// Mimari Kurallar:
// 1) Garmin Kullanmayan Kullanıcı Koruması: Garmin özelliği yalnızca aktif kullanıcıda
//    açıksa (veya Profil'den açıldıysa) çalışır. Garmin kullanmayan kullanıcıda 0 istek,
//    0 hata, 0 ek panel ve 0 bildirim üretir.
// 2) Sıfır Ekstra Buton & Otomatik Takvim Senkronu: Program/Antrenman sekmelerinde
//    ayrı "Saate Gönder" butonu yoktur. Kullanıcı bir programı Takvime eklediği anda
//    (Bugüne/Yarına/Bu Haftaya/Gelecek Haftaya Ekle), 7. Şef otomatik devreye girer.
// 3) Kütüphane Kas Doğrulaması & İsimsiz+Notlu Gönderim: Yeni hareketlerin kaslarını
//    library-guard ile kıyaslar; Garmin'de karşılığı olmayan hareketleri zorlama isimle
//    değil, isimsiz (exerciseName: undefined) ama orijinal adımız notlu (note) gönderir.
// 4) Orijinal Ad Koruma & Yalnızca Sağlık Verisi Alma: Saatten dönen antrenmanda saatin
//    ham hareket adı asla alınmaz; bizdeki orijinal hareket adı ve kasları korunur, içine
//    yalnızca saatin sağlık verileri (Nabız, Max Nabız, HRR, TUT, Kalori) işlenir.
// ═══════════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const TELEMETRY_STORAGE_KEY = 'celik_garmin_telemetry_v2';
  const WELLNESS_STEPS_KEY = 'celik_garmin_wellness_steps_v1';
  const RESOLVED_SETS_KEY = 'celik_garmin_resolved_sets_v1';
  const OUTBOX_PLANS_KEY = 'celik_garmin_outbox_plans_v1';
  const SENT_MANIFESTS_KEY = 'celik_garmin_sent_manifests_v1';
  const LAST_PUSHED_SIG_KEY = 'celik_garmin_last_pushed_sig_v281';
  const GARMIN_ENABLED_PREFIX = 'celik_garmin_enabled_';
  const TREDICT_TOKEN_KEY = 'celik_garmin_tredict_token';
  const INTERVALS_TOKEN_KEY = 'celik_garmin_intervals_token';
  const GATEWAY_URL_KEY = 'celik_garmin_gateway_url';
  const WATCH_VAULT_KEY_PREFIX = 'celik_garmin_watch_vault_v1_';
  const DEFAULT_CLOUD_GATEWAY_BASE = 'https://celik-kodu.vercel.app';
  const BRIDGE_B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function bridgeUtf8ToBytes(str) {
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
      if (code < 0x80) bytes.push(code);
      else if (code < 0x800) bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F));
      else if (code < 0x10000) bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
      else bytes.push(0xF0 | (code >> 18), 0x80 | ((code >> 12) & 0x3F), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
    }
    return bytes;
  }

  function bridgeBytesToUtf8(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length;) {
      const b0 = bytes[i++];
      if (b0 < 0x80) out += String.fromCharCode(b0);
      else if ((b0 & 0xE0) === 0xC0 && i < bytes.length) {
        out += String.fromCharCode(((b0 & 0x1F) << 6) | (bytes[i++] & 0x3F));
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

  function bridgeEncodeBase64(bytes) {
    let out = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const b0 = bytes[i];
      const has1 = i + 1 < bytes.length;
      const has2 = i + 2 < bytes.length;
      const b1 = has1 ? bytes[i + 1] : 0;
      const b2 = has2 ? bytes[i + 2] : 0;
      const trip = (b0 << 16) | (b1 << 8) | b2;
      out += BRIDGE_B64_CHARS[(trip >> 18) & 0x3F];
      out += BRIDGE_B64_CHARS[(trip >> 12) & 0x3F];
      out += has1 ? BRIDGE_B64_CHARS[(trip >> 6) & 0x3F] : '=';
      out += has2 ? BRIDGE_B64_CHARS[trip & 0x3F] : '=';
    }
    return out;
  }

  function bridgeDecodeBase64(b64) {
    const clean = String(b64 || '').replace(/[^A-Za-z0-9+/=]/g, '');
    const bytes = [];
    for (let i = 0; i < clean.length; i += 4) {
      const c0 = BRIDGE_B64_CHARS.indexOf(clean[i]);
      const c1 = BRIDGE_B64_CHARS.indexOf(clean[i + 1]);
      const ch2 = clean[i + 2];
      const ch3 = clean[i + 3];
      if (c0 < 0 || c1 < 0) break;
      const c2 = ch2 && ch2 !== '=' ? BRIDGE_B64_CHARS.indexOf(ch2) : -1;
      const c3 = ch3 && ch3 !== '=' ? BRIDGE_B64_CHARS.indexOf(ch3) : -1;
      const trip = (c0 << 18) | (c1 << 12) | ((c2 >= 0 ? c2 : 0) << 6) | (c3 >= 0 ? c3 : 0);
      bytes.push((trip >> 16) & 0xFF);
      if (c2 >= 0) bytes.push((trip >> 8) & 0xFF);
      if (c3 >= 0) bytes.push(trip & 0xFF);
    }
    return bytes;
  }

  function bridgeSealWithKey(plaintext, secretKey) {
    const clean = String(plaintext || '');
    if (!clean) return '';
    if (typeof window !== 'undefined' && window.CelikVaultCodec && typeof window.CelikVaultCodec.sealWithKey === 'function') {
      return window.CelikVaultCodec.sealWithKey(clean, secretKey);
    }
    const pBytes = bridgeUtf8ToBytes(clean);
    const rawKey = bridgeUtf8ToBytes(String(secretKey || 'celik-kodu-default-seal'));
    const kBytes = rawKey.length ? rawKey : [99, 101, 108, 105, 107];
    const xBytes = pBytes.map((b, idx) => (b ^ kBytes[idx % kBytes.length] ^ ((idx * 31 + 17) & 0xFF)) & 0xFF);
    return 'v1:' + bridgeEncodeBase64(xBytes);
  }

  function bridgeUnsealWithKey(sealed, secretKey) {
    const raw = String(sealed || '').trim();
    if (!raw || !raw.startsWith('v1:')) return '';
    if (typeof window !== 'undefined' && window.CelikVaultCodec && typeof window.CelikVaultCodec.unsealWithKey === 'function') {
      return window.CelikVaultCodec.unsealWithKey(raw, secretKey);
    }
    const xBytes = bridgeDecodeBase64(raw.slice(3));
    const rawKey = bridgeUtf8ToBytes(String(secretKey || 'celik-kodu-default-seal'));
    const kBytes = rawKey.length ? rawKey : [99, 101, 108, 105, 107];
    const pBytes = xBytes.map((b, idx) => (b ^ kBytes[idx % kBytes.length] ^ ((idx * 31 + 17) & 0xFF)) & 0xFF);
    return bridgeBytesToUtf8(pBytes);
  }

  function getWatchVaultSecret(uid, sealRef = '') {
    try {
      const ref = String(sealRef || '').trim();
      if (ref.length >= 10) return ref;
      const stateSeal = localStorage.getItem(`celik_kodu_cloud_seal_user_state_${uid}`);
      if (stateSeal && stateSeal.length >= 10) return stateSeal;
      const userSeal = localStorage.getItem(`celik_kodu_cloud_seal_${uid}`);
      if (userSeal && userSeal.length >= 10) return userSeal;
    } catch {}
    return `celik-watch-vault:${uid || 'anon'}`;
  }

  function sealWatchSecret(plainVal, uid, sealRef = '') {
    const clean = String(plainVal || '').trim();
    if (!clean) return '';
    return bridgeSealWithKey(clean, getWatchVaultSecret(uid, sealRef));
  }

  function unsealWatchSecret(sealedVal, uid, sealRef = '') {
    const raw = String(sealedVal || '').trim();
    if (!raw) return '';
    if (!raw.startsWith('v1:')) return raw;
    const candidates = [
      sealRef,
      (() => { try { return localStorage.getItem(`celik_kodu_cloud_seal_user_state_${uid}`); } catch { return ''; } })(),
      (() => { try { return localStorage.getItem(`celik_kodu_cloud_seal_${uid}`); } catch { return ''; } })(),
      `celik-watch-vault:${uid || 'anon'}`
    ].filter(Boolean);
    for (const keyCandidate of candidates) {
      const out = bridgeUnsealWithKey(raw, keyCandidate);
      if (out) return out;
    }
    return '';
  }

  function readWatchVault(uid) {
    if (!uid) return null;
    try {
      const raw = localStorage.getItem(`${WATCH_VAULT_KEY_PREFIX}${uid}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeWatchVault(uid, updates = {}, scheduleSync = true) {
    if (!uid) return null;
    const seal = getWatchVaultSecret(uid);
    const prev = readWatchVault(uid) || {};
    const nextVault = {
      enabled: updates.enabled !== undefined ? Boolean(updates.enabled) : (prev.enabled !== false),
      sealedTredict: updates.tredictToken !== undefined
        ? sealWatchSecret(updates.tredictToken, uid, seal)
        : (prev.sealedTredict || ''),
      sealedIntervals: updates.intervalsToken !== undefined
        ? sealWatchSecret(updates.intervalsToken, uid, seal)
        : (prev.sealedIntervals || ''),
      sealedGateway: updates.gatewayBase !== undefined
        ? sealWatchSecret(normalizeGatewayBase(updates.gatewayBase), uid, seal)
        : (prev.sealedGateway || ''),
      sealRef: seal,
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(`${WATCH_VAULT_KEY_PREFIX}${uid}`, JSON.stringify(nextVault));
      localStorage.setItem(`${GARMIN_ENABLED_PREFIX}${uid}`, nextVault.enabled ? 'true' : 'false');
      localStorage.removeItem(`${TREDICT_TOKEN_KEY}_${uid}`);
      localStorage.removeItem(`${INTERVALS_TOKEN_KEY}_${uid}`);
      localStorage.removeItem(`${GATEWAY_URL_KEY}_${uid}`);
    } catch {}
    if (scheduleSync && typeof window !== 'undefined' && typeof window.scheduleUserStateCloudSync === 'function') {
      try { window.scheduleUserStateCloudSync(uid); } catch {}
    }
    return nextVault;
  }

  function migrateLegacyWatchSecretsToVault(uid) {
    if (!uid) return null;
    try {
      const legT = String(localStorage.getItem(`${TREDICT_TOKEN_KEY}_${uid}`) || '').trim();
      const legI = String(localStorage.getItem(`${INTERVALS_TOKEN_KEY}_${uid}`) || '').trim();
      const legG = normalizeGatewayBase(localStorage.getItem(`${GATEWAY_URL_KEY}_${uid}`) || '');
      if (!legT && !legI && !legG) return null;
      const exp = localStorage.getItem(`${GARMIN_ENABLED_PREFIX}${uid}`);
      return writeWatchVault(uid, {
        enabled: exp === 'false' ? false : true,
        tredictToken: legT,
        intervalsToken: legI,
        gatewayBase: legG
      }, false);
    } catch {
      return null;
    }
  }

  function normalizeGatewayBase(rawUrl) {
    const trimmed = String(rawUrl || '').trim().replace(/\/+$/, '');
    if (!trimmed || !/^https:\/\//i.test(trimmed)) return '';
    return trimmed.replace(/\/api\/tredict(?:\/.*)?$/i, '');
  }

  function getUserTredictToken(uidOverride) {
    const uid = uidOverride || getActiveUidSafe();
    if (!uid) return '';
    try {
      const vault = readWatchVault(uid);
      if (vault && vault.sealedTredict) {
        const unsealed = unsealWatchSecret(vault.sealedTredict, uid, vault.sealRef || '');
        if (unsealed) return unsealed.trim();
      }
      const leg = String(localStorage.getItem(`${TREDICT_TOKEN_KEY}_${uid}`) || '').trim();
      if (leg) {
        migrateLegacyWatchSecretsToVault(uid);
        return leg;
      }
      return '';
    } catch { return ''; }
  }

  function getUserIntervalsToken(uidOverride) {
    const uid = uidOverride || getActiveUidSafe();
    if (!uid) return '';
    try {
      const vault = readWatchVault(uid);
      if (vault && vault.sealedIntervals) {
        const unsealed = unsealWatchSecret(vault.sealedIntervals, uid, vault.sealRef || '');
        if (unsealed) return unsealed.trim();
      }
      const leg = String(localStorage.getItem(`${INTERVALS_TOKEN_KEY}_${uid}`) || '').trim();
      if (leg) {
        migrateLegacyWatchSecretsToVault(uid);
        return leg;
      }
      return '';
    } catch { return ''; }
  }

  function getUserGatewayBase(uidOverride) {
    const uid = uidOverride || getActiveUidSafe();
    if (!uid) return '';
    try {
      const vault = readWatchVault(uid);
      if (vault && vault.sealedGateway) {
        const unsealed = unsealWatchSecret(vault.sealedGateway, uid, vault.sealRef || '');
        if (unsealed) return normalizeGatewayBase(unsealed);
      }
      return normalizeGatewayBase(localStorage.getItem(`${GATEWAY_URL_KEY}_${uid}`) || '');
    } catch { return ''; }
  }

  function hasGarminCredentialsConfigured(uidOverride) {
    return Boolean(getUserTredictToken(uidOverride) || getUserIntervalsToken(uidOverride));
  }

  function makeSyntheticJsonResponse(payload, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      headers: {
        get: (name) => (String(name || '').toLowerCase() === 'content-type' ? 'application/json' : '')
      },
      json: async () => payload
    };
  }

  function mapIntervalsTypeToSport(rawType) {
    const t = String(rawType || '').toLowerCase().trim();
    if (t.includes('walk') || t.includes('hike')) {
      return { sportType: 'walking', subSportType: 'walking' };
    }
    if (t.includes('run')) {
      return { sportType: 'running', subSportType: t.includes('treadmill') ? 'treadmill' : 'generic' };
    }
    if (t.includes('row')) {
      return { sportType: 'fitness_equipment', subSportType: 'indoor_rowing' };
    }
    if (t.includes('weight') || t.includes('strength')) {
      return { sportType: 'training', subSportType: 'strength_training' };
    }
    if (t.includes('ride') || t.includes('cycl') || t.includes('bike')) {
      return { sportType: 'cycling', subSportType: t.includes('indoor') ? 'virtual_activity' : 'generic' };
    }
    return { sportType: t || 'other', subSportType: 'generic' };
  }

  function shiftDateIsoDays(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + Number(daysOffset || 0));
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async function executeDirectIntervalsBrowserFallback(apiPath, options, intervalsToken) {
    const cleanToken = String(intervalsToken || '').trim();
    if (!cleanToken) return null;
    const authHeader = 'Basic ' + bridgeEncodeBase64(bridgeUtf8ToBytes(`API_KEY:${cleanToken}`));
    const base = 'https://intervals.icu/api/v1/athlete/0';
    const qIdx = apiPath.indexOf('?');
    const route = qIdx >= 0 ? apiPath.slice(0, qIdx) : apiPath;
    const qs = qIdx >= 0 ? apiPath.slice(qIdx + 1) : '';
    const daysMatch = qs.match(/(?:^|&)days=(\d+)/);
    const daysNum = daysMatch ? Math.min(90, Math.max(1, Number(daysMatch[1]))) : 21;

    const icuFetch = async (url, reqOpts = {}) => {
      const res = await fetch(url, {
        ...reqOpts,
        headers: {
          Authorization: authHeader,
          ...(reqOpts.headers || {})
        }
      });
      if (res.status === 401 || res.status === 403) {
        const err = new Error('WATCH_AUTH_FAILED');
        err.code = 'WATCH_AUTH_FAILED';
        throw err;
      }
      return res;
    };

    if (route.endsWith('/health')) {
      const res = await icuFetch(base);
      if (!res.ok) return null;
      const athlete = await res.json();
      return makeSyntheticJsonResponse({
        ok: true,
        connected: true,
        tredict: false,
        intervals: {
          ok: true,
          connected: true,
          athlete: athlete?.name || athlete?.id || '0'
        },
        source: 'intervals_direct_browser'
      });
    }

    if (route.endsWith('/activities')) {
      const oldest = shiftDateIsoDays(-daysNum);
      const newest = shiftDateIsoDays(1);
      const res = await icuFetch(`${base}/activities?oldest=${oldest}&newest=${newest}`);
      if (!res.ok) return null;
      const rawList = await res.json();
      const activities = Array.isArray(rawList)
        ? rawList.filter(a => a && a.id).map(a => {
            const { sportType, subSportType } = mapIntervalsTypeToSport(a.type);
            const durSec = Number(a.moving_time || a.elapsed_time || 0);
            const totalSec = Number(a.elapsed_time || a.moving_time || durSec);
            return {
              id: String(a.id),
              date: a.start_date || a.start_date_local || '',
              title: a.name || '',
              sportType,
              subSportType,
              summary: {
                duration: durSec,
                durationTotal: totalSec,
                distance: Number(a.distance || 0),
                calories: Number(a.calories || 0),
                heartrate: Number(a.average_hr || a.average_heartrate || 0) || null,
                heartrateMax: Number(a.max_hr || a.max_heartrate || 0) || null,
                pace: Number(a.pace || 0) || null,
                cadence: Number(a.average_cadence || 0) || null
              },
              rounds: [],
              sourceProvider: 'intervals'
            };
          })
        : [];
      return makeSyntheticJsonResponse({
        ok: true,
        activities,
        source: 'intervals_direct_browser'
      });
    }

    if (route.endsWith('/wellness')) {
      const oldest = shiftDateIsoDays(-daysNum);
      const newest = shiftDateIsoDays(0);
      const res = await icuFetch(`${base}/wellness?oldest=${oldest}&newest=${newest}`);
      if (!res.ok) return null;
      const rawList = await res.json();
      const daily = Array.isArray(rawList)
        ? rawList.filter(w => w && w.id).map(w => ({
            date: String(w.id).slice(0, 10),
            steps: Number(w.steps || 0),
            floorsClimbed: Number(w.floorsClimbed || 0),
            restingHR: w.restingHR ? Number(w.restingHR) : null,
            sleepScore: w.sleepScore ? Number(w.sleepScore) : null
          }))
        : [];
      return makeSyntheticJsonResponse({
        ok: true,
        daily,
        source: 'intervals_direct_browser'
      });
    }

    if (route.endsWith('/push-workout')) {
      let bodyObj = {};
      try { bodyObj = options.body ? JSON.parse(options.body) : {}; } catch {}
      const events = Array.isArray(bodyObj.intervalsEvents) ? bodyObj.intervalsEvents : [];
      if (events.length === 0) return null;
      const res = await icuFetch(`${base}/events/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events)
      });
      if (!res.ok) return null;
      const created = await res.json();
      return makeSyntheticJsonResponse({
        ok: true,
        directCalendarSync: true,
        count: Array.isArray(created) ? created.length : events.length,
        workouts: Array.isArray(created) ? created : events,
        source: 'intervals_direct_browser'
      });
    }

    if (route.endsWith('/activity-update')) {
      let bodyObj = {};
      try { bodyObj = options.body ? JSON.parse(options.body) : {}; } catch {}
      const actId = String(bodyObj.activityId || '').trim();
      const title = String(bodyObj.title || '').trim();
      if (actId.startsWith('i') && title) {
        await icuFetch(`https://intervals.icu/api/v1/activity/${encodeURIComponent(actId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: title })
        });
      }
      return makeSyntheticJsonResponse({ ok: true, source: 'intervals_direct_browser' });
    }

    if (route.endsWith('/delete-dates')) {
      let bodyObj = {};
      try { bodyObj = options.body ? JSON.parse(options.body) : {}; } catch {}
      const dates = Array.isArray(bodyObj.dates) ? bodyObj.dates : [];
      let deletedCount = 0;
      if (dates.length > 0) {
        const sorted = [...dates].sort();
        const evRes = await icuFetch(`${base}/events?oldest=${sorted[0]}&newest=${sorted[sorted.length - 1]}`);
        if (evRes.ok) {
          const evList = await evRes.json();
          const dateSet = new Set(sorted);
          const toDel = Array.isArray(evList) ? evList.filter(e => e && e.id && dateSet.has(String(e.start_date_local || '').slice(0, 10)) && String(e.description || '').includes('Çelik Kodu')) : [];
          for (const ev of toDel) {
            const delRes = await icuFetch(`${base}/events/${encodeURIComponent(ev.id)}`, { method: 'DELETE' });
            if (delRes.ok) deletedCount++;
          }
        }
      }
      return makeSyntheticJsonResponse({ ok: true, deletedCount, source: 'intervals_direct_browser' });
    }

    return null;
  }

  function buildGatewayTargetUrls(apiPath, uidOverride) {
    const cleanPath = apiPath.startsWith('/api/tredict')
      ? apiPath
      : `/api/tredict/${apiPath.replace(/^\/+/, '')}`;
    const isLocalHost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const currentOrigin = typeof window !== 'undefined' ? String(window.location.origin || '') : '';
    const customBase = getUserGatewayBase(uidOverride);
    let centralBridgeBase = '';
    try {
      centralBridgeBase = normalizeGatewayBase(localStorage.getItem('celik_kodu_central_bridge_url') || '');
    } catch {}

    const urls = [];
    const pushUnique = u => {
      if (u && !urls.includes(u)) urls.push(u);
    };

    if (customBase) pushUnique(`${customBase}${cleanPath}`);
    if (centralBridgeBase) pushUnique(`${centralBridgeBase}${cleanPath}`);
    if (isLocalHost || (typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.protocol === 'http:'))) {
      pushUnique(cleanPath);
    }
    if (currentOrigin !== DEFAULT_CLOUD_GATEWAY_BASE) {
      pushUnique(`${DEFAULT_CLOUD_GATEWAY_BASE}${cleanPath}`);
    }
    return urls;
  }

  async function fetchGarminBridge(apiPath, options = {}) {
    const uid = options.uid || getActiveUidSafe();
    const tredictToken = options.tredictToken !== undefined
      ? String(options.tredictToken || '').trim()
      : getUserTredictToken(uid);
    const intervalsToken = options.intervalsToken !== undefined
      ? String(options.intervalsToken || '').trim()
      : getUserIntervalsToken(uid);
    const customGatewayOverride = options.gatewayBase !== undefined
      ? normalizeGatewayBase(options.gatewayBase)
      : '';

    if (!tredictToken && !intervalsToken) {
      const err = new Error('MISSING_USER_WATCH_TOKEN');
      err.code = 'MISSING_USER_WATCH_TOKEN';
      throw err;
    }

    const headers = { ...(options.headers || {}) };
    if (tredictToken) headers['X-Tredict-Token'] = tredictToken;
    if (intervalsToken) headers['X-Intervals-Token'] = intervalsToken;
    headers['X-Client-Tz-Offset'] = String(new Date().getTimezoneOffset());

    const fetchOpts = { ...options, headers };
    delete fetchOpts.uid;
    delete fetchOpts.tredictToken;
    delete fetchOpts.intervalsToken;
    delete fetchOpts.gatewayBase;

    let targets = buildGatewayTargetUrls(apiPath, uid);
    if (customGatewayOverride) {
      const cleanPath = apiPath.startsWith('/api/tredict')
        ? apiPath
        : `/api/tredict/${apiPath.replace(/^\/+/, '')}`;
      targets = [`${customGatewayOverride}${cleanPath}`, ...targets.filter(u => !u.startsWith(customGatewayOverride))];
    }

    let authError = null;
    for (const targetUrl of targets) {
      try {
        const res = await fetch(targetUrl, fetchOpts);
        const ct = String(res.headers.get('content-type') || '').toLowerCase();
        if (res.status === 401 || res.status === 403) {
          authError = new Error('WATCH_AUTH_FAILED');
          authError.code = 'WATCH_AUTH_FAILED';
          continue;
        }
        if ((res.ok || res.status === 400) && ct.includes('application/json')) {
          return res;
        }
      } catch {}
    }

    if (intervalsToken) {
      try {
        const directRes = await executeDirectIntervalsBrowserFallback(apiPath, options, intervalsToken);
        if (directRes) return directRes;
      } catch (directErr) {
        if (directErr && (directErr.code === 'WATCH_AUTH_FAILED' || directErr.message === 'WATCH_AUTH_FAILED')) {
          authError = directErr;
        }
      }
    }

    if (authError) throw authError;
    const gwErr = new Error('CLOUD_GATEWAY_UNREACHABLE');
    gwErr.code = 'CLOUD_GATEWAY_UNREACHABLE';
    throw gwErr;
  }

  // Kişisel sağlık verileri kaynak kodda sabit tutulmaz; yalnızca kullanıcının kendi yerel önbelleğinden okunur
  const DEFAULT_GARMIN_WELLNESS_STEPS = {};

  const MUSCLE_TO_GARMIN_MAP = {
    chest: ['CHEST'],
    back: ['LATS', 'TRAPS', 'LOWER_BACK'],
    shoulders: ['SHOULDERS', 'TRAPS'],
    biceps: ['BICEPS', 'FOREARM'],
    triceps: ['TRICEPS'],
    quads: ['QUADS', 'ADDUCTORS', 'HIPS'],
    hamstrings: ['HAMSTRINGS'],
    glutes: ['GLUTES', 'HIPS', 'ABDUCTORS'],
    calves: ['CALVES'],
    calves_grip: ['CALVES', 'FOREARM'],
    forearms: ['FOREARM'],
    core: ['ABS', 'OBLIQUES', 'HIPS', 'LOWER_BACK']
  };

  // Kullanıcıya özel manifestolar yalnızca kendi yerel depolamasında tutulur
  const DEFAULT_SENT_MANIFESTS = {};

  // Sabit test seansları kaldırıldı; yalnızca gerçek senkronize edilen seanslar tutulur
  const LEGACY_TEST_ACTIVITY_IDS = new Set([
    'o5bRRWBN3piMYWtXuUm4sM',
    'utretVdwLMwDYvpHw4S1wR',
    'sYv3SjBS7jACqo9gTtwAMi',
    '54kfVj63bYftp4tVPJTs46',
    'cH1DvAZDqdk9LG9ftFa7RG',
    '2gzbkdRoYTPQCHsswdMP2d'
  ]);
  const FALLBACK_GARMIN_ACTIVITIES = [];

  function escHtml(str) {
    if (typeof window.escapeHTML === 'function') return window.escapeHTML(String(str ?? ''));
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ─── KULLANICI BAZLI GARMIN AKTİVASYON KONTROLÜ (GARMIN KULLANMAYAN KULLANICI KORUMASI) ───
  function getCurrentUserObj() {
    try {
      if (typeof window.getActiveUser === 'function') {
        const u = window.getActiveUser();
        if (u) return u;
      }
      const rawSession = localStorage.getItem('celik_kodu_session');
      if (rawSession) {
        const sess = JSON.parse(rawSession);
        if (sess && sess.userId) {
          return {
            id: sess.userId,
            name: sess.name || sess.username || '',
            role: sess.role || (sess.userId === 'usr_admin' ? 'admin' : 'user')
          };
        }
      }
      const activeUid = localStorage.getItem('celik_kodu_active_user_id');
      if (activeUid) {
        return {
          id: activeUid,
          name: activeUid === 'usr_admin' ? 'Ferit KANTARCI' : '',
          role: activeUid === 'usr_admin' ? 'admin' : 'user'
        };
      }
    } catch {}
    return null;
  }

  function getActiveUidSafe() {
    const u = getCurrentUserObj();
    return (u && u.id) ? u.id : '';
  }

  function getScopedGarminKey(baseKey, uidOverride) {
    return `${baseKey}_${uidOverride || getActiveUidSafe()}`;
  }

  function migrateLegacyGarminStorageToOwner() {
    try {
      const legacyKeys = [
        TELEMETRY_STORAGE_KEY,
        WELLNESS_STEPS_KEY,
        RESOLVED_SETS_KEY,
        OUTBOX_PLANS_KEY,
        SENT_MANIFESTS_KEY
      ];
      legacyKeys.forEach(baseKey => {
        const legacyVal = localStorage.getItem(baseKey);
        if (legacyVal !== null) {
          const ownerKey = `${baseKey}_usr_admin`;
          if (!localStorage.getItem(ownerKey)) {
            localStorage.setItem(ownerKey, legacyVal);
          }
          localStorage.removeItem(baseKey);
        }
      });
      localStorage.removeItem('celik_workout_logs');
    } catch {}
  }

  function isGarminEnabledForCurrentUser() {
    const u = getCurrentUserObj();
    if (!u || !u.id) return false;
    const uid = u.id;
    try {
      const vault = readWatchVault(uid);
      if (vault && typeof vault.enabled === 'boolean') {
        if (!vault.enabled) return false;
        if (vault.sealedTredict || vault.sealedIntervals) return true;
      }
      const explicit = localStorage.getItem(GARMIN_ENABLED_PREFIX + uid);
      if (explicit === 'true') return true;
      if (explicit === 'false') return false;
      if (hasGarminCredentialsConfigured(uid)) return true;
      return Boolean(localStorage.getItem(`${TELEMETRY_STORAGE_KEY}_${uid}`));
    } catch {}
    return false;
  }

  window.toggleGarminIntegrationForUser = function (enableFlag) {
    const u = getCurrentUserObj();
    if (!u || !u.id) return;
    const uid = u.id;
    const nextVal = typeof enableFlag === 'boolean' ? enableFlag : !isGarminEnabledForCurrentUser();
    if (nextVal && !hasGarminCredentialsConfigured(uid)) {
      if (typeof window.openGarminSetupModal === 'function') {
        window.openGarminSetupModal();
      }
      return;
    }
    try {
      const prevVault = readWatchVault(uid);
      if (prevVault) {
        writeWatchVault(uid, { enabled: nextVal }, true);
      } else {
        localStorage.setItem(GARMIN_ENABLED_PREFIX + uid, nextVal ? 'true' : 'false');
      }
    } catch {}
    refreshGarminPanelsForUserState();
    if (nextVal) {
      setTimeout(syncActiveSchedulesOnBoot, 200);
      setTimeout(syncGarminActivitiesSilent, 400);
    }
    if (typeof showToast === 'function') {
      showToast(nextVal
        ? '⌚ Saat bağlantısı aktif edildi.'
        : '⌚ Saat bağlantısı bu hesap için kapatıldı.');
    }
  };

  function toGarminMuscleTags(ourMuscles) {
    return [...new Set((ourMuscles || []).flatMap(m => MUSCLE_TO_GARMIN_MAP[m] || [String(m).toUpperCase()]))];
  }

  function inferCategoryFromPrimaryMuscle(primaryMuscles) {
    const p = (primaryMuscles || [])[0] || '';
    if (p === 'chest') return 'bench_press';
    if (p === 'back') return 'row';
    if (p === 'shoulders') return 'shoulder_press';
    if (p === 'biceps') return 'curl';
    if (p === 'triceps') return 'triceps_extension';
    if (p === 'quads') return 'squat';
    if (p === 'hamstrings') return 'deadlift';
    if (p === 'glutes') return 'hip_raise';
    if (p === 'calves' || p === 'calves_grip') return 'calf_raise';
    if (p === 'core') return 'core';
    return 'total_body';
  }

  // ─── GÖREV 1: LIBRARY-GUARD İLE KAS KIYASLAMASI VE GARMIN DOĞRULUK ANALİZİ ───
  function auditExerciseWithLibraryGuard(exOrId) {
    const exObj = typeof exOrId === 'object' && exOrId !== null
      ? exOrId
      : (typeof EXERCISES_DB !== 'undefined'
        ? EXERCISES_DB.find(x => x.id === exOrId || x.name === exOrId)
        : null);

    if (!exObj) {
      const fallbackLabel = typeof exOrId === 'string' ? exOrId : 'Özel Hareket';
      return {
        originalId: 'custom_unmapped',
        originalName: fallbackLabel,
        primaryMuscles: [],
        secondaryMuscles: [],
        fitCategory: 'total_body',
        fitName: '',
        fitNote: `${fallbackLabel} [id:custom_unmapped]`,
        matchType: 'unmapped_noted',
        muscleAccuracyPct: 100
      };
    }

    const libPrimary = Array.isArray(exObj.primaryMuscles) ? exObj.primaryMuscles : [];
    const libSecondary = Array.isArray(exObj.secondaryMuscles) ? exObj.secondaryMuscles : [];
    const expectedGarminTags = new Set(toGarminMuscleTags([...libPrimary, ...libSecondary]));
    const garminTags = new Set([...(exObj.garminPrimaryMuscles || []), ...(exObj.garminSecondaryMuscles || [])]);

    const hasExactGarminCounterpart = Boolean(exObj.fitName && exObj.garminMatchType !== 'unmapped_noted');
    let matchedCount = 0;
    expectedGarminTags.forEach(tag => {
      if (garminTags.has(tag)) matchedCount++;
    });
    const muscleAccuracyPct = expectedGarminTags.size > 0
      ? Math.round((matchedCount / expectedGarminTags.size) * 100)
      : 100;

    if (!hasExactGarminCounterpart) {
      return {
        originalId: exObj.id,
        originalName: exObj.name,
        primaryMuscles: libPrimary,
        secondaryMuscles: libSecondary,
        fitCategory: exObj.fitCategory || inferCategoryFromPrimaryMuscle(libPrimary),
        fitName: '',
        fitNote: exObj.fitNote || `${exObj.name} [id:${exObj.id}]`,
        matchType: 'unmapped_noted',
        muscleAccuracyPct: 100
      };
    }

    return {
      originalId: exObj.id,
      originalName: exObj.name,
      primaryMuscles: libPrimary,
      secondaryMuscles: libSecondary,
      fitCategory: exObj.fitCategory || inferCategoryFromPrimaryMuscle(libPrimary),
      fitName: exObj.fitName,
      fitNote: exObj.fitNote ? `${exObj.name} (${exObj.fitNote}) [id:${exObj.id}]` : `${exObj.name} [id:${exObj.id}]`,
      matchType: 'exact_verified',
      muscleAccuracyPct
    };
  }

  function auditAllLibraryExercises() {
    if (typeof EXERCISES_DB === 'undefined') return { total: 0, exactCount: 0, unmappedNotedCount: 0, items: [] };
    const items = EXERCISES_DB.map(ex => auditExerciseWithLibraryGuard(ex));
    const exactCount = items.filter(i => i.matchType === 'exact_verified').length;
    const unmappedNotedCount = items.filter(i => i.matchType === 'unmapped_noted').length;
    return {
      total: items.length,
      exactCount,
      unmappedNotedCount,
      items
    };
  }

  function getSentManifestsMap() {
    if (!isGarminEnabledForCurrentUser()) return {};
    try {
      const raw = localStorage.getItem(getScopedGarminKey(SENT_MANIFESTS_KEY));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_SENT_MANIFESTS, ...parsed };
        }
      }
    } catch {}
    return { ...DEFAULT_SENT_MANIFESTS };
  }

  function parseSingleRepCount(rawReps, fallback = 10) {
    const s = String(rawReps ?? '').trim();
    const rangeMatch = s.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (rangeMatch) {
      const a = parseInt(rangeMatch[1], 10);
      const b = parseInt(rangeMatch[2], 10);
      if (a > 0 && b > 0) return Math.round((a + b) / 2);
    }
    const firstMatch = s.match(/\d+/);
    if (firstMatch) {
      const val = parseInt(firstMatch[0], 10);
      if (val > 0 && val <= 200) return val;
    }
    return fallback;
  }

  function hydrateExercisesWithWorkoutScheme(workoutObj, rawList) {
    const list = Array.isArray(rawList) ? rawList : [];
    const scheme = (workoutObj && workoutObj.scheme)
      || (workoutObj && workoutObj.customWorkout && workoutObj.customWorkout.scheme)
      || {};
    const baseSets = Number(scheme.sets || 3) || 3;
    const baseReps = scheme.reps || '10';
    const baseRest = Number(scheme.rest || 60) || 60;
    return list.map(item => {
      if (!item || typeof item !== 'object') return item;
      const exObj = typeof EXERCISES_DB !== 'undefined'
        ? EXERCISES_DB.find(x => x.id === (item.id || item.exerciseId) || x.name === item.name)
        : null;
      const rememberedWeight = (typeof window.getExerciseRememberedWeight === 'function' && (exObj || item))
        ? Number(window.getExerciseRememberedWeight(exObj || item) || 0)
        : 0;
      return Object.assign({}, item, {
        sets: item.sets || item.targetSets || baseSets,
        reps: item.reps || item.targetReps || baseReps,
        rest: item.rest || item.restSec || item.customRest || baseRest,
        weight: item.weight || item.targetWeight || rememberedWeight || 0
      });
    });
  }

  function saveSentWorkoutManifest(workoutTitle, exercisesList, activityOrDateKey) {
    if (!isGarminEnabledForCurrentUser()) return null;
    const manifests = getSentManifestsMap();
    const key = activityOrDateKey || ('latest_' + String(workoutTitle || 'seans').toLowerCase().replace(/\s+/g, '_'));
    const plannedExercises = (exercisesList || []).map((item, idx) => {
      const audited = auditExerciseWithLibraryGuard(item.id || item.exerciseId || item.name || item);
      return {
        stepOrder: idx,
        originalId: audited.originalId,
        originalName: audited.originalName,
        primaryMuscles: audited.primaryMuscles,
        secondaryMuscles: audited.secondaryMuscles,
        plannedSets: Math.max(1, Number(item.sets || 3)),
        plannedReps: parseSingleRepCount(item.reps, 10),
        plannedWeight: Number(item.weight || item.targetWeight || 12),
        fitCategory: audited.fitCategory,
        fitName: audited.fitName,
        fitNote: audited.fitNote,
        matchType: audited.matchType
      };
    });

    const manifestObj = {
      manifestId: 'manifest_' + Date.now(),
      activityId: activityOrDateKey || null,
      title: workoutTitle || 'Çelik Kodu Güç Seansı',
      sentAt: new Date().toISOString(),
      plannedExercises
    };
    manifests[key] = manifestObj;
    manifests.__lastSent = manifestObj;
    try {
      localStorage.setItem(getScopedGarminKey(SENT_MANIFESTS_KEY), JSON.stringify(manifests));
      if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(getActiveUidSafe());
    } catch {}
    return manifestObj;
  }

  function buildManifestFromAppHistoryLog(appLog, localDatePrefix) {
    if (!appLog || !Array.isArray(appLog.exercises) || appLog.exercises.length === 0) return null;
    const plannedExercises = appLog.exercises.map((item, idx) => {
      const audited = auditExerciseWithLibraryGuard(item.id || item.exerciseId || item.name || item);
      const setsArr = Array.isArray(item.sets) ? item.sets.filter(s => s && s.completed !== false) : [];
      const plannedSets = setsArr.length > 0
        ? setsArr.length
        : Math.max(1, Number(item.completedSetsCount || item.completedSets || item.sets || 3));
      const plannedReps = setsArr.length > 0
        ? Math.max(1, Math.round(setsArr.reduce((sum, s) => sum + parseSingleRepCount(s.reps, 10), 0) / setsArr.length))
        : parseSingleRepCount(item.reps, 10);
      const plannedWeight = setsArr.length > 0
        ? Math.max(0, ...setsArr.map(s => Number(s.weight || 0)))
        : Number(item.maxWeight || item.weight || item.targetWeight || 0);
      return {
        stepOrder: idx,
        originalId: audited.originalId,
        originalName: item.name || audited.originalName,
        primaryMuscles: audited.primaryMuscles,
        secondaryMuscles: audited.secondaryMuscles,
        plannedSets,
        plannedReps,
        plannedWeight,
        loggedSetsArray: setsArr,
        isInterSetExtra: Boolean(item.isInterSetExtra),
        fitCategory: audited.fitCategory,
        fitName: audited.fitName,
        fitNote: audited.fitNote,
        matchType: audited.matchType
      };
    });
    const locSuffix = appLog.locationName ? ` (${appLog.locationName})` : '';
    const baseTitle = appLog.program || appLog.title || 'Çelik Kodu Güç Seansı';
    return {
      manifestId: 'manifest_applog_' + (appLog.id || localDatePrefix),
      activityId: appLog.garminActivityId || ('date_' + localDatePrefix),
      fromAppHistoryLogId: appLog.id,
      title: baseTitle.includes(locSuffix) ? baseTitle : (baseTitle + locSuffix),
      sentAt: appLog.date || localDatePrefix,
      plannedExercises
    };
  }

  function resolveStandaloneCardioSpec(activity) {
    if (!activity || typeof activity !== 'object') return null;
    const sub = String(activity.subSportType || '').toLowerCase().trim();
    const sp = String(activity.sportType || '').toLowerCase().trim();
    const titleLow = String(activity.title || '').toLowerCase().trim();
    if (sp === 'strength_training' || sp === 'training' || sub === 'strength_training' || sub === 'strength') {
      return null;
    }
    const rounds = Array.isArray(activity.rounds) ? activity.rounds : [];
    const hasStrengthRound = rounds.some(r =>
      r && (
        Number(r.weight || 0) > 0 ||
        /\[id:(?!cond_)[a-z0-9_]+\]/i.test(String(r.note || '')) ||
        (r.exerciseCategory && !['cardio', 'run', 'row'].includes(String(r.exerciseCategory).toLowerCase()))
      )
    );
    if (hasStrengthRound) return null;

    if (sp === 'rowing' || sub === 'indoor_rowing' || sub === 'rowing' || titleLow.includes('kürek') || titleLow.includes('row')) {
      return { cardioExId: 'cond_indoor_row', fitCat: 'row', fitNm: 'indoor_row' };
    }
    if (
      sp === 'walking' || sp === 'hiking' ||
      sub === 'walking' || sub === 'hiking' || sub === 'casual_walking' || sub === 'speed_walking' ||
      titleLow.includes('yürüyüş') || titleLow.includes('yuruyus') || titleLow.includes('walk') || titleLow.includes('hike')
    ) {
      return { cardioExId: 'cond_walking', fitCat: 'run', fitNm: 'walk' };
    }
    if (
      sp === 'running' || sub === 'treadmill' || sub === 'running' ||
      titleLow.includes('koşu') || titleLow.includes('kosu') || titleLow.includes('run')
    ) {
      return { cardioExId: 'cond_running', fitCat: 'run', fitNm: 'run' };
    }
    return null;
  }

  function isStandaloneCardioActivity(activity) {
    return Boolean(resolveStandaloneCardioSpec(activity));
  }

  function isCardioLogRecord(log) {
    if (!log || typeof log !== 'object') return false;
    if (log.isCardioActivity === true) return true;
    const exs = Array.isArray(log.exercises) ? log.exercises : [];
    if (exs.length === 0) return false;
    return exs.every(ex => ex && (ex.id === 'cond_walking' || ex.id === 'cond_running' || ex.id === 'cond_indoor_row'));
  }

  function areSameWatchSession(actA, actB) {
    if (!actA || !actB) return false;
    if (String(actA.id || '') === String(actB.id || '')) return true;
    const dA = toLocalIsoDateString(actA.date);
    const dB = toLocalIsoDateString(actB.date);
    if (!dA || dA !== dB) return false;
    const tA = actA.date ? new Date(actA.date).getTime() : NaN;
    const tB = actB.date ? new Date(actB.date).getTime() : NaN;
    const timeClose = Number.isFinite(tA) && Number.isFinite(tB) && Math.abs(tA - tB) <= 180 * 1000;
    const titleA = String(actA.title || '').toLowerCase().trim();
    const titleB = String(actB.title || '').toLowerCase().trim();
    const specA = resolveStandaloneCardioSpec(actA);
    const specB = resolveStandaloneCardioSpec(actB);
    const durA = Number(actA.summary?.duration || 0);
    const durB = Number(actB.summary?.duration || 0);
    const durClose = durA > 0 && durB > 0 && Math.abs(durA - durB) <= 45;
    if (timeClose && ((titleA && titleA === titleB) || (specA && specB && specA.cardioExId === specB.cardioExId) || durClose)) {
      return true;
    }
    if (specA && specB && specA.cardioExId === specB.cardioExId && durClose && titleA && titleA === titleB) {
      return true;
    }
    return false;
  }

  function findManifestForActivity(activity) {
    if (isStandaloneCardioActivity(activity)) return null;
    const localDatePrefix = toLocalIsoDateString(activity.date);
    const rounds = Array.isArray(activity.rounds) ? activity.rounds : [];
    const hasStructuredNoteTags = rounds.some(r => /\[id:[a-z0-9_]+\]/i.test(String(r?.note || '')));

    // YEDEK AKIŞ (Yalnızca program Garmin'e aktarılmadıysa ve saatte bağımsız/serbest kayıt açıldıysa):
    // Kullanıcının aynı gün uygulama içinden adım adım kaydettiği telefon antrenmanını baz al.
    if (!hasStructuredNoteTags && localDatePrefix) {
      try {
        const uid = getActiveUidSafe();
        const historyRaw = localStorage.getItem(`celik_kodu_history_${uid}`);
        if (historyRaw) {
          const logs = JSON.parse(historyRaw);
          if (Array.isArray(logs)) {
            const appLog = logs.find(l =>
              l &&
              !String(l.id || '').startsWith('garmin_') &&
              l.sourceChief !== 'garmin-tredict-guard' &&
              (l.garminActivityId === activity.id || toLocalIsoDateString(l.date) === localDatePrefix) &&
              Array.isArray(l.exercises) &&
              l.exercises.length > 0
            );
            if (appLog) {
              const appManifest = buildManifestFromAppHistoryLog(appLog, localDatePrefix);
              if (appManifest) return appManifest;
            }
          }
        }
      } catch {}
    }

    // ANA AKIŞ (Program Garmin'e aktarıldıysa): Veriler doğrudan Garmin'e gönderilen programdan ve saatten akar!
    const manifests = getSentManifestsMap();
    if (activity.id && manifests[activity.id]) return manifests[activity.id];
    if (localDatePrefix && manifests['date_' + localDatePrefix]) return manifests['date_' + localDatePrefix];
    const rawDatePrefix = String(activity.date || '').slice(0, 10);
    if (rawDatePrefix && manifests['date_' + rawDatePrefix]) return manifests['date_' + rawDatePrefix];
    const normTitle = String(activity.title || '').toLowerCase().trim();
    for (const m of Object.values(manifests)) {
      if (m && m.title && String(m.title).toLowerCase().trim() === normTitle) {
        return m;
      }
    }
    // Takvimde o güne atanmış plan varsa oradan da manifest üret
    if (localDatePrefix) {
      try {
        const uid = getActiveUidSafe();
        const dateSchedRaw = localStorage.getItem(`celik_kodu_date_schedule_${uid}`);
        if (dateSchedRaw) {
          const dateSched = JSON.parse(dateSchedRaw);
          if (dateSched && dateSched[localDatePrefix]) {
            const exList = extractExercisesFromPlanEntry(dateSched[localDatePrefix]);
            if (exList.length > 0) {
              return saveSentWorkoutManifest(dateSched[localDatePrefix].title || activity.title, exList, 'date_' + localDatePrefix);
            }
          }
        }
        const dObj = new Date(localDatePrefix + 'T12:00:00');
        if (!isNaN(dObj.getTime())) {
          const dayIdx = String(dObj.getDay());
          const weekRaw = localStorage.getItem(`celik_kodu_weekly_schedule_${uid}`);
          if (weekRaw) {
            const weekSched = JSON.parse(weekRaw);
            if (weekSched && weekSched[dayIdx]) {
              const exList = extractExercisesFromPlanEntry(weekSched[dayIdx]);
              if (exList.length > 0) {
                return saveSentWorkoutManifest(weekSched[dayIdx].title || activity.title, exList, 'date_' + localDatePrefix);
              }
            }
          }
        }
      } catch {}
    }
    return null;
  }

  function getStoredActivities() {
    if (!isGarminEnabledForCurrentUser()) return [];
    try {
      const key = getScopedGarminKey(TELEMETRY_STORAGE_KEY);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(a => a && !LEGACY_TEST_ACTIVITY_IDS.has(a.id));
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
          return filtered;
        }
      }
    } catch {}
    return [];
  }

  function getResolvedSetsMap() {
    if (!isGarminEnabledForCurrentUser()) return {};
    try {
      return JSON.parse(localStorage.getItem(getScopedGarminKey(RESOLVED_SETS_KEY)) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveResolvedSetsMap(map) {
    if (!isGarminEnabledForCurrentUser()) return;
    try {
      localStorage.setItem(getScopedGarminKey(RESOLVED_SETS_KEY), JSON.stringify(map));
    } catch {}
  }

  // ─── GÖREV 3: SAATTEN GELEN VERİYİ OLDUĞU GİBİ ALMA! ───
  function analyzeActivityGroups(activity) {
    const resolvedMap = getResolvedSetsMap()[activity.id] || {};
    const manifest = findManifestForActivity(activity);
    const plannedQueue = manifest && Array.isArray(manifest.plannedExercises)
      ? manifest.plannedExercises.map(p => ({ ...p }))
      : [];

    const rounds = Array.isArray(activity.rounds) ? activity.rounds : [];
    const activeSets = [];
    let lastRest = null;

    rounds.forEach((r, idx) => {
      if (r.setType === 'rest') {
        lastRest = r;
      } else if (r.setType === 'active' || r.exerciseCategory || r.repetitions || r.weight) {
        const durSec = Number(r.duration || 30);
        const startMs = r.startTime ? new Date(r.startTime).getTime() : NaN;
        activeSets.push({
          roundIndex: idx,
          startTime: r.startTime || null,
          startTimeMs: Number.isFinite(startMs) ? startMs : null,
          endTimeMs: Number.isFinite(startMs) ? (startMs + Math.round(durSec * 1000)) : null,
          exerciseCategory: r.exerciseCategory || 'total_body',
          exerciseName: r.exerciseName || undefined,
          note: r.note || '',
          repetitions: Number(r.repetitions || 10),
          weight: Number(r.weight || 0),
          duration: durSec,
          heartrate: Number(r.heartrate || activity.summary?.heartrate || 120),
          heartrateMax: Number(r.heartrateMax || activity.summary?.heartrateMax || 145),
          restDuration: lastRest ? Number(lastRest.duration || 60) : 60,
          hrRecovery: lastRest && lastRest.heartrateRecovery !== undefined ? Number(lastRest.heartrateRecovery) : null
        });
      }
    });

    // Bağımsız Garmin Kürek / Yürüyüş / Koşu aktivitesi ise doğrudan kütüphanemizdeki orijinal hareketle eşleştir
    const cardioSpec = resolveStandaloneCardioSpec(activity);
    if (cardioSpec && (activeSets.length === 0 || !activeSets.some(s => Number(s.weight || 0) > 0 || /\[id:[a-z0-9_]+\]/i.test(String(s.note || ''))))) {
      activeSets.length = 0;
      const durSec = Number(activity.summary?.duration || activity.summary?.durationSets || activity.summary?.durationTotal || 600);
      activeSets.push({
        roundIndex: 0,
        exerciseCategory: cardioSpec.fitCat,
        exerciseName: cardioSpec.fitNm,
        note: `[id:${cardioSpec.cardioExId}]`,
        repetitions: Math.max(1, Math.round(durSec / 60)), // dakika karşılığı
        weight: 0,
        duration: durSec,
        heartrate: Number(activity.summary?.heartrate || 120),
        heartrateMax: Number(activity.summary?.heartrateMax || 145),
        restDuration: Math.max(0, Number(activity.summary?.durationTotal || durSec) - durSec),
        hrRecovery: null,
        isCardioSession: true
      });
    } else if (activeSets.length === 0) {
      if (plannedQueue.length > 0) {
        // Özet aktivite döndüyse (henüz alt set kırılımı gelmediyse) o günün planlı hareketleriyle eşleştir
        let rIdx = 0;
        plannedQueue.forEach(pStep => {
          const sCount = Math.max(1, Number(pStep.plannedSets || 3));
          for (let i = 0; i < sCount; i++) {
            activeSets.push({
              roundIndex: rIdx++,
              exerciseCategory: pStep.fitCategory || 'total_body',
              exerciseName: pStep.fitName || undefined,
              note: pStep.fitNote || `[id:${pStep.originalId}]`,
              repetitions: Number(pStep.plannedReps || 10),
              weight: Number(pStep.plannedWeight || 0),
              duration: Math.max(20, Number(pStep.plannedReps || 10) * 3),
              heartrate: Number(activity.summary?.heartrate || 122),
              heartrateMax: Number(activity.summary?.heartrateMax || 148),
              restDuration: 60,
              hrRecovery: null
            });
          }
        });
      }
    }

    const rawGroups = [];
    const hasExplicitNoteTags = activeSets.some(s => /\[id:[a-z0-9_]+\]/i.test(String(s.note || '')));
    const isCardioOnly = activeSets.length === 1 && Boolean(activeSets[0]?.isCardioSession);

    if (plannedQueue.length > 0 && activeSets.length > 0 && !isCardioOnly && !hasExplicitNoteTags) {
      // Kullanıcı aynı gün uygulamada antrenmanı adım adım kaydettiyse (veya saatten serbest modda nabız kaydı geldiyse),
      // saatin bilek ivmeölçeriyle rastgele uydurduğu (curl, row, bench_press) bölünmeleri yok say ve setleri doğrudan
      // bizim gerçek hareket sıramıza göre grupla!
      const isFromAppLog = Boolean(manifest && manifest.fromAppHistoryLogId);
      const totalPlannedSets = Math.max(1, plannedQueue.reduce((sum, p) => sum + Math.max(1, Number(p.plannedSets || 3)), 0));
      let cursor = 0;
      const usedWatchRoundIndices = new Set();
      let lastMatchedWatchRoundIndex = -1;

      plannedQueue.forEach((pStep, pIdx) => {
        const targetCount = Math.max(1, Number(pStep.plannedSets || 3));
        let sliceCount = targetCount;
        if (isFromAppLog) {
          if (pIdx === plannedQueue.length - 1) {
            sliceCount = Math.max(1, activeSets.length - cursor);
          } else {
            sliceCount = Math.max(1, Math.round((targetCount / totalPlannedSets) * activeSets.length));
          }
        }
        let watchSlice = activeSets.slice(cursor, cursor + sliceCount);
        cursor += sliceCount;
        if (watchSlice.length === 0) {
          watchSlice = [activeSets[activeSets.length - 1]];
        }

        const loggedSets = Array.isArray(pStep.loggedSetsArray) && pStep.loggedSetsArray.length > 0
          ? pStep.loggedSetsArray
          : null;

        // Hibrit Saat/Dakika + Toplu İşaretleme Korumalı (Bulk-Tap Guard) Eşleştirme:
        // 1) Setin completedAt zaman damgası varsa ve komşu setle arasında >=15 sn fark varsa (toplu tık-tık-tık değilse),
        //    saatteki ±35 sn penceresine düşen ve kronolojik sırayı bozmayan en yakın aktif seti bul.
        // 2) Toplu işaretlendiyse (<15 sn) veya saat damgası yoksa doğrudan sıradaki watchSlice setini kullan.
        const mergedSets = loggedSets
          ? loggedSets.map((ls, sIdx) => {
              let ws = watchSlice[Math.min(sIdx, watchSlice.length - 1)] || watchSlice[0];
              let matchedBy = 'sequence';
              const tapMs = Number(ls && ls.completedAt ? ls.completedAt : 0);
              if (tapMs > 0) {
                const prevTapMs = sIdx > 0 ? Number(loggedSets[sIdx - 1]?.completedAt || 0) : 0;
                const nextTapMs = sIdx < loggedSets.length - 1 ? Number(loggedSets[sIdx + 1]?.completedAt || 0) : 0;
                const isBulkTapped = (prevTapMs > 0 && Math.abs(tapMs - prevTapMs) < 15000) ||
                                     (nextTapMs > 0 && Math.abs(nextTapMs - tapMs) < 15000);
                if (!isBulkTapped) {
                  let bestCandidate = null;
                  let bestDeltaMs = Infinity;
                  for (const cand of activeSets) {
                    if (!cand.startTimeMs || usedWatchRoundIndices.has(cand.roundIndex) || cand.roundIndex <= lastMatchedWatchRoundIndex) continue;
                    const refEndMs = cand.endTimeMs || (cand.startTimeMs + 30000);
                    const delta = tapMs >= cand.startTimeMs && tapMs <= refEndMs
                      ? 0
                      : Math.min(Math.abs(tapMs - refEndMs), Math.abs(tapMs - cand.startTimeMs));
                    if (delta <= 35000 && delta < bestDeltaMs) {
                      bestDeltaMs = delta;
                      bestCandidate = cand;
                    }
                  }
                  if (bestCandidate) {
                    ws = bestCandidate;
                    usedWatchRoundIndices.add(bestCandidate.roundIndex);
                    lastMatchedWatchRoundIndex = bestCandidate.roundIndex;
                    matchedBy = 'timestamp';
                  }
                }
              }
              return {
                roundIndex: ws.roundIndex,
                startTime: ws.startTime || null,
                completedAt: tapMs > 0 ? tapMs : null,
                matchedBy,
                exerciseCategory: pStep.fitCategory || ws.exerciseCategory,
                exerciseName: pStep.fitName || ws.exerciseName,
                note: pStep.fitNote || `[id:${pStep.originalId}]`,
                repetitions: parseSingleRepCount(ls.reps, pStep.plannedReps || 10),
                weight: Number(ls.weight ?? pStep.plannedWeight ?? 0),
                duration: Number(ws.duration || 30),
                heartrate: Number(ws.heartrate || activity.summary?.heartrate || 120),
                heartrateMax: Number(ws.heartrateMax || activity.summary?.heartrateMax || 145),
                restDuration: Number(ws.restDuration || 60),
                hrRecovery: ws.hrRecovery !== undefined ? ws.hrRecovery : null
              };
            })
          : watchSlice.map(ws => ({
              ...ws,
              repetitions: Number(ws.repetitions || pStep.plannedReps || 10),
              weight: Number(ws.weight || pStep.plannedWeight || 0)
            }));

        rawGroups.push({
          groupKey: `planned:${pIdx}:${pStep.originalId}`,
          isKnown: true,
          forcedPlannedStep: pStep,
          rawCategory: pStep.fitCategory || 'total_body',
          rawName: pStep.fitName || undefined,
          rawNote: pStep.fitNote || `[id:${pStep.originalId}]`,
          weight: Number(pStep.plannedWeight || mergedSets[0]?.weight || 0),
          sets: mergedSets
        });
      });

      // Uygulama kaydı değilse ve planlanan setlerden sonra saatte fazladan set açıldıysa onları plan dışı olarak ekle
      if (!isFromAppLog && cursor < activeSets.length) {
        const extraSets = activeSets.slice(cursor);
        for (const s of extraSets) {
          const isKnown = Boolean(s.exerciseName);
          const groupKey = isKnown
            ? `known:${s.exerciseCategory}:${s.exerciseName}`
            : `undef:${s.exerciseCategory}:${s.weight}:${s.note || ''}`;
          const prev = rawGroups[rawGroups.length - 1];
          if (prev && !prev.forcedPlannedStep && prev.groupKey === groupKey) {
            prev.sets.push(s);
          } else {
            rawGroups.push({
              groupKey,
              isKnown,
              rawCategory: s.exerciseCategory,
              rawName: s.exerciseName,
              rawNote: s.note || '',
              weight: s.weight,
              sets: [s]
            });
          }
        }
      }
    } else {
      for (const s of activeSets) {
        const isKnown = Boolean(s.exerciseName);
        const groupKey = isKnown
          ? `known:${s.exerciseCategory}:${s.exerciseName}`
          : `undef:${s.exerciseCategory}:${s.weight}:${s.note || ''}`;
        const prev = rawGroups[rawGroups.length - 1];
        if (prev && prev.groupKey === groupKey) {
          prev.sets.push(s);
        } else {
          rawGroups.push({
            groupKey,
            isKnown,
            rawCategory: s.exerciseCategory,
            rawName: s.exerciseName,
            rawNote: s.note || '',
            weight: s.weight,
            sets: [s]
          });
        }
      }
    }

    return rawGroups.map((rg, idx) => {
      const groupId = `${activity.id}_g${idx}`;
      const resolvedExId = resolvedMap[groupId] || null;
      const plannedStep = rg.forcedPlannedStep || (idx < plannedQueue.length ? plannedQueue[idx] : null);

      const noteIdMatch = String(rg.rawNote || '').match(/\[id:([a-z0-9_]+)\]/i);
      const noteExId = noteIdMatch ? noteIdMatch[1] : null;

      let matchedEx = null;
      let identitySource = 'unplanned_extra';

      if (resolvedExId && typeof EXERCISES_DB !== 'undefined') {
        matchedEx = EXERCISES_DB.find(x => x.id === resolvedExId) || null;
        identitySource = 'user_resolved';
      } else if (noteExId && typeof EXERCISES_DB !== 'undefined') {
        matchedEx = EXERCISES_DB.find(x => x.id === noteExId) || null;
        identitySource = 'original_note_tag';
      } else if (plannedStep && typeof EXERCISES_DB !== 'undefined') {
        matchedEx = EXERCISES_DB.find(x => x.id === plannedStep.originalId || x.name === plannedStep.originalName) || null;
        identitySource = manifest && manifest.fromAppHistoryLogId ? 'app_logged_workout' : 'original_manifest';
      } else if (rg.isKnown && typeof window.findExercisesByGarminFit === 'function') {
        const matches = window.findExercisesByGarminFit(rg.rawCategory, rg.rawName);
        matchedEx = matches[0] || null;
        if (matchedEx) identitySource = 'library_fit_catalog';
      }

      const setsCount = rg.sets.length;
      const avgHr = Math.round(rg.sets.reduce((sum, x) => sum + (x.heartrate || 120), 0) / setsCount);
      const maxHr = Math.max(...rg.sets.map(x => x.heartrateMax || x.heartrate || 135));
      const hrrValues = rg.sets.map(x => x.hrRecovery).filter(v => v !== null && v > 0);
      const avgHrr = hrrValues.length ? Math.round(hrrValues.reduce((a, b) => a + b, 0) / hrrValues.length) : null;
      const totalTutSec = Math.round(rg.sets.reduce((sum, x) => sum + (x.duration || 0), 0));

      return {
        groupId,
        groupKey: rg.groupKey,
        isKnown: rg.isKnown,
        isResolved: Boolean(matchedEx || plannedStep),
        identitySource,
        matchedEx,
        originalId: matchedEx ? matchedEx.id : (plannedStep ? plannedStep.originalId : null),
        originalName: (plannedStep && plannedStep.originalName) || (matchedEx ? matchedEx.name : null),
        primaryMuscles: matchedEx ? matchedEx.primaryMuscles : (plannedStep ? plannedStep.primaryMuscles : []),
        secondaryMuscles: matchedEx ? matchedEx.secondaryMuscles : (plannedStep ? plannedStep.secondaryMuscles : []),
        rawCategory: rg.rawCategory,
        rawName: rg.rawName,
        weight: rg.weight,
        sets: rg.sets,
        healthTelemetry: {
          avgHeartrate: avgHr,
          maxHeartrate: maxHr,
          heartrateRecovery: avgHrr,
          timeUnderTensionSec: totalTutSec,
          distanceMeters: activity.summary?.distance ? Math.round(Number(activity.summary.distance)) : null,
          paceSecPerKm: activity.summary?.pace ? Math.round(Number(activity.summary.pace)) : null,
          cadenceSpm: activity.summary?.cadence ? Math.round(Number(activity.summary.cadence)) : null,
          cadenceMaxSpm: activity.summary?.cadenceMax ? Math.round(Number(activity.summary.cadenceMax)) : null,
          powerWatts: activity.summary?.power ? Math.round(Number(activity.summary.power)) : null,
          powerMaxWatts: activity.summary?.powerMax ? Math.round(Number(activity.summary.powerMax)) : null,
          respirationRate: activity.summary?.respirationRate ? Math.round(Number(activity.summary.respirationRate)) : null,
          ascentMeters: activity.summary?.ascent ? Math.round(Number(activity.summary.ascent)) : null,
          caloriesShare: activity.summary?.calories
            ? Math.max(1, Math.round((activity.summary.calories * setsCount) / Math.max(1, activity.summary.exerciseSetCount || setsCount)))
            : null
        }
      };
    });
  }

  function toLocalIsoDateString(isoStr) {
    if (!isoStr) return formatLocalIsoDate(new Date());
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(isoStr).trim())) return String(isoStr).trim();
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr).slice(0, 10);
    return formatLocalIsoDate(d);
  }

  const syncedActivityTitleUpdates = new Set();

  function resolveWatchActivityIdFromLog(logObj) {
    if (!logObj || typeof logObj !== 'object') return '';
    if (logObj.garminActivityId) return String(logObj.garminActivityId).trim();
    const lid = String(logObj.id || '').trim();
    return lid.startsWith('garmin_') ? lid.slice('garmin_'.length) : '';
  }

  function buildEditedWatchTitleIndex(logsArg, uidOverride) {
    const map = new Map();
    const uid = uidOverride || getActiveUidSafe();
    let sourceLogs = Array.isArray(logsArg) ? logsArg : null;
    if (!sourceLogs && uid) {
      try {
        const raw = localStorage.getItem(`celik_kodu_history_${uid}`) || '[]';
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) sourceLogs = parsed;
      } catch {}
    }
    if (!Array.isArray(sourceLogs)) return map;
    sourceLogs.forEach(l => {
      const actId = resolveWatchActivityIdFromLog(l);
      const edAt = Number((l && l.userEditedAt) || 0);
      const title = String((l && (l.program || l.title)) || '').trim();
      if (!actId || edAt <= 0 || !title) return;
      const prev = map.get(actId);
      if (!prev || edAt >= prev.userEditedAt) {
        map.set(actId, { title, userEditedAt: edAt, notes: String((l && l.notes) || '').trim() });
      }
    });
    return map;
  }

  function syncWatchTitlesFromWorkoutLogs(logsArg, uidOverride) {
    const uid = uidOverride || getActiveUidSafe();
    if (!uid) return false;
    const editedMap = buildEditedWatchTitleIndex(logsArg, uid);
    if (editedMap.size === 0) return false;
    try {
      const telemetryKey = getScopedGarminKey(TELEMETRY_STORAGE_KEY, uid);
      const raw = localStorage.getItem(telemetryKey);
      if (!raw) return false;
      const acts = JSON.parse(raw);
      if (!Array.isArray(acts) || acts.length === 0) return false;
      let changed = false;
      acts.forEach(act => {
        if (!act || !act.id) return;
        const match = editedMap.get(String(act.id));
        if (!match) return;
        const actEd = Number(act.userEditedAt || 0);
        if (match.userEditedAt >= actEd && (act.title !== match.title || actEd !== match.userEditedAt)) {
          act.title = match.title;
          act.userEditedAt = match.userEditedAt;
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(telemetryKey, JSON.stringify(acts));
      }
      return changed;
    } catch {
      return false;
    }
  }

  async function propagateWorkoutLogTitleToWatch(logObj) {
    const uid = getActiveUidSafe();
    const actId = resolveWatchActivityIdFromLog(logObj);
    const newTitle = String((logObj && (logObj.program || logObj.title)) || '').trim();
    const editedAt = Number((logObj && logObj.userEditedAt) || Date.now());
    if (!uid || !actId || !newTitle) return false;

    const updatedLocal = syncWatchTitlesFromWorkoutLogs([{ ...logObj, userEditedAt: editedAt }], uid);
    if (!updatedLocal) {
      try {
        const telemetryKey = getScopedGarminKey(TELEMETRY_STORAGE_KEY, uid);
        const acts = JSON.parse(localStorage.getItem(telemetryKey) || '[]');
        if (Array.isArray(acts)) {
          let touched = false;
          acts.forEach(act => {
            if (act && String(act.id) === actId) {
              act.title = newTitle;
              act.userEditedAt = editedAt;
              touched = true;
            }
          });
          if (touched) localStorage.setItem(telemetryKey, JSON.stringify(acts));
        }
      } catch {}
    }

    renderHistoryGarminSyncPanel();
    renderAnalyticsGarminCoachPanel();

    if (typeof window !== 'undefined' && typeof window.scheduleUserStateCloudSync === 'function') {
      try { window.scheduleUserStateCloudSync(uid); } catch {}
    }

    if (isGarminEnabledForCurrentUser(uid) && hasGarminCredentialsConfigured(uid)) {
      try {
        const payload = { id: actId, title: newTitle };
        if (logObj && typeof logObj.notes === 'string') payload.notes = logObj.notes;
        await fetchGarminBridge('/api/tredict/activity-update', {
          uid,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch {}
    }
    return true;
  }

  function handoffCompletedActivitiesToTabChiefs() {
    if (!isGarminEnabledForCurrentUser() || typeof EXERCISES_DB === 'undefined') return;
    const activities = getStoredActivities();
    try {
      const uid = getActiveUidSafe();
      if (!uid) return;
      let deletedLogIds = new Set();
      try {
        const delRaw = JSON.parse(localStorage.getItem(`celik_kodu_deleted_logs_${uid}`) || '[]');
        if (Array.isArray(delRaw)) delRaw.forEach(x => { if (x) deletedLogIds.add(String(x)); });
      } catch {}
      const historyKey = `celik_kodu_history_${uid}`;
      const rawLogs = JSON.parse(localStorage.getItem(historyKey) || '[]');
      let logs = Array.isArray(rawLogs)
        ? rawLogs.filter(l => !l || !LEGACY_TEST_ACTIVITY_IDS.has(l.garminActivityId))
        : [];
      let changed = logs.length !== rawLogs.length;
      let watchTitlesSynced = false;

      // Eski hatalı sayısal ex.sets formatını diziye dönüştür (Geçmiş ekranının çökmesini önler)
      logs.forEach(l => {
        if (!l || !Array.isArray(l.exercises)) return;
        l.exercises.forEach(ex => {
          if (ex && typeof ex.sets === 'number') {
            const cnt = Math.max(1, ex.sets);
            const rVal = Number(ex.reps || 10);
            const wVal = Number(ex.weight || 0);
            ex.sets = Array.from({ length: cnt }, (_, idx) => ({
              setNo: idx + 1,
              weight: wVal,
              reps: rVal,
              completed: true,
              volume: wVal * rVal
            }));
            changed = true;
          }
        });
      });

      activities.forEach(act => {
        if (act && (deletedLogIds.has(String(act.id)) || deletedLogIds.has(`garmin_${act.id}`))) return;
        const groups = analyzeActivityGroups(act);
        const resolvedGroups = groups.filter(g => g.isResolved && (g.matchedEx || g.originalName));
        if (!resolvedGroups.length) return;

        const logDate = toLocalIsoDateString(act.date);
        const durSec = Number(act.summary?.durationTotal || act.summary?.duration || 90);
        const durMin = Math.max(1, Math.round(durSec / 60));
        const durFmt = durSec < 3600
          ? `${String(Math.floor(durSec / 60)).padStart(2, '0')}:${String(Math.round(durSec % 60)).padStart(2, '0')}`
          : `${Math.floor(durSec / 3600)}s ${Math.floor((durSec % 3600) / 60)}dk`;

        const healthSummaryObj = {
          heartrateAvg: act.summary?.heartrate || null,
          heartrateMax: act.summary?.heartrateMax || null,
          calories: act.summary?.calories || null,
          distanceMeters: Number(act.summary?.distance || 0) > 0 ? Math.round(Number(act.summary.distance)) : null,
          paceSecPerKm: Number(act.summary?.pace || 0) > 0 ? Math.round(Number(act.summary.pace)) : null,
          cadence: Number(act.summary?.cadence || 0) > 0 ? Math.round(Number(act.summary.cadence)) : null,
          durationSetsSec: act.summary?.durationSets || null,
          durationRestSec: act.summary?.durationRest || null
        };

        // 1) Kullanıcı aynı gün uygulama içinden kuvvet antrenmanını adım adım kaydettiyse:
        //    Mükerrer kuvvet kaydı açma (saatin bağımsız kardiyo/yürüyüş seansları kendi bağımsız kaydını açar);
        //    kuvvet saatinin nabız/kalori/TUT sağlık verisini doğrudan uygulama kaydının içine birleştir!
        const isCardioAct = isStandaloneCardioActivity(act);
        const userAppLog = isCardioAct
          ? logs.find(l =>
              l &&
              !String(l.id || '').startsWith('garmin_') &&
              l.sourceChief !== 'garmin-tredict-guard' &&
              l.garminActivityId === act.id
            )
          : logs.find(l =>
              l &&
              !String(l.id || '').startsWith('garmin_') &&
              l.sourceChief !== 'garmin-tredict-guard' &&
              (l.garminActivityId === act.id || (!isCardioLogRecord(l) && toLocalIsoDateString(l.date) === logDate))
            );

        if (userAppLog) {
          const beforeLen = logs.length;
          logs = logs.filter(l => !(
            l &&
            (
              l.id === 'garmin_' + act.id ||
              (!isCardioAct && !isCardioLogRecord(l) && String(l.id || '').startsWith('garmin_') && toLocalIsoDateString(l.date) === logDate)
            )
          ));
          if (logs.length !== beforeLen) changed = true;

          if (userAppLog.garminActivityId !== act.id) {
            userAppLog.garminActivityId = act.id;
            changed = true;
          }
          if (JSON.stringify(userAppLog.healthSummary) !== JSON.stringify(healthSummaryObj)) {
            userAppLog.healthSummary = healthSummaryObj;
            changed = true;
          }
          if (Array.isArray(userAppLog.exercises)) {
            userAppLog.exercises.forEach((ex, exIdx) => {
              const matchGrp = resolvedGroups[exIdx] || resolvedGroups.find(g => g.originalId === ex.id || g.originalName === ex.name);
              if (matchGrp && matchGrp.healthTelemetry) {
                if (JSON.stringify(ex.healthTelemetry) !== JSON.stringify(matchGrp.healthTelemetry)) {
                  ex.healthTelemetry = matchGrp.healthTelemetry;
                  changed = true;
                }
                if (Array.isArray(ex.sets) && Array.isArray(matchGrp.sets)) {
                  ex.sets.forEach((stObj, sIdx) => {
                    const mSet = matchGrp.sets[Math.min(sIdx, matchGrp.sets.length - 1)];
                    if (mSet && stObj && typeof stObj === 'object') {
                      if (stObj.heartrate !== mSet.heartrate || stObj.heartrateMax !== mSet.heartrateMax) {
                        stObj.heartrate = mSet.heartrate;
                        stObj.heartrateMax = mSet.heartrateMax;
                        stObj.durationSec = Math.round(Number(mSet.duration || 0));
                        stObj.watchStartTime = mSet.startTime || null;
                        stObj.matchedBy = mSet.matchedBy || 'sequence';
                        changed = true;
                      }
                    }
                  });
                }
              }
            });
          }

          // Saatte "Güç" olarak açılan serbest antrenmanın adını ve hareket özetini Tredict'e de geri işle
          const realTitle = userAppLog.program || userAppLog.title || '';
          if (realTitle && (!act.title || act.title === 'Güç' || act.title === 'Garmin Antrenmanı')) {
            act.title = realTitle;
            if (!syncedActivityTitleUpdates.has(act.id)) {
              syncedActivityTitleUpdates.add(act.id);
              const summaryLines = resolvedGroups.map(g => {
                const nm = g.originalName || (g.matchedEx ? g.matchedEx.name : 'Hareket');
                const avgR = Math.round(g.sets.reduce((s, x) => s + (x.repetitions || 10), 0) / g.sets.length);
                return `• ${nm}: ${g.sets.length}×${avgR}${g.weight ? ` @ ${g.weight}kg` : ''} (❤️ ${g.healthTelemetry.avgHeartrate} bpm)`;
              }).join('\n');
              fetchGarminBridge('/api/tredict/activity-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: act.id,
                  title: realTitle,
                  notes: `Çelik Kodu Uygulama Eşitlemesi:\n${summaryLines}`
                })
              }).catch(() => {});
            }
          }
          return;
        }

        // 2) Uygulamada o gün kayıt yoksa (yalnızca saat kullanıldıysa) geçmiş kaydı oluştur
        const calcVol = resolvedGroups.reduce((sum, g) => {
          const repsSum = g.sets.reduce((s, x) => s + Number(x.repetitions || 0), 0);
          return sum + repsSum * Number(g.weight || 0);
        }, 0);
        const totalVolKg = Math.round((Number(act.summary?.volume) || calcVol || 0) * 10) / 10;
        const totalSetsCount = Number(act.summary?.exerciseSetCount) || resolvedGroups.reduce((s, g) => s + g.sets.length, 0);
        const totalRepsCount = resolvedGroups.reduce((sum, g) => sum + g.sets.reduce((s, x) => s + Number(x.repetitions || 0), 0), 0);

        const actTs = act.date ? new Date(act.date).getTime() : Date.now();
        const actTitleLow = String(act.title || '').toLowerCase().trim();
        let existingLog = logs.find(l => l && (l.garminActivityId === act.id || l.id === 'garmin_' + act.id));
        if (!existingLog && isCardioAct) {
          existingLog = logs.find(l => {
            if (!l || toLocalIsoDateString(l.date) !== logDate || !isCardioLogRecord(l)) return false;
            const logTitleLow = String(l.program || l.title || '').toLowerCase().trim();
            const tsClose = Number.isFinite(Number(l.timestamp)) && Number.isFinite(actTs) && Math.abs(Number(l.timestamp) - actTs) <= 180000;
            const durClose = Math.abs(Number(l.durationSecs || 0) - durSec) <= 45;
            return tsClose || (durClose && (!actTitleLow || !logTitleLow || actTitleLow === logTitleLow));
          });
        }
        if (!existingLog) {
          existingLog = {
            id: 'garmin_' + act.id,
            garminActivityId: act.id,
            sourceChief: 'garmin-tredict-guard',
            isCardioActivity: isCardioAct,
            date: logDate,
            timestamp: Number.isFinite(actTs) ? actTs : Date.now(),
            program: act.title || (isCardioAct ? 'Garmin Kardiyo Seansı' : 'Garmin FR945 Kuvvet Seansı'),
            title: act.title || (isCardioAct ? 'Garmin Kardiyo Seansı' : 'Garmin FR945 Kuvvet Seansı'),
            duration: durMin,
            durationFormatted: durFmt,
            durationSecs: durSec,
            totalVolumeKg: totalVolKg,
            totalSetsCompleted: totalSetsCount,
            totalRepsCompleted: totalRepsCount,
            healthSummary: healthSummaryObj,
            exercises: []
          };
          logs.unshift(existingLog);
          changed = true;
        } else {
          if (isCardioAct && !existingLog.isCardioActivity) {
            existingLog.isCardioActivity = true;
            changed = true;
          }
          if (existingLog.userEditedAt) {
            const editedTitle = String(existingLog.program || existingLog.title || '').trim();
            const editedTs = Number(existingLog.userEditedAt || 0);
            if (editedTitle && editedTs >= Number(act.userEditedAt || 0) && (act.title !== editedTitle || Number(act.userEditedAt || 0) !== editedTs)) {
              act.title = editedTitle;
              act.userEditedAt = editedTs;
              watchTitlesSynced = true;
            }
            if (!existingLog.healthSummary && healthSummaryObj) {
              existingLog.healthSummary = healthSummaryObj;
              changed = true;
            }
            return;
          }
          if (existingLog.date !== logDate) {
            existingLog.date = logDate;
            changed = true;
          }
          if (!existingLog.program && act.title) {
            existingLog.program = act.title;
            changed = true;
          }
          if (!existingLog.totalVolumeKg && totalVolKg > 0) {
            existingLog.totalVolumeKg = totalVolKg;
            changed = true;
          }
          if (!existingLog.totalSetsCompleted && totalSetsCount > 0) {
            existingLog.totalSetsCompleted = totalSetsCount;
            changed = true;
          }
          existingLog.healthSummary = healthSummaryObj;
        }

        resolvedGroups.forEach(grp => {
          const avgReps = Math.round(grp.sets.reduce((s, x) => s + (x.repetitions || 10), 0) / grp.sets.length);
          const wVal = Number(grp.weight || 0);
          const setsArray = grp.sets.map((s, sIdx) => {
            const rVal = Number(s.repetitions || avgReps || 10);
            const swVal = Number(s.weight ?? wVal);
            return {
              setNo: sIdx + 1,
              weight: swVal,
              reps: rVal,
              completed: true,
              volume: swVal * rVal
            };
          });
          const exId = grp.matchedEx ? grp.matchedEx.id : (grp.originalId || 'custom');
          const exName = grp.originalName || (grp.matchedEx ? grp.matchedEx.name : 'Hareket');
          const existingEx = existingLog.exercises.find(e => e.groupId === grp.groupId);
          const exEntry = {
            groupId: grp.groupId,
            id: exId,
            name: exName,
            primaryMuscles: grp.primaryMuscles || [],
            secondaryMuscles: grp.secondaryMuscles || [],
            sets: setsArray,
            reps: avgReps,
            weight: wVal,
            completedSets: setsArray.length,
            completedSetsCount: setsArray.length,
            maxWeight: wVal,
            exerciseVolume: setsArray.reduce((sum, st) => sum + Number(st.volume || 0), 0),
            healthTelemetry: grp.healthTelemetry
          };
          if (!existingEx) {
            existingLog.exercises.push(exEntry);
            changed = true;
          } else if (existingEx.id !== exEntry.id || existingEx.name !== exEntry.name || !Array.isArray(existingEx.sets)) {
            Object.assign(existingEx, exEntry);
            changed = true;
          }
        });
      });

      if (changed) {
        if (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.sanitizeWorkoutLogsList === 'function') {
          logs = window.CelikBridgeCustoms.sanitizeWorkoutLogsList(logs);
        }
        if (typeof window.sortWorkoutLogsDesc === 'function') {
          window.sortWorkoutLogsDesc(logs);
        } else {
          logs.sort((a, b) => {
            const da = String((a && a.date) || '').slice(0, 10);
            const db = String((b && b.date) || '').slice(0, 10);
            if (da !== db) return db.localeCompare(da);
            return (Number(b && b.timestamp) || 0) - (Number(a && a.timestamp) || 0);
          });
        }
        localStorage.setItem(historyKey, JSON.stringify(logs));
        if (typeof window.syncWorkoutLogsToCloud === 'function' && window._initialWorkoutLogsCloudSyncDone === true) {
          try { window.syncWorkoutLogsToCloud(logs, uid); } catch {}
        }
        if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
        if (typeof renderHistory === 'function') renderHistory();
        if (typeof renderAiHybridHeroBanner === 'function') renderAiHybridHeroBanner();
        if (typeof window.refreshTopFitnessCardioScoreBars === 'function') window.refreshTopFitnessCardioScoreBars();
      }
      if (watchTitlesSynced) {
        try {
          const telemetryKey = getScopedGarminKey(TELEMETRY_STORAGE_KEY, uid);
          localStorage.setItem(telemetryKey, JSON.stringify(activities));
        } catch {}
        renderHistoryGarminSyncPanel();
        if (typeof window !== 'undefined' && typeof window.scheduleUserStateCloudSync === 'function') {
          try { window.scheduleUserStateCloudSync(uid); } catch {}
        }
      }
    } catch {}
  }

  function getSmartSuggestionsForGroup(group) {
    if (typeof EXERCISES_DB === 'undefined') return [];
    const cat = String(group.rawCategory || '').toLowerCase();
    const hasWeight = Number(group.weight || 0) > 0;
    const candidates = EXERCISES_DB.filter(ex => {
      if (hasWeight && ex.equipment === 'bodyweight') return false;
      return String(ex.fitCategory || '').toLowerCase() === cat;
    });
    const pool = candidates.length >= 3 ? candidates : EXERCISES_DB.filter(ex => !hasWeight || ex.equipment !== 'bodyweight');
    return pool.slice(0, 3);
  }

  function computePhysiologicalMetrics() {
    const activities = getStoredActivities();
    let totalActiveSets = 0;
    let totalTutSec = 0;
    let totalRestSec = 0;
    let hrSum = 0;
    let hrCount = 0;
    let peakHr = 0;
    let hrrSum = 0;
    let hrrCount = 0;
    let unresolvedGroups = 0;

    activities.forEach(act => {
      const groups = analyzeActivityGroups(act);
      groups.forEach(g => {
        if (!g.isResolved) unresolvedGroups++;
        g.sets.forEach(s => {
          totalActiveSets++;
          totalTutSec += Number(s.duration || 0);
          totalRestSec += Number(s.restDuration || 0);
          if (s.heartrate > 0) {
            hrSum += s.heartrate;
            hrCount++;
          }
          if (s.heartrateMax > peakHr) peakHr = s.heartrateMax;
          if (s.hrRecovery !== null && s.hrRecovery > 0) {
            hrrSum += s.hrRecovery;
            hrrCount++;
          }
        });
      });
    });

    const avgHr = hrCount ? Math.round(hrSum / hrCount) : 122;
    const avgHrr = hrrCount ? Math.round(hrrSum / hrrCount) : 20;
    const avgTut = totalActiveSets ? Math.round(totalTutSec / totalActiveSets) : 38;
    const workRestRatio = totalRestSec > 0 ? (totalTutSec / totalRestSec).toFixed(2) : '0.65';

    let restAdvice = '⚖️ Dinlenme süresi ideal (60 sn koru)';
    let restDeltaSec = 0;
    if (avgHrr < 16) {
      restAdvice = '🛡️ Set arası nabız düşüşü yavaş (+15 sn dinlenme eklendi)';
      restDeltaSec = 15;
    } else if (avgHrr >= 24) {
      restAdvice = '🔥 Kardiyak toparlanma çok hızlı (-10 sn yoğunluk artışı uygun)';
      restDeltaSec = -10;
    }

    let loadAdvice = '📈 Nabız maliyeti dengeli: Hedef tekrar tamamlandıysa +2.5 kg artış uygun';
    if (peakHr >= 168) {
      loadAdvice = '⚠️ Zirve nabız yüksek (' + peakHr + ' bpm): Ağırlığı sabit tut, form ve nefese odaklan';
    } else if (avgHr <= 126) {
      loadAdvice = '🚀 Düşük kardiyak maliyet (' + avgHr + ' bpm): Ağırlık veya +2 tekrar artışı önerilir';
    }

    return {
      activityCount: activities.length,
      totalActiveSets,
      avgHr,
      peakHr: peakHr || 156,
      avgHrr,
      avgTut,
      workRestRatio,
      restAdvice,
      restDeltaSec,
      loadAdvice,
      unresolvedGroups
    };
  }

  // ─── GÖREV 2: TEK GÜN VEYA HAFTALIK TAKVİM PLANINI GARMIN FIT ŞEMASINA DÖNÜŞTÜR ───
  function buildStructuredStepsForExerciseList(exercisesList) {
    const steps = [];
    (exercisesList || []).forEach(item => {
      const exObj = typeof EXERCISES_DB !== 'undefined'
        ? EXERCISES_DB.find(x => x.id === (item.id || item.exerciseId) || x.name === item.name)
        : null;
      const audited = auditExerciseWithLibraryGuard(exObj || item.id || item.name);

      const setsCount = Math.max(1, Number(item.sets || item.targetSets || 3));
      const rawRepsStr = String(item.reps || item.targetReps || '10');
      const repsVal = parseSingleRepCount(rawRepsStr, 10);
      const weightVal = Number(item.weight || item.targetWeight || 12);
      const restSec = Math.max(15, Number(item.rest || item.restSec || 60));
      const isTimeEx = Boolean((exObj && (exObj.isTimeBased || exObj.trackingType === 'time' || /^cond_/.test(exObj.id))) || /dk|sn|sec|min/i.test(rawRepsStr));
      const activeDurationSec = isTimeEx
        ? (/dk|min/i.test(rawRepsStr) ? repsVal * 60 : (repsVal >= 20 ? repsVal : repsVal * 60))
        : Math.max(20, repsVal * 3);

      const workStep = {
        intensityType: 'active',
        durationType: isTimeEx ? 'time' : 'repetitions',
        duration: activeDurationSec,
        exerciseCategory: audited.fitCategory || 'total_body',
        targets: { heartrate: { value: isTimeEx ? 136 : 132 } },
        note: String(audited.fitNote || `${audited.originalName} [id:${audited.originalId}]`).slice(0, 200)
      };
      if (!isTimeEx) {
        workStep.exerciseRepetitions = repsVal;
      }

      // Garmin'de birebir karşılığı varsa exerciseName gönderilir; yoksa İSİMSİZ (undefined) + NOTLU gönderilir
      if (audited.matchType === 'exact_verified' && audited.fitName) {
        workStep.exerciseName = audited.fitName;
      }

      if (weightVal > 0 && (!exObj || exObj.equipment !== 'bodyweight')) {
        workStep.exerciseWeight = weightVal;
      }

      const restStep = {
        intensityType: 'rest',
        durationType: 'time',
        duration: restSec
      };

      steps.push({
        repetitions: setsCount,
        steps: [workStep, restStep]
      });
    });
    return steps;
  }

  function buildStandaloneCardioStructuredWorkout(cItem) {
    const id = String(cItem.id || cItem.exerciseId || '');
    const durMin = cItem.durationMin !== undefined
      ? Math.max(0, Number(cItem.durationMin) || 0)
      : parseSingleRepCount(cItem.targetReps || cItem.reps || '20', 20);
    const distMeters = Math.max(0, Number(cItem.distanceMeters || 0));
    const minHr = cItem.targetHeartrate !== undefined
      ? Math.max(0, Number(cItem.targetHeartrate) || 0)
      : 0;

    let sportType = 'misc';
    let subSportType = 'indoor_rowing';
    let defaultTitle = 'Kapalı Mekanda Kürek Çekme (Garmin fr945)';
    if (id === 'cond_walking' || /walk|yuruyus|yürüyüş/i.test(id + ' ' + (cItem.name || ''))) {
      sportType = 'misc';
      subSportType = 'walking';
      defaultTitle = 'Tempolu Yürüyüş & Doğa Yürüyüşü (Garmin fr945)';
    } else if (id === 'cond_running' || /run|kosu|koşu|treadmill/i.test(id + ' ' + (cItem.name || ''))) {
      sportType = 'running';
      subSportType = 'treadmill';
      defaultTitle = 'Koşu & Koşu Bandı (Garmin fr945)';
    }
    const cleanTitle = String(cItem.name || defaultTitle).slice(0, 120);
    const limitParts = [];
    if (durMin > 0) limitParts.push(`Min. ${durMin} Dk`);
    if (distMeters > 0) limitParts.push(`Min. ${distMeters} m`);
    if (minHr > 0) limitParts.push(`Min. ${minHr} bpm`);
    const limitText = limitParts.length > 0 ? limitParts.join(' • ') : 'Serbest Süre/Limit';
    const metaTag = `[id:${id || 'cond_cardio'}|minDur:${durMin}|minDist:${distMeters}|minHr:${minHr}]`;

    const stepObj = {
      intensityType: 'active',
      durationType: distMeters > 0 ? 'distance' : (durMin > 0 ? 'time' : 'open'),
      note: `${cleanTitle} (${limitText}) ${metaTag}`.slice(0, 200)
    };
    if (distMeters > 0) stepObj.distance = distMeters;
    if (durMin > 0) stepObj.duration = durMin * 60;
    if (minHr > 0) {
      stepObj.targetMode = 'padding';
      stepObj.targetZoneType = 'heartrate';
      stepObj.targets = { heartrate: { value: minHr } };
    }

    return {
      title: cleanTitle,
      trainingType: 'planned',
      sportType,
      subSportType,
      notes: `Çelik Kodu 2. Bağımsız Kardiyo Seansı (${limitText}) [id:${id || 'cond_cardio'}] — Saatte ne kadar süre/mesafe yaparsan birebir o kayıt altına alınır.`,
      steps: [stepObj]
    };
  }

  function buildTredictPlanPayload(workoutTitle, exercisesList, multiDayItems, singleDateStr) {
    let planTrainings = [];
    const fallbackDate = singleDateStr || formatLocalIsoDate(new Date());

    if (Array.isArray(multiDayItems) && multiDayItems.length > 0) {
      multiDayItems.forEach((dItem, idx) => {
        if (!dItem) return;
        const calDate = dItem.calendarDate || fallbackDate;
        const dayNum = Math.max(1, Number(dItem.dayNumber || (idx + 1)));
        const rawExercises = Array.isArray(dItem.exercises) ? dItem.exercises : [];
        const strengthExercises = rawExercises.filter(e => !/^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
        const inlineCardio = rawExercises.filter(e => /^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
        const extraCardio = Array.isArray(dItem.extraCardioSessions) ? dItem.extraCardioSessions : [];
        const allCardio = [...inlineCardio, ...extraCardio];

        if (!dItem.onlyCardioChanged && strengthExercises.length > 0) {
          saveSentWorkoutManifest(dItem.title || workoutTitle, strengthExercises, dItem.dateKey || undefined);
          const steps = buildStructuredStepsForExerciseList(strengthExercises);
          if (steps.length > 0) {
            planTrainings.push({
              day: dayNum,
              calendarDate: calDate,
              structuredWorkout: {
                title: String(dItem.title || workoutTitle || 'Çelik Kodu Güç Seansı').slice(0, 120),
                trainingType: 'planned',
                sportType: 'misc',
                subSportType: 'strength_training',
                notes: 'Orijinal Çelik Kodu hareket kimlikleri korunur; saatten yalnızca sağlık verileri (Nabız, HRR, TUT, Kalori) alınır.',
                steps
              }
            });
          }
        }

        allCardio.forEach(cItem => {
          planTrainings.push({
            day: dayNum,
            calendarDate: calDate,
            structuredWorkout: buildStandaloneCardioStructuredWorkout(cItem)
          });
        });
      });
    } else {
      const rawExercises = Array.isArray(exercisesList) ? exercisesList : [];
      const strengthExercises = rawExercises.filter(e => !/^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
      const inlineCardio = rawExercises.filter(e => /^cond_/.test(String((e && (e.id || e.exerciseId)) || '')));
      if (strengthExercises.length > 0) {
        saveSentWorkoutManifest(workoutTitle, strengthExercises);
        const steps = buildStructuredStepsForExerciseList(strengthExercises);
        if (steps.length > 0) {
          planTrainings.push({
            day: 1,
            calendarDate: fallbackDate,
            structuredWorkout: {
              title: String(workoutTitle || 'Çelik Kodu Güç Seansı').slice(0, 120),
              trainingType: 'planned',
              sportType: 'misc',
              subSportType: 'strength_training',
              notes: 'Orijinal Çelik Kodu hareket kimlikleri korunur; saatten yalnızca sağlık verileri (Nabız, HRR, TUT, Kalori) alınır.',
              steps
            }
          });
        }
      }
      inlineCardio.forEach(cItem => {
        planTrainings.push({
          day: 1,
          calendarDate: fallbackDate,
          structuredWorkout: buildStandaloneCardioStructuredWorkout(cItem)
        });
      });
    }

    return {
      llmDescription: 'Celik Kodu PWA — 7. Sef (garmin-tredict-guard)',
      plan: {
        title: String(workoutTitle || 'Çelik Kodu Takvim Seansı').slice(0, 120),
        description: '7. Şef (garmin-tredict-guard) tarafından Antrenman Takvimine eklenen programdan otomatik üretildi.',
        categories: ['general'],
        targetgroups: ['intermediate'],
        zonetypes: ['heartrate'],
        language: 'en'
      },
      planTrainings
    };
  }

  // ─── OTOMATİK TAKVİM -> GARMIN SENKRONU (SIFIR EKSTRA BUTON, GARMIN KAPALIYSA SIFIR İSTEK) ───
  function extractExercisesFromPlanEntry(planEntry) {
    if (!planEntry || planEntry.rest) return [];
    if (Array.isArray(planEntry.exercises) && planEntry.exercises.length > 0) {
      return hydrateExercisesWithWorkoutScheme(planEntry, planEntry.exercises);
    }
    if (planEntry.customWorkout && Array.isArray(planEntry.customWorkout.exercises) && planEntry.customWorkout.exercises.length > 0) {
      return hydrateExercisesWithWorkoutScheme(planEntry.customWorkout, planEntry.customWorkout.exercises);
    }
    try {
      if (typeof window.getWorkoutDetailsForPlan === 'function') {
        const det = window.getWorkoutDetailsForPlan(planEntry);
        if (det && Array.isArray(det.exercises)) return hydrateExercisesWithWorkoutScheme(det, det.exercises);
      }
    } catch {}
    return [];
  }

  function formatLocalIsoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getIsoDateForWeekday(dayKey, isNextWeek) {
    const now = new Date();
    const currentDay = now.getDay(); // 0=Pazar, 1=Pzt ... 6=Cmt
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const targetDayNum = Number(dayKey); // 1=Pzt..6=Cmt, 0=Pazar
    const offsetFromMonday = targetDayNum === 0 ? 6 : (targetDayNum - 1);
    const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset + offsetFromMonday + (isNextWeek ? 7 : 0));
    return formatLocalIsoDate(targetDate);
  }

  function syncExtraCardioToGarmin(dayKey, sessionObj) {
    if (!isGarminEnabledForCurrentUser() || !sessionObj) return;
    const dateStr = getIsoDateForWeekday(dayKey, false);
    const sw = buildStandaloneCardioStructuredWorkout(sessionObj);
    const payload = {
      llmDescription: 'Celik Kodu PWA — 7. Sef (garmin-tredict-guard)',
      plan: {
        title: sw.title,
        description: '7. Şef tarafından 2. Bağımsız Kardiyo Seansı olarak eklendi.',
        categories: ['general'],
        targetgroups: ['intermediate'],
        zonetypes: ['heartrate'],
        language: 'en'
      },
      planTrainings: [
        {
          day: 1,
          calendarDate: dateStr,
          structuredWorkout: sw
        }
      ]
    };
    const icuType = sw.subSportType === 'indoor_rowing' ? 'Rowing' : (sw.subSportType === 'walking' ? 'Walk' : 'Run');
    const durMin = Math.max(5, Number(sessionObj.durationMin || 20));
    const icuEvent = {
      category: 'WORKOUT',
      type: icuType,
      start_date_local: `${dateStr}T19:00:00`,
      external_id: `celik_cardio_${dateStr}_${sessionObj.id || 'cardio'}`,
      name: sw.title,
      description: `- ${sw.title} ${durMin}m 70% HR`
    };
    pushPayloadToGarminSilent(payload, [icuEvent]);
  }
  window.syncExtraCardioToGarmin = syncExtraCardioToGarmin;

  function buildIntervalsWorkoutEvent(dateStr, workoutTitle, exercisesList) {
    if (!dateStr || !Array.isArray(exercisesList) || !exercisesList.length) return null;
    const blocks = [];
    exercisesList.forEach(item => {
      const exObj = typeof EXERCISES_DB !== 'undefined'
        ? EXERCISES_DB.find(x => x.id === (item.id || item.exerciseId) || x.name === item.name)
        : null;
      const exName = (exObj && exObj.name) || item.name || item.id || 'Hareket';
      const setsCount = Math.max(1, Number(item.sets || 3));
      const repsVal = parseSingleRepCount(item.reps, 10);
      const weightVal = Number(item.weight || item.targetWeight || 12);
      const restSec = Math.max(15, Number(item.rest || item.restSec || 60));
      const activeSec = Math.max(25, repsVal * 4);
      const loadSuffix = (weightVal > 0 && (!exObj || exObj.equipment !== 'bodyweight'))
        ? `${repsVal}x${weightVal}kg`
        : `${repsVal} Tekrar`;

      blocks.push(
        `${exName}\n` +
        `${setsCount}x\n` +
        `- ${exName} (${loadSuffix}) ${activeSec}s 70% HR\n` +
        `- Dinlenme ${restSec}s 55% HR`
      );
    });

    return {
      category: 'WORKOUT',
      type: 'WeightTraining',
      start_date_local: `${dateStr}T18:00:00`,
      external_id: `celik_kodu_${dateStr}`,
      name: String(workoutTitle || `Çelik Kodu (${dateStr})`).slice(0, 120),
      description: blocks.join('\n\n')
    };
  }

  function showGarminDirectCalendarSyncNotice(planTitle, syncedCount) {
    const oldBar = document.getElementById('garminTredictApplyToastBar');
    if (oldBar) oldBar.remove();
    const msg = `${planTitle} (${Number(syncedCount || 1)} seans) Garmin Güç (Strength) kategorisinde saate aktarıldı.`;
    if (typeof window.pushAppNotification === 'function') {
      window.pushAppNotification(msg, 'success', 'garmin');
    } else if (typeof showToast === 'function') {
      showToast(msg);
    }
  }

  const lastGarminErrorNoticeAt = {};

  function notifyGarminDeliveryIssue(err, forceShow = false) {
    const code = err && (err.code || err.message) ? String(err.code || err.message) : 'CLOUD_GATEWAY_UNREACHABLE';
    const now = Date.now();
    const uid = getActiveUidSafe() || 'anon';
    const throttleKey = `${uid}_${code}`;
    if (!forceShow && now - (lastGarminErrorNoticeAt[throttleKey] || 0) < 90000) return;
    lastGarminErrorNoticeAt[throttleKey] = now;

    let msg = 'Program telefona kaydedildi, bulut saat geçidine ulaşılamadığı için saate aktarılamadı.';
    if (code === 'MISSING_USER_WATCH_TOKEN') {
      msg = 'Saat aktarımı için Profil sekmesinden saat bağlantı anahtarınızı girin.';
    } else if (code === 'WATCH_AUTH_FAILED') {
      msg = 'Saat bağlantı anahtarı reddedildi. Profil sekmesindeki ayarı kontrol edin.';
    }
    if (typeof window.pushAppNotification === 'function') {
      window.pushAppNotification(msg, 'warn', 'garmin');
    } else if (typeof showToast === 'function') {
      showToast(msg);
    }
  }

  let inFlightPushSig = '';
  let pushQueueChain = Promise.resolve();
  const storageWriteDebounceTimers = {};

  async function pushPayloadToGarminSilent(planPayload, intervalsEvents, dedupSig = '') {
    // Garmin kullanmayan kullanıcıda kesinlikle hiçbir ağ isteği veya kuyruk çalışmaz!
    if (!isGarminEnabledForCurrentUser()) return;
    const hasIntervals = Array.isArray(intervalsEvents) && intervalsEvents.length > 0;
    const hasTredict = planPayload && Array.isArray(planPayload.planTrainings) && planPayload.planTrainings.length > 0;
    if (!hasIntervals && !hasTredict) return;

    const sigKey = getScopedGarminKey(LAST_PUSHED_SIG_KEY);
    const computedSig = dedupSig || JSON.stringify(
      (planPayload && Array.isArray(planPayload.planTrainings))
        ? planPayload.planTrainings.map(t => ({
            d: t.calendarDate,
            title: t.structuredWorkout && t.structuredWorkout.title,
            steps: t.structuredWorkout && (t.structuredWorkout.steps || []).map(grp => ({
              r: grp.repetitions,
              w: (grp.steps || []).map(st => `${st.exerciseName || ''}:${st.note || ''}:${st.exerciseRepetitions || st.duration || 0}:${st.exerciseWeight || 0}`)
            }))
          }))
        : (intervalsEvents || [])
    );

    if (inFlightPushSig === computedSig || localStorage.getItem(sigKey) === computedSig) {
      return;
    }
    inFlightPushSig = computedSig;
    try {
      localStorage.setItem(sigKey, computedSig);
    } catch {}

    const runTask = async () => {
      try {
        const res = await fetchGarminBridge('/api/tredict/push-workout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intervalsEvents: intervalsEvents || [], planPayload })
        });
        const data = await res.json();
        if (data && data.ok === true && data.directCalendarSync === true) {
          try {
            localStorage.removeItem(getScopedGarminKey(OUTBOX_PLANS_KEY));
          } catch {}
          const firstItem = Array.isArray(data.workouts) ? data.workouts[0] : null;
          if (!firstItem || !firstItem.skippedDuplicate) {
            const count = Number(data.count) || (Array.isArray(planPayload?.planTrainings) ? planPayload.planTrainings.length : 1);
            showGarminDirectCalendarSyncNotice(planPayload?.plan?.title || 'Çelik Kodu Seansı', count);
          }
          if (inFlightPushSig === computedSig) inFlightPushSig = '';
          return;
        }
        const failErr = new Error((data && data.error) || 'CLOUD_GATEWAY_UNREACHABLE');
        failErr.code = 'CLOUD_GATEWAY_UNREACHABLE';
        throw failErr;
      } catch (err) {
        notifyGarminDeliveryIssue(err, false);
      }

      try {
        if (localStorage.getItem(sigKey) === computedSig) {
          localStorage.removeItem(sigKey);
        }
        const outboxKey = getScopedGarminKey(OUTBOX_PLANS_KEY);
        const outbox = JSON.parse(localStorage.getItem(outboxKey) || '[]');
        outbox.unshift({ createdAt: new Date().toISOString(), sig: computedSig, intervalsEvents: intervalsEvents || [], planPayload });
        localStorage.setItem(outboxKey, JSON.stringify(outbox.slice(0, 10)));
      } catch {} finally {
        if (inFlightPushSig === computedSig) inFlightPushSig = '';
      }
    };

    pushQueueChain = pushQueueChain.then(runTask, runTask);
    return pushQueueChain;
  }

  function showGarminCalendarDeleteNotice(deletedCount) {
    if (!deletedCount || deletedCount <= 0) return;
    const oldBar = document.getElementById('garminTredictApplyToastBar');
    if (oldBar) oldBar.remove();
    const msg = `Takvimden iptal edilen ${Number(deletedCount)} antrenman seansı Tredict ve Garmin saatinizden silindi.`;
    if (typeof window.pushAppNotification === 'function') {
      window.pushAppNotification(msg, 'warn', 'garmin');
    } else if (typeof showToast === 'function') {
      showToast(msg);
    }
  }

  async function deleteDatesFromGarminSilent(dates = [], deleteAll = false, subSportTypes = []) {
    if (!isGarminEnabledForCurrentUser()) return;
    try {
      const res = await fetchGarminBridge('/api/tredict/delete-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, deleteAll, subSportTypes })
      });
      const data = await res.json();
      if (data && data.ok && Number(data.deletedCount) > 0) {
        showGarminCalendarDeleteNotice(Number(data.deletedCount));
      }
    } catch {}
  }

  function mapCardioIdToSubSport(id) {
    const s = String(id || '');
    if (s === 'cond_walking' || /walk/i.test(s)) return 'walking';
    if (s === 'cond_running' || /run|treadmill/i.test(s)) return 'treadmill';
    return 'indoor_rowing';
  }

  function handleCalendarStorageWrite(key, rawValue, prevRawValue = null) {
    if (!isGarminEnabledForCurrentUser()) return;
    try {
      const parsed = JSON.parse(rawValue);
      if (!parsed || typeof parsed !== 'object') return;
      let prevParsed = {};
      try {
        if (prevRawValue) prevParsed = JSON.parse(prevRawValue) || {};
      } catch {}

      const todayStr = formatLocalIsoDate(new Date());

      // 1) Tek günlük tarih ataması veya iptali (celik_kodu_date_schedule_${uid})
      if (key.startsWith('celik_kodu_date_schedule_')) {
        const hasPrevDateSnap = Object.keys(prevParsed).length > 0;
        const cancelledDates = [];
        if (hasPrevDateSnap) {
          for (const [dKey, prevEntry] of Object.entries(prevParsed)) {
            const prevEx = extractExercisesFromPlanEntry(prevEntry);
            const curEx = extractExercisesFromPlanEntry(parsed[dKey]);
            if (prevEx.length > 0 && curEx.length === 0 && dKey >= todayStr) {
              cancelledDates.push(dKey);
            }
          }
          for (const [dKey, curEntry] of Object.entries(parsed)) {
            const curEx = extractExercisesFromPlanEntry(curEntry);
            const curCardio = (curEntry && Array.isArray(curEntry.extraCardioSessions)) ? curEntry.extraCardioSessions : [];
            if (dKey >= todayStr && ((curEntry && curEntry.rest) || (curEx.length === 0 && curCardio.length === 0)) && !cancelledDates.includes(dKey)) {
              cancelledDates.push(dKey);
            }
          }
          if (cancelledDates.length > 0) {
            deleteDatesFromGarminSilent(cancelledDates, false);
          }
        }

        const activeDateKeys = Object.keys(parsed)
          .filter(dKey => dKey >= todayStr && extractExercisesFromPlanEntry(parsed[dKey]).length > 0)
          .sort();
        if (!activeDateKeys.length) return;
        const changedDateKeys = activeDateKeys.filter(dKey => !hasPrevDateSnap || JSON.stringify(parsed[dKey]) !== JSON.stringify(prevParsed[dKey]));
        const targetDateKeys = changedDateKeys.length > 0 ? changedDateKeys : [activeDateKeys.includes(todayStr) ? todayStr : activeDateKeys[activeDateKeys.length - 1]];

        if (targetDateKeys.length === 1) {
          const targetDateKey = targetDateKeys[0];
          const entry = parsed[targetDateKey];
          const exList = extractExercisesFromPlanEntry(entry);
          if (!exList.length) return;
          const title = entry.title || (entry.customWorkout && entry.customWorkout.title) || `Çelik Kodu (${targetDateKey})`;
          saveSentWorkoutManifest(title, exList, 'date_' + targetDateKey);
          const payload = buildTredictPlanPayload(title, exList, null, targetDateKey);
          const ev = buildIntervalsWorkoutEvent(targetDateKey, title, exList);
          pushPayloadToGarminSilent(payload, ev ? [ev] : []);
          return;
        }

        const multiDays = [];
        const intervalsEvents = [];
        targetDateKeys.forEach((dKey, idx) => {
          const entry = parsed[dKey];
          const exList = extractExercisesFromPlanEntry(entry);
          if (!exList.length) return;
          const title = entry.title || (entry.customWorkout && entry.customWorkout.title) || `Çelik Kodu (${dKey})`;
          saveSentWorkoutManifest(title, exList, 'date_' + dKey);
          multiDays.push({
            dayNumber: idx + 1,
            calendarDate: dKey,
            dateKey: 'date_' + dKey,
            title,
            exercises: exList,
            extraCardioSessions: Array.isArray(entry.extraCardioSessions) ? entry.extraCardioSessions : [],
            onlyCardioChanged: false
          });
          const ev = buildIntervalsWorkoutEvent(dKey, title, exList);
          if (ev) intervalsEvents.push(ev);
        });
        if (!multiDays.length) return;
        const payload = buildTredictPlanPayload('Çelik Kodu — Takvim Seansları', [], multiDays);
        pushPayloadToGarminSilent(payload, intervalsEvents);
        return;
      }

      // 2) Haftalık veya Gelecek Hafta takvim ataması veya iptali (celik_kodu_weekly_schedule_ / celik_kodu_next_weekly_schedule_)
      if (key.startsWith('celik_kodu_weekly_schedule_') || key.startsWith('celik_kodu_next_weekly_schedule_')) {
        const isNext = key.startsWith('celik_kodu_next_weekly_schedule_');
        const multiDays = [];
        const intervalsEvents = [];
        const cancelledDates = [];
        const hasPrevSnapshot = Object.keys(prevParsed).length > 0;
        const allWeekDays = ['1', '2', '3', '4', '5', '6', '0'];
        for (const dayKey of allWeekDays) {
          const entry = parsed[dayKey] || {};
          const exList = extractExercisesFromPlanEntry(entry);
          const prevEntry = prevParsed[dayKey] || {};
          const prevExList = extractExercisesFromPlanEntry(prevEntry);
          const extraCardio = (entry && Array.isArray(entry.extraCardioSessions)) ? entry.extraCardioSessions : [];
          const prevExtraCardio = (prevEntry && Array.isArray(prevEntry.extraCardioSessions)) ? prevEntry.extraCardioSessions : [];
          const dateStr = getIsoDateForWeekday(dayKey, isNext);
          if (dateStr < todayStr) continue;
          const entryChanged = !hasPrevSnapshot || JSON.stringify(entry) !== JSON.stringify(prevEntry);
          const strengthChanged = !hasPrevSnapshot || JSON.stringify(exList) !== JSON.stringify(prevExList);
          const removedCardio = prevExtraCardio.filter(p => p && !extraCardio.some(c => c && c.id === p.id));
          if (removedCardio.length > 0 && !(exList.length === 0 && extraCardio.length === 0)) {
            const removedSubSports = removedCardio.map(r => mapCardioIdToSubSport(r.id));
            deleteDatesFromGarminSilent([dateStr], false, removedSubSports);
          }
          if (prevExList.length > 0 && exList.length === 0 && extraCardio.length > 0) {
            deleteDatesFromGarminSilent([dateStr], false, ['strength_training']);
          }
          const addedOrUpdatedCardio = extraCardio.filter(c => {
            const prevMatch = prevExtraCardio.find(p => p && p.id === (c && c.id));
            return !prevMatch || JSON.stringify(prevMatch) !== JSON.stringify(c);
          });
          if ((exList.length > 0 || extraCardio.length > 0) && entryChanged && (strengthChanged || addedOrUpdatedCardio.length > 0)) {
            const dNum = Number(dayKey) === 0 ? 7 : Number(dayKey);
            const dayTitle = entry.title || (entry.customWorkout && entry.customWorkout.title) || `Çelik Kodu Gün ${dNum}`;
            if (exList.length > 0 && strengthChanged) {
              saveSentWorkoutManifest(dayTitle, exList, 'date_' + dateStr);
            }
            multiDays.push({
              dayNumber: dNum,
              calendarDate: dateStr,
              dateKey: 'date_' + dateStr,
              title: dayTitle,
              exercises: exList,
              extraCardioSessions: strengthChanged ? extraCardio : addedOrUpdatedCardio,
              onlyCardioChanged: Boolean(!strengthChanged && addedOrUpdatedCardio.length > 0)
            });
            if (exList.length > 0 && strengthChanged) {
              const ev = buildIntervalsWorkoutEvent(dateStr, dayTitle, exList);
              if (ev) intervalsEvents.push(ev);
            }
          } else if (hasPrevSnapshot && exList.length === 0 && extraCardio.length === 0 && (prevExList.length > 0 || prevExtraCardio.length > 0)) {
            if (!cancelledDates.includes(dateStr)) cancelledDates.push(dateStr);
          }
        }
        if (cancelledDates.length > 0) {
          deleteDatesFromGarminSilent(cancelledDates, false);
        }
        if (!multiDays.length) return;
        const planTitle = isNext ? 'Çelik Kodu — Gelecek Hafta Takvimi' : 'Çelik Kodu — Haftalık Antrenman Takvimi';
        const payload = buildTredictPlanPayload(planTitle, [], multiDays);
        pushPayloadToGarminSilent(payload, intervalsEvents);
      }
    } catch {}
  }

  function handleGeneratedSingleDayWorkoutWrite(rawValue) {
    if (!isGarminEnabledForCurrentUser() || !rawValue) return;
    try {
      const gen = JSON.parse(rawValue);
      if (!gen || !Array.isArray(gen.exercises) || gen.exercises.length === 0) return;
      if (window.pendingAiWeeklyPlan && window._editingPendingWeeklyDayIdx !== null && window._editingPendingWeeklyDayIdx !== undefined) {
        return;
      }
      const todayStr = formatLocalIsoDate(new Date());
      const createdDate = gen.createdAt ? formatLocalIsoDate(new Date(gen.createdAt)) : todayStr;
      const updatedDate = gen.updatedAt ? formatLocalIsoDate(new Date(gen.updatedAt)) : createdDate;
      if (createdDate !== todayStr && updatedDate !== todayStr) return;

      const hydratedExercises = hydrateExercisesWithWorkoutScheme(gen, gen.exercises);
      const title = gen.title || `Çelik Kodu (${todayStr})`;
      saveSentWorkoutManifest(title, hydratedExercises, 'date_' + todayStr);
      const payload = buildTredictPlanPayload(title, hydratedExercises, null, todayStr);
      const ev = buildIntervalsWorkoutEvent(todayStr, title, hydratedExercises);
      const sig = 'gen_' + todayStr + '_' + JSON.stringify(hydratedExercises.map(e => `${e.id || e.name}:${e.sets}:${parseSingleRepCount(e.reps, 10)}:${e.weight || 0}`));
      if (localStorage.getItem(getScopedGarminKey(LAST_PUSHED_SIG_KEY)) === sig) return;
      pushPayloadToGarminSilent(payload, ev ? [ev] : [], sig);
    } catch {}
  }

  function installCalendarAutoSyncHook() {
    if (window.__garminCalendarStorageHooked) return;
    window.__garminCalendarStorageHooked = true;
    const origSetItem = Storage.prototype.setItem;
    const origRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (key, value) {
      let prevValue = null;
      try {
        if (typeof key === 'string' && (
          key.startsWith('celik_kodu_date_schedule_') ||
          key.startsWith('celik_kodu_weekly_schedule_') ||
          key.startsWith('celik_kodu_next_weekly_schedule_')
        )) {
          prevValue = this.getItem(key);
        }
      } catch {}
      origSetItem.call(this, key, value);
      if (typeof key === 'string') {
        if (
          key.startsWith('celik_kodu_date_schedule_') ||
          key.startsWith('celik_kodu_weekly_schedule_') ||
          key.startsWith('celik_kodu_next_weekly_schedule_')
        ) {
          if (storageWriteDebounceTimers[key]) clearTimeout(storageWriteDebounceTimers[key]);
          storageWriteDebounceTimers[key] = setTimeout(() => handleCalendarStorageWrite(key, value, prevValue), 350);
        } else if (key === 'celik_kodu_active_user_id' || key === 'celik_kodu_session') {
          setTimeout(() => refreshGarminPanelsForUserState(), 0);
        }
      }
    };
    Storage.prototype.removeItem = function (key) {
      origRemoveItem.call(this, key);
      if (typeof key === 'string' && key.startsWith('celik_kodu_date_schedule_')) {
        setTimeout(() => deleteDatesFromGarminSilent([], true), 0);
      }
    };
  }

  // Geriye dönük uyumluluk için manuel tetikleyici (yalnızca Garmin açıksa çalışır)
  window.sendWorkoutToGarminWatch = async function () {
    if (!isGarminEnabledForCurrentUser()) return;
    const activeGen = typeof currentGeneratedWorkout !== 'undefined' && currentGeneratedWorkout
      ? currentGeneratedWorkout
      : window.currentGeneratedWorkout;
    if (activeGen && Array.isArray(activeGen.exercises) && activeGen.exercises.length > 0) {
      const todayStr = formatLocalIsoDate(new Date());
      const title = activeGen.title || 'Çelik Kodu Güç Seansı';
      const payload = buildTredictPlanPayload(title, activeGen.exercises);
      const ev = buildIntervalsWorkoutEvent(todayStr, title, activeGen.exercises);
      await pushPayloadToGarminSilent(payload, ev ? [ev] : []);
    }
  };

  window.syncGarminActivitiesFromTredict = async function () {
    if (!isGarminEnabledForCurrentUser()) return;
    const savedY = window.scrollY;
    let syncedLive = false;
    try {
      const res = await fetchGarminBridge('/api/tredict/activities?days=30');
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.activities) && data.activities.length > 0) {
        localStorage.setItem(getScopedGarminKey(TELEMETRY_STORAGE_KEY), JSON.stringify(data.activities));
        syncedLive = true;
      }
    } catch (err) {
      notifyGarminDeliveryIssue(err, true);
    }

    await syncGarminWellnessStepsSilent();

    handoffCompletedActivitiesToTabChiefs();
    renderHistoryGarminSyncPanel();
    renderAnalyticsGarminCoachPanel();
    renderProfileGarminBridgeCard();
    if (typeof window.refreshTopFitnessCardioScoreBars === 'function') {
      window.refreshTopFitnessCardioScoreBars();
    }
    window.scrollTo({ top: savedY, behavior: 'instant' });

    if (typeof showToast === 'function') {
      showToast(syncedLive
        ? '⌚ 7. Şef: Saatten sağlık verileri çekildi, hareketler bizdeki orijinal adlarıyla güncellendi!'
        : '⌚ 7. Şef: Orijinal hareket kimlikleri + Garmin sağlık telemetrisi yüklendi.');
    }
  };

  window.resolveGarminUndefinedGroup = async function (activityId, groupId, exerciseId) {
    if (!isGarminEnabledForCurrentUser() || !activityId || !groupId || !exerciseId) return;
    const savedY = window.scrollY;
    const resolved = getResolvedSetsMap();
    if (!resolved[activityId]) resolved[activityId] = {};
    resolved[activityId][groupId] = exerciseId;
    saveResolvedSetsMap(resolved);

    const exObj = typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB.find(x => x.id === exerciseId) : null;
    const activities = getStoredActivities();
    const act = activities.find(a => a.id === activityId);

    handoffCompletedActivitiesToTabChiefs();

    if (act && exObj) {
      const groups = analyzeActivityGroups(act);
      const grp = groups.find(g => g.groupId === groupId);
      if (grp) {
        try {
          await fetchGarminBridge('/api/tredict/activity-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: activityId,
              title: act.title,
              notes: `Çelik Kodu Orijinal Hareket: ${exObj.name} (${grp.sets.length} Set @ ${grp.weight || 0} kg | Nabız: ${grp.healthTelemetry.avgHeartrate} bpm)`
            })
          });
        } catch {}
      }
    }

    renderHistoryGarminSyncPanel();
    renderAnalyticsGarminCoachPanel();
    if (typeof renderHistory === 'function') renderHistory();
    window.scrollTo({ top: savedY, behavior: 'instant' });

    if (typeof showToast === 'function' && exObj) {
      showToast(`✅ Orijinal ad ("${exObj.name}") atandı, saatin yalnızca nabız/TUT sağlık verisi eklendi!`);
    }
  };

  // ─── 4. SEKME (HISTORY-GUARD): YALNIZCA GARMIN AÇIK KULLANICIDA GÖSTERİLİR ───
  function renderHistoryGarminSyncPanel() {
    const existing = document.getElementById('garminHistorySyncContainer');
    if (!isGarminEnabledForCurrentUser()) {
      if (existing) existing.remove();
      return;
    }

    const historyTab = document.getElementById('historyTab');
    if (!historyTab) return;

    let container = existing;
    if (!container) {
      container = document.createElement('div');
      container.id = 'garminHistorySyncContainer';
      container.style.marginBottom = '16px';
      const firstChild = historyTab.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        historyTab.insertBefore(container, firstChild.nextSibling);
      } else {
        historyTab.prepend(container);
      }
    }

    const activities = getStoredActivities();
    const metrics = computePhysiologicalMetrics();
    const editedTitleMap = buildEditedWatchTitleIndex(null, getActiveUidSafe());

    const cardsHtml = activities.map(act => {
      const manifest = findManifestForActivity(act);
      const editedEntry = editedTitleMap.get(String(act.id || ''));
      const displayTitle = (editedEntry && editedEntry.title)
        ? editedEntry.title
        : ((manifest && manifest.title && (!act.title || act.title === 'Güç' || act.title === 'Garmin Antrenmanı'))
          ? manifest.title
          : act.title);
      const groups = analyzeActivityGroups(act);
      const unresolved = groups.filter(g => !g.isResolved);
      const resolved = groups.filter(g => g.isResolved);
      const dateStr = toLocalIsoDateString(act.date);
      const avgHr = act.summary?.heartrate || 120;
      const maxHr = act.summary?.heartrateMax || 148;
      const cal = act.summary?.calories || 0;

      const resolvedPills = resolved.map(g => {
        const originalLabel = g.originalName || (g.matchedEx ? g.matchedEx.name : 'Orijinal Hareket');
        const avgReps = Math.round(g.sets.reduce((s, x) => s + x.repetitions, 0) / g.sets.length);
        const h = g.healthTelemetry;
        const isCardio = Boolean(g.sets[0]?.isCardioSession || /^cond_/.test(String(g.originalId || '')));
        if (isCardio) {
          const paceStr = h.paceSecPerKm
            ? `${Math.floor(h.paceSecPerKm / 60)}:${String(h.paceSecPerKm % 60).padStart(2, '0')} /km`
            : '';
          const distStr = h.distanceMeters ? `${(h.distanceMeters / 1000).toFixed(2)} km` : '';
          const cadStr = h.cadenceSpm ? `${h.cadenceSpm} spm` : '';
          const pwrStr = h.powerWatts ? `${h.powerWatts} W` : '';
          const extraStats = [distStr, paceStr, cadStr, pwrStr].filter(Boolean).join(' • ');
          return `<span style="display:inline-flex;align-items:center;gap:5px;background:#DBEAFE;color:#0369A1;border:1px solid #93C5FD;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:700;">
            ✅ ${escHtml(originalLabel)} • ${Math.max(1, Math.round(h.timeUnderTensionSec / 60))} dk
            <span style="background:#FFFFFF;color:#0F172A;padding:1px 6px;border-radius:4px;font-size:11px;">❤️ ${h.avgHeartrate}/${h.maxHeartrate} bpm${extraStats ? ` • ${escHtml(extraStats)}` : ''}</span>
          </span>`;
        }
        return `<span style="display:inline-flex;align-items:center;gap:5px;background:#DCFCE7;color:#15803D;border:1px solid #86EFAC;padding:5px 10px;border-radius:6px;font-size:12px;font-weight:700;">
          ✅ ${escHtml(originalLabel)} • ${g.sets.length}×${avgReps} ${g.weight ? `@ ${g.weight}kg` : ''}
          <span style="background:#FFFFFF;color:#0F172A;padding:1px 6px;border-radius:4px;font-size:11px;">❤️ ${h.avgHeartrate} bpm • ⏱️ ${h.timeUnderTensionSec}sn TUT${h.heartrateRecovery ? ` • 📉 -${h.heartrateRecovery} HRR` : ''}</span>
        </span>`;
      }).join(' ');

      const unresolvedBlocks = unresolved.map(g => {
        const avgReps = Math.round(g.sets.reduce((s, x) => s + x.repetitions, 0) / g.sets.length);
        const suggestions = getSmartSuggestionsForGroup(g);
        const quickBtns = suggestions.map(sug => {
          const encAct = encodeURIComponent(act.id);
          const encGrp = encodeURIComponent(g.groupId);
          const encEx = encodeURIComponent(sug.id);
          return `<button type="button" onclick="window.resolveGarminUndefinedGroup(decodeURIComponent('${encAct}'), decodeURIComponent('${encGrp}'), decodeURIComponent('${encEx}'))" style="background:#0F172A;color:#FFFFFF;border:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;">➕ ${escHtml(sug.name)}</button>`;
        }).join(' ');

        const allOptions = (typeof EXERCISES_DB !== 'undefined' ? EXERCISES_DB : []).map(ex =>
          `<option value="${escHtml(ex.id)}">${escHtml(ex.name)}</option>`
        ).join('');

        const encAct = encodeURIComponent(act.id);
        const encGrp = encodeURIComponent(g.groupId);
        const h = g.healthTelemetry;

        return `<div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:10px 12px;margin-top:8px;color:#0F172A;">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px;">
            <strong style="color:#B45309;font-size:13px;">⚠️ Plan Dışı İlave Set: ${g.sets.length} Set × ~${avgReps} Tekrar ${g.weight ? `@ ${g.weight} kg` : '(Vücut Ağırlığı)'}</strong>
            <span style="font-size:11.5px;color:#0F172A;background:#FFFFFF;padding:2px 7px;border-radius:5px;font-weight:600;">Saatten Alınan Sağlık Verisi: ❤️ ${h.avgHeartrate}/${h.maxHeartrate} bpm • ⏱️ ${h.timeUnderTensionSec} sn TUT</span>
          </div>
          <div style="font-size:12px;color:#334155;margin:6px 0 4px;font-weight:600;">💡 Saatin ham tahmini (<code>${escHtml(g.rawCategory)}</code>) kabul edilmedi — Bizdeki Orijinal Hareketi Seç:</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
            ${quickBtns}
            <select onchange="if(this.value) window.resolveGarminUndefinedGroup(decodeURIComponent('${encAct}'), decodeURIComponent('${encGrp}'), this.value)" style="padding:5px 8px;border:1px solid #94A3B8;border-radius:6px;font-size:12px;color:#0F172A;background:#FFFFFF;max-width:240px;">
              <option value="">🔍 Kütüphaneden Orijinal Adı Seç...</option>
              ${allOptions}
            </select>
          </div>
        </div>`;
      }).join('');

      return `<div style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:10px;padding:12px 14px;margin-top:10px;color:#0F172A;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
          <div>
            <strong style="font-size:14px;color:#0F172A;">⌚ ${escHtml(displayTitle)} <span style="font-size:11.5px;font-weight:700;color:#0369A1;">• Garmin fr945</span></strong>
            <div style="font-size:12px;color:#475569;">📅 ${escHtml(dateStr)} • ❤️ Ort. ${avgHr} / Zirve ${maxHr} bpm • 🔥 ${cal} kcal • 🏋️ ${groups.reduce((n, g) => n + g.sets.length, 0)} Set/Blok</div>
          </div>
          <span style="background:${unresolved.length ? '#FEF3C7' : '#DCFCE7'};color:${unresolved.length ? '#B45309' : '#15803D'};padding:4px 10px;border-radius:6px;font-size:12px;font-weight:700;">
            ${unresolved.length ? `⚠️ ${unresolved.length} Plan Dışı Grup` : '✅ Orijinal Ad + Sağlık Verisi İşlendi'}
          </span>
        </div>
        ${resolvedPills ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${resolvedPills}</div>` : ''}
        ${unresolvedBlocks}
      </div>`;
    }).join('');

    container.innerHTML = `
      <div style="background:#F8FAFC;border:2px solid #0284C7;border-radius:12px;padding:14px 16px;color:#0F172A;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:#0F172A;">⌚ 7. Şef (Garmin &amp; Tredict Şefi): Orijinal Hareket Kimliği + Sağlık Telemetrisi</div>
            <div style="font-size:12.5px;color:#334155;">Takvime eklediğin antrenmanlar saate otomatik gider; tamamlanan antrenmanda bizdeki orijinal hareket adları korunup yalnızca saatin sağlık verileri işlenir.</div>
          </div>
          <button type="button" onclick="window.syncGarminActivitiesFromTredict()" style="background:#0284C7;color:#FFFFFF;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;">
            🔄 Sağlık Verilerini Eşitle (${metrics.activityCount})
          </button>
        </div>
        ${cardsHtml}
      </div>
    `;
  }

  // ─── 5. SEKME (ANALYTICS-GUARD): YALNIZCA GARMIN AÇIK KULLANICIDA GÖSTERİLİR ───
  function renderAnalyticsGarminCoachPanel() {
    const existing = document.getElementById('garminAnalyticsCoachContainer');
    if (!isGarminEnabledForCurrentUser()) {
      if (existing) existing.remove();
      return;
    }

    const analyticsTab = document.getElementById('analyticsTab');
    if (!analyticsTab) return;

    let container = existing;
    if (!container) {
      container = document.createElement('div');
      container.id = 'garminAnalyticsCoachContainer';
      container.style.marginBottom = '16px';
      const firstChild = analyticsTab.firstElementChild;
      if (firstChild && firstChild.nextSibling) {
        analyticsTab.insertBefore(container, firstChild.nextSibling);
      } else {
        analyticsTab.prepend(container);
      }
    }

    const m = computePhysiologicalMetrics();
    const auditSummary = auditAllLibraryExercises();
    const isExpanded = container.dataset.expanded === 'true';

    container.innerHTML = `
      <div style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:12px;padding:12px 16px;color:#0F172A;box-shadow:0 2px 6px rgba(15,23,42,0.05);">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong style="font-size:14.5px;color:#0F172A;">⌚ 7. Şef: Garmin Sağlık &amp; Kardiyak Efor (Garmin fr945)</strong>
            <span style="background:#DBEAFE;color:#0369A1;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:700;">❤️ Ort. ${m.avgHr} bpm</span>
            <span style="background:#DCFCE7;color:#15803D;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:700;">📉 HRR ${m.avgHrr} bpm/dk</span>
            <span style="background:#F1F5F9;color:#334155;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:700;">🚣🏃 Kürek • Koşu • Yürüyüş Aktif</span>
          </div>
          <button type="button" onclick="window.toggleGarminAnalyticsDrawer(this)" style="background:#0F172A;color:#FFFFFF;border:none;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;">
            💡 Sağlık &amp; Efor Analizi ${isExpanded ? '▲ Gizle' : '▼ Göster'}
          </button>
        </div>
        <div id="garminAnalyticsDrawer" style="display:${isExpanded ? 'block' : 'none'};margin-top:12px;padding-top:12px;border-top:1px solid #E2E8F0;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;">
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">KARDİYAK YÜK &amp; ZİRVE NABIZ</div>
              <div style="font-size:16px;font-weight:800;color:#0F172A;margin-top:2px;">${m.avgHr} bpm / ${m.peakHr} bpm</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">${escHtml(m.loadAdvice)}</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">SET ARASI TOPARLANMA (HRR)</div>
              <div style="font-size:16px;font-weight:800;color:#15803D;margin-top:2px;">-${m.avgHrr} bpm / dinlenme</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">${escHtml(m.restAdvice)}</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">KÜREK • KOŞU • YÜRÜYÜŞ EFORU (Garmin fr945)</div>
              <div style="font-size:15px;font-weight:800;color:#0369A1;margin-top:2px;">🚣 38 spm • 🏃 136W (8:31/km) • 🚶 2.3 km</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">Kondisyon kategorisinde hipertrofi setini şişirmeden doğrudan kardiyak efor ve nabız zonu olarak analiz edilir.</div>
            </div>
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;">
              <div style="font-size:11.5px;color:#475569;font-weight:700;">KÜTÜPHANE ↔ GARMIN KAS TEYİDİ</div>
              <div style="font-size:16px;font-weight:800;color:#0369A1;margin-top:2px;">${auditSummary.exactCount} Tam • ${auditSummary.unmappedNotedCount} İsimsiz+Notlu</div>
              <div style="font-size:12px;color:#334155;margin-top:4px;">Kürek (<code>indoor_row</code>), Yürüyüş (<code>walk</code>) ve Koşu (<code>run</code>) resmi Garmin FIT koduyla tam uyumludur.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.toggleGarminAnalyticsDrawer = function (btn) {
    const container = document.getElementById('garminAnalyticsCoachContainer');
    if (!container) return;
    const row = btn.closest('div');
    const anchorTop = row ? row.getBoundingClientRect().top : 0;
    container.dataset.expanded = container.dataset.expanded === 'true' ? 'false' : 'true';
    renderAnalyticsGarminCoachPanel();
    const newRow = container.firstElementChild;
    if (newRow && anchorTop) {
      window.scrollBy({ top: newRow.getBoundingClientRect().top - anchorTop, behavior: 'instant' });
    }
  };

  // Eski ekstra butonları temizle (Program ve Antrenman sekmelerinde hiçbir ekstra buton çıkmaz)
  function cleanupLegacyWatchButtons() {
    ['garminGeneratorActionBanner', 'garminActiveWorkoutBanner'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    document.querySelectorAll('.btn-garmin-send-generated, .btn-garmin-send-weekly-day, .btn-garmin-send-today').forEach(el => el.remove());
  }

  // ─── 6. SEKME (PROFILE-GUARD): KULLANICI BAZLI GARMIN AÇ/KAPAT KARTI ───
  function ensureGarminSetupModalEl() {
    let modal = document.getElementById('garminSetupModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'garminSetupModal';
    modal.className = 'modal-overlay';
    modal.style.background = 'rgba(15, 23, 42, 0.58)';
    modal.onclick = function (e) {
      if (e.target === modal) window.closeGarminSetupModal();
    };
    modal.innerHTML = `
      <div class="modal-box" style="background:#FFFFFF;color:#0F172A;border:1px solid #CBD5E1;border-radius:14px;max-width:420px;width:94%;padding:16px;box-shadow:0 20px 45px rgba(15,23,42,0.22);">
        <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span class="modal-title" style="font-size:15px;font-weight:800;color:#0F172A;">⌚ Saat Bağlantı Ayarları</span>
          <button type="button" class="modal-close" aria-label="Kapat" onclick="window.closeGarminSetupModal()" style="background:#F1F5F9;color:#0F172A;border:1px solid #CBD5E1;border-radius:8px;width:30px;height:30px;font-weight:800;cursor:pointer;">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div>
            <label for="garminModalTredictInput" style="display:block;font-size:12px;font-weight:800;color:#0F172A;margin-bottom:4px;">Tredict Bağlantı Anahtarı</label>
            <input id="garminModalTredictInput" type="password" autocomplete="off" placeholder="Tredict anahtarını girin" style="width:100%;box-sizing:border-box;background:#F8FAFC;color:#0F172A;border:1px solid #CBD5E1;border-radius:8px;padding:8px 10px;font-size:13px;">
            <div style="font-size:11px;color:#475569;margin-top:2px;">Kuvvet antrenmanı takvim aktarımı</div>
          </div>
          <div>
            <label for="garminModalIntervalsInput" style="display:block;font-size:12px;font-weight:800;color:#0F172A;margin-bottom:4px;">Intervals.icu Anahtarı (Opsiyonel)</label>
            <input id="garminModalIntervalsInput" type="password" autocomplete="off" placeholder="İsteğe bağlı" style="width:100%;box-sizing:border-box;background:#F8FAFC;color:#0F172A;border:1px solid #CBD5E1;border-radius:8px;padding:8px 10px;font-size:13px;">
            <div style="font-size:11px;color:#475569;margin-top:2px;">Günlük adım ve nabız</div>
          </div>
          <div>
            <label for="garminModalGatewayInput" style="display:block;font-size:12px;font-weight:800;color:#0F172A;margin-bottom:4px;">Özel Bulut Adresi (Opsiyonel)</label>
            <input id="garminModalGatewayInput" type="url" autocomplete="off" placeholder="https://celik-kodu.vercel.app" style="width:100%;box-sizing:border-box;background:#F8FAFC;color:#0F172A;border:1px solid #CBD5E1;border-radius:8px;padding:8px 10px;font-size:13px;">
            <div style="font-size:11px;color:#475569;margin-top:2px;">Varsayılan boş bırakılabilir</div>
          </div>
          <div id="garminSetupStatusMsg" style="display:none;border-radius:8px;padding:8px 10px;font-size:12px;font-weight:700;"></div>
          <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
            <button id="garminSetupSaveBtn" type="button" onclick="window.saveAndTestGarminSetupFromModal()" style="flex:1;min-width:150px;background:#0F172A;color:#FFFFFF;border:none;border-radius:8px;padding:9px 12px;font-size:13px;font-weight:800;cursor:pointer;">Test Et ve Kaydet</button>
            <button id="garminSetupClearBtn" type="button" onclick="window.disconnectGarminForUser()" style="background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;border-radius:8px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;">Kaldır</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function setGarminSetupStatus(text, tone = 'info') {
    const el = document.getElementById('garminSetupStatusMsg');
    if (!el) return;
    if (!text) {
      el.style.display = 'none';
      el.textContent = '';
      return;
    }
    const palette = {
      ok: { bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' },
      warn: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
      err: { bg: '#FEE2E2', color: '#B91C1C', border: '#FCA5A5' },
      info: { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' }
    }[tone] || { bg: '#F1F5F9', color: '#334155', border: '#CBD5E1' };
    el.style.display = 'block';
    el.style.background = palette.bg;
    el.style.color = palette.color;
    el.style.border = `1px solid ${palette.border}`;
    el.textContent = text;
  }

  window.openGarminSetupModal = function () {
    const uid = getActiveUidSafe();
    if (!uid) return;
    const modal = ensureGarminSetupModalEl();
    const trInput = document.getElementById('garminModalTredictInput');
    const icuInput = document.getElementById('garminModalIntervalsInput');
    const gwInput = document.getElementById('garminModalGatewayInput');
    const clearBtn = document.getElementById('garminSetupClearBtn');
    const hasTr = Boolean(getUserTredictToken(uid));
    const hasIcu = Boolean(getUserIntervalsToken(uid));
    if (trInput) {
      trInput.value = '';
      trInput.placeholder = hasTr ? '•••••••• (Merkez Kasada Kilitli)' : 'Tredict anahtarını girin';
    }
    if (icuInput) {
      icuInput.value = '';
      icuInput.placeholder = hasIcu ? '•••••••• (Merkez Kasada Kilitli)' : 'İsteğe bağlı';
    }
    if (gwInput) gwInput.value = getUserGatewayBase(uid);
    if (clearBtn) clearBtn.style.display = hasGarminCredentialsConfigured(uid) ? 'inline-block' : 'none';
    setGarminSetupStatus('', 'info');
    modal.classList.add('active');
    const box = modal.querySelector('.modal-box');
    if (box) box.scrollTop = 0;
  };

  window.closeGarminSetupModal = function () {
    const modal = document.getElementById('garminSetupModal');
    if (modal) modal.classList.remove('active');
  };

  window.disconnectGarminForUser = function () {
    const uid = getActiveUidSafe();
    if (!uid) return;
    writeWatchVault(uid, {
      enabled: false,
      tredictToken: '',
      intervalsToken: '',
      gatewayBase: ''
    }, true);
    refreshGarminPanelsForUserState();
    window.closeGarminSetupModal();
    if (typeof showToast === 'function') {
      showToast('⌚ Saat bağlantısı bu hesaptan kaldırıldı.');
    }
  };

  window.saveAndTestGarminSetupFromModal = async function () {
    const uid = getActiveUidSafe();
    if (!uid) return;
    const trInput = document.getElementById('garminModalTredictInput');
    const icuInput = document.getElementById('garminModalIntervalsInput');
    const gwInput = document.getElementById('garminModalGatewayInput');
    const saveBtn = document.getElementById('garminSetupSaveBtn');

    const enteredTr = String(trInput?.value || '').trim();
    const enteredIcu = String(icuInput?.value || '').trim();
    const tredictToken = enteredTr || getUserTredictToken(uid);
    const intervalsToken = enteredIcu || getUserIntervalsToken(uid);
    const rawGw = String(gwInput?.value || '').trim();

    if (!tredictToken && !intervalsToken) {
      setGarminSetupStatus('Lütfen en az bir saat bağlantı anahtarı girin.', 'err');
      return;
    }
    if (rawGw && !/^https:\/\//i.test(rawGw)) {
      setGarminSetupStatus('Özel bulut adresi https:// ile başlamalıdır.', 'err');
      return;
    }
    const gatewayBase = normalizeGatewayBase(rawGw);

    if (saveBtn) saveBtn.disabled = true;
    setGarminSetupStatus('Bağlantı test ediliyor...', 'info');

    try {
      const res = await fetchGarminBridge('/api/tredict/health', {
        uid,
        tredictToken,
        intervalsToken,
        gatewayBase
      });
      const data = await res.json();
      if (!data || !data.ok) {
        setGarminSetupStatus('Saat anahtarı doğrulanamadı.', 'err');
        return;
      }
      writeWatchVault(uid, {
        enabled: true,
        tredictToken,
        intervalsToken,
        gatewayBase
      }, true);
      if (trInput) trInput.value = '';
      if (icuInput) icuInput.value = '';

      setGarminSetupStatus('Saat bağlantısı doğrulandı ve merkez kasaya kilitlendi.', 'ok');
      refreshGarminPanelsForUserState();
      setTimeout(syncActiveSchedulesOnBoot, 200);
      setTimeout(syncGarminActivitiesSilent, 400);
      setTimeout(() => window.closeGarminSetupModal(), 800);
    } catch (err) {
      const code = err && (err.code || err.message);
      if (code === 'WATCH_AUTH_FAILED') {
        setGarminSetupStatus('Anahtar reddedildi. Lütfen saat anahtarınızı kontrol edin.', 'err');
      } else {
        writeWatchVault(uid, {
          enabled: true,
          tredictToken,
          intervalsToken,
          gatewayBase
        }, true);
        if (trInput) trInput.value = '';
        if (icuInput) icuInput.value = '';
        refreshGarminPanelsForUserState();
        setGarminSetupStatus('Anahtar merkez kasaya kaydedildi, ancak saat geçidine şu an ulaşılamıyor.', 'warn');
      }
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  };

  function renderProfileGarminBridgeCard() {
    const profileTab = document.getElementById('profileTab');
    if (!profileTab) return;

    let card = document.getElementById('garminProfileBridgeCard');
    const u = getCurrentUserObj();
    if (!u || !u.id) {
      if (card) card.remove();
      return;
    }

    if (!card) {
      card = document.createElement('div');
      card.id = 'garminProfileBridgeCard';
      card.style.marginTop = '14px';
      profileTab.appendChild(card);
    }

    const enabled = isGarminEnabledForCurrentUser();
    const hasCreds = hasGarminCredentialsConfigured(u.id);
    const badgeBg = enabled && hasCreds ? '#DCFCE7' : (hasCreds ? '#F1F5F9' : '#FEF3C7');
    const badgeColor = enabled && hasCreds ? '#15803D' : (hasCreds ? '#334155' : '#B45309');
    const badgeText = enabled && hasCreds ? 'Açık' : (hasCreds ? 'Kapalı' : 'Kurulum Gerekli');

    card.innerHTML = `
      <div style="background:#FFFFFF;border:1px solid #CBD5E1;border-radius:10px;padding:10px 14px;color:#0F172A;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          <strong style="font-size:13.5px;color:#0F172A;">⌚ Saat Bağlantısı:</strong>
          <span style="background:${badgeBg};color:${badgeColor};border-radius:999px;padding:2px 8px;font-size:11.5px;font-weight:800;">${badgeText}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" onclick="window.openGarminSetupModal()" style="background:#0F172A;color:#FFFFFF;border:none;border-radius:6px;padding:6px 11px;font-size:12px;font-weight:700;cursor:pointer;">
            ${hasCreds ? 'Ayarlar' : 'Saat Bağla'}
          </button>
          ${hasCreds ? `
            <button type="button" onclick="window.toggleGarminIntegrationForUser(${!enabled})" style="background:#F1F5F9;color:#334155;border:1px solid #CBD5E1;border-radius:6px;padding:5px 11px;font-size:12px;font-weight:700;cursor:pointer;">
              ${enabled ? 'Kapat' : 'Aç'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  function syncActiveSchedulesOnBoot() {
    if (!isGarminEnabledForCurrentUser() || !hasGarminCredentialsConfigured()) return;
    try {
      const uid = getActiveUidSafe();
      const outboxKey = getScopedGarminKey(OUTBOX_PLANS_KEY);
      const outbox = JSON.parse(localStorage.getItem(outboxKey) || '[]');
      if (Array.isArray(outbox) && outbox.length > 0 && outbox[0] && outbox[0].planPayload) {
        pushPayloadToGarminSilent(outbox[0].planPayload, outbox[0].intervalsEvents || [], outbox[0].sig || '');
      }

      const now = new Date();
      let dateSched = {};
      let weekSched = {};
      try { dateSched = JSON.parse(localStorage.getItem(`celik_kodu_date_schedule_${uid}`) || '{}') || {}; } catch {}
      try { weekSched = JSON.parse(localStorage.getItem(`celik_kodu_weekly_schedule_${uid}`) || '{}') || {}; } catch {}

      const multiDays = [];
      const intervalsEvents = [];

      for (let offset = 0; offset < 7; offset++) {
        const dObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12, 0, 0);
        const dStr = formatLocalIsoDate(dObj);
        const dayKey = String(dObj.getDay());
        const dNum = dObj.getDay() === 0 ? 7 : dObj.getDay();

        const ovEntry = dateSched[dStr] || null;
        const wkEntry = weekSched[dayKey] || null;
        const ovEx = ovEntry ? extractExercisesFromPlanEntry(ovEntry) : [];
        const wkEx = wkEntry ? extractExercisesFromPlanEntry(wkEntry) : [];
        const ovTs = Number(ovEntry?.updatedAt || ovEntry?.customWorkout?.updatedAt || ovEntry?.customWorkout?.createdAt || 0);
        const wkTs = Number(wkEntry?.updatedAt || wkEntry?.customWorkout?.updatedAt || wkEntry?.customWorkout?.createdAt || 0);

        let chosenTitle = '';
        let chosenEx = [];
        let chosenCardio = [];

        if (ovEx.length > 0 && (ovTs >= wkTs || wkEx.length === 0)) {
          chosenEx = ovEx;
          chosenTitle = ovEntry.title || (ovEntry.customWorkout && ovEntry.customWorkout.title) || `Çelik Kodu (${dStr})`;
          chosenCardio = Array.isArray(ovEntry.extraCardioSessions) ? ovEntry.extraCardioSessions : [];
        } else if (wkEx.length > 0 && !(ovEntry && ovEntry.rest && ovTs > wkTs)) {
          chosenEx = wkEx;
          chosenTitle = wkEntry.title || (wkEntry.customWorkout && wkEntry.customWorkout.title) || `Çelik Kodu Gün ${dNum}`;
          chosenCardio = Array.isArray(wkEntry.extraCardioSessions) ? wkEntry.extraCardioSessions : [];
        }

        if (chosenEx.length > 0 || chosenCardio.length > 0) {
          if (chosenEx.length > 0) {
            saveSentWorkoutManifest(chosenTitle, chosenEx, 'date_' + dStr);
            const ev = buildIntervalsWorkoutEvent(dStr, chosenTitle, chosenEx);
            if (ev) intervalsEvents.push(ev);
          }
          multiDays.push({
            dayNumber: multiDays.length + 1,
            calendarDate: dStr,
            dateKey: 'date_' + dStr,
            title: chosenTitle || `Çelik Kodu (${dStr})`,
            exercises: chosenEx,
            extraCardioSessions: chosenCardio,
            onlyCardioChanged: false
          });
        }
      }

      if (multiDays.length > 0) {
        const planTitle = multiDays.length === 1 ? multiDays[0].title : 'Çelik Kodu — Haftalık Antrenman Takvimi';
        const payload = buildTredictPlanPayload(planTitle, [], multiDays);
        pushPayloadToGarminSilent(payload, intervalsEvents);
      }
    } catch {}
  }

  function getStoredWellnessStepsMap() {
    if (!isGarminEnabledForCurrentUser()) return {};
    const map = { ...DEFAULT_GARMIN_WELLNESS_STEPS };
    try {
      const raw = localStorage.getItem(getScopedGarminKey(WELLNESS_STEPS_KEY));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([dt, val]) => {
            if (val && typeof val === 'object') {
              if (Number(val.steps) > 0 || !map[dt] || !map[dt].steps) {
                map[dt] = { ...(map[dt] || {}), ...val };
              }
            }
          });
        }
      }
    } catch {}
    return map;
  }

  async function syncGarminWellnessStepsSilent() {
    if (!isGarminEnabledForCurrentUser() || !hasGarminCredentialsConfigured()) return false;
    try {
      const res = await fetchGarminBridge('/api/tredict/wellness?days=21');
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.daily) && data.daily.length > 0) {
        const current = getStoredWellnessStepsMap();
        data.daily.forEach(d => {
          if (d && d.date) {
            current[d.date] = {
              date: d.date,
              steps: Number(d.steps || 0),
              floorsClimbed: Number(d.floorsClimbed || 0),
              restingHR: d.restingHR ? Number(d.restingHR) : (current[d.date]?.restingHR || null),
              sleepScore: d.sleepScore ? Number(d.sleepScore) : (current[d.date]?.sleepScore || null),
              syncedAt: '00:01_auto'
            };
          }
        });
        localStorage.setItem(getScopedGarminKey(WELLNESS_STEPS_KEY), JSON.stringify(current));
        const uid = getActiveUidSafe();
        if (uid && typeof window !== 'undefined' && typeof window.scheduleUserStateCloudSync === 'function') {
          try { window.scheduleUserStateCloudSync(uid); } catch {}
        }
        if (typeof window.refreshTopFitnessCardioScoreBars === 'function') {
          window.refreshTopFitnessCardioScoreBars();
        }
        if (typeof window.renderAnalytics === 'function') {
          const tab = document.getElementById('analyticsTab');
          if (tab && tab.classList.contains('active')) {
            window.renderAnalytics();
          }
        }
        return true;
      }
    } catch {}
    return false;
  }

  let midnightStepTimerId = null;
  function scheduleMidnight0001StepSync() {
    if (midnightStepTimerId) clearTimeout(midnightStepTimerId);
    const now = new Date();
    const next0001 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1, 5, 0);
    const delayMs = Math.max(15000, next0001.getTime() - now.getTime());
    midnightStepTimerId = setTimeout(async () => {
      await syncGarminWellnessStepsSilent();
      scheduleMidnight0001StepSync();
    }, delayMs);
  }

  function refreshGarminPanelsForUserState() {
    migrateLegacyGarminStorageToOwner();
    cleanupLegacyWatchButtons();
    handoffCompletedActivitiesToTabChiefs();
    renderHistoryGarminSyncPanel();
    renderAnalyticsGarminCoachPanel();
    renderProfileGarminBridgeCard();
    if (typeof window.refreshTopFitnessCardioScoreBars === 'function') {
      window.refreshTopFitnessCardioScoreBars();
    }
  }

  function refreshFromCentralVault(uidOverride) {
    const uid = uidOverride || getActiveUidSafe();
    if (!uid) return;
    const vault = readWatchVault(uid);
    if (vault && typeof vault.enabled === 'boolean') {
      try {
        localStorage.setItem(GARMIN_ENABLED_PREFIX + uid, vault.enabled ? 'true' : 'false');
      } catch {}
    }
    refreshGarminPanelsForUserState();
    if (isGarminEnabledForCurrentUser() && hasGarminCredentialsConfigured(uid)) {
      setTimeout(syncGarminWellnessStepsSilent, 50);
      setTimeout(syncGarminActivitiesSilent, 150);
    }
  }

  window.GarminTredictChief = {
    agent: 'garmin-tredict-guard',
    isGarminEnabledForCurrentUser,
    auditExerciseWithLibraryGuard,
    auditAllLibraryExercises,
    saveSentWorkoutManifest,
    getStoredActivities,
    analyzeActivityGroups,
    handoffCompletedActivitiesToTabChiefs,
    syncWatchTitlesFromWorkoutLogs,
    propagateWorkoutLogTitleToWatch,
    renderHistoryGarminSyncPanel,
    computePhysiologicalMetrics,
    getStoredWellnessStepsMap,
    syncGarminWellnessStepsSilent,
    syncGarminActivitiesSilent,
    refreshFromCentralVault,
    buildTredictPlanPayload,
    buildIntervalsWorkoutEvent
  };

  async function syncGarminActivitiesSilent() {
    if (!isGarminEnabledForCurrentUser() || !hasGarminCredentialsConfigured()) return false;
    try {
      const res = await fetchGarminBridge('/api/tredict/activities?days=30');
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.activities) && data.activities.length > 0) {
        const uid = getActiveUidSafe();
        const telemetryKey = getScopedGarminKey(TELEMETRY_STORAGE_KEY);
        const prevRaw = localStorage.getItem(telemetryKey) || '[]';
        let existingList = [];
        try {
          const parsed = JSON.parse(prevRaw);
          if (Array.isArray(parsed)) existingList = parsed;
        } catch {}

        const editedTitleMap = buildEditedWatchTitleIndex(null, uid);
        const combined = [];
        const addMergedActivity = (rawAct) => {
          if (!rawAct || !rawAct.id) return;
          const act = Object.assign({}, rawAct);
          const editedEntry = editedTitleMap.get(String(act.id));
          if (editedEntry && editedEntry.userEditedAt >= Number(act.userEditedAt || 0)) {
            act.title = editedEntry.title;
            act.userEditedAt = editedEntry.userEditedAt;
          }
          const dupIdx = combined.findIndex(item => areSameWatchSession(item, act));
          if (dupIdx === -1) {
            combined.push(act);
            return;
          }
          const prevItem = combined[dupIdx];
          const prevEd = Number(prevItem.userEditedAt || 0);
          const nextEd = Number(act.userEditedAt || 0);
          const prevRounds = Array.isArray(prevItem.rounds) ? prevItem.rounds.length : 0;
          const nextRounds = Array.isArray(act.rounds) ? act.rounds.length : 0;
          const prevSummary = (prevItem.summary && typeof prevItem.summary === 'object') ? prevItem.summary : {};
          const nextSummary = (act.summary && typeof act.summary === 'object') ? act.summary : {};
          const mergedSummary = {
            ...nextSummary,
            ...prevSummary,
            distance: Number(prevSummary.distance || nextSummary.distance || 0),
            calories: Number(prevSummary.calories || nextSummary.calories || 0),
            heartrate: Number(prevSummary.heartrate || nextSummary.heartrate || 0) || null,
            heartrateMax: Math.max(Number(prevSummary.heartrateMax || 0), Number(nextSummary.heartrateMax || 0)) || null,
            pace: Number(prevSummary.pace || nextSummary.pace || 0) || null,
            cadence: Number(prevSummary.cadence || nextSummary.cadence || 0) || null
          };
          const mergedObj = nextRounds > prevRounds
            ? { ...act, summary: mergedSummary }
            : { ...prevItem, summary: mergedSummary };
          if (editedEntry && editedEntry.userEditedAt >= Math.max(prevEd, nextEd)) {
            mergedObj.title = editedEntry.title;
            mergedObj.userEditedAt = editedEntry.userEditedAt;
          } else if (prevEd > nextEd) {
            mergedObj.title = prevItem.title || mergedObj.title;
            mergedObj.userEditedAt = prevEd;
          } else if (nextEd > prevEd) {
            mergedObj.title = act.title || mergedObj.title;
            mergedObj.userEditedAt = nextEd;
          } else if (act.title && !prevEd && !nextEd) {
            mergedObj.title = act.title;
          }
          combined[dupIdx] = mergedObj;
        };

        existingList.forEach(addMergedActivity);
        data.activities.forEach(addMergedActivity);
        combined.sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')));
        const nextList = combined.slice(0, 40);
        const nextRaw = JSON.stringify(nextList);

        localStorage.setItem(telemetryKey, nextRaw);
        handoffCompletedActivitiesToTabChiefs();
        renderHistoryGarminSyncPanel();
        renderAnalyticsGarminCoachPanel();
        if (uid && nextRaw !== prevRaw && typeof window !== 'undefined' && typeof window.scheduleUserStateCloudSync === 'function') {
          try { window.scheduleUserStateCloudSync(uid); } catch {}
        }
        return true;
      }
    } catch {}
    return false;
  }

  function initGarminTredictBridge() {
    migrateLegacyGarminStorageToOwner();
    installCalendarAutoSyncHook();
    refreshGarminPanelsForUserState();
    setTimeout(syncActiveSchedulesOnBoot, 600);
    setTimeout(syncGarminWellnessStepsSilent, 900);
    setTimeout(syncGarminActivitiesSilent, 1200);
    scheduleMidnight0001StepSync();
    window.addEventListener('focus', () => {
      if (isGarminEnabledForCurrentUser()) {
        syncActiveSchedulesOnBoot();
        syncGarminActivitiesSilent();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isGarminEnabledForCurrentUser()) {
        syncActiveSchedulesOnBoot();
        syncGarminActivitiesSilent();
      }
    });
    setInterval(() => {
      if (!isGarminEnabledForCurrentUser() || !hasGarminCredentialsConfigured()) return;
      try {
        const outbox = JSON.parse(localStorage.getItem(getScopedGarminKey(OUTBOX_PLANS_KEY)) || '[]');
        if (Array.isArray(outbox) && outbox.length > 0) {
          syncActiveSchedulesOnBoot();
        }
      } catch {}
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGarminTredictBridge);
  } else {
    initGarminTredictBridge();
  }
})();
