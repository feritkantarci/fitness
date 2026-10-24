#!/usr/bin/env node
/**
 * check_similarity.js
 * Scans proposed exercises against the existing master catalog (EXERCISES_DB)
 * to detect duplicates and strong biomechanical similarities before generating visuals.
 * Prevents redundant AI image generation and saves tokens.
 * Part of the fitvid_generate skill.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadMasterCatalog(projectRoot) {
  const dbPath = path.join(projectRoot, 'js/exercises-db.js');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Master catalog not found at: ${dbPath}`);
  }
  const code = fs.readFileSync(dbPath, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.EXERCISES_DB || [];
}

function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[iİı]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeSimilarity(candidateName, candidateKeywords, masterEx) {
  const normCand = normalizeText(candidateName);
  const normMasterName = normalizeText(masterEx.name);
  const normMasterId = normalizeText(masterEx.id);

  // 1. Exact ID or name match
  if (normCand === normMasterName || normCand === normMasterId) {
    return { score: 1.0, reason: 'Exact name/ID match' };
  }

  // 2. Token overlap score (Precision & Jaccard)
  const candTokens = new Set(normCand.split(' ').filter(t => t.length > 2));
  const masterTokens = new Set(
    `${normMasterName} ${normMasterId}`.split(' ').filter(t => t.length > 2)
  );

  let matchCount = 0;
  candTokens.forEach(t => {
    if (masterTokens.has(t)) matchCount++;
  });

  const precision = candTokens.size > 0 ? matchCount / candTokens.size : 0;
  const unionSize = new Set([...candTokens, ...masterTokens]).size;
  const jaccardScore = unionSize > 0 ? matchCount / unionSize : 0;

  // For combo/hybrid exercises (e.g. Squat to Press vs Squat), avoid false positive
  const isCandidateCombo = candTokens.size >= 4;
  const isMasterCombo = masterEx.isComplex || masterTokens.size >= 4;

  if (isCandidateCombo !== isMasterCombo && jaccardScore < 0.6) {
    // One is combo, other is isolated single phase -> Do NOT treat as duplicate!
    return { score: jaccardScore * 0.7, reason: 'Single phase vs hybrid combo differentiation' };
  }

  if (precision >= 0.75 && jaccardScore >= 0.5) {
    return { score: 0.9, reason: `Strong token overlap: ${[...candTokens].filter(t => masterTokens.has(t)).join(', ')}` };
  }

  // 3. Keyword / Biomechanics overlap
  if (candidateKeywords && candidateKeywords.length) {
    const normKey = candidateKeywords.map(normalizeText);
    let keyMatch = 0;
    normKey.forEach(k => {
      if (masterTokens.has(k) || (masterEx.tags && masterEx.tags.includes(k))) keyMatch++;
    });
    const keyScore = keyMatch / candidateKeywords.length;
    if (keyScore >= 0.8 && precision >= 0.6 && jaccardScore >= 0.5) {
      return { score: 0.85, reason: 'High biomechanical keyword and movement pattern match' };
    }
  }

  if (precision >= 0.6 && jaccardScore >= 0.45) {
    return { score: 0.65, reason: 'Partial name and movement overlap' };
  }

  return { score: jaccardScore, reason: 'Low overlap' };
}

function checkExercises(proposedList, projectRoot = process.cwd()) {
  const catalog = loadMasterCatalog(projectRoot);
  console.log(`Loaded ${catalog.length} existing master exercises from catalog.`);

  const results = [];
  let blockedCount = 0;

  proposedList.forEach(cand => {
    const candName = cand.name || cand.title || cand.id;
    const candKeywords = cand.keywords || cand.tags || cand.primary_muscles || [];
    let bestMatch = null;
    let highestScore = 0;
    let matchReason = '';

    for (const masterEx of catalog) {
      const { score, reason } = computeSimilarity(candName, candKeywords, masterEx);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = masterEx;
        matchReason = reason;
      }
    }

    const isDuplicate = highestScore >= 0.75;
    const isSimilar = highestScore >= 0.6 && highestScore < 0.75;

    if (isDuplicate || isSimilar) {
      blockedCount++;
    }

    results.push({
      proposed: candName,
      status: isDuplicate ? 'DUPLICATE' : isSimilar ? 'SIMILAR' : 'UNIQUE',
      score: highestScore,
      reason: matchReason,
      matchedExercise: bestMatch ? {
        id: bestMatch.id,
        name: bestMatch.name,
        equipment: bestMatch.equipment,
        category: bestMatch.category
      } : null,
      allowImageGeneration: !isDuplicate && !isSimilar
    });
  });

  return { results, blockedCount };
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log("Usage: node check_similarity.js <spec.json | 'exercise_name'>");
    process.exit(1);
  }

  const inputArg = args[0];
  let proposedList = [];

  if (fs.existsSync(inputArg)) {
    const raw = JSON.parse(fs.readFileSync(inputArg, 'utf8'));
    proposedList = raw.movements || raw.exercises || (Array.isArray(raw) ? raw : [raw]);
  } else {
    proposedList = [{ name: inputArg }];
  }

  const { results, blockedCount } = checkExercises(proposedList);

  console.log("\n============================================================");
  console.log("📊 EGZERSİZ TEKİLLİK VE BENZERLİK DENETİM RAPORU");
  console.log("============================================================\n");

  results.forEach((r, idx) => {
    if (r.status === 'DUPLICATE') {
      console.log(`[${idx + 1}] 🛑 MEVCUT / MÜKERRER HAREKET: "${r.proposed}"`);
      console.log(`    ↳ Eşleşen: "${r.matchedExercise.name}" (ID: ${r.matchedExercise.id})`);
      console.log(`    ↳ Güven Skoru: %${Math.round(r.score * 100)} (${r.reason})`);
      console.log(`    ↳ ⚠️ AKSİYON: GÖRSEL ÜRETİMİ ENGELLENDİ! Mevcut kart referans gösterilecek.\n`);
    } else if (r.status === 'SIMILAR') {
      console.log(`[${idx + 1}] ⚠️ KUVVETLİ BENZER HAREKET: "${r.proposed}"`);
      console.log(`    ↳ Benzer Olan: "${r.matchedExercise.name}" (ID: ${r.matchedExercise.id})`);
      console.log(`    ↳ Güven Skoru: %${Math.round(r.score * 100)} (${r.reason})`);
      console.log(`    ↳ ⚠️ AKSİYON: GÖRSEL ÜRETİMİ ENGELLENDİ! Farklılık kullanıcıya sorulmalı.\n`);
    } else {
      console.log(`[${idx + 1}] ✅ YENİ & ÖZGÜN HAREKET: "${r.proposed}"`);
      console.log(`    ↳ Kütüphanede benzeri bulunamadı.`);
      console.log(`    ↳ 🎨 AKSİYON: Görsel üretim hattına onay verildi.\n`);
    }
  });

  console.log(`Toplam İncelenen: ${results.length} | Görsel Üretimi Engellenen: ${blockedCount}`);
  if (blockedCount > 0) {
    console.log(`💡 Tasarruf: ${blockedCount} hareket için mükerrer yapay zeka görsel üretimi önlendi.`);
  }
}

module.exports = { checkExercises, computeSimilarity };
