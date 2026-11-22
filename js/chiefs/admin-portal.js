// ==================== ODA 6 EK MODÜLÜ: İZOLE YÖNETİCİ PORTALI (ADMIN ONLY) ====================
(function (global) {
    'use strict';

    const ADMIN_DOM_IDS = [
        'adminModal',
        'approvalEmailDispatchModal',
        'profileTabAdminBtn',
        'headerAdminTelemetryBtn',
        'btnAdminPanelPopup',
        'sheetAdminBtn'
    ];

    let adminTelemetryFilterGate = 'ALL';
    let adminTelemetryFilterSeverity = 'ALL';
    let lastApprovalMessageCache = '';
    let _lastAdminUsersSyncAt = 0;

    function getFbHandles() {
        if (typeof global.__celikGetFirebaseHandles === 'function') {
            return global.__celikGetFirebaseHandles();
        }
        return {
            fbDb: typeof fbDb !== 'undefined' ? fbDb : null,
            fbAuth: typeof fbAuth !== 'undefined' ? fbAuth : null,
            secondaryFbApp: typeof secondaryFbApp !== 'undefined' ? secondaryFbApp : null,
            isFirebaseReady: typeof isFirebaseReady !== 'undefined' ? isFirebaseReady : false,
            IS_LOCAL_DEV: typeof IS_LOCAL_DEV !== 'undefined' ? IS_LOCAL_DEV : false
        };
    }

    function esc(v) {
        if (typeof global.escapeHTML === 'function') return global.escapeHTML(v);
        if (typeof escapeHTML === 'function') return escapeHTML(v);
        return String(v || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function cleanAvatar(av, fallback = 'SP') {
        if (typeof global.sanitizeAvatarMonogram === 'function') return global.sanitizeAvatarMonogram(av, fallback);
        const s = String(av || '').trim();
        if (!s || /\p{Extended_Pictographic}/u.test(s)) return fallback;
        return s.slice(0, 4);
    }

    function isAuthorizedForAdminPortal() {
        if (typeof isVerifiedAdminSession === 'function') {
            return Boolean(isVerifiedAdminSession());
        }
        if (typeof global.isVerifiedAdminSession === 'function') {
            return Boolean(global.isVerifiedAdminSession());
        }
        return false;
    }

    function buildAdminModalsHtml() {
        return `
    <!-- ==================== ADMIN MANAGEMENT MODAL ==================== -->
    <div id="adminModal" class="modal-overlay">
        <div class="modal-box" style="max-width: 600px; width: 95%;">
            <div class="modal-header">
                <span class="modal-title">Sporcu Yönetim Portalı (Admin)</span>
                <button type="button" class="modal-close" aria-label="Kapat" onclick="closeAdminModal()">✕</button>
            </div>

            <!-- ADMIN NAVIGATION TABS -->
            <div style="display:flex; gap:6px; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                <button id="adminTabBtnStatus" class="btn btn-gold" style="flex:1; font-size:11.5px; padding:9px 8px; font-weight:800; white-space:nowrap;" onclick="switchAdminModalTab('status')">
                    Durumlar
                </button>
                <button id="adminTabBtnManage" class="btn btn-outline" style="flex:1; font-size:11.5px; padding:9px 8px; font-weight:800; color:var(--text-secondary); white-space:nowrap;" onclick="switchAdminModalTab('manage')">
                    Hesaplar <span id="adminManagePendingBadge" style="display:none; background:#f59e0b; color:#090d16; font-size:10px; font-weight:900; padding:1px 6px; border-radius:99px; margin-left:3px;">0</span>
                </button>
                <button id="adminTabBtnTelemetry" class="btn btn-outline" style="flex:1.15; font-size:11.5px; padding:9px 8px; font-weight:800; color:var(--text-secondary); white-space:nowrap;" onclick="switchAdminModalTab('telemetry')">
                    Sistem İzleme <span id="adminTelemetryTabBadge" style="display:none; background:#DC2626; color:#FFFFFF; font-size:10px; font-weight:900; padding:1px 6px; border-radius:99px; margin-left:3px;">0</span>
                </button>
            </div>

            <!-- PENDING APPROVALS BANNER (ONAY BEKLEYEN KAYIT BAŞVURULARI) -->
            <div id="adminPendingApprovalsSection" style="display:none; background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.45); border-radius:12px; padding:12px 14px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin:0;">Onay Bekleyen Kayıt Başvuruları</h3>
                    <span id="adminPendingCountLabel" style="font-size:10.5px; font-weight:800; color:#fde68a;">0 Başvuru</span>
                </div>
                <div id="adminPendingApprovalsList" style="display:flex; flex-direction:column; gap:8px;"></div>
            </div>

            <!-- TAB 1: SPORCU ÇALIŞMA DURUMLARI (ÖZET PANELİ) -->
            <div id="adminViewStatus">
                <!-- TOP KPI BAR -->
                <div id="adminSummaryKpis" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:14px;"></div>

                <!-- ATHLETES LIVE CARDS -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="font-size:13px; font-weight:800; color:#FFFFFF; margin:0;">Sporcuların Antrenman &amp; Kilo Durumları</h3>
                    <span style="font-size:10.5px; color:var(--text-secondary);">Hesap değiştirmeden canlı teftiş</span>
                </div>
                <div id="adminAthleteStatusContainer"></div>
            </div>

            <!-- TAB 2: SPORCU HESAP YÖNETİMİ -->
            <div id="adminViewManage" style="display:none;">
                <!-- ADD NEW USER SECTION -->
                <div style="background:var(--bg-surface); border:1px solid var(--gold); border-radius:10px; padding:14px; margin-bottom:16px;">
                    <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin-bottom:10px;">Yeni Sporcu Oluştur (Doğrudan Onaylı)</h3>

                    <div style="display:grid; grid-template-columns: 1fr 1.35fr; gap:8px;" class="form-group">
                        <div>
                            <label class="form-label" for="newUsername">Kullanıcı Adı</label>
                            <input type="text" id="newUsername" class="form-input" placeholder="Örn: ahmet" autocapitalize="none">
                        </div>
                        <div>
                            <label class="form-label" for="newPassword">Şifre (En az 8 karakter)</label>
                            <div style="display:flex; gap:6px; align-items:center;">
                                <input type="text" id="newPassword" class="form-input" value="" placeholder="En az 8 karakter, Harf+Rakam" minlength="8" autocomplete="new-password" style="flex:1; min-width:0;">
                                <button type="button" id="btnGenAdminPassword" class="btn btn-outline" style="padding:7px 9px; font-size:10.5px; font-weight:800; white-space:nowrap; border-color:rgba(167,139,250,0.45); color:#E2E8F0;" onclick="generateStrongPasswordForAdmin()">Güçlü Şifre Üret</button>
                            </div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:8px;" class="form-group">
                        <div>
                            <label class="form-label" for="newDisplayName">Ad Soyad</label>
                            <input type="text" id="newDisplayName" class="form-input" placeholder="Örn: Ahmet Yılmaz">
                        </div>
                        <div>
                            <label class="form-label" for="newRole">Rol</label>
                            <select id="newRole" class="form-select">
                                <option value="athlete">Sporcu</option>
                                <option value="admin">Yönetici (Admin)</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="newEmail">E-Posta Adresi (Opsiyonel)</label>
                        <input type="email" id="newEmail" class="form-input" placeholder="ornek@gmail.com" autocapitalize="none">
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;" class="form-group">
                        <div>
                            <label class="form-label" for="newLevel">Seviye</label>
                            <select id="newLevel" class="form-select">
                                <option value="Başlangıç">Başlangıç</option>
                                <option value="Orta Seviye" selected>Orta Seviye</option>
                                <option value="İleri Seviye">İleri Seviye</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label" for="newGender">Cinsiyet</label>
                            <select id="newGender" class="form-select">
                                <option value="Erkek">Erkek</option>
                                <option value="Kadın">Kadın</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Avatar</label>
                        <div class="avatar-picker-grid" id="newAvatarPicker">
                            <div class="avatar-choice selected" onclick="selectNewAvatar('SP')">SP</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('AT')">AT</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('GZ')">GZ</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('KL')">KL</div>
                            <div class="avatar-choice" onclick="selectNewAvatar('DM')">DM</div>
                        </div>
                    </div>

                    <button type="button" class="btn btn-gold" style="width:100%; padding:10px; font-weight:800;" onclick="handleCreateUser()">
                        KULLANICIYI KAYDET
                    </button>
                </div>

                <!-- COLLAPSIBLE EMAILJS / WEBHOOK AUTO-EMAIL SETTINGS -->
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleAdminEmailConfigAccordion()">
                        <span style="font-size:12px; font-weight:800; color:#FFFFFF;">Otomatik E-Posta Servisi Ayarları (EmailJS)</span>
                        <span id="adminEmailConfigToggleLabel" style="font-size:11px; color:var(--cyan); font-weight:700;">▼ Göster</span>
                    </div>
                    <div id="adminEmailConfigBody" style="display:none; margin-top:10px; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1); font-size:11.5px;">
                        <p style="color:var(--text-secondary); margin:0 0 8px; line-height:1.4;">
                            Onay verdiğinizde mailin arka planda <strong>hiçbir pencere açılmadan otomatik</strong> gitmesi için ücretsiz <a href="https://dashboard.emailjs.com" target="_blank" rel="noopener noreferrer" style="color:var(--cyan);">EmailJS</a> bilgilerinizi girebilirsiniz. Boş bırakırsanız onay anında hazır mail gönderim ekranı açılır.
                        </p>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:8px;">
                            <input type="text" id="emailJsServiceId" class="form-input" placeholder="Service ID (service_...)" style="font-size:11px; padding:6px 8px;">
                            <input type="text" id="emailJsTemplateId" class="form-input" placeholder="Template ID (template_...)" style="font-size:11px; padding:6px 8px;">
                            <input type="text" id="emailJsPublicKey" class="form-input" placeholder="Public Key" style="font-size:11px; padding:6px 8px;">
                        </div>
                        <button type="button" class="btn btn-outline" style="width:100%; font-size:11px; padding:7px; border-color:var(--gold); color:var(--gold); font-weight:800;" onclick="saveAdminEmailJsConfig()">
                            Otomatik Mail Ayarlarını Kaydet
                        </button>
                    </div>
                </div>

                <!-- ATHLETES LIST -->
                <h3 style="font-size:13px; font-weight:800; color:#FFFFFF; margin-bottom:10px;">Kayıtlı Sporcu Hesapları</h3>
                <div id="adminUserListContainer"></div>
            </div>

            <!-- TAB 3: SİSTEM İZLEME (4 KAPILI KARA KUTU) -->
            <div id="adminViewTelemetry" style="display:none;">
                <div id="adminTelemetryKpis" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:12px;"></div>
                <div id="adminCloudSubChiefCard" style="margin-bottom:12px;"></div>

                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                    <button type="button" id="adminTelGateBtn_ALL" onclick="setAdminTelemetryFilter('ALL', null)" style="font-size:11px; font-weight:800; padding:6px 10px; border-radius:8px; border:1px solid rgba(167,139,250,0.45); background:#6D28D9; color:#FFFFFF; cursor:pointer; white-space:nowrap;">Tümü</button>
                    <button type="button" id="adminTelGateBtn_K1" onclick="setAdminTelemetryFilter('K1', null)" style="font-size:11px; font-weight:800; padding:6px 10px; border-radius:8px; border:1px solid rgba(167,139,250,0.25); background:#121024; color:#CBD5E1; cursor:pointer; white-space:nowrap;">K1 Gümrük</button>
                    <button type="button" id="adminTelGateBtn_K2" onclick="setAdminTelemetryFilter('K2', null)" style="font-size:11px; font-weight:800; padding:6px 10px; border-radius:8px; border:1px solid rgba(167,139,250,0.25); background:#121024; color:#CBD5E1; cursor:pointer; white-space:nowrap;">K2 Saat</button>
                    <button type="button" id="adminTelGateBtn_K3" onclick="setAdminTelemetryFilter('K3', null)" style="font-size:11px; font-weight:800; padding:6px 10px; border-radius:8px; border:1px solid rgba(167,139,250,0.25); background:#121024; color:#CBD5E1; cursor:pointer; white-space:nowrap;">K3 Gemini</button>
                    <button type="button" id="adminTelGateBtn_K4" onclick="setAdminTelemetryFilter('K4', null)" style="font-size:11px; font-weight:800; padding:6px 10px; border-radius:8px; border:1px solid rgba(167,139,250,0.25); background:#121024; color:#CBD5E1; cursor:pointer; white-space:nowrap;">K4 Bulut</button>
                </div>

                <div style="display:flex; gap:6px; margin-bottom:10px;">
                    <button type="button" id="adminTelSevBtn_ALL" onclick="setAdminTelemetryFilter(null, 'ALL')" style="flex:1; font-size:11px; font-weight:800; padding:6px 10px; border-radius:8px; border:1px solid rgba(167,139,250,0.45); background:#2C2550; color:#FFFFFF; cursor:pointer; white-space:nowrap;">Tüm Kayıtlar</button>
                    <button type="button" id="adminTelSevBtn_error" onclick="setAdminTelemetryFilter(null, 'error')" style="flex:1; font-size:11px; font-weight:800; padding:6px 10px; border-radius:8px; border:1px solid rgba(248,113,113,0.35); background:#121024; color:#FECACA; cursor:pointer; white-space:nowrap;">Sadece Arıza</button>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:12px;">
                    <button type="button" onclick="copyCloudSubChiefReportToClipboard()" style="font-size:11.5px; font-weight:800; padding:9px 10px; border-radius:10px; border:1px solid rgba(167,139,250,0.45); background:#2C2550; color:#F3E8FF; cursor:pointer; white-space:nowrap;">Bulut Raporu Kopyala</button>
                    <button type="button" onclick="copyAdminTelemetryPromptToClipboard()" style="font-size:11.5px; font-weight:800; padding:9px 10px; border-radius:10px; border:1px solid rgba(74,222,128,0.45); background:#14532D; color:#BBF7D0; cursor:pointer; white-space:nowrap;">Düzeltme Emri Kopyala</button>
                    <button type="button" onclick="clearAdminTelemetryEvents()" style="grid-column:span 2; font-size:11.5px; font-weight:800; padding:8px 10px; border-radius:10px; border:1px solid rgba(248,113,113,0.45); background:#7F1D1D; color:#FECACA; cursor:pointer; white-space:nowrap;">Tümünü Temizle</button>
                </div>

                <div id="adminTelemetryListContainer" style="display:flex; flex-direction:column; gap:8px; max-height:46vh; overflow-y:auto;"></div>
            </div>
        </div>
    </div>

    <!-- ==================== APPROVAL EMAIL DISPATCH MODAL ==================== -->
    <div id="approvalEmailDispatchModal" class="modal-overlay" onclick="if(event.target === this) closeApprovalEmailModal()">
        <div class="modal-box" style="max-width: 480px; width: 94%;">
            <div class="modal-header">
                <span class="modal-title" style="color:#4ADE80;">Hesap Onaylandı &amp; Onay Maili</span>
                <button type="button" class="modal-close" aria-label="Kapat" onclick="closeApprovalEmailModal()">✕</button>
            </div>
            <div style="font-size:12.5px; color:#E2E8F0; line-height:1.5; margin-bottom:12px;">
                <strong id="approvalModalUserName" style="color:var(--gold);">Sporcu</strong> adlı kullanıcının hesabı aktif edildi ve buluta kaydedildi. Şimdi kullanıcıya onay e-postasını gönderin:
            </div>
            <div id="approvalModalAutoStatus" style="display:none; padding:8px 10px; border-radius:8px; font-size:11.5px; margin-bottom:10px;"></div>
            <div style="background:#121024; border:1px solid rgba(167, 139, 250, 0.25); border-radius:8px; padding:10px 12px; margin-bottom:14px; font-size:11.5px; color:#CBD5E1;">
                <div style="margin-bottom:4px;"><strong>Alıcı:</strong> <span id="approvalModalUserEmail" style="color:var(--cyan);"></span></div>
                <div style="margin-bottom:6px;"><strong>Konu:</strong> <span id="approvalModalSubject" style="color:#FFFFFF;"></span></div>
                <div id="approvalModalBodyPreview" style="white-space:pre-wrap; background:#0B0A14; border:1px solid rgba(167, 139, 250, 0.2); padding:8px; border-radius:6px; color:#E2E8F0; font-size:11px; max-height:130px; overflow-y:auto;"></div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
                <a id="approvalModalMailtoBtn" href="#" class="btn btn-gold" style="text-align:center; text-decoration:none; padding:11px; font-weight:800; font-size:12.5px; display:block;">
                    Varsayılan Mail Uygulaması İle Gönder
                </a>
                <a id="approvalModalGmailBtn" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="text-align:center; text-decoration:none; padding:10px; font-weight:800; font-size:12px; border-color:var(--cyan); color:var(--cyan); display:block;">
                    Gmail Web İle Tek Tıkla Gönder
                </a>
                <button type="button" class="btn btn-outline" style="padding:9px; font-size:11.5px;" onclick="copyApprovalMessageToClipboard()">
                    Onay Mesajını Kopyala
                </button>
            </div>
        </div>
    </div>`;
    }

    function buildHeaderTelemetryButtonHtml() {
        return `<button type="button" id="headerAdminTelemetryBtn" onclick="event.stopPropagation(); openAdminModal('telemetry');" style="display:none; align-items:center; gap:4px; height:30px; padding:0 9px; border-radius:999px; background:#DC2626; color:#FFFFFF; border:1px solid #FCA5A5; font-size:11px; font-weight:800; white-space:nowrap; cursor:pointer;" title="Sistem İzleme Kayıtları">İzleme <span id="headerAdminTelemetryBadge">0</span></button>`;
    }

    function buildPopupAdminButtonHtml() {
        return `<button type="button" class="header-popup-item" id="btnAdminPanelPopup" onclick="closeHeaderPopupMenu(); openAdminModal();" style="display:flex;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                            <span>Sporcu Yönetimi (Admin)</span>
                            <span id="popupAdminTelemetryBadge" style="display:none; margin-left:auto; background:#DC2626; color:#FFFFFF; font-size:10px; font-weight:800; padding:1px 6px; border-radius:999px;">0</span>
                        </button>`;
    }

    function buildProfileAdminButtonHtml() {
        return `<button class="btn btn-outline" id="profileTabAdminBtn" style="font-size:11px; border-color:rgba(252, 211, 77, 0.45); color:#FCD34D; display:inline-block;" onclick="openAdminModal()">
                            Sporcu Yönetim Portalı (Admin) <span id="profileAdminTelemetryBadge" style="display:none; background:#DC2626; color:#FFFFFF; font-size:10px; font-weight:800; padding:1px 6px; border-radius:999px; margin-left:4px;">0</span>
                        </button>`;
    }

    function buildSheetAdminButtonHtml() {
        return `<div class="more-sheet-btn" id="sheetAdminBtn" onclick="closeMoreSheet(); openAdminModal();" style="display:flex;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-secondary);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                <span>Sporcu Yönetimi</span>
                <span id="sheetAdminTelemetryBadge" style="display:none; background:#DC2626; color:#FFFFFF; font-size:9.5px; font-weight:800; padding:1px 6px; border-radius:99px; margin-left:auto;">0</span>
            </div>`;
    }

    let _adminPortalMounted = false;

    function unmountAdminPortalDOM() {
        _adminPortalMounted = false;
        if (typeof document === 'undefined') return;
        ADMIN_DOM_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                if (el.classList && typeof el.classList.remove === 'function') {
                    el.classList.remove('active');
                }
                if (el.style) el.style.display = 'none';
                if (typeof el.remove === 'function') el.remove();
            }
        });
        const profileMount = document.getElementById('profileAdminMountPoint');
        if (profileMount) {
            profileMount.innerHTML = '';
        }
    }

    function mountAdminPortalDOM() {
        if (!isAuthorizedForAdminPortal()) {
            unmountAdminPortalDOM();
            return false;
        }
        if (typeof document === 'undefined') return false;

        if (!document.getElementById('adminModal') && document.body && typeof document.body.insertAdjacentHTML === 'function') {
            document.body.insertAdjacentHTML('beforeend', buildAdminModalsHtml());
        }

        const headerActions = document.getElementById('headerBarActions')
            || (typeof document.querySelector === 'function' ? document.querySelector('.modern-bar-actions') : null);
        if (headerActions && !document.getElementById('headerAdminTelemetryBtn') && typeof headerActions.insertAdjacentHTML === 'function') {
            headerActions.insertAdjacentHTML('afterbegin', buildHeaderTelemetryButtonHtml());
        }

        const popupMenu = document.getElementById('headerPopupMenu');
        if (popupMenu && !document.getElementById('btnAdminPanelPopup')) {
            const divider = typeof popupMenu.querySelector === 'function' ? popupMenu.querySelector('.header-popup-divider') : null;
            if (divider && typeof divider.insertAdjacentHTML === 'function') {
                divider.insertAdjacentHTML('beforebegin', buildPopupAdminButtonHtml());
            } else if (typeof popupMenu.insertAdjacentHTML === 'function') {
                popupMenu.insertAdjacentHTML('beforeend', buildPopupAdminButtonHtml());
            }
        }

        const profileMount = document.getElementById('profileAdminMountPoint');
        if (profileMount && !document.getElementById('profileTabAdminBtn')) {
            profileMount.innerHTML = buildProfileAdminButtonHtml();
        }

        const moreGrid = document.getElementById('moreSheetGrid')
            || (typeof document.querySelector === 'function' ? document.querySelector('#moreBottomSheet .more-sheet-grid') : null);
        if (moreGrid && !document.getElementById('sheetAdminBtn')) {
            const logoutBtn = typeof moreGrid.querySelector === 'function' ? moreGrid.querySelector('.more-sheet-btn.logout') : null;
            if (logoutBtn && typeof logoutBtn.insertAdjacentHTML === 'function') {
                logoutBtn.insertAdjacentHTML('beforebegin', buildSheetAdminButtonHtml());
            } else if (typeof moreGrid.insertAdjacentHTML === 'function') {
                moreGrid.insertAdjacentHTML('beforeend', buildSheetAdminButtonHtml());
            }
        }

        _adminPortalMounted = true;
        return true;
    }

    function isMounted() {
        if (!_adminPortalMounted) return false;
        if (typeof document === 'undefined') return false;
        return Boolean(document.getElementById('adminModal'));
    }

    async function syncUsersToCloud(users) {
        if (!isAuthorizedForAdminPortal()) return;
        if (typeof isDemoGuestSession === 'function' && isDemoGuestSession()) return;
        const { fbDb, fbAuth, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        if (IS_LOCAL_DEV) {
            if (typeof updateCloudSyncBadge === 'function') updateCloudSyncBadge('synced', 'Yerel Test (İzole)');
            return;
        }
        if (!isFirebaseReady || !fbDb) return;
        try {
            if (typeof updateCloudSyncBadge === 'function') updateCloudSyncBadge('syncing', 'Kaydediliyor...');
            const sanitizedUsers = (users || []).map(u => {
                const copy = { ...u };
                delete copy.password;
                delete copy.passwordHash;
                delete copy.salt;
                delete copy.geminiApiKey;
                delete copy.tredictToken;
                delete copy.intervalsToken;
                Object.keys(copy).forEach(k => {
                    if (copy[k] === undefined) delete copy[k];
                });
                return copy;
            });
            await fbDb.collection('app_system').doc('users').set({
                users: sanitizedUsers,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            if (typeof updateCloudSyncBadge === 'function') updateCloudSyncBadge('synced', 'Bulut Aktif');
        } catch (err) {
            console.warn("Kullanıcılar buluta yüklenemedi:", err);
            const authMissing = Boolean(!IS_LOCAL_DEV && fbAuth && !fbAuth.currentUser);
            if (typeof updateCloudSyncBadge === 'function') {
                updateCloudSyncBadge(authMissing ? 'auth-required' : 'offline', authMissing ? 'Bulut Girişi Gerekli' : 'Kayıt Yerelde');
            }
        }
    }

    async function syncAllUsersForAdmin(options = {}) {
        const opts = options && typeof options === 'object' ? options : {};
        if (!isAuthorizedForAdminPortal()) return [];
        const { fbDb, fbAuth, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        if (!isFirebaseReady || !fbDb) return getAuthUsers();
        if (!IS_LOCAL_DEV && fbAuth && !fbAuth.currentUser) return getAuthUsers();
        const minGap = Number.isFinite(opts.minGapMs) ? opts.minGapMs : 600000;
        if (!opts.force && (Date.now() - _lastAdminUsersSyncAt) < minGap) {
            try {
                if (global.CelikLiaisonSubChiefs && typeof global.CelikLiaisonSubChiefs.noteCloudSubChiefEvent === 'function') {
                    global.CelikLiaisonSubChiefs.noteCloudSubChiefEvent('saved_read', 'admin_users', 'Sporcu listesi önbellekten geldi', 1);
                }
            } catch {}
            return getAuthUsers();
        }

        try {
            const localUsers = getAuthUsers();
            const mergedMap = new Map();
            localUsers.forEach(u => {
                if (u && u.id) mergedMap.set(u.id, { ...u });
            });

            const ingestRemoteUser = (rawCloudU) => {
                if (!rawCloudU || !rawCloudU.id) return;
                if (rawCloudU.id === 'usr_1792524620913') return;
                const u = { ...rawCloudU };
                delete u.password;
                delete u.passwordHash;
                delete u.salt;
                delete u.geminiApiKey;
                delete u.tredictToken;
                delete u.intervalsToken;
                u.avatar = cleanAvatar(u.avatar, 'SP');

                const localU = mergedMap.get(u.id) || {};
                const isLocalNewer = Number(localU.updatedAt || 0) > Number(u.updatedAt || 0);
                const merged = isLocalNewer ? { ...u, ...localU } : { ...localU, ...u };
                if (u.status !== 'pending' && merged.status === 'pending') {
                    merged.status = u.status || 'approved';
                }
                if (u.fbAuthEmail || localU.fbAuthEmail) {
                    merged.fbAuthEmail = u.fbAuthEmail || localU.fbAuthEmail;
                }
                if (u.authUid || localU.authUid) {
                    merged.authUid = u.authUid || localU.authUid;
                }
                if (localU.passwordStrengthLevel && !merged.passwordStrengthLevel) {
                    merged.passwordStrengthLevel = localU.passwordStrengthLevel;
                }
                const vaultCred = typeof getLocalUserCred === 'function' ? getLocalUserCred(u.id) : null;
                if (vaultCred && vaultCred.passwordHash) {
                    merged.passwordStrengthLevel = vaultCred.passwordStrengthLevel || merged.passwordStrengthLevel || 'Güçlü';
                    if (vaultCred.mustChangePassword === false) merged.mustChangePassword = false;
                }
                delete merged.password;
                delete merged.passwordHash;
                delete merged.salt;
                mergedMap.set(u.id, merged);
            };

            // 1. Bireysel kullanıcı profillerini (user_profiles) çek (yeni kayıt başvuruları dahil)
            try {
                if (typeof isFirestoreQuotaCircuitOpen === 'function' && isFirestoreQuotaCircuitOpen()) {
                    return getAuthUsers();
                }
                const profilesSnap = typeof withAuthTimeout === 'function'
                    ? await withAuthTimeout(fbDb.collection('user_profiles').get(), 2200, null)
                    : await fbDb.collection('user_profiles').get();
                if (profilesSnap) _lastAdminUsersSyncAt = Date.now();
                if (profilesSnap && typeof profilesSnap.forEach === 'function') {
                    profilesSnap.forEach(doc => {
                        if (doc && doc.exists) {
                            const data = doc.data() || {};
                            ingestRemoteUser(Object.assign({}, data, { authUid: data.authUid || doc.id }));
                        }
                    });
                }
            } catch (profErr) {
                if (typeof tripFirestoreQuotaCircuitIfNeeded === 'function') tripFirestoreQuotaCircuitIfNeeded(profErr);
                console.warn("user_profiles listesi çekilemedi:", profErr);
            }

            // 2. Yönetici toplu listesini (app_system/users) birleştir
            try {
                if (typeof isFirestoreQuotaCircuitOpen === 'function' && isFirestoreQuotaCircuitOpen()) {
                    return getAuthUsers();
                }
                const docRef = fbDb.collection('app_system').doc('users');
                const doc = typeof fetchCloudDocPreferServer === 'function'
                    ? await fetchCloudDocPreferServer(docRef)
                    : await docRef.get();
                if (doc && doc.exists) {
                    const data = doc.data() || {};
                    if (Array.isArray(data.users)) {
                        data.users.forEach(ingestRemoteUser);
                    }
                }
            } catch (sysErr) {
                if (typeof tripFirestoreQuotaCircuitIfNeeded === 'function') tripFirestoreQuotaCircuitIfNeeded(sysErr);
                console.warn("app_system/users listesi çekilemedi:", sysErr);
            }

            const finalUsers = Array.from(mergedMap.values());
            localStorage.setItem('celik_kodu_auth_users', JSON.stringify(finalUsers));
            if (typeof updateAdminPendingBadges === 'function') updateAdminPendingBadges();
            return finalUsers;
        } catch (err) {
            console.warn("Yönetici kullanıcı eşitlemesi başarısız:", err);
            return getAuthUsers();
        }
    }

    function renderPendingApprovalsBanner() {
        if (!isAuthorizedForAdminPortal()) return;
        const section = document.getElementById('adminPendingApprovalsSection');
        const listEl = document.getElementById('adminPendingApprovalsList');
        const countLabel = document.getElementById('adminPendingCountLabel');
        if (typeof updateAdminPendingBadges === 'function') updateAdminPendingBadges();
        if (!section || !listEl) return;

        const users = getAuthUsers();
        const pendingUsers = users.filter(u => u && u.status === 'pending');

        if (pendingUsers.length === 0) {
            section.style.display = 'none';
            listEl.innerHTML = '';
            return;
        }

        section.style.display = 'block';
        section.style.background = '#121024';
        section.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        if (countLabel) {
            countLabel.innerText = `${pendingUsers.length} Bekleyen Başvuru`;
            countLabel.style.color = '#FDE68A';
        }

        listEl.innerHTML = pendingUsers.map(u => {
            const reqDate = u.createdAt ? new Date(u.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            return `
                <div style="background:#181530; border:1px solid rgba(167, 139, 250, 0.25); border-radius:9px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
                    <div>
                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <strong style="color:#FFFFFF; font-size:13px;">${esc(u.name)}</strong>
                            <span style="font-size:11px; color:#CBD5E1;">(@${esc(u.username)})</span>
                            <span style="font-size:10px; background:#7C2D12; color:#FDE68A; border:1px solid rgba(251,191,36,0.35); padding:1px 6px; border-radius:6px; font-weight:800;">ONAY BEKLİYOR</span>
                        </div>
                        <div style="font-size:11.5px; color:#BAE6FD; margin-top:2px;">
                            ${esc(u.email || 'E-posta belirtilmedi')}
                        </div>
                        <div style="font-size:10.5px; color:#CBD5E1; margin-top:2px;">
                            ${esc(u.level || 'Orta Seviye')} • ${esc(u.gender || 'Erkek')} ${reqDate ? '• ' + esc(reqDate) : ''}
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; flex-shrink:0;">
                        <button type="button" class="btn btn-gold" style="font-size:11px; padding:6px 10px; font-weight:800; background:#14532D; border-color:#22C55E; color:#BBF7D0;" onclick="adminApproveUser(decodeURIComponent('${encodeURIComponent(u.id)}'))">
                            Onayla &amp; Mail Gönder
                        </button>
                        <button type="button" class="btn btn-outline" style="font-size:11px; padding:6px 10px; background:#7F1D1D; color:#FECACA; border-color:#F87171; font-weight:800;" onclick="adminRejectUser(decodeURIComponent('${encodeURIComponent(u.id)}'))">
                            ✕ Reddet
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function openAdminModal(initialTab = 'status') {
        if (!isAuthorizedForAdminPortal()) {
            unmountAdminPortalDOM();
            alert("Bu alana sadece doğrulanmış yöneticiler erişebilir.");
            return;
        }
        if (!mountAdminPortalDOM()) {
            alert("Yönetici paneli yüklenemedi. Lütfen tekrar deneyin.");
            return;
        }
        const { isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        if (isFirebaseReady && !IS_LOCAL_DEV) {
            try { await syncAllUsersForAdmin({ minGapMs: 60000 }); } catch {}
        }
        const adminModalEl = document.getElementById('adminModal');
        if (adminModalEl) {
            const modalBox = adminModalEl.querySelector('.modal-box');
            if (modalBox) {
                modalBox.style.background = '#181530';
                modalBox.style.color = '#F8FAFC';
                modalBox.style.border = '1.5px solid rgba(167, 139, 250, 0.25)';
            }
            adminModalEl.querySelectorAll('h3, span').forEach(el => {
                if (el.style && (el.style.color === '#0F172A' || el.style.color === 'rgb(15, 23, 42)')) {
                    el.style.color = '#FFFFFF';
                }
            });
        }
        loadAdminEmailJsConfigUI();
        renderPendingApprovalsBanner();
        renderAdminAthleteStatuses();
        renderAdminUserList();
        const targetTab = (initialTab === 'manage' || initialTab === 'telemetry') ? initialTab : 'status';
        switchAdminModalTab(targetTab);
        if (adminModalEl) adminModalEl.classList.add('active');
        if (typeof fetchAllCloudSystemTelemetryForAdmin === 'function') {
            fetchAllCloudSystemTelemetryForAdmin();
        }
    }

    function closeAdminModal() {
        const el = document.getElementById('adminModal');
        if (el) el.classList.remove('active');
    }

    function setAdminModalTabBtnStyle(btn, isActive) {
        if (!btn) return;
        if (isActive) {
            btn.className = 'btn btn-gold';
            btn.style.background = 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)';
            btn.style.backgroundColor = '#6D28D9';
            btn.style.color = '#FFFFFF';
            btn.style.borderColor = 'rgba(167, 139, 250, 0.45)';
        } else {
            btn.className = 'btn btn-outline';
            btn.style.background = '#121024';
            btn.style.color = '#CBD5E1';
            btn.style.borderColor = 'rgba(167, 139, 250, 0.25)';
        }
    }

    function switchAdminModalTab(tabKey) {
        if (!isAuthorizedForAdminPortal()) return;
        const statusView = document.getElementById('adminViewStatus');
        const manageView = document.getElementById('adminViewManage');
        const telemetryView = document.getElementById('adminViewTelemetry');
        const btnStatus = document.getElementById('adminTabBtnStatus');
        const btnManage = document.getElementById('adminTabBtnManage');
        const btnTelemetry = document.getElementById('adminTabBtnTelemetry');

        renderPendingApprovalsBanner();

        const activeKey = (tabKey === 'manage' || tabKey === 'telemetry') ? tabKey : 'status';
        if (statusView) statusView.style.display = activeKey === 'status' ? 'block' : 'none';
        if (manageView) manageView.style.display = activeKey === 'manage' ? 'block' : 'none';
        if (telemetryView) telemetryView.style.display = activeKey === 'telemetry' ? 'block' : 'none';

        setAdminModalTabBtnStyle(btnStatus, activeKey === 'status');
        setAdminModalTabBtnStyle(btnManage, activeKey === 'manage');
        setAdminModalTabBtnStyle(btnTelemetry, activeKey === 'telemetry');

        if (activeKey === 'status') {
            renderAdminAthleteStatuses();
        } else if (activeKey === 'manage') {
            renderAdminUserList();
        } else {
            renderAdminSystemTelemetry();
            if (typeof fetchAllCloudSystemTelemetryForAdmin === 'function') {
                fetchAllCloudSystemTelemetryForAdmin();
            }
        }
    }

    function getFilteredAdminTelemetryEvents() {
        const users = getAuthUsers();
        const all = (typeof global.CelikKaraKutu !== 'undefined' && global.CelikKaraKutu && typeof global.CelikKaraKutu.getAllLocalEventsAcrossUsers === 'function')
            ? global.CelikKaraKutu.getAllLocalEventsAcrossUsers(users)
            : [];
        const filtered = all.filter(ev => {
            if (adminTelemetryFilterGate !== 'ALL' && ev.gate !== adminTelemetryFilterGate) return false;
            if (adminTelemetryFilterSeverity === 'error' && ev.severity !== 'error') return false;
            return true;
        });
        return { all, filtered };
    }

    function setAdminTelemetryFilter(gate, severity) {
        if (!isAuthorizedForAdminPortal()) return;
        if (gate) adminTelemetryFilterGate = gate;
        if (severity) adminTelemetryFilterSeverity = severity;
        renderAdminSystemTelemetry();
    }

    function renderAdminCloudSubChiefCard() {
        const cardEl = document.getElementById('adminCloudSubChiefCard');
        if (!cardEl) return;
        const subApi = global.CelikLiaisonSubChiefs;
        if (!subApi || typeof subApi.inspectCloudHealthSnapshot !== 'function') {
            cardEl.innerHTML = '';
            return;
        }
        const snap = subApi.inspectCloudHealthSnapshot();
        const c = snap.circuitState || {};
        const dotColor = c.isOpen
            ? (c.reason === 'slow' ? '#FBBF24' : '#F87171')
            : (snap.pendingTotalCount > 0 ? '#FBBF24' : '#4ADE80');
        const statusText = c.isOpen
            ? (c.reason === 'slow' ? 'Bulut Yavaş' : 'Kotası Doldu')
            : (snap.pendingTotalCount > 0 ? 'Kuyrukta Bekleyen Var' : 'Bulut Aktif');
        const savedTotal = Number(snap.savedWritesCount || 0) + Number(snap.savedReadsCount || 0);
        const toKb = (b) => (Number(b || 0) / 1024).toFixed(1);

        cardEl.innerHTML = `
            <div style="background:#121024; border:1px solid rgba(167,139,250,0.25); border-radius:10px; padding:10px 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding-bottom:7px; border-bottom:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex; align-items:center; gap:7px; min-width:0;">
                        <span style="width:8px; height:8px; border-radius:50%; background:${dotColor}; flex-shrink:0; display:inline-block;"></span>
                        <span style="font-size:12px; font-weight:800; color:#FFFFFF; white-space:nowrap;">Bulut Alt Şefi Canlı Karnesi</span>
                    </div>
                    <span style="font-size:11px; font-weight:700; color:${dotColor}; white-space:nowrap;">${esc(statusText)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:11.5px;">
                    <span style="color:#94A3B8;">Oturum Trafiği</span>
                    <span style="color:#E2E8F0; font-weight:700;">Okuma: ${Number(snap.readsCount || 0)} • Yazma: ${Number(snap.writesCount || 0)} • Önlenen: ${savedTotal}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:11.5px;">
                    <span style="color:#94A3B8;">1 MB Paket Sağlığı</span>
                    <span style="color:#E2E8F0; font-weight:700;">Ana Durum: ~${toKb(snap.estimatedParentStateBytes)} KB (%${Number(snap.parentStateLimitPct || 0)}) • En Büyük Zarf: ~${toKb(snap.maxSingleWorkoutBytes)} KB (%${Number(snap.maxSingleWorkoutLimitPct || 0)})</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding-top:6px; font-size:11.5px;">
                    <span style="color:#94A3B8;">v2 Zarflı Yapı &amp; Kuyruk</span>
                    <span style="color:#E2E8F0; font-weight:700;">Antrenman: ${Number(snap.v2WorkoutSigsCount || 0)} zarf • Takvim: ${Number(snap.v2CalendarDaySigsCount || 0)} gün • Bekleyen: ${Number(snap.pendingTotalCount || 0)}</span>
                </div>
            </div>
        `;
    }

    function renderAdminSystemTelemetry() {
        if (!isAuthorizedForAdminPortal()) return;
        const kpisEl = document.getElementById('adminTelemetryKpis');
        const listEl = document.getElementById('adminTelemetryListContainer');
        const { all, filtered } = getFilteredAdminTelemetryEvents();
        renderAdminCloudSubChiefCard();

        ['ALL', 'K1', 'K2', 'K3', 'K4'].forEach(g => {
            const btn = document.getElementById(`adminTelGateBtn_${g}`);
            if (!btn) return;
            const active = adminTelemetryFilterGate === g;
            btn.style.background = active ? '#6D28D9' : '#121024';
            btn.style.color = active ? '#FFFFFF' : '#CBD5E1';
            btn.style.borderColor = active ? 'rgba(167,139,250,0.45)' : 'rgba(167,139,250,0.25)';
        });
        const sevAllBtn = document.getElementById('adminTelSevBtn_ALL');
        const sevErrBtn = document.getElementById('adminTelSevBtn_error');
        if (sevAllBtn) {
            const active = adminTelemetryFilterSeverity === 'ALL';
            sevAllBtn.style.background = active ? '#2C2550' : '#121024';
            sevAllBtn.style.color = active ? '#FFFFFF' : '#CBD5E1';
            sevAllBtn.style.borderColor = active ? 'rgba(167,139,250,0.45)' : 'rgba(167,139,250,0.25)';
        }
        if (sevErrBtn) {
            const active = adminTelemetryFilterSeverity === 'error';
            sevErrBtn.style.background = active ? '#DC2626' : '#121024';
            sevErrBtn.style.color = active ? '#FFFFFF' : '#FECACA';
            sevErrBtn.style.borderColor = active ? '#F87171' : 'rgba(248,113,113,0.35)';
        }

        let errorCount = 0;
        let warnCount = 0;
        all.forEach(ev => {
            if (ev.severity === 'error') errorCount++;
            else warnCount++;
        });

        if (kpisEl) {
            kpisEl.innerHTML = `
                <div style="background:#121024; border:1px solid rgba(167,139,250,0.25); border-radius:10px; padding:8px; text-align:center;">
                    <div style="font-size:17px; font-weight:900; color:#FFFFFF;">${all.length}</div>
                    <div style="font-size:10px; font-weight:700; color:#CBD5E1;">Toplam Açık</div>
                </div>
                <div style="background:#7F1D1D; border:1px solid rgba(248,113,113,0.45); border-radius:10px; padding:8px; text-align:center;">
                    <div style="font-size:17px; font-weight:900; color:#FFFFFF;">${errorCount}</div>
                    <div style="font-size:10px; font-weight:700; color:#FECACA;">Kırmızı Arıza</div>
                </div>
                <div style="background:#78350F; border:1px solid rgba(251,191,36,0.45); border-radius:10px; padding:8px; text-align:center;">
                    <div style="font-size:17px; font-weight:900; color:#FFFFFF;">${warnCount}</div>
                    <div style="font-size:10px; font-weight:700; color:#FDE68A;">Sarı Onarım</div>
                </div>
            `;
        }

        if (!listEl) return;
        const savedScrollTop = listEl.scrollTop || 0;
        if (filtered.length === 0) {
            listEl.innerHTML = `
                <div style="background:#14532D; border:1px solid rgba(74,222,128,0.45); color:#BBF7D0; border-radius:10px; padding:14px; text-align:center; font-size:12px; font-weight:700;">
                    ${all.length === 0 ? 'Tüm kapılar temiz, açık kayıt yok.' : 'Seçili filtrede açık kayıt yok.'}
                </div>
            `;
            listEl.scrollTop = savedScrollTop;
            return;
        }

        const gateNames = { K1: 'K1 Gümrük', K2: 'K2 Saat', K3: 'K3 Gemini', K4: 'K4 Bulut' };
        const maskFn = (typeof global.CelikKaraKutu !== 'undefined' && global.CelikKaraKutu && typeof global.CelikKaraKutu.maskSecrets === 'function')
            ? global.CelikKaraKutu.maskSecrets
            : (s) => String(s || '');

        listEl.innerHTML = filtered.map(ev => {
            const isErr = ev.severity === 'error';
            const sevBg = isErr ? '#7F1D1D' : '#78350F';
            const sevFg = isErr ? '#FECACA' : '#FDE68A';
            const sevText = isErr ? 'Arıza' : 'Onarım';
            const gateText = gateNames[ev.gate] || ev.gate || 'K1';
            const timeStr = ev.at ? new Date(ev.at).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
            const safeUidAttr = encodeURIComponent(String(ev.uid || ''));
            const safeEvIdAttr = encodeURIComponent(String(ev.id || ''));
            const safeInput = maskFn(ev.inputSummary || '');
            const safeOutcome = maskFn(ev.outcome || '');
            const safeModule = maskFn(ev.module || '');
            const safeAction = maskFn(ev.action || '');
            const safeUser = maskFn(ev.userName || ev.uid || 'Sporcu');
            const safeVer = maskFn(ev.appVersion || 'v349');

            return `
                <div style="background:#121024; border:1px solid ${isErr ? 'rgba(248,113,113,0.45)' : 'rgba(251,191,36,0.35)'}; border-radius:10px; padding:10px 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:6px;">
                        <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                            <span style="background:#2C2550; color:#F3E8FF; border:1px solid rgba(167,139,250,0.4); font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px;">${esc(gateText)}</span>
                            <span style="background:${sevBg}; color:${sevFg}; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px;">${sevText}</span>
                            <span style="background:#1E293B; color:#E2E8F0; font-size:10px; font-weight:800; padding:2px 6px; border-radius:6px;">${esc(safeVer)}</span>
                            ${ev.repeatCount > 1 ? `<span style="background:#0C4A6E; color:#BAE6FD; font-size:10px; font-weight:800; padding:2px 6px; border-radius:6px;">×${Number(ev.repeatCount)}</span>` : ''}
                            <span style="font-size:10.5px; color:#CBD5E1; font-weight:600;">${esc(timeStr)}</span>
                        </div>
                        <button type="button" onclick="removeSingleAdminTelemetryEvent(decodeURIComponent('${safeUidAttr}'), decodeURIComponent('${safeEvIdAttr}'))" style="background:#2C2550; color:#F3E8FF; border:1px solid rgba(167,139,250,0.35); border-radius:6px; padding:3px 8px; font-size:10.5px; font-weight:800; cursor:pointer;">Kapat</button>
                    </div>
                    <div style="font-size:12px; font-weight:800; color:#FFFFFF; margin-bottom:3px;">
                        ${esc(safeModule)} • ${esc(safeAction)}
                    </div>
                    <div style="font-size:11px; color:#BAE6FD; margin-bottom:3px;">
                        Sporcu: ${esc(safeUser)} • Sürüm: ${esc(safeVer)}
                    </div>
                    ${safeInput ? `<div style="font-size:11px; color:#CBD5E1; margin-bottom:2px; word-break:break-word;">Girdi: ${esc(safeInput)}</div>` : ''}
                    <div style="font-size:11.5px; color:${isErr ? '#FECACA' : '#FDE68A'}; font-weight:700; word-break:break-word;">Sonuç: ${esc(safeOutcome)}</div>
                </div>
            `;
        }).join('');
        listEl.scrollTop = savedScrollTop;
    }

    function removeSingleAdminTelemetryEvent(uid, eventId) {
        if (!isAuthorizedForAdminPortal()) return;
        if (typeof global.CelikKaraKutu === 'undefined' || !global.CelikKaraKutu) return;
        global.CelikKaraKutu.removeEvent(uid, eventId);
        if (typeof updateAdminPendingBadges === 'function') updateAdminPendingBadges();
        renderAdminSystemTelemetry();
    }

    async function clearAdminTelemetryEvents() {
        if (!isAuthorizedForAdminPortal()) return;
        const users = getAuthUsers();
        const all = (typeof global.CelikKaraKutu !== 'undefined' && global.CelikKaraKutu)
            ? global.CelikKaraKutu.getAllLocalEventsAcrossUsers(users)
            : [];
        if (all.length === 0) {
            alert('Temizlenecek açık sistem kaydı bulunmuyor.');
            return;
        }
        if (typeof confirm === 'function' && !confirm(`Toplam ${all.length} sistem izleme kaydını temizlemek istiyor musunuz?`)) {
            return;
        }
        const uidSet = new Set(users.map(u => u && u.id).filter(Boolean));
        all.forEach(ev => { if (ev && ev.uid) uidSet.add(ev.uid); });
        const nowMs = Date.now();
        uidSet.forEach(u => {
            try { localStorage.setItem(`celik_kodu_telemetry_cleared_at_${u}`, String(nowMs)); } catch {}
        });
        if (typeof global.CelikKaraKutu !== 'undefined' && global.CelikKaraKutu) {
            global.CelikKaraKutu.clearAllEvents(users);
        }
        const { fbDb, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        if (!IS_LOCAL_DEV && isFirebaseReady && fbDb && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
            for (const u of uidSet) {
                if (!/^usr_[a-zA-Z0-9_-]{1,64}$/.test(String(u))) continue;
                try { await fbDb.collection('system_telemetry').doc(String(u)).delete(); } catch {}
            }
        }
        if (typeof updateAdminPendingBadges === 'function') updateAdminPendingBadges();
        renderAdminSystemTelemetry();
    }

    function buildAdminTelemetryAiPrompt() {
        if (!isAuthorizedForAdminPortal()) return '';
        const { all, filtered } = getFilteredAdminTelemetryEvents();
        const target = filtered.length > 0 ? filtered : all;
        const cloudReport = (global.CelikLiaisonSubChiefs && typeof global.CelikLiaisonSubChiefs.buildCloudSubChiefDiagnosticReport === 'function')
            ? global.CelikLiaisonSubChiefs.buildCloudSubChiefDiagnosticReport()
            : '';
        if (target.length === 0) return cloudReport;
        const maskFn = (typeof global.CelikKaraKutu !== 'undefined' && global.CelikKaraKutu && typeof global.CelikKaraKutu.maskSecrets === 'function')
            ? global.CelikKaraKutu.maskSecrets
            : (s) => String(s || '');
        const gateNames = { K1: 'K1 Gümrük & Şefler', K2: 'K2 Saat & Vercel Köprüsü', K3: 'K3 Gemini Yapay Zeka', K4: 'K4 Firebase Bulut' };
        const lines = [
            'ÇELİK KODU SİSTEM İZLEME RAPORU — LÜTFEN AŞAĞIDAKİ ARIZA VE ONARIMLARI İNCELE VE ÇÖZ:',
            `Toplam Kayıt: ${target.length}`,
            ''
        ];
        target.forEach((ev, idx) => {
            const tm = ev.at ? new Date(ev.at).toISOString() : '';
            lines.push(`${idx + 1}. [${gateNames[ev.gate] || ev.gate}] (${ev.severity === 'error' ? 'ARIZA' : 'ONARIM'}${ev.repeatCount > 1 ? ' ×' + ev.repeatCount : ''}) [${maskFn(ev.appVersion || 'v349')}]`);
            lines.push(`   Sporcu: ${maskFn(ev.userName || ev.uid || 'Sporcu')} | Sürüm: ${maskFn(ev.appVersion || 'v349')} | Modül: ${maskFn(ev.module)} | İşlem: ${maskFn(ev.action)}`);
            if (ev.inputSummary) lines.push(`   Girdi: ${maskFn(ev.inputSummary)}`);
            lines.push(`   Sonuç: ${maskFn(ev.outcome)} | Zaman: ${tm}`);
        });
        if (cloudReport) {
            lines.push('', '---', cloudReport);
        }
        return maskFn(lines.join('\n'));
    }

    async function copyCloudSubChiefReportToClipboard() {
        if (!isAuthorizedForAdminPortal()) return;
        const subApi = global.CelikLiaisonSubChiefs;
        const report = (subApi && typeof subApi.buildCloudSubChiefDiagnosticReport === 'function')
            ? subApi.buildCloudSubChiefDiagnosticReport()
            : '';
        if (!report) {
            alert('Kopyalanacak bulut raporu oluşturulamadı.');
            return;
        }
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(report);
                if (typeof showToast === 'function') showToast('Bulut Alt Şefi raporu panoya kopyalandı.');
                else alert('Bulut Alt Şefi raporu panoya kopyalandı.');
                return;
            }
        } catch {}
        alert(report);
    }

    async function copyAdminTelemetryPromptToClipboard() {
        if (!isAuthorizedForAdminPortal()) return;
        const text = buildAdminTelemetryAiPrompt();
        if (!text) {
            alert('Kopyalanacak sistem izleme kaydı yok.');
            return;
        }
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(text);
                if (typeof showToast === 'function') showToast('Düzeltme emri panoya kopyalandı.');
                else alert('Düzeltme emri panoya kopyalandı.');
                return;
            }
        } catch {}
        alert(text);
    }

    function selectNewAvatar(av) {
        const clean = cleanAvatar(av, 'SP');
        if (typeof selectedNewAvatar !== 'undefined') {
            selectedNewAvatar = clean;
        }
        global.selectedNewAvatar = clean;
        if (typeof document !== 'undefined') {
            document.querySelectorAll('#newAvatarPicker .avatar-choice').forEach(el => {
                el.classList.toggle('selected', el.innerText.trim() === clean);
            });
        }
    }

    function generateStrongPasswordForAdmin() {
        if (!isAuthorizedForAdminPortal()) return '';
        const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const lower = 'abcdefghijkmnopqrstuvwxyz';
        const digits = '23456789';
        const symbols = '!@#%&*?';
        const allChars = upper + lower + digits + symbols;

        const pickChar = (pool) => {
            const arr = new Uint32Array(1);
            if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
                crypto.getRandomValues(arr);
            } else {
                arr[0] = Math.floor(Math.random() * 0xffffffff);
            }
            return pool[arr[0] % pool.length];
        };

        let candidate = '';
        for (let attempt = 0; attempt < 10; attempt++) {
            const chars = [
                pickChar(upper),
                pickChar(lower),
                pickChar(digits),
                pickChar(symbols)
            ];
            for (let i = 4; i < 12; i++) {
                chars.push(pickChar(allChars));
            }
            // Karıştır (Fisher-Yates + crypto.getRandomValues)
            for (let i = chars.length - 1; i > 0; i--) {
                const randArr = new Uint32Array(1);
                if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
                    crypto.getRandomValues(randArr);
                } else {
                    randArr[0] = Math.floor(Math.random() * 0xffffffff);
                }
                const j = randArr[0] % (i + 1);
                const tmp = chars[i];
                chars[i] = chars[j];
                chars[j] = tmp;
            }
            candidate = chars.join('');
            if (typeof evaluatePasswordSecurity !== 'function' || evaluatePasswordSecurity(candidate).isValid) {
                break;
            }
        }

        const pwInput = typeof document !== 'undefined' ? document.getElementById('newPassword') : null;
        if (pwInput) {
            pwInput.value = candidate;
            try { pwInput.focus(); } catch {}
        }
        return candidate;
    }

    async function handleCreateUser() {
        if (!isAuthorizedForAdminPortal()) {
            alert("Bu işlem için yönetici yetkisi gereklidir.");
            return;
        }

        const rawUname = (document.getElementById('newUsername').value || '').trim();
        const uname = typeof toUsernameDocId === 'function' ? toUsernameDocId(rawUname) : normalizeAuthString(rawUname);
        const pass = (document.getElementById('newPassword').value || '').trim();
        const dname = (document.getElementById('newDisplayName').value || '').trim();
        const emailEl = document.getElementById('newEmail');
        const rawEmail = (emailEl ? emailEl.value : '').trim().toLowerCase();
        const role = document.getElementById('newRole').value;
        const level = document.getElementById('newLevel').value;
        const gender = document.getElementById('newGender').value;

        if (!uname || !pass || !dname) {
            alert("Lütfen kullanıcı adı, şifre ve ad soyad alanlarını doldurun.");
            return;
        }

        if (!/^[a-z0-9._-]{2,40}$/.test(uname) || uname === 'admin') {
            alert("Kullanıcı adı 2-40 karakter olmalı ve yalnızca harf, rakam, nokta, alt çizgi veya tire içermelidir.");
            return;
        }

        const secCheck = typeof evaluatePasswordSecurity === 'function'
            ? evaluatePasswordSecurity(pass, { username: uname, name: dname, email: rawEmail })
            : { isValid: pass.length >= 8, levelLabel: 'Güçlü', reason: 'Şifreniz en az 8 karakter uzunluğunda olmalıdır.' };
        if (!secCheck.isValid || pass.length < 8) {
            alert(secCheck.reason || "Parola en az 8 karakter, harf ve rakam içermelidir.");
            return;
        }

        const users = getAuthUsers();
        if (users.some(u => normalizeAuthString(u.username) === uname || (typeof toUsernameDocId === 'function' && toUsernameDocId(u.username) === uname))) {
            alert("Bu kullanıcı adı zaten kullanımda.");
            return;
        }

        const nowMs = Date.now();
        const salt = generateSecureSalt();
        const passHash = await sha256Hex(salt + pass);
        let assignedId = 'usr_' + nowMs;
        let assignedAuthUid = '';
        const fbEmailForNew = rawEmail || `${assignedId}@auth.celikkodu.app`;

        const { fbDb, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        const secAuth = typeof getSecondaryFirebaseAuth === 'function' ? getSecondaryFirebaseAuth() : null;
        if (secAuth && navigator.onLine !== false) {
            try {
                const cred = await secAuth.createUserWithEmailAndPassword(fbEmailForNew, pass);
                try {
                    if (cred && cred.user && cred.user.uid) {
                        assignedAuthUid = cred.user.uid;
                        const cleanFbUid = String(cred.user.uid).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
                        if (cleanFbUid) assignedId = 'usr_' + cleanFbUid;
                        if (!IS_LOCAL_DEV && isFirebaseReady && fbDb) {
                            const roleVal = role === 'admin' ? 'admin' : 'athlete';
                            const profilePayload = typeof buildUserProfileDocPayload === 'function'
                                ? buildUserProfileDocPayload({
                                    id: assignedId,
                                    authUid: cred.user.uid,
                                    username: uname,
                                    email: rawEmail || undefined,
                                    fbAuthEmail: fbEmailForNew,
                                    role: roleVal,
                                    status: 'approved',
                                    name: dname,
                                    avatar: cleanAvatar(typeof selectedNewAvatar !== 'undefined' ? selectedNewAvatar : global.selectedNewAvatar, 'SP'),
                                    theme: roleVal === 'admin' ? 'gold' : 'cyan',
                                    level,
                                    gender,
                                    weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
                                    passwordStrengthLevel: secCheck.levelLabel,
                                    mustChangePassword: false,
                                    passwordUpdatedAt: nowMs,
                                    approvedAt: nowMs,
                                    createdAt: nowMs,
                                    updatedAt: nowMs
                                }, cred.user.uid)
                                : null;
                            await Promise.all([
                                fbDb.collection('user_roles').doc(cred.user.uid).set({
                                    role: roleVal,
                                    appUid: assignedId,
                                    email: fbEmailForNew,
                                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true }).catch(() => {}),
                                profilePayload
                                    ? fbDb.collection('user_profiles').doc(cred.user.uid).set(profilePayload, { merge: true }).catch(() => {})
                                    : Promise.resolve(),
                                fbDb.collection('usernames').doc(uname).set({
                                    authUid: cred.user.uid,
                                    appUid: assignedId,
                                    authEmail: fbEmailForNew,
                                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                }, { merge: true }).catch(() => {})
                            ]);
                        }
                    }
                } finally {
                    await secAuth.signOut().catch(() => {});
                }
            } catch (fbCreateErr) {
                if (fbCreateErr && fbCreateErr.code === 'auth/email-already-in-use') {
                    alert("Bu e-posta adresi zaten başka bir hesapta kayıtlı.");
                    return;
                }
            }
        }

        setLocalUserCred(assignedId, {
            salt,
            passwordHash: passHash,
            passwordStrengthLevel: secCheck.levelLabel,
            mustChangePassword: !secCheck.isValid,
            passwordUpdatedAt: nowMs
        });

        const chosenAvatar = cleanAvatar(typeof selectedNewAvatar !== 'undefined' ? selectedNewAvatar : global.selectedNewAvatar, 'SP');
        const newUser = {
            id: assignedId,
            authUid: assignedAuthUid,
            username: uname,
            fbAuthEmail: fbEmailForNew,
            mustChangePassword: !secCheck.isValid,
            passwordStrengthLevel: secCheck.levelLabel,
            passwordUpdatedAt: nowMs,
            role: role === 'admin' ? 'admin' : 'athlete',
            status: 'approved',
            name: dname,
            avatar: chosenAvatar,
            theme: role === 'admin' ? 'gold' : 'cyan',
            level: level,
            gender: gender,
            weights: { press: '12', squat: '18', row: '16', rdl: '18', swing: '14', lunge: '12' },
            approvedAt: nowMs,
            createdAt: nowMs,
            updatedAt: nowMs
        };
        if (rawEmail) newUser.email = rawEmail;

        users.push(newUser);
        saveAuthUsers(users);

        document.getElementById('newUsername').value = "";
        document.getElementById('newPassword').value = "";
        document.getElementById('newDisplayName').value = "";
        if (emailEl) emailEl.value = "";

        renderPendingApprovalsBanner();
        renderAdminUserList();
        renderAdminAthleteStatuses();
        alert(`${dname} (@${uname}) başarıyla oluşturuldu.\nBelirlenen Şifre: ${pass}`);
    }

    async function resolveAuthUidForUser(target, fbDb) {
        if (target && target.authUid) return String(target.authUid);
        if (!target || !fbDb) return '';
        const unameKey = typeof toUsernameDocId === 'function' ? toUsernameDocId(target.username) : normalizeAuthString(target.username);
        if (!unameKey) return '';
        try {
            const snap = await fbDb.collection('usernames').doc(unameKey).get();
            if (snap && snap.exists) {
                const data = snap.data() || {};
                if (data.authUid) return String(data.authUid);
            }
        } catch {}
        return '';
    }

    async function adminApproveUser(userId) {
        if (!isAuthorizedForAdminPortal()) {
            alert("Bu işlem için yönetici yetkisi gereklidir.");
            return;
        }
        const users = getAuthUsers();
        const target = users.find(u => u && u.id === userId);
        if (!target) return;

        const nowMs = Date.now();
        target.status = 'approved';
        target.approvedAt = nowMs;
        target.updatedAt = nowMs;

        const { fbDb, fbAuth, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        if (!IS_LOCAL_DEV && isFirebaseReady && fbDb && fbAuth && fbAuth.currentUser) {
            const authUid = await resolveAuthUidForUser(target, fbDb);
            if (authUid) {
                target.authUid = authUid;
                if (typeof buildUserProfileDocPayload === 'function') {
                    try {
                        await fbDb.collection('user_profiles').doc(authUid).set(
                            buildUserProfileDocPayload(target, authUid, { status: 'approved', approvedAt: nowMs, updatedAt: nowMs }),
                            { merge: true }
                        );
                    } catch {}
                }
            }
        }

        saveAuthUsers(users);

        renderPendingApprovalsBanner();
        renderAdminUserList();
        renderAdminAthleteStatuses();

        openApprovalEmailDispatchModal(target);
    }

    async function adminRejectUser(userId) {
        if (!isAuthorizedForAdminPortal()) {
            alert("Bu işlem için yönetici yetkisi gereklidir.");
            return;
        }
        const users = getAuthUsers();
        const target = users.find(u => u && u.id === userId);
        if (!target) return;

        if (confirm(`${target.name} (@${target.username}) adlı kullanıcının kayıt başvurusunu reddedip silmek istediğinize emin misiniz?`)) {
            const { fbDb, fbAuth, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
            if (!IS_LOCAL_DEV && isFirebaseReady && fbDb && fbAuth && fbAuth.currentUser) {
                const authUid = await resolveAuthUidForUser(target, fbDb);
                if (authUid) {
                    try { await fbDb.collection('user_profiles').doc(authUid).delete(); } catch {}
                    try { await fbDb.collection('user_roles').doc(authUid).delete(); } catch {}
                }
                const unameKey = typeof toUsernameDocId === 'function' ? toUsernameDocId(target.username) : '';
                if (unameKey && unameKey !== 'admin') {
                    try { await fbDb.collection('usernames').doc(unameKey).delete(); } catch {}
                }
            }
            const updated = users.filter(u => u.id !== userId);
            saveAuthUsers(updated);
            renderPendingApprovalsBanner();
            renderAdminUserList();
            renderAdminAthleteStatuses();
        }
    }

    function buildApprovalEmailPayload(user) {
        const { IS_LOCAL_DEV } = getFbHandles();
        const appUrl = (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null' && !IS_LOCAL_DEV)
            ? (window.location.origin + window.location.pathname)
            : 'https://fitness.kantarci.io/';
        const subject = 'Çelik Kodu | Hesabınız Onaylandı - Giriş Yapabilirsiniz';
        const body = [
            `Merhaba ${user.name},`,
            ``,
            `Çelik Kodu Akıllı Antrenman Portalı üyelik başvurunuz yönetici tarafından onaylanmıştır.`,
            ``,
            `Giriş Bilgileriniz:`,
            `• Giriş Adresi: ${appUrl}`,
            `• E-Posta / Kullanıcı Adı: ${user.email || user.username} (@${user.username})`,
            `• Şifre: Kayıt olurken belirlediğiniz şifreniz`,
            ``,
            `Hemen giriş yaparak antrenman programınızı oluşturabilir ve seanslarınızı takip edebilirsiniz.`,
            ``,
            `Çelik Kodu Performans Sistemi`
        ].join('\n');
        return { to: user.email || '', subject, body, appUrl };
    }

    async function openApprovalEmailDispatchModal(user) {
        if (!isAuthorizedForAdminPortal()) return;
        const modal = document.getElementById('approvalEmailDispatchModal');
        if (!modal || !user) return;

        const modalBox = modal.querySelector('.modal-box');
        if (modalBox) {
            modalBox.style.background = '#181530';
            modalBox.style.color = '#F8FAFC';
            modalBox.style.border = '1.5px solid rgba(167, 139, 250, 0.25)';
        }

        const payload = buildApprovalEmailPayload(user);
        lastApprovalMessageCache = payload.body;

        const nameEl = document.getElementById('approvalModalUserName');
        const emailEl = document.getElementById('approvalModalUserEmail');
        const subjEl = document.getElementById('approvalModalSubject');
        const bodyEl = document.getElementById('approvalModalBodyPreview');
        const mailtoBtn = document.getElementById('approvalModalMailtoBtn');
        const gmailBtn = document.getElementById('approvalModalGmailBtn');
        const autoStatusEl = document.getElementById('approvalModalAutoStatus');

        if (nameEl) {
            nameEl.innerText = `${user.name} (@${user.username})`;
            nameEl.style.color = '#FDE68A';
            if (nameEl.parentElement) nameEl.parentElement.style.color = '#E2E8F0';
        }
        if (emailEl) {
            emailEl.innerText = payload.to || 'E-posta kayıtlı değil';
            emailEl.style.color = '#BAE6FD';
        }
        if (subjEl) {
            subjEl.innerText = payload.subject;
            subjEl.style.color = '#FFFFFF';
        }
        if (bodyEl) {
            bodyEl.innerText = payload.body;
            bodyEl.style.background = '#181530';
            bodyEl.style.color = '#E2E8F0';
            bodyEl.style.border = '1px solid rgba(167, 139, 250, 0.25)';
            if (bodyEl.parentElement) {
                bodyEl.parentElement.style.background = '#121024';
                bodyEl.parentElement.style.borderColor = 'rgba(167, 139, 250, 0.25)';
                bodyEl.parentElement.style.color = '#CBD5E1';
            }
        }

        const encTo = encodeURIComponent(payload.to);
        const encSubj = encodeURIComponent(payload.subject);
        const encBody = encodeURIComponent(payload.body);

        if (mailtoBtn) {
            mailtoBtn.href = `mailto:${encTo}?subject=${encSubj}&body=${encBody}`;
            mailtoBtn.style.display = payload.to ? 'block' : 'none';
            mailtoBtn.style.background = '#6D28D9';
            mailtoBtn.style.color = '#FFFFFF';
            mailtoBtn.style.borderColor = '#7C3AED';
        }
        if (gmailBtn) {
            gmailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encTo}&su=${encSubj}&body=${encBody}`;
            gmailBtn.style.display = payload.to ? 'block' : 'none';
            gmailBtn.style.background = '#0C4A6E';
            gmailBtn.style.color = '#BAE6FD';
            gmailBtn.style.borderColor = '#38BDF8';
        }

        if (autoStatusEl) {
            autoStatusEl.style.display = 'none';
            autoStatusEl.innerText = '';
        }

        modal.classList.add('active');

        // Otomatik EmailJS yapılandırılmışsa arka planda anında gönder
        if (payload.to) {
            const cfg = getAdminEmailJsConfig();
            if (cfg && cfg.serviceId && cfg.templateId && cfg.publicKey) {
                if (autoStatusEl) {
                    autoStatusEl.style.display = 'block';
                    autoStatusEl.style.background = '#0C4A6E';
                    autoStatusEl.style.color = '#BAE6FD';
                    autoStatusEl.innerText = 'Otomatik onay e-postası gönderiliyor...';
                }
                try {
                    const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            service_id: cfg.serviceId,
                            template_id: cfg.templateId,
                            user_id: cfg.publicKey,
                            template_params: {
                                to_email: payload.to,
                                to_name: user.name,
                                username: user.username,
                                subject: payload.subject,
                                message: payload.body,
                                app_url: payload.appUrl
                            }
                        })
                    });
                    if (resp.ok && autoStatusEl) {
                        autoStatusEl.style.background = '#14532D';
                        autoStatusEl.style.color = '#BBF7D0';
                        autoStatusEl.innerText = `Otomatik onay e-postası (${payload.to}) adresine başarıyla gönderildi.`;
                    } else if (autoStatusEl) {
                        autoStatusEl.style.background = '#7C2D12';
                        autoStatusEl.style.color = '#FDE68A';
                        autoStatusEl.innerText = 'Otomatik servis yanıt vermedi; aşağıdaki butonlarla tek tıkla gönderebilirsiniz.';
                    }
                } catch {
                    if (autoStatusEl) {
                        autoStatusEl.style.background = '#7C2D12';
                        autoStatusEl.style.color = '#FDE68A';
                        autoStatusEl.innerText = 'Otomatik gönderim yapılamadı; aşağıdaki butonlarla tek tıkla gönderebilirsiniz.';
                    }
                }
            }
        }
    }

    function openApprovalEmailDispatchById(userId) {
        if (!isAuthorizedForAdminPortal()) return;
        const users = getAuthUsers();
        const target = users.find(u => u && u.id === userId);
        if (target) openApprovalEmailDispatchModal(target);
    }

    function closeApprovalEmailModal() {
        const modal = document.getElementById('approvalEmailDispatchModal');
        if (modal) modal.classList.remove('active');
    }

    function copyApprovalMessageToClipboard() {
        if (!isAuthorizedForAdminPortal()) return;
        if (!lastApprovalMessageCache) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(lastApprovalMessageCache).then(() => {
                alert("Onay mesajı panoya kopyalandı.");
            });
        }
    }

    function toggleAdminEmailConfigAccordion() {
        if (!isAuthorizedForAdminPortal()) return;
        const body = document.getElementById('adminEmailConfigBody');
        const label = document.getElementById('adminEmailConfigToggleLabel');
        if (!body || !label) return;
        const isHidden = body.style.display === 'none' || !body.style.display;
        body.style.display = isHidden ? 'block' : 'none';
        label.innerText = isHidden ? '▲ Gizle' : '▼ Göster';
    }

    function getAdminEmailJsConfig() {
        if (!isAuthorizedForAdminPortal()) return null;
        try {
            const raw = localStorage.getItem('celik_kodu_emailjs_config');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function loadAdminEmailJsConfigUI() {
        if (!isAuthorizedForAdminPortal()) return;
        const cfg = getAdminEmailJsConfig() || {};
        const sEl = document.getElementById('emailJsServiceId');
        const tEl = document.getElementById('emailJsTemplateId');
        const kEl = document.getElementById('emailJsPublicKey');
        if (sEl) sEl.value = cfg.serviceId || '';
        if (tEl) tEl.value = cfg.templateId || '';
        if (kEl) kEl.value = cfg.publicKey || '';
    }

    function saveAdminEmailJsConfig() {
        if (!isAuthorizedForAdminPortal()) return;
        const sEl = document.getElementById('emailJsServiceId');
        const tEl = document.getElementById('emailJsTemplateId');
        const kEl = document.getElementById('emailJsPublicKey');
        const cfg = {
            serviceId: (sEl ? sEl.value : '').trim(),
            templateId: (tEl ? tEl.value : '').trim(),
            publicKey: (kEl ? kEl.value : '').trim()
        };
        localStorage.setItem('celik_kodu_emailjs_config', JSON.stringify(cfg));
        alert("Otomatik e-posta (EmailJS) ayarları yerel olarak kaydedildi.");
    }

    function renderAdminAthleteStatuses() {
        if (!isAuthorizedForAdminPortal()) return;
        const container = document.getElementById('adminAthleteStatusContainer');
        const kpisEl = document.getElementById('adminSummaryKpis');
        if (!container) return;

        const users = getAuthUsers();
        let totalWorkoutsAll = 0;
        let totalTonajAll = 0;

        const cardsHTML = users.map(u => {
            const logs = typeof getUserLogsById === 'function' ? getUserLogsById(u.id) : [];
            const streak = typeof calculateStreakForLogs === 'function' ? calculateStreakForLogs(logs) : 0;
            const sessionCount = logs.length;

            let userTonaj = 0;
            logs.forEach(l => {
                userTonaj += (parseFloat(l.totalVolumeKg) || 0);
            });
            totalWorkoutsAll += sessionCount;
            totalTonajAll += userTonaj;

            const lastLog = logs.length > 0 ? logs[0] : null;
            const activeStateRaw = localStorage.getItem(`celik_kodu_active_state_${u.id}`);
            const isLiveWorking = !!activeStateRaw;
            const avatarMono = cleanAvatar(u.avatar, 'SP');

            let lastLogDetailsHTML = '';
            if (lastLog) {
                const exList = lastLog.exercises || lastLog.detailedExercises || [];
                lastLogDetailsHTML = `
                    <div id="adminExDetails_${esc(u.id)}" style="display:none; margin-top:10px; padding:10px 12px; background:#121024; border-radius:8px; border:1px solid rgba(167, 139, 250, 0.25);">
                        <div style="font-size:11px; font-weight:800; color:#FDE68A; margin-bottom:8px; text-transform:uppercase; display:flex; justify-content:space-between;">
                            <span>${esc(lastLog.title)}</span>
                            <span style="color:#E2E8F0;">${esc(lastLog.dateFormatted || lastLog.date)}</span>
                        </div>
                        ${exList.length > 0 ? `
                            <div style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto; padding-right:4px;">
                                ${exList.map(ex => {
                                    const sets = (ex.sets || []).filter(s => s.completed || (parseFloat(s.weight) > 0));
                                    const setsStr = sets.length > 0
                                        ? sets.map((s, idx) => `Set ${idx + 1}: <strong style="color:#FDE68A;">${s.weight}kg</strong> x ${s.reps}`).join(' • ')
                                        : '<span style="color:#CBD5E1;">Set kaydı yok</span>';
                                    return `
                                        <div style="font-size:11px; padding:6px 8px; background:#181530; border-radius:6px; border-left:3px solid #A78BFA;">
                                            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                                                <strong style="color:#FFFFFF;">${esc(ex.name)}</strong>
                                                ${ex.muscle ? `<span style="font-size:10px; color:#BAE6FD;">[${esc(ex.muscle)}]</span>` : ''}
                                            </div>
                                            <div style="font-size:10.5px; color:#CBD5E1;">${setsStr}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<div style="font-size:11px; color:#CBD5E1;">Detaylı set kaydı bulunamadı.</div>'}
                    </div>
                `;
            }

            return `
                <div style="background:#181530; border:1px solid rgba(167, 139, 250, 0.25); border-radius:12px; padding:14px; margin-bottom:12px; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                    <!-- ATHLETE HEADER -->
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:14px; font-weight:900; color:#F3E8FF; width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:#121024; border-radius:10px; border:1px solid rgba(167, 139, 250, 0.35);">${esc(avatarMono)}</span>
                            <div>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <strong style="color:#FFFFFF; font-size:14px;">${esc(u.name)}</strong>
                                    <span style="font-size:11px; color:#CBD5E1;">@${esc(u.username)}</span>
                                    <span class="auth-role-tag ${u.role === 'admin' ? 'role-admin' : 'role-athlete'}" style="font-size:9px; padding:2px 6px;">
                                        ${u.role === 'admin' ? 'YÖNETİCİ' : 'SPORCU'}
                                    </span>
                                </div>
                                <div style="font-size:11px; color:#CBD5E1; margin-top:2px;">
                                    ${esc(u.level || 'Orta Seviye')} • ${esc(u.gender || 'Erkek')}
                                </div>
                            </div>
                        </div>
                        ${isLiveWorking ? `
                            <span style="background:#14532D; border:1px solid #4ADE80; color:#BBF7D0; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px; display:flex; align-items:center; gap:5px;">
                                <span style="width:6px; height:6px; border-radius:50%; background:#4ADE80; display:inline-block;"></span>
                                Antrenmanda
                            </span>
                        ` : ''}
                    </div>

                    <!-- 3-COL KPI STATS -->
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:10px; text-align:center;">
                        <div style="background:#121024; padding:8px 4px; border-radius:8px; border:1px solid rgba(167, 139, 250, 0.25);">
                            <div style="font-size:9.5px; color:#CBD5E1; font-weight:700;">TOPLAM SEANS</div>
                            <div style="font-size:13px; font-weight:800; color:#FFFFFF; margin-top:2px;">${sessionCount} Seans</div>
                        </div>
                        <div style="background:#121024; padding:8px 4px; border-radius:8px; border:1px solid rgba(167, 139, 250, 0.25);">
                            <div style="font-size:9.5px; color:#CBD5E1; font-weight:700;">SERİ DURUMU</div>
                            <div style="font-size:13px; font-weight:800; color:#FDE68A; margin-top:2px;">${streak} Gün</div>
                        </div>
                        <div style="background:#121024; padding:8px 4px; border-radius:8px; border:1px solid rgba(167, 139, 250, 0.25);">
                            <div style="font-size:9.5px; color:#CBD5E1; font-weight:700;">TOPLAM TONAJ</div>
                            <div style="font-size:13px; font-weight:800; color:#BAE6FD; margin-top:2px;">${Math.round(userTonaj).toLocaleString('tr-TR')} kg</div>
                        </div>
                    </div>

                    <!-- LAST WORKOUT PREVIEW -->
                    <div style="background:#121024; border-radius:8px; padding:10px 12px; border:1px solid rgba(167, 139, 250, 0.25); font-size:11.5px; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-weight:700; color:#FDE68A;">Son Antrenman Seansı:</span>
                            <span style="color:#CBD5E1; font-size:10.5px;">
                                ${lastLog ? esc(lastLog.dateFormatted || lastLog.date) : 'Kayıt Yok'}
                            </span>
                        </div>
                        ${lastLog ? `
                            <div style="color:#FFFFFF; font-weight:600; display:flex; justify-content:space-between; align-items:center;">
                                <span>${esc(lastLog.title)}</span>
                                <span style="color:#E2E8F0; font-size:11px;">${lastLog.duration || 0} dk • ${lastLog.totalSetsCompleted || 0} Set</span>
                            </div>
                        ` : `
                            <div style="color:#CBD5E1; font-style:italic;">Henüz tamamlanmış antrenman seansı bulunmuyor.</div>
                        `}
                    </div>

                    <!-- TOGGLE LAST WORKOUT DETAILS BUTTON -->
                    ${lastLog ? `
                        <button type="button" class="btn btn-outline" style="width:100%; font-size:11px; padding:7px; background:#2C2550; border-color:rgba(167, 139, 250, 0.35); color:#F3E8FF; font-weight:800;" onclick="toggleAdminAthleteDetails(decodeURIComponent('${encodeURIComponent(u.id)}'))">
                            Son Antrenman Hareket ve Set Detaylarını İncele
                        </button>
                        ${lastLogDetailsHTML}
                    ` : ''}
                </div>
            `;
        }).join('');

        if (kpisEl) {
            kpisEl.innerHTML = `
                <div style="background:#121024; padding:8px 6px; border-radius:8px; border:1px solid rgba(167, 139, 250, 0.25); text-align:center;">
                    <div style="font-size:9px; color:#CBD5E1; font-weight:700;">KAYITLI SPORCU</div>
                    <div style="font-size:14px; font-weight:900; color:#FDE68A; margin-top:2px;">${users.length}</div>
                </div>
                <div style="background:#121024; padding:8px 6px; border-radius:8px; border:1px solid rgba(167, 139, 250, 0.25); text-align:center;">
                    <div style="font-size:9px; color:#CBD5E1; font-weight:700;">TOPLAM SEANS</div>
                    <div style="font-size:14px; font-weight:900; color:#BBF7D0; margin-top:2px;">${totalWorkoutsAll}</div>
                </div>
                <div style="background:#121024; padding:8px 6px; border-radius:8px; border:1px solid rgba(167, 139, 250, 0.25); text-align:center;">
                    <div style="font-size:9px; color:#CBD5E1; font-weight:700;">TOPLAM TONAJ</div>
                    <div style="font-size:14px; font-weight:900; color:#BAE6FD; margin-top:2px;">${Math.round(totalTonajAll).toLocaleString('tr-TR')} kg</div>
                </div>
            `;
        }

        container.innerHTML = cardsHTML;
    }

    function toggleAdminAthleteDetails(uid) {
        if (!isAuthorizedForAdminPortal()) return;
        const el = document.getElementById(`adminExDetails_${uid}`);
        if (el) {
            const isHidden = el.style.display === 'none' || !el.style.display;
            el.style.display = isHidden ? 'block' : 'none';
        }
    }

    function renderAdminUserList() {
        if (!isAuthorizedForAdminPortal()) return;
        const container = document.getElementById('adminUserListContainer');
        if (!container) return;

        const users = getAuthUsers();
        const session = getSession();

        container.innerHTML = users.map(u => {
            const logs = typeof getUserLogsById === 'function' ? getUserLogsById(u.id) : [];
            const streak = typeof calculateStreakForLogs === 'function' ? calculateStreakForLogs(logs) : 0;
            const isSelf = session && session.userId === u.id;
            const isPending = u.status === 'pending';
            const safeIdAttr = encodeURIComponent(u.id);
            const avatarMono = cleanAvatar(u.avatar, 'SP');

            return `
                <div class="admin-user-card" style="background:#181530; border:1px solid ${isSelf ? '#FDE68A' : (isPending ? 'rgba(245,158,11,0.5)' : 'rgba(167, 139, 250, 0.25)')}; border-radius:10px; padding:12px; margin-bottom:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px; flex-wrap:wrap;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:12px; font-weight:900; color:#F3E8FF; width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; background:#121024; border:1px solid rgba(167, 139, 250, 0.35); border-radius:8px;">${esc(avatarMono)}</span>
                            <div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <strong style="color:#FFFFFF; font-size:13px;">${esc(u.name)}</strong>
                                    <span style="font-size:11.5px; color:#BBF7D0; font-weight:800;">(@${esc(u.username)})</span>
                                    ${isSelf ? '<span class="auth-role-tag role-admin" style="font-size:9px; padding:1px 6px;">GİRİŞ YAPILAN HESAP</span>' : ''}
                                    ${!isSelf ? (isPending
                                        ? '<span style="font-size:9.5px; background:#7C2D12; color:#FDE68A; border:1px solid rgba(251,191,36,0.35); padding:1px 6px; border-radius:6px; font-weight:800;">ONAY BEKLİYOR</span>'
                                        : '<span style="font-size:9.5px; background:#14532D; color:#BBF7D0; border:1px solid rgba(74,222,128,0.35); padding:1px 6px; border-radius:6px; font-weight:800;">ONAYLI</span>') : ''}
                                </div>
                                ${u.email ? `<div style="font-size:11px; color:#BAE6FD; margin-top:2px;">${esc(u.email)}</div>` : ''}
                                <div style="font-size:11px; color:#CBD5E1;">
                                    ${esc(u.level || 'Orta Seviye')} • ${esc(u.gender || 'Erkek')}
                                </div>
                            </div>
                        </div>
                        <div style="display:flex; gap:6px; flex-wrap:wrap;">
                            ${!isSelf && isPending ? `
                                <button type="button" class="btn btn-gold" style="font-size:10px; padding:4px 8px; background:#14532D; border-color:#22C55E; color:#BBF7D0; font-weight:800;" onclick="adminApproveUser(decodeURIComponent('${safeIdAttr}'))">
                                    Onayla &amp; Mail
                                </button>
                            ` : (!isSelf && u.email ? `
                                <button type="button" class="btn btn-outline" style="font-size:10px; padding:4px 8px; background:#0C4A6E; color:#BAE6FD; border-color:#38BDF8;" onclick="openApprovalEmailDispatchById(decodeURIComponent('${safeIdAttr}'))" title="Onay E-Postasını Gönder">
                                    Mail Gönder
                                </button>
                            ` : '')}
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:4px 8px; background:#2C2550; color:#F3E8FF; border-color:rgba(167, 139, 250, 0.35); font-weight:800;" onclick="toggleAdminEditUserBox(decodeURIComponent('${safeIdAttr}'))" title="Kullanıcı Adı, Ad Soyad ve E-Posta Düzenle">
                                Kullanıcı Adı
                            </button>
                            <button type="button" class="btn btn-outline" style="font-size:10px; padding:4px 8px; background:#7C2D12; color:#FDE68A; border-color:rgba(251, 191, 36, 0.45);" onclick="adminResetUserPassword(decodeURIComponent('${safeIdAttr}'))" title="Şifre Belirle / Sıfırla">
                                Şifre
                            </button>
                            ${!isSelf ? `
                                <button type="button" class="btn btn-outline" style="font-size:10px; padding:4px 8px; background:#7F1D1D; color:#FECACA; border-color:#F87171;" onclick="adminDeleteUser(decodeURIComponent('${safeIdAttr}'))" title="Kullanıcıyı Sil">
                                    Sil
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- INLINE KULLANICI ADI / AD SOYAD / E-POSTA DÜZENLEME PANELİ (VARSAYILAN KAPALI) -->
                    <div id="adminEditBox_${esc(u.id)}" style="display:none; margin-top:8px; padding:10px; background:#121024; border:1.5px solid rgba(167, 139, 250, 0.25); border-radius:8px;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
                            <div>
                                <label class="form-label" style="font-size:10.5px; color:#E2E8F0;">Yeni Kullanıcı Adı (@)</label>
                                <input type="text" id="adminEditUname_${esc(u.id)}" class="form-input" value="${esc(u.username || '')}" style="font-size:12px; padding:6px 8px; background:#181530; color:#FFFFFF; border:1px solid rgba(167, 139, 250, 0.3);" autocapitalize="none" spellcheck="false">
                            </div>
                            <div>
                                <label class="form-label" style="font-size:10.5px; color:#E2E8F0;">Ad Soyad</label>
                                <input type="text" id="adminEditName_${esc(u.id)}" class="form-input" value="${esc(u.name || '')}" style="font-size:12px; padding:6px 8px; background:#181530; color:#FFFFFF; border:1px solid rgba(167, 139, 250, 0.3);">
                            </div>
                        </div>
                        <div style="margin-bottom:8px;">
                            <label class="form-label" style="font-size:10.5px; color:#E2E8F0;">E-Posta Adresi</label>
                            <input type="email" id="adminEditEmail_${esc(u.id)}" class="form-input" value="${esc(u.email || '')}" placeholder="ornek@gmail.com" style="font-size:12px; padding:6px 8px; background:#181530; color:#FFFFFF; border:1px solid rgba(167, 139, 250, 0.3);" autocapitalize="none" spellcheck="false">
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:6px;">
                            <button type="button" class="btn btn-outline" style="font-size:11px; padding:5px 10px; background:#2C2550; color:#F3E8FF; border-color:rgba(167, 139, 250, 0.35);" onclick="toggleAdminEditUserBox(decodeURIComponent('${safeIdAttr}'))">Vazgeç</button>
                            <button type="button" class="btn btn-gold" style="font-size:11px; padding:5px 12px; font-weight:800; background:#6D28D9; color:#FFFFFF; border-color:#7C3AED;" onclick="adminSaveUserIdentity(decodeURIComponent('${safeIdAttr}'))">Değişiklikleri Kaydet</button>
                        </div>
                    </div>

                    <div style="font-size:11px; color:#CBD5E1; display:flex; justify-content:space-between; border-top:1px solid rgba(167, 139, 250, 0.25); padding-top:6px; margin-top:6px;">
                        <span>Güvenlik: <span style="color:#4ADE80; font-weight:700;">Salted SHA-256</span></span>
                        <span>${logs.length} Seans • Seri: ${streak} Gün</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function toggleAdminEditUserBox(userId) {
        if (!isAuthorizedForAdminPortal()) return;
        const box = document.getElementById(`adminEditBox_${userId}`);
        if (!box) return;
        const isHidden = box.style.display === 'none' || !box.style.display;
        box.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            const input = document.getElementById(`adminEditUname_${userId}`);
            if (input) input.focus();
        }
    }

    async function adminSaveUserIdentity(userId) {
        if (!isAuthorizedForAdminPortal()) {
            alert("Yalnızca yöneticiler kullanıcı bilgilerini düzenleyebilir.");
            return;
        }
        const session = getSession();

        const unameEl = document.getElementById(`adminEditUname_${userId}`);
        const nameEl = document.getElementById(`adminEditName_${userId}`);
        const emailEl = document.getElementById(`adminEditEmail_${userId}`);

        const rawUname = (unameEl ? unameEl.value : '').trim();
        const newUname = typeof toUsernameDocId === 'function' ? toUsernameDocId(rawUname) : normalizeAuthString(rawUname);
        const newName = (nameEl ? nameEl.value : '').trim();
        const newEmail = (emailEl ? emailEl.value : '').trim().toLowerCase();

        if (!newUname || !newName) {
            alert("Kullanıcı adı ve Ad Soyad boş bırakılamaz.");
            return;
        }

        const users = getAuthUsers();
        const target = users.find(u => u && u.id === userId);
        if (!target) {
            alert("Kullanıcı bulunamadı.");
            return;
        }

        const duplicateUname = users.some(u => u.id !== userId && normalizeAuthString(u.username) === newUname);
        if (duplicateUname) {
            alert(`"@${newUname}" kullanıcı adı başka bir hesapta zaten kullanılıyor.`);
            return;
        }

        if (newEmail) {
            const duplicateEmail = users.some(u => u.id !== userId && u.email && u.email.toLowerCase() === newEmail);
            if (duplicateEmail) {
                alert(`"${newEmail}" e-posta adresi başka bir hesapta zaten kullanılıyor.`);
                return;
            }
        }

        const oldUname = target.username;
        target.username = newUname;
        target.name = newName;
        target.updatedAt = Date.now();
        if (newEmail) {
            target.email = newEmail;
        } else {
            delete target.email;
        }

        if (Array.isArray(target.aliases) && !target.aliases.includes(newUname)) {
            target.aliases.push(newUname);
        }

        const { fbDb, fbAuth, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        if (!IS_LOCAL_DEV && isFirebaseReady && fbDb && fbAuth && fbAuth.currentUser) {
            const authUid = await resolveAuthUidForUser(target, fbDb);
            if (authUid) {
                target.authUid = authUid;
                if (typeof buildUserProfileDocPayload === 'function') {
                    try {
                        await fbDb.collection('user_profiles').doc(authUid).set(
                            buildUserProfileDocPayload(target, authUid),
                            { merge: true }
                        );
                    } catch {}
                }
                if (/^[a-z0-9._-]{2,40}$/.test(newUname) && newUname !== 'admin') {
                    try {
                        await fbDb.collection('usernames').doc(newUname).set({
                            authUid,
                            appUid: target.id,
                            authEmail: target.fbAuthEmail || target.email || `${target.id}@auth.celikkodu.app`,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        }, { merge: true });
                        const oldKey = typeof toUsernameDocId === 'function' ? toUsernameDocId(oldUname) : normalizeAuthString(oldUname);
                        if (oldKey && oldKey !== newUname && oldKey !== 'admin') {
                            await fbDb.collection('usernames').doc(oldKey).delete().catch(() => {});
                        }
                    } catch {}
                }
            }
        }

        saveAuthUsers(users);

        if (session && session.userId === userId) {
            session.username = newUname;
            session.name = newName;
            localStorage.setItem('celik_kodu_session', JSON.stringify(session));
            if (typeof applyActiveUserProfile === 'function') applyActiveUserProfile();
        }

        renderPendingApprovalsBanner();
        renderAdminUserList();
        renderAdminAthleteStatuses();
        alert(`Kullanıcı bilgileri güncellendi.\n• Kullanıcı Adı: @${oldUname} -> @${newUname}\n• Ad Soyad: ${newName}`);
    }

    async function adminResetUserPassword(userId) {
        if (!isAuthorizedForAdminPortal()) {
            alert("Yalnızca yöneticiler şifre sıfırlayabilir.");
            return;
        }
        const session = getSession();
        const users = getAuthUsers();
        const target = users.find(u => u && u.id === userId);
        if (!target) {
            alert("Kullanıcı bulunamadı.");
            return;
        }
        const { fbDb, fbAuth, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
        const fbEmail = typeof getCanonicalFbAuthEmail === 'function' ? getCanonicalFbAuthEmail(target) : (target.fbAuthEmail || target.email || '');
        if (session && session.userId !== userId && fbAuth && fbEmail && !fbEmail.endsWith('@auth.celikkodu.app') && navigator.onLine !== false) {
            const sendLink = confirm(`@${target.username} (${fbEmail}) adresine resmi şifre sıfırlama bağlantısı gönderilsin mi?\n\nTamam: E-postaya sıfırlama bağlantısı gönderir\nİptal: Bu cihaz için yeni şifre tanımlar`);
            if (sendLink) {
                try {
                    await fbAuth.sendPasswordResetEmail(fbEmail);
                    alert(`Şifre sıfırlama bağlantısı (${fbEmail}) adresine gönderildi.`);
                    return;
                } catch {}
            }
        }

        const newPass = prompt(`@${target.username} (${target.name}) için yeni şifre belirleyin (en az 8 karakter, harf ve rakam):`, "");
        if (!newPass) return;
        const cleanPass = newPass.trim();
        const secCheck = typeof evaluatePasswordSecurity === 'function'
            ? evaluatePasswordSecurity(cleanPass, target)
            : { isValid: cleanPass.length >= 8, levelLabel: 'Güçlü', reason: 'Parola en az 8 karakter, harf ve rakam içermelidir.' };
        if (!secCheck.isValid || cleanPass.length < 8) {
            alert(secCheck.reason || "Parola en az 8 karakter, harf ve rakam içermelidir.");
            return;
        }
        if (session && session.userId === userId && fbAuth && fbAuth.currentUser && navigator.onLine !== false) {
            try {
                await fbAuth.currentUser.updatePassword(cleanPass);
            } catch {}
        }
        const nowMs = Date.now();
        const salt = generateSecureSalt();
        const passHash = await sha256Hex(salt + cleanPass);
        setLocalUserCred(target.id, {
            salt,
            passwordHash: passHash,
            passwordStrengthLevel: secCheck.levelLabel,
            mustChangePassword: !secCheck.isValid,
            passwordUpdatedAt: nowMs
        });
        delete target.password;
        delete target.passwordHash;
        delete target.salt;
        target.mustChangePassword = !secCheck.isValid;
        target.passwordStrengthLevel = secCheck.levelLabel;
        target.passwordUpdatedAt = nowMs;
        target.updatedAt = nowMs;

        if (!IS_LOCAL_DEV && isFirebaseReady && fbDb && fbAuth && fbAuth.currentUser && target.authUid && typeof buildUserProfileDocPayload === 'function') {
            try {
                await fbDb.collection('user_profiles').doc(target.authUid).set(
                    buildUserProfileDocPayload(target, target.authUid),
                    { merge: true }
                );
            } catch {}
        }

        saveAuthUsers(users);
        renderAdminUserList();
        alert(`@${target.username} kullanıcısının şifresi başarıyla güncellendi.\nGüçlü şifre tanımlandı.`);
    }

    function adminSwitchToUser(targetUserId) {
        if (!isAuthorizedForAdminPortal()) return;
        alert("Güvenlik nedeniyle hesaplar arası geçiş devre dışı bırakılmıştır.");
    }

    async function adminDeleteUser(userId) {
        if (!isAuthorizedForAdminPortal()) {
            alert("Bu işlem için yönetici yetkisi gereklidir.");
            return;
        }

        const users = getAuthUsers();
        const target = users.find(u => u && u.id === userId);
        if (!target) return;

        if (confirm(`@${target.username} (${target.name}) kullanıcısını silmek istediğinize emin misiniz?`)) {
            const { fbDb, fbAuth, isFirebaseReady, IS_LOCAL_DEV } = getFbHandles();
            if (!IS_LOCAL_DEV && isFirebaseReady && fbDb && fbAuth && fbAuth.currentUser) {
                const authUid = await resolveAuthUidForUser(target, fbDb);
                if (authUid) {
                    try { await fbDb.collection('user_profiles').doc(authUid).delete(); } catch {}
                    try { await fbDb.collection('user_roles').doc(authUid).delete(); } catch {}
                }
                const unameKey = typeof toUsernameDocId === 'function' ? toUsernameDocId(target.username) : '';
                if (unameKey && unameKey !== 'admin') {
                    try { await fbDb.collection('usernames').doc(unameKey).delete(); } catch {}
                }
            }
            localStorage.removeItem(`celik_kodu_history_${userId}`);
            localStorage.removeItem(`celik_kodu_custom_programs_${userId}`);
            localStorage.removeItem(`celik_kodu_deleted_programs_${userId}`);
            localStorage.removeItem(`celik_kodu_mobility_tests_${userId}`);
            localStorage.removeItem(`celik_excluded_exercises_${userId}`);
            localStorage.removeItem(`celik_excluded_updated_at_${userId}`);
            localStorage.removeItem(`celik_kodu_last_generated_workout_${userId}`);
            localStorage.removeItem(`celik_kodu_state_updated_at_${userId}`);
            localStorage.removeItem(`celik_kodu_pending_state_sync_${userId}`);
            localStorage.removeItem(`celik_kodu_active_state_${userId}`);
            const updated = users.filter(u => u.id !== userId);
            saveAuthUsers(updated);
            renderAdminUserList();
            renderAdminAthleteStatuses();
        }
    }

    Object.assign(global, {
        syncUsersToCloud,
        syncAllUsersForAdmin,
        openAdminModal,
        closeAdminModal,
        switchAdminModalTab,
        renderPendingApprovalsBanner,
        setAdminTelemetryFilter,
        renderAdminSystemTelemetry,
        removeSingleAdminTelemetryEvent,
        clearAdminTelemetryEvents,
        buildAdminTelemetryAiPrompt,
        copyCloudSubChiefReportToClipboard,
        copyAdminTelemetryPromptToClipboard,
        selectNewAvatar,
        generateStrongPasswordForAdmin,
        handleCreateUser,
        adminApproveUser,
        adminRejectUser,
        openApprovalEmailDispatchModal,
        openApprovalEmailDispatchById,
        closeApprovalEmailModal,
        copyApprovalMessageToClipboard,
        toggleAdminEmailConfigAccordion,
        getAdminEmailJsConfig,
        loadAdminEmailJsConfigUI,
        saveAdminEmailJsConfig,
        renderAdminAthleteStatuses,
        toggleAdminAthleteDetails,
        renderAdminUserList,
        toggleAdminEditUserBox,
        adminSaveUserIdentity,
        adminResetUserPassword,
        adminSwitchToUser,
        adminDeleteUser
    });

    global.CelikAdminPortal = {
        mountAdminPortalDOM,
        unmountAdminPortalDOM,
        isMounted
    };
})(typeof window !== 'undefined' ? window : globalThis);
