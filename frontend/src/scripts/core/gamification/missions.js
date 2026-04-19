const Missions = {

    KEY:         'nyan_missions',
    STREAK_KEY:  'nyan_missions_streak',
    STREAK_HISTORY_KEY: 'nyan_missions_streak_history',

    WEEKEND_BONUS: {
        id: 'weekend_season_bonus',
        diff: 'seasonal',
        icon: '\u{1F338}',
        title: 'Rush de Temporada',
        desc: 'Jogue 5 partidas durante o evento de fim de semana',
        seasonXP: 180,
        counter: true,
        check: (ctx) => ctx.event === 'play_game',
        progress: (state) => ({ current: state.weekendPlays || 0, max: 5 }),
    },

    POOL: [
        {
            id: 'play_any',
            diff: 'easy',
            icon: '\u{1F3AE}',
            title: 'Aquecimento',
            desc: 'Jogue qualquer jogo uma vez',
            check: (ctx) => ctx.event === 'play_game',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'open_tool',
            diff: 'easy',
            icon: '\u{1F527}',
            title: 'Explorador',
            desc: 'Abra qualquer ferramenta',
            check: (ctx) => ctx.event === 'open_tool',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'play_3_games',
            diff: 'easy',
            icon: '\u{1F579}\uFE0F',
            title: 'Maratonista',
            desc: 'Jogue 3 partidas no total',
            check: (ctx) => ctx.event === 'play_game',
            progress: (state) => ({ current: state.plays || 0, max: 3 }),
            counter: true,
        },
        {
            id: 'check_weather',
            diff: 'easy',
            icon: '\u{1F324}\uFE0F',
            title: 'Previsao do Dia',
            desc: 'Consulte o clima',
            check: (ctx) => ctx.event === 'open_tool' && ctx.tool === 'weather',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'translate_something',
            diff: 'easy',
            icon: '\u{1F30D}',
            title: 'Poliglota',
            desc: 'Use o tradutor uma vez',
            check: (ctx) => ctx.event === 'open_tool' && ctx.tool === 'translator',
            progress: () => ({ current: 0, max: 1 }),
        },

        {
            id: 'typeracer_50wpm',
            diff: 'medium',
            icon: '\u2328\uFE0F',
            title: 'Dedos Rapidos',
            desc: 'Alcance 50+ WPM no Type Racer',
            check: (ctx) => ctx.event === 'typeracer_finish' && ctx.wpm >= 50,
            progress: (state) => ({ current: state.bestWpm || 0, max: 50, unit: 'WPM' }),
        },
        {
            id: 'score_1000_2048',
            diff: 'medium',
            icon: '\u{1F522}',
            title: 'Mil Pontos',
            desc: 'Alcance 1.000 pontos no 2048',
            check: (ctx) => ctx.event === 'score_2048' && ctx.score >= 1000,
            progress: (state) => ({ current: state.best2048 || 0, max: 1000 }),
        },
        {
            id: 'quiz_6',
            diff: 'medium',
            icon: '\u{1F9E0}',
            title: 'Estudioso',
            desc: 'Acerte 6+ perguntas no Quiz Diario',
            check: (ctx) => ctx.event === 'quiz_finish' && ctx.score >= 6,
            progress: (state) => ({ current: state.quizScore || 0, max: 6 }),
        },
        {
            id: 'flappy_5',
            diff: 'medium',
            icon: '\u{1F431}',
            title: 'Aviador',
            desc: 'Passe 5 canos no Flappy Bird',
            check: (ctx) => ctx.event === 'flappy_finish' && ctx.score >= 5,
            progress: (state) => ({ current: state.flappyScore || 0, max: 5 }),
        },
        {
            id: 'slot_3_spins',
            diff: 'medium',
            icon: '\u{1F3B0}',
            title: 'Sorte Grande',
            desc: 'Gire o Caca-Niquel 3 vezes',
            check: (ctx) => ctx.event === 'play_game' && ctx.game === 'slot',
            progress: (state) => ({ current: state.slotSpins || 0, max: 3 }),
            counter: true,
        },
        {
            id: 'forca_win',
            diff: 'medium',
            icon: '\u{1F3AF}',
            title: 'Adivinhou!',
            desc: 'Venca a Forca sem errar mais de 2 letras',
            check: (ctx) => ctx.event === 'forca_win' && ctx.errors <= 2,
            progress: () => ({ current: 0, max: 1 }),
        },

        {
            id: 'typeracer_80wpm',
            diff: 'hard',
            icon: '\u{1F680}',
            title: 'Velocidade Sonica',
            desc: 'Alcance 80+ WPM no Type Racer',
            check: (ctx) => ctx.event === 'typeracer_finish' && ctx.wpm >= 80,
            progress: (state) => ({ current: state.bestWpm || 0, max: 80, unit: 'WPM' }),
        },
        {
            id: 'quiz_8',
            diff: 'hard',
            icon: '\u{1F3C6}',
            title: 'Quase Perfeito',
            desc: 'Acerte 8+ perguntas no Quiz Diario',
            check: (ctx) => ctx.event === 'quiz_finish' && ctx.score >= 8,
            progress: (state) => ({ current: state.quizScore || 0, max: 8 }),
        },
        {
            id: 'beat_any_record',
            diff: 'hard',
            icon: '\u{1F4C8}',
            title: 'Novo Recorde',
            desc: 'Bata seu recorde em qualquer jogo',
            check: (ctx) => ctx.event === 'beat_record',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'slot_jackpot',
            diff: 'hard',
            icon: '\u{1F48E}',
            title: 'Jackpot!',
            desc: 'Acerte o jackpot \u{1F431}\u{1F431}\u{1F431} no Caca-Niquel',
            check: (ctx) => ctx.event === 'slot_jackpot',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'termo_3',
            diff: 'hard',
            icon: '\u{1F524}',
            title: 'Linguista',
            desc: 'Acerte o Termo em ate 3 tentativas',
            check: (ctx) => ctx.event === 'termo_win' && ctx.attempts <= 3,
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'score_5000_2048',
            diff: 'hard',
            icon: '\u{1F522}',
            title: 'Cinco Mil',
            desc: 'Alcance 5.000 pontos no 2048',
            check: (ctx) => ctx.event === 'score_2048' && ctx.score >= 5000,
            progress: (state) => ({ current: state.best2048 || 0, max: 5000 }),
        },
    ],

    WEEKLY_POOL: [
        {
            id: 'weekly_typeracer_100',
            icon: '\u26A1',
            title: 'Lenda da Digitacao',
            desc: 'Alcance 100+ WPM no Type Racer esta semana',
            check: (ctx) => ctx.event === 'typeracer_finish' && ctx.wpm >= 100,
            progress: (state) => ({ current: state.bestWpm || 0, max: 100, unit: 'WPM' }),
        },
        {
            id: 'weekly_quiz_perfect',
            icon: '\u{1F9E0}',
            title: 'Genio Absoluto',
            desc: 'Tire 10/10 no Quiz Diario',
            check: (ctx) => ctx.event === 'quiz_finish' && ctx.score === 10,
            progress: (state) => ({ current: state.quizScore || 0, max: 10 }),
        },
        {
            id: 'weekly_jackpot',
            icon: '\u{1F3B0}',
            title: 'Sorte Suprema',
            desc: 'Acerte o jackpot no Caca-Niquel',
            check: (ctx) => ctx.event === 'slot_jackpot',
            progress: () => ({ current: 0, max: 1 }),
        },
        {
            id: 'weekly_play_10',
            icon: '\u{1F579}\uFE0F',
            title: 'Viciado nyan~',
            desc: 'Jogue 10 partidas nesta semana',
            check: (ctx) => ctx.event === 'play_game',
            progress: (state) => ({ current: state.weeklyPlays || 0, max: 10 }),
            counter: true,
        },
        {
            id: 'weekly_beat_3_records',
            icon: '\u{1F4C8}',
            title: 'Maquina de Recordes',
            desc: 'Bata 3 recordes pessoais nesta semana',
            check: (ctx) => ctx.event === 'beat_record',
            progress: (state) => ({ current: state.weeklyRecords || 0, max: 3 }),
            counter: true,
        },
        {
            id: 'weekly_2048_2048',
            icon: '\u{1F522}',
            title: 'Mestre do 2048',
            desc: 'Alcance o tile 2048 no jogo',
            check: (ctx) => ctx.event === 'score_2048' && ctx.score >= 20000,
            progress: (state) => ({ current: state.best2048 || 0, max: 20000 }),
        },
    ],

    REWARDS: {
        easy:   { xp: 25,  chips: 15  },
        medium: { xp: 50,  chips: 30  },
        hard:   { xp: 80,  chips: 60  },
        weekly: { xp: 200, chips: 100 },
    },

    _getToday() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },

    _getWeekStart() {
        const d = new Date();
        const day = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7));
        return `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
    },

    _seed(str) {
        let h = 5381;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) + h) ^ str.charCodeAt(i);
        }
        return Math.abs(h);
    },

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

    _getPlayerSalt() {
        const user = window.Auth?.getStoredUser?.();
        return user?.username || Utils.loadData('toolbox_user') || 'nyan';
    },

    _isWeekendSeasonMissionActive() {
        const event = window.Seasons?.getActiveWeekendEvent?.();
        return !!event && !!window.Seasons?.isActive?.();
    },

    _buildWeekendMission() {
        return {
            id: this.WEEKEND_BONUS.id,
            diff: this.WEEKEND_BONUS.diff,
            icon: this.WEEKEND_BONUS.icon,
            title: this.WEEKEND_BONUS.title,
            desc: this.WEEKEND_BONUS.desc,
            completed: false,
            progress: 0,
            max: this.WEEKEND_BONUS.progress({}).max || 5,
            counter: true,
            seasonXP: this.WEEKEND_BONUS.seasonXP,
        };
    },

    _getMissionDefinition(id) {
        if (id === this.WEEKEND_BONUS.id) return this.WEEKEND_BONUS;
        return this.POOL.find((p) => p.id === id) || null;
    },

    load() {
        return Utils.loadData(this.KEY) || {};
    },

    save(data) {
        Utils.saveData(this.KEY, data);
    },

    getDailyMissions() {
        const today = this._getToday();
        const data = this.load();
        const needsWeekendMission = this._isWeekendSeasonMissionActive();

        if (data.date === today && Array.isArray(data.missions)) {
            const hasWeekend = data.missions.some((m) => m.id === this.WEEKEND_BONUS.id);
            if (hasWeekend === needsWeekendMission) return data.missions;
        }

        const easy = this.POOL.filter((m) => m.diff === 'easy');
        const mediumHard = this.POOL.filter((m) => m.diff === 'medium' || m.diff === 'hard');
        const userSeed = this._seed(`${today}_${this._getPlayerSalt()}`);
        const dayIndex = Math.floor(new Date(`${today}T00:00:00`).getTime() / 86400000);

        const first = this._pickSeeded(easy, 1, userSeed)[0];
        const second = this._pickSeeded(mediumHard, 1, userSeed ^ (dayIndex * 2654435761))[0];
        const excluded = new Set([first?.id, second?.id].filter(Boolean));
        const fallbackPool = this.POOL.filter((m) => !excluded.has(m.id));
        const third = this._pickSeeded(fallbackPool, 1, userSeed ^ 0x9e3779b9)[0];

        const picked = [first, second, third].filter(Boolean);
        const missions = picked.map((m) => ({
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

        if (needsWeekendMission) {
            missions.push(this._buildWeekendMission());
        }

        const newData = {
            ...data,
            date:     today,
            missions,
            state:    {},
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

        if (data.date !== today) {
            this.getDailyMissions();
            return this.track(ctx);
        }

        let changed = false;
        const state = data.state || {};

        const missions = (data.missions || []).map((m) => {
            if (m.completed) return m;

            const def = this._getMissionDefinition(m.id);
            if (!def) return m;

            if (def.counter && def.check(ctx)) {
                state[m.id] = (state[m.id] || 0) + 1;
                const countState = {
                    ...state,
                    plays: state[m.id],
                    slotSpins: state[m.id],
                    weeklyPlays: state[m.id],
                    weeklyRecords: state[m.id],
                    messagesSent: state[m.id],
                    reactions: state[m.id],
                    weekendPlays: state[m.id],
                };
                const prog = def.progress ? def.progress(countState) : { max: m.max || 1 };
                m.progress = state[m.id];
                m.max = prog.max || m.max || 1;

                if (state[m.id] >= (m.max || 1)) {
                    m.completed = true;
                    changed = true;
                    this._completeMission(m);
                }
            } else if (!def.counter && def.check(ctx)) {
                m.completed = true;
                m.progress = 1;
                changed = true;
                this._completeMission(m);
            } else {
                this._updateProgress(m, def, ctx, state);
            }

            return m;
        });

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

        if (changed || true) {
            data.missions = missions;
            data.weekly   = weekly;
            data.state    = state;
            this.save(data);
        }

        this._refreshBadge();

        const allDone = missions.every(m => m.completed);
        if (allDone) this._checkMissionStreak();
    },

    _updateProgress(m, def, ctx, state) {
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

    _completeMission(m) {
        const isSeasonalBonus = m.diff === 'seasonal';
        const reward = this.REWARDS[m.diff] || { xp: 0, chips: 0 };
        const streak = this._getMissionStreak();
        const mult = (streak > 0 && streak % 3 === 0) ? 1.5 : 1;

        let xp = 0;
        let chips = 0;

        if (!isSeasonalBonus && window.Economy) {
            const grantAction =
                m.diff === 'easy' ? 'mission_easy'
                : m.diff === 'medium' ? 'mission_medium'
                : 'mission_hard';
            const grantResult = Economy.grant(grantAction, mult);
            xp = grantResult?.xpAward ?? Math.round(reward.xp * mult);
            chips = grantResult?.chipsAward ?? Math.round(reward.chips * mult);
        }

        if (m.seasonXP && window.Seasons?.addXP) {
            window.Seasons.addXP(m.seasonXP, { source: 'weekend_bonus_mission' });
        }

        const streakSuffix = mult > 1 ? ' +50% streak!' : ''; 
        const seasonSuffix = m.seasonXP ? ` +${m.seasonXP} XP sazonal` : ''; 

        const rewardText = isSeasonalBonus
            ? `\u2705 Missao: "${m.title}" -${seasonSuffix || ' bonus sazonal aplicado'}${streakSuffix}`
            : `\u2705 Missao: "${m.title}" - +${xp} XP +${chips} chips${seasonSuffix}${streakSuffix}`;

        Utils.showNotification?.(rewardText, 'success');

        this._refreshBadge();
    },

    _completeWeekly(w) {
        if (window.Economy) {
            Economy.grant('weekly_challenge');
        }
        Utils.showNotification?.(
            `\u{1F3C6} Desafio semanal: "${w.title}" - +200 XP +100 chips! nyan~`,
            'success'
        );
    },

    _getMissionStreak() {
        return Utils.loadData(this.STREAK_KEY) || 0;
    },

    _checkMissionStreak() {
        const data       = this.load();
        const today      = this._getToday();
        const streakData = Utils.loadData(this.STREAK_KEY + '_data') || {};

        if (streakData.lastComplete === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

        const newStreak = streakData.lastComplete === yStr
            ? (streakData.streak || 0) + 1
            : 1;

        Utils.saveData(this.STREAK_KEY, newStreak);
        Utils.saveData(this.STREAK_KEY + '_data', { lastComplete: today, streak: newStreak });

        const history = Utils.loadData(this.STREAK_HISTORY_KEY) || {};
        history[today] = true;
        Object.keys(history).forEach((key) => {
            const dayMs = new Date(`${key}T00:00:00`).getTime();
            if (!Number.isFinite(dayMs)) {
                delete history[key];
                return;
            }
            const ageDays = Math.floor((Date.now() - dayMs) / 86400000);
            if (ageDays > 45) delete history[key];
        });
        Utils.saveData(this.STREAK_HISTORY_KEY, history);

        if (newStreak % 3 === 0) {
            Utils.showNotification?.(
                `\u{1F525} ${newStreak} dias seguidos! Proximas recompensas +50% nyan~`,
                'success'
            );
        }
    },

    _renderStreakCalendar() {
        const d = document.body.classList.contains('dark-theme');
        const history = Utils.loadData(this.STREAK_HISTORY_KEY) || {};
        const labels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
        const today = new Date();
        const cells = [];

        for (let offset = 6; offset >= 0; offset--) {
            const day = new Date(today);
            day.setDate(today.getDate() - offset);
            const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const done = !!history[key];
            const isToday = offset === 0;

            cells.push(`
                <div style="display:flex;flex-direction:column;align-items:center;gap:0.24rem;">
                    <div style="
                        width:20px;height:20px;border-radius:6px;
                        border:1px solid ${done ? 'rgba(74,222,128,0.4)' : (d ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)')};
                        background:${done ? (d ? 'rgba(74,222,128,0.18)' : '#dcfce7') : (d ? 'rgba(255,255,255,0.04)' : '#f8fafc')};
                        color:${done ? '#22c55e' : (d ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)')};
                        font-size:0.66rem;font-weight:800;display:flex;align-items:center;justify-content:center;
                        box-shadow:${isToday ? '0 0 0 1px rgba(168,85,247,0.45)' : 'none'};
                    ">${done ? '\u2713' : '\u2022'}</div>
                    <span style="font-size:0.58rem;font-weight:700;color:${isToday ? 'var(--theme-primary,#a855f7)' : (d ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')};">${labels[day.getDay()]}</span>
                </div>
            `);
        }

        return `
            <div style="display:flex;align-items:flex-end;justify-content:center;gap:0.42rem;padding:0.1rem 0 0.2rem;">
                ${cells.join('')}
            </div>
        `;
    },

    render() {
        const missions = this.getDailyMissions();
        const weekly   = this.getWeeklyChallenge();
        const streak   = this._getMissionStreak();
        const totalMissions = missions.length;

        const allDone  = missions.every(m => m.completed);
        const doneCount = missions.filter(m => m.completed).length;

        const d      = document.body.classList.contains('dark-theme');
        const bg     = d ? 'rgba(255,255,255,0.04)' : '#ffffff';
        const border = d ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
        const text   = d ? '#f1f5f9'                : '#0f172a';
        const sub    = d ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.5)';
        const muted  = d ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';
        const inner  = d ? 'rgba(255,255,255,0.05)' : '#f8fafc';

        const now  = new Date();
        const mid  = new Date(now); mid.setHours(24,0,0,0);
        const diff = Math.round((mid - now) / 60000);
        const resetIn = `${Math.floor(diff/60)}h ${diff%60}m`;

        const dayOfWeek  = now.getDay();
        const daysToMon  = (8 - dayOfWeek) % 7 || 7;
        const nextMon    = new Date(now); nextMon.setDate(now.getDate() + daysToMon); nextMon.setHours(0,0,0,0);
        const weekDiff   = Math.round((nextMon - now) / 3600000);
        const weekReset  = `${Math.floor(weekDiff/24)}d ${weekDiff%24}h`;

        const diffColors = {
            easy:   { bg: d ? 'rgba(74,222,128,0.12)'  : '#f0fdf4', border: d ? 'rgba(74,222,128,0.25)'  : '#bbf7d0', text: d ? '#4ade80'  : '#15803d', label: 'Facil'   },
            medium: { bg: d ? 'rgba(168,85,247,0.12)'  : '#faf5ff', border: d ? 'rgba(168,85,247,0.25)'  : '#e9d5ff', text: d ? '#a855f7'  : '#7c3aed', label: 'Medio'   },
            hard:   { bg: d ? 'rgba(239,68,68,0.12)'   : '#fff1f2', border: d ? 'rgba(239,68,68,0.25)'   : '#fecdd3', text: d ? '#f87171'  : '#be123c', label: 'Dificil' },
            seasonal: { bg: d ? 'rgba(244,114,182,0.14)' : '#fdf2f8', border: d ? 'rgba(244,114,182,0.25)' : '#fbcfe8', text: d ? '#f472b6' : '#be185d', label: 'Sazonal' },
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
                    <div style="
                        width:38px;height:38px;border-radius:10px;flex-shrink:0;
                        background:${dc.bg};border:1px solid ${dc.border};
                        display:flex;align-items:center;justify-content:center;
                        font-size:1.1rem;
                        ${m.completed ? 'filter:grayscale(0.3);' : ''}
                    ">${m.completed ? '\u2705' : m.icon}</div>

                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;flex-wrap:wrap;">
                            <span style="font-size:0.85rem;font-weight:700;color:${text};font-family:'Syne',sans-serif;">${m.title}</span>
                            <span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                                color:${dc.text};background:${dc.bg};border:1px solid ${dc.border};
                                border-radius:99px;padding:1px 7px;">${dc.label}</span>
                            ${m.completed ? `<span style="font-size:0.6rem;font-weight:700;color:${d?'#4ade80':'#15803d'};">\u2713 Concluida</span>` : ''}
                        </div>
                        <p style="font-size:0.75rem;color:${sub};margin:0 0 ${m.max>1 || m.completed?'0.5rem':'0'};">${m.desc}</p>

                        ${m.max > 1 ? `
                        <div style="height:4px;background:${inner};border-radius:99px;overflow:hidden;">
                            <div style="height:100%;width:${pct}%;background:${dc.text};border-radius:99px;transition:width 0.4s ease;"></div>
                        </div>
                        <div style="font-size:0.65rem;color:${muted};margin-top:0.25rem;">${m.progress}/${m.max}</div>
                        ` : ''}
                    </div>

                    <div style="text-align:right;flex-shrink:0;">
                        ${m.seasonXP
                            ? `<div style="font-size:0.65rem;font-weight:700;color:${d ? '#f472b6' : '#be185d'};">+${m.seasonXP} XP sazonal</div>`
                            : `<div style="font-size:0.65rem;font-weight:700;color:${this.REWARDS[m.diff]?.xp || 0 > 0 ? (d?'#a78bfa':'#7c3aed') : muted};">+${this.REWARDS[m.diff]?.xp} XP</div>
                               <div style="font-size:0.65rem;color:${d?'#fcd34d':'#b45309'};">+${this.REWARDS[m.diff]?.chips} chips</div>`
                        }
                    </div>
                </div>
            </div>`;
        }).join('');

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
                ">${weekly.completed ? '\u2705' : weekly.icon}</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.2rem;flex-wrap:wrap;">
                        <span style="font-size:0.85rem;font-weight:700;color:${text};font-family:'Syne',sans-serif;">${weekly.title}</span>
                        <span style="font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                            color:${d?'#fcd34d':'#b45309'};background:${d?'rgba(245,158,11,0.15)':'#fef3c7'};
                            border:1px solid ${d?'rgba(245,158,11,0.3)':'#fde68a'};border-radius:99px;padding:1px 7px;">Semanal</span>
                        ${weekly.completed ? `<span style="font-size:0.6rem;font-weight:700;color:${d?'#4ade80':'#15803d'};">\u2713 Concluido</span>` : ''}
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

            <div style="text-align:center;margin-bottom:1.75rem;">
                <div style="font-size:2.5rem;margin-bottom:0.4rem;">\u{1F4CB}</div>
                <h1 style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:900;margin:0 0 0.25rem;
                    background:linear-gradient(135deg,var(--theme-primary,#a855f7),var(--theme-secondary,#ec4899));
                    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                    Missoes
                </h1>
                <p style="font-size:0.75rem;color:${muted};margin:0;">Novas missoes em <strong style="color:${sub};">${resetIn}</strong></p>
            </div>

            <div style="background:${inner};border:1px solid ${border};border-radius:14px;padding:0.875rem 1rem;
                margin-bottom:1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:0.625rem;">
                    <div style="font-size:1.4rem;">${allDone ? '\u{1F389}' : '\u{1F4CA}'}</div>
                    <div>
                        <div style="font-size:0.8rem;font-weight:700;color:${text};">
                            ${allDone ? 'Todas as missoes concluidas!' : `${doneCount}/${totalMissions} missoes completas`}
                        </div>
                        <div style="font-size:0.68rem;color:${muted};">
                            ${streak > 0 ? `\u{1F525} Sequencia: ${streak} dia${streak!==1?'s':''} consecutivos` : 'Complete todas para iniciar sequencia'}
                        </div>
                        ${this._renderStreakCalendar()}
                    </div>
                </div>
                ${streak > 0 && streak % 3 === 0 ? `
                <div style="font-size:0.68rem;font-weight:700;background:rgba(245,158,11,0.15);
                    color:${d?'#fcd34d':'#b45309'};border:1px solid rgba(245,158,11,0.3);
                    border-radius:99px;padding:3px 10px;">\u{1F525} +50% recompensas ativas!</div>
                ` : streak > 0 ? `
                <div style="font-size:0.68rem;color:${muted};">
                    +50% em ${3 - (streak % 3)} dia${3-(streak%3)!==1?'s':''}
                </div>` : ''}
            </div>

            <div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
                color:${muted};margin-bottom:0.625rem;">Missoes de hoje</div>
            <div style="display:flex;flex-direction:column;gap:0.625rem;margin-bottom:1.5rem;">
                ${missionCards}
            </div>

            <div style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;
                color:${muted};margin-bottom:0.625rem;">Desafio semanal - renova ${weekReset}</div>
            ${weeklyCard}

        </div>`;
    },

    renderSidebarWidget() {
        const missions  = this.getDailyMissions();
        const doneCount = missions.filter(m => m.completed).length;
        const total     = missions.length;
        const pct       = Math.round((doneCount / total) * 100);
        const allDone   = doneCount === total;

        const nextMission = missions.find(m => !m.completed);
        const previewText = nextMission
            ? `${nextMission.icon} ${nextMission.title}`
            : '\u2713 Todas concluidas! nyan~';

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

            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                <span style="
                    font-size:0.6rem;font-weight:800;letter-spacing:0.1em;
                    text-transform:uppercase;color:rgba(255,255,255,0.55);
                    font-family:'DM Sans',sans-serif;
                ">\u{1F4CB} Missoes</span>
                <span class="missions-progress-text" style="
                    font-size:0.68rem;font-weight:800;color:${countColor};
                    font-family:'Syne',sans-serif;
                ">${doneCount}/${total}</span>
            </div>

            <div style="height:4px;background:rgba(255,255,255,0.12);border-radius:99px;overflow:hidden;margin-bottom:0.4rem;">
                <div class="missions-progress-bar" style="height:100%;width:${pct}%;
                    background:${barColor};
                    border-radius:99px;transition:width 0.4s ease;"></div>
            </div>

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

    getPendingCount() {
        const data = this.load();
        const today = this._getToday();
        if (!data.missions || data.date !== today) {
            return this.getDailyMissions().filter(m => !m.completed).length;
        }
        return (data.missions || []).filter(m => !m.completed).length;
    },

    _refreshBadge() {
        const pending = this.getPendingCount();
        const badge   = document.getElementById('missions-nav-badge');
        if (badge) {
            badge.style.display = pending > 0 ? 'flex' : 'none';
            badge.textContent   = pending;
        }
        const widget = document.getElementById('missions-sidebar-widget');
        if (widget) {
            const missions  = this.getDailyMissions();
            const doneCount = missions.filter(m => m.completed).length;
            const total     = missions.length;
            const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;
            const progBar   = widget.querySelector('.missions-progress-bar');
            const progText  = widget.querySelector('.missions-progress-text');
            if (progBar)  progBar.style.width  = pct + '%';
            if (progText) progText.textContent  = doneCount + '/' + total;
        }
    },

    init() {
        this.getDailyMissions();
        this.getWeeklyChallenge();
    },
};

if (!Missions.__nyanWorldsExtended) {
    Missions.__nyanWorldsExtended = true;

    const has = (id) => Missions.POOL.some((m) => m.id === id);
    const hasWeekly = (id) => Missions.WEEKLY_POOL.some((m) => m.id === id);

    if (!has('create_task_once')) {
        Missions.POOL.push({
            id: 'create_task_once',
            diff: 'easy',
            icon: '\u{1F4DD}',
            title: 'Primeiro passo',
            desc: 'Crie uma tarefa no app',
            check: (ctx) => ctx.event === 'task_created',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('convert_note_task')) {
        Missions.POOL.push({
            id: 'convert_note_task',
            diff: 'medium',
            icon: '\u{1F517}',
            title: 'Fluxo conectado',
            desc: 'Converta uma nota em tarefa',
            check: (ctx) => ctx.event === 'note_to_task',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('complete_3_tasks')) {
        Missions.POOL.push({
            id: 'complete_3_tasks',
            diff: 'medium',
            icon: '\u2705',
            title: 'Ritmo produtivo',
            desc: 'Conclua 3 tarefas no dia',
            check: (ctx) => ctx.event === 'task_completed',
            progress: (state) => ({ current: state.plays || 0, max: 3 }),
            counter: true,
        });
    }

    if (!has('tool_session_5')) {
        Missions.POOL.push({
            id: 'tool_session_5',
            diff: 'hard',
            icon: '\u{1F9E9}',
            title: 'Mundo conectado',
            desc: 'Acione 5 ciclos de uso de ferramenta',
            check: (ctx) => ctx.event === 'tool_session',
            progress: (state) => ({ current: state.plays || 0, max: 5 }),
            counter: true,
        });
    }

    if (!has('send_3_messages')) {
        Missions.POOL.push({
            id: 'send_3_messages',
            diff: 'easy',
            icon: '\u{1F4AC}',
            title: 'Papo em dia',
            desc: 'Mande 3 mensagens no chat',
            check: (ctx) => ctx.event === 'chat_message_sent',
            progress: (state) => ({ current: state.messagesSent || 0, max: 3 }),
            counter: true,
        });
    }

    if (!has('react_feed')) {
        Missions.POOL.push({
            id: 'react_feed',
            diff: 'easy',
            icon: '\u{1F44D}',
            title: 'Reacao rapida',
            desc: 'Reaja a 2 posts do feed',
            check: (ctx) => ctx.event === 'feed_reaction',
            progress: (state) => ({ current: state.reactions || 0, max: 2 }),
            counter: true,
        });
    }

    if (!has('open_chat_once')) {
        Missions.POOL.push({
            id: 'open_chat_once',
            diff: 'easy',
            icon: '\u{1F517}',
            title: 'Conexao social',
            desc: 'Abra o chat uma vez',
            check: (ctx) => ctx.event === 'open_tool' && ctx.tool === 'chat',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('visit_feed_once')) {
        Missions.POOL.push({
            id: 'visit_feed_once',
            diff: 'easy',
            icon: '\u{1F4F0}',
            title: 'No ritmo do feed',
            desc: 'Abra o feed uma vez',
            check: (ctx) => ctx.event === 'open_tool' && ctx.tool === 'feed',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('comment_feed_once')) {
        Missions.POOL.push({
            id: 'comment_feed_once',
            diff: 'medium',
            icon: '\u{1F4AD}',
            title: 'Comentador',
            desc: 'Faca 1 comentario no feed',
            check: (ctx) => ctx.event === 'feed_comment',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('challenge_friend')) {
        Missions.POOL.push({
            id: 'challenge_friend',
            diff: 'medium',
            icon: '\u2694\uFE0F',
            title: 'Desafio lancado',
            desc: 'Desafie um amigo',
            check: (ctx) => ctx.event === 'challenge_created',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('share_score')) {
        Missions.POOL.push({
            id: 'share_score',
            diff: 'medium',
            icon: '\u{1F4E4}',
            title: 'Compartilhando vitoria',
            desc: 'Compartilhe um score no feed',
            check: (ctx) => ctx.event === 'feed_share_score',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('complete_challenge')) {
        Missions.POOL.push({
            id: 'complete_challenge',
            diff: 'hard',
            icon: '\u{1F3C1}',
            title: 'Duelo concluido',
            desc: 'Venca um desafio',
            check: (ctx) => ctx.event === 'challenge_completed_win',
            progress: () => ({ current: 0, max: 1 }),
        });
    }

    if (!has('social_combo_5')) {
        Missions.POOL.push({
            id: 'social_combo_5',
            diff: 'hard',
            icon: '\u{1F310}',
            title: 'Rede viva',
            desc: 'Complete 5 acoes sociais no dia',
            check: (ctx) => ['chat_message_sent', 'feed_reaction', 'feed_comment', 'challenge_created', 'feed_share_score'].includes(ctx.event),
            progress: (state) => ({ current: state.reactions || 0, max: 5 }),
            counter: true,
        });
    }

    if (!hasWeekly('weekly_productive_chain')) {
        Missions.WEEKLY_POOL.push({
            id: 'weekly_productive_chain',
            icon: '\u{1F4C8}',
            title: 'Cadeia produtiva',
            desc: 'Conclua 12 acoes produtivas na semana',
            check: (ctx) => ['task_created', 'task_completed', 'note_to_task', 'note_created'].includes(ctx.event),
            progress: () => ({ current: 0, max: 12 }),
            counter: true,
        });
    }
}

window.Missions = Missions;

(function finalizeMissionsV310() {
    if (!window.Missions || Missions.__v310Finalized) return;
    Missions.__v310Finalized = true;

    const __origCompleteMission = Missions._completeMission?.bind(Missions);
    Missions._completeMission = function(mission) {
        __origCompleteMission?.(mission);
        try {
            window.ProfileV2?.recordActivity?.('mission_done', {
                id: mission?.id,
                title: mission?.title || 'Missao',
                diff: mission?.diff || 'easy',
            });
        } catch (_) {}
        try {
            window.dispatchEvent(new CustomEvent('nyan:connected-action', {
                detail: {
                    event: 'mission_done',
                    payload: {
                        id: mission?.id,
                        title: mission?.title || 'Missao',
                        diff: mission?.diff || 'easy',
                    },
                    at: Date.now(),
                }
            }));
        } catch (_) {}
    };

    const __origCompleteWeekly = Missions._completeWeekly?.bind(Missions);
    Missions._completeWeekly = function(weekly) {
        __origCompleteWeekly?.(weekly);
        try {
            window.ProfileV2?.recordActivity?.('weekly_done', {
                id: weekly?.id,
                title: weekly?.title || 'Desafio semanal',
            });
        } catch (_) {}
        try {
            window.dispatchEvent(new CustomEvent('nyan:connected-action', {
                detail: {
                    event: 'weekly_done',
                    payload: {
                        id: weekly?.id,
                        title: weekly?.title || 'Desafio semanal',
                    },
                    at: Date.now(),
                }
            }));
        } catch (_) {}
    };
})();


