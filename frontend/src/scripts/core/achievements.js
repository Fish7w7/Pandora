/* ══════════════════════════════════════════════════
   ACHIEVEMENTS.JS v1.0.0 — NyanTools にゃん~
   Sistema de Conquistas
 ═══════════════════════════════════════════════════*/

const Achievements = {
    KEY: 'nyan_achievements',

    // ── DEFINIÇÃO DAS CONQUISTAS ──────────────────

    list: [
        {
            id:    'first_access',
            icon:  '🐣',
            name:  'Primeiro Passo',
            desc:  'Fez o primeiro login no NyanTools',
            hint:  'Desbloqueada automaticamente no primeiro acesso',
            check: () => true
        },
        {
            id:    'total_100',
            icon:  '🖱️',
            name:  'Centenário',
            desc:  '100 acessos a ferramentas',
            hint:  'Use as ferramentas 100 vezes no total',
            check: (s) => {
                const total = Object.values(s.toolAccess || {}).reduce((a, b) => a + b, 0);
                return total >= 100;
            },
            progress: (s) => {
                const total = Object.values(s.toolAccess || {}).reduce((a, b) => a + b, 0);
                return { current: Math.min(total, 100), max: 100 };
            }
        },
        {
            id:    'streak_7',
            icon:  '🔥',
            name:  'Semana de Fogo',
            desc:  '7 dias consecutivos de uso',
            hint:  'Use o NyanTools por 7 dias seguidos',
            check: (s) => (s.dailyStreak || 0) >= 7,
            progress: (s) => ({ current: Math.min(s.dailyStreak || 0, 7), max: 7 })
        },
        {
            id:    'marathon',
            icon:  '⏱️',
            name:  'Maratonista',
            desc:  '1 hora de uso em um único dia',
            hint:  'Fique 1h ou mais no NyanTools em um dia',
            check: (s) => {
                const daily = s.dailyActivity || {};
                return Object.values(daily).some(v => v >= 60);
            },
            progress: (s) => {
                const daily = s.dailyActivity || {};
                const max1day = Math.max(...Object.values(daily), 0);
                return { current: Math.min(max1day, 60), max: 60, unit: 'min' };
            }
        },
        {
            id:    'night_owl',
            icon:  '🌙',
            name:  'Coruja Noturna',
            desc:  'Usou o NyanTools depois da meia-noite',
            hint:  'Abra o app entre 00h e 05h',
            check: () => !!Utils.loadData('nyan_night_owl')
        }
    ],

    // ── CHECK E SAVE ──────────────────────────────

    checkAll() {
        const s        = Utils.loadData('dashboard_stats') || {};
        const unlocked = Utils.loadData(this.KEY) || {};
        let   changed  = false;

        for (const ach of this.list) {
            if (unlocked[ach.id]) continue;
            if (ach.check(s)) {
                unlocked[ach.id] = Date.now();
                changed = true;
                // Notificação de desbloqueio (exceto first_access que é silencioso)
                if (ach.id !== 'first_access') {
                    setTimeout(() => {
                        Utils.showNotification(`${ach.icon} Conquista: ${ach.name}`, 'success');
                    }, 800);
                }
            }
        }

        if (changed) Utils.saveData(this.KEY, unlocked);
        return unlocked;
    },

    // Checar horário noturno — chamado no init do app
    checkNightOwl() {
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5) {
            Utils.saveData('nyan_night_owl', true);
        }
    },

    // ── RENDER ────────────────────────────────────

    renderSection() {
        const s        = Utils.loadData('dashboard_stats') || {};
        const unlocked = this.checkAll();

        const items = this.list.map(ach => {
            const isUnlocked = !!unlocked[ach.id];
            const unlockedAt = isUnlocked
                ? new Date(unlocked[ach.id]).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                : null;

            // Barra de progresso (se tiver)
            let progressHTML = '';
            if (!isUnlocked && ach.progress) {
                const p = ach.progress(s);
                const pct = Math.round((p.current / p.max) * 100);
                const label = p.unit === 'min'
                    ? `${p.current}/${p.max} min`
                    : `${p.current}/${p.max}`;
                progressHTML = `
                    <div class="ach-progress-wrap">
                        <div class="ach-progress-bar" style="width:${pct}%"></div>
                    </div>
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

        return `
        <div class="profile-card">
            <div class="profile-card-title">
                🏆 Conquistas
                <span class="ach-counter">${doneCount}/${total}</span>
            </div>
            <div class="ach-list">${items.join('')}</div>
        </div>`;
    },

    init() {
        this.checkNightOwl();
        this.checkAll();
        console.log('🏆 Achievements v1.0.0 inicializado');
    }
};

window.Achievements = Achievements;