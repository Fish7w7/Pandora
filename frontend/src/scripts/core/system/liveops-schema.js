const NyanLiveOps = {
    VERSION: 2,
    KEY: 'nyan_liveops_state_v315',
    MAX_HISTORY: 160,
    MAX_LOCKS_PER_MISSION: 120,

    EVENT_TYPES: Object.freeze(['daily', 'weekly', 'seasonal', 'special']),
    MISSION_TYPES: Object.freeze(['game', 'quiz', 'clan', 'social', 'economy']),

    _initialized: false,
    _tickTimer: null,
    _clanListeners: [],

    _now() {
        return Date.now();
    },

    _dayKey(now = this._now()) {
        const d = new Date(now);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },

    _defaultEvents() {
        const activeStart = Date.parse('2026-04-28T00:00:00-03:00');
        const activeEnd = Date.parse('2026-05-12T23:59:59-03:00');
        const nextStart = Date.parse('2026-05-13T00:00:00-03:00');
        const nextEnd = Date.parse('2026-05-20T23:59:59-03:00');

        return [
            {
                id: 'event_liveops_315',
                name: 'Eventos & Live Ops',
                description: 'Missoes temporarias, recompensas sazonais e bonus para Clas durante a v3.15.0.',
                type: 'seasonal',
                startAt: activeStart,
                endAt: activeEnd,
                missions: [
                    {
                        id: 'evt315_play_5',
                        title: 'Rodada de aquecimento',
                        description: 'Jogue 5 partidas em qualquer jogo da Zona Offline.',
                        type: 'game',
                        target: 5,
                        trackEvents: ['play_game', 'typeracer_finish', 'flappy_finish', 'score_2048', 'forca_win', 'termo_win'],
                        reward: { chips: 120, xp: 80 },
                    },
                    {
                        id: 'evt315_quiz_3',
                        title: 'Quiz em serie',
                        description: 'Complete o quiz diario 3 vezes durante o evento.',
                        type: 'quiz',
                        target: 3,
                        trackEvents: ['quiz_finish'],
                        reward: { chips: 110, xp: 90 },
                    },
                    {
                        id: 'evt315_join_clan',
                        title: 'Entrar no movimento',
                        description: 'Participe de um Cla durante o evento.',
                        type: 'clan',
                        target: 1,
                        trackEvents: ['clan_join', 'clan_present'],
                        reward: { chips: 75, xp: 60 },
                        dedupe: true,
                    },
                    {
                        id: 'evt315_clan_goal',
                        title: 'Meta coletiva',
                        description: 'Conclua uma meta de Cla.',
                        type: 'clan',
                        target: 1,
                        trackEvents: ['clan_goal_completed'],
                        reward: { chips: 160, xp: 120, badgeId: 'badge_clan_ops_315' },
                        dedupe: true,
                    },
                    {
                        id: 'evt315_clan_chat',
                        title: 'Sala movimentada',
                        description: 'Envie 3 mensagens no chat do Cla.',
                        type: 'social',
                        target: 3,
                        trackEvents: ['clan_chat_message'],
                        reward: { chips: 70, xp: 45 },
                        dedupe: true,
                    },
                    {
                        id: 'evt315_challenge_win',
                        title: 'Vitoria de evento',
                        description: 'Venca um desafio de Cla durante o evento.',
                        type: 'clan',
                        target: 1,
                        trackEvents: ['clan_challenge_won'],
                        reward: { chips: 220, xp: 160, badgeId: 'badge_liveops_315' },
                        dedupe: true,
                    },
                ],
                rewards: [
                    { id: 'evt315_reward_chips', label: 'Chips e XP por missao' },
                    { id: 'evt315_reward_badges', label: 'Badges exclusivas de evento' },
                    { id: 'evt315_reward_cosmetics', label: 'Cosmeticos temporarios na loja' },
                ],
                eventShop: [
                    {
                        id: 'evt315_shop_title',
                        eventId: 'event_liveops_315',
                        itemId: 'title_liveops_315',
                        name: 'Operador Live Ops',
                        price: 700,
                        limited: true,
                    },
                    {
                        id: 'evt315_shop_border',
                        eventId: 'event_liveops_315',
                        itemId: 'border_liveops_315',
                        name: 'Borda Operacao',
                        price: 950,
                        limited: true,
                    },
                    {
                        id: 'evt315_shop_particle',
                        eventId: 'event_liveops_315',
                        itemId: 'particle_liveops_315',
                        name: 'Pulso de Evento',
                        price: 650,
                        limited: true,
                    },
                ],
                clanBonusMultiplier: 1.25,
                createdAt: activeStart,
                updatedAt: activeStart,
            },
            {
                id: 'event_clan_sprint_315',
                name: 'Sprint dos Clas',
                description: 'Proxima rodada focada em metas, desafios e ranking de Clas.',
                type: 'weekly',
                startAt: nextStart,
                endAt: nextEnd,
                missions: [
                    {
                        id: 'evt315_sprint_goal',
                        title: 'Preparar o sprint',
                        description: 'Conclua uma meta de Cla durante o sprint.',
                        type: 'clan',
                        target: 1,
                        trackEvents: ['clan_goal_completed'],
                        reward: { chips: 120, xp: 80 },
                        dedupe: true,
                    },
                ],
                rewards: [{ id: 'evt315_sprint_rewards', label: 'Bonus de ranking de Cla' }],
                eventShop: [],
                clanBonusMultiplier: 1.15,
                createdAt: nextStart,
                updatedAt: nextStart,
            },
            {
                id: 'v310_patch_day',
                name: 'Patch Day v3.10',
                description: 'Evento legado de lancamento da linha conectada v3.10.',
                type: 'special',
                startAt: Date.parse('2026-03-20T00:00:00-03:00'),
                endAt: Date.parse('2026-03-27T23:59:59-03:00'),
                missions: [],
                rewards: [{ id: 'patch_day_bundle', label: 'Bundle Patch Day' }],
                eventShop: [],
                createdAt: Date.parse('2026-03-20T00:00:00-03:00'),
                updatedAt: Date.parse('2026-03-27T23:59:59-03:00'),
            },
        ];
    },

    _defaults() {
        return {
            version: this.VERSION,
            events: [],
            progress: {},
            locks: {},
            claimed: {},
            purchases: {},
            rewardHistory: [],
            notices: {},
            updatedAt: this._now(),
        };
    },

    init() {
        if (this._initialized) return;
        this._initialized = true;
        window.NyanStorage?.register?.(this.KEY, {
            owner: 'LiveOps',
            source: window.NyanStorage?.SOURCES?.LIVEOPS || 'LiveOps',
            critical: true,
        });
        this.save(this.load());
        this.registerClanIntegration();
        this.checkNotifications();
        if (window.Squads?.getCurrentSquadSync?.()?.id) {
            this.track({ event: 'clan_present', key: `clan-present:${this._dayKey()}` });
        }
        this._startTicker();
    },

    cleanup() {
        if (this._tickTimer) {
            clearInterval(this._tickTimer);
            this._tickTimer = null;
        }
        this._clanListeners.forEach((off) => {
            try { off?.(); } catch (_) {}
        });
        this._clanListeners = [];
        this._initialized = false;
    },

    _startTicker() {
        if (this._tickTimer) clearInterval(this._tickTimer);
        this._tickTimer = setInterval(() => this.checkNotifications(), 60 * 1000);
        window.NyanLifecycle?.trackCleanup?.('global', () => clearInterval(this._tickTimer));
    },

    load() {
        const saved = window.NyanStorage?.get
            ? window.NyanStorage.get(this.KEY, null)
            : window.Utils?.loadData?.(this.KEY);
        const data = saved && typeof saved === 'object' ? saved : this._defaults();
        const normalized = {
            ...this._defaults(),
            ...data,
            progress: data.progress && typeof data.progress === 'object' ? data.progress : {},
            locks: data.locks && typeof data.locks === 'object' ? data.locks : {},
            claimed: data.claimed && typeof data.claimed === 'object' ? data.claimed : {},
            purchases: data.purchases && typeof data.purchases === 'object' ? data.purchases : {},
            rewardHistory: Array.isArray(data.rewardHistory) ? data.rewardHistory.slice(0, this.MAX_HISTORY) : [],
            notices: data.notices && typeof data.notices === 'object' ? data.notices : {},
        };
        return normalized;
    },

    save(data) {
        const normalized = {
            ...this._defaults(),
            ...(data || {}),
            version: this.VERSION,
            updatedAt: this._now(),
        };
        if (window.NyanStorage?.set) return window.NyanStorage.set(this.KEY, normalized);
        window.Utils?.saveData?.(this.KEY, normalized);
        return true;
    },

    _toTimestamp(value, fallback = this._now()) {
        if (Number.isFinite(Number(value))) return Number(value);
        const parsed = Date.parse(value || '');
        return Number.isFinite(parsed) ? parsed : fallback;
    },

    normalizeMission(raw = {}, eventId = '') {
        const target = Math.max(1, Math.floor(Number(raw.target || raw.max || 1)));
        const state = this.load();
        const key = `${eventId}:${raw.id}`;
        const stored = state.progress[key] || {};
        const progress = Math.max(0, Math.min(target, Math.floor(Number(stored.progress || raw.progress || 0))));
        return {
            id: String(raw.id || '').trim(),
            eventId,
            title: String(raw.title || '').trim(),
            description: String(raw.description || raw.desc || '').trim(),
            type: this.MISSION_TYPES.includes(raw.type) ? raw.type : 'game',
            progress,
            target,
            completed: !!stored.completed || !!raw.completed || progress >= target,
            claimed: !!state.claimed[key] || !!raw.claimed,
            reward: raw.reward && typeof raw.reward === 'object' ? { ...raw.reward } : {},
            trackEvents: Array.isArray(raw.trackEvents) ? raw.trackEvents : [],
            dedupe: raw.dedupe === true,
        };
    },

    normalizeEvent(raw = {}, now = this._now()) {
        const startAt = this._toTimestamp(raw.startAt ?? raw.startsAt, now);
        const endAt = this._toTimestamp(raw.endAt ?? raw.endsAt, startAt + 24 * 60 * 60 * 1000);
        const id = String(raw.id || '').trim();
        const event = {
            id,
            name: String(raw.name || raw.title || '').trim(),
            description: String(raw.description || '').trim(),
            type: this.EVENT_TYPES.includes(raw.type) ? raw.type : 'special',
            startAt,
            endAt,
            active: now >= startAt && now <= endAt,
            missions: Array.isArray(raw.missions) ? raw.missions.map((mission) => this.normalizeMission(mission, id)).filter((m) => m.id) : [],
            rewards: Array.isArray(raw.rewards) ? raw.rewards : [],
            eventShop: Array.isArray(raw.eventShop) ? raw.eventShop.map((item) => ({
                id: String(item.id || '').trim(),
                eventId: String(item.eventId || id).trim(),
                itemId: String(item.itemId || '').trim(),
                name: String(item.name || '').trim(),
                price: Math.max(0, Math.floor(Number(item.price || 0))),
                limited: item.limited !== false,
                purchased: !!this.load().purchases[`${id}:${item.id}`],
            })).filter((item) => item.id) : [],
            clanBonusMultiplier: Math.max(1, Number(raw.clanBonusMultiplier || 1)),
            createdAt: this._toTimestamp(raw.createdAt, startAt),
            updatedAt: this._toTimestamp(raw.updatedAt, startAt),
        };
        return event;
    },

    getAllEvents(now = this._now()) {
        const state = this.load();
        const custom = Array.isArray(state.events) ? state.events : [];
        const byId = new Map();
        [...this._defaultEvents(), ...custom].forEach((event) => {
            const normalized = this.normalizeEvent(event, now);
            if (normalized.id) byId.set(normalized.id, normalized);
        });
        return [...byId.values()].sort((a, b) => Number(a.startAt || 0) - Number(b.startAt || 0));
    },

    getActiveEvents(now = this._now()) {
        return this.getAllEvents(now).filter((event) => event.active);
    },

    getCurrentEvent(now = this._now()) {
        return this.getActiveEvents(now)[0] || null;
    },

    getUpcomingEvents(now = this._now()) {
        return this.getAllEvents(now).filter((event) => event.startAt > now);
    },

    getEndedEvents(now = this._now()) {
        return this.getAllEvents(now).filter((event) => event.endAt < now).sort((a, b) => b.endAt - a.endAt);
    },

    isActive(event = {}, now = this._now()) {
        const normalized = event?.id ? this.normalizeEvent(event, now) : event;
        return !!normalized?.active;
    },

    getProgressSummary(event) {
        const missions = event?.missions || [];
        const total = missions.length;
        const completed = missions.filter((m) => m.completed).length;
        const claimed = missions.filter((m) => m.claimed).length;
        const progress = total ? Math.round((completed / total) * 100) : 0;
        return { total, completed, claimed, progress };
    },

    _missionMatches(mission, ctx = {}) {
        const eventName = String(ctx.event || '').trim();
        if (!eventName) return false;
        if (mission.trackEvents?.includes(eventName)) return true;
        if (mission.type === 'game' && ['play_game', 'typeracer_finish', 'flappy_finish', 'score_2048', 'forca_win', 'termo_win'].includes(eventName)) return true;
        if (mission.type === 'quiz' && eventName === 'quiz_finish') return true;
        return false;
    },

    _lockKey(mission, ctx = {}) {
        if (!mission.dedupe) return '';
        return String(
            ctx.key ||
            ctx.messageId ||
            ctx.goalId ||
            ctx.challengeId ||
            ctx.taskId ||
            ctx.noteId ||
            `${ctx.event || 'event'}:${this._dayKey()}`
        ).trim();
    },

    _isLocked(state, missionKey, lockKey) {
        if (!lockKey) return false;
        return !!state.locks?.[missionKey]?.[lockKey];
    },

    _markLocked(state, missionKey, lockKey) {
        if (!lockKey) return;
        const locks = state.locks[missionKey] && typeof state.locks[missionKey] === 'object'
            ? state.locks[missionKey]
            : {};
        locks[lockKey] = this._now();
        const trimmed = Object.entries(locks)
            .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
            .slice(0, this.MAX_LOCKS_PER_MISSION);
        state.locks[missionKey] = Object.fromEntries(trimmed);
    },

    track(ctx = {}) {
        const activeEvents = this.getActiveEvents();
        if (!activeEvents.length) return { changed: false };

        const state = this.load();
        let changed = false;
        const completedNow = [];

        activeEvents.forEach((event) => {
            event.missions.forEach((mission) => {
                if (!this._missionMatches(mission, ctx)) return;
                const missionKey = `${event.id}:${mission.id}`;
                const current = state.progress[missionKey] || {};
                if (current.completed || state.claimed[missionKey]) return;

                const lockKey = this._lockKey(mission, ctx);
                if (this._isLocked(state, missionKey, lockKey)) return;

                const amount = Math.max(1, Math.floor(Number(ctx.amount || 1)));
                const nextProgress = Math.min(mission.target, Math.max(0, Number(current.progress || mission.progress || 0)) + amount);
                const completed = nextProgress >= mission.target;
                state.progress[missionKey] = {
                    progress: nextProgress,
                    completed,
                    updatedAt: this._now(),
                };
                this._markLocked(state, missionKey, lockKey);
                changed = true;

                if (completed) {
                    completedNow.push({ event, mission: { ...mission, progress: nextProgress, completed: true } });
                    this._notifyOnce(`mission-complete:${missionKey}`, `Missao de evento concluida: ${mission.title}`, 'success', state);
                }
            });
        });

        if (changed) {
            this.save(state);
            window.dispatchEvent(new CustomEvent('nyan:liveops-updated', {
                detail: { ctx, completedNow, at: this._now() },
            }));
            if (window.Router?.currentRoute === 'events') {
                window.Events?.refresh?.();
            }
        }

        return { changed, completedNow };
    },

    canClaim(eventId, missionId) {
        const event = this.getAllEvents().find((item) => item.id === eventId);
        const mission = event?.missions?.find((item) => item.id === missionId);
        return !!(event && mission && mission.completed && !mission.claimed);
    },

    claimMissionReward(eventId, missionId) {
        if (!this.canClaim(eventId, missionId)) {
            return { ok: false, reason: 'Recompensa indisponivel ou ja resgatada.' };
        }
        const event = this.getAllEvents().find((item) => item.id === eventId);
        const mission = event.missions.find((item) => item.id === missionId);
        const key = `${eventId}:${missionId}`;
        const state = this.load();
        if (state.claimed[key]) return { ok: false, reason: 'Recompensa ja resgatada.' };

        const result = this._grantReward(mission.reward, {
            id: `mission:${key}`,
            eventId,
            missionId,
            label: mission.title,
        }, state);

        if (!result.ok) return result;

        state.claimed[key] = this._now();
        state.progress[key] = {
            ...(state.progress[key] || {}),
            progress: mission.target,
            completed: true,
            updatedAt: this._now(),
        };
        this._pushRewardHistory(state, {
            id: `mission:${key}`,
            eventId,
            missionId,
            source: 'mission',
            label: mission.title,
            reward: mission.reward,
        });
        this.save(state);
        this._notifyOnce(`mission-claimed:${key}`, `Recompensa resgatada: ${mission.title}`, 'success');
        this._postClanFeed(`Evento "${event.name}": ${mission.title} concluida.`);
        window.dispatchEvent(new CustomEvent('nyan:liveops-updated', { detail: { eventId, missionId, action: 'claim' } }));
        return { ok: true, reward: mission.reward };
    },

    _grantReward(reward = {}, meta = {}, state = this.load()) {
        const rewardKey = String(meta.id || '').trim();
        if (rewardKey && state.rewardHistory.some((item) => item.id === rewardKey)) {
            return { ok: false, reason: 'Recompensa ja registrada.' };
        }

        const chips = Math.max(0, Math.floor(Number(reward.chips || 0)));
        const xp = Math.max(0, Math.floor(Number(reward.xp || 0)));
        const itemId = String(reward.itemId || reward.titleId || '').trim();
        const badgeId = String(reward.badgeId || '').trim();

        if (chips > 0) window.Economy?.grantChips?.(chips);
        if (xp > 0) window.Economy?.grantXP?.(xp, { source: 'liveops', ...meta });
        if (itemId && !window.Inventory?.owns?.(itemId)) {
            window.Inventory?.unlockItem?.(itemId);
        }
        if (badgeId && !window.Badges?.owns?.(badgeId)) {
            window.Badges?.unlock?.(badgeId, { autoEquip: false });
        }

        return { ok: true };
    },

    _pushRewardHistory(state, item) {
        const id = String(item.id || '').trim();
        if (!id || state.rewardHistory.some((entry) => entry.id === id)) return;
        state.rewardHistory.unshift({
            ...item,
            at: this._now(),
        });
        state.rewardHistory = state.rewardHistory.slice(0, this.MAX_HISTORY);
    },

    purchaseShopItem(eventId, shopItemId) {
        const event = this.getAllEvents().find((item) => item.id === eventId);
        if (!event) return { ok: false, reason: 'Evento nao encontrado.' };
        if (!event.active) return { ok: false, reason: 'A loja deste evento esta encerrada.' };

        const item = event.eventShop.find((entry) => entry.id === shopItemId);
        if (!item) return { ok: false, reason: 'Item nao encontrado.' };

        const key = `${eventId}:${shopItemId}`;
        const state = this.load();
        if (item.limited && state.purchases[key]) {
            return { ok: false, reason: 'Item ja comprado neste evento.' };
        }
        if (item.itemId && window.Inventory?.owns?.(item.itemId)) {
            state.purchases[key] = state.purchases[key] || this._now();
            this.save(state);
            return { ok: false, reason: 'Voce ja possui este item.' };
        }

        const chips = window.Economy?.getChips?.() || 0;
        if (chips < item.price) return { ok: false, reason: `Chips insuficientes (${item.price}).` };
        if (!window.Economy?.spendChips?.(item.price)) {
            return { ok: false, reason: 'Nao foi possivel debitar chips.' };
        }

        if (item.itemId) window.Inventory?.unlockItem?.(item.itemId);
        state.purchases[key] = this._now();
        this._pushRewardHistory(state, {
            id: `shop:${key}`,
            eventId,
            source: 'shop',
            label: item.name,
            reward: { itemId: item.itemId, chipsSpent: item.price },
        });
        this.save(state);
        this.track({ event: 'event_shop_purchase', amount: 1, key });
        this._notifyOnce(`shop:${key}`, `Item de evento comprado: ${item.name}`, 'success');
        this._postClanFeed(`Item de evento comprado: ${item.name}.`);
        window.dispatchEvent(new CustomEvent('nyan:liveops-updated', { detail: { eventId, shopItemId, action: 'purchase' } }));
        return { ok: true, item };
    },

    getRewardHistory() {
        return this.load().rewardHistory || [];
    },

    checkNotifications() {
        const state = this.load();
        const now = this._now();
        let changed = false;
        this.getAllEvents(now).forEach((event) => {
            if (event.active) {
                changed = this._notifyOnce(`event-started:${event.id}`, `Evento ativo: ${event.name}`, 'info', state) || changed;
                const left = event.endAt - now;
                if (left > 0 && left <= 24 * 60 * 60 * 1000) {
                    changed = this._notifyOnce(`event-ending:${event.id}`, `Evento terminando: ${event.name}`, 'warning', state) || changed;
                }
            }
        });
        if (changed) this.save(state);
    },

    _notifyOnce(key, message, type = 'info', state = null) {
        const data = state || this.load();
        if (data.notices[key]) return false;
        data.notices[key] = this._now();
        window.Utils?.showNotification?.(message, type);
        if (!state) this.save(data);
        return true;
    },

    getClanPointBonus(input = {}) {
        const event = this.getCurrentEvent();
        const multiplier = Math.max(1, Number(event?.clanBonusMultiplier || 1));
        if (!event || multiplier <= 1) return { multiplier: 1, bonus: 0, event: null };
        const basePoints = Math.max(0, Math.floor(Number(input.points || 0)));
        const boosted = Math.max(basePoints, Math.round(basePoints * multiplier));
        return {
            multiplier,
            bonus: Math.max(0, boosted - basePoints),
            event,
        };
    },

    registerClanIntegration() {
        if (this._clanListeners.length) return;
        const bind = (type, handler) => {
            window.addEventListener(type, handler);
            this._clanListeners.push(() => window.removeEventListener(type, handler));
        };

        bind('nyan:squad:onSquadCreated', (event) => {
            this.track({ event: 'clan_join', key: `create:${event.detail?.squad?.id || this._dayKey()}` });
        });
        bind('nyan:squad:onMemberJoin', (event) => {
            const uid = window.NyanAuth?.getUID?.();
            if (!uid || event.detail?.userId !== uid) return;
            this.track({ event: 'clan_join', key: `join:${event.detail?.squad?.id || ''}:${uid}` });
        });
        bind('nyan:squad:onGoalCompleted', (event) => {
            const goal = event.detail?.goal || {};
            this.track({
                event: 'clan_goal_completed',
                goalId: goal.id,
                key: `goal:${goal.id || goal.description || this._now()}`,
            });
        });
        bind('nyan:squad:onChatMessage', (event) => {
            const uid = window.NyanAuth?.getUID?.();
            const message = event.detail?.message || {};
            if (!uid || message.userId !== uid) return;
            this.track({
                event: 'clan_chat_message',
                messageId: message.id,
                key: `msg:${message.id || this._now()}`,
            });
        });
        bind('nyan:squad:onChallengeEnded', (event) => {
            const currentId = window.Squads?.getCurrentSquadSync?.()?.id;
            const winnerId = event.detail?.winnerId || event.detail?.challenge?.winnerId;
            if (!currentId || winnerId !== currentId) return;
            this.track({
                event: 'clan_challenge_won',
                challengeId: event.detail?.challenge?.id,
                key: `challenge:${event.detail?.challenge?.id || this._now()}`,
            });
        });
    },

    _postClanFeed(content) {
        if (!content || !window.Squads?.addLiveOpsFeedEntry) return;
        window.Squads.addLiveOpsFeedEntry(content, { refId: 'liveops' }).catch(() => {});
    },
};

window.NyanLiveOps = NyanLiveOps;
