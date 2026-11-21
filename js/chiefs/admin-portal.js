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

    function buildAdminModalsHtml() {
        return `
    <!-- ==================== ADMIN MANAGEMENT MODAL ==================== -->
    <div id="adminModal" class="modal-overlay">
        <div class="modal-box" style="max-width: 600px; width: 95%;">
            <div class="modal-header">
                <span class="modal-title">👑 Sporcu Yönetim Portalı (Admin)</span>
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
                    <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin:0;">⏳ Onay Bekleyen Kayıt Başvuruları</h3>
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
                    <h3 style="font-size:13px; font-weight:800; color:#FFFFFF; margin:0;">📋 Sporcuların Antrenman & Kilo Durumları</h3>
                    <span style="font-size:10.5px; color:var(--text-secondary);">Hesap değiştirmeden canlı teftiş</span>
                </div>
                <div id="adminAthleteStatusContainer"></div>
            </div>

            <!-- TAB 2: SPORCU HESAP YÖNETİMİ -->
            <div id="adminViewManage" style="display:none;">
                <!-- ADD NEW USER SECTION -->
                <div style="background:var(--bg-surface); border:1px solid var(--gold); border-radius:10px; padding:14px; margin-bottom:16px;">
                    <h3 style="font-size:13px; font-weight:800; color:var(--gold); margin-bottom:10px;">➕ Yeni Sporcu Oluştur (Doğrudan Onaylı)</h3>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;" class="form-group">
                        <div>
                            <label class="form-label">Kullanıcı Adı</label>
                            <input type="text" id="newUsername" class="form-input" placeholder="Örn: ahmet" autocapitalize="none">
                        </div>
                        <div>
                            <label class="form-label">Şifre (En az 6 karakter)</label>
                            <input type="text" id="newPassword" class="form-input" value="123456" minlength="6">
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

                    <div class="form-group">
                        <label class="form-label">E-Posta Adresi (Opsiyonel)</label>
                        <input type="email" id="newEmail" class="form-input" placeholder="ornek@gmail.com" autocapitalize="none">
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

                <!-- COLLAPSIBLE EMAILJS / WEBHOOK AUTO-EMAIL SETTINGS -->
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleAdminEmailConfigAccordion()">
                        <span style="font-size:12px; font-weight:800; color:#FFFFFF;">📧 Otomatik E-Posta Servisi Ayarları (EmailJS)</span>
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
                            💾 Otomatik Mail Ayarlarını Kaydet
                        </button>
                    </div>
                </div>

                <!-- ATHLETES LIST -->
                <h3 style="font-size:13px; font-weight:800; color:#FFFFFF; margin-bottom:10px;">📋 Kayıtlı Sporcu Hesapları</h3>
                <div id="adminUserListContainer"></div>
            </div>

            <!-- TAB 3: SİSTEM İZLEME (4 KAPILI KARA KUTU) -->
            <div id="adminViewTelemetry" style="display:none;">
                <div id="adminTelemetryKpis" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-bottom:12px;"></div>

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
                    <button type="button" onclick="copyAdminTelemetryPromptToClipboard()" style="font-size:11.5px; font-weight:800; padding:9px 10px; border-radius:10px; border:1px solid rgba(74,222,128,0.45); background:#14532D; color:#BBF7D0; cursor:pointer; white-space:nowrap;">Düzeltme Emri Kopyala</button>
                    <button type="button" onclick="clearAdminTelemetryEvents()" style="font-size:11.5px; font-weight:800; padding:9px 10px; border-radius:10px; border:1px solid rgba(248,113,113,0.45); background:#7F1D1D; color:#FECACA; cursor:pointer; white-space:nowrap;">Tümünü Temizle</button>
                </div>

                <div id="adminTelemetryListContainer" style="display:flex; flex-direction:column; gap:8px; max-height:46vh; overflow-y:auto;"></div>
            </div>
        </div>
    </div>

    <!-- ==================== APPROVAL EMAIL DISPATCH MODAL ==================== -->
    <div id="approvalEmailDispatchModal" class="modal-overlay" onclick="if(event.target === this) closeApprovalEmailModal()">
        <div class="modal-box" style="max-width: 480px; width: 94%;">
            <div class="modal-header">
                <span class="modal-title" style="color:#4ADE80;">✅ Hesap Onaylandı & Onay Maili</span>
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
                    📧 Varsayılan Mail Uygulaması İle Gönder
                </a>
                <a id="approvalModalGmailBtn" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="text-align:center; text-decoration:none; padding:10px; font-weight:800; font-size:12px; border-color:var(--cyan); color:var(--cyan); display:block;">
                    🌐 Gmail Web İle Tek Tıkla Gönder
                </a>
                <button type="button" class="btn btn-outline" style="padding:9px; font-size:11.5px;" onclick="copyApprovalMessageToClipboard()">
                    📋 Onay Mesajını Kopyala
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
                            👑 Sporcu Yönetim Portalı (Admin) <span id="profileAdminTelemetryBadge" style="display:none; background:#DC2626; color:#FFFFFF; font-size:10px; font-weight:800; padding:1px 6px; border-radius:999px; margin-left:4px;">0</span>
                        </button>`;
    }

    function buildSheetAdminButtonHtml() {
        return `<div class="more-sheet-btn" id="sheetAdminBtn" onclick="closeMoreSheet(); openAdminModal();" style="display:flex;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-secondary);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                <span>Sporcu Yönetimi</span>
                <span id="sheetAdminTelemetryBadge" style="display:none; background:#DC2626; color:#FFFFFF; font-size:9.5px; font-weight:800; padding:1px 6px; border-radius:999px; margin-left:auto;">0</span>
            </div>`;
    }

    let _adminPortalMounted = false;

    function isAuthorizedForAdminPortal() {
        if (typeof isVerifiedAdminSession === 'function') {
            return Boolean(isVerifiedAdminSession());
        }
        if (typeof getSession === 'function') {
            const s = getSession();
            return Boolean(s && s.role === 'admin' && s.authVerified === true);
        }
        return false;
    }

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

    global.CelikAdminPortal = {
        mountAdminPortalDOM,
        unmountAdminPortalDOM,
        isMounted
    };
})(typeof window !== 'undefined' ? window : globalThis);
