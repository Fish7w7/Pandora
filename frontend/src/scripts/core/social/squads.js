const Squads = {
    KEY: 'nyan.squads',
    COLLECTION: 'squads',
    CREATE_COST: 500,
    MAX_MEMBERS: 10,
    INVITE_CODE_LENGTH: 6,

    _events: {},
    _state: null,
    _remoteHydratedAt: 0,
    _remoteBlocked: false,

    _defaults() {
        return {
            squads: {},
            currentSquadId: null,
            updatedAt: Date.now(),
        };
    },

    init() {
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
            inviteCode: await this._generateInviteCode(),
            members: [{ userId: uid, role: 'leader', joinedAt: now }],
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

        const updated = this._normalizeSquad({
            ...squad,
            members: [
                ...squad.members,
                { userId: uid, role: 'member', joinedAt: Date.now() },
            ],
            updatedAt: Date.now(),
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

            const updated = this._normalizeSquad({
                ...squad,
                ownerId: leavingMember?.role === 'leader' ? remainingMembers[0].userId : squad.ownerId,
                members: remainingMembers,
                updatedAt: Date.now(),
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

        const updated = this._normalizeSquad({
            ...squad,
            members: [
                ...squad.members,
                { userId: safeUserId, role: 'member', joinedAt: Date.now() },
            ],
            updatedAt: Date.now(),
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

        const updated = this._normalizeSquad({
            ...squad,
            members: squad.members.filter((member) => member.userId !== safeTargetUid),
            updatedAt: Date.now(),
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

    async inviteFriend(friendUid) {
        this._requireOnline();
        const uid = this._uid();
        const safeFriendUid = String(friendUid || '').trim();
        if (!uid || !safeFriendUid) throw new Error('Amigo invalido.');

        const squad = await this.getCurrentSquad({ force: true });
        if (!squad) throw new Error('Voce precisa estar em um Clã para convidar amigos.');
        if (squad.members.length >= this.MAX_MEMBERS) throw new Error('Clã cheio.');

        const remoteReady = await this._ensureRemoteSquad(squad);
        if (!remoteReady) {
            throw new Error('O clã ainda nao foi sincronizado online. Tente novamente em instantes.');
        }

        try {
            await window.NyanFirebase.fn.addDoc(
                window.NyanFirebase.fn.collection(window.NyanFirebase.db, `squadInvites/${safeFriendUid}/inbox`),
                {
                    from: uid,
                    fromTag: window.NyanAuth?.getNyanTag?.() || '',
                    squadId: squad.id,
                    squadName: squad.name,
                    squadTag: squad.tag,
                    inviteCode: squad.inviteCode,
                    sentAt: window.NyanFirebase.fn.serverTimestamp(),
                    status: 'pending',
                }
            );
        } catch (err) {
            if (!this._markRemoteBlocked(err)) throw err;
            throw new Error('Convites online ainda precisam de permissao.');
        }

        this._emit('onSquadUpdated', { squad, inviteTo: safeFriendUid });
        return true;
    },

    async getFriendProfiles() {
        this._requireOnline();
        const uid = this._uid();
        if (!uid) return [];

        const { query, collection, where, getDocs } = window.NyanFirebase.fn;
        const snap = await getDocs(query(
            collection(window.NyanFirebase.db, 'friendships'),
            where('users', 'array-contains', uid)
        ));

        const friendUIDs = snap.docs.map((doc) => {
            const users = doc.data().users || [];
            return users.find((userId) => userId !== uid);
        }).filter(Boolean);

        const profiles = await Promise.all(friendUIDs.map((friendUid) =>
            window.NyanFirebase.getDoc(`users/${friendUid}`).catch(() => null)
        ));

        return profiles.filter(Boolean);
    },

    async _updateUserSquadProfile(squad) {
        const uid = this._uid();
        if (!uid || !this._isReady()) return false;

        const payload = squad
            ? {
                squadId: squad.id,
                squadName: squad.name,
                squadTag: squad.tag,
                squad: { id: squad.id, name: squad.name, tag: squad.tag },
            }
            : {
                squadId: null,
                squadName: null,
                squadTag: null,
                squad: null,
            };

        const ok = await window.NyanFirebase.updateDoc(`users/${uid}`, payload);
        if (ok && window.NyanAuth?.currentUser) {
            window.NyanAuth.currentUser = { ...window.NyanAuth.currentUser, ...payload };
        }
        return ok;
    },
};

Squads.onSquadCreated = (handler) => Squads.on('onSquadCreated', handler);
Squads.onMemberJoin = (handler) => Squads.on('onMemberJoin', handler);
Squads.onMemberLeave = (handler) => Squads.on('onMemberLeave', handler);
Squads.onSquadUpdated = (handler) => Squads.on('onSquadUpdated', handler);

window.Squads = Squads;
