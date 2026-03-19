/* ══════════════════════════════════════════════════
   PROFILE.JS v1.0.0 — NyanTools にゃん~
   Aba de Perfil do Usuário
   - Avatar com upload de imagem local (base64)
   - Editar nome de usuário
   - Trocar senha
   - Stats pessoais
 ═══════════════════════════════════════════════════*/

const Profile = {
    _tab: 'profile', // 'profile' | 'stats'
    _previewUrl: null,

    // ── STORAGE KEYS ─────────────────────────────────
    KEYS: {
        avatar:   'nyan_profile_avatar',
        username: 'toolbox_user',
        password: 'nyan_profile_pass',  // separado do auth por ora
    },

    // ── RENDER PRINCIPAL ─────────────────────────────

    render() {
        const user     = Auth?.getStoredUser?.() || {};
        const username = user.username || 'Usuário';
        const avatar   = Utils.loadData(this.KEYS.avatar);
        const initial  = username.charAt(0).toUpperCase();

        return `
        <div class="profile-root">

            <!-- ── HERO ── -->
            <div class="profile-hero">
                <div class="profile-avatar-wrap" onclick="${avatar ? 'Profile._openLightbox()' : 'Profile._openAvatarPicker()'}" title="${avatar ? 'Ver foto' : 'Adicionar foto'}">
                    ${avatar
                        ? `<img src="${avatar}" class="profile-avatar-img" alt="Avatar"/>`
                        : (window.AvatarGenerator
                            ? AvatarGenerator.generate(username, 80)
                            : `<div class="profile-avatar-initial">${initial}</div>`)
                    }
                    <div class="profile-avatar-overlay">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                    </div>
                </div>
                <input type="file" id="avatar-file-input" accept="image/*" style="display:none"
                       onchange="Profile._onAvatarFileChange(event)"/>

                <div class="profile-hero-info">
                    <div class="profile-hero-badge">✦ Membro</div>
                    <div class="profile-hero-name">${username}</div>
                    <div class="profile-hero-role">にゃん~ · <span class="profile-hero-since">desde ${this._formatDate(user.loginDate)}</span></div>
                </div>
            </div>

            <!-- ── TABS ── -->
            <div class="profile-tabs">
                <button class="profile-tab ${this._tab === 'profile' ? 'active' : ''}"
                        onclick="Profile._setTab('profile')">
                    👤 Perfil
                </button>
                <button class="profile-tab ${this._tab === 'stats' ? 'active' : ''}"
                        onclick="Profile._setTab('stats')">
                    📊 Estatísticas
                </button>
            </div>

            <!-- ── CONTEÚDO ── -->
            <div class="profile-content">
                ${this._tab === 'profile' ? this._renderProfileTab(username) : this._renderStatsTab()}
            </div>

        </div>`;
    },

    // ── TAB: PERFIL ───────────────────────────────────

    _renderProfileTab(username) {
        return `
        <div class="profile-sections">

            <!-- Avatar -->
            <div class="profile-card">
                <div class="profile-card-title">Foto de Perfil</div>
                <div class="profile-avatar-section">
                    <div class="profile-avatar-preview" id="avatar-preview-wrap"
                         onclick="Profile._openAvatarPicker()"
                         title="Clique para trocar a foto"
                         style="cursor:pointer;">
                        ${this._renderAvatarPreview(username)}
                    </div>
                    <div class="profile-avatar-actions">
                        <p class="profile-hint">Clique na foto para trocar. Suporta JPG, PNG e GIF.</p>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                            <button class="profile-btn profile-btn-secondary" onclick="Profile._openAvatarPicker()">
                                📁 Escolher arquivo
                            </button>
                            <button class="profile-btn profile-btn-ghost" onclick="Profile._removeAvatar()">
                                🗑️ Remover foto
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Nome -->
            <div class="profile-card">
                <div class="profile-card-title">Nome de Usuário</div>
                <div class="profile-field-wrap">
                    <input type="text"
                           id="profile-username-input"
                           class="profile-input"
                           value="${username}"
                           maxlength="30"
                           placeholder="Seu nome..."
                           oninput="Profile._onUsernameInput(this)"/>
                    <div class="profile-char-count" id="username-count">${username.length}/30</div>
                </div>
                <button class="profile-btn profile-btn-primary" onclick="Profile._saveUsername()">
                    Salvar nome
                </button>
            </div>

            <!-- Senha -->
            <div class="profile-card">
                <div class="profile-card-title">Trocar Senha</div>
                <div class="profile-fields">
                    <div class="profile-field-wrap">
                        <input type="password"
                               id="profile-pass-current"
                               class="profile-input"
                               placeholder="Senha atual"/>
                    </div>
                    <div class="profile-field-wrap">
                        <input type="password"
                               id="profile-pass-new"
                               class="profile-input"
                               placeholder="Nova senha (mín. 4 caracteres)"/>
                    </div>
                    <div class="profile-field-wrap">
                        <input type="password"
                               id="profile-pass-confirm"
                               class="profile-input"
                               placeholder="Confirmar nova senha"/>
                    </div>
                </div>
                <button class="profile-btn profile-btn-primary" onclick="Profile._savePassword()">
                    Trocar senha
                </button>
            </div>

        </div>`;
    },

    _renderAvatarPreview(username) {
        const avatar  = Utils.loadData(this.KEYS.avatar);
        const initial = username.charAt(0).toUpperCase();
        return avatar
            ? `<img src="${avatar}" class="profile-avatar-img-lg" alt="Avatar"/>`
            : (window.AvatarGenerator
                ? AvatarGenerator.generate(username, 96)
                : `<div class="profile-avatar-initial-lg">${initial}</div>`);
    },

    // ── TAB: STATS ────────────────────────────────────

    _renderStatsTab() {
        const stats = this._collectStats();
        return `
        <div class="profile-sections">

            <!-- Cards de resumo -->
            <div class="profile-stats-grid">
                <div class="profile-stat-card">
                    <span class="profile-stat-icon">⏱️</span>
                    <div class="profile-stat-value">${stats.totalTime}</div>
                    <div class="profile-stat-label">Tempo total</div>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-icon">📅</span>
                    <div class="profile-stat-value">${stats.activeDays}</div>
                    <div class="profile-stat-label">Dias ativos</div>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-icon">🔥</span>
                    <div class="profile-stat-value">${stats.streak}</div>
                    <div class="profile-stat-label">Sequência</div>
                </div>
                <div class="profile-stat-card">
                    <span class="profile-stat-icon">🖱️</span>
                    <div class="profile-stat-value">${stats.totalAccess}</div>
                    <div class="profile-stat-label">Acessos totais</div>
                </div>
            </div>

            <!-- Conquistas -->
            ${window.Achievements ? Achievements.renderSection() : ''}

            <!-- Top ferramentas -->
            <div class="profile-card">
                <div class="profile-card-title">🏆 Ferramentas Favoritas</div>
                ${stats.topTools.length > 0
                    ? `<div class="profile-top-tools">
                        ${stats.topTools.map((t, i) => `
                            <div class="profile-top-tool">
                                <div class="profile-top-rank">${['🥇','🥈','🥉'][i] || `#${i+1}`}</div>
                                <span class="profile-top-icon">${t.icon}</span>
                                <span class="profile-top-name">${t.name}</span>
                                <span class="profile-top-count">${t.count} acessos</span>
                                <div class="profile-top-bar-wrap">
                                    <div class="profile-top-bar" style="width:${Math.round((t.count/stats.topTools[0].count)*100)}%"></div>
                                </div>
                            </div>
                        `).join('')}
                       </div>`
                    : `<p class="profile-hint">Nenhum dado ainda. Comece a usar as ferramentas! にゃん~</p>`
                }
            </div>

            <!-- Atividade da semana -->
            <div class="profile-card">
                <div class="profile-card-title">📆 Atividade Recente</div>
                <div class="profile-week-grid">
                    ${stats.weekDays.map(d => `
                        <div class="profile-week-day">
                            <div class="profile-week-bar-wrap">
                                <div class="profile-week-bar ${d.isToday ? 'today' : ''}"
                                     style="height:${d.height}%"
                                     title="${d.label}: ${d.time}"></div>
                            </div>
                            <div class="profile-week-label ${d.isToday ? 'today' : ''}">${d.short}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

        </div>`;
    },

    // ── COLETA DE STATS ───────────────────────────────

    _collectStats() {
        const s = Utils.loadData('dashboard_stats') || {};

        const toolAccess  = s.toolAccess    || {};
        const weeklyAct   = s.weeklyActivity || {};
        const dailyAct    = s.dailyActivity  || {};
        const streak      = s.dailyStreak    || 0;
        const totalMins   = s.totalTime      || 0;

        const totalTime = totalMins >= 60
            ? `${Math.floor(totalMins/60)}h ${totalMins%60}min`
            : `${totalMins}min`;

        const activeDays = Object.values(dailyAct).filter(v => v > 0).length;

        const totalAccess = Object.values(toolAccess).reduce((a, b) => a + b, 0);

        // Top tools — excluir ferramentas de sistema
        const SYSTEM_TOOLS = ['settings', 'profile', 'updates'];
        const toolMap = Object.fromEntries((window.App?.tools || []).map(t => [t.id, t]));
        const topTools = Object.entries(toolAccess)
            .filter(([id]) => !SYSTEM_TOOLS.includes(id))
            .map(([id, count]) => ({ id, count, ...toolMap[id] }))
            .filter(t => t.name)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Semana atual
        const days  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
        const shorts = ['D','S','T','Q','Q','S','S'];
        const today  = new Date().getDay();
        const maxVal = Math.max(...Object.values(weeklyAct), 1);
        const weekDays = days.map((label, i) => {
            const val = weeklyAct[i] || 0;
            return {
                label,
                short: shorts[i],
                time:  val >= 60 ? `${Math.floor(val/60)}h ${val%60}min` : `${val}min`,
                height: Math.max(4, Math.round((val / maxVal) * 100)),
                isToday: i === today
            };
        });

        return { totalTime, activeDays, streak, totalAccess, topTools, weekDays };
    },

    // ── AVATAR ────────────────────────────────────────

    _openAvatarPicker() {
        document.getElementById('avatar-file-input')?.click();
    },

    _avatarPreviewClick() {
        const avatar = Utils.loadData(this.KEYS.avatar);
        if (avatar) this._openLightbox();
        else this._openAvatarPicker();
    },

    _openLightbox() {
        const avatar = Utils.loadData(this.KEYS.avatar);
        if (!avatar) return;

        document.getElementById('nyan-avatar-lightbox')?.remove();

        const lb = document.createElement('div');
        lb.id = 'nyan-avatar-lightbox';
        lb.style.cssText = `
            position:fixed;inset:0;z-index:999999;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.88);
            animation:lbFadeIn 0.2s ease;
            cursor:zoom-out;
        `;
        lb.innerHTML = `
            <style>
                @keyframes lbFadeIn  { from{opacity:0} to{opacity:1} }
                @keyframes lbZoomIn  { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
            </style>
            <div style="position:relative;animation:lbZoomIn 0.25s cubic-bezier(0.34,1.2,0.64,1);">
                <img src="${avatar}"
                     style="max-width:90vw;max-height:85vh;border-radius:16px;
                            box-shadow:0 32px 80px rgba(0,0,0,0.8);
                            display:block;object-fit:contain;"
                     alt="Avatar"/>
                <button onclick="document.getElementById('nyan-avatar-lightbox').remove()"
                        style="position:absolute;top:-12px;right:-12px;
                               width:32px;height:32px;border-radius:50%;
                               background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);
                               color:white;font-size:14px;cursor:pointer;
                               display:flex;align-items:center;justify-content:center;
                               transition:background 0.15s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.12)'">✕</button>
            </div>
        `;

        lb.addEventListener('click', e => { if (e.target === lb) lb.remove(); });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', esc); }
        });
        document.body.appendChild(lb);
    },

    _onAvatarFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            Utils.showNotification('Imagem muito grande (máx. 2MB)', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result;
            Utils.saveData(this.KEYS.avatar, base64);
            this._updateSidebarAvatar(base64);
            Utils.showNotification('✅ Foto atualizada!', 'success');
            Router.render();
        };
        reader.readAsDataURL(file);
    },

    _removeAvatar() {
        Utils.removeData(this.KEYS.avatar);
        this._updateSidebarAvatar(null);
        Utils.showNotification('Foto removida', 'info');
        Router.render();
    },

    _updateSidebarAvatar(base64) {
        const el       = document.getElementById('user-avatar');
        const username = Auth?.getStoredUser?.()?.username || 'U';
        if (!el) return;
        if (base64) {
            el.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="Avatar"/>`;
            el.style.background = '';
        } else if (window.AvatarGenerator) {
            AvatarGenerator.clearCache();
            el.innerHTML = AvatarGenerator.generate(username, 30);
            el.style.background = 'transparent';
        } else {
            el.innerHTML = '';
            el.textContent = username.charAt(0).toUpperCase();
        }
    },

    // ── USERNAME ──────────────────────────────────────

    _onUsernameInput(input) {
        const count = document.getElementById('username-count');
        if (count) count.textContent = `${input.value.length}/30`;
    },

    _saveUsername() {
        const input = document.getElementById('profile-username-input');
        const val   = input?.value.trim();

        if (!val || val.length < 2) {
            Utils.showNotification('Nome muito curto (mín. 2 caracteres)', 'warning');
            return;
        }

        const user = Auth?.getStoredUser?.() || {};
        user.username = val;
        Auth.saveUser(user);

        // Atualizar sidebar
        const display = document.getElementById('user-display');
        const avatar  = document.getElementById('user-avatar');
        if (display) display.textContent = val;
        if (avatar && !Utils.loadData(this.KEYS.avatar)) {
            if (window.AvatarGenerator) {
                AvatarGenerator.clearCache();
                avatar.innerHTML = AvatarGenerator.generate(val, 30);
                avatar.style.background = 'transparent';
            } else {
                avatar.textContent = val.charAt(0).toUpperCase();
            }
        }

        Utils.showNotification('✅ Nome atualizado! にゃん~', 'success');
        Router.render();
    },

    // ── PASSWORD ──────────────────────────────────────

    _savePassword() {
        const current  = document.getElementById('profile-pass-current')?.value;
        const next     = document.getElementById('profile-pass-new')?.value;
        const confirm  = document.getElementById('profile-pass-confirm')?.value;

        const stored = Utils.loadData(this.KEYS.password);

        if (stored && current !== stored) {
            Utils.showNotification('Senha atual incorreta', 'error');
            return;
        }
        if (!next || next.length < 4) {
            Utils.showNotification('Nova senha muito curta (mín. 4 caracteres)', 'warning');
            return;
        }
        if (next !== confirm) {
            Utils.showNotification('As senhas não coincidem', 'error');
            return;
        }

        Utils.saveData(this.KEYS.password, next);
        Utils.showNotification('✅ Senha atualizada!', 'success');

        // Limpar campos
        ['profile-pass-current','profile-pass-new','profile-pass-confirm']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    },

    // ── HELPERS ───────────────────────────────────────

    _setTab(tab) {
        this._tab = tab;
        Router.render();
    },

    _formatDate(ts) {
        if (!ts) return '–';
        return new Date(ts).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
};

window.Profile = Profile;