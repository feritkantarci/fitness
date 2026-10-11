#!/usr/bin/env python3
import re

INDEX_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/index.html"
MOBIL_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/salon_kilavuzu_mobil.html"

CLEAN_ENGINE = '''        // ==================== AUTH & ADMIN ENGINE ====================
        let currentSession = null;
        let selectedNewAvatar = '🥋';
        let selectedAvatar = '🥋';
        let selectedTheme = 'gold';

        const THEMES = {
            gold: { gold: '#f59e0b', goldLight: '#fde68a', shadow: 'rgba(245, 158, 11, 0.25)' },
            cyan: { gold: '#38bdf8', goldLight: '#bae6fd', shadow: 'rgba(56, 189, 248, 0.25)' },
            green: { gold: '#10b981', goldLight: '#a7f3d0', shadow: 'rgba(16, 185, 129, 0.25)' },
            red: { gold: '#f43f5e', goldLight: '#fecdd3', shadow: 'rgba(244, 63, 94, 0.25)' },
            purple: { gold: '#a855f7', goldLight: '#e9d5ff', shadow: 'rgba(168, 85, 247, 0.25)' }
        };

        function initAuthDatabase() {
            let users = [];
            try {
                const raw = localStorage.getItem('celik_kodu_auth_users');
                if (raw) users = JSON.parse(raw);
            } catch(e) {}

            if (!Array.isArray(users) || users.length === 0) {
                users = [
                    {
                        id: 'usr_admin',
                        username: 'admin',
                        password: '123',
                        role: 'admin',
                        name: 'Ferit (Admin)',
                        avatar: '🥋',
                        theme: 'gold',
                        level: 'İleri Seviye',
                        gender: 'Erkek',
                        weights: { press: '16', squat: '22', row: '20', rdl: '22', swing: '18', lunge: '14' },
                        createdAt: Date.now()
                    },
                    {
                        id: 'usr_ferit',
                        username: 'ferit',
                        password: '123',
                        role: 'admin',
                        name: 'Ferit',
                        avatar: '🥋',
                        theme: 'gold',
                        level: 'İleri Seviye',
                        gender: 'Erkek',
                        weights: { press: '16', squat: '22', row: '20', rdl: '22', swing: '18', lunge: '14' },
                        createdAt: Date.now()
                    },
                    {
                        id: 'usr_ismail',
                        username: 'ismail',
                        password: '123',
                        role: 'athlete',
                        name: 'İsmail',
                        avatar: '🦁',
                        theme: 'cyan',
                        level: 'Orta Seviye',
                        gender: 'Erkek',
                        weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
                        createdAt: Date.now()
                    }
                ];
                localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
            }
            return users;
        }

        function getAuthUsers() {
            return initAuthDatabase();
        }

        function saveAuthUsers(users) {
            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(users));
        }

        function getSession() {
            try {
                const raw = localStorage.getItem('celik_kodu_session');
                return raw ? JSON.parse(raw) : null;
            } catch(e) {
                return null;
            }
        }

        function setSession(session) {
            currentSession = session;
            if (session) {
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
                localStorage.setItem('celik_kodu_active_user_id', session.userId);
            } else {
                localStorage.removeItem('celik_kodu_session');
                localStorage.removeItem('celik_kodu_active_user_id');
            }
            syncAppViewState();
        }

        function getActiveUserId() {
            const session = getSession();
            if (session && session.userId) return session.userId;
            const fallback = localStorage.getItem('celik_kodu_active_user_id');
            return fallback || 'usr_admin';
        }

        function getActiveUser() {
            const uid = getActiveUserId();
            const users = getAuthUsers();
            return users.find(u => u.id === uid) || users[0];
        }

        function syncAppViewState() {
            const session = getSession();
            const loginScreen = document.getElementById('loginScreen');
            const mainAppWrapper = document.getElementById('mainAppWrapper');

            if (!session) {
                if (loginScreen) loginScreen.classList.add('active');
                if (mainAppWrapper) mainAppWrapper.style.display = 'none';
            } else {
                if (loginScreen) loginScreen.classList.remove('active');
                if (mainAppWrapper) mainAppWrapper.style.display = 'block';

                const isAdmin = session.role === 'admin';

                // Check Admin button in header
                const btnAdmin = document.getElementById('btnAdminPanel');
                if (btnAdmin) {
                    btnAdmin.style.display = isAdmin ? 'flex' : 'none';
                }

                // Check Admin button in profile tab
                const profileBtnAdmin = document.getElementById('profileBtnAdmin');
                if (profileBtnAdmin) {
                    profileBtnAdmin.style.display = isAdmin ? 'inline-block' : 'none';
                }
                const profileTabAdminBtn = document.getElementById('profileTabAdminBtn');
                if (profileTabAdminBtn) {
                    profileTabAdminBtn.style.display = isAdmin ? 'inline-block' : 'none';
                }

                // Check Role badge in header
                const roleBadge = document.getElementById('headerUserRoleBadge');
                if (roleBadge) {
                    roleBadge.innerText = isAdmin ? 'YÖNETİCİ' : 'SPORCU';
                    roleBadge.className = 'auth-role-tag ' + (isAdmin ? 'role-admin' : 'role-athlete');
                }

                applyActiveUserProfile();
            }
        }

        function handleAuthLogin(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('loginUsername');
            const passwordInput = document.getElementById('loginPassword');
            const errorBox = document.getElementById('loginErrorMsg');

            const uname = (usernameInput.value || '').trim().toLowerCase();
            const pass = (passwordInput.value || '').trim();

            const users = getAuthUsers();
            const matched = users.find(u => u.username.toLowerCase() === uname && u.password === pass);

            if (matched) {
                errorBox.style.display = 'none';
                setSession({
                    userId: matched.id,
                    username: matched.username,
                    role: matched.role,
                    name: matched.name
                });
                usernameInput.value = "";
                passwordInput.value = "";
            } else {
                errorBox.innerText = "❌ Hatalı kullanıcı adı veya şifre! (Varsayılan: admin / 123)";
                errorBox.style.display = 'block';
            }
        }

        function handleAuthLogout() {
            if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) {
                setSession(null);
            }
        }

        // Admin Management
        function openAdminModal() {
            const session = getSession();
            if (!session || session.role !== 'admin') {
                alert("Bu alana sadece yöneticiler erişebilir.");
                return;
            }

            renderAdminUserList();
            const modal = document.getElementById('adminModal');
            if (modal) modal.classList.add('active');
        }

        function closeAdminModal() {
            const modal = document.getElementById('adminModal');
            if (modal) modal.classList.remove('active');
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
                alert("Lütfen kullanıcı adı, şifre ve isim alanlarını eksiksiz doldurun.");
                return;
            }

            const users = getAuthUsers();
            if (users.some(u => u.username.toLowerCase() === uname)) {
                alert("Bu kullanıcı adı zaten kullanımda! Başka bir kullanıcı adı seçin.");
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
                weights: {
                    press: '12',
                    squat: '18',
                    row: '16',
                    rdl: '18',
                    swing: '14',
                    lunge: '12'
                },
                createdAt: Date.now()
            };

            users.push(newUser);
            saveAuthUsers(users);

            // Clear inputs
            document.getElementById('newUsername').value = "";
            document.getElementById('newPassword').value = "123456";
            document.getElementById('newDisplayName').value = "";

            renderAdminUserList();
            alert(`✅ ${dname} (@${uname}) başarıyla oluşturuldu!`);
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
                    <div class="admin-user-card">
                        <div class="admin-user-header">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:22px;">${u.avatar || '🥋'}</span>
                                <div>
                                    <strong style="color:#fff; font-size:13px;">${escapeHTML(u.name)}</strong>
                                    <span style="font-size:11px; color:var(--text-secondary);"> (@${escapeHTML(u.username)})</span>
                                    <span class="auth-role-tag ${u.role === 'admin' ? 'role-admin' : 'role-athlete'}">${u.role === 'admin' ? 'YÖNETİCİ' : 'SPORCU'}</span>
                                </div>
                            </div>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-outline" style="font-size:10px; padding:4px 8px; color:var(--gold);" onclick="adminSwitchToUser('${u.id}')" title="Bu kullanıcının hesabına geç">
                                    ${isSelf ? 'Aktif' : 'Hesabına Geç'}
                                </button>
                                ${!isSelf ? `
                                    <button class="btn btn-outline" style="font-size:10px; padding:4px 8px; color:#ef4444; border-color:#ef4444;" onclick="adminDeleteUser('${u.id}')" title="Kullanıcıyı Sil">
                                        Sil
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
                            <span>Şifre: <code style="color:var(--gold-light);">${escapeHTML(u.password)}</code> • ${u.level}</span>
                            <span>Toplam: ${logs.length} Seans • Seri: ${streak} Gün</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function adminSwitchToUser(targetUserId) {
            const users = getAuthUsers();
            const target = users.find(u => u.id === targetUserId);
            if (!target) return;

            setSession({
                userId: target.id,
                username: target.username,
                role: target.role,
                name: target.name
            });
            closeAdminModal();
        }

        function adminDeleteUser(userId) {
            const users = getAuthUsers();
            const target = users.find(u => u.id === userId);
            if (!target) return;

            if (confirm(`@${target.username} (${target.name}) kullanıcısını silmek istediğinize emin misiniz?`)) {
                localStorage.removeItem(`celik_kodu_history_${userId}`);
                localStorage.removeItem(`celik_kodu_workout_state_${userId}`);
                const updated = users.filter(u => u.id !== userId);
                saveAuthUsers(updated);
                renderAdminUserList();
            }
        }

        function applyTheme(themeKey) {
            const theme = THEMES[themeKey] || THEMES.gold;
            document.documentElement.style.setProperty('--gold', theme.gold);
            document.documentElement.style.setProperty('--gold-light', theme.goldLight);
        }

        function selectAvatar(avatar) {
            selectedAvatar = avatar;
            document.querySelectorAll('#avatarPicker .avatar-choice').forEach(el => {
                el.classList.toggle('selected', el.innerText.trim() === avatar);
            });
        }

        function selectTheme(themeKey) {
            selectedTheme = themeKey;
            document.querySelectorAll('#themePicker .theme-pill').forEach(el => {
                const isSelected = el.getAttribute('onclick') && el.getAttribute('onclick').includes(themeKey);
                el.classList.toggle('selected', isSelected);
            });
            applyTheme(themeKey);
        }

        function applyActiveUserProfile() {
            const user = getActiveUser();
            if (!user) return;

            // Apply theme
            applyTheme(user.theme || 'gold');

            // Header bar
            const headerAvatar = document.getElementById('headerUserAvatar');
            if (headerAvatar) headerAvatar.innerText = user.avatar || '🥋';
            const headerName = document.getElementById('headerUserName');
            if (headerName) headerName.innerText = escapeHTML(user.name);
            const headerSub = document.getElementById('headerUserSub');
            if (headerSub) headerSub.innerText = `${user.avatar || '🥋'} ${escapeHTML(user.name)} • Kişisel Sporcu Alanı`;

            // Profile card in Tab 5
            const cardAvatar = document.getElementById('profileCardAvatar');
            if (cardAvatar) cardAvatar.innerText = user.avatar || '🥋';
            const cardName = document.getElementById('profileCardName');
            if (cardName) cardName.innerText = escapeHTML(user.name);
            const cardMeta = document.getElementById('profileCardMeta');
            if (cardMeta) cardMeta.innerText = `${user.level} (${user.gender}) • Özel Kilo Programı`;

            // Inputs in Tab 5
            const nameInput = document.getElementById('editUserName');
            if (nameInput) nameInput.value = user.name || '';
            const levelSelect = document.getElementById('editUserLevel');
            if (levelSelect) levelSelect.value = user.level || 'Orta Seviye';
            const genderSelect = document.getElementById('editUserGender');
            if (genderSelect) genderSelect.value = user.gender || 'Erkek';

            selectAvatar(user.avatar || '🥋');
            selectTheme(user.theme || 'gold');

            // Custom weights
            const w = user.weights || {};
            if (document.getElementById('w_press')) document.getElementById('w_press').value = w.press || '';
            if (document.getElementById('w_squat')) document.getElementById('w_squat').value = w.squat || '';
            if (document.getElementById('w_row')) document.getElementById('w_row').value = w.row || '';
            if (document.getElementById('w_rdl')) document.getElementById('w_rdl').value = w.rdl || '';
            if (document.getElementById('w_swing')) document.getElementById('w_swing').value = w.swing || '';
            if (document.getElementById('w_lunge')) document.getElementById('w_lunge').value = w.lunge || '';

            // Update custom weight badges on exercise cards
            updateExerciseCardBadges(w);

            // Re-render logs and tracker state for this specific user
            loadTrackerState();
            renderHistory();
        }

        function updateExerciseCardBadges(weights) {
            document.querySelectorAll('.target-weight-badge').forEach(b => b.remove());
            if (!weights) return;

            const mapping = [
                { match: 'Omuz Presi', key: 'press' },
                { match: 'Goblet Squat', key: 'squat' },
                { match: 'Testere', key: 'row' },
                { match: 'RDL', key: 'rdl' },
                { match: 'Swing', key: 'swing' },
                { match: 'Lunge', key: 'lunge' }
            ];

            mapping.forEach(m => {
                const val = weights[m.key];
                if (!val) return;
                document.querySelectorAll('.exercise-header').forEach(header => {
                    const name = header.querySelector('.exercise-name');
                    if (name && name.innerText.includes(m.match)) {
                        const badge = document.createElement('span');
                        badge.className = 'target-weight-badge';
                        badge.innerText = `🎯 Hedefin: ${val} kg`;
                        header.appendChild(badge);
                    }
                });
            });
        }

        function saveCurrentProfile() {
            const user = getActiveUser();
            const nameInput = document.getElementById('editUserName');
            const newName = nameInput.value.trim() || 'Sporcu';

            user.name = newName;
            user.avatar = selectedAvatar;
            user.theme = selectedTheme;
            user.level = document.getElementById('editUserLevel').value;
            user.gender = document.getElementById('editUserGender').value;
            user.weights = {
                press: document.getElementById('w_press').value,
                squat: document.getElementById('w_squat').value,
                row: document.getElementById('w_row').value,
                rdl: document.getElementById('w_rdl').value,
                swing: document.getElementById('w_swing').value,
                lunge: document.getElementById('w_lunge').value
            };

            const users = getAuthUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) users[idx] = user;
            saveAuthUsers(users);

            // Also update session name if self
            const session = getSession();
            if (session && session.userId === user.id) {
                session.name = newName;
                localStorage.setItem('celik_kodu_session', JSON.stringify(session));
            }

            applyActiveUserProfile();
            playAlertSound();
            alert("✅ Profiliniz ve çalışma kilolarınız başarıyla güncellendi!");
        }

        function getUserLogsById(userId) {
            try {
                if (userId === 'user_default' && localStorage.getItem('celik_kodu_history')) {
                    const legacy = localStorage.getItem('celik_kodu_history');
                    localStorage.setItem('celik_kodu_history_user_default', legacy);
                    localStorage.removeItem('celik_kodu_history');
                }
                const raw = localStorage.getItem(`celik_kodu_history_${userId}`);
                return raw ? JSON.parse(raw) : [];
            } catch(e) {
                return [];
            }
        }

        function calculateStreakForLogs(logs) {
            let streak = 0;
            const uniqueDates = [...new Set(logs.map(l => l.date))].sort().reverse();
            let checkDate = new Date();
            for (let i = 0; i < 30; i++) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (uniqueDates.includes(dateStr)) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
                checkDate.setDate(checkDate.getDate() - 1);
            }
            return streak;
        }
'''

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Update Tab 5 profile buttons
    old_profile_btn = '<button class="btn btn-outline" style="font-size:11px; padding:6px 10px;" onclick="openUserModal()">👥 Değiştir</button>'
    new_profile_btn = '''<div style="display:flex; gap:6px;">
                        <button class="btn btn-outline" id="profileBtnAdmin" style="font-size:11px; padding:6px 10px; color:var(--gold); border-color:var(--gold); display:none;" onclick="openAdminModal()">👑 Sporcular</button>
                        <button class="btn btn-outline" style="font-size:11px; padding:6px 10px; color:#f87171; border-color:rgba(239,68,68,0.4);" onclick="handleAuthLogout()">🚪 Çıkış</button>
                    </div>'''
    if old_profile_btn in html:
        html = html.replace(old_profile_btn, new_profile_btn)

    # 2. Update Tab 5 bottom action buttons
    old_bottom = '''            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; margin-bottom:30px;">
                <button class="btn btn-outline" style="font-size:11px; border-color:#38bdf8; color:#38bdf8;" onclick="addNewUserPrompt()">
                    ➕ Yeni Sporcu Profili Ekle
                </button>
                <button class="btn btn-outline" style="font-size:11px; border-color:#ef4444; color:#ef4444;" onclick="deleteCurrentProfile()">
                    🗑️ Bu Profili Sil
                </button>
            </div>'''
    new_bottom = '''            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; margin-bottom:30px;">
                <button class="btn btn-outline" id="profileTabAdminBtn" style="font-size:11px; border-color:var(--gold); color:var(--gold); display:none;" onclick="openAdminModal()">
                    👑 Sporcu Yönetim Portalı (Admin)
                </button>
                <button class="btn btn-outline" style="font-size:11px; border-color:#ef4444; color:#ef4444;" onclick="handleAuthLogout()">
                    🚪 Oturumu Kapat / Sporcu Değiştir
                </button>
            </div>'''
    if old_bottom in html:
        html = html.replace(old_bottom, new_bottom)

    # 3. Remove USER SWITCH MODAL html if present
    user_modal_pattern = r'<!-- USER SWITCH MODAL -->[\s\S]*?</div>\s*</div>'
    html = re.sub(user_modal_pattern, '', html)

    # 4. Clean up JS engine section
    # Find start: // ==================== MULTI-USER PROFILE & STATE ENGINE ====================
    # Find end: // ==================== WORKOUT TRACKER & HISTORY ENGINE (SECURED) ====================
    start_tag = '// ==================== MULTI-USER PROFILE & STATE ENGINE ===================='
    end_tag = '// ==================== WORKOUT TRACKER & HISTORY ENGINE (SECURED) ===================='

    if start_tag in html and end_tag in html:
        parts = html.split(start_tag)
        before = parts[0]
        after = parts[1].split(end_tag)[1]
        html = before + start_tag + '\n' + CLEAN_ENGINE + '\n        ' + end_tag + after

    # 5. Fix startup call and per-user export/import/reset
    old_data_section = '''        function exportData() {
            const logs = getWorkoutLogs();
            const trackerState = localStorage.getItem('celik_kodu_workout_state');
            const data = {
                history: logs,
                checkboxState: trackerState ? JSON.parse(trackerState) : {},
                exportDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_yedek_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function importData(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Security check: File size limit (max 2 MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("❌ Hata: Dosya boyutu çok büyük (Maksimum 2MB)!");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    
                    // Strict Schema Validation
                    if (data.history && Array.isArray(data.history)) {
                        const sanitizedHistory = data.history
                            .filter(item => item && typeof item === 'object')
                            .map(item => ({
                                id: String(item.id || ('log_' + Date.now())).slice(0, 50),
                                program: String(item.program || '').slice(0, 100),
                                date: String(item.date || '').slice(0, 20),
                                duration: String(item.duration || '').slice(0, 10),
                                rpe: String(item.rpe || '').slice(0, 50),
                                notes: String(item.notes || '').slice(0, 3000),
                                timestamp: Number(item.timestamp) || Date.now()
                            }));
                        localStorage.setItem('celik_kodu_history', JSON.stringify(sanitizedHistory));
                    }
                    if (data.checkboxState && typeof data.checkboxState === 'object') {
                        localStorage.setItem('celik_kodu_workout_state', JSON.stringify(data.checkboxState));
                        loadTrackerState();
                    }
                    renderHistory();
                    alert("✅ Veriler güvenli bir şekilde geri yüklendi!");
                } catch(err) {
                    alert("❌ Hata: Geçersiz veya bozuk yedek dosyası!");
                }
            };
            reader.readAsText(file);
        }

        function resetCheckboxes() {
            if (confirm("Tüm set kutucuklarını temizlemek istediğinize emin misiniz? (Antrenman geçmişiniz silinmez, sadece kutucuklar sıfırlanır).")) {
                localStorage.removeItem('celik_kodu_workout_state');
                document.querySelectorAll('.set-pill').forEach(pill => {
                    pill.classList.remove('done');
                    const cb = pill.querySelector('input');
                    if (cb) cb.checked = false;
                });
                alert("Kutucuklar yeni antrenman için sıfırlandı!");
            }
        }

        // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('PWA ServiceWorker kayıtlı:', reg.scope))
                    .catch(err => console.log('PWA SW hatası:', err));
            });
        }

        // Initial setup for date field
        const todayStr = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('logDate');
        if (dateInput) dateInput.value = todayStr;
        renderHistory();'''

    new_data_section = '''        function exportData() {
            const uid = getActiveUserId();
            const logs = getWorkoutLogs();
            const trackerState = localStorage.getItem(`celik_kodu_workout_state_${uid}`);
            const data = {
                userId: uid,
                history: logs,
                checkboxState: trackerState ? JSON.parse(trackerState) : {},
                exportDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `celik_kodu_yedek_${uid}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function importData(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Security check: File size limit (max 2 MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("❌ Hata: Dosya boyutu çok büyük (Maksimum 2MB)!");
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    const uid = getActiveUserId();
                    
                    // Strict Schema Validation
                    if (data.history && Array.isArray(data.history)) {
                        const sanitizedHistory = data.history
                            .filter(item => item && typeof item === 'object')
                            .map(item => ({
                                id: String(item.id || ('log_' + Date.now())).slice(0, 50),
                                program: String(item.program || '').slice(0, 100),
                                date: String(item.date || '').slice(0, 20),
                                duration: String(item.duration || '').slice(0, 10),
                                rpe: String(item.rpe || '').slice(0, 50),
                                notes: String(item.notes || '').slice(0, 3000),
                                timestamp: Number(item.timestamp) || Date.now()
                            }));
                        setWorkoutLogs(sanitizedHistory);
                    }
                    if (data.checkboxState && typeof data.checkboxState === 'object') {
                        localStorage.setItem(`celik_kodu_workout_state_${uid}`, JSON.stringify(data.checkboxState));
                        loadTrackerState();
                    }
                    renderHistory();
                    alert("✅ Veriler güvenli bir şekilde geri yüklendi!");
                } catch(err) {
                    alert("❌ Hata: Geçersiz veya bozuk yedek dosyası!");
                }
            };
            reader.readAsText(file);
        }

        function resetCheckboxes() {
            if (confirm("Tüm set kutucuklarını temizlemek istediğinize emin misiniz? (Antrenman geçmişiniz silinmez, sadece kutucuklar sıfırlanır).")) {
                const uid = getActiveUserId();
                localStorage.removeItem(`celik_kodu_workout_state_${uid}`);
                document.querySelectorAll('.set-pill').forEach(pill => {
                    pill.classList.remove('done');
                    const cb = pill.querySelector('input');
                    if (cb) cb.checked = false;
                });
                alert("Kutucuklar yeni antrenman için sıfırlandı!");
            }
        }

        // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('PWA ServiceWorker kayıtlı:', reg.scope))
                    .catch(err => console.log('PWA SW hatası:', err));
            });
        }

        // Initial setup for date field
        const todayStr = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('logDate');
        if (dateInput) dateInput.value = todayStr;

        // Initialize Auth Database & Application View
        initAuthDatabase();
        syncAppViewState();'''

    if old_data_section in html:
        html = html.replace(old_data_section, new_data_section)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Repaired: {filepath}")

process_file(INDEX_FILE)
process_file(MOBIL_FILE)
print("All files cleaned and repaired successfully!")
