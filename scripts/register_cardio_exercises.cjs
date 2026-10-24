const fs = require('fs');

const newExercises = [
  {
    category: 'conditioning',
    cue: 'Dizleri kilitlemeden yumuşak yaylanarak açıl, kollarla baş üstünde alkış yap ve ritmik dön.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_jumping_jack',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'Tüm Vücut & Aerobik Kalp Kapasitesi',
    name: 'Jumping Jack',
    positions: [
      { badge: 'setup', desc: 'Ayaklar birleşik, kollar yanda, omurga dik ve bakışlar ileriye kilitli.', phase: '1. Başlangıç Duruşu' },
      { badge: 'action', desc: 'Parmak ucundan sıçrayarak bacakları omuz genişliğinde aç, kolları baş üstünde birleştir.', phase: '2. Açılış & Baş Üstü Alkış' },
      { badge: 'finish', desc: 'Yumuşak bir yaylanmayla ayakları tekrar merkeze çek, kolları indirerek ritmi koru.', phase: '3. Yaylı Kapanış & Ritim' }
    ],
    primaryMuscles: ['calves', 'shoulders'],
    secondaryMuscles: ['core', 'quads'],
    tags: ['full_body', 'conditioning', 'bodyweight', 'aerobic'],
    weightKey: ''
  },
  {
    category: 'conditioning',
    cue: 'Gövdeyi geriye yatırma, dizlerini 90 derece kalça hizasına patlayıcı çek ve zıt kolla ritmi hızlandır.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_high_knees',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'Kalça Fleksörü, Alt Karın & Maksimum Nabız',
    name: 'High Knees (Dize Çekerek Koşu)',
    positions: [
      { badge: 'setup', desc: 'Ayakta dik duruş, ağırlık parmak ucunda, dirsekler 90° koşu modunda.', phase: '1. Atletik Kurulum' },
      { badge: 'action', desc: 'Sağ dizi 90° kalça hizasına patlayıcı çek, sol kolu öne fırlat.', phase: '2. Sağ Dize Patlayıcı Çekiş' },
      { badge: 'finish', desc: 'Hızla bacak değiştirip sol dizi kalçaya çek, gövdeyi dik tutarak seri devam et.', phase: '3. Sol Dize Geçiş & Süreklilik' }
    ],
    primaryMuscles: ['quads', 'core'],
    secondaryMuscles: ['calves', 'glutes'],
    tags: ['full_body', 'conditioning', 'bodyweight', 'cardio'],
    weightKey: ''
  },
  {
    category: 'conditioning',
    cue: 'Topukları yere vurma, sadece ayak parmak ucunda minik yaylanmalar yap, bilekleri ritmik çevir.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_jump_rope',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'Kalf Reaktivitesi, Bilek Esnekliği & Ritim',
    name: 'İp Atlama (Gölge İp / Jump Rope)',
    positions: [
      { badge: 'setup', desc: 'Ayaklar yan yana, dirsekler kaburgalara yakın, eller bel hizasında hazır.', phase: '1. Hazırlık & Duruş' },
      { badge: 'action', desc: 'Parmak ucunda 2-3 cm elastik sıçrama yaparken bileklerle dairesel ip çevir.', phase: '2. Elastik Sıçrama & İp Çevirme' },
      { badge: 'finish', desc: 'Dizleri hafif kırık tutarak yumuşak in, zeminle temas süresini minimumda tut.', phase: '3. Reaktif İniş & Devamlılık' }
    ],
    primaryMuscles: ['calves'],
    secondaryMuscles: ['shoulders', 'forearms', 'core'],
    tags: ['conditioning', 'bodyweight', 'aerobic', 'calves'],
    weightKey: ''
  },
  {
    category: 'conditioning',
    cue: 'Dizleri öne değil yere doğru tutarak topukları seri şekilde kalçaya vur, gövdeyi dik tut.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_butt_kicks',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'Hamstring Dinamik Esnemesi & Aerobik Akış',
    name: 'Topuk Kalçaya Koşu (Butt Kicks)',
    positions: [
      { badge: 'setup', desc: 'Ayakta dik duruş, ağırlık parmak uçlarında, omuzlar rahat ve serbest.', phase: '1. Dik Başlangıç' },
      { badge: 'action', desc: 'Sağ topuğu kalçaya seri şekilde vur, dizi aşağı ve geride tut.', phase: '2. Sağ Topuk Kalçaya' },
      { badge: 'finish', desc: 'Hızla sol bacağa geçip sol topuğu kalçaya vur, hamstringleri dinamik esnet.', phase: '3. Sol Topuk Vuruşu & Ritim' }
    ],
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['quads', 'calves'],
    tags: ['legs', 'conditioning', 'bodyweight', 'warmup'],
    weightKey: ''
  },
  {
    category: 'conditioning',
    cue: 'Yana doğru genişçe sıçra, iniş yapan tek bacağınla şoku absorbe et, arka ayağı çapraz arkaya süzdür.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_skater_jumps',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'Yanal Kalça Patlayıcılığı & Dinamik Denge',
    name: 'Skater Jumps (Paten Sıçraması)',
    positions: [
      { badge: 'setup', desc: 'Sağ bacakta hafif çömelmiş atletik pozisyon al, sol ayağı hafif arkada tut.', phase: '1. Yanal Yüklenme' },
      { badge: 'action', desc: 'Sağ bacakla sola doğru patlayıcı sıçra, havada dinamik dengeni koru.', phase: '2. Havada Yanal Sıçrama' },
      { badge: 'finish', desc: 'Sol bacağa diz bükük yumuşakça kon, sağ ayağı çapraz arkaya al ve yön değiştir.', phase: '3. Tek Bacak Sönümleme & Geri İtiş' }
    ],
    primaryMuscles: ['glutes', 'quads'],
    secondaryMuscles: ['calves', 'core'],
    tags: ['legs', 'conditioning', 'power', 'bodyweight'],
    weightKey: ''
  },
  {
    category: 'core',
    cue: 'Eller omuz altında sert, kalçanın yukarı fırlamasına veya aşağı çökmesine izin vermeden ayakları aç-kapa.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_plank_jacks',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'Derin Kor Stabilizasyonu & Metabolik Dayanıklılık',
    name: 'Plank Jacks (Plank Bacak Aç-Kapa)',
    positions: [
      { badge: 'setup', desc: 'Yüksek plank pozisyonu; bilekler omuz altında, sırt düz, ayaklar birleşik.', phase: '1. Plank Kilit Duruşu' },
      { badge: 'action', desc: 'Karın kilitliyken iki ayağı birden yana sıçratarak omuzdan geniş aç.', phase: '2. Bacakları Yana Sıçratma' },
      { badge: 'finish', desc: 'Kalçayı hiç düşürmeden ayakları ortaya topla, bel çukurunu sabit tut.', phase: '3. Merkeze Dönüş & Kor Kontrolü' }
    ],
    primaryMuscles: ['core'],
    secondaryMuscles: ['shoulders', 'glutes', 'calves'],
    tags: ['core', 'conditioning', 'bodyweight'],
    weightKey: ''
  },
  {
    category: 'conditioning',
    cue: 'Hızla çömelip elleri yere koy, ayakları planka fırlat; şınav ve zıplama olmadan hemen squata geri toplan.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_squat_thrust',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'Eklem Dostu Yüksek Nabız & Kalça-Bacak İtişi',
    name: 'Squat Thrust (Yarım Burpee)',
    positions: [
      { badge: 'setup', desc: 'Ayaklar omuz genişliğinde dik duruş, hızla derin squata çök ve elleri bas.', phase: '1. Hızlı Çöküş & El Basışı' },
      { badge: 'action', desc: 'İki ayağı geriye fırlatıp sağlam yüksek plank pozisyonu al (şınav çekme).', phase: '2. Planka Fırlama' },
      { badge: 'finish', desc: 'Ayakları ellerin yanına geri fırlatıp hemen ayağa dikil ve tekrar başla.', phase: '3. Squata Dönüş & Doğrulma' }
    ],
    primaryMuscles: ['quads', 'core'],
    secondaryMuscles: ['chest', 'shoulders', 'glutes'],
    tags: ['full_body', 'conditioning', 'bodyweight'],
    weightKey: ''
  },
  {
    category: 'conditioning',
    cue: 'Dizleri büküp alçak atletik pozisyon al, ayakları birbirine çaprazlamadan yana seri adımlarla kay.',
    diagram: 'assets/diagrams/seq_escalera.svg',
    equipment: 'bodyweight',
    id: 'bw_lateral_shuffle',
    isComplex: false,
    mechanic: 'compound',
    muscle: 'İç/Dış Bacak Çevikliği & Yanal Kondisyon',
    name: 'Lateral Shuffle (Yanal Hızlı Adımlama)',
    positions: [
      { badge: 'setup', desc: 'Çeyrek squat derinliğinde alçak atletik duruş, göğüs açık, eller hazır.', phase: '1. Alçak Savunma Duruşu' },
      { badge: 'action', desc: 'Sağa doğru adımlarken ayakları çaprazlamadan seri yanal kayma adımları at.', phase: '2. Yanal Hızlı Kayma' },
      { badge: 'finish', desc: 'Dıştaki ayakla zemine fren basıp hemen sola doğru aynı hızla kaymaya geç.', phase: '3. Fren & Yön Değiştirme' }
    ],
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['calves', 'core'],
    tags: ['legs', 'conditioning', 'bodyweight', 'agility'],
    weightKey: ''
  }
];

let content = fs.readFileSync('js/exercises-db.js', 'utf8');

// 1. guideLibrary entries
let guideEntries = '';
let mapEntries = '';
newExercises.forEach(ex => {
  guideEntries += `            ${ex.id}: { form: 'assets/exercises/${ex.id}.webp', anatomi: null },\n`;
  mapEntries += `            '${ex.id}': guideLibrary.${ex.id},\n`;
});

// Insert into guideLibrary
const guideLibIdx = content.indexOf('const guideLibrary = {') + 'const guideLibrary = {\n'.length;
content = content.slice(0, guideLibIdx) + guideEntries + content.slice(guideLibIdx);

// Insert into exerciseGuideMap
const mapIdx = content.indexOf('const exerciseGuideMap = {') + 'const exerciseGuideMap = {\n'.length;
content = content.slice(0, mapIdx) + mapEntries + content.slice(mapIdx);

// Insert into EXERCISES_DB (append to JSON array)
const dbStart = content.indexOf('const EXERCISES_DB = [');
const dbEnd = content.indexOf('];\n', dbStart);
if (dbStart === -1 || dbEnd === -1) {
  throw new Error('EXERCISES_DB array bounds not found!');
}

const dbJsonStr = content.slice(dbStart + 'const EXERCISES_DB = '.length, dbEnd + 1);
const parsedDb = JSON.parse(dbJsonStr);
console.log('Original EXERCISES_DB length:', parsedDb.length);

newExercises.forEach(ex => {
  if (!parsedDb.some(e => e.id === ex.id)) {
    parsedDb.push(ex);
  }
});

console.log('New EXERCISES_DB length:', parsedDb.length);

const newDbJsonStr = JSON.stringify(parsedDb);
content = content.slice(0, dbStart + 'const EXERCISES_DB = '.length) + newDbJsonStr + content.slice(dbEnd + 1);

fs.writeFileSync('js/exercises-db.js', content, 'utf8');
console.log('Successfully updated js/exercises-db.js with 8 new exercises!');
