/**
 * ÇELİK KODU - MASAÜSTÜ KOÇ İSTASYONU (Electron Main Process)
 * 
 * Mac ve Windows için native masaüstü pencere yönetimi,
 * donanım hızlandırma, sistem bildirimleri ve arka plan Firebase/AI köprüsü.
 */

const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// Servisler
const firebaseService = require('./src/services/firebase-service');
const academicEngine = require('./src/services/academic-engine');
const aiCoachService = require('./src/services/ai-coach-service');
const exerciseCatalog = require('./src/services/exercise-catalog');

// API Anahtarı Saklama Dosyası (Local config)
const CONFIG_PATH = path.join(app.getPath('userData'), 'coach_config.json');

function loadSavedApiKey() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
            if (data.apiKey) {
                aiCoachService.setApiKey(data.apiKey);
                return data.apiKey;
            }
        }
    } catch (e) {
        console.warn("Config okunamadı:", e);
    }
    return '';
}

function saveApiKeyToDisk(key) {
    try {
        aiCoachService.setApiKey(key);
        fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey: key }, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error("Config yazılamadı:", e);
        return false;
    }
}

let mainWindow = null;
let activeLiveUnsubs = [];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1320,
        height: 880,
        minWidth: 1040,
        minHeight: 700,
        backgroundColor: '#0a0d14',
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        trafficLightPosition: { x: 16, y: 16 },
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'renderer', 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
        activeLiveUnsubs.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        activeLiveUnsubs = [];
    });
}

// Uygulama Yaşam Döngüsü
app.whenReady().then(() => {
    // Kayıtlı API anahtarını yükle
    loadSavedApiKey();

    // Firebase başlat
    firebaseService.initFirebase();

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

let activeAthleteUnsub = null;
let currentListeningUid = null;

function subscribeToAthlete(uid) {
    if (!uid || currentListeningUid === uid) return;
    if (activeAthleteUnsub) {
        try { activeAthleteUnsub(); } catch(e) {}
        activeAthleteUnsub = null;
    }
    currentListeningUid = uid;

    let isFirstSnapshot = true;
    activeAthleteUnsub = firebaseService.listenToAthleteWorkouts(uid, (newLogs) => {
        // İlk anlık snapshot'ı yoksay (çünkü getWorkoutLogs zaten veriyi ilk kez çekti)
        if (isFirstSnapshot) {
            isFirstSnapshot = false;
            return;
        }

        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('live:workoutUpdated', { uid, logs: newLogs });
            if (Notification.isSupported()) {
                new Notification({
                    title: '⚡ Canlı Antrenman Bildirimi',
                    body: `Sporcu salonda yeni bir antrenman tamamladı! Akademik analiz güncellendi.`
                }).show();
            }
        }
    });
}

// ==================== IPC HANDLERS ====================

// Firebase İşlemleri
ipcMain.handle('firebase:getUsers', async () => {
    return await firebaseService.fetchUsers();
});

ipcMain.handle('firebase:getWorkoutLogs', async (event, uid) => {
    const logs = await firebaseService.fetchWorkoutLogs(uid);
    subscribeToAthlete(uid);
    return logs;
});

ipcMain.handle('firebase:getScaleLogs', async (event, uid) => {
    return await firebaseService.fetchScaleLogs(uid);
});

ipcMain.handle('firebase:saveScaleLogs', async (event, { uid, logs }) => {
    return await firebaseService.saveScaleLogs(uid, logs);
});

ipcMain.handle('firebase:sendDirective', async (event, { uid, directive }) => {
    return await firebaseService.sendDirectiveToWeb(uid, directive);
});

ipcMain.handle('firebase:sendProgram', async (event, { uid, program }) => {
    return await firebaseService.sendCustomProgramToWeb(uid, program);
});

// Akademik Spor Bilimi Motoru & Egzersiz Atlası
ipcMain.handle('academic:analyze', async (event, { logs, profile, scaleLogs }) => {
    return academicEngine.analyzeAthleteHistory(logs, profile, scaleLogs);
});

ipcMain.handle('catalog:getExercises', async () => {
    return exerciseCatalog.getFullCatalog();
});

// AI Koçluk
ipcMain.handle('ai:generatePrescription', async (event, { profile, academicData, prompt }) => {
    return await aiCoachService.generateAcademicPrescription(profile, academicData, prompt);
});

ipcMain.handle('ai:saveApiKey', async (event, key) => {
    return saveApiKeyToDisk(key);
});

ipcMain.handle('ai:getApiKey', async () => {
    return aiCoachService.getApiKey() || loadSavedApiKey();
});

// Sistem Bildirimi
ipcMain.handle('app:notify', (event, { title, body }) => {
    if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return true;
    }
    return false;
});
