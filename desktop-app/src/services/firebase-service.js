/**
 * ÇELİK KODU - FIREBASE BULUT KÖPRÜSÜ (Firebase Cloud Bridge)
 * 
 * Masaüstü uygulaması ile Web PWA (fitness.kantarci.io) arasındaki
 * canlı veri okuma ve uzaktan komut/yönerge dağıtım servisi.
 */

const { initializeApp, getApps } = require('firebase/app');
const { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    onSnapshot, 
    serverTimestamp 
} = require('firebase/firestore');

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBieTQ50PsVTLW1gTfsx52l42RJJ63xNqo",
    authDomain: "fitness-4f427.firebaseapp.com",
    projectId: "fitness-4f427",
    storageBucket: "fitness-4f427.firebasestorage.app",
    messagingSenderId: "974918246558",
    appId: "1:974918246558:web:b1d83ce9366df04bf60eb8"
};

let app;
let db;

function initFirebase() {
    if (!getApps().length) {
        app = initializeApp(FIREBASE_CONFIG);
    } else {
        app = getApps()[0];
    }
    db = getFirestore(app);
    return db;
}

/**
 * Kayıtlı sporcuları ve profillerini çeker
 */
async function fetchUsers() {
    if (!db) initFirebase();
    try {
        const userDoc = await getDoc(doc(db, 'app_system', 'users'));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return data.users || [];
        }
        return [];
    } catch (err) {
        console.error("Firebase kullanıcıları çekilemedi:", err);
        return [];
    }
}

/**
 * Bir sporcunun tüm antrenman geçmişini çeker
 */
async function fetchWorkoutLogs(uid) {
    if (!db) initFirebase();
    try {
        const logDoc = await getDoc(doc(db, 'workout_logs', uid));
        if (logDoc.exists()) {
            const data = logDoc.data();
            return data.logs || [];
        }
        return [];
    } catch (err) {
        console.error(`Firebase antrenmanları çekilemedi (${uid}):`, err);
        return [];
    }
}

/**
 * Tartı geçmişini çeker
 */
async function fetchScaleLogs(uid) {
    if (!db) initFirebase();
    try {
        const docSnap = await getDoc(doc(db, 'scale_logs', uid));
        if (docSnap.exists()) {
            return (docSnap.data() || {}).logs || [];
        }
        return [];
    } catch (err) {
        return [];
    }
}

/**
 * Sporcunun antrenman kayıtlarını CANLI dinler (Gerçek Zamanlı)
 * Sporcu salonda telefonundan antrenmanı bitirdiği an bu fonksiyon tetiklenir!
 */
function listenToAthleteWorkouts(uid, onNewWorkoutCallback) {
    if (!db) initFirebase();
    const unsub = onSnapshot(doc(db, 'workout_logs', uid), (snapshot) => {
        if (snapshot.exists()) {
            const logs = (snapshot.data() || {}).logs || [];
            onNewWorkoutCallback(logs);
        }
    }, (error) => {
        console.warn("Canlı antrenman dinleyici hatası:", error);
    });
    return unsub;
}

/**
 * WEB UYGULAMASINA DİREKTİF / YÖNERGE GÖNDER
 * Bu fonksiyon çağrıldığında Firestore 'coach_directives' dokümanına yazar.
 * Web PWA bunu canlı yakalar ve sporcunun ana ekranına "Koç Direktifi" olarak basar.
 */
async function sendDirectiveToWeb(uid, directiveData) {
    if (!db) initFirebase();
    try {
        const ref = doc(db, 'coach_directives', uid);
        await setDoc(ref, {
            ...directiveData,
            createdAt: serverTimestamp(),
            sentFrom: 'CelikKodu_Desktop_Station'
        }, { merge: true });
        return { success: true, message: 'Direktif web uygulamasına başarıyla iletildi.' };
    } catch (err) {
        console.error("Web direktifi gönderilemedi:", err);
        return { success: false, error: err.message };
    }
}

/**
 * WEB UYGULAMASINA ÖZEL YENİ PROGRAM ŞABLONU GÖNDER
 */
async function sendCustomProgramToWeb(uid, programData) {
    if (!db) initFirebase();
    try {
        const ref = doc(db, 'custom_programs', uid);
        await setDoc(ref, {
            ...programData,
            updatedAt: serverTimestamp(),
            source: 'Academic_AI_Coach'
        }, { merge: true });
        return { success: true, message: 'Yeni akademik program web uygulamasına başarıyla yüklendi.' };
    } catch (err) {
        console.error("Program gönderilemedi:", err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    initFirebase,
    fetchUsers,
    fetchWorkoutLogs,
    fetchScaleLogs,
    listenToAthleteWorkouts,
    sendDirectiveToWeb,
    sendCustomProgramToWeb
};
