const Achievements = {
    KEY: 'nyan_achievements',
    COLLAPSE_KEY: 'nyan_achievements_collapsed',
    GROUP_COLLAPSE_KEY: 'nyan_achievements_groups',

    list: [
        {
            id: 'first_access', icon: '🐣', name: 'Primeiro Passo',
            desc: 'Fez o primeiro login no NyanTools',
            hint: 'Desbloqueada automaticamente no primeiro acesso',
            check: () => true,
        },
        {
            id: 'total_100', icon: '🖱️', name: 'Centenário',
            desc: '100 acessos a ferramentas',
            hint: 'Use as ferramentas 100 vezes no total',
            check: (s) => Object.values(s.toolAccess || {}).reduce((a, b) => a + b, 0) >= 100,
            progress: (s) => ({ current: Math.min(Object.values(s.toolAccess || {}).reduce((a, b) => a + b, 0), 100), max: 100 }),
        },
        {
            id: 'streak_7', icon: '🔥', name: 'Semana de Fogo',
            desc: '7 dias consecutivos de uso',
            hint: 'Use o NyanTools por 7 dias seguidos',
            check: (s) => (s.dailyStreak || 0) >= 7,
            progress: (s) => ({ current: Math.min(s.dailyStreak || 0, 7), max: 7 }),
        },
        {
            id: 'marathon', icon: '⏱️', name: 'Maratonista',
            desc: '1 hora de uso em um único dia',
            hint: 'Fique 1h ou mais no NyanTools em um dia',
            check: (s) => Object.values(s.dailyActivity || {}).some((v) => v >= 60),
            progress: (s) => {
                const max1day = Math.max(...Object.values(s.dailyActivity || {}), 0);
                return { current: Math.min(max1day, 60), max: 60, unit: 'min' };
            },
        },
        {
            id: 'night_owl', icon: '🌙', name: 'Coruja Noturna',
            desc: 'Usou o NyanTools depois da meia-noite',
            hint: 'Abra o app entre 00h e 05h',
            check: () => !!Utils.loadData('nyan_night_owl'),
        },
        {
            id: 'night_grinder', icon: '🦉', name: 'Morcego Notívilo',
            desc: 'Usou o app 5 noites seguidas após meia-noite',
            hint: '???',
            secret: true,
            check: (s) => (s.midnightStreak || 0) >= 5,
            progress: (s) => ({ current: Math.min(s.midnightStreak || 0, 5), max: 5 }),
        },
        {
            id: 'typeracer_50', icon: '⌨️', name: 'Dedos Rápidos',
            desc: 'Atingiu 50 WPM no Type Racer',
            hint: 'Alcance 50 palavras por minuto no Type Racer',
            check: () => (Utils.loadData('typeracer_highscore') || 0) >= 50,
            progress: () => ({ current: Math.min(Utils.loadData('typeracer_highscore') || 0, 50), max: 50, unit: 'WPM' }),
        },
        {
            id: 'typeracer_80', icon: '🚀', name: 'Velocidade Sônica',
            desc: 'Atingiu 80 WPM no Type Racer',
            hint: 'Alcance 80 palavras por minuto no Type Racer',
            check: () => (Utils.loadData('typeracer_highscore') || 0) >= 80,
            progress: () => ({ current: Math.min(Utils.loadData('typeracer_highscore') || 0, 80), max: 80, unit: 'WPM' }),
        },
        {
            id: 'quiz_perfect', icon: '🧠', name: 'Gênio にゃん~',
            desc: 'Acertou todas as 10 perguntas do Quiz Diário',
            hint: 'Tire 10/10 no Quiz Diário',
            check: () => (Utils.loadData('quiz_highscore') || 0) >= 10,
        },
        {
            id: 'quiz_played', icon: '📚', name: 'Estudioso',
            desc: 'Jogou o Quiz Diário pela primeira vez',
            hint: 'Complete o Quiz Diário uma vez',
            check: () => (Utils.loadData('quiz_highscore') || 0) > 0,
        },
        {
            id: 'slot_jackpot', icon: '🎰', name: 'Sortudo',
            desc: 'Acertou o jackpot 🐱🐱🐱 no Caça-Níquel',
            hint: 'Alinhe três 🐱 no Caça-Níquel',
            check: () => !!Utils.loadData('slot_jackpot_hit'),
        },
        {
            id: 'season1_complete', icon: '🌸', name: 'Sobrevivente S1',
            desc: 'Atingiu tier Prata na Temporada 1',
            hint: 'Disponível durante a Temporada 1',
            seasonal: 'season_1',
            check: () => (window.Seasons?.getTier?.() || 0) >= 2,
        },
        {
            id: 'social_butterfly', icon: '🦋', name: 'Borboleta Social',
            desc: 'Completou 5 desafios com amigos diferentes',
            hint: 'Desafie amigos diferentes e complete duelos',
            check: (s) => (s.challengeOpponents?.length || 0) >= 5,
            progress: (s) => ({ current: Math.min(s.challengeOpponents?.length || 0, 5), max: 5 }),
        },
    ],

    _categoryOf(ach) {
        if (ach.secret) return 'secret';
        if (ach.seasonal) return 'seasonal';
        return 'normal';
    },

    _isSeasonalAvailable(ach) {
        if (!ach?.seasonal) return true;
        const current = window.Seasons?.getCurrentSeason?.();
        return !!current && current.id === ach.seasonal && window.Seasons?.isActive?.(current);
    },

    checkAll() {
        const s = Utils.loadData('dashboard_stats') || {};
        const unlocked = Utils.loadData(this.KEY) || {};
        let changed = false;

        for (const ach of this.list) {
            if (unlocked[ach.id]) continue;
            if (ach.seasonal && !this._isSeasonalAvailable(ach)) continue;

            if (ach.check(s)) {
                unlocked[ach.id] = Date.now();
                changed = true;
                if (ach.id !== 'first_access') {
                    setTimeout(() => Utils.showNotification(`${ach.icon} Conquista: ${ach.name}`, 'success'), 800);
                }
            }
        }

        if (changed) {
            Utils.saveData(this.KEY, unlocked);
            if (window.NyanAuth?.isOnline?.() && window.NyanFirebase?.isReady?.()) {
                const uid = NyanAuth.getUID();
                if (uid) NyanFirebase.updateDoc('users/' + uid, { sc_achievements: unlocked }).catch(() => {});
            }
        }

        if (window.Badges?.syncFromAchievements) {
            window.Badges.syncFromAchievements(unlocked, { silent: true });
        }
        return unlocked;
    },

    _dateKey(date) {
        const d = new Date(date);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    },

    checkNightOwl() {
        const now = new Date();
        const hour = now.getHours();
        if (hour < 0 || hour >= 5) return;

        Utils.saveData('nyan_night_owl', true);

        const today = this._dateKey(now);
        const streakData = Utils.loadData('nyan_midnight_streak') || {};
        if (streakData.lastDate === today) return;

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = this._dateKey(yesterday);

        const nextStreak = streakData.lastDate === yesterdayKey
            ? (streakData.streak || 0) + 1
            : 1;

        const nextData = { lastDate: today, streak: nextStreak };
        Utils.saveData('nyan_midnight_streak', nextData);

        const stats = Utils.loadData('dashboard_stats') || {};
        stats.midnightStreak = nextStreak;
        stats.midnightLastDate = today;
        Utils.saveData('dashboard_stats', stats);
    },

    _getGroupStates() {
        return Utils.loadData(this.GROUP_COLLAPSE_KEY) || {};
    },

    _setGroupState(category, collapsed) {
        const state = this._getGroupStates();
        state[category] = !!collapsed;
        Utils.saveData(this.GROUP_COLLAPSE_KEY, state);

        const list = document.getElementById(`ach-group-list-${category}`);
        const chevron = document.getElementById(`ach-group-chevron-${category}`);
        if (list) {
            list.style.maxHeight = collapsed ? '0' : '1400px';
            list.style.opacity = collapsed ? '0' : '1';
        }
        if (chevron) chevron.textContent = collapsed ? '▸' : '▾';
    },

    _toggleGroup(category) {
        const state = this._getGroupStates();
        this._setGroupState(category, !(state[category] === true));
    },

    _renderItem(ach, unlocked, stats) {
        const isUnlocked = !!unlocked[ach.id];
        const isSecretLocked = ach.secret && !isUnlocked;
        const seasonBlocked = !!ach.seasonal && !isUnlocked && !this._isSeasonalAvailable(ach);

        const unlockedAt = isUnlocked
            ? new Date(unlocked[ach.id]).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            : null;

        let progressHTML = '';
        if (!isUnlocked && ach.progress) {
            const p = ach.progress(stats);
            const pct = Math.max(0, Math.min(100, Math.round((p.current / Math.max(1, p.max)) * 100)));
            const label = p.unit ? `${p.current}/${p.max} ${p.unit}` : `${p.current}/${p.max}`;
            progressHTML = `
                <div class="ach-progress-wrap"><div class="ach-progress-bar" style="width:${pct}%"></div></div>
                <span class="ach-progress-label">${label}</span>
            `;
        }

        const displayName = isSecretLocked ? '???' : ach.name;
        let description = isUnlocked ? ach.desc : (ach.hint || ach.desc);
        if (seasonBlocked) description = 'Disponível apenas durante esta temporada.';

        return `
            <div class="ach-item ${isUnlocked ? 'unlocked' : 'locked'}" style="${seasonBlocked ? 'opacity:0.55;' : ''}">
                <div class="ach-icon">${isSecretLocked ? '❔' : ach.icon}</div>
                <div class="ach-body">
                    <div class="ach-name">${displayName}</div>
                    <div class="ach-desc">${description}</div>
                    ${progressHTML}
                    ${isUnlocked ? `<div class="ach-date">✓ ${unlockedAt}</div>` : ''}
                </div>
                ${isUnlocked ? '<div class="ach-check">✓</div>' : '<div class="ach-lock">🔒</div>'}
            </div>`;
    },

    _renderCategory(category, title, icon, allItems, unlocked, stats) {
        const items = allItems.filter((ach) => this._categoryOf(ach) === category);
        if (items.length === 0) return '';

        const groupStates = this._getGroupStates();
        const collapsed = groupStates[category] === true;
        const done = items.filter((a) => unlocked[a.id]).length;

        return `
            <div style="margin-bottom:0.7rem;">
                <button onclick="Achievements._toggleGroup('${category}')" style="
                    width:100%;display:flex;align-items:center;gap:0.5rem;
                    padding:0.46rem 0.6rem;border-radius:10px;border:1px solid var(--p-border);
                    background:var(--p-bg-subtle);cursor:pointer;
                    font-family:'DM Sans',sans-serif;color:var(--p-text);font-size:0.72rem;font-weight:700;">
                    <span>${icon}</span>
                    <span>${title}</span>
                    <span style="margin-left:auto;font-size:0.62rem;color:var(--p-text-muted);">${done}/${items.length}</span>
                    <span id="ach-group-chevron-${category}" style="font-size:0.75rem;color:var(--p-text-muted);">${collapsed ? '▸' : '▾'}</span>
                </button>
                <div id="ach-group-list-${category}" style="
                    overflow:hidden;transition:max-height 0.25s ease, opacity 0.2s ease;
                    max-height:${collapsed ? '0' : '1400px'};opacity:${collapsed ? '0' : '1'};">
                    <div class="ach-list" style="margin-top:0.45rem;">
                        ${items.map((ach) => this._renderItem(ach, unlocked, stats)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderSection() {
        const stats = Utils.loadData('dashboard_stats') || {};
        const unlocked = this.checkAll();
        const isCollapsed = Utils.loadData(this.COLLAPSE_KEY) === true;

        const total = this.list.length;
        const doneCount = this.list.filter((a) => !!unlocked[a.id]).length;
        const chevron = isCollapsed ? '▸' : '▾';

        const categories = [
            this._renderCategory('normal', 'Normais', '🏅', this.list, unlocked, stats),
            this._renderCategory('secret', 'Secretas', '🕵️', this.list, unlocked, stats),
            this._renderCategory('seasonal', 'Sazonais', '🌸', this.list, unlocked, stats),
        ].join('');

        return `
        <div class="profile-card">
            <div class="profile-card-title" style="cursor:pointer;user-select:none;" onclick="Achievements._toggleCollapse()">
                🏆 Conquistas
                <span class="ach-counter">${doneCount}/${total}</span>
                <span style="margin-left:auto;font-size:0.75rem;color:var(--p-text-muted);transition:transform 0.2s;" id="ach-chevron">${chevron}</span>
            </div>
            <div id="ach-list-container" style="overflow:hidden;transition:max-height 0.35s ease, opacity 0.3s ease;max-height:${isCollapsed ? '0' : '2500px'};opacity:${isCollapsed ? '0' : '1'};">
                ${categories}
            </div>
        </div>`;
    },

    _toggleCollapse() {
        const isCollapsed = Utils.loadData(this.COLLAPSE_KEY) === true;
        const newState = !isCollapsed;
        Utils.saveData(this.COLLAPSE_KEY, newState);

        const container = document.getElementById('ach-list-container');
        const chevron = document.getElementById('ach-chevron');
        if (container) {
            container.style.maxHeight = newState ? '0' : '2500px';
            container.style.opacity = newState ? '0' : '1';
        }
        if (chevron) chevron.textContent = newState ? '▸' : '▾';
    },

    init() {
        this.checkNightOwl();
        this.checkAll();
    },
};

window.Achievements = Achievements;
