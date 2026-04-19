

const NyanAuth = {

    KEY_TAG:    'nyan_online_tag',
    KEY_UID:    'nyan_online_uid',
    KEY_LINKED: 'nyan_online_linked',
    KEY_EMAIL:  'nyan_online_email',

    currentUser: null,
    _unsubAuth:  null,

    _safeInt(value, fallback = 0, min = 0, max = 999999999) {
        const n = Number(value);
        if (!Number.isFinite(n)) return fallback;
        const parsed = Math.floor(n);
        return Math.max(min, Math.min(max, parsed));
    },

    _seasonScorePath(seasonId, uid = '') {
        const base = window.Seasons?._collectionPath?.(seasonId) || `leaderboards/season_${seasonId}/scores`;
        return uid ? `${base}/${uid}` : base;
    },

    _applyRemoteEconomyToLocal(profile = null) {
        if (!profile || !window.Economy?.load || !window.Economy?.save || !window.Economy?.calcLevel) return false;

        const remoteChips = this._safeInt(profile.chips, 0, 0);
        const remoteTotalXP = this._safeInt(profile.totalXP, 0, 0);
        const local = window.Economy.load();
        const localChips = this._safeInt(local.chips, 0, 0);
        const localTotalXP = this._safeInt(local.totalXP, 0, 0);

        if (remoteChips === localChips && remoteTotalXP === localTotalXP) return false;

        const levelData = window.Economy.calcLevel(remoteTotalXP);
        local.chips = remoteChips;
        local.totalXP = remoteTotalXP;
        local.level = Number(levelData.level || 1);
        local.xp = Number(levelData.xp || 0);
        local.xpToNext = Math.max(1, Number(levelData.xpToNext || 100));
        window.Economy.save(local);
        window.Economy._refreshUI?.();
        return true;
    },

    async _applyRemoteSeasonToLocal(uid = '') {
        const safeUID = String(uid || '').trim();
        if (!safeUID || !window.NyanFirebase?.isReady?.() || !window.Seasons?.getCurrentSeason?.()) return false;

        const season = window.Seasons.getCurrentSeason();
        if (!season?.id || !window.Seasons?.save) return false;

        const entry = await window.NyanFirebase.getDoc(this._seasonScorePath(season.id, safeUID));
        if (!entry) return false;

        const remoteXP = this._safeInt(entry.seasonXP, 0, 0);
        const remoteTier = this._safeInt(entry.tier, 1, 1);
        const localXP = this._safeInt(season.seasonXP, 0, 0);
        const localTier = this._safeInt(season.tier, 1, 1);

        if (remoteXP === localXP && remoteTier === localTier) return false;

        season.seasonXP = remoteXP;
        season.tier = Math.max(1, window.Seasons.getTierByXP?.(remoteXP) || remoteTier);
        window.Seasons.save(season);
        window.Seasons._refreshSidebarWidget?.();
        if (window.Router?.currentRoute === 'season') {
            window.Router.render();
        }
        return true;
    },

    async _hydrateLocalStateFromCloud(uid = '') {
        const safeUID = String(uid || this.getUID() || '').trim();
        if (!safeUID || !NyanFirebase.isReady()) return { success: false, code: 'offline-or-no-uid' };

        const profile = await NyanFirebase.getDoc(`users/${safeUID}`);
        if (!profile) return { success: false, code: 'profile-not-found' };

        const legacyTitleBadgeMap = {
            title_season1_badge: 'badge_season1',
            title_security_sentinel_v310: 'badge_security_sentinel_v310',
            title_bug_hunter_v310: 'badge_security_sentinel_v310',
        };
        const legacyFixPayload = {};
        const legacyTitleCandidates = [
            String(profile.profileTitleId || '').trim(),
            String(profile.profileTitle?.id || '').trim(),
            String(profile.specialTitle?.id || '').trim(),
        ].filter(Boolean);
        const mappedLegacyBadgeId = legacyTitleCandidates
            .map((titleId) => legacyTitleBadgeMap[titleId] || '')
            .find(Boolean);

        const legacyFromProfileTitleId = !!legacyTitleBadgeMap[String(profile.profileTitleId || '').trim()];
        const legacyFromProfileTitle = !!legacyTitleBadgeMap[String(profile.profileTitle?.id || '').trim()];
        const legacyFromSpecialTitle = !!legacyTitleBadgeMap[String(profile.specialTitle?.id || '').trim()];
        const hadLegacyBadgeTitle = legacyFromProfileTitleId || legacyFromProfileTitle || legacyFromSpecialTitle;

        if (legacyFromProfileTitleId) {
            profile.profileTitleId = null;
            legacyFixPayload.profileTitleId = null;
        }
        if (legacyFromProfileTitle) {
            profile.profileTitle = null;
            legacyFixPayload.profileTitle = null;
        }
        if (legacyFromSpecialTitle) {
            profile.specialTitle = null;
            legacyFixPayload.specialTitle = null;
        }

        if (mappedLegacyBadgeId) {
            const badge = window.Badges?.getBadge?.(mappedLegacyBadgeId) || {
                id: mappedLegacyBadgeId,
                name: mappedLegacyBadgeId === 'badge_security_sentinel_v310' ? 'Sentinela v3.10' : 'Badge da Temporada',
                icon: mappedLegacyBadgeId === 'badge_security_sentinel_v310' ? '\u{1F6E1}\uFE0F' : '\u{1F396}\uFE0F',
                rarity: mappedLegacyBadgeId === 'badge_security_sentinel_v310' ? 'exclusive' : 'seasonal',
            };
            const currentProfileBadgeId = String(profile.profileBadgeId || profile.profileBadge?.id || '').trim();
            const currentProfileBadges = Array.isArray(profile.profileBadges) ? [...profile.profileBadges] : [];
            const currentShowcase = Array.isArray(profile.profileBadgeShowcase) ? [...profile.profileBadgeShowcase] : [];

            if (!currentProfileBadgeId) {
                profile.profileBadgeId = badge.id;
                profile.profileBadge = {
                    id: badge.id,
                    name: badge.name,
                    icon: badge.icon,
                    rarity: badge.rarity,
                };
                legacyFixPayload.profileBadgeId = badge.id;
                legacyFixPayload.profileBadge = profile.profileBadge;
            }

            if (!currentProfileBadges.some((entry) => String(entry?.id || '').trim() === badge.id)) {
                profile.profileBadges = [
                    {
                        id: badge.id,
                        name: badge.name,
                        icon: badge.icon,
                        rarity: badge.rarity,
                    },
                    ...currentProfileBadges,
                ];
                legacyFixPayload.profileBadges = profile.profileBadges;
            }

            if (!currentShowcase.length) {
                profile.profileBadgeShowcase = [badge.id];
                legacyFixPayload.profileBadgeShowcase = profile.profileBadgeShowcase;
            }
        }

        if (Object.keys(legacyFixPayload).length > 0) {
            NyanFirebase.updateDoc(`users/${safeUID}`, legacyFixPayload).catch(() => {});
        }
        if (hadLegacyBadgeTitle && mappedLegacyBadgeId && window.Badges?.unlock) {
            window.Badges.unlock(mappedLegacyBadgeId, { silent: true, skipSync: true, autoEquip: false });
            window.Badges.equip?.(mappedLegacyBadgeId, { silent: true, skipSync: true });
        }

        this.currentUser = profile;
        Utils.saveData(this.KEY_UID, safeUID);
        Utils.saveData(this.KEY_TAG, profile.nyanTag || '');
        Utils.saveData(this.KEY_LINKED, true);
        if (profile.email) Utils.saveData(this.KEY_EMAIL, profile.email);

        this._applyRemoteEconomyToLocal(profile);
        await this._applyRemoteSeasonToLocal(safeUID).catch(() => false);
        window.Badges?.hydrateFromProfile?.(profile, { skipSync: true });

        this._dispatchOnlineReady(safeUID, profile.nyanTag || '');
        return { success: true, uid: safeUID, profile };
    },

    async init() {
        const fbReady = await NyanFirebase.init();
        if (!fbReady) {
            return false;
        }

        await this._tryAutoLogin();

        if (this._unsubAuth) {
            try { this._unsubAuth(); } catch (_) {}
            this._unsubAuth = null;
        }
        this._unsubAuth = NyanFirebase.fn.onAuthStateChanged(
            NyanFirebase.auth,
            (user) => this._onAuthChanged(user)
        );

        return true;
    },

    async _tryAutoLogin() {
        const preferredUID = String(Utils.loadData(this.KEY_UID) || '').trim();
        const preferredEmail = String(Utils.loadData(this.KEY_EMAIL) || '').trim();
        const preferredPwd = String(Utils.loadData('nyan_online_pwd') || '').trim();

        const currentUser = NyanFirebase.auth.currentUser;
        if (currentUser) {
            const currentUID = String(currentUser.uid || '').trim();
            if (
                preferredUID &&
                preferredUID !== currentUID &&
                preferredEmail &&
                preferredPwd
            ) {
                try {
                    const { signInWithEmailAndPassword } = NyanFirebase.fn;
                    const cred = await signInWithEmailAndPassword(NyanFirebase.auth, preferredEmail, preferredPwd);
                    await this._loadProfile(cred.user.uid);
                    return true;
                } catch (_) {
                    // Fallback para a sessao autenticada atual.
                }
            }
            await this._loadProfile(currentUser.uid);
            return true;
        }

        const email = Utils.loadData(this.KEY_EMAIL);
        const pwd   = Utils.loadData('nyan_online_pwd');
        if (email && pwd) {
            try {
                const { signInWithEmailAndPassword } = NyanFirebase.fn;
                const cred = await signInWithEmailAndPassword(NyanFirebase.auth, email, pwd);
                await this._loadProfile(cred.user.uid);
                return true;
            } catch (e) {
                console.warn('[NyanAuth] Auto-login falhou:', e.code);
                if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
                    Utils.removeData('nyan_online_pwd');
                }
            }
        }

        const uid = Utils.loadData(this.KEY_UID);
        if (uid) {
            const hydrated = await this._hydrateLocalStateFromCloud(uid);
            if (hydrated.success) return true;
        }
        return false;
    },

    async _loadProfile(uid) {
        await this._hydrateLocalStateFromCloud(uid);
    },

    _dispatchOnlineReady(uid, tag) {
        if (!tag) return;

        const applyToSidebar = () => {
            const dot    = document.getElementById('sidebar-presence-dot');
            const status = document.getElementById('sidebar-online-status');
            if (!status) return false; // sidebar ainda não existe
            status.textContent    = tag;
            status.style.color    = 'rgba(168,85,247,0.85)';
            status.style.fontWeight = '700';
            status.style.fontSize   = '0.62rem';
            status.style.overflow   = 'hidden';
            status.style.textOverflow = 'ellipsis';
            status.style.whiteSpace   = 'nowrap';
            if (dot) {
                dot.style.background = '#a855f7';
                dot.style.boxShadow  = '0 0 4px rgba(168,85,247,0.8)';
            }
            return true;
        };

        window.dispatchEvent(new CustomEvent('nyan:online-ready', { detail: { uid, tag } }));

        if (!applyToSidebar()) {
            const observer = new MutationObserver(() => {
                if (applyToSidebar()) observer.disconnect();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => observer.disconnect(), 10000);
        }
    },

    STATUS_OPTIONS: [
        { key: 'online',  label: 'Online',  color: '#4ade80', dot: '🟢' },
        { key: 'playing', label: 'Jogando', color: '#a855f7', dot: '🟣' },
        { key: 'away',    label: 'Ausente', color: '#fbbf24', dot: '🟡' },
        { key: 'offline', label: 'Offline', color: '#9ca3af', dot: '⚫' },
    ],

    showStatusPicker() {
        if (!this.isOnline()) return;
        document.getElementById('nyan-status-picker')?.remove();

        const current = Utils.loadData('nyan_custom_status') || 'online';
        const d    = document.body.classList.contains('dark-theme');
        const bg   = d ? '#1a1a2e' : '#ffffff';
        const bdr  = d ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const text = d ? '#f1f5f9' : '#0f172a';

        const picker = document.createElement('div');
        picker.id = 'nyan-status-picker';
        picker.style.cssText =
            'position:fixed;top:140px;left:12px;z-index:9999;' +
            'background:' + bg + ';border:1px solid ' + bdr + ';' +
            'border-radius:14px;padding:0.5rem;' +
            'box-shadow:0 8px 32px rgba(0,0,0,0.25);' +
            "font-family:'DM Sans',sans-serif;min-width:160px;";

        picker.innerHTML = this.STATUS_OPTIONS.map(function(s) {
            var isActive = s.key === current;
            return '<button onclick="NyanAuth.setCustomStatus(\''+s.key+'\',event)" ' +
                'style="display:flex;align-items:center;gap:0.625rem;width:100%;' +
                'padding:0.5rem 0.75rem;border:none;border-radius:9px;cursor:pointer;' +
                'background:' + (isActive ? 'rgba(168,85,247,0.12)' : 'transparent') + ';' +
                'color:' + text + ';font-size:0.82rem;font-weight:' + (isActive ? '700' : '500') + ';' +
                'font-family:\'DM Sans\',sans-serif;text-align:left;transition:background 0.15s;">' +
                '<span style="width:8px;height:8px;border-radius:50%;background:' + s.color + ';flex-shrink:0;display:inline-block;"></span>' +
                s.label +
                '</button>';
        }).join('');

        document.body.appendChild(picker);
        setTimeout(() => document.addEventListener('click', function _close(e) {
            if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', _close); }
        }), 100);
    },

    async setCustomStatus(statusKey) {
        document.getElementById('nyan-status-picker')?.remove();
        const uid = this.getUID();
        if (!uid) return;

        Utils.saveData('nyan_custom_status', statusKey);

        const opt = this.STATUS_OPTIONS.find(s => s.key === statusKey) || this.STATUS_OPTIONS[0];

        await NyanFirebase.updateDoc('users/' + uid, {
            status: statusKey,
            lastSeen: NyanFirebase.fn.serverTimestamp()
        }).catch(() => {});

        if (NyanFirebase.rtdb && NyanFirebase.fn.ref && NyanFirebase.fn.set) {
            NyanFirebase.fn.set(
                NyanFirebase.fn.ref(NyanFirebase.rtdb, 'presence/' + uid),
                { online: statusKey !== 'offline', status: statusKey, lastSeen: NyanFirebase.fn.serverTimestampRTDB() }
            ).catch(() => {});
        }

        const dot = document.getElementById('sidebar-presence-dot');
        if (dot) {
            dot.style.background = opt.color;
            dot.style.boxShadow  = '0 0 4px ' + opt.color + '88';
        }
        const statusEl = document.getElementById('sidebar-online-status');
        if (statusEl && statusEl.textContent !== Utils.loadData('nyan_online_tag')) {
        }

        Utils.showNotification(opt.dot + ' Status: ' + opt.label, 'info');
    },

    async promptNyanTag(username) {
        if (!NyanFirebase.isReady()) return;

        if (Utils.loadData(this.KEY_LINKED)) {
            await this._hydrateLocalStateFromCloud().catch(() => {});
            await this._syncLocalProfile({ includeEconomy: false });
            const tag = Utils.loadData(this.KEY_TAG);
            const uid = Utils.loadData(this.KEY_UID);
            if (tag) this._dispatchOnlineReady(uid, tag);
            return;
        }

        this._showAuthModal(username);
    },

    _showAuthModal(username) {
        document.getElementById('nyantag-modal')?.remove();

        const suggestedTag  = this._suggestTag(username);
        const initialDigits = this._randomDigits();
        const d   = document.body.classList.contains('dark-theme');
        const bg  = d ? '#0e0e16' : '#ffffff';
        const txt = d ? '#f1f5f9' : '#0f172a';
        const sub = d ? 'rgba(255,255,255,0.45)' : '#6b7280';
        const iBg = d ? 'rgba(255,255,255,0.06)' : '#f4f4f9';
        const iBd = d ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';

        const iStyle = `width:100%;padding:0.7rem 1rem;background:${iBg};border:1.5px solid ${iBd};
            border-radius:12px;color:${txt};font-size:0.875rem;font-family:'DM Sans',sans-serif;
            outline:none;box-sizing:border-box;transition:border-color 0.18s,box-shadow 0.18s;`;

        const lStyle = `font-size:0.62rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
            color:${sub};display:block;margin-bottom:0.35rem;`;

        const modal = document.createElement('div');
        modal.id = 'nyantag-modal';
        modal.style.cssText = `position:fixed;inset:0;z-index:99999;display:flex;align-items:center;
            justify-content:center;background:rgba(0,0,0,0.75);animation:ntFadeIn 0.2s ease;`;

        modal.innerHTML = `
        <style>
            @keyframes ntFadeIn  { from{opacity:0} to{opacity:1} }
            @keyframes ntSlideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
            #nt-card { animation:ntSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1); }
            .nt-input:focus { border-color:rgba(168,85,247,0.6)!important; box-shadow:0 0 0 3px rgba(168,85,247,0.1); }
            .nt-tab { flex:1;padding:0.55rem;border-radius:10px;border:none;cursor:pointer;
                font-size:0.8rem;font-weight:700;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
            .nt-tab.active { background:rgba(168,85,247,0.15);color:rgba(168,85,247,0.9);border:1px solid rgba(168,85,247,0.3); }
            .nt-tab:not(.active) { background:transparent;color:${sub};border:1px solid transparent; }
            .nt-panel { display:none; }
            .nt-panel.active { display:block; }
        </style>
        <div id="nt-card" style="background:${bg};border:1px solid rgba(255,255,255,0.08);
            border-radius:20px;padding:1.75rem;width:100%;max-width:380px;margin:0 1rem;
            box-shadow:0 32px 80px rgba(0,0,0,0.6);font-family:'DM Sans',sans-serif;">

            <div style="text-align:center;margin-bottom:1.25rem;">
                <div style="font-size:2.25rem;margin-bottom:0.5rem;">🏷️</div>
                <h2 style="font-family:'Syne',sans-serif;font-weight:900;font-size:1.15rem;color:${txt};margin:0 0 0.2rem;">
                    Conta Online にゃん~
                </h2>
                <p style="font-size:0.75rem;color:${sub};margin:0;">Crie ou acesse sua conta para jogar com amigos</p>
            </div>

            <div style="display:flex;gap:0.25rem;background:rgba(255,255,255,0.04);
                border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:0.3rem;margin-bottom:1.25rem;">
                <button class="nt-tab active" id="nt-tab-reg" onclick="NyanAuth._switchTab('register')">✨ Criar conta</button>
                <button class="nt-tab" id="nt-tab-login" onclick="NyanAuth._switchTab('login')">🔑 Já tenho conta</button>
            </div>

            <div class="nt-panel active" id="nt-panel-register">
                <div style="display:flex;flex-direction:column;gap:0.625rem;margin-bottom:0.875rem;">
                    <div>
                        <label style="${lStyle}">Seu NyanTag</label>
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            <input id="nt-reg-tag" class="nt-input" type="text" value="${suggestedTag}"
                                maxlength="16" placeholder="seunome" style="${iStyle}flex:1;"/>
                            <span style="font-size:0.9rem;font-weight:700;color:rgba(168,85,247,0.7);white-space:nowrap;">
                                #<span id="nt-reg-digits">${initialDigits}</span>
                            </span>
                        </div>
                    </div>
                    <div>
                        <label style="${lStyle}">Email</label>
                        <input id="nt-reg-email" class="nt-input" type="email"
                            placeholder="seu@email.com" style="${iStyle}"/>
                    </div>
                    <div>
                        <label style="${lStyle}">Senha</label>
                        <input id="nt-reg-pwd" class="nt-input" type="password"
                            placeholder="Mínimo 6 caracteres" style="${iStyle}"/>
                    </div>
                </div>
                <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);
                    border-radius:10px;padding:0.6rem 0.875rem;margin-bottom:0.875rem;font-size:0.75rem;color:${sub};">
                    Seu NyanTag será: <strong style="color:${txt};">
                        <span id="nt-reg-preview">${suggestedTag}</span>#<span id="nt-reg-digits2">${initialDigits}</span>
                    </strong>
                </div>
            </div>

            <div class="nt-panel" id="nt-panel-login">
                <div style="display:flex;flex-direction:column;gap:0.625rem;margin-bottom:0.75rem;">
                    <div>
                        <label style="${lStyle}">Email</label>
                        <input id="nt-login-email" class="nt-input" type="email"
                            placeholder="seu@email.com" style="${iStyle}"/>
                    </div>
                    <div>
                        <label style="${lStyle}">Senha</label>
                        <input id="nt-login-pwd" class="nt-input" type="password"
                            placeholder="Sua senha" style="${iStyle}"/>
                    </div>
                </div>
                <button onclick="NyanAuth._forgotPassword()" style="background:none;border:none;
                    color:rgba(168,85,247,0.7);font-size:0.72rem;cursor:pointer;padding:0;
                    margin-bottom:0.875rem;font-family:'DM Sans',sans-serif;text-decoration:underline;">
                    Esqueci minha senha
                </button>
            </div>

            <div id="nt-status" style="font-size:0.72rem;min-height:1.2rem;margin-bottom:0.625rem;"></div>
            <button id="nt-btn" onclick="NyanAuth._submitModal()"
                style="width:100%;padding:0.8rem;border-radius:12px;border:none;
                    background:linear-gradient(135deg,#7c3aed,#ec4899);color:white;
                    font-size:0.875rem;font-weight:700;font-family:'Syne',sans-serif;
                    cursor:pointer;box-shadow:0 4px 16px rgba(124,58,237,0.35);
                    transition:filter 0.15s,transform 0.15s;margin-bottom:0.5rem;">
                ✨ Criar conta
            </button>
            <button onclick="document.getElementById('nyantag-modal').remove()"
                style="width:100%;padding:0.55rem;border-radius:10px;border:none;
                    background:transparent;color:${sub};font-size:0.75rem;font-weight:600;
                    font-family:'DM Sans',sans-serif;cursor:pointer;">
                Pular por agora (modo offline)
            </button>
        </div>`;

        document.body.appendChild(modal);

        let _digits = initialDigits;
        const tagInput  = modal.querySelector('#nt-reg-tag');
        const digitsEl  = modal.querySelector('#nt-reg-digits');
        const digits2El = modal.querySelector('#nt-reg-digits2');
        const previewEl = modal.querySelector('#nt-reg-preview');

        tagInput?.addEventListener('input', () => {
            const val = this._sanitizeTag(tagInput.value);
            tagInput.value = val;
            if (previewEl) previewEl.textContent = val || 'seunome';
        });

        modal._getDigits      = () => _digits;
        modal._refreshDigits  = (d) => {
            _digits = d;
            if (digitsEl)  digitsEl.textContent  = d;
            if (digits2El) digits2El.textContent = d;
        };
        modal._activeTab = 'register';

        modal.querySelectorAll('.nt-input').forEach(inp => {
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') NyanAuth._submitModal(); });
        });
    },

    _switchTab(tab) {
        const modal = document.getElementById('nyantag-modal');
        if (!modal) return;
        modal.querySelector('#nt-tab-reg')?.classList.toggle('active', tab === 'register');
        modal.querySelector('#nt-tab-login')?.classList.toggle('active', tab === 'login');
        modal.querySelector('#nt-panel-register')?.classList.toggle('active', tab === 'register');
        modal.querySelector('#nt-panel-login')?.classList.toggle('active', tab === 'login');
        const btn = modal.querySelector('#nt-btn');
        if (btn) btn.textContent = tab === 'register' ? '✨ Criar conta' : '🔑 Entrar';
        const st = modal.querySelector('#nt-status');
        if (st) st.textContent = '';
        modal._activeTab = tab;
    },

    async _submitModal() {
        const modal  = document.getElementById('nyantag-modal');
        if (!modal) return;
        const status = modal.querySelector('#nt-status');
        const tab    = modal._activeTab || 'register';

        const setStatus = (msg, color = 'inherit') => {
            if (status) { status.textContent = msg; status.style.color = color; }
        };

        if (tab === 'login') {
            const email = modal.querySelector('#nt-login-email')?.value.trim();
            const pwd   = modal.querySelector('#nt-login-pwd')?.value;
            if (!email || !pwd) { setStatus('⚠️ Preencha email e senha', '#f59e0b'); return; }
            setStatus('⏳ Entrando...');
            const r = await this.loginWithEmail(email, pwd);
            if (r.success) { setStatus('✅ Logado!', '#10b981'); setTimeout(() => modal.remove(), 900); }
            else setStatus(`❌ ${r.error}`, '#ef4444');
        } else {
            const tagName = this._sanitizeTag(modal.querySelector('#nt-reg-tag')?.value || '');
            const digits  = modal._getDigits?.() || this._randomDigits();
            const email   = modal.querySelector('#nt-reg-email')?.value.trim();
            const pwd     = modal.querySelector('#nt-reg-pwd')?.value;

            if (!tagName || tagName.length < 2) { setStatus('⚠️ Tag muito curto (mín. 2)', '#f59e0b'); return; }
            if (!email || !email.includes('@')) { setStatus('⚠️ Email inválido', '#f59e0b'); return; }
            if (!pwd || pwd.length < 6)         { setStatus('⚠️ Senha mínimo 6 caracteres', '#f59e0b'); return; }

            setStatus('⏳ Criando conta...');
            const r = await this.registerWithEmail(tagName, digits, email, pwd);
            if (r.success) { setStatus(`✅ Conta criada: ${r.tag}`, '#10b981'); setTimeout(() => modal.remove(), 1200); }
            else if (r.taken) { modal._refreshDigits?.(this._randomDigits()); setStatus('❌ Tag indisponível — novo número gerado', '#ef4444'); }
            else setStatus(`❌ ${r.error}`, '#ef4444');
        }
    },

    async registerWithEmail(tagName, digits, email, password) {
        const tag    = `${tagName}#${digits}`;
        const tagKey = tag.toLowerCase();
        try {
            if (await NyanFirebase.getDoc(`nyantags/${tagKey}`)) return { success: false, taken: true };

            const { createUserWithEmailAndPassword, updateProfile } = NyanFirebase.fn;
            const cred = await createUserWithEmailAndPassword(NyanFirebase.auth, email, password);
            const uid  = cred.user.uid;
            await updateProfile(cred.user, { displayName: tagName });

            const localUser = Auth.getStoredUser() || {};
            const economy   = window.Economy?.getState?.() || {};
            const equippedBadge = window.Badges?.getEquippedBadge?.() || null;
            const ownedBadges = window.Badges?.getOwnedBadges?.() || [];
            const showcaseBadgeIds = window.Badges?.getShowcaseIds?.() || [];
            const now       = NyanFirebase.fn.serverTimestamp();

            const profile = {
                uid, email, nyanTag: tag, nyanTagKey: tagKey,
                username:  localUser.username || tagName,
                avatar:    Utils.loadData('nyan_profile_avatar') || null,
                bio: '', status: 'online',
                version:  window.App?.version || '3.10.0',
                level:    economy.level   || 1,
                chips:    economy.chips   || 0,
                totalXP:  economy.totalXP || 0,
                profileBadgeId: equippedBadge?.id || null,
                profileBadge: equippedBadge
                    ? {
                        id: equippedBadge.id,
                        name: equippedBadge.name,
                        icon: equippedBadge.icon,
                        rarity: equippedBadge.rarity || 'achievement',
                    }
                    : null,
                profileBadgeShowcase: showcaseBadgeIds,
                profileBadges: ownedBadges.map((badge) => ({
                    id: badge.id,
                    name: badge.name,
                    icon: badge.icon,
                    rarity: badge.rarity || 'achievement',
                })),
                joinedAt: now, lastSeen: now,
                friends: [], friendRequests: [],
            };

            const { runTransaction, doc } = NyanFirebase._mod.fsMod;
            await runTransaction(NyanFirebase.db, async (tx) => {
                tx.set(doc(NyanFirebase.db, `nyantags/${tagKey}`), { uid, tag, createdAt: now });
                tx.set(doc(NyanFirebase.db, `users/${uid}`), profile);
            });

            Utils.saveData(this.KEY_TAG,    tag);
            Utils.saveData(this.KEY_UID,    uid);
            Utils.saveData(this.KEY_EMAIL,  email);
            Utils.saveData(this.KEY_LINKED, true);
            Utils.saveData('nyan_online_pwd', password);
            this.currentUser = profile;

            this._dispatchOnlineReady(uid, tag);
            Utils.showNotification(`🏷️ Conta criada: ${tag}`, 'success');
            return { success: true, uid, tag };
        } catch (err) {
            return { success: false, error: this._friendlyError(err.code) };
        }
    },

    async loginWithEmail(email, password) {
        try {
            const { signInWithEmailAndPassword } = NyanFirebase.fn;
            const cred    = await signInWithEmailAndPassword(NyanFirebase.auth, email, password);
            const uid     = cred.user.uid;
            const profile = await NyanFirebase.getDoc(`users/${uid}`);
            if (!profile) return { success: false, error: 'Perfil não encontrado' };

            Utils.saveData(this.KEY_TAG,    profile.nyanTag);
            Utils.saveData(this.KEY_UID,    uid);
            Utils.saveData(this.KEY_EMAIL,  email);
            Utils.saveData(this.KEY_LINKED, true);
            Utils.saveData('nyan_online_pwd', password);
            this.currentUser = profile;
            this._applyRemoteEconomyToLocal(profile);
            await this._applyRemoteSeasonToLocal(uid).catch(() => false);
            window.Badges?.hydrateFromProfile?.(profile, { skipSync: true });

            this._dispatchOnlineReady(uid, profile.nyanTag);
            Utils.showNotification(`✅ Bem-vindo de volta, ${profile.nyanTag}!`, 'success');
            return { success: true };
        } catch (err) {
            return { success: false, error: this._friendlyError(err.code) };
        }
    },

    async _forgotPassword() {
        const emailInput = document.getElementById('nt-login-email');
        const email      = emailInput?.value.trim();
        const status     = document.querySelector('#nyantag-modal #nt-status');
        if (!email || !email.includes('@')) {
            if (status) { status.textContent = '⚠️ Digite seu email acima primeiro'; status.style.color = '#f59e0b'; }
            emailInput?.focus(); return;
        }
        try {
            const { sendPasswordResetEmail } = NyanFirebase.fn;
            await sendPasswordResetEmail(NyanFirebase.auth, email);
            if (status) { status.textContent = `✅ Email de recuperação enviado para ${email}`; status.style.color = '#10b981'; }
        } catch (err) {
            if (status) { status.textContent = `❌ ${this._friendlyError(err.code)}`; status.style.color = '#ef4444'; }
        }
    },

    async findByTag(tag) {
        const tagDoc = await NyanFirebase.getDoc(`nyantags/${tag.toLowerCase()}`);
        if (!tagDoc) return null;
        return await NyanFirebase.getDoc(`users/${tagDoc.uid}`);
    },

    async _syncLocalProfile(options = {}) {
        const includeEconomy = options.includeEconomy !== false;
        const uid = this.getUID();
        if (!uid || !NyanFirebase.isReady()) return { success: false, code: 'offline-or-no-uid' };
        const economy   = window.Economy?.getState?.() || {};
        const equippedBadge = window.Badges?.getEquippedBadge?.() || null;
        const ownedBadges = window.Badges?.getOwnedBadges?.() || [];
        const showcaseBadgeIds = window.Badges?.getShowcaseIds?.() || [];
        const localUser = Auth.getStoredUser() || {};
        const scoreKeys = {
            'typeracer_highscore': 'sc_typeracer',
            'game_2048_highscore': 'sc_2048',
            'flappy_bird_highscore': 'sc_flappy',
            'quiz_highscore': 'sc_quiz',
            'termo_best': 'sc_termo',
            'snake_highscore': 'sc_snake',
        };
        const scores = {};
        for (const [localKey, firestoreKey] of Object.entries(scoreKeys)) {
            const val = parseFloat(Utils.loadData(localKey));
            if (val > 0) scores[firestoreKey] = val;
        }

        const achUnlocked = Utils.loadData('nyan_achievements') || {};
        if (Object.keys(achUnlocked).length > 0) {
            scores['sc_achievements'] = achUnlocked;
        }

        const payload = {
            username: localUser.username || this.currentUser?.username,
            avatar:   Utils.loadData('nyan_profile_avatar') || null,
            version:  window.App?.version || '3.10.0',
            lastSeen: NyanFirebase.fn.serverTimestamp(),
            sc_updatedAt: NyanFirebase.fn.serverTimestamp(),
            profileBadgeId: equippedBadge?.id || null,
            profileBadge: equippedBadge
                ? {
                    id: equippedBadge.id,
                    name: equippedBadge.name,
                    icon: equippedBadge.icon,
                    rarity: equippedBadge.rarity || 'achievement',
                }
                : null,
            profileBadgeShowcase: showcaseBadgeIds,
            profileBadges: ownedBadges.map((badge) => ({
                id: badge.id,
                name: badge.name,
                icon: badge.icon,
                rarity: badge.rarity || 'achievement',
            })),
            ...scores,
        };
        if (includeEconomy) {
            payload.level = economy.level || 1;
            payload.chips = economy.chips || 0;
            payload.totalXP = economy.totalXP || 0;
        }

        const updated = await NyanFirebase.updateDoc(`users/${uid}`, payload);
        if (!updated) return { success: false, code: 'update-failed' };

        if (window.Leaderboard?.syncAllLocalScores) {
            setTimeout(() => Leaderboard.syncAllLocalScores(), 500);
        }
        return { success: true };
    },

    _onAuthChanged(user) {
        const uid = String(user?.uid || '').trim();
        if (!uid) return;
        this._loadProfile(uid).catch(() => {});
    },

    async logout() {
        NyanFirebase.cleanupListeners();
        if (NyanFirebase.isReady()) {
            const uid = Utils.loadData(this.KEY_UID);
            if (uid) await NyanFirebase.updateDoc(`users/${uid}`, {
                status: 'offline', lastSeen: NyanFirebase.fn.serverTimestamp()
            }).catch(() => {});
            await NyanFirebase.fn.signOut(NyanFirebase.auth).catch(() => {});
        }
        this.currentUser = null;
        if (this._unsubAuth) { this._unsubAuth(); this._unsubAuth = null; }
    },

    getNyanTag()  { return this.currentUser?.nyanTag || Utils.loadData(this.KEY_TAG); },
    getUID()      { return NyanFirebase?.auth?.currentUser?.uid || Utils.loadData(this.KEY_UID); },
    isLinked()    { return !!Utils.loadData(this.KEY_LINKED); },
    isOnline()    { return NyanFirebase.isReady() && !!NyanFirebase?.auth?.currentUser?.uid; },

    _friendlyError(code) {
        const map = {
            'auth/email-already-in-use':   'Este email já está em uso',
            'auth/invalid-email':          'Email inválido',
            'auth/weak-password':          'Senha muito fraca (mín. 6 caracteres)',
            'auth/user-not-found':         'Email não encontrado',
            'auth/wrong-password':         'Senha incorreta',
            'auth/invalid-credential':     'Email ou senha incorretos',
            'auth/too-many-requests':      'Muitas tentativas — aguarde alguns minutos',
            'auth/network-request-failed': 'Sem conexão com a internet',
        };
        return map[code] || `Erro: ${code}`;
    },

    _suggestTag(username) {
        return (username || 'nyan').replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 16) || 'nyan';
    },

    _sanitizeTag(str) {
        return (str || '').replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 16);
    },

    _randomDigits() {
        return String(Math.floor(1000 + Math.random() * 9000));
    },
};


window.NyanAuth = NyanAuth;
