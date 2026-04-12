const Achievements = {
    KEY: 'nyan_achievements',
    COLLAPSE_KEY: 'nyan_achievements_collapsed',

    list: [
        {
            id: 'first_access', icon: '🐣', name: 'Primeiro Passo',
            desc: 'Fez o primeiro login no NyanTools',
            hint: 'Desbloqueada automaticamente no primeiro acesso',
            check: () => true
        },
        {
            id: 'total_100', icon: '🖱️', name: 'Centenário',
            desc: '100 acessos a ferramentas',
            hint: 'Use as ferramentas 100 vezes no total',
            check: (s) => Object.values(s.toolAccess || {}).reduce((a, b) => a + b, 0) >= 100,
            progress: (s) => ({ current: Math.min(Object.values(s.toolAccess || {}).reduce((a, b) => a + b, 0), 100), max: 100 })
        },
        {
            id: 'streak_7', icon: '🔥', name: 'Semana de Fogo',
            desc: '7 dias consecutivos de uso',
            hint: 'Use o NyanTools por 7 dias seguidos',
            check: (s) => (s.dailyStreak || 0) >= 7,
            progress: (s) => ({ current: Math.min(s.dailyStreak || 0, 7), max: 7 })
        },
        {
            id: 'marathon', icon: '⏱️', name: 'Maratonista',
            desc: '1 hora de uso em um único dia',
            hint: 'Fique 1h ou mais no NyanTools em um dia',
            check: (s) => Object.values(s.dailyActivity || {}).some(v => v >= 60),
            progress: (s) => {
                const max1day = Math.max(...Object.values(s.dailyActivity || {}), 0);
                return { current: Math.min(max1day, 60), max: 60, unit: 'min' };
            }
        },
        {
            id: 'night_owl', icon: '🌙', name: 'Coruja Noturna',
            desc: 'Usou o NyanTools depois da meia-noite',
            hint: 'Abra o app entre 00h e 05h',
            check: () => !!Utils.loadData('nyan_night_owl')
        },
        {
            id: 'typeracer_50', icon: '⌨️', name: 'Dedos Rápidos',
            desc: 'Atingiu 50 WPM no Type Racer',
            hint: 'Alcance 50 palavras por minuto no Type Racer',
            check: () => (Utils.loadData('typeracer_highscore') || 0) >= 50,
            progress: () => ({ current: Math.min(Utils.loadData('typeracer_highscore') || 0, 50), max: 50, unit: 'WPM' })
        },
        {
            id: 'typeracer_80', icon: '🚀', name: 'Velocidade Sônica',
            desc: 'Atingiu 80 WPM no Type Racer',
            hint: 'Alcance 80 palavras por minuto no Type Racer',
            check: () => (Utils.loadData('typeracer_highscore') || 0) >= 80,
            progress: () => ({ current: Math.min(Utils.loadData('typeracer_highscore') || 0, 80), max: 80, unit: 'WPM' })
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
    ],

    checkAll() {
        const s        = Utils.loadData('dashboard_stats') || {};
        const unlocked = Utils.loadData(this.KEY) || {};
        let changed    = false;

        for (const ach of this.list) {
            if (unlocked[ach.id]) continue;
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
        return unlocked;
    },

    checkNightOwl() {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) Utils.saveData('nyan_night_owl', true);
    },

    renderSection() {
        const s           = Utils.loadData('dashboard_stats') || {};
        const unlocked    = this.checkAll();
        const isCollapsed = Utils.loadData(this.COLLAPSE_KEY) === true;

        const items = this.list.map(ach => {
            const isUnlocked = !!unlocked[ach.id];
            const unlockedAt = isUnlocked
                ? new Date(unlocked[ach.id]).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                : null;

            let progressHTML = '';
            if (!isUnlocked && ach.progress) {
                const p   = ach.progress(s);
                const pct = Math.round((p.current / p.max) * 100);
                const label = p.unit === 'min' ? `${p.current}/${p.max} min` : `${p.current}/${p.max}`;
                progressHTML = `
                    <div class="ach-progress-wrap"><div class="ach-progress-bar" style="width:${pct}%"></div></div>
                    <span class="ach-progress-label">${label}</span>
                `;
            }

            return `
            <div class="ach-item ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="ach-icon">${ach.icon}</div>
                <div class="ach-body">
                    <div class="ach-name">${ach.name}</div>
                    <div class="ach-desc">${isUnlocked ? ach.desc : ach.hint}</div>
                    ${progressHTML}
                    ${isUnlocked ? `<div class="ach-date">✓ ${unlockedAt}</div>` : ''}
                </div>
                ${isUnlocked ? '<div class="ach-check">✓</div>' : '<div class="ach-lock">🔒</div>'}
            </div>`;
        });

        const total     = this.list.length;
        const doneCount = Object.keys(unlocked).length;
        const chevron   = isCollapsed ? '▸' : '▾';

        return `
        <div class="profile-card">
            <div class="profile-card-title" style="cursor:pointer;user-select:none;" onclick="Achievements._toggleCollapse()">
                🏆 Conquistas
                <span class="ach-counter">${doneCount}/${total}</span>
                <span style="margin-left:auto;font-size:0.75rem;color:var(--p-text-muted);transition:transform 0.2s;" id="ach-chevron">${chevron}</span>
            </div>
            <div id="ach-list-container" style="overflow:hidden;transition:max-height 0.35s ease, opacity 0.3s ease;max-height:${isCollapsed ? '0' : '2000px'};opacity:${isCollapsed ? '0' : '1'};">
                <div class="ach-list">${items.join('')}</div>
            </div>
        </div>`;
    },

    _toggleCollapse() {
        const isCollapsed = Utils.loadData(this.COLLAPSE_KEY) === true;
        const newState    = !isCollapsed;
        Utils.saveData(this.COLLAPSE_KEY, newState);
        const container = document.getElementById('ach-list-container');
        const chevron   = document.getElementById('ach-chevron');
        if (container) { container.style.maxHeight = newState ? '0' : '2000px'; container.style.opacity = newState ? '0' : '1'; }
        if (chevron) chevron.textContent = newState ? '▸' : '▾';
    },

    init() { this.checkNightOwl(); this.checkAll(); }
};

window.Achievements = Achievements;
