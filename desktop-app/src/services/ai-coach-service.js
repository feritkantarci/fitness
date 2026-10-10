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

// Desteklenen ve öncelikli model adayları
const CANDIDATE_MODELS = [
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro'
];

/**
 * Sporcu verilerini ve akademik motor sonuçlarını alıp derinlemesine AI analizi ve programı üretir.
 */
async function generateAcademicPrescription(athleteProfile, academicData, userCustomPrompt = '') {
    if (!activeApiKey) {
        throw new Error('Gemini API anahtarı girilmedi. Lütfen ayarlar bölümünden API anahtarınızı kaydedin.');
    }

    const genAI = new GoogleGenerativeAI(activeApiKey);

    const systemPrompt = `
Sen "FitLAB" sisteminin Baş Spor Bilimcisi ve Elit Biyomekanik Koçusun.
Analizlerini ve programlarını doğrudan şu akademik literatüre dayandırırsın:
- Dr. Brad Schoenfeld & Chris Beardsley: Kas hipertrofisi mekanizmaları (Mekanik Gerilim, Efektif Tekrar, Lengthened Overload)
- Dr. Mike Israetel (Renaissance Periodization): Hacim Eşikleri (MEV: Asgari Etkili, MAV: Optimal Gelişim, MRV: Aşırı Yük Tavanı)
- Biyomekanik Mekanik Gerilim Katsayısı (MTF): Ağır Serbest Ağırlık Bileşik (%100 uyarım), İzolasyon (%100 uyarım), Vücut Ağırlığı Kuvvet (%65-85 uyarım), Kondisyon/Burpee (%0 hipertrofi uyarımı).
- Uyarım/Yorgunluk Oranı (SFR - Stimulus-to-Fatigue Ratio): Eklemi yıpratmayan, omurgaya gereksiz aksiyel yük bindirmeyen ama hedef kasta maksimum gerilim üreten egzersiz önceliği.
- Pedrosa & Maeo: Esneme Aracılı Hipertrofi (Kasın gergin pozisyonda yüklendiği hareketlerin üstünlüğü).
- Egzersiz Fizyolojisi & Biyo-Empedans Vücut Kompozisyonu (BIA / Tartı Analizi): Kilo, % Yağ, İskelet Kası kg, Viseral Yağ ve BMR parametrelerine göre programın fazını (definasyon/metabolik yoğunluk, temiz hipertrofi/bulk veya rekompozisyon) belirler; vücut ağırlığı egzersizlerindeki relatif yükü sporcunun ağırlığına göre modüle eder.

GÖREVİN:
Sana verilen sporcu verilerini, hesaplanmış akademik metrikleri ve tartı analizini incele.
1. AKADEMİK TEŞHİS: Sporcunun mevcut mekanik gerilim hacmini, MEV altı açıklarını ve biyomekanik oranlarını makale referanslarıyla açıkla.
2. VÜCUT KOMPOZİSYONU ENTEGRASYONU: Sporcunun kilo, yağ oranı %, iskelet kası kütlesi kg, viseral yağlanma ve BMR değerlerini analiz ederek antrenman yoğunluğunu, dinlenme sürelerini ve kondisyon ihtiyacını belirle.
3. EKSİK/RİSKLİ ALANLAR: MEV altında kalan ihmal edilmiş bölgeleri ve sakatlık riski doğuran yapısal dengesizlikleri belirt.
4. SOMUT REÇETE & PROGRAM: Sporcunun salon web uygulamasına (telefona) gönderilecek; yüksek SFR, esneme pozisyonu ve vücut kompozisyonu hedefine uygun egzersizleri, set, tekrar, hedef RIR ve kilo tavsiyelerini içeren optimize edilmiş yeni bir antrenman bloğu oluştur.
5. WEB DİREKTİFİ: Sporcunun telefonunda en üstte görünecek 2-3 cümlelik net, vurucu koç yönergesi (tartı/fiziksel kompozisyon hedefini de içermelidir).

Yanıtını kesinlikle Türkçe, tamamen akademik, nesnel, doğrudan ve bilimsel bir dille ver; motivasyonel veya süslü klişeler kullanma.
`;

    const athleteDataSummary = JSON.stringify({
        sporcu: {
            isim: athleteProfile.name || 'Sporcu',
            seviye: athleteProfile.level || 'Orta Seviye',
            mevcutAgirliklar: athleteProfile.weights || {}
        },
        tartiVeVucutKompozisyonu: (academicData.bodyComposition && academicData.bodyComposition.hasData) ? {
            guncelKilo: `${academicData.bodyComposition.metrics.weight} kg`,
            vucutYagOrani: academicData.bodyComposition.metrics.bodyFat !== null ? `%${academicData.bodyComposition.metrics.bodyFat}` : 'Belirtilmedi',
            iskeletKasiKutlesi: academicData.bodyComposition.metrics.skeletalMuscle !== null ? `${academicData.bodyComposition.metrics.skeletalMuscle} kg` : 'Belirtilmedi',
            yagsizKutle: academicData.bodyComposition.metrics.leanMassKg !== null ? `${academicData.bodyComposition.metrics.leanMassKg} kg` : 'Belirtilmedi',
            yagKutlesi: academicData.bodyComposition.metrics.fatMassKg !== null ? `${academicData.bodyComposition.metrics.fatMassKg} kg` : 'Belirtilmedi',
            viseralYagSeviyesi: academicData.bodyComposition.metrics.visceralFat !== null ? academicData.bodyComposition.metrics.visceralFat : 'Normal',
            bazalMetabolizmaBmr: academicData.bodyComposition.metrics.bmr !== null ? `${academicData.bodyComposition.metrics.bmr} kcal` : 'Belirtilmedi',
            vucutPuani: academicData.bodyComposition.metrics.bodyScore || 'N/A',
            olcumTarihi: academicData.bodyComposition.latest?.date || '-',
            degisimTrendi: academicData.bodyComposition.delta ? {
                kiloDegisimi: `${academicData.bodyComposition.delta.weightKg > 0 ? '+' : ''}${academicData.bodyComposition.delta.weightKg} kg`,
                yagOraniDegisimi: academicData.bodyComposition.delta.bodyFatPct !== null ? `${academicData.bodyComposition.delta.bodyFatPct > 0 ? '+' : ''}${academicData.bodyComposition.delta.bodyFatPct}%` : '-',
                kasKutlesiDegisimi: academicData.bodyComposition.delta.muscleKg !== null ? `${academicData.bodyComposition.delta.muscleKg > 0 ? '+' : ''}${academicData.bodyComposition.delta.muscleKg} kg` : '-'
            } : 'Tek Ölçüm Kaydı Mevcut',
            fizyolojikHedefFazi: academicData.bodyComposition.diagnosis?.phaseTitle,
            kondisyonIhtiyaci: academicData.bodyComposition.diagnosis?.conditioningDemand,
            biyomekanikRelatifYuk: academicData.bodyComposition.diagnosis?.calisthenicsNote,
            bilimselStrateji: academicData.bodyComposition.diagnosis?.scientificGuidelines
        } : 'Kayıtlı tartı analizi yok (Standart hipertrofi)',
        akademikMetrikler: academicData.summary,
        kasHacimleri: academicData.muscleBreakdown,
        biyomekanikUyarilar: academicData.biomechanicalWarnings,
        hacimAciklari: academicData.deficits,
        asiriHacimler: academicData.overreached,
        antrenorOzelTalimati: userCustomPrompt || 'Genel hipertrofi, vücut kompozisyonu optimizasyonu ve zayıf kas gruplarını güçlendirme odaklı akademik reçete hazırla.'
    }, null, 2);

    const userPrompt = `
Aşağıdaki sporcu analiz verilerini incele ve akademik spor bilimi çerçevesinde değerlendir:

\`\`\`json
${athleteDataSummary}
\`\`\`

Lütfen yanıtını şu 3 ana bölümde sun:

### 1. 🔬 AKADEMİK SPOR BİLİMİ DEĞERLENDİRMESİ
- Hacim eşikleri (MEV/MAV/MRV), mekanik gerilim dağılımı ve çöp hacim analizi.
- **⚖️ Vücut Kompozisyonu ve Metabolik Durum Teşhisi:** (Sporcunun kilo, yağ oranı ve kas kütlesine göre antrenman fazının, enerji harcamasının ve relatif yüklenmesinin bilimsel açıklaması).

### 2. 📱 WEB UYGULAMASI DİREKTİFİ (Telefonda Görünecek Özet)
(Sporcunun salonda telefonunu açtığında göreceği net, vurucu koç yönergesi. Kilo ve kompozisyon hedefini de içermelidir).

### 3. 📋 OPTİMİZE EDİLMİŞ BİLİMSEL ANTRENMAN PROGRAMI
Antrenman programını haftanın günlerine (örneğin 3 günlük program için Gün 1 / Pazartesi, Gün 2 / Çarşamba, Gün 3 / Cuma) KESİNLİKLE AYRI GÜNLER HALİNDE VER.
Her gün için başlığı MUTLAKA şu standart formatta başlat ve altına egzersiz tablosunu koy:

#### GÜN 1: [Antrenman Başlığı & Odak Kas Grupları]
| Egzersiz | Hedef Mekanizma & Biyomekanik | Set | Tekrar | RIR | Yük Önerisi / Not |

#### GÜN 2: [Antrenman Başlığı & Odak Kas Grupları]
| Egzersiz | Hedef Mekanizma & Biyomekanik | Set | Tekrar | RIR | Yük Önerisi / Not |

#### GÜN 3: [Antrenman Başlığı & Odak Kas Grupları]
| Egzersiz | Hedef Mekanizma & Biyomekanik | Set | Tekrar | RIR | Yük Önerisi / Not |

(Haftalık toplam hacim veya özet analizi varsa bunları antrenman tablolarının altına ayrı bir başlık altında ekle).
`;

    let responseText = '';
    let lastError = null;

    // Öncelikli aday modelleri sırayla dene
    for (const modelName of CANDIDATE_MODELS) {
        try {
            console.log(`[FitLAB AI] '${modelName}' modeli deneniyor...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent([systemPrompt, userPrompt]);
            responseText = result.response.text();
            if (responseText) {
                console.log(`[FitLAB AI] '${modelName}' ile başarıyla reçete üretildi.`);
                break;
            }
        } catch (err) {
            console.warn(`[FitLAB AI] '${modelName}' başarısız oldu:`, err.message);
            lastError = err;
        }
    }

    // Adaylar başarısız olursa API'den dinamik desteklenen modelleri listele ve dene
    if (!responseText) {
        try {
            const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + activeApiKey);
            if (res.ok) {
                const data = await res.json();
                const availableModels = (data.models || [])
                    .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                    .map(m => m.name.replace('models/', ''))
                    .filter(name => !CANDIDATE_MODELS.includes(name) && (name.includes('flash') || name.includes('pro')));

                for (const dynModel of availableModels) {
                    try {
                        console.log(`[FitLAB AI] Dinamik model deneniyor: ${dynModel}`);
                        const model = genAI.getGenerativeModel({ model: dynModel });
                        const result = await model.generateContent([systemPrompt, userPrompt]);
                        responseText = result.response.text();
                        if (responseText) {
                            console.log(`[FitLAB AI] '${dynModel}' dinamik modeli ile başarıyla üretildi.`);
                            break;
                        }
                    } catch (e) {
                        // Bir sonraki modeli dene
                    }
                }
            }
        } catch (fetchErr) {
            console.warn('[FitLAB AI] Dinamik model sorgulama hatası:', fetchErr.message);
        }
    }

    if (!responseText) {
        throw lastError || new Error('Uygun bir Google Gemini AI modeli ile bağlantı kurulamadı. Lütfen API anahtarınızı kontrol edin.');
    }

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
