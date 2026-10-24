#!/usr/bin/env node
/**
 * register_exercises.js
 * Automatically transfers verified exercise media from staging into production,
 * registers exercise definitions across all project databases, and verifies syntax integrity.
 * Part of the fitvid_generate skill.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function registerExercises(specPath, stagingBaseDir, projectRootDir) {
  projectRootDir = projectRootDir || process.cwd();
  console.log(`Starting automated exercise registration from: ${specPath}`);

  const rawData = fs.readFileSync(specPath, 'utf8');
  const spec = JSON.parse(rawData);
  const movements = spec.movements || (Array.isArray(spec) ? spec : []);

  if (!movements.length) {
    console.error("No movements found in specification.");
    process.exit(1);
  }

  // 1. Copy Media Assets to Production
  console.log("\n--- 1. Copying Media Assets ---");
  const assetsExDir = path.join(projectRootDir, 'assets/exercises');
  const clipsDir = path.join(projectRootDir, 'assets/opengym/clips');
  const stillsDir = path.join(projectRootDir, 'assets/opengym/stills');

  fs.mkdirSync(assetsExDir, { recursive: true });
  fs.mkdirSync(clipsDir, { recursive: true });
  fs.mkdirSync(stillsDir, { recursive: true });

  movements.forEach(m => {
    const exId = m.id;
    const stageDir = path.join(stagingBaseDir, m.relative_dir || m.id);

    const srcWebp = path.join(stageDir, 'ai_animation.webp');
    const dstWebp = path.join(assetsExDir, `${exId}.webp`);
    if (fs.existsSync(srcWebp)) {
      fs.copyFileSync(srcWebp, dstWebp);
      console.log(`  ✓ Copied WebP: assets/exercises/${exId}.webp`);
    }

    const srcMp4 = path.join(stageDir, 'ai_clip.mp4');
    const dstMp4 = path.join(clipsDir, `${exId}.mp4`);
    if (fs.existsSync(srcMp4)) {
      fs.copyFileSync(srcMp4, dstMp4);
      console.log(`  ✓ Copied MP4: assets/opengym/clips/${exId}.mp4`);
    }

    const srcStill = path.join(stageDir, 'ai_still.webp');
    const dstStill = path.join(stillsDir, `${exId}.webp`);
    if (fs.existsSync(srcStill)) {
      fs.copyFileSync(srcStill, dstStill);
      console.log(`  ✓ Copied Still: assets/opengym/stills/${exId}.webp`);
    }
  });

  // 2. Update js/exercises-db.js
  console.log("\n--- 2. Updating js/exercises-db.js ---");
  const dbPath = path.join(projectRootDir, 'js/exercises-db.js');
  let dbContent = fs.readFileSync(dbPath, 'utf8');

  movements.forEach(m => {
    if (!dbContent.includes(`id: "${m.id}"`)) {
      const exEntry = `  {\n` +
        `    category: "${m.category || 'full_body'}",\n` +
        `    cue: "${m.cue || ''}",\n` +
        `    diagram: "${m.diagram || 'assets/diagrams/seq_db_complex.svg'}",\n` +
        `    equipment: "${m.equipment || 'dumbbell'}",\n` +
        `    id: "${m.id}",\n` +
        `    isComplex: ${m.isComplex || false},\n` +
        `    mechanic: "${m.mechanic || 'compound'}",\n` +
        `    muscle: "${m.muscle || ''}",\n` +
        `    name: "${m.name}",\n` +
        `    positions: ${JSON.stringify(m.positions || [], null, 6).replace(/\\n/g, '\n    ')},\n` +
        `    primaryMuscles: ${JSON.stringify(m.primaryMuscles || m.primary_muscles || [])},\n` +
        `    secondaryMuscles: ${JSON.stringify(m.secondaryMuscles || m.secondary_muscles || [])},\n` +
        `    tags: ${JSON.stringify(m.tags || [])},\n` +
        `    weightKey: "${m.weightKey || 'squat'}"\n` +
        `  },\n`;

      const targetMarker = '];\n\n// --- KAPSAMLI AKADEMİK EGZERSİZ REHBERİ';
      if (dbContent.includes(targetMarker)) {
        dbContent = dbContent.replace(targetMarker, exEntry + targetMarker);
        console.log(`  ✓ Added to EXERCISES_DB: ${m.id}`);
      }
    }

    // Guide Library
    if (m.guide && !dbContent.includes(`"${m.id}": {`)) {
      const guideMarker = '};\n\n// --- HAREKET ADI VE ID EŞLEŞTİRME SÖZLÜĞÜ';
      const guideEntry = `  "${m.id}": ${JSON.stringify(m.guide, null, 4).replace(/\\n/g, '\n  ')},\n`;
      if (dbContent.includes(guideMarker)) {
        dbContent = dbContent.replace(guideMarker, guideEntry + guideMarker);
        console.log(`  ✓ Added to guideLibrary: ${m.id}`);
      }
    }

    // exerciseGuideMap
    if (!dbContent.includes(`"${m.name}": "${m.id}"`)) {
      const mapMarker = '};\n\nif (typeof module !== "undefined"';
      const mapEntry = `  "${m.name}": "${m.id}",\n  "${m.id}": "${m.id}",\n`;
      if (dbContent.includes(mapMarker)) {
        dbContent = dbContent.replace(mapMarker, mapEntry + mapMarker);
        console.log(`  ✓ Added to exerciseGuideMap: ${m.name}`);
      }
    }
  });
  fs.writeFileSync(dbPath, dbContent, 'utf8');

  // 3. Update js/app.js
  console.log("\n--- 3. Updating js/app.js ---");
  const appPath = path.join(projectRootDir, 'js/app.js');
  let appContent = fs.readFileSync(appPath, 'utf8');

  movements.forEach(m => {
    // Muscle breakdown
    if (m.breakdown && !appContent.includes(`"${m.id}": {`)) {
      const bdMarker = '};\n\n// --- GÜNLÜK VE HAFTALIK EGZERSİZ ANALİZ RAPORU';
      const bdEntry = `  "${m.id}": ${JSON.stringify(m.breakdown, null, 4).replace(/\\n/g, '\n  ')},\n`;
      if (appContent.includes(bdMarker)) {
        appContent = appContent.replace(bdMarker, bdEntry + bdMarker);
        console.log(`  ✓ Added to EXERCISE_MUSCLE_BREAKDOWN: ${m.id}`);
      }
    }

    // OpenGym Previews
    if (!appContent.includes(`"${m.id}": {`)) {
      const opMarker = '};\n\nconst OPENGYM_GLOBAL_CATALOG';
      const opEntry = `  "${m.id}": {\n` +
        `    id: "${m.id}",\n` +
        `    title: "${m.name}",\n` +
        `    video: "assets/opengym/clips/${m.id}.mp4",\n` +
        `    still: "assets/opengym/stills/${m.id}.webp",\n` +
        `    loop: "assets/exercises/${m.id}.webp",\n` +
        `    accent: "${m.accent || '#3b82f6'}"\n` +
        `  },\n`;
      if (appContent.includes(opMarker)) {
        appContent = appContent.replace(opMarker, opEntry + opMarker);
        console.log(`  ✓ Added to OPENGYM_PREVIEWS: ${m.id}`);
      }
    }
  });
  fs.writeFileSync(appPath, appContent, 'utf8');

  // 4. Update sw.js Cache
  console.log("\n--- 4. Updating sw.js Cache ---");
  const swPath = path.join(projectRootDir, 'sw.js');
  let swContent = fs.readFileSync(swPath, 'utf8');

  movements.forEach(m => {
    const assets = [
      `'./assets/exercises/${m.id}.webp'`,
      `'./assets/opengym/clips/${m.id}.mp4'`,
      `'./assets/opengym/stills/${m.id}.webp'`
    ];
    assets.forEach(a => {
      if (!swContent.includes(a)) {
        const swMarker = '];\n\n// Kurulum: Statik Dosyaları Önbelleğe Al';
        swContent = swContent.replace(swMarker, `  ${a},\n${swMarker}`);
      }
    });
  });
  fs.writeFileSync(swPath, swContent, 'utf8');
  console.log(`  ✓ Updated Service Worker cache array`);

  // 5. Verify Syntax Integrity
  console.log("\n--- 5. Verifying Syntax Integrity ---");
  [dbPath, appPath, swPath].forEach(filePath => {
    try {
      execSync(`node -c "${filePath}"`);
      console.log(`  ✓ Syntax check passed: ${path.basename(filePath)}`);
    } catch (err) {
      console.error(`  ✗ Syntax error in ${filePath}:`, err.message);
      process.exit(1);
    }
  });

  console.log("\n🎉 ALL EXERCISES REGISTERED AND VERIFIED SUCCESSFULLY!");
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log("Usage: node register_exercises.js <spec.json> <staging_base_dir> [project_root]");
    process.exit(1);
  }
  registerExercises(args[0], args[1], args[2]);
}

module.exports = { registerExercises };
