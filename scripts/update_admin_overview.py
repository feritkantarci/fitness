#!/usr/bin/env python3
import re
import os

INDEX_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/index.html"
MOBIL_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/salon_kilavuzu_mobil.html"

with open(INDEX_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. New HTML for adminModal
OLD_MODAL_PATTERN = re.compile(
    r'(<!-- ==================== ADMIN MANAGEMENT MODAL ==================== -->\s*<div id="adminModal" class="modal-overlay">).*?(<!-- ==================== LOG WORKOUT COMPLETE MODAL ==================== -->)',
    re.DOTALL
)

NEW_MODAL_HTML = r'''\1
        <div class="modal-box" style="max-width: 600px; width: 95%;">
            <div class="modal-header">
                <span class="modal-title">👑 Sporcu Yönetim Portalı (Admin)</span>
                <button class="modal-close" onclick="closeAdminModal()">✕</button>
            </div>

            <!-- ADMIN NAVIGATION TABS -->
            <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                <button id="adminTabBtnStatus" class="btn btn-gold" style="flex:1; font-size:12px; padding:9px 12px; font-weight:800;" onclick="switchAdminModalTab('status')">
                    📊 Sporcu Çalışma Durumları
                </button>
                <button id="adminTabBtnManage" class="btn btn-outline" style="flex:1; font-size:12px; padding:9px 12px; font-weight:800; color:var(--text-secondary);" onclick="switchAdminModalTab('manage')">
                    ⚙️ Sporcu Hesap Yönetimi
                </button>
            </div>

            <!-- TAB 1: SPORCU ÇALIŞMA DURUMLARI (ÖZET PANELİ) -->
            <div id="adminViewStatus">
                <!-- TOP KPI BAR -->
                <div id="adminSummaryKpis" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:14px;"></div>

                <!-- ATHLETES LIVE CARDS -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="font-size:13px; font-weight:800; color:#fff; margin:0;">📋 Sporcuların Antrenman & Kilo Durumları</h3>
                    <span style="font-size:10.5px; color:var(--text-secondary);">Hesap değiştirmeden canlı teftiş</span>
                </div>
                <div id="adminAthleteStatusContainer"></div>
            </div>

            <!-- TAB 2: SPORCU HESAP YÖNETİMİ -->
            <div id="adminViewManage" style="display:none;">
                <!-- ADD NEW USER SECTION -->
                <div style="background:var(--bg-surface); border:1px solid var(--gold); border-radius:10px; padding:14px; margin-bottom:16px;">
                    <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin-bottom:10px;">➕ Yeni Sporcu Oluştur</h3>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;" class="form-group">
                        <div>
                            <label class="form-label">Kullanıcı Adı</label>
                            <input type="text" id="newUsername" class="form-input" placeholder="Örn: ahmet" autocapitalize="none">
                        </div>
                        <div>
                            <label class="form-label">Şifre</label>
                            <input type="text" id="newPassword" class="form-input" value="123456">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:8px;" class="form-group">
                        <div>
                            <label class="form-label">Ad Soyad</label>
                            <input type="text" id="newDisplayName" class="form-input" placeholder="Örn: Ahmet Yılmaz">
                        </div>
                        <div>
                            <label class="form-label">Rol</label>
                            <select id="newRole" class="form-select">
                                <option value="athlete">Sporcu</option>
                                <option value="admin">Yönetici (Admin)</option>
                            </select>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;" class="form-group">
                        <div>
                            <label class="form-label">Seviye</label>
                            <select id="newLevel" class="form-select">
                                <option value="Başlangıç">Başlangıç</option>
                                <option value="Orta Seviye" selected>Orta Seviye</option>
                                <option value="İleri Seviye">İleri Seviye</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Cinsiyet</label>
                            <select id="newGender" class="form-select">
                                <option value="Erkek">Erkek</option>
                                <option value="Kadın">Kadın</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Avatar</label>
                        <div class="avatar-picker-grid" id="newAvatarPicker">
                            <div class="avatar-choice selected" onclick="selectNewAvatar('🥋')">🥋</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('🦁')">🦁</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('⚡')">⚡</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('🛡️')">🛡️</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('🦅')">🦅</div>
                        </div>
                    </div>

                    <button class="btn btn-gold" style="width:100%; padding:10px; font-weight:800;" onclick="handleCreateUser()">
                        ➕ KULLANICIYI KAYDET
                    </button>
                </div>

                <!-- ATHLETES LIST -->
                <h3 style="font-size:13px; font-weight:800; color:#fff; margin-bottom:10px;">📋 Kayıtlı Sporcu Hesapları</h3>
                <div id="adminUserListContainer"></div>
            </div>
        </div>
    </div>

    \2'''

if not OLD_MODAL_PATTERN.search(content):
    print("ERROR: OLD_MODAL_PATTERN not found in index.html!")
    exit(1)

content = OLD_MODAL_PATTERN.sub(NEW_MODAL_HTML, content)

# 2. New JS for Admin Functions
OLD_JS_PATTERN = re.compile(
    r'(// ADMIN PANEL\s*function openAdminModal\(\) \{).*?(// PROFILE & THEME SETTINGS)',
    re.DOTALL
)

NEW_JS_CODE = r'''// ADMIN PANEL
        function openAdminModal() {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Bu alana sadece yöneticiler erişebilir.");
                return;
            }
            renderAdminAthleteStatuses();
            renderAdminUserList();
            switchAdminModalTab('status');
            document.getElementById('adminModal').classList.add('active');
        }

        function closeAdminModal() {
            document.getElementById('adminModal').classList.remove('active');
        }

        function switchAdminModalTab(tabKey) {
            const statusView = document.getElementById('adminViewStatus');
            const manageView = document.getElementById('adminViewManage');
            const btnStatus = document.getElementById('adminTabBtnStatus');
            const btnManage = document.getElementById('adminTabBtnManage');

            if (tabKey === 'status') {
                if (statusView) statusView.style.display = 'block';
                if (manageView) manageView.style.display = 'none';
                if (btnStatus) {
                    btnStatus.className = 'btn btn-gold';
                    btnStatus.style.color = '#000';
                }
                if (btnManage) {
                    btnManage.className = 'btn btn-outline';
                    btnManage.style.color = 'var(--text-secondary)';
                }
                renderAdminAthleteStatuses();
            } else {
                if (statusView) statusView.style.display = 'none';
                if (manageView) manageView.style.display = 'block';
                if (btnStatus) {
                    btnStatus.className = 'btn btn-outline';
                    btnStatus.style.color = 'var(--text-secondary)';
                }
                if (btnManage) {
                    btnManage.className = 'btn btn-gold';
                    btnManage.style.color = '#000';
                }
                renderAdminUserList();
            }
        }

        function selectNewAvatar(av) {
            selectedNewAvatar = av;
            document.querySelectorAll('#newAvatarPicker .avatar-choice').forEach(el => {
                el.classList.toggle('selected', el.innerText.trim() === av);
            });
        }

        function handleCreateUser() {
            const uname = (document.getElementById('newUsername').value || '').trim().toLowerCase();
            const pass = (document.getElementById('newPassword').value || '').trim();
            const dname = (document.getElementById('newDisplayName').value || '').trim();
            const role = document.getElementById('newRole').value;
            const level = document.getElementById('newLevel').value;
            const gender = document.getElementById('newGender').value;

            if (!uname || !pass || !dname) {
                alert("Lütfen tüm alanları doldurun.");
                return;
            }

            const users = getAuthUsers();
            if (users.some(u => u.username.toLowerCase() === uname)) {
                alert("Bu kullanıcı adı zaten kullanımda!");
                return;
            }

            const newUser = {
                id: 'usr_' + Date.now(),
                username: uname,
                password: pass,
                role: role,
                name: dname,
                avatar: selectedNewAvatar,
                theme: role === 'admin' ? 'gold' : 'cyan',
                level: level,
                gender: gender,
                weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
                createdAt: Date.now()
            };

            users.push(newUser);
            saveAuthUsers(users);

            document.getElementById('newUsername').value = "";
            document.getElementById('newPassword').value = "123456";
            document.getElementById('newDisplayName').value = "";

            renderAdminUserList();
            renderAdminAthleteStatuses();
            alert(`✅ ${dname} (@${uname}) başarıyla oluşturuldu!`);
        }

        function renderAdminAthleteStatuses() {
            const container = document.getElementById('adminAthleteStatusContainer');
            const kpisEl = document.getElementById('adminSummaryKpis');
            if (!container) return;

            const users = getAuthUsers();
            let totalWorkoutsAll = 0;
            let totalTonajAll = 0;
            let activeAthletesCount = 0;

            const cardsHTML = users.map(u => {
                const logs = getUserLogsById(u.id);
                const streak = calculateStreakForLogs(logs);
                const sessionCount = logs.length;
                if (sessionCount > 0) activeAthletesCount++;

                let userTonaj = 0;
                logs.forEach(l => {
                    userTonaj += (parseFloat(l.totalVolumeKg) || 0);
                });
                totalWorkoutsAll += sessionCount;
                totalTonajAll += userTonaj;

                const lastLog = logs.length > 0 ? logs[0] : null;
                const activeStateRaw = localStorage.getItem(`celik_kodu_active_state_${u.id}`);
                const isLiveWorking = !!activeStateRaw;
                const w = u.weights || {};

                // Exercise details for the latest workout
                let lastLogDetailsHTML = '';
                if (lastLog) {
                    const exList = lastLog.exercises || lastLog.detailedExercises || [];
                    lastLogDetailsHTML = `
                        <div id="adminExDetails_${u.id}" style="display:none; margin-top:10px; padding:10px 12px; background:rgba(0,0,0,0.45); border-radius:8px; border:1px solid rgba(245,158,11,0.25);">
                            <div style="font-size:11px; font-weight:800; color:var(--gold); margin-bottom:8px; text-transform:uppercase; display:flex; justify-content:space-between;">
                                <span>📋 ${escapeHTML(lastLog.title)}</span>
                                <span style="color:#fff;">${lastLog.dateFormatted || lastLog.date}</span>
                            </div>
                            ${exList.length > 0 ? `
                                <div style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto; padding-right:4px;">
                                    ${exList.map(ex => {
                                        const sets = (ex.sets || []).filter(s => s.completed || (parseFloat(s.weight) > 0));
                                        const setsStr = sets.length > 0
                                            ? sets.map((s, idx) => `Set ${idx+1}: <strong style="color:var(--gold);">${s.weight}kg</strong> x ${s.reps}`).join(' • ')
                                            : '<span style="color:var(--text-secondary);">Set kaydı yok</span>';
                                        return `
                                            <div style="font-size:11px; padding:6px 8px; background:rgba(255,255,255,0.03); border-radius:6px; border-left:3px solid var(--gold);">
                                                <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                                                    <strong style="color:#fff;">${escapeHTML(ex.name)}</strong>
                                                    ${ex.muscle ? `<span style="font-size:10px; color:var(--cyan);">[${escapeHTML(ex.muscle)}]</span>` : ''}
                                                </div>
                                                <div style="font-size:10.5px; color:var(--text-secondary);">${setsStr}</div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : '<div style="font-size:11px; color:var(--text-secondary);">Detaylı set kaydı bulunamadı.</div>'}
                        </div>
                    `;
                }

                return `
                    <div style="background:var(--bg-surface); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:14px; margin-bottom:12px; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                        <!-- ATHLETE HEADER -->
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:26px; width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:var(--bg-elevated); border-radius:10px; border:1px solid var(--gold);">${u.avatar || '🥋'}</span>
                                <div>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <strong style="color:#fff; font-size:14px;">${escapeHTML(u.name)}</strong>
                                        <span style="font-size:11px; color:var(--text-secondary);">@${escapeHTML(u.username)}</span>
                                        <span class="auth-role-tag ${u.role === 'admin' ? 'role-admin' : 'role-athlete'}" style="font-size:9px; padding:2px 6px;">
                                            ${u.role === 'admin' ? 'YÖNETİCİ' : 'SPORCU'}
                                        </span>
                                    </div>
                                    <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                        ${escapeHTML(u.level || 'Orta Seviye')} • ${escapeHTML(u.gender || 'Erkek')}
                                    </div>
                                </div>
                            </div>
                            ${isLiveWorking ? `
                                <span style="background:rgba(34,197,94,0.15); border:1px solid var(--green-success); color:var(--green-success); font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px; display:flex; align-items:center; gap:5px;">
                                    <span style="width:6px; height:6px; border-radius:50%; background:var(--green-success); display:inline-block;"></span>
                                    Antrenmanda
                                </span>
                            ` : ''}
                        </div>

                        <!-- 3-COL KPI STATS -->
                        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:10px; text-align:center;">
                            <div style="background:var(--bg-card); padding:8px 4px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">TOPLAM SEANS</div>
                                <div style="font-size:13px; font-weight:800; color:#fff; margin-top:2px;">🏋️ ${sessionCount} Seans</div>
                            </div>
                            <div style="background:var(--bg-card); padding:8px 4px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">SERİ DURUMU</div>
                                <div style="font-size:13px; font-weight:800; color:var(--gold); margin-top:2px;">🔥 ${streak} Gün</div>
                            </div>
                            <div style="background:var(--bg-card); padding:8px 4px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
                                <div style="font-size:9.5px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                                <div style="font-size:13px; font-weight:800; color:var(--cyan); margin-top:2px;">⚡ ${Math.round(userTonaj).toLocaleString('tr-TR')} kg</div>
                            </div>
                        </div>

                        <!-- LAST WORKOUT PREVIEW -->
                        <div style="background:var(--bg-card); border-radius:8px; padding:10px 12px; border:1px solid rgba(255,255,255,0.06); font-size:11.5px; margin-bottom:10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <span style="font-weight:700; color:var(--gold);">Son Antrenman Seansı:</span>
                                <span style="color:var(--text-secondary); font-size:10.5px;">
                                    ${lastLog ? (lastLog.dateFormatted || lastLog.date) : 'Kayıt Yok'}
                                </span>
                            </div>
                            ${lastLog ? `
                                <div style="color:#fff; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
                                    <span>${escapeHTML(lastLog.title)}</span>
                                    <span style="color:var(--gold-light); font-size:11px;">⏱️ ${lastLog.duration || 0} dk • ${lastLog.totalSetsCompleted || 0} Set</span>
                                </div>
                            ` : `
                                <div style="color:var(--text-secondary); font-style:italic;">Henüz tamamlanmış antrenman seansı bulunmuyor.</div>
                            `}
                        </div>

                        <!-- TARGET WEIGHTS -->
                        <div style="font-size:10px; color:var(--text-secondary); font-weight:800; text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">
                            🎯 Sporcunun Hedef / Çalışma Kiloları:
                        </div>
                        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:4px; text-align:center; font-size:10.5px; margin-bottom:10px;">
                            <div style="background:rgba(255,255,255,0.03); padding:4px 2px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
                                <div style="color:var(--text-secondary); font-size:9px;">Press</div>
                                <strong style="color:var(--gold);">${w.press || '-'}k</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.03); padding:4px 2px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
                                <div style="color:var(--text-secondary); font-size:9px;">Squat</div>
                                <strong style="color:var(--gold);">${w.squat || '-'}k</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.03); padding:4px 2px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
                                <div style="color:var(--text-secondary); font-size:9px;">Row</div>
                                <strong style="color:var(--gold);">${w.row || '-'}k</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.03); padding:4px 2px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
                                <div style="color:var(--text-secondary); font-size:9px;">RDL</div>
                                <strong style="color:var(--gold);">${w.rdl || '-'}k</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.03); padding:4px 2px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
                                <div style="color:var(--text-secondary); font-size:9px;">Swing</div>
                                <strong style="color:var(--gold);">${w.swing || '-'}k</strong>
                            </div>
                            <div style="background:rgba(255,255,255,0.03); padding:4px 2px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);">
                                <div style="color:var(--text-secondary); font-size:9px;">Lunge</div>
                                <strong style="color:var(--gold);">${w.lunge || '-'}k</strong>
                            </div>
                        </div>

                        <!-- TOGGLE LAST WORKOUT DETAILS BUTTON -->
                        ${lastLog ? `
                            <button class="btn btn-outline" style="width:100%; font-size:11px; padding:7px; border-color:rgba(245,158,11,0.4); color:var(--gold);" onclick="toggleAdminAthleteDetails('${u.id}')">
                                🔍 Son Antrenman Hareket ve Set Detaylarını İncele
                            </button>
                            ${lastLogDetailsHTML}
                        ` : ''}
                    </div>
                `;
            }).join('');

            if (kpisEl) {
                kpisEl.innerHTML = `
                    <div style="background:var(--bg-surface); padding:8px 6px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); text-align:center;">
                        <div style="font-size:9px; color:var(--text-secondary); font-weight:700;">KAYITLI SPORCU</div>
                        <div style="font-size:14px; font-weight:900; color:var(--gold); margin-top:2px;">👥 ${users.length}</div>
                    </div>
                    <div style="background:var(--bg-surface); padding:8px 6px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); text-align:center;">
                        <div style="font-size:9px; color:var(--text-secondary); font-weight:700;">TOPLAM SEANS</div>
                        <div style="font-size:14px; font-weight:900; color:var(--green-success); margin-top:2px;">✅ ${totalWorkoutsAll}</div>
                    </div>
                    <div style="background:var(--bg-surface); padding:8px 6px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); text-align:center;">
                        <div style="font-size:9px; color:var(--text-secondary); font-weight:700;">TOPLAM TONAJ</div>
                        <div style="font-size:14px; font-weight:900; color:var(--cyan); margin-top:2px;">⚡ ${Math.round(totalTonajAll).toLocaleString('tr-TR')} kg</div>
                    </div>
                `;
            }

            container.innerHTML = cardsHTML;
        }

        function toggleAdminAthleteDetails(uid) {
            const el = document.getElementById(`adminExDetails_${uid}`);
            if (el) {
                const isHidden = el.style.display === 'none' || !el.style.display;
                el.style.display = isHidden ? 'block' : 'none';
            }
        }

        function renderAdminUserList() {
            const container = document.getElementById('adminUserListContainer');
            if (!container) return;

            const users = getAuthUsers();
            const session = getSession();

            container.innerHTML = users.map(u => {
                const logs = getUserLogsById(u.id);
                const streak = calculateStreakForLogs(logs);
                const isSelf = session && session.userId === u.id;

                return `
                    <div class="admin-user-card" style="background:var(--bg-surface); border:1px solid ${isSelf ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}; border-radius:10px; padding:12px; margin-bottom:8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:22px;">${u.avatar || '🥋'}</span>
                                <div>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <strong style="color:#fff; font-size:13px;">${escapeHTML(u.name)}</strong>
                                        <span style="font-size:11px; color:var(--text-secondary);">(@${escapeHTML(u.username)})</span>
                                        ${isSelf ? '<span class="auth-role-tag role-admin" style="font-size:9px; padding:1px 6px;">GİRİŞ YAPILAN HESAP</span>' : ''}
                                    </div>
                                    <div style="font-size:11px; color:var(--text-secondary);">
                                        ${escapeHTML(u.level || 'Orta Seviye')} • ${escapeHTML(u.gender || 'Erkek')}
                                    </div>
                                </div>
                            </div>
                            <div>
                                ${!isSelf ? `
                                    <button class="btn btn-outline" style="font-size:10px; padding:4px 10px; color:#ef4444; border-color:#ef4444;" onclick="adminDeleteUser('${u.id}')">
                                        🗑️ Sil
                                    </button>
                                ` : '<span style="font-size:11px; color:var(--gold); font-weight:700;">Aktif</span>'}
                            </div>
                        </div>
                        <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.06); padding-top:6px; margin-top:6px;">
                            <span>Şifre: <code style="color:var(--gold-light); background:rgba(0,0,0,0.3); padding:2px 6px; border-radius:4px; font-family:monospace;">${escapeHTML(u.password)}</code></span>
                            <span>${logs.length} Seans • Seri: ${streak} Gün</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function adminSwitchToUser(targetUserId) {
            alert("Güvenlik nedeniyle hesaplar arası geçiş devre dışı bırakılmıştır.");
        }

        function adminDeleteUser(userId) {
            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) return;

            if (confirm(`@${target.username} (${target.name}) kullanıcısını silmek istediğinize emin misiniz?`)) {
                localStorage.removeItem(`celik_kodu_history_${userId}`);
                localStorage.removeItem(`celik_kodu_custom_programs_${userId}`);
                localStorage.removeItem(`celik_kodu_active_state_${userId}`);
                const updated = users.filter(u => u.id !== userId);
                saveAuthUsers(updated);
                renderAdminUserList();
                renderAdminAthleteStatuses();
            }
        }

        \2'''

if not OLD_JS_PATTERN.search(content):
    print("ERROR: OLD_JS_PATTERN not found in index.html!")
    exit(1)

content = OLD_JS_PATTERN.sub(NEW_JS_CODE, content)

with open(INDEX_FILE, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Successfully updated {INDEX_FILE}")

with open(MOBIL_FILE, "w", encoding="utf-8") as f:
    f.write(content)
print(f"Successfully updated {MOBIL_FILE}")
