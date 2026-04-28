const Squads = {
    KEY: 'nyan.squads',
    COLLECTION: 'squads',
    CREATE_COST: 500,
    MAX_MEMBERS: 10,
    MAX_MESSAGES: 100,
    MAX_FEED_ITEMS: 100,
    MAX_MESSAGE_LENGTH: 500,
    MAX_SCORE_HISTORY: 250,
    MAX_GOALS: 8,
    MAX_TRANSACTIONS: 80,
    MAX_CHALLENGES: 40,
    CHALLENGE_DURATION_MS: 24 * 60 * 60 * 1000,
    CHALLENGE_REWARD: 150,
    INVITE_CODE_LENGTH: 6,

    _events: {},
    _state: null,
    _remoteHydratedAt: 0,
    _remoteBlocked: false,
    _lastUserSquadProfileSignature: '',
    _lastUserSquadProfileAt: 0,

    _defaults() {
        return {
            squads: {},
            currentSquadId: null,
            updatedAt: Date.now(),
        };
    },

    init() {
        if (this._initialized) return;
        this._initialized = true;
        this._state = this._load();
        this._remoteBlocked = false;
        if (window.NyanAuth?.isOnline?.() && window.NyanFirebase?.isReady?.()) {
            this.hydrateCurrentUser().catch(() => {});
        }

        window.addEventListener('nyan:online-ready', () => {
            this.hydrateCurrentUser().catch(() => {});
        });
    },

    on(eventName, handler) {
        if (!eventName || typeof handler !== 'function') return () => {};
        if (!this._events[eventName]) this._events[eventName] = new Set();
        this._events[eventName].add(handler);
        return () => this._events[eventName]?.delete(handler);
    },

    _emit(eventName, detail = {}) {
        const payload = { ...detail, at: Date.now() };
        (this._events[eventName] || []).forEach((handler) => {
            try { handler(payload); } catch (err) { console.warn('[Squads] hook erro:', err); }
        });
        window.dispatchEvent(new CustomEvent(`nyan:squad:${eventName}`, { detail: payload }));
    },

    _load() {
        const saved = window.Utils?.loadData?.(this.KEY);
        if (!saved || typeof saved !== 'object') return this._defaults();
        return {
            ...this._defaults(),
            ...saved,
            squads: saved.squads && typeof saved.squads === 'object' ? saved.squads : {},
        };
    },

    _save(state = this._state) {
        this._state = {
            ...this._defaults(),
            ...(state || {}),
            updatedAt: Date.now(),
        };
        window.Utils?.saveData?.(this.KEY, this._state);
        return this._state;
    },

    _uid() {
        return String(window.NyanAuth?.getUID?.() || window.Utils?.loadData?.('nyan_online_uid') || '').trim();
    },

    _isReady() {
        return !!(window.NyanAuth?.isOnline?.() && window.NyanFirebase?.isReady?.() && window.NyanFirebase?.fn);
    },

    _normalizeName(name = '') {
        return String(name || '').trim().replace(/\s+/g, ' ');
    },

    _normalizeTag(tag = '') {
        return String(tag || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    },

    _normalizeCode(code = '') {
        return String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    },

    _normalizeDescription(description = '') {
        return String(description || '').trim().replace(/\s+/g, ' ');
    },

    _normalizeImageUrl(imageUrl = '') {
        return String(imageUrl || '').trim();
    },

    _normalizeVisibility(visibility = 'public') {
        return visibility === 'private' ? 'private' : 'public';
    },

    _escapeKey(text = '') {
        return String(text || '').trim().toLowerCase();
    },

    _sortByCreatedAt(items = [], direction = 'asc') {
        const multiplier = direction === 'desc' ? -1 : 1;
        return [...items].sort((a, b) => (Number(a.createdAt || 0) - Number(b.createdAt || 0)) * multiplier);
    },

    _normalizeMessages(messages = []) {
        return this._sortByCreatedAt(Array.isArray(messages) ? messages : [])
            .map((message) => ({
                id: String(message?.id || window.Utils?.generateId?.() || `${Date.now()}`),
                userId: String(message?.userId || '').trim(),
                content: String(message?.content || '').trim().slice(0, this.MAX_MESSAGE_LENGTH),
                createdAt: Number(message?.createdAt || Date.now()),
            }))
            .filter((message) => !!message.userId && !!message.content)
            .slice(-this.MAX_MESSAGES);
    },

    _normalizeFeed(feed = []) {
        return this._sortByCreatedAt(Array.isArray(feed) ? feed : [], 'desc')
            .map((item) => ({
                id: String(item?.id || window.Utils?.generateId?.() || `${Date.now()}`),
                type: item?.type === 'event' ? 'event' : 'system',
                content: String(item?.content || '').trim().slice(0, 220),
                actorUserId: String(item?.actorUserId || '').trim(),
                actorLabel: String(item?.actorLabel || '').trim().slice(0, 80),
                action: String(item?.action || '').trim().slice(0, 80),
                refId: String(item?.refId || '').trim(),
                createdAt: Number(item?.createdAt || Date.now()),
            }))
            .filter((item) => !!item.content)
            .slice(0, this.MAX_FEED_ITEMS);
    },

    _normalizeScoreHistory(history = []) {
        return this._sortByCreatedAt(Array.isArray(history) ? history : [], 'desc')
            .map((item) => ({
                id: String(item?.id || window.Utils?.generateId?.() || `${Date.now()}`),
                userId: String(item?.userId || '').trim(),
                source: ['game', 'record', 'daily_quiz', 'daily_mission'].includes(item?.source) ? item.source : 'game',
                points: Math.max(0, Math.floor(Number(item?.points || 0))),
                key: String(item?.key || '').trim(),
                createdAt: Number(item?.createdAt || Date.now()),
            }))
            .filter((item) => !!item.userId && item.points > 0)
            .slice(0, this.MAX_SCORE_HISTORY);
    },

    _normalizeGoals(goals = []) {
        return this._sortByCreatedAt(Array.isArray(goals) ? goals : [], 'asc')
            .map((goal) => {
                const target = Math.max(1, Math.floor(Number(goal?.target || 1)));
                const progress = Math.max(0, Math.min(target, Math.floor(Number(goal?.progress || 0))));
                return {
                    id: String(goal?.id || this._makeEntryId('goal')),
                    description: String(goal?.description || '').trim().slice(0, 120),
                    progress,
                    target,
                    reward: Math.max(0, Math.floor(Number(goal?.reward || 0))),
                    type: goal?.type === 'weekly' ? 'weekly' : 'daily',
                    completed: !!goal?.completed || progress >= target,
                    createdAt: Number(goal?.createdAt || Date.now()),
                    metric: ['points', 'games', 'quizzes', 'ranking'].includes(goal?.metric) ? goal.metric : 'points',
                    periodKey: String(goal?.periodKey || '').trim(),
                    rewardClaimedAt: Number(goal?.rewardClaimedAt || 0),
                };
            })
            .filter((goal) => !!goal.description)
            .slice(0, this.MAX_GOALS);
    },

    _normalizeTransactions(transactions = []) {
        return this._sortByCreatedAt(Array.isArray(transactions) ? transactions : [], 'desc')
            .map((tx) => ({
                id: String(tx?.id || this._makeEntryId('tx')),
                type: tx?.type === 'expense' ? 'expense' : 'reward',
                amount: Math.max(0, Math.floor(Number(tx?.amount || 0))),
                createdAt: Number(tx?.createdAt || Date.now()),
                description: String(tx?.description || '').trim().slice(0, 120),
                refId: String(tx?.refId || '').trim(),
            }))
            .filter((tx) => tx.amount > 0)
            .slice(0, this.MAX_TRANSACTIONS);
    },

    _normalizeChallenges(challenges = []) {
        return this._sortByCreatedAt(Array.isArray(challenges) ? challenges : [], 'desc')
            .map((challenge) => ({
                id: String(challenge?.id || this._makeEntryId('challenge')),
                squadA: String(challenge?.squadA || '').trim(),
                squadB: String(challenge?.squadB || '').trim(),
                scoreA: Math.max(0, Math.floor(Number(challenge?.scoreA || 0))),
                scoreB: Math.max(0, Math.floor(Number(challenge?.scoreB || 0))),
                status: challenge?.status === 'finished' ? 'finished' : 'active',
                createdAt: Number(challenge?.createdAt || Date.now()),
                endsAt: Number(challenge?.endsAt || Date.now() + this.CHALLENGE_DURATION_MS),
                winnerId: String(challenge?.winnerId || '').trim(),
                reward: Math.max(0, Math.floor(Number(challenge?.reward || this.CHALLENGE_REWARD))),
            }))
            .filter((challenge) => !!challenge.squadA && !!challenge.squadB && challenge.squadA !== challenge.squadB)
            .slice(0, this.MAX_CHALLENGES);
    },

    _mergeChallengeCopies(challenges = []) {
        const merged = new Map();
        this._normalizeChallenges(challenges).forEach((challenge) => {
            const current = merged.get(challenge.id);
            if (!current) {
                merged.set(challenge.id, challenge);
                return;
            }

            merged.set(challenge.id, {
                ...current,
                ...challenge,
                scoreA: Math.max(Number(current.scoreA || 0), Number(challenge.scoreA || 0)),
                scoreB: Math.max(Number(current.scoreB || 0), Number(challenge.scoreB || 0)),
                status: current.status === 'finished' || challenge.status === 'finished' ? 'finished' : 'active',
                createdAt: Math.min(Number(current.createdAt || Date.now()), Number(challenge.createdAt || Date.now())),
                endsAt: Math.min(Number(current.endsAt || Date.now()), Number(challenge.endsAt || Date.now())),
                winnerId: current.winnerId || challenge.winnerId || '',
                reward: Math.max(Number(current.reward || 0), Number(challenge.reward || 0), this.CHALLENGE_REWARD),
            });
        });
        return this._normalizeChallenges([...merged.values()]);
    },

    _makeFinishedChallenge(challenge, now = Date.now()) {
        const normalized = this._normalizeChallenges([challenge])[0];
        if (!normalized) return null;
        const winnerId = normalized.scoreA === normalized.scoreB
            ? ''
            : (normalized.scoreA > normalized.scoreB ? normalized.squadA : normalized.squadB);
        return {
            ...normalized,
            status: 'finished',
            winnerId,
            endsAt: Math.min(Number(normalized.endsAt || now), now),
        };
    },

    _collectChallengesForSquad(squadId = '', squads = []) {
        const safeId = String(squadId || '').trim();
        if (!safeId) return [];
        const challenges = [];
        const now = Date.now();
        (Array.isArray(squads) ? squads : []).forEach((squad) => {
            this._normalizeChallenges(squad?.challenges || [])
                .filter((challenge) => challenge.squadA === safeId || challenge.squadB === safeId)
                .forEach((challenge) => {
                    if (challenge.status === 'active' && challenge.endsAt <= now) {
                        const finished = this._makeFinishedChallenge(challenge, now);
                        if (finished) challenges.push(finished);
                        return;
                    }
                    challenges.push(challenge);
                });
        });
        return this._mergeChallengeCopies(challenges);
    },

    _makeEntryId(prefix = 'squad') {
        return window.Utils?.generateUUID?.()
            || window.Utils?.generateId?.()
            || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    },

    _formatActor(userId = '') {
        const uid = String(userId || '').trim();
        if (!uid) return 'Alguem';
        if (uid === this._uid()) {
            return window.NyanAuth?.getNyanTag?.() || window.NyanAuth?.currentUser?.username || 'Voce';
        }
        return uid.slice(0, 8);
    },

    _feedEntry(content, type = 'system', createdAt = Date.now(), meta = {}) {
        return {
            id: this._makeEntryId('feed'),
            type: type === 'event' ? 'event' : 'system',
            content: String(content || '').trim(),
            actorUserId: String(meta.actorUserId || '').trim(),
            actorLabel: String(meta.actorLabel || '').trim().slice(0, 80),
            action: String(meta.action || '').trim().slice(0, 80),
            refId: String(meta.refId || '').trim(),
            createdAt,
        };
    },

    _withFeedEntry(squad, content, type = 'system', at = Date.now(), meta = {}) {
        if (!content) return this._normalizeSquad(squad);
        return this._normalizeSquad({
            ...squad,
            feed: [this._feedEntry(content, type, at, meta), ...(squad.feed || [])],
            lastActivityAt: at,
            updatedAt: at,
        });
    },

    _isMember(squad, uid = this._uid()) {
        const safeUid = String(uid || '').trim();
        return !!safeUid && !!squad?.members?.some((member) => member.userId === safeUid);
    },

    _isSquadManager(squad, uid = this._uid()) {
        const safeUid = String(uid || '').trim();
        if (!safeUid || !squad?.id) return false;
        if (String(squad.ownerId || '').trim() === safeUid) return true;
        return !!squad.members?.some((member) => member.userId === safeUid && member.role === 'leader');
    },

    _requireMember(squad) {
        if (!squad || !this._isMember(squad)) {
            throw new Error('Apenas membros do Cla podem acessar esse espaco.');
        }
    },

    _normalizeSquad(raw = {}) {
        const now = Date.now();
        const members = Array.isArray(raw.members) ? raw.members : [];
        const normalizedMembers = members
            .map((member) => ({
                userId: String(member?.userId || '').trim(),
                role: member?.role === 'leader' ? 'leader' : 'member',
                joinedAt: Number(member?.joinedAt || now),
            }))
            .filter((member) => !!member.userId);
        const memberIdSource = normalizedMembers.length
            ? normalizedMembers.map((member) => member.userId)
            : (Array.isArray(raw.memberIds) ? raw.memberIds : []);
        const memberIds = Array.from(new Set(
            memberIdSource.map((userId) => String(userId || '').trim()).filter(Boolean)
        ));

        return {
            id: String(raw.id || window.Utils?.generateId?.() || `${now}`),
            name: this._normalizeName(raw.name),
            tag: this._normalizeTag(raw.tag),
            description: this._normalizeDescription(raw.description),
            imageUrl: this._normalizeImageUrl(raw.imageUrl),
            visibility: this._normalizeVisibility(raw.visibility),
            ownerId: String(raw.ownerId || ''),
            balance: Math.max(0, Number(raw.balance || 0)),
            inviteCode: this._normalizeCode(raw.inviteCode),
            memberIds,
            members: normalizedMembers,
            messages: this._normalizeMessages(raw.messages),
            feed: this._normalizeFeed(raw.feed),
            score: Math.max(0, Math.floor(Number(raw.score || 0))),
            scoreHistory: this._normalizeScoreHistory(raw.scoreHistory),
            goals: this._normalizeGoals(raw.goals),
            transactions: this._normalizeTransactions(raw.transactions),
            challenges: this._normalizeChallenges(raw.challenges),
            lastActivityAt: Number(raw.lastActivityAt || raw.updatedAt || raw.createdAt || now),
            createdAt: Number(raw.createdAt || now),
            updatedAt: Number(raw.updatedAt || now),
        };
    },

    _cacheSquad(squad, makeCurrent = false) {
        const state = this._load();
        const normalized = this._normalizeSquad(squad);
        state.squads[normalized.id] = normalized;
        if (makeCurrent) state.currentSquadId = normalized.id;
        this._save(state);
        return normalized;
    },

    _clearCurrentSquad(squadId = null) {
        const state = this._load();
        if (squadId && state.squads?.[squadId]) delete state.squads[squadId];
        if (!squadId || state.currentSquadId === squadId) state.currentSquadId = null;
        this._save(state);
    },

    _requireOnline() {
        if (!this._isReady()) {
            throw new Error('Conecte sua conta online para usar Clãs.');
        }
    },

    _isPermissionError(err) {
        const text = String(err?.code || err?.message || err || '').toLowerCase();
        return text.includes('permission') || text.includes('insufficient') || text.includes('missing');
    },

    _markRemoteBlocked(err) {
        if (!this._isPermissionError(err)) return false;
        this._remoteBlocked = true;
        console.warn('[Squads] Banco online sem permissao para colecao remota.', err);
        return true;
    },

    async _ensureRemoteSquad(squad) {
        if (!squad || !this._isReady()) return false;
        const normalized = this._normalizeSquad(squad);

        try {
            const existing = await window.NyanFirebase.getDoc(`${this.COLLECTION}/${normalized.id}`);
            if (existing?.id) {
                this._remoteBlocked = false;
                return true;
            }

            const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${normalized.id}`, normalized, false);
            if (saved) {
                this._remoteBlocked = false;
                return true;
            }
        } catch (err) {
            this._markRemoteBlocked(err);
        }

        return false;
    },

    _validateName(name) {
        const safe = this._normalizeName(name);
        if (!safe) throw new Error('Nome do Clã e obrigatorio.');
        if (safe.length < 3) throw new Error('Nome do Clã deve ter pelo menos 3 caracteres.');
        if (safe.length > 28) throw new Error('Nome do Clã deve ter no maximo 28 caracteres.');
        return safe;
    },

    _validateTag(tag) {
        const safe = this._normalizeTag(tag);
        if (!safe) throw new Error('Tag do Clã e obrigatoria.');
        if (safe.length < 2 || safe.length > 5) {
            throw new Error('Tag deve ter de 2 a 5 caracteres.');
        }
        return safe;
    },

    _validateCode(code) {
        const safe = this._normalizeCode(code);
        if (safe.length !== this.INVITE_CODE_LENGTH) {
            throw new Error(`Codigo deve ter ${this.INVITE_CODE_LENGTH} caracteres.`);
        }
        return safe;
    },

    _validateDescription(description = '') {
        const safe = this._normalizeDescription(description);
        if (safe.length > 180) throw new Error('Descricao do Clã deve ter no maximo 180 caracteres.');
        return safe;
    },

    _validateImageUrl(imageUrl = '') {
        const safe = this._normalizeImageUrl(imageUrl);
        if (safe.length > 900000) throw new Error('Imagem do Cla muito grande.');
        if (safe && !/^(https?:\/\/|data:image\/)/i.test(safe)) {
            throw new Error('Imagem do Cla precisa ser uma imagem valida.');
        }
        return safe;
    },

    _validateVisibility(visibility = 'public') {
        return this._normalizeVisibility(visibility);
    },

    async _getAllRemoteSquads() {
        this._requireOnline();
        const { collection, getDocs } = window.NyanFirebase.fn;
        try {
            const snap = await getDocs(collection(window.NyanFirebase.db, this.COLLECTION));
            this._remoteBlocked = false;
            return snap.docs.map((doc) => this._normalizeSquad({ id: doc.id, ...doc.data() }));
        } catch (err) {
            this._markRemoteBlocked(err);
            throw err;
        }
    },

    async _findRemoteBy(predicate) {
        const squads = await this._getAllRemoteSquads();
        return squads.find(predicate) || null;
    },

    async _findRemoteByUser(uid) {
        const safeUID = String(uid || '').trim();
        if (!safeUID) return null;
        return await this._findRemoteBy((squad) =>
            squad.members.some((member) => member.userId === safeUID)
        );
    },

    async _findAllRemoteByUser(uid) {
        const safeUID = String(uid || '').trim();
        if (!safeUID) return [];
        const squads = await this._getAllRemoteSquads();
        return squads.filter((squad) =>
            squad.members.some((member) => member.userId === safeUID)
        );
    },

    async _findRemoteByInviteCode(code) {
        const safeCode = this._normalizeCode(code);
        return await this._findRemoteBy((squad) => squad.inviteCode === safeCode);
    },

    async _assertUniqueNameTag(name, tag) {
        const nameKey = this._escapeKey(name);
        const tagKey = this._escapeKey(tag);
        const duplicate = await this._findRemoteBy((squad) =>
            this._escapeKey(squad.name) === nameKey || this._escapeKey(squad.tag) === tagKey
        );
        if (!duplicate) return;
        if (this._escapeKey(duplicate.name) === nameKey) throw new Error('Ja existe um Clã com esse nome.');
        throw new Error('Ja existe um Clã com essa tag.');
    },

    async _generateInviteCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (let attempt = 0; attempt < 24; attempt++) {
            let code = '';
            for (let i = 0; i < this.INVITE_CODE_LENGTH; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            const exists = await this._findRemoteByInviteCode(code);
            if (!exists) return code;
        }
        throw new Error('Nao foi possivel gerar um codigo unico. Tente novamente.');
    },

    async hydrateCurrentUser() {
        const uid = this._uid();
        if (!uid || !this._isReady()) return this.getCurrentSquadSync();

        const squad = await this._findRemoteByUser(uid);
        this._remoteHydratedAt = Date.now();

        if (!squad) {
            this._clearCurrentSquad();
            await this._updateUserSquadProfile(null).catch(() => {});
            return null;
        }

        this._cacheSquad(squad, true);
        await this._updateUserSquadProfile(squad).catch(() => {});
        return squad;
    },

    getCurrentSquadSync() {
        const state = this._load();
        const squad = state.currentSquadId ? state.squads[state.currentSquadId] : null;
        if (!squad) return null;
        const uid = this._uid();
        if (uid && !squad.members?.some((member) => member.userId === uid)) return null;
        return this._normalizeSquad(squad);
    },

    async getCurrentSquad(options = {}) {
        const cached = this.getCurrentSquadSync();
        const shouldHydrate = options.force === true || (Date.now() - this._remoteHydratedAt) > 30000;
        if (!shouldHydrate || !this._isReady()) return cached;
        return await this.hydrateCurrentUser();
    },

    async getSquadForUser(uid) {
        if (!uid) return null;
        if (this._isReady()) {
            const squad = await this._findRemoteByUser(uid);
            return squad ? this._normalizeSquad(squad) : null;
        }

        const state = this._load();
        return Object.values(state.squads || {}).find((squad) =>
            squad.members?.some((member) => member.userId === uid)
        ) || null;
    },

    async listPublicSquads(options = {}) {
        this._requireOnline();
        const limit = Math.max(1, Math.min(10, Number(options.limit || 10)));
        const offset = Math.max(0, Number(options.offset || 0));
        const search = this._escapeKey(options.search || '');
        const currentId = this.getCurrentSquadSync()?.id || null;

        const all = await this._getAllRemoteSquads();
        const filtered = all
            .filter((squad) => squad.id && squad.name && squad.tag)
            .filter((squad) => {
                if (!search) return true;
                return this._escapeKey(`${squad.name} ${squad.tag} ${squad.description || ''}`).includes(search);
            })
            .sort((a, b) => {
                if (a.id === currentId) return -1;
                if (b.id === currentId) return 1;
                return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
            });

        const total = filtered.length;
        const wrappedOffset = total ? offset % total : 0;
        const page = filtered.slice(wrappedOffset, wrappedOffset + limit);
        const items = total <= limit
            ? filtered
            : page.length < limit
            ? [...page, ...filtered.slice(0, limit - page.length)]
            : page;

        items.forEach((squad) => this._cacheSquad(squad, false));
        return {
            items,
            total,
            offset: wrappedOffset,
            nextOffset: total ? (wrappedOffset + limit) % total : 0,
        };
    },

    async createSquad(input = {}) {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) throw new Error('Usuario online nao encontrado.');

        const existing = await this._findRemoteByUser(uid);
        if (existing) throw new Error('Voce ja esta em um Clã.');

        const name = this._validateName(input.name);
        const tag = this._validateTag(input.tag);
        const description = this._validateDescription(input.description);
        const imageUrl = this._validateImageUrl(input.imageUrl);
        const visibility = this._validateVisibility(input.visibility);
        await this._assertUniqueNameTag(name, tag);

        const chips = Number(window.Economy?.getChips?.() || 0);
        if (chips < this.CREATE_COST) {
            throw new Error(`Chips insuficientes. Voce precisa de ${this.CREATE_COST} chips.`);
        }

        const spent = window.Economy?.spendChips?.(this.CREATE_COST);
        if (!spent) throw new Error('Nao foi possivel debitar os chips.');

        const now = Date.now();
        const id = window.Utils?.generateUUID?.() || window.Utils?.generateId?.() || `${now}`;
        const squad = this._normalizeSquad({
            id,
            name,
            tag,
            description,
            imageUrl,
            visibility,
            ownerId: uid,
            balance: this.CREATE_COST,
            score: 0,
            scoreHistory: [],
            inviteCode: await this._generateInviteCode(),
            members: [{ userId: uid, role: 'leader', joinedAt: now }],
            feed: [this._feedEntry(`Cla ${name} [${tag}] criado.`, 'system', now, {
                actorUserId: uid,
                actorLabel: this._formatActor(uid),
                action: 'criou o cla.',
            })],
            lastActivityAt: now,
            createdAt: now,
            updatedAt: now,
        });

        const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${id}`, squad, false);
        if (!saved) {
            window.Economy?.grantChips?.(this.CREATE_COST);
            throw new Error('Nao foi possivel salvar o Clã online. Seus chips foram devolvidos.');
        }

        this._cacheSquad(squad, true);
        await this._updateUserSquadProfile(squad).catch(() => {});
        this._emit('onSquadCreated', { squad });
        this._emit('onSquadUpdated', { squad });
        return squad;
    },

    async joinByCode(code) {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) throw new Error('Usuario online nao encontrado.');

        const existing = await this._findRemoteByUser(uid);
        if (existing) throw new Error('Voce ja esta em um Clã.');

        const safeCode = this._validateCode(code);
        let squad = await this._findRemoteByInviteCode(safeCode);
        if (!squad) throw new Error('Codigo de convite invalido.');
        const freshSquad = await window.NyanFirebase.getDoc(`${this.COLLECTION}/${squad.id}`).catch(() => null);
        if (freshSquad) squad = this._normalizeSquad(freshSquad);
        if (squad.members.length >= this.MAX_MEMBERS) throw new Error('Clã cheio.');
        if (squad.members.some((member) => member.userId === uid)) throw new Error('Voce ja esta nesse Clã.');

        if (squad.visibility === 'private') {
            await this.requestToJoin(squad.id);
            return { pending: true, squad };
        }

        const joinedAt = Date.now();
        const updated = this._withFeedEntry({
            ...squad,
            members: [
                ...squad.members,
                { userId: uid, role: 'member', joinedAt },
            ],
        }, `${this._formatActor(uid)} entrou no cla.`, 'event', joinedAt, {
            actorUserId: uid,
            actorLabel: this._formatActor(uid),
            action: 'entrou no cla.',
        });

        const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, updated, false);
        if (!saved) throw new Error('Nao foi possivel entrar no Clã online.');

        this._cacheSquad(updated, true);
        await this._updateUserSquadProfile(updated).catch(() => {});
        this._emit('onMemberJoin', { squad: updated, userId: uid });
        this._emit('onSquadUpdated', { squad: updated });
        return updated;
    },

    async leaveCurrentSquad() {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) throw new Error('Usuario online nao encontrado.');

        const squads = await this._findAllRemoteByUser(uid);
        if (!squads.length) {
            this._clearCurrentSquad();
            await this._updateUserSquadProfile(null).catch(() => {});
            return null;
        }

        const touched = [];
        for (const squad of squads) {
            const leavingMember = squad.members.find((member) => member.userId === uid);
            const remainingMembers = squad.members.filter((member) => member.userId !== uid);

            if (remainingMembers.length > 0 && leavingMember?.role === 'leader') {
                remainingMembers[0] = { ...remainingMembers[0], role: 'leader' };
            }

            if (remainingMembers.length === 0) {
                await window.NyanFirebase.fn.deleteDoc(
                    window.NyanFirebase.docRef(`${this.COLLECTION}/${squad.id}`)
                );
                this._clearCurrentSquad(squad.id);
                this._emit('onMemberLeave', { squad, userId: uid });
                this._emit('onSquadUpdated', { squad: null, removedSquadId: squad.id });
                touched.push(null);
                continue;
            }

            const leftAt = Date.now();
            const updated = this._withFeedEntry({
                ...squad,
                ownerId: leavingMember?.role === 'leader' ? remainingMembers[0].userId : squad.ownerId,
                members: remainingMembers,
            }, `${this._formatActor(uid)} saiu do cla.`, 'event', leftAt, {
                actorUserId: uid,
                actorLabel: this._formatActor(uid),
                action: 'saiu do cla.',
            });

            const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, updated, false);
            if (!saved) throw new Error('Nao foi possivel sair do Clã online.');

            this._cacheSquad(updated, false);
            this._clearCurrentSquad(updated.id);
            this._emit('onMemberLeave', { squad: updated, userId: uid });
            this._emit('onSquadUpdated', { squad: updated });
            touched.push(updated);
        }

        this._clearCurrentSquad();
        await this._updateUserSquadProfile(null).catch(() => {});
        return touched.find(Boolean) || null;
    },

    async requestToJoin(squadId) {
        this._requireOnline();
        const uid = this._uid();
        const safeSquadId = String(squadId || '').trim();
        if (!uid || !safeSquadId) throw new Error('Clã invalido.');

        const existing = await this._findRemoteByUser(uid);
        if (existing) throw new Error('Voce ja esta em um Clã.');

        const squad = await window.NyanFirebase.getDoc(`${this.COLLECTION}/${safeSquadId}`);
        if (!squad) throw new Error('Clã nao encontrado.');
        const normalized = this._normalizeSquad(squad);
        if (normalized.members.length >= this.MAX_MEMBERS) throw new Error('Clã cheio.');
        if (normalized.members.some((member) => member.userId === uid)) throw new Error('Voce ja esta nesse Clã.');

        if (normalized.visibility === 'public') {
            return await this.joinByCode(normalized.inviteCode);
        }

        const profile = window.NyanAuth?.currentUser || {};
        const payload = {
            userId: uid,
            squadId: normalized.id,
            username: profile.username || '',
            nyanTag: profile.nyanTag || window.NyanAuth?.getNyanTag?.() || '',
            avatar: profile.avatar || '',
            status: 'pending',
            requestedAt: Date.now(),
        };

        try {
            await window.NyanFirebase.fn.addDoc(
                window.NyanFirebase.fn.collection(window.NyanFirebase.db, `requests/${normalized.ownerId}/squadJoin`),
                payload
            );
        } catch (err) {
            throw new Error('Nao foi possivel enviar o pedido. Verifique as permissoes online.');
        }
        this._emit('onSquadUpdated', { squad: normalized, joinRequestFrom: uid });
        return { pending: true, squad: normalized };
    },

    async listJoinRequests() {
        this._requireOnline();
        const uid = this._uid();
        const squad = await this.hydrateCurrentUser();
        if (!squad || squad.ownerId !== uid) return [];

        const { collection, getDocs } = window.NyanFirebase.fn;
        const snap = await getDocs(collection(window.NyanFirebase.db, `requests/${uid}/squadJoin`));
        return snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((request) => request.squadId === squad.id)
            .filter((request) => request.status !== 'rejected')
            .sort((a, b) => Number(a.requestedAt || 0) - Number(b.requestedAt || 0));
    },

    async acceptJoinRequest(requestUserId) {
        this._requireOnline();
        const uid = this._uid();
        const safeUserId = String(requestUserId || '').trim();
        if (!uid || !safeUserId) throw new Error('Pedido invalido.');

        const squad = await this.hydrateCurrentUser();
        if (!squad) throw new Error('Voce precisa estar em um Clã.');
        if (squad.ownerId !== uid) throw new Error('Apenas o lider pode aceitar pedidos.');
        if (squad.members.length >= this.MAX_MEMBERS) throw new Error('Clã cheio.');
        if (squad.members.some((member) => member.userId === safeUserId)) {
            await this.rejectJoinRequest(safeUserId, { silent: true });
            return squad;
        }

        const request = (await this.listJoinRequests()).find((item) => item.userId === safeUserId);
        if (!request) throw new Error('Pedido nao encontrado.');

        const joinedAt = Date.now();
        const updated = this._withFeedEntry({
            ...squad,
            members: [
                ...squad.members,
                { userId: safeUserId, role: 'member', joinedAt },
            ],
        }, `${this._formatActor(safeUserId)} entrou no cla.`, 'event', joinedAt, {
            actorUserId: safeUserId,
            actorLabel: request.username || request.nyanTag || this._formatActor(safeUserId),
            action: 'entrou no cla.',
        });

        const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, updated, false);
        if (!saved) throw new Error('Nao foi possivel aceitar o pedido.');

        await window.NyanFirebase.fn.deleteDoc(
            window.NyanFirebase.docRef(`requests/${uid}/squadJoin/${request.id}`)
        ).catch(() => {});
        this._cacheSquad(updated, true);
        this._emit('onMemberJoin', { squad: updated, userId: safeUserId, acceptedBy: uid });
        this._emit('onSquadUpdated', { squad: updated });
        return updated;
    },

    async rejectJoinRequest(requestUserId, options = {}) {
        this._requireOnline();
        const uid = this._uid();
        const safeUserId = String(requestUserId || '').trim();
        if (!uid || !safeUserId) throw new Error('Pedido invalido.');

        const squad = await this.hydrateCurrentUser();
        if (!squad) throw new Error('Voce precisa estar em um Clã.');
        if (!options.silent && squad.ownerId !== uid) throw new Error('Apenas o lider pode recusar pedidos.');

        const requests = await this.listJoinRequests();
        const matches = requests.filter((request) => request.userId === safeUserId);
        await Promise.all(matches.map((request) =>
            window.NyanFirebase.fn.deleteDoc(window.NyanFirebase.docRef(`requests/${uid}/squadJoin/${request.id}`))
        ));
        this._emit('onSquadUpdated', { squad, rejectedRequestFrom: safeUserId });
        return true;
    },

    async updateSettings(input = {}) {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) throw new Error('Usuario online nao encontrado.');

        const squad = await this.hydrateCurrentUser();
        if (!squad) throw new Error('Voce precisa estar em um Clã.');
        if (squad.ownerId !== uid) throw new Error('Apenas o lider pode personalizar o Cla.');

        const updated = this._normalizeSquad({
            ...squad,
            description: this._validateDescription(input.description ?? squad.description),
            imageUrl: this._validateImageUrl(input.imageUrl ?? squad.imageUrl),
            visibility: this._validateVisibility(input.visibility ?? squad.visibility),
            updatedAt: Date.now(),
        });

        const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, updated, false);
        if (!saved) throw new Error('Nao foi possivel atualizar o Cla.');

        this._cacheSquad(updated, true);
        await this._updateUserSquadProfile(updated).catch(() => {});
        this._emit('onSquadUpdated', { squad: updated });
        return updated;
    },

    async updateDescription(description = '') {
        return await this.updateSettings({ description });
    },

    async kickMember(targetUid) {
        this._requireOnline();
        const uid = this._uid();
        const safeTargetUid = String(targetUid || '').trim();
        if (!uid || !safeTargetUid) throw new Error('Membro invalido.');
        if (uid === safeTargetUid) throw new Error('Use Sair do Clã para deixar o proprio Clã.');

        const squad = await this.hydrateCurrentUser();
        if (!squad) throw new Error('Voce precisa estar em um Clã.');
        if (squad.ownerId !== uid) throw new Error('Apenas o lider pode expulsar membros.');

        const target = squad.members.find((member) => member.userId === safeTargetUid);
        if (!target) throw new Error('Membro nao encontrado no Clã.');
        if (target.role === 'leader') throw new Error('Nao e possivel expulsar o lider.');

        const kickedAt = Date.now();
        const updated = this._withFeedEntry({
            ...squad,
            members: squad.members.filter((member) => member.userId !== safeTargetUid),
        }, `${this._formatActor(safeTargetUid)} saiu do cla.`, 'event', kickedAt, {
            actorUserId: safeTargetUid,
            actorLabel: this._formatActor(safeTargetUid),
            action: 'saiu do cla.',
        });

        const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, updated, false);
        if (!saved) throw new Error('Nao foi possivel expulsar o membro.');

        this._cacheSquad(updated, true);
        this._emit('onMemberLeave', { squad: updated, userId: safeTargetUid, kickedBy: uid });
        this._emit('onSquadUpdated', { squad: updated });
        return updated;
    },

    async deleteCurrentSquad() {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) throw new Error('Usuario online nao encontrado.');

        const squad = await this.hydrateCurrentUser();
        if (!squad) throw new Error('Voce precisa estar em um Clã.');
        if (squad.ownerId !== uid) throw new Error('Apenas o lider pode excluir o Clã.');

        await this._deleteJoinRequestsForSquad(squad.id).catch(() => {});
        await window.NyanFirebase.fn.deleteDoc(
            window.NyanFirebase.docRef(`${this.COLLECTION}/${squad.id}`)
        );

        this._clearCurrentSquad(squad.id);
        await this._updateUserSquadProfile(null).catch(() => {});
        this._emit('onSquadUpdated', { squad: null, removedSquadId: squad.id, deletedBy: uid });
        return true;
    },

    async _deleteJoinRequestsForSquad(squadId) {
        const { collection, getDocs, deleteDoc } = window.NyanFirebase.fn;
        const squad = await window.NyanFirebase.getDoc(`${this.COLLECTION}/${squadId}`).catch(() => null);
        if (!squad?.ownerId) return;
        const snap = await getDocs(collection(window.NyanFirebase.db, `requests/${squad.ownerId}/squadJoin`));
        await Promise.all(snap.docs.map((doc) => deleteDoc(doc.ref)));
    },

    async listChatMessages(options = {}) {
        const squad = await this.getCurrentSquad({ force: options.force === true });
        this._requireMember(squad);
        return this._normalizeMessages(squad.messages);
    },

    async listFeed(options = {}) {
        const squad = await this.getCurrentSquad({ force: options.force === true });
        this._requireMember(squad);
        return this._normalizeFeed(squad.feed);
    },

    _rankOf(squads = [], squadId = '') {
        const index = squads
            .filter((squad) => squad.id && squad.name && squad.tag)
            .sort((a, b) => {
                const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
                if (scoreDiff !== 0) return scoreDiff;
                return Number(a.createdAt || 0) - Number(b.createdAt || 0);
            })
            .findIndex((squad) => squad.id === squadId);
        return index >= 0 ? index + 1 : null;
    },

    _todayKey(date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    _weekKey(date = new Date()) {
        const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = copy.getDay() || 7;
        copy.setDate(copy.getDate() + 4 - day);
        const yearStart = new Date(copy.getFullYear(), 0, 1);
        const week = Math.ceil((((copy - yearStart) / 86400000) + 1) / 7);
        return `${copy.getFullYear()}-W${String(week).padStart(2, '0')}`;
    },

    _goalTemplates(now = Date.now()) {
        const date = new Date(now);
        const day = this._todayKey(date);
        const week = this._weekKey(date);
        return [
            { id: `daily-points-${day}`, description: 'Ganhar 120 pontos pelo Clã hoje', target: 120, reward: 80, type: 'daily', metric: 'points', periodKey: day, createdAt: now },
            { id: `daily-games-${day}`, description: 'Jogar 6 partidas em equipe hoje', target: 6, reward: 60, type: 'daily', metric: 'games', periodKey: day, createdAt: now },
            { id: `daily-quizzes-${day}`, description: 'Completar 3 quizzes diarios no Clã', target: 3, reward: 75, type: 'daily', metric: 'quizzes', periodKey: day, createdAt: now },
            { id: `weekly-points-${week}`, description: 'Ganhar 600 pontos pelo Clã nesta semana', target: 600, reward: 240, type: 'weekly', metric: 'points', periodKey: week, createdAt: now },
            { id: `weekly-ranking-${week}`, description: 'Atingir 1.000 pontos totais no ranking', target: 1000, reward: 300, type: 'weekly', metric: 'ranking', periodKey: week, createdAt: now },
        ];
    },

    _ensureGoals(squad, now = Date.now()) {
        const existing = this._normalizeGoals(squad?.goals || []);
        const activeKeys = new Set([this._todayKey(new Date(now)), this._weekKey(new Date(now))]);
        const kept = existing.filter((goal) => activeKeys.has(goal.periodKey) || goal.completed || goal.rewardClaimedAt);
        const byId = new Set(kept.map((goal) => goal.id));
        const fresh = this._goalTemplates(now)
            .filter((goal) => !byId.has(goal.id))
            .map((goal) => ({ ...goal, progress: 0, completed: false, rewardClaimedAt: 0 }));
        return this._normalizeGoals([...kept, ...fresh]);
    },

    _advanceGoals(squad, input = {}, points = 0, now = Date.now()) {
        const source = String(input.source || '');
        const freshGoals = this._ensureGoals(squad, now);
        const beforeCompleted = new Set(freshGoals.filter((goal) => goal.completed).map((goal) => goal.id));
        const day = this._todayKey(new Date(now));
        const week = this._weekKey(new Date(now));

        const metricDeltas = {
            points,
            games: source === 'game' || source === 'record' ? 1 : 0,
            quizzes: source === 'daily_quiz' ? 1 : 0,
            ranking: Math.max(0, Number(squad.score || 0) + points),
        };

        const goals = freshGoals.map((goal) => {
            if (goal.rewardClaimedAt) return goal;
            if (goal.type === 'daily' && goal.periodKey !== day) return goal;
            if (goal.type === 'weekly' && goal.periodKey !== week) return goal;
            const delta = goal.metric === 'ranking'
                ? Math.max(0, metricDeltas.ranking - Number(goal.progress || 0))
                : Math.max(0, metricDeltas[goal.metric] || 0);
            if (delta <= 0) return goal;
            const progress = Math.min(goal.target, Number(goal.progress || 0) + delta);
            return { ...goal, progress, completed: progress >= goal.target };
        });

        const completedNow = goals.filter((goal) => goal.completed && !beforeCompleted.has(goal.id));
        return { goals: this._normalizeGoals(goals), completedNow };
    },

    _activeChallengeForSquad(squad, allSquads = null) {
        const now = Date.now();
        const challenges = Array.isArray(allSquads)
            ? this._collectChallengesForSquad(squad?.id, [squad, ...allSquads])
            : this._normalizeChallenges(squad?.challenges || []);
        return challenges
            .find((challenge) => challenge.status === 'active' && challenge.endsAt > now) || null;
    },

    _replaceChallenge(squad, challenge) {
        const rest = this._normalizeChallenges(squad.challenges || []).filter((item) => item.id !== challenge.id);
        return this._normalizeSquad({ ...squad, challenges: [challenge, ...rest] });
    },

    _hasChallengeReward(squad, challengeId = '') {
        const safeId = String(challengeId || '').trim();
        if (!safeId) return false;
        return this._normalizeTransactions(squad?.transactions || [])
            .some((tx) => tx.type === 'reward' && tx.refId === safeId);
    },

    _hasChallengeFeed(squad, challengeId = '', content = '') {
        const safeId = String(challengeId || '').trim();
        const safeContent = String(content || '').trim();
        return this._normalizeFeed(squad?.feed || [])
            .some((item) => (safeId && item.refId === safeId) || (safeContent && item.content === safeContent));
    },

    _challengeNeedsSettlement(squad, challenge, now = Date.now()) {
        const current = this._normalizeSquad(squad);
        const finished = this._makeFinishedChallenge(challenge, now);
        if (!finished) return false;
        if (challenge.status !== 'finished' && Number(challenge.endsAt || 0) > now) return false;

        const local = this._normalizeChallenges(current.challenges || [])
            .find((item) => item.id === finished.id);
        const localFinished = local?.status === 'finished' && local.winnerId === finished.winnerId;
        if (!localFinished) return true;

        const isWinner = finished.winnerId && finished.winnerId === current.id;
        const reward = Math.max(0, Number(finished.reward || this.CHALLENGE_REWARD));
        return !!(isWinner && reward > 0 && !this._hasChallengeReward(current, finished.id));
    },

    async _settleVisibleChallenges(squad, challenges = [], allSquads = [], now = Date.now()) {
        if (!this._isReady() || !this._isSquadManager(squad)) return false;
        let current = this._normalizeSquad(squad);
        let settled = false;

        for (const challenge of this._normalizeChallenges(challenges)) {
            if (!this._challengeNeedsSettlement(current, challenge, now)) continue;
            const result = await this._finishChallenge(challenge, allSquads, now).catch(() => null);
            if (result) {
                settled = true;
                current = this.getCurrentSquadSync() || current;
            }
        }

        return settled;
    },

    async _addChallengePoints(squad, points, allSquads = [], now = Date.now()) {
        const active = this._activeChallengeForSquad(squad, allSquads);
        if (!active || points <= 0) return squad;

        const updatedChallenge = {
            ...active,
            scoreA: active.squadA === squad.id ? active.scoreA + points : active.scoreA,
            scoreB: active.squadB === squad.id ? active.scoreB + points : active.scoreB,
        };

        const opponentId = active.squadA === squad.id ? active.squadB : active.squadA;
        const opponent = allSquads.find((item) => item.id === opponentId)
            || await window.NyanFirebase.getDoc(`${this.COLLECTION}/${opponentId}`).catch(() => null);
        if (opponent?.id) {
            const normalizedOpponent = this._replaceChallenge(this._normalizeSquad(opponent), updatedChallenge);
            await window.NyanFirebase.setDoc(`${this.COLLECTION}/${normalizedOpponent.id}`, {
                challenges: normalizedOpponent.challenges,
                updatedAt: now,
            }, true, { silent: true }).catch(() => {});
        }

        return this._replaceChallenge(squad, updatedChallenge);
    },

    async _finishDueChallenges(squads = null) {
        const all = squads || await this._getAllRemoteSquads();
        const now = Date.now();
        const active = [];
        all.forEach((squad) => {
            this._normalizeChallenges(squad.challenges || [])
                .filter((challenge) => challenge.status === 'active' && challenge.endsAt <= now)
                .forEach((challenge) => {
                    if (!active.some((item) => item.id === challenge.id)) active.push(challenge);
                });
        });
        for (const challenge of active) {
            const squadA = all.find((squad) => squad.id === challenge.squadA);
            const squadB = all.find((squad) => squad.id === challenge.squadB);
            if (!this._isSquadManager(squadA) && !this._isSquadManager(squadB)) continue;
            await this._finishChallenge(challenge, all, now).catch(() => {});
        }
    },

    async _finishChallenge(challenge, squads = null, now = Date.now()) {
        const all = squads || await this._getAllRemoteSquads();
        const squadA = all.find((squad) => squad.id === challenge.squadA)
            || await window.NyanFirebase.getDoc(`${this.COLLECTION}/${challenge.squadA}`).catch(() => null);
        const squadB = all.find((squad) => squad.id === challenge.squadB)
            || await window.NyanFirebase.getDoc(`${this.COLLECTION}/${challenge.squadB}`).catch(() => null);
        if (!squadA?.id || !squadB?.id) return null;

        const finished = this._makeFinishedChallenge(challenge, now);
        if (!finished) return null;
        const winnerId = finished.winnerId;
        const reward = Math.max(0, Number(challenge.reward || this.CHALLENGE_REWARD));

        const build = (squad, opponent) => {
            const normalized = this._normalizeSquad(squad);
            const isWinner = winnerId && normalized.id === winnerId;
            const isDraw = !winnerId;
            const rewardAlreadyGranted = isWinner && this._hasChallengeReward(normalized, finished.id);
            const rewardDelta = isWinner && !rewardAlreadyGranted ? reward : 0;
            const tx = rewardDelta > 0 ? [{
                id: this._makeEntryId('tx'),
                type: 'reward',
                amount: rewardDelta,
                description: `Premio de desafio contra ${opponent.tag}`,
                refId: finished.id,
                createdAt: now,
            }] : [];
            const content = isDraw
                ? `Desafio contra [${opponent.tag}] terminou empatado.`
                : isWinner
                    ? `Vitoria contra [${opponent.tag}]! +${reward} chips no cofre.`
                    : `Derrota contra [${opponent.tag}] no desafio.`;
            const updated = this._normalizeSquad({
                ...this._replaceChallenge(normalized, finished),
                balance: Number(normalized.balance || 0) + rewardDelta,
                transactions: [...tx, ...(normalized.transactions || [])],
            });
            if (this._hasChallengeFeed(updated, finished.id, content)) return updated;
            return this._withFeedEntry(updated, content, 'event', now, { action: content, refId: finished.id });
        };

        const updatedA = build(squadA, squadB);
        const updatedB = build(squadB, squadA);
        const currentId = this.getCurrentSquadSync()?.id;
        let savedAny = false;
        if (this._isSquadManager(updatedA)) {
            savedAny = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updatedA.id}`, updatedA, false, { silent: true }) || savedAny;
            if (currentId === updatedA.id) this._cacheSquad(updatedA, true);
        }
        if (this._isSquadManager(updatedB)) {
            savedAny = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updatedB.id}`, updatedB, false, { silent: true }) || savedAny;
            if (currentId === updatedB.id) this._cacheSquad(updatedB, true);
        }
        if (savedAny) {
            this._emit('onChallengeEnded', { challenge: finished, winnerId, reward });
            this._emit('onSquadUpdated', { squad: this.getCurrentSquadSync() });
        }
        return finished;
    },

    async listSquadRanking(options = {}) {
        this._requireOnline();
        const limit = Math.max(1, Math.min(25, Number(options.limit || 10)));
        const all = await this._getAllRemoteSquads();
        const currentId = this.getCurrentSquadSync()?.id || null;

        return all
            .filter((squad) => squad.id && squad.name && squad.tag)
            .sort((a, b) => {
                const scoreDiff = Number(b.score || 0) - Number(a.score || 0);
                if (scoreDiff !== 0) return scoreDiff;
                return Number(a.createdAt || 0) - Number(b.createdAt || 0);
            })
            .slice(0, limit)
            .map((squad, index) => ({
                ...squad,
                rank: index + 1,
                isCurrent: squad.id === currentId,
            }));
    },

    async listGoals(options = {}) {
        const squad = await this.getCurrentSquad({ force: options.force === true });
        this._requireMember(squad);
        const goals = this._ensureGoals(squad);
        const changed = JSON.stringify(goals.map((goal) => `${goal.id}:${goal.progress}:${goal.completed}:${goal.rewardClaimedAt}`))
            !== JSON.stringify((squad.goals || []).map((goal) => `${goal.id}:${goal.progress}:${goal.completed}:${goal.rewardClaimedAt}`));
        if (changed) {
            const updated = this._normalizeSquad({ ...squad, goals, updatedAt: Date.now() });
            if (options.persist === true && this._isReady() && this._isSquadManager(updated)) {
                await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, {
                    goals: updated.goals,
                    updatedAt: updated.updatedAt,
                }, true, { silent: true }).catch(() => {});
            }
            this._cacheSquad(updated, true);
            return updated.goals;
        }
        return goals;
    },

    async claimGoalReward(goalId) {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) throw new Error('Usuario online nao encontrado.');

        const squad = await this.getCurrentSquad({ force: true });
        this._requireMember(squad);
        const safeGoalId = String(goalId || '').trim();
        const goals = this._ensureGoals(squad);
        const goal = goals.find((item) => item.id === safeGoalId);
        if (!goal) throw new Error('Meta nao encontrada.');
        if (!goal.completed) throw new Error('Essa meta ainda nao foi concluida.');
        if (goal.rewardClaimedAt) throw new Error('Recompensa ja resgatada.');

        const reward = Math.max(0, Number(goal.reward || 0));
        if (reward <= 0) throw new Error('Essa meta nao possui recompensa.');
        if (Number(squad.balance || 0) < reward) throw new Error('Cofre do Clã sem saldo suficiente para resgatar essa meta.');

        const distributionPlan = window.ClanEconomy?.calculateSplit?.(squad, reward);
        if (!distributionPlan?.ok) throw new Error(distributionPlan?.error || 'Nao foi possivel distribuir a recompensa.');

        const now = Date.now();
        const updatedGoal = { ...goal, rewardClaimedAt: now };
        const updatedGoals = goals.map((item) => item.id === goal.id ? updatedGoal : item);
        const tx = {
            id: this._makeEntryId('tx'),
            type: 'expense',
            amount: reward,
            description: `Recompensa distribuida: ${goal.description}`,
            refId: goal.id,
            createdAt: now,
        };
        const updated = this._withFeedEntry({
            ...squad,
            balance: Math.max(0, Number(squad.balance || 0) - reward),
            goals: updatedGoals,
            transactions: [tx, ...(squad.transactions || [])],
        }, `Meta concluida: ${goal.description}. ${reward} chips distribuidos.`, 'event', now, {
            actorUserId: uid,
            actorLabel: this._formatActor(uid),
            action: `resgatou a meta "${goal.description}".`,
        });

        const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, updated, false);
        if (!saved) throw new Error('Nao foi possivel salvar a distribuicao.');

        const distribution = window.ClanEconomy?.distributeReward?.(squad, reward, { goalId: goal.id, description: goal.description }) || distributionPlan;
        this._cacheSquad(updated, true);
        this._emit('onRewardDistributed', { squad: updated, goal: updatedGoal, amount: reward, distribution });
        this._emit('onSquadUpdated', { squad: updated });
        return { squad: updated, goal: updatedGoal, amount: reward, distribution };
    },

    async listChallenges(options = {}) {
        const squad = await this.getCurrentSquad({ force: options.force === true });
        this._requireMember(squad);
        if (options.persist === true || options.finishDue === true) {
            await this._finishDueChallenges().catch(() => {});
        }
        let fresh = await this.getCurrentSquad({ force: true });
        this._requireMember(fresh);
        let all = await this._getAllRemoteSquads().catch(() => [fresh]);
        if (!all.some((item) => item.id === fresh.id)) all.push(fresh);
        let challenges = this._collectChallengesForSquad(fresh.id, all);
        const settled = await this._settleVisibleChallenges(fresh, challenges, all).catch(() => false);
        if (settled) {
            fresh = this.getCurrentSquadSync() || fresh;
            all = all.map((item) => item.id === fresh.id ? fresh : item);
            if (!all.some((item) => item.id === fresh.id)) all.push(fresh);
            challenges = this._collectChallengesForSquad(fresh.id, all);
        }

        const localSignature = JSON.stringify(this._normalizeChallenges(fresh.challenges || []).map((item) => `${item.id}:${item.scoreA}:${item.scoreB}:${item.status}:${item.endsAt}`));
        const sharedSignature = JSON.stringify(challenges.map((item) => `${item.id}:${item.scoreA}:${item.scoreB}:${item.status}:${item.endsAt}`));
        if (challenges.length && localSignature !== sharedSignature) {
            const updated = this._normalizeSquad({ ...fresh, challenges, updatedAt: Date.now() });
            if (options.persist === true && this._isReady() && this._isSquadManager(updated)) {
                await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, {
                    challenges: updated.challenges,
                    updatedAt: updated.updatedAt,
                }, true, { silent: true }).catch(() => {});
            }
            this._cacheSquad(updated, true);
            return updated.challenges;
        }

        return challenges;
    },

    async startChallenge(targetSquadId) {
        this._requireOnline();
        const uid = this._uid();
        const safeTargetId = String(targetSquadId || '').trim();
        if (!uid || !safeTargetId) throw new Error('Clã alvo invalido.');

        const squad = await this.getCurrentSquad({ force: true });
        this._requireMember(squad);
        if (squad.id === safeTargetId) throw new Error('Nao e possivel desafiar o proprio Clã.');
        const all = await this._getAllRemoteSquads();
        await this._finishDueChallenges(all).catch(() => {});
        if (this._activeChallengeForSquad(squad, all)) throw new Error('Seu Clã ja possui um desafio ativo.');

        const target = await window.NyanFirebase.getDoc(`${this.COLLECTION}/${safeTargetId}`).catch(() => null)
            || all.find((item) => item.id === safeTargetId);
        if (!target?.id) throw new Error('Clã alvo nao encontrado.');
        const normalizedTarget = this._normalizeSquad(target);
        if (this._activeChallengeForSquad(normalizedTarget, all)) throw new Error('Esse Clã ja possui um desafio ativo.');

        const now = Date.now();
        const challenge = {
            id: this._makeEntryId('challenge'),
            squadA: squad.id,
            squadB: normalizedTarget.id,
            scoreA: 0,
            scoreB: 0,
            status: 'active',
            createdAt: now,
            endsAt: now + this.CHALLENGE_DURATION_MS,
            reward: this.CHALLENGE_REWARD,
        };

        const updatedA = this._withFeedEntry({
            ...squad,
            challenges: [challenge, ...(squad.challenges || [])],
        }, `Desafio iniciado contra [${normalizedTarget.tag}].`, 'event', now, {
            actorUserId: uid,
            actorLabel: this._formatActor(uid),
            action: `iniciou um desafio contra [${normalizedTarget.tag}].`,
        });
        const updatedB = this._withFeedEntry({
            ...normalizedTarget,
            challenges: [challenge, ...(normalizedTarget.challenges || [])],
        }, `[${squad.tag}] iniciou um desafio contra este Clã.`, 'event', now, {
            action: `recebeu um desafio de [${squad.tag}].`,
        });

        const savedA = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updatedA.id}`, updatedA, false);
        if (!savedA) throw new Error('Nao foi possivel iniciar o desafio no seu Clã.');
        await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updatedB.id}`, updatedB, false, { silent: true }).catch(() => false);
        this._cacheSquad(updatedA, true);
        this._emit('onChallengeStarted', { squad: updatedA, target: updatedB, challenge });
        this._emit('onSquadUpdated', { squad: updatedA });
        return { squad: updatedA, target: updatedB, challenge };
    },

    async awardPoints(input = {}) {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) return null;

        const source = ['game', 'record', 'daily_quiz', 'daily_mission'].includes(input.source) ? input.source : null;
        const points = Math.max(0, Math.min(200, Math.floor(Number(input.points || 0))));
        if (!source || points <= 0) return null;

        const squad = await this.getCurrentSquad({ force: true });
        if (!squad || !this._isMember(squad, uid)) return null;

        const key = String(input.key || `${source}:${uid}:${Date.now()}`).trim();
        const history = this._normalizeScoreHistory(squad.scoreHistory);
        if (key && history.some((item) => item.key === key)) return null;

        const allBefore = await this._getAllRemoteSquads().catch(() => []);
        const rankBefore = this._rankOf(allBefore, squad.id);
        const now = Date.now();
        const entry = {
            id: this._makeEntryId('score'),
            userId: uid,
            source,
            points,
            key,
            createdAt: now,
        };

        const actor = input.actorLabel || this._formatActor(uid);
        const feed = [...(squad.feed || [])];
        if (points >= 25) {
            feed.unshift(this._feedEntry(`${squad.tag} ganhou ${points} pontos.`, 'event', now, {
                actorUserId: uid,
                actorLabel: actor,
                action: `contribuiu com ${points} pontos.`,
            }));
        } else if (points >= 12) {
            feed.unshift(this._feedEntry(`${actor} contribuiu com ${points} pontos.`, 'event', now, {
                actorUserId: uid,
                actorLabel: actor,
                action: `contribuiu com ${points} pontos.`,
            }));
        }

        const goalResult = this._advanceGoals(squad, input, points, now);
        let workingSquad = this._normalizeSquad({
            ...squad,
            goals: goalResult.goals,
        });
        workingSquad = await this._addChallengePoints(workingSquad, points, allBefore, now).catch(() => workingSquad);

        goalResult.completedNow.forEach((goal) => {
            feed.unshift(this._feedEntry(`Meta concluida: ${goal.description}.`, 'event', now + 2, {
                actorUserId: uid,
                actorLabel: actor,
                action: `concluiu a meta "${goal.description}".`,
            }));
        });

        const updated = this._normalizeSquad({
            ...workingSquad,
            score: Number(squad.score || 0) + points,
            scoreHistory: [entry, ...history],
            feed: [...feed, ...(workingSquad.feed || []).filter((item) => !(squad.feed || []).some((old) => old.id === item.id))],
            lastActivityAt: now,
            updatedAt: now,
        });

        const saved = await window.NyanFirebase.setDoc(`${this.COLLECTION}/${updated.id}`, updated, false);
        if (!saved) throw new Error('Nao foi possivel registrar pontos do squad.');

        const allAfter = allBefore.map((item) => item.id === updated.id ? updated : item);
        if (!allAfter.some((item) => item.id === updated.id)) allAfter.push(updated);
        const rankAfter = this._rankOf(allAfter, updated.id);
        if (rankBefore && rankAfter && rankAfter < rankBefore) {
            const ranked = this._normalizeSquad({
                ...updated,
                feed: [
                    this._feedEntry(`${updated.tag} subiu para #${rankAfter} no ranking.`, 'event', now + 1, {
                        action: `subiu para #${rankAfter} no ranking.`,
                    }),
                    ...(updated.feed || []),
                ],
                updatedAt: now + 1,
            });
            await window.NyanFirebase.setDoc(`${this.COLLECTION}/${ranked.id}`, ranked, false).catch(() => {});
            this._cacheSquad(ranked, true);
            goalResult.completedNow.forEach((goal) => this._emit('onGoalCompleted', { squad: ranked, goal }));
            this._emit('onSquadUpdated', { squad: ranked });
            return { squad: ranked, entry, rankBefore, rankAfter };
        }

        this._cacheSquad(updated, true);
        goalResult.completedNow.forEach((goal) => this._emit('onGoalCompleted', { squad: updated, goal }));
        this._emit('onSquadUpdated', { squad: updated });
        return { squad: updated, entry, rankBefore, rankAfter };
    },

    subscribeCurrentSquad(handler) {
        if (typeof handler !== 'function') return () => {};
        const current = this.getCurrentSquadSync();
        if (!current?.id || !this._isReady()) return () => {};
        this._requireMember(current);

        const ref = window.NyanFirebase.docRef(`${this.COLLECTION}/${current.id}`);
        const unsub = window.NyanFirebase.fn.onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                this._clearCurrentSquad(current.id);
                handler(null);
                this._emit('onSquadUpdated', { squad: null, removedSquadId: current.id });
                return;
            }

            const squad = this._normalizeSquad({ id: snap.id, ...snap.data() });
            if (!this._isMember(squad)) {
                this._clearCurrentSquad(squad.id);
                handler(null);
                this._emit('onSquadUpdated', { squad: null, removedSquadId: squad.id });
                return;
            }

            this._cacheSquad(squad, true);
            this._updateUserSquadProfile(squad).catch(() => {});
            handler(squad);
        }, (err) => {
            console.warn('[Squads] Listener do squad falhou:', err?.code || err?.message || err);
        });

        window.NyanFirebase._listeners?.push?.(unsub);
        return unsub;
    },

    async sendMessage(content = '') {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) throw new Error('Usuario online nao encontrado.');

        const safeContent = String(content || '').trim().replace(/\s+/g, ' ');
        if (!safeContent) throw new Error('Digite uma mensagem.');
        if (safeContent.length > this.MAX_MESSAGE_LENGTH) {
            throw new Error(`Mensagem muito longa. Use ate ${this.MAX_MESSAGE_LENGTH} caracteres.`);
        }

        const squad = await this.getCurrentSquad({ force: true });
        this._requireMember(squad);

        const now = Date.now();
        const message = {
            id: this._makeEntryId('msg'),
            userId: uid,
            content: safeContent,
            createdAt: now,
        };
        const path = `${this.COLLECTION}/${squad.id}`;
        const saved = await window.NyanFirebase.updateDoc(path, {
            messages: window.NyanFirebase.fn.arrayUnion(message),
            lastActivityAt: now,
            updatedAt: now,
        });
        if (!saved) throw new Error('Nao foi possivel enviar a mensagem.');

        const fresh = await window.NyanFirebase.getDoc(path).catch(() => null);
        const updated = this._normalizeSquad({
            ...(fresh || squad),
            messages: fresh?.messages || [...(squad.messages || []), message],
            lastActivityAt: now,
            updatedAt: now,
        });

        if ((fresh?.messages || []).length > this.MAX_MESSAGES) {
            await window.NyanFirebase.setDoc(path, {
                messages: updated.messages,
                lastActivityAt: updated.lastActivityAt,
                updatedAt: updated.updatedAt,
            }, true).catch(() => {});
        }

        this._cacheSquad(updated, true);
        await this._updateUserSquadProfile(updated).catch(() => {});
        this._emit('onChatMessage', { squad: updated, message });
        this._emit('onSquadUpdated', { squad: updated });
        return message;
    },

    async listMembers(squadId = null) {
        const squad = squadId
            ? (this._load().squads?.[squadId] || await window.NyanFirebase.getDoc(`${this.COLLECTION}/${squadId}`))
            : await this.getCurrentSquad({ force: true });
        if (!squad) return [];

        const normalized = this._normalizeSquad(squad);
        const members = await Promise.all(normalized.members.map(async (member) => {
            let profile = null;
            if (this._isReady()) {
                profile = await window.NyanFirebase.getDoc(`users/${member.userId}`).catch(() => null);
            }
            return { ...member, profile };
        }));

        return members.sort((a, b) => {
            if (a.role === b.role) return a.joinedAt - b.joinedAt;
            return a.role === 'leader' ? -1 : 1;
        });
    },

    async _updateUserSquadProfile(squad) {
        const uid = this._uid();
        if (!uid || !this._isReady()) return false;

        const payload = squad
            ? {
                squadId: squad.id,
                squadName: squad.name,
                squadTag: squad.tag,
                squadLastActivity: Number(squad.lastActivityAt || squad.updatedAt || Date.now()),
                squad: { id: squad.id, name: squad.name, tag: squad.tag },
            }
            : {
                squadId: null,
                squadName: null,
                squadTag: null,
                squadLastActivity: null,
                squad: null,
            };

        const stableSignature = JSON.stringify({
            squadId: payload.squadId,
            squadName: payload.squadName,
            squadTag: payload.squadTag,
            squad: payload.squad,
        });
        const current = window.NyanAuth?.currentUser || {};
        const currentSignature = JSON.stringify({
            squadId: current.squadId || null,
            squadName: current.squadName || null,
            squadTag: current.squadTag || null,
            squad: current.squad || null,
        });
        const now = Date.now();
        if (stableSignature === currentSignature || (
            stableSignature === this._lastUserSquadProfileSignature
            && now - this._lastUserSquadProfileAt < 60000
        )) {
            if (window.NyanAuth?.currentUser) {
                window.NyanAuth.currentUser = { ...window.NyanAuth.currentUser, ...payload };
            }
            return true;
        }

        this._lastUserSquadProfileSignature = stableSignature;
        this._lastUserSquadProfileAt = now;
        const ok = await window.NyanFirebase.updateDoc(`users/${uid}`, payload, { silent: true });
        if (ok && window.NyanAuth?.currentUser) {
            window.NyanAuth.currentUser = { ...window.NyanAuth.currentUser, ...payload };
        }
        return ok;
    },
};

Squads.onSquadCreated = (handler) => Squads.on('onSquadCreated', handler);
Squads.onMemberJoin = (handler) => Squads.on('onMemberJoin', handler);
Squads.onMemberLeave = (handler) => Squads.on('onMemberLeave', handler);
Squads.onChatMessage = (handler) => Squads.on('onChatMessage', handler);
Squads.onSquadUpdated = (handler) => Squads.on('onSquadUpdated', handler);
Squads.onGoalCompleted = (handler) => Squads.on('onGoalCompleted', handler);
Squads.onRewardDistributed = (handler) => Squads.on('onRewardDistributed', handler);
Squads.onChallengeStarted = (handler) => Squads.on('onChallengeStarted', handler);
Squads.onChallengeEnded = (handler) => Squads.on('onChallengeEnded', handler);

window.Squads = Squads;
