/**
 * ÇELİK KODU - MASAÜSTÜ KOÇ İSTASYONU (Electron Main Process)
 * 
 * Mac ve Windows için native masaüstü pencere yönetimi,
 * donanım hızlandırma, sistem bildirimleri ve arka plan Firebase/AI köprüsü.
 */

const { app, BrowserWindow, ipcMain, Notification, shell, protocol, net } = require('electron');
const { pathToFileURL } = require('url');
const path = require('path');
const fs = require('fs');

// Güvenli yerel görsel/medya şeması kaydı
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'fitlab-asset',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
            stream: true
        }
    }
]);

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
        // GÜVENLİK: API anahtarı artık genel Firestore dokümanına yazılmaz (sızıntı önleme)
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

    // Güvenlik: Harici web navigasyonlarını ve izinsiz yönlenmeleri engelle
    mainWindow.webContents.on('will-navigate', (event, url) => {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol !== 'file:') {
                event.preventDefault();
                console.warn(`[FitLAB Güvenlik] Yetkisiz pencere navigasyonu engellendi: ${url}`);
            }
        } catch(e) {
            event.preventDefault();
        }
    });

    // Güvenlik: Harici pencereleri varsayılan sistem tarayıcısında aç (yalnızca http/https)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        try {
            const parsed = new URL(url);
            if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
                shell.openExternal(url);
            }
        } catch(e) {}
        return { action: 'deny' };
    });

    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        console.log(`[Renderer Console] [${level}] ${message} (line: ${line}, src: ${sourceId})`);
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error(`[Renderer Load Fail] ${errorCode}: ${errorDescription}`);
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
    // Protokol Dinleyicisi (Offline-First Görsel & Medya Sunumu - Path Traversal Korumalı)
    protocol.handle('fitlab-asset', (request) => {
        try {
            const url = new URL(request.url);
            const rawRelPath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
            const cleanPath = path.normalize(rawRelPath);

            // Güvenlik: Null byte veya kök dışına sızma girişimlerini anında engelle
            if (cleanPath.startsWith('..') || path.isAbsolute(cleanPath) || cleanPath.includes('\0')) {
                console.warn(`[FitLAB Güvenlik] Yetkisiz dosya yolu erişimi engellendi: ${cleanPath}`);
                return new Response('Forbidden', { status: 403 });
            }

            const safeResolve = (baseDir, rel) => {
                const target = path.resolve(baseDir, rel);
                const relDiff = path.relative(baseDir, target);
                if (relDiff.startsWith('..') || path.isAbsolute(relDiff)) {
                    return null;
                }
                return target;
            };

            // Güvenlik: Yalnızca izin verilen medya uzantılarına izin ver
            const ALLOWED_ASSET_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.mp4', '.json', '.gif']);
            const fileExt = path.extname(cleanPath).toLowerCase();
            if (!ALLOWED_ASSET_EXTS.has(fileExt)) {
                return new Response('Forbidden file type', { status: 403 });
            }

            // 1. Paket içi kaynaklar (FitLAB.app/Contents/Resources/assets/...)
            if (app.isPackaged) {
                const resPath = safeResolve(path.join(process.resourcesPath, 'assets'), cleanPath.replace(/^assets\//, ''));
                if (resPath && fs.existsSync(resPath)) {
                    return net.fetch(pathToFileURL(resPath).toString());
                }
            }

            // 2. Geliştirici/Yerel depo assets klasörü (FITNESS/assets/...)
            const rootAssetsPath = safeResolve(path.join(__dirname, '..', 'assets'), cleanPath.replace(/^assets\//, ''));
            if (rootAssetsPath && fs.existsSync(rootAssetsPath)) {
                return net.fetch(pathToFileURL(rootAssetsPath).toString());
            }

            // 3. desktop-app/assets klasörü
            const appAssetsPath = safeResolve(path.join(__dirname, 'assets'), cleanPath.replace(/^assets\//, ''));
            if (appAssetsPath && fs.existsSync(appAssetsPath)) {
                return net.fetch(pathToFileURL(appAssetsPath).toString());
            }

            // 4. Bulut / CDN Yedek Yolu (yalnızca izin verilen medya uzantıları)
            if (/^[a-zA-Z0-9_\-\/\.]+\.(png|jpe?g|webp|svg|mp4|json|gif)$/i.test(cleanPath)) {
                return net.fetch(`https://fitness.kantarci.io/${cleanPath}`);
            }
            return new Response('Asset not found', { status: 404 });
        } catch (err) {
            console.error('[FitLAB Asset Protocol Hatası]', err);
            return new Response('Asset not found', { status: 404 });
        }
    });

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

ipcMain.handle('firebase:getDirective', async (event, uid) => {
    return await firebaseService.fetchCoachDirective(uid);
});

// Takvim Entegrasyonu (Apple Takvim / iCal / Google Takvim)
ipcMain.handle('calendar:exportAndOpenICS', async (event, icsContent) => {
    try {
        const tmpPath = path.join(app.getPath('temp'), `fitlab-program-${Date.now()}.ics`);
        fs.writeFileSync(tmpPath, icsContent, 'utf-8');
        await shell.openPath(tmpPath);
        return { success: true, path: tmpPath };
    } catch(err) {
        console.error("Takvim dosyası açılamadı:", err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('calendar:openUrl', async (event, url) => {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            throw new Error('Yalnızca http/https protokollerine izin verilir.');
        }
        await shell.openExternal(url);
        return { success: true };
    } catch(err) {
        return { success: false, error: err.message };
    }
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

ipcMain.handle('ai:consult', async (event, { profile, academicData, conversationHistory, message }) => {
    return await aiCoachService.conductConsultationDialogue(profile, academicData, conversationHistory, message);
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

// Medya & Görsel Çözümleyici (fitlab-asset:// URL türetici)
ipcMain.handle('app:resolveAssetUrl', async (event, relativePath) => {
    if (!relativePath) return '';
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
        return relativePath;
    }
    const cleanRel = relativePath.replace(/^(\.\/|\/)+/, '');
    return `fitlab-asset://app/${cleanRel}`;
});

