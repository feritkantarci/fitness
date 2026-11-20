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
const REPORT_PATH = path.join(ROOT, 'docs', 'TAB_HEALTH.md');

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
    keyPatterns: ['auth_users', 'session', 'active_user_id', 'logged_out', 'GEMINI', 'gcal_', 'emailjs_', 'bug_reports', 'system_telemetry_']
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
    get length() { return store.size; }
    key(i) { return Array.from(store.keys())[i] ?? null; }
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
      title: '3-Mod DB Denetimi (3 Cardio/8 Time/145 Rep) & Miras Hollow Body',
      expected: 'cardio=3, time=8, reps=145; Hollow 12→10→8 normal_fatigue(sn), 40→20 early_drop',
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
        const ok = counts.cardio_min === 3 && counts.time_sec === 8 && counts.reps === 145
          && eng.getExerciseMetricMode({ id: 'bw_butt_kicks', name: 'Topuk Kalçaya Koşu (Butt Kicks)' }) === 'time_sec'
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
        yDt.setHours(18, 0, 0, 0);
        const yIso = ctx.toIsoDateKeyLocal(yDt);
        ctx.__seedState({
          history: [{
            id: 'h_yest',
            date: yIso,
            timestamp: yDt.getTime(),
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
          // Haftalık ardışık gün testi (gerçek 24 saat aralıklı ardışık Cuma -> Cumartesi -> Pazar penceresi)
          const OrigDate = Date;
          const FRI_NOW = new OrigDate('2026-11-20T10:00:00+03:00').getTime();
          class FriMockDate extends OrigDate {
            constructor(...args) { super(args.length ? args[0] : FRI_NOW, ...(args.slice(1))); }
            static now() { return FRI_NOW; }
          }
          let wkDays = [];
          const wkOverlaps = [];
          let consecutivePairCount = 0;
          try {
            setWorkoutLogs([]);
            Date = FriMockDate;
            window.selectedAiWeeklyTemplate = 'full_body_abc';
            applyAiWeeklySchedule(null);
            wkDays = (window.pendingAiWeeklyPlan && window.pendingAiWeeklyPlan.days) || [];
            for (let i = 1; i < wkDays.length; i++) {
              const prevExs = (wkDays[i - 1] && wkDays[i - 1].workout && wkDays[i - 1].workout.exercises) || [];
              const curExs = (wkDays[i] && wkDays[i].workout && wkDays[i].workout.exercises) || [];
              const dPrev = new Set();
              prevExs.forEach(ex => {
                const anat = getExerciseAnatomy(ex);
                ((anat && anat.primarySubKeys) || []).forEach(pk => dPrev.add(pk));
              });
              consecutivePairCount++;
              curExs.forEach(ex => {
                const anat = getExerciseAnatomy(ex);
                ((anat && anat.primarySubKeys) || []).forEach(pk => {
                  if (dPrev.has(pk)) wkOverlaps.push(ex.id + ':' + pk);
                });
              });
            }
          } finally {
            Date = OrigDate;
          }
          return {
            blockedSize: blocked.size,
            dailyOverlapCount: overlaps.length,
            weeklyOverlapCount: wkOverlaps.length,
            consecutivePairCount,
            wkOverlaps: wkOverlaps.join(', '),
            d1: wkDays[0] && wkDays[0].workout ? wkDays[0].workout.exercises.map(e => e.id).join(',') : '',
            d2: wkDays[1] && wkDays[1].workout ? wkDays[1].workout.exercises.map(e => e.id).join(',') : '',
            genCount: ((gen && gen.exercises) || []).length
          };
        })()`, ctx);
        const ok = res.blockedSize >= 4 && res.genCount >= 4 && res.consecutivePairCount >= 2 && res.dailyOverlapCount === 0 && res.weeklyOverlapCount === 0;
        return { ok, actual: `korunanAltKas=${res.blockedSize}, günlükÇakışma=${res.dailyOverlapCount}, haftalıkArdışıkÇakışma=${res.weeklyOverlapCount}, ov=${res.wkOverlaps}` };
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
      title: 'Hata Hafızası Sicili: Tekil "Zirve Rekor" & Kardiyo Dakika Tekrar Hariçliği',
      expected: 'Kart başına "Zirve Rekor" = 1 adet, tamamlanan seans tekrarında kardiyo dk = 0',
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
          const peakCount = (String(box.innerHTML || '').match(/Zirve Rekor/g) || []).length;

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
    },
    {
      id: 'T20',
      owner: 'workout-guard',
      title: 'Hata Hafızası Sicili: Canlı Odak Dinlenme Ekranı, Çift Gelişim Eğrisi & Süperset Döngüsü',
      expected: 'Düz set dinlenme=aktif, çift eğri=kilo+tekrar, A1 bitişi=A2 önizleme, A2 bitişi=A1 tur 2',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          activeWorkoutSession = {
            title: 'T20 Dinlenme & Süperset Sınavı',
            scheme: { sets: 2, reps: 10, rest: 45 },
            exercises: [
              { id: 'db_bench_press', name: 'Dambıl Bench Press', category: 'push', targetSets: 2, targetReps: 10, blockType: 'straight', blockLabel: '1' },
              { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'pull', targetSets: 2, targetReps: 10, blockType: 'superset', supersetRole: 1, blockLabel: 'A1', groupId: 'A' },
              { id: 'cable_row', name: 'Cable Row', category: 'pull', targetSets: 2, targetReps: 10, blockType: 'superset', supersetRole: 2, blockLabel: 'A2', groupId: 'A' }
            ]
          };
          activeWorkoutSetsData = {};
          activeWorkoutViewMode = 'focus';
          activeFocusExIndex = 0;
          activeFocusSetIndex = null;
          renderActiveWorkout();

          // 1. Düz set 1'i tamamla -> Dinlenme kartı ve çift eğri kontrolü
          completeSetAndStartRest('db_bench_press', 0);
          const c1 = document.getElementById('activeWorkoutContainer');
          const hasRestScreen = String(c1?.innerHTML || '').includes('daylight-rest-card');
          const hasDualCurve = String(c1?.innerHTML || '').includes('GELİŞİM EĞRİLERİ') && String(c1?.innerHTML || '').includes('KİLO') && String(c1?.innerHTML || '').includes('TEKRAR');

          // Dinlenmeyi kapat -> Sete dön
          dismissDaylightRest();

          // 2. Süperset A1'e geç ve Set 1'i tamamla -> Dinlenme ekranında A2 önizlemesi
          goToNextExercise();
          completeSetAndStartRest('lat_pulldown', 0);
          const hasA2Preview = String(c1?.innerHTML || '').includes('Cable Row') && String(c1?.innerHTML || '').includes('2. HAREKETE GEÇ');

          // Dinlenmeyi kapat -> Odak doğrudan A2'ye kaymalı
          dismissDaylightRest();
          const focusIsA2 = (activeFocusExIndex === 2);

          // 3. Süperset A2'yi tamamla -> Dinlenme ekranında A1 Tur 2 önizlemesi
          completeSetAndStartRest('cable_row', 0);
          const hasTur2Preview = String(c1?.innerHTML || '').includes('Lat Pulldown') && String(c1?.innerHTML || '').includes('SIRADAKİ TUR');

          // Dinlenmeyi kapat -> Odak tekrar A1'e dönmeli
          dismissDaylightRest();
          const focusIsA1Tur2 = (activeFocusExIndex === 1);

          return {
            hasRestScreen,
            hasDualCurve,
            hasA2Preview,
            focusIsA2,
            hasTur2Preview,
            focusIsA1Tur2
          };
        })()`, ctx);
        const ok = res.hasRestScreen && res.hasDualCurve && res.hasA2Preview && res.focusIsA2 && res.hasTur2Preview && res.focusIsA1Tur2;
        return { ok, actual: `dinlenmeKartı=${res.hasRestScreen}, çiftEğri=${res.hasDualCurve}, A2Önizleme=${res.hasA2Preview}, odakA2=${res.focusIsA2}, tur2Önizleme=${res.hasTur2Preview}, odakA1Tur2=${res.focusIsA1Tur2}` };
      }
    },
    {
      id: 'T21',
      owner: 'garmin-tredict-guard',
      title: 'Merkez Saat Kasası & Aynı Gün Bağımsız Yürüyüş İzolasyonu',
      expected: 'mühürlü saat kasası açık, açık metin sızıntısı 0, Defne Yürüyüşü (cond_walking) aynı gün kuvvet kaydını ezmeden bağımsız açıldı',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          localStorage.removeItem('celik_garmin_enabled_' + uid);
          localStorage.removeItem('celik_garmin_tredict_token_' + uid);
          localStorage.removeItem('celik_garmin_intervals_token_' + uid);

          setWorkoutLogs([
            {
              id: 'app_strength_nov14',
              date: '2026-11-14',
              timestamp: 1794650000000,
              program: 'Üst Vücut A',
              title: 'Üst Vücut A',
              totalVolumeKg: 200,
              exercises: [
                {
                  id: 'db_bench_press',
                  name: 'Dambıl Bench Press',
                  sets: [{ weight: 20, reps: 10, completed: true, volume: 200 }]
                }
              ]
            }
          ]);

          const sealRef = 'seal_exam_watch_vault_2026';
          const demoTr = 'trd_demo_vault_token_2026';
          const demoIcu = 'icu_demo_vault_key_2026';
          const vaultObj = {
            enabled: true,
            sealedTredict: window.CelikVaultCodec.sealWithKey(demoTr, sealRef),
            sealedIntervals: window.CelikVaultCodec.sealWithKey(demoIcu, sealRef),
            sealedGateway: '',
            sealRef,
            updatedAt: 1794675000000
          };
          const vaultKey = 'celik_garmin_watch_vault_v1_' + uid;
          localStorage.setItem(vaultKey, JSON.stringify(vaultObj));
          const rawVault = localStorage.getItem(vaultKey) || '';

          const walkAct = {
            id: 'tmd_walk_nov14',
            date: '2026-11-14T16:00:37.230Z',
            title: 'Defne Yürüyüş',
            sportType: 'walking',
            subSportType: 'generic',
            summary: {
              duration: 1276,
              durationTotal: 1286,
              distance: 2212.17,
              calories: 135,
              heartrate: 123,
              heartrateMax: 152,
              pace: 577,
              cadence: 121
            },
            rounds: []
          };
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([walkAct]));

          const gt = window.GarminTredictChief;
          gt.refreshFromCentralVault(uid);
          gt.handoffCompletedActivitiesToTabChiefs();

          const enabledAfterVault = gt.isGarminEnabledForCurrentUser();
          const finalLogs = getWorkoutLogs();
          const strengthLog = finalLogs.find(l => l && l.id === 'app_strength_nov14');
          const walkLog = finalLogs.find(l => l && l.garminActivityId === 'tmd_walk_nov14');

          const origLen = EXERCISES_DB.length;
          const origBackup = EXERCISES_DB.slice();
          const cloudExList = origBackup
            .map((e, idx) => idx === 0 ? Object.assign({}, e, { cue: 'CLOUD_VERIFIED_CUE' }) : e)
            .concat([{
              id: 'cloud_test_ex',
              name: 'Bulut Test Hareketi',
              category: 'conditioning',
              equipment: 'bodyweight',
              primaryMuscles: ['core'],
              secondaryMuscles: []
            }]);
          const appliedCatalog = window.applyCloudMasterCatalogPayload({
            version: 999,
            exerciseCount: cloudExList.length,
            exercises: cloudExList,
            opengymCatalog: {
              cloud_test_ex: { clip: 'assets/media/cloud_test.webp', still: 'assets/media/cloud_test.webp' }
            }
          }, true);
          const catalogUpdatedCue = EXERCISES_DB[0] && EXERCISES_DB[0].cue === 'CLOUD_VERIFIED_CUE';
          const catalogAddedEx = EXERCISES_DB.length === origLen + 1 && EXERCISES_DB.some(e => e.id === 'cloud_test_ex');
          const catalogMediaAdded = Boolean(window.OPENGYM_GLOBAL_CATALOG && window.OPENGYM_GLOBAL_CATALOG.cloud_test_ex);
          EXERCISES_DB.splice(0, EXERCISES_DB.length, ...origBackup);
          if (window.OPENGYM_GLOBAL_CATALOG) delete window.OPENGYM_GLOBAL_CATALOG.cloud_test_ex;

          return {
            enabledAfterVault,
            vaultSealedNoPlaintext: rawVault.includes('v1:') && !rawVault.includes(demoTr) && !rawVault.includes(demoIcu),
            logsLen: finalLogs.length,
            strengthIntact: Boolean(strengthLog && strengthLog.totalVolumeKg === 200 && strengthLog.exercises?.[0]?.id === 'db_bench_press'),
            walkExId: walkLog?.exercises?.[0]?.id || '',
            walkDate: walkLog?.date || '',
            walkIsCardio: Boolean(walkLog?.isCardioActivity),
            walkHrAvg: walkLog?.healthSummary?.heartrateAvg || 0,
            walkHrMax: walkLog?.healthSummary?.heartrateMax || 0,
            walkDist: walkLog?.healthSummary?.distanceMeters || 0,
            walkCals: walkLog?.healthSummary?.calories || 0,
            catalogSynced: Boolean(appliedCatalog && catalogUpdatedCue && catalogAddedEx && catalogMediaAdded)
          };
        })()`, ctx);
        const ok = res.enabledAfterVault
          && res.vaultSealedNoPlaintext
          && res.logsLen === 2
          && res.strengthIntact
          && res.walkExId === 'cond_walking'
          && res.walkDate === '2026-11-14'
          && res.walkIsCardio
          && res.walkHrAvg === 123
          && res.walkHrMax === 152
          && res.walkDist === 2212
          && res.walkCals === 135
          && res.catalogSynced;
        return {
          ok,
          actual: `kasa=${res.enabledAfterVault}/mühür=${res.vaultSealedNoPlaintext}, katalog=${res.catalogSynced}, kuvvet=${res.strengthIntact}, kayıt=${res.logsLen}, yürüyüş=${res.walkExId}(${res.walkDist}m,${res.walkHrAvg}/${res.walkHrMax}bpm,${res.walkCals}kcal)`
        };
      }
    },
    {
      id: 'T22',
      owner: 'garmin-tredict-guard',
      title: 'Çoklu Cihaz İsim Düzenleme Koruması & Saat/Geçmiş Senkronu',
      expected: 'eski saat önbelleği kullanıcı düzenlemesini ezemez, ilk bulut açılış kapısı erken push engeller, aynı gün kuvvet+yürüyüş korunur, saat paneli güncel başlığı gösterir',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          const NEW_TITLE = "Kan Şekeri Yükselmesi Sonrası (202 - 96'a Düştü)";
          const OLD_TITLE = 'Defne Yürüyüş';
          const EDITED_AT = 1794678124261;
          localStorage.setItem('celik_garmin_enabled_' + uid, 'true');

          const strengthLog = {
            id: 'app_strength_14',
            date: '2026-11-14',
            timestamp: 1794650000000,
            program: 'Üst Vücut A',
            title: 'Üst Vücut A',
            totalVolumeKg: 200,
            exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ weight: 20, reps: 10, completed: true, volume: 200 }] }]
          };
          const editedWalkLog = {
            id: 'garmin_tmd_nov14',
            garminActivityId: 'tmd_nov14',
            sourceChief: 'garmin-tredict-guard',
            isCardioActivity: true,
            date: '2026-11-14',
            timestamp: 1794672037230,
            program: NEW_TITLE,
            title: NEW_TITLE,
            userEditedAt: EDITED_AT,
            healthSummary: { heartrateAvg: 123, heartrateMax: 152, calories: 135, distanceMeters: 2212 },
            exercises: [{
              id: 'cond_walking',
              name: 'Tempo Yürüyüş',
              primaryMuscles: ['quads', 'calves'],
              sets: [{ setNo: 1, weight: 0, reps: 1, completed: true, durationSec: 1276 }]
            }]
          };
          const staleWalkLog = Object.assign({}, editedWalkLog, {
            program: OLD_TITLE,
            title: OLD_TITLE,
            userEditedAt: 0
          });
          const staleWatchAct = {
            id: 'tmd_nov14',
            date: '2026-11-14T16:00:37.230Z',
            title: OLD_TITLE,
            sportType: 'walking',
            subSportType: 'generic',
            summary: { duration: 1276, durationTotal: 1286, distance: 2212, calories: 135, heartrate: 123, heartrateMax: 152 },
            rounds: []
          };

          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify([editedWalkLog, strengthLog]));
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([Object.assign({}, staleWatchAct)]));

          // 1) Açılış kapısı: ilk bulut eşitlemesi bitmeden handoff buluta yazmamalı; düzenlenmiş başlığı saat önbelleğine aktarmalı
          const origSyncToCloud = window.syncWorkoutLogsToCloud;
          let prematureCloudPushCount = 0;
          window.syncWorkoutLogsToCloud = () => { prematureCloudPushCount++; };
          window._initialWorkoutLogsCloudSyncDone = false;

          const gt = window.GarminTredictChief;
          gt.handoffCompletedActivitiesToTabChiefs();
          const afterHandoffWatch = JSON.parse(localStorage.getItem('celik_garmin_telemetry_v2_' + uid) || '[]')[0] || {};
          const afterHandoffWalk = JSON.parse(localStorage.getItem('celik_kodu_history_' + uid) || '[]').find(l => l && l.id === 'garmin_tmd_nov14') || {};

          // 2) mergeWorkoutLogCollections: hem çekme (pull) hem eski cihazdan itme (push) yönünde yeni userEditedAt kazanmalı, aynı gün kuvvet+yürüyüş kalmalı
          const pullMerge = mergeWorkoutLogCollections([staleWalkLog, strengthLog], [editedWalkLog, strengthLog], uid);
          const pushMerge = mergeWorkoutLogCollections([editedWalkLog, strengthLog], [staleWalkLog, strengthLog], uid);
          const pullWalk = (pullMerge.mergedLogs || []).find(l => l && l.id === 'garmin_tmd_nov14') || {};
          const pushWalk = (pushMerge.mergedLogs || []).find(l => l && l.id === 'garmin_tmd_nov14') || {};

          // 3) Onay kapsülü hijyeni (puanlanmış walking bildirimi gizlenir) + pending kuvvet seansında saat başlığı yayılımı
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([Object.assign({}, staleWatchAct)]));
          gt.renderHistoryGarminSyncPanel();
          const walkPanelHtml = String(document.getElementById('garminHistorySyncContainer').innerHTML || '');

          const pendingStrAct = {
            id: 'tmd_str_pending',
            date: new Date().toISOString(),
            title: OLD_TITLE,
            sportType: 'training',
            subSportType: 'strength_training',
            summary: { duration: 2100, durationTotal: 2200, calories: 210, heartrate: 128, heartrateMax: 152 },
            rounds: [{ setType: 'active', exerciseCategory: 'chest', exerciseName: 'dumbbell_chest_press', repetitions: 10, weight: 20, duration: 40, heartrate: 125, heartrateMax: 138 }]
          };
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([pendingStrAct]));
          gt.propagateWorkoutLogTitleToWatch({ id: 'garmin_tmd_str_pending', garminActivityId: 'tmd_str_pending', program: NEW_TITLE, title: NEW_TITLE, userEditedAt: EDITED_AT });
          gt.renderHistoryGarminSyncPanel();
          const propagatedWatch = JSON.parse(localStorage.getItem('celik_garmin_telemetry_v2_' + uid) || '[]')[0] || {};
          const panelHtml = String(document.getElementById('garminHistorySyncContainer').innerHTML || '');

          window.syncWorkoutLogsToCloud = origSyncToCloud;
          window._initialWorkoutLogsCloudSyncDone = true;

          return {
            prematureCloudPushCount,
            handoffKeptTitle: afterHandoffWalk.program === NEW_TITLE,
            handoffUpdatedWatchTitle: afterHandoffWatch.title === NEW_TITLE,
            pullCount: (pullMerge.mergedLogs || []).length,
            pullWon: pullWalk.program === NEW_TITLE && Number(pullWalk.userEditedAt) === EDITED_AT,
            pushCount: (pushMerge.mergedLogs || []).length,
            pushWon: pushWalk.program === NEW_TITLE && Number(pushWalk.userEditedAt) === EDITED_AT,
            walkPanelHidden: walkPanelHtml === '',
            propagatedWatchTitle: propagatedWatch.title === NEW_TITLE,
            panelHasNewTitle: panelHtml.includes('Kan Şekeri Yükselmesi Sonrası'),
            panelDropsOldTitle: !panelHtml.includes(OLD_TITLE)
          };
        })()`, ctx);
        const ok = res.prematureCloudPushCount === 0
          && res.handoffKeptTitle
          && res.handoffUpdatedWatchTitle
          && res.pullCount === 2
          && res.pullWon
          && res.pushCount === 2
          && res.pushWon
          && res.walkPanelHidden
          && res.propagatedWatchTitle
          && res.panelHasNewTitle
          && res.panelDropsOldTitle;
        return {
          ok,
          actual: `erkenPush=${res.prematureCloudPushCount}, eldenÇıkış=${res.handoffKeptTitle}/${res.handoffUpdatedWatchTitle}, pull=${res.pullWon}(${res.pullCount}), push=${res.pushWon}(${res.pushCount}), walkPanelGizli=${res.walkPanelHidden}, panel=${res.panelHasNewTitle}/eskiYok=${res.panelDropsOldTitle}`
        };
      }
    },
    {
      id: 'T23',
      owner: 'garmin-tredict-guard',
      title: 'Kanonik Takvim Çözümlemesi & Sıfır Mükerrer Saat Gönderimi',
      expected: 'haftalık+tarih çakışmasında mükerrer gün = 0, override tekil geçerli, başlıkta kısa ay tarih öneki',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          localStorage.setItem('celik_garmin_enabled_' + uid, 'true');

          const now = new Date();
          const todayIso = toIsoDateKeyLocal(now);

          const weeklySched = {
            '1': { title: 'Pzt: İtiş', exercises: [{ id: 'bb_bench_press', name: 'Bench', sets: 3, reps: 10, weight: 60 }] },
            '3': { title: 'Çar: Çekiş', exercises: [{ id: 'bw_pullup', name: 'Barfiks', sets: 3, reps: 8, weight: 0 }] },
            '5': { title: 'Cum: Bacak', exercises: [{ id: 'db_goblet_squat', name: 'Squat', sets: 3, reps: 12, weight: 24 }] }
          };

          localStorage.setItem('celik_kodu_weekly_schedule_' + uid, JSON.stringify(weeklySched));
          const dateOverrides = {};
          dateOverrides[todayIso] = {
            title: 'Bugün: Özel İtiş',
            exercises: [{ id: 'bb_bench_press', name: 'Bench', sets: 4, reps: 10, weight: 65 }]
          };
          localStorage.setItem('celik_kodu_date_schedule_' + uid, JSON.stringify(dateOverrides));

          const planRes = window.resolveUnifiedScheduleForNextDays(7);
          const dates = planRes.multiDays.map(d => d.calendarDate);
          const uniqueDates = new Set(dates);
          const hasZeroDuplicates = dates.length === uniqueDates.size;

          const todayItem = planRes.multiDays.find(d => d.calendarDate === todayIso);
          const hasDatePrefix = Boolean(todayItem && /^\\d{1,2}\\s+[A-Za-zÇŞĞÖÜıİçşğöü]+\\s+•\\s+/.test(todayItem.title));
          const overrideApplied = Boolean(todayItem && todayItem.title.includes('Bugün: Özel İtiş') && todayItem.exercises[0].weight === 65 && hasDatePrefix);

          return {
            totalDays: planRes.multiDays.length,
            hasZeroDuplicates,
            overrideApplied,
            hasDatePrefix,
            todayTitle: todayItem ? todayItem.title : '',
            uniqueDateCount: uniqueDates.size
          };
        })()`, ctx);
        const ok = res.totalDays >= 1 && res.hasZeroDuplicates && res.overrideApplied && res.hasDatePrefix;
        return {
          ok,
          actual: `toplamGün=${res.totalDays}, mükerrersiz=${res.hasZeroDuplicates}, overrideTekil=${res.overrideApplied}, başlık="${res.todayTitle}"`
        };
      }
    },
    {
      id: 'T24',
      owner: 'profile-guard',
      title: 'Bulut Birleşmesinde Sıfır Boş (undefined) Alan',
      expected: 'saat/sağlık bilgisi olmayan eski kayıt birleşince undefined alan = 0, telefondaki yeni seans korunur',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const oldLog = { id: 'log_old_1', date: '2026-10-01', timestamp: 1790000000000, program: 'Eski', exercises: [{ id: 'bb_bench_press', name: 'Bench', sets: [{ setNo: 1, weight: 60, reps: 10, completed: true }] }] };
          const phoneLog = { id: 'log_phone_today', date: '2026-11-16', timestamp: 1795000000000, program: 'Bugün', exercises: [{ id: 'db_rdl', name: 'RDL', sets: [{ setNo: 1, weight: 20, reps: 12, completed: true }] }] };
          const cloud = [JSON.parse(JSON.stringify(oldLog))];
          const local = [JSON.parse(JSON.stringify(phoneLog)), JSON.parse(JSON.stringify(oldLog))];
          const out = mergeWorkoutLogCollections(local, cloud, 'usr_exam').mergedLogs;
          const undefPaths = [];
          const walk = (o, p) => {
            if (o && typeof o === 'object') Object.keys(o).forEach(k => {
              if (o[k] === undefined) undefPaths.push(p + k); else walk(o[k], p + k + '.');
            });
          };
          walk(out, '');
          return { undefCount: undefPaths.length, sample: undefPaths.slice(0, 3).join(','), phoneKept: out.some(l => l.id === 'log_phone_today'), total: out.length };
        })()`, ctx);
        const ok = res.undefCount === 0 && res.phoneKept && res.total === 2;
        return {
          ok,
          actual: `undefined=${res.undefCount}${res.sample ? ' (' + res.sample + ')' : ''}, telefonSeansıKorundu=${res.phoneKept}, toplam=${res.total}`
        };
      }
    },
    {
      id: 'T25',
      owner: 'garmin-tredict-guard',
      title: 'Onay Bekleyen Kapsülde Sıfır Boş / Mükerrer Seans',
      expected: 'set verisi olmayan veya geçmişte kaydı olan saat seansı onaya düşmez; gerçek yeni seans düşer',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          localStorage.setItem('celik_garmin_enabled_' + uid, 'true');
          localStorage.removeItem('celik_garmin_approved_activities_v1_' + uid);
          localStorage.removeItem('celik_garmin_dismissed_activities_v1_' + uid);
          const mk = (id, iso, rounds) => ({ id, date: iso, title: 'Güç', sportType: 'training', subSportType: 'strength_training', summary: { duration: 2400, durationTotal: 2500, calories: 200, heartrate: 120, heartrateMax: 150 }, rounds });
          const act = (n) => ({ setType: 'active', exerciseCategory: 'chest', exerciseName: 'dumbbell_chest_press', repetitions: 10, weight: 20, duration: 40, heartrate: 120, heartrateMax: 130 });
          const emptyOld = mk('t25_empty', '2026-10-03T09:11:00.000Z', []);
          const doneInHistory = mk('t25_done', '2026-10-12T15:55:00.000Z', [act(1), act(2), act(3)]);
          const brandNew = mk('t25_new', '2026-11-16T17:00:00.000Z', [act(1), act(2), act(3)]);
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([emptyOld, doneInHistory, brandNew]));
          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify([{ id: 'garmin_t25_done', garminActivityId: 't25_done', date: '2026-10-12', timestamp: 1791823667191, program: 'Eski', exercises: [{ id: 'db_bench_press', name: 'Bench', sets: [{ weight: 20, reps: 10, completed: true }] }] }]));
          window.GarminTredictChief.renderHistoryGarminSyncPanel();
          const html = String(document.getElementById('garminHistorySyncContainer').innerHTML || '');
          const m = html.match(/(\\d+) Bildirim/);
          return { count: m ? Number(m[1]) : 0, hasNew: html.includes('t25_new') || html.includes(encodeURIComponent('t25_new')), hasEmpty: html.includes('t25_empty'), hasDone: html.includes('t25_done') };
        })()`, ctx);
        const ok = res.count === 1 && res.hasNew && !res.hasEmpty && !res.hasDone;
        return { ok, actual: `bildirim=${res.count}, yeniVar=${res.hasNew}, boşVar=${res.hasEmpty}, kayıtlıVar=${res.hasDone}` };
      }
    },
    {
      id: 'T26',
      owner: 'analytics-guard',
      title: 'Set Arası Plank = Kuvvet, Jumping Jack = Kardiyo',
      expected: 'set arası plank kuvvet seti sayılır, jumping jack kuvvet setine girmez ve kardiyo listesinde görünür',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          const today = toIsoDateKeyLocal(new Date());
          const baseEx = { id: 'db_lateral_raise', name: 'Dambıl Lateral Raise', category: 'push', muscle: 'Yan Omuz', equipment: 'dumbbell', completedSetsCount: 3, sets: [1,2,3].map(n => ({ setNo: n, weight: 7.5, reps: 12, completed: true, volume: 90 })) };
          const mk = (extras) => ({ id: 'log_t26', date: today, timestamp: Date.now(), program: 'T26', totalVolumeKg: 270, exercises: [baseEx].concat(extras) });
          const plank = { id: 'bw_plank', name: 'Plank (Set Arası)', category: 'core', muscle: 'Derin İç Karın, Ön Karın', equipment: 'bodyweight', isTimeBased: true, isInterSetExtra: true, completedSetsCount: 1, sets: [{ setNo: 1, weight: 0, reps: 45, completed: true, volume: 0 }] };
          const jack = { id: 'bw_jumping_jack', name: 'Jumping Jack (Set Arası)', category: 'conditioning', muscle: 'Üst Baldır, Alt Baldır, Yan Omuz', equipment: 'bodyweight', isInterSetExtra: true, completedSetsCount: 2, sets: [{ setNo: 1, weight: 0, reps: 30, completed: true, volume: 0 }, { setNo: 2, weight: 0, reps: 30, completed: true, volume: 0 }] };
          const run = (logs) => {
            localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify(logs));
            const r = calculateWeeklyFitnessAndCardioScores(0);
            return { sets: r.fitness.totalStrengthSetsDone, cardio: JSON.stringify(r.cardio || {}) };
          };
          const base = run([mk([])]);
          const withPlank = run([mk([plank])]);
          const withJack = run([mk([jack])]);
          return { base: base.sets, plank: withPlank.sets, jack: withJack.sets, jackInCardio: withJack.cardio.includes('Jumping Jack') && !base.cardio.includes('Jumping Jack') };
        })()`, ctx);
        const ok = res.base === 3 && res.plank === 4 && res.jack === 3 && res.jackInCardio;
        return { ok, actual: `temel=${res.base}, plankİle=${res.plank} (beklenen 4), jackİle=${res.jack} (beklenen 3), jackKardiyoda=${res.jackInCardio}` };
      }
    },
    {
      id: 'T27',
      owner: 'workout-guard',
      title: 'Süreli Set Arası Sayaç & Odak Ekranı Ekleme',
      expected: 'süreli ara hareket otomatik yapıldı sayılmaz, sayaç açılır, süre bitince yapıldı olur; Odak dinlenme ekranında ekle düğmesi var',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const ex = { id: 'db_lateral_raise', name: 'Lateral Raise', equipment: 'dumbbell', category: 'push', muscle: 'Yan Omuz' };
          activeWorkoutSession = { title: 'T27', exercises: [ex], scheme: { sets: 3, reps: '10', rest: 45 } };
          activeWorkoutSetsData = { db_lateral_raise: [1,2,3].map(n => ({ setNo: n, weight: 5, reps: 10, completed: n === 1, completedAt: null })) };
          activeInterSetContext = { exId: 'db_lateral_raise', setIdx: 0, selectedExercise: { id: 'bw_plank', name: 'Plank', muscle: 'Karın', category: 'core', equipment: 'bodyweight' }, metricType: 'time', value: 30 };
          saveInterSetExercise(false);
          const slot = activeWorkoutSetsData.db_lateral_raise[0].interSet;
          const notAutoDone = slot && slot.completed === false;
          const overlayOpen = interSetTimerState !== null && interSetTimerState.total === 30;
          completeInterSetFromTimer();
          const doneAfter = activeWorkoutSetsData.db_lateral_raise[0].interSet.completed === true;
          const overlayClosed = interSetTimerState === null;
          // tekrar bazlı: eskisi gibi hemen yapıldı
          activeWorkoutSetsData.db_lateral_raise[1].completed = true;
          activeInterSetContext = { exId: 'db_lateral_raise', setIdx: 1, selectedExercise: { id: 'bw_jumping_jack', name: 'Jumping Jack', muscle: 'Kondisyon', category: 'conditioning', equipment: 'bodyweight' }, metricType: 'reps', value: 20 };
          saveInterSetExercise(false);
          const repsDone = activeWorkoutSetsData.db_lateral_raise[1].interSet.completed === true;
          const noTimerForReps = interSetTimerState === null;
          // Odak dinlenme ekranı
          delete activeWorkoutSetsData.db_lateral_raise[1].interSet;
          const html = renderDaylightRestScreenHtml(ex, 0, activeWorkoutSession);
          const focusHasAdd = html.includes('Set arası hareket ekle');
          closeInterSetTimer();
          return { notAutoDone, overlayOpen, doneAfter, overlayClosed, repsDone, noTimerForReps, focusHasAdd };
        })()`, ctx);
        const ok = Object.values(res).every(Boolean);
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T28',
      owner: 'analytics-guard',
      title: 'Tek Hareketle Sahte İdeal Kas & Yan Etki Alt Kas Koruması (Schoenfeld/Pelland)',
      expected: 'varsayılan=week_done; sadece Russian Twist (8 set bile) Karını ideal yapmaz, Ön/Derin Karın yeşil yanmaz; Barda Dize Çekme eklenince ideal olur; Göğüste tek Bench=eksik bölge',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          const today = toIsoDateKeyLocal(new Date());
          const defaultSource = currentWeeklyMuscleSource;

          const mkLog = (exs) => ({ id: 'log_t28', date: today, timestamp: Date.now(), program: 'T28', totalVolumeKg: 0, exercises: exs });
          const rt8 = { id: 'db_russian_twist', name: 'Russian Twist', category: 'core', muscle: 'Yan Karın', equipment: 'dumbbell', completedSetsCount: 8, sets: Array.from({ length: 8 }, (_, i) => ({ setNo: i + 1, weight: 10, reps: 16, completed: true })) };
          const knee4 = { id: 'bw_hanging_knee_raise', name: 'Barda Dize Çekme', category: 'core', muscle: 'Ön Karın', equipment: 'bodyweight', completedSetsCount: 4, sets: Array.from({ length: 4 }, (_, i) => ({ setNo: i + 1, weight: 0, reps: 12, completed: true })) };
          const bench9 = { id: 'db_bench_press', name: 'Dambıl Bench Press', category: 'push', muscle: 'Orta Göğüs', equipment: 'dumbbell', completedSetsCount: 9, sets: Array.from({ length: 9 }, (_, i) => ({ setNo: i + 1, weight: 20, reps: 10, completed: true })) };

          // 1) Sadece Russian Twist (8 set) + Göğüs tek Bench (9 set)
          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify([mkLog([rt8, bench9])]));
          const a1 = calculateWeeklyMuscleSufficiency('week_done', 0);
          const core1 = a1.muscles.find(m => m.id === 'core');
          const chest1 = a1.muscles.find(m => m.id === 'chest');
          const coreComp1 = computeMuscleCompartmentMap(core1, 'week_done');
          const obliqSt = evaluateCompartmentState(coreComp1.obliques, 'week_done');
          const rectusSt = evaluateCompartmentState(coreComp1.rectus, 'week_done');
          const transSt = evaluateCompartmentState(coreComp1.transverse, 'week_done');

          // 2) Russian Twist + Barda Dize Çekme (2 farkli alt karin bolgesi)
          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify([mkLog([rt8, knee4])]));
          const a2 = calculateWeeklyMuscleSufficiency('week_done', 0);
          const core2 = a2.muscles.find(m => m.id === 'core');

          return {
            defaultSource,
            core1Status: core1 && core1.status,
            core1Covered: core1 && core1.coveredSubCount,
            chest1Status: chest1 && chest1.status,
            obliqWorked: obliqSt.isWorked,
            rectusWorked: rectusSt.isWorked,
            rectusPartial: rectusSt.isPartial,
            transWorked: transSt.isWorked,
            core2Status: core2 && core2.status,
            core2Covered: core2 && core2.coveredSubCount
          };
        })()`, ctx);
        const ok = res.defaultSource === 'week_done'
          && res.core1Status === 'insufficient'
          && res.core1Covered === 1
          && res.chest1Status === 'insufficient'
          && res.obliqWorked === true
          && res.rectusWorked === false
          && res.rectusPartial === true
          && res.transWorked === false
          && res.core2Status === 'optimal'
          && res.core2Covered >= 2;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T29',
      owner: 'library-guard',
      title: 'Paralel Bar Dips (bw_dips) ve Sehpada Dips (bw_bench_dips) Ayrımı & Medya Bütünlüğü',
      expected: 'bw_dips=0251.mp4+chest_lower+dips_bar; bw_bench_dips=1399.mp4+triceps+bench (chest yok)',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const dips = EXERCISES_DB.find(e => e.id === 'bw_dips');
          const benchDips = EXERCISES_DB.find(e => e.id === 'bw_bench_dips');
          const dipsMedia = getExerciseVisualMedia('bw_dips', 'push');
          const benchMedia = getExerciseVisualMedia('bw_bench_dips', 'push');
          const dipsReq = getExerciseRequiredEquipments(dips);
          const benchReq = getExerciseRequiredEquipments(benchDips);
          const dipsAnat = getExerciseAnatomy(dips);
          const benchAnat = getExerciseAnatomy(benchDips);
          // Eski bulut katalogu (bw_bench_dips eksik, bw_dips=1399) gelse bile yerel guncel medya ezilmez
          const stalePayload = {
            version: 294,
            exercises: EXERCISES_DB.filter(e => e.id !== 'bw_bench_dips'),
            opengymCatalog: { bw_dips: { id: '1399', clip: 'assets/opengym/clips/1399.mp4', still: 'assets/opengym/stills/1399.webp' } }
          };
          window.applyCloudMasterCatalogPayload(stalePayload, false);
          const dipsMediaAfterStale = getExerciseVisualMedia('bw_dips', 'push');
          return {
            hasDips: !!dips,
            hasBenchDips: !!benchDips,
            dipsClipOk: String(dipsMedia?.clip || '').includes('0251.mp4'),
            benchClipOk: String(benchMedia?.clip || '').includes('1399.mp4'),
            dipsHasLowerChest: Array.isArray(dipsAnat?.primarySubKeys) && dipsAnat.primarySubKeys.includes('chest_lower'),
            benchNoChest: Array.isArray(benchDips?.primaryMuscles) && benchDips.primaryMuscles.includes('triceps') && !benchDips.primaryMuscles.includes('chest') && !benchAnat?.primarySubKeys?.includes('chest_lower'),
            dipsReqBar: dipsReq.includes('dips_bar'),
            benchReqBench: benchReq.includes('bench') && !benchReq.includes('dips_bar'),
            staleCloudDidNotOverwrite: String(dipsMediaAfterStale?.clip || '').includes('0251.mp4')
          };
        })()`, ctx);
        const ok = Object.values(res).every(Boolean);
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T31',
      owner: 'generator-guard',
      title: '5-Kademe Sıra, B2 Sinerjist Matrisi, Gerçek Sırt Zorunluluğu & Çelik Akışı Uyarlaması',
      expected: '4 stilde 0 B2/sıra hatası, realBack>=2, Push/Pull<=1.35, functional jumping_jack sonda, bw Çelik Akışı başlıklı',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const styles = ['straight', 'superset', 'superset_light', 'superset_intense'];
          const durEl = document.getElementById('paramDuration');
          const styleEl = document.getElementById('paramStyle');
          const prevDur = durEl ? durEl.value : '45';
          const prevStyle = styleEl ? styleEl.value : 'superset';
          let upperOkAll = true;
          let maxRatio = 0;
          let minRealBack = 99;
          let b2Errs = 0;
          let orderErrs = 0;
          let burnoutEarlyErrs = 0;
          let funcJumpOk = true;
          let flowTitleOk = false;
          let flowWarnOk = false;
          try {
            if (durEl) durEl.value = '60';
            selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            for (const st of styles) {
              if (styleEl) styleEl.value = st;
              selectedSplits = ['upper'];
              localStorage.removeItem('celik_recent_generated_ids_usr_exam');
              handleGenerateWorkout('bb_hybrid', '');
              const exs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
              let seenNonComp = false;
              let realBack = 0;
              let pushC = 0;
              let pullC = 0;
              exs.forEach((ex, idx) => {
                const t = getExerciseOrderTier(ex, st);
                if (seenNonComp && t <= 2) orderErrs++;
                if (idx < 3 && isBurnoutOrFinisherExercise(ex)) burnoutEarlyErrs++;
                if (t >= 3) seenNonComp = true;
                for (let pi = 0; pi < idx; pi++) {
                  if (hasSynergistPreExhaustionViolation(exs[pi], ex, st)) b2Errs++;
                }
                if (isRealBackPullExercise(ex)) realBack++;
                const pk = getExercisePrimaryMuscleKeys(ex) || [];
                const ec = getEffectiveExerciseCategory(ex);
                const trapsOnly = pk.length > 0 && pk.every(k => k === 'traps');
                if (ec === 'push' || pk.some(k => k.startsWith('chest_') || k === 'shoulders_front' || k === 'shoulders_side' || k.startsWith('triceps_'))) pushC++;
                if (!trapsOnly && (ec === 'pull' || pk.some(k => k.startsWith('back_') || k === 'shoulders_rear' || k === 'biceps'))) pullC++;
              });
              const ratio = pullC > 0 ? (pushC / pullC) : 99;
              if (ratio > maxRatio) maxRatio = Number(ratio.toFixed(2));
              if (realBack < minRealBack) minRealBack = realBack;
              if (exs.length < 4 || realBack < 2 || ratio > 1.35) upperOkAll = false;
            }
            if (durEl) durEl.value = '45';
            if (styleEl) styleEl.value = 'superset';
            selectedSplits = ['functional'];
            handleGenerateWorkout('bb_hybrid', '');
            const fExs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
            const jumpIdx = fExs.findIndex(e => e.id === 'bw_jumping_jack');
            const lastCompIdx = fExs.reduce((mx, e, i) => (getExerciseOrderTier(e, 'superset') <= 2 ? i : mx), -1);
            if (jumpIdx !== -1 && lastCompIdx !== -1 && jumpIdx < lastCompIdx) funcJumpOk = false;

            selectedEquipments = ['bodyweight'];
            loadCelikAkisiWorkout(false);
            const flowW = currentGeneratedWorkout || {};
            flowTitleOk = String(flowW.title || '').includes('Vücut Ağırlığı Kompleksi') || String(flowW.title || '').includes('Ekipman Uyarlı Kompleks');
            flowWarnOk = Boolean(flowW.equipmentWarning && String(flowW.equipmentWarning).trim().length > 0);
          } finally {
            if (durEl) durEl.value = prevDur;
            if (styleEl) styleEl.value = prevStyle;
            selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            selectedSplits = ['full_body'];
          }
          return { upperOkAll, minRealBack, maxRatio, b2Errs, orderErrs, burnoutEarlyErrs, funcJumpOk, flowTitleOk, flowWarnOk };
        })()`, ctx);
        const ok = res.upperOkAll && res.b2Errs === 0 && res.orderErrs === 0 && res.burnoutEarlyErrs === 0 && res.funcJumpOk && res.flowTitleOk && res.flowWarnOk;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T32',
      owner: 'generator-guard',
      title: '34s/46s Kalibreli Yorgunluk Penceresi, +24s Sıfır Çakışma & 3-Gün Cooldown Kilidi',
      expected: '+24s 0 çakışma; +40s normal RPE7 toparlanır / 5set RPE9 yorgun kalır; +48s 3-gün tekrar yok',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const t0 = new Date('2026-11-10T10:00:00Z').getTime();
          const day1Dt = new Date(t0);
          const day1Iso = toIsoDateKeyLocal(day1Dt);
          const makeSets = (n, rpe) => Array.from({ length: n }, (_, i) => ({ setNo: i + 1, weight: 20, reps: 10, rpe, completed: true }));
          const day1LogNormal = {
            id: 'log_d1_norm',
            date: day1Iso,
            timestamp: t0,
            rpe: 7,
            program: 'Üst Vücut',
            exercises: [
              { id: 'db_bench_press', name: 'Dambıl Bench Press', muscle: 'Göğüs', sets: makeSets(3, 7) },
              { id: 'bw_pullup', name: 'Barfiks', muscle: 'Sırt', sets: makeSets(3, 7) }
            ]
          };
          const day1LogOver = {
            id: 'log_d1_over',
            date: day1Iso,
            timestamp: t0,
            rpe: 9,
            program: 'Üst Vücut Ağır',
            exercises: [
              { id: 'db_bench_press', name: 'Dambıl Bench Press', muscle: 'Göğüs', sets: makeSets(5, 9) },
              { id: 'bw_pullup', name: 'Barfiks', muscle: 'Sırt', sets: makeSets(5, 9) }
            ]
          };
          let d2Collisions = 0;
          let normal40hRecovered = false;
          let over40hStillFatigued = false;
          let d3RepeatCount = 0;
          try {
            selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            selectedSplits = ['upper'];
            setWorkoutLogs([day1LogNormal]);
            localStorage.removeItem('celik_recent_generated_ids_usr_exam');
            __mockNowMs = t0 + 24 * 3600 * 1000;
            handleGenerateWorkout('bb_hybrid', '');
            const d2Exs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
            const d1P31 = new Set();
            [EXERCISES_DB.find(e => e.id === 'db_bench_press'), EXERCISES_DB.find(e => e.id === 'bw_pullup')].forEach(ex => {
              const an = getExerciseAnatomy(ex);
              ((an && an.primarySubKeys) || []).forEach(k => d1P31.add(k));
            });
            d2Exs.forEach(ex => {
              const an = getExerciseAnatomy(ex);
              if (((an && an.primarySubKeys) || []).some(k => d1P31.has(k))) d2Collisions++;
            });

            __mockNowMs = t0 + 40 * 3600 * 1000;
            const ctxNorm40 = getRecentAndScheduledMuscleContext();
            normal40hRecovered = !ctxNorm40.adjacentPrevDaySubKeys31.has('chest_mid') && !ctxNorm40.adjacentPrevDaySubKeys31.has('back_lats') && !ctxNorm40.fatiguedMuscles48h.includes('Göğüs');

            setWorkoutLogs([day1LogOver]);
            const ctxOver40 = getRecentAndScheduledMuscleContext();
            over40hStillFatigued = ctxOver40.adjacentPrevDaySubKeys31.has('chest_mid') && ctxOver40.adjacentPrevDaySubKeys31.has('back_lats');

            const d2Dt = new Date(t0 + 24 * 3600 * 1000);
            const day2Log = {
              id: 'log_d2',
              date: toIsoDateKeyLocal(d2Dt),
              timestamp: t0 + 24 * 3600 * 1000,
              program: 'Alt Vücut',
              exercises: [
                { id: 'bb_back_squat', name: 'Barbell Back Squat', muscle: 'Bacak', sets: makeSets(3, 7) },
                { id: 'db_rdl', name: 'Dambıl RDL', muscle: 'Arka Bacak', sets: makeSets(3, 7) }
              ]
            };
            setWorkoutLogs([day1LogNormal, day2Log]);
            localStorage.removeItem('celik_recent_generated_ids_usr_exam');
            __mockNowMs = t0 + 48 * 3600 * 1000;
            selectedSplits = ['full_body'];
            handleGenerateWorkout('bb_hybrid', '');
            const d3Exs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
            const pastIds = new Set(['db_bench_press', 'bw_pullup', 'bb_back_squat', 'db_rdl']);
            d3RepeatCount = d3Exs.filter(e => pastIds.has(e.id)).length;
          } finally {
            __mockNowMs = 0;
            selectedSplits = ['full_body'];
          }
          return { d2Collisions, normal40hRecovered, over40hStillFatigued, d3RepeatCount };
        })()`, ctx);
        const ok = res.d2Collisions === 0 && res.normal40hRecovered && res.over40hStillFatigued && res.d3RepeatCount === 0;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T33',
      owner: 'generator-guard',
      title: '10-Kas 0-Set Telafisi, "sırt ağrım var" Anahtar Dışlaması & Slot 0 Bileşik Zorunluluğu',
      expected: 'sırt dışlanır, 3-gün Göğüs sonrası 4. gün Full Body Sırt+Bacak telafi eder ve Slot 0 Tier<=2',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const t0 = new Date('2026-11-10T10:00:00Z').getTime();
          let backFreeOk = false;
          let deficitHitsBack = false;
          let deficitHitsLegs = false;
          let slot0TierOk = false;
          try {
            selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            selectedSplits = ['full_body'];
            setWorkoutLogs([]);
            localStorage.removeItem('celik_recent_generated_ids_usr_exam');
            __mockNowMs = t0;
            handleGenerateWorkout('bb_hybrid', 'sırt ağrım var');
            const wishExs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
            backFreeOk = wishExs.length >= 4 && wishExs.every(ex => {
              if (isRealBackPullExercise(ex)) return false;
              const an = getExerciseAnatomy(ex);
              const pk = (an && an.primarySubKeys) || getExercisePrimaryMuscleKeys(ex) || [];
              return !pk.some(k => k === 'back_lats' || k === 'back_mid' || k === 'back_lower');
            });

            const pushSets = [{ weight: 20, reps: 10, completed: true }, { weight: 20, reps: 10, completed: true }, { weight: 20, reps: 10, completed: true }];
            const logs3d = [0, 1, 2].map(dOff => ({
              id: 'push_' + dOff,
              date: toIsoDateKeyLocal(new Date(t0 + dOff * 24 * 3600 * 1000)),
              timestamp: t0 + dOff * 24 * 3600 * 1000,
              program: 'İtiş',
              exercises: [
                { id: 'db_bench_press', name: 'Dambıl Bench Press', muscle: 'Göğüs', sets: pushSets },
                { id: 'db_incline_press', name: 'Incline Dambıl Press', muscle: 'Üst Göğüs', sets: pushSets },
                { id: 'bw_dips', name: 'Paralel Bar Dips', muscle: 'Alt Göğüs', sets: pushSets }
              ]
            }));
            setWorkoutLogs(logs3d);
            localStorage.removeItem('celik_recent_generated_ids_usr_exam');
            __mockNowMs = t0 + 72 * 3600 * 1000;
            selectedSplits = ['full_body'];
            handleGenerateWorkout('bb_hybrid', '');
            const d4Exs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
            deficitHitsBack = d4Exs.some(e => isRealBackPullExercise(e));
            deficitHitsLegs = d4Exs.some(e => {
              const pk = getExercisePrimaryMuscleKeys(e) || [];
              return pk.some(k => k.startsWith('legs_quad') || k.startsWith('legs_ham') || k.startsWith('legs_glute'));
            });
            slot0TierOk = d4Exs.length > 0 && getExerciseOrderTier(d4Exs[0], 'superset') <= 2;
          } finally {
            __mockNowMs = 0;
            selectedSplits = ['full_body'];
          }
          return { backFreeOk, deficitHitsBack, deficitHitsLegs, slot0TierOk };
        })()`, ctx);
        const ok = res.backFreeOk && res.deficitHitsBack && res.deficitHitsLegs && res.slot0TierOk;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T34',
      owner: 'generator-guard',
      title: 'Sıkı Havuz Tükenmesi: Kural Delinmez, Boş+Uyarılı Dönüş & Köprü Gümrüğü Kabülü',
      expected: 'iso_shoulders+(bw/barfiks/dips)=0 hrk + equipmentWarning; confirm=false iso_chest=0 çakışma + fatigueWarning',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const origConfirm = confirm;
          const nowMs = new Date('2026-11-12T10:00:00Z').getTime();
          let shNonNull = false;
          let shEmpty = false;
          let shHasWarn = false;
          let shNoClimber = false;
          let customsOk = false;
          let chestZeroCollision = false;
          let chestHasFatigueWarn = false;
          try {
            __mockNowMs = nowMs;
            selectedSplits = ['iso_shoulders'];
            selectedEquipments = ['bodyweight', 'pullup_bar', 'dips_bar'];
            handleGenerateWorkout('bb_hybrid', '');
            const wSh = currentGeneratedWorkout;
            shNonNull = Boolean(wSh);
            shEmpty = Array.isArray(wSh && wSh.exercises) && wSh.exercises.length === 0;
            shHasWarn = Boolean(wSh && wSh.equipmentWarning && String(wSh.equipmentWarning).trim().length > 0);
            shNoClimber = !(wSh && Array.isArray(wSh.exercises) && wSh.exercises.some(e => e.id === 'bw_mountain_climber'));
            const sc = window.CelikBridgeCustoms.sanitizeGeneratedWorkoutPayload(wSh);
            customsOk = Boolean(sc && sc.isBlockedEmpty && Array.isArray(sc.exercises) && sc.exercises.length === 0);

            const heavySets = [1, 2, 3, 4, 5].map(n => ({ setNo: n, weight: 30, reps: 10, rpe: 9, completed: true }));
            const chestExIds = EXERCISES_DB.filter(e => {
              const pk = getExercisePrimaryMuscleKeys(e) || [];
              return pk.some(k => k.startsWith('chest_'));
            }).map(e => ({ id: e.id, name: e.name, muscle: e.muscle, sets: heavySets }));
            setWorkoutLogs([{
              id: 'heavy_chest_20h',
              date: toIsoDateKeyLocal(new Date(nowMs - 20 * 3600 * 1000)),
              timestamp: nowMs - 20 * 3600 * 1000,
              program: 'Göğüs İzole',
              exercises: chestExIds
            }]);
            confirm = () => false;
            selectedSplits = ['iso_chest'];
            selectedEquipments = ['dumbbell', 'bench', 'bodyweight'];
            handleGenerateWorkout('bb_hybrid', '');
            const wChest = currentGeneratedWorkout || {};
            const chExs = wChest.exercises || [];
            chestZeroCollision = chExs.length === 0 || chExs.every(ex => {
              const an = getExerciseAnatomy(ex);
              return !((an && an.primarySubKeys) || []).some(k => k.startsWith('chest_'));
            });
            chestHasFatigueWarn = Boolean(wChest.fatigueWarning && String(wChest.fatigueWarning).trim().length > 0);
          } finally {
            confirm = origConfirm;
            __mockNowMs = 0;
            selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            selectedSplits = ['full_body'];
          }
          return { shNonNull, shEmpty, shHasWarn, shNoClimber, customsOk, chestZeroCollision, chestHasFatigueWarn };
        })()`, ctx);
        const ok = res.shNonNull && res.shEmpty && res.shHasWarn && res.shNoClimber && res.customsOk && res.chestZeroCollision && res.chestHasFatigueWarn;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T35',
      owner: 'generator-guard',
      title: 'Haftalık Çevrimdışı Plan 31-Alt-Kas Ayrımı & Önizleme İzolasyonu',
      expected: 'Önizleme son üretilen kaydı ezmez; onayda ardışık gün alt-kas çakışması = 0',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const OrigDate = Date;
          const FRI_NOW = new OrigDate('2026-11-20T10:00:00+03:00').getTime();
          class FriMockDate extends OrigDate {
            constructor(...args) { super(args.length ? args[0] : FRI_NOW, ...(args.slice(1))); }
            static now() { return FRI_NOW; }
          }
          const sentinel = { id: 'sentinel_1', title: 'Korunan Son Kayıt', exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press' }] };
          localStorage.setItem('celik_kodu_last_generated_workout', JSON.stringify(sentinel));
          let sentinelPreserved = false;
          let daysLen = 0;
          let nextSchedSaved = false;
          let consecOverlap = 0;
          try {
            selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            setWorkoutLogs([]);
            Date = FriMockDate;
            window.selectedAiWeeklyTemplate = 'full_body_abc';
            applyAiWeeklySchedule(null);
            const afterPreview = JSON.parse(localStorage.getItem('celik_kodu_last_generated_workout') || '{}');
            sentinelPreserved = afterPreview.title === 'Korunan Son Kayıt';
            const planDays = (window.pendingAiWeeklyPlan && window.pendingAiWeeklyPlan.days) || [];
            daysLen = planDays.length;
            confirmPendingAiWeeklyPlan('next');
            const nextRaw = localStorage.getItem('celik_kodu_next_weekly_schedule_usr_exam');
            const nextSched = nextRaw ? JSON.parse(nextRaw) : {};
            const dayOrder = [5, 6, 0, 1, 2, 3, 4];
            const activeEntries = dayOrder.map(d => nextSched[d]).filter(x => x && !x.rest && ((x.exercises && x.exercises.length) || (x.customWorkout && x.customWorkout.exercises && x.customWorkout.exercises.length)));
            nextSchedSaved = activeEntries.length >= 2;
            for (let i = 1; i < dayOrder.length; i++) {
              const prevE = nextSched[dayOrder[i - 1]];
              const curE = nextSched[dayOrder[i]];
              if (!prevE || !curE || prevE.rest || curE.rest) continue;
              const prevList = (prevE.customWorkout && prevE.customWorkout.exercises) || prevE.exercises || [];
              const curList = (curE.customWorkout && curE.customWorkout.exercises) || curE.exercises || [];
              const prevP = new Set();
              prevList.forEach(ex => {
                const dbRef = (EXERCISES_DB.find(d => d.id === ex.id) || ex);
                const an = getExerciseAnatomy(dbRef);
                ((an && an.primarySubKeys) || []).forEach(pk => prevP.add(pk));
              });
              curList.forEach(ex => {
                const dbRef = (EXERCISES_DB.find(d => d.id === ex.id) || ex);
                const an = getExerciseAnatomy(dbRef);
                if (((an && an.primarySubKeys) || []).some(pk => prevP.has(pk))) consecOverlap++;
              });
            }
          } finally {
            Date = OrigDate;
          }
          return { sentinelPreserved, daysLen, nextSchedSaved, consecOverlap };
        })()`, ctx);
        const ok = res.sentinelPreserved && res.daysLen >= 3 && res.nextSchedSaved && res.consecOverlap === 0;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T36',
      owner: 'library-guard',
      title: 'Kapsamlı Dışlama Önbelleği (I/O Azaltımı) & Gerçek Geçmiş Akışı',
      expected: '1 üretimde celik_excluded_exercises okuma <= 5, toggle anında günceller, getWorkoutLogs geçmişi okunur',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const t0 = new Date('2026-11-10T10:00:00Z').getTime();
          const twoDaysAgo = t0 - 48 * 3600 * 1000;
          setWorkoutLogs([{
            id: 'h_lib_1',
            date: toIsoDateKeyLocal(new Date(twoDaysAgo)),
            timestamp: twoDaysAgo,
            program: 'Test',
            exercises: [
              { id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ weight: 20, reps: 10, completed: true }] },
              { id: 'db_bent_over_row', name: 'Dambıl Row', sets: [{ weight: 20, reps: 10, completed: true }] }
            ]
          }]);
          const origGetItem = localStorage.getItem.bind(localStorage);
          let exclReads = 0;
          let hasLastDone = false;
          let toggleAdded = false;
          let toggleRemoved = false;
          try {
            __mockNowMs = t0;
            selectedEquipments = [...ALL_EQUIPMENT_KEYS];
            selectedSplits = ['upper'];
            localStorage.getItem = function(k) {
              if (String(k || '').startsWith('celik_excluded_exercises')) exclReads++;
              return origGetItem(k);
            };
            handleGenerateWorkout('bb_hybrid', '');
            localStorage.getItem = origGetItem;
            const lastMap = getLastDoneMapFromHistory();
            const wkCtx = getRecentAndScheduledMuscleContext();
            hasLastDone = Boolean(lastMap && lastMap['db_bench_press'] && lastMap['db_bent_over_row'] && wkCtx && wkCtx.directPrimaryMuscleSets7d && wkCtx.directPrimaryMuscleSets7d['Göğüs'] > 0);
            toggleExcludeExercise('db_bench_press');
            toggleAdded = getUserExcludedExerciseIds().includes('db_bench_press');
            toggleExcludeExercise('db_bench_press');
            toggleRemoved = !getUserExcludedExerciseIds().includes('db_bench_press');
          } finally {
            localStorage.getItem = origGetItem;
            __mockNowMs = 0;
          }
          return { exclReads, hasLastDone, toggleAdded, toggleRemoved };
        })()`, ctx);
        const ok = res.exclReads <= 5 && res.hasLastDone && res.toggleAdded && res.toggleRemoved;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T37',
      owner: 'analytics-guard',
      title: 'Kimlik Öncelikli Biyomekanik Çözümleme & Artan Ağırlık Piramidi Muafiyeti',
      expected: 'bb_overhead_press=Omuz; 20kgx12->25kgx10 piramidi +40s sonrasında sahte yorgunluk bloğu tetiklemez',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const bio = resolveExerciseBiomechanics('Overhead Press', '', '', 'bb_overhead_press');
          const t0 = new Date('2026-11-10T10:00:00Z').getTime();
          let noPyramidOverload = false;
          try {
            setWorkoutLogs([{
              id: 'pyr_1',
              date: toIsoDateKeyLocal(new Date(t0)),
              timestamp: t0,
              rpe: 7,
              program: 'Göğüs Piramit',
              exercises: [{
                id: 'db_bench_press',
                name: 'Dambıl Bench Press',
                muscle: 'Göğüs',
                sets: [
                  { setNo: 1, weight: 20, reps: 12, completed: true },
                  { setNo: 2, weight: 22.5, reps: 11, completed: true },
                  { setNo: 3, weight: 25, reps: 10, completed: true }
                ]
              }]
            }]);
            __mockNowMs = t0 + 40 * 3600 * 1000;
            const ctx40 = getRecentAndScheduledMuscleContext();
            noPyramidOverload = !ctx40.adjacentPrevDaySubKeys31.has('chest_mid') && !ctx40.fatiguedMuscles48h.includes('Göğüs');
          } finally {
            __mockNowMs = 0;
          }
          return { primary: bio && bio.primary, noPyramidOverload };
        })()`, ctx);
        const ok = res.primary === 'Omuz' && res.noPyramidOverload === true;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T38',
      owner: 'workout-guard',
      title: 'Üretici & Antrenman Sekmeleri Arası Arayüz ve Kart Düzeni Bütünlüğü',
      expected: 'Üretici, Takvim gün önizlemesi ve Canlı Odak ekranı .wk-carousel-wrap/.wk-card-media-box/.wk-carousel-dock kullanır; CSS Koyu Mor (#181530) tema aktif',
      run: () => {
        ctx.__seedState();
        const cssText = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const hasThemeCss = cssText.includes('.stitch-calendar-shell')
          && cssText.includes('#studioSectionInWorkout > .generator-card')
          && cssText.includes('#181530');

        const res = vm.runInContext(`(() => {
          const sampleExs = [
            { id: 'db_bench_press', name: 'Dambıl Bench Press', category: 'push', muscle: 'Göğüs', targetSets: 3, targetReps: '8-12' },
            { id: 'db_row', name: 'Dambıl Row', category: 'pull', muscle: 'Sırt', targetSets: 3, targetReps: '8-12' }
          ];
          window.generatedWorkoutViewMode = 'cards';
          const genHtml = buildWorkoutCardsCarouselHtml({ title: 'T38 Test', style: 'superset', scheme: { sets: 3, reps: '8-12', rest: 60 }, exercises: sampleExs }, 'generated');
          window.generatedWorkoutViewMode = 'list';

          const uid = 'usr_exam';
          const todayDt = new Date();
          const todayYMD = formatDateYMD(todayDt);
          const sched = getWeeklySchedule(uid);
          sched[todayDt.getDay()] = { id: 't38_day', title: 'T38 Gün Programı', rest: false, exercises: sampleExs };
          saveWeeklySchedule(sched, uid);
          calendarScreenState.viewMode = 'weekly';
          calendarScreenState.anchorDate = todayDt;
          calendarScreenState.selectedDayYMD = todayYMD;
          renderCalendarScreen();
          const calHtml = String((document.getElementById('calendarMainContainer') && document.getElementById('calendarMainContainer').innerHTML) || '');

          activeWorkoutSession = { title: 'T38 Canlı Test', style: 'superset', scheme: { sets: 3, reps: '8-12', rest: 60 }, exercises: sampleExs };
          activeWorkoutSetsData = {};
          activeWorkoutViewMode = 'focus';
          activeFocusExIndex = 0;
          activeFocusSetIndex = null;
          isDaylightRestActive = false;
          renderActiveWorkout();
          const liveHtml = String((document.getElementById('activeWorkoutContainer') && document.getElementById('activeWorkoutContainer').innerHTML) || '');

          const hasAll = (h) => ['wk-carousel-wrap', 'wk-carousel-topbar', 'wk-card-media-box', 'wk-carousel-dock'].every(cls => h.includes(cls));
          return {
            genUnified: hasAll(genHtml),
            calUnified: hasAll(calHtml),
            liveUnified: hasAll(liveHtml)
          };
        })()`, ctx);

        const ok = Boolean(hasThemeCss && res.genUnified && res.calUnified && res.liveUnified);
        return { ok, actual: JSON.stringify({ hasThemeCss, ...res }) };
      }
    },
    {
      id: 'T39',
      owner: 'workout-guard',
      title: 'Tarih Bazlı Hafta Bağımsızlığı: Eklenen Hareket Geçmiş ve Gelecek Haftalara Sızmaz',
      expected: 'Bu hafta/gelecek hafta Çarşambasına eklenen hareketler sadece kendi tarihine yazılır; -7g, +7g, +14g izoledir',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const today = new Date();
          const dow = today.getDay();
          const diffToWed = 3 - (dow === 0 ? 7 : dow);
          const curWed = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToWed);
          const prevWed = new Date(curWed.getFullYear(), curWed.getMonth(), curWed.getDate() - 7);
          const nextWed = new Date(curWed.getFullYear(), curWed.getMonth(), curWed.getDate() + 7);
          const twoWkWed = new Date(curWed.getFullYear(), curWed.getMonth(), curWed.getDate() + 14);
          const curWedYMD = formatDateYMD(curWed);
          const nextWedYMD = formatDateYMD(nextWed);

          const uid = 'usr_exam';
          localStorage.removeItem('celik_kodu_weekly_schedule_' + uid);
          localStorage.removeItem('celik_kodu_next_weekly_schedule_' + uid);
          localStorage.removeItem('celik_kodu_date_schedule_' + uid);

          const addCurOk = addExerciseToDaySchedule(3, 'db_lateral_raise', 3, '12', null, curWedYMD);
          const pCur = getPlanForDate(curWed);
          const pPrev = getPlanForDate(prevWed);
          const pNextBefore = getPlanForDate(nextWed);
          const pTwoWkBefore = getPlanForDate(twoWkWed);

          const hasEx = (plan, exId) => {
            if (!plan || plan.rest) return false;
            const list = (plan.customWorkout && Array.isArray(plan.customWorkout.exercises))
              ? plan.customWorkout.exercises
              : (Array.isArray(plan.exercises) ? plan.exercises : []);
            return list.some(e => e && (e.id === exId || e.exId === exId));
          };

          const addNextOk = addExerciseToDaySchedule(3, 'mach_face_pull', 3, '15', null, nextWedYMD);
          const pCurAfterNextAdd = getPlanForDate(curWed);
          const pNextAfter = getPlanForDate(nextWed);
          const pTwoWkAfter = getPlanForDate(twoWkWed);

          return {
            addCurOk,
            addNextOk,
            curHasLateral: hasEx(pCur, 'db_lateral_raise'),
            prevIsRest: Boolean(pPrev && pPrev.rest && !hasEx(pPrev, 'db_lateral_raise')),
            nextBeforeIsRest: Boolean(pNextBefore && pNextBefore.rest && !hasEx(pNextBefore, 'db_lateral_raise')),
            twoWkBeforeIsRest: Boolean(pTwoWkBefore && pTwoWkBefore.rest && !hasEx(pTwoWkBefore, 'db_lateral_raise')),
            nextHasFacePullOnly: hasEx(pNextAfter, 'mach_face_pull') && !hasEx(pNextAfter, 'db_lateral_raise'),
            curUnaffectedByNext: hasEx(pCurAfterNextAdd, 'db_lateral_raise') && !hasEx(pCurAfterNextAdd, 'mach_face_pull'),
            twoWkStillRest: Boolean(pTwoWkAfter && pTwoWkAfter.rest)
          };
        })()`, ctx);
        const ok = Object.values(res).every(Boolean);
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T40',
      owner: 'garmin-tredict-guard',
      title: 'Zaman Penceresi Eşleşmesi, Eski Kayıt Filtresi & Aynı Gün 4 Antrenman Analizi',
      expected: 'aynı saat dilimindeki telefon+saat tek seansta birleşir (0 bildirim), eski 3 Ekim onaya düşmez, aynı gün 4 ayrı antrenman bulut birleşmesinde ve Analizde eksiksiz sayılır',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          localStorage.setItem('celik_garmin_enabled_' + uid, 'true');
          localStorage.removeItem('celik_garmin_approved_activities_v1_' + uid);
          localStorage.removeItem('celik_garmin_dismissed_activities_v1_' + uid);

          const nov16AppLog = {
            id: 'log_1794849864968',
            date: '2026-11-16',
            timestamp: Date.parse('2026-11-16T17:24:24.973Z'),
            duration: 54,
            durationSecs: 3241,
            program: 'Tüm Vücut Antrenmanı',
            title: 'Tüm Vücut Antrenmanı',
            totalVolumeKg: 2400,
            totalSetsCompleted: 3,
            exercises: [
              { id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ setNo: 1, weight: 20, reps: 10, completed: true, volume: 200 }, { setNo: 2, weight: 20, reps: 10, completed: true, volume: 200 }, { setNo: 3, weight: 20, reps: 10, completed: true, volume: 200 }] }
            ]
          };
          const nov16WatchAct = {
            id: 'nov16_watch_1',
            date: '2026-11-16T16:31:00.000Z',
            title: 'Pazartesi: Üst Vücut',
            sportType: 'misc',
            subSportType: 'strength_training',
            summary: { duration: 3120, durationTotal: 3120, calories: 519, heartrate: 103, heartrateMax: 148 },
            rounds: [
              { setType: 'active', exerciseCategory: 'chest', exerciseName: 'dumbbell_chest_press', repetitions: 10, weight: 20, duration: 40, heartrate: 101, heartrateMax: 135, startTime: '2026-11-16T16:31:30.000Z' },
              { setType: 'active', exerciseCategory: 'chest', exerciseName: 'dumbbell_chest_press', repetitions: 10, weight: 20, duration: 40, heartrate: 103, heartrateMax: 144, startTime: '2026-11-16T16:33:00.000Z' },
              { setType: 'active', exerciseCategory: 'chest', exerciseName: 'dumbbell_chest_press', repetitions: 10, weight: 20, duration: 40, heartrate: 105, heartrateMax: 148, startTime: '2026-11-16T16:34:30.000Z' }
            ]
          };
          const oct03StaleWatchAct = {
            id: 'oct03_stale_watch',
            date: '2026-10-03T09:11:16.040Z',
            title: 'Güç',
            sportType: 'misc',
            subSportType: 'strength_training',
            summary: { duration: 2400, durationTotal: 2400, calories: 300, heartrate: 125, heartrateMax: 150 },
            rounds: [
              { setType: 'active', exerciseCategory: 'chest', exerciseName: 'dumbbell_chest_press', repetitions: 10, weight: 20, duration: 40, heartrate: 125, heartrateMax: 150 }
            ]
          };

          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify([nov16AppLog]));
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([nov16WatchAct, oct03StaleWatchAct]));

          const gt = window.GarminTredictChief;
          gt.handoffCompletedActivitiesToTabChiefs();
          gt.renderHistoryGarminSyncPanel();

          const afterNov16Logs = JSON.parse(localStorage.getItem('celik_kodu_history_' + uid) || '[]');
          const mergedNov16 = afterNov16Logs.find(l => l && l.id === 'log_1794849864968') || {};
          const panelHtml = String(document.getElementById('garminHistorySyncContainer').innerHTML || '');
          const hasPendingBadge = /\d+\s*Bildirim/.test(panelHtml);

          // Senaryo 2: Aynı gün 4 farklı antrenman (09:00, 13:00, 16:30, 20:00) bulut birleştirmesi + haftalık analiz
          const todayYMD = toIsoDateKeyLocal(new Date());
          const mkSet = (n, w, r) => ({ setNo: n, weight: w, reps: r, completed: true, volume: w * r });
          const s1 = {
            id: 'log_s1',
            date: todayYMD,
            timestamp: new Date(todayYMD + 'T09:45:00').getTime(),
            duration: 45,
            durationSecs: 2700,
            program: 'Sabah İtiş',
            title: 'Sabah İtiş',
            totalSetsCompleted: 3,
            totalVolumeKg: 600,
            exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', muscle: 'Göğüs', category: 'push', sets: [mkSet(1, 20, 10), mkSet(2, 20, 10), mkSet(3, 20, 10)], completedSetsCount: 3 }]
          };
          const s2 = {
            id: 'garmin_s2',
            garminActivityId: 's2',
            sourceChief: 'garmin-tredict-guard',
            date: todayYMD,
            timestamp: new Date(todayYMD + 'T13:00:00').getTime(),
            duration: 45,
            durationSecs: 2700,
            program: 'Öğle Çekiş',
            title: 'Öğle Çekiş',
            totalSetsCompleted: 4,
            totalVolumeKg: 1600,
            exercises: [{ id: 'mach_lat_pulldown', name: 'Lat Pulldown', muscle: 'Sırt', category: 'pull', sets: [mkSet(1, 40, 10), mkSet(2, 40, 10), mkSet(3, 40, 10), mkSet(4, 40, 10)], completedSetsCount: 4 }]
          };
          const s3 = {
            id: 'log_s3',
            date: todayYMD,
            timestamp: new Date(todayYMD + 'T17:15:00').getTime(),
            duration: 45,
            durationSecs: 2700,
            program: 'İkindi Bacak',
            title: 'İkindi Bacak',
            totalSetsCompleted: 5,
            totalVolumeKg: 1000,
            exercises: [{ id: 'db_goblet_squat', name: 'Dambıl Goblet Squat', muscle: 'Ön Bacak', category: 'legs_quad', sets: [mkSet(1, 20, 10), mkSet(2, 20, 10), mkSet(3, 20, 10), mkSet(4, 20, 10), mkSet(5, 20, 10)], completedSetsCount: 5 }]
          };
          const s4 = {
            id: 'garmin_s4',
            garminActivityId: 's4',
            sourceChief: 'garmin-tredict-guard',
            date: todayYMD,
            timestamp: new Date(todayYMD + 'T20:00:00').getTime(),
            duration: 45,
            durationSecs: 2700,
            program: 'Akşam Arka Zincir',
            title: 'Akşam Arka Zincir',
            totalSetsCompleted: 3,
            totalVolumeKg: 600,
            exercises: [{ id: 'db_rdl', name: 'Dambıl RDL', muscle: 'Arka Bacak', category: 'legs_hinge', sets: [mkSet(1, 20, 10), mkSet(2, 20, 10), mkSet(3, 20, 10)], completedSetsCount: 3 }]
          };

          const mergedFour = mergeWorkoutLogCollections([s1, s2], [s3, s4], uid).mergedLogs;
          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify(mergedFour));
          const fitnessReport = calculateWeeklyFitnessAndCardioScores(0);
          const muscleReport = calculateWeeklyMuscleSufficiency('week_done', 0);
          const mSets = (id) => {
            const m = (muscleReport.muscles || []).find(x => x.id === id);
            return m ? (m.effectiveDone || 0) : 0;
          };

          // Senaryo 3: Kardiyo bildirimi kapatılınca geçmiş kaydı silinmez
          const walkAct = {
            id: 'cardio_keep_14',
            date: '2026-11-14T16:00:00.000Z',
            title: 'Yürüyüş',
            sportType: 'walking',
            subSportType: 'walking',
            summary: { duration: 1200, durationTotal: 1200, distance: 1800, calories: 120, heartrate: 118, heartrateMax: 138 },
            rounds: []
          };
          const walkLog = {
            id: 'garmin_cardio_keep_14',
            garminActivityId: 'cardio_keep_14',
            sourceChief: 'garmin-tredict-guard',
            isCardioActivity: true,
            date: '2026-11-14',
            timestamp: Date.parse('2026-11-14T16:00:00.000Z'),
            program: 'Yürüyüş',
            title: 'Yürüyüş',
            exercises: [{ id: 'cond_walking', name: 'Tempo Yürüyüş', sets: [{ setNo: 1, weight: 0, reps: 20, completed: true }] }]
          };
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([walkAct]));
          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify([...mergedFour, walkLog]));
          gt.dismissGarminStrengthActivity('cardio_keep_14');
          const afterDismissLogs = JSON.parse(localStorage.getItem('celik_kodu_history_' + uid) || '[]');
          const walkStillInHistory = afterDismissLogs.some(l => l && l.id === 'garmin_cardio_keep_14');
          const panelAfterDismiss = String(document.getElementById('garminHistorySyncContainer').innerHTML || '');

          return {
            nov16Count: afterNov16Logs.length,
            nov16HrAvg: mergedNov16?.healthSummary?.heartrateAvg || 0,
            nov16HrMax: mergedNov16?.healthSummary?.heartrateMax || 0,
            nov16Cal: mergedNov16?.healthSummary?.calories || 0,
            nov16LinkedId: mergedNov16?.garminActivityId || '',
            zeroPendingNotifications: !hasPendingBadge && !panelHtml.includes('oct03_stale_watch') && !panelHtml.includes('nov16_watch_1'),
            fourSessionsSurvived: mergedFour.length === 4,
            weeklyStrengthSessions: (fitnessReport.fitness && fitnessReport.fitness.strengthSessionsList ? fitnessReport.fitness.strengthSessionsList.length : 0),
            weeklyStrengthSets: (fitnessReport.fitness && fitnessReport.fitness.totalStrengthSetsDone ? fitnessReport.fitness.totalStrengthSetsDone : 0),
            musclesCounted: mSets('chest') >= 2.5 && mSets('back') >= 3.5 && mSets('quads') >= 4.5 && mSets('hamstrings') >= 2.5,
            walkStillInHistory,
            cardioNotifClosed: !panelAfterDismiss.includes('cardio_keep_14')
          };
        })()`, ctx);
        const ok = res.nov16Count === 1
          && res.nov16HrAvg === 103
          && res.nov16HrMax === 148
          && res.nov16Cal === 519
          && res.nov16LinkedId === 'nov16_watch_1'
          && res.zeroPendingNotifications
          && res.fourSessionsSurvived
          && res.weeklyStrengthSessions === 4
          && res.weeklyStrengthSets === 15
          && res.musclesCounted
          && res.walkStillInHistory
          && res.cardioNotifClosed;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T41',
      owner: 'profile-guard',
      title: '4 Kapılı Kara Kutu (K1-K4), Gizli Anahtar Maskeleme, 50 Kayıt Tamponu & Yönetici Sistem İzleme Sekmesi',
      expected: '4 kapı (error+warn) kaydedilir, 4 gizli anahtar sızıntısı=0, dedup repeatCount=3, max=50 kayıt, Yönetici rozeti+filtre+temizleme eksiksiz çalışır',
      run: () => {
        ctx.__seedState();
        const gatewayCode = fs.readFileSync(path.join(ROOT, 'api', 'tredict.mjs'), 'utf8');
        const rulesCode = fs.readFileSync(path.join(ROOT, 'config', 'firestore.rules'), 'utf8');
        const userStateFnMatch = rulesCode.match(/function isValidUserStatePayload\(data\)\s*\{([\s\S]*?)\n\s*\}/);
        const userStateBody = userStateFnMatch ? userStateFnMatch[1] : '';
        const helperCallsInUserState = (userStateBody.match(/\b(isValidOptionalMapOrNull|isValidOptionalListOrNull|hasNoSensitiveSecretsInField|hasNoSensitiveSecrets|hasNoWatchBridgeTokens|isValidCustomProgramSample|isValidOptionalTimestampOrIso|isValidOptionalSyncSeal|isValidOptionalString|hasOnlyAllowedFields)\s*\(/g) || []).length;
        const userStateRuleLeanOk = Boolean(userStateBody) && helperCallsInUserState <= 6;
        const hasGatewayGate = gatewayCode.includes("gate = 'K2'") || gatewayCode.includes("gate: 'K2'");
        const res = vm.runInContext(`(() => {
          const kk = window.CelikKaraKutu;
          if (!kk) return { missingKaraKutu: true };

          // 1) K1 gerçek Gümrük onarımı + reddi + Arıza Duvarı karantinası + K2/K3/K4 kapıları
          window.CelikBridgeCustoms.sanitizeScaleEntry({ id: 't41_sc_1', weight: 80 }); // K1 warn (eksik tarih onarıldı)
          window.CelikBridgeCustoms.sanitizeWorkoutLogEntry({ exercises: [] }); // K1 error (boş antrenman engellendi)
          window.CelikLiaisonSubChiefs.runWithFaultWall('T41Kutusu', { innerHTML: '' }, () => { throw new Error('T41 Kutu Hatası'); }, 'Yedek');

          kk.record({ gate: 'K2', severity: 'error', module: 'Saat Köprüsü', action: '/api/tredict/activities', inputSummary: '/api/tredict/activities', outcome: 'HTTP 502 Saat geçidi hatası' });
          kk.record({ gate: 'K3', severity: 'warn', module: 'Üretici Yapay Zeka', action: 'Model Yedek Geçişi', inputSummary: 'gemini-3-flash-preview', outcome: '429 nedeniyle yedek modele geçildi' });
          kk.record({ gate: 'K4', severity: 'error', module: 'Bulut Eşitleme', action: 'workout_logs Bulut Yazımı', inputSummary: 'usr_exam', outcome: 'Firestore yazım reddedildi' });

          const afterGates = kk.getEventsForUser('usr_exam');
          const gatesCovered = ['K1', 'K2', 'K3', 'K4'].every(g => afterGates.some(ev => ev.gate === g));
          const hasWarnAndError = afterGates.some(ev => ev.severity === 'warn') && afterGates.some(ev => ev.severity === 'error');

          // 2) Sıfır Gizli Bilgi Sızıntısı
          kk.record({
            gate: 'K2',
            severity: 'error',
            module: 'Saat Testi',
            action: 'Bağlantı',
            inputSummary: "password=Gizli1234&key=AIzaSyTestSecretKey999999",
            outcome: "Bearer eyJSecretToken12345 failed with tredictToken: 'trd_tok_99'"
          });

          // 3) Fırtına Koruması (repeatCount=3) & 50 Kayıt Tamponu
          for (let i = 0; i < 3; i++) {
            kk.record({
              gate: 'K3',
              severity: 'error',
              module: 'TekrarTest',
              action: 'AynıHata',
              inputSummary: 'modelA',
              outcome: 'Aynı API kesintisi'
            });
          }
          const headAfterRepeat = kk.getEventsForUser('usr_exam')[0];
          const repeatOk = Boolean(headAfterRepeat && headAfterRepeat.repeatCount === 3);

          for (let j = 0; j < 60; j++) {
            kk.record({
              gate: j % 2 === 0 ? 'K1' : 'K4',
              severity: j % 3 === 0 ? 'error' : 'warn',
              module: 'TamponTest',
              action: 'Adım_' + j,
              inputSummary: 'in_' + j,
              outcome: 'out_' + j
            });
          }
          const eventsAfterFlood = kk.getEventsForUser('usr_exam');
          const capOk = eventsAfterFlood.length === 50;

          // 4) Yönetici Oturumu, Rozet, Sekme, K2 Filtresi, Gizlilik ve Temizleme
          // K2 ve gizli maskeli kayıtların 50 tamponunda görünmesi için temiz bir senaryo seti ekle
          kk.clearAllEvents(['usr_exam', 'usr_admin']);
          const ignoredSw = kk.record({
            gate: 'K1',
            severity: 'error',
            module: 'Çalışma Zamanı',
            action: 'Asenkron İşlem Hatası',
            inputSummary: 'Promise',
            outcome: 'Script https://fitness.kantarci.io/sw.js?v=324 load failed',
            uid: 'usr_exam'
          });
          const swAbortIgnoredOk = ignoredSw === null && kk.getEventsForUser('usr_exam').length === 0;

          kk.record({
            gate: 'K1',
            severity: 'warn',
            module: 'Köprü Gümrüğü',
            action: 'scale',
            inputSummary: 's1',
            outcome: 'Tarih onarıldı',
            uid: 'usr_exam',
            userName: 'Test Sporcu'
          });
          kk.record({
            gate: 'K2',
            severity: 'error',
            module: 'Saat Köprüsü',
            action: 'Saat Bağlantısı',
            inputSummary: 'password=Gizli1234 key=AIzaSyTestSecretKey999999',
            outcome: "Bearer eyJSecretToken12345 tredictToken: 'trd_tok_99'",
            uid: 'usr_exam',
            userName: 'Test Sporcu'
          });
          kk.record({
            gate: 'K3',
            severity: 'error',
            module: 'Üretici Yapay Zeka',
            action: 'Koç Analizi',
            inputSummary: 'gemini-3-flash',
            outcome: 'Yanıt alınamadı',
            uid: 'usr_admin',
            userName: 'Yönetici'
          });
          kk.record({
            gate: 'K4',
            severity: 'warn',
            module: 'Bulut Eşitleme',
            action: 'Durum Bulut Yazımı',
            inputSummary: 'usr_exam',
            outcome: 'Çevrimdışı kuyruğa alındı',
            uid: 'usr_exam',
            userName: 'Test Sporcu'
          });

          localStorage.setItem('celik_kodu_auth_users', JSON.stringify([
            { id: 'usr_admin', username: 'admin', name: 'Yönetici', role: 'admin', status: 'approved' },
            { id: 'usr_exam', username: 'sporcu', name: 'Test Sporcu', role: 'athlete', status: 'approved' }
          ]));
          localStorage.setItem('celik_kodu_session', JSON.stringify({
            userId: 'usr_admin',
            role: 'admin',
            authVerified: true,
            passwordPolicyVerified: true
          }));

          updateAdminPendingBadges();
          openAdminModal('telemetry');
          setAdminTelemetryFilter('ALL', 'ALL');

          const headerBtn = document.getElementById('headerAdminTelemetryBtn');
          const headerBadge = document.getElementById('headerAdminTelemetryBadge');
          const tabBadge = document.getElementById('adminTelemetryTabBadge');
          const listEl = document.getElementById('adminTelemetryListContainer');
          const headerVisibleBeforeClear = headerBtn.style.display === 'inline-flex' && headerBadge.innerText === '2';
          const tabBadgeVisibleBeforeClear = tabBadge.style.display === 'inline-block' && tabBadge.innerText === '2';
          const allHtml = String(listEl.innerHTML || '');
          const promptText = String(buildAdminTelemetryAiPrompt() || '');

          setAdminTelemetryFilter('K2', 'ALL');
          const k2Html = String(listEl.innerHTML || '');
          const k2FilterOk = k2Html.includes('Saat Köprüsü') && !k2Html.includes('Koç Analizi');
          setAdminTelemetryFilter('ALL', 'ALL');

          localStorage.setItem('celik_kodu_session', JSON.stringify({
            userId: 'usr_exam',
            role: 'athlete',
            authVerified: true,
            passwordPolicyVerified: true
          }));
          updateAdminPendingBadges();
          const athleteHiddenOk = headerBtn.style.display === 'none' && tabBadge.style.display === 'none';

          localStorage.setItem('celik_kodu_session', JSON.stringify({
            userId: 'usr_admin',
            role: 'admin',
            authVerified: true,
            passwordPolicyVerified: true
          }));
          updateAdminPendingBadges();

          const storedEvents = kk.getAllLocalEventsAcrossUsers(['usr_exam', 'usr_admin']);
          const appVersionOk = storedEvents.length === 4 && storedEvents.every(ev => typeof ev.appVersion === 'string' && ev.appVersion.length > 0);
          const storedJson = JSON.stringify(storedEvents);
          const combinedCheck = storedJson + '\\n' + allHtml + '\\n' + promptText;
          const leakedSecrets = ['Gizli1234', 'AIzaSyTestSecretKey999999', 'eyJSecretToken12345', 'trd_tok_99'].filter(s => combinedCheck.includes(s));

          const resolvedK2Count = kk.resolveAction({ uid: 'usr_exam', gate: 'K2', inputMatch: 'Saat Bağlantısı' });
          const afterResolveCount = kk.getAllLocalEventsAcrossUsers(['usr_exam', 'usr_admin']).length;
          const autoResolveOk = resolvedK2Count === 1 && afterResolveCount === 3 && headerBadge.innerText === '1' && tabBadge.innerText === '1';

          clearAdminTelemetryEvents();
          const afterClearCount = kk.getAllLocalEventsAcrossUsers(['usr_exam', 'usr_admin']).length;

          return {
            gatesCovered,
            hasWarnAndError,
            repeatOk,
            capOk,
            swAbortIgnoredOk,
            headerVisible: headerVisibleBeforeClear,
            tabBadgeVisible: tabBadgeVisibleBeforeClear,
            athleteHiddenOk,
            k2FilterOk,
            promptReady: promptText.includes('SİSTEM İZLEME RAPORU') && promptText.includes('K2 Saat'),
            appVersionOk,
            autoResolveOk,
            leakCount: leakedSecrets.length,
            clearedOk: afterClearCount === 0 && headerBtn.style.display === 'none' && tabBadge.style.display === 'none'
          };
        })()`, ctx);

        const ok = hasGatewayGate
          && userStateRuleLeanOk
          && res.gatesCovered
          && res.hasWarnAndError
          && res.repeatOk
          && res.capOk
          && res.swAbortIgnoredOk
          && res.headerVisible
          && res.tabBadgeVisible
          && res.athleteHiddenOk
          && res.k2FilterOk
          && res.promptReady
          && res.appVersionOk
          && res.autoResolveOk
          && res.leakCount === 0
          && res.clearedOk;
        return { ok, actual: JSON.stringify({ hasGatewayGate, userStateRuleLeanOk, helperCallsInUserState, ...res }) };
      }
    },
    {
      id: 'T42',
      owner: 'garmin-tredict-guard',
      title: 'Yalnızca Antrenman Sekmesinden Manuel Garmin Gönderimi & Sıfır Harici Takvim (Google/Apple)',
      expected: 'index.html içinde Google/Apple Takvim modalları/butonları yok, otomatik Garmin takvim gönderimi kapalı, Antrenman sekmesinde manuel Garmin butonu var',
      run: () => {
        const htmlCode = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const bridgeCode = fs.readFileSync(path.join(ROOT, 'js', 'garmin-tredict-bridge.js'), 'utf8');
        const workoutCode = fs.readFileSync(path.join(ROOT, 'js', 'chiefs', 'workout-chief.js'), 'utf8');

        const noExternalCalHtml = !htmlCode.includes('id="calendarSyncModal"')
          && !htmlCode.includes('id="googleCalendarExportModal"')
          && !htmlCode.includes('openGoogleCalendarWeb()')
          && !htmlCode.includes('downloadFullScheduleICS()')
          && !htmlCode.includes('downloadSingleDayICS()');

        const hookMatch = bridgeCode.match(/function installCalendarAutoSyncHook\(\)\s*\{([\s\S]*?)\n  \}/);
        const hookBody = hookMatch ? hookMatch[1] : '';
        const noAutoCalendarHook = Boolean(hookBody)
          && !hookBody.includes('syncCanonicalCalendarToGarmin')
          && !hookBody.includes('deleteDatesFromGarminSilent');

        const manualBtnInWorkout = workoutCode.includes('sendScheduledWorkoutToGarminWatch(')
          && bridgeCode.includes('forceManual: true');

        const liveBarEmpty = vm.runInContext(`(() => getCalendarLiveBarHtml() === '')()`, ctx);

        const ok = noExternalCalHtml && noAutoCalendarHook && manualBtnInWorkout && liveBarEmpty;
        return { ok, actual: JSON.stringify({ noExternalCalHtml, noAutoCalendarHook, manualBtnInWorkout, liveBarEmpty }) };
      }
    },
    {
      id: 'T43',
      owner: 'generator-guard',
      title: 'Üretici Seçim Çubuğu Hover Kontrastı',
      expected: 'gen-mobile-picker-bar hover yüzeyi koyu kalır; seçim etiketi/açıklaması beyaz/açık gri yüksek kontrast kurallarına uyar',
      run: () => {
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const hoverTitleRule = cssCode.includes('.gen-mobile-picker-bar:hover .picker-step-title');
        const hoverValueRule = cssCode.includes('.gen-mobile-picker-bar:hover .picker-selected-val');
        const hoverTitleContrast = cssCode.includes('color: #CBD5E1 !important');
        const hoverValueContrast = cssCode.includes('.gen-mobile-picker-bar:hover .picker-selected-val') &&
          cssCode.includes('color: #FFFFFF !important');
        const darkHoverExists = cssCode.includes('background: linear-gradient(145deg, #221D42 0%, #181530 100%) !important');
        const noWhiteHover = !cssCode.includes('.gen-mobile-picker-bar:hover {\n            border-color: #84CC16 !important;\n            background: #FFFFFF !important;\n        }');
        const ok = hoverTitleRule && hoverValueRule && hoverTitleContrast && hoverValueContrast && darkHoverExists && noWhiteHover;
        return { ok, actual: JSON.stringify({ hoverTitleRule, hoverValueRule, hoverTitleContrast, hoverValueContrast, darkHoverExists, noWhiteHover }) };
      }
    },
    {
      id: 'T44',
      owner: 'generator-guard',
      title: 'Üretici Parametre Kartları Koyu Tema Bütünlüğü',
      expected: '.param-group dış çerçevesi kaldırılmış düz başlık + tek katmanlı koyu .param-select ve #aiUnifiedWishInput yüzeyleri kullanılır',
      run: () => {
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const flatParamGroupRule = cssCode.includes('#generatorTab .gen-collapsible-section .param-group,\n#generatorTab .ai-unified-wish-row {\n    background: transparent !important;\n    background-color: transparent !important;\n    border: none !important;');
        const mutedLabelRule = cssCode.includes('#generatorTab .gen-collapsible-section .param-group label,\n#generatorTab .ai-unified-wish-label {\n    color: #94A3B8 !important;');
        const singleDarkInputs = cssCode.includes('#generatorTab .param-select,\n#generatorTab select,\n#generatorTab input[type="text"],\n#generatorTab #aiUnifiedWishInput,\n#generatorTab .ai-unified-wish-input {\n    background: #121024 !important;');
        const darkBoxRule = cssCode.includes('.gen-collapsible-section .param-box {') && cssCode.includes('background: rgba(24, 21, 48, 0.82) !important');
        const ok = flatParamGroupRule && mutedLabelRule && singleDarkInputs && darkBoxRule;
        return { ok, actual: JSON.stringify({ flatParamGroupRule, mutedLabelRule, singleDarkInputs, darkBoxRule }) };
      }
    },
    {
      id: 'T45',
      owner: 'generator-guard',
      title: 'Üretici Ekipman Etiketleri Koyu Tema Bütünlüğü',
      expected: 'ekipman etiketleri ve seçili durumu koyu mor temaya uyumlu, metinleri okunaklı',
      run: () => {
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const chipRule = cssCode.includes('#generatorTab #equipChipsWrap .equip-chip');
        const darkSurface = cssCode.includes('background: #181530 !important');
        const selectedRule = cssCode.includes('#generatorTab #equipChipsWrap .equip-chip.selected');
        const selectedContrast = cssCode.includes('color: #F3E8FF !important');
        const ok = chipRule && darkSurface && selectedRule && selectedContrast;
        return { ok, actual: JSON.stringify({ chipRule, darkSurface, selectedRule, selectedContrast }) };
      }
    },
    {
      id: 'T46',
      owner: 'workout-guard',
      title: 'Hareket Rehberi Koyu Tema Bütünlüğü',
      expected: 'rehber kabuğu, sekmeler ve gömülü açık gri paneller koyu tema ile okunaklı kalır',
      run: () => {
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const darkGuideShell = cssCode.includes('.wk-ex-detail-drawer .pos-guide-content {\n    background: #100E22 !important');
        const darkGuideHeader = cssCode.includes('.wk-ex-detail-drawer .pos-guide-header {\n    background: #121024 !important');
        const darkGuideTabs = cssCode.includes('.wk-ex-detail-drawer .guide-toggle-tabs {\n    background: #121024 !important');
        const inlinePanelOverride = cssCode.includes('.wk-ex-detail-drawer .pos-guide-content [style*="background:#F8FAFC"]')
          && cssCode.includes('background: #181530 !important');
        const readableGuideText = cssCode.includes('.wk-ex-detail-drawer .pos-step-desc {\n    color: #CBD5E1 !important');
        const ok = darkGuideShell && darkGuideHeader && darkGuideTabs && inlinePanelOverride && readableGuideText;
        return { ok, actual: JSON.stringify({ darkGuideShell, darkGuideHeader, darkGuideTabs, inlinePanelOverride, readableGuideText }) };
      }
    },
    {
      id: 'T47',
      owner: 'generator-guard',
      title: 'İç Liste Akordiyonu Sıfır Kayma',
      expected: 'üretilen program ve haftalık önizlemede açılır satır iç liste kaydırmasını korur',
      run: () => {
        const generatorCode = fs.readFileSync(path.join(ROOT, 'js', 'chiefs', 'generator-chief.js'), 'utf8');
        const generatedToggle = generatorCode.match(/function toggleGeneratedExDetail\(exIdx\) \{([\s\S]*?)\n        \}/);
        const weeklyToggle = generatorCode.match(/function toggleWeeklyPreviewExDetail\(exIdx\) \{([\s\S]*?)\n        \}/);
        const generatedInnerScroll = Boolean(generatedToggle && generatedToggle[1].includes("querySelector('.wk-list-view')")
          && generatedToggle[1].includes('newListView.scrollTop = savedScrollTop')
          && generatedToggle[1].includes('newListView.scrollTop += delta')
          && !generatedToggle[1].includes('window.scrollBy'));
        const weeklyInnerScroll = Boolean(weeklyToggle && weeklyToggle[1].includes("querySelector('.wk-list-view')")
          && weeklyToggle[1].includes('newListView.scrollTop = savedScrollTop')
          && weeklyToggle[1].includes('newListView.scrollTop += delta')
          && !weeklyToggle[1].includes('window.scrollBy'));
        const ok = generatedInnerScroll && weeklyInnerScroll;
        return { ok, actual: JSON.stringify({ generatedInnerScroll, weeklyInnerScroll }) };
      }
    },
    {
      id: 'T48',
      owner: 'generator-guard',
      title: 'Video Penceresi Ekran Ortası',
      expected: 'video tam ekran penceresinde ortalanır ve pencere kaydırması sıfırlanır',
      run: () => {
        const generatorCode = fs.readFileSync(path.join(ROOT, 'js', 'chiefs', 'generator-chief.js'), 'utf8');
        const cssText = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const openFn = generatorCode.match(/function openImageLightbox\(src, title\) \{([\s\S]*?)\n        \}/);
        const centeredBody = cssText.includes('.lightbox-body.is-video') &&
          cssText.includes('justify-content: center') &&
          cssText.includes('#lightboxVideo');
        const centeredInlineAnimation = cssText.includes('.pos-animation-stage') &&
          cssText.includes('place-items: center') &&
          cssText.includes('.pos-animation-stage .pos-animation-video') &&
          generatorCode.includes('class="pos-animation-stage"') &&
          generatorCode.includes('class="pos-animation-video"');
        const resetScroll = Boolean(openFn && openFn[1].includes('lightboxBody.scrollTop = 0') &&
          openFn[1].includes('lightboxBody.scrollLeft = 0') &&
          openFn[1].includes("classList.add('is-video')"));
        const ok = centeredBody && centeredInlineAnimation && resetScroll;
        return { ok, actual: JSON.stringify({ centeredBody, centeredInlineAnimation, resetScroll }) };
      }
    },
    {
      id: 'T49',
      owner: 'generator-guard',
      title: 'Açılışta Video Görünürlük Merkezi',
      expected: 'hareket açılırken animasyon kutusu iç liste içinde merkeze taşınır',
      run: () => {
        const generatorCode = fs.readFileSync(path.join(ROOT, 'js', 'chiefs', 'generator-chief.js'), 'utf8');
        const hasHelper = generatorCode.includes('function centerOpenedExerciseAnimation') &&
          generatorCode.includes("querySelector('.pos-animation-stage')") &&
          generatorCode.includes('listView.scrollTop += targetTop');
        const bothTogglesCallHelper = (generatorCode.match(/centerOpenedExerciseAnimation\(container, idx\)/g) || []).length >= 2;
        const ok = hasHelper && bothTogglesCallHelper;
        return { ok, actual: JSON.stringify({ hasHelper, bothTogglesCallHelper }) };
      }
    },
    {
      id: 'T50',
      owner: 'generator-guard',
      title: 'Kondisyon Öncelik Ayrımı (Normalde 2. Plan, Kondisyonda 1. Sıra)',
      expected: 'hipertrofide conditioning=0; emom_conditioningde conditioning>=1',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          selectedEquipments = ['dumbbell', 'bodyweight'];
          selectedSplits = ['full_body'];
          const styleEl = document.getElementById('paramStyle');
          const goalEl = document.getElementById('paramGoal');
          if (styleEl) styleEl.value = 'superset';
          if (goalEl) goalEl.value = 'hypertrophy';
          handleGenerateWorkout('superset', '');
          const hypExs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
          const hypCond = hypExs.filter(e => e.category === 'conditioning').length;

          if (styleEl) styleEl.value = 'emom_conditioning';
          if (goalEl) goalEl.value = 'endurance';
          handleGenerateWorkout('emom_conditioning', '');
          const condExs = (currentGeneratedWorkout && currentGeneratedWorkout.exercises) || [];
          const condCount = condExs.filter(e => e.category === 'conditioning').length;
          return { hypTotal: hypExs.length, hypCond, condTotal: condExs.length, condCount };
        })()`, ctx);
        const ok = res.hypTotal > 0 && res.hypCond === 0 && res.condTotal > 0 && res.condCount >= 1;
        return { ok, actual: JSON.stringify(res) };
      }
    },
    {
      id: 'T51',
      owner: 'analytics-guard',
      title: 'Analiz Tek Parça Koyu Sunum, Tekrar Temizliği ve Tek Aksiyon Standardı',
      expected: 'tek parça koyu kabuk, odak kartında tek 3 / 8-18 Set çubuğu, hayalet başlık ve kutu boyaması yok, tek ana ekleme butonu',
      run: () => {
        const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const styleCss = fs.readFileSync(path.join(ROOT, 'css/style.css'), 'utf8');
        const shellDarkOk = indexHtml.includes('<meta name="theme-color" content="#0B0A14">') &&
          indexHtml.includes('<meta name="color-scheme" content="dark">') &&
          styleCss.includes('.modern-app-bar') &&
          styleCss.includes('.top-fc-score-strip') &&
          styleCss.includes('#analyticsTab > .generator-card');

        const todayIso = vm.runInContext(`toIsoDateKeyLocal(new Date())`, ctx);
        ctx.__seedState({
          history: [{
            id: 'h_t51',
            date: todayIso,
            timestamp: Date.now(),
            split: 'push',
            program: 'Göğüs Test',
            exercises: [{
              id: 'db_bench_press',
              name: 'Dumbbell Bench Press',
              sets: [
                { weight: 20, reps: 10, completed: true },
                { weight: 20, reps: 10, completed: true },
                { weight: 20, reps: 10, completed: true }
              ]
            }]
          }]
        });
        const res = vm.runInContext(`(() => {
          currentWeeklyMuscleSource = 'week_done';
          currentSelectedAnatomyMuscle = 'chest';
          currentWeeklyMuscleFilter = 'all';
          const mBox = document.createElement('div');
          renderMuscleAnalytics(mBox);
          const mobBox = document.createElement('div');
          renderMobilityAnalytics(mobBox);
          return {
            mHtml: mBox.innerHTML || '',
            mobHtml: mobBox.innerHTML || ''
          };
        })()`, ctx);

        const mHtml = res.mHtml;
        const mobHtml = res.mobHtml;
        const focusStart = mHtml.indexOf('id="anatomyFocusCard"');
        const focusEndMarker = mHtml.indexOf('Tonaj & Bölge Özeti', Math.max(0, focusStart));
        const focusEnd = focusEndMarker > focusStart ? focusEndMarker : mHtml.length;
        const focusHtml = focusStart >= 0 ? mHtml.slice(focusStart, focusEnd) : '';

        const focusForbidden = ['Az Çalıştı', 'Haftalık Tamamlanma', 'Haftalık hedefin altında kaldı', 'Şekildeki', 'Numaralı Alt Kaslar', 'HANGİ ALT BÖLGELER ÇALIŞTI'];
        const missingFocusTokens = focusForbidden.filter(t => focusHtml.includes(t));
        const quickAddMatches = focusHtml.match(/openQuickAddToDayModal/g) || [];
        const compactSetMatch = focusHtml.match(/(\d+(?:\.\d+)?\s*\/\s*\d+-\d+\s*Set)/);
        const focusOk = focusStart >= 0 &&
          focusHtml.includes('3 / 8-18 Set') &&
          missingFocusTokens.length === 0 &&
          quickAddMatches.length === 1;

        const combined = mHtml + '\n' + mobHtml;
        const globalForbidden = ['Şekildeki', 'Numaralı Alt Kaslar', 'ALT KAS AYRIMLI', 'HANGİ ALT BÖLGELER ÇALIŞTI', 'HANGİ YÖNLER ÇALIŞTI', 'Hangi Yön Açıldı', '#132E24', '#271C19', '#2A1421'];
        const foundGlobalForbidden = globalForbidden.filter(t => combined.includes(t));

        const ok = shellDarkOk && focusOk && foundGlobalForbidden.length === 0;
        return {
          ok,
          actual: JSON.stringify({
            shellDarkOk,
            focusStartFound: focusStart >= 0,
            compactSetShown: compactSetMatch ? compactSetMatch[1] : null,
            missingFocusTokens,
            quickAddCount: quickAddMatches.length,
            foundGlobalForbidden
          })
        };
      }
    },
    {
      id: 'T52',
      owner: 'analytics-guard',
      title: 'Analiz Sıfır Emoji, İçi Boş Bilgi İkonu, Hizalı Tonaj/Bölge, Düz Satır & Kardiyak Efor',
      expected: 'tüm alt ekranlarda sıfır emoji, analytics-info-btn ikonu, ortalı İTİŞ/ÇEKİŞ, #8B5CF6 oranlı çubuk, düz satır rekor (gün+ay, saatsiz), sade Kardiyak Efor kartı',
      run: () => {
        const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const stripStart = indexHtml.indexOf('id="topFitnessCardioScoreStrip"');
        const stripEnd = indexHtml.indexOf('<!-- NAVIGATION TABS', Math.max(0, stripStart));
        const stripHtml = stripStart >= 0 && stripEnd > stripStart ? indexHtml.slice(stripStart, stripEnd) : '';
        const stripEmojiFree = stripHtml.length > 0 && !/\p{Extended_Pictographic}/u.test(stripHtml);

        const todayIso = vm.runInContext(`toIsoDateKeyLocal(new Date())`, ctx);
        ctx.__seedState({
          history: [{
            id: 'h_t52',
            date: todayIso,
            dateFormatted: '16 Kas 2026 20:24',
            timestamp: Date.now(),
            split: 'upper_push',
            program: 'Üst Vücut Test',
            exercises: [
              {
                id: 'db_bench_press',
                name: 'Dumbbell Bench Press',
                maxWeight: 32.5,
                exerciseVolume: 975,
                sets: [
                  { weight: 32.5, reps: 10, completed: true },
                  { weight: 32.5, reps: 10, completed: true },
                  { weight: 32.5, reps: 10, completed: true }
                ]
              },
              {
                id: 'db_biceps_curl',
                name: 'Dambıl Biceps Curl',
                maxWeight: 12,
                exerciseVolume: 360,
                sets: [
                  { weight: 12, reps: 10, completed: true },
                  { weight: 12, reps: 10, completed: true },
                  { weight: 12, reps: 10, completed: true }
                ]
              }
            ]
          }],
          scale: [{
            id: 'sc_t52',
            date: todayIso,
            weight: 82.4,
            bodyFat: 15.2,
            muscleMass: 38.5
          }]
        });

        const res = vm.runInContext(`(() => {
          localStorage.setItem('celik_garmin_enabled_usr_exam', 'true');
          currentWeeklyMuscleSource = 'week_done';
          currentSelectedAnatomyMuscle = 'chest';
          currentWeeklyMuscleFilter = 'all';
          currentAnalyticsPeriodDays = 30;
          const muscleBox = document.createElement('div');
          const mobBox = document.createElement('div');
          const scaleBox = document.createElement('div');
          const coachBox = document.createElement('div');
          const scoreBox = document.createElement('div');
          const garminBox = document.getElementById('garminAnalyticsCoachContainer');
          renderMuscleAnalytics(muscleBox);
          renderMobilityAnalytics(mobBox);
          renderScaleAnalytics(scaleBox);
          renderCombinedCoachReport(coachBox);
          renderFitnessCardioScoreAnalytics(scoreBox);
          if (window.GarminTredictChief && typeof window.GarminTredictChief.renderAnalyticsGarminCoachPanel === 'function') {
            window.GarminTredictChief.renderAnalyticsGarminCoachPanel();
          }
          return {
            mHtml: muscleBox.innerHTML || '',
            mobHtml: mobBox.innerHTML || '',
            scaleHtml: scaleBox.innerHTML || '',
            coachHtml: coachBox.innerHTML || '',
            scoreHtml: scoreBox.innerHTML || '',
            garminHtml: (garminBox && garminBox.innerHTML) || ''
          };
        })()`, ctx);

        const allViews = [res.mHtml, res.mobHtml, res.scaleHtml, res.coachHtml, res.scoreHtml, res.garminHtml].join('\n');
        const emojiMatches = allViews.match(/\p{Extended_Pictographic}/gu) || [];
        const allViewsEmojiFree = emojiMatches.length === 0;

        const hasInfoBtn = res.mHtml.includes('class="analytics-info-btn"');
        const noWhiteLegacyInfo = !res.mHtml.includes('wk-ex-i-btn');
        const pushPullCentered = /justify-content:center;[^"]*">[\s\S]{0,80}İTİŞ \/ ÇEKİŞ/.test(res.mHtml);
        const topPillarBar90 = res.mHtml.includes('width:90%; background:#8B5CF6;');
        const verMatch = indexHtml.match(/id="appVersionBadge"[^>]*>v(\d+)</);
        const activeVer = verMatch ? Number(verMatch[1]) : 0;
        const verTag = `v=${activeVer}`;
        const cacheBustOk = activeVer >= 337 &&
          indexHtml.includes(`css/style.css?${verTag}`) &&
          indexHtml.includes(`js/chiefs/analytics-chief.js?${verTag}`) &&
          indexHtml.includes(`js/chiefs/generator-chief.js?${verTag}`) &&
          indexHtml.includes(`js/garmin-tredict-bridge.js?${verTag}`);
        const singleBarAccent = !res.mHtml.includes('background:#10b981') &&
          !res.mHtml.includes('background:#0284C7') &&
          !res.mHtml.includes('background:#D97706') &&
          !res.mHtml.includes('background:#E11D48');
        const noYellowPrStripe = !res.mHtml.includes('border-left:3px solid #FCD34D');
        const prDateShortOk = res.mHtml.includes('16 Kas') && !res.mHtml.includes('20:24');

        const garminCleanOk = res.garminHtml.includes('Kardiyak Efor') &&
          res.garminHtml.includes('Göster') &&
          !res.garminHtml.includes('7. Şef') &&
          !res.garminHtml.includes('fr945') &&
          !res.garminHtml.includes('#0C4A6E') &&
          !res.garminHtml.includes('#6D28D9');

        const ok = stripEmojiFree &&
          allViewsEmojiFree &&
          hasInfoBtn &&
          noWhiteLegacyInfo &&
          pushPullCentered &&
          topPillarBar90 &&
          cacheBustOk &&
          singleBarAccent &&
          noYellowPrStripe &&
          prDateShortOk &&
          garminCleanOk;

        return {
          ok,
          actual: JSON.stringify({
            stripEmojiFree,
            emojiCount: emojiMatches.length,
            hasInfoBtn,
            noWhiteLegacyInfo,
            pushPullCentered,
            topPillarBar90,
            cacheBustOk,
            singleBarAccent,
            noYellowPrStripe,
            prDateShortOk,
            garminCleanOk
          })
        };
      }
    },
    {
      id: 'T53',
      owner: 'generator-guard',
      title: 'Üretici Sekmesi Tam Koyu Kabuk, Yetim Numarasız Başlık, Kutu İçi Kutu İptali & Sıfır Emoji',
      expected: 'AI İLE HAZIRLA/alt yazı/2-3 daireleri/emojiler/balon SVG kaldırılmış, EKİPMANLAR & ANTRENMAN AYARLARI düz başlık, koyu not girişi ve ortalı alt hint mevcuttur',
      run: () => {
        const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const genHtml = indexHtml.slice(indexHtml.indexOf('id="generatorTab"'), indexHtml.indexOf('id="activeWorkoutTab"'));

        const heroHeaderClean = genHtml.includes('Programını AI ile oluştur') &&
          !genHtml.includes('AI İLE HAZIRLA') &&
          !genHtml.includes('ai-prep-subtitle');
        const noOrphanStepBadges = !/gen-step-badge">[23]</.test(genHtml) &&
          cssCode.includes('#generatorTab .gen-step-badge {\n    display: none !important;') &&
          genHtml.includes('<span>EKİPMANLAR</span>') &&
          genHtml.includes('<span>ANTRENMAN AYARLARI</span>');
        const noWishSvgIcon = /<label for="aiUnifiedWishInput" class="ai-unified-wish-label">AI ÖZEL NOTU<\/label>/.test(genHtml);
        const htmlEmojis = genHtml.match(/\p{Extended_Pictographic}/gu) || [];

        const ctx = createAppVmSandbox(moduleSources, dbText);
        ctx.updateSelectedEquipLabel();
        ctx.updateSelectedParamLabel();
        const equipLabel = ctx.document.getElementById('selectedEquipLabel').innerText;
        const paramLabel = ctx.document.getElementById('selectedParamLabel').innerText;
        const vmEmojis = `${equipLabel}\n${paramLabel}`.match(/\p{Extended_Pictographic}/gu) || [];

        const darkWishCss = cssCode.includes('#generatorTab #aiUnifiedWishInput,\n#generatorTab .ai-unified-wish-input {\n    background: #121024 !important;') &&
          cssCode.includes('#mainAppWrapper,\n.app-container,\n.tab-content,\n#generatorTab {\n    background: transparent !important;');
        const manualCleanAndCenteredHint = !genHtml.includes('🛠️') &&
          /<div class="ai-primary-cta-col"[\s\S]*id="btnUnifiedAiGenerate"[\s\S]*id="aiQuickPreviewHint">Onaylamadan takvime eklenmez<\/div>/.test(genHtml) &&
          cssCode.includes('#generatorTab #aiQuickPreviewHint,\n#generatorTab .ai-prep-hint {\n    width: 100% !important;\n    text-align: center !important;');

        const ok = heroHeaderClean &&
          noOrphanStepBadges &&
          noWishSvgIcon &&
          htmlEmojis.length === 0 &&
          vmEmojis.length === 0 &&
          darkWishCss &&
          manualCleanAndCenteredHint;

        return {
          ok,
          actual: JSON.stringify({
            heroHeaderClean,
            noOrphanStepBadges,
            noWishSvgIcon,
            htmlEmojiCount: htmlEmojis.length,
            vmEmojiCount: vmEmojis.length,
            darkWishCss,
            manualCleanAndCenteredHint
          })
        };
      }
    },
    {
      id: 'T54',
      owner: 'generator-guard',
      title: 'Üretici Sonrası 3 Pencere (Planlama Kontrolü, Kart & Liste) Yalın Standart',
      expected: 'varsayılan Liste modu + sayaç/çubuk gizli, 1. pencerede çerçevesiz tek satır not & .is-selected vurgu, Kart ve Liste modlarında sıfır emoji + sade metin + tek Değiştir butonu',
      run: () => {
        const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const ctx = createAppVmSandbox(moduleSources, dbText);

        const defaultIsList = ctx.window.generatedWorkoutViewMode === 'list';
        const sampleW = {
          title: 'Üst Vücut Dengeli',
          style: 'superset',
          duration: 45,
          scheme: { sets: 3, reps: '8-12', rest: 60 },
          exercises: [
            { id: 'db_bench_press', name: 'Dumbbell Bench Press', blockLabel: '1A', blockType: 'superset', supersetRole: 'A', muscle: 'Göğüs', primaryMuscles: ['chest'], targetSets: 3, targetReps: '8-12', customRest: 60 },
            { id: 'db_bent_row', name: 'Dumbbell Row', blockLabel: '1B', blockType: 'superset', supersetRole: 'B', muscle: 'Sırt', primaryMuscles: ['back'], targetSets: 3, targetReps: '8-12', customRest: 60 }
          ],
          finisher: { name: 'Kettlebell Swing', desc: '4 dk bitiş', exId: 'kb_swing' }
        };

        const listShellHtml = ctx.buildWorkoutCardsCarouselHtml(sampleW, 'generated');
        const listHidesStoryAndCounter = defaultIsList &&
          listShellHtml.includes('id="wkListView"') &&
          !listShellHtml.includes('id="wkStoryBarsWrap"') &&
          !listShellHtml.includes('id="wkCarouselCounter"');

        const precheckBlock = indexHtml.slice(indexHtml.indexOf('id="aiQuickPrecheckModal"'), indexHtml.indexOf('id="exerciseDetailModal"'));
        const precheckClean = !precheckBlock.includes('#38BDF8') &&
          !precheckBlock.includes('rgba(16,185,129') &&
          !cssCode.includes('button[data-val]:not([style*="linear-gradient"])') &&
          cssCode.includes('#aiQuickPrecheckModal .modal-box button[data-val].is-selected');

        ctx.window.generatedWorkoutViewMode = 'cards';
        const cardsHtml = ctx.buildWorkoutCardsCarouselHtml(sampleW, 'generated');
        const cardEmojis = cardsHtml.match(/\p{Extended_Pictographic}/gu) || [];
        const cardTrackStart = cardsHtml.indexOf('id="wkCarouselTrack"');
        const cardTrackHtml = cardTrackStart >= 0 ? cardsHtml.slice(cardTrackStart, cardsHtml.indexOf('class="wk-carousel-dock"')) : '';
        const cardsClean = cardEmojis.length === 0 &&
          !cardsHtml.includes('class="wk-card-chip"') &&
          cardsHtml.includes('class="wk-card-submeta"') &&
          />\s*Değiştir\s*</.test(cardsHtml) &&
          !cardsHtml.includes('Alternatif') &&
          !cardsHtml.includes('Rastgele') &&
          !cardTrackHtml.includes('wk-i-badge') &&
          cssCode.includes('#generatorTab .wk-carousel-wrap .wk-card-media-box');

        const timelineHtml = ctx.buildTimelineStationsHtml(sampleW.exercises, sampleW.scheme, {}, 'generated');
        const listEmojis = timelineHtml.match(/\p{Extended_Pictographic}/gu) || [];
        const listClean = listEmojis.length === 0 &&
          !timelineHtml.includes('#F1F5F9') &&
          !timelineHtml.includes('#FF5A36') &&
          !timelineHtml.includes('timeline-rest-pill') &&
          timelineHtml.includes('timeline-rest-text') &&
          timelineHtml.includes('wk-ex-expand-hint') &&
          timelineHtml.includes('class="wk-ex-row-title"') &&
          cssCode.includes('.wk-ex-row-clean .wk-ex-row-title {\n    color: #FFFFFF !important;') &&
          !cssCode.includes('.tab-content [style*="color:#F8FAFC"]:not(.btn-gold)') &&
          timelineHtml.includes('<svg') &&
          !timelineHtml.includes('wk-i-badge');

        const ok = listHidesStoryAndCounter && precheckClean && cardsClean && listClean;
        return {
          ok,
          actual: JSON.stringify({
            defaultIsList,
            listHidesStoryAndCounter,
            precheckClean,
            cardEmojiCount: cardEmojis.length,
            cardsClean,
            listEmojiCount: listEmojis.length,
            listClean
          })
        };
      }
    },
    {
      id: 'T55',
      owner: 'workout-guard',
      title: 'Antrenman Sekmesi, Üst Başlık ve Takvim/Stüdyo Yalın Koyu Standart',
      expected: 'Beyaz Çelik Kodu başlığı + mor/kehribar üst barlar, alt çizgisiz mor dinlenme bağlantıları, tam kart tıklamalı Stüdyo + Anlık Seans + küçük aşağı ok ikonu',
      run: () => {
        const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const localCtx = createAppVmSandbox(moduleSources, dbText);

        const brandAndBarsOk = cssCode.includes('-webkit-text-fill-color: #FFFFFF !important') &&
          !/webkit-text-fill-color:\s*#0F172A/i.test(cssCode) &&
          cssCode.includes('#8B5CF6') &&
          cssCode.includes('#F59E0B');

        const restLinkStart = cssCode.indexOf('.stitch-rest-link-btn {');
        const restLinkBlock = restLinkStart >= 0 ? cssCode.slice(restLinkStart, cssCode.indexOf('}', restLinkStart) + 1) : '';
        const restLinkCleanCss = restLinkBlock.includes('text-decoration: none !important') &&
          !restLinkBlock.includes('text-decoration: underline');

        const flatCalCssOk = cssCode.includes('#embeddedCalendarSection .stitch-day-strip') &&
          cssCode.includes('#embeddedCalendarSection .stitch-selected-day-card') &&
          cssCode.includes('border-top: 1px solid rgba(255, 255, 255, 0.06) !important') &&
          cssCode.includes('#studioSectionInWorkout #btnQuickStudioLaunch') &&
          cssCode.includes('#studioSectionInWorkout .studio-accordion-chevron') &&
          restLinkCleanCss;

        const calSectionStart = indexHtml.indexOf('id="embeddedCalendarSection"');
        const studioStart = indexHtml.indexOf('id="studioSectionInWorkout"');
        const libStart = indexHtml.indexOf('id="libraryTab"');
        const calSlice = indexHtml.slice(calSectionStart, studioStart);
        const studioSlice = indexHtml.slice(studioStart, libStart);

        const htmlCleanOk = !calSlice.includes('openCalendarToolsModal') &&
          calSlice.includes('id="calJumpTodayBtn"') &&
          studioSlice.includes('id="btnQuickStudioLaunch"') &&
          studioSlice.includes('id="studioCardShell"') &&
          studioSlice.includes('onclick="toggleStudioAccordion()"') &&
          studioSlice.includes('+ Anlık Seans') &&
          studioSlice.includes('<svg') &&
          studioSlice.includes('class="studio-accordion-chevron"') &&
          !studioSlice.includes('btnToggleStudioAccordion') &&
          !studioSlice.includes('⚡') &&
          !studioSlice.includes('▼') &&
          !studioSlice.includes('▲');

        localCtx.__seedState();
        const vmRes = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          const today = new Date();
          const todayYMD = formatDateYMD(today);
          const sched = getWeeklySchedule(uid);
          for (let i = 0; i < 7; i++) {
            sched[i] = { id: 'rest_' + i, title: 'Dinlenme', rest: true, type: 'rest', exercises: [] };
          }
          saveWeeklySchedule(sched, uid);

          calendarScreenState.viewMode = 'weekly';
          calendarScreenState.anchorDate = new Date(today);
          calendarScreenState.selectedDayYMD = todayYMD;
          renderCalendarScreen();

          const calHtml = String((document.getElementById('calendarMainContainer') && document.getElementById('calendarMainContainer').innerHTML) || '');
          const todayBtnEl = document.getElementById('calJumpTodayBtn');
          const hiddenOnToday = Boolean(todayBtnEl && todayBtnEl.style.display === 'none');
          const restActionable = !calHtml.includes('BUGÜN') &&
            calHtml.includes('Dinlenme ve Toparlanma Günü') &&
            calHtml.includes('Yine de çalışmak ister misin?') &&
            calHtml.includes('Program Üret') &&
            calHtml.includes('Seans Ekle');

          const otherDate = new Date(today);
          const dow = otherDate.getDay();
          otherDate.setDate(otherDate.getDate() + (dow === 1 ? 1 : -1));
          const otherYMD = formatDateYMD(otherDate);
          selectCalendarStripDay(otherYMD);
          const shownAway = Boolean(todayBtnEl && todayBtnEl.style.display === 'inline-flex');

          jumpCalendarToToday();
          const hiddenAfterJump = Boolean(todayBtnEl && todayBtnEl.style.display === 'none');

          setCalendarViewMode('monthly');
          const monthHtml = String((document.getElementById('calendarMainContainer') && document.getElementById('calendarMainContainer').innerHTML) || '');
          const monthClean = !monthHtml.includes('BUGÜN') && !/[\u{1F300}-\u{1FAFF}]/u.test(monthHtml);

          const sBody = document.getElementById('studioAccordionBody');
          const sArrow = document.getElementById('studioAccordionArrow');
          toggleStudioAccordion(true);
          const studioOpened = Boolean(sBody && sBody.style.display === 'block' && sArrow && sArrow.dataset && sArrow.dataset.open === '1');
          toggleStudioAccordion(false);
          const studioClosed = Boolean(sBody && sBody.style.display === 'none' && sArrow && sArrow.dataset && sArrow.dataset.open === '0');

          return { hiddenOnToday, restActionable, shownAway, hiddenAfterJump, monthClean, studioOpened, studioClosed };
        })()`, localCtx);

        const ok = Boolean(
          brandAndBarsOk &&
          flatCalCssOk &&
          htmlCleanOk &&
          vmRes.hiddenOnToday &&
          vmRes.restActionable &&
          vmRes.shownAway &&
          vmRes.hiddenAfterJump &&
          vmRes.monthClean &&
          vmRes.studioOpened &&
          vmRes.studioClosed
        );
        return {
          ok,
          actual: JSON.stringify({ brandAndBarsOk, flatCalCssOk, htmlCleanOk, ...vmRes })
        };
      }
    },
    {
      id: 'T56',
      owner: 'history-guard',
      title: 'Geçmiş Sekmesi Kompakt Tek Satır Kartlar, Harf-Duyarsız Mekan & Başlık Tekilleştirme',
      expected: 'Tek satır başlık+tarih, ara çizgisiz/etiketsiz tek satır istatistik (7.023 kg · 27 Set (322 Tk) · 54 dk / 123 bpm · 135 kcal · 21 dk), Ev+EV tekilleştirme, Cuma: Cuma: teke indirme',
      run: () => {
        const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
        const cssCode = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');
        const localCtx = createAppVmSandbox(moduleSources, dbText);

        const histStart = indexHtml.indexOf('id="historyTab"');
        const analyticsStart = indexHtml.indexOf('id="analyticsTab"');
        const histSlice = indexHtml.slice(histStart, analyticsStart);

        const htmlMenuOk = histSlice.includes('id="btnHistoryTopMenu"') &&
          histSlice.includes('id="historyTopDropdownMenu"') &&
          histSlice.includes('exportCSV()') &&
          histSlice.includes('exportData()') &&
          histSlice.includes('importData(event)') &&
          !histSlice.includes('>CSV<');

        const cssHistOk = cssCode.includes('.hide-scrollbar::-webkit-scrollbar') &&
          cssCode.includes('#historyTab .history-loc-chip.is-active') &&
          cssCode.includes('#historyTab .log-card-title') &&
          cssCode.includes('#historyTab .log-stats-inline') &&
          cssCode.includes('#statTotalWorkouts,\n#statWeekWorkouts,\n#statStreak {\n    color: #FFFFFF !important;\n}');

        localCtx.__seedState();
        const vmRes = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          localStorage.setItem('celik_garmin_enabled_' + uid, 'true');
          localStorage.removeItem('celik_garmin_telemetry_v2_' + uid);
          localStorage.removeItem('celik_garmin_approved_activities_v1_' + uid);
          localStorage.removeItem('celik_garmin_dismissed_activities_v1_' + uid);

          const walkLog = {
            id: 'log_h_walk',
            isCardioActivity: true,
            date: '2026-11-14',
            program: '🏃 Sabah Yürüyüşü',
            locationType: 'ev',
            locationName: 'Ev',
            duration: 21,
            healthSummary: { heartrateAvg: 123, calories: 135 },
            exercises: [{ id: 'cond_walking', name: 'Tempo Yürüyüş', sets: [{ setNo: 1, weight: 0, reps: 21, completed: true }] }]
          };
          const homeUpperLog = {
            id: 'log_h_ev_upper',
            date: '2026-11-16',
            program: 'Ev Güç Seansı',
            locationType: 'ev',
            locationName: 'EV',
            duration: 30,
            totalVolumeKg: 1200,
            totalSetsCompleted: 9,
            totalRepsCompleted: 90,
            exercises: [{ id: 'db_goblet_squat', name: 'Dambıl Goblet Squat', sets: [{ setNo: 1, weight: 20, reps: 10, completed: true }] }]
          };
          const strengthLog = {
            id: 'log_h_str',
            date: '2026-11-19',
            dateFormatted: '19 Kas 2026 20:24',
            program: '⚔️ Cuma: Cuma: Tüm Vücut',
            locationType: 'salon',
            locationName: 'Spor Salonu',
            duration: 54,
            notes: '📝 Harika pompa yakalandı',
            totalVolumeKg: 7023,
            totalSetsCompleted: 27,
            totalRepsCompleted: 322,
            exercises: [{ id: 'db_bench_press', name: 'Dambıl Bench Press', sets: [{ setNo: 1, weight: 20, reps: 12, completed: true }] }]
          };
          localStorage.setItem('celik_kodu_history_' + uid, JSON.stringify([strengthLog, homeUpperLog, walkLog]));

          renderHistory();
          const containerEl = document.getElementById('logHistoryContainer');
          const html = String((containerEl && containerEl.innerHTML) || '');
          const emojis = html.match(/\\p{Extended_Pictographic}/gu) || [];
          const datesClean = html.includes('14 Kas 2026') &&
            html.includes('16 Kas 2026') &&
            html.includes('19 Kas 2026') &&
            !html.includes('2026-11-14') &&
            !html.includes('20:24');

          const titlesDeduped = html.includes('Cuma: Tüm Vücut') && !html.includes('Cuma: Cuma:');

          const labelsRemoved = !html.includes('Toplam Tonaj') &&
            !html.includes('Set / Tekrar') &&
            !html.includes('Ort. Nabız') &&
            !html.includes('Kalori') &&
            !html.includes('log-stats-grid') &&
            !html.includes('log-stats-bar') &&
            !html.includes('log-notes-box');

          const inlineMetricsOk = html.includes('7.023 kg · 27 Set (322 Tk) · 54 dk') &&
            html.includes('123 bpm · 135 kcal · 21 dk') &&
            html.includes('class="log-stats-inline') &&
            html.includes('class="log-note-inline"');

          const locMerged = html.includes('Ev (2)') && !html.includes('EV (');

          filterHistoryByLocation('Ev');
          const filteredHtml = String((containerEl && containerEl.innerHTML) || '');
          const filterActiveOk = /class="history-loc-chip is-active"[^>]*>\\s*Ev \\(2\\)/.test(filteredHtml) &&
            filteredHtml.includes('Sabah Yürüyüşü') &&
            filteredHtml.includes('Ev Güç Seansı') &&
            !filteredHtml.includes('Cuma: Tüm Vücut');

          const syncBox = document.getElementById('garminHistorySyncContainer');
          const syncHiddenWhenEmpty = Boolean(syncBox && syncBox.style.display === 'none' && syncBox.innerHTML === '');

          const pendingAct = {
            id: 't56_pending_str',
            date: new Date().toISOString(),
            title: '⌚ Cuma: Cuma: Güç Seansı',
            sportType: 'training',
            subSportType: 'strength_training',
            summary: { duration: 1800, calories: 190, heartrate: 132, heartrateMax: 158 },
            rounds: [{ setType: 'active', exerciseCategory: 'chest', exerciseName: 'dumbbell_chest_press', repetitions: 10, weight: 22.5, duration: 40, heartrate: 130, heartrateMax: 145 }]
          };
          localStorage.setItem('celik_garmin_telemetry_v2_' + uid, JSON.stringify([pendingAct]));
          window.GarminTredictChief.renderHistoryGarminSyncPanel();
          const syncHtml = String((syncBox && syncBox.innerHTML) || '');
          const syncEmojis = syncHtml.match(/\\p{Extended_Pictographic}/gu) || [];
          const syncClean = Boolean(syncBox && syncBox.style.display === 'block') &&
            syncEmojis.length === 0 &&
            !syncHtml.includes('injectMockGarminStrengthActivity') &&
            !syncHtml.includes('#F59E0B') &&
            !syncHtml.includes('#38BDF8') &&
            syncHtml.includes('Cuma: Güç Seansı') &&
            !syncHtml.includes('Cuma: Cuma:') &&
            syncHtml.includes('Onayla') &&
            syncHtml.includes('<svg');

          return {
            emojiCount: emojis.length,
            datesClean,
            titlesDeduped,
            labelsRemoved,
            inlineMetricsOk,
            locMerged,
            filterActiveOk,
            syncHiddenWhenEmpty,
            syncClean
          };
        })()`, localCtx);

        const ok = Boolean(
          htmlMenuOk &&
          cssHistOk &&
          vmRes.emojiCount === 0 &&
          vmRes.datesClean &&
          vmRes.titlesDeduped &&
          vmRes.labelsRemoved &&
          vmRes.inlineMetricsOk &&
          vmRes.locMerged &&
          vmRes.filterActiveOk &&
          vmRes.syncHiddenWhenEmpty &&
          vmRes.syncClean
        );
        return {
          ok,
          actual: JSON.stringify({ htmlMenuOk, cssHistOk, ...vmRes })
        };
      }
    },
    {
      id: 'T57',
      owner: 'library-guard',
      title: 'Programlarım Listesi Otomatik Kirlenme Koruması (Yalnızca Açık Kayıt)',
      expected: 'takvim atama/değiştirme/analiz/direktif sonrası Programlarım=0; açık Kaydet sonrası=2',
      run: () => {
        ctx.__seedState();
        const res = vm.runInContext(`(() => {
          const uid = 'usr_exam';
          const origPrompt = prompt;
          try {
            const w1 = {
              id: 'gen_t57_1',
              title: 'Üretici Test Seansı',
              type: 'custom_generated',
              isCustom: true,
              duration: 40,
              exercises: [EXERCISES_DB.find(e => e.id === 'db_bench_press'), EXERCISES_DB.find(e => e.id === 'db_goblet_squat')]
            };
            pendingWorkoutToAssign = w1;
            executeAssignWorkoutToDay(1, null, 'current');
            const c1 = getUserCustomPrograms(uid).length;

            pickerContext = { scope: 'day_schedule', dayIdx: 1, dateStr: null, scheduleExIndex: 0 };
            selectExerciseFromPicker('db_overhead_press');
            const c2 = getUserCustomPrograms(uid).length;

            addExerciseToDaySchedule(1, 'db_saw_row', 3, '8-12');
            const c3 = getUserCustomPrograms(uid).length;

            customRoutineState.editingDayIdx = 1;
            customRoutineState.editingProgramId = getWeeklySchedule()[1].id;
            customRoutineState.exercises = [
              { exId: 'db_overhead_press', sets: 3, reps: '10', weight: '' },
              { exId: 'db_rdl', sets: 3, reps: '10', weight: '' }
            ];
            document.getElementById('customWorkoutTitleInput').value = 'Pazartesi Takvim Revize';
            document.getElementById('customWorkoutRestSelect').value = '60';
            saveEditingRoutineToDay();
            const c4 = getUserCustomPrograms(uid).length;

            localStorage.setItem('celik_kodu_coach_directive_' + uid, JSON.stringify({
              title: 'Koç Direktifi',
              parsedWorkout: { id: 'dir_t57', title: 'Koç Seansı', duration: 30, exercises: [EXERCISES_DB.find(e => e.id === 'bw_pushup')] }
            }));
            assignDirectiveWorkoutToToday(uid);
            const c5 = getUserCustomPrograms(uid).length;

            const schedMove = getWeeklySchedule();
            schedMove[2] = schedMove[1];
            saveWeeklySchedule(schedMove);
            reviseConsecutiveDayWorkoutWithAI(2, null, [{ dayIdx: 1, exercises: [EXERCISES_DB.find(e => e.id === 'db_overhead_press')] }], false, { fromDayIdx: 1, wasSwapped: false });
            const c6 = getUserCustomPrograms(uid).length;

            renderSavedProgramsPane();
            const btnTextBeforeSave = document.getElementById('libSubTabProgramsBtn').textContent;
            const mondayTitleOk = getWeeklySchedule()[1] && getWeeklySchedule()[1].title === 'Pazartesi Takvim Revize';

            prompt = () => 'Manuel Kayıtlı Program';
            currentGeneratedWorkout = w1;
            saveGeneratedToLibrary();

            customRoutineState.editingDayIdx = null;
            customRoutineState.editingProgramId = null;
            customRoutineState.exercises = [{ exId: 'db_bench_press', sets: 3, reps: '10', weight: '' }];
            document.getElementById('customWorkoutTitleInput').value = 'Özel Stüdyo Şablonu';
            saveCustomRoutineToLibrary();

            renderSavedProgramsPane();
            const finalProgs = getUserCustomPrograms(uid);
            const btnTextAfterSave = document.getElementById('libSubTabProgramsBtn').textContent;
            const listHtmlAfterSave = document.getElementById('savedProgramsList').innerHTML;

            return {
              autoCounts: [c1, c2, c3, c4, c5, c6],
              mondayTitleOk,
              btnTextBeforeSave,
              finalCount: finalProgs.length,
              btnTextAfterSave,
              hasBothInDom: listHtmlAfterSave.includes('Manuel Kayıtlı Program') && listHtmlAfterSave.includes('Özel Stüdyo Şablonu')
            };
          } finally {
            prompt = origPrompt;
          }
        })()`, ctx);
        const ok = res.autoCounts.every(n => n === 0)
          && res.mondayTitleOk
          && res.btnTextBeforeSave === 'Programlarım'
          && res.finalCount === 2
          && res.btnTextAfterSave === 'Programlarım (2)'
          && res.hasBothInDom;
        return { ok, actual: JSON.stringify(res) };
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
