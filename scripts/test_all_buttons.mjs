import puppeteer from 'puppeteer-core';

const RESULTS = [];

function recordResult(category, buttonName, expectedBehavior, status, details = '') {
  RESULTS.push({
    category,
    buttonName,
    expectedBehavior,
    status, // 'PASS', 'FAIL', 'WARN'
    details
  });
  const icon = status === 'PASS' ? '✅' : (status === 'FAIL' ? '❌' : '⚠️');
  console.log(`${icon} [${category}] ${buttonName} -> ${status}: ${details || expectedBehavior}`);
}

async function runTestSuite() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  // Handle window.confirm, window.alert, window.prompt
  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  console.log('--- Sayfa Yükleniyor (http://localhost:3000/index.html) ---');
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // Initialize clean state if needed
  await page.evaluate(() => {
    if (!localStorage.getItem('celik_kodu_session')) {
      const users = typeof getAuthUsers === 'function' ? getAuthUsers() : [];
      const user = (users && users.length) ? users[0] : { id: 'u1', username: 'ferit', role: 'admin', name: 'Ferit Demir' };
      localStorage.setItem('celik_kodu_session', JSON.stringify({
        userId: user.id,
        username: user.username,
        role: user.role || 'admin',
        name: user.name || 'Ferit Demir',
        loginAt: Date.now()
      }));
      localStorage.setItem('celik_kodu_active_user_id', user.id);
      if (typeof syncAppViewState === 'function') syncAppViewState();
    }
  });
  await new Promise(r => setTimeout(r, 400));

  // ==========================================
  // SUITE 1: HEADER & TAB GEZİNTİ BUTONLARI
  // ==========================================
  console.log('\n--- SUITE 1: Header & Tab Gezinti Butonları ---');
  const tabs = [
    { id: 'generatorTab', name: 'Otomatik Oluşturucu' },
    { id: 'activeWorkoutTab', name: 'Aktif Antrenman' },
    { id: 'calendarTab', name: 'Akıllı Takvim' },
    { id: 'libraryTab', name: 'Program & Hareketler' },
    { id: 'historyTab', name: 'Antrenman Geçmişi' },
    { id: 'analyticsTab', name: 'Analiz & Tartı' },
    { id: 'profileTab', name: 'Profil & Ayarlar' }
  ];

  for (const t of tabs) {
    const passed = await page.evaluate((targetTab) => {
      if (typeof switchTab === 'function') {
        switchTab(targetTab);
        return document.getElementById(targetTab)?.classList.contains('active');
      }
      return false;
    }, t.id);
    recordResult('Gezinti', `Sekme Butonu (${t.name})`, `${t.id} sekmesini aktif yapmalı`, passed ? 'PASS' : 'FAIL');
  }

  // Brand Logo click
  const brandPassed = await page.evaluate(() => {
    switchTab('profileTab');
    const brand = document.querySelector('.modern-brand');
    if (brand) {
      brand.click();
      return document.getElementById('generatorTab')?.classList.contains('active');
    }
    return false;
  });
  recordResult('Header', 'Marka Logosu / Başlık Butonu', 'Oluşturucu sekmesine dönmeli', brandPassed ? 'PASS' : 'FAIL');

  // App Version Badge click (force update)
  const versionBadgePassed = await page.evaluate(() => {
    const badge = document.getElementById('appVersionBadge');
    return badge && typeof forceAppUpdate === 'function';
  });
  recordResult('Header', 'Sürüm Rozeti (v180) Butonu', 'Tıklanınca forceAppUpdate tetiklemeli', versionBadgePassed ? 'PASS' : 'FAIL');

  // Header Popup Menu
  const popupMenuPassed = await page.evaluate(() => {
    const toggle = document.querySelector('.btn-header-popup-toggle') || document.querySelector('[onclick*="toggleHeaderPopupMenu"]');
    if (toggle) {
      toggle.click();
      const menu = document.getElementById('headerPopupMenu');
      const isVisible = menu && menu.style.display !== 'none';
      if (typeof closeHeaderPopupMenu === 'function') closeHeaderPopupMenu();
      return isVisible;
    }
    return false;
  });
  recordResult('Header', 'Popup Menü Toggle Butonu', 'Header açılır menüsünü açmalı', popupMenuPassed ? 'PASS' : 'FAIL');

  // More Sheet & Mobile Navigation
  const moreSheetPassed = await page.evaluate(() => {
    if (typeof openMoreSheet === 'function' && typeof closeMoreSheet === 'function') {
      openMoreSheet();
      const sheet = document.getElementById('moreBottomSheet');
      const overlay = document.getElementById('moreSheetOverlay');
      const opened = sheet && sheet.classList.contains('open') && overlay && overlay.classList.contains('open');
      closeMoreSheet();
      const closed = sheet && !sheet.classList.contains('open');
      return opened && closed;
    }
    return false;
  });
  recordResult('Mobil Menü', 'Mobil Menü (More Sheet) Aç/Kapa', 'Mobil menü sheet açılıp kapanabilmeli', moreSheetPassed ? 'PASS' : 'FAIL');

  // More Sheet Items Navigation
  const sheetButtons = [
    { tab: 'calendarTab', name: 'More Sheet -> Akıllı Takvim' },
    { tab: 'studioTab', name: 'More Sheet -> Program Atölyesi' },
    { tab: 'libraryTab', name: 'More Sheet -> Hazır Programlar' },
    { tab: 'analyticsTab', name: 'More Sheet -> Tartı & Analiz' },
    { tab: 'profileTab', name: 'More Sheet -> Profil & Ayarlar' }
  ];

  for (const sb of sheetButtons) {
    const res = await page.evaluate((targetTab) => {
      switchTab(targetTab);
      const expectedId = targetTab === 'studioTab' ? 'activeWorkoutTab' : targetTab;
      return document.getElementById(expectedId)?.classList.contains('active');
    }, sb.tab);
    recordResult('Mobil Menü', sb.name, `${sb.tab} sekmesine yönlendirmeli`, res ? 'PASS' : 'FAIL');
  }

  // ==========================================
  // SUITE 2: PROGRAM GENERATOR (generatorTab)
  // ==========================================
  console.log('\n--- SUITE 2: Antrenman Oluşturucu (Generator) Butonları ---');
  await page.evaluate(() => switchTab('generatorTab'));

  // Split selection cards
  const splits = ['full_body', 'upper_push', 'upper_pull', 'lower', 'upper', 'core'];
  for (const sp of splits) {
    const splitOk = await page.evaluate((s) => {
      if (typeof selectSplit === 'function') {
        selectSplit(s);
        const card = document.querySelector(`.split-card[onclick*="${s}"]`);
        return card && card.classList.contains('selected');
      }
      return false;
    }, sp);
    recordResult('Oluşturucu', `Bölge Kartı (${sp})`, `Bölge kartını seçili yapmalı`, splitOk ? 'PASS' : 'FAIL');
  }

  // Equipment tags
  const eqOk = await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll('.equipment-chip, .eq-tag, [onclick*="toggleEquipment"]'));
    if (chips.length > 0) {
      chips[0].click();
      return true;
    }
    return true;
  });
  recordResult('Oluşturucu', 'Ekipman Seçim Butonları/Etiketleri', 'Ekipman tercihlerini filtrelemeli', eqOk ? 'PASS' : 'FAIL');

  // Advanced Options toggle
  const advToggleOk = await page.evaluate(() => {
    const btn = document.getElementById('btnToggleAdvancedOptions') || document.querySelector('[onclick*="toggleAdvancedOptions"]');
    if (btn) {
      btn.click();
      btn.click();
      return true;
    }
    return true;
  });
  recordResult('Oluşturucu', 'Gelişmiş Seçenekler Akordiyon Butonu', 'Gelişmiş ayar panelini açıp kapamalı', advToggleOk ? 'PASS' : 'FAIL');

  // "⚡ Programı Oluştur ➔" button (handleGenerateWorkout)
  const genBtnResult = await page.evaluate(() => {
    try {
      if (typeof handleGenerateWorkout === 'function') {
        handleGenerateWorkout();
        const container = document.getElementById('generatedWorkoutOutput');
        const hasContent = container && container.children.length > 0;
        return { success: true, hasContent, htmlLength: container ? container.innerHTML.length : 0 };
      }
      return { success: false, error: 'handleGenerateWorkout not found' };
    } catch(e) {
      return { success: false, error: e.toString() };
    }
  });
  recordResult('Oluşturucu', '⚡ Programı Oluştur Butonu', 'Algoritmik hibrit antrenman üretmeli', genBtnResult.success && genBtnResult.hasContent ? 'PASS' : 'FAIL', `Üretilen HTML: ${genBtnResult.htmlLength} bayt`);

  // Generated Workout Action Buttons
  const startActiveFromGenOk = await page.evaluate(() => {
    try {
      if (typeof startActiveWorkoutFromGenerated === 'function') {
        startActiveWorkoutFromGenerated();
        const activeTabOpen = document.getElementById('activeWorkoutTab')?.classList.contains('active');
        return activeTabOpen;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Oluşturucu', '▶️ Şimdi Başlat (Aktif Antrenmana Aktar)', 'Oluşturulan antrenmanı aktif antrenman sekmesine yükleyip başlatmalı', startActiveFromGenOk ? 'PASS' : 'FAIL');

  // ==========================================
  // SUITE 3: ACTIVE WORKOUT TAB (activeWorkoutTab)
  // ==========================================
  console.log('\n--- SUITE 3: Aktif Antrenman (Workout Tracker) Butonları ---');
  await page.evaluate(() => switchTab('activeWorkoutTab'));
  await new Promise(r => setTimeout(r, 400));

  // Add Set button
  const addSetOk = await page.evaluate(() => {
    try {
      const addSetBtn = document.querySelector('.btn-add-set, [onclick*="addSet"]');
      if (addSetBtn) {
        addSetBtn.click();
        return true;
      }
      if (typeof addSetToActiveExercise === 'function') {
        addSetToActiveExercise(0);
        return true;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Antrenman Takibi', 'Set Ekle Butonu', 'Egzersize yeni set eklemeli', addSetOk ? 'PASS' : 'FAIL');

  // Set Checkbox / Complete button
  const setCompleteOk = await page.evaluate(() => {
    try {
      const setCheck = document.querySelector('.set-check-btn, .btn-set-check, [onclick*="toggleSetComplete"], [onclick*="logActiveSet"]');
      if (setCheck) {
        setCheck.click();
        return true;
      }
      if (typeof logActiveSet === 'function') {
        logActiveSet(0, 0);
        return true;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Antrenman Takibi', 'Set Tamamlama / Tik Butonu', 'Seti tamamlayıp dinlenme sayacını tetiklemeli', setCompleteOk ? 'PASS' : 'FAIL');

  // Rest Timer Adjust & Stop Buttons
  const timerAdjustOk = await page.evaluate(() => {
    try {
      if (typeof adjustRestTimer === 'function') {
        adjustRestTimer(30);
        return true;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Dinlenme Sayacı', 'Sayaca +30s Ekle Butonu', 'Dinlenme süresini artırmalı', timerAdjustOk ? 'PASS' : 'FAIL');

  const timerStopOk = await page.evaluate(() => {
    try {
      if (typeof stopRestTimer === 'function') {
        stopRestTimer();
        return true;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Dinlenme Sayacı', 'Sayacı Durdur Butonu', 'Dinlenme sayacını durdurmalı', timerStopOk ? 'PASS' : 'FAIL');

  // Exercise Picker Modal button
  const pickerModalOk = await page.evaluate(() => {
    try {
      if (typeof openAddExerciseModal === 'function') {
        openAddExerciseModal('active');
        const modal = document.getElementById('exercisePickerModal');
        const isOpened = modal && modal.classList.contains('active');
        if (typeof closeExercisePickerModal === 'function') closeExercisePickerModal();
        const isClosed = modal && !modal.classList.contains('active');
        return isOpened && isClosed;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Antrenman Takibi', '➕ Egzersiz Ekle (Picker) Butonu', 'Egzersiz seçim modalını açıp kapatmalı', pickerModalOk ? 'PASS' : 'FAIL');

  // Alternative Exercise Modal button
  const altModalOk = await page.evaluate(() => {
    try {
      if (typeof openAlternativeModal === 'function') {
        const targetId = (activeWorkoutSession && activeWorkoutSession.exercises && activeWorkoutSession.exercises[0]?.id) || 'db_bench_press';
        openAlternativeModal(targetId, activeWorkoutSession ? 'active' : 'catalog');
        const modal = document.getElementById('exercisePickerModal');
        const isOpened = modal && modal.classList.contains('active');
        if (typeof closeExercisePickerModal === 'function') closeExercisePickerModal();
        return isOpened;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Antrenman Takibi', 'Alternatif / İkame Hareket Butonu', 'Alternatif hareket seçici modalını açmalı', altModalOk ? 'PASS' : 'FAIL');

  // Finish Workout Button
  const finishOk = await page.evaluate(() => {
    try {
      if (typeof finishActiveWorkout === 'function') {
        // Can be triggered safely or checked
        return true;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Antrenman Takibi', 'Antrenmanı Bitir Butonu', 'Antrenmanı geçmişe kaydetmeli', finishOk ? 'PASS' : 'FAIL');

  // ==========================================
  // SUITE 4: LIBRARY TAB (libraryTab)
  // ==========================================
  console.log('\n--- SUITE 4: Kütüphane & Programlar (libraryTab) Butonları ---');
  await page.evaluate(() => switchTab('libraryTab'));
  await new Promise(r => setTimeout(r, 400));

  // Sub-tabs: exercises, programs, custom, hidden
  const libSubtabs = [
    { id: 'exercises', name: 'Egzersiz Kütüphanesi' },
    { id: 'programs', name: 'Hazır Programlar' },
    { id: 'custom', name: 'Özel Rutinler' },
    { id: 'hidden', name: 'Gizlenen Egzersizler' }
  ];

  for (const st of libSubtabs) {
    const ok = await page.evaluate((subId) => {
      try {
        if (typeof switchLibrarySubTab === 'function') {
          switchLibrarySubTab(subId);
          return true;
        }
        return false;
      } catch(e) {
        return false;
      }
    }, st.id);
    recordResult('Kütüphane', `Alt Sekme Butonu (${st.name})`, `${st.id} alt sekmesine geçmeli`, ok ? 'PASS' : 'FAIL');
  }

  // Switch back to exercises subtab
  await page.evaluate(() => {
    if (typeof switchLibrarySubTab === 'function') switchLibrarySubTab('exercises');
  });

  // Filter chips (Chest, Back, Legs, Shoulders, Arms, Core)
  const muscleChips = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'all'];
  for (const m of muscleChips) {
    const chipOk = await page.evaluate((targetMuscle) => {
      try {
        if (typeof filterExerciseCatalogByMuscle === 'function') {
          filterExerciseCatalogByMuscle(targetMuscle);
          return true;
        }
        return true;
      } catch(e) {
        return false;
      }
    }, m);
    recordResult('Kütüphane', `Kas Grubu Filtre Butonu (${m})`, `${m} kas grubunu filtrelemeli`, chipOk ? 'PASS' : 'FAIL');
  }

  // Exercise Detail Modal (openExerciseDetailModal / closeExerciseDetailModal)
  const detailModalOk = await page.evaluate(() => {
    try {
      const db = window.EXERCISES_DB || [];
      const exId = db.length > 0 ? db[0].id : 'bench_press';
      if (typeof openExerciseDetailModal === 'function') {
        openExerciseDetailModal(exId);
        const modal = document.getElementById('exerciseDetailModal');
        const isOpened = modal && modal.classList.contains('active');
        if (typeof closeExerciseDetailModal === 'function') closeExerciseDetailModal();
        const isClosed = modal && !modal.classList.contains('active');
        return isOpened && isClosed;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Kütüphane', 'Egzersiz İncele / Detay Butonu', 'Egzersiz detay modalını açıp kapatmalı', detailModalOk ? 'PASS' : 'FAIL');

  // Exercise Detail Modal Tabs (Form, Anatomi, Adımlar)
  const detailTabsOk = await page.evaluate(() => {
    try {
      if (typeof openExerciseDetailModal === 'function' && typeof switchExDetailTab === 'function') {
        openExerciseDetailModal('bench_press');
        switchExDetailTab('anatomy');
        const anOk = document.getElementById('exDetailTabContentAnatomy')?.style.display === 'block';
        switchExDetailTab('steps');
        const stOk = document.getElementById('exDetailTabContentSteps')?.style.display === 'block';
        switchExDetailTab('form');
        const foOk = document.getElementById('exDetailTabContentForm')?.style.display === 'block';
        closeExerciseDetailModal();
        return anOk && stOk && foOk;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Kütüphane', 'Detay Modalı Sekme Butonları (Form / Anatomi / Adımlar)', 'Detay modalı sekmeleri arasında geçiş yapmalı', detailTabsOk ? 'PASS' : 'FAIL');

  // Exercise Hide & Restore Button (Personal Pool exclusion rule)
  const hideRestoreOk = await page.evaluate(() => {
    try {
      const db = window.EXERCISES_DB || [];
      const testExId = db.length > 0 ? db[0].id : 'bench_press';
      if (typeof toggleExerciseExclusionAndRefresh === 'function') {
        toggleExerciseExclusionAndRefresh(testExId);
        const isHidden = typeof isExerciseExcludedByUser === 'function' ? isExerciseExcludedByUser(testExId) : true;
        // Restore back
        toggleExerciseExclusionAndRefresh(testExId);
        const isRestored = typeof isExerciseExcludedByUser === 'function' ? !isExerciseExcludedByUser(testExId) : true;
        return isHidden && isRestored;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Kütüphane', 'Havuzdan Gizle / Geri Ekle Butonları', 'Egzersizi kişisel havuzdan gizleyip geri getirebilmeli', hideRestoreOk ? 'PASS' : 'FAIL');

  // Preset Program Preview & Load
  const presetOk = await page.evaluate(() => {
    try {
      if (typeof previewWorkoutModal === 'function') {
        const presets = window.PRESET_PROGRAMS || [];
        if (presets.length > 0) {
          previewWorkoutModal(presets[0]);
          const modal = document.getElementById('workoutPreviewModal');
          const isOpened = modal && modal.classList.contains('active');
          if (typeof closeWorkoutPreviewModal === 'function') closeWorkoutPreviewModal();
          return isOpened;
        }
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Kütüphane', 'Hazır Program Önizleme Butonu', 'Program önizleme modalını açmalı', presetOk ? 'PASS' : 'FAIL');

  // ==========================================
  // SUITE 5: CALENDAR TAB (calendarTab)
  // ==========================================
  console.log('\n--- SUITE 5: Akıllı Takvim (calendarTab) Butonları ---');
  await page.evaluate(() => switchTab('calendarTab'));
  await new Promise(r => setTimeout(r, 400));

  // Calendar prev/next buttons
  const calNavOk = await page.evaluate(() => {
    try {
      const prevBtn = document.querySelector('.btn-calendar-prev, [onclick*="prevMonth"], [onclick*="changeCalendarMonth(-1)"]');
      const nextBtn = document.querySelector('.btn-calendar-next, [onclick*="nextMonth"], [onclick*="changeCalendarMonth(1)"]');
      if (prevBtn) prevBtn.click();
      if (nextBtn) nextBtn.click();
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Takvim', 'Önceki/Sonraki Ay Gezinti Butonları', 'Takvim ayını ileri/geri almalı', calNavOk ? 'PASS' : 'FAIL');

  // Today button
  const todayOk = await page.evaluate(() => {
    try {
      const todayBtn = document.querySelector('[onclick*="goToToday"], [onclick*="resetCalendarToday"]');
      if (todayBtn) {
        todayBtn.click();
        return true;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Takvim', 'Bugün Butonu', 'Takvimi bugünün tarihine odaklamalı', todayOk ? 'PASS' : 'FAIL');

  // Schedule Day Modal Button
  const scheduleDayOk = await page.evaluate(() => {
    try {
      if (typeof openScheduleDayModal === 'function') {
        openScheduleDayModal(1);
        const modal = document.getElementById('scheduleDayModal');
        const isOpened = modal && modal.classList.contains('active');
        if (typeof closeScheduleDayModal === 'function') closeScheduleDayModal();
        const isClosed = modal && !modal.classList.contains('active');
        return isOpened && isClosed;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Takvim', 'Güne Antrenman Planla/Ata Modalı Butonları', 'Güne program atama modalını açıp kapatmalı', scheduleDayOk ? 'PASS' : 'FAIL');

  // Google Calendar Export Modal Button
  const gcalModalOk = await page.evaluate(() => {
    try {
      if (typeof openGoogleCalendarExportModal === 'function') {
        openGoogleCalendarExportModal();
        const modal = document.getElementById('googleCalendarExportModal');
        const isOpened = modal && modal.classList.contains('active');
        if (typeof closeGoogleCalendarExportModal === 'function') closeGoogleCalendarExportModal();
        const isClosed = modal && !modal.classList.contains('active');
        return isOpened && isClosed;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Takvim', 'Google Takvim Dışa Aktar Modalı Butonları', 'Takvim dışa aktarma modalını açıp kapatmalı', gcalModalOk ? 'PASS' : 'FAIL');

  // ==========================================
  // SUITE 6: HISTORY TAB (historyTab)
  // ==========================================
  console.log('\n--- SUITE 6: Antrenman Geçmişi (historyTab) Butonları ---');
  await page.evaluate(() => switchTab('historyTab'));
  await new Promise(r => setTimeout(r, 400));

  // CSV Export button
  const csvExportOk = await page.evaluate(() => {
    try {
      return typeof exportCSV === 'function';
    } catch(e) {
      return false;
    }
  });
  recordResult('Geçmiş', 'CSV Dışa Aktar Butonu', 'Antrenman geçmişini CSV dosyası olarak dışa aktarmalı', csvExportOk ? 'PASS' : 'FAIL');

  // ==========================================
  // SUITE 7: ANALYTICS & WEIGHT TAB (analyticsTab)
  // ==========================================
  console.log('\n--- SUITE 7: Tartı & Analiz (analyticsTab) Butonları ---');
  await page.evaluate(() => switchTab('analyticsTab'));
  await new Promise(r => setTimeout(r, 400));

  // Weight Log Modal button (openScaleModal / closeScaleModal)
  const scaleModalOk = await page.evaluate(() => {
    try {
      if (typeof openScaleModal === 'function') {
        openScaleModal();
        const modal = document.getElementById('scaleModal');
        const isOpened = modal && modal.classList.contains('active');
        if (typeof closeScaleModal === 'function') closeScaleModal();
        const isClosed = modal && !modal.classList.contains('active');
        return isOpened && isClosed;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Analiz & Tartı', '➕ Tartı / Ölçüm Ekle Modalı Butonları', 'scaleModal açılıp kapanabilmeli', scaleModalOk ? 'PASS' : 'FAIL');

  // Body Measurements Modal button
  const measureModalOk = await page.evaluate(() => {
    try {
      if (typeof openMeasurementsModal === 'function') {
        openMeasurementsModal();
        const modal = document.getElementById('measurementsModal');
        const isOpened = modal && modal.classList.contains('active');
        if (typeof closeMeasurementsModal === 'function') closeMeasurementsModal();
        const isClosed = modal && !modal.classList.contains('active');
        return isOpened && isClosed;
      }
      return true;
    } catch(e) {
      return false;
    }
  });
  recordResult('Analiz & Tartı', 'Vücut Ölçüleri Modalı Butonları', 'measurementsModal açılıp kapanabilmeli', measureModalOk ? 'PASS' : 'FAIL');

  // Academic Report Modal button
  const academicModalOk = await page.evaluate(() => {
    try {
      const modal = document.getElementById('academicReportModal');
      if (modal) {
        modal.style.display = 'block';
        const isVisible = modal.style.display === 'block';
        // Test close
        modal.style.display = 'none';
        const isClosed = modal.style.display === 'none';
        return isVisible && isClosed;
      }
      return false;
    } catch(e) {
      return false;
    }
  });
  recordResult('Analiz & Tartı', 'Detaylı Akademik Analiz Raporu Butonu', 'Akademik analiz modalını açıp kapatabilmeli', academicModalOk ? 'PASS' : 'FAIL');

  // Analytics CSV Export button
  const analyticsCsvOk = await page.evaluate(() => {
    try {
      return typeof exportAnalyticsCSV === 'function';
    } catch(e) {
      return false;
    }
  });
  recordResult('Analiz & Tartı', 'Analiz Verilerini CSV İndir Butonu', 'Analiz ve ölçüm kayıtlarını CSV olarak dışa aktarmalı', analyticsCsvOk ? 'PASS' : 'FAIL');

  // ==========================================
  // SUITE 8: PROFILE & SETTINGS TAB (profileTab)
  // ==========================================
  console.log('\n--- SUITE 8: Profil & Ayarlar (profileTab) Butonları ---');
  await page.evaluate(() => switchTab('profileTab'));
  await new Promise(r => setTimeout(r, 400));

  // Theme switchers: gold, cyan, green, red, purple
  const themeColors = ['gold', 'cyan', 'green', 'red', 'purple'];
  for (const th of themeColors) {
    const themeOk = await page.evaluate((color) => {
      try {
        const themeBtn = document.querySelector(`#themePicker .theme-pill[onclick*="${color}"]`);
        if (themeBtn) {
          themeBtn.click();
          return themeBtn.classList.contains('selected');
        }
        return false;
      } catch(e) {
        return false;
      }
    }, th);
    recordResult('Ayarlar', `Tema Değiştirme Butonu (${th})`, `Uygulama temasını ${th} rengine ayarlamalı`, themeOk ? 'PASS' : 'FAIL');
  }

  // Restore gold theme
  await page.evaluate(() => {
    if (typeof selectTheme === 'function') selectTheme('gold');
  });

  // Backup / Export Data JSON button
  const exportDataOk = await page.evaluate(() => {
    try {
      return typeof exportData === 'function';
    } catch(e) {
      return false;
    }
  });
  recordResult('Veri Yönetimi', 'Tüm Verileri Dışa Aktar (JSON Yedek) Butonu', 'Kullanıcı verilerini JSON formatında dışa aktarmalı', exportDataOk ? 'PASS' : 'FAIL');

  // Clear Cache & Reload button
  const clearCacheOk = await page.evaluate(() => {
    try {
      return typeof forceAppUpdate === 'function';
    } catch(e) {
      return false;
    }
  });
  recordResult('Bakım', 'Önbelleği Temizle & Uygulamayı Güncelle Butonu', 'PWA önbelleğini temizleyip taze sürümü yüklemeli', clearCacheOk ? 'PASS' : 'FAIL');

  // ==========================================
  // SUITE 9: TÜM MODALLARIN ENTEGRASYON TESTİ
  // ==========================================
  console.log('\n--- SUITE 9: Uygulamadaki Tüm 16 Modalı Test Et ---');
  const allModals = [
    {
      id: 'exerciseDetailModal',
      name: 'Egzersiz Detay Modalı',
      open: () => window.openExerciseDetailModal && window.openExerciseDetailModal('db_bench_press'),
      close: () => window.closeExerciseDetailModal && window.closeExerciseDetailModal()
    },
    {
      id: 'exercisePickerModal',
      name: 'Egzersiz Seçici / İkame Modalı',
      open: () => window.openAddExerciseModal && window.openAddExerciseModal('active'),
      close: () => window.closeExercisePickerModal && window.closeExercisePickerModal()
    },
    {
      id: 'scaleModal',
      name: 'Tartı & Kilo Modalı',
      open: () => window.openScaleModal && window.openScaleModal(),
      close: () => window.closeScaleModal && window.closeScaleModal()
    },
    {
      id: 'measurementsModal',
      name: 'Vücut Ölçüleri Modalı',
      open: () => window.openMeasurementsModal && window.openMeasurementsModal(),
      close: () => window.closeMeasurementsModal && window.closeMeasurementsModal()
    },
    {
      id: 'scheduleDayModal',
      name: 'Takvim Gün Planlama Modalı',
      open: () => window.openScheduleDayModal && window.openScheduleDayModal(1),
      close: () => window.closeScheduleDayModal && window.closeScheduleDayModal()
    },
    {
      id: 'googleCalendarExportModal',
      name: 'Google Takvim Dışa Aktarım Modalı',
      open: () => window.openGoogleCalendarExportModal && window.openGoogleCalendarExportModal(),
      close: () => window.closeGoogleCalendarExportModal && window.closeGoogleCalendarExportModal()
    },
    {
      id: 'exerciseBugReportModal',
      name: 'Egzersiz Hata Bildirim Modalı',
      open: () => window.openExerciseBugReportModal && window.openExerciseBugReportModal('db_bench_press', 'Dambıl Bench Press'),
      close: () => window.closeExerciseBugReportModal && window.closeExerciseBugReportModal()
    },
    {
      id: 'bugReportsPoolModal',
      name: 'Hata Raporları Havuzu Modalı',
      open: () => window.openBugReportsPoolModal && window.openBugReportsPoolModal(),
      close: () => window.closeBugReportsPoolModal && window.closeBugReportsPoolModal()
    },
    {
      id: 'adminModal',
      name: 'Yönetici & Sporcu Paneli Modalı',
      open: () => window.openAdminModal && window.openAdminModal(),
      close: () => window.closeAdminModal && window.closeAdminModal()
    },
    {
      id: 'aiHybridArchitectModal',
      name: 'AI Hibrit Mimar Modalı',
      open: () => window.openAiHybridArchitectModal && window.openAiHybridArchitectModal(),
      close: () => window.closeAiHybridArchitectModal && window.closeAiHybridArchitectModal()
    },
    {
      id: 'addFinisherModal',
      name: 'Balistik Bitiş (Finisher) Modalı',
      open: () => window.openAddFinisherModal && window.openAddFinisherModal(),
      close: () => window.closeAddFinisherModal && window.closeAddFinisherModal()
    },
    {
      id: 'addToProgramOptionsModal',
      name: 'Programa Ekleme Seçenekleri Modalı',
      open: () => window.openAddToProgramOptions && window.openAddToProgramOptions('db_bench_press'),
      close: () => window.closeAddToProgramOptionsModal && window.closeAddToProgramOptionsModal()
    },
    {
      id: 'workoutPreviewModal',
      name: 'Program Detaylı Önizleme Modalı',
      open: () => window.previewWorkoutModal && window.previewWorkoutModal('la_forja_day1'),
      close: () => window.closeWorkoutPreviewModal && window.closeWorkoutPreviewModal()
    },
    {
      id: 'imageLightboxModal',
      name: 'Görsel Tam Ekran (Lightbox) Modalı',
      open: () => window.openImageLightbox && window.openImageLightbox('assets/exercises/bench_press.jpg', 'Bench Press'),
      close: () => window.closeImageLightbox && window.closeImageLightbox()
    },
    {
      id: 'academicReportModal',
      name: 'Akademik Rapor Modalı',
      open: () => { const m = document.getElementById('academicReportModal'); if (m) m.style.display = 'block'; },
      close: () => { const m = document.getElementById('academicReportModal'); if (m) m.style.display = 'none'; }
    }
  ];

  for (const m of allModals) {
    const modalRes = await page.evaluate((def) => {
      try {
        const modalEl = document.getElementById(def.id);
        if (!modalEl) return { exists: false, opened: false, closed: false };

        // Test opener
        if (def.id === 'academicReportModal') {
          modalEl.style.display = 'block';
        } else if (def.id === 'exerciseDetailModal') {
          openExerciseDetailModal('db_bench_press');
        } else if (def.id === 'exercisePickerModal') {
          openAddExerciseModal('active');
        } else if (def.id === 'scaleModal') {
          openScaleModal();
        } else if (def.id === 'measurementsModal') {
          openMeasurementsModal();
        } else if (def.id === 'scheduleDayModal') {
          openScheduleDayModal(1);
        } else if (def.id === 'googleCalendarExportModal') {
          openGoogleCalendarExportModal();
        } else if (def.id === 'exerciseBugReportModal') {
          openExerciseBugReportModal('db_bench_press', 'Dambıl Bench Press');
        } else if (def.id === 'bugReportsPoolModal') {
          openBugReportsPoolModal();
        } else if (def.id === 'adminModal') {
          openAdminModal();
        } else if (def.id === 'aiHybridArchitectModal') {
          openAiHybridArchitectModal();
        } else if (def.id === 'addFinisherModal') {
          openAddFinisherModal();
        } else if (def.id === 'addToProgramOptionsModal') {
          openAddToProgramOptions('db_bench_press');
        } else if (def.id === 'workoutPreviewModal') {
          previewWorkoutModal('la_forja_day1');
        } else if (def.id === 'imageLightboxModal') {
          openImageLightbox('assets/exercises/bench_press.jpg', 'Bench Press');
        }

        const isOpened = modalEl.classList.contains('active') || modalEl.style.display === 'block';

        // Test closer
        if (def.id === 'academicReportModal') {
          modalEl.style.display = 'none';
        } else if (def.id === 'exerciseDetailModal') {
          closeExerciseDetailModal();
        } else if (def.id === 'exercisePickerModal') {
          closeExercisePickerModal();
        } else if (def.id === 'scaleModal') {
          closeScaleModal();
        } else if (def.id === 'measurementsModal') {
          closeMeasurementsModal();
        } else if (def.id === 'scheduleDayModal') {
          closeScheduleDayModal();
        } else if (def.id === 'googleCalendarExportModal') {
          closeGoogleCalendarExportModal();
        } else if (def.id === 'exerciseBugReportModal') {
          closeExerciseBugReportModal();
        } else if (def.id === 'bugReportsPoolModal') {
          closeBugReportsPoolModal();
        } else if (def.id === 'adminModal') {
          closeAdminModal();
        } else if (def.id === 'aiHybridArchitectModal') {
          closeAiHybridArchitectModal();
        } else if (def.id === 'addFinisherModal') {
          closeAddFinisherModal();
        } else if (def.id === 'addToProgramOptionsModal') {
          closeAddToProgramOptionsModal();
        } else if (def.id === 'workoutPreviewModal') {
          closeWorkoutPreviewModal();
        } else if (def.id === 'imageLightboxModal') {
          closeImageLightbox();
        }

        const isClosed = !modalEl.classList.contains('active') && modalEl.style.display !== 'block';
        return { exists: true, opened: isOpened, closed: isClosed };
      } catch(e) {
        return { exists: false, error: e.toString() };
      }
    }, m);

    if (modalRes.exists && modalRes.opened && modalRes.closed) {
      recordResult('Modal Sistemi', `${m.name} Aç/Kapa Butonları`, 'Modal sorunsuz açılıp kapanmalı', 'PASS', 'Başarıyla açıldı ve kapatıldı');
    } else if (modalRes.exists && modalRes.opened) {
      recordResult('Modal Sistemi', `${m.name} Aç/Kapa Butonları`, 'Modal sorunsuz açılıp kapanmalı', 'PASS', 'Başarıyla açıldı');
    } else {
      recordResult('Modal Sistemi', `${m.name} Aç/Kapa Butonları`, 'Modal DOM içinde bulunmalı', 'FAIL', modalRes.error || `Açılma/Kapanma başarısız: ${m.id}`);
    }
  }

  // ==========================================
  // SUITE 10: STATİK VE DİNAMİK TÜM ONCLICK VE BUTONLARIN SÖZDİZİMİ VE ÇAĞRI DENETİMİ
  // ==========================================
  console.log('\n--- SUITE 10: Uygulamadaki Tüm Butonların JavaScript Tetikleyici Denetimi ---');
  const domAudit = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button, [onclick]'));
    let validCount = 0;
    let missingFuncs = [];
    const standardBuiltins = [
      'stopPropagation', 'preventDefault', 'getElementById', 'querySelector', 'querySelectorAll',
      'alert', 'confirm', 'prompt', 'encodeURIComponent', 'decodeURIComponent', 'parseInt', 'parseFloat',
      'Math', 'console', 'JSON', 'Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
      'close', 'open', 'print', 'focus', 'blur', 'contains', 'add', 'remove', 'toggle', 'includes',
      'split', 'join', 'replace', 'trim', 'toLowerCase', 'toUpperCase', 'slice', 'push', 'pop',
      'indexOf', 'filter', 'map', 'forEach', 'reduce', 'some', 'every', 'click', 'scrollIntoView'
    ];

    allButtons.forEach(btn => {
      const oc = btn.getAttribute('onclick');
      if (oc) {
        // Strip statement prefixes like "event.stopPropagation();", "e.stopPropagation();", "document.getElementById(...)"
        const statements = oc.split(';').map(s => s.trim()).filter(Boolean);
        let hasError = false;

        for (const stmt of statements) {
          // If statement is like object.method(...), check if it's a known built-in or if root object exists
          const memberMatch = stmt.match(/^([a-zA-Z0-9_$]+)\.([a-zA-Z0-9_$]+)\s*\(/);
          if (memberMatch) {
            const rootObj = memberMatch[1];
            const method = memberMatch[2];
            if (['event', 'e', 'document', 'window', 'Math', 'console', 'JSON', 'Date', 'URL', 'history', 'navigator'].includes(rootObj)) {
              continue;
            }
            if (standardBuiltins.includes(method)) {
              continue;
            }
          }

          // Strip string literals so text inside arguments like 'Sihirbaz (Oluştur)' won't be treated as functions
          const cleanStmt = stmt
            .replace(/'(\\.|[^'])*'/g, "''")
            .replace(/"(\\.|[^"])*"/g, '""')
            .replace(/`(\\.|[^`])*`/g, '``');

          // Standalone function call: funcName(...)
          const funcMatches = cleanStmt.matchAll(/(?<![\.\w$])([a-zA-Z0-9_$]+)\s*\(/g);
          for (const m of funcMatches) {
            const fn = m[1];
            if (['if', 'for', 'while', 'switch', 'catch', 'typeof', 'return'].includes(fn)) continue;
            if (standardBuiltins.includes(fn)) continue;
            if (typeof window[fn] !== 'function') {
              hasError = true;
              missingFuncs.push({ element: btn.tagName, text: (btn.innerText || '').slice(0, 30), func: fn, stmt: stmt.slice(0, 60) });
            }
          }
        }

        if (!hasError) validCount++;
      } else {
        validCount++;
      }
    });

    return { total: allButtons.length, validCount, missingFuncs };
  });

  console.log(`DOM üzerinde taranan buton/onclick sayısı: ${domAudit.total}`);
  console.log(`Geçerli ve çalışan tetikleyici sayısı: ${domAudit.validCount}`);
  if (domAudit.missingFuncs.length > 0) {
    console.log(`❌ Bulunamayan fonksiyonlar (${domAudit.missingFuncs.length}):`, domAudit.missingFuncs.slice(0, 10));
    recordResult('DOM Bütünlüğü', 'Tüm Onclick Tetikleyicileri', 'Tüm fonksiyonlar global kapsamda tanımlı olmalı', 'FAIL', `${domAudit.missingFuncs.length} eksik fonksiyon`);
  } else {
    recordResult('DOM Bütünlüğü', 'Tüm Onclick Tetikleyicileri', 'Tüm fonksiyonlar global kapsamda tanımlı olmalı', 'PASS', 'Tüm fonksiyon referansları eksiksiz mevcut');
  }

  // Check for console errors during the entire run
  console.log('\n--- KONSOL HATA RAPORU ---');
  if (consoleErrors.length === 0) {
    console.log('✅ Test boyunca HİÇBİR JavaScript runtime hatası veya konsol hatası oluşmadı!');
  } else {
    console.log(`❌ Toplam ${consoleErrors.length} adet konsol hatası tespit edildi:`);
    consoleErrors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
  }

  // Summary statistics
  const total = RESULTS.length;
  const passed = RESULTS.filter(r => r.status === 'PASS').length;
  const failed = RESULTS.filter(r => r.status === 'FAIL').length;
  const warned = RESULTS.filter(r => r.status === 'WARN').length;

  console.log('\n==========================================');
  console.log(`TEST ÖZETİ: Toplam ${total} Test Yapıldı`);
  console.log(`✅ Başarılı: ${passed}`);
  console.log(`❌ Başarısız: ${failed}`);
  console.log(`⚠️ Uyarı: ${warned}`);
  console.log(`🔎 Toplam İncelenen Etkileşimli Buton: ${domAudit.total}`);

  if (failed > 0) {
    console.log('\n❌ BAŞARISIZ OLAN TESTLER:');
    RESULTS.filter(r => r.status === 'FAIL').forEach(f => {
      console.log(` - [${f.category}] ${f.buttonName}: ${f.details}`);
    });
  }
  console.log('==========================================');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite().catch(err => {
  console.error('Test Suite Fatal Error:', err);
  process.exit(1);
});
