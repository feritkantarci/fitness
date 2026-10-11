#!/usr/bin/env python3
import re

INDEX_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/index.html"
MOBIL_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/salon_kilavuzu_mobil.html"

with open(INDEX_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Login Screen & Admin Panel Styles
auth_css = """
        /* ==================== LOGIN & ADMIN SYSTEM CSS ==================== */
        #loginScreen {
            display: none;
            min-height: 100vh;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: radial-gradient(circle at top center, #1e293b 0%, #090d16 80%);
        }
        #loginScreen.active {
            display: flex;
        }
        .login-card {
            background: rgba(19, 28, 46, 0.95);
            border: 1px solid var(--gold);
            border-radius: 18px;
            padding: 30px 24px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(245, 158, 11, 0.15);
            backdrop-filter: blur(12px);
            text-align: center;
        }
        .login-logo {
            font-size: 40px;
            margin-bottom: 8px;
            display: inline-block;
        }
        .login-title {
            font-size: 20px;
            font-weight: 800;
            color: #fff;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .login-subtitle {
            font-size: 12px;
            color: var(--gold-light);
            margin-bottom: 22px;
        }
        .login-error {
            background: rgba(225, 29, 72, 0.15);
            border-left: 4px solid var(--red-alert);
            color: #fecdd3;
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 12px;
            margin-bottom: 16px;
            text-align: left;
            display: none;
        }
        .login-field {
            margin-bottom: 16px;
            text-align: left;
        }
        .login-label {
            display: block;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--text-secondary);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .login-input {
            width: 100%;
            background: #090d16;
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 14px;
            color: #fff;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            transition: all 0.2s;
        }
        .login-input:focus {
            border-color: var(--gold);
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);
        }
        .login-btn {
            width: 100%;
            background: linear-gradient(135deg, var(--gold) 0%, #b45309 100%);
            border: none;
            color: #090d16;
            font-size: 14px;
            font-weight: 800;
            padding: 14px;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 6px 18px rgba(245, 158, 11, 0.4);
            margin-top: 8px;
            transition: all 0.2s;
        }
        .login-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(245, 158, 11, 0.6);
        }
        .login-hint {
            margin-top: 18px;
            font-size: 11px;
            color: var(--text-secondary);
            background: rgba(0,0,0,0.3);
            padding: 8px 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.05);
        }

        /* HEADER AUTH BAR */
        .auth-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(19, 28, 46, 0.95);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 8px 12px;
            margin-bottom: 12px;
            max-width: 720px;
            margin-left: auto;
            margin-right: auto;
        }
        .auth-user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .auth-avatar {
            font-size: 26px;
            background: var(--bg-elevated);
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            border: 1.5px solid var(--gold);
        }
        .auth-name-title {
            font-size: 14px;
            font-weight: 800;
            color: #fff;
        }
        .auth-role-tag {
            font-size: 9.5px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-left: 4px;
        }
        .role-admin {
            background: rgba(245, 158, 11, 0.2);
            color: var(--gold);
            border: 1px solid var(--gold);
        }
        .role-athlete {
            background: rgba(56, 189, 248, 0.2);
            color: #38bdf8;
            border: 1px solid #0284c7;
        }
        .auth-actions {
            display: flex;
            gap: 6px;
        }
        .btn-auth-action {
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            color: var(--gold-light);
            font-size: 11px;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .btn-auth-action:hover {
            border-color: var(--gold);
        }
        .btn-logout {
            color: #f87171 !important;
            border-color: rgba(239, 68, 68, 0.4) !important;
        }
        .btn-logout:hover {
            border-color: #ef4444 !important;
            background: rgba(239, 68, 68, 0.15) !important;
        }

        /* ADMIN MODAL */
        .admin-user-card {
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px 14px;
            margin-bottom: 10px;
        }
        .admin-user-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
"""

# Replace previous multiuser css or add auth css
if '/* ==================== LOGIN & ADMIN SYSTEM CSS ==================== */' not in content:
    content = content.replace('/* ==================== MULTI-USER SYSTEM CSS ==================== */', auth_css + '\n        /* ==================== MULTI-USER SYSTEM CSS ==================== */')

# 2. Add Login Screen HTML before header
login_html = """
    <!-- LOGIN SCREEN -->
    <div id="loginScreen">
        <div class="login-card">
            <div class="login-logo">⚔️</div>
            <div class="badge">LA FORJA • EL CÓDIGO DEL ACERO</div>
            <h1 class="login-title">ÇELİK KODU GİRİŞİ</h1>
            <p class="login-subtitle">Dambıl Süperset Salon Portalı</p>

            <div id="loginErrorMsg" class="login-error"></div>

            <form id="loginForm" onsubmit="handleAuthLogin(event)">
                <div class="login-field">
                    <label class="login-label">Kullanıcı Adı</label>
                    <input type="text" id="loginUsername" class="login-input" placeholder="Örn: ferit veya admin" required autocomplete="username" autocapitalize="none">
                </div>

                <div class="login-field">
                    <label class="login-label">Şifre</label>
                    <input type="password" id="loginPassword" class="login-input" placeholder="••••••" required autocomplete="current-password">
                </div>

                <button type="submit" class="login-btn" id="loginSubmitBtn">GİRİŞ YAP ➔</button>
            </form>

            <div class="login-hint">
                🔑 <strong>Varsayılan Yönetici:</strong> admin | <strong>Şifre:</strong> 123<br>
                <em>(Yönetici panelinden yeni kullanıcılar açabilirsiniz).</em>
            </div>
        </div>
    </div>

    <!-- MAIN APP WRAPPER -->
    <div id="mainAppWrapper" style="display:none;">
"""

# Wrap current app
if '<!-- LOGIN SCREEN -->' not in content:
    content = content.replace('<body>', '<body>\n' + login_html)
    content = content.replace('</body>', '    </div><!-- END MAIN APP WRAPPER -->\n</body>')

# 3. Update Header Auth Bar
old_header_card = """        <!-- TOP ATHLETE BAR -->
        <div class="user-profile-header-card">
            <div class="user-profile-info" onclick="switchTab('profileTab')">
                <span class="user-avatar-badge" id="headerUserAvatar">🥋</span>
                <div class="user-meta">
                    <div class="user-title-row">
                        <span class="user-display-name" id="headerUserName">Ferit</span>
                        <span class="user-level-tag" id="headerUserLevel">İleri Seviye</span>
                    </div>
                    <div class="user-subtext" id="headerUserSub">🎯 Özel Hedefler & Özelleştirme</div>
                </div>
            </div>
            <button class="btn-switch-user" onclick="openUserModal()">
                <span>👥 Sporcu Değiştir</span>
            </button>
        </div>"""

new_header_card = """        <!-- AUTH & ATHLETE HEADER BAR -->
        <div class="auth-bar">
            <div class="auth-user-info" onclick="switchTab('profileTab')" style="cursor:pointer;">
                <span class="auth-avatar" id="headerUserAvatar">🥋</span>
                <div>
                    <div style="display:flex; align-items:center; gap:4px;">
                        <span class="auth-name-title" id="headerUserName">Ferit</span>
                        <span class="auth-role-tag role-admin" id="headerUserRoleBadge">YÖNETİCİ</span>
                    </div>
                    <div style="font-size:11px; color:var(--text-secondary);" id="headerUserSub">🎯 Profil & Özel Kilolarım</div>
                </div>
            </div>

            <div class="auth-actions">
                <button class="btn-auth-action" id="btnAdminPanel" onclick="openAdminModal()" style="display:none;">
                    👑 Sporcular
                </button>
                <button class="btn-auth-action btn-logout" onclick="handleAuthLogout()" title="Oturumu Kapat">
                    🚪 Çıkış
                </button>
            </div>
        </div>"""

content = content.replace(old_header_card, new_header_card)

# 4. Add Admin Panel Modal
admin_modal_html = """
    <!-- ADMIN MANAGEMENT MODAL -->
    <div id="adminModal" class="modal-overlay">
        <div class="modal-box" style="max-width: 520px;">
            <div class="modal-header">
                <span class="modal-title">👑 Sporcu Yönetim Portalı (Admin)</span>
                <button class="modal-close" onclick="closeAdminModal()">✕</button>
            </div>

            <!-- ADD NEW USER SECTION -->
            <div class="log-form-card" style="border-color:var(--gold); margin-bottom:16px;">
                <h3 style="font-size:13.5px; font-weight:800; color:var(--gold); margin-bottom:10px;">➕ Yeni Sporcu / Kullanıcı Oluştur</h3>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                    <div>
                        <label class="form-label">Kullanıcı Adı (Giriş için)</label>
                        <input type="text" id="newUsername" class="form-input" placeholder="Örn: ahmet" autocapitalize="none">
                    </div>
                    <div>
                        <label class="form-label">Şifre</label>
                        <input type="text" id="newPassword" class="form-input" placeholder="Örn: 123456" value="123456">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:10px;" class="form-group">
                    <div>
                        <label class="form-label">Sporcu Adı Soyadı</label>
                        <input type="text" id="newDisplayName" class="form-input" placeholder="Örn: Ahmet Yılmaz">
                    </div>
                    <div>
                        <label class="form-label">Yetki Rolü</label>
                        <select id="newRole" class="form-select">
                            <option value="athlete">Sporcu</option>
                            <option value="admin">Yönetici (Admin)</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                    <div>
                        <label class="form-label">Seviye</label>
                        <select id="newLevel" class="form-select">
                            <option value="Başlangıç">Başlangıç (0-6 Ay)</option>
                            <option value="Orta Seviye" selected>Orta Seviye (6-18 Ay)</option>
                            <option value="İleri Seviye">İleri Seviye (18+ Ay)</option>
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
                    <label class="form-label">Avatar / İkon</label>
                    <div class="avatar-picker-grid" id="newAvatarPicker">
                        <div class="avatar-choice selected" onclick="selectNewAvatar('🥋')">🥋</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🦁')">🦁</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('⚡')">⚡</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🛡️')">🛡️</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🦅')">🦅</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🐺')">🐺</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('👑')">👑</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🔥')">🔥</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🏋️‍♂️')">🏋️‍♂️</div>
                        <div class="avatar-choice" onclick="selectNewAvatar('🏋️‍♀️')">🏋️‍♀️</div>
                    </div>
                </div>

                <button class="btn btn-gold" style="width:100%; padding:12px; font-weight:800;" onclick="handleCreateUser()">
                    ➕ KULLANICIYI OLUŞTUR VE KAYDET
                </button>
            </div>

            <!-- EXISTING ATHLETES LIST -->
            <h3 style="font-size:13.5px; font-weight:800; color:#fff; margin-bottom:10px;">📋 Kayıtlı Sporcular ve İstatistikler</h3>
            <div id="adminUserListContainer">
                <!-- Dynamically populated -->
            </div>
        </div>
    </div>
"""

if '<!-- ADMIN MANAGEMENT MODAL -->' not in content:
    content = content.replace('<!-- USER SWITCH MODAL -->', admin_modal_html + '\n    <!-- USER SWITCH MODAL -->')

# 5. Add Authentication & Admin JavaScript Engine
auth_js = """
        // ==================== AUTH & ADMIN ENGINE ====================
        let currentSession = null;
        let selectedNewAvatar = '🥋';

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
            }
            syncAppViewState();
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

                // Check Admin button
                const btnAdmin = document.getElementById('btnAdminPanel');
                if (btnAdmin) {
                    btnAdmin.style.display = session.role === 'admin' ? 'flex' : 'none';
                }

                // Check Role badge
                const roleBadge = document.getElementById('headerUserRoleBadge');
                if (roleBadge) {
                    roleBadge.innerText = session.role === 'admin' ? 'YÖNETİCİ' : 'SPORCU';
                    roleBadge.className = 'auth-role-tag ' + (session.role === 'admin' ? 'role-admin' : 'role-athlete');
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
                                <button class="btn btn-outline" style="font-size:10px; padding:4px 8px; color:var(--gold);" onclick="adminSwitchToUser('${u.id}')" title="Bu kullanıcının gözünden siteyi gör">
                                    ${isSelf ? 'Aktif' : 'Gözlemle'}
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

        // Bridge getActiveUserId and getActiveUser with auth database
        function getActiveUserId() {
            const session = getSession();
            return session ? session.userId : 'usr_admin';
        }

        function getActiveUser() {
            const uid = getActiveUserId();
            const users = getAuthUsers();
            return users.find(u => u.id === uid) || users[0];
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

            applyActiveUserProfile();
            playAlertSound();
            alert("✅ Profiliniz ve çalışma kilolarınız başarıyla güncellendi!");
        }
"""

# Replace multiuser engine with unified auth engine
content = content.replace('applyActiveUserProfile();\n        renderHistory();', 'initAuthDatabase();\n        syncAppViewState();\n        renderHistory();')

content = content.replace("""        function getUsers() {
            try {
                const raw = localStorage.getItem('celik_kodu_users');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch(e) {}
            // Default first user
            const defaultUser = {
                id: 'user_default',
                name: 'Ferit',
                avatar: '🥋',
                theme: 'gold',
                level: 'İleri Seviye',
                gender: 'Erkek',
                weights: {
                    press: '16',
                    squat: '22',
                    row: '20',
                    rdl: '22',
                    swing: '18',
                    lunge: '14'
                },
                createdAt: Date.now()
            };
            localStorage.setItem('celik_kodu_users', JSON.stringify([defaultUser]));
            return [defaultUser];
        }

        function saveUsers(users) {
            localStorage.setItem('celik_kodu_users', JSON.stringify(users));
        }""", "")

# Prepend auth_js to multiuser section
content = content.replace('// ==================== MULTI-USER PROFILE & STATE ENGINE ====================', '// ==================== MULTI-USER PROFILE & STATE ENGINE ====================\n' + auth_js)

with open(INDEX_FILE, "w", encoding="utf-8") as f:
    f.write(content)

with open(MOBIL_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Auth & Admin engine built successfully!")
