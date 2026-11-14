// ==================== ODA 5: ANALİZ, SKOR & TELEMETRİ ŞEFİ (analytics-guard) ====================
        // ==================== ADVANCED ANALYTICS, SCALE & MEASUREMENTS ENGINE ====================
        let currentAnalyticsSubView = 'muscle';
        let currentAnalyticsPeriodDays = 30;
        let currentScoreWeekOffset = 0; // 0 = Bu Hafta, -1 = Geçen Hafta

        function switchAnalyticsSubView(view) {
            if (view === 'measurements') view = 'scale';
            currentAnalyticsSubView = view;
            const subBtns = [
                { id: 'btnSubAnalyticsMuscle', view: 'muscle' },
                { id: 'btnSubAnalyticsScore', view: 'score' },
                { id: 'btnSubAnalyticsMobility', view: 'mobility' },
                { id: 'btnSubAnalyticsScale', view: 'scale' },
                { id: 'btnSubAnalyticsCombined', view: 'combined' }
            ];
            subBtns.forEach(b => {
                const el = document.getElementById(b.id);
                if (el) {
                    if (b.view === view) el.classList.add('active');
                    else el.classList.remove('active');
                }
            });
            renderAnalytics();
        }

        function openFitnessCardioScoreAnalytics() {
            currentAnalyticsSubView = 'score';
            switchTab('analyticsTab');
        }
        window.openFitnessCardioScoreAnalytics = openFitnessCardioScoreAnalytics;

        function setAnalyticsPeriod(days) {
            currentAnalyticsPeriodDays = parseInt(days) || 30;
            renderAnalytics();
        }

        // ----- SCALE (TARTI) STORAGE & CRUD -----
        function getScaleLogs() {
            const uid = getActiveUserId();
            try {
                const raw = localStorage.getItem(`celik_kodu_scale_${uid}`);
                const parsed = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(parsed)) return [];
                return [...parsed].sort((a, b) => {
                    const ta = new Date(a?.date || a?.timestamp || 0).getTime() || 0;
                    const tb = new Date(b?.date || b?.timestamp || 0).getTime() || 0;
                    return tb !== ta ? (tb - ta) : ((Number(b?.timestamp) || 0) - (Number(a?.timestamp) || 0));
                });
            } catch(e) {
                return [];
            }
        }

        function setScaleLogs(logs) {
            const uid = getActiveUserId() || (window.CelikLiaisonSubChiefs && window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid ? window.CelikLiaisonSubChiefs.resolveCanonicalActiveUid() : 'default');
            const liaisonInput = Array.isArray(logs) && window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.inspectScaleInputForReceivers === 'function'
                ? logs.map(item => window.CelikLiaisonSubChiefs.inspectScaleInputForReceivers(item)).filter(Boolean)
                : logs;
            const cleanLogs = (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.sanitizeScaleLogsList === 'function')
                ? window.CelikBridgeCustoms.sanitizeScaleLogsList(liaisonInput)
                : (Array.isArray(liaisonInput) ? liaisonInput : []);
            localStorage.setItem(`celik_kodu_scale_${uid}`, JSON.stringify(cleanLogs));
            syncScaleLogsToCloud(cleanLogs, uid);
        }

        // ----- UNIQUE HEALTH SMART PDF EXTRACTION ENGINE -----
        window._lastParsedScaleData = null;

        function openScaleModal() {
            const todayStr = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('scaleDate');
            if (dateInput) dateInput.value = todayStr;

            const banner = document.getElementById('scalePdfSuccessBanner');
            if (banner) {
                banner.style.display = 'none';
                banner.innerHTML = '';
            }
            window._lastParsedScaleData = null;

            const logs = getScaleLogs();
            if (logs.length > 0) {
                const last = logs[0];
                if (document.getElementById('scaleWeight')) document.getElementById('scaleWeight').value = last.weight || '';
                if (document.getElementById('scaleBodyFat')) document.getElementById('scaleBodyFat').value = last.bodyFat || '';
                if (document.getElementById('scaleMuscleMass')) document.getElementById('scaleMuscleMass').value = last.muscleMass || '';
                if (document.getElementById('scaleWaterPct')) document.getElementById('scaleWaterPct').value = last.waterPct || '';
                if (document.getElementById('scaleVisceralFat')) document.getElementById('scaleVisceralFat').value = last.visceralFat || '';
                if (document.getElementById('scaleBmr')) document.getElementById('scaleBmr').value = last.bmr || '';
            }

            const measLogs = getMeasurementsLogs();
            if (measLogs.length > 0) {
                const lastM = measLogs[0];
                if (document.getElementById('scaleWaist')) document.getElementById('scaleWaist').value = lastM.waist || '';
                if (document.getElementById('scaleChest')) document.getElementById('scaleChest').value = lastM.chest || '';
                if (document.getElementById('scaleShoulder')) document.getElementById('scaleShoulder').value = lastM.shoulder || '';
                if (document.getElementById('scaleArms')) document.getElementById('scaleArms').value = lastM.arms || '';
                if (document.getElementById('scaleThigh')) document.getElementById('scaleThigh').value = lastM.thigh || '';
                if (document.getElementById('scaleHips')) document.getElementById('scaleHips').value = lastM.hips || '';
                if (document.getElementById('scaleNeck')) document.getElementById('scaleNeck').value = lastM.neck || '';
            }

            document.getElementById('scaleModal').classList.add('active');
        }

        function closeScaleModal() {
            document.getElementById('scaleModal').classList.remove('active');
            window._lastParsedScaleData = null;
        }

        const MAX_SCALE_UPLOAD_BYTES = 15 * 1024 * 1024;
        window._scaleTesseractWorker = null;

        /** Update scale modal status banner with WCAG-compliant contrast. */
        function setScaleBannerState(state, html) {
            const banner = document.getElementById('scalePdfSuccessBanner');
            if (!banner) return;
            const palette = {
                loading: { bg: '#F0F9FF', brd: '#0284C7', color: '#0369A1' },
                success: { bg: '#F0FDF4', brd: '#16A34A', color: '#15803D' },
                error:   { bg: '#FEF2F2', brd: '#DC2626', color: '#B91C1C' }
            };
            const theme = palette[state] || palette.loading;
            banner.style.display = 'block';
            banner.style.background = theme.bg;
            banner.style.borderColor = theme.brd;
            banner.style.color = theme.color;
            banner.innerHTML = html;
        }

        /** Convert any thrown value (Error, string, undefined, Event) into a safe readable message. */
        function formatScaleUploadError(err) {
            if (!err) return 'Rapor dosyası okunamadı. Lütfen farklı bir görsel veya PDF deneyin.';
            if (typeof err === 'string') return err;
            if (typeof err.message === 'string' && err.message.trim()) return err.message;
            try { return String(err); } catch (_) { return 'Bilinmeyen okuma hatası.'; }
        }

        /** Check whether parsed data contains weight or at least one body measurement. */
        function hasParsedScaleOrMeasData(parsed) {
            if (!parsed || typeof parsed !== 'object') return false;
            if (parsed.weight && Number.isFinite(parsed.weight)) return true;
            const m = parsed.measurements;
            if (m && typeof m === 'object') {
                return ['waist', 'chest', 'shoulder', 'arms', 'thigh', 'hips', 'neck'].some(k => m[k] != null && Number.isFinite(m[k]));
            }
            return false;
        }

        function handleScalePdfDrop(e) {
            e.preventDefault();
            const dropzone = document.getElementById('scalePdfDropzone');
            if (dropzone) dropzone.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processScaleUploadFile(e.dataTransfer.files[0]);
            }
        }

        function handleScalePdfUpload(e) {
            if (e.target && e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                processScaleUploadFile(file);
                try { e.target.value = ''; } catch(err) {}
            }
        }

        async function processScaleUploadFile(file) {
            if (!file) return;
            if (typeof file.size === 'number' && file.size > MAX_SCALE_UPLOAD_BYTES) {
                setScaleBannerState('error', '❌ Dosya boyutu 15 MB sınırını aşıyor. Lütfen daha küçük bir dosya seçin.');
                return;
            }
            const isImage = (file.type && file.type.startsWith('image/')) || /\.(png|jpe?g|webp)$/i.test(file.name || '');
            const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');

            if (isImage) {
                await processScaleImageFile(file);
            } else if (isPdf) {
                await processScalePdfFile(file);
            } else {
                await processScaleImageFile(file);
            }
        }

        /** Reconstruct PDF text lines using Y/X coordinates to preserve table row structure. */
        function reconstructPdfTextLines(items) {
            if (!Array.isArray(items) || items.length === 0) return '';
            const rows = [];
            for (const item of items) {
                const str = (item && typeof item.str === 'string') ? item.str.trim() : '';
                if (!str) continue;
                const x = Array.isArray(item.transform) ? Number(item.transform[4]) || 0 : 0;
                const y = Array.isArray(item.transform) ? Number(item.transform[5]) || 0 : 0;
                let row = rows.find(r => Math.abs(r.y - y) <= 4);
                if (!row) {
                    row = { y, parts: [] };
                    rows.push(row);
                }
                row.parts.push({ x, str });
            }
            rows.sort((a, b) => b.y - a.y);
            return rows.map(r => r.parts.sort((a, b) => a.x - b.x).map(p => p.str).join(' ')).join('\n');
        }

        async function processScalePdfFile(file) {
            if (!file) return;
            setScaleBannerState('loading', '⏳ PDF dosyası taranıyor...');

            try {
                if (!window.pdfjsLib) {
                    throw new Error("PDF okuyucu henüz hazır değil. İnternet bağlantınızı kontrol edip sayfayı yenileyin.");
                }
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                let extractedText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = reconstructPdfTextLines(textContent.items);
                    if (pageText) extractedText += (extractedText ? '\n' : '') + pageText;
                }

                let parsed = null;
                if (extractedText && extractedText.trim().length > 30) {
                    parsed = extractUniqueHealthData(extractedText);
                }

                const compCount = parsed ? ['bodyFat', 'skeletalMuscle', 'totalWater', 'bmr', 'visceralFat'].filter(k => parsed[k] != null).length : 0;
                if (parsed && parsed.weight && compCount >= 2) {
                    applyParsedScaleData(parsed, 'PDF Raporu');
                    return;
                }

                setScaleBannerState('loading', '📄 PDF görseli ayrıştırılıyor, akıllı tarama başlatılıyor...');
                const page = await pdf.getPage(1);
                const baseViewport = page.getViewport({ scale: 1.0 });
                const targetScale = Math.min(3.0, Math.max(1.8, 2400 / (baseViewport.width || 800)));
                const viewport = page.getViewport({ scale: targetScale });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d');
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;

                await runOcrOnCanvas(canvas, 'PDF Görsel Raporu');
            } catch(err) {
                console.error("PDF Parsing error:", err);
                setScaleBannerState('error', `❌ Ayrıştırma Hatası: ${escapeHTML(formatScaleUploadError(err))}`);
            }
        }

        async function processScaleImageFile(file) {
            if (!file) return;
            setScaleBannerState('loading', '⏳ Rapor görseli yükleniyor...');

            try {
                const img = new Image();
                const objectUrl = URL.createObjectURL(file);
                try {
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error("Görsel yüklenemedi. Lütfen geçerli bir PNG veya JPG seçin."));
                        img.src = objectUrl;
                    });
                } finally {
                    URL.revokeObjectURL(objectUrl);
                }

                const canvas = document.createElement('canvas');
                const maxDim = 2400;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    const ratio = Math.min(maxDim / w, maxDim / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, w, h);

                await runOcrOnCanvas(canvas, 'Görsel Rapor');
            } catch(err) {
                console.error("Görsel OCR hatası:", err);
                setScaleBannerState('error', `❌ Görsel Okunamadı: ${escapeHTML(formatScaleUploadError(err))}`);
            }
        }

        /** Normalize numeric range and cross-check biophysical fields on AI or OCR output. */
        function normalizeAndValidateScaleData(raw) {
            if (!raw || typeof raw !== 'object') return null;
            const inRange = (val, min, max, decimals = 2) => {
                if (val == null || val === '') return null;
                const n = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
                if (!Number.isFinite(n) || n < min || n > max) return null;
                const factor = Math.pow(10, decimals);
                return Math.round(n * factor) / factor;
            };

            const out = { rawTextLength: raw.rawTextLength || 0 };
            if (typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date.trim())) {
                out.date = raw.date.trim();
                const p = out.date.split('-');
                out.dateFormatted = `${p[2]}/${p[1]}/${p[0]}`;
            }

            out.totalWater = inRange(raw.totalWater, 20, 90, 2);
            out.protein = inRange(raw.protein, 4, 35, 2);
            out.minerals = inRange(raw.minerals, 1, 12, 2);
            out.bone = inRange(raw.bone, 1, 10, 2);
            out.bodyFatKg = inRange(raw.bodyFatKg, 2, 95, 2);
            out.subcutaneousFatKg = inRange(raw.subcutaneousFatKg, 1, 75, 2);
            out.intraWater = inRange(raw.intraWater, 10, 65, 2);
            out.extraWater = inRange(raw.extraWater, 6, 40, 2);
            out.leanBodyMass = inRange(raw.leanBodyMass, 25, 160, 2);
            out.heightCm = inRange(raw.heightCm, 120, 230, 1);

            out.weight = inRange(raw.weight, 30, 250, 2);
            const hasSumParts = out.totalWater && out.protein && (out.minerals || out.bone) && out.bodyFatKg;
            if (hasSumParts) {
                const massSum = Math.round((out.totalWater + out.protein + (out.minerals || out.bone) + out.bodyFatKg) * 100) / 100;
                if (!out.weight || Math.abs(out.weight - massSum) > 1.8) {
                    out.weight = Math.round(massSum * 10) / 10;
                }
            }

            out.skeletalMuscle = inRange(raw.skeletalMuscle, 12, 80, 2);
            if (out.skeletalMuscle && out.totalWater && out.protein) {
                const ffmHydro = out.totalWater + out.protein;
                if (out.skeletalMuscle < ffmHydro * 0.42 || out.skeletalMuscle > ffmHydro * 0.75) {
                    out.skeletalMuscle = null;
                }
            }
            out.muscleMass = inRange(raw.muscleMass, 15, 120, 2);

            out.bodyFat = inRange(raw.bodyFat, 3, 60, 1);
            if (out.bodyFatKg && out.weight) {
                const calcFatPct = Math.round((out.bodyFatKg / out.weight) * 1000) / 10;
                if (!out.bodyFat || Math.abs(out.bodyFat - calcFatPct) > 1.5) {
                    out.bodyFat = calcFatPct;
                }
            }

            if (out.totalWater && out.weight) {
                out.totalWaterPct = Math.round((out.totalWater / out.weight) * 1000) / 10;
            } else {
                out.totalWaterPct = inRange(raw.totalWaterPct, 30, 80, 1);
            }

            if (!out.leanBodyMass && out.weight && out.bodyFatKg) {
                out.leanBodyMass = Math.round((out.weight - out.bodyFatKg) * 10) / 10;
            }

            out.visceralFat = inRange(raw.visceralFat, 1, 30, 0);
            out.bmr = inRange(raw.bmr, 800, 4500, 0);
            out.recommendedCalories = inRange(raw.recommendedCalories, 1000, 6000, 0);
            out.idealWeight = inRange(raw.idealWeight, 35, 150, 2);
            out.bodyScore = inRange(raw.bodyScore, 1, 100, 0);
            out.bodyAge = inRange(raw.bodyAge, 12, 99, 0);

            out.bmi = inRange(raw.bmi, 12, 55, 1);
            if (out.weight && out.heightCm) {
                const calcBmi = Math.round((out.weight / Math.pow(out.heightCm / 100, 2)) * 10) / 10;
                if (!out.bmi || Math.abs(out.bmi - calcBmi) > 2.0) {
                    out.bmi = calcBmi;
                }
            }

            if (raw.segmental && typeof raw.segmental === 'object') {
                const segOut = {};
                let hasSeg = false;
                for (const part of ['leftArm', 'rightArm', 'trunk', 'leftLeg', 'rightLeg']) {
                    const src = raw.segmental[part];
                    if (src && typeof src === 'object') {
                        const item = {
                            fatKg: inRange(src.fatKg, 0.1, 45, 2),
                            fatPct: inRange(src.fatPct, 10, 400, 1),
                            muscleKg: inRange(src.muscleKg, 0.5, 60, 2),
                            musclePct: inRange(src.musclePct, 30, 250, 1)
                        };
                        if (Object.values(item).some(v => v !== null)) {
                            segOut[part] = item;
                            hasSeg = true;
                        }
                    }
                }
                if (hasSeg) out.segmental = segOut;
            }

            if (raw.measurements && typeof raw.measurements === 'object') {
                const measRanges = {
                    waist: [45, 180], chest: [55, 180], shoulder: [70, 190],
                    arms: [18, 70], thigh: [30, 100], hips: [60, 180], neck: [25, 65]
                };
                const measOut = {};
                let hasMeas = false;
                for (const [k, [mn, mx]] of Object.entries(measRanges)) {
                    const v = inRange(raw.measurements[k], mn, mx, 1);
                    if (v !== null) {
                        measOut[k] = v;
                        hasMeas = true;
                    }
                }
                if (hasMeas) out.measurements = measOut;
            }

            return out;
        }

        /** Tier 1: Fast Gemini Vision structured JSON extraction with timeout and safe fallback. */
        async function tryGeminiVisionScaleExtraction(canvas) {
            if (!navigator.onLine) return null;
            let apiKey = typeof getGeminiApiKey === 'function' ? getGeminiApiKey() : '';
            if (!apiKey && typeof fastFetchCloudAiConfig === 'function') {
                apiKey = await fastFetchCloudAiConfig();
            }
            if (!apiKey) return null;

            const maxDim = 1600;
            let w = canvas.width, h = canvas.height;
            let sendCanvas = canvas;
            if (w > maxDim || h > maxDim) {
                const ratio = Math.min(maxDim / w, maxDim / h);
                sendCanvas = document.createElement('canvas');
                sendCanvas.width = Math.round(w * ratio);
                sendCanvas.height = Math.round(h * ratio);
                const sctx = sendCanvas.getContext('2d');
                sctx.imageSmoothingEnabled = true;
                sctx.imageSmoothingQuality = 'high';
                sctx.drawImage(canvas, 0, 0, sendCanvas.width, sendCanvas.height);
            }
            const dataUrl = sendCanvas.toDataURL('image/jpeg', 0.86);
            const base64Data = dataUrl.split(',')[1];
            if (!base64Data) return null;

            const prompt = `Bu vücut analizi, akıllı tartı veya mezura ölçüm raporundaki değerleri dikkatle oku ve SADECE geçerli JSON döndür. Raporda açıkça yazmayan alanlara null yaz (asla tahmin etme; parantez içindeki normal referans aralıklarını değil, çubuğun/kutunun gösterdiği gerçek ölçümü al). Tarih GG/AA/YYYY ise YYYY-MM-DD yap.
Şema: {"date":null,"weight":null,"skeletalMuscle":null,"muscleMass":null,"leanBodyMass":null,"bodyFat":null,"bodyFatKg":null,"subcutaneousFatKg":null,"totalWater":null,"totalWaterPct":null,"intraWater":null,"extraWater":null,"protein":null,"minerals":null,"bone":null,"visceralFat":null,"bmr":null,"recommendedCalories":null,"bmi":null,"bodyScore":null,"bodyAge":null,"idealWeight":null,"heightCm":null,"segmental":{"leftArm":{"fatKg":null,"fatPct":null,"muscleKg":null,"musclePct":null},"rightArm":{"fatKg":null,"fatPct":null,"muscleKg":null,"musclePct":null},"trunk":{"fatKg":null,"fatPct":null,"muscleKg":null,"musclePct":null},"leftLeg":{"fatKg":null,"fatPct":null,"muscleKg":null,"musclePct":null},"rightLeg":{"fatKg":null,"fatPct":null,"muscleKg":null,"musclePct":null}},"measurements":{"waist":null,"chest":null,"shoulder":null,"arms":null,"thigh":null,"hips":null,"neck":null}}`;

            const visionModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];
            for (const model of visionModels) {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 8000);
                try {
                    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
                        method: 'POST',
                        signal: controller.signal,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: 'image/jpeg', data: base64Data } }] }],
                            generationConfig: { temperature: 0.1, maxOutputTokens: 2048, responseMimeType: 'application/json' }
                        })
                    });
                    clearTimeout(timer);
                    if (!resp.ok) {
                        if (resp.status === 401 || resp.status === 403) break;
                        continue;
                    }
                    const json = await resp.json();
                    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!rawText) continue;
                    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
                    const parsedJson = JSON.parse(cleaned);
                    const normalized = normalizeAndValidateScaleData(parsedJson);
                    if (hasParsedScaleOrMeasData(normalized)) return normalized;
                } catch (_) {
                    clearTimeout(timer);
                }
            }
            return null;
        }

        /** Build multi-region signal-processed OCR panels (handles multi-column charts, colored bars, and dark pills). */
        function buildScaleOcrPanels(sourceCanvas) {
            const w0 = sourceCanvas.width, h0 = sourceCanvas.height;
            const ctx0 = sourceCanvas.getContext('2d');
            const p0 = ctx0.getImageData(0, 0, w0, h0).data;

            const lum0 = new Float32Array(w0 * h0);
            const minCh0 = new Float32Array(w0 * h0);
            let lumSum = 0;
            for (let i = 0, j = 0; i < p0.length; i += 4, j++) {
                const r = p0[i], g = p0[i + 1], b = p0[i + 2];
                const L = 0.299 * r + 0.587 * g + 0.114 * b;
                lum0[j] = L;
                minCh0[j] = Math.min(r, g, b);
                lumSum += L;
            }
            const meanLum = lumSum / Math.max(1, w0 * h0);

            const fadeSaturatedPixels = (c, xThresholdRatio = 0) => {
                const ctx = c.getContext('2d');
                const cw = c.width, ch = c.height;
                const id = ctx.getImageData(0, 0, cw, ch);
                const d = id.data;
                const minX = Math.floor(cw * xThresholdRatio);
                for (let y = 0; y < ch; y++) {
                    for (let x = minX; x < cw; x++) {
                        const i = (y * cw + x) * 4;
                        const r = d[i], g = d[i + 1], b = d[i + 2];
                        const sat = Math.max(r, g, b) - Math.min(r, g, b);
                        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                        const cwgt = Math.max(0, Math.min(1, (sat - 25) / 35));
                        const out = Math.round(lum * (1 - cwgt) + 255 * cwgt);
                        d[i] = d[i + 1] = d[i + 2] = out;
                    }
                }
                ctx.putImageData(id, 0, 0);
                return c;
            };

            const singleStepUp = (src, sx, sy, sw, sh, scale) => {
                const c = document.createElement('canvas');
                c.width = Math.max(1, Math.round(sw * scale));
                c.height = Math.max(1, Math.round(sh * scale));
                const ctx = c.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
                return c;
            };

            const twoStepUp = (src, sx, sy, sw, sh, scale) => {
                const cMid = singleStepUp(src, sx, sy, sw, sh, 2.0);
                return singleStepUp(cMid, 0, 0, cMid.width, cMid.height, scale / 2.0);
            };

            const makeBorderlessPillCanvas = () => {
                const isCardSeed = new Uint8Array(w0 * h0);
                for (let y = 0; y < h0 - 1; y++) {
                    for (let x = 0; x < w0 - 1; x++) {
                        const idx = y * w0 + x;
                        if (minCh0[idx] > 235 && minCh0[idx + 1] > 235 && minCh0[idx + w0] > 235 && minCh0[idx + w0 + 1] > 235) {
                            isCardSeed[idx] = 1;
                        }
                    }
                }
                const isExterior = new Uint8Array(w0 * h0);
                for (let y = 0; y < h0; y++) {
                    for (let x = 0; x < w0; x++) {
                        let found = 0;
                        for (let dy = -3; dy <= 3 && !found; dy++) {
                            const ny = y + dy;
                            if (ny < 0 || ny >= h0) continue;
                            for (let dx = -3; dx <= 3; dx++) {
                                const nx = x + dx;
                                if (nx < 0 || nx >= w0) continue;
                                if (isCardSeed[ny * w0 + nx]) { found = 1; break; }
                            }
                        }
                        isExterior[y * w0 + x] = found;
                    }
                }
                const isThickBlob = new Uint8Array(w0 * h0);
                for (let y = 2; y < h0 - 2; y++) {
                    for (let x = 2; x < w0 - 2; x++) {
                        let allBright = 1;
                        for (let dy = -2; dy <= 2 && allBright; dy++) {
                            for (let dx = -2; dx <= 2; dx++) {
                                if (minCh0[(y + dy) * w0 + (x + dx)] < 175) { allBright = 0; break; }
                            }
                        }
                        if (allBright) isThickBlob[y * w0 + x] = 1;
                    }
                }
                const pill0 = document.createElement('canvas');
                pill0.width = w0;
                pill0.height = h0;
                const pctx = pill0.getContext('2d');
                const pid = pctx.createImageData(w0, h0);
                const pd = pid.data;
                for (let y = 0; y < h0; y++) {
                    for (let x = 0; x < w0; x++) {
                        const j = y * w0 + x;
                        let out = 255;
                        if (!isExterior[j] && !isThickBlob[j]) {
                            let bgMin = 255;
                            for (let dy = -2; dy <= 2; dy++) {
                                const ny = y + dy;
                                if (ny < 0 || ny >= h0) continue;
                                for (let dx = -5; dx <= 5; dx += 2) {
                                    const nx = x + dx;
                                    if (nx < 0 || nx >= w0) continue;
                                    const nIdx = ny * w0 + nx;
                                    if (!isExterior[nIdx] && minCh0[nIdx] < bgMin) bgMin = minCh0[nIdx];
                                }
                            }
                            if (bgMin >= 35 && bgMin <= 170) {
                                const diff = minCh0[j] - bgMin;
                                if (diff > 10) {
                                    out = Math.max(0, Math.min(255, Math.round(255 - (diff - 8) * 3.2)));
                                }
                            }
                        }
                        const o4 = j * 4;
                        pd[o4] = pd[o4 + 1] = pd[o4 + 2] = out;
                        pd[o4 + 3] = 255;
                    }
                }
                pctx.putImageData(pid, 0, 0);
                return pill0;
            };

            if (meanLum < 95) {
                const scale = Math.max(1.5, Math.min(3.5, 1600 / Math.max(1, w0)));
                const c = singleStepUp(sourceCanvas, 0, 0, w0, h0, scale);
                const ctx = c.getContext('2d');
                const id = ctx.getImageData(0, 0, c.width, c.height);
                const d = id.data;
                for (let i = 0; i < d.length; i += 4) {
                    const inv = Math.round(255 - (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]));
                    d[i] = d[i + 1] = d[i + 2] = inv;
                }
                ctx.putImageData(id, 0, 0);
                return [{ name: 'PANEL_DARK_INVERT', canvas: c }];
            }

            let isTwoColumn = false;
            let splitX0 = Math.round(w0 * 0.405);
            const aspect = h0 / Math.max(1, w0);
            if (w0 >= 480 && aspect >= 1.0 && aspect <= 1.9) {
                const yStart = Math.round(h0 * 0.10), yEnd = Math.round(h0 * 0.88);
                let bestX = -1, bestEnergy = Infinity;
                for (let x = Math.round(w0 * 0.35); x <= Math.round(w0 * 0.52); x += 2) {
                    let energy = 0;
                    for (let y = yStart; y < yEnd; y += 2) {
                        energy += Math.abs(lum0[y * w0 + x + 1] - lum0[y * w0 + x - 1]);
                    }
                    const avgGrad = energy / Math.max(1, (yEnd - yStart) / 2);
                    if (avgGrad < bestEnergy) { bestEnergy = avgGrad; bestX = x; }
                }
                if (bestX > 0 && bestEnergy < 4.0) {
                    isTwoColumn = true;
                    splitX0 = (bestX >= Math.round(w0 * 0.38) && bestX <= Math.round(w0 * 0.43))
                        ? Math.max(bestX, Math.round(w0 * 0.405))
                        : bestX;
                }
            }

            if (isTwoColumn) {
                const rightW0 = w0 - splitX0;
                const segMidX0 = splitX0 + Math.round(rightW0 * 0.50);
                const pill0 = makeBorderlessPillCanvas();

                const leftScale = Math.max(1.5, Math.min(3.5, 1050 / Math.max(1, splitX0)));
                const rightBarScale = Math.max(1.5, Math.min(4.0, 1750 / Math.max(1, rightW0)));

                const pLeftTop = fadeSaturatedPixels(
                    singleStepUp(sourceCanvas, 0, 0, splitX0, Math.round(h0 * 0.45), leftScale),
                    0.48
                );
                const pRightBar = fadeSaturatedPixels(
                    singleStepUp(sourceCanvas, splitX0, Math.round(h0 * 0.05), rightW0, Math.round(h0 * 0.43), rightBarScale),
                    0
                );
                const pLeftPill = twoStepUp(pill0, 0, Math.round(h0 * 0.55), splitX0, Math.round(h0 * 0.40), 3.5);
                const pSegFat = twoStepUp(pill0, splitX0, Math.round(h0 * 0.48), Math.round(rightW0 * 0.50), Math.round(h0 * 0.45), 3.5);
                const pSegMuscle = twoStepUp(pill0, segMidX0, Math.round(h0 * 0.48), w0 - segMidX0, Math.round(h0 * 0.45), 3.5);

                return [
                    { name: 'PANEL_SOL_UST', canvas: pLeftTop },
                    { name: 'PANEL_SAG_BAR', canvas: pRightBar },
                    { name: 'PANEL_SOL_PILL', canvas: pLeftPill },
                    { name: 'PANEL_BOLGESEL_YAG', canvas: pSegFat },
                    { name: 'PANEL_BOLGESEL_KAS', canvas: pSegMuscle }
                ];
            }

            const fullScale = Math.max(1.5, Math.min(3.5, 1400 / Math.max(1, w0)));
            const panels = [
                { name: 'PANEL_TAM_NORMAL', canvas: fadeSaturatedPixels(singleStepUp(sourceCanvas, 0, 0, w0, h0, fullScale), 0) }
            ];
            let darkCount = 0;
            for (let j = 0; j < lum0.length; j += 4) {
                if (lum0[j] >= 40 && lum0[j] <= 165) darkCount++;
            }
            if (darkCount / Math.max(1, lum0.length / 4) > 0.03) {
                const pill0 = makeBorderlessPillCanvas();
                panels.push({ name: 'PANEL_TAM_PILL', canvas: twoStepUp(pill0, 0, 0, w0, h0, Math.min(3.5, fullScale)) });
            }
            return panels;
        }

        async function getCachedScaleOcrWorker(onStatus) {
            if (window._scaleTesseractWorker) return window._scaleTesseractWorker;
            if (onStatus) onStatus('📥 Akıllı metin tarayıcı hazırlanıyor...');
            const worker = await Tesseract.createWorker(['eng', 'tur']);
            await worker.setParameters({ tessedit_pageseg_mode: '6' });
            window._scaleTesseractWorker = worker;
            return worker;
        }

        async function runOcrOnCanvas(canvas, sourceLabel) {
            setScaleBannerState('loading', '🔍 Rapor yapay zeka ile taranıyor...');

            // Katman 1: Anahtar ve kota müsaitse Gemini Vision ile doğrudan JSON okuma
            try {
                const visionParsed = await tryGeminiVisionScaleExtraction(canvas);
                if (hasParsedScaleOrMeasData(visionParsed)) {
                    applyParsedScaleData(visionParsed, sourceLabel);
                    return;
                }
            } catch (_) {}

            // Katman 2: Çok bölgeli sinyal işlemeli yerel OCR
            if (typeof Tesseract === 'undefined') {
                throw new Error("Metin okuma modülü henüz yüklenemedi. İnternet bağlantınızı kontrol edip sayfayı yenileyin.");
            }

            setScaleBannerState('loading', '🔍 Görsel bölümleri ayrı ayrı okunuyor... %0');
            const panels = buildScaleOcrPanels(canvas);

            let combinedText = '';
            let worker;
            try {
                worker = await getCachedScaleOcrWorker((msg) => setScaleBannerState('loading', msg));
                for (let i = 0; i < panels.length; i++) {
                    const pct = Math.round((i / panels.length) * 100);
                    setScaleBannerState('loading', `🔍 Değerler çözümleniyor... %${pct}`);
                    const res = await worker.recognize(panels[i].canvas);
                    const pText = (res && res.data && res.data.text) ? res.data.text.trim() : '';
                    if (pText) {
                        combinedText += `\n=== ${panels[i].name} ===\n${pText}\n`;
                    }
                }
                setScaleBannerState('loading', '🔍 Değerler çözümleniyor... %100');
            } catch (ocrErr) {
                try { if (window._scaleTesseractWorker) await window._scaleTesseractWorker.terminate(); } catch (_) {}
                window._scaleTesseractWorker = null;
                throw ocrErr;
            }

            if (!combinedText || combinedText.trim().length < 20) {
                throw new Error("Görsel üzerinde okunabilir metin tespit edilemedi. Lütfen daha net bir rapor seçin.");
            }

            const parsed = extractUniqueHealthData(combinedText);
            if (!hasParsedScaleOrMeasData(parsed)) {
                throw new Error("Görsel üzerinde kilo veya ölçüm verisi tespit edilemedi. Lütfen geçerli bir analiz raporu seçin.");
            }

            applyParsedScaleData(parsed, sourceLabel);
        }

        function applyParsedScaleData(parsed, sourceLabel = 'Rapor') {
            if (!hasParsedScaleOrMeasData(parsed)) return;
            window._lastParsedScaleData = parsed;

            if (parsed.date && document.getElementById('scaleDate')) {
                document.getElementById('scaleDate').value = parsed.date;
            }

            if (parsed.weight) {
                // Yeni tartı raporu yüklendiğinde önceki ölçüm kalıntılarını temizle, sadece yeni rapordan gelenleri yaz
                const fieldMap = [
                    ['scaleWeight', parsed.weight],
                    ['scaleBodyFat', parsed.bodyFat],
                    ['scaleMuscleMass', parsed.skeletalMuscle || parsed.muscleMass],
                    ['scaleWaterPct', parsed.totalWaterPct != null ? parsed.totalWaterPct : (parsed.totalWater && parsed.weight ? Math.round((parsed.totalWater / parsed.weight) * 1000) / 10 : null)],
                    ['scaleVisceralFat', parsed.visceralFat],
                    ['scaleBmr', parsed.bmr]
                ];
                for (const [id, val] of fieldMap) {
                    const el = document.getElementById(id);
                    if (el) el.value = (val != null && !isNaN(val)) ? val : '';
                }
            }

            if (parsed.measurements && typeof parsed.measurements === 'object') {
                const measFieldMap = [
                    ['scaleWaist', parsed.measurements.waist],
                    ['scaleChest', parsed.measurements.chest],
                    ['scaleShoulder', parsed.measurements.shoulder],
                    ['scaleArms', parsed.measurements.arms],
                    ['scaleThigh', parsed.measurements.thigh],
                    ['scaleHips', parsed.measurements.hips],
                    ['scaleNeck', parsed.measurements.neck]
                ];
                for (const [id, val] of measFieldMap) {
                    const el = document.getElementById(id);
                    if (el && val != null && !isNaN(val)) el.value = val;
                }
            }

            if (document.getElementById('scaleNotes')) {
                if (parsed.weight) {
                    const score = parsed.bodyScore ? ` • Puan: ${parsed.bodyScore}` : '';
                    const age = parsed.bodyAge ? ` • Vücut Yaşı: ${parsed.bodyAge}` : '';
                    document.getElementById('scaleNotes').value = `BIA Analizi${score}${age}`;
                } else {
                    document.getElementById('scaleNotes').value = 'Mezura Ölçümü';
                }
            }

            const summaryParts = [];
            if (parsed.weight) summaryParts.push(`${parsed.weight} kg`);
            if (parsed.skeletalMuscle || parsed.muscleMass) summaryParts.push(`${parsed.skeletalMuscle || parsed.muscleMass} kg Kas`);
            if (parsed.bodyFat) summaryParts.push(`%${parsed.bodyFat} Yağ`);
            if (parsed.bmr) summaryParts.push(`BMR ${parsed.bmr} kcal`);
            if (parsed.measurements?.waist) summaryParts.push(`Bel ${parsed.measurements.waist} cm`);
            setScaleBannerState('success', `✅ <strong>${escapeHTML(sourceLabel)} Okundu!</strong><br>${escapeHTML(summaryParts.join(' • '))}`);
            if (typeof playAlertSound === 'function') playAlertSound();
        }

        // ----- MOBILE & BUTTON PASTE (CLIPBOARD API & INLINE BOX) -----
        function toggleScalePasteBox(forceShow) {
            const box = document.getElementById('scaleManualPasteContainer');
            if (!box) return;
            const isVisible = box.style.display !== 'none';
            const show = forceShow !== undefined ? forceShow : !isVisible;
            box.style.display = show ? 'block' : 'none';
            if (show) {
                const ta = document.getElementById('scalePasteArea');
                if (ta) ta.focus();
            }
        }

        async function pasteFromClipboard(e) {
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }

            if (navigator.clipboard) {
                if (navigator.clipboard.read) {
                    try {
                        const items = await navigator.clipboard.read();
                        for (const item of items) {
                            for (const type of item.types) {
                                if (type.startsWith('image/')) {
                                    setScaleBannerState('loading', '⏳ Panodaki görsel okunuyor...');
                                    const blob = await item.getType(type);
                                    const ext = type.split('/')[1] || 'png';
                                    const file = new File([blob], `pasted_report.${ext}`, { type });
                                    await processScaleImageFile(file);
                                    return;
                                }
                                if (type === 'application/pdf' || type.includes('pdf')) {
                                    setScaleBannerState('loading', '⏳ Panodaki PDF taranıyor...');
                                    const blob = await item.getType(type);
                                    const file = new File([blob], "pasted_report.pdf", { type: 'application/pdf' });
                                    await processScalePdfFile(file);
                                    return;
                                }
                            }
                        }
                    } catch(readErr) {
                        console.log("clipboard.read fallback:", readErr);
                    }
                }

                if (navigator.clipboard.readText) {
                    try {
                        const text = await navigator.clipboard.readText();
                        if (text && text.trim().length > 0) {
                            const parsed = extractUniqueHealthData(text);
                            if (hasParsedScaleOrMeasData(parsed)) {
                                applyParsedScaleData(parsed, 'Panodan Okunan Metin');
                                return;
                            }
                        }
                    } catch(textErr) {
                        console.log("clipboard.readText fallback:", textErr);
                    }
                }
            }

            toggleScalePasteBox(true);
        }

        function parseScaleFromPastedTextarea() {
            const ta = document.getElementById('scalePasteArea');
            if (!ta || !ta.value.trim()) {
                alert("Lütfen kopyaladığınız rapor metnini kutucuğa yapıştırınız.");
                return;
            }
            const parsed = extractUniqueHealthData(ta.value);
            if (!hasParsedScaleOrMeasData(parsed)) {
                alert("Metin içinde geçerli kilo veya mezura verisi tespit edilemedi.");
                return;
            }
            applyParsedScaleData(parsed, 'Yapıştırılan Metin');
            toggleScalePasteBox(false);
            ta.value = '';
        }

        // ----- GLOBAL CMD+V / CTRL+V PASTE LISTENER -----
        window.addEventListener('paste', async function(e) {
            const target = e.target;
            const isScaleInput = target && (target.id === 'scaleNotes' || target.id === 'scalePdfInput' || target.id === 'scaleWeight' || target.id === 'scalePdfDropzone');
            const isOtherTextInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !isScaleInput;

            let attachedFile = null;
            if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
                for (let i = 0; i < e.clipboardData.files.length; i++) {
                    const f = e.clipboardData.files[i];
                    if (f.type === 'application/pdf' || (f.name && f.name.toLowerCase().endsWith('.pdf')) ||
                        f.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(f.name || '')) {
                        attachedFile = f;
                        break;
                    }
                }
            }

            if (!attachedFile && e.clipboardData && e.clipboardData.items) {
                for (let i = 0; i < e.clipboardData.items.length; i++) {
                    const item = e.clipboardData.items[i];
                    if (item.kind === 'file') {
                        const f = item.getAsFile();
                        if (f && (f.type === 'application/pdf' || (f.name && f.name.toLowerCase().endsWith('.pdf')) ||
                            f.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(f.name || ''))) {
                            attachedFile = f;
                            break;
                        }
                    }
                }
            }

            if (attachedFile) {
                e.preventDefault();
                const modal = document.getElementById('scaleModal');
                if (modal && !modal.classList.contains('active')) {
                    openScaleModal();
                }
                processScaleUploadFile(attachedFile);
                return;
            }

            if (!isOtherTextInput && e.clipboardData) {
                const pastedText = e.clipboardData.getData('text') || '';
                const modalActive = document.getElementById('scaleModal')?.classList.contains('active');
                const looksLikeReport = pastedText && (
                    pastedText.includes('Unique Health') ||
                    pastedText.includes('Vücut Kompozisyon') ||
                    pastedText.includes('İskelet Kası') ||
                    (pastedText.includes('Yağ') && pastedText.includes('Kilo')) ||
                    pastedText.includes('BMR') ||
                    (modalActive && /(?:Bel|Göğüs|Kalça|Omuz|Boyun|Kol)\s*[:\-]?\s*\d/i.test(pastedText))
                );
                if (looksLikeReport) {
                    e.preventDefault();
                    const parsed = extractUniqueHealthData(pastedText);
                    if (hasParsedScaleOrMeasData(parsed)) {
                        const modal = document.getElementById('scaleModal');
                        if (modal && !modal.classList.contains('active')) {
                            openScaleModal();
                        }
                        applyParsedScaleData(parsed, 'Panodan Yapıştırılan Metin');
                    }
                }
            }
        });

        /** Parse any body composition / BIA / tape measurement report text using structural + biophysical checks. */
        function extractUniqueHealthData(text) {
            if (!text || typeof text !== 'string') return { rawTextLength: 0 };

            const parseScaleNum = (str) => {
                if (str == null) return null;
                const clean = String(str).replace(/\s+/g, '').replace(',', '.');
                const val = parseFloat(clean);
                return Number.isFinite(val) ? val : null;
            };

            const stripRefRanges = (str) => String(str || '')
                .replace(/\([^)]*\)/g, ' ')
                .replace(/\d+(?:[.,]\d+)?\s*[~–]\s*\d+(?:[.,]\d+)?/g, ' ')
                .replace(/\b\d{1,3}[.,]\d\s*[-]\s*\d{1,3}[.,]\d\b/g, ' ');

            const repairOcrDigits = (tok) => String(tok || '')
                .replace(/[Il|!]/g, '1')
                .replace(/[OoQD]/g, '0')
                .replace(/[Ss]/g, '5')
                .replace(/[Bb]/g, '8')
                .replace(/[Zz]/g, '2')
                .replace(/[Yy]/g, '9')
                .replace(/[Tt]/g, '7');

            const getSection = (sectionName) => {
                const re = new RegExp(`=== ${sectionName} ===([\\s\\S]*?)(?:=== PANEL_|$)`, 'i');
                const m = text.match(re);
                return m ? m[1] : '';
            };

            const raw = { rawTextLength: text.length };

            // 1. Tarih (DD/MM/YYYY, DD.MM.YYYY, DD:MM.YYYY, DDMM/YYYY, YYYY-MM-DD)
            const isoDate = text.match(/\b(20\d{2})[./-](\d{2})[./-](\d{2})\b/);
            const trDate = text.match(/(\d{2})\s*[:./-]?\s*(\d{2})\s*[:./-]\s*(20\d{2})/);
            if (trDate) {
                const dd = parseInt(trDate[1], 10), mm = parseInt(trDate[2], 10), yy = parseInt(trDate[3], 10);
                if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
                    raw.date = `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
                }
            } else if (isoDate) {
                const yy = parseInt(isoDate[1], 10), mm = parseInt(isoDate[2], 10), dd = parseInt(isoDate[3], 10);
                if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
                    raw.date = `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
                }
            }

            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

            // Çok satırlı grafik çubuğu değer çıkarıcı (eksen ölçeğini ve normal aralığı atlar)
            const extractBarRowValue = (labelRegex, minVal, maxVal, stopRegex) => {
                const idx = lines.findIndex(l => labelRegex.test(l));
                if (idx === -1) return null;

                const isAxisRuler = (line) => {
                    const nums = line.match(/\b\d+(?:[.,]\d+)?\b/g) || [];
                    return nums.length >= 4 && nums.every(n => !/[.,]/.test(n) || nums.length >= 6);
                };

                const firstLineClean = stripRefRanges(lines[idx]).replace(labelRegex, ' ');
                const sameLineNums = (firstLineClean.match(/\b\d{1,3}(?:[.,]\d{1,2})?\b/g) || [])
                    .map(parseScaleNum)
                    .filter(n => n != null && n >= minVal && n <= maxVal);
                if (sameLineNums.length > 0 && !isAxisRuler(firstLineClean)) {
                    return sameLineNums[sameLineNums.length - 1];
                }

                for (let k = idx + 1; k < Math.min(lines.length, idx + 5); k++) {
                    const ln = lines[k];
                    if (stopRegex && stopRegex.test(ln)) break;
                    if (isAxisRuler(ln)) continue;
                    const cleaned = stripRefRanges(ln).trim();
                    if (!cleaned) continue;
                    const cands = (cleaned.match(/\b\d{1,3}(?:[.,]\d{1,2})?\b/g) || [])
                        .map(parseScaleNum)
                        .filter(n => n != null && n >= minVal && n <= maxVal);
                    if (cands.length > 0) return cands[cands.length - 1];
                }
                return null;
            };

            const compArea = getSection('PANEL_SOL_UST') || text;
            const barArea = getSection('PANEL_SAG_BAR') || text;
            const pillArea = getSection('PANEL_SOL_PILL') || text;

            // 2. Bileşen Kütleleri (Toplam Su, Protein, Mineraller, Kemik, Yağ Kütlesi, Hücre İçi/Dışı Su)
            const matchNumAfter = (src, re, minV, maxV) => {
                const m = src.match(re);
                if (!m) return null;
                const v = parseScaleNum(m[1]);
                return (v != null && v >= minV && v <= maxV) ? v : null;
            };

            raw.totalWater = matchNumAfter(compArea, /Toplam\s*V[üui][cç][üu]t\s*Suyu[^\d\n]{0,18}(\d{2}(?:[.,]\s*\d{1,2})?)/i, 20, 90);
            raw.protein = matchNumAfter(compArea, /Prot[ec]in\s*Miktar[ıil][^\d\n]{0,18}(\d{1,2}(?:[.,]\s*\d{1,2})?)/i, 4, 35);
            raw.minerals = matchNumAfter(compArea, /Min[ec]rall?er[^\d\n]{0,18}(\d{1,2}(?:[.,]\s*\d{1,2})?)/i, 1, 12);
            raw.bone = matchNumAfter(text, /Kemik\s*K[üu]tlesi[^\d\n]{0,18}(\d{1,2}(?:[.,]\s*\d{1,2})?)/i, 1, 10);
            raw.extraWater = matchNumAfter(text, /H[üu]cre\s*D[ıi][şs][ıi]\s*Su[^\d\n]{0,18}(\d{1,2}(?:[.,]\s*\d{1,2})?)/i, 6, 40);
            raw.intraWater = matchNumAfter(text, /H[üu]cre\s*[İIi][çc][ıi]\s*Su[^\d\n]{0,18}(\d{1,2}(?:[.,]\s*\d{1,2})?)/i, 10, 65);

            // Yağ Kütlesi: Önce kompozisyon kartındaki satırı kontrol et (Deri Altı Yağ ve Bölgesel Yağ ile karıştırma)
            for (const ln of compArea.split(/\r?\n/)) {
                if (/Deri\s*Alt|Sol\s*Kol|Sa[ğg]\s*Kol|G[öo]vde|Bacak|Kas\s*ve\s*Ya[ğg]/i.test(ln)) continue;
                const m = ln.match(/Ya[ğg]\s*K[üu]tlesi[^\d\n]{0,15}(\d{1,2}(?:[.,]\s*\d{1,2})?)/i);
                if (m) {
                    const v = parseScaleNum(m[1]);
                    if (v != null && v >= 2 && v <= 95) { raw.bodyFatKg = v; break; }
                }
            }
            if (raw.bodyFatKg == null) {
                raw.bodyFatKg = extractBarRowValue(/Ya[ğg]\s*K[üu]tlesi/i, 2, 95, /Obezite|VK[İI]/i);
            }

            // 3. Boy, Sağlık/Vücut Puanı ve Vücut Yaşı
            raw.heightCm = matchNumAfter(compArea, /(?:Boy[^\d\n]{0,15}|Ya[şs][^\d\n]{0,12})(\d{3})\s*(?:cm|¢m)?/i, 120, 230)
                || matchNumAfter(text, /\b(1[3-9]\d|2[0-2]\d)\s*(?:cm|¢m)\b/i, 120, 230);
            raw.bodyScore = matchNumAfter(compArea, /(?:Sa[ğg]l[ıi]k|V[üu]cut)\s*Puan[ıi][^\d\n]{0,20}(\d{2,3})/i, 1, 100)
                || matchNumAfter(compArea, /(\d{2,3})\s*(?:Puan|ruan|iyi)\b/i, 1, 100);
            raw.bodyAge = matchNumAfter(pillArea + '\n' + text, /(?:V[üu]cut|Metabolik)\s*Ya[şs][ıi][^\d\n]{0,15}(\d{2})/i, 12, 99);

            // 4. Kilo / Ağırlık (Daire, Başlık, Grafik Çubuğu ve Kütle Korunumu Doğrulaması)
            let weightCand = null;
            const compClean = stripRefRanges(compArea);
            const donutMatch = compClean.match(/Kompozisyon[^\n]*?\b(\d{2,3}[.,]\s*\d{1,2})\b/i)
                || compClean.match(/\b(\d{2,3}[.,]\s*\d{1,2})\b[^\n]{0,40}\n[^\n]{0,25}Kilo/i);
            if (donutMatch) {
                const v = parseScaleNum(donutMatch[1]);
                if (v != null && v >= 30 && v <= 250) weightCand = v;
            }
            if (weightCand == null) {
                for (const ln of text.split(/\r?\n/)) {
                    if (/İdeal\s*Kilo|Kilo\s*Kontrol|Ya[ğg]\s*Kontrol|Kas\s*Kontrol/i.test(ln)) continue;
                    const cl = stripRefRanges(ln);
                    const wm = cl.match(/(?:A[ğg][ıi]rl[ıi]k|Agirlik|Weight)[^\d\n]{0,25}(\d{2,3}\s*[.,]\s*\d{1,2}|\d{2,3})\s*k?\s*g/i)
                        || cl.match(/\bKilo(?:\s*\(kg\))?\s*[:\-]?\s*(\d{2,3}\s*[.,]\s*\d{1,2})\s*(?:kg)?\b/i)
                        || cl.match(/Standart[^\n]*?\b(\d{2,3}\s*[.,]\s*\d{1,2})\s*k?\s*g/i);
                    if (wm) {
                        const v = parseScaleNum(wm[1]);
                        if (v != null && v >= 30 && v <= 250) { weightCand = v; break; }
                    }
                }
            }
            if (weightCand == null) {
                weightCand = extractBarRowValue(/^\s*Kilo\s*\(?kg\)?/i, 30, 250, /İskelet/i);
            }
            if (weightCand == null) {
                const twoDecKg = text.match(/\b([4-9]\d|1\d{2})\s*[.,]\s*(\d{2})\s*k\s*g/i);
                if (twoDecKg) {
                    const v = parseFloat(`${twoDecKg[1]}.${twoDecKg[2]}`);
                    if (v >= 30 && v <= 250) weightCand = v;
                }
            }

            if (raw.totalWater && raw.protein && (raw.minerals || raw.bone) && raw.bodyFatKg) {
                const massSum = raw.totalWater + raw.protein + (raw.minerals || raw.bone) + raw.bodyFatKg;
                if (weightCand == null || Math.abs(weightCand - massSum) > 1.5) {
                    const allCleanNums = (stripRefRanges(compArea + '\n' + text).match(/\b\d{2,3}[.,]\d{1,2}\b/g) || [])
                        .map(s => ({ rawStr: s, val: parseScaleNum(s) }))
                        .filter(x => x.val != null && Math.abs(x.val - massSum) <= 1.2);
                    const twoDec = allCleanNums.find(x => /\d{2,3}[.,]\d{2}$/.test(x.rawStr));
                    weightCand = twoDec ? twoDec.val : (allCleanNums[0] ? allCleanNums[0].val : Math.round(massSum * 10) / 10);
                }
            }
            raw.weight = weightCand;

            // 5. İskelet Kası & Genel Kas Kütlesi
            raw.skeletalMuscle = extractBarRowValue(/[İI]skelet\s*Kas/i, 12, 80, /Ya[ğg]\s*K[üu]tlesi|Obezite/i);
            if (raw.skeletalMuscle == null) {
                const skLine = text.match(/[İI]skelet\s*Kas[^\n]*/i);
                if (skLine) {
                    const nums = (stripRefRanges(skLine[0]).match(/\b\d{2}(?:[.,]\d{1,2})?\b/g) || [])
                        .map(parseScaleNum)
                        .filter(v => v != null && v >= 12 && v <= 80);
                    if (nums.length > 0) raw.skeletalMuscle = nums[nums.length - 1];
                }
            }
            raw.muscleMass = matchNumAfter(text, /(?:^|\n)\s*Kas\s*K[üu]tlesi[^\d\n]{0,18}(\d{2}(?:[.,]\d{1,2})?)/i, 15, 120);

            // 6. Vücut Yağ Oranı (%) & VKİ & Yağsız Kütle & Deri Altı Yağ
            raw.bodyFat = extractBarRowValue(/Ya[ğg]\s*Oran/i, 3, 60, /Obezite|B[öo]lgesel/i);
            if (raw.bodyFat == null) {
                raw.bodyFat = matchNumAfter(text, /Ya[ğg]\s*Oran[ıi][^\d\n]{0,20}(\d{1,2}(?:[.,]\d{1,2})?)\s*%?/i, 3, 60);
            }
            if (raw.bodyFatKg && raw.weight && raw.bodyFat == null) {
                const calcFatPct = Math.round((raw.bodyFatKg / raw.weight) * 1000) / 10;
                raw.bodyFat = calcFatPct;
            }
            raw.bmi = extractBarRowValue(/V\.?\s*K\.?\s*[İI]|BMI/i, 12, 55, /Ya[ğg]\s*Oran/i);
            raw.leanBodyMass = matchNumAfter(pillArea + '\n' + text, /Ya[ğg]s[ıia]z\s*K[üu]tle[^\d\n]{0,18}(\d{2}(?:[.,]\d{1,2})?)/i, 25, 160);
            raw.subcutaneousFatKg = matchNumAfter(pillArea + '\n' + text, /Deri\s*Alt[ıi]\s*Ya[ğg]\s*(?:Miktar[ıi])?[^\d\n]{0,18}(\d{1,2}(?:[.,]\d{1,2})?)/i, 1, 75);

            // 7. Viseral Yağ, BMR, Önerilen Kalori, İdeal Kilo
            const viscSrc = pillArea + '\n' + text;
            const viscMatch = viscSrc.match(/(?:V[iı]s[ec]ral|[İI]ç\s*Organ)\s*Y[au][ğg][^\n]{0,20}/i);
            if (viscMatch) {
                const digits = viscMatch[0].match(/\b(\d{1,2})\b/g);
                if (digits && digits.length > 0) raw.visceralFat = parseInt(digits[digits.length - 1], 10);
            }

            const bmrSrc = pillArea + '\n' + text;
            for (const ln of bmrSrc.split(/\r?\n/)) {
                if (/Önerilen\s*Kal/i.test(ln)) continue;
                if (!/\b(?:BMR|BVIR|BVR|BMH)\b|Bazal\s*Metabolizma/i.test(ln)) continue;
                const stripped = ln.replace(/^.*?(?:BMR|BVIR|BVR|BMH|Bazal\s*Metabolizma(?:\s*H[ıi]z[ıi])?)/i, '')
                    .replace(/k?\s*c?e?a?l.*/i, '').trim();
                const tokens = stripped.match(/[0-9A-Za-z]{3,5}/g) || [];
                for (let t = tokens.length - 1; t >= 0; t--) {
                    const num = parseInt(repairOcrDigits(tokens[t]), 10);
                    if (Number.isFinite(num) && num >= 800 && num <= 4500) {
                        raw.bmr = num;
                        break;
                    }
                }
                if (raw.bmr) break;
            }

            const recCalMatch = bmrSrc.match(/Önerilen\s*Kal[oa]r[ıi][^\n]*/i);
            if (recCalMatch) {
                const tok = recCalMatch[0].replace(/k?\s*c?e?a?l.*/i, '').match(/([0-9IlOoSsBbZzYy]{4})/);
                if (tok) {
                    const n = parseInt(repairOcrDigits(tok[1]), 10);
                    if (n >= 1000 && n <= 6000) raw.recommendedCalories = n;
                }
            }
            raw.idealWeight = matchNumAfter(bmrSrc, /(?:[İI]deal|Ideal)\s*Kilo[^\d\n]{0,15}(\d{2,3}(?:[.,]\d{1,2})?)/i, 35, 150);

            // 8. Bölgesel (Segmental) Kas ve Yağ (Sabit sahte veri yok — yalnızca gerçek okunanlar)
            const segFatSec = getSection('PANEL_BOLGESEL_YAG');
            const segMusSec = getSection('PANEL_BOLGESEL_KAS');
            const seg = { leftArm: {}, rightArm: {}, trunk: {}, leftLeg: {}, rightLeg: {} };

            const mArmFat = matchNumAfter(text, /Sol\s*Kol\s*Ya[ğg]\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 0.1, 20);
            const mRArmFat = matchNumAfter(text, /Sa[ğg]\s*Kol\s*Ya[ğg]\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 0.1, 20);
            const mTrunkFat = matchNumAfter(text, /(?:G[öo]vde|Bel\s*Çevresi)\s*Ya[ğg]\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 0.5, 45);
            const mLLegFat = matchNumAfter(text, /Sol\s*Bacak\s*Ya[ğg]\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 0.2, 25);
            const mRLegFat = matchNumAfter(text, /Sa[ğg]\s*Bacak\s*Ya[ğg]\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 0.2, 25);

            const mArmMus = matchNumAfter(text, /Sol\s*Kol\s*Kas\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 0.5, 20);
            const mRArmMus = matchNumAfter(text, /Sa[ğg]\s*Kol\s*Kas\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 0.5, 20);
            const mTrunkMus = matchNumAfter(text, /(?:G[öo]vde|Bel\s*Çevresi)\s*Kas\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 5, 60);
            const mLLegMus = matchNumAfter(text, /Sol\s*Bacak\s*Kas\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 2, 30);
            const mRLegMus = matchNumAfter(text, /Sa[ğg]\s*Bacak\s*Kas\s*K[üu]tlesi[^\d\n]{0,15}(\d+(?:[.,]\d+)?)/i, 2, 30);

            if (mArmFat != null) seg.leftArm.fatKg = mArmFat;
            if (mRArmFat != null) seg.rightArm.fatKg = mRArmFat; else if (mArmFat != null) seg.rightArm.fatKg = mArmFat;
            if (mTrunkFat != null) seg.trunk.fatKg = mTrunkFat;
            if (mLLegFat != null) seg.leftLeg.fatKg = mLLegFat;
            if (mRLegFat != null) seg.rightLeg.fatKg = mRLegFat; else if (mLLegFat != null) seg.rightLeg.fatKg = mLLegFat;

            if (mArmMus != null) seg.leftArm.muscleKg = mArmMus;
            if (mRArmMus != null) seg.rightArm.muscleKg = mRArmMus; else if (mArmMus != null) seg.rightArm.muscleKg = mArmMus;
            if (mTrunkMus != null) seg.trunk.muscleKg = mTrunkMus;
            if (mLLegMus != null) seg.leftLeg.muscleKg = mLLegMus;
            if (mRLegMus != null) seg.rightLeg.muscleKg = mRLegMus;

            const parseSegPanelTokens = (secText, field) => {
                if (!secText) return;
                const sLines = secText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                const vals = [];
                for (const ln of sLines) {
                    const lr = [...ln.matchAll(/([LRB])\s*[:;.]?\s*(\d{1,2}[.,]\d)\s*(?:kg|ke|kp)?/gi)];
                    for (const m of lr) {
                        const v = parseScaleNum(m[2]);
                        if (v != null) vals.push({ tag: m[1].toUpperCase(), val: v });
                    }
                }
                const arms = vals.filter(v => v.tag === 'L' || v.tag === 'R').slice(0, 2);
                const trunkV = vals.find(v => v.tag === 'B');
                const legs = vals.filter(v => (v.tag === 'L' || v.tag === 'R') && !arms.includes(v)).slice(0, 2);
                if (arms[0] && seg.leftArm[field] == null) seg.leftArm[field] = arms[0].val;
                if (arms[1] && seg.rightArm[field] == null) seg.rightArm[field] = arms[1].val;
                if (trunkV && seg.trunk[field] == null) seg.trunk[field] = trunkV.val;
                if (legs[0] && seg.leftLeg[field] == null) seg.leftLeg[field] = legs[0].val;
                if (legs[1] && seg.rightLeg[field] == null) seg.rightLeg[field] = legs[1].val;
            };
            parseSegPanelTokens(segFatSec, 'fatKg');
            parseSegPanelTokens(segMusSec, 'muscleKg');
            raw.segmental = seg;

            // 9. Mezura Ölçümleri (Yalnızca açıkça cm çevre ölçümü içeren satırlardan)
            const meas = {};
            const measPatterns = {
                waist: /(?:Bel(?:\s*Çevresi)?|Waist)[^\d\n]{0,12}(\d{2,3}(?:[.,]\d)?)\s*cm/i,
                chest: /(?:G[öo][ğg][üu]s(?:\s*Çevresi)?|Chest)[^\d\n]{0,12}(\d{2,3}(?:[.,]\d)?)\s*cm/i,
                shoulder: /(?:Omuz(?:\s*Çevresi)?|Shoulder)[^\d\n]{0,12}(\d{2,3}(?:[.,]\d)?)\s*cm/i,
                arms: /(?:Kol|Paz[ıu]|Biceps|Arm)[^\d\n]{0,12}(\d{2}(?:[.,]\d)?)\s*cm/i,
                thigh: /(?:Bacak|Uyluk|Thigh)[^\d\n]{0,12}(\d{2,3}(?:[.,]\d)?)\s*cm/i,
                hips: /(?:Kal[çc]a|Hips?)[^\d\n]{0,12}(\d{2,3}(?:[.,]\d)?)\s*cm/i,
                neck: /(?:Boyun|Neck)[^\d\n]{0,12}(\d{2}(?:[.,]\d)?)\s*cm/i
            };
            for (const [key, re] of Object.entries(measPatterns)) {
                const m = text.match(re);
                if (m) {
                    const v = parseScaleNum(m[1]);
                    if (v != null) meas[key] = v;
                }
            }
            if (Object.keys(meas).length > 0) raw.measurements = meas;

            return normalizeAndValidateScaleData(raw) || { rawTextLength: text.length };
        }

        // ----- UNIFIED BODY COMPOSITION & MEASUREMENTS MODEL -----
        function getUnifiedBodyLogs() {
            const scaleLogs = getScaleLogs();
            const measLogs = getMeasurementsLogs();
            const map = new Map();

            scaleLogs.forEach(s => {
                map.set(s.date, {
                    date: s.date,
                    id: s.id,
                    timestamp: s.timestamp || new Date(s.date).getTime(),
                    weight: s.weight,
                    bodyFat: s.bodyFat,
                    muscleMass: s.muscleMass,
                    waterPct: s.waterPct,
                    visceralFat: s.visceralFat,
                    bmr: s.bmr,
                    uniqueHealth: s.uniqueHealth || null,
                    notes: s.notes || '',
                    scaleId: s.id
                });
            });

            measLogs.forEach(m => {
                if (map.has(m.date)) {
                    const existing = map.get(m.date);
                    existing.measId = m.id;
                    existing.waist = m.waist;
                    existing.chest = m.chest;
                    existing.shoulder = m.shoulder;
                    existing.arms = m.arms;
                    existing.thigh = m.thigh;
                    existing.hips = m.hips;
                    existing.neck = m.neck;
                    if (m.notes && !existing.notes) existing.notes = m.notes;
                    else if (m.notes && existing.notes && !existing.notes.includes(m.notes)) existing.notes += ` | ${m.notes}`;
                } else {
                    map.set(m.date, {
                        date: m.date,
                        id: m.id,
                        timestamp: m.timestamp || new Date(m.date).getTime(),
                        waist: m.waist,
                        chest: m.chest,
                        shoulder: m.shoulder,
                        arms: m.arms,
                        thigh: m.thigh,
                        hips: m.hips,
                        neck: m.neck,
                        notes: m.notes || '',
                        measId: m.id
                    });
                }
            });

            return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        function deleteUnifiedBodyEntry(date, scaleId, measId) {
            if (confirm(`${date} tarihli vücut ve ölçüm kaydını silmek istediğinize emin misiniz?`)) {
                if (scaleId) {
                    let sLogs = getScaleLogs().filter(l => l.id !== scaleId && l.date !== date);
                    setScaleLogs(sLogs);
                } else {
                    let sLogs = getScaleLogs().filter(l => l.date !== date);
                    setScaleLogs(sLogs);
                }
                if (measId) {
                    let mLogs = getMeasurementsLogs().filter(l => l.id !== measId && l.date !== date);
                    setMeasurementsLogs(mLogs);
                } else {
                    let mLogs = getMeasurementsLogs().filter(l => l.date !== date);
                    setMeasurementsLogs(mLogs);
                }
                renderAnalytics();
            }
        }

        function saveScaleEntry() {
            const date = document.getElementById('scaleDate').value || new Date().toISOString().split('T')[0];
            const weightVal = parseFloat(document.getElementById('scaleWeight').value);
            const waistVal = parseFloat(document.getElementById('scaleWaist') ? document.getElementById('scaleWaist').value : '');

            // En azından kilo veya bel girilmeli
            if ((!weightVal || isNaN(weightVal) || weightVal <= 0) && (!waistVal || isNaN(waistVal) || waistVal <= 0)) {
                alert("Lütfen en azından Kilo (kg) veya Bel Çevresi (cm) değerini giriniz!");
                return;
            }

            let scaleSummary = '';
            let measSummary = '';

            // Tartı / Kompozisyon Kaydı
            if (weightVal && !isNaN(weightVal) && weightVal > 0) {
                const bodyFat = parseFloat(document.getElementById('scaleBodyFat').value) || null;
                const muscleMass = parseFloat(document.getElementById('scaleMuscleMass').value) || null;
                const waterPct = parseFloat(document.getElementById('scaleWaterPct').value) || null;
                const visceralFat = parseInt(document.getElementById('scaleVisceralFat').value) || null;
                const bmr = parseInt(document.getElementById('scaleBmr').value) || null;
                const notes = document.getElementById('scaleNotes').value.trim();

                const entry = {
                    id: 'scale_' + Date.now(),
                    date: date,
                    weight: Math.round(weightVal * 100) / 100,
                    bodyFat: bodyFat ? Math.round(bodyFat * 10) / 10 : null,
                    muscleMass: muscleMass ? Math.round(muscleMass * 10) / 10 : null,
                    waterPct: waterPct ? Math.round(waterPct * 10) / 10 : null,
                    visceralFat: visceralFat,
                    bmr: bmr,
                    notes: notes,
                    timestamp: Date.now()
                };

                if (window._lastParsedScaleData) {
                    entry.uniqueHealth = window._lastParsedScaleData;
                    window._lastParsedScaleData = null;
                }

                let logs = getScaleLogs();
                logs = logs.filter(l => l.date !== date);
                logs.unshift(entry);
                logs.sort((a, b) => new Date(b.date) - new Date(a.date));
                setScaleLogs(logs);
                scaleSummary = `Kilo: ${entry.weight} kg${entry.bodyFat ? ` • Yağ: %${entry.bodyFat}` : ''}${entry.muscleMass ? ` • Kas: ${entry.muscleMass} kg` : ''}`;
            }

            // Mezura Ölçü Kaydı
            const chest = parseFloat(document.getElementById('scaleChest')?.value) || null;
            const shoulder = parseFloat(document.getElementById('scaleShoulder')?.value) || null;
            const arms = parseFloat(document.getElementById('scaleArms')?.value) || null;
            const thigh = parseFloat(document.getElementById('scaleThigh')?.value) || null;
            const hips = parseFloat(document.getElementById('scaleHips')?.value) || null;
            const neck = parseFloat(document.getElementById('scaleNeck')?.value) || null;
            const notes = document.getElementById('scaleNotes').value.trim();

            if (waistVal || chest || shoulder || arms || thigh || hips || neck) {
                const measEntry = {
                    id: 'meas_' + Date.now(),
                    date: date,
                    waist: waistVal ? Math.round(waistVal * 10) / 10 : null,
                    chest: chest ? Math.round(chest * 10) / 10 : null,
                    shoulder: shoulder ? Math.round(shoulder * 10) / 10 : null,
                    arms: arms ? Math.round(arms * 10) / 10 : null,
                    thigh: thigh ? Math.round(thigh * 10) / 10 : null,
                    hips: hips ? Math.round(hips * 10) / 10 : null,
                    neck: neck ? Math.round(neck * 10) / 10 : null,
                    notes: notes,
                    timestamp: Date.now()
                };

                let mLogs = getMeasurementsLogs();
                mLogs = mLogs.filter(l => l.date !== date);
                mLogs.unshift(measEntry);
                mLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                setMeasurementsLogs(mLogs);
                measSummary = `${measEntry.waist ? `Bel: ${measEntry.waist} cm` : ''}${measEntry.arms ? ` • Kol: ${measEntry.arms} cm` : ''}${measEntry.chest ? ` • Göğüs: ${measEntry.chest} cm` : ''}`;
            }

            closeScaleModal();
            renderAnalytics();
            playAlertSound();

            let msg = "⚖️📏 Vücut ve ölçüm kaydı başarıyla kaydedildi!\n\n";
            if (scaleSummary) msg += scaleSummary + "\n";
            if (measSummary) msg += measSummary;
            alert(msg.trim());
        }

        function deleteScaleEntry(id) {
            if (confirm("Bu tartı ölçümünü silmek istediğinize emin misiniz?")) {
                let logs = getScaleLogs();
                logs = logs.filter(l => l.id !== id);
                setScaleLogs(logs);
                renderAnalytics();
            }
        }

        // ----- BODY MEASUREMENTS (MEZURA) STORAGE & CRUD -----
        function getMeasurementsLogs() {
            const uid = getActiveUserId();
            try {
                const raw = localStorage.getItem(`celik_kodu_measurements_${uid}`);
                const parsed = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(parsed)) return [];
                return [...parsed].sort((a, b) => {
                    const ta = new Date(a?.date || a?.timestamp || 0).getTime() || 0;
                    const tb = new Date(b?.date || b?.timestamp || 0).getTime() || 0;
                    return tb !== ta ? (tb - ta) : ((Number(b?.timestamp) || 0) - (Number(a?.timestamp) || 0));
                });
            } catch(e) {
                return [];
            }
        }

        function setMeasurementsLogs(logs) {
            const uid = getActiveUserId();
            const cleanLogs = (window.CelikBridgeCustoms && typeof window.CelikBridgeCustoms.sanitizeMeasurementLogsList === 'function')
                ? window.CelikBridgeCustoms.sanitizeMeasurementLogsList(logs)
                : (Array.isArray(logs) ? logs : []);
            localStorage.setItem(`celik_kodu_measurements_${uid}`, JSON.stringify(cleanLogs));
            syncMeasurementLogsToCloud(cleanLogs, uid);
        }

        function openMeasurementsModal() {
            const todayStr = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('measureDate');
            if (dateInput && !dateInput.value) dateInput.value = todayStr;
            const m = document.getElementById('measurementsModal');
            if (m) m.classList.add('active');
        }

        function closeMeasurementsModal() {
            const m = document.getElementById('measurementsModal');
            if (m) m.classList.remove('active');
        }

        function saveMeasurementsEntry() {
            const date = document.getElementById('measureDate')?.value || new Date().toISOString().split('T')[0];
            const waist = parseFloat(document.getElementById('measureWaist')?.value);
            if (!waist || isNaN(waist)) {
                alert("Lütfen en azından Bel Çevresi (cm) değerini giriniz.");
                return;
            }
            const entry = {
                id: 'meas_' + Date.now(),
                date: date,
                waist: waist,
                chest: parseFloat(document.getElementById('measureChest')?.value) || null,
                shoulder: parseFloat(document.getElementById('measureShoulder')?.value) || null,
                arms: parseFloat(document.getElementById('measureArms')?.value) || null,
                thigh: parseFloat(document.getElementById('measureThigh')?.value) || null,
                hips: parseFloat(document.getElementById('measureHips')?.value) || null,
                neck: parseFloat(document.getElementById('measureNeck')?.value) || null,
                notes: document.getElementById('measureNotes')?.value || ''
            };
            let logs = getMeasurementsLogs();
            logs.unshift(entry);
            setMeasurementsLogs(logs);
            closeMeasurementsModal();
            renderAnalytics();
            alert("✅ Vücut ölçüleri başarıyla kaydedildi!");
        }

        function deleteMeasurementsEntry(id) {
            if (confirm("Bu vücut ölçümü kaydını silmek istediğinize emin misiniz?")) {
                let logs = getMeasurementsLogs();
                logs = logs.filter(l => l.id !== id);
                setMeasurementsLogs(logs);
                renderAnalytics();
            }
        }

        function exportAnalyticsCSV() {
            const uid = getActiveUserId() || 'anonim';
            const scaleLogs = getScaleLogs();
            const measLogs = getMeasurementsLogs();

            let csv = "\uFEFF=== TARTI VE VÜCUT KOMPOZİSYONU GEÇMİŞİ ===\r\n";
            csv += "Tarih,Kilo_Kg,Yag_Orani_Pct,Kas_Kutlesi_Kg,Sivi_Pct,Viseral_Yag,BMR_kcal,Notlar\r\n";
            scaleLogs.forEach(s => {
                csv += [
                    sanitizeCsvCell(s.date),
                    sanitizeCsvCell(s.weight || ''),
                    sanitizeCsvCell(s.bodyFat || ''),
                    sanitizeCsvCell(s.muscleMass || ''),
                    sanitizeCsvCell(s.waterPct || ''),
                    sanitizeCsvCell(s.visceralFat || ''),
                    sanitizeCsvCell(s.bmr || ''),
                    sanitizeCsvCell(s.notes || '')
                ].join(',') + "\r\n";
            });

            csv += "\r\n=== MEZURA VÜCUT ÖLÇÜLERİ GEÇMİŞİ ===\r\n";
            csv += "Tarih,Bel_cm,Gogus_cm,Omuz_cm,Kol_cm,Bacak_cm,Kalca_cm,Boyun_cm,Notlar\r\n";
            measLogs.forEach(m => {
                csv += [
                    sanitizeCsvCell(m.date),
                    sanitizeCsvCell(m.waist || ''),
                    sanitizeCsvCell(m.chest || ''),
                    sanitizeCsvCell(m.shoulder || ''),
                    sanitizeCsvCell(m.arms || ''),
                    sanitizeCsvCell(m.thigh || ''),
                    sanitizeCsvCell(m.hips || ''),
                    sanitizeCsvCell(m.neck || ''),
                    sanitizeCsvCell(m.notes || '')
                ].join(',') + "\r\n";
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_tarti_ve_olcum_${uid}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        // ----- MAIN RENDER ANALYTICS CONTROLLER -----
        function renderAnalytics() {
            const container = document.getElementById('analyticsContentContainer');
            if (!container) return;

            if (currentAnalyticsSubView === 'measurements') currentAnalyticsSubView = 'scale';

            // Highlight subview tab buttons
            const subBtns = [
                { id: 'btnSubAnalyticsMuscle', view: 'muscle' },
                { id: 'btnSubAnalyticsScore', view: 'score' },
                { id: 'btnSubAnalyticsMobility', view: 'mobility' },
                { id: 'btnSubAnalyticsScale', view: 'scale' },
                { id: 'btnSubAnalyticsCombined', view: 'combined' }
            ];
            subBtns.forEach(b => {
                const el = document.getElementById(b.id);
                if (el) {
                    if (b.view === currentAnalyticsSubView) el.classList.add('active');
                    else el.classList.remove('active');
                }
            });

            if (typeof refreshTopFitnessCardioScoreBars === 'function') {
                refreshTopFitnessCardioScoreBars();
            }

            const runSafeZone = (zoneLabel, fn) => {
                if (window.CelikLiaisonSubChiefs && typeof window.CelikLiaisonSubChiefs.runWithFaultWall === 'function') {
                    return window.CelikLiaisonSubChiefs.runWithFaultWall(zoneLabel, container, fn);
                }
                return fn();
            };

            if (currentAnalyticsSubView === 'muscle') {
                runSafeZone('Kas Haritası', () => renderMuscleAnalytics(container));
            } else if (currentAnalyticsSubView === 'score') {
                runSafeZone('Haftalık Puanlar', () => renderFitnessCardioScoreAnalytics(container));
            } else if (currentAnalyticsSubView === 'mobility') {
                runSafeZone('Mobilite İndeksi', () => renderMobilityAnalytics(container));
            } else if (currentAnalyticsSubView === 'combined') {
                runSafeZone('Koç & Güç Gelişimi', () => renderCombinedCoachReport(container));
            } else {
                runSafeZone('Tartı & Ölçü', () => renderScaleAnalytics(container));
            }
        }

        // ==================== AKADEMİK BİYOMEKANİK & KAS DAĞILIM MOTORU ====================
        // Brad Schoenfeld & RP Çok Eklemli Kademeli Yük Modeli (Single Source of Truth)
        const ACADEMIC_EXERCISE_SPEC = {
            // 1. GÖĞÜS & YATAY İTİŞ
            'barbell bench': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'dambıl bench press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'bench press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.35, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'incline barbell bench': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.45, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'incline dambıl press': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.45, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'eğimli sehpa dambıl pres (incline db press)': { primary: 'Göğüs', pFactor: 1.0, sec: { 'Omuz': 0.45, 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'dambıl floor press': { primary: 'Göğüs', pFactor: 0.85, sec: { 'Triceps': 0.45, 'Omuz': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },
            'kablo crossover': { primary: 'Göğüs', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'kablo göğüs sıkıştırma (cable flyes / crossover)': { primary: 'Göğüs', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'pec deck kelebek': { primary: 'Göğüs', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'dips': { primary: 'Göğüs', pFactor: 0.85, sec: { 'Triceps': 0.40, 'Omuz': 0.30 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'MODERATE', lengthened: true },
            'şınav (push-up)': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
            'klasik şınav (floor push-up)': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
            'şınav': { primary: 'Göğüs', pFactor: 0.65, sec: { 'Omuz': 0.25, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
            'decline şınav': { primary: 'Göğüs', pFactor: 0.75, sec: { 'Omuz': 0.35, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },
            'dambıl pullover': { primary: 'Göğüs', pFactor: 0.50, sec: { 'Sırt': 0.50, 'Triceps': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },

            // 2. SIRT & ÇEKİŞ
            'barbell row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40, 'Omuz': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
            'pendlay row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.35, 'Omuz': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },
            'dambıl saw row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'göğüs destekli row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40, 'Omuz': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'gorilla row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
            'lat pulldown': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.35, 'Omuz': 0.20 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'kablo row': { primary: 'Sırt', pFactor: 1.0, sec: { 'Biceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'barfiks (pull-up)': { primary: 'Sırt', pFactor: 0.85, sec: { 'Biceps': 0.40 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
            'yatay barfiks': { primary: 'Sırt', pFactor: 0.70, sec: { 'Biceps': 0.35 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
            'chin-up (ters barfiks)': { primary: 'Biceps', pFactor: 0.85, sec: { 'Sırt': 0.65 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
            'renegade row': { primary: 'Sırt', pFactor: 0.70, sec: { 'Karın/Core': 0.70, 'Biceps': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },
            'renegade row + şınav': { primary: 'Sırt', pFactor: 0.60, sec: { 'Göğüs': 0.50, 'Karın/Core': 0.60, 'Triceps': 0.25 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'MODERATE', lengthened: false },
            'hiperekstansiyon': { primary: 'Sırt', pFactor: 0.85, sec: { 'Glute': 0.50, 'Arka Bacak': 0.40 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
            'back extension': { primary: 'Sırt', pFactor: 0.85, sec: { 'Glute': 0.50, 'Arka Bacak': 0.40 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
            'good morning': { primary: 'Arka Bacak', pFactor: 0.90, sec: { 'Sırt': 0.60, 'Glute': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },

            // 3. OMUZ
            'barbell omuz presi': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'dambıl omuz presi': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'kettlebell press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'kettlebell strict overhead press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'arnold press': { primary: 'Omuz', pFactor: 1.0, sec: { 'Triceps': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'barbell push press': { primary: 'Omuz', pFactor: 0.80, sec: { 'Triceps': 0.30, 'Ön Bacak': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
            'dambıl push press': { primary: 'Omuz', pFactor: 0.80, sec: { 'Triceps': 0.30, 'Ön Bacak': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
            'dambıl lateral raise': { primary: 'Omuz', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
            'kablo lateral raise': { primary: 'Omuz', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'face pull': { primary: 'Omuz', pFactor: 0.80, sec: { 'Sırt': 0.50 }, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'diz üstü plaka ön omuz kaldırış': { primary: 'Omuz', pFactor: 0.80, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
            'kettlebell halo': { primary: 'Omuz', pFactor: 0.40, sec: {}, type: 'MOBILITY_STABILITY', sfr: 'HIGH', lengthened: false },
            'dambıl snatch': { primary: 'Omuz', pFactor: 0.50, sec: { 'Arka Bacak': 0.30, 'Glute': 0.30 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
            'kettlebell snatch': { primary: 'Omuz', pFactor: 0.50, sec: { 'Arka Bacak': 0.30, 'Glute': 0.30 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
            'dambıl clean & press': { primary: 'Omuz', pFactor: 0.70, sec: { 'Glute': 0.35, 'Arka Bacak': 0.30, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
            'step-up + omuz presi': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.60, 'Glute': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: false },

            // 4. ÖN BACAK (QUAD DOMINANT)
            'barbell back squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
            'barbell front squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'çift dambıl ön squat (front squat)': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'barbell zercher squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.40, 'Biceps': 0.25 }, type: 'HEAVY_COMPOUND', sfr: 'MODERATE', lengthened: true },
            'dambıl goblet squat': { primary: 'Ön Bacak', pFactor: 0.90, sec: { 'Glute': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'kettlebell goblet squat': { primary: 'Ön Bacak', pFactor: 0.90, sec: { 'Glute': 0.40 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            '45° leg press': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.35 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'bulgar split squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.60 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'walking lunge': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'reverse lunge': { primary: 'Ön Bacak', pFactor: 1.0, sec: { 'Glute': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'leg extension': { primary: 'Ön Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
            'air squat': { primary: 'Ön Bacak', pFactor: 0.30, sec: { 'Glute': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
            'jump squat': { primary: 'Ön Bacak', pFactor: 0.50, sec: { 'Glute': 0.35 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
            'lunge + gövde rotasyonu': { primary: 'Ön Bacak', pFactor: 0.80, sec: { 'Glute': 0.40, 'Karın/Core': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },

            // 5. ARKA BACAK (HAMSTRINGS)
            'barbell rdl': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Sırt': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'dambıl rdl': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.50, 'Sırt': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'tek bacak rdl': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.60 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'barbell deadlift': { primary: 'Arka Bacak', pFactor: 1.0, sec: { 'Glute': 0.65, 'Sırt': 0.50 }, type: 'HEAVY_COMPOUND', sfr: 'LOW', lengthened: true },
            'leg curl': { primary: 'Arka Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'barbell hang power clean': { primary: 'Arka Bacak', pFactor: 0.50, sec: { 'Glute': 0.50, 'Omuz': 0.30, 'Sırt': 0.30 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },
            'kettlebell clean': { primary: 'Glute', pFactor: 0.50, sec: { 'Arka Bacak': 0.40 }, type: 'BALLISTIC_POWER', sfr: 'MODERATE', lengthened: false },

            // 6. KALÇA (GLUTES)
            'barbell hip thrust': { primary: 'Glute', pFactor: 1.0, sec: { 'Arka Bacak': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: false },
            'glute bridge': { primary: 'Glute', pFactor: 1.0, sec: { 'Arka Bacak': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: false },
            'dambıl swing': { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40 }, type: 'BALLISTIC_POWER', sfr: 'HIGH', lengthened: true },
            'kettlebell swing': { primary: 'Glute', pFactor: 0.60, sec: { 'Arka Bacak': 0.40 }, type: 'BALLISTIC_POWER', sfr: 'HIGH', lengthened: true },

            // 7. BICEPS
            'incline dambıl curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'barbell curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
            'hammer curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
            'kablo biceps curl': { primary: 'Biceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },

            // 8. TRICEPS
            'dambıl başüstü triceps': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'dambıl skullcrusher': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'halat triceps pushdown': { primary: 'Triceps', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: false },
            'dar tutuş bench': { primary: 'Triceps', pFactor: 0.85, sec: { 'Göğüs': 0.50, 'Omuz': 0.30 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: true },
            'elmas şınav': { primary: 'Triceps', pFactor: 0.70, sec: { 'Göğüs': 0.35 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: false },

            // 9. KALF
            'calf raise': { primary: 'Kalf', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'dambıl ayakta kalf yükseltme': { primary: 'Kalf', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'dambıl kalf': { primary: 'Kalf', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'dambıl yatarak leg curl': { primary: 'Arka Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },
            'sissy squat': { primary: 'Ön Bacak', pFactor: 1.0, sec: {}, type: 'ISOLATION', sfr: 'HIGH', lengthened: true },

            // 10. KARIN & CORE
            'russian twist': { primary: 'Karın/Core', pFactor: 0.70, sec: {}, type: 'CORE', sfr: 'HIGH', lengthened: false },
            'kablo woodchopper': { primary: 'Karın/Core', pFactor: 0.80, sec: { 'Omuz': 0.20 }, type: 'CORE', sfr: 'HIGH', lengthened: false },
            'yarım diz üstü plaka oduncu (woodchopper)': { primary: 'Karın/Core', pFactor: 0.80, sec: { 'Omuz': 0.20 }, type: 'CORE', sfr: 'HIGH', lengthened: false },
            'plank': { primary: 'Karın/Core', pFactor: 0.50, sec: {}, type: 'CORE', sfr: 'HIGH', lengthened: false },
            'hollow body': { primary: 'Karın/Core', pFactor: 0.80, sec: {}, type: 'CORE', sfr: 'HIGH', lengthened: false },
            'barda dize çekme': { primary: 'Karın/Core', pFactor: 0.85, sec: { 'Sırt': 0.20 }, type: 'BODYWEIGHT_STRENGTH', sfr: 'HIGH', lengthened: true },
            "farmer's walk": { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Sırt': 0.35, 'Biceps': 0.30 }, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
            'suitcase carry': { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Sırt': 0.30, 'Biceps': 0.25 }, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
            'garson taşıması (waiter carry)': { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Omuz': 0.40 }, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
            'çapraz taşıma (cross-body carry)': { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Omuz': 0.30 }, type: 'LOADED_CARRY', sfr: 'HIGH', lengthened: false },
            'ayı emeklemesi plaka çekişi': { primary: 'Karın/Core', pFactor: 0.70, sec: { 'Omuz': 0.35 }, type: 'CORE', sfr: 'MODERATE', lengthened: false },
            'turkish get-up': { primary: 'Karın/Core', pFactor: 0.60, sec: { 'Omuz': 0.50, 'Glute': 0.35 }, type: 'MOBILITY_STABILITY', sfr: 'MODERATE', lengthened: false },

            // 11. HİBRİT / KOMPLEKS
            'barbell thruster': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.70, 'Glute': 0.35, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'LOW', lengthened: false },
            'dambıl thruster': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.70, 'Glute': 0.35, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'LOW', lengthened: false },
            'kettlebell thruster': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.70, 'Glute': 0.35, 'Triceps': 0.25 }, type: 'BALLISTIC_POWER', sfr: 'LOW', lengthened: false },
            'landmine squat to press': { primary: 'Ön Bacak', pFactor: 0.70, sec: { 'Omuz': 0.65, 'Glute': 0.35, 'Triceps': 0.20 }, type: 'HEAVY_COMPOUND', sfr: 'HIGH', lengthened: false },

            // 12. METABOLİK KONDİSYON (HİPERTROFİYE 0.0x VERİR)
            'burpee': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
            'mountain climber': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
            'dambıl manmaker': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
            'jumping jack': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
            'ip atlama': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
            'kürek çekme': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
            'tempolu yürüyüş': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false },
            'koşu': { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false }
        };

        function normSearchText(s) {
            return String(s || '')
                .replace(/İ/g, 'i')
                .replace(/I/g, 'i')
                .replace(/ı/g, 'i')
                .toLowerCase()
                .replace(/\u0307/g, '')
                .replace(/ı/g, 'i')
                .trim();
        }

        const ID_TO_ACADEMIC_NAME = {
            chest: 'Göğüs',
            back: 'Sırt',
            shoulders: 'Omuz',
            quads: 'Ön Bacak',
            hamstrings: 'Arka Bacak',
            glutes: 'Glute',
            biceps: 'Biceps',
            forearms: 'Biceps',
            triceps: 'Triceps',
            core: 'Karın/Core',
            calves: 'Kalf',
            calves_grip: 'Kalf'
        };

        const ACADEMIC_SPECS_BY_ID = {
          "db_bench_press": {
                    "primary": "Göğüs",
                    "pFactor": 1,
                    "sec": {
                              "Omuz": 0.35,
                              "Triceps": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_bench_press": {
                    "primary": "Göğüs",
                    "pFactor": 1,
                    "sec": {
                              "Omuz": 0.35,
                              "Triceps": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_incline_press": {
                    "primary": "Göğüs",
                    "pFactor": 1,
                    "sec": {
                              "Omuz": 0.45,
                              "Triceps": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_incline_bench": {
                    "primary": "Göğüs",
                    "pFactor": 1,
                    "sec": {
                              "Omuz": 0.45,
                              "Triceps": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_floor_press": {
                    "primary": "Göğüs",
                    "pFactor": 0.85,
                    "sec": {
                              "Triceps": 0.45,
                              "Omuz": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "mach_cable_crossover": {
                    "primary": "Göğüs",
                    "pFactor": 1,
                    "sec": {
                              "Omuz": 0.2
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_pec_deck": {
                    "primary": "Göğüs",
                    "pFactor": 1,
                    "sec": {
                              "Omuz": 0.2
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_pushup": {
                    "primary": "Göğüs",
                    "pFactor": 0.65,
                    "sec": {
                              "Omuz": 0.25,
                              "Triceps": 0.25,
                              "Karın/Core": 0.2
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bw_decline_pushup": {
                    "primary": "Göğüs",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.35,
                              "Triceps": 0.25,
                              "Karın/Core": 0.2
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bw_dips": {
                    "primary": "Göğüs",
                    "pFactor": 0.85,
                    "sec": {
                              "Triceps": 0.5,
                              "Omuz": 0.3
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_overhead_press": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {
                              "Triceps": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_standing_overhead_press": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {
                              "Triceps": 0.35,
                              "Karın/Core": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_overhead_press": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {
                              "Triceps": 0.35,
                              "Karın/Core": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "kb_press": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {
                              "Triceps": 0.35,
                              "Karın/Core": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_arnold_press": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {
                              "Triceps": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_push_press": {
                    "primary": "Omuz",
                    "pFactor": 0.85,
                    "sec": {
                              "Triceps": 0.3,
                              "Ön Bacak": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "bb_push_press": {
                    "primary": "Omuz",
                    "pFactor": 0.85,
                    "sec": {
                              "Triceps": 0.3,
                              "Ön Bacak": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "kneeling_plate_front_raise": {
                    "primary": "Omuz",
                    "pFactor": 0.85,
                    "sec": {
                              "Göğüs": 0.2,
                              "Karın/Core": 0.2
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_lateral_raise": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "mach_cable_lateral": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_face_pull": {
                    "primary": "Omuz",
                    "pFactor": 0.85,
                    "sec": {
                              "Sırt": 0.45
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_single_arm_rear_delt_row": {
                    "primary": "Omuz",
                    "pFactor": 1,
                    "sec": {
                              "Sırt": 0.35,
                              "Biceps": 0.25
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_quadruped_external_rotation": {
                    "primary": "Omuz",
                    "pFactor": 0.9,
                    "sec": {
                              "Sırt": 0.3,
                              "Karın/Core": 0.25
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_high_pull_cuban_rotation": {
                    "primary": "Omuz",
                    "pFactor": 0.85,
                    "sec": {
                              "Sırt": 0.65,
                              "Biceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "kb_halo": {
                    "primary": "Omuz",
                    "pFactor": 0.5,
                    "sec": {
                              "Sırt": 0.25,
                              "Karın/Core": 0.2
                    },
                    "type": "MOBILITY_STABILITY",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_triceps_overhead": {
                    "primary": "Triceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_skullcrusher": {
                    "primary": "Triceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_triceps_pushdown": {
                    "primary": "Triceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bb_close_grip_bench": {
                    "primary": "Triceps",
                    "pFactor": 0.9,
                    "sec": {
                              "Göğüs": 0.5,
                              "Omuz": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_diamond_pushup": {
                    "primary": "Triceps",
                    "pFactor": 0.75,
                    "sec": {
                              "Göğüs": 0.35,
                              "Omuz": 0.2
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_incline_curl": {
                    "primary": "Biceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_biceps_curl": {
                    "primary": "Biceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "mach_cable_biceps": {
                    "primary": "Biceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_biceps_curl": {
                    "primary": "Biceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_hammer_curl": {
                    "primary": "Biceps",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bw_pullup": {
                    "primary": "Sırt",
                    "pFactor": 0.9,
                    "sec": {
                              "Biceps": 0.4,
                              "Omuz": 0.2
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_chinup": {
                    "primary": "Sırt",
                    "pFactor": 0.85,
                    "sec": {
                              "Biceps": 0.7,
                              "Omuz": 0.2
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_lat_pulldown": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.35,
                              "Omuz": 0.2
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_straight_arm_pulldown": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Triceps": 0.25
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_pullover": {
                    "primary": "Sırt",
                    "pFactor": 0.8,
                    "sec": {
                              "Göğüs": 0.4,
                              "Triceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_saw_row": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.4,
                              "Omuz": 0.2
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_chest_supported_row": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.35,
                              "Omuz": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_cable_row": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.35,
                              "Omuz": 0.2
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_inverted_row": {
                    "primary": "Sırt",
                    "pFactor": 0.75,
                    "sec": {
                              "Biceps": 0.35,
                              "Omuz": 0.25
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_bent_over_row": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.4,
                              "Omuz": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "bb_pendlay_row": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.35,
                              "Omuz": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "kb_gorilla_row": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.4,
                              "Karın/Core": 0.3,
                              "Omuz": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_rotational_gorilla_row": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.4,
                              "Karın/Core": 0.4,
                              "Omuz": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_renegade_row": {
                    "primary": "Sırt",
                    "pFactor": 0.75,
                    "sec": {
                              "Karın/Core": 0.7,
                              "Biceps": 0.3,
                              "Göğüs": 0.25,
                              "Omuz": 0.2
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_dumbbell_shrug_burnout": {
                    "primary": "Sırt",
                    "pFactor": 1,
                    "sec": {
                              "Biceps": 0.25
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_hyperextension": {
                    "primary": "Sırt",
                    "pFactor": 0.85,
                    "sec": {
                              "Glute": 0.55,
                              "Arka Bacak": 0.4
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_back_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.55,
                              "Sırt": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "bb_front_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.4,
                              "Sırt": 0.3,
                              "Karın/Core": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_front_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.4,
                              "Karın/Core": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_goblet_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.9,
                    "sec": {
                              "Glute": 0.4,
                              "Karın/Core": 0.2
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "kb_goblet_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.9,
                    "sec": {
                              "Glute": 0.4,
                              "Karın/Core": 0.2
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_zercher_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.45,
                              "Sırt": 0.4,
                              "Karın/Core": 0.4,
                              "Biceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "mach_leg_press": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_leg_extension": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bw_sissy_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Karın/Core": 0.2
                    },
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_air_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.35,
                    "sec": {
                              "Glute": 0.25
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_jump_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.55,
                    "sec": {
                              "Glute": 0.4,
                              "Kalf": 0.35
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_bulgarian_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.65
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_walking_lunge": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.55
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_reverse_lunge": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.55
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_seesaw_lunge": {
                    "primary": "Ön Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.6
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_deadlift": {
                    "primary": "Arka Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.7,
                              "Sırt": 0.55,
                              "Ön Bacak": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "LOW",
                    "lengthened": true
          },
          "bb_rdl": {
                    "primary": "Arka Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.55,
                              "Sırt": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_rdl": {
                    "primary": "Arka Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.55,
                              "Sırt": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_single_leg_rdl": {
                    "primary": "Arka Bacak",
                    "pFactor": 1,
                    "sec": {
                              "Glute": 0.65,
                              "Karın/Core": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_leg_curl": {
                    "primary": "Arka Bacak",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_lying_leg_curl": {
                    "primary": "Arka Bacak",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bb_hip_thrust": {
                    "primary": "Glute",
                    "pFactor": 1,
                    "sec": {
                              "Arka Bacak": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bw_glute_bridge": {
                    "primary": "Glute",
                    "pFactor": 0.75,
                    "sec": {
                              "Arka Bacak": 0.25
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_swing": {
                    "primary": "Glute",
                    "pFactor": 0.65,
                    "sec": {
                              "Arka Bacak": 0.45,
                              "Sırt": 0.2
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "kb_swing": {
                    "primary": "Glute",
                    "pFactor": 0.65,
                    "sec": {
                              "Arka Bacak": 0.45,
                              "Sırt": 0.2
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "mach_calf_raise": {
                    "primary": "Kalf",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_standing_calf_raise": {
                    "primary": "Kalf",
                    "pFactor": 1,
                    "sec": {},
                    "type": "ISOLATION",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_plank": {
                    "primary": "Karın/Core",
                    "pFactor": 0.55,
                    "sec": {},
                    "type": "CORE",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bw_hollow_body": {
                    "primary": "Karın/Core",
                    "pFactor": 0.8,
                    "sec": {},
                    "type": "CORE",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bw_hanging_knee_raise": {
                    "primary": "Karın/Core",
                    "pFactor": 0.85,
                    "sec": {
                              "Biceps": 0.2
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_russian_twist": {
                    "primary": "Karın/Core",
                    "pFactor": 0.75,
                    "sec": {},
                    "type": "CORE",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "mach_cable_woodchopper": {
                    "primary": "Karın/Core",
                    "pFactor": 0.85,
                    "sec": {
                              "Omuz": 0.2
                    },
                    "type": "CORE",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "half_kneeling_plate_chop": {
                    "primary": "Karın/Core",
                    "pFactor": 0.85,
                    "sec": {
                              "Omuz": 0.25
                    },
                    "type": "CORE",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "bear_crawl_pull_through": {
                    "primary": "Karın/Core",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.3,
                              "Sırt": 0.2
                    },
                    "type": "CORE",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_farmers_walk": {
                    "primary": "Karın/Core",
                    "pFactor": 0.65,
                    "sec": {
                              "Sırt": 0.4,
                              "Biceps": 0.35
                    },
                    "type": "LOADED_CARRY",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_suitcase_carry": {
                    "primary": "Karın/Core",
                    "pFactor": 0.7,
                    "sec": {
                              "Sırt": 0.3,
                              "Biceps": 0.3,
                              "Glute": 0.2
                    },
                    "type": "LOADED_CARRY",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "waiters_carry": {
                    "primary": "Karın/Core",
                    "pFactor": 0.65,
                    "sec": {
                              "Omuz": 0.45
                    },
                    "type": "LOADED_CARRY",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "cross_body_carry": {
                    "primary": "Karın/Core",
                    "pFactor": 0.65,
                    "sec": {
                              "Omuz": 0.35,
                              "Sırt": 0.25,
                              "Biceps": 0.25
                    },
                    "type": "LOADED_CARRY",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "kb_windmill": {
                    "primary": "Karın/Core",
                    "pFactor": 0.8,
                    "sec": {
                              "Glute": 0.4,
                              "Omuz": 0.35,
                              "Arka Bacak": 0.25
                    },
                    "type": "MOBILITY_STABILITY",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "kb_turkish_getup": {
                    "primary": "Karın/Core",
                    "pFactor": 0.65,
                    "sec": {
                              "Omuz": 0.5,
                              "Glute": 0.35,
                              "Ön Bacak": 0.25
                    },
                    "type": "MOBILITY_STABILITY",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_snatch": {
                    "primary": "Omuz",
                    "pFactor": 0.55,
                    "sec": {
                              "Glute": 0.45,
                              "Arka Bacak": 0.35,
                              "Sırt": 0.3,
                              "Ön Bacak": 0.25,
                              "Triceps": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "kb_half_snatch": {
                    "primary": "Omuz",
                    "pFactor": 0.55,
                    "sec": {
                              "Glute": 0.45,
                              "Arka Bacak": 0.35,
                              "Sırt": 0.3,
                              "Ön Bacak": 0.25,
                              "Triceps": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "kb_clean": {
                    "primary": "Glute",
                    "pFactor": 0.55,
                    "sec": {
                              "Arka Bacak": 0.4,
                              "Sırt": 0.4,
                              "Biceps": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "bb_hang_power_clean": {
                    "primary": "Glute",
                    "pFactor": 0.55,
                    "sec": {
                              "Arka Bacak": 0.45,
                              "Sırt": 0.45,
                              "Ön Bacak": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_clean_and_press": {
                    "primary": "Omuz",
                    "pFactor": 0.75,
                    "sec": {
                              "Glute": 0.4,
                              "Arka Bacak": 0.35,
                              "Sırt": 0.3,
                              "Triceps": 0.3,
                              "Biceps": 0.2
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_clean_squat_press": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.7,
                              "Glute": 0.45,
                              "Arka Bacak": 0.3,
                              "Triceps": 0.25,
                              "Sırt": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_thruster": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.7,
                              "Glute": 0.4,
                              "Triceps": 0.3
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "LOW",
                    "lengthened": false
          },
          "kb_thruster": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.7,
                              "Glute": 0.4,
                              "Triceps": 0.3
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "LOW",
                    "lengthened": false
          },
          "bb_thruster": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.7,
                              "Glute": 0.4,
                              "Triceps": 0.3
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "LOW",
                    "lengthened": false
          },
          "bb_landmine_squat_press": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.6,
                              "Göğüs": 0.35,
                              "Glute": 0.35,
                              "Triceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "step_up_press": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.6,
                              "Glute": 0.45,
                              "Triceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "lunge_with_twist": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.8,
                    "sec": {
                              "Glute": 0.45,
                              "Karın/Core": 0.5
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "db_rotational_lunge_chop": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.8,
                    "sec": {
                              "Glute": 0.5,
                              "Karın/Core": 0.55,
                              "Omuz": 0.3
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_step_back_lunge_to_knee_drive": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.8,
                    "sec": {
                              "Omuz": 0.6,
                              "Glute": 0.45,
                              "Karın/Core": 0.35
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_lunge_to_curl_press": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Omuz": 0.6,
                              "Biceps": 0.55,
                              "Glute": 0.45,
                              "Triceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_rdl_to_high_pull": {
                    "primary": "Arka Bacak",
                    "pFactor": 0.85,
                    "sec": {
                              "Glute": 0.5,
                              "Sırt": 0.5,
                              "Omuz": 0.45,
                              "Biceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_swing_to_goblet_squat": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.75,
                    "sec": {
                              "Glute": 0.65,
                              "Arka Bacak": 0.45,
                              "Karın/Core": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_gorilla_row_to_clean": {
                    "primary": "Sırt",
                    "pFactor": 0.85,
                    "sec": {
                              "Glute": 0.55,
                              "Arka Bacak": 0.45,
                              "Biceps": 0.4
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_floor_press_to_bridge": {
                    "primary": "Göğüs",
                    "pFactor": 0.85,
                    "sec": {
                              "Glute": 0.65,
                              "Triceps": 0.45,
                              "Omuz": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "HIGH",
                    "lengthened": false
          },
          "db_pullover_to_halo": {
                    "primary": "Sırt",
                    "pFactor": 0.7,
                    "sec": {
                              "Omuz": 0.55,
                              "Karın/Core": 0.5,
                              "Göğüs": 0.3,
                              "Triceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": true
          },
          "db_renegade_pushup": {
                    "primary": "Sırt",
                    "pFactor": 0.65,
                    "sec": {
                              "Göğüs": 0.6,
                              "Karın/Core": 0.6,
                              "Triceps": 0.3,
                              "Omuz": 0.25,
                              "Biceps": 0.25
                    },
                    "type": "HEAVY_COMPOUND",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "db_manmaker": {
                    "primary": "Ön Bacak",
                    "pFactor": 0.55,
                    "sec": {
                              "Göğüs": 0.5,
                              "Sırt": 0.5,
                              "Omuz": 0.5,
                              "Glute": 0.4,
                              "Karın/Core": 0.4,
                              "Triceps": 0.25
                    },
                    "type": "BALLISTIC_POWER",
                    "sfr": "LOW",
                    "lengthened": false
          },
          "bw_inchworm_to_pushup": {
                    "primary": "Göğüs",
                    "pFactor": 0.55,
                    "sec": {
                              "Karın/Core": 0.45,
                              "Omuz": 0.3,
                              "Triceps": 0.25
                    },
                    "type": "BODYWEIGHT_STRENGTH",
                    "sfr": "HIGH",
                    "lengthened": true
          },
          "bw_mountain_climber": {
                    "primary": "Karın/Core",
                    "pFactor": 0.4,
                    "sec": {},
                    "type": "CORE",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "bw_plank_jacks": {
                    "primary": "Karın/Core",
                    "pFactor": 0.4,
                    "sec": {},
                    "type": "CORE",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "bw_burpee": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "bw_squat_thrust": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "bw_jumping_jack": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "bw_high_knees": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "bw_jump_rope": {
                    "primary": "Kalf",
                    "pFactor": 0.35,
                    "sec": {},
                    "type": "BALLISTIC_POWER",
                    "sfr": "MODERATE",
                    "lengthened": false
          },
          "bw_butt_kicks": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "bw_skater_jumps": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "bw_lateral_shuffle": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "cond_indoor_row": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "cond_walking": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          },
          "cond_running": {
                    "primary": null,
                    "pFactor": 0,
                    "sec": {},
                    "type": "CONDITIONING",
                    "sfr": "N/A",
                    "lengthened": false
          }
};

        function resolveExerciseBiomechanics(name = '', rawMuscle = '', category = '') {
            const cleanName = normSearchText(name);
            const cleanBase = cleanName.split('(')[0].trim();

            // 1. Önce EXERCISES_DB üzerinden tam ID / tam isim eşleşmesini kontrol et (alt-dize çarpışmalarını %100 önler)
            const dbEx = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB))
                ? (EXERCISES_DB.find(e => normSearchText(e.id) === cleanName || normSearchText(e.name) === cleanName)
                    || EXERCISES_DB.find(e => normSearchText((e.name || '').split('(')[0].trim()) === cleanBase && cleanBase.length >= 4)
                    || EXERCISES_DB.find(e => {
                        const en = normSearchText(e.name);
                        const eb = en.split('(')[0].trim();
                        return cleanBase.length >= 4 && (en.includes(cleanBase) || (eb.length >= 4 && cleanName.includes(eb)));
                    }))
                : null;

            if (dbEx && ACADEMIC_SPECS_BY_ID[dbEx.id]) {
                return ACADEMIC_SPECS_BY_ID[dbEx.id];
            }
            if (ACADEMIC_SPECS_BY_ID[name]) {
                return ACADEMIC_SPECS_BY_ID[name];
            }

            if (dbEx && dbEx.category === 'conditioning') {
                return { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false };
            }

            for (const [key, val] of Object.entries(ACADEMIC_EXERCISE_SPEC)) {
                const nk = normSearchText(key);
                if (cleanName === nk) return val;
            }
            // Uzun anahtarları önce dene ki 'şınav' -> 'elmas şınav' çarpışması yaşanmasın
            const sortedSpecEntries = Object.entries(ACADEMIC_EXERCISE_SPEC).sort((a, b) => b[0].length - a[0].length);
            for (const [key, val] of sortedSpecEntries) {
                const nk = normSearchText(key);
                if (cleanName.includes(nk) || nk.includes(cleanName)) {
                    return val;
                }
            }

            if (dbEx && Array.isArray(dbEx.primaryMuscles) && dbEx.primaryMuscles.length > 0) {
                const primName = ID_TO_ACADEMIC_NAME[dbEx.primaryMuscles[0]] || 'Göğüs';
                const secObj = {};
                dbEx.primaryMuscles.slice(1).forEach(mId => {
                    const mName = ID_TO_ACADEMIC_NAME[mId];
                    if (mName && mName !== primName) secObj[mName] = 0.65;
                });
                (dbEx.secondaryMuscles || []).forEach(mId => {
                    const mName = ID_TO_ACADEMIC_NAME[mId];
                    if (mName && mName !== primName && !secObj[mName]) secObj[mName] = 0.35;
                });
                return {
                    primary: primName,
                    pFactor: dbEx.primaryMuscles.length > 1 ? 0.85 : 1.0,
                    sec: secObj,
                    type: dbEx.equipment === 'bodyweight' ? 'BODYWEIGHT_STRENGTH' : 'HEAVY_COMPOUND',
                    sfr: 'HIGH',
                    lengthened: true
                };
            }

            const text = normSearchText(`${name} ${rawMuscle} ${category}`);
            if (text.includes('burpee') || text.includes('climber') || text.includes('cardio') || text.includes('kondisyon') || text.includes('jumping') || text.includes('manmaker') || text.includes('ip atlama') || text.includes('lateral shuffle') || text.includes('high knees') || text.includes('butt kicks') || text.includes('skater') || text.includes('plank jack')) {
                return { primary: null, pFactor: 0.0, sec: {}, type: 'CONDITIONING', sfr: 'N/A', lengthened: false };
            }
            let primary = 'Göğüs';
            let pFactor = 1.0;
            let sec = {};
            let type = 'HEAVY_COMPOUND';
            let sfr = 'HIGH';
            let lengthened = false;
            if (text.includes('bench') || (text.includes('press') && !text.includes('omuz') && !text.includes('overhead') && !text.includes('leg'))) {
                primary = 'Göğüs';
                sec = { 'Omuz': 0.35, 'Triceps': 0.35 };
                lengthened = true;
            } else if (text.includes('sinav') || text.includes('push-up') || text.includes('pushup')) {
                primary = 'Göğüs';
                pFactor = 0.65;
                sec = { 'Omuz': 0.25, 'Triceps': 0.25 };
                type = 'BODYWEIGHT_STRENGTH';
            } else if (text.includes('arka omuz') || text.includes('rear delt') || text.includes('cuban')) {
                primary = 'Omuz';
                sec = { 'Sırt': 0.45, 'Biceps': 0.25 };
                lengthened = true;
            } else if (text.includes('row') || text.includes('pulldown') || text.includes('lats') || text.includes('kanat') || text.includes('barfiks') || text.includes('pull-up') || text.includes('cekis') || text.includes('sirt') || text.includes('trapez') || text.includes('shrug')) {
                primary = 'Sırt';
                sec = { 'Biceps': 0.40 };
                lengthened = true;
            } else if (text.includes('omuz') || text.includes('overhead') || text.includes('arnold') || text.includes('deltoid') || text.includes('lateral raise')) {
                primary = 'Omuz';
                sec = { 'Triceps': 0.35 };
                lengthened = true;
            } else if (text.includes('squat') || text.includes('lunge') || text.includes('on bacak') || text.includes('kuadriseps') || text.includes('quad')) {
                primary = 'Ön Bacak';
                sec = { 'Glute': 0.40 };
                lengthened = true;
            } else if (text.includes('rdl') || text.includes('deadlift') || text.includes('hamstring') || text.includes('leg curl') || text.includes('arka bacak')) {
                primary = 'Arka Bacak';
                sec = { 'Glute': 0.50 };
                lengthened = true;
            } else if (text.includes('swing') || text.includes('glute') || text.includes('kalca') || text.includes('hip thrust')) {
                primary = 'Glute';
                sec = { 'Arka Bacak': 0.40 };
                pFactor = 0.60;
                type = 'BALLISTIC_POWER';
            } else if (text.includes('curl') || text.includes('biceps')) {
                primary = 'Biceps';
                type = 'ISOLATION';
                lengthened = text.includes('incline');
            } else if (text.includes('triceps') || text.includes('arka kol') || text.includes('pushdown')) {
                primary = 'Triceps';
                type = 'ISOLATION';
                lengthened = text.includes('basustu') || text.includes('overhead');
            } else if (text.includes('kalf') || text.includes('calf') || text.includes('baldir')) {
                primary = 'Kalf';
                type = 'ISOLATION';
                lengthened = true;
            } else if (text.includes('core') || text.includes('karin') || text.includes('twist') || text.includes('carry')) {
                primary = 'Karın/Core';
                pFactor = 0.60;
                type = 'CORE';
            }
            return { primary, pFactor, sec, type, sfr, lengthened };
        }

        const ACADEMIC_MUSCLE_TO_ID = {
            'Göğüs': 'chest',
            'Sırt': 'back',
            'Omuz': 'shoulders',
            'Ön Bacak': 'quads',
            'Arka Bacak': 'hamstrings',
            'Glute': 'glutes',
            'Kalça': 'glutes',
            'Biceps': 'biceps',
            'Triceps': 'triceps',
            'Karın/Core': 'core',
            'Karın': 'core',
            'Core': 'core',
            'Kalf': 'calves',
            'chest': 'chest',
            'back': 'back',
            'shoulders': 'shoulders',
            'quads': 'quads',
            'hamstrings': 'hamstrings',
            'glutes': 'glutes',
            'biceps': 'biceps',
            'triceps': 'triceps',
            'core': 'core',
            'calves': 'calves'
        };

        // ==================== WEEKLY MUSCLE BALANCE & SUFFICIENCY ENGINE ====================
        const WEEKLY_MUSCLE_CONFIG = [
            { id: 'chest', name: 'Göğüs', icon: '', optimalMin: 8, optimalMax: 18, desc: 'Üst, Orta ve Alt Göğüs' },
            { id: 'back', name: 'Sırt & Kanat', icon: '', optimalMin: 8, optimalMax: 20, desc: 'Kanat, Orta ve Üst Sırt' },
            { id: 'shoulders', name: 'Omuz', icon: '', optimalMin: 8, optimalMax: 18, desc: 'Ön, Yan ve Arka Omuz' },
            { id: 'quads', name: 'Ön Bacak', icon: '', optimalMin: 8, optimalMax: 18, desc: 'Ön Bacak & Çömelme' },
            { id: 'hamstrings', name: 'Arka Bacak', icon: '', optimalMin: 6, optimalMax: 16, desc: 'Arka Bacak & Eğilme' },
            { id: 'glutes', name: 'Kalça', icon: '', optimalMin: 6, optimalMax: 16, desc: 'Kalça & Denge' },
            { id: 'biceps', name: 'Ön Kol (Pazı)', icon: '', optimalMin: 6, optimalMax: 16, desc: 'Pazı & Kol Çekiş' },
            { id: 'triceps', name: 'Arka Kol', icon: '', optimalMin: 6, optimalMax: 16, desc: 'Arka Kol & Kol İtiş' },
            { id: 'core', name: 'Karın & Bel', icon: '', optimalMin: 6, optimalMax: 16, desc: 'Ön Karın, Yan Karın & Bel' },
            { id: 'calves', name: 'Baldır & Alt Bacak', icon: '', optimalMin: 3, optimalMax: 12, desc: 'Baldır & Ayak Bileği' }
        ];

        let currentWeeklyMuscleFilter = 'all'; // 'all', 'optimal', 'insufficient', 'unworked'
        let currentWeeklyMuscleSource = 'week_projected'; // 'week_projected', 'week_done', 'schedule_full'
        let currentWeeklyMuscleWeekOffset = 0; // 0 = this week, -1 = last week, +1 = next week

        function getWeeklyMuscleBounds(weekOffset = 0) {
            const d = new Date();
            d.setDate(d.getDate() + (weekOffset * 7));
            const day = d.getDay();
            const diffToMonday = day === 0 ? -6 : 1 - day;
            const monday = new Date(d);
            monday.setDate(d.getDate() + diffToMonday);
            monday.setHours(0, 0, 0, 0);

            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            sunday.setHours(23, 59, 59, 999);

            const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
            const label = `${monday.getDate()} ${months[monday.getMonth()]} - ${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;

            return { monday, sunday, label, isCurrentWeek: weekOffset === 0 };
        }

        function getRecommendationsForMuscle(muscleId, max = 4) {
            if (!Array.isArray(EXERCISES_DB)) return [];
            let list = EXERCISES_DB.filter(e => !isExerciseExcludedByUser(e.id) && (e.primaryMuscles || []).includes(muscleId));
            if (list.length < max) {
                const secondary = EXERCISES_DB.filter(e => 
                    !isExerciseExcludedByUser(e.id) &&
                    !list.includes(e) && (
                        (e.secondaryMuscles || []).includes(muscleId) ||
                        (e.muscle && typeof e.muscle === 'string' && e.muscle.toLowerCase().includes(muscleId.toLowerCase()))
                    )
                );
                list = list.concat(secondary);
            }
            list.sort((a, b) => {
                const score = (x) => (x.equipment === 'dumbbell' ? 3 : (x.equipment === 'kettlebell' ? 2 : (x.equipment === 'bodyweight' ? 1 : 0)));
                return score(b) - score(a);
            });
            return list.slice(0, max);
        }

        function formatDateTr(rawDate) {
            if (!rawDate) return '-';
            const dt = new Date(rawDate);
            if (isNaN(dt.getTime())) return String(rawDate);
            const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
            const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
            return `${dt.getDate()} ${months[dt.getMonth()]} ${days[dt.getDay()]}`;
        }

        function calculateWeeklyMuscleSufficiency(sourceMode = 'week_projected', weekOffset = 0) {
            const bounds = getWeeklyMuscleBounds(weekOffset);
            const allLogs = (typeof getWorkoutLogs === 'function') ? getWorkoutLogs() : [];
            const weekLogs = allLogs.filter(l => {
                const dt = new Date(l.date);
                return dt >= bounds.monday && dt <= bounds.sunday;
            });

            const loggedDays = new Set(weekLogs.map(l => new Date(l.date).getDay()));
            const todayDay = (new Date()).getDay();
            const getIsoDay = (d) => d === 0 ? 7 : d;
            const todayIso = getIsoDay(todayDay);

            const schedule = (typeof getWeeklySchedule === 'function') ? getWeeklySchedule() : {};

            const map = {};
            WEEKLY_MUSCLE_CONFIG.forEach(m => {
                map[m.id] = {
                    id: m.id,
                    name: m.name,
                    icon: m.icon,
                    desc: m.desc,
                    optimalMin: m.optimalMin,
                    optimalMax: m.optimalMax,
                    doneDirectSets: 0,
                    doneSecondarySets: 0,
                    planDirectSets: 0,
                    planSecondarySets: 0,
                    scheduledTotalSets: 0,
                    scheduledSecondarySets: 0,
                    doneExercises: new Set(),
                    plannedExercises: new Map(),
                    contributions: []
                };
            });

            // 1. Gerçekleşen Antrenman Loglarını Biyomekanik Katsayılarla İşle
            weekLogs.forEach(log => {
                if (!log.exercises || !Array.isArray(log.exercises)) return;
                const dateStr = log.dateFormatted || formatDateTr(log.date);
                const sessionTitle = log.title || log.workoutName || 'Antrenman Seansı';

                log.exercises.forEach(ex => {
                    const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                        ? Number(ex.completedSetsCount)
                        : (Array.isArray(ex.sets) ? ex.sets.filter(s => s && s.completed).length : (Number(ex.sets) || 0));
                    if (cSets <= 0) return;

                    const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
                    if (!spec || spec.type === 'CONDITIONING' || spec.pFactor === 0) {
                        return; // Metabolik dayanıklılık hipertrofi set havuzuna eklenmez
                    }

                    // Birincil Hedef Kas Grubu
                    const primId = ACADEMIC_MUSCLE_TO_ID[spec.primary] || spec.primary;
                    if (primId && map[primId] && spec.pFactor > 0) {
                        const directAdd = cSets * spec.pFactor;
                        map[primId].doneDirectSets += directAdd;
                        map[primId].doneExercises.add(ex.name);

                        map[primId].contributions.push({
                            date: dateStr,
                            sessionTitle: sessionTitle,
                            exercise: ex.name,
                            rawSets: cSets,
                            role: 'Ana Hedef',
                            factor: spec.pFactor,
                            earnedSets: Math.round(directAdd * 10) / 10
                        });
                    }

                    // İkincil / Yardımcı Kas Grupları
                    if (spec.sec && typeof spec.sec === 'object') {
                        Object.entries(spec.sec).forEach(([secName, secFactor]) => {
                            const secId = ACADEMIC_MUSCLE_TO_ID[secName] || secName;
                            if (secId && map[secId] && secFactor > 0) {
                                const secAdd = cSets * secFactor;
                                map[secId].doneSecondarySets += secAdd;

                                map[secId].contributions.push({
                                    date: dateStr,
                                    sessionTitle: sessionTitle,
                                    exercise: ex.name,
                                    rawSets: cSets,
                                    role: 'Yardımcı Kas',
                                    factor: secFactor,
                                    earnedSets: Math.round(secAdd * 10) / 10
                                });
                            }
                        });
                    }
                });
            });

            // 2. Haftalık Planlanan Antrenmanları Biyomekanik Katsayılarla İşle
            const dayKeys = [1, 2, 3, 4, 5, 6, 0];
            let totalPlannedSessions = 0;
            dayKeys.forEach(dKey => {
                const offsetFromMon = dKey === 0 ? 6 : (dKey - 1);
                const dayDate = new Date(bounds.monday);
                dayDate.setDate(bounds.monday.getDate() + offsetFromMon);

                const plan = (sourceMode !== 'schedule_full' && typeof getPlanForDate === 'function')
                    ? getPlanForDate(dayDate)
                    : schedule[dKey];
                if (!plan || plan.rest) return;

                const planIso = getIsoDay(dKey);
                const isCompleted = loggedDays.has(dKey);
                const isRemaining = bounds.isCurrentWeek ? (!isCompleted && planIso >= todayIso) : (!bounds.isCurrentWeek && weekOffset > 0);

                totalPlannedSessions++;

                const details = (typeof getWorkoutDetailsForPlan === 'function') ? getWorkoutDetailsForPlan(plan) : null;
                if (!details || !Array.isArray(details.exercises)) return;

                details.exercises.forEach(ex => {
                    const pSets = Number(ex.targetSets || ex.sets) || (details.scheme && Number(details.scheme.sets)) || 3;
                    const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
                    if (!spec || spec.type === 'CONDITIONING' || spec.pFactor === 0) {
                        return;
                    }

                    const primId = ACADEMIC_MUSCLE_TO_ID[spec.primary] || spec.primary;
                    if (primId && map[primId] && spec.pFactor > 0) {
                        const directPlan = pSets * spec.pFactor;
                        map[primId].scheduledTotalSets += directPlan;
                        if (isRemaining || sourceMode === 'schedule_full') {
                            map[primId].planDirectSets += directPlan;
                            map[primId].plannedExercises.set(`${ex.name}_${dKey}`, {
                                name: ex.name,
                                dayIdx: dKey,
                                dayName: (typeof DAY_NAMES_TR !== 'undefined') ? DAY_NAMES_TR[dKey] : `Gün ${dKey}`,
                                sets: directPlan
                            });
                        }
                    }

                    if (spec.sec && typeof spec.sec === 'object') {
                        Object.entries(spec.sec).forEach(([secName, secFactor]) => {
                            const secId = ACADEMIC_MUSCLE_TO_ID[secName] || secName;
                            if (secId && map[secId] && secFactor > 0) {
                                const secPlan = pSets * secFactor;
                                map[secId].scheduledSecondarySets += secPlan;
                                if (isRemaining || sourceMode === 'schedule_full') {
                                    map[secId].planSecondarySets += secPlan;
                                    if (!map[secId].plannedExercises.has(`${ex.name}_${dKey}`)) {
                                        map[secId].plannedExercises.set(`${ex.name}_${dKey}`, {
                                            name: ex.name,
                                            dayIdx: dKey,
                                            dayName: (typeof DAY_NAMES_TR !== 'undefined') ? DAY_NAMES_TR[dKey] : `Gün ${dKey}`,
                                            sets: secPlan,
                                            role: 'Yardımcı Kas'
                                        });
                                    }
                                }
                            }
                        });
                    }
                });
            });

            // 3. Metrikleri ve Kademeli Hipertrofi Değerlendirmesini Sonuçlandır
            const summary = {
                totalMuscles: WEEKLY_MUSCLE_CONFIG.length,
                workedCount: 0,
                optimalCount: 0,
                insufficientCount: 0,
                unworkedCount: 0,
                highCount: 0
            };

            const unworkedNames = [];
            const insufficientNames = [];
            const optimalNames = [];

            const muscles = WEEKLY_MUSCLE_CONFIG.map(cfg => {
                const data = map[cfg.id];
                const effectiveDone = Math.round((data.doneDirectSets + data.doneSecondarySets) * 10) / 10;
                const effectivePlan = Math.round((data.planDirectSets + data.planSecondarySets) * 10) / 10;
                const effectiveProjected = Math.round((effectiveDone + effectivePlan) * 10) / 10;
                const effectiveScheduledTotal = Math.round((data.scheduledTotalSets + data.scheduledSecondarySets) * 10) / 10;

                let evalVolume = effectiveProjected;
                let evalDirectVolume = data.doneDirectSets + data.planDirectSets;
                if (sourceMode === 'week_done') {
                    evalVolume = effectiveDone;
                    evalDirectVolume = data.doneDirectSets;
                }
                if (sourceMode === 'schedule_full') {
                    evalVolume = effectiveScheduledTotal;
                    evalDirectVolume = data.scheduledTotalSets;
                }

                if (effectiveDone > 0) summary.workedCount++;

                let status = 'unworked';
                let statusBadge = '❌ Hiç Çalıştırılmadı';
                let statusColor = '#ef4444';
                let statusBg = 'rgba(239, 68, 68, 0.12)';
                let statusDesc = 'Bu kas grubu için antrenman hacmi bulunmuyor.';

                if (evalVolume === 0) {
                    status = 'unworked';
                    summary.unworkedCount++;
                    unworkedNames.push(cfg.name);
                    if (effectiveScheduledTotal > 0 && sourceMode === 'week_done') {
                        statusDesc = `Planda ${effectiveScheduledTotal.toFixed(1)} set var ancak henüz seans yapılmadı.`;
                    }
                } else if (evalVolume < cfg.optimalMin || evalDirectVolume === 0) {
                    status = 'insufficient';
                    statusBadge = evalDirectVolume === 0 ? '⚠️ Sadece Yardımcı Çalıştı' : '⚠️ Az Çalıştı';
                    statusColor = '#f59e0b';
                    statusBg = 'rgba(245, 158, 11, 0.12)';
                    statusDesc = evalDirectVolume === 0
                        ? `Bu kas için doğrudan bir hareket yapılmadı (diğer hareketlerden ${evalVolume.toFixed(1)} set yardımcı etki aldı).`
                        : `Haftalık hedefin altında kaldı (${evalVolume.toFixed(1)}/${cfg.optimalMin} set).`;
                    summary.insufficientCount++;
                    insufficientNames.push(cfg.name);
                } else if (evalVolume <= cfg.optimalMax) {
                    status = 'optimal';
                    statusBadge = '✅ İdeal Seviye';
                    statusColor = '#10b981';
                    statusBg = 'rgba(16, 185, 129, 0.12)';
                    statusDesc = `İdeal çalışma aralığında (${evalVolume.toFixed(1)} set).`;
                    summary.optimalCount++;
                    optimalNames.push(cfg.name);
                } else {
                    status = 'high';
                    statusBadge = '🔥 Çok Yoğun Çalıştı';
                    statusColor = '#818cf8';
                    statusBg = 'rgba(129, 140, 248, 0.12)';
                    statusDesc = `Çok yoğun çalıştı (${evalVolume.toFixed(1)} set); dinlenmeye özen gösterin.`;
                    summary.highCount++;
                    optimalNames.push(cfg.name);
                }

                return {
                    id: cfg.id,
                    name: cfg.name,
                    icon: cfg.icon,
                    desc: cfg.desc,
                    optimalMin: cfg.optimalMin,
                    optimalMax: cfg.optimalMax,
                    doneDirectSets: Math.round(data.doneDirectSets * 10) / 10,
                    doneSecondarySets: Math.round(data.doneSecondarySets * 10) / 10,
                    effectiveDone,
                    planDirectSets: Math.round(data.planDirectSets * 10) / 10,
                    planSecondarySets: Math.round(data.planSecondarySets * 10) / 10,
                    effectivePlan,
                    projectedSets: effectiveProjected,
                    scheduledTotalSets: effectiveScheduledTotal,
                    effectiveTotal: evalVolume,
                    status,
                    statusBadge,
                    statusColor,
                    statusBg,
                    statusDesc,
                    doneExercises: Array.from(data.doneExercises),
                    plannedExercises: Array.from(data.plannedExercises.values()),
                    contributions: data.contributions || []
                };
            });

            return {
                bounds,
                sourceMode,
                weekOffset,
                totalDoneSessions: weekLogs.length,
                totalPlannedSessions,
                summary,
                unworkedNames,
                insufficientNames,
                optimalNames,
                muscles
            };
        }

        let currentSelectedAnatomyMuscle = null;
        let currentSelectedAnatomySubKey = null;

        function selectAnatomyMuscle(muscleId, subColKey = null, ev = null) {
            if (ev && typeof ev.stopPropagation === 'function') {
                ev.stopPropagation();
            }
            currentSelectedAnatomyMuscle = muscleId;
            currentSelectedAnatomySubKey = subColKey || null;
            if (typeof renderAnalytics === 'function') {
                renderAnalytics();
            }
            setTimeout(() => {
                const subEl = subColKey ? document.getElementById(`anatomy_subcol_${muscleId}_${subColKey}`) : null;
                const card = document.getElementById('anatomyFocusCard');
                const targetEl = subEl || card;
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 60);
        }

        function setWeeklyMuscleFilter(filter) {
            if (currentWeeklyMuscleFilter === filter) {
                currentWeeklyMuscleFilter = 'all';
            } else {
                currentWeeklyMuscleFilter = filter;
                // Otomatik olarak bu filtreye uyan ilk kas grubunu seç
                try {
                    const analysis = calculateWeeklyMuscleSufficiency(currentWeeklyMuscleSource, currentWeeklyMuscleWeekOffset);
                    const matchMain = analysis.muscles.find(m => filter === 'optimal' ? (m.status === 'optimal' || m.status === 'high') : m.status === filter);
                    if (matchMain) {
                        currentSelectedAnatomyMuscle = matchMain.id;
                        currentSelectedAnatomySubKey = null;
                    }
                } catch (_) {}
            }
            if (typeof renderAnalytics === 'function') {
                renderAnalytics();
            }
            if (currentWeeklyMuscleFilter !== 'all') {
                setTimeout(() => {
                    const box = document.getElementById('anatomyFilterResultsBox') || document.getElementById('anatomyFocusCard');
                    if (box) {
                        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 60);
            }
        }

        function setWeeklyMuscleSource(mode) {
            currentWeeklyMuscleSource = mode;
            if (currentWeeklyMuscleFilter && currentWeeklyMuscleFilter !== 'all') {
                try {
                    const analysis = calculateWeeklyMuscleSufficiency(currentWeeklyMuscleSource, currentWeeklyMuscleWeekOffset);
                    const matchMain = analysis.muscles.find(m => currentWeeklyMuscleFilter === 'optimal' ? (m.status === 'optimal' || m.status === 'high') : m.status === currentWeeklyMuscleFilter);
                    if (matchMain) currentSelectedAnatomyMuscle = matchMain.id;
                } catch (_) {}
            }
            if (typeof renderAnalytics === 'function') {
                renderAnalytics();
            }
        }

        function setWeeklyMuscleOffset(offset) {
            currentWeeklyMuscleWeekOffset = offset;
            if (currentWeeklyMuscleFilter && currentWeeklyMuscleFilter !== 'all') {
                try {
                    const analysis = calculateWeeklyMuscleSufficiency(currentWeeklyMuscleSource, currentWeeklyMuscleWeekOffset);
                    const matchMain = analysis.muscles.find(m => currentWeeklyMuscleFilter === 'optimal' ? (m.status === 'optimal' || m.status === 'high') : m.status === currentWeeklyMuscleFilter);
                    if (matchMain) currentSelectedAnatomyMuscle = matchMain.id;
                } catch (_) {}
            }
            if (typeof renderAnalytics === 'function') {
                renderAnalytics();
            }
        }

        // ==================== WORKOUT QUICK-ADD & COMPILE HELPERS ====================
        let activeQuickAddExId = null;

        function removeExtraCardioSessionFromDay(dayIdx, exId, targetDateStr = null) {
            const schedule = getWeeklySchedule();
            const plan = schedule[dayIdx];
            if (plan && Array.isArray(plan.extraCardioSessions)) {
                plan.extraCardioSessions = plan.extraCardioSessions.filter(c => c && c.id !== exId);
                plan.updatedAt = Date.now();
                plan._explicitCardioUpdate = true;
                schedule[dayIdx] = plan;
                saveWeeklySchedule(schedule);
            }
            if (typeof getDateScheduleOverrides === 'function' && typeof saveDateScheduleOverride === 'function') {
                const ov = getDateScheduleOverrides();
                const dateKeysToUpdate = new Set();
                if (targetDateStr) dateKeysToUpdate.add(targetDateStr);
                if (ov && typeof ov === 'object') {
                    Object.keys(ov).forEach(k => {
                        try {
                            if (/^\d{4}-\d{2}-\d{2}$/.test(k) && new Date(k + 'T00:00:00').getDay() === Number(dayIdx)) {
                                dateKeysToUpdate.add(k);
                            }
                        } catch (_) {}
                    });
                }
                dateKeysToUpdate.forEach(dKey => {
                    if (ov && ov[dKey] && Array.isArray(ov[dKey].extraCardioSessions)) {
                        ov[dKey].extraCardioSessions = ov[dKey].extraCardioSessions.filter(c => c && c.id !== exId);
                        ov[dKey].updatedAt = Date.now();
                        ov[dKey]._explicitCardioUpdate = true;
                        saveDateScheduleOverride(dKey, ov[dKey]);
                    }
                });
            }
            if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
            if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
            if (typeof activeSchedulingDayIdx !== 'undefined' && activeSchedulingDayIdx !== null && typeof openScheduleDayModal === 'function') {
                openScheduleDayModal(dayIdx, targetDateStr);
            }
            if (typeof showToast === 'function') showToast('🗑️ Ek kardiyo seansı takvimden kaldırıldı.');
        }

        function addExerciseToDaySchedule(dayIdx, exId, targetSets = 3, targetReps = '8-12', cardioLimits = null) {
            if (/^cond_/.test(String(exId || ''))) {
                const ex = EXERCISES_DB.find(e => e.id === exId);
                if (!ex) return false;
                const schedule = getWeeklySchedule();
                const plan = schedule[dayIdx] || { id: 'rest', title: '🧘 Dinlenme & Toparlanma', type: 'rest', rest: true };
                const durMin = cardioLimits && cardioLimits.durationMin !== undefined
                    ? Math.max(0, Number(cardioLimits.durationMin) || 0)
                    : (parseInt(String(targetReps || '20').replace(/[^\d]/g, ''), 10) || 20);
                const distMeters = cardioLimits && cardioLimits.distanceMeters !== undefined
                    ? Math.max(0, Number(cardioLimits.distanceMeters) || 0)
                    : 0;
                const minHr = cardioLimits && cardioLimits.targetHeartrate !== undefined
                    ? Math.max(0, Number(cardioLimits.targetHeartrate) || 0)
                    : 0;
                const summaryParts = [];
                if (durMin > 0) summaryParts.push(`${durMin} dk`);
                if (distMeters > 0) summaryParts.push(`${distMeters} m`);
                if (minHr > 0) summaryParts.push(`≥${minHr} bpm`);
                const repLabel = summaryParts.length > 0 ? summaryParts.join(' • ') : 'Serbest';
                if (!Array.isArray(plan.extraCardioSessions)) plan.extraCardioSessions = [];
                const existingIdx = plan.extraCardioSessions.findIndex(c => c && c.id === ex.id);
                const nowTs = Date.now();
                const sessionObj = {
                    id: ex.id,
                    name: ex.name,
                    durationMin: durMin,
                    distanceMeters: distMeters,
                    targetHeartrate: minHr,
                    strictGate: true,
                    targetSets: 1,
                    targetReps: repLabel,
                    addedAt: nowTs
                };
                if (existingIdx >= 0) {
                    plan.extraCardioSessions[existingIdx] = sessionObj;
                } else {
                    plan.extraCardioSessions.push(sessionObj);
                }
                plan.updatedAt = nowTs;
                plan._explicitCardioUpdate = true;
                schedule[dayIdx] = plan;
                saveWeeklySchedule(schedule);

                if (typeof getWeekDaysMapForDateStr === 'function' && typeof getDateScheduleOverrides === 'function' && typeof saveDateScheduleOverride === 'function') {
                    try {
                        const { map } = getWeekDaysMapForDateStr(null, 0);
                        const dYMD = map && map[dayIdx] ? map[dayIdx].dateYMD : null;
                        const ov = getDateScheduleOverrides();
                        if (dYMD && ov && ov[dYMD]) {
                            const ovPlan = ov[dYMD];
                            if (!Array.isArray(ovPlan.extraCardioSessions)) ovPlan.extraCardioSessions = [];
                            const ovIdx = ovPlan.extraCardioSessions.findIndex(c => c && c.id === ex.id);
                            if (ovIdx >= 0) ovPlan.extraCardioSessions[ovIdx] = sessionObj;
                            else ovPlan.extraCardioSessions.push(sessionObj);
                            ovPlan.updatedAt = nowTs;
                            ovPlan._explicitCardioUpdate = true;
                            saveDateScheduleOverride(dYMD, ovPlan);
                        }
                    } catch (_) {}
                }
                return true;
            }
            const ex = EXERCISES_DB.find(e => e.id === exId);
            if (!ex) return false;

            const schedule = getWeeklySchedule();
            const plan = schedule[dayIdx] || { id: 'rest', title: 'Dinlenme', rest: true };
            const preservedCardio = Array.isArray(plan.extraCardioSessions) ? plan.extraCardioSessions : [];

            const details = (typeof getWorkoutDetailsForPlan === 'function') ? getWorkoutDetailsForPlan(plan) : null;
            let existingExercises = (details && Array.isArray(details.exercises))
                ? details.exercises.map(e => ({
                    id: e.id || e.exId,
                    name: e.name,
                    targetSets: e.targetSets || (details.scheme ? details.scheme.sets : 3),
                    targetReps: e.targetReps || (details.scheme ? details.scheme.reps : '8-12')
                })).filter(e => Boolean(e.id))
                : [];

            existingExercises.push({
                id: ex.id,
                name: ex.name,
                targetSets: parseInt(targetSets) || 3,
                targetReps: targetReps || '8-12'
            });

            const progId = 'custom_day_' + dayIdx + '_' + Date.now();
            const dayName = (typeof DAY_NAMES_TR !== 'undefined') ? DAY_NAMES_TR[dayIdx] : `Gün ${dayIdx}`;
            const muscleName = (ex.primaryMuscles && ex.primaryMuscles[0] && TARGET_REGIONS[ex.primaryMuscles[0]])
                ? TARGET_REGIONS[ex.primaryMuscles[0]].name
                : '';
            const title = plan.rest ? `${dayName} ${muscleName ? muscleName + ' ' : ''}Takviye Seansı` : (plan.title || `${dayName} Programı`);
            const nowTs = Date.now();

            const customWorkout = {
                id: progId,
                title: title,
                split: 'custom',
                splitName: title,
                style: 'classic',
                goal: 'hypertrophy',
                duration: Math.round(existingExercises.length * 8),
                scheme: { sets: 3, reps: '8-12', rest: (details && details.scheme ? details.scheme.rest : 60) },
                warmups: [
                    { name: "Eklemsel CARs (Omuz & Kalça Dairesi)", dur: "90 sn", cue: "Tüm eklemleri kontrollü ısıt." }
                ],
                exercises: existingExercises.map(e => {
                    const dbEx = EXERCISES_DB.find(x => x.id === e.id);
                    return Object.assign({}, dbEx || {}, e);
                }),
                finisher: { name: "Balistik Bitiş", desc: "Tempolu taşıma veya swing." },
                updatedAt: nowTs,
                isCustom: true
            };

            schedule[dayIdx] = {
                id: progId,
                title: title,
                type: 'custom_saved',
                desc: `${existingExercises.length} Hareket • ${customWorkout.duration} Dk`,
                rest: false,
                customWorkout: customWorkout,
                extraCardioSessions: preservedCardio,
                updatedAt: nowTs
            };

            saveWeeklySchedule(schedule);

            try {
                const user = getActiveUser();
                if (user && typeof upsertUserCustomProgram === 'function') {
                    upsertUserCustomProgram(customWorkout, user.id);
                }
            } catch(e) {}

            return true;
        }

        function openQuickAddToDayModal(exId) {
            activeQuickAddExId = exId;
            const ex = EXERCISES_DB.find(e => e.id === exId);
            if (!ex) return;

            const modal = document.getElementById('quickAddToDayModal');
            const titleEl = document.getElementById('quickAddModalTitle');
            const bodyEl = document.getElementById('quickAddModalBody');
            if (/^cond_/.test(String(ex.id || ''))) {
                setTimeout(() => {
                    if (!bodyEl) return;
                    bodyEl.querySelectorAll('select[id^="quickAddSetsSelect_"]').forEach(sel => {
                        sel.style.display = 'none';
                    });
                    bodyEl.querySelectorAll('button[onclick*="applyQuickAddExerciseToDay"]').forEach(btn => {
                        btn.innerHTML = '🚣 2. Ayrı Seans Ekle';
                        btn.style.background = '#0369A1';
                        btn.style.color = '#FFFFFF';
                        btn.style.borderColor = '#0284C7';
                    });
                    const infoBox = bodyEl.querySelector('div[style*="#FFFBEB"]');
                    if (infoBox) {
                        infoBox.style.background = '#F0F9FF';
                        infoBox.style.borderColor = '#BAE6FD';
                        infoBox.innerHTML = `
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
                                <div style="font-size:12.5px; color:#0369A1; font-weight:800;">
                                    🎯 Garmin fr945 Hedef & Alt Baraj Limitlerini Sen Belirle
                                </div>
                                <button type="button" class="btn btn-outline" style="font-size:11px; padding:4px 9px; font-weight:800; color:#0369A1; border-color:#0284C7; background:#FFFFFF;" onclick="closeQuickAddToDayModal(); startQuickWorkoutWithExercise('${ex.id}');">
                                    ⚡ Canlı Sayaç
                                </button>
                            </div>
                            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; background:#FFFFFF; border:1px solid #BAE6FD; padding:10px; border-radius:8px;">
                                <div>
                                    <label style="display:block; font-size:10.5px; font-weight:800; color:#0F172A; margin-bottom:3px;">⏱️ Hedef Süre (Dk)</label>
                                    <input id="cardioTargetMinInput" type="number" min="0" max="240" step="1" value="20" style="width:100%; padding:6px 8px; border:1.5px solid #94A3B8; border-radius:6px; font-size:12.5px; font-weight:800; color:#0F172A; background:#FFFFFF;">
                                    <span style="font-size:9.5px; color:#475569;">0 = Serbest süre</span>
                                </div>
                                <div>
                                    <label style="display:block; font-size:10.5px; font-weight:800; color:#0F172A; margin-bottom:3px;">📏 Hedef Mesafe (m)</label>
                                    <input id="cardioTargetDistInput" type="number" min="0" max="50000" step="100" value="0" style="width:100%; padding:6px 8px; border:1.5px solid #94A3B8; border-radius:6px; font-size:12.5px; font-weight:800; color:#0F172A; background:#FFFFFF;">
                                    <span style="font-size:9.5px; color:#475569;">0 = Mesafe hedefi yok</span>
                                </div>
                                <div>
                                    <label style="display:block; font-size:10.5px; font-weight:800; color:#0F172A; margin-bottom:3px;">❤️ Hedef Nabız (bpm)</label>
                                    <input id="cardioTargetHrInput" type="number" min="0" max="210" step="1" value="0" style="width:100%; padding:6px 8px; border:1.5px solid #94A3B8; border-radius:6px; font-size:12.5px; font-weight:800; color:#0F172A; background:#FFFFFF;">
                                    <span style="font-size:9.5px; color:#475569;">0 = Nabız uyarısı yok</span>
                                </div>
                            </div>
                            <div style="font-size:10.5px; color:#15803D; margin-top:8px; line-height:1.4; background:#F0FDF4; border:1px solid #86EFAC; padding:6px 9px; border-radius:6px; font-weight:700;">
                                ✅ <strong>Ne Yaptıysan O Kaydedilir:</strong> Hedefin altında veya üstünde bitirsen de saatte yaptığın gerçek süre, mesafe ve nabız eksiksiz kayıt altına alınır.
                            </div>
                        `;
                    }
                }, 0);
            }
            if (!modal || !bodyEl) return;

            const pNames = (ex.primaryMuscles || []).map(m => (TARGET_REGIONS[m] ? TARGET_REGIONS[m].name : m)).join(', ') || ex.muscle || '';

            if (titleEl) {
                titleEl.innerHTML = `➕ ${escapeHTML(ex.name)}`;
            }

            const schedule = getWeeklySchedule();
            const allLogs = getWorkoutLogs();
            const bounds = getWeeklyMuscleBounds(0);
            const weekLogs = allLogs.filter(l => {
                const dt = new Date(l.date);
                return dt >= bounds.monday && dt <= bounds.sunday;
            });
            const loggedDays = new Set(weekLogs.map(l => new Date(l.date).getDay()));
            const todayDay = (new Date()).getDay();
            const getIsoDay = (d) => d === 0 ? 7 : d;
            const todayIso = getIsoDay(todayDay);

            const dayKeys = [1, 2, 3, 4, 5, 6, 0];
            let daysHTML = '';

            dayKeys.forEach(dKey => {
                const dayName = DAY_NAMES_TR[dKey];
                const planIso = getIsoDay(dKey);
                const isCompleted = loggedDays.has(dKey);
                const isPast = !isCompleted && planIso < todayIso;
                const isAvailable = !isCompleted && planIso >= todayIso;

                const plan = schedule[dKey];
                const isRest = !plan || plan.rest;
                const details = (!isRest && typeof getWorkoutDetailsForPlan === 'function') ? getWorkoutDetailsForPlan(plan) : null;
                const exCount = (details && details.exercises) ? details.exercises.length : 0;
                const planTitle = isRest ? 'Dinlenme Günü' : (plan.title || 'Antrenman');

                let statusBadge = '';
                let subtitleText = '';
                let buttonHtml = '';

                if (isCompleted) {
                    statusBadge = `<span style="font-size:10px; color:#15803D; font-weight:800; background:#DCFCE7; border:1px solid #86EFAC; padding:2px 6px; border-radius:4px;">✅ Seans Tamamlandı</span>`;
                    subtitleText = `${escapeHTML(planTitle)} • Tamamlanmış seans`;
                    buttonHtml = `
                        <div style="display:flex; align-items:center; gap:6px;">
                            <select id="quickAddSetsSelect_${dKey}" style="background:#FFFFFF; color:#0F172A; border:1px solid var(--border); font-size:11px; padding:4px 6px; border-radius:6px;">
                                <option value="3" selected>3 Set</option>
                                <option value="4">4 Set</option>
                                <option value="5">5 Set</option>
                                <option value="2">2 Set</option>
                            </select>
                            <button class="btn btn-outline" style="font-size:10.5px; padding:4px 8px; opacity:0.85;" onclick="applyQuickAddExerciseToDay(${dKey}, '${ex.id}')">
                                ➕ Yine de Ekle
                            </button>
                        </div>
                    `;
                } else if (isRest) {
                    statusBadge = `<span style="font-size:10px; color:#0369A1; font-weight:800; background:#E0F2FE; border:1px solid #7DD3FC; padding:2px 6px; border-radius:4px;">🧘 Dinlenme Günü (Boş)</span>`;
                    subtitleText = `⚡ Eklendiğinde bu güne yeni bir Özel Takviye Seansı açılır`;
                    buttonHtml = `
                        <div style="display:flex; align-items:center; gap:6px;">
                            <select id="quickAddSetsSelect_${dKey}" style="background:#FFFFFF; color:#0F172A; border:1px solid var(--border); font-size:11px; padding:4px 6px; border-radius:6px;">
                                <option value="3" selected>3 Set</option>
                                <option value="4">4 Set</option>
                                <option value="5">5 Set</option>
                                <option value="2">2 Set</option>
                            </select>
                            <button class="btn btn-outline" style="font-size:11px; padding:5px 12px; font-weight:800; border-radius:6px; color:#0369A1; border-color:#38BDF8; background:#F0F9FF;" onclick="applyQuickAddExerciseToDay(${dKey}, '${ex.id}')" title="Bu dinlenme gününü takviye seansına dönüştür">
                                ⚡ Yeni Seans Aç
                            </button>
                        </div>
                    `;
                } else {
                    statusBadge = `<span style="font-size:10px; color:#B45309; font-weight:800; background:#FEF3C7; border:1px solid #FCD34D; padding:2px 6px; border-radius:4px;">🏋️ Planlı Antrenman</span>`;
                    subtitleText = `${escapeHTML(planTitle)} • ${exCount} Hareket Mevcut (Sonuna eklenir)`;
                    buttonHtml = `
                        <div style="display:flex; align-items:center; gap:6px;">
                            <select id="quickAddSetsSelect_${dKey}" style="background:#FFFFFF; color:#0F172A; border:1px solid var(--border); font-size:11px; padding:4px 6px; border-radius:6px;">
                                <option value="3" selected>3 Set</option>
                                <option value="4">4 Set</option>
                                <option value="5">5 Set</option>
                                <option value="2">2 Set</option>
                            </select>
                            <button class="btn btn-gold" style="font-size:11px; padding:5px 12px; font-weight:800; border-radius:6px;" onclick="applyQuickAddExerciseToDay(${dKey}, '${ex.id}')" title="Mevcut antrenmanın sonuna ilave hareket olarak ekle">
                                ➕ Antrenmana Ekle
                            </button>
                        </div>
                    `;
                }

                daysHTML += `
                    <div style="background:#F8FAFC; border:1px solid ${isRest ? '#BAE6FD' : (isAvailable ? '#FCD34D' : 'var(--border)')}; border-radius:10px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <strong style="font-size:13px; color:#0F172A;">${dayName}</strong>
                                ${statusBadge}
                                ${planIso === todayIso ? '<span style="font-size:9px; background:#0F172A; color:#FFFFFF; font-weight:900; padding:1px 5px; border-radius:3px;">BUGÜN</span>' : ''}
                            </div>
                            <div style="font-size:11px; color:var(--text-secondary); margin-top:3px;">
                                ${subtitleText}
                            </div>
                        </div>

                        ${buttonHtml}
                    </div>
                `;
            });

            bodyEl.innerHTML = `
                <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:10px; padding:12px; margin-bottom:14px;">
                    <div style="font-size:12px; color:#B45309;">
                        <strong>Hedef Kas Grubu:</strong> ${escapeHTML(pNames)} • <strong>Ekipman:</strong> ${ex.equipment ? ex.equipment.toUpperCase() : 'SERBEST'}
                    </div>
                    <div style="font-size:11px; color:#334155; margin-top:8px; line-height:1.45; background:#FFFFFF; border:1px solid #E2E8F0; padding:8px 10px; border-radius:6px;">
                        💡 <strong>Nasıl Çalışır?</strong>
                        <br>• <strong>Antrenman olan gün:</strong> Hareketi mevcut seansın sonuna (${ex.name}) olarak ilave eder.
                        <br>• <strong>Dinlenme günü:</strong> O gün dinlenmeden çıkar ve bu hareketle başlayan yeni bir <em>"Takviye Seansı"</em>na dönüşür. (Dinlenmenizi korumak istiyorsanız antrenman olan günleri tercih edebilirsiniz.)
                    </div>
                </div>

                <div style="font-size:11.5px; font-weight:800; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase;">
                    Egzersizin Ekleneceği Günü Seçin:
                </div>
                ${daysHTML}
            `;

            modal.classList.add('active');
        }

        function closeQuickAddToDayModal() {
            const modal = document.getElementById('quickAddToDayModal');
            if (modal) modal.classList.remove('active');
            activeQuickAddExId = null;
        }

        function applyQuickAddExerciseToDay(dayIdx, exId) {
            const selectEl = document.getElementById(`quickAddSetsSelect_${dayIdx}`);
            const targetSets = selectEl ? parseInt(selectEl.value) || 3 : 3;
            const ex = EXERCISES_DB.find(e => e.id === exId);
            const schedule = getWeeklySchedule();
            const plan = schedule[dayIdx];
            const wasRest = !plan || plan.rest;

            const isCardioDur = /^cond_/.test(String(exId || ''));
            let cardioLimits = null;
            if (isCardioDur) {
                const minInput = document.getElementById('cardioTargetMinInput');
                const distInput = document.getElementById('cardioTargetDistInput');
                const hrInput = document.getElementById('cardioTargetHrInput');
                cardioLimits = {
                    durationMin: minInput ? Math.max(0, parseInt(minInput.value, 10) || 0) : 20,
                    distanceMeters: distInput ? Math.max(0, parseInt(distInput.value, 10) || 0) : 0,
                    targetHeartrate: hrInput ? Math.max(0, parseInt(hrInput.value, 10) || 0) : 0
                };
            }
            const finalSets = isCardioDur ? 1 : targetSets;
            const finalReps = isCardioDur
                ? ([
                    cardioLimits.durationMin > 0 ? `${cardioLimits.durationMin} dk` : '',
                    cardioLimits.distanceMeters > 0 ? `${cardioLimits.distanceMeters} m` : '',
                    cardioLimits.targetHeartrate > 0 ? `≥${cardioLimits.targetHeartrate} bpm` : ''
                ].filter(Boolean).join(' • ') || 'Serbest')
                : '8-12';
            const unitSummary = isCardioDur ? finalReps : `${targetSets} set`;
            const ok = addExerciseToDaySchedule(dayIdx, exId, finalSets, finalReps, cardioLimits);
            if (ok && isCardioDur) {
                closeQuickAddToDayModal();
                showToast(`🚣 "${ex ? ex.name : 'Kardiyo'}" (${unitSummary}), ${DAY_NAMES_TR[dayIdx]} gününe 2. Bağımsız Kardiyo Seansı olarak eklendi (Mevcut güç programı korundu)!`);
                if (typeof renderCalendarScreen === 'function') renderCalendarScreen();
                if (typeof renderActiveWorkout === 'function') renderActiveWorkout();
                if (typeof renderAnalytics === 'function') renderAnalytics();
                return;
            }
            if (ok) {
                closeQuickAddToDayModal();
                if (wasRest) {
                    showToast(`⚡ ${DAY_NAMES_TR[dayIdx]} gününe yeni Takviye Antrenmanı açıldı ve "${ex ? ex.name : 'Egzersiz'}" (${unitSummary}) eklendi!`);
                } else {
                    showToast(`✅ "${ex ? ex.name : 'Egzersiz'}", ${DAY_NAMES_TR[dayIdx]} antrenmanının sonuna ${unitSummary} olarak eklendi!`);
                }
                if (typeof renderAnalytics === 'function') {
                    renderAnalytics();
                }
                if (typeof renderWeeklyScheduleView === 'function') {
                    renderWeeklyScheduleView();
                }
            } else {
                alert("Egzersiz eklenirken bir hata oluştu.");
            }
        }

        const MUSCLE_DIAGRAM_DEFS = {
            shoulders: {
                title: 'OMUZ',
                columns: [
                    { key: 'front', label: 'ÖN OMUZ', subKeys: ['shoulders_front'], recId: 'db_overhead_press', recName: 'Dambıl Omuz Presi', keywords: ['ön omuz', 'front delt', 'overhead press', 'omuz pres', 'arnold', 'push press', 'front raise', 'snatch', 'clean'] },
                    { key: 'side', label: 'YAN OMUZ', subKeys: ['shoulders_side'], recId: 'db_lateral_raise', recName: 'Yan Omuz Açış (Lateral Raise)', keywords: ['yan omuz', 'side delt', 'lateral raise', 'high pull', 'upright'] },
                    { key: 'rear', label: 'ARKA OMUZ', subKeys: ['shoulders_rear'], recId: 'mach_face_pull', recName: 'Arka Omuz Çekiş (Face Pull)', keywords: ['arka omuz', 'rear delt', 'face pull', 'halo', 'cuban'] }
                ]
            },
            back: {
                title: 'SIRT & KANAT',
                columns: [
                    { key: 'lats', label: 'KANATLAR (SIRT GENİŞLİĞİ)', subKeys: ['back_lats'], recId: 'mach_lat_pulldown', recName: 'Sırt Çekiş (Lat Pulldown)', keywords: ['kanat', 'lats', 'latissimus', 'pulldown', 'pullup', 'pull-up', 'barfiks', 'chinup', 'chin-up', 'saw row', 'pullover', 'straight arm', 'düz kol'] },
                    { key: 'mid', label: 'ORTA SIRT & KÜREK KEMİĞİ', subKeys: ['back_mid'], recId: 'db_chest_supported_row', recName: 'Göğüs Destekli Sırt Çekiş', keywords: ['orta sırt', 'kürek kemiği', 'rhomboid', 'row', 'kürek', 'pendlay', 'renegade row'] },
                    { key: 'traps', label: 'ÜST SIRT & BOYUN ÇEVRESİ', subKeys: ['traps'], recId: 'db_dumbbell_shrug_burnout', recName: 'Dambıl Trapez Silkme', keywords: ['trapez', 'üst sırt', 'shrug', 'clean', 'farmers', 'high pull'] },
                    { key: 'lower', label: 'ALT SIRT & BEL (OMURGA DESTEK)', subKeys: ['back_lower', 'core_lower'], recId: 'bw_hyperextension', recName: 'Sırt Uzatma (Hiperekstansiyon)', keywords: ['alt sırt', 'bel kas', 'hiperekstansiyon', 'hyperextension', 'back extension', 'good morning', 'rdl', 'deadlift', 'swing', 'gorilla'] }
                ]
            },
            chest: {
                title: 'GÖĞÜS',
                columns: [
                    { key: 'upper', label: 'ÜST GÖĞÜS', subKeys: ['chest_upper'], recId: 'db_incline_press', recName: 'Eğimli Göğüs Presi (Incline)', keywords: ['üst göğüs', 'incline', 'decline pushup', 'decline şınav', 'landmine'] },
                    { key: 'mid', label: 'ORTA GÖĞÜS', subKeys: ['chest_mid'], recId: 'db_bench_press', recName: 'Dambıl Göğüs Presi (Bench)', keywords: ['orta göğüs', 'bench press', 'floor press', 'pushup', 'push-up', 'şınav', 'pec deck', 'crossover', 'fly', 'renegade'] },
                    { key: 'lower', label: 'ALT GÖĞÜS', subKeys: ['chest_lower'], recId: 'bw_dips', recName: 'Paralel Bar Dips', keywords: ['alt göğüs', 'dips', 'crossover alt', 'pullover'] }
                ]
            },
            quads: {
                title: 'ÖN BACAK',
                columns: [
                    { key: 'vastus_lat', label: 'DIŞ ÖN BACAK', subKeys: ['legs_quad_outer'], recId: 'bb_back_squat', recName: 'Çömelme (Squat)', keywords: ['dış ön bacak', 'back squat', 'front squat', 'ön squat', 'goblet squat', 'zercher', 'air squat', 'leg press'] },
                    { key: 'vastus_med', label: 'İÇ ÖN BACAK (DİZ ÜSTÜ)', subKeys: ['legs_quad_inner'], recId: 'db_bulgarian_squat', recName: 'Tek Ayak Çömelme (Bulgar Squat)', keywords: ['iç ön bacak', 'diz üstü', 'bulgar', 'bulgarian', 'lunge', 'step up', 'step-up', 'seesaw'] },
                    { key: 'rectus_fem', label: 'ORTA ÖN BACAK', subKeys: ['legs_quad_mid'], recId: 'mach_leg_extension', recName: 'Ön Bacak Uzatma (Leg Extension)', keywords: ['orta ön bacak', 'leg extension', 'sissy', 'quad izole', 'jump', 'high knees'] }
                ]
            },
            hamstrings: {
                title: 'ARKA BACAK',
                columns: [
                    { key: 'biceps_fem', label: 'ARKA BACAK (DİZ BÜKME)', subKeys: ['legs_ham_curl'], recId: 'mach_leg_curl', recName: 'Arka Bacak Bükme (Leg Curl)', keywords: ['leg curl', 'diz bükme', 'diz büken', 'butt kicks'] },
                    { key: 'semitend', label: 'ARKA BACAK (ÖNE EĞİLME)', subKeys: ['legs_ham_hinge'], recId: 'db_rdl', recName: 'Romen Deadlift (RDL)', keywords: ['öne eğilme', 'dambıl rdl', 'barbell rdl', 'rdl to', 'romanian', 'deadlift', 'inchworm'] },
                    { key: 'hinge_chain', label: 'ARKA BACAK & BEL BAĞLANTISI', subKeys: ['legs_ham_chain'], recId: 'db_swing', recName: 'Kettlebell Savurma (Swing)', keywords: ['swing', 'single leg rdl', 'tek bacak rdl', 'good morning', 'hiperekstansiyon', 'hyperextension'] }
                ]
            },
            glutes: {
                title: 'KALÇA',
                columns: [
                    { key: 'maximus', label: 'ANA KALÇA KASI (GÜÇ & ŞEKİL)', subKeys: ['legs_glutes_max'], recId: 'bb_hip_thrust', recName: 'Kalça Kaldırma (Hip Thrust)', keywords: ['ana kalça', 'hip thrust', 'glute bridge', 'deadlift', 'back squat', 'goblet squat', 'swing'] },
                    { key: 'medius', label: 'YAN KALÇA (TEK AYAK DENGE)', subKeys: ['legs_glutes_med'], recId: 'db_bulgarian_squat', recName: 'Tek Ayak Çömelme (Bulgar Squat)', keywords: ['yan kalça', 'bulgar', 'bulgarian', 'lunge', 'skater', 'lateral shuffle', 'step up', 'step-up'] },
                    { key: 'minimus', label: 'DERİN KALÇA & BEL DENGESİ', subKeys: ['legs_glutes_min'], recId: 'db_single_leg_rdl', recName: 'Tek Bacak RDL', keywords: ['derin kalça', 'single leg rdl', 'tek bacak rdl', 'windmill', 'get-up'] }
                ]
            },
            biceps: {
                title: 'ÖN KOL & PAZI',
                columns: [
                    { key: 'long_head', label: 'PAZI DIŞ KISMI (TEPE)', subKeys: ['biceps_long'], recId: 'db_incline_curl', recName: 'Eğimli Sehpada Dambıl Curl', keywords: ['incline curl', 'biceps dış', 'pazı dış', 'tepe', 'uzun baş'] },
                    { key: 'short_head', label: 'PAZI İÇ KISMI (DOLGUNLUK)', subKeys: ['biceps_short'], recId: 'bb_biceps_curl', recName: 'Bar / Dambıl Pazı Bükme (Curl)', keywords: ['biceps iç', 'pazı iç', 'dolgunluk', 'biceps curl', 'barbell curl', 'cable curl', 'concentration', 'preacher'] },
                    { key: 'brachialis', label: 'ÖN KOL & BİLEK (TUTUŞ GÜCÜ)', subKeys: ['brachialis', 'forearms'], recId: 'db_hammer_curl', recName: 'Çekiç Tutuş Curl (Hammer Curl)', keywords: ['hammer', 'chinup', 'chin-up', 'ön kol', 'kavrama', 'biceps altı dış', 'brachialis', 'farmers', 'suitcase', 'carry'] }
                ]
            },
            triceps: {
                title: 'ARKA KOL',
                columns: [
                    { key: 'long', label: 'ARKA KOL İÇ / UZUN KISIM', subKeys: ['triceps_long'], recId: 'db_triceps_overhead', recName: 'Başüstü Arka Kol Uzatma', keywords: ['başüstü', 'overhead triceps', 'triceps overhead', 'skullcrusher', 'french', 'uzun kısım', 'uzun baş', 'pullover'] },
                    { key: 'lateral', label: 'ARKA KOL DIŞ KISIM', subKeys: ['triceps_lateral'], recId: 'mach_triceps_pushdown', recName: 'Kablo ile Aşağı İtiş (Pushdown)', keywords: ['pushdown', 'dış kısım', 'close grip', 'dar tutuş', 'cable triceps', 'kickback'] },
                    { key: 'medial', label: 'ARKA KOL ALT KISIM (İTİŞ GÜCÜ)', subKeys: ['triceps_medial'], recId: 'bw_diamond_pushup', recName: 'Elmas Şınav / Dips', keywords: ['alt kısım', 'dips', 'diamond', 'elmas', 'bench press', 'şınav', 'push-up', 'omuz pres', 'thruster'] }
                ]
            },
            core: {
                title: 'KARIN & BEL ÇEVRESİ',
                columns: [
                    { key: 'rectus', label: 'ÖN KARIN (ÜST & ALT KARIN)', subKeys: ['core_front'], recId: 'bw_hanging_knee_raise', recName: 'Barda Dize Çekme', keywords: ['ön karın', 'üst karın', 'alt karın', 'hanging', 'knee raise', 'leg raise', 'hollow', 'crunch', 'mountain'] },
                    { key: 'obliques', label: 'YAN KARIN (BEL YANLARI & DÖNÜŞ)', subKeys: ['core_obliques'], recId: 'db_russian_twist', recName: 'Sağa-Sola Dönüş (Russian Twist)', keywords: ['yan karın', 'twist', 'woodchopper', 'oduncu', 'suitcase', 'oblik', 'renegade', 'chop', 'windmill'] },
                    { key: 'transverse', label: 'DERİN KARIN (GÖVDE & BEL KORUMA)', subKeys: ['core_deep'], recId: 'db_farmers_walk', recName: 'Ağırlıkla Yürüyüş (Farmers Walk)', keywords: ['derin iç karın', 'derin karın', 'plank', 'farmers', 'carry', 'bear crawl', 'stabilite', 'zırh', 'get-up'] }
                ]
            },
            calves: {
                title: 'BALDIR & ALT BACAK',
                columns: [
                    { key: 'gastrocnemius', label: 'ÜST BALDIR (AYAKTA PARMAK UCU)', subKeys: ['calves_gastroc'], recId: 'mach_calf_raise', recName: 'Ayakta Baldır Kaldırma (Calf Raise)', keywords: ['üst baldır', 'standing calf', 'calf raise', 'ayakta kalf', 'zıplama', 'jump'] },
                    { key: 'soleus', label: 'ALT BALDIR (OTURARAK)', subKeys: ['calves_soleus'], recId: 'db_standing_calf_raise', recName: 'Dambıl Baldır Kaldırma', keywords: ['alt baldır', 'seated calf', 'oturarak baldır'] },
                    { key: 'tibialis', label: 'ÖN KAVAL KEMİĞİ & BİLEK', subKeys: ['calves_tibialis'], recId: 'bw_jump_rope', recName: 'İp Atlama (Jump Rope)', keywords: ['ön kaval', 'ayak bileği', 'ankling', 'kaval', 'ip atlama', 'jump rope'] }
                ]
            }
        };

        function getExerciseCompartmentWeightsForMuscle(muscleId, exNameOrId, allowFallback = true) {
            const def = MUSCLE_DIAGRAM_DEFS[muscleId];
            if (!def) return [];

            const rawQ = normSearchText(exNameOrId);
            const cleanQ = rawQ.split('(')[0].trim();

            const dbEx = (typeof EXERCISES_DB !== 'undefined' && Array.isArray(EXERCISES_DB))
                ? (EXERCISES_DB.find(e => normSearchText(e.id) === rawQ || normSearchText(e.name) === rawQ)
                    || EXERCISES_DB.find(e => normSearchText((e.name || '').split('(')[0].trim()) === cleanQ && cleanQ.length >= 4)
                    || EXERCISES_DB.find(e => {
                        if (!e.name) return false;
                        const eLower = normSearchText(e.name);
                        const eBase = eLower.split('(')[0].trim();
                        return (cleanQ.length >= 4 && (eLower.includes(cleanQ) || (eBase.length >= 4 && rawQ.includes(eBase))));
                    }))
                : null;
            const exId = dbEx ? dbEx.id : exNameOrId;
            const anat = (typeof EXERCISE_ANATOMY_MAP !== 'undefined') ? EXERCISE_ANATOMY_MAP[exId] : null;

            // Doğrulanmış SSOT alt kas haritası varsa anahtar kelime tahminine girmeden %100 kesin eşleştir
            if (anat && Array.isArray(anat.primarySubKeys)) {
                const pSet = new Set(anat.primarySubKeys);
                const sSet = new Set(Array.isArray(anat.secondarySubKeys) ? anat.secondarySubKeys : []);
                const primCols = [];
                const secCols = [];

                for (const col of def.columns) {
                    const colKeys = col.subKeys || [];
                    if (colKeys.some(sk => pSet.has(sk))) {
                        primCols.push(col.key);
                    } else if (colKeys.some(sk => sSet.has(sk))) {
                        secCols.push(col.key);
                    }
                }

                // 1) Bu kas grubu hareketin 1. derece ana hedefiyse: ana alt bölgeler 1.0x, aynı grup içindeki yardımcı başlar 0.35x alır
                if (primCols.length > 0) {
                    return [
                        ...primCols.map(key => ({ key, weight: 1.0, tier: 'primary' })),
                        ...secCols.map(key => ({ key, weight: 0.35, tier: 'secondary' }))
                    ];
                }
                // 2) Bu kas grubu hareketin 2. derece yardımcı kasıysa (gelen set zaten yardımcı katsayısıyla çarpılmıştır): ilgili alt bölgeler 1.0x alır
                if (secCols.length > 0) {
                    return secCols.map(key => ({ key, weight: 1.0, tier: 'secondary' }));
                }
                // 3) Bu kas grubunda hiçbir alt bölge çalışmıyorsa sızıntı yapma
                if (allowFallback) {
                    return [{ key: def.columns[0].key, weight: 1.0, tier: 'fallback' }];
                }
                return [];
            }

            // Yalnızca katalog dışı (kullanıcının elle yazdığı özel) hareketler için yedek anahtar kelime çözümlemesi
            const nameAndPrimaryText = normSearchText([
                exNameOrId || '',
                dbEx ? dbEx.name : '',
                dbEx ? (dbEx.primarySubMuscles || '') : '',
                anat ? (anat.primary || '') : ''
            ].join(' '));

            const secondaryOnlyText = normSearchText([
                dbEx ? (dbEx.secondarySubMuscles || '') : '',
                anat ? (anat.secondary || '') : ''
            ].join(' '));

            const matched = new Set();
            for (const col of def.columns) {
                for (const kw of col.keywords) {
                    if (nameAndPrimaryText.includes(normSearchText(kw))) {
                        matched.add(col.key);
                        break;
                    }
                }
            }
            if (matched.size === 0) {
                for (const col of def.columns) {
                    for (const kw of col.keywords) {
                        if (secondaryOnlyText.includes(normSearchText(kw))) {
                            matched.add(col.key);
                            break;
                        }
                    }
                }
            }
            if (matched.size === 0 && allowFallback) {
                matched.add(def.columns[0].key);
            }
            return Array.from(matched).map(key => ({ key, weight: 1.0, tier: 'primary' }));
        }

        function getExerciseCompartmentsForMuscle(muscleId, exNameOrId, allowFallback = true) {
            return getExerciseCompartmentWeightsForMuscle(muscleId, exNameOrId, allowFallback).map(item => item.key);
        }

        function getExerciseCompartmentForMuscle(muscleId, exNameOrId, allowFallback = true) {
            const list = getExerciseCompartmentsForMuscle(muscleId, exNameOrId, allowFallback);
            return list.length > 0 ? list[0] : null;
        }

        function computeMuscleCompartmentMap(m) {
            const def = MUSCLE_DIAGRAM_DEFS[m.id];
            if (!def) return null;

            const compMap = {};
            def.columns.forEach(col => {
                compMap[col.key] = {
                    col,
                    earnedSets: 0,
                    plannedCount: 0,
                    doneExs: new Set(),
                    plannedExs: new Set()
                };
            });

            const mode = (typeof currentWeeklyMuscleSource !== 'undefined') ? currentWeeklyMuscleSource : 'week_projected';
            const isTemplateMode = (mode === 'schedule_full');
            const includeDone = !isTemplateMode;
            const includePlan = (mode !== 'week_done');

            if (includeDone) {
                (m.contributions || []).forEach(c => {
                    const weightedCols = getExerciseCompartmentWeightsForMuscle(m.id, c.exercise, true);
                    weightedCols.forEach(item => {
                        if (compMap[item.key]) {
                            const factor = (c.role === 'Yardımcı Kas') ? 1.0 : item.weight;
                            compMap[item.key].earnedSets += (Number(c.earnedSets) || 0) * factor;
                            compMap[item.key].doneExs.add(c.exercise);
                        }
                    });
                });

                if ((!m.contributions || m.contributions.length === 0) && m.doneExercises && Array.isArray(m.doneExercises)) {
                    m.doneExercises.forEach(exName => {
                        const weightedCols = getExerciseCompartmentWeightsForMuscle(m.id, exName, true);
                        weightedCols.forEach(item => {
                            if (compMap[item.key]) {
                                compMap[item.key].doneExs.add(exName);
                                if (compMap[item.key].earnedSets === 0) compMap[item.key].earnedSets = item.weight;
                            }
                        });
                    });
                }
            }

            if (includePlan) {
                (m.plannedExercises || []).forEach(pe => {
                    const weightedCols = getExerciseCompartmentWeightsForMuscle(m.id, pe.name, true);
                    weightedCols.forEach(item => {
                        if (compMap[item.key]) {
                            if (isTemplateMode) {
                                const factor = (pe.role === 'Yardımcı Kas') ? 1.0 : item.weight;
                                compMap[item.key].earnedSets += (Number(pe.sets) || 3) * factor;
                                compMap[item.key].doneExs.add(pe.name);
                            } else {
                                compMap[item.key].plannedCount += 1;
                                compMap[item.key].plannedExs.add(pe.name);
                            }
                        }
                    });
                });
            }

            return compMap;
        }

        function renderMuscleCompartmentDiagram(m) {
            const def = MUSCLE_DIAGRAM_DEFS[m.id];
            if (!def) return '';
            const compMap = computeMuscleCompartmentMap(m);
            if (!compMap) return '';

            const numBadges = ['①', '②', '③', '④'];
            const headerNumText = def.columns.map((_, i) => numBadges[i] || (i + 1)).join(' ');

            const columnsHTML = def.columns.map((col, idx) => {
                const data = compMap[col.key];
                const isDone = data.earnedSets > 0;
                const isPlanned = !isDone && data.plannedExs.size > 0;
                const numIcon = numBadges[idx] || (idx + 1);

                let statusBadge = '';
                let contentHTML = '';
                let cellBg = 'rgba(255,255,255,0.02)';
                let cellBorder = '1px solid rgba(255,255,255,0.07)';

                if (isDone) {
                    cellBg = '#F0FDF4';
                    cellBorder = '1px solid #86EFAC';
                    statusBadge = `<span style="display:inline-block; font-size:11px; font-weight:800; color:#15803D; background:#DCFCE7; border:1px solid #86EFAC; border-radius:6px; padding:2px 7px;">${data.earnedSets.toFixed(1)} Set</span>`;
                    const exList = Array.from(data.doneExs).map(escapeHTML).join(', ');
                    const planList = data.plannedExs.size > 0 ? `<div style="font-size:11px; color:#B45309; margin-top:3px; font-weight:700;">+ ${Array.from(data.plannedExs).map(escapeHTML).join(', ')} (Planda)</div>` : '';
                    contentHTML = `<div style="font-size:11.5px; color:#1E293B; margin-top:5px; line-height:1.35;"><strong>${exList}</strong>${planList}</div>`;
                } else if (isPlanned) {
                    cellBg = '#FFFBEB';
                    cellBorder = '1px solid #FCD34D';
                    statusBadge = `<span style="display:inline-block; font-size:11px; font-weight:800; color:#B45309; background:#FEF3C7; border:1px solid #FCD34D; border-radius:6px; padding:2px 7px;">Planda (${data.plannedCount} Hrk)</span>`;
                    const planList = Array.from(data.plannedExs).map(escapeHTML).join(', ');
                    contentHTML = `<div style="font-size:11.5px; color:#92400E; margin-top:5px; line-height:1.35; font-weight:600;">${planList}</div>`;
                } else {
                    cellBg = '#FEF2F2';
                    cellBorder = '1px solid #FECACA';
                    statusBadge = `<span style="display:inline-block; font-size:11px; font-weight:800; color:#B91C1C; background:#FEE2E2; border:1px solid #FCA5A5; border-radius:6px; padding:2px 7px;">0 Set (Boşta)</span>`;
                    contentHTML = `
                        <div style="margin-top:6px;">
                            <button class="btn btn-outline" style="font-size:11px; padding:6px 8px; border-radius:6px; color:#DC2626; border-color:#FECACA; width:100%; text-align:center; font-weight:800; background:#FFFFFF;" onclick="openQuickAddToDayModal('${col.recId}')" title="Bu başı çalıştırmak için ${col.recName} ekle">
                                + ${escapeHTML(col.recName)} Ekle
                            </button>
                        </div>
                    `;
                }

                const isSubFocused = (typeof currentSelectedAnatomySubKey !== 'undefined' && currentSelectedAnatomySubKey === col.key);
                const focusRing = isSubFocused ? 'box-shadow: 0 0 0 2.5px #0F172A;' : '';

                return `
                    <div id="anatomy_subcol_${m.id}_${col.key}" style="background:${cellBg}; border:${cellBorder}; ${focusRing} border-radius:8px; padding:10px; display:flex; flex-direction:column; justify-content:space-between; transition:box-shadow 0.2s ease;">
                        <div>
                            <div style="font-size:11.5px; font-weight:900; color:#0F172A; margin-bottom:5px; letter-spacing:0.2px; display:flex; align-items:center; gap:5px;">
                                <span style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:${isSubFocused ? '#2563EB' : '#0F172A'}; color:#FFFFFF; font-size:11px; font-weight:900; flex-shrink:0;">${idx + 1}</span>
                                <span>${escapeHTML(col.label)}</span>
                            </div>
                            <div>${statusBadge}</div>
                        </div>
                        ${contentHTML}
                    </div>
                `;
            }).join('');

            return `
                <div style="margin-top:12px; border:1.5px solid #E2E8F0; border-radius:14px; overflow:hidden; background:#FFFFFF;">
                    <div style="background:#F1F5F9; border-bottom:1.5px solid #E2E8F0; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:11.5px; font-weight:900; letter-spacing:0.5px; color:#0F172A; text-transform:uppercase;">
                            ${escapeHTML(def.title)} — HANGİ ALT BÖLGELER ÇALIŞTI?
                        </span>
                        <span style="font-size:11px; color:#475569; font-weight:800;">
                            Şekildeki ${headerNumText} Numaralı Alt Kaslar
                        </span>
                    </div>
                    <div style="padding:10px; display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:8px;">
                        ${columnsHTML}
                    </div>
                </div>
            `;
        }

        const ANATOMY_MUSCLE_PATHS = {"chest":"M 165.0 570.5 L 139.0 566.5 L 118.0 551.5 L 99.5 528.0 L 88.5 503.0 L 92.5 487.0 L 116.5 453.0 L 140.0 434.5 L 153.0 429.5 L 186.0 431.5 L 207.0 437.5 L 217.5 447.0 L 223.5 464.0 L 223.5 533.0 L 220.5 543.0 L 211.0 555.5 L 197.0 564.5 L 165.0 570.5 Z M 295.0 569.5 L 280.0 569.5 L 254.0 563.5 L 242.0 556.5 L 230.5 541.0 L 227.5 528.0 L 228.5 462.0 L 234.5 446.0 L 248.0 435.5 L 291.0 429.5 L 307.0 431.5 L 319.0 438.5 L 337.5 455.0 L 363.5 494.0 L 364.5 503.0 L 360.5 514.0 L 340.5 545.0 L 319.0 563.5 L 295.0 569.5 Z","shoulders":"M 40.0 546.5 L 36.5 542.0 L 31.5 522.0 L 29.5 489.0 L 34.5 469.0 L 41.5 455.0 L 58.0 437.5 L 77.0 427.5 L 85.0 425.5 L 97.5 427.0 L 89.0 430.5 L 89.0 432.5 L 108.0 426.5 L 128.0 428.5 L 131.5 434.0 L 130.5 439.0 L 110.5 459.0 L 82.5 501.0 L 50.0 533.5 L 46.5 507.0 L 44.5 506.0 L 44.5 541.0 L 40.0 546.5 Z M 412.0 545.5 L 406.5 539.0 L 408.5 537.0 L 407.5 506.0 L 404.5 526.0 L 401.0 533.5 L 367.5 499.0 L 342.5 460.0 L 324.5 441.0 L 321.5 435.0 L 323.0 429.5 L 332.0 426.5 L 353.0 429.5 L 356.5 429.0 L 354.0 425.5 L 370.0 426.5 L 389.0 434.5 L 405.5 449.0 L 417.5 470.0 L 422.5 490.0 L 421.5 516.0 L 416.5 538.0 L 412.0 545.5 Z M 712.0 532.5 L 706.5 509.0 L 708.5 482.0 L 718.5 457.0 L 734.0 439.5 L 754.0 431.5 L 760.5 433.0 L 756.0 437.5 L 766.0 433.5 L 779.0 432.5 L 796.0 439.5 L 803.5 446.0 L 804.5 452.0 L 792.5 468.0 L 762.0 498.5 L 731.0 516.5 L 717.0 527.5 L 718.0 511.5 L 712.0 532.5 Z M 1090.0 531.5 L 1083.0 510.5 L 1085.0 526.5 L 1042.0 499.5 L 1028.0 487.5 L 1000.5 455.0 L 998.5 452.0 L 999.5 446.0 L 1015.0 436.5 L 1028.0 432.5 L 1045.0 435.5 L 1046.0 431.5 L 1051.0 431.5 L 1071.0 441.5 L 1086.5 462.0 L 1094.5 483.0 L 1096.5 502.0 L 1090.0 531.5 Z","biceps":"M 410.0 657.5 L 401.0 655.5 L 384.5 641.0 L 372.5 620.0 L 362.5 589.0 L 359.5 570.0 L 360.5 546.0 L 366.5 526.0 L 375.0 519.5 L 384.0 521.5 L 399.5 532.0 L 405.5 540.0 L 404.5 542.0 L 409.5 546.0 L 412.0 558.5 L 418.5 554.0 L 416.5 543.0 L 420.0 538.5 L 425.5 547.0 L 431.5 566.0 L 432.5 600.0 L 435.5 618.0 L 431.5 620.0 L 430.0 633.5 L 427.5 627.0 L 426.5 603.0 L 421.0 585.5 L 423.5 599.0 L 423.5 631.0 L 419.5 646.0 L 410.0 657.5 Z M 38.0 653.5 L 29.5 630.0 L 28.5 603.0 L 38.5 563.0 L 44.5 549.0 L 50.5 543.0 L 51.5 536.0 L 67.0 523.5 L 75.0 522.5 L 74.5 529.0 L 77.0 531.5 L 85.0 529.5 L 88.5 538.0 L 91.5 557.0 L 88.5 588.0 L 75.5 626.0 L 64.5 643.0 L 53.0 650.5 L 38.0 653.5 Z M 22.0 634.5 L 19.5 621.0 L 14.0 626.5 L 12.5 622.0 L 18.5 605.0 L 17.5 579.0 L 19.5 566.0 L 23.5 552.0 L 32.0 535.5 L 36.5 543.0 L 34.5 554.0 L 37.5 557.0 L 37.5 563.0 L 25.5 608.0 L 25.5 632.0 L 22.0 634.5 Z M 460.0 664.0 L 463.0 670.0 L 465.0 676.0 L 467.0 682.0 L 469.0 688.0 L 470.0 694.0 L 472.0 700.0 L 473.0 706.0 L 472.0 712.0 L 472.0 718.0 L 472.0 724.0 L 473.0 730.0 L 473.0 736.0 L 470.0 742.0 L 470.0 748.0 L 471.0 754.0 L 472.0 760.0 L 473.0 766.0 L 474.0 772.0 L 475.0 778.0 L 476.0 784.0 L 478.0 790.0 L 479.0 796.0 L 481.0 802.0 L 483.0 808.0 L 484.0 814.0 L 483.0 814.0 L 481.0 808.0 L 476.0 802.0 L 475.0 796.0 L 476.0 790.0 L 474.0 784.0 L 471.0 778.0 L 469.0 772.0 L 467.0 766.0 L 466.0 760.0 L 464.0 754.0 L 464.0 748.0 L 463.0 742.0 L 463.0 736.0 L 462.0 730.0 L 462.0 724.0 L 462.0 718.0 L 462.0 712.0 L 462.0 706.0 L 462.0 700.0 L 462.0 694.0 L 462.0 688.0 L 461.0 682.0 L 460.0 676.0 L 459.0 670.0 L 460.0 664.0 Z M 402.0 670.0 L 405.0 673.0 L 409.0 676.0 L 411.0 679.0 L 414.0 682.0 L 416.0 685.0 L 418.0 688.0 L 419.0 691.0 L 420.0 694.0 L 421.0 697.0 L 422.0 700.0 L 423.0 703.0 L 424.0 706.0 L 424.0 709.0 L 424.0 712.0 L 424.0 715.0 L 424.0 718.0 L 425.0 721.0 L 425.0 724.0 L 426.0 727.0 L 428.0 730.0 L 430.0 733.0 L 431.0 736.0 L 432.0 739.0 L 431.0 742.0 L 431.0 744.0 L 431.0 744.0 L 431.0 742.0 L 430.0 739.0 L 429.0 736.0 L 428.0 733.0 L 426.0 730.0 L 424.0 727.0 L 423.0 724.0 L 422.0 721.0 L 421.0 718.0 L 420.0 715.0 L 418.0 712.0 L 417.0 709.0 L 415.0 706.0 L 414.0 703.0 L 413.0 700.0 L 411.0 697.0 L 410.0 694.0 L 408.0 691.0 L 407.0 688.0 L 406.0 685.0 L 405.0 682.0 L 404.0 679.0 L 403.0 676.0 L 402.0 673.0 L 402.0 670.0 Z M 50.0 674.0 L 50.0 677.0 L 50.0 680.0 L 47.0 683.0 L 46.0 686.0 L 44.0 689.0 L 43.0 692.0 L 41.0 695.0 L 40.0 698.0 L 38.0 701.0 L 38.0 704.0 L 36.0 707.0 L 35.0 710.0 L 34.0 713.0 L 33.0 716.0 L 31.0 719.0 L 30.0 722.0 L 29.0 725.0 L 28.0 728.0 L 27.0 731.0 L 25.0 734.0 L 24.0 737.0 L 23.0 740.0 L 21.0 743.0 L 20.0 746.0 L 20.0 747.0 L 19.0 747.0 L 19.0 746.0 L 20.0 743.0 L 20.0 740.0 L 21.0 737.0 L 22.0 734.0 L 23.0 731.0 L 23.0 728.0 L 24.0 725.0 L 25.0 722.0 L 26.0 719.0 L 27.0 716.0 L 27.0 713.0 L 27.0 710.0 L 23.0 707.0 L 24.0 704.0 L 25.0 701.0 L 29.0 698.0 L 30.0 695.0 L 32.0 692.0 L 33.0 689.0 L 34.0 686.0 L 36.0 683.0 L 39.0 680.0 L 43.0 677.0 L 50.0 674.0 Z","core":"M 279.0 614.5 L 254.0 604.5 L 231.5 601.0 L 227.5 588.0 L 227.5 573.0 L 228.5 567.0 L 234.0 559.5 L 239.0 558.5 L 249.0 561.5 L 269.0 570.5 L 277.5 578.0 L 283.5 599.0 L 279.0 614.5 Z M 177.0 614.5 L 174.0 614.5 L 169.5 607.0 L 169.5 590.0 L 175.5 577.0 L 181.0 571.5 L 207.0 560.5 L 220.0 560.5 L 224.5 572.0 L 224.5 588.0 L 221.5 599.0 L 218.0 602.5 L 206.0 602.5 L 196.0 605.5 L 177.0 614.5 Z M 249.0 826.5 L 249.5 820.0 L 272.5 763.0 L 282.5 749.0 L 280.5 744.0 L 281.5 721.0 L 284.5 699.0 L 290.5 685.0 L 285.5 680.0 L 286.5 655.0 L 293.5 642.0 L 286.5 643.0 L 285.5 619.0 L 287.5 606.0 L 297.5 599.0 L 291.0 601.5 L 285.5 599.0 L 284.5 578.0 L 291.0 571.5 L 314.0 567.5 L 314.5 577.0 L 304.5 592.0 L 309.0 590.5 L 316.0 580.5 L 322.5 583.0 L 317.5 598.0 L 323.5 601.0 L 321.5 619.0 L 324.5 621.0 L 324.5 627.0 L 316.5 648.0 L 324.0 632.5 L 325.5 676.0 L 323.5 683.0 L 325.5 682.0 L 326.5 687.0 L 326.5 711.0 L 317.5 735.0 L 302.5 749.0 L 304.5 752.0 L 298.5 763.0 L 265.5 810.0 L 249.0 826.5 Z M 201.0 824.5 L 178.5 799.0 L 149.5 758.0 L 143.5 745.0 L 133.5 737.0 L 125.5 715.0 L 124.5 702.0 L 128.5 662.0 L 127.5 621.0 L 131.5 622.0 L 128.5 601.0 L 135.5 597.0 L 133.5 584.0 L 136.0 580.5 L 140.5 588.0 L 145.5 590.0 L 137.5 577.0 L 138.0 568.5 L 164.0 572.5 L 168.5 577.0 L 166.5 597.0 L 158.5 600.0 L 165.5 609.0 L 166.5 618.0 L 166.5 635.0 L 165.5 640.0 L 162.5 642.0 L 166.5 658.0 L 166.5 681.0 L 162.5 685.0 L 168.5 702.0 L 171.5 735.0 L 169.5 749.0 L 178.5 761.0 L 190.5 796.0 L 200.5 817.0 L 201.0 824.5 Z M 180.0 654.5 L 175.0 654.5 L 169.5 647.0 L 169.5 627.0 L 172.5 621.0 L 179.0 615.5 L 203.0 605.5 L 220.0 605.5 L 224.5 616.0 L 224.5 642.0 L 222.5 648.0 L 218.0 652.5 L 180.0 654.5 Z M 276.0 654.5 L 234.0 652.5 L 229.5 648.0 L 227.5 616.0 L 229.5 608.0 L 233.0 604.5 L 250.0 605.5 L 266.0 611.5 L 279.5 620.0 L 283.5 633.0 L 283.5 644.0 L 280.5 651.0 L 276.0 654.5 Z M 308.5 628.0 L 317.0 613.5 L 314.5 621.0 L 308.5 628.0 Z M 220.0 832.5 L 208.5 827.0 L 199.5 811.0 L 174.5 733.0 L 174.5 705.0 L 185.5 703.0 L 178.0 700.5 L 170.5 690.0 L 170.5 664.0 L 175.0 657.5 L 179.0 656.5 L 214.0 654.5 L 220.0 656.5 L 223.5 664.0 L 223.5 695.0 L 220.5 702.0 L 214.0 705.5 L 186.5 703.0 L 201.0 707.5 L 220.0 707.5 L 223.5 715.0 L 224.5 823.0 L 220.0 832.5 Z M 237.0 832.5 L 232.0 832.5 L 227.5 825.0 L 228.5 714.0 L 233.0 707.5 L 256.0 707.5 L 267.5 704.0 L 233.5 704.0 L 228.5 696.0 L 228.5 664.0 L 236.0 654.5 L 273.0 656.5 L 280.5 661.0 L 282.5 674.0 L 280.5 693.0 L 272.5 702.0 L 278.5 706.0 L 279.5 712.0 L 277.5 732.0 L 255.5 803.0 L 246.5 822.0 L 237.0 832.5 Z","quads":"M 298.0 1083.5 L 291.0 1082.5 L 283.5 1075.0 L 275.5 1060.0 L 267.5 1037.0 L 265.5 1009.0 L 274.5 940.0 L 278.5 922.0 L 281.5 918.0 L 279.5 905.0 L 284.5 870.0 L 300.5 806.0 L 304.5 770.0 L 310.0 765.5 L 314.5 770.0 L 332.5 811.0 L 339.5 862.0 L 337.5 831.0 L 342.0 827.5 L 346.5 833.0 L 348.5 842.0 L 350.5 842.0 L 354.5 850.0 L 362.5 871.0 L 369.5 920.0 L 369.5 989.0 L 366.5 1012.0 L 361.5 1028.0 L 347.5 1050.0 L 344.5 1059.0 L 338.0 1060.5 L 328.5 1047.0 L 325.5 1014.0 L 339.5 956.0 L 340.5 938.0 L 329.5 988.0 L 323.5 1003.0 L 320.0 1004.5 L 310.5 990.0 L 289.5 932.0 L 283.5 923.0 L 313.5 1003.0 L 317.5 1024.0 L 314.5 1062.0 L 304.5 1078.0 L 298.0 1083.5 Z M 113.0 1060.5 L 106.5 1057.0 L 98.5 1044.0 L 88.5 1024.0 L 84.5 1008.0 L 82.5 994.0 L 83.5 909.0 L 88.5 877.0 L 94.5 857.0 L 111.0 826.5 L 115.5 829.0 L 115.5 842.0 L 122.5 805.0 L 135.5 775.0 L 141.0 767.5 L 145.0 767.5 L 148.5 772.0 L 153.5 817.0 L 167.5 876.0 L 169.0 859.5 L 175.5 861.0 L 179.5 872.0 L 190.5 944.0 L 191.5 986.0 L 188.0 987.5 L 184.5 980.0 L 172.0 893.5 L 171.5 909.0 L 168.5 919.0 L 140.5 993.0 L 133.0 1005.5 L 128.5 1005.0 L 122.5 990.0 L 112.5 942.0 L 115.5 973.0 L 125.5 1011.0 L 123.5 1046.0 L 118.5 1056.0 L 113.0 1060.5 Z M 261.0 993.5 L 260.5 940.0 L 270.5 874.0 L 273.5 860.0 L 277.0 855.5 L 281.5 865.0 L 281.5 878.0 L 265.5 989.0 L 264.0 991.5 L 262.0 989.5 L 261.0 993.5 Z M 159.0 1084.5 L 154.0 1083.5 L 146.5 1076.0 L 138.5 1062.0 L 134.5 1025.0 L 138.5 1004.0 L 169.5 922.0 L 172.0 920.5 L 184.5 993.0 L 185.5 1022.0 L 178.5 1054.0 L 173.5 1065.0 L 159.0 1084.5 Z M 158.0 774.0 L 162.0 780.0 L 167.0 786.0 L 165.0 792.0 L 176.0 798.0 L 180.0 804.0 L 185.0 810.0 L 180.0 816.0 L 180.0 822.0 L 180.0 828.0 L 179.0 834.0 L 179.0 840.0 L 179.0 846.0 L 179.0 852.0 L 180.0 858.0 L 180.0 864.0 L 181.0 870.0 L 182.0 876.0 L 183.0 882.0 L 183.0 888.0 L 184.0 894.0 L 185.0 900.0 L 186.0 906.0 L 186.0 912.0 L 187.0 918.0 L 187.0 921.0 L 187.0 921.0 L 187.0 918.0 L 186.0 912.0 L 185.0 906.0 L 184.0 900.0 L 183.0 894.0 L 183.0 888.0 L 182.0 882.0 L 182.0 876.0 L 179.0 870.0 L 179.0 864.0 L 177.0 858.0 L 176.0 852.0 L 174.0 846.0 L 172.0 840.0 L 170.0 834.0 L 169.0 828.0 L 168.0 822.0 L 167.0 816.0 L 166.0 810.0 L 165.0 804.0 L 164.0 798.0 L 163.0 792.0 L 162.0 786.0 L 161.0 780.0 L 158.0 774.0 Z M 287.0 789.0 L 287.0 792.0 L 287.0 795.0 L 287.0 798.0 L 287.0 801.0 L 287.0 804.0 L 286.0 807.0 L 286.0 810.0 L 286.0 813.0 L 285.0 816.0 L 285.0 819.0 L 284.0 822.0 L 284.0 825.0 L 283.0 828.0 L 283.0 831.0 L 282.0 834.0 L 282.0 837.0 L 281.0 840.0 L 280.0 843.0 L 279.0 846.0 L 278.0 849.0 L 277.0 852.0 L 275.0 855.0 L 274.0 858.0 L 273.0 859.0 L 273.0 859.0 L 273.0 858.0 L 274.0 855.0 L 274.0 852.0 L 272.0 849.0 L 272.0 846.0 L 272.0 843.0 L 272.0 840.0 L 272.0 837.0 L 271.0 834.0 L 270.0 831.0 L 270.0 828.0 L 269.0 825.0 L 268.0 822.0 L 267.0 819.0 L 266.0 816.0 L 265.0 813.0 L 285.0 810.0 L 285.0 807.0 L 285.0 804.0 L 286.0 801.0 L 286.0 798.0 L 286.0 795.0 L 286.0 792.0 L 286.0 789.0 Z M 206.0 841.0 L 208.0 845.0 L 210.0 849.0 L 212.0 853.0 L 217.0 857.0 L 221.0 861.0 L 203.0 865.0 L 202.0 869.0 L 202.0 873.0 L 201.0 877.0 L 201.0 881.0 L 200.0 885.0 L 199.0 889.0 L 199.0 893.0 L 198.0 897.0 L 198.0 901.0 L 197.0 905.0 L 196.0 909.0 L 196.0 913.0 L 196.0 917.0 L 195.0 921.0 L 195.0 925.0 L 194.0 929.0 L 194.0 933.0 L 194.0 937.0 L 193.0 941.0 L 193.0 944.0 L 193.0 944.0 L 193.0 941.0 L 193.0 937.0 L 192.0 933.0 L 193.0 929.0 L 193.0 925.0 L 193.0 921.0 L 194.0 917.0 L 194.0 913.0 L 194.0 909.0 L 195.0 905.0 L 195.0 901.0 L 196.0 897.0 L 197.0 893.0 L 198.0 889.0 L 198.0 885.0 L 199.0 881.0 L 199.0 877.0 L 200.0 873.0 L 201.0 869.0 L 201.0 865.0 L 202.0 861.0 L 202.0 857.0 L 204.0 853.0 L 203.0 849.0 L 207.0 845.0 L 206.0 841.0 Z M 250.0 845.0 L 250.0 849.0 L 250.0 853.0 L 250.0 857.0 L 250.0 861.0 L 251.0 865.0 L 251.0 869.0 L 251.0 873.0 L 252.0 877.0 L 252.0 881.0 L 253.0 885.0 L 253.0 889.0 L 254.0 893.0 L 254.0 897.0 L 255.0 901.0 L 256.0 905.0 L 256.0 909.0 L 257.0 913.0 L 257.0 917.0 L 258.0 921.0 L 258.0 925.0 L 258.0 929.0 L 259.0 933.0 L 259.0 937.0 L 259.0 941.0 L 258.0 945.0 L 258.0 945.0 L 258.0 941.0 L 257.0 937.0 L 257.0 933.0 L 257.0 929.0 L 256.0 925.0 L 256.0 921.0 L 256.0 917.0 L 255.0 913.0 L 254.0 909.0 L 254.0 905.0 L 253.0 901.0 L 253.0 897.0 L 252.0 893.0 L 251.0 889.0 L 251.0 885.0 L 250.0 881.0 L 250.0 877.0 L 251.0 873.0 L 250.0 869.0 L 249.0 865.0 L 249.0 861.0 L 248.0 857.0 L 248.0 853.0 L 250.0 849.0 L 250.0 845.0 Z","calves":"M 119.0 1337.5 L 114.0 1334.5 L 108.0 1335.5 L 106.5 1333.0 L 98.5 1282.0 L 93.5 1214.0 L 93.5 1168.0 L 100.0 1121.5 L 107.5 1127.0 L 119.5 1183.0 L 122.5 1188.0 L 119.0 1337.5 Z M 319.0 1356.5 L 317.5 1349.0 L 320.0 1338.5 L 321.5 1353.0 L 319.0 1356.5 Z M 352.0 1359.5 L 349.5 1352.0 L 351.0 1340.5 L 353.5 1353.0 L 352.0 1359.5 Z M 1005.0 1343.5 L 1000.0 1342.5 L 991.5 1331.0 L 983.5 1297.0 L 983.5 1285.0 L 994.5 1266.0 L 1001.0 1244.5 L 1007.5 1261.0 L 1020.5 1277.0 L 1016.5 1324.0 L 1013.5 1335.0 L 1005.0 1343.5 Z M 802.0 1342.5 L 797.0 1342.5 L 788.5 1333.0 L 779.5 1292.0 L 779.5 1278.0 L 792.5 1265.0 L 801.0 1247.5 L 805.5 1261.0 L 818.5 1285.0 L 811.5 1328.0 L 802.0 1342.5 Z M 343.0 1336.5 L 331.5 1335.0 L 330.5 1195.0 L 341.5 1138.0 L 352.0 1122.5 L 355.5 1143.0 L 357.0 1145.5 L 358.0 1142.5 L 361.5 1148.0 L 367.5 1169.0 L 372.5 1200.0 L 372.5 1222.0 L 368.5 1246.0 L 360.0 1263.5 L 361.5 1173.0 L 358.0 1149.5 L 357.5 1222.0 L 345.5 1334.0 L 343.0 1336.5 Z M 313.0 1198.5 L 296.0 1144.5 L 308.5 1171.0 L 313.0 1198.5 Z M 91.0 1265.5 L 82.5 1244.0 L 78.5 1205.0 L 84.5 1169.0 L 92.0 1146.5 L 91.0 1265.5 Z M 796.0 1092.0 L 799.0 1099.0 L 800.0 1106.0 L 800.0 1113.0 L 801.0 1120.0 L 802.0 1127.0 L 802.0 1134.0 L 802.0 1141.0 L 802.0 1148.0 L 802.0 1155.0 L 802.0 1162.0 L 802.0 1169.0 L 802.0 1176.0 L 802.0 1183.0 L 802.0 1190.0 L 802.0 1197.0 L 801.0 1204.0 L 801.0 1211.0 L 801.0 1218.0 L 800.0 1225.0 L 799.0 1232.0 L 798.0 1239.0 L 796.0 1246.0 L 794.0 1253.0 L 790.0 1260.0 L 785.0 1267.0 L 777.0 1273.0 L 774.0 1273.0 L 768.0 1267.0 L 764.0 1260.0 L 762.0 1253.0 L 760.0 1246.0 L 759.0 1239.0 L 758.0 1232.0 L 757.0 1225.0 L 757.0 1218.0 L 757.0 1211.0 L 758.0 1204.0 L 759.0 1197.0 L 760.0 1190.0 L 761.0 1183.0 L 763.0 1176.0 L 765.0 1169.0 L 767.0 1162.0 L 769.0 1155.0 L 771.0 1148.0 L 773.0 1141.0 L 776.0 1134.0 L 778.0 1127.0 L 781.0 1120.0 L 783.0 1113.0 L 786.0 1106.0 L 790.0 1099.0 L 796.0 1092.0 Z M 1006.0 1092.0 L 1011.0 1099.0 L 1015.0 1106.0 L 1018.0 1113.0 L 1021.0 1120.0 L 1023.0 1127.0 L 1025.0 1134.0 L 1028.0 1141.0 L 1030.0 1148.0 L 1032.0 1155.0 L 1034.0 1162.0 L 1036.0 1169.0 L 1038.0 1176.0 L 1040.0 1183.0 L 1041.0 1190.0 L 1042.0 1197.0 L 1043.0 1204.0 L 1044.0 1211.0 L 1044.0 1218.0 L 1044.0 1225.0 L 1043.0 1232.0 L 1043.0 1239.0 L 1041.0 1246.0 L 1040.0 1253.0 L 1037.0 1260.0 L 1034.0 1267.0 L 1027.0 1273.0 L 1025.0 1273.0 L 1017.0 1267.0 L 1012.0 1260.0 L 1009.0 1253.0 L 1006.0 1246.0 L 1004.0 1239.0 L 1003.0 1232.0 L 1003.0 1225.0 L 1002.0 1218.0 L 1001.0 1211.0 L 1001.0 1204.0 L 1000.0 1197.0 L 1000.0 1190.0 L 1000.0 1183.0 L 999.0 1176.0 L 999.0 1169.0 L 999.0 1162.0 L 998.0 1155.0 L 999.0 1148.0 L 999.0 1141.0 L 999.0 1134.0 L 999.0 1127.0 L 1000.0 1120.0 L 1000.0 1113.0 L 1001.0 1106.0 L 1002.0 1099.0 L 1004.0 1092.0 Z M 827.0 1098.0 L 831.0 1105.0 L 833.0 1112.0 L 833.0 1119.0 L 834.0 1126.0 L 835.0 1133.0 L 836.0 1140.0 L 837.0 1147.0 L 838.0 1154.0 L 839.0 1161.0 L 840.0 1168.0 L 841.0 1175.0 L 842.0 1182.0 L 844.0 1189.0 L 845.0 1196.0 L 845.0 1203.0 L 846.0 1210.0 L 846.0 1217.0 L 846.0 1224.0 L 846.0 1231.0 L 844.0 1238.0 L 843.0 1245.0 L 841.0 1252.0 L 838.0 1259.0 L 835.0 1266.0 L 830.0 1273.0 L 825.0 1278.0 L 822.0 1278.0 L 817.0 1273.0 L 813.0 1266.0 L 809.0 1259.0 L 808.0 1252.0 L 806.0 1245.0 L 805.0 1238.0 L 805.0 1231.0 L 805.0 1224.0 L 805.0 1217.0 L 806.0 1210.0 L 806.0 1203.0 L 807.0 1196.0 L 807.0 1189.0 L 808.0 1182.0 L 808.0 1175.0 L 809.0 1168.0 L 809.0 1161.0 L 810.0 1154.0 L 811.0 1147.0 L 813.0 1140.0 L 814.0 1133.0 L 816.0 1126.0 L 818.0 1119.0 L 821.0 1112.0 L 823.0 1105.0 L 826.0 1098.0 Z M 975.0 1098.0 L 978.0 1105.0 L 981.0 1112.0 L 984.0 1119.0 L 985.0 1126.0 L 987.0 1133.0 L 988.0 1140.0 L 990.0 1147.0 L 991.0 1154.0 L 992.0 1161.0 L 993.0 1168.0 L 994.0 1175.0 L 994.0 1182.0 L 995.0 1189.0 L 995.0 1196.0 L 996.0 1203.0 L 996.0 1210.0 L 997.0 1217.0 L 997.0 1224.0 L 997.0 1231.0 L 997.0 1238.0 L 996.0 1245.0 L 994.0 1252.0 L 993.0 1259.0 L 990.0 1266.0 L 986.0 1273.0 L 980.0 1279.0 L 978.0 1279.0 L 972.0 1273.0 L 967.0 1266.0 L 964.0 1259.0 L 961.0 1252.0 L 959.0 1245.0 L 957.0 1238.0 L 957.0 1231.0 L 956.0 1224.0 L 956.0 1217.0 L 956.0 1210.0 L 957.0 1203.0 L 958.0 1196.0 L 959.0 1189.0 L 960.0 1182.0 L 961.0 1175.0 L 962.0 1168.0 L 963.0 1161.0 L 964.0 1154.0 L 966.0 1147.0 L 966.0 1140.0 L 967.0 1133.0 L 968.0 1126.0 L 969.0 1119.0 L 970.0 1112.0 L 970.0 1105.0 L 973.0 1098.0 Z M 110.0 1129.0 L 131.0 1132.0 L 127.0 1135.0 L 133.0 1138.0 L 132.0 1141.0 L 131.0 1144.0 L 131.0 1147.0 L 130.0 1150.0 L 130.0 1153.0 L 129.0 1156.0 L 127.0 1159.0 L 128.0 1162.0 L 127.0 1165.0 L 127.0 1168.0 L 126.0 1171.0 L 125.0 1174.0 L 125.0 1177.0 L 124.0 1180.0 L 124.0 1183.0 L 123.0 1186.0 L 123.0 1187.0 L 123.0 1187.0 L 123.0 1186.0 L 122.0 1183.0 L 124.0 1180.0 L 123.0 1177.0 L 124.0 1174.0 L 124.0 1171.0 L 125.0 1168.0 L 126.0 1165.0 L 126.0 1162.0 L 127.0 1159.0 L 127.0 1156.0 L 128.0 1153.0 L 115.0 1150.0 L 114.0 1147.0 L 113.0 1144.0 L 113.0 1141.0 L 113.0 1138.0 L 112.0 1135.0 L 111.0 1132.0 L 110.0 1129.0 Z M 312.0 1185.0 L 313.0 1188.0 L 313.0 1191.0 L 314.0 1194.0 L 314.0 1197.0 L 315.0 1200.0 L 316.0 1203.0 L 316.0 1206.0 L 317.0 1209.0 L 317.0 1212.0 L 318.0 1215.0 L 318.0 1218.0 L 319.0 1221.0 L 319.0 1224.0 L 320.0 1227.0 L 320.0 1230.0 L 318.0 1233.0 L 318.0 1235.0 L 318.0 1235.0 L 314.0 1233.0 L 314.0 1230.0 L 314.0 1227.0 L 315.0 1224.0 L 316.0 1221.0 L 315.0 1218.0 L 315.0 1215.0 L 315.0 1212.0 L 315.0 1209.0 L 314.0 1206.0 L 314.0 1203.0 L 313.0 1200.0 L 314.0 1197.0 L 313.0 1194.0 L 313.0 1191.0 L 312.0 1188.0 L 312.0 1185.0 Z","back":"M 831.0 523.5 L 820.0 522.5 L 810.5 514.0 L 792.5 478.0 L 792.5 472.0 L 804.5 454.0 L 812.0 448.5 L 821.0 451.5 L 831.5 461.0 L 842.5 496.0 L 850.5 513.0 L 847.0 517.5 L 831.0 523.5 Z M 982.0 522.5 L 966.0 520.5 L 956.0 515.5 L 954.5 511.0 L 969.5 472.0 L 970.5 462.0 L 980.0 453.5 L 988.0 449.5 L 994.0 449.5 L 1012.5 474.0 L 996.5 509.0 L 988.0 519.5 L 982.0 522.5 Z M 846.0 694.5 L 840.5 691.0 L 839.5 687.0 L 822.5 667.0 L 800.5 633.0 L 786.5 605.0 L 774.5 572.0 L 765.5 536.0 L 763.5 523.0 L 765.5 508.0 L 762.5 502.0 L 786.0 481.5 L 796.5 493.0 L 802.5 507.0 L 813.5 523.0 L 810.0 527.5 L 831.0 526.5 L 852.0 520.5 L 857.5 524.0 L 878.5 559.0 L 892.5 591.0 L 893.5 607.0 L 889.5 620.0 L 856.5 682.0 L 846.0 694.5 Z M 960.0 693.5 L 957.0 693.5 L 950.5 687.0 L 914.5 620.0 L 910.5 606.0 L 911.5 587.0 L 927.5 553.0 L 949.0 521.5 L 955.0 520.5 L 976.0 526.5 L 993.0 526.5 L 990.5 522.0 L 999.5 510.0 L 1008.5 491.0 L 1016.0 483.5 L 1020.0 483.5 L 1040.5 502.0 L 1037.5 535.0 L 1031.5 562.0 L 1018.5 599.0 L 1002.5 632.0 L 984.5 662.0 L 960.0 693.5 Z M 898.0 600.5 L 891.5 579.0 L 882.5 560.0 L 848.5 502.0 L 838.5 476.0 L 832.5 452.0 L 818.5 420.0 L 824.5 403.0 L 869.5 367.0 L 879.5 350.0 L 884.0 335.5 L 900.5 341.0 L 899.0 430.5 L 895.5 425.0 L 895.0 409.5 L 892.5 417.0 L 894.5 433.0 L 898.5 440.0 L 900.5 462.0 L 898.0 600.5 Z M 906.0 599.5 L 903.5 461.0 L 905.5 442.0 L 911.5 432.0 L 909.5 429.0 L 911.5 417.0 L 910.0 414.5 L 908.5 425.0 L 905.0 430.5 L 903.5 342.0 L 919.0 337.5 L 931.5 364.0 L 945.0 377.5 L 965.0 389.5 L 980.5 404.0 L 985.5 414.0 L 985.5 422.0 L 972.5 449.0 L 971.5 459.0 L 956.5 499.0 L 922.5 556.0 L 911.5 580.0 L 906.0 599.5 Z M 895.0 595.0 L 897.0 602.0 L 897.0 609.0 L 897.0 616.0 L 897.0 623.0 L 897.0 630.0 L 897.0 637.0 L 897.0 644.0 L 897.0 651.0 L 897.0 658.0 L 897.0 665.0 L 897.0 672.0 L 897.0 679.0 L 897.0 686.0 L 898.0 693.0 L 898.0 700.0 L 898.0 707.0 L 898.0 714.0 L 898.0 721.0 L 898.0 728.0 L 898.0 735.0 L 898.0 742.0 L 898.0 749.0 L 898.0 756.0 L 897.0 763.0 L 895.0 767.0 L 892.0 767.0 L 886.0 763.0 L 878.0 756.0 L 873.0 749.0 L 869.0 742.0 L 867.0 735.0 L 864.0 728.0 L 861.0 721.0 L 859.0 714.0 L 856.0 707.0 L 853.0 700.0 L 853.0 693.0 L 854.0 686.0 L 859.0 679.0 L 862.0 672.0 L 866.0 665.0 L 870.0 658.0 L 873.0 651.0 L 877.0 644.0 L 881.0 637.0 L 885.0 630.0 L 888.0 623.0 L 891.0 616.0 L 893.0 609.0 L 894.0 602.0 L 893.0 595.0 Z M 909.0 601.0 L 910.0 608.0 L 912.0 615.0 L 914.0 622.0 L 918.0 629.0 L 922.0 636.0 L 925.0 643.0 L 929.0 650.0 L 933.0 657.0 L 937.0 664.0 L 940.0 671.0 L 944.0 678.0 L 948.0 685.0 L 951.0 692.0 L 951.0 699.0 L 948.0 706.0 L 945.0 713.0 L 942.0 720.0 L 940.0 727.0 L 937.0 734.0 L 935.0 741.0 L 932.0 748.0 L 927.0 755.0 L 919.0 762.0 L 912.0 767.0 L 908.0 767.0 L 906.0 762.0 L 905.0 755.0 L 905.0 748.0 L 905.0 741.0 L 905.0 734.0 L 905.0 727.0 L 905.0 720.0 L 905.0 713.0 L 905.0 706.0 L 905.0 699.0 L 905.0 692.0 L 905.0 685.0 L 905.0 678.0 L 905.0 671.0 L 905.0 664.0 L 906.0 657.0 L 906.0 650.0 L 906.0 643.0 L 906.0 636.0 L 906.0 629.0 L 906.0 622.0 L 906.0 615.0 L 907.0 608.0 L 907.0 601.0 Z M 1019.0 603.0 L 1018.0 610.0 L 1015.0 617.0 L 1011.0 624.0 L 1007.0 631.0 L 1004.0 638.0 L 1002.0 645.0 L 1001.0 652.0 L 1000.0 659.0 L 999.0 666.0 L 1000.0 673.0 L 1000.0 680.0 L 1001.0 687.0 L 1001.0 694.0 L 1002.0 701.0 L 1002.0 708.0 L 1001.0 715.0 L 1000.0 722.0 L 999.0 729.0 L 1002.0 736.0 L 1004.0 743.0 L 1006.0 750.0 L 1008.0 757.0 L 1009.0 764.0 L 1010.0 768.0 L 1008.0 768.0 L 1006.0 764.0 L 1001.0 757.0 L 995.0 750.0 L 986.0 743.0 L 945.0 736.0 L 947.0 729.0 L 950.0 722.0 L 953.0 715.0 L 955.0 708.0 L 960.0 701.0 L 962.0 694.0 L 966.0 687.0 L 971.0 680.0 L 976.0 673.0 L 982.0 666.0 L 987.0 659.0 L 991.0 652.0 L 995.0 645.0 L 999.0 638.0 L 1003.0 631.0 L 1007.0 624.0 L 1010.0 617.0 L 1014.0 610.0 L 1017.0 603.0 Z M 787.0 608.0 L 790.0 615.0 L 794.0 622.0 L 797.0 629.0 L 801.0 636.0 L 805.0 643.0 L 810.0 650.0 L 815.0 657.0 L 819.0 664.0 L 824.0 671.0 L 830.0 678.0 L 836.0 685.0 L 841.0 692.0 L 842.0 699.0 L 848.0 706.0 L 850.0 713.0 L 852.0 720.0 L 855.0 727.0 L 857.0 734.0 L 819.0 741.0 L 810.0 748.0 L 803.0 755.0 L 797.0 762.0 L 795.0 767.0 L 793.0 767.0 L 793.0 762.0 L 795.0 755.0 L 797.0 748.0 L 799.0 741.0 L 801.0 734.0 L 802.0 727.0 L 801.0 720.0 L 800.0 713.0 L 800.0 706.0 L 800.0 699.0 L 800.0 692.0 L 801.0 685.0 L 801.0 678.0 L 802.0 671.0 L 802.0 664.0 L 801.0 657.0 L 800.0 650.0 L 799.0 643.0 L 797.0 636.0 L 793.0 629.0 L 790.0 622.0 L 787.0 615.0 L 785.0 608.0 Z","triceps":"M 697.0 641.5 L 694.5 637.0 L 694.5 609.0 L 698.5 598.0 L 696.5 582.0 L 702.5 558.0 L 718.5 531.0 L 727.0 522.5 L 740.0 515.5 L 741.5 521.0 L 732.5 568.0 L 728.5 576.0 L 711.5 592.0 L 706.5 602.0 L 701.5 636.0 L 697.0 641.5 Z M 1103.0 641.5 L 1093.5 597.0 L 1072.5 575.0 L 1060.0 516.5 L 1066.0 517.5 L 1080.5 527.0 L 1090.5 538.0 L 1099.5 556.0 L 1103.5 570.0 L 1104.5 602.0 L 1107.5 610.0 L 1106.5 633.0 L 1102.5 635.0 L 1104.5 639.0 L 1103.0 641.5 Z M 1069.0 651.5 L 1059.5 641.0 L 1046.5 616.0 L 1036.5 584.0 L 1038.5 552.0 L 1045.5 526.0 L 1050.0 518.5 L 1062.5 547.0 L 1069.5 574.0 L 1064.5 604.0 L 1068.5 624.0 L 1069.0 651.5 Z M 733.0 652.5 L 731.5 644.0 L 733.5 624.0 L 738.5 606.0 L 735.5 569.0 L 752.0 520.5 L 756.5 527.0 L 764.5 557.0 L 765.5 584.0 L 763.5 592.0 L 752.5 610.0 L 747.5 629.0 L 733.0 652.5 Z M 1148.0 792.5 L 1114.5 690.0 L 1109.5 658.0 L 1110.0 647.5 L 1122.5 661.0 L 1111.5 642.0 L 1112.0 627.5 L 1117.5 631.0 L 1132.5 657.0 L 1131.5 660.0 L 1145.5 702.0 L 1148.5 722.0 L 1148.0 792.5 Z M 690.0 628.0 L 690.0 636.0 L 686.0 644.0 L 682.0 652.0 L 688.0 660.0 L 690.0 668.0 L 689.0 676.0 L 685.0 684.0 L 685.0 692.0 L 683.0 700.0 L 681.0 708.0 L 678.0 716.0 L 675.0 724.0 L 673.0 732.0 L 670.0 740.0 L 666.0 748.0 L 664.0 756.0 L 662.0 764.0 L 659.0 772.0 L 656.0 780.0 L 654.0 788.0 L 652.0 796.0 L 650.0 804.0 L 647.0 812.0 L 675.0 820.0 L 674.0 822.0 L 643.0 822.0 L 642.0 820.0 L 644.0 812.0 L 646.0 804.0 L 648.0 796.0 L 649.0 788.0 L 650.0 780.0 L 650.0 772.0 L 653.0 764.0 L 653.0 756.0 L 653.0 748.0 L 654.0 740.0 L 654.0 732.0 L 655.0 724.0 L 655.0 716.0 L 656.0 708.0 L 658.0 700.0 L 659.0 692.0 L 662.0 684.0 L 665.0 676.0 L 668.0 668.0 L 671.0 660.0 L 674.0 652.0 L 679.0 644.0 L 684.0 636.0 L 690.0 628.0 Z","glutes":"M 795.0 918.5 L 782.5 896.0 L 775.5 861.0 L 776.5 839.0 L 789.5 779.0 L 801.5 758.0 L 818.0 742.5 L 831.0 737.5 L 851.0 738.5 L 865.0 747.5 L 879.5 764.0 L 894.5 790.0 L 898.5 809.0 L 898.5 835.0 L 895.5 851.0 L 888.5 866.0 L 881.0 873.5 L 857.0 885.5 L 843.0 888.5 L 821.0 888.5 L 802.0 878.5 L 808.0 885.5 L 820.5 891.0 L 805.5 902.0 L 795.0 918.5 Z M 1009.0 919.5 L 1000.5 905.0 L 985.5 892.0 L 1003.5 878.0 L 1007.0 867.5 L 1001.5 877.0 L 991.0 885.5 L 975.0 889.5 L 960.0 888.5 L 938.0 882.5 L 923.0 873.5 L 913.5 863.0 L 907.5 850.0 L 904.5 836.0 L 904.5 809.0 L 910.5 785.0 L 918.5 771.0 L 935.5 750.0 L 956.0 737.5 L 975.0 738.5 L 991.0 747.5 L 1007.5 768.0 L 1016.5 790.0 L 1016.5 800.0 L 1025.5 837.0 L 1026.5 872.0 L 1021.5 894.0 L 1009.0 919.5 Z","hamstrings":"M 843.0 1118.5 L 830.5 1082.0 L 825.5 1041.0 L 825.5 1014.0 L 829.5 977.0 L 836.5 942.0 L 848.5 905.0 L 854.5 894.0 L 857.0 893.5 L 867.5 926.0 L 871.5 966.0 L 866.5 1008.0 L 857.5 1042.0 L 851.5 1095.0 L 846.5 1114.0 L 843.0 1118.5 Z M 961.0 1122.5 L 955.5 1115.0 L 950.5 1099.0 L 944.5 1042.0 L 932.5 985.0 L 933.5 945.0 L 938.5 919.0 L 947.0 893.5 L 953.5 903.0 L 965.5 935.0 L 974.5 980.0 L 977.5 1015.0 L 974.5 1070.0 L 962.5 1110.0 L 961.0 1122.5 Z M 783.0 1105.5 L 779.5 1105.0 L 779.5 1097.0 L 786.5 966.0 L 793.5 935.0 L 801.5 916.0 L 812.0 902.5 L 823.0 896.5 L 826.5 904.0 L 829.5 934.0 L 829.5 959.0 L 824.5 994.0 L 806.5 1058.0 L 783.0 1105.5 Z M 1019.0 1103.5 L 995.5 1058.0 L 978.5 995.0 L 973.5 955.0 L 973.5 924.0 L 975.5 905.0 L 979.0 897.5 L 991.0 902.5 L 1002.5 916.0 L 1009.5 934.0 L 1015.5 961.0 L 1019.5 1004.0 L 1021.5 1082.0 L 1019.0 1103.5 Z M 926.0 988.5 L 922.5 981.0 L 923.0 974.5 L 926.5 976.0 L 926.0 988.5 Z"};

        // Anatomik şekil üzerindeki her kas grubunun 3 alt bölgesinin (①, ②, ③) geometrik dilimleri, ayırıcı çizgileri ve rozet koordinatları
        const ANATOMY_SUBREGION_SVG_GEOM = {
            chest: {
                // ① Üst Göğüs (upper), ② Orta Göğüs (mid), ③ Alt Göğüs (lower)
                zones: {
                    upper: '<rect x="80" y="425" width="295" height="50"/>',
                    mid: '<rect x="80" y="475" width="295" height="53"/>',
                    lower: '<rect x="80" y="528" width="295" height="48"/>'
                },
                dividers: 'M 90 475 Q 160 482 224 475 M 228 475 Q 292 482 362 475 M 95 528 Q 160 536 224 528 M 228 528 Q 292 536 357 528',
                pins: [
                    { key: 'upper', num: '1', label: 'Üst Göğüs', x: 165, y: 454 },
                    { key: 'mid', num: '2', label: 'Orta Göğüs', x: 292, y: 502 },
                    { key: 'lower', num: '3', label: 'Alt Göğüs', x: 168, y: 550 }
                ]
            },
            shoulders: {
                // ① Ön Omuz (front), ② Yan Omuz (side), ③ Arka Omuz (rear - arka vücut)
                zones: {
                    front: '<path d="M 64 420 L 135 420 L 135 552 L 52 552 Z M 318 420 L 388 420 L 400 552 L 318 552 Z"/>',
                    side: '<path d="M 25 420 L 64 420 L 52 552 L 25 552 Z M 388 420 L 430 420 L 430 552 L 400 552 Z"/>',
                    rear: '<rect x="700" y="425" width="405" height="115"/>'
                },
                dividers: 'M 64 426 L 52 545 M 388 426 L 400 545',
                pins: [
                    { key: 'front', num: '1', label: 'Ön Omuz', x: 92, y: 465 },
                    { key: 'side', num: '2', label: 'Yan Omuz', x: 406, y: 492 },
                    { key: 'rear', num: '3', label: 'Arka Omuz', x: 755, y: 476 }
                ]
            },
            back: {
                // ① Kanatlar (lats), ② Orta Sırt & Kürek (mid), ③ Üst Sırt & Trapez (traps), ④ Alt Sırt & Bel (lower)
                zones: {
                    lats: '<path d="M 846.0 694.5 L 840.5 691.0 L 839.5 687.0 L 822.5 667.0 L 800.5 633.0 L 786.5 605.0 L 774.5 572.0 L 765.5 536.0 L 763.5 523.0 L 765.5 508.0 L 762.5 502.0 L 786.0 481.5 L 796.5 493.0 L 802.5 507.0 L 813.5 523.0 L 810.0 527.5 L 831.0 526.5 L 852.0 520.5 L 857.5 524.0 L 878.5 559.0 L 892.5 591.0 L 893.5 607.0 L 889.5 620.0 L 856.5 682.0 L 846.0 694.5 Z M 960.0 693.5 L 957.0 693.5 L 950.5 687.0 L 914.5 620.0 L 910.5 606.0 L 911.5 587.0 L 927.5 553.0 L 949.0 521.5 L 955.0 520.5 L 976.0 526.5 L 993.0 526.5 L 990.5 522.0 L 999.5 510.0 L 1008.5 491.0 L 1016.0 483.5 L 1020.0 483.5 L 1040.5 502.0 L 1037.5 535.0 L 1031.5 562.0 L 1018.5 599.0 L 1002.5 632.0 L 984.5 662.0 L 960.0 693.5 Z"/>',
                    mid: '<path d="M 831.0 523.5 L 820.0 522.5 L 810.5 514.0 L 792.5 478.0 L 792.5 472.0 L 804.5 454.0 L 812.0 448.5 L 821.0 451.5 L 831.5 461.0 L 842.5 496.0 L 850.5 513.0 L 847.0 517.5 L 831.0 523.5 Z M 982.0 522.5 L 966.0 520.5 L 956.0 515.5 L 954.5 511.0 L 969.5 472.0 L 970.5 462.0 L 980.0 453.5 L 988.0 449.5 L 994.0 449.5 L 1012.5 474.0 L 996.5 509.0 L 988.0 519.5 L 982.0 522.5 Z"/>',
                    traps: '<path d="M 898.0 600.5 L 891.5 579.0 L 882.5 560.0 L 848.5 502.0 L 838.5 476.0 L 832.5 452.0 L 818.5 420.0 L 824.5 403.0 L 869.5 367.0 L 879.5 350.0 L 884.0 335.5 L 900.5 341.0 L 899.0 430.5 L 895.5 425.0 L 895.0 409.5 L 892.5 417.0 L 894.5 433.0 L 898.5 440.0 L 900.5 462.0 L 898.0 600.5 Z M 906.0 599.5 L 903.5 461.0 L 905.5 442.0 L 911.5 432.0 L 909.5 429.0 L 911.5 417.0 L 910.0 414.5 L 908.5 425.0 L 905.0 430.5 L 903.5 342.0 L 919.0 337.5 L 931.5 364.0 L 945.0 377.5 L 965.0 389.5 L 980.5 404.0 L 985.5 414.0 L 985.5 422.0 L 972.5 449.0 L 971.5 459.0 L 956.5 499.0 L 922.5 556.0 L 911.5 580.0 L 906.0 599.5 Z"/>',
                    lower: '<path d="M 895.0 595.0 L 897.0 602.0 L 897.0 609.0 L 897.0 616.0 L 897.0 623.0 L 897.0 630.0 L 897.0 637.0 L 897.0 644.0 L 897.0 651.0 L 897.0 658.0 L 897.0 665.0 L 897.0 672.0 L 897.0 679.0 L 897.0 686.0 L 898.0 693.0 L 898.0 700.0 L 898.0 707.0 L 898.0 714.0 L 898.0 721.0 L 898.0 728.0 L 898.0 735.0 L 898.0 742.0 L 898.0 749.0 L 898.0 756.0 L 897.0 763.0 L 895.0 767.0 L 892.0 767.0 L 886.0 763.0 L 878.0 756.0 L 873.0 749.0 L 869.0 742.0 L 867.0 735.0 L 864.0 728.0 L 861.0 721.0 L 859.0 714.0 L 856.0 707.0 L 853.0 700.0 L 853.0 693.0 L 854.0 686.0 L 859.0 679.0 L 862.0 672.0 L 866.0 665.0 L 870.0 658.0 L 873.0 651.0 L 877.0 644.0 L 881.0 637.0 L 885.0 630.0 L 888.0 623.0 L 891.0 616.0 L 893.0 609.0 L 894.0 602.0 L 893.0 595.0 Z M 909.0 601.0 L 910.0 608.0 L 912.0 615.0 L 914.0 622.0 L 918.0 629.0 L 922.0 636.0 L 925.0 643.0 L 929.0 650.0 L 933.0 657.0 L 937.0 664.0 L 940.0 671.0 L 944.0 678.0 L 948.0 685.0 L 951.0 692.0 L 951.0 699.0 L 948.0 706.0 L 945.0 713.0 L 942.0 720.0 L 940.0 727.0 L 937.0 734.0 L 935.0 741.0 L 932.0 748.0 L 927.0 755.0 L 919.0 762.0 L 912.0 767.0 L 908.0 767.0 L 906.0 762.0 L 905.0 755.0 L 905.0 748.0 L 905.0 741.0 L 905.0 734.0 L 905.0 727.0 L 905.0 720.0 L 905.0 713.0 L 905.0 706.0 L 905.0 699.0 L 905.0 692.0 L 905.0 685.0 L 905.0 678.0 L 905.0 671.0 L 905.0 664.0 L 906.0 657.0 L 906.0 650.0 L 906.0 643.0 L 906.0 636.0 L 906.0 629.0 L 906.0 622.0 L 906.0 615.0 L 907.0 608.0 L 907.0 601.0 Z M 1019.0 603.0 L 1018.0 610.0 L 1015.0 617.0 L 1011.0 624.0 L 1007.0 631.0 L 1004.0 638.0 L 1002.0 645.0 L 1001.0 652.0 L 1000.0 659.0 L 999.0 666.0 L 1000.0 673.0 L 1000.0 680.0 L 1001.0 687.0 L 1001.0 694.0 L 1002.0 701.0 L 1002.0 708.0 L 1001.0 715.0 L 1000.0 722.0 L 999.0 729.0 L 1002.0 736.0 L 1004.0 743.0 L 1006.0 750.0 L 1008.0 757.0 L 1009.0 764.0 L 1010.0 768.0 L 1008.0 768.0 L 1006.0 764.0 L 1001.0 757.0 L 995.0 750.0 L 986.0 743.0 L 945.0 736.0 L 947.0 729.0 L 950.0 722.0 L 953.0 715.0 L 955.0 708.0 L 960.0 701.0 L 962.0 694.0 L 966.0 687.0 L 971.0 680.0 L 976.0 673.0 L 982.0 666.0 L 987.0 659.0 L 991.0 652.0 L 995.0 645.0 L 999.0 638.0 L 1003.0 631.0 L 1007.0 624.0 L 1010.0 617.0 L 1014.0 610.0 L 1017.0 603.0 Z M 787.0 608.0 L 790.0 615.0 L 794.0 622.0 L 797.0 629.0 L 801.0 636.0 L 805.0 643.0 L 810.0 650.0 L 815.0 657.0 L 819.0 664.0 L 824.0 671.0 L 830.0 678.0 L 836.0 685.0 L 841.0 692.0 L 842.0 699.0 L 848.0 706.0 L 850.0 713.0 L 852.0 720.0 L 855.0 727.0 L 857.0 734.0 L 819.0 741.0 L 810.0 748.0 L 803.0 755.0 L 797.0 762.0 L 795.0 767.0 L 793.0 767.0 L 793.0 762.0 L 795.0 755.0 L 797.0 748.0 L 799.0 741.0 L 801.0 734.0 L 802.0 727.0 L 801.0 720.0 L 800.0 713.0 L 800.0 706.0 L 800.0 699.0 L 800.0 692.0 L 801.0 685.0 L 801.0 678.0 L 802.0 671.0 L 802.0 664.0 L 801.0 657.0 L 800.0 650.0 L 799.0 643.0 L 797.0 636.0 L 793.0 629.0 L 790.0 622.0 L 787.0 615.0 L 785.0 608.0 Z"/>'
                },
                dividers: 'M 800 633 L 846 695 L 898 605 M 906 605 L 960 694 L 1003 632',
                pins: [
                    { key: 'lats', num: '1', label: 'Kanatlar', x: 828, y: 595 },
                    { key: 'mid', num: '2', label: 'Orta Sırt', x: 982, y: 492 },
                    { key: 'traps', num: '3', label: 'Üst Trapez', x: 872, y: 412 },
                    { key: 'lower', num: '4', label: 'Alt Sırt & Bel', x: 876, y: 695 }
                ]
            },
            biceps: {
                // ① Pazı Dış (Tepe), ② Pazı İç (Dolgunluk), ③ Ön Kol & Dış Kol (Tutuş)
                zones: {
                    long_head: '<path d="M 28 515 L 60 515 L 60 612 L 28 612 Z M 396 515 L 440 515 L 440 612 L 396 612 Z"/>',
                    short_head: '<path d="M 60 515 L 98 515 L 98 612 L 60 612 Z M 355 515 L 396 515 L 396 612 L 355 612 Z"/>',
                    brachialis: '<path d="M 8 530 L 28 530 L 28 612 L 8 612 Z M 8 612 L 105 612 L 105 830 L 8 830 Z M 355 612 L 492 612 L 492 830 L 355 830 Z"/>'
                },
                dividers: 'M 60 524 L 60 612 M 396 524 L 396 612 M 28 612 L 90 612 M 362 612 L 434 612',
                pins: [
                    { key: 'long_head', num: '1', label: 'Pazı Dış (Tepe)', x: 414, y: 572 },
                    { key: 'short_head', num: '2', label: 'Pazı İç', x: 74, y: 572 },
                    { key: 'brachialis', num: '3', label: 'Ön Kol & Dış Kol', x: 46, y: 635 }
                ]
            },
            triceps: {
                // ① Arka Kol İç/Uzun Kısım (long), ② Arka Kol Dış Kısım (lateral), ③ Arka Kol Alt Kısım (medial)
                zones: {
                    long: '<path d="M 731 512 L 770 512 L 770 592 L 731 592 Z M 1032 512 L 1071 512 L 1071 592 L 1032 592 Z"/>',
                    lateral: '<path d="M 690 512 L 731 512 L 731 592 L 690 592 Z M 1071 512 L 1112 512 L 1112 592 L 1071 592 Z"/>',
                    medial: '<rect x="635" y="592" width="518" height="240"/>'
                },
                dividers: 'M 731 520 L 731 592 M 1071 520 L 1071 592 M 695 592 L 765 592 M 1036 592 L 1106 592',
                pins: [
                    { key: 'long', num: '1', label: 'Uzun Baş', x: 748, y: 560 },
                    { key: 'lateral', num: '2', label: 'Dış Baş', x: 1088, y: 560 },
                    { key: 'medial', num: '3', label: 'Alt Arka Kol', x: 1068, y: 622 }
                ]
            },
            core: {
                // ① Ön Karın (rectus), ② Yan Karın / Oblik (obliques), ③ Derin İç Karın & Alt Karın (transverse)
                zones: {
                    rectus: '<rect x="168" y="555" width="116" height="150"/>',
                    obliques: '<path d="M 120 555 L 168 555 L 168 835 L 120 835 Z M 284 555 L 332 555 L 332 835 L 284 835 Z"/>',
                    transverse: '<rect x="168" y="705" width="116" height="132"/>'
                },
                dividers: 'M 168 568 L 168 825 M 284 568 L 284 825 M 170 705 L 282 705',
                pins: [
                    { key: 'rectus', num: '1', label: 'Ön Karın', x: 200, y: 630 },
                    { key: 'obliques', num: '2', label: 'Yan Karın', x: 304, y: 665 },
                    { key: 'transverse', num: '3', label: 'Derin & Alt Karın', x: 254, y: 745 }
                ]
            },
            quads: {
                // ① Dış Ön Bacak (vastus_lat), ② İç Ön Bacak - Diz Üstü (vastus_med), ③ Orta Ön Bacak (rectus_fem)
                zones: {
                    vastus_lat: '<path d="M 78 760 L 124 760 L 124 920 L 78 920 Z M 78 920 L 134 920 L 134 1090 L 78 1090 Z M 326 760 L 375 760 L 375 920 L 326 920 Z M 318 920 L 375 920 L 375 1090 L 318 1090 Z"/>',
                    rectus_fem: '<path d="M 124 760 L 168 760 L 168 920 L 124 920 Z M 280 760 L 326 760 L 326 920 L 280 920 Z"/>',
                    vastus_med: '<path d="M 168 760 L 280 760 L 280 920 L 168 920 Z M 134 920 L 318 920 L 318 1090 L 134 1090 Z"/>'
                },
                dividers: 'M 124 772 L 124 920 L 134 1062 M 168 772 L 168 920 L 134 920 M 280 772 L 280 920 L 318 920 M 326 772 L 326 920 L 318 1062',
                pins: [
                    { key: 'vastus_lat', num: '1', label: 'Dış Ön Bacak', x: 102, y: 925 },
                    { key: 'vastus_med', num: '2', label: 'İç Ön Bacak', x: 164, y: 1015 },
                    { key: 'rectus_fem', num: '3', label: 'Orta Ön Bacak', x: 310, y: 895 }
                ]
            },
            glutes: {
                // ① Ana Kalça Kası (maximus), ② Yan Kalça - Üst Dış (medius), ③ Derin Kalça & Bel Dengesi (minimus)
                zones: {
                    medius: '<rect x="770" y="732" width="265" height="58"/>',
                    minimus: '<rect x="862" y="790" width="80" height="72"/>',
                    maximus: '<path d="M 770 790 L 862 790 L 862 862 L 942 862 L 942 790 L 1035 790 L 1035 925 L 770 925 Z"/>'
                },
                dividers: 'M 782 790 L 1020 790 M 862 790 L 862 862 L 942 862 L 942 790',
                pins: [
                    { key: 'maximus', num: '1', label: 'Ana Kalça', x: 825, y: 850 },
                    { key: 'medius', num: '2', label: 'Yan Kalça', x: 965, y: 762 },
                    { key: 'minimus', num: '3', label: 'Derin Kalça', x: 882, y: 826 }
                ]
            },
            hamstrings: {
                // ① Dış Arka Bacak - Diz Bükme (biceps_fem), ② İç Arka Bacak - Öne Eğilme (semitend), ③ Üst Arka Bacak & Kalça Bağlantısı (hinge_chain)
                zones: {
                    hinge_chain: '<rect x="772" y="888" width="258" height="67"/>',
                    biceps_fem: '<path d="M 772 955 L 827 955 L 827 1130 L 772 1130 Z M 975 955 L 1030 955 L 1030 1130 L 975 1130 Z"/>',
                    semitend: '<rect x="827" y="955" width="148" height="175"/>'
                },
                dividers: 'M 782 955 L 868 955 M 934 955 L 1018 955 M 827 955 L 827 1110 M 975 955 L 975 1110',
                pins: [
                    { key: 'biceps_fem', num: '1', label: 'Dış Arka Bacak', x: 804, y: 1020 },
                    { key: 'semitend', num: '2', label: 'İç Arka Bacak', x: 954, y: 1020 },
                    { key: 'hinge_chain', num: '3', label: 'Üst Bağlantı', x: 842, y: 928 }
                ]
            },
            calves: {
                // ① Üst Baldır - Ayakta (gastrocnemius), ② Alt Baldır - Oturarak (soleus), ③ Ön Kaval Kemiği & Bilek (tibialis)
                zones: {
                    gastrocnemius: '<rect x="745" y="1085" width="310" height="172"/>',
                    soleus: '<rect x="745" y="1257" width="310" height="110"/>',
                    tibialis: '<rect x="70" y="1115" width="315" height="252"/>'
                },
                dividers: 'M 762 1257 L 842 1257 M 960 1257 L 1040 1257 M 802 1098 L 802 1257 M 998 1098 L 998 1257',
                pins: [
                    { key: 'gastrocnemius', num: '1', label: 'Üst Baldır', x: 782, y: 1185 },
                    { key: 'soleus', num: '2', label: 'Alt Baldır', x: 1002, y: 1295 },
                    { key: 'tibialis', num: '3', label: 'Ön Kaval & Bilek', x: 108, y: 1225 }
                ]
            }
        };

        function renderAnatomicalBodySVG(muscles, selectedId) {
            const mMap = {};
            muscles.forEach(m => { mMap[m.id] = m; });

            const getParentStyle = (id) => {
                const m = mMap[id] || { status: 'unworked', effectiveDone: 0, effectiveTotal: 0 };
                const shownSets = (m.effectiveTotal !== undefined ? m.effectiveTotal : (m.effectiveDone || 0));
                let fill = '#EF4444';
                let stroke = '#DC2626';
                let animClass = 'muscle-unworked-anim';
                if (m.status === 'optimal' || m.status === 'high') {
                    fill = '#16A34A';
                    stroke = '#15803D';
                    animClass = '';
                } else if (m.status === 'insufficient') {
                    fill = '#F59E0B';
                    stroke = '#D97706';
                    animClass = '';
                }
                const isSel = (selectedId === id);
                return {
                    fill,
                    stroke,
                    animClass,
                    isSel,
                    cls: `anatomy-muscle ${animClass} ${isSel ? 'active-selected' : ''}`,
                    tooltip: `${m.name || id}: ${shownSets ? shownSets.toFixed(1) : 0} Set (${m.statusBadge || m.status})`
                };
            };

            const getSubStyle = (mId, colKey, colLabel, compData, parentStyle) => {
                if (!compData) {
                    return {
                        fill: parentStyle.fill,
                        stroke: parentStyle.stroke,
                        tooltip: `${colLabel}: Veri Yok`
                    };
                }
                const isDone = compData.earnedSets > 0;
                const isPlanned = !isDone && compData.plannedExs && compData.plannedExs.size > 0;
                if (isDone) {
                    return {
                        fill: '#16A34A',
                        stroke: '#14532D',
                        statusText: `${compData.earnedSets.toFixed(1)} Set (Çalıştı)`,
                        tooltip: `${colLabel}: ${compData.earnedSets.toFixed(1)} Set (${Array.from(compData.doneExs).join(', ')})`
                    };
                }
                if (isPlanned) {
                    return {
                        fill: '#F59E0B',
                        stroke: '#B45309',
                        statusText: `Planda (${compData.plannedCount} Hrk)`,
                        tooltip: `${colLabel}: Planda (${Array.from(compData.plannedExs).join(', ')})`
                    };
                }
                return {
                    fill: '#EF4444',
                    stroke: '#991B1B',
                    statusText: '0 Set (Boşta)',
                    tooltip: `${colLabel}: 0 Set (Boşta — Tıklayıp hareket ekleyebilirsin)`
                };
            };

            const muscleOrder = [
                'chest', 'shoulders', 'biceps', 'triceps', 'core',
                'back', 'glutes', 'quads', 'hamstrings', 'calves'
            ];

            let defsHTML = '';
            let groupsHTML = '';
            let selectedPinsHTML = '';

            muscleOrder.forEach(mId => {
                const d = ANATOMY_MUSCLE_PATHS[mId] || '';
                if (!d) return;
                const pStyle = getParentStyle(mId);
                const mObj = mMap[mId] || { id: mId, name: mId };
                const compMap = computeMuscleCompartmentMap(mObj);
                const subGeom = ANATOMY_SUBREGION_SVG_GEOM[mId];
                const def = MUSCLE_DIAGRAM_DEFS[mId];

                defsHTML += `<clipPath id="clip_anat_${mId}"><path d="${d}"/></clipPath>\n`;

                if (subGeom && def && compMap) {
                    const zonesHTML = def.columns.map((col, idx) => {
                        const zoneSvg = subGeom.zones[col.key] || '';
                        if (!zoneSvg) return '';
                        const subSt = getSubStyle(mId, col.key, col.label, compMap[col.key], pStyle);
                        const withAttrs = zoneSvg.replace(/^<(\w+)/, `<$1 fill="${subSt.fill}" fill-opacity="0.88" style="cursor:pointer;" onclick="selectAnatomyMuscle('${mId}', '${col.key}', event)"`);
                        return `<g><title>[${idx + 1}] ${escapeHTML(mObj.name || mId)} — ${escapeHTML(subSt.tooltip)}</title>${withAttrs}</g>`;
                    }).join('\n');

                    const outerStrokeWidth = pStyle.isSel ? '3.2' : '1.6';
                    const outerStrokeColor = pStyle.isSel ? '#0F172A' : '#1E293B';
                    const divStrokeWidth = pStyle.isSel ? '2.8' : '1.8';

                    groupsHTML += `
                        <g class="${pStyle.cls}" data-muscle="${mId}" onclick="selectAnatomyMuscle('${mId}', null, event)">
                            <g clip-path="url(#clip_anat_${mId})">
                                ${zonesHTML}
                                <path d="${subGeom.dividers}" fill="none" stroke="#FFFFFF" stroke-width="${Number(divStrokeWidth) + 1.4}" stroke-linecap="round" opacity="0.85" pointer-events="none"/>
                                <path d="${subGeom.dividers}" fill="none" stroke="#0F172A" stroke-width="${divStrokeWidth}" stroke-dasharray="${pStyle.isSel ? 'none' : '4,3'}" stroke-linecap="round" pointer-events="none"/>
                            </g>
                            <path d="${d}" fill="none" stroke="${outerStrokeColor}" stroke-width="${outerStrokeWidth}" pointer-events="none"/>
                        </g>
                    `;

                    if (pStyle.isSel && Array.isArray(subGeom.pins)) {
                        subGeom.pins.forEach(pin => {
                            const cData = compMap[pin.key];
                            const isDone = cData && cData.earnedSets > 0;
                            const isPlan = cData && !isDone && cData.plannedExs && cData.plannedExs.size > 0;
                            const badgeFill = isDone ? '#15803D' : (isPlan ? '#B45309' : '#B91C1C');
                            selectedPinsHTML += `
                                <g transform="translate(${pin.x}, ${pin.y})" style="cursor:pointer;" onclick="selectAnatomyMuscle('${mId}', '${pin.key}', event)">
                                    <circle cx="0" cy="0" r="16" fill="#FFFFFF" stroke="${badgeFill}" stroke-width="3"/>
                                    <circle cx="0" cy="0" r="12.5" fill="${badgeFill}"/>
                                    <text x="0" y="5" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="900">${pin.num}</text>
                                </g>
                            `;
                        });
                    }
                } else {
                    groupsHTML += `<path class="${pStyle.cls}" data-muscle="${mId}" onclick="selectAnatomyMuscle('${mId}', null, event)" d="${d}" fill="${pStyle.fill}" fill-opacity="0.88" stroke="${pStyle.stroke}" stroke-width="1.5"><title>${pStyle.tooltip}</title></path>`;
                }
            });

            return `
            <svg class="anatomy-svg" viewBox="0 0 1150 1520" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    ${defsHTML}
                </defs>
                <!-- TITLES -->
                <text x="226" y="30" text-anchor="middle" fill="#0F172A" font-family="'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="900" letter-spacing="1.5">ÖN VÜCUT</text>
                <text x="226" y="52" text-anchor="middle" fill="#64748B" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" letter-spacing="1">ÖNDEN GÖRÜNÜM (ALT KAS AYRIMLI)</text>
                
                <text x="902" y="30" text-anchor="middle" fill="#0F172A" font-family="'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="900" letter-spacing="1.5">ARKA VÜCUT</text>
                <text x="902" y="52" text-anchor="middle" fill="#64748B" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" letter-spacing="1">ARKADAN GÖRÜNÜM (ALT KAS AYRIMLI)</text>
                
                <!-- CENTER DIVIDER -->
                <line x1="564" y1="20" x2="564" y2="1490" stroke="#CBD5E1" stroke-width="2.5" stroke-dasharray="8,8"/>

                <!-- REAL CANVA HIGH-RES ATHLETIC BASE FIGURE -->
                <image href="./assets/diagrams/canva_anatomy_neutral.png" x="0" y="60" width="1150" height="1475" />

                <!-- DYNAMICALLY TINTED SUB-MUSCLE OVERLAYS & ANATOMICAL PARTITIONS -->
                ${groupsHTML}

                <!-- NUMBERED CALLOUT PINS FOR SELECTED MUSCLE SUB-REGIONS -->
                ${selectedPinsHTML}
            </svg>
            `;
        }

        function renderWeeklyMuscleSufficiencySection() {
            const analysis = calculateWeeklyMuscleSufficiency(currentWeeklyMuscleSource, currentWeeklyMuscleWeekOffset);
            const { summary, bounds, sourceMode, weekOffset } = analysis;
            const optimalTotal = summary.optimalCount + summary.highCount;

            let subWorkedCount = 0;
            let subPlannedCount = 0;
            let subUnworkedCount = 0;
            const subWorkedList = [];
            const subPlannedList = [];
            const subUnworkedList = [];
            analysis.muscles.forEach(m => {
                const def = MUSCLE_DIAGRAM_DEFS[m.id];
                const compMap = computeMuscleCompartmentMap(m);
                if (!def || !compMap) return;
                def.columns.forEach((col, idx) => {
                    const cData = compMap[col.key];
                    const isDone = cData && cData.earnedSets > 0;
                    const isPlan = cData && !isDone && cData.plannedExs && cData.plannedExs.size > 0;
                    const item = {
                        muscleId: m.id,
                        muscleName: m.name,
                        colKey: col.key,
                        colLabel: col.label,
                        num: idx + 1,
                        earnedSets: cData ? cData.earnedSets : 0,
                        plannedCount: cData ? cData.plannedCount : 0,
                        recId: col.recId,
                        recName: col.recName
                    };
                    if (isDone) {
                        subWorkedCount++;
                        subWorkedList.push(item);
                    } else if (isPlan) {
                        subPlannedCount++;
                        subPlannedList.push(item);
                    } else {
                        subUnworkedCount++;
                        subUnworkedList.push(item);
                    }
                });
            });

            // Resolve currently selected muscle for focus card
            let activeId = currentSelectedAnatomyMuscle;
            let activeMuscle = analysis.muscles.find(m => m.id === activeId);
            if (!activeMuscle) {
                // Smart auto-select: First unworked, else first insufficient, else first muscle
                activeMuscle = analysis.muscles.find(m => m.status === 'unworked')
                    || analysis.muscles.find(m => m.status === 'insufficient')
                    || analysis.muscles[0];
                activeId = activeMuscle ? activeMuscle.id : 'chest';
                currentSelectedAnatomyMuscle = activeId;
            }

            // Quick source buttons (3-column compact segmented bar)
            const sourceButtons = `
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-top:8px; background:#F8FAFC; padding:4px; border-radius:10px; border:1px solid #E2E8F0;">
                    <button class="btn btn-outline" style="font-size:11.5px; padding:6px 4px; border-radius:7px; white-space:nowrap; ${sourceMode === 'week_projected' ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : 'border-color:transparent;'}" onclick="setWeeklyMuscleSource('week_projected')">
                        Yapılan + Plan
                    </button>
                    <button class="btn btn-outline" style="font-size:11.5px; padding:6px 4px; border-radius:7px; white-space:nowrap; ${sourceMode === 'week_done' ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : 'border-color:transparent;'}" onclick="setWeeklyMuscleSource('week_done')">
                        Yapılan (${analysis.totalDoneSessions})
                    </button>
                    <button class="btn btn-outline" style="font-size:11.5px; padding:6px 4px; border-radius:7px; white-space:nowrap; ${sourceMode === 'schedule_full' ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : 'border-color:transparent;'}" onclick="setWeeklyMuscleSource('schedule_full')">
                        Şablon
                    </button>
                </div>
            `;

            // SVG Body Model
            const bodySvgHTML = renderAnatomicalBodySVG(analysis.muscles, activeId);

            // Horizontal Quick Muscle Chips
            const chipsHTML = `
                <div class="anatomy-chips-scroll">
                    ${analysis.muscles.map(m => {
                        const shownSets = (m.effectiveTotal !== undefined ? m.effectiveTotal : m.effectiveDone);
                        let dotColor = (m.status === 'optimal' || m.status === 'high') ? '#16A34A' : (m.status === 'insufficient' ? '#F59E0B' : '#EF4444');
                        let isSelected = (m.id === activeId);
                        return `
                            <button type="button" class="anatomy-chip ${isSelected ? 'selected' : ''}" onclick="selectAnatomyMuscle('${m.id}')" title="${escapeHTML(m.name)}: ${shownSets.toFixed(1)} Set (${m.statusBadge || ''})">
                                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${dotColor}; flex-shrink:0;"></span>
                                <span class="chip-name">${escapeHTML(m.name)}</span>
                                <span class="chip-sets">${shownSets.toFixed(0)}s</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            `;

            // Build Focused Muscle Card Content
            let focusCardHTML = '';
            if (activeMuscle) {
                const m = activeMuscle;
                const shownSets = (m.effectiveTotal !== undefined ? m.effectiveTotal : m.effectiveDone);
                const def = MUSCLE_DIAGRAM_DEFS[m.id];
                const recCol = def && def.columns && def.columns[0] ? def.columns[0] : null;
                const recExId = recCol ? recCol.recId : 'db_bench_press';
                const recExName = recCol ? recCol.recName : 'Temel Egzersiz';

                let statusBadge = '';
                let statusClass = 'status-optimal';
                if (m.status === 'optimal' || m.status === 'high') {
                    statusClass = 'status-optimal';
                    statusBadge = `<span style="background:#DCFCE7; border:1px solid #86EFAC; color:#15803D; font-size:11.5px; font-weight:800; padding:4px 10px; border-radius:6px;">İdeal Seviye (${shownSets.toFixed(1)} Set)</span>`;
                } else if (m.status === 'insufficient') {
                    statusClass = 'status-insufficient';
                    statusBadge = `<span style="background:#FEF3C7; border:1px solid #FCD34D; color:#B45309; font-size:11.5px; font-weight:800; padding:4px 10px; border-radius:6px;">Az Çalıştı (${shownSets.toFixed(1)} / Hedef: ${m.optimalMin}-${m.optimalMax} Set)</span>`;
                } else {
                    statusClass = 'status-unworked';
                    statusBadge = `<span style="background:#FEE2E2; border:1px solid #FCA5A5; color:#B91C1C; font-size:11.5px; font-weight:800; padding:4px 10px; border-radius:6px;">0 Set — Henüz Çalışmadı</span>`;
                }

                const pct = Math.min(100, Math.round((shownSets / m.optimalMin) * 100));
                let barColor = '#ef4444';
                if (m.status === 'optimal' || m.status === 'high') barColor = '#10b981';
                else if (m.status === 'insufficient') barColor = '#f59e0b';

                // Subregion Grid
                const subregionHTML = (typeof renderMuscleCompartmentDiagram === 'function') ? renderMuscleCompartmentDiagram(m) : '';

                // Quick Action Button
                let actionBtnHTML = '';
                if (m.status === 'unworked' || m.status === 'insufficient') {
                    actionBtnHTML = `
                        <div style="margin-top:12px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            <button class="btn btn-gold" style="flex:1; min-width:180px; padding:10px 14px; font-size:13px; font-weight:800; border-radius:8px;" onclick="openQuickAddToDayModal('${recExId}')">
                                + ${escapeHTML(recExName)} Ekle (${escapeHTML(m.name)} Takviyesi)
                            </button>
                        </div>
                    `;
                } else {
                    actionBtnHTML = `
                        <div style="margin-top:10px; font-size:12px; color:#15803D; font-weight:700; display:flex; align-items:center; gap:6px;">
                            <span>Bu bölge bu hafta yeterince çalıştı (${shownSets.toFixed(1)} Set).</span>
                        </div>
                    `;
                }

                focusCardHTML = `
                    <div id="anatomyFocusCard" class="anatomy-focus-card ${statusClass}">
                        <!-- Card Header -->
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <h4 style="font-size:16px; font-weight:900; color:#0F172A; margin:0;">${escapeHTML(m.name)}</h4>
                            </div>
                            <div>${statusBadge}</div>
                        </div>

                        <!-- Progress Bar -->
                        <div style="margin-top:12px;">
                            <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--text-secondary); margin-bottom:4px; font-weight:600;">
                                <span>Haftalık Tamamlanma: % ${pct}</span>
                                <span>${shownSets.toFixed(1)} / ${m.optimalMin}-${m.optimalMax} Set</span>
                            </div>
                            <div style="height:6px; background:#E2E8F0; border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:${pct}%; background:${barColor}; border-radius:3px; transition:width 0.3s ease;"></div>
                            </div>
                        </div>

                        <!-- 2-Katmanlı Anatomik Alt Bölge Grid -->
                        ${subregionHTML}

                        <!-- Action Button -->
                        ${actionBtnHTML}

                        <!-- Collapsible Lineage Dropdown -->
                        <div style="margin-top:10px; padding-top:8px; border-top:1px solid #E2E8F0;">
                            <button id="lineage_btn_${m.id}" class="btn btn-outline" style="width:100%; font-size:12px; padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border-color:#CBD5E1; cursor:pointer;" onclick="toggleMuscleLineage('${m.id}')">
                                <span>Hangi Seans & Hareketten Geldi? (${(m.contributions || []).length} Kayıt)</span>
                                <span style="color:#B45309; font-size:11.5px; font-weight:800;">Detay</span>
                            </button>

                            <div id="lineage_box_${m.id}" data-count="${(m.contributions || []).length}" style="display:none; margin-top:8px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:10px;">
                                ${(m.contributions && m.contributions.length > 0) ? `
                                    <div style="display:flex; flex-direction:column; gap:6px;">
                                        <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:2px; font-weight:700;">
                                            Tamamlanan Seanslar & Puan Katkısı:
                                        </div>
                                        ${m.contributions.map(c => `
                                            <div style="display:flex; justify-content:space-between; align-items:center; background:#F1F5F9; border:1px solid #E2E8F0; border-radius:6px; padding:6px 10px; font-size:12px;">
                                                <div>
                                                    <div style="display:flex; align-items:center; gap:6px;">
                                                        <strong style="color:#0F172A;">${escapeHTML(c.exercise)}</strong>
                                                        <span style="font-size:10.5px; padding:2px 6px; border-radius:4px; font-weight:700; ${(c.role === 'Birincil' || c.role === 'Ana Hedef') ? 'background:#FEF3C7; color:#B45309;' : 'background:#E0F2FE; color:#0369A1;'}">
                                                            ${c.role} (${c.factor}x)
                                                        </span>
                                                    </div>
                                                    <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                                        ${escapeHTML(c.date)} • ${escapeHTML(c.sessionTitle)}
                                                    </div>
                                                </div>
                                                <div style="text-align:right;">
                                                    <div style="font-size:12.5px; font-weight:900; color:#15803D;">+${c.earnedSets.toFixed(1)} Set</div>
                                                    <div style="font-size:10.5px; color:var(--text-secondary);">${c.rawSets} Set Yapıldı</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="font-size:12px; color:var(--text-secondary); text-align:center; padding:8px 6px;">
                                        Bu hafta bu kas grubu için henüz tamamlanmış bir seans kaydı bulunmuyor.
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <!-- ANATOMICAL BODY & WEEKLY SUFFICIENCY HERO -->
                <div class="anatomy-hero-wrapper">
                    <!-- HEADER -->
                    <div class="anatomy-top-bar" style="align-items:center;">
                        <h3 style="font-size:15.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">Haftalık Kas Haritası</h3>

                        <!-- Mini Week Switcher -->
                        <div style="display:flex; align-items:center; gap:4px;">
                            <button class="btn btn-outline" style="padding:4px 8px; font-size:12px; border-radius:6px;" onclick="setWeeklyMuscleOffset(${weekOffset - 1})" title="Önceki Hafta">&lsaquo;</button>
                            <span style="font-size:11.5px; font-weight:800; color:#0F172A; padding:4px 8px; background:#F8FAFC; border-radius:6px; border:1px solid var(--border); white-space:nowrap;">
                                ${escapeHTML(bounds.label)}
                            </span>
                            <button class="btn btn-outline" style="padding:4px 8px; font-size:12px; border-radius:6px;" onclick="setWeeklyMuscleOffset(${weekOffset + 1})" title="Sonraki Hafta">&rsaquo;</button>
                            ${weekOffset !== 0 ? `<button class="btn btn-outline" style="padding:4px 8px; font-size:11px; border-radius:6px; color:#0369A1; border-color:#0369A1;" onclick="setWeeklyMuscleOffset(0)">Bugün</button>` : ''}
                        </div>
                    </div>

                    <!-- SOURCE TOGGLES -->
                    ${sourceButtons}

                    <!-- 3 VISUAL STATUS COUNTERS (COMPACT 3-COLUMN BAR) -->
                    <div class="anatomy-legend" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;">
                        <div class="anatomy-legend-item optimal" style="cursor:pointer; justify-content:center; padding:6px 4px; ${currentWeeklyMuscleFilter === 'optimal' ? 'box-shadow: 0 0 0 2.5px #15803D; background:#DCFCE7;' : ''}" onclick="setWeeklyMuscleFilter('optimal')" title="İyi çalışan ana kas gruplarını ve alt kasları listele">
                            <div class="badge-dot"></div>
                            <span class="badge-val">${optimalTotal}</span>
                            <span class="badge-label" style="white-space:nowrap; font-size:11px;">İyi (${subWorkedCount} Alt)</span>
                        </div>
                        <div class="anatomy-legend-item insufficient" style="cursor:pointer; justify-content:center; padding:6px 4px; ${currentWeeklyMuscleFilter === 'insufficient' ? 'box-shadow: 0 0 0 2.5px #B45309; background:#FEF3C7;' : ''}" onclick="setWeeklyMuscleFilter('insufficient')" title="Az çalışan / planda olan ana kas gruplarını ve alt kasları listele">
                            <div class="badge-dot"></div>
                            <span class="badge-val">${summary.insufficientCount}</span>
                            <span class="badge-label" style="white-space:nowrap; font-size:11px;">Planda (${subPlannedCount} Alt)</span>
                        </div>
                        <div class="anatomy-legend-item unworked" style="cursor:pointer; justify-content:center; padding:6px 4px; ${currentWeeklyMuscleFilter === 'unworked' ? 'box-shadow: 0 0 0 2.5px #B91C1C; background:#FEE2E2;' : ''}" onclick="setWeeklyMuscleFilter('unworked')" title="Hiç çalışmayan ana kas gruplarını ve 0 set kalan alt kasları listele">
                            <div class="badge-dot"></div>
                            <span class="badge-val">${summary.unworkedCount}</span>
                            <span class="badge-label" style="white-space:nowrap; font-size:11px;">Boşta (${subUnworkedCount} Alt)</span>
                        </div>
                    </div>

                    <!-- INTERACTIVE ANATOMICAL BODY SVG -->
                    <div class="anatomy-svg-box">
                        ${bodySvgHTML}
                    </div>

                    <!-- QUICK SELECT CHIPS -->
                    ${chipsHTML}

                    <!-- FILTERED MUSCLES & SUB-MUSCLES DRAWER -->
                    ${(() => {
                        if (!currentWeeklyMuscleFilter || currentWeeklyMuscleFilter === 'all') return '';
                        const isOpt = currentWeeklyMuscleFilter === 'optimal';
                        const isIns = currentWeeklyMuscleFilter === 'insufficient';
                        const titleText = isOpt
                            ? `İyi Çalışan Bölgeler (${optimalTotal} Ana Grup • ${subWorkedCount} Alt Kas)`
                            : (isIns ? `Az Çalışan & Planda Olan Bölgeler (${summary.insufficientCount} Ana Grup • ${subPlannedCount} Alt Kas)` : `Çalışmayan (0 Set) Bölgeler (${summary.unworkedCount} Ana Grup • ${subUnworkedCount} Alt Kas)`);
                        const borderCol = isOpt ? '#86EFAC' : (isIns ? '#FCD34D' : '#FCA5A5');
                        const headerBg = isOpt ? '#DCFCE7' : (isIns ? '#FEF3C7' : '#FEE2E2');
                        const headerColor = isOpt ? '#15803D' : (isIns ? '#B45309' : '#B91C1C');

                        const mainMatches = analysis.muscles.filter(m => isOpt ? (m.status === 'optimal' || m.status === 'high') : m.status === currentWeeklyMuscleFilter);
                        const subMatches = isOpt ? subWorkedList : (isIns ? subPlannedList : subUnworkedList);

                        const mainHTML = mainMatches.length > 0
                            ? mainMatches.map(m => {
                                const s = (m.effectiveTotal !== undefined ? m.effectiveTotal : m.effectiveDone);
                                return `<button type="button" class="btn btn-outline" style="font-size:12px; padding:6px 12px; border-radius:8px; background:#FFFFFF; color:#0F172A; border-color:${borderCol}; font-weight:800;" onclick="selectAnatomyMuscle('${m.id}')">${escapeHTML(m.name)} (${s.toFixed(1)} Set)</button>`;
                            }).join('')
                            : `<span style="font-size:12px; color:#475569;">Bu kategoride ana kas grubu yok.</span>`;

                        const subHTML = subMatches.length > 0
                            ? subMatches.map(it => {
                                const meta = isOpt ? `${it.earnedSets.toFixed(1)} Set` : (isIns ? `Planda (${it.plannedCount} Hrk)` : `0 Set`);
                                const quickAddBtn = (!isOpt && !isIns && it.recId)
                                    ? `<button type="button" class="btn btn-outline" style="font-size:11px; padding:4px 8px; border-radius:6px; background:#FEF2F2; color:#B91C1C; border-color:#FECACA; font-weight:800;" onclick="openQuickAddToDayModal('${it.recId}')">+ ${escapeHTML(it.recName)} Ekle</button>`
                                    : '';
                                return `
                                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:7px 10px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px;">
                                        <button type="button" style="background:none; border:none; padding:0; text-align:left; cursor:pointer; color:#0F172A; font-size:12px; font-weight:800; display:flex; align-items:center; gap:6px;" onclick="selectAnatomyMuscle('${it.muscleId}', '${it.colKey}', event)">
                                            <span style="display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:${headerColor}; color:#FFFFFF; font-size:11px; font-weight:900;">${it.num}</span>
                                            <span><strong>${escapeHTML(it.muscleName)}</strong> &rarr; ${escapeHTML(it.colLabel)}</span>
                                            <span style="font-size:11px; color:${headerColor}; font-weight:800;">(${meta})</span>
                                        </button>
                                        ${quickAddBtn}
                                    </div>
                                `;
                            }).join('')
                            : `<span style="font-size:12px; color:#475569;">Bu kategoride alt kas bölgesi yok.</span>`;

                        return `
                            <div id="anatomyFilterResultsBox" style="margin:12px 0; border:1.5px solid ${borderCol}; border-radius:12px; overflow:hidden; background:#FFFFFF;">
                                <div style="background:${headerBg}; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid ${borderCol};">
                                    <span style="font-size:12.5px; font-weight:900; color:${headerColor};">${titleText}</span>
                                    <button type="button" class="btn btn-outline" style="font-size:11px; padding:3px 9px; border-radius:6px; background:#FFFFFF; color:#0F172A; border-color:${borderCol}; font-weight:800;" onclick="setWeeklyMuscleFilter('all')">Kapat ✕</button>
                                </div>
                                <div style="padding:12px; display:flex; flex-direction:column; gap:10px;">
                                    <div>
                                        <div style="font-size:11px; font-weight:800; color:#475569; margin-bottom:6px; text-transform:uppercase;">Ana Kas Grupları (${mainMatches.length}):</div>
                                        <div style="display:flex; gap:6px; flex-wrap:wrap;">${mainHTML}</div>
                                    </div>
                                    <div>
                                        <div style="font-size:11px; font-weight:800; color:#475569; margin-bottom:6px; text-transform:uppercase;">Şekildeki Alt Kas Bölgeleri (${subMatches.length}) — Tıklayıp İncele:</div>
                                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:6px;">${subHTML}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    })()}

                    <!-- SELECTED MUSCLE FOCUS CARD -->
                    ${focusCardHTML}
                </div>
            `;
        }

        function toggleMuscleLineage(muscleId) {
            const elBox = document.getElementById(`lineage_box_${muscleId}`);
            const elBtn = document.getElementById(`lineage_btn_${muscleId}`);
            if (!elBox) return;
            const isHidden = elBox.style.display === 'none';
            elBox.style.display = isHidden ? 'block' : 'none';
            if (elBtn) {
                const count = elBox.dataset.count || 0;
                elBtn.innerHTML = isHidden 
                    ? `<span>Hangi Seans & Hareketten Geldi? (${count} Kayıt)</span><span style="color:#B45309; font-size:11.5px; font-weight:800;">Kapat</span>`
                    : `<span>Hangi Seans & Hareketten Geldi? (${count} Kayıt)</span><span style="color:#B45309; font-size:11.5px; font-weight:800;">Detay</span>`;
            }
        }

        function toggleMuscleRecommendations(muscleId) {
            const elBox = document.getElementById(`recs_box_${muscleId}`);
            const elIcon = document.getElementById(`recs_icon_${muscleId}`);
            if (!elBox) return;
            const isHidden = elBox.style.display === 'none';
            elBox.style.display = isHidden ? 'block' : 'none';
            if (elIcon) {
                elIcon.textContent = isHidden ? 'Gizle' : 'Göster';
            }
        }

        function renderMuscleAnalytics(container) {
            const allLogs = getWorkoutLogs();
            const days = currentAnalyticsPeriodDays;
            const now = new Date();
            const cutoff = days > 0 ? new Date(now.getTime() - (days * 24 * 60 * 60 * 1000)) : null;

            const filteredLogs = cutoff ? allLogs.filter(l => new Date(l.date) >= cutoff) : allLogs;

            let weeklySufficiencyHTML = '';
            try {
                weeklySufficiencyHTML = renderWeeklyMuscleSufficiencySection();
            } catch (err) {
                console.error("Weekly muscle sufficiency error:", err);
                weeklySufficiencyHTML = `<div style="padding:14px; background:#FEE2E2; border:1px solid #FCA5A5; border-radius:10px; color:#B91C1C; font-size:12px; margin-bottom:14px;">Kas Haritası yüklenirken bir sorun oluştu: ${escapeHTML(err.message)}</div>`;
            }

            let mobilityBridgeHTML = '';
            try {
                if (typeof renderCompactMobilityBridgeCard === 'function') {
                    mobilityBridgeHTML = renderCompactMobilityBridgeCard();
                }
            } catch (err) {
                console.error("Mobility bridge card error:", err);
            }

            const timeFilterHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px; background:#F8FAFC; padding:8px 12px; border-radius:10px; border:1px solid var(--border);">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:13px; font-weight:900; color:#0F172A; white-space:nowrap;">Tonaj & Bölge Özeti</span>
                        <button type="button" class="wk-ex-i-btn" onclick="openAnalyticsInfoModal('tonnage')" title="Hesaplama Bilgisi">i</button>
                    </div>
                    <div style="display:flex; gap:4px;">
                        <button class="btn btn-outline" style="font-size:11.5px; padding:4px 9px; border-radius:8px; ${days === 7 ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : ''}" onclick="setAnalyticsPeriod(7)">7G</button>
                        <button class="btn btn-outline" style="font-size:11.5px; padding:4px 9px; border-radius:8px; ${days === 30 ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : ''}" onclick="setAnalyticsPeriod(30)">30G</button>
                        <button class="btn btn-outline" style="font-size:11.5px; padding:4px 9px; border-radius:8px; ${days === 90 ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : ''}" onclick="setAnalyticsPeriod(90)">90G</button>
                        <button class="btn btn-outline" style="font-size:11.5px; padding:4px 9px; border-radius:8px; ${days === 0 ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : ''}" onclick="setAnalyticsPeriod(0)">Tümü</button>
                    </div>
                </div>
            `;

            if (filteredLogs.length === 0) {
                container.innerHTML = weeklySufficiencyHTML + mobilityBridgeHTML + timeFilterHTML + `
                    <div style="background:var(--bg-surface); padding:18px; text-align:center; border:1px solid var(--border); border-radius:10px; color:var(--text-secondary); font-size:12.5px;">
                        Bu dönemde kayıtlı antrenman yok.
                    </div>
                `;
                return;
            }

            let totalVolume = 0;
            let totalSets = 0;
            let totalReps = 0;

            const pillars = {
                legs: { label: 'Bacak & Kalça', icon: '', color: '#10b981', textColor: '#15803D', volume: 0, sets: 0 },
                back: { label: 'Sırt & Çekiş', icon: '', color: '#0284C7', textColor: '#0369A1', volume: 0, sets: 0 },
                chest: { label: 'Göğüs & Omuz', icon: '', color: '#D97706', textColor: '#B45309', volume: 0, sets: 0 },
                arms: { label: 'Kollar', icon: '', color: '#9333EA', textColor: '#6B21A8', volume: 0, sets: 0 },
                core: { label: 'Karın & Bel', icon: '', color: '#E11D48', textColor: '#BE123C', volume: 0, sets: 0 }
            };

            const prMap = {};

            filteredLogs.forEach(log => {
                let logVol = (log.totalVolumeKg || 0);
                let computedLogVol = 0;
                let computedLogSets = 0;
                let computedLogReps = 0;

                if (log.exercises && log.exercises.length > 0) {
                    log.exercises.forEach(ex => {
                        let exVol = ex.exerciseVolume || 0;
                        const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                            ? Number(ex.completedSetsCount)
                            : (Array.isArray(ex.sets) ? ex.sets.filter(s => s && s.completed).length : (Number(ex.sets) || 0));
                        if (cSets <= 0) return;

                        computedLogSets += cSets;
                        if (Array.isArray(ex.sets)) {
                            ex.sets.forEach(st => {
                                if (st && st.completed) {
                                    computedLogReps += (Number(st.reps) || 0);
                                }
                            });
                        } else if (ex.reps) {
                            computedLogReps += cSets * (parseInt(ex.reps, 10) || 10);
                        }

                        // If exVol is 0 but sets were completed, calculate academic volume (BW / TUT equivalence)
                        if (exVol === 0 && Array.isArray(ex.sets)) {
                            ex.sets.forEach(st => {
                                if (st && st.completed) {
                                    exVol += calculateExerciseSetVolume(ex, st.weight, st.reps);
                                }
                            });
                        }
                        computedLogVol += exVol;
                        if (cSets === 0 && exVol === 0) return;

                        const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
                        const normExName = normSearchText(ex.name || '');
                        const isRearOrPullShoulder = /face pull|rear delt|arka omuz|ters fly|reverse fly|pull apart|halo|high pull|snatch|cuban/.test(normExName);
                        const shares = [];
                        if (spec.primary && spec.pFactor > 0) {
                            shares.push({ muscle: spec.primary, factor: spec.pFactor });
                        }
                        if (spec.sec && typeof spec.sec === 'object') {
                            Object.entries(spec.sec).forEach(([mName, factor]) => {
                                if (factor > 0) shares.push({ muscle: mName, factor: factor });
                            });
                        }

                        const sumFactor = shares.reduce((acc, s) => acc + s.factor, 0);

                        if (sumFactor > 0) {
                            shares.forEach(s => {
                                const ratio = s.factor / sumFactor;
                                const mId = ACADEMIC_MUSCLE_TO_ID[s.muscle] || s.muscle;
                                let targetPillar = null;
                                if (['quads', 'hamstrings', 'glutes', 'calves'].includes(mId)) targetPillar = pillars.legs;
                                else if (mId === 'back') targetPillar = pillars.back;
                                else if (mId === 'shoulders' && isRearOrPullShoulder) targetPillar = pillars.back;
                                else if (['chest', 'shoulders'].includes(mId)) targetPillar = pillars.chest;
                                else if (['biceps', 'triceps'].includes(mId)) targetPillar = pillars.arms;
                                else if (mId === 'core') targetPillar = pillars.core;

                                if (targetPillar) {
                                    targetPillar.volume += (exVol * ratio);
                                    targetPillar.sets += Math.round((cSets * ratio) * 10) / 10;
                                }
                            });
                        } else if (spec.type === 'CONDITIONING') {
                            const pKeys = Object.keys(pillars);
                            pKeys.forEach(k => {
                                pillars[k].volume += (exVol / pKeys.length);
                                pillars[k].sets += Math.round((cSets / pKeys.length) * 10) / 10;
                            });
                        } else {
                            pillars.legs.volume += (exVol * 0.5);
                            pillars.back.volume += (exVol * 0.5);
                            pillars.legs.sets += (cSets * 0.5);
                            pillars.back.sets += (cSets * 0.5);
                        }

                        // Track PRs
                        if (ex.maxWeight && ex.maxWeight > 0) {
                            if (!prMap[ex.name] || ex.maxWeight > prMap[ex.name].weight) {
                                prMap[ex.name] = { weight: ex.maxWeight, date: log.dateFormatted || log.date, muscle: ex.muscle || spec.primary || '' };
                            }
                        }
                    });
                }

                if (logVol === 0 && computedLogVol > 0) {
                    logVol = computedLogVol;
                }
                totalVolume += logVol;
                totalSets += (log.totalSetsCompleted || computedLogSets || 0);
                totalReps += (log.totalRepsCompleted || computedLogReps || 0);
            });

            const sessionsCount = filteredLogs.length;
            const avgSessionVol = sessionsCount > 0 ? Math.round(totalVolume / sessionsCount) : 0;
            const totalPillarsVol = Object.values(pillars).reduce((sum, p) => sum + p.volume, 0) || 1;

            // Push vs Pull ratio
            const pushTotal = pillars.chest.volume + (pillars.arms.volume * 0.4);
            const pullTotal = pillars.back.volume + (pillars.arms.volume * 0.6);
            const pushPullRatio = pushTotal > 0 ? (pullTotal / pushTotal).toFixed(2) : '1.00';

            let balanceBadge = '✅ Mükemmel Denge';
            let balanceColor = '#15803D';
            let balanceDesc = 'İtiş ve çekiş hacminiz dengeli; omuz ve omurga sağlığınız korunuyor.';
            if (pushPullRatio < 0.85) {
                balanceBadge = '⚠️ İtiş Hacmi Baskın';
                balanceColor = '#B45309';
                balanceDesc = 'Göğüs ve omuz itiş tonajınız sırttan yüksek. Omuz sakatlığı riskini önlemek için sırt ve kürek hareketlerine ağırlık verin.';
            } else if (pushPullRatio > 1.35) {
                balanceBadge = '⚠️ Çekiş Hacmi Baskın';
                balanceColor = '#0369A1';
                balanceDesc = 'Sırt çekiş hacminiz itişten belirgin şekilde fazla. İtiş egzersizlerinizi artırabilirsiniz.';
            }

            const sortedPrs = Object.keys(prMap).map(k => ({ name: k, ...prMap[k] })).sort((a,b) => b.weight - a.weight).slice(0, 6);

            container.innerHTML = weeklySufficiencyHTML + mobilityBridgeHTML + timeFilterHTML + `
                <!-- KPI STATS (2x2 COMPACT GRID) -->
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-bottom:12px;">
                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                        <div style="font-size:16px; font-weight:900; color:var(--gold); margin-top:2px;">🏋️ ${Math.round(totalVolume).toLocaleString('tr-TR')} kg</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:1px;">${sessionsCount} Seans</div>
                    </div>
                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">SEANS ORT.</div>
                        <div style="font-size:16px; font-weight:900; color:var(--cyan); margin-top:2px;">⚡ ${avgSessionVol.toLocaleString('tr-TR')} kg</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:1px;">Yoğunluk</div>
                    </div>
                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">SET & TEKRAR</div>
                        <div style="font-size:16px; font-weight:900; color:var(--green-success); margin-top:2px;">🎯 ${totalSets} / ${totalReps}</div>
                        <div style="font-size:10px; color:var(--text-secondary); margin-top:1px;">Toplam İş</div>
                    </div>
                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:10px; color:var(--text-secondary); font-weight:700;">İTİŞ / ÇEKİŞ</span>
                            <button type="button" class="wk-ex-i-btn" style="width:22px; height:22px; font-size:12px;" onclick="openAnalyticsInfoModal('posture', '${pushPullRatio}', '${Math.round(pullTotal)}', '${Math.round(pushTotal)}')" title="Duruş Dengesi Detayı">i</button>
                        </div>
                        <div style="font-size:16px; font-weight:900; color:${balanceColor}; margin-top:2px;">⚖️ ${pushPullRatio}</div>
                        <div style="font-size:10px; color:${balanceColor}; margin-top:1px; white-space:nowrap;">${balanceBadge}</div>
                    </div>
                </div>

                <!-- MUSCLE PILLARS VOLUME BARS -->
                <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:12px 14px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h3 style="font-size:13.5px; font-weight:800; color:#0F172A; margin:0;">Bölge Dağılımı</h3>
                        <span style="font-size:11px; color:var(--gold); font-weight:700;">Toplam Yük</span>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${Object.keys(pillars).map(key => {
                            const p = pillars[key];
                            const pct = Math.round((p.volume / totalPillarsVol) * 100);
                            return `
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                                        <span style="color:#0F172A;">${p.label}</span>
                                        <span style="color:${p.textColor || p.color};">${Math.round(p.volume).toLocaleString('tr-TR')} kg <span style="color:var(--text-secondary); font-size:11px;">(%${pct} • ${(Math.round(p.sets * 10) / 10).toFixed(0)} Set)</span></span>
                                    </div>
                                    <div class="analytics-bar-bg" style="margin-top:4px;">
                                        <div class="analytics-bar-fill" style="width:${Math.min(100, Math.max(4, pct))}%; background:${p.color};"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- PR RECORDS TABLE -->
                ${sortedPrs.length > 0 ? `
                    <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:12px 14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <h3 style="font-size:13.5px; font-weight:800; color:#0F172A; margin:0;">🏆 Kişisel Rekorlar</h3>
                            <span style="font-size:11px; color:var(--cyan); font-weight:700;">Zirve Kilolar</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            ${sortedPrs.map((pr, idx) => `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; padding:7px 10px; border-radius:8px; border-left:3px solid var(--gold);">
                                    <div style="min-width:0;">
                                        <div style="font-size:12px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">#${idx+1} ${escapeHTML(pr.name)}</div>
                                        <div style="font-size:10.5px; color:var(--text-secondary);">${escapeHTML(pr.date)}</div>
                                    </div>
                                    <div style="font-size:14px; font-weight:900; color:var(--gold); white-space:nowrap; margin-left:8px;">
                                        ${pr.weight} kg
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }

        // ==================== AKADEMİK MOBİLİTE İNDEKSİ & KİNEMATİK ANALİZ MOTORU (YAKLAŞIM 2) ====================
        // Bilimsel Referanslar:
        // 1. Alizadeh et al. (2023 - Sports Medicine Meta-Analysis): Direnç antrenmanında uç-açıklık (Lengthened / End-Range) yüklenmesinin sarcomerogenesis ve ROM etkisi.
        // 2. Gray Cook & Mike Boyle (Joint-by-Joint Approach): 4 Ana Mobil Eklem Merkezi (Omuz Kapsülü, Torasik Omurga, Kalça Kapsülü, Ayak Bileği Dorsifleksiyonu).
        // 3. Gary Gray (3D Multi-Planar Kinematics): Sagittal (1B), Frontal (2B) ve Transvers/Rotasyonel (3B) uzaysal hareket düzlemleri.
        // 4. Klinik Öz-Değerlendirme (FMS / Active ROM Benchmark): 4 Temel Vücut Hareketlilik Testi (Seviye 1-4) ve Neden-Sonuç korelasyonu.

        const WEEKLY_MOBILITY_JOINT_CONFIG = [
            {
                id: 'shoulder_cap',
                name: '🛡️ Omuz Açıklığı',
                shortName: 'Omuz',
                optimalMin: 6,
                optimalMax: 12,
                title: 'OMUZ AÇIKLIĞI',
                columns: [
                    { key: 'overhead_lock', label: 'KOLU BAŞÜSTÜNE TAM KALDIRMA', recId: 'db_overhead_press', recName: 'Dambıl Omuz Presi', keywords: ['omuz pres', 'overhead', 'arnold', 'push press', 'thruster', 'snatch', 'waiter', 'kettlebell press'] },
                    { key: 'capsular_rot', label: 'OMUZ DÖNDÜRME & KÜREK HAREKETİ', recId: 'kb_halo', recName: 'Kettlebell Halo', keywords: ['halo', 'windmill', 'get-up', 'getup', 'cuban', 'external rotation', 'face pull'] },
                    { key: 'lat_pec_stretch', label: 'GÖĞÜS & KANAT ESNETME', recId: 'db_pullover', recName: 'Dambıl Pullover', keywords: ['pullover', 'barfiks', 'pull-up', 'pullup', 'chin-up', 'chinup', 'dips', 'incline', 'başüstü triceps'] }
                ]
            },
            {
                id: 'thoracic_spine',
                name: '🧬 Üst Sırt & Duruş',
                shortName: 'Üst Sırt',
                optimalMin: 4,
                optimalMax: 10,
                title: 'ÜST SIRT & DİK DURUŞ',
                columns: [
                    { key: 't_rotation', label: 'GÖVDEYİ SAĞA-SOLA DÖNDÜRME', recId: 'kb_windmill', recName: 'Kettlebell Windmill', keywords: ['windmill', 'get-up', 'getup', 'rotational', 'rotasyon', 'twist', 'woodchopper', 'oduncu', 'chop', 'halo'] },
                    { key: 't_extension', label: 'DİK DURUŞ & GÖĞÜS AÇMA', recId: 'db_goblet_squat', recName: 'Dambıl Goblet Squat', keywords: ['front squat', 'ön squat', 'goblet', 'zercher', 'pullover', 'thruster', 'inchworm', 'hyperextension'] },
                    { key: 'scap_glide', label: 'KAMBURLUK ÖNLEYİCİ ÇEKİŞ', recId: 'db_saw_row', recName: 'Dambıl Saw Row', keywords: ['saw row', 'göğüs destekli row', 'gorilla', 'renegade', 'face pull', 'yatay barfiks', 'inverted row', 'barbell row'] }
                ]
            },
            {
                id: 'hip_capsule',
                name: '⚙️ Kalça & Kasık Açıklığı',
                shortName: 'Kalça',
                optimalMin: 8,
                optimalMax: 14,
                title: 'KALÇA & KASIK AÇIKLIĞI',
                columns: [
                    { key: 'posterior_hinge', label: 'ARKA BACAK & KALÇA ESNETME', recId: 'db_rdl', recName: 'Dambıl RDL', keywords: ['rdl', 'deadlift', 'swing', 'windmill', 'snatch', 'clean', 'good morning'] },
                    { key: 'deep_flexion', label: 'DERİN ÇÖMELME (TAM SQUAT)', recId: 'db_goblet_squat', recName: 'Dambıl Goblet Squat', keywords: ['goblet', 'back squat', 'front squat', 'ön squat', 'zercher', 'thruster', 'air squat', 'clean squat'] },
                    { key: 'psoas_split', label: 'ÖN KALÇA / KASIK AÇMA & DENGE', recId: 'db_bulgarian_squat', recName: 'Bulgar Split Squat', keywords: ['bulgar', 'split squat', 'lunge', 'step-up', 'step up', 'tek bacak', 'single leg', 'get-up', 'getup', 'seesaw'] }
                ]
            },
            {
                id: 'ankle_dorsi',
                name: '🦶 Ayak Bileği Esnekliği',
                shortName: 'Ayak Bileği',
                optimalMin: 4,
                optimalMax: 10,
                title: 'AYAK BİLEĞİ ESNEKLİĞİ',
                columns: [
                    { key: 'loaded_dorsi', label: 'ÇÖMELİRKEN BİLEK ESNEMESİ', recId: 'db_goblet_squat', recName: 'Dambıl Goblet Squat', keywords: ['goblet', 'front squat', 'ön squat', 'back squat', 'zercher', 'thruster', 'sissy', 'air squat'] },
                    { key: 'split_step', label: 'ADIM ATMA & HAMLE ESNEKLİĞİ', recId: 'db_walking_lunge', recName: 'Yürüyerek Lunge', keywords: ['lunge', 'bulgar', 'split squat', 'step-up', 'step up', 'seesaw', 'mountain climber'] },
                    { key: 'single_prop', label: 'TEK AYAK DENGE & YAYLANMA', recId: 'db_single_leg_rdl', recName: 'Tek Bacak RDL', keywords: ['tek bacak rdl', 'single leg', 'calf', 'kalf', 'skater', 'jump', 'ip atlama', 'farmers', 'suitcase'] }
                ]
            }
        ];

        const MOBILITY_PHYSICAL_TESTS_DEF = [
            {
                id: 'overhead_wall',
                title: '1. Omuz & Üst Sırt Açıklığı Testi (Duvar Testi)',
                jointIds: ['shoulder_cap', 'thoracic_spine'],
                jointLabel: 'Omuz + Üst Sırt Duruşu',
                protocol: 'Sırtını, kalçanı ve belini duvara tam yapıştır. Dirsekleri kırmadan kollarını baş üstünde duvara değdirmeye çalış.',
                recId: 'db_pullover',
                recName: 'Dambıl Pullover',
                levels: [
                    { level: 1, short: 'Seviye 1 (Kilitli)', desc: 'Kollarım duvara değmiyor veya değmesi için belim duvardan tamamen ayrılıyor.' },
                    { level: 2, short: 'Seviye 2 (Zorlanıyor)', desc: 'Zorlanarak değiyor ancak omuzlarımda gerginlik var ve belim hafif açılıyor.' },
                    { level: 3, short: 'Seviye 3 (Rahat / İyi)', desc: 'Belim duvara tam yapışıkken başparmaklarım duvara rahatça değiyor.' },
                    { level: 4, short: 'Seviye 4 (Tam Açık)', desc: 'Hiç zorlanmadan kollarım ve bileklerim duvara tam yapışıyor.' }
                ]
            },
            {
                id: 'deep_squat',
                title: '2. Derin Çömelme Testi (Kalça & Bilek)',
                jointIds: ['hip_capsule', 'ankle_dorsi'],
                jointLabel: 'Kalça + Ayak Bileği Esnekliği',
                protocol: 'Ayaklar omuz genişliğinde, ağırlıksız en dip noktaya kadar çömel ve 30 saniye bekle.',
                recId: 'db_goblet_squat',
                recName: 'Dambıl Goblet Squat',
                levels: [
                    { level: 1, short: 'Seviye 1 (Kilitli)', desc: 'Çömelirken topuklarım yerden kalkıyor veya tam aşağı inemiyorum.' },
                    { level: 2, short: 'Seviye 2 (Zorlanıyor)', desc: 'Topuklar yerde aşağı iniyorum ama dengede kalmak için gövdem çok öne yatıyor.' },
                    { level: 3, short: 'Seviye 3 (Rahat / İyi)', desc: 'Topuklar tam yerde ve sırtım dik şekilde derin çömelebiliyorum.' },
                    { level: 4, short: 'Seviye 4 (Tam Açık)', desc: 'En dip çömelme noktasında 30 saniye hiç yorulmadan dinlenir gibi oturabiliyorum.' }
                ]
            },
            {
                id: 'toe_touch',
                title: '3. Arka Bacak Esnekliği Testi (Öne Eğilme)',
                jointIds: ['hip_capsule'],
                jointLabel: 'Arka Bacak & Bel Esnekliği',
                protocol: 'Ayaklar yan yana, dizleri hiç bükmeden öne doğru eğilerek ellerini yere uzat.',
                recId: 'db_rdl',
                recName: 'Dambıl RDL',
                levels: [
                    { level: 1, short: 'Seviye 1 (Kilitli)', desc: 'Parmak uçlarım diz altı / kaval kemiği ortasında kalıyor, arka bacak çok gergin.' },
                    { level: 2, short: 'Seviye 2 (Zorlanıyor)', desc: 'Parmak uçlarım ayak bileğime veya ayakkabı üstüne kadar iniyor.' },
                    { level: 3, short: 'Seviye 3 (Rahat / İyi)', desc: 'Dizlerim dümdüzken parmak uçlarım yere rahatça değiyor.' },
                    { level: 4, short: 'Seviye 4 (Tam Açık)', desc: 'Dizlerim bükülmeden yumruklarım veya avuç içlerim yere tam değiyor.' }
                ]
            },
            {
                id: 'hip_90_90',
                title: '4. Kalça & Bel Dönüş Testi (Yerde Oturuş)',
                jointIds: ['hip_capsule', 'thoracic_spine'],
                jointLabel: 'Kalça + Gövde Dönüş Rahatlığı',
                protocol: 'Yerde her iki diz 90° bükülü otur. Ellerini yere koymadan bacaklarını diğer yöne çevir.',
                recId: 'kb_windmill',
                recName: 'Kettlebell Windmill',
                levels: [
                    { level: 1, short: 'Seviye 1 (Kilitli)', desc: 'Bu pozisyonda otururken ellerimle arkadan destek almadan dik duramıyorum.' },
                    { level: 2, short: 'Seviye 2 (Zorlanıyor)', desc: 'Dik oturabiliyorum ama bacakları diğer tarafa çevirirken ellerimi yere koymam şart.' },
                    { level: 3, short: 'Seviye 3 (Rahat / İyi)', desc: 'Ellerimi yere değdirmeden bacaklarımı sağdan sola kontrollü çevirebiliyorum.' },
                    { level: 4, short: 'Seviye 4 (Tam Açık)', desc: 'Gövdem dimdikken el desteği olmadan iki yöne de çok rahat geçiş yapabiliyorum.' }
                ]
            }
        ];

        let currentSelectedMobilityJoint = 'shoulder_cap';
        let currentMobilitySource = 'week_projected';
        let currentMobilityWeekOffset = 0;

        function resolveExerciseMobilitySpec(name = '', rawMuscle = '', category = '') {
            const cleanName = String(name).trim().toLowerCase();
            const text = `${cleanName} ${String(rawMuscle).toLowerCase()} ${String(category).toLowerCase()}`;

            // 1. SAF İZOLE / TEK EKLEM HAREKETLER (Alizadeh 2023: Çoklu eklem kapsül mobilitesine 0.0 Set verir)
            if (
                text.includes('biceps curl') ||
                text.includes('barbell curl') ||
                text.includes('hammer curl') ||
                text.includes('incline dambıl curl') ||
                text.includes('incline curl') ||
                text.includes('kablo biceps') ||
                text.includes('triceps pushdown') ||
                text.includes('pushdown') ||
                text.includes('skullcrusher') ||
                text.includes('lateral raise') ||
                text.includes('leg extension') ||
                text.includes('leg curl') ||
                text.includes('pec deck') ||
                text.includes('crossover') ||
                text.includes('cable fly') ||
                text.includes('shrug') ||
                text.includes('plank') ||
                text.includes('hollow body') ||
                text.includes('kürek çekme') ||
                text.includes('indoor row') ||
                text.includes('ergometre') ||
                text.includes('tempolu yürüyüş') ||
                text.includes('doğa yürüyüşü') ||
                text.includes('walking') ||
                text.includes('koşu') ||
                text.includes('running') ||
                text.includes('treadmill') ||
                text.includes('jumping jack') ||
                text.includes('ip atlama') ||
                text.includes('jump rope') ||
                text.includes('high knees') ||
                text.includes('butt kicks')
            ) {
                return {
                    isIsolation: true,
                    plane: 'sagittal',
                    joints: {}
                };
            }

            // İSTİSNA İZOLELER (Uç Açıklıkta Tek Eklem Esnetenler)
            if (text.includes('başüstü triceps') || text.includes('overhead triceps')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 0.45 },
                    slots: { shoulder_cap: 'lat_pec_stretch' }
                };
            }
            if (text.includes('calf') || text.includes('kalf')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { ankle_dorsi: 0.45 },
                    slots: { ankle_dorsi: 'single_prop' }
                };
            }
            if (text.includes('sissy squat')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { ankle_dorsi: 0.85, hip_capsule: 0.35 },
                    slots: { ankle_dorsi: 'loaded_dorsi', hip_capsule: 'psoas_split' }
                };
            }

            // 2. 3 BOYUTLU (TRANSVERS / ROTASYONEL) & ELİT MOBİLİTE AKIŞLARI
            if (text.includes('turkish get-up') || text.includes('getup') || text.includes('get-up')) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 1.0, hip_capsule: 1.0, ankle_dorsi: 0.5 },
                    slots: { shoulder_cap: 'capsular_rot', thoracic_spine: 't_rotation', hip_capsule: 'psoas_split', ankle_dorsi: 'split_step' }
                };
            }
            if (text.includes('windmill')) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 1.0, hip_capsule: 1.0 },
                    slots: { shoulder_cap: 'capsular_rot', thoracic_spine: 't_rotation', hip_capsule: 'posterior_hinge' }
                };
            }
            if (text.includes('pullover to halo') || (text.includes('pullover') && text.includes('halo'))) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 0.9 },
                    slots: { shoulder_cap: 'lat_pec_stretch', thoracic_spine: 't_rotation' }
                };
            }
            if (text.includes('halo')) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 0.7 },
                    slots: { shoulder_cap: 'capsular_rot', thoracic_spine: 't_rotation' }
                };
            }
            if (text.includes('rotational lunge') || text.includes('lunge + gövde rotasyonu') || text.includes('lunge with twist') || (text.includes('lunge') && text.includes('rotasyon'))) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { thoracic_spine: 1.0, hip_capsule: 1.0, ankle_dorsi: 0.8 },
                    slots: { thoracic_spine: 't_rotation', hip_capsule: 'psoas_split', ankle_dorsi: 'split_step' }
                };
            }
            if (text.includes('rotational gorilla') || (text.includes('gorilla') && text.includes('rotasyon'))) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { thoracic_spine: 1.0, hip_capsule: 0.7, shoulder_cap: 0.4 },
                    slots: { thoracic_spine: 't_rotation', hip_capsule: 'posterior_hinge', shoulder_cap: 'capsular_rot' }
                };
            }
            if (text.includes('cuban') || text.includes('external rotation')) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 0.6 },
                    slots: { shoulder_cap: 'capsular_rot', thoracic_spine: 't_rotation' }
                };
            }
            if (text.includes('woodchopper') || text.includes('oduncu') || text.includes('plate chop')) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { thoracic_spine: 0.9, hip_capsule: 0.5, shoulder_cap: 0.4 },
                    slots: { thoracic_spine: 't_rotation', hip_capsule: 'psoas_split', shoulder_cap: 'overhead_lock' }
                };
            }
            if (text.includes('russian twist')) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { thoracic_spine: 0.6 },
                    slots: { thoracic_spine: 't_rotation' }
                };
            }
            if (text.includes('renegade')) {
                return {
                    isIsolation: false,
                    plane: 'transverse',
                    joints: { thoracic_spine: 0.6, shoulder_cap: 0.4 },
                    slots: { thoracic_spine: 'scap_glide', shoulder_cap: 'capsular_rot' }
                };
            }

            // 3. 2 BOYUTLU (FRONTAL / ASİMETRİK PELVİK & TEK TARAFLI DENGE) HAREKETLER
            if (text.includes('bulgar') || text.includes('split squat')) {
                return {
                    isIsolation: false,
                    plane: 'frontal',
                    joints: { hip_capsule: 1.0, ankle_dorsi: 0.85 },
                    slots: { hip_capsule: 'psoas_split', ankle_dorsi: 'split_step' }
                };
            }
            if (text.includes('tek bacak rdl') || text.includes('single leg rdl')) {
                return {
                    isIsolation: false,
                    plane: 'frontal',
                    joints: { hip_capsule: 1.0, ankle_dorsi: 0.75 },
                    slots: { hip_capsule: 'posterior_hinge', ankle_dorsi: 'single_prop' }
                };
            }
            if (text.includes('lunge') || text.includes('step-up') || text.includes('step up')) {
                const hasPress = text.includes('press') || text.includes('pres');
                return {
                    isIsolation: false,
                    plane: 'frontal',
                    joints: {
                        hip_capsule: 0.95,
                        ankle_dorsi: 0.80,
                        ...(hasPress ? { shoulder_cap: 0.85 } : {})
                    },
                    slots: {
                        hip_capsule: 'psoas_split',
                        ankle_dorsi: 'split_step',
                        ...(hasPress ? { shoulder_cap: 'overhead_lock' } : {})
                    }
                };
            }
            if (text.includes('suitcase') || text.includes('waiter') || text.includes('garson') || text.includes('cross-body') || text.includes('çapraz taşıma')) {
                const isOverhead = text.includes('waiter') || text.includes('garson') || text.includes('cross');
                return {
                    isIsolation: false,
                    plane: 'frontal',
                    joints: {
                        ...(isOverhead ? { shoulder_cap: 0.85, thoracic_spine: 0.5 } : { thoracic_spine: 0.4 }),
                        ankle_dorsi: 0.35
                    },
                    slots: {
                        shoulder_cap: 'overhead_lock',
                        thoracic_spine: 't_extension',
                        ankle_dorsi: 'single_prop'
                    }
                };
            }
            if (text.includes('skater') || text.includes('lateral shuffle')) {
                return {
                    isIsolation: false,
                    plane: 'frontal',
                    joints: { hip_capsule: 0.6, ankle_dorsi: 0.7 },
                    slots: { hip_capsule: 'psoas_split', ankle_dorsi: 'single_prop' }
                };
            }

            // 4. TAM AÇIKLIKLI (FULL ROM / LENGTHENED) BİLEŞİK HAREKETLER (SAGİTTAL 1B)
            if (text.includes('pullover')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 0.75 },
                    slots: { shoulder_cap: 'lat_pec_stretch', thoracic_spine: 't_extension' }
                };
            }
            if (text.includes('thruster') || text.includes('clean_squat_press') || (text.includes('squat') && text.includes('press') && !text.includes('leg press'))) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 0.95, thoracic_spine: 0.7, hip_capsule: 1.0, ankle_dorsi: 0.9 },
                    slots: { shoulder_cap: 'overhead_lock', thoracic_spine: 't_extension', hip_capsule: 'deep_flexion', ankle_dorsi: 'loaded_dorsi' }
                };
            }
            if (text.includes('snatch')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 0.6, hip_capsule: 0.85 },
                    slots: { shoulder_cap: 'overhead_lock', thoracic_spine: 't_extension', hip_capsule: 'posterior_hinge' }
                };
            }
            if (text.includes('goblet squat') || text.includes('front squat') || text.includes('ön squat') || text.includes('zercher')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { hip_capsule: 1.0, ankle_dorsi: 1.0, thoracic_spine: 0.65 },
                    slots: { hip_capsule: 'deep_flexion', ankle_dorsi: 'loaded_dorsi', thoracic_spine: 't_extension' }
                };
            }
            if (text.includes('back squat') || text.includes('air squat') || text.includes('jump squat')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { hip_capsule: 0.95, ankle_dorsi: 0.85, shoulder_cap: 0.3 },
                    slots: { hip_capsule: 'deep_flexion', ankle_dorsi: 'loaded_dorsi', shoulder_cap: 'capsular_rot' }
                };
            }
            if (text.includes('leg press')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { hip_capsule: 0.55, ankle_dorsi: 0.40 },
                    slots: { hip_capsule: 'deep_flexion', ankle_dorsi: 'loaded_dorsi' }
                };
            }
            if (text.includes('rdl') || text.includes('romanian')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { hip_capsule: 1.0, thoracic_spine: 0.35 },
                    slots: { hip_capsule: 'posterior_hinge', thoracic_spine: 't_extension' }
                };
            }
            if (text.includes('deadlift') || text.includes('swing') || text.includes('clean')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { hip_capsule: 0.85, thoracic_spine: 0.35 },
                    slots: { hip_capsule: 'posterior_hinge', thoracic_spine: 't_extension' }
                };
            }
            if (text.includes('hip thrust') || text.includes('glute bridge') || text.includes('bridge')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { hip_capsule: 0.65 },
                    slots: { hip_capsule: 'psoas_split' }
                };
            }
            if (text.includes('omuz pres') || text.includes('overhead press') || text.includes('arnold') || text.includes('kettlebell press') || text.includes('push press')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 1.0, thoracic_spine: 0.45 },
                    slots: { shoulder_cap: 'overhead_lock', thoracic_spine: 't_extension' }
                };
            }
            if (text.includes('barfiks') || text.includes('pull-up') || text.includes('pullup') || text.includes('chin-up') || text.includes('chinup') || text.includes('lat pulldown')) {
                const isFreeHang = !text.includes('pulldown');
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: isFreeHang ? 0.95 : 0.70, thoracic_spine: 0.45 },
                    slots: { shoulder_cap: 'lat_pec_stretch', thoracic_spine: 'scap_glide' }
                };
            }
            if (text.includes('face pull')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 0.85, thoracic_spine: 0.65 },
                    slots: { shoulder_cap: 'capsular_rot', thoracic_spine: 'scap_glide' }
                };
            }
            if (text.includes('saw row') || text.includes('gorilla row')) {
                return {
                    isIsolation: false,
                    plane: 'frontal',
                    joints: { thoracic_spine: 0.75, shoulder_cap: 0.45, hip_capsule: text.includes('gorilla') ? 0.5 : 0 },
                    slots: { thoracic_spine: 'scap_glide', shoulder_cap: 'lat_pec_stretch', hip_capsule: 'posterior_hinge' }
                };
            }
            if (text.includes('row') || text.includes('yatay barfiks')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { thoracic_spine: 0.65, shoulder_cap: 0.35 },
                    slots: { thoracic_spine: 'scap_glide', shoulder_cap: 'capsular_rot' }
                };
            }
            if (text.includes('dips')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 0.85 },
                    slots: { shoulder_cap: 'lat_pec_stretch' }
                };
            }
            if (text.includes('incline') && text.includes('press')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { shoulder_cap: 0.55 },
                    slots: { shoulder_cap: 'lat_pec_stretch' }
                };
            }
            if (text.includes('bench') || text.includes('floor press') || text.includes('şınav') || text.includes('push-up') || text.includes('pushup')) {
                const isInchworm = text.includes('inchworm');
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: isInchworm
                        ? { shoulder_cap: 0.7, thoracic_spine: 0.6, hip_capsule: 0.85 }
                        : { shoulder_cap: 0.35 },
                    slots: { shoulder_cap: 'lat_pec_stretch', thoracic_spine: 't_extension', hip_capsule: 'posterior_hinge' }
                };
            }
            if (text.includes('farmer') || text.includes('carry')) {
                return {
                    isIsolation: false,
                    plane: 'sagittal',
                    joints: { thoracic_spine: 0.4, ankle_dorsi: 0.35 },
                    slots: { thoracic_spine: 'scap_glide', ankle_dorsi: 'single_prop' }
                };
            }

            // Varsayılan genel bileşik hareket
            return {
                isIsolation: false,
                plane: 'sagittal',
                joints: { hip_capsule: 0.4, shoulder_cap: 0.3 },
                slots: { hip_capsule: 'deep_flexion', shoulder_cap: 'overhead_lock' }
            };
        }

        function calculateWeeklyMobilitySufficiency(sourceMode = 'week_projected', weekOffset = 0) {
            const bounds = getWeeklyMuscleBounds(weekOffset);
            const allLogs = (typeof getWorkoutLogs === 'function') ? getWorkoutLogs() : [];
            const weekLogs = allLogs.filter(l => {
                const dt = new Date(l.date);
                return dt >= bounds.monday && dt <= bounds.sunday;
            });

            const loggedDays = new Set(weekLogs.map(l => new Date(l.date).getDay()));
            const todayDay = (new Date()).getDay();
            const getIsoDay = (d) => d === 0 ? 7 : d;
            const todayIso = getIsoDay(todayDay);
            const schedule = (typeof getWeeklySchedule === 'function') ? getWeeklySchedule() : {};

            const jointMap = {};
            WEEKLY_MOBILITY_JOINT_CONFIG.forEach(j => {
                const slotMap = {};
                j.columns.forEach(col => {
                    slotMap[col.key] = {
                        col,
                        earnedSets: 0,
                        plannedCount: 0,
                        doneExs: new Set(),
                        plannedExs: new Set()
                    };
                });
                jointMap[j.id] = {
                    ...j,
                    doneSets: 0,
                    planSets: 0,
                    scheduledTotalSets: 0,
                    doneExercises: new Set(),
                    plannedExercises: new Map(),
                    contributions: [],
                    slotMap
                };
            });

            const planes = {
                sagittal: { label: '⬆️ İleri-Geri & Yukarı-Aşağı (Klasik Hareketler)', sets: 0, exs: new Set(), color: '#38bdf8', targetPct: 65, recId: 'db_goblet_squat', recName: 'Dambıl Goblet Squat' },
                frontal: { label: '↔️ Tek Bacak / Tek Kol Denge & Yan Hareketler', sets: 0, exs: new Set(), color: '#10b981', targetPct: 20, recId: 'db_bulgarian_squat', recName: 'Bulgar Split Squat' },
                transverse: { label: '🔄 Gövde & Omuz Döndürme (Rotasyon)', sets: 0, exs: new Set(), color: '#f59e0b', targetPct: 15, recId: 'kb_windmill', recName: 'Kettlebell Windmill' }
            };

            let functionalSets = 0;
            let isolationSets = 0;

            const resolveSlotForJoint = (jointId, exName, explicitSlot) => {
                const jDef = jointMap[jointId];
                if (!jDef) return null;
                if (explicitSlot && jDef.slotMap[explicitSlot]) return explicitSlot;
                const lower = String(exName || '').toLowerCase();
                for (const col of jDef.columns) {
                    for (const kw of col.keywords) {
                        if (lower.includes(kw.toLowerCase())) return col.key;
                    }
                }
                return jDef.columns[0].key;
            };

            // 1. Tamamlanan Antrenman Loglarını İşle
            weekLogs.forEach(log => {
                if (!log.exercises || !Array.isArray(log.exercises)) return;
                const dateStr = log.dateFormatted || formatDateTr(log.date);
                const sessionTitle = log.title || log.workoutName || 'Antrenman Seansı';

                log.exercises.forEach(ex => {
                    const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                        ? Number(ex.completedSetsCount)
                        : (Array.isArray(ex.sets) ? ex.sets.filter(s => s && s.completed).length : (Number(ex.sets) || 0));
                    if (cSets <= 0) return;

                    const mSpec = resolveExerciseMobilitySpec(ex.name, ex.muscle, ex.category);
                    if (mSpec.isIsolation) {
                        isolationSets += cSets;
                    } else {
                        functionalSets += cSets;
                    }

                    if (sourceMode !== 'schedule_full') {
                        const pKey = mSpec.plane || 'sagittal';
                        if (planes[pKey]) {
                            planes[pKey].sets += cSets;
                            planes[pKey].exs.add(ex.name);
                        }
                    }

                    Object.entries(mSpec.joints || {}).forEach(([jId, factor]) => {
                        if (!jointMap[jId] || factor <= 0) return;
                        const earned = cSets * factor;
                        jointMap[jId].doneSets += earned;
                        jointMap[jId].doneExercises.add(ex.name);

                        const sKey = resolveSlotForJoint(jId, ex.name, mSpec.slots ? mSpec.slots[jId] : null);
                        if (sKey && jointMap[jId].slotMap[sKey]) {
                            jointMap[jId].slotMap[sKey].earnedSets += earned;
                            jointMap[jId].slotMap[sKey].doneExs.add(ex.name);
                        }

                        jointMap[jId].contributions.push({
                            date: dateStr,
                            sessionTitle,
                            exercise: ex.name,
                            rawSets: cSets,
                            factor,
                            earnedSets: Math.round(earned * 10) / 10,
                            plane: mSpec.plane === 'transverse' ? 'Döndürme (Rotasyon)' : (mSpec.plane === 'frontal' ? 'Tek Taraflı / Denge' : 'Klasik Dikey/Yatay')
                        });
                    });
                });
            });

            // 2. Planlanan Haftalık Programı İşle
            const dayKeys = [1, 2, 3, 4, 5, 6, 0];
            dayKeys.forEach(dKey => {
                const offsetFromMon = dKey === 0 ? 6 : (dKey - 1);
                const dayDate = new Date(bounds.monday);
                dayDate.setDate(bounds.monday.getDate() + offsetFromMon);

                const plan = (sourceMode !== 'schedule_full' && typeof getPlanForDate === 'function')
                    ? getPlanForDate(dayDate)
                    : schedule[dKey];
                if (!plan || plan.rest) return;

                const planIso = getIsoDay(dKey);
                const isCompleted = loggedDays.has(dKey);
                const isRemaining = bounds.isCurrentWeek ? (!isCompleted && planIso >= todayIso) : (!bounds.isCurrentWeek && weekOffset > 0);

                const details = (typeof getWorkoutDetailsForPlan === 'function') ? getWorkoutDetailsForPlan(plan) : null;
                if (!details || !Array.isArray(details.exercises)) return;

                details.exercises.forEach(ex => {
                    const pSets = Number(ex.targetSets || ex.sets) || (details.scheme && Number(details.scheme.sets)) || 3;
                    const mSpec = resolveExerciseMobilitySpec(ex.name, ex.muscle, ex.category);

                    if ((isRemaining && sourceMode === 'week_projected') || sourceMode === 'schedule_full') {
                        const pKey = mSpec.plane || 'sagittal';
                        if (planes[pKey]) {
                            planes[pKey].sets += pSets;
                            planes[pKey].exs.add(ex.name);
                        }
                        if (sourceMode === 'schedule_full') {
                            if (mSpec.isIsolation) isolationSets += pSets;
                            else functionalSets += pSets;
                        }
                    }

                    Object.entries(mSpec.joints || {}).forEach(([jId, factor]) => {
                        if (!jointMap[jId] || factor <= 0) return;
                        const plannedAdd = pSets * factor;
                        jointMap[jId].scheduledTotalSets += plannedAdd;

                        if (isRemaining || sourceMode === 'schedule_full') {
                            jointMap[jId].planSets += plannedAdd;
                            jointMap[jId].plannedExercises.set(`${ex.name}_${dKey}`, {
                                name: ex.name,
                                sets: plannedAdd
                            });
                            const sKey = resolveSlotForJoint(jId, ex.name, mSpec.slots ? mSpec.slots[jId] : null);
                            if (sKey && jointMap[jId].slotMap[sKey]) {
                                jointMap[jId].slotMap[sKey].plannedCount += 1;
                                jointMap[jId].slotMap[sKey].plannedExs.add(ex.name);
                            }
                        }
                    });
                });
            });

            const summary = {
                optimalCount: 0,
                insufficientCount: 0,
                unworkedCount: 0,
                totalEndRangeSets: 0
            };

            const joints = WEEKLY_MOBILITY_JOINT_CONFIG.map(cfg => {
                const data = jointMap[cfg.id];
                const effectiveDone = Math.round(data.doneSets * 10) / 10;
                const effectivePlan = Math.round(data.planSets * 10) / 10;
                const effectiveProjected = Math.round((effectiveDone + effectivePlan) * 10) / 10;
                const effectiveScheduledTotal = Math.round(data.scheduledTotalSets * 10) / 10;

                let evalVolume = effectiveProjected;
                if (sourceMode === 'week_done') evalVolume = effectiveDone;
                if (sourceMode === 'schedule_full') evalVolume = effectiveScheduledTotal;

                summary.totalEndRangeSets += evalVolume;

                let status = 'unworked';
                let statusLabel = '0 Set — Kilitli Kaldı';
                if (evalVolume >= cfg.optimalMin) {
                    status = 'optimal';
                    statusLabel = `İyi Açıldı (${evalVolume.toFixed(1)} Set)`;
                    summary.optimalCount++;
                } else if (evalVolume > 0) {
                    status = 'insufficient';
                    statusLabel = `Az Çalıştı (${evalVolume.toFixed(1)} / Hedef ${cfg.optimalMin} Set)`;
                    summary.insufficientCount++;
                } else {
                    summary.unworkedCount++;
                }

                return {
                    ...cfg,
                    effectiveDone: evalVolume,
                    rawDoneSets: effectiveDone,
                    rawPlanSets: effectivePlan,
                    status,
                    statusLabel,
                    contributions: data.contributions,
                    slotMap: data.slotMap
                };
            });

            summary.totalEndRangeSets = Math.round(summary.totalEndRangeSets * 10) / 10;
            const totalPlaneSets = planes.sagittal.sets + planes.frontal.sets + planes.transverse.sets;
            const totalAllSets = functionalSets + isolationSets;
            const functionalPct = totalAllSets > 0 ? Math.round((functionalSets / totalAllSets) * 100) : 0;

            return {
                bounds,
                sourceMode,
                weekOffset,
                totalDoneSessions: weekLogs.length,
                joints,
                summary,
                planes,
                totalPlaneSets,
                functionalSets,
                isolationSets,
                functionalPct
            };
        }

        function calculateMobilityHistoricalEvolution(weeksCount = 6) {
            const history = [];
            for (let offset = -(weeksCount - 1); offset <= 0; offset++) {
                const res = calculateWeeklyMobilitySufficiency('week_done', offset);
                const multiPlanarSets = res.planes.frontal.sets + res.planes.transverse.sets;
                const multiPlanarPct = res.totalPlaneSets > 0 ? Math.round((multiPlanarSets / res.totalPlaneSets) * 100) : 0;
                const shortLabel = res.bounds.label.split(' - ')[0];
                history.push({
                    offset,
                    label: offset === 0 ? 'Bu Hft' : shortLabel,
                    fullLabel: res.bounds.label,
                    endRangeSets: res.summary.totalEndRangeSets,
                    functionalPct: res.functionalPct,
                    multiPlanarPct,
                    sessions: res.totalDoneSessions
                });
            }
            return history;
        }

        // ----- FİZİKSEL ROM TESTLERİ (FMS / KLİNİK ÖZ-DEĞERLENDİRME) STORAGE -----
        function getMobilityPhysicalTestsData() {
            const uid = (typeof getActiveUserId === 'function') ? getActiveUserId() : 'default';
            try {
                const raw = localStorage.getItem(`celik_kodu_mobility_tests_${uid}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && Array.isArray(parsed.history)) return parsed;
                }
            } catch (e) {}
            return { history: [] };
        }

        function saveMobilityPhysicalTestLevel(testId, levelNum) {
            const validIds = ['overhead_wall', 'deep_squat', 'toe_touch', 'hip_90_90'];
            const lvl = parseInt(levelNum, 10);
            if (!validIds.includes(testId) || isNaN(lvl) || lvl < 1 || lvl > 4) return;

            const uid = (typeof getActiveUserId === 'function') ? getActiveUserId() : 'default';
            const data = typeof sanitizeMobilityTestsPayload === 'function'
                ? sanitizeMobilityTestsPayload(getMobilityPhysicalTestsData())
                : getMobilityPhysicalTestsData();
            if (!Array.isArray(data.history)) data.history = [];
            const todayIso = new Date().toISOString().split('T')[0];

            const latestEntry = data.history.length > 0 ? data.history[0] : null;
            const currentLevels = latestEntry && latestEntry.levels ? { ...latestEntry.levels } : {};
            currentLevels[testId] = lvl;

            const nowTs = Date.now();
            if (latestEntry && latestEntry.date === todayIso) {
                latestEntry.levels = currentLevels;
                latestEntry.timestamp = nowTs;
            } else {
                data.history.unshift({
                    date: todayIso,
                    timestamp: nowTs,
                    levels: currentLevels
                });
            }
            data.updatedAt = nowTs;

            const cleanData = typeof sanitizeMobilityTestsPayload === 'function'
                ? sanitizeMobilityTestsPayload(data)
                : data;

            try {
                localStorage.setItem(`celik_kodu_mobility_tests_${uid}`, JSON.stringify(cleanData));
                if (typeof window.scheduleUserStateCloudSync === 'function') window.scheduleUserStateCloudSync(uid);
            } catch (e) {}

            renderAnalytics();
        }

        function selectMobilityJoint(jointId) {
            currentSelectedMobilityJoint = jointId;
            renderAnalytics();
        }

        function setMobilitySource(mode) {
            currentMobilitySource = mode;
            renderAnalytics();
        }

        function setMobilityWeekOffset(offset) {
            currentMobilityWeekOffset = offset;
            renderAnalytics();
        }

        function toggleMobilityJointLineage(jointId) {
            const elBox = document.getElementById(`mob_lineage_box_${jointId}`);
            const elBtn = document.getElementById(`mob_lineage_btn_${jointId}`);
            if (!elBox) return;
            const isHidden = elBox.style.display === 'none';
            elBox.style.display = isHidden ? 'block' : 'none';
            if (elBtn) {
                const count = elBox.dataset.count || 0;
                elBtn.innerHTML = isHidden
                    ? `<span>Hangi Seans & Hareketten Geldi? (${count} Kayıt)</span><span style="color:#B45309; font-size:11.5px; font-weight:800;">Kapat ▲</span>`
                    : `<span>Hangi Seans & Hareketten Geldi? (${count} Kayıt)</span><span style="color:#B45309; font-size:11.5px; font-weight:800;">Detay ▼</span>`;
            }
        }

        function togglePhysicalTestGuide(testId) {
            const elBox = document.getElementById(`fms_test_box_${testId}`);
            const elLabel = document.getElementById(`fms_test_lbl_${testId}`);
            if (!elBox) return;
            const isHidden = elBox.style.display === 'none';
            elBox.style.display = isHidden ? 'block' : 'none';
            if (elLabel) {
                elLabel.textContent = isHidden ? 'Gizle ▲' : 'Seviye Seç / Güncelle ▼';
            }
        }

        function renderMobilityJointSubregionGrid(j) {
            const columnsHTML = j.columns.map(col => {
                const slot = j.slotMap[col.key] || { earnedSets: 0, plannedCount: 0, doneExs: new Set(), plannedExs: new Set() };
                const isDone = slot.earnedSets > 0;
                const isPlanned = !isDone && slot.plannedExs.size > 0;

                let statusBadge = '';
                let contentHTML = '';
                let cellBg = '#FEF2F2';
                let cellBorder = '1px solid #FECACA';

                if (isDone) {
                    cellBg = '#F0FDF4';
                    cellBorder = '1px solid #86EFAC';
                    statusBadge = `<span style="display:inline-block; font-size:11px; font-weight:800; color:#15803D; background:#DCFCE7; border:1px solid #86EFAC; border-radius:6px; padding:2px 7px;">✅ ${slot.earnedSets.toFixed(1)} Set</span>`;
                    const exList = Array.from(slot.doneExs).map(escapeHTML).join(', ');
                    const planList = slot.plannedExs.size > 0 ? `<div style="font-size:11px; color:#B45309; margin-top:3px; font-weight:700;">+ ${Array.from(slot.plannedExs).map(escapeHTML).join(', ')} (Planda)</div>` : '';
                    contentHTML = `<div style="font-size:11.5px; color:#1E293B; margin-top:5px; line-height:1.35;"><strong>${exList}</strong>${planList}</div>`;
                } else if (isPlanned) {
                    cellBg = '#FFFBEB';
                    cellBorder = '1px solid #FCD34D';
                    statusBadge = `<span style="display:inline-block; font-size:11px; font-weight:800; color:#B45309; background:#FEF3C7; border:1px solid #FCD34D; border-radius:6px; padding:2px 7px;">🟡 Planda (${slot.plannedCount} Hrk)</span>`;
                    const planList = Array.from(slot.plannedExs).map(escapeHTML).join(', ');
                    contentHTML = `<div style="font-size:11.5px; color:#92400E; margin-top:5px; line-height:1.35; font-weight:600;">${planList}</div>`;
                } else {
                    statusBadge = `<span style="display:inline-block; font-size:11px; font-weight:800; color:#B91C1C; background:#FEE2E2; border:1px solid #FCA5A5; border-radius:6px; padding:2px 7px;">⚠️ 0 Set (Boşta!)</span>`;
                    contentHTML = `
                        <div style="margin-top:6px;">
                            <button class="btn btn-outline" style="font-size:11px; padding:6px 8px; border-radius:6px; color:#DC2626; border-color:#FECACA; width:100%; text-align:center; font-weight:800; background:#FFFFFF;" onclick="openQuickAddToDayModal('${col.recId}')" title="Bu eklem yönünü açmak için ${escapeHTML(col.recName)} ekle">
                                ➕ ${escapeHTML(col.recName)} Ekle
                            </button>
                        </div>
                    `;
                }

                return `
                    <div style="background:${cellBg}; border:${cellBorder}; border-radius:8px; padding:10px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div style="font-size:11.5px; font-weight:800; color:#0F172A; margin-bottom:5px; letter-spacing:0.2px;">${escapeHTML(col.label)}</div>
                            <div>${statusBadge}</div>
                        </div>
                        ${contentHTML}
                    </div>
                `;
            }).join('');

            return `
                <div style="margin-top:12px; border:1.5px solid #E2E8F0; border-radius:14px; overflow:hidden; background:#FFFFFF;">
                    <div style="background:#F1F5F9; border-bottom:1.5px solid #E2E8F0; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:11.5px; font-weight:900; letter-spacing:0.5px; color:#0F172A; text-transform:uppercase;">
                            📐 ${escapeHTML(j.title)} — HANGİ YÖNLER ÇALIŞTI?
                        </span>
                        <span style="font-size:11px; color:#64748B; font-weight:700;">
                            Hangi Yön Açıldı?
                        </span>
                    </div>
                    <div style="padding:10px; display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:8px;">
                        ${columnsHTML}
                    </div>
                </div>
            `;
        }

        function renderCompactMobilityBridgeCard() {
            const mob = calculateWeeklyMobilitySufficiency(currentWeeklyMuscleSource, currentWeeklyMuscleWeekOffset);

            return `
                <div class="anatomy-hero-wrapper" style="padding:12px 14px; margin-bottom:12px; align-items:stretch;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">🤸 Eklem Hareketliliği</h3>
                            <span style="font-size:10.5px; font-weight:800; background:#ECFDF5; color:#15803D; border:1px solid #86EFAC; padding:2px 7px; border-radius:99px; white-space:nowrap;">
                                ${mob.summary.totalEndRangeSets.toFixed(0)} Set
                            </span>
                        </div>
                        <button type="button" class="btn btn-gold" style="font-size:11.5px; padding:5px 10px; font-weight:800; border-radius:8px; white-space:nowrap;" onclick="switchAnalyticsSubView('mobility')">
                            Testler ➔
                        </button>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px;">
                        ${mob.joints.map(j => {
                            const isOpt = j.status === 'optimal';
                            const isIns = j.status === 'insufficient';
                            const bg = isOpt ? '#F0FDF4' : (isIns ? '#FFFBEB' : '#FEF2F2');
                            const brd = isOpt ? '#86EFAC' : (isIns ? '#FCD34D' : '#FECACA');
                            const clr = isOpt ? '#15803D' : (isIns ? '#B45309' : '#B91C1C');
                            return `
                                <div style="background:${bg}; border:1px solid ${brd}; border-radius:8px; padding:7px 9px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:4px;" onclick="currentSelectedMobilityJoint='${j.id}'; switchAnalyticsSubView('mobility');">
                                    <span style="font-size:11.5px; font-weight:900; color:#0F172A; white-space:nowrap;">${escapeHTML(j.shortName || j.name)}</span>
                                    <span style="font-size:11px; font-weight:800; color:${clr}; white-space:nowrap;">
                                        ${j.effectiveDone.toFixed(0)}/${j.optimalMin}s
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        function renderMobilityAnalytics(container) {
            const mob = calculateWeeklyMobilitySufficiency(currentMobilitySource, currentMobilityWeekOffset);
            const { bounds, sourceMode, weekOffset, joints, summary, planes, totalPlaneSets, functionalSets, isolationSets, functionalPct } = mob;

            let activeJoint = joints.find(j => j.id === currentSelectedMobilityJoint);
            if (!activeJoint) {
                activeJoint = joints.find(j => j.status === 'unworked')
                    || joints.find(j => j.status === 'insufficient')
                    || joints[0];
                currentSelectedMobilityJoint = activeJoint ? activeJoint.id : 'shoulder_cap';
            }

            // 1. Odaklanılan Eklem Kartı
            let focusJointHTML = '';
            if (activeJoint) {
                const j = activeJoint;
                const pct = Math.min(100, Math.round((j.effectiveDone / j.optimalMin) * 100));
                const barColor = j.status === 'optimal' ? '#10b981' : (j.status === 'insufficient' ? '#f59e0b' : '#ef4444');
                const badgeStyle = j.status === 'optimal'
                    ? 'background:#DCFCE7; border:1px solid #86EFAC; color:#15803D;'
                    : (j.status === 'insufficient' ? 'background:#FEF3C7; border:1px solid #FCD34D; color:#B45309;' : 'background:#FEE2E2; border:1px solid #FCA5A5; color:#B91C1C;');

                const subregionGridHTML = renderMobilityJointSubregionGrid(j);
                const recCol = j.columns[0];

                focusJointHTML = `
                    <div class="anatomy-focus-card" style="width:100%; margin-top:12px; padding:14px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                            <h4 style="font-size:16px; font-weight:900; color:#0F172A; margin:0;">${escapeHTML(j.name)}</h4>
                            <span style="${badgeStyle} font-size:11.5px; font-weight:800; padding:4px 10px; border-radius:6px;">
                                ${escapeHTML(j.statusLabel)}
                            </span>
                        </div>

                        <div style="margin-top:10px;">
                            <div style="display:flex; justify-content:space-between; font-size:11.5px; color:#475569; margin-bottom:4px; font-weight:700;">
                                <span>Haftalık Açılma Hedefi: %${pct}</span>
                                <span>${j.effectiveDone.toFixed(1)} / Hedef: ${j.optimalMin}-${j.optimalMax} Set</span>
                            </div>
                            <div style="height:7px; background:#E2E8F0; border-radius:4px; overflow:hidden;">
                                <div style="height:100%; width:${pct}%; background:${barColor}; border-radius:4px; transition:width 0.3s ease;"></div>
                            </div>
                        </div>

                        ${subregionGridHTML}

                        ${j.status !== 'optimal' ? `
                            <div style="margin-top:12px;">
                                <button class="btn btn-gold" style="width:100%; padding:10px 14px; font-size:12.5px; font-weight:800; border-radius:8px;" onclick="openQuickAddToDayModal('${recCol.recId}')">
                                    ➕ ${escapeHTML(recCol.recName)} Ekle (${escapeHTML(j.shortName)} Bölgesini Açmak İçin)
                                </button>
                            </div>
                        ` : `
                            <div style="margin-top:10px; font-size:12px; color:#15803D; font-weight:700;">
                                ✅ Bu bölge bu hafta yeterince esnetildi ve tam açıklıkta çalıştırıldı.
                            </div>
                        `}

                        <!-- Varsayılan Kapalı (Collapsible) Lineage Akordiyonu (GEMINI.md Kural 5) -->
                        <div style="margin-top:10px; padding-top:8px; border-top:1px solid #E2E8F0;">
                            <button id="mob_lineage_btn_${j.id}" class="btn btn-outline" style="width:100%; font-size:12px; padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; background:#F8FAFC; border-color:#CBD5E1; cursor:pointer;" onclick="toggleMobilityJointLineage('${j.id}')">
                                <span>Hangi Seans & Hareketten Geldi? (${(j.contributions || []).length} Kayıt)</span>
                                <span style="color:#B45309; font-size:11.5px; font-weight:800;">Detay ▼</span>
                            </button>

                            <div id="mob_lineage_box_${j.id}" data-count="${(j.contributions || []).length}" style="display:none; margin-top:8px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:10px;">
                                ${(j.contributions && j.contributions.length > 0) ? `
                                    <div style="display:flex; flex-direction:column; gap:6px;">
                                        ${j.contributions.map(c => `
                                            <div style="display:flex; justify-content:space-between; align-items:center; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:6px; padding:6px 10px; font-size:12px;">
                                                <div>
                                                    <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                                        <strong style="color:#0F172A;">${escapeHTML(c.exercise)}</strong>
                                                        <span style="font-size:10.5px; padding:2px 6px; border-radius:4px; font-weight:700; background:#E0F2FE; color:#0369A1;">
                                                            ${escapeHTML(c.plane)} (${c.factor}x Etki)
                                                        </span>
                                                    </div>
                                                    <div style="font-size:11px; color:#64748B; margin-top:2px;">
                                                        ${escapeHTML(c.date)} • ${escapeHTML(c.sessionTitle)}
                                                    </div>
                                                </div>
                                                <div style="text-align:right;">
                                                    <div style="font-size:12.5px; font-weight:900; color:#15803D;">+${c.earnedSets.toFixed(1)} Set</div>
                                                    <div style="font-size:10.5px; color:#64748B;">${c.rawSets} Set Yapıldı</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="font-size:12px; color:#64748B; text-align:center; padding:8px;">
                                        Bu hafta bu eklemi açan bir antrenman kaydı bulunmuyor.
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            }

            // 2. Son 6 Haftalık Mobilite Evrimi (Tarihsel Trend)
            const evo = calculateMobilityHistoricalEvolution(6);
            const maxEvoSets = Math.max(20, ...evo.map(e => e.endRangeSets));
            const activeWeeks = evo.filter(e => e.endRangeSets > 0);
            const firstActiveWeek = activeWeeks.length > 0 ? activeWeeks[0] : evo[0];
            const currentWeekEvo = evo[evo.length - 1];
            const deltaEvoSets = (currentWeekEvo.endRangeSets - firstActiveWeek.endRangeSets).toFixed(1);

            // 3. Son 30 Günlük Eklem Uç-Açıklık Dozu (Neden-Sonuç Korelasyonu İçin)
            const allLogs = (typeof getWorkoutLogs === 'function') ? getWorkoutLogs() : [];
            const cutoff30 = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
            const logs30 = allLogs.filter(l => new Date(l.date) >= cutoff30);
            const jointDose30 = { shoulder_cap: 0, thoracic_spine: 0, hip_capsule: 0, ankle_dorsi: 0 };
            logs30.forEach(log => {
                (log.exercises || []).forEach(ex => {
                    const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                        ? Number(ex.completedSetsCount)
                        : (Array.isArray(ex.sets) ? ex.sets.filter(s => s.completed === true || (s.completed === undefined && parseInt(s.reps, 10) > 0)).length : 0);
                    if (cSets <= 0) return;
                    const mSpec = resolveExerciseMobilitySpec(ex.name, ex.muscle, ex.category);
                    Object.entries(mSpec.joints || {}).forEach(([jId, factor]) => {
                        if (jointDose30[jId] !== undefined) jointDose30[jId] += (cSets * factor);
                    });
                });
            });

            // 4. Klinik Fiziksel Vücut Testleri (FMS / ROM Benchmark)
            const testData = getMobilityPhysicalTestsData();
            const latestTestEntry = testData.history.length > 0 ? testData.history[0] : null;
            const earliestTestEntry = testData.history.length > 0 ? testData.history[testData.history.length - 1] : null;

            const physicalTestsHTML = MOBILITY_PHYSICAL_TESTS_DEF.map(t => {
                const curLvl = latestTestEntry && latestTestEntry.levels && latestTestEntry.levels[t.id] ? Number(latestTestEntry.levels[t.id]) : null;
                const initLvl = earliestTestEntry && earliestTestEntry.levels && earliestTestEntry.levels[t.id] ? Number(earliestTestEntry.levels[t.id]) : null;
                const deltaLvl = (curLvl !== null && initLvl !== null) ? (curLvl - initLvl) : 0;

                const dose30 = t.jointIds.reduce((sum, jId) => sum + (jointDose30[jId] || 0), 0);
                const curLvlObj = curLvl ? t.levels.find(l => l.level === curLvl) : null;

                let statusBadge = `<span style="font-size:11px; font-weight:800; background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; padding:3px 8px; border-radius:6px;">Henüz Seçilmedi</span>`;
                if (curLvlObj) {
                    const clr = curLvl >= 3 ? '#15803D' : (curLvl === 2 ? '#B45309' : '#B91C1C');
                    const bg = curLvl >= 3 ? '#DCFCE7' : (curLvl === 2 ? '#FEF3C7' : '#FEE2E2');
                    const brd = curLvl >= 3 ? '#86EFAC' : (curLvl === 2 ? '#FCD34D' : '#FCA5A5');
                    const deltaStr = deltaLvl > 0 ? ` 📈 (+${deltaLvl} Seviye Açıldı!)` : (initLvl && initLvl !== curLvl ? ` (${initLvl}➔${curLvl})` : '');
                    statusBadge = `<span style="font-size:11px; font-weight:800; background:${bg}; color:${clr}; border:1px solid ${brd}; padding:3px 8px; border-radius:6px;">${escapeHTML(curLvlObj.short)}${deltaStr}</span>`;
                }

                return `
                    <div style="background:#FFFFFF; border:1.5px solid #E2E8F0; border-radius:14px; padding:12px 14px; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; flex-wrap:wrap;">
                                <div>
                                    <h4 style="font-size:13.5px; font-weight:900; color:#0F172A; margin:0;">${escapeHTML(t.title)}</h4>
                                    <div style="font-size:11px; color:#64748B; font-weight:700; margin-top:2px;">Bölge: ${escapeHTML(t.jointLabel)}</div>
                                </div>
                                ${statusBadge}
                            </div>

                            <!-- Neden-Sonuç Korelasyon Kutusu -->
                            <div style="margin-top:8px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:7px 10px; font-size:11.5px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                                <span style="color:#475569;">💪 <strong>Son 30 Günde Bu Bölgeyi Açan Antrenman:</strong> <strong style="color:#0F172A;">${dose30.toFixed(1)} Set</strong></span>
                                ${initLvl ? `<span style="color:#15803D; font-weight:800;">Başlangıç: Sv.${initLvl} ➔ Şimdi: Sv.${curLvl}</span>` : `<span style="color:#B45309; font-weight:700;">Aşağıdan durumunu seç</span>`}
                            </div>

                            ${curLvlObj ? `
                                <div style="font-size:11.5px; color:#334155; margin-top:6px; line-height:1.4;">
                                    <strong>Şu Anki Durumun:</strong> ${escapeHTML(curLvlObj.desc)}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Varsayılan Kapalı Seviye Güncelleme Akordiyonu (GEMINI.md Kural 5) -->
                        <div style="margin-top:10px; padding-top:8px; border-top:1px solid #E2E8F0;">
                            <button type="button" class="btn btn-outline" style="width:100%; font-size:11.5px; padding:6px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; background:#F8FAFC;" onclick="togglePhysicalTestGuide('${t.id}')">
                                <span>🎯 Kendini Test Et & Durumunu İşaretle</span>
                                <span id="fms_test_lbl_${t.id}" style="color:#0369A1; font-weight:800;">Seviye Seç / Güncelle ▼</span>
                            </button>

                            <div id="fms_test_box_${t.id}" style="display:none; margin-top:8px; background:#F8FAFC; border:1px solid #CBD5E1; border-radius:10px; padding:10px;">
                                <div style="font-size:11.5px; color:#0F172A; margin-bottom:8px; line-height:1.4; background:#FFFFFF; padding:8px; border-radius:6px; border-left:3px solid #84CC16;">
                                    <strong>Nasıl Denenir:</strong> ${escapeHTML(t.protocol)}
                                </div>
                                <div style="display:flex; flex-direction:column; gap:6px;">
                                    ${t.levels.map(lvl => {
                                        const isSelected = curLvl === lvl.level;
                                        return `
                                            <button type="button" class="btn btn-outline" style="text-align:left; padding:8px 10px; border-radius:8px; font-size:11.5px; display:flex; justify-content:space-between; align-items:center; gap:8px; ${isSelected ? 'background:#ECFDF5 !important; border-color:#16A34A !important; color:#0F172A !important; font-weight:800;' : 'background:#FFFFFF;'}" onclick="saveMobilityPhysicalTestLevel('${t.id}', ${lvl.level})">
                                                <div>
                                                    <strong style="color:${isSelected ? '#15803D' : '#0F172A'};">${escapeHTML(lvl.short)}:</strong>
                                                    <span style="color:#475569; font-weight:500;"> ${escapeHTML(lvl.desc)}</span>
                                                </div>
                                                <span style="flex-shrink:0; font-weight:900; color:${isSelected ? '#15803D' : '#64748B'};">${isSelected ? '✓ Seçili' : 'Seç'}</span>
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <!-- BÖLÜM 1: 4 ANA EKLEM HAREKETLİLİK HARİTASI -->
                <div class="anatomy-hero-wrapper" style="align-items:stretch;">
                    <div class="anatomy-top-bar" style="align-items:center;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <button type="button" class="btn btn-outline" style="padding:4px 8px; font-size:11.5px; border-radius:6px; font-weight:800;" onclick="switchAnalyticsSubView('muscle')">‹ Kaslar</button>
                            <h3 style="font-size:15.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">🤸 Eklem Hareketliliği</h3>
                        </div>

                        <div style="display:flex; align-items:center; gap:4px;">
                            <button class="btn btn-outline" style="padding:4px 8px; font-size:12px; border-radius:6px;" onclick="setMobilityWeekOffset(${weekOffset - 1})" title="Önceki Hafta">&lsaquo;</button>
                            <span style="font-size:11.5px; font-weight:800; color:#0F172A; padding:4px 8px; background:#F8FAFC; border-radius:6px; border:1px solid #CBD5E1; white-space:nowrap;">
                                ${escapeHTML(bounds.label)}
                            </span>
                            <button class="btn btn-outline" style="padding:4px 8px; font-size:12px; border-radius:6px;" onclick="setMobilityWeekOffset(${weekOffset + 1})" title="Sonraki Hafta">&rsaquo;</button>
                            ${weekOffset !== 0 ? `<button class="btn btn-outline" style="padding:4px 8px; font-size:11px; border-radius:6px; color:#0369A1; border-color:#0369A1;" onclick="setMobilityWeekOffset(0)">Bugün</button>` : ''}
                        </div>
                    </div>

                    <!-- Kaynak Seçici (3'lü Kompakt Bar) -->
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; margin-top:8px; background:#F8FAFC; padding:4px; border-radius:10px; border:1px solid #E2E8F0;">
                        <button class="btn btn-outline" style="font-size:11.5px; padding:6px 4px; border-radius:7px; white-space:nowrap; ${sourceMode === 'week_projected' ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : 'border-color:transparent;'}" onclick="setMobilitySource('week_projected')">
                            Yapılan + Plan
                        </button>
                        <button class="btn btn-outline" style="font-size:11.5px; padding:6px 4px; border-radius:7px; white-space:nowrap; ${sourceMode === 'week_done' ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : 'border-color:transparent;'}" onclick="setMobilitySource('week_done')">
                            Yapılan (${mob.totalDoneSessions})
                        </button>
                        <button class="btn btn-outline" style="font-size:11.5px; padding:6px 4px; border-radius:7px; white-space:nowrap; ${sourceMode === 'schedule_full' ? 'background:#84CC16 !important; color:#0A0E17 !important; border-color:#65A30D !important; font-weight:800;' : 'border-color:transparent;'}" onclick="setMobilitySource('schedule_full')">
                            Şablon
                        </button>
                    </div>

                    <!-- 3 Durum Rozeti -->
                    <div class="anatomy-legend" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin:10px 0;">
                        <div class="anatomy-legend-item optimal" style="justify-content:center; padding:6px 4px;">
                            <div class="badge-dot"></div>
                            <span class="badge-val">${summary.optimalCount}</span>
                            <span class="badge-label" style="white-space:nowrap; font-size:11px;">İyi Açılan</span>
                        </div>
                        <div class="anatomy-legend-item insufficient" style="justify-content:center; padding:6px 4px;">
                            <div class="badge-dot"></div>
                            <span class="badge-val">${summary.insufficientCount}</span>
                            <span class="badge-label" style="white-space:nowrap; font-size:11px;">Az Çalışan</span>
                        </div>
                        <div class="anatomy-legend-item unworked" style="justify-content:center; padding:6px 4px;">
                            <div class="badge-dot"></div>
                            <span class="badge-val">${summary.unworkedCount}</span>
                            <span class="badge-label" style="white-space:nowrap; font-size:11px;">Kilitli (0s)</span>
                        </div>
                    </div>

                    <!-- 4 Mobil Eklem Seçici Kartlar (2x2 Kompakt Grid) -->
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; width:100%;">
                        ${joints.map(j => {
                            const isSel = j.id === currentSelectedMobilityJoint;
                            const dotColor = j.status === 'optimal' ? '#16A34A' : (j.status === 'insufficient' ? '#F59E0B' : '#EF4444');
                            const cardBg = isSel ? '#F0FDF4' : '#F8FAFC';
                            const cardBrd = isSel ? '2px solid #65A30D' : '1.5px solid #E2E8F0';
                            return `
                                <button type="button" style="background:${cardBg}; border:${cardBrd}; border-radius:10px; padding:8px 10px; text-align:left; cursor:pointer; transition:all 0.2s;" onclick="selectMobilityJoint('${j.id}')">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="font-size:12.5px; font-weight:900; color:#0F172A; white-space:nowrap;">${escapeHTML(j.name)}</span>
                                        <span style="width:8px; height:8px; border-radius:50%; background:${dotColor}; display:inline-block;"></span>
                                    </div>
                                    <div style="font-size:11px; color:#475569; font-weight:700; margin-top:2px;">
                                        ${j.effectiveDone.toFixed(1)} / ${j.optimalMin}-${j.optimalMax} Set
                                    </div>
                                </button>
                            `;
                        }).join('')}
                    </div>

                    <!-- Seçili Eklem Detay & 2 Katmanlı Alt Bölge Tablosu -->
                    ${focusJointHTML}
                </div>

                <!-- BÖLÜM 2: HAREKET YÖNÜ ÇEŞİTLİLİĞİ -->
                <div class="anatomy-hero-wrapper" style="align-items:stretch;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                        <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">🧭 Hareket Yönü Çeşitliliği</h3>
                        <span style="font-size:11px; font-weight:800; background:#F1F5F9; color:#0F172A; padding:3px 8px; border-radius:6px; border:1px solid #CBD5E1; white-space:nowrap;">
                            %${functionalPct} Eklem Açan (${functionalSets}s)
                        </span>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px;">
                        ${Object.entries(planes).map(([pKey, pObj]) => {
                            const pct = totalPlaneSets > 0 ? Math.round((pObj.sets / totalPlaneSets) * 100) : 0;
                            const isZero = pObj.sets === 0;
                            const exNames = Array.from(pObj.exs).slice(0, 3).map(escapeHTML).join(', ');
                            return `
                                <div style="background:${isZero ? '#FEF2F2' : '#F8FAFC'}; border:1px solid ${isZero ? '#FECACA' : '#E2E8F0'}; border-radius:10px; padding:10px; display:flex; flex-direction:column; justify-content:space-between;">
                                    <div>
                                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:900; color:#0F172A;">
                                            <span>${escapeHTML(pObj.label)}</span>
                                            <span style="color:${isZero ? '#DC2626' : pObj.color};">${pObj.sets}s (%${pct})</span>
                                        </div>
                                        <div style="height:5px; background:#E2E8F0; border-radius:3px; overflow:hidden; margin-top:5px;">
                                            <div style="height:100%; width:${Math.min(100, pct)}%; background:${isZero ? '#EF4444' : pObj.color};"></div>
                                        </div>
                                        <div style="font-size:11px; color:#475569; margin-top:5px;">
                                            ${isZero
                                                ? `<strong style="color:#B91C1C;">0 Set (Boşta)</strong>`
                                                : `${exNames || 'Tamamlandı'}`
                                            }
                                        </div>
                                    </div>
                                    ${isZero ? `
                                        <button type="button" class="btn btn-outline" style="margin-top:6px; width:100%; font-size:11px; padding:5px 8px; border-color:#FECACA; color:#DC2626; font-weight:800; background:#FFFFFF;" onclick="openQuickAddToDayModal('${pObj.recId}')">
                                            ➕ ${escapeHTML(pObj.recName)} Ekle
                                        </button>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- BÖLÜM 3: HAFTALIK HAREKETLİLİK GELİŞİMİ (SON 6 HAFTA) -->
                <div class="anatomy-hero-wrapper" style="align-items:stretch;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
                        <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">📈 6 Haftalık Trend</h3>
                        <span style="font-size:11px; font-weight:800; padding:3px 8px; border-radius:6px; ${parseFloat(deltaEvoSets) >= 0 ? 'background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;' : 'background:#FEF3C7; color:#B45309; border:1px solid #FCD34D;'}">
                            ${parseFloat(deltaEvoSets) >= 0 ? `+${deltaEvoSets}` : deltaEvoSets} Set
                        </span>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:8px; align-items:end; height:110px; padding:10px 8px 4px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px;">
                        ${evo.map(w => {
                            const hPct = Math.max(8, Math.round((w.endRangeSets / maxEvoSets) * 100));
                            const isCurrent = w.offset === 0;
                            const barBg = w.endRangeSets >= 22 ? '#16A34A' : (w.endRangeSets > 0 ? '#84CC16' : '#CBD5E1');
                            return `
                                <div style="display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%;" title="${escapeHTML(w.fullLabel)}: ${w.endRangeSets.toFixed(1)} Set">
                                    <div style="font-size:10px; font-weight:800; color:#0F172A; margin-bottom:3px;">${w.endRangeSets.toFixed(0)}s</div>
                                    <div style="width:100%; max-width:34px; height:${hPct}%; background:${barBg}; border-radius:5px 5px 2px 2px; border:${isCurrent ? '2px solid #0F172A' : 'none'};"></div>
                                    <div style="font-size:9.5px; font-weight:${isCurrent ? '900' : '700'}; color:${isCurrent ? '#0F172A' : '#64748B'}; margin-top:4px; white-space:nowrap;">${escapeHTML(w.label)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- BÖLÜM 4: 4 FİZİKSEL HAREKETLİLİK TESTİ -->
                <div class="anatomy-hero-wrapper" style="align-items:stretch;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                        <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">🩺 4 Fiziksel Açıklık Testi</h3>
                        ${testData.history.length > 0 ? `
                            <span style="font-size:10.5px; font-weight:800; color:#0369A1; background:#E0F2FE; border:1px solid #BAE6FD; padding:3px 8px; border-radius:6px; white-space:nowrap;">
                                Son: ${escapeHTML(testData.history[0].date)}
                            </span>
                        ` : ''}
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:8px;">
                        ${physicalTestsHTML}
                    </div>
                </div>
            `;
        }


        function renderScaleAnalytics(container) {
            const unified = getUnifiedBodyLogs();
            const scaleLogs = getScaleLogs();
            const measLogs = getMeasurementsLogs();

            if (unified.length === 0) {
                container.innerHTML = `
                    <div style="background:var(--bg-surface); padding:20px 16px; text-align:center; border:1px dashed var(--border); border-radius:12px;">
                        <span style="font-size:32px; display:block; margin-bottom:8px;">⚖️📏</span>
                        <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin-bottom:6px;">Henüz Ölçüm Kaydı Yok</h3>
                        <p style="font-size:11.5px; color:var(--text-secondary); max-width:340px; margin:0 auto 12px; line-height:1.4;">
                            Kilo, yağ oranı veya mezura ölçülerini ekleyerek değişimini takip et.
                        </p>
                        <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
                            <button class="btn btn-gold" style="font-size:12px; padding:8px 14px; font-weight:900;" onclick="openScaleModal()">
                                + Ölçüm Ekle
                            </button>
                            <button class="btn btn-outline" style="font-size:11.5px; padding:8px 12px; font-weight:700;" onclick="seedUniqueHealthSample()">
                                ⚡ Örnek Yükle
                            </button>
                        </div>
                    </div>
                `;
                return;
            }

            const latestScale = scaleLogs.length > 0 ? scaleLogs[0] : null;
            const earliestScale = scaleLogs.length > 0 ? scaleLogs[scaleLogs.length - 1] : null;
            const deltaWeight = (scaleLogs.length > 1 && latestScale) ? (latestScale.weight - earliestScale.weight).toFixed(1) : null;
            const deltaFat = (scaleLogs.length > 1 && latestScale?.bodyFat && earliestScale?.bodyFat) ? (latestScale.bodyFat - earliestScale.bodyFat).toFixed(1) : null;
            const deltaMuscle = (scaleLogs.length > 1 && latestScale?.muscleMass && earliestScale?.muscleMass) ? (latestScale.muscleMass - earliestScale.muscleMass).toFixed(1) : null;

            const latestMeas = measLogs.length > 0 ? measLogs[0] : null;
            const earliestMeas = measLogs.length > 0 ? measLogs[measLogs.length - 1] : null;
            const deltaWaist = (measLogs.length > 1 && latestMeas?.waist && earliestMeas?.waist) ? (latestMeas.waist - earliestMeas.waist).toFixed(1) : null;
            const deltaArms = (measLogs.length > 1 && latestMeas?.arms && earliestMeas?.arms) ? (latestMeas.arms - earliestMeas.arms).toFixed(1) : null;

            // Kompakt Tek Satır Tazelik & Özel Program Çubuğu
            let freshnessBarHtml = '';
            if (latestScale) {
                const latestDate = new Date(latestScale.date);
                const now = new Date();
                const daysDiff = Math.max(0, Math.floor((now - latestDate) / (1000 * 60 * 60 * 24)));
                const statusColor = daysDiff <= 14 ? '#15803D' : (daysDiff <= 28 ? '#B45309' : '#DC2626');
                const statusBg = daysDiff <= 14 ? '#F0FDF4' : (daysDiff <= 28 ? '#FFFBEB' : '#FEF2F2');
                const statusBrd = daysDiff <= 14 ? '#86EFAC' : (daysDiff <= 28 ? '#FCD34D' : '#FECACA');
                const statusDot = daysDiff <= 14 ? '🟢' : (daysDiff <= 28 ? '🟡' : '🔴');
                const statusText = daysDiff <= 14
                    ? `Güncel Ölçüm (${daysDiff === 0 ? 'Bugün' : `${daysDiff}g önce`})`
                    : (daysDiff <= 28 ? `Aktif Blok (${daysDiff}g önce)` : `Yenileme Zamanı (${daysDiff}g önce)`);

                freshnessBarHtml = `
                    <div style="background:${statusBg}; border:1px solid ${statusBrd}; border-radius:10px; padding:8px 12px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                        <div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:800; color:${statusColor};">
                            <span>${statusDot}</span>
                            <span style="white-space:nowrap;">${statusText}</span>
                        </div>
                        <button class="btn btn-gold" style="font-size:11.5px; padding:6px 12px; font-weight:800; border-radius:8px; white-space:nowrap;" onclick="generateTailoredWorkoutFromScale()">
                            ⚡ Analize Göre Program Üret
                        </button>
                    </div>
                `;
            }

            const uh = latestScale?.uniqueHealth || null;

            container.innerHTML = `
                <!-- KOMPAKT TAZELİK & PROGRAM ÇUBUĞU -->
                ${freshnessBarHtml}

                <!-- UNIFIED KPI CARDS (2x2 + 1 COMPACT GRID) -->
                <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-bottom:12px;">
                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">KİLO</div>
                        <div style="font-size:17px; font-weight:900; color:var(--gold); margin-top:2px;">
                            ${latestScale ? `${latestScale.weight} kg` : '-'}
                        </div>
                        ${deltaWeight !== null ? `
                            <div style="font-size:10.5px; font-weight:800; color:${parseFloat(deltaWeight) <= 0 ? 'var(--green-success)' : 'var(--red-alert)'}; margin-top:1px;">
                                ${parseFloat(deltaWeight) > 0 ? '+' : ''}${deltaWeight} kg
                            </div>
                        ` : '<div style="font-size:10px; color:var(--text-secondary); margin-top:1px;">Son Kayıt</div>'}
                    </div>

                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">İSKELET KASI</div>
                        <div style="font-size:17px; font-weight:900; color:var(--green-success); margin-top:2px;">
                            ${latestScale?.muscleMass ? `${latestScale.muscleMass} kg` : '-'}
                        </div>
                        <div style="font-size:10px; color:#15803D; font-weight:800; margin-top:1px;">
                            ${deltaMuscle !== null ? `${parseFloat(deltaMuscle) > 0 ? '+' : ''}${deltaMuscle} kg` : 'Kas Kütlesi'}
                        </div>
                    </div>

                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">YAĞ ORANI</div>
                        <div style="font-size:17px; font-weight:900; color:var(--cyan); margin-top:2px;">
                            ${latestScale?.bodyFat ? `%${latestScale.bodyFat}` : '-'}
                        </div>
                        <div style="font-size:10px; color:#0369A1; font-weight:800; margin-top:1px;">
                            ${uh?.bodyFatKg ? `${uh.bodyFatKg} kg Yağ` : (deltaFat !== null ? `${parseFloat(deltaFat) > 0 ? '+' : ''}${deltaFat}%` : 'Vücut Yağı')}
                        </div>
                    </div>

                    <div class="analytics-kpi-card" style="padding:10px 12px;">
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">BEL & KOL</div>
                        <div style="font-size:16px; font-weight:900; color:#0F172A; margin-top:2px; white-space:nowrap;">
                            ${latestMeas?.waist ? `${latestMeas.waist} cm` : '-'} ${latestMeas?.arms ? `• ${latestMeas.arms} cm` : ''}
                        </div>
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:700; margin-top:1px;">
                            ${deltaWaist !== null ? `Bel: ${parseFloat(deltaWaist) > 0 ? '+' : ''}${deltaWaist} cm` : 'Mezura'}
                        </div>
                    </div>
                </div>

                ${(uh && (uh.totalWater || uh.protein || uh.minerals || uh.bone || uh.leanBodyMass || uh.subcutaneousFatKg)) ? `
                <!-- CELLULAR & FLUID BALANCE CARD (COMPACT 2x2) -->
                <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h3 style="font-size:13.5px; font-weight:900; color:#0F172A; margin:0;">🧬 Su, Protein & Bileşenler</h3>
                        <span style="font-size:10.5px; color:#15803D; font-weight:800; background:rgba(16,185,129,0.15); padding:2px 8px; border-radius:99px;">${(uh.extraWater && uh.totalWater && (uh.extraWater / uh.totalWater) <= 0.40) ? 'Ödem Yok' : 'Vücut Bileşenleri'}</span>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
                        ${(uh.totalWater || latestScale?.waterPct) ? `
                        <div style="background:#F8FAFC; padding:8px 10px; border-radius:8px;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">TOPLAM SU</div>
                            <div style="font-size:14.5px; font-weight:900; color:var(--cyan); margin-top:1px;">${uh.totalWater ? `${uh.totalWater} kg` : `%${latestScale.waterPct}`}</div>
                            <div style="font-size:9.5px; color:var(--text-secondary);">${(uh.intraWater && uh.extraWater) ? `İç: ${uh.intraWater} / Dış: ${uh.extraWater}` : (latestScale?.waterPct ? `Oran: %${latestScale.waterPct}` : 'Vücut Suyu')}</div>
                        </div>` : ''}

                        ${uh.protein ? `
                        <div style="background:#F8FAFC; padding:8px 10px; border-radius:8px;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">PROTEİN</div>
                            <div style="font-size:14.5px; font-weight:900; color:var(--gold); margin-top:1px;">${uh.protein} kg</div>
                            <div style="font-size:9.5px; color:#15803D; font-weight:700;">Kas Yapısı</div>
                        </div>` : ''}

                        ${uh.minerals ? `
                        <div style="background:#F8FAFC; padding:8px 10px; border-radius:8px;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">MİNERAL</div>
                            <div style="font-size:14.5px; font-weight:900; color:#0F172A; margin-top:1px;">${uh.minerals} kg</div>
                            <div style="font-size:9.5px; color:#15803D; font-weight:700;">Kemik & İyon</div>
                        </div>` : ''}

                        ${uh.bone ? `
                        <div style="background:#F8FAFC; padding:8px 10px; border-radius:8px;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">KEMİK</div>
                            <div style="font-size:14.5px; font-weight:900; color:#0F172A; margin-top:1px;">${uh.bone} kg</div>
                            <div style="font-size:9.5px; color:var(--text-secondary);">İskelet</div>
                        </div>` : (uh.leanBodyMass ? `
                        <div style="background:#F8FAFC; padding:8px 10px; border-radius:8px;">
                            <div style="font-size:10px; color:var(--text-secondary); font-weight:700;">YAĞSIZ KÜTLE</div>
                            <div style="font-size:14.5px; font-weight:900; color:#0F172A; margin-top:1px;">${uh.leanBodyMass} kg</div>
                            <div style="font-size:9.5px; color:var(--text-secondary);">Aktif Doku</div>
                        </div>` : '')}
                    </div>
                </div>
                ` : ''}

                ${(uh?.segmental && (uh.segmental.leftArm?.muscleKg || uh.segmental.rightArm?.muscleKg || uh.segmental.trunk?.muscleKg || uh.segmental.trunk?.fatKg || uh.segmental.leftLeg?.muscleKg || uh.segmental.rightLeg?.muscleKg)) ? `
                <!-- SEGMENTAL (BÖLGESEL) KAS & YAĞ HARİTASI -->
                <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:12px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h3 style="font-size:13.5px; font-weight:900; color:#0F172A; margin:0;">🧍 Bölgesel Kas & Yağ</h3>
                        <span style="font-size:10.5px; color:var(--cyan); font-weight:700;">BIA Analizi</span>
                    </div>

                    <div class="scale-segmental-grid" style="gap:8px;">
                        ${(uh.segmental.leftArm?.muscleKg || uh.segmental.rightArm?.muscleKg || uh.segmental.leftArm?.fatKg) ? `
                        <div class="scale-segmental-card" style="border-left:3px solid var(--cyan); padding:8px 10px;">
                            <div style="font-weight:900; color:#0F172A; font-size:12px;">🦾 Kollar</div>
                            <div style="color:var(--text-secondary); font-size:11px; margin-top:2px;">Sol: <strong>${uh.segmental.leftArm?.muscleKg != null ? `${uh.segmental.leftArm.muscleKg}kg` : '-'}</strong> • Sağ: <strong>${uh.segmental.rightArm?.muscleKg != null ? `${uh.segmental.rightArm.muscleKg}kg` : '-'}</strong></div>
                            <div style="color:#15803D; font-size:10.5px; font-weight:800; margin-top:2px;">Kas Dengesi</div>
                        </div>` : ''}

                        ${(uh.segmental.trunk?.muscleKg || uh.segmental.trunk?.fatKg) ? `
                        <div class="scale-segmental-card" style="border-left:3px solid var(--gold); background:rgba(245,158,11,0.06); padding:8px 10px;">
                            <div style="font-weight:900; color:#0F172A; font-size:12px;">🎯 Gövde & Bel</div>
                            <div style="color:#0F172A; font-size:11px; margin-top:2px;">Kas: <strong>${uh.segmental.trunk?.muscleKg != null ? `${uh.segmental.trunk.muscleKg}kg` : '-'}</strong> • Yağ: <strong style="color:#DC2626;">${uh.segmental.trunk?.fatKg != null ? `${uh.segmental.trunk.fatKg}kg` : '-'}</strong></div>
                            <div style="color:#B45309; font-size:10.5px; font-weight:800; margin-top:2px;">Merkez Bölge</div>
                        </div>` : ''}

                        ${(uh.segmental.leftLeg?.muscleKg || uh.segmental.rightLeg?.muscleKg || uh.segmental.leftLeg?.fatKg) ? `
                        <div class="scale-segmental-card" style="border-left:3px solid var(--green-success); padding:8px 10px;">
                            <div style="font-weight:900; color:#15803D; font-size:12px;">🦵 Bacaklar</div>
                            <div style="color:var(--text-secondary); font-size:11px; margin-top:2px;">Sol: <strong>${uh.segmental.leftLeg?.muscleKg != null ? `${uh.segmental.leftLeg.muscleKg}kg` : '-'}</strong> • Sağ: <strong>${uh.segmental.rightLeg?.muscleKg != null ? `${uh.segmental.rightLeg.muscleKg}kg` : '-'}</strong></div>
                            <div style="color:#15803D; font-size:10.5px; font-weight:800; margin-top:2px;">Alt Vücut</div>
                        </div>` : ''}
                    </div>
                </div>
                ` : ''}

                <!-- UNIFIED BODY COMPOSITION & MEASUREMENTS HISTORY LIST -->
                <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h3 style="font-size:13.5px; font-weight:800; color:#0F172A; margin:0;">📋 Ölçüm Geçmişi (${unified.length})</h3>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${unified.map((u, idx) => `
                            <div style="background:#F8FAFC; padding:12px 14px; border-radius:10px; border-left:4px solid ${u.weight ? 'var(--gold)' : 'var(--cyan)'};">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                                    <div>
                                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                                            <span style="font-size:12px; color:var(--text-secondary); font-weight:700;">📅 ${escapeHTML(u.date)}</span>
                                            ${u.weight ? `<strong style="font-size:15px; color:#0F172A;">${u.weight} kg</strong>` : ''}
                                            ${u.waist ? `<span style="font-size:13px; color:var(--cyan); font-weight:800; background:rgba(56,189,248,0.12); padding:2px 8px; border-radius:6px;">📏 Bel: ${u.waist} cm</span>` : ''}
                                            ${u.uniqueHealth ? '<span style="font-size:9.5px; background:rgba(56,189,248,0.2); color:var(--cyan); padding:2px 6px; border-radius:4px; font-weight:700;">Unique Health BIA</span>' : ''}
                                        </div>

                                        <!-- SCALE METRICS PILLS -->
                                        ${(u.bodyFat || u.muscleMass || u.waterPct || u.visceralFat || u.bmr) ? `
                                            <div style="font-size:11.5px; color:#475569; margin-top:5px; display:flex; gap:8px; flex-wrap:wrap;">
                                                ${u.bodyFat ? `<span>Yağ: <strong>%${u.bodyFat}</strong></span>` : ''}
                                                ${u.muscleMass ? `<span>İskelet Kası: <strong>${u.muscleMass} kg</strong></span>` : ''}
                                                ${u.waterPct ? `<span>Sıvı: <strong>%${u.waterPct}</strong></span>` : ''}
                                                ${u.visceralFat ? `<span>İç Yağ: <strong>${u.visceralFat}</strong></span>` : ''}
                                                ${u.bmr ? `<span>BMR: <strong>${u.bmr} kcal</strong></span>` : ''}
                                            </div>
                                        ` : ''}

                                        <!-- MEZURA METRICS PILLS -->
                                        ${(u.chest || u.shoulder || u.arms || u.thigh || u.hips || u.neck) ? `
                                            <div style="font-size:11.5px; color:var(--cyan); margin-top:4px; display:flex; gap:8px; flex-wrap:wrap;">
                                                ${u.arms ? `<span>Kol: <strong>${u.arms} cm</strong></span>` : ''}
                                                ${u.chest ? `<span>Göğüs: <strong>${u.chest} cm</strong></span>` : ''}
                                                ${u.shoulder ? `<span>Omuz: <strong>${u.shoulder} cm</strong></span>` : ''}
                                                ${u.thigh ? `<span>Bacak: <strong>${u.thigh} cm</strong></span>` : ''}
                                                ${u.hips ? `<span>Kalça: <strong>${u.hips} cm</strong></span>` : ''}
                                                ${u.neck ? `<span>Boyun: <strong>${u.neck} cm</strong></span>` : ''}
                                            </div>
                                        ` : ''}

                                        ${u.notes ? `<div style="font-size:11px; color:#0F172A; margin-top:4px;">📝 ${escapeHTML(u.notes)}</div>` : ''}
                                    </div>
                                    <div>
                                        <button class="btn-delete-log" onclick="deleteUnifiedBodyEntry(decodeURIComponent('${encodeURIComponent(u.date)}'), decodeURIComponent('${encodeURIComponent(u.scaleId || '')}'), decodeURIComponent('${encodeURIComponent(u.measId || '')}'))" title="Kaydı Sil">✕</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ----- TAILORED WORKOUT FROM SCALE COMPOSITION -----
        function generateTailoredWorkoutFromScale() {
            openQuickAiPrecheckModal(null, true);
        }

        // ----- SEED SAMPLE DATA FOR TESTING / IMMEDIATE EXPERIENCE -----
        function seedUniqueHealthSample() {
            const sampleEntry = {
                id: 'scale_' + Date.now(),
                date: '2026-10-07',
                weight: 77.65,
                bodyFat: 15.9,
                muscleMass: 37.2,
                waterPct: 61.6,
                visceralFat: 6,
                bmr: 1778,
                notes: 'Unique Health BIA Analizi • Puan: 84 • Vücut Yaşı: 39',
                timestamp: Date.now(),
                uniqueHealth: {
                    date: '2026-10-07',
                    dateFormatted: '07/10/2026',
                    weight: 77.65,
                    skeletalMuscle: 37.2,
                    muscleMass: 60.7,
                    bodyFat: 15.9,
                    bodyFatKg: 12.4,
                    totalWater: 47.8,
                    intraWater: 29.8,
                    extraWater: 18.0,
                    protein: 12.9,
                    minerals: 4.5,
                    bone: 3.6,
                    visceralFat: 6,
                    bmr: 1778,
                    bmi: 24.2,
                    bodyAge: 39,
                    bodyScore: 84,
                    bodyCellMass: 43,
                    heartRate: 77,
                    segmental: {
                        leftArm: { fatKg: 0.8, fatPct: 114.2, muscleKg: 3.4, musclePct: 103 },
                        rightArm: { fatKg: 0.8, fatPct: 114.2, muscleKg: 3.4, musclePct: 103 },
                        trunk: { fatKg: 6.3, fatPct: 140, muscleKg: 28.6, musclePct: 107.8 },
                        leftLeg: { fatKg: 1.6, fatPct: 88.8, muscleKg: 10.6, musclePct: 115.2 },
                        rightLeg: { fatKg: 1.6, fatPct: 88.8, muscleKg: 10.4, musclePct: 113.0 }
                    }
                }
            };

            let logs = getScaleLogs();
            logs = logs.filter(l => l.date !== sampleEntry.date);
            logs.unshift(sampleEntry);
            setScaleLogs(logs);
            renderAnalytics();
            playAlertSound();
            alert("✅ 07.10.2026 Unique Health Raporu başarıyla yüklendi!");
        }

        function renderMeasurementsAnalytics(container) {
            renderScaleAnalytics(container);
        }

        function toggleCoachReportAccordion(boxId, btnId, labelOpen, labelClose) {
            const box = document.getElementById(boxId);
            const btn = document.getElementById(btnId);
            if (!box) return;
            const isHidden = box.style.display === 'none';
            box.style.display = isHidden ? 'grid' : 'none';
            if (btn) {
                btn.innerHTML = isHidden ? labelClose : labelOpen;
            }
        }

        function analyzeIntraSessionFatigueAndDropOff(workoutLogs) {
            const logs = Array.isArray(workoutLogs) ? workoutLogs : [];
            const latestByEx = new Map();

            // workoutLogs is newest-first; capture the most recent multi-set session for each exercise
            logs.forEach(log => {
                if (!log || !Array.isArray(log.exercises)) return;
                log.exercises.forEach(ex => {
                    if (!ex || ex.isInterSetExtra) return;
                    const canonicalEx = resolveCanonicalDbExercise(ex);
                    const mode = getExerciseMetricMode(canonicalEx);
                    if (mode === 'cardio_min') return; // Dakika bazlı kardiyo tekrar dayanıklılığı listesine girmez

                    const key = canonicalEx.id || canonicalEx.name || ex.id || ex.name;
                    if (!key || latestByEx.has(key)) return;

                    const completedSets = Array.isArray(ex.sets)
                        ? ex.sets.filter(st => st && st.completed && (Number(st.reps) > 0 || Number(st.weight) > 0))
                        : [];
                    if (completedSets.length < 2) return;

                    const isTime = mode === 'time_sec';
                    const isBw = isExerciseBodyweight(canonicalEx);
                    const unitLabel = isTime ? 'sn' : 'tekrar';

                    const weights = completedSets.map(st => {
                        const val = parseFloat(st.weight);
                        return !isNaN(val) && val > 0 ? val : 0;
                    });
                    const repsArr = completedSets.map(st => Math.max(0, parseInt(st.reps, 10) || 0));
                    const e1rms = completedSets.map(st => computeSetEpleyE1RM(canonicalEx, st.weight, st.reps));

                    const firstSet = completedSets[0];
                    const lastSet = completedSets[completedSets.length - 1];
                    const firstReps = repsArr[0];
                    const lastReps = repsArr[repsArr.length - 1];
                    const firstWeight = weights[0];
                    const lastWeight = weights[weights.length - 1];
                    const minWeight = Math.min(...weights);
                    const maxWeight = Math.max(...weights);
                    const hasAddedLoad = maxWeight > 0;

                    const repDelta = lastReps - firstReps;
                    const weightDelta = Math.round((lastWeight - firstWeight) * 10) / 10;

                    const firstE1RM = e1rms[0];
                    const lastE1RM = e1rms[e1rms.length - 1];
                    const avgReps = repsArr.reduce((s, r) => s + r, 0) / repsArr.length;
                    let retentionPct = firstReps > 0 ? Math.min(100, Math.round((avgReps / firstReps) * 100)) : 100;

                    const setChainText = completedSets.map((st, idx) => {
                        const wVal = weights[idx];
                        let wStr = '';
                        if (isBw) {
                            wStr = wVal > 0 ? `BW(+${wVal}kg) × ` : '';
                        } else if (wVal > 0) {
                            wStr = `${wVal}kg × `;
                        }
                        return `${idx + 1}. Set: <strong>${wStr}${st.reps} ${unitLabel}</strong>`;
                    }).join(' <span style="color:#94A3B8;">➔</span> ');

                    let category = 'normal_fatigue';
                    let badgeText = '';
                    let badgeStyle = '';
                    let reasonText = '';
                    let adviceText = '';
                    let sortPriority = 2;

                    if (isTime) {
                        const peakTimeSets = hasAddedLoad ? completedSets.filter((_, idx) => weights[idx] === maxWeight) : completedSets;
                        const refFirst = peakTimeSets.length >= 2 ? (parseInt(peakTimeSets[0].reps, 10) || 0) : firstReps;
                        const refLast = peakTimeSets.length >= 2 ? (parseInt(peakTimeSets[peakTimeSets.length - 1].reps, 10) || 0) : lastReps;
                        const secDelta = refLast - refFirst;
                        const secDrop = refFirst - refLast;
                        const secDropPct = refFirst > 0 ? Math.round((secDrop / refFirst) * 100) : 0;

                        if (maxWeight > minWeight && lastWeight > firstWeight && lastE1RM >= firstE1RM) {
                            category = 'pyramid';
                            sortPriority = 3;
                            retentionPct = 100;
                            badgeText = `📈 Piramit Güç Artışı (+${weightDelta} kg)`;
                            badgeStyle = 'background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE;';
                            reasonText = `Ek ağırlığı <strong>${firstWeight} kg'dan ${lastWeight} kg'a</strong> çıkararak yükü artırdın; bu bir yorgunluk kaybı değil kademeli yüklenmedir.`;
                            adviceText = `Sonraki seansta zirve ağırlığında (<strong>${lastWeight} kg</strong>) <strong>+5 sn</strong> daha uzun tutmaya odaklan.`;
                        } else if (secDrop >= 10 && secDropPct >= 25) {
                            category = 'early_drop';
                            sortPriority = 1;
                            badgeText = `⚡ Süre Düşüşü (-${secDrop} sn)`;
                            badgeStyle = 'background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;';
                            reasonText = `İlk çalışma setinde <strong>${refFirst} sn</strong> tuttuktan sonra son sette <strong>${refLast} sn</strong> seviyesine (-${secDrop} sn, %${secDropPct}) düştün.`;
                            adviceText = (!isBw || hasAddedLoad)
                                ? `İlk sette kasını son saniyeye kadar tüketme ve set arası dinlenmeyi <strong>+30 sn</strong> uzat.`
                                : `Vücut ağırlığında ilk sette kendini erken tüketme (<strong>${Math.max(10, refFirst - 5)} sn</strong> bırak) ve set arası dinlenmeni <strong>+30 sn</strong> uzat.`;
                        } else if (secDelta < 0) {
                            category = 'normal_fatigue';
                            sortPriority = 2;
                            badgeText = `🔋 Doğal İzometrik Yorgunluk (${secDelta} sn)`;
                            badgeStyle = 'background:#F0F9FF; color:#0369A1; border:1px solid #BAE6FD;';
                            reasonText = `İzometrik tutuşta <strong>${refFirst} sn</strong>'den <strong>${refLast} sn</strong>'ye ufak iniş (%${secDropPct}) sinir-kas yorgunluğu sınırları içinde ve sağlıklıdır.`;
                            adviceText = (isBw && !hasAddedLoad)
                                ? `Ağırlık eklemene gerek yok; sonraki seansta tüm setlerde <strong>${refFirst} sn</strong> tutuşu korumayı hedefle.`
                                : `Mevcut yükle devam et; tüm setlerde <strong>${refFirst} sn</strong>'ye ulaştığında süreyi artır.`;
                        } else {
                            category = 'rock_solid';
                            sortPriority = 3;
                            const gainLabel = secDelta > 0 ? `+${secDelta} sn Artış` : 'Sıfır Kayıp';
                            badgeText = `🛡️ Tam Dayanıklılık (${gainLabel})`;
                            badgeStyle = 'background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;';
                            reasonText = `Tüm setlerde tutuş süreni korudun (${refFirst} ➔ ${refLast} sn). Core ve izometrik dayanıklılığın bu süreye tamamen hazır.`;
                            adviceText = (isBw && !hasAddedLoad)
                                ? `Harika! Sonraki antrenmanda her sete <strong>+5 sn</strong> ekleyebilir veya bir üst zorlukta vücut ağırlığı varyasyonuna geçebilirsin.`
                                : `Harika! Sonraki antrenmanda süreyi <strong>+5 sn</strong> artırabilirsin.`;
                        }
                    } else if (maxWeight > minWeight) {
                        // Çoklu ağırlık (Piramit / Isınma + Top-Set + Back-Off / Drop-Set) analizi
                        let isNonDecreasing = true;
                        let isNonIncreasing = true;
                        for (let i = 1; i < weights.length; i++) {
                            if (weights[i] < weights[i - 1]) isNonDecreasing = false;
                            if (weights[i] > weights[i - 1]) isNonIncreasing = false;
                        }
                        const peakSetsIndices = weights.reduce((arr, w, idx) => (w === maxWeight ? arr.concat(idx) : arr), []);
                        const hasTopSetCollapse = peakSetsIndices.length >= 2
                            && (repsArr[peakSetsIndices[0]] - repsArr[peakSetsIndices[peakSetsIndices.length - 1]]) >= 3;

                        if (hasTopSetCollapse) {
                            const topFirstR = repsArr[peakSetsIndices[0]];
                            const topLastR = repsArr[peakSetsIndices[peakSetsIndices.length - 1]];
                            const topDelta = topLastR - topFirstR;
                            const avgPeakReps = peakSetsIndices.reduce((s, idx) => s + repsArr[idx], 0) / peakSetsIndices.length;
                            retentionPct = topFirstR > 0 ? Math.min(100, Math.round((avgPeakReps / topFirstR) * 100)) : retentionPct;

                            category = 'early_drop';
                            sortPriority = 1;
                            badgeText = `⚡ Ağır Set Düşüşü (${topDelta} ${unitLabel})`;
                            badgeStyle = 'background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;';
                            reasonText = `En ağır çalışma kilon olan <strong>${maxWeight} kg</strong> setlerinde <strong>${topFirstR} ${unitLabel}</strong>'dan <strong>${topLastR} ${unitLabel}</strong>'a (${topDelta}) düşüş oldu.`;
                            adviceText = `İlk <strong>${maxWeight} kg</strong> setinde cepte 1-2 tekrar bırak ve ağır setler arasında <strong>2-3 dakika</strong> dinlen.`;
                        } else if (isNonDecreasing && lastWeight > firstWeight) {
                            if (lastE1RM >= firstE1RM * 0.99) {
                                const e1rmGainPct = Math.max(1, Math.round(((lastE1RM - firstE1RM) / Math.max(1, firstE1RM)) * 100));
                                category = 'pyramid';
                                sortPriority = 3;
                                retentionPct = 100;
                                badgeText = `📈 Piramit Güç Artışı (+${weightDelta} kg)`;
                                badgeStyle = 'background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE;';
                                reasonText = `Ağırlığı <strong>${firstWeight} kg'dan ${lastWeight} kg'a</strong> yükselttin. Ağır kiloda tekrarı (${lastReps} ${unitLabel}) tutabilmen kuvvet artışıdır (tahmini güç +%${e1rmGainPct}).`;
                                adviceText = `Artan piramit planın gayet dengeli. Sonraki seansta zirve kilon olan <strong>${lastWeight} kg</strong> ile <strong>+1 ${unitLabel}</strong> fazla hedeflenebilir.`;
                            } else {
                                category = 'normal_fatigue';
                                sortPriority = 2;
                                badgeText = `🔋 Ağır Set Geçişi (+${weightDelta} kg)`;
                                badgeStyle = 'background:#F0F9FF; color:#0369A1; border:1px solid #BAE6FD;';
                                reasonText = `Setlerde kilo artırınca (${firstWeight} ➔ ${lastWeight} kg) tekrar sayısı ${firstReps}'ten ${lastReps}'e indi.`;
                                adviceText = `Yeni ağırlık atlayışında <strong>${lastWeight} kg</strong> ile en az 6-8 tekrar çıkarabileceğin basamak seç.`;
                            }
                        } else if (isNonIncreasing && lastWeight < firstWeight && repDelta <= -3) {
                            category = 'early_drop';
                            sortPriority = 1;
                            badgeText = `⚡ Güç & Kilo Düşüşü (${weightDelta} kg / ${repDelta} ${unitLabel})`;
                            badgeStyle = 'background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;';
                            reasonText = `1. sette <strong>${firstWeight} kg × ${firstReps} ${unitLabel}</strong> sonrası yorgunlukla hem kilo (${lastWeight} kg) hem tekrar (${lastReps} ${unitLabel}) düştü.`;
                            adviceText = `Gelecek seansta çalışmaya <strong>${Math.round(((firstWeight + lastWeight) / 2) * 2) / 2} kg</strong> bandında başla ve tüm setlerde tekrarı koru.`;
                        } else {
                            // Kontrollü Drop-Set (45->40->35 kg) veya Isınma + Top-Set + Back-Off (25->35->25 kg)
                            const isBackOffPattern = peakSetsIndices[0] > 0 && lastWeight < maxWeight;
                            category = 'drop_set';
                            sortPriority = 2;
                            retentionPct = Math.min(100, Math.round((lastE1RM / Math.max(0.5, firstE1RM)) * 100));
                            badgeText = isBackOffPattern ? `🔻 Top-Set & Kontrollü İniş` : `🔻 Kontrollü Kilo Düşürme (${weightDelta} kg)`;
                            badgeStyle = 'background:#FFFBEB; color:#B45309; border:1px solid #FDE68A;';
                            reasonText = isBackOffPattern
                                ? `Isınma sonrası <strong>${maxWeight} kg</strong> ana sete çıkıp ardından <strong>${lastWeight} kg × ${lastReps} ${unitLabel}</strong> kontrollü destek (back-off) seti uyguladın.`
                                : `Yorgunluğa rağmen kilonu kontrollü indirip (${firstWeight} ➔ ${lastWeight} kg) son sette <strong>${lastReps} ${unitLabel}</strong> hacmini korudun (drop-set).`;
                            adviceText = isBackOffPattern
                                ? `Sonraki antrenmanda ana çalışma setin olan <strong>${maxWeight} kg</strong> yükünü tekrar veya +1-2 kg artırmaya odaklan.`
                                : `Temel güç seviyesini ölçmek için gelecek seansta tüm setleri sabit <strong>${firstWeight} kg</strong> veya bir alt sabit kiloda yapmayı deneyebilirsin.`;
                        }
                    } else {
                        // Sabit kiloda set içi tekrar analizi (Willardson & Burkett 2005: -1 / -2 doğal, <= -3 hızlı düşüş)
                        if (repDelta <= -3) {
                            category = 'early_drop';
                            sortPriority = 1;
                            const repDropPct = firstReps > 0 ? Math.round(((firstReps - lastReps) / firstReps) * 100) : 0;
                            badgeText = `⚡ Hızlı Güç Düşüşü (${repDelta} ${unitLabel})`;
                            badgeStyle = 'background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;';
                            reasonText = `Aynı yükte 1. sette <strong>${firstReps} ${unitLabel}</strong> çıkarıp son sette <strong>${lastReps} ${unitLabel}</strong> seviyesine (%${repDropPct} düşüş) indin. İlk sette cepte tekrar bırakmamış veya kısa dinlenmiş olabilirsin.`;
                            adviceText = `Bir sonraki seansta 1. sette <strong>${Math.max(1, firstReps - 1)} ${unitLabel}</strong> yapıp cepte 1-2 tekrar bırak ve set arası dinlenmeni <strong>+30 saniye</strong> uzat.`;
                        } else if (repDelta === -1 || repDelta === -2) {
                            category = 'normal_fatigue';
                            sortPriority = 2;
                            badgeText = `🔋 Doğal Kas Yorgunluğu (${repDelta} ${unitLabel})`;
                            badgeStyle = 'background:#F0F9FF; color:#0369A1; border:1px solid #BAE6FD;';
                            reasonText = `1. sette <strong>${firstReps} ${unitLabel}</strong> yapıp sonraki setlerde <strong>${lastReps} ${unitLabel}</strong> seviyesinde kalman bilimsel olarak sağlıklı gelişim aralığıdır.`;
                            adviceText = (isBw && !hasAddedLoad)
                                ? `Aynı hareketle devam et; tüm setlerde düşmeden <strong>${firstReps} ${unitLabel}</strong> çıkardığında +1-2 tekrar artırabilirsin.`
                                : `Kilonu değiştirme; tüm setlerde düşmeden <strong>${firstReps} ${unitLabel}</strong> çıkardığında bir üst kiloya geçme vaktin gelmiştir.`;
                        } else {
                            category = 'rock_solid';
                            sortPriority = 3;
                            const gainLabel = repDelta > 0 ? `+${repDelta} ${unitLabel} Artış` : 'Sıfır Kayıp';
                            badgeText = `🛡️ Tam Dayanıklılık (${gainLabel})`;
                            badgeStyle = 'background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;';
                            reasonText = `İlk setten son sete kadar gücün hiç düşmedi (${firstReps} ➔ ${lastReps} ${unitLabel}). Kasların bu yükte tamamen rahatlamış durumda.`;
                            adviceText = (isBw && !hasAddedLoad)
                                ? `Bu seviyeye hakimsin. Sonraki antrenmanda her sete <strong>+1-2 ${unitLabel}</strong> ekleyebilir veya zorluğu artırabilirsin.`
                                : `Bu kilo artık senin için rahatlamış. Bir sonraki antrenmanda ağırlığı <strong>+1 ile +2.5 kg</strong> artırabilir veya her sete <strong>+1-2 ${unitLabel}</strong> ekleyebilirsin.`;
                        }
                    }

                    latestByEx.set(key, {
                        key,
                        name: canonicalEx.name || ex.name,
                        dateFormatted: log.dateFormatted || log.date || '',
                        setsCount: completedSets.length,
                        firstReps,
                        lastReps,
                        firstWeight,
                        lastWeight,
                        maxWeight,
                        repDelta,
                        weightDelta,
                        retentionPct,
                        unitLabel,
                        isTimeBased: isTime,
                        isBodyweight: isBw,
                        setChainText,
                        category,
                        badgeText,
                        badgeStyle,
                        reasonText,
                        adviceText,
                        sortPriority
                    });
                });
            });

            const items = Array.from(latestByEx.values()).sort((a, b) => a.sortPriority - b.sortPriority);
            const avgRetention = items.length > 0
                ? Math.round(items.reduce((s, it) => s + it.retentionPct, 0) / items.length)
                : 100;

            return {
                items,
                avgRetention,
                earlyDropCount: items.filter(i => i.category === 'early_drop').length,
                normalFatigueCount: items.filter(i => i.category === 'normal_fatigue').length,
                rockSolidCount: items.filter(i => i.category === 'rock_solid').length,
                pyramidCount: items.filter(i => i.category === 'pyramid').length,
                dropSetCount: items.filter(i => i.category === 'drop_set').length
            };
        }

        function analyzeExerciseProgressionHistory(workoutLogs) {
            const logs = Array.isArray(workoutLogs) ? workoutLogs : [];
            // Reverse to process oldest -> newest
            const chronological = [...logs].reverse();
            const historyMap = new Map();

            chronological.forEach(log => {
                if (!log || !Array.isArray(log.exercises)) return;
                log.exercises.forEach(ex => {
                    if (!ex || ex.isInterSetExtra) return;
                    const canonicalEx = resolveCanonicalDbExercise(ex);
                    const mode = getExerciseMetricMode(canonicalEx);
                    if (mode === 'cardio_min') return; // Dakika bazlı kardiyolar ayrı Kardiyo Puanı motorunda hesaplanır

                    const completedSets = Array.isArray(ex.sets)
                        ? ex.sets.filter(st => st && st.completed && (Number(st.reps) > 0 || Number(st.weight) > 0))
                        : [];
                    if (completedSets.length === 0 && (!ex.completedSetsCount || ex.completedSetsCount === 0)) return;

                    const key = canonicalEx.id || canonicalEx.name || ex.id || ex.name;
                    if (!key) return;

                    const pairedBest = pickBestPairedSet(canonicalEx, completedSets);
                    const maxWeight = pairedBest
                        ? (Number(pairedBest.weight) || 0)
                        : (Number(ex.maxWeight) || 0);
                    const maxReps = pairedBest
                        ? (parseInt(pairedBest.reps, 10) || 0)
                        : (Number(ex.maxReps) || 0);
                    const e1rm = computeSetEpleyE1RM(canonicalEx, maxWeight, maxReps);
                    const totalReps = completedSets.length > 0
                        ? completedSets.reduce((s, st) => s + (Number(st.reps) || 0), 0)
                        : maxReps;
                    const avgReps = completedSets.length > 0
                        ? Math.round((totalReps / completedSets.length) * 10) / 10
                        : maxReps;
                    const volume = Number(ex.exerciseVolume) || 0;

                    if (!historyMap.has(key)) {
                        historyMap.set(key, {
                            key,
                            id: canonicalEx.id || ex.id || '',
                            name: canonicalEx.name || ex.name,
                            isBodyweight: isExerciseBodyweight(canonicalEx),
                            isTimeBased: mode === 'time_sec',
                            entries: []
                        });
                    }

                    historyMap.get(key).entries.push({
                        date: log.date || '',
                        dateFormatted: log.dateFormatted || log.date || '',
                        setsCount: completedSets.length || ex.completedSetsCount || 1,
                        maxWeight,
                        maxReps,
                        e1rm,
                        totalReps,
                        avgReps,
                        volume
                    });
                });
            });

            const results = [];
            historyMap.forEach(item => {
                const entries = item.entries;
                const count = entries.length;
                const first = entries[0];
                const latest = entries[count - 1];
                const unit = item.isTimeBased ? 'sn' : 'tekrar';

                const peak = entries.reduce((best, cur) => {
                    if (cur.e1rm > best.e1rm) return cur;
                    if (cur.e1rm === best.e1rm && cur.maxWeight > best.maxWeight) return cur;
                    if (cur.e1rm === best.e1rm && cur.maxWeight === best.maxWeight && cur.maxReps >= best.maxReps) return cur;
                    return best;
                }, entries[0]);

                const formatPerf = (snap) => {
                    if (item.isBodyweight) {
                        return snap.maxWeight > 0
                            ? `BW(+${snap.maxWeight} kg) × ${snap.maxReps} ${unit}`
                            : `${snap.maxReps} ${unit} (${snap.setsCount} set, toplam ${snap.totalReps} ${unit})`;
                    }
                    if (snap.maxWeight > 0) {
                        return `${snap.maxWeight} kg × ${snap.maxReps} ${unit}`;
                    }
                    return `${snap.maxReps} ${unit} (${snap.setsCount} set, toplam ${snap.totalReps} ${unit})`;
                };

                const hasAddedLoadLatest = latest.maxWeight > 0;
                const isPureBwOrTimeLatest = (item.isBodyweight || item.isTimeBased) && !hasAddedLoadLatest;
                const hasHigherPeak = count >= 2
                    && (peak.e1rm > latest.e1rm + 0.05)
                    && (peak.maxWeight > latest.maxWeight || (peak.maxWeight === latest.maxWeight && peak.maxReps > latest.maxReps));

                let twoSessionFatigue = false;
                if (count >= 3) {
                    const prev = entries[count - 2];
                    const prev2 = entries[count - 3];
                    if (hasHigherPeak
                        && prev.e1rm < peak.e1rm - 0.5
                        && latest.e1rm < peak.e1rm - 0.5
                        && latest.e1rm <= prev.e1rm + 0.25
                        && prev.e1rm < prev2.e1rm + 0.01) {
                        twoSessionFatigue = true;
                    }
                }

                let status = 'baseline';
                let badgeText = '🌱 İlk Kayıt Alındı';
                let badgeStyle = 'background:#F1F5F9; color:#334155; border:1px solid #CBD5E1;';
                let changeHeadline = 'Başlangıç seviyen kaydedildi';
                let coachNote = isPureBwOrTimeLatest
                    ? `Bir sonraki antrenmanda <strong>${item.isTimeBased ? `${latest.maxReps + 5} sn` : `${latest.maxReps + 1} ${unit}`}</strong> hedefleyerek ilk gelişim adımını at!`
                    : `Bir sonraki antrenmanda <strong>${latest.maxWeight > 0 ? `${latest.maxWeight} kg ile ${latest.maxReps + 1} ${unit}` : `${latest.maxReps + 1} ${unit}`}</strong> hedefleyerek ilk gelişim adımını at!`;
                let sortOrder = 3;

                if (count >= 2) {
                    const weightDiff = Math.round((latest.maxWeight - first.maxWeight) * 10) / 10;
                    const maxRepsDiff = latest.maxReps - first.maxReps;
                    const totalRepsDiff = latest.totalReps - first.totalReps;
                    const e1rmDiff = Math.round((latest.e1rm - first.e1rm) * 100) / 100;
                    const volDiffPct = first.volume > 0 ? Math.round(((latest.volume - first.volume) / first.volume) * 100) : 0;

                    if (twoSessionFatigue) {
                        status = 'dip';
                        sortOrder = 2;
                        badgeText = `⚠️ 2 Seansta Belirgin Yorgunluk`;
                        badgeStyle = 'background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;';
                        changeHeadline = `Zirve rekorun (${formatPerf(peak)}) sonrası son 2 antrenmandır üst üste performans düşüşü var`;
                        coachNote = `Kasların ve sinir sistemin toparlanmaya ihtiyaç duyuyor olabilir. Bir sonraki seansta hafifleme (deload) yap veya uyku/beslenmeni gözden geçirip <strong>${formatPerf(peak)}</strong> zirvene dön.`;
                    } else if (hasHigherPeak && peak.e1rm > latest.e1rm * 1.03 && e1rmDiff <= 0) {
                        status = 'dip';
                        sortOrder = 2;
                        badgeText = `🔄 Geçici Dalgalanma`;
                        badgeStyle = 'background:#FFF7ED; color:#C2410C; border:1px solid #FDBA74;';
                        changeHeadline = `Zirve rekorun ${formatPerf(peak)}; son seansta (${formatPerf(latest)}) geçici bir düşüş oldu`;
                        coachNote = `Tek günlük dalgalanma normaldir (yorgunluk veya sıralama farkı). Gelecek seansta zirven olan <strong>${formatPerf(peak)}</strong> seviyesini hedefle.`;
                    } else if (hasHigherPeak && e1rmDiff > 0 && latest.e1rm < peak.e1rm * 0.92) {
                        status = 'dip';
                        sortOrder = 2;
                        badgeText = `🔄 Zirve Altında Tek Günlük Düşüş`;
                        badgeStyle = 'background:#FFF7ED; color:#C2410C; border:1px solid #FDBA74;';
                        changeHeadline = `Başlangıcın önündesin ama zirven olan ${formatPerf(peak)} altında kaldın`;
                        coachNote = `Bir sonraki antrenmanda tempoyu koruyup tekrar zirven olan <strong>${formatPerf(peak)}</strong> seviyesine odaklan.`;
                    } else if (weightDiff > 0 && e1rmDiff >= 0) {
                        status = 'progressed';
                        sortOrder = 1;
                        badgeText = `🚀 +${weightDiff} kg Güç Artışı`;
                        badgeStyle = 'background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;';
                        changeHeadline = `Ağırlık ${first.maxWeight} kg'dan ${latest.maxWeight} kg'a (${formatPerf(latest)}) yükseldi!`;
                        coachNote = `Harika ilerleme! Bu yeni yükte (${latest.maxWeight} kg) tüm çalışma setlerinde hedef tekrarını sağlamlaştır.`;
                    } else if ((weightDiff === 0 && (maxRepsDiff > 0 || totalRepsDiff >= 2)) || (e1rmDiff > 0 && weightDiff >= 0)) {
                        status = 'progressed';
                        sortOrder = 1;
                        const gainStr = maxRepsDiff > 0 ? `+${maxRepsDiff} ${unit}` : (e1rmDiff > 0 ? `+${Math.round(((latest.e1rm - first.e1rm) / Math.max(1, first.e1rm)) * 100)}% Güç` : `Toplam +${totalRepsDiff} ${unit}`);
                        badgeText = `🚀 ${gainStr} Gelişim`;
                        badgeStyle = 'background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;';
                        changeHeadline = maxRepsDiff > 0
                            ? `En iyi setin ${first.maxReps} ${unit} ➔ ${latest.maxReps} ${unit} seviyesine çıktı!`
                            : `Performansın ${formatPerf(first)} ➔ ${formatPerf(latest)} seviyesine yükseldi!`;
                        coachNote = isPureBwOrTimeLatest
                            ? `Dayanıklılığın net biçimde artıyor. Sonraki seansta her sette ${item.isTimeBased ? '+5 sn süre' : '+1-2 tekrar'} eklemeye devam et.`
                            : `Kas dayanıklılığın ve gücün artıyor. Tüm setlerde 12 ${unit} barajını geçtiğinde ağırlığı +1 ile +2.5 kg artırabilirsin.`;
                    } else if (volDiffPct >= 8) {
                        status = 'progressed';
                        sortOrder = 1;
                        badgeText = `🚀 +%${volDiffPct} Kapasite Artışı`;
                        badgeStyle = 'background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;';
                        changeHeadline = `Toplam çalışma hacmin %${volDiffPct} büyüdü!`;
                        coachNote = `Hareket üzerindeki kontrolün ve iş kapasiten net biçimde yukarı gidiyor.`;
                    } else if (weightDiff === 0 && maxRepsDiff === 0 && totalRepsDiff === 0) {
                        status = 'plateau';
                        sortOrder = 2;
                        badgeText = `⏸️ ${count} Seanstır Sabit`;
                        badgeStyle = 'background:#FEF3C7; color:#B45309; border:1px solid #FCD34D;';
                        changeHeadline = `${count} antrenmandır aynı seviyedesin (${formatPerf(latest)})`;
                        coachNote = `Bu takılmayı kırmak için gelecek antrenmanda sadece <strong>1. sette ${item.isTimeBased ? '+5 sn' : '+1 ' + unit}</strong> artırmayı dene!`;
                    } else {
                        status = 'dip';
                        sortOrder = 2;
                        badgeText = `🔄 Geçici Dalgalanma`;
                        badgeStyle = 'background:#FFF7ED; color:#C2410C; border:1px solid #FDBA74;';
                        changeHeadline = `${hasHigherPeak ? `Zirve rekorun ${formatPerf(peak)}; son` : `İlk kayda göre son`} seansta hafif düşüş var (${formatPerf(latest)})`;
                        coachNote = `Tek günlük yorgunluk veya antrenman sırası kaynaklı olabilir. Gelecek seansta <strong>${formatPerf(peak)}</strong> seviyesini hedefle.`;
                    }
                }

                results.push({
                    key: item.key,
                    id: item.id,
                    name: item.name,
                    sessionsCount: count,
                    firstWeight: first.maxWeight,
                    firstReps: first.maxReps,
                    latestWeight: latest.maxWeight,
                    latestReps: latest.maxReps,
                    peakWeight: peak.maxWeight,
                    peakReps: peak.maxReps,
                    firstPerfText: formatPerf(first),
                    latestPerfText: formatPerf(latest),
                    peakPerfText: formatPerf(peak),
                    firstDate: first.dateFormatted,
                    latestDate: latest.dateFormatted,
                    peakDate: peak.dateFormatted,
                    hasHigherPeak,
                    twoSessionFatigue,
                    status,
                    badgeText,
                    badgeStyle,
                    changeHeadline,
                    coachNote,
                    sortOrder
                });
            });

            results.sort((a, b) => a.sortOrder - b.sortOrder || b.sessionsCount - a.sessionsCount);

            return {
                items: results,
                progressedCount: results.filter(r => r.status === 'progressed').length,
                plateauCount: results.filter(r => r.status === 'plateau' || r.status === 'dip').length,
                baselineCount: results.filter(r => r.status === 'baseline').length,
                twoSessionFatigueCount: results.filter(r => r.twoSessionFatigue).length
            };
        }

        function renderCombinedCoachReport(container) {
            const workoutLogs = getWorkoutLogs();
            const scaleLogs = getScaleLogs();
            const measLogs = getMeasurementsLogs();

            const totalVolume = workoutLogs.reduce((sum, l) => sum + (l.totalVolumeKg || 0), 0);
            const totalSets = workoutLogs.reduce((sum, l) => sum + (l.totalSetsCompleted || 0), 0);

            const hasScale = scaleLogs.length > 0;
            const hasMeas = measLogs.length > 0;

            const latestScale = hasScale ? scaleLogs[0] : null;
            const earliestScale = hasScale ? scaleLogs[scaleLogs.length - 1] : null;
            const deltaWeight = (hasScale && scaleLogs.length > 1) ? (latestScale.weight - earliestScale.weight).toFixed(1) : null;
            const deltaFat = (hasScale && scaleLogs.length > 1 && latestScale.bodyFat && earliestScale.bodyFat) ? (latestScale.bodyFat - earliestScale.bodyFat).toFixed(1) : null;

            const latestMeas = hasMeas ? measLogs[0] : null;
            const earliestMeas = hasMeas ? measLogs[measLogs.length - 1] : null;
            const deltaWaist = (hasMeas && measLogs.length > 1 && latestMeas.waist && earliestMeas.waist) ? (latestMeas.waist - earliestMeas.waist).toFixed(1) : null;

            // 1. Analyze set-to-set fatigue & power drop-off
            const fatigueData = analyzeIntraSessionFatigueAndDropOff(workoutLogs);
            // 2. Analyze cross-session exercise progression
            const progData = analyzeExerciseProgressionHistory(workoutLogs);
            // 3. Weekly muscle & mobility data for actionable blind spots
            let muscleReport = null;
            let mobilityReport = null;
            try {
                if (typeof calculateWeeklyMuscleSufficiency === 'function') {
                    muscleReport = calculateWeeklyMuscleSufficiency('week_projected', 0);
                }
            } catch (e) { console.error(e); }
            try {
                if (typeof calculateWeeklyMobilitySufficiency === 'function') {
                    mobilityReport = calculateWeeklyMobilitySufficiency('week_projected', 0);
                }
            } catch (e) { console.error(e); }

            // Build dynamic, everyday-Turkish coach summary bullets
            const summaryBullets = [];
            if (workoutLogs.length === 0) {
                summaryBullets.push(`📌 <strong>Başlangıç Adımı:</strong> Henüz tamamlanmış bir antrenman kaydın yok. İlk antrenmanını bitirdiğinde hangi harekette güçlendiğin ve setler arasında gücünün nasıl değiştiği burada otomatik analiz edilecek.`);
            } else {
                if (progData.progressedCount > 0) {
                    summaryBullets.push(`🚀 <strong>Güç Gelişimin:</strong> Kayıtlı ${progData.items.length} hareketinin <strong>${progData.progressedCount} tanesinde</strong> başladığın güne göre ağırlık veya tekrar sayını artırdın.${progData.plateauCount > 0 ? ` <strong>${progData.plateauCount} harekette</strong> ise aynı seviyede takılma var; aşağıdaki listede bunları nasıl aşacağını yazdım.` : ''}`);
                } else if (progData.plateauCount > 0) {
                    summaryBullets.push(`⏸️ <strong>Güç Gelişimin:</strong> Hareketlerinde son antrenmanlarda aynı kilo ve tekrar sayılarında kalmışsın. Gelişimi tekrar başlatmak için bir sonraki antrenmanda sadece ilk setlere <strong>+1 tekrar</strong> eklemeye odaklanacağız.`);
                } else {
                    summaryBullets.push(`🌱 <strong>Güç Gelişimin:</strong> Hareketlerinin ilk başlangıç kayıtları alındı (${workoutLogs.length} antrenman / ${totalSets} set). Aynı hareketleri 2. kez yaptığında ne kadar güçlendiğini karşılaştırmalı göreceksin.`);
                }

                if (fatigueData.items.length > 0) {
                    if (fatigueData.earlyDropCount > 0) {
                        summaryBullets.push(`🔋 <strong>Set İçi Dayanıklılığın (%${fatigueData.avgRetention}):</strong> Bazı hareketlerde 1. sette yüksek tekrarla başlayıp (örn. 12 tekrar) sonraki setlerde 9-10 tekrara düşüyorsun (<strong>${fatigueData.earlyDropCount} harekette hızlı düşüş</strong>, <strong>${fatigueData.normalFatigueCount} harekette doğal yorgunluk</strong>). Aşağıda hareket bazında nedenini ve çözümünü inceleyebilirsin.`);
                    } else {
                        summaryBullets.push(`🔋 <strong>Set İçi Dayanıklılığın (%${fatigueData.avgRetention}):</strong> Setler arasında gücünü çok iyi koruyorsun! 1-2 tekrarlık ufak düşüşler kasın doğru ağırlıkta çalıştığını gösterir.`);
                    }
                }
            }

            if (deltaWaist !== null && parseFloat(deltaWaist) < 0) {
                summaryBullets.push(`📏 <strong>Vücut Değişimin:</strong> Bel çevren <strong>${Math.abs(deltaWaist)} cm inceldi</strong>${deltaWeight !== null && parseFloat(deltaWeight) >= 0 ? ` (tartıda kilon sabit/artmış olsa bile belin incelmesi yağ yakıp kas kazandığının en net kanıtıdır!)` : ''}.`);
            } else if (deltaWeight !== null) {
                summaryBullets.push(`⚖️ <strong>Tartı & Ölçü Takibin:</strong> İlk kaydından bu yana kilon <strong>${parseFloat(deltaWeight) > 0 ? '+' : ''}${deltaWeight} kg</strong> değişti. Gerçek yağ yakımını görmek için haftada bir bel ölçümü eklemeyi unutma.`);
            }

            window._lastCoachSummaryBullets = summaryBullets;
            window._lastCoachFatigueItems = fatigueData.items;
            window._lastCoachProgItems = progData.items;

            // Prepare fatigue cards (compact row + circular 'i' modal button)
            const renderFatigueCard = (item, idx) => `
                <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="min-width:0; flex:1;">
                            <div style="font-size:13px; font-weight:900; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.name)}</div>
                            <div style="font-size:10.5px; color:#64748B;">${escapeHTML(item.dateFormatted)} • ${item.setsCount} Set</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                            <span style="font-size:10.5px; font-weight:800; padding:3px 8px; border-radius:999px; white-space:nowrap; ${item.badgeStyle}">
                                ${escapeHTML(item.badgeText)}
                            </span>
                            <button type="button" class="wk-ex-i-btn" onclick="openCoachItemDetailModal('fatigue', ${idx})" title="Neden & Koç Tavsiyesi">i</button>
                        </div>
                    </div>

                    <div style="background:#FFFFFF; border:1px solid #CBD5E1; border-radius:8px; padding:6px 10px; font-size:11.5px; color:#0F172A;">
                        ${item.setChainText}
                    </div>
                </div>
            `;

            const visibleFatigue = fatigueData.items.slice(0, 4);
            const hiddenFatigue = fatigueData.items.slice(4);

            // Prepare progression cards (compact row + circular 'i' modal button)
            const renderProgressionCard = (item, idx) => `
                <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="min-width:0; flex:1;">
                            <div style="font-size:13px; font-weight:900; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(item.name)}</div>
                            <div style="font-size:10.5px; color:#64748B;">${item.sessionsCount} Antrenman</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                            <span style="font-size:10.5px; font-weight:800; padding:3px 8px; border-radius:999px; white-space:nowrap; ${item.badgeStyle}">
                                ${escapeHTML(item.badgeText)}
                            </span>
                            <button type="button" class="wk-ex-i-btn" onclick="openCoachItemDetailModal('prog', ${idx})" title="Gelişim Notu">i</button>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:6px; background:#FFFFFF; border:1px solid #CBD5E1; border-radius:8px; padding:6px 10px;">
                        <div>
                            <div style="font-size:9.5px; font-weight:800; color:#64748B;">BAŞLANGIÇ</div>
                            <div style="font-size:11.5px; font-weight:800; color:#475569; margin-top:1px;">${escapeHTML(item.firstPerfText)}</div>
                        </div>
                        <div style="font-size:14px; font-weight:900; color:#84CC16;">➔</div>
                        <div style="text-align:right;">
                            <div style="font-size:9.5px; font-weight:800; color:#15803D;">SON DURUM</div>
                            <div style="font-size:12px; font-weight:900; color:#0F172A; margin-top:1px;">${escapeHTML(item.latestPerfText)}</div>
                        </div>
                    </div>
                    ${item.hasHigherPeak ? `
                        <div style="margin-top:5px; display:flex; justify-content:space-between; align-items:center; gap:6px; background:#FFFBEB; border:1px solid #FDE68A; border-radius:7px; padding:4px 8px; font-size:10.5px;">
                            <span style="font-weight:800; color:#B45309;">🏆 Zirve Rekor</span>
                            <span style="font-weight:900; color:#0F172A;">${escapeHTML(item.peakPerfText)}</span>
                        </div>
                    ` : ''}
                </div>
            `;

            const visibleProg = progData.items.slice(0, 4);
            const hiddenProg = progData.items.slice(4);

            // Build 3 Concrete Weekly Coach Tasks
            const tasksHTML = [];

            // Task 1: Missing Muscle Group
            if (muscleReport && Array.isArray(muscleReport.muscles)) {
                const missingMuscle = muscleReport.muscles.find(m => m.effectiveTotal === 0) || muscleReport.muscles.find(m => m.status === 'insufficient');
                if (missingMuscle) {
                    const recEx = (typeof getRecommendationsForMuscle === 'function')
                        ? (getRecommendationsForMuscle(missingMuscle.id, 1)[0] || null)
                        : null;
                    tasksHTML.push(`
                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
                            <div>
                                <div style="font-size:10px; font-weight:800; color:#DC2626; text-transform:uppercase;">1. Eksik Kas</div>
                                <div style="font-size:13px; font-weight:900; color:#0F172A; margin-top:2px;">${escapeHTML(missingMuscle.icon || '💪')} ${escapeHTML(missingMuscle.name)} (${missingMuscle.effectiveTotal === 0 ? '0 Set' : `${missingMuscle.effectiveTotal} Set`})</div>
                            </div>
                            ${recEx ? `
                                <button type="button" class="btn btn-outline" style="width:100%; font-size:11.5px; padding:7px 10px; font-weight:800; background:#FFFFFF; border-color:#CBD5E1; color:#0F172A;" onclick="openQuickAddToDayModal('${recEx.id}')">
                                    ➕ ${escapeHTML(recEx.name)} Ekle
                                </button>
                            ` : ''}
                        </div>
                    `);
                }
            }

            // Task 2: Stiff / Unworked Mobility Joint
            if (mobilityReport && Array.isArray(mobilityReport.joints)) {
                const stiffJoint = mobilityReport.joints.find(j => j.effectiveDone === 0 && j.plannedSets === 0)
                    || mobilityReport.joints.find(j => j.status !== 'optimal');
                const jointCols = stiffJoint ? (stiffJoint.columns || stiffJoint.subRegions || []) : [];
                if (stiffJoint && jointCols.length > 0) {
                    const targetSub = jointCols.find(s => (s.doneSets || 0) === 0 && (s.planSets || 0) === 0)
                        || jointCols.find(s => (s.doneSets || 0) === 0)
                        || jointCols[0];
                    tasksHTML.push(`
                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
                            <div>
                                <div style="font-size:10px; font-weight:800; color:#0284C7; text-transform:uppercase;">2. Eklem Açıklığı</div>
                                <div style="font-size:13px; font-weight:900; color:#0F172A; margin-top:2px;">${escapeHTML(stiffJoint.name || stiffJoint.title || '')} • ${escapeHTML(targetSub.label)}</div>
                            </div>
                            <button type="button" class="btn btn-outline" style="width:100%; font-size:11.5px; padding:7px 10px; font-weight:800; background:#FFFFFF; border-color:#CBD5E1; color:#0F172A;" onclick="openQuickAddToDayModal('${targetSub.recId}')">
                                ➕ ${escapeHTML(targetSub.recName)} Ekle
                            </button>
                        </div>
                    `);
                }
            }

            // Task 3: Next Workout Rep/Weight Goal
            const focusFatigue = fatigueData.items[0] || null;
            const focusProg = progData.items.find(i => i.status === 'plateau') || progData.items[0] || null;
            if (focusFatigue && focusFatigue.category === 'early_drop') {
                tasksHTML.push(`
                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
                        <div>
                            <div style="font-size:10px; font-weight:800; color:#B45309; text-transform:uppercase;">3. Set Dengesi</div>
                            <div style="font-size:13px; font-weight:900; color:#0F172A; margin-top:2px;">${escapeHTML(focusFatigue.name)} (${focusFatigue.firstReps}➔${focusFatigue.lastReps})</div>
                        </div>
                        <div style="font-size:11px; font-weight:800; color:#15803D; background:#DCFCE7; padding:6px 8px; border-radius:7px; text-align:center;">
                            🎯 İlk Set: ${Math.max(1, focusFatigue.firstReps - 1)} ${focusFatigue.unitLabel} • +30sn Dinlen
                        </div>
                    </div>
                `);
            } else if (focusProg) {
                tasksHTML.push(`
                    <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
                        <div>
                            <div style="font-size:10px; font-weight:800; color:#15803D; text-transform:uppercase;">3. Güç Hedefi</div>
                            <div style="font-size:13px; font-weight:900; color:#0F172A; margin-top:2px;">${escapeHTML(focusProg.name)} (${escapeHTML(focusProg.latestPerfText)})</div>
                        </div>
                        <div style="font-size:11px; font-weight:800; color:#15803D; background:#DCFCE7; padding:6px 8px; border-radius:7px; text-align:center;">
                            🎯 İlk Sette +1 Tekrar Ekle
                        </div>
                    </div>
                `);
            }

            container.innerHTML = `
                <!-- BÖLÜM 1: TEK BAKIŞTA GENEL DURUMUN & KOÇUN ÖZETİ -->
                <div class="anatomy-hero-wrapper" style="align-items:stretch; padding:12px 14px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
                        <h3 style="font-size:15px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">🧠 Koç Raporu & Karne</h3>
                        <button type="button" class="wk-ex-i-btn" onclick="openCoachItemDetailModal('summary')" title="Koç Özeti">i</button>
                    </div>

                    <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px;">
                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:9px 10px; border-radius:9px;">
                            <div style="font-size:10px; color:#64748B; font-weight:800;">GEÇMİŞ</div>
                            <div style="font-size:16px; font-weight:900; color:#0F172A; margin-top:2px;">${workoutLogs.length} Seans</div>
                            <div style="font-size:10.5px; color:#475569; margin-top:1px;">${totalSets} Set • ${Math.round(totalVolume).toLocaleString('tr-TR')} kg</div>
                        </div>

                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:9px 10px; border-radius:9px;">
                            <div style="font-size:10px; color:#64748B; font-weight:800;">GÜÇLENEN</div>
                            <div style="font-size:16px; font-weight:900; color:#16A34A; margin-top:2px;">
                                ${progData.progressedCount} / ${progData.items.length} Hareket
                            </div>
                            <div style="font-size:10.5px; color:#475569; margin-top:1px;">
                                ${progData.plateauCount > 0 ? `${progData.plateauCount} sabit` : 'Artışta'}
                            </div>
                        </div>

                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:9px 10px; border-radius:9px;">
                            <div style="font-size:10px; color:#64748B; font-weight:800;">SET DAYANIKLILIĞI</div>
                            <div style="font-size:16px; font-weight:900; color:#0284C7; margin-top:2px;">%${fatigueData.avgRetention} Koruma</div>
                            <div style="font-size:10.5px; color:#475569; margin-top:1px;">
                                ${fatigueData.earlyDropCount > 0 ? `${fatigueData.earlyDropCount} hızlı düşüş` : 'Dengeli'}
                            </div>
                        </div>

                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:9px 10px; border-radius:9px;">
                            <div style="font-size:10px; color:#64748B; font-weight:800;">KİLO & BEL</div>
                            <div style="font-size:16px; font-weight:900; color:#0F172A; margin-top:2px;">
                                ${deltaWeight !== null ? `${parseFloat(deltaWeight) > 0 ? '+' : ''}${deltaWeight} kg` : (latestScale ? `${latestScale.weight} kg` : '-')}
                            </div>
                            <div style="font-size:10.5px; color:#475569; margin-top:1px;">
                                ${deltaWaist !== null ? `Bel: ${parseFloat(deltaWaist) > 0 ? '+' : ''}${deltaWaist} cm` : (latestMeas?.waist ? `Bel: ${latestMeas.waist} cm` : 'Ölçü yok')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BÖLÜM 2: SETLER ARASI GÜÇ DÜŞÜŞÜ -->
                <div class="anatomy-hero-wrapper" style="align-items:stretch; padding:12px 14px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">🔋 Set Dayanıklılığı</h3>
                            <button type="button" class="wk-ex-i-btn" onclick="openCoachItemDetailModal('fatigue_rule')" title="Altın Kural">i</button>
                        </div>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                            <span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#FEF2F2; color:#DC2626; border:1px solid #FECACA;">⚡ Düşüş: ${fatigueData.earlyDropCount}</span>
                            <span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#F0F9FF; color:#0369A1; border:1px solid #BAE6FD;">🔋 Doğal: ${fatigueData.normalFatigueCount}</span>
                            <span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;">🛡️ Tam: ${fatigueData.rockSolidCount}</span>
                            ${fatigueData.pyramidCount > 0 ? `<span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#EEF2FF; color:#4338CA; border:1px solid #C7D2FE;">📈 Piramit: ${fatigueData.pyramidCount}</span>` : ''}
                            ${fatigueData.dropSetCount > 0 ? `<span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#FFFBEB; color:#B45309; border:1px solid #FDE68A;">🔻 İnişli: ${fatigueData.dropSetCount}</span>` : ''}
                        </div>
                    </div>

                    ${fatigueData.items.length === 0 ? `
                        <div style="background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:8px; padding:12px; text-align:center; font-size:12px; color:#475569;">
                            En az 2 seti tamamlanmış hareket kaydı yok.
                        </div>
                    ` : `
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:8px;">
                            ${visibleFatigue.map((it, idx) => renderFatigueCard(it, idx)).join('')}
                        </div>
                        ${hiddenFatigue.length > 0 ? `
                            <div id="coachFatigueMoreBox" style="display:none; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:8px; margin-top:8px;">
                                ${hiddenFatigue.map((it, idx) => renderFatigueCard(it, idx + 4)).join('')}
                            </div>
                            <button id="coachFatigueMoreBtn" type="button" class="btn btn-outline" style="margin-top:8px; width:100%; font-size:11.5px; font-weight:800; padding:7px; background:#F8FAFC; color:#0F172A; border-color:#CBD5E1;" onclick="toggleCoachReportAccordion('coachFatigueMoreBox', 'coachFatigueMoreBtn', '▼ Diğer ${hiddenFatigue.length} Hareketi Göster', '▲ Gizle')">
                                ▼ Diğer ${hiddenFatigue.length} Hareketi Göster
                            </button>
                        ` : ''}
                    `}
                </div>

                <!-- BÖLÜM 3: HAREKETLERDE GELİŞİM -->
                <div class="anatomy-hero-wrapper" style="align-items:stretch; padding:12px 14px; margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                        <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin:0; white-space:nowrap;">📈 Güç Gelişimi</h3>
                        <div style="display:flex; gap:4px; flex-wrap:wrap;">
                            <span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;">🚀 Artan: ${progData.progressedCount}</span>
                            <span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#FEF3C7; color:#B45309; border:1px solid #FCD34D;">⏸️ Sabit: ${progData.plateauCount}</span>
                            <span style="font-size:10.5px; font-weight:800; padding:3px 7px; border-radius:6px; background:#F1F5F9; color:#334155; border:1px solid #CBD5E1;">🌱 Yeni: ${progData.baselineCount}</span>
                        </div>
                    </div>

                    ${progData.items.length === 0 ? `
                        <div style="background:#F8FAFC; border:1px dashed #CBD5E1; border-radius:8px; padding:12px; text-align:center; font-size:12px; color:#475569;">
                            Henüz kayıtlı hareket geçmişi yok.
                        </div>
                    ` : `
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:8px;">
                            ${visibleProg.map((it, idx) => renderProgressionCard(it, idx)).join('')}
                        </div>
                        ${hiddenProg.length > 0 ? `
                            <div id="coachProgMoreBox" style="display:none; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:8px; margin-top:8px;">
                                ${hiddenProg.map((it, idx) => renderProgressionCard(it, idx + 4)).join('')}
                            </div>
                            <button id="coachProgMoreBtn" type="button" class="btn btn-outline" style="margin-top:8px; width:100%; font-size:11.5px; font-weight:800; padding:7px; background:#F8FAFC; color:#0F172A; border-color:#CBD5E1;" onclick="toggleCoachReportAccordion('coachProgMoreBox', 'coachProgMoreBtn', '▼ Diğer ${hiddenProg.length} Hareketi Göster', '▲ Gizle')">
                                ▼ Diğer ${hiddenProg.length} Hareketi Göster
                            </button>
                        ` : ''}
                    `}
                </div>

                <!-- BÖLÜM 4: BU HAFTA İÇİN 3 NET KOÇ GÖREVİ -->
                ${tasksHTML.length > 0 ? `
                    <div class="anatomy-hero-wrapper" style="align-items:stretch; padding:12px 14px;">
                        <h3 style="font-size:14.5px; font-weight:900; color:#0F172A; margin:0 0 8px 0; white-space:nowrap;">🎯 Haftanın 3 Görevi</h3>
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px;">
                            ${tasksHTML.join('')}
                        </div>
                    </div>
                ` : ''}
            `;
        }

        function openCoachItemDetailModal(type, idx) {
            let modal = document.getElementById('analyticsQuickInfoModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'analyticsQuickInfoModal';
                modal.className = 'modal-overlay';
                modal.onclick = function(e) { if (e.target === modal) modal.classList.remove('active'); };
                document.body.appendChild(modal);
            }
            let title = 'Koç Notu';
            let bodyHtml = '';
            if (type === 'summary') {
                title = 'Koçun Sana Özel Özeti';
                const bullets = window._lastCoachSummaryBullets || [];
                bodyHtml = `<div style="display:flex; flex-direction:column; gap:8px; font-size:12.5px; color:#334155; line-height:1.5;">${bullets.map(b => `<div>${b}</div>`).join('')}</div>`;
            } else if (type === 'fatigue_rule') {
                title = 'Set Dayanıklılığı Kuralı';
                bodyHtml = `<div style="font-size:12.5px; color:#334155; line-height:1.5;">Sabit kiloda 1-2 tekrar düşüşü doğal kas yorgunluğudur; 3+ tekrar düşüşü hızlı düşüş sayılır. Kilo artıran piramit setler tahmin edilen 1RM güç artışıyla, kilo düşüren setler kontrollü drop-set olarak değerlendirilir. İzometrik süre hareketlerinde ise en az 10 sn ve %25 birlikte düşüş olmadan uyarı verilmez.</div>`;
            } else if (type === 'fatigue') {
                const it = (window._lastCoachFatigueItems || [])[idx];
                if (!it) return;
                title = escapeHTML(it.name);
                bodyHtml = `
                    <div style="display:flex; flex-direction:column; gap:8px; font-size:12.5px; color:#334155; line-height:1.5;">
                        <div><strong>🧐 Neden Oldu?</strong> ${it.reasonText}</div>
                        <div style="background:#FEFCE8; border:1px solid #FEF08A; border-radius:8px; padding:8px 10px; color:#0F172A;"><strong>💡 Koç Tavsiyesi:</strong> ${it.adviceText}</div>
                    </div>
                `;
            } else if (type === 'prog') {
                const it = (window._lastCoachProgItems || [])[idx];
                if (!it) return;
                title = escapeHTML(it.name);
                bodyHtml = `
                    <div style="display:flex; flex-direction:column; gap:8px; font-size:12.5px; color:#334155; line-height:1.5;">
                        <div><strong>📊 Durum:</strong> ${escapeHTML(it.changeHeadline)}.</div>
                        <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:8px 10px; color:#0F172A;"><strong>💡 Hedef:</strong> ${it.coachNote}</div>
                    </div>
                `;
            }
            modal.innerHTML = `
                <div class="modal-box" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; max-width:380px; width:92%; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="font-size:15px; font-weight:900; color:#0F172A;">${title}</div>
                        <button type="button" onclick="document.getElementById('analyticsQuickInfoModal').classList.remove('active')" style="width:28px; height:28px; border-radius:50%; border:1px solid #CBD5E1; background:#F8FAFC; color:#0F172A; font-weight:800; cursor:pointer;">✕</button>
                    </div>
                    ${bodyHtml}
                </div>
            `;
            modal.classList.add('active');
        }

        // ==================== HAFTALIK FİTNESS (KIRMIZI) & KARDİYO (MAVİ) PUAN MOTORU ====================
        function toIsoDateKeyLocal(dt) {
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const d = String(dt.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        function calculateWeeklyFitnessAndCardioScores(weekOffset = 0) {
            const bounds = getWeeklyMuscleBounds(weekOffset);
            const allLogs = (typeof getWorkoutLogs === 'function') ? getWorkoutLogs() : [];
            const weekLogs = allLogs.filter(l => {
                if (!l || !l.date) return false;
                const dt = new Date(l.date);
                return dt >= bounds.monday && dt <= bounds.sunday;
            });

            // ─── 1. KIRMIZI BAR: HAFTALIK FİTNESS PUANI (100 PUAN) ───
            // A) Kas Dengesi & MEV Hacim Eşikleri (45 Puan - Schoenfeld 2016 & Israetel RP)
            const muscleDoneAnalysis = calculateWeeklyMuscleSufficiency('week_done', weekOffset);
            const muscleProjAnalysis = calculateWeeklyMuscleSufficiency('week_projected', weekOffset);
            let muscleScoreDone = 0;
            let muscleScoreProjected = 0;
            const muscleBreakdown = (muscleDoneAnalysis.muscles || []).map((m, idx) => {
                const projM = (muscleProjAnalysis.muscles && muscleProjAnalysis.muscles[idx]) || m;
                const doneRatio = Math.min(1, Math.max(0, (m.effectiveDone || 0) / Math.max(1, m.optimalMin || 6)));
                const projRatio = Math.min(1, Math.max(0, (projM.effectiveTotal || 0) / Math.max(1, m.optimalMin || 6)));
                const ptsDone = Math.round(doneRatio * 4.5 * 10) / 10;
                const ptsProj = Math.round(projRatio * 4.5 * 10) / 10;
                muscleScoreDone += doneRatio * 4.5;
                muscleScoreProjected += projRatio * 4.5;
                return {
                    id: m.id,
                    name: m.name,
                    doneSets: m.effectiveDone || 0,
                    projectedSets: projM.effectiveTotal || 0,
                    targetSets: m.optimalMin || 6,
                    ptsDone,
                    ptsProj
                };
            });
            muscleScoreDone = Math.min(45, Math.round(muscleScoreDone * 10) / 10);
            muscleScoreProjected = Math.min(45, Math.round(muscleScoreProjected * 10) / 10);

            // B) Efektif Set & Süreklilik (35 Puan - Schoenfeld 2021 Doz-Yanıt: Haftalık 40 set = 35p)
            let totalStrengthSetsDone = 0;
            let compoundSetsDone = 0;
            let totalVolumeKgDone = 0;
            const strengthSessionsList = [];

            weekLogs.forEach(log => {
                if (!Array.isArray(log.exercises)) return;
                let sessionStrengthSets = 0;
                log.exercises.forEach(ex => {
                    const exId = String(ex.id || ex.exId || '');
                    const dbEx = _findCanonicalDbExerciseRaw(ex);
                    const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
                    const catNorm = _normMetricKey(ex.category || (dbEx && dbEx.category));
                    const isCardioEx = isExerciseCardioMinutes(ex) || catNorm === 'conditioning' || /^cond_/.test(exId) || (spec && spec.type === 'CONDITIONING');
                    if (isCardioEx) return;

                    const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                        ? Number(ex.completedSetsCount)
                        : (Array.isArray(ex.sets) ? ex.sets.filter(s => s && (s.completed || parseInt(s.reps, 10) > 0)).length : (Number(ex.completedSets || ex.sets) || 0));
                    if (cSets <= 0) return;

                    totalStrengthSetsDone += cSets;
                    sessionStrengthSets += cSets;

                    const isCompound = (dbEx && dbEx.mechanic === 'compound') || (spec && (spec.type === 'HEAVY_COMPOUND' || spec.type === 'BALLISTIC_POWER' || spec.type === 'BODYWEIGHT_STRENGTH'));
                    if (isCompound) compoundSetsDone += cSets;
                });
                if (sessionStrengthSets > 0) {
                    totalVolumeKgDone += Number(log.totalVolumeKg || 0);
                    strengthSessionsList.push({
                        date: log.dateFormatted || formatDateTr(log.date),
                        title: log.title || log.program || 'Kuvvet Seansı',
                        sets: sessionStrengthSets,
                        volumeKg: Math.round(Number(log.totalVolumeKg || 0))
                    });
                }
            });

            const setVolumeScoreDone = Math.min(35, Math.round((totalStrengthSetsDone / 40) * 35 * 10) / 10);

            // C) Kinetik Zincir & Bileşik Hareket Kalitesi (20 Puan - McGill 2015 & Javorek: %60+ bileşik hareket oranı = Tam puan)
            const compoundRatio = totalStrengthSetsDone > 0 ? (compoundSetsDone / totalStrengthSetsDone) : 0;
            const compoundFactor = totalStrengthSetsDone > 0 ? Math.min(1, compoundRatio / 0.60) : 0;
            // En az 12 set yapılmadan kalite puanı kademeli ölçeklenir (tek 1 bileşik set yapıp 20p alınmasın)
            const compoundGate = Math.min(1, totalStrengthSetsDone / 12);
            const compoundScoreDone = Math.min(20, Math.round(compoundFactor * compoundGate * 20 * 10) / 10);

            const fitnessScore = Math.min(100, Math.round(muscleScoreDone + setVolumeScoreDone + compoundScoreDone));

            // ─── 2. MAVİ BAR: HAFTALIK KARDİYO PUANI (100 PUAN) ───
            // A) Haftalık Adım Bazı — Her Gece 00:01 Senkronu (40 Puan - Paluch et al. 2022 Lancet: 56.000 adım = 8.000/gün)
            const wellnessMap = (window.GarminTredictChief && typeof window.GarminTredictChief.getStoredWellnessStepsMap === 'function')
                ? window.GarminTredictChief.getStoredWellnessStepsMap()
                : {};
            const todayIsoStr = toIsoDateKeyLocal(new Date());
            const dayLabelsTr = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
            const dailyStepsList = [];
            let weeklyStepsTotal = 0;

            for (let i = 0; i < 7; i++) {
                const d = new Date(bounds.monday);
                d.setDate(bounds.monday.getDate() + i);
                const isoKey = toIsoDateKeyLocal(d);
                // Her gece 00:01 kuralı: Bugünden önceki kesinleşmiş günler + varsa bugünün senkron verisi
                const entry = wellnessMap[isoKey];
                const stepsVal = entry && Number(entry.steps) > 0 ? Number(entry.steps) : 0;
                const isLocked0001 = isoKey < todayIsoStr;
                weeklyStepsTotal += stepsVal;
                dailyStepsList.push({
                    isoDate: isoKey,
                    dayLabel: `${dayLabelsTr[i]} (${d.getDate()}/${d.getMonth() + 1})`,
                    steps: stepsVal,
                    floors: entry ? Number(entry.floorsClimbed || 0) : 0,
                    restingHR: entry ? entry.restingHR : null,
                    isLocked0001,
                    isFuture: isoKey > todayIsoStr
                });
            }

            const stepsTargetWeekly = 56000;
            const stepsScore = Math.min(40, Math.round((weeklyStepsTotal / stepsTargetWeekly) * 40 * 10) / 10);

            // B) Antrenmanlardaki Kardiyo Durumu & Nabız Çarpanı (45 Puan - WHO 2020 150 Eşdeğer Dk & Karvonen/TRIMP)
            const cardioSessionsMap = new Map();
            const activeCardioDaysSet = new Set();

            // 1. Geçmiş kayıtlarındaki kardiyo/kondisyon hareketleri ve seansları
            weekLogs.forEach(log => {
                if (!log) return;
                const logDateIso = toIsoDateKeyLocal(new Date(log.date));
                const logHrAvg = Number(log.healthSummary?.heartrateAvg || 0);
                const logHrMax = Number(log.healthSummary?.heartrateMax || 0);

                if (Array.isArray(log.exercises)) {
                    log.exercises.forEach(ex => {
                        const exId = String(ex.id || ex.exId || '');
                        const dbEx = _findCanonicalDbExerciseRaw(ex);
                        const spec = resolveExerciseBiomechanics(ex.name, ex.muscle, ex.category);
                        const catNorm = _normMetricKey(ex.category || (dbEx && dbEx.category));
                        const isCardioMinEx = isExerciseCardioMinutes(ex);
                        const isCardioEx = isCardioMinEx || catNorm === 'conditioning' || /^cond_/.test(exId) || (spec && (spec.type === 'CONDITIONING' || spec.type === 'BALLISTIC_POWER'));
                        if (!isCardioEx) return;

                        const cSets = (ex.completedSetsCount !== undefined && ex.completedSetsCount !== null)
                            ? Number(ex.completedSetsCount)
                            : (Array.isArray(ex.sets) ? ex.sets.filter(s => s && (s.completed || parseInt(s.reps, 10) > 0)).length : (Number(ex.completedSets || ex.sets) || 1));
                        if (cSets <= 0) return;

                        const loggedCardioMins = isCardioMinEx
                            ? (Array.isArray(ex.sets) && ex.sets.length > 0
                                ? ex.sets.reduce((sum, st) => sum + (st && st.completed ? (parseFloat(st.reps) || 0) : 0), 0)
                                : 0)
                            : 0;
                        const explicitDurMin = Number(ex.durationMinutes || ex.minutes || 0);
                        const tutSec = Number(ex.healthTelemetry?.totalTimeUnderTensionSec || ex.healthTelemetry?.timeUnderTensionSec || 0);
                        let rawMin = 0;
                        if (loggedCardioMins > 0) {
                            rawMin = loggedCardioMins;
                        } else if (explicitDurMin > 0) {
                            rawMin = explicitDurMin;
                        } else if (tutSec >= 60) {
                            rawMin = Math.round(tutSec / 60);
                        } else if (isCardioMinEx) {
                            const repNum = parseInt(String(ex.maxReps || ex.reps || ex.targetReps || '15').replace(/[^\d]/g, ''), 10) || 15;
                            rawMin = repNum >= 5 ? repNum : cSets * 8;
                        } else {
                            // Balistik/kondisyon hareketleri (KB Swing, Burpee, Sled vb.): Her set aktif + metabolik toparlanma etkisi ~2 dk
                            rawMin = Math.max(2, cSets * 2);
                        }

                        const hrAvg = Number(ex.healthTelemetry?.avgHeartrate || ex.healthTelemetry?.heartrateAvg || logHrAvg || 128);
                        const hrMax = Number(ex.healthTelemetry?.maxHeartrate || logHrMax || 148);
                        const mult = hrAvg >= 145 ? 2.0 : (hrAvg >= 125 ? 1.5 : 1.0);
                        const zoneLabel = hrAvg >= 145 ? 'Zone 4+ (2.0x)' : (hrAvg >= 125 ? 'Zone 3 (1.5x)' : 'Zone 1-2 (1.0x)');
                        const eqMin = Math.round(rawMin * mult * 10) / 10;

                        const key = `${log.garminActivityId || log.id}_${exId || ex.name}`;
                        if (!cardioSessionsMap.has(key)) {
                            cardioSessionsMap.set(key, {
                                date: log.dateFormatted || formatDateTr(log.date),
                                isoDate: logDateIso,
                                name: ex.name || 'Kardiyo Egzersizi',
                                rawMin,
                                avgHr: hrAvg,
                                maxHr: hrMax,
                                multiplier: mult,
                                zoneLabel,
                                eqMin,
                                distanceMeters: ex.healthTelemetry?.distanceMeters || null,
                                cadenceSpm: ex.healthTelemetry?.cadenceSpm || null,
                                powerWatts: ex.healthTelemetry?.powerWatts || null
                            });
                            activeCardioDaysSet.add(logDateIso);
                        }
                    });
                }
            });

            // 2. Doğrudan Garmin/Tredict telemetrisindeki kardiyo aktiviteleri (yalnızca Garmin sahibi aktif kullanıcı için)
            try {
                const rawGarminActs = (window.GarminTredictChief && typeof window.GarminTredictChief.getStoredActivities === 'function')
                    ? window.GarminTredictChief.getStoredActivities()
                    : [];
                if (Array.isArray(rawGarminActs)) {
                    rawGarminActs.forEach(act => {
                        if (!act || !act.date) return;
                        const dt = new Date(act.date);
                        if (dt < bounds.monday || dt > bounds.sunday) return;
                        const sub = String(act.subSportType || '').toLowerCase();
                        const sp = String(act.sportType || '').toLowerCase();
                        const isCardioAct = sub === 'indoor_rowing' || sub === 'rowing' || sub === 'walking' || sub === 'hiking' || sub === 'treadmill' || sp === 'running';
                        if (!isCardioAct) return;
                        const alreadyInMap = Array.from(cardioSessionsMap.keys()).some(k => k.startsWith(String(act.id) + '_'));
                        if (alreadyInMap) return;

                        const isoDate = toIsoDateKeyLocal(dt);
                        const durSec = Number(act.summary?.duration || act.summary?.durationTotal || 900);
                        const rawMin = Math.max(1, Math.round(durSec / 60));
                        const hrAvg = Number(act.summary?.heartrate || 126);
                        const hrMax = Number(act.summary?.heartrateMax || 148);
                        const mult = hrAvg >= 145 ? 2.0 : (hrAvg >= 125 ? 1.5 : 1.0);
                        const zoneLabel = hrAvg >= 145 ? 'Zone 4+ (2.0x)' : (hrAvg >= 125 ? 'Zone 3 (1.5x)' : 'Zone 1-2 (1.0x)');
                        const eqMin = Math.round(rawMin * mult * 10) / 10;

                        cardioSessionsMap.set(`${act.id}_garmin_cardio`, {
                            date: formatDateTr(act.date),
                            isoDate,
                            name: act.title || 'Garmin Kardiyo Seansı',
                            rawMin,
                            avgHr: hrAvg,
                            maxHr: hrMax,
                            multiplier: mult,
                            zoneLabel,
                            eqMin,
                            distanceMeters: act.summary?.distance ? Math.round(Number(act.summary.distance)) : null,
                            cadenceSpm: act.summary?.cadence ? Math.round(Number(act.summary.cadence)) : null,
                            powerWatts: act.summary?.power ? Math.round(Number(act.summary.power)) : null
                        });
                        activeCardioDaysSet.add(isoDate);
                    });
                }
            } catch (_) {}

            // 6000+ adım atılan günler de aktif kardiyovasküler toparlanma günü olarak frekansa katkı verir
            dailyStepsList.forEach(d => {
                if (d.steps >= 6000) activeCardioDaysSet.add(d.isoDate);
            });

            const cardioSessionsList = Array.from(cardioSessionsMap.values());
            const totalRawCardioMin = cardioSessionsList.reduce((s, c) => s + c.rawMin, 0);
            const totalEqCardioMin = Math.round(cardioSessionsList.reduce((s, c) => s + c.eqMin, 0) * 10) / 10;
            const targetEqCardioMin = 150; // WHO & ACSM 2020 Haftalık 150 Eşdeğer Dakika
            const cardioEffortScore = Math.min(45, Math.round((totalEqCardioMin / targetEqCardioMin) * 45 * 10) / 10);

            // C) Aktif Gün Dağılımı (15 Puan - Haftanın en az 3 ayrı gününe yayma: Her gün 5p, max 15p)
            const activeCardioDaysCount = activeCardioDaysSet.size;
            const cardioFreqScore = Math.min(15, activeCardioDaysCount * 5);

            const cardioScore = Math.min(100, Math.round(stepsScore + cardioEffortScore + cardioFreqScore));

            return {
                bounds,
                weekOffset,
                fitness: {
                    totalScore: fitnessScore,
                    muscleScoreDone,
                    muscleScoreProjected,
                    setVolumeScoreDone,
                    compoundScoreDone,
                    totalStrengthSetsDone,
                    compoundSetsDone,
                    compoundPct: totalStrengthSetsDone > 0 ? Math.round(compoundRatio * 100) : 0,
                    totalVolumeKgDone: Math.round(totalVolumeKgDone),
                    muscleBreakdown,
                    strengthSessionsList
                },
                cardio: {
                    totalScore: cardioScore,
                    stepsScore,
                    weeklyStepsTotal,
                    stepsTargetWeekly,
                    dailyAvgSteps: Math.round(weeklyStepsTotal / 7),
                    dailyStepsList,
                    cardioEffortScore,
                    totalRawCardioMin,
                    totalEqCardioMin,
                    targetEqCardioMin,
                    cardioSessionsList,
                    cardioFreqScore,
                    activeCardioDaysCount
                }
            };
        }

        function refreshTopFitnessCardioScoreBars() {
            const fitValEl = document.getElementById('topFitnessScoreVal');
            const fitFillEl = document.getElementById('topFitnessScoreFill');
            const carValEl = document.getElementById('topCardioScoreVal');
            const carFillEl = document.getElementById('topCardioScoreFill');
            if (!fitValEl || !fitFillEl || !carValEl || !carFillEl) return;

            try {
                const data = calculateWeeklyFitnessAndCardioScores(0);
                const fScore = data.fitness.totalScore;
                const cScore = data.cardio.totalScore;
                fitValEl.textContent = `${fScore} / 100`;
                fitFillEl.style.width = `${Math.max(0, Math.min(100, fScore))}%`;
                carValEl.textContent = `${cScore} / 100`;
                carFillEl.style.width = `${Math.max(0, Math.min(100, cScore))}%`;
            } catch (err) {
                console.error('Score bar update err:', err);
            }
        }
        window.refreshTopFitnessCardioScoreBars = refreshTopFitnessCardioScoreBars;

        window.CelikDomainEngine = {
            resolveCanonicalDbExercise,
            getExerciseMetricMode,
            isExerciseCardioMinutes,
            isExerciseTimeBased,
            isExerciseBodyweight,
            getUserActiveBodyweightKg,
            resolveDefaultExerciseSetTarget,
            computeSetEpleyE1RM,
            pickSessionTopWorkingSet,
            pickBestPairedSet,
            calculateExerciseSetVolume,
            formatSetMetricDisplay,
            formatPerformancePill,
            getLastExercisePerformance,
            getExerciseRememberedWeight,
            analyzeIntraSessionFatigueAndDropOff,
            analyzeExerciseProgressionHistory,
            calculateWeeklyFitnessAndCardioScores
        };

        function setScoreAnalyticsWeekOffset(offset) {
            currentScoreWeekOffset = Number(offset) || 0;
            renderAnalytics();
            if (window.GarminTredictChief && typeof window.GarminTredictChief.syncGarminWellnessStepsSilent === 'function') {
                window.GarminTredictChief.syncGarminWellnessStepsSilent();
            }
        }
        window.setScoreAnalyticsWeekOffset = setScoreAnalyticsWeekOffset;

        function renderFitnessCardioScoreAnalytics(container) {
            if (!container) return;
            const data = calculateWeeklyFitnessAndCardioScores(currentScoreWeekOffset);
            const f = data.fitness;
            const c = data.cardio;

            const muscleRowsHtml = f.muscleBreakdown.map(m => {
                const pct = Math.min(100, Math.round((m.doneSets / m.targetSets) * 100));
                const badgeBg = pct >= 100 ? '#DCFCE7' : (pct > 0 ? '#FEF3C7' : '#FEE2E2');
                const badgeCol = pct >= 100 ? '#15803D' : (pct > 0 ? '#B45309' : '#B91C1C');
                const cleanName = String(m.name || '').replace(/\s*\(.*?\)\s*/g, '').trim();
                return `
                    <div style="display:flex; flex-direction:column; gap:4px; padding:8px 10px; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:8px;">
                        <div style="font-size:12px; font-weight:800; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(cleanName)}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                            <span class="tabular-nums" style="font-size:11.5px; color:#475569; font-weight:700; white-space:nowrap;">${m.doneSets} / ${m.targetSets} Set</span>
                            <span class="tabular-nums" style="background:${badgeBg}; color:${badgeCol}; font-weight:900; padding:2px 7px; border-radius:6px; font-size:11px; white-space:nowrap;">+${m.ptsDone}p</span>
                        </div>
                    </div>
                `;
            }).join('');

            const stepsRowsHtml = c.dailyStepsList.map(d => {
                const pct = Math.min(100, Math.round((d.steps / 8000) * 100));
                return `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 10px; background:#FFFFFF; border:1px solid #E2E8F0; border-radius:8px; font-size:12px; gap:8px;">
                        <span style="font-weight:800; color:#0F172A; white-space:nowrap;">${escapeHTML(d.dayLabel)}</span>
                        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                            ${d.restingHR ? `<span style="font-size:11px; color:#475569; font-weight:700; white-space:nowrap;">❤️ ${d.restingHR}</span>` : ''}
                            <span class="tabular-nums" style="font-weight:900; color:${d.steps >= 8000 ? '#15803D' : '#0F172A'}; white-space:nowrap;">${d.steps.toLocaleString('tr-TR')} / 8.000 (%${pct})</span>
                        </div>
                    </div>
                `;
            }).join('');

            const cardioExRowsHtml = c.cardioSessionsList.length > 0
                ? c.cardioSessionsList.map(cs => {
                    const extraMeta = [
                        cs.distanceMeters ? `${(cs.distanceMeters / 1000).toFixed(2)} km` : '',
                        cs.cadenceSpm ? `${cs.cadenceSpm} spm` : '',
                        cs.powerWatts ? `${cs.powerWatts} W` : ''
                    ].filter(Boolean).join(' • ');
                    return `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#FFFFFF; border:1px solid #BAE6FD; border-radius:8px; font-size:12px; gap:8px; flex-wrap:wrap;">
                            <div>
                                <div style="font-weight:800; color:#0F172A;">🚣🏃 ${escapeHTML(cs.name)} <span style="font-size:11px; color:#475569; font-weight:600;">(${escapeHTML(cs.date)})</span></div>
                                <div style="font-size:11px; color:#0369A1; font-weight:700; margin-top:2px;">
                                    ❤️ Ort. ${cs.avgHr} bpm (Zirve ${cs.maxHr}) • ${escapeHTML(cs.zoneLabel)}${extraMeta ? ` • ${escapeHTML(extraMeta)}` : ''}
                                </div>
                            </div>
                            <div style="text-align:right;">
                                <div class="tabular-nums" style="font-weight:900; color:#0369A1; font-size:12.5px;">${cs.rawMin} dk × ${cs.multiplier} = ${cs.eqMin} eşd. dk</div>
                            </div>
                        </div>
                    `;
                }).join('')
                : `<div style="padding:10px; background:#FFFFFF; border:1px dashed #CBD5E1; border-radius:8px; font-size:11.5px; color:#475569; text-align:center;">
                    Bu hafta henüz kardiyo seansı yok.
                   </div>`;

            container.innerHTML = `
                <!-- HAFTA SEÇİCİ & YENİLEME (TEK SATIR) -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:8px 12px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:13.5px; font-weight:900; color:#0F172A; white-space:nowrap;">Puan Özeti • ${escapeHTML(data.bounds.label)}</span>
                        <button type="button" class="wk-ex-i-btn" onclick="openAnalyticsInfoModal('score_method')" title="Puanlama Yöntemi">i</button>
                    </div>
                    <div style="display:flex; gap:5px; align-items:center;">
                        <button type="button" class="btn btn-outline ${currentScoreWeekOffset === -1 ? 'active-filter-pill' : ''}" style="font-size:11px; padding:4px 8px; font-weight:800; border-radius:7px;" onclick="setScoreAnalyticsWeekOffset(-1)">◀ Geçen</button>
                        <button type="button" class="btn btn-outline ${currentScoreWeekOffset === 0 ? 'active-filter-pill' : ''}" style="font-size:11px; padding:4px 8px; font-weight:800; border-radius:7px;" onclick="setScoreAnalyticsWeekOffset(0)">Bu Hafta</button>
                        <button type="button" class="btn btn-outline" style="font-size:11px; padding:4px 8px; font-weight:800; border-radius:7px; color:#0369A1; border-color:#0284C7;" onclick="if(window.syncGarminActivitiesFromTredict){window.syncGarminActivitiesFromTredict(); setTimeout(renderAnalytics, 700);}">🔄 Saat</button>
                    </div>
                </div>

                <!-- İKİLİ BÜYÜK PUAN ÖZET KARTLARI -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-bottom:14px;">
                    <!-- KIRMIZI FİTNESS KARTI -->
                    <div style="background:#FEF2F2; border:1.5px solid #EF4444; border-radius:12px; padding:12px 14px; color:#0F172A;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-size:12.5px; font-weight:900; color:#B91C1C;">🔴 FİTNESS PUANI</span>
                            <span class="tabular-nums" style="font-size:20px; font-weight:900; color:#991B1B;">${f.totalScore} <span style="font-size:12px; color:#B91C1C;">/ 100</span></span>
                        </div>
                        <div style="width:100%; height:8px; background:#FEE2E2; border:1px solid #FECACA; border-radius:999px; overflow:hidden; margin-bottom:10px;">
                            <div style="height:100%; width:${f.totalScore}%; background:linear-gradient(90deg, #DC2626 0%, #EF4444 100%); border-radius:999px;"></div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
                            <div style="background:#FFFFFF; border:1px solid #FECACA; border-radius:8px; padding:7px 10px; display:flex; justify-content:space-between; font-weight:800; color:#0F172A;">
                                <span>1. 10 Kas Dengesi (Plan: ${f.muscleScoreProjected}p)</span>
                                <span class="tabular-nums" style="color:#B91C1C;">${f.muscleScoreDone} / 45p</span>
                            </div>
                            <div style="background:#FFFFFF; border:1px solid #FECACA; border-radius:8px; padding:7px 10px; display:flex; justify-content:space-between; font-weight:800; color:#0F172A;">
                                <span>2. Kuvvet Seti (${f.totalStrengthSetsDone} / 40 Set)</span>
                                <span class="tabular-nums" style="color:#B91C1C;">${f.setVolumeScoreDone} / 35p</span>
                            </div>
                            <div style="background:#FFFFFF; border:1px solid #FECACA; border-radius:8px; padding:7px 10px; display:flex; justify-content:space-between; font-weight:800; color:#0F172A;">
                                <span>3. Çok Eklemli Oran (%${f.compoundPct})</span>
                                <span class="tabular-nums" style="color:#B91C1C;">${f.compoundScoreDone} / 20p</span>
                            </div>
                        </div>

                        <div style="margin-top:10px;">
                            <div style="font-size:11px; font-weight:900; color:#991B1B; margin-bottom:5px;">10 ANA KAS PUANI:</div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                                ${muscleRowsHtml}
                            </div>
                        </div>
                    </div>

                    <!-- MAVİ KARDİYO KARTI -->
                    <div style="background:#F0F9FF; border:1.5px solid #0284C7; border-radius:12px; padding:12px 14px; color:#0F172A;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-size:12.5px; font-weight:900; color:#0369A1;">🔵 KARDİYO PUANI</span>
                            <span class="tabular-nums" style="font-size:20px; font-weight:900; color:#075985;">${c.totalScore} <span style="font-size:12px; color:#0369A1;">/ 100</span></span>
                        </div>
                        <div style="width:100%; height:8px; background:#DBEAFE; border:1px solid #BFDBFE; border-radius:999px; overflow:hidden; margin-bottom:10px;">
                            <div style="height:100%; width:${c.totalScore}%; background:linear-gradient(90deg, #0284C7 0%, #2563EB 100%); border-radius:999px;"></div>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:6px; font-size:12px;">
                            <div style="background:#FFFFFF; border:1px solid #BAE6FD; border-radius:8px; padding:7px 10px; display:flex; justify-content:space-between; font-weight:800; color:#0F172A;">
                                <span>1. Haftalık Adım (${c.weeklyStepsTotal.toLocaleString('tr-TR')} / 56B)</span>
                                <span class="tabular-nums" style="color:#0369A1;">${c.stepsScore} / 40p</span>
                            </div>
                            <div style="background:#FFFFFF; border:1px solid #BAE6FD; border-radius:8px; padding:7px 10px; display:flex; justify-content:space-between; font-weight:800; color:#0F172A;">
                                <span>2. Kardiyo Efor (${c.totalEqCardioMin} / 150 dk)</span>
                                <span class="tabular-nums" style="color:#0369A1;">${c.cardioEffortScore} / 45p</span>
                            </div>
                            <div style="background:#FFFFFF; border:1px solid #BAE6FD; border-radius:8px; padding:7px 10px; display:flex; justify-content:space-between; font-weight:800; color:#0F172A;">
                                <span>3. Aktif Gün (${c.activeCardioDaysCount} / 3 Gün)</span>
                                <span class="tabular-nums" style="color:#0369A1;">${c.cardioFreqScore} / 15p</span>
                            </div>
                        </div>

                        <div style="margin-top:10px;">
                            <div style="font-size:11px; font-weight:900; color:#075985; margin-bottom:5px;">KARDİYO SEANSLARI (${c.totalRawCardioMin} ➔ ${c.totalEqCardioMin} Dk):</div>
                            <div style="display:flex; flex-direction:column; gap:5px; margin-bottom:10px;">
                                ${cardioExRowsHtml}
                            </div>

                            <div style="font-size:11px; font-weight:900; color:#075985; margin-bottom:5px;">GÜNLÜK ADIM (ORT. ${c.dailyAvgSteps.toLocaleString('tr-TR')}):</div>
                            <div style="display:flex; flex-direction:column; gap:5px;">
                                ${stepsRowsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function openAnalyticsInfoModal(type, ratioVal, pullKg, pushKg) {
            let modal = document.getElementById('analyticsQuickInfoModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'analyticsQuickInfoModal';
                modal.className = 'modal-overlay';
                modal.onclick = function(e) { if (e.target === modal) modal.classList.remove('active'); };
                document.body.appendChild(modal);
            }
            let title = 'Bilgi';
            let bodyHtml = '';
            if (type === 'tonnage') {
                title = 'Tonaj & Çalışma Hesabı';
                bodyHtml = `
                    <div style="font-size:12.5px; color:#334155; line-height:1.5;">
                        Şınav ve barfiks gibi vücut ağırlığı hareketleri ile Plank gibi süreli duruşlar harcanan efora göre toplam tonaj ve set hesabına otomatik eklenir.
                    </div>
                `;
            } else if (type === 'posture') {
                title = 'İtiş / Çekiş & Duruş Dengesi';
                bodyHtml = `
                    <div style="display:flex; flex-direction:column; gap:8px; font-size:12.5px; color:#334155; line-height:1.5;">
                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:8px 10px; display:flex; justify-content:space-between; font-weight:800; color:#0F172A;">
                            <span>Çekiş: ${escapeHTML(String(pullKg || 0))} kg</span>
                            <span>İtiş: ${escapeHTML(String(pushKg || 0))} kg</span>
                            <span style="color:#0369A1;">Oran: ${escapeHTML(String(ratioVal || '1.00'))}</span>
                        </div>
                        <div>Omuz ve omurga sağlığı için sırt çekiş hacminin göğüs/omuz itiş hacmine eşit veya biraz üzerinde (0.85 – 1.35 arası) olması idealdir.</div>
                    </div>
                `;
            } else if (type === 'score_method') {
                title = 'Fitness & Kardiyo Puanlama';
                bodyHtml = `
                    <div style="display:flex; flex-direction:column; gap:8px; font-size:12.5px; color:#334155; line-height:1.5;">
                        <div><strong style="color:#B91C1C;">Fitness Puanı (100p):</strong> 10 ana kas dengesi (45p), haftalık 40 efektif set hedefi (35p) ve çok eklemli temel hareket oranı (20p) üzerinden hesaplanır.</div>
                        <div><strong style="color:#0369A1;">Kardiyo Puanı (100p):</strong> Günde 8.000 adım / haftalık 56.000 adım (40p), nabız bölgesine göre çarpanlı 150 eşdeğer dakika (45p) ve haftada en az 3 aktif gün dağılımı (15p) ile hesaplanır.</div>
                    </div>
                `;
            }
            modal.innerHTML = `
                <div class="modal-box" style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; max-width:380px; width:92%; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div style="font-size:15px; font-weight:900; color:#0F172A;">${title}</div>
                        <button type="button" onclick="document.getElementById('analyticsQuickInfoModal').classList.remove('active')" style="width:28px; height:28px; border-radius:50%; border:1px solid #CBD5E1; background:#F8FAFC; color:#0F172A; font-weight:800; cursor:pointer;">✕</button>
                    </div>
                    ${bodyHtml}
                </div>
            `;
            modal.classList.add('active');
        }

