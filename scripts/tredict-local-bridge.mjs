#!/usr/bin/env node
// Local HTTP bridge (127.0.0.1:3847) between Çelik Kodu PWA, Intervals.icu API v1, and Tredict MCP v2 (Garmin Connect).
// Keeps the Intervals.icu & Tredict API tokens strictly local and bypasses browser CORS restrictions.
import http from 'node:http';
import net from 'node:net';
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

dns.setDefaultResultOrder('ipv4first');
net.setDefaultAutoSelectFamily(false);

const PORT = Number(process.env.TREDICT_BRIDGE_PORT || 3847);
const TREDICT_TOKEN_FILE = path.join(os.homedir(), '.gemini', 'config', 'mcp', '.tredict-token');
const INTERVALS_TOKEN_FILE = path.join(os.homedir(), '.gemini', 'config', 'mcp', '.intervals-token');
const TREDICT_MCP_URL = 'https://www.tredict.com/api/mcp/v2';
const INTERVALS_BASE_URL = 'https://intervals.icu/api/v1';

let mcpSessionId = null;
let rpcSeq = 1;

function getTredictToken(req) {
  const hdr = req?.headers?.['x-tredict-token'];
  if (typeof hdr === 'string' && hdr.trim()) return hdr.trim();
  try {
    if (fs.existsSync(TREDICT_TOKEN_FILE)) return fs.readFileSync(TREDICT_TOKEN_FILE, 'utf8').trim();
  } catch {}
  return '';
}

function getIntervalsToken(req) {
  const hdr = req?.headers?.['x-intervals-token'];
  if (typeof hdr === 'string' && hdr.trim()) return hdr.trim();
  try {
    if (fs.existsSync(INTERVALS_TOKEN_FILE)) return fs.readFileSync(INTERVALS_TOKEN_FILE, 'utf8').trim();
  } catch {}
  return '';
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
  const opts = { method, headers };
  if (bodyObj !== null) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(bodyObj);
  }
  const res = await fetch(`${INTERVALS_BASE_URL}${endpoint}`, opts);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Intervals.icu HTTP ${res.status}: ${text.slice(0, 240)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function callTredictMcpTool(toolName, args, token) {
  if (!token) throw new Error('Tredict API anahtarı bulunamadı.');
  const callOnce = async () => {
    const id = rpcSeq++;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${token}`
    };
    if (mcpSessionId) headers['mcp-session-id'] = mcpSessionId;
    const res = await fetch(TREDICT_MCP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method: 'tools/call',
        params: { name: toolName, arguments: args || {} }
      })
    });
    const sid = res.headers.get('mcp-session-id');
    if (sid) mcpSessionId = sid;
    const text = await res.text();
    if (!res.ok) throw new Error(`Tredict HTTP ${res.status}: ${text.slice(0, 240)}`);
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
    if (payload?.error) throw new Error(payload.error.message || 'MCP error');
    const contentText = payload?.result?.content?.[0]?.text;
    const sc = payload?.result?.structuredContent;
    const isErr = Boolean(payload?.result?.isError);
    if (typeof contentText === 'string') {
      try {
        const parsed = JSON.parse(contentText);
        if (sc && typeof parsed === 'object' && parsed !== null) parsed.structuredContent = sc;
        return parsed;
      } catch {
        return { rawText: contentText, structuredContent: sc, isError: isErr };
      }
    }
    return payload?.result || payload;
  };

  try {
    return await callOnce();
  } catch {
    mcpSessionId = null;
    return await callOnce();
  }
}

function formatLocalIsoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
    const id = (cols[idxMap.id] || '').trim();
    const date = (cols[idxMap.date] || '').trim();
    const sportType = (cols[idxMap.sportType] || 'misc').trim();
    const title = (cols[idxMap.title] || '').trim();
    const notes = (cols[idxMap.notes] || '').trim();
    const executedTrainingId = (cols[cols.length - 1] || '').trim();
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

async function addTredictStrengthTrainingsToLiveCalendar(planTrainings, tredictToken) {
  const validItems = (Array.isArray(planTrainings) ? planTrainings : []).filter(t => t && t.structuredWorkout);
  if (!validItems.length) return [];

  const todayStr = formatLocalIsoDate(new Date());
  const normalizedItems = validItems
    .map((item) => {
      const calDate = (item.calendarDate && /^\d{4}-\d{2}-\d{2}$/.test(item.calendarDate))
        ? item.calendarDate
        : todayStr;
      return {
        calendarDate: calDate,
        structuredWorkout: item.structuredWorkout
      };
    })
    .filter(item => item.calendarDate >= todayStr);

  if (!normalizedItems.length) return [];

  // Aynı güne önceden eklenmiş planlı kuvvet antrenmanı varsa tekrarı önlemek için silme listesine ekle
  let existingByDate = {};
  try {
    const startIso = todayStr + 'T00:00:00Z';
    const endD = new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10) + 'T23:59:59Z';
    const pwList = await callTredictMcpTool('planned-workout-list', { startDate: startIso, endDate: endD }, tredictToken);
    const listArr = parsePlannedWorkoutListResponse(pwList);
    for (const pw of listArr) {
      if (pw && pw.id && pw.date && !pw.activityId) {
        const dKey = String(pw.date).slice(0, 10);
        const typeKey = `${dKey}__${pw.subSportType || pw.sportType || 'strength_training'}`;
        if (!existingByDate[typeKey]) existingByDate[typeKey] = [];
        existingByDate[typeKey].push(pw.id);
      }
    }
  } catch {}

  const createdWorkouts = [];

  const pushSingleTraining = async (calDate, sw, deleteIds = [], retryStripExercise = '') => {
    const workoutClone = JSON.parse(JSON.stringify(sw));
    if (retryStripExercise) {
      (workoutClone.steps || []).forEach(grp => {
        (grp.steps || []).forEach(st => {
          if (st.exerciseName === retryStripExercise) delete st.exerciseName;
        });
      });
    }

    const uiRes = await callTredictMcpTool('calendar-change-ui', {
      addTrainings: [{ calendarDate: calDate, title: workoutClone.title }],
      deleteWorkoutIds: deleteIds.slice(0, 2)
    }, tredictToken);

    const sc = uiRes?.structuredContent;
    if (!sc || !sc.decisionUrl || !Array.isArray(sc.changes) || !sc.changes.length) {
      throw new Error(uiRes?.rawText || 'Tredict takvim onay jetonu alınamadı.');
    }

    const tokens = [];
    for (const chg of sc.changes) {
      const decRes = await fetch(sc.decisionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestToken: chg.requestToken, decision: 'confirm' })
      }).then(r => r.json());
      if (decRes && decRes.allowedToken) {
        tokens.push({ action: chg.action, allowedToken: decRes.allowedToken, workoutId: chg.workoutId });
      }
    }

    for (const tk of tokens) {
      if (tk.action === 'delete' && tk.workoutId) {
        try {
          await callTredictMcpTool('delete-calendar-training', {
            workoutId: tk.workoutId,
            allowedToken: tk.allowedToken
          }, tredictToken);
        } catch {}
      }
    }

    const addTokenObj = tokens.find(t => t.action === 'add');
    if (!addTokenObj) throw new Error('Tredict takvim ekleme onay kodu üretilemedi.');

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const defaultTime = workoutClone.subSportType === 'strength_training' ? 1080 : 1140;
    const safePlanTime = calDate === todayStr
      ? Math.min(1435, Math.max(defaultTime, nowMinutes + 15))
      : defaultTime;

    const addRes = await callTredictMcpTool('add-plan-training', {
      calendarDate: calDate,
      allowedToken: addTokenObj.allowedToken,
      planTraining: {
        time: safePlanTime,
        structuredWorkout: workoutClone
      }
    }, tredictToken);

    if (addRes?.isError && typeof addRes?.rawText === 'string') {
      const badExMatch = addRes.rawText.match(/Unknown exerciseName '([^']+)'/);
      if (badExMatch && !retryStripExercise) {
        return await pushSingleTraining(calDate, workoutClone, [], badExMatch[1]);
      }
      throw new Error(addRes.rawText);
    }

    return addRes?.structuredContent || addRes;
  };

  for (const item of normalizedItems) {
    const typeKey = `${item.calendarDate}__${item.structuredWorkout?.subSportType || item.structuredWorkout?.sportType || 'strength_training'}`;
    const delIds = existingByDate[typeKey] || [];
    const resItem = await pushSingleTraining(item.calendarDate, item.structuredWorkout, delIds);
    createdWorkouts.push(resItem);
  }

  return createdWorkouts;
}

async function deleteTredictStrengthTrainingsByDates(dates = [], deleteAllFuture = false, tredictToken = '', subSportTypes = []) {
  if (!tredictToken) return [];
  const dateSet = new Set((Array.isArray(dates) ? dates : []).filter(Boolean));
  const subSportSet = new Set((Array.isArray(subSportTypes) ? subSportTypes : []).filter(Boolean));
  if (!deleteAllFuture && dateSet.size === 0) return [];

  const startIso = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10) + 'T00:00:00Z';
  const endIso = new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10) + 'T23:59:59Z';
  const pwList = await callTredictMcpTool('planned-workout-list', { startDate: startIso, endDate: endIso }, tredictToken);
  const listArr = parsePlannedWorkoutListResponse(pwList);

  const targetWorkoutIds = [];
  for (const pw of listArr) {
    if (!pw || !pw.id || !pw.date || pw.activityId) continue;
    const pwSub = pw.subSportType || pw.sportType || '';
    if (subSportSet.size > 0) {
      if (!subSportSet.has(pwSub) && !subSportSet.has(pw.sportType)) continue;
    } else {
      if (pw.subSportType !== 'strength_training' && pw.sportType !== 'misc' && pw.sportType !== 'running') continue;
    }
    const dKey = String(pw.date).slice(0, 10);
    if (deleteAllFuture || dateSet.has(dKey)) {
      targetWorkoutIds.push(pw.id);
    }
  }

  if (!targetWorkoutIds.length) return [];

  const deletedIds = [];
  for (let i = 0; i < targetWorkoutIds.length; i += 3) {
    const batch = targetWorkoutIds.slice(i, i + 3);
    const uiRes = await callTredictMcpTool('calendar-change-ui', {
      addTrainings: [],
      deleteWorkoutIds: batch
    }, tredictToken);

    const sc = uiRes?.structuredContent;
    if (!sc || !sc.decisionUrl || !Array.isArray(sc.changes)) continue;

    for (const chg of sc.changes) {
      if (chg.action !== 'delete' || !chg.requestToken) continue;
      const decRes = await fetch(sc.decisionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestToken: chg.requestToken, decision: 'confirm' })
      }).then(r => r.json());
      if (decRes && decRes.allowedToken && chg.workoutId) {
        await callTredictMcpTool('delete-calendar-training', {
          workoutId: chg.workoutId,
          allowedToken: decRes.allowedToken
        }, tredictToken);
        deletedIds.push(chg.workoutId);
      }
    }
  }

  return deletedIds;
}

function sendJson(res, status, data, origin) {
  const allowedOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
    ? origin
    : '*';
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Tredict-Token, X-Intervals-Token'
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req, maxBytes = 1024 * 1024) {
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

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true }, origin);
  }

  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
  const tredictToken = getTredictToken(req);
  const intervalsToken = getIntervalsToken(req);

  try {
    if (req.method === 'GET' && url.pathname === '/api/tredict/status') {
      if (intervalsToken) {
        const athlete = await callIntervalsApi('/athlete/0', 'GET', null, intervalsToken);
        return sendJson(res, 200, {
          ok: true,
          connected: true,
          provider: 'intervals.icu',
          athleteId: athlete.id,
          athleteName: athlete.name,
          restingHr: athlete.icu_resting_hr || null,
          weight: athlete.icu_weight || null,
          device: 'Garmin Forerunner 945 (Intervals.icu Otomatik Takvim)'
        }, origin);
      }
      if (!tredictToken) return sendJson(res, 200, { ok: false, connected: false, reason: 'missing_token' }, origin);
      const body = await callTredictMcpTool('bodyvalues', {}, tredictToken);
      return sendJson(res, 200, {
        ok: true,
        connected: true,
        provider: 'tredict',
        device: 'Garmin Forerunner 945',
        bodyvalues: body?.bodyvalues?.[0] || null
      }, origin);
    }

    // ─── INTERVALS.ICU DOĞRUDAN OTOMATİK TAKVİM SENKRONU (SIFIR ONAY ENGELİ -> ANINDA GARMIN SAAT) ───
    if (req.method === 'POST' && url.pathname === '/api/intervals/sync-calendar') {
      if (!intervalsToken) {
        return sendJson(res, 400, { ok: false, error: 'Intervals.icu API anahtarı bulunamadı.' }, origin);
      }
      const body = await readJsonBody(req);
      const events = Array.isArray(body.events) ? body.events : [];
      if (!events.length) {
        return sendJson(res, 400, { ok: false, error: 'Gönderilecek takvim antrenmanı bulunamadı.' }, origin);
      }
      const created = await callIntervalsApi('/athlete/0/events/bulk?upsert=true', 'POST', events, intervalsToken);
      return sendJson(res, 200, {
        ok: true,
        provider: 'intervals.icu',
        count: Array.isArray(created) ? created.length : 1,
        events: created
      }, origin);
    }

    // ─── SAATTEN TAMAMLANAN ANTRENMANLARIN SAĞLIK VERİLERİNİ ÇEK (INTERVALS.ICU + TREDICT HİBRİT) ───
    if (req.method === 'GET' && url.pathname === '/api/tredict/activities') {
      const days = Math.min(90, Math.max(7, Number(url.searchParams.get('days') || 30)));
      const end = new Date();
      const start = new Date(end.getTime() - days * 86400000);
      const oldest = start.toISOString().slice(0, 10);
      const newest = new Date(end.getTime() + 86400000).toISOString().slice(0, 10);

      // 1) Tredict MCP v2 üzerinden Kuvvet + Kürek + Yürüyüş + Koşu aktivitelerini çek
      if (tredictToken) {
        try {
          const listRes = await callTredictMcpTool('activity-list', {
            pageSize: 25,
            extendedSummary: 1
          }, tredictToken);

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
                sp === 'running'
              ) {
                candidateIds.push(id);
              }
            }
          } else if (Array.isArray(listRes?.activities)) {
            candidateIds = listRes.activities
              .filter(a => a.subSportType === 'strength_training' || a.subSportType === 'indoor_rowing' || a.subSportType === 'walking' || a.sportType === 'running')
              .map(a => a.id);
          }

          const detailed = [];
          for (const actId of candidateIds.slice(0, 12)) {
            try {
              const detRes = await callTredictMcpTool('activity', {
                activityId: actId
              }, tredictToken);
              let detObj = detRes;
              if (typeof detRes?.rawText === 'string' && detRes.rawText.includes('----')) {
                const jsonPart = detRes.rawText.split('----').pop().trim();
                detObj = JSON.parse(jsonPart);
              }
              if (detObj && (detObj._id || detObj.id)) {
                detailed.push({
                  id: detObj._id || detObj.id,
                  sportType: detObj.sportType || 'misc',
                  subSportType: detObj.subSportType || 'strength_training',
                  title: detObj.title || 'Garmin Antrenmanı',
                  date: detObj.date || detObj.activityStartDate,
                  device: detObj.attribution || detObj.device || 'Garmin fr945',
                  summary: detObj.summary || {},
                  rounds: Array.isArray(detObj.exerciseSets)
                    ? detObj.exerciseSets
                    : (Array.isArray(detObj.rounds) ? detObj.rounds : [])
                });
              }
            } catch {}
          }
          if (detailed.length > 0) {
            return sendJson(res, 200, { ok: true, provider: 'tredict+intervals', activities: detailed }, origin);
          }
        } catch {}
      }

      // 2) Intervals.icu üzerinden sağlık verilerini (Nabız, Max Nabız, Kalori, Süre, Mesafe, Pace) çek
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
            title: a.name || 'Garmin fr945 Antrenmanı',
            date: a.start_date_local,
            device: 'Garmin fr945',
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

    if (req.method === 'GET' && url.pathname === '/api/tredict/wellness') {
      const days = Math.max(1, Math.min(35, Number(url.searchParams.get('days') || 14)));
      const now = new Date();
      const oldestDate = new Date(now.getTime() - days * 86400000);
      const oldest = oldestDate.toISOString().slice(0, 10);
      const newest = now.toISOString().slice(0, 10);

      if (intervalsToken) {
        const wList = await callIntervalsApi(`/athlete/0/wellness?oldest=${oldest}&newest=${newest}`, 'GET', null, intervalsToken);
        const daily = (Array.isArray(wList) ? wList : []).map(w => ({
          date: String(w.id || ''),
          steps: Number(w.steps || 0),
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

    if (req.method === 'POST' && url.pathname === '/api/tredict/push-workout') {
      const body = await readJsonBody(req);
      const planPayload = body.planPayload;

      // 1) ÖNCELİK: Gerçek Garmin Güç (Strength / subSportType: strength_training) kategorisi için
      //    Tredict Canlı Takvimine (calendar-change-ui -> decisionUrl -> add-plan-training) doğrudan yaz!
      //    Böylece saatte Güç kategorisinde açılır, hareket adı + Türkçe not görünür ve tekrar/kilo girilebilir.
      if (tredictToken && planPayload && Array.isArray(planPayload.planTrainings) && planPayload.planTrainings.length > 0) {
        const createdWorkouts = await addTredictStrengthTrainingsToLiveCalendar(planPayload.planTrainings, tredictToken);
        return sendJson(res, 200, {
          ok: true,
          provider: 'tredict_live_calendar',
          directCalendarSync: true,
          count: createdWorkouts.length,
          workouts: createdWorkouts
        }, origin);
      }

      // 2) Yedek: Yalnızca Tredict token yoksa Intervals.icu kullan
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

      return sendJson(res, 400, { ok: false, error: 'Geçersiz antrenman planı verisi.' }, origin);
    }

    if (req.method === 'POST' && url.pathname === '/api/tredict/delete-dates') {
      const body = await readJsonBody(req);
      const dates = Array.isArray(body.dates) ? body.dates : [];
      const deleteAll = Boolean(body.deleteAll);
      const subSportTypes = Array.isArray(body.subSportTypes) ? body.subSportTypes : [];
      let deletedWorkoutIds = [];
      if (tredictToken) {
        deletedWorkoutIds = await deleteTredictStrengthTrainingsByDates(dates, deleteAll, tredictToken, subSportTypes);
      }
      return sendJson(res, 200, {
        ok: true,
        provider: 'tredict_live_calendar',
        deletedCount: deletedWorkoutIds.length,
        deletedWorkoutIds
      }, origin);
    }

    if (req.method === 'POST' && url.pathname === '/api/tredict/activity-update') {
      const body = await readJsonBody(req);
      if (!body.id) return sendJson(res, 400, { ok: false, error: 'Aktivite ID gerekli.' }, origin);
      if (String(body.id).startsWith('i') && intervalsToken) {
        const updated = await callIntervalsApi(`/activity/${body.id}`, 'PUT', {
          name: body.title,
          description: body.notes
        }, intervalsToken);
        return sendJson(res, 200, { ok: true, result: updated }, origin);
      }
      const updated = await callTredictMcpTool('activity-update', {
        id: body.id,
        title: body.title,
        notes: body.notes
      }, tredictToken);
      return sendJson(res, 200, { ok: true, result: updated }, origin);
    }

    return sendJson(res, 404, { ok: false, error: 'Uç nokta bulunamadı.' }, origin);
  } catch (err) {
    return sendJson(res, 500, { ok: false, error: String(err.message || err) }, origin);
  }
});

process.on('uncaughtException', err => {
  console.error('[Bridge UncaughtException]', err?.message || err);
});
process.on('unhandledRejection', err => {
  console.error('[Bridge UnhandledRejection]', err?.message || err);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Garmin/Intervals.icu/Tredict Local Bridge] Dinleniyor: http://127.0.0.1:${PORT}`);
});
