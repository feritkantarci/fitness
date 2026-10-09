/**
 * ÇELİK KODU - AKADEMİK AI KOÇ SERVİSİ (Gemini Sports Science AI)
 * 
 * Spor bilimi makalelerini ve sporcunun gerçek verilerini sentezleyerek
 * akademik analiz raporu ve web'e gönderilecek somut antrenman reçetesi üretir.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Varsayılan API Anahtarı veya kullanıcı tarafından girilen anahtar
let activeApiKey = process.env.GEMINI_API_KEY || '';

function setApiKey(key) {
    activeApiKey = key;
}

function getApiKey() {
    return activeApiKey;
}

/**
 * Sporcu verilerini ve akademik motor sonuçlarını alıp derinlemesine AI analizi ve programı üretir.
 */
async function generateAcademicPrescription(athleteProfile, academicData, userCustomPrompt = '') {
    if (!activeApiKey) {
        throw new Error('Gemini API anahtarı girilmedi. Lütfen ayarlar bölümünden API anahtarınızı kaydedin.');
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
Sen "Çelik Kodu" sisteminin Baş Spor Bilimcisi ve Elit Performans Koçusun.
Analizlerini ve programlarını doğrudan şu akademik literatüre dayandırırsın:
- Dr. Brad Schoenfeld: Kas hipertrofisi mekanizmaları (Mekanik Gerilim, Hacim-Doz İlişkisi)
- Dr. Mike Israetel (Renaissance Periodization): Hacim Eşikleri (MEV: Asgari Etkili, MAV: Optimal Gelişim, MRV: Aşırı Yük/Toparlanamama)
- Chris Beardsley: Efektif Tekrar Modeli (Son 5 tekrarın motor ünite uyarımı, Çöp Hacmin ayıklanması)
- Eric Helms & Greg Nuckols: Kademeli Aşırı Yüklenme (Progressive Overload) ve Yük Dalgalanması
- Dr. Stuart McGill: Omurga biyomekaniği ve yapısal denge (İtiş/Çekiş ve Ön/Arka Zincir Oranları)

GÖREVİN:
Sana verilen sporcu verilerini ve hesaplanmış akademik metrikleri incele.
Web arayüzündeki eksik ve yüzeysel analizlerin ötesine geçerek:
1. AKADEMİK TEŞHİS: Sporcunun mevcut hacim ve denge durumunu makale referanslarıyla açıkla.
2. EKSİK/RİSKLİ ALANLAR: MEV (Asgari Etkili Hacim) altında kalan—yani kasın gelişebilmesi için haftalık gereken en düşük set sayısına dahi ulaşamamış ihmal edilmiş bölgeleri—ve sakatlık riski doğuran anatomik dengesizlikleri belirt.
3. SOMUT REÇETE & PROGRAM: Sporcunun salon web uygulamasına (telefona) gönderilecek, set, tekrar, RIR ve kilo tavsiyelerini içeren optimize edilmiş yeni bir antrenman bloğu oluştur.
4. WEB DİREKTİFİ: Sporcunun telefonunda en üstte görünecek 2-3 cümlelik net koçluk taktiği.

Yanıtını kesinlikle Türkçe, tamamen akademik, nesnel, doğrudan ve bilimsel bir dille ver; motivasyonel veya süslü klişeler kullanma.
`;

    const athleteDataSummary = JSON.stringify({
        sporcu: {
            isim: athleteProfile.name || 'Sporcu',
            seviye: athleteProfile.level || 'Orta Seviye',
            mevcutAgirliklar: athleteProfile.weights || {}
        },
        akademikMetrikler: academicData.summary,
        kasHacimleri: academicData.muscleBreakdown,
        biyomekanikUyarilar: academicData.biomechanicalWarnings,
        hacimAciklari: academicData.deficits,
        asiriHacimler: academicData.overreached,
        antrenorOzelTalimati: userCustomPrompt || 'Genel hipertrofi ve zayıf kas gruplarını güçlendirme odaklı akademik reçete hazırla.'
    }, null, 2);

    const userPrompt = `
Aşağıdaki sporcu analiz verilerini incele ve akademik spor bilimi çerçevesinde değerlendir:

\`\`\`json
${athleteDataSummary}
\`\`\`

Lütfen yanıtını şu 3 ana bölümde sun:

### 1. 🔬 AKADEMİK SPOR BİLİMİ DEĞERLENDİRMESİ
(Literatür referanslarıyla hacim, biyomekanik oranlar ve çöp hacim analizi)

### 2. 📱 WEB UYGULAMASI DİREKTİFİ (Telefonda Görünecek Özet)
(Sporcunun salonda telefonunu açtığında göreceği net, vurucu koç yönergesi)

### 3. 📋 OPTİMİZE EDİLMİŞ BİLİMSEL ANTRENMAN PROGRAMI
(Web uygulamasına yüklenebilecek gün gün veya egzersiz egzersiz set, tekrar, hedef RIR ve kilo tavsiyeleri)
`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const responseText = result.response.text();

    return {
        timestamp: new Date().toISOString(),
        rawReport: responseText,
        athleteName: athleteProfile.name,
        athleteId: athleteProfile.id
    };
}

module.exports = {
    setApiKey,
    getApiKey,
    generateAcademicPrescription
};
