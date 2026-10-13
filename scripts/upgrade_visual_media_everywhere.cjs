const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '../js/app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. Evrensel Görsel Medya Çözümleyici Fonksiyonu
if (!code.includes('function getExerciseVisualMedia(')) {
    const helperFn = `
        // ==================== EVRENSEL GÖRSEL MEDYA ÇÖZÜMLEYİCİ ====================
        function getExerciseVisualMedia(exId, category) {
            const opengym = (typeof OPENGYM_GLOBAL_CATALOG !== 'undefined' && OPENGYM_GLOBAL_CATALOG) ? OPENGYM_GLOBAL_CATALOG[exId] : null;
            const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[exId]) 
                || (typeof categoryFallback !== 'undefined' && category && categoryFallback[category]) 
                || null;
            return {
                clip: opengym ? opengym.clip : null,
                still: opengym ? opengym.still : (guide ? guide.form : null),
                form: (guide && guide.form) ? guide.form : (opengym ? opengym.still : null),
                anatomi: (guide && guide.anatomi) ? guide.anatomi : null,
                hasVideo: !!opengym
            };
        }
    `;
    code = code.replace(
        "window.OPENGYM_GLOBAL_CATALOG = {",
        helperFn + "\n        window.OPENGYM_GLOBAL_CATALOG = {"
    );
    console.log('1. getExerciseVisualMedia fonksiyonu eklendi.');
}

// 2. Kütüphanedeki thumbImg (satır 6282 civarı)
code = code.replace(
    `const isExcluded = excludedIds.includes(ex.id);
                const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) 
                    || (typeof categoryFallback !== 'undefined' && categoryFallback[ex.category]) 
                    || (typeof guideLibrary !== 'undefined' ? guideLibrary.goblet_squat : null);
                const thumbImg = guide?.form || '';`,
    `const isExcluded = excludedIds.includes(ex.id);
                const media = getExerciseVisualMedia(ex.id, ex.category);
                const thumbImg = media.still || '';`
);
console.log('2. Kütüphane kataloğu thumbnail güncellendi.');

// 3. Egzersiz Seçici & Arama thumbImg
code = code.replace(
    `const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) || (typeof categoryFallback !== 'undefined' && categoryFallback[ex.category]) || null;
                    const thumbImg = (guide && guide.form) ? guide.form : '';`,
    `const media = getExerciseVisualMedia(ex.id, ex.category);
                    const thumbImg = media.still || '';`
);
console.log('3. Seçici arama thumbnail güncellendi.');

// 4. Kategori listesi thumbImg
code = code.replace(
    `const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) || (typeof categoryFallback !== 'undefined' && categoryFallback[ex.category]) || null;
                const thumbImg = (guide && guide.form) ? guide.form : '';`,
    `const media = getExerciseVisualMedia(ex.id, ex.category);
                const thumbImg = media.still || '';`
);
console.log('4. Kategori listesi thumbnail güncellendi.');

// 5. Alternatif/Seçici ana liste thumbImg
code = code.replace(
    `const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) 
                    || (typeof categoryFallback !== 'undefined' && categoryFallback[ex.category]) 
                    || null;
                const thumbImg = (guide && guide.form) ? guide.form : '';`,
    `const media = getExerciseVisualMedia(ex.id, ex.category);
                const thumbImg = media.still || '';`
);
console.log('5. Alternatif/Seçici ana liste thumbnail güncellendi.');

// 6. Program Atölyesi Seçilenler
code = code.replace(
    `const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) 
                    || (typeof categoryFallback !== 'undefined' && categoryFallback[ex.category]) 
                    || null;
                const thumbImg = guide ? guide.form || '' : '';`,
    `const media = getExerciseVisualMedia(ex.id, ex.category);
                const thumbImg = media.still || '';`
);
console.log('6. Program Atölyesi seçilenler thumbnail güncellendi.');

// 7. Program Atölyesi Havuz Listesi
code = code.replace(
    `const guide = (typeof exerciseGuideMap !== 'undefined' && exerciseGuideMap[ex.id]) 
                    || (typeof categoryFallback !== 'undefined' && categoryFallback[ex.category]) 
                    || null;
                const thumbImg = guide ? guide.form || '' : '';
                const isAlreadyInRoutine = customRoutineState.exercises.some(item => item.exId === ex.id);`,
    `const media = getExerciseVisualMedia(ex.id, ex.category);
                const thumbImg = media.still || '';
                const isAlreadyInRoutine = customRoutineState.exercises.some(item => item.exId === ex.id);`
);
console.log('7. Program Atölyesi havuz listesi thumbnail güncellendi.');

// 8. openExerciseDetailModal Form Tab Güncellemesi (OpenGym Animasyonunu Birincil Yapma)
const oldModalFormLogic = `            // Form Tab
            const formContainer = document.getElementById('exDetailTabContentForm');
            const photoSrc = (photoGuide && photoGuide.form) ? photoGuide.form : (ex.formImage || null);

            let visualsHtml = '';
            if (photoSrc) {
                visualsHtml = \`
                    <div style="background:#000; border-radius:12px; overflow:hidden; border:1.5px solid rgba(245,158,11,0.4); margin-bottom:12px; box-shadow:0 6px 24px rgba(0,0,0,0.6);">
                        <div style="background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.08); padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11.5px; font-weight:900; color:var(--gold); letter-spacing:0.5px;">📸 GERÇEK FORM REHBERİ</span>
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:3px 9px; border-radius:4px; color:var(--cyan); border-color:var(--cyan); font-weight:700;" onclick="openImageLightbox('\${photoSrc}', '\${escapeHTML(ex.name)} - Form Rehberi')">⛶ Tam Ekran Büyüt</button>
                        </div>
                        <div style="text-align:center; padding:6px; cursor:pointer;" onclick="openImageLightbox('\${photoSrc}', '\${escapeHTML(ex.name)} - Form Rehberi')" title="Büyütmek için dokunun">
                            <img src="\${photoSrc}" style="max-width:100%; max-height:46vh; object-fit:contain; display:block; margin:0 auto; border-radius:6px;" alt="\${escapeHTML(ex.name)} Form">
                            <div style="font-size:10.5px; color:var(--text-secondary); margin-top:6px; font-weight:600;">🔍 Dokunarak tam ekran inceleyebilirsiniz</div>
                        </div>
                    </div>
                \`;`;

const newModalFormLogic = `            // Form Tab (OpenGym Canlı Animasyon Öncelikli)
            const formContainer = document.getElementById('exDetailTabContentForm');
            const opengymEx = (typeof OPENGYM_GLOBAL_CATALOG !== 'undefined') ? OPENGYM_GLOBAL_CATALOG[ex.id] : null;
            const photoSrc = (photoGuide && photoGuide.form) ? photoGuide.form : (ex.formImage || null);

            let visualsHtml = '';
            if (opengymEx) {
                visualsHtml = \`
                    <div style="background:#000; border-radius:12px; overflow:hidden; border:1.5px solid rgba(56,189,248,0.4); margin-bottom:12px; box-shadow:0 6px 24px rgba(0,0,0,0.6);">
                        <div style="background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.08); padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11.5px; font-weight:900; color:var(--cyan); letter-spacing:0.5px;">⚡ OPENGYM CANLI HAREKET ANİMASYONU</span>
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:3px 9px; border-radius:4px; color:var(--cyan); border-color:var(--cyan); font-weight:700;" onclick="openImageLightbox('\${opengymEx.clip}', '\${escapeHTML(ex.name)} - Canlı Animasyon')">⛶ Tam Ekran Oynat</button>
                        </div>
                        <div style="text-align:center; padding:6px; cursor:pointer;" onclick="openImageLightbox('\${opengymEx.clip}', '\${escapeHTML(ex.name)} - Canlı Animasyon')" title="Tam ekran oynatmak için dokunun">
                            <video src="\${opengymEx.clip}" poster="\${opengymEx.still}" autoplay loop muted playsinline style="max-width:100%; max-height:46vh; object-fit:contain; display:block; margin:0 auto; border-radius:6px;"></video>
                            <div style="font-size:10.5px; color:var(--text-secondary); margin-top:6px; font-weight:600;">🔍 Dokunarak tam ekranda canlı döngüde izleyebilirsiniz</div>
                        </div>
                    </div>
                    \${photoSrc ? \`
                        <div style="margin-bottom:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); overflow:hidden;">
                            <div style="padding:6px 10px; background:rgba(255,255,255,0.03); display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="const el=document.getElementById('ex_detail_legacy_photo'); if(el) el.style.display=el.style.display==='none'?'block':'none';">
                                <span style="font-size:11px; font-weight:700; color:var(--text-secondary);">📸 Statik Fotoğraf & Form Kılavuzu</span>
                                <span style="font-size:10px; color:var(--gold);">Gör ▼</span>
                            </div>
                            <div id="ex_detail_legacy_photo" style="display:none; padding:8px; text-align:center;">
                                <img src="\${photoSrc}" style="max-width:100%; max-height:38vh; object-fit:contain; border-radius:6px;" alt="\${escapeHTML(ex.name)}">
                            </div>
                        </div>
                    \` : ''}
                \`;
            } else if (photoSrc) {
                visualsHtml = \`
                    <div style="background:#000; border-radius:12px; overflow:hidden; border:1.5px solid rgba(245,158,11,0.4); margin-bottom:12px; box-shadow:0 6px 24px rgba(0,0,0,0.6);">
                        <div style="background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.08); padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11.5px; font-weight:900; color:var(--gold); letter-spacing:0.5px;">📸 GERÇEK FORM REHBERİ</span>
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:3px 9px; border-radius:4px; color:var(--cyan); border-color:var(--cyan); font-weight:700;" onclick="openImageLightbox('\${photoSrc}', '\${escapeHTML(ex.name)} - Form Rehberi')">⛶ Tam Ekran Büyüt</button>
                        </div>
                        <div style="text-align:center; padding:6px; cursor:pointer;" onclick="openImageLightbox('\${photoSrc}', '\${escapeHTML(ex.name)} - Form Rehberi')" title="Büyütmek için dokunun">
                            <img src="\${photoSrc}" style="max-width:100%; max-height:46vh; object-fit:contain; display:block; margin:0 auto; border-radius:6px;" alt="\${escapeHTML(ex.name)} Form">
                            <div style="font-size:10.5px; color:var(--text-secondary); margin-top:6px; font-weight:600;">🔍 Dokunarak tam ekran inceleyebilirsiniz</div>
                        </div>
                    </div>
                \`;`;

code = code.replace(oldModalFormLogic, newModalFormLogic);
console.log('8. openExerciseDetailModal Form Tab OpenGym canlı video ile güncellendi.');

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('app.js TÜM GÖRSELLER İÇİN BAŞARIYLA GÜNCELLENDİ!');
