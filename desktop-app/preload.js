/**
 * ÇELİK KODU KOÇ İSTASYONU - PRELOAD (Context Bridge)
 * 
 * Güvenli IPC köprüsü: Arayüz (Renderer) ile Node.js çekirdeği arasında
 * güvenli veri transferi sağlar.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('coachAPI', {
    // Firebase İşlemleri
    getUsers: () => ipcRenderer.invoke('firebase:getUsers'),
    getWorkoutLogs: (uid) => ipcRenderer.invoke('firebase:getWorkoutLogs', uid),
    getScaleLogs: (uid) => ipcRenderer.invoke('firebase:getScaleLogs', uid),
    saveScaleLogs: (uid, logs) => ipcRenderer.invoke('firebase:saveScaleLogs', { uid, logs }),
    sendDirectiveToWeb: (uid, directive) => ipcRenderer.invoke('firebase:sendDirective', { uid, directive }),
    sendProgramToWeb: (uid, program) => ipcRenderer.invoke('firebase:sendProgram', { uid, program }),

    // Akademik Spor Bilimi Analizi & Biyomekanik Atlas
    analyzeHistory: (logs, profile, scaleLogs) => ipcRenderer.invoke('academic:analyze', { logs, profile, scaleLogs }),
    getExerciseCatalog: () => ipcRenderer.invoke('catalog:getExercises'),

    // AI Koçluk & Gemini Reçete & İstişare
    generatePrescription: (payload) => ipcRenderer.invoke('ai:generatePrescription', payload),
    consultWithAi: (payload) => ipcRenderer.invoke('ai:consult', payload),
    saveApiKey: (key) => ipcRenderer.invoke('ai:saveApiKey', key),
    getApiKey: () => ipcRenderer.invoke('ai:getApiKey'),

    // Masaüstü Bildirimi
    showNotification: (title, body) => ipcRenderer.invoke('app:notify', { title, body }),

    // Canlı Olay Dinleyicileri
    onLiveWorkoutUpdated: (callback) => {
        ipcRenderer.on('live:workoutUpdated', (event, data) => callback(data));
    }
});
