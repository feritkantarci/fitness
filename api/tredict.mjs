// Stateless multi-user cloud gateway between Çelik Kodu PWA, Tredict MCP v2, and Intervals.icu API v1.
// Zero local files or shared mutable session state: every request carries its own user tokens & timezone offset.

import http from 'node:http';
import { fileURLToPath } from 'node:url';

const TREDICT_MCP_URL = 'https://www.tredict.com/api/mcp/v2';
const INTERVALS_BASE_URL = 'https://intervals.icu/api/v1';

const EXACT_ALLOWED_ORIGINS = new Set([
  'https://fitness.kantarci.io',
  'https://fitness-4f427.web.app',
  'https://fitness-4f427.firebaseapp.com'
]);

const LOCALHOST_ORIGIN_RE = /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?|(capacitor|ionic):\/\/localhost)$/i;
const VERCEL_PROJECT_ORIGIN_RE = /^https:\/\/celik-kodu(-[a-z0-9-]+)?\.vercel\.app$/i;

function isAllowedOrigin(origin) {
  if (!origin || typeof origin !== 'string') return false;
  return EXACT_ALLOWED_ORIGINS.has(origin) || LOCALHOST_ORIGIN_RE.test(origin) || VERCEL_PROJECT_ORIGIN_RE.test(origin);
}

function applyCorsHeaders(res, origin) {
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tredict-Token, X-Intervals-Token, X-Client-Tz-Offset, X-Gemini-Key');
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
}

function sendJson(res, status, data, origin) {
  applyCorsHeaders(res, origin);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function parseTzOffsetMinutes(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return -180;
  return Math.max(-840, Math.min(840, Math.round(n)));
}

function getClientNowParts(tzOffsetMinutes = -180) {
  const shifted = new Date(Date.now() - tzOffsetMinutes * 60000);
  const dateStr = shifted.toISOString().slice(0, 10);
  const minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  return { dateStr, minutes };
}

function addDaysToIsoDate(isoDate, deltaDays) {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1) + deltaDays * 86400000);
  return dt.toISOString().slice(0, 10);
}

function getHeader(req, name) {
  if (!req || !req.headers) return '';
  const direct = req.headers[name.toLowerCase()];
  if (Array.isArray(direct)) return String(direct[0] || '').trim();
  return typeof direct === 'string' ? direct.trim() : '';
}

async function readJsonBody(req, maxBytes = 1024 * 1024) {
  if (req && req.body !== undefined) {
    if (typeof req.body === 'object' && req.body !== null) return req.body;
    if (typeof req.body === 'string') {
      return req.body ? JSON.parse(req.body) : {};
    }
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('İstek boyutu sınırı aşıldı (max 1 MB).'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const str = Buffer.concat(chunks).toString('utf8');
        resolve(str ? JSON.parse(str) : {});
      } catch {
        reject(new Error('Geçersiz JSON gövdesi.'));
      }
    });
    req.on('error', reject);
  });
}

function getIntervalsAuthHeader(token) {
  return 'Basic ' + Buffer.from(`API_KEY:${token}`).toString('base64');
}

async function callIntervalsApi(endpoint, method = 'GET', bodyObj = null, token = '') {
  if (!token) throw new Error('Intervals.icu API anahtarı bulunamadı.');
  const headers = {
    'Authorization': getIntervalsAuthHeader(token),
    'Accept': 'application/json'
  };
  const opts = {
    method,
    headers,
    signal: AbortSignal.timeout(20000)
  };
  if (bodyObj !== null) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(bodyObj);
  }
  const res = await fetch(`${INTERVALS_BASE_URL}${endpoint}`, opts);
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`Intervals.icu HTTP ${res.status}: ${text.slice(0, 240)}`);
    err.statusCode = res.status;
    throw err;
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function unwrapMcpPayload(payload) {
  if (payload?.error) {
    const err = new Error(payload.error.message || 'Tredict MCP error');
    err.statusCode = 502;
    throw err;
  }
  const contentText = payload?.result?.content?.[0]?.text;
  const sc = payload?.result?.structuredContent;
  const isErr = Boolean(payload?.result?.isError);
  if (typeof contentText === 'string') {
    try {
      const parsed = JSON.parse(contentText);
      if (sc && typeof parsed === 'object' && parsed !== null) parsed.structuredContent = sc;
      if (isErr && parsed && typeof parsed === 'object') parsed.isError = true;
      return parsed;
    } catch {
      return { rawText: contentText, structuredContent: sc, isError: isErr };
    }
  }
  return payload?.result || payload;
}

function createTredictClient(token) {
  let sessionId = null;
  let rpcSeq = 1;

  const callOnce = async (toolName, args) => {
    const id = rpcSeq++;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${token}`
    };
    if (sessionId) headers['mcp-session-id'] = sessionId;
    const res = await fetch(TREDICT_MCP_URL, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: toolName, arguments: args || {} }
      })
    });
    const sid = res.headers.get('mcp-session-id');
    if (sid) sessionId = sid;
    const text = await res.text();
    if (!res.ok) {
      const err = new Error(`Tredict HTTP ${res.status}: ${text.slice(0, 240)}`);
      err.statusCode = res.status === 401 || res.status === 403 ? res.status : 502;
      throw err;
    }
    const ct = res.headers.get('content-type') || '';
    let payload;
    if (ct.includes('text/event-stream')) {
      const payloads = [];
      for (const line of text.split(/\r?\n/)) {
        if (line.startsWith('data:')) {
          const s = line.slice(5).trim();
          if (s) {
            try { payloads.push(JSON.parse(s)); } catch {}
          }
        }
      }
      payload = payloads.find(p => p.id === id) || payloads[payloads.length - 1];
    } else {
      payload = JSON.parse(text);
    }
    return unwrapMcpPayload(payload);
  };

  return {
    async callTool(toolName, args) {
      if (!token) throw new Error('Tredict API anahtarı bulunamadı.');
      try {
        return await callOnce(toolName, args);
      } catch (err) {
        if (err && (err.statusCode === 401 || err.statusCode === 403)) throw err;
        sessionId = null;
        return await callOnce(toolName, args);
      }
    }
  };
}

function parsePlannedWorkoutListResponse(pwList) {
  if (Array.isArray(pwList?.plannedWorkouts)) return pwList.plannedWorkouts;
  const rawText = typeof pwList?.rawText === 'string' ? pwList.rawText : '';
  if (!rawText.includes('----')) return [];
  const csvPart = rawText.split('----').pop().trim();
  const lines = csvPart.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const idxMap = {};
  headers.forEach((h, i) => { idxMap[h] = i; });
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const id = (cols[idxMap.id ?? 0] || '').trim();
    const date = (cols[idxMap.date ?? 1] || '').trim();
    const sportType = (cols[idxMap.sportType ?? 4] || 'misc').trim();
    const title = (cols[idxMap.title ?? 5] || '').trim();
    const notesStart = idxMap.notes ?? 6;
    const execIdx = idxMap.executedTrainingId;
    const notesEnd = (execIdx !== undefined && execIdx > notesStart) ? execIdx : cols.length;
    const notes = cols.slice(notesStart, notesEnd).join(',').trim();
    const executedTrainingId = execIdx !== undefined ? (cols[execIdx] || '').trim() : '';
    if (!id || !date) continue;
    const textBlob = `${title} ${notes}`;
    let subSportType = 'strength_training';
    if (/kürek|kurek|row|cond_indoor_row/i.test(textBlob)) {
      subSportType = 'indoor_rowing';
    } else if (/yürüyüş|yuruyus|walk|cond_walking/i.test(textBlob)) {
      subSportType = 'walking';
    } else if (sportType === 'running' || /koşu|kosu|run|treadmill|cond_running/i.test(textBlob)) {
      subSportType = 'treadmill';
    }
    results.push({
      id,
      date,
      sportType,
      subSportType,
      title,
      notes,
      activityId: executedTrainingId || null
    });
  }
  return results;
}

function unwrapMcpJsonEntity(resObj) {
  let obj = resObj;
  if (typeof resObj?.rawText === 'string' && resObj.rawText.includes('----')) {
    const jsonPart = resObj.rawText.split('----').pop().trim();
    try { obj = JSON.parse(jsonPart); } catch {}
  }
  if (obj?.structuredContent && typeof obj.structuredContent === 'object' && !obj._id && !obj.id) {
    return obj.structuredContent;
  }
  return obj;
}

function expandPlannedWorkoutActiveSteps(plannedObj) {
  const sw = plannedObj?.structuredWorkout || plannedObj?.planTraining?.structuredWorkout || plannedObj;
  const groups = Array.isArray(sw?.steps) ? sw.steps : [];
  const flat = [];
  const collectStep = (st, repsFallback = 1) => {
    if (!st || typeof st !== 'object') return;
    const isRepeat = st.type === 'WorkoutRepeatStep' || st.stepType === 'repeat';
    const hasChildSteps = Array.isArray(st.steps);
    if ((isRepeat || (hasChildSteps && !st.exerciseCategory && !st.note && !st.description)) && hasChildSteps) {
      const count = Math.max(1, Number(st.repeatValue || st.repetitions || repsFallback || 1));
      for (let r = 0; r < count; r++) {
        st.steps.forEach(inner => collectStep(inner, 1));
      }
      return;
    }
    const intensity = String(st.intensity || '').toUpperCase();
    if (intensity === 'REST' || st.stepType === 'rest' || st.stepType === 'recovery') return;
    const stepNote = String(st.description || st.note || '').trim();
    if (stepNote || st.exerciseCategory || st.exerciseName) {
      flat.push({
        note: stepNote,
        exerciseCategory: st.exerciseCategory ? String(st.exerciseCategory).toLowerCase() : null,
        exerciseName: st.exerciseName ? String(st.exerciseName).toLowerCase() : null,
        plannedReps: Number(st.durationValue || st.exerciseRepetitions || st.duration || 0) || null,
        plannedWeight: Number(st.weightValue || st.exerciseWeight || 0) || 0
      });
    }
  };
  groups.forEach(g => collectStep(g, 1));
  return flat;
}

function hydrateRoundsWithPlannedWorkout(rounds, plannedObj) {
  if (!Array.isArray(rounds) || rounds.length === 0 || !plannedObj) return rounds;
  const hasIdTags = rounds.some(r => /\[id:[a-z0-9_]+\]/i.test(String(r?.note || '')));
  if (hasIdTags) return rounds;
  const plannedSteps = expandPlannedWorkoutActiveSteps(plannedObj);
  if (!plannedSteps.length) return rounds;

  const activeIndices = [];
  rounds.forEach((r, idx) => {
    if (!r || typeof r !== 'object') return;
    if (r.setType === 'rest') return;
    if (r.setType === 'active' || r.exerciseCategory || r.repetitions || r.weight) {
      activeIndices.push(idx);
    }
  });
  if (!activeIndices.length) return rounds;

  const cloned = rounds.map(r => (r && typeof r === 'object' ? { ...r } : r));
  let pCursor = 0;
  activeIndices.forEach((roundIdx, aIdx) => {
    const r = cloned[roundIdx];
    const rName = r.exerciseName ? String(r.exerciseName).toLowerCase() : '';
    const rCat = r.exerciseCategory ? String(r.exerciseCategory).toLowerCase() : '';
    let mapped = null;

    if (rName) {
      for (let j = pCursor; j < plannedSteps.length; j++) {
        if (plannedSteps[j].exerciseName === rName) {
          mapped = plannedSteps[j];
          pCursor = j + 1;
          break;
        }
      }
    }
    if (!mapped && pCursor < plannedSteps.length && aIdx < plannedSteps.length) {
      const candidate = plannedSteps[aIdx];
      const isTinyTrailingTap = Number(r.duration || 0) < 4 && !r.repetitions && !r.weight;
      if (!isTinyTrailingTap && (!rName || !candidate.exerciseName || candidate.exerciseCategory === rCat)) {
        mapped = candidate;
        pCursor = Math.max(pCursor, aIdx + 1);
      }
    }

    if (mapped && mapped.note && !/\[id:[a-z0-9_]+\]/i.test(String(r.note || ''))) {
      r.note = mapped.note;
      if (!r.exerciseCategory && mapped.exerciseCategory) r.exerciseCategory = mapped.exerciseCategory;
      if (!r.exerciseName && mapped.exerciseName) r.exerciseName = mapped.exerciseName;
    }
  });
  return cloned;
}

async function confirmAndDeleteCalendarBatch(tredict, deleteIds) {
  const deleted = [];
  for (let i = 0; i < deleteIds.length; i += 3) {
    const batch = deleteIds.slice(i, i + 3);
    const uiRes = await tredict.callTool('calendar-change-ui', {
      addTrainings: [],
      deleteWorkoutIds: batch
    });
    const sc = uiRes?.structuredContent;
    if (!sc?.decisionUrl || !Array.isArray(sc.changes)) continue;
    for (const chg of sc.changes) {
      if (chg.action !== 'delete' || !chg.requestToken || !chg.workoutId) continue;
      const dec = await fetch(sc.decisionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ requestToken: chg.requestToken, decision: 'confirm' })
      }).then(r => r.json());
      if (dec?.allowedToken) {
        await tredict.callTool('delete-calendar-training', {
          workoutId: chg.workoutId,
          allowedToken: dec.allowedToken
        });
        deleted.push(chg.workoutId);
      }
    }
  }
  return deleted;
}

async function addTredictStrengthTrainingsToLiveCalendar(tredict, planTrainings, tzOffsetMinutes) {
  const validItems = (Array.isArray(planTrainings) ? planTrainings : []).filter(t => t && t.structuredWorkout);
  if (!validItems.length) return [];

  const { dateStr: todayStr, minutes: nowMinutes } = getClientNowParts(tzOffsetMinutes);
  const byDateAndType = new Map();
  for (const item of validItems) {
    const calDate = (item.calendarDate && /^\d{4}-\d{2}-\d{2}$/.test(item.calendarDate))
      ? item.calendarDate
      : todayStr;
    if (calDate < todayStr) continue;
    const subType = item.structuredWorkout?.subSportType || item.structuredWorkout?.sportType || 'strength_training';
    byDateAndType.set(`${calDate}__${subType}`, {
      calendarDate: calDate,
      structuredWorkout: item.structuredWorkout
    });
  }
  const normalizedItems = Array.from(byDateAndType.values());
  if (!normalizedItems.length) return [];

  const existingByDate = {};
  try {
    const startIso = todayStr + 'T00:00:00Z';
    const endD = addDaysToIsoDate(todayStr, 21) + 'T23:59:59Z';
    const pwList = await tredict.callTool('planned-workout-list', { startDate: startIso, endDate: endD });
    for (const pw of parsePlannedWorkoutListResponse(pwList)) {
      if (pw && pw.id && pw.date && !pw.activityId) {
        const dKey = String(pw.date).slice(0, 10);
        const typeKey = `${dKey}__${pw.subSportType || pw.sportType || 'strength_training'}`;
        if (!existingByDate[typeKey]) existingByDate[typeKey] = [];
        existingByDate[typeKey].push(pw.id);
      }
    }
  } catch {}

  const pushSingleTraining = async (calDate, sw, deleteIds = [], retryStripExercise = '') => {
    const workoutClone = JSON.parse(JSON.stringify(sw));
    if (retryStripExercise) {
      (workoutClone.steps || []).forEach(grp => {
        (grp.steps || []).forEach(st => {
          if (st.exerciseName === retryStripExercise) delete st.exerciseName;
        });
      });
    }

    if (deleteIds.length > 2) {
      try { await confirmAndDeleteCalendarBatch(tredict, deleteIds.slice(2)); } catch {}
    }

    const uiRes = await tredict.callTool('calendar-change-ui', {
      addTrainings: [{ calendarDate: calDate, title: workoutClone.title }],
      deleteWorkoutIds: deleteIds.slice(0, 2)
    });
    const sc = uiRes?.structuredContent;
    if (!sc || !sc.decisionUrl || !Array.isArray(sc.changes) || !sc.changes.length) {
      throw new Error(uiRes?.rawText || 'Tredict takvim onay jetonu alınamadı.');
    }

    const tokens = [];
    for (const chg of sc.changes) {
      const decRes = await fetch(sc.decisionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ requestToken: chg.requestToken, decision: 'confirm' })
      }).then(r => r.json());
      if (decRes?.allowedToken) {
        tokens.push({ action: chg.action, allowedToken: decRes.allowedToken, workoutId: chg.workoutId });
      }
    }

    for (const tk of tokens) {
      if (tk.action === 'delete' && tk.workoutId) {
        try {
          await tredict.callTool('delete-calendar-training', {
            workoutId: tk.workoutId,
            allowedToken: tk.allowedToken
          });
        } catch {}
      }
    }

    const addTokenObj = tokens.find(t => t.action === 'add');
    if (!addTokenObj) throw new Error('Tredict takvim ekleme onay kodu üretilemedi.');

    const defaultTime = workoutClone.subSportType === 'strength_training' ? 1080 : 1140;
    const safePlanTime = calDate === todayStr
      ? Math.min(1435, Math.max(defaultTime, nowMinutes + 15))
      : defaultTime;

    const addRes = await tredict.callTool('add-plan-training', {
      calendarDate: calDate,
      allowedToken: addTokenObj.allowedToken,
      planTraining: {
        time: safePlanTime,
        structuredWorkout: workoutClone
      }
    });

    if (addRes?.isError && typeof addRes?.rawText === 'string') {
      const badExMatch = addRes.rawText.match(/Unknown exerciseName '([^']+)'/);
      if (badExMatch && !retryStripExercise) {
        return await pushSingleTraining(calDate, workoutClone, [], badExMatch[1]);
      }
      throw new Error(addRes.rawText);
    }

    return addRes?.structuredContent || addRes;
  };

  const createdWorkouts = [];
  for (const item of normalizedItems) {
    const typeKey = `${item.calendarDate}__${item.structuredWorkout?.subSportType || item.structuredWorkout?.sportType || 'strength_training'}`;
    const delIds = existingByDate[typeKey] || [];
    const resItem = await pushSingleTraining(item.calendarDate, item.structuredWorkout, delIds);
    createdWorkouts.push(resItem);
  }
  return createdWorkouts;
}

async function deleteTredictStrengthTrainingsByDates(tredict, dates = [], deleteAllFuture = false, subSportTypes = [], tzOffsetMinutes = -180) {
  const { dateStr: todayStr } = getClientNowParts(tzOffsetMinutes);
  const startIso = todayStr + 'T00:00:00Z';
  const endIso = addDaysToIsoDate(todayStr, 28) + 'T23:59:59Z';
  const dateSet = new Set((dates || []).map(d => String(d).slice(0, 10)));
  const subTypeSet = new Set(Array.isArray(subSportTypes) ? subSportTypes.map(s => String(s).toLowerCase()) : []);

  const pwList = await tredict.callTool('planned-workout-list', { startDate: startIso, endDate: endIso });
  const targetWorkoutIds = [];
  for (const pw of parsePlannedWorkoutListResponse(pwList)) {
    if (!pw || !pw.id || !pw.date || pw.activityId) continue;
    const dKey = String(pw.date).slice(0, 10);
    const matchesDate = deleteAllFuture ? dKey >= todayStr : dateSet.has(dKey);
    const pwSub = String(pw.subSportType || 'strength_training').toLowerCase();
    const matchesSubType = subTypeSet.size === 0 || subTypeSet.has(pwSub);
    if (matchesDate && matchesSubType && dKey >= todayStr) {
      targetWorkoutIds.push(pw.id);
    }
  }
  if (!targetWorkoutIds.length) return [];
  return confirmAndDeleteCalendarBatch(tredict, targetWorkoutIds);
}

function resolveAction(req, url) {
  const qAction = url.searchParams.get('action');
  if (qAction) return qAction.replace(/^\/+|\/+$/g, '').toLowerCase();
  const path = url.pathname.replace(/^\/api\/tredict\/?/, '').replace(/^\/+|\/+$/g, '');
  if (!path || path === 'status') return 'health';
  return path.toLowerCase();
}

function parseFirestoreDocValue(val) {
  if (!val || typeof val !== 'object') return null;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('stringValue' in val) return String(val.stringValue);
  if ('timestampValue' in val) return String(val.timestampValue);
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseFirestoreDocValue);
  if ('mapValue' in val) {
    const out = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      out[k] = parseFirestoreDocValue(v);
    }
    return out;
  }
  return null;
}

function unsealSystemVaultKeyServer(sealed) {
  const raw = String(sealed || '').trim();
  if (!raw) return '';
  if (!raw.startsWith('v1:')) return raw;
  const xBytes = Array.from(Buffer.from(raw.slice(3), 'base64'));
  const kBytes = Array.from(Buffer.from('fitness-4f427:celik-kodu-sys-vault-v1', 'utf8'));
  const pBytes = xBytes.map((b, idx) => (b ^ kBytes[idx % kBytes.length] ^ ((idx * 31 + 17) & 0xFF)) & 0xFF);
  return Buffer.from(pBytes).toString('utf8');
}

async function fetchCentralMasterCatalogFromFirestore() {
  const res = await fetch('https://firestore.googleapis.com/v1/projects/fitness-4f427/databases/(default)/documents/app_system/master_catalog');
  if (!res.ok) {
    const err = new Error(`Firestore master_catalog HTTP ${res.status}`);
    err.statusCode = res.status;
    throw err;
  }
  const doc = await res.json();
  const fields = doc?.fields || {};
  const parsed = {};
  for (const [k, v] of Object.entries(fields)) {
    parsed[k] = parseFirestoreDocValue(v);
  }
  return {
    version: Number(parsed.version || 0),
    updatedAt: Number(parsed.updatedAt || 0),
    exerciseCount: Number(parsed.exerciseCount || 0),
    totalCatalogIds: Number(parsed.totalCatalogIds || 0),
    opengymCount: Number(parsed.opengymCount || 0),
    guideCount: Number(parsed.guideCount || 0),
    exercises: parsed.exercisesJson ? JSON.parse(parsed.exercisesJson) : [],
    opengymCatalog: parsed.opengymCatalogJson ? JSON.parse(parsed.opengymCatalogJson) : {},
    exerciseGuideMap: parsed.exerciseGuideMapJson ? JSON.parse(parsed.exerciseGuideMapJson) : {}
  };
}

async function resolveCentralGeminiApiKey(req) {
  const headerKey = getHeader(req, 'x-gemini-key');
  if (headerKey) return headerKey;
  if (process.env.GEMINI_API_KEY) return String(process.env.GEMINI_API_KEY).trim();
  const res = await fetch('https://firestore.googleapis.com/v1/projects/fitness-4f427/databases/(default)/documents/app_system/ai_config');
  if (!res.ok) return '';
  const doc = await res.json();
  const sealed = doc?.fields?.sealedAiKey?.stringValue || '';
  const plain = doc?.fields?.geminiApiKey?.stringValue || '';
  return (sealed ? unsealSystemVaultKeyServer(sealed) : plain).trim();
}

export default async function handler(req, res) {
  const origin = getHeader(req, 'origin');
  if (origin && !isAllowedOrigin(origin)) {
    return sendJson(res, 403, { ok: false, error: 'Origin not allowed' }, origin);
  }
  if (req.method === 'OPTIONS') {
    applyCorsHeaders(res, origin);
    res.statusCode = 204;
    return res.end();
  }

  const host = getHeader(req, 'host') || 'celik-kodu.vercel.app';
  const url = new URL(req.url || '/', `https://${host}`);
  const action = resolveAction(req, url);

  if (req.method === 'GET' && action === 'master-catalog') {
    try {
      const catalog = await fetchCentralMasterCatalogFromFirestore();
      applyCorsHeaders(res, origin);
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ ok: true, ...catalog }));
    } catch (err) {
      return sendJson(res, Number(err?.statusCode) || 502, { ok: false, error: String(err?.message || err) }, origin);
    }
  }

  if (req.method === 'POST' && action === 'ai-generate') {
    try {
      const body = await readJsonBody(req);
      const prompt = String(body?.prompt || '').trim();
      const systemInstruction = String(body?.systemInstruction || '').trim();
      const maxTokens = Math.min(8192, Math.max(64, Number(body?.maxTokens || 3500)));
      if (!prompt) return sendJson(res, 400, { ok: false, error: 'Prompt gerekli.' }, origin);
      const apiKey = await resolveCentralGeminiApiKey(req);
      if (!apiKey) return sendJson(res, 503, { ok: false, error: 'Merkez AI anahtarı tanımlı değil.' }, origin);

      const candidateModels = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview', 'gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let lastErr = 'Gemini yanıt üretemedi.';
      for (const model of candidateModels) {
        const gUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const gBody = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: maxTokens }
        };
        if (systemInstruction) {
          gBody.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        const gResp = await fetch(gUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gBody)
        });
        if (!gResp.ok) {
          const errJson = await gResp.json().catch(() => ({}));
          lastErr = errJson?.error?.message || `Gemini HTTP ${gResp.status}`;
          if (gResp.status === 401 || gResp.status === 403) {
            return sendJson(res, gResp.status, { ok: false, error: lastErr }, origin);
          }
          continue;
        }
        const gData = await gResp.json();
        const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          return sendJson(res, 200, { ok: true, text, model, source: 'central_ai_bridge' }, origin);
        }
      }
      return sendJson(res, 502, { ok: false, error: lastErr }, origin);
    } catch (err) {
      return sendJson(res, 500, { ok: false, error: String(err?.message || err) }, origin);
    }
  }

  const tredictToken = getHeader(req, 'x-tredict-token');
  const intervalsToken = getHeader(req, 'x-intervals-token');
  const tzOffsetMinutes = parseTzOffsetMinutes(getHeader(req, 'x-client-tz-offset'));

  if (!tredictToken && !intervalsToken) {
    return sendJson(res, 401, {
      ok: false,
      connected: false,
      reason: 'missing_token',
      error: 'Kullanıcı saat anahtarı eksik (X-Tredict-Token veya X-Intervals-Token).'
    }, origin);
  }

  const tredict = tredictToken ? createTredictClient(tredictToken) : null;

  try {
    if (req.method === 'GET' && action === 'health') {
      if (tredict) {
        const body = await tredict.callTool('bodyvalues', {});
        return sendJson(res, 200, {
          ok: true,
          connected: true,
          provider: 'tredict',
          device: 'Garmin Watch',
          bodyvalues: body?.bodyvalues?.[0] || null
        }, origin);
      }
      const athlete = await callIntervalsApi('/athlete/0', 'GET', null, intervalsToken);
      return sendJson(res, 200, {
        ok: true,
        connected: true,
        provider: 'intervals.icu',
        athleteId: athlete.id,
        athleteName: athlete.name,
        restingHr: athlete.icu_resting_hr || null,
        weight: athlete.icu_weight || null,
        device: 'Garmin Watch (Intervals.icu)'
      }, origin);
    }

    if (req.method === 'GET' && action === 'activities') {
      const days = Math.min(90, Math.max(7, Number(url.searchParams.get('days') || 30)));
      const { dateStr: todayStr } = getClientNowParts(tzOffsetMinutes);
      const oldest = addDaysToIsoDate(todayStr, -days);
      const newest = addDaysToIsoDate(todayStr, 1);

      if (tredict) {
        const listRes = await tredict.callTool('activity-list', { pageSize: 25, extendedSummary: 1 });
        let candidateIds = [];
        const rawCsvText = typeof listRes?.rawText === 'string' ? listRes.rawText : '';
        if (rawCsvText.includes('----')) {
          const csvPart = rawCsvText.split('----').pop().trim();
          const lines = csvPart.split(/\r?\n/).filter(Boolean);
          const headers = (lines[0] || '').split(',').map(h => h.trim());
          const idIdx = headers.indexOf('id');
          const sportIdx = headers.indexOf('sportType');
          const subIdx = headers.indexOf('subSportType');
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            const id = cols[idIdx];
            const sp = cols[sportIdx];
            const sub = cols[subIdx];
            if (!id) continue;
            if (
              sub === 'strength_training' ||
              sub === 'indoor_rowing' ||
              sub === 'rowing' ||
              sub === 'walking' ||
              sub === 'hiking' ||
              sub === 'casual_walking' ||
              sub === 'speed_walking' ||
              sp === 'walking' ||
              sp === 'hiking' ||
              sp === 'running'
            ) {
              candidateIds.push(id);
            }
          }
        } else if (Array.isArray(listRes?.activities)) {
          candidateIds = listRes.activities
            .filter(a => (
              a.subSportType === 'strength_training' ||
              a.subSportType === 'indoor_rowing' ||
              a.subSportType === 'rowing' ||
              a.subSportType === 'walking' ||
              a.subSportType === 'hiking' ||
              a.subSportType === 'casual_walking' ||
              a.subSportType === 'speed_walking' ||
              a.sportType === 'walking' ||
              a.sportType === 'hiking' ||
              a.sportType === 'running'
            ))
            .map(a => a.id);
        }

        const plannedIdByExecutedId = {};
        try {
          const pwListRes = await tredict.callTool('planned-workout-list', {
            startDate: oldest + 'T00:00:00Z',
            endDate: newest + 'T23:59:59Z'
          });
          for (const pw of parsePlannedWorkoutListResponse(pwListRes)) {
            if (pw && pw.id && pw.activityId) {
              plannedIdByExecutedId[pw.activityId] = pw.id;
            }
          }
        } catch {}

        const detailed = [];
        for (const actId of candidateIds.slice(0, 12)) {
          try {
            const detRes = await tredict.callTool('activity', { activityId: actId });
            const detObj = unwrapMcpJsonEntity(detRes);
            if (!detObj || (!detObj._id && !detObj.id)) continue;

            const canonicalId = detObj._id || detObj.id;
            const resolvedPlannedId = detObj.plannedWorkoutId || plannedIdByExecutedId[canonicalId] || null;

            let rounds = Array.isArray(detObj.exerciseSets)
              ? detObj.exerciseSets
              : (Array.isArray(detObj.rounds) ? detObj.rounds : []);
            const hasIdTags = rounds.some(r => /\[id:[a-z0-9_]+\]/i.test(String(r?.note || '')));

            if (!hasIdTags && resolvedPlannedId) {
              try {
                const pwRes = await tredict.callTool('planned-workout', { workoutId: resolvedPlannedId });
                const plannedObj = unwrapMcpJsonEntity(pwRes);
                rounds = hydrateRoundsWithPlannedWorkout(rounds, plannedObj);
              } catch {}
            }

            const rawSp = String(detObj.sportType || 'misc').toLowerCase();
            const rawSub = String(detObj.subSportType || '').toLowerCase();
            const normSub = (rawSp === 'walking' || rawSp === 'hiking' || /walking|hiking/.test(rawSub))
              ? 'walking'
              : (detObj.subSportType || 'strength_training');

            detailed.push({
              id: canonicalId,
              plannedWorkoutId: resolvedPlannedId,
              sportType: detObj.sportType || 'misc',
              subSportType: normSub,
              title: detObj.title || 'Garmin Antrenmanı',
              date: detObj.date || detObj.activityStartDate,
              device: detObj.attribution || detObj.device || 'Garmin Watch',
              summary: detObj.summary || {},
              rounds
            });
          } catch {}
        }

        if (detailed.length > 0 || !intervalsToken) {
          return sendJson(res, 200, { ok: true, provider: 'tredict', activities: detailed }, origin);
        }
      }

      if (intervalsToken) {
        const icuList = await callIntervalsApi(`/athlete/0/activities?oldest=${oldest}&newest=${newest}`, 'GET', null, intervalsToken);
        const supportedTypes = new Set(['WeightTraining', 'Workout', 'Crossfit', 'Other', 'Run', 'VirtualRun', 'Treadmill', 'Walk', 'Hike', 'Rowing', 'IndoorRowing']);
        const strengthActs = (Array.isArray(icuList) ? icuList : [])
          .filter(a => supportedTypes.has(a.type))
          .slice(0, 12)
          .map(a => ({
            id: String(a.id),
            pairedEventId: a.paired_event_id ? String(a.paired_event_id) : null,
            sportType: /run|treadmill/i.test(a.type) ? 'running' : 'misc',
            subSportType: /row/i.test(a.type)
              ? 'indoor_rowing'
              : (/walk|hike/i.test(a.type) ? 'walking' : (/run|treadmill/i.test(a.type) ? 'treadmill' : 'strength_training')),
            title: a.name || 'Garmin Antrenmanı',
            date: a.start_date_local,
            device: 'Garmin Watch',
            summary: {
              durationTotal: a.elapsed_time || a.moving_time || 1800,
              duration: a.moving_time || a.elapsed_time || 1800,
              durationSets: a.moving_time || 900,
              durationRest: Math.max(0, (a.elapsed_time || 1800) - (a.moving_time || 900)),
              calories: a.calories || 0,
              heartrate: a.average_heartrate || 122,
              heartrateMax: a.max_heartrate || 150,
              distance: a.distance || null,
              cadence: a.average_cadence || null,
              power: a.average_watts || null,
              trainingLoad: a.icu_training_load || null,
              restingHr: a.icu_resting_hr || null
            },
            rounds: []
          }));
        return sendJson(res, 200, { ok: true, provider: 'intervals.icu', activities: strengthActs }, origin);
      }

      return sendJson(res, 200, { ok: true, activities: [] }, origin);
    }

    if (req.method === 'GET' && action === 'wellness') {
      const days = Math.max(1, Math.min(35, Number(url.searchParams.get('days') || 14)));
      const { dateStr: newest } = getClientNowParts(tzOffsetMinutes);
      const oldest = addDaysToIsoDate(newest, -days);
      if (intervalsToken) {
        const wList = await callIntervalsApi(`/athlete/0/wellness?oldest=${oldest}&newest=${newest}`, 'GET', null, intervalsToken);
        const daily = (Array.isArray(wList) ? wList : []).map(w => ({
          date: String(w.id || ''),
          steps: w.steps != null ? Number(w.steps) : null,
          floorsClimbed: Number(w.floorsClimbed || 0),
          restingHR: w.restingHR ? Number(w.restingHR) : null,
          sleepScore: w.sleepScore ? Number(w.sleepScore) : null,
          sleepSecs: w.sleepSecs ? Number(w.sleepSecs) : null,
          updated: w.updated || null
        })).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d.date));
        return sendJson(res, 200, { ok: true, provider: 'intervals.icu', daily }, origin);
      }
      return sendJson(res, 200, { ok: true, daily: [] }, origin);
    }

    if (req.method === 'POST' && action === 'push-workout') {
      const body = await readJsonBody(req);
      const planPayload = body.planPayload;
      if (tredict && Array.isArray(planPayload?.planTrainings) && planPayload.planTrainings.length > 0) {
        const createdWorkouts = await addTredictStrengthTrainingsToLiveCalendar(tredict, planPayload.planTrainings, tzOffsetMinutes);
        return sendJson(res, 200, {
          ok: true,
          provider: 'tredict_live_calendar',
          directCalendarSync: true,
          count: createdWorkouts.length,
          workouts: createdWorkouts
        }, origin);
      }
      if (intervalsToken && Array.isArray(body.intervalsEvents) && body.intervalsEvents.length > 0) {
        const created = await callIntervalsApi('/athlete/0/events/bulk?upsert=true', 'POST', body.intervalsEvents, intervalsToken);
        return sendJson(res, 200, {
          ok: true,
          provider: 'intervals.icu',
          directCalendarSync: true,
          count: Array.isArray(created) ? created.length : 1,
          events: created
        }, origin);
      }
      return sendJson(res, 400, { ok: false, error: 'Geçersiz antrenman planı veya eksik Tredict anahtarı.' }, origin);
    }

    if (req.method === 'POST' && action === 'delete-dates') {
      if (!tredict) {
        return sendJson(res, 401, { ok: false, reason: 'missing_token', error: 'Tredict anahtarı gerekli.' }, origin);
      }
      const body = await readJsonBody(req);
      const dates = Array.isArray(body.dates) ? body.dates : [];
      const deleteAll = Boolean(body.deleteAll);
      const subSportTypes = Array.isArray(body.subSportTypes) ? body.subSportTypes : [];
      const deletedWorkoutIds = await deleteTredictStrengthTrainingsByDates(tredict, dates, deleteAll, subSportTypes, tzOffsetMinutes);
      return sendJson(res, 200, {
        ok: true,
        provider: 'tredict_live_calendar',
        deletedCount: deletedWorkoutIds.length,
        deletedWorkoutIds
      }, origin);
    }

    if (req.method === 'POST' && action === 'activity-update') {
      const body = await readJsonBody(req);
      const actId = body.id || body.activityId;
      if (!actId) return sendJson(res, 400, { ok: false, error: 'Aktivite ID gerekli.' }, origin);
      if (String(actId).startsWith('i') && intervalsToken) {
        const updated = await callIntervalsApi(`/activity/${actId}`, 'PUT', {
          name: body.title,
          description: body.notes
        }, intervalsToken);
        return sendJson(res, 200, { ok: true, result: updated }, origin);
      }
      if (!tredict) {
        return sendJson(res, 401, { ok: false, reason: 'missing_token', error: 'Tredict anahtarı gerekli.' }, origin);
      }
      const updated = await tredict.callTool('activity-update', {
        id: actId,
        activityId: actId,
        title: body.title,
        notes: body.notes
      });
      return sendJson(res, 200, { ok: true, result: updated }, origin);
    }

    return sendJson(res, 404, { ok: false, error: `Desteklenmeyen yol: ${action}` }, origin);
  } catch (err) {
    const status = Number(err?.statusCode) || 500;
    return sendJson(res, status >= 400 && status < 600 ? status : 500, {
      ok: false,
      error: String(err?.message || err)
    }, origin);
  }
}

const isExecutedDirectly = (() => {
  try {
    return Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
})();

if (isExecutedDirectly) {
  const port = Number(process.env.PORT || 3848);
  const server = http.createServer((req, res) => {
    handler(req, res).catch(err => {
      if (!res.headersSent) {
        sendJson(res, 500, { ok: false, error: String(err?.message || err) }, getHeader(req, 'origin'));
      }
    });
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`[celik-kodu-tredict-gateway] listening on http://127.0.0.1:${port}`);
  });
}
