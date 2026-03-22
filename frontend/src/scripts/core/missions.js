/* ══════════════════════════════════════════════════
   MISSIONS.JS v1.0.0 — NyanTools にゃん~
   Sistema de Missões Diárias e Desafio Semanal
   v3.8.0 "Nyan Economy"
 ═══════════════════════════════════════════════════*/

const Missions = {

    KEY:         'nyan_missions',
    STREAK_KEY:  'nyan_missions_streak',

    // ── POOL COMPLETO DE MISSÕES ──────────────────────
    // id único · dificuldade · descrição · recompensa
    // check(ctx) recebe contexto com dados do evento atual

    POOL: [
        // ── FÁCIL ─────────────────────────────────────
        {
            id: 'play_any',
            diff: 'easy',
            icon: '🎮',
            title: 'Aquecimento',
            desc: 'Jogue qualquer jogo uma vez',
            check: (ctx) => ctx.event === 'play_game',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'open_tool',
            diff: 'easy',
            icon: '🔧',
            title: 'Explorador',
            desc: 'Abra qualquer ferramenta',
            check: (ctx) => ctx.event === 'open_tool',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'play_3_games',
            diff: 'easy',
            icon: '🕹️',
            title: 'Maratonista',
            desc: 'Jogue 3 partidas no total',
            check: (ctx) => ctx.event === 'play_game',
            progress: (state) => ({ current: state.plays || 0, max: 3 }),
            counter: true,
        },
        {
            id: 'check_weather',
            diff: 'easy',
            icon: '🌤️',
            title: 'Previsão do Dia',
            desc: 'Consulte o clima',
            check: (ctx) => ctx.event === 'open_tool' && ctx.tool === 'weather',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'translate_something',
            diff: 'easy',
            icon: '🌍',
            title: 'Poliglota',
            desc: 'Use o tradutor uma vez',
            check: (ctx) => ctx.event === 'open_tool' && ctx.tool === 'translator',
            progress: () => ({ current: 0, max: 1 }),
        },

        // ── MÉDIO ──────────────────────────────────────
        {
            id: 'typeracer_50wpm',
            diff: 'medium',
            icon: '⌨️',
            title: 'Dedos Rápidos',
            desc: 'Alcance 50+ WPM no Type Racer',
            check: (ctx) => ctx.event === 'typeracer_finish' && ctx.wpm >= 50,
            progress: (state) => ({ current: state.bestWpm || 0, max: 50, unit: 'WPM' }),
        },
        {
            id: 'score_1000_2048',
            diff: 'medium',
            icon: '🔢',
            title: 'Mil Pontos',
            desc: 'Alcance 1.000 pontos no 2048',
            check: (ctx) => ctx.event === 'score_2048' && ctx.score >= 1000,
            progress: (state) => ({ current: state.best2048 || 0, max: 1000 }),
        },
        {
            id: 'quiz_6',
            diff: 'medium',
            icon: '🧠',
            title: 'Estudioso',
            desc: 'Acerte 6+ perguntas no Quiz Diário',
            check: (ctx) => ctx.event === 'quiz_finish' && ctx.score >= 6,
            progress: (state) => ({ current: state.quizScore || 0, max: 6 }),
        },
        {
            id: 'flappy_5',
            diff: 'medium',
            icon: '🐱',
            title: 'Aviador',
            desc: 'Passe 5 canos no Flappy Bird',
            check: (ctx) => ctx.event === 'flappy_finish' && ctx.score >= 5,
            progress: (state) => ({ current: state.flappyScore || 0, max: 5 }),
        },
        {
            id: 'slot_3_spins',
            diff: 'medium',
            icon: '🎰',
            title: 'Sorte Grande',
            desc: 'Gire o Caça-Níquel 3 vezes',
            check: (ctx) => ctx.event === 'play_game' && ctx.game === 'slot',
            progress: (state) => ({ current: state.slotSpins || 0, max: 3 }),
            counter: true,
        },
        {
            id: 'forca_win',
            diff: 'medium',
            icon: '🎯',
            title: 'Adivinhou!',
            desc: 'Vença a Forca sem errar mais de 2 letras',
            check: (ctx) => ctx.event === 'forca_win' && ctx.errors <= 2,
            progress: () => ({ current: 0, max: 1 }),
        },

        // ── DIFÍCIL ────────────────────────────────────
        {
            id: 'typeracer_80wpm',
            diff: 'hard',
            icon: '🚀',
            title: 'Velocidade Sônica',
            desc: 'Alcance 80+ WPM no Type Racer',
            check: (ctx) => ctx.event === 'typeracer_finish' && ctx.wpm >= 80,
            progress: (state) => ({ current: state.bestWpm || 0, max: 80, unit: 'WPM' }),
        },
        {
            id: 'quiz_8',
            diff: 'hard',
            icon: '🏆',
            title: 'Quase Perfeito',
            desc: 'Acerte 8+ perguntas no Quiz Diário',
            check: (ctx) => ctx.event === 'quiz_finish' && ctx.score >= 8,
            progress: (state) => ({ current: state.quizScore || 0, max: 8 }),
        },
        {
            id: 'beat_any_record',
            diff: 'hard',
            icon: '📈',
            title: 'Novo Recorde',
            desc: 'Bata seu recorde em qualquer jogo',
            check: (ctx) => ctx.event === 'beat_record',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'slot_jackpot',
            diff: 'hard',
            icon: '💎',
            title: 'Jackpot!',
            desc: 'Acerte o jackpot 🐱🐱🐱 no Caça-Níquel',
            check: (ctx) => ctx.event === 'slot_jackpot',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'termo_3',
            diff: 'hard',
            icon: '🔤',
            title: 'Linguista',
            desc: 'Acerte o Termo em até 3 tentativas',
            check: (ctx) => ctx.event === 'termo_win' && ctx.attempts <= 3,
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'score_5000_2048',
            diff: 'hard',
            icon: '🔢',
            title: 'Cinco Mil',
            desc: 'Alcance 5.000 pontos no 2048',
            check: (ctx) => ctx.event === 'score_2048' && ctx.score >= 5000,
            progress: (state) => ({ current: state.best2048 || 0, max: 5000 }),
        },
    ],

    // ── POOL DE DESAFIOS SEMANAIS ─────────────────────
    WEEKLY_POOL: [
        {
            id: 'weekly_typeracer_100',
            icon: '⚡',
            title: 'Lenda da Digitação',
            desc: 'Alcance 100+ WPM no Type Racer esta semana',
            check: (ctx) => ctx.event === 'typeracer_finish' && ctx.wpm >= 100,
            progress: (state) => ({ current: state.bestWpm || 0, max: 100, unit: 'WPM' }),
        },
        {
            id: 'weekly_quiz_perfect',
            icon: '🧠',
            title: 'Gênio Absoluto',
            desc: 'Tire 10/10 no Quiz Diário',
            check: (ctx) => ctx.event === 'quiz_finish' && ctx.score === 10,
            progress: (state) => ({ current: state.quizScore || 0, max: 10 }),
        },
        {
            id: 'weekly_jackpot',
            icon: '🎰',
            title: 'Sorte Suprema',
            desc: 'Acerte o jackpot no Caça-Níquel',
            check: (ctx) => ctx.event === 'slot_jackpot',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'weekly_play_10',
            icon: '🕹️',
            title: 'Viciado にゃん~',
            desc: 'Jogue 10 partidas nesta semana',
            check: (ctx) => ctx.event === 'play_game',
            progress: (state) => ({ current: state.weeklyPlays || 0, max: 10 }),
            counter: true,
        },
        {
            id: 'weekly_beat_3_records',
            icon: '📈',
            title: 'Máquina de Recordes',
            desc: 'Bata 3 recordes pessoais nesta semana',
            check: (ctx) => ctx.event === 'beat_record',
            progress: (state) => ({ current: state.weeklyRecords || 0, max: 3 }),
            counter: true,
        },
        {
            id: 'weekly_2048_2048',
            icon: '🔢',
            title: 'Mestre do 2048',
            desc: 'Alcance o tile 2048 no jogo',
            check: (ctx) => ctx.event === 'score_2048' && ctx.score >= 20000,
            progress: (state) => ({ current: state.best2048 || 0, max: 20000 }),
        },
    ],

    // ── RECOMPENSAS POR DIFICULDADE ───────────────────
    REWARDS: {
        easy:   { xp: 25,  chips: 15  },
        medium: { xp: 50,  chips: 30  },
        hard:   { xp: 80,  chips: 60  },
        weekly: { xp: 200, chips: 100 },
    },

    // ── SEED / DATA ───────────────────────────────────

    _getToday() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    _getWeekStart() {
        const d = new Date();
        const day = d.getDay(); // 0=Dom
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7)); // volta para segunda
        return `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
    },

    // Seed determinístico baseado em string → número
    _seed(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) ^ str.charCodeAt(i);
        }
        return Math.abs(h);
    },

    // Selecionar N itens do pool usando seed (mesmos para todos no mesmo dia)
    _pickSeeded(pool, n, seed) {
        const arr = [...pool];
        let s = seed;
        for (let i = arr.length - 1; i > 0; i--) {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            const j = Math.abs(s) % (i + 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, n);
    },

    // ── LOAD / SAVE ───────────────────────────────────

    load() {
        return Utils.loadData(this.KEY) || {};
    },

    save(data) {
        Utils.saveData(this.KEY, data);
    },

    // ── GERAR MISSÕES DO DIA ──────────────────────────

    getDailyMissions() {
        const today = this._getToday();
        const data  = this.load();

        // Se já gerou hoje, retornar do cache
        if (data.date === today && data.missions) {
            return data.missions;
        }

        // Separar pool por dificuldade
        const easy   = this.POOL.filter(m => m.diff === 'easy');
        const medium = this.POOL.filter(m => m.diff === 'medium');
        const hard   = this.POOL.filter(m => m.diff === 'hard');

        const seed = this._seed(today);

        // 1 fácil + 1 médio + 1 difícil por dia
        const picked = [
            ...this._pickSeeded(easy,   1, seed),
            ...this._pickSeeded(medium, 1, seed ^ 0xdeadbeef),
            ...this._pickSeeded(hard,   1, seed ^ 0xcafebabe),
        ];

        const missions = picked.map(m => ({
            id:        m.id,
            diff:      m.diff,
            icon:      m.icon,
            title:     m.title,
            desc:      m.desc,
            completed: false,
            progress:  0,
            max:       1,
            counter:   m.counter || false,
        }));

        // Preservar streak e estado semanal, resetar missões diárias
        const newData = {
            ...data,
            date:     today,
            missions,
            state:    {}, // contexto de progresso do dia (contadores)
        };

        this.save(newData);
        return missions;
    },

    getWeeklyChallenge() {
        const weekStart = this._getWeekStart();
        const data      = this.load();

        if (data.weekStart === weekStart && data.weekly) {
            return data.weekly;
        }

        const seed    = this._seed(weekStart + '_weekly');
        const [picked] = this._pickSeeded(this.WEEKLY_POOL, 1, seed);

        const weekly = {
            id:        picked.id,
            icon:      picked.icon,
            title:     picked.title,
            desc:      picked.desc,
            completed: false,
            progress:  0,
            max:       picked.progress ? picked.progress({}).max || 1 : 1,
            counter:   picked.counter || false,
        };

        const newData = { ...data, weekStart, weekly, weeklyState: {} };
        this.save(newData);
        return weekly;
    },

    // ── PROCESSAR EVENTO ──────────────────────────────
    /**
     * Chamado pelos jogos/ferramentas quando algo acontece.
     * ctx = { event, ...dados específicos }
     *
     * Exemplos:
     *   Missions.track({ event: 'play_game', game: 'slot' })
     *   Missions.track({ event: 'typeracer_finish', wpm: 65 })
     *   Missions.track({ event: 'quiz_finish', score: 8 })
     *   Missions.track({ event: 'beat_record' })
     *   Missions.track({ event: 'open_tool', tool: 'weather' })
     */
    track(ctx) {
        const data    = this.load();
        const today   = this._getToday();

        // Resetar se virou o dia
        if (data.date !== today) {
            this.getDailyMissions();
            return this.track(ctx); // retry com dados frescos
        }

        let changed = false;
        const state = data.state || {};

        // ── Missões diárias ──────────────────────────
        const missions = (data.missions || []).map(m => {
            if (m.completed) return m;

            const def = this.POOL.find(p => p.id === m.id);
            if (!def) return m;

            // Atualizar estado de progresso para contadores
            if (def.counter && def.check(ctx)) {
                state[m.id] = (state[m.id] || 0) + 1;
                const prog  = def.progress(state[m.id] !== undefined ? { plays: state[m.id], slotSpins: state[m.id] } : {});
                m.progress  = state[m.id];
                m.max       = prog.max;

                if (state[m.id] >= prog.max) {
                    m.completed = true;
                    changed     = true;
                    this._completeMission(m);
                }
            } else if (!def.counter && def.check(ctx)) {
                m.completed = true;
                m.progress  = 1;
                changed     = true;
                this._completeMission(m);
            } else {
                // Atualizar progresso sem completar (para exibir barra)
                this._updateProgress(m, def, ctx, state);
            }

            return m;
        });

        // ── Desafio semanal ──────────────────────────
        let weekly = data.weekly;
        if (weekly && !weekly.completed) {
            const weekState = data.weeklyState || {};
            const wDef = this.WEEKLY_POOL.find(p => p.id === weekly.id);

            if (wDef) {
                if (wDef.counter && wDef.check(ctx)) {
                    weekState[weekly.id] = (weekState[weekly.id] || 0) + 1;
                    weekly.progress      = weekState[weekly.id];

                    if (weekly.progress >= weekly.max) {
                        weekly.completed = true;
                        changed = true;
                        this._completeWeekly(weekly);
                    }
                } else if (!wDef.counter && wDef.check(ctx)) {
                    weekly.completed = true;
                    changed          = true;
                    this._completeWeekly(weekly);
                }
                data.weeklyState = weekState;
            }
        }

        if (changed || true) { // sempre salvar progresso
            data.missions = missions;
            data.weekly   = weekly;
            data.state    = state;
            this.save(data);
        }

        // Atualizar badge na sidebar se visível
        this._refreshBadge();

        // Verificar streak de missões completas
        const allDone = missions.every(m => m.completed);
        if (allDone) this._checkMissionStreak();
    },

    _updateProgress(m, def, ctx, state) {
        // Atualiza apenas campos numéricos de progresso sem completar
        if (ctx.event === 'typeracer_finish' && def.id.includes('typeracer')) {
            state.bestWpm  = Math.max(state.bestWpm || 0, ctx.wpm || 0);
            m.progress     = Math.min(state.bestWpm, m.max);
        } else if (ctx.event === 'quiz_finish' && def.id.includes('quiz')) {
            state.quizScore = Math.max(state.quizScore || 0, ctx.score || 0);
            m.progress      = Math.min(state.quizScore, m.max);
        } else if (ctx.event === 'score_2048') {
            state.best2048 = Math.max(state.best2048 || 0, ctx.score || 0);
            m.progress     = Math.min(state.best2048, m.max);
        } else if (ctx.event === 'flappy_finish') {
            state.flappyScore = Math.max(state.flappyScore || 0, ctx.score || 0);
            m.progress        = Math.min(state.flappyScore, m.max);
        }
    },

    // ── COMPLETAR MISSÃO ──────────────────────────────

    _completeMission(m) {
        const reward  = this.REWARDS[m.diff];
        const streak  = this._getMissionStreak();
        const mult    = (streak > 0 && streak % 3 === 0) ? 1.5 : 1;

        if (window.Economy) {
            Economy.grant(
                m.diff === 'easy'   ? 'mission_easy'   :
                m.diff === 'medium' ? 'mission_medium'  : 'mission_hard',
                mult
            );
        }

        const xp     = Math.round(reward.xp * mult);
        const chips  = Math.round(reward.chips * mult);
        const suffix = mult > 1 ? ' 🔥 +50% streak!' : '';

        Utils.showNotification?.(
            `✅ Missão: "${m.title}" — +${xp} XP · +${chips} chips${suffix}`,
            'success'
        );

        console.log(`[Missions] Completa: ${m.title} (${m.diff})${mult > 1 ? ' ×1.5 streak' : ''}`);
        this._refreshBadge();
    },

    _completeWeekly(w) {
        if (window.Economy) {
            Economy.grant('weekly_challenge');
        }
        Utils.showNotification?.(
            `🏆 Desafio semanal: "${w.title}" — +200 XP · +100 chips! にゃん~`,
            'success'
        );
        console.log(`[Missions] Desafio semanal completo: ${w.title}`);
    },

    // ── STREAK DE MISSÕES ─────────────────────────────

    _getMissionStreak() {
        return Utils.loadData(this.STREAK_KEY) || 0;
    },

    _checkMissionStreak() {
        const data       = this.load();
        const today      = this._getToday();
        const streakData = Utils.loadData(this.STREAK_KEY + '_data') || {};

        if (streakData.lastComplete === today) return; // já contou hoje

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

        const newStreak = streakData.lastComplete === yStr
            ? (streakData.streak || 0) + 1
            : 1;

        Utils.saveData(this.STREAK_KEY, newStreak);
        Utils.saveData(this.STREAK_KEY + '_data', { lastComplete: today, streak: newStreak });

        if (newStreak % 3 === 0) {
            Utils.showNotification?.(
                `🔥 ${newStreak} dias seguidos! Próximas recompensas +50% にゃん~`,
                'success'
            );
        }
    },

    // ── RENDER ────────────────────────────────────────

    render() {
        const missions = this.getDailyMissions();
        const weekly   = this.getWeeklyChallenge();
        const streak   = this._getMissionStreak();
        const data     = this.load();

        const allDone  = missions.every(m => m.completed);
        const doneCount = missions.filter(m => m.completed).length;

        const d      = document.body.classList.contains('dark-theme');
        const bg     = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const border = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const text   = d ? '#f1f5f9'                : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted  = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const inner  = d ? 'rgba(255,255,255,0.05)' : '#f8fafc';

        // Tempo até meia-noite
        const now  = new Date();
        const mid  = new Date(now); mid.setHours(24,0,0,0);
        const diff = Math.round((mid - now) / 60000);
        const resetIn = `${Math.floor(diff/60)}h ${diff%60}m`;

        // Tempo até próxima segunda
        const dayOfWeek  = now.getDay();
        const daysToMon  = (8 - dayOfWeek) % 7 || 7;
        const nextMon    = new Date(now); nextMon.setDate(now.getDate() + daysToMon); nextMon.setHours(0,0,0,0);
        const weekDiff   = Math.round((nextMon - now) / 3600000);
        const weekReset  = `${Math.floor(weekDiff/24)}d ${weekDiff%24}h`;

        const diffColors = {
            easy:   { bg: d ? 'rgba(74,222,128,0.12)'  : '#f0fdf4', border: d ? 'rgba(74,222,128,0.25)'  : '#bbf7d0', text: d ? '#4ade80'  : '#15803d', label: 'Fácil'   },
            medium: { bg: d ? 'rgba(168,85,247,0.12)'  : '#faf5ff', border: d ? 'rgba(168,85,247,0.25)'  : '#e9d5ff', text: d ? '#a855f7'  : '#7c3aed', label: 'Médio'   },
            hard:   { bg: d ? 'rgba(239,68,68,0.12)'   : '#fff1f2', border: d ? 'rgba(239,68,68,0.25)'   : '#fecdd3', text: d ? '#f87171'  : '#be123c', label: 'Difícil' },
        };

        const missionCards = missions.map(m => {
            const dc  = diffColors[m.diff];
            const pct = m.max > 1 ? Math.round((m.progress / m.max) * 100) : (m.completed ? 100 : 0);

            return `
            <div style="
                background:${m.completed ? (d?'rgba(74,222,128,0.06)':'#f0fdf4') : bg};
                border:1px solid ${m.completed ? (d?'rgba(74,222,128,0.2)':'#bbf7d0') : border};
                border-radius:14px; padding:1rem 1.125rem;
                transition:all 0.2s;
                ${m.completed ? 'opacity:0.75;' : ''}
            ">
                <div style="display:flex;align-items:flex-start;gap:0.75rem;">
                    <!-- Ícone -->
                    <div style="
                        width:38px;height:38px;border-radius:10px;flex-shrink:0;
                        background:${dc.bg};border:1px solid ${dc.border};
                        display:flex;align-items:center;justify-content:center;
                        font-size:1.1rem;
                        ${m.completed ? 'filter:grayscale(0.3);' : ''}
                    ">${m.completed ? '✅' : m.icon}</div>

                    <!-- Info -->
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;flex-wrap:wrap;">
                            <span style="font-size:0.85rem;font-weight:700;color:${text};font-family:'Syne',sans-serif;">${m.title}</span>
                            <span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                                color:${dc.text};background:${dc.bg};border:1px solid ${dc.border};
                                border-radius:99px;padding:1px 7px;">${dc.label}</span>
                            ${m.completed ? `<span style="font-size:0.6rem;font-weight:700;color:${d?'#4ade80':'#15803d'};">✓ Concluída</span>` : ''}
                        </div>
                        <p style="font-size:0.75rem;color:${sub};margin:0 0 ${m.max>1 || m.completed?'0.5rem':'0'};">${m.desc}</p>

                        <!-- Barra de progresso (para missões com contador) -->
                        ${m.max > 1 ? `
                        <div style="height:4px;background:${inner};border-radius:99px;overflow:hidden;">
                            <div style="height:100%;width:${pct}%;background:${dc.text};border-radius:99px;transition:width 0.4s ease;"></div>
                        </div>
                        <div style="font-size:0.65rem;color:${muted};margin-top:0.25rem;">${m.progress}/${m.max}</div>
                        ` : ''}
                    </div>

                    <!-- Recompensa -->
                    <div style="text-align:right;flex-shrink:0;">
                        <div style="font-size:0.65rem;font-weight:700;color:${this.REWARDS[m.diff]?.xp || 0 > 0 ? (d?'#a78bfa':'#7c3aed') : muted};">
                            +${this.REWARDS[m.diff]?.xp} XP
                        </div>
                        <div style="font-size:0.65rem;color:${d?'#fcd34d':'#b45309'};">
                            +${this.REWARDS[m.diff]?.chips} chips
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Card do desafio semanal
        const weeklyCard = weekly ? `
        <div style="
            background:${weekly.completed ? (d?'rgba(74,222,128,0.06)':'#f0fdf4') : (d?'rgba(245,158,11,0.08)':'#fffbeb')};
            border:1px solid ${weekly.completed ? (d?'rgba(74,222,128,0.2)':'#bbf7d0') : (d?'rgba(245,158,11,0.25)':'#fde68a')};
            border-radius:14px; padding:1rem 1.125rem;
        ">
            <div style="display:flex;align-items:flex-start;gap:0.75rem;">
                <div style="
                    width:38px;height:38px;border-radius:10px;flex-shrink:0;
                    background:${d?'rgba(245,158,11,0.15)':'#fef3c7'};
                    border:1px solid ${d?'rgba(245,158,11,0.3)':'#fde68a'};
                    display:flex;align-items:center;justify-content:center;font-size:1.1rem;
                ">${weekly.completed ? '✅' : weekly.icon}</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;flex-wrap:wrap;">
                        <span style="font-size:0.85rem;font-weight:700;color:${text};font-family:'Syne',sans-serif;">${weekly.title}</span>
                        <span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                            color:${d?'#fcd34d':'#b45309'};background:${d?'rgba(245,158,11,0.15)':'#fef3c7'};
                            border:1px solid ${d?'rgba(245,158,11,0.3)':'#fde68a'};border-radius:99px;padding:1px 7px;">Semanal</span>
                        ${weekly.completed ? `<span style="font-size:0.6rem;font-weight:700;color:${d?'#4ade80':'#15803d'};">✓ Concluído</span>` : ''}
                    </div>
                    <p style="font-size:0.75rem;color:${sub};margin:0 0 ${weekly.max>1?'0.5rem':'0'};">${weekly.desc}</p>
                    ${weekly.max > 1 ? `
                    <div style="height:4px;background:${inner};border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${Math.round((weekly.progress/weekly.max)*100)}%;background:${d?'#fcd34d':'#f59e0b'};border-radius:99px;transition:width 0.4s ease;"></div>
                    </div>
                    <div style="font-size:0.65rem;color:${muted};margin-top:0.25rem;">${weekly.progress}/${weekly.max}</div>
                    ` : ''}
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:0.65rem;font-weight:700;color:${d?'#a78bfa':'#7c3aed'};">+200 XP</div>
                    <div style="font-size:0.65rem;color:${d?'#fcd34d':'#b45309'};">+100 chips</div>
                    <div style="font-size:0.6rem;color:${muted};margin-top:0.2rem;">${weekReset}</div>
                </div>
            </div>
        </div>` : '';

        return `
        <div style="max-width:600px;margin:0 auto;font-family:var(--font-body,'DM Sans',sans-serif);">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">📋</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Missões
                </h1>
                <p style="font-size:0.75rem;color:${muted};margin:0;">Novas missões em <strong style="color:${sub};">${resetIn}</strong></p>
            </div>

            <!-- Status do dia -->
            <div style="background:${inner};border:1px solid ${border};border-radius:14px;padding:0.875rem 1rem;
                margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:0.625rem;">
                    <div style="font-size:1.4rem;">${allDone ? '🎉' : '📅'}</div>
                    <div>
                        <div style="font-size:0.8rem;font-weight:700;color:${text};">
                            ${allDone ? 'Todas as missões concluídas!' : `${doneCount}/3 missões completas`}
                        </div>
                        <div style="font-size:0.68rem;color:${muted};">
                            ${streak > 0 ? `🔥 Sequência: ${streak} dia${streak!==1?'s':''} consecutivos` : 'Complete todas para iniciar sequência'}
                        </div>
                    </div>
                </div>
                ${streak > 0 && streak % 3 === 0 ? `
                <div style="font-size:0.68rem;font-weight:700;background:rgba(245,158,11,0.15);
                    color:${d?'#fcd34d':'#b45309'};border:1px solid rgba(245,158,11,0.3);
                    border-radius:99px;padding:3px 10px;">🔥 +50% recompensas ativas!</div>
                ` : streak > 0 ? `
                <div style="font-size:0.68rem;color:${muted};">
                    +50% em ${3 - (streak % 3)} dia${3-(streak%3)!==1?'s':''}
                </div>` : ''}
            </div>

            <!-- Missões do dia -->
            <div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
                color:${muted};margin-bottom:0.625rem;">Missões de hoje</div>
            <div style="display:flex;flex-direction:column;gap:0.625rem;margin-bottom:1.5rem;">
                ${missionCards}
            </div>

            <!-- Desafio semanal -->
            <div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
                color:${muted};margin-bottom:0.625rem;">Desafio semanal · renova ${weekReset}</div>
            ${weeklyCard}

        </div>`;
    },

    // ── RENDER MINI (para sidebar) ────────────────────

    renderSidebarWidget() {
        const missions  = this.getDailyMissions();
        const doneCount = missions.filter(m => m.completed).length;
        const total     = missions.length;
        const pct       = Math.round((doneCount / total) * 100);
        const allDone   = doneCount === total;

        // Próxima missão pendente com texto truncado
        const nextMission = missions.find(m => !m.completed);
        const previewText = nextMission
            ? `${nextMission.icon} ${nextMission.title}`
            : '✓ Todas concluídas! にゃん~';

        const bgColor     = allDone ? 'rgba(74,222,128,0.15)' : 'rgba(0,0,0,0.2)';
        const borderColor = allDone ? 'rgba(74,222,128,0.3)'  : 'rgba(255,255,255,0.12)';
        const bgHover     = allDone ? 'rgba(74,222,128,0.22)' : 'rgba(0,0,0,0.3)';
        const countColor  = allDone ? '#4ade80' : 'rgba(255,255,255,0.9)';
        const barColor    = allDone
            ? '#4ade80'
            : 'linear-gradient(90deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899))';
        const previewColor = allDone ? '#4ade80' : 'rgba(255,255,255,0.75)';

        return `
        <div id="missions-sidebar-widget" style="
            margin:0 0.5rem 0.375rem;
            padding:0.625rem 0.75rem;
            border-radius:10px;
            background:${bgColor};
            border:1px solid ${borderColor};
            cursor:pointer;
            transition:background 0.18s ease, border-color 0.18s ease;
        " onclick="Router.navigate('missions')"
           onmouseover="this.style.background='${bgHover}'"
           onmouseout="this.style.background='${bgColor}'">

            <!-- Header: label + contador -->
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                <span style="
                    font-size:0.6rem;font-weight:800;letter-spacing:0.1em;
                    text-transform:uppercase;color:rgba(255,255,255,0.55);
                    font-family:'DM Sans',sans-serif;
                ">📋 Missões</span>
                <span style="
                    font-size:0.68rem;font-weight:800;color:${countColor};
                    font-family:'Syne',sans-serif;
                ">${doneCount}/${total}</span>
            </div>

            <!-- Barra de progresso -->
            <div style="height:4px;background:rgba(255,255,255,0.12);border-radius:99px;overflow:hidden;margin-bottom:0.4rem;">
                <div style="height:100%;width:${pct}%;
                    background:${barColor};
                    border-radius:99px;transition:width 0.4s ease;"></div>
            </div>

            <!-- Preview da próxima missão -->
            <div style="
                font-size:0.7rem;
                font-weight:600;
                color:${previewColor};
                font-family:'DM Sans',sans-serif;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
                line-height:1.3;
            ">${previewText}</div>

        </div>`;
    },

    // ── BADGE NA NAV (ponto vermelho no item) ─────────
    getPendingCount() {
        const missions = this.getDailyMissions();
        return missions.filter(m => !m.completed).length;
    },

    // ── REFRESH UI ────────────────────────────────────
    _refreshBadge() {
        const pending = this.getPendingCount();
        const badge   = document.getElementById('missions-nav-badge');
        if (badge) {
            badge.style.display = pending > 0 ? 'flex' : 'none';
            badge.textContent   = pending;
        }
        // Atualizar widget da sidebar se visível
        const widget = document.getElementById('missions-sidebar-widget');
        if (widget) {
            const missions  = this.getDailyMissions();
            const doneCount = missions.filter(m => m.completed).length;
            widget.innerHTML = this.renderSidebarWidget().match(/<div[^>]*id="missions-sidebar-widget"[^>]*>([\s\S]*)<\/div>/)?.[1] || '';
        }
    },

    // ── INIT ──────────────────────────────────────────
    init() {
        // Garantir que as missões do dia existem
        this.getDailyMissions();
        this.getWeeklyChallenge();
        console.log(`[Missions v1.0.0] ${this.getPendingCount()} missões pendentes hoje`);
    },
};

window.Missions = Missions;