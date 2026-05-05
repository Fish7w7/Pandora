const FinalSeason = {
    VERSION: '3.16.0',
    LAST_UPDATE_LABEL: '05/05/2026',
    FLAGS_KEY: 'nyan_final_season_flags_v316',
    MEMORIAL_KEY: 'nyan_memorial_snapshot_v316',
    GITHUB_URL: 'https://github.com/Fish7w7/Pandora',
    MAX_PARTICLES: 50,
    _initialized: false,
    _noticeTimer: null,
    _lastJourneyCardUrl: '',
    _lastJourneyCardName: '',

    init() {
        if (this._initialized) return;
        this._initialized = true;
        this._registerStorage();
        this._injectStyles();
        this.ensureEarlyAccess();
        this.ensureParticipationReward();
        this.ensureMemorialSnapshot();
        this.checkNotifications();
        this._startTicker();
        setTimeout(() => this.showFarewellIfNeeded(), 950);
    },

    _registerStorage() {
        window.NyanStorage?.register?.(this.FLAGS_KEY, { owner: 'FinalSeason', source: 'System', critical: true });
        window.NyanStorage?.register?.(this.MEMORIAL_KEY, { owner: 'FinalSeason', source: 'System', critical: true });
    },

    _loadFlags() {
        const flags = Utils.loadData(this.FLAGS_KEY) || {};
        return flags && typeof flags === 'object' ? flags : {};
    },

    _saveFlags(next = {}) {
        Utils.saveData(this.FLAGS_KEY, { ...this._loadFlags(), ...(next || {}) });
    },

    _updateUserFlag(key, value = true) {
        try {
            const user = window.Auth?.getStoredUser?.() || window.App?.user || null;
            if (!user || typeof user !== 'object') return false;
            user.flags = user.flags && typeof user.flags === 'object' ? user.flags : {};
            user.flags[key] = value;
            if (window.Auth?.saveUser) {
                window.Auth.saveUser(user);
            } else {
                localStorage.setItem(window.Auth?.storageKey || 'toolbox_user', JSON.stringify(user));
            }
            if (window.App?.user) {
                window.App.user.flags = { ...(window.App.user.flags || {}), [key]: value };
            }
            if (window.NyanAuth?.currentUser) {
                window.NyanAuth.currentUser.flags = { ...(window.NyanAuth.currentUser.flags || {}), [key]: value };
            }
            return true;
        } catch (_) {
            return false;
        }
    },

    _syncFlagsToCloud() {
        if (!window.NyanAuth?._syncLocalProfile || !window.NyanAuth?.isOnline?.() || !window.NyanFirebase?.isReady?.()) {
            return;
        }
        window.NyanAuth._syncLocalProfile({ includeEconomy: false }).catch(() => {});
    },

    _season() {
        return window.Seasons?.getCurrentSeason?.() || null;
    },

    isFinalSeason(state = null) {
        const season = state || this._season();
        return season?.id === 'season_2' || season?.isFinal === true;
    },

    isFinalSeasonActive() {
        const season = this._season();
        return !!(season && this.isFinalSeason(season) && window.Seasons?.isActive?.(season));
    },

    isLegacyMode() {
        const season = this._season();
        return !!(season && this.isFinalSeason(season) && !window.Seasons?.isActive?.(season));
    },

    ensureEarlyAccess() {
        const flags = this._loadFlags();
        const alreadyOwned = window.Badges?.owns?.('badge_veteran_early_access_v316') === true;
        this._updateUserFlag('earlyAccessV316', true);
        if (flags.earlyAccessV316 && alreadyOwned) return false;
        window.Badges?.unlock?.('badge_veteran_early_access_v316', {
            silent: flags.earlyAccessV316 === true,
            autoEquip: false,
        });
        this._saveFlags({ earlyAccessV316: true, earlyAccessGrantedAt: flags.earlyAccessGrantedAt || Date.now() });
        this._syncFlagsToCloud();
        return true;
    },

    ensureParticipationReward() {
        if (!this.isFinalSeasonActive()) return false;
        const flags = this._loadFlags();
        if (flags.finalSeasonJoined && window.Badges?.owns?.('badge_final_presence')) return false;
        window.Badges?.unlock?.('badge_final_presence', { silent: flags.finalSeasonJoined === true, autoEquip: false });
        this._saveFlags({ finalSeasonJoined: true, finalSeasonJoinedAt: flags.finalSeasonJoinedAt || Date.now() });
        this._syncFlagsToCloud();
        return true;
    },

    _formatDate(value) {
        const n = Number(value || 0);
        if (!n) return 'Nao registrado';
        return new Date(n).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    _daysSince(value) {
        const n = Number(value || 0);
        if (!n) return 0;
        return Math.max(1, Math.floor((Date.now() - n) / 86400000) + 1);
    },

    _favoriteTool(toolAccess = {}) {
        const normalizedAccess = this._normalizedToolAccess(toolAccess);
        const entries = Object.entries(normalizedAccess || {}).filter(([, count]) => Number(count || 0) > 0);
        if (!entries.length) return { id: null, name: 'Ainda descobrindo', count: 0 };
        const [id, count] = entries.sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0];
        const tool = window.App?.getTool?.(id) || window.Dashboard?.getToolInfo?.(id) || {};
        return { id, name: tool.name || id, icon: tool.icon || '', count: Number(count || 0) };
    },

    _normalizedToolAccess(toolAccess = {}) {
        const allowedIds = new Set(window.Dashboard?.getUsageToolIds?.() || [
            'password', 'weather', 'translator', 'ai-assistant', 'mini-game',
            'temp-email', 'music', 'notes', 'tasks',
        ]);
        const normalizedAccess = {};
        Object.entries(toolAccess || {}).forEach(([id, count]) => {
            const normalizedId = window.Dashboard?.normalizeToolId?.(id) || id;
            const safeCount = Math.max(0, Number(count || 0));
            if (!allowedIds.has(normalizedId) || safeCount <= 0) return;
            normalizedAccess[normalizedId] = (normalizedAccess[normalizedId] || 0) + safeCount;
        });
        return normalizedAccess;
    },

    _personalRecords() {
        const games = window.Leaderboard?.GAMES || [
            { id: 'typeracer', name: 'Type Racer', icon: '\u2328\uFE0F', key: 'typeracer_highscore', unit: 'WPM' },
            { id: '2048', name: '2048', icon: '\u{1F522}', key: 'game_2048_highscore', unit: 'pts' },
            { id: 'flappy', name: 'Flappy Nyan', icon: '\u{1F431}', key: 'flappy_bird_highscore', unit: 'pts' },
            { id: 'quiz', name: 'Quiz Diario', icon: '\u{1F9E0}', key: 'quiz_highscore', unit: '/10' },
            { id: 'snake', name: 'Cobrinha', icon: '\u{1F40D}', key: 'snake_highscore', unit: 'pts' },
        ];
        return games
            .map((game) => ({
                id: game.id,
                name: game.name,
                icon: game.icon || '',
                value: Number(Utils.loadData(game.key) || 0),
                unit: game.unit || '',
            }))
            .filter((record) => record.value > 0)
            .sort((a, b) => b.value - a.value);
    },

    createMemorialSnapshot() {
        const authUser = window.Auth?.getStoredUser?.() || window.App?.user || {};
        const onlineUser = window.NyanAuth?.currentUser || {};
        const stats = Utils.loadData('dashboard_stats') || {};
        const economy = window.Economy?.load?.() || {};
        const achievements = Utils.loadData('nyan_achievements') || {};
        const badges = window.Badges?.getOwnedBadgeIds?.() || [];
        const inventory = window.Inventory?.load?.() || {};
        const flags = this._loadFlags();
        const toolAccess = stats.toolAccess || {};
        const normalizedToolAccess = this._normalizedToolAccess(toolAccess);
        const favoriteTool = this._favoriteTool(toolAccess);
        const records = this._personalRecords();
        const firstLogin = Number(authUser.firstLogin || authUser.loginDate || stats.firstLogin || Date.now());

        return {
            version: this.VERSION,
            createdAt: Date.now(),
            firstLogin,
            username: authUser.username || window.App?.user?.username || 'Usuario',
            nyanTag: window.NyanAuth?.getNyanTag?.() || onlineUser.nyanTag || '',
            avatar: Utils.loadData('nyan_profile_avatar') || authUser.avatar || onlineUser.avatar || null,
            daysInJourney: this._daysSince(firstLogin),
            totalChips: Number(economy.chips || 0),
            totalXP: Number(economy.totalXP || 0),
            level: Number(economy.level || 1),
            toolsUsed: normalizedToolAccess,
            favoriteTool,
            achievementsUnlocked: Object.keys(achievements).filter((id) => achievements[id]),
            badgesUnlocked: badges,
            inventoryOwned: Array.isArray(inventory.owned) ? inventory.owned : [],
            records,
            bestRecord: records[0] || null,
            tasksCompleted: Number(stats.tasksStats?.completed || 0),
            notesTotal: Number(stats.notesStats?.total || 0),
            highestStreak: Number(stats.dailyStreak || 0),
            finalSeasonJoined: flags.finalSeasonJoined === true || this.isFinalSeasonActive(),
            earlyAccessV316: true,
            lastSeen: Date.now(),
        };
    },

    ensureMemorialSnapshot() {
        const existing = Utils.loadData(this.MEMORIAL_KEY);
        if (existing && typeof existing === 'object' && existing.createdAt) return existing;
        const snapshot = this.createMemorialSnapshot();
        Utils.saveData(this.MEMORIAL_KEY, snapshot);
        return snapshot;
    },

    getMemorialSnapshot() {
        return this.ensureMemorialSnapshot();
    },

    async refreshMemorialSnapshot() {
        const ok = await this._confirmMemorialRefresh();
        if (!ok) return false;
        const previous = Utils.loadData(this.MEMORIAL_KEY) || {};
        const snapshot = {
            ...this.createMemorialSnapshot(),
            firstCreatedAt: previous.firstCreatedAt || previous.createdAt || Date.now(),
            refreshedAt: Date.now(),
        };
        Utils.saveData(this.MEMORIAL_KEY, snapshot);
        Utils.showNotification?.('Memorial atualizado com os dados atuais.', 'success');

        const card = document.getElementById('final-season-memorial');
        if (card) card.outerHTML = this.renderMemorialCard();
        window.Dashboard?.queueHomeRefresh?.();
        return true;
    },

    async _confirmMemorialRefresh() {
        if (window.Settings?._confirm) {
            return Settings._confirm({
                icon: '\u{1F31F}',
                title: 'Atualizar memorial',
                message: 'Isso recria o snapshot da sua jornada com os dados atuais. A memoria anterior sera substituida.',
                confirm: 'Atualizar',
                danger: false,
            });
        }
        return window.confirm?.('Atualizar o memorial com os dados atuais?') !== false;
    },

    renderMemorialCard() {
        const snap = this.getMemorialSnapshot();
        const d = document.body.classList.contains('dark-theme');
        const bg = d ? 'linear-gradient(135deg, rgba(16,9,31,0.96), rgba(27,18,44,0.94))' : 'linear-gradient(135deg,#fffaf0,#faf5ff)';
        const border = d ? 'rgba(245,158,11,0.28)' : 'rgba(146,64,14,0.16)';
        const text = d ? '#f8fafc' : '#1f1633';
        const sub = d ? 'rgba(255,255,255,0.62)' : 'rgba(31,22,51,0.62)';
        const chipBg = d ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)';
        const ended = this.isLegacyMode();
        const favorite = snap.favoriteTool || {};
        const bestRecord = snap.bestRecord || (snap.records || [])[0] || null;
        const snapshotDate = this._formatDate(snap.refreshedAt || snap.createdAt);
        const stats = [
            { label: 'Dias', value: snap.daysInJourney || 1 },
            { label: 'Chips', value: Number(snap.totalChips || 0).toLocaleString('pt-BR') },
            { label: 'Conquistas', value: (snap.achievementsUnlocked || []).length },
            { label: 'Recordes', value: (snap.records || []).length },
        ];

        return `
            <section id="final-season-memorial" style="margin-bottom:0.75rem;background:${bg};border:1px solid ${border};border-radius:14px;padding:0.78rem 0.9rem;box-shadow:0 8px 24px rgba(15,23,42,0.1);overflow:hidden;position:relative;">
                <div style="position:absolute;inset:auto -34px -48px auto;width:120px;height:120px;border-radius:999px;background:radial-gradient(circle,rgba(245,158,11,0.16),transparent 68%);pointer-events:none;"></div>
                <div style="position:relative;display:flex;align-items:flex-start;justify-content:space-between;gap:0.7rem;flex-wrap:wrap;">
                    <div>
                        <div style="font-size:0.58rem;font-weight:900;letter-spacing:0.11em;text-transform:uppercase;color:${d ? '#fcd34d' : '#92400e'};">Last Meow · Memorial</div>
                        <h2 style="font-family:'Syne',sans-serif;font-size:0.98rem;font-weight:900;color:${text};margin:0.12rem 0 0;">Sua jornada no NyanTools</h2>
                        <p style="font-size:0.68rem;color:${sub};margin:0.14rem 0 0;line-height:1.35;">${ended ? 'A Final Season terminou. Suas memorias continuam aqui.' : 'A Final Season esta acesa. Este bloco fica como memoria permanente.'}</p>
                    </div>
                    <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
                        <button onclick="FinalSeason.refreshMemorialSnapshot()" style="border:1px solid ${border};background:${chipBg};color:${text};border-radius:8px;padding:0.34rem 0.5rem;font-size:0.64rem;font-weight:800;cursor:pointer;">Atualizar</button>
                        <button onclick="FinalSeason.shareJourneyCard()" style="border:1px solid rgba(245,158,11,0.34);background:${d ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.16)'};color:${d ? '#fcd34d' : '#92400e'};border-radius:8px;padding:0.34rem 0.5rem;font-size:0.64rem;font-weight:800;cursor:pointer;">Card</button>
                        <button onclick="FinalSeason.exportJourney('text')" style="border:1px solid ${border};background:${chipBg};color:${text};border-radius:8px;padding:0.34rem 0.5rem;font-size:0.64rem;font-weight:800;cursor:pointer;">Texto</button>
                        <button onclick="FinalSeason.exportJourney('json')" style="border:none;background:linear-gradient(135deg,#a855f7,#f59e0b);color:white;border-radius:8px;padding:0.34rem 0.5rem;font-size:0.64rem;font-weight:800;cursor:pointer;">JSON</button>
                    </div>
                </div>
                <div class="final-memorial-stats" style="position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0.42rem;margin-top:0.58rem;">
                    ${stats.map((item) => `
                        <div style="background:${chipBg};border:1px solid ${border};border-radius:9px;padding:0.45rem;text-align:center;min-width:0;">
                            <div style="font-size:0.84rem;font-weight:900;color:${text};font-family:'Syne',sans-serif;line-height:1.05;overflow:hidden;text-overflow:ellipsis;">${item.value}</div>
                            <div style="font-size:0.54rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:${sub};margin-top:0.14rem;">${item.label}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="position:relative;margin-top:0.45rem;display:flex;gap:0.35rem 0.5rem;flex-wrap:wrap;color:${sub};font-size:0.64rem;">
                    <span>Primeiro login: <strong style="color:${text};">${this._formatDate(snap.firstLogin)}</strong></span>
                    <span>Ferramenta favorita: <strong style="color:${text};">${favorite.icon ? favorite.icon + ' ' : ''}${favorite.name || 'NyanTools'}</strong></span>
                    <span>Melhor recorde: <strong style="color:${text};">${bestRecord ? `${bestRecord.icon ? bestRecord.icon + ' ' : ''}${bestRecord.name} ${bestRecord.value}${bestRecord.unit ? ' ' + bestRecord.unit : ''}` : 'Ainda nao registrado'}</strong></span>
                    <span>Status: <strong style="color:${d ? '#fcd34d' : '#92400e'};">${ended ? 'Legacy Mode' : 'Final Season'}</strong></span>
                    <span>Snapshot: <strong style="color:${text};">${snapshotDate}</strong></span>
                </div>
            </section>
        `;
    },

    renderLegacySettingsCard() {
        const d = document.body.classList.contains('dark-theme');
        const active = this.isFinalSeasonActive();
        const legacy = this.isLegacyMode();
        const season = this._season();
        const status = legacy ? 'Em pausa' : (active ? 'Final Season ativa' : 'Preparando Final Season');
        const detail = legacy
            ? 'A ultima grande atualizacao de conteudo foi concluida. O app continua funcionando localmente.'
            : (active ? `A Final Season termina em ${window.Seasons?.getRemainingText?.() || 'breve'}.` : 'A Season 2 comeca quando a configuracao de data ficar ativa.');
        const bg = d ? 'rgba(16,9,31,0.92)' : '#fffaf0';
        const text = d ? '#f8fafc' : '#1f1633';
        const sub = d ? 'rgba(255,255,255,0.6)' : 'rgba(31,22,51,0.62)';
        return `
            <div style="background:${bg};border:1px solid rgba(245,158,11,0.24);border-radius:12px;padding:0.85rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:0.65rem;">
                    <div style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.28);font-size:1.05rem;">\u2728</div>
                    <div>
                        <div style="font-size:0.6rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#f59e0b;">Legacy Mode</div>
                        <div style="font-family:'Syne',sans-serif;font-weight:900;color:${text};font-size:0.88rem;">${status}</div>
                        <div style="font-size:0.68rem;color:${sub};margin-top:0.08rem;">${detail}</div>
                    </div>
                </div>
                <div style="font-size:0.66rem;color:${sub};text-align:right;">
                    <strong style="color:${text};">NyanTools v${this.VERSION}</strong><br>
                    ${season?.codename || 'Last Meow'}
                </div>
            </div>
        `;
    },

    _journeyText(snapshot = this.getMemorialSnapshot()) {
        const favorite = snapshot.favoriteTool || {};
        const tools = Object.entries(snapshot.toolsUsed || {})
            .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
            .slice(0, 5)
            .map(([id, count], index) => {
                const tool = window.App?.getTool?.(id) || window.Dashboard?.getToolInfo?.(id) || {};
                return `${index + 1}. ${tool.name || id} - ${Number(count || 0).toLocaleString('pt-BR')} acessos`;
            });
        const records = (snapshot.records || []).slice(0, 5).map((record, index) => (
            `${index + 1}. ${record.name} - ${record.value}${record.unit ? ' ' + record.unit : ''}`
        ));
        return [
            `NyanTools v${this.VERSION} - Final Season`,
            'Projeto Pandora',
            '',
            'Minha jornada no NyanTools',
            '================================',
            '',
            `Usuario: ${snapshot.username || 'Usuario'}`,
            `Primeiro login: ${this._formatDate(snapshot.firstLogin)}`,
            `Dias de jornada: ${snapshot.daysInJourney || 1}`,
            `Chips atuais: ${Number(snapshot.totalChips || 0).toLocaleString('pt-BR')}`,
            `XP total: ${Number(snapshot.totalXP || 0).toLocaleString('pt-BR')}`,
            `Nivel: ${snapshot.level || 1}`,
            `Ferramenta favorita: ${favorite.name || 'Ainda descobrindo'}`,
            `Conquistas desbloqueadas: ${(snapshot.achievementsUnlocked || []).length}`,
            `Badges desbloqueadas: ${(snapshot.badgesUnlocked || []).length}`,
            `Participou da Final Season: ${snapshot.finalSeasonJoined ? 'Sim' : 'Nao'}`,
            '',
            'Ferramentas mais usadas',
            '-----------------------',
            ...(tools.length ? tools : ['Ainda sem registros.']),
            '',
            'Recordes pessoais',
            '-----------------',
            ...(records.length ? records : ['Ainda sem recordes registrados.']),
            '',
            'Carta final',
            '-----------',
            'O NyanTools comecou pequeno e virou mais de um ano de desenvolvimento, testes, ideias e carinho.',
            'Agora e hora de pausar, nao de apagar. O app continua funcionando, seus dados continuam seus e a historia fica.',
            '',
            '- Gabriel & Clara',
        ].join('\n');
    },

    _currentAvatar() {
        const authUser = window.Auth?.getStoredUser?.() || {};
        const onlineUser = window.NyanAuth?.currentUser || {};
        return Utils.loadData('nyan_profile_avatar') || authUser.avatar || onlineUser.avatar || null;
    },

    _currentNyanTag() {
        return window.NyanAuth?.getNyanTag?.() || window.NyanAuth?.currentUser?.nyanTag || '';
    },

    _cardSnapshot(snapshot = this.getMemorialSnapshot()) {
        return {
            ...snapshot,
            username: snapshot.username || window.Auth?.getStoredUser?.()?.username || window.App?.user?.username || 'Usuario',
            nyanTag: snapshot.nyanTag || this._currentNyanTag(),
            avatar: snapshot.avatar || this._currentAvatar(),
        };
    },

    _safeCardText(value = '', fallback = '') {
        const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
        return text || fallback;
    },

    _drawRoundRect(ctx, x, y, w, h, r) {
        const radius = Math.max(0, Math.min(r, w / 2, h / 2));
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + h, radius);
        ctx.arcTo(x + w, y + h, x, y + h, radius);
        ctx.arcTo(x, y + h, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
    },

    _drawFitText(ctx, text, x, y, maxWidth, font, color, align = 'left') {
        const safeText = this._safeCardText(text);
        let size = Number(String(font).match(/(\d+)px/)?.[1] || 28);
        const family = font.replace(/\d+px/, '{size}px');
        ctx.fillStyle = color;
        ctx.textAlign = align;
        while (size > 16) {
            ctx.font = family.replace('{size}', size);
            if (ctx.measureText(safeText).width <= maxWidth) break;
            size -= 2;
        }
        ctx.fillText(safeText, x, y);
    },

    _drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
        const words = this._safeCardText(text).split(' ');
        const lines = [];
        let current = '';
        words.forEach((word) => {
            const next = current ? `${current} ${word}` : word;
            if (ctx.measureText(next).width <= maxWidth || !current) {
                current = next;
            } else {
                lines.push(current);
                current = word;
            }
        });
        if (current) lines.push(current);
        const visible = lines.slice(0, maxLines);
        if (lines.length > maxLines && visible.length) {
            let last = visible[visible.length - 1];
            while (last.length > 4 && ctx.measureText(`${last}...`).width > maxWidth) {
                last = last.slice(0, -1);
            }
            visible[visible.length - 1] = `${last}...`;
        }
        visible.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
    },

    _loadImage(src = '') {
        const safeSrc = String(src || '').trim();
        if (!safeSrc) return Promise.resolve(null);
        return new Promise((resolve) => {
            const img = new Image();
            let done = false;
            const finish = (value) => {
                if (done) return;
                done = true;
                resolve(value);
            };
            img.crossOrigin = 'anonymous';
            img.onload = () => finish(img);
            img.onerror = () => finish(null);
            setTimeout(() => finish(null), 2400);
            img.src = safeSrc;
        });
    },

    _drawAvatarFallback(ctx, x, y, radius, username = 'U') {
        const grad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        grad.addColorStop(0, '#7c3aed');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff7ed';
        ctx.font = "900 58px 'Syne','DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this._safeCardText(username, 'U').charAt(0).toUpperCase(), x, y + 2);
    },

    _drawAvatarImage(ctx, img, x, y, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.clip();
        const size = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
        const sx = ((img.naturalWidth || img.width) - size) / 2;
        const sy = ((img.naturalHeight || img.height) - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
    },

    async _buildJourneyCard(snapshot, options = {}) {
        const snap = this._cardSnapshot(snapshot);
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1500;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas indisponivel');

        const w = canvas.width;
        const h = canvas.height;
        const bg = ctx.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, '#090716');
        bg.addColorStop(0.38, '#1b0f35');
        bg.addColorStop(0.72, '#2d1530');
        bg.addColorStop(1, '#5f2b08');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const glowA = ctx.createRadialGradient(1020, 150, 0, 1020, 150, 380);
        glowA.addColorStop(0, 'rgba(245,158,11,0.28)');
        glowA.addColorStop(1, 'rgba(245,158,11,0)');
        ctx.fillStyle = glowA;
        ctx.fillRect(0, 0, w, h);

        const glowB = ctx.createRadialGradient(170, 1140, 0, 170, 1140, 480);
        glowB.addColorStop(0, 'rgba(168,85,247,0.28)');
        glowB.addColorStop(1, 'rgba(168,85,247,0)');
        ctx.fillStyle = glowB;
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = 'rgba(252,211,77,0.14)';
        for (let x = -120; x < w + 120; x += 86) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 420, h);
            ctx.stroke();
        }
        ctx.restore();

        const panelX = 78;
        const panelY = 78;
        const panelW = w - 156;
        const panelH = h - 156;
        this._drawRoundRect(ctx, panelX, panelY, panelW, panelH, 48);
        ctx.fillStyle = 'rgba(8,6,20,0.78)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245,158,11,0.32)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#fcd34d';
        ctx.font = "900 24px 'DM Sans',sans-serif";
        ctx.textAlign = 'left';
        ctx.fillText('NYANTOOLS - FINAL SEASON 2026', 132, 156);

        ctx.fillStyle = '#fff7ed';
        ctx.font = "900 70px 'Syne','DM Sans',sans-serif";
        ctx.fillText('Minha Jornada', 132, 238);

        ctx.fillStyle = 'rgba(255,255,255,0.62)';
        ctx.font = "500 28px 'DM Sans',sans-serif";
        ctx.fillText('Last Meow - Projeto Pandora', 132, 286);

        const avatarX = 220;
        const avatarY = 430;
        const avatarRadius = 82;
        ctx.save();
        ctx.shadowColor = 'rgba(245,158,11,0.55)';
        ctx.shadowBlur = 32;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        let avatar = null;
        if (options.drawAvatar !== false && snap.avatar) {
            avatar = await this._loadImage(snap.avatar);
        }
        if (avatar) this._drawAvatarImage(ctx, avatar, avatarX, avatarY, avatarRadius);
        else this._drawAvatarFallback(ctx, avatarX, avatarY, avatarRadius, snap.username);

        this._drawFitText(ctx, snap.username || 'Usuario', 340, 410, 600, "900 58px 'Syne','DM Sans',sans-serif", '#fff7ed');
        if (snap.nyanTag) {
            ctx.fillStyle = '#c4b5fd';
            ctx.font = "800 26px 'DM Sans',sans-serif";
            ctx.fillText(String(snap.nyanTag), 344, 452);
        }

        this._drawRoundRect(ctx, 344, 486, 404, 54, 27);
        ctx.fillStyle = 'rgba(245,158,11,0.14)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245,158,11,0.42)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#fcd34d';
        ctx.font = "900 24px 'DM Sans',sans-serif";
        ctx.fillText('Veterano Early Access', 370, 522);

        const stats = [
            { label: 'DIAS NO NYANTOOLS', value: snap.daysInJourney || 1 },
            { label: 'CHIPS', value: Number(snap.totalChips || 0).toLocaleString('pt-BR') },
            { label: 'CONQUISTAS', value: (snap.achievementsUnlocked || []).length },
            { label: 'BADGES', value: (snap.badgesUnlocked || []).length },
        ];
        stats.forEach((item, index) => {
            const x = 132 + (index % 2) * 468;
            const y = 650 + Math.floor(index / 2) * 176;
            this._drawRoundRect(ctx, x, y, 420, 132, 28);
            ctx.fillStyle = 'rgba(255,255,255,0.07)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(245,158,11,0.22)';
            ctx.lineWidth = 2;
            ctx.stroke();
            this._drawFitText(ctx, String(item.value), x + 34, y + 70, 340, "900 42px 'Syne','DM Sans',sans-serif", '#fff7ed');
            ctx.fillStyle = 'rgba(255,255,255,0.48)';
            ctx.font = "900 19px 'DM Sans',sans-serif";
            ctx.fillText(item.label, x + 36, y + 104);
        });

        const favorite = snap.favoriteTool || {};
        const bestRecord = snap.bestRecord || (snap.records || [])[0] || null;
        const details = [
            {
                label: 'Ferramenta favorita',
                value: `${favorite.icon ? favorite.icon + ' ' : ''}${favorite.name || 'Ainda descobrindo'}`,
            },
            {
                label: 'Melhor recorde',
                value: bestRecord
                    ? `${bestRecord.icon ? bestRecord.icon + ' ' : ''}${bestRecord.name} - ${bestRecord.value}${bestRecord.unit ? ' ' + bestRecord.unit : ''}`
                    : 'Ainda sem recorde',
            },
            {
                label: 'Primeiro login',
                value: this._formatDate(snap.firstLogin),
            },
        ];

        details.forEach((item, index) => {
            const y = 1042 + index * 86;
            ctx.fillStyle = '#fcd34d';
            ctx.font = "900 20px 'DM Sans',sans-serif";
            ctx.fillText(item.label.toUpperCase(), 132, y);
            ctx.fillStyle = '#fff7ed';
            ctx.font = "800 31px 'DM Sans',sans-serif";
            this._drawWrappedText(ctx, item.value, 132, y + 42, 870, 36, 1);
        });

        this._drawRoundRect(ctx, 132, 1312, 936, 82, 26);
        ctx.fillStyle = 'rgba(245,158,11,0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245,158,11,0.26)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,247,237,0.82)';
        ctx.font = "800 27px 'DM Sans',sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText('NyanTools - Final Season 2026', 600, 1364);

        ctx.fillStyle = 'rgba(255,255,255,0.42)';
        ctx.font = "600 18px 'DM Sans',sans-serif";
        ctx.fillText('Gabriel & Clara - Last Meow', 600, 1430);

        return canvas;
    },

    async _journeyCardDataUrl(snapshot) {
        try {
            const canvas = await this._buildJourneyCard(snapshot, { drawAvatar: true });
            return canvas.toDataURL('image/png');
        } catch (error) {
            const canvas = await this._buildJourneyCard(snapshot, { drawAvatar: false });
            return canvas.toDataURL('image/png');
        }
    },

    async shareJourneyCard() {
        try {
            const snapshot = this._cardSnapshot(this.getMemorialSnapshot());
            const date = new Date().toISOString().split('T')[0];
            const dataUrl = await this._journeyCardDataUrl(snapshot);
            this._lastJourneyCardUrl = dataUrl;
            this._lastJourneyCardName = `nyantools-jornada-card-${date}.png`;
            this._showJourneyCardModal(dataUrl, snapshot);
        } catch (error) {
            console.error('[FinalSeason] Erro ao gerar card:', error);
            Utils.showNotification?.('Nao foi possivel gerar o card da jornada.', 'error');
        }
    },

    _journeyShareCaption(snapshot = this.getMemorialSnapshot()) {
        const snap = this._cardSnapshot(snapshot);
        const bestRecord = snap.bestRecord || (snap.records || [])[0] || null;
        return [
            `Minha jornada no NyanTools - Final Season 2026`,
            `${snap.username || 'Usuario'}${snap.nyanTag ? ` (${snap.nyanTag})` : ''}`,
            `${snap.daysInJourney || 1} dias no app`,
            `${Number(snap.totalChips || 0).toLocaleString('pt-BR')} chips`,
            `${(snap.achievementsUnlocked || []).length} conquistas`,
            bestRecord ? `Melhor recorde: ${bestRecord.name} ${bestRecord.value}${bestRecord.unit ? ' ' + bestRecord.unit : ''}` : 'Last Meow',
        ].join('\n');
    },

    _showJourneyCardModal(dataUrl, snapshot) {
        document.getElementById('final-journey-card-modal')?.remove();
        const modal = document.createElement('div');
        modal.id = 'final-journey-card-modal';
        modal.innerHTML = `
            <div class="final-journey-card-shell">
                <button class="final-journey-card-close" onclick="FinalSeason.closeJourneyCardModal()" aria-label="Fechar">X</button>
                <div class="final-journey-card-copy">
                    <div class="final-journey-card-kicker">Card compartilhavel</div>
                    <h3>Jornada Final Season</h3>
                    <p>Uma imagem pronta para guardar ou postar como lembranca do NyanTools.</p>
                </div>
                <img src="${dataUrl}" alt="Card de jornada NyanTools" class="final-journey-card-img">
                <div class="final-journey-card-actions">
                    <button class="final-journey-card-primary" onclick="FinalSeason.downloadJourneyCard()">Baixar PNG</button>
                    <button onclick="FinalSeason.copyJourneyCardCaption()">Copiar texto</button>
                    <button onclick="FinalSeason.closeJourneyCardModal()">Fechar</button>
                </div>
            </div>
        `;
        modal.addEventListener('click', (event) => {
            if (event.target === modal) this.closeJourneyCardModal();
        });
        document.body.appendChild(modal);
        Utils.showNotification?.('Card da jornada gerado.', 'success');
    },

    downloadJourneyCard() {
        if (!this._lastJourneyCardUrl) {
            Utils.showNotification?.('Gere o card novamente.', 'warning');
            return;
        }
        const a = document.createElement('a');
        a.href = this._lastJourneyCardUrl;
        a.download = this._lastJourneyCardName || 'nyantools-jornada-card.png';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
    },

    copyJourneyCardCaption() {
        Utils.copyToClipboard?.(this._journeyShareCaption(this.getMemorialSnapshot()));
    },

    closeJourneyCardModal() {
        const modal = document.getElementById('final-journey-card-modal');
        if (!modal) return;
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 160);
    },

    exportJourney(format = 'json') {
        const snapshot = this.getMemorialSnapshot();
        const date = new Date().toISOString().split('T')[0];
        if (format === 'text') {
            this._download(`nyantools-jornada-${date}.txt`, this._journeyText(snapshot), 'text/plain');
            Utils.showNotification?.('Jornada exportada em texto.', 'success');
            return;
        }
        const payload = {
            app: 'NyanTools',
            project: 'Pandora',
            version: this.VERSION,
            exportedAt: new Date().toISOString(),
            memorial: snapshot,
        };
        this._download(`nyantools-jornada-${date}.json`, JSON.stringify(payload, null, 2), 'application/json');
        Utils.showNotification?.('Jornada exportada em JSON.', 'success');
    },

    _download(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 250);
    },

    openGitHub() {
        if (window.electronAPI?.openExternal) window.electronAPI.openExternal(this.GITHUB_URL);
        else window.open(this.GITHUB_URL, '_blank', 'noopener');
    },

    showFarewellIfNeeded() {
        const flags = this._loadFlags();
        if (flags.farewellModalSeen) return;
        if (!document.body || !window.App?.user) return;
        this._showFarewellModal();
    },

    _showFarewellModal() {
        document.getElementById('final-season-farewell')?.remove();
        const modal = document.createElement('div');
        modal.id = 'final-season-farewell';
        modal.innerHTML = `
            <div class="final-farewell-card">
                <button class="final-farewell-close" onclick="FinalSeason.closeFarewell(true)" aria-label="Fechar">X</button>
                <div class="final-farewell-cat">\u{1F431}</div>
                <div class="final-farewell-kicker">\u306B\u3083\u3093~ v3.16.0 - Final Season</div>
                <h2>Obrigado por estar aqui.</h2>
                <p>O NyanTools comecou como um projeto pequeno e acabou virando mais de um ano de desenvolvimento, testes, mudancas, ideias e carinho.</p>
                <p>Agora e hora de pausar. Nao de apagar.</p>
                <p>O app continua funcionando. Seus dados continuam seus. O codigo continua no GitHub. A historia fica.</p>
                <div class="final-farewell-sign">- Gabriel & Clara</div>
                <div class="final-farewell-actions">
                    <button class="final-farewell-primary" onclick="FinalSeason.keepMemory()">Guardar como memoria</button>
                    <button class="final-farewell-secondary" onclick="FinalSeason.closeFarewell(true)">Fechar</button>
                </div>
                <div class="final-farewell-footer">
                    <button onclick="FinalSeason.openGitHub()">Projeto Pandora no GitHub</button>
                    <span>NyanTools v3.16.0</span>
                    <span>Ultima atualizacao: ${this.LAST_UPDATE_LABEL}</span>
                </div>
            </div>
        `;
        modal.addEventListener('click', (event) => {
            if (event.target === modal) this.closeFarewell(true);
        });
        document.body.appendChild(modal);
    },

    keepMemory() {
        this.ensureEarlyAccess();
        window.Badges?.equip?.('badge_veteran_early_access_v316', { silent: true });
        this._saveFlags({ farewellModalSeen: true, memoryKeptAt: Date.now() });
        window.Achievements?.checkAll?.();
        this._burstConfetti();
        Utils.showNotification?.('Memoria guardada. Badge Veterano Early Access equipada.', 'success');
        setTimeout(() => this.closeFarewell(false), 420);
    },

    closeFarewell(markSeen = true) {
        if (markSeen) this._saveFlags({ farewellModalSeen: true });
        const modal = document.getElementById('final-season-farewell');
        if (!modal) return;
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 180);
    },

    _burstConfetti() {
        const count = Math.min(24, this.MAX_PARTICLES);
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('span');
            piece.className = 'final-season-confetti';
            piece.textContent = i % 3 === 0 ? '\u2728' : (i % 3 === 1 ? '\u25C6' : '\u2726');
            piece.style.left = `${45 + (Math.random() * 18 - 9)}vw`;
            piece.style.setProperty('--dx', `${Math.random() * 220 - 110}px`);
            piece.style.animationDelay = `${Math.random() * 0.12}s`;
            document.body.appendChild(piece);
            piece.addEventListener('animationend', () => piece.remove(), { once: true });
        }
    },

    checkNotifications() {
        const season = this._season();
        if (!season || !this.isFinalSeason(season)) return;
        const flags = this._loadFlags();
        const active = window.Seasons?.isActive?.(season);
        const daysLeft = window.Seasons?._getDaysLeft?.(season) || 0;

        if (active && !flags.finalSeasonStartedToastSeen) {
            Utils.showNotification?.('A Final Season comecou.', 'info');
            this._saveFlags({ finalSeasonStartedToastSeen: true });
            return;
        }

        if (active && daysLeft <= 1 && !flags.finalSeasonLastDayToastSeen) {
            Utils.showNotification?.('Ultimo dia da Final Season. Obrigado por fechar esse ciclo com a gente.', 'warning');
            this._saveFlags({ finalSeasonLastDayToastSeen: true });
            return;
        }

        if (active && daysLeft <= 7 && !flags.finalSeasonLastWeekToastSeen) {
            Utils.showNotification?.(`Faltam ${daysLeft} dias para o fim da Final Season. Nao perca as recompensas.`, 'warning');
            this._saveFlags({ finalSeasonLastWeekToastSeen: true });
            return;
        }

        if (!active) {
            window.App?.renderNavMenu?.();
            if (window.Router?.currentRoute === 'credits') {
                window.Router.navigate('home');
            }
        }

        if (!active && !flags.finalSeasonEndedToastSeen) {
            Utils.showNotification?.('A Final Season terminou. Suas memorias continuam no Dashboard.', 'info');
            this._saveFlags({ finalSeasonEndedToastSeen: true, legacyModeEnteredAt: flags.legacyModeEnteredAt || Date.now() });
        }
    },

    _startTicker() {
        if (this._noticeTimer) clearInterval(this._noticeTimer);
        this._noticeTimer = setInterval(() => {
            this.ensureParticipationReward();
            this.checkNotifications();
        }, 60 * 1000);
        window.NyanLifecycle?.trackCleanup?.('global', () => clearInterval(this._noticeTimer));
    },

    _injectStyles() {
        if (document.getElementById('final-season-style')) return;
        const style = document.createElement('style');
        style.id = 'final-season-style';
        style.textContent = `
            #final-season-farewell {
                position:fixed; inset:0; z-index:99999;
                display:flex; align-items:center; justify-content:center;
                padding:1rem; background:rgba(4,3,12,0.82);
                backdrop-filter:blur(10px); transition:opacity 0.18s ease;
                font-family:'DM Sans',sans-serif;
            }
            #final-season-farewell::before {
                content:''; position:absolute; inset:0; pointer-events:none;
                background:
                    radial-gradient(circle at 20% 20%, rgba(245,158,11,0.16), transparent 26%),
                    radial-gradient(circle at 80% 70%, rgba(168,85,247,0.16), transparent 28%);
            }
            .final-farewell-card {
                position:relative; width:100%; max-width:520px;
                border-radius:18px; border:1px solid rgba(245,158,11,0.28);
                background:linear-gradient(135deg, rgba(16,9,31,0.98), rgba(24,16,34,0.96));
                color:#f8fafc; padding:1.55rem; box-shadow:0 32px 90px rgba(0,0,0,0.55);
                animation:finalFarewellIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
            }
            .final-farewell-close {
                position:absolute; top:0.8rem; right:0.8rem; width:30px; height:30px;
                border-radius:8px; border:1px solid rgba(255,255,255,0.1);
                background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.56);
                cursor:pointer; font-weight:900;
            }
            .final-farewell-cat {
                width:58px; height:58px; border-radius:16px; display:flex; align-items:center; justify-content:center;
                background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.28);
                font-size:2rem; margin-bottom:0.85rem; animation:loadingLogoPulse 2.2s ease-in-out infinite;
            }
            .final-farewell-kicker {
                font-size:0.68rem; font-weight:900; letter-spacing:0.12em; text-transform:uppercase;
                color:#fcd34d; margin-bottom:0.35rem;
            }
            .final-farewell-card h2 {
                font-family:'Syne',sans-serif; font-size:1.45rem; line-height:1.1;
                margin:0 2rem 0.8rem 0; font-weight:900;
            }
            .final-farewell-card p {
                margin:0 0 0.72rem; color:rgba(255,255,255,0.68);
                font-size:0.86rem; line-height:1.58;
            }
            .final-farewell-sign { color:#fcd34d; font-weight:800; margin:0.95rem 0 1rem; }
            .final-farewell-actions { display:flex; gap:0.6rem; flex-wrap:wrap; }
            .final-farewell-actions button {
                flex:1; min-width:160px; border-radius:11px; padding:0.72rem 0.9rem;
                font-size:0.82rem; font-weight:900; cursor:pointer; font-family:'DM Sans',sans-serif;
            }
            .final-farewell-primary { border:none; color:#111827; background:linear-gradient(135deg,#fcd34d,#f59e0b); }
            .final-farewell-secondary { border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.72); background:rgba(255,255,255,0.06); }
            .final-farewell-footer {
                margin-top:0.9rem; display:flex; align-items:center; justify-content:space-between;
                gap:0.7rem; flex-wrap:wrap; color:rgba(255,255,255,0.36); font-size:0.68rem;
            }
            .final-farewell-footer button {
                border:none; background:transparent; color:#c4b5fd; cursor:pointer; font-size:0.68rem; font-weight:800; padding:0;
            }
            .final-season-confetti {
                position:fixed; top:48vh; z-index:100000; pointer-events:none;
                color:#fcd34d; text-shadow:0 0 10px rgba(245,158,11,0.55);
                animation:finalSeasonConfetti 0.9s ease-out forwards;
            }
            #final-journey-card-modal {
                position:fixed; inset:0; z-index:99998; display:flex; align-items:center; justify-content:center;
                padding:1rem; background:rgba(4,3,12,0.84); transition:opacity 0.16s ease;
                font-family:'DM Sans',sans-serif;
            }
            .final-journey-card-shell {
                width:min(94vw,620px); max-height:92vh; overflow:auto; position:relative;
                border-radius:18px; border:1px solid rgba(245,158,11,0.28);
                background:linear-gradient(135deg,rgba(10,8,20,0.98),rgba(28,18,38,0.98));
                box-shadow:0 28px 80px rgba(0,0,0,0.52); padding:1rem; color:#fff7ed;
            }
            .final-journey-card-close {
                position:absolute; top:0.78rem; right:0.78rem; width:30px; height:30px;
                border-radius:8px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06);
                color:rgba(255,255,255,0.62); cursor:pointer; font-weight:900;
            }
            .final-journey-card-copy { padding:0.25rem 2.2rem 0.75rem 0.1rem; }
            .final-journey-card-kicker {
                font-size:0.62rem; font-weight:900; letter-spacing:0.12em; text-transform:uppercase; color:#fcd34d;
            }
            .final-journey-card-copy h3 {
                margin:0.18rem 0 0; font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:900;
            }
            .final-journey-card-copy p {
                margin:0.25rem 0 0; font-size:0.74rem; color:rgba(255,255,255,0.56); line-height:1.4;
            }
            .final-journey-card-img {
                width:100%; display:block; border-radius:14px; border:1px solid rgba(245,158,11,0.22);
                background:#090716; max-height:64vh; object-fit:contain;
            }
            .final-journey-card-actions {
                display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.8rem;
            }
            .final-journey-card-actions button {
                flex:1; min-width:130px; border-radius:10px; padding:0.62rem 0.78rem; cursor:pointer;
                border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06);
                color:rgba(255,255,255,0.75); font-size:0.76rem; font-weight:900; font-family:'DM Sans',sans-serif;
            }
            .final-journey-card-actions .final-journey-card-primary {
                border:none; color:#111827; background:linear-gradient(135deg,#fcd34d,#f59e0b);
            }
            @keyframes finalFarewellIn {
                from { opacity:0; transform:translateY(18px) scale(0.98); }
                to { opacity:1; transform:none; }
            }
            @keyframes finalSeasonConfetti {
                to { opacity:0; transform:translate(var(--dx), -150px) rotate(160deg) scale(0.8); }
            }
            @media (max-width: 720px) {
                .final-memorial-stats { grid-template-columns:repeat(2,minmax(0,1fr)) !important; }
                .final-farewell-card { padding:1.2rem; }
            }
        `;
        document.head.appendChild(style);
    },
};

window.FinalSeason = FinalSeason;
