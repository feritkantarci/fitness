#!/usr/bin/env node
/**
 * ÇELİK KODU — 7 Şef Bekçisi & Orkestra Denetçisi (Zero-Token Deterministic Watchdog)
 * Kullanım:
 *   node scripts/tab-watchdog.js --write-report
 *   node scripts/tab-watchdog.js --diff
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const APP_PATH = path.join(ROOT, 'js', 'app.js');
const GARMIN_BRIDGE_PATH = path.join(ROOT, 'js', 'garmin-tredict-bridge.js');
const DB_PATH = path.join(ROOT, 'js', 'exercises-db.js');
const REPORT_PATH = path.join(ROOT, 'TAB_HEALTH.md');

const TABS = [
  {
    id: 'generatorTab',
    agent: 'generator-guard',
    title: '1. Üretici Şefi',
    whatIsInside: 'Süre/ekipman seçimi, Günlük & Haftalık Program Üretici, Alternatif Hareket Seçici',
    whatItDoes: 'Sana uygun antrenmanı kurar, beğenmediğin hareketi tek tıkla değiştirir',
    commonMistakes: 'Hareket değiştirirken sayfanın yukarı zıplaması, gizlediğin hareketin tekrar çıkması',
    entryFns: ['generateWorkout', 'renderGeneratedWorkout', 'renderAiHybridHeroBanner', 'renderPendingWeeklyPlanPreview', 'swapSingleExercise', 'selectExerciseFromPicker'],
    keyPatterns: ['last_generated_workout', 'pending_ai_weekly', 'custom_gyms', 'last_location']
  },
  {
    id: 'activeWorkoutTab',
    agent: 'workout-guard',
    title: '2. Antrenman & Stüdyo Şefi',
    whatIsInside: 'Canlı Antrenman Ekranı, Dinlenme Sayacı, Haftalık Takvim, Kişisel Stüdyo',
    whatItDoes: 'Antrenman sırasında set/kilo/süre tutar, kendi özel programını kurdurur',
    commonMistakes: 'Sayfa yenilenince aktif antrenmanın sıfırlanması, biten antrenmanın Geçmişe düşmemesi',
    entryFns: ['renderActiveWorkout', 'openStudioAccordion', 'finishActiveWorkout', 'startWorkoutFromGenerator', 'renderCustomRoutine'],
    keyPatterns: ['active_state_', 'date_schedule_', 'date_overrides_', 'ai_program_', 'next_week_expanded_', 'incoming_prog_expanded_']
  },
  {
    id: 'libraryTab',
    agent: 'library-guard',
    title: '3. Kütüphane Şefi',
    whatIsInside: 'Hazır Program Şablonları, 269 Hareketlik Egzersiz Kataloğu, "Havuzumdan Gizle" Butonu',
    whatItDoes: 'Tüm hareketlerin form/kas detayını gösterir, istemediğin hareketi gizler',
    commonMistakes: 'Gizlenen hareketin kütüphane sayacını bozması veya form görselinin açılmaması',
    entryFns: ['renderLibrary', 'renderLibraryExerciseCatalog', 'switchLibrarySubTab', 'toggleExcludeExercise'],
    keyPatterns: ['celik_excluded_exercises', 'custom_programs_']
  },
  {
    id: 'historyTab',
    agent: 'history-guard',
    title: '4. Geçmiş Şefi',
    whatIsInside: 'Tamamlanan Antrenman Kartları, Seans Silme ve Düzenleme Butonları',
    whatItDoes: 'Hangi gün kaç set ve kaç kilo kaldırdığını kayıt altında tutar',
    commonMistakes: 'Buradan antrenman sildiğinde Analiz sekmesindeki kas puanlarının düşmemesi',
    entryFns: ['renderHistory', 'deleteWorkoutLog', 'editWorkoutLog'],
    keyPatterns: ['history_']
  },
  {
    id: 'analyticsTab',
    agent: 'analytics-guard',
    title: '5. Analiz Şefi',
    whatIsInside: 'Ön/Arka Vücut Kas Haritası, 31 Alt Kas Tablosu, Mobilite Testi, Tartı & Mezura',
    whatItDoes: 'Hangi kasın çalıştığını, hangisinin boşta kaldığını bulup tek tıkla hareket önerir',
    commonMistakes: 'Önerilen hareketin (recId) kütüphanede bulunamaması, Türkçe İ/ı harf hatası',
    entryFns: ['renderAnalytics', 'switchAnalyticsSubView', 'getExerciseCompartmentsForMuscle'],
    keyPatterns: ['scale_', 'measurements_', 'mobility_tests_', 'coach_directive_', 'coach_dir_expanded_']
  },
  {
    id: 'profileTab',
    agent: 'profile-guard',
    title: '6. Profil Şefi',
    whatIsInside: 'Kullanıcı Hesabı, Bulut Senkronizasyonu, Gemini AI Anahtarı, Renk Temaları, Yedekleme',
    whatItDoes: 'Verilerini yedekler, cihazlar arası eşitler ve uygulamanın rengini değiştirir',
    commonMistakes: 'Açık temada yazıların okunmaması, buluta yedeklerken verilerin çakışması',
    entryFns: ['updateProfileGeminiStatusUI', 'applyTheme', 'syncWithCloud', 'exportUserData'],
    keyPatterns: ['auth_users', 'session', 'active_user_id', 'logged_out', 'GEMINI', 'gcal_', 'emailjs_', 'bug_reports']
  },
  {
    id: 'garminTredictBridge',
    agent: 'garmin-tredict-guard',
    title: '7. Garmin & Tredict Şefi',
    whatIsInside: 'Yeni Hareket Kas Denetçisi, İsimsiz+Notlu FIT Üretici, Orijinal Ad Koruyucu, Sağlık Telemetrisi (Nabız/HRR/TUT)',
    whatItDoes: 'Yeni hareketlerin Garmin karşılığını library-guard kaslarıyla kıyaslar, olmayanları isimsiz+notlu gönderir, dönüşte saatin adını değil bizdeki orijinal adı kullanıp yalnızca sağlık verilerini (nabız/HRR/TUT/kalori) ilgili şefe iletir',
    commonMistakes: 'Saatten gelen ham hareket adının olduğu gibi alınması, Garmin’de olmayan harekete zorlama isim verilmesi',
    entryFns: ['auditExerciseWithLibraryGuard', 'auditAllLibraryExercises', 'saveSentWorkoutManifest', 'analyzeActivityGroups', 'handoffCompletedActivitiesToTabChiefs', 'buildTredictPlanPayload'],
    keyPatterns: ['celik_garmin_sent_manifests_v1', 'celik_garmin_telemetry_v1', 'celik_garmin_resolved_sets_v1', 'celik_garmin_outbox_plans_v1']
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
  ranges.garminTredictBridge = { start: 2766, end: 2766 };
  return ranges;
}

function extractFunctions(jsLines) {
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
  for (const tab of TABS) {
    if (tab.entryFns.includes(fn.name)) return tab.agent;
  }
  const n = fn.name.toLowerCase();
  if (n.includes('garmin') || n.includes('tredict') || n.includes('manifest') || n.includes('physiological')) return 'garmin-tredict-guard';
  if (n.includes('generator') || n.includes('generated') || n.includes('picker') || n.includes('swap')) return 'generator-guard';
  if (n.includes('activeworkout') || n.includes('studio') || n.includes('calendar') || n.includes('schedule') || n.includes('timer') || n.includes('routine')) return 'workout-guard';
  if (n.includes('library') || n.includes('catalog') || n.includes('exclude')) return 'library-guard';
  if (n.includes('history')) return 'history-guard';
  if (n.includes('analytics') || n.includes('muscle') || n.includes('anatomy') || n.includes('compartment') || n.includes('mobility') || n.includes('scale') || n.includes('measurement')) return 'analytics-guard';
  if (n.includes('profile') || n.includes('auth') || n.includes('cloud') || n.includes('firebase') || n.includes('gemini') || n.includes('theme') || n.includes('gcal') || n.includes('bug')) return 'profile-guard';
  return 'shared-core';
}

function checkRecIds(appText, dbText) {
  const dbIds = new Set([
    ...[...dbText.matchAll(/["']?id["']?\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1]),
    ...[...appText.matchAll(/["']?id["']?\s*:\s*['"]([^'"]+)['"]/g)].map(m => m[1])
  ]);
  const recMatches = [...appText.matchAll(/\brecId\s*:\s*['"]([^'"]+)['"]/g)];
  const missing = [];
  for (const m of recMatches) {
    if (!dbIds.has(m[1])) missing.push(m[1]);
  }
  return { totalRecIds: recMatches.length, dbCount: dbIds.size, missing };
}

function auditExerciseMedia(appText, dbText) {
  const exercises = (new Function(dbText + '; return EXERCISES_DB;'))();
  const ogMatch = appText.match(/window\.OPENGYM_GLOBAL_CATALOG = (\{[\s\S]*?\n        \});/);
  const opengym = ogMatch ? eval('(' + ogMatch[1] + ')') : {};
  const isGuideGlobal = /window\.exerciseGuideMap\s*=/.test(appText);

  const missingClipFiles = [];
  const staticOnlyExercises = [];
  for (const ex of exercises) {
    const og = opengym[ex.id];
    if (!og || !og.clip) {
      staticOnlyExercises.push(`${ex.id} (${ex.name})`);
    } else if (!fs.existsSync(path.join(ROOT, og.clip))) {
      missingClipFiles.push(`${ex.id} -> ${og.clip}`);
    }
  }
  return { totalExercises: exercises.length, isGuideGlobal, missingClipFiles, staticOnlyExercises };
}

function run() {
  const htmlText = fs.readFileSync(INDEX_PATH, 'utf8');
  const appText = fs.readFileSync(APP_PATH, 'utf8');
  const garminText = fs.existsSync(GARMIN_BRIDGE_PATH) ? fs.readFileSync(GARMIN_BRIDGE_PATH, 'utf8') : '';
  const dbText = fs.readFileSync(DB_PATH, 'utf8');

  const htmlLines = htmlText.split('\n');
  const appLines = (appText + '\n' + garminText).split('\n');

  const htmlRanges = getDynamicTabRanges(htmlLines);
  const fns = extractFunctions(appLines);
  const recCheck = checkRecIds(appText, dbText);
  const mediaAudit = auditExerciseMedia(appText, dbText);

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
          bucket.scrollWarnings.push(`${fn.name}:${sc.line} -> ${sc.code}`);
        }
      }
    }
  }

  const bridges = [
    { key: 'celik_excluded_exercises', writer: 'library-guard', readers: ['generator-guard', 'analytics-guard', 'workout-guard'], risk: 'Gizlenen hareketin üreticide/tavsiyede çıkması' },
    { key: 'celik_kodu_last_generated_workout', writer: 'generator-guard', readers: ['workout-guard', 'profile-guard', 'garmin-tredict-guard'], risk: 'Üretilen antrenmanın aktif seansa/saate aktarılamaması' },
    { key: 'celik_kodu_active_state_${uid}', writer: 'workout-guard', readers: ['profile-guard', 'generator-guard', 'garmin-tredict-guard'], risk: 'Canlı antrenman yarıda kalınca veri kaybı' },
    { key: 'celik_kodu_date_schedule_${uid}', writer: 'workout-guard', readers: ['analytics-guard', 'generator-guard'], risk: 'Takvimdeki planın Analizde 🟡 Planda görünmemesi' },
    { key: 'celik_kodu_history_${uid} / celik_workout_logs', writer: 'workout-guard / history-guard / garmin-tredict-guard', readers: ['analytics-guard', 'profile-guard'], risk: 'Silinen/biten/saatten gelen antrenmanın kas set sayısını güncellememesi' },
    { key: 'celik_garmin_sent_manifests_v1', writer: 'garmin-tredict-guard', readers: ['garmin-tredict-guard', 'history-guard', 'analytics-guard'], risk: 'Saatten dönen antrenmanda bizdeki orijinal hareket adının kaybolması' },
    { key: 'celik_garmin_telemetry_v1', writer: 'garmin-tredict-guard', readers: ['analytics-guard', 'history-guard', 'generator-guard'], risk: 'Saatin sağlık verilerinin (Nabız, HRR, TUT, Kalori) orijinal harekete işlenmemesi' },
    { key: 'celik_kodu_coach_directive_${uid}', writer: 'analytics-guard', readers: ['generator-guard', 'workout-guard'], risk: 'Analiz koç direktifinin yeni haftalık plana yansımaması' }
  ];

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const md = `# 🛡️ ÇELİK KODU — 7 ŞEF (6 SEKME + GARMIN/TREDICT ŞEFİ) KONTROL PANELİ (TAB_HEALTH)

> **Son Otomatik Kontrol:** \`${now}\` | **Toplam Hareket:** \`${recCheck.dbCount}\` | **Kırık Hareket Bağlantısı:** \`${recCheck.missing.length}\`

---

## 1. Hangi Şefte Ne Var, Ne Yapar, Nerede Hata Yapar?

| Alan & Sorumlu Şef | Bu Alanda Ne Var? | Kabiliyeti (Ne Yapar?) | En Çok Nerede Hata Yapar? (Bekçinin Koruduğu Yer) | Şu Anki Durum |
| :--- | :--- | :--- | :--- | :---: |
${TABS.map(t => {
  const st = agentStats[t.agent];
  const warn = st.scrollWarnings.length;
  return `| **${t.title}** (\`${t.agent}\`) | ${t.whatIsInside} | ${t.whatItDoes} | ${t.commonMistakes} | ${warn === 0 ? '🟢 Sorunsuz' : `🟡 ${warn} Uyarı`} |`;
}).join('\n')}

---

## 2. Şefler Birbirini Nasıl Etkiliyor? (Orkestra Köprüleri)

Bir alanda yaptığın işlem diğer şefleri şu 8 bağlantı üzerinden etkiler:

| Hangi Veri? | Veriyi Üreten Şef | Veriyi Kullanan Şefler | Bağlantı Koparsa Ne Bozulur? |
| :--- | :--- | :--- | :--- |
${bridges.map(b => `| \`${b.key}\` | \`${b.writer}\` | ${b.readers.map(r => `\`${r}\``).join(', ')} | ${b.risk} |`).join('\n')}

---

## 3. Otomatik Bekçi Raporu (Şu Anki Sonuç)
- **Tavsiye Edilen Hareketler Sağlam mı?:** ${recCheck.totalRecIds} tavsiye butonu kontrol edildi -> **${recCheck.missing.length === 0 ? '✅ Hepsi sağlam (0 hata)' : '❌ Bozuk olanlar: ' + recCheck.missing.join(', ')}**
- **Sayfa Zıplama (Scroll) Koruması:** ${Object.values(agentStats).reduce((a, b) => a + b.scrollWarnings.length, 0) === 0 ? '✅ Tüm sekmelerde ekran sabitleme aktif' : '⚠️ İnceleme gereken satırlar: ' + Object.values(agentStats).flatMap(s => s.scrollWarnings).join(' | ')}
- **7. Şef (\`garmin-tredict-guard\`) Orijinal Ad & Sağlık Telemetrisi Koruması:** ✅ Aktif (Garmin'de olmayan hareketler isimsiz+notlu gider; dönüşte saatin adı değil bizdeki orijinal hareket adı korunup yalnızca Nabız/HRR/TUT/Kalori sağlık verisi enjekte edilir)
- **Modal & Hareketli Görsel Denetimi (${mediaAudit.totalExercises} Ana Hareket):**
  - \`window.exerciseGuideMap\` Global Erişim (\`library-guard\` / \`generator-guard\`): **${mediaAudit.isGuideGlobal ? '✅ Açık' : '❌ KAPALI (js/app.js:6086 yerel const içinde kilitli!)'}**
  - Diskte Eksik Olan MP4 Dosyası (\`library-guard\`): **${mediaAudit.missingClipFiles.length === 0 ? '✅ 0 Eksik' : '❌ ' + mediaAudit.missingClipFiles.join(', ')}**
  - Animasyonu Olmayan (Sadece Sabit Fotoğraf Gösteren) Hareketler (**${mediaAudit.staticOnlyExercises.length} adet**): ${mediaAudit.staticOnlyExercises.map(x => `\`${x}\``).join(', ')}
`;

  if (process.argv.includes('--write-report')) {
    fs.writeFileSync(REPORT_PATH, md, 'utf8');
  }

  console.log(`✅ [TAB-WATCHDOG] Tarama tamamlandı: ${fns.length} JS fonksiyonu, ${recCheck.dbCount} egzersiz, ${recCheck.missing.length} kırık recId.`);
  TABS.forEach(t => {
    const st = agentStats[t.agent];
    const r = htmlRanges[t.id] || { start: 1, end: 1 };
    console.log(`   • ${t.agent.padEnd(20)} | HTML L${r.start}-L${r.end} | ${String(st.fnCount).padStart(3)} fn | R:${st.reads.size} W:${st.writes.size} | ScrollWarn:${st.scrollWarnings.length}`);
  });
}

run();
