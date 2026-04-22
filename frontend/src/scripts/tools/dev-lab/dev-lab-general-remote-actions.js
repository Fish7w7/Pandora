(() => {
    if (!window.DevLab) return;
    Object.assign(window.DevLab, {
        _shortUid(uid = '') {
            const safe = String(uid || '');
            if (safe.length <= 14) return safe;
            return `${safe.slice(0, 7)}...${safe.slice(-5)}`;
        },
        _sessionUID() {
            return String(window.NyanFirebase?.auth?.currentUser?.uid || '').trim();
        },
        _isRemoteReady() {
            if (!window.NyanFirebase?.isReady?.()) return false;
            return !!String(window.NyanFirebase?.auth?.currentUser?.uid || '').trim();
        },
        _seasonScorePath(seasonId, uid = '') {
            const base = window.Seasons?._collectionPath?.(seasonId) || `leaderboards/season_${seasonId}/scores`;
            return uid ? `${base}/${uid}` : base;
        },
        _isSelfTarget(uid = '') {
            const me = this._sessionUID();
            return !!me && me === String(uid || '').trim();
        },
        async _tryReauthForTarget(targetUID = '') {
            const wanted = String(targetUID || '').trim();
            if (!wanted) return false;
            if (!window.NyanFirebase?.isReady?.()) return false;
            if (this._sessionUID() === wanted) return true;
            const savedUID = String(window.Utils?.loadData?.('nyan_online_uid') || '').trim();
            const savedEmail = String(window.Utils?.loadData?.('nyan_online_email') || '').trim();
            const savedPwd = String(window.Utils?.loadData?.('nyan_online_pwd') || '').trim();
            if (!savedUID || savedUID !== wanted || !savedEmail || !savedPwd) return false;
            if (!window.NyanFirebase?.fn?.signInWithEmailAndPassword || !window.NyanFirebase?.auth) return false;
            try {
                const cred = await window.NyanFirebase.fn.signInWithEmailAndPassword(
                    window.NyanFirebase.auth,
                    savedEmail,
                    savedPwd
                );
                const nextUID = String(cred?.user?.uid || '').trim();
                if (!nextUID || nextUID !== wanted) return false;
                await window.NyanAuth?._loadProfile?.(nextUID).catch(() => {});
                return this._sessionUID() === wanted;
            } catch (_) {
                return false;
            }
        },
        _applyLocalEconomyAbsolute(chips = 0, totalXP = 0) {
            if (!window.Economy?.load || !window.Economy?.save) return;
            const safeChips = Math.max(0, this._safeInt(chips, 0));
            const safeTotalXP = Math.max(0, this._safeInt(totalXP, 0));
            const state = window.Economy.load();
            const levelData = window.Economy?.calcLevel?.(safeTotalXP) || {
                level: Math.max(1, this._safeInt(state.level, 1, 1)),
                xp: this._safeInt(state.xp, 0),
                xpToNext: Math.max(1, this._safeInt(state.xpToNext, 100, 1)),
            };
            state.chips = safeChips;
            state.totalXP = safeTotalXP;
            state.level = Number(levelData.level || 1);
            state.xp = Number(levelData.xp || 0);
            state.xpToNext = Math.max(1, Number(levelData.xpToNext || 100));
            window.Economy.save(state);
            window.Economy._refreshUI?.();
        },
        _applyLocalSeasonAbsolute(seasonId = '', seasonXP = 0, seasonTier = 1) {
            if (!window.Seasons?.getCurrentSeason?.() || !window.Seasons?.save) return;
            const current = window.Seasons.getCurrentSeason();
            if (!current || String(current.id || '') !== String(seasonId || '')) return;
            current.seasonXP = Math.max(0, this._safeInt(seasonXP, 0));
            current.tier = Math.max(1, this._safeInt(seasonTier, 1, 1));
            window.Seasons.save(current);
            window.Seasons._refreshSidebarWidget?.();
            if (window.Router?.currentRoute === 'season') {
                window.Router.render();
            }
        },
        async _refreshRemoteTargetByUID(uid = '') {
            const safeUID = String(uid || '').trim();
            if (!safeUID || !this._isRemoteReady()) return;
            const profile = await window.NyanFirebase.getDoc(`users/${safeUID}`);
            if (!profile || !this._remoteTarget || this._remoteTarget.uid !== safeUID) return;
            this._remoteTarget.chips = this._safeInt(profile.chips, this._remoteTarget.chips || 0);
            this._remoteTarget.totalXP = this._safeInt(profile.totalXP, this._remoteTarget.totalXP || 0);
            this._remoteTarget.level = this._safeInt(profile.level, this._remoteTarget.level || 1, 1);
            this._remoteTarget.username = String(profile.username || this._remoteTarget.username || 'Jogador');
            this._remoteTarget.nyanTag = String(profile.nyanTag || this._remoteTarget.nyanTag || '');
            this._remoteTarget.avatar = profile.avatar || this._remoteTarget.avatar || null;
            const seasonId = this._remoteTarget.seasonId || window.Seasons?.getCurrentSeason?.()?.id || '';
            if (seasonId) {
                const seasonEntry = await window.NyanFirebase.getDoc(this._seasonScorePath(seasonId, safeUID));
                if (seasonEntry) {
                    this._remoteTarget.seasonXP = this._safeInt(seasonEntry.seasonXP, this._remoteTarget.seasonXP || 0);
                    this._remoteTarget.seasonTier = this._safeInt(seasonEntry.tier, this._remoteTarget.seasonTier || 1, 1);
                }
            }
        },
        _grantQueuePath(uid = '') {
            return `requests/${uid}/devlab-grants`;
        },
        _grantQueueDocPath(uid = '', docId = '') {
            return `${this._grantQueuePath(uid)}/${docId}`;
        },
        _isPermissionDenied(code = '', message = '') {
            const c = String(code || '').toLowerCase();
            const m = String(message || '').toLowerCase();
            return c.includes('permission-denied') || m.includes('permission') || m.includes('missing or insufficient permissions');
        },
        async _updateDocDetailed(path, data) {
            try {
                await window.NyanFirebase.fn.updateDoc(window.NyanFirebase.docRef(path), data);
                return { success: true };
            } catch (err) {
                return {
                    success: false,
                    code: String(err?.code || ''),
                    message: String(err?.message || 'Erro desconhecido ao atualizar documento.'),
                };
            }
        },
        async _setDocDetailed(path, data, merge = true) {
            try {
                await window.NyanFirebase.fn.setDoc(window.NyanFirebase.docRef(path), data, { merge: !!merge });
                return { success: true };
            } catch (err) {
                return {
                    success: false,
                    code: String(err?.code || ''),
                    message: String(err?.message || 'Erro desconhecido ao salvar documento.'),
                };
            }
        },
        async _deleteDocDetailed(path) {
            try {
                await window.NyanFirebase.fn.deleteDoc(window.NyanFirebase.docRef(path));
                return { success: true };
            } catch (err) {
                return {
                    success: false,
                    code: String(err?.code || ''),
                    message: String(err?.message || 'Erro desconhecido ao remover documento.'),
                };
            }
        },
        async _enqueueRemoteGrant(targetUID, payload = {}) {
            if (!targetUID) return { success: false, message: 'UID alvo ausente.' };
            if (!this._isRemoteReady()) return { success: false, message: 'Firebase offline.' };
            try {
                const myUID = this._sessionUID();
                const myTag = window.NyanAuth?.getNyanTag?.() || '';
                await window.NyanFirebase.fn.addDoc(
                    window.NyanFirebase.fn.collection(window.NyanFirebase.db, this._grantQueuePath(targetUID)),
                    {
                        type: 'economy_grant',
                        fromUID: myUID,
                        fromTag: myTag,
                        createdAtMs: Date.now(),
                        payload,
                    }
                );
                return { success: true };
            } catch (err) {
                return {
                    success: false,
                    code: String(err?.code || ''),
                    message: String(err?.message || 'Falha ao enfileirar grant remoto.'),
                };
            }
        },
        async _consumeRemoteGrant(uid, grantDoc) {
            const docId = String(grantDoc?.id || '');
            if (!uid || !docId) return;
            if (!this._remoteGrantBusy) this._remoteGrantBusy = new Set();
            if (this._remoteGrantBusy.has(docId)) return;
            this._remoteGrantBusy.add(docId);
            try {
                const data = grantDoc.data?.() || {};
                const payload = data.payload || {};
                const chipsDelta = this._safeInt(payload.chipsDelta, 0, -999999999, 999999999);
                const totalXPDelta = this._safeInt(payload.totalXPDelta, 0, -999999999, 999999999);
                const seasonXPDelta = this._safeInt(payload.seasonXPDelta, 0, -999999999, 999999999);
                const seasonId = String(payload.seasonId || '');
                const profile = await window.NyanFirebase.getDoc(`users/${uid}`);
                if (!profile) {
                    await this._deleteDocDetailed(this._grantQueueDocPath(uid, docId));
                    return;
                }
                if (chipsDelta !== 0 || totalXPDelta !== 0) {
                    const prevChips = this._safeInt(profile.chips, 0);
                    const prevTotalXP = this._safeInt(profile.totalXP, 0);
                    const chips = Math.max(0, prevChips + chipsDelta);
                    const totalXP = Math.max(0, prevTotalXP + totalXPDelta);
                    const levelData = window.Economy?.calcLevel?.(totalXP) || {
                        level: this._safeInt(profile.level, 1, 1),
                    };
                    const up = await this._updateDocDetailed(`users/${uid}`, {
                        chips,
                        totalXP,
                        level: Number(levelData.level || 1),
                        sc_updatedAt: window.NyanFirebase.fn.serverTimestamp(),
                        lastSeen: window.NyanFirebase.fn.serverTimestamp(),
                });
                if (!up.success) return;
                const localUID = this._sessionUID();
                if (localUID === uid && window.Economy?.load && window.Economy?.save) {
                    const local = window.Economy.load();
                    local.chips = chips;
                    local.totalXP = totalXP;
                    local.level = Number(levelData.level || local.level || 1);
                    if (window.Economy?.calcLevel) {
                        const calc = window.Economy.calcLevel(totalXP);
                        local.xp = calc.xp;
                        local.xpToNext = calc.xpToNext;
                    }
                    window.Economy.save(local);
                    window.Economy._refreshUI?.();
                }
            }
            if (seasonXPDelta !== 0 && seasonId) {
                const scorePath = this._seasonScorePath(seasonId, uid);
                const cur = await window.NyanFirebase.getDoc(scorePath);
                const prevSeasonXP = this._safeInt(cur?.seasonXP, 0);
                const nextSeasonXP = Math.max(0, prevSeasonXP + seasonXPDelta);
                const nextTier = window.Seasons?.getTierByXP?.(nextSeasonXP) || this._safeInt(cur?.tier, 1, 1);
                const seasonUp = await this._setDocDetailed(scorePath, {
                    uid,
                    seasonId,
                    seasonXP: nextSeasonXP,
                    tier: Number(nextTier || 1),
                    level: Number((window.Economy?.getLevel?.() || profile.level || 1)),
                    nyanTag: String(profile.nyanTag || ''),
                    username: String(profile.username || 'Jogador'),
                    avatar: profile.avatar || null,
                    updatedAt: window.NyanFirebase.fn.serverTimestamp(),
                }, true);
                if (!seasonUp.success) return;
            }
            await this._deleteDocDetailed(this._grantQueueDocPath(uid, docId));
        } finally {
            this._remoteGrantBusy.delete(docId);
        }
    },
    initRemoteGrantProcessor() {
        const uid = this._sessionUID();
        if (!uid || !window.NyanFirebase?.isReady?.()) return;
        if (this._remoteGrantProcessorUID === uid && this._remoteGrantUnsub) return;
        if (this._remoteGrantUnsub) {
            try { this._remoteGrantUnsub(); } catch (_) {}
            this._remoteGrantUnsub = null;
        }
        this._remoteGrantProcessorUID = uid;
        const col = window.NyanFirebase.fn.collection(window.NyanFirebase.db, this._grantQueuePath(uid));
        this._remoteGrantUnsub = window.NyanFirebase.fn.onSnapshot(col, (snap) => {
            (snap?.docs || []).forEach((docSnap) => {
                this._consumeRemoteGrant(uid, docSnap).catch(() => {});
            });
        }, () => {});
    },
    _economySnapshot() {
        const s = window.Economy?.getState?.() || { chips: 0, totalXP: 0, level: 1, xp: 0, xpToNext: 100 };
        return {
            chips: this._safeInt(s.chips, 0),
            totalXP: this._safeInt(s.totalXP, 0),
            level: this._safeInt(s.level, 1, 1),
            xp: this._safeInt(s.xp, 0),
            xpToNext: this._safeInt(s.xpToNext, 100, 1),
        };
    },
    _seasonSnapshot() {
        const season = window.Seasons?.getCurrentSeason?.();
        if (!season) return null;
        const progress = window.Seasons?.getProgress?.() || {};
        return {
            id: season.id,
            name: season.name,
            icon: season.icon || '\u{1F338}',
            seasonXP: this._safeInt(season.seasonXP, 0),
            tierLabel: progress.currentTier?.label || 'Bronze',
            claimed: season.claimed === true,
        };
    },
    async _ensureAccess() {
        if (!window.DevSecurity) return false;
        return window.DevSecurity.ensureUnlocked(true);
    },
    async _syncOnlineProfile() {
        if (!window.NyanAuth?._syncLocalProfile) return false;
        if (!window.NyanFirebase?.isReady?.() || !this._sessionUID()) return false;
        try {
            const r = await window.NyanAuth._syncLocalProfile();
            if (r && typeof r === 'object' && Object.prototype.hasOwnProperty.call(r, 'success')) {
                return !!r.success;
            }
            return r !== false;
        } catch (_) {
            return false;
        }
    },
    _rerender() {
        if (window.Router?.currentRoute !== 'dev-lab') return;
        if (this._rerenderScheduled) return;
        this._rerenderScheduled = true;
        const flush = () => {
            this._rerenderScheduled = false;
            if (window.Router?.currentRoute === 'dev-lab') {
                window.Router.render();
            }
        };
        if (typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(flush);
        } else {
            window.setTimeout(flush, 0);
        }
    },
    async unlock() {
        const ok = await window.DevSecurity?.ensureUnlocked?.(true);
        if (ok) this._rerender();
    },
    async lock() {
        await window.DevSecurity?.lock?.();
        this._rerender();
        Utils.showNotification?.('Sessao dev bloqueada.', 'info');
    },
    async applyEconomyFromForm() {
        if (!(await this._ensureAccess())) return;
        if (!window.Economy) return;
        const chipsInput = document.getElementById('devlab-chips');
        const totalXPInput = document.getElementById('devlab-totalxp');
        const chips = this._safeInt(chipsInput?.value, 0);
        const totalXP = this._safeInt(totalXPInput?.value, 0);
        const state = window.Economy.load();
        state.chips = chips;
        state.totalXP = totalXP;
        const levelData = window.Economy.calcLevel(totalXP);
        state.level = levelData.level;
        state.xp = levelData.xp;
        state.xpToNext = levelData.xpToNext;
        window.Economy.save(state);
        window.Economy._refreshUI?.();
        await this._syncOnlineProfile();
        this._rerender();
        Utils.showNotification?.(`Economia atualizada: ${chips} chips e ${totalXP} XP total.`, 'success');
    },
    async addChips(delta = 0) {
        if (!(await this._ensureAccess())) return;
        const gain = this._safeInt(delta, 0, -999999999, 999999999);
        if (!window.Economy || !Number.isFinite(gain) || gain === 0) return;
        const state = window.Economy.load();
        state.chips = Math.max(0, this._safeInt(state.chips, 0) + gain);
        window.Economy.save(state);
        window.Economy._refreshUI?.();
        await this._syncOnlineProfile();
        this._rerender();
        Utils.showNotification?.(`${gain >= 0 ? '+' : ''}${gain} chips aplicado.`, 'success');
    },
    async addTotalXP(delta = 0) {
        if (!(await this._ensureAccess())) return;
        const gain = this._safeInt(delta, 0, -999999999, 999999999);
        if (!window.Economy || !Number.isFinite(gain) || gain === 0) return;
        const state = window.Economy.load();
        state.totalXP = Math.max(0, this._safeInt(state.totalXP, 0) + gain);
        const levelData = window.Economy.calcLevel(state.totalXP);
        state.level = levelData.level;
        state.xp = levelData.xp;
        state.xpToNext = levelData.xpToNext;
        window.Economy.save(state);
        window.Economy._refreshUI?.();
        await this._syncOnlineProfile();
        this._rerender();
        Utils.showNotification?.(`${gain >= 0 ? '+' : ''}${gain} XP total aplicado.`, 'success');
    },
    async applySeasonFromForm() {
        if (!(await this._ensureAccess())) return;
        if (!window.Seasons) return;
        const season = window.Seasons.getCurrentSeason?.();
        if (!season) {
            Utils.showNotification?.('Sem temporada ativa para editar.', 'warning');
            return;
        }
        const xpInput = document.getElementById('devlab-seasonxp');
        const unclaim = document.getElementById('devlab-season-unclaim');
        const seasonXP = this._safeInt(xpInput?.value, 0);
        season.seasonXP = seasonXP;
        season.tier = window.Seasons.getTierByXP?.(seasonXP) || season.tier || 1;
        if (unclaim?.checked) season.claimed = false;
        window.Seasons.save?.(season);
        window.Seasons._refreshSidebarWidget?.();
        window.Seasons.syncRanking?.(true).catch(() => {});
        if (window.Router?.currentRoute === 'season') {
            window.Router.render();
        }
        this._rerender();
        Utils.showNotification?.(`Temporada atualizada: ${seasonXP} XP sazonal.`, 'success');
    },
    async addSeasonXP(delta = 0) {
        if (!(await this._ensureAccess())) return;
        if (!window.Seasons) return;
        const season = window.Seasons.getCurrentSeason?.();
        if (!season) {
            Utils.showNotification?.('Sem temporada ativa para editar.', 'warning');
            return;
        }
        const gain = this._safeInt(delta, 0, -999999999, 999999999);
        season.seasonXP = Math.max(0, this._safeInt(season.seasonXP, 0) + gain);
        season.tier = window.Seasons.getTierByXP?.(season.seasonXP) || season.tier || 1;
        window.Seasons.save?.(season);
        window.Seasons._refreshSidebarWidget?.();
        window.Seasons.syncRanking?.(true).catch(() => {});
        if (window.Router?.currentRoute === 'season') window.Router.render();
        this._rerender();
        Utils.showNotification?.(`${gain >= 0 ? '+' : ''}${gain} XP sazonal aplicado.`, 'success');
    },
    async addChipsFromForm() {
        const input = document.getElementById('devlab-chips-delta');
        const delta = this._safeInt(input?.value, 0, -999999999, 999999999);
        if (!delta) {
            Utils.showNotification?.('Informe um valor de chips para aplicar.', 'warning');
            return;
        }
        await this.addChips(delta);
    },
    async addTotalXPFromForm() {
        const input = document.getElementById('devlab-totalxp-delta');
        const delta = this._safeInt(input?.value, 0, -999999999, 999999999);
        if (!delta) {
            Utils.showNotification?.('Informe um valor de XP total para aplicar.', 'warning');
            return;
        }
        await this.addTotalXP(delta);
    },
    async addSeasonXPFromForm() {
        const input = document.getElementById('devlab-season-delta');
        const delta = this._safeInt(input?.value, 0, -999999999, 999999999);
        if (!delta) {
            Utils.showNotification?.('Informe um valor de XP sazonal para aplicar.', 'warning');
            return;
        }
        await this.addSeasonXP(delta);
    },
    async loadRemoteTargetFromForm() {
        if (!(await this._ensureAccess())) return;
        if (!this._isRemoteReady()) {
            Utils.showNotification?.('Conecte sua conta online para editar outros perfis.', 'warning');
            return;
        }
        const inputEl = document.getElementById('devlab-target');
        const raw = String(inputEl?.value || '').trim();
        if (!raw) {
            Utils.showNotification?.('Digite um UID ou NyanTag para carregar o alvo.', 'warning');
            return;
        }
        this._remoteQuery = raw;
        let uid = '';
        const isTag = raw.includes('#');
        if (isTag) {
            const tagDoc = await window.NyanFirebase.getDoc(`nyantags/${raw.toLowerCase()}`);
            uid = String(tagDoc?.uid || '').trim();
        }
        if (!uid && !isTag) {
            uid = raw;
        }
        if (!uid && !isTag) {
            const tagDoc = await window.NyanFirebase.getDoc(`nyantags/${raw.toLowerCase()}`);
            uid = String(tagDoc?.uid || '').trim();
        }
        if (!uid) {
            Utils.showNotification?.('Alvo nao encontrado. Use UID ou NyanTag completo (ex: nome#1234).', 'error');
            return;
        }
        const profile = await window.NyanFirebase.getDoc(`users/${uid}`);
        if (!profile) {
            Utils.showNotification?.('Perfil nao encontrado para este UID.', 'error');
            return;
        }
        const chips = this._safeInt(profile.chips, 0);
        const totalXP = this._safeInt(profile.totalXP, 0);
        const level = this._safeInt(profile.level, 1, 1);
        let seasonXP = 0;
        let seasonTier = 1;
        let seasonId = '';
        const currentSeason = window.Seasons?.getCurrentSeason?.();
        if (currentSeason?.id) {
            seasonId = currentSeason.id;
            const seasonEntry = await window.NyanFirebase.getDoc(this._seasonScorePath(seasonId, uid));
            seasonXP = this._safeInt(seasonEntry?.seasonXP, 0);
            seasonTier = this._safeInt(seasonEntry?.tier, 1, 1);
        }
        this._remoteTarget = {
            uid,
            username: String(profile.username || 'Jogador'),
            nyanTag: String(profile.nyanTag || ''),
            avatar: profile.avatar || null,
            chips,
            totalXP,
            level,
            seasonId,
            seasonXP,
            seasonTier,
        };
        Utils.showNotification?.(`Alvo carregado: ${this._remoteTarget.nyanTag || this._remoteTarget.username}`, 'success');
        this._rerender();
    },
    clearRemoteTarget() {
        this._remoteTarget = null;
        this._remoteQuery = '';
        this._rerender();
    },
    async _updateRemoteEconomy({ chipsDelta = 0, totalXPDelta = 0, _allowReauth = true } = {}) {
        if (!(await this._ensureAccess())) return { ok: false, mode: 'denied' };
        if (!this._isRemoteReady()) {
            Utils.showNotification?.('Sessao online ausente. Entre na sua conta Nyan para editar perfis remotos.', 'warning');
            return { ok: false, mode: 'offline' };
        }
        const target = this._remoteTarget;
        if (!target?.uid) {
            Utils.showNotification?.('Carregue um alvo antes de aplicar alteracoes remotas.', 'warning');
            return { ok: false, mode: 'no-target' };
        }
        const profile = await window.NyanFirebase.getDoc(`users/${target.uid}`);
        if (!profile) {
            Utils.showNotification?.('Nao foi possivel recarregar o perfil alvo.', 'error');
            return { ok: false, mode: 'no-profile' };
        }
        let chips = this._safeInt(profile.chips, 0);
        let totalXP = this._safeInt(profile.totalXP, 0);
        chips = Math.max(0, chips + this._safeInt(chipsDelta, 0, -999999999, 999999999));
        totalXP = Math.max(0, totalXP + this._safeInt(totalXPDelta, 0, -999999999, 999999999));
        const levelData = window.Economy?.calcLevel?.(totalXP) || {
            level: Math.max(1, this._safeInt(profile.level, 1, 1)),
            xp: 0,
            xpToNext: 100,
        };
        const up = await this._updateDocDetailed(`users/${target.uid}`, {
            chips,
            totalXP,
            level: Number(levelData.level || 1),
            sc_updatedAt: window.NyanFirebase.fn.serverTimestamp(),
            lastSeen: window.NyanFirebase.fn.serverTimestamp(),
        });
        if (!up.success) {
            if (this._isPermissionDenied(up.code, up.message)) {
                if (_allowReauth && !this._isSelfTarget(target.uid)) {
                    const relogged = await this._tryReauthForTarget(target.uid);
                    if (relogged) {
                        return this._updateRemoteEconomy({
                            chipsDelta,
                            totalXPDelta,
                            _allowReauth: false,
                        });
                    }
                }
                const seasonId = window.Seasons?.getCurrentSeason?.()?.id || '';
                const queued = await this._enqueueRemoteGrant(target.uid, {
                    chipsDelta: this._safeInt(chipsDelta, 0, -999999999, 999999999),
                    totalXPDelta: this._safeInt(totalXPDelta, 0, -999999999, 999999999),
                    seasonXPDelta: 0,
                    seasonId,
                });
                if (this._isSelfTarget(target.uid)) {
                    this._applyLocalEconomyAbsolute(chips, totalXP);
                    const synced = await this._syncOnlineProfile();
                    await this._refreshRemoteTargetByUID(target.uid);
                    this._rerender();
                    if (synced) {
                        return { ok: true, mode: 'self-sync' };
                    }
                    if (queued.success) {
                        const sid = this._sessionUID();
                        return { ok: true, mode: 'queued', sessionUID: sid, targetUID: target.uid, selfQueued: true };
                    }
                    Utils.showNotification?.('Nao foi possivel sincronizar sua propria conta no Firebase agora.', 'error');
                    return { ok: false, mode: 'self-sync-failed', error: 'self-sync-failed' };
                }
                if (queued.success) {
                    await this._refreshRemoteTargetByUID(target.uid);
                    this._rerender();
                    const sid = this._sessionUID();
                    return { ok: true, mode: 'queued', sessionUID: sid, targetUID: target.uid, mismatch: !!sid && sid !== String(target.uid || '').trim() };
                }
                Utils.showNotification?.(`Falha ao enfileirar grant remoto: ${queued.message || 'erro'}`, 'error');
                return { ok: false, mode: 'queue-failed', error: queued.message || queued.code || '' };
            }
            Utils.showNotification?.(`Falha ao atualizar economia do alvo: ${up.message || up.code || 'erro desconhecido'}`, 'error');
            return { ok: false, mode: 'direct-failed', error: up.message || up.code || '' };
        }
        if (this._isSelfTarget(target.uid)) {
            this._applyLocalEconomyAbsolute(chips, totalXP);
            const synced = await this._syncOnlineProfile();
            if (!synced) {
                Utils.showNotification?.('Alteracao local aplicada, mas o sync online da sua conta falhou.', 'warning');
            }
        }
        await this._refreshRemoteTargetByUID(target.uid);
        this._rerender();
        return { ok: true, mode: 'direct' };
    },
    async addRemoteChipsFromForm() {
        const input = document.getElementById('devlab-remote-chips-delta');
        const delta = this._safeInt(input?.value, 0, -999999999, 999999999);
        if (!delta) {
            Utils.showNotification?.('Informe o delta de chips para o alvo.', 'warning');
            return;
        }
        const result = await this._updateRemoteEconomy({ chipsDelta: delta, totalXPDelta: 0 });
        if (!result?.ok) return;
        if (result.mode === 'direct' || result.mode === 'self-sync') {
            Utils.showNotification?.(`Chips remotos aplicados: ${delta >= 0 ? '+' : ''}${delta}.`, 'success');
            return;
        }
        if (result.mode === 'queued') {
            if (result.selfQueued) {
                Utils.showNotification?.(
                    `Edicao enfileirada na sua conta (${this._shortUid(result.targetUID)}). O Firebase nao aceitou aplicacao direta nesta sessao.`,
                    'warning'
                );
                return;
            }
            if (result.mismatch) {
                Utils.showNotification?.(
                    `Edicao remota enfileirada. Sessao ${this._shortUid(result.sessionUID)} difere do alvo ${this._shortUid(result.targetUID)}.`,
                    'warning'
                );
                return;
            }
            Utils.showNotification?.('Edicao remota enfileirada. O alvo aplica ao ficar online.', 'info');
        }
    },
    async addRemoteTotalXPFromForm() {
        const input = document.getElementById('devlab-remote-totalxp-delta');
        const delta = this._safeInt(input?.value, 0, -999999999, 999999999);
        if (!delta) {
            Utils.showNotification?.('Informe o delta de XP total para o alvo.', 'warning');
            return;
        }
        const result = await this._updateRemoteEconomy({ chipsDelta: 0, totalXPDelta: delta });
        if (!result?.ok) return;
        if (result.mode === 'direct' || result.mode === 'self-sync') {
            Utils.showNotification?.(`XP total remoto aplicado: ${delta >= 0 ? '+' : ''}${delta}.`, 'success');
            return;
        }
        if (result.mode === 'queued') {
            if (result.selfQueued) {
                Utils.showNotification?.(
                    `Edicao enfileirada na sua conta (${this._shortUid(result.targetUID)}). O Firebase nao aceitou aplicacao direta nesta sessao.`,
                    'warning'
                );
                return;
            }
            if (result.mismatch) {
                Utils.showNotification?.(
                    `Edicao remota enfileirada. Sessao ${this._shortUid(result.sessionUID)} difere do alvo ${this._shortUid(result.targetUID)}.`,
                    'warning'
                );
                return;
            }
            Utils.showNotification?.('Edicao remota enfileirada. O alvo aplica ao ficar online.', 'info');
        }
    },
    async addRemoteSeasonXPFromForm() {
        if (!(await this._ensureAccess())) return;
        if (!this._isRemoteReady()) {
            Utils.showNotification?.('Sessao online ausente. Entre na sua conta Nyan para editar perfis remotos.', 'warning');
            return;
        }
        if (!this._remoteTarget?.uid) {
            Utils.showNotification?.('Carregue um alvo antes de aplicar XP sazonal remoto.', 'warning');
            return;
        }
        const input = document.getElementById('devlab-remote-season-delta');
        const delta = this._safeInt(input?.value, 0, -999999999, 999999999);
        if (!delta) {
            Utils.showNotification?.('Informe o delta de XP sazonal para o alvo.', 'warning');
            return;
        }
        const season = window.Seasons?.getCurrentSeason?.();
        if (!season?.id) {
            Utils.showNotification?.('Nenhuma temporada ativa para editar.', 'warning');
            return;
        }
        const scorePath = this._seasonScorePath(season.id, this._remoteTarget.uid);
        const scoreDoc = await window.NyanFirebase.getDoc(scorePath);
        const prevXP = this._safeInt(scoreDoc?.seasonXP, 0);
        const nextXP = Math.max(0, prevXP + delta);
        const nextTier = window.Seasons?.getTierByXP?.(nextXP) || this._safeInt(scoreDoc?.tier, 1, 1);
        const seasonUp = await this._setDocDetailed(scorePath, {
            uid: this._remoteTarget.uid,
            seasonId: season.id,
            seasonXP: nextXP,
            tier: Number(nextTier || 1),
            level: Number(this._remoteTarget.level || 1),
            nyanTag: this._remoteTarget.nyanTag || '',
            username: this._remoteTarget.username || 'Jogador',
            avatar: this._remoteTarget.avatar || null,
            updatedAt: window.NyanFirebase.fn.serverTimestamp(),
        }, true);
        if (!seasonUp.success) {
            if (this._isPermissionDenied(seasonUp.code, seasonUp.message)) {
                if (!this._isSelfTarget(this._remoteTarget.uid)) {
                    const relogged = await this._tryReauthForTarget(this._remoteTarget.uid);
                    if (relogged) {
                        return this.addRemoteSeasonXPFromForm();
                    }
                }
                const queued = await this._enqueueRemoteGrant(this._remoteTarget.uid, {
                    chipsDelta: 0,
                    totalXPDelta: 0,
                    seasonXPDelta: delta,
                    seasonId: season.id,
                });
                if (this._isSelfTarget(this._remoteTarget.uid)) {
                    this._applyLocalSeasonAbsolute(season.id, nextXP, Number(nextTier || 1));
                    const synced = await window.Seasons?.syncRanking?.(true).catch(() => false);
                    await this._refreshRemoteTargetByUID(this._remoteTarget.uid);
                    this._rerender();
                    if (synced) {
                        Utils.showNotification?.(`XP sazonal remoto aplicado: ${delta >= 0 ? '+' : ''}${delta}.`, 'success');
                        return;
                    }
                    if (queued.success) {
                        Utils.showNotification?.('XP sazonal remoto enfileirado. O alvo aplica ao ficar online.', 'info');
                        return;
                    }
                    Utils.showNotification?.('Nao foi possivel sincronizar XP sazonal no Firebase agora.', 'error');
                    return;
                }
                if (queued.success) {
                    await this._refreshRemoteTargetByUID(this._remoteTarget.uid);
                    this._rerender();
                    const sid = this._sessionUID();
                    if (sid && sid !== String(this._remoteTarget.uid || '').trim()) {
                        Utils.showNotification?.(
                            `XP sazonal enfileirado. Sessao ${this._shortUid(sid)} difere do alvo ${this._shortUid(this._remoteTarget.uid)}.`,
                            'warning'
                        );
                    } else {
                        Utils.showNotification?.('XP sazonal remoto enfileirado. O alvo aplica ao ficar online.', 'info');
                    }
                    return;
                }
                Utils.showNotification?.(`Falha ao enfileirar XP sazonal remoto: ${queued.message || 'erro'}`, 'error');
                return;
            }
            Utils.showNotification?.(`Falha ao atualizar XP sazonal do alvo: ${seasonUp.message || seasonUp.code || 'erro desconhecido'}`, 'error');
            return;
        }
        if (this._isSelfTarget(this._remoteTarget.uid)) {
            this._applyLocalSeasonAbsolute(season.id, nextXP, Number(nextTier || 1));
        }
        await this._refreshRemoteTargetByUID(this._remoteTarget.uid);
        this._rerender();
        Utils.showNotification?.(`XP sazonal remoto aplicado: ${delta >= 0 ? '+' : ''}${delta}.`, 'success');
    },
    async resetEconomy() {
        if (!(await this._ensureAccess())) return;
        const ok = window.confirm('Resetar economia local para estado inicial?');
        if (!ok) return;
        localStorage.removeItem(window.Economy?.KEY || 'nyan_economy');
        window.Economy?.init?.();
        window.Economy?._refreshUI?.();
        await this._syncOnlineProfile();
        this._rerender();
        Utils.showNotification?.('Economia resetada.', 'success');
    },
    });
})();
