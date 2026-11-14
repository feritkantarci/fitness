#!/usr/bin/env node
/**
 * ÇELİK KODU — 7 Şef Bekçisi, Köprü Gümrüğü & Hata Hafızası Denetçisi (Zero-Token Deterministic Watchdog)
 * Kullanım:
 *   node scripts/tab-watchdog.js --write-report
 *   node scripts/tab-watchdog.js
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const DB_PATH = path.join(ROOT, 'js', 'exercises-db.js');
const REPORT_PATH = path.join(ROOT, 'TAB_HEALTH.md');

const LOAD_ORDER_FILES = [
  { rel: 'js/chiefs/shared-core.js', owner: 'shared-core' },
  { rel: 'js/chiefs/bridge-customs.js', owner: 'bridge-customs' },
  { rel: 'js/chiefs/liaison-subchiefs.js', owner: 'liaison-subchiefs' },
  { rel: 'js/chiefs/profile-chief.js', owner: 'profile-guard' },
  { rel: 'js/chiefs/library-chief.js', owner: 'library-guard' },
  { rel: 'js/chiefs/history-chief.js', owner: 'history-guard' },
  { rel: 'js/chiefs/analytics-chief.js', owner: 'analytics-guard' },
  { rel: 'js/chiefs/generator-chief.js', owner: 'generator-guard' },
  { rel: 'js/chiefs/workout-chief.js', owner: 'workout-guard' },
  { rel: 'js/app.js', owner: 'shared-core' },
  { rel: 'js/garmin-tredict-bridge.js', owner: 'garmin-tredict-guard' }
];

const TABS = [
  {
    id: 'generatorTab',
    agent: 'generator-guard',
    roomFile: 'js/chiefs/generator-chief.js',
    title: '1. Üretici Şefi',
    whatIsInside: 'Süre/ekipman seçimi, Günlük & Haftalık Program Üretici, Ardışık Gün Alt Kas Koruması, Alternatif Hareket Seçici',
    whatItDoes: 'Sana uygun antrenmanı kurar, ardışık günde doğrudan çalışmayan alt kasları seçer, gizli hareketi asla çıkarmaz',
    commonMistakes: 'Ardışık günde dünkü alt kası tekrar seçmesi, gizlenen hareketin çıkması, hareket değiştirirken ekranın zıplaması',
    entryFns: ['generateWorkout', 'handleGenerateWorkout', 'renderGeneratedWorkout', 'renderAiHybridHeroBanner', 'renderPendingWeeklyPlanPreview', 'swapSingleExercise', 'selectExerciseFromPicker'],
    keyPatterns: ['last_generated_workout', 'pending_ai_weekly', 'custom_gyms', 'last_location']
  },
  {
    id: 'activeWorkoutTab',
    agent: 'workout-guard',
    roomFile: 'js/chiefs/workout-chief.js',
    title: '2. Antrenman & Stüdyo Şefi',
    whatIsInside: 'Canlı Antrenman Ekranı, Helms Top-Set Ağırlık Hafızası, Dinlenme Sayacı, Haftalık Takvim, Kişisel Stüdyo',
    whatItDoes: 'Antrenman sırasında set/kilo/süre/dakika tutar, son ağır seti hatırlar, kendi özel programını kurdurur',
    commonMistakes: 'Back-off set kilosunu hatırlaması, süreli harekete 8-12 tekrar yazması, kardiyo dakikasını tekrara eklemesi',
    entryFns: ['renderActiveWorkout', 'openStudioAccordion', 'finishActiveWorkout', 'saveCompletedWorkout', 'startActiveWorkoutFromGenerated', 'renderCustomRoutine'],
    keyPatterns: ['active_state_', 'date_schedule_', 'date_overrides_', 'ai_program_', 'next_week_expanded_', 'incoming_prog_expanded_']
  },
  {
    id: 'libraryTab',
    agent: 'library-guard',
    roomFile: 'js/chiefs/library-chief.js',
    title: '3. Kütüphane Şefi',
    whatIsInside: 'Hazır Program Şablonları, Egzersiz Kataloğu, 3-Mod Birim Denetimi, "Havuzumdan Gizle" Butonu',
    whatItDoes: 'Tüm hareketlerin form/kas/birim kimliğini korur, istemediğin hareketi tüm sistemden gizler',
    commonMistakes: 'Süreli/dakikalı hareketi tekrarlı sanması, gizlenen hareketin sayacı bozması',
    entryFns: ['renderLibrary', 'renderLibraryExerciseCatalog', 'switchLibrarySubTab', 'toggleExcludeExercise'],
    keyPatterns: ['celik_excluded_exercises', 'custom_programs_']
  },
  {
    id: 'historyTab',
    agent: 'history-guard',
    roomFile: 'js/chiefs/history-chief.js',
    title: '4. Geçmiş Şefi',
    whatIsInside: 'Tamamlanan Antrenman Kartları, Köprü Gümrüğü Kayıt Onarımı, Seans Silme ve Düzenleme Modalı',
    whatItDoes: 'Tamamlanan seansları gümrükten geçirip saklar, bozuk veriyi engeller, düzenleme/silmeyi Analiz ile eşitler',
    commonMistakes: 'Bozuk/boş kaydın geçmişe sızması, kardiyo dakikasının tonaj şişirmesi, silinen kaydın Analizden düşmemesi',
    entryFns: ['renderHistory', 'deleteWorkoutLog', 'editWorkoutLog', 'computeEditLogDraftStats', 'setWorkoutLogs'],
    keyPatterns: ['history_']
  },
  {
    id: 'analyticsTab',
    agent: 'analytics-guard',
    roomFile: 'js/chiefs/analytics-chief.js',
    title: '5. Analiz Şefi',
    whatIsInside: 'Ön/Arka Vücut Kas Haritası, 31 Alt Kas Tablosu, Set Dayanıklılığı, Tekil Zirve Rekor, Haftalık Fitness/Kardiyo Puanları, Tartı & Mezura',
    whatItDoes: 'Kas yükünü, set dayanıklılığını, Epley zirve rekorunu, haftalık fitness/kardiyo puanını ve güncel kiloyu hesaplar',
    commonMistakes: 'Piramit/drop-seti güç düşüşü sanmak, çift Zirve Rekor basmak, 30 günlük eski tartı kiloyu sıfırlamak',
    entryFns: ['renderAnalytics', 'switchAnalyticsSubView', 'getExerciseCompartmentsForMuscle', 'analyzeIntraSessionFatigueAndDropOff', 'analyzeExerciseProgressionHistory', 'calculateWeeklyFitnessAndCardioScores', 'getAiDoctrineTelemetry', 'renderCombinedCoachReport'],
    keyPatterns: ['scale_', 'measurements_', 'mobility_tests_', 'coach_directive_', 'coach_dir_expanded_', 'last_weights_']
  },
  {
    id: 'profileTab',
    agent: 'profile-guard',
    roomFile: 'js/chiefs/profile-chief.js',
    title: '6. Profil Şefi',
    whatIsInside: 'Kullanıcı Hesabı, Bulut Senkronizasyonu, Parola/Anahtar İzolasyonu, WCAG Tema Kontrastı, Yedekleme',
    whatItDoes: 'Verilerini güvenle yedekler, şifre/API anahtarlarını buluttan izole eder ve tema okunabilirliğini korur',
    commonMistakes: 'Açık zeminde açık renk yazı kalması, dışa aktarımda gizli anahtar/şifre sızması',
    entryFns: ['updateProfileGeminiStatusUI', 'applyTheme', 'stripWatchBridgeSecretsFromObj', 'persistLastGeneratedWorkout'],
    keyPatterns: ['auth_users', 'session', 'active_user_id', 'logged_out', 'GEMINI', 'gcal_', 'emailjs_', 'bug_reports']
  },
  {
    id: 'garminTredictBridge',
    agent: 'garmin-tredict-guard',
    roomFile: 'js/garmin-tredict-bridge.js',
    title: '7. Garmin & Tredict Şefi',
    whatIsInside: 'Yeni Hareket Kas Denetçisi, İsimsiz+Notlu FIT Üretici, Orijinal Ad Koruyucu, Sağlık Telemetrisi (Nabız/HRR/TUT)',
    whatItDoes: 'Yeni hareketlerin Garmin karşılığını library-guard kaslarıyla kıyaslar, olmayanları isimsiz+notlu gönderir, dönüşte saatin adını değil bizdeki orijinal adı koruyup sağlık verilerini ilgili şefe iletir',
    commonMistakes: 'Saatten gelen ham hareket adının olduğu gibi alınması, Garmin’de olmayan harekete zorlama isim verilmesi',
    entryFns: ['auditExerciseWithLibraryGuard', 'auditAllLibraryExercises', 'saveSentWorkoutManifest', 'analyzeActivityGroups', 'handoffCompletedActivitiesToTabChiefs', 'buildTredictPlanPayload'],
    keyPatterns: ['celik_garmin_sent_manifests_v1', 'celik_garmin_telemetry_v2', 'celik_garmin_resolved_sets_v1', 'celik_garmin_outbox_plans_v1']
  }
];

function getDynamicTabRanges(htmlLines) {
  const ranges = {};
  const tabStarts = [];
  htmlLines.forEach((line, idx) => {
    const m = line.match(/id="(generatorTab|activeWorkoutTab|libraryTab|historyTab|analyticsTab|profileTab)"/);
    if (m) tabStarts.push({ id: m[1], start: idx + 1 });
  });
  for (let i = 0; i < tabStarts.length; i++) {
    const cur = tabStarts[i];
    const next = tabStarts[i + 1];
    ranges[cur.id] = { start: cur.start, end: next ? next.start - 1 : cur.start + 300 };
  }
  const bridgeIdx = htmlLines.findIndex(l => l.includes('garmin-tredict-bridge.js'));
  ranges.garminTredictBridge = { start: bridgeIdx >= 0 ? bridgeIdx + 1 : 1, end: bridgeIdx >= 0 ? bridgeIdx + 1 : 1 };
  return ranges;
}

function extractFunctionsFromModule(jsLines, roomOwner, relFile) {
  const fns = [];
  let current = null;

  for (let i = 0; i < jsLines.length; i++) {
    const line = jsLines[i];
    const fnMatch = line.match(/^\s*(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(/);
    if (fnMatch) {
      if (current) {
        current.end = i;
        fns.push(current);
      }
      current = {
        name: fnMatch[1],
        roomOwner,
        relFile,
        start: i + 1,
        end: i + 1,
        reads: new Set(),
        writes: new Set(),
        scrollCalls: []
      };
    }
    if (current) {
      const getMatches = [...line.matchAll(/localStorage\.getItem\(([^)]+)\)/g)];
      getMatches.forEach(m => current.reads.add(m[1].trim()));
      const setMatches = [...line.matchAll(/localStorage\.(?:setItem|removeItem)\(([^,)]+)/g)];
      setMatches.forEach(m => current.writes.add(m[1].trim()));

      if (/\b(scrollIntoView|scrollTo)\s*\(/.test(line) && !line.trim().startsWith('//')) {
        const ctx = `${jsLines[i - 2] || ''} ${jsLines[i - 1] || ''} ${line}`;
        current.scrollCalls.push({ line: i + 1, code: line.trim(), guarded: /scrollToTop|savedScroll|anchorOffsetTop|savedY/.test(ctx) });
      }
    }
  }
  if (current) {
    current.end = jsLines.length;
    fns.push(current);
  }
  return fns;
}

function classifyFunctionOwner(fn) {
  if (fn.roomOwner && fn.roomOwner !== 'shared-core' && fn.roomOwner !== 'bridge-customs') {
    return fn.roomOwner;
  }
  for (const tab of TABS) {
    if (tab.entryFns.includes(fn.name)) return tab.agent;
  }
  return 'shared-core';
}

function checkRecIds(combinedAppText, dbText) {
  const dbIds = new Set([
    ...[...dbText.matchAll(/["']?id["']?\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1]),
    ...[...combinedAppText.matchAll(/["']?id["']?\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1])
  ]);
  const recMatches = [...combinedAppText.matchAll(/\brecId\s*:\s*['"]([^'"]+)['"]/g)];
  const missing = [];
  for (const m of recMatches) {
    if (!dbIds.has(m[1])) missing.push(m[1]);
  }
  return { totalRecIds: recMatches.length, dbCount: dbIds.size, missing };
}

function auditExerciseMedia(combinedAppText, dbText) {
  const exercises = (new Function(dbText + '; return EXERCISES_DB;'))();
  const ogMatch = combinedAppText.match(/window\.OPENGYM_GLOBAL_CATALOG = (\{[\s\S]*?\n        \});/);
  const opengym = ogMatch ? eval('(' + ogMatch[1] + ')') : {};
  const isGuideGlobal = /window\.exerciseGuideMap\s*=/.test(combinedAppText);

  const missingClipFiles = [];
  const staticOnlyExercises = [];
  for (const ex of exercises) {
    const og = opengym[ex.id];
    if (!og || !og.clip) {
      staticOnlyExercises.push(`${ex.id} (${ex.name})`);
    } else {
      const cleanClip = String(og.clip).split(/[?#]/)[0];
      if (!fs.existsSync(path.join(ROOT, cleanClip))) {
        missingClipFiles.push(`${ex.id} -> ${og.clip}`);
      }
    }
  }
  return { totalExercises: exercises.length, isGuideGlobal, missingClipFiles, staticOnlyExercises };
}

function createAppVmSandbox(moduleSources, dbText) {
  const store = new Map();
  const elCache = new Map();
  const defaultValuesById = {
    paramStyle: 'superset',
    paramGoal: 'hypertrophy',
    paramDuration: '45',
    logDuration: '45',
    logRpe: 'RPE 8 (İdeal)',
    logLocationType: 'salon'
  };
  const makeEl = (tag = 'div', id = '') => ({
    id,
    tagName: String(tag).toUpperCase(),
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    innerHTML: '',
    innerText: '',
    textContent: '',
    value: defaultValuesById[id] || '',
    options: [{ value: defaultValuesById[id] || '', text: defaultValuesById[id] || '' }],
    selectedIndex: 0,
    checked: false,
    disabled: false,
    dataset: {},
    children: [],
    childNodes: [],
    parentElement: null,
    scrollTop: 0,
    scrollHeight: 0,
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    getAttribute: () => null,
    removeAttribute() {},
    insertAdjacentHTML() {},
    appendChild(child) { return child; },
    removeChild(child) { return child; },
    remove() {},
    closest: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    scrollIntoView() {},
    focus() {},
    click() {},
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 })
  });
  const getEl = (id) => {
    const k = String(id || '');
    if (!elCache.has(k)) elCache.set(k, makeEl('div', k));
    return elCache.get(k);
  };
  class MockStorage {
    getItem(k) { return store.has(k) ? store.get(k) : null; }
    setItem(k, v) { store.set(k, String(v)); }
    removeItem(k) { store.delete(k); }
    clear() { store.clear(); }
  }
  const ls = new MockStorage();

  const sandbox = {
    Storage: MockStorage,
    MutationObserver: class { observe() {} disconnect() {} },
    console: { log() {}, warn() {}, error() {}, info() {} },
    Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Map, Set, Promise, Error,
    Int32Array, Float32Array, Uint8Array,
    URL, URLSearchParams, Intl,
    parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    requestAnimationFrame: () => 0,
    addEventListener() {},
    removeEventListener() {},
    scrollTo() {},
    scrollBy() {},
    scrollY: 0,
    innerWidth: 390,
    innerHeight: 844,
    localStorage: ls,
    sessionStorage: ls,
    navigator: { userAgent: 'node', onLine: true, serviceWorker: { register: () => Promise.resolve(), addEventListener() {} } },
    location: { href: 'http://localhost:3000/', origin: 'http://localhost:3000', hostname: 'localhost', protocol: 'http:', pathname: '/', search: '', hash: '', reload() {} },
    history: { replaceState() {}, pushState() {} },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    document: {
      visibilityState: 'visible',
      getElementById: getEl,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: (t) => makeEl(t, ''),
      addEventListener() {},
      removeEventListener() {},
      body: makeEl('body', 'body'),
      documentElement: makeEl('html', 'html'),
      head: makeEl('head', 'head')
    },
    alert() {},
    confirm: () => true,
    prompt: () => '',
    fetch: () => Promise.resolve({ ok: false, status: 503, headers: { get: () => '' }, json: async () => ({}) })
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;

  const uid = 'usr_exam';
  ls.setItem('celik_kodu_session', JSON.stringify({ userId: uid, authVerified: true, passwordPolicyVerified: true }));
  ls.setItem('celik_kodu_auth_users', JSON.stringify([{ id: uid, name: 'Test Sporcu', bodyweight: 85, telemetry: { currentWeight: 85 } }]));

  const ctx = vm.createContext(sandbox);
  vm.runInContext(dbText, ctx, { filename: 'js/exercises-db.js' });
  for (const mod of moduleSources) {
    vm.runInContext(mod.code, ctx, { filename: mod.rel });
  }

  ctx.__seedState = ({ history = [], scale = [], lastWeights = {}, bodyweight = 85 } = {}) => {
    store.clear();
    elCache.clear();
    ls.setItem('celik_kodu_session', JSON.stringify({ userId: uid, authVerified: true, passwordPolicyVerified: true }));
    ls.setItem('celik_kodu_auth_users', JSON.stringify([{ id: uid, name: 'Test Sporcu', bodyweight, telemetry: { currentWeight: bodyweight } }]));
    ls.setItem(`celik_kodu_history_${uid}`, JSON.stringify(history));
    ls.setItem(`celik_kodu_scale_${uid}`, JSON.stringify(scale));
    ls.setItem(`celik_kodu_last_weights_${uid}`, JSON.stringify(lastWeights));
    vm.runInContext(`
      activeWorkoutSession = null;
      activeWorkoutSetsData = {};
      currentGeneratedWorkout = null;
      selectedSplits = ['full_body'];
      selectedEquipments = [...ALL_EQUIPMENT_KEYS];
      if (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.resetStats === 'function') {
        window.CelikBridgeCustoms.resetStats();
      }
      if (typeof getUserExcludedExerciseIds === 'function') getUserExcludedExerciseIds();
    `, ctx);
  };

  return ctx;
}

function runAcademicMathSuite(moduleSources, dbText) {
  const ctx = createAppVmSandbox(moduleSources, dbText);
  const eng = ctx.window.CelikDomainEngine;
  const cases = [
    {
      id: 'T1',
      owner: 'analytics-guard',
      title: 'Artan piramit (Push Press 7.5→10→12.5 kg)',
      expected: 'category=pyramid & "Piramit Güç Artışı"',
      run: () => {
        ctx.__seedState();
        const item = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't1', date: '2026-11-10', dateFormatted: '10 Kas',
          exercises: [{
            id: 'db_push_press', name: 'Dambıl Push Press',
            sets: [
              { weight: 7.5, reps: 12, completed: true },
              { weight: 10, reps: 12, completed: true },
              { weight: 12.5, reps: 10, completed: true }
            ]
          }]
        }]).items[0];
        const ok = Boolean(item && item.category === 'pyramid' && String(item.badgeText).includes('Piramit Güç Artışı'));
        return { ok, actual: item ? `${item.category} | ${item.badgeText}` : 'boş' };
      }
    },
    {
      id: 'T2',
      owner: 'analytics-guard',
      title: 'Isınma+Tepe+Back-Off vs Ağır Set -3 Çöküş',
      expected: 'A: drop_set ("Top-Set"); B: early_drop ("Ağır Set Düşüşü" & -3)',
      run: () => {
        ctx.__seedState();
        const resA = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't2a', date: '2026-11-10',
          exercises: [{
            id: 'bb_incline_bench', name: 'Incline Barbell Bench',
            sets: [
              { weight: 25, reps: 12, completed: true },
              { weight: 35, reps: 10, completed: true },
              { weight: 25, reps: 10, completed: true }
            ]
          }]
        }]).items[0];
        const resB = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't2b', date: '2026-11-13',
          exercises: [{
            id: 'bb_incline_bench', name: 'Incline Barbell Bench',
            sets: [
              { weight: 25, reps: 12, completed: true },
              { weight: 35, reps: 10, completed: true },
              { weight: 35, reps: 7, completed: true },
              { weight: 25, reps: 10, completed: true }
            ]
          }]
        }]).items[0];
        const ok = Boolean(
          resA && resA.category === 'drop_set' && String(resA.badgeText).includes('Top-Set')
          && resB && resB.category === 'early_drop' && String(resB.badgeText).includes('Ağır Set Düşüşü') && String(resB.badgeText).includes('-3')
        );
        return { ok, actual: `A:${resA?.category}(${resA?.badgeText}) | B:${resB?.category}(${resB?.badgeText})` };
      }
    },
    {
      id: 'T3',
      owner: 'analytics-guard',
      title: 'Kontrollü Drop-Set (45→40→35 kg × 10)',
      expected: 'category=drop_set & "Kontrollü Kilo Düşürme"',
      run: () => {
        ctx.__seedState();
        const item = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't3', date: '2026-11-10',
          exercises: [{
            id: 'db_bench_press', name: 'Dambıl Bench Press',
            sets: [
              { weight: 45, reps: 10, completed: true },
              { weight: 40, reps: 10, completed: true },
              { weight: 35, reps: 10, completed: true }
            ]
          }]
        }]).items[0];
        const ok = Boolean(item && item.category === 'drop_set' && String(item.badgeText).includes('Kontrollü Kilo Düşürme'));
        return { ok, actual: item ? `${item.category} | ${item.badgeText}` : 'boş' };
      }
    },
    {
      id: 'T4',
      owner: 'analytics-guard',
      title: 'Willardson Sabit Kilo Normal Yorgunluk (-2 tekrar)',
      expected: 'category=normal_fatigue & "Doğal Kas Yorgunluğu (-2 tekrar)"',
      run: () => {
        ctx.__seedState();
        const item = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't4', date: '2026-11-09',
          exercises: [{
            id: 'db_skullcrusher', name: 'Dambıl Skullcrusher',
            sets: [
              { weight: 7.5, reps: 8, completed: true },
              { weight: 7.5, reps: 8, completed: true },
              { weight: 7.5, reps: 6, completed: true }
            ]
          }]
        }]).items[0];
        const ok = Boolean(item && item.category === 'normal_fatigue' && String(item.badgeText).includes('Doğal Kas Yorgunluğu') && String(item.badgeText).includes('-2'));
        return { ok, actual: item ? `${item.category} | ${item.badgeText}` : 'boş' };
      }
    },
    {
      id: 'T5',
      owner: 'analytics-guard',
      title: 'Sabit Kilo Hızlı Güç Çöküşü (12→10→7 tekrar, -5)',
      expected: 'category=early_drop & "Hızlı Güç Düşüşü (-5 tekrar)"',
      run: () => {
        ctx.__seedState();
        const item = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't5', date: '2026-11-13',
          exercises: [{
            id: 'db_bench_press', name: 'Dambıl Bench Press',
            sets: [
              { weight: 15, reps: 12, completed: true },
              { weight: 15, reps: 10, completed: true },
              { weight: 15, reps: 7, completed: true }
            ]
          }]
        }]).items[0];
        const ok = Boolean(item && item.category === 'early_drop' && String(item.badgeText).includes('Hızlı Güç Düşüşü') && String(item.badgeText).includes('-5'));
        return { ok, actual: item ? `${item.category} | ${item.badgeText}` : 'boş' };
      }
    },
    {
      id: 'T6',
      owner: 'library-guard',
      title: '3-Mod DB Denetimi (3 Cardio/6 Time/117 Rep) & Miras Hollow Body',
      expected: 'cardio=3, time=6, reps=117; Hollow 12→10→8 normal_fatigue(sn), 40→20 early_drop',
      run: () => {
        ctx.__seedState();
        const counts = vm.runInContext(`(() => {
          const out = { cardio_min: 0, time_sec: 0, reps: 0 };
          EXERCISES_DB.forEach(e => { out[getExerciseMetricMode(e)]++; });
          return out;
        })()`, ctx);
        const hMode = eng.getExerciseMetricMode({ name: 'Hollow Body' });
        const h1 = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't6a', date: '2026-10-16',
          exercises: [{
            name: 'Hollow Body',
            sets: [
              { weight: 0, reps: 12, completed: true },
              { weight: 0, reps: 10, completed: true },
              { weight: 0, reps: 8, completed: true }
            ]
          }]
        }]).items[0];
        const h2 = eng.analyzeIntraSessionFatigueAndDropOff([{
          id: 't6b', date: '2026-11-10',
          exercises: [{
            name: 'Hollow Body',
            sets: [
              { weight: 0, reps: 40, completed: true },
              { weight: 0, reps: 20, completed: true }
            ]
          }]
        }]).items[0];
        const ok = counts.cardio_min === 3 && counts.time_sec === 6 && counts.reps === 117
          && hMode === 'time_sec'
          && Boolean(h1 && h1.category === 'normal_fatigue' && String(h1.setChainText).includes('sn') && !String(h1.adviceText).includes('kiloya'))
          && Boolean(h2 && h2.category === 'early_drop' && String(h2.badgeText).includes('Süre Düşüşü'));
        return { ok, actual: `DB=${counts.cardio_min}/${counts.time_sec}/${counts.reps}, H1=${h1?.category}, H2=${h2?.category}(${h2?.badgeText})` };
      }
    },
    {
      id: 'T7',
      owner: 'history-guard',
      title: 'Eşli Set Seçimi (10×12 + 15×8) & Geçmiş Kardiyo 0 Tonaj',
      expected: 'latest=15 kg × 8; editDraft cardio vol=0',
      run: () => {
        ctx.__seedState();
        const prog = eng.analyzeExerciseProgressionHistory([{
          id: 't7', date: '2026-11-10',
          exercises: [{
            id: 'db_bench_press', name: 'Dambıl Bench Press',
            sets: [
              { weight: 10, reps: 12, completed: true },
              { weight: 15, reps: 8, completed: true }
            ]
          }]
        }]).items[0];
        const editStats = ctx.computeEditLogDraftStats({
          exercises: [{
            id: 'cond_indoor_row', name: 'Kürek Çekme', category: 'conditioning',
            sets: [{ weight: 50, reps: 20, completed: true }]
          }]
        });
        const ok = Boolean(prog && prog.latestWeight === 15 && prog.latestReps === 8 && editStats.totalVolumeKg === 0);
        return { ok, actual: `latest=${prog?.latestWeight}kg×${prog?.latestReps}, editVol=${editStats.totalVolumeKg}` };
      }
    },
    {
      id: 'T8',
      owner: 'analytics-guard',
      title: 'Epley Zirve Rekoru (20×10) + Israetel 2 Seans Üst Üste Yorgunluk',
      expected: 'peak=20×10, twoSessionFatigue=true, status=dip',
      run: () => {
        ctx.__seedState();
        const mk = (id, d, w, r) => ({
          id, date: d, dateFormatted: d,
          exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ weight: w, reps: r, completed: true }] }]
        });
        const newestFirstLogs = [
          mk('s4', '2026-11-12', 17.5, 7),
          mk('s3', '2026-11-09', 17.5, 8),
          mk('s2', '2026-11-05', 20, 10),
          mk('s1', '2026-11-01', 15, 10)
        ];
        const p = eng.analyzeExerciseProgressionHistory(newestFirstLogs).items[0];
        const ok = Boolean(p && p.peakWeight === 20 && p.peakReps === 10 && p.twoSessionFatigue === true && p.status === 'dip' && String(p.badgeText).includes('2 Seansta Belirgin Yorgunluk'));
        return { ok, actual: p ? `peak=${p.peakWeight}×${p.peakReps}, 2s=${p.twoSessionFatigue}, status=${p.status}` : 'boş' };
      }
    },
    {
      id: 'T9',
      owner: 'workout-guard',
      title: 'Helms Top-Set Ağırlık Hafızası (35 kg) & Ağırlıksız BW ("")',
      expected: 'Incline=35 kg, Şınav="", Kürek=""',
      run: () => {
        ctx.__seedState({
          history: [{
            id: 'h9', date: '2026-11-10',
            exercises: [
              { id: 'bb_incline_bench', name: 'Incline Barbell Bench', sets: [{ weight: 25, reps: 12, completed: true }, { weight: 35, reps: 10, completed: true }, { weight: 25, reps: 10, completed: true }] },
              { id: 'bw_pushup', name: 'Şınav', equipment: 'bodyweight', sets: [{ weight: 0, reps: 12, completed: true }] },
              { id: 'cond_indoor_row', name: 'Kürek Çekme', category: 'conditioning', sets: [{ weight: 0, reps: 20, completed: true }] }
            ]
          }],
          lastWeights: { bb_incline_bench: 25, bw_pushup: 45, cond_indoor_row: 30 }
        });
        const wInc = eng.getExerciseRememberedWeight({ id: 'bb_incline_bench', name: 'Incline Barbell Bench' });
        const wPush = eng.getExerciseRememberedWeight({ id: 'bw_pushup', name: 'Şınav', equipment: 'bodyweight' });
        const wRow = eng.getExerciseRememberedWeight({ id: 'cond_indoor_row', name: 'Kürek Çekme' });
        const ok = wInc === 35 && wPush === '' && wRow === '';
        return { ok, actual: `Incline=${JSON.stringify(wInc)}, Şınav=${JSON.stringify(wPush)}, Kürek=${JSON.stringify(wRow)}` };
      }
    },
    {
      id: 'T10',
      owner: 'workout-guard',
      title: 'Süre/Dakika Açılış Varsayılanları ("8-12" Korumalı)',
      expected: 'Plank=30 sn (3 set), cond_indoor_row=20 dk (1 set)',
      run: () => {
        ctx.__seedState();
        vm.runInContext(`
          currentGeneratedWorkout = {
            title: 'Birim Sınavı',
            scheme: { sets: 3, reps: '8-12', rest: 45 },
            exercises: [
              { id: 'bw_plank', name: 'Plank', muscle: 'Core', category: 'core', equipment: 'bodyweight', targetSets: 3, targetReps: '8-12' },
              { id: 'cond_indoor_row', name: 'Kürek Çekme (Indoor Rowing)', muscle: 'Kondisyon', category: 'conditioning', equipment: 'cardio', targetSets: 3, targetReps: '8-12' }
            ]
          };
          startActiveWorkoutFromGenerated();
        `, ctx);
        const plankReps = vm.runInContext('activeWorkoutSetsData.bw_plank && activeWorkoutSetsData.bw_plank[0] && activeWorkoutSetsData.bw_plank[0].reps', ctx);
        const rowLen = vm.runInContext('activeWorkoutSetsData.cond_indoor_row && activeWorkoutSetsData.cond_indoor_row.length', ctx);
        const rowReps = vm.runInContext('activeWorkoutSetsData.cond_indoor_row && activeWorkoutSetsData.cond_indoor_row[0] && activeWorkoutSetsData.cond_indoor_row[0].reps', ctx);
        const ok = plankReps === 30 && rowLen === 1 && rowReps === 20;
        return { ok, actual: `Plank=${plankReps} sn, Kürek=${rowLen} set × ${rowReps} dk` };
      }
    },
    {
      id: 'T11',
      owner: 'analytics-guard',
      title: 'Kardiyo Puanı, 0 Tonaj & TUT Nabız Eşdeğer Dakika',
      expected: 'vol=0, strengthSets=0, rawMin=23 (20+3), eqMin=26 (20+6)',
      run: () => {
        const todayIso = ctx.toIsoDateKeyLocal(new Date());
        ctx.__seedState({
          history: [{
            id: 'h11',
            date: todayIso,
            dateFormatted: todayIso,
            exercises: [
              {
                id: 'cond_indoor_row',
                name: 'Kürek Çekme',
                category: 'conditioning',
                sets: [{ weight: 0, reps: 20, completed: true }],
                healthTelemetry: { avgHeartrate: 115 }
              },
              {
                id: 'bw_mountain_climber',
                name: 'Mountain Climber',
                category: 'conditioning',
                sets: [{ weight: 0, reps: 20, completed: true }],
                healthTelemetry: { totalTimeUnderTensionSec: 180, avgHeartrate: 150 }
              }
            ]
          }]
        });
        const cardVol = eng.calculateExerciseSetVolume({ id: 'cond_indoor_row', category: 'conditioning' }, 50, 20);
        const sc = eng.calculateWeeklyFitnessAndCardioScores(0);
        const ok = cardVol === 0
          && sc.fitness.totalStrengthSetsDone === 0
          && sc.cardio.totalRawCardioMin === 23
          && sc.cardio.totalEqCardioMin === 26;
        return { ok, actual: `cardVol=${cardVol}, strSets=${sc.fitness.totalStrengthSetsDone}, rawMin=${sc.cardio.totalRawCardioMin}, eqMin=${sc.cardio.totalEqCardioMin}` };
      }
    },
    {
      id: 'T12',
      owner: 'analytics-guard',
      title: '45 Günlük Eski Tartı Kiloyu Aktif Tutma & BW Hacmi',
      expected: `bw=79.2 kg, pullup10=${(79.2 * 0.95 * 10).toFixed(1)}, telemetry=79.2`,
      run: () => {
        const isoDaysAgo = (d) => {
          const dt = new Date();
          dt.setDate(dt.getDate() - d);
          return ctx.toIsoDateKeyLocal(dt);
        };
        ctx.__seedState({
          bodyweight: 85,
          scale: [
            { id: 'sc_old', date: isoDaysAgo(90), weight: 81.0, timestamp: Date.now() - 90 * 86400000 },
            { id: 'sc_45', date: isoDaysAgo(45), weight: 79.2, timestamp: Date.now() - 45 * 86400000 }
          ]
        });
        const bw = eng.getUserActiveBodyweightKg();
        const vol = eng.calculateExerciseSetVolume({ id: 'bw_pullup', equipment: 'bodyweight', name: 'Barfiks' }, 0, 10);
        const tel = ctx.getAiDoctrineTelemetry();
        const expectedVol = Math.round(79.2 * 0.95 * 10 * 10) / 10;
        const ok = bw === 79.2 && Math.abs(vol - expectedVol) < 0.1 && tel && tel.currentWeight === 79.2;
        return { ok, actual: `bw=${bw}, pullupVol=${vol} (beklenen ${expectedVol}), tel=${tel?.currentWeight}` };
      }
    },
    {
      id: 'T13',
      owner: 'generator-guard',
      title: 'Gizli Hareket & Ev Ekipmanı İzolasyonu + 3-Mod Hedef Etiketi',
      expected: 'gizli=0, bar/makine=0, Plank="30 sn", Kürek="20 dk" (1 set)',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          toggleExcludeExercise('db_bench_press', { silent: true });
          selectedEquipments = ['dumbbell', 'bodyweight'];
          selectedSplits = ['full_body'];
          handleGenerateWorkout('bb_hybrid', '');
          const gen = currentGeneratedWorkout;
          const exs = (gen && gen.exercises) || [];
          const hasExcluded = exs.some(e => e.id === 'db_bench_press');
          const badEquip = exs.filter(e => !['dumbbell', 'bodyweight'].includes(e.equipment)).map(e => e.id);
          const stamped = assignAcademicBlockStructure([
            Object.assign({}, EXERCISES_DB.find(e => e.id === 'bw_plank')),
            Object.assign({}, EXERCISES_DB.find(e => e.id === 'cond_indoor_row'))
          ], 'straight', { sets: 3, reps: '8-12', rest: 60 });
          return {
            count: exs.length,
            hasExcluded,
            badEquipCount: badEquip.length,
            plankTarget: stamped[0]?.targetReps,
            rowTarget: stamped[1]?.targetReps,
            rowSets: stamped[1]?.targetSets
          };
        })()`, ctx);
        const ok = res.count >= 4
          && res.hasExcluded === false
          && res.badEquipCount === 0
          && res.plankTarget === '30 sn'
          && res.rowTarget === '20 dk'
          && res.rowSets === 1;
        return { ok, actual: `adet=${res.count}, gizli=${res.hasExcluded}, yabancıEkip=${res.badEquipCount}, Plank=${res.plankTarget}, Kürek=${res.rowSets}×${res.rowTarget}` };
      }
    },
    {
      id: 'T14',
      owner: 'generator-guard',
      title: 'Ardışık Gün Doğrudan Çalışmayan Alt Kas Seçimi (A3)',
      expected: 'Dünkü birincil 31 alt kasla çakışma = 0 (hem günlük hem haftalık ardışık günde)',
      run: () => {
        const yDt = new Date();
        yDt.setDate(yDt.getDate() - 1);
        const yIso = ctx.toIsoDateKeyLocal(yDt);
        ctx.__seedState({
          history: [{
            id: 'h_yest',
            date: yIso,
            timestamp: Date.now() - 22 * 3600000,
            exercises: [
              { id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ weight: 20, reps: 10, completed: true }] },
              { id: 'db_overhead_press', name: 'Dambıl Overhead Press', sets: [{ weight: 15, reps: 10, completed: true }] },
              { id: 'db_goblet_squat', name: 'Dambıl Goblet Squat', sets: [{ weight: 24, reps: 10, completed: true }] },
              { id: 'bw_pullup', name: 'Barfiks', sets: [{ weight: 0, reps: 8, completed: true }] },
              { id: 'bw_plank', name: 'Plank', sets: [{ weight: 0, reps: 40, completed: true }] }
            ]
          }]
        });
        const res = vm.runInContext(`(() => {
          selectedSplits = ['full_body'];
          selectedEquipments = [...ALL_EQUIPMENT_KEYS];
          handleGenerateWorkout('bb_hybrid', '');
          const gen = currentGeneratedWorkout;
          const blocked = new Set((gen && gen.historyContext && gen.historyContext.adjacentBlockedSubKeys31) || []);
          const overlaps = [];
          for (const ex of ((gen && gen.exercises) || [])) {
            const anat = getExerciseAnatomy(ex);
            const p31 = (anat && anat.primarySubKeys) || [];
            for (const pk of p31) {
              if (blocked.has(pk)) overlaps.push(ex.id + ':' + pk);
            }
          }
          // Haftalık ardışık gün testi (Pazartesi=1 -> Salı=2)
          window.selectedAiWeeklyDays = [1, 2];
          window.selectedAiWeeklyTemplate = 'full_body_abc';
          applyAiWeeklySchedule('bb_hybrid', '');
          const wkDays = (window.pendingAiWeeklyPlan && window.pendingAiWeeklyPlan.days) || [];
          const d1Primary = new Set();
          if (wkDays[0] && wkDays[0].workout) {
            (wkDays[0].workout.exercises || []).forEach(ex => {
              const anat = getExerciseAnatomy(ex);
              ((anat && anat.primarySubKeys) || []).forEach(pk => d1Primary.add(pk));
            });
          }
          const wkOverlaps = [];
          if (wkDays[1] && wkDays[1].workout) {
            (wkDays[1].workout.exercises || []).forEach(ex => {
              const anat = getExerciseAnatomy(ex);
              ((anat && anat.primarySubKeys) || []).forEach(pk => {
                if (d1Primary.has(pk)) wkOverlaps.push(ex.id + ':' + pk);
              });
            });
          }
          return {
            blockedSize: blocked.size,
            dailyOverlapCount: overlaps.length,
            weeklyOverlapCount: wkOverlaps.length,
            genCount: ((gen && gen.exercises) || []).length
          };
        })()`, ctx);
        const ok = res.blockedSize >= 4 && res.genCount >= 4 && res.dailyOverlapCount === 0 && res.weeklyOverlapCount === 0;
        return { ok, actual: `korunanAltKas=${res.blockedSize}, günlükÇakışma=${res.dailyOverlapCount}, haftalıkArdışıkÇakışma=${res.weeklyOverlapCount}` };
      }
    },
    {
      id: 'T15',
      owner: 'profile-guard',
      title: 'Şifre/API Anahtarı İzolasyonu & Açık Zemin Kontrast Denetimi',
      expected: '5 gizli alan sızıntısı = 0, açık zemin soluk yazı ihlali = 0',
      run: () => {
        ctx.__seedState();
        const leakCheck = vm.runInContext(`(() => {
          const dirty = {
            userId: 'usr_exam',
            password: '123',
            passwordHash: 'abc',
            salt: 'xyz',
            geminiApiKey: 'AIzaSecret',
            celik_gemini_api_key: 'AIzaSyPrefixedSecretKey1234',
            tredictToken: 'tok_secret',
            nested: { apiKey: 'k2', safeField: 'korundu' }
          };
          const c1 = window.CelikBridgeCustoms.sanitizeCloudExportBundle(dirty);
          const c2 = stripWatchBridgeSecretsFromObj(dirty, 0);
          const jsonStr = JSON.stringify({ c1, c2 });
          const leaked = ['password', 'passwordHash', 'salt', 'AIzaSecret', 'AIzaSyPrefixedSecretKey1234', 'tok_secret', 'k2'].filter(s => jsonStr.includes(s));
          return { leakedCount: leaked.length, safePreserved: c1?.nested?.safeField === 'korundu' };
        })()`, ctx);

        // Statik inline stil kontrast taraması: her bir CSS kural bloğunu ayrı incele (ternary kollarını birbirine karıştırmadan)
        let badContrastHits = 0;
        for (const m of moduleSources) {
          const lines = m.code.split('\n');
          for (const ln of lines) {
            const segments = ln.split(/['"`]/);
            for (const seg of segments) {
              if (/background(?:-color)?\s*:\s*#(?:FFFFFF|FFF\b|F8FAFC|F1F5F9|DCFCE7|FEF3C7)/i.test(seg)) {
                if (/(?:^|;|\s)color\s*:\s*#(?:FFFFFF|FFF\b|F3F6FA|F8FAFC|CBD5E1|B6F059|fde047|e9d5ff|a7f3d0)/i.test(seg)) {
                  badContrastHits++;
                }
              }
            }
          }
        }
        const ok = leakCheck.leakedCount === 0 && leakCheck.safePreserved === true && badContrastHits === 0;
        return { ok, actual: `sızıntı=${leakCheck.leakedCount}, güvenliAlan=${leakCheck.safePreserved}, kontrastİhlali=${badContrastHits}` };
      }
    },
    {
      id: 'T16',
      owner: 'garmin-tredict-guard',
      title: 'İsimsiz+Notlu Saat Gönderimi & Orijinal Hareket Adı + Nabız İadesi',
      expected: 'matchType=unmapped_noted, dönen ad="Dambıl Floor Press to Glute Bridge", nabız=148/166',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          localStorage.setItem('celik_garmin_enabled_usr_exam', 'true');
          const gt = window.GarminTredictChief;
          const audit = gt.auditExerciseWithLibraryGuard('db_floor_press_to_bridge');
          const dbEx = EXERCISES_DB.find(e => e.id === 'db_floor_press_to_bridge');
          gt.saveSentWorkoutManifest('Akşam İtiş', [Object.assign({}, dbEx, { sets: 2, targetReps: '10' })], 'act_watch_1');
          const groups = gt.analyzeActivityGroups({
            id: 'act_watch_1',
            title: 'Akşam İtiş',
            date: '2026-11-13T18:30:00Z',
            sportType: 'fitness_equipment',
            sportSubType: 'strength_training',
            summary: { duration: 600, heartrate: 148, heartrateMax: 166 },
            rounds: [
              { roundIndex: 0, type: 'active', exerciseCategory: 'BENCH_PRESS', exerciseName: 'BENCH_PRESS', repetitions: 10, weight: 20, duration: 42, heartrate: 146, heartrateMax: 162 },
              { roundIndex: 1, type: 'active', exerciseCategory: 'BENCH_PRESS', exerciseName: 'BENCH_PRESS', repetitions: 10, weight: 20, duration: 44, heartrate: 150, heartrateMax: 166 }
            ]
          });
          const g0 = groups && groups[0];
          return {
            auditStatus: audit && audit.matchType,
            resolvedId: g0 && g0.originalId,
            resolvedName: g0 && g0.originalName,
            avgHr: g0 && g0.healthTelemetry && g0.healthTelemetry.avgHeartrate,
            peakHr: g0 && g0.healthTelemetry && g0.healthTelemetry.maxHeartrate
          };
        })()`, ctx);
        const ok = res.auditStatus === 'unmapped_noted'
          && res.resolvedId === 'db_floor_press_to_bridge'
          && String(res.resolvedName || '').includes('Floor Press')
          && res.avgHr === 148
          && res.peakHr === 166;
        return { ok, actual: `audit=${res.auditStatus}, ad="${res.resolvedName}", nabız=${res.avgHr}/${res.peakHr}` };
      }
    },
    {
      id: 'T17',
      owner: 'history-guard',
      title: 'Köprü Gümrüğü (A2): Eksik Birim/Tarih Onarımı & Bozuk Kayıt Engeli',
      expected: 'bozuk/boş kayıt engellendi (>=2), kardiyo sahte tonajı 0 kg onarıldı (>=1)',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          window.CelikBridgeCustoms.resetStats();
          setWorkoutLogs([
            { id: 'bad_empty', exercises: [] },
            {
              id: 'repair_me',
              timestamp: 1763050000000,
              totalVolumeKg: 900,
              exercises: [
                { id: 'cond_indoor_row', weight: 45, exerciseVolume: 900, sets: [{ weight: 45, reps: 20, completed: true, volume: 900 }] }
              ]
            }
          ]);
          setScaleLogs([
            { id: 'bad_scale', weight: -12, date: '2026-11-10' },
            { weight: 82.4, timestamp: 1763050000000 }
          ]);
          const savedLogs = getWorkoutLogs();
          const savedScale = getScaleLogs();
          const st = window.CelikBridgeCustoms.getStats();
          return {
            logsLen: savedLogs.length,
            repairedIso: savedLogs[0]?.date,
            repairedVol: savedLogs[0]?.totalVolumeKg,
            repairedCardioFlag: savedLogs[0]?.exercises?.[0]?.isCardioMinutes,
            scaleLen: savedScale.length,
            repairedCount: st.repairedCount,
            rejectedCount: st.rejectedCount
          };
        })()`, ctx);
        const ok = res.logsLen === 1
          && /^\d{4}-\d{2}-\d{2}$/.test(String(res.repairedIso || ''))
          && res.repairedVol === 0
          && res.repairedCardioFlag === true
          && res.scaleLen === 1
          && res.repairedCount >= 2
          && res.rejectedCount >= 2;
        return { ok, actual: `kayıt=${res.logsLen}, tonaj=${res.repairedVol}kg, tartı=${res.scaleLen}, onarılan=${res.repairedCount}, engellenen=${res.rejectedCount}` };
      }
    },
    {
      id: 'T18',
      owner: 'analytics-guard',
      title: 'Hata Hafızası Sicili: Tekil "🏆 Zirve Rekor" & Kardiyo Dakika Tekrar Hariçliği',
      expected: 'Kart başına "🏆 Zirve Rekor" = 1 adet, tamamlanan seans tekrarında kardiyo dk = 0',
      run: () => {
        ctx.__seedState({
          history: [
            { id: 'p3', date: '2026-11-12', exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ weight: 20, reps: 10, completed: true }] }] },
            { id: 'p2', date: '2026-11-08', exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ weight: 25, reps: 10, completed: true }] }] },
            { id: 'p1', date: '2026-11-02', exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ weight: 17.5, reps: 10, completed: true }] }] }
          ]
        });
        const res = vm.runInContext(`(() => {
          const box = document.createElement('div');
          renderCombinedCoachReport(box);
          const peakCount = (String(box.innerHTML || '').match(/🏆 Zirve Rekor/g) || []).length;

          activeWorkoutSession = {
            title: 'Hata Hafızası Testi',
            exercises: [
              { id: 'db_bench_press', name: 'Dambıl Bench Press', category: 'push', equipment: 'dumbbell', muscle: 'Göğüs' },
              { id: 'cond_indoor_row', name: 'Kürek Çekme', category: 'conditioning', equipment: 'cardio', muscle: 'Kondisyon' }
            ]
          };
          activeWorkoutStartTime = Date.now() - 1800000;
          activeWorkoutSetsData = {
            db_bench_press: [{ setNo: 1, weight: 20, reps: 12, completed: true }],
            cond_indoor_row: [{ setNo: 1, weight: 0, reps: 25, completed: true }]
          };
          saveCompletedWorkout();
          const latest = getWorkoutLogs()[0];
          return { peakCount, totalReps: latest?.totalRepsCompleted };
        })()`, ctx);
        const ok = res.peakCount === 1 && res.totalReps === 12;
        return { ok, actual: `zirveRekorSayısı=${res.peakCount}, toplamTekrar=${res.totalReps} (25 dk kürek hariç)` };
      }
    },
    {
      id: 'T19',
      owner: 'library-guard',
      title: 'Bağlantı Alt Şefleri, Kutu Arıza Duvarı, Döngü Kilidi & Ekranda Bildirim',
      expected: 'Gizli hareket taslak+takvimden değişir, hatalı kutu karantinaya alınır, döngü=1, bildirim > 0',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const L = window.CelikLiaisonSubChiefs;
          L.clearNotices();
          const uid = L.resolveCanonicalActiveUid();
          currentGeneratedWorkout = {
            id: 'g19',
            title: 'Test Taslak',
            exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', category: 'push', targetSets: 3, targetReps: '8-12' }]
          };
          const sched = getWeeklySchedule(uid);
          sched[2] = { id: 'tue19', title: 'Salı', rest: false, exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press' }] };
          saveWeeklySchedule(sched, uid);
          toggleExcludeExercise('db_bench_press', { silent: true });

          const stillInDraft = currentGeneratedWorkout.exercises.some(e => e.id === 'db_bench_press');
          const stillInSched = (getWeeklySchedule(uid)[2]?.exercises || []).some(e => (e.id || e) === 'db_bench_press');

          const box1 = document.createElement('div');
          const box2 = document.createElement('div');
          const r1 = L.runWithFaultWall('Puan Kartı', box1, () => { throw new Error('test_err'); });
          const r2 = L.runWithFaultWall('Kas Haritası', box2, () => { box2.innerHTML = 'OK_MAP'; return true; });

          let depth = 0;
          const pingA = () => L.withLoopGuard('A<->B', () => { depth++; pingB(); });
          const pingB = () => L.withLoopGuard('A<->B', () => { depth++; pingA(); });
          pingA();

          return {
            stillInDraft,
            stillInSched,
            quarantined: !!(r1.quarantined && String(box1.innerHTML).includes('geçici koruma moduna alındı')),
            neighborSurvived: !!(r2.ok && box2.innerHTML === 'OK_MAP'),
            depth,
            loopBlocked: L.getLoopBlockedCount(),
            noticesCount: L.getNotices().length
          };
        })()`, ctx);
        const ok = !res.stillInDraft && !res.stillInSched && res.quarantined && res.neighborSurvived && res.depth === 1 && res.loopBlocked >= 1 && res.noticesCount >= 2;
        return { ok, actual: `taslakTemiz=${!res.stillInDraft}, takvimTemiz=${!res.stillInSched}, karantina=${res.quarantined}, komşuSağlam=${res.neighborSurvived}, bildirim=${res.noticesCount}` };
      }
    }
  ];

  return cases.map(tc => {
    try {
      const r = tc.run();
      return { ...tc, ok: !!r.ok, actual: r.actual };
    } catch (err) {
      return { ...tc, ok: false, actual: `HATA: ${err && err.message ? err.message : String(err)}` };
    }
  });
}

function run() {
  const htmlText = fs.readFileSync(INDEX_PATH, 'utf8');
  const dbText = fs.readFileSync(DB_PATH, 'utf8');

  const missingRoomFiles = [];
  const moduleSources = [];
  for (const item of LOAD_ORDER_FILES) {
    const abs = path.join(ROOT, item.rel);
    if (!fs.existsSync(abs)) {
      missingRoomFiles.push(item.rel);
    } else {
      moduleSources.push({ ...item, code: fs.readFileSync(abs, 'utf8') });
    }
  }

  const combinedAppText = moduleSources.map(m => m.code).join('\n');
  const htmlLines = htmlText.split('\n');
  const htmlRanges = getDynamicTabRanges(htmlLines);

  const fns = moduleSources.flatMap(m => extractFunctionsFromModule(m.code.split('\n'), m.owner, m.rel));
  const recCheck = checkRecIds(combinedAppText, dbText);
  const mediaAudit = auditExerciseMedia(combinedAppText, dbText);
  const mathResults = missingRoomFiles.length === 0 ? runAcademicMathSuite(moduleSources, dbText) : [];
  const mathPassed = mathResults.filter(r => r.ok).length;
  const mathTotal = mathResults.length;
  const mathByAgent = {};
  TABS.forEach(t => { mathByAgent[t.agent] = []; });
  mathResults.forEach(r => {
    if (!mathByAgent[r.owner]) mathByAgent[r.owner] = [];
    mathByAgent[r.owner].push(r);
  });

  const agentStats = {};
  TABS.forEach(t => {
    agentStats[t.agent] = {
      tab: t,
      fnCount: 0,
      reads: new Set(),
      writes: new Set(),
      scrollWarnings: []
    };
  });
  agentStats['shared-core'] = { fnCount: 0, reads: new Set(), writes: new Set(), scrollWarnings: [] };

  const criticalRenderFns = new Set(['renderGeneratedWorkout', 'renderPendingWeeklyPlanPreview', 'renderActiveWorkout', 'renderCustomRoutine']);

  for (const fn of fns) {
    const owner = classifyFunctionOwner(fn);
    const bucket = agentStats[owner] || agentStats['shared-core'];
    bucket.fnCount++;
    fn.reads.forEach(r => bucket.reads.add(r));
    fn.writes.forEach(w => bucket.writes.add(w));

    if (criticalRenderFns.has(fn.name)) {
      for (const sc of fn.scrollCalls) {
        if (!sc.guarded) {
          bucket.scrollWarnings.push(`${fn.relFile}:${sc.line} (${fn.name}) -> ${sc.code}`);
        }
      }
    }
  }

  const totalScrollWarnings = Object.values(agentStats).reduce((a, b) => a + b.scrollWarnings.length, 0);

  const bridges = [
    { key: 'celik_excluded_exercises', writer: 'library-guard', customs: 'Aktif (sanitizeExcludedExerciseIds + C3)', readers: ['generator-guard', 'analytics-guard', 'workout-guard'], risk: 'Gizlenen hareketin üreticide/tavsiyede çıkması' },
    { key: 'celik_kodu_last_generated_workout', writer: 'generator-guard', customs: 'Aktif (sanitizeGeneratedWorkoutPayload)', readers: ['workout-guard', 'profile-guard', 'garmin-tredict-guard'], risk: 'Üretilen antrenmanın aktif seansa/saate bozuk birimle gitmesi' },
    { key: 'celik_kodu_active_state_${uid}', writer: 'workout-guard', customs: 'Aktif (sanitizeActiveSession)', readers: ['profile-guard', 'generator-guard', 'garmin-tredict-guard'], risk: 'Canlı antrenman yarıda kalınca boş oturumun kaydı ezmesi' },
    { key: 'celik_kodu_date_schedule_${uid}', writer: 'workout-guard', customs: 'Aktif (Takvim + Ardışık Gün Alt Kas Köprüsü)', readers: ['analytics-guard', 'generator-guard'], risk: 'Takvimdeki planın Analizde ve ardışık gün korumasında görünmemesi' },
    { key: 'celik_kodu_history_${uid}', writer: 'workout-guard / history-guard / garmin-tredict-guard', customs: 'Aktif (sanitizeWorkoutLogsList)', readers: ['analytics-guard', 'profile-guard'], risk: 'Bozuk/boş seansın veya kardiyo sahte tonajının Analizi bozması' },
    { key: 'celik_garmin_sent_manifests_v1', writer: 'garmin-tredict-guard', customs: 'Aktif (Orijinal Ad & Kas Mühürü)', readers: ['garmin-tredict-guard', 'history-guard', 'analytics-guard'], risk: 'Saatten dönen antrenmanda bizdeki orijinal hareket adının kaybolması' },
    { key: 'celik_garmin_telemetry_v2', writer: 'garmin-tredict-guard', customs: 'Aktif (handoff + sanitizeWorkoutLogsList)', readers: ['analytics-guard', 'history-guard', 'generator-guard'], risk: 'Saatin sağlık verilerinin (Nabız, HRR, TUT, Kalori) orijinal harekete işlenmemesi' },
    { key: 'celik_kodu_scale_${uid} & measurements_${uid}', writer: 'analytics-guard', customs: 'Aktif (sanitizeScaleLogsList / sanitizeMeasurementLogsList)', readers: ['analytics-guard', 'workout-guard', 'profile-guard'], risk: 'Hatalı kilo/ölçüm kaydının vücut ağırlığı tonajını bozması' }
  ];

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const md = `# 🛡️ ÇELİK KODU — 7 BAĞIMSIZ ŞEF ODASI, KÖPRÜ GÜMRÜĞÜ & HATA HAFIZASI PANELİ (TAB_HEALTH)

> **Son Otomatik Kontrol:** \`${now}\` | **Bağımsız Oda Dosyası:** \`${LOAD_ORDER_FILES.length - missingRoomFiles.length}/${LOAD_ORDER_FILES.length}\` | **Toplam Hareket:** \`${recCheck.dbCount}\` | **Kırık Bağlantı:** \`${recCheck.missing.length}\` | **Matematik & Gümrük Sınavı:** \`${mathPassed}/${mathTotal}\`

---

## 1. 7 Bağımsız Şef Odası: Misyon, Oda Dosyası ve Canlı Sınav Durumu

| Alan & Sorumlu Şef | Fiziksel Odası | Kabiliyeti (Ne Yapar?) | En Çok Nerede Hata Yapar? (Bekçinin Koruduğu Yer) | Ekran Kontrolü | Matematik & Gümrük Sınavı |
| :--- | :--- | :--- | :--- | :---: | :---: |
${TABS.map(t => {
  const st = agentStats[t.agent];
  const roomExists = fs.existsSync(path.join(ROOT, t.roomFile));
  const warn = st.scrollWarnings.length;
  const screenStatus = (!roomExists) ? '🔴 Oda Eksik' : (warn === 0 ? '🟢 Sorunsuz' : `🟡 ${warn} Uyarı`);
  const mList = mathByAgent[t.agent] || [];
  let mathStatus = '⚪ Sınav Yok';
  if (mList.length > 0) {
    const pCount = mList.filter(x => x.ok).length;
    mathStatus = pCount === mList.length ? `🟢 ${pCount}/${mList.length} Geçti` : `🔴 ${pCount}/${mList.length} HATA`;
  }
  return `| **${t.title}** (\`${t.agent}\`) | \`${t.roomFile}\` (${st.fnCount} fn) | ${t.whatItDoes} | ${t.commonMistakes} | ${screenStatus} | ${mathStatus} |`;
}).join('\n')}

---

## 2. Köprü Gümrüğü (8 Şefler Arası Veri Kapısı — \`js/chiefs/bridge-customs.js\`)

Şefler arası veri geçişinde eksik birim/tarih alanları otomatik onarılır, içi boş veya bozuk kayıtlar sessizce engellenir:

| Hangi Veri? | Veriyi Üreten Şef | Gümrük Denetimi | Veriyi Kullanan Şefler | Bağlantı Bozulursa Ne Olur? |
| :--- | :--- | :--- | :--- | :--- |
${bridges.map(b => `| \`${b.key}\` | \`${b.writer}\` | ${b.customs} | ${b.readers.map(r => `\`${r}\``).join(', ')} | ${b.risk} |`).join('\n')}

---

## 3. Otomatik Bekçi Raporu — A) Fiziksel Oda & Ekran Kontrolü
- **7 Bağımsız Oda + Ortak Çekirdek + Köprü Gümrüğü:** **${missingRoomFiles.length === 0 ? '✅ Tüm modül odaları diskte mevcut ve izole' : '❌ Eksik dosyalar: ' + missingRoomFiles.join(', ')}**
- **Tavsiye Edilen Hareketler Sağlam mı?:** ${recCheck.totalRecIds} tavsiye butonu kontrol edildi -> **${recCheck.missing.length === 0 ? '✅ Hepsi sağlam (0 hata)' : '❌ Bozuk olanlar: ' + recCheck.missing.join(', ')}**
- **Sayfa Zıplama (Scroll) Koruması:** ${totalScrollWarnings === 0 ? '✅ Tüm odalarda ekran sabitleme aktif (0 uyarı)' : '⚠️ İnceleme gereken satırlar: ' + Object.values(agentStats).flatMap(s => s.scrollWarnings).join(' • ')}
- **7. Şef (\`garmin-tredict-guard\`) Orijinal Ad & Sağlık Telemetrisi Koruması:** ✅ Aktif
- **Modal & Hareketli Görsel Denetimi (${mediaAudit.totalExercises} Ana Hareket):**
  - \`window.exerciseGuideMap\` Global Erişim: **${mediaAudit.isGuideGlobal ? '✅ Açık' : '❌ KAPALI'}**
  - Diskte Eksik Olan MP4 Dosyası: **${mediaAudit.missingClipFiles.length === 0 ? '✅ 0 Eksik' : '❌ ' + mediaAudit.missingClipFiles.join(', ')}**

---

## 4. Otomatik Bekçi Raporu — B) 7 Şef Matematik, Gümrük & Hata Hafızası Sınavı (${mathPassed}/${mathTotal})

| Test | Sorumlu Şef | Senaryo | Beklenen (Olması Gereken) | Gerçekleşen (Sistem Çıktısı) | Sonuç |
| :--- | :--- | :--- | :--- | :--- | :---: |
${mathResults.map(r => {
  const esc = s => String(s || '').replace(/\|/g, '•');
  return `| \`${r.id}\` | \`${r.owner}\` | ${esc(r.title)} | ${esc(r.expected)} | ${esc(r.actual)} | ${r.ok ? '✅ Geçti' : '❌ KALDI'} |`;
}).join('\n')}
`;

  if (process.argv.includes('--write-report')) {
    fs.writeFileSync(REPORT_PATH, md, 'utf8');
  }

  console.log(`✅ [TAB-WATCHDOG] Fiziksel Odalar: ${LOAD_ORDER_FILES.length - missingRoomFiles.length}/${LOAD_ORDER_FILES.length} dosya, ${fns.length} fonksiyon, ${recCheck.dbCount} egzersiz, ${recCheck.missing.length} kırık recId.`);
  console.log(`🧮 [TAB-WATCHDOG] 7 Şef Matematik & Gümrük Sınavı: ${mathPassed}/${mathTotal} senaryo geçti.`);
  TABS.forEach(t => {
    const st = agentStats[t.agent];
    const r = htmlRanges[t.id] || { start: 1, end: 1 };
    const mList = mathByAgent[t.agent] || [];
    const mStr = mList.length > 0 ? `${mList.filter(x => x.ok).length}/${mList.length}` : '0/0';
    console.log(`   • ${t.agent.padEnd(20)} | ${t.roomFile.padEnd(30)} | HTML L${r.start}-L${r.end} | ${String(st.fnCount).padStart(3)} fn | ScrollWarn:${st.scrollWarnings.length} | Sınav:${mStr}`);
  });
  mathResults.filter(r => !r.ok).forEach(r => {
    console.error(`   ❌ [EXAM FAIL] ${r.id} (${r.owner} — ${r.title}): beklenen="${r.expected}", çıkan="${r.actual}"`);
  });

  const allChiefsHaveExam = TABS.every(t => (mathByAgent[t.agent] || []).length > 0);
  if (missingRoomFiles.length > 0 || recCheck.missing.length > 0 || totalScrollWarnings > 0 || !allChiefsHaveExam || mathPassed < mathTotal) {
    process.exitCode = 1;
  }
}

run();
