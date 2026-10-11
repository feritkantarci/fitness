#!/usr/bin/env python3
import re
import os

INDEX_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/index.html"
MOBIL_FILE = "/Users/mrkantarci/Desktop/AI PROJELERI/FITNESS/salon_kilavuzu_mobil.html"

with open(INDEX_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Multi-User CSS
multiuser_css = """
        /* ==================== MULTI-USER SYSTEM CSS ==================== */
        .user-profile-header-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(19, 28, 46, 0.85);
            backdrop-filter: blur(10px);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 8px 12px;
            margin-bottom: 12px;
            max-width: 720px;
            margin-left: auto;
            margin-right: auto;
        }
        .user-profile-info {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            text-align: left;
        }
        .user-avatar-badge {
            font-size: 26px;
            background: var(--bg-elevated);
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            border: 1.5px solid var(--gold);
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.25);
            flex-shrink: 0;
        }
        .user-meta {
            display: flex;
            flex-direction: column;
        }
        .user-title-row {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .user-display-name {
            font-size: 14.5px;
            font-weight: 800;
            color: #fff;
            letter-spacing: 0.3px;
        }
        .user-level-tag {
            font-size: 9.5px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 4px;
            background: rgba(245, 158, 11, 0.15);
            color: var(--gold);
            border: 1px solid var(--gold);
            text-transform: uppercase;
        }
        .user-subtext {
            font-size: 11px;
            color: var(--text-secondary);
        }
        .btn-switch-user {
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
            transition: all 0.2s;
        }
        .btn-switch-user:hover {
            border-color: var(--gold);
            color: #fff;
            background: rgba(245, 158, 11, 0.12);
        }

        /* MODAL STYLES */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(4, 7, 13, 0.85);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        .modal-overlay.active {
            display: flex;
        }
        .modal-box {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            max-width: 480px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            position: relative;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border);
        }
        .modal-title {
            font-size: 16px;
            font-weight: 800;
            color: var(--gold);
        }
        .modal-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
        }
        .user-cards-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-bottom: 16px;
        }
        .user-select-card {
            background: var(--bg-elevated);
            border: 1.5px solid var(--border);
            border-radius: 12px;
            padding: 12px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .user-select-card.active-user {
            border-color: var(--gold);
            background: rgba(245, 158, 11, 0.08);
            box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
        }
        .user-select-card:hover {
            border-color: var(--gold);
        }
        .avatar-picker-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 12px;
        }
        .avatar-choice {
            font-size: 24px;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.15s;
        }
        .avatar-choice.selected {
            border-color: var(--gold);
            background: rgba(245, 158, 11, 0.2);
            transform: scale(1.08);
        }
        .theme-picker-grid {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }
        .theme-pill {
            flex: 1;
            padding: 8px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            text-align: center;
            cursor: pointer;
            border: 1.5px solid transparent;
            color: #fff;
        }
        .theme-pill.selected {
            border-color: #fff;
            box-shadow: 0 0 10px rgba(255,255,255,0.4);
        }
        .target-weight-badge {
            display: inline-block;
            background: rgba(245, 158, 11, 0.15);
            color: var(--gold-light);
            border: 1px solid var(--gold);
            font-size: 10px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 4px;
            margin-left: 6px;
        }
"""

if '/* ==================== MULTI-USER SYSTEM CSS ==================== */' not in content:
    content = content.replace('/* WORKOUT TRACKER & STATS */', multiuser_css + '\n        /* WORKOUT TRACKER & STATS */')

# 2. Add Top Athlete Bar in <header>
header_user_bar = """
        <!-- TOP ATHLETE BAR -->
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
        </div>
"""

if '<!-- TOP ATHLETE BAR -->' not in content:
    content = content.replace('<header class="header">', '<header class="header">\n' + header_user_bar)

# 3. Update tab bar with 6 buttons including "⚙️ PROFİLİM"
old_nav = """    <nav class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('day1')">🔴 GÜN 1</button>
        <button class="tab-btn" onclick="switchTab('day2')">🔵 GÜN 2</button>
        <button class="tab-btn" onclick="switchTab('day3')">🟡 GÜN 3</button>
        <button class="tab-btn" onclick="switchTab('trackerTab')">📊 GÜNLÜK & TAKİP</button>
        <button class="tab-btn" onclick="switchTab('info')">ℹ️ REHBER</button>
    </nav>"""

new_nav = """    <nav class="tab-bar">
        <button class="tab-btn active" onclick="switchTab('day1')">🔴 GÜN 1</button>
        <button class="tab-btn" onclick="switchTab('day2')">🔵 GÜN 2</button>
        <button class="tab-btn" onclick="switchTab('day3')">🟡 GÜN 3</button>
        <button class="tab-btn" onclick="switchTab('trackerTab')">📊 GÜNLÜK</button>
        <button class="tab-btn" onclick="switchTab('profileTab')">⚙️ PROFİLİM</button>
        <button class="tab-btn" onclick="switchTab('info')">ℹ️ REHBER</button>
    </nav>"""

content = content.replace(old_nav, new_nav)

# 4. Add Profile Tab HTML before info tab
profile_tab_html = """
        <!-- ==================== TAB 5: PROFİLİM & ÖZELLEŞTİRME ==================== -->
        <div id="profileTab" class="tab-content">
            <div class="log-form-card" style="border-color:var(--gold);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:36px; background:var(--bg-elevated); width:54px; height:54px; display:flex; align-items:center; justify-content:center; border-radius:12px; border:2px solid var(--gold);" id="profileCardAvatar">🥋</span>
                        <div>
                            <h2 style="font-size:17px; font-weight:800; color:#fff;" id="profileCardName">Ferit</h2>
                            <p style="font-size:11.5px; color:var(--text-secondary);" id="profileCardMeta">Kişisel Sporcu Sayfası & Ağırlık Özelleştirmesi</p>
                        </div>
                    </div>
                    <button class="btn btn-outline" style="font-size:11px; padding:6px 10px;" onclick="openUserModal()">👥 Değiştir</button>
                </div>
            </div>

            <!-- CUSTOMIZATION SETTINGS FORM -->
            <div class="log-form-card">
                <h3 style="font-size:14px; font-weight:800; color:var(--gold); margin-bottom:12px;">🎨 Profil ve Arayüz Özelleştirme</h3>

                <div class="form-group">
                    <label class="form-label">Sporcu Adı / Rumuz</label>
                    <input type="text" id="editUserName" class="form-input" placeholder="Adınız">
                </div>

                <div class="form-group">
                    <label class="form-label">Avatar / İkon Seç</label>
                    <div class="avatar-picker-grid" id="avatarPicker">
                        <div class="avatar-choice" onclick="selectAvatar('🥋')">🥋</div>
                        <div class="avatar-choice" onclick="selectAvatar('🦁')">🦁</div>
                        <div class="avatar-choice" onclick="selectAvatar('⚡')">⚡</div>
                        <div class="avatar-choice" onclick="selectAvatar('🛡️')">🛡️</div>
                        <div class="avatar-choice" onclick="selectAvatar('🦅')">🦅</div>
                        <div class="avatar-choice" onclick="selectAvatar('🐺')">🐺</div>
                        <div class="avatar-choice" onclick="selectAvatar('👑')">👑</div>
                        <div class="avatar-choice" onclick="selectAvatar('🔥')">🔥</div>
                        <div class="avatar-choice" onclick="selectAvatar('🏋️‍♂️')">🏋️‍♂️</div>
                        <div class="avatar-choice" onclick="selectAvatar('🏋️‍♀️')">🏋️‍♀️</div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Arayüz Tema Rengi (Kişisel Atmosfer)</label>
                    <div class="theme-picker-grid" id="themePicker">
                        <div class="theme-pill" style="background:#f59e0b;" onclick="selectTheme('gold')">Altın Çelik</div>
                        <div class="theme-pill" style="background:#0284c7;" onclick="selectTheme('cyan')">Siber Mavi</div>
                        <div class="theme-pill" style="background:#059669;" onclick="selectTheme('green')">Zümrüt Zırh</div>
                        <div class="theme-pill" style="background:#e11d48;" onclick="selectTheme('red')">Lav Kırmızı</div>
                        <div class="theme-pill" style="background:#7c3aed;" onclick="selectTheme('purple')">Gladyatör Mor</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;" class="form-group">
                    <div>
                        <label class="form-label">Seviye</label>
                        <select id="editUserLevel" class="form-select">
                            <option value="Başlangıç">Başlangıç (0-6 Ay)</option>
                            <option value="Orta Seviye">Orta Seviye (6-18 Ay)</option>
                            <option value="İleri Seviye">İleri Seviye (18+ Ay)</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Cinsiyet</label>
                        <select id="editUserGender" class="form-select">
                            <option value="Erkek">Erkek</option>
                            <option value="Kadın">Kadın</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- CUSTOM WEIGHT TARGETS -->
            <div class="log-form-card">
                <h3 style="font-size:14px; font-weight:800; color:var(--gold); margin-bottom:6px;">⚖️ Kişisel Dambıl Çalışma Ağırlıklarım (KG)</h3>
                <p style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
                    Buraya girdiğiniz ağırlıklar, ana antrenman ekranındaki hareket kartlarının üzerine <strong>"🎯 Hedef Kilon: X kg"</strong> olarak otomatik yansır.
                </p>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="form-group">
                        <label class="form-label">Omuz Presi (Çift Dambıl)</label>
                        <input type="number" id="w_press" class="form-input" placeholder="Örn: 16">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Goblet Squat</label>
                        <input type="number" id="w_squat" class="form-input" placeholder="Örn: 22">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Testere Çekiş (Row)</label>
                        <input type="number" id="w_row" class="form-input" placeholder="Örn: 20">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Romanian Deadlift (RDL)</label>
                        <input type="number" id="w_rdl" class="form-input" placeholder="Örn: 22">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Dambıl Swing</label>
                        <input type="number" id="w_swing" class="form-input" placeholder="Örn: 18">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Yürüyen Lunge</label>
                        <input type="number" id="w_lunge" class="form-input" placeholder="Örn: 14">
                    </div>
                </div>

                <button class="btn btn-gold" style="width:100%; padding:14px; font-weight:800; margin-top:10px;" onclick="saveCurrentProfile()">
                    💾 PROFİLİMİ VE KİLOLARIMI KAYDET
                </button>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; margin-bottom:30px;">
                <button class="btn btn-outline" style="font-size:11px; border-color:#38bdf8; color:#38bdf8;" onclick="addNewUserPrompt()">
                    ➕ Yeni Sporcu Profili Ekle
                </button>
                <button class="btn btn-outline" style="font-size:11px; border-color:#ef4444; color:#ef4444;" onclick="deleteCurrentProfile()">
                    🗑️ Bu Profili Sil
                </button>
            </div>
        </div>
"""

if '<div id="profileTab"' not in content:
    content = content.replace('        <!-- ==================== TAB 4: PERİYODİZASYON & KİLO ==================== -->', profile_tab_html + '\n        <!-- ==================== TAB 4: PERİYODİZASYON & KİLO ==================== -->')

# 5. Add User Switch Modal at bottom of body
user_modal_html = """
    <!-- USER SWITCH MODAL -->
    <div id="userModal" class="modal-overlay">
        <div class="modal-box">
            <div class="modal-header">
                <span class="modal-title">👥 Sporcu Seçimi & Yönetimi</span>
                <button class="modal-close" onclick="closeUserModal()">✕</button>
            </div>
            
            <p style="font-size:11.5px; color:var(--text-secondary); margin-bottom:14px;">
                Bu cihazda birden fazla sporcu kendi kayıtlarını, kilolarını ve antrenman geçmişini ayrı ayrı tutabilir:
            </p>

            <div class="user-cards-grid" id="userListContainer">
                <!-- Dynamically generated -->
            </div>

            <button class="btn btn-gold" style="width:100%; padding:12px; font-weight:800; margin-top:6px;" onclick="addNewUserPrompt()">
                ➕ YENİ SPORCU EKLE
            </button>
        </div>
    </div>
"""

if '<!-- USER SWITCH MODAL -->' not in content:
    content = content.replace('    </main>', '    </main>\n' + user_modal_html)

# 6. Add Multi-User Engine JS
multiuser_js = """
        // ==================== MULTI-USER PROFILE & STATE ENGINE ====================
        const THEMES = {
            gold: { gold: '#f59e0b', goldLight: '#fde68a', shadow: 'rgba(245, 158, 11, 0.25)' },
            cyan: { gold: '#38bdf8', goldLight: '#bae6fd', shadow: 'rgba(56, 189, 248, 0.25)' },
            green: { gold: '#10b981', goldLight: '#a7f3d0', shadow: 'rgba(16, 185, 129, 0.25)' },
            red: { gold: '#f43f5e', goldLight: '#fecdd3', shadow: 'rgba(244, 63, 94, 0.25)' },
            purple: { gold: '#a855f7', goldLight: '#e9d5ff', shadow: 'rgba(168, 85, 247, 0.25)' }
        };

        let selectedAvatar = '🥋';
        let selectedTheme = 'gold';

        function getUsers() {
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
        }

        function getActiveUserId() {
            let id = localStorage.getItem('celik_kodu_active_user_id');
            const users = getUsers();
            if (!id || !users.some(u => u.id === id)) {
                id = users[0].id;
                localStorage.setItem('celik_kodu_active_user_id', id);
            }
            return id;
        }

        function getActiveUser() {
            const id = getActiveUserId();
            const users = getUsers();
            return users.find(u => u.id === id) || users[0];
        }

        function setActiveUser(userId) {
            localStorage.setItem('celik_kodu_active_user_id', userId);
            applyActiveUserProfile();
            closeUserModal();
        }

        function applyTheme(themeKey) {
            const theme = THEMES[themeKey] || THEMES.gold;
            document.documentElement.style.setProperty('--gold', theme.gold);
            document.documentElement.style.setProperty('--gold-light', theme.goldLight);
        }

        function selectAvatar(avatar) {
            selectedAvatar = avatar;
            document.querySelectorAll('.avatar-choice').forEach(el => {
                el.classList.toggle('selected', el.innerText.trim() === avatar);
            });
        }

        function selectTheme(themeKey) {
            selectedTheme = themeKey;
            document.querySelectorAll('.theme-pill').forEach(el => {
                const isSelected = el.getAttribute('onclick').includes(themeKey);
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
            const headerLevel = document.getElementById('headerUserLevel');
            if (headerLevel) headerLevel.innerText = escapeHTML(user.level || 'Orta Seviye');
            const headerSub = document.getElementById('headerUserSub');
            if (headerSub) headerSub.innerText = `${user.avatar || '🥋'} ${user.name} • Kişisel Sporcu Alanı`;

            // Profile card in Tab 5
            const cardAvatar = document.getElementById('profileCardAvatar');
            if (cardAvatar) cardAvatar.innerText = user.avatar || '🥋';
            const cardName = document.getElementById('profileCardName');
            if (cardName) cardName.innerText = escapeHTML(user.name);
            const cardMeta = document.getElementById('profileCardMeta');
            if (cardMeta) cardMeta.innerText = `${user.level} (${user.gender}) • Özel Kilo Programı`;

            // Inputs in Tab 5
            const nameInput = document.getElementById('editUserName');
            if (nameInput) nameInput.value = user.name;
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

            const users = getUsers();
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) users[idx] = user;
            saveUsers(users);

            applyActiveUserProfile();
            playAlertSound();
            alert("✅ Profiliniz ve çalışma kilolarınız başarıyla güncellendi!");
        }

        function addNewUserPrompt() {
            const name = prompt("Yeni Sporcunun Adı:");
            if (!name || !name.trim()) return;

            const newUser = {
                id: 'user_' + Date.now(),
                name: name.trim(),
                avatar: '🦁',
                theme: 'cyan',
                level: 'Orta Seviye',
                gender: 'Erkek',
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

            const users = getUsers();
            users.push(newUser);
            saveUsers(users);
            setActiveUser(newUser.id);
            alert(`🎉 Hoş geldin ${name}! Yeni sporcu alanın hazırlandı.`);
        }

        function deleteCurrentProfile() {
            const users = getUsers();
            if (users.length <= 1) {
                alert("⚠️ Sistemde en az bir sporcu profili kalmalıdır!");
                return;
            }
            const user = getActiveUser();
            if (confirm(`${user.name} profilini ve tüm antrenman geçmişini silmek istediğinize emin misiniz?`)) {
                // Delete user's isolated storage
                localStorage.removeItem(`celik_kodu_history_${user.id}`);
                localStorage.removeItem(`celik_kodu_workout_state_${user.id}`);

                const updated = users.filter(u => u.id !== user.id);
                saveUsers(updated);
                setActiveUser(updated[0].id);
                alert("Profil silindi.");
            }
        }

        function openUserModal() {
            const modal = document.getElementById('userModal');
            const container = document.getElementById('userListContainer');
            if (!modal || !container) return;

            const users = getUsers();
            const activeId = getActiveUserId();

            container.innerHTML = users.map(u => {
                const isActive = u.id === activeId;
                const logs = getUserLogsById(u.id);
                const streak = calculateStreakForLogs(logs);

                return `
                    <div class="user-select-card ${isActive ? 'active-user' : ''}" onclick="setActiveUser('${u.id}')">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-size:28px; background:var(--bg-card); width:46px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:10px; border:1px solid ${isActive ? 'var(--gold)' : 'var(--border)'};">${u.avatar || '🥋'}</span>
                            <div>
                                <div style="font-size:14px; font-weight:800; color:#fff;">
                                    ${escapeHTML(u.name)} ${isActive ? '<span style="color:var(--gold); font-size:11px;">(Aktif)</span>' : ''}
                                </div>
                                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                                    ${u.level} • Toplam: ${logs.length} Seans • Seri: ${streak} Gün
                                </div>
                            </div>
                        </div>
                        <button class="btn ${isActive ? 'btn-gold' : 'btn-outline'}" style="font-size:11px; padding:6px 12px;">
                            ${isActive ? 'Seçili' : 'Seç'}
                        </button>
                    </div>
                `;
            }).join('');

            modal.classList.add('active');
        }

        function closeUserModal() {
            const modal = document.getElementById('userModal');
            if (modal) modal.classList.remove('active');
        }

        function getUserLogsById(userId) {
            try {
                // If default user, also migrate legacy key if present
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
"""

if '/* ==================== MULTI-USER PROFILE & STATE ENGINE ==================== */' not in content:
    content = content.replace('// ==================== WORKOUT TRACKER & HISTORY ENGINE (SECURED) ====================', multiuser_js + '\n        // ==================== WORKOUT TRACKER & HISTORY ENGINE (SECURED) ====================\n')

# 7. Update getWorkoutLogs / setWorkoutLogs and loadTrackerState / saveTrackerState to be USER-SCOPED!
old_storage_fns = """        function getWorkoutLogs() {
            try {
                const raw = localStorage.getItem('celik_kodu_history');
                if (!raw) return [];
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            } catch(e) {
                return [];
            }
        }

        function setWorkoutLogs(logs) {
            localStorage.setItem('celik_kodu_history', JSON.stringify(logs));
            renderHistory();
        }"""

new_storage_fns = """        function getWorkoutLogs() {
            const uid = getActiveUserId();
            return getUserLogsById(uid);
        }

        function setWorkoutLogs(logs) {
            const uid = getActiveUserId();
            localStorage.setItem(`celik_kodu_history_${uid}`, JSON.stringify(logs));
            renderHistory();
        }"""

content = content.replace(old_storage_fns, new_storage_fns)

old_tracker_state = """        function saveTrackerState() {
            const state = {};
            document.querySelectorAll('.set-tracker').forEach(tracker => {
                const ex = tracker.dataset.exercise;
                const checked = [];
                tracker.querySelectorAll('input[type="checkbox"]').forEach((cb, idx) => {
                    if (cb.checked) checked.push(idx);
                });
                state[ex] = checked;
            });
            localStorage.setItem('celik_kodu_workout_state', JSON.stringify(state));
        }

        function loadTrackerState() {
            try {
                const saved = localStorage.getItem('celik_kodu_workout_state');
                if (!saved) return;
                const state = JSON.parse(saved);
                document.querySelectorAll('.set-tracker').forEach(tracker => {
                    const ex = tracker.dataset.exercise;
                    if (state[ex]) {
                        tracker.querySelectorAll('.set-pill').forEach((pill, idx) => {
                            const cb = pill.querySelector('input');
                            if (state[ex].includes(idx)) {
                                cb.checked = true;
                                pill.classList.add('done');
                            }
                        });
                    }
                });
            } catch(e) {}
        }"""

new_tracker_state = """        function saveTrackerState() {
            const uid = getActiveUserId();
            const state = {};
            document.querySelectorAll('.set-tracker').forEach(tracker => {
                const ex = tracker.dataset.exercise;
                const checked = [];
                tracker.querySelectorAll('input[type="checkbox"]').forEach((cb, idx) => {
                    if (cb.checked) checked.push(idx);
                });
                state[ex] = checked;
            });
            localStorage.setItem(`celik_kodu_workout_state_${uid}`, JSON.stringify(state));
        }

        function loadTrackerState() {
            try {
                const uid = getActiveUserId();
                // Clear all checkboxes first
                document.querySelectorAll('.set-pill').forEach(pill => {
                    pill.classList.remove('done');
                    const cb = pill.querySelector('input');
                    if (cb) cb.checked = false;
                });

                const saved = localStorage.getItem(`celik_kodu_workout_state_${uid}`);
                if (!saved) return;
                const state = JSON.parse(saved);
                document.querySelectorAll('.set-tracker').forEach(tracker => {
                    const ex = tracker.dataset.exercise;
                    if (state[ex]) {
                        tracker.querySelectorAll('.set-pill').forEach((pill, idx) => {
                            const cb = pill.querySelector('input');
                            if (state[ex].includes(idx)) {
                                cb.checked = true;
                                pill.classList.add('done');
                            }
                        });
                    }
                });
            } catch(e) {}
        }"""

content = content.replace(old_tracker_state, new_tracker_state)

# 8. Call applyActiveUserProfile at startup
old_init = "renderHistory();"
new_init = "applyActiveUserProfile();\n        renderHistory();"
content = content.replace(old_init, new_init, 1)

with open(INDEX_FILE, "w", encoding="utf-8") as f:
    f.write(content)

with open(MOBIL_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Multi-user architecture injected successfully!")
